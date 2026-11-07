/* Module — Next.js. Lesson titles match the syllabus.
   Labs run in the Next.js lab (src/lib/nextLab.js): App Router file routing, layouts, server and client
   components, next/link, next/navigation, next/image, next/font, next/form, loading.tsx and better-sqlite3. */

const API = "https://api.shipyard.dev";

const svgImg = (bg, fg, label) => "data:image/svg+xml," + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="400" height="300" fill="${bg}"/><g fill="none" stroke="${fg}" stroke-width="6" stroke-linejoin="round"><path d="M200 70l80 45v90l-80 45-80-45v-90z"/><path d="M120 115l80 45 80-45M200 160v90"/></g><text x="200" y="285" text-anchor="middle" font-family="system-ui" font-size="18" fill="${fg}">${label}</text></svg>`);

/* PrintForge data: 3D printing models */
const MODELS = [
  [1, "Articulated Dragon", "A fully articulated dragon that prints in place, with moving joints from head to tail.", "toys", 812, "#fde68a", "#92400e"],
  [2, "Cable Organizer Clip", "Keep your desk tidy with snap-on clips for USB and charging cables.", "office", 344, "#bfdbfe", "#1e3a8a"],
  [3, "Geometric Planter", "A low-poly succulent planter with a hidden drainage tray.", "home", 529, "#bbf7d0", "#14532d"],
  [4, "Phone Stand", "An adjustable phone stand for video calls and recipes in the kitchen.", "office", 455, "#e9d5ff", "#581c87"],
  [5, "Flexi Octopus", "A wiggly octopus with print-in-place tentacles. Kids love it.", "toys", 690, "#fecaca", "#7f1d1d"],
  [6, "Spice Jar Rack", "A wall-mounted rack that holds twelve standard spice jars.", "home", 213, "#fed7aa", "#7c2d12"],
  [7, "Planetary Gear Fidget", "A satisfying fidget toy with a working planetary gearbox.", "toys", 377, "#c7d2fe", "#312e81"],
  [8, "Headphone Hook", "An under-desk hook to hang your headphones out of the way.", "office", 158, "#e5e7eb", "#111827"],
];
const CATEGORIES = [["toys", "Toys"], ["office", "Office"], ["home", "Home"]];

const MODELS_TS = `export type Model = {
  id: number
  name: string
  description: string
  category: string
  likes: number
  image: string
}

const img = (bg: string, fg: string, label: string) => "${svgImg("BG", "FG", "LABEL").replace(/BG|FG|LABEL/g, (m) => "\" + " + ({ BG: "encodeURIComponent(bg)", FG: "encodeURIComponent(fg)", LABEL: "encodeURIComponent(label)" })[m] + " + \"")}"

export const models: Model[] = [
${MODELS.map(([id, name, desc, cat, likes, bg, fg]) => `  { id: ${id}, name: ${JSON.stringify(name)}, description: ${JSON.stringify(desc)}, category: "${cat}", likes: ${likes}, image: img("${bg}", "${fg}", ${JSON.stringify(name)}) },`).join("\n")}
]

export const categories = [
${CATEGORIES.map(([slug, name]) => `  { slug: "${slug}", displayName: "${name}" },`).join("\n")}
]

export async function getModels(): Promise<Model[]> {
  return models
}

export async function getModelById(id: string | number): Promise<Model | undefined> {
  return models.find((m) => m.id === Number(id))
}
`;

const DB_SQL = `CREATE TABLE categories (
  slug TEXT PRIMARY KEY,
  display_name TEXT NOT NULL
);
INSERT INTO categories (slug, display_name) VALUES
${CATEGORIES.map(([s, n]) => `  ('${s}', '${n}')`).join(",\n")};

CREATE TABLE models (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL REFERENCES categories(slug),
  likes INTEGER NOT NULL DEFAULT 0,
  date_added TEXT NOT NULL
);
INSERT INTO models (id, name, description, category, likes, date_added) VALUES
${MODELS.map(([id, name, desc, cat, likes], i) => `  (${id}, '${name.replace(/'/g, "''")}', '${desc.replace(/'/g, "''")}', '${cat}', ${likes}, '2026-0${1 + (i % 9)}-1${i}')`).join(",\n")};
`;

const CSS = `* { box-sizing: border-box; }
body { margin: 0; background: #fafaf9; color: #1c1917; }
a { color: inherit; }
.navbar { display: flex; align-items: center; justify-content: space-between; padding: 14px 24px; background: #fff; border-bottom: 1px solid #e7e5e4; }
.navbar .logo { font-weight: 900; font-size: 20px; text-decoration: none; letter-spacing: -.02em; }
.navbar nav { display: flex; gap: 16px; }
.navbar nav a { text-decoration: none; color: #57534e; font-weight: 600; }
.navbar nav a.active, .cats a.active { color: #ea580c; text-decoration: underline; }
main { padding: 24px; max-width: 900px; margin: 0 auto; }
.hero { padding: 40px 0; } .hero h1 { font-size: 40px; margin: 0 0 12px; letter-spacing: -.03em; }
.cta { display: inline-block; background: #ea580c; color: #fff; padding: 10px 18px; border-radius: 999px; text-decoration: none; font-weight: 700; }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 16px; }
.card { display: block; background: #fff; border: 1px solid #e7e5e4; border-radius: 12px; overflow: hidden; text-decoration: none; }
.card img { width: 100%; height: auto; display: block; }
.card h2 { font-size: 16px; margin: 10px 12px 4px; } .card p { margin: 0 12px 12px; font-size: 13px; color: #78716c; }
.likes { font-size: 13px; color: #78716c; }
.cats { display: flex; gap: 14px; margin-bottom: 16px; flex-wrap: wrap; }
.cats a { text-decoration: none; color: #57534e; font-weight: 600; }
.toolbar { display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap; align-items: center; }
.toolbar input { padding: 8px 12px; border: 1px solid #d6d3d1; border-radius: 999px; font: inherit; }
.toolbar button { padding: 7px 12px; border: 1px solid #d6d3d1; background: #fff; border-radius: 999px; font: inherit; cursor: pointer; }
.toolbar button.on { background: #1c1917; color: #fff; }
.pending { opacity: .5; transition: opacity .2s; }
.skeleton { height: 220px; border-radius: 12px; background: linear-gradient(90deg,#eee,#f5f5f5,#eee); }
footer { padding: 20px; text-align: center; color: #a8a29e; }`;

const LAYOUT_BASE = `import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "PrintForge",
  description: "A community for 3D printing models",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
`;
const HOME_START = `export default function HomePage() {
  return <main>Hello, PrintForge</main>
}
`;
const HOME_DONE = `import Link from "next/link"

export default function HomePage() {
  return (
    <main>
      <section className="hero">
        <h1>Discover what's possible with 3D printing</h1>
        <p>Join our community of creators and explore a library of models designed by makers like you.</p>
        <Link className="cta" href="/3d-models">Browse models</Link>
      </section>
    </main>
  )
}
`;
const ABOUT_DONE = `export const metadata = { title: "About · PrintForge" }

export default function AboutPage() {
  return (
    <main>
      <h1>About PrintForge</h1>
      <p>PrintForge is where makers share 3D printing models with each other, for free.</p>
    </main>
  )
}
`;
const NAVBAR_DONE = `import Link from "next/link"

export default function Navbar() {
  return (
    <header className="navbar">
      <Link className="logo" href="/">PrintForge</Link>
      <nav>
        <Link href="/3d-models">3D Models</Link>
        <Link href="/about">About</Link>
      </nav>
    </header>
  )
}
`;
const LAYOUT_WITH_NAV = LAYOUT_BASE.replace('import "./globals.css"', 'import "./globals.css"\nimport Navbar from "@/components/Navbar"').replace("<body>{children}</body>", "<body>\n        <Navbar />\n        {children}\n      </body>");
const LAYOUT_FONT = LAYOUT_WITH_NAV.replace('import Navbar from "@/components/Navbar"', 'import Navbar from "@/components/Navbar"\nimport { Albert_Sans } from "next/font/google"\n\nconst albertSans = Albert_Sans({ subsets: ["latin"], display: "swap" })').replace("<html lang=\"en\">", "<html lang=\"en\" className={albertSans.className}>");

const MODEL_CARD = `import Link from "next/link"
import Image from "next/image"
import type { Model } from "@/lib/models"

export default function ModelCard({ model }: { model: Model }) {
  return (
    <Link className="card" href={\`/3d-models/\${model.id}\`}>
      <Image src={model.image} alt={model.name} width={400} height={300} />
      <h2>{model.name}</h2>
      <p className="likes">♥ {model.likes}</p>
    </Link>
  )
}
`;
const MODELS_PAGE_START = `// Server Component: it can be async and read data directly
export default async function ModelsPage() {
  // get the models from @/lib/models and render a ModelCard for each inside <div className="grid">
  return (
    <main>
      <h1>3D Models</h1>
    </main>
  )
}
`;
const MODELS_PAGE_DONE = `import { getModels } from "@/lib/models"
import ModelCard from "@/components/ModelCard"

export default async function ModelsPage() {
  const models = await getModels()
  return (
    <main>
      <h1>3D Models</h1>
      <div className="grid">
        {models.map((model) => <ModelCard key={model.id} model={model} />)}
      </div>
    </main>
  )
}
`;
const DETAIL_DONE = `import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { getModelById } from "@/lib/models"

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const model = await getModelById(id)
  return { title: model ? \`\${model.name} · PrintForge\` : "Not found" }
}

export default async function ModelDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const model = await getModelById(id)
  if (!model) notFound()

  return (
    <main>
      <Link href="/3d-models">← All models</Link>
      <h1>{model.name}</h1>
      <Image src={model.image} alt={model.name} width={400} height={300} priority />
      <p>{model.description}</p>
      <p className="likes">♥ {model.likes} likes · {model.category}</p>
    </main>
  )
}
`;
const BUILD_BASE = { "app/layout.tsx": LAYOUT_WITH_NAV, "app/globals.css": CSS, "app/page.tsx": HOME_DONE, "app/about/page.tsx": ABOUT_DONE, "components/Navbar.tsx": NAVBAR_DONE, "lib/models.ts": MODELS_TS };

/* ── rendering + client components ── */
const NAVLINK_DONE = `"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export default function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname()
  const isActive = pathname === href || pathname.startsWith(href + "/")
  return (
    <Link href={href} className={isActive ? "active" : ""} aria-current={isActive ? "page" : undefined}>
      {children}
    </Link>
  )
}
`;
const NAVBAR_ACTIVE_START = `import Link from "next/link"
import { usePathname } from "next/navigation"

export default function Navbar() {
  const pathname = usePathname()
  return (
    <header className="navbar">
      <Link className="logo" href="/">PrintForge</Link>
      <nav>
        <Link href="/3d-models" className={pathname.startsWith("/3d-models") ? "active" : ""}>3D Models</Link>
        <Link href="/about" className={pathname === "/about" ? "active" : ""}>About</Link>
      </nav>
    </header>
  )
}
`;
const NAVBAR_ACTIVE_DONE = `import Link from "next/link"
import NavLink from "@/components/NavLink"

// Navbar stays a Server Component; only the small NavLink needs the browser
export default function Navbar() {
  return (
    <header className="navbar">
      <Link className="logo" href="/">PrintForge</Link>
      <nav>
        <NavLink href="/3d-models">3D Models</NavLink>
        <NavLink href="/about">About</NavLink>
      </nav>
    </header>
  )
}
`;
const CATFACTS = `// Rendering strategy demo. Change "force-cache" to "no-store" and reload.
export const dynamic = "auto"

export default async function CatFactsPage() {
  console.log("Rendering /catfacts on the server at", new Date().toLocaleTimeString())
  const res = await fetch("${API}/catfacts?limit=3", { cache: "force-cache" })
  const { data, fetchedAt } = await res.json()
  return (
    <main>
      <h1>🐱 Cat facts</h1>
      <ul>{data.map((f: { fact: string }) => <li key={f.fact}>{f.fact}</li>)}</ul>
      <p className="likes">Fetched at {new Date(fetchedAt).toLocaleTimeString()}</p>
    </main>
  )
}
`;
const SEARCH_FORM_START = `// Use next/form so submitting goes to /3d-models?query=… without a full page reload
export default function SearchForm() {
  return (
    <form className="toolbar">
      <input type="search" placeholder="Search models…" aria-label="Search models" />
      <button>Search</button>
    </form>
  )
}
`;
const SEARCH_FORM_DONE = `import Form from "next/form"

export default function SearchForm({ defaultValue = "" }: { defaultValue?: string }) {
  return (
    <Form action="/3d-models" className="toolbar">
      <input type="search" name="query" defaultValue={defaultValue} placeholder="Search models…" aria-label="Search models" />
      <button>Search</button>
    </Form>
  )
}
`;
const SEARCH_PAGE_START = `import { getModels } from "@/lib/models"
import ModelCard from "@/components/ModelCard"
import SearchForm from "@/components/SearchForm"

export default async function ModelsPage({ searchParams }: { searchParams: Promise<{ query?: string }> }) {
  const models = await getModels()
  // read query from searchParams and keep only models whose name or description includes it (case-insensitive)
  return (
    <main>
      <h1>3D Models</h1>
      <SearchForm />
      <div className="grid">
        {models.map((model) => <ModelCard key={model.id} model={model} />)}
      </div>
    </main>
  )
}
`;
const SEARCH_PAGE_DONE = `import { getModels } from "@/lib/models"
import ModelCard from "@/components/ModelCard"
import SearchForm from "@/components/SearchForm"

export default async function ModelsPage({ searchParams }: { searchParams: Promise<{ query?: string }> }) {
  const { query = "" } = await searchParams
  const q = query.toLowerCase()
  const models = (await getModels()).filter((m) => m.name.toLowerCase().includes(q) || m.description.toLowerCase().includes(q))
  return (
    <main>
      <h1>{query ? \`Results for "\${query}"\` : "3D Models"}</h1>
      <SearchForm defaultValue={query} />
      {models.length === 0 && <p>No models match "{query}".</p>}
      <div className="grid">
        {models.map((model) => <ModelCard key={model.id} model={model} />)}
      </div>
    </main>
  )
}
`;

/* ── data flow with SQLite ── */
const DB_TS = `import "server-only"
import Database from "better-sqlite3"

export const db = new Database("printforge.db")
`;
const DATA_MODELS_START = `import { db } from "@/lib/db"

export type Model = {
  id: number
  name: string
  description: string
  category: string
  likes: number
  date_added: string
}
export type Category = { slug: string; display_name: string }

export type SortBy = "popular" | "newest" | "name"
type GetModelsOptions = { category?: string; query?: string; sort?: SortBy }

export function getCategories(): Category[] {
  return db.prepare("SELECT slug, display_name FROM categories ORDER BY display_name").all() as Category[]
}

export function getModels({ category, query, sort = "popular" }: GetModelsOptions = {}): Model[] {
  // Build the SQL: optional WHERE category = ?, optional search on name OR description (LIKE),
  // and ORDER BY likes DESC (popular), date_added DESC (newest) or name ASC (name).
  // Always pass values as ? parameters, never inside the SQL string.
  return db.prepare("SELECT * FROM models").all() as Model[]
}

export function getModelById(id: number): Model | undefined {
  return db.prepare("SELECT * FROM models WHERE id = ?").get(id) as Model | undefined
}
`;
const DATA_MODELS_DONE = `import { db } from "@/lib/db"

export type Model = {
  id: number
  name: string
  description: string
  category: string
  likes: number
  date_added: string
}
export type Category = { slug: string; display_name: string }

export type SortBy = "popular" | "newest" | "name"
type GetModelsOptions = { category?: string; query?: string; sort?: SortBy }

const ORDER: Record<SortBy, string> = {
  popular: "likes DESC",
  newest: "date_added DESC",
  name: "name ASC",
}

export function getCategories(): Category[] {
  return db.prepare("SELECT slug, display_name FROM categories ORDER BY display_name").all() as Category[]
}

export function getModels({ category, query, sort = "popular" }: GetModelsOptions = {}): Model[] {
  const where: string[] = []
  const params: string[] = []
  if (category) {
    where.push("category = ?")
    params.push(category)
  }
  if (query) {
    where.push("(name LIKE ? OR description LIKE ?)")
    params.push(\`%\${query}%\`, \`%\${query}%\`)
  }
  const sql = \`SELECT * FROM models \${where.length ? "WHERE " + where.join(" AND ") : ""} ORDER BY \${ORDER[sort] ?? ORDER.popular}\`
  return db.prepare(sql).all(...params) as Model[]
}

export function getModelById(id: number): Model | undefined {
  return db.prepare("SELECT * FROM models WHERE id = ?").get(id) as Model | undefined
}
`;
const DATA_CARD = `import Link from "next/link"
import type { Model } from "@/lib/models"

export default function ModelCard({ model }: { model: Model }) {
  return (
    <Link className="card" href={\`/3d-models/\${model.id}\`}>
      <h2>{model.name}</h2>
      <p>{model.description}</p>
      <p className="likes">♥ {model.likes} · {model.category}</p>
    </Link>
  )
}
`;
const SORT_START = `"use client"

import { useTransition } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

const OPTIONS = [["popular", "Most liked"], ["newest", "Newest"], ["name", "A–Z"]] as const

export default function SortButtons() {
  // read the current sort from the URL (default "popular"),
  // and on click push the same path with ?sort=… (keeping any query param), inside startTransition
  return (
    <div className="toolbar" role="group" aria-label="Sort models">
      {OPTIONS.map(([value, label]) => (
        <button key={value}>{label}</button>
      ))}
    </div>
  )
}
`;
const SORT_DONE = `"use client"

import { useTransition } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

const OPTIONS = [["popular", "Most liked"], ["newest", "Newest"], ["name", "A–Z"]] as const

export default function SortButtons() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const current = searchParams.get("sort") ?? "popular"

  function sortBy(value: string) {
    const params = new URLSearchParams(searchParams)
    params.set("sort", value)
    startTransition(() => router.push(\`\${pathname}?\${params.toString()}\`))
  }

  return (
    <div className={"toolbar" + (isPending ? " pending" : "")} role="group" aria-label="Sort models" aria-busy={isPending}>
      {OPTIONS.map(([value, label]) => (
        <button key={value} className={current === value ? "on" : ""} aria-pressed={current === value} onClick={() => sortBy(value)}>{label}</button>
      ))}
    </div>
  )
}
`;
const DATA_PAGE_START = `import { getModels, type SortBy } from "@/lib/models"
import ModelCard from "@/components/ModelCard"
import SortButtons from "@/components/SortButtons"
import CategoryNav from "@/components/CategoryNav"

export default async function ModelsPage({ searchParams }: { searchParams: Promise<{ query?: string; sort?: SortBy }> }) {
  const models = getModels()
  return (
    <main>
      <h1>3D Models</h1>
      <CategoryNav />
      <SortButtons />
      <div className="grid">{models.map((m) => <ModelCard key={m.id} model={m} />)}</div>
    </main>
  )
}
`;
const DATA_PAGE_DONE = `import { getModels, type SortBy } from "@/lib/models"
import ModelCard from "@/components/ModelCard"
import SortButtons from "@/components/SortButtons"
import CategoryNav from "@/components/CategoryNav"

export default async function ModelsPage({ searchParams }: { searchParams: Promise<{ query?: string; sort?: SortBy }> }) {
  const { query, sort } = await searchParams
  const models = getModels({ query, sort })
  return (
    <main>
      <h1>3D Models</h1>
      <CategoryNav />
      <SortButtons />
      <div className="grid">{models.map((m) => <ModelCard key={m.id} model={m} />)}</div>
    </main>
  )
}
`;
const CAT_PAGE_START = `import { notFound } from "next/navigation"
import { getModels, getCategories, type SortBy } from "@/lib/models"
import ModelCard from "@/components/ModelCard"
import SortButtons from "@/components/SortButtons"
import CategoryNav from "@/components/CategoryNav"

export default async function CategoryPage({ params, searchParams }: {
  params: Promise<{ categoryName: string }>
  searchParams: Promise<{ sort?: SortBy }>
}) {
  // find the category by slug (404 with notFound() if it doesn't exist),
  // show its display_name in the h1 and only its models, sorted by ?sort
  return <main><h1>Category</h1></main>
}
`;
const CAT_PAGE_DONE = `import { notFound } from "next/navigation"
import { getModels, getCategories, type SortBy } from "@/lib/models"
import ModelCard from "@/components/ModelCard"
import SortButtons from "@/components/SortButtons"
import CategoryNav from "@/components/CategoryNav"

export default async function CategoryPage({ params, searchParams }: {
  params: Promise<{ categoryName: string }>
  searchParams: Promise<{ sort?: SortBy }>
}) {
  const { categoryName } = await params
  const { sort } = await searchParams
  const category = getCategories().find((c) => c.slug === categoryName)
  if (!category) notFound()
  const models = getModels({ category: category.slug, sort })
  return (
    <main>
      <h1>{category.display_name}</h1>
      <CategoryNav />
      <SortButtons />
      <div className="grid">{models.map((m) => <ModelCard key={m.id} model={m} />)}</div>
    </main>
  )
}
`;
const CATEGORY_NAV = `import Link from "next/link"
import { getCategories } from "@/lib/models"

export default function CategoryNav() {
  const categories = getCategories()
  return (
    <nav className="cats" aria-label="Categories">
      <Link href="/3d-models">All</Link>
      {categories.map((c) => <Link key={c.slug} href={\`/3d-models/categories/\${c.slug}\`}>{c.display_name}</Link>)}
    </nav>
  )
}
`;
const LOADING_TSX = `export default function Loading() {
  return (
    <main aria-busy="true">
      <h1>Loading models…</h1>
      <div className="grid">{[1, 2, 3].map((i) => <div key={i} className="skeleton" />)}</div>
    </main>
  )
}
`;
const DATA_BASE = {
  "app/layout.tsx": LAYOUT_WITH_NAV, "app/globals.css": CSS, "app/page.tsx": HOME_DONE, "components/Navbar.tsx": NAVBAR_DONE,
  "components/ModelCard.tsx": DATA_CARD, "components/CategoryNav.tsx": CATEGORY_NAV, "lib/db.ts": DB_TS, "printforge.db": DB_SQL,
};

export const NEXTJS = {
  id: "next",
  title: "Next.js",
  blurb: "Learn to build full-stack React apps with Next.js.",
  concepts: ["App Router and file-based routing", "Server vs client components", "Rendering strategies: SSR, SSG, ISR", "Server actions and data flow"],
  lessons: [
    { id: "nx-welcome", title: "Welcome to Next.js", min: 12, kind: "lesson", body: [
      { t: "p", h: "<b>Next.js</b> is a React framework. You still write React components, but Next adds the parts every real app needs: routing from your folders, rendering on the server for speed and SEO, data fetching right inside components, image and font optimisation, and a production build. It's the most popular way to start a React app today." },
      { t: "diagram", name: "next-rsc" },
      { t: "callout", kind: "key", h: "In the App Router, components are <b>Server Components</b> by default: they run on the server, can be <code>async</code>, read databases and secrets directly, and send only HTML to the browser. Add <code>\"use client\"</code> to a file when it needs state, effects or event handlers." },
      { t: "nxplay", task: "A whole Next.js app in two files. Edit the heading: it reloads like <code>next dev</code>. Then add <code>console.log(\"rendered!\")</code> inside the component and look at which panel it appears in.", files: { "app/layout.tsx": LAYOUT_BASE, "app/page.tsx": `export default function HomePage() {\n  return (\n    <main>\n      <h1>Hello from Next.js 👋</h1>\n      <p>This component ran on the server.</p>\n    </main>\n  )\n}\n`, "app/globals.css": CSS } },
      { t: "callout", kind: "tip", h: "The lab emulates the Next.js dev server in your browser: the <b>Terminal</b> panel shows server output and the <b>Browser console</b> panel shows client output, just as they'd be split in a real project." },
    ]},

    { id: "nx-build", title: "Build a Next.js App", min: 200, kind: "project", body: [
      { t: "h", h: "A minimal setup and file-based routing" },
      { t: "code", lang: "bash", code: `npx create-next-app@latest printforge   # TypeScript, ESLint, App Router, src/ optional
cd printforge && npm run dev               # http://localhost:3000` },
      { t: "p", h: "In the <code>app</code> folder, every folder is a URL segment and a <code>page.tsx</code> makes it a route: <code>app/page.tsx</code> is <code>/</code>, <code>app/about/page.tsx</code> is <code>/about</code>. <code>layout.tsx</code> wraps the pages beneath it, and the root layout must render <code>&lt;html&gt;</code> and <code>&lt;body&gt;</code>." },
      { t: "code", lang: "text", code: `app/
├─ layout.tsx          → wraps every page (html, body, navbar)
├─ page.tsx            → /
├─ about/page.tsx      → /about
└─ 3d-models/
   ├─ page.tsx         → /3d-models
   └─ [id]/page.tsx    → /3d-models/1, /3d-models/2 … (dynamic)` },
      { t: "nxch", prompt: "PrintForge challenge: build the home page (a hero with an <code>h1</code> and a <b>Browse models</b> link to <code>/3d-models</code> using <code>next/link</code>) and an about page at <code>/about</code> with the title <b>About · PrintForge</b> set through <code>metadata</code>.", files: { "app/layout.tsx": LAYOUT_BASE, "app/page.tsx": HOME_START, "app/globals.css": CSS }, tabs: ["app/page.tsx", "app/layout.tsx"], solution: { "app/page.tsx": HOME_DONE, "app/about/page.tsx": ABOUT_DONE }, tests: [
        { msg: "/ has an h1 and a Browse models link to /3d-models", fn: async (h) => !!h.$("h1") && !!h.link(/Browse models/) && h.link(/Browse models/).getAttribute("href") === "/3d-models" },
        { msg: "/about exists with an h1", fn: async (h) => { await h.navigate("/about"); return !!(await h.until(() => /About PrintForge/i.test(h.text("h1")), 3000)); } },
        { msg: "The about page's title is About · PrintForge", fn: async (h) => { await h.navigate("/about"); await h.until(() => h.$("h1"), 3000); return h.title() === "About · PrintForge"; } },
        { msg: "Uses next/link (no full page reload)", fn: async (h) => /from ["']next\/link["']/.test(h.src("app/page.tsx")) },
      ] },
      { t: "h", h: "Nested routes, layouts and links" },
      { t: "p", h: "Put shared UI like a navbar in the layout so it renders once and survives navigation. Use <code>&lt;Link&gt;</code> for internal links: Next prefetches the page and swaps it in without reloading. Import from the project root with the <code>@/</code> alias: <code>import Navbar from \"@/components/Navbar\"</code>." },
      { t: "nxch", prompt: "Add a <code>Navbar</code> component (in <code>components/Navbar.tsx</code>) with the <b>PrintForge</b> logo linking home and links to <b>3D Models</b> and <b>About</b>, and render it in the root layout so it's on every page.", files: { "app/layout.tsx": LAYOUT_BASE, "app/page.tsx": HOME_DONE, "app/about/page.tsx": ABOUT_DONE, "components/Navbar.tsx": `export default function Navbar() {\n  return <header className="navbar"></header>\n}\n`, "app/globals.css": CSS }, tabs: ["components/Navbar.tsx", "app/layout.tsx", "app/page.tsx"], solution: { "components/Navbar.tsx": NAVBAR_DONE, "app/layout.tsx": LAYOUT_WITH_NAV }, tests: [
        { msg: "The navbar is on the home page", fn: async (h) => !!h.$("header.navbar") && !!h.link("About") && !!h.link("3D Models") },
        { msg: "…and on /about", fn: async (h) => { await h.navigate("/about"); return !!(await h.until(() => h.$("header.navbar") && /About PrintForge/.test(h.text("h1")), 3000)); } },
        { msg: "Clicking About navigates there", fn: async (h) => { await h.click(h.link("About")); return !!(await h.until(() => h.path() === "/about" && /About PrintForge/.test(h.text("h1")), 3000)); } },
        { msg: "The logo links home", fn: async (h) => { await h.navigate("/about"); await h.until(() => h.link("PrintForge"), 3000); await h.click(h.link("PrintForge")); return !!(await h.until(() => h.path() === "/" && /Discover/.test(h.text("h1")), 3000)); } },
        { msg: "Navbar is rendered in app/layout.tsx", fn: async (h) => /<Navbar\s*\/>/.test(h.src("app/layout.tsx")) },
      ] },
      { t: "h", h: "Optimising fonts and images" },
      { t: "p", h: "<code>next/font</code> downloads Google fonts at build time and serves them from your own domain, with no layout shift. <code>next/image</code> resizes, lazy-loads and serves modern formats, and requires <code>alt</code> plus <code>width</code>/<code>height</code> (or <code>fill</code>) so the browser can reserve space." },
      { t: "code", lang: "tsx", code: `import { Albert_Sans } from "next/font/google"
const albertSans = Albert_Sans({ subsets: ["latin"], display: "swap" })
<html lang="en" className={albertSans.className}>

import Image from "next/image"
<Image src={model.image} alt={model.name} width={400} height={300} />` },
      { t: "h", h: "Aside: client vs server components" },
      { t: "nxplay", task: "<code>Counter</code> is a Client Component and the page is a Server Component. Click the button, then check both log panels. Now try removing <code>\"use client\"</code> from <code>Counter.tsx</code> and read the error.", files: { "app/layout.tsx": LAYOUT_FONT, "app/globals.css": CSS, "components/Navbar.tsx": NAVBAR_DONE, "app/page.tsx": `import Counter from "@/components/Counter"

export default async function Page() {
  console.log("Page rendered on the server")
  return (
    <main>
      <h1>Server or client?</h1>
      <p>This text was rendered on the server. The button below is interactive, so it's a Client Component.</p>
      <Counter start={3} />
    </main>
  )
}
`, "components/Counter.tsx": `"use client"

import { useState } from "react"

export default function Counter({ start }: { start: number }) {
  const [count, setCount] = useState(start)
  console.log("Counter rendered in the browser:", count)
  return <button className="cta" onClick={() => setCount((c) => c + 1)}>Liked {count} times ♥</button>
}
` } },
      { t: "steps", items: ["<b>Server Components</b> (default): fetch data, read the database or secrets, keep big libraries off the client. No state, effects or event handlers.", "<b>Client Components</b> (<code>\"use client\"</code>): interactivity, state, effects, browser APIs. Their code ships to the browser.", "Keep client components small and at the <b>leaves</b> of the tree; pass data to them as serialisable props.", "A server component can render a client component, and pass server-rendered content into it as <code>children</code>."] },
      { t: "h", h: "The models list and dynamic routes" },
      { t: "p", h: "A Server Component can be <code>async</code> and await data directly. A folder named <code>[id]</code> is a <b>dynamic segment</b>: the page receives <code>params</code> (a promise in Next 15+) and can call <code>notFound()</code> to render the 404 page. <code>generateMetadata</code> sets a per-page title." },
      { t: "nxch", prompt: "Build <code>/3d-models</code>: an async page that gets the models and renders a <code>ModelCard</code> for each in a <code>.grid</code>. Then add <code>app/3d-models/[id]/page.tsx</code> showing the model's name (h1), image and description, calling <code>notFound()</code> for unknown ids, with a <code>generateMetadata</code> title like <b>Phone Stand · PrintForge</b>.", files: { ...BUILD_BASE, "components/ModelCard.tsx": MODEL_CARD, "app/3d-models/page.tsx": MODELS_PAGE_START }, tabs: ["app/3d-models/page.tsx", "components/ModelCard.tsx", "lib/models.ts", "app/layout.tsx"], startPath: "/3d-models", solution: { "app/3d-models/page.tsx": MODELS_PAGE_DONE, "app/3d-models/[id]/page.tsx": DETAIL_DONE }, tests: [
        { msg: "/3d-models shows all 8 model cards", fn: async (h) => !!(await h.until(() => h.$$(".grid .card").length === 8, 3000)) },
        { msg: "Clicking a card opens /3d-models/[id]", fn: async (h) => { await h.until(() => h.$$(".card").length, 3000); await h.click(h.$$(".card")[3]); return !!(await h.until(() => h.path() === "/3d-models/4" && /Phone Stand/.test(h.text("h1")), 3000)); } },
        { msg: "The detail page shows the image and description", fn: async (h) => { await h.navigate("/3d-models/5"); return !!(await h.until(() => /Flexi Octopus/.test(h.text("h1")) && /wiggly octopus/.test(h.text()) && h.$("main img[alt='Flexi Octopus']"), 3000)); } },
        { msg: "Unknown ids render the 404 page", fn: async (h) => { await h.navigate("/3d-models/999"); return !!(await h.until(() => /404|could not be found/i.test(h.text()), 3000)); } },
        { msg: "generateMetadata sets the title", fn: async (h) => { await h.navigate("/3d-models/4"); await h.until(() => /Phone Stand/.test(h.text("h1")), 3000); return h.title() === "Phone Stand · PrintForge"; } },
      ] },
      { t: "recap", items: ["Folders are routes; page.tsx makes them public", "layout.tsx wraps pages and persists across navigation", "Link for client-side navigation; @/ imports from the project root", "next/font and next/image optimise fonts and images", "Server Components by default; \"use client\" for interactivity", "[id] folders are dynamic segments; await params; notFound() for 404s"] },
    ]},

    { id: "nx-render", title: "Rendering Strategies and More", min: 150, kind: "project", body: [
      { t: "h", h: "usePathname and active links" },
      { t: "p", h: "Styling the current link needs the URL, which comes from <code>usePathname()</code>, a hook, so it only works in a Client Component. Rather than turning the whole Navbar into a client component, extract a tiny <code>NavLink</code> client component and keep the Navbar on the server." },
      { t: "nxch", prompt: "The Navbar uses <code>usePathname</code> in a Server Component, which crashes. Create a client <code>NavLink</code> component (in <code>components/NavLink.tsx</code>) that adds the <code>active</code> class and <code>aria-current=\"page\"</code> when its href matches the current path (or a sub-path), and use it in the Navbar, which should stay a Server Component.", files: { ...BUILD_BASE, "components/Navbar.tsx": NAVBAR_ACTIVE_START, "components/NavLink.tsx": `// a small Client Component goes here\n`, "components/ModelCard.tsx": MODEL_CARD, "app/3d-models/page.tsx": MODELS_PAGE_DONE, "app/3d-models/[id]/page.tsx": DETAIL_DONE }, tabs: ["components/Navbar.tsx", "components/NavLink.tsx", "app/layout.tsx"], solution: { "components/Navbar.tsx": NAVBAR_ACTIVE_DONE, "components/NavLink.tsx": NAVLINK_DONE }, tests: [
        { msg: "The app renders without errors", fn: async (h) => !!(await h.until(() => h.$("header.navbar") && /Discover/.test(h.text("h1")), 3000)) },
        { msg: "On /about, About is active and 3D Models isn't", fn: async (h) => { await h.navigate("/about"); await h.until(() => h.link("About"), 3000); const a = h.link("About"), m = h.link("3D Models"); return a.classList.contains("active") && a.getAttribute("aria-current") === "page" && !m.classList.contains("active"); } },
        { msg: "3D Models stays active on /3d-models/2", fn: async (h) => { await h.navigate("/3d-models/2"); await h.until(() => /Cable/.test(h.text("h1")), 3000); return h.link("3D Models").classList.contains("active"); } },
        { msg: "Active state updates when you click a link", fn: async (h) => { await h.until(() => h.link("About"), 3000); await h.click(h.link("About")); return !!(await h.until(() => h.link("About").classList.contains("active"), 3000)); } },
        { msg: "NavLink is a Client Component; Navbar isn't", fn: async (h) => h.isClient("components/NavLink.tsx") && !h.isClient("components/Navbar.tsx") },
      ] },
      { t: "h", h: "Rendering strategies" },
      { t: "video", name: "next-render" },
      { t: "steps", items: ["<b>Static rendering (SSG)</b>: HTML built once at build time and served from a CDN. The default when a route uses no request-time data. Fastest.", "<b>Dynamic rendering (SSR)</b>: HTML built on every request. Happens automatically when a route reads <code>searchParams</code>, cookies or headers, or fetches with <code>cache: \"no-store\"</code>.", "<b>Incremental static regeneration (ISR)</b>: static, but rebuilt in the background after a time: <code>export const revalidate = 60</code>.", "<b>Client-side rendering (CSR)</b>: data fetched in the browser in a client component. Use for highly interactive, per-user widgets."] },
      { t: "nxplay", task: "Cat facts, fetched in a Server Component. In production, <code>force-cache</code> means the page is built once and reused; <code>no-store</code> means a fresh fetch on every request; <code>export const revalidate = 60</code> means at most once a minute. (The lab always re-renders like <code>next dev</code>, so watch the Terminal and the fetched time.)", startPath: "/catfacts", files: { "app/layout.tsx": LAYOUT_WITH_NAV, "app/globals.css": CSS, "components/Navbar.tsx": NAVBAR_DONE, "app/page.tsx": HOME_DONE, "app/catfacts/page.tsx": CATFACTS } },
      { t: "h", h: "Forms are navigation: searching with next/form" },
      { t: "p", h: "A plain HTML form with <code>method=\"get\"</code> navigates to its <code>action</code> with the fields in the query string: <code>/3d-models?query=dragon</code>. That's a perfect fit for search, because the result has a URL. <code>next/form</code>'s <code>&lt;Form&gt;</code> does the same with client-side navigation, so the layout and state survive. The page reads the value from <code>searchParams</code>." },
      { t: "nxch", prompt: "Add search: make <code>SearchForm</code> use <code>next/form</code> with <code>action=\"/3d-models\"</code> and an input named <code>query</code>; on the models page, read <code>query</code> from <code>searchParams</code>, filter by name or description (case-insensitive), and show <b>Results for \"…\"</b> in the h1.", startPath: "/3d-models", files: { ...BUILD_BASE, "components/SearchForm.tsx": SEARCH_FORM_START, "app/3d-models/page.tsx": SEARCH_PAGE_START, "components/ModelCard.tsx": MODEL_CARD, "app/3d-models/[id]/page.tsx": DETAIL_DONE }, tabs: ["components/SearchForm.tsx", "app/3d-models/page.tsx", "lib/models.ts"], solution: { "components/SearchForm.tsx": SEARCH_FORM_DONE, "app/3d-models/page.tsx": SEARCH_PAGE_DONE }, tests: [
        { msg: "Submitting the form goes to /3d-models?query=…", fn: async (h) => { await h.until(() => h.$("input[type=search]"), 3000); await h.type("input[type=search]", "dragon"); await h.submit("form"); return !!(await h.until(() => h.path() === "/3d-models?query=dragon", 3000)); } },
        { msg: "Results are filtered and the h1 says so", fn: async (h) => { await h.navigate("/3d-models?query=desk"); return !!(await h.until(() => h.$$(".card").length === 2 && /Results for "desk"/.test(h.text("h1")), 3000)); } },
        { msg: "Search ignores case and matches descriptions", fn: async (h) => { await h.navigate("/3d-models?query=KIDS"); return !!(await h.until(() => h.$$(".card").length === 1 && /Octopus/.test(h.text(".grid")), 3000)); } },
        { msg: "No query shows all models", fn: async (h) => !!(await h.until(() => h.$$(".card").length === 8, 3000)) },
        { msg: "Uses next/form", fn: async (h) => /from ["']next\/form["']/.test(h.src("components/SearchForm.tsx")) },
      ] },
      { t: "recap", items: ["Hooks like usePathname need a small Client Component", "Static by default; dynamic when you read request data", "revalidate for ISR; cache: \"no-store\" for always-fresh data", "GET forms put inputs in the URL: perfect for search", "next/form navigates client-side; read searchParams on the server"] },
    ]},

    { id: "nx-data", title: "Making Data Flow", min: 200, kind: "project", body: [
      { t: "h", h: "Introducing data: a SQLite database" },
      { t: "p", h: "Server Components can talk to a database directly: no API route in between. PrintForge uses SQLite through <code>better-sqlite3</code>, a synchronous driver. Keep database code in <code>lib/</code>, import <code>\"server-only\"</code> so it can never be bundled into client code, and always pass values as <code>?</code> parameters." },
      { t: "code", lang: "typescript", code: DB_TS },
      { t: "code", lang: "sql", code: DB_SQL.split("\n").slice(0, 12).join("\n") + "\n…" },
      { t: "h", h: "Search and sort data flow" },
      { t: "diagram", name: "next-dataflow" },
      { t: "p", h: "The URL is the source of truth. A client component changes the URL (<code>router.push</code>), Next re-renders the Server Component page with the new <code>searchParams</code>, the page passes them to <code>getModels()</code>, and the database does the filtering and sorting." },
      { t: "nxch", prompt: "Wire the data flow: make <code>getModels({ category, query, sort })</code> build a parameterised query (category filter, search on name <i>or</i> description with LIKE, and ORDER BY for <code>popular</code>/<code>newest</code>/<code>name</code>); make the models page pass <code>query</code> and <code>sort</code> from <code>searchParams</code>; and make <code>SortButtons</code> push <code>?sort=…</code> (keeping other params) inside <code>startTransition</code>, marking the current one with <code>aria-pressed</code>.", startPath: "/3d-models", files: { ...DATA_BASE, "lib/models.ts": DATA_MODELS_START, "components/SortButtons.tsx": SORT_START, "app/3d-models/page.tsx": DATA_PAGE_START }, tabs: ["lib/models.ts", "components/SortButtons.tsx", "app/3d-models/page.tsx", "lib/db.ts", "printforge.db"], solution: { "lib/models.ts": DATA_MODELS_DONE, "components/SortButtons.tsx": SORT_DONE, "app/3d-models/page.tsx": DATA_PAGE_DONE }, tests: [
        { msg: "Default sort is most liked", fn: async (h) => { await h.until(() => h.$$(".card").length === 8, 3000); return /Articulated Dragon/.test(h.text(h.$$(".card")[0])) && /Headphone Hook/.test(h.text(h.$$(".card")[7])); } },
        { msg: "Clicking A–Z sorts by name and updates the URL", fn: async (h) => { await h.until(() => h.$$(".card").length === 8, 3000); const b = h.$$(".toolbar button").find((x) => /A–Z/.test(x.textContent)); await h.click(b); return !!(await h.until(() => h.path() === "/3d-models?sort=name" && /Articulated Dragon/.test(h.text(h.$$(".card")[0])) && /Spice Jar Rack/.test(h.text(h.$$(".card")[7])), 3000)); } },
        { msg: "The current sort button has aria-pressed=true", fn: async (h) => { await h.navigate("/3d-models?sort=newest"); await h.until(() => h.$$(".card").length === 8, 3000); const on = h.$$(".toolbar button").filter((x) => x.getAttribute("aria-pressed") === "true"); return on.length === 1 && /Newest/.test(on[0].textContent); } },
        { msg: "?query searches name or description", fn: async (h) => { await h.navigate("/3d-models?query=desk"); return !!(await h.until(() => h.$$(".card").length === 2, 3000)); } },
        { msg: "Sorting keeps the search query", fn: async (h) => { await h.navigate("/3d-models?query=o"); await h.until(() => h.$$(".card").length, 3000); const b = h.$$(".toolbar button").find((x) => /A–Z/.test(x.textContent)); await h.click(b); return !!(await h.until(() => /query=o/.test(h.path()) && /sort=name/.test(h.path()), 3000)); } },
        { msg: "Queries use ? parameters, not string concatenation of values", fn: async (h) => /LIKE \?/.test(h.src("lib/models.ts")) && !/LIKE '%\$\{/.test(h.src("lib/models.ts")) },
      ] },
      { t: "h", h: "A dynamic category page" },
      { t: "nxch", prompt: "Build <code>app/3d-models/categories/[categoryName]/page.tsx</code>: look the category up by slug (call <code>notFound()</code> if it doesn't exist), show its <code>display_name</code> in the h1, and list only its models, respecting <code>?sort</code>.", startPath: "/3d-models/categories/toys", files: { ...DATA_BASE, "lib/models.ts": DATA_MODELS_DONE, "components/SortButtons.tsx": SORT_DONE, "app/3d-models/page.tsx": DATA_PAGE_DONE, "app/3d-models/categories/[categoryName]/page.tsx": CAT_PAGE_START }, tabs: ["app/3d-models/categories/[categoryName]/page.tsx", "lib/models.ts", "components/CategoryNav.tsx"], solution: { "app/3d-models/categories/[categoryName]/page.tsx": CAT_PAGE_DONE }, tests: [
        { msg: "/3d-models/categories/toys shows the 3 toys", fn: async (h) => !!(await h.until(() => h.text("h1") === "Toys" && h.$$(".card").length === 3, 3000)) },
        { msg: "Category links navigate between categories", fn: async (h) => { await h.until(() => h.link("Office"), 3000); await h.click(h.link("Office")); return !!(await h.until(() => h.path() === "/3d-models/categories/office" && h.text("h1") === "Office" && h.$$(".card").length === 3, 3000)); } },
        { msg: "?sort works within a category", fn: async (h) => { await h.navigate("/3d-models/categories/home?sort=name"); return !!(await h.until(() => h.$$(".card").length === 2 && /Geometric Planter/.test(h.text(h.$$(".card")[0])), 3000)); } },
        { msg: "Unknown categories are 404s", fn: async (h) => { await h.navigate("/3d-models/categories/weapons"); return !!(await h.until(() => /404|could not be found/i.test(h.text()), 3000)); } },
      ] },
      { t: "h", h: "Loading UI: loading.tsx and useTransition" },
      { t: "p", h: "Add <code>loading.tsx</code> next to a page and Next wraps that page in a Suspense boundary: the layout stays visible and the loading UI shows instantly while the page renders. For updates where you'd rather keep the current content on screen, wrap the navigation in <code>startTransition</code> and use <code>isPending</code> to dim the old results." },
      { t: "nxplay", task: "This page takes a second to load. Navigate between <b>All</b> and the categories: <code>loading.tsx</code> shows a skeleton. Then use the sort buttons: they navigate inside a transition, so the old list stays (dimmed) instead. Delete <code>loading.tsx</code> and compare.", startPath: "/3d-models", files: { ...DATA_BASE, "lib/models.ts": DATA_MODELS_DONE, "components/SortButtons.tsx": SORT_DONE, "app/3d-models/page.tsx": DATA_PAGE_DONE.replace("  const models = getModels({ query, sort })", "  await new Promise((r) => setTimeout(r, 1000)) // a slow database\n  const models = getModels({ query, sort })"), "app/3d-models/loading.tsx": LOADING_TSX, "app/3d-models/categories/[categoryName]/page.tsx": CAT_PAGE_DONE.replace("  const category = getCategories()", "  await new Promise((r) => setTimeout(r, 1000))\n  const category = getCategories()") }, tabs: ["app/3d-models/loading.tsx", "app/3d-models/page.tsx", "components/SortButtons.tsx"] },
      { t: "quiz", q: "A Client Component imports <code>lib/db.ts</code>, which starts with <code>import \"server-only\"</code>. What happens?", opts: ["It works, but slowly", "The build fails, so database code and secrets can't leak into the browser bundle", "Next silently fetches the data through an API"], a: 1, why: "server-only turns an accidental client import into a build error. Fetch data in Server Components and pass the results down as props." },
      { t: "recap", items: ["Server Components query the database directly; lib/ + server-only", "Parameterised SQL (?), never string-built values", "The URL holds search, sort and filters; searchParams flow into getModels()", "Client components change the URL with useRouter + usePathname + useSearchParams", "loading.tsx streams pages behind Suspense; useTransition keeps old UI with isPending"] },
    ]},
  ],
};
