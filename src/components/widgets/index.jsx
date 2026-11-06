import React, { useMemo, useState } from "react";
import { CodeView } from "../blocks/Basic.jsx";

/* ── The stack: frontend / backend / database ── */
const LAYERS = [
  { i: "🖥️", t: "Frontend", s: "HTML · CSS · JavaScript · React", tag: "browser", d: "Runs in the user's browser. Draws the interface, handles clicks and typing, and calls the backend through HTTP requests. Modules 2–8, 14–19." },
  { i: "⚙️", t: "Backend", s: "Node.js · Express · APIs · Auth", tag: "server", d: "Runs on a server you control. Validates input, enforces permissions, talks to the database and other services, and returns JSON. Modules 11, 13." },
  { i: "🗄️", t: "Database", s: "SQL · tables · queries", tag: "storage", d: "Stores data durably: users, posts, orders. The backend reads and writes it with queries like SELECT and INSERT. Module 12." },
];
function Stack() {
  const [on, setOn] = useState(0);
  return (
    <>
      <div className="w-title"><b>The stack</b><span className="tiny" style={{ margin: 0 }}>Tap a layer</span></div>
      <div className="stack">
        {LAYERS.map((x, i) => (
          <React.Fragment key={x.t}>
            {i > 0 && <div className="flow">↕ HTTP / queries</div>}
            <button className={"layer" + (i === on ? " on" : "")} onClick={() => setOn(i)}>
              <span className="li">{x.i}</span>
              <span><b>{x.t}</b><small>{x.s}</small></span>
              <span className={"pill" + (i === on ? " build" : "")}>{x.tag}</span>
            </button>
            {i === on && <div className="layer-detail">{x.d}</div>}
          </React.Fragment>
        ))}
      </div>
    </>
  );
}

/* ── Box model explorer ── */
const BM_RANGE = { width: [60, 200], padding: [0, 40], border: [0, 12], margin: [0, 40] };
function BoxModel() {
  const [v, setV] = useState({ width: 120, padding: 16, border: 4, margin: 20 });
  const [borderBox, setBorderBox] = useState(false);
  const cw = borderBox ? Math.max(0, v.width - 2 * v.padding - 2 * v.border) : v.width;
  const total = borderBox ? v.width : v.width + 2 * v.padding + 2 * v.border;
  return (
    <>
      <div className="w-title">
        <b>Box model explorer</b>
        <label className="tiny" style={{ margin: 0, gap: 6, display: "flex", alignItems: "center" }}>
          <input type="checkbox" checked={borderBox} onChange={(e) => setBorderBox(e.target.checked)} /> border-box
        </label>
      </div>
      <div className="ctrls">
        {Object.keys(v).map((k) => (
          <label key={k}>{k}: <span>{v[k]}px</span>
            <input type="range" min={BM_RANGE[k][0]} max={BM_RANGE[k][1]} value={v[k]} onChange={(e) => setV({ ...v, [k]: +e.target.value })} />
          </label>
        ))}
      </div>
      <div className="bm">
        <div className="bm-m" style={{ padding: v.margin }}>
          <div className="bm-b" style={{ padding: v.border }}>
            <div className="bm-p" style={{ padding: v.padding }}>
              <div className="bm-c" style={{ width: cw }}>{cw}px</div>
            </div>
          </div>
        </div>
      </div>
      <div className="bm-legend">
        <span><i style={{ background: "color-mix(in srgb,var(--gold) 40%,transparent)" }} />margin</span>
        <span><i style={{ background: "var(--ink)" }} />border</span>
        <span><i style={{ background: "color-mix(in srgb,var(--ok) 30%,var(--surface))" }} />padding</span>
        <span><i style={{ background: "var(--accent)" }} />content</span>
      </div>
      <div className="total">
        Rendered width = <span style={{ color: "var(--accent)" }}>{total}px</span>{" "}
        <span style={{ color: "var(--muted)", fontWeight: 400 }}>
          ({borderBox ? `width ${v.width} includes padding + border` : `${v.width} + ${2 * v.padding} padding + ${2 * v.border} border`})
        </span>
      </div>
    </>
  );
}

/* ── Flexbox playground ── */
const FX_OPTS = {
  "flex-direction": ["row", "column", "row-reverse"],
  "justify-content": ["flex-start", "center", "flex-end", "space-between", "space-around", "space-evenly"],
  "align-items": ["stretch", "flex-start", "center", "flex-end"],
  "flex-wrap": ["nowrap", "wrap"],
};
const FX_COLS = ["var(--accent)", "var(--ok)", "var(--gold)", "#5a6cf0", "var(--bad)"];
const camel = (k) => k.replace(/-(\w)/g, (_, c) => c.toUpperCase());
function Flexbox() {
  const [st, setSt] = useState({ "flex-direction": "row", "justify-content": "flex-start", "align-items": "stretch", "flex-wrap": "nowrap" });
  const [gap, setGap] = useState(8);
  const [n, setN] = useState(4);
  const style = Object.fromEntries(Object.entries(st).map(([k, v]) => [camel(k), v]));
  const code = `.container {\n  display: flex;\n${Object.entries(st).map(([k, v]) => `  ${k}: ${v};`).join("\n")}\n  gap: ${gap}px;\n}`;
  return (
    <>
      <div className="w-title"><b>Flexbox playground</b><button className="mini" onClick={() => setN(n >= 9 ? 3 : n + 1)}>+ item</button></div>
      <div className="ctrls">
        {Object.keys(FX_OPTS).map((k) => (
          <label key={k}>{k}
            <select value={st[k]} onChange={(e) => setSt({ ...st, [k]: e.target.value })}>
              {FX_OPTS[k].map((o) => <option key={o}>{o}</option>)}
            </select>
          </label>
        ))}
        <label>gap: <span>{gap}px</span><input type="range" min="0" max="32" value={gap} onChange={(e) => setGap(+e.target.value)} /></label>
      </div>
      <div className="flexstage" style={{ ...style, gap }}>
        {[...Array(n)].map((_, i) => (
          <div key={i} className="fx" style={{ background: FX_COLS[i % 5], minHeight: i === 1 ? 70 : undefined, width: i === 2 ? 80 : undefined }}>{i + 1}</div>
        ))}
      </div>
      <div className="css-out code-wrap"><CodeView code={code} lang="css" /></div>
    </>
  );
}

/* ── Specificity calculator ── */
function specificity(sel) {
  let s = sel.replace(/:not\(([^)]*)\)/g, " $1 ");
  const a = (s.match(/#[\w-]+/g) || []).length;
  const b = (s.match(/\.[\w-]+/g) || []).length + (s.match(/\[[^\]]+\]/g) || []).length + (s.match(/:(?!:)[\w-]+(\([^)]*\))?/g) || []).length;
  s = s.replace(/#[\w-]+|\.[\w-]+|\[[^\]]+\]|::?[\w-]+(\([^)]*\))?/g, " ");
  const c = (s.match(/(^|[\s>+~])([a-zA-Z][\w-]*)/g) || []).length + (sel.match(/::[\w-]+/g) || []).length;
  return [a, b, c];
}
const inputStyle = { font: "14px var(--f-mono)", padding: "9px 10px", border: "1px solid var(--line)", borderRadius: 9, background: "var(--bg)", color: "var(--ink)", width: "100%" };
function Specificity() {
  const [sels, setSels] = useState(["#nav a", ".menu .link:hover"]);
  const sc = useMemo(() => sels.map((x) => specificity(x.trim())), [sels]);
  let win = 0;
  for (let i = 0; i < 3; i++) if (sc[0][i] !== sc[1][i]) { win = sc[0][i] > sc[1][i] ? 1 : 2; break; }
  return (
    <>
      <div className="w-title"><b>Specificity calculator</b><span className="tiny" style={{ margin: 0 }}>(ids, classes, elements)</span></div>
      {sels.map((v, i) => (
        <div className="spec-row" key={i}>
          <input type="text" value={v} aria-label={`Selector ${"AB"[i]}`} style={inputStyle} onChange={(e) => setSels(sels.map((x, j) => (j === i ? e.target.value : x)))} />
          <div className="score"><span className="a">{sc[i][0]}</span><span className="b">{sc[i][1]}</span><span className="c">{sc[i][2]}</span></div>
        </div>
      ))}
      <div className="win">{win ? <>Winner: <code>{sels[win - 1]}</code></> : "Tie — the rule that appears later in the CSS wins."}</div>
    </>
  );
}

/* ── Truthy / falsy ── */
const TV = [["0", false], ['""', false], ["null", false], ["undefined", false], ["NaN", false], ["false", false], ['"0"', true], ['"false"', true], ["[]", true], ["{}", true], ["42", true], ["-1", true], ['"hi"', true], ["Infinity", true]];
function Truthy() {
  const [seen, setSeen] = useState({});
  const [last, setLast] = useState(null);
  const note = (v, t) => !t ? "" : v === "[]" || v === "{}" ? " — every object is truthy" : v.startsWith('"') ? " — any non-empty string is truthy" : "";
  return (
    <>
      <div className="w-title"><b>Truthy or falsy?</b><span className="tiny" style={{ margin: 0 }}>Guess first, then tap</span></div>
      <div className="tv-grid">
        {TV.map(([v, t], i) => (
          <button key={v} className={"tv" + (seen[i] ? (t ? " t" : " f") : "")} onClick={() => { setSeen({ ...seen, [i]: true }); setLast(i); }}>{v}</button>
        ))}
      </div>
      <div className="tv-out">
        {last === null ? <>if (<span style={{ color: "var(--muted)" }}>value</span>) {"{ … }"}</> : (
          <>Boolean({TV[last][0]}) → <span style={{ color: `var(${TV[last][1] ? "--ok" : "--bad"})` }}>{String(TV[last][1])}</span>{note(...TV[last])}</>
        )}
      </div>
    </>
  );
}

const WIDGETS = { stack: Stack, boxmodel: BoxModel, flexbox: Flexbox, specificity: Specificity, truthy: Truthy };

export default function Widget({ b }) {
  const W = WIDGETS[b.name];
  return W ? <div className="widget"><W /></div> : null;
}
