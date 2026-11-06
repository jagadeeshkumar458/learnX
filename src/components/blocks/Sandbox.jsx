import React, { useEffect, useMemo, useRef, useState } from "react";
import { useProgress, today } from "../../lib/progress.jsx";
import { confetti } from "../../lib/confetti.js";
import { makeFS, run, complete, api, display } from "../../lib/shell.js";
import { makeRepo, runGit, isAncestor, teammatePush } from "../../lib/git.js";

/* Goal checklist that awards XP once every goal passes. */
function useGoals(k, goals, check) {
  const { S, award } = useProgress();
  const [state, setState] = useState(() => goals.map(() => false));
  const won = !!S.chal[k];
  const awarded = useRef(won);
  const stateRef = useRef(state);
  const evaluate = () => {
    // goals stay ticked once achieved, even if a later command changes the output
    const res = goals.map((g, i) => { if (stateRef.current[i]) return true; try { return !!check(g); } catch { return false; } });
    stateRef.current = res;
    setState(res);
    if (goals.length && res.every(Boolean) && !awarded.current) {
      awarded.current = true;
      award(25, "Mission complete", (s) => { s.chal = { ...s.chal, [k]: today() }; });
      confetti(90);
    }
  };
  return { state, won, evaluate };
}

function Goals({ goals, state, won }) {
  if (!goals.length) return null;
  return (
    <div className="goals">
      <div className="eyebrow" style={{ marginBottom: 6 }}>{won ? "✓ Mission complete" : "Mission · +25 XP"}</div>
      {goals.map((g, i) => (
        <div key={i} className={"test" + (state[i] || won ? " pass" : "")}><i /><span dangerouslySetInnerHTML={{ __html: g.msg }} /></div>
      ))}
    </div>
  );
}

/* Shared terminal-style console used by both sandboxes. */
function Console({ prompt, onRun, onComplete, intro, lines, setLines, label }) {
  const [input, setInput] = useState("");
  const [hist, setHist] = useState([]);
  const [hi, setHi] = useState(-1);
  const box = useRef(null), inp = useRef(null);
  useEffect(() => { if (box.current) box.current.scrollTop = box.current.scrollHeight; }, [lines]);

  const submit = () => {
    const cmd = input;
    setInput(""); setHi(-1);
    if (cmd.trim()) setHist((h) => [...h, cmd]);
    const r = onRun(cmd);
    if (r.clear) { setLines([]); return; }
    setLines((l) => [...l, { t: "cmd", p: prompt, v: cmd }, ...(r.err ? [{ t: "err", v: r.err }] : r.out ? [{ t: "out", v: r.out }] : [])]);
  };
  const onKey = (e) => {
    if (e.key === "Enter") { e.preventDefault(); submit(); }
    else if (e.key === "ArrowUp") { e.preventDefault(); if (!hist.length) return; const n = hi < 0 ? hist.length - 1 : Math.max(0, hi - 1); setHi(n); setInput(hist[n]); }
    else if (e.key === "ArrowDown") { e.preventDefault(); if (hi < 0) return; const n = hi + 1; if (n >= hist.length) { setHi(-1); setInput(""); } else { setHi(n); setInput(hist[n]); } }
    else if (e.key === "Tab" && onComplete) { e.preventDefault(); setInput(onComplete(input)); }
    else if (e.key === "l" && e.ctrlKey) { e.preventDefault(); setLines([]); }
    else if (e.key === "c" && e.ctrlKey && !window.getSelection()?.toString()) { e.preventDefault(); setLines((l) => [...l, { t: "cmd", p: prompt, v: input + "^C" }]); setInput(""); }
  };
  return (
    <div className="term" onClick={() => !window.getSelection()?.toString() && inp.current?.focus()}>
      <div className="term-bar"><span /><span /><span /><b>{label}</b></div>
      <div className="term-body" ref={box}>
        {intro && <div className="t-out t-dim">{intro}</div>}
        {lines.map((l, i) => l.t === "cmd"
          ? <div key={i} className="t-line"><span className="t-prompt">{l.p}</span>{l.v}</div>
          : <div key={i} className={l.t === "err" ? "t-err" : "t-out"}>{l.v}</div>)}
        <div className="t-line">
          <span className="t-prompt">{prompt}</span>
          <input ref={inp} className="t-input" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={onKey}
            spellCheck={false} autoCapitalize="off" autoComplete="off" aria-label="Terminal input" />
        </div>
      </div>
    </div>
  );
}

/* ── Terminal sandbox: { t: "term", seed, goals, intro, start } ── */
export function Terminal({ b, k }) {
  const make = () => { const sh = makeFS(b.seed); if (b.start) run(sh, "cd " + b.start); sh.history = []; return sh; };
  const [sh, setSh] = useState(make);
  const [lines, setLines] = useState([]);
  const [, force] = useState(0);
  const goals = b.goals || [];
  const { state, won, evaluate } = useGoals(k, goals, (g) => g.fn(api(sh)));
  const prompt = `dev@shipyard:${display(sh.cwd)}$ `;
  const reset = () => { setSh(make()); setLines([]); };
  return (
    <div className="sandbox">
      {b.task && <div className="play-task"><span className="pill build">Try it</span><span dangerouslySetInnerHTML={{ __html: b.task }} /></div>}
      <div className={"sandbox-grid" + (goals.length ? "" : " solo")}>
        <Console label="bash — sandbox" prompt={prompt} lines={lines} setLines={setLines}
          intro={b.intro || "Type 'help' to list commands. ↑ recalls history, Tab completes names."}
          onRun={(c) => { const r = run(sh, c); force((n) => n + 1); setTimeout(evaluate, 0); return r; }}
          onComplete={(l) => complete(sh, l)} />
        <Goals goals={goals} state={state} won={won} />
      </div>
      <div className="pbar"><button className="mini" onClick={reset}>Reset files</button><span className="sp" /><span className="tiny" style={{ margin: 0 }}>Nothing here touches your real computer</span></div>
    </div>
  );
}

/* ── Git graph: commits on lanes, branch labels, HEAD and origin markers ── */
const LANE_COLORS = ["var(--accent)", "var(--ok)", "#5a6cf0", "var(--gold)", "var(--bad)"];
function GitGraph({ repo }) {
  const ids = repo.order;
  const X = (n) => 34 + n * 64, Y = (lane) => 40 + lane * 66;
  const lanes = Math.max(1, ...ids.map((id) => repo.commits[id].lane + 1));
  const w = Math.max(320, X(ids.length - 1) + 90), h = Y(lanes - 1) + 54;
  const labels = {};
  Object.entries(repo.branches).forEach(([b, id]) => (labels[id] = labels[id] || []).push(b));
  const remoteAt = repo.remote ? repo.remote.main : null;
  return (
    <div className="gitgraph" role="img" aria-label={`Commit graph with ${ids.length} commits on branches ${Object.keys(repo.branches).join(", ")}`}>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
        {ids.map((id) => repo.commits[id].parents.map((p) => {
          const c = repo.commits[id], pc = repo.commits[p];
          const x1 = X(pc.n), y1 = Y(pc.lane), x2 = X(c.n), y2 = Y(c.lane);
          const d = y1 === y2 ? `M${x1},${y1} L${x2},${y2}` : `M${x1},${y1} C${x1 + 30},${y1} ${x2 - 30},${y2} ${x2},${y2}`;
          return <path key={id + p} d={d} fill="none" stroke={LANE_COLORS[(c.merge ? pc.lane : c.lane) % 5]} strokeWidth="2.5" opacity=".8" />;
        }))}
        {ids.map((id) => {
          const c = repo.commits[id], x = X(c.n), y = Y(c.lane), col = LANE_COLORS[c.lane % 5];
          const isHead = repo.branches[repo.head] === id;
          return (
            <g key={id} className="gg-commit">
              <circle cx={x} cy={y} r={isHead ? 11 : 9} fill={c.teammate ? "var(--surface)" : col} stroke={col} strokeWidth="2.5" />
              {isHead && <circle cx={x} cy={y} r="16" fill="none" stroke={col} strokeDasharray="3 3" />}
              <text x={x} y={y + 26} textAnchor="middle" className="gg-id">{id.slice(0, 5)}</text>
              <title>{`${id}  ${c.msg}`}</title>
            </g>
          );
        })}
        {Object.entries(labels).map(([id, bs]) => {
          const c = repo.commits[id]; if (!c) return null;
          const x = X(c.n), y = Y(c.lane);
          return bs.map((bn, i) => (
            <g key={bn}>
              <rect x={x + 14} y={y - 30 - i * 18} rx="4" width={bn.length * 7 + (bn === repo.head ? 22 : 10)} height="16" fill={bn === repo.head ? "var(--ink)" : "var(--sunk)"} />
              <text x={x + 19} y={y - 18 - i * 18} className="gg-label" fill={bn === repo.head ? "var(--bg)" : "var(--ink)"}>{bn === repo.head ? "▸ " : ""}{bn}</text>
            </g>
          ));
        })}
        {remoteAt && repo.commits[remoteAt] && (
          <text x={X(repo.commits[remoteAt].n)} y={Y(repo.commits[remoteAt].lane) + 40} textAnchor="middle" className="gg-remote">origin/main</text>
        )}
      </svg>
    </div>
  );
}

/* ── Git sandbox: { t: "git", goals, remote, teammate } ── */
export function GitLab({ b, k }) {
  const make = () => makeRepo({ remote: b.remote });
  const [repo, setRepo] = useState(make);
  const [lines, setLines] = useState([]);
  const [, force] = useState(0);
  const goals = b.goals || [];
  const helpers = useMemo(() => ({ isAncestor: (a, c) => isAncestor(repo, a, c) }), [repo]);
  const { state, won, evaluate } = useGoals(k, goals, (g) => g.fn(repo, helpers));
  const reset = () => { setRepo(make()); setLines([]); };
  const staged = Object.keys(repo.staged), work = Object.keys(repo.work);
  return (
    <div className="sandbox">
      {b.task && <div className="play-task"><span className="pill build">Try it</span><span dangerouslySetInnerHTML={{ __html: b.task }} /></div>}
      <GitGraph repo={repo} />
      <div className="areas">
        <div><span className="eyebrow">Working tree</span>{work.length ? work.map((f) => <code key={f}>{f}</code>) : <small>clean</small>}</div>
        <div><span className="eyebrow">Staging area</span>{staged.length ? staged.map((f) => <code key={f}>{f}</code>) : <small>empty</small>}</div>
        <div><span className="eyebrow">On branch</span><code>{repo.head}</code></div>
      </div>
      <div className={"sandbox-grid" + (goals.length ? "" : " solo")}>
        <Console label="git — sandbox" prompt={`~/learnx (${repo.head})$ `} lines={lines} setLines={setLines}
          intro={"Simulated Git. Try: edit index.html → git add . → git commit -m \"msg\". Type 'help' for all commands."}
          onRun={(c) => { const r = runGit(repo, c); force((n) => n + 1); setTimeout(evaluate, 0); return r; }} />
        <Goals goals={goals} state={state} won={won} />
      </div>
      <div className="pbar">
        <button className="mini" onClick={reset}>Reset repo</button>
        {b.teammate && <button className="mini" onClick={() => { teammatePush(repo, "Teammate: fix typo"); force((n) => n + 1); setLines((l) => [...l, { t: "out", v: "🔔 A teammate just pushed a commit to origin/main." }]); }}>Simulate teammate push</button>}
        <span className="sp" />
      </div>
    </div>
  );
}
