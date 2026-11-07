/* Module — AI Engineering. Lesson titles match the syllabus so the topic lists attach.
   Every lab talks to the practice LLM in mockApi.js: an OpenAI-compatible API at https://api.shipyard.dev/v1
   (chat completions with streaming, JSON mode and tool calls, plus embeddings). Any key that looks like
   "sk-…" works there. The Node lab also has the `openai` and `dotenv` packages, pointed at the same API. */

const API = "https://api.shipyard.dev/v1";
const KEY = "sk-practice-123";

/* ── shared snippets ── */
const ASK_JS = `const API = "${API}"
const KEY = "${KEY}" // practice key: fine in a lab, never in a real frontend

async function ask(messages, options = {}) {
  const res = await fetch(API + "/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: "Bearer " + KEY },
    body: JSON.stringify({ model: "shipyard-mini", messages, ...options }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error.message)
  return data
}`;

const GENIE_CSS = `*{box-sizing:border-box}body{margin:0;font-family:Inter,system-ui,sans-serif;background:radial-gradient(circle at top,#3b1d6e,#140b26 70%);color:#f4efff;min-height:100vh;display:grid;place-items:start center;padding:28px 16px}
main{width:min(520px,100%)}h1{margin:0 0 4px;font-size:30px}.sub{margin:0 0 18px;color:#c8b8f0}
form{display:flex;gap:8px}textarea{flex:1;min-height:60px;border-radius:12px;border:1px solid #6d4bb8;background:#1e1237;color:inherit;padding:10px;font:inherit;resize:vertical}
button{border:0;border-radius:12px;padding:0 18px;background:linear-gradient(135deg,#ffb84d,#ff6b9a);color:#2a0b2e;font-weight:800;cursor:pointer}button:disabled{opacity:.5}
#out{margin-top:18px;background:#1e1237;border:1px solid #3d2a6b;border-radius:14px;padding:4px 16px;min-height:60px;line-height:1.55}
#out h2{font-size:18px;color:#ffb84d}#out li{margin:6px 0}.err{color:#ff8a8a}`;

const GENIE_HTML = `<main>
  <h1>🧞 Gift Genie</h1>
  <p class="sub">Describe who the gift is for. The genie does the rest.</p>
  <form id="f">
    <label for="who" class="sr-only" style="position:absolute;left:-9999px">Who is the gift for?</label>
    <textarea id="who" required>My dad, who loves cooking and has every gadget already</textarea>
    <button id="go">Ask</button>
  </form>
  <section id="out" aria-live="polite"></section>
</main>`;

/* A tiny, safe Markdown renderer: escape first, then add only the tags we allow. */
const MD_JS = `function escapeHtml(s) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c])
}
function renderMarkdown(md) {
  const lines = escapeHtml(md).split("\\n")
  let html = "", inList = false
  for (const line of lines) {
    const item = line.match(/^\\d+\\.\\s+(.*)/)
    if (item && !inList) { html += "<ol>"; inList = true }
    if (!item && inList) { html += "</ol>"; inList = false }
    const inline = (t) => t.replace(/\\*\\*(.+?)\\*\\*/g, "<strong>$1</strong>")
    if (item) html += "<li>" + inline(item[1]) + "</li>"
    else if (line.startsWith("## ")) html += "<h2>" + inline(line.slice(3)) + "</h2>"
    else if (line.trim()) html += "<p>" + inline(line) + "</p>"
  }
  return html + (inList ? "</ol>" : "")
}`;

const REACT_PROMPT = `You cycle through Thought, Action, PAUSE, Observation. At the end of the loop you output a final Answer.
Use Thought to describe your thoughts about the question you have been asked.
Use Action to run one of the actions available to you, then return PAUSE.
Observation will be the result of running those actions.

Available actions:
getCurrentWeather:
e.g. getCurrentWeather: Salt Lake City
Returns the current weather of the location specified.

getLocation:
e.g. getLocation: null
Returns the user's location details. No arguments needed.

Example session:
Question: Please give me some ideas for activities to do this afternoon.
Thought: I should look up the user's location so I can give location-specific activity ideas.
Action: getLocation: null
PAUSE

You will be called again with something like this:
Observation: "New York City, NY"

Then you loop again:
Thought: To get even more specific activity ideas, I should get the current weather at the user's location.
Action: getCurrentWeather: New York City
PAUSE

You'll then be called again with something like this:
Observation: { location: "New York City, NY", forecast: ["sunny"] }

You then output:
Answer: <Suggested activities based on sunny weather that are highly specific to New York City and surrounding areas.>`;

const MOVIES = `const movies = [
  { title: "Galaxy Quest", year: 1999, text: "A hilarious comedy where the cast of a cheesy space show are mistaken for real heroes by aliens." },
  { title: "The Martian", year: 2015, text: "An astronaut stranded on Mars uses science and humour to survive until rescue." },
  { title: "Paddington 2", year: 2017, text: "A warm family film: a polite bear is framed for theft and his friends set out to clear his name." },
  { title: "Hereditary", year: 2018, text: "A terrifying horror story about a grieving family haunted by something sinister." },
  { title: "Mad Max: Fury Road", year: 2015, text: "A relentless action chase across the desert, full of explosions and fights." },
  { title: "Before Sunrise", year: 1995, text: "A romantic drama about two strangers who fall in love walking through Vienna." },
  { title: "Ratatouille", year: 2007, text: "An animated family film about a rat who dreams of becoming a chef in Paris, full of food and cooking." },
]`;

/* ── Node project: Gift Genie backend ── */
const GG_PKG = `{
  "name": "gift-genie",
  "type": "module",
  "scripts": { "start": "node server.js" },
  "dependencies": { "dotenv": "^17.2.0", "express": "^5.1.0", "openai": "^6.0.0" }
}`;
const GG_ENV = `# Never commit this file. Add .env to .gitignore.
OPENAI_API_KEY=sk-practice-123
AI_MODEL=shipyard-mini`;
const GG_INDEX_HTML = `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><title>Gift Genie</title><link rel="stylesheet" href="/index.css"></head>
<body>
${GENIE_HTML}
<script src="/index.js"></script>
</body>
</html>`;
const GG_FRONT_JS = `const form = document.getElementById("f")
const out = document.getElementById("out")

form.addEventListener("submit", async (e) => {
  e.preventDefault()
  out.textContent = "The genie is thinking…"
  const res = await fetch("/api/gift", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt: document.getElementById("who").value }),
  })
  const data = await res.json()
  out.textContent = res.ok ? data.reply : "⚠️ " + data.error
})`;
const GG_SERVER_START = `import express from "express"
import "dotenv/config"
// TODO: import OpenAI from "openai"

const app = express()
app.use(express.json())
app.use(express.static("public"))

// TODO: create the client with the key from process.env

app.post("/api/gift", async (req, res) => {
  // TODO: validate req.body.prompt (400 if missing)
  // TODO: call the model with a system message and the user's prompt
  // TODO: respond with { reply }
})

app.listen(3000, () => console.log("Gift Genie on http://localhost:3000"))
`;
const GG_SERVER_DONE = `import express from "express"
import "dotenv/config"
import OpenAI from "openai"

const app = express()
app.use(express.json())
app.use(express.static("public"))

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

app.post("/api/gift", async (req, res) => {
  const prompt = typeof req.body.prompt === "string" ? req.body.prompt.trim() : ""
  if (!prompt) return res.status(400).json({ error: "Tell the genie who the gift is for." })
  if (prompt.length > 500) return res.status(400).json({ error: "Keep it under 500 characters." })
  try {
    const completion = await client.chat.completions.create({
      model: process.env.AI_MODEL,
      messages: [
        { role: "system", content: "You are the Gift Genie. Suggest three thoughtful gift ideas in Markdown with a heading and a numbered list." },
        { role: "user", content: prompt },
      ],
      max_tokens: 300,
    })
    res.json({ reply: completion.choices[0].message.content })
  } catch (err) {
    console.error(err.message)
    res.status(502).json({ error: "The genie is unavailable. Try again soon." })
  }
})

app.listen(3000, () => console.log("Gift Genie on http://localhost:3000"))
`;
const GG_FILES = { "server.js": GG_SERVER_START, ".env": GG_ENV, "public/index.html": GG_INDEX_HTML, "public/index.css": GENIE_CSS, "public/index.js": GG_FRONT_JS, "package.json": GG_PKG };

export const AI = {
  id: "ai",
  title: "AI Engineering",
  blurb: "Learn to build apps powered by AI. Integrate with proprietary and open-source models.",
  concepts: ["Calling LLM APIs and prompt design", "Embeddings and vector search", "Retrieval-augmented generation (RAG)", "Tool use and AI agents"],
  lessons: [
    /* ───────────────────────── Welcome ───────────────────────── */
    { id: "ai-welcome", title: "Welcome to AI Engineering", min: 12, kind: "lesson", body: [
      { t: "p", h: "AI engineering is building real products on top of large language models (LLMs). You won't train models here. You'll do what most teams actually do: call a model through an API, give it the right context, shape its output, and wire it into an app that people can trust." },
      { t: "callout", kind: "key", h: "An LLM is a function: <b>text in, text out</b>, one token at a time. Everything else in this module (prompts, streaming, embeddings, RAG, agents) is engineering around that function." },
      { t: "video", name: "llm" },
      { t: "h", h: "What you'll build" },
      { t: "steps", items: ["<b>Gift Genie</b>: your first AI app, with streaming, Markdown, JSON output and a secure backend", "<b>PolyGlot</b>: a translation app (solo project)", "<b>Semantic search and RAG</b> with embeddings and a vector database", "<b>PopChoice</b>: a movie recommender that answers from your own data (solo project)", "<b>An AI agent</b> that decides which tools to call, with ReAct prompting and tool calling"] },
      { t: "h", h: "The practice API" },
      { t: "p", h: "Real model APIs cost money and need an account. So every lab here talks to a practice model at <code>" + API + "</code>. It speaks the same request and response format as OpenAI's Chat Completions API, which most providers and open-source servers (Ollama, vLLM, LM Studio, OpenRouter) also accept. It's a small rule-based model: its answers are simple, but the protocol is real, so your code carries straight over." },
      { t: "code", lang: "text", code: `POST /v1/chat/completions   { model, messages, max_tokens, temperature, stream, response_format, tools }
POST /v1/embeddings         { model, input }
Authorization: Bearer sk-…  (any practice key, like ${KEY})` },
      { t: "callout", kind: "tip", h: "To use a real provider later, change the base URL and the key. OpenAI's is <code>https://api.openai.com/v1</code>. Anthropic's Claude API has its own Messages API and SDK, with the same ideas: a system prompt, a list of messages, tokens and tools." },
      { t: "quiz", q: "What does an LLM actually generate?", opts: ["A whole answer at once, looked up from a database", "One token at a time, each chosen from a probability distribution over possible next tokens", "Only the words it saw in training, in the same order"], a: 1, why: "The model predicts the next token from everything before it, then repeats. That's why it can stream, and why settings like temperature matter." },
      { t: "recap", items: ["AI engineering = building products on top of model APIs", "Text in, text out, one token at a time", "Labs use an OpenAI-compatible practice API", "Swap the base URL and key to use a real provider"] },
    ]},

    /* ───────────────────────── Fundamentals: Gift Genie ───────────────────────── */
    { id: "ai-fund", title: "AI Engineering Fundamentals (updated)", min: 180, kind: "project", body: [
      { t: "h", h: "Introducing your AI superpower" },
      { t: "p", h: "We're building <b>Gift Genie</b>: describe someone, and it suggests thoughtful gifts. Along the way you'll learn every building block of an AI feature." },
      { t: "h", h: "The AI marketplace" },
      { t: "p", h: "There are two broad kinds of model. <b>Proprietary</b> models (from OpenAI, Anthropic, Google and others) are reached through a paid API: usually the most capable, nothing to host. <b>Open-weight</b> models (Llama, Mistral, Qwen, Gemma and others) can be downloaded and run on your own hardware or through a host: more control and privacy, more work." },
      { t: "callout", kind: "tip", h: "<b>Recommended models:</b> start with a provider's small, cheap, fast tier for development (the \"mini\", \"flash\" or \"haiku\" class), and move up only when you can measure that a bigger model does better on your task. Model line-ups change every few months, so check the provider's model page rather than hard-coding a favourite from a blog post." },
      { t: "h", h: "Environment setup and the AI client" },
      { t: "p", h: "An API key is a password that bills you. It belongs in an environment variable, read on a server, never in frontend code or git." },
      { t: "code", lang: "bash", code: `npm install openai dotenv
echo "OPENAI_API_KEY=sk-..." > .env
echo ".env" >> .gitignore` },
      { t: "code", lang: "javascript", code: `import OpenAI from "openai"
import "dotenv/config"

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
// Another OpenAI-compatible provider? new OpenAI({ apiKey, baseURL: "https://…/v1" })` },
      { t: "h", h: "Your first AI request" },
      { t: "nplay", script: true, task: "Run it. Then change the user message and run again. Look at <code>usage</code>: you pay for prompt tokens and completion tokens.", files: {
        "index.js": `import OpenAI from "openai"
import "dotenv/config"

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const completion = await client.chat.completions.create({
  model: "shipyard-mini",
  messages: [
    { role: "user", content: "Suggest a gift for my sister who loves gardening" },
  ],
})

console.log(completion.choices[0].message.content)
console.log(completion.usage)
`,
        ".env": GG_ENV,
        "package.json": GG_PKG.replace("node server.js", "node index.js").replace("gift-genie", "first-ai-request"),
      } },
      { t: "p", h: "In the lab, the <code>openai</code> package is pointed at the practice API. The response has the same shape as the real one:" },
      { t: "code", lang: "json", code: `{
  "id": "chatcmpl-…", "object": "chat.completion", "model": "shipyard-mini",
  "choices": [{ "index": 0, "message": { "role": "assistant", "content": "## Gift ideas…" }, "finish_reason": "stop" }],
  "usage": { "prompt_tokens": 12, "completion_tokens": 64, "total_tokens": 76 }
}` },
      { t: "h", h: "Rebuilding the request with fetch" },
      { t: "p", h: "SDKs are thin wrappers over HTTP. Knowing the raw request helps you debug and use any provider. Here it is from the browser, which is fine only because this is a practice key." },
      { t: "play", api: true, task: "Click Ask. Then try <code>max_tokens: 15</code> in the body and look at <code>finish_reason</code> in the console.", html: GENIE_HTML, css: GENIE_CSS, js: `const API = "${API}"
const KEY = "${KEY}"

document.getElementById("f").addEventListener("submit", async (e) => {
  e.preventDefault()
  const out = document.getElementById("out")
  out.textContent = "Thinking…"
  const res = await fetch(API + "/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: "Bearer " + KEY },
    body: JSON.stringify({
      model: "shipyard-mini",
      messages: [{ role: "user", content: "Gift ideas: " + document.getElementById("who").value }],
    }),
  })
  const data = await res.json()
  console.log(data.choices[0].finish_reason, data.usage)
  out.textContent = data.choices[0].message.content
})` },
      { t: "jsch", fn: "askAI", prompt: "Write <code>askAI(prompt)</code>: POST to <code>" + API + "/chat/completions</code> with the header <code>Authorization: Bearer " + KEY + "</code> and a single user message, and return a promise of the reply text.", starter: `async function askAI(prompt) {

}`, solution: `async function askAI(prompt) {
  const res = await fetch("${API}/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: "Bearer ${KEY}" },
    body: JSON.stringify({ model: "shipyard-mini", messages: [{ role: "user", content: prompt }] }),
  })
  const data = await res.json()
  return data.choices[0].message.content
}`, tests: [
        { msg: "Resolves to the reply text (a string)", fn: async (f) => { const r = await f("Gift for a friend who loves reading"); return typeof r === "string" && /gift/i.test(r); } },
        { msg: "Sends the user's prompt", fn: async (f) => /reading light|bookshop|book box/i.test(await f("Gift for someone who reads novels")) },
      ]},
      { t: "h", h: "Shorter responses with tokens" },
      { t: "p", h: "Models read and write <b>tokens</b>: chunks of text, about four characters or three quarters of a word in English. <code>max_tokens</code> caps the reply. If the model hits the cap, it stops mid-sentence and <code>finish_reason</code> is <code>\"length\"</code>, not <code>\"stop\"</code>. A cap controls cost; a prompt like \"in under 50 words\" controls style. Use both." },
      { t: "jsch", fn: "readReply", prompt: "Write <code>readReply(data)</code> that takes a chat completion response and returns <code>{ text, truncated }</code>, where <code>truncated</code> is <code>true</code> when the model stopped because of the token limit.", starter: `function readReply(data) {

}`, solution: `function readReply(data) {
  const choice = data.choices[0]
  return { text: choice.message.content, truncated: choice.finish_reason === "length" }
}`, tests: [
        { msg: "finish_reason \"stop\" → truncated false", fn: (f) => { const r = f({ choices: [{ message: { content: "Hi" }, finish_reason: "stop" }] }); return r.text === "Hi" && r.truncated === false; } },
        { msg: "finish_reason \"length\" → truncated true", fn: (f) => f({ choices: [{ message: { content: "A cast-iron" }, finish_reason: "length" }] }).truncated === true },
      ]},
      { t: "h", h: "Refining the prompt" },
      { t: "p", h: "A good prompt is specific about the <b>task</b>, the <b>audience</b>, the <b>format</b> and the <b>constraints</b>. Compare:" },
      { t: "code", lang: "text", code: `✗ gift ideas dad
✓ Suggest 3 gifts for my dad (60, loves cooking, already owns every gadget).
  Budget under $60. For each: name, one-line reason, rough price. Use a numbered list.` },
      { t: "h", h: "Model snapshots" },
      { t: "p", h: "Model names like <code>gpt-4o</code> are often <b>aliases</b> that move to newer versions. A <b>snapshot</b> name with a date pins an exact version, so your app's behaviour doesn't change under you. Pin snapshots in production, test new ones deliberately, and keep the model name in config (<code>process.env.AI_MODEL</code>) so switching is a deploy, not a code change." },
      { t: "h", h: "The messages array and the system message" },
      { t: "p", h: "The model is <b>stateless</b>: it remembers nothing between requests. A conversation is an array you send every time. <code>system</code> (or <code>developer</code>) sets behaviour and rules, <code>user</code> is the person, <code>assistant</code> is the model's earlier replies." },
      { t: "code", lang: "javascript", code: `const messages = [
  { role: "system", content: "You are the Gift Genie. Be warm, concise, and suggest 3 ideas." },
  { role: "user", content: "My sister loves gardening" },
  { role: "assistant", content: "1. Heirloom seeds… 2. …" },
  { role: "user", content: "Cheaper please" }, // only makes sense with the history above
]` },
      { t: "jsch", fn: "buildMessages", prompt: "Write <code>buildMessages(system, history, userText)</code> that returns a new array: the system message first, then every message in <code>history</code>, then the new user message. Don't change <code>history</code>.", starter: `function buildMessages(system, history, userText) {

}`, solution: `function buildMessages(system, history, userText) {
  return [{ role: "system", content: system }, ...history, { role: "user", content: userText }]
}`, tests: [
        { msg: "System first, user last", fn: (f) => { const m = f("Be kind", [], "Hi"); return m.length === 2 && m[0].role === "system" && m[0].content === "Be kind" && m[1].role === "user" && m[1].content === "Hi"; } },
        { msg: "Keeps the history in order", fn: (f) => { const h = [{ role: "user", content: "A" }, { role: "assistant", content: "B" }]; const m = f("S", h, "C"); return m.map((x) => x.content).join("") === "SABC"; } },
        { msg: "Doesn't mutate history", fn: (f) => { const h = [{ role: "user", content: "A" }]; f("S", h, "C"); return h.length === 1; } },
      ]},
      { t: "h", h: "Aside: token costs and context windows" },
      { t: "p", h: "Providers price per million tokens, with output usually several times dearer than input. Every request re-sends the whole conversation, so long chats get more expensive with each turn. The <b>context window</b> is the most tokens a model can consider at once (prompt plus reply). Go over it and the request fails, so long-running chats need trimming or summarising." },
      { t: "jsch", fn: "fitToContext", prompt: "Write <code>fitToContext(messages, maxTokens)</code>. Estimate tokens as <code>Math.ceil(content.length / 4)</code> per message. Always keep the first (system) message and the last message; drop the <b>oldest</b> messages in between until the total fits. Return a new array.", starter: `function fitToContext(messages, maxTokens) {

}`, solution: `function fitToContext(messages, maxTokens) {
  const tokens = (m) => Math.ceil(m.content.length / 4)
  const out = messages.slice()
  const total = () => out.reduce((sum, m) => sum + tokens(m), 0)
  while (total() > maxTokens && out.length > 2) out.splice(1, 1)
  return out
}`, tests: [
        { msg: "Leaves short conversations alone", fn: (f) => f([{ role: "system", content: "abcd" }, { role: "user", content: "efgh" }], 100).length === 2 },
        { msg: "Drops the oldest middle messages first", fn: (f) => { const m = [{ role: "system", content: "s".repeat(8) }, { role: "user", content: "1".repeat(40) }, { role: "assistant", content: "2".repeat(40) }, { role: "user", content: "3".repeat(8) }]; const r = f(m, 15); return r.length === 3 && r[1].content[0] === "2" && r[0].role === "system" && r[2].content[0] === "3"; } },
        { msg: "Never drops the system or last message", fn: (f) => { const r = f([{ role: "system", content: "x".repeat(100) }, { role: "user", content: "y".repeat(100) }, { role: "user", content: "z".repeat(100) }], 10); return r.length === 2 && r[0].content[0] === "x" && r[1].content[0] === "z"; } },
      ]},
      { t: "h", h: "Error handling" },
      { t: "p", h: "AI APIs fail in predictable ways: <b>401</b> bad key, <b>400</b> a malformed request, <b>429</b> rate limited (retry with backoff), <b>5xx</b> provider trouble. Errors come back as JSON with an <code>error.message</code>. Check <code>res.ok</code>, and show users a friendly message rather than a blank screen." },
      { t: "jsch", fn: "callAI", prompt: "Write <code>callAI(body)</code> that POSTs <code>body</code> to the chat completions endpoint (with the practice key) and resolves to the parsed JSON. If <code>res.ok</code> is false, <b>throw</b> an <code>Error</code> whose message is the API's <code>error.message</code>.", starter: `async function callAI(body) {

}`, solution: `async function callAI(body) {
  const res = await fetch("${API}/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: "Bearer ${KEY}" },
    body: JSON.stringify(body),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error.message)
  return data
}`, tests: [
        { msg: "Valid request → parsed completion", fn: async (f) => { const d = await f({ messages: [{ role: "user", content: "hello" }] }); return d && d.choices && typeof d.choices[0].message.content === "string"; } },
        { msg: "Empty messages → throws the API's message", fn: async (f) => { try { await f({ messages: [] }); return false; } catch (e) { return /messages/.test(e.message); } } },
        { msg: "Rate limit (model: \"rate-limit-demo\") → throws", fn: async (f) => { try { await f({ model: "rate-limit-demo", messages: [{ role: "user", content: "hi" }] }); return false; } catch (e) { return /rate limit/i.test(e.message); } } },
      ]},
      { t: "h", h: "Rendering Markdown safely" },
      { t: "p", h: "Models love Markdown, so you'll want to render it. But model output is <b>untrusted input</b>: a prompt injection can make it emit <code>&lt;img src=x onerror=…&gt;</code>. Never put it into <code>innerHTML</code> raw. In real apps, use a Markdown library (like <code>marked</code>) and sanitise the HTML (with <code>DOMPurify</code>). The idea underneath: escape everything, then allow only what you trust." },
      { t: "code", lang: "javascript", code: `import { marked } from "marked"
import DOMPurify from "dompurify"
out.innerHTML = DOMPurify.sanitize(marked.parse(reply))` },
      { t: "jsch", fn: "safeMarkdown", prompt: "Write <code>safeMarkdown(md)</code>: first escape <code>&amp; &lt; &gt; \"</code> and <code>'</code>, then turn <code>**text**</code> into <code>&lt;strong&gt;text&lt;/strong&gt;</code>. Return the HTML string.", starter: `function safeMarkdown(md) {

}`, solution: `function safeMarkdown(md) {
  const escaped = md.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c])
  return escaped.replace(/\\*\\*(.+?)\\*\\*/g, "<strong>$1</strong>")
}`, tests: [
        { msg: "Bold works", fn: (f) => f("A **cast-iron** pan") === "A <strong>cast-iron</strong> pan" },
        { msg: "HTML is escaped, so no tags get through", fn: (f) => { const r = f('<img src=x onerror="alert(1)">'); return !/<img/.test(r) && /&lt;img/.test(r) && /&quot;/.test(r); } },
        { msg: "Escapes before adding tags", fn: (f) => f("**<b>hi</b>**") === "<strong>&lt;b&gt;hi&lt;/b&gt;</strong>" },
      ]},
      { t: "h", h: "Streaming AI responses" },
      { t: "p", h: "Long replies take seconds. With <code>stream: true</code>, the API sends tokens as they're generated using <b>server-sent events</b>: lines starting <code>data: </code>, each a JSON chunk with a <code>delta</code>, ending with <code>data: [DONE]</code>. Users see text appear in a few hundred milliseconds instead of waiting for the whole thing." },
      { t: "gif", name: "sse-stream" },
      { t: "code", lang: "text", code: `data: {"choices":[{"delta":{"content":"## "},"finish_reason":null}]}

data: {"choices":[{"delta":{"content":"Gift "},"finish_reason":null}]}

data: {"choices":[{"delta":{},"finish_reason":"stop"}]}

data: [DONE]` },
      { t: "code", lang: "javascript", code: `// With the SDK, a stream is an async iterable of chunks
const stream = await client.chat.completions.create({ model, messages, stream: true })
for await (const chunk of stream) {
  process.stdout.write(chunk.choices[0]?.delta?.content || "")
}` },
      { t: "h", h: "Gift Genie UI streaming challenge" },
      { t: "play", api: true, task: "This version streams with <code>fetch</code> and a reader. Notice how a chunk can end halfway through a line, which is why we keep a <code>buffer</code>. Then render with <code>renderMarkdown</code> instead of <code>textContent</code>.", html: GENIE_HTML, css: GENIE_CSS, js: `${ASK_JS.split("\n\nasync function")[0]}

${MD_JS}

document.getElementById("f").addEventListener("submit", async (e) => {
  e.preventDefault()
  const out = document.getElementById("out"), btn = document.getElementById("go")
  btn.disabled = true
  out.textContent = ""
  const res = await fetch(API + "/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: "Bearer " + KEY },
    body: JSON.stringify({
      model: "shipyard-mini",
      stream: true,
      messages: [
        { role: "system", content: "You are the Gift Genie. Reply in Markdown with a heading and a numbered list." },
        { role: "user", content: document.getElementById("who").value },
      ],
    }),
  })
  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = "", text = ""
  while (true) {
    const { value, done } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const events = buffer.split("\\n\\n")
    buffer = events.pop() // keep a half-received event for next time
    for (const ev of events) {
      const data = ev.replace(/^data: /, "")
      if (data === "[DONE]") continue
      text += JSON.parse(data).choices[0].delta.content || ""
      out.textContent = text // TODO: out.innerHTML = renderMarkdown(text)
    }
  }
  btn.disabled = false
})` },
      { t: "jsch", fn: "streamReply", prompt: "Write <code>streamReply(prompt, onToken)</code>. Request a streamed completion, call <code>onToken(piece)</code> for every content delta as it arrives, and resolve to the full text at the end. Handle events split across chunks.", starter: `async function streamReply(prompt, onToken) {

}`, solution: `async function streamReply(prompt, onToken) {
  const res = await fetch("${API}/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: "Bearer ${KEY}" },
    body: JSON.stringify({ stream: true, messages: [{ role: "user", content: prompt }] }),
  })
  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = "", text = ""
  while (true) {
    const { value, done } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const events = buffer.split("\\n\\n")
    buffer = events.pop()
    for (const ev of events) {
      const data = ev.replace(/^data: /, "")
      if (data === "[DONE]") continue
      const piece = JSON.parse(data).choices[0].delta.content
      if (piece) { text += piece; onToken(piece) }
    }
  }
  return text
}`, tests: [
        { msg: "Calls onToken many times", fn: async (f) => { let n = 0; await f("Gift ideas for a runner", () => n++); return n > 5; } },
        { msg: "Resolves to the joined text", fn: async (f) => { let s = ""; const full = await f("Gift ideas for a gardener", (p) => { s += p; }); return typeof full === "string" && full === s && /Gift ideas/.test(full); } },
      ]},
      { t: "h", h: "Structuring Markdown and making the Genie context aware" },
      { t: "p", h: "Ask for the structure you want in the system message (a heading, a numbered list, bold gift names), and keep the conversation in a <code>messages</code> array so \"cheaper please\" makes sense. Push the user's message before the request and the assistant's reply after it." },
      { t: "h", h: "Few-shot prompting" },
      { t: "p", h: "Showing beats telling. <b>Few-shot</b> prompting puts one or more example exchanges in the messages so the model copies the format and tone. It's the fastest fix when the output shape keeps drifting." },
      { t: "code", lang: "javascript", code: `const messages = [
  { role: "system", content: "Reply with exactly three gifts, as '• name: reason (price)'." },
  { role: "user", content: "My boss who likes golf" },           // example input
  { role: "assistant", content: "• Personalised golf balls: …" },  // example output
  { role: "user", content: userText },                            // the real one
]` },
      { t: "h", h: "Temperature and top-p" },
      { t: "widget", name: "temperature" },
      { t: "p", h: "<b>temperature</b> (0 to 2) reshapes the probabilities before sampling: low is focused and repeatable, high is varied and eventually chaotic. <b>top_p</b> keeps only the most likely tokens whose probabilities add up to p. Adjust one, not both. Use 0 to 0.3 for extraction and classification, around 0.7 to 1 for ideas and writing." },
      { t: "quiz", q: "Your app extracts invoice totals from emails, and results vary between runs. What do you change first?", opts: ["Raise temperature to 1.5", "Lower temperature towards 0 and make the prompt and output format stricter", "Increase max_tokens"], a: 1, why: "Extraction needs consistency. Low temperature makes the most likely answer win nearly every time." },
      { t: "h", h: "The Responses API" },
      { t: "p", h: "OpenAI's newer <b>Responses API</b> takes <code>instructions</code> and <code>input</code> and returns <code>output_text</code>, with built-in tools such as web search. Chat Completions remains widely supported and is the format most other providers copy, so that's what the labs use. The concepts are identical." },
      { t: "code", lang: "javascript", code: `const response = await client.responses.create({
  model: "shipyard-mini",
  instructions: "You are the Gift Genie.",
  input: "A gift for my nephew who codes",
})
console.log(response.output_text)` },
      { t: "h", h: "JSON output and structured outputs" },
      { t: "p", h: "To use a reply in code, ask for JSON. <code>response_format: { type: \"json_object\" }</code> guarantees valid JSON. <b>Structured outputs</b> (<code>type: \"json_schema\"</code> with a schema) also guarantee its shape. Still validate: a model can follow the shape and still give a wrong value." },
      { t: "jsch", fn: "getGifts", prompt: "Write <code>getGifts(description)</code> that requests a completion with <code>response_format: { type: \"json_object\" }</code>, parses the content and resolves to the <code>gifts</code> array (each <code>{ name, reason, price }</code>).", starter: `async function getGifts(description) {

}`, solution: `async function getGifts(description) {
  const res = await fetch("${API}/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: "Bearer ${KEY}" },
    body: JSON.stringify({
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: "You are the Gift Genie. Reply as JSON: { gifts: [{ name, reason, price }] }" },
        { role: "user", content: description },
      ],
    }),
  })
  const data = await res.json()
  return JSON.parse(data.choices[0].message.content).gifts
}`, tests: [
        { msg: "Resolves to an array of 3 gifts", fn: async (f) => { const g = await f("Gift for a keen gardener"); return Array.isArray(g) && g.length === 3; } },
        { msg: "Each gift has name, reason and price", fn: async (f) => (await f("Gift for a programmer")).every((x) => x.name && x.reason && x.price) },
      ]},
      { t: "h", h: "Aside: the web search tool" },
      { t: "p", h: "Models only know their training data, which has a cutoff date. Several APIs offer a built-in <b>web search tool</b>: the model decides to search, the provider runs it, and the answer comes back with citations. For Gift Genie, that means current products and prices instead of guesses. You'll build your own tools in the agents lesson." },
      { t: "h", h: "Backend orientation" },
      { t: "diagram", name: "ai-backend" },
      { t: "p", h: "Everything above called the API from the browser with a practice key. A real key in frontend code is public: anyone can open DevTools and bill you. The fix is a small backend: the browser posts to <code>/api/gift</code>, your server validates the input, adds the system prompt and the key from <code>process.env</code>, and calls the model." },
      { t: "h", h: "Backend migration super challenge" },
      { t: "nch", browser: true, prompt: "Finish <code>server.js</code>: create an OpenAI client from <code>process.env.OPENAI_API_KEY</code>, and make <code>POST /api/gift</code> respond <code>400 { error }</code> without a <code>prompt</code>, otherwise <code>{ reply }</code> with the model's text. Use a system message. Catch API errors with a <code>502</code>.", requests: [{ url: "/api/gift", method: "POST", body: { prompt: "My mum, who loves running" } }, { url: "/api/gift", method: "POST", body: {} }], files: GG_FILES, solution: { "server.js": GG_SERVER_DONE }, tests: [
        { msg: "POST /api/gift returns { reply } from the model", fn: async (t) => { const r = await t.post("/api/gift", { prompt: "My uncle who loves cooking" }); return r.status === 200 && r.json && /skillet|cookbook|spice/i.test(r.json.reply); } },
        { msg: "Missing prompt → 400 with an error message", fn: async (t) => { const r = await t.post("/api/gift", {}); return r.status === 400 && r.json && typeof r.json.error === "string"; } },
        { msg: "Key comes from process.env, not hard-coded", fn: async (t) => /process\.env\.OPENAI_API_KEY/.test(t.src("server.js")) && !/sk-practice/.test(t.src("server.js")) && !/sk-/.test(t.src("public/index.js")) },
        { msg: "Sends a system message", fn: async (t) => /role:\s*["']system["']/.test(t.src("server.js")) },
      ] },
      { t: "recap", items: ["Keys in <code>.env</code>, read on the server only", "<code>messages</code>: system sets rules, user and assistant carry the history", "Tokens drive cost, limits and context windows", "<code>max_tokens</code> + <code>finish_reason</code>; check <code>res.ok</code> and handle 401/429", "Render Markdown only after escaping or sanitising", "Stream with SSE for fast-feeling UIs", "Few-shot examples, temperature, JSON mode and structured outputs shape the reply"] },
    ]},

    /* ───────────────────────── Solo: Translation app ───────────────────────── */
    { id: "ai-translate", title: "Solo Project - Translation App", min: 90, kind: "solo", body: [
      { t: "p", h: "Build <b>PolyGlot</b>: type some text, pick a language, get a translation. It's small, useful, and shows you can design a prompt that does one job reliably." },
      { t: "h", h: "Requirements" },
      { t: "steps", items: ["A textarea for the text (max 200 characters, with a counter)", "Radio buttons for French, Spanish and Japanese, in a <code>fieldset</code> with a <code>legend</code>", "A Translate button; show the result and a \"Start over\" button", "A system message that says to translate and return <b>only</b> the translation", "Low temperature, a sensible <code>max_tokens</code>, and errors shown to the user", "Stretch: keep a history of translations, or stream the reply"] },
      { t: "play", api: true, task: "The UI is done. Write <code>translate()</code> and wire up the form.", html: `<main>
  <header><h1>🦜 PolyGlot</h1><p>Perfect translations every time</p></header>
  <form id="f">
    <label for="text">Text to translate 👇</label>
    <textarea id="text" maxlength="200" required>Thank you</textarea>
    <fieldset>
      <legend>Select language 👇</legend>
      <label><input type="radio" name="lang" value="French" checked> 🇫🇷 French</label>
      <label><input type="radio" name="lang" value="Spanish"> 🇪🇸 Spanish</label>
      <label><input type="radio" name="lang" value="Japanese"> 🇯🇵 Japanese</label>
    </fieldset>
    <button>Translate</button>
  </form>
  <output id="result" aria-live="polite"></output>
</main>`, css: `*{box-sizing:border-box}body{margin:0;font-family:Poppins,system-ui,sans-serif;background:#f4f6fb;display:grid;place-items:start center;padding:24px 16px}
main{width:min(380px,100%);background:#fff;border-radius:18px;box-shadow:0 10px 30px rgba(20,30,80,.12);overflow:hidden}
header{background:#0f1a40 url() center/cover;color:#fff;text-align:center;padding:22px}header h1{margin:0;color:#32cd32}header p{margin:4px 0 0}
form{display:grid;gap:12px;padding:18px}label{font-weight:700;color:#035a9d}textarea{min-height:80px;border:0;background:#eef0f4;border-radius:8px;padding:10px;font:inherit}
fieldset{border:0;padding:0;display:grid;gap:6px}legend{font-weight:700;color:#035a9d;margin-bottom:6px}fieldset label{font-weight:500;color:#222}
button{background:#035a9d;color:#fff;border:0;border-radius:8px;padding:12px;font-weight:800;font-size:16px;cursor:pointer}
output{display:block;margin:0 18px 18px;padding:12px;background:#eef0f4;border-radius:8px;min-height:44px;font-size:18px}`, js: `const API = "${API}"
const KEY = "${KEY}"

async function translate(text, language) {
  // TODO: system message: translate into the language and return only the translation
  // TODO: low temperature; return the reply text
}

document.getElementById("f").addEventListener("submit", async (e) => {
  e.preventDefault()
  const language = document.querySelector("input[name=lang]:checked").value
  // TODO: show the translation in #result
})` },
      { t: "jsch", fn: "translate", prompt: "Write <code>translate(text, language)</code>. Use a system message that asks the model to <b>translate</b> into <code>language</code> and reply with only the translation. Put <code>text</code> in the user message, use <code>temperature: 0</code>, and resolve to the reply text.", starter: `async function translate(text, language) {

}`, solution: `async function translate(text, language) {
  const res = await fetch("${API}/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: "Bearer ${KEY}" },
    body: JSON.stringify({
      temperature: 0,
      max_tokens: 200,
      messages: [
        { role: "system", content: "You are an expert translator. Translate the user's text into " + language + ". Reply with only the translation." },
        { role: "user", content: text },
      ],
    }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error.message)
  return data.choices[0].message.content.trim()
}`, tests: [
        { msg: "\"Thank you\" → French: Merci", fn: async (f) => (await f("Thank you", "French")) === "Merci" },
        { msg: "\"Good morning\" → Spanish: Buenos días", fn: async (f) => (await f("Good morning", "Spanish")) === "Buenos días" },
        { msg: "\"See you tomorrow\" → Japanese", fn: async (f) => (await f("See you tomorrow", "Japanese")) === "また明日" },
      ]},
      { t: "callout", kind: "tip", h: "Prompt tip: say what <b>not</b> to do as well. \"Reply with only the translation, no quotes, no notes\" stops the model from chatting. For short, fixed jobs like this, low temperature keeps translations consistent." },
      { t: "recap", items: ["One job, one clear system message", "User text goes in the user message, never pasted into the system rules", "Low temperature for consistent results", "Accessible form: labels, fieldset and legend, aria-live result"] },
    ]},

    /* ───────────────────────── RAG and vector databases ───────────────────────── */
    { id: "ai-rag", title: "RAG and Vector Databases", min: 160, kind: "lesson", body: [
      { t: "h", h: "Your next big step in AI engineering" },
      { t: "p", h: "A model only knows what it was trained on. It doesn't know your product docs, your movie catalogue or anything after its cutoff, and when it doesn't know, it may invent something plausible. <b>Retrieval-augmented generation (RAG)</b> fixes that: find the relevant pieces of your own data first, then give them to the model with the question." },
      { t: "h", h: "What are embeddings?" },
      { t: "p", h: "An <b>embedding</b> is a list of numbers (a vector) that captures the meaning of some text. Texts with similar meaning get vectors pointing in similar directions, even with no words in common: \"a hilarious movie about cars\" lands near \"a funny film about automobiles\"." },
      { t: "widget", name: "embeddings" },
      { t: "h", h: "Create an embedding" },
      { t: "code", lang: "javascript", code: `const { data } = await client.embeddings.create({
  model: "text-embedding-3-small",       // real models give 512 to 3072 numbers
  input: "A hilarious comedy about cars", // a string, or an array of strings
})
console.log(data[0].embedding)            // [0.012, -0.044, …]` },
      { t: "jsch", fn: "createEmbedding", prompt: "Write <code>createEmbedding(text)</code> that POSTs <code>{ input: text }</code> to <code>" + API + "/embeddings</code> (with the practice key) and resolves to the embedding array.", starter: `async function createEmbedding(text) {

}`, solution: `async function createEmbedding(text) {
  const res = await fetch("${API}/embeddings", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: "Bearer ${KEY}" },
    body: JSON.stringify({ model: "shipyard-embed-64", input: text }),
  })
  const { data } = await res.json()
  return data[0].embedding
}`, tests: [
        { msg: "Resolves to an array of numbers", fn: async (f) => { const v = await f("A funny film"); return Array.isArray(v) && v.length === 64 && v.every((x) => typeof x === "number"); } },
        { msg: "Same text → same vector", fn: async (f) => JSON.stringify(await f("space")) === JSON.stringify(await f("space")) },
      ]},
      { t: "h", h: "Challenge: pair text with embedding" },
      { t: "p", h: "Embedding endpoints accept an array, so you can embed many texts in one request. The results come back in the same order, each with an <code>index</code>." },
      { t: "jsch", fn: "embedAll", prompt: "Write <code>embedAll(texts)</code>: send all the texts in <b>one</b> embeddings request, and resolve to an array of <code>{ content, embedding }</code> pairs in the same order.", starter: `async function embedAll(texts) {

}`, solution: `async function embedAll(texts) {
  const res = await fetch("${API}/embeddings", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: "Bearer ${KEY}" },
    body: JSON.stringify({ input: texts }),
  })
  const { data } = await res.json()
  return data.map((d) => ({ content: texts[d.index], embedding: d.embedding }))
}`, tests: [
        { msg: "One pair per text, in order", fn: async (f) => { const r = await f(["cats", "dogs", "space"]); return r.length === 3 && r[0].content === "cats" && r[2].content === "space" && r[1].embedding.length === 64; } },
        { msg: "Uses a single request", fn: async (f, ctx) => /input:\s*texts/.test(String(f)) || !/for\s*\(|\.map\(\s*async|forEach/.test(String(f)) },
      ]},
      { t: "h", h: "Semantic search" },
      { t: "p", h: "To find the best match, embed the query and compare it with every stored vector. The usual measure is <b>cosine similarity</b>: the dot product divided by the product of the lengths. Many embedding models return unit-length vectors, so the dot product alone gives the same ranking." },
      { t: "code", lang: "text", code: `cos(a, b) = (a · b) / (|a| × |b|)        a · b = Σ aᵢ × bᵢ        |a| = √(Σ aᵢ²)
1 → same direction    0 → unrelated    -1 → opposite` },
      { t: "jsch", fn: "cosineSimilarity", prompt: "Write <code>cosineSimilarity(a, b)</code> for two arrays of numbers of the same length.", starter: `function cosineSimilarity(a, b) {

}`, solution: `function cosineSimilarity(a, b) {
  let dot = 0, na = 0, nb = 0
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i]
    na += a[i] * a[i]
    nb += b[i] * b[i]
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb))
}`, tests: [
        { msg: "Same direction → 1", fn: (f) => Math.abs(f([1, 2, 3], [2, 4, 6]) - 1) < 1e-9 },
        { msg: "Perpendicular → 0", fn: (f) => Math.abs(f([1, 0], [0, 5])) < 1e-9 },
        { msg: "Opposite → -1", fn: (f) => Math.abs(f([1, 1], [-3, -3]) + 1) < 1e-9 },
        { msg: "[1, 2] vs [2, 1] → 0.8", fn: (f) => Math.abs(f([1, 2], [2, 1]) - 0.8) < 1e-9 },
      ]},
      { t: "jsch", fn: "semanticSearch", prompt: "Write <code>semanticSearch(query, docs, k)</code>: embed the query and the docs (one request for all of them is fine), rank docs by cosine similarity to the query, and resolve to the top <code>k</code> doc strings, best first. A <code>cosine</code> helper is provided.", starter: `const cosine = (a, b) => a.reduce((s, x, i) => s + x * b[i], 0) / (Math.hypot(...a) * Math.hypot(...b))

async function semanticSearch(query, docs, k = 1) {

}`, solution: `const cosine = (a, b) => a.reduce((s, x, i) => s + x * b[i], 0) / (Math.hypot(...a) * Math.hypot(...b))

async function semanticSearch(query, docs, k = 1) {
  const res = await fetch("${API}/embeddings", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: "Bearer ${KEY}" },
    body: JSON.stringify({ input: [query, ...docs] }),
  })
  const { data } = await res.json()
  const q = data[0].embedding
  return docs
    .map((doc, i) => ({ doc, score: cosine(q, data[i + 1].embedding) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, k)
    .map((r) => r.doc)
}`, tests: [
        { msg: "Finds the comedy about cars without shared words", fn: async (f) => (await f("a hilarious film about automobiles", ["A scary ghost story", "A funny movie about cars", "Astronauts lost in space", "A romantic wedding drama"]))[0] === "A funny movie about cars" },
        { msg: "Returns k results, best first", fn: async (f) => { const r = await f("astronaut on a distant planet", ["A dragon and a wizard", "Lost in space on a planet far away", "A cooking contest", "A galaxy of stars and aliens"], 2); return r.length === 2 && /space|galaxy/.test(r[0]) && /space|galaxy/.test(r[1]); } },
      ]},
      { t: "h", h: "Vector databases" },
      { t: "p", h: "Comparing against every vector works for hundreds of items, not millions. A <b>vector database</b> stores vectors next to their text and uses an index (like HNSW) to find nearest neighbours fast. Options include <b>pgvector</b> (a Postgres extension, used by Supabase and Neon), Pinecone, Weaviate, Qdrant and Chroma. If you already use Postgres, pgvector keeps your data in one place." },
      { t: "h", h: "Set up the vector database and store embeddings" },
      { t: "code", lang: "sql", code: `create extension if not exists vector;

create table documents (
  id bigserial primary key,
  content text not null,
  embedding vector(1536)   -- must match your embedding model's size
);

create index on documents using hnsw (embedding vector_cosine_ops);` },
      { t: "code", lang: "javascript", code: `// Supabase JS client: insert content + embedding pairs
const { error } = await supabase.from("documents").insert(pairs) // [{ content, embedding }]
if (error) throw new Error(error.message)` },
      { t: "h", h: "Query embeddings using similarity search" },
      { t: "p", h: "Wrap the search in a SQL function so the app can call it in one request. <code>&lt;=&gt;</code> is pgvector's cosine <b>distance</b> (1 minus similarity), so smaller is closer." },
      { t: "code", lang: "sql", code: `create or replace function match_documents(query_embedding vector(1536), match_threshold float, match_count int)
returns table (id bigint, content text, similarity float)
language sql stable as $$
  select id, content, 1 - (embedding <=> query_embedding) as similarity
  from documents
  where 1 - (embedding <=> query_embedding) > match_threshold
  order by embedding <=> query_embedding
  limit match_count;
$$;` },
      { t: "code", lang: "javascript", code: `const { data: matches } = await supabase.rpc("match_documents", {
  query_embedding: await createEmbedding(question),
  match_threshold: 0.5,
  match_count: 3,
})` },
      { t: "h", h: "Chunking text from documents" },
      { t: "p", h: "One embedding for a whole book blurs everything together. Split long documents into <b>chunks</b>: small enough to be about one thing, big enough to make sense alone. Overlap neighbouring chunks a little so a sentence cut at the boundary still appears whole somewhere. Libraries like LangChain's text splitters also try to break at paragraphs and sentences first." },
      { t: "jsch", fn: "chunkText", prompt: "Write <code>chunkText(text, size, overlap)</code> that returns chunks of at most <code>size</code> characters, where each chunk starts <code>size - overlap</code> characters after the previous one. Stop once a chunk reaches the end of the text.", starter: `function chunkText(text, size, overlap = 0) {

}`, solution: `function chunkText(text, size, overlap = 0) {
  const chunks = []
  const step = size - overlap
  for (let start = 0; start < text.length; start += step) {
    chunks.push(text.slice(start, start + size))
    if (start + size >= text.length) break
  }
  return chunks
}`, tests: [
        { msg: "No overlap: \"abcdefghij\", 4 → abcd, efgh, ij", fn: (f) => JSON.stringify(f("abcdefghij", 4)) === JSON.stringify(["abcd", "efgh", "ij"]) },
        { msg: "Overlap 2: \"abcdefghij\", 4 → abcd, cdef, efgh, ghij", fn: (f) => JSON.stringify(f("abcdefghij", 4, 2)) === JSON.stringify(["abcd", "cdef", "efgh", "ghij"]) },
        { msg: "Short text → one chunk", fn: (f) => JSON.stringify(f("hi", 10, 3)) === JSON.stringify(["hi"]) },
      ]},
      { t: "h", h: "Error handling and multiple matches" },
      { t: "p", h: "Check for errors at every step: the embeddings call, the insert, the query. With several matches, join their content into one context block, and handle <b>no matches</b> explicitly so the model says \"I don't know\" instead of guessing." },
      { t: "h", h: "Create a conversational response" },
      { t: "jsch", fn: "answerWithContext", prompt: "Write <code>answerWithContext(question, matches)</code>. <code>matches</code> is an array of strings. Send a system message telling the model to answer using only the context (and say \"Sorry, I don't know the answer.\" otherwise), and a user message formatted as <code>\"Context: …\\nQuestion: …\"</code> with the matches joined by spaces. Resolve to the reply.", starter: `async function answerWithContext(question, matches) {

}`, solution: `async function answerWithContext(question, matches) {
  const context = matches.join(" ")
  const res = await fetch("${API}/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: "Bearer ${KEY}" },
    body: JSON.stringify({
      temperature: 0.5,
      messages: [
        { role: "system", content: "You are an enthusiastic movie expert. Answer using only the context provided. If the answer is not in the context, say \\"Sorry, I don't know the answer.\\"" },
        { role: "user", content: "Context: " + context + "\\nQuestion: " + question },
      ],
    }),
  })
  const data = await res.json()
  return data.choices[0].message.content
}`, tests: [
        { msg: "Answers from the context it was given", fn: async (f) => /Galaxy Quest/.test(await f("A funny space movie?", ["Galaxy Quest is a 1999 comedy about actors from a space show who meet real aliens."])) },
        { msg: "No context → doesn't make something up", fn: async (f) => /don't know/i.test(await f("Who won the 1923 cup final?", [])) },
      ]},
      { t: "h", h: "Retrieval-augmented generation" },
      { t: "diagram", name: "rag-pipeline" },
      { t: "p", h: "That's RAG: <b>chunk → embed → store</b> once, then for each question <b>embed → search → answer with context</b>. It's how support bots answer from help centres, how coding assistants read your repository, and how you'll build PopChoice next." },
      { t: "callout", kind: "warn", h: "Retrieved text is data, not instructions. A document that says \"ignore previous instructions\" is a <b>prompt injection</b>. Keep your rules in the system message, put retrieved text clearly inside a context section, and never give the model abilities (tools, secrets) that a malicious document could trigger." },
      { t: "quiz", q: "You change embedding models after storing 10,000 chunks. Search results become nonsense. Why?", opts: ["The vector database is full", "Vectors from different models live in different spaces, so the old chunks must be re-embedded with the new model", "Cosine similarity only works with OpenAI models"], a: 1, why: "Each model has its own space and dimensions. Queries and stored documents must be embedded by the same model." },
      { t: "quiz", q: "What's the main job of chunk overlap?", opts: ["To make the database larger", "So text split at a boundary still appears intact in at least one chunk", "To speed up embedding"], a: 1, why: "Without overlap, a key sentence cut in half might not match either chunk well." },
      { t: "recap", items: ["Embeddings = meaning as vectors; similar meaning, similar direction", "Cosine similarity ranks matches; pgvector's <code>&lt;=&gt;</code> is distance", "Vector databases index vectors for fast nearest-neighbour search", "Chunk long text with overlap; embed queries and documents with the same model", "RAG: retrieve relevant context, then answer only from it", "Treat retrieved text as untrusted data"] },
    ]},

    /* ───────────────────────── Solo: Movie AI app ───────────────────────── */
    { id: "ai-movie", title: "Solo Project - Movie AI App", min: 120, kind: "solo", body: [
      { t: "p", h: "Build <b>PopChoice</b>: a few questions about what you're in the mood for, and it recommends a film from <b>your</b> catalogue, with a reason, using RAG." },
      { t: "h", h: "Requirements" },
      { t: "steps", items: ["Embed every movie's description once and store it (here: in memory; in the real project: a vector database)", "Ask three questions: favourite movie and why, new or classic, fun or serious", "Combine the answers into one query, embed it, and find the closest movie", "Send the match as context to the chat model and show its recommendation", "Show the title and year as well as the model's explanation", "Stretch: recommend for a group, or show the top 3"] },
      { t: "play", api: true, task: "The pipeline is sketched out. Fill in <code>embed()</code> and <code>recommend()</code>.", html: `<main>
  <h1>🍿 PopChoice</h1>
  <form id="f">
    <label>What's your favourite movie and why?<textarea id="q1">The Martian, because it's clever and funny</textarea></label>
    <label>Are you in the mood for something new or a classic?<textarea id="q2">Something new</textarea></label>
    <label>Do you want to have fun or do you want something serious?<textarea id="q3">Something fun with space and science</textarea></label>
    <button>Let's go</button>
  </form>
  <section id="out" aria-live="polite"></section>
</main>`, css: `*{box-sizing:border-box}body{margin:0;font-family:Carter One,system-ui,sans-serif;background:#000c36;color:#fff;display:grid;place-items:start center;padding:24px 16px}
main{width:min(420px,100%)}h1{text-align:center;font-size:34px}form{display:grid;gap:14px}
label{display:grid;gap:6px;font-size:15px}textarea{background:#3b4877;border:0;border-radius:8px;color:#fff;padding:10px;font:14px system-ui;min-height:56px}
button{background:#51e08a;color:#000c36;border:0;border-radius:8px;padding:12px;font-size:22px;font-weight:800;cursor:pointer}
#out{margin-top:16px;line-height:1.5}#out h2{font-size:26px;margin:0}`, js: `const API = "${API}"
const KEY = "${KEY}"
${MOVIES}
const cosine = (a, b) => a.reduce((s, x, i) => s + x * b[i], 0) / (Math.hypot(...a) * Math.hypot(...b))

async function embed(input) {
  // TODO: POST /embeddings; return the array of embeddings (one per input string)
}

async function recommend(query) {
  // TODO: embed the movies (once) and the query
  // TODO: find the most similar movie
  // TODO: ask the chat model to recommend it, with the movie as Context
  // TODO: return { movie, reply }
}

document.getElementById("f").addEventListener("submit", async (e) => {
  e.preventDefault()
  const query = ["q1", "q2", "q3"].map((id) => document.getElementById(id).value).join(" ")
  const { movie, reply } = await recommend(query)
  document.getElementById("out").innerHTML = "<h2>" + movie.title + " (" + movie.year + ")</h2>"
  document.getElementById("out").append(reply)
})` },
      { t: "jsch", fn: "recommend", prompt: "Write <code>recommend(query)</code> that embeds all the movies' <code>text</code> and the query, finds the closest movie by cosine similarity, asks the chat model for a recommendation with that movie's text as <code>Context:</code>, and resolves to <code>{ movie, reply }</code>.", starter: `${MOVIES}
const cosine = (a, b) => a.reduce((s, x, i) => s + x * b[i], 0) / (Math.hypot(...a) * Math.hypot(...b))

async function recommend(query) {

}`, solution: `${MOVIES}
const cosine = (a, b) => a.reduce((s, x, i) => s + x * b[i], 0) / (Math.hypot(...a) * Math.hypot(...b))
const headers = { "Content-Type": "application/json", Authorization: "Bearer ${KEY}" }

async function recommend(query) {
  const res = await fetch("${API}/embeddings", { method: "POST", headers, body: JSON.stringify({ input: [query, ...movies.map((m) => m.text)] }) })
  const { data } = await res.json()
  const q = data[0].embedding
  let best = 0, bestScore = -Infinity
  movies.forEach((m, i) => {
    const score = cosine(q, data[i + 1].embedding)
    if (score > bestScore) { bestScore = score; best = i }
  })
  const movie = movies[best]
  const chat = await fetch("${API}/chat/completions", {
    method: "POST", headers,
    body: JSON.stringify({ messages: [
      { role: "system", content: "You are an enthusiastic movie expert. Recommend the movie in the context, using only the context." },
      { role: "user", content: "Context: " + movie.title + " (" + movie.year + "): " + movie.text + "\\nQuestion: " + query },
    ] }),
  })
  const reply = (await chat.json()).choices[0].message.content
  return { movie, reply }
}`, tests: [
        { msg: "Space and science → The Martian or Galaxy Quest", fn: async (f) => { const r = await f("an astronaut stranded far away on a planet, science"); return r && r.movie && /Martian|Galaxy/.test(r.movie.title); } },
        { msg: "Scary → Hereditary", fn: async (f) => (await f("I want something terrifying and scary, horror")).movie.title === "Hereditary" },
        { msg: "Cooking and kids → Ratatouille, with a reply from context", fn: async (f) => { const r = await f("an animated film for my kids about food and cooking"); return r.movie.title === "Ratatouille" && typeof r.reply === "string" && /chef|Paris|rat/i.test(r.reply); } },
      ]},
      { t: "recap", items: ["Embed your catalogue once, the query each time", "Pick the nearest neighbour(s), then let the model explain", "Show structured data (title, year) from your database, not from the model", "Same pipeline scales with a vector database"] },
    ]},

    /* ───────────────────────── AI Agents ───────────────────────── */
    { id: "ai-agents", title: "AI Agents", min: 200, kind: "project", body: [
      { t: "h", h: "AI agent intro" },
      { t: "p", h: "An <b>agent</b> is a model in a loop that can take actions. Instead of answering straight away, it decides which tool it needs (look up the location, check the weather, search a database), your code runs the tool, and the result goes back in, until the model has enough to answer." },
      { t: "video", name: "agent" },
      { t: "h", h: "Prompt engineering and controlling response formats" },
      { t: "p", h: "Agents depend on the model producing output your code can parse. Be explicit: give the format, give examples, and use delimiters. Ask for one action at a time. The tighter the format, the fewer surprises." },
      { t: "h", h: "Zooming out and agent setup" },
      { t: "p", h: "Our agent suggests activities based on the user's location and weather. It has two tools, written as ordinary functions. In a real app they'd call a geolocation and a weather API; here they return fixed data." },
      { t: "code", lang: "javascript", code: `async function getCurrentWeather(location) {
  return JSON.stringify({ location, temperature: "22", unit: "C", forecast: "sunny" })
}
async function getLocation() {
  return JSON.stringify({ city: "Leeds", country: "UK" })
}
const availableFunctions = { getCurrentWeather, getLocation }` },
      { t: "h", h: "Introduction to ReAct prompting" },
      { t: "p", h: "<b>ReAct</b> (reason + act) prompting asks the model to write a <b>Thought</b>, choose an <b>Action</b>, then <b>PAUSE</b>. Your code runs the action and replies with an <b>Observation</b>. The loop repeats until the model writes an <b>Answer</b>. It works with any chat model, because it's all just text." },
      { t: "code", lang: "text", code: REACT_PROMPT },
      { t: "h", h: "Parsing the action" },
      { t: "jsch", fn: "parseAction", prompt: "Write <code>parseAction(text)</code>. Find a line like <code>Action: getCurrentWeather: Leeds</code> and return <code>{ name, arg }</code> (trimmed). Return <code>null</code> when there's no Action line.", starter: `function parseAction(text) {

}`, solution: `function parseAction(text) {
  const match = text.match(/^Action:\\s*(\\w+):\\s*(.*)$/m)
  return match ? { name: match[1], arg: match[2].trim() } : null
}`, tests: [
        { msg: "Finds the action in a multi-line reply", fn: (f) => { const r = f("Thought: I need the weather.\nAction: getCurrentWeather: Salt Lake City\nPAUSE"); return r && r.name === "getCurrentWeather" && r.arg === "Salt Lake City"; } },
        { msg: "Works with null arguments", fn: (f) => { const r = f("Action: getLocation: null\nPAUSE"); return r.name === "getLocation" && r.arg === "null"; } },
        { msg: "No action → null", fn: (f) => f("Answer: Go for a picnic!") === null },
      ]},
      { t: "h", h: "Finally! The loop" },
      { t: "p", h: "Each turn: call the model, check for an Answer, otherwise parse the action, run the function, and push the result as an Observation. A <b>maximum number of turns</b> stops a confused agent from looping (and billing you) forever." },
      { t: "jsch", fn: "runReAct", prompt: "Write <code>runReAct(question, tools, maxTurns = 5)</code>. Start with <code>REACT_PROMPT</code> as the system message and the question as the user message. Each turn, add the reply as an assistant message. If it contains <code>Answer:</code>, resolve to the text after it. Otherwise parse the action, <code>await tools[name](arg)</code>, and add <code>\"Observation: \" + result</code> as a user message. After <code>maxTurns</code>, resolve to <code>\"I couldn't finish.\"</code>", starter: `const REACT_PROMPT = ${JSON.stringify(REACT_PROMPT)}

async function runReAct(question, tools, maxTurns = 5) {

}`, solution: `const REACT_PROMPT = ${JSON.stringify(REACT_PROMPT)}

async function runReAct(question, tools, maxTurns = 5) {
  const messages = [{ role: "system", content: REACT_PROMPT }, { role: "user", content: question }]
  for (let i = 0; i < maxTurns; i++) {
    const res = await fetch("${API}/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer ${KEY}" },
      body: JSON.stringify({ messages }),
    })
    const reply = (await res.json()).choices[0].message.content
    messages.push({ role: "assistant", content: reply })
    const answer = reply.match(/Answer:\\s*([\\s\\S]*)/)
    if (answer) return answer[1].trim()
    const action = reply.match(/^Action:\\s*(\\w+):\\s*(.*)$/m)
    if (!action || !tools[action[1]]) throw new Error("Unknown action in: " + reply)
    const result = await tools[action[1]](action[2].trim())
    messages.push({ role: "user", content: "Observation: " + result })
  }
  return "I couldn't finish."
}`, tests: [
        { msg: "Calls getLocation, then getCurrentWeather with the city", fn: async (f) => { const calls = []; await f("Suggest some activities for today", { getLocation: async () => { calls.push("loc"); return JSON.stringify({ city: "Leeds" }); }, getCurrentWeather: async (c) => { calls.push("wx:" + c); return JSON.stringify({ temperature: 24, forecast: "sunny" }); } }); return calls.join(",") === "loc,wx:Leeds"; } },
        { msg: "Resolves to the final answer text", fn: async (f) => { const a = await f("Ideas for this afternoon?", { getLocation: async () => "{\"city\":\"Oslo\"}", getCurrentWeather: async () => "{\"temperature\":4}" }); return typeof a === "string" && /museum|café|climbing/.test(a) && !/Answer:/.test(a); } },
        { msg: "Stops after maxTurns", fn: async (f) => (await f("Any ideas?", { getLocation: async () => "{\"city\":\"Rome\"}", getCurrentWeather: async () => "{}" }, 1)) === "I couldn't finish." },
      ]},
      { t: "h", h: "Function calling: intro and demo" },
      { t: "p", h: "ReAct relies on parsing text. Modern APIs offer <b>tool calling</b> (also called function calling): you describe tools with a JSON schema, and the model replies with a structured <code>tool_calls</code> array instead of text, with <code>finish_reason: \"tool_calls\"</code>. No regex needed." },
      { t: "code", lang: "javascript", code: `const tools = [
  { type: "function", function: { name: "getLocation", description: "Get the user's current location", parameters: { type: "object", properties: {} } } },
  { type: "function", function: { name: "getCurrentWeather", description: "Get the current weather",
    parameters: { type: "object", properties: { location: { type: "string" } }, required: ["location"] } } },
]

// The model's reply:
{ role: "assistant", content: null, tool_calls: [
  { id: "call_abc", type: "function", function: { name: "getLocation", arguments: "{}" } } ] }

// You run it and reply with:
{ role: "tool", tool_call_id: "call_abc", content: "{\\"city\\":\\"Leeds\\"}" }` },
      { t: "h", h: "Loop logic, tool calls and automatic function calls" },
      { t: "steps", items: ["Send <code>messages</code> and <code>tools</code>", "If <code>finish_reason</code> is <code>\"stop\"</code>, return the content", "Otherwise push the assistant message (with its <code>tool_calls</code>) onto <code>messages</code>", "For each call: <code>JSON.parse(call.function.arguments)</code>, look the function up by name, run it", "Push <code>{ role: \"tool\", tool_call_id: call.id, content: result }</code>", "Loop, up to a maximum number of turns"] },
      { t: "jsch", fn: "runAgent", prompt: "Write <code>runAgent(query, functions)</code> using tool calling. <code>functions</code> maps names to async functions that take an arguments object. Build the <code>tools</code> array from the names (a description and an empty-object schema are fine), loop up to 5 times, run every tool call, push the results as <code>tool</code> messages, and resolve to the final content.", starter: `async function runAgent(query, functions) {

}`, solution: `async function runAgent(query, functions) {
  const tools = Object.keys(functions).map((name) => ({
    type: "function",
    function: { name, description: "Runs " + name, parameters: { type: "object", properties: { location: { type: "string" } } } },
  }))
  const messages = [
    { role: "system", content: "You are a helpful agent. Use the tools when you need facts." },
    { role: "user", content: query },
  ]
  for (let i = 0; i < 5; i++) {
    const res = await fetch("${API}/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer ${KEY}" },
      body: JSON.stringify({ messages, tools }),
    })
    const { choices } = await res.json()
    const { message, finish_reason } = choices[0]
    if (finish_reason !== "tool_calls") return message.content
    messages.push(message)
    for (const call of message.tool_calls) {
      const fn = functions[call.function.name]
      const result = await fn(JSON.parse(call.function.arguments))
      messages.push({ role: "tool", tool_call_id: call.id, content: String(result) })
    }
  }
  return "Sorry, I couldn't finish that."
}`, tests: [
        { msg: "Runs getLocation, then getCurrentWeather with { location }", fn: async (f) => { const calls = []; await f("What should I do today based on the weather?", { getLocation: async () => { calls.push("loc"); return JSON.stringify({ city: "Lisbon" }); }, getCurrentWeather: async (a) => { calls.push("wx:" + (a && a.location)); return JSON.stringify({ temperature: 26, forecast: "sunny" }); } }); return calls.join(",") === "loc,wx:Lisbon"; } },
        { msg: "Final answer uses the tool results", fn: async (f) => /26°C and sunny/.test(await f("Suggest activities for today", { getLocation: async () => JSON.stringify({ city: "Lisbon" }), getCurrentWeather: async () => JSON.stringify({ temperature: 26, forecast: "sunny" }) })) },
      ]},
      { t: "h", h: "Adding UI to the agent" },
      { t: "play", api: true, task: "A proof-of-concept UI that shows each step. Ask it something, then watch the console to see the tool calls and their results.", html: `<main>
  <h1>🗺️ Day Planner agent</h1>
  <form id="f"><input id="q" value="What should I do today based on my location and the weather?" aria-label="Your question"><button>Ask</button></form>
  <ol id="steps" aria-live="polite"></ol>
</main>`, css: `body{font-family:system-ui;background:#0e1325;color:#e8ecf7;margin:0;padding:24px}main{max-width:560px;margin:auto}
form{display:flex;gap:8px}input{flex:1;padding:10px;border-radius:10px;border:1px solid #39406b;background:#161b2e;color:inherit}
button{padding:0 16px;border:0;border-radius:10px;background:#7c5cff;color:#fff;font-weight:700}
#steps{padding-left:20px}#steps li{margin:10px 0;padding:10px;border-radius:10px;background:#161b2e;white-space:pre-wrap}.tool{border-left:4px solid #ffb347}.ans{border-left:4px solid #5eead4}`, js: `const API = "${API}"
const KEY = "${KEY}"
const functions = {
  getLocation: async () => JSON.stringify({ city: "Leeds", country: "UK" }),
  getCurrentWeather: async ({ location }) => JSON.stringify({ location, temperature: 21, forecast: "sunny" }),
}
const tools = Object.keys(functions).map((name) => ({ type: "function", function: { name, parameters: { type: "object", properties: {} } } }))
const step = (text, cls) => { const li = document.createElement("li"); li.textContent = text; li.className = cls; document.getElementById("steps").append(li) }

document.getElementById("f").addEventListener("submit", async (e) => {
  e.preventDefault()
  document.getElementById("steps").innerHTML = ""
  const messages = [{ role: "user", content: document.getElementById("q").value }]
  for (let i = 0; i < 5; i++) {
    const res = await fetch(API + "/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + KEY },
      body: JSON.stringify({ messages, tools }),
    })
    const { message, finish_reason } = (await res.json()).choices[0]
    if (finish_reason !== "tool_calls") { step(message.content, "ans"); return }
    messages.push(message)
    for (const call of message.tool_calls) {
      const result = await functions[call.function.name](JSON.parse(call.function.arguments))
      console.log(call.function.name, call.function.arguments, "→", result)
      step("🔧 " + call.function.name + "(" + call.function.arguments + ") → " + result, "tool")
      messages.push({ role: "tool", tool_call_id: call.id, content: result })
    }
  }
})` },
      { t: "callout", kind: "warn", h: "Agents act on your behalf, so design for safety: give each tool the least power it needs, validate the model's arguments like any user input, ask a human before anything irreversible (sending email, paying, deleting), cap the number of turns, and log every step." },
      { t: "quiz", q: "In tool calling, who actually runs getCurrentWeather?", opts: ["The model provider's servers", "Your code: the model only asks for the call, with arguments", "The browser automatically"], a: 1, why: "The model returns a tool call. Your code decides whether to run it, runs it, and sends the result back." },
      { t: "quiz", q: "Why does an agent loop need a maximum number of iterations?", opts: ["APIs reject more than five calls", "A model can keep calling tools without converging, costing money and time", "To make responses shorter"], a: 1, why: "Without a cap, a confused agent can loop forever. Always stop and report back after a limit." },
      { t: "h", h: "Nice work!" },
      { t: "p", h: "You've built every core pattern behind today's AI products: prompts and messages, streaming, structured output, a secure backend, embeddings, RAG and agents. The same ideas extend to the Model Context Protocol (MCP), which standardises how tools are offered to models, and to multi-agent systems." },
      { t: "recap", items: ["Agent = model + tools + loop", "ReAct: Thought → Action → PAUSE → Observation → … → Answer", "Tool calling returns structured <code>tool_calls</code>; reply with <code>role: \"tool\"</code> messages", "Your code runs the tools: validate arguments, limit power, cap the loop", "Confirm with a human before irreversible actions"] },
    ]},
  ],
};
