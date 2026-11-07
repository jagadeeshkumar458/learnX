import React, { useMemo, useState } from "react";
import { useProgress } from "../../lib/progress.jsx";
import Editor from "./Editor.jsx";
import { ChallengeShell } from "./Challenge.jsx";
import { Database, SqlError, sameRows } from "../../lib/sql.js";

/** Build a fresh database from a block's seed SQL (cached per seed string). */
const seeded = new Map();
export function freshDb(seed) {
  if (!seed) return new Database();
  if (!seeded.has(seed)) { const d = new Database(); d.exec(seed); seeded.set(seed, d); }
  return seeded.get(seed).clone();
}

/** Run learner SQL against a fresh copy of the seed. */
function runSql(seed, sql) {
  const db = freshDb(seed);
  try { return { db, results: db.exec(sql), error: null }; }
  catch (e) {
    if (!(e instanceof SqlError)) throw e;
    return { db, results: e.results || [], error: { message: e.message, hint: e.hint, statement: e.statement } };
  }
}

const fmt = (v) => (v === null ? <span className="sqlnull">NULL</span> : typeof v === "boolean" ? String(v) : typeof v === "number" ? String(Math.round(v * 1e6) / 1e6) : String(v));

function ResultTable({ r, max = 100 }) {
  return (
    <div className="sqlres-table">
      <table>
        <thead><tr>{r.columns.map((c, i) => <th key={i} scope="col">{c}</th>)}</tr></thead>
        <tbody>
          {r.rows.slice(0, max).map((row, i) => <tr key={i}>{row.map((v, j) => <td key={j} className={typeof v === "number" ? "num" : ""}>{fmt(v)}</td>)}</tr>)}
        </tbody>
      </table>
      {r.rows.length === 0 && <div className="sqlempty">0 rows</div>}
    </div>
  );
}

function Results({ run }) {
  if (!run) return <div className="sqlhint">Press <b>Run</b> (or Ctrl + Enter) to execute your SQL.</div>;
  const shown = run.results.slice(-6);
  return (
    <div className="sqlresults" aria-live="polite">
      {run.results.length > shown.length && <div className="sqlmeta">…{run.results.length - shown.length} earlier statements ran successfully</div>}
      {shown.map((r, i) => (
        <div key={i} className="sqlstmt">
          <div className="sqlmeta"><code>{r.text.length > 90 ? r.text.slice(0, 90) + "…" : r.text}</code></div>
          {r.rows ? (
            <>
              <ResultTable r={r} />
              <div className="sqlmeta ok">{r.rows.length} row{r.rows.length === 1 ? "" : "s"}{r.command !== "SELECT" ? " · " + r.command + " " + r.rowCount : ""}</div>
            </>
          ) : <div className="sqlmeta ok">✓ {r.command}{/INSERT|UPDATE|DELETE/.test(r.command) ? " " + r.rowCount : ""}{r.notice ? " · NOTICE: " + r.notice : ""}</div>}
        </div>
      ))}
      {run.error && (
        <div className="sqlerr" role="alert">
          <b>ERROR:</b> {run.error.message}
          {run.error.hint && <div className="sqlerr-hint">HINT: {run.error.hint}</div>}
          {run.error.statement && <div className="sqlmeta"><code>{run.error.statement.slice(0, 120)}</code></div>}
        </div>
      )}
      {!run.results.length && !run.error && <div className="sqlhint">Nothing to run yet.</div>}
    </div>
  );
}

function Schema({ db, onBrowse }) {
  const schema = db ? db.schema() : [];
  if (!schema.length) return <div className="sqlschema"><div className="sqlschema-h">Tables</div><div className="sqlhint">No tables yet.</div></div>;
  return (
    <div className="sqlschema">
      <div className="sqlschema-h">Tables</div>
      {schema.map((t) => (
        <details key={t.name} open={schema.length <= 3}>
          <summary><span className="sqltname">{t.name}</span> <span className="sqlcount">{t.rows} rows</span>{onBrowse && <button className="linkish" onClick={(e) => { e.preventDefault(); onBrowse(t.name); }}>browse</button>}</summary>
          <ul>{t.cols.map((c) => (
            <li key={c.name}>
              <span className="sqlcol">{c.pk ? "🔑 " : c.fk ? "🔗 " : ""}{c.name}</span>
              <span className="sqltype">{c.type}{c.notNull && !c.pk ? " · not null" : ""}{c.unique && !c.pk ? " · unique" : ""}{c.fk ? " → " + c.fk : ""}</span>
            </li>
          ))}</ul>
        </details>
      ))}
    </div>
  );
}

/** `sqlplay` block: a SQL editor over a fresh copy of a seeded database. */
export function SqlPlayground({ b, k }) {
  const { S, update } = useProgress();
  const [sql, setSql] = useState(() => (S.code[k] && S.code[k].sql) ?? b.sql ?? "");
  const [run, setRun] = useState(null);
  const base = useMemo(() => freshDb(b.seed), [b.seed]);
  const exec = (text = sql) => {
    setRun(runSql(b.seed, text));
    update((s) => { s.code = { ...s.code, [k]: { sql: text } }; });
  };
  const browse = (t) => { const text = "SELECT * FROM " + t + ";"; setSql(text); setRun(runSql(b.seed, text)); };
  return (
    <div className="play sqlplay">
      {b.task && <div className="play-task"><span className="pill build">Try it</span><span dangerouslySetInnerHTML={{ __html: b.task }} /></div>}
      <div className="sqlgrid">
        <Editor tabs={["sql"]} values={{ sql }} idPrefix={"sq-" + k.replace(/\W/g, "-")} onChange={(t, v) => setSql(v)} onRun={() => exec()} />
        <Schema db={run ? run.db : base} onBrowse={browse} />
      </div>
      <div className="pbar">
        <button className="mini run" onClick={() => exec()}>▶ Run</button>
        <button className="mini" onClick={() => { setSql(b.sql || ""); setRun(null); update((s) => { const c = { ...s.code }; delete c[k]; s.code = c; }); }}>Reset</button>
        <span className="sp" />
        <span className="tiny" style={{ margin: 0 }}><span className="sql-badge">🐘 SQL</span> each run starts from a fresh copy of the database · Ctrl + Enter</span>
      </div>
      <Results run={run} />
    </div>
  );
}

/** Helper handed to `sqlch` tests: `(t) => boolean`. */
function makeHelper(b, sql, run) {
  const selects = run.results.filter((r) => r.rows);
  const last = selects[selects.length - 1] || null;
  const t = {
    results: run.results,
    selects,
    last,
    src: sql,
    db: run.db,
    /** Rows (as objects) from a query against the database after the learner's SQL ran. */
    rows: (q) => run.db.query(q),
    /** Does the learner's last SELECT return the same rows as the reference query on a fresh database? */
    expect: (ref, { ordered = false, which } = {}) => {
      const r = which != null ? selects[which] : last;
      if (!r) return false;
      const want = freshDb(b.seed).exec(ref).pop();
      return sameRows(r.rows, want.rows, ordered);
    },
    cols: (which) => { const r = which != null ? selects[which] : last; return r ? r.columns : []; },
    /** Is there a statement that matches this regex (case-insensitive, whitespace-normalised)? */
    has: (re) => re.test(sql.replace(/--.*$/gm, "").replace(/\s+/g, " ")),
  };
  return t;
}

/** `sqlch` block: a SQL challenge. Tests are `(t) => boolean`. */
export function SqlChallenge({ b, k }) {
  const evaluate = async (v) => {
    const run = runSql(b.seed, v.sql || "");
    const t = makeHelper(b, v.sql || "", run);
    const results = b.tests.map((test) => { try { return !!test.fn(t); } catch (e) { return false; } });
    return { results, error: run.error ? "ERROR: " + run.error.message + (run.error.hint ? " — HINT: " + run.error.hint : "") : "" };
  };
  return (
    <ChallengeShell b={b} k={k} tabs={["sql"]} starter={{ sql: b.sql || "" }} tests={b.tests} evaluate={evaluate}
      solution={b.solution ? { sql: b.solution } : undefined}
      extra={(vals) => <SqlChallengePreview b={b} sql={vals.sql} />} />
  );
}

function SqlChallengePreview({ b, sql }) {
  const [run, setRun] = useState(null);
  const base = useMemo(() => freshDb(b.seed), [b.seed]);
  return (
    <div className="chal-preview">
      <div className="chal-preview-h">Try your query</div>
      <div className="sqlchal">
        <div className="sqlchal-bar"><button className="mini run" onClick={() => setRun(runSql(b.seed, sql || ""))}>▶ Run query</button><span className="tiny">See your results before you check them.</span></div>
        <div className="sqlgrid compact"><Results run={run} /><Schema db={run ? run.db : base} /></div>
      </div>
    </div>
  );
}

/** `sqlinj` block: a login form that builds SQL by string concatenation, next to the safe version. */
export function SqlInjection({ b }) {
  const [user, setUser] = useState("ada");
  const [pass, setPass] = useState("wrong-password");
  const [safe, setSafe] = useState(false);
  const db = useMemo(() => freshDb(b.seed), [b.seed]);
  const unsafeSql = "SELECT * FROM users WHERE username = '" + user + "' AND password = '" + pass + "'";
  let outcome;
  if (safe) {
    const rows = db.tables.users.rows.filter((r) => r.username === user && r.password === pass);
    outcome = { ok: rows.length > 0, rows: rows.length, text: rows.length ? "Logged in as " + rows[0].username : "Invalid username or password" };
  } else {
    try {
      const r = db.clone().exec(unsafeSql).pop();
      outcome = { ok: r.rows.length > 0, rows: r.rows.length, text: r.rows.length ? "Logged in as " + r.rows[0][1] + (r.rows.length > 1 ? " (the query matched " + r.rows.length + " users!)" : "") : "Invalid username or password" };
    } catch (e) { outcome = { ok: false, error: true, text: "Database error: " + e.message }; }
  }
  const attacks = [["Normal login", "ada", "correct-horse"], ["Wrong password", "ada", "wrong-password"], ["Comment out the password", "ada' --", "anything"], ["Always true", "x' OR '1'='1' --", "anything"]];
  return (
    <div className="sqlinj">
      <div className="sqlinj-head">
        <b>Try to log in</b>
        <label className="sqlinj-toggle"><input type="checkbox" checked={safe} onChange={(e) => setSafe(e.target.checked)} /> Use a parameterised query</label>
      </div>
      <div className="npresets">{attacks.map(([label, u, p]) => <button key={label} className="chip-btn" onClick={() => { setUser(u); setPass(p); }}>{label}</button>)}</div>
      <div className="sqlinj-form">
        <label>Username <input value={user} onChange={(e) => setUser(e.target.value)} spellCheck="false" /></label>
        <label>Password <input value={pass} onChange={(e) => setPass(e.target.value)} spellCheck="false" /></label>
      </div>
      <div className="sqlmeta">{safe ? "Query sent to the database (values travel separately):" : "Query built by string concatenation:"}</div>
      <pre className="nbodyout sqlinj-q">{safe ? "SELECT * FROM users WHERE username = $1 AND password = $2\n-- $1 = " + JSON.stringify(user) + "\n-- $2 = " + JSON.stringify(pass) : unsafeSql}</pre>
      <div className={"sqlinj-out " + (outcome.error ? "bad" : outcome.ok ? (user === "ada" && pass === "correct-horse" ? "ok" : "bad") : "")} aria-live="polite">{outcome.text}</div>
    </div>
  );
}
