import React from "react";

/* Animated explainer scenes. Each scene renders the state for step `s`;
   CSS transitions on the SVG elements animate the change between steps. */

const C = { ink: "#e8ecf7", dim: "#6b759a", line: "#2a3150", or: "#ffb347", pk: "#ff6b9a", cy: "#4dd7e8", gr: "#5eead4", ye: "#ffd166", bl: "#8b9cff", red: "#ff6b6b", panel: "#161b2e" };

const G = ({ x = 0, y = 0, o = 1, s = 1, children, className }) => (
  <g className={className} style={{ transform: `translate(${x}px, ${y}px) scale(${s})`, opacity: o }}>{children}</g>
);
/* Animates its children from one point to another each time it mounts (give it key={step}). */
const Travel = ({ from, to, dur = 1.3, delay = 0, children }) => (
  <g className="ex-travel" style={{ "--fx": from[0] + "px", "--fy": from[1] + "px", "--tx": to[0] + "px", "--ty": to[1] + "px", animationDuration: dur + "s", animationDelay: delay + "s" }}>{children}</g>
);
const T = ({ x, y, children, c = C.ink, size = 14, anchor = "middle", hand, mono, w = 600, o = 1 }) => (
  <text x={x} y={y} fill={c} fontSize={size} textAnchor={anchor} opacity={o}
    fontFamily={hand ? "var(--f-hand)" : mono ? "var(--f-mono)" : "var(--f-body)"} fontWeight={w}>{children}</text>
);
const Box = ({ x, y, w, h, c = C.line, glow, r = 10, fill = C.panel, dash }) => (
  <rect x={x} y={y} width={w} height={h} rx={r} fill={fill} stroke={c} strokeWidth={glow ? 2.5 : 1.5}
    strokeDasharray={dash} className={glow ? "ex-glow" : ""} style={{ color: c }} />
);
const Pill = ({ text, c, w = 70, mono = true }) => (
  <g>
    <rect x={-w / 2} y={-12} width={w} height={24} rx={7} fill={C.panel} stroke={c} strokeWidth="2" />
    <T x={0} y={4.5} c={c} size={11.5} mono={mono}>{text}</T>
  </g>
);
const Arrow = ({ x1, y1, x2, y2, c = C.dim, o = 1, dash = "5 5" }) => (
  <g opacity={o}>
    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={c} strokeWidth="1.8" strokeDasharray={dash} />
    <path d={`M${x2},${y2} l${x1 < x2 ? -8 : x1 > x2 ? 8 : -4},${y1 === y2 ? -4 : y1 < y2 ? -8 : 8} ${y1 === y2 ? 0 : x1 === x2 ? 8 : 0},${y1 === y2 ? 8 : 0}`} fill="none" stroke={c} strokeWidth="1.8" />
  </g>
);
const Code = ({ x, y, lines, hl = -1, w = 270 }) => (
  <g>
    <Box x={x} y={y} w={w} h={lines.length * 21 + 16} fill="#0b0e1a" />
    {hl >= 0 && <rect x={x + 4} y={y + 6 + hl * 21} width={w - 8} height={21} rx={4} fill={C.or} opacity=".16" className="ex-hl" />}
    {lines.map((l, i) => (
      <text key={i} x={x + 12} y={y + 21 + i * 21} fontFamily="var(--f-mono)" fontSize="11.5" fill={i === hl ? C.ink : C.dim} style={{ whiteSpace: "pre" }}>{l}</text>
    ))}
  </g>
);
const Var = ({ x, y, name, value, c = C.or, hot }) => (
  <g>
    <T x={x} y={y - 8} c={C.dim} size={11} mono>{name}</T>
    <rect x={x - 32} y={y} width={64} height={34} rx={8} fill={C.panel} stroke={c} strokeWidth={hot ? 2.5 : 1.5} className={hot ? "ex-pop" : ""} style={{ transformOrigin: `${x}px ${y + 17}px` }} />
    <T x={x} y={y + 22} c={c} size={16} mono w={700}>{value}</T>
  </g>
);

/* ── 1. Request round trip ───────────────────────────── */
const ReqScene = ({ s }) => {
  const P = [[110, 165], [320, 165], [530, 165]];
  const trips = { 1: [0, 1, "POST /api/profile", C.cy], 3: [1, 2, "UPDATE users…", C.or], 4: [2, 1, "1 row updated", C.gr], 5: [1, 0, "200 OK {json}", C.gr] };
  const trip = trips[s];
  return (
    <>
      <Arrow x1={170} y1={150} x2={258} y2={150} o={0.5} />
      <Arrow x1={258} y1={182} x2={170} y2={182} o={0.5} />
      <Arrow x1={382} y1={150} x2={468} y2={150} o={0.5} />
      <Arrow x1={468} y1={182} x2={382} y2={182} o={0.5} />
      {[["Browser", "frontend", C.cy], ["Server", "backend / API", C.or], ["Database", "storage", C.gr]].map(([n, sub, c], i) => {
        const active = (i === 0 && (s === 0 || s === 6)) || (i === 1 && s === 2) || (i === 2 && (s === 3 || s === 4));
        return (
          <g key={n}>
            <Box x={P[i][0] - 60} y={110} w={120} h={110} c={active ? c : C.line} glow={active} />
            <T x={P[i][0]} y={240} c={active ? c : C.ink} hand size={20}>{n}</T>
            <T x={P[i][0]} y={258} c={C.dim} size={11}>{sub}</T>
          </g>
        );
      })}
      {/* browser contents */}
      <rect x={66} y={128} width={88} height={10} rx={3} fill={C.line} />
      <rect x={66} y={144} width={60} height={10} rx={3} fill={C.line} />
      <g style={{ opacity: s >= 6 ? 0 : 1 }}><rect x={66} y={176} width={50} height={22} rx={6} fill={s === 0 ? C.cy : C.line} className={s === 0 ? "ex-pulse" : ""} /><T x={91} y={191} c="#0b0e1a" size={11}>Save</T></g>
      <G o={s >= 6 ? 1 : 0}><T x={110} y={192} c={C.gr} size={14} w={700}>Saved ✓</T></G>
      {/* server contents */}
      {["auth ✓", "validate ✓", "query"].map((x, i) => <G key={x} o={s === 2 ? 1 : s > 2 ? 0.45 : 0.15}><T x={320} y={143 + i * 22} c={s === 2 ? C.or : C.dim} size={12.5} mono>{x}</T></G>)}
      {/* database */}
      <ellipse cx={530} cy={142} rx={36} ry={10} fill="none" stroke={s === 3 || s === 4 ? C.gr : C.dim} strokeWidth="1.6" />
      <path d="M494,142 v46 a36,10 0 0 0 72,0 v-46" fill="none" stroke={s === 3 || s === 4 ? C.gr : C.dim} strokeWidth="1.6" />
      <G o={s >= 4 ? 1 : 0}><T x={530} y={175} c={C.gr} size={11} mono>bio = "…"</T></G>
      {/* the moving packet */}
      {trip && <Travel key={s} from={[P[trip[0]][0], 92]} to={[P[trip[1]][0], 92]} dur={1.6} delay={0.3}><Pill text={trip[2]} c={trip[3]} w={128} /></Travel>}
      <G o={s === 6 ? 1 : 0}><T x={320} y={305} c={C.ye} hand size={20}>round trip ≈ 120 ms</T></G>
    </>
  );
};

/* ── 2. How the browser renders a page ───────────────── */
const RenderScene = ({ s }) => {
  const dom = [[90, 0, "html"], [50, 1, "head"], [130, 1, "body"], [100, 2, "h1"], [160, 2, "p"]];
  return (
    <>
      <G o={s >= 0 ? 1 : 0}>
        <Code x={14} y={20} w={150} lines={["<body>", "  <h1>Hi</h1>", "  <p>…</p>", "</body>"]} hl={s === 0 ? 1 : -1} />
        <Code x={14} y={140} w={150} lines={["h1 {", "  color: coral;", "}"]} hl={s === 1 ? 1 : -1} />
      </G>
      <G o={s >= 1 ? 1 : 0.15}>
        <T x={265} y={22} c={C.cy} hand size={18}>DOM</T>
        {dom.map(([x, d, t], i) => (
          <g key={t}>
            {i > 0 && <line x1={dom[d === 1 ? 0 : 2][0] + 180} y1={30 + (d - 1) * 38 + 22} x2={x + 180} y2={30 + d * 38 + 6} stroke={C.dim} />}
            <G x={x + 180} y={30 + d * 38 + 14} o={s >= 1 ? 1 : 0}><Pill text={t} c={C.cy} w={50} /></G>
          </g>
        ))}
      </G>
      <G o={s >= 2 ? 1 : 0.15}>
        <T x={265} y={175} c={C.pk} hand size={18}>CSSOM</T>
        <G x={265} y={200}><Pill text="h1 → coral" c={C.pk} w={96} /></G>
      </G>
      <G o={s >= 3 ? 1 : 0.1}>
        <Arrow x1={372} y1={124} x2={398} y2={146} c={C.ye} o={s >= 3 ? 1 : 0} />
        <Arrow x1={318} y1={196} x2={398} y2={176} c={C.ye} o={s >= 3 ? 1 : 0} />
        <T x={455} y={130} c={C.ye} hand size={18}>Render tree</T>
        <G x={455} y={155}><Pill text="h1 (coral)" c={C.ye} w={96} /></G>
        <G x={455} y={185}><Pill text="p" c={C.ye} w={96} /></G>
      </G>
      <G o={s >= 4 ? 1 : 0.1}>
        <T x={455} y={222} c={C.bl} hand size={18}>Layout</T>
        <rect x={400} y={232} width={110} height={70} rx={6} fill="none" stroke={C.bl} strokeDasharray="4 3" />
        <rect x={408} y={240} width={s >= 4 ? 70 : 0} height={16} fill="none" stroke={C.bl} style={{ transition: "width .8s" }} />
        <rect x={408} y={262} width={s >= 4 ? 94 : 0} height={30} fill="none" stroke={C.bl} style={{ transition: "width .8s .2s" }} />
      </G>
      <G o={s >= 5 ? 1 : 0.1}>
        <T x={585} y={222} c={C.gr} hand size={18}>Paint</T>
        <rect x={530} y={232} width={100} height={70} rx={6} fill="#f6f4ef" />
        <G o={s >= 5 ? 1 : 0}><T x={548} y={256} c="#ff7f50" size={15} anchor="start" w={800}>Hi</T><rect x={548} y={266} width={70} height={5} rx={2} fill="#999" /><rect x={548} y={276} width={56} height={5} rx={2} fill="#999" /></G>
      </G>
      <G o={s === 6 ? 1 : 0}><T x={320} y={322} c={C.or} hand size={17}>Change a layout property → the browser repeats layout + paint</T></G>
    </>
  );
};

/* ── 3. Events: click → handler → DOM ────────────────── */
const EventScene = ({ s }) => {
  const count = s >= 4 ? 1 : 0;
  const hl = [0, 2, -1, 2, 3, 4, -1][s];
  return (
    <>
      <Code x={10} y={30} w={350} hl={hl} lines={[
        'const btn = document.querySelector("#inc")', "let count = 0", 'btn.addEventListener("click", () => {', "  count += 1", "  countEl.textContent = count", "})"]} />
      <Var x={100} y={210} name="count" value={count} hot={s === 4} />
      <G o={s >= 1 ? 1 : 0.2}><T x={225} y={205} c={C.dim} size={11} mono>listeners</T><G x={225} y={225}><Pill text="click → fn" c={C.pk} w={86} /></G></G>
      {/* page */}
      <Box x={380} y={30} w={240} h={220} c={s === 6 ? C.gr : C.line} glow={s === 6} />
      <T x={500} y={60} c={C.dim} size={12}>People entered</T>
      <G key={count} className="ex-pop" ><T x={500} y={120} c={s >= 5 ? C.gr : C.ink} size={44} w={800} mono>{s >= 5 ? count : 0}</T></G>
      <rect x={455} y={160} width={90} height={34} rx={8} fill={s === 2 ? C.or : C.line} className={s === 2 ? "ex-pulse" : ""} />
      <T x={500} y={182} c={s === 2 ? "#0b0e1a" : C.ink} size={13} w={700}>Increment</T>
      {/* cursor */}
      <G x={s >= 2 ? 520 : 600} y={s >= 2 ? 182 : 290} className="ex-move"><path d="M0,0 l0,18 l5,-5 l4,9 l3,-1 l-4,-9 l7,0 z" fill={C.ink} stroke="#0b0e1a" /></G>
      {/* event object travelling */}
      {s === 3 && <Travel key="ev" from={[500, 177]} to={[225, 270]} dur={1.5} delay={0.2}><Pill text="click event" c={C.ye} w={92} /></Travel>}
      <G o={s === 5 ? 1 : 0}><Arrow x1={362} y1={128} x2={462} y2={112} c={C.gr} dash="0" /></G>
      <G o={s === 6 ? 1 : 0}><T x={320} y={312} c={C.ye} hand size={18}>The listener waits. It runs every time the event happens.</T></G>
    </>
  );
};

/* ── 4. A for loop, step by step ─────────────────────── */
const LOOP = [
  { i: null, sum: 0, hl: 0 }, { i: 0, sum: 0, hl: 1, check: true }, { i: 0, sum: 10, hl: 2 }, { i: 1, sum: 10, hl: 1, check: true },
  { i: 1, sum: 17, hl: 2 }, { i: 2, sum: 17, hl: 1, check: true }, { i: 2, sum: 21, hl: 2 }, { i: 3, sum: 21, hl: 1, check: false }, { i: 3, sum: 21, hl: 4 },
];
const LoopScene = ({ s }) => {
  const st = LOOP[s], cards = [10, 7, 4];
  return (
    <>
      <Code x={14} y={28} w={290} hl={st.hl} lines={["let sum = 0", "for (let i = 0; i < cards.length; i++) {", "  sum += cards[i]", "}", 'console.log(sum)  // 21']} />
      <T x={470} y={36} c={C.dim} size={12} mono>cards</T>
      {cards.map((v, i) => (
        <g key={i}>
          <rect x={380 + i * 64} y={48} width={52} height={70} rx={8} fill={st.i === i ? "#2a2140" : C.panel} stroke={st.i === i ? C.or : C.line} strokeWidth={st.i === i ? 2.5 : 1.5} />
          <T x={406 + i * 64} y={92} c={st.i === i ? C.or : C.ink} size={22} w={800} mono>{v}</T>
          <T x={406 + i * 64} y={134} c={C.dim} size={11} mono>[{i}]</T>
        </g>
      ))}
      <G x={st.i === null ? 342 : 406 + Math.min(st.i, 3) * 64} y={0} o={st.i === null ? 0 : 1} className="ex-move">
        <path d="M0,150 l-7,12 h14 z" fill={C.or} /><T x={0} y={180} c={C.or} size={13} mono w={700}>i = {st.i}</T>
      </G>
      <Var x={150} y={220} name="sum" value={st.sum} c={C.gr} hot={s === 2 || s === 4 || s === 6} />
      <G o={st.check !== undefined ? 1 : 0}>
        <rect x={250} y={222} width={170} height={32} rx={8} fill={C.panel} stroke={st.check ? C.gr : C.red} strokeWidth="2" />
        <T x={335} y={243} c={st.check ? C.gr : C.red} size={13} mono w={700}>{st.i} &lt; 3 → {String(st.check)}</T>
      </G>
      <G o={s === 8 ? 1 : 0}><T x={505} y={240} c={C.ye} hand size={24}>sum = 21 🃏</T></G>
    </>
  );
};

/* ── 5. localStorage + JSON round trip ───────────────── */
const StorageScene = ({ s }) => {
  const arr = s <= 1 || s >= 6;
  return (
    <>
      <T x={110} y={36} c={C.dim} size={12} mono>myLeads (array in memory)</T>
      <G o={arr ? 1 : 0.15}>
        <Box x={30} y={50} w={160} h={70} c={s === 6 ? C.gr : C.cy} glow={s === 6} />
        <G x={75} y={85}><Pill text='"a.com"' c={C.cy} w={70} /></G>
        <G x={148} y={85}><Pill text='"b.dev"' c={C.cy} w={70} /></G>
      </G>
      <G o={s === 4 ? 1 : 0}><T x={24} y={150} c={C.red} hand size={18} anchor="start">page refreshed → memory wiped</T></G>
      {/* stringify */}
      <G o={s === 1 ? 1 : s > 1 ? 0.35 : 0.1}><T x={320} y={70} c={C.or} size={12.5} mono>JSON.stringify()</T><Arrow x1={200} y1={85} x2={440} y2={85} c={C.or} o={s >= 1 ? 1 : 0} /></G>

      {/* shelf */}
      <Box x={440} y={150} w={180} h={110} c={s === 2 || s === 3 ? C.or : C.line} glow={s === 2} />
      <T x={530} y={140} c={C.dim} size={12} mono>localStorage (strings only)</T>
      <T x={460} y={230} c={C.dim} size={11.5} mono anchor="start">key: "myLeads"</T>
      <G o={s === 3 ? 1 : 0}><T x={530} y={290} c={C.ye} hand size={17}>survives refreshes &amp; restarts</T></G>
      {(() => {
        const str = <Pill text={'\'["a.com","b.dev"]\''} c={s >= 5 ? C.gr : C.or} w={150} />;
        if (s === 1) return <Travel key="s1" from={[110, 85]} to={[320, 110]}>{str}</Travel>;
        if (s === 2) return <Travel key="s2" from={[320, 110]} to={[530, 190]}>{str}</Travel>;
        if (s === 3 || s === 4) return <G x={530} y={190}>{str}</G>;
        if (s === 5) return <Travel key="s5" from={[530, 190]} to={[110, 85]} dur={1.6}>{str}</Travel>;
        return null;
      })()}
      {/* parse */}
      <G o={s === 5 ? 1 : s > 5 ? 0.35 : 0.1}><T x={320} y={150} c={C.gr} size={12.5} mono>JSON.parse()</T><Arrow x1={440} y1={175} x2={200} y2={110} c={C.gr} o={s >= 5 ? 1 : 0} /></G>
      <G o={s === 6 ? 1 : 0}><T x={320} y={305} c={C.ye} hand size={19}>array → string → stored → string → array</T></G>
    </>
  );
};

/* ── 6. Shell pipes ──────────────────────────────────── */
const LOG = [["INFO start", 0], ["ERROR db timeout", 1], ["INFO GET /", 0], ["ERROR 502 payment", 2], ["ERROR db timeout", 1], ["WARN slow", 0], ["ERROR db timeout", 1]];
const PipeScene = ({ s }) => {
  const xs = [80, 235, 395, 545];
  const errs = LOG.filter((l) => l[1]);
  const sorted = [...errs].sort((a, b) => a[0].localeCompare(b[0]));
  const stageName = ["server.log", "grep ERROR", "sort", "uniq -c"];
  return (
    <>
      {stageName.map((n, i) => (
        <g key={n}>
          <Box x={xs[i] - 68} y={40} w={136} h={236} c={s === i || (s === 4 && i === 3) ? C.or : C.line} glow={s === i || (s === 4 && i === 3)} />
          <T x={xs[i]} y={30} c={i === 0 ? C.dim : C.or} size={12.5} mono w={700}>{i === 0 ? n : (i > 0 ? "| " : "") + n}</T>
        </g>
      ))}
      {LOG.map(([t, k], i) => {
        const isErr = !!k;
        let x = xs[0], y = 64 + i * 30, o = 1;
        if (s >= 1) { if (isErr) { const j = errs.findIndex((e) => e === LOG[i]); x = xs[1]; y = 64 + j * 30; } else o = 0.12; }
        if (s >= 2 && isErr) { const j = sorted.indexOf(LOG[i]); x = xs[2]; y = 64 + j * 30; }
        if (s >= 3 && isErr) { x = xs[3]; y = k === 1 ? 64 : 94; o = (k === 1 && LOG.findIndex((l) => l[1] === 1) !== i) || (k === 2 && LOG.findIndex((l) => l[1] === 2) !== i) ? 0 : 1; }
        const c = k === 1 ? C.pk : k === 2 ? C.cy : C.dim;
        return <G key={i} x={x} y={y} o={o} className="ex-move"><Pill text={t} c={c} w={124} /></G>;
      })}
      <G o={s >= 3 ? 1 : 0}><T x={xs[3] - 60} y={124} c={C.pk} size={12} mono anchor="start" w={700}>3 ×</T><T x={xs[3] - 60} y={146} c={C.cy} size={12} mono anchor="start" w={700}>1 ×</T></G>
      <G o={s === 4 ? 1 : 0}><T x={320} y={312} c={C.ye} hand size={19}>grep ERROR server.log | sort | uniq -c</T></G>
    </>
  );
};

/* ── 7. Git: working tree → staging → history, branches ─ */
const GitScene = ({ s }) => {
  const cols = [110, 320, 530];
  const fx = s <= 1 ? 0 : s === 2 ? 1 : 2;
  const commits = s >= 3 ? (s >= 5 ? 3 : 2) : 1;
  const feature = s >= 4;
  return (
    <>
      {["Working tree", "Staging area", "Repository"].map((n, i) => (
        <g key={n}>
          <Box x={cols[i] - 90} y={30} w={180} h={130} c={(s === 1 && i === 0) || (s === 2 && i === 1) || (s === 3 && i === 2) ? C.or : C.line} glow={(s === 2 && i === 1) || (s === 3 && i === 2)} />
          <T x={cols[i]} y={22} c={C.ink} hand size={18}>{n}</T>
        </g>
      ))}
      <Arrow x1={202} y1={95} x2={228} y2={95} o={0.6} /><T x={215} y={180} c={C.dim} size={11} mono>git add</T>
      <Arrow x1={412} y1={95} x2={438} y2={95} o={0.6} /><T x={425} y={180} c={C.dim} size={11} mono>git commit</T>
      <G x={cols[fx]} y={s === 0 ? 75 : 95} o={s === 0 ? 0.4 : s >= 3 ? 0 : 1} className="ex-move"><Pill text={s === 0 ? "index.html" : "index.html ✎"} c={s >= 1 ? C.or : C.dim} w={110} /></G>
      <G o={s === 0 ? 1 : 0}><T x={110} y={120} c={C.dim} size={12}>clean: nothing changed</T></G>
      {/* history graph */}
      <line x1={70} y1={240} x2={70 + (commits - 1) * 80} y2={240} stroke={C.or} strokeWidth="3" style={{ transition: "all .8s" }} />
      {[0, 1, 2].map((i) => (
        <G key={i} o={i < commits ? 1 : 0}><circle cx={70 + i * 80} cy={240} r={11} fill={i === commits - 1 && s === 3 ? C.or : C.panel} stroke={C.or} strokeWidth="2.5" className={i === commits - 1 && s === 3 ? "ex-pop" : ""} style={{ transformOrigin: `${70 + i * 80}px 240px` }} /></G>
      ))}
      <G o={feature ? 1 : 0}>
        <path d="M150,240 C185,240 190,292 230,292 L390,292" fill="none" stroke={C.cy} strokeWidth="3" strokeDasharray={s >= 4 ? "0" : "4 4"} />
        <circle cx={310} cy={292} r={11} fill={C.panel} stroke={C.cy} strokeWidth="2.5" />
        <circle cx={390} cy={292} r={11} fill={C.panel} stroke={C.cy} strokeWidth="2.5" />
      </G>
      <G o={s >= 6 ? 1 : 0}><path d="M390,292 C430,292 440,240 470,240" fill="none" stroke={C.cy} strokeWidth="3" /><line x1={230} y1={240} x2={470} y2={240} stroke={C.or} strokeWidth="3" /><circle cx={470} cy={240} r={13} fill={C.or} stroke={C.or} strokeWidth="2.5" className="ex-pop" style={{ transformOrigin: "470px 240px" }} /></G>
      <G x={s >= 6 ? 470 : 70 + (commits - 1) * 80} y={0} className="ex-move"><rect x={-26} y={204} width={52} height={18} rx={4} fill={C.ink} /><T x={0} y={217} c="#0b0e1a" size={11} mono w={700}>main</T></G>
      <G x={feature ? 390 : 150} y={0} o={feature ? 1 : 0} className="ex-move"><rect x={-40} y={308} width={80} height={18} rx={4} fill={C.cy} /><T x={0} y={321} c="#0b0e1a" size={11} mono w={700}>feature</T></G>
      <G o={s >= 6 ? 1 : 0}><T x={565} y={232} c={C.ye} hand size={18}>merge commit</T></G>
    </>
  );
};

export const EXPLAINERS = {
  request: { title: "What happens when you click Save", kicker: "Full stack", Scene: ReqScene, fx: ["click", "whoosh", "type", "whoosh", "pop", "whoosh", "success"], steps: [
    { cap: "You click Save on your profile page." }, { cap: "The browser sends an HTTP request to the server: POST /api/profile with your new bio.", say: "The browser sends an H T T P request to the server. A POST to slash api slash profile, with your new bio." },
    { cap: "The server checks who you are (auth), validates the data, then builds a query." }, { cap: "It asks the database to UPDATE your row." },
    { cap: "The database writes it to disk and confirms: 1 row updated." }, { cap: "The server replies 200 OK with JSON." },
    { cap: "JavaScript in the browser updates the page. The whole trip takes about a tenth of a second.", dur: 4200 }] },
  render: { title: "How a browser turns code into pixels", kicker: "HTML + CSS", Scene: RenderScene, fx: ["type", "build", "build", "build", "tick", "pop", "ding"], steps: [
    { cap: "The browser downloads your HTML and reads it top to bottom." }, { cap: "It builds the DOM: a tree of every element, parents and children." },
    { cap: "It reads your CSS and builds the CSSOM: which styles apply to which selectors." }, { cap: "DOM + CSSOM combine into the render tree: only visible elements, with their final styles." },
    { cap: "Layout: the browser calculates the exact size and position of every box." }, { cap: "Paint: it fills in pixels for text, colours, borders and images." },
    { cap: "Change a size or position later and layout + paint run again, which is why animating transform is cheaper than width.", dur: 4500 }] },
  events: { title: "Click → event → handler → DOM", kicker: "JavaScript", Scene: EventScene, fx: ["tick", "tick", "click", "whoosh", "pop", "pop", "ding"], steps: [
    { cap: "JavaScript finds the button in the DOM and stores it in a variable." }, { cap: "addEventListener registers a function to run on every click. Nothing runs yet." },
    { cap: "The user clicks the button." }, { cap: "The browser creates a click event and calls your function." },
    { cap: "count += 1 updates the variable in memory: 0 becomes 1." }, { cap: "textContent writes the new value into the DOM, and the browser repaints." },
    { cap: "The listener stays registered, ready for the next click.", dur: 3800 }] },
  loop: { title: "A for loop, one step at a time", kicker: "JavaScript", Scene: LoopScene, fx: ["tick", "tick", "pop", "tick", "pop", "tick", "pop", "error", "success"], steps: [
    { cap: "sum starts at 0. We want to add up the cards." }, { cap: "i starts at 0. Check the condition: is 0 < 3? Yes, so run the body.", say: "i starts at zero. Check the condition: is zero less than three? Yes, so we run the body." },
    { cap: "sum += cards[0] → 0 + 10 = 10.", say: "sum plus-equals cards at index zero. Zero plus ten is ten." }, { cap: "i++ makes i 1. Is 1 < 3? Yes.", say: "i plus plus makes i one. Is one less than three? Yes." }, { cap: "sum += cards[1] → 10 + 7 = 17.", say: "Add cards at index one. Ten plus seven is seventeen." },
    { cap: "i++ makes i 2. Is 2 < 3? Yes.", say: "i becomes two. Is two less than three? Yes." }, { cap: "sum += cards[2] → 17 + 4 = 21.", say: "Add cards at index two. Seventeen plus four is twenty-one." },
    { cap: "i++ makes i 3. Is 3 < 3? No, so the loop stops.", say: "i becomes three. Is three less than three? No. So the loop stops." }, { cap: "The code after the loop runs. sum is 21. Blackjack!", dur: 3600, say: "The code after the loop runs. sum is twenty-one. Blackjack!" }] },
  storage: { title: "Saving data with localStorage", kicker: "JavaScript", Scene: StorageScene, fx: ["tick", "whoosh", "whoosh", "ding", "error", "whoosh", "success"], steps: [
    { cap: "Your leads live in an array in memory, which disappears when the page reloads." }, { cap: "localStorage only stores strings, so JSON.stringify turns the array into text." },
    { cap: "setItem saves that string under the key \"myLeads\"." }, { cap: "It stays in the browser across refreshes and restarts." },
    { cap: "The user refreshes. Every variable in memory starts empty again." }, { cap: "getItem reads the string back, and JSON.parse turns it into an array." },
    { cap: "The array is restored and you can render the list again.", dur: 3800 }] },
  pipes: { title: "How pipes chain commands", kicker: "Command line", Scene: PipeScene, fx: ["tick", "whoosh", "whoosh", "pop", "success"], steps: [
    { cap: "server.log has every line: INFO, WARN and ERROR mixed together." }, { cap: "grep ERROR keeps only lines containing ERROR and passes them on." },
    { cap: "sort puts identical lines next to each other." }, { cap: "uniq -c collapses neighbouring duplicates and counts them.", say: "unique dash c collapses neighbouring duplicates and counts them." },
    { cap: "One line answers “which errors, and how often?”: 3 db timeouts, 1 payment failure.", dur: 4200, say: "One line answers: which errors, and how often? Three database timeouts, and one payment failure." }] },
  git: { title: "Working tree → staging → commits → branches", kicker: "Git", Scene: GitScene, fx: ["tick", "type", "whoosh", "pop", "build", "pop", "success"], steps: [
    { cap: "Your repository starts clean: one commit, nothing changed." }, { cap: "You edit index.html. Git sees the change in the working tree." },
    { cap: "git add moves the change into the staging area, the draft of your next snapshot." }, { cap: "git commit saves the snapshot to history, and main moves forward." },
    { cap: "git switch -c feature starts a branch. New commits go there; main stays put." }, { cap: "Meanwhile someone commits on main too. History has split." },
    { cap: "git merge feature joins them with a merge commit that has two parents.", dur: 4000 }] },
};
