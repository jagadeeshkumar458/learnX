/* AI Engineer Path — Multimodality: image generation (/v1/images/generations and /edits) and vision
   (image parts in chat messages). The practice image model draws SVG scenes from the prompt and stores the
   prompt in the SVG's <desc>, which is how the practice vision model "sees" them. */

const API = "https://api.shipyard.dev/v1";
const KEY = "sk-practice-123";
const H = `headers: { "Content-Type": "application/json", Authorization: "Bearer ${KEY}" }`;
const svgUrl = (desc, body, w = 320, h = 220) => "data:image/svg+xml;charset=utf-8," + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><desc>${desc}</desc>${body}</svg>`);
export const RECEIPT = svgUrl("a shop receipt: 2 coffees £6.40, 1 croissant £2.80, total £9.20", `<rect width="320" height="220" fill="#e5e7eb"/><rect x="90" y="10" width="140" height="200" fill="#fff"/><g font-family="ui-monospace,monospace" font-size="11" fill="#111"><text x="160" y="34" text-anchor="middle" font-weight="700">BEAN THERE</text><text x="100" y="64">2 x Coffee</text><text x="220" y="64" text-anchor="end">£6.40</text><text x="100" y="84">1 x Croissant</text><text x="220" y="84" text-anchor="end">£2.80</text><line x1="100" y1="100" x2="220" y2="100" stroke="#111" stroke-dasharray="3 2"/><text x="100" y="120" font-weight="700">TOTAL</text><text x="220" y="120" text-anchor="end" font-weight="700">£9.20</text><text x="160" y="170" text-anchor="middle">Thank you!</text></g>`);
export const FRIDGE = svgUrl("an open fridge with eggs, milk, spinach, cheddar cheese and three tomatoes", `<rect width="320" height="220" fill="#f1f5f9"/><rect x="80" y="10" width="160" height="200" rx="10" fill="#fff" stroke="#94a3b8" stroke-width="3"/><line x1="80" y1="80" x2="240" y2="80" stroke="#94a3b8" stroke-width="2"/><line x1="80" y1="145" x2="240" y2="145" stroke="#94a3b8" stroke-width="2"/><g font-size="30"><text x="95" y="70">🥚🥛</text><text x="95" y="135">🥬🧀</text><text x="95" y="198">🍅🍅🍅</text></g>`);
export const PENGUIN = svgUrl("a penguin on a snowy mountain", `<rect width="320" height="220" fill="#e0f2fe"/><path d="M0 200 L120 80 L200 160 L250 110 L320 180 V220 H0Z" fill="#fff" stroke="#94a3b8"/><text x="160" y="190" text-anchor="middle" font-size="70">🐧</text>`);
const SAMPLES = `const samples = {
  receipt: "${RECEIPT}",
  fridge: "${FRIDGE}",
}`;

export const MULTI_BODIES = {
  "Introduction": [
    { t: "p", h: "<b>Multimodal</b> models work with more than text. In this section you'll go both ways: <b>image generation</b> (text in, image out) for illustrations, avatars and mock-ups, and <b>vision</b> (image in, text out) for reading receipts, describing photos and writing alt text." },
    { t: "callout", kind: "tip", h: "The labs use a practice image API with the same request shape as OpenAI's Images API. It draws simple SVG scenes from your prompt (cats, rockets, sunsets…) so you can focus on the code and the parameters." },
  ],
  "Generate original images from a text prompt": [
    { t: "p", h: "One request: <code>POST /v1/images/generations</code> with a <code>model</code> and a <code>prompt</code>. The response has a <code>data</code> array with one item per image. Generation takes seconds (often 10–30 with real models) and costs far more than a chat reply, so show a loading state and don't regenerate on every keystroke." },
    { t: "code", lang: "javascript", code: `const result = await client.images.generate({
  model: "gpt-image-1",
  prompt: "a cosy reading nook with a cat, watercolour",
})
const b64 = result.data[0].b64_json` },
    { t: "play", api: true, task: "Generate a few images. Try subjects like <i>a robot</i>, <i>a lighthouse</i> or <i>a fox in a forest</i>, and scenes like <i>sunset</i>, <i>night</i> or <i>underwater</i>.", html: `<form id="f" style="display:flex;gap:8px;font:14px system-ui"><input id="p" value="a fox in a forest at night" style="flex:1;padding:8px"><button>Generate</button></form><p id="s" style="font:13px system-ui;color:#64748b"></p><img id="img" alt="" style="width:100%;max-width:420px;border-radius:10px">`, js: `document.getElementById("f").addEventListener("submit", async (e) => {
  e.preventDefault()
  const prompt = document.getElementById("p").value
  document.getElementById("s").textContent = "Generating…"
  const res = await fetch("${API}/images/generations", {
    method: "POST",
    ${H},
    body: JSON.stringify({ model: "shipyard-image", prompt }),
  })
  const data = await res.json()
  if (!res.ok) { document.getElementById("s").textContent = data.error.message; return }
  document.getElementById("img").src = data.data[0].url
  document.getElementById("img").alt = prompt
  document.getElementById("s").textContent = ""
})` },
  ],
  "Response formats": [
    { t: "p", h: "Images come back as a <b>URL</b> (DALL·E models, links expire after about an hour, so download anything you want to keep) or as <b>base64</b> in <code>b64_json</code> (<code>gpt-image-1</code> always does this). Show base64 with a data URL: <code>\"data:image/png;base64,\" + b64</code>, or decode it to bytes and upload it to storage." },
    { t: "callout", kind: "warn", h: "The practice API returns SVG instead of PNG, so its data URLs use <code>image/svg+xml</code>. It tells you with <code>output_format: \"svg\"</code>; real APIs report <code>png</code>, <code>jpeg</code> or <code>webp</code>." },
    { t: "jsch", fn: "toImageSrc", prompt: "Write <code>toImageSrc(item, outputFormat)</code> that turns one item of <code>data</code> into something an <code>&lt;img src&gt;</code> can show: return <code>item.url</code> if present, otherwise <code>\"data:image/\" + mime + \";base64,\" + item.b64_json</code>, where mime is <code>svg+xml</code> for <code>\"svg\"</code> and the format itself otherwise (default <code>png</code>).", starter: `function toImageSrc(item, outputFormat = "png") {\n\n}`, solution: `function toImageSrc(item, outputFormat = "png") {\n  if (item.url) return item.url\n  const mime = outputFormat === "svg" ? "svg+xml" : outputFormat\n  return "data:image/" + mime + ";base64," + item.b64_json\n}`, tests: [
      { msg: "URLs pass straight through", fn: (f) => f({ url: "https://img.example/a.png" }) === "https://img.example/a.png" },
      { msg: "base64 → a data URL with the right type", fn: (f) => f({ b64_json: "AAA" }) === "data:image/png;base64,AAA" && f({ b64_json: "BBB" }, "webp") === "data:image/webp;base64,BBB" && f({ b64_json: "CCC" }, "svg") === "data:image/svg+xml;base64,CCC" },
    ] },
  ],
  "Prompting for image generation": [
    { t: "p", h: "Image models reward <b>description</b>, not instructions. Say what's in the picture, where, in what style and mood, from what angle. Put the most important thing first. Name a medium (watercolour, 3D render, pixel art, product photo) and lighting (golden hour, soft studio light). Avoid asking for text in images unless the model is good at it." },
    { t: "code", lang: "text", code: `weak:   make a picture for my coffee shop
better: a cosy corner coffee shop at golden hour, a barista pouring latte art,
        warm light through big windows, plants on the shelves,
        watercolour illustration, soft pastel colours, wide shot` },
    { t: "jsch", fn: "buildImagePrompt", prompt: "Write <code>buildImagePrompt({ subject, setting, style, mood, details })</code>: join the parts that are present, in that order, with <code>\", \"</code>. <code>details</code> is an optional array whose items are each added as their own part. Skip missing or empty parts.", starter: `function buildImagePrompt({ subject, setting, style, mood, details }) {\n\n}`, solution: `function buildImagePrompt({ subject, setting, style, mood, details = [] }) {\n  return [subject, setting, ...details, style, mood].filter((p) => typeof p === "string" && p.trim()).join(", ")\n}`, tests: [
      { msg: "Joins every part in order", fn: (f) => { const r = f({ subject: "a fox", setting: "in a snowy forest", style: "watercolour", mood: "calm" }); return r.startsWith("a fox, in a snowy forest") && r.includes("watercolour") && r.endsWith("calm"); } },
      { msg: "Skips missing parts and includes details", fn: (f) => { const r = f({ subject: "a robot", details: ["holding a lantern", "wide shot"] }); return r.startsWith("a robot, ") && r.includes("holding a lantern") && r.includes("wide shot") && !/undefined|, ,/.test(r); } },
    ] },
  ],
  "Size, quality and style": [
    { t: "p", h: "<b>size</b> sets the shape: square <code>1024x1024</code>, landscape <code>1536x1024</code>, portrait <code>1024x1536</code> (DALL·E 3 uses 1792 instead of 1536). <b>quality</b> (<code>low</code>, <code>medium</code>, <code>high</code>; or <code>standard</code>/<code>hd</code> for DALL·E 3) trades detail for speed and price. DALL·E 3 also has <b>style</b>: <code>vivid</code> (dramatic) or <code>natural</code>, and rewrites your prompt, returning it as <code>revised_prompt</code>." },
    { t: "play", api: true, task: "Compare sizes and qualities. Try an invalid size like <code>800x600</code> to see the error, and switch the model to <code>dall-e-3</code> to see a <code>revised_prompt</code>.", html: `<div style="display:flex;gap:6px;flex-wrap:wrap;font:13px system-ui"><input id="p" value="a rocket over the ocean" style="flex:1;min-width:160px;padding:6px"><select id="size"><option>1024x1024</option><option>1536x1024</option><option>1024x1536</option><option>800x600</option></select><select id="q"><option>low</option><option selected>medium</option><option>high</option></select><select id="m"><option>shipyard-image</option><option>dall-e-3</option></select><button id="go">Generate</button></div><p id="s" style="font:12px ui-monospace,monospace;color:#64748b"></p><img id="img" alt="" style="max-width:100%;border-radius:10px">`, js: `document.getElementById("go").onclick = async () => {
  const body = {
    model: document.getElementById("m").value,
    prompt: document.getElementById("p").value,
    size: document.getElementById("size").value,
    quality: document.getElementById("q").value,
  }
  const res = await fetch("${API}/images/generations", { method: "POST", ${H}, body: JSON.stringify(body) })
  const data = await res.json()
  const s = document.getElementById("s")
  if (!res.ok) { s.textContent = "❌ " + data.error.message; return }
  document.getElementById("img").src = data.data[0].url
  s.textContent = "usage: " + JSON.stringify(data.usage) + (data.data[0].revised_prompt ? "\\nrevised_prompt: " + data.data[0].revised_prompt : "")
}` },
    { t: "quiz", q: "You need 200 small thumbnails for a prototype, fast and cheap. Which settings?", opts: ["1536x1024, high quality", "1024x1024, low quality", "1024x1536, hd"], a: 1, why: "Low quality at the smallest size is quickest and cheapest; upgrade only the images that ship." },
  ],
  "Editing images": [
    { t: "p", h: "<code>POST /v1/images/edits</code> takes an existing image plus a prompt describing the change, optionally with a <b>mask</b> (a PNG whose transparent area marks where to edit). The real endpoint is a <code>multipart/form-data</code> upload (<code>FormData</code> with the file); the practice endpoint accepts JSON with the image as a data URL." },
    { t: "code", lang: "javascript", code: `import fs from "node:fs"
const result = await client.images.edit({
  model: "gpt-image-1",
  image: fs.createReadStream("living-room.png"),
  mask: fs.createReadStream("sofa-mask.png"),   // optional: edit only the transparent area
  prompt: "replace the sofa with a green velvet one",
})` },
    { t: "play", api: true, task: "Generate, then apply edits one after another: <i>add glasses</i>, <i>make it night</i>, <i>add balloons</i>.", html: `<div style="display:grid;gap:6px;font:13px system-ui"><div style="display:flex;gap:6px"><input id="p" value="a cat in a garden" style="flex:1;padding:6px"><button id="gen">Generate</button></div><div style="display:flex;gap:6px"><input id="e" value="add glasses" style="flex:1;padding:6px"><button id="edit">Edit</button></div><img id="img" alt="" style="max-width:360px;border-radius:10px"><small id="s" style="color:#64748b"></small></div>`, js: `let current = null
async function call(path, body) {
  const res = await fetch("${API}/images/" + path, { method: "POST", ${H}, body: JSON.stringify(body) })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error.message)
  return data.data[0].url
}
async function show(p) {
  try { current = await p; document.getElementById("img").src = current; document.getElementById("s").textContent = "" }
  catch (err) { document.getElementById("s").textContent = err.message }
}
document.getElementById("gen").onclick = () => show(call("generations", { prompt: document.getElementById("p").value }))
document.getElementById("edit").onclick = () => show(call("edits", { image: current, prompt: document.getElementById("e").value }))` },
  ],
  "Image generation challenge": [
    { t: "p", h: "Openswap listings without photos look empty. Build an illustrator that generates a placeholder image for a listing from its title and category." },
    { t: "jsch", fn: "illustrateListing", prompt: "Write <code>illustrateListing(listing)</code>: build a prompt like <code>\"&lt;title&gt;, a &lt;category&gt; item for a swap listing, flat illustration, soft pastel colours\"</code>, request a landscape image (<code>1536x1024</code>, quality <code>low</code>, <code>response_format: \"b64_json\"</code>), and resolve to <code>{ src, alt }</code>: <code>src</code> a data URL built from <code>b64_json</code> and the response's <code>output_format</code>, <code>alt</code> the listing's title. Throw the API's message if the request fails.", starter: `async function illustrateListing(listing) {\n\n}`, solution: `async function illustrateListing(listing) {\n  const prompt = listing.title + ", a " + listing.category + " item for a swap listing, flat illustration, soft pastel colours"\n  const res = await fetch("${API}/images/generations", {\n    method: "POST",\n    ${H},\n    body: JSON.stringify({ prompt, size: "1536x1024", quality: "low", response_format: "b64_json" }),\n  })\n  const data = await res.json()\n  if (!res.ok) throw new Error(data.error.message)\n  const format = data.output_format === "svg" ? "svg+xml" : data.output_format || "png"\n  return { src: "data:image/" + format + ";base64," + data.data[0].b64_json, alt: listing.title }\n}`, tests: [
      { msg: "Resolves to a base64 data URL and alt text", fn: async (f) => { const r = await f({ title: "Vintage guitar", category: "music" }); return /^data:image\/svg\+xml;base64,/.test(r.src) && r.alt === "Vintage guitar"; } },
      { msg: "The prompt includes the title and category, at landscape size", fn: async (f) => { const r = await f({ title: "Kindle reader", category: "electronics" }); const svg = decodeURIComponent(escape(atob(r.src.split(",")[1]))); return /Kindle reader/.test(svg) && /electronics/.test(svg) && /width="384"/.test(svg); } },
      { msg: "Low quality was requested (no extra detail dots)", fn: async (f) => { const r = await f({ title: "Tent", category: "camping" }); const svg = decodeURIComponent(escape(atob(r.src.split(",")[1]))); return !/<circle/.test(svg); } },
    ] },
  ],
  "Image generation challenge solution": [
    { t: "steps", items: ["Build the prompt from the data: subject first (the title), then context (category, purpose), then a consistent style so every placeholder matches", "Request the cheapest settings that look right: <code>quality: \"low\"</code> at the size your card uses", "Ask for <code>b64_json</code> so you can store the image yourself instead of relying on an expiring URL", "Build the data URL from the reported format, and always set alt text", "In production, generate once when the listing is created, upload to storage and save the URL on the listing: never regenerate on page load"] },
    { t: "callout", kind: "warn", h: "Label generated images (\"illustration\") so swappers don't mistake them for photos of the actual item." },
  ],
  "GPT-4 with Vision - Part 1": [
    { t: "p", h: "Vision models accept images inside a message. Instead of a string, <code>content</code> becomes an array of parts: <code>{ type: \"text\", text }</code> and <code>{ type: \"image_url\", image_url: { url } }</code>, where <code>url</code> is a public link or a base64 data URL. Add <code>detail: \"low\"</code> for a cheaper, faster look when fine detail doesn't matter." },
    { t: "code", lang: "javascript", code: `const messages = [{
  role: "user",
  content: [
    { type: "text", text: "What's the total on this receipt?" },
    { type: "image_url", image_url: { url: receiptDataUrl, detail: "high" } },
  ],
}]` },
    { t: "play", api: true, task: "Pick a sample and ask questions: \"What's the total?\", \"What can I cook for dinner?\", \"Write alt text for this image\".", html: `<div style="display:grid;gap:6px;font:13px system-ui"><div style="display:flex;gap:6px"><select id="pic"><option value="receipt">Receipt</option><option value="fridge">Fridge</option></select><input id="q" value="What's the total on this receipt?" style="flex:1;padding:6px"><button id="ask">Ask</button></div><img id="img" alt="" style="max-width:320px;border-radius:8px"><p id="out" style="font-size:15px"></p></div>`, js: `${SAMPLES}
const pic = document.getElementById("pic"), img = document.getElementById("img")
const showPic = () => { img.src = samples[pic.value] }
pic.onchange = showPic; showPic()
document.getElementById("ask").onclick = async () => {
  const messages = [{ role: "user", content: [
    { type: "text", text: document.getElementById("q").value },
    { type: "image_url", image_url: { url: samples[pic.value] } },
  ] }]
  const res = await fetch("${API}/chat/completions", { method: "POST", ${H}, body: JSON.stringify({ messages }) })
  const data = await res.json()
  document.getElementById("out").textContent = data.choices[0].message.content + "   (" + data.usage.prompt_tokens + " prompt tokens)"
}` },
  ],
  "GPT-4 with Vision - Part 2": [
    { t: "p", h: "Images cost tokens too (a large image can cost more than a page of text), so resize big photos before sending them. Vision models are good at describing, reading printed text and comparing images, and weaker at exact counting, small text and precise positions. For anything important, like a receipt total, ask for structured output and let a person confirm." },
    { t: "jsch", fn: "askAboutImage", prompt: "Write <code>askAboutImage(imageUrl, question)</code>: send one user message whose content is a text part with the question and an <code>image_url</code> part with the image, and resolve to the reply text.", starter: `${SAMPLES}\n\nasync function askAboutImage(imageUrl, question) {\n\n}`, solution: `${SAMPLES}\n\nasync function askAboutImage(imageUrl, question) {\n  const messages = [{\n    role: "user",\n    content: [\n      { type: "text", text: question },\n      { type: "image_url", image_url: { url: imageUrl } },\n    ],\n  }]\n  const res = await fetch("${API}/chat/completions", {\n    method: "POST",\n    ${H},\n    body: JSON.stringify({ messages }),\n  })\n  const data = await res.json()\n  return data.choices[0].message.content\n}`, tests: [
      { msg: "Reads the receipt total", fn: async (f, ctx) => /9\.20/.test(await f(ctx.samples ? ctx.samples.receipt : "", "What's the total on this receipt?")) },
      { msg: "Suggests a dinner from the fridge", fn: async (f, ctx) => /omelette/i.test(await f(ctx.samples.fridge, "What can I cook for dinner?")) },
    ], extra: ["samples"] },
    { t: "jsch", fn: "generateAltText", prompt: "Combine both halves: write <code>generateAltText(imageUrl)</code> that asks the vision model to <i>write short alt text for this image</i> and resolves to the reply, trimmed. The test checks your alt text against the sample image <code>penguin</code>.", starter: `const penguin = "${PENGUIN}"\n\nasync function generateAltText(imageUrl) {\n\n}`, solution: `const penguin = "${PENGUIN}"\n\nasync function generateAltText(imageUrl) {\n  const res = await fetch("${API}/chat/completions", {\n    method: "POST",\n    ${H},\n    body: JSON.stringify({ messages: [{ role: "user", content: [\n      { type: "text", text: "Write short alt text for this image." },\n      { type: "image_url", image_url: { url: imageUrl } },\n    ] }] }),\n  })\n  const data = await res.json()\n  return data.choices[0].message.content.trim()\n}`, tests: [
      { msg: "Describes the image in under 120 characters", fn: async (f, ctx) => { const alt = await f(ctx.penguin); return /penguin/i.test(alt) && alt.length < 120; } },
    ], extra: ["penguin"] },
  ],
  "Image generation & Vision recap": [
    { t: "recap", items: ["Images API: prompt in, data[] out, as url (expires) or b64_json", "Describe the picture: subject first, then setting, style, mood and framing", "size, quality and style trade shape, detail, speed and cost", "Edits take an image, a prompt and an optional mask (multipart upload)", "Vision: content becomes an array of text and image_url parts", "Images cost tokens; verify important readings with a person"] },
  ],
};
