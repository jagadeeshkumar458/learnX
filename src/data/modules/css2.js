/* Module — Essential CSS. Lesson titles match the syllabus so the topic lists attach.
   Uses `play` (HTML/CSS playground), `htmlch` (HTML/CSS challenge; checks get (d, w)), and widgets
   (specificity, flexbox, display, position, zindex). */

const cs = (w, el) => w.getComputedStyle(el);
/** A self-contained placeholder image (an SVG data URI). */
const ph = (w, h, bg, fg, text) => "data:image/svg+xml," + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect width="100%" height="100%" fill="${bg}"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="system-ui,sans-serif" font-size="${Math.round(h / 8)}" fill="${fg}">${text}</text></svg>`);
const sheetHas = (d, re) => Array.from(d.body.getRootNode().styleSheets || []).some((ss) => Array.from(ss.cssRules).some((r) => re.test(r.cssText)));

const PIXEL_HTML = `<header class="site-header">
  <div class="container header-inner">
    <a class="logo" href="/">Pixel Collective</a>
    <nav>
      <a href="/explore">Explore</a>
      <a href="/artists">Artists</a>
      <a href="/about">About</a>
    </nav>
  </div>
</header>
<main>
  <section class="hero">
    <div class="container hero-inner">
      <img src="https://placehold.co/280x280/7c5cff/ffffff?text=%E2%9C%A8" alt="Glowing abstract artwork">
      <div>
        <h1>Own a piece of digital art</h1>
        <p>Discover limited editions from independent artists. Every purchase supports the creator directly.</p>
        <a class="btn btn--primary" href="/explore">Explore the gallery</a>
        <a class="btn btn--secondary" href="/sell">Start selling</a>
      </div>
    </div>
  </section>
  <section class="featured">
    <div class="container">
      <h2>Featured this week</h2>
      <div class="gallery">
        <img src="https://placehold.co/160x160/ff7a3d/ffffff?text=1" alt="Orange geometric study">
        <img src="https://placehold.co/160x160/2bb673/ffffff?text=2" alt="Green generative landscape">
        <img src="https://placehold.co/160x160/5a6cf0/ffffff?text=3" alt="Blue pixel portrait">
        <img src="https://placehold.co/160x160/f2b24d/ffffff?text=4" alt="Golden fractal">
      </div>
    </div>
  </section>
</main>
<footer class="site-footer"><div class="container">© 2026 Pixel Collective</div></footer>`;

const PIXEL_CSS = `*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: system-ui, sans-serif; color: #1d1b2e; line-height: 1.5; }
img { max-width: 100%; display: block; }

.container { max-width: 900px; margin: 0 auto; padding: 0 20px; }

.site-header { background: #14121f; }
.header-inner { display: flex; justify-content: space-between; align-items: center; padding-top: 14px; padding-bottom: 14px; }
.logo { color: #fff; font-weight: 800; text-decoration: none; }
nav a { color: #cfc8ff; text-decoration: none; margin-left: 16px; }
nav a:hover { color: #fff; }

.hero { background: #f4f1ff; padding: 48px 0; }
.hero-inner { display: flex; gap: 32px; align-items: center; }
.hero h1 { font-size: 2.2rem; line-height: 1.15; margin: 0 0 12px; }

.btn { display: inline-block; padding: 10px 18px; border-radius: 8px; font-weight: 700; text-decoration: none; margin: 12px 8px 0 0; }
.btn--primary { background: #7c5cff; color: #fff; }
.btn--secondary { border: 2px solid #7c5cff; color: #4b2fd6; }
.btn:hover { transform: translateY(-2px); }
.btn:active { transform: translateY(0); }

.featured { padding: 40px 0; }
.gallery { display: flex; flex-wrap: wrap; gap: 16px; }
.gallery img { width: 160px; border-radius: 12px; }

.site-footer { background: #14121f; color: #cfc8ff; padding: 18px 0; font-size: .9rem; }`;

export const CSS2 = {
  id: "css2",
  title: "Essential CSS",
  blurb: "Level up your CSS with real projects: specificity, positioning, layout and maintainable styles.",
  concepts: ["Semantic page structure", "Specificity and compound selectors", "Hover and active states", "Main and modifier classes", "display, overflow and float", "position and z-index"],
  lessons: [
    { id: "css2-welcome", title: "Welcome to Essential CSS", min: 6, kind: "lesson", body: [
      { t: "p", h: "You know the basics of CSS. This module is about writing CSS like a professional: understanding <b>why</b> a rule wins or loses, laying out real pages, positioning things precisely, and organising styles so they stay easy to change. You'll build a digital art marketplace, a portfolio, an Instagram-style profile and a coworking space landing page." },
      { t: "widget", name: "boxmodel" },
      { t: "recap", items: ["Four projects, one solo", "Specificity, layout and positioning", "Maintainable, reusable class names"] },
    ]},

    { id: "css2-nft", title: "Build an NFT Site", min: 140, kind: "project", body: [
      { t: "p", h: "<b>Pixel Collective</b> is a marketplace for digital art. Its landing page has a header, a hero section, a gallery and a footer. Here's the finished page; you'll build up to it piece by piece." },
      { t: "play", task: "Explore the finished site. Hover over the buttons and nav links. Then change <code>max-width</code> on <code>.container</code> and watch every section line up.", html: PIXEL_HTML, css: PIXEL_CSS },
      { t: "h", h: "Semantic HTML: header, main, section, footer" },
      { t: "p", h: "Start with the structure, not the styling. A <code>&lt;header&gt;</code> for the logo and navigation, a <code>&lt;main&gt;</code> holding a <code>&lt;section&gt;</code> per part of the page, and a <code>&lt;footer&gt;</code>. It reads well, it's accessible, and it gives you meaningful hooks for CSS." },
      { t: "h", h: "Set up the CSS basics" },
      { t: "code", lang: "css", code: `*, *::before, *::after { box-sizing: border-box; }   /* width includes padding and border */
body { margin: 0; font-family: system-ui, sans-serif; line-height: 1.5; }
img { max-width: 100%; display: block; }              /* no overflowing images, no gap below them */` },
      { t: "h", h: "Aside: margins' strange behaviour" },
      { t: "p", h: "Vertical margins between blocks <b>collapse</b>: two touching margins of 20px and 30px become 30px, not 50px. A child's top margin can also escape through its parent if the parent has no padding or border, pushing the whole parent down. Fixes: padding on the parent, <code>display: flow-root</code>, or using flex/grid with <code>gap</code> (which never collapses)." },
      { t: "quiz", q: "An <h2> with margin-bottom: 24px sits above a <p> with margin-top: 16px. What's the gap between them?", opts: ["40px", "24px", "16px"], a: 1, why: "Adjacent vertical margins collapse to the larger of the two." },
      { t: "h", h: "The header" },
      { t: "htmlch", preview: true, prompt: "Lay out the header: make <code>.header-inner</code> a flex container with the logo on the left and the nav on the right, vertically centred. Remove the underlines from the nav links.", html: `<header class="site-header">
  <div class="header-inner">
    <a class="logo" href="/">Pixel Collective</a>
    <nav>
      <a href="/explore">Explore</a>
      <a href="/artists">Artists</a>
    </nav>
  </div>
</header>`, css: `.site-header { background: #14121f; padding: 14px 20px; }
.logo { color: #fff; font-weight: 800; text-decoration: none; }
nav a { color: #cfc8ff; margin-left: 16px; }`, solution: { css: `.site-header { background: #14121f; padding: 14px 20px; }
.header-inner { display: flex; justify-content: space-between; align-items: center; }
.logo { color: #fff; font-weight: 800; text-decoration: none; }
nav a { color: #cfc8ff; margin-left: 16px; text-decoration: none; }` }, checks: [
        { msg: ".header-inner is a flex container", fn: (d, w) => cs(w, d.querySelector(".header-inner")).display === "flex" },
        { msg: "Logo left, nav right (justify-content: space-between)", fn: (d, w) => cs(w, d.querySelector(".header-inner")).justifyContent === "space-between" },
        { msg: "Items are vertically centred", fn: (d, w) => cs(w, d.querySelector(".header-inner")).alignItems === "center" },
        { msg: "Nav links have no underline", fn: (d, w) => Array.from(d.querySelectorAll("nav a")).every((a) => !cs(w, a).textDecorationLine.includes("underline")) },
      ] },
      { t: "h", h: "Aside: hover and active states" },
      { t: "p", h: "Pseudo-classes style an element in a particular state: <code>:hover</code> (pointer over it), <code>:active</code> (being pressed), <code>:focus-visible</code> (focused with the keyboard). Small changes, like a colour shift or a 2px lift, make a page feel responsive. Always give keyboard users a visible <code>:focus-visible</code> style too." },
      { t: "code", lang: "css", code: `.btn { transition: transform .15s, background-color .15s; }
.btn:hover { transform: translateY(-2px); }
.btn:active { transform: translateY(0); }
.btn:focus-visible { outline: 3px solid #f2b24d; outline-offset: 2px; }` },
      { t: "h", h: "Aside: full-width backgrounds and a content container" },
      { t: "p", h: "A section's background should stretch edge to edge, but its content shouldn't spread across a 2,500px monitor. Let the <code>&lt;section&gt;</code> be full width and put the content in a <code>.container</code> with a <code>max-width</code> and <code>margin: 0 auto</code>." },
      { t: "htmlch", preview: true, prompt: "Give the hero a full-width background, but keep its content in a centred <code>.container</code> no wider than 600px. Add a <code>:hover</code> style that changes the button.", html: `<section class="hero">
  <div class="container">
    <h1>Own a piece of digital art</h1>
    <a class="btn" href="/explore">Explore the gallery</a>
  </div>
</section>`, css: `.hero { background: #f4f1ff; padding: 40px 0; }
.btn { display: inline-block; background: #7c5cff; color: #fff; padding: 10px 18px; border-radius: 8px; text-decoration: none; }`, solution: { css: `.hero { background: #f4f1ff; padding: 40px 0; }
.container { max-width: 600px; margin: 0 auto; padding: 0 20px; }
.btn { display: inline-block; background: #7c5cff; color: #fff; padding: 10px 18px; border-radius: 8px; text-decoration: none; }
.btn:hover { background: #5b3ce0; }` }, checks: [
        { msg: "The section background spans the full width", fn: (d, w) => { const h = d.querySelector(".hero"); return h.getBoundingClientRect().width >= d.body.getBoundingClientRect().width - 1; } },
        { msg: ".container has a max-width of 600px or less", fn: (d, w) => { const m = parseFloat(cs(w, d.querySelector(".container")).maxWidth); return m > 0 && m <= 600; } },
        { msg: "…and is centred (equal left and right margins)", fn: (d, w) => { const c = cs(w, d.querySelector(".container")); return parseFloat(c.marginLeft) > 0 && Math.abs(parseFloat(c.marginLeft) - parseFloat(c.marginRight)) < 1; } },
        { msg: "The button has a :hover rule", fn: (d) => sheetHas(d, /\.btn:hover/) },
      ] },
      { t: "h", h: "CSS organisation" },
      { t: "p", h: "Order your stylesheet the way the page reads: global resets and typography first, then layout helpers like <code>.container</code>, then each section top to bottom, then utilities. Group related rules, comment the sections, and when two selectors share declarations, <b>group them</b>: <code>.site-header, .site-footer { background: #14121f; }</code>." },
      { t: "h", h: "Aside: specificity" },
      { t: "p", h: "When two rules set the same property on the same element, the browser picks the one with the higher <b>specificity</b>. It's counted as three numbers: IDs, then classes / attributes / pseudo-classes, then elements / pseudo-elements. Compare from the left; only on a tie does the later rule win." },
      { t: "widget", name: "specificity" },
      { t: "h", h: "Aside: compound selectors" },
      { t: "code", lang: "css", code: `nav a { }            /* descendant: any a inside nav            (0,0,2) */
.gallery > img { }   /* child: only direct children            (0,1,1) */
.btn.btn--primary {} /* compound: one element with both classes (0,2,0) */
h2 + p { }           /* adjacent sibling: the p right after an h2 */` },
      { t: "quiz", q: "Which rule wins for <a class=\"btn\"> inside <nav class=\"main-nav\">: <code>nav a { color: red }</code> or <code>.btn { color: blue }</code>?", opts: ["nav a: it has two parts", ".btn: one class beats two element selectors", "Whichever comes last"], a: 1, why: "nav a is (0,0,2), .btn is (0,1,0). Any number of element selectors loses to a single class." },
      { t: "h", h: "Line-height debugging, and !important" },
      { t: "p", h: "Mystery gaps around text are often <code>line-height</code>: every line box is as tall as the line height, even for one line. Use DevTools to inspect the box. And <code>!important</code> overrides specificity entirely, which is why it's a last resort: the only way to beat it is another <code>!important</code>, and that's how stylesheets turn into arms races. Fix the specificity instead." },
      { t: "h", h: "Aside: buttons and links" },
      { t: "p", h: "If it navigates, it's an <code>&lt;a href&gt;</code>; if it does something on the page, it's a <code>&lt;button&gt;</code>. They can look identical: that's CSS's job. Inline elements like <code>&lt;a&gt;</code> ignore width and vertical margins, which is why button-style links usually need <code>display: inline-block</code>." },
      { t: "widget", name: "display" },
      { t: "h", h: "Aside: a main class and a modifier class" },
      { t: "p", h: "Instead of styling every button from scratch, write the shared styles once on a <b>main class</b> and the differences on <b>modifier classes</b>. This naming style comes from <b>BEM</b> (Block, Element, Modifier): <code>.btn</code>, <code>.btn--primary</code>, <code>.btn--secondary</code>." },
      { t: "htmlch", preview: true, prompt: "Refactor the buttons: move the shared styles into <code>.btn</code> (display inline-block, padding, border-radius, font-weight), then give each button <code>btn</code> plus a modifier, <code>btn--primary</code> or <code>btn--secondary</code>, that only sets its colours.", html: `<a class="explore-button" href="/explore">Explore the gallery</a>
<a class="sell-button" href="/sell">Start selling</a>`, css: `.explore-button { display: inline-block; padding: 10px 18px; border-radius: 8px; font-weight: 700; text-decoration: none; background: #7c5cff; color: #fff; }
.sell-button { display: inline-block; padding: 10px 18px; border-radius: 8px; font-weight: 700; text-decoration: none; border: 2px solid #7c5cff; color: #4b2fd6; }`, solution: { html: `<a class="btn btn--primary" href="/explore">Explore the gallery</a>
<a class="btn btn--secondary" href="/sell">Start selling</a>`, css: `.btn { display: inline-block; padding: 10px 18px; border-radius: 8px; font-weight: 700; text-decoration: none; }
.btn--primary { background: #7c5cff; color: #fff; }
.btn--secondary { border: 2px solid #7c5cff; color: #4b2fd6; }` }, checks: [
        { msg: "Both links have the class btn plus a modifier", fn: (d) => { const a = d.querySelectorAll("a"); return a.length === 2 && a[0].classList.contains("btn") && a[0].classList.contains("btn--primary") && a[1].classList.contains("btn") && a[1].classList.contains("btn--secondary"); } },
        { msg: ".btn holds the shared styles (inline-block, padding, rounded corners)", fn: (d, w) => sheetHas(d, /^\.btn\s*\{[^}]*display:\s*inline-block[^}]*padding[^}]*border-radius/) || sheetHas(d, /^\.btn\s*\{(?=[^}]*display:\s*inline-block)(?=[^}]*padding)(?=[^}]*border-radius)/) },
        { msg: "The buttons look different (different backgrounds)", fn: (d, w) => { const a = d.querySelectorAll("a"); return a.length === 2 && cs(w, a[0]).backgroundColor !== cs(w, a[1]).backgroundColor; } },
        { msg: "The modifiers don't repeat the padding", fn: (d) => !sheetHas(d, /\.btn--(primary|secondary)\s*\{[^}]*padding/) },
      ] },
      { t: "h", h: "Aside: flexbox flex-wrap" },
      { t: "p", h: "By default flex items squeeze onto one line. <code>flex-wrap: wrap</code> lets them flow onto new lines, which turns a row of gallery images into a responsive grid with no media queries. Try it below." },
      { t: "widget", name: "flexbox" },
      { t: "h", h: "Aside: overflow" },
      { t: "p", h: "When content is bigger than its box, <code>overflow</code> decides what happens: <code>visible</code> (spills out, the default), <code>hidden</code> (clipped), <code>scroll</code> or <code>auto</code> (scrollbars when needed). <code>text-overflow: ellipsis</code> adds \"…\" to clipped single-line text." },
      { t: "play", task: "Try each overflow value on <code>.card</code>, then make the title end with \"…\" using <code>white-space: nowrap; overflow: hidden; text-overflow: ellipsis</code>.", html: `<div class="card">
  <h3 class="title">Generative landscape number forty-two, second edition</h3>
  <p>This description is much longer than the card was designed for, so it spills out of the bottom of its box and over whatever comes next.</p>
</div>`, css: `.card { width: 220px; height: 120px; border: 2px solid #7c5cff; border-radius: 10px; padding: 10px; overflow: visible; }
.title { margin: 0 0 6px; font-size: 1rem; }` },
      { t: "h", h: "Aside: CSS float" },
      { t: "p", h: "<code>float: left</code> takes an element out of the normal flow and lets text wrap around it, which is what it was designed for: images in articles. Before flexbox, whole layouts were built with floats and \"clearfix\" hacks. Today, use flexbox or grid for layout and float only for wrapping text." },
      { t: "play", html: `<img src="https://placehold.co/120x120/7c5cff/ffffff?text=Art" alt="Artwork thumbnail" class="thumb">
<p>Mira Sol makes generative art from weather data. Each piece starts as a week of wind readings from a coastal station, which she turns into flowing lines of colour. Her new collection, Tidal, follows a single storm across the North Sea. Collectors can see the raw data behind every artwork.</p>`, css: `.thumb { float: left; margin: 0 14px 8px 0; border-radius: 10px; }
p { line-height: 1.6; }`, task: "Change <code>float: left</code> to <code>right</code>, then remove it: see how the text stops wrapping." },
      { t: "recap", items: ["Structure first: header, main, sections, footer", "Full-width sections, centred .container for content", ":hover, :active and :focus-visible states", "Specificity: IDs > classes > elements; avoid !important", "Main + modifier classes (BEM-style) keep buttons consistent", "flex-wrap for galleries; overflow for clipping; float for wrapping text"] },
    ]},

    { id: "css2-portfolio", title: "Build a Portfolio", min: 100, kind: "project", body: [
      { t: "p", h: "A series of short CSS challenges that turn a plain HTML page into a polished personal portfolio. Each challenge focuses on one skill. Try it first, then compare with the solution." },
      { t: "h", h: "Challenge 1: Setting up the layout" },
      { t: "htmlch", preview: true, prompt: "Put the photo and the intro side by side: make <code>.intro</code> a flex container with a gap of at least 24px and the items centred vertically. Keep the photo 200px wide and round.", html: `<section class="intro">
  <img class="photo" src="${ph(200, 200, "#2bb673", "#ffffff", "Me")}" alt="Portrait of Sam Rivera">
  <div>
    <p class="eyebrow">Hi, I'm Sam</p>
    <h1>Frontend developer who loves accessible, fast websites</h1>
    <a class="btn" href="#work">See my work</a>
  </div>
</section>`, css: `body { font-family: system-ui, sans-serif; }
.photo { width: 200px; }`, solution: { css: `body { font-family: system-ui, sans-serif; }
.intro { display: flex; gap: 32px; align-items: center; }
.photo { width: 200px; border-radius: 50%; }` }, checks: [
        { msg: ".intro is a flex container", fn: (d, w) => cs(w, d.querySelector(".intro")).display === "flex" },
        { msg: "There's a gap of at least 24px", fn: (d, w) => parseFloat(cs(w, d.querySelector(".intro")).columnGap) >= 24 },
        { msg: "Items are centred vertically", fn: (d, w) => cs(w, d.querySelector(".intro")).alignItems === "center" },
        { msg: "The photo is round", fn: (d, w) => { const r = cs(w, d.querySelector(".photo")).borderTopLeftRadius; return r === "50%" || parseFloat(r) >= 100; } },
      ] },
      { t: "h", h: "Challenge 2: Google Fonts" },
      { t: "p", h: "Google Fonts gives you a <code>&lt;link&gt;</code> to paste into your <code>&lt;head&gt;</code> (with <code>preconnect</code> hints for speed). Then use the family in CSS, <b>always with a fallback</b> in case the font fails to load." },
      { t: "code", lang: "html", code: `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;700&family=Lora:ital@0;1&display=swap" rel="stylesheet">` },
      { t: "htmlch", preview: true, prompt: "Use <code>'Poppins'</code> for headings and <code>'Lora'</code> for the body text, each with a sensible generic fallback (<code>sans-serif</code> and <code>serif</code>).", html: `<h1>Sam Rivera</h1>
<p>I build accessible, fast websites for small businesses.</p>`, css: `body { }
h1 { }`, solution: { css: `body { font-family: 'Lora', Georgia, serif; }
h1 { font-family: 'Poppins', system-ui, sans-serif; }` }, checks: [
        { msg: "Headings use Poppins with a sans-serif fallback", fn: (d, w) => { const f = cs(w, d.querySelector("h1")).fontFamily.toLowerCase(); return f.includes("poppins") && f.includes("sans-serif"); } },
        { msg: "Body text uses Lora with a serif fallback", fn: (d, w) => { const f = cs(w, d.querySelector("p")).fontFamily.toLowerCase(); return f.includes("lora") && /(^|,\s*)serif/.test(f); } },
      ] },
      { t: "h", h: "Challenge 3: Typography" },
      { t: "htmlch", preview: true, prompt: "Set up readable typography: body text at least 1rem with a line-height of 1.5 or more; the <code>h1</code> at least 2rem with a tighter line-height (1.3 or less); and the <code>.eyebrow</code> uppercase with some letter-spacing.", html: `<p class="eyebrow">Hi, I'm Sam</p>
<h1>Frontend developer who loves accessible, fast websites</h1>
<p>I've spent five years building websites for cafés, clinics and charities. I care about performance, accessibility and clean, maintainable code.</p>`, css: `body { font-size: 14px; line-height: 1.2; }
h1 { font-size: 22px; }`, solution: { css: `body { font-size: 1rem; line-height: 1.6; }
h1 { font-size: 2.5rem; line-height: 1.15; }
.eyebrow { text-transform: uppercase; letter-spacing: .12em; font-size: .8rem; }` }, checks: [
        { msg: "Body text is at least 16px with line-height ≥ 1.5", fn: (d, w) => { const p = cs(w, d.querySelectorAll("p")[1]); return parseFloat(p.fontSize) >= 16 && parseFloat(p.lineHeight) / parseFloat(p.fontSize) >= 1.5; } },
        { msg: "The h1 is at least 32px with line-height ≤ 1.3", fn: (d, w) => { const h = cs(w, d.querySelector("h1")); return parseFloat(h.fontSize) >= 32 && parseFloat(h.lineHeight) / parseFloat(h.fontSize) <= 1.3; } },
        { msg: "The eyebrow is uppercase with letter-spacing", fn: (d, w) => { const e = cs(w, d.querySelector(".eyebrow")); return e.textTransform === "uppercase" && parseFloat(e.letterSpacing) > 0; } },
      ] },
      { t: "h", h: "Challenges 4–6: Fancy details, breathing room and colours" },
      { t: "p", h: "Shadows and gradients add depth; generous, consistent spacing makes a design feel calm; and <b>CSS custom properties</b> (variables) keep colours consistent and easy to change." },
      { t: "code", lang: "css", code: `:root {
  --color-primary: #2bb673;
  --color-ink: #1d1b2e;
  --space: 1.5rem;
}
.btn { background: var(--color-primary); }
.card { padding: var(--space); box-shadow: 0 10px 30px rgb(0 0 0 / .12); }
.hero { background-image: linear-gradient(135deg, #e9fff4, #f4f1ff); }` },
      { t: "htmlch", preview: true, prompt: "Define <code>--color-primary</code> on <code>:root</code> and use it for the button's background. Give each <code>.card</code> a box-shadow, rounded corners and at least 24px of padding, and give <code>.projects</code> a gradient background.", html: `<section class="projects">
  <article class="card"><h3>Café Luna</h3><p>Online ordering for a busy café.</p></article>
  <article class="card"><h3>Clinic Finder</h3><p>An accessible appointment booker.</p></article>
  <a class="btn" href="/contact">Hire me</a>
</section>`, css: `.card { background: #fff; margin-bottom: 12px; }
.btn { display: inline-block; color: #fff; background: #2bb673; padding: 10px 18px; text-decoration: none; }`, solution: { css: `:root { --color-primary: #2bb673; }
.projects { background-image: linear-gradient(135deg, #e9fff4, #f4f1ff); padding: 24px; }
.card { background: #fff; margin-bottom: 12px; padding: 24px; border-radius: 12px; box-shadow: 0 10px 30px rgb(0 0 0 / .12); }
.btn { display: inline-block; color: #fff; background: var(--color-primary); padding: 10px 18px; text-decoration: none; }` }, checks: [
        { msg: "--color-primary is defined on :root", fn: (d) => sheetHas(d, /(:root|\.sy-body)\s*\{[^}]*--color-primary/) },
        { msg: "The button background uses var(--color-primary)", fn: (d) => sheetHas(d, /\.btn\s*\{[^}]*background(-color)?:\s*var\(--color-primary\)/) },
        { msg: "Cards have a shadow, rounded corners and 24px+ padding", fn: (d, w) => Array.from(d.querySelectorAll(".card")).every((c) => { const s = cs(w, c); return s.boxShadow !== "none" && parseFloat(s.borderTopLeftRadius) > 0 && parseFloat(s.paddingTop) >= 24; }) },
        { msg: ".projects has a gradient background", fn: (d, w) => /gradient/.test(cs(w, d.querySelector(".projects")).backgroundImage) },
      ] },
      { t: "h", h: "Challenges 7–10: Buttons, fancier headings and the finer details" },
      { t: "p", h: "Pseudo-elements, <code>::before</code> and <code>::after</code>, add decorative content without extra HTML: an accent line under a heading, a quote mark, an arrow on a link. They need a <code>content</code> property (often <code>\"\"</code>) to appear." },
      { t: "htmlch", preview: true, prompt: "Add a short accent bar under each <code>.section-title</code> with <code>::after</code> (e.g. 48px wide, 4px tall, in your accent colour), and make the <code>.btn</code> change on <code>:hover</code> and show a visible <code>:focus-visible</code> outline.", html: `<h2 class="section-title">Selected work</h2>
<p>Three projects I'm proud of.</p>
<a class="btn" href="/work">View all projects</a>`, css: `.section-title { font-size: 1.6rem; }
.btn { display: inline-block; background: #1d1b2e; color: #fff; padding: 10px 18px; border-radius: 8px; text-decoration: none; }`, solution: { css: `.section-title { font-size: 1.6rem; }
.section-title::after { content: ""; display: block; width: 48px; height: 4px; margin-top: 8px; background: #2bb673; border-radius: 2px; }
.btn { display: inline-block; background: #1d1b2e; color: #fff; padding: 10px 18px; border-radius: 8px; text-decoration: none; transition: background-color .15s; }
.btn:hover { background: #2bb673; }
.btn:focus-visible { outline: 3px solid #f2b24d; outline-offset: 3px; }` }, checks: [
        { msg: ".section-title has an ::after accent bar", fn: (d, w) => { const a = w.getComputedStyle(d.querySelector(".section-title"), "::after"); return a.content !== "none" && a.content !== "normal" && parseFloat(a.height) > 0 && parseFloat(a.width) > 0; } },
        { msg: "The button has a :hover style", fn: (d) => sheetHas(d, /\.btn:hover/) },
        { msg: "The button has a :focus-visible outline", fn: (d) => sheetHas(d, /\.btn:focus(-visible)?\s*\{[^}]*outline/) },
      ] },
      { t: "recap", items: ["Flexbox for side-by-side layouts", "Web fonts with fallbacks", "Readable type: 1rem+, line-height 1.5, tighter headings", "Custom properties for colours and spacing", "Shadows, gradients, pseudo-elements and interaction states"] },
    ]},

    { id: "css2-insta", title: "Solo Project - Instagram Clone", min: 75, kind: "project", body: [
      { t: "p", h: "Build an Instagram-style post card from scratch. It's a classic exercise: lots of small layout and styling decisions, all with the skills you already have." },
      { t: "h", h: "The spec" },
      { t: "steps", items: [
        "A <code>.post</code> card, max 400px wide, with a border or shadow",
        "A <code>.post-header</code> row: a round 40px avatar and the username (bold), vertically centred",
        "The post image, full width of the card",
        "An actions row of three icon <b>buttons</b> (like, comment, share), each with an <code>aria-label</code>",
        "The likes count in bold, then a caption that starts with the username in bold",
      ] },
      { t: "htmlch", preview: true, prompt: "Build the post card to the spec. The starter has the content; add the structure and the CSS.", html: `<!-- Avatar: https://placehold.co/80x80/f2b24d/ffffff?text=MS -->
<!-- Post image: https://placehold.co/400x400/5a6cf0/ffffff?text=Tidal -->
<!-- Username: mira.sol  ·  Likes: 1,284  ·  Caption: Tidal #3 is live. A whole storm, in one line. -->
`, css: ``, solution: { html: `<article class="post">
  <header class="post-header">
    <img class="avatar" src="https://placehold.co/80x80/f2b24d/ffffff?text=MS" alt="">
    <span class="username">mira.sol</span>
  </header>
  <img class="post-image" src="https://placehold.co/400x400/5a6cf0/ffffff?text=Tidal" alt="Tidal #3: a single blue line tracing a storm">
  <div class="actions">
    <button aria-label="Like">♡</button>
    <button aria-label="Comment">💬</button>
    <button aria-label="Share">↗</button>
  </div>
  <p class="likes">1,284 likes</p>
  <p class="caption"><span class="username">mira.sol</span> Tidal #3 is live. A whole storm, in one line.</p>
</article>`, css: `.post { max-width: 400px; border: 1px solid #dbdbdb; border-radius: 10px; overflow: hidden; font-family: system-ui, sans-serif; font-size: 14px; }
.post-header { display: flex; align-items: center; gap: 10px; padding: 10px 12px; }
.avatar { width: 40px; height: 40px; border-radius: 50%; }
.username { font-weight: 700; }
.post-image { display: block; width: 100%; }
.actions { display: flex; gap: 6px; padding: 6px 8px 0; }
.actions button { background: none; border: 0; font-size: 22px; cursor: pointer; }
.likes { font-weight: 700; margin: 6px 12px 4px; }
.caption { margin: 0 12px 12px; }` }, checks: [
        { msg: ".post is at most 400px wide, with a border or shadow", fn: (d, w) => { const p = d.querySelector(".post"); if (!p) return false; const s = cs(w, p); return p.getBoundingClientRect().width <= 404 && (parseFloat(s.borderTopWidth) > 0 || s.boxShadow !== "none"); } },
        { msg: "The header is a centred flex row", fn: (d, w) => { const h = d.querySelector(".post-header"); return !!h && cs(w, h).display === "flex" && cs(w, h).alignItems === "center"; } },
        { msg: "The avatar is a 40px circle", fn: (d, w) => { const a = d.querySelector(".avatar"); if (!a) return false; const r = a.getBoundingClientRect(); const br = cs(w, a).borderTopLeftRadius; return Math.round(r.width) === 40 && Math.round(r.height) === 40 && (br === "50%" || parseFloat(br) >= 20); } },
        { msg: "The username is bold", fn: (d, w) => { const u = d.querySelector(".post-header .username, .post-header strong, .post-header b"); return !!u && Number(cs(w, u).fontWeight) >= 600; } },
        { msg: "The post image fills the card's width", fn: (d) => { const p = d.querySelector(".post"), i = d.querySelector(".post-image, .post > img:not(.avatar)"); return !!p && !!i && Math.abs(i.getBoundingClientRect().width - p.clientWidth) < 2; } },
        { msg: "Three action buttons, each with an aria-label", fn: (d) => { const b = d.querySelectorAll(".actions button"); return b.length === 3 && Array.from(b).every((x) => (x.getAttribute("aria-label") || "").trim()); } },
        { msg: "Likes are bold", fn: (d, w) => { const l = Array.from(d.querySelectorAll(".post p, .post span, .post strong")).find((x) => /1,284 likes/.test(x.textContent)); return !!l && Number(cs(w, l).fontWeight) >= 600; } },
      ] },
      { t: "recap", items: ["Break a design into rows and boxes before writing CSS", "Flex rows with align-items: center for headers and toolbars", "border-radius: 50% for circles (with equal width and height)", "Icon buttons need aria-labels"] },
    ]},

    { id: "css2-cowork", title: "Build a Coworking Space Site", min: 90, kind: "project", body: [
      { t: "p", h: "<b>The Hive</b> is a coworking space. Its landing page needs a menu icon in the corner, text over a banner image, buttons that don't stretch, and a chat box that stays in the corner while you scroll. All of that is <b>positioning</b>." },
      { t: "h", h: "Aside: margin: auto on flexbox children" },
      { t: "p", h: "Inside a flex container, <code>margin-left: auto</code> on a child pushes it (and everything after it) to the far end. It's the easiest way to put a logo on the left and one button on the right." },
      { t: "h", h: "Aside: position relative and absolute" },
      { t: "widget", name: "position" },
      { t: "steps", items: [
        "<code>position: relative</code> on the parent, <code>position: absolute</code> on the child: the child is placed relative to the parent's padding box",
        "Absolute elements leave the flow: their siblings act as if they weren't there",
        "<code>top/right/bottom/left</code> only work on positioned elements",
        "<code>inset: 0</code> is shorthand for all four offsets: a full overlay",
      ] },
      { t: "htmlch", preview: true, prompt: "Pin the menu icon to the top-right corner of the header (16px from the top and right), and put the banner text over the bottom-left of the image.", html: `<header class="header">
  <span class="logo">The Hive</span>
  <button class="menu" aria-label="Open menu">☰</button>
</header>
<div class="banner">
  <img src="${ph(600, 260, "#1d1b2e", "#f2b24d", "Desks · Coffee · Community")}" alt="Sunlit shared office with long wooden desks">
  <h1 class="banner-text">Work together</h1>
</div>`, css: `.header { background: #f2b24d; padding: 16px; }
.menu { font-size: 22px; background: none; border: 0; }
.banner img { display: block; width: 100%; }
.banner-text { color: #fff; margin: 0; }`, solution: { css: `.header { background: #f2b24d; padding: 16px; position: relative; }
.menu { font-size: 22px; background: none; border: 0; position: absolute; top: 16px; right: 16px; }
.banner { position: relative; }
.banner img { display: block; width: 100%; }
.banner-text { color: #fff; margin: 0; position: absolute; left: 20px; bottom: 16px; }` }, checks: [
        { msg: "The header is the positioning context", fn: (d, w) => cs(w, d.querySelector(".header")).position === "relative" },
        { msg: "The menu button is absolutely positioned 16px from the top and right", fn: (d, w) => { const s = cs(w, d.querySelector(".menu")); return s.position === "absolute" && parseFloat(s.top) === 16 && parseFloat(s.right) === 16; } },
        { msg: "The banner text sits over the image, near the bottom-left", fn: (d) => { const img = d.querySelector(".banner img").getBoundingClientRect(), t = d.querySelector(".banner-text").getBoundingClientRect(); return t.top > img.top + img.height / 2 && t.bottom <= img.bottom && t.left < img.left + img.width / 2; } },
      ] },
      { t: "h", h: "Stop the vertical stretch on the button" },
      { t: "p", h: "Flex items stretch to the height of the row by default (<code>align-items: stretch</code>). A button next to a tall image becomes a tall button. Fix it on the container with <code>align-items: center</code> or <code>flex-start</code>, or on the one item with <code>align-self</code>." },
      { t: "h", h: "Aside: position fixed and z-index" },
      { t: "p", h: "<code>position: fixed</code> places an element relative to the viewport, so it stays put when the page scrolls: cookie bars, chat buttons, sticky headers. Overlapping elements are painted in order of <code>z-index</code>, which only works on positioned elements and is compared within the same <b>stacking context</b>." },
      { t: "widget", name: "zindex" },
      { t: "htmlch", preview: true, prompt: "Make the chat box stay in the bottom-right corner of the screen (20px from the bottom and right) above everything else, and stop the \"Book a tour\" button stretching to the height of the image.", html: `<section class="tour">
  <img src="${ph(220, 160, "#f2b24d", "#1d1b2e", "Tour")}" alt="Meeting room with a whiteboard">
  <button class="btn">Book a tour</button>
</section>
<div class="chat">💬 Questions? Chat with us</div>`, css: `.tour { display: flex; gap: 16px; }
.btn { background: #1d1b2e; color: #fff; border: 0; padding: 10px 16px; border-radius: 8px; }
.chat { background: #1d1b2e; color: #fff; padding: 10px 14px; border-radius: 12px; }`, solution: { css: `.tour { display: flex; gap: 16px; align-items: center; }
.btn { background: #1d1b2e; color: #fff; border: 0; padding: 10px 16px; border-radius: 8px; }
.chat { background: #1d1b2e; color: #fff; padding: 10px 14px; border-radius: 12px; position: fixed; bottom: 20px; right: 20px; z-index: 10; }` }, checks: [
        { msg: "The chat box is fixed 20px from the bottom and right", fn: (d, w) => { const s = cs(w, d.querySelector(".chat")); return s.position === "fixed" && parseFloat(s.bottom) === 20 && parseFloat(s.right) === 20; } },
        { msg: "It has a positive z-index", fn: (d, w) => Number(cs(w, d.querySelector(".chat")).zIndex) > 0 },
        { msg: "The button is no longer as tall as the image", fn: (d) => d.querySelector(".btn").getBoundingClientRect().height < d.querySelector(".tour img").getBoundingClientRect().height - 20 },
      ] },
      { t: "quiz", q: "An element has z-index: 999 but still appears behind another element. What's the most likely reason?", opts: ["z-index can't go above 100", "It's position: static, or it's inside a parent with its own stacking context that sits below the other element", "z-index only works on images"], a: 1, why: "z-index needs a positioned (or flex/grid) element, and it only competes within its stacking context." },
      { t: "recap", items: ["margin-left: auto pushes flex items apart", "relative parent + absolute child for corner icons and overlays", "align-items / align-self stop flex stretching", "position: fixed for UI that stays on screen", "z-index needs positioning and respects stacking contexts"] },
    ]},
  ],
};
