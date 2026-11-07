import React, { useCallback, useEffect, useId, useRef, useState } from "react";
import { useProgress } from "../../lib/progress.jsx";
import Editor from "./Editor.jsx";
import { ChallengeShell } from "./Challenge.jsx";
import { consoleShim } from "../../lib/consoleShim.js";
import { loadCompiler, compileNode, NodeServer, buildBrowserDoc, escapeHtml } from "../../lib/nodeLab.js";

const METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE"];
const ctype = (h) => (Object.entries(h || {}).find(([k]) => k.toLowerCase() === "content-type") || [])[1] || "";

/** Start a NodeServer for a set of files. Returns { server, state, logs, run, clearLogs }. */
function useNodeServer(b, script) {
  const [state, setState] = useState("stopped");
  const [logs, setLogs] = useState([]);
  const [gen, setGen] = useState(0);
  const srv = useRef(null);
  const log = useCallback((l) => setLogs((x) => [...x.slice(-200), l]), []);

  const stop = () => { if (srv.current) { srv.current.destroy(); srv.current = null; } };
  useEffect(() => stop, []);

  const run = async (files) => {
    stop();
    setLogs([]);
    setState("starting");
    let ts;
    try { ts = await loadCompiler(); } catch (e) { log({ level: "error", m: e.message }); setState("crashed"); return; }
    const compiled = compileNode(ts, files);
    log({ level: "cmd", m: script ? "$ node " + (compiled.entry || "index.js") : "$ npm start" });
    if (!script) log({ level: "info", m: "> node " + (compiled.entry || "server.js") });
    if (compiled.errors.length) {
      compiled.errors.forEach((m) => log({ level: "error", m: "SyntaxError: " + m }));
      log({ level: "crash", m: "[node] app crashed - waiting for file changes before starting..." });
      setState("crashed");
      return;
    }
    const s = new NodeServer({ compiled, env: b.env, extra: b.extra, onLog: log, onState: (st) => setState(st) });
    srv.current = s;
    setGen((g) => g + 1);
  };
  return { srv, state, logs, run, log, gen, stop };
}

function Terminal({ logs, state, height }) {
  const ref = useRef(null);
  useEffect(() => { if (ref.current) ref.current.scrollTop = ref.current.scrollHeight; }, [logs]);
  return (
    <div className="console nterm" ref={ref} style={height ? { maxHeight: height } : null} aria-label="Terminal output">
      {logs.length === 0 && <div className="l dim">Terminal — press Run to start the server</div>}
      {logs.map((l, i) => <div key={i} className={"l " + l.level}>{l.level === "error" ? "✖ " : l.level === "warn" ? "⚠ " : ""}{l.m}</div>)}
      {state === "listening" && <div className="l live">● server running — send it a request</div>}
    </div>
  );
}

function StatePill({ state }) {
  const label = { stopped: "stopped", starting: "starting…", listening: "listening on :8000", crashed: "crashed", exited: "finished" }[state] || state;
  return <span className={"npill " + state}><i />{label}</span>;
}

/** Postman-style request builder. */
function Client({ srv, state, b }) {
  const presets = b.requests || [];
  const first = presets[0] || {};
  const [method, setMethod] = useState(first.method || "GET");
  const [url, setUrl] = useState(first.url || "/");
  const [body, setBody] = useState(first.body ? (typeof first.body === "string" ? first.body : JSON.stringify(first.body, null, 2)) : "");
  const [res, setRes] = useState(null);
  const [busy, setBusy] = useState(false);
  const [showHead, setShowHead] = useState(false);
  const live = useRef(null);
  useEffect(() => () => live.current && live.current.close && live.current.close(), []);

  const pick = (p) => {
    setMethod(p.method || "GET"); setUrl(p.url);
    setBody(p.body ? (typeof p.body === "string" ? p.body : JSON.stringify(p.body, null, 2)) : "");
  };
  const send = async () => {
    if (!srv.current) return;
    if (live.current && live.current.close) live.current.close();
    setBusy(true);
    const t0 = performance.now();
    const hasBody = !["GET", "DELETE"].includes(method) && body.trim();
    const headers = hasBody ? { "content-type": /^\s*[[{]/.test(body) ? "application/json" : "text/plain" } : {};
    const r = await srv.current.request(method, url.startsWith("/") ? url : "/" + url, {
      headers, body: hasBody ? body : "", sse: true,
      onHead: (o) => { if (o.streaming) { live.current = o; setRes({ ...o, ms: Math.round(performance.now() - t0) }); setBusy(false); } },
      onChunk: (c, o) => { if (o.streaming) setRes((prev) => ({ ...o, ms: prev && prev.ms })); },
    });
    live.current = null;
    setRes({ ...r, ms: Math.round(performance.now() - t0) });
    setBusy(false);
  };
  const type = res ? ctype(res.headers) : "";
  let shown = res ? res.body : "";
  if (res && res.json !== undefined && /json/i.test(type)) shown = JSON.stringify(res.json, null, 2);
  const tone = !res ? "" : res.error && !res.status ? "bad" : res.status >= 500 ? "bad" : res.status >= 400 ? "warn" : "ok";
  return (
    <div className="nclient">
      {presets.length > 0 && (
        <div className="npresets">
          {presets.map((p, i) => <button key={i} className="chip-btn" onClick={() => pick(p)}><b>{p.method || "GET"}</b> {p.url}</button>)}
        </div>
      )}
      <form className="nreq" onSubmit={(e) => { e.preventDefault(); send(); }}>
        <select value={method} onChange={(e) => setMethod(e.target.value)} aria-label="HTTP method">{METHODS.map((m) => <option key={m}>{m}</option>)}</select>
        <span className="nhost">localhost:8000</span>
        <input value={url} onChange={(e) => setUrl(e.target.value)} aria-label="Path" spellCheck="false" />
        <button className="mini run" disabled={busy || state !== "listening"}>{busy ? "…" : "Send"}</button>
      </form>
      {!["GET", "DELETE"].includes(method) && (
        <textarea className="nbody" value={body} onChange={(e) => setBody(e.target.value)} placeholder='Request body, e.g. {"title": "Hello"}' aria-label="Request body" spellCheck="false" />
      )}
      <div className="nres" aria-live="polite">
        {!res && <div className="dim">{state === "listening" ? "Send a request to see the response." : "Start the server with Run, then send a request."}</div>}
        {res && (
          <>
            <div className="nstatus">
              {res.status ? <span className={"ncode " + tone}>{res.status} {res.statusText}</span> : <span className="ncode bad">No response</span>}
              {res.status > 0 && <span className="dim">{res.ms} ms · {type || "no Content-Type"}</span>}
              {res.streaming && <><span className="nlive">● streaming</span><button className="mini" onClick={() => live.current && live.current.close()}>Stop</button></>}
              {res.status > 0 && <button className="linkish" onClick={() => setShowHead((x) => !x)}>{showHead ? "hide" : "headers"}</button>}
            </div>
            {showHead && <pre className="nheaders">{Object.entries(res.headers).map(([k, v]) => k + ": " + v).join("\n") || "(no headers)"}</pre>}
            {res.error && <div className="err-msg" style={{ display: "block" }}>{res.error}</div>}
            {res.status > 0 && <pre className="nbodyout">{shown || <span className="dim">(empty body)</span>}</pre>}
          </>
        )}
      </div>
    </div>
  );
}

/** A tiny browser: loads pages from the server and routes the page's fetch/EventSource calls back to it. */
function Browser({ srv, state, gen, log }) {
  const id = useId().replace(/\W/g, "") + "b";
  const [path, setPath] = useState("/");
  const [addr, setAddr] = useState("/");
  const [doc, setDoc] = useState("");
  const [nonce, setNonce] = useState(0);
  const frame = useRef(null);
  const streams = useRef({});

  const closeStreams = () => { Object.values(streams.current).forEach((c) => c()); streams.current = {}; };
  useEffect(() => closeStreams, []);

  useEffect(() => {
    let live = true;
    closeStreams();
    if (state !== "listening" || !srv.current) { setDoc(""); return; }
    buildBrowserDoc(srv.current, path, id, consoleShim(id + "c")).then(({ doc }) => { if (live) setDoc(doc + `<!--${nonce}-->`); });
    return () => { live = false; };
  }, [state, gen, path, nonce]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const on = async (e) => {
      const d = e.data;
      if (!d) return;
      if (d.__sy === id + "c") { log({ level: d.k === "error" ? "error" : d.k === "warn" ? "warn" : "browser", m: "[browser] " + d.m }); return; }
      if (d.__synb !== id || !srv.current) return;
      const reply = (m) => frame.current && frame.current.contentWindow && frame.current.contentWindow.postMessage({ ...m, __synbr: id }, "*");
      if (d.navigate) { setAddr(d.navigate); setPath(d.navigate); return; }
      if (d.closeStream) { const c = streams.current[d.closeStream]; if (c) { c(); delete streams.current[d.closeStream]; } return; }
      if (d.stream) {
        streams.current[d.stream] = srv.current.stream(d.url, {
          onHead: (o) => reply(o.status < 400 ? { rid: d.stream, sseOpen: true } : { rid: d.stream, sseErr: true }),
          onChunk: (c) => reply({ rid: d.stream, sse: c }),
          onDone: () => reply({ rid: d.stream, sseErr: true }),
        });
        return;
      }
      if (d.rid) {
        const r = await srv.current.request(d.method, d.url, { headers: d.headers, body: d.body });
        if (r.error && !r.status) log({ level: "error", m: "[browser] " + d.method + " " + d.url + " failed: " + r.error });
        reply({ rid: d.rid, res: { status: r.status, statusText: r.statusText, headers: r.headers, body: r.body, error: r.error && !r.status ? r.error : "" } });
      }
    };
    addEventListener("message", on);
    return () => removeEventListener("message", on);
  }, [id, log, srv]);

  return (
    <div className="nbrowser">
      <form className="naddr" onSubmit={(e) => { e.preventDefault(); const p = addr.startsWith("/") ? addr : "/" + addr; setAddr(p); setPath(p); setNonce((n) => n + 1); }}>
        <button type="button" className="mini" aria-label="Reload" onClick={() => setNonce((n) => n + 1)}>⟳</button>
        <span className="nhost">localhost:8000</span>
        <input value={addr} onChange={(e) => setAddr(e.target.value)} aria-label="Address" spellCheck="false" />
      </form>
      {state === "listening"
        ? <iframe ref={frame} sandbox="allow-scripts allow-forms allow-modals" title="App preview" srcDoc={doc} />
        : <div className="nblank">{state === "starting" ? "Starting server…" : state === "crashed" ? "This site can’t be reached: the server crashed. Check the terminal." : "This site can’t be reached: the server isn’t running. Press Run."}</div>}
    </div>
  );
}

function NodeRunner({ files, b, autoRun, runKey }) {
  const { srv, state, logs, run, log, gen } = useNodeServer(b, !!b.script);
  const [pane, setPane] = useState(b.browser ? "browser" : "client");
  const filesRef = useRef(files);
  filesRef.current = files;
  useEffect(() => { if (autoRun) run(filesRef.current); }, [runKey]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className={"nrunner" + (b.script ? " script" : "")}>
      {!b.script && <div className="ntabs" role="tablist">
        {b.browser && <button role="tab" aria-selected={pane === "browser"} className={pane === "browser" ? "on" : ""} onClick={() => setPane("browser")}>Browser</button>}
        <button role="tab" aria-selected={pane === "client"} className={pane === "client" ? "on" : ""} onClick={() => setPane("client")}>API client</button>
        <span className="sp" />
        {!autoRun && <button className="mini run" onClick={() => run(filesRef.current)}>▶ {state === "listening" ? "Restart" : "Run"} server</button>}
        <StatePill state={state} />
      </div>}
      {b.script && !autoRun && <div className="ntabs"><span className="sp" /><button className="mini run" onClick={() => run(filesRef.current)}>▶ Run</button></div>}
      {!b.script && <div className="npane">
        {b.browser && <div hidden={pane !== "browser"} style={{ height: "100%" }}><Browser srv={srv} state={state} gen={gen} log={log} /></div>}
        <div hidden={pane !== "client"}><Client srv={srv} state={state} b={b} /></div>
      </div>}
      <Terminal logs={logs} state={state} />
    </div>
  );
}

/** `nplay` block: a Node project with editor, API client, optional browser and terminal. */
export function NodePlayground({ b, k }) {
  const { S, update } = useProgress();
  const tabs = Object.keys(b.files);
  const [vals, setVals] = useState(() => ({ ...b.files, ...(S.code[k] || {}) }));
  const [runKey, setRunKey] = useState(0);
  const mounted = useRef(false);
  useEffect(() => {
    if (!mounted.current) { mounted.current = true; return; }
    const t = setTimeout(() => {
      setRunKey((n) => n + 1);   // like node --watch: restart on save
      update((s) => { s.code = { ...s.code, [k]: vals }; });
    }, 900);
    return () => clearTimeout(t);
  }, [vals]); // eslint-disable-line react-hooks/exhaustive-deps
  const reset = () => {
    setVals({ ...b.files }); setRunKey((n) => n + 1);
    update((s) => { const c = { ...s.code }; delete c[k]; s.code = c; });
  };
  return (
    <div className="play nplay">
      {b.task && <div className="play-task"><span className="pill build">Try it</span><span dangerouslySetInnerHTML={{ __html: b.task }} /></div>}
      <div className="play-grid">
        <Editor tabs={tabs} values={vals} idPrefix={"np-" + k.replace(/\W/g, "-")}
          onChange={(t, v) => setVals((o) => ({ ...o, [t]: v }))} onRun={() => setRunKey((n) => n + 1)} />
        <NodeRunner files={vals} b={b} autoRun runKey={runKey} />
      </div>
      <div className="pbar">
        <button className="mini run" onClick={() => setRunKey((n) => n + 1)}>▶ Restart server</button>
        <button className="mini" onClick={reset}>Reset</button>
        <span className="sp" />
        <span className="tiny" style={{ margin: 0 }}><span className="node-badge">⬢ Node 22</span> restarts on save, like <code>node --watch</code></span>
      </div>
    </div>
  );
}

/** Test helper handed to `nch` tests: `async (t) => boolean`. */
function makeHelper(server, files, logs) {
  const t = {
    get logs() { return logs.map((l) => l.m); },
    get listening() { return server.state === "listening"; },
    src: (f) => files[f] || "",
    file: (f) => (server.files[f] == null ? null : server.files[f]),
    wait: (ms) => new Promise((r) => setTimeout(r, ms)),
    request: (method, url, opts = {}) => server.request(method, url, { timeout: 4000, ...opts }),
    get: (url, headers) => t.request("GET", url, { headers }),
    post: (url, body, headers) => t.request("POST", url, { body, headers }),
    put: (url, body) => t.request("PUT", url, { body }),
    patch: (url, body) => t.request("PATCH", url, { body }),
    del: (url) => t.request("DELETE", url),
    header: (res, name) => (Object.entries(res.headers || {}).find(([k]) => k.toLowerCase() === name.toLowerCase()) || [])[1] || "",
    /** Listen to a streaming endpoint for `ms`, then disconnect. Returns { status, headers, body, events }. */
    stream: (url, ms = 1500) => new Promise((resolve) => {
      let out = { status: 0, headers: {}, body: "" };
      const close = server.stream(url, { onHead: (o) => { out = o; }, onChunk: (c, o) => { out = o; }, onDone: (o) => { out = o; } });
      setTimeout(() => {
        close();
        const events = out.body.split(/\r?\n\r?\n/).map((b) => b.split(/\r?\n/).filter((l) => l.startsWith("data:")).map((l) => l.slice(5).trim()).join("\n")).filter(Boolean);
        resolve({ ...out, events });
      }, ms);
    }),
  };
  return t;
}

/** `nch` block: a Node challenge. Each test gets a freshly started server. */
export function NodeChallenge({ b, k }) {
  const evaluate = async (v) => {
    const fail = (error) => ({ results: b.tests.map(() => false), error });
    let ts;
    try { ts = await loadCompiler(); } catch (e) { return fail(e.message); }
    const compiled = compileNode(ts, v);
    if (compiled.errors.length) return fail("SyntaxError · " + compiled.errors[0]);
    const results = [];
    let error = "";
    for (const test of b.tests) {
      const logs = [];
      const server = new NodeServer({ compiled, env: b.env, extra: b.extra, onLog: (l) => logs.push(l) });
      await Promise.race([server.ready, new Promise((r) => setTimeout(r, 6000))]);
      await new Promise((r) => setTimeout(r, 60));
      let ok = false;
      try {
        ok = !!(await Promise.race([test.fn(makeHelper(server, v, logs)), new Promise((_, rej) => setTimeout(() => rej(new Error("A test timed out.")), 9000))]));
      } catch (e) { if (!error) error = e.message; }
      if (!ok && !error) {
        const crash = logs.find((l) => l.level === "error");
        if (server.state === "crashed" && crash) error = "Your server crashed: " + crash.m;
        else if (server.state !== "listening" && b.server !== false) error = "Your server didn't start listening. Did you call server.listen(PORT, …)?";
      }
      server.destroy();
      results.push(ok);
    }
    return { results, error };
  };
  return (
    <ChallengeShell b={b} k={k} tabs={Object.keys(b.files)} starter={b.files} tests={b.tests} evaluate={evaluate}
      solution={b.solution} extra={(vals) => (
        <div className="chal-preview">
          <div className="chal-preview-h">Try your server</div>
          <div className="nchal-runner"><NodeRunner files={vals} b={b} /></div>
        </div>
      )} />
  );
}

export { escapeHtml };
