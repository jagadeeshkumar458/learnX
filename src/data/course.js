/* Shipyard — course content.
   Block types:
   p      prose (inline HTML allowed)
   h      sub-heading
   callout {kind: tip|warn|key|why}
   code   static code sample {lang, code}
   play   live playground {html, css, js, task}
   quiz   {q, opts, a (index), why}
   jsch   JS challenge {fn, prompt, starter, tests:[{msg, fn:(f)=>bool}]}
   htmlch HTML/CSS challenge {prompt, html, css, checks:[{msg, fn:(doc,win)=>bool}]}
   widget {name}
   steps  ordered list of build steps
   recap  key takeaways
*/
var L_SEQ = 0;
export const COURSE = {
  title: "The Fullstack Developer Path",
  modules: [
/* ───────────────────────── 1. INTRODUCTION ───────────────────────── */
{
  id: "intro", title: "Introduction", blurb: "Meet the path, learn how this platform works, and ship your first app in minutes.",
  lessons: [
  { id: "intro-welcome", title: "Welcome to the Fullstack Path", min: 4, kind: "lesson", body: [
    { t: "p", h: "A <b>fullstack developer</b> can build every layer of a web product: the interface people touch, the server that runs the logic, and the database that remembers everything. This path takes you through all three, in the order working developers actually learn them." },
    { t: "widget", name: "stack" },
    { t: "h", h: "How this path is built" },
    { t: "p", h: "Every module follows the same rhythm: a short concept, a live playground where you poke at it, a quiz to lock it in, then a build. Solo projects come with requirements but no hand-holding. That gap between “I followed along” and “I built it alone” is where skill comes from." },
    { t: "callout", kind: "key", h: "Learn by shipping. Reading about code builds recognition. Writing code builds recall. Interviews and jobs test recall." },
    { t: "h", h: "The route ahead" },
    { t: "p", h: "HTML &amp; CSS → JavaScript → developer tools → accessibility → responsive design → APIs and async → AI engineering → Node, Express and SQL → React → testing → TypeScript → Next.js → your job search." },
    { t: "quiz", q: "A user clicks “Save” on a profile form. Which layer permanently stores their new bio?", opts: ["The frontend (HTML, CSS, JS in the browser)", "The backend server", "The database"], a: 2, why: "The frontend collects the input, the backend validates it and decides what to do, and the database is what actually persists it." },
    { t: "recap", items: ["Frontend = what runs in the browser", "Backend = logic on a server, exposed through an API", "Database = durable storage", "Each module: concept → playground → quiz → build"] }
  ]},
  { id: "intro-platform", title: "Learn the Platform", min: 3, kind: "lesson", body: [
    { t: "p", h: "Everything here is hands-on. Before you start, take two minutes to learn the controls." },
    { t: "h", h: "Your progress loop" },
    { t: "p", h: "You earn <b>XP</b> for finishing lessons (+50), answering quizzes correctly (+10) and passing challenges (+25). XP raises your <b>level</b>. Learning on consecutive days builds a <b>streak</b>. Small daily sessions beat weekend marathons, because spaced practice is how memory actually consolidates." },
    { t: "h", h: "Playgrounds" },
    { t: "p", h: "Playgrounds are real editors connected to a live preview. Edit any tab and the preview updates as you type. <kbd>Ctrl</kbd> + <kbd>Enter</kbd> re-runs it, and anything you <code>console.log</code> appears in the console strip underneath." },
    { t: "play", task: "Change the heading text to your own name, then change the color in the CSS tab.", html: `<h1>Hello, developer</h1>\n<p>You are editing live code.</p>`, css: `h1 {\n  color: #f25c1f;\n  font-family: system-ui, sans-serif;\n}`, js: `console.log("Playground is running");` },
    { t: "h", h: "Shortcuts" },
    { t: "p", h: "<kbd>Ctrl</kbd>/<kbd>⌘</kbd> + <kbd>K</kbd> searches every lesson. <kbd>Alt</kbd> + <kbd>→</kbd> and <kbd>Alt</kbd> + <kbd>←</kbd> move between lessons." },
    { t: "quiz", q: "Which habit grows your streak?", opts: ["One long session every weekend", "At least one lesson every day", "Skipping quizzes to finish faster"], a: 1, why: "Streaks count consecutive days. Short, daily sessions are also what learning research favours." }
  ]},
  { id: "intro-first-app", title: "Your First App", min: 6, kind: "build", body: [
    { t: "p", h: "Let’s ship something before learning any theory. Every web app is built from three languages working together:" },
    { t: "p", h: "<b>HTML</b> describes what is on the page. <b>CSS</b> decides how it looks. <b>JavaScript</b> makes it respond to people." },
    { t: "play", task: "Click the button in the preview. Then add a third greeting to the array in the JS tab.", html: `<main class="card">\n  <p class="eyebrow">My first app</p>\n  <h1 id="greeting">Hello!</h1>\n  <button id="btn">Say something else</button>\n</main>`, css: `body { display:grid; place-items:center; min-height:100vh; margin:0;\n  font-family: system-ui, sans-serif; background:#141a2e; }\n.card { background:white; padding:32px 40px; border-radius:16px; text-align:center; }\n.eyebrow { color:#f25c1f; font-weight:700; text-transform:uppercase; font-size:12px; letter-spacing:.1em; }\nbutton { background:#141a2e; color:white; border:0; padding:12px 20px;\n  border-radius:999px; font-size:15px; cursor:pointer; }`, js: `const greetings = ["Hello!", "Namaste!", "Hola!"];\nlet i = 0;\n\ndocument.getElementById("btn").addEventListener("click", () => {\n  i = (i + 1) % greetings.length;\n  document.getElementById("greeting").textContent = greetings[i];\n  console.log("Now showing:", greetings[i]);\n});` },
    { t: "callout", kind: "why", h: "Notice the <code>id</code> attributes. They are how JavaScript finds HTML elements. Connecting the three languages through names like this is the core skill of frontend development." },
    { t: "quiz", q: "Which language made the button change the heading?", opts: ["HTML", "CSS", "JavaScript"], a: 2, why: "The click listener and the <code>textContent</code> update are JavaScript. HTML only defined the button and heading." },
    { t: "recap", items: ["HTML = structure", "CSS = presentation", "JavaScript = behaviour", "<code>id</code> attributes connect JS to HTML"] }
  ]}
  ]
},
/* ───────────────────────── 2. HTML & CSS ───────────────────────── */
{
  id: "htmlcss", title: "HTML and CSS Fundamentals", blurb: "Learn to build websites with HTML and CSS by making four real pages and a solo project.",
  lessons: [
  { id: "hc-welcome", title: "Welcome to HTML & CSS", min: 3, kind: "lesson", body: [
    { t: "p", h: "Every website you have ever used is HTML and CSS underneath. Frameworks like React generate it, design tools export it, and browsers only understand it. Learning it properly pays off for your entire career." },
    { t: "callout", kind: "key", h: "Think of a house. HTML is the frame and rooms, CSS is the paint and furniture, JavaScript is the electricity." },
    { t: "p", h: "In this module you will build a <b>business card</b>, a <b>space exploration layout</b>, a <b>birthday site</b> with animation, and finally a <b>hometown homepage</b> on your own." },
    { t: "quiz", q: "HTML is…", opts: ["A programming language", "A markup language that describes content", "A styling language"], a: 1, why: "HTML (HyperText Markup Language) labels content: this is a heading, this is a link. It has no logic like loops or variables." }
  ]},
  { id: "hc-html", title: "Intro to HTML", min: 12, kind: "lesson", body: [
    { t: "h", h: "Elements, tags and attributes" },
    { t: "p", h: "An <b>element</b> is usually an opening tag, content, and a closing tag. <b>Attributes</b> live inside the opening tag and add extra information." },
    { t: "code", lang: "html", code: `<a href="https://developer.mozilla.org" target="_blank">Read MDN</a>\n<!-- tag ↑    attribute ↑                    content ↑      ↑ closing tag -->` },
    { t: "p", h: "Some elements are <b>void</b>: they have no content and no closing tag, like <code>&lt;img&gt;</code>, <code>&lt;br&gt;</code>, <code>&lt;input&gt;</code> and <code>&lt;meta&gt;</code>." },
    { t: "h", h: "The document skeleton" },
    { t: "code", lang: "html", code: `<!DOCTYPE html>\n<html lang="en">\n  <head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <title>My page</title>\n    <link rel="stylesheet" href="styles.css">\n  </head>\n  <body>\n    <!-- everything visible goes here -->\n  </body>\n</html>` },
    { t: "p", h: "<code>&lt;head&gt;</code> holds information <i>about</i> the page (title, styles, metadata). <code>&lt;body&gt;</code> holds what people see. The <code>lang</code> attribute helps screen readers pronounce text correctly." },
    { t: "h", h: "The elements you will use daily" },
    { t: "p", h: "<code>h1</code>–<code>h6</code> headings (one <code>h1</code> per page, don’t skip levels) · <code>p</code> paragraph · <code>a</code> link · <code>img</code> image (always with <code>alt</code>) · <code>ul</code>/<code>ol</code> + <code>li</code> lists · <code>button</code> · <code>div</code> and <code>span</code> generic containers." },
    { t: "h", h: "Semantic HTML" },
    { t: "p", h: "Prefer elements that describe meaning: <code>header</code>, <code>nav</code>, <code>main</code>, <code>section</code>, <code>article</code>, <code>footer</code>. They look like a <code>div</code> but tell browsers, search engines and assistive tech what each region is for." },
    { t: "play", task: "Add a list item, then wrap the links in a <nav> element.", html: `<header>\n  <h1>Priya Sharma</h1>\n  <p>Frontend developer in Bengaluru</p>\n</header>\n<main>\n  <h2>Skills</h2>\n  <ul>\n    <li>HTML</li>\n    <li>CSS</li>\n  </ul>\n  <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='80'%3E%3Crect width='120' height='80' rx='10' fill='%23f25c1f'/%3E%3C/svg%3E" alt="Orange placeholder banner">\n  <p><a href="https://github.com">GitHub</a> · <a href="https://linkedin.com">LinkedIn</a></p>\n</main>`, css: `body { font-family: system-ui, sans-serif; padding: 16px; }`, js: "" },
    { t: "quiz", q: "Which of these is a void element?", opts: ["<p>", "<img>", "<li>", "<section>"], a: 1, why: "<code>&lt;img&gt;</code> has no content, so it never needs a closing tag." },
    { t: "quiz", q: "Why should every <img> have an alt attribute?", opts: ["It makes the image load faster", "Screen readers read it aloud and it shows if the image fails", "It's required for CSS to style the image"], a: 1, why: "<code>alt</code> is the text alternative. Use <code>alt=\"\"</code> for purely decorative images so screen readers skip them." },
    { t: "htmlch", prompt: "Build a mini profile: one <h1>, a paragraph, an image with a non-empty alt, and a link that opens in a new tab.", html: `<!-- write your HTML here -->\n`, css: "", checks: [
      { msg: "Has exactly one <h1>", fn: (d) => d.querySelectorAll("h1").length === 1 },
      { msg: "Has a <p> with text", fn: (d) => [...d.querySelectorAll("p")].some(p => p.textContent.trim().length > 0) },
      { msg: "Image has a meaningful alt", fn: (d) => [...d.querySelectorAll("img")].some(i => (i.getAttribute("alt") || "").trim().length > 2) },
      { msg: "Link has an href and target=\"_blank\"", fn: (d) => [...d.querySelectorAll("a[href]")].some(a => a.getAttribute("target") === "_blank") }
    ]},
    { t: "recap", items: ["Element = opening tag + content + closing tag", "Attributes add info: href, src, alt, id, class", "head = metadata, body = visible content", "Prefer semantic tags over generic divs"] }
  ]},
  { id: "hc-css", title: "Intro to CSS", min: 14, kind: "lesson", body: [
    { t: "h", h: "Anatomy of a rule" },
    { t: "code", lang: "css", code: `/* selector    property   value */\n.card       { color:     #141a2e; }\n\nh1 { font-size: 2rem; }        /* element selector */\n.price { font-weight: 700; }   /* class selector   */\n#hero { padding: 40px; }       /* id selector      */\nnav a:hover { color: tomato; } /* descendant + pseudo-class */` },
    { t: "p", h: "Link a stylesheet with <code>&lt;link rel=\"stylesheet\" href=\"styles.css\"&gt;</code> in the head. Avoid inline <code>style=\"\"</code> attributes except for quick tests." },
    { t: "h", h: "The cascade and specificity" },
    { t: "p", h: "When two rules target the same element, the browser decides by <b>specificity</b> first, then by source order (later wins). Specificity is scored as (ids, classes/attributes/pseudo-classes, elements). Compare left to right." },
    { t: "widget", name: "specificity" },
    { t: "callout", kind: "tip", h: "Style with classes almost everywhere. Ids score so high that overriding them later gets painful, and <code>!important</code> is a last resort." },
    { t: "h", h: "The box model" },
    { t: "p", h: "Every element is a rectangle made of <b>content</b>, <b>padding</b>, <b>border</b> and <b>margin</b>. Drag the sliders and watch the total width change." },
    { t: "widget", name: "boxmodel" },
    { t: "code", lang: "css", code: `/* Put this at the top of every project */\n*, *::before, *::after {\n  box-sizing: border-box;\n}` },
    { t: "p", h: "With <code>border-box</code>, the <code>width</code> you set includes padding and border, which is what you almost always want." },
    { t: "h", h: "Units and colors" },
    { t: "p", h: "<code>px</code> fixed pixels · <code>rem</code> relative to the root font size (great for type and spacing) · <code>%</code> relative to the parent · <code>vw</code>/<code>vh</code> relative to the viewport. Colors: named (<code>tomato</code>), hex (<code>#f25c1f</code>), <code>rgb()</code>, <code>hsl()</code>." },
    { t: "quiz", q: "Which selector wins? <code>#nav a</code> vs <code>.menu .link</code>", opts: ["#nav a — score (1,0,1)", ".menu .link — score (0,2,0)", "Whichever comes last"], a: 0, why: "One id beats any number of classes. Source order only decides when specificity ties." },
    { t: "quiz", q: "With box-sizing: content-box, width: 200px, padding: 20px, border: 5px — how wide is the element?", opts: ["200px", "240px", "250px"], a: 2, why: "200 + 20×2 + 5×2 = 250px. With border-box it would be exactly 200px." },
    { t: "htmlch", prompt: "Style the .tag element: give it padding, a background color, and rounded corners (border-radius).", html: `<span class="tag">New</span>`, css: `.tag {\n  /* your styles */\n}`, checks: [
      { msg: "Has padding", fn: (d, w) => parseFloat(w.getComputedStyle(d.querySelector(".tag")).paddingLeft) > 0 },
      { msg: "Has a background color", fn: (d, w) => { const c = w.getComputedStyle(d.querySelector(".tag")).backgroundColor; return c && c !== "rgba(0, 0, 0, 0)" && c !== "transparent"; } },
      { msg: "Has rounded corners", fn: (d, w) => parseFloat(w.getComputedStyle(d.querySelector(".tag")).borderTopLeftRadius) > 0 }
    ]},
    { t: "recap", items: ["selector { property: value; }", "Specificity: ids > classes > elements; ties go to the later rule", "Box = content + padding + border + margin", "Use box-sizing: border-box everywhere", "rem for type and spacing"] }
  ]},
  { id: "hc-card", title: "Build a Business Card", min: 15, kind: "build", body: [
    { t: "p", h: "Your first build: a digital business card. You will practise containers, spacing, typography and centering." },
    { t: "steps", items: ["Wrap everything in a <code>.card</code> container", "Add a circular avatar with <code>border-radius: 50%</code>", "Set a type hierarchy: name large, role muted", "Center the card on the page with flexbox", "Add depth with <code>box-shadow</code>"] },
    { t: "h", h: "Centering, finally solved" },
    { t: "code", lang: "css", code: `body {\n  min-height: 100vh;\n  display: flex;\n  justify-content: center;  /* main axis (horizontal) */\n  align-items: center;      /* cross axis (vertical)  */\n}` },
    { t: "play", task: "Change the shadow, swap the accent color, and add a phone number line.", html: `<article class="card">\n  <div class="avatar">AK</div>\n  <h1>Arjun Kumar</h1>\n  <p class="role">Fullstack Developer</p>\n  <ul class="links">\n    <li>arjun@example.dev</li>\n    <li>github.com/arjun</li>\n  </ul>\n</article>`, css: `*, *::before, *::after { box-sizing: border-box; }\nbody { margin:0; min-height:100vh; display:flex; justify-content:center; align-items:center;\n  background:#e9edf5; font-family: system-ui, sans-serif; }\n.card { width: 300px; background:white; padding: 32px; border-radius: 20px;\n  text-align:center; box-shadow: 0 20px 40px rgba(20,26,46,.15); }\n.avatar { width:84px; height:84px; border-radius:50%; margin: 0 auto 16px;\n  display:grid; place-items:center; background:#f25c1f; color:white; font-weight:800; font-size:28px; }\nh1 { margin:0; font-size: 1.5rem; }\n.role { color:#5b6481; margin: 4px 0 20px; }\n.links { list-style:none; padding:0; margin:0; display:grid; gap:8px; font-size:.9rem; }`, js: "" },
    { t: "quiz", q: "What makes a square element a circle?", opts: ["border-radius: 100px", "border-radius: 50%", "shape: circle"], a: 1, why: "50% rounds each corner by half the side length, which produces a circle for any square size." },
    { t: "htmlch", prompt: "Make the .avatar circular, and center the .card on the page using flexbox on body.", html: `<div class="card"><div class="avatar"></div></div>`, css: `body { margin:0; min-height:100vh; }\n.card { width:200px; padding:20px; background:#eee; }\n.avatar { width:80px; height:80px; background:tomato; }`, checks: [
      { msg: "body uses display: flex", fn: (d, w) => w.getComputedStyle(d.body).display === "flex" },
      { msg: "body centers horizontally (justify-content: center)", fn: (d, w) => w.getComputedStyle(d.body).justifyContent === "center" },
      { msg: "body centers vertically (align-items: center)", fn: (d, w) => w.getComputedStyle(d.body).alignItems === "center" },
      { msg: ".avatar is a circle", fn: (d, w) => { const r = w.getComputedStyle(d.querySelector(".avatar")).borderTopLeftRadius; return r.includes("%") ? parseFloat(r) >= 50 : parseFloat(r) >= 40; } }
    ]}
  ]},
  { id: "hc-space", title: "Build a Space Exploration Layout", min: 18, kind: "build", body: [
    { t: "p", h: "Real pages are rows and columns. <b>Flexbox</b> is the tool for laying items out along one axis. Experiment with every property here before building." },
    { t: "widget", name: "flexbox" },
    { t: "h", h: "The two axes" },
    { t: "p", h: "<code>justify-content</code> distributes items along the <b>main axis</b> (the direction set by <code>flex-direction</code>). <code>align-items</code> aligns them on the <b>cross axis</b>. Switch the direction to <code>column</code> above and watch the two properties swap roles." },
    { t: "callout", kind: "tip", h: "<code>gap</code> is the cleanest way to space flex items. No more margin hacks on the last child." },
    { t: "play", task: "Make the mission cards wrap onto new lines on narrow screens (flex-wrap) and give the nav links more space.", html: `<header class="top">\n  <span class="logo">◎ Orbit</span>\n  <nav><a href="#">Missions</a><a href="#">Crew</a><a href="#">Launch</a></nav>\n</header>\n<section class="hero">\n  <h1>Explore the outer planets</h1>\n  <p>Next launch window opens in 14 days.</p>\n</section>\n<section class="missions">\n  <article><h3>Europa</h3><p>Ice-ocean moon of Jupiter</p></article>\n  <article><h3>Titan</h3><p>Methane lakes on Saturn's moon</p></article>\n  <article><h3>Triton</h3><p>Neptune's retrograde moon</p></article>\n</section>`, css: `* { box-sizing:border-box; }\nbody { margin:0; font-family: system-ui, sans-serif; color:white;\n  background: radial-gradient(circle at 70% 20%, #2b3a7a, #0a0e1f 60%); min-height:100vh; }\n.top { display:flex; justify-content:space-between; align-items:center; padding:20px 32px; }\n.logo { font-weight:800; }\nnav { display:flex; gap:12px; }\nnav a { color:#cbd3ff; text-decoration:none; }\n.hero { padding: 48px 32px; }\n.hero h1 { font-size: 2.5rem; margin:0 0 8px; }\n.missions { display:flex; gap:16px; padding: 0 32px 40px; }\n.missions article { flex: 1; min-width: 180px; padding:20px; border-radius:14px;\n  background: rgba(255,255,255,.08); border:1px solid rgba(255,255,255,.15); }`, js: "" },
    { t: "quiz", q: "With flex-direction: column, which property centers items horizontally?", opts: ["justify-content: center", "align-items: center", "text-align: center"], a: 1, why: "In a column, the main axis is vertical, so horizontal alignment is the cross axis, which is controlled by <code>align-items</code>." },
    { t: "htmlch", prompt: "Lay out the .row as a flex container with its items spaced evenly (space-between) and a gap.", html: `<div class="row"><div>A</div><div>B</div><div>C</div></div>`, css: `.row div { padding:20px; background:#3d5afe; color:white; }`, checks: [
      { msg: ".row is a flex container", fn: (d, w) => w.getComputedStyle(d.querySelector(".row")).display === "flex" },
      { msg: "Uses justify-content: space-between", fn: (d, w) => w.getComputedStyle(d.querySelector(".row")).justifyContent === "space-between" },
      { msg: "Has a gap", fn: (d, w) => parseFloat(w.getComputedStyle(d.querySelector(".row")).columnGap) > 0 }
    ]}
  ]},
  { id: "hc-birthday", title: "Build a Birthday Website", min: 16, kind: "build", body: [
    { t: "p", h: "Time for personality: custom fonts, CSS variables and animation." },
    { t: "h", h: "CSS custom properties" },
    { t: "code", lang: "css", code: `:root {\n  --brand: #f25c1f;\n  --radius: 16px;\n}\n.button { background: var(--brand); border-radius: var(--radius); }` },
    { t: "p", h: "Change the variable once and every rule that uses it updates. This is how real design systems and dark modes work." },
    { t: "h", h: "Keyframe animations" },
    { t: "code", lang: "css", code: `@keyframes float {\n  0%, 100% { transform: translateY(0); }\n  50%      { transform: translateY(-20px); }\n}\n.balloon { animation: float 3s ease-in-out infinite; }` },
    { t: "callout", kind: "tip", h: "Animate <code>transform</code> and <code>opacity</code>. The browser can move them on the GPU without recalculating layout, so they stay smooth at 60fps." },
    { t: "callout", kind: "warn", h: "Respect people who get motion sickness: wrap big animations in <code>@media (prefers-reduced-motion: no-preference) { … }</code>." },
    { t: "play", task: "Change the animation speed, add a fourth balloon, and edit --party to a new color.", html: `<main>\n  <div class="balloons">\n    <span class="balloon">🎈</span><span class="balloon">🎈</span><span class="balloon">🎈</span>\n  </div>\n  <h1>Happy Birthday, Meera!</h1>\n  <p>Thirty trips around the sun ☀️</p>\n</main>`, css: `:root { --party: #f25c1f; --ink: #141a2e; }\nbody { margin:0; min-height:100vh; display:grid; place-items:center; text-align:center;\n  font-family: Georgia, serif; background: linear-gradient(160deg, #fff4e6, #ffe0ec); color: var(--ink); }\nh1 { font-size: 2.6rem; color: var(--party); margin: 10px 0; }\n.balloons { font-size: 56px; display:flex; gap: 18px; justify-content:center; }\n@keyframes float {\n  0%, 100% { transform: translateY(0) rotate(-4deg); }\n  50% { transform: translateY(-24px) rotate(4deg); }\n}\n.balloon { display:inline-block; animation: float 3s ease-in-out infinite; }\n.balloon:nth-child(2) { animation-delay: .4s; }\n.balloon:nth-child(3) { animation-delay: .8s; }`, js: "" },
    { t: "quiz", q: "Which properties are cheapest to animate?", opts: ["width and height", "top and left", "transform and opacity"], a: 2, why: "They skip layout and paint, so the browser composites them cheaply." }
  ]},
  { id: "hc-hometown", title: "Solo Project: Hometown Homepage", min: 30, kind: "solo", body: [
    { t: "p", h: "Build a homepage for your hometown, alone. Use the requirements as your spec and check your work when you’re done." },
    { t: "steps", items: ["A <code>header</code> with the town name in an <code>h1</code>", "A <code>nav</code> with at least 3 links", "A <code>main</code> with at least 2 <code>section</code>s (e.g. food, places)", "An image with descriptive <code>alt</code> text", "A flexbox layout somewhere on the page", "A <code>footer</code>"] },
    { t: "callout", kind: "tip", h: "Stuck? Sketch the page on paper as boxes first. Every box becomes an element; every row of boxes becomes a flex container." },
    { t: "htmlch", prompt: "Build your hometown homepage. All checks must pass.", html: `<header>\n  <h1>Nandyal</h1>\n</header>\n\n<!-- build the rest -->\n`, css: `body { font-family: system-ui, sans-serif; margin: 0; }\n`, checks: [
      { msg: "header contains an h1", fn: (d) => !!d.querySelector("header h1") },
      { msg: "nav with at least 3 links", fn: (d) => d.querySelectorAll("nav a").length >= 3 },
      { msg: "main with at least 2 sections", fn: (d) => d.querySelectorAll("main section").length >= 2 },
      { msg: "an image with alt text", fn: (d) => [...d.querySelectorAll("img")].some(i => (i.getAttribute("alt") || "").trim().length > 3) },
      { msg: "some element uses display: flex", fn: (d, w) => [...d.querySelectorAll("*")].some(el => w.getComputedStyle(el).display === "flex") },
      { msg: "a footer", fn: (d) => !!d.querySelector("footer") }
    ]}
  ]},
  { id: "hc-devtools", title: "Browser DevTools Basics", min: 6, kind: "lesson", body: [
    { t: "p", h: "Professional developers spend as much time <i>inspecting</i> code as writing it. Every browser ships with DevTools. Open them with <kbd>F12</kbd>, or <kbd>Ctrl</kbd>/<kbd>⌘</kbd> + <kbd>Shift</kbd> + <kbd>I</kbd>." },
    { t: "h", h: "The panels that matter first" },
    { t: "p", h: "<b>Elements</b>: see the live HTML, toggle CSS rules on and off, and view the box model of any element. <b>Console</b>: read errors and run JavaScript. <b>Network</b>: see every file and API request. <b>Device toolbar</b> (<kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>M</kbd>): preview phone sizes." },
    { t: "callout", kind: "tip", h: "Right-click anything on any website → <b>Inspect</b>. Tweaking CSS live in the Elements panel is the fastest way to learn how professional sites are built." },
    { t: "quiz", q: "A style isn't applying. Where do you check whether it was overridden?", opts: ["Network panel", "Elements panel → Styles (struck-through rules)", "Console panel"], a: 1, why: "Overridden declarations are shown crossed out in the Styles pane, along with the rule that won." }
  ]}
  ]
},
/* ───────────────────────── 3. JAVASCRIPT FUNDAMENTALS ───────────────────────── */
{
  id: "jsfund", title: "JavaScript Fundamentals", blurb: "Learn the fundamentals of programming and JavaScript, and apply them in seven interactive projects.",
  lessons: [
  { id: "js-welcome", title: "Welcome to JavaScript Fundamentals", min: 8, kind: "lesson", body: [
    { t: "p", h: "JavaScript is the only programming language that runs natively in every browser. It also runs servers (Node.js), mobile apps and desktop apps. Learn it well and it carries you across the whole stack." },
    { t: "h", h: "Variables" },
    { t: "code", lang: "javascript", code: `const name = "Sam";     // can't be reassigned\nlet score = 0;          // can be reassigned\nscore = score + 10;\n\n// Avoid var — it has confusing scoping rules` },
    { t: "callout", kind: "key", h: "Default to <code>const</code>. Switch to <code>let</code> only when you actually need to reassign. It makes code easier to reason about." },
    { t: "h", h: "Types you will meet every day" },
    { t: "p", h: "<code>string</code> text · <code>number</code> integers and decimals · <code>boolean</code> true/false · <code>undefined</code> no value yet · <code>null</code> intentionally empty · <code>object</code> and arrays for collections." },
    { t: "play", task: "Run the code, then log your own name and age with a template string.", html: `<p>Open the console below ↓</p>`, css: `body{font-family:system-ui;}`, js: "const firstName = \"Sam\";\nlet lessonsDone = 3;\nlessonsDone++;\n\nconsole.log(firstName, \"has finished\", lessonsDone, \"lessons\");\nconsole.log(`Template strings: ${firstName} is on lesson ${lessonsDone + 1}`);\nconsole.log(typeof firstName, typeof lessonsDone, typeof true);" },
    { t: "quiz", q: "What happens? <code>const x = 5; x = 6;</code>", opts: ["x becomes 6", "TypeError: Assignment to constant variable", "x stays 5 silently"], a: 1, why: "A <code>const</code> binding can't be reassigned. (Objects held in a const can still be mutated, though.)" }
  ]},
  { id: "js-counter", title: "Build a Counter App", min: 20, kind: "build", body: [
    { t: "p", h: "A people counter for a train station: increment on tap, save the count, reset. Small app, three huge concepts: <b>functions</b>, <b>the DOM</b>, and <b>events</b>." },
    { t: "h", h: "Functions" },
    { t: "code", lang: "javascript", code: `function increment() {\n  count += 1;\n}\n\n// arrow function — same idea, shorter\nconst add = (a, b) => a + b;\nadd(2, 3); // 5` },
    { t: "h", h: "The DOM" },
    { t: "p", h: "The <b>Document Object Model</b> is the browser’s live tree of your HTML that JavaScript can read and change. Grab elements with <code>document.getElementById</code> or the more flexible <code>document.querySelector</code>." },
    { t: "callout", kind: "warn", h: "Use <code>textContent</code> for plain text. <code>innerHTML</code> parses HTML and can let attackers inject scripts if the content came from a user." },
    { t: "play", task: "Add a “−” button that decrements, without letting the count go below 0.", html: `<main>\n  <h1>People entered:</h1>\n  <h2 id="count">0</h2>\n  <button id="inc">Increment</button>\n  <button id="save">Save</button>\n  <p id="log">Previous entries: </p>\n</main>`, css: `body{font-family:system-ui;text-align:center;background:#0d1120;color:#e8ecf7;padding:24px}\n#count{font-size:64px;margin:8px 0}\nbutton{font-size:16px;padding:12px 18px;margin:4px;border:0;border-radius:10px;background:#f25c1f;color:white;cursor:pointer}\n#save{background:#0e8f7e}`, js: `const countEl = document.querySelector("#count");\nconst logEl = document.querySelector("#log");\nlet count = 0;\n\ndocument.querySelector("#inc").addEventListener("click", () => {\n  count += 1;\n  countEl.textContent = count;\n});\n\ndocument.querySelector("#save").addEventListener("click", () => {\n  logEl.textContent += count + " - ";\n  console.log("Saved:", count);\n  count = 0;\n  countEl.textContent = count;\n});` },
    { t: "jsch", fn: "totalPeople", prompt: "Write <code>totalPeople(entries)</code> that returns the sum of an array of numbers. Return 0 for an empty array.", starter: `function totalPeople(entries) {\n  // your code\n}`, tests: [
      { msg: "totalPeople([5, 3, 2]) → 10", fn: (f) => f([5, 3, 2]) === 10 },
      { msg: "totalPeople([]) → 0", fn: (f) => f([]) === 0 },
      { msg: "totalPeople([14]) → 14", fn: (f) => f([14]) === 14 }
    ]},
    { t: "quiz", q: "Which is the safest way to show user-typed text on the page?", opts: ["el.innerHTML = text", "el.textContent = text", "document.write(text)"], a: 1, why: "<code>textContent</code> never parses HTML, so a typed <code>&lt;script&gt;</code> shows up as harmless text." }
  ]},
  { id: "js-scoreboard", title: "Solo Project - Basketball Scoreboard", min: 25, kind: "solo", body: [
    { t: "p", h: "Build a scoreboard with Home and Guest scores and +1, +2, +3 buttons for each. Do the UI in a playground (or your own editor), then pass the logic challenge." },
    { t: "steps", items: ["Two score displays: Home and Guest", "Buttons +1, +2, +3 for each team", "Stretch: highlight the leader", "Stretch: a New Game button that resets both"] },
    { t: "play", task: "Build it here. Starter markup is provided.", html: `<div class="board">\n  <div class="team"><h3>HOME</h3><p id="home">0</p></div>\n  <div class="team"><h3>GUEST</h3><p id="guest">0</p></div>\n</div>`, css: `body{font-family:system-ui;background:#1b244a;color:#eee;display:grid;place-items:center;min-height:100vh;margin:0}\n.board{display:flex;gap:40px}\n.team{text-align:center}\n.team p{font-size:64px;font-family:monospace;background:#080001;color:#f94f6d;padding:10px 24px;border-radius:8px;margin:8px 0}`, js: `// wire up your buttons here\n` },
    { t: "jsch", fn: "leader", prompt: "Write <code>leader(home, guest)</code> returning <code>\"home\"</code>, <code>\"guest\"</code> or <code>\"tie\"</code>.", starter: `function leader(home, guest) {\n  \n}`, tests: [
      { msg: "leader(10, 7) → \"home\"", fn: (f) => f(10, 7) === "home" },
      { msg: "leader(3, 9) → \"guest\"", fn: (f) => f(3, 9) === "guest" },
      { msg: "leader(4, 4) → \"tie\"", fn: (f) => f(4, 4) === "tie" }
    ]}
  ]},
  { id: "js-blackjack", title: "Build a Blackjack Game", min: 35, kind: "build", body: [
    { t: "p", h: "Blackjack teaches the core of every program: <b>arrays</b>, <b>conditionals</b>, <b>loops</b>, <b>randomness</b> and <b>objects</b>." },
    { t: "h", h: "Conditionals and booleans" },
    { t: "code", lang: "javascript", code: `if (sum < 21) {\n  message = "Draw a new card?";\n} else if (sum === 21) {\n  message = "Blackjack!";\n  hasBlackJack = true;\n} else {\n  message = "You're out of the game.";\n  isAlive = false;\n}` },
    { t: "callout", kind: "key", h: "Always use <code>===</code> (strict equality). <code>==</code> converts types first, so <code>\"0\" == 0</code> is true." },
    { t: "h", h: "Truthy and falsy" },
    { t: "p", h: "In a condition, every value becomes true or false. Only a handful are falsy. Tap the values to test them." },
    { t: "widget", name: "truthy" },
    { t: "h", h: "Arrays and loops" },
    { t: "code", lang: "javascript", code: `const cards = [10, 7];\ncards.push(4);           // add to end → [10, 7, 4]\ncards.length;            // 3\n\nlet sum = 0;\nfor (let i = 0; i < cards.length; i++) {\n  sum += cards[i];\n}\n// modern alternative\nfor (const card of cards) { /* … */ }` },
    { t: "h", h: "Randomness" },
    { t: "code", lang: "javascript", code: `// random integer from 1 to 13 inclusive\nconst n = Math.floor(Math.random() * 13) + 1;` },
    { t: "play", task: "Play a few rounds. Then fix it so an Ace (1) counts as 11.", html: `<h1>Blackjack</h1>\n<p id="msg">Want to play a round?</p>\n<p id="cards">Cards:</p>\n<p id="sum">Sum:</p>\n<button id="start">START GAME</button>\n<button id="draw">NEW CARD</button>`, css: `body{font-family:system-ui;text-align:center;background:radial-gradient(#1f6b3a,#0b3a1c);color:white;min-height:100vh;margin:0;padding:24px}\nbutton{background:goldenrod;border:0;padding:10px 16px;border-radius:6px;font-weight:700;margin:4px;cursor:pointer}\n#msg{font-style:italic}`, js: `let cards = [];\nlet sum = 0;\nlet isAlive = false;\nlet hasBlackJack = false;\n\nfunction getRandomCard() {\n  const n = Math.floor(Math.random() * 13) + 1;\n  if (n > 10) return 10;   // J, Q, K\n  return n;                // TODO: Ace should be 11\n}\n\nfunction render() {\n  document.getElementById("cards").textContent = "Cards: " + cards.join(" ");\n  document.getElementById("sum").textContent = "Sum: " + sum;\n  let msg;\n  if (sum < 21) msg = "Draw a new card?";\n  else if (sum === 21) { msg = "Blackjack! 🎉"; hasBlackJack = true; }\n  else { msg = "Bust. You're out."; isAlive = false; }\n  document.getElementById("msg").textContent = msg;\n}\n\ndocument.getElementById("start").onclick = () => {\n  isAlive = true; hasBlackJack = false;\n  cards = [getRandomCard(), getRandomCard()];\n  sum = cards[0] + cards[1];\n  render();\n};\n\ndocument.getElementById("draw").onclick = () => {\n  if (!isAlive || hasBlackJack) return;\n  const card = getRandomCard();\n  cards.push(card); sum += card;\n  render();\n};` },
    { t: "jsch", fn: "cardValue", prompt: "Write <code>cardValue(n)</code> for n from 1 to 13: Ace (1) → 11, Jack/Queen/King (11–13) → 10, otherwise n.", starter: `function cardValue(n) {\n  \n}`, tests: [
      { msg: "cardValue(1) → 11", fn: (f) => f(1) === 11 },
      { msg: "cardValue(7) → 7", fn: (f) => f(7) === 7 },
      { msg: "cardValue(12) → 10", fn: (f) => f(12) === 10 },
      { msg: "cardValue(10) → 10", fn: (f) => f(10) === 10 }
    ]},
    { t: "h", h: "Objects" },
    { t: "code", lang: "javascript", code: `const player = {\n  name: "Per",\n  chips: 200\n};\nplayer.name;          // "Per"\nplayer.chips += 50;   // update a property` },
    { t: "quiz", q: "Which value is truthy?", opts: ["0", "\"\" (empty string)", "[] (empty array)", "null"], a: 2, why: "Every object is truthy, including empty arrays and empty objects. That surprises many developers." },
    { t: "quiz", q: "Math.floor(Math.random() * 6) produces…", opts: ["1 to 6", "0 to 5", "0 to 6"], a: 1, why: "<code>Math.random()</code> returns 0 up to (but not including) 1, so ×6 then floor gives 0–5. Add 1 for a dice roll." }
  ]},
  { id: "js-password", title: "Solo Project - Password Generator", min: 25, kind: "solo", body: [
    { t: "p", h: "Generate random passwords from a character set. You will combine loops, random indexes and string building." },
    { t: "steps", items: ["Create an array or string of allowed characters", "Loop <code>length</code> times, picking a random index each time", "Build the result string", "Stretch: options for symbols and numbers", "Stretch: copy to clipboard on click"] },
    { t: "callout", kind: "warn", h: "For real passwords, use <code>crypto.getRandomValues()</code>. <code>Math.random()</code> is fine for games but is not cryptographically secure." },
    { t: "jsch", fn: "generatePassword", prompt: "Write <code>generatePassword(length, chars)</code> that returns a string of exactly <code>length</code> characters, each picked randomly from the string <code>chars</code>.", starter: `function generatePassword(length, chars) {\n  let result = "";\n  // loop and pick random characters\n  return result;\n}`, tests: [
      { msg: "Returns the requested length (15)", fn: (f) => typeof f(15, "abc") === "string" && f(15, "abc").length === 15 },
      { msg: "Uses only allowed characters", fn: (f) => /^[xyz]+$/.test(f(40, "xyz")) },
      { msg: "Is random (two runs differ)", fn: (f) => f(30, "abcdefghij0123456789") !== f(30, "abcdefghij0123456789") },
      { msg: "Length 0 → empty string", fn: (f) => f(0, "abc") === "" }
    ]}
  ]},
  { id: "js-extension", title: "Build a Chrome Extension", min: 40, kind: "build", body: [
    { t: "p", h: "Build a “Leads Tracker” extension that saves URLs. You will learn input handling, rendering lists, <code>localStorage</code>, and how browser extensions are packaged." },
    { t: "h", h: "Rendering a list efficiently" },
    { t: "code", lang: "javascript", code: "function render(leads) {\n  let listItems = \"\";\n  for (const lead of leads) {\n    listItems += `<li><a target=\"_blank\" href=\"${lead}\">${lead}</a></li>`;\n  }\n  ulEl.innerHTML = listItems;   // touch the DOM once, not in every loop\n}" },
    { t: "callout", kind: "tip", h: "Build the whole string first, then write to the DOM once. Every DOM write can trigger layout, so writing inside the loop is slower." },
    { t: "h", h: "Persisting with localStorage" },
    { t: "code", lang: "javascript", code: `// localStorage only stores strings\nlocalStorage.setItem("myLeads", JSON.stringify(myLeads));\n\nconst saved = JSON.parse(localStorage.getItem("myLeads"));\nif (saved) { myLeads = saved; render(myLeads); }\n\nlocalStorage.clear(); // delete everything` },
    { t: "h", h: "Packaging: manifest.json (Manifest V3)" },
    { t: "code", lang: "json", code: `{\n  "manifest_version": 3,\n  "name": "Leads Tracker",\n  "version": "1.0",\n  "action": {\n    "default_popup": "index.html",\n    "default_icon": "icon.png"\n  },\n  "permissions": ["tabs"]\n}` },
    { t: "p", h: "Load it at <code>chrome://extensions</code> → enable Developer mode → <b>Load unpacked</b> → choose your folder. To save the current tab’s URL, use <code>chrome.tabs.query({ active: true, currentWindow: true }, tabs =&gt; …)</code>." },
    { t: "play", task: "Save a few leads, then add a “Delete all” button.", html: `<input id="input" placeholder="https://…">\n<button id="save">SAVE INPUT</button>\n<ul id="list"></ul>`, css: `body{font-family:system-ui;padding:12px;min-width:260px}\ninput{width:100%;padding:10px;border:1px solid #0e8f7e;border-radius:6px;box-sizing:border-box;margin-bottom:6px}\nbutton{background:#0e8f7e;color:white;border:0;padding:10px 14px;border-radius:6px;font-weight:700;cursor:pointer}\nul{padding-left:18px} a{color:#0e8f7e}`, js: "let myLeads = [];\nconst inputEl = document.getElementById(\"input\");\nconst ulEl = document.getElementById(\"list\");\n\nfunction render(leads) {\n  let html = \"\";\n  for (const lead of leads) {\n    html += `<li><a target=\"_blank\" href=\"${lead}\">${lead}</a></li>`;\n  }\n  ulEl.innerHTML = html;\n}\n\ndocument.getElementById(\"save\").addEventListener(\"click\", () => {\n  if (!inputEl.value.trim()) return;\n  myLeads.push(inputEl.value.trim());\n  inputEl.value = \"\";\n  render(myLeads);\n  console.log(\"Leads:\", JSON.stringify(myLeads));\n});" },
    { t: "jsch", fn: "toStorage", prompt: "Write <code>toStorage(leads)</code> that converts an array into a string suitable for localStorage, and <code>fromStorage(str)</code> that turns it back (return <code>[]</code> for <code>null</code>). Only <code>toStorage</code> is passed to the tests, so define <code>fromStorage</code> inside your code too.", starter: `function toStorage(leads) {\n  \n}\nfunction fromStorage(str) {\n  \n}`, tests: [
      { msg: "toStorage([\"a\",\"b\"]) → '[\"a\",\"b\"]'", fn: (f) => f(["a", "b"]) === '["a","b"]' },
      { msg: "fromStorage round-trips", fn: (f, ctx) => typeof ctx.fromStorage === "function" && JSON.stringify(ctx.fromStorage(f(["x", "y"]))) === '["x","y"]' },
      { msg: "fromStorage(null) → []", fn: (f, ctx) => typeof ctx.fromStorage === "function" && Array.isArray(ctx.fromStorage(null)) && ctx.fromStorage(null).length === 0 }
    ], extra: ["fromStorage"] },
    { t: "quiz", q: "localStorage.setItem('n', [1,2]) then getItem('n') returns…", opts: ["[1, 2] as an array", "\"1,2\" as a string", "undefined"], a: 1, why: "localStorage coerces values to strings. Use <code>JSON.stringify</code> and <code>JSON.parse</code> to keep the structure." }
  ]},
  { id: "js-converter", title: "Solo Project - Unit converter", min: 25, kind: "solo", body: [
    { t: "p", h: "Build a metric/imperial converter for length, volume and mass from one input number." },
    { t: "p", h: "Conversion factors: 1 meter = 3.281 feet · 1 liter = 0.264 gallons · 1 kilogram = 2.204 pounds." },
    { t: "steps", items: ["One number input", "Convert button renders three result cards", "Show both directions (m → ft and ft → m)", "Round to 3 decimals with <code>toFixed(3)</code>"] },
    { t: "callout", kind: "tip", h: "<code>toFixed()</code> returns a <b>string</b>. Wrap it in <code>Number()</code> if you need to keep calculating." },
    { t: "jsch", fn: "convertLength", prompt: "Write <code>convertLength(value)</code> returning a string like <code>\"20 meters = 65.620 feet | 20 feet = 6.096 meters\"</code>. Use 3.281 and 3 decimals.", starter: `function convertLength(value) {\n  \n}`, tests: [
      { msg: "convertLength(20)", fn: (f) => f(20) === "20 meters = 65.620 feet | 20 feet = 6.096 meters" },
      { msg: "convertLength(1)", fn: (f) => f(1) === "1 meters = 3.281 feet | 1 feet = 0.305 meters" }
    ]}
  ]}
  ]
},
/* ───────────────────────── REMAINING MODULES (outlines) ───────────────────────── */
{ id: "tools", title: "Tools of the Trade", blurb: "Learn to control the computer like a pro with the command line, then version your work with Git and GitHub.", concepts: ["Terminal navigation: cd, ls, pwd, mkdir", "Files: touch, cp, mv, rm, cat", "Pipes, grep and redirection", "git init, add, commit, branch, merge", "GitHub remotes, pull requests"],
  lessons: L(["Welcome to Tools of the Trade", "Command Line Fundamentals", "Command Line Power Tools", "Essential Git & GitHub Skills"]) },
{ id: "a11y", title: "Accessible Development", blurb: "Learn to build websites that are accessible to everyone.", concepts: ["WCAG contrast ratios (4.5:1 for body text)", "Alt text and link purpose", "Form labels and radio groups", "Semantic HTML and headings", "ARIA roles, states and live regions", "Skip links and hiding content correctly"],
  lessons: L(["Welcome to Accessible Development", "Understanding web accessibility", "Aside: Text contrast", "Aside: Use of color", "Text contrast", "Aside: Alternative text", "Aside: Links", "Links and alternative text", "Aside: Labels", "Aside: Radio buttons", "Labels", "Semantic HTML", "Lists", "Text size", "Headings", "ARIA", "ARIA live regions", "Aside: Accessible JavaScript", "Aside: Hiding content", "Aside: Skip Navigation Link part 1", "Aside: Skip Navigation Link part 2", "Skip Navigation Link", "Final challenge part 1", "Final challenge part 2", "Outro"]) },
{ id: "css2", title: "Essential CSS", blurb: "Level up your styling skills with more advanced selectors and layout techniques.", concepts: ["Positioning: relative, absolute, sticky", "Pseudo-elements and advanced selectors", "Transitions and hover states", "Component-based CSS"],
  lessons: L(["Welcome to Essential CSS", "Build an NFT Site", "Build a Portfolio", "Solo Project - Instagram Clone", "Build a Coworking Space Site"]) },
{ id: "js2", title: "Essential JavaScript", blurb: "Learn intermediate JavaScript and ES6 concepts in order to build more sophisticated projects.", concepts: ["Array methods: map, filter, reduce", "Destructuring, spread, rest", "Event delegation and data attributes", "Modules and imports", "Forms and FormData"],
  lessons: L(["Welcome to Essential JavaScript", "Build a Cookie Consent", "Build a Meme App", "Build an X Clone", "Mini Projects", "Solo Project - Restaurant Ordering app"]) },
{ id: "responsive", title: "Responsive Design", blurb: "Make your sites look and feel great on all screen sizes.", concepts: ["Mobile-first media queries", "Fluid units and clamp()", "CSS Grid and grid-template-areas", "Responsive images"],
  lessons: L(["Welcome to Responsive Design", "Responsive Layouts", "Build a Product Page", "CSS Grid", "Solo Project - Learning Journal"]) },
{ id: "apis", title: "APIs and Async JavaScript", blurb: "APIs are the backbone of the web. Learn to use them through approachable projects.", concepts: ["HTTP methods and status codes", "URLs, query strings and REST", "fetch() and JSON", "Promises and async/await", "Error handling"],
  lessons: L(["Welcome to APIs and Async JS", "Intro to APIs", "URLs and REST", "Solo Project - Color Scheme Generator", "Async JavaScript", "Build a Movie Watchlist", "Capstone Project"]) },
{ id: "ai", title: "AI Engineering", blurb: "Learn to build apps powered by AI. Integrate with proprietary and open-source models.", concepts: ["Calling LLM APIs and prompt design", "Embeddings and vector search", "Retrieval-augmented generation (RAG)", "Tool use and AI agents"],
  lessons: L(["Welcome to AI Engineering", "AI Engineering Fundamentals (updated)", "Solo Project - Translation App", "RAG and Vector Databases", "Solo Project - Movie AI App", "AI Agents"]) },
{ id: "node", title: "Node.js", blurb: "Become the backend developer with Node.js, the world's most popular server-side technology.", concepts: ["The Node runtime and npm", "The http module", "Routing and JSON responses", "Serving a frontend"],
  lessons: L(["Welcome to Node", "Build a Node API", "Build a Fullstack Node App", "Solo Project - GoldDigger"]) },
{ id: "db", title: "Databases", blurb: "Get a general overview of databases, and learn to work with SQL.", concepts: ["Relational vs document databases", "SELECT, WHERE, ORDER BY", "INSERT, UPDATE, DELETE", "Primary/foreign keys and JOINs"],
  lessons: L(["Intro to Databases", "Writing SQL Queries", "Creating and Joining Tables"]) },
{ id: "express", title: "Express.js", blurb: "Become a more productive backend developer by adopting the most popular web framework.", concepts: ["Routes and middleware", "REST API design", "Connecting to a database", "Authentication with sessions/JWT"],
  lessons: L(["Welcome to Express", "Build an Express API", "Build a Fullstack Express App", "Authentication"]) },
{ id: "ui", title: "User Interface Design", blurb: "Take your design skills to the next level and become a frontend developer with design superpowers.", concepts: ["Visual hierarchy and spacing scales", "Typography and color", "Layout grids", "Refactoring UIs"],
  lessons: L(["Welcome to the UI Design Module", "UI Design Fundamentals", "Design a Simple Layout", "Refactor a Website's Dashboard"]) },
{ id: "react", title: "React.js Fundamentals", blurb: "Learn the most popular framework for building user interfaces.", concepts: ["Components and JSX", "Props and rendering lists", "State with useState", "Effects with useEffect", "Conditional rendering"],
  lessons: L(["Welcome to React.js Fundamentals", "Static Pages", "Solo Project - Business Card", "Data-Driven React", "React State", "Side Effects", "Capstone Project #1 - Tenzies", "Capstone Project #2 - Assembly Endgame", "Solo Project - Quiz App", "Module Outro"]) },
{ id: "testing", title: "Testing", blurb: "Learn how to write tests that make your apps more robust and less buggy.", concepts: ["Unit vs integration vs e2e", "Testing user interactions", "Mocking external services", "Code coverage", "Accessibility testing and TDD"],
  lessons: L(["Welcome to the Testing Module", "What we will test: Meme Generator", "Set up the testing", "Write your first test", "Practice, practice, and practice", "Test user interactions", "Mock external services: Set up the tooling", "Mock external services: test the app", "View code coverage", "Accessibility testing with a side of TDD", "Types of testing", "Congratulations!"]) },
{ id: "react2", title: "Advanced React.js", blurb: "Take your skills to a professional level and conquer real-world apps.", concepts: ["Compound components and custom hooks", "Memoization and performance", "Routing", "Persistence and auth"],
  lessons: L(["Welcome to Advanced React", "Reusability", "Performance", "Solo Project - Component Library", "Routing", "Persistence", "Authentication"]) },
{ id: "ts", title: "TypeScript", blurb: "Level up your JavaScript to TypeScript so you can write more reliable code.", concepts: ["Types, interfaces, unions", "Generics", "Typing React props and hooks", "Typing Express handlers"],
  lessons: L(["Welcome to TypeScript", "TypeScript Fundamentals", "TypeScript in React", "Solo project - Typed Movies", "TypeScript & Express"]) },
{ id: "next", title: "Next.js", blurb: "Learn to build full-stack React apps with Next.js.", concepts: ["App Router and file-based routing", "Server vs client components", "Rendering strategies: SSR, SSG, ISR", "Server actions and data flow"],
  lessons: L(["Welcome to Next.js", "Build a Next.js App", "Rendering Strategies and Mocks", "Making Data Flow"]) },
{ id: "career", title: "Launching Your Career", blurb: "Learn to land the job: portfolio, online presence and interview practice.", concepts: ["Portfolio and résumé strategy", "GitHub and LinkedIn presence", "JavaScript and React interview challenges", "Take-home projects"],
  lessons: L(["Welcome to the Career Module", "General Tips and Strategies", "Solo Project - Fix a Local Website", "Improving Your Online Presence", "JavaScript Interview Challenges", "React Interview Challenges", "Frontend Interview Challenges"]) },
{ id: "finish", title: "What to Learn Next", blurb: "Plan your next steps and claim your certificate.", concepts: ["Specialising: frontend, backend, AI", "Open source contributions", "Showcasing your certificate"],
  lessons: L(["What to Learn Next", "How to Utilize Your Certificate", "Certificate of Completion"]) }
  ]
};
function L(titles) {
  return titles.map((t) => ({
    id: t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) + "-" + (++L_SEQ),
    title: t, min: /solo|capstone|challenge/i.test(t) ? 30 : /welcome|outro|congrat/i.test(t) ? 3 : 12,
    kind: /solo|capstone|final challenge/i.test(t) ? "solo" : /^build|project/i.test(t) ? "build" : "lesson"
  }));
}

/* Syllabus detail read from the full-course screenshots (career module). Shown on outline lessons. */
const TOPICS = {
  "JavaScript Interview Challenges": ["toTitleCase()", "Definitely Not FizzBuzz", "Emojify!", "Is it an Anagram?", "Decode an Alien Message", "Palindromes", "Save Grandpa's Password", "Frequency of Letters in Your Name", "Chef Mario's Recipe Book", "Pumpkin's Prizes", "Count the Students", "Pizza Night?", "Find Free Podcasts", "Candy Sale", "Shopping Cart", "Total Savory Items", "Holiday Gift Shopping", "Collect Unique Genre Tags", "Welcome Aboard the Airline", "Popularity Contest", "Night at the Awards", "Save the Weekend", "Find Anagrams in an Array", "Emoji Flower Bed"],
  "React Interview Challenges": ["Course introduction", "The Virtual DOM", "React limitations", "JSX", "Props", "State and lifecycle", "Effects", "Refs", "Context", "Miscellaneous (but important!) questions", "Course conclusion"],
  "Frontend Interview Challenges": ["Course introduction", "Falsy values", "const vs let vs var", "Double vs triple equal", "undefined vs null", "Data types", "Spread & rest operators", "Destructuring objects and arrays", "Git fundamentals", "Agile & Scrum", "CSS selectors", "Responsive design", "Number issues", "Promises", "Pass by value vs pass by reference", "Five questions to be prepared for", "Five preparation tips", "Got any questions for me?"]
};
COURSE.modules.forEach((m) => m.lessons.forEach((l) => { if (TOPICS[l.title]) l.topics = TOPICS[l.title]; }));
