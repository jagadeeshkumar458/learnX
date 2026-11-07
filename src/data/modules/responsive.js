/* Module — Responsive Design. Lesson titles match the syllabus so the topic lists attach.
   `rwplay` = editor + device-width preview; `rwch` = challenge rendered at several real viewport widths:
   checks get at(width) → { d, w, $, $$, cs(el), rect(el), overflow(), perRow(sel), rows(sel), sheetHas(re) }. */

const ph = (w, h, bg, fg, text) => "data:image/svg+xml," + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect width="100%" height="100%" fill="${bg}"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="system-ui,sans-serif" font-size="${Math.round(h / 8)}" fill="${fg}">${text}</text></svg>`);

const BAKERY_HTML = `<header class="site-header">
  <a class="logo" href="/">Oak &amp; Ember</a>
  <nav>
    <ul class="nav-list">
      <li><a href="/breads">Breads</a></li>
      <li><a href="/pastries">Pastries</a></li>
      <li><a href="/visit">Visit</a></li>
    </ul>
  </nav>
</header>
<main>
  <section class="hero">
    <h1>Wood-fired bread, baked at dawn</h1>
    <p>Sourdough, rye and seasonal loaves from our oven in the old fire station.</p>
    <a class="btn" href="/order">Order for pickup</a>
  </section>
  <section class="featured">
    <h2>This week's bakes</h2>
    <div class="items">
      <article class="item"><img src="${ph(600, 400, "#c98b4e", "#fff7ec", "Sourdough")}" alt="Crusty sourdough loaf"><h3>Country sourdough</h3></article>
      <article class="item"><img src="${ph(600, 400, "#8a5a33", "#fff7ec", "Rye")}" alt="Dark seeded rye"><h3>Seeded rye</h3></article>
      <article class="item"><img src="${ph(600, 400, "#e0a96d", "#3b2418", "Buns")}" alt="Tray of cardamom buns"><h3>Cardamom buns</h3></article>
    </div>
  </section>
</main>`;

const BAKERY_CSS = `*, *::before, *::after { box-sizing: border-box; }
html { font-size: 100%; }
body { margin: 0; font-family: Georgia, serif; color: #2b1d14; line-height: 1.5; }
img { max-width: 100%; display: block; }

/* mobile first: these are the styles for small screens */
.site-header { padding: 1rem; background: #2b1d14; }
.logo { color: #fff7ec; font-weight: 700; font-size: 1.25rem; text-decoration: none; }
.nav-list { list-style: none; margin: .5rem 0 0; padding: 0; display: flex; flex-direction: column; gap: .25rem; }
.nav-list a { color: #f3c995; }
.hero { padding: 2rem 1rem; background: #fff7ec; }
.hero h1 { font-size: 1.75rem; line-height: 1.2; margin: 0 0 .75rem; }
.btn { display: block; text-align: center; background: #b5541c; color: #fff; padding: .75rem 1rem; border-radius: .5rem; text-decoration: none; }
.featured { padding: 2rem 1rem; max-width: 70rem; margin: 0 auto; }
.items { display: flex; flex-wrap: wrap; gap: 1rem; }
.item { flex: 1 1 100%; }
.item img { border-radius: .5rem; }

/* tablet and up */
@media (min-width: 48em) {
  .site-header { display: flex; justify-content: space-between; align-items: center; }
  .nav-list { flex-direction: row; gap: 1.5rem; margin: 0; }
  .hero h1 { font-size: 2.75rem; }
  .btn { display: inline-block; }
  .item { flex: 1 1 calc(33.333% - 1rem); }
}`;

export const RESPONSIVE = {
  id: "responsive",
  title: "Responsive Design",
  blurb: "Make every page look great from a 320px phone to a 4K monitor.",
  concepts: ["Relative units: %, em, rem, vw/vh", "Fluid images and max-width", "Media queries and mobile-first", "The viewport meta tag", "Flexbox and CSS grid layouts", "Grid template areas and auto-fit"],
  lessons: [
    { id: "rw-welcome", title: "Welcome to Responsive Design", min: 6, kind: "lesson", body: [
      { t: "p", h: "More than half of web traffic comes from phones, and the rest arrives on everything from small laptops to ultrawide monitors. <b>Responsive design</b> means one codebase whose layout adapts to the space it has: fluid widths, flexible images, and layout changes at sensible breakpoints." },
      { t: "rwplay", html: BAKERY_HTML, css: BAKERY_CSS, task: "This is the site you'll build. Switch between phone, tablet and desktop, or drag the width slider, and watch the nav, button and bakes rearrange." },
      { t: "recap", items: ["One codebase, every screen size", "Fluid units, flexible images, media queries", "Labs preview at real viewport widths"] },
    ]},

    { id: "rw-layouts", title: "Responsive Layouts", min: 160, kind: "project", body: [
      { t: "h", h: "Thinking responsively" },
      { t: "p", h: "Fixed widths are the root of most responsive bugs: a 960px container on a 375px phone means sideways scrolling. Let things <b>flow</b>: widths in percentages, a <code>max-width</code> so lines don't get too long on huge screens, and images that shrink with their container." },
      { t: "h", h: "Relative units, percentages and max-width" },
      { t: "code", lang: "css", code: `.container {
  width: 90%;          /* fluid: always 90% of the parent */
  max-width: 70rem;    /* but never wider than this */
  margin: 0 auto;
}
img {
  max-width: 100%;     /* never wider than its container… */
  height: auto;        /* …and keep the aspect ratio */
  display: block;
}` },
      { t: "rwch", widths: [375, 1280], prompt: "This page scrolls sideways on phones. Make the container fluid (90% wide, at most 60rem) and the image flexible, so nothing overflows at 375px and the layout is centred on wide screens.", html: `<div class="container">
  <h1>Oak &amp; Ember</h1>
  <img src="${ph(900, 400, "#c98b4e", "#fff7ec", "Fresh bread")}" alt="Loaves cooling on a rack">
  <p>Wood-fired bread, baked at dawn in the old fire station.</p>
</div>`, css: `.container { width: 960px; margin: 0 auto; }`, solution: { css: `.container { width: 90%; max-width: 60rem; margin: 0 auto; }
img { max-width: 100%; height: auto; display: block; }` }, checks: [
        { msg: "No horizontal scrolling at 375px", fn: (at) => !at(375).overflow() },
        { msg: "The image fits inside the container on phones", fn: (at) => { const a = at(375); return a.rect("img").width <= a.rect(".container").width + 0.5; } },
        { msg: "The container is fluid: about 90% of a phone screen", fn: (at) => { const a = at(375); const r = a.rect(".container").width / a.d.documentElement.clientWidth; return r > 0.85 && r < 0.95; } },
        { msg: "On a 1280px screen it stops at 60rem (960px) and is centred", fn: (at) => { const a = at(1280); const r = a.rect(".container"); return Math.round(r.width) <= 960 && Math.abs(r.left - (a.d.documentElement.clientWidth - r.right)) < 2; } },
      ] },
      { t: "h", h: "Aside: the em unit, and the compounding issue" },
      { t: "p", h: "<code>em</code> is relative to the element's font size (or, for <code>font-size</code> itself, the parent's). It's handy for padding that should grow with a button's text. But nest elements that each set <code>font-size: 0.875em</code> and the sizes compound: each level gets smaller." },
      { t: "h", h: "Aside: the rem unit" },
      { t: "p", h: "<code>rem</code> (root em) is always relative to the <code>&lt;html&gt;</code> font size: 16px by default, or whatever the user chose in their browser settings. No compounding, and it respects user preferences. Use it for font sizes and most spacing." },
      { t: "widget", name: "units" },
      { t: "h", h: "How do you decide which unit to use?" },
      { t: "steps", items: [
        "<b>rem</b>: font sizes, and margins/padding on layout",
        "<b>em</b>: padding or gaps that should scale with that element's own text, like inside a button",
        "<b>%</b> and <b>fr</b>: widths of layout columns",
        "<b>vw / vh</b>: things sized to the screen, like a full-height hero",
        "<b>px</b>: hairlines and borders, where 1px should stay 1px",
        "<b>Unitless line-height</b> (<code>1.5</code>), so it scales with the font size",
      ] },
      { t: "h", h: "Aside: media queries" },
      { t: "p", h: "A media query applies CSS only when a condition is true, usually the viewport width." },
      { t: "code", lang: "css", code: `/* applies when the viewport is at least 48em (768px) wide */
@media (min-width: 48em) {
  .nav-list { flex-direction: row; }
}` },
      { t: "h", h: "Think \"mobile-first\"" },
      { t: "p", h: "Write the base styles for the smallest screen, then <b>add</b> complexity in <code>min-width</code> queries as space allows. Small-screen layouts are usually simpler (one column), so the base CSS stays short, and phones don't download and override desktop rules." },
      { t: "callout", kind: "tip", h: "<b>Common breakpoints</b>: about 30em (480px), 48em (768px), 64em (1024px), 80em (1280px). But choose them by where <i>your</i> design breaks, not by specific devices: drag the preview width and add a breakpoint where the layout starts to look wrong. Breakpoints in em follow the user's font size too." },
      { t: "rwch", widths: [375, 1024], prompt: "Build a mobile-first navigation: on phones the links are stacked in a column; from 48em (768px) up, the logo and nav sit side by side and the links form a row. Use <code>min-width</code>.", html: `<header class="site-header">
  <a class="logo" href="/">Oak &amp; Ember</a>
  <nav>
    <ul class="nav-list">
      <li><a href="/breads">Breads</a></li>
      <li><a href="/pastries">Pastries</a></li>
      <li><a href="/visit">Visit</a></li>
    </ul>
  </nav>
</header>`, css: `.site-header { padding: 1rem; background: #2b1d14; }
.logo { color: #fff7ec; text-decoration: none; font-weight: 700; }
.nav-list { list-style: none; padding: 0; margin: .5rem 0 0; }
.nav-list a { color: #f3c995; }`, solution: { css: `.site-header { padding: 1rem; background: #2b1d14; }
.logo { color: #fff7ec; text-decoration: none; font-weight: 700; }
.nav-list { list-style: none; padding: 0; margin: .5rem 0 0; display: flex; flex-direction: column; gap: .25rem; }
.nav-list a { color: #f3c995; }

@media (min-width: 48em) {
  .site-header { display: flex; justify-content: space-between; align-items: center; }
  .nav-list { flex-direction: row; gap: 1.5rem; margin: 0; }
}` }, checks: [
        { msg: "On a phone, the links are stacked", fn: (at) => at(375).rows(".nav-list li") === 3 },
        { msg: "From 768px, the links are in one row", fn: (at) => at(1024).rows(".nav-list li") === 1 },
        { msg: "From 768px, the logo and nav share a line", fn: (at) => { const a = at(1024); return Math.abs(a.rect(".logo").top - a.rect("nav").top) < 30; } },
        { msg: "Uses a min-width media query (mobile-first)", fn: (at) => at(375).sheetHas(/@media[^{]*min-width/) && !at(375).sheetHas(/@media[^{]*max-width/) },
      ] },
      { t: "h", h: "The viewport meta tag" },
      { t: "p", h: "Without it, mobile browsers pretend to be about 980px wide and shrink the whole page, so your media queries never fire. Every responsive page needs this in the <code>&lt;head&gt;</code> (the labs add it for you):" },
      { t: "code", lang: "html", code: `<meta name="viewport" content="width=device-width, initial-scale=1">` },
      { t: "callout", kind: "warn", h: "Never add <code>maximum-scale=1</code> or <code>user-scalable=no</code>. They stop people zooming in, which is an accessibility failure." },
      { t: "h", h: "Aside: a flexbox image grid" },
      { t: "p", h: "<code>flex-wrap: wrap</code> plus a <code>flex-basis</code> builds a grid that reflows: <code>flex: 1 1 100%</code> on phones (one per row), then <code>flex: 1 1 calc(33.333% - 1rem)</code> on wider screens (three per row, minus the gap)." },
      { t: "rwch", widths: [375, 1280], prompt: "Wrap the featured items: one per row on phones, three per row from 48em up. Keep a 1rem gap and don't let anything overflow.", html: `<div class="items">
  <article class="item"><img src="${ph(600, 400, "#c98b4e", "#fff7ec", "Sourdough")}" alt="Crusty sourdough loaf"><h3>Country sourdough</h3></article>
  <article class="item"><img src="${ph(600, 400, "#8a5a33", "#fff7ec", "Rye")}" alt="Dark seeded rye"><h3>Seeded rye</h3></article>
  <article class="item"><img src="${ph(600, 400, "#e0a96d", "#3b2418", "Buns")}" alt="Tray of cardamom buns"><h3>Cardamom buns</h3></article>
</div>`, css: `img { display: block; }`, solution: { css: `img { display: block; max-width: 100%; }
.items { display: flex; flex-wrap: wrap; gap: 1rem; }
.item { flex: 1 1 100%; }
@media (min-width: 48em) {
  .item { flex: 1 1 calc(33.333% - 1rem); }
}` }, checks: [
        { msg: "One item per row on a phone", fn: (at) => at(375).perRow(".item") === 1 },
        { msg: "Three per row on a desktop", fn: (at) => at(1280).perRow(".item") === 3 },
        { msg: "Nothing overflows at either size", fn: (at) => !at(375).overflow() && !at(1280).overflow() },
        { msg: "Uses flex-wrap (or grid) with a gap", fn: (at) => { const c = at(1280).cs(".items"); return (c.flexWrap === "wrap" || c.display === "grid") && parseFloat(c.columnGap) > 0; } },
      ] },
      { t: "h", h: "Deploy your site to Netlify" },
      { t: "steps", items: [
        "Push your project to a GitHub repository",
        "Sign in to Netlify, choose <b>Add new site → Import an existing project</b>, and pick the repo",
        "For a plain HTML/CSS site there's no build command; the publish directory is the folder with <code>index.html</code>",
        "Every push to <code>main</code> now redeploys automatically. Test the live URL on your own phone",
      ] },
      { t: "recap", items: ["Fluid widths (%), max-width limits, flexible images", "rem for type and spacing; em when it should scale with the element; avoid compounding", "Mobile-first: base styles for phones, add min-width media queries", "Choose breakpoints where the design breaks", "Always include the viewport meta tag; never block zoom", "flex-wrap + flex-basis for reflowing grids"] },
    ]},

    { id: "rw-product", title: "Build a Product Page", min: 110, kind: "project", body: [
      { t: "p", h: "A splash page for <b>Aurora</b>, a pair of noise-cancelling headphones: a full-screen intro with a background image, a short pitch, and an email sign-up. On phones it's one column; on wider screens the text and form sit side by side." },
      { t: "h", h: "Aside: transform text" },
      { t: "p", h: "<code>text-transform: uppercase</code> changes how text <i>looks</i> without changing the HTML, so screen readers still read \"New\", not \"N-E-W\". Pair uppercase with a little <code>letter-spacing</code> to keep it readable." },
      { t: "h", h: "Aside: viewport units" },
      { t: "p", h: "<code>1vw</code> is 1% of the viewport width and <code>1vh</code> is 1% of its height. <code>min-height: 100vh</code> makes a section at least one screen tall. On phones, the browser's address bar makes <code>vh</code> unreliable; <code>100svh</code> (small viewport height) and <code>100dvh</code> (dynamic) fix that in modern browsers." },
      { t: "h", h: "Apply a full background image" },
      { t: "code", lang: "css", code: `.intro {
  min-height: 100vh;
  background-image: linear-gradient(rgb(0 0 0 / .55), rgb(0 0 0 / .55)), url("aurora.jpg");
  background-size: cover;       /* fill the box, cropping if needed */
  background-position: center;
  color: white;
}` },
      { t: "callout", kind: "tip", h: "The dark gradient layered over the photo keeps white text readable whatever the image looks like. Check the contrast." },
      { t: "h", h: "Style the form: inputs, focus and button modifiers" },
      { t: "p", h: "Make inputs at least 44px tall (an easy tap target), inherit the page font (<code>font: inherit</code>), and give them a clear <code>:focus-visible</code> state. Button variants use modifiers, as in Essential CSS: <code>.btn</code>, <code>.btn--primary</code>, <code>.btn--ghost</code>." },
      { t: "h", h: "Aside: reordering flex items" },
      { t: "p", h: "The <code>order</code> property changes the <i>visual</i> order of flex or grid items. Use it sparingly: screen readers and the Tab key still follow the HTML order, so never reorder things in a way that changes the meaning." },
      { t: "h", h: "Adjust line length, and box-sizing" },
      { t: "p", h: "Long lines are tiring to read; aim for roughly 45–75 characters. The <code>ch</code> unit (the width of the \"0\" character) makes that easy: <code>max-width: 60ch</code>. And remember <code>box-sizing: border-box</code>, so a <code>width: 100%</code> input with padding doesn't overflow its container." },
      { t: "rwch", widths: [375, 1280], prompt: "Finish the Aurora splash page: the intro fills at least the screen height (100vh) with the background image covering it; the pitch paragraph is at most 60ch wide; inputs are full width without overflowing and have a <code>:focus-visible</code> style; and from 48em the pitch and form sit side by side.", html: `<section class="intro">
  <div class="pitch">
    <p class="eyebrow">New</p>
    <h1>Aurora</h1>
    <p class="lead">Noise-cancelling headphones that weigh less than a smartphone and last 40 hours on a charge. Designed for long flights, open offices and everything in between.</p>
  </div>
  <form class="signup">
    <label for="email">Email</label>
    <input id="email" type="email" placeholder="you@example.com">
    <button class="btn btn--primary">Notify me</button>
  </form>
</section>`, css: `body { margin: 0; font-family: system-ui, sans-serif; }
.intro { background-image: linear-gradient(rgb(0 0 0 / .55), rgb(0 0 0 / .55)), url("${ph(1600, 1000, "#24305e", "#9fe3ff", "Aurora")}"); color: white; padding: 2rem 1rem; }
.eyebrow { text-transform: uppercase; letter-spacing: .15em; }
.signup { display: grid; gap: .5rem; max-width: 24rem; }
input { width: 100%; padding: .75rem; font: inherit; }
.btn { padding: .75rem 1rem; border: 0; border-radius: .5rem; font: inherit; font-weight: 700; }
.btn--primary { background: #9fe3ff; color: #0b1430; }`, solution: { css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: system-ui, sans-serif; }
.intro { min-height: 100vh; background-image: linear-gradient(rgb(0 0 0 / .55), rgb(0 0 0 / .55)), url("${ph(1600, 1000, "#24305e", "#9fe3ff", "Aurora")}"); background-size: cover; background-position: center; color: white; padding: 2rem 1rem; display: flex; flex-direction: column; gap: 2rem; justify-content: center; }
.lead { max-width: 60ch; }
.eyebrow { text-transform: uppercase; letter-spacing: .15em; }
.signup { display: grid; gap: .5rem; max-width: 24rem; }
input { width: 100%; padding: .75rem; font: inherit; }
input:focus-visible { outline: 3px solid #9fe3ff; outline-offset: 2px; }
.btn { padding: .75rem 1rem; border: 0; border-radius: .5rem; font: inherit; font-weight: 700; }
.btn--primary { background: #9fe3ff; color: #0b1430; }
@media (min-width: 48em) {
  .intro { flex-direction: row; align-items: center; padding: 2rem 4rem; }
}` }, checks: [
        { msg: "The intro is at least as tall as the screen", fn: (at) => { const a = at(375); return a.rect(".intro").height >= a.w.innerHeight - 1; } },
        { msg: "The background image covers the section", fn: (at) => /cover/.test(at(1280).cs(".intro").backgroundSize) },
        { msg: "The lead paragraph is at most about 60 characters wide", fn: (at) => { const a = at(1280); const mw = a.cs(".lead").maxWidth; return mw !== "none" && parseFloat(mw) <= parseFloat(a.cs(".lead").fontSize) * 0.6 * 65; } },
        { msg: "The input doesn't overflow its form on phones", fn: (at) => { const a = at(375); return a.rect("input").right <= a.rect(".signup").right + 0.5 && !a.overflow(); } },
        { msg: "Inputs have a :focus-visible (or :focus) style", fn: (at) => at(375).sheetHas(/input:focus(-visible)?/) },
        { msg: "From 48em, the pitch and the form sit side by side", fn: (at) => { const a = at(1280); return a.rect(".signup").left > a.rect(".pitch").left + 100 && Math.abs(a.rect(".signup").top - a.rect(".pitch").top) < a.rect(".pitch").height; } },
      ] },
      { t: "recap", items: ["text-transform changes looks, not content", "vh/svh/dvh for screen-sized sections", "background-size: cover with a gradient overlay for readable text", "44px tap targets, font: inherit, visible focus", "order changes visuals only; keep the HTML order meaningful", "Line length around 60ch; box-sizing: border-box everywhere"] },
    ]},

    { id: "rw-grid", title: "CSS Grid", min: 120, kind: "lesson", body: [
      { t: "p", h: "Flexbox lays things out in <b>one</b> direction. <b>CSS grid</b> handles rows and columns <b>together</b>, which makes it perfect for page layouts and galleries." },
      { t: "widget", name: "grid" },
      { t: "h", h: "Columns, gap and fr units" },
      { t: "code", lang: "css", code: `.grid {
  display: grid;
  grid-template-columns: 1fr 2fr;    /* fr = a share of the free space: 1/3 and 2/3 */
  gap: 1rem;
}` },
      { t: "h", h: "Rows, the implicit grid, and span" },
      { t: "p", h: "You define the columns; rows are created automatically as items fill them (the <b>implicit grid</b>). Control their height with <code>grid-auto-rows</code>. An item can stretch across tracks with <code>grid-column: span 2</code> or <code>grid-row: span 2</code>." },
      { t: "h", h: "The repeat function and grid lines" },
      { t: "code", lang: "css", code: `grid-template-columns: repeat(4, 1fr);   /* same as 1fr 1fr 1fr 1fr */

.hero { grid-column: 1 / -1; }   /* from the first line to the last: full width */
.side { grid-column: 1 / 2; grid-row: 2 / 4; }` },
      { t: "h", h: "Grid template areas" },
      { t: "p", h: "Name your areas and draw the layout in ASCII. Change it in a media query and the whole page rearranges. DevTools' grid overlay shows the names and lines." },
      { t: "code", lang: "css", code: `.page {
  display: grid;
  grid-template-areas:
    "header"
    "main"
    "sidebar"
    "footer";
}
@media (min-width: 64em) {
  .page {
    grid-template-columns: 16rem 1fr;
    grid-template-areas:
      "header  header"
      "sidebar main"
      "footer  footer";
  }
}
header { grid-area: header; }
main { grid-area: main; }
aside { grid-area: sidebar; }
footer { grid-area: footer; }` },
      { t: "rwch", widths: [375, 1280], prompt: "Lay out the page with grid template areas: one column on phones (header, main, sidebar, footer), and from 64em a 16rem sidebar on the left of main, with the header and footer spanning both columns.", html: `<div class="page">
  <header>Oak &amp; Ember</header>
  <main>This week's bakes</main>
  <aside>Opening hours</aside>
  <footer>© 2026</footer>
</div>`, css: `.page > * { padding: 1rem; background: #fff7ec; border: 1px solid #e8d5bd; }`, solution: { css: `.page > * { padding: 1rem; background: #fff7ec; border: 1px solid #e8d5bd; }
.page { display: grid; gap: .5rem; grid-template-areas: "header" "main" "sidebar" "footer"; }
header { grid-area: header; }
main { grid-area: main; }
aside { grid-area: sidebar; }
footer { grid-area: footer; }
@media (min-width: 64em) {
  .page { grid-template-columns: 16rem 1fr; grid-template-areas: "header header" "sidebar main" "footer footer"; }
}` }, checks: [
        { msg: ".page is a grid using template areas", fn: (at) => at(1280).cs(".page").display === "grid" && at(1280).cs(".page").gridTemplateAreas !== "none" },
        { msg: "Phone: one column, in the order header, main, sidebar, footer", fn: (at) => { const a = at(375); const t = ["header", "main", "aside", "footer"].map((s) => a.rect(s).top); return t[0] < t[1] && t[1] < t[2] && t[2] < t[3] && Math.abs(a.rect("main").left - a.rect("aside").left) < 1; } },
        { msg: "Desktop: the sidebar is left of main, on the same row", fn: (at) => { const a = at(1280); return a.rect("aside").right <= a.rect("main").left + 1 && Math.abs(a.rect("aside").top - a.rect("main").top) < 2; } },
        { msg: "Desktop: the sidebar is 16rem wide", fn: (at) => Math.abs(at(1280).rect("aside").width - 256) < 2 },
        { msg: "Desktop: header and footer span the full width", fn: (at) => { const a = at(1280); return Math.abs(a.rect("header").width - a.rect(".page").width) < 2 && Math.abs(a.rect("footer").width - a.rect(".page").width) < 2; } },
      ] },
      { t: "h", h: "A responsive image grid with minmax and auto-fit" },
      { t: "p", h: "One line of CSS makes a gallery that fits as many columns as there's room for, with no media queries at all:" },
      { t: "code", lang: "css", code: `.gallery {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr));   /* at least 10rem, share what's left */
  gap: 1rem;
}
.gallery .wide { grid-column: span 2; }
.gallery { grid-auto-flow: dense; }   /* backfill gaps left by wide items */` },
      { t: "rwch", widths: [375, 1280], prompt: "Make the gallery responsive with <b>no media queries</b>: columns at least 10rem wide that fit as many as possible, with a 1rem gap.", html: `<div class="gallery">
${[1, 2, 3, 4, 5, 6, 7, 8].map((i) => `  <img src="${ph(400, 300, ["#c98b4e", "#8a5a33", "#e0a96d", "#b5541c"][i % 4], "#fff7ec", "Bake " + i)}" alt="Bake ${i}">`).join("\n")}
</div>`, css: `img { display: block; width: 100%; }`, solution: { css: `img { display: block; width: 100%; }
.gallery { display: grid; grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr)); gap: 1rem; }` }, checks: [
        { msg: "Uses grid with repeat(auto-fit or auto-fill, minmax(…))", fn: (at) => at(375).sheetHas(/repeat\(\s*auto-(fit|fill)\s*,\s*minmax\(/) },
        { msg: "No media queries needed", fn: (at) => !at(375).sheetHas(/@media/) },
        { msg: "2 columns on a 375px phone", fn: (at) => at(375).perRow(".gallery img") === 2 },
        { msg: "7 or more columns on a 1280px screen", fn: (at) => at(1280).perRow(".gallery img") >= 7 },
        { msg: "There's a 1rem gap", fn: (at) => parseFloat(at(1280).cs(".gallery").columnGap) === 16 },
      ] },
      { t: "quiz", q: "When should you use grid rather than flexbox?", opts: ["Never; flexbox can do everything", "When you need to control rows and columns together, like a page layout or a gallery", "Only for tables"], a: 1, why: "Flexbox is one-dimensional (a row or a column); grid is two-dimensional. Many layouts use both: grid for the page, flexbox inside components." },
      { t: "recap", items: ["display: grid + grid-template-columns + gap", "fr units share free space; repeat() saves typing", "span and line numbers place items; 1 / -1 is full width", "grid-template-areas draw the layout; change it in media queries", "repeat(auto-fit, minmax(10rem, 1fr)) for query-free responsive grids"] },
    ]},

    { id: "rw-journal", title: "Solo Project - Learning Journal", min: 100, kind: "project", body: [
      { t: "p", h: "Build a <b>learning journal</b>: a small blog where you write about what you're learning. It brings together everything from this module: fluid layouts, rem units, media queries, flexbox and grid." },
      { t: "h", h: "The spec" },
      { t: "steps", items: [
        "A header with the site name and a nav (stacked or compact on phones, a row on wider screens)",
        "A featured post with a large image and title",
        "A list of recent posts as <code>.post</code> cards: one column on phones, two from 48em, three from 64em",
        "Images never overflow; no horizontal scrolling at 320px",
        "Font sizes in rem; body text at least 1rem",
      ] },
      { t: "rwch", widths: [320, 768, 1280], prompt: "Build the learning journal to the spec. The starter has the content; write the layout CSS.", html: `<header class="site-header">
  <a class="logo" href="/">My learning journal</a>
  <nav><a href="/">Home</a> <a href="/about">About me</a></nav>
</header>
<main>
  <article class="featured">
    <img src="${ph(1200, 600, "#24305e", "#9fe3ff", "Featured")}" alt="Laptop on a desk with code on screen">
    <h1>Month 3: I finally understand CSS grid</h1>
  </article>
  <section class="posts">
${[["Responsive images", "#c98b4e"], ["Why rem beats px", "#2bb673"], ["Media query mistakes", "#5a6cf0"], ["Flexbox vs grid", "#f2b24d"], ["My first deploy", "#b5541c"], ["Accessibility wins", "#8a5a33"]].map(([t, c]) => `    <article class="post"><img src="${ph(600, 360, c, "#ffffff", t)}" alt=""><h2>${t}</h2></article>`).join("\n")}
  </section>
</main>`, css: ``, solution: { css: `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: system-ui, sans-serif; font-size: 1rem; line-height: 1.5; }
img { max-width: 100%; height: auto; display: block; }
.site-header { padding: 1rem; display: flex; flex-direction: column; gap: .5rem; }
.logo { font-size: 1.25rem; font-weight: 700; }
main { width: 92%; max-width: 72rem; margin: 0 auto; }
.featured h1 { font-size: 1.75rem; }
.posts { display: grid; gap: 1rem; grid-template-columns: 1fr; }
.post h2 { font-size: 1.125rem; }
@media (min-width: 48em) {
  .site-header { flex-direction: row; justify-content: space-between; align-items: center; }
  .posts { grid-template-columns: repeat(2, 1fr); }
  .featured h1 { font-size: 2.5rem; }
}
@media (min-width: 64em) {
  .posts { grid-template-columns: repeat(3, 1fr); }
}` }, checks: [
        { msg: "No horizontal scrolling at 320px", fn: (at) => !at(320).overflow() },
        { msg: "Posts: 1 per row at 320px", fn: (at) => at(320).perRow(".post") === 1 },
        { msg: "Posts: 2 per row at 768px", fn: (at) => at(768).perRow(".post") === 2 },
        { msg: "Posts: 3 per row at 1280px", fn: (at) => at(1280).perRow(".post") === 3 },
        { msg: "The logo and nav share a row on wide screens", fn: (at) => { const a = at(1280); return Math.abs(a.rect(".logo").top - a.rect("nav").top) < 20; } },
        { msg: "Body text is at least 16px, and font sizes use rem", fn: (at) => parseFloat(at(320).cs("body").fontSize) >= 16 && at(320).sheetHas(/font-size:\s*[\d.]+rem/) },
      ] },
      { t: "recap", items: ["Plan the phone layout first", "Fluid container + max-width", "Grid columns that change at breakpoints", "Test at 320px: no sideways scrolling"] },
    ]},
  ],
};
