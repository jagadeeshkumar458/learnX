import React, { useEffect, useRef, useState } from "react";
import { useProgress } from "../../lib/progress.jsx";
import Editor from "./Editor.jsx";
import { ChallengeShell } from "./Challenge.jsx";
import { audit, speakTree, tabOrder } from "../../lib/a11y.js";
import { say, stopSpeaking, canSpeak } from "../../lib/audio.js";

const scopeCss = (css) => (css || "").replace(/(^|[\s,{}>+~])(html|body|:root)(?=[\s,{.:#[>+~])/g, "$1.sy-body");

/** Render html/css into a shadow root, then run the js with a `document` scoped to it. */
function render(root, v, onLog) {
  root.innerHTML = `<style>.sy-body{display:block;padding:12px 14px;min-height:100%;font-family:system-ui,sans-serif;color:#111;background:#fff;line-height:1.45}.sy-sr-only,.sr-only,.visually-hidden{position:absolute!important;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}${scopeCss(v.css)}</style><div class="sy-body">${v.html || ""}</div>`;
  const body = root.querySelector(".sy-body");
  // Inline handlers (onclick="…") would run in the main page: keep the attributes for the audit, drop the handlers.
  body.querySelectorAll("*").forEach((el) => { for (const at of Array.from(el.attributes)) if (/^on/i.test(at.name)) el[at.name.toLowerCase()] = null; });
  if (v.js && v.js.trim()) {
    const doc = {
      body, documentElement: body,
      querySelector: (s) => body.querySelector(s), querySelectorAll: (s) => body.querySelectorAll(s),
      getElementById: (id) => root.getElementById(id), getElementsByClassName: (c) => body.getElementsByClassName(c),
      createElement: (t) => document.createElement(t), createTextNode: (t) => document.createTextNode(t),
      addEventListener: (...a) => body.addEventListener(...a), removeEventListener: (...a) => body.removeEventListener(...a),
      get activeElement() { return root.activeElement || document.activeElement; },
    };
    const con = { log: (...a) => onLog && onLog(a.join(" ")), error: (...a) => onLog && onLog("✖ " + a.join(" ")), warn: (...a) => onLog && onLog("⚠ " + a.join(" ")) };
    try { new Function("document", "console", v.js)(doc, con); }
    catch (e) { onLog && onLog("✖ " + e.name + ": " + e.message); }
  }
  return body;
}

const ICON = { error: "⛔", warn: "⚠️", tip: "💡" };

function AuditList({ issues, onPick }) {
  if (!issues.length) return <div className="a11y-ok">✓ No problems found by the checker. Now try it with the keyboard and the screen reader view.</div>;
  return (
    <ul className="a11y-issues">
      {issues.map((i, n) => (
        <li key={n} className={i.level} onClick={() => onPick && onPick(i.el)}>
          <span className="a11y-ic" aria-hidden="true">{ICON[i.level]}</span>
          <span><b>{i.msg}</b>{i.html && <code>{i.html}</code>}</span>
        </li>
      ))}
    </ul>
  );
}

function SpeakList({ items, playing, onPlay, onStop }) {
  return (
    <div className="a11y-speak">
      <div className="a11y-speak-bar">
        {canSpeak && (playing < 0 ? <button className="mini run" onClick={onPlay}>🔊 Read aloud</button> : <button className="mini" onClick={onStop}>■ Stop</button>)}
        <span className="tiny">What a screen reader announces, in reading order.</span>
      </div>
      <ol>
        {items.map((it, i) => (
          <li key={i} className={(it.role === "text" ? "txt" : it.role.endsWith(" end") ? "end" : "") + (i === playing ? " on" : "")}>
            {it.role !== "text" && <span className="a11y-role">{it.role}</span>}
            <span>{it.name || (it.role === "text" ? "" : <i>(no name)</i>)}{it.extra}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

/** Live preview + audit + screen reader + tab order for a set of files. */
function A11yPanel({ vals, height }) {
  const host = useRef(null);
  const [state, setState] = useState({ issues: [], tree: [], tabs: [] });
  const [pane, setPane] = useState("audit");
  const [logs, setLogs] = useState([]);
  const [playing, setPlaying] = useState(-1);
  const playRef = useRef(0);

  useEffect(() => {
    const el = host.current;
    if (!el.shadowRoot) el.attachShadow({ mode: "open" });
    const root = el.shadowRoot;
    setLogs([]);
    const body = render(root, vals, (m) => setLogs((l) => [...l.slice(-20), m]));
    let t = null;
    const refresh = () => { clearTimeout(t); t = setTimeout(() => setState({ issues: audit(body), tree: speakTree(body), tabs: tabOrder(body) }), 120); };
    refresh();
    const mo = new MutationObserver(refresh);
    mo.observe(body, { subtree: true, childList: true, attributes: true, characterData: true });
    body.addEventListener("input", refresh); body.addEventListener("change", refresh);
    return () => { mo.disconnect(); clearTimeout(t); };
  }, [vals]);

  const pick = (el) => {
    if (!el) return;
    el.scrollIntoView({ block: "nearest" });
    el.classList.add("sy-flash");
    el.animate([{ outline: "3px solid #ff7a3d", outlineOffset: "2px" }, { outline: "3px solid transparent", outlineOffset: "2px" }], { duration: 1400 });
  };
  const play = async () => {
    const id = ++playRef.current;
    const items = state.tree;
    for (let i = 0; i < items.length; i++) {
      if (playRef.current !== id) return;
      setPlaying(i);
      const it = items[i];
      const text = it.role === "text" ? it.name : [it.name, it.role, it.extra].filter(Boolean).join(", ").replace(/, ,/g, ",");
      await say(text, 1.05);
    }
    setPlaying(-1);
  };
  const stop = () => { playRef.current++; stopSpeaking(); setPlaying(-1); };
  useEffect(() => () => { playRef.current++; stopSpeaking(); }, []);

  const errs = state.issues.filter((i) => i.level === "error").length;
  const warns = state.issues.filter((i) => i.level === "warn").length;
  return (
    <div className="a11y-panel">
      <div className="a11y-preview" ref={host} style={height ? { maxHeight: height } : null} />
      <div className="ntabs" role="tablist">
        <button role="tab" aria-selected={pane === "audit"} className={pane === "audit" ? "on" : ""} onClick={() => setPane("audit")}>Audit {errs + warns > 0 ? <span className={"a11y-count" + (errs ? " bad" : "")}>{errs + warns}</span> : <span className="a11y-count good">✓</span>}</button>
        <button role="tab" aria-selected={pane === "speak"} className={pane === "speak" ? "on" : ""} onClick={() => setPane("speak")}>Screen reader</button>
        <button role="tab" aria-selected={pane === "tabs"} className={pane === "tabs" ? "on" : ""} onClick={() => setPane("tabs")}>Tab order</button>
      </div>
      <div className="a11y-body">
        {pane === "audit" && <AuditList issues={state.issues} onPick={pick} />}
        {pane === "speak" && <SpeakList items={state.tree} playing={playing} onPlay={play} onStop={stop} />}
        {pane === "tabs" && (
          state.tabs.length ? <ol className="a11y-tabs">{state.tabs.map((t, i) => <li key={i} onClick={() => { t.el.focus(); pick(t.el); }}><span className="a11y-role">{t.role}</span> {t.name || <i>(no name)</i>}</li>)}</ol>
            : <div className="a11y-ok">Nothing on this page can receive keyboard focus.</div>
        )}
        {logs.length > 0 && <div className="console">{logs.map((l, i) => <div key={i} className="l">{l}</div>)}</div>}
      </div>
    </div>
  );
}

/** `a11yplay` block. */
export function A11yPlayground({ b, k }) {
  const { S, update } = useProgress();
  const tabs = ["html", "css"].concat(b.js != null ? ["js"] : []);
  const base = { html: b.html || "", css: b.css || "", js: b.js || "" };
  const [vals, setVals] = useState(() => ({ ...base, ...(S.code[k] || {}) }));
  const [shown, setShown] = useState(vals);
  useEffect(() => {
    const t = setTimeout(() => { setShown(vals); update((s) => { s.code = { ...s.code, [k]: vals }; }); }, 450);
    return () => clearTimeout(t);
  }, [vals]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className="play a11yplay">
      {b.task && <div className="play-task"><span className="pill build">Try it</span><span dangerouslySetInnerHTML={{ __html: b.task }} /></div>}
      <div className="play-grid">
        <Editor tabs={tabs} values={vals} idPrefix={"ay-" + k.replace(/\W/g, "-")} onChange={(t, v) => setVals((o) => ({ ...o, [t]: v }))} onRun={() => setShown({ ...vals })} />
        <A11yPanel vals={shown} />
      </div>
      <div className="pbar">
        <button className="mini" onClick={() => { setVals(base); update((s) => { const c = { ...s.code }; delete c[k]; s.code = c; }); }}>Reset</button>
        <span className="sp" />
        <span className="tiny" style={{ margin: 0 }}><span className="a11y-badge">♿ a11y</span> the audit updates as you type</span>
      </div>
    </div>
  );
}

/** `a11ych` block: checks get (d, w, a) where a = { issues, has(rule), tree, tabs }. */
export function A11yChallenge({ b, k }) {
  const hostRef = useRef(null);
  useEffect(() => {
    const host = document.createElement("div");
    host.setAttribute("aria-hidden", "true");
    host.style.cssText = "position:absolute;left:-10000px;top:0;width:800px;height:600px;overflow:hidden;opacity:0;pointer-events:none";
    host.attachShadow({ mode: "open" });
    document.body.appendChild(host);
    hostRef.current = host;
    return () => host.remove();
  }, []);
  const tabs = ["html", "css"].concat(b.js != null ? ["js"] : []);
  const evaluate = (v) => {
    const root = hostRef.current.shadowRoot;
    const body = render(root, v);
    const d = { body, root, querySelector: (s) => body.querySelector(s), querySelectorAll: (s) => body.querySelectorAll(s), getElementById: (id) => root.getElementById(id) };
    const a = () => { const issues = audit(body); return { issues, has: (rule) => issues.some((i) => i.rule === rule), tree: speakTree(body), tabs: tabOrder(body) }; };
    const results = b.checks.map((ck) => { try { return !!ck.fn(d, window, a()); } catch (e) { return false; } });
    return { results, error: "" };
  };
  return (
    <ChallengeShell b={b} k={k} tabs={tabs} starter={{ html: b.html || "", css: b.css || "", js: b.js || "" }} tests={b.checks} evaluate={evaluate}
      solution={b.solution} extra={(vals) => (
        <div className="chal-preview">
          <div className="chal-preview-h">Live preview and audit</div>
          <div className="a11y-chal"><A11yPanel vals={vals} height={260} /></div>
        </div>
      )} />
  );
}

/** `contrast` block: pick two colours and see the WCAG contrast ratio. */
export function ContrastChecker({ b }) {
  const [fg, setFg] = useState(b.fg || "#767676");
  const [bg, setBg] = useState(b.bg || "#ffffff");
  const toRgb = (h) => { const x = h.replace("#", ""); return [0, 2, 4].map((i) => parseInt(x.slice(i, i + 2), 16)); };
  const L = (c) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]); };
  const a = L(toRgb(fg)), c = L(toRgb(bg));
  const ratio = (Math.max(a, c) + 0.05) / (Math.min(a, c) + 0.05);
  const badge = (ok, label) => <span className={"cc-badge " + (ok ? "ok" : "bad")}>{ok ? "✓" : "✗"} {label}</span>;
  return (
    <div className="cc">
      <div className="cc-controls">
        <label>Text <input type="color" value={fg} onChange={(e) => setFg(e.target.value)} /> <code>{fg}</code></label>
        <label>Background <input type="color" value={bg} onChange={(e) => setBg(e.target.value)} /> <code>{bg}</code></label>
        <button className="mini" onClick={() => { setFg(bg); setBg(fg); }}>⇄ Swap</button>
      </div>
      <div className="cc-sample" style={{ color: fg, background: bg }}>
        <p style={{ fontSize: 16, margin: 0 }}>Normal text: the quick brown fox jumps over the lazy dog.</p>
        <p style={{ fontSize: 24, fontWeight: 700, margin: "6px 0 0" }}>Large text (24px)</p>
      </div>
      <div className="cc-result" aria-live="polite">
        <span className="cc-ratio">{ratio.toFixed(2)}:1</span>
        {badge(ratio >= 4.5, "AA normal text (4.5)")}
        {badge(ratio >= 3, "AA large text & UI (3)")}
        {badge(ratio >= 7, "AAA normal text (7)")}
      </div>
    </div>
  );
}
