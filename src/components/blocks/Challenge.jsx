import React, { useEffect, useRef, useState } from "react";
import { useProgress, today } from "../../lib/progress.jsx";
import { confetti } from "../../lib/confetti.js";
import Editor from "./Editor.jsx";

/* Shared shell: editor + test list + check/reset bar. `evaluate(vals)` returns {results, error}. */
function ChallengeShell({ b, k, tabs, starter, tests, evaluate }) {
  const { S, award, update } = useProgress();
  const [vals, setVals] = useState(() => ({ ...starter, ...(S.code[k] || {}) }));
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");
  const [runId, setRunId] = useState(0);
  const won = !!S.chal[k] && (results === null || results.every(Boolean));

  const change = (t, v) => {
    const next = { ...vals, [t]: v };
    setVals(next);
    update((s) => { s.code = { ...s.code, [k]: next }; });
  };

  const check = () => {
    const { results: r, error: e } = evaluate(vals);
    setResults(r); setError(e || ""); setRunId((n) => n + 1);
    if (r.every(Boolean) && !S.chal[k]) {
      award(25, "Challenge passed", (s) => { s.chal = { ...s.chal, [k]: today() }; });
      confetti(90);
    }
  };

  const reset = () => {
    setVals({ ...starter }); setResults(null); setError("");
    update((s) => { const c = { ...s.code }; delete c[k]; s.code = c; });
  };

  return (
    <div className={"chal" + (won ? " won" : "")}>
      <div className="chal-h">
        <span className="pill solo">Challenge</span>
        <span><span dangerouslySetInnerHTML={{ __html: b.prompt }} /> <span style={{ color: "var(--gold)", fontWeight: 700 }}>+25 XP</span></span>
      </div>
      <div className="passed-banner">✓ Challenge passed</div>
      <div className="chal-body">
        <Editor tabs={tabs} values={vals} onChange={change} onRun={check} idPrefix={"ch-" + k.replace(/\W/g, "-")} />
        <div className="tests" key={runId}>
          {tests.map((t, i) => (
            <div key={i} className={"test" + (results ? (results[i] ? " pass" : " fail") : "")}><i /><span>{t.msg}</span></div>
          ))}
          <div className="err-msg">{error}</div>
        </div>
      </div>
      <div className="pbar">
        <button className="mini run" onClick={check}>✓ Check solution</button>
        <button className="mini" onClick={reset}>Reset</button>
        <span className="sp" />
        <span className="tiny" style={{ margin: 0 }}>Ctrl + Enter</span>
      </div>
    </div>
  );
}

export function JsChallenge({ b, k }) {
  const evaluate = (v) => {
    let f, ctx = {}, error = "";
    try {
      const names = [b.fn, ...(b.extra || [])];
      const body = `"use strict";\n${v.js}\n;return {${names.map((n) => `${JSON.stringify(n)}: typeof ${n} === "function" ? ${n} : undefined`).join(",")}};`;
      ctx = new Function(body)();
      f = ctx[b.fn];
      if (typeof f !== "function") error = `Define a function named ${b.fn}.`;
    } catch (e) { error = `${e.name}: ${e.message}`; }
    const results = b.tests.map((t) => {
      if (typeof f !== "function") return false;
      try { return !!t.fn(f, ctx); } catch (e) { error = error || `${e.name}: ${e.message}`; return false; }
    });
    return { results, error };
  };
  return <ChallengeShell b={b} k={k} tabs={["js"]} starter={{ js: b.starter }} tests={b.tests} evaluate={evaluate} />;
}

/* HTML/CSS challenges render into an off-screen shadow root so computed styles can be checked.
   `html`, `body` and `:root` selectors are mapped onto the wrapper element. */
export function HtmlChallenge({ b, k }) {
  const hostRef = useRef(null);
  useEffect(() => {
    const host = document.createElement("div");
    host.setAttribute("aria-hidden", "true");
    host.style.cssText = "position:absolute;left:-10000px;top:0;width:800px;height:600px;overflow:hidden;visibility:hidden";
    host.attachShadow({ mode: "open" });
    document.body.appendChild(host);
    hostRef.current = host;
    return () => host.remove();
  }, []);

  const evaluate = (v) => {
    const root = hostRef.current.shadowRoot;
    const css = (v.css || "").replace(/(^|[\s,{}>+~])(html|body|:root)(?=[\s,{.:#[>+~])/g, "$1.sy-body");
    root.innerHTML = `<style>.sy-body{display:block;margin:8px;min-height:100%}${css}</style><div class="sy-body">${v.html || ""}</div>`;
    const bodyEl = root.querySelector(".sy-body");
    const d = { body: bodyEl, querySelector: (s) => bodyEl.querySelector(s), querySelectorAll: (s) => bodyEl.querySelectorAll(s) };
    const results = b.checks.map((ck) => { try { return !!ck.fn(d, window); } catch { return false; } });
    return { results, error: "" };
  };
  return <ChallengeShell b={b} k={k} tabs={["html", "css"]} starter={{ html: b.html || "", css: b.css || "" }} tests={b.checks} evaluate={evaluate} />;
}
