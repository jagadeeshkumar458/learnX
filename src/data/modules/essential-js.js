/* Module 7 — Essential JavaScript.
   Lesson titles match the course syllabus so the full topic lists attach automatically. */

export const ESSENTIAL_JS = {
  id: "js2",
  title: "Essential JavaScript",
  blurb: "Learn intermediate JavaScript and ES6 concepts in order to build more sophisticated projects.",
  concepts: ["Array methods: map, filter, reduce", "Destructuring, spread, rest", "Event delegation and data attributes", "Modules and imports", "Forms and FormData"],
  lessons: [
  /* ───────────────────────── Welcome ───────────────────────── */
  { id: "ejs-welcome", title: "Welcome to Essential JavaScript", min: 6, kind: "lesson", body: [
    { t: "p", h: "You can already write variables, functions, loops and DOM updates. This module turns that into the JavaScript you'll meet in real codebases: modern ES6+ syntax, array methods, forms, and a way of structuring apps that keeps working as they grow." },
    { t: "h", h: "The big idea: data first" },
    { t: "p", h: "Beginner code often treats the page as the source of truth: read a number out of the HTML, add one, write it back. That falls apart fast. Professional apps keep the <b>data</b> in JavaScript, <b>render</b> the page from that data, and when the user does something, <b>update the data and render again</b>." },
    { t: "diagram", name: "app-loop" },
    { t: "callout", kind: "key", h: "The DOM is a picture of your data, not the place your data lives. React, Vue and every modern framework are built on this exact loop." },
    { t: "h", h: "What you'll build" },
    { t: "steps", items: ["<b>Cookie consent modal</b>: timers, forms, validation and <code>FormData</code>", "<b>Meme picker</b>: radio inputs, <code>e.target</code>, <code>classList</code> and <code>filter()</code>", "<b>Twimba</b>, an X clone: data attributes, event delegation, copying objects", "<b>Mini projects</b>: the ES6 toolbox, from destructuring to classes and <code>try…catch</code>", "<b>Restaurant ordering app</b>: your solo project, putting it all together"] },
    { t: "quiz", q: "A user likes a tweet. In the data-first approach, what should your code do?", opts: ["Read the like count from the HTML, add 1, and write it back", "Update the tweet object in your data array, then re-render", "Reload the page so the server sends new HTML"], a: 1, why: "The data is the single source of truth. Change it, then render from it, and the page can never drift out of sync with your data." },
    { t: "recap", items: ["Keep data in JavaScript arrays and objects", "Render the page from the data", "On events: update the data, then render again", "This loop is the foundation of every UI framework"] }
  ]},

  /* ───────────────────────── Cookie consent ───────────────────────── */
  { id: "ejs-cookie", title: "Build a Cookie Consent", min: 40, kind: "build", body: [
    { t: "p", h: "Every site seems to have one: a cookie banner that slides in, asks for consent and collects a few details. Building one teaches timers, styling from JavaScript, and, most importantly, <b>forms</b>, which you'll use in almost every app you ever build." },
    { t: "h", h: "setTimeout: run code later" },
    { t: "code", lang: "javascript", code: `const modal = document.getElementById("modal")

// run this function once, after 1500 milliseconds
setTimeout(function () {
  modal.style.display = "inline"
}, 1500)` },
    { t: "p", h: "<code>setTimeout</code> takes a function and a delay in <b>milliseconds</b>, runs the function once, and returns an id you can pass to <code>clearTimeout(id)</code> to cancel it. Its sibling <code>setInterval</code> repeats every N milliseconds until you call <code>clearInterval</code>." },
    { t: "quiz", q: "What does this print? <code>console.log(\"A\"); setTimeout(() =&gt; console.log(\"B\"), 0); console.log(\"C\")</code>", opts: ["A B C", "A C B", "B A C"], a: 1, why: "Even with a 0 ms delay, the timer callback waits until the current code has finished running. JavaScript finishes the synchronous code first (A, C), then runs queued callbacks (B). You'll see why in the Async JavaScript module." },
    { t: "h", h: "element.style vs classList" },
    { t: "code", lang: "javascript", code: `// inline style: fine for a quick one-off
modal.style.display = "none"

// classes: better for states you switch between
modal.classList.add("open")
modal.classList.remove("open")
modal.classList.toggle("reverse")   // adds if missing, removes if present
modal.classList.contains("open")    // true or false` },
    { t: "callout", kind: "tip", h: "Prefer <code>classList</code>. Your styles stay in CSS where they belong, and one class can change many properties at once." },
    { t: "h", h: "Forms: let the browser do the work" },
    { t: "code", lang: "html", code: `<form id="consent-form">
  <label for="full-name">Name</label>
  <input id="full-name" name="fullName" type="text" required minlength="2">

  <label for="email">Email</label>
  <input id="email" name="email" type="email" required>

  <button type="submit">Accept</button>
</form>` },
    { t: "p", h: "Three details matter. A <code>&lt;label for&gt;</code> that matches the input's <code>id</code> makes the label clickable and announced by screen readers. The <code>name</code> attribute is the key you'll use to read the value. Validation attributes like <code>required</code>, <code>type=\"email\"</code>, <code>minlength</code> and <code>pattern</code> make the browser block bad input and show a message for free." },
    { t: "h", h: "Submitting: listen on the form, then preventDefault" },
    { t: "code", lang: "javascript", code: `const form = document.getElementById("consent-form")

form.addEventListener("submit", function (e) {
  e.preventDefault()             // stop the page from reloading
  const data = new FormData(form)
  const name = data.get("fullName")   // reads the input with name="fullName"
  console.log("Hello", name)
})` },
    { t: "p", h: "By default, submitting a form sends a request and reloads the page, wiping your JavaScript state. <code>e.preventDefault()</code> cancels that default behaviour so you can handle the data yourself. Listen for <code>submit</code> on the form rather than <code>click</code> on the button: pressing Enter in an input also submits, and the browser only fires <code>submit</code> once validation has passed." },
    { t: "diagram", name: "form-flow" },
    { t: "h", h: "FormData" },
    { t: "code", lang: "javascript", code: `const data = new FormData(form)
data.get("email")                       // one value
data.has("email")                       // true / false
for (const [key, value] of data) { }    // every field
const values = Object.fromEntries(data) // { fullName: "Sam", email: "sam@x.io" }` },
    { t: "callout", kind: "warn", h: "<code>FormData</code> only includes inputs that have a <code>name</code>. If <code>data.get()</code> returns <code>null</code>, a missing <code>name</code> attribute is the usual culprit." },
    { t: "play", task: "Submit the form with your name. Then make the Decline button jump to the other side when it's hovered, using classList.toggle on the button row.", html: `<div class="modal" id="modal">
  <button class="close" id="close" disabled>✕</button>
  <div id="inner">
    <h2>We use cookies 🍪</h2>
    <p>Accept to continue. We promise we're only collecting the essentials.</p>
    <form id="consent-form">
      <input name="fullName" placeholder="Your name" required minlength="2">
      <input name="email" type="email" placeholder="you@example.com" required>
      <div class="row" id="row">
        <button type="submit">Accept</button>
        <button type="button" id="decline">Decline</button>
      </div>
    </form>
  </div>
</div>`, css: `body{font-family:system-ui;background:#e9edf5;margin:0;min-height:100vh}
.modal{display:none;position:fixed;inset:auto 16px 16px;max-width:380px;margin:auto;background:white;padding:22px;border-radius:16px;box-shadow:0 20px 50px rgba(0,0,0,.2)}
h2{margin:0 0 6px} p{margin:0 0 12px;color:#5b6481}
input{display:block;width:100%;box-sizing:border-box;padding:10px;margin-bottom:8px;border:1px solid #ccd;border-radius:8px}
.row{display:flex;gap:8px}
.row.reverse{flex-direction:row-reverse}
button{flex:1;padding:10px;border:0;border-radius:8px;font-weight:700;cursor:pointer;background:#141a2e;color:white}
#decline{background:#eee;color:#141a2e}
.close{position:absolute;top:8px;right:8px;width:30px;flex:none;padding:4px;background:#eee;color:#141a2e}
.close:disabled{opacity:.3;cursor:not-allowed}`, js: `const modal = document.getElementById("modal")
const form = document.getElementById("consent-form")
const inner = document.getElementById("inner")
const closeBtn = document.getElementById("close")

setTimeout(() => { modal.style.display = "block" }, 1000)

closeBtn.addEventListener("click", () => { modal.style.display = "none" })

form.addEventListener("submit", (e) => {
  e.preventDefault()
  const data = new FormData(form)
  const name = data.get("fullName")
  console.log("Form data:", JSON.stringify(Object.fromEntries(data)))

  inner.innerHTML = "<p>Saving your preferences…</p>"
  setTimeout(() => {
    inner.innerHTML = "<h2>Thanks!</h2><p></p>"
    inner.querySelector("p").textContent = "You're all set, " + name + ". Enjoy the site."
    closeBtn.disabled = false
  }, 1500)
})

// TODO: hovering #decline should toggle the "reverse" class on #row` },
    { t: "htmlch", prompt: "Write an accessible newsletter form: a <code>&lt;label&gt;</code> linked to an email input with <code>for</code>/<code>id</code>, an input with <code>type=\"email\"</code>, <code>required</code> and a <code>name</code>, and a submit button.", html: `<form>\n  \n</form>`, css: "", checks: [
      { msg: "A form element", fn: (d) => !!d.querySelector("form") },
      { msg: "An email input that is required", fn: (d) => !!d.querySelector('input[type="email"][required]') },
      { msg: "The email input has a name attribute", fn: (d) => [...d.querySelectorAll('input[type="email"]')].some((i) => (i.getAttribute("name") || "").trim()) },
      { msg: "A label whose for matches the input's id", fn: (d) => [...d.querySelectorAll("label[for]")].some((l) => { const id = l.getAttribute("for"); return [...d.querySelectorAll("input")].some((i) => i.id && i.id === id); }) },
      { msg: "A submit button", fn: (d) => [...d.querySelectorAll("button, input[type=submit]")].some((b) => (b.getAttribute("type") || "submit") === "submit") }
    ]},
    { t: "jsch", fn: "validateSignup", prompt: "Browser validation is a first line of defence; real apps validate in JavaScript too. Write <code>validateSignup({ name, email })</code> returning an array of error messages: <code>\"Name is required\"</code> if the name is empty or only spaces, and <code>\"Email is invalid\"</code> unless the email contains an <code>@</code> and a <code>.</code> after it. Return <code>[]</code> when everything is valid.", starter: `function validateSignup({ name, email }) {
  const errors = []

  return errors
}`, tests: [
      { msg: "Valid input → []", fn: (f) => JSON.stringify(f({ name: "Sam", email: "sam@site.io" })) === "[]" },
      { msg: "Blank name → [\"Name is required\"]", fn: (f) => JSON.stringify(f({ name: "   ", email: "sam@site.io" })) === '["Name is required"]' },
      { msg: "\"sam@site\" → [\"Email is invalid\"]", fn: (f) => JSON.stringify(f({ name: "Sam", email: "sam@site" })) === '["Email is invalid"]' },
      { msg: "Both wrong → 2 errors, name first", fn: (f) => JSON.stringify(f({ name: "", email: "nope" })) === '["Name is required","Email is invalid"]' }
    ]},
    { t: "quiz", q: "Why listen for <code>submit</code> on the form instead of <code>click</code> on the button?", opts: ["Buttons can't have click listeners", "Submit also fires when the user presses Enter, and only after the browser's validation passes", "It's faster"], a: 1, why: "The submit event covers every way a form can be submitted, and the browser won't fire it while required fields are invalid." },
    { t: "quiz", q: "<code>new FormData(form).get(\"phone\")</code> returns <code>null</code> even though the user typed a number. Most likely cause?", opts: ["The input has no name=\"phone\" attribute", "FormData only reads text inputs", "You forgot preventDefault"], a: 0, why: "FormData collects fields by their name attribute. An id alone isn't enough." },
    { t: "recap", items: ["<code>setTimeout(fn, ms)</code> runs once; <code>clearTimeout</code> cancels", "Use <code>classList.add/remove/toggle</code> for states", "Label every input with a matching <code>for</code>/<code>id</code>", "Validation attributes: <code>required</code>, <code>type</code>, <code>minlength</code>, <code>pattern</code>", "On <code>submit</code>: <code>e.preventDefault()</code>, then <code>new FormData(form)</code>"] }
  ]},

  /* ───────────────────────── Meme app ───────────────────────── */
  { id: "ejs-meme", title: "Build a Meme App", min: 40, kind: "build", body: [
    { t: "p", h: "A meme picker: choose an emotion, optionally tick “animated only”, and get a matching cat. It's a playful app with serious lessons: rendering inputs from data, reading what the user clicked, and filtering arrays." },
    { t: "h", h: "Data lives in its own file" },
    { t: "code", lang: "javascript", code: `// data.js
export const catsData = [
  { emotionTags: ["moody"], isGif: false, image: "angry.jpeg", alt: "A cat looking moody" },
  { emotionTags: ["happy", "relaxed"], isGif: true, image: "happy.gif", alt: "A cat dancing" },
  // ...
]

// index.js
import { catsData } from "./data.js"` },
    { t: "p", h: "Modules let you split code into files. <code>export</code> makes something available, <code>import</code> brings it in. In the browser, load your entry file with <code>&lt;script type=\"module\" src=\"index.js\"&gt;</code>. Modules need to be served over http (a dev server or hosting), not opened as a local file." },
    { t: "h", h: "for…of: a loop you can read" },
    { t: "code", lang: "javascript", code: `// collect every emotion once, in the order first seen
function getEmotionsArray(cats) {
  const emotions = []
  for (const cat of cats) {
    for (const emotion of cat.emotionTags) {
      if (!emotions.includes(emotion)) emotions.push(emotion)
    }
  }
  return emotions
}` },
    { t: "p", h: "<code>for…of</code> gives you each item directly, with no index bookkeeping. Use the classic <code>for (let i = 0; …)</code> only when you actually need the index." },
    { t: "h", h: "Radio inputs from data" },
    { t: "code", lang: "javascript", code: `function renderEmotionsRadios(cats) {
  let radioItems = ""
  for (const emotion of getEmotionsArray(cats)) {
    radioItems += \`
      <div class="radio">
        <label for="\${emotion}">\${emotion}</label>
        <input type="radio" id="\${emotion}" value="\${emotion}" name="emotion-radios">
      </div>\`
  }
  emotionRadios.innerHTML = radioItems
}` },
    { t: "callout", kind: "tip", h: "Radios that share a <code>name</code> form a group: only one can be checked. The <code>value</code> is what you read back." },
    { t: "h", h: "e.target and parentElement" },
    { t: "code", lang: "javascript", code: `emotionRadios.addEventListener("change", function (e) {
  // e.target: the element that actually changed (one radio)
  // e.currentTarget: the element the listener is on (the container)
  for (const radio of document.getElementsByClassName("radio")) {
    radio.classList.remove("highlight")
  }
  e.target.parentElement.classList.add("highlight")
})` },
    { t: "p", h: "One listener on the container handles every radio, because <code>change</code> events bubble up from the input. <code>e.target</code> tells you which one it was, and <code>parentElement</code> walks up to its wrapper so you can highlight it." },
    { t: "h", h: "querySelector vs getElementsByClassName" },
    { t: "p", h: "<code>getElementsByClassName</code> returns a <b>live</b> HTMLCollection that updates as the DOM changes and has no <code>forEach</code>. <code>querySelectorAll</code> returns a <b>static</b> NodeList with <code>forEach</code>, and takes any CSS selector, which makes this possible:" },
    { t: "code", lang: "javascript", code: `const checked = document.querySelector('input[type="radio"]:checked')
const selectedEmotion = checked ? checked.value : null
const gifsOnly = document.getElementById("gifs-only").checked   // checkbox → true/false` },
    { t: "h", h: "filter(): keep what matches" },
    { t: "code", lang: "javascript", code: `function getMatchingCatsArray(cats, emotion, gifsOnly) {
  return cats.filter(function (cat) {
    if (gifsOnly) return cat.emotionTags.includes(emotion) && cat.isGif
    return cat.emotionTags.includes(emotion)
  })
}` },
    { t: "p", h: "<code>filter</code> calls your function for each item and returns a <b>new</b> array containing the items where it returned <code>true</code>. The original array is untouched." },
    { t: "h", h: "Small functions, clear order" },
    { t: "p", h: "The finished app is a chain of small functions, each with one job: <code>getMatchingCatsArray()</code> finds candidates, <code>getSingleCatObject()</code> picks one (directly if there's only one, otherwise at random), and <code>renderCat()</code> puts it on screen. When something breaks, you know exactly which function to look at." },
    { t: "code", lang: "javascript", code: `function getSingleCatObject() {
  const cats = getMatchingCatsArray(catsData, selectedEmotion, gifsOnly)
  if (cats.length === 1) return cats[0]
  return cats[Math.floor(Math.random() * cats.length)]
}` },
    { t: "play", task: "Pick an emotion and press the button. Then add a new cat to the data with a new emotion tag: its radio appears automatically, because the UI is rendered from data.", html: `<main>
  <h1>Cat Meme Picker</h1>
  <p class="hint">How are you feeling?</p>
  <div id="emotion-radios"></div>
  <label class="check"><input type="checkbox" id="gifs-only"> Animated only</label>
  <button id="get-image">Get meme</button>
  <div id="result"></div>
</main>`, css: `body{font-family:system-ui;background:#1b1f33;color:#eee;margin:0;padding:20px}
main{max-width:420px;margin:auto}
h1{margin:0 0 4px}.hint{color:#9aa3c7;margin:0 0 12px}
#emotion-radios{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px}
.radio{display:flex;align-items:center;gap:6px;padding:6px 10px;border:1.5px solid #3a4468;border-radius:999px;text-transform:capitalize}
.radio.highlight{border-color:#ff7a45;background:#3a2117}
.radio input{accent-color:#ff7a45}
.check{display:block;margin-bottom:12px}
button{width:100%;padding:12px;border:0;border-radius:10px;background:#ff7a45;color:white;font-weight:800;font-size:15px;cursor:pointer}
#result{margin-top:16px;text-align:center;font-size:96px;min-height:110px}
#result small{display:block;font-size:14px;color:#9aa3c7}`, js: `const catsData = [
  { emotionTags: ["happy", "relaxed"], isGif: false, image: "😺", alt: "A smiling cat" },
  { emotionTags: ["happy"], isGif: true, image: "😸", alt: "A cat grinning (animated)" },
  { emotionTags: ["moody", "sad"], isGif: false, image: "😾", alt: "A grumpy cat" },
  { emotionTags: ["sad"], isGif: true, image: "😿", alt: "A crying cat (animated)" },
  { emotionTags: ["shocked"], isGif: true, image: "🙀", alt: "A shocked cat (animated)" },
  { emotionTags: ["relaxed", "sleepy"], isGif: false, image: "😽", alt: "A sleepy cat" }
]

const emotionRadios = document.getElementById("emotion-radios")

function getEmotionsArray(cats) {
  const emotions = []
  for (const cat of cats) {
    for (const emotion of cat.emotionTags) {
      if (!emotions.includes(emotion)) emotions.push(emotion)
    }
  }
  return emotions
}

function renderEmotionsRadios(cats) {
  let html = ""
  for (const emotion of getEmotionsArray(cats)) {
    html += \`<label class="radio" for="\${emotion}">
      <input type="radio" id="\${emotion}" value="\${emotion}" name="emotion"> \${emotion}
    </label>\`
  }
  emotionRadios.innerHTML = html
}

emotionRadios.addEventListener("change", (e) => {
  for (const r of document.getElementsByClassName("radio")) r.classList.remove("highlight")
  e.target.parentElement.classList.add("highlight")
})

function getMatchingCatsArray() {
  const checked = document.querySelector('input[type="radio"]:checked')
  if (!checked) return []
  const gifsOnly = document.getElementById("gifs-only").checked
  return catsData.filter((cat) => cat.emotionTags.includes(checked.value) && (!gifsOnly || cat.isGif))
}

function getSingleCatObject() {
  const cats = getMatchingCatsArray()
  if (cats.length <= 1) return cats[0]
  return cats[Math.floor(Math.random() * cats.length)]
}

document.getElementById("get-image").addEventListener("click", () => {
  const cat = getSingleCatObject()
  const result = document.getElementById("result")
  if (!cat) { result.innerHTML = "<small>Pick an emotion (or untick animated only)</small>"; return }
  result.innerHTML = cat.image + "<small></small>"
  result.querySelector("small").textContent = cat.alt
  console.log("Matched:", cat.alt)
})

renderEmotionsRadios(catsData)` },
    { t: "jsch", fn: "getEmotions", prompt: "Write <code>getEmotions(cats)</code> returning every emotion tag exactly once, in the order first seen.", starter: `function getEmotions(cats) {

}`, tests: [
      { msg: "Two cats with overlap → [\"happy\",\"relaxed\",\"sad\"]", fn: (f) => JSON.stringify(f([{ emotionTags: ["happy", "relaxed"] }, { emotionTags: ["sad", "happy"] }])) === '["happy","relaxed","sad"]' },
      { msg: "No cats → []", fn: (f) => JSON.stringify(f([])) === "[]" }
    ]},
    { t: "jsch", fn: "getMatchingCats", prompt: "Write <code>getMatchingCats(cats, emotion, gifsOnly)</code> returning the cats tagged with <code>emotion</code>; when <code>gifsOnly</code> is true, only those with <code>isGif: true</code>. Don't change the original array.", starter: `function getMatchingCats(cats, emotion, gifsOnly) {

}`, tests: [
      { msg: "Matches by emotion", fn: (f) => f([{ emotionTags: ["happy"], isGif: false }, { emotionTags: ["sad"], isGif: true }], "happy", false).length === 1 },
      { msg: "gifsOnly filters out still images", fn: (f) => f([{ emotionTags: ["happy"], isGif: false }, { emotionTags: ["happy"], isGif: true }], "happy", true).length === 1 },
      { msg: "Original array unchanged", fn: (f) => { const a = [{ emotionTags: ["happy"], isGif: false }, { emotionTags: ["sad"], isGif: false }]; f(a, "happy", false); return a.length === 2; } },
      { msg: "No match → []", fn: (f) => f([{ emotionTags: ["happy"], isGif: false }], "shocked", false).length === 0 }
    ]},
    { t: "quiz", q: "A listener is on a container div, and the user clicks a radio inside it. What is <code>e.target</code>?", opts: ["The container div", "The radio input that was clicked", "The document"], a: 1, why: "<code>e.target</code> is where the event started. <code>e.currentTarget</code> is the element the listener is attached to, here the container." },
    { t: "quiz", q: "What does <code>[3, 8, 1].filter(n =&gt; n &gt; 2)</code> return, and what happens to the original array?", opts: ["[3, 8]; the original is unchanged", "[3, 8]; the original becomes [3, 8]", "true"], a: 0, why: "filter always returns a new array and never mutates the one you call it on." },
    { t: "recap", items: ["<code>export</code>/<code>import</code> split code into modules", "<code>for…of</code> loops over items directly", "Radios share a <code>name</code>; read the <code>value</code>", "<code>e.target</code> is what was clicked; <code>parentElement</code> walks up", "<code>querySelector(':checked')</code> finds the selected radio", "<code>filter()</code> returns a new array of matches"] }
  ]},

  /* ───────────────────────── X clone ───────────────────────── */
  { id: "ejs-x", title: "Build an X Clone", min: 55, kind: "build", body: [
    { t: "p", h: "Twimba is a working X/Twitter clone: a feed, likes, retweets, replies and new tweets. It's the most important project in this module, because it uses the exact architecture behind real social apps." },
    { t: "h", h: "The data" },
    { t: "code", lang: "javascript", code: `export const tweetsData = [
  {
    handle: "@TrollBot66756542 💎",
    profilePic: "images/troll.jpg",
    likes: 27,
    retweets: 10,
    tweetText: "Buy Bitcoin, ETH Make 💰💰💰 low low prices.",
    replies: [],
    isLiked: false,
    isRetweeted: false,
    uuid: "4b161eee-c0f5-4545-9c4b-8562944223ee",
  },
  // ...
]` },
    { t: "p", h: "Each tweet has a <b>uuid</b>, a universally unique id. That's how a button in the HTML points back to the exact object in the data. Generate new ones with <code>crypto.randomUUID()</code>." },
    { t: "h", h: "Building HTML with forEach" },
    { t: "code", lang: "javascript", code: `function getFeedHtml() {
  let feedHtml = ""
  tweetsData.forEach(function (tweet) {
    feedHtml += \`
      <div class="tweet">
        <p class="handle">\${tweet.handle}</p>
        <p>\${tweet.tweetText}</p>
        <span><i class="fa-solid fa-heart" data-like="\${tweet.uuid}"></i> \${tweet.likes}</span>
        <span><i class="fa-solid fa-retweet" data-retweet="\${tweet.uuid}"></i> \${tweet.retweets}</span>
      </div>\`
  })
  return feedHtml
}

function render() {
  document.getElementById("feed").innerHTML = getFeedHtml()
}` },
    { t: "p", h: "The icons come from <b>Font Awesome</b>, loaded with a single <code>&lt;link&gt;</code> to its CDN stylesheet. Then any <code>&lt;i class=\"fa-solid fa-heart\"&gt;</code> becomes an icon." },
    { t: "h", h: "Data attributes" },
    { t: "code", lang: "javascript", code: `// HTML: <i data-like="4b16…" data-tweet-id="42"></i>
e.target.dataset.like      // "4b16…"
e.target.dataset.tweetId   // "42"  ← kebab-case becomes camelCase` },
    { t: "callout", kind: "warn", h: "Write data attribute names in lowercase kebab-case: <code>data-tweet-id</code>. HTML lowercases attribute names, so <code>data-tweetId</code> silently becomes <code>dataset.tweetid</code>." },
    { t: "h", h: "Event delegation: one listener for everything" },
    { t: "p", h: "The feed is rebuilt on every render, so listeners attached to individual icons would be thrown away each time. Instead, put <b>one</b> listener on the document and ask what was clicked." },
    { t: "code", lang: "javascript", code: `document.addEventListener("click", function (e) {
  if (e.target.dataset.like) {
    handleLikeClick(e.target.dataset.like)
  } else if (e.target.dataset.retweet) {
    handleRetweetClick(e.target.dataset.retweet)
  } else if (e.target.dataset.reply) {
    handleReplyClick(e.target.dataset.reply)
  } else if (e.target.id === "tweet-btn") {
    handleTweetBtnClick()
  }
})` },
    { t: "video", name: "delegation" },
    { t: "diagram", name: "delegation-flow" },
    { t: "h", h: "Liking a tweet" },
    { t: "code", lang: "javascript", code: `function handleLikeClick(tweetId) {
  const targetTweetObj = tweetsData.filter(function (tweet) {
    return tweet.uuid === tweetId
  })[0]                    // or: tweetsData.find(t => t.uuid === tweetId)

  if (targetTweetObj.isLiked) {
    targetTweetObj.likes--
  } else {
    targetTweetObj.likes++
  }
  targetTweetObj.isLiked = !targetTweetObj.isLiked   // flip the boolean
  render()
}` },
    { t: "p", h: "<code>filter()</code> returns an array, so <code>[0]</code> takes the first match. <code>find()</code> returns the object directly, or <code>undefined</code> if nothing matches. Either way, you update the <b>data</b>, then call <code>render()</code>." },
    { t: "h", h: "Copying objects and arrays" },
    { t: "code", lang: "javascript", code: `const a = { likes: 1, replies: [] }
const b = a              // NOT a copy: both names point at the same object
b.likes = 99             // a.likes is now 99 too

const c = { ...a }       // shallow copy: new object, top-level values copied
c.likes = 5              // a.likes stays 99
c.replies.push("hi")     // …but replies is shared, so a.replies changes too!

const d = structuredClone(a)   // deep copy: nested objects copied as well` },
    { t: "callout", kind: "key", h: "Assignment copies a <b>reference</b>, not the object. Spread (<code>{...obj}</code>, <code>[...arr]</code>) copies one level deep. <code>structuredClone()</code> copies all the way down." },
    { t: "h", h: "Conditional classes, replies and new tweets" },
    { t: "code", lang: "javascript", code: `const likeIconClass = tweet.isLiked ? "liked" : ""
// <i class="fa-solid fa-heart \${likeIconClass}" data-like="\${tweet.uuid}"></i>

function handleReplyClick(replyId) {
  document.getElementById(\`replies-\${replyId}\`).classList.toggle("hidden")
}

function handleTweetBtnClick() {
  const input = document.getElementById("tweet-input")
  if (!input.value.trim()) return          // UX: ignore empty tweets
  tweetsData.unshift({
    handle: "@Scrimba", profilePic: "images/scrimbalogo.png",
    likes: 0, retweets: 0, tweetText: input.value, replies: [],
    isLiked: false, isRetweeted: false, uuid: crypto.randomUUID(),
  })
  render()
  input.value = ""                          // UX: clear the box
}` },
    { t: "play", task: "Like, retweet and open replies. Post a tweet. Then fix the bug: posting an empty tweet should do nothing.", html: `<main>
  <div class="compose">
    <textarea id="tweet-input" placeholder="What's happening?"></textarea>
    <button id="tweet-btn">Tweet</button>
  </div>
  <div id="feed"></div>
</main>`, css: `body{font-family:system-ui;background:#f5f7fb;margin:0;padding:16px;color:#141a2e}
main{max-width:460px;margin:auto}
.compose{display:grid;gap:8px;margin-bottom:12px}
textarea{border:1px solid #d5dae8;border-radius:12px;padding:10px;font:inherit;resize:vertical;min-height:56px}
#tweet-btn{justify-self:end;background:#1d9bf0;color:white;border:0;border-radius:999px;padding:8px 18px;font-weight:800;cursor:pointer}
.tweet{background:white;border:1px solid #e3e7f1;border-radius:14px;padding:12px 14px;margin-bottom:8px}
.handle{font-weight:800;margin:0 0 4px}.text{margin:0 0 8px}
.details{display:flex;gap:18px;color:#5b6481;font-size:14px}
.details span{cursor:pointer;user-select:none}
.liked{color:#e0245e}.retweeted{color:#17bf63}
.replies{margin-top:8px;border-top:1px solid #eee;padding-top:6px;font-size:14px}
.hidden{display:none}`, js: `const tweetsData = [
  { handle: "@ShipyardDev", tweetText: "Data first, then render. Every time.", likes: 12, retweets: 3,
    replies: [{ handle: "@newbie", tweetText: "This finally clicked for me!" }], isLiked: false, isRetweeted: false, uuid: "t1" },
  { handle: "@ByteSized", tweetText: "Event delegation: one listener to rule them all.", likes: 4, retweets: 1,
    replies: [], isLiked: false, isRetweeted: false, uuid: "t2" }
]

document.addEventListener("click", (e) => {
  const { like, retweet, reply } = e.target.dataset
  if (like) handleLikeClick(like)
  else if (retweet) handleRetweetClick(retweet)
  else if (reply) document.getElementById("replies-" + reply).classList.toggle("hidden")
  else if (e.target.id === "tweet-btn") handleTweetBtnClick()
})

function handleLikeClick(id) {
  const tweet = tweetsData.find((t) => t.uuid === id)
  tweet.likes += tweet.isLiked ? -1 : 1
  tweet.isLiked = !tweet.isLiked
  render()
}

function handleRetweetClick(id) {
  const tweet = tweetsData.find((t) => t.uuid === id)
  tweet.retweets += tweet.isRetweeted ? -1 : 1
  tweet.isRetweeted = !tweet.isRetweeted
  render()
}

function handleTweetBtnClick() {
  const input = document.getElementById("tweet-input")
  // TODO: ignore empty or whitespace-only tweets
  tweetsData.unshift({ handle: "@You", tweetText: input.value, likes: 0, retweets: 0,
    replies: [], isLiked: false, isRetweeted: false, uuid: crypto.randomUUID() })
  input.value = ""
  render()
}

function getFeedHtml() {
  return tweetsData.map((t) => \`
    <div class="tweet">
      <p class="handle"></p><p class="text"></p>
      <div class="details">
        <span data-reply="\${t.uuid}">💬 \${t.replies.length}</span>
        <span data-like="\${t.uuid}" class="\${t.isLiked ? "liked" : ""}">\${t.isLiked ? "❤️" : "🤍"} \${t.likes}</span>
        <span data-retweet="\${t.uuid}" class="\${t.isRetweeted ? "retweeted" : ""}">🔁 \${t.retweets}</span>
      </div>
      <div class="replies hidden" id="replies-\${t.uuid}"></div>
    </div>\`).join("")
}

function render() {
  const feed = document.getElementById("feed")
  feed.innerHTML = getFeedHtml()
  // user-written text goes in with textContent, never innerHTML
  feed.querySelectorAll(".tweet").forEach((el, i) => {
    const t = tweetsData[i]
    el.querySelector(".handle").textContent = t.handle
    el.querySelector(".text").textContent = t.tweetText
    const box = el.querySelector(".replies")
    t.replies.forEach((r) => { const p = document.createElement("p"); p.textContent = r.handle + ": " + r.tweetText; box.append(p) })
    if (!t.replies.length) box.textContent = "No replies yet."
  })
  console.log("rendered", tweetsData.length, "tweets")
}

render()` },
    { t: "jsch", fn: "toggleLike", prompt: "Write <code>toggleLike(tweet)</code> that returns a <b>new</b> tweet object with <code>isLiked</code> flipped and <code>likes</code> increased by 1 (if it wasn't liked) or decreased by 1 (if it was). The original object must not change.", starter: `function toggleLike(tweet) {

}`, tests: [
      { msg: "Unliked → liked, likes + 1", fn: (f) => { const r = f({ likes: 3, isLiked: false, uuid: "a" }); return r.likes === 4 && r.isLiked === true; } },
      { msg: "Liked → unliked, likes − 1", fn: (f) => { const r = f({ likes: 4, isLiked: true, uuid: "a" }); return r.likes === 3 && r.isLiked === false; } },
      { msg: "Original object unchanged", fn: (f) => { const t = { likes: 3, isLiked: false, uuid: "a" }; const r = f(t); return t.likes === 3 && t.isLiked === false && r !== t; } },
      { msg: "Other fields kept", fn: (f) => f({ likes: 0, isLiked: false, uuid: "zz", tweetText: "hi" }).tweetText === "hi" }
    ]},
    { t: "jsch", fn: "addTweet", prompt: "Write <code>addTweet(tweets, text)</code> that returns a <b>new</b> array with a new tweet <code>{ tweetText, likes: 0, isLiked: false, uuid }</code> at the <b>start</b>. If <code>text</code> is empty or only spaces, return the original array unchanged. Use <code>crypto.randomUUID()</code> for the uuid.", starter: `function addTweet(tweets, text) {

}`, tests: [
      { msg: "New tweet goes first", fn: (f) => { const r = f([{ tweetText: "old" }], "new"); return r.length === 2 && r[0].tweetText === "new"; } },
      { msg: "New tweet has likes 0, isLiked false and a uuid", fn: (f) => { const t = f([], "hi")[0]; return t.likes === 0 && t.isLiked === false && typeof t.uuid === "string" && t.uuid.length > 8; } },
      { msg: "Original array not mutated", fn: (f) => { const a = [{ tweetText: "old" }]; f(a, "new"); return a.length === 1; } },
      { msg: "Blank text → same array returned", fn: (f) => { const a = [{ tweetText: "old" }]; return f(a, "   ") === a; } }
    ]},
    { t: "quiz", q: "Your HTML has <code>data-tweet-id=\"7\"</code>. How do you read it in JavaScript?", opts: ["el.dataset.tweet-id", "el.dataset.tweetId", "el.data.tweetid"], a: 1, why: "dataset converts kebab-case attribute names to camelCase properties." },
    { t: "quiz", q: "<code>const copy = { ...user }; copy.address.city = \"Pune\"</code>. Does <code>user.address.city</code> change?", opts: ["No, copy is a new object", "Yes, spread is a shallow copy so address is shared", "It throws an error"], a: 1, why: "Spread copies only the top level. Nested objects are still shared. Use structuredClone for a deep copy." },
    { t: "quiz", q: "Why put one click listener on the document instead of one on each like icon?", opts: ["Icons can't have listeners", "The feed is re-rendered, which would destroy per-icon listeners; one delegated listener keeps working and handles new tweets too", "It makes clicks faster for the user"], a: 1, why: "That's event delegation: events bubble up, so one listener higher in the tree can handle clicks from elements that didn't exist when it was added." },
    { t: "recap", items: ["Give every record a unique id (<code>crypto.randomUUID()</code>)", "<code>data-*</code> attributes link elements to data; read with <code>dataset</code>", "Event delegation: one listener on a parent, check <code>e.target</code>", "<code>find()</code> returns one object; <code>filter()</code> returns an array", "Assignment shares a reference; spread copies one level; <code>structuredClone</code> copies deeply", "Update data → <code>render()</code>"] }
  ]},

  /* ───────────────────────── Mini projects: the ES6 toolbox ───────────────────────── */
  { id: "ejs-mini", title: "Mini Projects", min: 75, kind: "lesson", body: [
    { t: "p", h: "This is your modern JavaScript toolbox. Each section is short, with code you can run in the scratchpad at the end. You'll see every one of these features in real codebases and interviews." },
    { t: "h", h: "1. Destructuring" },
    { t: "code", lang: "javascript", code: `const dish = { name: "Pizza", price: 14, tags: ["veg"] }

const { name, price } = dish                 // pull properties into variables
const { name: dishName } = dish              // rename
const { spice = "mild" } = dish              // default if missing
const [first, second] = ["a", "b", "c"]      // arrays: by position

function describe({ name, price }) {         // destructure parameters
  return \`\${name} costs £\${price}\`
}` },
    { t: "h", h: "2. map() and join()" },
    { t: "gif", name: "array-pipeline" },
    { t: "code", lang: "javascript", code: `const prices = [14, 9, 4]
const doubled = prices.map(p => p * 2)       // [28, 18, 8] — same length, new array

const html = ["Pizza", "Burger"]
  .map(item => \`<li>\${item}</li>\`)
  .join("")                                   // "<li>Pizza</li><li>Burger</li>"` },
    { t: "callout", kind: "tip", h: "Without <code>.join(\"\")</code>, an array put into <code>innerHTML</code> is converted with commas between items, so stray commas appear on the page." },
    { t: "h", h: "3. break and continue" },
    { t: "code", lang: "javascript", code: `for (const order of orders) {
  if (order.cancelled) continue   // skip this one, carry on
  if (order.total > 1000) break   // stop the whole loop
  ship(order)
}` },
    { t: "h", h: "4. The dangers of innerHTML" },
    { t: "code", lang: "javascript", code: `const comment = '<img src=x onerror="stealCookies()">'
el.innerHTML = comment     // runs attacker code (XSS)
el.textContent = comment   // shows the text safely

const li = document.createElement("li")   // or build elements
li.textContent = comment
list.append(li)` },
    { t: "h", h: "5. Function expressions and arrow functions" },
    { t: "code", lang: "javascript", code: `greet()                                  // works: declarations are hoisted
function greet() { return "hi" }

const shout = function (text) {          // function expression: not usable before this line
  return text.toUpperCase()
}

const square = n => n * n                // arrow: one param, implicit return
const add = (a, b) => a + b
const makeDish = name => ({ name })      // returning an object needs ( )
const log = () => { console.log("hi") }  // braces: you must write return yourself` },
    { t: "callout", kind: "key", h: "Arrow functions don't have their own <code>this</code>. They use the <code>this</code> of the surrounding code, which is great inside callbacks and wrong for object methods." },
    { t: "h", h: "6. import and export" },
    { t: "code", lang: "javascript", code: `// utils.js
export function formatPrice(n) { return "£" + n.toFixed(2) }   // named export
export default function getTotal(items) { /* … */ }           // one default per file

// index.js
import getTotal, { formatPrice } from "./utils.js"` },
    { t: "h", h: "7. reduce()" },
    { t: "video", name: "reduce" },
    { t: "code", lang: "javascript", code: `const prices = [12, 8, 5]
const total = prices.reduce((acc, price) => acc + price, 0)   // 25

const items = [{ cat: "mains" }, { cat: "drinks" }, { cat: "mains" }]
const counts = items.reduce((acc, item) => {
  acc[item.cat] = (acc[item.cat] || 0) + 1
  return acc
}, {})                                                         // { mains: 2, drinks: 1 }` },
    { t: "callout", kind: "warn", h: "Always pass the initial value (the <code>0</code> or <code>{}</code>). Without it, reduce uses the first item as the start, which breaks on objects and throws a TypeError on an empty array." },
    { t: "h", h: "8. Default parameters" },
    { t: "code", lang: "javascript", code: `function getTotal(items, discount = 0) {
  return items.reduce((a, i) => a + i.price, 0) * (1 - discount)
}` },
    { t: "h", h: "9. The ternary operator" },
    { t: "code", lang: "javascript", code: `const label = score >= 50 ? "pass" : "fail"

// chained for 3 outcomes: readable when lined up, but don't go deeper
const grade = score >= 90 ? "A"
            : score >= 70 ? "B"
            : "C"` },
    { t: "h", h: "10. Rest parameters and spread syntax" },
    { t: "code", lang: "javascript", code: `function sum(...nums) {                // rest: gather arguments into an array
  return nums.reduce((a, n) => a + n, 0)
}
sum(1, 2, 3)                             // 6

const more = [...prices, 20]             // spread: expand an array
Math.max(...prices)                      // spread into arguments
const updated = { ...dish, price: 12 }   // copy and override` },
    { t: "h", h: "11. Short-circuiting with || and &&" },
    { t: "code", lang: "javascript", code: `const name = user.nickname || "Guest"     // first truthy value
isLoggedIn && showDashboard()            // run only if the left side is truthy

const qty = 0
qty || 1     // 1  ← oops, 0 is falsy
qty ?? 1     // 0  ← ?? only falls back on null or undefined` },
    { t: "h", h: "12. switch" },
    { t: "code", lang: "javascript", code: `switch (category) {
  case "starter":
  case "side":                 // two cases share one block
    discount = 0.1
    break
  case "main":
    discount = 0.05
    break
  default:
    discount = 0
}` },
    { t: "callout", kind: "warn", h: "Forget a <code>break</code> and execution falls through into the next case." },
    { t: "h", h: "13. Date and Error" },
    { t: "code", lang: "javascript", code: `const now = new Date()
now.getFullYear()                              // 2026
now.toLocaleDateString("en-IN")                // "7/11/2026"

function withdraw(amount) {
  if (amount <= 0) throw new Error("Amount must be positive")
}` },
    { t: "h", h: "14. Objects with methods, this, and classes" },
    { t: "code", lang: "javascript", code: `const gamer = {
  name: "Dave", score: 0,
  incrementScore() { this.score++ }     // this = the object before the dot
}
gamer.incrementScore()

// constructor function (older style)
function Character(name, health) {
  this.name = name
  this.health = health
}
Character.prototype.takeDamage = function (n) { this.health -= n }

// class: the same thing, modern syntax
class Hero {
  constructor(name, health = 100) {
    this.name = name
    this.health = health
  }
  takeDamage(n) { this.health = Math.max(0, this.health - n) }
  get isAlive() { return this.health > 0 }
}
const wizard = new Hero("Wizard")` },
    { t: "h", h: "15. Debugging: reading errors and try…catch" },
    { t: "p", h: "<b>ReferenceError</b>: you used a name that doesn't exist (often a typo). <b>TypeError</b>: you used a value the wrong way, like calling <code>undefined()</code> or reading a property of <code>null</code>. <b>SyntaxError</b>: the code can't even be parsed, like a missing bracket. Read the message and the line number before anything else." },
    { t: "code", lang: "javascript", code: `try {
  const data = JSON.parse(localStorage.getItem("cart"))
  render(data)
} catch (err) {
  console.error("Couldn't load the cart:", err.message)
  render([])
} finally {
  hideSpinner()          // runs whether it worked or not
}` },
    { t: "play", task: "A scratchpad for the whole toolbox. Run it, read the console, then change things and predict the output before you run again.", html: `<p style="font-family:system-ui">Everything here prints to the console below ↓</p>`, css: "", js: `const menu = [
  { name: "Pizza", price: 14, cat: "mains" },
  { name: "Burger", price: 9, cat: "mains" },
  { name: "Lemonade", price: 4, cat: "drinks" }
]

// destructuring + template string
const [{ name, price }] = menu
console.log(\`First item: \${name} at £\${price}\`)

// map + join
console.log(menu.map(({ name }) => name).join(", "))

// filter + reduce
const mainsTotal = menu.filter(i => i.cat === "mains").reduce((a, i) => a + i.price, 0)
console.log("Mains total:", mainsTotal)

// reduce into an object
console.log(menu.reduce((acc, i) => ({ ...acc, [i.cat]: (acc[i.cat] || 0) + 1 }), {}))

// rest + default parameters
const sum = (...nums) => nums.reduce((a, n) => a + n, 0)
const withTip = (total, tip = 0.1) => +(total * (1 + tip)).toFixed(2)
console.log(sum(1, 2, 3), withTip(27))

// ?? vs ||
const qty = 0
console.log(qty || 1, qty ?? 1)

// classes
class Order {
  constructor(items = []) { this.items = items }
  add(item) { this.items.push(item); return this }
  get total() { return this.items.reduce((a, i) => a + i.price, 0) }
}
console.log(new Order().add(menu[0]).add(menu[2]).total)

// try...catch
try { JSON.parse("{oops") } catch (e) { console.log("Caught:", e.name) }` },
    { t: "jsch", fn: "getTotal", prompt: "Write <code>getTotal(items, discount = 0)</code> using <code>reduce</code>: the sum of every <code>item.price</code>, reduced by <code>discount</code> (0.1 means 10% off), rounded to 2 decimal places as a number.", starter: `function getTotal(items, discount = 0) {

}`, tests: [
      { msg: "Sums prices: [12, 8, 5] → 25", fn: (f) => f([{ price: 12 }, { price: 8 }, { price: 5 }]) === 25 },
      { msg: "Discount: 10% off 25 → 22.5", fn: (f) => f([{ price: 12 }, { price: 8 }, { price: 5 }], 0.1) === 22.5 },
      { msg: "Rounds: 3 × 3.33 with 15% off → 8.49", fn: (f) => f([{ price: 3.33 }, { price: 3.33 }, { price: 3.33 }], 0.15) === 8.49 },
      { msg: "Empty → 0", fn: (f) => f([]) === 0 }
    ]},
    { t: "jsch", fn: "countBy", prompt: "Write <code>countBy(items, key)</code> that uses <code>reduce</code> to count items by the value of <code>key</code>. <code>countBy([{cat:\"a\"},{cat:\"b\"},{cat:\"a\"}], \"cat\")</code> → <code>{ a: 2, b: 1 }</code>.", starter: `function countBy(items, key) {

}`, tests: [
      { msg: "Counts categories", fn: (f) => JSON.stringify(f([{ cat: "a" }, { cat: "b" }, { cat: "a" }], "cat")) === '{"a":2,"b":1}' },
      { msg: "Works with any key", fn: (f) => JSON.stringify(f([{ size: "L" }, { size: "L" }], "size")) === '{"L":2}' },
      { msg: "Empty → {}", fn: (f) => JSON.stringify(f([], "cat")) === "{}" }
    ]},
    { t: "jsch", fn: "Hero", prompt: "Write a <code>class Hero</code> with a constructor <code>(name, health = 100)</code>, a <code>takeDamage(n)</code> method that never lets health go below 0, and a getter <code>isAlive</code>.", starter: `class Hero {

}`, tests: [
      { msg: "new Hero(\"Ann\").health → 100", fn: (f) => new f("Ann").health === 100 },
      { msg: "takeDamage(30) → health 70", fn: (f) => { const h = new f("Ann"); h.takeDamage(30); return h.health === 70; } },
      { msg: "Health never below 0", fn: (f) => { const h = new f("Ann", 20); h.takeDamage(50); return h.health === 0; } },
      { msg: "isAlive flips to false at 0", fn: (f) => { const h = new f("Ann", 10); const a = h.isAlive; h.takeDamage(10); return a === true && h.isAlive === false; } }
    ]},
    { t: "quiz", q: "What does <code>[1, 2, 3].map(n =&gt; { n * 2 })</code> return?", opts: ["[2, 4, 6]", "[undefined, undefined, undefined]", "An error"], a: 1, why: "With curly braces, an arrow function needs an explicit return. Write <code>n =&gt; n * 2</code> or <code>n =&gt; { return n * 2 }</code>." },
    { t: "quiz", q: "<code>const stock = 0; const shown = stock || \"Out of stock\"</code>. What is <code>shown</code>?", opts: ["0", "\"Out of stock\"", "undefined"], a: 1, why: "0 is falsy, so || falls back. If 0 is a valid value, use <code>stock ?? \"Unknown\"</code>, which only falls back on null or undefined." },
    { t: "quiz", q: "Which line throws a ReferenceError?", opts: ["undefined.name", "consle.log(\"hi\")", "JSON.parse(\"{\")"], a: 1, why: "consle doesn't exist, so it's a ReferenceError. Reading a property of undefined is a TypeError, and invalid JSON is a SyntaxError." },
    { t: "recap", items: ["Destructuring pulls values out of objects and arrays", "<code>map</code> transforms, <code>filter</code> selects, <code>reduce</code> combines; <code>join(\"\")</code> before innerHTML", "Arrow functions: short syntax, implicit return, no own <code>this</code>", "Rest gathers, spread expands; <code>??</code> is safer than <code>||</code> for 0 and \"\"", "Classes bundle data and methods; <code>this</code> is the instance", "Read error names; wrap risky code in <code>try…catch</code>"] }
  ]},

  /* ───────────────────────── Solo project ───────────────────────── */
  { id: "ejs-restaurant", title: "Solo Project - Restaurant Ordering app", min: 90, kind: "solo", body: [
    { t: "p", h: "Build a restaurant ordering app on your own: a menu rendered from data, an order you can add to and remove from, a running total, and a payment form. It uses every major idea from this module, which makes it a great portfolio piece." },
    { t: "diagram", name: "restaurant-arch" },
    { t: "h", h: "Requirements" },
    { t: "steps", items: ["Render the menu from a <code>menuArray</code> using <code>map()</code> and <code>join(\"\")</code>", "Each item has a <b>+</b> button with a <code>data-add</code> attribute holding the item's id", "Handle every click with <b>one</b> delegated listener on the document", "Keep the order in an array; re-render the order section from it on every change", "Each order line has a <b>remove</b> button (<code>data-remove</code>)", "Show the total with <code>reduce()</code>; hide the order section when it's empty", "<b>Complete order</b> opens a payment modal with a <code>&lt;form&gt;</code>: name, card number and CVV, all <code>required</code>", "On submit: <code>preventDefault()</code>, read the name with <code>FormData</code>, close the modal and show “Thanks, {name}! Your order is on its way!”", "Stretch: a meal-deal discount, a star rating after ordering, or a dark mode toggle"] },
    { t: "callout", kind: "tip", h: "Start with the data and a <code>render()</code> function that draws the menu. Get one click working end to end before adding the next feature." },
    { t: "play", task: "Your starter. The data and layout are ready; the JavaScript is yours. Work through the requirements above.", html: `<header><h1>Jimmy's Diner</h1><p>The best burgers and pizzas in town.</p></header>
<main>
  <section id="menu"></section>
  <section id="order" class="hidden">
    <h2>Your order</h2>
    <div id="order-items"></div>
    <div class="total"><span>Total price:</span><span id="total">£0</span></div>
    <button id="complete-btn" class="primary">Complete order</button>
  </section>
  <p id="thanks" class="hidden"></p>
</main>
<div id="modal" class="modal hidden">
  <form id="pay-form">
    <h3>Enter card details</h3>
    <input name="name" placeholder="Enter your name" required>
    <input name="card" placeholder="Enter card number" required inputmode="numeric" minlength="12">
    <input name="cvv" placeholder="Enter CVV" required inputmode="numeric" minlength="3" maxlength="4">
    <button class="primary">Pay</button>
  </form>
</div>`, css: `*{box-sizing:border-box}body{font-family:"Smythe",system-ui;margin:0;background:#fff;color:#3c3c3c}
header{background:#2b2b2b;color:#fff;padding:24px 20px}header h1{margin:0}header p{margin:4px 0 0;opacity:.8}
main{max-width:520px;margin:auto;padding:12px 20px 40px}
.item{display:grid;grid-template-columns:56px 1fr auto;gap:14px;align-items:center;padding:16px 0;border-bottom:1px solid #ddd}
.emoji{font-size:44px;text-align:center}.item h3{margin:0}.item p{margin:2px 0;color:#8b8b8b}
.add{width:40px;height:40px;border-radius:50%;border:1px solid #ddd;background:#fff;font-size:22px;cursor:pointer}
.line{display:flex;justify-content:space-between;align-items:center;margin:6px 0}
.remove{border:0;background:none;color:#bbb;cursor:pointer;margin-left:6px}
.total{display:flex;justify-content:space-between;border-top:2px solid #3c3c3c;padding-top:10px;margin:12px 0;font-weight:700}
.primary{width:100%;padding:14px;border:0;background:#16db99;color:#fff;font-weight:700;font-size:16px;border-radius:6px;cursor:pointer}
.modal{position:fixed;inset:0;display:grid;place-items:center;background:rgba(0,0,0,.35)}
.modal form{background:#fff;padding:24px;border-radius:8px;width:min(340px,90vw);display:grid;gap:10px}
.modal input{padding:12px;border:1px solid #757575;border-radius:4px}
#thanks{background:#ecfdf5;color:#065f46;padding:20px;text-align:center;font-weight:700}
.hidden{display:none}`, js: `const menuArray = [
  { name: "Pizza", ingredients: ["pepperoni", "mushroom", "mozzarella"], id: 0, price: 14, emoji: "🍕" },
  { name: "Hamburger", ingredients: ["beef", "cheese", "lettuce"], id: 1, price: 12, emoji: "🍔" },
  { name: "Beer", ingredients: ["grain, hops, yeast, water"], id: 2, price: 12, emoji: "🍺" }
]

let order = []

function renderMenu() {
  document.getElementById("menu").innerHTML = menuArray.map((item) => \`
    <div class="item">
      <div class="emoji">\${item.emoji}</div>
      <div><h3>\${item.name}</h3><p>\${item.ingredients.join(", ")}</p><p>£\${item.price}</p></div>
      <button class="add" data-add="\${item.id}" aria-label="Add \${item.name}">+</button>
    </div>\`).join("")
}

// TODO 1: one document click listener handling data-add, data-remove and #complete-btn
// TODO 2: renderOrder() — lines with remove buttons, total via reduce, hide when empty
// TODO 3: submit handler on #pay-form — preventDefault, FormData, thank-you message

renderMenu()` },
    { t: "jsch", fn: "summarizeOrder", prompt: "Orders often contain the same item several times. Write <code>summarizeOrder(order)</code> that groups an array of menu items into <code>[{ name, qty, subtotal }]</code>, in the order each item first appears.", starter: `function summarizeOrder(order) {

}`, tests: [
      { msg: "Groups repeats", fn: (f) => JSON.stringify(f([{ id: 0, name: "Pizza", price: 14 }, { id: 2, name: "Beer", price: 12 }, { id: 0, name: "Pizza", price: 14 }])) === JSON.stringify([{ name: "Pizza", qty: 2, subtotal: 28 }, { name: "Beer", qty: 1, subtotal: 12 }]) },
      { msg: "Empty order → []", fn: (f) => JSON.stringify(f([])) === "[]" }
    ]},
    { t: "jsch", fn: "mealDeal", prompt: "Stretch logic: write <code>mealDeal(order)</code> that returns the total after discount. If the order contains at least one item from <b>each</b> category <code>\"food\"</code> and <code>\"drink\"</code>, take 15% off; otherwise no discount. Round to 2 decimals.", starter: `function mealDeal(order) {

}`, tests: [
      { msg: "Food + drink → 15% off", fn: (f) => f([{ price: 14, cat: "food" }, { price: 12, cat: "drink" }]) === 22.1 },
      { msg: "Food only → full price", fn: (f) => f([{ price: 14, cat: "food" }, { price: 12, cat: "food" }]) === 26 },
      { msg: "Empty → 0", fn: (f) => f([]) === 0 }
    ]},
    { t: "recap", items: ["Data arrays drive both the menu and the order", "One delegated click listener with <code>data-add</code> / <code>data-remove</code>", "<code>render()</code> after every change", "<code>reduce()</code> for totals and grouping", "Form: <code>required</code> fields, <code>preventDefault</code>, <code>FormData</code>", "Push it to GitHub and deploy it: it's portfolio-ready"] }
  ]}
  ]
};
