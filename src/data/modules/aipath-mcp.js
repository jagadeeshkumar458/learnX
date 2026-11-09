/* AI Engineer Path — Model Context Protocol. How MCP works on the wire (JSON-RPC 2.0), built up as an
   Openswap MCP server: initialize, tools/list, tools/call, errors, and bridging MCP tools to a model. */

const SWAPS = `const swaps = [
  { id: 1, title: "Zelda cartridge", category: "games" },
  { id: 2, title: "Kindle Paperwhite", category: "electronics" },
  { id: 3, title: "Game Boy Color", category: "games" },
  { id: 4, title: "Denim jacket", category: "clothing" },
]`;
const TOOLS = `const tools = [
  {
    name: "searchSwaps",
    title: "Search swaps",
    description: "Search Openswap listings by keyword and optional category",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Words to look for in titles" },
        category: { type: "string", enum: ["books", "electronics", "clothing", "games"] },
      },
      required: ["query"],
    },
  },
]`;
const SEARCH = `function searchSwaps({ query, category }) {
  if (typeof query !== "string" || !query.trim()) throw new Error("query must be a non-empty string")
  const q = query.toLowerCase()
  return swaps.filter((s) => (!category || s.category === category) && s.title.toLowerCase().includes(q))
}`;
const INIT_MSG = `{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "initialize",
  "params": {
    "protocolVersion": "2025-06-18",
    "capabilities": {},
    "clientInfo": { "name": "my-host", "version": "1.0.0" }
  }
}`;

export const MCP_BODIES = {
  "About this section": [
    { t: "p", h: "This section explains the <b>Model Context Protocol</b> from the wire up. Instead of treating MCP as magic, you'll read and write the actual messages a host and a server exchange, and build a small Openswap server that any MCP host could connect to." },
  ],
  "Intro to MCP": [
    { t: "p", h: "In the Agents section every tool lived inside your app: you wrote the definition, the function and the loop. That doesn't scale. Every AI app would need its own GitHub tool, its own database tool, its own calendar tool. <b>MCP</b> is an open standard so a tool integration is written once, as a <b>server</b>, and used by any compatible app." },
    { t: "callout", kind: "key", h: "Think USB for AI: a standard plug between AI applications and the tools and data they use." },
  ],
  "What MCP Is": [
    { t: "p", h: "MCP is a protocol built on <b>JSON-RPC 2.0</b>: small JSON messages that are requests (with an <code>id</code> and a <code>method</code>), responses (the same <code>id</code> with a <code>result</code> or an <code>error</code>), or notifications (a method with no <code>id</code>, no reply expected)." },
    { t: "steps", items: ["<b>Tools</b>: functions the model can call (search swaps, create an issue). Model-controlled", "<b>Resources</b>: data the app can read and add to context (a file, a database row). App-controlled", "<b>Prompts</b>: reusable prompt templates a user picks (\"summarise this PR\"). User-controlled"] },
    { t: "quiz", q: "Which MCP feature fits \"let the model look up live listings when it decides it needs them\"?", opts: ["A prompt", "A tool", "A resource the user attaches"], a: 1, why: "Tools are called by the model when it decides to. Resources and prompts are chosen by the app or the user." },
  ],
  "Host, Client and Server": [
    { t: "diagram", name: "mcp-arch" },
    { t: "p", h: "The <b>host</b> is the AI application. For each server it uses, the host creates a <b>client</b> that holds one connection. The <b>server</b> exposes tools, resources and prompts. The model never talks to servers directly: it asks the host for a tool call, and the host's client sends it, usually after checking permissions with the user." },
  ],
  "How a Connection Starts": [
    { t: "p", h: "Every connection starts with a handshake. The client sends <code>initialize</code> with the protocol version it speaks and its capabilities; the server answers with the version it will use, <b>its</b> capabilities (for example, that it has tools) and its name. The client then sends a <code>notifications/initialized</code> notification, and normal traffic begins." },
    { t: "code", lang: "json", code: INIT_MSG },
    { t: "jsch", fn: "initialize", prompt: "Write <code>initialize(request)</code> for the Openswap server. Reply with <code>{ jsonrpc: \"2.0\", id, result }</code> where result has <code>protocolVersion</code> (echo the client's version if it's in <code>SUPPORTED</code>, otherwise use <code>SUPPORTED[0]</code>), <code>capabilities: { tools: {} }</code> and <code>serverInfo: { name: \"openswap\", version: \"1.0.0\" }</code>.", starter: `const SUPPORTED = ["2025-06-18", "2025-03-26"]\n\nfunction initialize(request) {\n\n}`, solution: `const SUPPORTED = ["2025-06-18", "2025-03-26"]\n\nfunction initialize(request) {\n  const asked = request.params && request.params.protocolVersion\n  return {\n    jsonrpc: "2.0",\n    id: request.id,\n    result: {\n      protocolVersion: SUPPORTED.includes(asked) ? asked : SUPPORTED[0],\n      capabilities: { tools: {} },\n      serverInfo: { name: "openswap", version: "1.0.0" },\n    },\n  }\n}`, tests: [
      { msg: "Echoes a supported version and the request id", fn: (f) => { const r = f({ jsonrpc: "2.0", id: 7, method: "initialize", params: { protocolVersion: "2025-03-26", capabilities: {} } }); return r.jsonrpc === "2.0" && r.id === 7 && r.result.protocolVersion === "2025-03-26"; } },
      { msg: "Falls back to the newest version it supports", fn: (f) => f({ jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "2099-01-01" } }).result.protocolVersion === "2025-06-18" },
      { msg: "Declares tools and names itself", fn: (f) => { const r = f({ jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "2025-06-18" } }).result; return r.capabilities && r.capabilities.tools && r.serverInfo.name === "openswap" && !!r.serverInfo.version; } },
    ] },
  ],
  "The Tool List": [
    { t: "p", h: "After the handshake the client asks <code>tools/list</code>. Each tool has a <code>name</code>, an optional human-friendly <code>title</code>, a <code>description</code> (the model reads it to decide when to call) and an <code>inputSchema</code> (JSON Schema for the arguments). The host turns these into tool definitions for its model." },
    { t: "code", lang: "javascript", code: TOOLS },
    { t: "jsch", fn: "toModelTools", prompt: "Hosts bridge MCP to a model API. Write <code>toModelTools(listResult)</code> that converts a <code>tools/list</code> result (<code>{ tools: [...] }</code>) into Chat Completions tools: <code>{ type: \"function\", function: { name, description, parameters } }</code>, where <code>parameters</code> is the MCP <code>inputSchema</code>.", starter: `function toModelTools(listResult) {\n\n}`, solution: `function toModelTools(listResult) {\n  return listResult.tools.map((t) => ({\n    type: "function",\n    function: { name: t.name, description: t.description || t.title || "", parameters: t.inputSchema },\n  }))\n}`, tests: [
      { msg: "Maps name, description and inputSchema", fn: (f) => { const s = { type: "object", properties: { q: { type: "string" } } }; const r = f({ tools: [{ name: "searchSwaps", description: "Search", inputSchema: s }] }); return r.length === 1 && r[0].type === "function" && r[0].function.name === "searchSwaps" && r[0].function.description === "Search" && r[0].function.parameters === s; } },
      { msg: "Handles several tools", fn: (f) => f({ tools: [{ name: "a", description: "x", inputSchema: {} }, { name: "b", description: "y", inputSchema: {} }] }).map((t) => t.function.name).join() === "a,b" },
    ] },
  ],
  "Requests, Replies and Errors": [
    { t: "p", h: "A server is a message router. Each request gets exactly one response with the same <code>id</code>. Notifications (no <code>id</code>) get no response. Unknown methods get a JSON-RPC <b>error</b>: <code>{ code: -32601, message: \"Method not found\" }</code>. Other standard codes: <code>-32602</code> invalid params, <code>-32603</code> internal error." },
    { t: "jsch", fn: "handle", prompt: "Write <code>handle(msg)</code>: return <code>null</code> for notifications (no <code>id</code>); answer <code>ping</code> with an empty result <code>{}</code>; answer <code>tools/list</code> with <code>{ tools }</code>; answer anything else with an error <code>{ code: -32601, message: \"Method not found\" }</code>. Every reply is <code>{ jsonrpc: \"2.0\", id, result }</code> or <code>{ jsonrpc: \"2.0\", id, error }</code>.", starter: `${TOOLS}\n\nfunction handle(msg) {\n\n}`, solution: `${TOOLS}\n\nfunction handle(msg) {\n  if (msg.id === undefined) return null\n  const reply = (result) => ({ jsonrpc: "2.0", id: msg.id, result })\n  switch (msg.method) {\n    case "ping": return reply({})\n    case "tools/list": return reply({ tools })\n    default: return { jsonrpc: "2.0", id: msg.id, error: { code: -32601, message: "Method not found" } }\n  }\n}`, tests: [
      { msg: "Notifications get no reply", fn: (f) => f({ jsonrpc: "2.0", method: "notifications/initialized" }) === null },
      { msg: "ping → empty result; tools/list → the tools", fn: (f) => { const p = f({ jsonrpc: "2.0", id: 2, method: "ping" }); const l = f({ jsonrpc: "2.0", id: 3, method: "tools/list" }); return p.id === 2 && JSON.stringify(p.result) === "{}" && l.id === 3 && l.result.tools[0].name === "searchSwaps"; } },
      { msg: "Unknown methods → -32601 error", fn: (f) => { const r = f({ jsonrpc: "2.0", id: 4, method: "resources/list" }); return r.id === 4 && r.error.code === -32601 && !("result" in r); } },
    ] },
  ],
  "A Tool Call From Start to Finish": [
    { t: "steps", items: ["The user asks the host: \"Any retro games to swap?\"", "The host sends the model the conversation plus the tools from <code>tools/list</code>", "The model replies with a tool call: <code>searchSwaps({ query: \"game\" })</code>", "The host (often after the user approves) sends <code>tools/call</code> through the client", "The server runs the tool and replies with <code>content</code>: a list of text, image or resource blocks", "The host adds the result to the conversation and calls the model again, which writes the answer"] },
    { t: "code", lang: "json", code: `{ "jsonrpc": "2.0", "id": 5, "method": "tools/call",
  "params": { "name": "searchSwaps", "arguments": { "query": "game" } } }

{ "jsonrpc": "2.0", "id": 5, "result": {
  "content": [{ "type": "text", "text": "[{\\"id\\":1,\\"title\\":\\"Zelda cartridge\\"}, …]" }],
  "isError": false } }` },
    { t: "jsch", fn: "callTool", prompt: "Write <code>callTool(msg)</code> for a <code>tools/call</code> request: run <code>searchSwaps</code> with <code>msg.params.arguments</code> and reply with <code>{ jsonrpc: \"2.0\", id, result: { content: [{ type: \"text\", text: JSON.stringify(results) }], isError: false } }</code>.", starter: `${SWAPS}\n${SEARCH}\n\nfunction callTool(msg) {\n\n}`, solution: `${SWAPS}\n${SEARCH}\n\nfunction callTool(msg) {\n  const results = searchSwaps(msg.params.arguments || {})\n  return {\n    jsonrpc: "2.0",\n    id: msg.id,\n    result: { content: [{ type: "text", text: JSON.stringify(results) }], isError: false },\n  }\n}`, tests: [
      { msg: "Returns matching swaps as a text content block", fn: (f) => { const r = f({ jsonrpc: "2.0", id: 5, method: "tools/call", params: { name: "searchSwaps", arguments: { query: "game" } } }); const c = r.result.content[0]; return r.id === 5 && c.type === "text" && JSON.parse(c.text).map((s) => s.id).join() === "3" && r.result.isError === false; } },
      { msg: "Passes the category through", fn: (f) => JSON.parse(f({ jsonrpc: "2.0", id: 6, method: "tools/call", params: { name: "searchSwaps", arguments: { query: "e", category: "games" } } }).result.content[0].text).every((s) => s.category === "games") },
    ] },
  ],
  "What a Tool Is Made Of": [
    { t: "p", h: "A good MCP tool is the same as a good agent tool: one clear job, a name the model can't misread, a description that says <b>when</b> to use it, a tight input schema, and compact results. MCP adds optional <b>annotations</b> (hints like <code>readOnlyHint</code> or <code>destructiveHint</code> that a host can use to decide whether to ask the user first) and an optional <code>outputSchema</code> with <code>structuredContent</code> for machine-readable results." },
    { t: "code", lang: "javascript", code: `{
  name: "deleteListing",
  description: "Permanently delete one of the current user's listings",
  inputSchema: { type: "object", properties: { id: { type: "number" } }, required: ["id"] },
  annotations: { destructiveHint: true, idempotentHint: true },
}` },
  ],
  "Recovering From a Tool Error": [
    { t: "p", h: "There are two kinds of failure. A <b>protocol error</b> (unknown tool, malformed request) is a JSON-RPC <code>error</code>. A <b>tool execution error</b> (bad arguments, the API is down) is a normal <code>result</code> with <code>isError: true</code> and a message in <code>content</code>, so the model can see it and recover, exactly like returning <code>{ error }</code> in your own agent loop." },
    { t: "jsch", fn: "callToolSafe", prompt: "Write <code>callToolSafe(msg)</code>: if <code>msg.params.name</code> isn't a known tool, reply with a JSON-RPC error <code>{ code: -32602, message: \"Unknown tool: NAME\" }</code>. Otherwise run it; if it throws, reply with a result <code>{ content: [{ type: \"text\", text: \"Error: \" + message }], isError: true }</code>; if it works, reply as before with <code>isError: false</code>.", starter: `${SWAPS}\n${SEARCH}\nconst handlers = { searchSwaps }\n\nfunction callToolSafe(msg) {\n\n}`, solution: `${SWAPS}\n${SEARCH}\nconst handlers = { searchSwaps }\n\nfunction callToolSafe(msg) {\n  const { name, arguments: args = {} } = msg.params\n  const run = handlers[name]\n  if (!run) return { jsonrpc: "2.0", id: msg.id, error: { code: -32602, message: "Unknown tool: " + name } }\n  try {\n    const results = run(args)\n    return { jsonrpc: "2.0", id: msg.id, result: { content: [{ type: "text", text: JSON.stringify(results) }], isError: false } }\n  } catch (err) {\n    return { jsonrpc: "2.0", id: msg.id, result: { content: [{ type: "text", text: "Error: " + err.message }], isError: true } }\n  }\n}`, tests: [
      { msg: "Unknown tool → JSON-RPC error -32602", fn: (f) => { const r = f({ jsonrpc: "2.0", id: 8, method: "tools/call", params: { name: "launchRocket", arguments: {} } }); return r.id === 8 && r.error.code === -32602 && /launchRocket/.test(r.error.message); } },
      { msg: "A throwing tool → result with isError: true", fn: (f) => { const r = f({ jsonrpc: "2.0", id: 9, method: "tools/call", params: { name: "searchSwaps", arguments: { query: "" } } }); return r.result.isError === true && /^Error: query must be/.test(r.result.content[0].text) && !r.error; } },
      { msg: "Success still works", fn: (f) => JSON.parse(f({ jsonrpc: "2.0", id: 10, method: "tools/call", params: { name: "searchSwaps", arguments: { query: "kindle" } } }).result.content[0].text)[0].id === 2 },
    ] },
  ],
  "Testing With the MCP Inspector": [
    { t: "p", h: "The <b>MCP Inspector</b> is a browser UI for poking a server by hand: connect, see the handshake, list tools, fill in arguments, call them and read the raw JSON. Run it with <code>npx @modelcontextprotocol/inspector node server.js</code>. Below is a tiny in-page version talking to an Openswap server so you can watch every message." },
    { t: "play", task: "Click <b>Connect</b>, then <b>List tools</b>, then <b>Call</b>. Try an empty query to see <code>isError</code>, and a made-up tool name for a protocol error.", html: `<div style="font:14px system-ui;display:grid;gap:8px">
  <div style="display:flex;gap:6px;flex-wrap:wrap"><button id="c">Connect</button><button id="l">List tools</button>
  <input id="n" value="searchSwaps" size="12"><input id="a" value='{"query":"game"}' size="20"><button id="t">Call</button></div>
  <pre id="log" style="background:#0f172a;color:#e2e8f0;padding:10px;border-radius:8px;height:300px;overflow:auto;font:12px ui-monospace,monospace;margin:0"></pre>
</div>`, js: `// ── a tiny MCP server ──
const swaps = [{ id: 1, title: "Zelda cartridge", category: "games" }, { id: 2, title: "Kindle Paperwhite", category: "electronics" }, { id: 3, title: "Game Boy Color", category: "games" }]
const tools = [{ name: "searchSwaps", description: "Search Openswap listings by keyword", inputSchema: { type: "object", properties: { query: { type: "string" } }, required: ["query"] } }]
function server(msg) {
  if (msg.id === undefined) return null
  const ok = (result) => ({ jsonrpc: "2.0", id: msg.id, result })
  if (msg.method === "initialize") return ok({ protocolVersion: "2025-06-18", capabilities: { tools: {} }, serverInfo: { name: "openswap", version: "1.0.0" } })
  if (msg.method === "tools/list") return ok({ tools })
  if (msg.method === "tools/call") {
    if (msg.params.name !== "searchSwaps") return { jsonrpc: "2.0", id: msg.id, error: { code: -32602, message: "Unknown tool: " + msg.params.name } }
    const q = String(msg.params.arguments.query || "").toLowerCase()
    if (!q) return ok({ content: [{ type: "text", text: "Error: query must be a non-empty string" }], isError: true })
    return ok({ content: [{ type: "text", text: JSON.stringify(swaps.filter((s) => s.title.toLowerCase().includes(q))) }], isError: false })
  }
  return { jsonrpc: "2.0", id: msg.id, error: { code: -32601, message: "Method not found" } }
}
// ── the client side ──
let nextId = 1
const log = document.getElementById("log")
function send(method, params, notify) {
  const msg = notify ? { jsonrpc: "2.0", method } : { jsonrpc: "2.0", id: nextId++, method, ...(params ? { params } : {}) }
  log.textContent += "→ " + JSON.stringify(msg) + "\\n"
  const reply = server(msg)
  if (reply) log.textContent += "← " + JSON.stringify(reply) + "\\n\\n"
  log.scrollTop = log.scrollHeight
}
document.getElementById("c").onclick = () => { send("initialize", { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "inspector", version: "1.0" } }); send("notifications/initialized", null, true) }
document.getElementById("l").onclick = () => send("tools/list")
document.getElementById("t").onclick = () => {
  let args; try { args = JSON.parse(document.getElementById("a").value) } catch { args = {} }
  send("tools/call", { name: document.getElementById("n").value, arguments: args })
}` },
  ],
  "Local and Remote Servers": [
    { t: "p", h: "MCP defines two transports. <b>stdio</b>: the host starts the server as a child process and they exchange newline-delimited JSON over stdin/stdout. Great for local tools (files, a local database), with no network and no auth. <b>Streamable HTTP</b>: the server is a web service with one endpoint; clients POST messages and can receive streamed responses. Remote servers can be shared by many users and need real authentication (OAuth)." },
    { t: "code", lang: "javascript", code: `import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"
import { z } from "zod"

const server = new McpServer({ name: "openswap", version: "1.0.0" })
server.registerTool("searchSwaps", {
  description: "Search Openswap listings by keyword",
  inputSchema: { query: z.string() },
}, async ({ query }) => ({ content: [{ type: "text", text: JSON.stringify(await findSwaps(query)) }] }))

await server.connect(new StdioServerTransport())   // never console.log in a stdio server: stdout is the protocol!` },
    { t: "callout", kind: "warn", h: "Only install servers you trust: a server's tool descriptions go straight into your model's context, and its tools run with whatever access you give them." },
  ],
  "Recap and Where MCP Is Heading": [
    { t: "recap", items: ["MCP = JSON-RPC between a host's clients and tool/data servers", "Handshake: initialize → result → notifications/initialized", "tools/list gives name, description, inputSchema; hosts convert them for their model", "tools/call returns content blocks; execution failures use isError, protocol failures use error", "stdio for local servers, Streamable HTTP (with OAuth) for remote ones", "Next: more remote servers, better auth, registries of trusted servers, and richer interactions like asking the user for input"] },
  ],
};
