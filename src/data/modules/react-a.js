/* React.js Fundamentals, part A: Welcome, Static Pages, Business Card, Data-Driven React.
   `rplay` blocks are live multi-file React 19 projects; `rch` blocks are React challenges whose tests
   run against a fresh mount of the learner's app. Test functions MUST be self-contained
   (they're serialised with toString() and run inside the iframe). */

const INDEX = `import { createRoot } from "react-dom/client"
import App from "./App"
import "./index.css"

createRoot(document.getElementById("root")).render(<App />)
`;

const FACTS_CSS = `* { box-sizing: border-box; }
body { margin: 0; font-family: Inter, system-ui, sans-serif; background: #282d35; color: #fff; }
nav { display: flex; align-items: center; gap: 10px; padding: 18px 26px; background: #21222a; }
nav img { width: 34px; }
nav span { font-weight: 700; font-size: 1.35rem; color: #61dafb; }
main { padding: 32px 26px 40px;
  background: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='260' height='260' viewBox='0 0 100 100'><g fill='none' stroke='%2361dafb' stroke-opacity='.12' stroke-width='3'><ellipse cx='50' cy='50' rx='45' ry='17'/><ellipse cx='50' cy='50' rx='45' ry='17' transform='rotate(60 50 50)'/><ellipse cx='50' cy='50' rx='45' ry='17' transform='rotate(120 50 50)'/></g></svg>") right -40px top 10px no-repeat; }
h1 { margin: 0 0 18px; font-size: 2rem; }
ul { margin: 0; padding-left: 22px; max-width: 420px; line-height: 1.5; }
li { padding-block: 6px; }
li::marker { color: #61dafb; font-size: 1.3em; }
`;

const LOGO = "data:image/svg+xml;utf8," + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><g fill="none" stroke="#61dafb" stroke-width="6"><ellipse cx="50" cy="50" rx="45" ry="17"/><ellipse cx="50" cy="50" rx="45" ry="17" transform="rotate(60 50 50)"/><ellipse cx="50" cy="50" rx="45" ry="17" transform="rotate(120 50 50)"/></g><circle cx="50" cy="50" r="8" fill="#61dafb"/></svg>`);

const PLACES = {
  "images/japan.svg": "data:image/svg+xml;utf8," + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="250" height="168"><rect width="250" height="168" fill="#fde2e4"/><circle cx="125" cy="70" r="34" fill="#e63946"/><path d="M0 168 L80 100 L125 128 L180 84 L250 140 L250 168Z" fill="#457b9d"/></svg>`),
  "images/australia.svg": "data:image/svg+xml;utf8," + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="250" height="168"><rect width="250" height="168" fill="#ffe8c2"/><circle cx="190" cy="44" r="22" fill="#f4a261"/><path d="M0 168 L0 120 Q60 80 120 118 T250 104 L250 168Z" fill="#e76f51"/></svg>`),
  "images/norway.svg": "data:image/svg+xml;utf8," + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="250" height="168"><rect width="250" height="168" fill="#cfe8f3"/><path d="M0 140 L60 50 L110 120 L160 30 L250 140 L250 168 L0 168Z" fill="#2a9d8f"/><path d="M160 30 L178 58 L142 58Z" fill="#fff"/></svg>`),
};

const AVATAR = "data:image/svg+xml;utf8," + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="317" height="317"><rect width="317" height="317" fill="#ffd7a8"/><circle cx="158" cy="130" r="62" fill="#8d5a3b"/><path d="M40 317 Q158 170 277 317Z" fill="#2563eb"/></svg>`);

const cat = (bg, face) => "data:image/svg+xml;utf8," + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="200" height="160"><rect width="200" height="160" fill="${bg}"/><text x="100" y="112" text-anchor="middle" font-size="90">${face}</text></svg>`);
const CATS = { "images/cat1.svg": cat("#fde68a", "🐱"), "images/cat2.svg": cat("#c7d2fe", "😺") };

export const REACT_A = [
  /* ───────────────────────── Welcome ───────────────────────── */
  { id: "rx-welcome", title: "Welcome to React.js Fundamentals", min: 10, kind: "lesson", body: [
    { t: "p", h: "React is a JavaScript library for building user interfaces out of <b>components</b>: small, reusable pieces that each look after their own markup, logic and data. Meta created it in 2013 to tame Facebook's ever-changing news feed. Today it runs Instagram, Netflix, Airbnb, Discord and a huge share of the web, and it's still one of the most in-demand frontend skills in job listings." },
    { t: "callout", kind: "why", h: "In vanilla JavaScript you tell the browser <i>how</i> to change the page, step by step. In React you describe <i>what</i> the page should look like for the current data, and React works out the DOM changes for you. That one shift removes a whole class of bugs." },
    { t: "h", h: "Your first React code" },
    { t: "p", h: "Every lab in this module is a real React 19 project running in your browser. Edit the code and the preview updates. This one is just two lines: create a <b>root</b> inside <code>#root</code>, then <code>render</code> some JSX into it." },
    { t: "rplay", task: "Change the heading, then add a <code>&lt;p&gt;</code> under it. Wrap both in a <code>&lt;div&gt;</code>. What error appears if you don't wrap them?", files: {
      "index.jsx": `import { createRoot } from "react-dom/client"

const root = createRoot(document.getElementById("root"))
root.render(<h1>Hello, React! 👋</h1>)
`,
      "index.css": `body { font-family: system-ui, sans-serif; padding: 24px; }
h1 { color: #087ea4; }
`,
    } },
    { t: "p", h: "That HTML-looking syntax inside JavaScript is <b>JSX</b>. It isn't a string and it isn't HTML: a build tool turns it into ordinary function calls. You'll see exactly how in the next lesson." },
    { t: "h", h: "What you'll build" },
    { t: "steps", items: [
      "<b>ReactFacts</b>: your first static React site, split into components",
      "<b>Digital business card</b>: a solo project from a design spec",
      "<b>Travel journal</b>: a data-driven page built from an array with props and <code>.map()</code>",
      "<b>Chef Claude</b>: a recipe app with state, forms, conditional rendering and an AI chef",
      "<b>Meme generator</b>: controlled inputs, <code>useEffect</code> and data fetching",
      "<b>Tenzies</b> and <b>Assembly: Endgame</b>: two capstone games",
      "<b>Quiz app</b>: a solo project that combines everything",
    ] },
    { t: "quiz", q: "What's the core idea that makes React different from writing DOM code by hand?", opts: ["React is faster than the DOM", "You describe what the UI should look like for the current data, and React updates the DOM to match", "React replaces HTML with JavaScript"], a: 1, why: "React is declarative. You write the result you want; React handles the step-by-step DOM work." },
    { t: "recap", items: ["React builds UIs from components", "<code>createRoot(el).render(jsx)</code> puts React in charge of an element", "JSX looks like HTML but compiles to JavaScript", "Every lab here is a live React 19 project"] },
  ]},

  /* ───────────────────────── Static Pages ───────────────────────── */
  { id: "rx-static", title: "Static Pages", min: 85, kind: "lesson", body: [
    { t: "h", h: "Libraries and frameworks" },
    { t: "p", h: "A <b>library</b> is code you call when you need it. A <b>framework</b> calls <i>your</i> code and decides the structure of the app. React calls itself a library: it only handles the UI. Routing, data fetching and builds come from other tools, or from frameworks built on React like <b>Next.js</b>, which you'll meet later." },
    { t: "h", h: "Why React? It's composable" },
    { t: "p", h: "Components snap together like Lego. A page is a <code>&lt;Navbar /&gt;</code>, a <code>&lt;MainContent /&gt;</code> and a <code>&lt;Footer /&gt;</code>; a navbar is a logo and some links. Each piece can be built, tested and reused on its own, so a big UI becomes a tree of small, understandable parts." },
    { t: "diagram", name: "react-tree" },
    { t: "h", h: "Why React? It's declarative" },
    { t: "p", h: "Here's the same heading written imperatively with the DOM, and declaratively with React:" },
    { t: "code", lang: "javascript", code: `// Imperative: tell the browser every step
const h1 = document.createElement("h1")
h1.textContent = "Hello from JavaScript"
h1.className = "header"
document.getElementById("root").append(h1)

// Declarative: describe the result
root.render(<h1 className="header">Hello from React</h1>)` },
    { t: "p", h: "One heading is easy either way. The difference shows when data changes: with the DOM you must find and patch every affected element yourself. With React you just describe the page for the new data again." },
    { t: "h", h: "From JSX to React elements" },
    { t: "video", name: "jsx" },
    { t: "p", h: "JSX compiles to calls of <code>jsx()</code> (or the older <code>React.createElement()</code>). Those calls don't create DOM nodes. They return plain JavaScript objects called <b>React elements</b> that <i>describe</i> what should be on screen. React reads the description and builds or updates the real DOM." },
    { t: "code", lang: "jsx", code: `const el = <h1 className="header">Hello</h1>
// is the same as
const el = React.createElement("h1", { className: "header" }, "Hello")
// and both give you an object like
// { type: "h1", props: { className: "header", children: "Hello" }, key: null }` },
    { t: "rplay", task: "Look at the console: the element is just an object. Try logging <code>el.props.children</code>.", files: {
      "index.jsx": `import { createRoot } from "react-dom/client"
import { createElement } from "react"

const el = <h1 className="header">Hello from JSX</h1>
const same = createElement("p", { id: "note" }, "…and this one came from createElement()")

console.log(el)
console.log(el.type, el.props)

createRoot(document.getElementById("root")).render(
  <main>
    {el}
    {same}
  </main>
)
`,
      "index.css": `body { font-family: system-ui, sans-serif; padding: 24px; }
.header { color: #087ea4; }
#note { color: #555; }
`,
    } },
    { t: "h", h: "JSX rules" },
    { t: "steps", items: [
      "Return <b>one parent element</b>. Wrap siblings in a <code>&lt;div&gt;</code>, or in a <b>Fragment</b> <code>&lt;&gt;…&lt;/&gt;</code> when you don't want an extra element in the DOM",
      "<b>Close every tag</b>, including <code>&lt;img /&gt;</code>, <code>&lt;br /&gt;</code> and <code>&lt;input /&gt;</code>",
      "Use <b>camelCase</b> attributes: <code>className</code> instead of <code>class</code>, <code>htmlFor</code> instead of <code>for</code>, <code>onClick</code> instead of <code>onclick</code>",
      "Put JavaScript inside <b>curly braces</b>: <code>&lt;h1&gt;{name}&lt;/h1&gt;</code>",
    ] },
    { t: "quiz", q: "Why must a component return a single parent element?", opts: ["It's a style convention", "JSX compiles to a function call, and a function can only return one value", "Browsers can't render two siblings"], a: 1, why: "<code>return &lt;h1/&gt;&lt;p/&gt;</code> would be returning two values. Wrap them in one element or a Fragment." },
    { t: "h", h: "Local setup with Vite" },
    { t: "p", h: "On your own machine, <b>Vite</b> is the standard way to start a React project. It compiles JSX, serves the app with instant hot reload, and bundles it for production." },
    { t: "code", lang: "bash", code: `npm create vite@latest react-facts -- --template react
cd react-facts
npm install
npm run dev        # → http://localhost:5173` },
    { t: "code", lang: "text", code: `react-facts/
├─ index.html          ← has <div id="root"></div> and loads /src/main.jsx
├─ package.json
└─ src/
   ├─ main.jsx         ← createRoot(...).render(<App />)
   ├─ App.jsx
   ├─ index.css
   └─ components/
      ├─ Header.jsx
      └─ Main.jsx` },
    { t: "h", h: "Custom components" },
    { t: "p", h: "A component is a function that returns JSX. Two rules: its name starts with a <b>capital letter</b> (lowercase names are treated as HTML tags), and you use it like a tag: <code>&lt;Header /&gt;</code>, not <code>Header()</code>." },
    { t: "code", lang: "jsx", code: `function Header() {
  return (
    <header>
      <nav>
        <img src="/react-logo.png" alt="React logo" />
        <span>ReactFacts</span>
      </nav>
    </header>
  )
}

function App() {
  return (
    <>
      <Header />
      <Main />
    </>
  )
}` },
    { t: "callout", kind: "tip", h: "When JSX spans several lines, wrap it in parentheses after <code>return</code>. Without them, a line break after <code>return</code> makes JavaScript return <code>undefined</code>." },
    { t: "quiz", q: "What happens if you name a component <code>header</code> and use it as <code>&lt;header /&gt;</code>?", opts: ["It works the same", "React renders a plain HTML &lt;header&gt; element and ignores your function", "It throws a syntax error"], a: 1, why: "Lowercase JSX tags are HTML elements. Components must be capitalised." },
    { t: "h", h: "Parent and child components, and styling" },
    { t: "p", h: "Components that render other components are <b>parents</b>; the ones they render are <b>children</b>. <code>App</code> is usually the top parent. Style them with <code>className</code> and a CSS file you import: <code>import \"./index.css\"</code>. Vite (and our lab) injects that CSS into the page." },
    { t: "h", h: "Organising components" },
    { t: "p", h: "Each component gets its own file in <code>src/components/</code>. Export it with <code>export default function Header()</code> and import it where it's used with <code>import Header from \"./components/Header\"</code>. The file extension is optional in imports." },
    { t: "h", h: "Project: ReactFacts" },
    { t: "rplay", task: "This is the finished ReactFacts page, split into files. Add a fifth fact, then try changing the bullet colour in <code>index.css</code>.", assets: { "images/react-logo.svg": LOGO }, files: {
      "index.jsx": INDEX,
      "App.jsx": `import Header from "./components/Header"
import Main from "./components/Main"

export default function App() {
  return (
    <>
      <Header />
      <Main />
    </>
  )
}
`,
      "components/Header.jsx": `import reactLogo from "../images/react-logo.svg"

export default function Header() {
  return (
    <header>
      <nav>
        <img src={reactLogo} alt="React logo" />
        <span>ReactFacts</span>
      </nav>
    </header>
  )
}
`,
      "components/Main.jsx": `export default function Main() {
  return (
    <main>
      <h1>Fun facts about React</h1>
      <ul>
        <li>Was first released in 2013</li>
        <li>Was originally created by Jordan Walke</li>
        <li>Has well over 200K stars on GitHub</li>
        <li>Is maintained by Meta</li>
        <li>Powers thousands of enterprise apps, including mobile apps</li>
      </ul>
    </main>
  )
}
`,
      "index.css": FACTS_CSS,
    } },
    { t: "rch", prompt: "Build a mini ReactFacts page in <code>App.jsx</code>: a <code>Header</code> component that renders <code>&lt;header&gt;&lt;nav&gt;</code> with an <code>&lt;img&gt;</code> (with alt text) and the site name, and a <code>Main</code> component with an <code>&lt;h1&gt;</code> \"Fun facts about React\" and a list of at least 4 facts. <code>App</code> renders both inside a Fragment.", files: {
      "App.jsx": `// Build Header and Main here, then render them from App.

export default function App() {
  return (
    <h1>Start here</h1>
  )
}
`,
    }, solution: {
      "App.jsx": `function Header() {
  return (
    <header>
      <nav>
        <img src="https://example.com/react-logo.png" alt="React logo" />
        <span>ReactFacts</span>
      </nav>
    </header>
  )
}

function Main() {
  return (
    <main>
      <h1>Fun facts about React</h1>
      <ul>
        <li>Was first released in 2013</li>
        <li>Was originally created by Jordan Walke</li>
        <li>Has well over 200K stars on GitHub</li>
        <li>Is maintained by Meta</li>
      </ul>
    </main>
  )
}

export default function App() {
  return (
    <>
      <Header />
      <Main />
    </>
  )
}
`,
    }, tests: [
      { msg: "There's a &lt;header&gt; containing a &lt;nav&gt;", fn: async (h) => !!h.$("header nav") },
      { msg: "The nav has an image with alt text", fn: async (h) => { const i = h.$("header nav img"); return !!i && i.getAttribute("alt").trim().length > 0; } },
      { msg: "&lt;h1&gt; says \"Fun facts about React\"", fn: async (h) => /fun facts about react/i.test(h.text("main h1")) },
      { msg: "The list has at least 4 facts", fn: async (h) => h.$$("main ul li").length >= 4 },
      { msg: "Header and Main are components used inside App", fn: async (h) => /function\s+Header|const\s+Header\s*=/.test(h.src("App.jsx")) && /function\s+Main|const\s+Main\s*=/.test(h.src("App.jsx")) && /<Header\s*\/>/.test(h.src("App.jsx")) && /<Main\s*\/>/.test(h.src("App.jsx")) },
      { msg: "No React warnings (hint: <code>className</code>, not <code>class</code>)", fn: async (h) => h.noWarnings() },
    ] },
    { t: "quiz", q: "Which import is correct for a component exported with <code>export default function Main()</code> from <code>components/Main.jsx</code>?", opts: ["import { Main } from \"./components/Main\"", "import Main from \"./components/Main\"", "import \"./components/Main\""], a: 1, why: "Default exports are imported without braces, and you can name them anything. Named exports (<code>export function Main</code>) need braces." },
    { t: "recap", items: ["React is composable (components) and declarative (describe the result)", "JSX → <code>jsx()</code> calls → React element objects → DOM", "One parent per return; Fragments avoid extra divs", "Components are capitalised functions that return JSX", "One component per file, default export, import where used"] },
  ]},

  /* ───────────────────────── Business card ───────────────────────── */
  { id: "rx-card", title: "Solo Project - Business Card", min: 45, kind: "project", body: [
    { t: "p", h: "Time to build something on your own. You'll make a digital business card: the kind of thing you could put at the top of your portfolio. The goal is practice splitting a design into components, so think about the pieces before writing any code." },
    { t: "h", h: "The spec" },
    { t: "steps", items: [
      "<b>Info</b>: a photo, your name (<code>&lt;h1&gt;</code>), your job title, a small website link, and two buttons: Email and LinkedIn",
      "<b>About</b>: an <code>&lt;h2&gt;</code> \"About\" and a short paragraph",
      "<b>Interests</b>: an <code>&lt;h2&gt;</code> \"Interests\" and a paragraph",
      "<b>Footer</b>: at least three social links, each with an <code>aria-label</code> because they only show an icon",
    ] },
    { t: "callout", kind: "tip", h: "Buttons that go somewhere are really links. Use <code>&lt;a href=\"mailto:you@example.com\"&gt;</code> for Email, and style it to look like a button. Screen readers then announce it correctly." },
    { t: "rch", prompt: "Build the business card from four components in <code>components/</code>, all rendered by <code>App</code> inside a <code>&lt;div className=\"card\"&gt;</code>.", assets: { "images/me.svg": AVATAR }, files: {
      "App.jsx": `import Info from "./components/Info"
import About from "./components/About"
import Interests from "./components/Interests"
import Footer from "./components/Footer"

export default function App() {
  return (
    <div className="card">
      {/* render the four components here */}
    </div>
  )
}
`,
      "components/Info.jsx": `import me from "../images/me.svg"

export default function Info() {
  return (
    <section className="info">
      <img src={me} alt="" />
    </section>
  )
}
`,
      "components/About.jsx": `export default function About() {
  return null
}
`,
      "components/Interests.jsx": `export default function Interests() {
  return null
}
`,
      "components/Footer.jsx": `export default function Footer() {
  return null
}
`,
      "index.css": `body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: #23252c; font-family: Inter, system-ui, sans-serif; }
.card { width: 317px; background: #1a1b21; color: #fff; border-radius: 10px; overflow: hidden; }
.info img { width: 100%; display: block; }
.info { text-align: center; padding-bottom: 12px; }
.info h1 { margin: 12px 0 2px; font-size: 1.4rem; }
.info h3 { margin: 0; color: #f3bf99; font-weight: 400; font-size: .85rem; }
.info small { display: block; margin: 6px 0 14px; font-size: .7rem; }
.buttons { display: flex; gap: 14px; justify-content: center; }
.buttons a { padding: 8px 18px; border-radius: 6px; text-decoration: none; font-size: .85rem; }
.email { background: #fff; color: #374151; }
.linkedin { background: #5093e2; color: #fff; }
section:not(.info) { padding: 0 36px; }
h2 { font-size: 1rem; margin: 22px 0 4px; }
p { font-size: .8rem; color: #dcdcdc; line-height: 1.5; margin: 0; }
footer { margin-top: 26px; background: #161619; padding: 16px; display: flex; justify-content: center; gap: 24px; }
footer a { color: #918e9b; text-decoration: none; font-size: 1.2rem; }
`,
    }, solution: {
      "App.jsx": `import Info from "./components/Info"
import About from "./components/About"
import Interests from "./components/Interests"
import Footer from "./components/Footer"

export default function App() {
  return (
    <div className="card">
      <Info />
      <About />
      <Interests />
      <Footer />
    </div>
  )
}
`,
      "components/Info.jsx": `import me from "../images/me.svg"

export default function Info() {
  return (
    <section className="info">
      <img src={me} alt="Portrait of Laura Smith" />
      <h1>Laura Smith</h1>
      <h3>Frontend Developer</h3>
      <small><a href="https://laurasmith.website">laurasmith.website</a></small>
      <div className="buttons">
        <a className="email" href="mailto:laura@example.com">Email</a>
        <a className="linkedin" href="https://www.linkedin.com/">LinkedIn</a>
      </div>
    </section>
  )
}
`,
      "components/About.jsx": `export default function About() {
  return (
    <section>
      <h2>About</h2>
      <p>I am a frontend developer with a particular interest in making things simple and automating daily tasks.</p>
    </section>
  )
}
`,
      "components/Interests.jsx": `export default function Interests() {
  return (
    <section>
      <h2>Interests</h2>
      <p>Food expert. Music scholar. Reader. Internet fanatic. Bacon buff. Entrepreneur. Travel geek.</p>
    </section>
  )
}
`,
      "components/Footer.jsx": `export default function Footer() {
  return (
    <footer>
      <a href="https://x.com" aria-label="X">𝕏</a>
      <a href="https://facebook.com" aria-label="Facebook">f</a>
      <a href="https://instagram.com" aria-label="Instagram">◎</a>
      <a href="https://github.com" aria-label="GitHub">⌂</a>
    </footer>
  )
}
`,
    }, tests: [
      { msg: "App renders Info, About, Interests and Footer", fn: async (h) => ["Info", "About", "Interests", "Footer"].every((c) => new RegExp("<" + c + "\\s*/>").test(h.src("App.jsx"))) },
      { msg: "Info shows a photo with alt text and your name in an &lt;h1&gt;", fn: async (h) => { const i = h.$(".card img"); return !!i && i.getAttribute("alt").trim().length > 0 && h.text(".card h1").length > 1; } },
      { msg: "There are Email (mailto:) and LinkedIn links", fn: async (h) => !!h.$('.card a[href^="mailto:"]') && h.$$(".card a").some((a) => /linkedin/i.test(a.textContent)) },
      { msg: "About and Interests each have an &lt;h2&gt; and a paragraph", fn: async (h) => { const hs = h.$$(".card h2").map((x) => x.textContent.trim().toLowerCase()); return hs.includes("about") && hs.includes("interests") && h.$$(".card p").length >= 2; } },
      { msg: "The footer has 3+ links, each with an aria-label", fn: async (h) => { const a = h.$$(".card footer a"); return a.length >= 3 && a.every((x) => (x.getAttribute("aria-label") || "").trim()); } },
      { msg: "No React warnings", fn: async (h) => h.noWarnings() },
    ] },
    { t: "recap", items: ["Split a design into components before coding", "One component per file, composed by App", "Links styled as buttons stay links", "Icon-only links need an aria-label"] },
  ]},

  /* ───────────────────────── Data-driven React ───────────────────────── */
  { id: "rx-data", title: "Data-Driven React", min: 90, kind: "lesson", body: [
    { t: "h", h: "The problem: components that aren't reusable" },
    { t: "p", h: "A <code>&lt;Entry /&gt;</code> component with \"Mount Fuji\" written inside it can only ever show Mount Fuji. To show a hundred places you'd need a hundred components. What we want is <b>one</b> component that can show <i>any</i> place, the way one function can work on any argument." },
    { t: "h", h: "JavaScript inside JSX" },
    { t: "p", h: "Curly braces switch from JSX back to JavaScript. Any <b>expression</b> works: variables, maths, function calls, ternaries, template literals. Statements like <code>if</code> or <code>for</code> don't, because they don't produce a value." },
    { t: "rplay", task: "Change the hour logic to also say \"Good evening\" after 6pm.", files: {
      "App.jsx": `export default function App() {
  const firstName = "Ada"
  const lastName = "Lovelace"
  const hours = new Date().getHours()
  const timeOfDay = hours < 12 ? "morning" : "afternoon"

  return (
    <main>
      <h1>Good {timeOfDay}, {firstName} {lastName}!</h1>
      <p>2 + 2 = {2 + 2}</p>
      <p>Your name has {(firstName + lastName).length} letters.</p>
      <p className={hours < 12 ? "am" : "pm"}>It's {hours}:00 here.</p>
    </main>
  )
}
`,
      "index.css": `body { font-family: system-ui, sans-serif; padding: 24px; }
.am { color: #c2410c; } .pm { color: #4338ca; }
`,
    } },
    { t: "h", h: "Props: passing data into components" },
    { t: "p", h: "<b>Props</b> (properties) are how a parent hands data to a child. You pass them like HTML attributes, and the component receives them as one object, its first parameter." },
    { t: "code", lang: "jsx", code: `function Contact(props) {
  return (
    <article className="contact">
      <img src={props.img} alt={"Photo of " + props.name} />
      <h3>{props.name}</h3>
      <p>📞 {props.phone}</p>
      <p>✉️ {props.email}</p>
    </article>
  )
}

<Contact name="Mr. Whiskerson" img="/cat1.png" phone="(212) 555-1234" email="mr.whiskaz@catnap.meow" />` },
    { t: "diagram", name: "props-flow" },
    { t: "callout", kind: "key", h: "Props are <b>read-only</b>. A component must never change its own props, just as a function shouldn't modify its arguments. If something needs to change over time, that's <b>state</b>, coming up next lesson." },
    { t: "quiz", q: "In <code>&lt;Contact name=\"Fluffy\" /&gt;</code>, how does Contact read the name?", opts: ["this.name", "props.name (from its first parameter)", "Contact.name", "document.querySelector(\"[name]\")"], a: 1, why: "React calls <code>Contact({ name: \"Fluffy\" })</code>. Every attribute becomes a key on the props object." },
    { t: "rch", assets: CATS, prompt: "In <code>Contact.jsx</code>, make <code>Contact</code> reusable: show <code>props.img</code> (alt text including the name), the name in an <code>&lt;h3&gt;</code>, the phone and the email.", files: {
      "Contact.jsx": `export default function Contact(props) {
  return (
    <article className="contact">
      <img src="cat.png" alt="" />
      <h3>Mr. Whiskerson</h3>
      <p>📞 (212) 555-1234</p>
      <p>✉️ mr.whiskaz@catnap.meow</p>
    </article>
  )
}
`,
      "App.jsx": `import Contact from "./Contact"
import whiskerson from "./images/cat1.svg"
import fluffykins from "./images/cat2.svg"

export default function App() {
  return (
    <div className="contacts">
      <Contact name="Mr. Whiskerson" img={whiskerson} phone="(212) 555-1234" email="mr.whiskaz@catnap.meow" />
      <Contact name="Fluffykins" img={fluffykins} phone="(212) 555-2345" email="fluff@me.com" />
    </div>
  )
}
`,
      "index.css": `body { font-family: system-ui, sans-serif; background: #f5f5f5; }
.contacts { display: flex; gap: 16px; padding: 12px; }
.contact { background: #fff; border-radius: 10px; padding: 12px; width: 180px; box-shadow: 0 2px 8px #0001; }
.contact img { width: 100%; border-radius: 8px; }
.contact h3 { margin: 8px 0 4px; } .contact p { margin: 2px 0; font-size: .8rem; }
`,
    }, solution: {
      "Contact.jsx": `export default function Contact({ img, name, phone, email }) {
  return (
    <article className="contact">
      <img src={img} alt={"Photo of " + name} />
      <h3>{name}</h3>
      <p>📞 {phone}</p>
      <p>✉️ {email}</p>
    </article>
  )
}
`,
    }, tests: [
      { msg: "Shows the name passed in props", fn: async (h) => { const d = await h.render(h.mod("Contact").default, { name: "Felix", img: "f.png", phone: "123", email: "f@x.io" }); return d.querySelector("h3").textContent.trim() === "Felix"; } },
      { msg: "Uses props.img for the image and puts the name in the alt text", fn: async (h) => { const d = await h.render(h.mod("Contact").default, { name: "Felix", img: "felix.png", phone: "1", email: "e" }); const i = d.querySelector("img"); return i.getAttribute("src") === "felix.png" && i.getAttribute("alt").includes("Felix"); } },
      { msg: "Shows the phone and email from props", fn: async (h) => { const d = await h.render(h.mod("Contact").default, { name: "N", img: "i", phone: "555-0199", email: "zed@cats.io" }); return d.textContent.includes("555-0199") && d.textContent.includes("zed@cats.io"); } },
      { msg: "App renders two different contacts", fn: async (h) => h.$$(".contact h3").map((x) => x.textContent.trim()).join("|") === "Mr. Whiskerson|Fluffykins" },
    ] },
    { t: "h", h: "Destructuring props" },
    { t: "p", h: "Most React code destructures props right in the parameter list. It documents which props the component expects, and saves typing <code>props.</code> everywhere." },
    { t: "code", lang: "jsx", code: `function Contact({ img, name, phone, email }) {
  return <h3>{name}</h3>
}` },
    { t: "h", h: "Non-string props" },
    { t: "p", h: "Quotes pass strings. For anything else (numbers, booleans, arrays, objects, functions), use curly braces. A prop with no value is <code>true</code>." },
    { t: "code", lang: "jsx", code: `<Joke
  setup="I got my daughter a fridge for her birthday."
  punchline="I can't wait to see her face light up when she opens it."
  upvotes={10}
  isPun={true}
  comments={[{ author: "", body: "", title: "" }]}
/>
<Button disabled />   {/* disabled === true */}` },
    { t: "h", h: "Importing static assets" },
    { t: "p", h: "In a Vite project, you import images like modules: <code>import japan from \"./images/japan.jpg\"</code>. Vite gives you back a URL to use in <code>src={japan}</code>, and fingerprints the file for caching when you build." },
    { t: "h", h: "Rendering arrays with .map()" },
    { t: "p", h: "React can render an array of elements: <code>{[&lt;li&gt;A&lt;/li&gt;, &lt;li&gt;B&lt;/li&gt;]}</code> shows both. So the usual pattern is to keep your data in an array of objects and <code>.map()</code> it into an array of components." },
    { t: "gif", name: "jsx-map" },
    { t: "code", lang: "jsx", code: `const jokeElements = jokesData.map(joke => (
  <Joke key={joke.id} setup={joke.setup} punchline={joke.punchline} />
))

return <main>{jokeElements}</main>` },
    { t: "h", h: "The key prop" },
    { t: "p", h: "When a list re-renders, React matches old items to new ones to decide what to keep, move or remove. The <code>key</code> tells it which item is which. Use a stable, unique id from your data. Array indexes only work for lists that never reorder, insert or delete, because the index of an item changes when its neighbours do." },
    { t: "rplay", task: "Open the console: React warns that list items need a key. Add <code>key={note.id}</code> to the <code>&lt;li&gt;</code> and the warning disappears.", files: {
      "App.jsx": `const notes = [
  { id: "n1", text: "Props flow down" },
  { id: "n2", text: "Keys identify list items" },
  { id: "n3", text: "map() returns a new array" },
]

export default function App() {
  return (
    <ul>
      {notes.map(note => <li>{note.text}</li>)}
    </ul>
  )
}
`,
      "index.css": `body { font-family: system-ui, sans-serif; padding: 20px; } li { padding: 4px 0; }`,
    } },
    { t: "quiz", q: "Which is the best key for a list of todos loaded from a database?", opts: ["The array index", "Math.random()", "The todo's id from the database", "The todo's text"], a: 2, why: "Keys must be stable and unique. A random key changes on every render, so React would recreate every item; text can repeat; indexes break when items move." },
    { t: "h", h: "Passing whole objects, and spreading them" },
    { t: "code", lang: "jsx", code: `// pass the object as one prop
<Entry key={entry.id} entry={entry} />          // use props.entry.title

// or spread its properties as separate props
<Entry key={entry.id} {...entry} />             // use props.title` },
    { t: "p", h: "Spreading is shorter, but it hides which props a component receives. Passing the object is more explicit. Both are common, so recognise both." },
    { t: "h", h: "Project: Travel journal" },
    { t: "rplay", task: "Add a fourth place to <code>data.js</code>. The page updates with no change to the components. That's data-driven UI.", assets: PLACES, files: {
      "App.jsx": `import Header from "./components/Header"
import Entry from "./components/Entry"
import data from "./data"

export default function App() {
  const entryElements = data.map(entry => <Entry key={entry.id} entry={entry} />)
  return (
    <>
      <Header />
      <main className="container">{entryElements}</main>
    </>
  )
}
`,
      "components/Entry.jsx": `export default function Entry({ entry }) {
  return (
    <article className="journal-entry">
      <img className="entry-image" src={entry.img.src} alt={entry.img.alt} />
      <div className="info-container">
        <span className="country">📍 {entry.country}</span>
        <a href={entry.googleMapsLink}>View on Google Maps</a>
        <h2 className="entry-title">{entry.title}</h2>
        <p className="trip-dates">{entry.dates}</p>
        <p className="entry-text">{entry.text}</p>
      </div>
    </article>
  )
}
`,
      "components/Header.jsx": `export default function Header() {
  return <header><span>🌍</span> my travel journal.</header>
}
`,
      "data.js": `import japan from "./images/japan.svg"
import australia from "./images/australia.svg"
import norway from "./images/norway.svg"

export default [
  { id: 1, img: { src: japan, alt: "Mount Fuji" }, title: "Mount Fuji", country: "Japan",
    googleMapsLink: "https://www.google.com/maps/place/Mount+Fuji",
    dates: "12 Jan, 2021 - 24 Jan, 2021",
    text: "Mount Fuji is the tallest mountain in Japan, standing at 3,776 meters (12,380 feet)." },
  { id: 2, img: { src: australia, alt: "Sydney Opera House" }, title: "Sydney Opera House", country: "Australia",
    googleMapsLink: "https://www.google.com/maps/place/Sydney+Opera+House",
    dates: "27 May, 2021 - 8 Jun, 2021",
    text: "The Sydney Opera House is a multi-venue performing arts centre in Sydney." },
  { id: 3, img: { src: norway, alt: "Geirangerfjord" }, title: "Geirangerfjord", country: "Norway",
    googleMapsLink: "https://www.google.com/maps/place/Geirangerfjord",
    dates: "01 Oct, 2021 - 18 Nov, 2021",
    text: "The Geiranger Fjord is a fjord in the Sunnmøre region of Møre og Romsdal county, Norway." },
]
`,
      "index.css": `body { margin: 0; font-family: Inter, system-ui, sans-serif; background: #fafafa; }
header { background: #f55a5a; color: #fff; text-align: center; padding: 16px; font-weight: 600; }
.container { max-width: 560px; margin: 0 auto; padding: 20px; }
.journal-entry { display: flex; gap: 18px; padding-block: 18px; border-bottom: 1px solid #e5e5e5; }
.entry-image { width: 125px; height: 168px; object-fit: cover; border-radius: 6px; }
.country { font-size: .7rem; letter-spacing: .15em; text-transform: uppercase; margin-right: 10px; }
.info-container a { font-size: .7rem; color: #918e9b; }
.entry-title { margin: 6px 0; font-size: 1.4rem; }
.trip-dates { font-weight: 700; font-size: .75rem; margin: 0 0 6px; }
.entry-text { font-size: .75rem; line-height: 1.5; margin: 0; }
`,
    } },
    { t: "rch", prompt: "Render every joke in <code>jokes.js</code> with the <code>Joke</code> component using <code>.map()</code>. Each joke needs a <code>key</code>, and the punchline must show. Some jokes have no setup: don't render an empty setup paragraph for those.", files: {
      "App.jsx": `import Joke from "./Joke"
import jokes from "./jokes"

export default function App() {
  return (
    <main>
      <Joke setup={jokes[0].setup} punchline={jokes[0].punchline} />
    </main>
  )
}
`,
      "Joke.jsx": `export default function Joke(props) {
  return (
    <article className="joke">
      <p className="setup">Setup: {props.setup}</p>
      <p className="punchline">Punchline: {props.punchline}</p>
    </article>
  )
}
`,
      "jokes.js": `export default [
  { id: 1, setup: "I got my daughter a fridge for her birthday.", punchline: "I can't wait to see her face light up when she opens it." },
  { id: 2, setup: "How did the hacker escape the police?", punchline: "He just ransomware!" },
  { id: 3, setup: "Why don't pirates travel on mountain roads?", punchline: "Scurvy." },
  { id: 4, punchline: "It's hard to explain puns to kleptomaniacs because they always take things literally." },
  { id: 5, setup: "What's the best thing about Switzerland?", punchline: "I don't know, but the flag is a big plus!" },
]
`,
    }, solution: {
      "App.jsx": `import Joke from "./Joke"
import jokes from "./jokes"

export default function App() {
  const jokeElements = jokes.map(joke => (
    <Joke key={joke.id} setup={joke.setup} punchline={joke.punchline} />
  ))
  return <main>{jokeElements}</main>
}
`,
      "Joke.jsx": `export default function Joke(props) {
  return (
    <article className="joke">
      {props.setup && <p className="setup">Setup: {props.setup}</p>}
      <p className="punchline">Punchline: {props.punchline}</p>
    </article>
  )
}
`,
    }, tests: [
      { msg: "All 5 jokes are rendered", fn: async (h) => h.$$(".joke").length === 5 },
      { msg: "Each joke shows its own punchline", fn: async (h) => { const p = h.$$(".joke .punchline").map((x) => x.textContent); return p.length === 5 && p[1].includes("ransomware") && p[4].includes("big plus"); } },
      { msg: "The joke with no setup has no setup paragraph", fn: async (h) => h.$$(".joke .setup").length === 4 },
      { msg: "Uses .map() rather than writing each Joke by hand", fn: async (h) => /\.map\(/.test(h.src("App.jsx")) && (h.src("App.jsx").match(/<Joke/g) || []).length === 1 },
      { msg: "No missing-key warning in the console", fn: async (h) => h.noWarnings(/unique "key"|Each child/) },
    ] },
    { t: "recap", items: ["<code>{}</code> embeds any JavaScript expression in JSX", "Props pass data from parent to child; they're read-only", "Destructure props in the parameter list", "<code>.map()</code> turns data arrays into component arrays", "Every list item needs a stable, unique <code>key</code>", "Pass objects as one prop, or spread them with <code>{...obj}</code>"] },
  ]},
];
