/* Audio for simulation videos: synthesized sound effects (Web Audio) and voice narration (Web Speech).
   Everything is generated in the browser, so there are no audio files to download. */

let ctx = null, master = null;
function ac() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = 0.22; master.connect(ctx.destination);
  }
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}
function noiseBuffer(c, secs) {
  const b = c.createBuffer(1, c.sampleRate * secs, c.sampleRate), d = b.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  return b;
}
function tone(c, { f = 440, f2, type = "sine", t = 0, dur = 0.15, vol = 0.5 }) {
  const o = c.createOscillator(), g = c.createGain(), now = c.currentTime + t;
  o.type = type; o.frequency.setValueAtTime(f, now);
  if (f2) o.frequency.exponentialRampToValueAtTime(f2, now + dur);
  g.gain.setValueAtTime(0.0001, now);
  g.gain.exponentialRampToValueAtTime(vol, now + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
  o.connect(g); g.connect(master); o.start(now); o.stop(now + dur + 0.02);
}
function noise(c, { t = 0, dur = 0.4, from = 400, to = 3000, vol = 0.35, q = 1.2 }) {
  const src = c.createBufferSource(); src.buffer = noiseBuffer(c, dur + 0.05);
  const f = c.createBiquadFilter(); f.type = "bandpass"; f.Q.value = q;
  const g = c.createGain(), now = c.currentTime + t;
  f.frequency.setValueAtTime(from, now); f.frequency.exponentialRampToValueAtTime(to, now + dur);
  g.gain.setValueAtTime(0.0001, now); g.gain.exponentialRampToValueAtTime(vol, now + dur * 0.4); g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
  src.connect(f); f.connect(g); g.connect(master); src.start(now); src.stop(now + dur + 0.05);
}

const FX = {
  tick: (c) => tone(c, { f: 1400, dur: 0.05, vol: 0.25 }),
  click: (c) => { noise(c, { dur: 0.05, from: 2500, to: 2000, vol: 0.5, q: 0.8 }); tone(c, { f: 900, dur: 0.04, vol: 0.2 }); },
  whoosh: (c) => noise(c, { t: 0.25, dur: 0.7, from: 300, to: 2600, vol: 0.4 }),
  pop: (c) => tone(c, { f: 520, f2: 1100, dur: 0.12, vol: 0.45 }),
  type: (c) => [0, 0.07, 0.15, 0.22, 0.31].forEach((t) => noise(c, { t, dur: 0.035, from: 3000, to: 2500, vol: 0.3, q: 2 })),
  ding: (c) => { tone(c, { f: 988, dur: 0.6, vol: 0.35 }); tone(c, { f: 1480, t: 0.02, dur: 0.5, vol: 0.18 }); },
  build: (c) => [0, 0.12, 0.24].forEach((t, i) => tone(c, { f: 330 * (1 + i * 0.25), t, dur: 0.18, vol: 0.3, type: "triangle" })),
  error: (c) => { tone(c, { f: 180, dur: 0.18, vol: 0.3, type: "sawtooth" }); tone(c, { f: 150, t: 0.18, dur: 0.25, vol: 0.3, type: "sawtooth" }); },
  success: (c) => [523, 659, 784, 1047].forEach((f, i) => tone(c, { f, t: i * 0.09, dur: 0.35, vol: 0.28, type: "triangle" })),
};
export function sfx(name) {
  const c = ac();
  if (!c || !FX[name]) return;
  try { FX[name](c); } catch { /* ignore audio errors */ }
}
/* Call from a user gesture (Play button) so browsers allow sound. */
export function unlockAudio() { ac(); }

/* ── Narration ── */
export const canSpeak = typeof window !== "undefined" && "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
let voice = null;
const PREFERRED = [/natural/i, /neural/i, /google uk english female/i, /samantha/i, /google us english/i, /aria|jenny|guy/i, /daniel|karen|moira|tessa/i];
function pickVoice() {
  if (!canSpeak) return null;
  const vs = speechSynthesis.getVoices().filter((v) => /^en(-|_|$)/i.test(v.lang));
  for (const re of PREFERRED) { const v = vs.find((x) => re.test(x.name)); if (v) return v; }
  return vs.find((v) => v.default) || vs[0] || null;
}
if (canSpeak) {
  voice = pickVoice();
  speechSynthesis.addEventListener?.("voiceschanged", () => { voice = pickVoice(); });
}

/* Turn on-screen captions into something that sounds natural when read aloud. */
export function speakable(text) {
  return text
    .replace(/i\+\+/g, "i plus plus").replace(/\+=/g, " plus equals ").replace(/===/g, " equals ")
    .replace(/(\d+)\s*<\s*(\d+)/g, "$1 less than $2").replace(/→/g, ", ").replace(/≈/g, "about ")
    .replace(/\[(\d+)\]/g, " $1 ").replace(/\|/g, " pipe ").replace(/-c\b/g, "dash c")
    .replace(/POST \/api\/profile/g, "POST to slash API slash profile").replace(/\bJSON\b/g, "Jason")
    .replace(/\bDOM\b/g, "DOM").replace(/\bCSSOM\b/g, "C S S O M").replace(/\bHTTP\b/g, "H T T P")
    .replace(/\buniq\b/g, "unique").replace(/\bdb\b/g, "database").replace(/([a-zA-Z])\.([a-zA-Z])/g, "$1 dot $2")
    .replace(/[“”"]/g, "").replace(/\s+/g, " ").trim();
}

let current = null;
/* Speak a line; resolves when it finishes or is cancelled. */
export function say(text, rate = 1, opts = {}) {
  if (!canSpeak) return Promise.resolve();
  stopSpeaking();
  return new Promise((resolve) => {
    const u = new SpeechSynthesisUtterance(text);
    const v = opts.voice || voice;
    if (v) u.voice = v;
    u.lang = v ? v.lang : "en-US";
    u.rate = Math.min(1.8, Math.max(0.6, rate * 1.02));
    u.pitch = Math.min(2, Math.max(0, opts.pitch ?? 1));
    let done = false;
    const finish = () => { if (!done) { done = true; if (current === u) current = null; resolve(); } };
    u.onend = finish; u.onerror = finish;
    current = u;
    // Safety net: some browsers never fire onend.
    setTimeout(finish, 1500 + text.split(/\s+/).length * 520 / u.rate);
    speechSynthesis.speak(u);
  });
}
export function stopSpeaking() {
  if (!canSpeak) return;
  current = null;
  speechSynthesis.cancel();
}

/* ── Voices for podcast hosts ── */
const FEMALE = /female|samantha|victoria|karen|moira|tessa|fiona|zira|aria|jenny|susan|hazel|libby|sonia|serena|allison|ava|kate|veena|lekha|heera|neerja|catherine|emma|joanna|salli|kimberly|ivy|natasha|clara|michelle/i;
export function englishVoices() {
  if (!canSpeak) return [];
  return speechSynthesis.getVoices().filter((v) => /^en(-|_|$)/i.test(v.lang));
}
/* Pick a voice matching the host's gender hint, varied by a seed, avoiding `avoid` when possible. */
export function voiceFor(gender, seed, avoid) {
  const all = englishVoices();
  if (!all.length) return null;
  const fem = all.filter((v) => FEMALE.test(v.name)), male = all.filter((v) => !FEMALE.test(v.name));
  let pool = gender === "f" ? (fem.length ? fem : all) : (male.length ? male : all);
  const natural = pool.filter((v) => /natural|neural|google/i.test(v.name));
  if (natural.length >= 2) pool = natural.concat(pool.filter((v) => !natural.includes(v)));
  let pick = pool[Math.abs(seed) % pool.length];
  if (avoid && pick === avoid && pool.length > 1) pick = pool[(Math.abs(seed) + 1) % pool.length];
  return pick;
}
export function onVoicesReady(fn) {
  if (!canSpeak) return () => {};
  const h = () => fn();
  speechSynthesis.addEventListener?.("voiceschanged", h);
  return () => speechSynthesis.removeEventListener?.("voiceschanged", h);
}
