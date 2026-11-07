import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import { useProgress } from "../../lib/progress.jsx";
import Editor from "./Editor.jsx";
import { ChallengeShell } from "./Challenge.jsx";
import { loadCompiler, compileNext, buildNextDoc } from "../../lib/nextLab.js";

const LOADING = `<!doctype html><html><body style="margin:0;display:grid;place-items:center;height:100vh;font:600 14px system-ui;color:#8a8f98">▲ Starting Next.js…</body></html>`;

function useTs() {
  const [ts, setTs] = useState(() => window.ts || null);
  useEffect(() => { if (!ts) loadCompiler().then((t) => setTs(() => t)); }, [ts]);
  return ts;
}

/** Browser preview with an address bar, plus the dev-server terminal and the browser console. */
function NextPreview({ files, b, stamp, showLogs = true }) {
  const id = useId();
  const ts = useTs();
  const frame = useRef(null);
  const [route, setRoute] = useState({ path: b.startPath || "/", canBack: false, canFwd: false });
  const [typed, setTyped] = useState(null);
  const [server, setServer] = useState([]);
  const [client, setClient] = useState([]);
  const [tab, setTab] = useState("server");
  const doc = useMemo(() => (ts ? buildNextDoc({ compiled: compileNext(ts, files), files, id, startPath: b.startPath, env: b.env }) + `<!--${stamp}-->` : LOADING), [ts, files, stamp, id, b.startPath, b.env]);
  useEffect(() => { setServer([]); setClient([]); }, [doc]);
  useEffect(() => {
    const on = (e) => {
      const d = e.data;
      if (!d) return;
      if (d.__synext === id) {
        if (d.route) setRoute({ path: d.path, canBack: d.canBack, canFwd: d.canFwd });
        else if (d.server) setServer((l) => [...l.slice(-60), d]);
      } else if (d.__sy === id) setClient((l) => [...l.slice(-60), d]);
    };
    addEventListener("message", on);
    return () => removeEventListener("message", on);
  }, [id]);
  const nav = (m) => frame.current && frame.current.contentWindow && frame.current.contentWindow.postMessage({ __synav: id, ...m }, "*");
  const logs = tab === "server" ? server : client;
  return (
    <div className="nextpv">
      <div className="preview rpreview routed">
        <form className="urlbar" onSubmit={(e) => { e.preventDefault(); if (typed != null) nav({ path: typed.startsWith("/") ? typed : "/" + typed }); setTyped(null); }}>
          <button type="button" aria-label="Back" disabled={!route.canBack} onClick={() => nav({ delta: -1 })}>←</button>
          <button type="button" aria-label="Forward" disabled={!route.canFwd} onClick={() => nav({ delta: 1 })}>→</button>
          <span className="urlhost" aria-hidden="true">localhost:3000</span>
          <input aria-label="Address" value={typed != null ? typed : route.path} onChange={(e) => setTyped(e.target.value)} onBlur={() => setTyped(null)} spellCheck={false} />
        </form>
        <iframe ref={frame} sandbox="allow-scripts allow-forms" title="Next.js preview" srcDoc={doc} />
      </div>
      {showLogs && (
        <div className="nextlogs">
          <div className="ntabs" role="tablist">
            <button role="tab" aria-selected={tab === "server"} className={tab === "server" ? "on" : ""} onClick={() => setTab("server")}>▲ Terminal (server){server.length ? ` · ${server.length}` : ""}</button>
            <button role="tab" aria-selected={tab === "client"} className={tab === "client" ? "on" : ""} onClick={() => setTab("client")}>🌐 Browser console{client.length ? ` · ${client.length}` : ""}</button>
          </div>
          <div className="console nextcon">
            {logs.length === 0 && <div className="l dim">{tab === "server" ? "console.log in Server Components prints here, in the terminal, never in the browser." : "console.log in Client Components prints here."}</div>}
            {logs.map((l, i) => <div key={i} className={"l" + (l.k === "error" ? " err" : l.k === "warn" ? " warn" : "")}>{(l.k === "error" ? "✖ " : "› ") + l.m}</div>)}
          </div>
        </div>
      )}
    </div>
  );
}

/** `nxplay` block: a Next.js App Router project you can edit and browse. */
export function NextPlayground({ b, k }) {
  const { S, update } = useProgress();
  const tabs = b.tabs || Object.keys(b.files);
  const [vals, setVals] = useState(() => ({ ...b.files, ...(S.code[k] || {}) }));
  const [shown, setShown] = useState(vals);
  const [stamp, setStamp] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => { setShown(vals); update((s) => { s.code = { ...s.code, [k]: vals }; }); }, 800);
    return () => clearTimeout(t);
  }, [vals]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className="play nxplay">
      {b.task && <div className="play-task"><span className="pill build">Try it</span><span dangerouslySetInnerHTML={{ __html: b.task }} /></div>}
      <div className="play-grid">
        <Editor tabs={tabs} values={vals} idPrefix={"nx-" + k.replace(/\W/g, "-")} onChange={(t, v) => setVals((o) => ({ ...o, [t]: v }))} onRun={() => { setShown({ ...vals }); setStamp(Date.now()); }} />
        <NextPreview files={shown} b={b} stamp={stamp} />
      </div>
      <div className="pbar">
        <button className="mini run" onClick={() => { setShown({ ...vals }); setStamp(Date.now()); }}>↻ Reload</button>
        <button className="mini" onClick={() => { setVals({ ...b.files }); update((s) => { const c = { ...s.code }; delete c[k]; s.code = c; }); }}>Reset</button>
        <span className="sp" />
        <span className="tiny" style={{ margin: 0 }}><span className="rw-badge">▲ next dev</span> fast refresh on save</span>
      </div>
    </div>
  );
}

function runNextTests(doc, testId, count) {
  return new Promise((resolve) => {
    const fr = document.createElement("iframe");
    fr.setAttribute("sandbox", "allow-scripts allow-forms");
    fr.setAttribute("aria-hidden", "true");
    fr.tabIndex = -1;
    fr.style.cssText = "position:fixed;left:-10000px;top:0;width:1024px;height:768px;border:0;opacity:0;pointer-events:none";
    const done = (r) => { clearTimeout(timer); removeEventListener("message", on); fr.remove(); resolve(r); };
    const on = (e) => { if (e.data && e.data.__syt === testId) done(e.data.results); };
    const timer = setTimeout(() => done(Array.from({ length: count }, () => ({ ok: false, err: "The app took too long to respond." }))), 15000 + count * 7000);
    addEventListener("message", on);
    fr.srcdoc = doc;
    document.body.appendChild(fr);
  });
}

/** `nxch` block: tests get h: navigate, path, $, $$, text, click, type, submit, until, link, serverLogs, src, title, isClient. */
export function NextChallenge({ b, k }) {
  const id = useId();
  const tabs = b.tabs || Object.keys(b.files);
  const evaluate = async (v) => {
    const ts = await loadCompiler();
    const compiled = compileNext(ts, v);
    if (compiled.errors.length) return { results: b.tests.map(() => false), error: "Build error · " + compiled.errors[0] };
    const testId = id + ":" + Date.now();
    const out = await runNextTests(buildNextDoc({ compiled, files: v, startPath: b.startPath, env: b.env, tests: b.tests, testId }), testId, b.tests.length);
    return { results: out.map((r) => r.ok), error: (out.find((r) => r.err) || {}).err || "" };
  };
  return (
    <ChallengeShell b={b} k={k} tabs={tabs} starter={b.files} tests={b.tests} evaluate={evaluate} solution={b.solution}
      extra={(vals) => <ChallengeNextPreview vals={vals} b={b} />} />
  );
}
function ChallengeNextPreview({ vals, b }) {
  const [shown, setShown] = useState(vals);
  useEffect(() => { const t = setTimeout(() => setShown(vals), 800); return () => clearTimeout(t); }, [vals]);
  return (
    <div className="chal-preview">
      <div className="chal-preview-h">Your app</div>
      <div style={{ margin: "8px 12px 12px" }}><NextPreview files={shown} b={b} stamp={0} /></div>
    </div>
  );
}
