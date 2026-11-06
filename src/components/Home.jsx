import React, { useEffect, useState } from "react";
import { ALL, COURSE, LIVE, byId, minutes, pad } from "../lib/course.js";
import { BADGES, GOAL, level, levelFloor, modDone, modPct, nDone, rank, today, useProgress } from "../lib/progress.jsx";
import Ring, { KindPill } from "./Ring.jsx";

const WORDS = ["<h1>HTML</h1>", "display: flex;", "const app = build();", "await fetch('/api')", "SELECT * FROM users;", "<App />", "git push origin main", "npm run deploy 🚀"];

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

export default function Home({ onSearch }) {
  const { S } = useProgress();
  const [ready, setReady] = useState(false);
  useEffect(() => { const r = requestAnimationFrame(() => requestAnimationFrame(() => setReady(true))); return () => cancelAnimationFrame(r); }, []);

  const done = nDone(S);
  const pct = Math.round((done / LIVE.length) * 100);
  const nextLive = LIVE.find((l) => !S.done[l.id]) || LIVE[LIVE.length - 1];
  const nx = S.lastLesson && byId[S.lastLesson]?.live && !S.done[S.lastLesson] ? byId[S.lastLesson] : nextLive;
  const totalMin = ALL.reduce((a, l) => a + l.min, 0);
  const totalTopics = ALL.reduce((a, l) => a + (l.topics ? l.topics.length : 0), 0);
  const lv = level(S.xp), into = S.xp - levelFloor(lv), need = levelFloor(lv + 1) - levelFloor(lv);
  const todayXp = S.act[today()] || 0;
  const days = [...Array(7)].map((_, i) => {
    const d = new Date(Date.now() - (6 - i) * 864e5);
    const k = d.toLocaleDateString("en-CA");
    return { k, l: d.toLocaleDateString("en", { weekday: "narrow" }), v: S.act[k] || 0 };
  });
  const firstIncomplete = COURSE.modules.findIndex((m) => m.lessons[0].body && modPct(S, m) < 100);
  const R = 64, Cc = 2 * Math.PI * R;

  return (
    <>
      <section className="hero">
        <div>
          <span className="eyebrow">Career path · {ALL.length} lessons · ~{Math.round(totalMin / 60)} hours</span>
          <h1 style={{ marginTop: 10 }}>{COURSE.title}</h1>
          <p>Go from the first HTML tag to deployed fullstack apps. Short concepts, live code, instant feedback, and projects you build yourself.</p>
          <Typer />
          <div className="cta-row">
            <a className="btn btn-primary" href={"#" + nx.id}>{done ? "Continue" : "Start course"} →</a>
            <button className="btn btn-line" onClick={onSearch}>Browse lessons</button>
          </div>
          <div className="meta-row">
            <span><b>{COURSE.modules.length}</b> modules</span>
            <span><b>{ALL.filter((l) => l.kind !== "lesson").length}</b> projects</span>
            <span><b>{totalTopics.toLocaleString()}</b> syllabus topics</span>
            <span><b>{LIVE.length}</b> interactive now</span>
          </div>
        </div>
        <div className="big-ring" aria-label={`${pct}% complete`}>
          <svg width="150" height="150">
            <circle cx="75" cy="75" r={R} fill="none" stroke="var(--line)" strokeWidth="10" />
            <circle cx="75" cy="75" r={R} fill="none" stroke="var(--accent)" strokeWidth="10" strokeLinecap="round"
              strokeDasharray={Cc} strokeDashoffset={ready ? Cc * (1 - pct / 100) : Cc}
              style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(.2,.8,.2,1)" }} />
          </svg>
          <div className="lbl"><b>{pct}%</b><span>{done}/{LIVE.length} done</span></div>
        </div>
      </section>

      <section className="dash">
        <a className="panel cont-card" href={"#" + nx.id} style={{ textDecoration: "none", color: "inherit" }}>
          <span className="eyebrow">Up next · {nx.mod.title}</span>
          <h3>{nx.title}</h3>
          <p><KindPill kind={nx.kind} live /> &nbsp;~{nx.min} min · +50 XP</p>
          <div className="bar"><span style={{ width: (into / need) * 100 + "%" }} /></div>
          <div className="tiny"><span>Level {lv} · {rank(lv)}</span><span>{into}/{need} XP to level {lv + 1}</span></div>
        </a>
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
      </section>

      <div className="sec-title"><h2>Your route</h2><span className="eyebrow">{COURSE.modules.length} stops</span></div>
      <ol className="route">
        {COURSE.modules.map((m, i) => {
          const live = !!m.lessons[0].body;
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
