/* AI Engineer Path — Open-source Models: Hugging Face Inference, Transformers.js and Ollama.
   Labs call a practice Hugging Face-style inference API at https://api.shipyard.dev/hf/models/<model>. */

const HF = "https://api.shipyard.dev/hf/models";
const TOKEN = "hf_practice";
const call = (model, body) => `const res = await fetch("${HF}/${model}", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: "Bearer ${TOKEN}" },
    body: JSON.stringify(${body}),
  })`;

export const OSS_BODIES = {
  "Open source vs closed source": [
    { t: "p", h: "<b>Closed</b> (proprietary) models are reached only through the vendor's API. <b>Open-weight</b> models publish their weights, so anyone can download and run them, fine-tune them, or use a hosted provider. Neither is always better." },
    { t: "steps", items: ["<b>Closed</b>: usually the most capable, zero infrastructure, pay per token, your data goes to the vendor (check their retention terms)", "<b>Open</b>: full control and privacy, can run offline or on your own servers, predictable cost at scale, fine-tunable; you manage hardware, updates and safety", "<b>Licences differ</b>: some open models restrict commercial use or large companies. Read the model card", "<b>Mix them</b>: a small open model for cheap classification, a frontier model for hard reasoning"] },
    { t: "quiz", q: "A hospital wants to summarise patient notes without sending data to a third party. What fits best?", opts: ["A closed model through a public API", "An open-weight model running on the hospital's own servers", "No AI at all is ever possible"], a: 1, why: "Self-hosting an open model keeps sensitive data inside their infrastructure." },
  ],
  "Intro To HuggingFace.js Inference": [
    { t: "p", h: "<b>Hugging Face</b> hosts hundreds of thousands of open models. Its Inference API (and inference providers) runs many of them for you, called with one HTTP request per task. The <code>@huggingface/inference</code> package wraps those calls: <code>hf.summarization()</code>, <code>hf.textClassification()</code>, <code>hf.textToImage()</code> and more." },
    { t: "code", lang: "javascript", code: `import { InferenceClient } from "@huggingface/inference"
const hf = new InferenceClient(process.env.HF_TOKEN)   // a free access token from your HF settings

const out = await hf.summarization({ model: "facebook/bart-large-cnn", inputs: longText })
console.log(out.summary_text)` },
    { t: "callout", kind: "tip", h: "The labs use a practice endpoint with the same request shape: <code>POST " + HF + "/&lt;model&gt;</code> with <code>{ inputs, parameters }</code> and <code>Authorization: Bearer hf_…</code>. Any token starting with <code>hf_</code> works there." },
  ],
  "Getting Started with models on HuggingFace Inference": [
    { t: "play", api: true, task: "Run it, then change the model to <code>HuggingFaceTB/SmolLM2-1.7B-Instruct</code> for text generation, or remove the token to see the error.", html: `<pre id="out" style="white-space:pre-wrap;font:14px ui-monospace,monospace"></pre>`, js: `async function run() {
  ${call("Helsinki-NLP/opus-mt-en-fr", '{ inputs: "Good morning" }')}
  const data = await res.json()
  document.getElementById("out").textContent = res.status + "\\n" + JSON.stringify(data, null, 2)
}
run()` },
    { t: "p", h: "Each task returns its own shape: translation gives <code>[{ translation_text }]</code>, summarisation <code>[{ summary_text }]</code>, classification an array of <code>{ label, score }</code>. Read the model card's example output before you write parsing code." },
  ],
  "Text Summarization & Classification with HuggingFace Inference": [
    { t: "jsch", fn: "summarize", prompt: "Write <code>summarize(text, maxLength)</code>: call the <code>facebook/bart-large-cnn</code> model at <code>" + HF + "/facebook/bart-large-cnn</code> with <code>{ inputs: text, parameters: { max_length: maxLength } }</code> (token <code>" + TOKEN + "</code>) and resolve to the summary string.", starter: `async function summarize(text, maxLength = 60) {\n\n}`, solution: `async function summarize(text, maxLength = 60) {\n  ${call("facebook/bart-large-cnn", "{ inputs: text, parameters: { max_length: maxLength } }")}\n  const data = await res.json()\n  if (!res.ok) throw new Error(data.error)\n  return data[0].summary_text\n}`, tests: [
      { msg: "Resolves to a shorter summary", fn: async (f) => { const t = "The Great Wall of China is thousands of kilometres long. Construction began more than two thousand years ago. It was built to protect against invasions. Today it is a popular tourist attraction."; const s = await f(t); return typeof s === "string" && s.length > 10 && s.length < t.length; } },
    ] },
    { t: "jsch", fn: "sentiment", prompt: "Write <code>sentiment(text)</code> using <code>distilbert/distilbert-base-uncased-finetuned-sst-2-english</code>. The response is <code>[[{ label, score }, …]]</code>, best first. Resolve to <code>{ label, score }</code> of the top result.", starter: `async function sentiment(text) {\n\n}`, solution: `async function sentiment(text) {\n  ${call("distilbert/distilbert-base-uncased-finetuned-sst-2-english", "{ inputs: text }")}\n  const data = await res.json()\n  return data[0][0]\n}`, tests: [
      { msg: "Positive review → POSITIVE", fn: async (f) => (await f("I love this phone, the camera is amazing")).label === "POSITIVE" },
      { msg: "Negative review → NEGATIVE with a score", fn: async (f) => { const r = await f("Terrible battery, awful support, the worst purchase"); return r.label === "NEGATIVE" && r.score > 0.5; } },
    ] },
    { t: "callout", kind: "tip", h: "Specialised small models are fast and cheap for narrow jobs like sentiment, but they only know their labels. For nuanced categories (\"billing\", \"bug\", \"feature request\") a zero-shot classifier or a general chat model with a clear prompt is more flexible." },
  ],
  "Transforming Images with HuggingFace Inference": [
    { t: "p", h: "Text-to-image models like Stable Diffusion and FLUX turn a prompt into an image; image-to-image models restyle an existing one. The real API returns image bytes (a <code>Blob</code>) that you show with <code>URL.createObjectURL(blob)</code>. The practice API returns <code>{ image }</code> as a data URL so it works offline." },
    { t: "play", api: true, task: "Change the prompt and generate again. Notice how the description drives the result.", html: `<form id="f" style="display:flex;gap:8px"><input id="p" value="a lighthouse at sunset, watercolour" style="flex:1;padding:8px"><button>Generate</button></form><img id="img" alt="" style="width:256px;margin-top:12px;border-radius:8px">`, js: `document.getElementById("f").addEventListener("submit", async (e) => {
  e.preventDefault()
  const prompt = document.getElementById("p").value
  ${call("stabilityai/stable-diffusion-xl-base-1.0", "{ inputs: prompt }").replace(/\n  /g, "\n  ")}
  const { image } = await res.json()
  const img = document.getElementById("img")
  img.src = image
  img.alt = prompt
})` },
  ],
  "How to find Inference Models on HuggingFace": [
    { t: "steps", items: ["Filter the <b>Models</b> page by <b>task</b> (summarisation, text classification, text-to-image…) and by <b>inference provider</b> availability", "Sort by downloads or trending, then read the <b>model card</b>: what it was trained on, its languages, limitations and licence", "Try it in the card's widget before writing code", "Check the size: smaller models are faster and cheaper; bigger ones are usually better at open-ended tasks"] },
    { t: "quiz", q: "A model card says the model was trained only on English news. You need to classify Hindi tweets. What do you do?", opts: ["Use it anyway", "Look for a multilingual model trained on social media text, and test it on real examples", "Translate every tweet first, always"], a: 1, why: "Models perform best on data like their training data. Match language and domain, then measure." },
  ],
  "AI Models In The Browser With Transformers.js": [
    { t: "p", h: "<b>Transformers.js</b> runs ONNX versions of many Hugging Face models directly in the browser with WebAssembly or WebGPU. No server, no API key, and the user's data never leaves their device. The trade-offs: a one-time model download (tens to hundreds of MB, then cached) and the user's hardware sets the speed." },
    { t: "code", lang: "javascript", code: `import { pipeline } from "@huggingface/transformers"

// downloads and caches the model the first time
const classify = await pipeline("sentiment-analysis", "Xenova/distilbert-base-uncased-finetuned-sst-2-english")
const [result] = await classify("This course is brilliant!")
console.log(result) // { label: "POSITIVE", score: 0.9998 }` },
    { t: "callout", kind: "tip", h: "Great for privacy-sensitive or offline features (on-device sentiment, embeddings for local search, speech-to-text). Run it in a Web Worker so the UI doesn't freeze while the model works." },
  ],
  "Download and Run AI Models on Your Computer with Ollama": [
    { t: "p", h: "<b>Ollama</b> downloads and runs open models locally with one command, and serves an <b>OpenAI-compatible</b> API on <code>localhost:11434</code>. That means the code you wrote for Gift Genie works against a local model by changing the base URL." },
    { t: "code", lang: "bash", code: `ollama pull llama3.2      # download a small model (a few GB)
ollama run llama3.2       # chat in the terminal` },
    { t: "code", lang: "javascript", code: `import OpenAI from "openai"
const client = new OpenAI({ baseURL: "http://localhost:11434/v1", apiKey: "ollama" }) // key is ignored
const r = await client.chat.completions.create({ model: "llama3.2", messages: [{ role: "user", content: "Hi!" }] })` },
    { t: "callout", kind: "key", h: "Local models are perfect for development without a bill, private data, and offline demos. Expect them to be slower and less capable than frontier APIs unless you have a powerful GPU." },
  ],
  "Section Recap": [
    { t: "recap", items: ["Open vs closed: control and privacy vs capability and convenience; check licences", "Hugging Face Inference: one request per task, each with its own response shape", "Pick models by task, language and size; read the model card", "Transformers.js runs models in the browser, privately", "Ollama runs models locally behind an OpenAI-compatible API"] },
  ],
};
