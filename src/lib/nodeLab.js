/* The in-browser Node lab.
   Learner files (server.js, utils/*.js, public/index.html, data/data.json…) run in a hidden sandboxed
   iframe that emulates Node's built-in modules: node:http, node:fs (+ fs/promises), node:path,
   node:events, node:url, node:crypto, process and a small Buffer. ES module syntax is compiled to
   CommonJS by the TypeScript compiler (shared with the React lab). The page talks to the "server"
   with postMessage: requests in, status/headers/chunks out — including Server-Sent Events. */

import { loadCompiler } from "./reactLab.js";
export { loadCompiler };

const PORT = 8000;
const ctype = (headers) => (Object.entries(headers || {}).find(([k]) => k.toLowerCase() === "content-type") || [])[1] || "";
const isCode = (f) => /\.(m?js|cjs|ts)$/i.test(f);

/** Compile learner files. Returns { mods, raw, errors, entry }. */
export function compileNode(ts, files) {
  const mods = {}, errors = [];
  for (const [name, code] of Object.entries(files)) {
    if (!isCode(name) || name.startsWith("public/")) continue;
    const src = code
      .replace(/import\.meta\.dirname/g, "__syDirname")
      .replace(/import\.meta\.filename/g, "__syFilename")
      .replace(/import\.meta\.url/g, "__importMetaUrl");
    const r = ts.transpileModule(src, {
      fileName: name, reportDiagnostics: true,
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true, allowJs: true },
    });
    for (const d of r.diagnostics || []) {
      const pos = d.file && d.start != null ? d.file.getLineAndCharacterOfPosition(d.start) : null;
      errors.push(`${name}${pos ? `:${pos.line + 1}:${pos.character + 1}` : ""}  ${ts.flattenDiagnosticMessageText(d.messageText, "\n")}`);
    }
    mods[name] = r.outputText;
  }
  return { mods, raw: { ...files }, errors, entry: entryOf(files) };
}

/** Work out which file `npm start` would run. */
export function entryOf(files) {
  try {
    const pkg = JSON.parse(files["package.json"] || "{}");
    const start = pkg.scripts && (pkg.scripts.start || pkg.scripts.dev);
    const m = start && start.match(/node\s+(?:--[\w-]+\s+)*([\w./-]+\.m?js)/);
    if (m) return m[1].replace(/^\.\//, "");
    if (pkg.main) return pkg.main.replace(/^\.\//, "");
  } catch (e) { /* invalid package.json: fall through */ }
  return ["server.js", "index.js", "app.js"].find((f) => files[f] != null) || Object.keys(files).find(isCode);
}

/* Runs inside the server iframe. Must stay self-contained: injected with Function.prototype.toString(). */
function syNodeRuntime(cfg) {
  var ROOT = "/app";
  var files = cfg.raw;
  var send = function (m) { m.__syn = cfg.id; parent.postMessage(m, "*"); };
  var str = function (x) {
    if (typeof x === "string") return x;
    if (x instanceof Error) return (x.code ? "[" + x.code + "] " : "") + x.name + ": " + x.message;
    try { return typeof x === "object" && x !== null ? JSON.stringify(x, null, 2) : String(x); } catch (e) { return String(x); }
  };
  ["log", "info", "warn", "error", "debug", "table"].forEach(function (k) {
    console[k] = function () { send({ k: "log", level: k === "error" || k === "warn" ? k : "log", m: [].slice.call(arguments).map(str).join(" ") }); };
  });
  var crashed = false;
  function crash(e) {
    if (crashed) return; crashed = true;
    send({ k: "crash", m: "Uncaught " + str(e) });
  }
  addEventListener("error", function (e) { e.preventDefault(); crash(e.error || e.message); });
  addEventListener("unhandledrejection", function (e) { e.preventDefault(); crash(e.reason); });

  /* ── path ── */
  function normalize(p) {
    var abs = p.charAt(0) === "/", out = [];
    p.split("/").forEach(function (s) { if (!s || s === ".") return; if (s === "..") out.pop(); else out.push(s); });
    return (abs ? "/" : "") + out.join("/") || (abs ? "/" : ".");
  }
  var path = {
    sep: "/", delimiter: ":",
    normalize: normalize,
    join: function () { return normalize([].slice.call(arguments).filter(Boolean).join("/")); },
    resolve: function () {
      var p = ROOT;
      [].slice.call(arguments).forEach(function (s) { if (!s) return; p = s.charAt(0) === "/" ? s : p + "/" + s; });
      return normalize(p);
    },
    dirname: function (p) { var n = normalize(p), i = n.lastIndexOf("/"); return i > 0 ? n.slice(0, i) : i === 0 ? "/" : "."; },
    basename: function (p, ext) { var b = normalize(p).split("/").pop(); return ext && b.slice(-ext.length) === ext ? b.slice(0, -ext.length) : b; },
    extname: function (p) { var b = path.basename(p), i = b.lastIndexOf("."); return i > 0 ? b.slice(i) : ""; },
    isAbsolute: function (p) { return p.charAt(0) === "/"; },
    relative: function (from, to) {
      var a = path.resolve(from).split("/").filter(Boolean), b = path.resolve(to).split("/").filter(Boolean);
      while (a.length && b.length && a[0] === b[0]) { a.shift(); b.shift(); }
      return a.map(function () { return ".."; }).concat(b).join("/");
    },
    parse: function (p) { var ext = path.extname(p), base = path.basename(p); return { root: p.charAt(0) === "/" ? "/" : "", dir: path.dirname(p), base: base, ext: ext, name: ext ? base.slice(0, -ext.length) : base }; },
  };
  path.posix = path;

  /* ── Buffer (just enough for request bodies and file contents) ── */
  function SyBuffer(s) { this._s = String(s); this.length = new TextEncoder().encode(this._s).length; }
  SyBuffer.prototype.toString = function () { return this._s; };
  SyBuffer.prototype.toJSON = function () { return { type: "Buffer", data: [].slice.call(new TextEncoder().encode(this._s)) }; };
  var Buffer = {
    from: function (x) { return new SyBuffer(x && x._s != null ? x._s : x); },
    concat: function (list) { return new SyBuffer(list.map(String).join("")); },
    byteLength: function (s) { return new TextEncoder().encode(String(s)).length; },
    isBuffer: function (x) { return x instanceof SyBuffer; },
  };

  /* ── fs ── */
  var key = function (p) {
    var full = path.resolve(String(p).replace(/^file:\/\//, ""));
    return full === ROOT ? "" : full.indexOf(ROOT + "/") === 0 ? full.slice(ROOT.length + 1) : full;
  };
  var enoent = function (p, op) { var e = new Error("ENOENT: no such file or directory, " + (op || "open") + " '" + path.resolve(String(p)) + "'"); e.code = "ENOENT"; e.errno = -2; e.syscall = op || "open"; e.path = path.resolve(String(p)); return e; };
  var isDir = function (k) { return Object.keys(files).some(function (f) { return f.indexOf(k + "/") === 0; }) || k === "" || k === "."; };
  var fsSync = {
    readFileSync: function (p, enc) { var k = key(p); if (files[k] == null) throw enoent(p); return enc ? files[k] : new SyBuffer(files[k]); },
    writeFileSync: function (p, data) { var k = key(p); files[k] = String(data); send({ k: "fs", path: k, data: files[k] }); },
    appendFileSync: function (p, data) { var k = key(p); files[k] = (files[k] || "") + String(data); send({ k: "fs", path: k, data: files[k] }); },
    existsSync: function (p) { var k = key(p); return files[k] != null || isDir(k); },
    readdirSync: function (p) {
      var k = key(p), pre = k === "." || k === "" ? "" : k + "/", seen = {};
      Object.keys(files).forEach(function (f) { if (f.indexOf(pre) === 0) seen[f.slice(pre.length).split("/")[0]] = 1; });
      if (!Object.keys(seen).length && !isDir(k)) throw enoent(p, "scandir");
      return Object.keys(seen).sort();
    },
    unlinkSync: function (p) { var k = key(p); if (files[k] == null) throw enoent(p, "unlink"); delete files[k]; send({ k: "fs", path: k, data: null }); },
    mkdirSync: function () {},
    statSync: function (p) { var k = key(p); if (files[k] == null && !isDir(k)) throw enoent(p, "stat"); var d = files[k] == null; return { isFile: function () { return !d; }, isDirectory: function () { return d; }, size: d ? 0 : files[k].length, mtime: new Date() }; },
  };
  var later = function (fn) { return new Promise(function (res, rej) { setTimeout(function () { try { res(fn()); } catch (e) { rej(e); } }, 4); }); };
  var fsPromises = {
    readFile: function (p, o) { return later(function () { return fsSync.readFileSync(p, o || null); }); },
    writeFile: function (p, d) { return later(function () { fsSync.writeFileSync(p, d); }); },
    appendFile: function (p, d) { return later(function () { fsSync.appendFileSync(p, d); }); },
    readdir: function (p) { return later(function () { return fsSync.readdirSync(p); }); },
    unlink: function (p) { return later(function () { fsSync.unlinkSync(p); }); },
    mkdir: function () { return later(function () {}); },
    stat: function (p) { return later(function () { return fsSync.statSync(p); }); },
    access: function (p) { return later(function () { if (!fsSync.existsSync(p)) throw enoent(p, "access"); }); },
  };
  var cbify = function (name) {
    return function () {
      var args = [].slice.call(arguments), cb = typeof args[args.length - 1] === "function" ? args.pop() : function () {};
      fsPromises[name].apply(null, args).then(function (v) { cb(null, v); }, function (e) { cb(e); });
    };
  };
  var fs = Object.assign({ promises: fsPromises, constants: { F_OK: 0, R_OK: 4, W_OK: 2 } }, fsSync);
  ["readFile", "writeFile", "appendFile", "readdir", "unlink", "mkdir", "stat", "access"].forEach(function (n) { fs[n] = cbify(n); });

  /* ── events ── */
  function EventEmitter() { this._ev = {}; }
  EventEmitter.prototype.on = EventEmitter.prototype.addListener = function (n, f) { (this._ev[n] = this._ev[n] || []).push(f); return this; };
  EventEmitter.prototype.once = function (n, f) { var self = this; function w() { self.off(n, w); f.apply(self, arguments); } w.fn = f; return this.on(n, w); };
  EventEmitter.prototype.off = EventEmitter.prototype.removeListener = function (n, f) { this._ev[n] = (this._ev[n] || []).filter(function (x) { return x !== f && x.fn !== f; }); return this; };
  EventEmitter.prototype.removeAllListeners = function (n) { if (n) delete this._ev[n]; else this._ev = {}; return this; };
  EventEmitter.prototype.emit = function (n) {
    var a = [].slice.call(arguments, 1), l = (this._ev[n] || []).slice();
    if (n === "error" && !l.length) throw a[0];
    l.forEach(function (f) { f.apply(this, a); }, this);
    return l.length > 0;
  };
  EventEmitter.prototype.listenerCount = function (n) { return (this._ev[n] || []).length; };
  EventEmitter.prototype.listeners = function (n) { return (this._ev[n] || []).slice(); };
  EventEmitter.prototype.setMaxListeners = function () { return this; };
  EventEmitter.EventEmitter = EventEmitter;
  EventEmitter.default = EventEmitter;
  var inherit = function (C) { C.prototype = Object.create(EventEmitter.prototype); C.prototype.constructor = C; };

  /* ── http ── */
  var STATUS = { 200: "OK", 201: "Created", 204: "No Content", 301: "Moved Permanently", 302: "Found", 304: "Not Modified", 400: "Bad Request", 401: "Unauthorized", 403: "Forbidden", 404: "Not Found", 405: "Method Not Allowed", 409: "Conflict", 413: "Payload Too Large", 415: "Unsupported Media Type", 422: "Unprocessable Entity", 429: "Too Many Requests", 500: "Internal Server Error", 503: "Service Unavailable" };
  var servers = [], open = {};
  function IncomingMessage(r) {
    EventEmitter.call(this);
    this.method = r.method; this.url = r.url; this.httpVersion = "1.1";
    this.headers = r.headers; this.rawHeaders = [];
    this.socket = this.connection = { remoteAddress: "::1", encrypted: false };
    this._body = r.body || "";
  }
  inherit(IncomingMessage);
  IncomingMessage.prototype[Symbol.asyncIterator] = async function* () { if (this._body) yield new SyBuffer(this._body); };
  IncomingMessage.prototype.setEncoding = function () { return this; };
  function ServerResponse(id, req) {
    EventEmitter.call(this);
    this._id = id; this._h = {}; this._names = {}; this.statusCode = 200; this.statusMessage = "";
    this.headersSent = false; this.writableEnded = this.finished = false; this.req = req;
  }
  inherit(ServerResponse);
  var R = ServerResponse.prototype;
  R.setHeader = function (n, v) { if (this.headersSent) throw codeErr("ERR_HTTP_HEADERS_SENT", "Cannot set headers after they are sent to the client"); this._h[n.toLowerCase()] = v; this._names[n.toLowerCase()] = n; return this; };
  R.getHeader = function (n) { return this._h[n.toLowerCase()]; };
  R.getHeaders = function () { return Object.assign({}, this._h); };
  R.hasHeader = function (n) { return n.toLowerCase() in this._h; };
  R.removeHeader = function (n) { delete this._h[n.toLowerCase()]; };
  R.writeHead = function (status, msg, headers) {
    if (this.headersSent) throw codeErr("ERR_HTTP_HEADERS_SENT", "Cannot write headers after they are sent to the client");
    if (typeof msg === "object") { headers = msg; msg = ""; }
    this.statusCode = status; this.statusMessage = msg || "";
    var self = this;
    if (Array.isArray(headers)) for (var i = 0; i < headers.length; i += 2) self.setHeader(headers[i], headers[i + 1]);
    else Object.keys(headers || {}).forEach(function (k) { self.setHeader(k, headers[k]); });
    return this;
  };
  R._head = function () {
    if (this.headersSent) return;
    this.headersSent = true;
    var h = {}, self = this;
    Object.keys(this._h).forEach(function (k) { h[self._names[k]] = String(self._h[k]); });
    send({ k: "head", id: this._id, status: this.statusCode, statusText: this.statusMessage || STATUS[this.statusCode] || "", headers: h });
  };
  R.write = function (chunk) {
    if (this.writableEnded) { crash(codeErr("ERR_STREAM_WRITE_AFTER_END", "write after end")); return false; }
    this._head();
    if (chunk != null) send({ k: "chunk", id: this._id, data: String(chunk) });
    return true;
  };
  R.end = function (chunk, enc, cb) {
    if (typeof chunk === "function") { cb = chunk; chunk = null; }
    if (this.writableEnded) return this;
    if (chunk != null) this.write(chunk); else this._head();
    this.writableEnded = this.finished = true;
    delete open[this._id];
    send({ k: "end", id: this._id });
    var self = this;
    setTimeout(function () { self.emit("finish"); self.emit("close"); if (cb) cb(); }, 0);
    return this;
  };
  R.flushHeaders = function () { this._head(); };
  function codeErr(code, msg) { var e = new Error(msg); e.code = code; return e; }
  function Server(handler) { EventEmitter.call(this); this.listening = false; if (handler) this.on("request", handler); }
  inherit(Server);
  Server.prototype.listen = function () {
    var a = [].slice.call(arguments), cb = typeof a[a.length - 1] === "function" ? a.pop() : null;
    var port = typeof a[0] === "object" && a[0] ? a[0].port : a[0];
    this._port = port == null ? 0 : Number(port); this.listening = true;
    servers.push(this);
    send({ k: "listening", port: this._port });
    var self = this;
    setTimeout(function () { self.emit("listening"); if (cb) cb(); }, 0);
    return this;
  };
  Server.prototype.close = function (cb) { this.listening = false; servers = servers.filter(function (s) { return s !== this; }, this); if (cb) setTimeout(cb, 0); return this; };
  Server.prototype.address = function () { return { port: this._port, family: "IPv6", address: "::" }; };
  Server.prototype.setTimeout = function () { return this; };
  var http = {
    createServer: function (o, h) { return new Server(typeof o === "function" ? o : h); },
    Server: Server, IncomingMessage: IncomingMessage, ServerResponse: ServerResponse, STATUS_CODES: STATUS,
    METHODS: ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"],
  };

  /* ── misc built-ins ── */
  var uuid = function () {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) { var r = Math.random() * 16 | 0; return (c === "x" ? r : (r & 3 | 8)).toString(16); });
  };
  var crypto = {
    randomUUID: uuid,
    randomInt: function (a, b) { if (b == null) { b = a; a = 0; } return a + Math.floor(Math.random() * (b - a)); },
    randomBytes: function (n) { var s = ""; for (var i = 0; i < n; i++) s += ("0" + Math.floor(Math.random() * 256).toString(16)).slice(-2); return { toString: function () { return s; } }; },
  };
  var url = { URL: URL, URLSearchParams: URLSearchParams, fileURLToPath: function (u) { return String(u).replace(/^file:\/\//, ""); }, pathToFileURL: function (p) { return new URL("file://" + path.resolve(p)); } };
  var envFile = {};
  String(files[".env"] || "").split("\n").forEach(function (l) { var m = l.match(/^\s*([\w.]+)\s*=\s*(.*)\s*$/); if (m) envFile[m[1]] = m[2].replace(/^["']|["']$/g, ""); });
  var process = {
    env: Object.assign({ NODE_ENV: "development" }, cfg.env || {}, envFile),
    argv: ["/usr/local/bin/node", ROOT + "/" + cfg.entry],
    cwd: function () { return ROOT; }, platform: "linux", version: "v22.11.0", versions: { node: "22.11.0" }, pid: 4242,
    exit: function (c) { send({ k: "exit", code: c || 0 }); throw codeErr("SY_EXIT", "process.exit(" + (c || 0) + ")"); },
    on: function () { return process; }, once: function () { return process; },
    nextTick: function (f) { var a = [].slice.call(arguments, 1); Promise.resolve().then(function () { f.apply(null, a); }); },
    uptime: function () { return performance.now() / 1000; }, memoryUsage: function () { return { rss: 31457280, heapUsed: 6291456 }; },
    stdout: { write: function (s) { send({ k: "log", level: "log", m: String(s).replace(/\n$/, "") }); return true; } },
    hrtime: { bigint: function () { return BigInt(Math.round(performance.now() * 1e6)); } },
  };
  var os = { EOL: "\n", platform: function () { return "linux"; }, cpus: function () { return [{}, {}, {}, {}]; }, homedir: function () { return "/home/learner"; }, tmpdir: function () { return "/tmp"; }, hostname: function () { return "shipyard"; }, type: function () { return "Linux"; }, totalmem: function () { return 8589934592; }, freemem: function () { return 4294967296; } };
  var util = { format: function () { return [].slice.call(arguments).map(str).join(" "); }, inspect: str, promisify: function (f) { return function () { var a = [].slice.call(arguments); return new Promise(function (res, rej) { f.apply(null, a.concat(function (e, v) { e ? rej(e) : res(v); })); }); }; } };
  var timersP = { setTimeout: function (ms, v) { return new Promise(function (r) { setTimeout(function () { r(v); }, ms); }); } };
  var BUILTIN = { http: http, fs: fs, "fs/promises": fsPromises, path: path, events: EventEmitter, url: url, crypto: crypto, process: process, os: os, util: util, buffer: { Buffer: Buffer }, "timers/promises": timersP, "path/posix": path };
  var EXTRA = cfg.extra || {};

  /* ── module loader ── */
  var cache = {};
  function resolveFrom(dir, name) {
    var base = path.join(dir, name), k = key(base);
    var c = [k, k + ".js", k + ".mjs", k + ".cjs", k + ".json", k + "/index.js"];
    for (var i = 0; i < c.length; i++) if (cfg.mods[c[i]] != null || (/\.json$/.test(c[i]) && files[c[i]] != null)) return c[i];
    return null;
  }
  function load(file) {
    if (cache[file]) return cache[file].exports;
    var module = { exports: {}, id: file, filename: ROOT + "/" + file, loaded: false };
    cache[file] = module;
    if (/\.json$/.test(file)) { module.exports = JSON.parse(files[file]); return module.exports; }
    var dir = path.dirname(ROOT + "/" + file);
    var require = function (n) { return req(dir, n); };
    require.resolve = function (n) { return ROOT + "/" + resolveFrom(dir, n); };
    // The inner function lets learner code declare its own `const __dirname = import.meta.dirname`.
    // The entry file is async so top-level await works, as it does in Node's ES modules.
    var body = "return (" + (file === cfg.entry ? "async " : "") + "function () {\n" + cfg.mods[file] + "\n}).call(this)\n//# sourceURL=" + file;
    var fn = new Function("require", "module", "exports", "__filename", "__dirname", "__syFilename", "__syDirname", "__importMetaUrl", "process", "Buffer", body);
    var r = fn(require, module, module.exports, ROOT + "/" + file, dir, ROOT + "/" + file, dir, "file://" + ROOT + "/" + file, process, Buffer);
    if (r && typeof r.then === "function") r.then(function () { send({ k: "settled" }); }, crash);
    module.loaded = true;
    return module.exports;
  }
  function req(dir, name) {
    var n = name.replace(/^node:/, "");
    if (BUILTIN[n]) return BUILTIN[n];
    if (EXTRA[n]) return EXTRA[n](BUILTIN, req);
    if (/^\.{0,2}\//.test(name)) {
      var f = resolveFrom(dir, name);
      if (!f) throw codeErr("ERR_MODULE_NOT_FOUND", "Cannot find module '" + path.resolve(dir, name) + "' imported from " + dir + ". Check the path, and remember that ES modules need the file extension (./utils/file.js).");
      return load(f);
    }
    throw codeErr("ERR_MODULE_NOT_FOUND", "Cannot find package '" + name + "'. This lab includes Node's built-in modules" + (Object.keys(EXTRA).length ? " and " + Object.keys(EXTRA).join(", ") : "") + ", but no other npm packages.");
  }
  window.process = process; window.Buffer = Buffer; window.global = window;

  /* ── requests from the page ── */
  addEventListener("message", function (e) {
    var d = e.data;
    if (!d || d.__synreq !== cfg.id) return;
    if (d.close) { var o = open[d.close]; if (o) { delete open[d.close]; o.req.emit("close"); o.res.emit("close"); } return; }
    if (crashed) { send({ k: "refused", id: d.id }); return; }
    var srv = servers[0];
    if (!srv) { send({ k: "refused", id: d.id }); return; }
    var r = new IncomingMessage(d), s = new ServerResponse(d.id, r);
    open[d.id] = { req: r, res: s };
    try { srv.emit("request", r, s); } catch (err) { crash(err); return; }
    setTimeout(function () { if (r._body) r.emit("data", new SyBuffer(r._body)); r.emit("end"); }, 0);
  });

  try { load(cfg.entry); }
  catch (e) { if (e && e.code === "SY_EXIT") return; crash(e); }
  send({ k: "booted" });
}

const safe = (js) => js.replace(/<\/script/gi, "<\\/script");

/** A running server in a hidden iframe. Call .ready before sending requests, .destroy() when done. */
export class NodeServer {
  constructor({ compiled, env, extra, onLog, onFs, onState }) {
    this.id = "syn" + Math.random().toString(36).slice(2);
    this.pending = {};
    this.state = "starting";
    this.port = null;
    this.onLog = onLog || (() => {});
    this.onFs = onFs || (() => {});
    this.onState = onState || (() => {});
    this.files = { ...compiled.raw };
    let readyRes;
    this.ready = new Promise((r) => { readyRes = r; });
    this._ready = readyRes;
    this.on = (e) => this.handle(e);
    addEventListener("message", this.on);
    const cfg = { id: this.id, mods: compiled.mods, raw: compiled.raw, entry: compiled.entry, env: env || {} };
    const extraSrc = extra ? "{" + Object.entries(extra).map(([k, f]) => JSON.stringify(k) + ":" + f.toString()).join(",") + "}" : "{}";
    const fr = document.createElement("iframe");
    fr.setAttribute("sandbox", "allow-scripts");
    fr.setAttribute("aria-hidden", "true");
    fr.tabIndex = -1;
    fr.style.cssText = "position:fixed;left:-10000px;top:0;width:10px;height:10px;border:0;visibility:hidden";
    fr.srcdoc = `<!doctype html><html><head><meta charset="utf-8"><script>(${safe(syNodeRuntime.toString())})(Object.assign(${safe(JSON.stringify(cfg))},{extra:${safe(extraSrc)}}));<\/script></head><body></body></html>`;
    this.frame = fr;
    document.body.appendChild(fr);
    this.timer = setTimeout(() => { if (this.state === "starting") { this.setState("stopped"); this._ready(false); } }, 6000);
  }
  setState(s) { this.state = s; this.onState(s, this.port); }
  handle(e) {
    const d = e.data;
    if (!d || d.__syn !== this.id) return;
    if (d.k === "log") this.onLog({ level: d.level, m: d.m });
    else if (d.k === "listening") { this.port = d.port; this.setState("listening"); this._ready(true); }
    else if (d.k === "settled") { if (this.state === "starting") { setTimeout(() => { if (this.state === "starting") { this.setState("exited"); this._ready(false); } }, 400); } }
    else if (d.k === "crash") {
      this.onLog({ level: "error", m: d.m });
      this.onLog({ level: "crash", m: "[node] app crashed - waiting for file changes before starting..." });
      this.setState("crashed"); this._ready(false);
      Object.values(this.pending).forEach((p) => p.fail("The server crashed while handling this request."));
    }
    else if (d.k === "exit") { this.onLog({ level: "info", m: "Process exited with code " + d.code }); this.setState("exited"); this._ready(false); }
    else if (d.k === "fs") { if (d.data == null) delete this.files[d.path]; else this.files[d.path] = d.data; this.onFs(d.path, d.data); }
    else if (d.k === "refused") { const p = this.pending[d.id]; if (p) p.fail("connect ECONNREFUSED 127.0.0.1:" + PORT + " — the server isn't running" + (this.state === "crashed" ? " (it crashed; check the terminal)." : ". Did you call server.listen()?")); }
    else if (d.k === "head") { const p = this.pending[d.id]; if (p) p.head(d); }
    else if (d.k === "chunk") { const p = this.pending[d.id]; if (p) p.chunk(d.data); }
    else if (d.k === "end") { const p = this.pending[d.id]; if (p) p.end(); }
  }
  post(m) { if (this.frame.contentWindow) this.frame.contentWindow.postMessage({ ...m, __synreq: this.id }, "*"); }
  /** Send a request. Resolves to { status, statusText, headers, body, json, error }. */
  request(method, url, { headers = {}, body = "", timeout = 5000, onHead, onChunk, sse = false } = {}) {
    const id = Math.random().toString(36).slice(2);
    const h = { host: "localhost:" + (this.port || PORT), "user-agent": "shipyard-client/1.0", accept: "*/*", ...Object.fromEntries(Object.entries(headers).map(([k, v]) => [k.toLowerCase(), v])) };
    let b = body;
    if (b && typeof b === "object") { b = JSON.stringify(b); h["content-type"] = h["content-type"] || "application/json"; }
    if (b) h["content-length"] = String(new TextEncoder().encode(b).length);
    return new Promise((resolve) => {
      const out = { status: 0, statusText: "", headers: {}, body: "", json: undefined, error: "" };
      const finish = () => {
        clearTimeout(t); delete this.pending[id];
        try { out.json = JSON.parse(out.body); } catch (e) { out.json = undefined; }
        resolve(out);
      };
      const t = setTimeout(() => {
        if (!out.status) out.error = "The request timed out after " + timeout / 1000 + "s with no response. Does every path through your handler call res.end()?";
        else out.error = "The response never finished. Did you forget res.end()?";
        this.post({ close: id });
        finish();
      }, timeout);
      this.pending[id] = {
        head: (d) => {
          out.status = d.status; out.statusText = d.statusText; out.headers = d.headers;
          if (sse && /event-stream/i.test(ctype(d.headers))) {
            clearTimeout(t); out.streaming = true;
            out.close = () => { if (this.pending[id]) { this.post({ close: id }); out.streaming = false; finish(); } };
          }
          if (onHead) onHead(out);
        },
        chunk: (c) => { out.body += c; if (onChunk) onChunk(c, out); },
        end: () => { out.streaming = false; finish(); },
        fail: (msg) => { out.error = msg; finish(); },
      };
      this.post({ id, method: method.toUpperCase(), url, headers: h, body: b || "" });
    });
  }
  /** Open a streaming request (e.g. Server-Sent Events). Returns a function that closes it. */
  stream(url, { onHead, onChunk, onDone } = {}) {
    const id = Math.random().toString(36).slice(2);
    const out = { status: 0, headers: {}, body: "" };
    this.pending[id] = {
      head: (d) => { out.status = d.status; out.headers = d.headers; if (onHead) onHead(out); },
      chunk: (c) => { out.body += c; if (onChunk) onChunk(c, out); },
      end: () => { delete this.pending[id]; if (onDone) onDone(out); },
      fail: (msg) => { delete this.pending[id]; out.error = msg; if (onDone) onDone(out); },
    };
    this.post({ id, method: "GET", url, headers: { host: "localhost:" + (this.port || PORT), accept: "text/event-stream" }, body: "" });
    return () => { if (this.pending[id]) { delete this.pending[id]; this.post({ close: id }); } };
  }
  destroy() {
    clearTimeout(this.timer);
    removeEventListener("message", this.on);
    Object.values(this.pending).forEach((p) => p.fail("Server stopped."));
    this.frame.remove();
  }
}

/* ── Browser preview: GET / from the server, inline its assets, and route fetch/EventSource back to it ── */

export const typeOf = (headers) => (Object.entries(headers || {}).find(([k]) => k.toLowerCase() === "content-type") || [])[1] || "";
const isLocal = (u) => u && !/^(https?:|data:|blob:|mailto:|#|\/\/)/i.test(u);

/* Runs inside the preview iframe: fetch() and EventSource for local URLs go to the parent. */
function syBrowserShim(id) {
  var n = 0, waits = {}, streams = {};
  var post = function (m) { m.__synb = id; parent.postMessage(m, "*"); };
  addEventListener("message", function (e) {
    var d = e.data; if (!d || d.__synbr !== id) return;
    if (d.res && waits[d.rid]) { var w = waits[d.rid]; delete waits[d.rid]; d.res.error ? w.rej(new TypeError("Failed to fetch")) : w.res(d.res); }
    if (d.sse && streams[d.rid]) streams[d.rid]._feed(d.sse);
    if (d.sseOpen && streams[d.rid]) streams[d.rid]._open();
    if (d.sseErr && streams[d.rid]) streams[d.rid]._err();
  });
  var local = function (u) { u = String(u); return !/^(https?:|data:|blob:)/i.test(u) || /^https?:\/\/localhost(:\d+)?\//i.test(u); };
  var realFetch = window.fetch;
  window.fetch = function (input, init) {
    var u = typeof input === "string" ? input : input.url;
    if (!local(u)) return realFetch.apply(this, arguments);
    init = init || {};
    var rid = ++n, headers = {};
    if (init.headers) new Headers(init.headers).forEach(function (v, k) { headers[k] = v; });
    var body = init.body;
    if (body && typeof body !== "string") {
      if (body instanceof FormData) { body = new URLSearchParams(body).toString(); headers["content-type"] = headers["content-type"] || "application/x-www-form-urlencoded"; }
      else body = String(body);
    }
    return new Promise(function (res, rej) {
      waits[rid] = { res: function (r) { res(new Response(r.status === 204 || r.status === 304 ? null : r.body, { status: r.status || 200, statusText: r.statusText, headers: r.headers })); }, rej: rej };
      post({ rid: rid, method: (init.method || "GET").toUpperCase(), url: u.replace(/^https?:\/\/localhost(:\d+)?/i, ""), headers: headers, body: body || "" });
    });
  };
  function SyEventSource(u) {
    var self = this, rid = ++n, buf = "";
    this.url = u; this.readyState = 0; this.onmessage = this.onopen = this.onerror = null; this._l = {};
    streams[rid] = this;
    this._open = function () { self.readyState = 1; self._fire("open", new Event("open")); };
    this._err = function () { self.readyState = 2; self._fire("error", new Event("error")); };
    this._feed = function (chunk) {
      buf += chunk;
      var parts = buf.split(/\r?\n\r?\n/); buf = parts.pop();
      parts.forEach(function (block) {
        var data = [], type = "message", lastId = "";
        block.split(/\r?\n/).forEach(function (line) {
          if (line.indexOf("data:") === 0) data.push(line.slice(5).replace(/^ /, ""));
          else if (line.indexOf("event:") === 0) type = line.slice(6).trim();
          else if (line.indexOf("id:") === 0) lastId = line.slice(3).trim();
        });
        if (data.length) self._fire(type, new MessageEvent(type, { data: data.join("\n"), lastEventId: lastId }));
      });
    };
    this.close = function () { self.readyState = 2; post({ closeStream: rid }); delete streams[rid]; };
    post({ stream: rid, url: String(u).replace(/^https?:\/\/localhost(:\d+)?/i, "") });
  }
  SyEventSource.prototype.addEventListener = function (t, f) { (this._l[t] = this._l[t] || []).push(f); };
  SyEventSource.prototype.removeEventListener = function (t, f) { this._l[t] = (this._l[t] || []).filter(function (x) { return x !== f; }); };
  SyEventSource.prototype._fire = function (t, ev) {
    if (typeof this["on" + t] === "function") this["on" + t](ev);
    (this._l[t] || []).forEach(function (f) { f(ev); });
  };
  SyEventSource.CONNECTING = 0; SyEventSource.OPEN = 1; SyEventSource.CLOSED = 2;
  window.EventSource = SyEventSource;
  /* in-page links and plain form posts become requests to the server too */
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("a[href]");
    if (a && local(a.getAttribute("href")) && a.getAttribute("href").charAt(0) !== "#") { e.preventDefault(); post({ navigate: a.getAttribute("href") }); }
  });
}

/** Build the browser preview document for `pathname`, using `server` to load the page and its assets. */
export async function buildBrowserDoc(server, pathname, id, consoleShim) {
  const r = await server.request("GET", pathname, { headers: { accept: "text/html" } });
  if (r.error) return { doc: errorPage("This site can’t be reached", r.error), res: r };
  const type = typeOf(r.headers);
  if (!/html/i.test(type)) {
    const shown = /json/i.test(type) && r.json !== undefined ? JSON.stringify(r.json, null, 2) : r.body;
    return { doc: `<!doctype html><html><body style="margin:0"><pre style="font:13px/1.5 ui-monospace,Menlo,monospace;padding:12px;white-space:pre-wrap;word-break:break-word">${escapeHtml(shown)}</pre></body></html>`, res: r };
  }
  const doc = new DOMParser().parseFromString(r.body, "text/html");
  const base = pathname.replace(/[^/]*$/, "") || "/";
  const abs = (u) => (u.charAt(0) === "/" ? u : base + u.replace(/^\.\//, ""));
  const jobs = [];
  doc.querySelectorAll('link[rel~="stylesheet"][href]').forEach((el) => {
    const u = el.getAttribute("href"); if (!isLocal(u)) return;
    jobs.push(server.request("GET", abs(u)).then((x) => {
      const s = doc.createElement("style"); s.textContent = x.status < 400 ? x.body : `/* ${u}: ${x.status || x.error} */`; el.replaceWith(s);
    }));
  });
  doc.querySelectorAll("script[src]").forEach((el) => {
    const u = el.getAttribute("src"); if (!isLocal(u)) return;
    jobs.push(server.request("GET", abs(u)).then((x) => {
      el.removeAttribute("src");
      el.textContent = x.status < 400 ? x.body : `console.error(${JSON.stringify("GET " + u + " " + (x.status || "") + " " + (x.error || x.statusText))})`;
    }));
  });
  doc.querySelectorAll("img[src], link[rel~='icon'][href]").forEach((el) => {
    const attr = el.tagName === "IMG" ? "src" : "href";
    const u = el.getAttribute(attr); if (!isLocal(u)) return;
    jobs.push(server.request("GET", abs(u)).then((x) => {
      if (x.status < 400) el.setAttribute(attr, /svg/i.test(typeOf(x.headers)) || /^\s*<svg/i.test(x.body) ? "data:image/svg+xml;charset=utf-8," + encodeURIComponent(x.body) : x.body);
    }));
  });
  await Promise.all(jobs);
  const head = doc.head || doc.documentElement;
  const shim = doc.createElement("script");
  shim.textContent = `(${syBrowserShim.toString()})(${JSON.stringify(id)});`;
  head.insertBefore(shim, head.firstChild);
  if (consoleShim) head.insertAdjacentHTML("afterbegin", consoleShim);
  return { doc: "<!doctype html>" + doc.documentElement.outerHTML, res: r };
}

export const escapeHtml = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const errorPage = (title, msg) => `<!doctype html><html><body style="margin:0;font:14px/1.5 system-ui,sans-serif;color:#3c4043;display:grid;place-items:center;height:100vh;background:#fff"><div style="max-width:420px;padding:20px"><div style="font-size:40px">☹︎</div><h2 style="font-weight:500;margin:.2em 0">${escapeHtml(title)}</h2><p>${escapeHtml(msg)}</p></div></body></html>`;
