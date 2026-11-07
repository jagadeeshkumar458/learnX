/* React.js Fundamentals, part B: React State, Side Effects.
   Test functions in `rch` blocks MUST be self-contained (serialised with toString()). */

const API = "https://api.shipyard.dev";

/* A tiny Markdown renderer for the labs. In a real project you'd `npm i react-markdown`. */
const MARKDOWN = `// A tiny Markdown renderer, enough for recipes.
// In a real project: npm install react-markdown, then <ReactMarkdown>{text}</ReactMarkdown>
function inline(text) {
  return text.split(/(\\*\\*[^*]+\\*\\*)/g).map((part, i) =>
    part.startsWith("**") ? <strong key={i}>{part.slice(2, -2)}</strong> : part
  )
}

export default function Markdown({ children }) {
  const blocks = []
  let list = null
  children.split("\\n").forEach((line, i) => {
    const item = line.match(/^(-|\\d+\\.)\\s+(.*)/)
    if (item) {
      const type = item[1] === "-" ? "ul" : "ol"
      if (!list || list.type !== type) { list = { type, items: [] }; blocks.push(list) }
      list.items.push(<li key={i}>{inline(item[2])}</li>)
      return
    }
    list = null
    if (line.startsWith("### ")) blocks.push(<h3 key={i}>{inline(line.slice(4))}</h3>)
    else if (line.startsWith("## ")) blocks.push(<h2 key={i}>{inline(line.slice(3))}</h2>)
    else if (line.startsWith("> ")) blocks.push(<blockquote key={i}>{inline(line.slice(2))}</blockquote>)
    else if (line.trim()) blocks.push(<p key={i}>{inline(line)}</p>)
  })
  return blocks.map((b, i) => b.type === "ul" ? <ul key={"l" + i}>{b.items}</ul> : b.type === "ol" ? <ol key={"l" + i}>{b.items}</ol> : b)
}
`;

const CHEF_CSS = `* { box-sizing: border-box; }
body { margin: 0; font-family: Inter, system-ui, sans-serif; background: #fafaf8; color: #141413; }
header { display: flex; align-items: center; justify-content: center; gap: 10px; padding: 14px; box-shadow: 0 1px 4px #0001; background: #fff; }
header h1 { margin: 0; font-size: 1.4rem; font-weight: 500; }
main { padding: 24px 28px 40px; max-width: 640px; margin: 0 auto; }
.add-ingredient-form { display: flex; gap: 12px; height: 38px; }
.add-ingredient-form input { flex: 1; border: 1px solid #d1d5db; border-radius: 6px; padding: 0 12px; font: inherit; }
.add-ingredient-form button, .get-recipe-container button { border: 0; border-radius: 6px; background: #141413; color: #fafaf8; padding: 0 16px; font: inherit; font-size: .85rem; cursor: pointer; }
.ingredients-list li { color: #475467; line-height: 1.8; }
.get-recipe-container { display: flex; justify-content: space-between; align-items: center; gap: 12px; background: #f0efeb; border-radius: 8px; padding: 12px 22px; margin-top: 18px; }
.get-recipe-container h3 { margin: 0 0 4px; font-size: 1.05rem; }
.get-recipe-container p { margin: 0; color: #6b7280; font-size: .85rem; }
.get-recipe-container button { height: 38px; background: #d17557; }
.suggested-recipe-container { margin-top: 24px; color: #475467; line-height: 1.6; }
.suggested-recipe-container blockquote { margin: 12px 0 0; padding: 8px 14px; border-left: 3px solid #d17557; background: #fff; }
.loading { color: #d17557; }
`;

const CHEF_HEADER = `export default function Header() {
  return (
    <header>
      <span aria-hidden="true">👨‍🍳</span>
      <h1>Chef Claude</h1>
    </header>
  )
}
`;

const MEME_CSS = `* { box-sizing: border-box; }
body { margin: 0; font-family: Karla, system-ui, sans-serif; background: #f5f5f5; }
header { display: flex; align-items: center; gap: 8px; padding: 14px 24px; color: #fff; background: linear-gradient(90deg, #672280 1.18%, #a626d3 100%); }
header h1 { margin: 0; font-size: 1.2rem; }
main { padding: 24px; max-width: 560px; margin: 0 auto; }
.form { display: grid; grid-template-columns: 1fr 1fr; gap: 12px 16px; }
.form label { font-size: .8rem; color: #6b7280; display: grid; gap: 4px; }
.form input { border: 1px solid #d1d5db; border-radius: 5px; padding: 9px 10px; font: inherit; }
.form button { grid-column: 1 / -1; border: 0; border-radius: 5px; padding: 11px; color: #fff; font: inherit; font-weight: 700; cursor: pointer; background: linear-gradient(90deg, #672280 1.18%, #a626d3 100%); }
.meme { position: relative; margin-top: 24px; display: grid; place-items: center; }
.meme img { width: 100%; border-radius: 6px; display: block; }
.meme span { position: absolute; width: 90%; text-align: center; font: 900 2rem/1.1 Impact, "Arial Black", sans-serif; text-transform: uppercase; color: #fff;
  letter-spacing: 1px; text-shadow: 2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000; }
.meme .top { top: 12px; } .meme .bottom { bottom: 12px; }
`;

const PADS = `export default [
  { id: 1, color: "#d6000c", on: true },
  { id: 2, color: "#ff6200", on: false },
  { id: 3, color: "#ffc000", on: true },
  { id: 4, color: "#00b36b", on: false },
  { id: 5, color: "#0084ff", on: true },
  { id: 6, color: "#8a2be2", on: false },
  { id: 7, color: "#ff1493", on: true },
  { id: 8, color: "#00ced1", on: false },
]
`;

export const REACT_B = [
  /* ───────────────────────── React State ───────────────────────── */
  { id: "rx-state", title: "React State", min: 160, kind: "lesson", body: [
    { t: "p", h: "Static pages are done. Now the UI has to <i>change</i>: count clicks, add items, show and hide sections. In this lesson you'll build <b>Chef Claude</b>: list the ingredients you have, and an AI chef suggests a recipe." },
    { t: "h", h: "Event listeners" },
    { t: "p", h: "In React you don't call <code>addEventListener</code>. You pass a function to a camelCase prop like <code>onClick</code>, <code>onMouseOver</code> or <code>onSubmit</code>, right on the element." },
    { t: "code", lang: "jsx", code: `function handleClick() {
  console.log("I was clicked!")
}

<button onClick={handleClick}>Click me</button>     // ✓ pass the function
<button onClick={handleClick()}>Click me</button>   // ✗ calls it during render
<button onClick={() => remove(id)}>Delete</button>  // ✓ wrap it to pass arguments` },
    { t: "h", h: "Why a normal variable isn't enough" },
    { t: "rplay", task: "Click the button and watch the console. The variable changes, but the page doesn't. Why?", files: {
      "App.jsx": `export default function App() {
  let count = 0

  function add() {
    count = count + 1
    console.log("count is now", count)
  }

  return (
    <main>
      <h1>Count: {count}</h1>
      <button onClick={add}>Add one</button>
    </main>
  )
}
`,
      "index.css": `body { font-family: system-ui, sans-serif; padding: 24px; } button { font: inherit; padding: 8px 14px; }`,
    } },
    { t: "p", h: "Changing a local variable doesn't tell React anything, so it never re-runs <code>App</code>. And even if it did, <code>let count = 0</code> would reset it to zero. A component needs two things: <b>memory</b> that survives between renders, and a way to say <b>“the data changed, render again”</b>. That's state." },
    { t: "h", h: "Props vs. state" },
    { t: "steps", items: [
      "<b>Props</b> come from the parent. The component receives them and must not change them, like function parameters",
      "<b>State</b> is data the component owns and can change over time, like variables declared inside the component that React remembers for you",
      "When state changes, React re-renders that component and its children with the new values",
    ] },
    { t: "h", h: "useState" },
    { t: "code", lang: "jsx", code: `import { useState } from "react"

function Counter() {
  const [count, setCount] = useState(0)   // [current value, setter], 0 is the initial value
  return <button onClick={() => setCount(count + 1)}>Clicks: {count}</button>
}` },
    { t: "video", name: "react-render" },
    { t: "callout", kind: "key", h: "Calling <code>setCount</code> doesn't change <code>count</code> in the code that's already running. It asks React to render again, and in <i>that</i> render <code>useState</code> returns the new value. Each render sees a fixed snapshot of state." },
    { t: "h", h: "Updating state with a callback" },
    { t: "p", h: "When the new value depends on the old one, pass a function. React calls it with the latest pending value, so updates never get lost." },
    { t: "gif", name: "state-snapshot" },
    { t: "code", lang: "jsx", code: `setCount(count + 1)          // fine for one update, but uses this render's snapshot
setCount(prev => prev + 1)   // ✓ always builds on the latest value` },
    { t: "quiz", q: "<code>count</code> is 5. A click runs <code>setCount(count + 1)</code> three times in a row. What is count after the re-render?", opts: ["8", "6", "5"], a: 1, why: "All three calls read the same snapshot (5) and ask for 6. With <code>setCount(c => c + 1)</code> each call builds on the last, giving 8." },
    { t: "rch", prompt: "Build a counter in <code>App.jsx</code>: an <code>&lt;h1&gt;</code> showing the count (starting at 0), a button with the text <b>+</b> and a button with the text <b>−</b>. Use <code>useState</code> and the callback form of the setter. The count must not go below 0.", files: {
      "App.jsx": `import { useState } from "react"

export default function App() {
  return (
    <main className="counter">
      <button aria-label="Subtract">−</button>
      <h1>0</h1>
      <button aria-label="Add">+</button>
    </main>
  )
}
`,
      "index.css": `body { font-family: system-ui, sans-serif; display: grid; place-items: center; min-height: 90vh; margin: 0; }
.counter { display: flex; align-items: center; gap: 24px; }
.counter button { width: 56px; height: 56px; border-radius: 50%; border: 0; background: #087ea4; color: #fff; font-size: 1.6rem; cursor: pointer; }
.counter h1 { font-size: 3rem; min-width: 2ch; text-align: center; }
`,
    }, solution: {
      "App.jsx": `import { useState } from "react"

export default function App() {
  const [count, setCount] = useState(0)

  function add() {
    setCount(prev => prev + 1)
  }

  function subtract() {
    setCount(prev => Math.max(0, prev - 1))
  }

  return (
    <main className="counter">
      <button onClick={subtract} aria-label="Subtract">−</button>
      <h1>{count}</h1>
      <button onClick={add} aria-label="Add">+</button>
    </main>
  )
}
`,
    }, tests: [
      { msg: "Starts at 0", fn: async (h) => h.text("h1") === "0" },
      { msg: "+ adds one each click", fn: async (h) => { const b = h.button("+"); await h.click(b); await h.click(b); await h.click(b); return h.text("h1") === "3"; } },
      { msg: "− subtracts one", fn: async (h) => { await h.click(h.button("+")); await h.click(h.button("+")); await h.click(h.button("−")); return h.text("h1") === "1"; } },
      { msg: "Never goes below 0", fn: async (h) => { await h.click(h.button("−")); await h.click(h.button("−")); return h.text("h1") === "0"; } },
      { msg: "Uses useState with the callback form of the setter", fn: async (h) => /useState\(/.test(h.src("App.jsx")) && /set\w+\(\s*\(?\s*\w+\s*\)?\s*=>/.test(h.src("App.jsx")) },
    ] },
    { t: "h", h: "Ternaries and toggling" },
    { t: "p", h: "Booleans in state are perfect for on/off UI. Flip them with <code>prev => !prev</code>, and choose what to show with a ternary." },
    { t: "rplay", task: "Add a second piece of state, <code>isDark</code>, and a button that toggles a <code>dark</code> class on <code>&lt;main&gt;</code>.", files: {
      "App.jsx": `import { useState } from "react"

export default function App() {
  const [isGoingOut, setIsGoingOut] = useState(true)

  function toggle() {
    setIsGoingOut(prev => !prev)
  }

  return (
    <main>
      <h1 className="title">Do I feel like going out tonight?</h1>
      <button className="value" onClick={toggle} aria-label={"Current answer is " + (isGoingOut ? "Yes" : "No") + ". Click to change it."}>
        {isGoingOut ? "Yes" : "No"}
      </button>
    </main>
  )
}
`,
      "index.css": `body { font-family: system-ui, sans-serif; margin: 0; } main { padding: 30px; text-align: center; }
.value { width: 140px; height: 140px; border-radius: 50%; border: 0; background: #222; color: #fff; font-size: 2.2rem; font-weight: 800; cursor: pointer; }
`,
    } },
    { t: "h", h: "Complex state: arrays" },
    { t: "p", h: "Never change state in place. <code>ingredients.push(x)</code> mutates the same array, so React sees the same object and may skip the update. Always give the setter a <b>new</b> array or object." },
    { t: "code", lang: "jsx", code: `const [ingredients, setIngredients] = useState([])

setIngredients(prev => [...prev, newIngredient])        // add
setIngredients(prev => prev.filter(i => i !== name))     // remove
setIngredients(prev => prev.map(i => i === old ? updated : i))  // replace` },
    { t: "h", h: "Complex state: objects" },
    { t: "code", lang: "jsx", code: `const [contact, setContact] = useState({
  firstName: "John", lastName: "Doe", email: "itsmyrealname@example.com", isFavorite: false,
})

function toggleFavorite() {
  setContact(prev => ({ ...prev, isFavorite: !prev.isFavorite }))   // copy, then override one key
}` },
    { t: "callout", kind: "warn", h: "<code>setContact({ isFavorite: true })</code> replaces the whole object, so the name and email disappear. Unlike old class components, <code>useState</code> doesn't merge. Spread <code>...prev</code> first." },
    { t: "quiz", q: "Which update correctly adds \"salt\" to an array in state?", opts: ["ingredients.push(\"salt\"); setIngredients(ingredients)", "setIngredients(prev => [...prev, \"salt\"])", "setIngredients(\"salt\")"], a: 1, why: "It creates a new array containing the old items plus the new one. Pushing mutates the existing array, which React may not notice." },
    { t: "h", h: "Forms in React" },
    { t: "p", h: "The classic way is an <code>onSubmit</code> handler: stop the page reload with <code>preventDefault()</code>, then read the fields with <code>FormData</code>. React 19 adds a shorter way: pass a function to the form's <code>action</code> prop. React calls it with the <code>FormData</code>, handles the submit for you, and resets the form afterwards." },
    { t: "code", lang: "jsx", code: `// Classic
function handleSubmit(event) {
  event.preventDefault()
  const formData = new FormData(event.currentTarget)
  const email = formData.get("email")
}
<form onSubmit={handleSubmit}>…</form>

// React 19 form action
function signUp(formData) {
  const email = formData.get("email")          // the input's name attribute
}
<form action={signUp}>
  <input type="email" name="email" />
  <button>Submit</button>
</form>` },
    { t: "p", h: "Every field needs a <code>name</code>. <code>defaultValue</code> pre-fills an uncontrolled field (text inputs, textareas, selects), <code>defaultChecked</code> pre-ticks radios and checkboxes. For checkboxes that share a name, <code>formData.getAll(\"name\")</code> returns every ticked value. <code>Object.fromEntries(formData)</code> turns the whole form into an object (but keeps only one value per name)." },
    { t: "rplay", task: "Fill in the form and submit. Then add a <code>&lt;select&gt;</code> for favourite colour and include it in the logged object.", files: {
      "App.jsx": `export default function App() {
  function signUp(formData) {
    const data = Object.fromEntries(formData)
    const dietaryRestrictions = formData.getAll("dietaryRestrictions")
    console.log({ ...data, dietaryRestrictions })
  }

  return (
    <section>
      <h1>Signup form</h1>
      <form action={signUp}>
        <label>Email: <input type="email" name="email" defaultValue="joe@schmoe.com" /></label>
        <label>Description: <textarea name="description" defaultValue="This is a description" /></label>

        <fieldset>
          <legend>Employment Status:</legend>
          <label><input type="radio" name="employmentStatus" value="unemployed" /> Unemployed</label>
          <label><input type="radio" name="employmentStatus" value="part-time" /> Part-time</label>
          <label><input type="radio" name="employmentStatus" value="full-time" defaultChecked /> Full-time</label>
        </fieldset>

        <fieldset>
          <legend>Dietary restrictions:</legend>
          <label><input type="checkbox" name="dietaryRestrictions" value="kosher" /> Kosher</label>
          <label><input type="checkbox" name="dietaryRestrictions" value="vegan" /> Vegan</label>
          <label><input type="checkbox" name="dietaryRestrictions" value="gluten-free" defaultChecked /> Gluten-free</label>
        </fieldset>

        <button>Submit</button>
      </form>
    </section>
  )
}
`,
      "index.css": `body { font-family: system-ui, sans-serif; padding: 12px 20px; }
form { display: grid; gap: 10px; max-width: 360px; }
label { display: block; } input[type=email], textarea { width: 100%; font: inherit; padding: 6px; }
fieldset { border-radius: 6px; border: 1px solid #ccc; }
button { font: inherit; padding: 8px; }
`,
    } },
    { t: "h", h: "Conditional rendering" },
    { t: "p", h: "Because JSX is JavaScript, you choose what to render with ordinary expressions:" },
    { t: "code", lang: "jsx", code: `{unreadMessages.length > 0 && <p>You have {unreadMessages.length} unread messages</p>}

{isLoggedIn ? <Dashboard /> : <LoginForm />}

if (!data) return <p>Loading…</p>     // early return, before the main JSX` },
    { t: "p", h: "<b>Why does <code>&&</code> work?</b> <code>a && b</code> returns <code>a</code> if it's falsy, otherwise <code>b</code>. React renders nothing for <code>false</code>, <code>null</code> and <code>undefined</code>, so the element only appears when the condition is true." },
    { t: "callout", kind: "warn", h: "React <i>does</i> render the number <code>0</code>. <code>{messages.length && &lt;p&gt;…&lt;/p&gt;}</code> shows a stray \"0\" when the list is empty. Compare explicitly: <code>{messages.length &gt; 0 && …}</code>." },
    { t: "quiz", q: "What does <code>{items.length && &lt;List /&gt;}</code> render when <code>items</code> is empty?", opts: ["Nothing", "0", "An empty &lt;List /&gt;", "It throws"], a: 1, why: "<code>0 && …</code> evaluates to <code>0</code>, and React renders numbers. Use <code>items.length &gt; 0 &&</code>." },
    { t: "h", h: "Chef Claude: ingredients" },
    { t: "rch", prompt: "Build the ingredients part of Chef Claude. The form's <code>action</code> adds the input's value (<code>name=\"ingredient\"</code>) to an <code>ingredients</code> array in state; ignore empty input. Only show the <b>“Ingredients on hand:”</b> section once there's at least one ingredient, and only show the <b>“Ready for a recipe?”</b> box when there are more than 3.", files: {
      "App.jsx": `import { useState } from "react"
import Header from "./Header"

export default function App() {
  const ingredients = ["Chicken", "Oregano", "Tomatoes"]

  const ingredientsListItems = ingredients.map(ingredient => (
    <li key={ingredient}>{ingredient}</li>
  ))

  return (
    <>
      <Header />
      <main>
        <form className="add-ingredient-form">
          <input type="text" placeholder="e.g. oregano" aria-label="Add ingredient" name="ingredient" />
          <button>+ Add ingredient</button>
        </form>
        <section>
          <h2>Ingredients on hand:</h2>
          <ul className="ingredients-list" aria-live="polite">{ingredientsListItems}</ul>
          <div className="get-recipe-container">
            <div>
              <h3>Ready for a recipe?</h3>
              <p>Generate a recipe from your list of ingredients.</p>
            </div>
            <button>Get a recipe</button>
          </div>
        </section>
      </main>
    </>
  )
}
`,
      "Header.jsx": CHEF_HEADER,
      "index.css": CHEF_CSS,
    }, solution: {
      "App.jsx": `import { useState } from "react"
import Header from "./Header"

export default function App() {
  const [ingredients, setIngredients] = useState([])

  const ingredientsListItems = ingredients.map(ingredient => (
    <li key={ingredient}>{ingredient}</li>
  ))

  function addIngredient(formData) {
    const newIngredient = formData.get("ingredient").trim()
    if (!newIngredient) return
    setIngredients(prev => [...prev, newIngredient])
  }

  return (
    <>
      <Header />
      <main>
        <form action={addIngredient} className="add-ingredient-form">
          <input type="text" placeholder="e.g. oregano" aria-label="Add ingredient" name="ingredient" />
          <button>+ Add ingredient</button>
        </form>
        {ingredients.length > 0 && (
          <section>
            <h2>Ingredients on hand:</h2>
            <ul className="ingredients-list" aria-live="polite">{ingredientsListItems}</ul>
            {ingredients.length > 3 && (
              <div className="get-recipe-container">
                <div>
                  <h3>Ready for a recipe?</h3>
                  <p>Generate a recipe from your list of ingredients.</p>
                </div>
                <button>Get a recipe</button>
              </div>
            )}
          </section>
        )}
      </main>
    </>
  )
}
`,
    }, tests: [
      { msg: "Starts with no ingredients section", fn: async (h) => !/ingredients on hand/i.test(h.text()) && h.$$("li").length === 0 },
      { msg: "Submitting the form adds the ingredient to the list", fn: async (h) => { await h.type("input[name=ingredient]", "Pasta"); await h.submit("form"); return await h.until(() => h.$$(".ingredients-list li").map((l) => l.textContent.trim()).join() === "Pasta"); } },
      { msg: "Empty input doesn't add anything", fn: async (h) => { await h.type("input[name=ingredient]", "   "); await h.submit("form"); await h.tick(150); return h.$$("li").length === 0; } },
      { msg: "“Ready for a recipe?” only appears with more than 3 ingredients", fn: async (h) => {
        for (const x of ["Pasta", "Garlic", "Basil"]) { await h.type("input[name=ingredient]", x); await h.submit("form"); await h.until(() => h.text().includes(x)); }
        const before = /ready for a recipe/i.test(h.text());
        await h.type("input[name=ingredient]", "Tomatoes"); await h.submit("form");
        return !before && await h.until(() => /ready for a recipe/i.test(h.text()));
      } },
      { msg: "Ingredients live in state (useState), not a plain variable", fn: async (h) => /useState\(\s*\[\s*\]\s*\)/.test(h.src("App.jsx")) },
    ] },
    { t: "h", h: "Passing state down, and setting it from children" },
    { t: "p", h: "State lives in one component, but often several components need it. Pass the <b>value</b> down as a prop to children that display it, and pass a <b>function</b> down to children that need to change it. The child calls the function; the parent's state changes; the new value flows back down." },
    { t: "diagram", name: "props-flow" },
    { t: "code", lang: "jsx", code: `function App() {
  const [count, setCount] = useState(0)
  return (
    <>
      <Count number={count} />                                  {/* value down */}
      <AddButton onAdd={() => setCount(c => c + 1)} />          {/* function down */}
    </>
  )
}

function AddButton({ onAdd }) {
  return <button onClick={onAdd}>+</button>                     {/* event up */}
}` },
    { t: "callout", kind: "tip", h: "Keep state in the <b>closest common parent</b> of the components that need it. If only one component uses it, keep it there. Moving state up so siblings can share it is called <i>lifting state up</i>." },
    { t: "h", h: "Sound pads: dynamic styles and shared state" },
    { t: "p", h: "The <code>style</code> prop takes an object with camelCase CSS properties: <code>style={{ backgroundColor: color }}</code>. The outer braces switch to JavaScript; the inner ones are the object." },
    { t: "jsch", fn: "togglePad", prompt: "Write a pure function <code>togglePad(pads, id)</code> that returns a <b>new</b> array where the pad with that <code>id</code> has its <code>on</code> flipped. Don't mutate the original array or pad objects.", starter: `function togglePad(pads, id) {
  // return a new array, with a new object for the toggled pad
}`, solution: `function togglePad(pads, id) {
  return pads.map(pad => pad.id === id ? { ...pad, on: !pad.on } : pad)
}`, tests: [
      { msg: "Flips <code>on</code> for the matching pad", fn: (f) => { const r = f([{ id: 1, on: false }, { id: 2, on: true }], 1); return r[0].on === true && r[1].on === true; } },
      { msg: "Leaves other pads alone", fn: (f) => { const r = f([{ id: 1, on: false, color: "red" }, { id: 2, on: false, color: "blue" }], 2); return r[0].on === false && r[1].on === true && r[1].color === "blue"; } },
      { msg: "Returns a new array", fn: (f) => { const a = [{ id: 1, on: false }]; return f(a, 1) !== a; } },
      { msg: "Doesn't mutate the original pad objects", fn: (f) => { const a = [{ id: 1, on: false }, { id: 2, on: true }]; const r = f(a, 1); return a[0].on === false && r[0] !== a[0] && r[1] === a[1]; } },
    ] },
    { t: "rch", prompt: "Build the sound pads board. Keep <code>pads</code> in state in <code>App</code>, render a <code>Pad</code> button for each one with its colour as the background, and give it the class <code>on</code> and <code>aria-pressed</code> when it's on. Clicking a pad toggles only that pad.", files: {
      "App.jsx": `import { useState } from "react"
import padsData from "./pads"
import Pad from "./Pad"

export default function App() {
  const [pads, setPads] = useState(padsData)

  return (
    <main>
      <div className="pad-container">
        {/* render a <Pad /> for each pad */}
      </div>
    </main>
  )
}
`,
      "Pad.jsx": `export default function Pad(props) {
  return <button></button>
}
`,
      "pads.js": PADS,
      "index.css": `body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: #1d1d1d; }
.pad-container { display: grid; grid-template-columns: repeat(4, 80px); gap: 16px; }
.pad-container button { height: 80px; border: 0; border-radius: 12px; opacity: .15; cursor: pointer; transition: opacity .15s; }
.pad-container button.on { opacity: 1; box-shadow: 0 0 22px currentColor; }
`,
    }, solution: {
      "App.jsx": `import { useState } from "react"
import padsData from "./pads"
import Pad from "./Pad"

export default function App() {
  const [pads, setPads] = useState(padsData)

  function toggle(id) {
    setPads(prevPads => prevPads.map(pad =>
      pad.id === id ? { ...pad, on: !pad.on } : pad
    ))
  }

  const buttonElements = pads.map(pad => (
    <Pad key={pad.id} id={pad.id} color={pad.color} on={pad.on} toggle={toggle} />
  ))

  return (
    <main>
      <div className="pad-container">{buttonElements}</div>
    </main>
  )
}
`,
      "Pad.jsx": `export default function Pad({ id, color, on, toggle }) {
  return (
    <button
      style={{ backgroundColor: color, color }}
      className={on ? "on" : undefined}
      aria-pressed={on}
      aria-label={"Pad " + id}
      onClick={() => toggle(id)}
    ></button>
  )
}
`,
    }, tests: [
      { msg: "Renders 8 pads with their colours", fn: async (h) => { const b = h.$$(".pad-container button"); return b.length === 8 && b[0].style.backgroundColor === "rgb(214, 0, 12)"; } },
      { msg: "Pads that start on have the class <code>on</code> and aria-pressed", fn: async (h) => { const b = h.$$(".pad-container button"); return b[0].classList.contains("on") && b[0].getAttribute("aria-pressed") === "true" && !b[1].classList.contains("on"); } },
      { msg: "Clicking a pad toggles it", fn: async (h) => { await h.click(h.$$(".pad-container button")[1]); const ok1 = h.$$(".pad-container button")[1].classList.contains("on"); await h.click(h.$$(".pad-container button")[1]); return ok1 && !h.$$(".pad-container button")[1].classList.contains("on"); } },
      { msg: "Clicking one pad doesn't change the others", fn: async (h) => { await h.click(h.$$(".pad-container button")[0]); return h.$$(".pad-container button").map((b) => b.classList.contains("on")).join() === "false,false,true,false,true,false,true,false"; } },
      { msg: "State stays in App; Pad gets a function prop to call", fn: async (h) => /useState/.test(h.src("App.jsx")) && !/useState/.test(h.src("Pad.jsx")) && /\.map\(/.test(h.src("App.jsx")) },
    ] },
    { t: "h", h: "Refactoring Chef Claude into components" },
    { t: "p", h: "<code>App</code> is getting long. Move the list and the recipe box into <code>IngredientsList</code> and <code>ClaudeRecipe</code>. The ingredients state stays in <code>Main</code>, because both children need it: <code>IngredientsList</code> gets <code>ingredients</code> and a <code>getRecipe</code> function; <code>ClaudeRecipe</code> gets the recipe text." },
    { t: "h", h: "Talking to an AI model" },
    { t: "p", h: "To call a real model like Claude, you sign up for an API key and send the ingredients in a prompt. The Anthropic SDK looks like this:" },
    { t: "code", lang: "javascript", code: `import Anthropic from "@anthropic-ai/sdk"

const SYSTEM_PROMPT = \`You are an assistant that receives a list of ingredients that a user has
and suggests a recipe they could make with some or all of those ingredients.
Format your response in markdown.\`

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function getRecipeFromChefClaude(ingredientsArr) {
  const msg = await anthropic.messages.create({
    model: "claude-sonnet-5-5",
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: \`I have \${ingredientsArr.join(", ")}. Please give me a recipe you'd recommend I make!\` }],
  })
  return msg.content[0].text
}` },
    { t: "callout", kind: "warn", h: "Never ship an API key in frontend code. Anyone can open DevTools, copy it and run up your bill. In production, the browser calls <i>your</i> server (or a serverless function), and only the server holds the key. You'll build exactly that in the Node and Express modules." },
    { t: "p", h: "In the lab, the practice API stands in for the model: <code>POST " + API + "/chef/recipe</code> with <code>{ ingredients: [...] }</code> returns <code>{ recipe: \"…markdown…\" }</code>, so you can build the whole flow now and swap in a real model later." },
    { t: "quiz", q: "Where should an AI API key live in a production app?", opts: ["In a constant in App.jsx", "In localStorage", "On a server (or serverless function) that the frontend calls", "In the HTML"], a: 2, why: "Anything shipped to the browser is public. The server keeps the secret and forwards the request." },
    { t: "h", h: "Project: Chef Claude" },
    { t: "rplay", api: true, task: "Add four ingredients and click <b>Get a recipe</b>. Then change <code>getRecipe</code> to show a loading message while waiting.", files: {
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
      "components/Main.jsx": `import { useState } from "react"
import IngredientsList from "./IngredientsList"
import ClaudeRecipe from "./ClaudeRecipe"
import { getRecipeFromChefClaude } from "../ai"

export default function Main() {
  const [ingredients, setIngredients] = useState(["chicken", "all the main spices", "corn", "heavy cream"])
  const [recipe, setRecipe] = useState("")

  async function getRecipe() {
    const recipeMarkdown = await getRecipeFromChefClaude(ingredients)
    setRecipe(recipeMarkdown)
  }

  function addIngredient(formData) {
    const newIngredient = formData.get("ingredient").trim()
    if (newIngredient) setIngredients(prev => [...prev, newIngredient])
  }

  return (
    <main>
      <form action={addIngredient} className="add-ingredient-form">
        <input type="text" placeholder="e.g. oregano" aria-label="Add ingredient" name="ingredient" />
        <button>+ Add ingredient</button>
      </form>
      {ingredients.length > 0 && <IngredientsList ingredients={ingredients} getRecipe={getRecipe} />}
      {recipe && <ClaudeRecipe recipe={recipe} />}
    </main>
  )
}
`,
      "components/IngredientsList.jsx": `export default function IngredientsList({ ingredients, getRecipe }) {
  const items = ingredients.map(ingredient => <li key={ingredient}>{ingredient}</li>)
  return (
    <section>
      <h2>Ingredients on hand:</h2>
      <ul className="ingredients-list" aria-live="polite">{items}</ul>
      {ingredients.length > 3 && (
        <div className="get-recipe-container">
          <div>
            <h3>Ready for a recipe?</h3>
            <p>Generate a recipe from your list of ingredients.</p>
          </div>
          <button onClick={getRecipe}>Get a recipe</button>
        </div>
      )}
    </section>
  )
}
`,
      "components/ClaudeRecipe.jsx": `import Markdown from "./Markdown"

export default function ClaudeRecipe({ recipe }) {
  return (
    <section className="suggested-recipe-container" aria-live="polite">
      <h2>Chef Claude Recommends:</h2>
      <Markdown>{recipe}</Markdown>
    </section>
  )
}
`,
      "components/Markdown.jsx": MARKDOWN,
      "components/Header.jsx": CHEF_HEADER,
      "ai.js": `// The practice API plays the AI chef. Swap this for a call to your own server later.
export async function getRecipeFromChefClaude(ingredients) {
  const res = await fetch("${API}/chef/recipe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ingredients }),
  })
  if (!res.ok) throw new Error("The chef is busy (HTTP " + res.status + ")")
  const data = await res.json()
  return data.recipe
}
`,
      "index.css": CHEF_CSS,
    } },
    { t: "recap", items: ["Events: pass a function to <code>onClick</code>, don't call it", "State = memory + “render again”: <code>const [x, setX] = useState(initial)</code>", "Use <code>setX(prev => …)</code> when the new value depends on the old one", "Never mutate state: create new arrays and objects", "Forms: <code>action={fn}</code> gets FormData; every field needs a <code>name</code>", "Conditional rendering with <code>&&</code>, ternaries and early returns; beware rendering <code>0</code>", "Values go down as props, changes come up through function props", "API keys belong on a server, never in the browser"] },
  ]},

  /* ───────────────────────── Side Effects ───────────────────────── */
  { id: "rx-effects", title: "Side Effects", min: 75, kind: "lesson", body: [
    { t: "p", h: "React's job is to turn state into UI. Anything outside that job (fetching data, timers, subscriptions, talking to browser APIs) is a <b>side effect</b>. In this lesson you'll build a <b>meme generator</b> that loads its images from an API." },
    { t: "h", h: "Meme generator: state" },
    { t: "code", lang: "jsx", code: `const [meme, setMeme] = useState({
  topText: "One does not simply",
  bottomText: "Walk into Mordor",
  imageUrl: "http://i.imgflip.com/1bij.jpg",
})` },
    { t: "h", h: "Controlled components" },
    { t: "p", h: "So far, form fields kept their own value and we read it on submit (<b>uncontrolled</b>). For a live preview we need the value in state on every keystroke. A <b>controlled</b> input gets its <code>value</code> from state and reports changes with <code>onChange</code>, so React state is the single source of truth." },
    { t: "code", lang: "jsx", code: `function handleChange(event) {
  const { value, name } = event.currentTarget
  setMeme(prevMeme => ({ ...prevMeme, [name]: value }))   // computed key: one handler for every field
}

<input type="text" name="topText" value={meme.topText} onChange={handleChange} />
<input type="text" name="bottomText" value={meme.bottomText} onChange={handleChange} />` },
    { t: "callout", kind: "warn", h: "A <code>value</code> without an <code>onChange</code> makes the input read-only, and React warns about it in the console. Use <code>defaultValue</code> if you don't want to control it." },
    { t: "h", h: "Planning the data fetch, and why render must stay pure" },
    { t: "p", h: "React expects your component to be a <b>pure function</b> of its props and state: same inputs, same JSX, no changes to the outside world while rendering. What if you fetch right in the component body?" },
    { t: "code", lang: "jsx", code: `function App() {
  const [memes, setMemes] = useState([])
  fetch("${API}/memes")                         // ✗ runs on every render…
    .then(res => res.json())
    .then(data => setMemes(data.data.memes))    // …which sets state, which renders again, which fetches again…
}` },
    { t: "p", h: "That's an infinite loop: render → fetch → setState → render → fetch. We need a way to run code <i>after</i> rendering, and only when something relevant changed. That's <code>useEffect</code>." },
    { t: "h", h: "useEffect" },
    { t: "code", lang: "jsx", code: `useEffect(() => {
  // runs after React has updated the DOM
  return () => {
    // optional cleanup: runs before the effect re-runs, and when the component unmounts
  }
}, [dependencies])` },
    { t: "video", name: "effect" },
    { t: "steps", items: [
      "<b>No dependency array</b>: runs after every render (rarely what you want)",
      "<b><code>[]</code></b>: runs once, after the first render, e.g. fetching initial data",
      "<b><code>[userId]</code></b>: runs after the first render and again whenever <code>userId</code> changes",
      "Include every prop and state value the effect uses; React compares them with <code>Object.is</code>",
    ] },
    { t: "callout", kind: "tip", h: "In development, <code>&lt;StrictMode&gt;</code> mounts every component, unmounts it and mounts it again, so your effects run twice. It's deliberate: if a missing cleanup causes a bug, you see it straight away. It doesn't happen in production." },
    { t: "quiz", q: "An effect fetches comments for <code>postId</code>. Which dependency array is right?", opts: ["No array", "[]", "[postId]", "[comments]"], a: 2, why: "The effect depends on postId, so it should re-run when postId changes. Putting <code>comments</code> there would re-fetch every time you set them: a loop." },
    { t: "h", h: "Fetching memes" },
    { t: "code", lang: "jsx", code: `const [allMemes, setAllMemes] = useState([])

useEffect(() => {
  fetch("${API}/memes")
    .then(res => res.json())
    .then(data => setAllMemes(data.data.memes))
}, [])

function getMemeImage() {
  const randomNumber = Math.floor(Math.random() * allMemes.length)
  const newMemeUrl = allMemes[randomNumber].url
  setMeme(prevMeme => ({ ...prevMeme, imageUrl: newMemeUrl }))
}` },
    { t: "callout", kind: "tip", h: "The effect function itself can't be <code>async</code>, because it must return a cleanup function, not a promise. Define an async function inside it and call it: <code>useEffect(() => { async function load() { … } load() }, [])</code>." },
    { t: "rch", api: true, prompt: "Finish the meme generator. Make both inputs <b>controlled</b> (values from <code>meme</code> state, one <code>handleChange</code> using the input's <code>name</code>), fetch the memes from <code>" + API + "/memes</code> <b>once</b> in a <code>useEffect</code>, and make the button pick a random meme image.", files: {
      "Main.jsx": `import { useState, useEffect } from "react"

export default function Main() {
  const [meme, setMeme] = useState({
    topText: "One does not simply",
    bottomText: "Walk into Mordor",
    imageUrl: "",
  })
  const [allMemes, setAllMemes] = useState([])

  return (
    <main>
      <div className="form">
        <label>Top Text
          <input type="text" placeholder="One does not simply" name="topText" />
        </label>
        <label>Bottom Text
          <input type="text" placeholder="Walk into Mordor" name="bottomText" />
        </label>
        <button>Get a new meme image 🖼</button>
      </div>
      <div className="meme">
        {meme.imageUrl && <img src={meme.imageUrl} alt="Meme" />}
        <span className="top">{meme.topText}</span>
        <span className="bottom">{meme.bottomText}</span>
      </div>
    </main>
  )
}
`,
      "App.jsx": `import Main from "./Main"

export default function App() {
  return (
    <>
      <header><span aria-hidden="true">🤡</span><h1>Meme Generator</h1></header>
      <Main />
    </>
  )
}
`,
      "index.css": MEME_CSS,
    }, solution: {
      "Main.jsx": `import { useState, useEffect } from "react"

export default function Main() {
  const [meme, setMeme] = useState({
    topText: "One does not simply",
    bottomText: "Walk into Mordor",
    imageUrl: "",
  })
  const [allMemes, setAllMemes] = useState([])

  useEffect(() => {
    fetch("${API}/memes")
      .then(res => res.json())
      .then(data => {
        setAllMemes(data.data.memes)
        setMeme(prev => ({ ...prev, imageUrl: data.data.memes[0].url }))
      })
  }, [])

  function getMemeImage() {
    const randomNumber = Math.floor(Math.random() * allMemes.length)
    setMeme(prevMeme => ({ ...prevMeme, imageUrl: allMemes[randomNumber].url }))
  }

  function handleChange(event) {
    const { value, name } = event.currentTarget
    setMeme(prevMeme => ({ ...prevMeme, [name]: value }))
  }

  return (
    <main>
      <div className="form">
        <label>Top Text
          <input type="text" placeholder="One does not simply" name="topText" value={meme.topText} onChange={handleChange} />
        </label>
        <label>Bottom Text
          <input type="text" placeholder="Walk into Mordor" name="bottomText" value={meme.bottomText} onChange={handleChange} />
        </label>
        <button onClick={getMemeImage}>Get a new meme image 🖼</button>
      </div>
      <div className="meme">
        {meme.imageUrl && <img src={meme.imageUrl} alt="Meme" />}
        <span className="top">{meme.topText}</span>
        <span className="bottom">{meme.bottomText}</span>
      </div>
    </main>
  )
}
`,
    }, tests: [
      { msg: "Inputs show the text from state", fn: async (h) => h.$("input[name=topText]").value === "One does not simply" && h.$("input[name=bottomText]").value === "Walk into Mordor" },
      { msg: "Typing updates the meme text live", fn: async (h) => { await h.type("input[name=topText]", "When the tests pass"); await h.type("input[name=bottomText]", "On the first try"); return h.text(".meme .top") === "When the tests pass" && h.text(".meme .bottom") === "On the first try"; } },
      { msg: "Fetches the memes in an effect, once (not on every render)", fn: async (h) => { await h.until(() => h.fetches.some((u) => /\/memes/.test(u)), 2000); await h.type("input[name=topText]", "a"); await h.type("input[name=topText]", "ab"); await h.tick(700); const n = h.fetches.filter((u) => /\/memes/.test(u)).length; return n >= 1 && n <= 2 && /useEffect\(/.test(h.src("Main.jsx")); } },
      { msg: "The button shows a random meme image from the API", fn: async (h) => {
        await h.tick(700);
        const btn = h.button("new meme");
        const seen = new Set();
        for (let i = 0; i < 6; i++) { await h.click(btn); const img = h.$(".meme img"); if (img) seen.add(img.getAttribute("src")); }
        return [...seen].filter((s) => s.startsWith("data:image")).length >= 2;
      } },
    ] },
    { t: "h", h: "Cleaning up effects" },
    { t: "p", h: "Effects that start something (a listener, a timer, a subscription, a WebSocket) must stop it in the cleanup function. Otherwise it keeps running after the component is gone." },
    { t: "rplay", task: "Resize the preview panel to see the width change. Toggle the tracker off and on: the console shows the cleanup running. Remove the <code>return</code> line and toggle a few times to see listeners pile up.", files: {
      "App.jsx": `import { useState } from "react"
import WindowTracker from "./WindowTracker"

export default function App() {
  const [show, setShow] = useState(true)
  return (
    <main>
      <button onClick={() => setShow(prev => !prev)}>Toggle WindowTracker</button>
      {show && <WindowTracker />}
    </main>
  )
}
`,
      "WindowTracker.jsx": `import { useState, useEffect } from "react"

let listeners = 0

export default function WindowTracker() {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth)

  useEffect(() => {
    function watchWindowWidth() {
      setWindowWidth(window.innerWidth)
    }
    window.addEventListener("resize", watchWindowWidth)
    console.log("listener added, total:", ++listeners)

    return () => {
      window.removeEventListener("resize", watchWindowWidth)
      console.log("cleanup ran, total:", --listeners)
    }
  }, [])

  return <h1>Window width: {windowWidth}px</h1>
}
`,
      "index.css": `body { font-family: system-ui, sans-serif; padding: 20px; } button { font: inherit; padding: 8px 12px; }`,
    } },
    { t: "h", h: "Sneak peek: refs" },
    { t: "p", h: "Sometimes you need the actual DOM node: to focus an input, measure an element, or scroll to it. <code>useRef</code> gives you a box whose <code>.current</code> React fills with the element. Unlike state, changing a ref doesn't cause a re-render." },
    { t: "code", lang: "jsx", code: `const recipeSection = useRef(null)

useEffect(() => {
  if (recipe && recipeSection.current) {
    recipeSection.current.scrollIntoView({ behavior: "smooth" })
  }
}, [recipe])

<div ref={recipeSection}>…</div>` },
    { t: "quiz", q: "Which of these belongs in a useEffect rather than directly in the component body?", opts: ["Computing fullName from firstName and lastName", "Subscribing to a WebSocket", "Filtering a list before rendering it"], a: 1, why: "A subscription reaches outside React and needs cleanup. Values you can compute from props and state should just be computed during render." },
    { t: "callout", kind: "key", h: "You might not need an effect. If a value can be calculated from props or state, calculate it while rendering. Effects are for <b>synchronising with something outside React</b>." },
    { t: "recap", items: ["Rendering must be pure; side effects go in <code>useEffect</code>", "Controlled inputs: <code>value</code> + <code>onChange</code>, state is the source of truth", "Dependencies decide when an effect re-runs: none, <code>[]</code>, or <code>[a, b]</code>", "Return a cleanup function for listeners, timers and subscriptions", "Effects can't be async themselves; call an async function inside", "<code>useRef</code> reaches DOM nodes without re-rendering"] },
  ]},
];
