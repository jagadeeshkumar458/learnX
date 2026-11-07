/* Module — Node.js. Lesson titles match the syllabus so the topic lists attach.
   `nplay` = Node project lab (editor + API client + browser + terminal);
   `nch` = Node challenge, tests are `async (t) => boolean` run against a freshly started server. */
import {
  PKG, DESTINATIONS, DB, SEND_JSON, BY_PATH, BY_QUERY, WILD_SERVER,
  SIGHTINGS_JSON, STORIES, GET_CONTENT_TYPE, SEND_RESPONSE, SERVE_STATIC, GET_DATA, PARSE_BODY,
  ADD_SIGHTING, SANITIZE, SIGHTING_EVENTS, CREATE_ALERT, ROUTE_HANDLERS, SPOOKY_SERVER,
  SPOOKY_HTML, SPOOKY_CSS, SPOOKY_JS, SPOOKY_404, GOLD_HTML, GOLD_CSS, GOLD_JS,
} from "./node-files.js";

const WILD_BASE = {
  "package.json": PKG("wild-horizons"),
  "data/data.js": DESTINATIONS,
};

const SPOOKY_FILES = {
  "server.js": SPOOKY_SERVER,
  "handlers/routeHandlers.js": ROUTE_HANDLERS,
  "utils/serveStatic.js": SERVE_STATIC,
  "utils/getContentType.js": GET_CONTENT_TYPE,
  "utils/sendResponse.js": SEND_RESPONSE,
  "utils/getData.js": GET_DATA,
  "utils/parseJSONBody.js": PARSE_BODY,
  "utils/addNewSighting.js": ADD_SIGHTING,
  "utils/sanitizeInput.js": SANITIZE,
  "utils/createAlert.js": CREATE_ALERT,
  "events/sightingEvents.js": SIGHTING_EVENTS,
  "data/data.json": SIGHTINGS_JSON,
  "data/stories.js": STORIES,
  "public/index.html": SPOOKY_HTML,
  "public/index.css": SPOOKY_CSS,
  "public/index.js": SPOOKY_JS,
  "public/404.html": SPOOKY_404,
  "package.json": PKG("spooky-sightings"),
};

const GOLD_SOLUTION = `import http from "node:http"
import path from "node:path"
import fs from "node:fs/promises"

const PORT = 8000
const __dirname = import.meta.dirname

/* ── a simulated gold price that drifts every second ── */
let price = 2400
setInterval(() => {
  price = Math.max(100, price + (Math.random() - 0.5) * 12)
}, 1000)

const types = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript" }

function sendJSON(res, status, payload) {
  res.writeHead(status, { "Content-Type": "application/json" })
  res.end(JSON.stringify(payload))
}

async function parseJSONBody(req) {
  let body = ""
  for await (const chunk of req) body += chunk
  return JSON.parse(body)
}

const server = http.createServer(async (req, res) => {
  if (req.url === "/api/live-price" && req.method === "GET") {
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    })
    const send = () => res.write("data: " + JSON.stringify({ price: Number(price.toFixed(2)) }) + "\\n\\n")
    send()
    const id = setInterval(send, 1000)
    req.on("close", () => clearInterval(id))
    return
  }

  if (req.url === "/api/invest" && req.method === "POST") {
    let amount
    try {
      amount = Number((await parseJSONBody(req)).amount)
    } catch {
      return sendJSON(res, 400, { error: "Send JSON like { \\"amount\\": 1000 }" })
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      return sendJSON(res, 400, { error: "Amount must be a positive number" })
    }
    const currentPrice = Number(price.toFixed(2))
    const ounces = amount / currentPrice
    const line = new Date().toISOString() + ", amount paid: $" + amount + ", price per Oz: $" + currentPrice + ", gold sold: " + ounces.toFixed(4) + " Oz\\n"
    await fs.appendFile(path.join(__dirname, "purchases.txt"), line)
    return sendJSON(res, 201, { amount, price: currentPrice, ounces })
  }

  if (req.url.startsWith("/api")) {
    return sendJSON(res, 404, { error: "not found" })
  }

  const filePath = path.join(__dirname, "public", req.url === "/" ? "index.html" : req.url)
  try {
    const content = await fs.readFile(filePath)
    res.writeHead(200, { "Content-Type": types[path.extname(filePath)] || "text/plain" })
    res.end(content)
  } catch {
    res.writeHead(404, { "Content-Type": "text/html" })
    res.end("<h1>404: not found</h1>")
  }
})

server.listen(PORT, () => console.log("GoldDigger running on port " + PORT))
`;

export const NODE = {
  id: "node",
  title: "Node.js",
  blurb: "Run JavaScript on the server: build APIs, serve files and stream live data.",
  concepts: ["The Node runtime and npm", "http.createServer and the req/res cycle", "Routing, path and query parameters", "Serving static files with fs and path", "Parsing and sanitising request bodies", "EventEmitter and Server-Sent Events"],
  lessons: [
    /* ───────────────────────── Welcome ───────────────────────── */
    { id: "node-welcome", title: "Welcome to Node", min: 14, kind: "lesson", body: [
      { t: "p", h: "Until now your JavaScript has run in the browser. <b>Node.js</b> runs it everywhere else: on servers, on your laptop's command line, in build tools. Vite, npm, ESLint and most of the tools you've used are Node programs. Node lets you use one language for the whole stack." },
      { t: "h", h: "What Node actually is" },
      { t: "p", h: "Node is a <b>runtime</b>: Google's <b>V8</b> engine (the one inside Chrome) plus a library called <b>libuv</b> that talks to the operating system for files, networking and timers. Instead of the DOM and <code>window</code>, you get modules like <code>fs</code> (files), <code>http</code> (servers), <code>path</code> and <code>process</code>." },
      { t: "diagram", name: "node-arch" },
      { t: "steps", items: [
        "<b>No DOM</b>: there's no <code>document</code> or <code>window</code>. The global object is <code>globalThis</code> (also called <code>global</code>)",
        "<b>System access</b>: read and write files, open network ports, read environment variables with <code>process.env</code>",
        "<b>Non-blocking I/O</b>: while Node waits for a file or a database, the event loop keeps serving other requests, the same event loop you met in Async JavaScript",
        "<b>npm</b>: the largest package registry in the world, installed alongside Node",
      ] },
      { t: "quiz", q: "Which of these is NOT available in Node?", opts: ["setTimeout", "fetch", "document.querySelector", "JSON.parse"], a: 2, why: "There's no page in Node, so there's no DOM. Timers, <code>fetch</code> (since Node 18) and the language built-ins are all there." },
      { t: "h", h: "Running JavaScript with Node" },
      { t: "code", lang: "bash", code: `node --version        # check it's installed (use an LTS version, like 22)
node                  # the REPL: type JavaScript, get answers. Ctrl+C twice to quit
node index.js         # run a file` },
      { t: "nplay", script: true, task: "Run this script, then add a line that prints how many files are in the project with <code>files.length</code>.", files: {
        "index.js": `import path from "node:path"
import os from "node:os"
import { readdir, readFile } from "node:fs/promises"

console.log("Hello from Node", process.version)
console.log("Running on", os.platform(), "in", process.cwd())
console.log("This file is", import.meta.filename)
console.log("Its extension is", path.extname(import.meta.filename))

// Top-level await works in ES modules
const files = await readdir(".")
console.log("Files here:", files)

const pkg = JSON.parse(await readFile("package.json", "utf8"))
console.log("Project name:", pkg.name)
`,
        "package.json": `{
  "name": "hello-node",
  "type": "module"
}
`,
        "notes.txt": "Node can read me with fs.readFile!\n",
      } },
      { t: "h", h: "Modules: ES modules and CommonJS" },
      { t: "p", h: "Node has two module systems. Older code uses <b>CommonJS</b>: <code>const fs = require(\"fs\")</code> and <code>module.exports</code>. Modern code uses <b>ES modules</b>, the same <code>import</code>/<code>export</code> you use in the browser. Turn them on with <code>\"type\": \"module\"</code> in package.json. This course uses ES modules." },
      { t: "code", lang: "javascript", code: `// CommonJS (older)
const http = require("http")
module.exports = { sum }

// ES modules (modern, needs "type": "module")
import http from "node:http"   // the node: prefix marks a built-in module
export function sum(a, b) { return a + b }
import { sum } from "./utils/sum.js"   // relative imports need the .js extension` },
      { t: "callout", kind: "warn", h: "In ES modules there's no <code>__dirname</code>. Use <code>import.meta.dirname</code> (Node 20.11+), or the older <code>path.dirname(fileURLToPath(import.meta.url))</code>." },
      { t: "h", h: "npm and package.json" },
      { t: "p", h: "<code>npm init -y</code> creates a <code>package.json</code>: your project's name, its dependencies, and <b>scripts</b>. <code>npm install some-package</code> downloads a package into <code>node_modules/</code> and records it under <code>dependencies</code>. Add <code>node_modules</code> to <code>.gitignore</code>; anyone can recreate it with <code>npm install</code>." },
      { t: "code", lang: "json", code: `{
  "name": "wild-horizons",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "node server.js",
    "dev": "node --watch server.js"
  }
}` },
      { t: "p", h: "<code>npm start</code> runs the start script. <code>npm run dev</code> runs the dev script; <code>node --watch</code> restarts the server whenever you save, so you don't need nodemon any more. The labs in this module restart on save too." },
      { t: "quiz", q: "What does <code>\"type\": \"module\"</code> in package.json do?", opts: ["Makes the project a library", "Tells Node to treat .js files as ES modules, so import/export work", "Installs TypeScript"], a: 1, why: "Without it, Node treats .js files as CommonJS and <code>import</code> is a syntax error (unless the file ends in .mjs)." },
      { t: "recap", items: ["Node = V8 + libuv: JavaScript outside the browser", "No DOM; instead fs, http, path, process and more", "Non-blocking I/O keeps one thread busy and responsive", "ES modules with <code>\"type\": \"module\"</code> and <code>node:</code> imports", "package.json scripts: <code>npm start</code>, <code>npm run dev</code> with <code>node --watch</code>"] },
    ]},

    /* ───────────────────────── Build a Node API ───────────────────────── */
    { id: "node-api", title: "Build a Node API", min: 120, kind: "project", body: [
      { t: "p", h: "<b>Wild Horizons</b> is an API of the world's most remarkable places. Clients can get every destination, filter by continent or country, and use query strings like <code>?is_open_to_public=true</code>. You'll build it with nothing but Node's built-in <code>http</code> module, so you understand exactly what frameworks like Express do for you later." },
      { t: "h", h: "Your first server" },
      { t: "code", lang: "javascript", code: `import http from "node:http"

const PORT = 8000

const server = http.createServer((req, res) => {
  res.end("Hello from the server!")
})

server.listen(PORT, () => console.log(\`Server running on port: \${PORT}\`))` },
      { t: "p", h: "<code>createServer</code> takes a <b>request handler</b>: a function Node calls once for every incoming request. <code>req</code> describes the request (method, URL, headers, body); <code>res</code> is how you answer. <code>listen</code> opens the port. The process then keeps running, waiting for requests." },
      { t: "h", h: "The request/response cycle" },
      { t: "video", name: "node-server" },
      { t: "steps", items: [
        "The client sends a request: a <b>method</b> (GET, POST…), a <b>URL</b>, <b>headers</b> and sometimes a <b>body</b>",
        "Node calls your handler with <code>req</code> and <code>res</code>",
        "Your code decides what to send back: a <b>status code</b>, <b>headers</b> such as Content-Type, and a <b>body</b>",
        "<code>res.end()</code> sends it. Every request must end with exactly one response, or the client waits until it times out",
      ] },
      { t: "nplay", task: "Send the request, then change the message and save: the server restarts, like <code>node --watch</code>. Try <code>/anything</code> too: why do you get the same answer?", requests: [{ method: "GET", url: "/" }, { method: "GET", url: "/anything" }], files: {
        "server.js": `import http from "node:http"

const PORT = 8000

const server = http.createServer((req, res) => {
  console.log(req.method, req.url)
  res.end("Hello from the server!")
})

server.listen(PORT, () => console.log(\`Server running on port: \${PORT}\`))
`,
        "package.json": PKG("wild-horizons"),
      } },
      { t: "h", h: "Routing with the req object" },
      { t: "p", h: "Right now every URL gets the same answer. <b>Routing</b> means choosing a response based on <code>req.url</code> and <code>req.method</code>." },
      { t: "h", h: "JSON and APIs" },
      { t: "p", h: "An API usually sends <b>JSON</b>. <code>res.end()</code> only accepts strings (or buffers), so serialise data with <code>JSON.stringify()</code>, and set the <code>Content-Type</code> header to <code>application/json</code> so clients know how to read it. Without it, <code>fetch</code> still works, but browsers, tools and other developers have to guess." },
      { t: "code", lang: "javascript", code: `if (req.url === "/api" && req.method === "GET") {
  res.setHeader("Content-Type", "application/json")
  res.statusCode = 200
  res.end(JSON.stringify(destinations))
} else {
  res.setHeader("Content-Type", "application/json")
  res.statusCode = 404
  res.end(JSON.stringify({ error: "not found", message: "The requested route does not exist" }))
}` },
      { t: "callout", kind: "tip", h: "A route that doesn't exist should still get an answer: a <b>404</b> with a helpful JSON body. Clients can check <code>res.status</code> or <code>res.ok</code> and show a proper error." },
      { t: "diagram", name: "node-routes" },
      { t: "nch", prompt: "In <code>server.js</code>, serve the destinations as JSON on <code>GET /api</code> with status 200 and <code>Content-Type: application/json</code>. Any other route or method gets a 404 with a JSON body that has an <code>error</code> property.", requests: [{ method: "GET", url: "/api" }, { method: "GET", url: "/nope" }, { method: "POST", url: "/api", body: { name: "Atlantis" } }], files: {
        "server.js": `import http from "node:http"
import { destinations } from "./data/data.js"

const PORT = 8000

const server = http.createServer((req, res) => {
  res.end("Hello from the server!")
})

server.listen(PORT, () => console.log(\`Server running on port: \${PORT}\`))
`,
        ...WILD_BASE,
      }, solution: {
        "server.js": `import http from "node:http"
import { destinations } from "./data/data.js"

const PORT = 8000

const server = http.createServer((req, res) => {
  res.setHeader("Content-Type", "application/json")
  if (req.url === "/api" && req.method === "GET") {
    res.statusCode = 200
    res.end(JSON.stringify(destinations))
  } else {
    res.statusCode = 404
    res.end(JSON.stringify({ error: "not found", message: "The requested route does not exist" }))
  }
})

server.listen(PORT, () => console.log(\`Server running on port: \${PORT}\`))
`,
      }, tests: [
        { msg: "The server listens on port 8000", fn: async (t) => t.listening },
        { msg: "GET /api responds 200 with all 12 destinations", fn: async (t) => { const r = await t.get("/api"); return r.status === 200 && Array.isArray(r.json) && r.json.length === 12; } },
        { msg: "…with Content-Type: application/json", fn: async (t) => /application\/json/.test(t.header(await t.get("/api"), "content-type")) },
        { msg: "Unknown routes get a 404 with a JSON error", fn: async (t) => { const r = await t.get("/no-such-route"); return r.status === 404 && r.json && typeof r.json.error === "string"; } },
        { msg: "Other methods on /api get a 404 too", fn: async (t) => (await t.post("/api", { name: "Atlantis" })).status === 404 },
      ] },
      { t: "h", h: "Path parameters" },
      { t: "p", h: "Clients want just one continent: <code>/api/continent/europe</code>. The last part of the path is a <b>path parameter</b>. Match the start of the URL, then pull the value off the end." },
      { t: "code", lang: "javascript", code: `} else if (req.url.startsWith("/api/continent/") && req.method === "GET") {
  const continent = decodeURIComponent(req.url.split("/").pop())
  const filtered = destinations.filter(d =>
    d.continent.toLowerCase() === continent.toLowerCase()
  )
  sendJSONResponse(res, 200, filtered)
}` },
      { t: "callout", kind: "warn", h: "URLs can't contain spaces, so a client requests <code>/api/continent/south%20america</code>. <code>decodeURIComponent()</code> turns <code>%20</code> back into a space. Forget it and \"South America\" never matches." },
      { t: "h", h: "Modularise the code" },
      { t: "p", h: "<code>server.js</code> fills up fast. Move each job into its own module: <code>database/db.js</code> for getting data, <code>utils/sendJSONResponse.js</code> for the repeated header-status-end dance, and <code>utils/getDataByPathParams.js</code> for filtering. The server file then reads like a table of contents." },
      { t: "code", lang: "javascript", code: SEND_JSON },
      { t: "callout", kind: "tip", h: "<code>Access-Control-Allow-Origin: *</code> is a <b>CORS</b> header. Browsers block JavaScript on one origin from reading responses from another unless the server opts in like this. It's what lets a frontend on another domain use your public API." },
      { t: "h", h: "Query parameters" },
      { t: "p", h: "Query strings add optional filters: <code>/api?continent=asia&is_open_to_public=true</code>. Don't parse them by hand. Build a <code>URL</code> object and read its <code>searchParams</code>, then route on <code>pathname</code>, which leaves the query string out." },
      { t: "code", lang: "javascript", code: `const urlObj = new URL(req.url, \`http://\${req.headers.host}\`)   // req.url is relative, so give it a base
urlObj.pathname                                // "/api"
const queryObj = Object.fromEntries(urlObj.searchParams)
// { continent: "asia", is_open_to_public: "true" }  ← every value is a string` },
      { t: "quiz", q: "A client requests <code>/api?is_open_to_public=false</code>. What's the type of <code>queryObj.is_open_to_public</code>?", opts: ["boolean false", "the string \"false\"", "undefined"], a: 1, why: "Everything in a URL is text. Convert it yourself, e.g. <code>JSON.parse(\"false\")</code> or <code>value === \"true\"</code>. And watch out: the string \"false\" is truthy!" },
      { t: "jsch", fn: "getDataByQueryParams", prompt: "Write <code>getDataByQueryParams(data, queryObj)</code>. Filter by <code>continent</code> and <code>country</code> (case-insensitive) and by <code>is_open_to_public</code> (the string \"true\" or \"false\"), but only for the keys that are present. With an empty query, return everything.", starter: `function getDataByQueryParams(data, queryObj) {
  const { continent, country, is_open_to_public } = queryObj

}`, solution: BY_QUERY.replace("export ", ""), tests: [
        { msg: "No query returns all the data", fn: (f) => f([{ continent: "Asia", country: "China", is_open_to_public: true }], {}).length === 1 },
        { msg: "Filters by continent, ignoring case", fn: (f) => f([{ continent: "Asia", country: "China", is_open_to_public: true }, { continent: "Europe", country: "Norway", is_open_to_public: false }], { continent: "asia" }).map((d) => d.country).join() === "China" },
        { msg: "Filters by is_open_to_public as a real boolean (\"false\" must not match open places)", fn: (f) => { const d = [{ continent: "Europe", country: "Norway", is_open_to_public: false }, { continent: "Europe", country: "Croatia", is_open_to_public: true }]; return f(d, { is_open_to_public: "false" }).map((x) => x.country).join() === "Norway" && f(d, { is_open_to_public: "TRUE" }).map((x) => x.country).join() === "Croatia"; } },
        { msg: "Combines filters", fn: (f) => { const d = [{ continent: "Oceania", country: "Australia", is_open_to_public: true }, { continent: "Oceania", country: "Fiji", is_open_to_public: true }, { continent: "Asia", country: "Australia", is_open_to_public: true }]; return f(d, { continent: "oceania", country: "australia" }).length === 1; } },
      ] },
      { t: "nch", prompt: "Finish Wild Horizons. Using the helper modules: <code>GET /api</code> supports the query filters; <code>GET /api/continent/:continent</code> and <code>GET /api/country/:country</code> return matching destinations (case-insensitive, and decode the URL); anything else is a JSON 404.", requests: [
        { method: "GET", url: "/api?continent=asia" },
        { method: "GET", url: "/api?is_open_to_public=false" },
        { method: "GET", url: "/api/continent/south%20america" },
        { method: "GET", url: "/api/country/australia" },
      ], files: {
        "server.js": `import http from "node:http"
import { getDataFromDB } from "./database/db.js"
import { sendJSONResponse } from "./utils/sendJSONResponse.js"
import { getDataByPathParams } from "./utils/getDataByPathParams.js"
import { getDataByQueryParams } from "./utils/getDataByQueryParams.js"

const PORT = 8000

const server = http.createServer(async (req, res) => {
  const destinations = await getDataFromDB()

  if (req.url === "/api" && req.method === "GET") {
    sendJSONResponse(res, 200, destinations)
  } else {
    sendJSONResponse(res, 404, { error: "not found", message: "The requested route does not exist" })
  }
})

server.listen(PORT, () => console.log(\`Server running on port: \${PORT}\`))
`,
        "database/db.js": DB,
        "utils/sendJSONResponse.js": SEND_JSON,
        "utils/getDataByPathParams.js": BY_PATH,
        "utils/getDataByQueryParams.js": BY_QUERY,
        ...WILD_BASE,
      }, solution: { "server.js": WILD_SERVER }, tests: [
        { msg: "GET /api still returns all 12 destinations", fn: async (t) => (await t.get("/api")).json.length === 12 },
        { msg: "GET /api?continent=asia returns only Asian destinations", fn: async (t) => { const r = await t.get("/api?continent=asia"); return r.status === 200 && r.json.length === 2 && r.json.every((d) => d.continent === "Asia"); } },
        { msg: "GET /api?is_open_to_public=false returns the 2 closed places", fn: async (t) => { const r = await t.get("/api?is_open_to_public=false"); return r.json.length === 2 && r.json.every((d) => d.is_open_to_public === false); } },
        { msg: "GET /api/continent/south%20america works (decoded, case-insensitive)", fn: async (t) => { const r = await t.get("/api/continent/south%20america"); return r.status === 200 && r.json.length === 2 && r.json.every((d) => d.continent === "South America"); } },
        { msg: "GET /api/country/australia returns Australian destinations", fn: async (t) => { const r = await t.get("/api/country/AUSTRALIA"); return r.status === 200 && r.json.length === 2 && r.json.every((d) => d.country === "Australia"); } },
        { msg: "Unknown routes are still a JSON 404", fn: async (t) => { const r = await t.get("/api/planet/mars"); return r.status === 404 && !!r.json; } },
      ] },
      { t: "h", h: "Wrapping things up" },
      { t: "p", h: "You built a real REST API with zero dependencies. Notice the pain points: repetitive <code>if/else</code> routing, manual URL parsing, writing headers by hand. Express, which you'll learn soon, exists to remove exactly that boilerplate, and now you know what it's doing underneath." },
      { t: "recap", items: ["<code>http.createServer(handler)</code> + <code>server.listen(port)</code>", "Route on <code>req.method</code> and the URL's <code>pathname</code>", "Send JSON with <code>JSON.stringify</code> and <code>Content-Type: application/json</code>", "404 with a JSON body for unknown routes", "Path params from the path (decode them!); query params with <code>new URL()</code> and <code>searchParams</code>", "Split the server into small modules"] },
    ]},

    /* ───────────────────────── Fullstack Node App ───────────────────────── */
    { id: "node-fullstack", title: "Build a Fullstack Node App", min: 130, kind: "project", body: [
      { t: "p", h: "Now the server serves a whole website. <b>Spooky Sightings</b> lets people report paranormal sightings: Node serves the HTML, CSS and JavaScript, provides a JSON API, accepts new sightings with POST, and streams live \"news\" to every open browser." },
      { t: "diagram", name: "fullstack-node" },
      { t: "h", h: "A diversion into writeHead()" },
      { t: "p", h: "<code>res.writeHead(status, headers)</code> sets the status code and several headers in one call. It's equivalent to setting <code>res.statusCode</code> and calling <code>res.setHeader</code> for each one, but it sends the headers immediately, so it must come before any <code>res.write()</code>." },
      { t: "code", lang: "javascript", code: `res.writeHead(200, { "Content-Type": "text/html" })
res.end("<h1>Hello</h1>")` },
      { t: "h", h: "The path module" },
      { t: "p", h: "File paths differ between operating systems (<code>/</code> on macOS and Linux, <code>\\</code> on Windows). <code>path</code> builds them safely:" },
      { t: "code", lang: "javascript", code: `import path from "node:path"

const __dirname = import.meta.dirname                 // folder of the current file
path.join(__dirname, "public", "index.html")           // "/app/public/index.html"
path.extname("index.css")                              // ".css"
path.basename("/app/public/index.css")                 // "index.css"
path.join("/app/public", "/../server.js")              // "/app/server.js"  ← careful!` },
      { t: "h", h: "The fs module" },
      { t: "p", h: "<code>fs</code> reads and writes files. Use the promise version, <code>node:fs/promises</code>, with <code>await</code>. Reading a file that doesn't exist throws an error with <code>err.code === \"ENOENT\"</code>, which is exactly how you'll detect a 404." },
      { t: "code", lang: "javascript", code: `import fs from "node:fs/promises"

const html = await fs.readFile(path.join(__dirname, "public", "index.html"), "utf8")
await fs.writeFile("data/data.json", JSON.stringify(data, null, 2), "utf8")
await fs.appendFile("log.txt", "a new line\\n")` },
      { t: "callout", kind: "warn", h: "Avoid the <code>...Sync</code> versions (<code>readFileSync</code>) inside request handlers. They block the event loop, so every other user waits while one file loads." },
      { t: "h", h: "Serving multiple assets" },
      { t: "p", h: "The browser loads <code>index.html</code>, then requests <code>/index.css</code> and <code>/index.js</code> separately. Each needs the right <code>Content-Type</code>, or the browser refuses to apply the CSS. Map the file extension to a MIME type:" },
      { t: "jsch", fn: "getContentType", prompt: "Write <code>getContentType(ext)</code>: return <code>text/javascript</code> for <code>.js</code>, <code>text/css</code> for <code>.css</code>, <code>application/json</code> for <code>.json</code>, <code>image/png</code>, <code>image/jpeg</code> (for <code>.jpg</code> and <code>.jpeg</code>), <code>image/svg+xml</code>, and <code>text/html</code> for anything else. Ignore the case of the extension.", starter: `function getContentType(ext) {

}`, solution: GET_CONTENT_TYPE.replace("export ", ""), tests: [
        { msg: ".css → text/css and .js → text/javascript", fn: (f) => f(".css") === "text/css" && f(".js") === "text/javascript" },
        { msg: ".jpg and .jpeg → image/jpeg, .png → image/png, .svg → image/svg+xml", fn: (f) => f(".jpg") === "image/jpeg" && f(".jpeg") === "image/jpeg" && f(".png") === "image/png" && f(".svg") === "image/svg+xml" },
        { msg: ".json → application/json", fn: (f) => f(".json") === "application/json" },
        { msg: "Anything else (and no extension) → text/html", fn: (f) => f(".html") === "text/html" && f("") === "text/html" },
        { msg: "Ignores case: .CSS → text/css", fn: (f) => f(".CSS") === "text/css" },
      ] },
      { t: "nch", prompt: "Write <code>serveStatic(req, res, baseDir)</code> in <code>utils/serveStatic.js</code>. Serve files from <code>public/</code> (<code>/</code> means <code>index.html</code>) with the right Content-Type. A missing file gets <code>public/404.html</code> with status 404. Refuse anything outside <code>public/</code> with a 403.", requests: [{ url: "/" }, { url: "/index.css" }, { url: "/index.js" }, { url: "/haunted.html" }, { url: "/../server.js" }], files: {
        "utils/serveStatic.js": `import path from "node:path"
import fs from "node:fs/promises"
import { sendResponse } from "./sendResponse.js"
import { getContentType } from "./getContentType.js"

export async function serveStatic(req, res, baseDir) {
  const publicDir = path.join(baseDir, "public")
  // 1. work out the file path (/ means index.html)
  // 2. refuse paths outside publicDir with a 403
  // 3. read the file and send it with the right Content-Type
  // 4. if it doesn't exist (err.code === "ENOENT"), send public/404.html with a 404
  sendResponse(res, 200, "text/html", "<h1>TODO</h1>")
}
`,
        "server.js": `import http from "node:http"
import { serveStatic } from "./utils/serveStatic.js"

const PORT = 8000
const __dirname = import.meta.dirname

const server = http.createServer(async (req, res) => {
  await serveStatic(req, res, __dirname)
})

server.listen(PORT, () => console.log("Connected on port: " + PORT))
`,
        "utils/sendResponse.js": SEND_RESPONSE,
        "utils/getContentType.js": GET_CONTENT_TYPE,
        "public/index.html": SPOOKY_HTML,
        "public/index.css": SPOOKY_CSS,
        "public/index.js": "console.log(\"Frontend loaded\")\n",
        "public/404.html": SPOOKY_404,
        "package.json": PKG("spooky-sightings"),
      }, solution: { "utils/serveStatic.js": SERVE_STATIC }, tests: [
        { msg: "GET / serves public/index.html as text/html", fn: async (t) => { const r = await t.get("/"); return r.status === 200 && /text\/html/.test(t.header(r, "content-type")) && r.body.includes("Spooky Sightings"); } },
        { msg: "GET /index.css is served as text/css", fn: async (t) => { const r = await t.get("/index.css"); return r.status === 200 && /text\/css/.test(t.header(r, "content-type")) && r.body.includes("box-sizing"); } },
        { msg: "GET /index.js is served as JavaScript", fn: async (t) => { const r = await t.get("/index.js"); return r.status === 200 && /javascript/.test(t.header(r, "content-type")) && r.body.includes("Frontend loaded"); } },
        { msg: "A missing file gets 404.html with status 404", fn: async (t) => { const r = await t.get("/haunted.html"); return r.status === 404 && r.body.includes("vanished"); } },
        { msg: "/../server.js is refused with 403", fn: async (t) => { const r = await t.get("/../server.js"); return r.status === 403 && !r.body.includes("createServer"); } },
      ] },
      { t: "h", h: "Getting the JSON data and wiring up the frontend" },
      { t: "p", h: "The sightings live in <code>data/data.json</code>. <code>getData()</code> reads and parses it; <code>GET /api</code> sends it. The frontend's <code>index.js</code> fetches <code>/api</code> and renders the list, the same fetch-and-render pattern from the APIs module, now talking to your own server." },
      { t: "code", lang: "javascript", code: GET_DATA },
      { t: "h", h: "Parsing the incoming body" },
      { t: "p", h: "A POST request's body doesn't arrive all at once. <code>req</code> is a <b>stream</b>: the data comes in chunks. Collect them with <code>for await</code>, then parse the whole string." },
      { t: "code", lang: "javascript", code: PARSE_BODY },
      { t: "h", h: "Handling POST" },
      { t: "code", lang: "javascript", code: `export async function handlePost(req, res) {
  try {
    const parsedBody = await parseJSONBody(req)
    const sanitizedBody = sanitizeInput(parsedBody)
    const newSighting = { uuid: crypto.randomUUID(), timeStamp: new Date().toISOString(), ...sanitizedBody }
    await addNewSighting(newSighting)        // read data.json, push, write it back
    sendResponse(res, 201, "application/json", JSON.stringify(newSighting))
  } catch (err) {
    sendResponse(res, 400, "application/json", JSON.stringify({ error: err.message }))
  }
}` },
      { t: "p", h: "<b>201 Created</b> tells the client a new resource exists, and sending it back lets the client show it straight away. Bad JSON is the client's mistake, so it gets a <b>400</b>, not a crash." },
      { t: "h", h: "Aside: sanitisation" },
      { t: "p", h: "Never trust input. If someone submits <code>&lt;img src=x onerror=\"stealCookies()\"&gt;</code> as a title and another user's page renders it with <code>innerHTML</code>, that script runs in their browser. This is <b>cross-site scripting (XSS)</b>. Defend in two places: <b>sanitise</b> on the way in (strip or reject HTML), and <b>escape</b> on the way out (use <code>textContent</code>, as <code>index.js</code> does)." },
      { t: "nch", prompt: "Make <code>POST /api</code> work in <code>handlers/routeHandlers.js</code>: parse the JSON body, sanitise it, give it a <code>uuid</code> and <code>timeStamp</code>, save it to <code>data/data.json</code>, and respond <b>201</b> with the new sighting. Invalid JSON gets a <b>400</b> with an <code>error</code>.", requests: [
        { method: "POST", url: "/api", body: { title: "Whispering wardrobe", location: "Bath, England", text: "It said my name. Twice." } },
        { method: "POST", url: "/api", body: { title: "<script>alert('boo')</script>Sneaky", location: "Online", text: "<b>bold</b> claims" } },
        { method: "POST", url: "/api", body: "{ not json" },
        { method: "GET", url: "/api" },
      ], files: {
        "handlers/routeHandlers.js": `import crypto from "node:crypto"
import { getData } from "../utils/getData.js"
import { sendResponse } from "../utils/sendResponse.js"
import { parseJSONBody } from "../utils/parseJSONBody.js"
import { addNewSighting } from "../utils/addNewSighting.js"
import { sanitizeInput } from "../utils/sanitizeInput.js"

export async function handleGet(res) {
  const data = await getData()
  sendResponse(res, 200, "application/json", JSON.stringify(data))
}

export async function handlePost(req, res) {
  sendResponse(res, 501, "application/json", JSON.stringify({ error: "Not implemented yet" }))
}
`,
        "server.js": `import http from "node:http"
import { serveStatic } from "./utils/serveStatic.js"
import { handleGet, handlePost } from "./handlers/routeHandlers.js"

const PORT = 8000
const __dirname = import.meta.dirname

const server = http.createServer(async (req, res) => {
  if (req.url === "/api") {
    if (req.method === "GET") return await handleGet(res)
    if (req.method === "POST") return await handlePost(req, res)
  } else if (!req.url.startsWith("/api")) {
    return await serveStatic(req, res, __dirname)
  }
  res.statusCode = 404
  res.end()
})

server.listen(PORT, () => console.log("Connected on port: " + PORT))
`,
        "utils/parseJSONBody.js": PARSE_BODY,
        "utils/sanitizeInput.js": SANITIZE,
        "utils/addNewSighting.js": ADD_SIGHTING,
        "utils/getData.js": GET_DATA,
        "utils/sendResponse.js": SEND_RESPONSE,
        "utils/serveStatic.js": SERVE_STATIC,
        "utils/getContentType.js": GET_CONTENT_TYPE,
        "data/data.json": SIGHTINGS_JSON,
        "public/index.html": SPOOKY_HTML,
        "public/404.html": SPOOKY_404,
        "package.json": PKG("spooky-sightings"),
      }, solution: {
        "handlers/routeHandlers.js": `import crypto from "node:crypto"
import { getData } from "../utils/getData.js"
import { sendResponse } from "../utils/sendResponse.js"
import { parseJSONBody } from "../utils/parseJSONBody.js"
import { addNewSighting } from "../utils/addNewSighting.js"
import { sanitizeInput } from "../utils/sanitizeInput.js"

export async function handleGet(res) {
  const data = await getData()
  sendResponse(res, 200, "application/json", JSON.stringify(data))
}

export async function handlePost(req, res) {
  try {
    const parsedBody = await parseJSONBody(req)
    const sanitizedBody = sanitizeInput(parsedBody)
    const newSighting = { uuid: crypto.randomUUID(), timeStamp: new Date().toISOString(), ...sanitizedBody }
    await addNewSighting(newSighting)
    sendResponse(res, 201, "application/json", JSON.stringify(newSighting))
  } catch (err) {
    sendResponse(res, 400, "application/json", JSON.stringify({ error: err.message }))
  }
}
`,
      }, tests: [
        { msg: "POST /api responds 201 with the new sighting, including a uuid and timeStamp", fn: async (t) => { const r = await t.post("/api", { title: "Whispering wardrobe", location: "Bath", text: "It said my name." }); return r.status === 201 && r.json && r.json.title === "Whispering wardrobe" && typeof r.json.uuid === "string" && r.json.uuid.length > 8 && !isNaN(Date.parse(r.json.timeStamp)); } },
        { msg: "The new sighting is saved: GET /api now returns 4", fn: async (t) => { await t.post("/api", { title: "A", location: "B", text: "C" }); const r = await t.get("/api"); return r.json.length === 4 && r.json[3].title === "A"; } },
        { msg: "It's written to data/data.json", fn: async (t) => { await t.post("/api", { title: "Saved?", location: "Disk", text: "yes" }); await t.wait(50); const f = t.file("data/data.json"); return !!f && JSON.parse(f).some((s) => s.title === "Saved?"); } },
        { msg: "HTML is stripped from the input", fn: async (t) => { const r = await t.post("/api", { title: "<script>alert('boo')</script>Sneaky", location: "<b>Online</b>", text: "hi" }); return r.status === 201 && !/[<>]/.test(r.json.title + r.json.location) && r.json.location === "Online"; } },
        { msg: "Invalid JSON gets a 400 with an error, and the server keeps running", fn: async (t) => { const r = await t.request("POST", "/api", { body: "{ not json", headers: { "content-type": "application/json" } }); const after = await t.get("/api"); return r.status === 400 && r.json && typeof r.json.error === "string" && after.status === 200; } },
      ] },
      { t: "h", h: "Add an event emitter" },
      { t: "p", h: "Much of Node is built on <b>events</b>: a server emits <code>\"request\"</code>, a stream emits <code>\"data\"</code> and <code>\"end\"</code>. You can use the same pattern in your own code with <code>EventEmitter</code>. It decouples things: the POST handler just announces \"a sighting was added\", and any number of listeners can react without the handler knowing about them." },
      { t: "code", lang: "javascript", code: `import { EventEmitter } from "node:events"

export const sightingEvents = new EventEmitter()
sightingEvents.on("sighting-added", createAlert)        // subscribe

// in handlePost, after saving:
sightingEvents.emit("sighting-added", newSighting)      // publish` },
      { t: "h", h: "Aside: Server-Sent Events" },
      { t: "p", h: "Normally the client asks and the server answers once. For live updates, the client could ask every few seconds (<b>polling</b>), but most of those requests return nothing new. With <b>Server-Sent Events</b>, the client opens one long-lived request and the server keeps <i>writing</i> to it whenever it has news. Use <code>text/event-stream</code>, and never call <code>res.end()</code>." },
      { t: "gif", name: "sse-stream" },
      { t: "code", lang: "javascript", code: `// server
res.writeHead(200, {
  "Content-Type": "text/event-stream",
  "Cache-Control": "no-cache",
  "Connection": "keep-alive",
})
const id = setInterval(() => {
  res.write(\`data: \${JSON.stringify({ story: randomStory() })}\\n\\n\`)   // "data: …" + a blank line = one event
}, 3000)
req.on("close", () => clearInterval(id))   // stop when the browser disconnects

// browser
const eventSource = new EventSource("/api/news")
eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data)
  document.getElementById("news").textContent = data.story
}` },
      { t: "callout", kind: "tip", h: "SSE only sends data from server to client, over plain HTTP, and the browser reconnects automatically. For two-way messaging (chat, multiplayer games), use <b>WebSockets</b> instead." },
      { t: "quiz", q: "Why must an SSE handler clear its interval when the request closes?", opts: ["Browsers require it", "Otherwise the server keeps writing to a dead connection forever, leaking memory and CPU for every visitor who ever left", "To send the last event"], a: 1, why: "Each open stream has its own timer. Without cleanup, they pile up: the same reason you return a cleanup function from <code>useEffect</code>." },
      { t: "h", h: "The finished app" },
      { t: "nplay", browser: true, task: "Upload a sighting in the Browser tab and watch the terminal: the event emitter logs an alert. The news ticker is a live SSE stream. Try <code>GET /api/news</code> in the API client too.", requests: [{ method: "GET", url: "/api" }, { method: "GET", url: "/api/news" }, { method: "POST", url: "/api", body: { title: "Shadow in the attic", location: "York, England", text: "It waved." } }], files: SPOOKY_FILES },
      { t: "nch", prompt: "Add the live news stream: <code>GET /api/news</code> responds with <code>Content-Type: text/event-stream</code> and writes a <code>data: {...}</code> event, holding JSON with a <code>story</code> from <code>data/stories.js</code>, every second. Stop the timer when the client disconnects.", requests: [{ method: "GET", url: "/api/news" }], files: {
        "handlers/newsHandler.js": `import { stories } from "../data/stories.js"

export function handleNews(req, res) {
  // set the SSE headers, then send a random story every second
}
`,
        "server.js": `import http from "node:http"
import { handleNews } from "./handlers/newsHandler.js"

const PORT = 8000

const server = http.createServer((req, res) => {
  if (req.url === "/api/news") return handleNews(req, res)
  res.statusCode = 404
  res.end("Not found")
})

server.listen(PORT, () => console.log("Connected on port: " + PORT))
`,
        "data/stories.js": STORIES,
        "package.json": PKG("spooky-sightings"),
      }, solution: {
        "handlers/newsHandler.js": `import { stories } from "../data/stories.js"

export function handleNews(req, res) {
  res.statusCode = 200
  res.setHeader("Content-Type", "text/event-stream")
  res.setHeader("Cache-Control", "no-cache")
  res.setHeader("Connection", "keep-alive")

  const intervalId = setInterval(() => {
    const story = stories[Math.floor(Math.random() * stories.length)]
    res.write("data: " + JSON.stringify({ event: "news-update", story }) + "\\n\\n")
  }, 1000)

  req.on("close", () => clearInterval(intervalId))
}
`,
      }, tests: [
        { msg: "Responds with Content-Type: text/event-stream", fn: async (t) => { const s = await t.stream("/api/news", 1300); return s.status === 200 && /text\/event-stream/.test(t.header(s, "content-type")); } },
        { msg: "Sends a new event about every second", fn: async (t) => { const s = await t.stream("/api/news", 2600); return s.events.length >= 2 && s.events.length <= 4; } },
        { msg: "Each event is JSON with a story from stories.js", fn: async (t) => { const s = await t.stream("/api/news", 1400); const known = ["library", "cat", "choir", "cold spot", "Mirror", "Night guard", "radio"]; return s.events.length >= 1 && s.events.every((e) => { try { const d = JSON.parse(e); return typeof d.story === "string" && known.some((k) => d.story.includes(k)); } catch (x) { return false; } }); } },
        { msg: "Events use the SSE format: data: …, then a blank line", fn: async (t) => { const s = await t.stream("/api/news", 1300); return /^data: .+\n\n/.test(s.body); } },
        { msg: "Clears the timer when the client disconnects", fn: async (t) => /req\.on\(\s*["']close["']/.test(t.src("handlers/newsHandler.js")) && /clearInterval/.test(t.src("handlers/newsHandler.js")) },
      ] },
      { t: "recap", items: ["<code>res.writeHead(status, headers)</code> in one call", "<code>path.join</code> + <code>import.meta.dirname</code> for safe paths; block paths that escape <code>public/</code>", "<code>fs/promises</code> to read and write files; ENOENT means 404", "Content-Type from the file extension", "Request bodies are streams: collect with <code>for await</code>", "Sanitise input, escape output (XSS)", "EventEmitter decouples \"something happened\" from \"what to do about it\"", "SSE: <code>text/event-stream</code>, <code>res.write(\"data: …\\n\\n\")</code>, clean up on close"] },
    ]},

    /* ───────────────────────── GoldDigger ───────────────────────── */
    { id: "node-gold", title: "Solo Project - GoldDigger", min: 90, kind: "project", body: [
      { t: "p", h: "<b>GoldDigger</b> sells gold online at a live price. The frontend is done; you build the Node server. Everything you need is in the last two lessons: serving static files, a JSON API, parsing a POST body, writing to a file, and Server-Sent Events." },
      { t: "h", h: "The spec" },
      { t: "steps", items: [
        "Serve <code>public/</code>: <code>/</code> is <code>index.html</code>, plus <code>index.css</code> and <code>index.js</code> with the right Content-Types",
        "<code>GET /api/live-price</code> is an SSE stream: every second, send <code>data: {\"price\": 2412.37}</code> with the current price (simulate it: start around 2400 and drift a little each second)",
        "<code>POST /api/invest</code> with <code>{ \"amount\": 1000 }</code> responds <b>201</b> with <code>{ amount, price, ounces }</code>, where <code>ounces = amount / price</code>",
        "Each purchase is appended as one line to <code>purchases.txt</code>, with the time, amount, price and ounces",
        "Invalid JSON, or an amount that isn't a positive number, gets a <b>400</b> with an <code>error</code> message",
        "Any other <code>/api</code> route gets a JSON 404",
      ] },
      { t: "callout", kind: "tip", h: "Keep one <code>price</code> variable at the top of <code>server.js</code> and update it with <code>setInterval</code>. The stream reads it, and so does the invest route, so buyers pay the price they see." },
      { t: "nch", browser: true, prompt: "Build the GoldDigger server in <code>server.js</code> to the spec above. Use <b>Run server</b> and the Browser tab to try it as you go.", requests: [{ method: "GET", url: "/api/live-price" }, { method: "POST", url: "/api/invest", body: { amount: 1000 } }, { method: "POST", url: "/api/invest", body: { amount: -5 } }, { method: "GET", url: "/api/nope" }], files: {
        "server.js": `import http from "node:http"
import path from "node:path"
import fs from "node:fs/promises"

const PORT = 8000
const __dirname = import.meta.dirname

const server = http.createServer(async (req, res) => {
  // Your routes here
  res.end("GoldDigger is coming soon")
})

server.listen(PORT, () => console.log("GoldDigger running on port " + PORT))
`,
        "public/index.html": GOLD_HTML,
        "public/index.css": GOLD_CSS,
        "public/index.js": GOLD_JS,
        "package.json": PKG("gold-digger"),
      }, solution: { "server.js": GOLD_SOLUTION }, tests: [
        { msg: "Serves index.html, index.css and index.js with the right Content-Types", fn: async (t) => { const a = await t.get("/"), b = await t.get("/index.css"), c = await t.get("/index.js"); return a.status === 200 && /text\/html/.test(t.header(a, "content-type")) && a.body.includes("GoldDigger") && /text\/css/.test(t.header(b, "content-type")) && /javascript/.test(t.header(c, "content-type")); } },
        { msg: "GET /api/live-price streams a price event every second", fn: async (t) => { const s = await t.stream("/api/live-price", 2300); if (!/text\/event-stream/.test(t.header(s, "content-type")) || s.events.length < 2) return false; return s.events.every((e) => { try { const p = JSON.parse(e).price; return typeof p === "number" && p > 0; } catch (x) { return false; } }); } },
        { msg: "POST /api/invest responds 201 with { amount, price, ounces = amount / price }", fn: async (t) => { const r = await t.post("/api/invest", { amount: 1000 }); return r.status === 201 && r.json && r.json.amount === 1000 && r.json.price > 0 && Math.abs(r.json.ounces - 1000 / r.json.price) < 0.001; } },
        { msg: "Each purchase is appended to purchases.txt", fn: async (t) => { await t.post("/api/invest", { amount: 250 }); await t.post("/api/invest", { amount: 750 }); await t.wait(60); const f = t.file("purchases.txt") || ""; const lines = f.trim().split("\n").filter(Boolean); return lines.length === 2 && lines[0].includes("250") && lines[1].includes("750"); } },
        { msg: "Bad input gets a 400 with an error message", fn: async (t) => { const a = await t.post("/api/invest", { amount: -5 }); const b = await t.post("/api/invest", { amount: "lots" }); const c = await t.request("POST", "/api/invest", { body: "{oops", headers: { "content-type": "application/json" } }); return [a, b, c].every((r) => r.status === 400 && r.json && typeof r.json.error === "string"); } },
        { msg: "Unknown /api routes get a JSON 404", fn: async (t) => { const r = await t.get("/api/silver"); return r.status === 404 && r.json !== undefined; } },
      ] },
      { t: "h", h: "Stretch goals" },
      { t: "steps", items: ["Send a <code>Content-Disposition</code> header from a <code>GET /api/receipt</code> route so the browser downloads the latest purchase", "Validate a maximum purchase and return 422 for amounts that are too large", "Stream the price changes as <code>event: price</code> and add a second <code>event: alert</code> when the price moves more than 1%"] },
      { t: "recap", items: ["Static files + JSON API + SSE in one Node server", "Shared server state (the price) read by several routes", "Append-only log files with <code>fs.appendFile</code>", "Validate input and answer with the right status codes"] },
    ]},
  ],
};
