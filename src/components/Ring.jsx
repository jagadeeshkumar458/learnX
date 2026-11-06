import React from "react";

export default function Ring({ pct, size = 22, sw = 3 }) {
  const r = (size - sw) / 2;
  const c = 2 * Math.PI * r;
  return (
    <svg className="ring" width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)" }} aria-hidden="true">
      <circle className="t" cx={size / 2} cy={size / 2} r={r} strokeWidth={sw} />
      <circle className="v" cx={size / 2} cy={size / 2} r={r} strokeWidth={sw} strokeDasharray={c} strokeDashoffset={c * (1 - pct / 100)} />
    </svg>
  );
}

export function KindPill({ kind, live }) {
  if (!live) return <span className="pill">Soon</span>;
  if (kind === "build") return <span className="pill build">Build</span>;
  if (kind === "solo") return <span className="pill solo">Solo</span>;
  return <span className="pill">Lesson</span>;
}
