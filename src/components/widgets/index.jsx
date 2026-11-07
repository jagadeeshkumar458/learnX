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

/* ── position: static / relative / absolute / fixed / sticky ── */
function Position() {
  const [pos, setPos] = useState("relative");
  const [top, setTop] = useState(20);
  const [left, setLeft] = useState(30);
  const [parentRel, setParentRel] = useState(true);
  const offsets = pos !== "static";
  const code = `.parent {\n  position: ${parentRel ? "relative" : "static"};\n}\n.box {\n  position: ${pos};${offsets ? `\n  top: ${top}px;\n  left: ${left}px;` : ""}\n}`;
  const notes = {
    static: "The default. Normal flow; top and left do nothing.",
    relative: "Stays in the flow (its space is kept, see the dashed outline) and shifts visually from where it would have been.",
    absolute: "Leaves the flow (the siblings close the gap) and is placed relative to the nearest positioned ancestor" + (parentRel ? ": the parent." : ". The parent isn't positioned, so it uses the page instead."),
    fixed: "Leaves the flow and is placed relative to the viewport, so it stays put when you scroll. Here, the grey frame stands in for the viewport.",
    sticky: "Acts like relative until you scroll past its top offset, then sticks. Scroll the stage to see it.",
  };
  return (
    <>
      <div className="w-title"><b>CSS position playground</b></div>
      <div className="ctrls">
        <label>position<select value={pos} onChange={(e) => setPos(e.target.value)}>{["static", "relative", "absolute", "fixed", "sticky"].map((o) => <option key={o}>{o}</option>)}</select></label>
        <label>top: <span>{top}px</span><input type="range" min="0" max="80" value={top} onChange={(e) => setTop(+e.target.value)} disabled={!offsets} /></label>
        <label>left: <span>{left}px</span><input type="range" min="0" max="160" value={left} onChange={(e) => setLeft(+e.target.value)} disabled={!offsets} /></label>
        <label style={{ display: "flex", gap: 6, alignItems: "center" }}><input type="checkbox" checked={parentRel} onChange={(e) => setParentRel(e.target.checked)} /> parent is position: relative</label>
      </div>
      <div className="posstage" style={{ position: "relative", transform: pos === "fixed" ? "translateZ(0)" : undefined }}>
        <div className="posscroll">
          <div className="posparent" style={{ position: parentRel ? "relative" : "static" }}>
            <span className="pos-tag">.parent</span>
            <div className="posbox sib">sibling</div>
            {pos === "relative" && <div className="posghost" />}
            <div className="posbox target" style={{ position: pos, ...(offsets ? { top, left } : {}) }}>.box</div>
            <div className="posbox sib">sibling</div>
          </div>
          {[...Array(6)].map((_, i) => <p key={i} className="posfill">Scroll me… line {i + 1}</p>)}
        </div>
      </div>
      <p className="w-note">{notes[pos]}</p>
      <div className="css-out code-wrap"><CodeView code={code} lang="css" /></div>
    </>
  );
}

/* ── z-index and stacking contexts ── */
function ZIndex() {
  const [z, setZ] = useState({ a: 1, b: 2, c: 3 });
  const [ctx, setCtx] = useState(false);
  const boxes = [["a", "#ff7a3d", 20, 20], ["b", "#2bb673", 70, 60], ["c", "#5a6cf0", 120, 100]];
  return (
    <>
      <div className="w-title"><b>z-index playground</b></div>
      <div className="ctrls">
        {boxes.map(([k]) => (
          <label key={k}>.{k} z-index: <span>{z[k]}</span><input type="range" min="-1" max="5" value={z[k]} onChange={(e) => setZ({ ...z, [k]: +e.target.value })} /></label>
        ))}
        <label style={{ display: "flex", gap: 6, alignItems: "center" }}><input type="checkbox" checked={ctx} onChange={(e) => setCtx(e.target.checked)} /> put .b and .c in a wrapper with its own stacking context (z-index: 0)</label>
      </div>
      <div className="zstage">
        <div className="zbox" style={{ background: boxes[0][1], left: boxes[0][2], top: boxes[0][3], zIndex: z.a }}>.a z:{z.a}</div>
        <div style={ctx ? { position: "absolute", inset: 0, zIndex: 0 } : { display: "contents" }}>
          {boxes.slice(1).map(([k, c, l, t]) => <div key={k} className="zbox" style={{ background: c, left: l, top: t, zIndex: z[k] }}>.{k} z:{z[k]}</div>)}
        </div>
      </div>
      <p className="w-note">{ctx ? "Now .b and .c live inside a wrapper with z-index: 0. Their z-index only orders them inside that wrapper; against .a, the whole wrapper counts as z-index 0. Raise .b to 5 and it still can't beat .a at 1. That's a stacking context." : "Higher z-index paints on top. It only works on positioned elements (anything but position: static) and flex or grid children."}</p>
    </>
  );
}

/* ── display: block, inline, inline-block ── */
function Display() {
  const [d, setD] = useState("inline");
  const notes = {
    block: "Starts on a new line and fills the width. width, height, padding and margin all work.",
    inline: "Flows inside the text like a word. width and height are ignored, and vertical padding overlaps the lines around it without pushing them away.",
    "inline-block": "Flows inside the text like inline, but respects width, height, padding and margin like block. Handy for buttons and badges.",
  };
  return (
    <>
      <div className="w-title"><b>display: block vs inline vs inline-block</b></div>
      <div className="ctrls"><label>display<select value={d} onChange={(e) => setD(e.target.value)}>{["block", "inline", "inline-block"].map((o) => <option key={o}>{o}</option>)}</select></label></div>
      <div className="dispstage">
        Coffee is roasted on <span className="dispbox" style={{ display: d }}>Fridays</span> and rests for a few days, so the <span className="dispbox" style={{ display: d }}>best beans</span> arrive on Monday morning.
      </div>
      <p className="w-note">{notes[d]} Each highlighted span has <code>width: 110px; padding: 10px; margin: 6px</code>.</p>
    </>
  );
}

/* ── CSS grid ── */
const GRID_COLS = ["1fr 1fr 1fr", "repeat(4, 1fr)", "200px 1fr", "1fr 2fr", "repeat(auto-fit, minmax(120px, 1fr))"];
function Grid() {
  const [cols, setCols] = useState(GRID_COLS[0]);
  const [gap, setGap] = useState(10);
  const [span, setSpan] = useState(1);
  const [rowSpan, setRowSpan] = useState(1);
  const [dense, setDense] = useState(false);
  const [n, setN] = useState(7);
  const code = `.grid {\n  display: grid;\n  grid-template-columns: ${cols};\n  gap: ${gap}px;${dense ? "\n  grid-auto-flow: dense;" : ""}\n}\n.item-2 {\n  grid-column: span ${span};\n  grid-row: span ${rowSpan};\n}`;
  return (
    <>
      <div className="w-title"><b>CSS grid playground</b><button className="mini" onClick={() => setN(n >= 12 ? 4 : n + 1)}>+ item</button></div>
      <div className="ctrls">
        <label>grid-template-columns<select value={cols} onChange={(e) => setCols(e.target.value)}>{GRID_COLS.map((o) => <option key={o}>{o}</option>)}</select></label>
        <label>gap: <span>{gap}px</span><input type="range" min="0" max="30" value={gap} onChange={(e) => setGap(+e.target.value)} /></label>
        <label>item 2 column span: <span>{span}</span><input type="range" min="1" max="3" value={span} onChange={(e) => setSpan(+e.target.value)} /></label>
        <label>item 2 row span: <span>{rowSpan}</span><input type="range" min="1" max="2" value={rowSpan} onChange={(e) => setRowSpan(+e.target.value)} /></label>
        <label style={{ display: "flex", gap: 6, alignItems: "center" }}><input type="checkbox" checked={dense} onChange={(e) => setDense(e.target.checked)} /> grid-auto-flow: dense</label>
      </div>
      <div className="gridstage" style={{ gridTemplateColumns: cols, gap, gridAutoFlow: dense ? "dense" : "row" }}>
        {[...Array(n)].map((_, i) => (
          <div key={i} className="fx" style={{ width: "auto", background: FX_COLS[i % 5], gridColumn: i === 1 ? `span ${span}` : undefined, gridRow: i === 1 ? `span ${rowSpan}` : undefined, minHeight: 50 }}>{i + 1}</div>
        ))}
      </div>
      <div className="css-out code-wrap"><CodeView code={code} lang="css" /></div>
    </>
  );
}

/* ── px vs em vs rem ── */
function Units() {
  const [unit, setUnit] = useState("em");
  const [root, setRoot] = useState(16);
  const sizes = { px: "14px", em: "0.875em", rem: "0.875rem" };
  const levels = [0, 1, 2, 3];
  const px = (lvl) => unit === "px" ? 14 : unit === "rem" ? 0.875 * root : 16 * Math.pow(0.875, lvl + 1) * (root / 16);
  return (
    <>
      <div className="w-title"><b>px vs em vs rem</b></div>
      <div className="ctrls">
        <label>nested lists use font-size:<select value={unit} onChange={(e) => setUnit(e.target.value)}>{["px", "em", "rem"].map((o) => <option key={o} value={o}>{sizes[o]}</option>)}</select></label>
        <label>browser default font size: <span>{root}px</span><input type="range" min="12" max="28" value={root} onChange={(e) => setRoot(+e.target.value)} /></label>
      </div>
      <div className="unitstage" style={{ fontSize: root }}>
        {levels.reduceRight((inner, lvl) => (
          <ul style={{ fontSize: unit === "px" ? "14px" : unit === "rem" ? `${0.875 * root}px` : "0.875em", margin: 0 }}>
            <li>Level {lvl + 1}: {px(lvl).toFixed(1)}px</li>
            {inner}
          </ul>
        ), null)}
      </div>
      <p className="w-note">{unit === "em" ? "em is relative to the parent's font size, so nested lists keep shrinking: the compounding problem." : unit === "rem" ? "rem is relative to the root font size: every level is the same, and it still follows the user's browser setting. Try the slider." : "px ignores the user's font-size preference entirely. Move the slider: nothing changes."}</p>
    </>
  );
}


/* ── AI: temperature / top-p over a next-token distribution ── */
function Temperature() {
  const logits = [["sunny", 3.2], ["warm", 2.6], ["cloudy", 2.1], ["perfect", 1.7], ["chilly", 1.2], ["purple", -0.4], ["banana", -1.6]];
  const [temp, setTemp] = useState(1);
  const [topP, setTopP] = useState(1);
  const [picks, setPicks] = useState([]);
  const t = Math.max(temp, 0.01);
  const ex = logits.map(([w, l]) => [w, Math.exp(l / t)]);
  const sum = ex.reduce((a, [, e]) => a + e, 0);
  let probs = ex.map(([w, e]) => [w, e / sum]);
  let cum = 0;
  const kept = new Set(probs.slice().sort((a, b) => b[1] - a[1]).filter(([, p]) => { const keep = cum < topP; cum += p; return keep; }).map(([w]) => w));
  const keptSum = probs.filter(([w]) => kept.has(w)).reduce((a, [, p]) => a + p, 0);
  const final = probs.map(([w, p]) => [w, kept.has(w) ? p / keptSum : 0]);
  const sample = () => {
    const out = [];
    for (let i = 0; i < 8; i++) {
      if (temp === 0) { out.push(final[0][0]); continue; }
      let r = Math.random(), acc = 0;
      for (const [w, p] of final) { acc += p; if (r <= acc) { out.push(w); break; } }
    }
    setPicks(out);
  };
  return (
    <>
      <div className="w-title"><b>Temperature and top-p</b> · "Today the weather is ___"</div>
      <div className="ctrls">
        <label>temperature: <span>{temp.toFixed(1)}</span><input type="range" min="0" max="2" step="0.1" value={temp} onChange={(e) => setTemp(+e.target.value)} aria-label="Temperature" /></label>
        <label>top_p: <span>{topP.toFixed(2)}</span><input type="range" min="0.1" max="1" step="0.05" value={topP} onChange={(e) => setTopP(+e.target.value)} aria-label="Top p" /></label>
        <button className="mini" onClick={sample}>Sample 8 completions</button>
      </div>
      <div className="tokbars">
        {final.map(([w, p]) => (
          <div key={w} className={"tokbar" + (p === 0 ? " cut" : "")}>
            <span className="tokw">{w}</span>
            <span className="tokt"><span style={{ width: (temp === 0 ? (w === final[0][0] ? 100 : 0) : p * 100) + "%" }} /></span>
            <span className="tokp">{temp === 0 ? (w === final[0][0] ? "100%" : "0%") : (p * 100).toFixed(1) + "%"}</span>
          </div>
        ))}
      </div>
      {picks.length > 0 && <div className="tokpicks" aria-live="polite">{picks.map((w, i) => <span key={i} className="tag">{w}</span>)}</div>}
      <p className="w-note">{temp === 0 ? "Temperature 0 always picks the most likely token: repeatable, good for extraction and classification." : temp < 0.7 ? "Low temperature sharpens the distribution. Answers stay focused and similar." : temp <= 1.2 ? "Around 1, the model samples close to its learned probabilities." : "High temperature flattens the distribution, so unlikely tokens like \"banana\" start appearing. Creative, then incoherent."} {topP < 1 ? " top_p keeps only the most likely tokens that add up to " + Math.round(topP * 100) + "%, then renormalises." : ""}</p>
    </>
  );
}

/* ── AI: a 2-D picture of embedding space and cosine similarity ── */
function Embeddings() {
  const A = (deg) => [Math.cos((deg * Math.PI) / 180), Math.sin((deg * Math.PI) / 180)];
  const docs = [
    ["Galaxy Quest", "comedy", A(52)], ["Airplane!", "comedy", A(18)], ["Paddington 2", "family", A(-28)],
    ["The Martian", "space", A(78)], ["Interstellar", "space", A(98)], ["Gravity", "space", A(124)],
    ["The Conjuring", "horror", A(205)], ["Hereditary", "horror", A(222)], ["Alien", "horror", A(158)],
  ];
  const queries = { "a funny space adventure": A(60), "something to watch with my kids": A(-18), "a terrifying film": A(212), "astronauts stranded far from home": A(90) };
  const [q, setQ] = useState("a funny space adventure");
  const [k, setK] = useState(3);
  const qv = queries[q];
  const cos = (a, b) => (a[0] * b[0] + a[1] * b[1]) / (Math.hypot(...a) * Math.hypot(...b));
  const ranked = docs.map((d) => [...d, cos(qv, d[2])]).sort((a, b) => b[3] - a[3]);
  const top = new Set(ranked.slice(0, k).map((d) => d[0]));
  const P = (v) => [150 + v[0] * 120, 140 - v[1] * 120];
  const col = { comedy: "#ffb84d", family: "#6ee7b7", space: "#7dd3fc", horror: "#f87171" };
  return (
    <>
      <div className="w-title"><b>Semantic search in embedding space</b> (real embeddings have hundreds of dimensions; this is a 2-D sketch)</div>
      <div className="ctrls">
        <label>query: <select value={q} onChange={(e) => setQ(e.target.value)}>{Object.keys(queries).map((x) => <option key={x}>{x}</option>)}</select></label>
        <label>match_count: <span>{k}</span><input type="range" min="1" max="5" value={k} onChange={(e) => setK(+e.target.value)} aria-label="Number of matches" /></label>
      </div>
      <div className="embgrid">
        <svg viewBox="-50 0 400 280" className="embsvg" role="img" aria-label={"Query vector and the " + k + " closest movies"}>
          <circle cx="150" cy="140" r="120" fill="none" stroke="currentColor" opacity=".15" />
          {docs.map((d) => { const [x, y] = P(d[2]); return (<g key={d[0]}><line x1="150" y1="140" x2={x} y2={y} stroke={col[d[1]]} opacity={top.has(d[0]) ? 0.9 : 0.15} strokeWidth={top.has(d[0]) ? 2 : 1} /><circle cx={x} cy={y} r={top.has(d[0]) ? 6 : 4} fill={col[d[1]]} /><text x={x + (x > 150 ? 8 : -8)} y={y + 4} fontSize="10" textAnchor={x > 150 ? "start" : "end"} fill="currentColor" opacity={top.has(d[0]) ? 1 : 0.5}>{d[0]}</text></g>); })}
          {(() => { const [x, y] = P(qv); return <g><line x1="150" y1="140" x2={x} y2={y} stroke="#a78bfa" strokeWidth="3" /><circle cx={x} cy={y} r="7" fill="#a78bfa" /></g>; })()}
        </svg>
        <ol className="embrank">
          {ranked.map((d) => <li key={d[0]} className={top.has(d[0]) ? "on" : ""}><span>{d[0]}</span><code>{d[3].toFixed(3)}</code></li>)}
        </ol>
      </div>
      <p className="w-note">Cosine similarity compares the <b>angle</b> between vectors: 1 means the same direction, 0 unrelated, -1 opposite. The purple arrow is the query. Similar meaning lands nearby even with no words in common.</p>
    </>
  );
}

const WIDGETS = { stack: Stack, boxmodel: BoxModel, flexbox: Flexbox, specificity: Specificity, truthy: Truthy, position: Position, zindex: ZIndex, display: Display, grid: Grid, units: Units, temperature: Temperature, embeddings: Embeddings };

export default function Widget({ b }) {
  const W = WIDGETS[b.name];
  return W ? <div className="widget"><W /></div> : null;
}
