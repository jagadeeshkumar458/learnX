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

- **The Fullstack Developer Path**: 21 modules, 139 lessons, 1,375 syllabus topics. Interactive so far: Introduction, HTML & CSS, JavaScript Fundamentals, Tools of the Trade, Essential JavaScript, APIs and Async JavaScript (35 lessons). Playgrounds can use a built-in practice API at https://api.shipyard.dev (`src/lib/mockApi.js`).
- **The AI Engineer Path**: 10 modules, 163 lessons (syllabus/outline).

## What's inside

- **Course map** — all 21 modules and 139 lessons of the Fullstack Developer Path, with a route view, progress rings and per-module progress.
- **Interactive lessons** (Introduction, HTML & CSS, JavaScript Fundamentals — 18 lessons) built from these block types:
  - prose, headings, callouts, syntax-highlighted code with copy
  - **live playgrounds** (HTML/CSS/JS tabs, live preview, captured console)
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
    blocks/   Basic, Quiz, Playground, Challenge, Editor
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

Block types: `p`, `h`, `callout` (`kind: tip|warn|key|why`), `code`, `play`, `quiz`, `jsch`, `htmlch`, `widget`, `steps`, `recap`, `term` (terminal mission), `git` (Git mission), `video` (simulation video by name, see `components/explainers`), `diagram` (see `data/diagrams.js`), `gif` (looping animation by name).
