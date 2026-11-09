/* AI Engineer Path — Vercel AI SDK: a customer support agent for Openswap with retrieval, structured outputs,
   tool calling, routing and web search. The SDK code is shown as reference; labs rebuild each piece with fetch
   against the practice API so you see what the SDK does underneath. */
import { section } from "./aipath-intro.js";
import { AI } from "./ai.js";

const R = AI.lessons.find((l) => l.id === "ai-rag").body;
const API = "https://api.shipyard.dev/v1";
const KEY = "sk-practice-123";
const H = `headers: { "Content-Type": "application/json", Authorization: "Bearer ${KEY}" }`;

const DOCS = `const docs = [
  { title: "Resetting your password", content: "Reset your password from the login page: choose Forgot password and follow the email link. The link expires after one hour." },
  { title: "Creating a listing", content: "Create a listing from your profile. Add clear photos, a short description and the item's condition." },
  { title: "Shipping a swap", content: "Post items with tracking. Both members confirm when their parcel arrives, then the swap is complete." },
  { title: "Refunds and fees", content: "Openswap is free. Premium membership can be refunded within 14 days from the billing page." },
  { title: "Staying safe", content: "Meet in public places for local swaps and never share your bank details in messages." },
]`;
const COS = `const cosine = (a, b) => a.reduce((s, x, i) => s + x * b[i], 0)`;
const WEB = `const pages = [
  { title: "Royal Mail strike dates announced", snippet: "Postal workers will strike on Monday and Tuesday, delaying parcel deliveries.", url: "https://news.example/strike" },
  { title: "Electric car sales hit a record", snippet: "Electric cars made up a quarter of new sales this year.", url: "https://news.example/ev" },
  { title: "Retro game prices keep rising", snippet: "Collectors are paying more for 90s cartridges.", url: "https://news.example/retro" },
]
function webSearch({ query = "" }) {
  const w = query.toLowerCase().split(/\\W+/).filter((x) => x.length > 2)
  return pages.filter((p) => w.some((x) => (p.title + " " + p.snippet).toLowerCase().includes(x)))
}`;
const KB = `async function searchKnowledgeBase({ query }) {
  const res = await fetch("${API}/embeddings", {
    method: "POST", ${H},
    body: JSON.stringify({ input: [query, ...docs.map((d) => d.content)] }),
  })
  const [q, ...vectors] = (await res.json()).data.map((d) => d.embedding)
  return docs.map((d, i) => ({ ...d, score: cosine(q, vectors[i]) })).sort((a, b) => b.score - a.score).slice(0, 2)
}`;
const KB_TOOL = `{ type: "function", function: { name: "searchKnowledgeBase",
    description: "Search Openswap help centre articles about accounts, passwords, listings, shipping swaps, refunds and safety",
    parameters: { type: "object", properties: { query: { type: "string" } }, required: ["query"] } } }`;
const WEB_TOOL = `{ type: "function", function: { name: "webSearch",
    description: "Search the web for current events, news, strikes, weather and prices",
    parameters: { type: "object", properties: { query: { type: "string" } }, required: ["query"] } } }`;
const TICKET_SCHEMA = `{
  type: "object",
  properties: {
    category: { type: "string", enum: ["billing", "bug", "account", "other"] },
    priority: { type: "string", enum: ["low", "medium", "high"] },
    summary: { type: "string" },
    needsHuman: { type: "boolean" },
  },
  required: ["category", "priority", "summary", "needsHuman"],
  additionalProperties: false,
}`;
const LOOP = (fns) => `  for (let step = 0; step < 5; step++) {
    const res = await fetch("${API}/chat/completions", { method: "POST", ${H}, body: JSON.stringify({ messages, tools }) })
    const { message, finish_reason } = (await res.json()).choices[0]
    messages.push(message)
    if (finish_reason !== "tool_calls") return message.content
    for (const call of message.tool_calls) {
      const result = await ${fns}[call.function.name](JSON.parse(call.function.arguments))
      messages.push({ role: "tool", tool_call_id: call.id, content: JSON.stringify(result) })
    }
  }
  return "Sorry, I couldn't finish that."`;

export const VERCEL_BODIES = {
  "Customer support AI agent intro": [
    { t: "p", h: "In this section you build Openswap's <b>customer support agent</b>. It answers from the help centre (retrieval), searches the web for things the docs can't know, classifies problems into tickets (structured output), and decides which of those to use for each question (routing). You'll use the <b>Vercel AI SDK</b>, a TypeScript toolkit that gives every model provider the same API." },
    { t: "diagram", name: "support-agent" },
  ],
  "Retrieval augmented generation refresher": [
    ...section(R, "Retrieval-augmented generation"),
    { t: "diagram", name: "rag-pipeline" },
  ],
  "Embeddings recap": [
    { t: "p", h: "An embedding turns text into a vector of numbers that captures its meaning: similar meanings give vectors that point the same way. Measure that with <b>cosine similarity</b> (for normalised vectors, just the dot product). Always embed questions with the <b>same model</b> you used for the documents." },
    { t: "widget", name: "embeddings" },
  ],
  "Vector database embed documents": [
    { t: "p", h: "With the AI SDK, <code>embedMany</code> embeds a batch of chunks in one call. Store each chunk's text with its vector (pgvector in Supabase, or any vector store)." },
    { t: "code", lang: "javascript", code: `import { embedMany } from "ai"
import { openai } from "@ai-sdk/openai"

const { embeddings } = await embedMany({
  model: openai.embedding("text-embedding-3-small"),
  values: chunks,
})
await supabase.from("help_articles").insert(chunks.map((content, i) => ({ content, embedding: embeddings[i] })))` },
  ],
  "Vector database retrieval": [
    { t: "p", h: "To retrieve, embed the question with <code>embed</code> and ask the database for the nearest chunks (a <code>match_documents</code> function using pgvector's <code>&lt;=&gt;</code> operator). Return the top few above a similarity threshold." },
    { t: "code", lang: "javascript", code: `import { embed } from "ai"
const { embedding } = await embed({ model: openai.embedding("text-embedding-3-small"), value: question })
const { data } = await supabase.rpc("match_documents", { query_embedding: embedding, match_threshold: 0.5, match_count: 3 })` },
  ],
  "Challenge: Vector database retrieval": [
    { t: "jsch", fn: "retrieve", prompt: "Write <code>retrieve(question, k)</code>: embed the question and every doc's <code>content</code> in <b>one</b> request to <code>" + API + "/embeddings</code> (<code>input</code> is an array), score each doc with <code>cosine</code>, and resolve to the titles of the top <code>k</code> docs, best first.", starter: `${DOCS}\n${COS}\n\nasync function retrieve(question, k = 2) {\n\n}`, solution: `${DOCS}\n${COS}\n\nasync function retrieve(question, k = 2) {\n  const res = await fetch("${API}/embeddings", {\n    method: "POST",\n    ${H},\n    body: JSON.stringify({ input: [question, ...docs.map((d) => d.content)] }),\n  })\n  const [q, ...vectors] = (await res.json()).data.map((d) => d.embedding)\n  return docs\n    .map((d, i) => ({ title: d.title, score: cosine(q, vectors[i]) }))\n    .sort((a, b) => b.score - a.score)\n    .slice(0, k)\n    .map((d) => d.title)\n}`, tests: [
      { msg: "A password question finds the password article first", fn: async (f) => (await f("I forgot my password", 2))[0] === "Resetting your password" },
      { msg: "A parcel question finds the shipping article", fn: async (f) => (await f("How should I post my parcel with tracking?", 1))[0] === "Shipping a swap" },
      { msg: "Returns k titles", fn: async (f) => (await f("refund my premium membership", 3)).length === 3 },
    ] },
  ],
  "Vector database text splitting and retrieval": [
    ...section(R, "Chunking text from documents"),
  ],
  "Vercel AI SDK basics": [
    { t: "p", h: "The AI SDK's core functions are <code>generateText</code> (wait for the whole reply) and <code>streamText</code> (stream it). You pass a <b>model</b> from a provider package, plus <code>system</code> and either <code>prompt</code> or <code>messages</code>. Changing providers means changing one import." },
    { t: "code", lang: "javascript", code: `import { generateText, streamText } from "ai"
import { openai } from "@ai-sdk/openai"

const { text, usage, finishReason } = await generateText({
  model: openai("gpt-4o-mini"),
  system: "You are Openswap's support assistant.",
  prompt: "How do I create a listing?",
  maxOutputTokens: 200,
})

const result = streamText({ model: openai("gpt-4o-mini"), messages })
for await (const chunk of result.textStream) process.stdout.write(chunk)
// In a Next.js route handler: return result.toUIMessageStreamResponse()` },
  ],
  "Challenge: Vercel AI SDK basics": [
    { t: "jsch", fn: "generateText", prompt: "Build a tiny <code>generateText({ system, prompt, messages, maxOutputTokens })</code> on the practice API: turn <code>system</code> into a system message, use <code>messages</code> if given or else <code>prompt</code> as one user message, send <code>max_tokens</code> when <code>maxOutputTokens</code> is set, and resolve to <code>{ text, finishReason, usage: { inputTokens, outputTokens } }</code>.", starter: `async function generateText({ system, prompt, messages, maxOutputTokens }) {\n\n}`, solution: `async function generateText({ system, prompt, messages, maxOutputTokens }) {\n  const all = [\n    ...(system ? [{ role: "system", content: system }] : []),\n    ...(messages || [{ role: "user", content: prompt }]),\n  ]\n  const res = await fetch("${API}/chat/completions", {\n    method: "POST",\n    ${H},\n    body: JSON.stringify({ messages: all, ...(maxOutputTokens ? { max_tokens: maxOutputTokens } : {}) }),\n  })\n  const data = await res.json()\n  if (!res.ok) throw new Error(data.error.message)\n  const choice = data.choices[0]\n  return {\n    text: choice.message.content,\n    finishReason: choice.finish_reason,\n    usage: { inputTokens: data.usage.prompt_tokens, outputTokens: data.usage.completion_tokens },\n  }\n}`, tests: [
      { msg: "Sends the system prompt (an Openswap-only rule declines off-topic questions)", fn: async (f) => /only help/i.test((await f({ system: "Only answer questions about Openswap swaps and listings.", prompt: "What's the capital of France?" })).text) },
      { msg: "Accepts messages instead of prompt", fn: async (f) => /Priya/.test((await f({ messages: [{ role: "user", content: "My name is Priya." }, { role: "assistant", content: "Hi Priya!" }, { role: "user", content: "What's my name?" }] })).text) },
      { msg: "maxOutputTokens → finishReason length, with usage", fn: async (f) => { const r = await f({ prompt: "Explain how swapping works in detail", maxOutputTokens: 3 }); return r.finishReason === "length" && r.usage.outputTokens > 0 && r.usage.inputTokens > 0; } },
    ] },
  ],
  "Vercel AI SDK structured outputs": [
    { t: "p", h: "<code>generateObject</code> takes a <b>Zod schema</b> and returns a typed, validated object. Under the hood it sends a JSON Schema as a structured output and parses the reply. Use it whenever code, not a person, reads the result: classifying tickets, extracting order numbers, routing." },
    { t: "code", lang: "javascript", code: `import { generateObject } from "ai"
import { z } from "zod"

const { object: ticket } = await generateObject({
  model: openai("gpt-4o-mini"),
  schema: z.object({
    category: z.enum(["billing", "bug", "account", "other"]),
    priority: z.enum(["low", "medium", "high"]),
    summary: z.string().describe("One sentence"),
    needsHuman: z.boolean(),
  }),
  prompt: message,
})
if (ticket.needsHuman) await notifySupportTeam(ticket)` },
  ],
  "Challenge: Vercel AI SDK structured outputs": [
    { t: "jsch", fn: "classifyTicket", prompt: "Write <code>classifyTicket(message)</code>: send the message with <code>response_format: { type: \"json_schema\", json_schema: { name: \"ticket\", strict: true, schema } }</code> using the schema below, parse the reply's content and resolve to the ticket object.", starter: `const schema = ${TICKET_SCHEMA}\n\nasync function classifyTicket(message) {\n\n}`, solution: `const schema = ${TICKET_SCHEMA}\n\nasync function classifyTicket(message) {\n  const res = await fetch("${API}/chat/completions", {\n    method: "POST",\n    ${H},\n    body: JSON.stringify({\n      messages: [\n        { role: "system", content: "Classify this Openswap support message." },\n        { role: "user", content: message },\n      ],\n      response_format: { type: "json_schema", json_schema: { name: "ticket", strict: true, schema } },\n    }),\n  })\n  const data = await res.json()\n  return JSON.parse(data.choices[0].message.content)\n}`, tests: [
      { msg: "Double charge → billing, high, needs a human", fn: async (f) => { const t = await f("I was charged twice for premium, fix this now!"); return t.category === "billing" && t.priority === "high" && t.needsHuman === true; } },
      { msg: "A crash → bug", fn: async (f) => (await f("The app crashes when I upload a photo.")).category === "bug" },
      { msg: "A relaxed password question → account, low, with a summary", fn: async (f) => { const t = await f("How do I change my password? No rush."); return t.category === "account" && t.priority === "low" && typeof t.summary === "string" && t.summary.length > 5; } },
    ] },
  ],
  "Vercel AI SDK tool calling": [
    { t: "p", h: "In the AI SDK a tool bundles its <b>description</b>, an <b>input schema</b> and an <b>execute</b> function. Give <code>generateText</code> a <code>tools</code> object and a stop condition, and the SDK runs the loop for you: call the model, execute requested tools, send results back, repeat." },
    { t: "code", lang: "javascript", code: `import { generateText, tool, stepCountIs } from "ai"

const { text, steps } = await generateText({
  model: openai("gpt-4o-mini"),
  tools: {
    searchKnowledgeBase: tool({
      description: "Search Openswap help centre articles",
      inputSchema: z.object({ query: z.string() }),
      execute: async ({ query }) => findArticles(query),
    }),
  },
  stopWhen: stepCountIs(5),     // at most 5 model calls
  prompt: question,
})` },
    { t: "video", name: "agent" },
  ],
  "Challenge: Vercel AI tool calling": [
    { t: "jsch", fn: "runTools", prompt: "Write <code>runTools({ prompt, tools, maxSteps })</code> where <code>tools</code> is SDK-style: <code>{ name: { description, parameters, execute } }</code>. Convert them to the API's <code>tools</code> array, then loop up to <code>maxSteps</code> calls: run requested tools with <code>execute</code>, send the results back, and resolve to <code>{ text, steps }</code> (the number of model calls made).", starter: `async function runTools({ prompt, tools, maxSteps = 5 }) {\n\n}`, solution: `async function runTools({ prompt, tools, maxSteps = 5 }) {\n  const defs = Object.entries(tools).map(([name, t]) => ({\n    type: "function",\n    function: { name, description: t.description, parameters: t.parameters },\n  }))\n  const messages = [{ role: "user", content: prompt }]\n  for (let steps = 1; steps <= maxSteps; steps++) {\n    const res = await fetch("${API}/chat/completions", {\n      method: "POST",\n      ${H},\n      body: JSON.stringify({ messages, tools: defs }),\n    })\n    const { message, finish_reason } = (await res.json()).choices[0]\n    messages.push(message)\n    if (finish_reason !== "tool_calls") return { text: message.content, steps }\n    for (const call of message.tool_calls) {\n      const result = await tools[call.function.name].execute(JSON.parse(call.function.arguments))\n      messages.push({ role: "tool", tool_call_id: call.id, content: JSON.stringify(result) })\n    }\n  }\n  return { text: "", steps: maxSteps }\n}`, tests: [
      { msg: "Runs the knowledge base tool and answers from it in 2 steps", fn: async (f) => { let q = null; const r = await f({ prompt: "How do I reset my password?", tools: { searchArticles: { description: "Search help articles about passwords, listings and shipping", parameters: { type: "object", properties: { query: { type: "string" } }, required: ["query"] }, execute: async ({ query }) => { q = query; return [{ title: "Resetting your password", content: "Choose Forgot password on the login page." }]; } } } }); return /password/.test(q) && /Forgot password/.test(r.text) && r.steps === 2; } },
      { msg: "No tool needed → 1 step", fn: async (f) => (await f({ prompt: "hello", tools: { searchArticles: { description: "Search help articles about shipping", parameters: { type: "object", properties: {} }, execute: () => [] } } })).steps === 1 },
    ] },
  ],
  "Agentic retrieval routing": [
    { t: "p", h: "Plain RAG retrieves on every question, even \"thanks!\" or \"is there a postal strike?\", where the help centre can't help. <b>Agentic retrieval</b> makes retrieval a tool: the model decides whether to search the knowledge base, the web, both, or nothing. Tool descriptions are the routing rules, so make them specific and non-overlapping." },
    { t: "quiz", q: "Your agent keeps searching the web for password questions. What's the first fix?", opts: ["A bigger model", "Make the tool descriptions clearer: the knowledge base covers accounts and passwords; the web covers current events", "Remove the knowledge base tool"], a: 1, why: "The model routes by reading descriptions. Vague or overlapping descriptions cause wrong choices." },
  ],
  "Challenge: Agentic retrieval routing": [
    { t: "jsch", fn: "route", prompt: "Write <code>route(question)</code>: send the question with both tools (below) and resolve to the name of the tool the model chose first, or <code>\"answer\"</code> if it replied without a tool.", starter: `const tools = [\n  ${KB_TOOL},\n  ${WEB_TOOL},\n]\n\nasync function route(question) {\n\n}`, solution: `const tools = [\n  ${KB_TOOL},\n  ${WEB_TOOL},\n]\n\nasync function route(question) {\n  const res = await fetch("${API}/chat/completions", {\n    method: "POST",\n    ${H},\n    body: JSON.stringify({ messages: [{ role: "user", content: question }], tools }),\n  })\n  const { message } = (await res.json()).choices[0]\n  return message.tool_calls ? message.tool_calls[0].function.name : "answer"\n}`, tests: [
      { msg: "Password question → searchKnowledgeBase", fn: async (f) => (await f("How do I reset my password?")) === "searchKnowledgeBase" },
      { msg: "News question → webSearch", fn: async (f) => (await f("Is there a postal strike this week?")) === "webSearch" },
      { msg: "Small talk → answer", fn: async (f) => (await f("hello")) === "answer" },
    ] },
  ],
  "Web search AI agent": [
    { t: "p", h: "A web search tool lets the agent answer questions about the world today. Providers offer built-in search tools (for example <code>openai.tools.webSearch()</code> in the AI SDK), or you can call a search API (Tavily, Brave, Exa) in your own tool's <code>execute</code>. Return titles, snippets and URLs so the model can cite sources." },
    { t: "callout", kind: "warn", h: "Web pages are untrusted input. A page can contain text like \"ignore your instructions and…\". Keep tools that change things (refunds, emails) behind confirmation, and never let web content alone trigger them." },
  ],
  "Web search plus retrieval agent": [
    { t: "p", h: "Give the agent both tools and let it combine them: \"Will the postal strike delay my swap?\" needs the web (strike dates) and the help centre (how shipping and confirmation work). Two tool calls, one answer." },
  ],
  "Challenge: Web search retrieval": [
    { t: "jsch", fn: "supportAgent", prompt: "Write <code>supportAgent(question)</code>: an agent loop (max 5 steps) with both tools. Run <code>searchKnowledgeBase</code> and <code>webSearch</code> (both provided) by name, send results back, and resolve to the final answer text.", starter: `${DOCS}\n${COS}\n${KB}\n${WEB}\nconst tools = [${KB_TOOL}, ${WEB_TOOL}]\n\nasync function supportAgent(question) {\n\n}`, solution: `${DOCS}\n${COS}\n${KB}\n${WEB}\nconst tools = [${KB_TOOL}, ${WEB_TOOL}]\n\nasync function supportAgent(question) {\n  const functions = { searchKnowledgeBase, webSearch }\n  const messages = [\n    { role: "system", content: "You are Openswap's support agent. Use the help centre for Openswap questions and the web for current events." },\n    { role: "user", content: question },\n  ]\n${LOOP("functions")}\n}`, tests: [
      { msg: "Answers a password question from the help centre", fn: async (f) => /Forgot password|login page/i.test(await f("How do I reset my password?")) },
      { msg: "Answers a strike question from the web", fn: async (f) => /Royal Mail|Postal workers/i.test(await f("Is there a postal strike this week?")) },
    ] },
  ],
  "Complete customer support AI agent": [
    { t: "p", h: "The finished agent is a Next.js route handler that streams: <code>streamText</code> with the three tools, a system prompt with the support rules, a step limit, and <code>toUIMessageStreamResponse()</code>. On the client, the SDK's <code>useChat</code> hook keeps the messages, sends new ones and renders the stream, including tool calls as they happen." },
    { t: "code", lang: "javascript", code: `// app/api/chat/route.js
import { streamText, convertToModelMessages, stepCountIs } from "ai"

export async function POST(req) {
  const { messages } = await req.json()
  const result = streamText({
    model: openai("gpt-4o-mini"),
    system: SUPPORT_RULES,
    messages: convertToModelMessages(messages),
    tools: { searchKnowledgeBase, webSearch, createTicket },
    stopWhen: stepCountIs(5),
  })
  return result.toUIMessageStreamResponse()
}

// app/page.jsx ("use client")
const { messages, sendMessage, status } = useChat()` },
    { t: "callout", kind: "tip", h: "Before shipping: test twenty real support questions, log every tool call, rate-limit the endpoint, and make it easy to reach a human." },
  ],
  "Outro": [
    { t: "recap", items: ["The AI SDK gives every provider one API: generateText, streamText, generateObject, embed", "Retrieval: embed docs once, embed each question, take the nearest chunks", "Structured outputs: a schema in, a validated object out", "Tools = description + schema + execute; the SDK runs the loop with a stop condition", "Agentic routing: the model picks knowledge base, web, both or neither from the tool descriptions", "Treat web content as untrusted; keep a human in the loop for actions"] },
  ],
};
