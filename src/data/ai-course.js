/* The AI Engineer Path — syllabus read from the course screenshot.
   Each section is a module; each video is a lesson. Lessons without a `body` render as outline pages. */
import { INTRO_BODIES, RAG_BODIES } from "./modules/aipath-intro.js";
import { DEPLOY_BODIES } from "./modules/aipath-deploy.js";
import { OSS_BODIES } from "./modules/aipath-oss.js";
import { AGENTS_BODIES } from "./modules/aipath-agents.js";
import { CONTEXT_BODIES } from "./modules/aipath-context.js";
import { VERCEL_BODIES } from "./modules/aipath-vercel.js";
import { MCP_BODIES } from "./modules/aipath-mcp.js";

let SEQ = 0;
const lessons = (titles) =>
  titles.map((t) => ({
    id: "ai-" + t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 36) + "-" + ++SEQ,
    title: t,
    min: /challenge|solo project/i.test(t) ? 8 : /intro|outro|recap|about/i.test(t) ? 3 : 5,
    kind: /solo project/i.test(t) ? "solo" : /challenge/i.test(t) ? "build" : "lesson",
  }));

export const AI_COURSE = {
  id: "ai",
  title: "The AI Engineer Path",
  level: "Intermediate",
  tagline: "Build apps powered by generative AI: agents, RAG, MCP, multimodality, context engineering and more.",
  about: "A practical, JavaScript-powered track for web developers. No model training or research maths: you learn to ship AI features into real products, with solo projects that build genuine muscle memory.",
  modules: [
    { id: "ai-intro", title: "Intro to AI Engineering", blurb: "Make your first AI request, then build Gift Genie: prompts, messages, streaming, structured outputs and a backend.",
      concepts: ["Choosing models and setting up an AI client", "Tokens, cost and context windows", "The messages array and system message", "Streaming and rendering Markdown safely", "Few-shot prompting, temperature and top-p", "Responses API, JSON and structured outputs", "Moving AI calls to a backend"],
      lessons: lessons(["Introducing Your AI Superpower", "The AI Marketplace", "Environment Setup", "Recommended Models", "Setting Up Your AI Client", "Your First AI Request", "Your First AI Request Walkthrough", "Rebuilding Your First AI Request", "Shorter Responses With Tokens", "Refining Our Prompt", "Refactoring Our AI Request", "Model Snapshots", "The Messages Array", "The System Message", "Aside: Token Costs & Context Windows", "Wiring up our UI", "Error Handling", "Rendering Markdown Safely", "Streaming AI Responses", "Gift Genie UI Streaming Challenge", "Structuring Our Markdown Responses", "Making Our Gift Genie Context Aware", "Few Shot Prompting", "Temperature & Top P", "Responses API Intro", "JSON Output", "Structured Outputs", "Aside: Web Search Tool", "Web Search In The Gift Genie UI", "Backend Orientation", "Backend Migration Super Challenge", "Outro", "Solo Project - PollyGlot"]) },
    { id: "ai-deploy", title: "Deployment", blurb: "Ship an AI app to production: build commands, smoke tests, domains, staging, alerts and health checks.",
      concepts: ["Preparing a Node app for production", "Build commands and smoke tests", "Custom domains", "Staging environments and merging", "Alerts, health endpoints and graceful shutdown"],
      lessons: lessons(["Intro", "Code check", "The Node Environment", "Push to GitHub", "Render Build Command", "Smoke Test", "Domain Names", "Database Problems", "Staging", "Merging", "Alerts and Notifications", "Health endpoint", "Terminating Processes & Signals", "Outro"]) },
    { id: "ai-oss", title: "Open-source Models", blurb: "Use open models through Hugging Face, in the browser with Transformers.js, and locally with Ollama.",
      concepts: ["Open vs closed models: trade-offs", "Hugging Face Inference for text and images", "Summarisation and classification", "Running models in the browser", "Running models locally with Ollama"],
      lessons: lessons(["Open source vs closed source", "Intro To HuggingFace.js Inference", "Getting Started with models on HuggingFace Inference", "Text Summarization & Classification with HuggingFace Inference", "Transforming Images with HuggingFace Inference", "How to find Inference Models on HuggingFace", "AI Models In The Browser With Transformers.js", "Download and Run AI Models on Your Computer with Ollama", "Section Recap"]) },
    { id: "ai-rag", title: "Embeddings and Vector Databases", blurb: "Give models your own knowledge with embeddings, vector search and retrieval-augmented generation.",
      concepts: ["What embeddings are and why they work", "Storing vectors in a vector database", "Similarity search", "Chunking documents", "Retrieval-augmented generation (RAG)"],
      lessons: lessons(["Your next big step in AI engineering", "What are embeddings?", "Set up environment variables", "Create an embedding", "Challenge: Pair text with embedding", "Vector databases", "Supabase Dependency Upgrade Warning", "Set up your vector database", "Store vector embeddings", "Semantic search", "Query embeddings using similarity search", "Create a conversational response using OpenAI", "Chunking text from documents", "Challenge: Split text, get vectors, insert into Supabase", "Error handling", "Query database and manage multiple matches", "AI chatbot proof of concept", "Retrieval-augmented generation (RAG)", "Solo Project: PopChoice", "You made it to the finish line!"]) },
    { id: "ai-agents", title: "Agents", blurb: "Build agents that call tools in a loop, handle failures and keep conversations going.",
      concepts: ["What agents are and when to use them", "Defining tools and parameters", "The agent loop", "Returning tool results and reasoning items", "Handling tool failures", "Saving and continuing conversations"],
      lessons: lessons(["The Limitation", "What Are Agents?", "Environment Setup", "Recommend Models", "Chat Completions And Responses", "Understanding Model Memory", "Why Use Agents", "Your First Tool Definition", "The Loop", "Running Tool Calls", "Returning Tool Results", "Reasoning Items In The Loop", "Tool Parameters", "Parameterizing The News Tool", "Defining Search Swaps", "Tool Inputs Are Still Inputs", "Wiring The Search Loop", "Wiring The Agent Into Openswap", "Handling Every Tool Call", "When Tools Fail", "Designing The Health Check Tool", "Proving The Github Health Check Data Path", "Adding The Health Check Agent Tool", "Widening The Search With Tags", "Completing The Agent Loop", "Managing Agent Conversations", "Saving And Loading Agent Conversations", "Continuing Agent Conversations", "Outro"]) },
    { id: "ai-context", title: "Context Engineering", blurb: "Control what the model sees: system prompts, context windows and summarisation.",
      concepts: ["Designing system prompts", "AI SDK + OpenRouter setup", "Managing the context window", "Summarising long conversations"],
      lessons: lessons(["Context Engineering Intro", "The System Prompt", "AI SDK + OpenRouter Setup & Code Overview", "Adding A System Prompt", "System Prompt Challenge", "Managing The Context Window", "Context Window Demo", "Context Window Challenge", "Summarizing Context", "Summarizing Context Demo", "Summarizing Context Super Challenge", "Context Engineering Outro"]) },
    { id: "ai-vercel", title: "Vercel AI SDK", blurb: "Build a customer-support agent with the Vercel AI SDK: retrieval, structured outputs, tools and web search.",
      concepts: ["RAG refresher and embeddings", "Vector retrieval and text splitting", "AI SDK basics and structured outputs", "Tool calling", "Agentic retrieval routing and web search"],
      lessons: lessons(["Customer support AI agent intro", "Retrieval augmented generation refresher", "Embeddings recap", "Vector database embed documents", "Vector database retrieval", "Challenge: Vector database retrieval", "Vector database text splitting and retrieval", "Vercel AI SDK basics", "Challenge: Vercel AI SDK basics", "Vercel AI SDK structured outputs", "Challenge: Vercel AI SDK structured outputs", "Vercel AI SDK tool calling", "Challenge: Vercel AI tool calling", "Agentic retrieval routing", "Challenge: Agentic retrieval routing", "Web search AI agent", "Web search plus retrieval agent", "Challenge: Web search retrieval", "Complete customer support AI agent", "Outro"]) },
    { id: "ai-mcp", title: "Model Context Protocol", blurb: "Understand MCP end to end: hosts, clients, servers, tools and how a tool call flows.",
      concepts: ["Host, client and server roles", "How a connection starts", "Tool lists, requests, replies and errors", "Testing with the MCP Inspector", "Local vs remote servers"],
      lessons: lessons(["About this section", "Intro to MCP", "What MCP Is", "Host, Client and Server", "How a Connection Starts", "The Tool List", "Requests, Replies and Errors", "A Tool Call From Start to Finish", "What a Tool Is Made Of", "Recovering From a Tool Error", "Testing With the MCP Inspector", "Local and Remote Servers", "Recap and Where MCP Is Heading"]) },
    { id: "ai-multi", title: "Multimodality", blurb: "Generate and edit images from text, and let models see images with vision.",
      concepts: ["Image generation and response formats", "Prompting for images: size, quality, style", "Editing images", "Vision: sending images to a model"],
      lessons: lessons(["Introduction", "Generate original images from a text prompt", "Response formats", "Prompting for image generation", "Size, quality and style", "Editing images", "Image generation challenge", "Image generation challenge solution", "GPT-4 with Vision - Part 1", "GPT-4 with Vision - Part 2", "Image generation & Vision recap"]) },
    { id: "ai-finish", title: "Certificate", blurb: "Claim and use your certificate.", concepts: ["Showcasing your certificate"],
      lessons: lessons(["How to Utilize Your Certificate", "Certificate of Completion"]) },
  ],
};

/* Lesson bodies, matched by title. */
const BODIES = { "ai-intro": INTRO_BODIES, "ai-rag": RAG_BODIES, "ai-deploy": DEPLOY_BODIES, "ai-oss": OSS_BODIES, "ai-agents": AGENTS_BODIES, "ai-context": CONTEXT_BODIES, "ai-vercel": VERCEL_BODIES, "ai-mcp": MCP_BODIES };
for (const m of AI_COURSE.modules) {
  const b = BODIES[m.id];
  if (b) m.lessons.forEach((l) => { if (b[l.title]) l.body = b[l.title]; });
}
