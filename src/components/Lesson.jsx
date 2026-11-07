import React, { useEffect } from "react";
import { pad } from "../lib/course.js";
import { useProgress, today } from "../lib/progress.jsx";
import { confetti } from "../lib/confetti.js";
import { KindPill } from "./Ring.jsx";
import { Prose, Heading, Callout, Code, Recap, Steps } from "./blocks/Basic.jsx";
import Quiz from "./blocks/Quiz.jsx";
import Playground from "./blocks/Playground.jsx";
import { JsChallenge, HtmlChallenge } from "./blocks/Challenge.jsx";
import Widget from "./widgets/index.jsx";
import { Terminal, GitLab } from "./blocks/Sandbox.jsx";
import Explainer from "./blocks/Explainer.jsx";
import Diagram from "./blocks/Diagram.jsx";
import Gif from "./blocks/Gif.jsx";
import { ReactPlayground, ReactChallenge } from "./blocks/ReactLab.jsx";
import { NodePlayground, NodeChallenge } from "./blocks/NodeLab.jsx";
import { SqlPlayground, SqlChallenge, SqlInjection } from "./blocks/SqlLab.jsx";
import { A11yPlayground, A11yChallenge, ContrastChecker } from "./blocks/A11yLab.jsx";
import { ResponsivePlayground, ResponsiveChallenge } from "./blocks/ResponsiveLab.jsx";

import { TestPlayground, TestChallenge } from "./blocks/TestLab.jsx";
import { TsPlayground, TsChallenge } from "./blocks/TsLab.jsx";
import { NextPlayground, NextChallenge } from "./blocks/NextLab.jsx";
const BLOCKS = { p: Prose, h: Heading, callout: Callout, code: Code, recap: Recap, steps: Steps, quiz: Quiz, play: Playground, jsch: JsChallenge, htmlch: HtmlChallenge, widget: Widget, term: Terminal, git: GitLab, video: Explainer, diagram: Diagram, gif: Gif, rplay: ReactPlayground, rch: ReactChallenge, nplay: NodePlayground, nch: NodeChallenge, sqlplay: SqlPlayground, sqlch: SqlChallenge, sqlinj: SqlInjection, a11yplay: A11yPlayground, a11ych: A11yChallenge, contrast: ContrastChecker, rwplay: ResponsivePlayground, rwch: ResponsiveChallenge, tplay: TestPlayground, tch: TestChallenge, tsplay: TsPlayground, tsch: TsChallenge, nxplay: NextPlayground, nxch: NextChallenge };

export default function Lesson({ lesson: l }) {
  const { S, award, update } = useProgress();
  const all = l.course.all, idx = all.indexOf(l), prev = all[idx - 1], next = all[idx + 1];
  const done = !!S.done[l.id];

  useEffect(() => { if (l.live) update((s) => (s.lastLesson = l.id)); }, [l.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const complete = () => {
    award(50, "Lesson complete", (s) => { s.done = { ...s.done, [l.id]: today() }; });
    confetti();
  };

  return (
    <>
      <div className="crumb">
        <a className="eyebrow" href={"#c-" + l.course.id} style={{ textDecoration: "none" }}>{l.course.title.replace(/^The /, "")}</a>
        <span className="eyebrow">/</span>
        <span className="eyebrow">{pad(l.mi + 1)} {l.mod.title}</span>
      </div>
      <h1 className="lesson-h1">{l.title}</h1>
      <div className="lesson-meta">
        <KindPill kind={l.kind} live={l.live} />
        <span>~{l.min} min</span>
        <span>Lesson {l.li + 1} of {l.mod.lessons.length}</span>
        {done && <span style={{ color: "var(--ok)", fontWeight: 700 }}>✓ Completed</span>}
      </div>

      {!l.live ? (
        <div className="soon-box">
          <span className="eyebrow">Outline</span>
          <h2 style={{ margin: "6px 0 8px", fontSize: 22 }}>This lesson is being written</h2>
          <p style={{ color: "var(--muted)", margin: 0 }}>Interactive content for <b>{l.mod.title}</b> is coming next. Here is what the module covers:</p>
          <ul>{(l.mod.concepts || []).map((c) => <li key={c}>{c}</li>)}</ul>
          {l.topics && <Syllabus topics={l.topics} open />}
          <div className="cta-row">
            {l.course.live.length > 0 && <a className="btn btn-primary" href={"#" + (l.course.live.find((x) => !S.done[x.id]) || l.course.live[0]).id}>Continue where interactive content is →</a>}
            <a className="btn btn-line" href={"#c-" + l.course.id}>Back to course</a>
          </div>
        </div>
      ) : (
        <>
          {l.topics && <div className="block"><Syllabus topics={l.topics} /></div>}
          {l.body.map((b, i) => {
            const Cmp = BLOCKS[b.t];
            return Cmp ? (
              <div className="block" key={i} style={{ animationDelay: Math.min(i, 6) * 50 + "ms" }}>
                <Cmp b={b} k={`${l.id}:${i}`} />
              </div>
            ) : null;
          })}
          <div className={"complete" + (done ? " is-done" : "")}>
            <div>
              <div style={{ fontWeight: 800, fontFamily: "var(--f-display)", fontSize: 20 }}>{done ? "Lesson complete" : "Finished this lesson?"}</div>
              <div style={{ color: "var(--muted)", fontSize: 14 }}>{done ? "Nice work. Keep the momentum going." : "Mark it complete to earn 50 XP and grow your streak."}</div>
            </div>
            {done ? (next && <a className="btn btn-dark" href={"#" + next.id}>Next lesson →</a>)
              : <button className="btn btn-primary" onClick={complete}>Complete · +50 XP</button>}
          </div>
        </>
      )}

      <nav className="pn">
        {prev && <a href={"#" + prev.id}><small>← Previous</small>{prev.title}</a>}
        {next && <a className="nx" href={"#" + next.id}><small>Next →</small>{next.title}</a>}
      </nav>
    </>
  );
}

/* Every part of this lesson in the full course, as a numbered syllabus. */
function Syllabus({ topics, open = false }) {
  return (
    <details className="syllabus" open={open}>
      <summary>
        <span className="eyebrow">Full syllabus</span>
        <b>{topics.length} parts in this lesson</b>
        <span className="chev" aria-hidden="true">▾</span>
      </summary>
      <ol>{topics.map((t, i) => <li key={i}><span className="n">{String(i + 1).padStart(2, "0")}</span><span>{t}</span></li>)}</ol>
    </details>
  );
}
