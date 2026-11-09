/* AI Engineer Path — Agents. Build tools for Openswap (a community swap marketplace): a news tool,
   swap search, a GitHub health check, the agent loop, failures, and saved conversations.
   Labs use the practice model's tool calling (chat completions with `tools`). */
import { AI } from "./ai.js";
import { section } from "./aipath-intro.js";

const A = AI.lessons.find((l) => l.id === "ai-agents").body;
const API = "https://api.shipyard.dev/v1";
const KEY = "sk-practice-123";
const CALL = `const res = await fetch("${API}/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: "Bearer ${KEY}" },
    body: JSON.stringify({ messages, tools }),
  })`;

const SWAPS = `const swaps = [
  { id: 1, title: "Zelda: Link's Awakening cartridge", category: "games", tags: ["retro", "nintendo"] },
  { id: 2, title: "Kindle Paperwhite", category: "electronics", tags: ["ebook", "reader"] },
  { id: 3, title: "Denim jacket (M)", category: "clothing", tags: ["vintage"] },
  { id: 4, title: "Game Boy Color", category: "games", tags: ["retro", "handheld"] },
  { id: 5, title: "The Pragmatic Programmer", category: "books", tags: ["coding"] },
]`;
const SEARCH_TOOL = `{
  type: "function",
  function: {
    name: "searchSwaps",
    description: "Search Openswap listings by keyword, optionally filtered by category",
    parameters: {
      type: "object",
      properties: {
        query: { type: "string", description: "Words to search for in listing titles and tags" },
        category: { type: "string", enum: ["books", "electronics", "clothing", "games"] },
        limit: { type: "number", description: "Maximum results, 1 to 10" },
      },
      required: ["query"],
    },
  },
}`;

export const AGENTS_BODIES = {
  "The Limitation": [
    { t: "p", h: "A model on its own can only produce text from what it learned in training and what's in the prompt. Ask it \"what's being swapped on Openswap right now?\" or \"is our GitHub repo healthy?\" and it can only guess. It can't look anything up, and it can't <i>do</i> anything." },
    { t: "callout", kind: "key", h: "Agents fix this by giving the model <b>tools</b>: functions your code runs on its behalf, like searching a database, calling an API or reading a file." },
  ],
  "What Are Agents?": [
    ...section(A, "AI agent intro"),
  ],
  "Environment Setup": [
    { t: "p", h: "The project is <b>Openswap</b>, a community site for swapping things you no longer need. The agent will answer questions using live data from the app's own database and external APIs. You'll need the model API key in <code>.env</code> and the app's data module; the labs use the practice API." },
    { t: "code", lang: "javascript", code: `import OpenAI from "openai"
import "dotenv/config"
export const client = new OpenAI()   // reads OPENAI_API_KEY from the environment` },
  ],
  "Recommend Models": [
    { t: "p", h: "Agents need models that are good at <b>tool use</b>: choosing the right tool, producing valid arguments and knowing when to stop. Reasoning models do this best on complex tasks; small fast models are fine for one or two simple tools. As always, test on your own scenarios: a dozen realistic questions per tool." },
  ],
  "Chat Completions And Responses": [
    { t: "p", h: "Both APIs support tools. <b>Chat Completions</b> returns <code>tool_calls</code> on the assistant message, and you reply with <code>role: \"tool\"</code> messages. The <b>Responses</b> API returns <code>function_call</code> items in <code>output</code>, and you reply with <code>function_call_output</code> items; it can also keep state on the server with <code>previous_response_id</code>. The loop is identical; only the shapes differ. The labs use Chat Completions." },
    { t: "code", lang: "javascript", code: `// Responses API shape
const response = await client.responses.create({ model, input, tools })
for (const item of response.output) {
  if (item.type === "function_call") {
    const result = await functions[item.name](JSON.parse(item.arguments))
    input.push(item, { type: "function_call_output", call_id: item.call_id, output: JSON.stringify(result) })
  }
}` },
  ],
  "Understanding Model Memory": [
    { t: "p", h: "Models are stateless. In an agent, the conversation array is the memory: the user's question, every tool call the model made, and every result. Lose any of those and the model loses track. That's why the loop appends each assistant message <b>with its tool calls</b> before the tool results." },
    { t: "quiz", q: "You append tool results but forget to append the assistant message that requested them. What happens?", opts: ["Nothing", "The API rejects the request or the model gets confused: each tool result must follow the message with the matching tool call", "The model runs the tool again by itself"], a: 1, why: "A tool message refers to a tool_call_id from the previous assistant message. Keep the full sequence." },
  ],
  "Why Use Agents": [
    { t: "p", h: "Use an agent when the steps depend on what's found along the way: searching, then refining; checking one system, then another. If the steps are always the same, a plain function (or a fixed chain of prompts) is cheaper, faster and easier to test. Start simple and add autonomy only where it pays off." },
  ],
  "Your First Tool Definition": [
    { t: "p", h: "A tool definition tells the model a function exists: its <b>name</b>, a <b>description</b> of when to use it (the model reads this, so write it well) and a JSON Schema for its <b>parameters</b>." },
    { t: "code", lang: "javascript", code: SEARCH_TOOL },
    { t: "jsch", fn: "makeNewsTool", prompt: "Write <code>makeNewsTool()</code> that returns a function tool definition named <code>getNews</code> with a description, and an object parameter schema with a required string property <code>topic</code>.", starter: `function makeNewsTool() {\n\n}`, solution: `function makeNewsTool() {\n  return {\n    type: "function",\n    function: {\n      name: "getNews",\n      description: "Get the latest news headlines about a topic",\n      parameters: {\n        type: "object",\n        properties: { topic: { type: "string", description: "What the news should be about" } },\n        required: ["topic"],\n      },\n    },\n  }\n}`, tests: [
      { msg: "type function, named getNews, with a description", fn: (f) => { const t = f(); return t.type === "function" && t.function.name === "getNews" && t.function.description.length > 10; } },
      { msg: "topic is a required string parameter", fn: (f) => { const p = f().function.parameters; return p.type === "object" && p.properties.topic.type === "string" && p.required.includes("topic"); } },
    ] },
  ],
  "The Loop": [
    ...section(A, "Loop logic, tool calls and automatic function calls"),
    { t: "video", name: "agent" },
  ],
  "Running Tool Calls": [
    { t: "jsch", fn: "runToolCalls", prompt: "Write <code>runToolCalls(message, functions)</code>: for every call in <code>message.tool_calls</code>, parse its JSON <code>arguments</code>, run <code>functions[name](args)</code> (it may be async) and return an array of tool messages <code>{ role: \"tool\", tool_call_id, content }</code> where content is the JSON string of the result.", starter: `async function runToolCalls(message, functions) {\n\n}`, solution: `async function runToolCalls(message, functions) {\n  const out = []\n  for (const call of message.tool_calls) {\n    const args = JSON.parse(call.function.arguments)\n    const result = await functions[call.function.name](args)\n    out.push({ role: "tool", tool_call_id: call.id, content: JSON.stringify(result) })\n  }\n  return out\n}`, tests: [
      { msg: "Runs each call with parsed arguments", fn: async (f) => { const seen = []; const r = await f({ tool_calls: [{ id: "a", function: { name: "add", arguments: "{\"x\":2,\"y\":3}" } }, { id: "b", function: { name: "hi", arguments: "{}" } }] }, { add: ({ x, y }) => { seen.push("add"); return x + y; }, hi: async () => { seen.push("hi"); return { msg: "hi" }; } }); return seen.join() === "add,hi" && r.length === 2 && r[0].content === "5" && r[1].tool_call_id === "b" && JSON.parse(r[1].content).msg === "hi"; } },
      { msg: "Messages have role tool", fn: async (f) => (await f({ tool_calls: [{ id: "z", function: { name: "n", arguments: "{}" } }] }, { n: () => null }))[0].role === "tool" },
    ] },
  ],
  "Returning Tool Results": [
    { t: "p", h: "Return results the model can read: compact JSON with just the fields it needs. Huge payloads waste tokens and bury the answer. For lists, return the top few items and a total; for failures, return an <code>error</code> message the model can explain or act on." },
  ],
  "Reasoning Items In The Loop": [
    { t: "p", h: "Reasoning models may produce <b>reasoning items</b> in the Responses API before a tool call. When you continue the conversation, send those items back along with the function calls (or use <code>previous_response_id</code>), so the model keeps its chain of thought across tool calls instead of starting over." },
  ],
  "Tool Parameters": [
    { t: "p", h: "Parameters are a JSON Schema. Use <code>enum</code> for fixed choices, <code>description</code> on every property, <code>required</code> for what's essential, and keep the number of parameters small. Clear names and descriptions do more for accuracy than clever prompts." },
  ],
  "Parameterizing The News Tool": [
    { t: "p", h: "A news tool with no parameters always returns the same headlines. Add a <code>topic</code> (and maybe a <code>limit</code>), and the model fills them in from the question: \"Any news about electric cars?\" → <code>getNews({ topic: \"electric cars\" })</code>." },
  ],
  "Defining Search Swaps": [
    { t: "code", lang: "javascript", code: SWAPS + `

function searchSwaps({ query = "", category, limit = 5 }) {
  const words = query.toLowerCase().split(/\\s+/).filter(Boolean)
  return swaps
    .filter((s) => !category || s.category === category)
    .filter((s) => words.some((w) => (s.title + " " + s.tags.join(" ")).toLowerCase().includes(w)))
    .slice(0, limit)
}` },
  ],
  "Tool Inputs Are Still Inputs": [
    { t: "p", h: "Arguments come from a model that read user text, so treat them like user input: validate types, clamp numbers, whitelist enums, and never pass them straight into SQL, shell commands or file paths. A prompt injection can make the model send anything." },
    { t: "jsch", fn: "validateSearchArgs", prompt: "Write <code>validateSearchArgs(args)</code> that returns safe arguments: <code>query</code> a trimmed string of at most 100 characters (default <code>\"\"</code>), <code>category</code> only if it's one of <code>books, electronics, clothing, games</code>, and <code>limit</code> an integer clamped to 1–10 (default 5).", starter: `function validateSearchArgs(args) {\n\n}`, solution: `function validateSearchArgs(args = {}) {\n  const categories = ["books", "electronics", "clothing", "games"]\n  const query = typeof args.query === "string" ? args.query.trim().slice(0, 100) : ""\n  const out = { query }\n  if (categories.includes(args.category)) out.category = args.category\n  const n = Math.round(Number(args.limit))\n  out.limit = Number.isFinite(n) ? Math.min(10, Math.max(1, n)) : 5\n  return out\n}`, tests: [
      { msg: "Clamps limit and drops unknown categories", fn: (f) => { const r = f({ query: "  retro ", category: "weapons", limit: 500 }); return r.query === "retro" && !("category" in r) && r.limit === 10; } },
      { msg: "Keeps valid values", fn: (f) => { const r = f({ query: "kindle", category: "electronics", limit: 3 }); return r.category === "electronics" && r.limit === 3; } },
      { msg: "Defaults and length limit", fn: (f) => { const r = f({ query: "x".repeat(300) }); return r.query.length === 100 && r.limit === 5 && f({}).query === ""; } },
    ] },
  ],
  "Wiring The Search Loop": [
    { t: "jsch", fn: "runAgent", prompt: "Write <code>runAgent(question)</code>: send the question with the <code>searchSwaps</code> tool (defined for you), run any tool calls with the provided <code>searchSwaps</code> function, append the assistant message and tool results, and loop (max 5 turns) until the model answers. Resolve to the answer text.", starter: `${SWAPS}
function searchSwaps({ query = "", category, limit = 5 }) {
  const words = query.toLowerCase().split(/\\s+/).filter(Boolean)
  return swaps.filter((s) => !category || s.category === category)
    .filter((s) => words.some((w) => (s.title + " " + s.tags.join(" ")).toLowerCase().includes(w))).slice(0, limit)
}
const tools = [${SEARCH_TOOL}]

async function runAgent(question) {

}`, solution: `${SWAPS}
function searchSwaps({ query = "", category, limit = 5 }) {
  const words = query.toLowerCase().split(/\\s+/).filter(Boolean)
  return swaps.filter((s) => !category || s.category === category)
    .filter((s) => words.some((w) => (s.title + " " + s.tags.join(" ")).toLowerCase().includes(w))).slice(0, limit)
}
const tools = [${SEARCH_TOOL}]

async function runAgent(question) {
  const messages = [
    { role: "system", content: "You are Openswap's assistant. Use tools to look up real listings." },
    { role: "user", content: question },
  ]
  for (let turn = 0; turn < 5; turn++) {
    ${CALL}
    const { message, finish_reason } = (await res.json()).choices[0]
    messages.push(message)
    if (finish_reason !== "tool_calls") return message.content
    for (const call of message.tool_calls) {
      const result = searchSwaps(JSON.parse(call.function.arguments))
      messages.push({ role: "tool", tool_call_id: call.id, content: JSON.stringify(result) })
    }
  }
  return "Sorry, I couldn't finish that."
}`, tests: [
      { msg: "Finds the retro games via the tool", fn: async (f) => { const a = await f("Search for retro games to swap"); return /Zelda/.test(a) && /Game Boy/.test(a); } },
      { msg: "Plain questions are answered without tools", fn: async (f) => typeof (await f("hello")) === "string" },
    ] },
  ],
  "Wiring The Agent Into Openswap": [
    { t: "p", h: "In the app, the agent sits behind an endpoint: <code>POST /api/assistant</code> takes the conversation, runs the loop on the server (where the key and the database are), and returns the reply. The frontend renders messages and shows a \"searching…\" state while tools run." },
    { t: "callout", kind: "tip", h: "Show users what the agent is doing: \"Searching swaps for 'retro games'…\". It builds trust, and makes wrong tool choices visible during testing." },
  ],
  "Handling Every Tool Call": [
    { t: "p", h: "A single assistant message can contain <b>several</b> tool calls (parallel tool calling): \"compare the news about Nintendo and search swaps for Switch games\". Run all of them and return one tool message per call, each with its own <code>tool_call_id</code>. Missing one is an API error." },
  ],
  "When Tools Fail": [
    { t: "p", h: "APIs time out, IDs don't exist, arguments are wrong. Don't let one failure crash the agent: catch it and return <code>{ error: \"…\" }</code> as the tool result. The model can then retry with different arguments, try another tool, or explain the problem to the user." },
    { t: "jsch", fn: "safeRun", prompt: "Write <code>safeRun(fn, args)</code>: await <code>fn(args)</code> and resolve to its result; if it throws (or rejects), resolve to <code>{ error: message }</code> instead.", starter: `async function safeRun(fn, args) {\n\n}`, solution: `async function safeRun(fn, args) {\n  try {\n    return await fn(args)\n  } catch (err) {\n    return { error: err && err.message ? err.message : String(err) }\n  }\n}`, tests: [
      { msg: "Passes results through", fn: async (f) => (await f(({ n }) => n * 2, { n: 4 })) === 8 },
      { msg: "Turns sync and async failures into { error }", fn: async (f) => { const a = await f(() => { throw new Error("boom"); }, {}); const b = await f(async () => { throw new Error("timeout"); }, {}); return a.error === "boom" && b.error === "timeout"; } },
    ] },
  ],
  "Designing The Health Check Tool": [
    { t: "p", h: "Openswap's maintainers want to ask \"is the repo healthy?\". Design the tool first: input <code>{ repo: \"owner/name\" }</code>; output a small summary: open issues, open pull requests, days since the last commit, and whether CI is passing. Decide what <b>healthy</b> means in code, not in the prompt, so it's consistent." },
  ],
  "Proving The Github Health Check Data Path": [
    { t: "p", h: "Before handing a tool to the model, call it yourself and check the data: right repo, right numbers, sensible errors for a repo that doesn't exist or a rate limit. If the data path is wrong, no prompt will fix it." },
    { t: "code", lang: "javascript", code: `const res = await fetch(\`https://api.github.com/repos/\${repo}\`, { headers: { Accept: "application/vnd.github+json" } })
if (res.status === 404) return { error: \`Repository \${repo} not found\` }
const r = await res.json()
return { repo, openIssues: r.open_issues_count, lastPush: r.pushed_at, stars: r.stargazers_count }` },
  ],
  "Adding The Health Check Agent Tool": [
    { t: "p", h: "Register it alongside the others: a definition in <code>tools</code> and the function in the <code>functions</code> map the loop uses. The model now chooses between news, swap search and health checks based on the question." },
  ],
  "Widening The Search With Tags": [
    { t: "p", h: "Add an optional <code>tags</code> array parameter (with an <code>items</code> schema) so \"vintage clothing\" can match tag <code>vintage</code>. Each new parameter is a new way for the model to be wrong, so describe it clearly and validate it." },
  ],
  "Completing The Agent Loop": [
    ...section(A, "Adding UI to the agent"),
  ],
  "Managing Agent Conversations": [
    { t: "p", h: "Long agent conversations grow fast: every tool result stays in the history. Keep conversations per user, cap their length, and trim or summarise old turns (you'll do this properly in Context Engineering)." },
  ],
  "Saving And Loading Agent Conversations": [
    { t: "jsch", fn: "saveConversation", prompt: "Write <code>saveConversation(messages)</code> returning a JSON string of the messages <b>without</b> the system message (you'll add the current one when loading), and <code>loadConversation(json, systemPrompt)</code> returning the messages with a fresh system message first.", extra: ["loadConversation"], starter: `function saveConversation(messages) {\n\n}\n\nfunction loadConversation(json, systemPrompt) {\n\n}`, solution: `function saveConversation(messages) {\n  return JSON.stringify(messages.filter((m) => m.role !== "system"))\n}\n\nfunction loadConversation(json, systemPrompt) {\n  return [{ role: "system", content: systemPrompt }, ...JSON.parse(json)]\n}`, tests: [
      { msg: "Saves without the system message", fn: (f) => { const s = f([{ role: "system", content: "old" }, { role: "user", content: "hi" }]); return JSON.parse(s).length === 1 && JSON.parse(s)[0].content === "hi"; } },
      { msg: "Loads with the new system prompt first, keeping tool messages", fn: (f, ctx) => { const m = ctx.loadConversation(f([{ role: "user", content: "q" }, { role: "assistant", content: null, tool_calls: [{ id: "c1" }] }, { role: "tool", tool_call_id: "c1", content: "[]" }]), "new rules"); return m[0].content === "new rules" && m.length === 4 && m[3].tool_call_id === "c1"; } },
    ] },
  ],
  "Continuing Agent Conversations": [
    { t: "p", h: "To continue, load the saved messages, append the new user message and run the loop again. With the Responses API you can instead pass <code>previous_response_id</code> and let the provider store the history (check its retention policy for user data)." },
  ],
  "Outro": [
    { t: "recap", items: ["Tools = definitions the model sees + functions your code runs", "The loop: call, run every tool call, append results, repeat until an answer", "Descriptions and schemas drive accuracy", "Validate tool inputs; return errors as results", "Cap the loop; show users what the agent is doing", "Save conversations without the system prompt; continue by appending"] },
  ],
};
