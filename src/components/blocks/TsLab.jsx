import React, { useEffect, useId, useRef, useState } from "react";
import { useProgress } from "../../lib/progress.jsx";
import Editor from "./Editor.jsx";
import { ChallengeShell } from "./Challenge.jsx";
import { loadCompiler } from "../../lib/reactLab.js";
import { consoleShim } from "../../lib/consoleShim.js";
import { typecheck, fmtDiag, probeCompiles } from "../../lib/tsCheck.js";

const checkOpts = (b) => ({ dom: !!(b.typecheck && b.typecheck.dom), types: (b.typecheck && b.typecheck.types) || [], strict: !(b.typecheck && b.typecheck.strict === false) });

/** Live list of type errors for a set of files (debounced). */
export function TypeProblems({ files, b, compact }) {
  const [state, setState] = useState({ busy: true, diags: [] });
  const optKey = JSON.stringify(checkOpts(b));
  useEffect(() => {
    let live = true;
    const t = setTimeout(() => {
      setState((s) => ({ ...s, busy: true }));
      typecheck(files, checkOpts(b)).then((diags) => live && setState({ busy: false, diags }), (e) => live && setState({ busy: false, diags: [], err: e.message }));
    }, 500);
    return () => { live = false; clearTimeout(t); };
  }, [files, optKey]); // eslint-disable-line react-hooks/exhaustive-deps
  const n = state.diags.length;
  return (
    <div className={"tsprob" + (compact ? " compact" : "")} aria-live="polite">
      <div className="tsprob-h">
        <span className="tsbadge">TS</span> Problems
        <span className={"tsprob-n " + (state.busy ? "busy" : n ? "bad" : "ok")}>{state.busy ? "checking…" : state.err ? state.err : n ? `${n} error${n > 1 ? "s" : ""}` : "✓ no type errors"}</span>
      </div>
      {!state.busy && n > 0 && (
        <ul>{state.diags.slice(0, 12).map((d, i) => <li key={i}><span className="tsloc">{d.file}:{d.line}:{d.col}</span> <span className="tscode">TS{d.code}</span> {d.msg}</li>)}</ul>
      )}
    </div>
  );
}

/* Compile .ts files to CommonJS and run them with a tiny module system. */
function compileAll(ts, files) {
  const mods = {};
  for (const [name, code] of Object.entries(files)) {
    if (!/\.(tsx?|js)$/.test(name)) continue;
    mods[name] = ts.transpileModule(code, { fileName: name, compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  }
  return mods;
}
function makeRequire(mods, globals) {
  const cache = {};
  const resolve = (name, from) => {
    const parts = from.split("/").slice(0, -1);
    name.replace(/\.js$/, "").split("/").forEach((p) => { if (p === "..") parts.pop(); else if (p !== ".") parts.push(p); });
    const base = parts.join("/");
    return [base, base + ".ts", base + ".tsx", base + ".js", base + "/index.ts"].find((c) => mods[c] != null);
  };
  const load = (file) => {
    if (cache[file]) return cache[file].exports;
    const module = { exports: {} };
    cache[file] = module;
    const req = (n) => {
      const f = resolve(n, file);
      if (!f) throw new Error(`Cannot find module '${n}' from ${file}`);
      return load(f);
    };
    new Function("require", "module", "exports", ...Object.keys(globals), mods[file] + "\n//# sourceURL=" + file)(req, module, module.exports, ...Object.values(globals));
    return module.exports;
  };
  return load;
}

/** Run an entry file in a sandboxed iframe and stream its console output. */
function runInFrame(mods, entry, id) {
  const doc = `<!doctype html><html><head><meta charset="utf-8">${consoleShim(id)}</head><body><script>(function(){var mods=${JSON.stringify(mods).replace(/<\/script/gi, "<\\/script")};var cache={};
function res(n,from){var parts=from.split("/").slice(0,-1);n.replace(/\\.js$/,"").split("/").forEach(function(p){if(p==="..")parts.pop();else if(p!==".")parts.push(p)});var b=parts.join("/");return [b,b+".ts",b+".tsx",b+".js",b+"/index.ts"].find(function(c){return mods[c]!=null})}
function load(f){if(cache[f])return cache[f].exports;var m={exports:{}};cache[f]=m;new Function("require","module","exports",mods[f]+"\\n//# sourceURL="+f)(function(n){var r=res(n,f);if(!r)throw new Error("Cannot find module '"+n+"'");return load(r)},m,m.exports);return m.exports}
try{load(${JSON.stringify(entry)})}catch(e){console.error(e.name+": "+e.message)}})();<\/script></body></html>`;
  const fr = document.createElement("iframe");
  fr.setAttribute("sandbox", "allow-scripts");
  fr.style.cssText = "position:fixed;left:-10000px;width:10px;height:10px;border:0;opacity:0";
  fr.srcdoc = doc;
  document.body.appendChild(fr);
  setTimeout(() => fr.remove(), 8000);
}

/** `tsplay` block: TypeScript files with live type errors and a Run button. */
export function TsPlayground({ b, k }) {
  const { S, update } = useProgress();
  const id = useId();
  const tabs = b.tabs || Object.keys(b.files);
  const [vals, setVals] = useState(() => ({ ...b.files, ...(S.code[k] || {}) }));
  const [logs, setLogs] = useState([]);
  const conRef = useRef(null);
  useEffect(() => {
    const on = (e) => { const d = e.data; if (d && d.__sy === id) setLogs((l) => [...l.slice(-80), d]); };
    addEventListener("message", on);
    return () => removeEventListener("message", on);
  }, [id]);
  useEffect(() => { if (conRef.current) conRef.current.scrollTop = 1e6; }, [logs]);
  const change = (t, v) => { const next = { ...vals, [t]: v }; setVals(next); update((s) => { s.code = { ...s.code, [k]: next }; }); };
  const run = async () => {
    setLogs([]);
    const ts = await loadCompiler();
    runInFrame(compileAll(ts, vals), b.entry || tabs[0], id);
  };
  return (
    <div className="play tsplay">
      {b.task && <div className="play-task"><span className="pill build">Try it</span><span dangerouslySetInnerHTML={{ __html: b.task }} /></div>}
      <div className="play-grid">
        <Editor tabs={tabs} values={vals} idPrefix={"ts-" + k.replace(/\W/g, "-")} onChange={change} onRun={run} />
        <div className="tspanel">
          <TypeProblems files={vals} b={b} />
          <div className="console tscon" ref={conRef}>
            {logs.length === 0 && <div className="l dim">Press ▶ Run to execute {b.entry || tabs[0]} (types are erased: TypeScript runs as JavaScript)</div>}
            {logs.map((l, i) => <div key={i} className={"l" + (l.k === "error" ? " err" : l.k === "warn" ? " warn" : "")}>{(l.k === "error" ? "✖ " : "› ") + l.m}</div>)}
          </div>
        </div>
      </div>
      <div className="pbar">
        <button className="mini run" onClick={run}>▶ Run</button>
        <button className="mini" onClick={() => { setVals({ ...b.files }); setLogs([]); update((s) => { const c = { ...s.code }; delete c[k]; s.code = c; }); }}>Reset</button>
        <span className="sp" />
        <span className="tiny" style={{ margin: 0 }}><span className="rw-badge">tsc --strict</span> checks as you type</span>
      </div>
    </div>
  );
}

/** `tsch` block: no type errors + behaviour tests + type probes. Tests get `t`:
    t.mod(file) exports · t.src(file) · t.errors · t.compiles(code, file?) · t.fails(code, file?) */
export function TsChallenge({ b, k }) {
  const tabs = b.tabs || Object.keys(b.files);
  const main = b.main || tabs[0];
  const tests = [...(b.allowErrors ? [] : [{ msg: "No type errors (strict mode)" }]), ...b.tests];
  const evaluate = async (v) => {
    let error = "";
    const errors = await typecheck(v, checkOpts(b));
    const ts = await loadCompiler();
    let load = null;
    try { load = makeRequire(compileAll(ts, v), {}); } catch (e) { error = e.message; }
    const t = {
      errors, src: (f) => v[f || main] || "",
      mod: (f) => load(f || main),
      compiles: (code, f) => probeCompiles(v, f || main, code, checkOpts(b)),
      fails: async (code, f) => !(await probeCompiles(v, f || main, code, checkOpts(b))),
    };
    const results = [];
    if (!b.allowErrors) { results.push(errors.length === 0); if (errors.length) error = fmtDiag(errors[0]); }
    for (const test of b.tests) {
      try { results.push(!!(await Promise.race([Promise.resolve().then(() => test.fn(t)), new Promise((_, rej) => setTimeout(() => rej(new Error("A test timed out.")), 6000))]))); }
      catch (e) { results.push(false); if (!error) error = `${e.name}: ${e.message}`; }
    }
    return { results, error };
  };
  return <ChallengeShell b={b} k={k} tabs={tabs} starter={b.files} tests={tests} evaluate={evaluate} solution={b.solution} extra={(vals) => <div className="chal-preview"><TypeProblems files={vals} b={b} compact /></div>} />;
}
