/* Module — Express.js. Lesson titles match the syllabus so the topic lists attach.
   Labs run in the Node lab, which provides express, express-session, sqlite/sqlite3, bcryptjs, validator and cors. */
import {
  PKG, STARTUPS, SP_PKG, SP_GET_ALL, SP_GET_PATH, SP_ROUTES, SP_SERVER,
  VV_PKG, VV_DB_SQL, VV_DB, VV_PRODUCTS_CTRL, VV_PRODUCTS_ROUTES, VV_AUTH_CTRL, VV_ME_CTRL, VV_AUTH_ROUTES, VV_ME_ROUTES,
  VV_REQUIRE_AUTH, VV_CART_CTRL, VV_CART_ROUTES, VV_SERVER_BASIC, VV_SERVER_FULL, VV_CSS, VV_PANEL_CSS, VV_HTML_BASIC, VV_JS_BASIC, VV_HTML_FULL, VV_JS_FULL,
} from "./express-files.js";

const SP_BASE = { "data/data.js": STARTUPS, "package.json": SP_PKG };

const VV_FRONTEND_BASIC = { "public/index.html": VV_HTML_BASIC, "public/index.css": VV_CSS, "public/index.js": VV_JS_BASIC };
const VV_FILES_BASIC = {
  "server.js": VV_SERVER_BASIC,
  "routes/products.js": VV_PRODUCTS_ROUTES,
  "controllers/productsControllers.js": VV_PRODUCTS_CTRL,
  "db/db.js": VV_DB,
  "database.db": VV_DB_SQL,
  ...VV_FRONTEND_BASIC,
  "package.json": VV_PKG,
};
const VV_FILES_FULL = {
  "server.js": VV_SERVER_FULL,
  "routes/products.js": VV_PRODUCTS_ROUTES,
  "routes/auth.js": VV_AUTH_ROUTES,
  "routes/me.js": VV_ME_ROUTES,
  "routes/cart.js": VV_CART_ROUTES,
  "controllers/productsControllers.js": VV_PRODUCTS_CTRL,
  "controllers/authControllers.js": VV_AUTH_CTRL,
  "controllers/meController.js": VV_ME_CTRL,
  "controllers/cartController.js": VV_CART_CTRL,
  "middleware/requireAuth.js": VV_REQUIRE_AUTH,
  "db/db.js": VV_DB,
  "database.db": VV_DB_SQL,
  "public/index.html": VV_HTML_FULL,
  "public/index.css": VV_PANEL_CSS,
  "public/index.js": VV_JS_FULL,
  "package.json": VV_PKG,
};

const NEW_USER = { name: "Ada Lovelace", email: "ada@example.com", username: "ada", password: "analytical-engine" };

export const EXPRESS = {
  id: "express",
  title: "Express.js",
  blurb: "Build APIs and fullstack apps faster with Node's most popular framework.",
  concepts: ["Routing with app.get / app.post", "req.query, req.params and req.body", "Middleware and express.static", "Routers and controllers", "SQLite with parameterised queries", "Sessions, password hashing and protected routes"],
  lessons: [
    /* ───────────────────────── Welcome ───────────────────────── */
    { id: "ex-welcome", title: "Welcome to Express", min: 15, kind: "lesson", body: [
      { t: "p", h: "In the Node module you wrote routing with <code>if</code> statements, parsed URLs by hand and set every header yourself. <b>Express</b> is a small framework on top of Node's <code>http</code> module that does that plumbing for you. It's the most widely used Node web framework, and its ideas (routes, middleware, <code>req</code> and <code>res</code> helpers) show up in almost every backend framework since." },
      { t: "code", lang: "javascript", code: `// Plain Node
const server = http.createServer((req, res) => {
  if (req.url === "/api" && req.method === "GET") {
    res.setHeader("Content-Type", "application/json")
    res.statusCode = 200
    res.end(JSON.stringify(data))
  }
})

// Express
app.get("/api", (req, res) => {
  res.json(data)
})` },
      { t: "steps", items: [
        "<b>Routing</b>: <code>app.get(path, handler)</code>, <code>app.post</code>, <code>app.delete</code>…, with path parameters like <code>/users/:id</code>",
        "<b>Helpers</b>: <code>res.json()</code>, <code>res.status()</code>, <code>res.send()</code>, <code>res.sendFile()</code>, and parsed <code>req.query</code> and <code>req.params</code>",
        "<b>Middleware</b>: functions that run on the way to your route, like parsing JSON bodies, serving static files or checking a login",
        "<b>Routers</b>: group related routes into their own files",
      ] },
      { t: "code", lang: "bash", code: `npm init -y
npm install express        # Express 5 is the current major version` },
      { t: "nplay", task: "Add a third route, <code>GET /api/time</code>, that responds with <code>{ now: new Date().toISOString() }</code>. Then try a route that doesn't exist: what does Express send by default?", requests: [{ url: "/" }, { url: "/api/hello?name=Ada" }, { url: "/api/time" }, { url: "/nope" }], files: {
        "server.js": `import express from "express"

const app = express()
const PORT = 8000

app.get("/", (req, res) => {
  res.send("<h1>Hello from Express!</h1>")
})

app.get("/api/hello", (req, res) => {
  const name = req.query.name || "world"
  res.json({ message: \`Hello, \${name}!\` })
})

app.listen(PORT, () => console.log(\`Server running on port \${PORT}\`))
`,
        "package.json": PKG("hello-express", { express: "^5.1.0" }),
      } },
      { t: "quiz", q: "What does <code>res.json(obj)</code> do that <code>res.end()</code> doesn't?", opts: ["Nothing, they're the same", "It serialises obj with JSON.stringify, sets Content-Type: application/json and ends the response", "It saves obj to a database"], a: 1, why: "One call replaces three lines of plain Node." },
      { t: "recap", items: ["Express is a thin framework over Node's http module", "<code>const app = express()</code>, routes with <code>app.get/post/…</code>, <code>app.listen(port)</code>", "Helpers like <code>res.json</code>, <code>res.status</code>, <code>req.query</code>, <code>req.params</code>", "Unknown routes get Express's default 404: \"Cannot GET /path\""] },
    ]},

    /* ───────────────────────── Build an Express API ───────────────────────── */
    { id: "ex-api", title: "Build an Express API", min: 110, kind: "project", body: [
      { t: "p", h: "<b>Startup Planet</b> is an API of up-and-coming startups. Investors can list them, filter by industry, country, continent, funding status or MVP, and search by field. It's the Wild Horizons API again, rebuilt in Express, so you can see exactly what the framework saves you." },
      { t: "h", h: "A basic server" },
      { t: "code", lang: "javascript", code: `import express from "express"
import { startups } from "./data/data.js"

const PORT = 8000
const app = express()

app.get("/api", (req, res) => {
  res.json(startups)
})

app.listen(PORT, () => console.log(\`server connected on port \${PORT}\`))` },
      { t: "h", h: "Aside: sending a response" },
      { t: "steps", items: [
        "<code>res.json(data)</code>: JSON with the right Content-Type. Use it for APIs",
        "<code>res.send(\"&lt;h1&gt;Hi&lt;/h1&gt;\")</code>: sends a string as HTML (or an object as JSON)",
        "<code>res.status(404).json({ … })</code>: <code>status()</code> returns <code>res</code>, so it chains",
        "<code>res.sendFile(path)</code>: streams a file; the path must be absolute",
        "<code>res.redirect(\"/login\")</code>, <code>res.sendStatus(204)</code>",
      ] },
      { t: "callout", kind: "warn", h: "Send <b>one</b> response per request. Calling <code>res.json()</code> twice throws \"Cannot set headers after they are sent to the client\". Use <code>return res.status(400).json(…)</code> when you respond early, so the rest of the handler doesn't run." },
      { t: "h", h: "Serving data, and a 404 for everything else" },
      { t: "p", h: "Express runs routes and middleware in the order you register them. A middleware added with <code>app.use()</code> <b>after</b> all your routes only runs when nothing matched, which makes it the perfect place for a custom 404." },
      { t: "nch", prompt: "Serve all startups as JSON on <code>GET /api</code>. Add a final middleware so any other route responds <b>404</b> with <code>{ message: \"Endpoint not found. Please check the API documentation.\" }</code>.", requests: [{ url: "/api" }, { url: "/api/unicorns" }], files: {
        "server.js": `import express from "express"
import { startups } from "./data/data.js"

const PORT = 8000
const app = express()

// your routes here

app.listen(PORT, () => console.log(\`server connected on port \${PORT}\`))
`,
        ...SP_BASE,
      }, solution: { "server.js": `import express from "express"
import { startups } from "./data/data.js"

const PORT = 8000
const app = express()

app.get("/api", (req, res) => {
  res.json(startups)
})

app.use((req, res) => {
  res.status(404).json({ message: "Endpoint not found. Please check the API documentation." })
})

app.listen(PORT, () => console.log(\`server connected on port \${PORT}\`))
` }, tests: [
        { msg: "GET /api returns all 10 startups as JSON", fn: async (t) => { const r = await t.get("/api"); return r.status === 200 && /json/.test(t.header(r, "content-type")) && Array.isArray(r.json) && r.json.length === 10; } },
        { msg: "Unknown routes get a 404 with the JSON message", fn: async (t) => { const r = await t.get("/api/unicorns/x"); return r.status === 404 && r.json && r.json.message === "Endpoint not found. Please check the API documentation."; } },
        { msg: "Uses app.get and app.use", fn: async (t) => /app\.get\(\s*["']\/api["']/.test(t.src("server.js")) && /app\.use\(/.test(t.src("server.js")) },
      ] },
      { t: "h", h: "Aside: query parameters" },
      { t: "p", h: "Express parses the query string for you into <code>req.query</code>. <code>/api?industry=ai&has_mvp=true</code> gives <code>{ industry: \"ai\", has_mvp: \"true\" }</code>. As before, every value is a string." },
      { t: "nch", prompt: "Make <code>GET /api</code> filter by the optional query parameters <code>industry</code>, <code>country</code>, <code>continent</code> (all case-insensitive), <code>is_seeking_funding</code> and <code>has_mvp</code> (the strings \"true\"/\"false\").", requests: [{ url: "/api?industry=ai" }, { url: "/api?continent=asia&has_mvp=false" }, { url: "/api?is_seeking_funding=true&country=germany" }], files: {
        "server.js": `import express from "express"
import { startups } from "./data/data.js"

const PORT = 8000
const app = express()

app.get("/api", (req, res) => {
  let filteredData = startups
  // filter by req.query here
  res.json(filteredData)
})

app.use((req, res) => {
  res.status(404).json({ message: "Endpoint not found. Please check the API documentation." })
})

app.listen(PORT, () => console.log(\`server connected on port \${PORT}\`))
`,
        ...SP_BASE,
      }, solution: { "server.js": `import express from "express"
import { startups } from "./data/data.js"

const PORT = 8000
const app = express()

app.get("/api", (req, res) => {
  let filteredData = startups
  const { industry, country, continent, is_seeking_funding, has_mvp } = req.query

  if (industry) filteredData = filteredData.filter(s => s.industry.toLowerCase() === industry.toLowerCase())
  if (country) filteredData = filteredData.filter(s => s.country.toLowerCase() === country.toLowerCase())
  if (continent) filteredData = filteredData.filter(s => s.continent.toLowerCase() === continent.toLowerCase())
  if (is_seeking_funding) filteredData = filteredData.filter(s => s.is_seeking_funding === JSON.parse(is_seeking_funding.toLowerCase()))
  if (has_mvp) filteredData = filteredData.filter(s => s.has_mvp === JSON.parse(has_mvp.toLowerCase()))

  res.json(filteredData)
})

app.use((req, res) => {
  res.status(404).json({ message: "Endpoint not found. Please check the API documentation." })
})

app.listen(PORT, () => console.log(\`server connected on port \${PORT}\`))
` }, tests: [
        { msg: "?industry=ai returns the 2 AI startups", fn: async (t) => { const r = await t.get("/api?industry=ai"); return r.json.length === 2 && r.json.every((s) => s.industry === "AI"); } },
        { msg: "?continent=asia&has_mvp=false returns MediMind and SolarSip", fn: async (t) => { const r = await t.get("/api?continent=asia&has_mvp=false"); return r.json.map((s) => s.name).sort().join() === "MediMind,SolarSip"; } },
        { msg: "?is_seeking_funding=false is a real boolean filter", fn: async (t) => { const r = await t.get("/api?is_seeking_funding=false"); return r.json.length === 4 && r.json.every((s) => s.is_seeking_funding === false); } },
        { msg: "Filters combine: ?is_seeking_funding=true&country=germany → GreenGrid", fn: async (t) => { const r = await t.get("/api?is_seeking_funding=true&country=Germany"); return r.json.length === 1 && r.json[0].name === "GreenGrid"; } },
        { msg: "No query still returns all 10", fn: async (t) => (await t.get("/api")).json.length === 10 },
      ] },
      { t: "h", h: "Aside: path parameters" },
      { t: "p", h: "A colon in a route path names a parameter, and Express puts it in <code>req.params</code> (already URL-decoded). One route can handle a whole family of URLs: <code>/api/:field/:term</code> matches <code>/api/country/india</code> and <code>/api/industry/fintech</code>." },
      { t: "code", lang: "javascript", code: `app.get("/api/:field/:term", (req, res) => {
  const { field, term } = req.params      // { field: "country", term: "india" }
  const allowedFields = ["country", "continent", "industry"]
  if (!allowedFields.includes(field)) {
    return res.status(400).json({ message: "Search field not allowed. Please use only 'country', 'continent', 'industry'" })
  }
  res.json(startups.filter(s => s[field].toLowerCase() === term.toLowerCase()))
})` },
      { t: "callout", kind: "warn", h: "Never use a path parameter to index into objects without checking it. <code>s[field]</code> with <code>field = \"name\"</code> or <code>\"__proto__\"</code> does things you didn't intend. An <b>allow-list</b> keeps the API predictable." },
      { t: "h", h: "Modularise the code" },
      { t: "p", h: "An <code>express.Router()</code> is a mini-app with its own routes. Mount it under a prefix with <code>app.use(\"/api\", apiRouter)</code>, and its <code>\"/\"</code> route answers <code>/api</code>. Put the handler functions (<b>controllers</b>) in their own files too." },
      { t: "diagram", name: "express-structure" },
      { t: "nch", prompt: "Refactor Startup Planet: create <code>apiRouter</code> with <code>express.Router()</code> in <code>routes/apiRoutes.js</code>, with <code>GET /</code> → <code>getAllData</code> and <code>GET /:field/:term</code> → <code>getDataByPathParams</code> (which you also need to write). Mount it at <code>/api</code> in <code>server.js</code>.", requests: [{ url: "/api?industry=fintech" }, { url: "/api/country/india" }, { url: "/api/continent/south%20america" }, { url: "/api/name/greengrid" }], files: {
        "server.js": `import express from "express"

const PORT = 8000
const app = express()

// mount the router here

app.use((req, res) => {
  res.status(404).json({ message: "Endpoint not found. Please check the API documentation." })
})

app.listen(PORT, () => console.log(\`server connected on port \${PORT}\`))
`,
        "routes/apiRoutes.js": `import express from "express"
import { getAllData } from "../controllers/getAllData.js"
import { getDataByPathParams } from "../controllers/getDataByPathParams.js"

// create and export apiRouter here
`,
        "controllers/getAllData.js": SP_GET_ALL,
        "controllers/getDataByPathParams.js": `import { startups } from "../data/data.js"

export function getDataByPathParams(req, res) {

}
`,
        ...SP_BASE,
      }, solution: { "server.js": SP_SERVER, "routes/apiRoutes.js": SP_ROUTES, "controllers/getDataByPathParams.js": SP_GET_PATH }, tests: [
        { msg: "GET /api?industry=fintech still works through the router", fn: async (t) => { const r = await t.get("/api?industry=fintech"); return r.status === 200 && r.json.length === 2; } },
        { msg: "GET /api/country/india returns the 2 Indian startups", fn: async (t) => { const r = await t.get("/api/country/india"); return r.status === 200 && r.json.length === 2 && r.json.every((s) => s.country === "India"); } },
        { msg: "Path params are decoded: /api/continent/south%20america", fn: async (t) => { const r = await t.get("/api/continent/south%20america"); return r.json && r.json.length === 1 && r.json[0].name === "PayNest"; } },
        { msg: "Fields outside the allow-list get a 400", fn: async (t) => { const r = await t.get("/api/name/greengrid"); return r.status === 400 && r.json && /not allowed/i.test(r.json.message); } },
        { msg: "Uses express.Router() mounted with app.use(\"/api\", …)", fn: async (t) => /express\.Router\(\)/.test(t.src("routes/apiRoutes.js")) && /app\.use\(\s*["']\/api["']/.test(t.src("server.js")) },
        { msg: "The 404 still works", fn: async (t) => (await t.get("/nothing/here/at/all")).status === 404 },
      ] },
      { t: "h", h: "Wrapping things up" },
      { t: "p", h: "Compare this with Wild Horizons: no manual URL parsing, no header boilerplate, routes that read like documentation, and a folder structure (<code>routes/</code>, <code>controllers/</code>, <code>data/</code>) that scales to a real team project." },
      { t: "recap", items: ["<code>app.get(path, handler)</code>; one response per request", "<code>res.json</code>, <code>res.status().json</code>, <code>res.send</code>, <code>res.sendFile</code>", "<code>req.query</code> for ?key=value, <code>req.params</code> for <code>/:name</code> segments", "A final <code>app.use()</code> catches unmatched routes for a custom 404", "Allow-list user-controlled field names", "<code>express.Router()</code> + controllers keep code organised"] },
    ]},

    /* ───────────────────────── Fullstack Express App ───────────────────────── */
    { id: "ex-fullstack", title: "Build a Fullstack Express App", min: 120, kind: "project", body: [
      { t: "p", h: "<b>Vinyl Vault</b> is an online record shop. Express serves the frontend, an API reads products from a <b>SQLite</b> database, and the page filters by genre and searches as you type. In the next lesson you'll add accounts and a shopping cart." },
      { t: "h", h: "Aside: middleware and express.static()" },
      { t: "p", h: "<b>Middleware</b> is a function with the signature <code>(req, res, next)</code>. Express passes each request through the middleware and routes in the order they were registered. Each one can read or change <code>req</code> and <code>res</code>, end the response, or call <code>next()</code> to hand over to the next one." },
      { t: "video", name: "express-middleware" },
      { t: "code", lang: "javascript", code: `function logger(req, res, next) {
  console.log(req.method, req.url)
  next()                                  // forget this and the request hangs
}

app.use(logger)                           // every request
app.use(express.json())                   // parses JSON bodies into req.body
app.use(express.static("public"))         // serves files from public/, e.g. /index.css
app.use("/api/products", productsRouter)  // only requests under /api/products` },
      { t: "p", h: "<code>express.static(\"public\")</code> replaces the whole <code>serveStatic</code> utility you wrote in the Node module: content types, <code>index.html</code> for <code>/</code>, and refusing paths outside the folder. If no file matches, it calls <code>next()</code> so your API routes get a turn." },
      { t: "quiz", q: "A middleware neither sends a response nor calls <code>next()</code>. What happens?", opts: ["Express skips it automatically", "The request hangs until the client times out", "Express sends a 404"], a: 1, why: "Express waits for one of the two. Every middleware must end the response or call next()." },
      { t: "h", h: "Setting up the database" },
      { t: "p", h: "<b>SQLite</b> is a complete SQL database stored in a single file, with no separate server to run. It's perfect for small apps, prototypes and local development (and it's on every phone). In Node, the <code>sqlite3</code> package is the driver, and the <code>sqlite</code> package wraps it in promises so you can <code>await</code> it." },
      { t: "code", lang: "javascript", code: VV_DB },
      { t: "callout", kind: "tip", h: "In these labs, <code>database.db</code> is stored as SQL text so you can read it, and it resets when the server restarts. Real SQLite files are binary, and their data persists on disk." },
      { t: "h", h: "sqlite methods overview" },
      { t: "steps", items: [
        "<code>await db.all(sql, params)</code>: every matching row, as an array of objects",
        "<code>await db.get(sql, params)</code>: the first matching row, or <code>undefined</code>",
        "<code>await db.run(sql, params)</code>: INSERT/UPDATE/DELETE; returns <code>{ lastID, changes }</code>",
        "<code>await db.exec(sql)</code>: runs one or more statements with no parameters (e.g. creating tables)",
        "Use <code>?</code> placeholders and pass values in an array: <code>db.get(\"SELECT * FROM users WHERE id = ?\", [id])</code>. That's the parameterised query from the SQL injection primer",
      ] },
      { t: "h", h: "Getting our data" },
      { t: "nch", prompt: "In <code>controllers/productsControllers.js</code>, write <code>getGenres</code>: respond with an array of the distinct genres, as strings (not objects). It's wired to <code>GET /api/products/genres</code>.", requests: [{ url: "/api/products/genres" }, { url: "/api/products" }], files: {
        ...VV_FILES_BASIC,
        "controllers/productsControllers.js": VV_PRODUCTS_CTRL.replace(`  try {
    const db = await getDBConnection()
    const genreRows = await db.all("SELECT DISTINCT genre FROM products")
    const genres = genreRows.map(row => row.genre)
    res.json(genres)
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch genres", details: err.message })
  }`, `  // query the distinct genres and respond with an array of strings
  res.json([])`),
      }, solution: { "controllers/productsControllers.js": VV_PRODUCTS_CTRL }, tests: [
        { msg: "GET /api/products/genres returns 6 distinct genres", fn: async (t) => { const r = await t.get("/api/products/genres"); return r.status === 200 && Array.isArray(r.json) && r.json.length === 6 && new Set(r.json).size === 6; } },
        { msg: "…as plain strings, like \"jazz\"", fn: async (t) => { const r = await t.get("/api/products/genres"); return Array.isArray(r.json) && r.json.every((g) => typeof g === "string") && r.json.includes("jazz"); } },
        { msg: "Uses SELECT DISTINCT", fn: async (t) => /SELECT\s+DISTINCT/i.test(t.src("controllers/productsControllers.js")) },
      ] },
      { t: "h", h: "Wire up the dropdown and add search" },
      { t: "p", h: "The frontend fills the genre dropdown from <code>/api/products/genres</code> and asks for products with <code>?genre=jazz</code> or <code>?search=neon</code>. The controller builds the SQL, adding a <code>WHERE</code> only when a filter is present, and always passing values as parameters." },
      { t: "code", lang: "javascript", code: `let query = "SELECT * FROM products"
const params = []
if (genre) {
  query += " WHERE genre = ?"
  params.push(genre)
} else if (search) {
  query += " WHERE title LIKE ? OR artist LIKE ? OR genre LIKE ?"
  const searchPattern = \`%\${search}%\`
  params.push(searchPattern, searchPattern, searchPattern)
}
const products = await db.all(query, params)` },
      { t: "nch", prompt: "Write <code>getProducts</code>: return every product, or only one genre with <code>?genre=</code>, or a case-insensitive search across title, artist and genre with <code>?search=</code>. Use <code>?</code> placeholders: a malicious search must not break the query.", requests: [{ url: "/api/products?genre=jazz" }, { url: "/api/products?search=neon" }, { url: "/api/products?search=' OR 1=1 --" }], files: {
        ...VV_FILES_BASIC,
        "controllers/productsControllers.js": VV_PRODUCTS_CTRL.replace(/export async function getProducts[\s\S]*$/, `export async function getProducts(req, res) {
  const db = await getDBConnection()
  const products = await db.all("SELECT * FROM products")
  res.json(products)
}
`),
      }, solution: { "controllers/productsControllers.js": VV_PRODUCTS_CTRL }, tests: [
        { msg: "No filters: all 10 products", fn: async (t) => (await t.get("/api/products")).json.length === 10 },
        { msg: "?genre=jazz returns the 2 jazz records", fn: async (t) => { const r = await t.get("/api/products?genre=jazz"); return r.json.length === 2 && r.json.every((p) => p.genre === "jazz"); } },
        { msg: "?search=NEON matches titles case-insensitively", fn: async (t) => { const r = await t.get("/api/products?search=NEON"); return r.json.length === 1 && r.json[0].title === "Midnight Neon"; } },
        { msg: "?search=pine matches artists, and ?search=wave matches genres", fn: async (t) => { const a = await t.get("/api/products?search=pine"), b = await t.get("/api/products?search=wave"); return a.json.length === 1 && a.json[0].artist === "The Pinewoods" && b.json.length === 2; } },
        { msg: "An injection attempt is treated as text, not SQL", fn: async (t) => { const r = await t.get("/api/products?search=" + encodeURIComponent("' OR 1=1 --")); return r.status === 200 && Array.isArray(r.json) && r.json.length === 0; } },
        { msg: "Uses ? placeholders, not string concatenation of the search", fn: async (t) => { const s = t.src("controllers/productsControllers.js"); return /LIKE\s+\?/i.test(s) && !/LIKE\s+['"`]%?\$\{/.test(s) && !/LIKE\s*'"\s*\+/.test(s); } },
      ] },
      { t: "h", h: "The finished app" },
      { t: "nplay", browser: true, task: "Pick a genre or type in the search box in the Browser tab. Then add your own record to <code>database.db</code> and save.", requests: [{ url: "/api/products/genres" }, { url: "/api/products?genre=rock" }, { url: "/api/products?search=sun" }], files: VV_FILES_BASIC },
      { t: "recap", items: ["Middleware = <code>(req, res, next)</code>, run in registration order", "<code>express.static</code> serves the frontend; <code>express.json</code> parses bodies", "SQLite is a SQL database in a file; <code>sqlite</code> + <code>sqlite3</code> give you async <code>all/get/run/exec</code>", "Build queries conditionally, but always pass values with <code>?</code> placeholders"] },
    ]},

    /* ───────────────────────── Authentication ───────────────────────── */
    { id: "ex-auth", title: "Authentication", min: 150, kind: "project", body: [
      { t: "p", h: "Vinyl Vault needs accounts: sign up, log in, see your name, log out, and keep a shopping cart that only you can see. You'll build <b>session-based authentication</b>, the classic approach used by countless web apps." },
      { t: "video", name: "session-auth" },
      { t: "h", h: "Create a users table" },
      { t: "code", lang: "sql", code: `CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,          -- a hash, never the real password
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);` },
      { t: "h", h: "Aside: validation" },
      { t: "p", h: "The frontend can check inputs, but anyone can call your API directly with <code>curl</code>. <b>The server must validate everything</b>: required fields, formats, lengths. Trim whitespace, then check. The <code>validator</code> package handles the fiddly ones: <code>validator.isEmail(email)</code>." },
      { t: "h", h: "Hash the password" },
      { t: "p", h: "Never store passwords as text. If the database leaks, every account (and every other site where people reused the password) is compromised. Store a <b>hash</b>: a one-way fingerprint. <b>bcrypt</b> adds a random <b>salt</b> to each password, so identical passwords get different hashes, and it's deliberately slow, so guessing billions of passwords is impractical." },
      { t: "code", lang: "javascript", code: `import bcrypt from "bcryptjs"

const hashed = await bcrypt.hash(password, 10)        // 10 = cost factor ("salt rounds")
// "$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy"

const isValid = await bcrypt.compare(attempt, user.password)   // true / false` },
      { t: "callout", kind: "tip", h: "The lab's bcrypt is a fast stand-in with the same API and the same 60-character format. Real bcrypt takes around 100 ms per hash on purpose." },
      { t: "h", h: "Aside: express-session" },
      { t: "p", h: "HTTP is stateless: each request arrives with no memory of the last. A <b>session</b> fixes that. After login, the server stores <code>req.session.userId = user.id</code> in a session store and sends the browser a cookie holding only a random session ID. The browser sends that cookie back automatically on every request, and <code>express-session</code> loads the matching session into <code>req.session</code>." },
      { t: "code", lang: "javascript", code: `import session from "express-session"

app.use(session({
  secret: process.env.SESSION_SECRET,   // signs the cookie so it can't be forged
  resave: false,
  saveUninitialized: false,             // don't create sessions for anonymous visitors
  cookie: { httpOnly: true, secure: false, sameSite: "lax" },  // secure: true in production (HTTPS)
}))` },
      { t: "steps", items: [
        "<code>httpOnly</code>: JavaScript on the page can't read the cookie, so an XSS bug can't steal the session",
        "<code>secure</code>: only sent over HTTPS (turn it on in production)",
        "<code>sameSite: \"lax\"</code>: not sent on most cross-site requests, which blocks many CSRF attacks",
        "The default store is in memory: fine for learning, but use a database or Redis store in production",
      ] },
      { t: "nch", prompt: "Write <code>registerUser</code>. Require all four fields (400 <code>{ error }</code> if any is missing), check the username (1–20 letters, numbers, <code>_</code> or <code>-</code>) and email format, reject an email or username that's taken (400), hash the password with bcrypt, insert the user, set <code>req.session.userId</code> and respond <b>201</b>.", requests: [
        { method: "POST", url: "/api/auth/register", body: NEW_USER },
        { url: "/api/auth/me" },
        { method: "POST", url: "/api/auth/register", body: { name: "X", email: "not-an-email", username: "x", password: "pw" } },
      ], files: {
        ...VV_FILES_FULL,
        "controllers/authControllers.js": VV_AUTH_CTRL.replace(/export async function registerUser[\s\S]*?\n}\n\nexport async function loginUser/, `export async function registerUser(req, res) {
  let { name, email, username, password } = req.body ?? {}
  // 1. all fields required   2. trim   3. check username and email
  // 4. email or username taken?   5. hash   6. insert   7. log them in
  res.status(501).json({ error: "Not implemented yet" })
}

export async function loginUser`),
      }, solution: { "controllers/authControllers.js": VV_AUTH_CTRL }, tests: [
        { msg: "A valid sign-up responds 201 and logs the user in", fn: async (t) => { const r = await t.post("/api/auth/register", { name: "Ada Lovelace", email: "ada@example.com", username: "ada", password: "analytical-engine" }); const me = await t.get("/api/auth/me"); return r.status === 201 && me.json && me.json.isLoggedIn === true && me.json.name === "Ada Lovelace"; } },
        { msg: "Missing fields get a 400 with an error", fn: async (t) => { const r = await t.post("/api/auth/register", { name: "No Email", username: "nomail", password: "pw" }); return r.status === 400 && r.json && typeof r.json.error === "string"; } },
        { msg: "Bad emails and usernames get a 400", fn: async (t) => { const a = await t.post("/api/auth/register", { name: "A", email: "nope", username: "okname", password: "pw" }); const b = await t.post("/api/auth/register", { name: "B", email: "b@example.com", username: "has spaces!", password: "pw" }); return a.status === 400 && b.status === 400; } },
        { msg: "A taken email or username gets a 400", fn: async (t) => { await t.post("/api/auth/register", { name: "Ada", email: "ada@example.com", username: "ada", password: "pw1" }); t.clearCookies(); const a = await t.post("/api/auth/register", { name: "Ada 2", email: "ada@example.com", username: "ada2", password: "pw2" }); const b = await t.post("/api/auth/register", { name: "Ada 3", email: "ada3@example.com", username: "ada", password: "pw3" }); return a.status === 400 && b.status === 400; } },
        { msg: "The password is stored as a bcrypt hash: logging in with bcrypt.compare works", fn: async (t) => { await t.post("/api/auth/register", { name: "Hash Check", email: "h@example.com", username: "hasher", password: "plain-text-pw" }); await t.get("/api/auth/logout"); const bad = await t.post("/api/auth/login", { username: "hasher", password: "wrong" }); const ok = await t.post("/api/auth/login", { username: "hasher", password: "plain-text-pw" }); return bad.status === 401 && ok.status === 200 && /bcrypt\.hash\(/.test(t.src("controllers/authControllers.js")); } },
        { msg: "Uses ? placeholders for the INSERT", fn: async (t) => /INSERT INTO users[^`"']*\(\s*\?\s*,\s*\?\s*,\s*\?\s*,\s*\?\s*\)/i.test(t.src("controllers/authControllers.js")) },
      ] },
      { t: "h", h: "Log in, display the user's name and log out" },
      { t: "code", lang: "javascript", code: `// POST /api/auth/login
const user = await db.get("SELECT * FROM users WHERE username = ?", [username])
if (!user || !(await bcrypt.compare(password, user.password))) {
  return res.status(401).json({ error: "Invalid credentials" })   // don't say which part was wrong
}
req.session.userId = user.id

// GET /api/auth/me
if (!req.session.userId) return res.json({ isLoggedIn: false })
const user = await db.get("SELECT name FROM users WHERE id = ?", [req.session.userId])
res.json({ isLoggedIn: true, name: user.name })

// GET /api/auth/logout
req.session.destroy(() => res.json({ message: "Logged out" }))` },
      { t: "callout", kind: "key", h: "\"Invalid credentials\" for both an unknown user and a wrong password is deliberate. Saying \"no such user\" tells attackers which usernames exist." },
      { t: "h", h: "Aside: protected routes" },
      { t: "p", h: "The cart belongs to a user, so its routes must reject anonymous requests. Write the check once as middleware and put it in front of each route that needs it." },
      { t: "code", lang: "javascript", code: VV_REQUIRE_AUTH + `
cartRouter.post("/add", requireAuth, addToCart)     // requireAuth runs first; addToCart only if next() is called` },
      { t: "nch", prompt: "Protect the cart. Write <code>requireAuth</code> so requests without <code>req.session.userId</code> get <b>401</b> <code>{ error }</code>, and use it on every cart route. Then finish <code>getCartCount</code>: respond with <code>{ totalItems }</code>, the sum of the user's cart quantities (0 when empty).", requests: [
        { method: "POST", url: "/api/auth/register", body: NEW_USER },
        { method: "POST", url: "/api/cart/add", body: { productId: 3 } },
        { url: "/api/cart/cart-count" },
        { url: "/api/cart" },
        { url: "/api/auth/logout" },
      ], files: {
        ...VV_FILES_FULL,
        "middleware/requireAuth.js": `export function requireAuth(req, res, next) {
  next()
}
`,
        "routes/cart.js": `import express from "express"
import { addToCart, getCartCount, getAll, deleteItem, deleteAll } from "../controllers/cartController.js"
import { requireAuth } from "../middleware/requireAuth.js"

export const cartRouter = express.Router()

cartRouter.post("/add", addToCart)
cartRouter.get("/cart-count", getCartCount)
cartRouter.get("/", getAll)
cartRouter.delete("/all", deleteAll)
cartRouter.delete("/:itemId", deleteItem)
`,
        "controllers/cartController.js": VV_CART_CTRL.replace(/export async function getCartCount[\s\S]*?\n}\n/, `export async function getCartCount(req, res) {
  // SUM the quantities for this user
  res.json({ totalItems: 0 })
}
`),
      }, solution: { "middleware/requireAuth.js": VV_REQUIRE_AUTH, "routes/cart.js": VV_CART_ROUTES, "controllers/cartController.js": VV_CART_CTRL }, tests: [
        { msg: "Logged out: every cart route responds 401", fn: async (t) => { const rs = [await t.get("/api/cart"), await t.get("/api/cart/cart-count"), await t.post("/api/cart/add", { productId: 1 }), await t.del("/api/cart/all")]; return rs.every((r) => r.status === 401 && r.json && r.json.error); } },
        { msg: "Logged in: adding records works", fn: async (t) => { await t.post("/api/auth/register", { name: "Ada", email: "ada@example.com", username: "ada", password: "pw" }); const r = await t.post("/api/cart/add", { productId: 3 }); return r.status === 200; } },
        { msg: "cart-count sums the quantities", fn: async (t) => { await t.post("/api/auth/register", { name: "Ada", email: "ada@example.com", username: "ada", password: "pw" }); const zero = await t.get("/api/cart/cart-count"); await t.post("/api/cart/add", { productId: 3 }); await t.post("/api/cart/add", { productId: 3 }); await t.post("/api/cart/add", { productId: 5 }); const r = await t.get("/api/cart/cart-count"); return zero.json.totalItems === 0 && r.json.totalItems === 3; } },
        { msg: "Each user only sees their own cart", fn: async (t) => { await t.post("/api/auth/register", { name: "Ada", email: "ada@example.com", username: "ada", password: "pw" }); await t.post("/api/cart/add", { productId: 1 }); t.clearCookies(); await t.post("/api/auth/register", { name: "Linus", email: "linus@example.com", username: "linus", password: "pw" }); const r = await t.get("/api/cart/cart-count"); const items = await t.get("/api/cart"); return r.json.totalItems === 0 && items.json.items.length === 0; } },
        { msg: "After logout the cart is protected again", fn: async (t) => { await t.post("/api/auth/register", { name: "Ada", email: "ada@example.com", username: "ada", password: "pw" }); await t.get("/api/auth/logout"); return (await t.get("/api/cart")).status === 401; } },
      ] },
      { t: "h", h: "The finished app" },
      { t: "nplay", browser: true, task: "Sign up in the Browser tab, add a few records, open your cart, log out and back in. Watch the 🍪 session cookie appear in the API client, and look at <code>req.session</code> in the controllers.", requests: [{ method: "POST", url: "/api/auth/login", body: { username: "ada", password: "analytical-engine" } }, { url: "/api/auth/me" }, { url: "/api/cart" }], files: VV_FILES_FULL },
      { t: "h", h: "Sessions vs tokens" },
      { t: "p", h: "The other common approach is <b>token-based</b> auth (often JWTs): the server signs a token containing the user ID, and the client sends it in an <code>Authorization</code> header. Tokens suit mobile apps and separate API servers; sessions are simpler and easy to revoke for classic web apps. Either way, the rules are the same: hash passwords, validate input, protect routes on the server, and use HTTPS." },
      { t: "quiz", q: "Where should a protected route check that the user is logged in?", opts: ["Only in the frontend, by hiding the button", "On the server, in middleware before the handler", "In the database"], a: 1, why: "Anyone can call your API without your frontend. The server is the only place a check can't be skipped." },
      { t: "recap", items: ["Validate every input on the server", "Hash passwords with bcrypt (salted and slow); compare with <code>bcrypt.compare</code>", "express-session: <code>req.session.userId</code> after login; the browser keeps a session cookie", "Cookie flags: httpOnly, secure, sameSite", "Same error for unknown user and wrong password", "<code>requireAuth</code> middleware returns 401 before protected handlers run"] },
    ]},
  ],
};
