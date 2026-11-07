import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import { useProgress } from "../../lib/progress.jsx";
import Editor from "./Editor.jsx";
import { ChallengeShell } from "./Challenge.jsx";
import { loadCompiler, compile, buildReactDoc, runReactTests } from "../../lib/reactLab.js";

const LOADING = `<!doctype html><html><body style="margin:0;display:grid;place-items:center;height:100vh;font:600 14px system-ui;color:#8a8f98"><div>⚛︎ Loading React…</div></body></html>`;

/** Load the JSX compiler once per page; returns null until it's ready (or an error message). */
function useCompiler() {
  const [ts, setTs] = useState(() => window.ts || null);
  const [err, setErr] = useState("");
  useEffect(() => {
    if (ts) return;
    let live = true;
    loadCompiler().then((t) => live && setTs(() => t), (e) => live && setErr(e.message));
    return () => { live = false; };
  }, [ts]);
  return [ts, err];
}

/** Live preview of a set of React files, with an optional console. */
function ReactPreview({ files, b, id, height, onLog, stamp }) {
  const [ts, err] = useCompiler();
  const doc = useMemo(() => !ts
    ? (err ? LOADING.replace("⚛︎ Loading React…", "Couldn't load the React compiler. Check your connection and reload.") : LOADING)
    : buildReactDoc({ compiled: compile(ts, files), html: b.html, entry: b.entry, assets: b.assets, api: b.api, id }) + `<!--${stamp}-->`,
  [ts, err, files, stamp, b, id]);
  useEffect(() => {
    if (!onLog) return;
    const on = (e) => { const d = e.data; if (d && d.__sy === id) onLog(d); };
    addEventListener("message", on);
    return () => removeEventListener("message", on);
  }, [id, onLog]);
  return (
    <div className="preview rpreview" style={height ? { minHeight: height } : null}>
      <iframe sandbox="allow-scripts allow-modals allow-forms" title="React preview" srcDoc={doc} />
    </div>
  );
}

/** `rplay` block: editable multi-file React project with live preview and console. */
export function ReactPlayground({ b, k }) {
  const { S, update } = useProgress();
  const id = useId();
  const tabs = Object.keys(b.files);
  const [vals, setVals] = useState(() => ({ ...b.files, ...(S.code[k] || {}) }));
  const [shown, setShown] = useState(vals);
  const [stamp, setStamp] = useState(0);
  const [logs, setLogs] = useState([]);
  const conRef = useRef(null);
  const onLog = useRef((d) => setLogs((l) => [...l.slice(-60), { k: d.k, m: d.m }])).current;

  const run = (v = vals) => { setLogs([]); setShown(v); setStamp(Date.now()); };

  const mounted = useRef(false);
  useEffect(() => {
    if (!mounted.current) { mounted.current = true; return; }
    const t = setTimeout(() => {
      run(vals);
      update((s) => { s.code = { ...s.code, [k]: vals }; });
    }, 600);
    return () => clearTimeout(t);
  }, [vals]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { if (conRef.current) conRef.current.scrollTop = conRef.current.scrollHeight; }, [logs]);

  const reset = () => {
    setVals({ ...b.files });
    update((s) => { const c = { ...s.code }; delete c[k]; s.code = c; });
  };

  return (
    <div className="play rplay">
      {b.task && <div className="play-task"><span className="pill build">Try it</span><span dangerouslySetInnerHTML={{ __html: b.task }} /></div>}
      <div className="play-grid">
        <Editor tabs={tabs} values={vals} idPrefix={"rp-" + k.replace(/\W/g, "-")}
          onChange={(t, v) => setVals((o) => ({ ...o, [t]: v }))} onRun={() => run()} />
        <ReactPreview files={shown} b={b} id={id} onLog={onLog} stamp={stamp} />
      </div>
      <div className="pbar">
        <button className="mini run" onClick={() => run()}>▶ Run</button>
        <button className="mini" onClick={reset}>Reset</button>
        <span className="sp" />
        <span className="tiny" style={{ margin: 0 }}><span className="react-badge">⚛︎ React 19</span> Ctrl + Enter</span>
      </div>
      <div className="console" ref={conRef}>
        {logs.map((l, i) => (
          <div key={i} className={"l" + (l.k === "error" ? " err" : l.k === "warn" ? " warn" : "")}>{(l.k === "error" ? "✖ " : l.k === "warn" ? "⚠ " : "› ") + l.m}</div>
        ))}
      </div>
    </div>
  );
}

/** `rch` block: a React challenge. Tests are functions `async (h) => boolean` run against a fresh mount. */
export function ReactChallenge({ b, k }) {
  const id = useId();
  const evaluate = async (v) => {
    const fail = (error) => ({ results: b.tests.map(() => false), error });
    let ts;
    try { ts = await loadCompiler(); } catch (e) { return fail(e.message); }
    const compiled = compile(ts, v);
    if (compiled.errors.length) return fail("Syntax error · " + compiled.errors[0]);
    const testId = id + ":" + Date.now();
    const doc = buildReactDoc({ compiled, html: b.html, entry: b.entry, assets: b.assets, api: b.api, tests: b.tests, testId });
    const out = await runReactTests(doc, testId, b.tests.length);
    return { results: out.map((r) => r.ok), error: (out.find((r) => r.err) || {}).err || "" };
  };
  return (
    <ChallengeShell b={b} k={k} tabs={Object.keys(b.files)} starter={b.files} tests={b.tests} evaluate={evaluate}
      solution={b.solution} extra={(vals) => <ChallengePreview vals={vals} b={b} />} />
  );
}

function ChallengePreview({ vals, b }) {
  const id = useId();
  const [shown, setShown] = useState(vals);
  useEffect(() => { const t = setTimeout(() => setShown(vals), 700); return () => clearTimeout(t); }, [vals]);
  return (
    <div className="chal-preview">
      <div className="chal-preview-h">Live preview</div>
      <ReactPreview files={shown} b={b} id={id} stamp={0} />
    </div>
  );
}
