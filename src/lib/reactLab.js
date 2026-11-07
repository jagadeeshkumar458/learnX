/* The in-browser React lab.
   Learner files (App.jsx, components/Header.jsx, index.css…) are compiled from JSX to CommonJS by the
   TypeScript compiler (loaded lazily from /vendor), then run inside a sandboxed iframe with React 19
   and a tiny module system: `import { useState } from "react"`, `import Header from "./Header"`,
   `import "./index.css"` and image imports all work like they do in a Vite project. */

import { MOCK_API_SCRIPT } from "./mockApi.js";
import { consoleShim } from "./consoleShim.js";

const REACT_FILE = "react-19.2.8.js";
const TS_FILE = "typescript-6.0.3.js";
export const vendorUrl = (f) => new URL("vendor/" + f, document.baseURI).href;

const scripts = {};
const loadScript = (url) =>
  scripts[url] || (scripts[url] = new Promise((res, rej) => {
    const s = document.createElement("script");
    s.src = url; s.async = true;
    s.onload = res;
    s.onerror = () => { delete scripts[url]; rej(new Error("Couldn't load " + url)); };
    document.head.appendChild(s);
  }));

/** Resolves to the TypeScript compiler (≈1 MB gzipped, cached after the first React lesson). */
export async function loadCompiler() {
  if (!window.ts) await loadScript(vendorUrl(TS_FILE));
  return window.ts;
}

/** Compile learner files. Returns { mods: {file: js}, css, errors: ["App.jsx:3:7 message"] }. */
export function compile(ts, files) {
  const mods = {}, errors = [];
  let css = "";
  for (const [name, code] of Object.entries(files)) {
    if (/\.css$/i.test(name)) { css += code + "\n"; continue; }
    if (!/\.(jsx?|tsx?)$/i.test(name)) continue;
    const r = ts.transpileModule(code, {
      fileName: name,
      reportDiagnostics: true,
      compilerOptions: {
        jsx: ts.JsxEmit.ReactJSX,
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2020,
        esModuleInterop: true,
      },
    });
    for (const d of r.diagnostics || []) {
      const pos = d.file && d.start != null ? d.file.getLineAndCharacterOfPosition(d.start) : null;
      errors.push(`${name}${pos ? `:${pos.line + 1}:${pos.character + 1}` : ""}  ${ts.flattenDiagnosticMessageText(d.messageText, "\n")}`);
    }
    mods[name] = r.outputText;
  }
  return { mods, css, errors, src: files };
}

/* Runs inside the iframe. Must stay self-contained: it is injected with Function.prototype.toString(). */
function syReactRuntime(cfg, TESTS) {
  var roots = [], cache = {};
  var createRoot = ReactDOM.createRoot;
  ReactDOM.createRoot = function (el, o) { var r = createRoot(el, o); roots.push(r); return r; };
  var norm = function (n) { return n.replace(/^(\.\.?\/)+/, ""); };
  function resolve(name) {
    var n = norm(name), c = [n, n + ".jsx", n + ".js", n + ".tsx", n + ".ts", n + "/index.jsx", n + "/index.js"];
    for (var i = 0; i < c.length; i++) if (cfg.mods[c[i]] != null) return c[i];
    var base = n.split("/").pop();   // "../components/Header" also finds "Header.jsx"
    for (var f in cfg.mods) if (f.replace(/\.(jsx?|tsx?)$/, "").split("/").pop() === base) return f;
    return null;
  }
  function load(file) {
    if (cache[file]) return cache[file].exports;
    var module = { exports: {} };
    cache[file] = module;
    var fn = new Function("require", "module", "exports", "React", cfg.mods[file] + "\n//# sourceURL=" + file);
    fn(req, module, module.exports, React);
    return module.exports;
  }
  function req(name) {
    if (name === "react") return React;
    if (name === "react-dom" || name === "react-dom/client") return ReactDOM;
    if (name === "react/jsx-runtime" || name === "react/jsx-dev-runtime") return window.__syJSX;
    var f = resolve(name);
    if (f) return load(f);
    var a = norm(name);
    if (cfg.assets && cfg.assets[a] != null) return { __esModule: true, default: cfg.assets[a] };
    if (/\.(css|scss)$/i.test(name)) return {};
    if (/\.(png|jpe?g|gif|svg|webp|avif)$/i.test(name)) return { __esModule: true, default: a };
    throw new Error("Cannot find module '" + name + "'. Check the file name and the path in your import.");
  }
  function start() {
    roots.forEach(function (r) { try { r.unmount(); } catch (e) {} });
    roots = []; cache = {};
    document.body.innerHTML = cfg.html;
    var entry = resolve(cfg.entry) || resolve("index") || resolve("main") || resolve("App");
    if (!entry) throw new Error("No index.jsx or App.jsx file found.");
    var ex = load(entry);
    // A file that only exports a component (no createRoot call) is mounted automatically.
    if (!roots.length && ex && typeof ex.default === "function") {
      ReactDOM.createRoot(document.getElementById("root") || document.body).render(React.createElement(ex.default));
    }
  }
  function report(e) { console.error((e && e.name ? e.name + ": " + e.message : String(e))); }

  if (!TESTS) {
    var go = function () { try { start(); } catch (e) { report(e); } };
    document.readyState === "loading" ? addEventListener("DOMContentLoaded", go) : go();
    return;
  }

  /* ── test mode: each test gets a fresh mount of the learner's app ── */
  var logs = [], fetches = [];
  if (window.fetch) {
    var realFetch = window.fetch;
    window.fetch = function (u) { fetches.push(String(u && u.url ? u.url : u)); return realFetch.apply(this, arguments); };
  }
  ["error", "warn"].forEach(function (k) {
    var o = console[k];
    console[k] = function () { logs.push([].slice.call(arguments).map(String).join(" ")); return o.apply(console, arguments); };
  });
  addEventListener("error", function (e) { logs.push(String(e.message)); });
  var tick = function (ms) { return new Promise(function (r) { setTimeout(r, ms == null ? 30 : ms); }); };
  var el = function (s) { var x = typeof s === "string" ? document.querySelector(s) : s; if (!x) throw new Error("Couldn't find " + s + " on the page."); return x; };
  var $$ = function (s, root) { return Array.from((root || document).querySelectorAll(s)); };
  var clean = function (t) { return String(t || "").replace(/\s+/g, " ").trim(); };
  var setValue = function (x, v) {
    var proto = x.tagName === "TEXTAREA" ? HTMLTextAreaElement.prototype : x.tagName === "SELECT" ? HTMLSelectElement.prototype : HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(proto, "value").set.call(x, v);
    x.dispatchEvent(new Event("input", { bubbles: true }));
    x.dispatchEvent(new Event("change", { bubbles: true }));
  };
  var h = {
    React: React, ReactDOM: ReactDOM, logs: logs, fetches: fetches, tick: tick, $$: $$,
    src: function (name) { var f = resolve(name); return f ? cfg.src[f] || "" : ""; },
    $: function (s) { return document.querySelector(s); },
    text: function (s) { return clean(s ? (typeof s === "string" ? (document.querySelector(s) || {}).textContent : s.textContent) : document.body.textContent); },
    button: function (re) { return $$("button").find(function (b) { return typeof re === "string" ? clean(b.textContent).toLowerCase().indexOf(re.toLowerCase()) >= 0 : re.test(clean(b.textContent)); }); },
    click: async function (s) { el(s).click(); await tick(); },
    type: async function (s, v) { setValue(el(s), v); await tick(); },
    submit: async function (s) { var f = el(s || "form"); f = f.tagName === "FORM" ? f : f.closest("form"); f.requestSubmit(); await tick(80); },
    until: async function (fn, ms) {
      var t0 = Date.now();
      for (;;) { try { var v = fn(); if (v) return v; } catch (e) {} if (Date.now() - t0 > (ms || 3000)) return false; await tick(25); }
    },
    remount: async function () { start(); await tick(40); },
    mod: function (name) { var f = resolve(name); if (!f) throw new Error("Couldn't find the file " + name + "."); return load(f); },
    render: async function (C, props) {
      var div = document.createElement("div");
      document.body.appendChild(div);
      ReactDOM.createRoot(div).render(React.createElement.apply(React, [C, props].concat([].slice.call(arguments, 2))));
      await tick();
      return div;
    },
    noWarnings: function (re) { return !logs.some(function (l) { return (re || /Warning|Invalid DOM|unique "key"|Each child|Did you mean|not wrapped in act/).test(l); }); },
  };
  var rnd = Math.random;
  async function run() {
    var out = [];
    for (var i = 0; i < TESTS.length; i++) {
      var ok = false, err = "";
      try {
        logs.length = 0; fetches.length = 0;
        start();
        await tick(40);
        ok = !!(await Promise.race([TESTS[i](h), new Promise(function (_, rej) { setTimeout(function () { rej(new Error("A test timed out after 5s.")); }, 5000); })]));
      } catch (e) { err = e && e.message ? e.message : String(e); }
      Math.random = rnd;
      out.push({ ok: ok, err: err });
    }
    parent.postMessage({ __syt: cfg.id, results: out }, "*");
  }
  document.readyState === "loading" ? addEventListener("DOMContentLoaded", run) : run();
}

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
const safe = (js) => js.replace(/<\/script/gi, "<\\/script");

/** Build the iframe document for compiled files. `tests` (array of functions) switches on test mode. */
export function buildReactDoc({ compiled, html, entry, assets, id, api, tests, testId }) {
  const { mods, css, errors } = compiled;
  const cfg = { mods, src: compiled.src || {}, html: html || '<div id="root"></div>', entry: entry || "index.jsx", assets: assets || {}, id: testId || "" };
  const head = `<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${css}</style>${id ? consoleShim(id) : ""}${api ? "<script>" + MOCK_API_SCRIPT + "<\/script>" : ""}`;
  if (errors.length) {
    return `<!doctype html><html><head>${head}<style>.sy-err{font:13px/1.5 ui-monospace,Menlo,monospace;color:#b42318;background:#fff1f0;border:1px solid #fbc4c0;border-radius:10px;padding:12px 14px;margin:12px;white-space:pre-wrap}</style></head><body><div class="sy-err"><b>Syntax error</b>\n${esc(errors.join("\n"))}</div><script>console.error(${JSON.stringify("SyntaxError " + errors[0])})<\/script></body></html>`;
  }
  const testSrc = tests ? "[" + tests.map((t) => "(" + t.fn.toString() + ")").join(",\n") + "]" : "null";
  return `<!doctype html><html><head>${head}<script src="${vendorUrl(REACT_FILE)}"><\/script><script>(${safe(syReactRuntime.toString())})(${safe(JSON.stringify(cfg))}, ${safe(testSrc)});<\/script></head><body></body></html>`;
}

/** Run a React challenge's tests in a hidden iframe. Resolves to [{ok, err}] (one per test). */
export function runReactTests(doc, testId, count) {
  return new Promise((resolve) => {
    const fr = document.createElement("iframe");
    fr.setAttribute("sandbox", "allow-scripts allow-forms allow-modals");
    fr.setAttribute("aria-hidden", "true");
    fr.tabIndex = -1;
    fr.style.cssText = "position:fixed;left:-10000px;top:0;width:900px;height:700px;border:0;visibility:hidden";
    const done = (results) => { clearTimeout(timer); removeEventListener("message", on); fr.remove(); resolve(results); };
    const on = (e) => { if (e.data && e.data.__syt === testId) done(e.data.results); };
    const timer = setTimeout(() => done(Array.from({ length: count }, () => ({ ok: false, err: "Your app took too long to respond. Is there an infinite loop or an effect that keeps re-running?" }))), 20000 + count * 1500);
    addEventListener("message", on);
    fr.srcdoc = doc;
    document.body.appendChild(fr);
  });
}
