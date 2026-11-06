# Shipyard — Fullstack Developer Path

An interactive learning platform for developers, built with React + Vite.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build in dist/
```

Requires Node.js 18+.

## What's inside

- **Course map** — all 21 modules and 139 lessons of the Fullstack Developer Path, with a route view, progress rings and per-module progress.
- **Interactive lessons** (Introduction, HTML & CSS, JavaScript Fundamentals — 18 lessons) built from these block types:
  - prose, headings, callouts, syntax-highlighted code with copy
  - **live playgrounds** (HTML/CSS/JS tabs, live preview, captured console)
  - **quizzes** with explanations and retry
  - **code challenges** with automatic tests (JS functions, and HTML/CSS checked against computed styles)
  - **widgets**: full-stack explorer, box-model explorer, flexbox playground, specificity calculator, truthy/falsy tester
  - checklists and key-takeaway recaps
- **Gamification** — XP, levels and ranks, daily goal, streaks, 7-day activity chart, badges, confetti and level-up celebrations.
- **Search** with `Ctrl/⌘ + K`, lesson navigation with `Alt + ← / →`, light and dark themes, mobile drawer.
- Progress is saved in the browser (localStorage).

## Project structure

```
src/
  data/course.js            ← all course content (edit/add lessons here)
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

Block types: `p`, `h`, `callout` (`kind: tip|warn|key|why`), `code`, `play`, `quiz`, `jsch`, `htmlch`, `widget`, `steps`, `recap`.
