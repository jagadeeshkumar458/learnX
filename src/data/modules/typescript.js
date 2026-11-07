/* Module — TypeScript. Lesson titles match the syllabus.
   tsplay/tsch blocks type-check with the real TypeScript 6 compiler in strict mode (src/lib/tsCheck.js).
   tsch tests can probe types: t.compiles(code) / t.fails(code) append code to the file and re-check. */

/* ───────── Pizza restaurant ───────── */
const PIZZA_JS = `const menu = [
  { name: "Margherita", price: 8 },
  { name: "Pepperoni", price: 10 },
  { name: "Hawaiian", price: 10 },
  { name: "Veggie", price: 9 },
]

let cashInRegister = 100
let nextOrderId = 1
const orderQueue = []

function addNewPizza(pizzaObj) {
  menu.push(pizzaObj)
}

function placeOrder(pizzaName) {
  const selectedPizza = menu.find((pizzaObj) => pizzaObj.name === pizzaName)
  cashInRegister += selectedPizza.price
  const newOrder = { id: nextOrderId++, pizza: selectedPizza, status: "ordered" }
  orderQueue.push(newOrder)
  return newOrder
}

addNewPizza({ name: "Chicken Bacon Ranch", cost: 12 })
placeOrder("Chicken Bacon Ranch")
placeOrder("Anchovy")   // not on the menu!
console.log("Cash in register:", cashInRegister)
`;

const PIZZA_START = `export const menu = [
  { id: 1, name: "Margherita", price: 8 },
  { id: 2, name: "Pepperoni", price: 10 },
  { id: 3, name: "Hawaiian", price: 10 },
  { id: 4, name: "Veggie", price: 9 },
]

export let cashInRegister = 100
let nextOrderId = 1
export const orderQueue = []

export function placeOrder(pizzaName) {
  const selectedPizza = menu.find((pizzaObj) => pizzaObj.name === pizzaName)
  cashInRegister += selectedPizza.price
  const newOrder = { id: nextOrderId++, pizza: selectedPizza, status: "ordered" }
  orderQueue.push(newOrder)
  return newOrder
}

export function completeOrder(orderId) {
  const order = orderQueue.find((order) => order.id === orderId)
  order.status = "completed"
  return order
}
`;
const PIZZA_TYPES = `export type Pizza = {
  id: number
  name: string
  price: number
}

export type Order = {
  id: number
  pizza: Pizza
  status: "ordered" | "completed"
}

export const menu: Pizza[] = [
  { id: 1, name: "Margherita", price: 8 },
  { id: 2, name: "Pepperoni", price: 10 },
  { id: 3, name: "Hawaiian", price: 10 },
  { id: 4, name: "Veggie", price: 9 },
]

export let cashInRegister = 100
let nextOrderId = 1
export const orderQueue: Order[] = []

export function placeOrder(pizzaName: string): Order | undefined {
  const selectedPizza = menu.find((pizzaObj) => pizzaObj.name === pizzaName)
  if (!selectedPizza) {
    console.error(\`\${pizzaName} does not exist in the menu\`)
    return
  }
  cashInRegister += selectedPizza.price
  const newOrder: Order = { id: nextOrderId++, pizza: selectedPizza, status: "ordered" }
  orderQueue.push(newOrder)
  return newOrder
}

export function completeOrder(orderId: number): Order | undefined {
  const order = orderQueue.find((order) => order.id === orderId)
  if (!order) {
    console.error(\`\${orderId} was not found in the orderQueue\`)
    return
  }
  order.status = "completed"
  return order
}
`;
const NARROW_START = PIZZA_TYPES + `
export function getPizzaDetail(identifier) {
  // a string looks up by name (case-insensitive), a number by id
}
`;
const NARROW_DONE = PIZZA_TYPES + `
export function getPizzaDetail(identifier: string | number): Pizza | undefined {
  if (typeof identifier === "string") {
    return menu.find((pizza) => pizza.name.toLowerCase() === identifier.toLowerCase())
  } else {
    return menu.find((pizza) => pizza.id === identifier)
  }
}
`;
const UTIL_START = PIZZA_TYPES.replace(`export let cashInRegister = 100
let nextOrderId = 1`, `export let cashInRegister = 100
let nextOrderId = 1
let nextPizzaId = 5`) + `
export function addNewPizza(pizzaObj) {
  // give the pizza the next id automatically, add it to the menu and return it
}

export type User = {
  id: number
  username: string
  role: "member" | "contributor" | "admin"
}

export const users: User[] = [
  { id: 1, username: "john_doe", role: "member" },
  { id: 2, username: "jane_doe", role: "admin" },
]

export function updateUser(id, updates) {
  // find the user by id and apply only the properties in updates
}
`;
const UTIL_DONE = PIZZA_TYPES.replace(`export let cashInRegister = 100
let nextOrderId = 1`, `export let cashInRegister = 100
let nextOrderId = 1
let nextPizzaId = 5`) + `
export function addNewPizza(pizzaObj: Omit<Pizza, "id">): Pizza {
  const newPizza: Pizza = { id: nextPizzaId++, ...pizzaObj }
  menu.push(newPizza)
  return newPizza
}

export type User = {
  id: number
  username: string
  role: "member" | "contributor" | "admin"
}

export const users: User[] = [
  { id: 1, username: "john_doe", role: "member" },
  { id: 2, username: "jane_doe", role: "admin" },
]

export function updateUser(id: number, updates: Partial<Omit<User, "id">>): User | undefined {
  const user = users.find((user) => user.id === id)
  if (!user) return
  Object.assign(user, updates)
  return user
}
`;
const GENERIC_START = PIZZA_TYPES + `
// Write ONE function that adds an item to any typed array and returns the array.
// The type of the item must match the type of the array's items.
export function addToArray(array, item) {
  array.push(item)
  return array
}
`;
const GENERIC_DONE = PIZZA_TYPES + `
export function addToArray<T>(array: T[], item: T): T[] {
  array.push(item)
  return array
}
`;

/* ───────── React + TS ───────── */
const ASSEMBLY_CSS = `body { font-family: Hanken Grotesk, system-ui, sans-serif; background: #262626; color: #d9d9d9; padding: 20px; display: grid; justify-items: center; gap: 16px; }
.word { display: flex; gap: 3px; }
.word span { width: 36px; height: 36px; display: grid; place-items: center; background: #323232; border-bottom: 2px solid #f9f4da; font-size: 1.1rem; font-weight: 700; text-transform: uppercase; }
.word span.missed { color: #ec5d49; }
.status { min-height: 52px; padding: 8px 16px; border-radius: 6px; text-align: center; }
.status.won { background: #10a95b; } .status.lost { background: #ba2a2a; }
.keyboard { display: flex; flex-wrap: wrap; gap: 6px; max-width: 460px; justify-content: center; }
.keyboard button { width: 36px; height: 36px; border-radius: 4px; border: 1px solid #d7d7d7; background: #fcba29; font-weight: 700; cursor: pointer; text-transform: uppercase; }
.keyboard button.correct { background: #10a95b; } .keyboard button.wrong { background: #ec5d49; }
.keyboard button:disabled { cursor: not-allowed; opacity: .5; }`;
const WORD_LETTERS_START = `export default function WordLetters({ currentWord, guessedLetters, isGameLost }) {
  return (
    <section className="word">
      {currentWord.split("").map((letter, index) => {
        const shouldReveal = isGameLost || guessedLetters.includes(letter)
        return (
          <span key={index} className={isGameLost && !guessedLetters.includes(letter) ? "missed" : ""}>
            {shouldReveal ? letter : ""}
          </span>
        )
      })}
    </section>
  )
}
`;
const WORD_LETTERS_DONE = `type WordLettersProps = {
  currentWord: string
  guessedLetters: string[]
  isGameLost: boolean
}

export default function WordLetters({ currentWord, guessedLetters, isGameLost }: WordLettersProps) {
  return (
    <section className="word">
      {currentWord.split("").map((letter, index) => {
        const shouldReveal = isGameLost || guessedLetters.includes(letter)
        return (
          <span key={index} className={isGameLost && !guessedLetters.includes(letter) ? "missed" : ""}>
            {shouldReveal ? letter : ""}
          </span>
        )
      })}
    </section>
  )
}
`;
const STATUS_START = `export default function AriaLiveStatus({ isGameWon, isGameLost, lastGuess, isLastGuessIncorrect }) {
  if (!isGameWon && !isGameLost && !lastGuess) return null
  const message = isGameWon ? "You win! Well done! 🎉" : isGameLost ? "Game over! Better start learning Assembly 😭" :
    isLastGuessIncorrect ? \`Sorry, the letter \${lastGuess} is not in the word.\` : \`Correct! The letter \${lastGuess} is in the word.\`
  return (
    <section className={"status" + (isGameWon ? " won" : isGameLost ? " lost" : "")} aria-live="polite" role="status">
      <p>{message}</p>
    </section>
  )
}
`;
const STATUS_DONE = `type AriaLiveStatusProps = {
  isGameWon: boolean
  isGameLost: boolean
  lastGuess: string | undefined
  isLastGuessIncorrect: boolean
}

export default function AriaLiveStatus({ isGameWon, isGameLost, lastGuess, isLastGuessIncorrect }: AriaLiveStatusProps) {
  if (!isGameWon && !isGameLost && !lastGuess) return null
  const message = isGameWon ? "You win! Well done! 🎉" : isGameLost ? "Game over! Better start learning Assembly 😭" :
    isLastGuessIncorrect ? \`Sorry, the letter \${lastGuess} is not in the word.\` : \`Correct! The letter \${lastGuess} is in the word.\`
  return (
    <section className={"status" + (isGameWon ? " won" : isGameLost ? " lost" : "")} aria-live="polite" role="status">
      <p>{message}</p>
    </section>
  )
}
`;
const KEYBOARD_START = `export default function Keyboard({ guessedLetters, currentWord, disabled, onGuess }) {
  const alphabet = "abcdefghijklmnopqrstuvwxyz"
  return (
    <section className="keyboard">
      {alphabet.split("").map((letter) => {
        const isGuessed = guessedLetters.includes(letter)
        const className = isGuessed ? (currentWord.includes(letter) ? "correct" : "wrong") : ""
        return (
          <button key={letter} className={className} disabled={disabled} aria-disabled={isGuessed} aria-label={\`Letter \${letter}\`} onClick={() => onGuess(letter)}>
            {letter}
          </button>
        )
      })}
    </section>
  )
}
`;
const KEYBOARD_DONE = `type KeyboardProps = {
  guessedLetters: string[]
  currentWord: string
  disabled: boolean
  onGuess: (letter: string) => void
}

export default function Keyboard({ guessedLetters, currentWord, disabled, onGuess }: KeyboardProps) {
  const alphabet = "abcdefghijklmnopqrstuvwxyz"
  return (
    <section className="keyboard">
      {alphabet.split("").map((letter) => {
        const isGuessed = guessedLetters.includes(letter)
        const className = isGuessed ? (currentWord.includes(letter) ? "correct" : "wrong") : ""
        return (
          <button key={letter} className={className} disabled={disabled} aria-disabled={isGuessed} aria-label={\`Letter \${letter}\`} onClick={() => onGuess(letter)}>
            {letter}
          </button>
        )
      })}
    </section>
  )
}
`;
const ASSEMBLY_APP_START = `import { useState } from "react"
import WordLetters from "./WordLetters"
import AriaLiveStatus from "./AriaLiveStatus"
import Keyboard from "./Keyboard"
import { getRandomWord } from "./utils"

export default function App() {
  const [currentWord, setCurrentWord] = useState(() => getRandomWord())
  const [guessedLetters, setGuessedLetters] = useState([])

  const wrongGuessCount = guessedLetters.filter((letter) => !currentWord.includes(letter)).length
  const isGameWon = currentWord.split("").every((letter) => guessedLetters.includes(letter))
  const isGameLost = wrongGuessCount >= 8
  const lastGuess = guessedLetters[guessedLetters.length - 1]
  const isLastGuessIncorrect = !!lastGuess && !currentWord.includes(lastGuess)

  function addGuessedLetter(letter) {
    setGuessedLetters((prev) => (prev.includes(letter) ? prev : [...prev, letter]))
  }

  return (
    <main>
      <h1>Assembly: Endgame</h1>
      <AriaLiveStatus isGameWon={isGameWon} isGameLost={isGameLost} lastGuess={lastGuess} isLastGuessIncorrect={isLastGuessIncorrect} />
      <WordLetters currentWord={currentWord} guessedLetters={guessedLetters} isGameLost={isGameLost} />
      <Keyboard guessedLetters={guessedLetters} currentWord={currentWord} disabled={isGameWon || isGameLost} onGuess={addGuessedLetter} />
      <p className="remaining">Wrong guesses left: {8 - wrongGuessCount}</p>
    </main>
  )
}
`;
const ASSEMBLY_APP_DONE = ASSEMBLY_APP_START
  .replace("useState([])", "useState<string[]>([])")
  .replace("function addGuessedLetter(letter) {", "function addGuessedLetter(letter: string): void {");
const UTILS_TS_START = `const words = ["react", "props", "state", "hooks", "types", "async", "array"]

export function getRandomIndex(length) {
  return Math.floor(Math.random() * length)
}

export function getRandomWord() {
  return words[getRandomIndex(words.length)]
}
`;
const UTILS_TS_DONE = `const words: string[] = ["react", "props", "state", "hooks", "types", "async", "array"]

export function getRandomIndex(length: number): number {
  return Math.floor(Math.random() * length)
}

export function getRandomWord(): string {
  return words[getRandomIndex(words.length)]
}
`;

/* ───────── Typed Tenzies ───────── */
const TENZIES_CSS = `body { font-family: Karla, system-ui, sans-serif; background: #0b2434; padding: 20px; display: grid; place-items: center; }
main { background: #f5f5f5; border-radius: 10px; padding: 24px; display: grid; justify-items: center; gap: 16px; max-width: 360px; }
.dice { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; }
.die { width: 48px; height: 48px; border: 0; border-radius: 8px; box-shadow: 0 2px 2px rgba(0,0,0,.15); font-size: 1.4rem; font-weight: 700; cursor: pointer; }
.roll { background: #5035ff; color: #fff; border: 0; border-radius: 6px; padding: 10px 28px; font-size: 1.1rem; cursor: pointer; }`;
const DIE_START = `export default function Die({ value, isHeld, hold }) {
  return (
    <button className="die" style={{ backgroundColor: isHeld ? "#59E391" : "white" }} onClick={hold} aria-pressed={isHeld}
      aria-label={\`Die with value \${value}, \${isHeld ? "held" : "not held"}\`}>
      {value}
    </button>
  )
}
`;
const DIE_DONE = `type DieProps = {
  value: number
  isHeld: boolean
  hold: () => void
}

export default function Die({ value, isHeld, hold }: DieProps) {
  return (
    <button className="die" style={{ backgroundColor: isHeld ? "#59E391" : "white" }} onClick={hold} aria-pressed={isHeld}
      aria-label={\`Die with value \${value}, \${isHeld ? "held" : "not held"}\`}>
      {value}
    </button>
  )
}
`;
const TENZIES_START = `import { useState, useRef, useEffect } from "react"
import Die from "./Die"

function generateAllNewDice() {
  return new Array(10).fill(0).map((_, i) => ({ value: Math.ceil(Math.random() * 6), isHeld: false, id: String(i + 1) }))
}

export default function App() {
  const [dice, setDice] = useState(() => generateAllNewDice())
  const buttonRef = useRef(null)

  const gameWon = dice.every((die) => die.isHeld) && dice.every((die) => die.value === dice[0].value)

  useEffect(() => {
    if (gameWon) buttonRef.current.focus()
  }, [gameWon])

  function rollDice() {
    if (gameWon) {
      setDice(generateAllNewDice())
      return
    }
    setDice((oldDice) => oldDice.map((die) => (die.isHeld ? die : { ...die, value: Math.ceil(Math.random() * 6) })))
  }

  function hold(id) {
    setDice((oldDice) => oldDice.map((die) => (die.id === id ? { ...die, isHeld: !die.isHeld } : die)))
  }

  return (
    <main>
      <h1>Tenzies</h1>
      <div className="dice">
        {dice.map((die) => <Die key={die.id} value={die.value} isHeld={die.isHeld} hold={() => hold(die.id)} />)}
      </div>
      <button ref={buttonRef} className="roll" onClick={rollDice}>{gameWon ? "New Game" : "Roll"}</button>
    </main>
  )
}
`;
const TENZIES_DONE = `import { useState, useRef, useEffect } from "react"
import Die from "./Die"

export type DieObj = {
  value: number
  isHeld: boolean
  id: string
}

function generateAllNewDice(): DieObj[] {
  return new Array(10).fill(0).map((_, i) => ({ value: Math.ceil(Math.random() * 6), isHeld: false, id: String(i + 1) }))
}

export default function App() {
  const [dice, setDice] = useState<DieObj[]>(() => generateAllNewDice())
  const buttonRef = useRef<HTMLButtonElement>(null)

  const gameWon: boolean = dice.every((die) => die.isHeld) && dice.every((die) => die.value === dice[0].value)

  useEffect(() => {
    if (gameWon) buttonRef.current?.focus()
  }, [gameWon])

  function rollDice(): void {
    if (gameWon) {
      setDice(generateAllNewDice())
      return
    }
    setDice((oldDice) => oldDice.map((die) => (die.isHeld ? die : { ...die, value: Math.ceil(Math.random() * 6) })))
  }

  function hold(id: string): void {
    setDice((oldDice) => oldDice.map((die) => (die.id === id ? { ...die, isHeld: !die.isHeld } : die)))
  }

  return (
    <main>
      <h1>Tenzies</h1>
      <div className="dice">
        {dice.map((die) => <Die key={die.id} value={die.value} isHeld={die.isHeld} hold={() => hold(die.id)} />)}
      </div>
      <button ref={buttonRef} className="roll" onClick={rollDice}>{gameWon ? "New Game" : "Roll"}</button>
    </main>
  )
}
`;

/* ───────── Express + TS ───────── */
const EX_PKG = `{
  "name": "vanlife-api",
  "type": "module",
  "scripts": { "dev": "tsx watch server.ts", "start": "tsx server.ts", "build": "tsc" },
  "dependencies": { "express": "^5.1.0" },
  "devDependencies": { "@types/express": "^5.0.0", "@types/node": "^24.0.0", "tsx": "^4.20.0", "typescript": "^5.9.0" }
}`;
const EX_TSCONFIG = `{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "outDir": "dist",
    "esModuleInterop": true,
    "skipLibCheck": true
  }
}`;
const EX_DATA = `export type Van = {
  id: string
  name: string
  price: number
  type: "simple" | "rugged" | "luxury"
  available: boolean
}

export const vans: Van[] = [
  { id: "1", name: "Modest Explorer", price: 60, type: "simple", available: true },
  { id: "2", name: "Beach Bum", price: 80, type: "rugged", available: false },
  { id: "3", name: "Reliable Red", price: 100, type: "luxury", available: true },
  { id: "4", name: "Dreamfinder", price: 65, type: "simple", available: true },
  { id: "5", name: "The Cruiser", price: 120, type: "luxury", available: false },
  { id: "6", name: "Green Wonder", price: 70, type: "rugged", available: true },
]
`;
const EX_HELLO = `import express, { type Request, type Response } from "express"
import { vans } from "./data.js"

const PORT = 8000
const app = express()

app.get("/api/vans", (req: Request, res: Response) => {
  res.json(vans)
})

app.listen(PORT, () => console.log(\`Server running on port \${PORT}\`))
`;
const EX_TYPED_START = `import express from "express"
import { vans } from "./data.js"

const PORT = 8000
const app = express()

type ErrorResponse = { message: string }

app.get("/api/vans", (req, res) => {
  res.json(vans)
})

// GET /api/vans/:id → the van, or 404 { message: "No van with id …" }
// Type it: Request<{ id: string }>, Response<Van | ErrorResponse>

app.use((req, res) => {
  res.status(404).json({ message: "Endpoint not found" })
})

app.listen(PORT, () => console.log(\`Server running on port \${PORT}\`))
`;
const EX_TYPED_DONE = `import express, { type Request, type Response } from "express"
import { vans, type Van } from "./data.js"

const PORT = 8000
const app = express()

type ErrorResponse = { message: string }

app.get("/api/vans", (req: Request, res: Response<Van[]>) => {
  res.json(vans)
})

app.get("/api/vans/:id", (req: Request<{ id: string }>, res: Response<Van | ErrorResponse>) => {
  const van = vans.find((v) => v.id === req.params.id)
  if (!van) {
    res.status(404).json({ message: \`No van with id \${req.params.id}\` })
    return
  }
  res.json(van)
})

app.use((req: Request, res: Response<ErrorResponse>) => {
  res.status(404).json({ message: "Endpoint not found" })
})

app.listen(PORT, () => console.log(\`Server running on port \${PORT}\`))
`;
const EX_QUERY_START = `import express, { type Request, type Response } from "express"
import { vans, type Van } from "./data.js"

const PORT = 8000
const app = express()

// Query params always arrive as strings (or undefined)
type VanQuery = {
  // type?, minPrice?, available?
}

app.get("/api/vans", (req: Request<{}, Van[], {}, VanQuery>, res: Response<Van[]>) => {
  let result = vans
  // filter by type, by minPrice (a number), and by available ("true" / "false")
  res.json(result)
})

app.listen(PORT, () => console.log(\`Server running on port \${PORT}\`))
`;
const EX_QUERY_DONE = `import express, { type Request, type Response } from "express"
import { vans, type Van } from "./data.js"

const PORT = 8000
const app = express()

type VanQuery = {
  type?: string
  minPrice?: string
  available?: "true" | "false"
}

app.get("/api/vans", (req: Request<{}, Van[], {}, VanQuery>, res: Response<Van[]>) => {
  const { type, minPrice, available } = req.query
  let result = vans
  if (type) result = result.filter((v) => v.type === type.toLowerCase())
  if (minPrice !== undefined) {
    const min = Number(minPrice)
    if (!Number.isNaN(min)) result = result.filter((v) => v.price >= min)
  }
  if (available === "true" || available === "false") {
    const wanted = available === "true"
    result = result.filter((v) => v.available === wanted)
  }
  res.json(result)
})

app.listen(PORT, () => console.log(\`Server running on port \${PORT}\`))
`;
const EX_MW_SERVER = `import express from "express"
import { vansRouter } from "./routes/vans.js"
import { requireApiKey } from "./middleware/requireApiKey.js"

const PORT = 8000
const app = express()

app.use("/api/vans", requireApiKey, vansRouter)

app.listen(PORT, () => console.log(\`Server running on port \${PORT}\`))
`;
const EX_MW_ROUTES = `import express from "express"
import { getAllVans, getVanById } from "../controllers/vansController.js"

export const vansRouter = express.Router()

vansRouter.get("/", getAllVans)
vansRouter.get("/:id", getVanById)
`;
const EX_MW_CTRL_START = `import type { Request, Response } from "express"
import { vans, type Van } from "../data.js"

type ErrorResponse = { message: string }

export function getAllVans(req, res) {
  res.json(vans)
}

export function getVanById(req, res) {
  const van = vans.find((v) => v.id === req.params.id)
  if (!van) {
    res.status(404).json({ message: "Van not found" })
    return
  }
  res.json(van)
}
`;
const EX_MW_CTRL_DONE = `import type { Request, Response } from "express"
import { vans, type Van } from "../data.js"

type ErrorResponse = { message: string }

export function getAllVans(req: Request, res: Response<Van[]>): void {
  res.json(vans)
}

export function getVanById(req: Request<{ id: string }>, res: Response<Van | ErrorResponse>): void {
  const van = vans.find((v) => v.id === req.params.id)
  if (!van) {
    res.status(404).json({ message: "Van not found" })
    return
  }
  res.json(van)
}
`;
const EX_MW_START = `import type { Request, Response, NextFunction } from "express"

// Respond 401 { message: "Missing or invalid API key" } unless the x-api-key header is "vanlife-123"
export function requireApiKey(req, res, next) {
  next()
}
`;
const EX_MW_DONE = `import type { Request, Response, NextFunction } from "express"

export function requireApiKey(req: Request, res: Response<{ message: string }>, next: NextFunction): void {
  if (req.headers["x-api-key"] !== "vanlife-123") {
    res.status(401).json({ message: "Missing or invalid API key" })
    return
  }
  next()
}
`;

export const TYPESCRIPT = {
  id: "ts",
  title: "TypeScript",
  blurb: "Level up your JavaScript to TypeScript so you can write more reliable code.",
  concepts: ["Types, interfaces, unions", "Generics", "Typing React props and hooks", "Typing Express handlers"],
  lessons: [
    { id: "ts-welcome", title: "Welcome to TypeScript", min: 10, kind: "lesson", body: [
      { t: "p", h: "JavaScript finds your mistakes when the code runs, often in front of a user. <b>TypeScript</b> adds types to JavaScript, so your editor finds many of those mistakes while you type. It compiles to plain JavaScript: browsers and Node never see the types." },
      { t: "tsplay", task: "This is the pizza restaurant you'll build. It's valid JavaScript, but look at the Problems panel: TypeScript has already found the bugs. Then press Run and watch the crash.", files: { "pizza.ts": PIZZA_JS } },
      { t: "callout", kind: "key", h: "Types are documentation that can't go out of date, autocomplete that knows your data, and refactoring you can trust. Most professional JavaScript today is written in TypeScript." },
      { t: "quiz", q: "When does TypeScript check your types?", opts: ["While the code runs in the browser", "At build time / in your editor, before the code runs", "Only in production"], a: 1, why: "Types are checked by the compiler and editor, then erased. At runtime it's just JavaScript, so runtime data (like API responses) still needs validating." },
    ]},

    { id: "ts-fund", title: "TypeScript Fundamentals", min: 150, kind: "project", body: [
      { t: "h", h: "Basic types and defensive coding" },
      { t: "code", lang: "typescript", code: `let restaurantName: string = "Pizza Palace"
let cashInRegister: number = 100
let isOpen: boolean = true
let nextOrderId = 1        // inferred as number: annotate only when it helps

function add(a: number, b: number): number {
  return a + b
}` },
      { t: "p", h: "TypeScript <b>infers</b> types from values, so you rarely annotate variables. Function parameters are the exception: they can't be inferred, and in strict mode an un-annotated parameter is an error (<code>implicitly has an 'any' type</code>)." },
      { t: "h", h: "Custom types, nested objects, arrays, literals and unions" },
      { t: "code", lang: "typescript", code: `type Pizza = {
  id: number
  name: string
  price: number
  toppings?: string[]        // optional property
}

type Order = {
  id: number
  pizza: Pizza                // nested object type
  status: "ordered" | "completed"   // a union of literal types
}

const menu: Pizza[] = []      // an array of Pizzas` },
      { t: "p", h: "<b>Literal types</b> like <code>\"ordered\"</code> allow exactly that value. A <b>union</b> (<code>A | B</code>) allows any of its members. Together they replace magic strings: typo <code>\"complete\"</code> and TypeScript tells you." },
      { t: "tsch", prompt: "Type the restaurant: create <code>Pizza</code> and <code>Order</code> types (status is <code>\"ordered\"</code> or <code>\"completed\"</code>), type <code>menu</code>, <code>orderQueue</code> and both functions, and handle a pizza or order that isn't found by returning <code>undefined</code> (so the return types are <code>Order | undefined</code>). No <code>any</code>.", files: { "pizza.ts": PIZZA_START }, solution: { "pizza.ts": PIZZA_TYPES }, tests: [
        { msg: "Pizza requires id, name and price", fn: async (t) => (await t.compiles(`const __a: Pizza = { id: 9, name: "Test", price: 5 }`)) && (await t.fails(`const __b: Pizza = { name: "Test", price: 5 }`)) },
        { msg: "Order status only allows \"ordered\" or \"completed\"", fn: async (t) => (await t.compiles(`const __o: Order = { id: 1, pizza: menu[0], status: "completed" }`)) && (await t.fails(`const __p: Order = { id: 1, pizza: menu[0], status: "delivered" }`)) },
        { msg: "placeOrder returns Order | undefined", fn: async (t) => (await t.compiles(`const __r: Order | undefined = placeOrder("Veggie")`)) && (await t.fails(`const __s: Order = placeOrder("Veggie")`)) },
        { msg: "Works: orders, completes, and handles unknown pizzas", fn: (t) => { const m = t.mod(); const o = m.placeOrder("Pepperoni"); const c = m.completeOrder(o.id); return o.status === "completed" && c === o && m.placeOrder("Anchovy") === undefined && m.completeOrder(999) === undefined; } },
        { msg: "No any", fn: (t) => !/\bany\b/.test(t.src()) },
      ] },
      { t: "h", h: "Type narrowing" },
      { t: "p", h: "With a union parameter, you can only use what <b>every</b> member supports. Checks like <code>typeof x === \"string\"</code>, <code>Array.isArray(x)</code>, <code>\"prop\" in x</code> or comparing a literal <b>narrow</b> the type inside that branch." },
      { t: "tsch", prompt: "Write <code>getPizzaDetail(identifier: string | number): Pizza | undefined</code>: a string finds a pizza by name (case-insensitive); a number finds it by id. Be explicit about the return type.", files: { "pizza.ts": NARROW_START }, solution: { "pizza.ts": NARROW_DONE }, tests: [
        { msg: "Accepts only strings and numbers", fn: async (t) => (await t.compiles(`getPizzaDetail("Veggie"); getPizzaDetail(2)`)) && (await t.fails(`getPizzaDetail(true)`)) },
        { msg: "Return type includes undefined", fn: async (t) => t.fails(`const __p: Pizza = getPizzaDetail(1)`) },
        { msg: "Finds by name, ignoring case", fn: (t) => t.mod().getPizzaDetail("hawaiian").id === 3 },
        { msg: "Finds by id, and returns undefined when missing", fn: (t) => t.mod().getPizzaDetail(2).name === "Pepperoni" && t.mod().getPizzaDetail(42) === undefined },
      ] },
      { t: "h", h: "Void, any and unknown" },
      { t: "p", h: "<code>void</code> means a function returns nothing useful. <code>any</code> switches type checking off: it's contagious and hides bugs, so avoid it. <code>unknown</code> is the safe alternative for data you haven't checked yet: you must narrow it before using it." },
      { t: "h", h: "Utility types: Partial and Omit" },
      { t: "code", lang: "typescript", code: `type User = { id: number; username: string; role: "member" | "admin" }

Partial<User>         // every property optional: { id?: number; username?: string; … }
Omit<User, "id">      // everything except id: { username: string; role: … }
Pick<User, "username"> // only username
Readonly<User>        // can't reassign properties` },
      { t: "tsch", prompt: "Use utility types: <code>addNewPizza(pizzaObj: Omit&lt;Pizza, \"id\"&gt;): Pizza</code> assigns the next id automatically (starting at 5), adds it to the menu and returns it; <code>updateUser(id, updates)</code> takes a <code>Partial</code> of the user's fields (not the id) and returns the updated user, or <code>undefined</code>.", files: { "pizza.ts": UTIL_START }, solution: { "pizza.ts": UTIL_DONE }, tests: [
        { msg: "addNewPizza doesn't accept an id", fn: async (t) => (await t.compiles(`addNewPizza({ name: "Chicken Bacon Ranch", price: 12 })`)) && (await t.fails(`addNewPizza({ id: 99, name: "Spicy", price: 11 })`)) },
        { msg: "addNewPizza returns the new Pizza with an id", fn: (t) => { const m = t.mod(); const p = m.addNewPizza({ name: "BBQ Chicken", price: 12 }); return p.id === 5 && m.menu.length === 5 && m.addNewPizza({ name: "Spinach", price: 9 }).id === 6; } },
        { msg: "updateUser accepts any subset of the user's fields", fn: async (t) => (await t.compiles(`updateUser(1, { role: "contributor" }); updateUser(2, {})`)) && (await t.fails(`updateUser(1, { role: "boss" })`)) && (await t.fails(`updateUser(1, { email: "x@y.z" })`)) },
        { msg: "updateUser updates only what's given", fn: (t) => { const m = t.mod(); const u = m.updateUser(1, { role: "admin" }); return u.role === "admin" && u.username === "john_doe" && m.updateUser(99, { role: "admin" }) === undefined; } },
      ] },
      { t: "h", h: "Generics" },
      { t: "p", h: "A <b>generic</b> function works with many types while keeping them connected. <code>&lt;T&gt;</code> is a type parameter, like a function parameter for types. TypeScript usually infers it from the arguments, and you can pass it explicitly when it can't: <code>addToArray&lt;Pizza&gt;(menu, newPizza)</code>." },
      { t: "tsch", prompt: "Make <code>addToArray</code> generic, so it works for any array but the item's type must match the array's: adding a Pizza to the menu is fine, adding an Order to the menu (or a string to a number array) is an error.", files: { "pizza.ts": GENERIC_START }, solution: { "pizza.ts": GENERIC_DONE }, tests: [
        { msg: "Works for pizzas and orders", fn: async (t) => t.compiles(`addToArray(menu, { id: 7, name: "Chicken", price: 12 }); addToArray<Order>(orderQueue, { id: 1, pizza: menu[0], status: "ordered" })`) },
        { msg: "Rejects mismatched items", fn: async (t) => (await t.fails(`addToArray<Order>(orderQueue, { id: 1, pizza: menu[0], status: "done" })`)) && (await t.fails(`addToArray([1, 2, 3], "four")`)) },
        { msg: "Returns a typed array, not any[]", fn: async (t) => t.fails(`const __n: string[] = addToArray([1, 2], 3)`) },
        { msg: "Adds the item", fn: (t) => { const a = t.mod().addToArray([1, 2], 3); return a.length === 3 && a[2] === 3; } },
      ] },
      { t: "recap", items: ["Annotate parameters and return types; let inference do the rest", "type aliases describe objects; ? makes properties optional", "Literal unions replace magic strings", "Narrow unions with typeof / in / equality checks", "Avoid any; use unknown for unchecked data", "Partial, Omit, Pick reshape existing types", "Generics keep related types connected"] },
    ]},

    { id: "ts-react", title: "TypeScript in React", min: 120, kind: "project", body: [
      { t: "p", h: "React + TypeScript uses <code>.tsx</code> files. You'll mostly type three things: <b>props</b>, <b>state</b> that starts empty or null, and <b>functions</b> you pass around. A Vite project starts with <code>npm create vite@latest my-app -- --template react-ts</code>." },
      { t: "code", lang: "tsx", code: `type ButtonProps = {
  label: string
  variant?: "primary" | "ghost"
  onClick: () => void            // a function prop
  children?: React.ReactNode     // anything React can render
}

function Button({ label, variant = "primary", onClick }: ButtonProps) { … }

const [letters, setLetters] = useState<string[]>([])     // empty arrays need a type
const inputRef = useRef<HTMLInputElement>(null)          // DOM refs start as null
function handleChange(e: ChangeEvent<HTMLInputElement>) { … }` },
      { t: "callout", kind: "tip", h: "Components return JSX, <code>null</code>, or anything else React can render; TypeScript infers it, so you rarely annotate a component's return type. Import types with <code>import type { ChangeEvent } from \"react\"</code>." },
      { t: "rch", prompt: "Convert Assembly: Endgame to strict TypeScript: give <code>WordLetters</code>, <code>AriaLiveStatus</code> and <code>Keyboard</code> prop types (including the <code>onGuess</code> function prop), type the <code>guessedLetters</code> state and <code>addGuessedLetter</code>, and type the helpers in <code>utils.ts</code>. The game must still work.", typecheck: {}, files: { "App.tsx": ASSEMBLY_APP_START, "WordLetters.tsx": WORD_LETTERS_START, "AriaLiveStatus.tsx": STATUS_START, "Keyboard.tsx": KEYBOARD_START, "utils.ts": UTILS_TS_START, "index.css": ASSEMBLY_CSS }, solution: { "App.tsx": ASSEMBLY_APP_DONE, "WordLetters.tsx": WORD_LETTERS_DONE, "AriaLiveStatus.tsx": STATUS_DONE, "Keyboard.tsx": KEYBOARD_DONE, "utils.ts": UTILS_TS_DONE }, tests: [
        { msg: "Shows the word's slots and 26 keys", fn: async (h) => h.$$(".word span").length === 5 && h.$$(".keyboard button").length === 26 },
        { msg: "A right guess reveals letters and turns the key green", fn: async (h) => { for (const l of "aeiou") { const k = h.$(`[aria-label='Letter ${l}']`); await h.click(k); if (k.classList.contains("correct")) return h.$$(".word span").some((s) => s.textContent === l); } return false; } },
        { msg: "A wrong guess turns red and updates the status", fn: async (h) => { await h.click("[aria-label='Letter z']"); return h.$("[aria-label='Letter z']").classList.contains("wrong") && /not in the word/.test(h.text(".status")); } },
        { msg: "Eight wrong guesses: game over, keyboard disabled", fn: async (h) => { for (const l of "zqxjvwfb") await h.click(`[aria-label='Letter ${l}']`); return /Game over/.test(h.text(".status")) && h.$$(".keyboard button").every((b) => b.disabled); } },
        { msg: "Props are typed with type aliases", fn: async (h) => ["WordLetters.tsx", "AriaLiveStatus.tsx", "Keyboard.tsx"].every((f) => /type \w+Props\s*=/.test(h.src(f))) && /onGuess:\s*\(\s*letter:\s*string\s*\)\s*=>\s*void/.test(h.src("Keyboard.tsx")) },
      ] },
      { t: "quiz", q: "Why does <code>useState([])</code> need a type argument in strict TypeScript?", opts: ["It doesn't; arrays are always fine", "An empty array literal gives TypeScript nothing to infer the item type from, so it becomes never[]", "Because useState only accepts strings"], a: 1, why: "useState<string[]>([]) tells TypeScript what will go in the array later." },
    ]},

    { id: "ts-tenzies", title: "Solo project - Typed Tenzies", min: 60, kind: "solo", body: [
      { t: "p", h: "Convert your Tenzies game to TypeScript. It works already; your job is to make it type-safe without changing what it does." },
      { t: "steps", items: ["A <code>DieObj</code> type with <code>value</code>, <code>isHeld</code> and <code>id</code>", "Type <code>generateAllNewDice</code>'s return value and the <code>dice</code> state", "Type the ref to the Roll button, and handle it possibly being <code>null</code>", "Type <code>hold(id)</code>, <code>rollDice()</code> and <code>Die</code>'s props"] },
      { t: "rch", prompt: "Make Tenzies strict-TypeScript clean as described, keeping the game working.", typecheck: {}, files: { "App.tsx": TENZIES_START, "Die.tsx": DIE_START, "index.css": TENZIES_CSS }, solution: { "App.tsx": TENZIES_DONE, "Die.tsx": DIE_DONE }, tests: [
        { msg: "10 dice and a Roll button", fn: async (h) => h.$$("button.die").length === 10 && !!h.button("Roll") },
        { msg: "Holding a die and rolling keeps it", fn: async (h) => { await h.click(h.$$("button.die")[0]); const v = h.$$("button.die")[0].textContent; for (let i = 0; i < 4; i++) await h.click(h.button("Roll")); return h.$$("button.die")[0].textContent === v && h.$$("button.die")[0].getAttribute("aria-pressed") === "true"; } },
        { msg: "DieObj type and typed state", fn: async (h) => /type DieObj\s*=/.test(h.src("App.tsx")) && /useState<DieObj\[\]>/.test(h.src("App.tsx")) },
        { msg: "Typed ref with a null check", fn: async (h) => /useRef<HTMLButtonElement>\(null\)/.test(h.src("App.tsx")) && /current\?\.focus\(\)|current\s*&&|if\s*\(\s*buttonRef\.current/.test(h.src("App.tsx")) },
      ] },
    ]},

    { id: "ts-express", title: "TypeScript & Express", min: 120, kind: "project", body: [
      { t: "h", h: "Setting up an Express and TypeScript project" },
      { t: "code", lang: "bash", code: `npm init -y
npm install express
npm install -D typescript tsx @types/express @types/node
npx tsc --init          # creates tsconfig.json
npx tsx watch server.ts # runs TypeScript directly and restarts on save` },
      { t: "p", h: "<code>@types/express</code> describes Express's API. <b>tsx</b> runs <code>.ts</code> files without a separate build step, and <code>watch</code> restarts the server when you save. For production, <code>tsc</code> compiles to JavaScript in <code>dist/</code>. With <code>\"module\": \"NodeNext\"</code>, imports of your own files end in <code>.js</code>, even though the source is <code>.ts</code>." },
      { t: "nplay", task: "A typed Express server. Change the <code>Van</code> type's <code>price</code> to a string in <code>data.ts</code> and see the Problems panel light up.", typecheck: {}, requests: [{ url: "/api/vans" }], files: { "server.ts": EX_HELLO, "data.ts": EX_DATA, "package.json": EX_PKG, "tsconfig.json": EX_TSCONFIG } },
      { t: "h", h: "Request and Response types" },
      { t: "code", lang: "typescript", code: `//            Request<Params, ResBody, ReqBody, Query>
app.get("/api/vans/:id", (req: Request<{ id: string }>, res: Response<Van | ErrorResponse>) => {
  req.params.id      // string ✓      req.params.vanId  // error ✗
  res.json({ nope: true })            // error: not a Van or ErrorResponse
})` },
      { t: "nch", typecheck: {}, prompt: "Add <code>GET /api/vans/:id</code>, typed with <code>Request&lt;{ id: string }&gt;</code> and <code>Response&lt;Van | ErrorResponse&gt;</code>. Return the van, or a 404 with <code>{ message }</code> for ids that don't exist. Type the other handlers too.", requests: [{ url: "/api/vans/3" }, { url: "/api/vans/99" }], files: { "server.ts": EX_TYPED_START, "data.ts": EX_DATA, "package.json": EX_PKG, "tsconfig.json": EX_TSCONFIG }, solution: { "server.ts": EX_TYPED_DONE }, tests: [
        { msg: "GET /api/vans/3 returns Reliable Red", fn: async (t) => { const r = await t.get("/api/vans/3"); return r.status === 200 && r.json && r.json.name === "Reliable Red"; } },
        { msg: "A missing id returns 404 with a message", fn: async (t) => { const r = await t.get("/api/vans/99"); return r.status === 404 && r.json && typeof r.json.message === "string"; } },
        { msg: "Handlers use Request<{ id: string }> and Response<…>", fn: async (t) => /Request<\s*\{\s*id:\s*string\s*\}\s*>/.test(t.src("server.ts")) && /Response<\s*Van\s*\|\s*ErrorResponse\s*>/.test(t.src("server.ts")) },
      ] },
      { t: "h", h: "Query params: strings, booleans and numbers" },
      { t: "p", h: "Query parameters are always strings (or missing). Type them honestly as <code>string | undefined</code> (or a union of literal strings), then convert: <code>Number(minPrice)</code> with a <code>NaN</code> check, <code>available === \"true\"</code> for booleans." },
      { t: "nch", typecheck: {}, prompt: "Complete <code>VanQuery</code> and filter <code>GET /api/vans</code> by <code>type</code> (case-insensitive), <code>minPrice</code> (a number; ignore it if it isn't one) and <code>available</code> (<code>\"true\"</code>/<code>\"false\"</code>).", requests: [{ url: "/api/vans?type=rugged" }, { url: "/api/vans?minPrice=80&available=true" }], files: { "server.ts": EX_QUERY_START, "data.ts": EX_DATA, "package.json": EX_PKG, "tsconfig.json": EX_TSCONFIG }, solution: { "server.ts": EX_QUERY_DONE }, tests: [
        { msg: "?type=Rugged → the two rugged vans", fn: async (t) => { const r = await t.get("/api/vans?type=Rugged"); return r.json.length === 2 && r.json.every((v) => v.type === "rugged"); } },
        { msg: "?minPrice=80 → vans costing 80 or more", fn: async (t) => { const r = await t.get("/api/vans?minPrice=80"); return r.json.length === 3 && r.json.every((v) => v.price >= 80); } },
        { msg: "?available=false and combined filters", fn: async (t) => { const a = await t.get("/api/vans?available=false"); const b = await t.get("/api/vans?minPrice=70&available=true"); return a.json.length === 2 && b.json.map((v) => v.id).join() === "3,6"; } },
        { msg: "?minPrice=lots is ignored", fn: async (t) => (await t.get("/api/vans?minPrice=lots")).json.length === 6 },
        { msg: "VanQuery declares the three optional params", fn: async (t) => /type\?\s*:/.test(t.src("server.ts")) && /minPrice\?\s*:/.test(t.src("server.ts")) && /available\?\s*:/.test(t.src("server.ts")) },
      ] },
      { t: "h", h: "Separating concerns: routers, controllers and middleware" },
      { t: "p", h: "As in plain Express, split routes into a <b>router</b> and handlers into <b>controllers</b>. Type controllers with <code>Request</code>/<code>Response</code>, and middleware with <code>(req: Request, res: Response, next: NextFunction)</code> (or the <code>RequestHandler</code> type)." },
      { t: "nch", typecheck: {}, prompt: "Type the controllers, and write the <code>requireApiKey</code> middleware: without an <code>x-api-key</code> header of <code>vanlife-123</code> respond <b>401</b> with <code>{ message }</code>; otherwise call <code>next()</code>.", requests: [{ url: "/api/vans" }, { url: "/api/vans/2", headers: { "x-api-key": "vanlife-123" } }], files: { "server.ts": EX_MW_SERVER, "routes/vans.ts": EX_MW_ROUTES, "controllers/vansController.ts": EX_MW_CTRL_START, "middleware/requireApiKey.ts": EX_MW_START, "data.ts": EX_DATA, "package.json": EX_PKG, "tsconfig.json": EX_TSCONFIG }, solution: { "controllers/vansController.ts": EX_MW_CTRL_DONE, "middleware/requireApiKey.ts": EX_MW_DONE }, tests: [
        { msg: "No key → 401 with a message", fn: async (t) => { const r = await t.get("/api/vans"); return r.status === 401 && r.json && typeof r.json.message === "string"; } },
        { msg: "Wrong key → 401", fn: async (t) => (await t.get("/api/vans", { "x-api-key": "nope" })).status === 401 },
        { msg: "Right key → the vans and a single van", fn: async (t) => { const a = await t.get("/api/vans", { "x-api-key": "vanlife-123" }); const b = await t.get("/api/vans/2", { "x-api-key": "vanlife-123" }); return a.status === 200 && a.json.length === 6 && b.json.name === "Beach Bum"; } },
        { msg: "Middleware typed with NextFunction", fn: async (t) => /next:\s*NextFunction/.test(t.src("middleware/requireApiKey.ts")) || /RequestHandler/.test(t.src("middleware/requireApiKey.ts")) },
      ] },
      { t: "recap", items: ["tsx runs TypeScript directly; tsc builds for production", "@types/express gives Request, Response, NextFunction", "Request<Params, ResBody, ReqBody, Query> and Response<Body>", "Query params are strings: convert and validate", "Type routers, controllers and middleware like any functions", "Types vanish at runtime: still validate incoming data"] },
    ]},
  ],
};
