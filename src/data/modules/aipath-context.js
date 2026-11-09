/* AI Engineer Path — Context Engineering: system prompts, the context window, trimming and summarising.
   Labs call the practice LLM. Model "shipyard-tiny" has a deliberately small 200-token context window. */

const API = "https://api.shipyard.dev/v1";
const KEY = "sk-practice-123";
const fetchCall = (body) => `const res = await fetch("${API}/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: "Bearer ${KEY}" },
    body: JSON.stringify(${body}),
  })`;
const TOK = "const tokens = (m) => Math.ceil(String(m.content || \"\").length / 4)";

const HISTORY = `[
  { role: "system", content: "You are Openswap's friendly assistant." },
  { role: "user", content: "Hi! My name is Priya and I live in Leeds." },
  { role: "assistant", content: "Nice to meet you, Priya! How can I help?" },
  { role: "user", content: "I love board games and old cameras." },
  { role: "assistant", content: "Great hobbies for swapping. Want me to look for listings?" },
  { role: "user", content: "Maybe later. What's the best way to photograph an item for a listing?" },
  { role: "assistant", content: "Use daylight, a plain background, and show any wear up close." },
]`;

const hist = () => new Function("return " + HISTORY)();

export const CONTEXT_BODIES = {
  "Context Engineering Intro": [
    { t: "p", h: "<b>Context engineering</b> is deciding what goes into the model's context window on every request: the instructions, the conversation so far, retrieved documents, tool definitions and tool results. The model only knows what's in that window, so this is where most quality, cost and reliability problems are won or lost." },
    { t: "steps", items: ["<b>Instructions</b>: the system prompt, which sets role, rules and format", "<b>History</b>: earlier messages, trimmed or summarised as it grows", "<b>Knowledge</b>: retrieved chunks (RAG) or facts about the user", "<b>Tools</b>: definitions, plus the results of the calls made so far", "<b>The question</b>: the latest user message"] },
    { t: "callout", kind: "key", h: "More context isn't better context. Irrelevant text costs tokens, slows replies and distracts the model. The goal is the <b>smallest set of the most relevant tokens</b>." },
  ],
  "The System Prompt": [
    { t: "p", h: "The system prompt is the one piece of context sent on every request. A good one is specific: who the assistant is, who it's talking to, what it should and shouldn't do, how to format answers, and what to do when it doesn't know." },
    { t: "code", lang: "text", code: `You are Openswap's support assistant. Openswap is a community site for swapping items.
Audience: members, often new to swapping.
Only answer questions about Openswap swaps, listings and accounts.
If you don't know, say so and suggest contacting support@openswap.example.
Keep answers under 80 words. Use plain language, no jargon.` },
    { t: "callout", kind: "tip", h: "Write rules as instructions, not hopes, and put examples of good answers in the prompt when the format matters. Test the prompt against awkward questions: off-topic requests, angry users, attempts to make it ignore its rules." },
  ],
  "AI SDK + OpenRouter Setup & Code Overview": [
    { t: "p", h: "This section uses the <b>Vercel AI SDK</b> (<code>ai</code>) with <b>OpenRouter</b>, a gateway that gives one API key access to models from many providers. The SDK's <code>generateText</code> takes a model, a system prompt and messages; switching models is a one-line change." },
    { t: "code", lang: "javascript", code: `import { generateText } from "ai"
import { createOpenRouter } from "@openrouter/ai-sdk-provider"

const openrouter = createOpenRouter({ apiKey: process.env.OPENROUTER_API_KEY })

const { text, usage } = await generateText({
  model: openrouter("openai/gpt-4o-mini"),
  system: "You are Openswap's support assistant.",
  messages,                       // [{ role: "user", content: "…" }, …]
})
console.log(text, usage)          // usage: input and output tokens` },
    { t: "callout", kind: "tip", h: "The labs call the practice API with <code>fetch</code>, which has the same shape underneath: a system message, the conversation, and a reply with token <code>usage</code>." },
  ],
  "Adding A System Prompt": [
    { t: "play", api: true, task: "Ask an on-topic question and an off-topic one (\"What's the capital of France?\"). Then delete the <code>Only answer…</code> line and compare.", html: `<form id="f" style="display:flex;gap:8px"><input id="q" value="What's the capital of France?" style="flex:1;padding:8px"><button>Ask</button></form><p id="out" style="font:15px system-ui"></p>`, js: `const system = \`You are Openswap's support assistant.
Only answer questions about Openswap swaps, listings and accounts.\`

document.getElementById("f").addEventListener("submit", async (e) => {
  e.preventDefault()
  const messages = [{ role: "system", content: system }, { role: "user", content: document.getElementById("q").value }]
  ${fetchCall("{ messages }")}
  const data = await res.json()
  document.getElementById("out").textContent = data.choices[0].message.content
})` },
  ],
  "System Prompt Challenge": [
    { t: "jsch", fn: "askSupport", prompt: "Write <code>askSupport(question)</code>: send a system prompt that keeps the assistant to Openswap topics (it must contain <code>Only answer questions about Openswap swaps, listings and accounts.</code>) followed by the user's question, and resolve to the reply text.", starter: `async function askSupport(question) {\n\n}`, solution: `async function askSupport(question) {\n  const messages = [\n    { role: "system", content: "You are Openswap's support assistant.\\nOnly answer questions about Openswap swaps, listings and accounts.\\nKeep answers short." },\n    { role: "user", content: question },\n  ]\n  ${fetchCall("{ messages }")}\n  const data = await res.json()\n  return data.choices[0].message.content\n}`, tests: [
      { msg: "Off-topic questions are declined", fn: async (f) => /only help/i.test(await f("What's the capital of France?")) },
      { msg: "Openswap questions get an answer", fn: async (f) => { const a = await f("How do I edit my swap listing?"); return typeof a === "string" && !/only help/i.test(a); } },
    ] },
  ],
  "Managing The Context Window": [
    { t: "p", h: "Every model has a <b>context window</b>: a maximum number of tokens for the input plus the reply. Chat apps resend the whole conversation each turn, so long chats eventually hit the limit (an error), and well before that they get slower and more expensive, and the model pays less attention to the middle." },
    { t: "steps", items: ["<b>Sliding window</b>: keep the system prompt and the most recent messages that fit a token budget", "<b>Summarise</b>: replace older turns with a short summary of the facts that matter", "<b>Retrieve</b>: store old messages or user facts and bring back only what's relevant to the question", "<b>Trim tool results</b>: keep the model's conclusions, drop the bulky raw output"] },
    { t: "quiz", q: "A support chat has 200 messages. Which approach keeps both the user's name from message 2 and a low token count?", opts: ["Send all 200 every time", "Keep only the last 10 messages", "Summarise older turns (including key facts like the name) and keep the recent messages"], a: 2, why: "A sliding window alone forgets early facts; a summary keeps them in a few tokens." },
  ],
  "Context Window Demo": [
    { t: "p", h: "The practice model <code>shipyard-tiny</code> has a 200-token window so you can hit the limit quickly. Each click adds a turn and resends the whole history; watch the token estimate grow until the API refuses." },
    { t: "play", api: true, task: "Click until you get the context length error. Then change <code>model</code> to <code>shipyard-mini</code> (a 32k window) and try again.", html: `<button id="b">Send another message</button><pre id="out" style="white-space:pre-wrap;font:13px ui-monospace,monospace"></pre>`, js: `const messages = [{ role: "system", content: "You are a helpful assistant." }]
const out = document.getElementById("out")
document.getElementById("b").onclick = async () => {
  messages.push({ role: "user", content: "Tell me one more tip about swapping items with neighbours, please." })
  ${fetchCall('{ model: "shipyard-tiny", messages }')}
  const data = await res.json()
  if (!res.ok) { out.textContent += "\\n❌ " + data.error.code + ": " + data.error.message; return }
  messages.push(data.choices[0].message)
  out.textContent += "\\n" + messages.length + " messages · ~" + data.usage.prompt_tokens + " prompt tokens"
}` },
  ],
  "Context Window Challenge": [
    { t: "jsch", fn: "trimHistory", prompt: "Write <code>trimHistory(messages, maxTokens)</code> for a sliding window. Estimate tokens as <code>Math.ceil(content.length / 4)</code>. Always keep the system messages and the latest message; then keep as many of the <b>most recent</b> other messages as fit within <code>maxTokens</code> in total, dropping the oldest first. Keep the original order.", starter: `function trimHistory(messages, maxTokens) {\n\n}`, solution: `function trimHistory(messages, maxTokens) {\n  ${TOK}\n  const system = messages.filter((m) => m.role === "system")\n  const rest = messages.filter((m) => m.role !== "system")\n  let used = system.reduce((n, m) => n + tokens(m), 0)\n  const kept = []\n  for (let i = rest.length - 1; i >= 0; i--) {\n    const t = tokens(rest[i])\n    if (kept.length && used + t > maxTokens) break\n    kept.unshift(rest[i])\n    used += t\n  }\n  return [...system, ...kept]\n}`, tests: [
      { msg: "Keeps the system message and the newest messages that fit", fn: (f) => { const h = hist(); const r = f(h, 50); return r[0].role === "system" && r[r.length - 1] === h[6] && r.length < h.length && r.length >= 3 && r.slice(1).every((m, i, a) => i === 0 || h.indexOf(m) > h.indexOf(a[i - 1])); } },
      { msg: "Drops the oldest first and stays within the budget", fn: (f) => { const h = hist(); const r = f(h, 50); const t = r.reduce((n, m) => n + Math.ceil(m.content.length / 4), 0); return t <= 50 && !r.includes(h[1]); } },
      { msg: "Everything fits → nothing is dropped; tiny budget → still keeps the latest message", fn: (f) => { const h = hist(); return f(h, 10000).length === 7 && f(h, 1).some((m) => m === h[6]); } },
    ] },
  ],
  "Summarizing Context": [
    { t: "p", h: "Summarising (or <b>compaction</b>) asks the model to condense older turns into a few sentences of durable facts: names, preferences, decisions, open questions. You then send the system prompt, the summary and only the recent messages. Facts survive; tokens don't pile up." },
    { t: "code", lang: "javascript", code: `const transcript = older.map((m) => m.role + ": " + m.content).join("\\n")
const summary = await ask([
  { role: "system", content: "Summarize this conversation in under 60 words. Keep names, preferences, decisions and anything unresolved." },
  { role: "user", content: transcript },
])
const compacted = [systemMessage, { role: "system", content: "Summary of earlier conversation: " + summary }, ...recent]` },
    { t: "callout", kind: "warn", h: "Summaries lose detail and can introduce mistakes. Summarise in the background when the history passes a threshold, keep the raw log for debugging, and never summarise away safety rules (they live in the system prompt, which you don't summarise)." },
  ],
  "Summarizing Context Demo": [
    { t: "play", api: true, task: "Run it: the first answer uses only the last two messages and has forgotten the name. The second uses a summary plus the last two. Add a line like \"I'm allergic to peanuts\" to the history and check the summary keeps it.", html: `<pre id="out" style="white-space:pre-wrap;font:13px ui-monospace,monospace"></pre>`, js: `const history = ${HISTORY.replace(/\n/g, "\n")}
const out = document.getElementById("out")
async function ask(messages) {
  ${fetchCall("{ messages }")}
  return (await res.json()).choices[0].message.content
}
async function run() {
  const question = { role: "user", content: "What's my name?" }
  const recent = history.slice(-2)
  out.textContent = "Window only → " + await ask([history[0], ...recent, question])

  const older = history.slice(1, -2).map((m) => m.role + ": " + m.content).join("\\n")
  const summary = await ask([{ role: "system", content: "Summarize this conversation briefly, keeping key facts." }, { role: "user", content: older }])
  out.textContent += "\\n\\n" + summary
  out.textContent += "\\n\\nSummary + window → " + await ask([history[0], { role: "system", content: summary }, ...recent, question])
}
run()` },
  ],
  "Summarizing Context Super Challenge": [
    { t: "jsch", fn: "compact", prompt: "Write <code>compact(messages, keepLast)</code>. If there are no more than <code>keepLast</code> non-system messages, resolve to the messages unchanged. Otherwise ask the practice model to summarise the <b>older</b> non-system messages (send a system instruction such as <code>Summarize this conversation, keeping key facts.</code> and the transcript as the user message), and resolve to: the original system message(s), then <code>{ role: \"system\", content: \"Summary of earlier conversation: \" + summary }</code>, then the last <code>keepLast</code> messages.", starter: `async function compact(messages, keepLast = 2) {\n\n}`, solution: `async function compact(messages, keepLast = 2) {\n  const system = messages.filter((m) => m.role === "system")\n  const rest = messages.filter((m) => m.role !== "system")\n  if (rest.length <= keepLast) return messages\n  const older = rest.slice(0, rest.length - keepLast)\n  const recent = rest.slice(rest.length - keepLast)\n  const transcript = older.map((m) => m.role + ": " + m.content).join("\\n")\n  ${fetchCall(`{ messages: [\n      { role: "system", content: "Summarize this conversation, keeping key facts." },\n      { role: "user", content: transcript },\n    ] }`)}\n  const summary = (await res.json()).choices[0].message.content\n  return [...system, { role: "system", content: "Summary of earlier conversation: " + summary }, ...recent]\n}`, tests: [
      { msg: "Short conversations are returned unchanged", fn: async (f) => { const h = [{ role: "system", content: "s" }, { role: "user", content: "hi" }]; return (await f(h, 2)) === h || JSON.stringify(await f(h, 2)) === JSON.stringify(h); } },
      { msg: "Long ones become system + summary + the last messages", fn: async (f) => { const h = hist(); const r = await f(h, 2); return r.length === 4 && r[0] === h[0] && r[1].role === "system" && /^Summary of earlier conversation: /.test(r[1].content) && r[2] === h[5] && r[3] === h[6]; } },
      { msg: "The summary keeps Priya's name and city", fn: async (f) => { const r = await f(hist(), 2); return /Priya/.test(r[1].content) && /Leeds/.test(r[1].content); } },
    ] },
  ],
  "Context Engineering Outro": [
    { t: "recap", items: ["Context = instructions + history + knowledge + tools + the question", "Specific system prompts: role, audience, scope, format, what to do when unsure", "Every model has a context window; long chats get slow, costly and then fail", "Sliding windows keep recent turns; summaries keep durable facts", "Send the smallest set of the most relevant tokens"] },
  ],
};
