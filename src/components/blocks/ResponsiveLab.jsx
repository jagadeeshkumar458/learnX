import React, { useEffect, useRef, useState } from "react";
import { useProgress } from "../../lib/progress.jsx";
import Editor from "./Editor.jsx";
import { ChallengeShell } from "./Challenge.jsx";

const DEVICES = [["📱", "Phone", 375], ["📱", "Large phone", 430], ["▭", "Tablet", 768], ["💻", "Laptop", 1024], ["🖥", "Desktop", 1280]];
const docOf = (v, meta = true) => `<!doctype html><html><head><meta charset="utf-8">${meta ? '<meta name="viewport" content="width=device-width, initial-scale=1">' : ""}<style>${v.css || ""}</style></head><body>${v.html || ""}</body></html>`;

/** Preview at a chosen width, scaled down to fit the panel. */
function DevicePreview({ v }) {
  const [width, setWidth] = useState(375);
  const box = useRef(null);
  const [avail, setAvail] = useState(500);
  useEffect(() => {
    const el = box.current;
    const ro = new ResizeObserver(() => setAvail(el.clientWidth - 16));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const scale = Math.min(1, avail / width);
  const h = 460;
  return (
    <div className="rw-panel">
      <div className="rw-bar">
        {DEVICES.map(([ic, name, w]) => <button key={w} className={"rw-dev" + (width === w ? " on" : "")} onClick={() => setWidth(w)} title={name + " (" + w + "px)"}><span aria-hidden="true">{ic}</span> {w}</button>)}
        <input type="range" min="300" max="1440" value={width} onChange={(e) => setWidth(+e.target.value)} aria-label="Viewport width" />
        <span className="rw-w">{width}px</span>
      </div>
      <div className="rw-stage" ref={box}>
        <div className="rw-frame" style={{ width: width * scale, height: h * scale }}>
          <iframe title={"Preview at " + width + "px"} sandbox="" srcDoc={docOf(v)} style={{ width, height: h, transform: `scale(${scale})`, transformOrigin: "0 0" }} />
        </div>
      </div>
      <div className="rw-ruler">{scale < 1 ? "Scaled to " + Math.round(scale * 100) + "% to fit" : "Actual size"} · media queries see a {width}px viewport</div>
    </div>
  );
}

/** `rwplay` block: HTML/CSS editor with a device-width preview. */
export function ResponsivePlayground({ b, k }) {
  const { S, update } = useProgress();
  const base = { html: b.html || "", css: b.css || "" };
  const [vals, setVals] = useState(() => ({ ...base, ...(S.code[k] || {}) }));
  const [shown, setShown] = useState(vals);
  useEffect(() => {
    const t = setTimeout(() => { setShown(vals); update((s) => { s.code = { ...s.code, [k]: vals }; }); }, 500);
    return () => clearTimeout(t);
  }, [vals]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className="play rwplay">
      {b.task && <div className="play-task"><span className="pill build">Try it</span><span dangerouslySetInnerHTML={{ __html: b.task }} /></div>}
      <div className="play-grid">
        <Editor tabs={["html", "css"]} values={vals} idPrefix={"rw-" + k.replace(/\W/g, "-")} onChange={(t, v) => setVals((o) => ({ ...o, [t]: v }))} onRun={() => setShown({ ...vals })} />
        <DevicePreview v={shown} />
      </div>
      <div className="pbar">
        <button className="mini" onClick={() => { setVals(base); update((s) => { const c = { ...s.code }; delete c[k]; s.code = c; }); }}>Reset</button>
        <span className="sp" />
        <span className="tiny" style={{ margin: 0 }}><span className="rw-badge">⇔ responsive</span> pick a device or drag the width</span>
      </div>
    </div>
  );
}

/** Render the page in same-origin, script-free iframes at each width, so media queries really apply. */
function renderAt(widths, v) {
  return Promise.all(widths.map((width) => new Promise((resolve) => {
    const fr = document.createElement("iframe");
    fr.setAttribute("sandbox", "allow-same-origin");
    fr.setAttribute("aria-hidden", "true");
    fr.tabIndex = -1;
    fr.style.cssText = `position:fixed;left:-20000px;top:0;width:${width}px;height:900px;border:0;opacity:0;pointer-events:none`;
    let done = false;
    const finish = () => { if (done) return; done = true; resolve({ width, fr }); };
    fr.onload = () => setTimeout(finish, 30);
    setTimeout(finish, 2500);
    fr.srcdoc = docOf(v);
    document.body.appendChild(fr);
  })));
}

/** `rwch` block: checks are fn(at) where at(width) → { d, w, $, $$, cs, rect, overflow }. */
export function ResponsiveChallenge({ b, k }) {
  const widths = b.widths || [375, 768, 1280];
  const evaluate = async (v) => {
    const frames = await renderAt(widths, v);
    const at = (width) => {
      const f = frames.find((x) => x.width === width) || frames[0];
      const d = f.fr.contentDocument, w = f.fr.contentWindow;
      return {
        d, w,
        $: (s) => d.querySelector(s), $$: (s) => Array.from(d.querySelectorAll(s)),
        cs: (el, p) => w.getComputedStyle(typeof el === "string" ? d.querySelector(el) : el, p),
        rect: (el) => (typeof el === "string" ? d.querySelector(el) : el).getBoundingClientRect(),
        overflow: () => d.documentElement.scrollWidth > width + 1,
        rows: (sel) => new Set(Array.from(d.querySelectorAll(sel)).map((e) => Math.round(e.getBoundingClientRect().top))).size,
        perRow: (sel) => { const tops = Array.from(d.querySelectorAll(sel)).map((e) => Math.round(e.getBoundingClientRect().top)); return tops.filter((t) => t === tops[0]).length; },
        sheetHas: (re) => Array.from(d.styleSheets).some((ss) => Array.from(ss.cssRules).some((r) => re.test(r.cssText))),
      };
    };
    const results = b.checks.map((ck) => { try { return !!ck.fn(at); } catch (e) { return false; } });
    frames.forEach((f) => f.fr.remove());
    return { results, error: "" };
  };
  return (
    <ChallengeShell b={b} k={k} tabs={["html", "css"]} starter={{ html: b.html || "", css: b.css || "" }} tests={b.checks} evaluate={evaluate}
      solution={b.solution} extra={(vals) => (
        <div className="chal-preview">
          <div className="chal-preview-h">Preview at different widths</div>
          <div className="rw-chal"><DevicePreview v={vals} /></div>
        </div>
      )} />
  );
}
