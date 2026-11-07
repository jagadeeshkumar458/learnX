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


/* ── 8. Event delegation (Twimba) ───────────────────── */
const DelegationScene = ({ s }) => {
  const liked = s >= 5, likes = liked ? 5 : 4;
  const layer = (x, y, w, h, label, hot) => (
    <g><Box x={x} y={y} w={w} h={h} c={hot ? C.cy : C.line} glow={hot} fill="transparent" dash={hot ? undefined : "4 4"} /><T x={x + 10} y={y + 15} c={hot ? C.cy : C.dim} size={11} mono anchor="start">{label}</T></g>
  );
  // bubbling path for step 2: heart → tweet → feed → document
  const hops = [[248, 196], [248, 150], [248, 92], [248, 44]];
  return (
    <>
      {layer(20, 26, 380, 290, "document", s === 0 || s === 3 || s === 6)}
      {layer(44, 74, 332, 226, "#feed", s === 2)}
      <G o={1}>
        {[0, 1].map((k) => (
          <g key={k}>
            <Box x={64} y={98 + k * 100} w={292} h={84} c={k === 1 && s === 2 ? C.pk : C.line} />
            <T x={80} y={122 + k * 100} c={C.ink} size={12.5} anchor="start" w={700}>{k ? "@ByteSized" : "@ShipyardDev"}</T>
            <T x={80} y={142 + k * 100} c={C.dim} size={11.5} anchor="start">{k ? "One listener to rule them all." : "Data first, then render."}</T>
            <T x={80} y={170 + k * 100} c={C.dim} size={12} anchor="start" mono>💬 1   🔁 3</T>
            <g className={k === 1 && s === 1 ? "ex-pulse" : ""}>
              <T x={250} y={170 + k * 100} c={k === 1 && liked ? C.pk : C.dim} size={13} anchor="start" mono w={700}>{k === 1 ? (liked ? "❤️ " + likes : "🤍 " + likes) : "🤍 12"}</T>
            </g>
          </g>
        ))}
        <G o={s >= 6 ? 1 : 0}><Box x={64} y={302} w={292} h={0} c={C.gr} /></G>
      </G>
      {/* the listener badge */}
      <G x={300} y={44}><Pill text="click listener" c={s === 3 ? C.or : C.cy} w={104} /></G>
      {/* bubbling event */}
      {s === 2 && <Travel key="bub" from={hops[0]} to={hops[3]} dur={2.2} delay={0.3}><Pill text="click ↑" c={C.ye} w={64} /></Travel>}
      {s === 2 && <G o={1}><T x={212} y={330} c={C.ye} hand size={15}>bubbles up: icon → tweet → #feed → document</T></G>}
      {/* right panel: code + data */}
      <G o={s >= 3 ? 1 : 0.15}>
        <Code x={414} y={28} w={214} hl={s === 3 ? 1 : s === 4 ? 2 : s === 5 ? 3 : -1} lines={["document.onclick = e =>", "  e.target.dataset.like", "  → handleLikeClick(id)", "  → render()"]} />
      </G>
      <G o={s >= 4 ? 1 : 0.15}>
        <T x={520} y={160} c={C.dim} size={11} mono>tweetsData["t2"]</T>
        <Box x={430} y={168} w={182} h={86} c={s === 4 ? C.or : C.line} glow={s === 4} fill="#0b0e1a" />
        <T x={444} y={194} c={C.dim} size={12} mono anchor="start">likes:</T>
        <G key={"l" + likes} className="ex-pop"><T x={540} y={194} c={s >= 4 ? C.or : C.ink} size={14} mono anchor="start" w={700}>{s >= 4 ? 5 : 4}</T></G>
        <T x={444} y={222} c={C.dim} size={12} mono anchor="start">isLiked:</T>
        <T x={540} y={222} c={s >= 4 ? C.gr : C.red} size={14} mono anchor="start" w={700}>{s >= 4 ? "true" : "false"}</T>
        <T x={444} y={244} c={C.dim} size={10.5} mono anchor="start">uuid: "t2"</T>
      </G>
      <G o={s === 3 ? 1 : 0}><T x={520} y={290} c={C.ye} hand size={17}>dataset.like = "t2"</T></G>
      <G o={s === 6 ? 1 : 0}><T x={520} y={290} c={C.gr} hand size={16}>new tweets work too</T><T x={520} y={310} c={C.gr} hand size={16}>no new listeners</T></G>
    </>
  );
};

/* ── 9. reduce ─────────────────────────────────────── */
const ReduceScene = ({ s }) => {
  const items = [["🍕", 12], ["🍔", 8], ["🍺", 5]];
  const acc = [null, 0, 12, 20, 25, 25][Math.min(s, 5)];
  const cur = s >= 2 && s <= 4 ? s - 2 : -1;
  return (
    <>
      <Code x={20} y={22} w={600} hl={s === 0 ? 0 : s >= 1 && s <= 4 ? (s === 1 ? 0 : 0) : -1} lines={["const total = prices.reduce((acc, price) => acc + price, 0)"]} />
      {items.map(([e, p], k) => (
        <g key={k}>
          <rect x={60 + k * 110} y={90} width={92} height={92} rx={12} fill={k === cur ? "#2a2140" : C.panel} stroke={k === cur ? C.or : k < cur || s >= 5 ? C.gr : C.line} strokeWidth={k === cur ? 2.5 : 1.5} />
          <T x={106 + k * 110} y={134} size={30}>{e}</T>
          <T x={106 + k * 110} y={166} c={k === cur ? C.or : C.ink} size={15} mono w={700}>{p}</T>
          <T x={106 + k * 110} y={200} c={C.dim} size={11} mono>price</T>
        </g>
      ))}
      {/* accumulator */}
      <G o={s >= 1 && s <= 5 ? 1 : 0}>
        <T x={520} y={92} c={C.dim} size={12} mono>acc</T>
        <G key={"a" + acc} className="ex-pop"><rect x={470} y={100} width={100} height={70} rx={12} fill={C.panel} stroke={C.gr} strokeWidth="2.5" /><T x={520} y={146} c={C.gr} size={28} mono w={800}>{acc ?? ""}</T></G>
      </G>
      {cur >= 0 && <Travel key={"t" + s} from={[106 + cur * 110, 136]} to={[520, 196]} dur={1.2} delay={0.4}><Pill text={"+" + items[cur][1]} c={C.or} w={52} /></Travel>}
      <G o={cur >= 0 ? 1 : 0}><T x={320} y={250} c={C.ye} hand size={22}>{cur >= 0 ? `${[0, 12, 20][cur]} + ${items[cur][1]} = ${[12, 20, 25][cur]}` : ""}</T></G>
      <G o={s === 1 ? 1 : 0}><T x={320} y={250} c={C.ye} hand size={20}>starts with the initial value: 0</T></G>
      <G o={s === 5 ? 1 : 0}><T x={320} y={250} c={C.gr} hand size={22}>total = 25</T></G>
      <G o={s === 6 ? 1 : 0}>
        <Box x={150} y={226} w={340} h={92} c={C.cy} fill="#0b0e1a" />
        <T x={320} y={252} c={C.dim} size={11.5} mono>items.reduce((acc, i) =&gt; {"{"} acc[i.cat]++ … {"}"}, {"{}"})</T>
        <T x={320} y={290} c={C.cy} size={18} mono w={700}>{"{ mains: 2, drinks: 1 }"}</T>
      </G>
    </>
  );
};


/* ── 10. The event loop ───────────────────────────────── */
const EventLoopScene = ({ s }) => {
  const out = ["", "1", "1", "1", "1", "1  4", "1  4  3", "1  4  3  2"][s];
  const hl = [-1, 0, 1, 1, 3, 4, 3, 1][s];
  const stack = { 1: "console.log(1)", 2: "setTimeout(…)", 4: "Promise…then(…)", 5: "console.log(4)", 6: "() => log(3)", 7: "() => log(2)" }[s];
  const panel = (x, y, w, h, title, c, hot) => (
    <g><Box x={x} y={y} w={w} h={h} c={hot ? c : C.line} glow={hot} /><T x={x + 10} y={y + 17} c={hot ? c : C.dim} size={11} mono anchor="start" w={700}>{title}</T></g>
  );
  return (
    <>
      <Code x={10} y={24} w={256} hl={hl} lines={["console.log(1)", "setTimeout(() => log(2), 0)", "Promise.resolve()", "  .then(() => log(3))", "console.log(4)"]} />
      {panel(10, 150, 256, 120, "CONSOLE", C.gr, s >= 1 && s !== 2 && s !== 3 && s !== 4)}
      <G key={"o" + s} className="ex-pop"><T x={26} y={205} c={C.gr} size={22} mono anchor="start" w={800}>{out}</T></G>
      {panel(282, 24, 160, 116, "CALL STACK", C.or, !!stack)}
      {stack && <G key={"st" + s} className="ex-pop"><rect x={292} y={92} width={140} height={34} rx={7} fill="#2a2140" stroke={C.or} strokeWidth="2" /><T x={362} y={114} c={C.or} size={11} mono>{stack}</T></G>}
      {panel(456, 24, 172, 116, "WEB APIs (browser)", C.cy, s === 2)}
      <G o={s === 2 ? 1 : 0}><rect x={466} y={60} width={152} height={34} rx={7} fill={C.panel} stroke={C.cy} strokeWidth="2" /><T x={542} y={82} c={C.cy} size={11} mono>⏱ timer 0ms</T></G>
      {panel(282, 156, 346, 52, "MICROTASK QUEUE  (promises)", C.pk, s === 4 || s === 6)}
      <G o={s >= 4 && s < 6 ? 1 : 0}><rect x={478} y={166} width={130} height={32} rx={7} fill={C.panel} stroke={C.pk} strokeWidth="2" /><T x={543} y={187} c={C.pk} size={11} mono>() =&gt; log(3)</T></G>
      {panel(282, 222, 346, 52, "TASK QUEUE  (timers, events)", C.ye, s === 3 || s === 7)}
      <G o={s >= 3 && s < 7 ? 1 : 0}><rect x={478} y={232} width={130} height={32} rx={7} fill={C.panel} stroke={C.ye} strokeWidth="2" /><T x={543} y={253} c={C.ye} size={11} mono>() =&gt; log(2)</T></G>
      {s === 3 && <Travel key="t3" from={[542, 77]} to={[543, 248]} dur={1.3} delay={0.3}><Pill text="log(2)" c={C.ye} w={70} /></Travel>}
      {s === 6 && <Travel key="t6" from={[543, 182]} to={[362, 109]} dur={1.2} delay={0.2}><Pill text="log(3)" c={C.pk} w={70} /></Travel>}
      {s === 7 && <Travel key="t7" from={[543, 248]} to={[362, 109]} dur={1.2} delay={0.2}><Pill text="log(2)" c={C.ye} w={70} /></Travel>}
      <G o={s >= 5 ? 1 : 0.25}><T x={455} y={304} c={s >= 5 ? C.bl : C.dim} hand size={17}>⟳ event loop: microtasks first, then the next task</T></G>
    </>
  );
};


/* ── 11. JSX → element → DOM ─────────────────────────── */
const JsxScene = ({ s }) => {
  const upd = s >= 4;
  const word = upd ? "Hello again" : "Hello";
  const stage = (y, h, n, label, on, lines, hot) => (
    <g opacity={on ? 1 : 0.28} style={{ transition: "opacity .5s" }}>
      <T x={16} y={y - 6} c={hot ? C.or : C.dim} size={11} mono anchor="start" w={700}>{n + "  " + label}</T>
      <Box x={16} y={y} w={392} h={h} c={hot ? C.or : C.line} glow={hot} fill="#0b0e1a" />
      {lines.map((l, i) => <text key={i + l} x={30} y={y + 22 + i * 19} fontFamily="var(--f-mono)" fontSize="11.5" fill={hot ? C.ink : C.dim} style={{ whiteSpace: "pre" }}>{l}</text>)}
    </g>
  );
  return (
    <>
      {stage(24, 34, "1", "JSX you write", true, ['<h1 className="header">' + word + "</h1>"], s === 0 || s === 4)}
      {stage(90, 52, "2", "after the compiler (Vite / Babel)", s >= 1, ['jsx("h1", {', '  className: "header", children: "' + word + '" })'], s === 1)}
      {stage(172, 72, "3", "a React element: just an object", s >= 2, ['{ type: "h1",', '  props: { className: "header",', '           children: "' + word + '" } }'], s === 2 || s === 5)}
      <Arrow x1={370} y1={58} x2={370} y2={88} o={s >= 1 ? 1 : 0.25} />
      <Arrow x1={370} y1={142} x2={370} y2={170} o={s >= 2 ? 1 : 0.25} />
      <Arrow x1={410} y1={208} x2={440} y2={170} o={s >= 3 ? 1 : 0.25} />
      <G o={s >= 3 ? 1 : 0.28}>
        <T x={534} y={18} c={s === 3 || s === 5 ? C.cy : C.dim} size={11} mono w={700}>4  real DOM</T>
        <Box x={444} y={24} w={180} h={220} c={s === 3 || s === 5 ? C.cy : C.line} glow={s === 3 || s === 5} fill="#f6f7fb" />
        <circle cx={460} cy={38} r={4} fill="#ff6b6b" /><circle cx={474} cy={38} r={4} fill="#ffd166" /><circle cx={488} cy={38} r={4} fill="#5eead4" />
        {s >= 3 && <G key={"dom" + upd} className="ex-pop"><T x={534} y={124} c="#087ea4" size={22} w={800}>{word}</T></G>}
        <T x={534} y={170} c="#6b759a" size={10.5} mono>{'<h1 class="header">'}</T>
      </G>
      {s === 1 && <Travel key="c1" from={[300, 42]} to={[300, 118]}><Pill text="compile" c={C.or} w={74} /></Travel>}
      {s === 2 && <Travel key="c2" from={[300, 118]} to={[300, 210]}><Pill text="call" c={C.or} w={52} /></Travel>}
      {s === 3 && <Travel key="c3" from={[300, 210]} to={[534, 70]}><Pill text="react-dom" c={C.cy} w={84} /></Travel>}
      <G o={s === 4 || s === 5 ? 1 : 0}><T x={320} y={278} c={C.ye} hand size={20}>{s === 4 ? "new data? describe the page again…" : "…React compares the objects and only updates the changed text"}</T></G>
      <G o={s === 6 ? 1 : 0}><T x={320} y={276} c={C.gr} hand size={21}>JSX → function call → object → DOM</T></G>
      <G o={s === 6 ? 1 : 0}><T x={320} y={302} c={C.dim} size={12}>&lt;Header /&gt; becomes jsx(Header), and React calls Header() to get its elements.</T></G>
    </>
  );
};

/* ── 12. State change → re-render → commit ───────────── */
const ReactRenderScene = ({ s }) => {
  const count = s >= 3 ? 1 : 0;
  const shown = s >= 6 ? 1 : 0;
  const hl = [1, 3, 2, 2, 1, 4, -1][s];
  return (
    <>
      <Code x={10} y={20} w={330} hl={hl} lines={["function Counter() {", "  const [count, setCount] = useState(0)", "  const add = () => setCount(c => c + 1)", "  return <button onClick={add}>", "    Clicks: {count}</button>", "}"]} />
      <T x={175} y={166} c={C.dim} size={11} mono>{s >= 4 ? "render #2: React calls Counter() again" : "render #1: React calls Counter()"}</T>
      <G>
        <T x={430} y={30} c={C.dim} size={11} mono w={700}>REACT'S MEMORY</T>
        <Box x={360} y={38} w={140} h={74} c={s === 3 ? C.or : C.line} glow={s === 3} />
        <Var x={430} y={58} name="" value={count} hot={s === 3} />
      </G>
      <G>
        <T x={566} y={30} c={C.dim} size={11} mono w={700}>DOM</T>
        <Box x={514} y={38} w={116} h={74} c={s === 6 ? C.cy : C.line} glow={s === 6} fill="#f6f7fb" />
        <G o={s >= 1 ? 1 : 0}><rect x={526} y={60} width={92} height={30} rx={7} fill={s === 2 ? "#ffd8bf" : "#ffffff"} stroke="#c9cfdf" /><G key={"b" + shown} className="ex-pop"><T x={572} y={80} c="#141a2e" size={12} w={700}>Clicks: {shown}</T></G></G>
      </G>
      {s === 2 && <Travel key="t2" from={[572, 76]} to={[430, 128]}><Pill text="setCount" c={C.or} w={80} /></Travel>}
      {/* virtual trees */}
      <G o={s >= 4 ? 1 : 0.2}>
        <T x={175} y={192} c={C.dim} size={11} mono w={700}>PREVIOUS RENDER</T>
        <Box x={40} y={200} w={270} h={42} c={C.line} />
        <T x={175} y={226} c={C.dim} size={12.5} mono>{"<button>Clicks: 0</button>"}</T>
        <T x={485} y={192} c={C.dim} size={11} mono w={700}>NEW RENDER</T>
        <Box x={350} y={200} w={270} h={42} c={s === 5 ? C.ye : C.line} glow={s === 5} />
        <T x={485} y={226} c={C.ink} size={12.5} mono>{"<button>Clicks: "}<tspan fill={s >= 5 ? C.ye : C.ink}>1</tspan>{"</button>"}</T>
      </G>
      <G o={s === 5 ? 1 : 0}><T x={330} y={227} c={C.ye} size={16} w={800}>≠</T></G>
      {s === 6 && <Travel key="t6" from={[485, 221]} to={[572, 124]}><Pill text="commit" c={C.cy} w={64} /></Travel>}
      <G o={s === 3 ? 1 : 0}><T x={320} y={282} c={C.ye} hand size={19}>setCount doesn't change count right now. It asks React for a new render.</T></G>
      <G o={s === 5 ? 1 : 0}><T x={320} y={282} c={C.ye} hand size={20}>only the text inside the button is different</T></G>
      <G o={s === 6 ? 1 : 0}><T x={320} y={282} c={C.gr} hand size={20}>render = calling your function · commit = touching the DOM</T></G>
      <G o={s === 0 || s === 1 ? 1 : 0}><T x={320} y={282} c={C.dim} hand size={19}>{s === 0 ? "useState(0) gives back the current value and a setter" : "the JSX it returns is turned into DOM"}</T></G>
    </>
  );
};

/* ── 13. useEffect lifecycle ─────────────────────────── */
const EffectScene = ({ s }) => {
  const hl = [[0, 1, 7], [7], [2, 3, 4], [3], [5], [4], []][s];
  const width = s >= 3 ? 900 : 1280;
  const listeners = s >= 5 ? 2 : s >= 2 && s < 4 ? 1 : 0;
  const mounted = s !== 4;
  const phases = ["render", "commit", "effect", "re-render", "cleanup"];
  const ph = [0, 1, 2, 3, 4, 2, -1][s];
  return (
    <>
      <Code x={8} y={14} w={398} lines={["const [width, setWidth] = useState(innerWidth)", "", "useEffect(() => {", "  function onResize() { setWidth(innerWidth) }", "  addEventListener(\"resize\", onResize)", "  return () => removeEventListener(\"resize\", onResize)", "}, [])", "return <h1>Window width: {width}</h1>"].map((l, i) => l)} hl={hl.length === 1 ? hl[0] : hl.length ? hl[0] : -1} />
      {hl.length > 1 && hl.slice(1).map((n) => <rect key={n} x={12} y={20 + n * 21} width={390} height={21} rx={4} fill={C.or} opacity=".16" />)}
      {phases.map((p, i) => (
        <g key={p}>
          <rect x={20 + i * 122} y={212} width={108} height={30} rx={15} fill={ph === i ? (i === 4 ? C.pk : C.or) : C.panel} stroke={ph === i ? "none" : C.line} style={{ transition: "fill .4s" }} />
          <T x={74 + i * 122} y={232} c={ph === i ? "#0d1020" : C.dim} size={11.5} mono w={700}>{p}</T>
        </g>
      ))}
      <G>
        <T x={522} y={22} c={C.dim} size={11} mono w={700}>THE PAGE</T>
        <Box x={414} y={30} w={218} h={74} c={s === 1 || s === 3 ? C.cy : C.line} glow={s === 1 || s === 3} fill="#f6f7fb" />
        <G o={mounted && s >= 1 ? 1 : 0}><G key={"w" + width} className="ex-pop"><T x={523} y={74} c="#141a2e" size={15} w={800}>Window width: {width}</T></G></G>
        <G o={mounted ? 0 : 1}><T x={523} y={74} c="#6b759a" size={13}>(component removed)</T></G>
      </G>
      <G>
        <T x={522} y={128} c={C.dim} size={11} mono w={700}>WINDOW LISTENERS</T>
        <Box x={414} y={136} w={218} h={58} c={listeners > 1 ? C.red : listeners ? C.gr : C.line} glow={listeners > 1} />
        {[...Array(listeners)].map((_, i) => <G key={i + "l" + s} className="ex-pop"><rect x={424 + i * 102} y={150} width={94} height={30} rx={7} fill={C.panel} stroke={i ? C.red : C.gr} strokeWidth="2" /><T x={471 + i * 102} y={170} c={i ? C.red : C.gr} size={11} mono>resize ✓</T></G>)}
        {!listeners && <T x={523} y={170} c={C.dim} size={12} mono>none</T>}
      </G>
      <G o={s === 0 ? 1 : 0}><T x={320} y={282} c={C.ye} hand size={19}>during render the effect is only registered, not run</T></G>
      <G o={s === 2 ? 1 : 0}><T x={320} y={282} c={C.ye} hand size={19}>after the DOM is updated, React runs the effect</T></G>
      <G o={s === 3 ? 1 : 0}><T x={320} y={282} c={C.ye} hand size={19}>deps [] haven't changed, so the effect doesn't run again</T></G>
      <G o={s === 4 ? 1 : 0}><T x={320} y={282} c={C.pk} hand size={19}>unmount → React calls your cleanup function</T></G>
      <G o={s === 5 ? 1 : 0}><T x={320} y={282} c={C.red} hand size={19}>forget the cleanup and every mount adds another listener</T></G>
      <G o={s === 6 ? 1 : 0}>
        <T x={320} y={272} c={C.ink} size={13} mono>no array → after every render</T>
        <T x={320} y={294} c={C.ink} size={13} mono>[] → once, after the first render</T>
        <T x={320} y={316} c={C.ink} size={13} mono>[a, b] → whenever a or b changed</T>
      </G>
    </>
  );
};

/* ── 14. Node request → handler → response ───────────── */
const NodeServerScene = ({ s }) => {
  const codeHl = [-1, 0, 2, 3, 4, 5, -1, -1][s];
  return (
    <>
      <G>
        <T x={78} y={24} c={C.dim} size={11} mono w={700}>BROWSER / CLIENT</T>
        <Box x={14} y={32} w={128} h={92} c={s === 0 || s === 6 ? C.cy : C.line} glow={s === 0 || s === 6} fill="#f6f7fb" />
        <T x={78} y={62} c="#141a2e" size={11.5} mono w={700}>{s >= 6 ? "200 OK" : "fetch()"}</T>
        <T x={78} y={84} c="#6b759a" size={10.5} mono>{s >= 6 ? "[ {…}, {…} ]" : "GET /api/continent"}</T>
        <T x={78} y={102} c="#6b759a" size={10.5} mono>{s >= 6 ? "application/json" : "/asia"}</T>
      </G>
      <G>
        <T x={440} y={24} c={C.dim} size={11} mono w={700}>NODE · localhost:8000</T>
        <Box x={196} y={32} w={436} h={200} c={s >= 1 && s <= 5 ? C.or : C.line} glow={s >= 1 && s <= 5} />
      </G>
      <Code x={204} y={40} w={420} hl={codeHl} lines={[
        "http.createServer(async (req, res) => {",
        "  // req.method \"GET\", req.url \"/api/continent/asia\"",
        "  if (req.url.startsWith(\"/api/continent/\")) {",
        "    const data = await getDataFromDB()",
        "    res.setHeader(\"Content-Type\", \"application/json\")",
        "    res.end(JSON.stringify(filtered))",
        "  }",
        "})"]} />
      {s === 0 && <Travel key="n0" from={[142, 78]} to={[170, 150]}><Pill text="GET /api/…" c={C.cy} w={92} /></Travel>}
      {s === 3 && (
        <G>
          <Box x={470} y={240} w={162} h={40} c={C.gr} glow />
          <T x={551} y={265} c={C.gr} size={11.5} mono>database / file</T>
          <Travel key="n3" from={[551, 140]} to={[551, 240]}><Pill text="await" c={C.gr} w={58} /></Travel>
        </G>
      )}
      {s === 5 && <Travel key="n5" from={[300, 160]} to={[100, 120]}><Pill text="res.end()" c={C.or} w={80} /></Travel>}
      <G o={s === 1 ? 1 : 0}><T x={320} y={304} c={C.ye} hand size={19}>Node calls your handler once for every request</T></G>
      <G o={s === 2 ? 1 : 0}><T x={320} y={304} c={C.ye} hand size={19}>routing: read req.method and req.url, pick a branch</T></G>
      <G o={s === 3 ? 1 : 0}><T x={300} y={304} c={C.ye} hand size={18}>while it waits, the event loop serves other requests</T></G>
      <G o={s === 4 ? 1 : 0}><T x={320} y={304} c={C.ye} hand size={19}>status and headers describe the body</T></G>
      <G o={s === 6 ? 1 : 0}><T x={320} y={304} c={C.gr} hand size={19}>one request in, exactly one response out</T></G>
      <G o={s === 7 ? 1 : 0}><T x={320} y={304} c={C.red} hand size={19}>forget res.end() and the client waits until it times out</T></G>
    </>
  );
};

/* ── 15. SQL logical order ───────────────────────────── */
const SQL_ROWS = [["Turbo Kart", "Racing", 49.99], ["Neon Drift", "Racing", 39.99], ["Retro Racer", "Racing", 9.99], ["Pixel Farm", "Simulation", 24.99], ["Dungeon Bakers", "Simulation", 19.99], ["Kingdom of Ash", "RPG", 69.99], ["Puzzle Garden", "Puzzle", 4.99]];
const GENRE_C = { Racing: "#ff9f6b", Simulation: "#5eead4", Puzzle: "#c4a7ff", RPG: "#ffd166" };
const SqlOrderScene = ({ s }) => {
  const stages = ["FROM", "WHERE", "GROUP BY", "HAVING", "SELECT", "ORDER BY", "LIMIT"];
  const lineOf = [1, 2, 3, 4, 0, 5, 6];
  const st = s - 1;
  const hl = st >= 0 ? lineOf[st] : -1;
  const groups = [["Racing", 3], ["Simulation", 2], ["Puzzle", 1]];
  return (
    <>
      <Code x={8} y={16} w={300} hl={hl} lines={["SELECT genre, COUNT(*) AS n", "FROM games", "WHERE price < 50", "GROUP BY genre", "HAVING COUNT(*) > 1", "ORDER BY n DESC", "LIMIT 1;"]} />
      {stages.map((name, i) => (
        <g key={name}>
          <rect x={8 + i * 89} y={276} width={83} height={26} rx={13} fill={st === i ? C.or : st > i ? C.panel : "transparent"} stroke={st === i ? "none" : C.line} style={{ transition: "fill .4s" }} />
          <T x={49 + i * 89} y={293} c={st === i ? "#0d1020" : st > i ? C.ink : C.dim} size={10.5} mono w={700}>{(i + 1) + " " + name}</T>
        </g>
      ))}
      {st < 2 && SQL_ROWS.map((r, i) => {
        const gone = st === 1 && r[2] >= 50;
        return (
          <g key={r[0]} opacity={gone ? 0.3 : 1} style={{ transition: "opacity .5s" }}>
            <rect x={330} y={18 + i * 33} width={300} height={27} rx={7} fill={C.panel} stroke={gone ? C.red : C.line} />
            <T x={344} y={36 + i * 33} c={C.ink} size={11.5} mono anchor="start">{r[0]}</T>
            <T x={540} y={36 + i * 33} c={GENRE_C[r[1]]} size={11} mono>{r[1]}</T>
            <T x={612} y={36 + i * 33} c={gone ? C.red : C.dim} size={11} mono anchor="end">{r[2].toFixed(2)}</T>
            {gone && <line x1={340} y1={31 + i * 33} x2={620} y2={31 + i * 33} stroke={C.red} strokeWidth="2" />}
          </g>
        );
      })}
      {(st === 2 || st === 3) && groups.map(([g, n], gi) => {
        const y = [18, 128, 210][gi];
        const gone = st === 3 && n < 2;
        return (
          <G key={g} className="ex-pop" o={gone ? 0.3 : 1}>
            <rect x={330} y={y} width={300} height={n * 26 + 22} rx={9} fill="none" stroke={gone ? C.red : GENRE_C[g]} strokeWidth="2" strokeDasharray={gone ? "5 4" : ""} />
            <T x={344} y={y + 15} c={GENRE_C[g]} size={10.5} mono anchor="start" w={700}>{g + " · " + n + " row" + (n > 1 ? "s" : "")}</T>
            {SQL_ROWS.filter((r) => r[1] === g && r[2] < 50).map((r, i) => <T key={r[0]} x={356} y={y + 36 + i * 26} c={C.ink} size={11} mono anchor="start">{r[0]}</T>)}
          </G>
        );
      })}
      {st >= 4 && (
        <G className="ex-pop">
          <rect x={360} y={40} width={240} height={30} rx={7} fill={C.panel} stroke={C.line} />
          <T x={430} y={60} c={C.dim} size={11.5} mono w={700}>genre</T><T x={545} y={60} c={C.dim} size={11.5} mono w={700}>n</T>
          {[["Racing", 3], ["Simulation", 2]].map(([g, n], i) => {
            const cut = st >= 6 && i > 0;
            return (
              <g key={g} opacity={cut ? 0.25 : 1} style={{ transition: "opacity .5s" }}>
                <rect x={360} y={76 + i * 34} width={240} height={30} rx={7} fill={C.panel} stroke={st === 5 ? C.or : cut ? C.red : GENRE_C[g]} />
                <T x={430} y={96 + i * 34} c={GENRE_C[g]} size={12} mono>{g}</T><T x={545} y={96 + i * 34} c={C.ink} size={12} mono w={700}>{n}</T>
              </g>
            );
          })}
        </G>
      )}
      <G o={s === 0 ? 1 : 0}><T x={156} y={218} c={C.ye} hand size={17}>you write SELECT first…</T></G>
      <G o={s === 0 ? 1 : 0}><T x={156} y={246} c={C.ye} hand size={17}>…but it runs in this order ↓</T></G>
      <G o={st === 4 ? 1 : 0}><T x={320} y={252} c={C.ye} hand size={18}>SELECT runs late: WHERE can't use its aliases</T></G>
      <G o={st === 5 ? 1 : 0}><T x={320} y={252} c={C.ye} hand size={18}>ORDER BY runs after SELECT, so it can use n</T></G>
      <G o={st === 6 ? 1 : 0}><T x={480} y={200} c={C.gr} hand size={19}>LIMIT 1 keeps just the top row</T></G>
    </>
  );
};

/* ── 16. How a JOIN matches rows ─────────────────────── */
const JC = [[1, "Priya"], [2, "Lucas"], [3, "Sofia"]];
const JO = [[101, 1], [102, 2], [103, 1]];
const SqlJoinScene = ({ s }) => {
  const cur = s >= 1 && s <= 3 ? s - 1 : -1;
  const out = [];
  const upto = s >= 4 ? 3 : cur + 1;
  JC.slice(0, upto).forEach(([id, name]) => {
    const m = JO.filter((o) => o[1] === id);
    m.forEach((o) => out.push([name, o[0], false]));
    if (!m.length && s >= 4) out.push([name, "NULL", true]);
  });
  const row = (x, y, w, cells, hot, dim, key) => (
    <g key={key} opacity={dim ? 0.35 : 1} style={{ transition: "opacity .4s" }}>
      <rect x={x} y={y} width={w} height={26} rx={6} fill={C.panel} stroke={hot ? C.or : C.line} strokeWidth={hot ? 2 : 1} />
      {cells.map((c, i) => <T key={i} x={x + (w / cells.length) * (i + 0.5)} y={y + 17} c={c === "NULL" ? C.dim : C.ink} size={11.5} mono>{String(c)}</T>)}
    </g>
  );
  return (
    <>
      <T x={110} y={20} c={C.dim} size={11} mono w={700}>customers (id, name)</T>
      {JC.map((c, i) => row(30, 30 + i * 32, 160, c, cur === i, s === 3 && i === 2, "c" + i))}
      <T x={320} y={20} c={C.dim} size={11} mono w={700}>orders (id, customer_id)</T>
      {JO.map((o, i) => row(240, 30 + i * 32, 160, o, cur >= 0 && o[1] === JC[cur][0], false, "o" + i))}
      {cur >= 0 && JO.map((o, i) => o[1] === JC[cur][0] && <line key={"l" + i} x1={190} y1={43 + cur * 32} x2={240} y2={43 + i * 32} stroke={C.or} strokeWidth="2" className="ex-pop" />)}
      <T x={530} y={20} c={C.dim} size={11} mono w={700}>{s >= 4 ? "LEFT JOIN result" : "INNER JOIN result"}</T>
      {out.map((r, i) => row(440, 30 + i * 32, 180, r.slice(0, 2), r[2], false, "r" + i + r[0] + r[1]))}
      <G o={s === 0 ? 1 : 0}><T x={320} y={200} c={C.ye} hand size={19}>ON orders.customer_id = customers.id</T></G>
      <G o={s === 3 ? 1 : 0}><T x={320} y={200} c={C.red} hand size={19}>Sofia has no orders, so an INNER JOIN drops her</T></G>
      <G o={s === 4 ? 1 : 0}><T x={320} y={226} c={C.gr} hand size={19}>LEFT JOIN keeps every customer, with NULLs</T></G>
      <G o={s === 5 ? 1 : 0}><T x={320} y={226} c={C.ye} hand size={18}>…so WHERE orders.id IS NULL finds customers with no orders</T></G>
      <T x={320} y={300} c={C.dim} size={12} mono>SELECT c.name, o.id FROM customers c {s >= 4 ? "LEFT " : ""}JOIN orders o ON o.customer_id = c.id</T>
    </>
  );
};

/* ── 17. Express middleware chain ────────────────────── */
const ExpressMwScene = ({ s }) => {
  const chain = [["logger", "logs, next()"], ["express.json()", "req.body = {…}"], ["express.static()", "file? send it"], ["productsRouter", "res.json(rows)"], ["404 handler", "res.status(404)"]];
  const req = [{ u: "GET /index.css", stop: 2 }, { u: "POST /api/products", stop: 3 }, { u: "GET /api/nope", stop: 4 }][s < 3 ? 0 : s < 5 ? 1 : 2];
  const pos = [1, 2, 2, 1, 3, 4, 4][s];
  return (
    <>
      {chain.map(([name, does], i) => {
        const x = 20 + i * 122, on = i <= pos, hit = i === pos;
        return (
          <g key={name}>
            <rect x={x} y={70} width={112} height={92} rx={12} fill={hit ? "#2a2240" : C.panel} stroke={hit ? C.or : on ? C.cy : C.line} strokeWidth={hit ? 2.5 : 1.5} style={{ transition: "all .4s" }} />
            <T x={x + 56} y={100} c={hit ? C.or : C.ink} size={10.5} mono w={700}>{name.length > 18 ? name.slice(0, 17) + "…" : name}</T>
            <T x={x + 56} y={132} c={C.dim} size={10} mono>{does}</T>
            {i < chain.length - 1 && <Arrow x1={x + 112} y1={116} x2={x + 122} y2={116} o={on && i < pos ? 1 : 0.3} />}
          </g>
        );
      })}
      <G key={req.u + pos} className="ex-pop">
        <g transform={`translate(${76 + pos * 122},44)`}><Pill text={req.u} c={C.cy} w={140} /></g>
      </G>
      <T x={320} y={200} c={C.dim} size={12} mono>{s < 3 ? "request: GET /index.css" : s < 5 ? "request: POST /api/products" : "request: GET /api/nope"}</T>
      <G o={s === 0 ? 1 : 0}><T x={320} y={240} c={C.ye} hand size={19}>every request walks the chain, in the order you called app.use</T></G>
      <G o={s === 1 ? 1 : 0}><T x={320} y={240} c={C.ye} hand size={19}>no JSON body here, so express.json() just calls next()</T></G>
      <G o={s === 2 ? 1 : 0}><T x={320} y={240} c={C.gr} hand size={19}>public/index.css exists: static sends it, and the chain stops</T></G>
      <G o={s === 3 ? 1 : 0}><T x={320} y={240} c={C.ye} hand size={19}>logger runs for every request</T></G>
      <G o={s === 4 ? 1 : 0}><T x={320} y={240} c={C.gr} hand size={19}>json parsed the body, static found no file, the router answers</T></G>
      <G o={s === 5 ? 1 : 0}><T x={320} y={240} c={C.ye} hand size={19}>nothing matched, so the request reaches the end…</T></G>
      <G o={s === 6 ? 1 : 0}><T x={320} y={240} c={C.red} hand size={19}>…where the 404 middleware answers. Order matters!</T></G>
    </>
  );
};


/* ── 19. An LLM request, token by token ──────────────── */
const LlmScene = ({ s }) => {
  const prompt = [["system", "You are the Gift Genie…"], ["user", "Gift for a dad who cooks"]];
  const toks = ["A", " cast", "-iron", " skillet", ":", " it", " lasts", "…"];
  const shown = [0, 0, 0, 2, 5, 8, 8][s];
  const cand = [["cast", 0.62], ["chef's", 0.21], ["cookbook", 0.11], ["banana", 0.001]];
  return (
    <>
      <T x={90} y={28} c={C.dim} size={11} mono w={700}>BROWSER</T>
      <T x={300} y={28} c={C.dim} size={11} mono w={700}>YOUR SERVER</T>
      <T x={530} y={28} c={C.dim} size={11} mono w={700}>MODEL API</T>
      <rect x={30} y={40} width={120} height={70} rx={10} fill={C.panel} stroke={s === 0 ? C.or : C.line} strokeWidth="2" />
      <T x={90} y={70} size={11} mono>"dad who cooks"</T><T x={90} y={92} size={10} c={C.dim} mono>POST /api/gift</T>
      <rect x={230} y={40} width={140} height={70} rx={10} fill={C.panel} stroke={s === 1 ? C.or : C.line} strokeWidth="2" />
      <T x={300} y={66} size={11} mono>🔑 API key lives here</T><T x={300} y={88} size={10} c={C.dim} mono>builds messages[]</T>
      <rect x={450} y={40} width={160} height={70} rx={10} fill={C.panel} stroke={s >= 2 && s <= 4 ? C.or : C.line} strokeWidth="2" />
      <T x={530} y={70} size={11} mono>predicts next token</T><T x={530} y={92} size={10} c={C.dim} mono>again, and again…</T>
      <Arrow x1={150} y1={75} x2={228} y2={75} c={C.cy} o={s >= 1 ? 1 : 0.25} dash="" />
      <Arrow x1={370} y1={75} x2={448} y2={75} c={C.cy} o={s >= 2 ? 1 : 0.25} dash="" />
      <G o={s >= 1 && s <= 2 ? 1 : 0}>
        {prompt.map(([r, c], i) => <g key={r} transform={`translate(${300},${146 + i * 30})`}><Pill text={r + ": " + c} c={i ? C.cy : C.bl} w={260} /></g>)}
      </G>
      <G o={s === 3 ? 1 : 0}>
        <T x={320} y={140} c={C.dim} size={11} mono>after "A", the model scores every possible next token</T>
        {cand.map(([w, p], i) => (<g key={w}><T x={210} y={168 + i * 24} anchor="end" size={11} mono>{w}</T><rect x={220} y={158 + i * 24} width={Math.max(2, p * 300)} height={14} rx={4} fill={i ? C.dim : C.gr} /><T x={230 + Math.max(2, p * 300)} y={169 + i * 24} anchor="start" size={10} c={C.dim} mono>{p}</T></g>))}
      </G>
      <G o={s >= 4 ? 1 : 0}>
        <T x={320} y={150} c={C.dim} size={11} mono>tokens stream back as they're generated</T>
        {toks.slice(0, shown).map((t, i) => <g key={i} className="ex-pop" transform={`translate(${70 + i * 66},${185})`}><Pill text={t} c={C.gr} w={60} /></g>)}
      </G>
      <G o={s === 0 ? 1 : 0}><T x={320} y={290} c={C.ye} hand size={19}>the browser never talks to the model directly</T></G>
      <G o={s === 1 ? 1 : 0}><T x={320} y={290} c={C.ye} hand size={19}>your server adds the secret key and the system prompt</T></G>
      <G o={s === 2 ? 1 : 0}><T x={320} y={290} c={C.ye} hand size={19}>the model reads the whole messages array</T></G>
      <G o={s === 3 ? 1 : 0}><T x={320} y={290} c={C.ye} hand size={19}>temperature decides how adventurous the pick is</T></G>
      <G o={s === 4 ? 1 : 0}><T x={320} y={290} c={C.gr} hand size={19}>one token at a time: that's why streaming feels fast</T></G>
      <G o={s === 5 ? 1 : 0}><T x={320} y={290} c={C.gr} hand size={19}>it stops at an end token, or at max_tokens</T></G>
      <G o={s === 6 ? 1 : 0}><T x={320} y={290} c={C.or} hand size={19}>usage: prompt + completion tokens = what you pay for</T></G>
    </>
  );
};

/* ── 20. The agent loop ─────────────────────────────── */
const AgentScene = ({ s }) => {
  const nodes = [[320, 60, "LLM", "thinks, picks a tool"], [540, 170, "your code", "runs the function"], [320, 270, "messages[]", "result appended"], [100, 170, "user", "asked a question"]];
  const hot = [3, 0, 1, 2, 0, 1, 2, 0][s];
  const label = ["", "tool_call: getLocation()", "→ { city: \"Leeds\" }", "role: tool, content: …", "tool_call: getWeather(\"Leeds\")", "→ { temp: 22, sunny }", "role: tool, content: …", "final answer, no tool_call"][s];
  return (
    <>
      <path d="M 320 90 Q 520 90 530 140 M 540 200 Q 520 260 360 268 M 280 268 Q 120 260 110 200 M 120 140 Q 140 70 280 62" fill="none" stroke={C.line} strokeWidth="2" strokeDasharray="5 6" />
      {nodes.map(([x, y, n, d], i) => (
        <g key={n}>
          <rect x={x - 70} y={y - 26} width={140} height={52} rx={12} fill={i === hot ? "#2a2240" : C.panel} stroke={i === hot ? C.or : C.line} strokeWidth={i === hot ? 2.5 : 1.5} style={{ transition: "all .4s" }} />
          <T x={x} y={y - 4} size={12} mono w={700} c={i === hot ? C.or : C.ink}>{n}</T>
          <T x={x} y={y + 14} size={10} c={C.dim} mono>{d}</T>
        </g>
      ))}
      <G key={s} className="ex-pop"><T x={320} y={172} c={s === 7 ? C.gr : C.cy} size={13} mono w={700}>{label || "\"What should I do today?\""}</T></G>
      <G o={s >= 1 && s <= 6 ? 1 : 0}><T x={320} y={196} c={C.dim} size={11} mono>{"loop " + (s <= 3 ? 1 : 2) + " of max 5"}</T></G>
      <G o={s === 0 ? 1 : 0}><T x={320} y={318} c={C.ye} hand size={18}>the question needs facts the model doesn't have</T></G>
      <G o={s === 1 || s === 4 ? 1 : 0}><T x={320} y={318} c={C.ye} hand size={18}>the model can't run code, it only asks you to</T></G>
      <G o={s === 2 || s === 5 ? 1 : 0}><T x={320} y={318} c={C.gr} hand size={18}>your code calls the real function</T></G>
      <G o={s === 3 || s === 6 ? 1 : 0}><T x={320} y={318} c={C.ye} hand size={18}>the result goes back into the conversation</T></G>
      <G o={s === 7 ? 1 : 0}><T x={320} y={318} c={C.gr} hand size={18}>no more tool calls: break the loop and show the answer</T></G>
    </>
  );
};


/* ── 21. Refactoring a UI, one principle at a time ──── */
const UiScene = ({ s }) => {
  // s: 0 before, 1 white space, 2 alignment, 3 scale, 4 colour, 5 hierarchy, 6 side by side
  const card = (ox, S) => {
    const a = { sp: S >= 1, al: S >= 2, sc: S >= 3, co: S >= 4, hi: S >= 5 };
    const pad = a.sp ? 22 : 8, gap = a.sp ? 14 : 4;
    const x = ox + pad, anchor = a.al ? "start" : "middle", tx = a.al ? x : ox + 110;
    const ink = a.co ? "#1d1b2f" : "#555", sub = a.co ? "#5b5873" : "#888", accent = a.co ? "#6d4aff" : "#3aa63a";
    let y = 40 + pad;
    const els = [];
    els.push(<rect key="bg" x={ox} y={40} width={220} height={230} rx={a.sp ? 16 : 2} fill={a.co ? "#ffffff" : "#e9e9e9"} stroke={a.co ? "#e6e3f5" : "#999"} style={{ transition: "all .5s" }} />);
    els.push(<text key="ey" x={tx} y={y + 8} textAnchor={anchor} fontSize={a.sc ? 10 : 13} fill={accent} fontWeight={a.sc ? 800 : 400} letterSpacing={a.sc ? 1.5 : 0} style={{ transition: "all .5s" }}>{a.sc ? "PRO PLAN" : "Pro plan"}</text>);
    y += 8 + gap + (a.sc ? 22 : 14);
    els.push(<text key="pr" x={tx} y={y} textAnchor={anchor} fontSize={a.sc ? 34 : 14} fill={ink} fontWeight={a.sc ? 800 : 400} style={{ transition: "all .5s" }}>$12/mo</text>);
    y += gap + 16;
    ["Unlimited projects", "Priority support", "Custom domains"].forEach((t, i) => { els.push(<text key={t} x={tx} y={y + i * (a.sp ? 20 : 15)} textAnchor={anchor} fontSize={12} fill={sub}>{(a.co ? "✓ " : "") + t}</text>); });
    y += 3 * (a.sp ? 20 : 15) + gap;
    const bw = a.al ? 176 : 90, bx = a.al ? x : ox + 65;
    els.push(<rect key="b1" x={bx} y={y} width={bw} height={a.hi ? 34 : 24} rx={a.sp ? 10 : 2} fill={a.hi ? accent : "#cfcfcf"} stroke={a.hi ? "none" : "#777"} style={{ transition: "all .5s" }} />);
    els.push(<text key="b1t" x={bx + bw / 2} y={y + (a.hi ? 22 : 16)} textAnchor="middle" fontSize={12} fontWeight={700} fill={a.hi ? "#fff" : "#333"}>Start free trial</text>);
    if (!a.hi) { els.push(<rect key="b2" x={bx} y={y + 30} width={bw} height={24} rx={2} fill="#cfcfcf" stroke="#777" />); els.push(<text key="b2t" x={bx + bw / 2} y={y + 46} textAnchor="middle" fontSize={12} fontWeight={700} fill="#333">Compare plans</text>); }
    else els.push(<text key="b2l" x={bx + bw / 2} y={y + 56} textAnchor="middle" fontSize={11.5} fill={accent} textDecoration="underline">Compare plans</text>);
    return els;
  };
  const tips = ["Everything works, but nothing feels right", "White space: group related things, separate the rest", "Alignment: one strong left edge", "Scale: big for what matters, small for labels", "Colour: one accent, readable greys, enough contrast", "Hierarchy: one primary action, the rest steps back", "Same content. Five small decisions."];
  return (
    <>
      {s < 6 ? <g>{card(210, s)}</g> : <g>{card(80, 0)}{card(340, 5)}<T x={190} y={292} c={C.dim} size={11} mono>before</T><T x={450} y={292} c={C.gr} size={11} mono>after</T></g>}
      <G key={s} className="ex-pop"><T x={320} y={318} c={s === 0 ? C.red : C.ye} hand size={19}>{tips[s]}</T></G>
    </>
  );
};


/* ── 22. A component test, step by step ─────────────── */
const RtlScene = ({ s }) => {
  const code = ["render(<Main />)", "const input = screen.getByLabelText(\"Top Text\")", "await user.clear(input)", "await user.type(input, \"hi\")", "expect(screen.getByText(\"HI\")).toBeInTheDocument()", "const btn = screen.getByRole(\"button\", …)", "await screen.findByRole(\"alert\")"];
  const line = [0, 1, 3, 3, 4, 6, 6, 6][s];
  const caption = s >= 3 ? "HI" : "ONE DOES NOT SIMPLY";
  return (
    <>
      <rect x={14} y={30} width={330} height={250} rx={12} fill={C.panel} stroke={C.line} />
      <T x={30} y={52} anchor="start" c={C.dim} size={10.5} mono w={700}>Main.test.jsx</T>
      {code.map((c, i) => <T key={i} x={30} y={82 + i * 28} anchor="start" size={10} mono c={i === line ? C.or : i < line ? C.ink : C.dim} w={i === line ? 700 : 500}>{(i === line ? "▶ " : "  ") + c}</T>)}
      <rect x={370} y={30} width={256} height={250} rx={12} fill="#f5f5f5" stroke={C.line} />
      <T x={498} y={52} c="#555" size={10.5} mono w={700}>jsdom: a fake browser DOM</T>
      <G o={s >= 0 ? 1 : 0}>
        <T x={390} y={82} anchor="start" c="#4b5563" size={10}>Top Text</T>
        <rect x={390} y={88} width={104} height={22} rx={4} fill="#fff" stroke={s === 1 || s === 2 ? C.or : "#ccc"} strokeWidth={s === 1 || s === 2 ? 2.5 : 1} />
        <T x={396} y={103} anchor="start" c="#111" size={9.5}>{s >= 3 ? "hi" : s === 2 ? "|" : "One does not…"}</T>
        <T x={506} y={82} anchor="start" c="#4b5563" size={10}>Bottom Text</T>
        <rect x={506} y={88} width={104} height={22} rx={4} fill="#fff" stroke="#ccc" />
        <rect x={390} y={120} width={220} height={24} rx={5} fill="#a626d3" opacity={s >= 5 ? 1 : 0.5} />
        <T x={500} y={136} c="#fff" size={10} w={700}>Get a new meme image</T>
        <rect x={390} y={154} width={220} height={110} rx={6} fill="#3b2a1a" />
        <T x={500} y={176} c={s === 4 ? C.gr : "#fff"} size={13} w={900}>{caption}</T>
        <T x={500} y={254} c="#fff" size={12} w={900}>WALK INTO MORDOR</T>
      </G>
      <G o={s >= 5 ? 1 : 0}><rect x={392} y={196} width={216} height={26} rx={5} fill="#fff1f0" stroke="#f04438" /><T x={500} y={213} c="#b42318" size={9.5} w={700}>Couldn't load memes.</T></G>
      <G o={s === 5 ? 1 : 0}><g transform="translate(500,300)"><Pill text="msw: GET /memes → 500" c={C.pk} w={190} /></g></G>
      <G key={s} className="ex-pop">
        <T x={320} y={318} c={s === 7 ? C.gr : C.ye} hand size={17}>{["render() mounts the component into jsdom", "queries find elements the way users do: by label", "user-event types like a person, key by key", "each keystroke → onChange → state → re-render", "assert on what the user would see", "msw answers the fetch with a fake error", "findBy… waits until the alert appears", "✓ pass: the test describes behaviour, not code"][s]}</T>
      </G>
    </>
  );
};

/* ── 18. Session authentication ──────────────────────── */
const SessionAuthScene = ({ s }) => {
  const lane = (x, label) => (<><T x={x} y={22} c={C.dim} size={11} mono w={700}>{label}</T><line x1={x} y1={32} x2={x} y2={300} stroke={C.line} strokeDasharray="4 5" /></>);
  const msgs = [
    { y: 52, from: 90, to: 320, t: "POST /login  {username, password}", c: C.cy },
    { y: 92, from: 320, to: 540, t: "SELECT * FROM users WHERE username = ?", c: C.gr },
    { y: 132, from: 540, to: 320, t: "{ id: 7, password: \"$2b$10$…\" }", c: C.gr },
    { y: 196, from: 320, to: 90, t: "200 OK  Set-Cookie: connect.sid=s:Xq…", c: C.or },
    { y: 240, from: 90, to: 320, t: "GET /api/cart  Cookie: connect.sid=s:Xq…", c: C.cy },
    { y: 280, from: 320, to: 90, t: "200 OK  { items: [ … ] }", c: C.gr },
  ];
  const shown = [1, 3, 4, 4, 5, 6, 6][s];
  return (
    <>
      {lane(90, "BROWSER")}{lane(320, "EXPRESS + SESSION")}{lane(540, "DATABASE")}
      {msgs.slice(0, shown).map((m, i) => (
        <G key={i} className="ex-pop">
          <Arrow x1={m.from} y1={m.y} x2={m.to + (m.to > m.from ? -4 : 4)} y2={m.y} c={m.c} dash="" />
          <T x={(m.from + m.to) / 2} y={m.y - 7} c={m.c} size={10.5} mono>{m.t}</T>
        </G>
      ))}
      {s >= 2 && <G className="ex-pop"><rect x={330} y={144} width={130} height={22} rx={6} fill={C.panel} stroke={C.ye} /><T x={395} y={159} c={C.ye} size={10} mono>bcrypt.compare ✓</T></G>}
      {s >= 3 && <G className="ex-pop"><rect x={330} y={184} width={170} height={24} rx={6} fill={C.panel} stroke={C.or} /><T x={415} y={200} c={C.or} size={10} mono>sessions[Xq…] = {"{ userId: 7 }"}</T></G>}
      <G o={s === 0 ? 1 : 0}><T x={320} y={312} c={C.ye} hand size={18}>the browser sends the username and password once</T></G>
      <G o={s === 2 ? 1 : 0}><T x={320} y={310} c={C.ye} hand size={18}>bcrypt hashes the attempt with the stored salt and compares</T></G>
      <G o={s === 3 ? 1 : 0}><T x={320} y={310} c={C.or} hand size={18}>the cookie holds only a random session id, not the user</T></G>
      <G o={s === 4 ? 1 : 0}><T x={320} y={310} c={C.ye} hand size={18}>the browser attaches the cookie to every later request</T></G>
      <G o={s === 5 ? 1 : 0}><T x={320} y={310} c={C.gr} hand size={18}>express-session loads req.session.userId, requireAuth lets it through</T></G>
      <G o={s === 6 ? 1 : 0}><T x={320} y={310} c={C.red} hand size={18}>logout: req.session.destroy() and the id stops working</T></G>
    </>
  );
};

export const EXPLAINERS = {
  llm: { title: "What happens when you call an LLM", kicker: "AI Engineering", Scene: LlmScene, fx: ["click", "type", "whoosh", "tick", "pop", "pop", "ding"], steps: [
    { cap: "The user types into your app. The browser sends it to your own server, never straight to the model API.", say: "The user types into your app. The browser sends it to your own server, never straight to the model API." },
    { cap: "Your server holds the secret API key and builds the request: a system message and the user's message.", say: "Your server holds the secret API key, and builds the request. A system message, and the user's message." },
    { cap: "The model reads the whole messages array. It has no memory between requests: everything it knows comes from this.", say: "The model reads the whole messages array. It has no memory between requests. Everything it knows, comes from this." },
    { cap: "It scores every possible next token and samples one. Temperature controls how often it picks a less likely token.", say: "It scores every possible next token, and samples one. Temperature controls how often it picks a less likely one." },
    { cap: "Then it repeats, one token at a time. With stream: true each token is sent as soon as it exists.", say: "Then it repeats, one token at a time. With streaming on, each token is sent as soon as it exists." },
    { cap: "Generation stops at an end-of-message token, or when it hits max_tokens, which gives finish_reason \"length\".", say: "Generation stops at an end of message token, or when it hits max tokens." },
    { cap: "The response includes usage: prompt tokens plus completion tokens. That's what you're billed for.", dur: 4200, say: "The response includes usage. Prompt tokens plus completion tokens. That's what you're billed for." }] },
  agent: { title: "The agent loop", kicker: "AI Agents", Scene: AgentScene, fx: ["type", "pop", "whoosh", "tick", "pop", "whoosh", "tick", "success"], steps: [
    { cap: "The user asks for activity ideas. A good answer needs their location and the weather, which the model can't know.", say: "The user asks for activity ideas. A good answer needs their location and the weather, which the model can't know." },
    { cap: "You described your tools to the model. It replies with a tool call instead of text: getLocation().", say: "You described your tools to the model. It replies with a tool call instead of text. Get location." },
    { cap: "Your code runs the real function and gets a result.", say: "Your code runs the real function, and gets a result." },
    { cap: "You append the result to messages as a tool message and call the model again.", say: "You append the result to messages, as a tool message, and call the model again." },
    { cap: "Now it knows the city, so it asks for the weather there.", say: "Now it knows the city, so it asks for the weather there." },
    { cap: "Your code runs getCurrentWeather(\"Leeds\").", say: "Your code runs get current weather, for Leeds." },
    { cap: "The weather goes back into the conversation too.", say: "The weather goes back into the conversation too." },
    { cap: "This time there's no tool call, just an answer. Break the loop. A maximum number of iterations stops runaway agents.", dur: 4600, say: "This time there's no tool call, just an answer. Break the loop. A maximum number of iterations stops runaway agents." }] },
  ui: { title: "Five fixes for a plain card", kicker: "UI Design", Scene: UiScene, fx: ["tick", "whoosh", "tick", "build", "pop", "ding", "success"], steps: [
    { cap: "A pricing card that works, but looks unfinished. Nothing is wrong with the content: the design decisions are.", say: "A pricing card that works, but looks unfinished. Nothing is wrong with the content. The design decisions are." },
    { cap: "White space first: more padding inside, bigger gaps between groups, tighter gaps within them.", say: "White space first. More padding inside, bigger gaps between groups, tighter gaps within them." },
    { cap: "Alignment: left-align everything to one edge. Centred blocks of text are hard to scan.", say: "Alignment. Left align everything to one edge. Centred blocks of text are hard to scan." },
    { cap: "Scale: make the price big and bold, and turn the plan name into a small, spaced-out label.", say: "Scale. Make the price big and bold, and turn the plan name into a small label." },
    { cap: "Colour: a white surface, near-black text, softer grey for details, and one accent colour.", say: "Colour. A white surface, near black text, softer grey for details, and one accent colour." },
    { cap: "Hierarchy: one filled primary button. The secondary action becomes a quiet link.", say: "Hierarchy. One filled primary button. The secondary action becomes a quiet link." },
    { cap: "Before and after. Same content, five small decisions, and it now looks trustworthy.", dur: 4400, say: "Before and after. Same content, five small decisions." }] },
  rtl: { title: "Inside a component test", kicker: "Testing", Scene: RtlScene, fx: ["build", "tick", "type", "type", "ding", "error", "tick", "success"], steps: [
    { cap: "render(<Main />) mounts the component into jsdom, a simulated browser DOM that runs inside the test runner.", say: "Render mounts the component into J S DOM, a simulated browser that runs inside the test runner." },
    { cap: "screen.getByLabelText finds the input the way a user would: by reading its label.", say: "Screen dot get by label text finds the input the way a user would. By reading its label." },
    { cap: "user.clear empties it. user-event fires real focus, input and key events.", say: "User dot clear empties it. User event fires real focus, input and key events." },
    { cap: "user.type types each character. Every keystroke runs onChange, updates state, and React re-renders the meme.", say: "User dot type types each character. Every keystroke runs on change, updates state, and React re-renders the meme." },
    { cap: "Assert on what a user would see: the caption HI is in the document.", say: "Assert on what a user would see. The caption is in the document." },
    { cap: "Another test: msw intercepts the fetch for memes and answers with a 500 error.", say: "Another test. M S W intercepts the fetch for memes, and answers with an error." },
    { cap: "The alert appears after the request fails, so findByRole waits for it, retrying until it shows up or times out.", say: "The alert appears after the request fails, so find by role waits for it." },
    { cap: "Both tests pass. They describe behaviour, so refactoring Main won't break them, but real bugs will.", dur: 4400, say: "Both tests pass. They describe behaviour, so refactoring won't break them. But real bugs will." }] },
  "express-middleware": { title: "A request's trip through Express", kicker: "Express", Scene: ExpressMwScene, fx: ["whoosh", "tick", "success", "whoosh", "success", "tick", "error"], steps: [
    { cap: "Every request passes through your middleware and routes in the order you registered them. First, the logger.", say: "Every request passes through your middleware and routes in the order you registered them. First, the logger." },
    { cap: "express.json() only parses requests with a JSON body. This one has none, so it calls next().", say: "Express dot json only parses requests with a JSON body. This one has none, so it calls next." },
    { cap: "express.static finds public/index.css, sends it with the right Content-Type, and the chain stops there.", say: "Express static finds the CSS file, sends it, and the chain stops there." },
    { cap: "A new request: POST /api/products. The logger runs again, for every request.", say: "A new request. Post to the products API. The logger runs again." },
    { cap: "express.json() fills req.body, static finds no file and calls next(), and the router's route handles it.", say: "Express json fills req dot body. Static finds no file and calls next. And the router's route handles it." },
    { cap: "GET /api/nope matches nothing, so it travels all the way down…", say: "Get slash A P I slash nope matches nothing, so it travels all the way down…" },
    { cap: "…to the 404 middleware registered last. Put it after your routes, or it would catch everything.", dur: 4400, say: "to the four oh four middleware registered last. Put it after your routes, or it would catch everything." }] },
  "session-auth": { title: "Logging in with sessions", kicker: "Express", Scene: SessionAuthScene, fx: ["whoosh", "type", "pop", "ding", "whoosh", "success", "error"], steps: [
    { cap: "The user submits the login form: POST /api/auth/login with a username and password.", say: "The user submits the login form, with a username and password." },
    { cap: "The server looks the user up with a parameterised query and gets their stored bcrypt hash.", say: "The server looks the user up, with a parameterised query, and gets their stored bcrypt hash." },
    { cap: "bcrypt.compare hashes the attempt with the same salt and compares. Match!", say: "bcrypt compare hashes the attempt with the same salt, and compares. Match." },
    { cap: "express-session saves { userId: 7 } in its store and sends a cookie with a random session id. HttpOnly keeps page scripts away from it.", say: "Express session saves the user id in its store, and sends a cookie with a random session id. Http only keeps page scripts away from it." },
    { cap: "On every later request, the browser sends the cookie back automatically.", say: "On every later request, the browser sends the cookie back automatically." },
    { cap: "express-session loads the session, so req.session.userId is 7, requireAuth calls next(), and the cart route answers.", say: "Express session loads the session, so the user id is seven. Require auth calls next, and the cart route answers." },
    { cap: "Logging out destroys the session on the server, so the old cookie no longer means anything.", dur: 4200 }] },
  "sql-order": { title: "The order SQL actually runs in", kicker: "SQL", Scene: SqlOrderScene, fx: ["type", "build", "error", "pop", "error", "tick", "whoosh", "success"], steps: [
    { cap: "You write SELECT first, but the database runs the clauses in a different, logical order.", say: "You write select first. But the database runs the clauses in a different, logical order." },
    { cap: "1. FROM: start with every row of the games table." },
    { cap: "2. WHERE: drop rows that fail the condition. Kingdom of Ash costs 69.99, so it's out.", say: "Two. Where drops rows that fail the condition. Kingdom of Ash costs sixty nine ninety nine, so it's out." },
    { cap: "3. GROUP BY: put the remaining rows into one group per genre.", say: "Three. Group by puts the remaining rows into one group per genre." },
    { cap: "4. HAVING: drop whole groups. Puzzle has only one game, so it goes.", say: "Four. Having drops whole groups. Puzzle has only one game, so it goes." },
    { cap: "5. SELECT: compute the output columns, one row per group. Only now does the alias n exist.", say: "Five. Select computes the output columns, one row per group. Only now does the alias n exist." },
    { cap: "6. ORDER BY: sort the result. Because it runs after SELECT, it can use the alias n.", say: "Six. Order by sorts the result. Because it runs after select, it can use the alias n." },
    { cap: "7. LIMIT: keep the first row. That's why you can't use a SELECT alias in WHERE, but you can in ORDER BY.", dur: 4800, say: "Seven. Limit keeps the first row. That's why you can't use a select alias in where, but you can in order by." }] },
  "sql-join": { title: "How a JOIN matches rows", kicker: "SQL", Scene: SqlJoinScene, fx: ["type", "pop", "pop", "error", "build", "success"], steps: [
    { cap: "Two tables, linked by orders.customer_id → customers.id.", say: "Two tables, linked by the customer id column in orders." },
    { cap: "For Priya (id 1), the database finds every order whose customer_id is 1: orders 101 and 103. Each match becomes a result row.", say: "For Priya, the database finds every order whose customer id is one. Orders one oh one, and one oh three. Each match becomes a result row." },
    { cap: "Lucas (id 2) matches order 102.", say: "Lucas matches order one oh two." },
    { cap: "Sofia (id 3) has no orders. With an INNER JOIN, she simply doesn't appear.", say: "Sofia has no orders. With an inner join, she simply doesn't appear." },
    { cap: "A LEFT JOIN keeps every row from the left table. Sofia appears, with NULL in the order columns.", say: "A left join keeps every row from the left table. Sofia appears, with null in the order columns." },
    { cap: "That's the classic trick for finding things without matches: LEFT JOIN, then WHERE the right side IS NULL.", dur: 4500 }] },
  "node-server": { title: "Inside a Node request", kicker: "Node.js", Scene: NodeServerScene, fx: ["whoosh", "tick", "click", "build", "type", "whoosh", "success", "error"], steps: [
    { cap: "The browser (or any client) sends a request: GET /api/continent/asia.", say: "The browser sends a request: get, slash A P I, slash continent, slash Asia." },
    { cap: "Node receives it on port 8000 and calls your request handler with req and res.", say: "Node receives it on port eight thousand, and calls your request handler with req and res." },
    { cap: "Routing: your code checks req.method and req.url to decide what to do.", say: "Routing. Your code checks the method and the U R L to decide what to do." },
    { cap: "It awaits the data. While it waits, Node's event loop keeps handling other requests: that's non-blocking I/O.", say: "It awaits the data. While it waits, Node's event loop keeps handling other requests. That's non-blocking I O." },
    { cap: "It sets the status code and headers, like Content-Type: application/json." },
    { cap: "res.end() sends the body and finishes the response.", say: "res dot end sends the body, and finishes the response." },
    { cap: "The client gets 200 OK with JSON it can parse.", say: "The client gets two hundred O K, with JSON it can parse." },
    { cap: "Every request needs exactly one response. Miss res.end() on any path and that client hangs.", dur: 4200, say: "Every request needs exactly one response. Miss res dot end on any path, and that client hangs." }] },
  jsx: { title: "JSX → React element → DOM", kicker: "React", Scene: JsxScene, fx: ["type", "whoosh", "pop", "build", "type", "ding", "success"], steps: [
    { cap: "You write JSX: something that looks like HTML, inside JavaScript.", say: "You write J S X. Something that looks like H T M L, inside JavaScript." },
    { cap: "The compiler (Vite uses Babel or esbuild) turns every tag into a function call: jsx(type, props).", say: "The compiler turns every tag into a function call: J S X, with a type and props." },
    { cap: "Calling it returns a React element: a plain object describing what should be on screen. No DOM yet.", say: "Calling it returns a React element. A plain object describing what should be on screen. There's no DOM yet." },
    { cap: "root.render() hands the objects to React DOM, which creates the real elements.", say: "root dot render hands the objects to React DOM, which creates the real elements." },
    { cap: "When data changes, you don't patch the DOM. Your component describes the page again." },
    { cap: "React compares the new objects with the previous ones and updates only what's different: here, one text node." },
    { cap: "That's the whole trick: JSX → function call → object → DOM.", dur: 4200, say: "That's the whole trick. J S X, to function call, to object, to DOM." }] },
  "react-render": { title: "What happens when state changes", kicker: "React", Scene: ReactRenderScene, fx: ["tick", "build", "click", "pop", "type", "ding", "success"], steps: [
    { cap: "React calls Counter(). useState(0) returns the current value, 0, and a setter function.", say: "React calls Counter. use State of zero returns the current value, zero, and a setter function." },
    { cap: "Counter returns JSX, and React puts a button reading “Clicks: 0” on the page.", say: "Counter returns J S X, and React puts a button reading clicks zero on the page." },
    { cap: "You click. The onClick handler calls setCount(c => c + 1).", say: "You click. The on click handler calls set count, with c to c plus one." },
    { cap: "React stores the new value, 1, and schedules a re-render. The count variable in the running code is still 0.", say: "React stores the new value, one, and schedules a re-render. The count variable in the code that already ran is still zero." },
    { cap: "Re-render: React calls Counter() again. This time useState returns 1.", say: "Re-render. React calls Counter again. This time use State returns one." },
    { cap: "React diffs the new JSX against the previous render. Only the text changed.", say: "React compares the new J S X with the previous render. Only the text changed." },
    { cap: "Commit: React updates that single text node in the DOM. Render is calling your function; commit is touching the DOM.", dur: 4500, say: "Commit. React updates that single text node in the DOM. Rendering is calling your function. Committing is touching the DOM." }] },
  effect: { title: "useEffect: syncing with the outside world", kicker: "React", Scene: EffectScene, fx: ["type", "build", "pop", "tick", "whoosh", "error", "success"], steps: [
    { cap: "Render: React calls your component. useEffect only registers the effect function. It doesn't run it yet.", say: "Render. React calls your component. use Effect only registers the effect function. It doesn't run it yet." },
    { cap: "Commit: React updates the DOM, so the heading appears." },
    { cap: "After the browser paints, React runs the effect: it adds a resize listener to the window." },
    { cap: "You resize the window. onResize calls setWidth, and React re-renders. The deps array [] hasn't changed, so the effect doesn't run again.", say: "You resize the window. On resize calls set width, and React re-renders. The dependency array hasn't changed, so the effect doesn't run again." },
    { cap: "The component is removed. React calls the cleanup function you returned, and the listener is removed.", say: "The component is removed. React calls the cleanup function you returned, and the listener is removed." },
    { cap: "Without cleanup, every mount adds another listener that never goes away: a memory leak. In development, Strict Mode mounts components twice to expose this.", say: "Without cleanup, every mount adds another listener that never goes away. That's a memory leak. In development, strict mode mounts components twice to expose it." },
    { cap: "The dependency array decides when the effect runs again.", dur: 4800 }] },
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
  delegation: { title: "Event delegation: one listener, every button", kicker: "Essential JS", Scene: DelegationScene, fx: ["tick", "click", "whoosh", "pop", "pop", "success", "ding"], steps: [
    { cap: "Twimba renders its tweets from data. Instead of a listener on every icon, there's one click listener on the document." },
    { cap: "You click the heart on the second tweet." },
    { cap: "The click event bubbles up through every ancestor: the icon, the tweet, the feed, and finally the document.", dur: 3600 },
    { cap: "The document's listener runs. e.target is the heart, and e.target.dataset.like holds that tweet's uuid.", say: "The document's listener runs. e dot target is the heart, and its data like attribute holds that tweet's uuid." },
    { cap: "handleLikeClick finds the matching object in tweetsData, adds one like and flips isLiked to true.", say: "handle like click finds the matching object in tweets data, adds one like, and flips is liked to true." },
    { cap: "render() rebuilds the feed from the data, so the heart turns red with the new count." },
    { cap: "New tweets need nothing extra: they're inside the document, so the same listener handles their clicks.", dur: 3800 }] },
  reduce: { title: "reduce(): many values in, one value out", kicker: "Essential JS", Scene: ReduceScene, fx: ["type", "tick", "whoosh", "whoosh", "whoosh", "success", "build"], steps: [
    { cap: "reduce walks through an array and carries one value along the way, called the accumulator." },
    { cap: "It starts with the initial value you pass as the second argument: acc is 0." },
    { cap: "First price: the callback returns 0 + 12 = 12, which becomes the new acc.", say: "First price: the callback returns zero plus twelve, which is twelve. That becomes the new accumulator." },
    { cap: "Second price: 12 + 8 = 20.", say: "Second price: twelve plus eight is twenty." },
    { cap: "Third price: 20 + 5 = 25.", say: "Third price: twenty plus five is twenty-five." },
    { cap: "No items left, so reduce returns the final accumulator: 25.", say: "No items left, so reduce returns the final accumulator: twenty-five." },
    { cap: "The accumulator can be any value. Start with {} to build an object, like counting items by category.", dur: 4000 }] },
  "event-loop": { title: "The event loop: why 1, 4, 3, 2?", kicker: "Async JS", Scene: EventLoopScene, fx: ["type", "pop", "tick", "whoosh", "tick", "pop", "whoosh", "success"], steps: [
    { cap: "Four lines of code. Before playing, guess the order the numbers print in.", dur: 3600 },
    { cap: "console.log(1) goes on the call stack and runs straight away. The console shows 1.", say: "console dot log one goes on the call stack and runs straight away. The console shows one." },
    { cap: "setTimeout hands its callback and a 0 ms timer to the browser, then returns immediately. Nothing prints.", say: "set timeout hands its callback and a zero millisecond timer to the browser, then returns immediately. Nothing prints yet." },
    { cap: "The timer finishes at once, so its callback moves to the task queue and waits for the stack to be empty." },
    { cap: "Promise.resolve().then(…) puts its callback in the microtask queue, which has priority.", say: "Promise dot resolve dot then puts its callback in the microtask queue, which has priority." },
    { cap: "console.log(4) runs. The console shows 1, 4, and the call stack is now empty.", say: "console dot log four runs. The console shows one, four. And the call stack is now empty." },
    { cap: "The event loop empties the microtask queue first, so the promise callback runs: 1, 4, 3.", say: "The event loop empties the microtask queue first, so the promise callback runs. One, four, three." },
    { cap: "Only then does it take the next task: the timer callback. Final output: 1, 4, 3, 2.", say: "Only then does it take the next task, the timer callback. Final output: one, four, three, two.", dur: 4200 }] },
  git: { title: "Working tree → staging → commits → branches", kicker: "Git", Scene: GitScene, fx: ["tick", "type", "whoosh", "pop", "build", "pop", "success"], steps: [
    { cap: "Your repository starts clean: one commit, nothing changed." }, { cap: "You edit index.html. Git sees the change in the working tree." },
    { cap: "git add moves the change into the staging area, the draft of your next snapshot." }, { cap: "git commit saves the snapshot to history, and main moves forward." },
    { cap: "git switch -c feature starts a branch. New commits go there; main stays put." }, { cap: "Meanwhile someone commits on main too. History has split." },
    { cap: "git merge feature joins them with a merge commit that has two parents.", dur: 4000 }] },
};
