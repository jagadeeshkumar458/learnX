import React, { useMemo, useState } from "react";
import { DIAGRAMS } from "../../data/diagrams.js";

/* Flowcharts and block diagrams drawn from data (see data/diagrams.js).
   Nodes sit on a grid (col,row); edges route orthogonally between node sides.
   Click a node to read its note. Block: { t: "diagram", name: "blackjack-flow" } */

const CW = 180, RH = 88, PAD = 24;
const TONES = { accent: "var(--accent)", ok: "var(--ok)", bad: "var(--bad)", info: "#5a6cf0", gold: "var(--gold)", muted: "var(--muted)" };

function geom(n) {
  // size the box to fit its longest line, leaving a gap for arrows and labels between cells
  const longest = Math.max(...String(n.label).split("\n").map((l) => l.length));
  const fit = n.shape === "diamond" ? longest * 7.4 * 1.55 + 16 : n.shape === "group" ? 0 : longest * 7.1 + 24;
  const w = n.shape === "group" ? (n.w || 1) * CW - 8 : Math.min((n.w || 1) * CW - 14, Math.max((n.w || 1) * CW - 60, fit));
  const lines = String(n.label).split("\n").length;
  const h = n.shape === "diamond" ? 70 : Math.max((n.h || 1) * RH - 36, lines * 15 + 20);
  const cx = PAD + n.x * CW + ((n.w || 1) * CW) / 2, cy = PAD + n.y * RH + ((n.h || 1) * RH) / 2;
  return { cx, cy, w, h, l: cx - w / 2, r: cx + w / 2, t: cy - h / 2, b: cy + h / 2 };
}
function anchor(g, side) {
  return side === "top" ? [g.cx, g.t] : side === "bottom" ? [g.cx, g.b] : side === "left" ? [g.l, g.cy] : [g.r, g.cy];
}
function route(a, b, e) {
  const A = geom(a), B = geom(b);
  let fs = e.fromSide, ts = e.toSide;
  if (!fs || !ts) {
    if (e.via === "left" || e.via === "right") { fs = fs || e.via; ts = ts || e.via; }
    else if (B.t >= A.b - 1) { fs = fs || "bottom"; ts = ts || "top"; }
    else if (B.b <= A.t + 1) { fs = fs || "top"; ts = ts || "bottom"; }
    else if (B.l >= A.r) { fs = fs || "right"; ts = ts || "left"; }
    else { fs = fs || "left"; ts = ts || "right"; }
  }
  const [x1, y1] = anchor(A, fs), [x2, y2] = anchor(B, ts);
  let pts;
  if (e.via === "left" || e.via === "right") {
    const off = e.via === "left" ? Math.min(A.l, B.l) - 26 - (e.lane || 0) * 14 : Math.max(A.r, B.r) + 26 + (e.lane || 0) * 14;
    pts = [[x1, y1], [off, y1], [off, y2], [x2, y2]];
  } else if ((fs === "bottom" || fs === "top") && (ts === "top" || ts === "bottom")) {
    const my = (y1 + y2) / 2;
    pts = x1 === x2 ? [[x1, y1], [x2, y2]] : [[x1, y1], [x1, my], [x2, my], [x2, y2]];
  } else if ((fs === "left" || fs === "right") && (ts === "left" || ts === "right")) {
    const mx = (x1 + x2) / 2;
    pts = y1 === y2 ? [[x1, y1], [x2, y2]] : [[x1, y1], [mx, y1], [mx, y2], [x2, y2]];
  } else if (fs === "right" || fs === "left") pts = [[x1, y1], [x2, y1], [x2, y2]];
  else pts = [[x1, y1], [x1, y2], [x2, y2]];
  return pts;
}
const pathOf = (pts) => pts.map((p, i) => (i ? "L" : "M") + p[0] + "," + p[1]).join(" ");
function midOf(pts) {
  // label goes at the middle of the longest segment
  let best = 0, at = [pts[0][0], pts[0][1]];
  for (let i = 1; i < pts.length; i++) {
    const [a, b] = [pts[i - 1], pts[i]], len = Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);
    if (len > best) { best = len; at = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]; }
  }
  return at;
}

function Shape({ n, g, active, onClick }) {
  const col = TONES[n.tone] || "var(--ink)";
  const fill = n.shape === "group" ? "transparent" : active ? `color-mix(in srgb, ${col} 18%, var(--surface))` : "var(--surface)";
  const lines = String(n.label).split("\n");
  const common = { fill, stroke: col, strokeWidth: active ? 2.5 : 1.6 };
  let shape;
  if (n.shape === "diamond") shape = <polygon points={`${g.cx},${g.t} ${g.r},${g.cy} ${g.cx},${g.b} ${g.l},${g.cy}`} {...common} />;
  else if (n.shape === "pill") shape = <rect x={g.l} y={g.t} width={g.w} height={g.h} rx={g.h / 2} {...common} />;
  else if (n.shape === "db") shape = (
    <g>
      <path d={`M${g.l},${g.t + 8} v${g.h - 16} a${g.w / 2},8 0 0 0 ${g.w},0 v-${g.h - 16}`} {...common} />
      <ellipse cx={g.cx} cy={g.t + 8} rx={g.w / 2} ry={8} {...common} />
    </g>
  );
  else if (n.shape === "group") shape = <rect x={g.l - 6} y={g.t - 6} width={g.w + 12} height={g.h + 12} rx={14} fill={`color-mix(in srgb, ${col} 6%, transparent)`} stroke={col} strokeDasharray="5 5" strokeWidth="1.4" />;
  else shape = <rect x={g.l} y={g.t} width={g.w} height={g.h} rx={n.shape === "round" ? 14 : 6} {...common} />;
  const ty = n.shape === "group" ? g.t + 14 : g.cy - ((lines.length - 1) * 15) / 2 + 4.5;
  return (
    <g className={"dg-node" + (n.note ? " has-note" : "")} onClick={n.note ? onClick : undefined} role={n.note ? "button" : undefined} tabIndex={n.note ? 0 : undefined}
      onKeyDown={(e) => n.note && (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onClick())} aria-label={n.note ? `${lines.join(" ")}: show details` : undefined}>
      {shape}
      {lines.map((l, i) => (
        <text key={i} x={g.cx} y={ty + i * 15} textAnchor="middle" className={"dg-text" + (n.shape === "group" ? " dg-group" : "") + (/^[`$]/.test(l) ? " dg-mono" : "")} fill={n.shape === "group" ? col : "var(--ink)"}>
          {l.replace(/^`|`$/g, "")}
        </text>
      ))}
      {n.note && n.shape !== "group" && <circle cx={g.r - 6} cy={g.t + 6} r="3.5" fill={col} className="dg-dot" />}
    </g>
  );
}

export default function Diagram({ b }) {
  const d = DIAGRAMS[b.name];
  const [sel, setSel] = useState(null);
  const byId = useMemo(() => (d ? Object.fromEntries(d.nodes.map((n) => [n.id, n])) : {}), [d]);
  if (!d) return null;
  const cols = Math.max(...d.nodes.map((n) => n.x + (n.w || 1))), rows = Math.max(...d.nodes.map((n) => n.y + (n.h || 1)));
  const W = PAD * 2 + cols * CW + (d.extraW || 0), H = PAD * 2 + rows * RH;
  const order = [...d.nodes].sort((a, b) => (a.shape === "group" ? -1 : 0) - (b.shape === "group" ? -1 : 0));
  const note = sel && byId[sel];
  return (
    <figure className="diagram">
      <div className="dg-head"><span className="pill">{d.kind === "flow" ? "Flowchart" : "Block diagram"}</span><b>{d.title}</b></div>
      <div className="dg-scroll">
        <svg viewBox={`${d.minX || 0} 0 ${W - (d.minX || 0)} ${H}`} style={{ maxWidth: W, minWidth: Math.min(W, 540) }} className="dg-svg" role="img" aria-label={d.title}>
          <defs>
            <marker id={"ah-" + b.name} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" fill="var(--muted)" />
            </marker>
          </defs>
          {order.filter((n) => n.shape === "group").map((n) => <Shape key={n.id} n={n} g={geom(n)} active={sel === n.id} onClick={() => setSel(sel === n.id ? null : n.id)} />)}
          {d.edges.map((e, i) => {
            const pts = route(byId[e.from], byId[e.to], e);
            const [lx, ly] = e.labelSeg === "last" ? midOf(pts.slice(-2)) : midOf(pts);
            const hot = sel && (e.from === sel || e.to === sel);
            return (
              <g key={i} className="dg-edge">
                <path d={pathOf(pts)} fill="none" stroke={hot ? "var(--accent)" : "var(--muted)"} strokeWidth={hot ? 2.2 : 1.5}
                  strokeDasharray={e.dashed ? "5 4" : undefined} markerEnd={e.both ? `url(#ah-${b.name})` : `url(#ah-${b.name})`} markerStart={e.both ? `url(#ah-${b.name})` : undefined}
                  className="dg-line" style={{ animationDelay: i * 60 + "ms" }} />
                {e.label && (
                  <g>
                    <rect x={lx - e.label.length * 3.4 - 6} y={ly - 10} width={e.label.length * 6.8 + 12} height={19} rx={5} fill="var(--bg)" />
                    <text x={lx} y={ly + 4} textAnchor="middle" className="dg-label" fill={e.tone ? TONES[e.tone] : "var(--muted)"}>{e.label}</text>
                  </g>
                )}
              </g>
            );
          })}
          {order.filter((n) => n.shape !== "group").map((n) => <Shape key={n.id} n={n} g={geom(n)} active={sel === n.id} onClick={() => setSel(sel === n.id ? null : n.id)} />)}
        </svg>
      </div>
      <figcaption className="dg-note">
        {note ? <><b>{String(note.label).replace(/\n/g, " ").replace(/`/g, "")}</b> <span dangerouslySetInnerHTML={{ __html: note.note }} /></>
          : <span className="tiny" style={{ margin: 0 }}>{d.caption || "Tap a box with a dot to learn more."}</span>}
      </figcaption>
    </figure>
  );
}
