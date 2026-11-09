/* Module — Launching Your Career. Lesson titles match the syllabus.
   Interview challenges are jsch blocks with reference solutions; the Interview Coach (#interview) gives
   spoken-answer practice for the concept questions. */

const ph = (w, h, bg, fg, text) => "data:image/svg+xml," + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect width="100%" height="100%" fill="${bg}"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="system-ui,sans-serif" font-size="${Math.round(h / 8)}" fill="${fg}">${text}</text></svg>`);
const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);

const PLUMBER_HTML = `<header class="top">
  <img src="${ph(80, 80, "#1d4ed8", "#fff", "AP")}">
  <h1>Ace Plumbing</h1>
  <nav class="menu">
    <a href="#services">Services</a>
    <a href="#reviews">Reviews</a>
    <a href="#contact">Contact</a>
  </nav>
</header>
<section class="hero">
  <img src="${ph(1200, 500, "#93c5fd", "#1e3a8a", "Van at work")}">
  <h2>24/7 emergency plumbing in Leeds</h2>
  <a class="call" href="tel:+441130000000">Call now</a>
</section>
<section id="contact">
  <h2>Request a quote</h2>
  <form>
    <input type="text" placeholder="Your name">
    <input type="tel" placeholder="Phone">
    <button>Send</button>
  </form>
</section>`;
const PLUMBER_CSS = `body { margin: 0; font-family: Arial, sans-serif; }
.top { display: flex; align-items: center; gap: 12px; padding: 12px 20px; background: #1d4ed8; color: #fff; }
.top img { width: 40px; height: 40px; }
.menu { margin-left: auto; display: flex; gap: 14px; }
.menu a { color: #93a8e0; }
.hero { width: 1000px; padding: 20px; }
.hero img { width: 1000px; }
.call { display: inline-block; background: #facc15; color: #fff; padding: 10px 16px; text-decoration: none; font-weight: bold; }
form { display: flex; gap: 8px; }`;
const PLUMBER_CSS_DONE = `body { margin: 0; font-family: Arial, sans-serif; }
.top { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; padding: 12px 20px; background: #1d4ed8; color: #fff; }
.top img { width: 40px; height: 40px; }
.menu { margin-left: auto; display: flex; gap: 14px; }
.menu a { color: #fff; }
.hero { box-sizing: border-box; max-width: 1000px; padding: 20px; }
.hero img { max-width: 100%; height: auto; display: block; }
.call { display: inline-block; background: #facc15; color: #1f2937; padding: 10px 16px; text-decoration: none; font-weight: bold; }
form { display: flex; flex-wrap: wrap; gap: 8px; }
label { display: block; }`;
const PLUMBER_HTML_DONE = PLUMBER_HTML
  .replace(`<img src="${ph(80, 80, "#1d4ed8", "#fff", "AP")}">`, `<img src="${ph(80, 80, "#1d4ed8", "#fff", "AP")}" alt="">`)
  .replace(`<img src="${ph(1200, 500, "#93c5fd", "#1e3a8a", "Van at work")}">`, `<img src="${ph(1200, 500, "#93c5fd", "#1e3a8a", "Van at work")}" alt="An Ace Plumbing engineer fixing a boiler">`)
  .replace(`<input type="text" placeholder="Your name">`, `<label for="name">Your name</label>\n    <input id="name" type="text" autocomplete="name">`)
  .replace(`<input type="tel" placeholder="Phone">`, `<label for="phone">Phone</label>\n    <input id="phone" type="tel" autocomplete="tel">`);

export const CAREER = {
  id: "career",
  title: "Launching Your Career",
  blurb: "Learn to land the job: portfolio, online presence and interview practice.",
  concepts: ["Portfolio and résumé strategy", "GitHub and LinkedIn presence", "JavaScript and React interview challenges", "Take-home projects"],
  lessons: [
    { id: "car-welcome", title: "Welcome to the Career Module", min: 8, kind: "lesson", body: [
      { t: "p", h: "You can build things. Now you need someone to pay you for it. Landing a first developer job is a skill of its own, and like coding, it can be practised. This module covers what hiring managers look for, a search strategy that works, an online presence that gets you noticed, and a lot of interview practice." },
      { t: "steps", items: ["<b>Tips and strategies</b>: what employers want, and how to search", "<b>A real-world project</b>: fix a local business's website, then offer it to them", "<b>Online presence</b>: LinkedIn, GitHub and a portfolio", "<b>Interview challenges</b>: JavaScript coding problems, React and frontend questions"] },
      { t: "callout", kind: "tip", h: "Practise answering out loud with the <a href=\"#interview\">🎯 Interview Coach</a>: it asks questions from every module and gives feedback on your answers." },
    ]},

    { id: "car-tips", title: "General Tips and Strategies", min: 30, kind: "lesson", body: [
      { t: "h", h: "What are hiring managers looking for?" },
      { t: "p", h: "For junior roles, they're rarely hiring for what you know today. They're betting on how fast you'll grow and how pleasant you'll be to work with. Show evidence of: <b>building real things</b> (projects you can explain decision by decision), <b>learning quickly</b> (new tools picked up, feedback acted on), <b>communication</b> (clear READMEs, clear questions) and <b>enthusiasm</b> for their product." },
      { t: "h", h: "How to think about problem solving" },
      { t: "steps", items: ["<b>Understand</b>: restate the problem, ask about edge cases, write two or three examples", "<b>Plan</b>: describe the approach in plain words or pseudocode before typing", "<b>Execute</b>: code it, talking through what you're doing", "<b>Reflect</b>: test your examples, look for edge cases, and say how you'd improve it"] },
      { t: "callout", kind: "key", h: "In interviews, silence is the enemy. A wrong idea explained out loud is better than a right idea kept to yourself: the interviewer can help you, and they learn how you think." },
      { t: "h", h: "Job search strategy" },
      { t: "p", h: "Applying to hundreds of listings with the same CV has a terrible hit rate. Focus on fewer, better applications: tailor each one, find a person at the company to message, and lean on your network. Many junior hires come through referrals, meetups, open source and people who've seen your work." },
      { t: "steps", items: ["Pick 20 to 30 companies you'd genuinely like to work for", "Tailor your CV and a short message to each one, mentioning their product", "Ask for 15-minute chats with developers there (not for a job, for advice)", "Track every application, contact and follow-up in a simple spreadsheet", "Keep building and posting in public while you search"] },
      { t: "quiz", q: "You're stuck in a live coding interview. What's the best move?", opts: ["Stay silent until you've figured it out", "Say what you're thinking, what you've tried and where you're stuck, and try a simpler version", "Ask to skip the question"], a: 1, why: "Interviewers assess how you think and collaborate. Talking through it invites hints and shows your process." },
      { t: "quiz", q: "Which application is most likely to get a reply?", opts: ["The same CV sent to 200 jobs in a day", "A tailored CV, a short note about their product, and a message to a developer on the team", "A cover letter listing every technology you've touched"], a: 1, why: "Specific, personal applications stand out and often reach a human directly." },
    ]},

    { id: "car-fix", title: "Solo Project - Fix a Local Website", min: 90, kind: "solo", body: [
      { t: "p", h: "One of the best ways to get real-world experience: find a local business with a broken website, fix it, and show them. Here's a plumber's site with classic problems. Fix it, and you've got a portfolio piece with a story and maybe a first client." },
      { t: "steps", items: ["It scrolls sideways on phones", "The nav links and the Call button text are hard to read", "Images have no alt text", "The form has no labels, only placeholders"] },
      { t: "rwch", widths: [375, 1280], prompt: "Make it responsive: no horizontal scrolling at 375px (fluid hero and image, wrapping header and form), and keep the hero at most 1000px wide on large screens.", html: PLUMBER_HTML, css: PLUMBER_CSS, solution: { css: PLUMBER_CSS_DONE }, checks: [
        { msg: "No horizontal overflow at 375px", fn: (at) => !at(375).overflow() },
        { msg: "The hero image fits the screen at 375px", fn: (at) => { const a = at(375); return a.rect(".hero img").right <= 375; } },
        { msg: "The hero is at most 1000px wide at 1280px", fn: (at) => { const a = at(1280); const w = a.rect(".hero").width; return w <= 1000 && w > 600; } },
        { msg: "The image keeps its aspect ratio", fn: (at) => { const a = at(375); const r = a.rect(".hero img"); return Math.abs(r.width / r.height - 2.4) < 0.1; } },
      ] },
      { t: "a11ych", prompt: "Now make it accessible: alt text for the photo (and empty alt for the decorative logo, since the business name is right next to it), real labels for the form fields, and readable contrast for the nav links and the Call now button.", html: PLUMBER_HTML, css: PLUMBER_CSS, solution: { html: PLUMBER_HTML_DONE, css: PLUMBER_CSS_DONE }, checks: [
        { msg: "Every image has an alt attribute", fn: (d) => Array.from(d.querySelectorAll("img")).every((i) => i.hasAttribute("alt")) },
        { msg: "The hero photo has a useful description", fn: (d) => (d.querySelector(".hero img").getAttribute("alt") || "").length > 10 },
        { msg: "Both inputs have labels", fn: (d, w, a) => !a.issues.some((i) => i.rule === "label") && Array.from(d.querySelectorAll("input")).every((x) => x.labels && x.labels.length) },
        { msg: "The nav links pass contrast", fn: (d, w, a) => !a.issues.some((i) => i.rule === "contrast" && i.el && i.el.closest && i.el.closest(".menu")) },
        { msg: "The Call now button passes contrast", fn: (d, w, a) => !a.issues.some((i) => i.rule === "contrast" && i.el && i.el.classList && i.el.classList.contains("call")) },
      ] },
      { t: "callout", kind: "tip", h: "Then pitch it: a short, friendly email with a before/after screenshot and one sentence on why it matters to them (\"most of your customers search on their phones, and the current site doesn't fit\"). Even if they say no, it's a great story for interviews." },
    ]},

    { id: "car-presence", title: "Improving Your Online Presence", min: 40, kind: "lesson", body: [
      { t: "h", h: "LinkedIn" },
      { t: "steps", items: ["<b>Headline</b>: say what you do and what you offer, not \"Aspiring developer\". Try \"Frontend developer · React, TypeScript, accessibility · I build fast, inclusive web apps\"", "<b>Photo</b>: a friendly, well-lit headshot; profiles with photos get far more views", "<b>Cover image</b>: show your work or your stack", "<b>Experience</b>: past jobs count. Highlight transferable skills: customer focus, teamwork, ownership", "<b>Accomplishments</b>: projects with links and one line on the impact", "<b>Connect</b> with developers, recruiters and people at target companies, with a short personal note", "<b>Recommendations</b>: ask teammates, mentors or study partners for two or three"] },
      { t: "h", h: "GitHub" },
      { t: "p", h: "Pin your best four to six repositories. Each should have a README with a screenshot or GIF, a live link, what it does, the tech used and what you learned. Add a profile README (a repository named after your username). Regular commits show momentum, but quality beats a green grid." },
      { t: "code", lang: "markdown", code: `# PopChoice 🍿
AI movie recommendations from your own movie database.

**Live:** https://popchoice.example.dev · **Stack:** React, Node, OpenAI embeddings, Supabase pgvector

![Screenshot](./screenshot.png)

## What I learned
- Chunking and embedding text, and similarity search with pgvector
- Keeping API keys on the server` },
      { t: "h", h: "Getting a portfolio" },
      { t: "p", h: "A simple, fast, accessible site with your name, a one-line pitch, three strong projects (each with a story: the problem, your decisions, the result), and a way to contact you. Your portfolio <i>is</i> a project: a reviewer will check how it behaves on a phone and with a keyboard." },
      { t: "quiz", q: "Which LinkedIn headline is strongest?", opts: ["Aspiring developer looking for opportunities", "Frontend developer · React, TypeScript, accessibility · Building fast, inclusive web apps", "Student at an online course"], a: 1, why: "It says what you do, your strengths and the value you bring, with keywords recruiters search for." },
    ]},

    { id: "car-js", title: "JavaScript Interview Challenges", min: 150, kind: "lesson", body: [
      { t: "p", h: "Classic interview warm-ups. Solve each one out loud: understand, plan, execute, reflect. Then compare with the reference solution." },
      { t: "jsch", fn: "panic", prompt: "<b>Panic!</b> Write <code>panic(str)</code>: uppercase the text, replace each space with <code> 😱 </code> (space, emoji, space) and add <code>!</code> at the end.", starter: `function panic(str) {\n\n}`, solution: `function panic(str) {\n  return str.toUpperCase().split(" ").join(" 😱 ") + "!"\n}`, tests: [
        { msg: "panic(\"I'm almost out of coffee\")", fn: (f) => f("I'm almost out of coffee") === "I'M 😱 ALMOST 😱 OUT 😱 OF 😱 COFFEE!" },
        { msg: "panic(\"winter is coming\")", fn: (f) => f("winter is coming") === "WINTER 😱 IS 😱 COMING!" },
      ] },
      { t: "jsch", fn: "whisper", prompt: "<b>Shh…</b> Write <code>whisper(str)</code>: lowercase the text, remove a trailing <code>!</code> if there is one, and start with <code>shh... </code>.", starter: `function whisper(str) {\n\n}`, solution: `function whisper(str) {\n  const quiet = str.endsWith("!") ? str.slice(0, -1) : str\n  return "shh... " + quiet.toLowerCase()\n}`, tests: [
        { msg: "whisper(\"PLEASE STOP SHOUTING.\")", fn: (f) => f("PLEASE STOP SHOUTING.") === "shh... please stop shouting." },
        { msg: "whisper(\"MA'AM, this is a Wendy's!\")", fn: (f) => f("MA'AM, this is a Wendy's!") === "shh... ma'am, this is a wendy's" },
      ] },
      { t: "jsch", fn: "altCaps", prompt: "<b>Alternating caps.</b> Write <code>altCaps(str)</code> so the characters alternate uppercase/lowercase, starting with uppercase at index 0 (count every character, including spaces).", starter: `function altCaps(str) {\n\n}`, solution: `function altCaps(str) {\n  return str.split("").map((ch, i) => (i % 2 === 0 ? ch.toUpperCase() : ch.toLowerCase())).join("")\n}`, tests: [
        { msg: "altCaps(\"When you visit Portland you have to go to VooDoo Donuts\")", fn: (f) => f("When you visit Portland you have to go to VooDoo Donuts") === "WhEn yOu vIsIt pOrTlAnD YoU HaVe tO Go tO VoOdOo dOnUtS" },
      ] },
      { t: "jsch", fn: "toTitleCase", prompt: "<b>toTitleCase.</b> Capitalise the first letter of every word and lowercase the rest.", starter: `function toTitleCase(str) {\n\n}`, solution: `function toTitleCase(str) {\n  return str.split(" ").map((w) => (w ? w[0].toUpperCase() + w.slice(1).toLowerCase() : w)).join(" ")\n}`, tests: [
        { msg: "toTitleCase(\"i'm a little tea pot\")", fn: (f) => f("i'm a little tea pot") === "I'm A Little Tea Pot" },
        { msg: "toTitleCase(\"sHoRt AnD sToUt\")", fn: (f) => f("sHoRt AnD sToUt") === "Short And Stout" },
      ] },
      { t: "jsch", fn: "notFizzBuzz", prompt: "<b>Definitely not FizzBuzz.</b> Return an array for 1 to <code>n</code>: <code>\"Fizz\"</code> for multiples of 3, <code>\"Buzz\"</code> for 5, <code>\"FizzBuzz\"</code> for both, otherwise the number.", starter: `function notFizzBuzz(n) {\n\n}`, solution: `function notFizzBuzz(n) {\n  const out = []\n  for (let i = 1; i <= n; i++) {\n    out.push(i % 15 === 0 ? "FizzBuzz" : i % 3 === 0 ? "Fizz" : i % 5 === 0 ? "Buzz" : i)\n  }\n  return out\n}`, tests: [
        { msg: "notFizzBuzz(15)", fn: (f) => eq(f(15), [1, 2, "Fizz", 4, "Buzz", "Fizz", 7, 8, "Fizz", "Buzz", 11, "Fizz", 13, 14, "FizzBuzz"]) },
        { msg: "notFizzBuzz(1)", fn: (f) => eq(f(1), [1]) },
      ] },
      { t: "jsch", fn: "emojify", prompt: "<b>Emojify!</b> Replace words written like <code>:smile:</code> with their emoji from the provided <code>emojis</code> object. Leave unknown codes and other words alone.", starter: `const emojis = { smile: "😊", angry: "😠", party: "🎉", heart: "💜", cat: "🐱", dog: "🐕" }\n\nfunction emojify(str) {\n\n}`, solution: `const emojis = { smile: "😊", angry: "😠", party: "🎉", heart: "💜", cat: "🐱", dog: "🐕" }\n\nfunction emojify(str) {\n  return str.split(" ").map((word) => {\n    const m = word.match(/^:(\\w+):$/)\n    return m && emojis[m[1]] ? emojis[m[1]] : word\n  }).join(" ")\n}`, tests: [
        { msg: "emojify(\"I :heart: my :cat:\")", fn: (f) => f("I :heart: my :cat:") === "I 💜 my 🐱" },
        { msg: "Unknown codes stay: \":flower: :party:\"", fn: (f) => f(":flower: :party:") === ":flower: 🎉" },
        { msg: "Words without colons stay: \"smile\"", fn: (f) => f("smile please") === "smile please" },
      ] },
      { t: "jsch", fn: "decodeAlienMessage", prompt: "<b>Decode an alien message.</b> The message is reversed, and every <code>#</code> stands for a space. Return the decoded text.", starter: `function decodeAlienMessage(str) {\n\n}`, solution: `function decodeAlienMessage(str) {\n  return str.split("").reverse().join("").replaceAll("#", " ")\n}`, tests: [
        { msg: "decodeAlienMessage(\"sdrol#ruo#ot#emoclew\")", fn: (f) => f("sdrol#ruo#ot#emoclew") === "welcome to our lords" },
        { msg: "decodeAlienMessage(\"!dlrow#olleh\")", fn: (f) => f("!dlrow#olleh") === "hello world!" },
      ] },
      { t: "jsch", fn: "isPalindrome", prompt: "<b>Palindromes.</b> Return <code>true</code> if the text reads the same backwards, ignoring case, spaces and punctuation.", starter: `function isPalindrome(str) {\n\n}`, solution: `function isPalindrome(str) {\n  const clean = str.toLowerCase().replace(/[^a-z0-9]/g, "")\n  return clean === clean.split("").reverse().join("")\n}`, tests: [
        { msg: "\"A man, a plan, a canal: Panama\" → true", fn: (f) => f("A man, a plan, a canal: Panama") === true },
        { msg: "\"abba\" → true, \"abcd\" → false", fn: (f) => f("abba") === true && f("abcd") === false },
        { msg: "\"Was it a car or a cat I saw?\" → true", fn: (f) => f("Was it a car or a cat I saw?") === true },
      ] },
      { t: "jsch", fn: "letterFrequency", prompt: "<b>Letter frequency.</b> Return an object counting each letter in a name, lowercased, ignoring spaces.", starter: `function letterFrequency(name) {\n\n}`, solution: `function letterFrequency(name) {\n  const counts = {}\n  for (const ch of name.toLowerCase()) {\n    if (ch === " ") continue\n    counts[ch] = (counts[ch] || 0) + 1\n  }\n  return counts\n}`, tests: [
        { msg: "letterFrequency(\"Peggy Porth\")", fn: (f) => { const r = f("Peggy Porth"); return r.p === 2 && r.g === 2 && r.e === 1 && r.y === 1 && r.o === 1 && r.r === 1 && r.t === 1 && r.h === 1 && !(" " in r); } },
      ] },
      { t: "jsch", fn: "getRecipesWith", prompt: "<b>Chef Mario's recipe book.</b> Return the names of recipes that include <code>ingredient</code> and take at most <code>maxMinutes</code>.", starter: `const recipes = [\n  { name: "Spaghetti Carbonara", time: 25, ingredients: ["pasta", "eggs", "pecorino", "guanciale"] },\n  { name: "Margherita Pizza", time: 40, ingredients: ["dough", "tomato", "mozzarella", "basil"] },\n  { name: "Caprese Salad", time: 10, ingredients: ["tomato", "mozzarella", "basil"] },\n  { name: "Pesto Pasta", time: 15, ingredients: ["pasta", "basil", "pine nuts", "parmesan"] },\n]\n\nfunction getRecipesWith(ingredient, maxMinutes) {\n\n}`, solution: `const recipes = [\n  { name: "Spaghetti Carbonara", time: 25, ingredients: ["pasta", "eggs", "pecorino", "guanciale"] },\n  { name: "Margherita Pizza", time: 40, ingredients: ["dough", "tomato", "mozzarella", "basil"] },\n  { name: "Caprese Salad", time: 10, ingredients: ["tomato", "mozzarella", "basil"] },\n  { name: "Pesto Pasta", time: 15, ingredients: ["pasta", "basil", "pine nuts", "parmesan"] },\n]\n\nfunction getRecipesWith(ingredient, maxMinutes) {\n  return recipes.filter((r) => r.ingredients.includes(ingredient) && r.time <= maxMinutes).map((r) => r.name)\n}`, tests: [
        { msg: "basil in 20 minutes or less", fn: (f) => eq(f("basil", 20), ["Caprese Salad", "Pesto Pasta"]) },
        { msg: "pasta in 30 minutes", fn: (f) => eq(f("pasta", 30), ["Spaghetti Carbonara", "Pesto Pasta"]) },
        { msg: "nothing quick enough → []", fn: (f) => eq(f("dough", 30), []) },
      ] },
      { t: "jsch", fn: "awardPrizes", prompt: "<b>Pumpkin prizes.</b> Given contest entries <code>{ name, weight }</code>, return the top three names, heaviest first, as <code>[\"🥇 name\", \"🥈 name\", \"🥉 name\"]</code>. Don't change the original array.", starter: `function awardPrizes(entries) {\n\n}`, solution: `function awardPrizes(entries) {\n  const medals = ["🥇", "🥈", "🥉"]\n  return [...entries].sort((a, b) => b.weight - a.weight).slice(0, 3).map((e, i) => medals[i] + " " + e.name)\n}`, tests: [
        { msg: "Top three by weight", fn: (f) => eq(f([{ name: "Ada", weight: 410 }, { name: "Bo", weight: 980 }, { name: "Cy", weight: 655 }, { name: "Di", weight: 120 }]), ["🥇 Bo", "🥈 Cy", "🥉 Ada"]) },
        { msg: "Doesn't mutate the input", fn: (f) => { const a = [{ name: "X", weight: 1 }, { name: "Y", weight: 2 }]; f(a); return a[0].name === "X"; } },
      ] },
      { t: "jsch", fn: "countStudents", prompt: "<b>Count the students.</b> Each course has a <code>students</code> array of names. Return how many <b>unique</b> students there are across all courses.", starter: `function countStudents(courses) {\n\n}`, solution: `function countStudents(courses) {\n  return new Set(courses.flatMap((c) => c.students)).size\n}`, tests: [
        { msg: "Counts unique names", fn: (f) => f([{ title: "JS", students: ["ana", "ben", "cai"] }, { title: "CSS", students: ["ben", "dee"] }, { title: "React", students: ["ana"] }]) === 4 },
        { msg: "No courses → 0", fn: (f) => f([]) === 0 },
      ] },
      { t: "jsch", fn: "isPizzaNight", prompt: "<b>Pizza night?</b> It's pizza night if <b>every</b> friend is free and <b>at least one</b> of them has a car.", starter: `function isPizzaNight(friends) {\n\n}`, solution: `function isPizzaNight(friends) {\n  return friends.every((f) => f.free) && friends.some((f) => f.hasCar)\n}`, tests: [
        { msg: "All free, one car → true", fn: (f) => f([{ free: true, hasCar: false }, { free: true, hasCar: true }]) === true },
        { msg: "Someone busy → false", fn: (f) => f([{ free: false, hasCar: true }, { free: true, hasCar: true }]) === false },
        { msg: "No car → false", fn: (f) => f([{ free: true, hasCar: false }]) === false },
      ] },
      { t: "jsch", fn: "getFreePodcasts", prompt: "<b>Free podcasts.</b> Return <code>\"title (rating)\"</code> strings for the podcasts where <code>paid</code> is false, highest rating first.", starter: `function getFreePodcasts(podcasts) {\n\n}`, solution: `function getFreePodcasts(podcasts) {\n  return podcasts.filter((p) => !p.paid).sort((a, b) => b.rating - a.rating).map((p) => \`\${p.title} (\${p.rating})\`)\n}`, tests: [
        { msg: "Free ones, best first", fn: (f) => eq(f([{ title: "Code Talk", rating: 4.5, paid: false }, { title: "Pro Dev", rating: 4.9, paid: true }, { title: "CSS Weekly", rating: 4.8, paid: false }]), ["CSS Weekly (4.8)", "Code Talk (4.5)"]) },
      ] },
      { t: "jsch", fn: "cartTotal", prompt: "<b>Shopping cart.</b> Each item is <code>{ name, price, quantity }</code>. Return the total as a string with two decimals, like <code>\"23.70\"</code>, avoiding floating-point surprises (work in cents).", starter: `function cartTotal(items) {\n\n}`, solution: `function cartTotal(items) {\n  const cents = items.reduce((sum, i) => sum + Math.round(i.price * 100) * i.quantity, 0)\n  return (cents / 100).toFixed(2)\n}`, tests: [
        { msg: "Sums price × quantity", fn: (f) => f([{ name: "Candy", price: 1.1, quantity: 3 }, { name: "Cake", price: 20.4, quantity: 1 }]) === "23.70" },
        { msg: "0.1 + 0.2 style prices", fn: (f) => f([{ name: "A", price: 0.1, quantity: 1 }, { name: "B", price: 0.2, quantity: 1 }]) === "0.30" },
        { msg: "Empty cart → \"0.00\"", fn: (f) => f([]) === "0.00" },
      ] },
      { t: "jsch", fn: "giftsWithinBudget", prompt: "<b>Holiday gift shopping.</b> Buy gifts cheapest first until the next one would go over <code>budget</code>. Return the names you can afford.", starter: `function giftsWithinBudget(gifts, budget) {\n\n}`, solution: `function giftsWithinBudget(gifts, budget) {\n  const out = []\n  let spent = 0\n  for (const g of [...gifts].sort((a, b) => a.price - b.price)) {\n    if (spent + g.price > budget) break\n    spent += g.price\n    out.push(g.name)\n  }\n  return out\n}`, tests: [
        { msg: "Cheapest first within 50", fn: (f) => eq(f([{ name: "Book", price: 15 }, { name: "Scarf", price: 25 }, { name: "Mug", price: 8 }, { name: "Lamp", price: 40 }], 50), ["Mug", "Book", "Scarf"]) },
        { msg: "Nothing affordable → []", fn: (f) => eq(f([{ name: "Car", price: 9000 }], 10), []) },
      ] },
    ]},

    { id: "car-react", title: "React Interview Challenges", min: 60, kind: "lesson", body: [
      { t: "p", h: "React interviews mix concept questions with small debugging tasks. For each question below, answer out loud first, then check. The Interview Coach has longer versions of many of these." },
      { t: "quiz", q: "What is a limitation of React on its own?", opts: ["It can't render lists", "It's a UI library: routing, data fetching conventions and server rendering come from frameworks like Next.js", "It only works with class components"], a: 1, why: "React handles rendering UI from state. Frameworks add routing, data loading, bundling and server rendering." },
      { t: "quiz", q: "What does JSX compile to?", opts: ["HTML strings", "Function calls that create React element objects", "Web components"], a: 1, why: "JSX becomes jsx()/React.createElement calls that return plain objects describing the UI." },
      { t: "quiz", q: "Can a child component change its props?", opts: ["Yes, by assigning to props", "No: props are read-only; the parent passes a callback if the child needs to request a change", "Only in development"], a: 1, why: "Data flows down. To change it, lift state up and pass a setter or callback down." },
      { t: "quiz", q: "Why might <code>setCount(count + 1)</code> called twice in one handler only add 1?", opts: ["setState is slow", "Both calls read the same count from this render; use setCount(c => c + 1)", "React ignores the second call on purpose"], a: 1, why: "State is a snapshot per render. The updater form receives the latest pending value." },
      { t: "quiz", q: "When does an effect with dependencies <code>[userId]</code> run?", opts: ["Before every render", "After the first render and after any render where userId changed", "Only once"], a: 1, why: "Effects run after commit, and re-run when a dependency changes. Return a cleanup function for subscriptions." },
      { t: "quiz", q: "What's the difference between a ref and state?", opts: ["None", "Changing a ref doesn't re-render; refs hold mutable values or DOM nodes across renders", "Refs are only for class components"], a: 1, why: "State drives rendering. Refs store values you need between renders without triggering one." },
      { t: "quiz", q: "When is Context a good choice?", opts: ["For every piece of state", "For data many components at different depths need, like theme, locale or the signed-in user", "To replace props entirely"], a: 1, why: "Context avoids prop drilling for widely-used values. Overusing it couples components and can cause extra re-renders." },
      { t: "quiz", q: "Why do list items need a stable <code>key</code>?", opts: ["For CSS", "So React can match items between renders and keep the right state with the right item", "To make lists faster to type"], a: 1, why: "Keys identify items. Using the array index breaks when items are reordered, inserted or removed." },
      { t: "rch", prompt: "Interview debugging task: this timer shows 1 and stops, and keeps running after it's hidden. Fix the stale state and add cleanup so the interval stops when the component unmounts.", files: { "App.jsx": `import { useState } from "react"
import Timer from "./Timer"

export default function App() {
  const [show, setShow] = useState(true)
  return (
    <main>
      <button onClick={() => setShow((s) => !s)}>{show ? "Hide" : "Show"} timer</button>
      {show && <Timer />}
    </main>
  )
}
`, "Timer.jsx": `import { useState, useEffect } from "react"

window.ticks = 0

export default function Timer() {
  const [seconds, setSeconds] = useState(0)

  useEffect(() => {
    setInterval(() => {
      window.ticks++
      setSeconds(seconds + 1)
    }, 100)
  }, [])

  return <p className="time">{seconds}s</p>
}
` }, solution: { "Timer.jsx": `import { useState, useEffect } from "react"

window.ticks = 0

export default function Timer() {
  const [seconds, setSeconds] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      window.ticks++
      setSeconds((s) => s + 1)
    }, 100)
    return () => clearInterval(id)
  }, [])

  return <p className="time">{seconds}s</p>
}
` }, tests: [
        { msg: "The timer keeps counting", fn: async (h) => { await h.tick(450); const n = parseInt(h.text(".time")); return n >= 3; } },
        { msg: "Hiding it stops the interval", fn: async (h) => { await h.tick(150); await h.click(h.button("Hide")); const t = window.ticks; await h.tick(350); return window.ticks === t; } },
        { msg: "Uses the updater form of setState", fn: async (h) => /setSeconds\(\s*\(?\s*\w+\s*\)?\s*=>/.test(h.src("Timer.jsx")) },
      ] },
    ]},

    { id: "car-frontend", title: "Frontend Interview Challenges", min: 60, kind: "lesson", body: [
      { t: "quiz", q: "Which of these is <b>not</b> falsy in JavaScript?", opts: ["0", "\"\"", "\"false\"", "NaN"], a: 2, why: "Any non-empty string is truthy, including \"false\". The falsy values are false, 0, -0, 0n, \"\", null, undefined and NaN." },
      { t: "jsch", fn: "removeFalsy", prompt: "Write <code>removeFalsy(arr)</code> that returns a new array without the falsy values.", starter: `function removeFalsy(arr) {\n\n}`, solution: `function removeFalsy(arr) {\n  return arr.filter(Boolean)\n}`, tests: [
        { msg: "Removes 0, \"\", null, undefined, NaN and false", fn: (f) => eq(f([0, "a", "", null, 2, undefined, NaN, false, "false"]), ["a", 2, "false"]) },
      ] },
      { t: "quiz", q: "What's the difference between <code>==</code> and <code>===</code>?", opts: ["None", "== converts types before comparing; === compares type and value without conversion", "=== is only for numbers"], a: 1, why: "\"5\" == 5 is true, \"5\" === 5 is false. Prefer === to avoid surprising coercions." },
      { t: "quiz", q: "undefined vs null?", opts: ["They're identical", "undefined: a value was never assigned; null: deliberately empty, set by a developer", "null is a number"], a: 1, why: "typeof undefined is \"undefined\"; typeof null is (historically) \"object\". null == undefined is true, but === is false." },
      { t: "quiz", q: "What does <code>0.1 + 0.2 === 0.3</code> return, and why?", opts: ["true", "false: numbers are binary floating point, so 0.1 + 0.2 is 0.30000000000000004", "It throws"], a: 1, why: "Compare with a tolerance (Math.abs(a - b) < Number.EPSILON) or work in integers, like cents." },
      { t: "jsch", fn: "mergeSettings", prompt: "Spread and rest: write <code>mergeSettings(defaults, ...overrides)</code> that returns a new object with every override applied in order. Don't mutate <code>defaults</code>.", starter: `function mergeSettings(defaults, ...overrides) {\n\n}`, solution: `function mergeSettings(defaults, ...overrides) {\n  return overrides.reduce((acc, o) => ({ ...acc, ...o }), { ...defaults })\n}`, tests: [
        { msg: "Applies overrides in order", fn: (f) => eq(f({ theme: "light", size: 14 }, { size: 16 }, { theme: "dark" }), { theme: "dark", size: 16 }) },
        { msg: "Doesn't mutate defaults", fn: (f) => { const d = { a: 1 }; f(d, { a: 2 }); return d.a === 1; } },
      ] },
      { t: "jsch", fn: "describeUser", prompt: "Destructuring: write <code>describeUser({ name, address: { city }, tags: [firstTag = \"new\"] })</code>-style code that returns <code>\"Ada from London (admin)\"</code>, using <code>\"new\"</code> when there are no tags.", starter: `function describeUser(user) {\n\n}`, solution: `function describeUser({ name, address: { city }, tags: [firstTag = "new"] = [] }) {\n  return \`\${name} from \${city} (\${firstTag})\`\n}`, tests: [
        { msg: "With tags", fn: (f) => f({ name: "Ada", address: { city: "London" }, tags: ["admin", "beta"] }) === "Ada from London (admin)" },
        { msg: "Without tags", fn: (f) => f({ name: "Bo", address: { city: "Oslo" }, tags: [] }) === "Bo from Oslo (new)" },
      ] },
      { t: "quiz", q: "Pass by value or by reference? <code>function f(o) { o.x = 2 }</code> called with <code>obj = { x: 1 }</code>.", opts: ["obj.x stays 1", "obj.x becomes 2: the function receives a copy of the reference, so it mutates the same object", "It throws"], a: 1, why: "Primitives are copied. Objects are passed as a copy of the reference: mutating works, but reassigning o inside f doesn't affect obj." },
      { t: "quiz", q: "What does <code>Promise.all</code> do if one promise rejects?", opts: ["Waits for the rest, then resolves", "Rejects immediately with that error", "Ignores it"], a: 1, why: "Use Promise.allSettled when you want every result, successes and failures." },
      { t: "quiz", q: "In Scrum, what is a sprint?", opts: ["A coding competition", "A short, fixed timebox (often 1–2 weeks) in which the team delivers a planned set of work, followed by a review and retrospective", "A deadline for bug fixes only"], a: 1, why: "Agile teams work in short iterations with planning, daily stand-ups, review and retrospective." },
      { t: "h", h: "Questions to be ready for" },
      { t: "steps", items: ["Tell me about yourself (90 seconds: past, present, why this role)", "Walk me through a project you're proud of (problem, decisions, result, what you'd change)", "Tell me about a time you were stuck (how you got unstuck)", "How do you handle feedback?", "Why this company? (mention their product specifically)"] },
      { t: "callout", kind: "tip", h: "Always have questions for them: \"What does a great first three months look like?\", \"How do juniors get feedback here?\", \"What's the team working on next?\". It shows you're serious, and helps you judge them too." },
    ]},
  ],
};
