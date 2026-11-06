import React, { useEffect, useMemo, useRef, useState } from "react";
import { QUESTIONS, INTERVIEWERS } from "../data/interview.js";
import { hostById } from "../data/podcast.js";
import { byId, COURSES } from "../lib/course.js";
import { gradeConcept, gradeOutput, gradeCode, gradeWithAI, verdictOf } from "../lib/grader.js";
import { say, stopSpeaking, speakable, canSpeak, voiceFor, unlockAudio } from "../lib/audio.js";
import { useProgress, today } from "../lib/progress.jsx";
import { confetti } from "../lib/confetti.js";
import { CodeView } from "./blocks/Basic.jsx";

const KEY = "shipyard.interview";
const loadStore = () => { try { return JSON.parse(localStorage.getItem(KEY) || "{}"); } catch { return {}; } };
const saveStore = (v) => { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch { /* ignore */ } };
const shuffle = (a) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const hash = (s) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) | 0, 7);
const VERDICT = { strong: { label: "Strong", c: "var(--ok)" }, partial: { label: "Partial", c: "var(--gold)" }, weak: { label: "Needs work", c: "var(--bad)" } };
const MODELS = [["claude-sonnet-5-5", "Claude Sonnet 5.5 (best feedback)"], ["claude-haiku-5-5", "Claude Haiku 5.5 (faster, cheaper)"]];

/* Where to review a topic: a lesson id, or a module id → its first lesson. */
function reviewLink(id) {
  if (byId[id]) return byId[id];
  for (const c of COURSES) { const m = c.modules.find((x) => x.id === id); if (m) return m.lessons[0]; }
  return null;
}

/* Choose a balanced set: mostly concepts, plus a coding and an output question when available. */
function buildSet({ track, level, count }) {
  let pool = QUESTIONS.filter((q) => (track === "mixed" || q.track === track) && (level === "all" || q.level === level || (level === "mid" && q.level === "junior")));
  if (pool.length < count) pool = QUESTIONS.filter((q) => track === "mixed" || q.track === track);
  const code = shuffle(pool.filter((q) => q.type === "code")), out = shuffle(pool.filter((q) => q.type === "output"));
  const concept = shuffle(pool.filter((q) => q.type === "concept"));
  const set = [];
  if (count >= 5 && out.length) set.push(out[0]);
  if (count >= 5 && code.length) set.push(code[0]);
  if (count >= 10 && code.length > 1) set.push(code[1]);
  const topics = new Set();
  for (const q of concept) { if (set.length >= count) break; if (!topics.has(q.topic) || topics.size >= 4) { set.push(q); topics.add(q.topic); } }
  for (const q of concept) { if (set.length >= count) break; if (!set.includes(q)) set.push(q); }
  // concepts first, then output, then code, like a real interview
  return set.sort((a, b) => ["concept", "output", "code"].indexOf(a.type) - ["concept", "output", "code"].indexOf(b.type));
}

/* Speech-to-text for answering out loud (Chrome, Edge, Safari). */
const SR = typeof window !== "undefined" ? window.SpeechRecognition || window.webkitSpeechRecognition : null;
function useDictation(onText) {
  const [on, setOn] = useState(false);
  const rec = useRef(null), base = useRef("");
  const start = (current) => {
    if (!SR) return;
    stopSpeaking();
    const r = new SR(); r.lang = "en-US"; r.interimResults = true; r.continuous = true;
    base.current = current ? current.trim() + " " : "";
    r.onresult = (e) => { let t = ""; for (let i = 0; i < e.results.length; i++) t += e.results[i][0].transcript; onText(base.current + t); };
    r.onend = () => setOn(false); r.onerror = () => setOn(false);
    rec.current = r; r.start(); setOn(true);
  };
  const stop = () => { rec.current?.stop(); setOn(false); };
  useEffect(() => () => rec.current?.abort?.(), []);
  return { on, start, stop, supported: !!SR };
}

function Av({ h, size = 38, talking }) {
  return <span className={"pod-av" + (talking ? " talking" : "")} style={{ "--c": h.color, width: size, height: size, fontSize: size * 0.36 }}>{h.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}</span>;
}

function FeedbackCard({ r, open = true }) {
  const g = r.grade, v = VERDICT[g.verdict], q = r.q, link = reviewLink(q.lesson);
  return (
    <div className="iv-fb">
      <div className="iv-fb-head">
        <span className="iv-score" style={{ "--c": v.c }}>{g.score}</span>
        <div><b style={{ color: v.c }}>{v.label}</b><span className="tiny" style={{ margin: 0 }}>{g.graded === "ai" ? "Graded by Claude" : g.graded === "tests" ? "Graded by tests" : g.graded === "exact" ? "Exact answer" : "Graded against the rubric"}{r.skipped ? " · skipped" : ""}</span></div>
      </div>
      {g.feedback && <p className="iv-fb-text">{g.feedback}</p>}
      {g.wrong.length > 0 && <ul className="iv-list bad">{g.wrong.map((x, i) => <li key={i}>⚠ {x}</li>)}</ul>}
      {g.covered.length > 0 && <ul className="iv-list ok">{g.covered.map((x, i) => <li key={i}>✓ {x}</li>)}</ul>}
      {g.missing.length > 0 && <ul className="iv-list miss">{g.missing.map((x, i) => <li key={i}>✗ {x}</li>)}</ul>}
      <details open={open && g.verdict !== "strong"}>
        <summary>Model answer</summary>
        {q.type === "code" ? <CodeView code={q.model} lang="javascript" /> : <p>{q.model}</p>}
      </details>
      {link && <a className="iv-review" href={"#" + link.id}>Review: {link.title} →</a>}
    </div>
  );
}

export default function Interview() {
  const { award } = useProgress();
  const store = useMemo(loadStore, []);
  const [cfg, setCfg] = useState({ track: "fullstack", level: "junior", count: 8, mode: "practice", host: "rhett", voice: true, ai: false, model: MODELS[0][0], ...(store.cfg || {}) });
  const [apiKey, setApiKey] = useState(store.key || "");
  const [history, setHistory] = useState(store.history || []);
  const [phase, setPhase] = useState("setup");
  const [set, setSet] = useState([]);
  const [idx, setIdx] = useState(0);
  const [msgs, setMsgs] = useState([]);
  const [results, setResults] = useState([]);
  const [stage, setStage] = useState("answer"); // answer | followup | feedback | thinking
  const [draft, setDraft] = useState("");
  const [first, setFirst] = useState("");
  const [talking, setTalking] = useState(false);
  const [notice, setNotice] = useState("");
  const chatRef = useRef(null);
  const resultsRef = useRef([]);
  const host = hostById[cfg.host];
  const q = set[idx];
  const dict = useDictation(setDraft);
  const voice = useMemo(() => voiceFor(host.g, hash(host.id)), [host.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { saveStore({ cfg, key: apiKey, history }); }, [cfg, apiKey, history]);
  useEffect(() => () => stopSpeaking(), []);
  useEffect(() => { chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" }); }, [msgs, stage]);

  const speak = (text) => {
    if (!cfg.voice || !canSpeak) return;
    setTalking(true);
    say(speakable(text), host.rate, { voice, pitch: host.pitch }).then(() => setTalking(false));
  };
  const ai = (text, extra = {}) => { setMsgs((m) => [...m, { from: "ai", text, ...extra }]); };
  const askQuestion = (qq, n, lead) => {
    const intro = lead ? lead + " " : "";
    ai(intro + qq.q, { q: qq, n });
    speak(intro + qq.q + (qq.type === "output" ? " Look at the code on screen." : qq.type === "code" ? " Write your solution in the editor." : ""));
    setDraft(qq.type === "code" ? qq.starter : ""); setFirst(""); setStage("answer");
  };

  const begin = () => {
    unlockAudio();
    const s = buildSet(cfg);
    resultsRef.current = [];
    setSet(s); setIdx(0); setResults([]); setMsgs([]); setNotice(""); setPhase("live");
    const trackName = cfg.track === "ai" ? "AI engineering" : cfg.track === "mixed" ? "full-stack and AI engineering" : "full-stack development";
    const hello = `${pick(host.hello)} I'll be your interviewer today. We'll go through ${s.length} questions on ${trackName}. Explain your thinking out loud; partial answers still earn credit.`;
    setMsgs([{ from: "ai", text: hello }]);
    speak(hello);
    setTimeout(() => askQuestion(s[0], 1, "Let's start."), 400);
  };

  const finalize = (grade, answer, followAnswer, skipped) => {
    const r = { q, answer, followAnswer, grade, skipped };
    resultsRef.current = [...resultsRef.current, r];
    setResults(resultsRef.current);
    if (cfg.mode === "practice") {
      const react = grade.verdict === "strong" ? pick(host.react) : grade.verdict === "partial" ? "Good start. Let's look at what was missing." : "Okay. Let's go through that one together.";
      ai(react, { fb: r });
      speak(react + " " + (grade.feedback || ""));
      setStage("feedback");
    } else {
      ai(pick(["Noted.", "Okay, thank you.", "Got it.", "Alright."]));
      setTimeout(() => next(r), 700);
    }
  };

  const next = () => {
    stopSpeaking();
    if (idx + 1 >= set.length) return finish();
    const n = idx + 1, nq = set[n];
    const lead = nq.type === "code" ? "Let's do some coding." : nq.type === "output" && set[idx].type !== "output" ? "Quick one, read this code." : nq.topic !== set[idx].topic ? `Let's switch to ${nq.topic}.` : "Next question.";
    setIdx(n);
    askQuestion(nq, n + 1, lead);
  };

  const finish = () => {
    const rs = resultsRef.current;
    stopSpeaking();
    if (!rs.length) { setPhase("setup"); return; }
    setPhase("report");
    const avg = Math.round(rs.reduce((acc, r) => acc + r.grade.score, 0) / rs.length);
    const xp = 20 + rs.filter((r) => r.grade.verdict === "strong").length * 5;
    award(xp, "Interview completed", (st) => { st.chal = { ...st.chal, ["iv:" + Date.now()]: today() }; });
    if (avg >= 70) confetti(160);
    setHistory((h) => [{ at: new Date().toISOString(), track: cfg.track, level: cfg.level, score: avg, n: rs.length }, ...h].slice(0, 12));
    speak(`That's the end of the interview. Your overall score is ${avg}. ${avg >= 80 ? pick(host.react) : avg >= 60 ? "Solid work, with a few areas to polish." : "Keep practising. You'll get there."}`);
  };

  const submit = async (skip) => {
    if (stage === "thinking") return;
    dict.stop(); stopSpeaking();
    const answer = skip ? "" : draft;
    if (!skip && !answer.trim()) return;
    if (!skip) setMsgs((m) => [...m, { from: "me", text: q.type === "code" ? null : answer, code: q.type === "code" ? answer : null }]);
    else setMsgs((m) => [...m, { from: "me", text: "I'm not sure about this one." }]);
    setDraft("");
    if (skip) {
      const g = q.type === "code" ? { ...gradeCode(q, ""), score: 0 } : { score: 0, verdict: "weak", graded: "rubric", covered: [], missing: q.points ? q.points.filter((p) => !p.bonus).map((p) => p.c) : [], wrong: [], feedback: "Skipped. Saying \"I don't know, but here's how I'd find out\" is better than silence in a real interview." };
      if (stage === "followup") return finalize(gradeConcept(q, first), first, "", false);
      return finalize(g, "", "", true);
    }
    if (q.type === "code") return finalize(gradeCode(q, answer), answer);
    if (q.type === "output") return finalize(gradeOutput(q, answer), answer);

    const combined = stage === "followup" ? first + "\n" + answer : answer;
    let grade;
    if (cfg.ai && apiKey) {
      setStage("thinking");
      try { grade = await gradeWithAI(q, combined, { key: apiKey, model: cfg.model }); setNotice(""); }
      catch (e) { setNotice(`Claude grading failed (${e.message}). Using the built-in rubric instead.`); grade = gradeConcept(q, combined); }
    } else grade = gradeConcept(q, combined);

    if (stage !== "followup" && grade.score < 80 && grade.followup) {
      setFirst(answer); setStage("followup");
      const probe = `${pick(["Let me push on that a bit.", "Okay. Follow-up:", "Let's dig in."])} ${grade.followup}`;
      ai(probe); speak(probe);
      return;
    }
    finalize(grade, stage === "followup" ? first : answer, stage === "followup" ? answer : "");
  };

  /* ── Setup ── */
  if (phase === "setup") {
    const opt = (k, v, label) => <button key={v} className={"iv-opt" + (cfg[k] === v ? " on" : "")} onClick={() => setCfg({ ...cfg, [k]: v })} aria-pressed={cfg[k] === v}>{label}</button>;
    return (
      <>
        <div className="crumb"><a className="eyebrow" href="#home" style={{ textDecoration: "none" }}>All paths</a><span className="eyebrow">/</span></div>
        <section className="iv-hero">
          <div>
            <span className="eyebrow">Interview Coach · {QUESTIONS.length} questions from the course</span>
            <h1>Ready for your interview?</h1>
            <p>A mock technical interview built from what you've learned. Questions are asked out loud, you answer by typing or speaking, and every answer is checked against the key points interviewers listen for, with follow-up questions when something's missing.</p>
          </div>
        </section>
        <div className="iv-setup">
          <div className="iv-field"><span className="eyebrow">Track</span><div className="iv-opts">{opt("track", "fullstack", "Fullstack")}{opt("track", "ai", "AI Engineer")}{opt("track", "mixed", "Mixed")}</div></div>
          <div className="iv-field"><span className="eyebrow">Level</span><div className="iv-opts">{opt("level", "junior", "Junior")}{opt("level", "mid", "Mid-level")}{opt("level", "all", "Everything")}</div></div>
          <div className="iv-field"><span className="eyebrow">Length</span><div className="iv-opts">{opt("count", 5, "5 questions · ~10 min")}{opt("count", 8, "8 · ~15 min")}{opt("count", 12, "12 · ~25 min")}</div></div>
          <div className="iv-field"><span className="eyebrow">Mode</span><div className="iv-opts">{opt("mode", "practice", "Practice: feedback after each answer")}{opt("mode", "mock", "Mock: feedback at the end")}</div></div>
          <div className="iv-field"><span className="eyebrow">Interviewer</span>
            <div className="iv-hosts">{INTERVIEWERS.map((id) => { const h = hostById[id]; return (
              <button key={id} className={"iv-host" + (cfg.host === id ? " on" : "")} onClick={() => setCfg({ ...cfg, host: id })} aria-pressed={cfg.host === id}>
                <Av h={h} size={34} /><span><b>{h.name}</b><small style={{ color: h.color }}>{h.role}</small></span>
              </button>); })}</div>
          </div>
          <div className="iv-field iv-row">
            <label className="iv-check"><input type="checkbox" checked={cfg.voice} onChange={(e) => setCfg({ ...cfg, voice: e.target.checked })} disabled={!canSpeak} /> Interviewer speaks questions aloud{!canSpeak && " (not supported in this browser)"}</label>
            <span className="tiny" style={{ margin: 0 }}>{SR ? "🎙 You can answer by voice too." : "Voice answers need Chrome, Edge or Safari."}</span>
          </div>
          <details className="iv-ai" open={cfg.ai}>
            <summary><b>Deeper grading with Claude</b> <span className="pill">Optional</span></summary>
            <p className="tiny" style={{ margin: "8px 0" }}>The built-in rubric checks for key ideas. Claude understands meaning, catches subtle mistakes and writes tailored feedback and follow-ups. Uses your own Anthropic API key, which is stored only in this browser and sent only to Anthropic. Concept answers only; code and output questions are always graded locally.</p>
            <label className="iv-check"><input type="checkbox" checked={cfg.ai} onChange={(e) => setCfg({ ...cfg, ai: e.target.checked })} /> Use Claude to grade answers</label>
            <div className="iv-ai-grid">
              <label>API key<input id="iv-key" type="password" value={apiKey} placeholder="sk-ant-…" autoComplete="off" onChange={(e) => setApiKey(e.target.value.trim())} /></label>
              <label>Model<select id="iv-model" value={cfg.model} onChange={(e) => setCfg({ ...cfg, model: e.target.value })}>{MODELS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></label>
            </div>
            {apiKey && <button className="mini" onClick={() => setApiKey("")}>Forget my key</button>}
          </details>
          <div className="cta-row"><button className="btn btn-primary" onClick={begin}>Start interview with {host.name.split(" ")[0]} →</button></div>
        </div>
        {history.length > 0 && (
          <>
            <div className="sec-title" style={{ marginTop: 30 }}><h2>Past interviews</h2><span className="eyebrow">{history.length}</span></div>
            <div className="iv-hist">{history.map((h, i) => (
              <div key={i} className="iv-hist-row"><span className="iv-score sm" style={{ "--c": VERDICT[verdictOf(h.score)].c }}>{h.score}</span>
                <span>{h.track === "ai" ? "AI Engineer" : h.track === "mixed" ? "Mixed" : "Fullstack"} · {h.level} · {h.n} questions</span>
                <span className="tiny" style={{ margin: 0 }}>{new Date(h.at).toLocaleDateString()}</span></div>))}
            </div>
          </>
        )}
      </>
    );
  }

  /* ── Report ── */
  if (phase === "report") {
    const avg = Math.round(results.reduce((a, r) => a + r.grade.score, 0) / Math.max(1, results.length));
    const topics = {};
    results.forEach((r) => { (topics[r.q.topic] = topics[r.q.topic] || []).push(r.grade.score); });
    const tlist = Object.entries(topics).map(([t, s]) => [t, Math.round(s.reduce((a, b) => a + b, 0) / s.length)]).sort((a, b) => b[1] - a[1]);
    const signal = avg >= 80 ? ["Strong hire signal", "var(--ok)"] : avg >= 60 ? ["Lean hire: polish a few areas", "var(--gold)"] : ["Not yet: keep practising", "var(--bad)"];
    const weak = results.filter((r) => r.grade.score < 60).map((r) => reviewLink(r.q.lesson)).filter((l, i, a) => l && a.indexOf(l) === i);
    const R = 56, C = 2 * Math.PI * R;
    return (
      <>
        <section className="iv-report">
          <div className="iv-ring">
            <svg width="140" height="140" style={{ transform: "rotate(-90deg)" }}><circle cx="70" cy="70" r={R} fill="none" stroke="var(--line)" strokeWidth="10" /><circle cx="70" cy="70" r={R} fill="none" stroke={signal[1]} strokeWidth="10" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - avg / 100)} style={{ transition: "stroke-dashoffset 1.2s" }} /></svg>
            <div><b>{avg}</b><span>/ 100</span></div>
          </div>
          <div>
            <span className="eyebrow">Interview report · {host.name}</span>
            <h1 style={{ color: signal[1] }}>{signal[0]}</h1>
            <p>{results.filter((r) => r.grade.verdict === "strong").length} strong, {results.filter((r) => r.grade.verdict === "partial").length} partial and {results.filter((r) => r.grade.verdict === "weak").length} needing work, out of {results.length} questions.</p>
            <div className="cta-row"><button className="btn btn-primary" onClick={begin}>Try another interview</button><button className="btn btn-line" onClick={() => setPhase("setup")}>Change settings</button></div>
          </div>
        </section>
        <div className="dash" style={{ marginTop: 18 }}>
          <div className="panel">
            <span className="eyebrow">By topic</span>
            <div className="iv-topics">{tlist.map(([t, s]) => (
              <div key={t} className="iv-topic"><span>{t}</span><div className="bar"><span style={{ width: s + "%", background: VERDICT[verdictOf(s)].c }} /></div><b>{s}</b></div>
            ))}</div>
          </div>
          <div className="panel">
            <span className="eyebrow">What to review next</span>
            {weak.length ? <ul className="iv-next">{weak.map((l) => <li key={l.id}><a href={"#" + l.id}>{l.title}</a> <span className="tiny" style={{ margin: 0 }}>{l.mod.title}</span></li>)}</ul>
              : <p style={{ margin: "8px 0 0" }}>Nothing urgent. Try Mid-level or the other track next.</p>}
          </div>
        </div>
        <div className="sec-title" style={{ marginTop: 26 }}><h2>Question by question</h2></div>
        <ol className="iv-review-list">{results.map((r, i) => (
          <li key={i}>
            <details>
              <summary><span className="iv-score sm" style={{ "--c": VERDICT[r.grade.verdict].c }}>{r.grade.score}</span><span>{r.q.q}</span><span className="pill">{r.q.topic}</span></summary>
              <div className="iv-yours"><span className="eyebrow">Your answer</span>{r.q.type === "code" ? <CodeView code={r.answer || "(no code)"} lang="javascript" /> : <p>{r.answer || <i>Skipped</i>}{r.followAnswer && <><br /><b>Follow-up:</b> {r.followAnswer}</>}</p>}</div>
              <FeedbackCard r={r} />
            </details>
          </li>
        ))}</ol>
      </>
    );
  }

  /* ── Live interview ── */
  const progress = ((idx + (stage === "feedback" ? 1 : 0)) / set.length) * 100;
  return (
    <div className="iv-live">
      <div className="iv-top">
        <Av h={host} size={44} talking={talking} />
        <div className="iv-top-t"><b>{host.name}</b><span>{host.role} · Question {idx + 1} of {set.length}{q ? ` · ${q.topic}` : ""}</span></div>
        <button className="mini" onClick={() => { stopSpeaking(); finish(); }}>End interview</button>
      </div>
      <div className="bar" style={{ margin: "10px 0 0" }}><span style={{ width: progress + "%" }} /></div>
      {notice && <div className="callout warn" style={{ marginTop: 10 }}><span className="ci">Note</span><div>{notice}</div></div>}
      <div className="iv-chat" ref={chatRef} aria-live="polite">
        {msgs.map((m, i) => m.from === "ai" ? (
          <div key={i} className="iv-msg ai">
            <Av h={host} size={30} />
            <div className="iv-bubble">
              {m.n && <span className="eyebrow">Question {m.n} · {m.q.topic} · {m.q.type === "code" ? "Coding" : m.q.type === "output" ? "Predict the output" : m.q.level}</span>}
              <p>{m.text}</p>
              {m.q && m.q.code && <CodeView code={m.q.code} lang="javascript" />}
              {m.fb && <FeedbackCard r={m.fb} />}
            </div>
          </div>
        ) : (
          <div key={i} className="iv-msg me"><div className="iv-bubble">{m.code ? <CodeView code={m.code} lang="javascript" /> : <p>{m.text}</p>}</div></div>
        ))}
        {stage === "thinking" && <div className="iv-msg ai"><Av h={host} size={30} /><div className="iv-bubble"><span className="iv-dots"><i /><i /><i /></span></div></div>}
      </div>

      {stage === "feedback" ? (
        <div className="iv-composer done"><button className="btn btn-primary" onClick={next}>{idx + 1 >= set.length ? "See my report →" : "Next question →"}</button></div>
      ) : q && (
        <div className="iv-composer">
          {stage === "followup" && <span className="eyebrow" style={{ color: "var(--accent)" }}>Follow-up · answer just this part</span>}
          {q.type === "code" ? (
            <textarea id="iv-code" className="ed iv-code" value={draft} spellCheck={false} onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Tab") { e.preventDefault(); const t = e.currentTarget, s = t.selectionStart; setDraft(draft.slice(0, s) + "  " + draft.slice(t.selectionEnd)); requestAnimationFrame(() => { t.selectionStart = t.selectionEnd = s + 2; }); } if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) { e.preventDefault(); submit(); } }} aria-label="Code answer" />
          ) : (
            <textarea id="iv-answer" className="iv-input" rows={q.type === "output" ? 1 : 4} value={draft} placeholder={q.type === "output" ? "Type exactly what it prints…" : dict.on ? "Listening… speak your answer" : "Type your answer, or press the mic and say it…"}
              onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey || q.type === "output") && !e.shiftKey) { e.preventDefault(); submit(); } }} aria-label="Your answer" />
          )}
          <div className="iv-actions">
            {dict.supported && q.type === "concept" && (
              <button className={"iv-mic" + (dict.on ? " on" : "")} onClick={() => (dict.on ? dict.stop() : dict.start(draft))} aria-label={dict.on ? "Stop dictation" : "Answer by voice"}>{dict.on ? "■ Stop" : "🎙 Speak"}</button>
            )}
            <button className="mini" onClick={() => submit(true)}>{stage === "followup" ? "Skip follow-up" : "I don't know"}</button>
            <span className="sp" />
            <span className="tiny" style={{ margin: 0 }}>Ctrl + Enter</span>
            <button className="btn btn-primary" onClick={() => submit()} disabled={!draft.trim()}>{q.type === "code" ? "Run tests & submit" : "Submit answer"}</button>
          </div>
        </div>
      )}
    </div>
  );
}
