import React, { useEffect, useRef, useState } from "react";
import Prism from "prismjs";
import "prismjs/components/prism-json";
import { useProgress } from "../../lib/progress.jsx";

/* Lesson text is authored in course.js and may contain inline <code>, <b>, <kbd>. */
const html = (h) => ({ __html: h });

export const Prose = ({ b }) => <div className="prose"><p dangerouslySetInnerHTML={html(b.h)} /></div>;
export const Heading = ({ b }) => <h2 className="lesson-h2" dangerouslySetInnerHTML={html(b.h)} />;

const CALLOUT = { tip: "Tip", warn: "Watch out", key: "Key idea", why: "Why it works" };
export const Callout = ({ b }) => (
  <div className={"callout " + b.kind}>
    <span className="ci">{CALLOUT[b.kind]}</span>
    <div dangerouslySetInnerHTML={html(b.h)} />
  </div>
);

export function CodeView({ code, lang }) {
  const ref = useRef(null);
  const grammar = lang === "html" ? "markup" : lang;
  useEffect(() => { if (ref.current) Prism.highlightElement(ref.current); }, [code, grammar]);
  return <pre className="code"><code ref={ref} className={"language-" + grammar}>{code}</code></pre>;
}

export function Code({ b }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    const ok = () => { setCopied(true); setTimeout(() => setCopied(false), 1200); };
    try { navigator.clipboard.writeText(b.code).then(ok, ok); } catch { ok(); }
  };
  return (
    <div className="code-wrap">
      <CodeView code={b.code} lang={b.lang} />
      <span className="lang">{b.lang}<button className="copy" onClick={copy}>{copied ? "Copied" : "Copy"}</button></span>
    </div>
  );
}

export const Recap = ({ b }) => (
  <div className="recap">
    <span className="eyebrow">Key takeaways</span>
    <ul>{b.items.map((x, i) => <li key={i}><span dangerouslySetInnerHTML={html(x)} /></li>)}</ul>
  </div>
);

export function Steps({ b, k }) {
  const { S, update } = useProgress();
  const checked = S.steps[k] || [];
  const toggle = (j) => update((s) => {
    const cur = new Set(s.steps[k] || []);
    cur.has(j) ? cur.delete(j) : cur.add(j);
    s.steps = { ...s.steps, [k]: [...cur] };
  });
  return (
    <ol className="steps">
      {b.items.map((x, j) => (
        <li key={j} className={checked.includes(j) ? "ck" : ""} onClick={() => toggle(j)}>
          <span dangerouslySetInnerHTML={html(x)} />
        </li>
      ))}
    </ol>
  );
}
