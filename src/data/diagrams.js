/* Flowcharts and block diagrams. Nodes: grid col (x), row (y), optional w/h in cells.
   Shapes: rect | round | pill | diamond | db | group. Tones: accent | ok | bad | info | gold | muted.
   Edges: from, to, label, fromSide/toSide (top|bottom|left|right), via (left|right) for loops, dashed, both, labelSeg (last). */
export const DIAGRAMS = {
  "fullstack-arch": {
    kind: "block", title: "The parts of a full-stack web app", caption: "Tap a box with a dot to see which module teaches it.",
    nodes: [
      { id: "cdn", x: 0, y: 0, label: "Static hosting\nHTML · CSS · JS files", tone: "muted", note: "Serves your frontend files fast from servers near the user. GitHub Pages and Netlify are examples." },
      { id: "browser", x: 0, y: 2, label: "Browser\nyour frontend", tone: "info", shape: "round", note: "Runs HTML, CSS and JavaScript. Modules 2–8 and React (15–19) live here." },
      { id: "api", x: 2, y: 2, label: "API server\nNode + Express", tone: "accent", shape: "round", note: "Validates input, checks who the user is, runs the business logic. Modules 11 and 13." },
      { id: "db", x: 4, y: 2, label: "Database\nSQL tables", tone: "ok", shape: "db", note: "Stores users, posts and orders durably. Module 12 teaches SQL." },
      { id: "ext", x: 2, y: 0, label: "External services\npayments · email · AI", tone: "gold", note: "Your server calls other companies' APIs. The AI Engineering module calls model APIs this way." },
    ],
    edges: [
      { from: "cdn", to: "browser", label: "page files" },
      { from: "browser", to: "api", label: "HTTP + JSON", both: true },
      { from: "api", to: "db", label: "SQL query", both: true },
      { from: "api", to: "ext", label: "API calls", both: true },
    ],
  },
  "html-structure": {
    kind: "block", title: "An HTML document is a tree", caption: "Every element has one parent. Tap one to see what belongs there.",
    nodes: [
      { id: "html", x: 2, y: 0, label: "<html lang=\"en\">", tone: "accent", note: "The root. The lang attribute tells screen readers which language to pronounce." },
      { id: "head", x: 0.5, y: 1, label: "<head>", tone: "muted", note: "Information about the page. Nothing in here is drawn on screen." },
      { id: "body", x: 3.5, y: 1, label: "<body>", tone: "info", note: "Everything visible goes inside body." },
      { id: "title", x: 0, y: 2, label: "<title>", tone: "muted", note: "The text in the browser tab and in search results." },
      { id: "link", x: 1, y: 2, label: "<link>\nstylesheet", tone: "muted", note: "Connects your CSS file: <code>&lt;link rel=\"stylesheet\" href=\"styles.css\"&gt;</code>" },
      { id: "header", x: 2.5, y: 2, label: "<header>", tone: "info", note: "The site banner: logo and usually the <code>&lt;nav&gt;</code>." },
      { id: "main", x: 3.5, y: 2, label: "<main>", tone: "info", note: "The unique content of this page. Use it once per page." },
      { id: "footer", x: 4.5, y: 2, label: "<footer>", tone: "info", note: "Copyright, contact links, secondary navigation." },
      { id: "h1", x: 2.5, y: 3, label: "<h1>", tone: "ok", note: "One main heading per page." },
      { id: "section", x: 3.5, y: 3, label: "<section>", tone: "ok", note: "A themed group of content, usually with its own heading." },
    ],
    edges: [
      { from: "html", to: "head" }, { from: "html", to: "body" }, { from: "head", to: "title" }, { from: "head", to: "link" },
      { from: "body", to: "header" }, { from: "body", to: "main" }, { from: "body", to: "footer" }, { from: "header", to: "h1" }, { from: "main", to: "section" },
    ],
  },
  "cascade-flow": {
    kind: "flow", title: "Which CSS rule wins?", caption: "Run through this whenever a style “isn't working”.",
    nodes: [
      { id: "s", x: 1, y: 0, label: "Two rules set the same\nproperty on one element", shape: "pill", tone: "accent" },
      { id: "imp", x: 1, y: 1, label: "!important\non one?", shape: "diamond", tone: "gold" },
      { id: "w1", x: 2.4, y: 1, label: "That rule wins", tone: "ok", note: "Avoid relying on this. <code>!important</code> breaks the normal cascade and is hard to override later." },
      { id: "spec", x: 1, y: 2, label: "Higher\nspecificity?", shape: "diamond", tone: "gold", note: "Compare (ids, classes, elements) left to right. One id beats any number of classes." },
      { id: "w2", x: 2.4, y: 2, label: "More specific\nselector wins", tone: "ok" },
      { id: "w3", x: 1, y: 3, label: "Tie: the rule that comes\nlater in the CSS wins", tone: "ok", note: "Source order: later stylesheets and later rules override earlier ones." },
    ],
    edges: [
      { from: "s", to: "imp" }, { from: "imp", to: "w1", label: "yes", tone: "ok" }, { from: "imp", to: "spec", label: "no" },
      { from: "spec", to: "w2", label: "yes", tone: "ok" }, { from: "spec", to: "w3", label: "tie" },
    ],
  },
  "blackjack-flow": {
    kind: "flow", title: "Blackjack game logic", caption: "Each diamond is an if / else if / else in the code.",
    nodes: [
      { id: "start", x: 1, y: 0, label: "START GAME", shape: "pill", tone: "accent" },
      { id: "deal", x: 1, y: 1, label: "Deal 2 cards\nsum = first + second", note: "<code>cards = [getRandomCard(), getRandomCard()]</code>" },
      { id: "chk", x: 1, y: 2, label: "Check\nsum", shape: "diamond", tone: "gold", note: "<code>if (sum &lt; 21) … else if (sum === 21) … else …</code>" },
      { id: "bj", x: 0, y: 2, label: "Blackjack! 🎉\nhasBlackJack = true", tone: "ok" },
      { id: "out", x: 2.4, y: 2, label: "Bust: out\nisAlive = false", tone: "bad" },
      { id: "ask", x: 1, y: 3, label: "Draw\nanother?", shape: "diamond", tone: "gold" },
      { id: "stand", x: 0, y: 3, label: "Stand with\nyour sum", shape: "pill", tone: "muted" },
      { id: "draw", x: 1, y: 4, label: "NEW CARD\ncards.push(card)\nsum += card", note: "Only allowed while <code>isAlive && !hasBlackJack</code>." },
    ],
    edges: [
      { from: "start", to: "deal" }, { from: "deal", to: "chk" },
      { from: "chk", to: "ask", label: "< 21" }, { from: "chk", to: "bj", label: "=== 21", tone: "ok" }, { from: "chk", to: "out", label: "> 21", tone: "bad" },
      { from: "ask", to: "draw", label: "yes" }, { from: "ask", to: "stand", label: "no" },
      { from: "draw", to: "chk", via: "right", toSide: "top", fromSide: "right", label: "check again" },
    ],
  },
  "password-flow": {
    kind: "flow", title: "Password generator algorithm", caption: "A counting loop: the shape of almost every “repeat N times” problem.",
    nodes: [
      { id: "s", x: 1, y: 0, label: "generatePassword(length)", shape: "pill", tone: "accent" },
      { id: "init", x: 1, y: 1, label: "result = \"\"\ni = 0" },
      { id: "chk", x: 1, y: 2, label: "i < length?", shape: "diamond", tone: "gold" },
      { id: "pick", x: 1, y: 3, label: "r = random index\nresult += chars[r]", note: "<code>Math.floor(Math.random() * chars.length)</code> gives 0 to length − 1." },
      { id: "inc", x: 1, y: 4, label: "i++" },
      { id: "ret", x: 0, y: 2, label: "return result", shape: "pill", tone: "ok" },
    ],
    edges: [
      { from: "s", to: "init" }, { from: "init", to: "chk" }, { from: "chk", to: "pick", label: "yes" }, { from: "pick", to: "inc" },
      { from: "inc", to: "chk", via: "right", fromSide: "right", toSide: "top", label: "repeat" }, { from: "chk", to: "ret", label: "no", tone: "ok" },
    ],
  },
  "extension-arch": {
    kind: "block", title: "Inside a Chrome extension", caption: "The popup is just a tiny web page plus a manifest.",
    nodes: [
      { id: "man", x: 1, y: 0, label: "manifest.json\nname · version · popup", tone: "accent", note: "Chrome reads this first. <code>\"action\": { \"default_popup\": \"index.html\" }</code> says which page to open." },
      { id: "html", x: 1, y: 1, label: "index.html\nthe popup UI", tone: "info" },
      { id: "css", x: 0, y: 1, label: "index.css\nstyles", tone: "muted" },
      { id: "js", x: 1, y: 2, label: "index.js\nrender + events", tone: "info", note: "Reads the input, saves leads and renders the list." },
      { id: "store", x: 2.4, y: 2, label: "localStorage\n\"myLeads\"", shape: "db", tone: "ok", note: "Only stores strings, so use <code>JSON.stringify</code> and <code>JSON.parse</code>." },
      { id: "tabs", x: 1, y: 3, label: "chrome.tabs API\ncurrent tab URL", tone: "gold", note: "Needs <code>\"permissions\": [\"tabs\"]</code> in the manifest." },
    ],
    edges: [
      { from: "man", to: "html", label: "default_popup" }, { from: "html", to: "css", label: "<link>" }, { from: "html", to: "js", label: "<script>" },
      { from: "js", to: "store", label: "get / set", both: true }, { from: "js", to: "tabs", label: "query()", both: true },
    ],
  },
  "pipes-block": {
    kind: "block", title: "Standard streams and pipes", caption: "Every program has an input (stdin) and two outputs (stdout, stderr).",
    nodes: [
      { id: "file", x: 0, y: 1, label: "server.log", shape: "db", tone: "muted" },
      { id: "grep", x: 1, y: 1, label: "grep ERROR", tone: "accent", note: "Reads lines, writes only the matching ones to stdout." },
      { id: "sort", x: 2, y: 1, label: "sort", tone: "accent" },
      { id: "uniq", x: 3, y: 1, label: "uniq -c", tone: "accent" },
      { id: "term", x: 4, y: 1, label: "Terminal\nscreen", shape: "round", tone: "info" },
      { id: "err", x: 1, y: 2.2, label: "stderr: errors go\nstraight to screen", shape: "pill", tone: "bad", note: "Error messages skip the pipe, so you still see them. Redirect them with <code>2&gt; errors.txt</code>." },
      { id: "rep", x: 4, y: 0, label: "report.txt", shape: "db", tone: "ok", note: "<code>&gt;</code> sends stdout to a file instead of the screen. <code>&gt;&gt;</code> appends." },
    ],
    edges: [
      { from: "file", to: "grep", label: "stdin" }, { from: "grep", to: "sort", label: "|" }, { from: "sort", to: "uniq", label: "|" },
      { from: "uniq", to: "term", label: "stdout" }, { from: "grep", to: "err", dashed: true }, { from: "uniq", to: "rep", label: "> report.txt", dashed: true },
    ],
  },
  "git-pr-flow": {
    kind: "flow", title: "The team workflow: issue to merged PR", caption: "This loop is how almost every software team ships changes.",
    nodes: [
      { id: "issue", x: 0, y: 0, label: "Open or pick\nan issue", shape: "pill", tone: "accent" },
      { id: "branch", x: 0, y: 1, label: "git switch -c\nfix/login-error", note: "One branch per change keeps <code>main</code> always working." },
      { id: "commit", x: 0, y: 2, label: "Commit work\ngit add + git commit" },
      { id: "push", x: 0, y: 3, label: "git push -u\norigin fix/login-error" },
      { id: "pr", x: 1.4, y: 3, label: "Open a pull request\nwhat + why", tone: "info", note: "Describe what changed and why, link the issue (<code>Fixes #42</code>), add screenshots for UI changes." },
      { id: "rev", x: 1.4, y: 2, label: "Review\npasses?", shape: "diamond", tone: "gold", note: "Teammates comment and CI runs the tests." },
      { id: "fix", x: 2.8, y: 3, label: "Push fixes to\nthe same branch", tone: "muted" },
      { id: "merge", x: 1.4, y: 1, label: "Merge the PR", tone: "ok" },
      { id: "sync", x: 1.4, y: 0, label: "git switch main\ngit pull", shape: "pill", tone: "ok" },
    ],
    edges: [
      { from: "issue", to: "branch" }, { from: "branch", to: "commit" }, { from: "commit", to: "push" }, { from: "push", to: "pr" },
      { from: "pr", to: "rev" }, { from: "rev", to: "merge", label: "approved", tone: "ok" }, { from: "merge", to: "sync" },
      { from: "rev", to: "fix", fromSide: "right", toSide: "top", label: "changes requested", tone: "bad" }, { from: "fix", to: "pr", label: "updates PR" },
    ],
  },
  "conflict-flow": {
    kind: "flow", title: "Resolving a merge conflict", caption: "Conflicts are normal. They only happen when two branches edit the same lines.",
    nodes: [
      { id: "m", x: 1, y: 0, label: "git merge feature", shape: "pill", tone: "accent" },
      { id: "same", x: 1, y: 1, label: "Same lines\nchanged?", shape: "diamond", tone: "gold" },
      { id: "auto", x: 2.4, y: 1, label: "Git merges\nautomatically ✓", tone: "ok" },
      { id: "mark", x: 1, y: 2, label: "Git pauses and adds\nconflict markers", tone: "bad", note: "Between <code>&lt;&lt;&lt;&lt;&lt;&lt;&lt; HEAD</code> and <code>=======</code> is your branch; after it is the incoming branch." },
      { id: "edit", x: 1, y: 3, label: "Edit: keep what you want,\ndelete the markers" },
      { id: "add", x: 1, y: 4, label: "git add file", note: "Staging the file tells Git the conflict is resolved." },
      { id: "done", x: 2.4, y: 4, label: "git commit\nmerge complete ✓", shape: "pill", tone: "ok" },
    ],
    edges: [
      { from: "m", to: "same" }, { from: "same", to: "auto", label: "no", tone: "ok" }, { from: "same", to: "mark", label: "yes", tone: "bad" },
      { from: "mark", to: "edit" }, { from: "edit", to: "add" }, { from: "add", to: "done" },
    ],
  },
};
