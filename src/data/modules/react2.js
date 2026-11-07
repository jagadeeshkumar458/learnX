/* Module — Advanced React. Lesson titles match the syllabus.
   Labs use the React lab, which also provides react-router-dom (with an address bar in the preview)
   and @supabase/supabase-js (an in-memory database with auth, realtime and row level security). */

const API = "https://api.shipyard.dev";

/* ───────── Reusability ───────── */
const BTN_CSS = `body { font-family: Inter, system-ui, sans-serif; padding: 24px; display: flex; gap: 10px; flex-wrap: wrap; align-items: center; }
.button { border: 0; border-radius: 8px; padding: 10px 16px; font: inherit; font-weight: 700; cursor: pointer; background: #e5e7eb; color: #111827; display: inline-flex; gap: 8px; align-items: center; }
.button-primary { background: #4f46e5; color: #fff; }
.button-danger { background: #dc2626; color: #fff; }
.button-sm { padding: 6px 10px; font-size: 13px; }
.button-lg { padding: 14px 22px; font-size: 18px; }`;

const BUTTON_START = `export default function Button({ children }) {
  return <button className="button">{children}</button>
}
`;
const BUTTON_DONE = `export default function Button({ children, variant, size, className, ...rest }) {
  const classes = ["button", variant && "button-" + variant, size && "button-" + size, className].filter(Boolean).join(" ")
  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  )
}
`;
const BUTTON_APP = `import { useState } from "react"
import Button from "./Button"

export default function App() {
  const [saves, setSaves] = useState(0)
  return (
    <>
      <Button variant="primary" onClick={() => setSaves((n) => n + 1)}>💾 Save</Button>
      <Button variant="danger" size="sm" type="button" aria-label="Delete draft">🗑</Button>
      <Button size="lg" className="extra" disabled>Disabled</Button>
      <p className="saves">Saved {saves} times</p>
    </>
  )
}
`;

const AVATAR_CSS = `body { font-family: Inter, system-ui, sans-serif; padding: 24px; display: flex; gap: 14px; }
.avatar { width: 64px; height: 64px; border-radius: 50%; display: grid; place-items: center; overflow: hidden; background: #6366f1; color: #fff; font-weight: 800; font-size: 22px; }
.avatar img { width: 100%; height: 100%; object-fit: cover; }
.avatar-icon { background: #9ca3af; }`;
const AVATAR_START = `export default function Avatar(props) {
  // 1. src → an <img> with alt = name (or "" if there's no name)
  // 2. no src but a name → initials (first letter of the first two words)
  // 3. neither → a generic person icon with aria-label="User"
  return <div className="avatar"></div>
}
`;
const AVATAR_DONE = `export default function Avatar({ src, name }) {
  if (src) {
    return (
      <div className="avatar">
        <img src={src} alt={name || ""} />
      </div>
    )
  }
  if (name) {
    const initials = name.trim().split(/\\s+/).slice(0, 2).map((word) => word[0].toUpperCase()).join("")
    return <div className="avatar" role="img" aria-label={name}>{initials}</div>
  }
  return <div className="avatar avatar-icon" role="img" aria-label="User">👤</div>
}
`;
const AVATAR_APP = `import Avatar from "./Avatar"

export default function App() {
  return (
    <>
      <Avatar src="https://picsum.photos/id/64/128" name="Ada Lovelace" />
      <Avatar name="bob ziroll" />
      <Avatar />
    </>
  )
}
`;

const MENU_CSS = `body { font-family: Inter, system-ui, sans-serif; padding: 24px; }
.menu { position: relative; display: inline-block; }
.menu-button { border: 1px solid #d1d5db; background: #fff; border-radius: 8px; padding: 8px 14px; font: inherit; cursor: pointer; }
.menu-dropdown { position: absolute; top: 110%; left: 0; min-width: 160px; background: #fff; border: 1px solid #e5e7eb; border-radius: 10px; box-shadow: 0 10px 30px rgba(0,0,0,.1); padding: 6px; margin: 0; list-style: none; }
.menu-item button { display: block; width: 100%; text-align: left; border: 0; background: none; padding: 8px 10px; border-radius: 6px; font: inherit; cursor: pointer; }
.menu-item button:hover { background: #f3f4f6; }`;
const MENU_APP = `import { useState } from "react"
import Menu from "./Menu"

export default function App() {
  const [sport, setSport] = useState("none")
  return (
    <>
      <Menu>
        <Menu.Button>Sports ▾</Menu.Button>
        <Menu.Dropdown>
          <Menu.Item onSelect={() => setSport("Tennis")}>Tennis</Menu.Item>
          <Menu.Item onSelect={() => setSport("Racquetball")}>Racquetball</Menu.Item>
          <Menu.Item onSelect={() => setSport("Pickleball")}>Pickleball</Menu.Item>
        </Menu.Dropdown>
      </Menu>
      <p className="picked">Picked: {sport}</p>
    </>
  )
}
`;
const MENU_START = `import { createContext, useContext, useState } from "react"

// Share { open, toggle, close } with every part of the menu through context

export default function Menu({ children }) {
  return <div className="menu">{children}</div>
}

function MenuButton({ children }) {
  return <button className="menu-button">{children}</button>
}

function MenuDropdown({ children }) {
  return <ul className="menu-dropdown">{children}</ul>
}

function MenuItem({ children, onSelect }) {
  return <li className="menu-item"><button>{children}</button></li>
}

Menu.Button = MenuButton
Menu.Dropdown = MenuDropdown
Menu.Item = MenuItem
`;
const MENU_DONE = `import { createContext, useContext, useState, useId } from "react"

const MenuContext = createContext(null)

export default function Menu({ children }) {
  const [open, setOpen] = useState(false)
  const id = useId()
  const value = { open, id, toggle: () => setOpen((o) => !o), close: () => setOpen(false) }
  return (
    <MenuContext.Provider value={value}>
      <div className="menu">{children}</div>
    </MenuContext.Provider>
  )
}

function useMenu() {
  const ctx = useContext(MenuContext)
  if (!ctx) throw new Error("Menu parts must be used inside <Menu>")
  return ctx
}

function MenuButton({ children }) {
  const { open, toggle, id } = useMenu()
  return (
    <button className="menu-button" onClick={toggle} aria-expanded={open} aria-controls={id}>
      {children}
    </button>
  )
}

function MenuDropdown({ children }) {
  const { open, id } = useMenu()
  if (!open) return null
  return <ul className="menu-dropdown" id={id}>{children}</ul>
}

function MenuItem({ children, onSelect }) {
  const { close } = useMenu()
  function handleClick() {
    if (onSelect) onSelect()
    close()
  }
  return <li className="menu-item"><button onClick={handleClick}>{children}</button></li>
}

Menu.Button = MenuButton
Menu.Dropdown = MenuDropdown
Menu.Item = MenuItem
`;

const TOGGLE_APP = `import { useState } from "react"
import Toggle from "./Toggle"

export default function App() {
  const [log, setLog] = useState([])
  return (
    <main>
      <Toggle onToggle={(on) => setLog((l) => [...l, on ? "on" : "off"])}>
        <Toggle.Button>
          <Toggle.On><span className="star on" aria-label="Starred">★</span></Toggle.On>
          <Toggle.Off><span className="star" aria-label="Not starred">☆</span></Toggle.Off>
        </Toggle.Button>
      </Toggle>
      <p className="log">onToggle calls: {log.join(", ") || "none"}</p>
    </main>
  )
}
`;
const TOGGLE_CSS = `body { font-family: Inter, system-ui, sans-serif; padding: 24px; }
.toggle-button { border: 0; background: none; font-size: 40px; cursor: pointer; padding: 0; }
.star { color: #9ca3af; } .star.on { color: #f59e0b; }
.log { color: #6b7280; }`;
const TOGGLE_START = `import { createContext, useContext, useState, useEffect, useRef } from "react"

const ToggleContext = createContext()

export default function Toggle({ children, onToggle }) {
  const [on, setOn] = useState(false)

  function toggle() {
    setOn((prev) => !prev)
  }

  // Call onToggle(on) when "on" changes, but NOT on the first render.
  // Hint: a ref can remember whether this is the first render.

  return <ToggleContext.Provider value={{ on, toggle }}>{children}</ToggleContext.Provider>
}

function ToggleButton({ children }) {
  return <button className="toggle-button">{children}</button>
}
function ToggleOn({ children }) {
  return null
}
function ToggleOff({ children }) {
  return null
}

Toggle.Button = ToggleButton
Toggle.On = ToggleOn
Toggle.Off = ToggleOff
`;
const TOGGLE_DONE = `import { createContext, useContext, useState, useEffect, useRef } from "react"

const ToggleContext = createContext()

export default function Toggle({ children, onToggle = () => {} }) {
  const [on, setOn] = useState(false)
  const firstRender = useRef(true)

  function toggle() {
    setOn((prev) => !prev)
  }

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    onToggle(on)
  }, [on])

  return <ToggleContext.Provider value={{ on, toggle }}>{children}</ToggleContext.Provider>
}

function ToggleButton({ children }) {
  const { on, toggle } = useContext(ToggleContext)
  return <button className="toggle-button" onClick={toggle} aria-pressed={on}>{children}</button>
}
function ToggleOn({ children }) {
  const { on } = useContext(ToggleContext)
  return on ? children : null
}
function ToggleOff({ children }) {
  const { on } = useContext(ToggleContext)
  return on ? null : children
}

Toggle.Button = ToggleButton
Toggle.On = ToggleOn
Toggle.Off = ToggleOff
`;

/* ───────── Performance ───────── */
const PERF_CSS = `body { font-family: Inter, system-ui, sans-serif; padding: 20px; }
input { padding: 8px; border: 1px solid #ccc; border-radius: 6px; font: inherit; }
.list { margin-top: 12px; padding: 12px; background: #f3f4f6; border-radius: 10px; }
.renders { color: #b45309; font-weight: 700; }`;
const PERF_START = `import { useState } from "react"
import ProductList from "./ProductList"

const products = ["Keyboard", "Mouse", "Monitor", "Webcam", "Desk lamp"]

export default function App() {
  const [search, setSearch] = useState("")
  const [cart, setCart] = useState([])

  function addToCart(item) {
    setCart((c) => [...c, item])
  }

  const settings = { currency: "USD" }

  return (
    <main>
      <input aria-label="Search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Type here…" />
      <p>Cart: {cart.length} items</p>
      <ProductList products={products} onAdd={addToCart} settings={settings} />
    </main>
  )
}
`;
const PERF_LIST_START = `window.listRenders = (window.listRenders || 0)

export default function ProductList({ products, onAdd, settings }) {
  window.listRenders++
  // pretend this is expensive to render
  const start = performance.now()
  while (performance.now() - start < 5) {}
  return (
    <div className="list">
      <p className="renders">ProductList renders: {window.listRenders}</p>
      {products.map((p) => (
        <button key={p} onClick={() => onAdd(p)}>Add {p}</button>
      ))}
      <p>Prices in {settings.currency}</p>
    </div>
  )
}
`;
const PERF_DONE = `import { useState, useCallback, useMemo } from "react"
import ProductList from "./ProductList"

const products = ["Keyboard", "Mouse", "Monitor", "Webcam", "Desk lamp"]

export default function App() {
  const [search, setSearch] = useState("")
  const [cart, setCart] = useState([])

  const addToCart = useCallback((item) => {
    setCart((c) => [...c, item])
  }, [])

  const settings = useMemo(() => ({ currency: "USD" }), [])

  return (
    <main>
      <input aria-label="Search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Type here…" />
      <p>Cart: {cart.length} items</p>
      <ProductList products={products} onAdd={addToCart} settings={settings} />
    </main>
  )
}
`;
const PERF_LIST_DONE = `import { memo } from "react"

window.listRenders = (window.listRenders || 0)

function ProductList({ products, onAdd, settings }) {
  window.listRenders++
  const start = performance.now()
  while (performance.now() - start < 5) {}
  return (
    <div className="list">
      <p className="renders">ProductList renders: {window.listRenders}</p>
      {products.map((p) => (
        <button key={p} onClick={() => onAdd(p)}>Add {p}</button>
      ))}
      <p>Prices in {settings.currency}</p>
    </div>
  )
}

export default memo(ProductList)
`;

/* ───────── Component library ───────── */
const LIB_CSS = `body { font-family: Inter, system-ui, sans-serif; padding: 20px; display: grid; gap: 14px; }
.badge { display: inline-block; padding: 2px 10px; font-size: 12px; font-weight: 600; }
.badge-square { border-radius: 6px; } .badge-pill { border-radius: 999px; }
.badge-gray { background: #f3f4f6; color: #374151; } .badge-red { background: #fee2e2; color: #991b1b; }
.badge-green { background: #dcfce7; color: #166534; } .badge-blue { background: #dbeafe; color: #1e40af; }
.banner { display: flex; gap: 10px; padding: 12px 14px; border-radius: 8px; }
.banner h3 { margin: 0; font-size: 14px; } .banner p { margin: 4px 0 0; font-size: 14px; }
.banner-success { background: #ecfdf5; color: #065f46; } .banner-warning { background: #fffbeb; color: #92400e; }
.banner-error { background: #fef2f2; color: #991b1b; } .banner-neutral { background: #eff6ff; color: #1e40af; }`;
const LIB_APP = `import Badge from "./Badge"
import Banner from "./Banner"

export default function App() {
  return (
    <>
      <div>
        <Badge>Gray</Badge> <Badge color="red" shape="pill">Overdue</Badge> <Badge color="green">Paid</Badge>
      </div>
      <Banner status="success" title="Congratulations!">Your payment went through.</Banner>
      <Banner status="error" title="There is a problem with your application" />
    </>
  )
}
`;
const BADGE_DONE = `export default function Badge({ children, color = "gray", shape = "square" }) {
  return <span className={\`badge badge-\${color} badge-\${shape}\`}>{children}</span>
}
`;
const BANNER_DONE = `const icons = { success: "✓", warning: "!", error: "✕", neutral: "i" }

export default function Banner({ status = "neutral", title, children }) {
  return (
    <div className={\`banner banner-\${status}\`} role={status === "error" ? "alert" : "status"}>
      <span aria-hidden="true">{icons[status]}</span>
      <div>
        <h3>{title}</h3>
        {children && <p>{children}</p>}
      </div>
    </div>
  )
}
`;

/* ───────── VanLife routing ───────── */
const VAN_CSS = `* { box-sizing: border-box; }
body { margin: 0; font-family: Inter, system-ui, sans-serif; background: #fff7ed; color: #161616; }
header { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px; }
header .site-logo { font-weight: 900; font-size: 22px; color: #000; text-decoration: none; }
header nav { display: flex; gap: 14px; }
header nav a { color: #4d4d4d; text-decoration: none; font-weight: 600; }
header nav a.active, .host-nav a.active { color: #161616; text-decoration: underline; }
main { padding: 0 24px 24px; }
.van-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 18px; }
.van-tile a { color: inherit; text-decoration: none; }
.van-tile img { width: 100%; border-radius: 6px; display: block; }
.van-tile h3 { margin: 8px 0 2px; font-size: 16px; }
.van-type { display: inline-block; padding: 4px 12px; border-radius: 6px; color: #fff; font-size: 13px; font-weight: 600; text-transform: capitalize; }
.van-type.simple { background: #e17654; } .van-type.rugged { background: #115e59; } .van-type.luxury { background: #161616; }
.filters { display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap; }
.filters button, .filters a { border: 0; background: #ffead0; padding: 6px 14px; border-radius: 6px; cursor: pointer; font: inherit; color: #4d4d4d; text-decoration: none; }
.filters .selected { background: #e17654; color: #fff; }
.host-nav { display: flex; gap: 14px; margin-bottom: 16px; }
.host-nav a { color: #4d4d4d; text-decoration: none; font-weight: 600; }
footer { padding: 16px; text-align: center; color: #aaa; background: #252525; }`;

const ROUTER_APP_START = `import { BrowserRouter, Routes, Route, Link } from "react-router-dom"
import Home from "./pages/Home"
import About from "./pages/About"

export default function App() {
  return (
    <BrowserRouter>
      <header>
        <Link className="site-logo" to="/">#VANLIFE</Link>
        <nav>
          <Link to="/about">About</Link>
        </nav>
      </header>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </BrowserRouter>
  )
}
`;
const HOME = `import { Link } from "react-router-dom"

export default function Home() {
  return (
    <main>
      <h1>You got the travel plans, we got the travel vans.</h1>
      <p>Add adventure to your life by joining the #vanlife movement. Rent the perfect van to make your perfect road trip.</p>
      <Link to="/vans">Find your van</Link>
    </main>
  )
}
`;
const ABOUT = `export default function About() {
  return (
    <main>
      <h1>Don't squeeze in a sedan when you could relax in a van.</h1>
      <p>Our mission is to enliven your road trip with the perfect travel van rental.</p>
    </main>
  )
}
`;
const VANS_PAGE = `import { useEffect, useState } from "react"
import { Link } from "react-router-dom"

export default function Vans() {
  const [vans, setVans] = useState([])

  useEffect(() => {
    fetch("${API}/vans")
      .then((res) => res.json())
      .then((data) => setVans(data.vans))
  }, [])

  return (
    <main>
      <h1>Explore our van options</h1>
      <div className="van-list">
        {vans.map((van) => (
          <div key={van.id} className="van-tile">
            <Link to={\`/vans/\${van.id}\`} aria-label={\`View details for \${van.name}, priced at $\${van.price} per day\`}>
              <img src={van.imageUrl} alt="" />
              <h3>{van.name}</h3>
              <p>\${van.price}/day</p>
              <i className={\`van-type \${van.type}\`}>{van.type}</i>
            </Link>
          </div>
        ))}
      </div>
    </main>
  )
}
`;
const VAN_DETAIL_START = `import { useEffect, useState } from "react"

export default function VanDetail() {
  // read the :id route param, fetch ${API}/vans/:id (the van is in data.vans)
  const [van, setVan] = useState(null)

  return <main>{van ? <h1>{van.name}</h1> : <h2>Loading...</h2>}</main>
}
`;
const VAN_DETAIL_DONE = `import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"

export default function VanDetail() {
  const { id } = useParams()
  const [van, setVan] = useState(null)

  useEffect(() => {
    fetch(\`${API}/vans/\${id}\`)
      .then((res) => res.json())
      .then((data) => setVan(data.vans))
  }, [id])

  return (
    <main>
      <Link to=".." relative="path">&larr; Back to all vans</Link>
      {van ? (
        <div className="van-detail">
          <img src={van.imageUrl} alt="" width="240" />
          <i className={\`van-type \${van.type}\`}>{van.type}</i>
          <h1>{van.name}</h1>
          <p>\${van.price}/day</p>
          <p>{van.description}</p>
        </div>
      ) : <h2>Loading...</h2>}
    </main>
  )
}
`;
const PARAMS_APP_START = `import { BrowserRouter, Routes, Route, Link } from "react-router-dom"
import Home from "./pages/Home"
import About from "./pages/About"
import Vans from "./pages/Vans"
import VanDetail from "./pages/VanDetail"

export default function App() {
  return (
    <BrowserRouter>
      <header>
        <Link className="site-logo" to="/">#VANLIFE</Link>
        <nav>
          <Link to="/about">About</Link>
          <Link to="/vans">Vans</Link>
        </nav>
      </header>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/vans" element={<Vans />} />
        {/* add a route for /vans/:id */}
      </Routes>
    </BrowserRouter>
  )
}
`;
const PARAMS_APP_DONE = PARAMS_APP_START.replace("        {/* add a route for /vans/:id */}", '        <Route path="/vans/:id" element={<VanDetail />} />');

const LAYOUT_START = `export default function Layout() {
  return (
    <>
      <header>
        <a className="site-logo" href="/">#VANLIFE</a>
        <nav>
          <a href="/host">Host</a>
          <a href="/about">About</a>
          <a href="/vans">Vans</a>
        </nav>
      </header>
      {/* the matched child route renders here */}
      <footer>Ⓒ 2026 #VANLIFE</footer>
    </>
  )
}
`;
const LAYOUT_DONE = `import { Link, NavLink, Outlet } from "react-router-dom"

export default function Layout() {
  return (
    <>
      <header>
        <Link className="site-logo" to="/">#VANLIFE</Link>
        <nav>
          <NavLink to="host">Host</NavLink>
          <NavLink to="about">About</NavLink>
          <NavLink to="vans">Vans</NavLink>
        </nav>
      </header>
      <Outlet />
      <footer>Ⓒ 2026 #VANLIFE</footer>
    </>
  )
}
`;
const HOST_LAYOUT_START = `export default function HostLayout() {
  return (
    <main>
      <nav className="host-nav">
        {/* Dashboard (/host, exact), Income (/host/income), Reviews (/host/reviews) */}
      </nav>
    </main>
  )
}
`;
const HOST_LAYOUT_DONE = `import { NavLink, Outlet } from "react-router-dom"

export default function HostLayout() {
  return (
    <main>
      <nav className="host-nav">
        <NavLink to="." end>Dashboard</NavLink>
        <NavLink to="income">Income</NavLink>
        <NavLink to="reviews">Reviews</NavLink>
      </nav>
      <Outlet />
    </main>
  )
}
`;
const HOST_PAGES = {
  "pages/host/Dashboard.jsx": `export default function Dashboard() {\n  return <h1>Dashboard goes here</h1>\n}\n`,
  "pages/host/Income.jsx": `export default function Income() {\n  return <h1>Income goes here</h1>\n}\n`,
  "pages/host/Reviews.jsx": `export default function Reviews() {\n  return <h1>Reviews go here</h1>\n}\n`,
};
const NESTED_APP_START = `import { BrowserRouter, Routes, Route } from "react-router-dom"
import Layout from "./components/Layout"
import HostLayout from "./components/HostLayout"
import Home from "./pages/Home"
import About from "./pages/About"
import Vans from "./pages/Vans"
import Dashboard from "./pages/host/Dashboard"
import Income from "./pages/host/Income"
import Reviews from "./pages/host/Reviews"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/vans" element={<Vans />} />
      </Routes>
    </BrowserRouter>
  )
}
`;
const NESTED_APP_DONE = `import { BrowserRouter, Routes, Route } from "react-router-dom"
import Layout from "./components/Layout"
import HostLayout from "./components/HostLayout"
import Home from "./pages/Home"
import About from "./pages/About"
import Vans from "./pages/Vans"
import Dashboard from "./pages/host/Dashboard"
import Income from "./pages/host/Income"
import Reviews from "./pages/host/Reviews"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="vans" element={<Vans />} />
          <Route path="host" element={<HostLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="income" element={<Income />} />
            <Route path="reviews" element={<Reviews />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
`;
const FILTER_START = `import { useEffect, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"

export default function Vans() {
  const [vans, setVans] = useState([])
  // read ?type= from the URL with useSearchParams

  useEffect(() => {
    fetch("${API}/vans")
      .then((res) => res.json())
      .then((data) => setVans(data.vans))
  }, [])

  const displayedVans = vans // filter by type when there is one

  return (
    <main>
      <h1>Explore our van options</h1>
      <div className="filters">
        {/* buttons: simple, luxury, rugged (set ?type=…) and "Clear filters" (only when filtered) */}
      </div>
      <div className="van-list">
        {displayedVans.map((van) => (
          <div key={van.id} className="van-tile">
            <Link to={\`/vans/\${van.id}\`}>
              <img src={van.imageUrl} alt="" />
              <h3>{van.name}</h3>
              <i className={\`van-type \${van.type}\`}>{van.type}</i>
            </Link>
          </div>
        ))}
      </div>
    </main>
  )
}
`;
const FILTER_DONE = `import { useEffect, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"

export default function Vans() {
  const [vans, setVans] = useState([])
  const [searchParams, setSearchParams] = useSearchParams()
  const typeFilter = searchParams.get("type")

  useEffect(() => {
    fetch("${API}/vans")
      .then((res) => res.json())
      .then((data) => setVans(data.vans))
  }, [])

  const displayedVans = typeFilter ? vans.filter((van) => van.type === typeFilter) : vans

  function handleFilterChange(key, value) {
    setSearchParams((prev) => {
      if (value === null) prev.delete(key)
      else prev.set(key, value)
      return prev
    })
  }

  return (
    <main>
      <h1>Explore our van options</h1>
      <div className="filters">
        {["simple", "luxury", "rugged"].map((type) => (
          <button key={type} className={typeFilter === type ? "selected" : ""} aria-pressed={typeFilter === type} onClick={() => handleFilterChange("type", type)}>
            {type[0].toUpperCase() + type.slice(1)}
          </button>
        ))}
        {typeFilter && <button onClick={() => handleFilterChange("type", null)}>Clear filters</button>}
      </div>
      <div className="van-list">
        {displayedVans.map((van) => (
          <div key={van.id} className="van-tile">
            <Link to={\`/vans/\${van.id}\`}>
              <img src={van.imageUrl} alt="" />
              <h3>{van.name}</h3>
              <i className={\`van-type \${van.type}\`}>{van.type}</i>
            </Link>
          </div>
        ))}
      </div>
    </main>
  )
}
`;
const FILTER_APP = `import { BrowserRouter, Routes, Route, Link } from "react-router-dom"
import Vans from "./pages/Vans"

export default function App() {
  return (
    <BrowserRouter>
      <header><Link className="site-logo" to="/vans">#VANLIFE</Link></header>
      <Routes>
        <Route path="/vans" element={<Vans />} />
        <Route path="*" element={<Vans />} />
      </Routes>
    </BrowserRouter>
  )
}
`;

/* ───────── Supabase: sales dashboard ───────── */
const SB_URL = "https://xyzcompany.supabase.co";
const SALES_SEED = {
  tables: {
    sales_deals: [
      { id: 1, name: "Alice", value: 12000, user_id: "u-alice" }, { id: 2, name: "Bob", value: 8000, user_id: "u-bob" },
      { id: 3, name: "Alice", value: 7500, user_id: "u-alice" }, { id: 4, name: "Carla", value: 15000, user_id: "u-carla" },
      { id: 5, name: "Bob", value: 4200, user_id: "u-bob" }, { id: 6, name: "Carla", value: 3100, user_id: "u-carla" },
    ],
    profiles: [{ id: "u-alice", name: "Alice", account_type: "rep" }, { id: "u-bob", name: "Bob", account_type: "rep" }, { id: "u-carla", name: "Carla", account_type: "rep" }, { id: "u-ana", name: "Ana", account_type: "admin" }],
  },
  users: [
    { id: "u-alice", email: "alice@acme.dev", password: "password123", user_metadata: { name: "Alice" } },
    { id: "u-bob", email: "bob@acme.dev", password: "password123", user_metadata: { name: "Bob" } },
    { id: "u-carla", email: "carla@acme.dev", password: "password123", user_metadata: { name: "Carla" } },
  ],
};
const SB_CLIENT = `import { createClient } from "@supabase/supabase-js"

// In a real project these come from .env: import.meta.env.VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY
const supabaseUrl = "${SB_URL}"
const supabaseKey = "public-anon-key"

export const supabase = createClient(supabaseUrl, supabaseKey)
`;
const DASH_CSS = `body { font-family: Inter, system-ui, sans-serif; padding: 20px; background: #f8fafc; color: #0f172a; }
.chart { display: grid; gap: 8px; margin: 12px 0 20px; }
.bar-row { display: grid; grid-template-columns: 70px 1fr 80px; gap: 10px; align-items: center; }
.bar { height: 22px; background: linear-gradient(90deg, #6366f1, #22d3ee); border-radius: 6px; transition: width .4s; }
form { display: flex; gap: 8px; flex-wrap: wrap; align-items: end; }
label { display: grid; gap: 4px; font-size: 13px; color: #475569; }
input, select { padding: 7px 9px; border: 1px solid #cbd5e1; border-radius: 6px; font: inherit; }
button { padding: 8px 14px; border: 0; border-radius: 6px; background: #4f46e5; color: #fff; font-weight: 700; cursor: pointer; }
.error { color: #b91c1c; }`;
const DASH_START = `import { useEffect, useState } from "react"
import { supabase } from "./supabase-client"

export default function Dashboard() {
  const [metrics, setMetrics] = useState([])

  useEffect(() => {
    fetchMetrics()
    // subscribe to inserts on sales_deals and re-fetch when one arrives (clean up on unmount)
  }, [])

  async function fetchMetrics() {
    // select name and the sum of value from sales_deals: "name, value.sum()"
  }

  const max = Math.max(1, ...metrics.map((m) => m.sum))

  return (
    <main>
      <h1>Total sales this quarter ($)</h1>
      <div className="chart">
        {metrics.map((m) => (
          <div className="bar-row" key={m.name}>
            <span>{m.name}</span>
            <div className="bar" style={{ width: (m.sum / max) * 100 + "%" }} />
            <b>\${m.sum.toLocaleString()}</b>
          </div>
        ))}
      </div>
      <NewDealForm />
    </main>
  )
}

function NewDealForm() {
  const [error, setError] = useState("")

  async function handleSubmit(event) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    // insert { name, value: Number(value) } into sales_deals; show error.message if it fails
  }

  return (
    <form onSubmit={handleSubmit} aria-label="Add a deal">
      <label>Name<select name="name" defaultValue="Alice"><option>Alice</option><option>Bob</option><option>Carla</option></select></label>
      <label>Amount ($)<input name="value" type="number" min="0" step="10" defaultValue="0" /></label>
      <button>Add deal</button>
      {error && <p className="error" role="alert">{error}</p>}
    </form>
  )
}
`;
const DASH_DONE = `import { useEffect, useState } from "react"
import { supabase } from "./supabase-client"

export default function Dashboard() {
  const [metrics, setMetrics] = useState([])

  useEffect(() => {
    fetchMetrics()
    const channel = supabase
      .channel("deal-changes")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "sales_deals" }, () => fetchMetrics())
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  async function fetchMetrics() {
    const { data, error } = await supabase.from("sales_deals").select("name, value.sum()")
    if (error) {
      console.error("Error fetching metrics:", error.message)
      return
    }
    setMetrics(data)
  }

  const max = Math.max(1, ...metrics.map((m) => m.sum))

  return (
    <main>
      <h1>Total sales this quarter ($)</h1>
      <div className="chart">
        {metrics.map((m) => (
          <div className="bar-row" key={m.name}>
            <span>{m.name}</span>
            <div className="bar" style={{ width: (m.sum / max) * 100 + "%" }} />
            <b>\${m.sum.toLocaleString()}</b>
          </div>
        ))}
      </div>
      <NewDealForm />
    </main>
  )
}

function NewDealForm() {
  const [error, setError] = useState("")

  async function handleSubmit(event) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const { error } = await supabase.from("sales_deals").insert({ name: form.get("name"), value: Number(form.get("value")) })
    setError(error ? error.message : "")
  }

  return (
    <form onSubmit={handleSubmit} aria-label="Add a deal">
      <label>Name<select name="name" defaultValue="Alice"><option>Alice</option><option>Bob</option><option>Carla</option></select></label>
      <label>Amount ($)<input name="value" type="number" min="0" step="10" defaultValue="0" /></label>
      <button>Add deal</button>
      {error && <p className="error" role="alert">{error}</p>}
    </form>
  )
}
`;

/* ───────── Supabase auth ───────── */
const AUTH_SEED = { ...SALES_SEED, rls: { sales_deals: "user_id" }, rlsReadAll: { sales_deals: true }, defaults: { sales_deals: { user_id: "auth.uid()" } }, onSignup: { table: "profiles", row: { id: "id", name: "meta.name", account_type: "rep" } } };
const AUTH_CSS = `body { font-family: Inter, system-ui, sans-serif; padding: 20px; background: #f8fafc; color: #0f172a; }
form { display: grid; gap: 10px; max-width: 300px; }
label { display: grid; gap: 4px; font-size: 13px; color: #475569; }
input { padding: 8px 10px; border: 1px solid #cbd5e1; border-radius: 6px; font: inherit; }
button { padding: 9px 14px; border: 0; border-radius: 6px; background: #4f46e5; color: #fff; font-weight: 700; cursor: pointer; }
.error { color: #b91c1c; } .who { color: #475569; }`;
const AUTH_CONTEXT_START = `import { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "./supabase-client"

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(undefined) // undefined = still checking

  useEffect(() => {
    // 1. get the current session
    // 2. listen with onAuthStateChange and keep session in sync; unsubscribe on cleanup
  }, [])

  async function signIn(email, password) {
    // return { error } from signInWithPassword
  }

  async function signOut() {
  }

  return <AuthContext.Provider value={{ session, signIn, signOut }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
`;
const AUTH_CONTEXT_DONE = `import { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "./supabase-client"

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(undefined)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data } = supabase.auth.onAuthStateChange((_event, newSession) => setSession(newSession))
    return () => data.subscription.unsubscribe()
  }, [])

  async function signIn(email, password) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error }
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  return <AuthContext.Provider value={{ session, signIn, signOut }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
`;
const AUTH_APP_START = `import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider, useAuth } from "./AuthContext"
import SignIn from "./SignIn"
import Dashboard from "./Dashboard"

function ProtectedRoute({ children }) {
  // while the session is loading show <p>Loading…</p>
  // if there's no session, <Navigate to="/signin" replace />
  return children
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/signin" element={<SignIn />} />
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
`;
const AUTH_APP_DONE = AUTH_APP_START.replace(`  // while the session is loading show <p>Loading…</p>
  // if there's no session, <Navigate to="/signin" replace />
  return children`, `  const { session } = useAuth()
  if (session === undefined) return <p>Loading…</p>
  if (!session) return <Navigate to="/signin" replace />
  return children`);
const SIGNIN_START = `import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "./AuthContext"

export default function SignIn() {
  const [error, setError] = useState("")

  async function handleSubmit(event) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    // call signIn(email, password); on error show it, otherwise navigate to "/"
  }

  return (
    <form onSubmit={handleSubmit}>
      <h1>Sign in</h1>
      <label>Email<input name="email" type="email" autoComplete="email" required /></label>
      <label>Password<input name="password" type="password" autoComplete="current-password" required /></label>
      <button>Sign in</button>
      {error && <p className="error" role="alert">{error}</p>}
    </form>
  )
}
`;
const SIGNIN_DONE = `import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "./AuthContext"

export default function SignIn() {
  const [error, setError] = useState("")
  const { signIn } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(event) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const { error } = await signIn(form.get("email"), form.get("password"))
    if (error) setError(error.message)
    else navigate("/")
  }

  return (
    <form onSubmit={handleSubmit}>
      <h1>Sign in</h1>
      <label>Email<input name="email" type="email" autoComplete="email" required /></label>
      <label>Password<input name="password" type="password" autoComplete="current-password" required /></label>
      <button>Sign in</button>
      {error && <p className="error" role="alert">{error}</p>}
    </form>
  )
}
`;
const AUTH_DASH = `import { useAuth } from "./AuthContext"

export default function Dashboard() {
  const { session, signOut } = useAuth()
  return (
    <main>
      <h1>Sales dashboard</h1>
      <p className="who">Signed in as {session.user.email}</p>
      <button onClick={signOut}>Sign out</button>
    </main>
  )
}
`;

export const REACT2 = {
  id: "react2",
  title: "Advanced React.js",
  blurb: "Take your skills to a professional level and conquer real-world apps.",
  concepts: ["Compound components and custom hooks", "Memoization and performance", "Routing", "Persistence and auth"],
  lessons: [
    { id: "ra-welcome", title: "Welcome to Advanced React", min: 8, kind: "lesson", body: [
      { t: "p", h: "You can build React apps. Now you'll build them the way professional teams do: components that other developers can reuse without reading their insides, apps that stay fast as they grow, multiple pages with real URLs, and data that's stored in a database behind a login." },
      { t: "steps", items: ["<b>Reusability</b>: children, prop spreading, variants, compound components, context, headless components, refs and render props", "<b>Performance</b>: how rendering works, React.memo, useMemo/useCallback, code splitting", "<b>Component library</b>: a solo project", "<b>Routing</b>: React Router, from links to nested layouts and search params, building VanLife", "<b>Persistence and authentication</b>: a Supabase-backed sales dashboard with realtime updates, sign-in and row level security"] },
      { t: "callout", kind: "tip", h: "The labs include <code>react-router-dom</code> (with an address bar above the preview) and <code>@supabase/supabase-js</code> (an in-memory database with auth and realtime). The APIs match the real packages, so your code carries straight over." },
      { t: "video", name: "react-render" },
    ]},

    { id: "ra-reuse", title: "Reusability", min: 180, kind: "project", body: [
      { t: "h", h: "Children and prop spreading" },
      { t: "p", h: "A reusable component should feel like a native element. Accept <code>children</code> for content, and pass through any other props with the <b>rest/spread</b> pattern, so <code>type</code>, <code>disabled</code>, <code>aria-label</code> and event handlers just work without you listing them." },
      { t: "code", lang: "jsx", code: `function Button({ children, className, ...rest }) {
  return <button className={"button " + (className || "")} {...rest}>{children}</button>
}

<Button onClick={save} type="submit" disabled={saving}>Save</Button>` },
      { t: "rch", prompt: "Make <code>Button</code> reusable: render <code>children</code>; add <code>variant</code> and <code>size</code> props that add <code>button-{variant}</code> and <code>button-{size}</code> classes; merge any <code>className</code> passed in (keeping <code>button</code>); and pass every other prop (onClick, type, disabled, aria-*) through to the <code>&lt;button&gt;</code>.", files: { "App.jsx": BUTTON_APP, "Button.jsx": BUTTON_START, "index.css": BTN_CSS }, solution: { "Button.jsx": BUTTON_DONE }, tests: [
        { msg: "Renders its children", fn: async (h) => !!h.button("Save") && h.$$("button").length === 3 },
        { msg: "variant and size become classes, and button is kept", fn: async (h) => { const b = h.$$("button"); return b[0].classList.contains("button") && b[0].classList.contains("button-primary") && b[1].classList.contains("button-danger") && b[1].classList.contains("button-sm") && b[2].classList.contains("button-lg"); } },
        { msg: "A className prop is merged in, not replacing the others", fn: async (h) => { const b = h.$$("button")[2]; return b.classList.contains("extra") && b.classList.contains("button"); } },
        { msg: "Other props pass through (onClick, type, aria-label, disabled)", fn: async (h) => { const b = h.$$("button"); await h.click(b[0]); return /Saved 1 times/.test(h.text(".saves")) && b[1].getAttribute("type") === "button" && b[1].getAttribute("aria-label") === "Delete draft" && b[2].disabled; } },
        { msg: "No unknown props leak onto the DOM (variant/size)", fn: async (h) => !h.$$("button").some((b) => b.hasAttribute("variant") || b.hasAttribute("size")) },
      ] },
      { t: "h", h: "Mega challenge: an overloaded Avatar" },
      { t: "rch", prompt: "Build <code>Avatar</code>: with <code>src</code>, show an <code>&lt;img&gt;</code> whose alt is the <code>name</code> (or empty); with only a <code>name</code>, show initials (first letters of the first two words, uppercase) in an element with <code>role=\"img\"</code> and the name as its <code>aria-label</code>; with neither, a generic icon labelled <code>\"User\"</code>. Every variant has the <code>avatar</code> class.", files: { "App.jsx": AVATAR_APP, "Avatar.jsx": AVATAR_START, "index.css": AVATAR_CSS }, solution: { "Avatar.jsx": AVATAR_DONE }, tests: [
        { msg: "src → an image with the name as alt", fn: async (h) => { const i = h.$(".avatar img"); return !!i && /picsum/.test(i.getAttribute("src")) && i.getAttribute("alt") === "Ada Lovelace"; } },
        { msg: "name only → initials BZ, labelled with the name", fn: async (h) => { const a = h.$$(".avatar")[1]; return a && a.textContent.trim() === "BZ" && a.getAttribute("role") === "img" && a.getAttribute("aria-label") === "bob ziroll"; } },
        { msg: "Neither → an icon labelled User", fn: async (h) => { const a = h.$$(".avatar")[2]; return a && a.getAttribute("aria-label") === "User" && !a.querySelector("img"); } },
        { msg: "Exactly three .avatar elements", fn: async (h) => h.$$(".avatar").length === 3 },
      ] },
      { t: "h", h: "Prop drilling, compound components and context" },
      { t: "p", h: "A Menu needs shared state: the button opens the dropdown, an item closes it. Passing <code>open</code> and <code>toggle</code> through every layer is <b>prop drilling</b>. <b>Compound components</b> (<code>Menu</code>, <code>Menu.Button</code>, <code>Menu.Dropdown</code>, <code>Menu.Item</code>) let the user arrange the pieces freely, and <b>context</b> shares the state between them implicitly." },
      { t: "code", lang: "jsx", code: `const MenuContext = createContext()

function Menu({ children }) {
  const [open, setOpen] = useState(false)
  return <MenuContext.Provider value={{ open, toggle: () => setOpen(o => !o) }}>{children}</MenuContext.Provider>
}
function MenuButton({ children }) {
  const { toggle } = useContext(MenuContext)
  return <button onClick={toggle}>{children}</button>
}
Menu.Button = MenuButton   // dot syntax: one import, related parts` },
      { t: "rch", prompt: "Finish the compound <code>Menu</code> with context: <code>Menu.Button</code> toggles the dropdown and reflects it in <code>aria-expanded</code>; <code>Menu.Dropdown</code> renders only when open; clicking a <code>Menu.Item</code> calls its <code>onSelect</code> and closes the menu.", files: { "App.jsx": MENU_APP, "Menu.jsx": MENU_START, "index.css": MENU_CSS }, solution: { "Menu.jsx": MENU_DONE }, tests: [
        { msg: "Closed at first: no dropdown, aria-expanded=false", fn: async (h) => !h.$(".menu-dropdown") && h.$(".menu-button").getAttribute("aria-expanded") === "false" },
        { msg: "Clicking the button opens it (aria-expanded=true, 3 items)", fn: async (h) => { await h.click(".menu-button"); return !!h.$(".menu-dropdown") && h.$$(".menu-item").length === 3 && h.$(".menu-button").getAttribute("aria-expanded") === "true"; } },
        { msg: "Clicking it again closes it", fn: async (h) => { await h.click(".menu-button"); await h.click(".menu-button"); return !h.$(".menu-dropdown"); } },
        { msg: "Choosing an item calls onSelect and closes the menu", fn: async (h) => { await h.click(".menu-button"); await h.click(h.$$(".menu-item button")[1]); return !h.$(".menu-dropdown") && /Picked: Racquetball/.test(h.text(".picked")); } },
        { msg: "Uses createContext", fn: async (h) => /createContext\(/.test(h.src("Menu.jsx")) && /useContext\(/.test(h.src("Menu.jsx")) },
      ] },
      { t: "h", h: "Headless components, refs and render props" },
      { t: "p", h: "A <b>headless</b> component owns behaviour but no markup. <code>Toggle</code> manages on/off; <code>Toggle.On</code>, <code>Toggle.Off</code> and <code>Toggle.Button</code> let you render anything: a star, a switch, a menu. A <b>ref</b> (<code>useRef</code>) holds a value that survives re-renders without causing one: perfect for remembering \"is this the first render?\" so <code>onToggle</code> doesn't fire on mount." },
      { t: "rch", prompt: "Finish the headless <code>Toggle</code>: <code>Toggle.Button</code> toggles (with <code>aria-pressed</code>); <code>Toggle.On</code>/<code>Toggle.Off</code> render their children only in that state; call <code>onToggle(on)</code> whenever it changes but <b>not</b> on the first render (use a ref), and don't crash when no <code>onToggle</code> is passed.", files: { "App.jsx": TOGGLE_APP, "Toggle.jsx": TOGGLE_START, "index.css": TOGGLE_CSS }, solution: { "Toggle.jsx": TOGGLE_DONE }, tests: [
        { msg: "Starts off: shows only the Off content", fn: async (h) => !!h.$("[aria-label='Not starred']") && !h.$("[aria-label='Starred']") },
        { msg: "Clicking switches to On (aria-pressed=true)", fn: async (h) => { await h.click(".toggle-button"); return !!h.$("[aria-label='Starred']") && !h.$("[aria-label='Not starred']") && h.$(".toggle-button").getAttribute("aria-pressed") === "true"; } },
        { msg: "onToggle isn't called on mount", fn: async (h) => { await h.tick(80); return /none/.test(h.text(".log")); } },
        { msg: "onToggle gets the new state on each change", fn: async (h) => { await h.click(".toggle-button"); await h.click(".toggle-button"); await h.tick(50); return /on, off/.test(h.text(".log")); } },
        { msg: "Works without an onToggle prop", fn: async (h) => { const T = h.mod("Toggle.jsx").default; const div = await h.render(T, null, h.React.createElement(T.Button, null, "x")); div.querySelector("button").click(); await h.tick(40); return h.noWarnings(/TypeError|is not a function/); } },
      ] },
      { t: "p", h: "<b>Render props</b> are the other classic way to share behaviour: the component calls a function you pass as <code>children</code> with its state, and you return whatever UI you like." },
      { t: "code", lang: "jsx", code: `function Toggle({ children }) {
  const [on, setOn] = useState(false)
  return children({ on, toggle: () => setOn(o => !o) })
}

<Toggle>
  {({ on, toggle }) => <button onClick={toggle}>{on ? "★" : "☆"}</button>}
</Toggle>` },
      { t: "callout", kind: "tip", h: "Custom hooks (<code>useToggle()</code>) are usually the simplest way to share logic today. Compound components shine when parts of the <b>UI</b> need shared state; render props when a parent needs total control over the markup." },
      { t: "recap", items: ["children + ...rest make components feel native", "Merge classNames; don't leak custom props to the DOM", "Compound components + context avoid prop drilling", "Headless components own behaviour; you own the markup", "useRef: values that persist without re-rendering", "Render props pass state to a function child"] },
    ]},

    { id: "ra-perf", title: "Performance", min: 90, kind: "lesson", body: [
      { t: "h", h: "How rendering works" },
      { t: "p", h: "A render has three phases: <b>trigger</b> (state changes, or a parent renders), <b>render</b> (React calls your components to get the new JSX and compares it with the last result) and <b>commit</b> (React applies only the differences to the DOM). Rendering is recursive: when a component renders, <b>all its children render too</b>, whether their props changed or not." },
      { t: "video", name: "react-render" },
      { t: "quiz", q: "App holds a search input's state and renders a big ProductList that doesn't use the search. You type a letter. What happens?", opts: ["Only the input re-renders", "App and ProductList both re-render, even though ProductList's props didn't change", "Nothing re-renders until you press Enter"], a: 1, why: "A state change re-renders that component and all of its descendants by default. React.memo can skip children whose props are unchanged." },
      { t: "h", h: "React.memo and referential equality" },
      { t: "p", h: "<code>memo(Component)</code> skips re-rendering when every prop is equal to last time, compared with <code>Object.is</code>. Strings and numbers compare by value. But objects, arrays and functions compare by <b>reference</b>: <code>{ a: 1 } !== { a: 1 }</code>, and a function defined in the component body is a <b>new</b> function every render. So memo alone often does nothing. Keep references stable with <code>useCallback</code> (functions) and <code>useMemo</code> (computed objects and values)." },
      { t: "rch", prompt: "Typing in the search box re-renders the slow <code>ProductList</code> every time. Make it render <b>only once</b> while typing: wrap it in <code>memo</code>, and keep its <code>onAdd</code> and <code>settings</code> props stable. Adding to the cart must still work.", files: { "App.jsx": PERF_START, "ProductList.jsx": PERF_LIST_START, "index.css": PERF_CSS }, solution: { "App.jsx": PERF_DONE, "ProductList.jsx": PERF_LIST_DONE }, tests: [
        { msg: "Typing doesn't re-render ProductList", fn: async (h) => { const before = h.$(".renders").textContent; await h.type("input", "m"); await h.type("input", "mo"); await h.type("input", "mou"); return h.$(".renders").textContent === before; } },
        { msg: "ProductList is wrapped in memo", fn: async (h) => /memo\(/.test(h.src("ProductList.jsx")) || /memo\(/.test(h.src("App.jsx")) },
        { msg: "Adding to the cart still works", fn: async (h) => { await h.click(h.button("Add Mouse")); await h.click(h.button("Add Webcam")); return /Cart: 2 items/.test(h.text()); } },
      ] },
      { t: "callout", kind: "warn", h: "Measure before optimising. Use the React DevTools Profiler to find slow renders. Most components are fast enough, and memoising everything adds complexity and memory for no benefit. (The React Compiler can now add this memoisation for you automatically.)" },
      { t: "h", h: "StrictMode" },
      { t: "p", h: "<code>&lt;StrictMode&gt;</code> in development renders components twice and runs effects twice (mount, unmount, mount). It exposes impure components and effects that are missing cleanup. If something breaks under StrictMode, it would also break in production in rarer situations." },
      { t: "h", h: "Code splitting with lazy and Suspense" },
      { t: "p", h: "Big apps ship big bundles. <code>lazy(() => import(\"./Chart\"))</code> splits a component into its own file that's downloaded only when it first renders, and <code>&lt;Suspense fallback={…}&gt;</code> shows something while it loads. Split by route or by rarely-used heavy features." },
      { t: "rplay", task: "Click the button: the Chart module is only loaded at that moment. Watch the console.", files: { "App.jsx": `import { lazy, Suspense, useState } from "react"

const Chart = lazy(() => {
  console.log("Downloading Chart…")
  return new Promise((resolve) => setTimeout(resolve, 800)).then(() => import("./Chart"))
})

export default function App() {
  const [show, setShow] = useState(false)
  return (
    <main style={{ fontFamily: "system-ui", padding: 20 }}>
      <button onClick={() => setShow(true)}>Show sales chart</button>
      {show && (
        <Suspense fallback={<p>Loading chart…</p>}>
          <Chart />
        </Suspense>
      )}
    </main>
  )
}
`, "Chart.jsx": `console.log("Chart module evaluated")

export default function Chart() {
  const data = [40, 75, 55, 90, 65]
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "end", height: 120, marginTop: 16 }}>
      {data.map((v, i) => <div key={i} style={{ width: 30, height: v + "%", background: "#6366f1", borderRadius: 4 }} />)}
    </div>
  )
}
` } },
      { t: "recap", items: ["Trigger → render → commit; children render with their parent", "memo skips renders when props are equal (Object.is)", "Objects and functions are new each render: useMemo / useCallback", "Profile first; don't memo everything", "StrictMode double-invokes to reveal bugs", "lazy + Suspense split code and show fallbacks"] },
    ]},

    { id: "ra-library", title: "Solo Project - Component Library", min: 120, kind: "solo", body: [
      { t: "p", h: "Build a small component library: the kind of reusable pieces a design system provides. Each component takes a few props, has sensible defaults, and is accessible out of the box." },
      { t: "steps", items: ["<b>Badge</b>: <code>color</code> (gray, red, green, blue; default gray) and <code>shape</code> (square or pill; default square)", "<b>Banner</b>: <code>status</code> (success, warning, error, neutral), a <code>title</code> and optional body text as children; errors use <code>role=\"alert\"</code>, others <code>role=\"status\"</code>", "Stretch: Card, Testimonial, Tooltip and Toast components, and a page that documents each one"] },
      { t: "rch", prompt: "Build <code>Badge</code> and <code>Banner</code> to the spec above, using the CSS classes in <code>index.css</code> (<code>badge badge-{color} badge-{shape}</code> and <code>banner banner-{status}</code>, with the title in an <code>h3</code> and children in a <code>p</code>, which is omitted when there are none).", files: { "App.jsx": LIB_APP, "Badge.jsx": `export default function Badge({ children }) {\n  return <span>{children}</span>\n}\n`, "Banner.jsx": `export default function Banner({ title, children }) {\n  return <div>{title}</div>\n}\n`, "index.css": LIB_CSS }, solution: { "Badge.jsx": BADGE_DONE, "Banner.jsx": BANNER_DONE }, tests: [
        { msg: "Badge defaults to gray and square", fn: async (h) => { const b = h.$$(".badge")[0]; return b && b.className.split(" ").sort().join(" ") === "badge badge-gray badge-square"; } },
        { msg: "Badge color and shape props", fn: async (h) => { const b = h.$$(".badge")[1]; return b && b.classList.contains("badge-red") && b.classList.contains("badge-pill") && b.textContent === "Overdue"; } },
        { msg: "Banner: status class, h3 title and p body", fn: async (h) => { const b = h.$(".banner-success"); return b && b.querySelector("h3").textContent === "Congratulations!" && /payment went through/.test(b.querySelector("p").textContent) && b.getAttribute("role") === "status"; } },
        { msg: "Error banner uses role=alert and has no empty p", fn: async (h) => { const b = h.$(".banner-error"); return b && b.getAttribute("role") === "alert" && !b.querySelector("p"); } },
      ] },
    ]},

    { id: "ra-routing", title: "Routing", min: 240, kind: "project", body: [
      { t: "h", h: "Multi-page vs single-page apps" },
      { t: "p", h: "In a traditional multi-page site, every link downloads a new HTML page. A <b>single-page app</b> loads once, then swaps components when the URL changes, without a full reload. <b>React Router</b> maps URLs to components and keeps the browser's back button, bookmarks and shareable links working." },
      { t: "code", lang: "bash", code: "npm install react-router-dom" },
      { t: "h", h: "BrowserRouter, Routes, Route and Link" },
      { t: "rplay", task: "Click the links and use the address bar above the preview: type <code>/about</code> and press Enter, then try the back button. Then add a <code>/vans</code> route that renders an <code>&lt;h1&gt;Vans page goes here&lt;/h1&gt;</code>.", router: true, files: { "App.jsx": ROUTER_APP_START, "pages/Home.jsx": HOME, "pages/About.jsx": ABOUT, "index.css": VAN_CSS } },
      { t: "callout", kind: "warn", h: "Use <code>&lt;Link to=\"/about\"&gt;</code>, not <code>&lt;a href=\"/about\"&gt;</code>. A plain link reloads the whole app and throws away its state." },
      { t: "h", h: "Route params" },
      { t: "p", h: "<code>&lt;Route path=\"/vans/:id\"&gt;</code> matches <code>/vans/1</code>, <code>/vans/2</code> and so on. Inside the component, <code>useParams()</code> returns <code>{ id: \"1\" }</code>. Note it's always a string." },
      { t: "rch", prompt: "Add a <code>/vans/:id</code> route for <code>VanDetail</code>, and make <code>VanDetail</code> read the id with <code>useParams</code>, fetch <code>" + API + "/vans/:id</code> (the van is in <code>data.vans</code>) and show its name in an <code>h1</code>, plus its price and description.", router: true, startPath: "/vans", api: true, files: { "App.jsx": PARAMS_APP_START, "pages/Home.jsx": HOME, "pages/About.jsx": ABOUT, "pages/Vans.jsx": VANS_PAGE, "pages/VanDetail.jsx": VAN_DETAIL_START, "index.css": VAN_CSS }, solution: { "App.jsx": PARAMS_APP_DONE, "pages/VanDetail.jsx": VAN_DETAIL_DONE }, tests: [
        { msg: "/vans lists the vans", fn: async (h) => !!(await h.until(() => h.$$(".van-tile").length === 6, 4000)) },
        { msg: "/vans/3 shows Reliable Red", fn: async (h) => { await h.navigate("/vans/3"); return !!(await h.until(() => /Reliable Red/.test(h.text("h1")), 4000)); } },
        { msg: "Clicking a van tile goes to its page", fn: async (h) => { await h.until(() => h.$$(".van-tile a").length, 4000); await h.click(h.$$(".van-tile a")[1]); const ok = h.path() === "/vans/2"; return ok && !!(await h.until(() => /Beach Bum/.test(h.text("h1")), 4000)); } },
        { msg: "Shows the price and description", fn: async (h) => { await h.navigate("/vans/5"); return !!(await h.until(() => /\$120/.test(h.text()) && /travel in comfort/.test(h.text()), 4000)); } },
        { msg: "Uses useParams", fn: async (h) => /useParams\(/.test(h.src("pages/VanDetail.jsx")) },
      ] },
      { t: "callout", kind: "tip", h: "Accessibility: when a whole card is a link, give the link a clear <code>aria-label</code> (\"View details for Beach Bum, $80 per day\"), otherwise a screen reader announces every bit of text inside it." },
      { t: "h", h: "Nested routes, layout routes and Outlet" },
      { t: "p", h: "Pages often share a frame: header, footer, a sub-navigation. A <b>layout route</b> renders that frame plus <code>&lt;Outlet /&gt;</code>, where the matching child route appears. Child paths are <b>relative</b> to their parent, and an <b>index route</b> is the child shown at the parent's own path." },
      { t: "code", lang: "jsx", code: `<Route path="/" element={<Layout />}>
  <Route index element={<Home />} />            {/* "/" */}
  <Route path="vans" element={<Vans />} />      {/* "/vans" */}
  <Route path="host" element={<HostLayout />}>
    <Route index element={<Dashboard />} />     {/* "/host" */}
    <Route path="income" element={<Income />} />{/* "/host/income" */}
  </Route>
</Route>` },
      { t: "p", h: "<code>&lt;NavLink&gt;</code> is a Link that knows if it's active: it gets the <code>active</code> class and <code>aria-current=\"page\"</code>. Use <code>end</code> on a link to an index route, or <code>/host</code> would stay active on <code>/host/income</code> too." },
      { t: "rch", prompt: "Restructure VanLife with nested routes: <code>Layout</code> (header with <b>NavLink</b>s, <code>&lt;Outlet /&gt;</code>, footer) wraps every page; <code>/host</code> uses <code>HostLayout</code> with an index <b>Dashboard</b> and child routes <b>income</b> and <b>reviews</b>, and a host nav where <b>Dashboard</b> is only active on <code>/host</code> exactly.", router: true, startPath: "/", api: true, files: { "App.jsx": NESTED_APP_START, "components/Layout.jsx": LAYOUT_START, "components/HostLayout.jsx": HOST_LAYOUT_START, "pages/Home.jsx": HOME, "pages/About.jsx": ABOUT, "pages/Vans.jsx": VANS_PAGE, ...HOST_PAGES, "index.css": VAN_CSS }, solution: { "App.jsx": NESTED_APP_DONE, "components/Layout.jsx": LAYOUT_DONE, "components/HostLayout.jsx": HOST_LAYOUT_DONE }, tests: [
        { msg: "Every page has the header and footer", fn: async (h) => { const ok1 = !!h.$("header") && !!h.$("footer") && /travel vans/.test(h.text("h1")); await h.navigate("/about"); return ok1 && !!h.$("header") && !!h.$("footer") && /sedan/.test(h.text("h1")); } },
        { msg: "/host shows the Dashboard inside HostLayout", fn: async (h) => { await h.navigate("/host"); return /Dashboard goes here/.test(h.text()) && !!h.$(".host-nav") && !!h.$("footer"); } },
        { msg: "/host/income and /host/reviews work", fn: async (h) => { await h.navigate("/host/income"); const a = /Income goes here/.test(h.text()); await h.navigate("/host/reviews"); return a && /Reviews go here/.test(h.text()) && !/Dashboard goes here/.test(h.text()); } },
        { msg: "Clicking nav links navigates without a reload", fn: async (h) => { const host = h.$$("header nav a").find((a) => a.textContent === "Host"); await h.click(host); const a = h.path() === "/host"; await h.click(h.$$(".host-nav a").find((x) => x.textContent === "Income")); return a && h.path() === "/host/income"; } },
        { msg: "Active links: Host stays active on /host/income, Dashboard doesn't", fn: async (h) => { await h.navigate("/host/income"); const host = h.$$("header nav a").find((a) => a.textContent === "Host"); const dash = h.$$(".host-nav a").find((a) => a.textContent === "Dashboard"); const inc = h.$$(".host-nav a").find((a) => a.textContent === "Income"); return host.classList.contains("active") && !dash.classList.contains("active") && inc.getAttribute("aria-current") === "page"; } },
      ] },
      { t: "h", h: "Search params" },
      { t: "p", h: "Filters, sorting and pagination belong in the URL's <b>query string</b> (<code>/vans?type=rugged</code>), so the filtered view can be bookmarked and shared, and the back button undoes a filter. <code>useSearchParams()</code> works like <code>useState</code> for the query string." },
      { t: "code", lang: "jsx", code: `const [searchParams, setSearchParams] = useSearchParams()
const typeFilter = searchParams.get("type")      // "rugged" or null

setSearchParams({ type: "rugged" })               // replaces all params
setSearchParams(prev => { prev.set("type", "simple"); return prev })  // keeps the others
<Link to="?type=luxury">Luxury</Link>              // links work too` },
      { t: "rch", prompt: "Filter VanLife by type with search params: buttons for <b>Simple</b>, <b>Luxury</b> and <b>Rugged</b> set <code>?type=…</code> (and get the <code>selected</code> class when active); a <b>Clear filters</b> button removes the param and only shows when filtering; the list shows only matching vans.", router: true, startPath: "/vans", api: true, files: { "App.jsx": FILTER_APP, "pages/Vans.jsx": FILTER_START, "index.css": VAN_CSS }, solution: { "pages/Vans.jsx": FILTER_DONE }, tests: [
        { msg: "Clicking Rugged sets ?type=rugged and filters", fn: async (h) => { await h.until(() => h.$$(".van-tile").length === 6, 4000); await h.click(h.button("Rugged")); return h.path() === "/vans?type=rugged" && h.$$(".van-tile").length === 2 && h.$$(".van-type").every((x) => x.textContent === "rugged"); } },
        { msg: "Opening /vans?type=luxury directly is filtered", fn: async (h) => { await h.navigate("/vans?type=luxury"); return !!(await h.until(() => h.$$(".van-tile").length === 2 && /luxury/.test(h.$(".van-type").textContent), 4000)); } },
        { msg: "The active filter has the selected class", fn: async (h) => { await h.navigate("/vans?type=simple"); const b = h.button("Simple"); return b && b.classList.contains("selected") && !h.button("Luxury").classList.contains("selected"); } },
        { msg: "Clear filters only shows when filtered, and clears", fn: async (h) => { const none = !h.button("Clear filters"); await h.until(() => h.$$(".van-tile").length === 6, 4000); await h.click(h.button("Simple")); await h.click(h.button("Clear filters")); return none && h.path() === "/vans" && h.$$(".van-tile").length === 6; } },
        { msg: "The back button undoes a filter", fn: async (h) => { await h.until(() => h.$$(".van-tile").length === 6, 4000); await h.click(h.button("Luxury")); await h.back(); return h.path() === "/vans" && h.$$(".van-tile").length === 6; } },
      ] },
      { t: "quiz", q: "Which URL should a 'sort by price' option change?", opts: ["/vans/sort/price", "/vans?sort=price", "Nothing: keep it in component state"], a: 1, why: "Sorting and filtering are views of the same resource, so they belong in search params. That keeps them shareable and back-button friendly." },
      { t: "recap", items: ["BrowserRouter → Routes → Route path + element", "Link (and NavLink for active states), never plain a tags", "useParams for :params (always strings)", "Layout routes + Outlet share frames; index routes are the default child", "Relative paths in nested routes; NavLink end for index links", "useSearchParams keeps filters in the URL"] },
    ]},

    { id: "ra-persist", title: "Persistence", min: 120, kind: "project", body: [
      { t: "p", h: "Real apps keep data in a database. <b>Supabase</b> gives you a hosted Postgres database with an auto-generated API, auth, realtime and storage, and <code>supabase-js</code> lets your React app query it directly. Security comes from <b>row level security</b> policies in the database, which you'll add in the next lesson." },
      { t: "h", h: "Project setup and querying" },
      { t: "code", lang: "bash", code: `npm install @supabase/supabase-js
# .env.local (the anon key is public; RLS policies protect the data)
VITE_SUPABASE_URL=https://xyzcompany.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...` },
      { t: "code", lang: "javascript", code: `const { data, error } = await supabase
  .from("sales_deals")
  .select("name, value")       // columns, like SELECT name, value
  .eq("name", "Alice")          // WHERE name = 'Alice'
  .order("value", { ascending: false })

// Aggregates: total value per rep, like GROUP BY name
await supabase.from("sales_deals").select("name, value.sum()")
// → [{ name: "Alice", sum: 19500 }, …]` },
      { t: "callout", kind: "key", h: "supabase-js never throws for a failed query. It returns <code>{ data, error }</code>, so always check <code>error</code>." },
      { t: "h", h: "Realtime subscriptions" },
      { t: "p", h: "Instead of polling, subscribe to changes: Supabase pushes inserts, updates and deletes to every connected client over a websocket. Unsubscribe in the effect's cleanup." },
      { t: "rch", prompt: "Build the sales dashboard: <code>fetchMetrics</code> loads <code>\"name, value.sum()\"</code> from <code>sales_deals</code> into state; subscribe to <code>INSERT</code>s on <code>sales_deals</code> and re-fetch (removing the channel on cleanup); and make the form insert a deal (with <code>value</code> as a number) and show any error.", supabase: SALES_SEED, files: { "App.jsx": DASH_START, "supabase-client.js": SB_CLIENT, "index.css": DASH_CSS }, solution: { "App.jsx": DASH_DONE }, tests: [
        { msg: "Shows the total per rep (Alice $19,500)", fn: async (h) => !!(await h.until(() => h.$$(".bar-row").length === 3 && /Alice\s*\$19,500/.test(h.text(".chart")), 3000)) },
        { msg: "Adding a deal updates the chart via realtime", fn: async (h) => { await h.until(() => h.$$(".bar-row").length === 3, 3000); h.$("select").value = "Bob"; await h.type("input[name=value]", "1000"); await h.submit("form"); return !!(await h.until(() => /Bob\s*\$13,200/.test(h.text(".chart")), 3000)); } },
        { msg: "The new row is stored with a numeric value", fn: async (h) => { await h.until(() => h.$$(".bar-row").length === 3, 3000); await h.type("input[name=value]", "250"); await h.submit("form"); await h.until(() => h.db().tables.sales_deals.length === 7, 3000); const r = h.db().tables.sales_deals[6]; return r && r.value === 250 && r.name === "Alice"; } },
        { msg: "Subscribes with a channel and removes it on cleanup", fn: async (h) => /\.channel\(/.test(h.src("App.jsx")) && /postgres_changes/.test(h.src("App.jsx")) && /removeChannel|unsubscribe/.test(h.src("App.jsx")) },
      ] },
      { t: "callout", kind: "tip", h: "The lab's database lives in memory and resets when the preview reloads. Open the app in two tabs against a real Supabase project and you'll see realtime updates arrive from the other tab." },
      { t: "recap", items: ["createClient(url, anonKey) once, import it everywhere", "from(table).select(...).eq(...).order(...)", "Aggregates: \"name, value.sum()\" groups by name", "Always check error; queries don't throw", "channel().on(\"postgres_changes\", …).subscribe(); removeChannel in cleanup"] },
    ]},

    { id: "ra-auth", title: "Authentication", min: 150, kind: "project", body: [
      { t: "h", h: "Sessions and JSON Web Tokens" },
      { t: "p", h: "When a user signs in, Supabase returns a <b>session</b> containing an <b>access token</b>: a JSON Web Token (JWT). A JWT is three base64url parts, <code>header.payload.signature</code>. The payload holds claims like the user id (<code>sub</code>), email and expiry (<code>exp</code>). Anyone can <b>read</b> it, but only the server can <b>sign</b> it, so the database can trust who you are without storing a session." },
      { t: "jsch", fn: "decodeJwt", prompt: "Write <code>decodeJwt(token)</code> that returns the payload object of a JWT. Take the middle part, convert base64url to base64 (<code>-</code> → <code>+</code>, <code>_</code> → <code>/</code>, pad with <code>=</code> to a multiple of 4), decode with <code>atob</code> and <code>JSON.parse</code> it.", starter: `function decodeJwt(token) {

}`, solution: `function decodeJwt(token) {
  let part = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")
  while (part.length % 4) part += "="
  return JSON.parse(atob(part))
}`, tests: [
        { msg: "Decodes the payload", fn: (f) => { const p = f("eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1LTEyMyIsImVtYWlsIjoiYWRhQGV4YW1wbGUuY29tIiwiZXhwIjoxOTAwMDAwMDAwfQ.sig"); return p.sub === "u-123" && p.email === "ada@example.com" && p.exp === 1900000000; } },
        { msg: "Handles base64url characters and missing padding", fn: (f) => { const payload = { name: "Zoë?>", n: 1 }; const enc = btoa(unescape(encodeURIComponent(JSON.stringify(payload)))).replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_"); const r = f("x." + enc + ".y"); return r.n === 1; } },
      ] },
      { t: "callout", kind: "warn", h: "Decoding isn't verifying. Never trust a JWT's claims in the browser for security decisions: the server and database verify the signature. Client-side checks only decide what to <b>show</b>." },
      { t: "h", h: "Auth context, sign in and protected routes" },
      { t: "p", h: "Keep the session in an <code>AuthProvider</code> context so every component knows who's signed in. Load the current session on start, then listen with <code>onAuthStateChange</code> so sign-ins and sign-outs anywhere update the UI. A <b>protected route</b> renders its children only when there's a session and otherwise redirects with <code>&lt;Navigate&gt;</code>." },
      { t: "rch", prompt: "Wire up auth: in <code>AuthContext</code>, load the session and keep it in sync with <code>onAuthStateChange</code> (unsubscribing on cleanup), and implement <code>signIn</code> and <code>signOut</code>; make <code>ProtectedRoute</code> show <code>Loading…</code> while checking and redirect to <code>/signin</code> without a session; make <code>SignIn</code> show errors and navigate home on success. Test user: <code>alice@acme.dev</code> / <code>password123</code>.", router: true, startPath: "/", supabase: AUTH_SEED, files: { "App.jsx": AUTH_APP_START, "AuthContext.jsx": AUTH_CONTEXT_START, "SignIn.jsx": SIGNIN_START, "Dashboard.jsx": AUTH_DASH, "supabase-client.js": SB_CLIENT, "index.css": AUTH_CSS }, solution: { "App.jsx": AUTH_APP_DONE, "AuthContext.jsx": AUTH_CONTEXT_DONE, "SignIn.jsx": SIGNIN_DONE }, tests: [
        { msg: "Signed out, / redirects to /signin", fn: async (h) => !!(await h.until(() => h.path() === "/signin" && !!h.$("input[name=email]"), 3000)) },
        { msg: "Wrong password shows the error", fn: async (h) => { await h.until(() => h.$("input[name=email]"), 3000); await h.type("input[name=email]", "alice@acme.dev"); await h.type("input[name=password]", "nope"); await h.submit("form"); return !!(await h.until(() => /Invalid login credentials/.test(h.text("[role=alert]")), 3000)); } },
        { msg: "Signing in goes to the dashboard with the user's email", fn: async (h) => { await h.until(() => h.$("input[name=email]"), 3000); await h.type("input[name=email]", "alice@acme.dev"); await h.type("input[name=password]", "password123"); await h.submit("form"); return !!(await h.until(() => h.path() === "/" && /Signed in as alice@acme.dev/.test(h.text()), 3000)); } },
        { msg: "Signing out sends you back to /signin", fn: async (h) => { await h.until(() => h.$("input[name=email]"), 3000); await h.type("input[name=email]", "bob@acme.dev"); await h.type("input[name=password]", "password123"); await h.submit("form"); await h.until(() => h.button("Sign out"), 3000); await h.click(h.button("Sign out")); return !!(await h.until(() => h.path() === "/signin", 3000)); } },
        { msg: "Uses onAuthStateChange and unsubscribes", fn: async (h) => /onAuthStateChange/.test(h.src("AuthContext.jsx")) && /unsubscribe\(\)/.test(h.src("AuthContext.jsx")) },
      ] },
      { t: "h", h: "Row level security" },
      { t: "p", h: "The anon key is in your frontend, so anyone can call your database API. <b>Row level security (RLS)</b> policies decide, row by row, what each user may do, based on the verified JWT. Without RLS, any visitor could read or edit everything." },
      { t: "code", lang: "sql", code: `alter table sales_deals enable row level security;

-- everyone signed in can read all deals (for the team dashboard)
create policy "read deals" on sales_deals for select to authenticated using (true);

-- reps can only insert deals as themselves
create policy "insert own deals" on sales_deals for insert to authenticated
  with check (auth.uid() = user_id);

-- default the owner to the signed-in user
alter table sales_deals alter column user_id set default auth.uid();` },
      { t: "p", h: "<b>Profiles</b>: Supabase keeps users in <code>auth.users</code>. Store public details (name, account type) in a <code>profiles</code> table with the same id, created automatically by a database <b>trigger</b> when someone signs up. Pass extra fields like the name in <code>signUp({ email, password, options: { data: { name } } })</code>." },
      { t: "rplay", task: "This app has RLS on <code>sales_deals</code>. Sign in as alice@acme.dev / password123 and add a deal: it's stored with Alice's user id. Then try the console: an insert claiming another user's id fails with a policy error.", router: true, supabase: AUTH_SEED, files: { "App.jsx": `import { useEffect, useState } from "react"
import { supabase } from "./supabase-client"

export default function App() {
  const [session, setSession] = useState(null)
  const [deals, setDeals] = useState([])
  const [msg, setMsg] = useState("")

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => data.subscription.unsubscribe()
  }, [])

  useEffect(() => { load() }, [session])

  async function load() {
    const { data, error } = await supabase.from("sales_deals").select("*").order("id", { ascending: false }).limit(4)
    setDeals(error ? [] : data)
    if (error) setMsg(error.message)
  }

  async function signIn() {
    const { error } = await supabase.auth.signInWithPassword({ email: "alice@acme.dev", password: "password123" })
    setMsg(error ? error.message : "")
  }

  async function addDeal(asSomeoneElse) {
    const row = { name: "Alice", value: 500 }
    if (asSomeoneElse) row.user_id = "u-bob"
    const { error } = await supabase.from("sales_deals").insert(row)
    setMsg(error ? "❌ " + error.message : "✅ inserted")
    load()
  }

  return (
    <main>
      <p>{session ? "Signed in as " + session.user.email + " (id " + session.user.id + ")" : "Signed out"}</p>
      {!session ? <button onClick={signIn}>Sign in as Alice</button> : <>
        <button onClick={() => addDeal(false)}>Add my deal</button>{" "}
        <button onClick={() => addDeal(true)}>Add a deal as Bob</button>{" "}
        <button onClick={() => supabase.auth.signOut()}>Sign out</button>
      </>}
      <p role="status">{msg}</p>
      <ul>{deals.map((d) => <li key={d.id}>#{d.id} {d.name}: \${d.value} (user {d.user_id})</li>)}</ul>
    </main>
  )
}
`, "supabase-client.js": SB_CLIENT, "index.css": AUTH_CSS } },
      { t: "quiz", q: "Your React app hides the 'Delete deal' button from non-admins. Is the data safe?", opts: ["Yes, they can't click it", "No: anyone can call the API directly; enforce it with an RLS policy in the database", "Yes, because the anon key is secret"], a: 1, why: "UI checks are for convenience. The anon key is public, so authorization must be enforced server-side, which in Supabase means RLS policies." },
      { t: "recap", items: ["Sessions carry a signed JWT: readable by anyone, trusted only after verification", "AuthProvider + getSession + onAuthStateChange keep the UI in sync", "ProtectedRoute: loading state, then Navigate to /signin", "RLS policies with auth.uid() protect rows; the anon key is public", "Profiles table + signup trigger for public user details"] },
    ]},
  ],
};
