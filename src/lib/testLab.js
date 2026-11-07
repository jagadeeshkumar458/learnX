/* The in-browser testing lab: a small Vitest + React Testing Library + user-event + msw + axe look-alike.
   Learner files are compiled with the TypeScript compiler (app files can be instrumented for coverage),
   then run in a sandboxed iframe with React 19. Test files (*.test.js/jsx) register tests with
   describe/it/expect; the runtime runs them in order and posts the results back.

   Grading test-writing: a challenge runs the learner's tests against the working app (they must pass)
   and against "mutants", copies of the app with one bug each (at least one test must fail). */

import { loadCompiler, vendorUrl } from "./reactLab.js";
import { MOCK_API_SCRIPT } from "./mockApi.js";

export { loadCompiler };
export const isTestFile = (f) => /\.(test|spec)\.(jsx?|tsx?)$/.test(f);
const isCode = (f) => /\.(jsx?|tsx?)$/.test(f);

/* ── coverage instrumentation (a TypeScript "before" transformer) ── */
function covTransformer(ts, file, meta) {
  return (ctx) => (sf) => {
    const f = ctx.factory;
    const line = (n) => sf.getLineAndCharacterOfPosition(n.getStart(sf)).line + 1;
    const call = (kind, id) => f.createCallExpression(f.createIdentifier("__syCov"), undefined, [f.createStringLiteral(file), f.createStringLiteral(kind), f.createNumericLiteral(id)]);
    const hit = (kind, id) => f.createExpressionStatement(call(kind, id));
    const bodies = new Map(), concise = new Map();
    const skip = (s) => ts.isImportDeclaration(s) || ts.isFunctionDeclaration(s) || ts.isInterfaceDeclaration(s) || ts.isTypeAliasDeclaration(s) || (ts.isExportDeclaration && ts.isExportDeclaration(s));
    function stmts(list) {
      const out = [];
      for (const s of list) {
        const v = ts.visitNode(s, visit);
        if (skip(s)) { out.push(v); continue; }
        const id = meta.s.length;
        meta.s.push(line(s));
        out.push(hit("s", id), v);
      }
      return out;
    }
    function visit(node) {
      if (ts.isFunctionLike(node) && node.body) {
        const id = meta.f.length;
        let name = node.name && node.name.getText ? node.name.getText(sf) : "";
        if (!name && node.parent && ts.isVariableDeclaration(node.parent)) name = node.parent.name.getText(sf);
        meta.f.push({ line: line(node), name: name || "(anonymous)" });
        (ts.isBlock(node.body) ? bodies : concise).set(node.body, id);
      }
      let res;
      if (ts.isBlock(node)) res = f.updateBlock(node, [...(bodies.has(node) ? [hit("f", bodies.get(node))] : []), ...stmts(node.statements)]);
      else if (ts.isCaseClause(node)) res = f.updateCaseClause(node, ts.visitNode(node.expression, visit), stmts(node.statements));
      else if (ts.isDefaultClause(node)) res = f.updateDefaultClause(node, stmts(node.statements));
      else res = ts.visitEachChild(node, visit, ctx);
      if (concise.has(node)) res = f.createParenthesizedExpression(f.createBinaryExpression(call("f", concise.get(node)), f.createToken(ts.SyntaxKind.CommaToken), res));
      return res;
    }
    return f.updateSourceFile(sf, stmts(sf.statements));
  };
}

/** Compile files. Returns { mods, css, errors, src, cov: { file: { s: [lines], f: [{line,name}] } } }. */
export function compileTests(ts, files, { coverage } = {}) {
  const mods = {}, errors = [], cov = {};
  let css = "";
  for (const [name, code] of Object.entries(files)) {
    if (/\.css$/i.test(name)) { css += code + "\n"; continue; }
    if (!isCode(name)) continue;
    const instrument = coverage && !isTestFile(name) && !/setup|config/i.test(name) && !/(^|\/)main\.[jt]sx?$/.test(name);
    const meta = { s: [], f: [] };
    const r = ts.transpileModule(code, {
      fileName: name,
      reportDiagnostics: true,
      compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
      transformers: instrument ? { before: [covTransformer(ts, name, meta)] } : undefined,
    });
    for (const d of r.diagnostics || []) {
      const pos = d.file && d.start != null ? d.file.getLineAndCharacterOfPosition(d.start) : null;
      errors.push(`${name}${pos ? `:${pos.line + 1}:${pos.character + 1}` : ""}  ${ts.flattenDiagnosticMessageText(d.messageText, "\n")}`);
    }
    mods[name] = r.outputText;
    if (instrument) cov[name] = meta;
  }
  return { mods, css, errors, src: files, cov };
}

/* ───────────────────────── runtime (inside the iframe; must be self-contained) ───────────────────────── */
function syTestRuntime(cfg) {
  var post = function (m) { m.__sytl = cfg.id; parent.postMessage(m, "*"); };
  var hits = {};
  window.__syCov = function (file, kind, id) { var h = hits[file] || (hits[file] = { s: {}, f: {} }); h[kind][id] = (h[kind][id] || 0) + 1; };
  var logs = [];
  ["log", "warn", "error", "info"].forEach(function (k) {
    var o = console[k];
    console[k] = function () { logs.push({ level: k, m: [].slice.call(arguments).map(function (a) { try { return typeof a === "string" ? a : a instanceof Error ? a.message : a && a.nodeType ? "<" + a.tagName.toLowerCase() + ">" : JSON.stringify(a); } catch (e) { return String(a); } }).join(" ") }); return o.apply(console, arguments); };
  });

  /* ── helpers ── */
  var norm = function (s) { return String(s == null ? "" : s).replace(/\s+/g, " ").trim(); };
  var tick = function (ms) { return new Promise(function (r) { setTimeout(r, ms || 0); }); };
  function fmt(v, d) {
    d = d || 0;
    if (v && v.asymmetricMatch) return v.toString();
    if (typeof v === "string") return JSON.stringify(v);
    if (typeof v === "function") return v._isMock ? "[MockFunction" + (v._name ? " " + v._name : "") + "]" : "[Function " + (v.name || "anonymous") + "]";
    if (v && v.nodeType === 1) { var o = v.outerHTML; return o.length > 160 ? o.slice(0, 157) + "…" : o; }
    if (v instanceof Error) return v.name + ": " + v.message;
    if (Array.isArray(v)) return d > 2 ? "[…]" : "[" + v.map(function (x) { return fmt(x, d + 1); }).join(", ") + "]";
    if (v && typeof v === "object") { if (d > 2) return "{…}"; try { return "{ " + Object.keys(v).map(function (k) { return k + ": " + fmt(v[k], d + 1); }).join(", ") + " }"; } catch (e) { return String(v); } }
    return String(v);
  }
  function eq(a, b, strict) {
    if (b && b.asymmetricMatch) return b.asymmetricMatch(a);
    if (a && a.asymmetricMatch) return a.asymmetricMatch(b);
    if (Object.is(a, b)) return true;
    if (typeof a !== "object" || typeof b !== "object" || !a || !b) return false;
    if (a instanceof Date && b instanceof Date) return +a === +b;
    if (a instanceof RegExp && b instanceof RegExp) return String(a) === String(b);
    if (Array.isArray(a) !== Array.isArray(b)) return false;
    if (strict && Object.getPrototypeOf(a) !== Object.getPrototypeOf(b)) return false;
    var ka = Object.keys(a).filter(function (k) { return strict || a[k] !== undefined; }), kb = Object.keys(b).filter(function (k) { return strict || b[k] !== undefined; });
    if (ka.length !== kb.length) return false;
    return ka.every(function (k) { return Object.prototype.hasOwnProperty.call(b, k) && eq(a[k], b[k], strict); });
  }
  function subset(a, b) {
    if (b && b.asymmetricMatch) return b.asymmetricMatch(a);
    if (typeof b !== "object" || !b) return eq(a, b);
    if (typeof a !== "object" || !a) return false;
    if (Array.isArray(b)) return Array.isArray(a) && a.length === b.length && b.every(function (x, i) { return subset(a[i], x); });
    return Object.keys(b).every(function (k) { return subset(a[k], b[k]); });
  }

  /* ── DOM semantics: hidden, roles, accessible names ── */
  function isHidden(el) {
    for (var e = el; e && e.nodeType === 1; e = e.parentElement) {
      if (e.hidden || e.getAttribute("aria-hidden") === "true") return true;
      var c = getComputedStyle(e);
      if (c.display === "none" || c.visibility === "hidden") return true;
    }
    return false;
  }
  var LANDMARK_SCOPE = "article,aside,main,nav,section";
  function roleOf(el) {
    var r = el.getAttribute("role");
    if (r) return r.split(/\s+/)[0];
    var t = el.tagName.toLowerCase(), type = (el.getAttribute("type") || "text").toLowerCase();
    if (/^h[1-6]$/.test(t)) return "heading";
    switch (t) {
      case "a": case "area": return el.hasAttribute("href") ? "link" : null;
      case "button": return "button";
      case "input":
        if (/^(button|submit|reset|image)$/.test(type)) return "button";
        if (type === "checkbox") return "checkbox";
        if (type === "radio") return "radio";
        if (type === "range") return "slider";
        if (type === "number") return "spinbutton";
        if (type === "search") return el.hasAttribute("list") ? "combobox" : "searchbox";
        if (type === "hidden" || type === "file" || type === "color" || type === "date") return null;
        return el.hasAttribute("list") ? "combobox" : "textbox";
      case "textarea": return "textbox";
      case "select": return el.multiple || el.size > 1 ? "listbox" : "combobox";
      case "option": return "option";
      case "ul": case "ol": case "menu": return "list";
      case "li": return "listitem";
      case "nav": return "navigation";
      case "main": return "main";
      case "aside": return "complementary";
      case "header": return el.parentElement && el.parentElement.closest(LANDMARK_SCOPE) ? null : "banner";
      case "footer": return el.parentElement && el.parentElement.closest(LANDMARK_SCOPE) ? null : "contentinfo";
      case "section": return accName(el) ? "region" : null;
      case "form": return accName(el) ? "form" : null;
      case "article": return "article";
      case "img": return el.getAttribute("alt") === "" ? "presentation" : "img";
      case "svg": return null;
      case "figure": return "figure";
      case "table": return "table";
      case "tr": return "row";
      case "td": return "cell";
      case "th": return "columnheader";
      case "dialog": return "dialog";
      case "p": return "paragraph";
      case "hr": return "separator";
      case "progress": return "progressbar";
      case "fieldset": return "group";
      case "output": return "status";
      case "label": return null;
      default: return null;
    }
  }
  function textOf(n) {
    var out = "";
    n.childNodes.forEach(function (c) {
      if (c.nodeType === 3) out += c.textContent;
      else if (c.nodeType === 1) {
        if (c.hidden || c.getAttribute("aria-hidden") === "true") return;
        var t = c.tagName.toLowerCase();
        if (t === "img") out += " " + (c.getAttribute("alt") || "") + " ";
        else if (t === "script" || t === "style") return;
        else if (c.getAttribute("aria-label")) out += " " + c.getAttribute("aria-label") + " ";
        else out += (/^(div|p|li|h\d|br|section)$/.test(t) ? " " : "") + textOf(c);
      }
    });
    return out;
  }
  function accName(el) {
    var by = el.getAttribute("aria-labelledby");
    if (by) return norm(by.split(/\s+/).map(function (id) { var x = document.getElementById(id); return x ? textOf(x) : ""; }).join(" "));
    var al = el.getAttribute("aria-label");
    if (al && al.trim()) return norm(al);
    var t = el.tagName.toLowerCase(), type = (el.getAttribute("type") || "").toLowerCase();
    if ((t === "input" && !/^(button|submit|reset|image)$/.test(type)) || t === "textarea" || t === "select") {
      var labels = el.labels ? Array.from(el.labels) : [];
      if (labels.length) return norm(labels.map(function (l) { var c = l.cloneNode(true); c.querySelectorAll("input,select,textarea").forEach(function (x) { x.remove(); }); return textOf(c); }).join(" "));
      return norm(el.getAttribute("title") || el.getAttribute("placeholder") || "");
    }
    if (t === "input") return norm(type === "image" ? el.getAttribute("alt") : el.value || (type === "submit" ? "Submit" : type === "reset" ? "Reset" : ""));
    if (t === "img" || t === "area") return norm(el.getAttribute("alt") || el.getAttribute("title") || "");
    if (t === "fieldset") { var lg = el.querySelector("legend"); return lg ? norm(textOf(lg)) : ""; }
    if (/^(section|form|article|aside|nav|main|table|ul|ol|div|dialog)$/.test(t)) return norm(el.getAttribute("title") || "");
    return norm(textOf(el) || el.getAttribute("title") || "");
  }
  window.__syAccName = accName;

  /* ── queries ── */
  function matches(text, m, opts) {
    if (text == null) return false;
    var exact = !opts || opts.exact !== false;
    var s = norm(text);
    if (typeof m === "function") return !!m(s);
    if (m instanceof RegExp) return m.test(s);
    return exact ? s === norm(m) : s.toLowerCase().indexOf(norm(m).toLowerCase()) >= 0;
  }
  var all = function (root) { return Array.from(root.querySelectorAll("*")); };
  var ownText = function (el) { return Array.from(el.childNodes).filter(function (c) { return c.nodeType === 3; }).map(function (c) { return c.textContent; }).join(""); };
  var BY = {
    Role: function (root, role, o) {
      o = o || {};
      return all(root).filter(function (el) {
        if (roleOf(el) !== role) return false;
        if (!o.hidden && isHidden(el)) return false;
        if (o.name !== undefined && !matches(accName(el), o.name)) return false;
        if (o.level !== undefined && +(el.getAttribute("aria-level") || el.tagName.slice(1)) !== o.level) return false;
        if (o.checked !== undefined && !!(el.checked || el.getAttribute("aria-checked") === "true") !== o.checked) return false;
        if (o.pressed !== undefined && (el.getAttribute("aria-pressed") === "true") !== o.pressed) return false;
        if (o.expanded !== undefined && (el.getAttribute("aria-expanded") === "true") !== o.expanded) return false;
        return true;
      });
    },
    Text: function (root, m, o) { return all(root).filter(function (el) { return !/^(SCRIPT|STYLE)$/.test(el.tagName) && matches(ownText(el), m, o) && (!o || !o.selector || el.matches(o.selector)); }); },
    LabelText: function (root, m, o) {
      return all(root).filter(function (el) {
        if (!/^(INPUT|SELECT|TEXTAREA|BUTTON)$/.test(el.tagName) && !el.getAttribute("aria-label") && !el.getAttribute("aria-labelledby")) return false;
        if (el.getAttribute("aria-label") && matches(el.getAttribute("aria-label"), m, o)) return true;
        var labels = el.labels ? Array.from(el.labels) : [];
        if (labels.some(function (l) { return matches(textOf(l), m, o); })) return true;
        var by = el.getAttribute("aria-labelledby");
        return !!by && matches(by.split(/\s+/).map(function (id) { var x = document.getElementById(id); return x ? textOf(x) : ""; }).join(" "), m, o);
      });
    },
    PlaceholderText: function (root, m, o) { return all(root).filter(function (el) { return el.hasAttribute("placeholder") && matches(el.getAttribute("placeholder"), m, o); }); },
    AltText: function (root, m, o) { return all(root).filter(function (el) { return el.hasAttribute("alt") && matches(el.getAttribute("alt"), m, o); }); },
    DisplayValue: function (root, m, o) { return all(root).filter(function (el) { return /^(INPUT|SELECT|TEXTAREA)$/.test(el.tagName) && matches(el.value, m, o); }); },
    TestId: function (root, m, o) { return all(root).filter(function (el) { return el.hasAttribute("data-testid") && matches(el.getAttribute("data-testid"), m, o); }); },
    Title: function (root, m, o) { return all(root).filter(function (el) { return el.hasAttribute("title") && matches(el.getAttribute("title"), m, o); }); },
  };
  function describeQuery(kind, m, o) {
    var what = kind === "Role" ? "role " + JSON.stringify(m) + (o && o.name !== undefined ? " and name " + (o.name instanceof RegExp ? String(o.name) : JSON.stringify(o.name)) : "") : kind === "Text" ? "the text: " + (m instanceof RegExp ? String(m) : m) : kind === "LabelText" ? "the label: " + m : kind.replace(/([A-Z])/g, " $1").trim().toLowerCase() + ": " + m;
    return what;
  }
  function rolesHint(root) {
    var list = all(root).filter(function (el) { return roleOf(el) && !isHidden(el); }).slice(0, 12).map(function (el) { return "  " + roleOf(el) + (accName(el) ? ': Name "' + accName(el) + '"' : ""); });
    return list.length ? "\n\nHere are the accessible roles:\n" + list.join("\n") : "";
  }
  function qerr(msg) { var e = new Error(msg); e.name = "TestingLibraryElementError"; return e; }
  function makeQueries(root) {
    var q = {};
    Object.keys(BY).forEach(function (k) {
      var find = function (m, o) { return BY[k](root(), m, o); };
      var none = function (m, o) { return qerr("Unable to find an element with " + describeQuery(k, m, o) + (k === "Role" ? rolesHint(root()) : "")); };
      q["queryAllBy" + k] = find;
      q["queryBy" + k] = function (m, o) { var r = find(m, o); if (r.length > 1) throw qerr("Found multiple elements with " + describeQuery(k, m, o) + ". Use a getAllBy query, or make the query more specific."); return r[0] || null; };
      q["getAllBy" + k] = function (m, o) { var r = find(m, o); if (!r.length) throw none(m, o); return r; };
      q["getBy" + k] = function (m, o) { var r = q["getAllBy" + k](m, o); if (r.length > 1) throw qerr("Found multiple elements with " + describeQuery(k, m, o) + ". Use a getAllBy query, or make the query more specific."); return r[0]; };
      q["findAllBy" + k] = function (m, o, w) { return waitFor(function () { return q["getAllBy" + k](m, o); }, w); };
      q["findBy" + k] = function (m, o, w) { return waitFor(function () { return q["getBy" + k](m, o); }, w); };
    });
    q.debug = function (el) { console.log((el || root()).outerHTML); };
    return q;
  }
  function waitFor(fn, o) {
    var timeout = (o && o.timeout) || 1000, t0 = Date.now();
    return new Promise(function (res, rej) {
      (function attempt() {
        var last;
        Promise.resolve().then(fn).then(res, function (e) {
          last = e;
          if (Date.now() - t0 >= timeout) rej(last);
          else setTimeout(attempt, 30);
        });
      })();
    });
  }

  /* ── React Testing Library ── */
  var mounted = [];
  function render(ui, o) {
    var container = (o && o.container) || document.body.appendChild(document.createElement("div"));
    var root = ReactDOM.createRoot(container);
    ReactDOM.flushSync(function () { root.render(ui); });
    mounted.push({ root: root, container: container });
    var r = makeQueries(function () { return document.body; });
    r.container = container;
    r.baseElement = document.body;
    r.unmount = function () { ReactDOM.flushSync(function () { root.unmount(); }); };
    r.rerender = function (u) { ReactDOM.flushSync(function () { root.render(u); }); };
    r.asFragment = function () { var t = document.createElement("template"); t.innerHTML = container.innerHTML; return t.content; };
    return r;
  }
  function cleanup() {
    mounted.forEach(function (m) { try { ReactDOM.flushSync(function () { m.root.unmount(); }); } catch (e) {} if (m.container.parentNode === document.body) m.container.remove(); });
    mounted = [];
    document.body.innerHTML = "";
  }
  var screen = makeQueries(function () { return document.body; });
  var within = function (el) { return makeQueries(function () { return el; }); };
  function fire(el, type, init, Ctor) { var e = new (Ctor || Event)(type, Object.assign({ bubbles: true, cancelable: true }, init || {})); ReactDOM.flushSync(function () { el.dispatchEvent(e); }); return e; }
  function setNativeValue(el, v) {
    var proto = el.tagName === "TEXTAREA" ? HTMLTextAreaElement.prototype : el.tagName === "SELECT" ? HTMLSelectElement.prototype : HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(proto, "value").set.call(el, v);
  }
  var fireEvent = function (el, ev) { return el.dispatchEvent(ev); };
  fireEvent.click = function (el, i) { return fire(el, "click", i, MouseEvent); };
  fireEvent.change = function (el, i) { if (i && i.target && "value" in i.target) setNativeValue(el, i.target.value); fire(el, "input"); return fire(el, "change"); };
  fireEvent.input = function (el, i) { if (i && i.target && "value" in i.target) setNativeValue(el, i.target.value); return fire(el, "input"); };
  fireEvent.submit = function (el) { return fire(el, "submit"); };
  fireEvent.keyDown = function (el, i) { return fire(el, "keydown", i, KeyboardEvent); };
  fireEvent.focus = function (el) { el.focus(); };
  fireEvent.blur = function (el) { el.blur(); };
  var act = function (fn) { var r; ReactDOM.flushSync(function () { r = fn && fn(); }); return Promise.resolve(r).then(function () { return tick(); }); };

  /* ── user-event ── */
  function assertUsable(el, what) {
    if (!el || el.nodeType !== 1) throw new TypeError("userEvent." + what + "() needs an element. Did your query return null?");
    if (isHidden(el)) throw new Error("Unable to " + what + " an element that is hidden: " + fmt(el));
  }
  var userEvent = {
    setup: function () { return userEvent; },
    click: async function (el) {
      assertUsable(el, "click");
      if (el.disabled) return;
      if (getComputedStyle(el).pointerEvents === "none") throw new Error("Unable to click the element: it has pointer-events: none.");
      fire(el, "pointerdown", {}, MouseEvent); fire(el, "mousedown", {}, MouseEvent);
      if (el.focus) el.focus();
      fire(el, "pointerup", {}, MouseEvent); fire(el, "mouseup", {}, MouseEvent);
      ReactDOM.flushSync(function () { el.click(); });
      await tick();
    },
    dblClick: async function (el) { await userEvent.click(el); await userEvent.click(el); fire(el, "dblclick", {}, MouseEvent); await tick(); },
    hover: async function (el) { fire(el, "pointerover", {}, MouseEvent); fire(el, "mouseover", {}, MouseEvent); fire(el, "mouseenter", { bubbles: false }, MouseEvent); await tick(); },
    unhover: async function (el) { fire(el, "pointerout", {}, MouseEvent); fire(el, "mouseout", {}, MouseEvent); fire(el, "mouseleave", { bubbles: false }, MouseEvent); await tick(); },
    clear: async function (el) { assertUsable(el, "clear"); el.focus(); setNativeValue(el, ""); fire(el, "input"); await tick(); },
    type: async function (el, text) {
      assertUsable(el, "type");
      if (el.disabled || el.readOnly) return;
      if (document.activeElement !== el) { ReactDOM.flushSync(function () { el.click(); }); el.focus(); }
      var parts = String(text).match(/\{[^}]+\}|[\s\S]/g) || [];
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i];
        if (p === "{Enter}" || p === "{enter}") {
          fire(el, "keydown", { key: "Enter", code: "Enter" }, KeyboardEvent);
          if (el.form && el.tagName === "INPUT") ReactDOM.flushSync(function () { el.form.requestSubmit(); });
          else if (el.tagName === "TEXTAREA") { setNativeValue(el, el.value + "\n"); fire(el, "input"); }
          fire(el, "keyup", { key: "Enter", code: "Enter" }, KeyboardEvent);
        } else if (p === "{Backspace}" || p === "{backspace}") { setNativeValue(el, el.value.slice(0, -1)); fire(el, "input"); }
        else if (p[0] === "{") continue;
        else {
          fire(el, "keydown", { key: p }, KeyboardEvent);
          if (el.maxLength > 0 && el.value.length >= el.maxLength) continue;
          setNativeValue(el, el.value + p);
          fire(el, "input", { data: p, inputType: "insertText" }, InputEvent);
          fire(el, "keyup", { key: p }, KeyboardEvent);
        }
      }
      await tick();
    },
    selectOptions: async function (el, values) {
      [].concat(values).forEach(function (v) { var o = Array.from(el.options).find(function (o) { return o.value === v || o.textContent === v; }); if (!o) throw new Error("Value \"" + v + "\" not found in options"); o.selected = true; });
      fire(el, "input"); fire(el, "change"); await tick();
    },
    keyboard: async function (text) { var el = document.activeElement || document.body; if (/^\{(Enter|Escape|Tab)\}$/.test(text)) { var k = text.slice(1, -1); fire(el, "keydown", { key: k }, KeyboardEvent); if (k === "Enter" && el.tagName === "BUTTON") ReactDOM.flushSync(function () { el.click(); }); fire(el, "keyup", { key: k }, KeyboardEvent); } else await userEvent.type(el, text); await tick(); },
    tab: async function (o) {
      var f = Array.from(document.querySelectorAll("a[href],button,input,select,textarea,[tabindex]")).filter(function (e) { return !e.disabled && e.tabIndex >= 0 && !isHidden(e); });
      var i = f.indexOf(document.activeElement), n = o && o.shift ? i - 1 : i + 1;
      var next = f[(n + f.length) % f.length];
      if (next) next.focus();
      await tick();
    },
  };

  /* ── mocks (vi) ── */
  var allMocks = [], stubs = [];
  function fn(impl) {
    var once = [], implementation = impl, name = "";
    var m = function () {
      var args = [].slice.call(arguments);
      m.mock.calls.push(args); m.mock.lastCall = args; m.mock.instances.push(this);
      var f = once.length ? once.shift() : implementation;
      try { var r = f ? f.apply(this, args) : undefined; m.mock.results.push({ type: "return", value: r }); return r; }
      catch (e) { m.mock.results.push({ type: "throw", value: e }); throw e; }
    };
    m._isMock = true;
    m.mock = { calls: [], results: [], instances: [], lastCall: undefined };
    m.getMockName = function () { return name || "vi.fn()"; };
    m.mockName = function (n) { name = n; m._name = n; return m; };
    m.mockImplementation = function (f) { implementation = f; return m; };
    m.mockImplementationOnce = function (f) { once.push(f); return m; };
    m.mockReturnValue = function (v) { implementation = function () { return v; }; return m; };
    m.mockReturnValueOnce = function (v) { once.push(function () { return v; }); return m; };
    m.mockResolvedValue = function (v) { implementation = function () { return Promise.resolve(v); }; return m; };
    m.mockResolvedValueOnce = function (v) { once.push(function () { return Promise.resolve(v); }); return m; };
    m.mockRejectedValue = function (v) { implementation = function () { return Promise.reject(v); }; return m; };
    m.mockRejectedValueOnce = function (v) { once.push(function () { return Promise.reject(v); }); return m; };
    m.mockClear = function () { m.mock.calls = []; m.mock.results = []; m.mock.instances = []; m.mock.lastCall = undefined; return m; };
    m.mockReset = function () { m.mockClear(); implementation = impl; once = []; return m; };
    m.mockRestore = function () { m.mockReset(); if (m._restore) m._restore(); };
    allMocks.push(m);
    return m;
  }
  var vi = {
    fn: fn,
    spyOn: function (obj, key) {
      var orig = obj[key];
      if (typeof orig !== "function") throw new TypeError(String(key) + " is not a function, so it can't be spied on.");
      var m = fn(function () { return orig.apply(this, arguments); });
      m._restore = function () { obj[key] = orig; };
      obj[key] = m;
      return m;
    },
    stubGlobal: function (name, val) { stubs.push([name, window[name]]); window[name] = val; return vi; },
    unstubAllGlobals: function () { while (stubs.length) { var s = stubs.pop(); window[s[0]] = s[1]; } return vi; },
    clearAllMocks: function () { allMocks.forEach(function (m) { m.mockClear(); }); return vi; },
    resetAllMocks: function () { allMocks.forEach(function (m) { m.mockReset(); }); return vi; },
    restoreAllMocks: function () { allMocks.forEach(function (m) { if (m._restore) m.mockRestore(); }); return vi; },
    isMockFunction: function (f) { return !!(f && f._isMock); },
    waitFor: waitFor,
    mock: function () { throw new Error("vi.mock isn't supported in this lab. Mock network requests with msw, or pass dependencies in as arguments."); },
  };

  /* ── msw ── */
  var origFetch = window.fetch, active = null;
  function HttpResponse(body, init) { init = init || {}; this.__body = body; this.status = init.status || 200; this.headers = init.headers || {}; }
  HttpResponse.json = function (data, init) { var r = new HttpResponse(JSON.stringify(data), init); r.headers = Object.assign({ "Content-Type": "application/json" }, r.headers); return r; };
  HttpResponse.text = function (t, init) { return new HttpResponse(String(t), init); };
  HttpResponse.error = function () { var r = new HttpResponse(null); r.__error = true; return r; };
  function handler(method) { return function (path, resolver) { return { method: method, path: path, resolver: resolver }; }; }
  var http = { get: handler("GET"), post: handler("POST"), put: handler("PUT"), patch: handler("PATCH"), delete: handler("DELETE"), all: handler("*") };
  function matchPath(pattern, url) {
    var u = new URL(url, location.href);
    if (pattern instanceof RegExp) return pattern.test(u.href) ? {} : null;
    var p = new URL(pattern.replace(/\*/g, "__STAR__").replace(/:(\w+)/g, "__P_$1__"), location.href);
    if (/^https?:/.test(pattern) && p.origin !== u.origin) return null;
    var re = new RegExp("^" + p.pathname.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/__STAR__/g, ".*").replace(/__P_(\w+)__/g, "(?<$1>[^/]+)") + "/?$");
    var m = u.pathname.match(re);
    return m ? (m.groups || {}) : null;
  }
  function setupServer() {
    var initial = [].slice.call(arguments), extra = [];
    var server = {
      listen: function () {
        active = server;
        window.fetch = async function (input, init) {
          var url = typeof input === "string" ? input : input.url;
          var method = ((init && init.method) || (input && input.method) || "GET").toUpperCase();
          var list = extra.concat(initial);
          for (var i = 0; i < list.length; i++) {
            var h = list[i];
            if (h.method !== "*" && h.method !== method) continue;
            var params = matchPath(h.path, url);
            if (!params) continue;
            var request = new Request(new URL(url, location.href).href, { method: method, headers: init && init.headers, body: method === "GET" || method === "HEAD" ? undefined : init && init.body });
            var r = await h.resolver({ request: request, params: params });
            if (r === undefined) continue;
            if (r.__error) throw new TypeError("Failed to fetch");
            return new Response(r.__body, { status: r.status, headers: r.headers });
          }
          console.warn("[MSW] Warning: intercepted a request without a matching request handler: " + method + " " + url);
          return origFetch.apply(window, arguments);
        };
      },
      use: function () { extra = [].slice.call(arguments).concat(extra); },
      resetHandlers: function () { extra = []; if (arguments.length) initial = [].slice.call(arguments); },
      close: function () { if (active === server) { window.fetch = origFetch; active = null; } },
      listHandlers: function () { return extra.concat(initial); },
    };
    return server;
  }

  /* ── axe (a small subset of axe-core's rules) ── */
  function axe(root) {
    root = root && root.nodeType ? root : document.body;
    var v = {};
    var add = function (id, help, el) { (v[id] = v[id] || { id: id, help: help, nodes: [] }).nodes.push({ html: el.outerHTML.slice(0, 120) }); };
    var els = [root].concat(all(root)).filter(function (el) { return !isHidden(el); });
    els.forEach(function (el) {
      var t = el.tagName.toLowerCase();
      if (t === "img" && !el.hasAttribute("alt") && !el.getAttribute("aria-label") && el.getAttribute("role") !== "presentation") add("image-alt", "Images must have alternate text", el);
      if (roleOf(el) === "button" && !accName(el)) add("button-name", "Buttons must have discernible text", el);
      if (roleOf(el) === "link" && !accName(el)) add("link-name", "Links must have discernible text", el);
      if ((t === "input" && !/^(button|submit|reset|image|hidden)$/.test((el.getAttribute("type") || "").toLowerCase())) || t === "select" || t === "textarea") {
        var labelled = (el.labels && el.labels.length) || el.getAttribute("aria-label") || el.getAttribute("aria-labelledby") || el.getAttribute("title");
        if (!labelled) add("label", "Form elements must have labels", el);
      }
      if (/^h[1-6]$/.test(t) && !norm(el.textContent)) add("empty-heading", "Headings should not be empty", el);
      if (el.getAttribute("role") && !/^(alert|alertdialog|application|article|banner|button|cell|checkbox|columnheader|combobox|complementary|contentinfo|dialog|document|feed|figure|form|grid|gridcell|group|heading|img|link|list|listbox|listitem|log|main|marquee|math|menu|menubar|menuitem|menuitemcheckbox|menuitemradio|navigation|none|note|option|presentation|progressbar|radio|radiogroup|region|row|rowgroup|rowheader|scrollbar|search|searchbox|separator|slider|spinbutton|status|switch|tab|table|tablist|tabpanel|term|textbox|timer|toolbar|tooltip|tree|treegrid|treeitem)$/.test(el.getAttribute("role").split(/\s+/)[0])) add("aria-roles", "ARIA roles used must conform to valid values", el);
    });
    return Promise.resolve({ violations: Object.keys(v).map(function (k) { return v[k]; }), passes: [] });
  }

  /* ── expect ── */
  function AssertionError(msg) { var e = new Error(msg); e.name = "AssertionError"; return e; }
  var asym = function (name, fnc, s) { return { asymmetricMatch: fnc, toString: function () { return name + "(" + s + ")"; } }; };
  function expect(actual, label) {
    function make(not, mode) {
      var api = {};
      var check = function (pass, msg, notMsg) {
        if (not ? pass : !pass) throw AssertionError((label ? label + ": " : "") + (not ? notMsg || msg.replace(/\bto\b/, "not to") : msg));
      };
      var el = function (name) { if (!actual || actual.nodeType !== 1) throw AssertionError("expect(…)." + name + "() needs a DOM element, but received " + fmt(actual) + "."); return actual; };
      var mock = function (name) { if (!actual || !actual._isMock) throw AssertionError("expect(…)." + name + "() needs a mock function (vi.fn() or vi.spyOn), but received " + fmt(actual) + "."); return actual; };
      var M = {
        toBe: function (e) { check(Object.is(actual, e), "expected " + fmt(actual) + " to be " + fmt(e) + (eq(actual, e) && typeof e === "object" ? " (they're equal but not the same object: use toEqual)" : "")); },
        toEqual: function (e) { check(eq(actual, e), "expected " + fmt(actual) + " to deeply equal " + fmt(e)); },
        toStrictEqual: function (e) { check(eq(actual, e, true), "expected " + fmt(actual) + " to strictly equal " + fmt(e)); },
        toMatchObject: function (e) { check(subset(actual, e), "expected " + fmt(actual) + " to match object " + fmt(e)); },
        toBeTruthy: function () { check(!!actual, "expected " + fmt(actual) + " to be truthy"); },
        toBeFalsy: function () { check(!actual, "expected " + fmt(actual) + " to be falsy"); },
        toBeNull: function () { check(actual === null, "expected " + fmt(actual) + " to be null"); },
        toBeUndefined: function () { check(actual === undefined, "expected " + fmt(actual) + " to be undefined"); },
        toBeDefined: function () { check(actual !== undefined, "expected " + fmt(actual) + " to be defined"); },
        toBeNaN: function () { check(Number.isNaN(actual), "expected " + fmt(actual) + " to be NaN"); },
        toBeGreaterThan: function (n) { check(actual > n, "expected " + fmt(actual) + " to be greater than " + n); },
        toBeGreaterThanOrEqual: function (n) { check(actual >= n, "expected " + fmt(actual) + " to be greater than or equal to " + n); },
        toBeLessThan: function (n) { check(actual < n, "expected " + fmt(actual) + " to be less than " + n); },
        toBeLessThanOrEqual: function (n) { check(actual <= n, "expected " + fmt(actual) + " to be less than or equal to " + n); },
        toBeCloseTo: function (n, d) { check(Math.abs(actual - n) < Math.pow(10, -(d == null ? 2 : d)) / 2, "expected " + fmt(actual) + " to be close to " + n); },
        toBeInstanceOf: function (C) { check(actual instanceof C, "expected " + fmt(actual) + " to be an instance of " + (C && C.name)); },
        toContain: function (x) { check(actual != null && (typeof actual === "string" ? actual.indexOf(x) >= 0 : actual.classList ? actual.contains(x) : Array.from(actual).indexOf(x) >= 0), "expected " + fmt(actual) + " to contain " + fmt(x)); },
        toContainEqual: function (x) { check(Array.from(actual || []).some(function (a) { return eq(a, x); }), "expected " + fmt(actual) + " to contain an item equal to " + fmt(x)); },
        toHaveLength: function (n) { check(actual != null && actual.length === n, "expected " + fmt(actual) + " to have length " + n + " but got " + (actual == null ? actual : actual.length)); },
        toHaveProperty: function (k, v) { var o = actual, ks = Array.isArray(k) ? k : String(k).split("."); for (var i = 0; i < ks.length; i++) { if (o == null || !(ks[i] in Object(o))) { o = undefined; check(false, "expected " + fmt(actual) + " to have property " + k); return; } o = o[ks[i]]; } check(arguments.length < 2 || eq(o, v), "expected property " + k + " to equal " + fmt(v) + " but got " + fmt(o)); },
        toMatch: function (re) { check(typeof actual === "string" && (re instanceof RegExp ? re.test(actual) : actual.indexOf(re) >= 0), "expected " + fmt(actual) + " to match " + String(re)); },
        toThrow: function (e) {
          var threw = false, err;
          try { actual(); } catch (x) { threw = true; err = x; }
          var ok = threw && (e === undefined || (e instanceof RegExp ? e.test(err && err.message) : typeof e === "function" ? err instanceof e : String(err && err.message).indexOf(e) >= 0));
          check(ok, threw ? "expected the function to throw " + fmt(e) + " but it threw " + fmt(err) : "expected the function to throw an error, but it didn't");
        },
        toHaveBeenCalled: function () { var m = mock("toHaveBeenCalled"); check(m.mock.calls.length > 0, "expected " + fmt(m) + " to have been called", "expected " + fmt(m) + " not to have been called, but it was called " + m.mock.calls.length + " time(s)"); },
        toHaveBeenCalledTimes: function (n) { var m = mock("toHaveBeenCalledTimes"); check(m.mock.calls.length === n, "expected " + fmt(m) + " to be called " + n + " time(s), but it was called " + m.mock.calls.length + " time(s)"); },
        toHaveBeenCalledWith: function () { var a = [].slice.call(arguments), m = mock("toHaveBeenCalledWith"); check(m.mock.calls.some(function (c) { return eq(c, a); }), "expected " + fmt(m) + " to be called with " + fmt(a) + (m.mock.calls.length ? "\nReceived calls: " + m.mock.calls.map(function (c) { return fmt(c); }).join(", ") : "\nNumber of calls: 0")); },
        toHaveBeenLastCalledWith: function () { var a = [].slice.call(arguments), m = mock("toHaveBeenLastCalledWith"); check(eq(m.mock.lastCall, a), "expected the last call to be " + fmt(a) + " but it was " + fmt(m.mock.lastCall)); },
        toHaveBeenNthCalledWith: function (n) { var a = [].slice.call(arguments, 1), m = mock("toHaveBeenNthCalledWith"); check(eq(m.mock.calls[n - 1], a), "expected call " + n + " to be " + fmt(a) + " but it was " + fmt(m.mock.calls[n - 1])); },
        toHaveReturnedWith: function (v) { var m = mock("toHaveReturnedWith"); check(m.mock.results.some(function (r) { return r.type === "return" && eq(r.value, v); }), "expected " + fmt(m) + " to have returned " + fmt(v)); },
        // jest-dom
        toBeInTheDocument: function () { check(!!actual && actual.nodeType === 1 && document.body.contains(actual), actual ? "expected element to be in the document" : "expected element to be in the document, but received " + fmt(actual), "expected element not to be in the document, but found " + fmt(actual)); },
        toBeVisible: function () { el("toBeVisible"); check(document.body.contains(actual) && !isHidden(actual), "expected element to be visible: " + fmt(actual)); },
        toBeEmptyDOMElement: function () { el("toBeEmptyDOMElement"); check(!actual.innerHTML.trim(), "expected element to be empty, but it contains " + fmt(actual.innerHTML)); },
        toHaveTextContent: function (t, o) { el("toHaveTextContent"); var s = norm(actual.textContent); check(t instanceof RegExp ? t.test(s) : o && o.normalizeWhitespace === false ? actual.textContent.indexOf(t) >= 0 : s.indexOf(norm(t)) >= 0, "expected element to have text content " + fmt(t instanceof RegExp ? String(t) : t) + "\nReceived: " + fmt(s)); },
        toHaveAttribute: function (n, v) { el("toHaveAttribute"); var has = actual.hasAttribute(n), val = actual.getAttribute(n); check(has && (arguments.length < 2 || (v && v.asymmetricMatch ? v.asymmetricMatch(val) : val === v)), "expected element to have attribute " + n + (arguments.length > 1 ? "=" + fmt(v) : "") + (has ? "\nReceived: " + n + "=" + fmt(val) : "")); },
        toHaveValue: function (v) { el("toHaveValue"); var val = actual.type === "number" ? (actual.value === "" ? null : +actual.value) : actual.multiple ? Array.from(actual.selectedOptions).map(function (o) { return o.value; }) : actual.value; check(arguments.length ? eq(val, v) : !!val, "expected element to have value " + fmt(v) + "\nReceived: " + fmt(val)); },
        toHaveDisplayValue: function (v) { el("toHaveDisplayValue"); check(matches(actual.value, v), "expected element to have display value " + fmt(v) + "\nReceived: " + fmt(actual.value)); },
        toBeDisabled: function () { el("toBeDisabled"); check(!!actual.disabled || !!actual.closest("fieldset[disabled]"), "expected element to be disabled: " + fmt(actual)); },
        toBeEnabled: function () { el("toBeEnabled"); check(!actual.disabled && !actual.closest("fieldset[disabled]"), "expected element to be enabled: " + fmt(actual)); },
        toBeChecked: function () { el("toBeChecked"); check(!!actual.checked || actual.getAttribute("aria-checked") === "true", "expected element to be checked"); },
        toBeRequired: function () { el("toBeRequired"); check(actual.required || actual.getAttribute("aria-required") === "true", "expected element to be required"); },
        toHaveFocus: function () { el("toHaveFocus"); check(document.activeElement === actual, "expected element to have focus\nFocused: " + fmt(document.activeElement)); },
        toHaveClass: function () { el("toHaveClass"); var cs = [].slice.call(arguments).join(" ").split(/\s+/).filter(Boolean); check(cs.every(function (c) { return actual.classList.contains(c); }), "expected element to have class " + fmt(cs.join(" ")) + "\nReceived: " + fmt(actual.className)); },
        toHaveAccessibleName: function (n) { el("toHaveAccessibleName"); var a = accName(actual); check(arguments.length ? matches(a, n) : !!a, "expected element to have accessible name " + fmt(n) + "\nReceived: " + fmt(a)); },
        toHaveStyle: function (s) { el("toHaveStyle"); var c = getComputedStyle(actual), ok = true, probe = document.createElement("div"); var obj = typeof s === "string" ? Object.fromEntries(s.split(";").filter(function (x) { return x.trim(); }).map(function (x) { var i = x.indexOf(":"); return [x.slice(0, i).trim(), x.slice(i + 1).trim()]; })) : s; Object.keys(obj).forEach(function (k) { var prop = k.replace(/[A-Z]/g, function (m) { return "-" + m.toLowerCase(); }); probe.style.setProperty(prop, obj[k]); if (c.getPropertyValue(prop) !== probe.style.getPropertyValue(prop) && c.getPropertyValue(prop) !== String(obj[k])) ok = false; }); check(ok, "expected element to have style " + fmt(obj)); },
        toHaveNoViolations: function () { var vs = (actual && actual.violations) || []; check(!vs.length, "expected no accessibility violations, but found " + vs.length + ":\n" + vs.map(function (x) { return "  " + x.id + ": " + x.help + "\n    " + x.nodes.map(function (n) { return n.html; }).join("\n    "); }).join("\n")); },
      };
      Object.keys(M).forEach(function (k) {
        api[k] = function () {
          var args = arguments;
          if (mode) return Promise.resolve(actual).then(function (v) { if (mode === "rejects") throw AssertionError("expected promise to reject, but it resolved with " + fmt(v)); return v; }, function (e) { if (mode === "resolves") throw AssertionError("expected promise to resolve, but it rejected with " + fmt(e)); return e; }).then(function (v) { return expect(v, label)[not ? "not" : "_"][k].apply(null, args); });
          return M[k].apply(null, args);
        };
      });
      return api;
    }
    var base = make(false);
    base._ = base;
    base.not = make(true);
    base.resolves = make(false, "resolves"); base.resolves.not = make(true, "resolves");
    base.rejects = make(false, "rejects"); base.rejects.not = make(true, "rejects");
    return base;
  }
  expect.any = function (C) { return asym("Any", function (v) { return v != null && (v.constructor === C || v instanceof C || (C === Number && typeof v === "number") || (C === String && typeof v === "string") || (C === Boolean && typeof v === "boolean") || (C === Function && typeof v === "function")); }, C && C.name); };
  expect.anything = function () { return asym("Anything", function (v) { return v != null; }, ""); };
  expect.stringContaining = function (s) { return asym("StringContaining", function (v) { return typeof v === "string" && v.indexOf(s) >= 0; }, JSON.stringify(s)); };
  expect.stringMatching = function (re) { return asym("StringMatching", function (v) { return typeof v === "string" && new RegExp(re).test(v); }, String(re)); };
  expect.objectContaining = function (o) { return asym("ObjectContaining", function (v) { return subset(v, o); }, fmt(o)); };
  expect.arrayContaining = function (a) { return asym("ArrayContaining", function (v) { return Array.isArray(v) && a.every(function (x) { return v.some(function (y) { return eq(y, x); }); }); }, fmt(a)); };
  var assertions = 0;
  var countedExpect = function () { assertions++; return expect.apply(null, arguments); };
  Object.assign(countedExpect, expect);
  countedExpect.assertions = function () {};
  countedExpect.hasAssertions = function () {};

  /* ── test collection ── */
  var rootSuite = { name: "", children: [], before: [], after: [], beforeEach: [], afterEach: [], parent: null };
  var cur = rootSuite, currentFile = "";
  function describe(name, body) { var s = { name: String(name), children: [], before: [], after: [], beforeEach: [], afterEach: [], parent: cur, file: currentFile }; cur.children.push(s); var prev = cur; cur = s; try { body(); } finally { cur = prev; } }
  describe.skip = function (name) { cur.children.push({ name: String(name), test: true, skip: true, file: currentFile, parent: cur }); };
  describe.only = describe;
  describe.each = function (rows) { return function (name, body) { rows.forEach(function (r) { describe(fmtEach(name, r), function () { body.apply(null, Array.isArray(r) ? r : [r]); }); }); }; };
  function fmtEach(name, r) { var a = Array.isArray(r) ? r.slice() : [r]; return String(name).replace(/%[sdio]/g, function () { var v = a.shift(); return typeof v === "string" ? v : fmt(v); }).replace(/\$(\w+)/g, function (_, k) { return r && typeof r === "object" && k in r ? r[k] : "$" + k; }); }
  function it(name, body, timeout) { cur.children.push({ name: String(name), test: true, fn: body, file: currentFile, parent: cur, timeout: typeof timeout === "number" ? timeout : 5000 }); }
  it.skip = function (name) { cur.children.push({ name: String(name), test: true, skip: true, file: currentFile, parent: cur }); };
  it.todo = function (name) { cur.children.push({ name: String(name), test: true, todo: true, skip: true, file: currentFile, parent: cur }); };
  it.only = it;
  it.each = function (rows) { return function (name, body, t) { rows.forEach(function (r) { it(fmtEach(name, r), function () { return body.apply(null, Array.isArray(r) ? r : [r]); }, t); }); }; };
  var hook = function (k) { return function (f) { cur[k].push(f); }; };

  var VITEST = { describe: describe, it: it, test: it, expect: countedExpect, vi: vi, vitest: vi, beforeAll: hook("before"), afterAll: hook("after"), beforeEach: hook("beforeEach"), afterEach: hook("afterEach"), suite: describe };
  var RTL = Object.assign({ render: render, screen: screen, within: within, cleanup: cleanup, waitFor: waitFor, fireEvent: fireEvent, act: act, waitForElementToBeRemoved: function (cb, o) { return waitFor(function () { var x = typeof cb === "function" ? cb() : cb; if (x && (!Array.isArray(x) || x.length) && (x.nodeType ? document.body.contains(x) : true)) throw new Error("Element is still in the document"); }, o); } }, screen);

  /* ── module system ── */
  var cache = {};
  var nrm = function (n) { return n.replace(/^(\.\.?\/)+/, ""); };
  function resolve(name, from) {
    var n = name;
    if (/^\.\.?\//.test(name) && from) {
      var parts = from.split("/").slice(0, -1);
      name.split("/").forEach(function (p) { if (p === "..") parts.pop(); else if (p !== ".") parts.push(p); });
      n = parts.join("/");
    } else n = nrm(name);
    var c = [n, n + ".jsx", n + ".js", n + ".tsx", n + ".ts", n + "/index.jsx", n + "/index.js"];
    for (var i = 0; i < c.length; i++) if (cfg.mods[c[i]] != null) return c[i];
    var base = n.split("/").pop();
    for (var f in cfg.mods) if (f.replace(/\.(jsx?|tsx?)$/, "").split("/").pop() === base) return f;
    return null;
  }
  function load(file) {
    if (cache[file]) return cache[file].exports;
    var module = { exports: {} };
    cache[file] = module;
    var fnc = new Function("require", "module", "exports", "React", cfg.mods[file] + "\n//# sourceURL=" + file);
    fnc(function (n) { return req(n, file); }, module, module.exports, React);
    return module.exports;
  }
  function req(name, from) {
    if (name === "react") return React;
    if (name === "react-dom" || name === "react-dom/client") return ReactDOM;
    if (name === "react/jsx-runtime" || name === "react/jsx-dev-runtime") return window.__syJSX;
    if (name === "vitest") return VITEST;
    if (name === "@testing-library/react") return RTL;
    if (name === "@testing-library/user-event") return { __esModule: true, default: userEvent, userEvent: userEvent };
    if (/^@testing-library\/jest-dom/.test(name) || /^vitest-axe\/extend-expect/.test(name) || name === "vitest-axe/matchers") return {};
    if (name === "vitest-axe" || name === "jest-axe") return { axe: axe, configureAxe: function () { return axe; }, toHaveNoViolations: {} };
    if (name === "msw") return { http: http, HttpResponse: HttpResponse, rest: http };
    if (name === "msw/node" || name === "msw/browser") return { setupServer: setupServer, setupWorker: setupServer };
    var f = resolve(name, from);
    if (f) return load(f);
    if (/\.(css|scss)$/i.test(name)) return {};
    if (/\.(png|jpe?g|gif|svg|webp)$/i.test(name)) return { __esModule: true, default: nrm(name) };
    throw new Error("Cannot find module '" + name + "'" + (from ? " imported from " + from : "") + ". This lab includes vitest, @testing-library/react, @testing-library/user-event, @testing-library/jest-dom, msw and vitest-axe.");
  }

  /* ── runner ── */
  function path(t) { var p = []; for (var s = t.parent; s && s.parent; s = s.parent) p.unshift(s.name); return p; }
  function chain(t, k) { var out = []; for (var s = t.parent; s; s = s.parent) out.unshift.apply(out, s[k]); return k === "afterEach" ? out.reverse() : out; }
  async function runSuite(s, results) {
    for (var i = 0; i < s.before.length; i++) await s.before[i]();
    for (var j = 0; j < s.children.length; j++) {
      var c = s.children[j];
      if (!c.test) { await runSuite(c, results); continue; }
      var r = { file: c.file, path: path(c), name: c.name, ok: false, skip: !!c.skip, todo: !!c.todo, err: "", ms: 0 };
      if (c.skip) { results.push(r); continue; }
      var t0 = performance.now();
      try {
        var be = chain(c, "beforeEach");
        for (var b = 0; b < be.length; b++) await be[b]();
        var to = c.timeout;
        await Promise.race([Promise.resolve().then(c.fn), new Promise(function (_, rej) { setTimeout(function () { rej(new Error("Test timed out in " + to + "ms. Did you forget to await something, or does findBy… never find the element?")); }, to); })]);
        r.ok = true;
      } catch (e) {
        r.err = (e && e.name && e.name !== "Error" ? e.name + ": " : "") + (e && e.message ? e.message : String(e));
      }
      try { var ae = chain(c, "afterEach"); for (var a = 0; a < ae.length; a++) await ae[a](); } catch (e) { if (r.ok) { r.ok = false; r.err = "afterEach failed: " + e.message; } }
      cleanup();
      r.ms = Math.round(performance.now() - t0);
      results.push(r);
    }
    for (var k = 0; k < s.after.length; k++) await s.after[k]();
  }
  async function main() {
    var results = [], fileErrors = [];
    var files = cfg.testFiles;
    for (var i = 0; i < files.length; i++) {
      cache = {}; currentFile = files[i];
      var suite = { name: files[i], children: [], before: [], after: [], beforeEach: [], afterEach: [], parent: rootSuite, file: files[i], fileSuite: true };
      rootSuite.children = [suite]; cur = suite;
      try {
        (cfg.setupFiles || []).forEach(function (sf) { load(sf); });
        load(files[i]);
      } catch (e) { fileErrors.push({ file: files[i], err: (e.name || "Error") + ": " + e.message }); cur = rootSuite; continue; }
      cur = rootSuite;
      try { await runSuite(suite, results); } catch (e) { fileErrors.push({ file: files[i], err: "Hook failed: " + e.message }); }
      if (active) { window.fetch = origFetch; active = null; }
      vi.unstubAllGlobals();
    }
    results.forEach(function (r) { r.path = r.path.slice(1); });
    post({ done: true, results: results, fileErrors: fileErrors, hits: hits, logs: logs.slice(0, 80) });
  }
  addEventListener("error", function (e) { logs.push({ level: "error", m: String(e.message) }); });
  addEventListener("unhandledrejection", function (e) { logs.push({ level: "error", m: "Unhandled rejection: " + (e.reason && e.reason.message || e.reason) }); });
  document.readyState === "loading" ? addEventListener("DOMContentLoaded", main) : main();
}

const safe = (js) => js.replace(/<\/script/gi, "<\\/script");

/** Run every test file in a hidden iframe. Resolves to { results, fileErrors, hits, logs, errors, cov }. */
export async function runTests(files, { coverage = false, api = true, timeout = 30000 } = {}) {
  const ts = await loadCompiler();
  const compiled = compileTests(ts, files, { coverage });
  const testFiles = Object.keys(files).filter(isTestFile);
  if (compiled.errors.length) return { errors: compiled.errors, results: [], fileErrors: [], hits: {}, logs: [], cov: compiled.cov, testFiles };
  const id = "t" + Math.random().toString(36).slice(2);
  const setupFiles = Object.keys(files).filter((f) => /(^|\/)setup(Tests)?\.(jsx?|tsx?)$/.test(f));
  const cfg = { id, mods: compiled.mods, testFiles, setupFiles };
  const doc = `<!doctype html><html><head><meta charset="utf-8"><style>${compiled.css}</style>${api ? "<script>" + MOCK_API_SCRIPT + "<\/script>" : ""}<script src="${vendorUrl("react-19.2.8.js")}"><\/script></head><body><script>(${safe(syTestRuntime.toString())})(${safe(JSON.stringify(cfg))});<\/script></body></html>`;
  return new Promise((resolve) => {
    const fr = document.createElement("iframe");
    fr.setAttribute("sandbox", "allow-scripts allow-forms");
    fr.setAttribute("aria-hidden", "true");
    fr.tabIndex = -1;
    fr.style.cssText = "position:fixed;left:-10000px;top:0;width:1024px;height:768px;border:0;opacity:0;pointer-events:none";
    const done = (d) => { clearTimeout(timer); removeEventListener("message", on); fr.remove(); resolve({ errors: [], cov: compiled.cov, testFiles, ...d }); };
    const on = (e) => { if (e.data && e.data.__sytl === id && e.data.done) done(e.data); };
    const timer = setTimeout(() => done({ results: [], fileErrors: [{ file: "", err: "The tests took longer than " + timeout / 1000 + "s. Is something waiting forever?" }], hits: {}, logs: [] }), timeout);
    addEventListener("message", on);
    fr.srcdoc = doc;
    document.body.appendChild(fr);
  });
}

/** Turn raw hits into a coverage table: [{ file, s: [hit,total], f: [hit,total], lines: uncovered line numbers }]. */
export function coverageReport(run) {
  return Object.entries(run.cov || {}).map(([file, meta]) => {
    const h = (run.hits && run.hits[file]) || { s: {}, f: {} };
    const sHit = meta.s.filter((_, i) => h.s[i]).length, fHit = meta.f.filter((_, i) => h.f[i]).length;
    const lines = [...new Set(meta.s.map((l, i) => (h.s[i] ? null : l)).filter((x) => x != null))].sort((a, b) => a - b);
    const fnsMissed = meta.f.filter((_, i) => !h.f[i]).map((x) => x.name);
    return { file, s: [sHit, meta.s.length], f: [fHit, meta.f.length], lines, fnsMissed };
  });
}
export const pct = ([a, b]) => (b ? Math.round((a / b) * 1000) / 10 : 100);
