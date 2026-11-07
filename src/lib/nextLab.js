/* The in-browser Next.js lab: an App Router emulation on React 19.
   - File-based routing from app/…/page.tsx, with layouts, loading.tsx, not-found.tsx, route groups,
     [dynamic] and [...catchAll] segments, params/searchParams props (as promises, like Next 15+).
   - Server components: files without "use client" are rendered by a mini RSC resolver that calls
     (and awaits) them before React renders; their console output goes to the "terminal".
     Hooks or event handlers in a server component produce Next-style errors.
   - Client components ("use client") render in React normally, with next/navigation hooks.
   - Navigation runs through a React state holding a promise of the next tree, so useTransition
     and loading.tsx behave like the real thing.
   - Packages: next/link, next/navigation, next/image, next/font/google, next/form, server-only,
     better-sqlite3 (backed by the lab's SQL engine; a .db file holds SQL to seed it). */

import { loadCompiler, vendorUrl } from "./reactLab.js";
import { consoleShim } from "./consoleShim.js";
import { sqlEngine } from "./sql.js";
import { MOCK_API_SCRIPT } from "./mockApi.js";

const isCode = (f) => /\.(tsx?|jsx?)$/.test(f);

export function compileNext(ts, files) {
  const mods = {}, errors = [], client = [], serverActions = [];
  for (const [name, code] of Object.entries(files)) {
    if (!isCode(name)) continue;
    const r = ts.transpileModule(code, {
      fileName: name, reportDiagnostics: true,
      compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
    });
    for (const d of r.diagnostics || []) {
      const pos = d.file && d.start != null ? d.file.getLineAndCharacterOfPosition(d.start) : null;
      errors.push(`${name}${pos ? `:${pos.line + 1}:${pos.character + 1}` : ""}  ${ts.flattenDiagnosticMessageText(d.messageText, "\n")}`);
    }
    mods[name] = r.outputText;
    const head = code.replace(/^(\s|\/\/[^\n]*\n|\/\*[\s\S]*?\*\/)*/, "");
    if (/^["']use client["']/.test(head)) client.push(name);
    if (/^["']use server["']/.test(head)) serverActions.push(name);
  }
  return { mods, errors, client, serverActions };
}

/* ───────────── runtime (inside the iframe; self-contained) ───────────── */
function syNextRuntime(cfg, TESTS, ENGINE) {
  var h = React.createElement;
  var files = cfg.files, mods = cfg.mods, isClient = {}, isServerAction = {};
  cfg.client.forEach(function (f) { isClient[f] = true; });
  cfg.serverActions.forEach(function (f) { isServerAction[f] = true; });
  var post = function (m) { m.__synext = cfg.pid; parent.postMessage(m, "*"); };
  var str = function (x) { try { return typeof x === "string" ? x : x instanceof Error ? x.name + ": " + x.message : JSON.stringify(x); } catch (e) { return String(x); } };
  var serverLogs = [];
  var serverConsole = {};
  ["log", "info", "warn", "error", "table"].forEach(function (k) {
    serverConsole[k] = function () { var m = [].slice.call(arguments).map(str).join(" "); serverLogs.push({ k: k, m: m }); post({ server: true, k: k, m: m }); };
  });

  /* ── history ── */
  var entries = [], idx = -1, listeners = [], keyN = 0;
  function parseUrl(p) { var u = new URL(String(p || "/"), "http://localhost:3000"); return { pathname: decodeURI(u.pathname), search: u.search, href: u.pathname + u.search + u.hash, key: "k" + keyN++ }; }
  var H = {
    loc: function () { return entries[idx]; },
    push: function (p) { entries = entries.slice(0, idx + 1); entries.push(parseUrl(p)); idx++; },
    replace: function (p) { entries[idx] = parseUrl(p); },
    go: function (d) { var j = Math.max(0, Math.min(entries.length - 1, idx + d)); if (j === idx) return false; idx = j; return true; },
  };
  H.push(cfg.startPath || "/");
  var notifyUrl = function () { var l = H.loc(); post({ route: true, path: l.href, canBack: idx > 0, canFwd: idx < entries.length - 1 }); listeners.slice().forEach(function (f) { f(); }); };

  /* ── module system ── */
  var cache = {};
  function resolveFile(name, from) {
    var n = name;
    if (n.indexOf("@/") === 0) n = n.slice(2);
    else if (/^\.\.?\//.test(n)) {
      var parts = (from || "").split("/").slice(0, -1);
      n.split("/").forEach(function (p) { if (p === "..") parts.pop(); else if (p !== ".") parts.push(p); });
      n = parts.join("/");
    } else return null;
    var c = [n, n + ".tsx", n + ".ts", n + ".jsx", n + ".js", n + "/index.tsx", n + "/index.ts", n + "/index.js"];
    for (var i = 0; i < c.length; i++) if (mods[c[i]] != null || (files[c[i]] != null && /\.(css|json|db)$/.test(c[i]))) return c[i];
    return null;
  }
  function load(file) {
    if (cache[file]) return cache[file].exports;
    var module = { exports: {} };
    cache[file] = module;
    if (/\.css$/.test(file)) return module.exports;
    if (/\.json$/.test(file)) { module.exports = JSON.parse(files[file]); return module.exports; }
    var con = isClient[file] ? console : serverConsole;
    var fn = new Function("require", "module", "exports", "console", "process", mods[file] + "\n//# sourceURL=" + file);
    fn(function (n) { return req(n, file); }, module, module.exports, con, { env: Object.assign({ NODE_ENV: "development" }, cfg.env || {}) });
    var ex = module.exports;
    var mark = function (k) { if (typeof ex[k] === "function") { if (isClient[file]) ex[k].__syClient = file; if (isServerAction[file]) ex[k].__syAction = true; } };
    Object.keys(ex).forEach(mark);
    return ex;
  }
  var PKG = {};
  function req(name, from) {
    if (name === "react") return React;
    if (name === "react-dom" || name === "react-dom/client") return ReactDOM;
    if (name === "react/jsx-runtime" || name === "react/jsx-dev-runtime") return window.__syJSX;
    if (name === "server-only") { if (isClient[from]) throw new Error("'server-only' cannot be imported from a Client Component module (" + from + "). It should only be used from a Server Component."); return {}; }
    if (name === "client-only") return {};
    if (PKG[name]) return PKG[name];
    var f = resolveFile(name, from);
    if (f) {
      if (isClient[from] && !isClient[f] && /better-sqlite3|server-only/.test(mods[f] || "")) throw new Error("You're importing " + f + " (server code: it uses the database) from the Client Component " + from + ". Fetch data in a Server Component and pass it down as props.");
      if (isClient[from] && !isClient[f] && mods[f] != null) { var save = isClient[f]; isClient[f] = true; try { return load(f); } finally { isClient[f] = save; } }
      return load(f);
    }
    if (/\.(css|scss)$/.test(name)) return {};
    throw new Error("Module not found: Can't resolve '" + name + "' in " + from);
  }

  /* ── routes from the file tree ── */
  var pages = Object.keys(mods).filter(function (f) { return /^app\/(.*\/)?page\.(tsx|jsx|ts|js)$/.test(f); }).map(function (f) {
    var dir = f.replace(/\/page\.\w+$/, "");
    var segs = dir.split("/").slice(1).filter(function (s) { return !/^\(.*\)$/.test(s); });
    var score = segs.reduce(function (a, s) { return a + (/^\[\.\.\./.test(s) ? 1 : /^\[/.test(s) ? 5 : 10); }, 0);
    return { file: f, dir: dir, segs: segs, score: score };
  }).sort(function (a, b) { return b.score - a.score || b.segs.length - a.segs.length; });
  function match(pathname) {
    var us = pathname.split("/").filter(Boolean).map(decodeURIComponent);
    for (var i = 0; i < pages.length; i++) {
      var p = pages[i], params = {}, ok = true;
      for (var j = 0; j < p.segs.length; j++) {
        var s = p.segs[j];
        if (/^\[\.\.\.(\w+)\]$/.test(s)) { if (us.length <= j) { ok = false; break; } params[s.slice(4, -1)] = us.slice(j); j = p.segs.length; us = us.slice(0, j); break; }
        if (j >= us.length) { ok = false; break; }
        if (/^\[(\w+)\]$/.test(s)) params[s.slice(1, -1)] = us[j];
        else if (s !== us[j]) { ok = false; break; }
      }
      if (ok && (p.segs.some(function (s) { return /^\[\.\.\./.test(s); }) || us.length === p.segs.length)) return { page: p, params: params };
    }
    return null;
  }
  var special = function (dir, name) { var c = ["tsx", "jsx", "ts", "js"].map(function (e) { return dir + "/" + name + "." + e; }); for (var i = 0; i < c.length; i++) if (mods[c[i]] != null) return c[i]; return null; };
  var dirsOf = function (dir) { var parts = dir.split("/"), out = []; for (var i = 1; i <= parts.length; i++) out.push(parts.slice(0, i).join("/")); return out; };

  function keyed(arr) {
    var out = [];
    (function flat(a, prefix) {
      a.forEach(function (x, i) {
        if (Array.isArray(x)) flat(x, prefix + i + ":");
        else if (x == null || typeof x === "boolean") return;
        else if (React.isValidElement(x)) out.push(x.key == null ? React.cloneElement(x, { key: "." + prefix + i }) : x);
        else out.push(x);
      });
    })(arr, "");
    return out;
  }
  function Resolved(p) { return React.use(p.promise); }
  Resolved.__syClient = "runtime";

  /* ── mini RSC: resolve server components to plain React elements ── */
  function NextError(kind, extra) { var e = new Error(kind); e.__next = kind; Object.assign(e, extra || {}); return e; }
  var describe = function (t) { return typeof t === "string" ? t : (t && (t.displayName || t.name)) || "Component"; };
  async function resolveNode(node, inClient) {
    if (node == null || typeof node === "boolean" || typeof node === "string" || typeof node === "number") return node;
    if (Array.isArray(node)) return Promise.all(node.map(function (n) { return resolveNode(n, inClient); }));
    if (typeof node.then === "function") return resolveNode(await node, inClient);
    if (!React.isValidElement(node)) {
      if (typeof node === "object" && typeof node[Symbol.iterator] === "function") return resolveNode(Array.from(node), inClient);
      return node;
    }
    var type = node.type, props = node.props || {};
    var withChildren = async function () {
      if (props.children === undefined) return node;
      var kids = await resolveNode(props.children, inClient);
      if (Array.isArray(kids)) kids = keyed(kids);
      return React.cloneElement(node, { children: kids });
    };
    if (inClient) return node;
    if (typeof type === "string") {
      for (var k in props) if (/^on[A-Z]/.test(k) && typeof props[k] === "function") throw new Error("Event handlers cannot be passed to Client Component props.\n  <" + type + " " + k + "={function}>\nIf you need interactivity, move this into a Client Component (a file that starts with \"use client\").");
      return withChildren();
    }
    if (type === React.Fragment || type === React.Suspense || type === React.StrictMode) return withChildren();
    if (typeof type === "function" && type.__syClient) {
      for (var p in props) if (p !== "children" && typeof props[p] === "function" && !props[p].__syAction) throw new Error("Functions cannot be passed directly to Client Components unless you explicitly expose it by marking it with \"use server\".\n  <" + describe(type) + " " + p + "={function}>");
      return withChildren();
    }
    if (typeof type === "function" && !(type.prototype && type.prototype.isReactComponent)) {
      var out;
      try { out = type(props); }
      catch (e) {
        if (/Invalid hook call|Cannot read properties of null \(reading 'use/.test(e && e.message)) throw new Error(describe(type) + " uses a React hook, but it's a Server Component. Hooks like useState and useEffect only work in Client Components: add \"use client\" at the top of the file.");
        throw e;
      }
      return resolveNode(await out, false);
    }
    return node; // context providers, memo, lazy and other exotic types render as-is
  }
  function unwrapDocument(node) {
    if (Array.isArray(node)) return keyed(node.map(unwrapDocument));
    if (!node || !React.isValidElement(node)) return node;
    var t = node.type, p = node.props || {};
    if (t === "html") { if (p.lang) document.documentElement.lang = p.lang; if (p.className) document.documentElement.className = p.className; return unwrapDocument(p.children); }
    if (t === "head") return null;
    if (t === "body") { document.body.className = p.className || ""; if (p.style) Object.assign(document.body.style, p.style); return unwrapDocument(p.children); }
    if (p.children !== undefined && (t === React.Fragment || typeof t === "string")) { var c = unwrapDocument(p.children); return React.cloneElement(node, { children: Array.isArray(c) ? keyed(c) : c }); }
    return node;
  }

  var currentParams = {};
  async function renderUrl(href) {
    var loc = parseUrl(href), m = match(loc.pathname);
    var sp = {}; new URLSearchParams(loc.search).forEach(function (v, k) { if (k in sp) sp[k] = [].concat(sp[k], v); else sp[k] = v; });
    var rootLayouts = dirsOf("app").map(function (d) { return special(d, "layout"); }).filter(Boolean);
    var layoutChain = m ? dirsOf(m.page.dir).map(function (d) { return special(d, "layout"); }).filter(Boolean) : rootLayouts;
    var wrap = function (inner, chain) { return chain.slice().reverse().reduce(function (acc, f) { return h(load(f).default, { children: acc, params: Promise.resolve(m ? m.params : {}) }); }, inner); };
    var notFoundTree = function () {
      var nf = special("app", "not-found");
      return wrap(nf ? h(load(nf).default) : h("main", { style: { padding: 40, textAlign: "center", fontFamily: "system-ui" } }, h("h1", null, "404"), h("p", null, "This page could not be found.")), rootLayouts);
    };
    try {
      if (!m) { document.title = "404: This page could not be found."; return unwrapDocument(await resolveNode(notFoundTree())); }
      currentParams = m.params;
      var mod = load(m.page.file);
      if (typeof mod.default !== "function") throw new Error("The default export of " + m.page.file + " is not a React Component.");
      var meta = mod.generateMetadata ? await mod.generateMetadata({ params: Promise.resolve(m.params), searchParams: Promise.resolve(sp) }) : mod.metadata;
      if (!meta) layoutChain.slice().reverse().some(function (f) { var mm = load(f).metadata; if (mm) { meta = mm; return true; } return false; });
      var title = meta && (typeof meta.title === "string" ? meta.title : meta.title && (meta.title.absolute || meta.title.default));
      if (title) document.title = title;
      var pageEl = h(mod.default, { params: Promise.resolve(m.params), searchParams: Promise.resolve(sp) });
      var loading = loadingFor(href);
      if (loading) {
        // like loading.tsx: layouts render now, the page streams in behind a Suspense boundary
        var pagePromise = resolveNode(pageEl).then(unwrapDocument, function (e) {
          if (e && e.__next === "NEXT_NOT_FOUND") { var nf = special("app", "not-found"); return nf ? resolveNode(h(load(nf).default)) : h("h1", null, "404"); }
          throw e;
        });
        pagePromise.catch(function () {});
        // keyed by path, like a route segment: search-param changes reuse the boundary, so transitions keep the old UI
        pageEl = h(React.Suspense, { key: loc.pathname, fallback: loading }, h(Resolved, { promise: pagePromise }));
      }
      return unwrapDocument(await resolveNode(wrap(pageEl, layoutChain)));
    } catch (e) {
      if (e && e.__next === "NEXT_NOT_FOUND") return unwrapDocument(await resolveNode(notFoundTree()));
      if (e && e.__next === "NEXT_REDIRECT") { H.replace(e.url); notifyUrl(); return renderUrl(e.url); }
      throw e;
    }
  }
  function loadingFor(href) {
    var m = match(parseUrl(href).pathname);
    if (!m) return null;
    var dirs = dirsOf(m.page.dir), lf = null;
    for (var i = dirs.length - 1; i >= 0 && !lf; i--) lf = special(dirs[i], "loading");
    return lf ? h(load(lf).default) : null;
  }

  /* ── next/* packages ── */
  var useLoc = function () {
    var st = React.useState(H.loc()), set = st[1];
    React.useEffect(function () { var f = function () { set(H.loc()); }; listeners.push(f); return function () { listeners = listeners.filter(function (x) { return x !== f; }); }; }, []);
    return H.loc();
  };
  var navigate = function (href, replace) { window.__syNavigate(href, replace); };
  var toHref = function (href) {
    if (typeof href === "string") return href;
    var q = href.query ? "?" + new URLSearchParams(href.query).toString() : "";
    return (href.pathname || H.loc().pathname) + q + (href.hash ? "#" + href.hash : "");
  };
  var abs = function (href) { return new URL(href, "http://localhost:3000" + H.loc().pathname).pathname + new URL(href, "http://localhost:3000" + H.loc().pathname).search; };
  function Link(props) {
    var href = toHref(props.href), rest = {};
    for (var k in props) if (["href", "prefetch", "replace", "scroll", "shallow", "passHref", "legacyBehavior"].indexOf(k) < 0) rest[k] = props[k];
    rest.href = href;
    rest.onClick = function (e) {
      if (props.onClick) props.onClick(e);
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || props.target === "_blank" || /^(https?:|mailto:)/.test(href)) return;
      e.preventDefault();
      navigate(abs(href), props.replace);
    };
    return h("a", rest);
  }
  Link.__syClient = "next/link";
  PKG["next/link"] = { __esModule: true, default: Link };
  PKG["next/navigation"] = {
    usePathname: function () { return useLoc().pathname; },
    useSearchParams: function () { var l = useLoc(); return React.useMemo(function () { return new URLSearchParams(l.search); }, [l.search]); },
    useParams: function () { useLoc(); return currentParams; },
    useRouter: function () { return { push: function (href) { navigate(abs(href), false); }, replace: function (href) { navigate(abs(href), true); }, back: function () { window.__syGo(-1); }, forward: function () { window.__syGo(1); }, refresh: function () { navigate(H.loc().href, true); }, prefetch: function () {} }; },
    notFound: function () { throw NextError("NEXT_NOT_FOUND"); },
    redirect: function (url) { throw NextError("NEXT_REDIRECT", { url: url }); },
    permanentRedirect: function (url) { throw NextError("NEXT_REDIRECT", { url: url }); },
  };
  PKG["next/image"] = { __esModule: true, default: function Image(p) {
    var src = typeof p.src === "object" && p.src ? p.src.src : p.src;
    if (p.alt === undefined) throw new Error('Image with src "' + src + '" is missing required "alt" property. Use alt="" for decorative images.');
    if (!p.fill && (p.width == null || p.height == null)) throw new Error('Image with src "' + src + '" is missing required "' + (p.width == null ? "width" : "height") + '" property. Use "fill" if the size is set by CSS.');
    var rest = {};
    for (var k in p) if (["fill", "priority", "quality", "placeholder", "blurDataURL", "loader", "unoptimized", "sizes"].indexOf(k) < 0) rest[k] = p[k];
    rest.src = src; rest.loading = p.priority ? "eager" : "lazy"; rest.decoding = "async";
    rest.style = Object.assign({ color: "transparent" }, p.fill ? { position: "absolute", inset: 0, width: "100%", height: "100%" } : {}, p.style || {});
    if (p.fill) { delete rest.width; delete rest.height; }
    rest["data-nimg"] = p.fill ? "fill" : "1";
    return h("img", rest);
  } };
  var fontCss = {};
  var makeFont = function (family) {
    return function (opts) {
      opts = opts || {};
      var cls = "__font_" + family.replace(/\W/g, "_");
      var fam = "'" + family.replace(/_/g, " ") + "', " + (/mono|code/i.test(family) ? "ui-monospace, monospace" : /serif|playfair|merri|lora/i.test(family) ? "Georgia, serif" : "system-ui, sans-serif");
      if (!fontCss[cls]) { fontCss[cls] = 1; var st = document.createElement("style"); st.textContent = "." + cls + "{font-family:" + fam + "}" + (opts.variable ? "." + cls + "_var{" + opts.variable + ":" + fam + "}" : ""); document.head.appendChild(st); }
      return { className: cls, style: { fontFamily: fam }, variable: opts.variable ? cls + "_var" : undefined };
    };
  };
  PKG["next/font/google"] = new Proxy({}, { get: function (_, name) { return name === "__esModule" ? true : makeFont(String(name)); } });
  PKG["next/font/local"] = { __esModule: true, default: function (o) { return makeFont("Local")(o); } };
  var Form = function Form(p) {
    var rest = {};
    for (var k in p) if (["action", "replace", "scroll", "prefetch"].indexOf(k) < 0) rest[k] = p[k];
    rest.action = typeof p.action === "string" ? p.action : undefined;
    rest.onSubmit = function (e) {
      if (p.onSubmit) p.onSubmit(e);
      if (e.defaultPrevented) return;
      e.preventDefault();
      var fd = new FormData(e.currentTarget);
      if (typeof p.action === "function") { p.action(fd); return; }
      var qs = new URLSearchParams();
      fd.forEach(function (v, k2) { if (typeof v === "string") qs.append(k2, v); });
      var s = qs.toString();
      navigate(abs((p.action || H.loc().pathname) + (s ? "?" + s : "")), p.replace);
    };
    return h("form", rest);
  };
  Form.__syClient = "next/form";
  PKG["next/form"] = { __esModule: true, default: Form };
  PKG["next"] = {};
  PKG["next/cache"] = { revalidatePath: function () {}, revalidateTag: function () {}, unstable_cache: function (f) { return f; } };
  /* better-sqlite3 on the lab's SQL engine */
  var dbs = {}, engine = null;
  function literal(v) { if (v === null || v === undefined) return "NULL"; if (typeof v === "number") return String(v); if (typeof v === "boolean") return v ? "1" : "0"; return "'" + String(v).replace(/'/g, "''") + "'"; }
  function bind(sql, params) {
    var named = params.length === 1 && params[0] && typeof params[0] === "object" && !Array.isArray(params[0]) ? params[0] : null;
    if (params.length === 1 && Array.isArray(params[0])) params = params[0];
    var i = 0, out = "", q = null;
    for (var k = 0; k < sql.length; k++) {
      var c = sql[k];
      if (q) { out += c; if (c === q) q = null; continue; }
      if (c === "'" || c === '"') { q = c; out += c; continue; }
      if (c === "?" && !named) { if (i >= params.length) throw new RangeError("Too few parameter values were provided"); out += literal(params[i++]); continue; }
      if (named && /[@:$]/.test(c) && /[A-Za-z_]/.test(sql[k + 1] || "")) { var mm = sql.slice(k).match(/^[@:$][A-Za-z_]\w*/)[0]; out += literal(named[mm.slice(1)]); k += mm.length - 1; continue; }
      out += c;
    }
    return out;
  }
  function SqliteDatabase(filename) {
    if (!(this instanceof SqliteDatabase)) return new SqliteDatabase(filename);
    var key = String(filename || ":memory:").replace(/^\.\//, "");
    if (!dbs[key]) {
      engine = engine || ENGINE();
      var db = new engine.Database({ sqlite: true });
      if (files[key] && /\b(CREATE|INSERT)\b/i.test(files[key])) db.exec(files[key]);
      dbs[key] = db;
    }
    this.db = dbs[key]; this.name = key; this.open = true;
  }
  var rowsOf = function (r) { return r && r.rows ? r.rows.map(function (row) { var o = {}; r.columns.forEach(function (c, i) { o[c] = row[i]; }); return o; }) : []; };
  var wrapE = function (e) { var msg = e.message || String(e); var m2 = msg.match(/relation "(\w+)" does not exist/); if (m2) msg = "no such table: " + m2[1]; m2 = msg.match(/column "(\w+)" does not exist/); if (m2) msg = "no such column: " + m2[1]; var err = new Error(msg); err.code = "SQLITE_ERROR"; return err; };
  SqliteDatabase.prototype.prepare = function (sql) {
    var db = this.db, run = function (params) { try { return db.exec(bind(sql, params)); } catch (e) { throw wrapE(e); } };
    return {
      all: function () { var r = run([].slice.call(arguments)); return rowsOf(r[r.length - 1]); },
      get: function () { var r = run([].slice.call(arguments)); return rowsOf(r[r.length - 1])[0]; },
      run: function () { var r = run([].slice.call(arguments)); var x = r[r.length - 1] || {}; return { changes: x.rowCount || 0, lastInsertRowid: x.lastId }; },
      pluck: function () { return this; }, raw: function () { return this; },
    };
  };
  SqliteDatabase.prototype.exec = function (sql) { try { this.db.exec(sql); } catch (e) { throw wrapE(e); } return this; };
  SqliteDatabase.prototype.pragma = function () { return []; };
  SqliteDatabase.prototype.close = function () { this.open = false; return this; };
  SqliteDatabase.prototype.transaction = function (fn) { return fn; };
  PKG["better-sqlite3"] = { __esModule: true, default: SqliteDatabase };

  /* ── the app shell: navigation state holds a promise of the next tree ── */
  var rootSetter = null;
  class Boundary extends React.Component {
    constructor(p) { super(p); this.state = { error: null, href: p.href }; }
    static getDerivedStateFromError(error) { return { error: error }; }
    static getDerivedStateFromProps(p, st) { return p.href !== st.href ? { error: null, href: p.href } : null; }
    componentDidCatch(error) { post({ server: true, k: "error", m: "⨯ " + (error && error.message || error) }); }
    render() {
      if (this.state.error) return h("div", { role: "alert", style: { position: "fixed", inset: 0, background: "rgba(10,10,10,.92)", color: "#fff", fontFamily: "ui-monospace,monospace", padding: 24, overflow: "auto", zIndex: 99999 } },
        h("div", { style: { color: "#ff6b6b", fontWeight: 700, marginBottom: 8 } }, "Unhandled Runtime Error"), h("pre", { style: { whiteSpace: "pre-wrap", fontSize: 13 } }, String(this.state.error && this.state.error.message || this.state.error)));
      return this.props.children;
    }
  }
  function Shell() {
    var st = React.useState(function () { return { href: H.loc().href, promise: renderUrl(H.loc().href) }; });
    rootSetter = st[1];
    return h(Boundary, { href: st[0].href + "#" + (st[0].n || 0) }, h(React.Suspense, { fallback: null }, h(Resolved, { promise: st[0].promise })));
  }
  var navN = 0;
  window.__syNavigate = function (href, replace) {
    (replace ? H.replace : H.push)(href);
    notifyUrl();
    var target = H.loc().href;
    React.startTransition(function () { rootSetter({ href: target, n: ++navN, promise: renderUrl(target) }); });
    try { scrollTo(0, 0); } catch (e) { /* ignore */ }
  };
  window.__syGo = function (d) { if (H.go(d)) { notifyUrl(); var t = H.loc().href; React.startTransition(function () { rootSetter({ href: t, n: ++navN, promise: renderUrl(t) }); }); } };
  addEventListener("message", function (e) { var d = e.data; if (!d || d.__synav !== cfg.pid) return; if (typeof d.delta === "number") window.__syGo(d.delta); else if (d.path != null) window.__syNavigate(d.path); });

  var root = null;
  function start() {
    if (root) { try { root.unmount(); } catch (e) { /* ignore */ } }
    document.body.innerHTML = '<div id="__next"></div>';
    root = ReactDOM.createRoot(document.getElementById("__next"));
    root.render(h(Shell));
    notifyUrl();
  }

  if (!TESTS) { try { start(); } catch (e) { console.error(e.name + ": " + e.message); } return; }

  /* ── tests ── */
  var tick = function (ms) { return new Promise(function (r) { setTimeout(r, ms == null ? 30 : ms); }); };
  var clean = function (t) { return String(t || "").replace(/\s+/g, " ").trim(); };
  var el = function (s) { var x = typeof s === "string" ? document.querySelector(s) : s; if (!x) throw new Error("Couldn't find " + s + " on the page."); return x; };
  var hlp = {
    $: function (s) { return document.querySelector(s); },
    $$: function (s) { return Array.from(document.querySelectorAll(s)); },
    text: function (s) { return clean(s ? (typeof s === "string" ? (document.querySelector(s) || {}).textContent : s.textContent) : document.body.textContent); },
    tick: tick,
    until: async function (fn, ms) { var t0 = Date.now(); for (;;) { try { var v = fn(); if (v) return v; } catch (e) { /* retry */ } if (Date.now() - t0 > (ms || 3000)) return false; await tick(25); } },
    navigate: async function (p) { window.__syNavigate(p); await tick(80); },
    back: async function () { window.__syGo(-1); await tick(80); },
    path: function () { return H.loc().href; },
    click: async function (s) { el(s).click(); await tick(60); },
    type: async function (s, v) { var x = el(s); Object.getOwnPropertyDescriptor(x.tagName === "TEXTAREA" ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype, "value").set.call(x, v); x.dispatchEvent(new Event("input", { bubbles: true })); x.dispatchEvent(new Event("change", { bubbles: true })); await tick(); },
    submit: async function (s) { var f = el(s || "form"); f = f.tagName === "FORM" ? f : f.closest("form"); f.requestSubmit(); await tick(80); },
    link: function (re) { return hlp.$$("a").find(function (a) { return typeof re === "string" ? clean(a.textContent) === re : re.test(clean(a.textContent)); }); },
    serverLogs: serverLogs,
    src: function (f) { return files[f] || ""; },
    title: function () { return document.title; },
    isClient: function (f) { return !!isClient[f]; },
  };
  async function runAll() {
    var out = [];
    for (var i = 0; i < TESTS.length; i++) {
      var ok = false, err = "";
      try {
        entries = []; idx = -1; H.push(cfg.startPath || "/"); cache = {}; dbs = {}; serverLogs.length = 0;
        start();
        await hlp.until(function () { return document.getElementById("__next").childNodes.length; }, 2500);
        await tick(60);
        ok = !!(await Promise.race([TESTS[i](hlp), new Promise(function (_, rej) { setTimeout(function () { rej(new Error("A test timed out after 6s.")); }, 6000); })]));
      } catch (e) { err = e && e.message ? e.message : String(e); }
      var alert = document.querySelector("[role=alert]");
      if (!ok && !err && alert && /Unhandled Runtime Error/.test(alert.textContent)) err = clean(alert.textContent).slice(0, 300);
      out.push({ ok: ok, err: err });
    }
    parent.postMessage({ __syt: cfg.testId, results: out }, "*");
  }
  runAll();
}

const safe = (js) => js.replace(/<\/script/gi, "<\\/script");

export function buildNextDoc({ compiled, files, id, startPath, env, tests, testId }) {
  const css = Object.entries(files).filter(([f]) => /\.css$/.test(f)).map(([, c]) => c).join("\n");
  if (compiled.errors.length) {
    return `<!doctype html><html><body style="margin:0;font:13px/1.5 ui-monospace,monospace;background:#111;color:#fff;padding:20px"><div style="color:#ff6b6b;font-weight:700">Build Error</div><pre style="white-space:pre-wrap">${compiled.errors.join("\n").replace(/&/g, "&amp;").replace(/</g, "&lt;")}</pre></body></html>`;
  }
  const cfg = { pid: id || "", testId: testId || "", files, mods: compiled.mods, client: compiled.client, serverActions: compiled.serverActions, startPath: startPath || "/", env: env || {} };
  const testSrc = tests ? "[" + tests.map((t) => "(" + t.fn.toString() + ")").join(",") + "]" : "null";
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${css}</style>${id ? consoleShim(id) : ""}<script>${safe(MOCK_API_SCRIPT)}<\/script><script src="${vendorUrl("react-19.2.8.js")}"><\/script></head><body><script>(${safe(syNextRuntime.toString())})(${safe(JSON.stringify(cfg))}, ${safe(testSrc)}, ${safe(sqlEngine.toString())});<\/script></body></html>`;
}

export { loadCompiler };
