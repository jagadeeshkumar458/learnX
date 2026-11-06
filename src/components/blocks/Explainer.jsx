import React, { useCallback, useEffect, useRef, useState } from "react";
import { EXPLAINERS } from "../explainers/index.jsx";
import { sfx, say, stopSpeaking, speakable, canSpeak, unlockAudio } from "../../lib/audio.js";

const PREF_KEY = "shipyard.audio";
function loadPrefs() {
  try { return { sound: true, voice: true, ...JSON.parse(localStorage.getItem(PREF_KEY) || "{}") }; }
  catch { return { sound: true, voice: true }; }
}
const savePrefs = (p) => { try { localStorage.setItem(PREF_KEY, JSON.stringify(p)); } catch { /* ignore */ } };
let seq = 0;

/* Simulation-video player: animated SVG scenes driven step by step, with narration and sound effects.
   Block: { t: "video", name: "loop" } — see components/explainers for the scenes. */
export default function Explainer({ b }) {
  const ex = EXPLAINERS[b.name];
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [started, setStarted] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [prefs, setPrefs] = useState(loadPrefs);
  const [talking, setTalking] = useState(false);
  const id = useRef(++seq);
  const speaking = useRef(false), token = useRef(0), quietSince = useRef(0);
  const raf = useRef(0), last = useRef(0);
  const n = ex ? ex.steps.length : 0;
  const voiceOn = prefs.sound && prefs.voice && canSpeak;

  const line = (i) => speakable(ex.steps[i].say || ex.steps[i].cap);
  // Step length: the authored duration, or longer if the narration needs it.
  const stepDur = (i) => {
    const base = ex.steps[i].dur || 3200;
    const talk = voiceOn ? line(i).split(/\s+/).length * 360 + 700 : 0;
    return Math.max(base, talk) / speed;
  };

  /* Play the sound effect and narration for a step. */
  const cue = useCallback((i) => {
    if (!ex) return;
    if (prefs.sound && ex.fx && ex.fx[i]) sfx(ex.fx[i]);
    if (!voiceOn) { speaking.current = false; setTalking(false); return; }
    const my = ++token.current;
    speaking.current = true; setTalking(true);
    say(line(i), speed).then(() => {
      if (token.current !== my) return;
      speaking.current = false; setTalking(false); quietSince.current = performance.now();
    });
  }, [ex, prefs.sound, voiceOn, speed]); // eslint-disable-line react-hooks/exhaustive-deps

  const silence = () => { token.current++; speaking.current = false; setTalking(false); stopSpeaking(); };

  // Narrate whenever the step changes (after the learner has pressed play once).
  useEffect(() => { if (started) cue(step); }, [step, started]); // eslint-disable-line react-hooks/exhaustive-deps

  // Stop talking when leaving the lesson; pause if another video starts.
  useEffect(() => {
    const other = (e) => { if (e.detail !== id.current) { setPlaying(false); } };
    addEventListener("sy-explainer-play", other);
    return () => { removeEventListener("sy-explainer-play", other); silence(); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!playing || !ex) return;
    const dur = stepDur(step);
    last.current = performance.now();
    const tick = (now) => {
      const dt = now - last.current; last.current = now;
      setElapsed((e) => {
        const ne = Math.min(dur, e + dt);
        const quiet = !speaking.current && now - quietSince.current > 450;
        if (ne >= dur && quiet) {
          if (step < n - 1) { setStep((s) => s + 1); return 0; }
          setPlaying(false); return dur;
        }
        return ne;
      });
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [playing, step, speed, ex, n, voiceOn]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!ex) return null;
  const go = (s) => {
    const t = Math.max(0, Math.min(n - 1, s));
    setStarted(true); setElapsed(0);
    if (t === step) cue(t); else setStep(t);
  };
  const toggle = () => {
    unlockAudio();
    if (playing) { setPlaying(false); silence(); return; }
    dispatchEvent(new CustomEvent("sy-explainer-play", { detail: id.current }));
    const atEnd = step === n - 1 && elapsed > 0;
    if (!started) { setStarted(true); }
    else if (atEnd) { setStep(0); setElapsed(0); if (step === 0) cue(0); }
    else cue(step); // resume: replay this step's narration
    setPlaying(true);
  };
  const setPref = (k) => {
    const next = { ...prefs, [k]: !prefs[k] };
    setPrefs(next); savePrefs(next);
    if ((k === "sound" && !next.sound) || (k === "voice" && !next.voice)) silence();
    else unlockAudio();
  };
  const onKey = (e) => {
    if (e.key === " " || e.key === "k") { e.preventDefault(); toggle(); }
    if (e.key === "ArrowRight") { e.preventDefault(); setPlaying(false); go(step + 1); }
    if (e.key === "ArrowLeft") { e.preventDefault(); setPlaying(false); go(step - 1); }
    if (e.key === "m") { e.preventDefault(); setPref("sound"); }
  };
  const Scene = ex.Scene;
  const cur = ex.steps[step];
  const dur = stepDur(step);
  const done = step === n - 1 && !playing && elapsed > 0;
  const total = Math.round(ex.steps.reduce((a, _, i) => a + stepDur(i) * speed, 0) / 1000);

  return (
    <figure className="explainer" tabIndex={0} onKeyDown={onKey} aria-label={`Simulation video: ${ex.title}`}>
      <div className="ex-stage">
        <div className="ex-title"><span className="ex-kicker">{ex.kicker || "How it works"}</span><span className="ex-h">{ex.title}</span></div>
        <svg viewBox="0 0 640 330" className="ex-svg" role="img" aria-label={cur.cap}>
          <Scene s={step} />
        </svg>
        <figcaption className={"ex-cap" + (talking ? " talking" : "")} key={step}>
          {talking && <span className="ex-wave" aria-hidden="true"><i /><i /><i /><i /></span>}{cur.cap}
        </figcaption>
        {!started && (
          <button className="ex-poster" onClick={toggle} aria-label={`Play: ${ex.title}`}>
            <span className="ex-play">▶</span>
            <span>Play simulation · ~{total}s{voiceOn ? " · with narration" : prefs.sound ? " · with sound" : ""}</span>
            <span className="ex-hint">🎧 Sound on for the best experience</span>
          </button>
        )}
      </div>
      <div className="ex-bar">
        <button className="ex-btn" onClick={toggle} aria-label={playing ? "Pause" : done ? "Replay" : "Play"}>{playing ? "❚❚" : done ? "↺" : "▶"}</button>
        <button className="ex-btn" onClick={() => { setPlaying(false); go(step - 1); }} disabled={step === 0} aria-label="Previous step">‹</button>
        <button className="ex-btn" onClick={() => { setPlaying(false); go(step + 1); }} disabled={step === n - 1} aria-label="Next step">›</button>
        <div className="ex-track" role="group" aria-label="Chapters">
          {ex.steps.map((x, i) => (
            <button key={i} className={"ex-seg" + (i < step ? " done" : i === step ? " on" : "")} onClick={() => go(i)} aria-label={`Step ${i + 1}: ${x.cap}`} title={x.cap}>
              <i style={{ width: i < step ? "100%" : i === step ? `${Math.min(100, (elapsed / dur) * 100)}%` : 0 }} />
            </button>
          ))}
        </div>
        <span className="ex-count">{step + 1}/{n}</span>
        {canSpeak && (
          <button className={"ex-btn ex-voice" + (prefs.voice && prefs.sound ? " on" : "")} onClick={() => setPref("voice")} disabled={!prefs.sound}
            aria-pressed={prefs.voice} aria-label={prefs.voice ? "Turn narration off" : "Turn narration on"} title="Narration">🗣</button>
        )}
        <button className="ex-btn" onClick={() => setPref("sound")} aria-pressed={prefs.sound} aria-label={prefs.sound ? "Mute" : "Unmute"} title="Sound (M)">{prefs.sound ? "🔊" : "🔇"}</button>
        <button className="ex-btn ex-speed" onClick={() => setSpeed((v) => (v === 1 ? 1.25 : v === 1.25 ? 1.5 : v === 1.5 ? 0.75 : 1))} aria-label="Playback speed">{speed}×</button>
      </div>
    </figure>
  );
}
