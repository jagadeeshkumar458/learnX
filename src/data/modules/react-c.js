/* React.js Fundamentals, part C: Tenzies, Assembly: Endgame, Quiz App, Outro.
   Test functions in `rch` blocks MUST be self-contained (serialised with toString()). */

const API = "https://api.shipyard.dev";

const TENZIES_CSS = `* { box-sizing: border-box; }
body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: #0b2434; font-family: Karla, system-ui, sans-serif; }
main { background: #f5f5f5; width: min(360px, 92vw); border-radius: 10px; padding: 22px; text-align: center; }
h1 { margin: 0 0 6px; font-size: 1.8rem; }
.instructions { margin: 0 0 18px; color: #4a4e74; font-size: .85rem; line-height: 1.4; }
.dice-container { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; margin-bottom: 22px; }
.die { aspect-ratio: 1; border: 0; border-radius: 8px; box-shadow: 0 2px 2px #00000026; font: 700 1.5rem Karla, system-ui, sans-serif; cursor: pointer; background: #fff; }
.roll-dice { border: 0; border-radius: 6px; background: #5035ff; color: #fff; font: 700 1.1rem Karla, system-ui, sans-serif; padding: 10px 28px; cursor: pointer; }
.roll-dice:focus-visible { outline: 3px solid #f2b632; outline-offset: 3px; }
.sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
`;

const LANGUAGES = `export const languages = [
  { name: "HTML", backgroundColor: "#E2680F", color: "#F9F4DA" },
  { name: "CSS", backgroundColor: "#328AF1", color: "#F9F4DA" },
  { name: "JavaScript", backgroundColor: "#F4EB13", color: "#1E1E1E" },
  { name: "React", backgroundColor: "#2ED3E9", color: "#1E1E1E" },
  { name: "TypeScript", backgroundColor: "#298EC6", color: "#F9F4DA" },
  { name: "Node.js", backgroundColor: "#599137", color: "#F9F4DA" },
  { name: "Python", backgroundColor: "#FFD742", color: "#1E1E1E" },
  { name: "Ruby", backgroundColor: "#D02B2B", color: "#F9F4DA" },
  { name: "Assembly", backgroundColor: "#2D519F", color: "#F9F4DA" },
]
`;

const WORDS = `export const words = [
  "react", "about", "account", "action", "between", "bridge", "button", "change", "circle", "coffee",
  "debug", "design", "editor", "engine", "export", "folder", "garden", "import", "jacket", "keyboard",
  "laptop", "method", "network", "object", "planet", "promise", "render", "school", "server", "silver",
  "simple", "socket", "spring", "string", "syntax", "update", "window", "yellow",
]
`;

const UTILS = `import { words } from "./words"

export function getRandomWord() {
  return words[Math.floor(Math.random() * words.length)]
}

export function getFarewellText(language) {
  const options = [
    "Farewell, " + language,
    "Adios, " + language,
    "R.I.P., " + language,
    "We'll miss you, " + language,
    "Oh no, not " + language + "!",
    language + " bites the dust",
    "Gone but not forgotten, " + language,
    "The end of " + language + " as we know it",
    "Off into the sunset, " + language,
    language + ", it's been real",
    language + ", your watch has ended",
    language + " has left the building",
  ]
  return options[Math.floor(Math.random() * options.length)]
}
`;

const ASSEMBLY_CSS = `* { box-sizing: border-box; }
body { margin: 0; background: #262626; color: #d9d9d9; font-family: Hanken Grotesk, system-ui, sans-serif; padding: 20px; }
main { max-width: 480px; margin: 0 auto; display: flex; flex-direction: column; align-items: center; gap: 18px; }
header { text-align: center; } header h1 { margin: 0; font-size: 1.25rem; color: #f9f4da; font-weight: 500; }
header p { margin: 6px 0 0; font-size: .85rem; color: #8e8e8e; max-width: 350px; }
.game-status { width: 100%; min-height: 64px; border-radius: 4px; display: grid; place-items: center; text-align: center; color: #f9f4da; padding: 6px; }
.game-status h2 { margin: 0; font-size: 1.1rem; } .game-status p { margin: 2px 0 0; font-size: .85rem; }
.game-status.won { background: #10a95b; } .game-status.lost { background: #ba2a2a; }
.game-status.farewell { background: #7a5ea7; border: 1px dashed #323232; font-style: italic; }
.language-chips { display: flex; flex-wrap: wrap; justify-content: center; gap: 3px; max-width: 350px; }
.chip { border-radius: 3px; padding: 4.5px; position: relative; font-size: .85rem; }
.chip.lost::before { content: "💀"; position: absolute; inset: 0; display: grid; place-items: center; background: #000000b3; font-size: .85rem; }
.word { display: flex; gap: 2px; }
.word span { width: 40px; height: 40px; display: grid; place-items: center; background: #323232; border-bottom: 1px solid #f9f4da; font-size: 1.1rem; font-weight: 700; text-transform: uppercase; }
.word span.missed-letter { color: #ec5d49; }
.keyboard { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; max-width: 450px; }
.keyboard button { width: 40px; height: 40px; border: 1px solid #d7d7d7; border-radius: 4px; background: #fcba29; font-size: 1rem; font-weight: 700; text-transform: uppercase; cursor: pointer; }
.keyboard button.correct { background: #10a95b; } .keyboard button.wrong { background: #ec5d49; }
.keyboard button:disabled { cursor: not-allowed; opacity: .5; }
.new-game { background: #11b5e5; border: 1px solid #d7d7d7; border-radius: 4px; width: 225px; height: 40px; font: inherit; font-weight: 600; cursor: pointer; }
.sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
`;

const QUIZ_CSS = `* { box-sizing: border-box; }
body { margin: 0; min-height: 100vh; background: #f5f7fb; color: #293264; font-family: Karla, Inter, system-ui, sans-serif; display: grid; place-items: center; }
main { width: min(560px, 94vw); padding: 24px 0; }
.start { text-align: center; } .start h1 { font-size: 2rem; margin: 0 0 6px; } .start p { margin: 0 0 24px; }
.btn { border: 0; border-radius: 15px; background: #4d5b9e; color: #f5f7fb; padding: 12px 34px; font: inherit; font-weight: 600; cursor: pointer; }
.question { border-bottom: 1px solid #dbdef0; padding-block: 12px; }
.question h2 { font-size: 1rem; margin: 0 0 10px; }
.answers { display: flex; flex-wrap: wrap; gap: 10px; }
.answers button { border: 1px solid #4d5b9e; border-radius: 8px; background: transparent; color: #293264; padding: 4px 14px; font: inherit; font-size: .8rem; cursor: pointer; }
.answers button.selected { background: #d6dbf5; border-color: #d6dbf5; }
.answers button.correct { background: #94d7a2; border-color: #94d7a2; }
.answers button.incorrect { background: #f8bcbc; border-color: #f8bcbc; opacity: .6; }
.answers button:disabled:not(.correct):not(.incorrect) { opacity: .5; }
.footer { display: flex; align-items: center; justify-content: center; gap: 18px; margin-top: 22px; font-weight: 700; }
.loading { text-align: center; color: #4d5b9e; }
`;

export const REACT_C = [
  /* ───────────────────────── Tenzies ───────────────────────── */
  { id: "rx-tenzies", title: "Capstone Project #1 - Tenzies", min: 100, kind: "project", body: [
    { t: "p", h: "<b>Tenzies</b>: roll ten dice until they all show the same number. Click a die to freeze it at its current value between rolls. It's small, but it uses everything so far: components, props, state in arrays of objects, event handlers, derived values, and an effect." },
    { t: "diagram", name: "tenzies-flow" },
    { t: "h", h: "Generate the dice" },
    { t: "p", h: "Each die needs a <code>value</code>, an <code>isHeld</code> flag and an <code>id</code> to use as its key. In a real project you'd use <code>nanoid()</code> or <code>crypto.randomUUID()</code> for ids; for ten dice that never reorder, the index works too." },
    { t: "jsch", fn: "generateAllNewDice", prompt: "Write <code>generateAllNewDice()</code>: return an array of <b>10</b> objects, each <code>{ value, isHeld: false, id }</code>, where <code>value</code> is a random whole number from 1 to 6 and every <code>id</code> is unique.", starter: `function generateAllNewDice() {

}`, solution: `function generateAllNewDice() {
  return new Array(10).fill(0).map((_, i) => ({
    value: Math.ceil(Math.random() * 6),
    isHeld: false,
    id: i + 1,
  }))
}`, tests: [
      { msg: "Returns 10 dice", fn: (f) => Array.isArray(f()) && f().length === 10 },
      { msg: "Every value is a whole number from 1 to 6", fn: (f) => { for (let n = 0; n < 50; n++) if (!f().every((d) => Number.isInteger(d.value) && d.value >= 1 && d.value <= 6)) return false; return true; } },
      { msg: "Values are random (all six faces turn up)", fn: (f) => { const seen = new Set(); for (let n = 0; n < 40; n++) f().forEach((d) => seen.add(d.value)); return seen.size === 6; } },
      { msg: "Every die starts with <code>isHeld: false</code> and a unique id", fn: (f) => { const d = f(); return d.every((x) => x.isHeld === false) && new Set(d.map((x) => x.id)).size === 10; } },
    ] },
    { t: "h", h: "Die component, holding and rolling" },
    { t: "code", lang: "jsx", code: `function Die({ value, isHeld, hold }) {
  return (
    <button
      className="die"
      style={{ backgroundColor: isHeld ? "#59E391" : "white" }}
      onClick={hold}
      aria-pressed={isHeld}
      aria-label={"Die with value " + value + ", " + (isHeld ? "held" : "not held")}
    >{value}</button>
  )
}

function hold(id) {
  setDice(oldDice => oldDice.map(die => die.id === id ? { ...die, isHeld: !die.isHeld } : die))
}

function rollDice() {
  setDice(oldDice => oldDice.map(die => die.isHeld ? die : { ...die, value: Math.ceil(Math.random() * 6) }))
}` },
    { t: "callout", kind: "tip", h: "<code>hold={() => hold(die.id)}</code> passes a small function that already knows which die it belongs to. The Die component doesn't need to know about ids at all." },
    { t: "h", h: "End game: derive, don't store" },
    { t: "p", h: "It's tempting to add <code>const [gameWon, setGameWon] = useState(false)</code> and keep it in sync with an effect. Don't. Whether the game is won can be <b>calculated</b> from the dice on every render, so it can never be out of date:" },
    { t: "code", lang: "jsx", code: `const gameWon = dice.every(die => die.isHeld) &&
                dice.every(die => die.value === dice[0].value)` },
    { t: "h", h: "Lazy state initialisation" },
    { t: "p", h: "<code>useState(generateAllNewDice())</code> calls the function on <i>every</i> render and throws the result away after the first. Pass the function itself, <code>useState(() => generateAllNewDice())</code>, and React only calls it once." },
    { t: "quiz", q: "Why is <code>useState(() => expensive())</code> better than <code>useState(expensive())</code>?", opts: ["It makes the state read-only", "React only calls the function on the first render, instead of every render", "It's required for arrays"], a: 1, why: "The initial value only matters once. Passing a function lets React skip the work on later renders." },
    { t: "h", h: "Accessibility improvements" },
    { t: "steps", items: [
      "<code>aria-pressed</code> tells screen readers a die is a toggle button, and whether it's held",
      "An <code>aria-label</code> like \"Die with value 4, held\" describes it better than \"4\"",
      "A visually hidden <code>aria-live=\"polite\"</code> region announces the win",
      "When the game is won, move focus to the New Game button with a ref, so keyboard users can play again straight away",
    ] },
    { t: "code", lang: "jsx", code: `const buttonRef = useRef(null)

useEffect(() => {
  if (gameWon) buttonRef.current.focus()
}, [gameWon])

<div aria-live="polite" className="sr-only">
  {gameWon && <p>Congratulations! You won! Press "New Game" to start again.</p>}
</div>
<button ref={buttonRef} className="roll-dice" onClick={gameWon ? newGame : rollDice}>
  {gameWon ? "New Game" : "Roll"}
</button>` },
    { t: "rch", prompt: "Finish Tenzies. Clicking a die toggles <code>isHeld</code> (green, <code>aria-pressed</code>); <b>Roll</b> re-rolls only unheld dice; when every die is held with the same value the button says <b>New Game</b>, gets focus, and starts a fresh game. Initialise the dice lazily.", files: {
      "App.jsx": `import { useState, useRef, useEffect } from "react"
import Die from "./Die"

function generateAllNewDice() {
  return new Array(10).fill(0).map((_, i) => ({
    value: Math.ceil(Math.random() * 6),
    isHeld: false,
    id: i + 1,
  }))
}

export default function App() {
  const [dice, setDice] = useState(generateAllNewDice())

  function rollDice() {
    setDice(generateAllNewDice())
  }

  const diceElements = dice.map(dieObj => (
    <Die key={dieObj.id} value={dieObj.value} />
  ))

  return (
    <main>
      <h1 className="title">Tenzies</h1>
      <p className="instructions">Roll until all dice are the same. Click each die to freeze it at its current value between rolls.</p>
      <div className="dice-container">{diceElements}</div>
      <button className="roll-dice" onClick={rollDice}>Roll</button>
    </main>
  )
}
`,
      "Die.jsx": `export default function Die(props) {
  return <button className="die">{props.value}</button>
}
`,
      "index.css": TENZIES_CSS,
    }, solution: {
      "App.jsx": `import { useState, useRef, useEffect } from "react"
import Die from "./Die"

function generateAllNewDice() {
  return new Array(10).fill(0).map((_, i) => ({
    value: Math.ceil(Math.random() * 6),
    isHeld: false,
    id: i + 1,
  }))
}

export default function App() {
  const [dice, setDice] = useState(() => generateAllNewDice())
  const buttonRef = useRef(null)

  const gameWon = dice.every(die => die.isHeld) &&
    dice.every(die => die.value === dice[0].value)

  useEffect(() => {
    if (gameWon) buttonRef.current.focus()
  }, [gameWon])

  function rollDice() {
    if (gameWon) {
      setDice(generateAllNewDice())
      return
    }
    setDice(oldDice => oldDice.map(die =>
      die.isHeld ? die : { ...die, value: Math.ceil(Math.random() * 6) }
    ))
  }

  function hold(id) {
    setDice(oldDice => oldDice.map(die =>
      die.id === id ? { ...die, isHeld: !die.isHeld } : die
    ))
  }

  const diceElements = dice.map(dieObj => (
    <Die key={dieObj.id} value={dieObj.value} isHeld={dieObj.isHeld} hold={() => hold(dieObj.id)} />
  ))

  return (
    <main>
      <div aria-live="polite" className="sr-only">
        {gameWon && <p>Congratulations! You won! Press "New Game" to start again.</p>}
      </div>
      <h1 className="title">Tenzies</h1>
      <p className="instructions">Roll until all dice are the same. Click each die to freeze it at its current value between rolls.</p>
      <div className="dice-container">{diceElements}</div>
      <button ref={buttonRef} className="roll-dice" onClick={rollDice}>
        {gameWon ? "New Game" : "Roll"}
      </button>
    </main>
  )
}
`,
      "Die.jsx": `export default function Die({ value, isHeld, hold }) {
  return (
    <button
      className="die"
      style={{ backgroundColor: isHeld ? "#59E391" : "white" }}
      onClick={hold}
      aria-pressed={isHeld}
      aria-label={"Die with value " + value + ", " + (isHeld ? "held" : "not held")}
    >{value}</button>
  )
}
`,
    }, tests: [
      { msg: "Shows 10 dice with values from 1 to 6", fn: async (h) => { const d = h.$$("button.die"); return d.length === 10 && d.every((b) => /^[1-6]$/.test(b.textContent.trim())); } },
      { msg: "Clicking a die holds it (green background, aria-pressed)", fn: async (h) => { await h.click(h.$$("button.die")[2]); const b = h.$$("button.die")[2]; const ok = b.getAttribute("aria-pressed") === "true" && b.style.backgroundColor === "rgb(89, 227, 145)"; await h.click(h.$$("button.die")[2]); return ok && h.$$("button.die")[2].getAttribute("aria-pressed") !== "true"; } },
      { msg: "Roll keeps held dice and re-rolls the rest", fn: async (h) => {
        await h.click(h.$$("button.die")[0]);
        const held = h.$$("button.die")[0].textContent;
        const before = h.$$("button.die").slice(1).map((b) => b.textContent).join();
        let changed = false;
        for (let i = 0; i < 6; i++) { await h.click(h.button("Roll")); if (h.$$("button.die")[0].textContent !== held) return false; if (h.$$("button.die").slice(1).map((b) => b.textContent).join() !== before) changed = true; }
        return changed && h.$$("button.die")[0].getAttribute("aria-pressed") === "true";
      } },
      { msg: "All held with the same value → the button says “New Game” and gets focus", fn: async (h) => {
        Math.random = () => 0.5;
        await h.click(h.button("Roll"));
        for (const b of h.$$("button.die")) await h.click(b);
        const btn = await h.until(() => h.button("New Game"));
        await h.tick(60);
        return !!btn && document.activeElement === btn;
      } },
      { msg: "New Game starts a fresh, un-held game", fn: async (h) => {
        Math.random = () => 0.5;
        await h.click(h.button("Roll"));
        for (const b of h.$$("button.die")) await h.click(b);
        await h.until(() => h.button("New Game"));
        await h.click(h.button("New Game"));
        return !!h.button("Roll") && h.$$("button.die").length === 10 && h.$$("button.die").every((b) => b.getAttribute("aria-pressed") !== "true");
      } },
      { msg: "Dice state is initialised lazily", fn: async (h) => /useState\(\s*\(\)\s*=>/.test(h.src("App.jsx")) },
    ] },
    { t: "recap", items: ["Arrays of objects in state, updated with <code>.map()</code> and spread", "Derive values like <code>gameWon</code> instead of storing them", "Lazy initial state: <code>useState(() => fn())</code>", "<code>useRef</code> + <code>useEffect</code> to move focus", "<code>aria-pressed</code>, <code>aria-label</code> and live regions make a game playable with a screen reader"] },
  ]},

  /* ───────────────────────── Assembly: Endgame ───────────────────────── */
  { id: "rx-assembly", title: "Capstone Project #2 - Assembly Endgame", min: 120, kind: "project", body: [
    { t: "p", h: "A hangman-style word game with a programming twist: guess the word in under 8 attempts to keep the programming world safe from Assembly. Each wrong guess wipes out one language. When only Assembly is left, you've lost." },
    { t: "h", h: "Project planning" },
    { t: "steps", items: [
      "<b>What state do we need?</b> Only two values: the <code>currentWord</code> and the <code>guessedLetters</code> array",
      "<b>What can be derived?</b> Wrong guess count, won, lost, game over, which language just died, which letters to show",
      "<b>Components</b>: header, status box, language chips, word, keyboard, new game button",
    ] },
    { t: "diagram", name: "assembly-state" },
    { t: "h", h: "Saving the guessed letters" },
    { t: "code", lang: "jsx", code: `const [currentWord, setCurrentWord] = useState(() => getRandomWord())
const [guessedLetters, setGuessedLetters] = useState([])

function addGuessedLetter(letter) {
  setGuessedLetters(prev => prev.includes(letter) ? prev : [...prev, letter])
}` },
    { t: "h", h: "Derived values" },
    { t: "code", lang: "jsx", code: `const numGuessesLeft = languages.length - 1
const wrongGuessCount = guessedLetters.filter(letter => !currentWord.includes(letter)).length
const isGameWon = currentWord.split("").every(letter => guessedLetters.includes(letter))
const isGameLost = wrongGuessCount >= numGuessesLeft
const isGameOver = isGameWon || isGameLost
const lastGuessedLetter = guessedLetters[guessedLetters.length - 1]
const isLastGuessIncorrect = lastGuessedLetter && !currentWord.includes(lastGuessedLetter)` },
    { t: "jsch", fn: "getGameState", prompt: "Write a pure function <code>getGameState(word, guessedLetters, maxWrong)</code> that returns <code>{ wrongGuessCount, isGameWon, isGameLost }</code>.", starter: `function getGameState(word, guessedLetters, maxWrong) {

}`, solution: `function getGameState(word, guessedLetters, maxWrong) {
  const wrongGuessCount = guessedLetters.filter(l => !word.includes(l)).length
  const isGameWon = word.split("").every(l => guessedLetters.includes(l))
  const isGameLost = wrongGuessCount >= maxWrong
  return { wrongGuessCount, isGameWon, isGameLost }
}`, tests: [
      { msg: "Counts only wrong guesses", fn: (f) => f("react", ["r", "z", "e", "q"], 8).wrongGuessCount === 2 },
      { msg: "Won when every letter of the word is guessed (repeated letters count once)", fn: (f) => f("hello", ["h", "e", "l", "o"], 8).isGameWon === true && f("hello", ["h", "e", "l"], 8).isGameWon === false },
      { msg: "Lost when wrong guesses reach the limit", fn: (f) => f("ab", ["c", "d", "e"], 3).isGameLost === true && f("ab", ["c", "d"], 3).isGameLost === false },
      { msg: "A fresh game is neither won nor lost", fn: (f) => { const s = f("code", [], 8); return s.wrongGuessCount === 0 && !s.isGameWon && !s.isGameLost; } },
    ] },
    { t: "quiz", q: "Why isn't <code>wrongGuessCount</code> stored with its own <code>useState</code>?", opts: ["Hooks can't hold numbers", "It can be calculated from currentWord and guessedLetters, so storing it would create a second source of truth", "It changes too often"], a: 1, why: "Anything you can compute from existing state should be computed during render. It can never drift out of sync." },
    { t: "h", h: "Styling keys and chips with class names" },
    { t: "p", h: "Each key needs a class depending on whether it was guessed and whether it's in the word. Chaining ternaries gets messy fast, so most projects use the tiny <code>clsx</code> package: <code>clsx({ correct: isCorrect, wrong: isWrong })</code> returns <code>\"correct\"</code>, <code>\"wrong\"</code> or <code>\"\"</code>. It's a one-liner to write yourself:" },
    { t: "code", lang: "javascript", code: `// npm install clsx  →  import { clsx } from "clsx"
// or roll your own:
const clsx = (...args) => args.flatMap(a =>
  typeof a === "object" && a ? Object.keys(a).filter(k => a[k]) : a ? [a] : []
).join(" ")

clsx("chip", { lost: true })   // "chip lost"` },
    { t: "h", h: "Conditional rendering with a helper function" },
    { t: "p", h: "The status box has four looks: playing (empty), farewell to a language after a wrong guess, won, and lost. Rather than nesting ternaries in JSX, put the decision in a function that returns the right JSX, and call it: <code>{renderGameStatus()}</code>." },
    { t: "h", h: "Accessibility" },
    { t: "steps", items: [
      "Give the status box <code>aria-live=\"polite\"</code> and <code>role=\"status\"</code> so updates are read out",
      "Add a visually hidden live region that announces each guess and how many attempts are left",
      "Use <code>disabled</code> plus <code>aria-disabled</code> on the keyboard when the game is over, and an <code>aria-label</code> like \"Letter a\" on each key",
      "Hidden letters in the word are empty for sighted users; in the live region, read the word as \"r, blank, a, blank, blank\"",
    ] },
    { t: "rch", prompt: "Make Assembly: Endgame playable. Save guesses in state; reveal correctly guessed letters (and every letter, in class <code>missed-letter</code>, when lost); give keys the class <code>correct</code> or <code>wrong</code>; mark one more language chip <code>lost</code> per wrong guess; show <b>“You win!”</b> or <b>“Game over!”</b> in the status; disable the keyboard when the game is over, and show a <b>New Game</b> button that resets everything.", files: {
      "App.jsx": `import { useState } from "react"
import { languages } from "./languages"
import { getRandomWord } from "./utils"

export default function App() {
  const [currentWord, setCurrentWord] = useState(() => getRandomWord())

  const alphabet = "abcdefghijklmnopqrstuvwxyz"

  const languageElements = languages.map(lang => (
    <span className="chip" key={lang.name} style={{ backgroundColor: lang.backgroundColor, color: lang.color }}>
      {lang.name}
    </span>
  ))

  const letterElements = currentWord.split("").map((letter, index) => (
    <span key={index}>{letter}</span>
  ))

  const keyboardElements = alphabet.split("").map(letter => (
    <button key={letter} aria-label={"Letter " + letter}>{letter}</button>
  ))

  return (
    <main>
      <header>
        <h1>Assembly: Endgame</h1>
        <p>Guess the word within 8 attempts to keep the programming world safe from Assembly!</p>
      </header>
      <section aria-live="polite" role="status" className="game-status"></section>
      <section className="language-chips">{languageElements}</section>
      <section className="word">{letterElements}</section>
      <section className="keyboard">{keyboardElements}</section>
    </main>
  )
}
`,
      "utils.js": UTILS,
      "languages.js": LANGUAGES,
      "words.js": WORDS,
      "index.css": ASSEMBLY_CSS,
    }, solution: {
      "App.jsx": `import { useState } from "react"
import { languages } from "./languages"
import { getRandomWord, getFarewellText } from "./utils"

export default function App() {
  const [currentWord, setCurrentWord] = useState(() => getRandomWord())
  const [guessedLetters, setGuessedLetters] = useState([])

  const numGuessesLeft = languages.length - 1
  const wrongGuessCount = guessedLetters.filter(letter => !currentWord.includes(letter)).length
  const isGameWon = currentWord.split("").every(letter => guessedLetters.includes(letter))
  const isGameLost = wrongGuessCount >= numGuessesLeft
  const isGameOver = isGameWon || isGameLost
  const lastGuessedLetter = guessedLetters[guessedLetters.length - 1]
  const isLastGuessIncorrect = lastGuessedLetter && !currentWord.includes(lastGuessedLetter)

  const alphabet = "abcdefghijklmnopqrstuvwxyz"

  function addGuessedLetter(letter) {
    setGuessedLetters(prev => prev.includes(letter) ? prev : [...prev, letter])
  }

  function startNewGame() {
    setCurrentWord(getRandomWord())
    setGuessedLetters([])
  }

  const languageElements = languages.map((lang, index) => (
    <span
      className={"chip" + (index < wrongGuessCount ? " lost" : "")}
      key={lang.name}
      style={{ backgroundColor: lang.backgroundColor, color: lang.color }}
    >{lang.name}</span>
  ))

  const letterElements = currentWord.split("").map((letter, index) => {
    const shouldReveal = isGameLost || guessedLetters.includes(letter)
    const missed = isGameLost && !guessedLetters.includes(letter)
    return <span key={index} className={missed ? "missed-letter" : undefined}>{shouldReveal ? letter : ""}</span>
  })

  const keyboardElements = alphabet.split("").map(letter => {
    const isGuessed = guessedLetters.includes(letter)
    const isCorrect = isGuessed && currentWord.includes(letter)
    const isWrong = isGuessed && !currentWord.includes(letter)
    return (
      <button
        key={letter}
        className={isCorrect ? "correct" : isWrong ? "wrong" : undefined}
        disabled={isGameOver}
        aria-disabled={guessedLetters.includes(letter)}
        aria-label={"Letter " + letter}
        onClick={() => addGuessedLetter(letter)}
      >{letter}</button>
    )
  })

  function renderGameStatus() {
    if (!isGameOver && isLastGuessIncorrect) {
      return <p className="farewell-message">{getFarewellText(languages[wrongGuessCount - 1].name)}</p>
    }
    if (isGameWon) return <><h2>You win!</h2><p>Well done! 🎉</p></>
    if (isGameLost) return <><h2>Game over!</h2><p>You lose! Better start learning Assembly 😭</p></>
    return null
  }

  const statusClass = "game-status" + (isGameWon ? " won" : isGameLost ? " lost" : !isGameOver && isLastGuessIncorrect ? " farewell" : "")

  return (
    <main>
      <header>
        <h1>Assembly: Endgame</h1>
        <p>Guess the word within 8 attempts to keep the programming world safe from Assembly!</p>
      </header>
      <section aria-live="polite" role="status" className={statusClass}>{renderGameStatus()}</section>
      <section className="language-chips">{languageElements}</section>
      <section className="word">{letterElements}</section>
      <section className="sr-only" aria-live="polite" role="status">
        <p>
          {currentWord.includes(lastGuessedLetter)
            ? "Correct! The letter " + lastGuessedLetter + " is in the word."
            : lastGuessedLetter ? "Sorry, the letter " + lastGuessedLetter + " is not in the word." : ""}
          {" You have " + (numGuessesLeft - wrongGuessCount) + " attempts left."}
        </p>
        <p>Current word: {currentWord.split("").map(l => guessedLetters.includes(l) ? l + "." : "blank.").join(" ")}</p>
      </section>
      <section className="keyboard">{keyboardElements}</section>
      {isGameOver && <button className="new-game" onClick={startNewGame}>New Game</button>}
    </main>
  )
}
`,
    }, tests: [
      { msg: "The keyboard has 26 letters and the word is hidden at the start", fn: async (h) => { Math.random = () => 0; await h.remount(); return h.$$(".keyboard button").length === 26 && h.$$(".word span").length === 5 && h.$$(".word span").every((s) => s.textContent.trim() === ""); } },
      { msg: "A correct guess reveals that letter and turns the key green", fn: async (h) => {
        Math.random = () => 0; await h.remount();
        const key = (l) => h.$$(".keyboard button").find((b) => b.textContent.trim().toLowerCase() === l);
        await h.click(key("r"));
        const s = h.$$(".word span").map((x) => x.textContent.trim().toLowerCase());
        return s[0] === "r" && s[1] === "" && key("r").classList.contains("correct");
      } },
      { msg: "A wrong guess turns the key red and marks a language as lost", fn: async (h) => {
        Math.random = () => 0; await h.remount();
        const key = (l) => h.$$(".keyboard button").find((b) => b.textContent.trim().toLowerCase() === l);
        await h.click(key("z"));
        return key("z").classList.contains("wrong") && h.$$(".language-chips .lost").length === 1;
      } },
      { msg: "Guessing the whole word shows “You win!”", fn: async (h) => {
        Math.random = () => 0; await h.remount();
        const key = (l) => h.$$(".keyboard button").find((b) => b.textContent.trim().toLowerCase() === l);
        for (const l of ["r", "e", "a", "c", "t"]) await h.click(key(l));
        return /you win/i.test(h.text(".game-status"));
      } },
      { msg: "8 wrong guesses: “Game over!”, the word is revealed and the keyboard is disabled", fn: async (h) => {
        Math.random = () => 0; await h.remount();
        const key = (l) => h.$$(".keyboard button").find((b) => b.textContent.trim().toLowerCase() === l);
        await h.click(key("r"));
        for (const l of ["b", "d", "f", "g", "h", "i", "j", "k"]) await h.click(key(l));
        const word = h.$$(".word span").map((x) => x.textContent.trim().toLowerCase()).join("");
        return /game over/i.test(h.text(".game-status")) && word === "react" && h.$$(".word .missed-letter").length === 4 && h.$$(".keyboard button").every((b) => b.disabled);
      } },
      { msg: "New Game resets the guesses", fn: async (h) => {
        Math.random = () => 0; await h.remount();
        const key = (l) => h.$$(".keyboard button").find((b) => b.textContent.trim().toLowerCase() === l);
        for (const l of ["r", "e", "a", "c", "t"]) await h.click(key(l));
        await h.click(h.button("New Game"));
        return h.$$(".keyboard .correct, .keyboard .wrong").length === 0 && h.$$(".language-chips .lost").length === 0 && !h.button("New Game");
      } },
    ] },
    { t: "h", h: "Backlog: ideas to try next" },
    { t: "steps", items: ["Confetti when you win (the <code>react-confetti</code> package)", "Physical keyboard support with a <code>keydown</code> listener in an effect (remember the cleanup!)", "A hint button that costs one language", "Difficulty levels with longer words"] },
    { t: "recap", items: ["Store the minimum state; derive everything else", "Helper functions keep complex conditional JSX readable", "<code>clsx</code> (or a tiny helper) for conditional class names", "Live regions and labels make games accessible", "Reset a game by resetting its state"] },
  ]},

  /* ───────────────────────── Quiz app ───────────────────────── */
  { id: "rx-quiz", title: "Solo Project - Quiz App", min: 90, kind: "project", body: [
    { t: "p", h: "Your final solo project in this module: a trivia quiz. It combines everything: a start screen, fetching questions when the quiz starts, state for answers, conditional rendering, and a results screen." },
    { t: "h", h: "The spec" },
    { t: "steps", items: [
      "A start screen with a title and a <b>Start quiz</b> button",
      "Fetch 5 questions from <code>" + API + "/trivia?amount=5</code> (it mirrors the Open Trivia Database response)",
      "Questions and answers contain HTML entities like <code>&amp;quot;</code>: decode them before showing them",
      "Shuffle the correct answer in with the incorrect ones <b>once</b>, when the data arrives, not on every render",
      "Each question is a <code>.question</code> with its answers as buttons; clicking one selects it (class <code>selected</code>), one per question",
      "<b>Check answers</b> marks every correct answer <code>correct</code> and wrong picks <code>incorrect</code>, and shows “You scored X/5 correct answers”",
      "<b>Play again</b> fetches a new set of questions",
    ] },
    { t: "callout", kind: "tip", h: "Decoding entities: in a real project use the <code>he</code> package. In the browser you can let the HTML parser do it: <code>new DOMParser().parseFromString(text, \"text/html\").documentElement.textContent</code>." },
    { t: "callout", kind: "warn", h: "If you shuffle inside the JSX, every click re-renders and the answers jump around. Store the shuffled answers in state along with each question." },
    { t: "rch", api: true, prompt: "Build the quiz app to the spec above.", files: {
      "App.jsx": `import { useState } from "react"

export default function App() {
  return (
    <main>
      <section className="start">
        <h1>Quizzical</h1>
        <p>Five questions. How many can you get right?</p>
        <button className="btn">Start quiz</button>
      </section>
    </main>
  )
}
`,
      "index.css": QUIZ_CSS,
    }, solution: {
      "App.jsx": `import { useState } from "react"

const decode = (text) => new DOMParser().parseFromString(text, "text/html").documentElement.textContent

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function App() {
  const [questions, setQuestions] = useState([])
  const [started, setStarted] = useState(false)
  const [checked, setChecked] = useState(false)
  const [loading, setLoading] = useState(false)

  async function loadQuestions() {
    setLoading(true)
    setChecked(false)
    const res = await fetch("${API}/trivia?amount=5")
    const data = await res.json()
    setQuestions(data.results.map((q, i) => ({
      id: i,
      question: decode(q.question),
      correct: decode(q.correct_answer),
      answers: shuffle([q.correct_answer, ...q.incorrect_answers].map(decode)),
      selected: null,
    })))
    setLoading(false)
  }

  function start() {
    setStarted(true)
    loadQuestions()
  }

  function select(id, answer) {
    if (checked) return
    setQuestions(prev => prev.map(q => q.id === id ? { ...q, selected: answer } : q))
  }

  const score = questions.filter(q => q.selected === q.correct).length

  if (!started) {
    return (
      <main>
        <section className="start">
          <h1>Quizzical</h1>
          <p>Five questions. How many can you get right?</p>
          <button className="btn" onClick={start}>Start quiz</button>
        </section>
      </main>
    )
  }

  if (loading) return <main><p className="loading">Loading questions…</p></main>

  return (
    <main>
      {questions.map(q => (
        <section className="question" key={q.id}>
          <h2>{q.question}</h2>
          <div className="answers">
            {q.answers.map(answer => {
              let cls = ""
              if (checked && answer === q.correct) cls = "correct"
              else if (checked && answer === q.selected) cls = "incorrect"
              else if (answer === q.selected) cls = "selected"
              return (
                <button key={answer} className={cls || undefined} aria-pressed={answer === q.selected}
                  disabled={checked} onClick={() => select(q.id, answer)}>{answer}</button>
              )
            })}
          </div>
        </section>
      ))}
      <div className="footer">
        {checked && <p>You scored {score}/{questions.length} correct answers</p>}
        {checked
          ? <button className="btn" onClick={loadQuestions}>Play again</button>
          : <button className="btn" onClick={() => setChecked(true)}>Check answers</button>}
      </div>
    </main>
  )
}
`,
    }, tests: [
      { msg: "Starts on a start screen, without fetching", fn: async (h) => !!h.button("Start quiz") && h.$$(".question").length === 0 && h.fetches.length === 0 },
      { msg: "Start quiz fetches and shows 5 questions with their answers", fn: async (h) => { await h.click(h.button("Start quiz")); const ok = await h.until(() => h.$$(".question").length === 5); return !!ok && h.$$(".question").every((q) => [2, 4].includes(q.querySelectorAll("button").length)); } },
      { msg: "HTML entities are decoded", fn: async (h) => { await h.click(h.button("Start quiz")); const ok = await h.until(() => h.$$(".question").length === 5); return !!ok && !/&(quot|#0?39|amp|lt|gt);/.test(h.text("main")); } },
      { msg: "Selecting an answer marks it (one per question) and the order doesn't change", fn: async (h) => {
        await h.click(h.button("Start quiz")); await h.until(() => h.$$(".question").length === 5);
        const q = () => h.$$(".question")[0];
        const order = [...q().querySelectorAll("button")].map((b) => b.textContent).join("|");
        await h.click(q().querySelectorAll("button")[0]); await h.click(q().querySelectorAll("button")[1]);
        const sel = q().querySelectorAll("button.selected");
        return [...q().querySelectorAll("button")].map((b) => b.textContent).join("|") === order && sel.length === 1 && sel[0] === q().querySelectorAll("button")[1];
      } },
      { msg: "Check answers shows the score and marks the 5 correct answers", fn: async (h) => {
        await h.click(h.button("Start quiz")); await h.until(() => h.$$(".question").length === 5);
        for (const q of h.$$(".question")) await h.click(q.querySelector("button"));
        await h.click(h.button("Check answers"));
        return /You scored [0-5]\/5 correct answers/.test(h.text()) && h.$$(".question button.correct").length === 5;
      } },
      { msg: "Play again loads a new set of questions", fn: async (h) => {
        await h.click(h.button("Start quiz")); await h.until(() => h.$$(".question").length === 5);
        await h.click(h.button("Check answers")); await h.click(h.button("Play again"));
        await h.until(() => h.$$(".question").length === 5 && !!h.button("Check answers"));
        return h.fetches.filter((u) => /trivia/.test(u)).length === 2 && !/You scored/.test(h.text());
      } },
    ] },
    { t: "recap", items: ["Fetch in response to an event (Start) or in an effect (on mount)", "Transform API data once, when it arrives: decode, shuffle, add ids", "Keep selection in state alongside each question", "Derive the score; don't store it"] },
  ]},

  /* ───────────────────────── Outro ───────────────────────── */
  { id: "rx-outro", title: "Module Outro", min: 8, kind: "lesson", body: [
    { t: "p", h: "You can now build real React apps: split a design into components, drive them with data and props, make them interactive with state and forms, sync with APIs through effects, and make them accessible. That's the core of React that every job listing asks for." },
    { t: "h", h: "The mental model to keep" },
    { t: "steps", items: [
      "<b>UI = f(state)</b>: components are functions from props and state to JSX",
      "<b>Data flows down</b> as props; <b>changes flow up</b> through function props",
      "<b>Store the minimum</b> in state and derive the rest during render",
      "<b>Never mutate</b> state: create new arrays and objects",
      "<b>Effects</b> are for syncing with things outside React, with cleanup",
    ] },
    { t: "quiz", q: "A component shows <code>fullName</code> built from <code>firstName</code> and <code>lastName</code> state. Where should <code>fullName</code> live?", opts: ["In its own useState, updated by an effect", "Computed during render: const fullName = firstName + \" \" + lastName", "In a ref"], a: 1, why: "It's derived data. Computing it during render keeps it in sync automatically and avoids an extra render." },
    { t: "quiz", q: "Which hook would you use to focus an input after a form is submitted?", opts: ["useState", "useRef (with an effect or the event handler)", "useMemo"], a: 1, why: "Refs give you the DOM node. Call <code>inputRef.current.focus()</code> in the handler, or in an effect when a value changes." },
    { t: "h", h: "What's next" },
    { t: "p", h: "<b>Testing</b> teaches you to prove your components work. <b>Advanced React</b> covers custom hooks, context, performance, routing and more. <b>TypeScript</b> adds types to your props and state. And <b>Next.js</b> takes React to the server. Keep building: the best way to remember React is to make something you'll use." },
    { t: "recap", items: ["Components, JSX and props", "State, events and forms", "Effects, refs and data fetching", "Two capstone games and two solo projects shipped"] },
  ]},
];
