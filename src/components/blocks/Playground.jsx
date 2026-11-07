import React, { useCallback, useEffect, useId, useRef, useState } from "react";
import { useProgress } from "../../lib/progress.jsx";
import Editor from "./Editor.jsx";
import { MOCK_API_SCRIPT } from "../../lib/mockApi.js";

const TABS = ["html", "css", "js"];

/* Injected into the preview: forwards console output and errors to the parent page. */
const consoleShim = (id) => `<script>(function(){var send=function(k,a){try{parent.postMessage({__sy:${JSON.stringify(id)},k:k,m:a.map(function(x){try{return typeof x==="object"?JSON.stringify(x):String(x)}catch(e){return String(x)}}).join(" ")},"*")}catch(e){}};["log","info","warn","error"].forEach(function(k){var o=console[k];console[k]=function(){send(k,[].slice.call(arguments));o&&o.apply(console,arguments)}});window.onerror=function(m,s,l){send("error",[m+" (line "+l+")"])};window.onunhandledrejection=function(e){var r=e.reason;send("error",["Uncaught (in promise) "+(r&&r.message?r.name+": "+r.message:String(r))])};})();<\/script>`;

export const buildDoc = (v, id, api) =>
  `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${v.css || ""}</style>${id ? consoleShim(id) : ""}${api ? "<script>" + MOCK_API_SCRIPT + "<\/script>" : ""}</head><body>${v.html || ""}<script>${(v.js || "").replace(/<\/script/gi, "<\\/script")}<\/script></body></html>`;

export default function Playground({ b, k }) {
  const { S, update } = useProgress();
  const id = useId();
  const initial = () => ({ html: b.html || "", css: b.css || "", js: b.js || "", ...(S.code[k] || {}) });
  const [vals, setVals] = useState(initial);
  const [doc, setDoc] = useState(() => buildDoc(initial(), id, b.api));
  const [logs, setLogs] = useState([]);
  const conRef = useRef(null);

  const run = useCallback((v = vals) => { setLogs([]); setDoc(buildDoc(v, id, b.api) + `<!--${Date.now()}-->`); }, [vals, id, b.api]);

  // Live preview: re-run shortly after typing stops, and persist the learner's code.
  const mounted = useRef(false);
  useEffect(() => {
    // the preview already rendered on mount; only re-run after the learner edits
    if (!mounted.current) { mounted.current = true; return; }
    const t = setTimeout(() => {
      run(vals);
      update((s) => { s.code = { ...s.code, [k]: vals }; });
    }, 450);
    return () => clearTimeout(t);
  }, [vals]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const on = (e) => {
      const d = e.data;
      if (!d || d.__sy !== id) return;
      setLogs((l) => [...l, { k: d.k, m: d.m }]);
    };
    addEventListener("message", on);
    return () => removeEventListener("message", on);
  }, [id]);

  useEffect(() => { if (conRef.current) conRef.current.scrollTop = conRef.current.scrollHeight; }, [logs]);

  const reset = () => {
    const v = { html: b.html || "", css: b.css || "", js: b.js || "" };
    setVals(v);
    update((s) => { const c = { ...s.code }; delete c[k]; s.code = c; });
  };

  return (
    <div className="play">
      {b.task && <div className="play-task"><span className="pill build">Try it</span><span>{b.task}</span></div>}
      <div className="play-grid">
        <Editor tabs={TABS} values={vals} idPrefix={"ed-" + k.replace(/\W/g, "-")}
          onChange={(t, v) => setVals((o) => ({ ...o, [t]: v }))} onRun={() => run()} />
        <div className="preview">
          <iframe sandbox="allow-scripts allow-modals allow-forms" title="Live preview" srcDoc={doc} />
        </div>
      </div>
      <div className="pbar">
        <button className="mini run" onClick={() => run()}>▶ Run</button>
        <button className="mini" onClick={reset}>Reset</button>
        <span className="sp" />
        <span className="tiny" style={{ margin: 0 }}>Ctrl + Enter</span>
      </div>
      <div className="console" ref={conRef}>
        {logs.map((l, i) => (
          <div key={i} className={"l" + (l.k === "error" ? " err" : "")}>{(l.k === "error" ? "✖ " : "› ") + l.m}</div>
        ))}
      </div>
    </div>
  );
}
