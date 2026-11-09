/* AI Engineer Path — Deployment. Ship the Gift Genie backend: environment, build and start commands,
   smoke tests, domains, databases, staging, alerts, a health endpoint and graceful shutdown. */

const PKG = `{
  "name": "gift-genie",
  "type": "module",
  "engines": { "node": ">=22" },
  "scripts": {
    "start": "node server.js",
    "dev": "node --watch server.js"
  },
  "dependencies": { "express": "^5.1.0", "openai": "^6.0.0", "dotenv": "^17.2.0" }
}`;
const ENV = `OPENAI_API_KEY=sk-practice-123
NODE_ENV=development`;

const SERVER_START = `import express from "express"
import "dotenv/config"

const app = express()
app.use(express.json())

app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello from Gift Genie" })
})

// 1. Listen on process.env.PORT, falling back to 3000 locally
// 2. Add GET /health → 200 { status: "ok", uptime: <seconds> }
app.listen(3000, () => console.log("Listening on 3000"))
`;
const SERVER_HEALTH = `import express from "express"
import "dotenv/config"

const app = express()
app.use(express.json())

app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello from Gift Genie" })
})

app.get("/health", (req, res) => {
  res.json({ status: "ok", uptime: Math.round(process.uptime()) })
})

const PORT = Number(process.env.PORT) || 3000
app.listen(PORT, () => console.log(\`Listening on \${PORT}\`))
`;
const SHUTDOWN_START = `import express from "express"

const app = express()
let shuttingDown = false

app.get("/health", (req, res) => {
  // while shutting down, answer 503 so the load balancer stops sending traffic
  res.json({ status: "ok" })
})

const server = app.listen(Number(process.env.PORT) || 3000, () => console.log("Ready"))

// On SIGTERM: set shuttingDown, log "Shutting down…", close the server, then process.exit(0)
`;
const SHUTDOWN_DONE = `import express from "express"

const app = express()
let shuttingDown = false

app.get("/health", (req, res) => {
  if (shuttingDown) return res.status(503).json({ status: "shutting down" })
  res.json({ status: "ok" })
})

const server = app.listen(Number(process.env.PORT) || 3000, () => console.log("Ready"))

process.on("SIGTERM", () => {
  shuttingDown = true
  console.log("Shutting down…")
  server.close(() => {
    console.log("Closed out remaining connections")
    process.exit(0)
  })
})
`;

export const DEPLOY_BODIES = {
  "Intro": [
    { t: "p", h: "An app on your laptop helps nobody. In this section you'll put the Gift Genie backend on the internet the way teams do: from a GitHub repository to a hosting platform (we use <b>Render</b> as the example; Railway, Fly.io and others work the same way), with a domain, a staging environment, alerts and a health check." },
    { t: "diagram", name: "deploy-pipeline" },
  ],
  "Code check": [
    { t: "p", h: "Before deploying, check the code is ready for a server you don't control:" },
    { t: "steps", items: ["No secrets in the code: keys come from <code>process.env</code>", "<code>.env</code> and <code>node_modules</code> are in <code>.gitignore</code>", "<code>package.json</code> has a <code>start</code> script and an <code>engines.node</code> version", "The server listens on <code>process.env.PORT</code>, not a hard-coded port", "Errors are caught and logged rather than crashing the process", "The frontend calls relative URLs (<code>/api/gift</code>), not <code>http://localhost:3000</code>"] },
    { t: "code", lang: "json", code: PKG },
  ],
  "The Node Environment": [
    { t: "p", h: "<code>NODE_ENV=production</code> tells libraries to switch off development extras (Express hides stack traces, caches views). The host sets <code>PORT</code> for you, so your server must use it. Everything else secret, like <code>OPENAI_API_KEY</code>, goes into the host's environment-variable settings, never into the repository." },
    { t: "nch", prompt: "Make the server deployable: listen on <code>process.env.PORT</code> (as a number, falling back to 3000), and add <code>GET /health</code> returning <code>200</code> with <code>{ status: \"ok\", uptime }</code>.", env: { PORT: "10000" }, requests: [{ url: "/health" }], files: { "server.js": SERVER_START, "package.json": PKG, ".env": ENV }, solution: { "server.js": SERVER_HEALTH }, tests: [
      { msg: "Listens on the PORT the platform provides", fn: async (t) => t.logs.some((l) => /10000/.test(l)) },
      { msg: "GET /health → 200 { status: \"ok\" }", fn: async (t) => { const r = await t.get("/health"); return r.status === 200 && r.json && r.json.status === "ok" && typeof r.json.uptime === "number"; } },
      { msg: "No hard-coded port in app.listen", fn: async (t) => !/listen\(\s*3000/.test(t.src("server.js")) },
    ] },
  ],
  "Push to GitHub": [
    { t: "code", lang: "bash", code: `git init
git add .
git commit -m "Gift Genie backend"
git branch -M main
git remote add origin git@github.com:you/gift-genie.git
git push -u origin main` },
    { t: "callout", kind: "warn", h: "Run <code>git status</code> before your first commit and make sure <code>.env</code> isn't listed. If a secret was ever committed, deleting the file isn't enough: it's in the history. Rotate the key." },
  ],
  "Render Build Command": [
    { t: "p", h: "Create a <b>Web Service</b> from the repository. The <b>build command</b> runs once per deploy to install and compile; the <b>start command</b> runs your server." },
    { t: "code", lang: "text", code: `Build command:  npm ci          # clean, exact install from package-lock.json
Start command:  npm start       # node server.js
Environment:    OPENAI_API_KEY=…, NODE_ENV=production
Health check:   /health` },
    { t: "callout", kind: "tip", h: "<code>npm ci</code> installs exactly what's in <code>package-lock.json</code>, so production gets the versions you tested. Commit the lockfile." },
  ],
  "Smoke Test": [
    { t: "p", h: "A <b>smoke test</b> is a quick check, right after deploying, that the most important paths work: the page loads, <code>/health</code> is OK, one real AI request succeeds. Automate it so every deploy is checked the same way." },
    { t: "jsch", fn: "smokeTest", prompt: "Write <code>smokeTest(baseUrl, paths)</code>: request each path with <code>fetch</code> and resolve to <code>{ ok, failures }</code>, where <code>failures</code> lists the paths whose response wasn't OK (or that threw).", starter: `async function smokeTest(baseUrl, paths) {\n\n}`, solution: `async function smokeTest(baseUrl, paths) {\n  const failures = []\n  for (const p of paths) {\n    try {\n      const res = await fetch(baseUrl + p)\n      if (!res.ok) failures.push(p)\n    } catch {\n      failures.push(p)\n    }\n  }\n  return { ok: failures.length === 0, failures }\n}`, tests: [
      { msg: "All good → ok: true", fn: async (f) => { const r = await f("https://api.shipyard.dev", ["/trivia?delay=0", "/catfacts?delay=0"]); return r.ok === true && r.failures.length === 0; } },
      { msg: "Lists the failing path", fn: async (f) => { const r = await f("https://api.shipyard.dev", ["/catfacts?delay=0", "/nope?delay=0"]); return r.ok === false && r.failures.length === 1 && /nope/.test(r.failures[0]); } },
    ] },
  ],
  "Domain Names": [
    { t: "p", h: "Your app gets a URL like <code>gift-genie.onrender.com</code>. For your own domain, buy it from a registrar, add it in the host's settings, then create the DNS records it asks for: usually a <b>CNAME</b> for <code>www</code> pointing to the host, and an <b>A</b>/<b>ALIAS</b> record for the bare domain. HTTPS certificates are issued automatically once DNS resolves." },
    { t: "quiz", q: "You added the CNAME but the site doesn't load on your domain yet. What's most likely?", opts: ["The code is broken", "DNS changes are still propagating; it can take minutes to hours", "You need to redeploy"], a: 1, why: "DNS records are cached around the internet according to their TTL. Wait, and check with a DNS lookup tool." },
  ],
  "Database Problems": [
    { t: "p", h: "Most platforms give each deploy a fresh, temporary filesystem. A SQLite file or uploaded images saved to disk <b>disappear on the next deploy or restart</b>, and two instances wouldn't share them anyway. Use a managed database (Postgres on the platform, Supabase, Neon) and object storage (S3, R2, Supabase Storage) for files, connected through environment variables." },
    { t: "quiz", q: "Users' saved gift lists vanish every time you deploy. Why?", opts: ["Express clears them", "They're stored in a file on the server's ephemeral disk, which is replaced on each deploy", "The API key expired"], a: 1, why: "Persistent data belongs in a managed database or object storage, not on the instance's disk." },
  ],
  "Staging": [
    { t: "p", h: "A <b>staging</b> environment is a copy of production with its own URL, database and keys. Deploy there first (often automatically from a <code>staging</code> or <code>develop</code> branch), test, then promote to production. Many hosts also create a <b>preview environment</b> for every pull request." },
  ],
  "Merging": [
    { t: "code", lang: "bash", code: `git switch -c feature/streaming
# …commit work, open a pull request into staging…
# staging deploys automatically; smoke test it
git switch main
git merge staging        # or merge the PR in GitHub
git push                 # production deploys` },
    { t: "callout", kind: "tip", h: "Protect <code>main</code> so it only changes through reviewed pull requests with passing checks. Production should never be a surprise." },
  ],
  "Alerts and Notifications": [
    { t: "p", h: "You want to hear about problems before users do. Set up notifications for failed deploys, crashes and restarts (email or Slack), uptime monitoring that hits <code>/health</code> every minute, and error tracking (like Sentry) that groups exceptions with stack traces. For AI apps, also alert on spend: set a monthly budget and usage alerts in the provider's dashboard." },
  ],
  "Health endpoint": [
    { t: "p", h: "A <code>/health</code> endpoint lets the platform and monitors ask \"are you OK?\". Keep it fast and cheap, and return <code>503</code> when the app can't serve traffic. A deeper <b>readiness</b> check can also verify the database connection, but shouldn't call the AI provider on every check: that costs money." },
    { t: "code", lang: "javascript", code: `app.get("/health", async (req, res) => {
  try {
    await db.query("SELECT 1")
    res.json({ status: "ok", uptime: Math.round(process.uptime()) })
  } catch {
    res.status(503).json({ status: "database unavailable" })
  }
})` },
  ],
  "Terminating Processes & Signals": [
    { t: "p", h: "When you deploy, the platform starts the new version and sends the old process <code>SIGTERM</code>: \"please finish up\". If it hasn't exited after a grace period, <code>SIGKILL</code> ends it abruptly. Handle <code>SIGTERM</code> to shut down <b>gracefully</b>: stop accepting new requests, let in-flight ones finish, close database connections, then exit." },
    { t: "nch", prompt: "Handle <code>SIGTERM</code>: set <code>shuttingDown</code>, log <code>Shutting down…</code>, make <code>/health</code> return <b>503</b> while shutting down, then <code>server.close()</code> and <code>process.exit(0)</code> once it has closed. (The test sends the signal for you.)", requests: [{ url: "/health" }], files: { "server.js": SHUTDOWN_START, "package.json": PKG }, solution: { "server.js": SHUTDOWN_DONE }, tests: [
      { msg: "Healthy before the signal", fn: async (t) => (await t.get("/health")).status === 200 },
      { msg: "Logs Shutting down… on SIGTERM", fn: async (t) => { await t.signal("SIGTERM"); return t.logs.some((l) => /Shutting down/.test(l)); } },
      { msg: "Exits cleanly with code 0", fn: async (t) => { await t.signal("SIGTERM"); await t.wait(100); return t.logs.some((l) => /exited with code 0/.test(l)); } },
      { msg: "Health returns 503 while shutting down", fn: async (t) => /status\(\s*503\s*\)/.test(t.src("server.js")) && /shuttingDown\s*=\s*true/.test(t.src("server.js")) },
    ] },
  ],
  "Outro": [
    { t: "recap", items: ["Secrets in environment variables; listen on process.env.PORT", "npm ci to build, npm start to run, lockfile committed", "Smoke test every deploy; monitor /health", "Ephemeral disks: managed databases and object storage", "Staging and previews before production; protect main", "Alerts for crashes, errors and AI spend", "Handle SIGTERM for zero-downtime deploys"] },
  ],
};
