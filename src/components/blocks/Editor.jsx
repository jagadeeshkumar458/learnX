import React, { useState } from "react";

const LABEL = { html: "HTML", css: "CSS", js: "JS" };

/** Tabbed code editor. `values` is {tab: code}; Tab inserts spaces, Ctrl/⌘+Enter calls onRun. */
export default function Editor({ tabs, values, onChange, onRun, idPrefix }) {
  const [tab, setTab] = useState(tabs[0]);
  const onKey = (e) => {
    const ed = e.currentTarget;
    if (e.key === "Tab" && !e.shiftKey) {
      e.preventDefault();
      const s = ed.selectionStart, end = ed.selectionEnd;
      const next = ed.value.slice(0, s) + "  " + ed.value.slice(end);
      onChange(tab, next);
      requestAnimationFrame(() => { ed.selectionStart = ed.selectionEnd = s + 2; });
    }
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) { e.preventDefault(); onRun?.(); }
  };
  return (
    <div className="editor">
      {tabs.length > 1 && (
        <div className="tabs" role="tablist">
          {tabs.map((t) => (
            <button key={t} role="tab" aria-selected={t === tab} className={"tab" + (t === tab ? " on" : "")} onClick={() => setTab(t)}>{LABEL[t]}</button>
          ))}
        </div>
      )}
      <textarea
        id={`${idPrefix}-${tab}`}
        className="ed"
        spellCheck={false}
        aria-label={`${LABEL[tab]} editor`}
        value={values[tab] ?? ""}
        onChange={(e) => onChange(tab, e.target.value)}
        onKeyDown={onKey}
      />
    </div>
  );
}
