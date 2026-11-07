/* Module 9 — APIs and Async JavaScript.
   Playgrounds with `api: true` get the built-in practice API at https://api.shipyard.dev (see lib/mockApi.js).
   Lesson titles match the syllabus so the full topic lists attach automatically. */

const API = "https://api.shipyard.dev";

export const APIS = {
  id: "apis",
  title: "APIs and Async JavaScript",
  blurb: "APIs are the backbone of the web. Learn to use them through approachable projects.",
  concepts: ["HTTP methods and status codes", "URLs, query strings and REST", "fetch() and JSON", "Promises and async/await", "Error handling"],
  lessons: [
  /* ───────────────────────── Welcome ───────────────────────── */
  { id: "api-welcome", title: "Welcome to APIs and Async JS", min: 6, kind: "lesson", body: [
    { t: "p", h: "So far your apps have used data you typed into the code. Real apps get their data from somewhere else: weather services, payment providers, movie databases, and your own backend. They talk to those services through <b>APIs</b>. And because the network is slow and unpredictable, the code has to wait for answers without freezing the page. That's <b>asynchronous</b> JavaScript." },
    { t: "h", h: "What is an API?" },
    { t: "p", h: "An <b>Application Programming Interface</b> is an agreement about how two programs talk to each other. On the web that usually means: send an HTTP request to a URL, get a response back, usually as JSON. You don't need to know how the other side works, only what to ask for and what you'll get back." },
    { t: "callout", kind: "key", h: "Every API call is a question sent across the internet. The answer arrives later, sometimes much later, sometimes never. Async JavaScript is how you write code that waits well." },
    { t: "h", h: "Your practice API" },
    { t: "p", h: "Playgrounds in this module include a built-in practice API at <code>https://api.shipyard.dev</code>. It behaves like a real one, with network delays, status codes and JSON, but it never goes down, needs no key, and isn't rate-limited. Each endpoint mirrors a well-known public API you can switch to later." },
    { t: "code", lang: "text", code: `GET  /activity                 → a random thing to do        (like the Bored API)
GET  /dogs/random               → a random dog picture         (like Dog CEO)
GET  /posts  POST /posts        → blog posts                   (like JSONPlaceholder)
GET  /weather?city=Pune         → current weather              (like OpenWeather)
GET  /scheme?hex=F55A5A         → colour schemes               (like The Color API)
GET  /deck/new/shuffle          → a deck of cards              (like Deck of Cards)
GET  /movies?s=matrix           → movie search                 (like OMDb)
GET  /photos/random             → a background photo           (like Unsplash)
GET  /crypto/dogecoin           → crypto prices                (like CoinGecko)
GET  /error/500                 → any error status, for practice` },
    { t: "h", h: "What you'll build" },
    { t: "steps", items: ["<b>BoredBot</b>: your first fetch, showing a random activity", "<b>BlogSpace</b>: read and create posts with GET and POST", "<b>Colour scheme generator</b>: your first solo API project", "<b>War</b>: a card game driven by a deck API, using promises", "<b>Movie watchlist</b>: search, async/await and parallel requests", "<b>Personal dashboard</b>: a Chrome new-tab page combining four APIs"] },
    { t: "quiz", q: "Why doesn't <code>const data = fetch(url)</code> give you the data straight away?", opts: ["fetch only works inside functions", "The response arrives later, so fetch immediately returns a promise of a future response", "You need to call fetch twice"], a: 1, why: "fetch starts the request and returns a promise right away. You handle the data when the promise is fulfilled, with .then() or await." },
    { t: "recap", items: ["An API is a contract for how programs talk", "Web APIs: HTTP request to a URL → response, usually JSON", "Network calls are slow, so the code must be asynchronous", "Practice API: <code>https://api.shipyard.dev</code>"] }
  ]},

  /* ───────────────────────── Intro to APIs ───────────────────────── */
  { id: "api-intro", title: "Intro to APIs", min: 40, kind: "lesson", body: [
    { t: "h", h: "Clients, servers, requests and responses" },
    { t: "p", h: "The <b>client</b> is whoever asks: your browser, a phone app, or another server. The <b>server</b> is whoever answers. The client sends a <b>request</b> (where to, what it wants, any data), and the server sends back a <b>response</b> (a status code saying how it went, plus the data)." },
    { t: "video", name: "request" },
    { t: "h", h: "JSON, quickly" },
    { t: "code", lang: "json", code: `{
  "activity": "Learn a new programming language",
  "type": "education",
  "participants": 1,
  "price": 0.1,
  "tags": ["learning", "solo"],
  "isFree": false
}` },
    { t: "p", h: "JSON (JavaScript Object Notation) is text that looks like a JavaScript object, with stricter rules: keys must be in <b>double quotes</b>, strings use double quotes, no trailing commas, no comments, no functions and no <code>undefined</code>. <code>JSON.stringify(obj)</code> turns data into JSON text; <code>JSON.parse(text)</code> turns it back." },
    { t: "quiz", q: "Which of these is valid JSON?", opts: ["{ name: \"Sam\" }", "{ \"name\": \"Sam\", }", "{ \"name\": \"Sam\", \"age\": 30 }", "{ 'name': 'Sam' }"], a: 2, why: "Keys and strings need double quotes, and trailing commas aren't allowed." },
    { t: "h", h: "Your first fetch" },
    { t: "code", lang: "javascript", code: `fetch("${API}/dogs/random")
  .then(response => response.json())   // read the body as JSON (also async)
  .then(data => {
    console.log(data)                   // { message: "…image url…", status: "success" }
    document.getElementById("dog").innerHTML = \`<img src="\${data.message}" alt="A random dog">\`
  })` },
    { t: "p", h: "<code>fetch(url)</code> sends a GET request and returns a <b>promise</b>. When the response arrives, the first <code>.then()</code> receives a <code>Response</code> object with the <code>status</code>, an <code>ok</code> flag (true for 200–299) and the body. Reading the body is <i>also</i> asynchronous, so <code>response.json()</code> returns another promise, and the next <code>.then()</code> gets the parsed data." },
    { t: "callout", kind: "tip", h: "Always <code>console.log</code> the data first. Real API responses are often nested, and looking at the shape saves a lot of guessing." },
    { t: "h", h: "BoredBot" },
    { t: "p", h: "BoredBot fetches a random activity when you click a button, then celebrates. Two details make it production quality: the result area has <code>aria-live=\"polite\"</code> so screen readers announce each new activity, and the button stays a real <code>&lt;button&gt;</code> so it works with the keyboard." },
    { t: "play", api: true, task: "Click the button a few times. Then add a select menu for the activity type and pass it in the URL: /activity?type=social", html: `<main>
  <h1>BoredBot 🤖</h1>
  <p class="sub">Find something to do</p>
  <button id="get-activity">Let's go</button>
  <p id="activity" aria-live="polite"></p>
</main>`, css: `body{font-family:system-ui;background:#f4f1ff;margin:0;min-height:100vh;display:grid;place-items:center;text-align:center;transition:background .4s}
body.fun{background:linear-gradient(135deg,#ffecd2,#fcb69f)}
h1{margin:0;font-size:40px}.sub{color:#6b6b80;margin:4px 0 18px}
button{padding:12px 26px;border:0;border-radius:999px;background:#5b3df5;color:#fff;font-weight:800;font-size:16px;cursor:pointer}
#activity{font-size:22px;font-weight:700;max-width:340px;margin:20px auto 0;min-height:60px}`, js: `document.getElementById("get-activity").addEventListener("click", function () {
  fetch("${API}/activity")
    .then(res => res.json())
    .then(data => {
      console.log(data)
      document.getElementById("activity").textContent = data.activity
      document.body.classList.add("fun")
    })
})` },
    { t: "callout", kind: "warn", h: "<b>CORS:</b> browsers only let a page read responses from another domain if that server allows it. Public APIs like Dog CEO allow it. Many others, and anything needing a secret key, must be called from your own server instead, which you'll learn in the Node.js module." },
    { t: "jsch", fn: "getActivity", prompt: "Write <code>getActivity()</code> that fetches <code>https://api.shipyard.dev/activity</code> and returns a promise of the activity <b>text</b> (the <code>activity</code> field). Remember to <code>return</code> the fetch chain.", starter: `function getActivity() {

}`, tests: [
      { msg: "Returns a promise", fn: (f) => { const p = f(); return p && typeof p.then === "function"; } },
      { msg: "Resolves to the activity text", fn: async (f) => { const a = await f(); return typeof a === "string" && a.length > 8; } }
    ]},
    { t: "jsch", fn: "getDogImage", prompt: "Write <code>getDogImage()</code> returning a promise of the image URL from <code>https://api.shipyard.dev/dogs/random</code> (it's in <code>message</code>).", starter: `function getDogImage() {

}`, tests: [
      { msg: "Resolves to an image URL", fn: async (f) => { const u = await f(); return typeof u === "string" && u.startsWith("data:image"); } }
    ]},
    { t: "quiz", q: "In <code>fetch(url).then(res =&gt; res.json()).then(data =&gt; …)</code>, why is there a second <code>.then()</code>?", opts: ["To retry the request", "res.json() reads the body asynchronously and returns another promise", "Because fetch always needs two"], a: 1, why: "The body can still be streaming in when the response headers arrive, so reading it is async too." },
    { t: "recap", items: ["Client sends a request, server sends a response", "JSON: double-quoted keys, no trailing commas, no functions", "<code>fetch(url)</code> → promise of a Response", "<code>res.json()</code> → promise of the parsed data", "Use <code>aria-live</code> for content that updates", "CORS decides whether a browser may read another site's API"] }
  ]},

  /* ───────────────────────── URLs and REST ───────────────────────── */
  { id: "api-rest", title: "URLs and REST", min: 55, kind: "lesson", body: [
    { t: "h", h: "Anatomy of an HTTP request" },
    { t: "diagram", name: "http-anatomy" },
    { t: "p", h: "Every request has a <b>method</b> (what you want to do), a <b>URL</b> (which thing), optional <b>headers</b> (extra information, like the format of the body or an API key), and an optional <b>body</b> (data you're sending). The response comes back with a <b>status code</b>, headers and a body." },
    { t: "h", h: "URLs and endpoints" },
    { t: "code", lang: "text", code: `https://api.shipyard.dev   /posts   /3   /comments   ?_limit=5&userId=1
└──────── base URL ─────┘ └──── endpoint (path) ──┘ └── query string ──┘` },
    { t: "p", h: "The <b>base URL</b> stays the same for an API. The <b>endpoint</b> picks the resource. Store the base URL in a variable so switching between a test and live server is a one-line change." },
    { t: "h", h: "Methods" },
    { t: "code", lang: "text", code: `GET     read data                     GET    /posts
POST    create something new          POST   /posts
PUT     replace something entirely    PUT    /posts/3
PATCH   change part of something      PATCH  /posts/3
DELETE  remove something              DELETE /posts/3` },
    { t: "h", h: "BlogSpace part 1: GET the posts" },
    { t: "code", lang: "javascript", code: `let postsArray = []

function renderPosts() {
  document.getElementById("blog-list").innerHTML = postsArray.map(post => \`
    <article>
      <h3>\${post.title}</h3>
      <p>\${post.body}</p>
    </article>\`).join("")
}

fetch("${API}/posts")
  .then(res => res.json())
  .then(data => {
    postsArray = data.slice(0, 5)   // or ask the server: /posts?_limit=5
    renderPosts()
  })` },
    { t: "h", h: "BlogSpace part 2: POST a new post" },
    { t: "code", lang: "javascript", code: `form.addEventListener("submit", function (e) {
  e.preventDefault()
  const data = Object.fromEntries(new FormData(form))   // { title, body }

  fetch("${API}/posts", {
    method: "POST",
    body: JSON.stringify(data),                          // the body must be text
    headers: { "Content-Type": "application/json" }      // tell the server it's JSON
  })
    .then(res => res.json())
    .then(post => {
      postsArray.unshift(post)    // newest first
      renderPosts()
      form.reset()                // clear the inputs
    })
})` },
    { t: "callout", kind: "warn", h: "Forgetting <code>JSON.stringify</code> sends the text <code>[object Object]</code>. Forgetting the <code>Content-Type</code> header means many servers won't parse your JSON at all." },
    { t: "h", h: "Status codes" },
    { t: "p", h: "<b>2xx success:</b> 200 OK, 201 Created, 204 No Content. <b>4xx your mistake:</b> 400 Bad Request, 401 Unauthorized (not logged in or no key), 403 Forbidden (logged in, not allowed), 404 Not Found, 422 invalid data, 429 Too Many Requests. <b>5xx their mistake:</b> 500 Internal Server Error, 503 Service Unavailable." },
    { t: "play", api: true, task: "Publish a post and watch it appear first. Then show the status code from the POST response in the console (res.status).", html: `<header><h1>BlogSpace</h1></header>
<main>
  <form id="new-post">
    <label for="post-title">Title</label>
    <input id="post-title" name="title" required>
    <label for="post-body">Body</label>
    <textarea id="post-body" name="body" rows="3" required></textarea>
    <button>Publish</button>
  </form>
  <div id="blog-list"><p>Loading posts…</p></div>
</main>`, css: `body{font-family:Georgia,serif;margin:0;background:#fafaf7;color:#1c1c1c}
header{background:#1c1c1c;color:#fff;padding:14px 20px}header h1{margin:0;font-size:24px}
main{max-width:560px;margin:auto;padding:16px 20px}
form{display:grid;gap:6px;padding:14px;border:1px solid #ddd;border-radius:10px;background:#fff;margin-bottom:16px;font-family:system-ui}
input,textarea{font:inherit;padding:8px;border:1px solid #ccc;border-radius:6px}
button{justify-self:start;padding:8px 18px;border:0;border-radius:6px;background:#1c1c1c;color:#fff;font-weight:700;cursor:pointer}
article{border-bottom:1px solid #e5e5e0;padding:10px 0}article h3{margin:0 0 4px}article p{margin:0;color:#555}`, js: `const BASE_URL = "${API}"
const form = document.getElementById("new-post")
let postsArray = []

function renderPosts() {
  const list = document.getElementById("blog-list")
  list.innerHTML = ""
  postsArray.forEach(post => {
    const el = document.createElement("article")
    el.innerHTML = "<h3></h3><p></p>"
    el.querySelector("h3").textContent = post.title
    el.querySelector("p").textContent = post.body
    list.append(el)
  })
}

fetch(BASE_URL + "/posts?_limit=5")
  .then(res => res.json())
  .then(data => { postsArray = data; renderPosts() })

form.addEventListener("submit", (e) => {
  e.preventDefault()
  const data = Object.fromEntries(new FormData(form))
  fetch(BASE_URL + "/posts", {
    method: "POST",
    body: JSON.stringify(data),
    headers: { "Content-Type": "application/json" }
  })
    .then(res => res.json())
    .then(post => {
      console.log("Created:", JSON.stringify(post))
      postsArray.unshift(post)
      renderPosts()
      form.reset()
    })
})` },
    { t: "h", h: "REST: a predictable way to design URLs" },
    { t: "p", h: "REST APIs organise everything around <b>resources</b>, named with plural nouns, and use the HTTP method as the verb. So it's <code>DELETE /posts/3</code>, not <code>POST /deletePost?id=3</code>. Related things nest: <code>/posts/3/comments</code> means “the comments on post 3”." },
    { t: "h", h: "Path parameters vs query strings" },
    { t: "code", lang: "javascript", code: `// path parameter: identifies ONE specific resource
fetch(\`${API}/posts/\${postId}\`)

// query string: filters, sorts, pages or options
fetch("${API}/weather?city=Pune&units=metric")

// build query strings safely: URLSearchParams encodes spaces, & and more
const params = new URLSearchParams({ city: "New York", units: "imperial" })
fetch(\`${API}/weather?\${params}\`)   // ?city=New+York&units=imperial` },
    { t: "play", api: true, task: "Query-string practice: show the weather for any city. Add a °C / °F toggle by switching units between metric and imperial.", html: `<form id="wx"><input name="city" value="Pune" aria-label="City" required><button>Get weather</button></form>
<div id="out"></div>`, css: `body{font-family:system-ui;padding:18px;background:#e8f1ff}
form{display:flex;gap:8px}input{flex:1;padding:10px;border:1px solid #9ab;border-radius:8px}button{padding:10px 16px;border:0;border-radius:8px;background:#1e5eff;color:#fff;font-weight:700}
#out{margin-top:16px;font-size:20px}#out b{font-size:44px;display:block}`, js: `const form = document.getElementById("wx")
form.addEventListener("submit", (e) => {
  e.preventDefault()
  const params = new URLSearchParams({ city: new FormData(form).get("city"), units: "metric" })
  fetch("${API}/weather?" + params)
    .then(res => res.json())
    .then(data => {
      console.log(data)
      const out = document.getElementById("out")
      if (data.message) { out.textContent = "😕 " + data.message; return }
      out.innerHTML = \`\${data.weather[0].emoji} <b>\${Math.round(data.main.temp)}°C</b>\`
      out.append(data.name + ", " + data.weather[0].description)
    })
})` },
    { t: "jsch", fn: "buildUrl", prompt: "Write <code>buildUrl(base, path, params)</code> that joins a base URL, a path and an object of query parameters using <code>URLSearchParams</code>. Leave off the <code>?</code> when there are no params.", starter: `function buildUrl(base, path, params = {}) {

}`, tests: [
      { msg: "buildUrl(base, \"/posts\", { _limit: 5 })", fn: (f) => f("https://api.shipyard.dev", "/posts", { _limit: 5 }) === "https://api.shipyard.dev/posts?_limit=5" },
      { msg: "Encodes spaces: city \"New York\" → city=New+York", fn: (f) => f("https://x.io", "/weather", { city: "New York", units: "imperial" }) === "https://x.io/weather?city=New+York&units=imperial" },
      { msg: "No params → no ?", fn: (f) => f("https://x.io", "/posts", {}) === "https://x.io/posts" }
    ]},
    { t: "jsch", fn: "createPost", prompt: "Write <code>createPost(title, body)</code> that POSTs <code>{ title, body }</code> as JSON to <code>https://api.shipyard.dev/posts</code> and returns a promise of the created post (the server adds an <code>id</code>). Don't forget the body and header.", starter: `function createPost(title, body) {

}`, tests: [
      { msg: "Resolves to the created post with an id", fn: async (f) => { const p = await f("Hello", "World"); return p && p.id > 100; } },
      { msg: "Sent the title and body as JSON", fn: async (f) => { const p = await f("Async", "is fun"); return p.title === "Async" && p.body === "is fun"; } }
    ]},
    { t: "quiz", q: "You want to change only the title of post 3. Which request fits REST best?", opts: ["GET /posts/3?title=New", "PATCH /posts/3 with { \"title\": \"New\" }", "POST /updatePostTitle"], a: 1, why: "PATCH updates part of a resource. PUT would replace the whole post." },
    { t: "quiz", q: "An API returns 401. What does that usually mean?", opts: ["The server crashed", "You're not authenticated: the API key or login is missing or wrong", "The resource doesn't exist"], a: 1, why: "401 means the server doesn't know who you are. 404 is not found, 5xx means the server failed." },
    { t: "quiz", q: "Which should be a path parameter rather than a query string?", opts: ["The id of the post you want", "How many results per page", "Sorting by date"], a: 0, why: "Paths identify a specific resource; query strings filter, sort or paginate." },
    { t: "recap", items: ["Request = method + URL + headers + body; response = status + headers + body", "GET reads, POST creates, PUT replaces, PATCH updates, DELETE removes", "POST JSON: <code>JSON.stringify(body)</code> + <code>Content-Type: application/json</code>", "2xx success, 4xx client error, 5xx server error", "REST: plural nouns, nested resources, methods as verbs", "Path = which thing; query string = options; build with <code>URLSearchParams</code>"] }
  ]},

  /* ───────────────────────── Colour scheme solo ───────────────────────── */
  { id: "api-colors", title: "Solo Project - Color Scheme Generator", min: 60, kind: "solo", body: [
    { t: "p", h: "Build a colour scheme generator: pick a seed colour and a mode, and the app fetches a matching five-colour palette and shows it. It's the kind of small, polished tool that looks great in a portfolio." },
    { t: "h", h: "The endpoint" },
    { t: "code", lang: "text", code: `GET https://api.shipyard.dev/scheme?hex=F55A5A&mode=monochrome&count=5

modes: monochrome, monochrome-dark, monochrome-light, analogic,
       complement, analogic-complement, triad, quad

{ "mode": "monochrome", "count": 5,
  "colors": [ { "hex": { "value": "#5B0B0B", "clean": "5B0B0B" } }, … ] }` },
    { t: "p", h: "The real version of this API is The Color API (thecolorapi.com), which uses the same parameters." },
    { t: "h", h: "Requirements" },
    { t: "steps", items: ["An <code>&lt;input type=\"color\"&gt;</code> for the seed and a <code>&lt;select&gt;</code> for the mode", "A <b>Get color scheme</b> button that fetches the scheme", "Strip the <code>#</code> from the colour input's value before putting it in the URL", "Render five full-height colour columns with their hex codes underneath", "Show the first scheme on page load", "Stretch: click a colour or hex code to copy it (<code>navigator.clipboard.writeText</code>)", "Stretch: show an error message if the request fails"] },
    { t: "play", api: true, task: "The starter has the layout. Write the JavaScript that fetches and renders the scheme.", html: `<header>
  <input type="color" id="seed" value="#F55A5A" aria-label="Seed colour">
  <select id="mode" aria-label="Scheme mode">
    <option>monochrome</option><option>monochrome-dark</option><option>monochrome-light</option>
    <option>analogic</option><option>complement</option><option>analogic-complement</option><option>triad</option>
  </select>
  <button id="get">Get color scheme</button>
</header>
<main id="scheme"></main>`, css: `*{box-sizing:border-box}body{margin:0;font-family:Inter,system-ui;height:100vh;display:flex;flex-direction:column}
header{display:flex;gap:10px;padding:14px;box-shadow:0 2px 10px rgba(0,0,0,.08);z-index:1}
input[type=color]{width:60px;height:40px;border:1px solid #ddd;border-radius:6px;padding:2px;background:#fff}
select{flex:1;padding:8px;border:1px solid #ddd;border-radius:6px;font:inherit}
button{padding:8px 14px;border:1px solid #ddd;border-radius:6px;background:#fff;font-weight:600;cursor:pointer}
main{flex:1;display:grid;grid-template-columns:repeat(5,1fr)}
.col{display:flex;flex-direction:column;justify-content:flex-end}
.col span{background:#fff;text-align:center;padding:12px 0;font-size:13px;font-weight:600}`, js: `const BASE = "${API}"

// TODO: fetch BASE + "/scheme?hex=…&mode=…&count=5" when the button is clicked
// TODO: render each colour as <div class="col" style="background:…"><span>#HEX</span></div>
// TODO: load a scheme on page load too
` },
    { t: "jsch", fn: "schemeUrl", prompt: "Write <code>schemeUrl(hex, mode, count = 5)</code> returning the full URL. The colour input gives values like <code>\"#f55a5a\"</code>: remove the <code>#</code> and uppercase it.", starter: `function schemeUrl(hex, mode, count = 5) {

}`, tests: [
      { msg: "schemeUrl(\"#f55a5a\", \"monochrome\")", fn: (f) => f("#f55a5a", "monochrome") === "https://api.shipyard.dev/scheme?hex=F55A5A&mode=monochrome&count=5" },
      { msg: "Custom count: triad, 3", fn: (f) => f("#3d5afe", "triad", 3) === "https://api.shipyard.dev/scheme?hex=3D5AFE&mode=triad&count=3" }
    ]},
    { t: "jsch", fn: "getScheme", prompt: "Write <code>getScheme(hex, mode)</code> that fetches a 5-colour scheme and returns a promise of just the hex strings, like <code>[\"#5B0B0B\", …]</code>.", starter: `function getScheme(hex, mode) {

}`, tests: [
      { msg: "Resolves to 5 hex strings", fn: async (f) => { const c = await f("#F55A5A", "monochrome"); return Array.isArray(c) && c.length === 5 && c.every((x) => /^#[0-9A-F]{6}$/.test(x)); } },
      { msg: "Works for other modes", fn: async (f) => (await f("#3D5AFE", "analogic")).length === 5 }
    ]},
    { t: "recap", items: ["Read inputs, build the URL, fetch, render", "Strip the <code>#</code>: <code>value.slice(1)</code>", "Render from the response data with <code>map()</code>", "Load something useful on page load", "Handle errors so the UI never just goes blank"] }
  ]},

  /* ───────────────────────── Async JavaScript ───────────────────────── */
  { id: "api-async", title: "Async JavaScript", min: 75, kind: "lesson", body: [
    { t: "p", h: "JavaScript runs one thing at a time, on a single thread. If it stopped to wait for every network request, the page would freeze. Instead, it starts the slow work, carries on, and comes back when the result is ready. This lesson shows how: callbacks, promises and async/await, and the event loop that runs it all." },
    { t: "h", h: "Callbacks" },
    { t: "p", h: "A <b>callback</b> is a function you pass to another function, to be called later. You've used them all along:" },
    { t: "code", lang: "javascript", code: `setTimeout(() => console.log("later"), 1000)       // call this after 1s
button.addEventListener("click", handleClick)       // call this on each click
const adults = people.filter(p => p.age >= 18)      // call this for each item

function handleClick() { /* a named callback is easier to read and reuse */ }` },
    { t: "p", h: "Writing your own function that accepts a callback demystifies it:" },
    { t: "code", lang: "javascript", code: `function filterArray(array, callback) {
  const result = []
  for (const item of array) {
    if (callback(item)) result.push(item)
  }
  return result
}

filterArray([5, 12, 8, 1], n => n > 6)   // [12, 8]` },
    { t: "h", h: "Thought experiment: if fetch used callbacks" },
    { t: "gif", name: "async-evolution" },
    { t: "p", h: "Each step that depends on the previous one nests one level deeper, until the code drifts to the right in a “pyramid of doom”, and every level needs its own error handling. Promises were invented to flatten this out." },
    { t: "h", h: "Promises" },
    { t: "diagram", name: "promise-flow" },
    { t: "p", h: "A promise is an object representing a value that isn't ready yet. It starts <b>pending</b>, then settles exactly once: <b>fulfilled</b> with a value, or <b>rejected</b> with an error. <code>.then()</code> runs when it's fulfilled, <code>.catch()</code> when it's rejected, <code>.finally()</code> either way." },
    { t: "h", h: "Chaining" },
    { t: "code", lang: "javascript", code: `// method chaining: each method returns something you can call the next method on
"  Hello  ".trim().toUpperCase().split("")

// promise chaining: whatever a .then() returns is passed to the next .then()
fetch("${API}/deck/new/shuffle")
  .then(res => res.json())                       // returns a promise → its value goes on
  .then(data => data.deck_id)                    // returns a plain value → passed on as is
  .then(deckId => fetch(\`${API}/deck/\${deckId}/draw?count=2\`))
  .then(res => res.json())
  .then(data => console.log(data.cards))
  .catch(err => console.error("Something failed:", err))` },
    { t: "callout", kind: "key", h: "Every <code>.then()</code> returns a <b>new</b> promise. If you return a value, the next step gets that value; if you return a promise, the next step waits for it. Forget to <code>return</code>, and the next step gets <code>undefined</code>." },
    { t: "h", h: "Build War" },
    { t: "p", h: "War is a two-player card game: each player draws a card and the higher one wins the round. With the deck API, the app gets a new shuffled deck, saves its <code>deck_id</code>, draws two cards per round, compares them, keeps score, and declares a winner when the deck runs out." },
    { t: "code", lang: "javascript", code: `const valueOptions = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "JACK", "QUEEN", "KING", "ACE"]

function determineCardWinner(card1, card2) {
  const card1Value = valueOptions.indexOf(card1.value)
  const card2Value = valueOptions.indexOf(card2.value)
  if (card1Value > card2Value) return "Computer wins!"
  if (card1Value < card2Value) return "You win!"
  return "War!"
}` },
    { t: "play", api: true, task: "Play until the deck runs out. Then add a “New deck” reset that also clears the scores.", html: `<div class="table">
  <button id="new-deck">New deck, please!</button>
  <h2 id="header">Game of War</h2>
  <p id="remaining">Remaining cards: 52</p>
  <p id="computer-score">Computer: 0</p>
  <div class="cards" id="cards"><div class="slot"></div><div class="slot"></div></div>
  <p id="my-score">Me: 0</p>
  <button id="draw" disabled>Draw</button>
</div>`, css: `body{margin:0;font-family:system-ui;background:radial-gradient(circle,#1f7a3e,#0b3a1c);color:#fff;min-height:100vh;display:grid;place-items:center}
.table{text-align:center}button{padding:10px 18px;border:0;border-radius:8px;font-weight:800;background:#ffd166;color:#222;cursor:pointer}button:disabled{opacity:.4;cursor:not-allowed}
h2{margin:12px 0 4px}p{margin:4px}.cards{display:flex;gap:14px;justify-content:center;margin:10px 0}
.slot{width:113px;height:157px;border:2px dashed rgba(255,255,255,.5);border-radius:10px;display:grid;place-items:center}.slot img{width:100%;border-radius:8px}`, js: `const API = "${API}"
const valueOptions = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "JACK", "QUEEN", "KING", "ACE"]
let deckId
let computerScore = 0
let myScore = 0
const drawBtn = document.getElementById("draw")
const header = document.getElementById("header")

function handleClick() {
  fetch(API + "/deck/new/shuffle")
    .then(res => res.json())
    .then(data => {
      deckId = data.deck_id
      document.getElementById("remaining").textContent = "Remaining cards: " + data.remaining
      drawBtn.disabled = false
      header.textContent = "Game of War"
    })
}
document.getElementById("new-deck").addEventListener("click", handleClick)

drawBtn.addEventListener("click", () => {
  fetch(\`\${API}/deck/\${deckId}/draw?count=2\`)
    .then(res => res.json())
    .then(data => {
      const slots = document.querySelectorAll(".slot")
      data.cards.forEach((card, i) => { slots[i].innerHTML = \`<img src="\${card.image}" alt="\${card.value} of \${card.suit}">\` })
      const result = determineCardWinner(data.cards[0], data.cards[1])
      header.textContent = result
      document.getElementById("remaining").textContent = "Remaining cards: " + data.remaining
      document.getElementById("computer-score").textContent = "Computer: " + computerScore
      document.getElementById("my-score").textContent = "Me: " + myScore
      if (data.remaining === 0) {
        drawBtn.disabled = true
        header.textContent = computerScore > myScore ? "The computer won the game!" : myScore > computerScore ? "You won the game! 🎉" : "It's a tie game!"
      }
    })
})

function determineCardWinner(card1, card2) {
  const a = valueOptions.indexOf(card1.value), b = valueOptions.indexOf(card2.value)
  if (a > b) { computerScore++; return "Computer wins!" }
  if (a < b) { myScore++; return "You win!" }
  return "War!"
}` },
    { t: "h", h: "A first look at async/await" },
    { t: "code", lang: "javascript", code: `async function handleClick() {
  const res = await fetch(API + "/deck/new/shuffle")   // pause here until it arrives
  const data = await res.json()
  deckId = data.deck_id
}` },
    { t: "p", h: "<code>async</code> marks a function that always returns a promise. Inside it, <code>await</code> pauses <i>that function</i> until a promise settles, then hands you its value, so the code reads top to bottom. The rest of the page keeps running while it waits. It's the same promises underneath, with nicer syntax." },
    { t: "h", h: "The event loop" },
    { t: "video", name: "event-loop" },
    { t: "p", h: "Synchronous code runs first on the <b>call stack</b>. Timers, network requests and events are handled by the browser in the background. When they finish, their callbacks wait in a queue. Promise callbacks go in the <b>microtask queue</b>, which is emptied completely before the next timer or event callback from the <b>task queue</b> runs. That's why a resolved promise's <code>.then()</code> runs before a <code>setTimeout(…, 0)</code>." },
    { t: "jsch", fn: "filterArray", prompt: "Write your own <code>filterArray(array, callback)</code> that returns a new array of the items for which <code>callback(item)</code> returns a truthy value, without using <code>.filter()</code>.", starter: `function filterArray(array, callback) {

}`, tests: [
      { msg: "filterArray([5, 12, 8, 1], n => n > 6) → [12, 8]", fn: (f) => JSON.stringify(f([5, 12, 8, 1], (n) => n > 6)) === "[12,8]" },
      { msg: "Works with objects", fn: (f) => f([{ a: 1 }, { a: 0 }], (o) => o.a).length === 1 },
      { msg: "Original array unchanged", fn: (f) => { const a = [1, 2, 3]; f(a, () => false); return a.length === 3; } },
      { msg: "Doesn't use .filter()", fn: (f) => !/\.filter\s*\(/.test(f.toString()) }
    ]},
    { t: "jsch", fn: "determineCardWinner", prompt: "Write <code>determineCardWinner(card1, card2)</code> using the value order <code>2…10, JACK, QUEEN, KING, ACE</code>. Return <code>\"Card 1 wins!\"</code>, <code>\"Card 2 wins!\"</code> or <code>\"War!\"</code>.", starter: `const valueOptions = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "JACK", "QUEEN", "KING", "ACE"]

function determineCardWinner(card1, card2) {

}`, tests: [
      { msg: "KING beats 10", fn: (f) => f({ value: "KING" }, { value: "10" }) === "Card 1 wins!" },
      { msg: "ACE beats QUEEN", fn: (f) => f({ value: "QUEEN" }, { value: "ACE" }) === "Card 2 wins!" },
      { msg: "Same value → War!", fn: (f) => f({ value: "7" }, { value: "7" }) === "War!" },
      { msg: "10 beats 9 (compare by order, not text)", fn: (f) => f({ value: "10" }, { value: "9" }) === "Card 1 wins!" }
    ]},
    { t: "jsch", fn: "drawTwo", prompt: "Chain two requests: write <code>drawTwo()</code> that gets a new shuffled deck from <code>/deck/new/shuffle</code>, then draws 2 cards from it with <code>/deck/{deck_id}/draw?count=2</code>, and returns a promise of the two card <b>codes</b>, like <code>[\"KH\", \"7S\"]</code>.", starter: `function drawTwo() {

}`, tests: [
      { msg: "Resolves to two card codes", fn: async (f) => { const c = await f(); return Array.isArray(c) && c.length === 2 && c.every((x) => typeof x === "string" && x.length === 2); } },
      { msg: "Two different cards", fn: async (f) => { const c = await f(); return c[0] !== c[1]; } }
    ]},
    { t: "quiz", q: "What does this print? <code>console.log(1); setTimeout(() =&gt; console.log(2), 0); Promise.resolve().then(() =&gt; console.log(3)); console.log(4)</code>", opts: ["1 2 3 4", "1 4 3 2", "1 4 2 3", "1 3 4 2"], a: 1, why: "Synchronous code first (1, 4). Then the microtask queue (the promise callback, 3) is emptied before the next task (the timer, 2)." },
    { t: "quiz", q: "<code>fetch(\"/missing\")</code> gets a 404 response. What happens to the promise?", opts: ["It's rejected, so .catch() runs", "It's fulfilled; you have to check res.ok yourself", "It stays pending forever"], a: 1, why: "fetch only rejects when the request can't be made at all (network failure, CORS, bad URL). A 404 or 500 is still a response, so you must check res.ok and throw if you want .catch() to run." },
    { t: "quiz", q: "<code>.then(data =&gt; { data.cards })</code> — what does the next .then() receive?", opts: ["data.cards", "undefined", "the whole data object"], a: 1, why: "With braces you need an explicit return. Without it the function returns undefined, and that's what's passed on." },
    { t: "recap", items: ["A callback is a function passed in to be called later", "Nested callbacks get messy: promises flatten them", "Promise states: pending → fulfilled or rejected, exactly once", "Each <code>.then()</code> returns a new promise; return values flow down the chain", "<code>async</code>/<code>await</code>: same promises, top-to-bottom syntax", "Event loop: sync code, then all microtasks (promises), then the next task (timers, events)"] }
  ]},

  /* ───────────────────────── Movie watchlist ───────────────────────── */
  { id: "api-movies", title: "Build a Movie Watchlist", min: 60, kind: "build", body: [
    { t: "p", h: "Search for films, see their details, and save them to a personal watchlist. This project is all about <b>async/await</b>: handling errors with <code>try…catch</code>, and running requests <b>in parallel</b> with <code>Promise.all</code>." },
    { t: "h", h: "Searching with async/await" },
    { t: "code", lang: "javascript", code: `async function searchMovies(term) {
  const res = await fetch(\`${API}/movies?s=\${encodeURIComponent(term)}\`)
  const data = await res.json()
  if (data.Response === "False") return []        // this API signals “no results” in the body
  return data.Search                              // [{ Title, Year, imdbID, Poster }, …]
}` },
    { t: "p", h: "The search only returns the basics. For runtime, genre, plot and rating, you need a second request per film: <code>/movies/{imdbID}</code>." },
    { t: "h", h: "Sequential vs parallel" },
    { t: "code", lang: "javascript", code: `// slow: each request waits for the previous one (4 × 400ms ≈ 1.6s)
const details = []
for (const movie of results) {
  const res = await fetch(\`${API}/movies/\${movie.imdbID}\`)
  details.push(await res.json())
}

// fast: start them all, then wait for all of them (≈ 400ms)
const details = await Promise.all(
  results.map(movie => fetch(\`${API}/movies/\${movie.imdbID}\`).then(res => res.json()))
)` },
    { t: "callout", kind: "key", h: "<code>Promise.all</code> takes an array of promises and gives you one promise of all their results, <b>in the same order</b>. If any one rejects, the whole thing rejects. Use <code>Promise.allSettled</code> when you want every result regardless." },
    { t: "h", h: "Errors with try…catch" },
    { t: "code", lang: "javascript", code: `async function handleSearch(term) {
  showLoading()
  try {
    const movies = await searchMovies(term)
    if (!movies.length) return renderEmpty("Unable to find what you're looking for. Please try another search.")
    renderMovies(await getDetails(movies))
  } catch (err) {
    renderEmpty("Something went wrong. Check your connection and try again.")
    console.error(err)
  }
}` },
    { t: "h", h: "The watchlist" },
    { t: "p", h: "The watchlist is an array of movie ids saved in <code>localStorage</code> (with <code>JSON.stringify</code> and <code>JSON.parse</code>). Add and remove buttons carry <code>data-add</code> and <code>data-remove</code> attributes, handled by one delegated listener, the same pattern as Twimba." },
    { t: "play", api: true, task: "Search for “nolan”, “sci-fi” or “ridley” and add films to your watchlist. Then add a counter to the Watchlist tab showing how many films are saved.", html: `<header>
  <h1>Find your film</h1>
  <nav><button id="tab-search" class="on">Search</button><button id="tab-list">Watchlist</button></nav>
</header>
<form id="search"><input name="q" placeholder="Search for a movie" aria-label="Search for a movie" required><button>Search</button></form>
<main id="results"><p class="empty">🎬 Start exploring</p></main>`, css: `*{box-sizing:border-box}body{margin:0;font-family:Inter,system-ui;background:#fff;color:#111}
header{background:linear-gradient(135deg,#111,#3a3a3a);color:#fff;padding:22px 18px 34px;display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap}
header h1{margin:0;font-size:26px}nav button{background:none;border:0;color:#aaa;font-weight:800;cursor:pointer;font-size:14px}nav button.on{color:#fff}
form{display:flex;max-width:520px;margin:-20px auto 0;box-shadow:0 4px 14px rgba(0,0,0,.12);border-radius:8px;overflow:hidden}
form input{flex:1;padding:12px;border:0;font:inherit}form button{padding:12px 18px;border:0;background:#f3f4f6;font-weight:700}
main{max-width:560px;margin:18px auto;padding:0 16px}
.movie{display:grid;grid-template-columns:90px 1fr;gap:14px;padding:14px 0;border-bottom:1px solid #eee}
.movie img{width:90px;border-radius:4px}.movie h3{margin:0 0 4px;font-size:17px}.meta{font-size:12.5px;color:#555;display:flex;gap:12px;flex-wrap:wrap;align-items:center}
.movie p{font-size:13.5px;color:#6b7280;margin:6px 0 0}.meta button{border:0;background:none;font-weight:700;cursor:pointer;padding:0}
.empty{text-align:center;color:#9ca3af;font-size:18px;margin-top:40px}`, js: `const API = "${API}"
const results = document.getElementById("results")
let view = "search", lastResults = []

// localStorage is blocked inside this preview, so fall back to memory here.
// In your own project, use localStorage directly.
const store = (() => { try { return window.localStorage } catch { const m = {}; return { getItem: k => m[k] ?? null, setItem: (k, v) => { m[k] = v } } } })()
const getList = () => JSON.parse(store.getItem("watchlist") || "[]")
const saveList = (ids) => store.setItem("watchlist", JSON.stringify(ids))

async function searchMovies(term) {
  const res = await fetch(\`\${API}/movies?s=\${encodeURIComponent(term)}\`)
  const data = await res.json()
  return data.Response === "False" ? [] : data.Search
}

function getDetails(ids) {
  return Promise.all(ids.map(id => fetch(\`\${API}/movies/\${id}\`).then(res => res.json())))
}

function render(movies, emptyText) {
  if (!movies.length) { results.innerHTML = \`<p class="empty">\${emptyText}</p>\`; return }
  const saved = getList()
  results.innerHTML = movies.map(m => \`
    <article class="movie">
      <img src="\${m.Poster}" alt="Poster for \${m.Title}">
      <div>
        <h3>\${m.Title} <small>⭐ \${m.imdbRating}</small></h3>
        <div class="meta"><span>\${m.Runtime}</span><span>\${m.Genre}</span>
          \${saved.includes(m.imdbID)
            ? \`<button data-remove="\${m.imdbID}">⊖ Remove</button>\`
            : \`<button data-add="\${m.imdbID}">⊕ Watchlist</button>\`}
        </div>
        <p>\${m.Plot}</p>
      </div>
    </article>\`).join("")
}

document.getElementById("search").addEventListener("submit", async (e) => {
  e.preventDefault()
  view = "search"; setTabs()
  results.innerHTML = '<p class="empty">Searching…</p>'
  try {
    const t0 = performance.now()
    const found = await searchMovies(new FormData(e.target).get("q"))
    lastResults = await getDetails(found.map(m => m.imdbID))
    console.log(\`\${lastResults.length} results in \${Math.round(performance.now() - t0)}ms\`)
    render(lastResults, "Unable to find what you're looking for. Please try another search.")
  } catch (err) {
    render([], "Something went wrong. Please try again.")
  }
})

async function showWatchlist() {
  view = "list"; setTabs()
  const ids = getList()
  render(ids.length ? await getDetails(ids) : [], "Your watchlist is looking a little empty…")
}

document.addEventListener("click", async (e) => {
  const { add, remove } = e.target.dataset
  if (add) saveList([...getList(), add])
  if (remove) saveList(getList().filter(id => id !== remove))
  if (add || remove) view === "list" ? showWatchlist() : render(lastResults, "")
  if (e.target.id === "tab-list") showWatchlist()
  if (e.target.id === "tab-search") { view = "search"; setTabs(); render(lastResults, "🎬 Start exploring") }
})

function setTabs() {
  document.getElementById("tab-search").classList.toggle("on", view === "search")
  document.getElementById("tab-list").classList.toggle("on", view === "list")
}` },
    { t: "jsch", fn: "searchTitles", prompt: "Write <code>async function searchTitles(term)</code> returning an array of titles from <code>/movies?s=term</code>, or <code>[]</code> when the API says <code>Response: \"False\"</code>.", starter: `async function searchTitles(term) {

}`, tests: [
      { msg: "searchTitles(\"matrix\") → [\"The Matrix\"]", fn: async (f) => JSON.stringify(await f("matrix")) === '["The Matrix"]' },
      { msg: "No results → []", fn: async (f) => JSON.stringify(await f("zzzzzz")) === "[]" }
    ]},
    { t: "jsch", fn: "getTitles", prompt: "Write <code>getTitles(ids)</code> that fetches <code>/movies/{id}</code> for every id <b>in parallel</b> and returns the titles in the same order as the ids.", starter: `async function getTitles(ids) {

}`, tests: [
      { msg: "Titles in the same order as the ids", fn: async (f) => JSON.stringify(await f(["tt0133093", "tt0816692"])) === '["The Matrix","Interstellar"]' },
      { msg: "Runs the requests in parallel (Promise.all)", fn: async (f) => { const t = Date.now(); await f(["tt0133093", "tt0816692", "tt1375666", "tt2543164"]); return Date.now() - t < 750; } }
    ]},
    { t: "quiz", q: "You await four fetches one after another in a for loop, each taking ~400ms. Roughly how long does it take, and how do you speed it up?", opts: ["~400ms; it's already parallel", "~1.6s; start them all and await Promise.all", "~1.6s; nothing can be done"], a: 1, why: "Each await pauses until that request finishes. Starting every request first and then awaiting Promise.all overlaps the waiting." },
    { t: "quiz", q: "One of five requests in <code>Promise.all</code> fails. What happens?", opts: ["You get the four that worked", "The whole Promise.all rejects with that error", "It retries automatically"], a: 1, why: "Promise.all is all-or-nothing. Promise.allSettled gives you every outcome instead." },
    { t: "recap", items: ["<code>async</code> functions return promises; <code>await</code> unwraps them", "Wrap awaits in <code>try…catch</code> to handle failures", "Some APIs signal errors in the body (<code>Response: \"False\"</code>)", "<code>Promise.all</code> runs requests in parallel and keeps the order", "Encode user input in URLs with <code>encodeURIComponent</code>", "Empty and error states are part of the design"] }
  ]},

  /* ───────────────────────── Capstone ───────────────────────── */
  { id: "api-capstone", title: "Capstone Project", min: 90, kind: "solo", body: [
    { t: "p", h: "Your capstone: a personal dashboard that replaces Chrome's new-tab page. A beautiful background photo, the time, live crypto prices and your local weather, with every request handled properly when it fails." },
    { t: "diagram", name: "dashboard-arch" },
    { t: "h", h: "Wireframe and layout" },
    { t: "p", h: "Top left: a coin's icon, name and prices. Top right: the weather. Centre: a big clock. Bottom left: the photographer's credit. A full-screen flex column with <code>justify-content: space-between</code> handles the top, middle and bottom rows." },
    { t: "h", h: "Promise rejection, and why fetch needs help" },
    { t: "code", lang: "javascript", code: `fetch("${API}/crypto/not-a-coin")
  .then(res => {
    if (!res.ok) throw Error("Something went wrong: " + res.status)   // 404 doesn't reject by itself
    return res.json()
  })
  .then(data => renderCrypto(data))
  .catch(err => {
    console.error(err)
    document.getElementById("crypto").textContent = "Crypto prices unavailable"
  })` },
    { t: "callout", kind: "warn", h: "fetch only rejects when the request can't happen at all. For 4xx and 5xx responses, check <code>res.ok</code> and <code>throw</code>, or your error handling never runs." },
    { t: "h", h: "The four widgets" },
    { t: "code", lang: "javascript", code: `// 1. Background photo + credit, with a fallback
try {
  const res = await fetch(\`${API}/photos/random?query=nature\`)
  const data = await res.json()
  document.body.style.backgroundImage = \`url(\${data.urls.regular})\`
  author.textContent = "By: " + data.user.name
} catch {
  document.body.style.backgroundImage = "url(default.jpg)"   // never show a blank page
}

// 2. Crypto: /crypto/dogecoin → name, image.small, market_data.current_price.usd …

// 3. Time, updated every second
function getCurrentTime() {
  time.textContent = new Date().toLocaleTimeString("en-us", { timeStyle: "short" })
}
setInterval(getCurrentTime, 1000)

// 4. Weather from the user's location
navigator.geolocation.getCurrentPosition(async (position) => {
  const { latitude, longitude } = position.coords
  const res = await fetch(\`${API}/weather?lat=\${latitude}&lon=\${longitude}&units=metric\`)
  // …render the icon, Math.round(temp) and the city name
})` },
    { t: "h", h: "Thought experiment: geolocation as a promise" },
    { t: "p", h: "<code>getCurrentPosition</code> still uses old-style success and error callbacks. Wrapping it in a <code>new Promise</code> lets you <code>await</code> it like everything else:" },
    { t: "code", lang: "javascript", code: `function getPosition() {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject)
  })
}

const { coords } = await getPosition()` },
    { t: "h", h: "Make it a Chrome extension" },
    { t: "code", lang: "json", code: `{
  "manifest_version": 3,
  "name": "My Dashboard",
  "version": "1.0",
  "chrome_url_overrides": { "newtab": "index.html" },
  "permissions": ["geolocation"]
}` },
    { t: "p", h: "Load it with <b>Load unpacked</b> at <code>chrome://extensions</code>, open a new tab, and it's your dashboard. Add each API's host to <code>host_permissions</code> if Chrome blocks a request." },
    { t: "play", api: true, task: "The photo and clock work. Finish the crypto and weather widgets (location isn't available in this preview, so use the city fallback). Then refactor everything to async/await with try…catch.", html: `<div class="top">
  <div id="crypto"><div id="crypto-top"></div></div>
  <div id="weather"></div>
</div>
<h1 id="time" class="time"></h1>
<p id="author"></p>`, css: `*{box-sizing:border-box}body{margin:0;height:100vh;padding:18px;display:flex;flex-direction:column;justify-content:space-between;font-family:system-ui;color:#fff;background:#222 center/cover no-repeat;text-shadow:0 1px 6px rgba(0,0,0,.6)}
.top{display:flex;justify-content:space-between;gap:12px}
#crypto-top{display:flex;align-items:center;gap:8px;font-weight:800;font-size:18px}#crypto-top img{width:32px}
#crypto p{margin:2px 0;font-size:14px}#weather{text-align:right}#weather .temp{font-size:34px;font-weight:800}
.time{font-size:min(18vw,96px);text-align:center;margin:0;font-weight:800}#author{margin:0;font-size:13px;opacity:.9}`, js: `const API = "${API}"

// 1. Background photo (done)
fetch(API + "/photos/random?query=nature")
  .then(res => res.json())
  .then(data => {
    document.body.style.backgroundImage = \`url("\${data.urls.regular}")\`
    document.getElementById("author").textContent = "By: " + data.user.name + " · " + data.location.name
  })
  .catch(() => { document.body.style.background = "linear-gradient(135deg,#1e3c72,#2a5298)" })

// 2. Time (done)
function getCurrentTime() {
  document.getElementById("time").textContent = new Date().toLocaleTimeString("en-us", { timeStyle: "short" })
}
getCurrentTime()
setInterval(getCurrentTime, 1000)

// 3. TODO: crypto — fetch API + "/crypto/dogecoin", check res.ok, show icon, name and current/high/low prices

// 4. TODO: weather — try geolocation; if it fails, fetch API + "/weather?city=Pune&units=metric"
//    show the emoji, Math.round(temp) + "°" and the city name
` },
    { t: "jsch", fn: "getJSON", prompt: "Write <code>async function getJSON(url)</code> that fetches the URL and returns the parsed JSON, but <b>throws an Error</b> whose message includes the status code when the response isn't ok.", starter: `async function getJSON(url) {

}`, tests: [
      { msg: "Returns parsed JSON for a good response", fn: async (f) => (await f("https://api.shipyard.dev/posts/1")).id === 1 },
      { msg: "Throws on 404 with the status in the message", fn: async (f) => { try { await f("https://api.shipyard.dev/error/404"); return false; } catch (e) { return /404/.test(e.message); } } },
      { msg: "Throws on 500", fn: async (f) => { try { await f("https://api.shipyard.dev/error/500"); return false; } catch (e) { return /500/.test(e.message); } } }
    ]},
    { t: "jsch", fn: "getPosition", prompt: "Wrap a callback API in a promise. Write <code>getPosition(geo)</code> that calls <code>geo.getCurrentPosition(success, error)</code> and returns a promise that resolves with the position or rejects with the error.", starter: `function getPosition(geo) {

}`, tests: [
      { msg: "Resolves with the position", fn: async (f) => { const pos = await f({ getCurrentPosition: (ok) => setTimeout(() => ok({ coords: { latitude: 18.5, longitude: 73.9 } }), 20) }); return pos.coords.latitude === 18.5; } },
      { msg: "Rejects with the error", fn: async (f) => { try { await f({ getCurrentPosition: (ok, fail) => setTimeout(() => fail(new Error("denied")), 20) }); return false; } catch (e) { return e.message === "denied"; } } }
    ]},
    { t: "recap", items: ["Check <code>res.ok</code> and throw: fetch doesn't reject on 404 or 500", "Every widget needs a fallback when its API fails", "<code>setInterval</code> keeps the clock live", "Wrap callback APIs in <code>new Promise((resolve, reject) =&gt; …)</code>", "<code>chrome_url_overrides.newtab</code> turns a page into a new-tab extension", "Refactor to <code>async/await</code> + <code>try…catch</code> for readable error handling"] }
  ]}
  ]
};
