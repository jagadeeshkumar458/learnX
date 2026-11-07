/* Project files for the Node.js module labs. Learner-facing code uses ES modules, as in modern Node. */

export const PKG = (name, extra = "") => `{
  "name": "${name}",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "node server.js",
    "dev": "node --watch server.js"
  }${extra}
}
`;

/* ───────────── Wild Horizons (Build a Node API) ───────────── */

export const DESTINATIONS = `export const destinations = [
  {
    name: "Machu Picchu", location: "Cusco Region", country: "Peru", continent: "South America",
    is_open_to_public: true, uuid: "3d6a1f9e-5f1d-4c3a-9a64-0b1b7c0e2a11",
    details: [
      { fun_fact: "Built by the Inca in the 15th century, high in the Andes." },
      { fun_fact: "It became a UNESCO World Heritage Site in 1983." },
    ],
  },
  {
    name: "Galápagos Islands", location: "Galápagos Province", country: "Ecuador", continent: "South America",
    is_open_to_public: true, uuid: "8b2c7c44-2f0a-4b6c-8f5e-1f6a9d3b7c22",
    details: [{ fun_fact: "Charles Darwin's visit in 1835 helped shape his theory of evolution." }],
  },
  {
    name: "Great Barrier Reef", location: "Queensland", country: "Australia", continent: "Oceania",
    is_open_to_public: true, uuid: "f1e2d3c4-b5a6-4789-9abc-def012345633",
    details: [{ fun_fact: "The world's largest coral reef system stretches over 2,300 km." }],
  },
  {
    name: "Uluru", location: "Northern Territory", country: "Australia", continent: "Oceania",
    is_open_to_public: true, uuid: "0a9b8c7d-6e5f-4a3b-8c2d-1e0f9a8b7c44",
    details: [{ fun_fact: "Climbing Uluru has been banned since 2019 out of respect for the Anangu people." }],
  },
  {
    name: "Banff National Park", location: "Alberta", country: "Canada", continent: "North America",
    is_open_to_public: true, uuid: "5c4b3a29-1807-4f6e-9d5c-4b3a29180755",
    details: [{ fun_fact: "Established in 1885, it's Canada's oldest national park." }],
  },
  {
    name: "Yellowstone National Park", location: "Wyoming", country: "USA", continent: "North America",
    is_open_to_public: true, uuid: "9e8d7c6b-5a49-4382-a716-05f4e3d2c166",
    details: [{ fun_fact: "Founded in 1872, it's widely considered the world's first national park." }],
  },
  {
    name: "Serengeti National Park", location: "Mara and Simiyu Regions", country: "Tanzania", continent: "Africa",
    is_open_to_public: true, uuid: "2b3c4d5e-6f70-4812-9a3b-4c5d6e7f8077",
    details: [{ fun_fact: "Home to the great migration of over a million wildebeest." }],
  },
  {
    name: "Plitvice Lakes National Park", location: "Lika-Senj County", country: "Croatia", continent: "Europe",
    is_open_to_public: true, uuid: "7f6e5d4c-3b2a-4190-8f7e-6d5c4b3a2988",
    details: [{ fun_fact: "Sixteen terraced lakes are joined by waterfalls." }],
  },
  {
    name: "Svalbard Global Seed Vault", location: "Spitsbergen", country: "Norway", continent: "Europe",
    is_open_to_public: false, uuid: "c0d1e2f3-a4b5-4c6d-8e7f-90a1b2c3d499",
    details: [{ fun_fact: "It safeguards more than a million seed samples from around the world." }],
  },
  {
    name: "Ha Long Bay", location: "Quảng Ninh Province", country: "Vietnam", continent: "Asia",
    is_open_to_public: true, uuid: "4e5f6a7b-8c9d-4e0f-a1b2-c3d4e5f6a7aa",
    details: [{ fun_fact: "Around 1,600 limestone islands and islets rise from the water." }],
  },
  {
    name: "Zhangjiajie National Forest Park", location: "Hunan", country: "China", continent: "Asia",
    is_open_to_public: true, uuid: "d4c3b2a1-f0e9-4d8c-b7a6-958473625fbb",
    details: [{ fun_fact: "Its sandstone pillars are often linked to the floating mountains in Avatar." }],
  },
  {
    name: "Vostok Station", location: "Princess Elizabeth Land", country: "Antarctica", continent: "Antarctica",
    is_open_to_public: false, uuid: "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4ccc",
    details: [{ fun_fact: "A research station that recorded about −89.2 °C in 1983, the lowest natural temperature measured on Earth's surface." }],
  },
]
`;

export const DB = `import { destinations } from "../data/data.js"

// Pretend this is a real database query: it's async, like one.
export async function getDataFromDB() {
  return destinations
}
`;

export const SEND_JSON = `export function sendJSONResponse(res, statusCode, payload) {
  res.setHeader("Content-Type", "application/json")
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Methods", "GET")
  res.statusCode = statusCode
  res.end(JSON.stringify(payload))
}
`;

export const BY_PATH = `export function getDataByPathParams(data, locationType, locationName) {
  return data.filter(destination => {
    return destination[locationType].toLowerCase() === locationName.toLowerCase()
  })
}
`;

export const BY_QUERY = `export function getDataByQueryParams(data, queryObj) {
  const { continent, country, is_open_to_public } = queryObj

  if (continent) {
    data = data.filter(d => d.continent.toLowerCase() === continent.toLowerCase())
  }
  if (country) {
    data = data.filter(d => d.country.toLowerCase() === country.toLowerCase())
  }
  if (is_open_to_public) {
    data = data.filter(d => d.is_open_to_public === JSON.parse(is_open_to_public.toLowerCase()))
  }
  return data
}
`;

export const WILD_SERVER = `import http from "node:http"
import { getDataFromDB } from "./database/db.js"
import { sendJSONResponse } from "./utils/sendJSONResponse.js"
import { getDataByPathParams } from "./utils/getDataByPathParams.js"
import { getDataByQueryParams } from "./utils/getDataByQueryParams.js"

const PORT = 8000

const server = http.createServer(async (req, res) => {
  const destinations = await getDataFromDB()

  const urlObj = new URL(req.url, \`http://\${req.headers.host}\`)
  const queryObj = Object.fromEntries(urlObj.searchParams)

  if (urlObj.pathname === "/api" && req.method === "GET") {
    const filteredData = getDataByQueryParams(destinations, queryObj)
    sendJSONResponse(res, 200, filteredData)

  } else if (urlObj.pathname.startsWith("/api/continent/") && req.method === "GET") {
    const continent = decodeURIComponent(urlObj.pathname.split("/").pop())
    const filteredData = getDataByPathParams(destinations, "continent", continent)
    sendJSONResponse(res, 200, filteredData)

  } else if (urlObj.pathname.startsWith("/api/country/") && req.method === "GET") {
    const country = decodeURIComponent(urlObj.pathname.split("/").pop())
    const filteredData = getDataByPathParams(destinations, "country", country)
    sendJSONResponse(res, 200, filteredData)

  } else {
    sendJSONResponse(res, 404, {
      error: "not found",
      message: "The requested route does not exist",
    })
  }
})

server.listen(PORT, () => console.log(\`Server running on port: \${PORT}\`))
`;

/* ───────────── Spooky Sightings (Build a Fullstack Node App) ───────────── */

export const SIGHTINGS_JSON = `[
  {
    "uuid": "4b7e9a10-3c2d-4f1e-9a8b-1c2d3e4f5a01",
    "location": "Whitby, England",
    "timeStamp": "2026-10-01T22:14:00.000Z",
    "title": "Lantern on the abbey steps",
    "text": "A pale light moved up all 199 steps, then vanished at the top. No one was carrying it."
  },
  {
    "uuid": "8e1f2a3b-4c5d-4e6f-8a9b-0c1d2e3f4a02",
    "location": "Edinburgh, Scotland",
    "timeStamp": "2026-10-12T01:40:00.000Z",
    "title": "Footsteps in the vaults",
    "text": "Heavy boots behind our tour group. We turned around: nothing but cold air."
  },
  {
    "uuid": "c9d8e7f6-a5b4-4c3d-9e2f-1a0b9c8d7e03",
    "location": "Savannah, USA",
    "timeStamp": "2026-10-20T03:05:00.000Z",
    "title": "The piano that plays itself",
    "text": "Three notes, every night at 3am, from a house that has been empty for years."
  }
]
`;

export const STORIES = `export const stories = [
  "Ghostly figure seen in the library returning a book from 1897",
  "Local cat refuses to enter the old lighthouse, again",
  "Phantom choir heard singing in an empty church",
  "Unexplained cold spot follows tourists around the castle",
  "Mirror in the antique shop shows the wrong reflection",
  "Night guard reports doors opening on their own at the museum",
  "Old radio picks up a broadcast from 1952",
]
`;

export const GET_CONTENT_TYPE = `export function getContentType(ext) {
  const types = {
    ".js": "text/javascript",
    ".css": "text/css",
    ".json": "application/json",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
  }
  return types[ext.toLowerCase()] || "text/html"
}
`;

export const SEND_RESPONSE = `export function sendResponse(res, statusCode, contentType, payload) {
  res.statusCode = statusCode
  res.setHeader("Content-Type", contentType)
  res.end(payload)
}
`;

export const SERVE_STATIC = `import path from "node:path"
import fs from "node:fs/promises"
import { sendResponse } from "./sendResponse.js"
import { getContentType } from "./getContentType.js"

export async function serveStatic(req, res, baseDir) {
  const publicDir = path.join(baseDir, "public")
  const filePath = path.join(publicDir, req.url === "/" ? "index.html" : req.url)

  // Never serve files outside public/, e.g. GET /../server.js
  if (!filePath.startsWith(publicDir)) {
    return sendResponse(res, 403, "text/plain", "Forbidden")
  }

  const ext = path.extname(filePath)
  const contentType = getContentType(ext)

  try {
    const content = await fs.readFile(filePath)
    sendResponse(res, 200, contentType, content)
  } catch (err) {
    if (err.code === "ENOENT") {
      const content = await fs.readFile(path.join(publicDir, "404.html"))
      sendResponse(res, 404, "text/html", content)
    } else {
      sendResponse(res, 500, "text/html", "<html><h1>Server Error: " + err.code + "</h1></html>")
    }
  }
}
`;

export const GET_DATA = `import path from "node:path"
import fs from "node:fs/promises"

export async function getData() {
  try {
    const pathJSON = path.join("data", "data.json")
    const data = await fs.readFile(pathJSON, "utf8")
    return JSON.parse(data)
  } catch (err) {
    console.log(err)
    return []
  }
}
`;

export const PARSE_BODY = `export async function parseJSONBody(req) {
  let body = ""
  for await (const chunk of req) {
    body += chunk
  }
  try {
    return JSON.parse(body)
  } catch (err) {
    throw new Error("Invalid JSON format: " + err.message)
  }
}
`;

export const ADD_SIGHTING = `import path from "node:path"
import fs from "node:fs/promises"
import { getData } from "./getData.js"

export async function addNewSighting(newSighting) {
  try {
    const sightings = await getData()
    sightings.push(newSighting)
    const pathJSON = path.join("data", "data.json")
    await fs.writeFile(pathJSON, JSON.stringify(sightings, null, 2), "utf8")
  } catch (err) {
    throw new Error(err)
  }
}
`;

export const SANITIZE = `// Real projects use a library such as sanitize-html. This strips every HTML tag,
// which is enough to stop <script> tags being stored and shown to other users.
export function sanitizeInput(data) {
  const sanitizedData = {}
  for (const [key, val] of Object.entries(data)) {
    sanitizedData[key] = typeof val === "string" ? val.replace(/<[^>]*>/g, "").trim() : val
  }
  return sanitizedData
}
`;

export const SIGHTING_EVENTS = `import { EventEmitter } from "node:events"
import { createAlert } from "../utils/createAlert.js"

export const sightingEvents = new EventEmitter()

sightingEvents.on("sighting-added", createAlert)
`;

export const CREATE_ALERT = `export function createAlert(sighting) {
  console.log("👻 ALERT: new sighting in " + sighting.location + ": " + sighting.title)
}
`;

export const ROUTE_HANDLERS = `import crypto from "node:crypto"
import { getData } from "../utils/getData.js"
import { sendResponse } from "../utils/sendResponse.js"
import { parseJSONBody } from "../utils/parseJSONBody.js"
import { addNewSighting } from "../utils/addNewSighting.js"
import { sanitizeInput } from "../utils/sanitizeInput.js"
import { sightingEvents } from "../events/sightingEvents.js"
import { stories } from "../data/stories.js"

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
    sightingEvents.emit("sighting-added", newSighting)
    sendResponse(res, 201, "application/json", JSON.stringify(newSighting))
  } catch (err) {
    sendResponse(res, 400, "application/json", JSON.stringify({ error: err.message }))
  }
}

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
`;

export const SPOOKY_SERVER = `import http from "node:http"
import { serveStatic } from "./utils/serveStatic.js"
import { handleGet, handlePost, handleNews } from "./handlers/routeHandlers.js"

const PORT = 8000
const __dirname = import.meta.dirname

const server = http.createServer(async (req, res) => {
  if (req.url === "/api") {
    if (req.method === "GET") return await handleGet(res)
    if (req.method === "POST") return await handlePost(req, res)
  } else if (req.url === "/api/news") {
    return handleNews(req, res)
  } else if (!req.url.startsWith("/api")) {
    return await serveStatic(req, res, __dirname)
  }
  res.statusCode = 404
  res.setHeader("Content-Type", "application/json")
  res.end(JSON.stringify({ error: "not found" }))
})

server.listen(PORT, () => console.log("Connected on port: " + PORT))
`;

export const SPOOKY_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Spooky Sightings</title>
  <link rel="stylesheet" href="index.css">
</head>
<body>
  <header>
    <h1>👻 Spooky Sightings</h1>
    <p class="ticker" aria-live="polite"><span>LIVE</span> <span id="news">Waiting for news…</span></p>
  </header>
  <main>
    <form id="sighting-form">
      <h2>Upload a sighting</h2>
      <label>Title <input name="title" required maxlength="80" placeholder="Shadow in the attic"></label>
      <label>Location <input name="location" required placeholder="Whitby, England"></label>
      <label>What did you see? <textarea name="text" required rows="3"></textarea></label>
      <button>Upload sighting</button>
    </form>
    <section>
      <h2>Latest sightings</h2>
      <ul id="sightings"></ul>
    </section>
  </main>
  <script src="index.js"></script>
</body>
</html>
`;

export const SPOOKY_CSS = `* { box-sizing: border-box; }
body { margin: 0; font-family: Georgia, serif; background: #13111c; color: #e9e4f5; }
header { padding: 18px 22px 12px; background: linear-gradient(#241d3a, #13111c); }
h1 { margin: 0 0 8px; font-size: 1.5rem; color: #c7b8ff; }
.ticker { margin: 0; font: 13px system-ui, sans-serif; color: #bfb4dd; }
.ticker span:first-child { background: #e0466b; color: #fff; border-radius: 4px; padding: 1px 6px; font-weight: 700; margin-right: 6px; }
main { display: grid; gap: 18px; padding: 18px 22px; }
form { display: grid; gap: 8px; background: #1e1a2e; padding: 14px; border-radius: 10px; }
h2 { margin: 0 0 6px; font-size: 1.05rem; color: #c7b8ff; }
label { display: grid; gap: 4px; font: 13px system-ui, sans-serif; color: #bfb4dd; }
input, textarea { font: 14px system-ui, sans-serif; padding: 7px 9px; border-radius: 6px; border: 1px solid #3c3358; background: #13111c; color: #fff; }
button { justify-self: start; border: 0; border-radius: 6px; padding: 8px 14px; background: #8c6cff; color: #fff; font: 600 14px system-ui, sans-serif; cursor: pointer; }
ul { list-style: none; margin: 0; padding: 0; display: grid; gap: 10px; }
li { background: #1e1a2e; border-left: 3px solid #8c6cff; border-radius: 8px; padding: 10px 12px; }
li h3 { margin: 0 0 2px; font-size: 1rem; }
li small { color: #9a8fbf; font-family: system-ui, sans-serif; }
li p { margin: 6px 0 0; font-size: .92rem; line-height: 1.45; }
`;

export const SPOOKY_JS = `const list = document.getElementById("sightings")
const form = document.getElementById("sighting-form")

async function loadSightings() {
  const res = await fetch("/api")
  const sightings = await res.json()
  list.innerHTML = ""
  sightings.slice().reverse().forEach(s => {
    const li = document.createElement("li")
    const h3 = document.createElement("h3")
    const small = document.createElement("small")
    const p = document.createElement("p")
    h3.textContent = s.title
    small.textContent = s.location + " · " + new Date(s.timeStamp).toLocaleDateString()
    p.textContent = s.text
    li.append(h3, small, p)
    list.append(li)
  })
}

form.addEventListener("submit", async (e) => {
  e.preventDefault()
  const data = Object.fromEntries(new FormData(form))
  const res = await fetch("/api", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (res.ok) {
    form.reset()
    loadSightings()
  } else {
    console.error("Upload failed", res.status)
  }
})

const eventSource = new EventSource("/api/news")
eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data)
  document.getElementById("news").textContent = data.story
}
eventSource.onerror = () => console.log("Connection to the news stream lost")

loadSightings()
`;

export const SPOOKY_404 = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>Not found</title>
<style>body{font-family:Georgia,serif;background:#13111c;color:#e9e4f5;display:grid;place-items:center;height:100vh;margin:0;text-align:center}</style></head>
<body><div><h1>404 👻</h1><p>This page has vanished into thin air.</p><a href="/" style="color:#c7b8ff">Go home</a></div></body>
</html>
`;

/* ───────────── GoldDigger (solo project) ───────────── */

export const GOLD_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>GoldDigger</title>
  <link rel="stylesheet" href="index.css">
</head>
<body>
  <main>
    <h1>GoldDigger 🪙</h1>
    <section class="price-panel" aria-live="polite">
      <p>Live price per troy ounce <span class="badge" id="connection-status">connecting…</span></p>
      <p class="price">$<span id="price-display">----.--</span></p>
    </section>
    <form id="invest-form">
      <label for="investment-amount">Amount to invest ($)</label>
      <div class="row">
        <input type="number" id="investment-amount" name="amount" min="1" step="0.01" placeholder="1000" required>
        <button>Invest now!</button>
      </div>
    </form>
    <dialog id="outputs">
      <h2>Summary</h2>
      <p id="investment-summary"></p>
      <button id="close-dialog">OK</button>
    </dialog>
  </main>
  <script src="index.js"></script>
</body>
</html>
`;

export const GOLD_CSS = `* { box-sizing: border-box; }
body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: radial-gradient(circle at top, #3b2f12, #121008); color: #fbe7a1; font-family: system-ui, sans-serif; }
main { width: min(420px, 92vw); text-align: center; }
h1 { font-size: 2.2rem; margin: 0 0 18px; color: #f5c84c; }
.price-panel { background: #1d1809; border: 1px solid #5a4614; border-radius: 14px; padding: 16px; }
.price-panel p { margin: 0; }
.price { font-size: 2.6rem; font-weight: 800; color: #ffd75e; margin-top: 6px !important; font-variant-numeric: tabular-nums; }
.badge { font-size: .7rem; background: #5a4614; border-radius: 99px; padding: 2px 8px; margin-left: 6px; }
form { margin-top: 18px; text-align: left; }
label { font-size: .85rem; }
.row { display: flex; gap: 8px; margin-top: 6px; }
input { flex: 1; font: inherit; padding: 10px; border-radius: 8px; border: 1px solid #5a4614; background: #1d1809; color: #fff; }
button { font: inherit; font-weight: 700; border: 0; border-radius: 8px; padding: 10px 16px; background: #f5c84c; color: #2a2005; cursor: pointer; }
dialog { border: 0; border-radius: 14px; background: #fbe7a1; color: #2a2005; padding: 20px; max-width: 320px; }
`;

export const GOLD_JS = `const priceDisplay = document.getElementById("price-display")
const status = document.getElementById("connection-status")
const form = document.getElementById("invest-form")
const dialog = document.getElementById("outputs")
const summary = document.getElementById("investment-summary")

const eventSource = new EventSource("/api/live-price")
eventSource.onopen = () => { status.textContent = "Live 🟢" }
eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data)
  priceDisplay.textContent = data.price.toFixed(2)
}
eventSource.onerror = () => { status.textContent = "Disconnected 🔴" }

form.addEventListener("submit", async (e) => {
  e.preventDefault()
  const amount = Number(document.getElementById("investment-amount").value)
  const res = await fetch("/api/invest", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount }),
  })
  const data = await res.json()
  summary.textContent = res.ok
    ? "You just bought " + data.ounces.toFixed(4) + " ounces (ozt) for $" + data.amount.toFixed(2) + ". \\nYou will receive documentation shortly."
    : "Sorry: " + data.error
  dialog.showModal()
  form.reset()
})

document.getElementById("close-dialog").addEventListener("click", () => dialog.close())
`;
