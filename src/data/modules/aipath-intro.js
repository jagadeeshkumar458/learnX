/* AI Engineer Path — bodies for "Intro to AI Engineering" and "Embeddings and Vector Databases".
   Most lessons reuse sections of the Fullstack path's AI Engineering module (src/data/modules/ai.js),
   split at its headings so each video-sized lesson gets its own focused page. */
import { AI } from "./ai.js";

const lesson = (id) => AI.lessons.find((l) => l.id === id).body;
/** The blocks under heading `h` (up to the next heading), without the heading itself. */
export function section(body, h) {
  const i = body.findIndex((b) => b.t === "h" && b.h.toLowerCase() === h.toLowerCase());
  if (i < 0) throw new Error("No section " + h);
  const out = [];
  for (let j = i + 1; j < body.length && body[j].t !== "h"; j++) out.push(body[j]);
  return out;
}
const F = lesson("ai-fund"), W = lesson("ai-welcome"), R = lesson("ai-rag");
const API = "https://api.shipyard.dev/v1";

export const INTRO_BODIES = {
  "Introducing Your AI Superpower": [...W.filter((b) => b.t !== "recap"), ...section(F, "Introducing your AI superpower")],
  "The AI Marketplace": section(F, "The AI marketplace").filter((b) => !/Recommended models/.test(b.h || "")),
  "Environment Setup": [
    { t: "p", h: "An AI provider gives you an <b>API key</b>: a secret that identifies you and is billed for every token. Treat it like a password. Store it in an environment variable, load it with <code>dotenv</code> (or your framework's env support), and add <code>.env</code> to <code>.gitignore</code> before your first commit." },
    { t: "code", lang: "bash", code: `npm install openai dotenv
echo "OPENAI_API_KEY=sk-..." > .env
echo ".env" >> .gitignore` },
    { t: "callout", kind: "warn", h: "If a key ever lands in git or a public page, revoke it in the provider's dashboard immediately and create a new one. Bots scan GitHub for keys within minutes." },
  ],
  "Recommended Models": section(F, "The AI marketplace").filter((b) => /Recommended models/.test(b.h || "")).concat([
    { t: "p", h: "Pick by task: small, fast models for classification, extraction and short replies; larger reasoning models for multi-step problems and code; specialised models for embeddings, images and speech. Compare on <b>your</b> prompts: a quick side-by-side on twenty real examples beats any leaderboard." },
    { t: "quiz", q: "You're building a feature that tags support emails into five categories. Which model should you try first?", opts: ["The biggest, most expensive reasoning model", "A small, fast, cheap model, then measure accuracy on real emails", "An image model"], a: 1, why: "Classification is easy for small models. Start cheap and upgrade only if measurements show you need to." },
  ]),
  "Setting Up Your AI Client": section(F, "Environment setup and the AI client").filter((b) => b.lang !== "bash"),
  "Your First AI Request": section(F, "Your first AI request"),
  "Your First AI Request Walkthrough": [
    { t: "steps", items: ["<code>import OpenAI from \"openai\"</code>: the official SDK, a thin wrapper over HTTP", "<code>import \"dotenv/config\"</code>: loads <code>.env</code> into <code>process.env</code>", "<code>new OpenAI({ apiKey })</code>: one client, reused for every request", "<code>client.chat.completions.create({ model, messages })</code>: sends the conversation and waits for the reply", "<code>completion.choices[0].message.content</code>: the text. There can be several choices if you ask for <code>n &gt; 1</code>", "<code>completion.usage</code>: prompt and completion tokens, which is what you pay for"] },
    { t: "callout", kind: "tip", h: "<code>await</code> at the top level works because the file is an ES module (<code>\"type\": \"module\"</code> in package.json)." },
  ],
  "Rebuilding Your First AI Request": section(F, "Rebuilding the request with fetch"),
  "Shorter Responses With Tokens": section(F, "Shorter responses with tokens"),
  "Refining Our Prompt": section(F, "Refining the prompt"),
  "Refactoring Our AI Request": [
    { t: "p", h: "Every request repeats the URL, headers and error handling. Wrap them in one function so the rest of the app just says <code>ask(messages)</code>. It's also the one place to change when you switch providers." },
    { t: "code", lang: "javascript", code: `async function ask(messages, options = {}) {
  const res = await fetch("${API}/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: "Bearer " + KEY },
    body: JSON.stringify({ model: "shipyard-mini", messages, ...options }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error.message)
  return data.choices[0].message.content
}` },
  ],
  "Model Snapshots": section(F, "Model snapshots"),
  "The Messages Array": section(F, "The messages array and the system message"),
  "The System Message": [
    { t: "p", h: "The <b>system</b> (or <b>developer</b>) message sets the model's role, tone, rules and output format for the whole conversation. Users can't see it, but it isn't secret: assume a determined user can get the model to repeat it, so never put keys or private data there." },
    { t: "code", lang: "javascript", code: `{ role: "system", content: \`You are the Gift Genie, a warm and concise gift advisor.
Suggest exactly three gifts. For each: a bold name, one sentence why, and a rough price.
If the request isn't about gifts, politely steer back to gifts.\` }` },
    { t: "quiz", q: "Where do rules like \"always answer in Markdown with three ideas\" belong?", opts: ["In every user message", "In the system message", "In the model name"], a: 1, why: "The system message applies to the whole conversation and is where behaviour and format rules go." },
  ],
  "Aside: Token Costs & Context Windows": section(F, "Aside: token costs and context windows"),
  "Wiring up our UI": [
    { t: "p", h: "Connecting AI to a UI is ordinary DOM work: read the input, show a loading state, disable the button while waiting, render the reply, and always re-enable the button, even when the request fails." },
    { t: "code", lang: "javascript", code: `form.addEventListener("submit", async (e) => {
  e.preventDefault()
  button.disabled = true
  out.textContent = "The genie is thinking…"
  try {
    out.textContent = await ask([{ role: "user", content: input.value }])
  } catch (err) {
    out.textContent = "⚠️ " + err.message
  } finally {
    button.disabled = false
  }
})` },
  ],
  "Error Handling": section(F, "Error handling"),
  "Rendering Markdown Safely": section(F, "Rendering Markdown safely"),
  "Streaming AI Responses": section(F, "Streaming AI responses"),
  "Gift Genie UI Streaming Challenge": section(F, "Gift Genie UI streaming challenge"),
  "Structuring Our Markdown Responses": [
    { t: "p", h: "If you're rendering Markdown, ask for exactly the Markdown you can render and style: \"Reply with a level-2 heading, then a numbered list of three items, each starting with the gift name in bold.\" Consistent structure means consistent CSS." },
  ],
  "Making Our Gift Genie Context Aware": section(F, "Structuring Markdown and making the Genie context aware"),
  "Few Shot Prompting": section(F, "Few-shot prompting"),
  "Temperature & Top P": section(F, "Temperature and top-p"),
  "Responses API Intro": section(F, "The Responses API"),
  "JSON Output": section(F, "JSON output and structured outputs"),
  "Structured Outputs": [
    { t: "p", h: "JSON mode guarantees valid JSON, not the right shape. <b>Structured outputs</b> take a JSON Schema and guarantee the reply matches it: required fields present, types correct, enums respected. Libraries like Zod generate the schema from a TypeScript-friendly definition." },
    { t: "code", lang: "javascript", code: `response_format: {
  type: "json_schema",
  json_schema: {
    name: "gift_ideas",
    strict: true,
    schema: {
      type: "object",
      properties: {
        gifts: { type: "array", items: { type: "object",
          properties: { name: { type: "string" }, reason: { type: "string" }, price: { type: "string" } },
          required: ["name", "reason", "price"], additionalProperties: false } },
      },
      required: ["gifts"], additionalProperties: false,
    },
  },
}` },
  ],
  "Aside: Web Search Tool": section(F, "Aside: the web search tool"),
  "Web Search In The Gift Genie UI": [
    { t: "p", h: "With web search, replies include citations. Render them as real links (with <code>rel=\"noopener\"</code>), show which suggestions came from the web, and tell users that prices may have changed. Search adds latency and cost per request, so make it opt-in, like a \"Find current prices\" toggle." },
  ],
  "Backend Orientation": section(F, "Backend orientation"),
  "Backend Migration Super Challenge": section(F, "Backend migration super challenge"),
  "Outro": F.filter((b) => b.t === "recap"),
  "Solo Project - PollyGlot": lesson("ai-translate"),
};

export const RAG_BODIES = {
  "Your next big step in AI engineering": section(R, "Your next big step in AI engineering"),
  "What are embeddings?": section(R, "What are embeddings?"),
  "Set up environment variables": [
    { t: "p", h: "This project talks to two services: the model provider (for embeddings and chat) and Supabase (for the vector database). Keep both keys in <code>.env</code>, on the server." },
    { t: "code", lang: "bash", code: `OPENAI_API_KEY=sk-...
SUPABASE_URL=https://xyzcompany.supabase.co
SUPABASE_API_KEY=eyJhbGciOi...   # service key on the server only; never in the browser` },
  ],
  "Create an embedding": section(R, "Create an embedding"),
  "Challenge: Pair text with embedding": section(R, "Challenge: pair text with embedding"),
  "Vector databases": section(R, "Vector databases"),
  "Supabase Dependency Upgrade Warning": [
    { t: "callout", kind: "warn", h: "Libraries change. If a tutorial's code fails after an install, check the installed version (<code>npm ls @supabase/supabase-js</code>) against the docs, read the changelog for breaking changes, and pin versions in <code>package.json</code> so a fresh install gives you the same code that worked." },
  ],
  "Set up your vector database": section(R, "Set up the vector database and store embeddings").filter((b) => b.lang === "sql"),
  "Store vector embeddings": section(R, "Set up the vector database and store embeddings").filter((b) => b.lang !== "sql"),
  "Semantic search": section(R, "Semantic search"),
  "Query embeddings using similarity search": section(R, "Query embeddings using similarity search"),
  "Create a conversational response using OpenAI": section(R, "Create a conversational response"),
  "Chunking text from documents": section(R, "Chunking text from documents"),
  "Challenge: Split text, get vectors, insert into Supabase": [
    { t: "p", h: "Put the pieces together into an ingestion script: read the document, chunk it, embed all chunks in one request, and insert <code>{ content, embedding }</code> rows. Run it once (or whenever the document changes)." },
    { t: "code", lang: "javascript", code: `const text = await fs.readFile("movies.txt", "utf8")
const chunks = chunkText(text, 500, 50)
const { data } = await openai.embeddings.create({ model: "text-embedding-3-small", input: chunks })
const rows = data.map((d) => ({ content: chunks[d.index], embedding: d.embedding }))
const { error } = await supabase.from("documents").insert(rows)
if (error) throw new Error(error.message)` },
    ...section(R, "Challenge: pair text with embedding").filter((b) => b.t === "jsch"),
  ],
  "Error handling": [
    { t: "p", h: "Every step can fail: the embeddings request (rate limits, bad key), the insert (wrong vector size, missing table), the query. Check <code>error</code> after each Supabase call, catch API errors, and show users a friendly message rather than an empty answer." },
  ],
  "Query database and manage multiple matches": section(R, "Error handling and multiple matches"),
  "AI chatbot proof of concept": [
    { t: "p", h: "A proof of concept chats about your documents: keep the conversation in a messages array, and for each question retrieve fresh context and add it to the latest user message. Keep the instructions to answer only from context in the system message." },
  ],
  "Retrieval-augmented generation (RAG)": section(R, "Retrieval-augmented generation"),
  "Solo Project: PopChoice": lesson("ai-movie"),
  "You made it to the finish line!": R.filter((b) => b.t === "recap"),
};
