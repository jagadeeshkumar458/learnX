/* A small in-memory SQL engine with PostgreSQL flavour, built for the Databases lessons.
   Supports: CREATE TABLE (types, PRIMARY KEY, SERIAL / IDENTITY, NOT NULL, UNIQUE, DEFAULT, CHECK,
   REFERENCES … ON DELETE CASCADE / SET NULL, table-level constraints), ALTER TABLE (ADD / DROP /
   RENAME COLUMN, RENAME TO), DROP TABLE [IF EXISTS], INSERT … VALUES / SELECT [RETURNING],
   UPDATE … SET … WHERE [RETURNING], DELETE … WHERE [RETURNING], and SELECT with DISTINCT, joins
   (INNER / LEFT / RIGHT / FULL / CROSS), WHERE, GROUP BY, HAVING, ORDER BY, LIMIT / OFFSET,
   aggregates, CASE, CAST / ::, IN (list | subquery), BETWEEN, LIKE / ILIKE, IS [NOT] NULL,
   scalar subqueries, and common functions. Errors read like Postgres's. */

export function sqlEngine() {
class SqlError extends Error {
  constructor(msg, hint) { super(msg); this.name = "SqlError"; this.hint = hint || ""; }
}
const err = (m, hint) => { throw new SqlError(m, hint); };

/* ───────────── tokenizer ───────────── */
const KEYWORDS = new Set(("select from where and or not in is null like ilike between as distinct order by asc desc limit offset group having " +
  "insert into values update set delete create table drop alter add column rename to primary key references unique default check " +
  "join inner left right full outer cross on true false case when then else end cast exists if returning constraint foreign cascade " +
  "serial generated always identity nulls first last union all autoincrement").split(" "));

function tokenize(sql) {
  const out = [];
  let i = 0;
  const n = sql.length;
  while (i < n) {
    const c = sql[i];
    if (/\s/.test(c)) { i++; continue; }
    if (c === "-" && sql[i + 1] === "-") { while (i < n && sql[i] !== "\n") i++; continue; }
    if (c === "/" && sql[i + 1] === "*") { const j = sql.indexOf("*/", i + 2); i = j < 0 ? n : j + 2; continue; }
    const start = i;
    if (c === "'") {
      let s = ""; i++;
      for (;;) {
        if (i >= n) err("unterminated quoted string at or near \"" + sql.slice(start, start + 20) + "\"");
        if (sql[i] === "'") { if (sql[i + 1] === "'") { s += "'"; i += 2; continue; } i++; break; }
        s += sql[i++];
      }
      out.push({ t: "str", v: s, pos: start }); continue;
    }
    if (c === '"') {
      const j = sql.indexOf('"', i + 1);
      if (j < 0) err("unterminated quoted identifier");
      out.push({ t: "id", v: sql.slice(i + 1, j), quoted: true, pos: start }); i = j + 1; continue;
    }
    if (/[0-9]/.test(c) || (c === "." && /[0-9]/.test(sql[i + 1] || ""))) {
      const m = sql.slice(i).match(/^(\d+\.?\d*|\.\d+)(e[+-]?\d+)?/i);
      out.push({ t: "num", v: Number(m[0]), raw: m[0], pos: start }); i += m[0].length; continue;
    }
    if (/[A-Za-z_]/.test(c)) {
      const m = sql.slice(i).match(/^[A-Za-z_][A-Za-z0-9_$]*/);
      const w = m[0].toLowerCase();
      out.push(KEYWORDS.has(w) ? { t: "kw", v: w, pos: start } : { t: "id", v: w, raw: m[0], pos: start });
      i += m[0].length; continue;
    }
    const two = sql.slice(i, i + 2);
    if (["<=", ">=", "<>", "!=", "::", "||"].includes(two)) { out.push({ t: "op", v: two, pos: start }); i += 2; continue; }
    if ("=<>+-*/%(),.;".includes(c)) { out.push({ t: "op", v: c, pos: start }); i++; continue; }
    err("syntax error at or near \"" + c + "\"");
  }
  out.push({ t: "eof", v: "", pos: n });
  return out;
}

/* ───────────── parser ───────────── */
class Parser {
  constructor(sql, keepAliasCase) { this.sql = sql; this.toks = tokenize(sql); this.i = 0; this.keepCase = keepAliasCase; }
  alias() { const t = this.peek(); if (this.keepCase && t.t === "id" && t.raw) { this.i++; return t.raw; } return this.ident("a column alias"); }
  peek(o = 0) { return this.toks[this.i + o]; }
  next() { return this.toks[this.i++]; }
  is(v, o = 0) { const t = this.peek(o); return (t.t === "kw" || t.t === "op") && t.v === v; }
  isWord(v, o = 0) { const t = this.peek(o); return (t.t === "kw" || t.t === "id") && t.v === v; }
  accept(v) { if (this.is(v)) { this.i++; return true; } return false; }
  acceptWord(v) { if (this.isWord(v)) { this.i++; return true; } return false; }
  near() { const t = this.peek(); return t.t === "eof" ? "syntax error at end of input" : "syntax error at or near \"" + (t.t === "str" ? "'" + t.v + "'" : t.raw || t.v) + "\""; }
  expect(v) { if (!this.accept(v)) err(this.near(), v === ")" ? "Check that every ( has a matching )." : v === "," ? "Separate items with commas." : ""); }
  ident(what) {
    const t = this.peek();
    if (t.t === "id") { this.i++; return t.v; }
    if (t.t === "kw" && !["select", "from", "where", "and", "or", "on", "join", "set", "values", "order", "group", "limit"].includes(t.v)) { this.i++; return t.v; }
    err(this.near(), what ? "Expected " + what + "." : "");
  }

  statements() {
    const out = [];
    while (this.peek().t !== "eof") {
      if (this.accept(";")) continue;
      const startTok = this.peek();
      const st = this.statement();
      const endTok = this.peek();
      st.text = this.sql.slice(startTok.pos, endTok.pos).trim();
      out.push(st);
      if (!this.accept(";") && this.peek().t !== "eof") err(this.near(), "Did you forget a semicolon between statements?");
    }
    return out;
  }
  statement() {
    const t = this.peek();
    if (this.is("select") || this.is("(")) return this.selectStmt();
    if (this.accept("insert")) return this.insert();
    if (this.accept("update")) return this.update();
    if (this.accept("delete")) return this.del();
    if (this.accept("create")) return this.create();
    if (this.accept("drop")) return this.drop();
    if (this.accept("alter")) return this.alter();
    err(t.t === "eof" ? "syntax error at end of input" : "syntax error at or near \"" + (t.raw || t.v) + "\"", "Statements start with SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER or DROP.");
  }

  selectStmt() {
    let s = this.selectCore();
    while (this.is("union")) {
      this.next();
      const all = this.accept("all");
      s = { type: "union", left: s, right: this.selectCore(), all };
    }
    if (this.accept("order")) { this.expect("by"); s.orderBy = this.orderList(); }
    if (this.accept("limit")) s.limit = this.expr();
    if (this.accept("offset")) s.offset = this.expr();
    return s;
  }
  selectCore() {
    if (this.accept("(")) { const s = this.selectStmt(); this.expect(")"); return s; }
    this.expect("select");
    const s = { type: "select", distinct: false, cols: [], from: null, joins: [] };
    if (this.accept("distinct")) s.distinct = true;
    else this.accept("all");
    do {
      if (this.accept("*")) { s.cols.push({ star: true }); continue; }
      if (this.peek().t === "id" && this.is(".", 1) && this.is("*", 2)) { const tb = this.next().v; this.next(); this.next(); s.cols.push({ star: true, table: tb }); continue; }
      const e = this.expr();
      let alias = null;
      if (this.accept("as")) alias = this.alias();
      else if (this.peek().t === "id") alias = this.alias();
      s.cols.push({ e, alias });
    } while (this.accept(","));
    if (this.accept("from")) {
      s.from = this.tableRef();
      for (;;) {
        if (this.accept(",")) { s.joins.push({ kind: "cross", ref: this.tableRef() }); continue; }
        let kind = null;
        if (this.accept("join")) kind = "inner";
        else if (this.is("inner") && this.is("join", 1)) { this.i += 2; kind = "inner"; }
        else if (this.is("cross") && this.is("join", 1)) { this.i += 2; kind = "cross"; }
        else if (["left", "right", "full"].some((k) => this.is(k))) { kind = this.next().v; this.accept("outer"); this.expect("join"); }
        if (!kind) break;
        const ref = this.tableRef();
        let on = null;
        if (kind !== "cross") {
          if (!this.accept("on")) err(this.near(), "A " + kind.toUpperCase() + " JOIN needs an ON condition, e.g. ON orders.customer_id = customers.id");
          on = this.expr();
        }
        s.joins.push({ kind, ref, on });
      }
    }
    if (this.accept("where")) s.where = this.expr();
    if (this.accept("group")) { this.expect("by"); s.groupBy = []; do s.groupBy.push(this.expr()); while (this.accept(",")); }
    if (this.accept("having")) s.having = this.expr();
    return s;
  }
  tableRef() {
    if (this.is("(")) {
      this.next(); const sub = this.selectStmt(); this.expect(")");
      this.accept("as");
      const alias = this.ident("an alias for the subquery");
      return { sub, alias };
    }
    const name = this.ident("a table name");
    let alias = name;
    if (this.accept("as")) alias = this.ident("a table alias");
    else if (this.peek().t === "id") alias = this.next().v;
    return { name, alias };
  }
  orderList() {
    const out = [];
    do {
      const e = this.expr();
      let desc = false;
      if (this.accept("desc")) desc = true; else this.accept("asc");
      let nulls = null;
      if (this.accept("nulls")) nulls = this.accept("first") ? "first" : (this.expect("last"), "last");
      out.push({ e, desc, nulls });
    } while (this.accept(","));
    return out;
  }

  insert() {
    this.expect("into");
    const table = this.ident("a table name");
    let cols = null;
    if (this.accept("(")) { cols = []; do cols.push(this.ident("a column name")); while (this.accept(",")); this.expect(")"); }
    let rows = null, select = null;
    if (this.accept("values")) {
      rows = [];
      do {
        this.expect("(");
        const r = [];
        do r.push(this.is("default") ? (this.next(), { k: "default" }) : this.expr()); while (this.accept(","));
        this.expect(")");
        rows.push(r);
      } while (this.accept(","));
    } else if (this.is("select")) select = this.selectStmt();
    else err(this.near(), "INSERT needs VALUES (...) or a SELECT.");
    return { type: "insert", table, cols, rows, select, returning: this.returning() };
  }
  returning() {
    if (!this.accept("returning")) return null;
    const cols = [];
    do {
      if (this.accept("*")) { cols.push({ star: true }); continue; }
      const e = this.expr();
      let alias = null;
      if (this.accept("as")) alias = this.ident(); else if (this.peek().t === "id") alias = this.next().v;
      cols.push({ e, alias });
    } while (this.accept(","));
    return cols;
  }
  update() {
    const table = this.ident("a table name");
    this.expect("set");
    const sets = [];
    do {
      const col = this.ident("a column name");
      this.expect("=");
      sets.push({ col, e: this.is("default") ? (this.next(), { k: "default" }) : this.expr() });
    } while (this.accept(","));
    const where = this.accept("where") ? this.expr() : null;
    return { type: "update", table, sets, where, returning: this.returning() };
  }
  del() {
    this.expect("from");
    const table = this.ident("a table name");
    const where = this.accept("where") ? this.expr() : null;
    return { type: "delete", table, where, returning: this.returning() };
  }
  create() {
    this.expect("table");
    let ifNot = false;
    if (this.accept("if")) { this.expect("not"); this.expect("exists"); ifNot = true; }
    const name = this.ident("a table name");
    this.expect("(");
    const cols = [], cons = [];
    do {
      if (this.is(")")) err(this.near(), "Remove the comma after the last column.");
      if (this.accept("constraint")) this.ident();
      if (this.is("primary") || this.is("foreign") || this.is("unique") || this.is("check")) { cons.push(this.tableConstraint()); continue; }
      cols.push(this.columnDef());
    } while (this.accept(","));
    this.expect(")");
    return { type: "create", name, cols, cons, ifNot };
  }
  typeName() {
    const t = this.peek();
    if (t.t !== "id" && t.t !== "kw") err(this.near(), "Expected a data type such as INTEGER, TEXT or VARCHAR(50).");
    let ty = this.next().v;
    if (ty === "double" && this.acceptWord("precision")) ty = "double precision";
    if (ty === "character" && this.acceptWord("varying")) ty = "varchar";
    if (ty === "timestamp" && (this.acceptWord("with") || this.acceptWord("without"))) { this.acceptWord("time"); this.acceptWord("zone"); }
    let len = null, scale = null;
    if (this.accept("(")) { len = this.next().v; if (this.accept(",")) scale = this.next().v; this.expect(")"); }
    const known = ["int", "integer", "int4", "int8", "bigint", "smallint", "serial", "bigserial", "numeric", "decimal", "real", "float", "double precision",
      "text", "varchar", "char", "boolean", "bool", "date", "timestamp", "timestamptz", "time", "uuid", "json", "jsonb", "money"];
    if (!known.includes(ty)) err("type \"" + ty + "\" does not exist", "Try INTEGER, NUMERIC, TEXT, VARCHAR(n), BOOLEAN, DATE or TIMESTAMP.");
    return { ty, len, scale };
  }
  columnDef() {
    const name = this.ident("a column name");
    const c = { name, ...this.typeName(), notNull: false, pk: false, unique: false, def: null, ref: null, check: null, identity: false };
    if (c.ty === "serial" || c.ty === "bigserial") { c.identity = true; c.notNull = true; c.ty = "integer"; }
    for (;;) {
      if (this.accept("primary")) { this.expect("key"); c.pk = true; c.notNull = true; continue; }
      if (this.accept("not")) { this.expect("null"); c.notNull = true; continue; }
      if (this.accept("null")) continue;
      if (this.accept("unique")) { c.unique = true; continue; }
      if (this.accept("autoincrement")) { c.identity = true; continue; }
      if (this.accept("default")) { c.def = this.unary(); continue; }
      if (this.accept("check")) { this.expect("("); c.check = this.expr(); this.expect(")"); continue; }
      if (this.accept("generated")) {
        if (!this.accept("always")) { this.expect("by"); this.expect("default"); }
        this.expect("as"); this.expect("identity"); c.identity = true; c.notNull = true; continue;
      }
      if (this.accept("references")) { c.ref = this.refSpec(); continue; }
      if (this.accept("constraint")) { this.ident(); continue; }
      break;
    }
    return c;
  }
  refSpec() {
    const table = this.ident("a table name");
    let col = null;
    if (this.accept("(")) { col = this.ident(); this.expect(")"); }
    let onDelete = null;
    while (this.acceptWord("on")) {
      const ev = this.next().v;
      let act;
      if (this.accept("cascade")) act = "cascade";
      else if (this.accept("set")) { act = this.accept("null") ? "set null" : (this.expect("default"), "set default"); }
      else if (this.acceptWord("restrict")) act = "restrict";
      else { this.acceptWord("no"); this.acceptWord("action"); act = "no action"; }
      if (ev === "delete") onDelete = act;
    }
    return { table, col, onDelete };
  }
  tableConstraint() {
    if (this.accept("primary")) { this.expect("key"); return { k: "pk", cols: this.colList() }; }
    if (this.accept("unique")) return { k: "unique", cols: this.colList() };
    if (this.accept("check")) { this.expect("("); const e = this.expr(); this.expect(")"); return { k: "check", e }; }
    this.expect("foreign"); this.expect("key");
    const cols = this.colList();
    this.expect("references");
    return { k: "fk", cols, ref: this.refSpec() };
  }
  colList() { this.expect("("); const c = []; do c.push(this.ident("a column name")); while (this.accept(",")); this.expect(")"); return c; }
  drop() {
    this.expect("table");
    let ifExists = false;
    if (this.accept("if")) { this.expect("exists"); ifExists = true; }
    const names = []; do names.push(this.ident("a table name")); while (this.accept(","));
    const cascade = this.accept("cascade");
    return { type: "drop", names, ifExists, cascade };
  }
  alter() {
    this.expect("table");
    const table = this.ident("a table name");
    if (this.accept("add")) {
      if (this.is("constraint") || this.is("primary") || this.is("foreign") || this.is("unique") || this.is("check")) { if (this.accept("constraint")) this.ident(); return { type: "alter", table, op: "addcons", con: this.tableConstraint() }; }
      this.accept("column");
      let ifNot = false;
      if (this.accept("if")) { this.expect("not"); this.expect("exists"); ifNot = true; }
      return { type: "alter", table, op: "add", col: this.columnDef(), ifNot };
    }
    if (this.accept("drop")) { this.accept("column"); let ifExists = false; if (this.accept("if")) { this.expect("exists"); ifExists = true; } return { type: "alter", table, op: "drop", col: this.ident("a column name"), ifExists }; }
    if (this.accept("rename")) {
      if (this.accept("to")) return { type: "alter", table, op: "renametable", to: this.ident() };
      this.accept("column");
      const from = this.ident("a column name"); this.expect("to");
      return { type: "alter", table, op: "rename", from, to: this.ident("a column name") };
    }
    if (this.accept("alter")) {
      this.accept("column");
      const col = this.ident();
      if (this.accept("set")) {
        if (this.accept("not")) { this.expect("null"); return { type: "alter", table, op: "setnotnull", col }; }
        this.expect("default"); return { type: "alter", table, op: "setdefault", col, def: this.primary() };
      }
      if (this.accept("drop")) { if (this.accept("not")) { this.expect("null"); return { type: "alter", table, op: "dropnotnull", col }; } this.expect("default"); return { type: "alter", table, op: "setdefault", col, def: null }; }
      if (this.acceptWord("type")) return { type: "alter", table, op: "type", col, ...this.typeName() };
    }
    err(this.near(), "ALTER TABLE supports ADD COLUMN, DROP COLUMN, RENAME COLUMN … TO …, RENAME TO and ALTER COLUMN.");
  }

  /* expressions, lowest precedence first */
  expr() { return this.or(); }
  or() { let l = this.and(); while (this.accept("or")) l = { k: "or", l, r: this.and() }; return l; }
  and() { let l = this.not(); while (this.accept("and")) l = { k: "and", l, r: this.not() }; return l; }
  not() { if (this.accept("not")) return { k: "not", e: this.not() }; return this.cmp(); }
  cmp() {
    let l = this.concat();
    for (;;) {
      const t = this.peek();
      if (t.t === "op" && ["=", "<>", "!=", "<", "<=", ">", ">="].includes(t.v)) { this.next(); l = { k: "bin", op: t.v === "!=" ? "<>" : t.v, l, r: this.concat() }; continue; }
      if (this.accept("is")) {
        const neg = this.accept("not");
        if (this.accept("null")) { l = { k: "isnull", e: l, neg }; continue; }
        if (this.accept("true")) { l = { k: "istrue", e: l, v: true, neg }; continue; }
        if (this.accept("false")) { l = { k: "istrue", e: l, v: false, neg }; continue; }
        if (this.accept("distinct")) { this.expect("from"); l = { k: "distinctfrom", l, r: this.concat(), neg }; continue; }
        err(this.near(), "Use IS NULL or IS NOT NULL.");
      }
      let neg = false;
      if (this.is("not") && (this.is("in", 1) || this.is("like", 1) || this.is("ilike", 1) || this.is("between", 1))) { this.next(); neg = true; }
      if (this.accept("in")) {
        this.expect("(");
        if (this.is("select")) { const sub = this.selectStmt(); this.expect(")"); l = { k: "insub", e: l, sub, neg }; continue; }
        const list = []; do list.push(this.expr()); while (this.accept(","));
        this.expect(")");
        l = { k: "in", e: l, list, neg }; continue;
      }
      if (this.accept("like")) { l = { k: "like", e: l, p: this.concat(), neg, ci: false }; continue; }
      if (this.accept("ilike")) { l = { k: "like", e: l, p: this.concat(), neg, ci: true }; continue; }
      if (this.accept("between")) { const lo = this.concat(); this.expect("and"); const hi = this.concat(); l = { k: "between", e: l, lo, hi, neg }; continue; }
      if (neg) err(this.near());
      return l;
    }
  }
  concat() { let l = this.add(); while (this.accept("||")) l = { k: "bin", op: "||", l, r: this.add() }; return l; }
  add() { let l = this.mul(); for (;;) { if (this.accept("+")) l = { k: "bin", op: "+", l, r: this.mul() }; else if (this.accept("-")) l = { k: "bin", op: "-", l, r: this.mul() }; else return l; } }
  mul() { let l = this.unary(); for (;;) { const t = this.peek(); if (t.t === "op" && ["*", "/", "%"].includes(t.v)) { this.next(); l = { k: "bin", op: t.v, l, r: this.unary() }; } else return l; } }
  unary() { if (this.accept("-")) return { k: "neg", e: this.unary() }; if (this.accept("+")) return this.unary(); return this.postfix(); }
  postfix() { let e = this.primary(); while (this.accept("::")) e = { k: "cast", e, ...this.typeName() }; return e; }
  primary() {
    const t = this.peek();
    if (t.t === "num") { this.next(); return { k: "lit", v: t.v }; }
    if (t.t === "str") { this.next(); return { k: "lit", v: t.v }; }
    if (this.accept("true")) return { k: "lit", v: true };
    if (this.accept("false")) return { k: "lit", v: false };
    if (this.accept("null")) return { k: "lit", v: null };
    if (this.accept("(")) {
      if (this.is("select")) { const sub = this.selectStmt(); this.expect(")"); return { k: "subq", sub }; }
      const e = this.expr(); this.expect(")"); return e;
    }
    if (this.accept("exists")) { this.expect("("); const sub = this.selectStmt(); this.expect(")"); return { k: "exists", sub }; }
    if (this.accept("case")) {
      let subject = null;
      if (!this.is("when")) subject = this.expr();
      const whens = [];
      while (this.accept("when")) { const w = this.expr(); this.expect("then"); whens.push([w, this.expr()]); }
      const els = this.accept("else") ? this.expr() : null;
      this.expect("end");
      return { k: "case", subject, whens, els };
    }
    if (this.accept("cast")) { this.expect("("); const e = this.expr(); this.expect("as"); const ty = this.typeName(); this.expect(")"); return { k: "cast", e, ...ty }; }
    if (t.t === "id" || (t.t === "kw" && ["left", "right", "replace"].includes(t.v) && this.is("(", 1))) {
      this.next();
      if (this.is("(")) {
        this.next();
        const fn = t.v;
        if (this.accept("*")) { this.expect(")"); return { k: "fn", fn, star: true, args: [] }; }
        const distinct = this.accept("distinct");
        const args = [];
        if (!this.is(")")) do args.push(this.expr()); while (this.accept(","));
        this.expect(")");
        return { k: "fn", fn, args, distinct };
      }
      if (this.accept(".")) {
        if (this.accept("*")) err("syntax error at or near \"*\"", "table.* only works directly in the SELECT list.");
        return { k: "col", table: t.v, name: this.ident("a column name") };
      }
      if (["current_date", "current_timestamp", "now"].includes(t.v)) return { k: "fn", fn: t.v, args: [] };
      return { k: "col", name: t.v };
    }
    err(this.near(), t.t === "kw" ? "\"" + t.v.toUpperCase() + "\" is a reserved word. If it's a column name, wrap it in double quotes." : "");
  }
}

/* ───────────── values ───────────── */
const INT = ["int", "integer", "int4", "int8", "bigint", "smallint", "serial", "bigserial"];
const NUM = ["numeric", "decimal", "real", "float", "double precision", "money"];
const typeLabel = (c) => {
  if (INT.includes(c.ty)) return c.ty === "bigint" || c.ty === "int8" ? "bigint" : c.ty === "smallint" ? "smallint" : "integer";
  if (c.ty === "varchar") return "character varying";
  if (c.ty === "char") return "character";
  if (c.ty === "bool") return "boolean";
  return c.ty;
};
const showType = (c) => (c.ty === "varchar" || c.ty === "char" || c.ty === "numeric") && c.len != null ? c.ty.toUpperCase() + "(" + c.len + (c.scale != null ? "," + c.scale : "") + ")" : c.ty.toUpperCase();

function coerce(v, c, colName) {
  if (v === null || v === undefined) return null;
  const ty = c.ty;
  const bad = () => err("invalid input syntax for type " + typeLabel(c) + ": \"" + v + "\"" + (colName ? " (column \"" + colName + "\")" : ""));
  if (INT.includes(ty)) {
    if (typeof v === "boolean") err("column \"" + colName + "\" is of type integer but expression is of type boolean");
    const n = typeof v === "number" ? v : /^\s*[-+]?\d+(\.\d+)?\s*$/.test(String(v)) ? Number(v) : bad();
    return Math.round(n);
  }
  if (NUM.includes(ty)) {
    if (typeof v === "boolean") err("column \"" + colName + "\" is of type numeric but expression is of type boolean");
    const n = typeof v === "number" ? v : /^\s*[-+]?(\d+\.?\d*|\.\d+)(e[-+]?\d+)?\s*$/i.test(String(v)) ? Number(v) : bad();
    return c.scale != null ? Number(n.toFixed(c.scale)) : n;
  }
  if (ty === "boolean" || ty === "bool") {
    if (typeof v === "boolean") return v;
    const s = String(v).toLowerCase().trim();
    if (["t", "true", "yes", "y", "on", "1"].includes(s)) return true;
    if (["f", "false", "no", "n", "off", "0"].includes(s)) return false;
    return bad();
  }
  if (ty === "date") {
    const s = String(v).trim();
    if (!/^\d{4}-\d{2}-\d{2}/.test(s) || isNaN(Date.parse(s.slice(0, 10)))) bad();
    return s.slice(0, 10);
  }
  if (ty === "timestamp" || ty === "timestamptz") {
    const s = String(v).trim();
    if (isNaN(Date.parse(s.replace(" ", "T")))) bad();
    return s.replace("T", " ").replace(/\.\d+Z?$|Z$/, "");
  }
  const s = typeof v === "boolean" ? String(v) : String(v);
  if ((ty === "varchar" || ty === "char") && c.len != null && s.length > c.len) err("value too long for type character varying(" + c.len + ")", "The text is " + s.length + " characters; the column allows " + c.len + ".");
  return s;
}

const isNum = (v) => typeof v === "number";
function compare(a, b) {
  if (a === null || b === null) return null;
  if (isNum(a) && !isNum(b) && b !== "" && !isNaN(Number(b)) && typeof b !== "boolean") b = Number(b);
  if (isNum(b) && !isNum(a) && a !== "" && !isNaN(Number(a)) && typeof a !== "boolean") a = Number(a);
  if (typeof a !== typeof b) {
    if (isNum(a) || isNum(b)) err("operator does not exist: " + (isNum(a) ? "integer" : typeof a === "boolean" ? "boolean" : "text") + " = " + (isNum(b) ? "integer" : typeof b === "boolean" ? "boolean" : "text"), "Text values need single quotes ('Action'), numbers don't (42).");
    a = String(a); b = String(b);
  }
  return a < b ? -1 : a > b ? 1 : 0;
}
const sortCmp = (a, b) => (a === null && b === null ? 0 : a === null ? 1 : b === null ? -1 : compare(a, b));
const likeRe = (p, ci) => new RegExp("^" + String(p).replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/%/g, ".*").replace(/_/g, ".") + "$", ci ? "is" : "s");
const truthy = (v) => v === true || (v !== null && v !== false && v !== 0 && v !== "f" && v !== "false");
const AGG = new Set(["count", "sum", "avg", "min", "max", "string_agg", "array_agg", "bool_and", "bool_or"]);
const hasAgg = (e) => !!e && typeof e === "object" && (e.k === "fn" && AGG.has(e.fn) ? true : Object.values(e).some((v) => (Array.isArray(v) ? v.some((x) => (Array.isArray(x) ? x.some(hasAgg) : hasAgg(x))) : v && typeof v === "object" && v.k && v.k !== "subq" ? hasAgg(v) : false)));
const exprKey = (e) => JSON.stringify(e, (k, v) => (k === "text" ? undefined : v));

/* ───────────── database ───────────── */
class Database {
  constructor(opts) { this.tables = {}; this.sqlite = !!(opts && opts.sqlite); }
  clone() { const d = new Database({ sqlite: this.sqlite }); d.tables = JSON.parse(JSON.stringify(this.tables)); return d; }

  /** Run one or more statements. Returns [{ command, columns?, rows?, rowCount, text }]. Throws SqlError (with .results for completed statements). */
  exec(sql) {
    let stmts;
    try { stmts = new Parser(sql, this.sqlite).statements(); } catch (e) { e.results = []; throw e; }
    const results = [];
    for (const st of stmts) {
      try { const r = this.run(st); r.text = st.text; results.push(r); }
      catch (e) { if (e instanceof SqlError) { e.results = results; e.statement = st.text; } throw e; }
    }
    return results;
  }
  /** Convenience: run a single SELECT and return an array of row objects. */
  query(sql) {
    const r = this.exec(sql).pop();
    return r && r.rows ? r.rows.map((row) => Object.fromEntries(r.columns.map((c, i) => [c, row[i]]))) : [];
  }
  table(name) {
    const t = this.tables[name];
    if (!t) err("relation \"" + name + "\" does not exist", Object.keys(this.tables).length ? "Tables: " + Object.keys(this.tables).join(", ") + "." : "Create it first with CREATE TABLE.");
    return t;
  }
  run(st) {
    switch (st.type) {
      case "select": case "union": { const r = this.select(st, null); return { command: "SELECT", columns: r.columns, rows: r.rows, rowCount: r.rows.length }; }
      case "create": return this.create(st);
      case "drop": return this.drop(st);
      case "alter": return this.alter(st);
      case "insert": return this.insert(st);
      case "update": return this.update(st);
      case "delete": return this.delete(st);
    }
    return err("unsupported statement");
  }

  /* DDL */
  create(st) {
    if (this.tables[st.name]) { if (st.ifNot) return { command: "CREATE TABLE", rowCount: 0, notice: "relation \"" + st.name + "\" already exists, skipping" }; err("relation \"" + st.name + "\" already exists", "Use DROP TABLE " + st.name + "; first, or CREATE TABLE IF NOT EXISTS."); }
    const seen = new Set();
    for (const c of st.cols) { if (seen.has(c.name)) err("column \"" + c.name + "\" specified more than once"); seen.add(c.name); }
    const t = { name: st.name, cols: st.cols.map((c) => ({ ...c })), rows: [], seq: {}, uniques: [], checks: [], fks: [] };
    for (const c of t.cols) {
      if (this.sqlite && c.pk && INT.includes(c.ty)) { c.identity = true; }   // SQLite: INTEGER PRIMARY KEY is the rowid
      if (c.pk) t.pk = [c.name];
      if (c.pk || c.unique) t.uniques.push([c.name]);
      if (c.check) t.checks.push({ e: c.check, name: st.name + "_" + c.name + "_check" });
      if (c.ref) t.fks.push(this.fkDef(t, [c.name], c.ref));
      if (c.identity) t.seq[c.name] = 0;
    }
    for (const k of st.cons) this.addCons(t, k);
    this.tables[st.name] = t;
    return { command: "CREATE TABLE", rowCount: 0 };
  }
  fkDef(t, cols, ref) {
    const rt = ref.table === t.name ? t : this.table(ref.table);
    const rcol = ref.col || (rt.pk && rt.pk[0]);
    if (!rcol) err("there is no primary key for referenced table \"" + ref.table + "\"");
    if (!rt.cols.some((c) => c.name === rcol)) err("column \"" + rcol + "\" referenced in foreign key constraint does not exist");
    return { cols, table: ref.table, rcol, onDelete: ref.onDelete, name: t.name + "_" + cols[0] + "_fkey" };
  }
  addCons(t, k) {
    const has = (c) => { if (!t.cols.some((x) => x.name === c)) err("column \"" + c + "\" named in key does not exist"); };
    if (k.k === "pk") { k.cols.forEach(has); if (t.pk) err("multiple primary keys for table \"" + t.name + "\" are not allowed"); t.pk = k.cols; t.uniques.push(k.cols); k.cols.forEach((c) => { t.cols.find((x) => x.name === c).notNull = true; }); }
    else if (k.k === "unique") { k.cols.forEach(has); t.uniques.push(k.cols); }
    else if (k.k === "check") t.checks.push({ e: k.e, name: t.name + "_check" });
    else if (k.k === "fk") { k.cols.forEach(has); t.fks.push(this.fkDef(t, k.cols, k.ref)); }
  }
  drop(st) {
    for (const name of st.names) {
      if (!this.tables[name]) { if (st.ifExists) continue; this.table(name); }
      const deps = Object.values(this.tables).filter((t) => t.name !== name && t.fks.some((f) => f.table === name));
      if (deps.length && !st.cascade) err("cannot drop table " + name + " because other objects depend on it", "Table " + deps[0].name + " has a foreign key to it. Drop that table first, or use DROP TABLE " + name + " CASCADE.");
      deps.forEach((d) => { d.fks = d.fks.filter((f) => f.table !== name); });
      delete this.tables[name];
    }
    return { command: "DROP TABLE", rowCount: 0 };
  }
  alter(st) {
    const t = this.table(st.table);
    const col = (n) => t.cols.find((c) => c.name === n) || err("column \"" + n + "\" of relation \"" + t.name + "\" does not exist");
    switch (st.op) {
      case "add": {
        if (t.cols.some((c) => c.name === st.col.name)) { if (st.ifNot) return { command: "ALTER TABLE", rowCount: 0 }; err("column \"" + st.col.name + "\" of relation \"" + t.name + "\" already exists"); }
        const c = { ...st.col };
        const dv = c.def ? coerce(this.eval(c.def, {}), c, c.name) : null;
        if (c.notNull && dv === null && t.rows.length && !c.identity) err("column \"" + c.name + "\" of relation \"" + t.name + "\" contains null values", "Give the new column a DEFAULT, or add it without NOT NULL first.");
        t.cols.push(c);
        if (c.identity) t.seq[c.name] = 0;
        t.rows.forEach((r) => { r[c.name] = c.identity ? ++t.seq[c.name] : dv; });
        if (c.unique || c.pk) t.uniques.push([c.name]);
        if (c.pk) t.pk = [c.name];
        if (c.ref) t.fks.push(this.fkDef(t, [c.name], c.ref));
        if (c.check) t.checks.push({ e: c.check, name: t.name + "_" + c.name + "_check" });
        break;
      }
      case "drop": {
        if (!t.cols.some((c) => c.name === st.col)) { if (st.ifExists) return { command: "ALTER TABLE", rowCount: 0 }; col(st.col); }
        const deps = Object.values(this.tables).filter((o) => o.fks.some((f) => f.table === t.name && f.rcol === st.col));
        if (deps.length) err("cannot drop column " + st.col + " of table " + t.name + " because other objects depend on it");
        t.cols = t.cols.filter((c) => c.name !== st.col);
        t.rows.forEach((r) => delete r[st.col]);
        t.uniques = t.uniques.filter((u) => !u.includes(st.col));
        t.fks = t.fks.filter((f) => !f.cols.includes(st.col));
        if (t.pk && t.pk.includes(st.col)) t.pk = null;
        break;
      }
      case "rename": {
        const c = col(st.from);
        if (t.cols.some((x) => x.name === st.to)) err("column \"" + st.to + "\" of relation \"" + t.name + "\" already exists");
        c.name = st.to;
        t.rows.forEach((r) => { r[st.to] = r[st.from]; delete r[st.from]; });
        const ren = (a) => a.map((x) => (x === st.from ? st.to : x));
        t.uniques = t.uniques.map(ren); if (t.pk) t.pk = ren(t.pk);
        t.fks.forEach((f) => { f.cols = ren(f.cols); });
        if (st.from in t.seq) { t.seq[st.to] = t.seq[st.from]; delete t.seq[st.from]; }
        Object.values(this.tables).forEach((o) => o.fks.forEach((f) => { if (f.table === t.name && f.rcol === st.from) f.rcol = st.to; }));
        break;
      }
      case "renametable": {
        if (this.tables[st.to]) err("relation \"" + st.to + "\" already exists");
        delete this.tables[t.name];
        Object.values(this.tables).forEach((o) => o.fks.forEach((f) => { if (f.table === t.name) f.table = st.to; }));
        t.name = st.to; this.tables[st.to] = t;
        break;
      }
      case "setnotnull": { const c = col(st.col); if (t.rows.some((r) => r[c.name] === null)) err("column \"" + c.name + "\" of relation \"" + t.name + "\" contains null values"); c.notNull = true; break; }
      case "dropnotnull": col(st.col).notNull = false; break;
      case "setdefault": col(st.col).def = st.def; break;
      case "type": { const c = col(st.col); const nc = { ...c, ty: st.ty, len: st.len, scale: st.scale }; t.rows.forEach((r) => { r[c.name] = coerce(r[c.name], nc, c.name); }); Object.assign(c, nc); break; }
      case "addcons": this.addCons(t, st.con); this.validate(t, t.rows, null); break;
    }
    return { command: "ALTER TABLE", rowCount: 0 };
  }

  /* constraints */
  validate(t, rows, changed) {
    for (const r of changed || rows) {
      for (const c of t.cols) {
        if (c.notNull && r[c.name] === null) err("null value in column \"" + c.name + "\" of relation \"" + t.name + "\" violates not-null constraint", "Every row needs a value for " + c.name + ".");
      }
      for (const ck of t.checks) {
        const env = { [t.name]: r };
        const v = this.eval(ck.e, { env, tables: [{ alias: t.name, cols: t.cols.map((c) => c.name) }] });
        if (v === false) err("new row for relation \"" + t.name + "\" violates check constraint \"" + ck.name + "\"");
      }
      for (const fk of t.fks) {
        const vals = fk.cols.map((c) => r[c]);
        if (vals.some((v) => v === null)) continue;
        const rt = this.tables[fk.table];
        if (!rt.rows.some((x) => compare(x[fk.rcol], vals[0]) === 0) && !(fk.table === t.name && rows.some((x) => compare(x[fk.rcol], vals[0]) === 0)))
          err("insert or update on table \"" + t.name + "\" violates foreign key constraint \"" + fk.name + "\"", "Key (" + fk.cols.join(", ") + ")=(" + vals.join(", ") + ") is not present in table \"" + fk.table + "\".");
      }
    }
    for (const u of t.uniques) {
      const seen = new Map();
      for (const r of rows) {
        const vals = u.map((c) => r[c]);
        if (vals.some((v) => v === null)) continue;
        const key = JSON.stringify(vals);
        if (seen.has(key)) {
          const isPk = t.pk && t.pk.join() === u.join();
          err("duplicate key value violates unique constraint \"" + t.name + "_" + (isPk ? "pkey" : u.join("_") + "_key") + "\"", "Key (" + u.join(", ") + ")=(" + vals.join(", ") + ") already exists.");
        }
        seen.set(key, true);
      }
    }
  }

  /* DML */
  insert(st) {
    const t = this.table(st.table);
    const names = st.cols || t.cols.map((c) => c.name);
    for (const n of names) if (!t.cols.some((c) => c.name === n)) err("column \"" + n + "\" of relation \"" + t.name + "\" does not exist", "Columns: " + t.cols.map((c) => c.name).join(", ") + ".");
    let valueRows;
    if (st.select) valueRows = this.select(st.select, null).rows;
    else valueRows = st.rows.map((r) => r.map((e) => (e.k === "default" ? e : this.eval(e, {}))));
    const added = [];
    for (const vr of valueRows) {
      if (vr.length > names.length) err("INSERT has more expressions than target columns");
      if (vr.length < names.length) err("INSERT has more target columns than expressions");
      const row = {};
      for (const c of t.cols) {
        const i = names.indexOf(c.name);
        let v = i < 0 || (vr[i] && vr[i].k === "default") ? undefined : vr[i];
        if (v === undefined) {
          if (c.identity) v = ++t.seq[c.name];
          else v = c.def ? this.eval(c.def, {}) : null;
        } else if (c.identity && v !== null) t.seq[c.name] = Math.max(t.seq[c.name], Number(v));
        row[c.name] = coerce(v, c, c.name);
      }
      added.push(row);
    }
    const all = t.rows.concat(added);
    this.validate(t, all, added);
    t.rows = all;
    const r = this.returning(st, t, added, "INSERT");
    if (t.pk && added.length) r.lastId = added[added.length - 1][t.pk[0]];
    return r;
  }
  matching(t, where) {
    const scope = [{ alias: t.name, cols: t.cols.map((c) => c.name) }];
    return t.rows.filter((r) => !where || truthy(this.eval(where, { env: { [t.name]: r }, tables: scope })));
  }
  update(st) {
    const t = this.table(st.table);
    const scope = [{ alias: t.name, cols: t.cols.map((c) => c.name) }];
    for (const s of st.sets) if (!t.cols.some((c) => c.name === s.col)) err("column \"" + s.col + "\" of relation \"" + t.name + "\" does not exist", "Columns: " + t.cols.map((c) => c.name).join(", ") + ".");
    const targets = new Set(this.matching(t, st.where));
    const changed = [];
    const next = t.rows.map((r) => {
      if (!targets.has(r)) return r;
      const n = { ...r };
      for (const s of st.sets) {
        const c = t.cols.find((x) => x.name === s.col);
        n[s.col] = coerce(s.e.k === "default" ? (c.def ? this.eval(c.def, {}) : null) : this.eval(s.e, { env: { [t.name]: r }, tables: scope }), c, c.name);
      }
      changed.push(n);
      return n;
    });
    this.validate(t, next, changed);
    // keep referencing rows valid
    for (const o of Object.values(this.tables)) for (const fk of o.fks) {
      if (fk.table !== t.name) continue;
      const before = [...targets].map((r) => r[fk.rcol]), after = new Set(next.map((r) => JSON.stringify(r[fk.rcol])));
      if (before.some((v) => !after.has(JSON.stringify(v)) && o.rows.some((x) => compare(x[fk.cols[0]], v) === 0)))
        err("update or delete on table \"" + t.name + "\" violates foreign key constraint \"" + fk.name + "\" on table \"" + o.name + "\"");
    }
    t.rows = next;
    return this.returning(st, t, changed, "UPDATE");
  }
  delete(st) {
    const t = this.table(st.table);
    const gone = this.matching(t, st.where);
    this.cascadeDelete(t, new Set(gone));
    return this.returning(st, t, gone, "DELETE");
  }
  cascadeDelete(t, gone) {
    if (!gone.size) return;
    for (const o of Object.values(this.tables)) for (const fk of o.fks) {
      if (fk.table !== t.name) continue;
      const keys = [...gone].map((r) => r[fk.rcol]);
      const refs = o.rows.filter((x) => keys.some((k) => compare(x[fk.cols[0]], k) === 0));
      if (!refs.length) continue;
      if (fk.onDelete === "cascade") this.cascadeDelete(o, new Set(refs));
      else if (fk.onDelete === "set null") refs.forEach((x) => { x[fk.cols[0]] = null; });
      else err("update or delete on table \"" + t.name + "\" violates foreign key constraint \"" + fk.name + "\" on table \"" + o.name + "\"", "Key (" + fk.rcol + ")=(" + refs[0][fk.cols[0]] + ") is still referenced from table \"" + o.name + "\". Delete those rows first, or use ON DELETE CASCADE.");
    }
    t.rows = t.rows.filter((r) => !gone.has(r));
  }
  returning(st, t, rows, command) {
    if (!st.returning) return { command, rowCount: rows.length };
    const scope = [{ alias: t.name, cols: t.cols.map((c) => c.name) }];
    const columns = [], getters = [];
    for (const c of st.returning) {
      if (c.star) t.cols.forEach((x) => { columns.push(x.name); getters.push((r) => r[x.name]); });
      else { columns.push(c.alias || outName(c.e)); getters.push((r) => this.eval(c.e, { env: { [t.name]: r }, tables: scope })); }
    }
    return { command, rowCount: rows.length, columns, rows: rows.map((r) => getters.map((g) => g(r))) };
  }

  /* SELECT */
  source(ref, outer) {
    if (ref.sub) {
      const r = this.select(ref.sub, outer);
      return { alias: ref.alias, cols: r.columns, rows: r.rows.map((row) => Object.fromEntries(r.columns.map((c, i) => [c, row[i]]))) };
    }
    const t = this.table(ref.name);
    return { alias: ref.alias, cols: t.cols.map((c) => c.name), rows: t.rows };
  }
  select(st, outer) {
    if (st.type === "union") {
      const a = this.select(st.left, outer), b = this.select(st.right, outer);
      if (a.columns.length !== b.columns.length) err("each UNION query must have the same number of columns");
      let rows = a.rows.concat(b.rows);
      if (!st.all) { const seen = new Set(); rows = rows.filter((r) => { const k = JSON.stringify(r); if (seen.has(k)) return false; seen.add(k); return true; }); }
      const res = { columns: a.columns, rows };
      return this.finish(st, res, rows.map((r) => ({ out: r, env: {} })), [], outer);
    }
    let scope = [], envs = [{}];
    if (st.from) {
      const first = this.source(st.from, outer);
      scope = [{ alias: first.alias, cols: first.cols }];
      envs = first.rows.map((r) => ({ [first.alias]: r }));
      for (const j of st.joins) {
        const src = this.source(j.ref, outer);
        if (scope.some((s) => s.alias === src.alias)) err("table name \"" + src.alias + "\" specified more than once", "Give one of them an alias: JOIN " + src.alias + " AS x.");
        const nscope = scope.concat([{ alias: src.alias, cols: src.cols }]);
        const nullRow = Object.fromEntries(src.cols.map((c) => [c, null]));
        const out = [];
        const matchedRight = new Set();
        for (const e of envs) {
          let matched = false;
          for (const r of src.rows) {
            const env = { ...e, [src.alias]: r };
            if (j.kind === "cross" || truthy(this.eval(j.on, { env, tables: nscope, outer }))) { out.push(env); matched = true; matchedRight.add(r); }
          }
          if (!matched && (j.kind === "left" || j.kind === "full")) out.push({ ...e, [src.alias]: nullRow });
        }
        if (j.kind === "right" || j.kind === "full") {
          const leftNull = Object.fromEntries(scope.map((s) => [s.alias, Object.fromEntries(s.cols.map((c) => [c, null]))]));
          for (const r of src.rows) if (!matchedRight.has(r)) out.push({ ...leftNull, [src.alias]: r });
        }
        envs = out; scope = nscope;
      }
    }
    const ctx = (env) => ({ env, tables: scope, outer });
    if (st.where) {
      if (hasAgg(st.where)) err("aggregate functions are not allowed in WHERE", "Filter groups with HAVING instead: … GROUP BY x HAVING COUNT(*) > 1");
      envs = envs.filter((env) => truthy(this.eval(st.where, ctx(env))));
    }
    // expand the select list
    const items = [];
    for (const c of st.cols) {
      if (c.star) {
        const ss = c.table ? scope.filter((s) => s.alias === c.table) : scope;
        if (c.table && !ss.length) err("missing FROM-clause entry for table \"" + c.table + "\"");
        if (!st.from) err("SELECT * with no tables specified is not valid");
        ss.forEach((s) => s.cols.forEach((col) => items.push({ name: col, e: { k: "col", table: s.alias, name: col } })));
      } else items.push({ name: c.alias || outName(c.e), e: c.e });
    }
    const grouped = !!st.groupBy || items.some((it) => hasAgg(it.e)) || (st.having && hasAgg(st.having));
    let out = [];
    if (grouped) {
      const keys = st.groupBy || [];
      const gkeys = keys.map(exprKey);
      // bare column references must be grouped
      const checkCols = (e, inAgg) => {
        if (!e || typeof e !== "object") return;
        if (e.k === "fn" && AGG.has(e.fn)) { e.args.forEach((a) => checkCols(a, true)); return; }
        if (e.k === "subq" || e.k === "exists" || e.k === "insub") return;
        if (!inAgg && gkeys.includes(exprKey(e))) return;
        if (e.k === "col" && !inAgg) {
          const grp = keys.some((g) => g.k === "col" && g.name === e.name && (!g.table || !e.table || g.table === e.table));
          if (!grp) err("column \"" + (e.table ? e.table + "." : "") + e.name + "\" must appear in the GROUP BY clause or be used in an aggregate function", "Either add it to GROUP BY, or wrap it in an aggregate like COUNT(), MAX() or SUM().");
          return;
        }
        Object.values(e).forEach((v) => { if (Array.isArray(v)) v.forEach((x) => (Array.isArray(x) ? x.forEach((y) => checkCols(y, inAgg)) : checkCols(x, inAgg))); else if (v && typeof v === "object" && v.k) checkCols(v, inAgg); });
      };
      items.forEach((it) => checkCols(it.e, false));
      if (st.having) checkCols(st.having, false);
      const groups = new Map();
      for (const env of envs) {
        const k = JSON.stringify(keys.map((g) => this.eval(g, ctx(env))));
        if (!groups.has(k)) groups.set(k, []);
        groups.get(k).push(env);
      }
      if (!keys.length && !groups.size) groups.set("[]", []);
      for (const rows of groups.values()) {
        const gctx = { env: rows[0] || {}, tables: scope, outer, group: rows, groupCtx: (env) => ctx(env) };
        if (st.having && !truthy(this.eval(st.having, gctx))) continue;
        out.push({ out: items.map((it) => this.eval(it.e, gctx)), env: gctx.env, group: rows });
      }
    } else {
      out = envs.map((env) => ({ out: items.map((it) => this.eval(it.e, ctx(env))), env }));
    }
    const res = { columns: items.map((i) => i.name), rows: null };
    return this.finish(st, res, out, scope, outer, items);
  }
  finish(st, res, out, scope, outer, items) {
    if (st.distinct) { const seen = new Set(); out = out.filter((o) => { const k = JSON.stringify(o.out); if (seen.has(k)) return false; seen.add(k); return true; }); }
    if (st.orderBy) {
      const keyFns = st.orderBy.map((o) => {
        if (o.e.k === "lit" && isNum(o.e.v)) { const i = o.e.v - 1; if (i < 0 || i >= res.columns.length) err("ORDER BY position " + o.e.v + " is not in select list"); return (r) => r.out[i]; }
        const ai = o.e.k === "col" && !o.e.table ? res.columns.findIndex((c) => c.toLowerCase() === o.e.name) : -1;
        if (ai >= 0) return (r) => r.out[ai];
        if (st.distinct && items && !items.some((it) => exprKey(it.e) === exprKey(o.e))) err("for SELECT DISTINCT, ORDER BY expressions must appear in select list");
        return (r) => this.eval(o.e, r.group ? { env: r.env, tables: scope, outer, group: r.group } : { env: r.env, tables: scope, outer });
      });
      const decorated = out.map((r) => ({ r, k: keyFns.map((f) => f(r)) }));
      decorated.sort((a, b) => {
        for (let i = 0; i < keyFns.length; i++) {
          const o = st.orderBy[i];
          const x = a.k[i], y = b.k[i];
          if (x === null || y === null) {
            if (x === y) continue;
            const nullsFirst = o.nulls ? o.nulls === "first" : o.desc;
            return (x === null) === nullsFirst ? -1 : 1;
          }
          const c = compare(x, y);
          if (c) return o.desc ? -c : c;
        }
        return 0;
      });
      out = decorated.map((d) => d.r);
    }
    const off = st.offset ? Number(this.eval(st.offset, {})) : 0;
    const lim = st.limit ? this.eval(st.limit, {}) : null;
    if (off || lim !== null) out = out.slice(off, lim === null ? undefined : off + Number(lim));
    res.rows = out.map((o) => o.out);
    return res;
  }

  /* expression evaluation */
  col(e, c) {
    const find = (tables, env) => {
      if (e.table) {
        const s = tables.find((t) => t.alias === e.table);
        if (!s) return undefined;
        if (!s.cols.includes(e.name)) err("column " + e.table + "." + e.name + " does not exist", "Columns in " + e.table + ": " + s.cols.join(", ") + ".");
        return env[s.alias] ? env[s.alias][e.name] : null;
      }
      const hits = tables.filter((t) => t.cols.includes(e.name));
      if (hits.length > 1) err("column reference \"" + e.name + "\" is ambiguous", "More than one table has a column called " + e.name + ". Prefix it with the table: " + hits[0].alias + "." + e.name + ".");
      if (!hits.length) return undefined;
      return env[hits[0].alias] ? env[hits[0].alias][e.name] : null;
    };
    let v = find(c.tables || [], c.env || {});
    let o = c.outer;
    while (v === undefined && o) { v = find(o.tables || [], o.env || {}); o = o.outer; }
    if (v === undefined) {
      if (e.table) err("missing FROM-clause entry for table \"" + e.table + "\"", "Is the table in your FROM or JOIN, and is its name (or alias) spelled the same way?");
      const all = (c.tables || []).flatMap((t) => t.cols);
      err("column \"" + e.name + "\" does not exist", (all.length ? "Available columns: " + [...new Set(all)].join(", ") + ". " : "") + "If you meant a text value, wrap it in single quotes: '" + e.name + "'.");
    }
    return v;
  }
  eval(e, c) {
    switch (e.k) {
      case "lit": return e.v;
      case "col": return this.col(e, c);
      case "neg": { const v = this.eval(e.e, c); return v === null ? null : -Number(v); }
      case "not": { const v = this.eval(e.e, c); return v === null ? null : !truthy(v); }
      case "and": { const a = this.eval(e.l, c); if (a === false) return false; const b = this.eval(e.r, c); if (b === false) return false; return a === null || b === null ? null : truthy(a) && truthy(b); }
      case "or": { const a = this.eval(e.l, c); if (a !== null && truthy(a)) return true; const b = this.eval(e.r, c); if (b !== null && truthy(b)) return true; return a === null || b === null ? null : false; }
      case "bin": {
        const a = this.eval(e.l, c), b = this.eval(e.r, c);
        if (e.op === "||") return a === null || b === null ? null : String(a) + String(b);
        if (a === null || b === null) return null;
        if (["+", "-", "*", "/", "%"].includes(e.op)) {
          const x = Number(a), y = Number(b);
          if ((typeof a === "string" && isNaN(x)) || (typeof b === "string" && isNaN(y))) err("operator does not exist: text " + e.op + " integer", "You can't do arithmetic on text. Did you mean a number column?");
          if ((e.op === "/" || e.op === "%") && y === 0) err("division by zero");
          const r = e.op === "+" ? x + y : e.op === "-" ? x - y : e.op === "*" ? x * y : e.op === "/" ? (Number.isInteger(x) && Number.isInteger(y) && c.intDiv ? Math.trunc(x / y) : x / y) : x % y;
          return Math.round(r * 1e10) / 1e10;
        }
        const cmp = compare(a, b);
        return { "=": cmp === 0, "<>": cmp !== 0, "<": cmp < 0, "<=": cmp <= 0, ">": cmp > 0, ">=": cmp >= 0 }[e.op];
      }
      case "isnull": { const v = this.eval(e.e, c); return e.neg ? v !== null : v === null; }
      case "istrue": { const v = this.eval(e.e, c); const r = v === e.v; return e.neg ? !r : r; }
      case "distinctfrom": { const a = this.eval(e.l, c), b = this.eval(e.r, c); const same = a === null || b === null ? a === b : compare(a, b) === 0; return e.neg ? same : !same; }
      case "in": {
        const v = this.eval(e.e, c);
        if (v === null) return null;
        let sawNull = false;
        for (const x of e.list) { const y = this.eval(x, c); if (y === null) { sawNull = true; continue; } if (compare(v, y) === 0) return !e.neg; }
        return sawNull ? null : e.neg;
      }
      case "insub": {
        const v = this.eval(e.e, c);
        const r = this.select(e.sub, c);
        if (r.columns.length !== 1) err("subquery has too many columns");
        if (v === null) return null;
        const hit = r.rows.some((row) => row[0] !== null && compare(v, row[0]) === 0);
        return e.neg ? !hit : hit;
      }
      case "exists": return this.select(e.sub, c).rows.length > 0;
      case "subq": {
        const r = this.select(e.sub, c);
        if (r.columns.length !== 1) err("subquery must return only one column");
        if (r.rows.length > 1) err("more than one row returned by a subquery used as an expression");
        return r.rows.length ? r.rows[0][0] : null;
      }
      case "like": {
        const v = this.eval(e.e, c), p = this.eval(e.p, c);
        if (v === null || p === null) return null;
        const hit = likeRe(p, e.ci || this.sqlite).test(String(v));
        return e.neg ? !hit : hit;
      }
      case "between": {
        const v = this.eval(e.e, c), lo = this.eval(e.lo, c), hi = this.eval(e.hi, c);
        if (v === null || lo === null || hi === null) return null;
        const r = compare(v, lo) >= 0 && compare(v, hi) <= 0;
        return e.neg ? !r : r;
      }
      case "case": {
        const subj = e.subject ? this.eval(e.subject, c) : undefined;
        for (const [w, t] of e.whens) {
          const hit = e.subject ? (() => { const x = this.eval(w, c); return subj !== null && x !== null && compare(subj, x) === 0; })() : truthy(this.eval(w, c));
          if (hit) return this.eval(t, c);
        }
        return e.els ? this.eval(e.els, c) : null;
      }
      case "cast": {
        const v = this.eval(e.e, c);
        if (v === null) return null;
        if (["text", "varchar", "char"].includes(e.ty)) return typeof v === "boolean" ? String(v) : String(v);
        return coerce(v, e, null);
      }
      case "fn": return this.fn(e, c);
    }
    return err("cannot evaluate expression");
  }
  fn(e, c) {
    const f = e.fn;
    if (AGG.has(f)) {
      if (!c.group) err("aggregate functions are not allowed here", "Use aggregates in the SELECT list or HAVING.");
      let vals;
      if (e.star) vals = c.group.map(() => 1);
      else vals = c.group.map((env) => this.eval(e.args[0], { env, tables: c.tables, outer: c.outer })).filter((v) => v !== null);
      if (e.distinct) { const seen = new Set(); vals = vals.filter((v) => { const k = JSON.stringify(v); if (seen.has(k)) return false; seen.add(k); return true; }); }
      switch (f) {
        case "count": return vals.length;
        case "sum": return vals.length ? Math.round(vals.reduce((a, b) => a + Number(b), 0) * 1e10) / 1e10 : null;
        case "avg": return vals.length ? Math.round((vals.reduce((a, b) => a + Number(b), 0) / vals.length) * 1e10) / 1e10 : null;
        case "min": return vals.length ? vals.reduce((a, b) => (compare(b, a) < 0 ? b : a)) : null;
        case "max": return vals.length ? vals.reduce((a, b) => (compare(b, a) > 0 ? b : a)) : null;
        case "string_agg": { const sep = e.args[1] ? this.eval(e.args[1], {}) : ","; return vals.length ? vals.join(sep) : null; }
        case "array_agg": return vals.length ? "{" + vals.join(",") + "}" : null;
        case "bool_and": return vals.length ? vals.every(truthy) : null;
        case "bool_or": return vals.length ? vals.some(truthy) : null;
      }
    }
    const a = e.args.map((x) => this.eval(x, c));
    const s = (v) => (v === null ? null : String(v));
    switch (f) {
      case "lower": return a[0] === null ? null : s(a[0]).toLowerCase();
      case "upper": return a[0] === null ? null : s(a[0]).toUpperCase();
      case "length": case "char_length": return a[0] === null ? null : s(a[0]).length;
      case "trim": return a[0] === null ? null : s(a[0]).trim();
      case "concat": return a.filter((v) => v !== null).map(String).join("");
      case "coalesce": return a.find((v) => v !== null) ?? null;
      case "nullif": return a[0] !== null && a[1] !== null && compare(a[0], a[1]) === 0 ? null : a[0];
      case "round": { if (a[0] === null) return null; const p = a[1] == null ? 0 : Number(a[1]); return Number(Number(a[0]).toFixed(p)); }
      case "abs": return a[0] === null ? null : Math.abs(Number(a[0]));
      case "ceil": case "ceiling": return a[0] === null ? null : Math.ceil(Number(a[0]));
      case "floor": return a[0] === null ? null : Math.floor(Number(a[0]));
      case "substring": case "substr": return a[0] === null ? null : s(a[0]).substr(Number(a[1]) - 1, a[2] == null ? undefined : Number(a[2]));
      case "left": return a[0] === null ? null : s(a[0]).slice(0, Number(a[1]));
      case "right": return a[0] === null ? null : s(a[0]).slice(-Number(a[1]));
      case "replace": return a[0] === null ? null : s(a[0]).split(s(a[1])).join(s(a[2]));
      case "greatest": return a.filter((v) => v !== null).reduce((x, y) => (x === undefined || compare(y, x) > 0 ? y : x), undefined) ?? null;
      case "least": return a.filter((v) => v !== null).reduce((x, y) => (x === undefined || compare(y, x) < 0 ? y : x), undefined) ?? null;
      case "datetime": case "now": case "current_timestamp": return new Date().toISOString().replace("T", " ").slice(0, 19);
      case "current_date": return new Date().toISOString().slice(0, 10);
      case "random": return Math.random();
      case "extract": case "date_part": err("EXTRACT isn't supported in this lab. Compare dates as text instead, e.g. order_date >= '2026-01-01'.");
    }
    return err("function " + f + "() does not exist", "Supported functions include COUNT, SUM, AVG, MIN, MAX, ROUND, LOWER, UPPER, LENGTH, COALESCE and CONCAT.");
  }

  /** Schema description for the sidebar. */
  schema() {
    return Object.values(this.tables).map((t) => ({
      name: t.name, rows: t.rows.length,
      cols: t.cols.map((c) => ({
        name: c.name, type: showType(c),
        pk: !!(t.pk && t.pk.includes(c.name)),
        fk: (t.fks.find((f) => f.cols.includes(c.name)) || {}).table || null,
        notNull: c.notNull, unique: t.uniques.some((u) => u.length === 1 && u[0] === c.name),
      })),
    }));
  }
}

function outName(e) {
  if (e.k === "col") return e.name;
  if (e.k === "fn") return e.fn;
  if (e.k === "cast") return outName(e.e) === "?column?" ? e.ty : outName(e.e);
  if (e.k === "case") return "case";
  return "?column?";
}

/** Compare two results as sets (or in order). Values are compared loosely (numbers to 6 dp). */
function sameRows(a, b, ordered) {
  if (!a || !b || a.length !== b.length) return false;
  const norm = (r) => JSON.stringify(r.map((v) => (typeof v === "number" ? Math.round(v * 1e6) / 1e6 : v)));
  const x = a.map(norm), y = b.map(norm);
  if (!ordered) { x.sort(); y.sort(); }
  return x.every((v, i) => v === y[i]);
}

  return { Database, SqlError, sameRows, showType };
}

const ENGINE = sqlEngine();
export const Database = ENGINE.Database;
export const SqlError = ENGINE.SqlError;
export const sameRows = ENGINE.sameRows;
export const showType = ENGINE.showType;
