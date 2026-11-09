# Shipyard — Fullstack Developer Path

An interactive learning platform for developers, built with React + Vite.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build in dist/
```

Requires Node.js 18+.

## Interview Coach

A mock technical interview built from the course: 71 questions (concepts, coding with tests, predict-the-output), asked aloud by an interviewer persona. Answer by typing or speaking; answers are graded against a rubric of key points with misconception checks and follow-up probes, then a report shows scores by topic and lessons to review. Optional: grade with Claude using your own API key (stored only in your browser). Questions live in `src/data/interview.js`, grading in `src/lib/grader.js`.

## Shipyard Radio (podcast)

Two-host episodes covering the interactive topics in depth, with a cast of 16 original hosts. Pick any two hosts per episode; each host gets a tuned browser voice, with a live transcript. Content lives in `src/data/podcast.js`.

## Courses

- **The Fullstack Developer Path**: 21 modules, 139 lessons, 1,375 syllabus topics. Interactive so far: Introduction, HTML & CSS, JavaScript Fundamentals, Tools of the Trade, Essential JavaScript, APIs and Async JavaScript, React.js Fundamentals, Node.js, Databases, Express.js, Accessible Development, Essential CSS, Responsive Design, AI Engineering, User Interface Design, Testing, Advanced React, TypeScript, Next.js, Launching Your Career, What to Learn Next (139 lessons): all 21 Fullstack modules are live. Playgrounds can use a built-in practice API at https://api.shipyard.dev (`src/lib/mockApi.js`), including an OpenAI-compatible practice LLM (`/v1/chat/completions` with streaming, JSON mode, structured outputs, tool calls and image inputs, `/v1/embeddings`, and `/v1/images/generations` and `/edits`).
- **The AI Engineer Path**: 10 modules, 163 lessons, all live: Intro to AI Engineering, Deployment, Open-source Models, Embeddings and Vector Databases, Agents (tool definitions, the agent loop, validating tool inputs, failures as results, saved conversations), Context Engineering (system prompts, the context window with a tiny-window practice model, sliding windows and summarisation), the Vercel AI SDK (a customer support agent with retrieval, structured outputs, tool calling, agentic routing and web search), the Model Context Protocol (JSON-RPC handshakes, tools/list and tools/call, errors vs isError, an in-page inspector), Multimodality (image generation, sizes and quality, edits, and vision with image message parts) and a Certificate. Labs run against the practice LLM, a practice image model and a practice Hugging Face inference API.

## What's inside

- **Course map** — all 21 modules and 139 lessons of the Fullstack Developer Path, with a route view, progress rings and per-module progress.
- **Interactive lessons** (Introduction, HTML & CSS, JavaScript Fundamentals — 18 lessons) built from these block types:
  - prose, headings, callouts, syntax-highlighted code with copy
  - **live playgrounds** (HTML/CSS/JS tabs, live preview, captured console)
  - **React lab**: multi-file React 19 projects (`App.jsx`, `components/…`, `index.css`, image imports) compiled in the browser, with React's dev warnings in the console, and React challenges whose tests click, type and submit against a fresh mount of the learner's app (with a “Show solution” button)
  - **Node lab**: multi-file Node projects running in an in-browser Node emulation (`node:http`, `fs`, `fs/promises`, `path`, `events`, `url`, `crypto`, `process`, top-level await), restarted on save like `node --watch`, with emulated npm packages (`express` 5, `express-session`, `sqlite`/`sqlite3` on the course SQL engine, `bcryptjs`, `validator`, `cors`; see `src/lib/nodePackages.js`) and a cookie jar, with an API client (methods, JSON bodies, headers, live Server-Sent Events), a browser tab that loads the app from the server (assets, `fetch` and `EventSource` routed back to it), and a terminal that shows crashes the way Node does
  - **SQL lab**: a PostgreSQL-flavoured SQL engine written for the course (`src/lib/sql.js`): CREATE/ALTER/DROP TABLE with constraints and foreign keys, INSERT/UPDATE/DELETE with RETURNING, joins, GROUP BY/HAVING, subqueries, CASE and Postgres-style error messages with hints; a schema browser, result tables, SQL challenges and a SQL-injection demo
  - **Accessibility lab**: HTML/CSS/JS editor with a live accessibility audit (contrast ratios, alt text, labels, link and button names, headings, lists, landmarks, ARIA misuse, keyboard traps; `src/lib/a11y.js`), a screen reader view that can read the page aloud, the tab order, and a WCAG contrast checker
  - **Responsive lab**: HTML/CSS editor with a device-width preview (phone to desktop, or any width), and challenges that render the page at several real viewport widths so media queries apply; plus grid, units, position, z-index and display widgets
  - **AI lab**: browser labs call the practice LLM with `fetch` (streaming, JSON output, embeddings, tool calls); the Node lab adds `openai` and `dotenv` packages pointed at it, for a key-on-the-server Gift Genie backend; temperature/top-p and embedding-space widgets; LLM-request and agent-loop explainers; a RAG pipeline diagram
  - **UI design challenges**: checks measure the design from computed styles (spacing between elements, shared edges, size ratios, WCAG contrast, button emphasis) and at several widths; a card-tuning widget and a before/after refactor explainer
  - **Testing lab**: a Vitest-style runner in the browser (`src/lib/testLab.js`) with describe/it/expect, jest-dom matchers, vi mocks, React Testing Library queries (by role and accessible name), user-event, msw request handlers, a small axe, and statement/function coverage from a TypeScript instrumenting transform. Test-writing challenges pass only if the tests pass on the working Meme Generator and fail on each planted-bug mutant
  - **React lab packages** (`src/lib/reactPackages.js`): `react-router-dom` (nested/layout/index routes, Outlet, Link/NavLink with relative paths, params, search params, Navigate) with an address bar and back/forward buttons above the preview, and `@supabase/supabase-js` (in-memory tables with filters, ordering and aggregates, realtime channels, email/password auth with JWT sessions, signup trigger and row level security)
  - **TypeScript lab** (`src/lib/tsCheck.js`): real strict type checking in the browser with the TypeScript 6 compiler and its standard library (`public/vendor/ts-lib-*.json`), plus small declarations for react, express and node. A Problems panel shows errors as you type; TypeScript challenges probe the learner's types by appending code and checking that it compiles or fails; React and Express challenges can require zero type errors
  - **Next.js lab** (`src/lib/nextLab.js`): an App Router emulation on React 19: file-based routes with layouts, dynamic and catch-all segments, metadata, loading.tsx and not-found; Server Components resolved by a small RSC-style renderer (async components, Next-style errors for hooks and event handlers, server logs in a Terminal panel); Client Components with next/navigation hooks; next/link, next/image, next/font, next/form; better-sqlite3 on the lab's SQL engine; navigation through React transitions so useTransition and Suspense behave like the real thing
  - **quizzes** with explanations and retry
  - **code challenges** with automatic tests (JS functions, and HTML/CSS checked against computed styles)
  - **simulation videos**: animated, step-by-step explainers with voice narration and sound effects (play/pause, chapters, speed, captions, mute) for the request round trip, browser rendering, events, for loops, localStorage/JSON, shell pipes and Git
  - **flowcharts and block diagrams** (tap a box for details) and **GIF-style looping animations**
  - **terminal sandbox**: a safe in-browser shell (ls, cd, mkdir, rm, grep, find, pipes, redirects…) with missions
  - **Git sandbox**: staging area, commits, branches, merges, push/pull with a live commit graph
  - **widgets**: full-stack explorer, box-model explorer, flexbox playground, specificity calculator, truthy/falsy tester
  - checklists and key-takeaway recaps
- **Gamification** — XP, levels and ranks, daily goal, streaks, 7-day activity chart, badges, confetti and level-up celebrations.
- **Search** with `Ctrl/⌘ + K`, lesson navigation with `Alt + ← / →`, light and dark themes, mobile drawer.
- Progress is saved in the browser (localStorage).

## Project structure

```
src/
  data/course.js            ← Fullstack path content (edit/add lessons here)
  data/ai-course.js         ← AI Engineer path syllabus
  lib/shell.js, lib/git.js  ← terminal and Git simulators
  lib/course.js             ← flattened lesson index helpers
  lib/progress.jsx          ← XP, streaks, badges, toasts, level-up (React context)
  lib/confetti.js
  components/
    Rail.jsx  Home.jsx  Lesson.jsx  Palette.jsx  Ring.jsx
    blocks/   Basic, Quiz, Playground, Challenge, Editor, ReactLab, NodeLab, SqlLab
    widgets/  index.jsx (stack, boxmodel, flexbox, specificity, truthy)
  styles.css                ← design tokens (light + dark) and all styles
```

## Adding content

Each lesson in `src/data/course.js` has a `body` array of blocks. A lesson without a `body`
shows as an outline ("coming soon") page. Example:

```js
{ id: "css-grid", title: "CSS Grid", min: 12, kind: "lesson", body: [
  { t: "p", h: "Grid lays out items in <b>two dimensions</b>." },
  { t: "code", lang: "css", code: ".grid { display: grid; grid-template-columns: repeat(3, 1fr); }" },
  { t: "quiz", q: "Which unit shares free space?", opts: ["px", "fr", "%"], a: 1, why: "fr = fraction of free space." },
  { t: "jsch", fn: "double", prompt: "Write double(n).", starter: "function double(n) {}",
    tests: [{ msg: "double(2) → 4", fn: (f) => f(2) === 4 }] }
]}
```

Block types: `p`, `h`, `callout` (`kind: tip|warn|key|why`), `code`, `play`, `quiz`, `jsch`, `htmlch`, `widget`, `steps`, `recap`, `term` (terminal mission), `git` (Git mission), `video` (simulation video by name, see `components/explainers`), `diagram` (see `data/diagrams.js`), `gif` (looping animation by name), `rplay` (React project: `files: {"App.jsx": …}`, optional `assets`, `api`), `rch` (React challenge: `files`, `solution`, `tests: [{ msg, fn: async (h) => boolean }]`).

React challenge tests run inside the preview iframe, so each `fn` must be self-contained. The helper `h` offers `$`, `$$`, `text()`, `button(text)`, `click()`, `type()`, `submit()`, `until()`, `tick()`, `render(Component, props)`, `mod(file)`, `src(file)`, `remount()`, `logs`, `fetches` and `noWarnings()`. The React and TypeScript (JSX compiler) bundles live in `public/vendor/` and load only on React and Node lessons.

`nplay` (Node project: `files`, optional `requests` presets, `browser: true`, `script: true` for plain scripts) and `nch` (Node challenge) run in `src/lib/nodeLab.js`. Node challenge tests run in the page, so they can use any code: each gets a fresh server and a helper `t` with `get`, `post`, `put`, `patch`, `del`, `request`, `stream(url, ms)` (collects SSE events), `header()`, `file(path)` (files the server wrote), `src(file)`, `logs`, `listening` and `wait()`.

`sqlplay` (`seed`, `sql`) runs against a fresh copy of the seed each time; `sqlch` tests get `t.expect(referenceSql, { ordered })`, `t.cols()`, `t.rows(sql)` (state after the learner's SQL), `t.has(regex)`, `t.db` and `t.last`; `sqlinj` is the SQL-injection demo.
