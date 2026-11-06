import React, { useState } from "react";
import { useProgress } from "../../lib/progress.jsx";

export default function Quiz({ b, k }) {
  const { S, award, update, toast } = useProgress();
  const saved = S.quiz[k];
  // pick: index chosen this session; null = unanswered. Restore a past correct answer as answered.
  const [pick, setPick] = useState(saved === "right" ? b.a : null);
  const answered = pick !== null;

  const choose = (j) => {
    const right = j === b.a;
    setPick(j);
    if (right && saved !== "right") award(10, "Correct answer", (s) => { s.quiz = { ...s.quiz, [k]: "right" }; });
    else if (!right) {
      if (!saved) update((s) => { s.quiz = { ...s.quiz, [k]: "wrong" }; });
      toast("Not quite — read the explanation");
    }
  };

  return (
    <div className="quiz">
      <span className="eyebrow">Quick check · +10 XP</span>
      <div className="quiz-q" dangerouslySetInnerHTML={{ __html: b.q.includes("<code>") ? b.q : escapeHtml(b.q) }} />
      <div className="opts">
        {b.opts.map((o, j) => {
          const cls = answered ? (j === b.a ? " right" : j === pick ? " wrong" : "") : "";
          return (
            <button key={j} className={"opt" + cls} disabled={answered} onClick={() => choose(j)}>
              <span className="k">{"ABCD"[j]}</span><span>{o}</span>
            </button>
          );
        })}
      </div>
      {answered && <div className="why" dangerouslySetInnerHTML={{ __html: b.why }} />}
      {answered && pick !== b.a && (
        <button className="mini" style={{ marginTop: 10 }} onClick={() => setPick(null)}>Try again</button>
      )}
    </div>
  );
}

const escapeHtml = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
