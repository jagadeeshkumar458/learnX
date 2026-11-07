import React, { useEffect, useId, useMemo, useState } from "react";
import { useProgress } from "../../lib/progress.jsx";
import Editor from "./Editor.jsx";
import { ChallengeShell } from "./Challenge.jsx";
import { ReactPreview } from "./ReactLab.jsx";
import { runTests, coverageReport, pct, isTestFile } from "../../lib/testLab.js";

const appFiles = (files) => Object.fromEntries(Object.entries(files).filter(([f]) => !isTestFile(f) && !/(^|\/)setup(Tests)?\./.test(f)));

/** Vitest-style terminal output for one run. */
export function TestReport({ run, coverage }) {
  if (!run) return <div className="treport idle">Press <b>Run tests</b> to run every <code>*.test.jsx</code> file, like <code>npx vitest run</code>.</div>;
  if (run.errors && run.errors.length) return <div className="treport"><div className="tr-fail">Syntax error</div><pre className="tr-err">{run.errors.join("\n")}</pre></div>;
  const byFile = {};
  (run.testFiles || []).forEach((f) => { byFile[f] = []; });
  run.results.forEach((r) => { (byFile[r.file] = byFile[r.file] || []).push(r); });
  const passed = run.results.filter((r) => r.ok).length, failed = run.results.filter((r) => !r.ok && !r.skip).length, skipped = run.results.filter((r) => r.skip).length;
  const filesFailed = Object.keys(byFile).filter((f) => byFile[f].some((r) => !r.ok && !r.skip) || run.fileErrors.some((e) => e.file === f)).length;
  const total = Object.keys(byFile).length;
  const cov = coverage ? coverageReport(run) : null;
  return (
    <div className="treport" role="log" aria-label="Test results">
      {Object.keys(byFile).map((f) => {
        const rs = byFile[f], ferr = run.fileErrors.find((e) => e.file === f);
        const bad = ferr || rs.some((r) => !r.ok && !r.skip);
        return (
          <div key={f} className="tr-file">
            <div className={bad ? "tr-fail" : "tr-pass"}>{bad ? "❯" : "✓"} {f} <span className="tr-dim">({rs.length} test{rs.length === 1 ? "" : "s"})</span></div>
            {ferr && <pre className="tr-err">{ferr.err}</pre>}
            {rs.map((r, i) => (
              <div key={i} className="tr-test">
                <span className={r.skip ? "tr-skip" : r.ok ? "tr-pass" : "tr-fail"}>{r.skip ? (r.todo ? "□" : "↓") : r.ok ? "✓" : "×"}</span> {[...r.path, r.name].join(" › ")} {!r.skip && <span className="tr-dim">{r.ms}ms</span>}
                {!r.ok && !r.skip && <pre className="tr-err">{r.err}</pre>}
              </div>
            ))}
          </div>
        );
      })}
      {run.fileErrors.filter((e) => !e.file).map((e, i) => <pre key={i} className="tr-err">{e.err}</pre>)}
      {run.logs && run.logs.filter((l) => l.level === "warn" || l.level === "log").length > 0 && (
        <div className="tr-logs">{run.logs.filter((l) => l.level === "warn" || l.level === "log").slice(0, 8).map((l, i) => <div key={i} className={"tr-log " + l.level}>{l.level === "warn" ? "⚠ " : "› "}{l.m}</div>)}</div>
      )}
      <div className="tr-sum">
        <div><span className="tr-k">Test Files</span> {filesFailed ? <span className="tr-fail">{filesFailed} failed</span> : null}{filesFailed && total - filesFailed ? " | " : ""}{total - filesFailed ? <span className="tr-pass">{total - filesFailed} passed</span> : null} <span className="tr-dim">({total})</span></div>
        <div><span className="tr-k">Tests</span> {failed ? <span className="tr-fail">{failed} failed</span> : null}{failed && passed ? " | " : ""}{passed ? <span className="tr-pass">{passed} passed</span> : null}{skipped ? <span className="tr-dim"> | {skipped} skipped</span> : null}{!run.results.length ? <span className="tr-dim">no tests found</span> : null} <span className="tr-dim">({run.results.length})</span></div>
      </div>
      {cov && cov.length > 0 && (
        <div className="tr-cov">
          <div className="tr-k">Coverage report</div>
          <table>
            <thead><tr><th>File</th><th>% Stmts</th><th>% Funcs</th><th>Uncovered lines</th></tr></thead>
            <tbody>{cov.map((c) => {
              const tone = (p) => (p >= 80 ? "hi" : p >= 50 ? "mid" : "lo");
              return (<tr key={c.file}><td>{c.file}</td><td className={tone(pct(c.s))}>{pct(c.s)}</td><td className={tone(pct(c.f))}>{pct(c.f)}</td><td className="tr-dim">{c.lines.length ? c.lines.join(", ") : "—"}</td></tr>);
            })}</tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/** `tplay` block: edit app and test files, run the tests, see the app. */
export function TestPlayground({ b, k }) {
  const { S, update } = useProgress();
  const id = useId();
  const tabs = b.tabs || Object.keys(b.files);
  const [vals, setVals] = useState(() => ({ ...b.files, ...(S.code[k] || {}) }));
  const [run, setRun] = useState(null);
  const [busy, setBusy] = useState(false);
  const [view, setView] = useState("tests");
  const [cov, setCov] = useState(!!b.coverage);
  const [stamp, setStamp] = useState(0);
  const previewB = useMemo(() => ({ entry: b.entry || "src/main.jsx", api: true, html: '<div id="root"></div>' }), [b.entry]);
  const go = async (v = vals) => {
    setBusy(true); setView("tests");
    try { setRun(await runTests(v, { coverage: cov })); } finally { setBusy(false); }
  };
  useEffect(() => { if (b.autorun) go(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const change = (t, v) => { const next = { ...vals, [t]: v }; setVals(next); update((s) => { s.code = { ...s.code, [k]: next }; }); };
  return (
    <div className="play tplay">
      {b.task && <div className="play-task"><span className="pill build">Try it</span><span dangerouslySetInnerHTML={{ __html: b.task }} /></div>}
      <div className="play-grid">
        <Editor tabs={tabs} values={vals} idPrefix={"tp-" + k.replace(/\W/g, "-")} onChange={change} onRun={() => go()} />
        <div className="tpanel">
          <div className="ntabs" role="tablist">
            <button role="tab" aria-selected={view === "tests"} className={view === "tests" ? "on" : ""} onClick={() => setView("tests")}>🧪 Tests</button>
            <button role="tab" aria-selected={view === "app"} className={view === "app" ? "on" : ""} onClick={() => { setView("app"); setStamp(Date.now()); }}>👀 App</button>
            <span className="sp" />
            <label className="tcov"><input type="checkbox" checked={cov} onChange={(e) => setCov(e.target.checked)} /> coverage</label>
          </div>
          {view === "tests" ? <TestReport run={busy ? null : run} coverage={cov} /> : <ReactPreview files={appFiles(vals)} b={previewB} id={id} stamp={stamp} />}
          {busy && <div className="treport idle">Running tests…</div>}
        </div>
      </div>
      <div className="pbar">
        <button className="mini run" onClick={() => go()} disabled={busy}>{busy ? "Running…" : "▶ Run tests"}</button>
        <button className="mini" onClick={() => { setVals({ ...b.files }); setRun(null); update((s) => { const c = { ...s.code }; delete c[k]; s.code = c; }); }}>Reset</button>
        <span className="sp" />
        <span className="tiny" style={{ margin: 0 }}><span className="rw-badge">vitest</span> + Testing Library · Ctrl + Enter</span>
      </div>
    </div>
  );
}

/** `tch` block: write tests that pass on the real app and catch every bug in the mutants. */
export function TestChallenge({ b, k }) {
  const [last, setLast] = useState(null);
  const tabs = b.tabs || Object.keys(b.files);
  const tests = [
    { msg: b.passMsg || "Your tests pass on the working app" + (b.minTests ? " (at least " + b.minTests + " test" + (b.minTests > 1 ? "s" : "") + ")" : "") },
    ...(b.mutants || []).map((m) => ({ msg: "Catches the bug: " + m.bug })),
    ...(b.checks || []),
  ];
  const evaluate = async (v) => {
    const main = await runTests(v, { coverage: !!b.coverage });
    setLast(main);
    const realRuns = main.results.filter((r) => !r.skip);
    const okMain = !main.errors.length && !main.fileErrors.length && realRuns.length >= (b.minTests || 1) && realRuns.every((r) => r.ok);
    const mut = [];
    for (const m of b.mutants || []) {
      if (!okMain) { mut.push(false); continue; }
      const r = await runTests({ ...v, ...m.files });
      mut.push(!!r.fileErrors.length || r.results.some((x) => !x.ok && !x.skip));
    }
    const ctx = { src: (f) => v[f] || "", run: main, cov: (f) => coverageReport(main).find((c) => c.file === f) };
    const extra = (b.checks || []).map((c) => { try { return !!c.fn(ctx); } catch (e) { return false; } });
    let error = "";
    if (main.errors.length) error = main.errors[0];
    else if (main.fileErrors.length) error = main.fileErrors[0].err;
    else if (!realRuns.length) error = "No tests found. Write at least one it() or test() in a .test.jsx file.";
    else if (realRuns.length < (b.minTests || 1)) error = "Write at least " + b.minTests + " tests (you have " + realRuns.length + ").";
    else if (!okMain) error = "Some of your tests fail on the working app. A test should pass when the code is right. See the output below.";
    return { results: [okMain, ...mut, ...extra], error };
  };
  return (
    <ChallengeShell b={b} k={k} tabs={tabs} starter={b.files} tests={tests} evaluate={evaluate} solution={b.solution}
      extra={() => (
        <div className="chal-preview">
          <div className="chal-preview-h">Test output (working app)</div>
          <div style={{ margin: "8px 12px 12px" }}><TestReport run={last} coverage={!!b.coverage} /></div>
        </div>
      )} />
  );
}
