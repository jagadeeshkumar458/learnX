/* npm packages for the React lab, injected into the sandboxed iframe with Function.prototype.toString().
   Each factory must be self-contained: (React, ctx) => module. ctx = { history, supabase, send }.
   - react-router-dom: BrowserRouter/HashRouter/MemoryRouter, Routes/Route (nested, index, layout, splat),
     Outlet (+ context), Link/NavLink (relative paths), Navigate, useParams, useNavigate, useLocation,
     useSearchParams, useOutletContext, useMatch.
   - @supabase/supabase-js: an in-memory Postgres-ish table store with select/insert/update/delete/upsert,
     filters, ordering, aggregates (col.sum(), count()), embedded selects, realtime channels, auth
     (sign up/in/out, sessions with JWTs) and simple row level security. */

export function routerPkg(React, ctx) {
  var h = React.createElement, H = ctx.history;
  var LocCtx = React.createContext(null), RouteCtx = React.createContext({ params: {}, bases: [""], outlet: null, outletContext: undefined });

  function useHistoryLocation() {
    var st = React.useState(H.location()), loc = st[0], set = st[1];
    React.useEffect(function () { return H.listen(function () { set(H.location()); }); }, []);
    return loc;
  }
  function Router(props) { var loc = useHistoryLocation(); return h(LocCtx.Provider, { value: loc }, props.children); }
  function BrowserRouter(p) { return h(Router, p); }
  function HashRouter(p) { return h(Router, p); }
  function MemoryRouter(p) {
    var once = React.useRef(false);
    if (!once.current) { once.current = true; if (p.initialEntries && p.initialEntries.length) H.reset(p.initialEntries[p.initialIndex == null ? p.initialEntries.length - 1 : p.initialIndex]); }
    return h(Router, p);
  }
  var useLocation = function () { var l = React.useContext(LocCtx); if (!l) throw new Error("useLocation() may be used only in the context of a <Router> component. Wrap your app in <BrowserRouter>."); return l; };

  var clean = function (p) { return ("/" + p).replace(/\/+/g, "/").replace(/(.)\/$/, "$1"); };
  function join(a, b) { if (!b) return a || "/"; if (b[0] === "/") return clean(b); return clean((a || "") + "/" + b); }
  function routesFrom(children) {
    var out = [];
    React.Children.forEach(children, function (el) {
      if (!React.isValidElement(el)) return;
      if (el.type === React.Fragment) { out.push.apply(out, routesFrom(el.props.children)); return; }
      if (el.type !== Route) throw new Error("[" + (el.type && el.type.name || el.type) + "] is not a <Route> component. All children of <Routes> must be a <Route> or <React.Fragment>.");
      out.push({ path: el.props.path, index: !!el.props.index, element: el.props.element === undefined ? (el.props.Component ? h(el.props.Component) : undefined) : el.props.element, children: routesFrom(el.props.children) });
    });
    return out;
  }
  function flatten(routes, parentPath, chain, out) {
    routes.forEach(function (r) {
      var full = r.index ? parentPath : r.path != null ? join(parentPath, r.path) : parentPath;
      var c = chain.concat([{ route: r, full: full }]);
      if (r.children.length) flatten(r.children, full, c, out);
      if (r.index || r.path != null) out.push({ chain: c, full: full, index: r.index });
    });
    return out;
  }
  function score(full, index) {
    var segs = full.split("/").filter(Boolean), s = segs.length * 2 + (index ? 2 : 0);
    segs.forEach(function (g) { s += g === "*" ? -2 : g[0] === ":" ? 3 : 10; });
    return s;
  }
  function match(pattern, pathname, end) {
    var ps = pattern.split("/").filter(Boolean), us = pathname.split("/").filter(Boolean), params = {};
    for (var i = 0; i < ps.length; i++) {
      if (ps[i] === "*") { params["*"] = us.slice(i).map(decodeURIComponent).join("/"); return { params: params, pathname: "/" + us.slice(0, i).join("/") }; }
      if (i >= us.length) return null;
      if (ps[i][0] === ":") { var opt = /\?$/.test(ps[i]); params[ps[i].slice(1).replace(/\?$/, "")] = decodeURIComponent(us[i]); void opt; }
      else if (ps[i].toLowerCase() !== us[i].toLowerCase()) return null;
    }
    if (end !== false && us.length !== ps.length) return null;
    return { params: params, pathname: "/" + us.slice(0, ps.length).join("/") };
  }
  function Routes(props) {
    var ctxLoc = useLocation();
    var loc = props.location ? (typeof props.location === "string" ? { pathname: props.location } : props.location) : ctxLoc;
    var parent = React.useContext(RouteCtx);
    var parentBase = parent.bases[parent.bases.length - 1] || "";
    var branches = flatten(routesFrom(props.children), parentBase, [], []);
    var best = null, bestScore = -1e9, bestM = null;
    branches.forEach(function (b) {
      var m = match(b.full, loc.pathname, true);
      var sc = score(b.full, b.index);
      if (m && sc > bestScore) { best = b; bestScore = sc; bestM = m; }
    });
    if (!best) { console.warn('No routes matched location "' + loc.pathname + '"'); return null; }
    var params = Object.assign({}, parent.params, bestM.params);
    var bases = parent.bases.slice();
    var render = function (i, outletContext) {
      if (i >= best.chain.length) return null;
      var c = best.chain[i];
      var m2 = match(c.full, loc.pathname, false);
      var lvlBases = bases.concat(best.chain.slice(0, i + 1).map(function (x) { var mm = match(x.full, loc.pathname, false); return mm ? mm.pathname : x.full; }));
      var value = { params: params, bases: lvlBases, outlet: function (ctxVal) { return render(i + 1, ctxVal); }, outletContext: outletContext, pathname: m2 ? m2.pathname : c.full };
      var el = c.route.element === undefined ? h(Outlet) : c.route.element;
      return h(RouteCtx.Provider, { value: value, key: c.full + i }, el);
    };
    return render(0);
  }
  function Route() { throw new Error("A <Route> is only ever to be used as the child of <Routes> element, never rendered directly. Please wrap your <Route> in a <Routes>."); }
  function Outlet(props) { var c = React.useContext(RouteCtx); return c.outlet ? c.outlet(props && props.context !== undefined ? props.context : c.outletContext) : null; }
  var useOutlet = function () { var c = React.useContext(RouteCtx); return c.outlet ? c.outlet(c.outletContext) : null; };
  var useOutletContext = function () { return React.useContext(RouteCtx).outletContext; };
  var useParams = function () { return React.useContext(RouteCtx).params; };

  function resolve(to, rc, loc, relative) {
    if (to == null) return loc.pathname + (loc.search || "");
    if (typeof to === "object") { var p = resolve(to.pathname || "", rc, loc, relative); return p + (to.search ? (to.search[0] === "?" ? to.search : "?" + to.search) : "") + (to.hash || ""); }
    to = String(to);
    if (to === "" || to[0] === "?" || to[0] === "#") return (rc.pathname || loc.pathname) + to;
    if (to[0] === "/") return to;
    var qi = to.search(/[?#]/), path = qi >= 0 ? to.slice(0, qi) : to, rest = qi >= 0 ? to.slice(qi) : "";
    var segs = path.split("/");
    var baseList = rc.bases.slice(1);
    var base = rc.pathname || baseList[baseList.length - 1] || "/";
    var idx = baseList.length - 1;
    var cur = base.split("/").filter(Boolean);
    segs.forEach(function (s) {
      if (s === "..") {
        if (relative === "path") cur.pop();
        else { idx--; while (idx >= 0 && baseList[idx] === base) idx--; base = idx >= 0 ? baseList[idx] : "/"; cur = base.split("/").filter(Boolean); }
      } else if (s && s !== ".") cur.push(s);
    });
    return "/" + cur.join("/") + rest;
  }
  var useResolved = function (to, relative) { var rc = React.useContext(RouteCtx), loc = useLocation(); return resolve(to, rc, loc, relative); };
  function useNavigate() {
    var rc = React.useContext(RouteCtx), loc = useLocation();
    return React.useCallback(function (to, o) {
      if (typeof to === "number") { H.go(to); return; }
      var p = resolve(to, rc, loc, o && o.relative);
      (o && o.replace ? H.replace : H.push)(p, o && o.state);
    }, [rc, loc]);
  }
  function Link(props) {
    var to = useResolved(props.to, props.relative), rest = {};
    for (var k in props) if (["to", "replace", "state", "relative", "reloadDocument", "preventScrollReset", "viewTransition"].indexOf(k) < 0) rest[k] = props[k];
    rest.href = to;
    rest.onClick = function (e) {
      if (props.onClick) props.onClick(e);
      if (e.defaultPrevented || e.button > 0 || e.metaKey || e.ctrlKey || e.shiftKey || props.target === "_blank") return;
      e.preventDefault();
      (props.replace ? H.replace : H.push)(to, props.state);
    };
    return h("a", rest);
  }
  function NavLink(props) {
    var loc = useLocation(), to = useResolved(props.to, props.relative);
    var path = to.split(/[?#]/)[0];
    var isActive = loc.pathname === path || (!props.end && path !== "/" && loc.pathname.indexOf(path + "/") === 0);
    var st = { isActive: isActive, isPending: false, isTransitioning: false };
    var rest = {};
    for (var k in props) if (k !== "end" && k !== "caseSensitive") rest[k] = props[k];
    rest.className = typeof props.className === "function" ? props.className(st) : [props.className, isActive ? "active" : ""].filter(Boolean).join(" ") || undefined;
    rest.style = typeof props.style === "function" ? props.style(st) : props.style;
    if (typeof props.children === "function") rest.children = props.children(st);
    if (isActive) rest["aria-current"] = "page";
    return h(Link, rest);
  }
  function Navigate(props) {
    var nav = useNavigate();
    React.useEffect(function () { nav(props.to, { replace: props.replace, state: props.state, relative: props.relative }); }, []);
    return null;
  }
  function useSearchParams() {
    var loc = useLocation();
    var sp = React.useMemo(function () { return new URLSearchParams(loc.search); }, [loc.search]);
    var set = React.useCallback(function (next, o) {
      var v = typeof next === "function" ? next(new URLSearchParams(loc.search)) : next;
      var s = new URLSearchParams(v).toString();
      (o && o.replace ? H.replace : H.push)(loc.pathname + (s ? "?" + s : ""), o && o.state);
    }, [loc]);
    return [sp, set];
  }
  var useMatch = function (pattern) { var loc = useLocation(); var m = match(typeof pattern === "string" ? pattern : pattern.path, loc.pathname, !(pattern && pattern.end === false)); return m; };
  var useHref = function (to) { return useResolved(to); };
  var mod = { BrowserRouter: BrowserRouter, HashRouter: HashRouter, MemoryRouter: MemoryRouter, Routes: Routes, Route: Route, Outlet: Outlet, Link: Link, NavLink: NavLink, Navigate: Navigate,
    useParams: useParams, useNavigate: useNavigate, useLocation: useLocation, useSearchParams: useSearchParams, useOutletContext: useOutletContext, useOutlet: useOutlet, useMatch: useMatch, useHref: useHref,
    matchPath: function (p, path) { return match(typeof p === "string" ? p : p.path, path, true); }, createSearchParams: function (x) { return new URLSearchParams(x); } };
  mod.default = mod;
  return mod;
}

export function supabasePkg(React, ctx) {
  var S = ctx.supabase; // shared store: { tables, users, session, listeners, authListeners, rls, onSignup, seq }
  var clone = function (x) { return JSON.parse(JSON.stringify(x)); };
  function err(message, code, status) { return { message: message, code: code || "PGRST", details: null, hint: null, status: status || 400 }; }
  function b64(o) { return btoa(unescape(encodeURIComponent(JSON.stringify(o)))).replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_"); }
  function makeSession(u) {
    var now = Math.floor(Date.now() / 1000);
    var token = b64({ alg: "HS256", typ: "JWT" }) + "." + b64({ sub: u.id, email: u.email, role: "authenticated", aud: "authenticated", iat: now, exp: now + 3600, user_metadata: u.user_metadata }) + "." + b64("signature-" + u.id).slice(0, 43);
    var user = { id: u.id, email: u.email, role: "authenticated", aud: "authenticated", user_metadata: u.user_metadata || {}, created_at: u.created_at };
    return { access_token: token, token_type: "bearer", expires_in: 3600, expires_at: now + 3600, refresh_token: Math.random().toString(36).slice(2), user: user };
  }
  var uid = function () { return S.session ? S.session.user.id : null; };
  function rlsAllows(table, row, op) {
    var rule = S.rls && S.rls[table];
    if (!rule) return true;
    if (!uid()) return false;
    if (rule === "authenticated") return true;
    if (op === "select" && S.rlsReadAll && S.rlsReadAll[table]) return true;
    return row[rule] === uid();
  }
  function emit(table, type, nw, old) {
    S.listeners.forEach(function (l) {
      if (l.table && l.table !== table) return;
      if (l.event !== "*" && l.event !== type) return;
      if (!rlsAllows(table, nw || old, "select")) return;
      setTimeout(function () { l.cb({ schema: "public", table: table, commit_timestamp: new Date().toISOString(), eventType: type, new: nw ? clone(nw) : {}, old: old ? clone(old) : {}, errors: null }); }, 30);
    });
  }
  function parseSelect(cols) {
    var out = [], depth = 0, cur = "";
    String(cols || "*").split("").forEach(function (ch) { if (ch === "(") depth++; if (ch === ")") depth--; if (ch === "," && depth === 0) { out.push(cur.trim()); cur = ""; } else cur += ch; });
    if (cur.trim()) out.push(cur.trim());
    return out.map(function (c) {
      var alias = null, m = c.match(/^(\w+):(.+)$/);
      if (m && !/\(/.test(m[1])) { alias = m[1]; c = m[2].trim(); }
      var agg = c.match(/^(?:(\w+)\.)?(sum|avg|min|max|count)\(\)$/);
      if (agg) return { agg: agg[2], col: agg[1] || null, as: alias || agg[2] };
      var emb = c.match(/^(\w+)(?:!\w+)?\((.*)\)$/);
      if (emb) return { embed: emb[1], cols: emb[2], as: alias || emb[1] };
      return { col: c, as: alias || c };
    });
  }
  function project(table, rows, cols) {
    var items = parseSelect(cols);
    var aggs = items.filter(function (i) { return i.agg; });
    var embed = function (row, it) {
      var t = S.tables[it.embed];
      if (!t) return null;
      var fk = Object.keys(row).find(function (k) { return k === it.embed.replace(/s$/, "") + "_id" || k === it.embed + "_id"; });
      var back = table.replace(/s$/, "") + "_id";
      var rel = fk ? t.filter(function (r) { return r.id === row[fk]; }) : t.filter(function (r) { return r[back] === row.id; });
      rel = rel.filter(function (r) { return rlsAllows(it.embed, r, "select"); });
      var proj = project(it.embed, rel, it.cols);
      return fk ? proj[0] || null : proj;
    };
    if (aggs.length) {
      var keys = items.filter(function (i) { return i.col && !i.agg && !i.embed; });
      var groups = {};
      rows.forEach(function (r) { var k = JSON.stringify(keys.map(function (i) { return r[i.col]; })); (groups[k] = groups[k] || []).push(r); });
      if (!rows.length && !keys.length) groups["[]"] = [];
      return Object.keys(groups).map(function (k) {
        var g = groups[k], o = {};
        keys.forEach(function (i) { o[i.as] = g[0][i.col]; });
        aggs.forEach(function (a) {
          var vals = a.col ? g.map(function (r) { return Number(r[a.col]); }) : g;
          o[a.as] = a.agg === "count" ? g.length : a.agg === "sum" ? vals.reduce(function (s, v) { return s + v; }, 0) : a.agg === "avg" ? (vals.length ? vals.reduce(function (s, v) { return s + v; }, 0) / vals.length : null) : a.agg === "min" ? Math.min.apply(null, vals) : Math.max.apply(null, vals);
        });
        return o;
      });
    }
    return rows.map(function (r) {
      var o = {};
      items.forEach(function (i) {
        if (i.col === "*") Object.assign(o, clone(r));
        else if (i.embed) o[i.as] = embed(r, i);
        else o[i.as] = r[i.col] === undefined ? null : clone(r[i.col]);
      });
      return o;
    });
  }
  function Query(table) {
    this.table = table; this.filters = []; this.op = "select"; this.cols = "*"; this.orders = []; this.lim = null; this.rng = null; this.one = null; this.returning = false; this.countOpt = null;
  }
  var Q = Query.prototype;
  Q.select = function (cols, o) { if (this.op === "select") this.cols = cols || "*"; else { this.returning = true; this.cols = cols || "*"; } if (o && o.count) this.countOpt = o.count; if (o && o.head) this.head = true; return this; };
  Q.insert = function (v) { this.op = "insert"; this.values = [].concat(v); return this; };
  Q.upsert = function (v) { this.op = "upsert"; this.values = [].concat(v); return this; };
  Q.update = function (v) { this.op = "update"; this.values = v; return this; };
  Q.delete = function () { this.op = "delete"; return this; };
  var f = function (name, test) { Q[name] = function (c, v) { this.filters.push({ c: c, v: v, t: test }); return this; }; };
  f("eq", function (a, b) { return a == b; }); f("neq", function (a, b) { return a != b; });
  f("gt", function (a, b) { return a > b; }); f("gte", function (a, b) { return a >= b; });
  f("lt", function (a, b) { return a < b; }); f("lte", function (a, b) { return a <= b; });
  f("like", function (a, b) { return new RegExp("^" + String(b).replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/%/g, ".*").replace(/_/g, ".") + "$").test(a); });
  f("ilike", function (a, b) { return new RegExp("^" + String(b).replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/%/g, ".*").replace(/_/g, ".") + "$", "i").test(a); });
  f("in", function (a, b) { return b.indexOf(a) >= 0; }); f("is", function (a, b) { return a === b || (b === null && a == null); });
  Q.match = function (o) { var self = this; Object.keys(o).forEach(function (k) { self.eq(k, o[k]); }); return this; };
  Q.order = function (c, o) { this.orders.push({ c: c, asc: !o || o.ascending !== false }); return this; };
  Q.limit = function (n) { this.lim = n; return this; };
  Q.range = function (a, b) { this.rng = [a, b]; return this; };
  Q.single = function () { this.one = "single"; return this; };
  Q.maybeSingle = function () { this.one = "maybe"; return this; };
  Q.abortSignal = function () { return this; };
  Q.throwOnError = function () { this.throws = true; return this; };
  Q.run = function () {
    var self = this, t = S.tables[this.table];
    if (!t) return { data: null, error: err('relation "public.' + this.table + '" does not exist', "42P01", 404), count: null, status: 404, statusText: "Not Found" };
    var pass = function (r) { return self.filters.every(function (x) { return x.t(r[x.c], x.v); }); };
    var result, status = 200;
    if (this.op === "select") {
      var rows = t.filter(function (r) { return rlsAllows(self.table, r, "select") && pass(r); });
      this.orders.slice().reverse().forEach(function (o) { rows.sort(function (a, b) { var x = a[o.c], y = b[o.c]; return (x < y ? -1 : x > y ? 1 : 0) * (o.asc ? 1 : -1); }); });
      var count = rows.length;
      if (this.rng) rows = rows.slice(this.rng[0], this.rng[1] + 1);
      if (this.lim != null) rows = rows.slice(0, this.lim);
      result = this.head ? null : project(this.table, rows, this.cols);
      if (this.countOpt) this._count = count;
    } else if (this.op === "insert" || this.op === "upsert") {
      var made = [];
      for (var i = 0; i < this.values.length; i++) {
        var v = clone(this.values[i]);
        var cols = S.columns && S.columns[this.table];
        if (cols) { var bad = Object.keys(v).find(function (k) { return cols.indexOf(k) < 0; }); if (bad) return { data: null, error: err("Could not find the '" + bad + "' column of '" + this.table + "' in the schema cache", "PGRST204"), status: 400 }; }
        if (this.op === "upsert" && v.id != null) { var ex = t.find(function (r) { return r.id === v.id; }); if (ex) { Object.assign(ex, v); made.push(ex); emit(this.table, "UPDATE", ex, null); continue; } }
        var defaults = (S.defaults && S.defaults[this.table]) || {};
        Object.keys(defaults).forEach(function (k) { if (v[k] === undefined) v[k] = defaults[k] === "auth.uid()" ? uid() : defaults[k] === "now()" ? new Date().toISOString() : defaults[k]; });
        if (v.id === undefined) v.id = (S.seq[this.table] = (S.seq[this.table] || t.reduce(function (m, r) { return Math.max(m, typeof r.id === "number" ? r.id : 0); }, 0)) + 1);
        if (!rlsAllows(this.table, v, "insert")) return { data: null, error: err('new row violates row-level security policy for table "' + this.table + '"', "42501", 403), status: 403 };
        t.push(v); made.push(v);
        emit(this.table, "INSERT", v, null);
      }
      status = 201;
      result = this.returning ? project(this.table, made, this.cols) : null;
    } else if (this.op === "update") {
      var up = t.filter(function (r) { return pass(r) && rlsAllows(self.table, r, "update"); });
      up.forEach(function (r) { var old = clone(r); Object.assign(r, clone(self.values)); emit(self.table, "UPDATE", r, old); });
      result = this.returning ? project(this.table, up, this.cols) : null;
      status = this.returning ? 200 : 204;
    } else if (this.op === "delete") {
      var del = t.filter(function (r) { return pass(r) && rlsAllows(self.table, r, "delete"); });
      S.tables[this.table] = t.filter(function (r) { return del.indexOf(r) < 0; });
      del.forEach(function (r) { emit(self.table, "DELETE", null, { id: r.id }); });
      result = this.returning ? project(this.table, del, this.cols) : null;
      status = this.returning ? 200 : 204;
    }
    if (this.one) {
      if (!result || result.length !== 1) {
        if (this.one === "maybe" && result && !result.length) return { data: null, error: null, status: 200 };
        return { data: null, error: err("JSON object requested, multiple (or no) rows returned", "PGRST116", 406), status: 406 };
      }
      result = result[0];
    }
    return { data: result, error: null, count: this.countOpt ? this._count : null, status: status, statusText: status === 201 ? "Created" : "OK" };
  };
  Q.then = function (res, rej) {
    var self = this;
    return new Promise(function (r) { setTimeout(function () { r(self.run()); }, 60 + Math.random() * 80); }).then(function (out) { if (self.throws && out.error) throw out.error; return out; }).then(res, rej);
  };
  function notifyAuth(event) { S.authListeners.slice().forEach(function (cb) { setTimeout(function () { cb(event, S.session); }, 0); }); }
  var delay = function (v) { return new Promise(function (r) { setTimeout(function () { r(v); }, 120); }); };
  var auth = {
    signUp: function (o) {
      o = o || {};
      if (!o.email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(o.email)) return delay({ data: { user: null, session: null }, error: err("Unable to validate email address: invalid format", "validation_failed", 400) });
      if (!o.password || o.password.length < 6) return delay({ data: { user: null, session: null }, error: err("Password should be at least 6 characters.", "weak_password", 422) });
      if (S.users.some(function (u) { return u.email.toLowerCase() === o.email.toLowerCase(); })) return delay({ data: { user: null, session: null }, error: err("User already registered", "user_already_exists", 422) });
      var u = { id: "u-" + Math.random().toString(16).slice(2, 10) + "-" + Date.now().toString(16).slice(-4), email: o.email, password: o.password, user_metadata: (o.options && o.options.data) || {}, created_at: new Date().toISOString() };
      S.users.push(u);
      if (S.onSignup) { var t = S.onSignup.table, row = {}; Object.keys(S.onSignup.row).forEach(function (k) { var src = S.onSignup.row[k]; row[k] = src === "id" ? u.id : src === "email" ? u.email : /^meta\./.test(src) ? u.user_metadata[src.slice(5)] || null : src; }); (S.tables[t] = S.tables[t] || []).push(row); }
      S.session = makeSession(u);
      notifyAuth("SIGNED_IN");
      return delay({ data: { user: S.session.user, session: S.session }, error: null });
    },
    signInWithPassword: function (o) {
      var u = S.users.find(function (x) { return x.email.toLowerCase() === String(o && o.email).toLowerCase() && x.password === (o && o.password); });
      if (!u) return delay({ data: { user: null, session: null }, error: err("Invalid login credentials", "invalid_credentials", 400) });
      S.session = makeSession(u);
      notifyAuth("SIGNED_IN");
      return delay({ data: { user: S.session.user, session: S.session }, error: null });
    },
    signOut: function () { S.session = null; notifyAuth("SIGNED_OUT"); return delay({ error: null }); },
    // read the session when the promise resolves, like the real client (which awaits its storage)
    getSession: function () { return delay(null).then(function () { return { data: { session: S.session }, error: null }; }); },
    getUser: function () { return delay(null).then(function () { return S.session ? { data: { user: S.session.user }, error: null } : { data: { user: null }, error: err("Auth session missing!", "session_missing", 401) }; }); },
    onAuthStateChange: function (cb) {
      S.authListeners.push(cb);
      setTimeout(function () { cb("INITIAL_SESSION", S.session); }, 0);
      return { data: { subscription: { unsubscribe: function () { S.authListeners = S.authListeners.filter(function (x) { return x !== cb; }); } } } };
    },
  };
  function channel(name) {
    var subs = [];
    var ch = {
      name: name,
      on: function (type, filter, cb) { if (type === "postgres_changes") subs.push({ event: (filter && filter.event) || "*", table: filter && filter.table, cb: cb }); return ch; },
      subscribe: function (cb) { subs.forEach(function (s) { S.listeners.push(s); }); if (cb) setTimeout(function () { cb("SUBSCRIBED"); }, 20); return ch; },
      unsubscribe: function () { S.listeners = S.listeners.filter(function (l) { return subs.indexOf(l) < 0; }); return Promise.resolve("ok"); },
    };
    return ch;
  }
  function createClient(url, key) {
    if (!url || !/^https?:\/\//.test(url)) throw new Error("Invalid supabaseUrl: Must be a valid HTTP or HTTPS URL.");
    if (!key) throw new Error("supabaseKey is required.");
    return { from: function (t) { return new Query(t); }, auth: auth, channel: channel, removeChannel: function (c) { return c.unsubscribe(); }, removeAllChannels: function () { S.listeners = []; return Promise.resolve([]); }, rpc: function () { return Promise.resolve({ data: null, error: err("rpc() isn't available in this lab") }); } };
  }
  return { createClient: createClient, default: { createClient: createClient } };
}
