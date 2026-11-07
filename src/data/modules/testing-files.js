/* The Meme Generator app that the Testing module tests, plus its buggy "mutants". */

const LOGO = "data:image/svg+xml," + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#fff"/><path d="M18 26q6-8 12 0M34 26q6-8 12 0M16 38q16 18 32 0" stroke="#672280" stroke-width="4" fill="none" stroke-linecap="round"/></svg>`);

export const MEME_CSS = `* { box-sizing: border-box; }
body { margin: 0; font-family: Karla, system-ui, sans-serif; background: #f5f5f5; }
.header { display: flex; align-items: center; gap: 10px; padding: 14px 24px; color: #fff; background: linear-gradient(90deg, #672280 1.18%, #a626d3 100%); }
.header img { width: 32px; height: 32px; }
.header h1 { margin: 0; font-size: 1.2rem; }
main { padding: 24px; max-width: 560px; margin: 0 auto; }
.form { display: grid; grid-template-columns: 1fr 1fr; gap: 12px 16px; }
.form label { font-size: .8rem; color: #4b5563; display: grid; gap: 4px; }
.form input { border: 1px solid #d1d5db; border-radius: 5px; padding: 9px 10px; font: inherit; }
.form button { grid-column: 1 / -1; border: 0; border-radius: 5px; padding: 11px; color: #fff; font: inherit; font-weight: 700; cursor: pointer; background: linear-gradient(90deg, #672280 1.18%, #a626d3 100%); }
.form button:disabled { opacity: .6; cursor: wait; }
.error { color: #b42318; background: #fff1f0; padding: 8px 12px; border-radius: 6px; }
.meme { position: relative; margin-top: 24px; display: grid; place-items: center; }
.meme img { width: 100%; border-radius: 6px; display: block; min-height: 200px; background: #ddd; }
.meme span { position: absolute; width: 90%; text-align: center; font: 900 2rem/1.1 Impact, "Arial Black", sans-serif; color: #fff;
  letter-spacing: 1px; text-shadow: 2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000; }
.meme .top { top: 12px; } .meme .bottom { bottom: 12px; }
.actions { display: flex; gap: 8px; justify-content: flex-end; margin-top: 12px; }
.actions button { border: 1px solid #d1d5db; background: #fff; border-radius: 8px; padding: 8px 10px; cursor: pointer; }
`;

const DEFAULT_SVG = "data:image/svg+xml," + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="600" height="420"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3b2a1a"/><stop offset="1" stop-color="#7a5a3a"/></linearGradient></defs><rect width="600" height="420" fill="url(#g)"/><circle cx="300" cy="190" r="70" fill="#d9b48f"/><rect x="215" y="260" width="170" height="160" rx="40" fill="#2a2a2a"/></svg>`);
export const IMAGES = `// Image URLs used by the app
export const DEFAULT_IMAGE = "${DEFAULT_SVG}"
`;

export const MAIN_JSX = `import { createRoot } from "react-dom/client"
import App from "./App"
import "./index.css"

createRoot(document.getElementById("root")).render(<App />)
`;

export const APP_JSX = `import Header from "./components/Header"
import Main from "./components/Main"

export default function App() {
  return (
    <>
      <Header />
      <Main />
    </>
  )
}
`;

export const HEADER = `const logo = "${LOGO}"

export default function Header() {
  return (
    <header className="header">
      <img src={logo} alt="Troll face logo" />
      <h1>Meme Generator</h1>
    </header>
  )
}
`;

export const UTILS = `/** Pick a random meme. \`random\` is a parameter so tests can control it. */
export function getRandomMeme(memes, random = Math.random) {
  if (memes.length === 0) return null
  return memes[Math.floor(random() * memes.length)]
}

/** Meme captions are shouted: trimmed and uppercase. */
export function formatMemeText(text) {
  return text.trim().toUpperCase()
}
`;

export const MEME_MAIN = `import { useState, useEffect } from "react"
import { getRandomMeme, formatMemeText } from "../utils/memeUtils"
import { DEFAULT_IMAGE } from "../images"

export const MEMES_URL = "https://api.shipyard.dev/memes"

export default function Main() {
  const [meme, setMeme] = useState({
    topText: "One does not simply",
    bottomText: "Walk into Mordor",
    imageUrl: DEFAULT_IMAGE,
  })
  const [allMemes, setAllMemes] = useState([])
  const [error, setError] = useState("")

  useEffect(() => {
    fetch(MEMES_URL)
      .then((res) => {
        if (!res.ok) throw new Error("Request failed")
        return res.json()
      })
      .then((data) => setAllMemes(data.data.memes))
      .catch(() => setError("Couldn't load memes. Please try again later."))
  }, [])

  function getMemeImage() {
    const newMeme = getRandomMeme(allMemes)
    if (newMeme) setMeme((prev) => ({ ...prev, imageUrl: newMeme.url }))
  }

  function handleChange(event) {
    const { value, name } = event.currentTarget
    setMeme((prev) => ({ ...prev, [name]: value }))
  }

  return (
    <main>
      <div className="form">
        <label>
          Top Text
          <input type="text" placeholder="One does not simply" name="topText" onChange={handleChange} value={meme.topText} />
        </label>
        <label>
          Bottom Text
          <input type="text" placeholder="Walk into Mordor" name="bottomText" onChange={handleChange} value={meme.bottomText} />
        </label>
        <button onClick={getMemeImage} disabled={allMemes.length === 0}>Get a new meme image 🖼</button>
      </div>
      {error && <p role="alert" className="error">{error}</p>}
      <div className="meme">
        <img src={meme.imageUrl} alt="Meme" />
        <span className="top">{formatMemeText(meme.topText)}</span>
        <span className="bottom">{formatMemeText(meme.bottomText)}</span>
      </div>
    </main>
  )
}
`;

export const SETUP = `// Runs before every test file (vite.config.js → test.setupFiles)
import "@testing-library/jest-dom/vitest"
`;

export const VITE_CONFIG = `import { defineConfig } from "vitest/config"
import react from "@vitejs/plugin-react"

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",            // a fake browser DOM for component tests
    globals: true,                   // optional: describe/it/expect without imports
    setupFiles: "./src/setupTests.js",
  },
})
`;

export const PKG = `{
  "name": "meme-generator",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "test": "vitest",
    "coverage": "vitest run --coverage"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.6.0",
    "@testing-library/react": "^16.3.0",
    "@testing-library/user-event": "^14.6.0",
    "@vitest/coverage-v8": "^3.2.0",
    "jsdom": "^26.1.0",
    "msw": "^2.10.0",
    "vitest": "^3.2.0",
    "vitest-axe": "^0.1.0"
  }
}
`;

/** The whole project, keyed by path. */
export const APP = {
  "src/main.jsx": MAIN_JSX,
  "src/App.jsx": APP_JSX,
  "src/components/Header.jsx": HEADER,
  "src/components/Main.jsx": MEME_MAIN,
  "src/utils/memeUtils.js": UTILS,
  "src/images.js": IMAGES,
  "src/setupTests.js": SETUP,
  "src/index.css": MEME_CSS,
};

/* ── mutants: one bug each ── */
const sw = (src, a, b) => { if (!src.includes(a)) throw new Error("mutant anchor not found: " + a); return src.replace(a, b); };
export const MUT = {
  utilsRound: { "src/utils/memeUtils.js": sw(UTILS, "Math.floor(random() * memes.length)", "Math.round(random() * memes.length)") },
  utilsNoTrim: { "src/utils/memeUtils.js": sw(UTILS, "text.trim().toUpperCase()", "text.toUpperCase()") },
  utilsNoUpper: { "src/utils/memeUtils.js": sw(UTILS, "text.trim().toUpperCase()", "text.trim()") },
  utilsEmpty: { "src/utils/memeUtils.js": sw(UTILS, "if (memes.length === 0) return null\n", "") },
  headerNoAlt: { "src/components/Header.jsx": sw(HEADER, ' alt="Troll face logo"', "") },
  headerTitle: { "src/components/Header.jsx": sw(HEADER, "<h1>Meme Generator</h1>", "<h2>Meme Generator</h2>") },
  mainNoDefault: { "src/components/Main.jsx": sw(MEME_MAIN, 'topText: "One does not simply",', 'topText: "",') },
  mainNoLabel: { "src/components/Main.jsx": sw(MEME_MAIN, "          Top Text\n", "") },
  changeAlwaysTop: { "src/components/Main.jsx": sw(MEME_MAIN, "[name]: value", "topText: value") },
  noFormat: { "src/components/Main.jsx": sw(sw(MEME_MAIN, "{formatMemeText(meme.topText)}", "{meme.topText}"), "{formatMemeText(meme.bottomText)}", "{meme.bottomText}") },
  bottomNotWired: { "src/components/Main.jsx": sw(MEME_MAIN, 'name="bottomText" onChange={handleChange}', 'name="bottomText" onChange={() => {}}') },
  buttonNoop: { "src/components/Main.jsx": sw(MEME_MAIN, "if (newMeme) setMeme((prev) => ({ ...prev, imageUrl: newMeme.url }))", "void newMeme") },
  noErrorMessage: { "src/components/Main.jsx": sw(MEME_MAIN, '.catch(() => setError("Couldn\'t load memes. Please try again later."))', ".catch(() => {})") },
  ignoresStatus: { "src/components/Main.jsx": sw(MEME_MAIN, '        if (!res.ok) throw new Error("Request failed")\n', "") },
};

/* ── accessibility + TDD: share buttons ── */
export const ACTIONS_BROKEN = `const downloadIcon = <svg viewBox="0 0 24 24" width="20" height="20"><path d="M12 3v12m0 0l-5-5m5 5l5-5M4 21h16" stroke="currentColor" strokeWidth="2" fill="none" /></svg>
const shareIcon = <svg viewBox="0 0 24 24" width="20" height="20"><circle cx="6" cy="12" r="3" /><circle cx="18" cy="6" r="3" /><circle cx="18" cy="18" r="3" /></svg>

export default function MemeActions({ onDownload, onShare }) {
  return (
    <div className="actions">
      <button onClick={onDownload}>{downloadIcon}</button>
      <button>{shareIcon}</button>
    </div>
  )
}
`;
export const ACTIONS_FIXED = `const downloadIcon = <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M12 3v12m0 0l-5-5m5 5l5-5M4 21h16" stroke="currentColor" strokeWidth="2" fill="none" /></svg>
const shareIcon = <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><circle cx="6" cy="12" r="3" /><circle cx="18" cy="6" r="3" /><circle cx="18" cy="18" r="3" /></svg>

export default function MemeActions({ onDownload, onShare }) {
  return (
    <div className="actions">
      <button onClick={onDownload} aria-label="Download meme">{downloadIcon}</button>
      <button onClick={onShare} aria-label="Share meme">{shareIcon}</button>
    </div>
  )
}
`;
export const ACTIONS_NAMED_NO_SHARE = sw(ACTIONS_FIXED, "<button onClick={onShare} aria-label", "<button aria-label");
