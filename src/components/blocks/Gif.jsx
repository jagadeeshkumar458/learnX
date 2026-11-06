import React, { useEffect, useRef, useState } from "react";

/* GIF-style looping animations: silent, short, autoplay while visible, click to pause.
   Block: { t: "gif", name: "flex-justify" } */

function useLoop(frames, ref) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(false);
  const reduce = typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;
  useEffect(() => {
    const el = ref.current; if (!el || !("IntersectionObserver" in window)) { setVisible(true); return; }
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.3 });
    io.observe(el); return () => io.disconnect();
  }, [ref]);
  useEffect(() => {
    if (paused || !visible || reduce) return;
    const t = setTimeout(() => setI((x) => (x + 1) % frames.length), frames[i].ms || 1600);
    return () => clearTimeout(t);
  }, [i, paused, visible, frames, reduce]);
  return { i, paused, setPaused, reduce, setI };
}

function Frame({ children, caption, label, loop }) {
  return (
    <figure className="gif" onClick={() => loop.setPaused((p) => !p)} role="button" tabIndex={0} aria-pressed={loop.paused}
      aria-label={`${label}. ${loop.paused ? "Paused, press to play" : "Playing, press to pause"}`}
      onKeyDown={(e) => (e.key === " " || e.key === "Enter") && (e.preventDefault(), loop.setPaused((p) => !p))}>
      <span className="gif-badge">{loop.paused ? "❚❚ PAUSED" : "GIF"}</span>
      {children}
      <figcaption className="gif-cap">{caption}{loop.reduce && <button className="mini" style={{ marginLeft: 8 }} onClick={(e) => { e.stopPropagation(); loop.setI((x) => x + 1); }}>Next</button>}</figcaption>
    </figure>
  );
}

/* ── justify-content cycling ── */
const MODES = ["flex-start", "center", "flex-end", "space-between", "space-around", "space-evenly"];
function flexPos(mode, W = 520, w = 64, n = 4) {
  const free = W - n * w;
  let start = 0, gap = 0;
  if (mode === "center") start = free / 2;
  if (mode === "flex-end") start = free;
  if (mode === "space-between") gap = free / (n - 1);
  if (mode === "space-around") { gap = free / n; start = gap / 2; }
  if (mode === "space-evenly") { gap = free / (n + 1); start = gap; }
  return [...Array(n)].map((_, k) => start + k * (w + gap));
}
function FlexJustify() {
  const ref = useRef(null);
  const frames = MODES.map((m) => ({ m, ms: 1700 }));
  const loop = useLoop(frames, ref);
  const mode = frames[loop.i].m, xs = flexPos(mode), cols = ["#ff7a45", "#2fc6a9", "#f2b632", "#8b9cff"];
  return (
    <div ref={ref}><Frame loop={loop} label="justify-content animation" caption={<>Same 4 items, different <code>justify-content</code>. Watch where the free space goes.</>}>
      <svg viewBox="0 0 600 170" className="gif-svg">
        <text x="300" y="30" textAnchor="middle" className="gif-code">justify-content: <tspan fill="#ff9f6b">{mode}</tspan>;</text>
        <rect x="40" y="52" width="520" height="86" rx="10" fill="none" stroke="#3a4468" strokeDasharray="5 4" />
        {xs.map((x, k) => (
          <g key={k} style={{ transform: `translate(${40 + x}px, 64px)`, transition: "transform .7s cubic-bezier(.2,.8,.2,1)" }}>
            <rect width="64" height="62" rx="9" fill={cols[k]} /><text x="32" y="38" textAnchor="middle" className="gif-num">{k + 1}</text>
          </g>
        ))}
        <text x="300" y="160" textAnchor="middle" className="gif-dim">main axis →</text>
      </svg>
    </Frame></div>
  );
}

/* ── terminal typing ── */
const SCRIPT = [
  { cmd: "pwd", out: "/home/dev" },
  { cmd: "mkdir -p site/css", out: "" },
  { cmd: "cd site", out: "" },
  { cmd: "echo \"<h1>Hi</h1>\" > index.html", out: "" },
  { cmd: "ls", out: "css/  index.html" },
  { cmd: "cat index.html", out: "<h1>Hi</h1>" },
];
function TerminalTyping() {
  const ref = useRef(null);
  // one frame per character typed, plus a pause after each command
  const frames = [];
  SCRIPT.forEach((s, si) => {
    for (let c = 0; c <= s.cmd.length; c++) frames.push({ si, c, ms: c === s.cmd.length ? 900 : 55 });
    frames.push({ si, c: s.cmd.length, done: true, ms: si === SCRIPT.length - 1 ? 2600 : 500 });
  });
  const loop = useLoop(frames, ref);
  const f = frames[loop.i];
  const cwd = (si) => (si >= 3 ? "~/site" : "~");
  return (
    <div ref={ref}><Frame loop={loop} label="Terminal session animation" caption="Create a folder, move into it, write a file, check it. All without touching the mouse.">
      <div className="gif-term">
        <div className="term-bar"><span /><span /><span /><b>bash</b></div>
        <div className="gif-term-body">
          {SCRIPT.slice(0, f.si).map((s, k) => (
            <div key={k}><div><span className="t-prompt">dev@shipyard:{cwd(k)}$ </span>{s.cmd}</div>{s.out && <div className="t-out">{s.out}</div>}</div>
          ))}
          <div><span className="t-prompt">dev@shipyard:{cwd(f.si)}$ </span>{SCRIPT[f.si].cmd.slice(0, f.c)}{!f.done && <span className="gif-caret">▍</span>}</div>
          {f.done && SCRIPT[f.si].out && <div className="t-out">{SCRIPT[f.si].out}</div>}
        </div>
      </div>
    </Frame></div>
  );
}

/* ── array push / pop / length ── */
const ARR = [
  { a: [10, 7], code: "const cards = [10, 7]", ms: 1600 },
  { a: [10, 7, 4], code: "cards.push(4)", hot: 2, ms: 1600 },
  { a: [10, 7, 4], code: "cards.length  // 3", len: true, ms: 1600 },
  { a: [10, 7, 4], code: "cards[0]  // 10", hot: 0, ms: 1600 },
  { a: [10, 7], code: "cards.pop()  // 4", gone: 2, ms: 1600 },
];
function ArrayOps() {
  const ref = useRef(null);
  const loop = useLoop(ARR, ref);
  const f = ARR[loop.i];
  const shown = f.gone !== undefined ? [10, 7, 4] : f.a;
  return (
    <div ref={ref}><Frame loop={loop} label="Array methods animation" caption={<>Arrays are ordered lists. Indexes start at <b>0</b>.</>}>
      <svg viewBox="0 0 600 170" className="gif-svg">
        <text x="300" y="32" textAnchor="middle" className="gif-code">{f.code}</text>
        {shown.map((v, k) => {
          const leaving = f.gone === k, hot = f.hot === k;
          return (
            <g key={k} style={{ transform: `translate(${170 + k * 90}px, ${leaving ? 30 : 58}px)`, opacity: leaving ? 0 : 1, transition: "transform .6s, opacity .6s" }}>
              <rect width="76" height="76" rx="10" fill={hot ? "#3a2117" : "#161b2e"} stroke={hot ? "#ff7a45" : "#3a4468"} strokeWidth={hot ? 3 : 1.5} className={hot ? "gif-pop" : ""} />
              <text x="38" y="47" textAnchor="middle" className="gif-num" style={{ fill: hot ? "#ff9f6b" : "#e8ecf7" }}>{v}</text>
              <text x="38" y="100" textAnchor="middle" className="gif-dim">[{k}]</text>
            </g>
          );
        })}
        <g style={{ opacity: f.len ? 1 : 0, transition: "opacity .4s" }}>
          <path d="M170,150 H436" stroke="#2fc6a9" strokeWidth="2" /><text x="303" y="166" textAnchor="middle" fill="#2fc6a9" className="gif-dim">length = 3</text>
        </g>
      </svg>
    </Frame></div>
  );
}

/* ── specificity battles ── */
const BATTLES = [
  { a: "p", sa: [0, 0, 1], b: ".intro", sb: [0, 1, 0], w: "b", why: "a class beats an element" },
  { a: ".nav .link", sa: [0, 2, 0], b: "#menu a", sb: [1, 0, 1], w: "b", why: "one id beats any number of classes" },
  { a: ".btn", sa: [0, 1, 0], b: ".btn", sb: [0, 1, 0], w: "b", why: "tie → the later rule wins" },
  { a: "ul li a", sa: [0, 0, 3], b: "a:hover", sb: [0, 1, 1], w: "b", why: "pseudo-classes count like classes" },
];
function SpecBattle() {
  const ref = useRef(null);
  const frames = BATTLES.flatMap((x) => [{ x, reveal: false, ms: 1300 }, { x, reveal: true, ms: 2200 }]);
  const loop = useLoop(frames, ref);
  const { x, reveal } = frames[loop.i];
  const card = (sel, sc, side, win) => (
    <div className={"spec-card" + (reveal ? (win ? " win" : " lose") : "")}>
      <code>{sel}</code>
      <div className="score">{sc.map((n, k) => <span key={k} className={"abc"[k]}>{reveal ? n : "?"}</span>)}</div>
      <small>{side === "a" ? "earlier in the CSS" : "later in the CSS"}</small>
    </div>
  );
  return (
    <div ref={ref}><Frame loop={loop} label="Specificity battle animation" caption="Score = (ids, classes, elements). Compare left to right.">
      <div className="spec-battle">
        {card(x.a, x.sa, "a", x.w === "a")}
        <div className="vs">VS</div>
        {card(x.b, x.sb, "b", x.w === "b")}
      </div>
      <div className="spec-why" style={{ opacity: reveal ? 1 : 0 }}>✓ {x.why}</div>
    </Frame></div>
  );
}

/* ── box model layers ── */
const BOX = [
  { k: "content", ms: 1300 }, { k: "padding", ms: 1300 }, { k: "border", ms: 1300 }, { k: "margin", ms: 1300 }, { k: "all", ms: 2200 },
];
function BoxLayers() {
  const ref = useRef(null);
  const loop = useLoop(BOX, ref);
  const step = loop.i;
  const p = step >= 1 ? 22 : 0, bd = step >= 2 ? 8 : 0, m = step >= 3 ? 26 : 0;
  const w = 150, h = 60;
  const total = w + 2 * (p + bd);
  return (
    <div ref={ref}><Frame loop={loop} label="Box model animation" caption={<>Every element is a box: content, then padding, border and margin wrap around it.</>}>
      <svg viewBox="0 0 600 220" className="gif-svg">
        <g style={{ transform: "translate(300px, 112px)" }}>
          <rect x={-(w / 2 + p + bd + m)} y={-(h / 2 + p + bd + m)} width={w + 2 * (p + bd + m)} height={h + 2 * (p + bd + m)} fill="rgba(242,182,50,.16)" stroke={m ? "#f2b632" : "none"} strokeDasharray="4 3" style={{ transition: "all .6s" }} />
          <rect x={-(w / 2 + p + bd)} y={-(h / 2 + p + bd)} width={w + 2 * (p + bd)} height={h + 2 * (p + bd)} fill="#e8ecf7" style={{ transition: "all .6s" }} />
          <rect x={-(w / 2 + p)} y={-(h / 2 + p)} width={w + 2 * p} height={h + 2 * p} fill="#1d5c52" style={{ transition: "all .6s" }} />
          <rect x={-w / 2} y={-h / 2} width={w} height={h} fill="#ff7a45" />
          <text x="0" y="5" textAnchor="middle" className="gif-num" style={{ fontSize: 15 }}>content</text>
        </g>
        <text x="300" y="28" textAnchor="middle" className="gif-code">{["width: 150px;", "padding: 22px;", "border: 8px solid;", "margin: 26px;", "box-sizing: content-box"][step]}</text>
        <text x="300" y="210" textAnchor="middle" className="gif-dim">rendered width = {total}px{step === 4 ? "  (use border-box to keep it 150px)" : ""}</text>
      </svg>
    </Frame></div>
  );
}

const GIFS = { "flex-justify": FlexJustify, "terminal-typing": TerminalTyping, "array-ops": ArrayOps, "spec-battle": SpecBattle, "box-layers": BoxLayers };
export default function Gif({ b }) {
  const G = GIFS[b.name];
  return G ? <G /> : null;
}
