import React, { useEffect, useRef, useState } from "react";
import { EXPLAINERS } from "../explainers/index.jsx";

/* Simulation-video player: animated SVG scenes driven step by step.
   Block: { t: "video", name: "loop" } — see components/explainers for the scenes. */
export default function Explainer({ b }) {
  const ex = EXPLAINERS[b.name];
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [started, setStarted] = useState(false);
  const [elapsed, setElapsed] = useState(0); // ms into current step
  const raf = useRef(0), last = useRef(0);
  const n = ex ? ex.steps.length : 0;

  useEffect(() => {
    if (!playing || !ex) return;
    const dur = (ex.steps[step].dur || 3200) / speed;
    last.current = performance.now();
    const tick = (now) => {
      const dt = now - last.current; last.current = now;
      setElapsed((e) => {
        const ne = e + dt;
        if (ne >= dur) {
          if (step < n - 1) { setStep((s) => s + 1); return 0; }
          setPlaying(false); return dur;
        }
        return ne;
      });
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [playing, step, speed, ex, n]);

  if (!ex) return null;
  const go = (s) => { setStep(Math.max(0, Math.min(n - 1, s))); setElapsed(0); setStarted(true); };
  const toggle = () => {
    setStarted(true);
    if (!playing && step === n - 1 && elapsed > 0) { setStep(0); setElapsed(0); }
    setPlaying((p) => !p);
  };
  const onKey = (e) => {
    if (e.key === " " || e.key === "k") { e.preventDefault(); toggle(); }
    if (e.key === "ArrowRight") { e.preventDefault(); setPlaying(false); go(step + 1); }
    if (e.key === "ArrowLeft") { e.preventDefault(); setPlaying(false); go(step - 1); }
  };
  const Scene = ex.Scene;
  const cur = ex.steps[step];
  const stepDur = (cur.dur || 3200) / speed;
  const done = step === n - 1 && !playing && elapsed > 0;

  return (
    <figure className="explainer" tabIndex={0} onKeyDown={onKey} aria-label={`Simulation video: ${ex.title}`}>
      <div className="ex-stage">
        <div className="ex-title"><span className="ex-kicker">{ex.kicker || "How it works"}</span><span className="ex-h">{ex.title}</span></div>
        <svg viewBox="0 0 640 330" className="ex-svg" role="img" aria-label={cur.cap}>
          <Scene s={step} />
        </svg>
        <figcaption className="ex-cap" key={step}>{cur.cap}</figcaption>
        {!started && (
          <button className="ex-poster" onClick={toggle} aria-label={`Play: ${ex.title}`}>
            <span className="ex-play">▶</span><span>Play simulation · {Math.round(ex.steps.reduce((a, x) => a + (x.dur || 3200), 0) / 1000)}s</span>
          </button>
        )}
      </div>
      <div className="ex-bar">
        <button className="ex-btn" onClick={toggle} aria-label={playing ? "Pause" : done ? "Replay" : "Play"}>{playing ? "❚❚" : done ? "↺" : "▶"}</button>
        <button className="ex-btn" onClick={() => { setPlaying(false); go(step - 1); }} disabled={step === 0} aria-label="Previous step">‹</button>
        <button className="ex-btn" onClick={() => { setPlaying(false); go(step + 1); }} disabled={step === n - 1} aria-label="Next step">›</button>
        <div className="ex-track" role="group" aria-label="Chapters">
          {ex.steps.map((x, i) => (
            <button key={i} className={"ex-seg" + (i < step ? " done" : i === step ? " on" : "")} onClick={() => { go(i); }} aria-label={`Step ${i + 1}: ${x.cap}`} title={x.cap}>
              <i style={{ width: i < step ? "100%" : i === step ? `${Math.min(100, (elapsed / stepDur) * 100)}%` : 0 }} />
            </button>
          ))}
        </div>
        <span className="ex-count">{step + 1}/{n}</span>
        <button className="ex-btn ex-speed" onClick={() => setSpeed((v) => (v === 1 ? 1.5 : v === 1.5 ? 0.75 : 1))} aria-label="Playback speed">{speed}×</button>
      </div>
    </figure>
  );
}
