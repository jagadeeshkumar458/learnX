import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { COURSE, byId } from "./course.js";
import { confetti } from "./confetti.js";

const KEY = "shipyard.v1";
export const GOAL = 100; // daily XP goal
export const today = () => new Date().toLocaleDateString("en-CA");
const yesterday = () => new Date(Date.now() - 864e5).toLocaleDateString("en-CA");

export const level = (xp) => Math.floor(Math.sqrt(xp / 60)) + 1;
export const levelFloor = (lv) => (lv - 1) * (lv - 1) * 60;
export const rank = (lv) =>
  ["Deckhand", "Deckhand", "Rigger", "Builder", "Shipwright", "Navigator", "First Mate", "Captain", "Admiral"][Math.min(lv, 8)];

const EMPTY = { done: {}, xp: 0, quiz: {}, chal: {}, act: {}, streak: 0, last: null, steps: {}, code: {}, badges: {}, theme: null, lastLesson: null };

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    const s = raw ? { ...EMPTY, ...JSON.parse(raw) } : { ...EMPTY };
    if (s.last !== today() && s.last !== yesterday()) s.streak = 0;
    return s;
  } catch {
    return { ...EMPTY };
  }
}

export const nDone = (S) => Object.keys(S.done).filter((k) => byId[k]).length;
export const modDone = (S, m) => m.lessons.filter((l) => S.done[l.id]).length;
export const modPct = (S, m) => {
  const live = m.lessons.filter((l) => l.body).length || m.lessons.length;
  return Math.round((modDone(S, m) / live) * 100);
};

export const BADGES = [
  { id: "first", ico: "🚀", t: "First Launch", d: "Finish your first lesson", ok: (S) => nDone(S) >= 1 },
  { id: "quiz5", ico: "🧠", t: "Sharp Mind", d: "Ace 5 quizzes", ok: (S) => Object.values(S.quiz).filter((v) => v === "right").length >= 5 },
  { id: "chal3", ico: "🐛", t: "Bug Squasher", d: "Pass 3 code challenges", ok: (S) => Object.keys(S.chal).length >= 3 },
  { id: "intro", ico: "⚓", t: "Onboarded", d: "Complete the Introduction", ok: (S) => modPct(S, COURSE.modules[0]) === 100 },
  { id: "htmlcss", ico: "🎨", t: "Pixel Pusher", d: "Complete HTML & CSS", ok: (S) => modPct(S, COURSE.modules[1]) === 100 },
  { id: "js", ico: "⚡", t: "Script Kid", d: "Complete JS Fundamentals", ok: (S) => modPct(S, COURSE.modules[2]) === 100 },
  { id: "streak3", ico: "🔥", t: "On Fire", d: "3-day learning streak", ok: (S) => S.streak >= 3 },
  { id: "xp500", ico: "🏆", t: "Deckhand → Captain", d: "Earn 500 XP", ok: (S) => S.xp >= 500 },
];

const Ctx = createContext(null);
export const useProgress = () => useContext(Ctx);

export function ProgressProvider({ children }) {
  const [S, setS] = useState(load);
  const [toasts, setToasts] = useState([]);
  const [levelUp, setLevelUp] = useState(null);
  const tid = useRef(0);

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(S)); } catch {}
  }, [S]);

  useEffect(() => {
    if (S.theme) document.documentElement.dataset.theme = S.theme;
    else delete document.documentElement.dataset.theme;
  }, [S.theme]);

  const toast = useCallback((node) => {
    const id = ++tid.current;
    setToasts((t) => [...t, { id, node }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2700);
  }, []);

  // Keep a ref of the latest state so actions compute synchronously (StrictMode-safe side effects).
  const ref = useRef(S);
  const commit = useCallback((s) => { ref.current = s; setS(s); }, []);

  /** Apply a state change that also grants XP, updates streak/activity and unlocks badges. */
  const award = useCallback((n, label, mutate) => {
    const prev = ref.current;
    const s = { ...prev, act: { ...prev.act }, badges: { ...prev.badges } };
    if (mutate) mutate(s);
    const before = level(s.xp);
    s.xp += n;
    const t = today();
    if (s.last !== t) { s.streak = s.last === yesterday() ? s.streak + 1 : 1; s.last = t; }
    s.act[t] = (s.act[t] || 0) + n;
    const newly = BADGES.filter((b) => !s.badges[b.id] && b.ok(s));
    newly.forEach((b) => (s.badges[b.id] = t));
    commit(s);
    toast(<><span className="x">+{n} XP</span> {label}</>);
    newly.forEach((b, i) => setTimeout(() => toast(<>{b.ico} Badge unlocked: {b.t}</>), 900 + i * 400));
    if (level(s.xp) > before) setTimeout(() => { setLevelUp(level(s.xp)); confetti(220); }, 700);
  }, [toast, commit]);

  const update = useCallback((mutate) => { const s = { ...ref.current }; mutate(s); commit(s); }, [commit]);
  useEffect(() => {
    if (!levelUp) return;
    const onKey = (e) => e.key === "Escape" && setLevelUp(null);
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [levelUp]);

  const reset = useCallback(() => commit({ ...EMPTY }), [commit]);

  return (
    <Ctx.Provider value={{ S, award, update, reset, toast }}>
      {children}
      <div className="toasts" aria-live="polite">
        {toasts.map((t) => <div className="toast" key={t.id}>{t.node}</div>)}
      </div>
      {levelUp && (
        <div className="modal-bg" onClick={(e) => e.target === e.currentTarget && setLevelUp(null)}>
          <div className="levelup" role="dialog" aria-label="Level up">
            <div className="eyebrow">Level up</div>
            <div className="lv">{levelUp}</div>
            <p>You're now a <b>{rank(levelUp)}</b>. Keep shipping.</p>
            <button className="btn btn-primary" autoFocus onClick={() => setLevelUp(null)}>Continue</button>
          </div>
        </div>
      )}
    </Ctx.Provider>
  );
}
