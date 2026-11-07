/* A small accessibility checker for the Accessible Development labs.
   audit(root) returns issues; speakTree(root) returns what a screen reader would announce, in order.
   It covers the course's rules (WCAG 2.2 basics): text alternatives, contrast, labels, link and button
   names, headings, lists, landmarks, ARIA misuse and keyboard access. It is a teaching aid, not a
   replacement for testing with real assistive technology. */

/* ── colour ── */
function parseColor(c) {
  const m = String(c).match(/rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,\s/]+([\d.]+%?))?\s*\)/);
  if (!m) return null;
  let a = m[4] === undefined ? 1 : m[4].endsWith("%") ? parseFloat(m[4]) / 100 : parseFloat(m[4]);
  return [Number(m[1]), Number(m[2]), Number(m[3]), a];
}
const lum = ([r, g, b]) => {
  const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};
export const contrastRatio = (fg, bg) => { const a = lum(fg), b = lum(bg); return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05); };
const blend = (top, bottom) => { const a = top[3]; return [top[0] * a + bottom[0] * (1 - a), top[1] * a + bottom[1] * (1 - a), top[2] * a + bottom[2] * (1 - a), 1]; };
function backgroundOf(el, stopAt) {
  const layers = [];
  for (let e = el; e && e.nodeType === 1; e = e.parentElement) {
    const cs = getComputedStyle(e);
    if (cs.backgroundImage && cs.backgroundImage !== "none") return null;   // can't know: image or gradient
    const c = parseColor(cs.backgroundColor);
    if (c && c[3] > 0) { layers.push(c); if (c[3] >= 1) break; }
    if (e === stopAt) break;
  }
  let bg = [255, 255, 255, 1];
  for (let i = layers.length - 1; i >= 0; i--) bg = blend(layers[i], bg);
  return bg;
}
/** Hex helper for messages. */
const hex = (c) => "#" + c.slice(0, 3).map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");

/* ── accessible names ── */
const hidden = (el) => {
  for (let e = el; e && e.nodeType === 1; e = e.parentElement) {
    if (e.hidden || e.getAttribute("aria-hidden") === "true") return true;
    const cs = getComputedStyle(e);
    if (cs.display === "none" || cs.visibility === "hidden") return true;
  }
  return false;
};
const clean = (s) => String(s || "").replace(/\s+/g, " ").trim();
export function accName(el, root) {
  const lb = el.getAttribute("aria-labelledby");
  if (lb) {
    const t = lb.split(/\s+/).map((id) => { const x = (root.getElementById ? root.getElementById(id) : root.querySelector("#" + CSS.escape(id))); return x ? clean(x.textContent) : ""; }).join(" ");
    if (clean(t)) return clean(t);
  }
  if (clean(el.getAttribute("aria-label"))) return clean(el.getAttribute("aria-label"));
  const tag = el.tagName;
  if (tag === "IMG" || (tag === "INPUT" && el.type === "image")) return clean(el.getAttribute("alt"));
  if (["INPUT", "SELECT", "TEXTAREA"].includes(tag)) {
    if (["submit", "button", "reset"].includes(el.type)) return clean(el.value || (el.type === "submit" ? "Submit" : el.type === "reset" ? "Reset" : ""));
    if (el.id) { const l = root.querySelector('label[for="' + CSS.escape(el.id) + '"]'); if (l && clean(l.textContent)) return clean(l.textContent); }
    const wrap = el.closest("label");
    if (wrap && clean(wrap.textContent)) return clean(wrap.textContent);
    if (clean(el.getAttribute("title"))) return clean(el.getAttribute("title"));
    return "";
  }
  // name from content
  let t = "";
  el.childNodes.forEach((n) => {
    if (n.nodeType === 3) t += n.textContent;
    else if (n.nodeType === 1 && !hidden(n)) t += " " + accName(n, root) + " ";
  });
  if (clean(t)) return clean(t);
  if (tag === "SVG" || tag === "svg") { const ti = el.querySelector("title"); if (ti) return clean(ti.textContent); }
  return clean(el.getAttribute("title"));
}

const FOCUSABLE = "a[href], button, input:not([type=hidden]), select, textarea, [tabindex], summary, [contenteditable=true]";
const snippet = (el) => { const h = el.outerHTML.replace(/\s+/g, " "); return h.length > 90 ? h.slice(0, 87) + "…" : h; };
const VAGUE = /^(click here|here|read more|more|learn more|link|this|go|details|click)$/i;

/** Audit the content of `root` (an element). Returns [{ rule, level: "error"|"warn"|"tip", msg, el, html }]. */
export function audit(root) {
  const out = [];
  const add = (rule, level, msg, el) => out.push({ rule, level, msg, el, html: el ? snippet(el) : "" });
  const doc = root.getRootNode ? root.getRootNode() : document;
  const q = (s) => Array.from(root.querySelectorAll(s));

  // images
  q("img").forEach((img) => {
    if (hidden(img)) return;
    if (!img.hasAttribute("alt")) add("alt", "error", "Image has no alt attribute. Describe it, or use alt=\"\" if it's purely decorative.", img);
    else {
      const a = img.getAttribute("alt").trim().toLowerCase();
      if (/^(image|picture|photo|graphic)( of)?\b/.test(a)) add("alt-redundant", "warn", "Alt text starts with \"" + a.split(" ").slice(0, 2).join(" ") + "\". Screen readers already say it's an image.", img);
      if (/\.(png|jpe?g|gif|svg|webp)$/.test(a)) add("alt-filename", "warn", "Alt text looks like a file name. Describe what the image shows.", img);
    }
  });
  // form controls
  q("input, select, textarea").forEach((el) => {
    if (el.type === "hidden" || hidden(el)) return;
    if (["submit", "button", "reset", "image"].includes(el.type)) { if (!accName(el, doc)) add("button-name", "error", "This button has no text.", el); return; }
    if (!accName(el, doc)) add("label", "error", el.placeholder ? "Field only has a placeholder. Placeholders disappear when you type; add a <label>." : "Form field has no label. Add a <label for=\"…\"> (or aria-label).", el);
  });
  q("label[for]").forEach((l) => { if (!root.querySelector("#" + CSS.escape(l.getAttribute("for")))) add("label-for", "error", "This label's for=\"" + l.getAttribute("for") + "\" doesn't match any field's id.", l); });
  // radio groups
  const radios = {};
  q("input[type=radio]").forEach((r) => { (radios[r.name] = radios[r.name] || []).push(r); });
  Object.entries(radios).forEach(([name, rs]) => { if (rs.length > 1 && !rs[0].closest("fieldset") && !rs[0].closest("[role=radiogroup]")) add("radiogroup", "warn", "Radio buttons \"" + name + "\" aren't grouped. Wrap them in a <fieldset> with a <legend> so the question is announced.", rs[0]); });
  q("fieldset").forEach((f) => { if (!f.querySelector("legend")) add("legend", "warn", "<fieldset> without a <legend>: the group has no name.", f); });
  // links and buttons
  q("a").forEach((a) => {
    if (hidden(a)) return;
    if (!a.hasAttribute("href")) { if (a.getAttribute("onclick") || a.getAttribute("role") === "button") add("link-href", "error", "A link without href isn't keyboard focusable. Use a <button> for actions.", a); return; }
    const name = accName(a, doc);
    if (!name) add("link-name", "error", "Link has no text. Add text, aria-label, or alt text on the image inside it.", a);
    else if (VAGUE.test(name)) add("link-vague", "warn", "Link text \"" + name + "\" doesn't say where it goes. Screen reader users often browse a list of links out of context.", a);
    if (a.getAttribute("target") === "_blank" && !/new (tab|window)/i.test(name)) add("link-newtab", "tip", "Opens in a new tab without warning. Consider adding \"(opens in a new tab)\".", a);
  });
  q("button, [role=button]").forEach((b) => {
    if (hidden(b)) return;
    const name = accName(b, doc);
    if (!name) add("button-name", "error", "Button has no accessible name. Add text or an aria-label (icon-only buttons need one).", b);
    else if (!/[\p{L}\p{N}]/u.test(name)) add("button-symbol", "warn", "This button's only name is \"" + name + "\". Screen readers may read it as a symbol name or skip it; add an aria-label.", b);
  });
  // fake buttons
  q("[onclick]").forEach((el) => {
    if (["BUTTON", "A", "INPUT", "SELECT", "SUMMARY"].includes(el.tagName)) return;
    if (el.getAttribute("role") !== "button" || !el.hasAttribute("tabindex")) add("fake-button", "error", "A clickable <" + el.tagName.toLowerCase() + "> can't be reached or pressed with a keyboard. Use a <button>.", el);
  });
  q("[tabindex]").forEach((el) => { if (Number(el.getAttribute("tabindex")) > 0) add("tabindex", "warn", "tabindex=\"" + el.getAttribute("tabindex") + "\" changes the natural tab order. Use 0 or -1, and fix the HTML order instead.", el); });
  q("[aria-hidden=true]").forEach((el) => { if (el.matches(FOCUSABLE) || el.querySelector(FOCUSABLE)) add("hidden-focus", "error", "aria-hidden content contains something focusable. Keyboard users can reach it, but screen readers say nothing.", el); });
  // headings
  const hs = q("h1,h2,h3,h4,h5,h6").filter((h) => !hidden(h));
  if (!hs.length && root.textContent.trim().length > 200) add("headings", "warn", "No headings. Screen reader users navigate by headings; add an <h1> and section headings.", null);
  if (hs.length && !hs.some((h) => h.tagName === "H1")) add("h1", "warn", "No <h1>. Each page should have one main heading.", hs[0]);
  if (hs.filter((h) => h.tagName === "H1").length > 1) add("h1-multi", "tip", "More than one <h1>. Usually a page has one.", hs.filter((h) => h.tagName === "H1")[1]);
  hs.forEach((h, i) => { if (i && Number(h.tagName[1]) > Number(hs[i - 1].tagName[1]) + 1) add("heading-skip", "warn", "Heading level jumps from " + hs[i - 1].tagName.toLowerCase() + " to " + h.tagName.toLowerCase() + ". Don't skip levels; style with CSS instead.", h); });
  hs.forEach((h) => { if (!accName(h, doc)) add("heading-empty", "error", "Empty heading.", h); });
  // lists
  q("li").forEach((li) => { const p = li.parentElement; if (p && !["UL", "OL", "MENU"].includes(p.tagName) && p.getAttribute("role") !== "list") add("list", "error", "<li> must be inside a <ul> or <ol>.", li); });
  // landmarks
  if (root.textContent.trim().length > 300 && !root.querySelector("main, [role=main]")) add("main", "tip", "No <main> landmark. It lets screen reader users jump straight to the content.", null);
  // ARIA misuse
  q("[role]").forEach((el) => {
    const r = el.getAttribute("role");
    const ok = ["button", "link", "navigation", "main", "banner", "contentinfo", "region", "dialog", "alert", "status", "img", "list", "listitem", "tab", "tablist", "tabpanel", "checkbox", "switch", "radiogroup", "radio", "search", "presentation", "none", "heading", "progressbar", "menu", "menuitem", "group", "complementary", "log", "timer", "tooltip", "alertdialog", "form", "article", "separator", "textbox", "combobox", "option", "listbox"];
    if (!ok.includes(r)) add("role", "error", "role=\"" + r + "\" isn't a valid ARIA role.", el);
    const native = { BUTTON: "button", NAV: "navigation", MAIN: "main", A: "link", UL: "list", LI: "listitem" }[el.tagName];
    if (native && native === r) add("role-redundant", "tip", "role=\"" + r + "\" is redundant on <" + el.tagName.toLowerCase() + ">. The first rule of ARIA: prefer native HTML.", el);
  });
  // text: contrast and size
  const seen = new Set();
  q("*").forEach((el) => {
    if (hidden(el) || ["SCRIPT", "STYLE", "SVG", "svg"].includes(el.tagName)) return;
    const direct = Array.from(el.childNodes).some((n) => n.nodeType === 3 && n.textContent.trim());
    if (!direct) return;
    const cs = getComputedStyle(el);
    const fg = parseColor(cs.color);
    const bg = backgroundOf(el, root);
    const size = parseFloat(cs.fontSize), bold = Number(cs.fontWeight) >= 700;
    if (size && size < 12 && !seen.has("size" + el.tagName)) { add("text-size", "warn", "Text is " + size + "px. Small text is hard to read; aim for 16px body text and avoid going under 12px.", el); seen.add("size" + el.tagName); }
    if (!fg || !bg) return;
    const ratio = contrastRatio(fg[3] < 1 ? blend(fg, bg) : fg, bg);
    const large = size >= 24 || (size >= 18.66 && bold);
    const need = large ? 3 : 4.5;
    if (ratio < need) add("contrast", "error", "Contrast " + ratio.toFixed(2) + ":1 (" + hex(fg) + " on " + hex(bg) + "). " + (large ? "Large" : "Normal") + " text needs at least " + need + ":1.", el);
  });
  return out;
}

const ROLE = (el) => {
  const r = el.getAttribute("role");
  if (r) return r;
  const t = el.tagName;
  if (/^H[1-6]$/.test(t)) return "heading";
  return { A: el.hasAttribute("href") ? "link" : null, BUTTON: "button", IMG: el.getAttribute("alt") === "" ? null : "image", NAV: "navigation", MAIN: "main", HEADER: "banner", FOOTER: "contentinfo", UL: "list", OL: "list", LI: "listitem", SELECT: "combo box", TEXTAREA: "edit text", ASIDE: "complementary", FORM: "form", TABLE: "table", FIELDSET: "group", DIALOG: "dialog" }[t] ||
    (t === "INPUT" ? ({ checkbox: "checkbox", radio: "radio button", submit: "button", button: "button", reset: "button", range: "slider", search: "search field" }[el.type] || "edit text") : null);
};

/** What a screen reader would announce, in reading order: [{ role, name, text, el }]. */
export function speakTree(root) {
  const doc = root.getRootNode ? root.getRootNode() : document;
  const out = [];
  const walk = (node) => {
    node.childNodes.forEach((n) => {
      if (n.nodeType === 3) { const t = clean(n.textContent); if (t) out.push({ role: "text", name: t }); return; }
      if (n.nodeType !== 1 || hidden(n) || ["SCRIPT", "STYLE", "TEMPLATE"].includes(n.tagName)) return;
      const role = ROLE(n);
      if (role && !["presentation", "none"].includes(role)) {
        if (["link", "button", "heading", "image", "checkbox", "radio button", "edit text", "combo box", "slider", "search field", "img"].includes(role)) {
          let name = accName(n, doc);
          let extra = "";
          if (role === "heading") extra = ", level " + n.tagName.slice(1);
          if (role === "checkbox" || role === "radio button") extra = n.checked ? ", checked" : ", not checked";
          if (n.getAttribute("aria-pressed")) extra = n.getAttribute("aria-pressed") === "true" ? ", pressed" : ", not pressed";
          if (n.getAttribute("aria-expanded")) extra = n.getAttribute("aria-expanded") === "true" ? ", expanded" : ", collapsed";
          if (n.required) extra += ", required";
          if (n.disabled || n.getAttribute("aria-disabled") === "true") extra += ", dimmed";
          out.push({ role: role === "img" ? "image" : role, name: name || (role === "image" ? "unlabelled image" : ""), extra, el: n });
          return;
        }
        if (["navigation", "main", "banner", "contentinfo", "complementary", "region", "form", "dialog", "list", "group", "table", "alert", "status"].includes(role)) {
          const name = n.getAttribute("aria-label") || (role === "group" && n.querySelector("legend") ? clean(n.querySelector("legend").textContent) : "");
          const count = role === "list" ? ", " + n.querySelectorAll(":scope > li").length + " items" : "";
          out.push({ role: role + " start", name, extra: count });
          walk(n);
          out.push({ role: role + " end", name: "" });
          return;
        }
      }
      walk(n);
    });
  };
  walk(root);
  return out;
}

/** The order Tab moves through focusable elements. */
export function tabOrder(root) {
  const doc = root.getRootNode ? root.getRootNode() : document;
  const els = Array.from(root.querySelectorAll(FOCUSABLE)).filter((e) => !hidden(e) && !e.disabled && e.getAttribute("tabindex") !== "-1");
  const pos = els.filter((e) => Number(e.getAttribute("tabindex")) > 0).sort((a, b) => Number(a.getAttribute("tabindex")) - Number(b.getAttribute("tabindex")));
  return pos.concat(els.filter((e) => !(Number(e.getAttribute("tabindex")) > 0))).map((el) => ({ el, role: ROLE(el) || el.tagName.toLowerCase(), name: accName(el, doc) }));
}
