import React, { useEffect, useRef, useState } from "react";
import { COURSES, byId, pad } from "../lib/course.js";
import { useProgress, level, modPct } from "../lib/progress.jsx";
import Ring from "./Ring.jsx";

export function BrandMark() {
  return (
    <span className="brand-mark">
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M3 15h18l-2.5 5h-13L3 15z" fill="#e2531a" />
        <path d="M12 3v10M12 4l6 7h-6" stroke="#fff" strokeWidth="2" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

export default function Rail({ current, course, onCourse, onSearch }) {
  const { S, update, reset } = useProgress();
  const [open, setOpen] = useState(() => new Set([course.modules[0].id]));
  const [armed, setArmed] = useState(false);
  const navRef = useRef(null);

  useEffect(() => {
    const l = byId[current];
    if (l) setOpen((o) => new Set(o).add(l.mod.id));
    requestAnimationFrame(() => navRef.current?.querySelector("a.cur")?.scrollIntoView({ block: "nearest" }));
  }, [current]);

  useEffect(() => {
    setOpen((o) => (course.modules.some((m) => o.has(m.id)) ? o : new Set(o).add(course.modules[0].id)));
  }, [course]);

  const toggle = (id) => setOpen((o) => { const n = new Set(o); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const toggleTheme = () => {
    const dark = S.theme ? S.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
    update((s) => (s.theme = dark ? "light" : "dark"));
  };

  const onReset = () => {
    if (armed) { reset(); setArmed(false); location.hash = "home"; return; }
    setArmed(true);
    setTimeout(() => setArmed(false), 3000);
  };

  return (
    <aside className="rail" aria-label="Course outline">
      <a className="brand" href="#home"><BrandMark />Shipyard</a>
      <div className="rail-stats">
        <div className="chip"><b>{S.xp}</b><span>XP</span></div>
        <div className="chip"><b>{level(S.xp)}</b><span>Level</span></div>
        <div className="chip"><b>{S.streak}🔥</b><span>Streak</span></div>
      </div>
      <div className="course-switch" role="tablist" aria-label="Career path">
        {COURSES.map((c) => (
          <button key={c.id} role="tab" aria-selected={c === course} className={c === course ? "on" : ""} onClick={() => onCourse(c)}>
            {c.title.replace(/^The /, "").replace(/ Path$/, "")}
          </button>
        ))}
      </div>
      <a className={"radio-link" + (current === "podcast" ? " on" : "")} href="#podcast"><span aria-hidden="true">🎙</span> Shipyard Radio <span className="pill">Podcast</span></a>
      <button className="search-btn" onClick={onSearch}>⌕ Search lessons <kbd>Ctrl K</kbd></button>
      <nav className="outline" ref={navRef}>
        {course.modules.map((m, i) => {
          const isOpen = open.has(m.id);
          return (
            <div className={"mod" + (isOpen ? " open" : "")} key={m.id}>
              <button className="mod-head" aria-expanded={isOpen} onClick={() => toggle(m.id)}>
                <span className="mod-num">{pad(i + 1)}</span>
                <span className="mod-title">{m.title}</span>
                <Ring pct={m.lessons.some((l) => l.body) ? modPct(S, m) : 0} />
              </button>
              <ul className="lessons">
                {m.lessons.map((l) => (
                  <li key={l.id}>
                    <a href={"#" + l.id} className={l.id === current ? "cur" : ""}>
                      <span className={"dot " + (S.done[l.id] ? "done" : l.body ? "" : "soon")} />
                      {l.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </nav>
      <div className="rail-foot">
        <button className="ghost" onClick={toggleTheme}>◐ Theme</button>
        <button className="ghost" onClick={onReset} style={armed ? { color: "var(--bad)" } : undefined}>
          {armed ? "Tap again to confirm" : "Reset progress"}
        </button>
      </div>
    </aside>
  );
}
