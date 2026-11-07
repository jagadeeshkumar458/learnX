/* npm packages for the Node lab. Each is a factory `(ctx) => module`, serialised with toString() and
   evaluated inside the sandboxed server iframe, so every factory must be self-contained.
   ctx = { builtin, files, key(path), engine() (the SQL engine), send(msg) }.
   They implement the parts of each package's API that the course uses, with the same names. */

function expressPkg(ctx) {
  var http = ctx.builtin.http, path = ctx.builtin.path, fs = ctx.builtin.fs;
  var STATUS = http.STATUS_CODES;
  var MIME = { ".html": "text/html; charset=utf-8", ".htm": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".mjs": "text/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8", ".txt": "text/plain; charset=utf-8", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".gif": "image/gif", ".ico": "image/x-icon", ".webp": "image/webp" };
  var SHORT = { html: "text/html; charset=utf-8", json: "application/json; charset=utf-8", text: "text/plain; charset=utf-8", js: "text/javascript; charset=utf-8", css: "text/css; charset=utf-8" };

  function compile(p, end) {
    if (p instanceof RegExp) return { re: p, keys: [] };
    var keys = [], src = "";
    var s = String(p);
    for (var i = 0; i < s.length; i++) {
      var c = s[i];
      if (c === ":" || c === "*") {
        var m = s.slice(i + 1).match(/^[A-Za-z0-9_]+/);
        var name = m ? m[0] : String(keys.length);
        keys.push(name);
        src += c === ":" ? "([^/]+?)" : "(.*)";
        i += m ? m[0].length : 0;
      } else if (c === "{") src += "(?:";
      else if (c === "}") src += ")?";
      else src += /[.+?^$()|[\]\\]/.test(c) ? "\\" + c : c;
    }
    src = src.replace(/\/$/, "");
    return { re: new RegExp("^" + src + (end ? "\\/?$" : "(?=\\/|$)"), "i"), keys: keys };
  }
  function parseQuery(search) {
    var q = {};
    new URLSearchParams(search).forEach(function (v, k) {
      if (k in q) q[k] = [].concat(q[k], v); else q[k] = v;
    });
    return q;
  }
  function ensureRoute(stack) { return stack; }

  function makeRouter() {
    var stack = [];
    function router(req, res, out) { handle(stack, req, res, out); }
    router.stack = stack;
    router.use = function () {
      var a = [].slice.call(arguments), p = "/";
      if (typeof a[0] === "string" || a[0] instanceof RegExp || Array.isArray(a[0])) p = a.shift();
      [].concat.apply([], a).forEach(function (fn) {
        if (typeof fn !== "function") throw new TypeError("app.use() requires a middleware function");
        [].concat(p).forEach(function (pp) { var c = compile(pp === "/" ? "" : pp, false); stack.push({ mount: true, re: c.re, keys: c.keys, fn: fn, path: pp }); });
      });
      return router;
    };
    ["get", "post", "put", "patch", "delete", "options", "head", "all"].forEach(function (m) {
      router[m] = function (p) {
        if (m === "get" && arguments.length === 1 && typeof p === "string" && router.settings) return router.settings[p];
        var fns = [].concat.apply([], [].slice.call(arguments, 1));
        fns.forEach(function (fn) {
          if (typeof fn !== "function") throw new TypeError("Route." + m + "() requires a callback function but got a " + typeof fn);
          [].concat(p).forEach(function (pp) { var c = compile(pp, true); stack.push({ method: m === "all" ? null : m.toUpperCase(), re: c.re, keys: c.keys, fn: fn, path: pp }); });
        });
        return router;
      };
    });
    router.route = function (p) {
      var r = {};
      ["get", "post", "put", "patch", "delete", "all"].forEach(function (m) { r[m] = function () { router[m].apply(null, [p].concat([].slice.call(arguments))); return r; }; });
      return r;
    };
    return router;
  }

  function handle(stack, req, res, out) {
    var idx = 0;
    var origUrl = req.url, origBase = req.baseUrl || "";
    function next(err) {
      if (err === "route" || err === "router") err = undefined;
      req.url = origUrl; req.baseUrl = origBase;
      var layer = stack[idx++];
      if (!layer) return out(err);
      var pathname = req.url.split("?")[0] || "/";
      var m = layer.re.exec(pathname);
      if (!m) return next(err);
      if (!layer.mount && layer.method && layer.method !== req.method && !(layer.method === "GET" && req.method === "HEAD")) return next(err);
      var params = {};
      layer.keys.forEach(function (k, i) { if (m[i + 1] !== undefined) { try { params[k] = decodeURIComponent(m[i + 1]); } catch (e) { params[k] = m[i + 1]; } } });
      req.params = Object.assign({}, req.params || {}, params);
      if (layer.mount && m[0]) {
        var rest = req.url.slice(m[0].length);
        req.baseUrl = origBase + m[0];
        req.url = rest.charAt(0) === "/" ? rest : "/" + rest;
      }
      var fn = layer.fn;
      var isErrFn = fn.length === 4;
      if (err ? !isErrFn : isErrFn) return next(err);
      try {
        var r = err ? fn(err, req, res, next) : fn(req, res, next);
        if (r && typeof r.then === "function") r.then(null, function (e) { next(e || new Error("Rejected promise")); });
      } catch (e) { next(e); }
    }
    next();
  }

  function decorate(app, req, res) {
    req.app = app; res.app = app; req.res = res; res.req = req;
    req.originalUrl = req.originalUrl || req.url;
    var u = new URL(req.url, "http://" + (req.headers.host || "localhost"));
    req.query = parseQuery(u.search);
    Object.defineProperty(req, "path", { configurable: true, get: function () { return this.url.split("?")[0]; } });
    req.get = req.header = function (n) { n = n.toLowerCase(); return n === "referer" || n === "referrer" ? req.headers.referer || req.headers.referrer : req.headers[n]; };
    req.hostname = (req.headers.host || "localhost").split(":")[0];
    req.ip = "::1"; req.protocol = "http"; req.secure = false;
    req.is = function (t) { var ct = req.headers["content-type"] || ""; return ct.indexOf(t === "json" ? "json" : t) >= 0 ? t : false; };
    res.locals = {};
    res.status = function (c) { res.statusCode = c; return res; };
    res.set = res.header = function (f, v) { if (typeof f === "object") { Object.keys(f).forEach(function (k) { res.setHeader(k, f[k]); }); } else res.setHeader(f, f.toLowerCase() === "content-type" && SHORT[v] ? SHORT[v] : v); return res; };
    res.get = function (f) { return res.getHeader(f); };
    res.type = res.contentType = function (t) { res.setHeader("Content-Type", SHORT[t] || MIME[t.charAt(0) === "." ? t : "." + t] || t); return res; };
    res.json = function (obj) {
      if (!res.getHeader("content-type")) res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.end(JSON.stringify(obj === undefined ? null : obj));
      return res;
    };
    res.send = function (body) {
      if (body === undefined || body === null) { res.end(); return res; }
      if (typeof body === "object" && !(body && typeof body.toString === "function" && body._s !== undefined)) return res.json(body);
      if (typeof body === "boolean" || typeof body === "number") return res.json(body);
      if (!res.getHeader("content-type")) res.setHeader("Content-Type", body._s !== undefined ? "application/octet-stream" : "text/html; charset=utf-8");
      res.end(req.method === "HEAD" ? undefined : String(body));
      return res;
    };
    res.sendStatus = function (c) { res.statusCode = c; res.type("text"); res.end(STATUS[c] || String(c)); return res; };
    res.redirect = function (a, b) { var status = typeof a === "number" ? a : 302, url = typeof a === "number" ? b : a; res.statusCode = status; res.setHeader("Location", url); res.type("text"); res.end(STATUS[status] + ". Redirecting to " + url); return res; };
    res.sendFile = function (p, opts, cb) {
      if (typeof opts === "function") { cb = opts; opts = {}; }
      opts = opts || {};
      if (!opts.root && !path.isAbsolute(p)) throw new TypeError("path must be absolute or specify root to res.sendFile");
      var full = opts.root ? path.join(opts.root, p) : p;
      fs.promises.readFile(full).then(function (content) {
        if (!res.getHeader("content-type")) res.setHeader("Content-Type", MIME[path.extname(full).toLowerCase()] || "application/octet-stream");
        res.end(String(content));
        if (cb) cb();
      }, function (e) {
        e.status = e.statusCode = 404;
        if (cb) cb(e); else req.next(e);
      });
    };
    res.cookie = function (name, val, o) {
      o = o || {};
      var v = encodeURIComponent(typeof val === "object" ? "j:" + JSON.stringify(val) : String(val));
      var c = name + "=" + v + "; Path=" + (o.path || "/");
      if (o.maxAge != null) c += "; Max-Age=" + Math.floor(o.maxAge / 1000) + "; Expires=" + new Date(Date.now() + o.maxAge).toUTCString();
      if (o.expires) c += "; Expires=" + new Date(o.expires).toUTCString();
      if (o.httpOnly) c += "; HttpOnly";
      if (o.secure) c += "; Secure";
      if (o.sameSite) c += "; SameSite=" + (o.sameSite === true ? "Strict" : o.sameSite);
      var prev = res.getHeader("set-cookie");
      res.setHeader("Set-Cookie", prev ? [].concat(prev, c) : [c]);
      return res;
    };
    res.clearCookie = function (name, o) { return res.cookie(name, "", Object.assign({}, o, { expires: new Date(1) })); };
  }

  function express() {
    var app = makeRouter();
    var root = function (req, res, next) { return app.handle(req, res, next); };
    app.settings = { "x-powered-by": true, env: "development" };
    app.locals = {};
    app.set = function (k, v) { if (arguments.length === 1) return app.settings[k]; app.settings[k] = v; return app; };
    app.enable = function (k) { app.settings[k] = true; return app; };
    app.disable = function (k) { app.settings[k] = false; return app; };
    app.enabled = function (k) { return !!app.settings[k]; };
    app.disabled = function (k) { return !app.settings[k]; };
    app.handle = function (req, res, outer) {
      decorate(app, req, res);
      if (app.settings["x-powered-by"]) res.setHeader("X-Powered-By", "Express");
      req.next = function (e) { finalHandler(e); };
      function finalHandler(err) {
        if (outer) return outer(err);
        if (res.headersSent) { if (err) console.error(err); return; }
        if (err) {
          var status = err.status || err.statusCode || 500;
          if (status >= 500) console.error((err.stack && err.stack.split("\n")[0]) || String(err));
          res.statusCode = status;
          res.setHeader("Content-Type", "text/html; charset=utf-8");
          res.end("<!DOCTYPE html>\n<html lang=\"en\">\n<head><meta charset=\"utf-8\"><title>Error</title></head>\n<body>\n<pre>" + (status >= 500 ? (err.name || "Error") + ": " + err.message : err.message || STATUS[status]) + "</pre>\n</body>\n</html>\n");
          return;
        }
        res.statusCode = 404;
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        res.end("<!DOCTYPE html>\n<html lang=\"en\">\n<head><meta charset=\"utf-8\"><title>Error</title></head>\n<body>\n<pre>Cannot " + req.method + " " + req.originalUrl.split("?")[0] + "</pre>\n</body>\n</html>\n");
      }
      handle(app.stack, req, res, finalHandler);
    };
    var fn = function (req, res, next) { app.handle(req, res, next); };
    Object.keys(app).forEach(function (k) { fn[k] = app[k]; });
    fn.handle = app.handle; fn.stack = app.stack; fn.settings = app.settings;
    fn.get = function (p) { if (arguments.length === 1 && typeof p === "string") return app.settings[p]; return app.get.apply(null, arguments) && fn; };
    ["use", "post", "put", "patch", "delete", "options", "head", "all", "set", "enable", "disable"].forEach(function (m) { fn[m] = function () { var r = app[m].apply(null, arguments); return r === app ? fn : r; }; });
    fn.listen = function () { var server = http.createServer(fn); return server.listen.apply(server, arguments); };
    void root;
    return fn;
  }

  async function readBody(req) {
    if (req._bodyRead) return null;
    req._bodyRead = true;
    var body = "";
    for await (var chunk of req) body += chunk;
    return body;
  }
  express.json = function (opts) {
    opts = opts || {};
    return function jsonParser(req, res, next) {
      var ct = (req.headers["content-type"] || "").toLowerCase();
      if (ct.indexOf(opts.type || "json") < 0) return next();
      readBody(req).then(function (body) {
        if (body === null) return next();
        if (!body) { req.body = {}; return next(); }
        try { req.body = JSON.parse(body); next(); }
        catch (e) { var err = new SyntaxError(e.message); err.status = err.statusCode = 400; err.type = "entity.parse.failed"; err.body = body; next(err); }
      }, next);
    };
  };
  express.urlencoded = function () {
    return function urlencodedParser(req, res, next) {
      var ct = (req.headers["content-type"] || "").toLowerCase();
      if (ct.indexOf("application/x-www-form-urlencoded") < 0) return next();
      readBody(req).then(function (body) { if (body !== null) req.body = parseQuery(body || ""); next(); }, next);
    };
  };
  express.text = function () {
    return function textParser(req, res, next) {
      if ((req.headers["content-type"] || "").indexOf("text/") < 0) return next();
      readBody(req).then(function (body) { if (body !== null) req.body = body; next(); }, next);
    };
  };
  express.static = function (root, opts) {
    opts = opts || {};
    var index = opts.index === false ? null : opts.index || "index.html";
    return function serveStatic(req, res, next) {
      if (req.method !== "GET" && req.method !== "HEAD") return next();
      var p;
      try { p = decodeURIComponent(req.path); } catch (e) { return next(); }
      if (p.slice(-1) === "/") { if (!index) return next(); p += index; }
      var base = path.resolve(root);
      var full = path.join(base, p);
      if (full !== base && full.indexOf(base + "/") !== 0) return next();
      var k = ctx.key(full);
      if (ctx.files[k] == null) return next();
      res.setHeader("Content-Type", MIME[path.extname(full).toLowerCase()] || "application/octet-stream");
      res.end(req.method === "HEAD" ? undefined : ctx.files[k]);
    };
  };
  express.Router = function () { return makeRouter(); };
  void ensureRoute;
  return express;
}

function corsPkg() {
  return function cors(opts) {
    opts = opts || {};
    return function (req, res, next) {
      var origin = opts.origin === undefined || opts.origin === true ? (opts.origin === true ? req.headers.origin || "*" : "*") : Array.isArray(opts.origin) ? (opts.origin.indexOf(req.headers.origin) >= 0 ? req.headers.origin : "") : opts.origin;
      if (origin) res.setHeader("Access-Control-Allow-Origin", origin);
      if (opts.credentials) res.setHeader("Access-Control-Allow-Credentials", "true");
      if (req.method === "OPTIONS") {
        res.setHeader("Access-Control-Allow-Methods", (opts.methods || ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"]).join(","));
        res.statusCode = 204; res.end(); return;
      }
      next();
    };
  };
}

function sessionPkg() {
  var store = {};
  var rand = function () { var s = ""; for (var i = 0; i < 32; i++) s += "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-".charAt(Math.floor(Math.random() * 64)); return s; };
  function session(opts) {
    opts = opts || {};
    var name = opts.name || "connect.sid";
    if (!opts.secret) console.warn("express-session deprecated: req.secret; provide secret option");
    return function sessionMiddleware(req, res, next) {
      if (req.session) return next();
      var cookies = {};
      (req.headers.cookie || "").split(/;\s*/).forEach(function (p) { var i = p.indexOf("="); if (i > 0) cookies[p.slice(0, i)] = decodeURIComponent(p.slice(i + 1)); });
      var raw = cookies[name], sid = raw ? raw.replace(/^s:/, "").split(".")[0] : null;
      var isNew = !(sid && store[sid]);
      if (isNew) sid = rand();
      var destroyed = false;
      var sess = Object.assign({}, isNew ? {} : store[sid]);
      var define = function (o) {
        Object.defineProperty(o, "id", { get: function () { return sid; }, enumerable: false });
        Object.defineProperty(o, "cookie", { value: Object.assign({ path: "/", httpOnly: true, originalMaxAge: null }, opts.cookie || {}), enumerable: false, writable: true });
        Object.defineProperty(o, "destroy", { value: function (cb) { destroyed = true; delete store[sid]; req.session = undefined; if (cb) setTimeout(function () { cb(null); }, 0); }, enumerable: false });
        Object.defineProperty(o, "regenerate", { value: function (cb) { delete store[sid]; sid = rand(); isNew = true; req.session = define({}); if (cb) setTimeout(function () { cb(null); }, 0); }, enumerable: false });
        Object.defineProperty(o, "save", { value: function (cb) { store[sid] = JSON.parse(JSON.stringify(req.session)); if (cb) setTimeout(function () { cb(null); }, 0); }, enumerable: false });
        Object.defineProperty(o, "reload", { value: function (cb) { if (cb) setTimeout(function () { cb(null); }, 0); }, enumerable: false });
        Object.defineProperty(o, "touch", { value: function () {}, enumerable: false });
        return o;
      };
      req.session = define(sess);
      req.sessionID = sid;
      var committed = false;
      var commit = function () {
        if (committed) return; committed = true;
        if (destroyed || !req.session) return;
        var data = JSON.parse(JSON.stringify(req.session));
        var hasData = Object.keys(data).length > 0;
        if (hasData || opts.saveUninitialized) {
          store[sid] = data;
          if (isNew || opts.rolling) {
            var c = name + "=" + encodeURIComponent("s:" + sid + ".signature") + "; Path=/; HttpOnly" + (opts.cookie && opts.cookie.maxAge ? "; Max-Age=" + Math.floor(opts.cookie.maxAge / 1000) : "") + (opts.cookie && opts.cookie.sameSite ? "; SameSite=" + opts.cookie.sameSite : "");
            var prev = res.getHeader("set-cookie");
            if (!res.headersSent) res.setHeader("Set-Cookie", prev ? [].concat(prev, c) : [c]);
          }
        }
      };
      ["writeHead", "write", "end"].forEach(function (m) {
        var orig = res[m];
        res[m] = function () { commit(); return orig.apply(res, arguments); };
      });
      next();
    };
  }
  session.MemoryStore = function () {};
  return session;
}

function bcryptPkg() {
  var B64 = "./ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  function digest(str, len) {
    var out = "", h1 = 0xdeadbeef, h2 = 0x41c6ce57;
    for (var round = 0; out.length < len; round++) {
      for (var i = 0; i < str.length; i++) { var ch = str.charCodeAt(i) + round; h1 = Math.imul(h1 ^ ch, 2654435761); h2 = Math.imul(h2 ^ ch, 1597334677); }
      h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
      h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
      var n = (h2 >>> 0) * 4294967296 + (h1 >>> 0);
      for (var j = 0; j < 8 && out.length < len; j++) { out += B64.charAt(n % 64); n = Math.floor(n / 64); }
    }
    return out;
  }
  function genSaltSync(rounds) { var r = rounds || 10, s = ""; for (var i = 0; i < 22; i++) s += B64.charAt(Math.floor(Math.random() * 64)); return "$2b$" + (r < 10 ? "0" + r : r) + "$" + s; }
  function hashSync(pw, salt) {
    if (typeof pw !== "string") throw new Error("data and salt arguments required");
    var s = typeof salt === "number" || salt == null ? genSaltSync(salt) : salt;
    return s + digest(s.slice(7, 29) + "\u0000" + pw, 31);
  }
  function compareSync(pw, hash) { return typeof hash === "string" && hash.length === 60 && hashSync(String(pw), hash.slice(0, 29)) === hash; }
  var later = function (fn) { return new Promise(function (res, rej) { setTimeout(function () { try { res(fn()); } catch (e) { rej(e); } }, 40); }); };
  var api = {
    genSaltSync: genSaltSync, hashSync: hashSync, compareSync: compareSync,
    genSalt: function (r) { return later(function () { return genSaltSync(r); }); },
    hash: function (pw, salt, cb) { var p = later(function () { return hashSync(pw, salt); }); if (cb) p.then(function (h) { cb(null, h); }, cb); return p; },
    compare: function (pw, hash, cb) { var p = later(function () { return compareSync(pw, hash); }); if (cb) p.then(function (ok) { cb(null, ok); }, cb); return p; },
    getRounds: function (h) { return Number(h.slice(4, 6)); },
  };
  api.default = api;
  return api;
}

function validatorPkg() {
  var str = function (s) { if (typeof s !== "string") throw new TypeError("Expected a string but received a " + (s === null ? "null" : typeof s)); return s; };
  var v = {
    isEmail: function (s) { return /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)*\.[A-Za-z]{2,}$/.test(str(s)); },
    isLength: function (s, o) { o = o || {}; var n = Array.from(str(s)).length; return n >= (o.min || 0) && (o.max === undefined || n <= o.max); },
    isEmpty: function (s, o) { return (o && o.ignore_whitespace ? str(s).trim() : str(s)).length === 0; },
    isAlphanumeric: function (s) { return /^[A-Za-z0-9]+$/.test(str(s)); },
    isNumeric: function (s) { return /^[-+]?\d+(\.\d+)?$/.test(str(s)); },
    isInt: function (s, o) { o = o || {}; if (!/^[-+]?\d+$/.test(str(s))) return false; var n = Number(s); return (o.min === undefined || n >= o.min) && (o.max === undefined || n <= o.max); },
    isURL: function (s) { try { var u = new URL(str(s)); return /^https?:$/.test(u.protocol); } catch (e) { return false; } },
    isStrongPassword: function (s) { return str(s).length >= 8 && /[a-z]/.test(s) && /[A-Z]/.test(s) && /\d/.test(s) && /[^A-Za-z0-9]/.test(s); },
    trim: function (s) { return str(s).trim(); },
    escape: function (s) { return str(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\//g, "&#x2F;").replace(/\\/g, "&#x5C;").replace(/`/g, "&#96;"); },
    normalizeEmail: function (s) { return str(s).trim().toLowerCase(); },
  };
  v.default = v;
  return v;
}

function sqlite3Pkg() {
  function Database() { throw new Error("In this lab, open databases with the sqlite package: open({ filename, driver: sqlite3.Database })"); }
  var api = { Database: Database, OPEN_READWRITE: 2, OPEN_CREATE: 4, verbose: function () { return api; } };
  api.default = api;
  return api;
}

function sqlitePkg(ctx) {
  var dbs = {};
  function literal(v) {
    if (v === null || v === undefined) return "NULL";
    if (typeof v === "number") { if (!isFinite(v)) throw new Error("SQLITE_MISMATCH: can't bind " + v); return String(v); }
    if (typeof v === "boolean") return v ? "1" : "0";
    if (v instanceof Date) v = v.toISOString();
    if (typeof v === "object") v = JSON.stringify(v);
    return "'" + String(v).replace(/'/g, "''") + "'";
  }
  function bind(sql, params) {
    if (params.length === 1 && Array.isArray(params[0])) params = params[0];
    var named = params.length === 1 && params[0] && typeof params[0] === "object" && !Array.isArray(params[0]) ? params[0] : null;
    var i = 0, out = "", q = null;
    for (var k = 0; k < sql.length; k++) {
      var c = sql[k];
      if (q) { out += c; if (c === q) q = null; continue; }
      if (c === "'" || c === '"') { q = c; out += c; continue; }
      if (c === "?" && !named) {
        if (i >= params.length) throw Object.assign(new Error("SQLITE_RANGE: column index out of range"), { code: "SQLITE_RANGE" });
        out += literal(params[i++]); continue;
      }
      if (named && (c === "$" || c === ":" || c === "@") && /[A-Za-z_]/.test(sql[k + 1] || "")) {
        var m = sql.slice(k).match(/^[$:@][A-Za-z_][A-Za-z0-9_]*/)[0];
        var val = m in named ? named[m] : named[m.slice(1)];
        out += literal(val); k += m.length - 1; continue;
      }
      out += c;
    }
    return out;
  }
  function wrapErr(e) {
    var msg = e.message || String(e), code = "SQLITE_ERROR";
    var m;
    if ((m = msg.match(/unique constraint "(\w+?)_(\w+?)_(key|pkey)"/))) { code = "SQLITE_CONSTRAINT"; msg = "UNIQUE constraint failed: " + m[1] + "." + (m[3] === "pkey" ? "id" : m[2]); }
    else if ((m = msg.match(/null value in column "(\w+)" of relation "(\w+)"/))) { code = "SQLITE_CONSTRAINT"; msg = "NOT NULL constraint failed: " + m[2] + "." + m[1]; }
    else if (/foreign key/.test(msg)) { code = "SQLITE_CONSTRAINT"; msg = "FOREIGN KEY constraint failed"; }
    else if (/check constraint/.test(msg)) { code = "SQLITE_CONSTRAINT"; msg = "CHECK constraint failed"; }
    else if ((m = msg.match(/relation "(\w+)" does not exist/))) msg = "no such table: " + m[1];
    else if ((m = msg.match(/column "(\w+)" does not exist/))) msg = "no such column: " + m[1];
    var err = new Error(code + ": " + msg);
    err.code = code; err.errno = code === "SQLITE_CONSTRAINT" ? 19 : 1;
    return err;
  }
  function Wrapper(db, filename) { this.db = db; this.config = { filename: filename }; }
  var W = Wrapper.prototype;
  var run = function (self, sql, params) {
    return new Promise(function (resolve, reject) {
      setTimeout(function () {
        try { resolve(self.db.exec(params ? bind(sql, params) : sql)); }
        catch (e) { reject(e.name === "SqlError" ? wrapErr(e) : e); }
      }, 2);
    });
  };
  var rowsOf = function (r) { return r && r.rows ? r.rows.map(function (row) { var o = {}; r.columns.forEach(function (c, i) { o[c] = row[i]; }); return o; }) : []; };
  W.all = function (sql) { return run(this, sql, [].slice.call(arguments, 1)).then(function (rs) { return rowsOf(rs[rs.length - 1]); }); };
  W.get = function (sql) { return run(this, sql, [].slice.call(arguments, 1)).then(function (rs) { return rowsOf(rs[rs.length - 1])[0]; }); };
  W.run = function (sql) { return run(this, sql, [].slice.call(arguments, 1)).then(function (rs) { var r = rs[rs.length - 1] || {}; return { lastID: r.lastId, changes: r.rowCount || 0 }; }); };
  W.exec = function (sql) { return run(this, sql, null).then(function () {}); };
  W.each = function (sql) { var a = [].slice.call(arguments, 1), cb = a.pop(); return this.all.apply(this, [sql].concat(a)).then(function (rows) { rows.forEach(function (r) { cb(null, r); }); return rows.length; }); };
  W.close = function () { return Promise.resolve(); };
  W.migrate = function () { return Promise.resolve(); };
  W.on = function () { return this; };
  async function open(opts) {
    opts = opts || {};
    if (!opts.driver) throw new Error("sqlite: open() needs a driver: open({ filename, driver: sqlite3.Database })");
    var file = ctx.key(opts.filename || ":memory:");
    if (!dbs[file] || file === ":memory:") {
      var E = ctx.engine();
      var db = new E.Database({ sqlite: true });
      var src = ctx.files[file];
      if (src && /\b(CREATE|INSERT)\b/i.test(src)) { try { db.exec(src); } catch (e) { throw wrapErr(e); } }
      dbs[file] = db;
    }
    return new Wrapper(dbs[file], opts.filename);
  }
  var api = { open: open, Database: Wrapper };
  api.default = api;
  return api;
}

/** All packages the Node lab provides, by import name. */
export const NODE_PACKAGES = {
  express: expressPkg,
  cors: corsPkg,
  "express-session": sessionPkg,
  bcrypt: bcryptPkg,
  bcryptjs: bcryptPkg,
  validator: validatorPkg,
  sqlite3: sqlite3Pkg,
  sqlite: sqlitePkg,
};
