import React, { useEffect, useState } from "react";
import { COURSES, byId, minutes, pad } from "../lib/course.js";
import { BADGES, GOAL, level, levelFloor, modDone, modPct, rank, today, useProgress } from "../lib/progress.jsx";
import Ring, { KindPill } from "./Ring.jsx";

const WORDS = ["<h1>HTML</h1>", "display: flex;", "git commit -m \"ship it\"", "await fetch('/api')", "SELECT * FROM users;", "<App />", "embed(query) → top 5 chunks", "agent.run(tools)", "npm run deploy 🚀"];

function Typer() {
  const [text, setText] = useState("");
  useEffect(() => {
    let w = 0, i = 0, del = false, t;
    const step = () => {
      const s = WORDS[w];
      i += del ? -1 : 1;
      setText(s.slice(0, i));
      let d = del ? 28 : 60;
      if (!del && i === s.length) { del = true; d = 1300; }
      else if (del && i === 0) { del = false; w = (w + 1) % WORDS.length; d = 300; }
      t = setTimeout(step, d);
    };
    step();
    return () => clearTimeout(t);
  }, []);
  return <div className="typer">$ {text}</div>;
}

function useReady() {
  const [ready, setReady] = useState(false);
  useEffect(() => { const r = requestAnimationFrame(() => requestAnimationFrame(() => setReady(true))); return () => cancelAnimationFrame(r); }, []);
  return ready;
}

const courseDone = (S, c) => c.all.filter((l) => S.done[l.id]).length;
const nextIn = (S, c) => {
  const last = S.lastLesson && byId[S.lastLesson];
  if (last && last.course === c && last.live && !S.done[last.id]) return last;
  return c.live.find((l) => !S.done[l.id]) || c.live[c.live.length - 1] || c.all[0];
};

/* Daily goal + streak panel, shared by the catalog and course pages. */
function GoalPanel({ ready }) {
  const { S } = useProgress();
  const todayXp = S.act[today()] || 0;
  const days = [...Array(7)].map((_, i) => {
    const d = new Date(Date.now() - (6 - i) * 864e5);
    const k = d.toLocaleDateString("en-CA");
    return { k, l: d.toLocaleDateString("en", { weekday: "narrow" }), v: S.act[k] || 0 };
  });
  return (
    <div className="panel">
      <div className="goal">
        <Ring pct={Math.min(100, (todayXp / GOAL) * 100)} size={54} sw={6} />
        <div>
          <span className="eyebrow">Daily goal</span>
          <div style={{ fontWeight: 700 }}>{todayXp} / {GOAL} XP today</div>
          <div className="tiny" style={{ margin: 0 }}>{S.streak ? `🔥 ${S.streak}-day streak` : "Start a streak today"}</div>
        </div>
      </div>
      <div className="week">
        {days.map((d) => (
          <div className={"day" + (d.k === today() ? " today" : "")} key={d.k}>
            <i><span style={{ height: ready ? Math.min(100, (d.v / GOAL) * 100) + "%" : 0 }} /></i>{d.l}
          </div>
        ))}
      </div>
    </div>
  );
}

function Badges() {
  const { S } = useProgress();
  return (
    <>
      <div className="sec-title" style={{ marginTop: 34 }}><h2>Badges</h2><span className="eyebrow">{Object.keys(S.badges).length}/{BADGES.length}</span></div>
      <div className="badges">
        {BADGES.map((b) => (
          <div className={"badge" + (S.badges[b.id] ? " got" : "")} key={b.id}>
            <div className="ico">{b.ico}</div>
            <div><b>{b.t}</b><small>{b.d}</small></div>
          </div>
        ))}
      </div>
    </>
  );
}

/* ── Catalog: all courses ── */
export function Catalog({ onSearch }) {
  const { S } = useProgress();
  const ready = useReady();
  const lv = level(S.xp), into = S.xp - levelFloor(lv), need = levelFloor(lv + 1) - levelFloor(lv);
  const resume = S.lastLesson && byId[S.lastLesson];
  return (
    <>
      <section className="hero" style={{ gridTemplateColumns: "minmax(0,1fr)" }}>
        <div>
          <span className="eyebrow">Shipyard · {COURSES.length} career paths</span>
          <h1 style={{ marginTop: 10 }}>Learn to ship software.</h1>
          <p>Quick, hands-on paths for developers levelling up. Every concept comes with live code, a quick check, and something to build.</p>
          <Typer />
          <div className="cta-row">
            {resume ? <a className="btn btn-primary" href={"#" + resume.id}>Resume: {resume.title} →</a>
              : <a className="btn btn-primary" href="#c-fullstack">Start learning →</a>}
            <button className="btn btn-line" onClick={onSearch}>Search all lessons</button>
          </div>
        </div>
      </section>

      <section className="dash">
        <div className="panel">
          <span className="eyebrow">Your level</span>
          <h3 style={{ fontSize: 22, margin: "6px 0 4px" }}>Level {lv} · {rank(lv)}</h3>
          <p style={{ color: "var(--muted)", margin: "0 0 16px", fontSize: 14 }}>{S.xp} XP earned across all paths</p>
          <div className="bar"><span style={{ width: (into / need) * 100 + "%" }} /></div>
          <div className="tiny"><span>{into}/{need} XP</span><span>to level {lv + 1}</span></div>
        </div>
        <GoalPanel ready={ready} />
      </section>

      <div className="sec-title"><h2>Career paths</h2><span className="eyebrow">{COURSES.length} paths</span></div>
      <div className="catalog">
        {COURSES.map((c) => {
          const done = courseDone(S, c);
          const pct = c.live.length ? Math.round((done / c.live.length) * 100) : 0;
          return (
            <a className="course-card" key={c.id} href={"#c-" + c.id}>
              <div className="cc-top">
                <span className={"pill " + (c.live.length ? "live" : "")}>{c.live.length ? `${c.live.length} interactive lessons` : "Syllabus"}</span>
                <span className="pill">{c.level}</span>
              </div>
              <h3>{c.title}</h3>
              <p>{c.tagline}</p>
              <div className="cc-stats">
                <span><b>{c.modules.length}</b> modules</span>
                <span><b>{c.all.length}</b> lessons</span>
                <span><b>~{Math.round(c.minutes / 60)}</b> hrs</span>
              </div>
              <div className="bar"><span style={{ width: (ready ? pct : 0) + "%" }} /></div>
              <div className="tiny"><span>{done} completed</span><span>{pct}%</span></div>
            </a>
          );
        })}
      </div>
      <a className="radio-promo" href="#podcast">
        <span className="pod-eq small" aria-hidden="true">{[...Array(8)].map((_, i) => <i key={i} style={{ animationDelay: i * 0.1 + "s" }} />)}</span>
        <div><span className="eyebrow">New · Podcast</span><b>Shipyard Radio</b><small>11 two-host episodes that explain every topic in depth. Pick your hosts from a cast of 16.</small></div>
        <span className="btn btn-dark">Listen →</span>
      </a>
      <Badges />
    </>
  );
}

/* ── One course: hero, up next, route of modules ── */
export default function CoursePage({ course: c, onSearch }) {
  const { S } = useProgress();
  const ready = useReady();
  const done = courseDone(S, c);
  const denom = Math.max(1, c.live.length);
  const pct = Math.round((done / denom) * 100);
  const nx = nextIn(S, c);
  const lv = level(S.xp), into = S.xp - levelFloor(lv), need = levelFloor(lv + 1) - levelFloor(lv);
  const firstIncomplete = c.modules.findIndex((m) => m.lessons.some((l) => l.body) && modPct(S, m) < 100);
  const R = 64, Cc = 2 * Math.PI * R;

  return (
    <>
      <div className="crumb"><a className="eyebrow" href="#home" style={{ textDecoration: "none" }}>All paths</a><span className="eyebrow">/</span></div>
      <section className="hero">
        <div>
          <span className="eyebrow">Career path · {c.level} · {c.all.length} lessons · ~{Math.round(c.minutes / 60)} hours</span>
          <h1 style={{ marginTop: 10 }}>{c.title}</h1>
          <p>{c.tagline} {c.about}</p>
          <div className="cta-row">
            <a className="btn btn-primary" href={"#" + nx.id}>{done ? "Continue" : c.live.length ? "Start course" : "View syllabus"} →</a>
            <button className="btn btn-line" onClick={onSearch}>Browse lessons</button>
          </div>
          <div className="meta-row">
            <span><b>{c.modules.length}</b> modules</span>
            <span><b>{c.all.filter((l) => l.kind !== "lesson").length}</b> projects &amp; challenges</span>
            {c.topics > 0 && <span><b>{c.topics.toLocaleString()}</b> syllabus topics</span>}
            <span><b>{c.live.length}</b> interactive now</span>
          </div>
        </div>
        <div className="big-ring" aria-label={`${pct}% complete`}>
          <svg width="150" height="150">
            <circle cx="75" cy="75" r={R} fill="none" stroke="var(--line)" strokeWidth="10" />
            <circle cx="75" cy="75" r={R} fill="none" stroke="var(--accent)" strokeWidth="10" strokeLinecap="round"
              strokeDasharray={Cc} strokeDashoffset={ready ? Cc * (1 - pct / 100) : Cc}
              style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(.2,.8,.2,1)" }} />
          </svg>
          <div className="lbl"><b>{pct}%</b><span>{done}/{c.live.length} done</span></div>
        </div>
      </section>

      <section className="dash">
        <a className="panel cont-card" href={"#" + nx.id} style={{ textDecoration: "none", color: "inherit" }}>
          <span className="eyebrow">Up next · {nx.mod.title}</span>
          <h3>{nx.title}</h3>
          <p><KindPill kind={nx.kind} live={nx.live} /> &nbsp;~{nx.min} min{nx.live ? " · +50 XP" : ""}</p>
          <div className="bar"><span style={{ width: (into / need) * 100 + "%" }} /></div>
          <div className="tiny"><span>Level {lv} · {rank(lv)}</span><span>{into}/{need} XP to level {lv + 1}</span></div>
        </a>
        <GoalPanel ready={ready} />
      </section>

      <div className="sec-title"><h2>Your route</h2><span className="eyebrow">{c.modules.length} stops</span></div>
      <ol className="route">
        {c.modules.map((m, i) => {
          const live = m.lessons.some((l) => l.body);
          const p = live ? modPct(S, m) : 0;
          const target = m.lessons.find((l) => !S.done[l.id] && l.body) || m.lessons[0];
          return (
            <li key={m.id} className={"stop" + (p === 100 ? " done" : i === firstIncomplete ? " active" : "")}>
              <div className="node">{p === 100 ? "✓" : pad(i + 1)}</div>
              <a className="stop-card" href={"#" + target.id}>
                <h3>{m.title} {live ? <span className="pill live">Interactive</span> : <span className="pill">Outline</span>}</h3>
                <p>{m.blurb}</p>
                {live && <div className="bar"><span style={{ width: p + "%" }} /></div>}
                <div className="tiny">
                  <span>{live ? `${modDone(S, m)} of ${m.lessons.length} lessons` : `${m.lessons.length} lessons`}</span>
                  <span>{minutes(m)} min</span>
                </div>
              </a>
            </li>
          );
        })}
      </ol>
      <Badges />
    </>
  );
}
