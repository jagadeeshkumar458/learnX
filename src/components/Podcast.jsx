import React, { useEffect, useMemo, useRef, useState } from "react";
import { HOSTS, EPISODES, hostById, minutesOf } from "../data/podcast.js";
import { say, stopSpeaking, speakable, canSpeak, voiceFor, onVoicesReady, unlockAudio } from "../lib/audio.js";
import { useProgress, today } from "../lib/progress.jsx";
import { confetti } from "../lib/confetti.js";

const KEY = "shipyard.podcast";
const load = () => { try { return JSON.parse(localStorage.getItem(KEY) || "{}"); } catch { return {}; } };
const store = (v) => { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch { /* ignore */ } };
const hash = (s) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) | 0, 7);

/* Expand an episode's script into spoken lines for a chosen pair of hosts. */
function buildScript(ep, pair) {
  const [A, B] = pair.map((id) => hostById[id]);
  const pick = (arr, k) => arr[Math.abs(k) % arr.length];
  const out = [
    { who: 0, text: `${pick(A.hello, ep.n)} Welcome to Shipyard Radio, episode ${ep.n}: ${ep.title}.` },
    { who: 1, text: `${pick(B.hello, ep.n + 1)} Glad to be here.` },
  ];
  ep.lines.forEach((l, i) => {
    const who = l.a ? 0 : 1, host = who ? B : A;
    out.push({ who, text: (l.r ? pick(host.react, i + ep.n) + " " : "") + (l.a || l.b) });
  });
  out.push({ who: 0, text: `That's episode ${ep.n}. ${pick(A.bye, ep.n)}` });
  out.push({ who: 1, text: `${pick(B.bye, ep.n)} See you next time on Shipyard Radio.` });
  return out;
}

function Avatar({ h, size = 44, on, talking }) {
  const initials = h.name.split(" ").map((w) => w[0]).join("").slice(0, 2);
  return (
    <span className={"pod-av" + (on ? " on" : "") + (talking ? " talking" : "")} style={{ "--c": h.color, width: size, height: size, fontSize: size * 0.36 }} title={`${h.name}, ${h.role}`}>
      {initials}
    </span>
  );
}

export default function Podcast() {
  const { S, award } = useProgress();
  const saved = useMemo(load, []);
  const [epId, setEpId] = useState(saved.ep || null);
  const [pairs, setPairs] = useState(saved.pairs || {});
  const [idx, setIdx] = useState(saved.idx || 0);
  const [playing, setPlaying] = useState(false);
  const [rate, setRate] = useState(saved.rate || 1);
  const [, setVoicesTick] = useState(0);
  const tokenRef = useRef(0), listRef = useRef(null);
  const ep = EPISODES.find((e) => e.id === epId);
  const pair = ep ? pairs[ep.id] || ep.hosts : null;
  const script = useMemo(() => (ep ? buildScript(ep, pair) : []), [ep, pair]);
  const hosts = pair ? pair.map((id) => hostById[id]) : [];

  useEffect(() => onVoicesReady(() => setVoicesTick((t) => t + 1)), []);
  useEffect(() => { store({ ep: epId, idx, pairs, rate }); }, [epId, idx, pairs, rate]);
  useEffect(() => () => { tokenRef.current++; stopSpeaking(); }, []);

  const voices = useMemo(() => {
    if (!hosts.length) return [];
    const a = voiceFor(hosts[0].g, hash(hosts[0].id));
    const b = voiceFor(hosts[1].g, hash(hosts[1].id), a);
    return [a, b];
  }, [hosts.map((h) => h.id).join()]); // eslint-disable-line react-hooks/exhaustive-deps

  const finish = () => {
    setPlaying(false);
    const k = "pod:" + ep.id;
    if (!S.chal[k]) { award(20, "Episode finished", (s) => { s.chal = { ...s.chal, [k]: today() }; }); confetti(80); }
  };

  /* Speak line i, then move on. */
  useEffect(() => {
    if (!playing || !ep) return;
    const my = ++tokenRef.current;
    const line = script[idx];
    if (!line) { finish(); return; }
    const h = hosts[line.who];
    const go = () => {
      if (tokenRef.current !== my) return;
      if (idx + 1 >= script.length) finish();
      else setTimeout(() => tokenRef.current === my && setIdx((i) => i + 1), 260);
    };
    if (canSpeak) say(speakable(line.text), rate * h.rate, { voice: voices[line.who], pitch: h.pitch }).then(go);
    else { const t = setTimeout(go, line.text.split(/\s+/).length * 380 / rate); return () => clearTimeout(t); }
  }, [playing, idx, epId, rate, voices]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const el = listRef.current?.querySelector(".pod-line.cur");
    if (el && listRef.current) listRef.current.scrollTo({ top: el.offsetTop - listRef.current.offsetTop - 60, behavior: "smooth" });
  }, [idx, epId]);

  const start = (id) => {
    unlockAudio(); tokenRef.current++; stopSpeaking();
    if (id !== epId) { setEpId(id); setIdx(0); }
    setPlaying(true);
    requestAnimationFrame(() => document.getElementById("now-playing")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };
  const toggle = () => { unlockAudio(); if (playing) { tokenRef.current++; stopSpeaking(); setPlaying(false); } else { if (idx >= script.length - 1 && !playing && S.chal["pod:" + ep.id]) setIdx(0); setPlaying(true); } };
  const jump = (i) => { tokenRef.current++; stopSpeaking(); setIdx(Math.max(0, Math.min(script.length - 1, i))); };
  const setHost = (slot, id) => {
    const next = [...pair]; next[slot] = id;
    if (next[0] === next[1]) next[1 - slot] = pair[slot];
    tokenRef.current++; stopSpeaking();
    setPairs({ ...pairs, [ep.id]: next });
  };
  const totalMin = EPISODES.reduce((a, e) => a + minutesOf(e), 0);
  const cur = script[idx];

  return (
    <>
      <div className="crumb"><a className="eyebrow" href="#home" style={{ textDecoration: "none" }}>All paths</a><span className="eyebrow">/</span></div>
      <section className="pod-hero">
        <div>
          <span className="eyebrow">Podcast · {EPISODES.length} episodes · ~{totalMin} min</span>
          <h1>Shipyard Radio</h1>
          <p>Two hosts, one topic, explained in depth. Listen on a walk, then come back and build it. Pick any two hosts from the cast for any episode.</p>
          <div className="cta-row">
            <button className="btn btn-primary" onClick={() => start(ep ? ep.id : EPISODES[0].id)}>{ep ? "▶ Resume" : "▶ Play episode 1"}</button>
          </div>
          {!canSpeak && <p className="tiny">Your browser has no speech voices, so episodes play as an auto-scrolling transcript.</p>}
        </div>
        <div className="pod-eq" aria-hidden="true">{[...Array(14)].map((_, i) => <i key={i} style={{ animationDelay: i * 0.08 + "s", animationPlayState: playing ? "running" : "paused" }} />)}</div>
      </section>

      {ep && (
        <section className="pod-now" id="now-playing" aria-label="Now playing">
          <div className="pod-now-head">
            <div>
              <span className="eyebrow">Now playing · Episode {ep.n} · {ep.course}</span>
              <h2>{ep.title}</h2>
            </div>
            <div className="pod-hosts">
              {hosts.map((h, k) => (
                <div className="pod-host" key={k}>
                  <Avatar h={h} size={52} on={cur && cur.who === k} talking={playing && cur && cur.who === k} />
                  <label className="pod-pick">
                    <span className="sr">Host {k + 1}</span>
                    <select value={h.id} onChange={(e) => setHost(k, e.target.value)} aria-label={`Choose host ${k + 1}`}>
                      {HOSTS.map((x) => <option key={x.id} value={x.id}>{x.name} · {x.role}</option>)}
                    </select>
                  </label>
                </div>
              ))}
            </div>
          </div>
          <div className="pod-controls">
            <button className="pod-btn" onClick={() => jump(idx - 1)} aria-label="Previous line">⏮</button>
            <button className="pod-btn big" onClick={toggle} aria-label={playing ? "Pause" : "Play"}>{playing ? "❚❚" : "▶"}</button>
            <button className="pod-btn" onClick={() => jump(idx + 1)} aria-label="Next line">⏭</button>
            <input type="range" min="0" max={script.length - 1} value={idx} onChange={(e) => jump(+e.target.value)} aria-label="Episode position" className="pod-seek" />
            <span className="tiny" style={{ margin: 0, minWidth: 54, textAlign: "right" }}>{idx + 1}/{script.length}</span>
            <button className="pod-btn" onClick={() => { tokenRef.current++; stopSpeaking(); setRate((r) => (r === 1 ? 1.25 : r === 1.25 ? 1.5 : r === 1.5 ? 0.85 : 1)); }} aria-label="Playback speed">{rate}×</button>
          </div>
          <ol className="pod-transcript" ref={listRef}>
            {script.map((l, i) => {
              const h = hosts[l.who];
              return (
                <li key={i} className={"pod-line" + (i === idx ? " cur" : "") + (i < idx ? " past" : "")} onClick={() => { jump(i); setPlaying(true); }}>
                  <b style={{ color: h.color }}>{h.name.split(" ")[0]}</b>
                  <span>{l.text}</span>
                </li>
              );
            })}
          </ol>
        </section>
      )}

      <div className="sec-title"><h2>Episodes</h2><span className="eyebrow">{EPISODES.filter((e) => S.chal["pod:" + e.id]).length} finished · +20 XP each</span></div>
      <ol className="pod-list">
        {EPISODES.map((e) => {
          const p = (pairs[e.id] || e.hosts).map((id) => hostById[id]);
          const done = !!S.chal["pod:" + e.id];
          return (
            <li key={e.id} className={"pod-ep" + (e.id === epId ? " active" : "")}>
              <button className="pod-play" onClick={() => (e.id === epId ? toggle() : start(e.id))} aria-label={`Play episode ${e.n}: ${e.title}`}>{e.id === epId && playing ? "❚❚" : "▶"}</button>
              <div className="pod-ep-body">
                <div className="pod-ep-top"><span className="pod-n">EP {String(e.n).padStart(2, "0")}</span><span className={"pill" + (e.course === "AI Engineer" ? " solo" : " live")}>{e.course}</span>{done && <span className="pill live">✓ Listened</span>}</div>
                <h3>{e.title}</h3>
                <p>{e.blurb}</p>
                <div className="pod-ep-meta"><span className="pod-pair">{p.map((h) => <Avatar key={h.id} h={h} size={26} />)}</span><span>{p.map((h) => h.name).join(" & ")}</span><span>· ~{minutesOf(e)} min</span></div>
              </div>
            </li>
          );
        })}
      </ol>

      <div className="sec-title" style={{ marginTop: 34 }}><h2>The cast</h2><span className="eyebrow">{HOSTS.length} hosts</span></div>
      <div className="pod-cast">
        {HOSTS.map((h) => (
          <div className="pod-card" key={h.id}>
            <Avatar h={h} size={46} />
            <div><b>{h.name}</b><span className="pod-role" style={{ color: h.color }}>{h.role}</span><small>{h.bio}</small></div>
          </div>
        ))}
      </div>
      <p className="tiny" style={{ marginTop: 18 }}>All hosts are original characters. Voices come from your device's built-in speech engine, tuned per host. Edge and Chrome on desktop have the most natural voices.</p>

      {ep && (
        <div className="pod-mini">
          <Avatar h={hosts[cur ? cur.who : 0]} size={34} talking={playing} />
          <div className="pod-mini-t"><b>{ep.title}</b><span>{cur ? hosts[cur.who].name : ""}</span></div>
          <button className="pod-btn" onClick={toggle} aria-label={playing ? "Pause" : "Play"}>{playing ? "❚❚" : "▶"}</button>
        </div>
      )}
    </>
  );
}
