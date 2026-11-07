/* Module — User Interface Design. Lesson titles match the syllabus so the topic lists attach.
   Challenges measure the design itself: real spacing, sizes, alignment and contrast from computed styles. */

const cs = (w, el) => w.getComputedStyle(el);
const px = (v) => parseFloat(v) || 0;
const sheetHas = (d, re) => Array.from(d.body.getRootNode().styleSheets || []).some((ss) => Array.from(ss.cssRules).some((r) => re.test(r.cssText)));
const ph = (w, h, bg, fg, text) => "data:image/svg+xml," + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect width="100%" height="100%" fill="${bg}"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="system-ui,sans-serif" font-size="${Math.round(h / 8)}" fill="${fg}">${text}</text></svg>`);

/* colour maths on computed styles */
const rgba = (s) => { const m = String(s).match(/[\d.]+/g) || [0, 0, 0, 0]; return [+m[0], +m[1], +m[2], m[3] === undefined ? 1 : +m[3]]; };
const lumOf = ([r, g, b]) => { const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
const ratio = (a, b) => { const x = lumOf(a), y = lumOf(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
/** The first opaque background behind an element (white if none). */
const bgOf = (w, el) => { for (let e = el; e && e.nodeType === 1; e = e.parentElement) { const c = rgba(w.getComputedStyle(e).backgroundColor); if (c[3] > 0.5) return c; } return [255, 255, 255, 1]; };
const contrastOf = (w, el) => ratio(rgba(w.getComputedStyle(el).color), bgOf(w, el));
const transparentBg = (w, el) => rgba(w.getComputedStyle(el).backgroundColor)[3] < 0.1 || bgOf(w, el.parentElement).slice(0, 3).join() === rgba(w.getComputedStyle(el).backgroundColor).slice(0, 3).join();
const gapBetween = (a, b) => b.getBoundingClientRect().top - a.getBoundingClientRect().bottom;

const PROFILE_HTML = `<article class="card">
  <img class="avatar" src="${ph(160, 160, "#c9b8ff", "#2b1d6b", "MC")}" alt="">
  <h2 class="name">Maya Chen</h2>
  <p class="role">Product designer · Lisbon</p>
  <p class="bio">I design calm, accessible interfaces for fintech and health apps.</p>
  <div class="actions"><a class="btn" href="/message">Message Maya</a></div>
</article>`;

const PRICING_HTML = `<article class="plan">
  <p class="plan-name">Pro plan</p>
  <p class="price">$12<span>/month</span></p>
  <ul class="features">
    <li>Unlimited projects</li>
    <li>Priority support</li>
    <li>Custom domains</li>
  </ul>
  <a class="btn primary" href="/trial">Start free trial</a>
  <a class="btn secondary" href="/plans">Compare plans</a>
</article>`;
const PRICING_CSS = `body { font-family: Georgia, serif; background: #e4e4e4; }
.plan { background: #f2f2f2; border: 2px solid #888; width: 300px; padding: 6px; text-align: center; }
.plan-name { font-size: 18px; margin: 4px; color: #3aa63a; }
.price { font-size: 18px; margin: 4px; }
.price span { font-size: 18px; }
.features { color: #b5b5b5; margin: 4px; }
.btn { display: block; margin: 4px; padding: 6px; border: 1px solid #777; background: #cfcfcf; color: #333; text-decoration: none; }`;
const PRICING_DONE = `body { font-family: Inter, system-ui, sans-serif; background: #f4f3fa; }
.plan { background: #fff; border: 1px solid #e6e3f5; border-radius: 16px; width: 300px; padding: 28px; text-align: left; box-shadow: 0 8px 24px rgba(30, 20, 80, 0.08); }
.plan-name { font-size: 12px; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; color: #5b3ce0; margin: 0 0 8px; }
.price { font-size: 44px; font-weight: 800; color: #1d1b2f; margin: 0 0 20px; line-height: 1; }
.price span { font-size: 16px; font-weight: 500; color: #5b5873; }
.features { color: #5b5873; margin: 0 0 24px; padding-left: 18px; line-height: 1.9; }
.btn { display: block; padding: 12px; border-radius: 10px; text-align: center; text-decoration: none; font-weight: 700; }
.primary { background: #5b3ce0; color: #fff; }
.secondary { background: transparent; color: #5b3ce0; margin-top: 8px; }`;

/* Dashboard project */
const DASH_HTML = `<main class="dash">
  <header class="top">
    <h1>Overview</h1>
    <p class="date">Last 30 days</p>
  </header>
  <section class="metrics">
    <article class="metric"><h2 class="label">Revenue</h2><p class="value">$48,210</p><p class="delta up">▲ 12.4%</p></article>
    <article class="metric"><h2 class="label">Visitors</h2><p class="value">18,402</p><p class="delta up">▲ 3.1%</p></article>
    <article class="metric"><h2 class="label">Conversion</h2><p class="value">2.9%</p><p class="delta down">▼ 0.4%</p></article>
    <article class="metric"><h2 class="label">Avg. order</h2><p class="value">$64.20</p><p class="delta up">▲ 1.8%</p></article>
  </section>
</main>`;
const DASH_UGLY = `body { margin: 0; background: #9fb4c7; font-family: "Times New Roman", serif; }
.top h1 { font-size: 20px; }
.date { color: #c3ced8; }
.metric { background: #7d8fa3; color: #c9d3dd; border: 3px solid #d33; margin: 2px; padding: 2px; text-align: center; float: left; width: 300px; }
.label { font-size: 22px; }
.value { font-size: 16px; }
.delta.up { color: #8fe08f; }
.delta.down { color: #ff9a9a; }`;
const DASH_STEP1 = `body { margin: 0; background: #f5f6fa; font-family: Inter, system-ui, sans-serif; color: #1b1e2e; }
.top h1 { font-size: 28px; margin: 0; }
.date { color: #5c6178; margin: 4px 0 0; }
.metric { background: #fff; color: #1b1e2e; border: 1px solid #e3e5ee; border-radius: 12px; margin: 2px; padding: 2px; text-align: left; float: left; width: 300px; }
.label { font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; color: #5c6178; margin: 0; }
.value { font-size: 34px; font-weight: 800; margin: 0; }
.delta { font-weight: 700; margin: 0; }
.delta.up { color: #1a7f4b; }
.delta.down { color: #c0362c; }`;
const DASH_STEP2 = `body { margin: 0; background: #f5f6fa; font-family: Inter, system-ui, sans-serif; color: #1b1e2e; }
.dash { padding: 24px; }
.top { margin-bottom: 24px; }
.top h1 { font-size: 28px; margin: 0; }
.date { color: #5c6178; margin: 4px 0 0; }
.metrics { display: grid; gap: 16px; }
.metric { background: #fff; color: #1b1e2e; border: 1px solid #e3e5ee; border-radius: 12px; padding: 20px; text-align: left; }
.label { font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; color: #5c6178; margin: 0 0 8px; }
.value { font-size: 34px; font-weight: 800; margin: 0 0 4px; }
.delta { font-weight: 700; margin: 0; }
.delta.up { color: #1a7f4b; }
.delta.down { color: #c0362c; }`;
const DASH_STEP3 = DASH_STEP2 + `

@media (min-width: 40em) {
  .metrics { grid-template-columns: repeat(2, 1fr); }
}
@media (min-width: 64em) {
  .dash { padding: 40px; max-width: 75rem; margin: 0 auto; }
  .metrics { grid-template-columns: repeat(4, 1fr); gap: 24px; }
}`;

export const UI = {
  id: "ui",
  title: "User Interface Design",
  blurb: "Take your design skills to the next level and become a frontend developer with design superpowers.",
  concepts: ["Visual hierarchy and spacing scales", "Typography and color", "Layout grids", "Refactoring UIs"],
  lessons: [
    /* ───────────────────────── Welcome ───────────────────────── */
    { id: "ui-welcome", title: "Welcome to the UI Design Module", min: 10, kind: "lesson", body: [
      { t: "p", h: "You can already build anything you can see. This module teaches you to decide <b>what it should look like</b>. Good UI design isn't talent or taste you're born with: it's a handful of principles applied consistently, and developers who know them build better products and work better with designers." },
      { t: "video", name: "ui" },
      { t: "callout", kind: "key", h: "Five principles do most of the work: <b>white space</b>, <b>alignment</b>, <b>scale</b>, <b>colour</b> and <b>visual hierarchy</b>. Every challenge in this module measures one of them in your real CSS." },
      { t: "steps", items: ["<b>UI Design Fundamentals</b>: the five principles, one challenge each, then a final refactor", "<b>Design a Simple Layout</b>: a photographer's site, dark theme, multi-column and photos", "<b>Refactor a Metrics Dashboard</b>: take an ugly dashboard to polished and responsive"] },
      { t: "quiz", q: "A card \"looks off\", but the content is fine. What's usually wrong?", opts: ["The font isn't trendy enough", "Inconsistent spacing, alignment, sizes and emphasis: small decisions, not the content", "It needs more colours and borders"], a: 1, why: "Most amateur-looking UIs fail on spacing, alignment and hierarchy. Fix those and even a plain design looks professional." },
      { t: "recap", items: ["UI design is learnable: principles, not talent", "White space, alignment, scale, colour, hierarchy", "Challenges check real computed styles, so the numbers matter"] },
    ]},

    /* ───────────────────────── Fundamentals ───────────────────────── */
    { id: "ui-fund", title: "UI Design Fundamentals", min: 120, kind: "lesson", body: [
      { t: "h", h: "Common design and non-dev roles" },
      { t: "p", h: "On a product team you'll meet <b>UI designers</b> (how screens look: layout, type, colour), <b>UX designers</b> (how it works: flows, structure, usability), <b>product designers</b> (both, end to end), <b>UX researchers</b> (talk to users and test ideas), <b>content designers</b> (the words), and <b>product managers</b> (what to build and why). A developer with design sense can turn a rough brief into a good screen and spot problems in a mockup before they're built." },
      { t: "quiz", q: "Who would run interviews and usability tests to find out why users abandon sign-up?", opts: ["A UI designer", "A UX researcher", "A content designer"], a: 1, why: "UX researchers study users' behaviour and needs. Their findings feed the designers' and PMs' decisions." },
      { t: "h", h: "White space" },
      { t: "p", h: "White space (or negative space) is the empty room around and between things. It isn't wasted: it groups related items and separates unrelated ones. This is the <b>law of proximity</b>: things close together look like they belong together. So keep spacing <b>tight within a group</b> (a name and its job title) and <b>looser between groups</b> (the header and the bio)." },
      { t: "callout", kind: "tip", h: "Use a <b>spacing scale</b> instead of random numbers: 4, 8, 12, 16, 24, 32, 48, 64. Every gap comes from the scale, so everything feels related. Start with too much space, then remove it." },
      { t: "htmlch", preview: true, prompt: "Give the profile card room to breathe: at least <b>16px</b> of padding on every side, the name and role tight together (<b>8px or less</b> apart), a clearly bigger gap (<b>at least 12px</b>) before the bio, and at least <b>16px</b> above the button.", html: PROFILE_HTML, css: `body { font-family: Inter, system-ui, sans-serif; background: #f4f3fa; }
.card { background: #fff; border: 1px solid #ddd; width: 280px; padding: 4px; }
.avatar { width: 72px; height: 72px; border-radius: 50%; display: block; }
.name { font-size: 20px; margin: 18px 0 18px; }
.role { color: #5b5873; margin: 0; }
.bio { margin: 0; line-height: 1.5; }
.btn { display: inline-block; background: #5b3ce0; color: #fff; padding: 10px 16px; border-radius: 8px; text-decoration: none; }`, solution: { css: `body { font-family: Inter, system-ui, sans-serif; background: #f4f3fa; }
.card { background: #fff; border: 1px solid #ddd; border-radius: 16px; width: 280px; padding: 24px; }
.avatar { width: 72px; height: 72px; border-radius: 50%; display: block; margin-bottom: 16px; }
.name { font-size: 20px; margin: 0 0 4px; }
.role { color: #5b5873; margin: 0 0 16px; }
.bio { margin: 0 0 24px; line-height: 1.5; }
.btn { display: inline-block; background: #5b3ce0; color: #fff; padding: 10px 16px; border-radius: 8px; text-decoration: none; }` }, checks: [
        { msg: "The card has at least 16px padding on every side", fn: (d, w) => { const c = cs(w, d.querySelector(".card")); return ["Top", "Right", "Bottom", "Left"].every((s) => px(c["padding" + s]) >= 16); } },
        { msg: "Name and role are 8px apart or less", fn: (d) => { const g = gapBetween(d.querySelector(".name"), d.querySelector(".role")); return g >= 0 && g <= 8; } },
        { msg: "At least 12px between role and bio, and more than between name and role", fn: (d) => { const a = gapBetween(d.querySelector(".name"), d.querySelector(".role")), b = gapBetween(d.querySelector(".role"), d.querySelector(".bio")); return b >= 12 && b > a; } },
        { msg: "At least 16px above the button", fn: (d) => gapBetween(d.querySelector(".bio"), d.querySelector(".actions")) >= 16 },
      ] },
      { t: "h", h: "Alignment" },
      { t: "p", h: "Every element should line up with something. Strong, shared edges make a layout feel calm and intentional; things that are nearly aligned look like mistakes. For text-heavy UI, <b>left-align</b>: our eyes return to the same left edge at the start of each line. Save centring for short, standalone content like a hero heading." },
      { t: "htmlch", preview: true, prompt: "The sign-up form is centred and ragged. Left-align the text, and make the labels, inputs and button share <b>one left edge</b> with the inputs and button all the <b>same width</b>.", html: `<form class="signup">
  <h2>Create your account</h2>
  <label for="em">Email</label>
  <input id="em" type="email" size="18">
  <label for="pw">Password</label>
  <input id="pw" type="password" size="12">
  <button>Sign up</button>
</form>`, css: `body { font-family: Inter, system-ui, sans-serif; }
.signup { width: 300px; padding: 24px; border: 1px solid #ddd; border-radius: 12px; text-align: center; }
label { display: block; margin: 12px 0 4px; font-weight: 600; }
input { padding: 8px; border: 1px solid #aaa; border-radius: 6px; }
button { margin-top: 16px; margin-left: 30px; padding: 10px 20px; border: 0; border-radius: 8px; background: #5b3ce0; color: #fff; font-weight: 700; }`, solution: { css: `body { font-family: Inter, system-ui, sans-serif; }
.signup { width: 300px; padding: 24px; border: 1px solid #ddd; border-radius: 12px; text-align: left; }
label { display: block; margin: 12px 0 4px; font-weight: 600; }
input { display: block; width: 100%; box-sizing: border-box; padding: 8px; border: 1px solid #aaa; border-radius: 6px; }
button { display: block; width: 100%; margin-top: 16px; padding: 10px 20px; border: 0; border-radius: 8px; background: #5b3ce0; color: #fff; font-weight: 700; }` }, checks: [
        { msg: "Text is left-aligned", fn: (d, w) => ["left", "start"].includes(cs(w, d.querySelector(".signup")).textAlign) },
        { msg: "Heading, labels, inputs and button share one left edge", fn: (d) => { const xs = Array.from(d.querySelectorAll("h2, label, input, button")).map((e) => Math.round(e.getBoundingClientRect().left)); return xs.every((x) => Math.abs(x - xs[0]) <= 1); } },
        { msg: "Inputs and button are the same width", fn: (d) => { const ws = Array.from(d.querySelectorAll("input, button")).map((e) => Math.round(e.getBoundingClientRect().width)); return ws.every((x) => Math.abs(x - ws[0]) <= 1) && ws[0] > 150; } },
      ] },
      { t: "h", h: "Scale" },
      { t: "p", h: "Size tells people what matters. Make the important thing <b>much</b> bigger, not slightly bigger: a 16px number next to a 15px label reads as the same level. Small, uppercase, letter-spaced labels let big values stand out." },
      { t: "htmlch", preview: true, prompt: "Design challenge: make the stat readable at a glance. The value must be at least <b>twice</b> the label's font size and bold (700+). Make the label small (<b>14px or less</b>) and spaced out (any positive <code>letter-spacing</code>).", html: `<div class="stat">
  <p class="label">Active users</p>
  <p class="value">12,847</p>
</div>`, css: `body { font-family: Inter, system-ui, sans-serif; }
.stat { width: 220px; padding: 20px; border: 1px solid #e3e5ee; border-radius: 12px; }
.label { font-size: 18px; margin: 0; }
.value { font-size: 20px; margin: 0; }`, solution: { css: `body { font-family: Inter, system-ui, sans-serif; }
.stat { width: 220px; padding: 20px; border: 1px solid #e3e5ee; border-radius: 12px; }
.label { font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: #5c6178; margin: 0 0 6px; }
.value { font-size: 36px; font-weight: 800; margin: 0; }` }, checks: [
        { msg: "Value is at least 2× the label's size", fn: (d, w) => px(cs(w, d.querySelector(".value")).fontSize) >= 2 * px(cs(w, d.querySelector(".label")).fontSize) },
        { msg: "Value is bold (700 or more)", fn: (d, w) => +cs(w, d.querySelector(".value")).fontWeight >= 700 },
        { msg: "Label is 14px or smaller with letter-spacing", fn: (d, w) => { const c = cs(w, d.querySelector(".label")); return px(c.fontSize) <= 14 && px(c.letterSpacing) > 0; } },
      ] },
      { t: "p", h: "A <b>type scale</b> picks sizes from one ratio, like spacing does. With a base of 16px and a ratio of 1.25: 16, 20, 25, 31, 39. Fewer, more distinct sizes beat many similar ones." },
      { t: "htmlch", preview: true, prompt: "Design challenge 2: build a type scale. Define <code>--ratio</code> on <code>:root</code>, and size the article so each level is at least <b>1.2×</b> the one below: <code>h1</code> ≥ 1.2 × <code>h2</code>, <code>h2</code> ≥ 1.2 × <code>p</code>. Keep paragraphs at 16px or more, with a line-height of at least 1.4.", html: `<article>
  <h1>Designing calm interfaces</h1>
  <h2>Start with space</h2>
  <p>Before colour or type, decide what belongs together. Group it with space, and the rest of the design gets easier.</p>
</article>`, css: `body { font-family: Inter, system-ui, sans-serif; }
h1 { font-size: 22px; }
h2 { font-size: 20px; }
p { font-size: 15px; line-height: 1.2; }`, solution: { css: `:root { --ratio: 1.25; --base: 1rem; }
body { font-family: Inter, system-ui, sans-serif; }
h1 { font-size: calc(var(--base) * var(--ratio) * var(--ratio) * var(--ratio)); line-height: 1.15; }
h2 { font-size: calc(var(--base) * var(--ratio) * var(--ratio)); line-height: 1.2; }
p { font-size: var(--base); line-height: 1.6; }` }, checks: [
        { msg: "--ratio is defined", fn: (d) => sheetHas(d, /--ratio\s*:/) },
        { msg: "h1 ≥ 1.2 × h2", fn: (d, w) => px(cs(w, d.querySelector("h1")).fontSize) >= 1.2 * px(cs(w, d.querySelector("h2")).fontSize) - 0.01 },
        { msg: "h2 ≥ 1.2 × p", fn: (d, w) => px(cs(w, d.querySelector("h2")).fontSize) >= 1.2 * px(cs(w, d.querySelector("p")).fontSize) - 0.01 },
        { msg: "Paragraph is 16px+ with line-height ≥ 1.4", fn: (d, w) => { const c = cs(w, d.querySelector("p")); return px(c.fontSize) >= 16 && px(c.lineHeight) >= 1.4 * px(c.fontSize) - 0.01; } },
      ] },
      { t: "h", h: "Colour" },
      { t: "p", h: "Start in greyscale and add colour last, on purpose. A common balance is <b>60-30-10</b>: 60% a neutral background, 30% a secondary surface or text colour, 10% one accent for actions and highlights. Work in <b>HSL</b> so you can make tints and shades of one hue by changing only lightness, and tint your greys slightly towards your brand hue so they don't look dead." },
      { t: "code", lang: "css", code: `:root {
  --accent: hsl(255 70% 55%);      /* actions, links, focus */
  --accent-soft: hsl(255 90% 96%); /* subtle backgrounds */
  --ink: hsl(245 25% 15%);         /* main text, not pure black */
  --muted: hsl(245 10% 40%);       /* secondary text: still ≥ 4.5:1 */
  --surface: hsl(245 30% 98%);
}` },
      { t: "contrast", fg: "#b8b3cc", bg: "#ffffff" },
      { t: "htmlch", preview: true, prompt: "The notification is pretty but hard to read. Fix the colours so <code>.meta</code> and the button text both reach at least <b>4.5:1</b> contrast against their backgrounds. Keep the purple feel.", html: `<div class="note">
  <p class="title">New comment on your design</p>
  <p class="meta">Ana · 2 minutes ago</p>
  <button class="view">View comment</button>
</div>`, css: `body { font-family: Inter, system-ui, sans-serif; }
.note { background: #fff; border: 1px solid #ece9f8; border-radius: 12px; padding: 16px; width: 280px; }
.title { margin: 0 0 4px; font-weight: 700; color: #1d1b2f; }
.meta { margin: 0 0 12px; color: #b8b3cc; font-size: 14px; }
.view { background: #b9a6ff; color: #fff; border: 0; border-radius: 8px; padding: 8px 14px; font-weight: 700; }`, solution: { css: `body { font-family: Inter, system-ui, sans-serif; }
.note { background: #fff; border: 1px solid #ece9f8; border-radius: 12px; padding: 16px; width: 280px; }
.title { margin: 0 0 4px; font-weight: 700; color: #1d1b2f; }
.meta { margin: 0 0 12px; color: #625d78; font-size: 14px; }
.view { background: #5b3ce0; color: #fff; border: 0; border-radius: 8px; padding: 8px 14px; font-weight: 700; }` }, checks: [
        { msg: ".meta text has 4.5:1 contrast or more", fn: (d, w) => contrastOf(w, d.querySelector(".meta")) >= 4.5 },
        { msg: "Button text has 4.5:1 contrast or more", fn: (d, w) => contrastOf(w, d.querySelector(".view")) >= 4.5 },
        { msg: "The button is still purple-ish (blue channel above red and green)", fn: (d, w) => { const [r, g, b] = rgba(cs(w, d.querySelector(".view")).backgroundColor); return b > g && r > g; } },
      ] },
      { t: "h", h: "Visual hierarchy" },
      { t: "p", h: "Hierarchy is the order people notice things. Combine size, weight, colour and space so there's one obvious first thing, and <b>one primary action</b> per view. Secondary actions step back (outlined or text-only); destructive actions get distance and a different colour, not more emphasis." },
      { t: "htmlch", preview: true, prompt: "Two equal grey buttons make people stop and think. Make <code>.save</code> the primary action (a filled, saturated background with white text, 600+ weight) and <code>.cancel</code> a quiet secondary action (transparent background, no thick border).", html: `<div class="bar">
  <button class="cancel">Cancel</button>
  <button class="save">Save changes</button>
</div>`, css: `body { font-family: Inter, system-ui, sans-serif; }
.bar { display: flex; gap: 8px; justify-content: flex-end; padding: 16px; border-top: 1px solid #eee; }
button { padding: 10px 16px; border-radius: 8px; border: 2px solid #999; background: #ddd; color: #333; font: inherit; }`, solution: { css: `body { font-family: Inter, system-ui, sans-serif; }
.bar { display: flex; gap: 8px; justify-content: flex-end; padding: 16px; border-top: 1px solid #eee; }
button { padding: 10px 16px; border-radius: 8px; border: 0; font: inherit; }
.save { background: #5b3ce0; color: #fff; font-weight: 700; }
.cancel { background: transparent; color: #4a4560; }` }, checks: [
        { msg: ".save has a filled, saturated background", fn: (d, w) => { const [r, g, b, a] = rgba(cs(w, d.querySelector(".save")).backgroundColor); return a > 0.9 && Math.max(r, g, b) - Math.min(r, g, b) > 60; } },
        { msg: ".save text is white-ish, 600+ weight, and readable", fn: (d, w) => { const c = cs(w, d.querySelector(".save")); return lumOf(rgba(c.color)) > 0.8 && +c.fontWeight >= 600 && contrastOf(w, d.querySelector(".save")) >= 4.5; } },
        { msg: ".cancel has a transparent background and a border under 2px", fn: (d, w) => { const c = cs(w, d.querySelector(".cancel")); return rgba(c.backgroundColor)[3] < 0.1 && px(c.borderTopWidth) < 2; } },
      ] },
      { t: "h", h: "The final challenge" },
      { t: "widget", name: "uituner" },
      { t: "htmlch", preview: true, prompt: "Refactor the pricing card with all five principles: <b>24px+ padding</b> and left-aligned text; a price at least <b>2.5×</b> the feature text size; features at <b>4.5:1</b> contrast; a filled primary button with readable text; and a secondary action with a transparent background.", html: PRICING_HTML, css: PRICING_CSS, solution: { css: PRICING_DONE }, checks: [
        { msg: "Card padding is 24px or more, text left-aligned", fn: (d, w) => { const c = cs(w, d.querySelector(".plan")); return px(c.paddingTop) >= 24 && px(c.paddingLeft) >= 24 && ["left", "start"].includes(c.textAlign); } },
        { msg: "Price is at least 2.5× the feature text", fn: (d, w) => px(cs(w, d.querySelector(".price")).fontSize) >= 2.5 * px(cs(w, d.querySelector(".features")).fontSize) },
        { msg: "Features have 4.5:1 contrast", fn: (d, w) => contrastOf(w, d.querySelector(".features li")) >= 4.5 },
        { msg: "Primary button: filled colour, readable text", fn: (d, w) => { const p = d.querySelector(".primary"); const [r, g, b] = rgba(cs(w, p).backgroundColor); return Math.max(r, g, b) - Math.min(r, g, b) > 60 && contrastOf(w, p) >= 4.5; } },
        { msg: "Secondary action has a transparent background", fn: (d, w) => transparentBg(w, d.querySelector(".secondary")) },
      ] },
      { t: "h", h: "Closing thoughts" },
      { t: "p", h: "None of this needs a design degree. When something looks off, run through the list: Is the spacing from a scale, tight within groups and loose between them? Does everything share edges? Is the important thing clearly bigger? Is colour used for meaning, with enough contrast? Is there one obvious next step?" },
      { t: "recap", items: ["White space groups and separates: tight within, loose between", "Align to shared edges; left-align text", "Scale: important things much bigger; use a type scale", "Colour: neutral first, one accent, HSL tints, 4.5:1 contrast", "Hierarchy: one primary action; secondary steps back"] },
    ]},

    /* ───────────────────────── Simple layout ───────────────────────── */
    { id: "ui-layout", title: "Design a Simple Layout", min: 90, kind: "project", body: [
      { t: "h", h: "Keeping it ultra simple" },
      { t: "p", h: "We'll design a one-page site for a photographer, Noor Haddad. Simple layouts are the hardest to fake: with few elements, every gap and size shows. One column, generous space, a clear name and one call to action." },
      { t: "rwplay", task: "Drag between phone and desktop widths. Notice how the max-width keeps lines readable (around 60 to 75 characters) on wide screens.", html: `<main class="page">
  <p class="kicker">Photographer · Amman</p>
  <h1>Noor Haddad</h1>
  <p class="intro">Quiet portraits and documentary work for magazines, charities and families.</p>
  <a class="cta" href="/contact">Book a session</a>
</main>`, css: `body { margin: 0; font-family: Inter, system-ui, sans-serif; color: #1d1b2f; }
.page { max-width: 40rem; margin: 0 auto; padding: 4rem 1.5rem; }
.kicker { text-transform: uppercase; letter-spacing: .12em; font-size: .8rem; font-weight: 700; color: #6b5f4a; margin: 0 0 .5rem; }
h1 { font-size: clamp(2.5rem, 8vw, 4.5rem); line-height: 1; margin: 0 0 1.5rem; }
.intro { font-size: 1.25rem; line-height: 1.6; color: #4d4a5c; margin: 0 0 2rem; }
.cta { display: inline-block; background: #1d1b2f; color: #fff; padding: .9rem 1.4rem; border-radius: 999px; text-decoration: none; font-weight: 700; }` },
      { t: "h", h: "Making our layout dark" },
      { t: "p", h: "Photography looks best on dark backgrounds. Good dark themes avoid pure black (#000) and pure white text, which vibrate against each other; use a very dark, slightly tinted grey and an off-white. Show depth with lighter surfaces rather than shadows, and recheck contrast: muted text needs more lightness than you'd think." },
      { t: "htmlch", preview: true, prompt: "Challenge: give the page a dark theme. Use a dark background that <b>isn't pure black</b> (relative luminance under 0.05), off-white body text with <b>at least 7:1</b> contrast, and keep <code>.kicker</code> at <b>4.5:1</b> or more.", html: `<main class="page">
  <p class="kicker">Photographer · Amman</p>
  <h1>Noor Haddad</h1>
  <p class="intro">Quiet portraits and documentary work for magazines, charities and families.</p>
</main>`, css: `body { margin: 0; font-family: Inter, system-ui, sans-serif; background: #fff; color: #1d1b2f; }
.page { padding: 32px 24px; }
.kicker { text-transform: uppercase; letter-spacing: .12em; font-size: .8rem; font-weight: 700; color: #6b5f4a; }
.intro { line-height: 1.6; }`, solution: { css: `body { margin: 0; font-family: Inter, system-ui, sans-serif; background: #121117; color: #ece9f2; }
.page { padding: 32px 24px; }
.kicker { text-transform: uppercase; letter-spacing: .12em; font-size: .8rem; font-weight: 700; color: #d6b98a; }
.intro { line-height: 1.6; color: #c9c5d6; }` }, checks: [
        { msg: "Dark background (luminance under 0.05)…", fn: (d, w) => lumOf(bgOf(w, d.querySelector(".page"))) < 0.05 },
        { msg: "…that isn't pure black", fn: (d, w) => bgOf(w, d.querySelector(".page")).slice(0, 3).join() !== "0,0,0" },
        { msg: "Heading and intro have at least 7:1 contrast", fn: (d, w) => contrastOf(w, d.querySelector("h1")) >= 7 && contrastOf(w, d.querySelector(".intro")) >= 7 },
        { msg: "Text isn't pure white", fn: (d, w) => rgba(cs(w, d.querySelector("h1")).color).slice(0, 3).join() !== "255,255,255" },
        { msg: ".kicker has at least 4.5:1 contrast", fn: (d, w) => contrastOf(w, d.querySelector(".kicker")) >= 4.5 },
      ] },
      { t: "h", h: "Multi-columns" },
      { t: "p", h: "Columns help when content is a set of equal things, like services or projects. One column on phones; more as space allows. Keep gutters consistent, from your spacing scale, and make every column the same width." },
      { t: "rwch", widths: [375, 1024], prompt: "Show the three services in <b>one column on phones</b> and <b>three equal columns from 48em</b>, with a gap of at least 24px. Nothing may overflow at 375px.", html: `<section class="services">
  <article class="service"><h3>Portraits</h3><p>Natural light sessions at home or in the studio.</p></article>
  <article class="service"><h3>Editorial</h3><p>Stories for magazines and charities.</p></article>
  <article class="service"><h3>Families</h3><p>Relaxed afternoons, real moments.</p></article>
</section>`, css: `body { margin: 0; font-family: Inter, system-ui, sans-serif; background: #121117; color: #ece9f2; }
.services { padding: 24px; }
.service { background: #1e1c26; border-radius: 12px; padding: 20px; width: 400px; }`, solution: { css: `body { margin: 0; font-family: Inter, system-ui, sans-serif; background: #121117; color: #ece9f2; }
.services { padding: 24px; display: grid; gap: 24px; }
.service { background: #1e1c26; border-radius: 12px; padding: 20px; }
@media (min-width: 48em) {
  .services { grid-template-columns: repeat(3, 1fr); }
}` }, checks: [
        { msg: "No horizontal overflow at 375px", fn: (at) => !at(375).overflow() },
        { msg: "One service per row at 375px", fn: (at) => at(375).perRow(".service") === 1 },
        { msg: "Three equal columns at 1024px", fn: (at) => { const a = at(1024); const ws = a.$$(".service").map((e) => Math.round(a.rect(e).width)); return a.perRow(".service") === 3 && ws.every((x) => Math.abs(x - ws[0]) <= 1); } },
        { msg: "A gap of 24px or more between columns", fn: (at) => { const a = at(1024); const [x, y] = a.$$(".service"); return a.rect(y).left - a.rect(x).right >= 24; } },
      ] },
      { t: "h", h: "Working with photographs" },
      { t: "p", h: "Photos come in every shape. To keep a grid tidy, give each image the same <b>aspect-ratio</b> and use <code>object-fit: cover</code> so it fills the box without stretching. Text over a photo needs a dark overlay (a gradient works well) to stay readable wherever it lands." },
      { t: "rwch", widths: [375, 1024], prompt: "Tidy the gallery: every photo the <b>same height</b> in a row at 1024px, with <code>object-fit: cover</code> so nothing is squashed, two per row on phones and three from 48em. Then add a dark <code>linear-gradient</code> overlay to the hero background so its white heading stays readable.", html: `<header class="hero"><h1>Recent work</h1></header>
<div class="gallery">
  <img src="${ph(800, 1000, "#7a5c3e", "#fff", "Portrait")}" alt="Woman laughing by a window">
  <img src="${ph(1200, 700, "#3e5c7a", "#fff", "Street")}" alt="Busy market street at dusk">
  <img src="${ph(900, 900, "#5c7a3e", "#fff", "Family")}" alt="Family on a picnic blanket">
  <img src="${ph(700, 1100, "#7a3e5c", "#fff", "Dancer")}" alt="Dancer mid-leap">
  <img src="${ph(1300, 800, "#3e7a6a", "#fff", "Coast")}" alt="Fishing boats on the shore">
  <img src="${ph(1000, 1000, "#6a3e7a", "#fff", "Studio")}" alt="Studio portrait of an old man">
</div>`, css: `body { margin: 0; font-family: Inter, system-ui, sans-serif; background: #121117; color: #ece9f2; }
.hero { padding: 64px 24px; background: url("${ph(1600, 600, "#d9c7a8", "#fff", "")}") center / cover; }
.hero h1 { margin: 0; color: #fff; font-size: 2.5rem; }
.gallery { padding: 24px; }
.gallery img { width: 200px; }`, solution: { css: `body { margin: 0; font-family: Inter, system-ui, sans-serif; background: #121117; color: #ece9f2; }
.hero { padding: 64px 24px; background: linear-gradient(rgba(10, 8, 20, 0.55), rgba(10, 8, 20, 0.75)), url("${ph(1600, 600, "#d9c7a8", "#fff", "")}") center / cover; }
.hero h1 { margin: 0; color: #fff; font-size: 2.5rem; }
.gallery { padding: 24px; display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
.gallery img { display: block; width: 100%; aspect-ratio: 4 / 3; object-fit: cover; border-radius: 8px; }
@media (min-width: 48em) {
  .gallery { grid-template-columns: repeat(3, 1fr); gap: 16px; }
}` }, checks: [
        { msg: "Images use object-fit: cover", fn: (at) => { const a = at(1024); return a.$$(".gallery img").every((i) => a.cs(i).objectFit === "cover"); } },
        { msg: "All photos are the same height at 1024px", fn: (at) => { const a = at(1024); const hs = a.$$(".gallery img").map((i) => Math.round(a.rect(i).height)); return hs.every((h) => Math.abs(h - hs[0]) <= 1) && hs[0] > 50; } },
        { msg: "Two per row at 375px, three at 1024px", fn: (at) => at(375).perRow(".gallery img") === 2 && at(1024).perRow(".gallery img") === 3 },
        { msg: "No overflow at 375px", fn: (at) => !at(375).overflow() },
        { msg: "The hero has a linear-gradient overlay", fn: (at) => /linear-gradient/.test(at(1024).cs(".hero").backgroundImage) },
      ] },
      { t: "h", h: "Final chapter lesson" },
      { t: "p", h: "Look at the finished page at phone and desktop widths. The decisions that made it work were small and repeatable: a max-width for readable lines, space from a scale, a restrained palette, consistent gutters and photos cropped to one ratio. Those same decisions scale to every layout you'll build." },
      { t: "recap", items: ["Simple layouts: one column, max-width ~40 to 75 characters, generous space", "Dark themes: tinted near-black, off-white text, recheck contrast", "Columns for sets of equal things; equal widths, consistent gutters", "Photos: aspect-ratio + object-fit: cover; gradient overlays under text"] },
    ]},

    /* ───────────────────────── Dashboard refactor ───────────────────────── */
    { id: "ui-dashboard", title: "Refactor a Metrics Dashboard", min: 100, kind: "project", body: [
      { t: "h", h: "Project refactoring: introduction and defining the problems" },
      { t: "p", h: "Here's a metrics dashboard a team shipped in a hurry. Before touching CSS, list what's wrong. A refactor without a diagnosis is just moving pixels around." },
      { t: "rwplay", task: "Look at it on a phone and a laptop. Write down every problem you can see before you read on.", html: DASH_HTML, css: DASH_UGLY },
      { t: "steps", items: ["<b>Colour and contrast</b>: light grey text on mid-grey cards; a red border shouting for no reason", "<b>Type and hierarchy</b>: the labels are bigger than the numbers people came for", "<b>White space</b>: 2px padding, cards jammed together", "<b>Layout</b>: fixed 300px floats that overflow phones and leave gaps on desktops"] },
      { t: "h", h: "Fixing the colour and contrast, and the type and visual hierarchy" },
      { t: "rwch", widths: [1280], prompt: "Step 1: on white cards over a light background, make the <b>label</b>, <b>value</b> and both <b>deltas</b> reach 4.5:1 contrast, remove the red border, make the value at least <b>2×</b> the label and 700+ weight, left-align the cards, and use different colours for <code>.up</code> and <code>.down</code>.", html: DASH_HTML, css: DASH_UGLY, solution: { css: DASH_STEP1 }, checks: [
        { msg: "Label, value and deltas have 4.5:1 contrast", fn: (at) => { const a = at(1280); return [".label", ".value", ".delta.up", ".delta.down"].every((s) => contrastOf(a.w, a.$(s)) >= 4.5); } },
        { msg: "No red border on the cards", fn: (at) => { const c = at(1280).cs(".metric"); const [r, g, b] = rgba(c.borderTopColor); return !(px(c.borderTopWidth) > 0 && r > 180 && g < 100 && b < 100); } },
        { msg: "Value ≥ 2× the label and 700+ weight", fn: (at) => { const a = at(1280); return px(a.cs(".value").fontSize) >= 2 * px(a.cs(".label").fontSize) && +a.cs(".value").fontWeight >= 700; } },
        { msg: "Cards are left-aligned", fn: (at) => ["left", "start"].includes(at(1280).cs(".metric").textAlign) },
        { msg: "Up and down deltas use different colours", fn: (at) => at(1280).cs(".delta.up").color !== at(1280).cs(".delta.down").color },
      ] },
      { t: "callout", kind: "tip", h: "Don't rely on colour alone for meaning: the ▲ and ▼ arrows tell colour-blind users which way a number moved." },
      { t: "h", h: "Fixing the white space" },
      { t: "rwch", widths: [375, 1280], prompt: "Step 2: replace the floats with a grid of cards with a gap of at least <b>16px</b>, give each card <b>20px+</b> padding and the page <b>16px+</b> padding, and make sure nothing overflows at 375px.", html: DASH_HTML, css: DASH_STEP1, solution: { css: DASH_STEP2 }, checks: [
        { msg: "No floats; the metrics use grid or flex", fn: (at) => { const a = at(1280); return a.cs(".metric").float === "none" && /grid|flex/.test(a.cs(".metrics").display); } },
        { msg: "Gap of 16px or more between cards", fn: (at) => px(at(1280).cs(".metrics").rowGap) >= 16 },
        { msg: "Cards have 20px+ padding", fn: (at) => px(at(1280).cs(".metric").paddingTop) >= 20 && px(at(1280).cs(".metric").paddingLeft) >= 20 },
        { msg: "The page has 16px+ padding at 375px", fn: (at) => { const a = at(375); return a.rect(".metric").left >= 16; } },
        { msg: "No overflow at 375px", fn: (at) => !at(375).overflow() },
      ] },
      { t: "h", h: "Initial, tablet and desktop media queries" },
      { t: "p", h: "Mobile first: the base styles are one column. Add a <code>min-width</code> query for tablets (two columns), then one for desktops (four columns, more padding, and a max-width so the dashboard doesn't stretch across a huge monitor)." },
      { t: "rwch", widths: [375, 768, 1280], prompt: "Step 3: <b>1</b> card per row at 375px, <b>2</b> at 768px, <b>4</b> at 1280px, using <code>min-width</code> media queries, with no overflow at any width.", html: DASH_HTML, css: DASH_STEP2, solution: { css: DASH_STEP3 }, checks: [
        { msg: "1 per row at 375px", fn: (at) => at(375).perRow(".metric") === 1 },
        { msg: "2 per row at 768px", fn: (at) => at(768).perRow(".metric") === 2 },
        { msg: "4 per row at 1280px", fn: (at) => at(1280).perRow(".metric") === 4 },
        { msg: "Uses min-width media queries", fn: (at) => at(375).sheetHas(/@media[^{]*min-width/) },
        { msg: "No overflow at any width", fn: (at) => [375, 768, 1280].every((x) => !at(x).overflow()) },
      ] },
      { t: "quiz", q: "Why diagnose before refactoring?", opts: ["It's required by CSS", "So each change fixes a named problem, and you can explain and check it", "Because designers insist"], a: 1, why: "A list of problems turns 'make it nicer' into specific, testable fixes, which is also how you'd explain the work in a pull request." },
      { t: "recap", items: ["Diagnose: colour, type, space, layout", "Contrast first; never colour alone for meaning", "Numbers people came for get the biggest type", "Grid + gap instead of floats and margins", "Mobile first: 1 → 2 → 4 columns with min-width queries"] },
    ]},
  ],
};
