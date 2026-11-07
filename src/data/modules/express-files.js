/* Project files for the Express.js module labs. All data is fictional. */

export const PKG = (name, deps) => `{
  "name": "${name}",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "node server.js",
    "dev": "node --watch server.js"
  },
  "dependencies": {
${Object.entries(deps).map(([k, v]) => `    "${k}": "${v}"`).join(",\n")}
  }
}
`;

/* ───────────── Startup Planet (Build an Express API) ───────────── */

export const STARTUPS = `export const startups = [
  { id: 1, name: "GreenGrid", industry: "Renewable Energy", country: "Germany", continent: "Europe", is_seeking_funding: true, has_mvp: true },
  { id: 2, name: "MediMind", industry: "AI", country: "India", continent: "Asia", is_seeking_funding: true, has_mvp: false },
  { id: 3, name: "FarmLoop", industry: "AgriTech", country: "Kenya", continent: "Africa", is_seeking_funding: false, has_mvp: true },
  { id: 4, name: "PayNest", industry: "FinTech", country: "Brazil", continent: "South America", is_seeking_funding: true, has_mvp: true },
  { id: 5, name: "CodeCrate", industry: "Developer Tools", country: "USA", continent: "North America", is_seeking_funding: false, has_mvp: true },
  { id: 6, name: "OceanLens", industry: "AI", country: "Australia", continent: "Oceania", is_seeking_funding: true, has_mvp: true },
  { id: 7, name: "SolarSip", industry: "Renewable Energy", country: "India", continent: "Asia", is_seeking_funding: false, has_mvp: false },
  { id: 8, name: "LearnLeap", industry: "EdTech", country: "Nigeria", continent: "Africa", is_seeking_funding: true, has_mvp: true },
  { id: 9, name: "ByteBank", industry: "FinTech", country: "Germany", continent: "Europe", is_seeking_funding: false, has_mvp: true },
  { id: 10, name: "ShipShape", industry: "Logistics", country: "Canada", continent: "North America", is_seeking_funding: true, has_mvp: false },
]
`;

export const SP_PKG = PKG("startup-planet", { express: "^5.1.0" });

export const SP_GET_ALL = `import { startups } from "../data/data.js"

export function getAllData(req, res) {
  let filteredData = startups
  const { industry, country, continent, is_seeking_funding, has_mvp } = req.query

  if (industry) {
    filteredData = filteredData.filter(s => s.industry.toLowerCase() === industry.toLowerCase())
  }
  if (country) {
    filteredData = filteredData.filter(s => s.country.toLowerCase() === country.toLowerCase())
  }
  if (continent) {
    filteredData = filteredData.filter(s => s.continent.toLowerCase() === continent.toLowerCase())
  }
  if (is_seeking_funding) {
    filteredData = filteredData.filter(s => s.is_seeking_funding === JSON.parse(is_seeking_funding.toLowerCase()))
  }
  if (has_mvp) {
    filteredData = filteredData.filter(s => s.has_mvp === JSON.parse(has_mvp.toLowerCase()))
  }

  res.json(filteredData)
}
`;

export const SP_GET_PATH = `import { startups } from "../data/data.js"

export function getDataByPathParams(req, res) {
  const { field, term } = req.params
  const allowedFields = ["country", "continent", "industry"]

  if (!allowedFields.includes(field)) {
    return res.status(400).json({ message: "Search field not allowed. Please use only 'country', 'continent', 'industry'" })
  }

  const filteredData = startups.filter(s => s[field].toLowerCase() === term.toLowerCase())
  res.json(filteredData)
}
`;

export const SP_ROUTES = `import express from "express"
import { getAllData } from "../controllers/getAllData.js"
import { getDataByPathParams } from "../controllers/getDataByPathParams.js"

export const apiRouter = express.Router()

apiRouter.get("/", getAllData)
apiRouter.get("/:field/:term", getDataByPathParams)
`;

export const SP_SERVER = `import express from "express"
import { apiRouter } from "./routes/apiRoutes.js"

const PORT = 8000
const app = express()

app.use("/api", apiRouter)

app.use((req, res) => {
  res.status(404).json({ message: "Endpoint not found. Please check the API documentation." })
})

app.listen(PORT, () => console.log(\`server connected on port \${PORT}\`))
`;

/* ───────────── Vinyl Vault (fullstack app + auth) ───────────── */

export const VV_PKG = PKG("vinyl-vault", { bcryptjs: "^3.0.2", express: "^5.1.0", "express-session": "^1.18.1", sqlite: "^5.1.1", sqlite3: "^5.1.7", validator: "^13.15.0" });

export const VV_DB_SQL = `-- In this lab, database.db is kept as SQL so you can read it.
-- Real SQLite files are binary; you'd create them with a seed script.
CREATE TABLE products (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  price REAL NOT NULL,
  image TEXT,
  year INTEGER,
  genre TEXT,
  stock INTEGER DEFAULT 10
);
INSERT INTO products (title, artist, price, image, year, genre, stock) VALUES
  ('Midnight Neon', 'The Static Hearts', 32.99, '🌃', 2021, 'synthwave', 12),
  ('Desert Bloom', 'Amara Lake', 28.5, '🌵', 2019, 'folk', 6),
  ('Low Tide Sessions', 'Harbor Lights', 24.99, '🌊', 2022, 'jazz', 9),
  ('Signal Fire', 'Northbound', 30.0, '🔥', 2018, 'rock', 4),
  ('Cassette Summer', 'Pixel Kids', 26.99, '📼', 2023, 'synthwave', 15),
  ('Blue Hour', 'Mira Sol', 34.0, '🌆', 2020, 'jazz', 7),
  ('Gravel Roads', 'The Pinewoods', 22.0, '🛻', 2017, 'folk', 3),
  ('Overdrive', 'Velvet Engine', 29.99, '🏎️', 2024, 'rock', 11),
  ('Kitchen Radio', 'Sunday Club', 21.5, '📻', 2016, 'soul', 8),
  ('Orbit', 'Lumen Choir', 36.0, '🪐', 2025, 'ambient', 5);
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE cart_items (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  product_id INTEGER NOT NULL REFERENCES products(id),
  quantity INTEGER DEFAULT 1
);
`;

export const VV_DB = `import sqlite3 from "sqlite3"
import { open } from "sqlite"
import path from "node:path"

export async function getDBConnection() {
  const dbPath = path.join("database.db")
  return open({
    filename: dbPath,
    driver: sqlite3.Database,
  })
}
`;

export const VV_PRODUCTS_CTRL = `import { getDBConnection } from "../db/db.js"

export async function getGenres(req, res) {
  try {
    const db = await getDBConnection()
    const genreRows = await db.all("SELECT DISTINCT genre FROM products")
    const genres = genreRows.map(row => row.genre)
    res.json(genres)
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch genres", details: err.message })
  }
}

export async function getProducts(req, res) {
  try {
    const db = await getDBConnection()
    let query = "SELECT * FROM products"
    const params = []
    const { genre, search } = req.query

    if (genre) {
      query += " WHERE genre = ?"
      params.push(genre)
    } else if (search) {
      query += " WHERE title LIKE ? OR artist LIKE ? OR genre LIKE ?"
      const searchPattern = \`%\${search}%\`
      params.push(searchPattern, searchPattern, searchPattern)
    }

    const products = await db.all(query, params)
    res.json(products)
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch products", details: err.message })
  }
}
`;

export const VV_PRODUCTS_ROUTES = `import express from "express"
import { getGenres, getProducts } from "../controllers/productsControllers.js"

export const productsRouter = express.Router()

productsRouter.get("/genres", getGenres)
productsRouter.get("/", getProducts)
`;

export const VV_AUTH_CTRL = `import validator from "validator"
import bcrypt from "bcryptjs"
import { getDBConnection } from "../db/db.js"

export async function registerUser(req, res) {
  let { name, email, username, password } = req.body ?? {}

  if (!name || !email || !username || !password) {
    return res.status(400).json({ error: "All fields are required." })
  }
  name = name.trim()
  email = email.trim()
  username = username.trim()

  if (!/^[a-zA-Z0-9_-]{1,20}$/.test(username)) {
    return res.status(400).json({ error: "Username must be 1–20 characters, using letters, numbers, _ or -." })
  }
  if (!validator.isEmail(email)) {
    return res.status(400).json({ error: "Invalid email format" })
  }

  try {
    const db = await getDBConnection()
    const existing = await db.get("SELECT id FROM users WHERE email = ? OR username = ?", [email, username])
    if (existing) {
      return res.status(400).json({ error: "Email or username already in use." })
    }

    const hashed = await bcrypt.hash(password, 10)
    const result = await db.run(
      "INSERT INTO users (name, email, username, password) VALUES (?, ?, ?, ?)",
      [name, email, username, hashed]
    )

    req.session.userId = result.lastID
    res.status(201).json({ message: "User registered" })
  } catch (err) {
    console.error("Registration error:", err.message)
    res.status(500).json({ error: "Registration failed. Please try again." })
  }
}

export async function loginUser(req, res) {
  let { username, password } = req.body ?? {}
  if (!username || !password) {
    return res.status(400).json({ error: "All fields are required" })
  }
  username = username.trim()

  try {
    const db = await getDBConnection()
    const user = await db.get("SELECT * FROM users WHERE username = ?", [username])
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" })
    }
    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) {
      return res.status(401).json({ error: "Invalid credentials" })
    }
    req.session.userId = user.id
    res.json({ message: "Logged in" })
  } catch (err) {
    console.error("Login error:", err.message)
    res.status(500).json({ error: "Login failed. Please try again." })
  }
}

export async function logoutUser(req, res) {
  req.session.destroy(() => {
    res.json({ message: "Logged out" })
  })
}
`;

export const VV_ME_CTRL = `import { getDBConnection } from "../db/db.js"

export async function getCurrentUser(req, res) {
  try {
    if (!req.session.userId) {
      return res.json({ isLoggedIn: false })
    }
    const db = await getDBConnection()
    const user = await db.get("SELECT name FROM users WHERE id = ?", [req.session.userId])
    res.json({ isLoggedIn: true, name: user.name })
  } catch (err) {
    console.error("getCurrentUser error:", err)
    res.status(500).json({ error: "Internal server error" })
  }
}
`;

export const VV_AUTH_ROUTES = `import express from "express"
import { registerUser, loginUser, logoutUser } from "../controllers/authControllers.js"

export const authRouter = express.Router()

authRouter.post("/register", registerUser)
authRouter.post("/login", loginUser)
authRouter.get("/logout", logoutUser)
`;

export const VV_ME_ROUTES = `import express from "express"
import { getCurrentUser } from "../controllers/meController.js"

export const meRouter = express.Router()

meRouter.get("/", getCurrentUser)
`;

export const VV_REQUIRE_AUTH = `export function requireAuth(req, res, next) {
  if (!req.session.userId) {
    console.log("Access to protected route blocked")
    return res.status(401).json({ error: "Unauthorized. Please log in." })
  }
  next()
}
`;

export const VV_CART_CTRL = `import { getDBConnection } from "../db/db.js"

export async function addToCart(req, res) {
  const db = await getDBConnection()
  const productId = parseInt(req.body.productId, 10)
  if (isNaN(productId)) {
    return res.status(400).json({ error: "Invalid product ID" })
  }
  const userId = req.session.userId

  const existing = await db.get(
    "SELECT * FROM cart_items WHERE user_id = ? AND product_id = ?",
    [userId, productId]
  )
  if (existing) {
    await db.run("UPDATE cart_items SET quantity = quantity + 1 WHERE id = ?", [existing.id])
  } else {
    await db.run("INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, 1)", [userId, productId])
  }
  res.json({ message: "Added to cart" })
}

export async function getCartCount(req, res) {
  const db = await getDBConnection()
  const result = await db.get(
    "SELECT SUM(quantity) AS totalItems FROM cart_items WHERE user_id = ?",
    [req.session.userId]
  )
  res.json({ totalItems: result.totalItems || 0 })
}

export async function getAll(req, res) {
  const db = await getDBConnection()
  const items = await db.all(
    \`SELECT ci.id AS cartItemId, ci.quantity, p.title, p.artist, p.price
     FROM cart_items ci
     JOIN products p ON p.id = ci.product_id
     WHERE ci.user_id = ?\`,
    [req.session.userId]
  )
  res.json({ items })
}

export async function deleteItem(req, res) {
  const db = await getDBConnection()
  const itemId = parseInt(req.params.itemId, 10)
  if (isNaN(itemId)) {
    return res.status(400).json({ error: "Invalid item ID" })
  }
  const item = await db.get("SELECT quantity FROM cart_items WHERE id = ? AND user_id = ?", [itemId, req.session.userId])
  if (!item) {
    return res.status(400).json({ error: "Item not found" })
  }
  await db.run("DELETE FROM cart_items WHERE id = ? AND user_id = ?", [itemId, req.session.userId])
  res.status(204).send()
}

export async function deleteAll(req, res) {
  const db = await getDBConnection()
  await db.run("DELETE FROM cart_items WHERE user_id = ?", [req.session.userId])
  res.status(204).send()
}
`;

export const VV_CART_ROUTES = `import express from "express"
import { addToCart, getCartCount, getAll, deleteItem, deleteAll } from "../controllers/cartController.js"
import { requireAuth } from "../middleware/requireAuth.js"

export const cartRouter = express.Router()

cartRouter.post("/add", requireAuth, addToCart)
cartRouter.get("/cart-count", requireAuth, getCartCount)
cartRouter.get("/", requireAuth, getAll)
cartRouter.delete("/all", requireAuth, deleteAll)
cartRouter.delete("/:itemId", requireAuth, deleteItem)
`;

export const VV_SERVER_BASIC = `import express from "express"
import { productsRouter } from "./routes/products.js"

const app = express()
const PORT = 8000

app.use(express.static("public"))
app.use("/api/products", productsRouter)

app.use((req, res) => {
  res.status(404).json({ message: "Endpoint not found" })
})

app.listen(PORT, () => console.log(\`Server running at http://localhost:\${PORT}\`))
`;

export const VV_SERVER_FULL = `import express from "express"
import session from "express-session"
import { productsRouter } from "./routes/products.js"
import { authRouter } from "./routes/auth.js"
import { meRouter } from "./routes/me.js"
import { cartRouter } from "./routes/cart.js"

const app = express()
const PORT = 8000
const secret = process.env.SESSION_SECRET || "jellyfish-baskingshark"

app.use(express.json())
app.use(session({
  secret,
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, secure: false, sameSite: "lax" },
}))

app.use(express.static("public"))

app.use("/api/products", productsRouter)
app.use("/api/auth/me", meRouter)
app.use("/api/auth", authRouter)
app.use("/api/cart", cartRouter)

app.use((req, res) => {
  res.status(404).json({ message: "Endpoint not found" })
})

app.listen(PORT, () => console.log(\`Server running at http://localhost:\${PORT}\`))
`;

export const VV_CSS = `* { box-sizing: border-box; }
body { margin: 0; font-family: system-ui, sans-serif; background: #15120f; color: #f3ead8; }
header { display: flex; align-items: center; gap: 12px; padding: 14px 20px; background: #221c16; border-bottom: 1px solid #3a3027; flex-wrap: wrap; }
header h1 { margin: 0; font-size: 1.3rem; color: #f2b24d; flex: 1; }
header .greeting { font-size: .9rem; color: #c9bba3; }
button, .btn { font: inherit; font-size: .85rem; border: 0; border-radius: 6px; padding: 7px 12px; background: #f2b24d; color: #1b150e; font-weight: 700; cursor: pointer; }
button.ghost { background: transparent; color: #f2b24d; border: 1px solid #5a4a36; }
.controls { display: flex; gap: 10px; padding: 14px 20px; flex-wrap: wrap; }
select, input { font: inherit; font-size: .9rem; padding: 7px 10px; border-radius: 6px; border: 1px solid #5a4a36; background: #221c16; color: #f3ead8; }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 14px; padding: 0 20px 24px; }
.card { background: #221c16; border: 1px solid #3a3027; border-radius: 10px; padding: 12px; display: flex; flex-direction: column; gap: 4px; }
.card .art { font-size: 2.6rem; text-align: center; background: #2d251c; border-radius: 8px; padding: 10px 0; }
.card h3 { margin: 4px 0 0; font-size: .95rem; }
.card p { margin: 0; font-size: .8rem; color: #c9bba3; }
.card .price { color: #f2b24d; font-weight: 700; }
.panel { margin: 12px 20px; padding: 14px; background: #221c16; border: 1px solid #3a3027; border-radius: 10px; display: grid; gap: 8px; max-width: 360px; }
.panel h2 { margin: 0; font-size: 1rem; }
.msg { font-size: .85rem; color: #ff8f7a; min-height: 1em; }
.empty { padding: 0 20px; color: #c9bba3; }
`;

export const VV_HTML_BASIC = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Vinyl Vault</title>
  <link rel="stylesheet" href="index.css">
</head>
<body>
  <header><h1>💿 Vinyl Vault</h1></header>
  <div class="controls">
    <select id="genre-select" aria-label="Filter by genre"><option value="">All genres</option></select>
    <input id="search-input" type="search" placeholder="Search title, artist or genre" aria-label="Search">
  </div>
  <div class="grid" id="products-container"></div>
  <script src="index.js"></script>
</body>
</html>
`;

export const VV_JS_BASIC = `const container = document.getElementById("products-container")
const genreSelect = document.getElementById("genre-select")
const searchInput = document.getElementById("search-input")

async function populateGenreSelect() {
  const res = await fetch("/api/products/genres")
  const genres = await res.json()
  genres.forEach(genre => {
    const option = document.createElement("option")
    option.value = genre
    option.textContent = genre
    genreSelect.append(option)
  })
}

async function getProducts(filters = {}) {
  const params = new URLSearchParams(filters)
  const res = await fetch("/api/products?" + params)
  return res.json()
}

function renderProducts(products) {
  container.innerHTML = ""
  if (!products.length) {
    container.innerHTML = "<p class='empty'>No records found.</p>"
    return
  }
  products.forEach(p => {
    const card = document.createElement("article")
    card.className = "card"
    card.innerHTML = "<div class='art'></div><h3></h3><p class='artist'></p><p class='genre'></p><p class='price'></p>"
    card.querySelector(".art").textContent = p.image
    card.querySelector("h3").textContent = p.title
    card.querySelector(".artist").textContent = p.artist
    card.querySelector(".genre").textContent = p.genre + " · " + p.year
    card.querySelector(".price").textContent = "$" + p.price.toFixed(2)
    card.dataset.id = p.id
    container.append(card)
  })
}

genreSelect.addEventListener("change", async () => {
  searchInput.value = ""
  renderProducts(await getProducts(genreSelect.value ? { genre: genreSelect.value } : {}))
})

searchInput.addEventListener("input", async () => {
  genreSelect.value = ""
  renderProducts(await getProducts(searchInput.value ? { search: searchInput.value } : {}))
})

populateGenreSelect()
getProducts().then(renderProducts)
`;

export const VV_HTML_FULL = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Vinyl Vault</title>
  <link rel="stylesheet" href="index.css">
</head>
<body>
  <header>
    <h1>💿 Vinyl Vault</h1>
    <span class="greeting" id="greeting">Hello, guest</span>
    <button class="ghost" id="cart-btn" hidden>🛒 <span id="cart-count">0</span></button>
    <button class="ghost" id="logout-btn" hidden>Log out</button>
  </header>

  <section class="panel" id="auth-panel">
    <h2 id="auth-title">Log in</h2>
    <form id="auth-form">
      <div id="signup-fields" hidden>
        <input name="name" placeholder="Name" aria-label="Name">
        <input name="email" placeholder="Email" aria-label="Email">
      </div>
      <input name="username" placeholder="Username" aria-label="Username">
      <input name="password" type="password" placeholder="Password" aria-label="Password">
      <button>Continue</button>
    </form>
    <button class="ghost" id="toggle-auth">New here? Sign up</button>
    <p class="msg" id="auth-msg" role="alert"></p>
  </section>

  <section class="panel" id="cart-panel" hidden>
    <h2>Your cart</h2>
    <ul id="cart-items"></ul>
    <button class="ghost" id="clear-cart">Empty cart</button>
  </section>

  <div class="controls">
    <select id="genre-select" aria-label="Filter by genre"><option value="">All genres</option></select>
    <input id="search-input" type="search" placeholder="Search title, artist or genre" aria-label="Search">
  </div>
  <div class="grid" id="products-container"></div>
  <script src="index.js"></script>
</body>
</html>
`;

export const VV_JS_FULL = VV_JS_BASIC.replace(`    card.dataset.id = p.id
    container.append(card)`, `    card.dataset.id = p.id
    const add = document.createElement("button")
    add.textContent = "Add to cart"
    add.addEventListener("click", () => addToCart(p.id))
    card.append(add)
    container.append(card)`).replace("populateGenreSelect()\ngetProducts().then(renderProducts)\n", `/* ── auth ── */
let signingUp = false
const authForm = document.getElementById("auth-form")
const authMsg = document.getElementById("auth-msg")

document.getElementById("toggle-auth").addEventListener("click", () => {
  signingUp = !signingUp
  document.getElementById("signup-fields").hidden = !signingUp
  document.getElementById("auth-title").textContent = signingUp ? "Sign up" : "Log in"
  document.getElementById("toggle-auth").textContent = signingUp ? "Have an account? Log in" : "New here? Sign up"
})

authForm.addEventListener("submit", async (e) => {
  e.preventDefault()
  const data = Object.fromEntries(new FormData(authForm))
  const res = await fetch(signingUp ? "/api/auth/register" : "/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  const json = await res.json()
  if (!res.ok) { authMsg.textContent = json.error; return }
  authMsg.textContent = ""
  authForm.reset()
  checkAuth()
})

document.getElementById("logout-btn").addEventListener("click", async () => {
  await fetch("/api/auth/logout")
  checkAuth()
})

async function checkAuth() {
  const res = await fetch("/api/auth/me")
  const user = await res.json()
  document.getElementById("greeting").textContent = user.isLoggedIn ? "Hello, " + user.name + " 👋" : "Hello, guest"
  document.getElementById("auth-panel").hidden = user.isLoggedIn
  document.getElementById("logout-btn").hidden = !user.isLoggedIn
  document.getElementById("cart-btn").hidden = !user.isLoggedIn
  document.getElementById("cart-panel").hidden = true
  if (user.isLoggedIn) updateCartCount()
}

/* ── cart ── */
async function addToCart(productId) {
  const res = await fetch("/api/cart/add", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productId }),
  })
  if (res.status === 401) { authMsg.textContent = "Log in to add records to your cart."; return }
  updateCartCount()
}

async function updateCartCount() {
  const res = await fetch("/api/cart/cart-count")
  const { totalItems } = await res.json()
  document.getElementById("cart-count").textContent = totalItems
}

document.getElementById("cart-btn").addEventListener("click", async () => {
  const panel = document.getElementById("cart-panel")
  panel.hidden = !panel.hidden
  if (panel.hidden) return
  const res = await fetch("/api/cart")
  const { items } = await res.json()
  const ul = document.getElementById("cart-items")
  ul.innerHTML = ""
  items.forEach(item => {
    const li = document.createElement("li")
    li.textContent = item.title + " × " + item.quantity + " ($" + (item.price * item.quantity).toFixed(2) + ")"
    ul.append(li)
  })
  if (!items.length) ul.innerHTML = "<li>Your cart is empty.</li>"
})

document.getElementById("clear-cart").addEventListener("click", async () => {
  await fetch("/api/cart/all", { method: "DELETE" })
  document.getElementById("cart-panel").hidden = true
  updateCartCount()
})

populateGenreSelect()
getProducts().then(renderProducts)
checkAuth()
`);

export const VV_PANEL_CSS = VV_CSS + `.panel form { display: grid; gap: 8px; }
.panel form > div { display: grid; gap: 8px; }
.card button { margin-top: 6px; }
#cart-items { margin: 0; padding-left: 18px; font-size: .9rem; }
`;
