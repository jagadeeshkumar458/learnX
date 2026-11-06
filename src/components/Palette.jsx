import React, { useEffect, useMemo, useRef, useState } from "react";
import { ALL } from "../lib/course.js";
import { useProgress } from "../lib/progress.jsx";

export default function Palette({ onClose }) {
  const { S } = useProgress();
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(0);
  const listRef = useRef(null);

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return ALL.filter((l) => !s || (l.title + " " + l.mod.title).toLowerCase().includes(s))
      .sort((a, b) => b.live - a.live).slice(0, 40);
  }, [q]);

  useEffect(() => { listRef.current?.querySelector(".sel")?.scrollIntoView({ block: "nearest" }); }, [sel]);

  const go = (l) => { location.hash = l.id; onClose(); };
  const onKey = (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setSel((s) => Math.min(s + 1, list.length - 1)); }
    if (e.key === "ArrowUp") { e.preventDefault(); setSel((s) => Math.max(s - 1, 0)); }
    if (e.key === "Enter" && list[sel]) go(list[sel]);
    if (e.key === "Escape") onClose();
  };

  return (
    <div className="modal-bg" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="palette" role="dialog" aria-label="Search lessons">
        <input autoFocus value={q} placeholder={`Search ${ALL.length} lessons…`} autoComplete="off"
          onChange={(e) => { setQ(e.target.value); setSel(0); }} onKeyDown={onKey} aria-label="Search lessons" />
        <div className="res" ref={listRef}>
          {list.length ? list.map((l, i) => (
            <a key={l.id} href={"#" + l.id} className={i === sel ? "sel" : ""} onClick={onClose}>
              <span>{S.done[l.id] ? "✓ " : ""}{l.title}</span>
              <small>{l.course.id === "ai" ? "AI · " : ""}{l.mod.title}{l.live ? "" : " · outline"}</small>
            </a>
          )) : <div style={{ padding: 14, color: "var(--muted)" }}>No lessons match “{q}”.</div>}
        </div>
      </div>
    </div>
  );
}
