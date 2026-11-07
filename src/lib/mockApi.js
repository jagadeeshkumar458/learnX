/* Shipyard's built-in practice API, served at https://api.shipyard.dev.
   It intercepts fetch() for that host only, adds realistic network delay, and returns real
   Response objects with status codes and JSON, so lessons never depend on third-party uptime.

   IMPORTANT: shipyardApi() must stay self-contained (no references to anything outside it):
   its source is injected into playground iframes with Function.prototype.toString(). */

export function shipyardApi(target, install) {
  const HOST = "api.shipyard.dev";
  const realFetch = target && target.fetch ? target.fetch.bind(target) : null;
  const rand = (n) => Math.floor(Math.random() * n);
  const pick = (arr) => arr[rand(arr.length)];
  const svg = (body, w, h) => "data:image/svg+xml;charset=utf-8," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="' + w + '" height="' + h + '" viewBox="0 0 ' + w + " " + h + '">' + body + "</svg>");
  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");

  /* ── data ── */
  const MEMES = [
    ["Developer at 2am", "#1e293b", "#334155", "🧑‍💻"], ["It Works On My Machine", "#7c3aed", "#c4b5fd", "🤷"], ["This Is Fine", "#ea580c", "#fdba74", "🔥"],
    ["Brain Expanding", "#0ea5e9", "#bae6fd", "🧠"], ["Surprised Cat", "#f59e0b", "#fde68a", "🙀"], ["Stonks", "#16a34a", "#bbf7d0", "📈"],
    ["Coffee Before Code", "#78350f", "#fcd34d", "☕"], ["Bug Hunter", "#be123c", "#fecdd3", "🐞"], ["Deploy On Friday", "#4338ca", "#a5b4fc", "🚀"],
    ["Rubber Duck Debugging", "#ca8a04", "#fef08a", "🦆"], ["Merge Conflict Panic", "#dc2626", "#fecaca", "😱"], ["Cool Penguin", "#0f766e", "#99f6e4", "🐧"],
  ];
  const memeSvg = (m) => svg('<defs><linearGradient id="m" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + m[1] + '"/><stop offset="1" stop-color="' + m[2] + '"/></linearGradient></defs><rect width="600" height="450" fill="url(#m)"/><text x="300" y="290" text-anchor="middle" font-size="200">' + m[3] + "</text>", 600, 450);
  const TRIVIA = [
    ["Computers", "easy", "What does &quot;HTML&quot; stand for?", ["Hyperlinks and Text Markup Language", "Home Tool Markup Language", "Hyper Transfer Machine Language"], "HyperText Markup Language"],
    ["Computers", "easy", "Which company created React?", ["Google", "Microsoft", "Apple"], "Meta"],
    ["Computers", "easy", "In JavaScript, what does typeof null return?", ["&quot;null&quot;", "&quot;undefined&quot;", "&quot;number&quot;"], "&quot;object&quot;"],
    ["Computers", "easy", "CSS stands for Cascading Style Sheets.", ["False"], "True"],
    ["Computers", "medium", "Which HTTP status code means &quot;Not Found&quot;?", ["400", "500", "302"], "404"],
    ["Computers", "medium", "Which React hook lets a component remember a value between renders?", ["useEffect", "useMemo", "useContext"], "useState"],
    ["Computers", "medium", "Git was created by Linus Torvalds.", ["False"], "True"],
    ["Computers", "medium", "What is the name of the JavaScript engine in Google Chrome?", ["SpiderMonkey", "Chakra", "JavaScriptCore"], "V8"],
    ["Computers", "medium", "Which array method returns a new array without changing the original?", ["push", "splice", "sort"], "map"],
    ["Computers", "easy", "Which symbol starts a comment in Python?", ["//", "&lt;!--", "--"], "#"],
    ["Computers", "hard", "In which year was JavaScript first released?", ["1993", "1999", "2001"], "1995"],
    ["Computers", "hard", "What does the &quot;S&quot; in HTTPS stand for?", ["Simple", "Server", "Standard"], "Secure"],
    ["Computers", "medium", "JSON keys must be wrapped in double quotes.", ["False"], "True"],
    ["Computers", "hard", "Which data structure works on a &quot;last in, first out&quot; basis?", ["Queue", "Heap", "Tree"], "Stack"],
    ["Computers", "easy", "What does &quot;API&quot; stand for?", ["Applied Program Integration", "Automated Protocol Interface", "App Programming Index"], "Application Programming Interface"],
    ["Science", "easy", "What planet is known as the Red Planet?", ["Venus", "Jupiter", "Mercury"], "Mars"],
    ["Science", "medium", "What is the chemical symbol for gold?", ["Ag", "Go", "Gd"], "Au"],
    ["Geography", "easy", "What is the capital city of Australia?", ["Sydney", "Melbourne", "Perth"], "Canberra"],
    ["Geography", "medium", "Which river flows through Cairo?", ["Amazon", "Danube", "Ganges"], "Nile"],
    ["General", "easy", "How many sides does a hexagon have?", ["5", "7", "8"], "6"],
  ];
  const ACTIVITIES = [
    ["Learn a new programming language", "education", 1, 0.1], ["Build a small app that solves one of your own problems", "diy", 1, 0], ["Go for a walk and listen to a podcast", "relaxation", 1, 0],
    ["Cook a dish from a cuisine you've never tried", "cooking", 2, 0.3], ["Contribute to an open-source project", "education", 1, 0], ["Organise a board game night", "social", 4, 0.2],
    ["Write a blog post about something you learned this week", "education", 1, 0], ["Start a vegetable garden on your balcony", "diy", 1, 0.3], ["Learn to solve a Rubik's cube", "recreational", 1, 0.1],
    ["Call a friend you haven't spoken to in a while", "social", 2, 0], ["Do a 20-minute stretching routine", "relaxation", 1, 0], ["Volunteer at a local animal shelter", "charity", 1, 0],
  ];
  const DOGS = [["🐕", "#f6c177", "labrador"], ["🐩", "#c4a7e7", "poodle"], ["🦮", "#9ccfd8", "retriever"], ["🐶", "#ebbcba", "beagle"], ["🐕‍🦺", "#a3be8c", "german-shepherd"], ["🐾", "#f2cdcd", "husky"]];
  const posts = [
    ["Why I write my CSS mobile-first", "Starting from the smallest screen forces me to decide what really matters, and media queries only ever add complexity."],
    ["The day event delegation clicked", "One listener on the document, a data attribute on every button, and suddenly my re-rendered list just worked."],
    ["Five Git habits that saved my job", "Small commits, clear messages, branches for everything, pull before push, and never committing a .env file."],
    ["fetch() returns a promise, not data", "It took me a week to understand why my variable was always undefined. The answer was .then()."],
    ["Accessibility is not a feature", "Labels, contrast and keyboard focus are part of building it right, not extras for later."],
    ["What I learned shipping my first API", "Validate everything, return the right status codes, and write the docs before the code."],
    ["Flexbox or Grid?", "Flexbox for one direction, Grid for two. Most layouts use both, and that's fine."],
    ["My Chrome extension has 200 users", "It started as a weekend project to save job links. Now strangers send me feature requests."],
    ["Debugging is a skill you can practise", "Read the error, reproduce it, shrink the problem, then fix one thing at a time."],
    ["Async/await made my code readable", "Same promises underneath, but the code reads top to bottom like a recipe."],
  ].map(([title, body], i) => ({ userId: (i % 3) + 1, id: i + 1, title, body }));
  let nextPostId = 101;
  const CITIES = [
    ["Pune", 18.52, 73.86, 29, "Clear", "clear sky", "01d", "☀️", 48], ["Mumbai", 19.08, 72.88, 31, "Clouds", "scattered clouds", "03d", "⛅", 70],
    ["Bengaluru", 12.97, 77.59, 26, "Clouds", "broken clouds", "04d", "☁️", 62], ["Hyderabad", 17.39, 78.49, 30, "Clear", "clear sky", "01d", "☀️", 45],
    ["Delhi", 28.61, 77.21, 33, "Haze", "haze", "50d", "🌫️", 38], ["Chennai", 13.08, 80.27, 32, "Rain", "light rain", "10d", "🌦️", 75],
    ["London", 51.51, -0.13, 12, "Rain", "moderate rain", "10d", "🌧️", 82], ["New York", 40.71, -74.01, 15, "Clouds", "overcast clouds", "04d", "☁️", 60],
    ["Tokyo", 35.68, 139.69, 18, "Clear", "clear sky", "01d", "☀️", 55], ["Sydney", -33.87, 151.21, 21, "Clouds", "few clouds", "02d", "🌤️", 58],
  ];
  const MOVIES = [
    ["tt0083658", "Blade Runner", 1982, "117 min", "Sci-Fi, Thriller", "Ridley Scott", "In a rain-soaked future city, a weary detective hunts artificial humans and starts to question what makes anyone human.", "8.1", ["#1a1a40", "#ff6b9a"]],
    ["tt1375666", "Inception", 2010, "148 min", "Action, Sci-Fi", "Christopher Nolan", "A thief who steals secrets from dreams is offered a chance at freedom if he can plant an idea instead.", "8.8", ["#0f2a3d", "#7fd6ff"]],
    ["tt0816692", "Interstellar", 2014, "169 min", "Adventure, Drama, Sci-Fi", "Christopher Nolan", "With Earth failing, a former pilot leads a mission through a wormhole to find humanity a new home.", "8.7", ["#000814", "#ffd166"]],
    ["tt0133093", "The Matrix", 1999, "136 min", "Action, Sci-Fi", "The Wachowskis", "A programmer discovers that reality is a simulation and joins a rebellion against the machines running it.", "8.7", ["#001a0a", "#5eead4"]],
    ["tt2543164", "Arrival", 2016, "116 min", "Drama, Sci-Fi", "Denis Villeneuve", "A linguist races to understand the language of visitors from space before fear turns into war.", "7.9", ["#2b2d42", "#edf2f4"]],
    ["tt1160419", "Dune", 2021, "155 min", "Adventure, Drama, Sci-Fi", "Denis Villeneuve", "The heir to a noble house is drawn into a deadly struggle for control of a desert planet.", "8.0", ["#3d2b1f", "#f2b632"]],
    ["tt0470752", "Ex Machina", 2014, "108 min", "Drama, Sci-Fi, Thriller", "Alex Garland", "A young coder is invited to test whether a remarkable robot is truly conscious, and learns he is being tested too.", "7.7", ["#1b1b1b", "#ff7a45"]],
    ["tt1454468", "Gravity", 2013, "91 min", "Drama, Sci-Fi, Thriller", "Alfonso Cuarón", "After debris destroys their shuttle, two astronauts drift alone and must find a way back to Earth.", "7.7", ["#000000", "#8b9cff"]],
    ["tt0078748", "Alien", 1979, "117 min", "Horror, Sci-Fi", "Ridley Scott", "The crew of a space freighter answers a distress call and brings back something deadly.", "8.5", ["#0a0a0a", "#9ef01a"]],
    ["tt1798709", "Her", 2013, "126 min", "Drama, Romance, Sci-Fi", "Spike Jonze", "A lonely writer forms an unexpected bond with an operating system designed to meet his every need.", "8.0", ["#e63946", "#ffe5d9"]],
    ["tt0062622", "2001: A Space Odyssey", 1968, "149 min", "Adventure, Sci-Fi", "Stanley Kubrick", "A mysterious black monolith guides human evolution, from the dawn of man to a mission to Jupiter.", "8.3", ["#111111", "#e8ecf7"]],
    ["tt0119116", "The Fifth Element", 1997, "126 min", "Action, Adventure, Comedy", "Luc Besson", "A cab driver in 23rd-century New York becomes the reluctant protector of the key to saving the world.", "7.6", ["#ff9f1c", "#2ec4b6"]],
  ];
  const poster = (m) => svg('<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + m[8][0] + '"/><stop offset="1" stop-color="' + m[8][1] + '"/></linearGradient></defs><rect width="300" height="444" fill="url(#g)"/><text x="150" y="380" text-anchor="middle" font-family="Georgia,serif" font-size="26" fill="#fff" font-weight="700">' + esc(m[1]) + '</text><text x="150" y="410" text-anchor="middle" font-family="system-ui" font-size="16" fill="#fff" opacity=".8">' + m[2] + "</text>", 300, 444);
  const PHOTOS = [
    ["Golden hour over the Western Ghats", "Aarav Mehta", "Lonavala, India", ["#ff9a3c", "#ff6f61", "#2e1f47"]], ["Blue hour on a quiet lake", "Mei Tanaka", "Hokkaido, Japan", ["#1f4e79", "#6aa7d8", "#0b1e33"]],
    ["Fog rolling through a pine forest", "Lena Fischer", "Black Forest, Germany", ["#9aa5a0", "#5b6f68", "#1f2b26"]], ["Desert dunes at sunrise", "Omar Haddad", "Wadi Rum, Jordan", ["#f4a259", "#d1603d", "#3b1f0f"]],
    ["Northern lights over the fjord", "Ingrid Solberg", "Tromsø, Norway", ["#0b3d2e", "#38b000", "#03071e"]],
  ];
  const photoSvg = (p) => svg('<defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + p[3][0] + '"/><stop offset=".6" stop-color="' + p[3][1] + '"/><stop offset="1" stop-color="' + p[3][2] + '"/></linearGradient></defs><rect width="1600" height="900" fill="url(#s)"/><circle cx="1180" cy="300" r="90" fill="#fff" opacity=".35"/><path d="M0 700 L300 480 L520 640 L800 380 L1100 620 L1350 470 L1600 650 L1600 900 L0 900 Z" fill="' + p[3][2] + '" opacity=".85"/><path d="M0 800 L400 650 L700 760 L1000 640 L1600 800 L1600 900 L0 900 Z" fill="#000" opacity=".35"/>', 1600, 900);
  const COINS = {
    dogecoin: ["Dogecoin", "doge", 0.162, "#c2a633", "Ð"], bitcoin: ["Bitcoin", "btc", 68250, "#f7931a", "₿"], ethereum: ["Ethereum", "eth", 3420, "#627eea", "Ξ"], solana: ["Solana", "sol", 152.4, "#14f195", "◎"],
  };
  const coinIcon = (c) => svg('<circle cx="32" cy="32" r="30" fill="' + c[3] + '"/><text x="32" y="43" text-anchor="middle" font-family="system-ui" font-size="30" font-weight="800" fill="#fff">' + c[4] + "</text>", 64, 64);
  const decks = {};
  const VALUES = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "JACK", "QUEEN", "KING", "ACE"];
  const SUITS = [["SPADES", "♠", "#111"], ["HEARTS", "♥", "#d62828"], ["DIAMONDS", "♦", "#d62828"], ["CLUBS", "♣", "#111"]];
  const cardImg = (v, s) => {
    const short = v.length > 2 ? v[0] : v;
    return svg('<rect x="1" y="1" width="224" height="312" rx="16" fill="#fff" stroke="#bbb" stroke-width="2"/><text x="18" y="46" font-family="Georgia,serif" font-size="36" font-weight="700" fill="' + s[2] + '">' + short + '</text><text x="18" y="80" font-family="Georgia,serif" font-size="30" fill="' + s[2] + '">' + s[1] + '</text><text x="113" y="190" text-anchor="middle" font-family="Georgia,serif" font-size="110" fill="' + s[2] + '">' + s[1] + "</text>", 226, 314);
  };
  const deckId = () => Math.random().toString(36).slice(2, 14);

  /* ── colour maths for /scheme ── */
  const hexToHsl = (hex) => {
    const n = parseInt(hex, 16), r = ((n >> 16) & 255) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2;
    let h = 0, s = 0;
    if (max !== min) {
      const d = max - min; s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4; h *= 60;
    }
    return [h, s * 100, l * 100];
  };
  const hslToHex = (h, s, l) => {
    h = ((h % 360) + 360) % 360; s /= 100; l /= 100;
    const k = (n) => (n + h / 30) % 12, a = s * Math.min(l, 1 - l);
    const f = (n) => Math.round(255 * (l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1))));
    return "#" + [f(0), f(8), f(4)].map((x) => x.toString(16).padStart(2, "0")).join("").toUpperCase();
  };
  const scheme = (hex, mode, count) => {
    const [h, s, l] = hexToHsl(hex), out = [];
    for (let i = 0; i < count; i++) {
      const t = count === 1 ? 0 : i / (count - 1);
      if (mode === "monochrome") out.push(hslToHex(h, s, 18 + t * 64));
      else if (mode === "monochrome-dark") out.push(hslToHex(h, s, 8 + t * 40));
      else if (mode === "monochrome-light") out.push(hslToHex(h, s, 50 + t * 42));
      else if (mode === "analogic") out.push(hslToHex(h + (i - (count - 1) / 2) * 30, s, l));
      else if (mode === "complement") out.push(hslToHex(i % 2 ? h + 180 : h, s, 25 + t * 50));
      else if (mode === "analogic-complement") out.push(hslToHex(i === count - 1 ? h + 180 : h + (i - (count - 2) / 2) * 30, s, l));
      else if (mode === "triad") out.push(hslToHex(h + (i % 3) * 120, s, 30 + t * 40));
      else if (mode === "quad") out.push(hslToHex(h + (i % 4) * 90, s, 30 + t * 40));
      else return null;
    }
    return out;
  };


  /* ── VanLife (Advanced React routing project) ── */
  const VAN_COL = { simple: ["#e17654", "#fff7ed"], rugged: ["#115e59", "#ecfdf5"], luxury: ["#161616", "#f5f5f5"] };
  const vanSvg = (name, type) => { const c = VAN_COL[type]; return svg(`<svg xmlns="http://www.w3.org/2000/svg" width="500" height="500"><rect width="500" height="500" fill="${c[1]}"/><rect x="70" y="170" width="340" height="170" rx="40" fill="${c[0]}"/><rect x="290" y="195" width="90" height="60" rx="12" fill="#cfe8ff"/><rect x="110" y="195" width="140" height="60" rx="12" fill="#cfe8ff"/><circle cx="150" cy="345" r="38" fill="#222"/><circle cx="340" cy="345" r="38" fill="#222"/><circle cx="150" cy="345" r="15" fill="#aaa"/><circle cx="340" cy="345" r="15" fill="#aaa"/><text x="250" y="440" text-anchor="middle" font-family="system-ui" font-weight="700" font-size="30" fill="#333">${esc(name)}</text></svg>`); };
  const VANS = [
    ["1", "Modest Explorer", 60, "The Modest Explorer is a van designed to get you out of the house and into nature. This beauty is equipped with solar panels, a composting toilet, a water tank and kitchenette.", "simple", "123"],
    ["2", "Beach Bum", 80, "Beach Bum is a van inspired by surfers and travelers. It was created to be a portable home away from home, but with some cool features in it you won't find in an ordinary camper.", "rugged", "123"],
    ["3", "Reliable Red", 100, "Reliable Red is a van that was made for travelling. The inside is comfortable and cozy, with plenty of space to stretch out in. There's a small kitchen, so you can cook if you need to.", "luxury", "456"],
    ["4", "Dreamfinder", 65, "Dreamfinder is the perfect van to travel in and experience. With a ceiling height of 2.1m, you can stand up in this van and there is great head room. The floor is a beautiful glass-reinforced plastic.", "simple", "789"],
    ["5", "The Cruiser", 120, "The Cruiser is a van for those who love to travel in comfort and luxury. With its many windows, spacious interior and ample storage space, the Cruiser offers a beautiful view wherever you go.", "luxury", "789"],
    ["6", "Green Wonder", 70, "With this van, you can take your travel life to the next level. The Green Wonder is a sustainable vehicle that's perfect for people who are looking for a stylish, eco-friendly mode of transport.", "rugged", "123"],
  ].map(([id, name, price, description, type, hostId]) => ({ id, name, price, description, imageUrl: vanSvg(name, type), type, hostId }));

  /* ── router ── */
  const json = (status, data) => ({ status, data });

  /* ── practice LLM: an OpenAI-compatible chat API with a tiny rule-based "model" ──
     POST /v1/chat/completions { model, messages, max_tokens, temperature, stream, response_format, tools }
     POST /v1/embeddings { input } → deterministic, concept-aware vectors */
  const words = (t) => String(t || "").toLowerCase().match(/[a-z0-9']+/g) || [];
  const estTokens = (t) => Math.max(1, Math.ceil(String(t || "").length / 4));
  const SYN = { car: "vehicle", cars: "vehicle", automobile: "vehicle", automobiles: "vehicle", film: "film", films: "film", movie: "film", movies: "film", truck: "vehicle", funny: "comedy", hilarious: "comedy", laugh: "comedy", comedic: "comedy", scary: "horror", frightening: "horror", terrifying: "horror", ghost: "horror", space: "space", galaxy: "space", astronaut: "space", planet: "space", alien: "space", stars: "space", love: "romance", romantic: "romance", wedding: "romance", heart: "romance", fight: "action", explosion: "action", heist: "action", chase: "action", kid: "family", kids: "family", children: "family", animated: "family", dog: "animal", dogs: "animal", cat: "animal", pets: "animal", wizard: "fantasy", dragon: "fantasy", magic: "fantasy", murder: "crime", detective: "crime", mystery: "crime", war: "war", soldier: "war", battle: "war", ocean: "sea", sea: "sea", ship: "sea", music: "music", band: "music", singer: "music", robot: "robot", ai: "robot", computer: "robot", food: "food", chef: "food", cooking: "food", cook: "food" };
  const STOP = new Set("a an the and or of to in on for with is are was were be it this that i me my you your we our they at by from as about what which who whom how why when where can could would should do does did has have had not no yes".split(" "));
  function embed(text) {
    const v = new Array(64).fill(0);
    const add = (w, weight) => { let h = 2166136261; for (let i = 0; i < w.length; i++) { h ^= w.charCodeAt(i); h = Math.imul(h, 16777619); } v[Math.abs(h) % 64] += weight * ((h >>> 7) % 2 ? 1 : -1); };
    words(text).forEach((w) => { if (STOP.has(w)) return; const stem = w.replace(/(ing|ed|es|s)$/, ""); add(SYN[w] || SYN[stem] || stem, SYN[w] || SYN[stem] ? 2.2 : 1); });
    const n = Math.hypot.apply(null, v) || 1;
    return v.map((x) => Math.round((x / n) * 1e6) / 1e6);
  }
  const GIFTS = {
    cook: [["A cast-iron skillet", "it lasts a lifetime and gets better with every meal", "$40–60"], ["A cookbook from a favourite chef", "fresh ideas for the weekend", "$25–35"], ["A spice discovery set", "small jars of spices from around the world", "$30"]],
    garden: [["An ergonomic tool set", "kinder on the wrists than standard tools", "$45"], ["Heirloom seed collection", "unusual vegetables they won't find in shops", "$20"], ["A kneeling pad and seat", "makes long sessions comfortable", "$35"]],
    code: [["A mechanical keyboard", "satisfying to type on all day", "$80–150"], ["A rubber duck and a good notebook", "for debugging out loud and sketching ideas", "$15"], ["A course or conference ticket", "learning they'd pick themselves", "$50–300"]],
    run: [["Running socks that don't blister", "small, but every runner appreciates them", "$20"], ["A handheld water bottle", "for long runs on warm days", "$25"], ["A race entry", "a goal to train for", "$40–80"]],
    read: [["A reading light", "for late-night chapters", "$25"], ["A bookshop gift card", "lets them choose", "$30"], ["A subscription to a book box", "a surprise every month", "$20/month"]],
    default: [["A personalised photo book", "memories they can hold", "$30–50"], ["An experience day", "something to do together", "$50–150"], ["A handwritten letter with a small treat", "thoughtful and personal", "$10"]],
  };
  const PHRASES = {
    french: { "good morning": "Bonjour", "how are you": "Comment allez-vous ?", "thank you": "Merci", "where is the station": "Où est la gare ?", "i love coffee": "J'adore le café", "see you tomorrow": "À demain" },
    spanish: { "good morning": "Buenos días", "how are you": "¿Cómo estás?", "thank you": "Gracias", "where is the station": "¿Dónde está la estación?", "i love coffee": "Me encanta el café", "see you tomorrow": "Hasta mañana" },
    japanese: { "good morning": "おはようございます", "how are you": "お元気ですか？", "thank you": "ありがとうございます", "where is the station": "駅はどこですか？", "i love coffee": "コーヒーが大好きです", "see you tomorrow": "また明日" },
    hindi: { "good morning": "सुप्रभात", "how are you": "आप कैसे हैं?", "thank you": "धन्यवाद", "where is the station": "स्टेशन कहाँ है?", "i love coffee": "मुझे कॉफ़ी बहुत पसंद है", "see you tomorrow": "कल मिलते हैं" },
  };
  function giftTopic(t) {
    const w = String(t).toLowerCase();
    if (/cook|chef|bak|kitchen|food/.test(w)) return "cook";
    if (/garden|plant|flower/.test(w)) return "garden";
    if (/cod|program|develop|tech|computer/.test(w)) return "code";
    if (/run|marathon|jog|fitness/.test(w)) return "run";
    if (/read|book|novel/.test(w)) return "read";
    return "default";
  }
  function think(body) {
    const msgs = Array.isArray(body.messages) ? body.messages : [];
    const sys = msgs.filter((m) => m.role === "system" || m.role === "developer").map((m) => m.content).join("\n");
    const users = msgs.filter((m) => m.role === "user");
    const last = users.length ? String(users[users.length - 1].content) : "";
    const toolMsgs = msgs.filter((m) => m.role === "tool");
    const temp = body.temperature == null ? 1 : Number(body.temperature);
    const choose = (arr) => (temp <= 0.2 ? arr[0] : arr[rand(arr.length)]);
    const tools = Array.isArray(body.tools) ? body.tools.map((t) => (t.function ? t.function.name : t.name)) : [];
    // tool calling (agents)
    if (tools.length && /weather|activit|outside|today|where|location|nearby/i.test(last)) {
      const has = (n) => toolMsgs.some((m) => m.name === n || (msgs.find((x) => x.tool_calls && x.tool_calls.some((c) => c.id === m.tool_call_id && c.function.name === n))));
      const loc = tools.find((n) => /location/i.test(n)), wx = tools.find((n) => /weather/i.test(n));
      if (loc && !has(loc) && !/in [A-Z][a-z]+/.test(last)) return { tool: { name: loc, args: {} } };
      if (wx && !has(wx)) {
        const locResult = toolMsgs.map((m) => String(m.content)).join(" ");
        const city = (locResult.match(/"?city"?\s*[:=]\s*"?([A-Za-z ]+)/) || last.match(/in ([A-Z][a-z]+)/) || [])[1] || "your area";
        return { tool: { name: wx, args: { location: city.trim() } } };
      }
      const obs = toolMsgs.map((m) => String(m.content)).join(" ");
      const t = (obs.match(/"?temperature"?\s*[:=]\s*"?(-?\d+)/) || [])[1];
      const cond = (obs.match(/"?(?:forecast|condition|description)"?\s*[:=]\s*"([^"]+)/) || [])[1] || "mild";
      const warm = t != null && Number(t) >= 18;
      return { text: "It's " + (t != null ? t + "°C and " : "") + cond + " where you are, so here are some ideas:\n\n" + (warm ? "1. Take a picnic to the nearest park.\n2. Go for an evening bike ride.\n3. Find an outdoor café and people-watch." : "1. Visit a museum or gallery.\n2. Try a new café and a good book.\n3. Cook something warming with friends.") };
    }
    // ReAct prompting
    if (/PAUSE/.test(sys) && /Action/i.test(sys)) {
      const transcript = msgs.filter((m) => m.role !== "system" && m.role !== "developer").map((m) => String(m.content)).join("\n");
      const obs = transcript.match(/Observation:.*$/gm) || [];
      const acts = (sys.match(/^(\w+):\s*$/gm) || []).map((x) => x.replace(/:\s*$/, ""));
      const names = (sys.match(/(\w+)\s*:\s*\n?\s*e\.g\./g) || []).map((x) => x.split(":")[0].trim());
      const known = names.length ? names : acts;
      const locFn = known.find((n) => /location/i.test(n)) || "getLocation";
      const wxFn = known.find((n) => /weather/i.test(n)) || "getCurrentWeather";
      if (obs.length === 0) return { text: "Thought: To suggest activities I need to know where the user is.\nAction: " + locFn + ": null\nPAUSE" };
      if (obs.length === 1) { const city = (obs[0].match(/city"?\s*[:=]\s*"?([A-Za-z ]+)/i) || [])[1] || "the user's city"; return { text: "Thought: Now I know the location is " + city.trim() + ". Next I need the weather there.\nAction: " + wxFn + ": " + city.trim() + "\nPAUSE" }; }
      const t = (obs.join(" ").match(/temperature"?\s*[:=]\s*"?(-?\d+)/i) || [])[1];
      return { text: "Answer: " + (t && Number(t) >= 18 ? "It's warm out, so try a picnic in the park, a bike ride along the river, or an outdoor concert." : "It's cool out, so try a museum, a cosy café with a good book, or an indoor climbing wall.") };
    }
    // RAG: answer from provided context
    const ctx = (sys + "\n" + last).match(/Context:[ \t]*([\s\S]*?)(?:\n\s*(?:Question|Q):|$)/i);
    if (ctx && ctx[1].trim()) {
      const first = ctx[1].trim().split(/(?<=[.!?])\s+/).slice(0, 2).join(" ");
      return { text: "Based on what I found: " + first + (/movie|film/i.test(last) ? " It should suit what you're looking for." : "") };
    }
    if (/(only|from|using|use)\b[^.]{0,20}\bcontext/i.test(sys) && !(ctx && ctx[1].trim())) return { text: "Sorry, I don't know the answer to that." };
    // translation
    const lang = (last.match(/\b(french|spanish|japanese|hindi)\b/i) || sys.match(/\b(french|spanish|japanese|hindi)\b/i) || [])[1];
    if (lang && /translat/i.test(sys + last)) {
      const text = (last.match(/["“]([^"”]+)["”]/) || last.match(/:\s*(.+)$/) || [null, last])[1].trim();
      const key = text.toLowerCase().replace(/[^a-z' ]/g, "").trim();
      const table = PHRASES[lang.toLowerCase()];
      return { text: table[key] || "(" + lang[0].toUpperCase() + lang.slice(1).toLowerCase() + ") " + text };
    }
    // gift ideas
    if (/gift|present|birthday|christmas/i.test(sys + last)) {
      const ideas = GIFTS[giftTopic(last)];
      const order = temp <= 0.2 ? ideas : ideas.slice().sort(() => Math.random() - 0.5);
      return { gifts: order, text: "## Gift ideas\n\n" + order.map((g, i) => (i + 1) + ". **" + g[0] + "** (" + g[2] + "): " + g[1] + ".").join("\n") + "\n\n" + choose(["Happy gifting! 🎁", "Hope one of these is perfect.", "Wrap it with a handwritten note for extra points."]) };
    }
    if (/^\s*(hi|hello|hey)\b/i.test(last)) return { text: choose(["Hello! How can I help today?", "Hi there! What would you like to work on?", "Hey! Ask me anything."]) };
    const topic = words(last).filter((w) => !STOP.has(w)).slice(0, 4).join(" ") || "that";
    return { text: choose(["Here's a short answer about " + topic + ": it depends on your goal, but start small, measure, and iterate.", "Good question about " + topic + ". In short: focus on the fundamentals first, then add complexity only when you need it.", "On " + topic + ": break it into steps, test each one, and keep notes on what you learn."]) };
  }
  function chat(body, headers) {
    const auth = headers.authorization || headers.Authorization || "";
    if (!/^Bearer\s+\S{6,}/.test(auth)) return json(401, { error: { message: "Missing or invalid API key. Send an Authorization: Bearer <key> header (any practice key like sk-practice-123 works here).", type: "invalid_request_error", code: "invalid_api_key" } });
    if (!body || !Array.isArray(body.messages) || !body.messages.length) return json(400, { error: { message: "'messages' must be a non-empty array of { role, content } objects.", type: "invalid_request_error" } });
    const bad = body.messages.find((m) => !["system", "developer", "user", "assistant", "tool"].includes(m.role));
    if (bad) return json(400, { error: { message: "Invalid role '" + bad.role + "'. Use system, user, assistant or tool.", type: "invalid_request_error" } });
    if (body.model === "rate-limit-demo") return json(429, { error: { message: "Rate limit reached. Retry after 2s.", type: "rate_limit_error" } });
    const r = think(body);
    const model = body.model || "shipyard-mini";
    const prompt = body.messages.map((m) => String(m.content || "")).join(" ");
    const base = { id: "chatcmpl-" + Math.random().toString(36).slice(2, 10), object: "chat.completion", created: Math.floor(Date.now() / 1000), model };
    if (r.tool) {
      const call = { id: "call_" + Math.random().toString(36).slice(2, 8), type: "function", function: { name: r.tool.name, arguments: JSON.stringify(r.tool.args) } };
      return json(200, { ...base, choices: [{ index: 0, message: { role: "assistant", content: null, tool_calls: [call] }, finish_reason: "tool_calls" }], usage: { prompt_tokens: estTokens(prompt), completion_tokens: 12, total_tokens: estTokens(prompt) + 12 } });
    }
    let text = r.text;
    const fmt = body.response_format && body.response_format.type;
    if (fmt === "json_object" || fmt === "json_schema") {
      text = JSON.stringify(r.gifts ? { gifts: r.gifts.map((g) => ({ name: g[0], reason: g[1], price: g[2] })) } : { answer: r.text });
    }
    let finish = "stop";
    const max = Number(body.max_tokens || body.max_completion_tokens || 0);
    if (max && estTokens(text) > max) { text = text.slice(0, max * 4); finish = "length"; }
    const usage = { prompt_tokens: estTokens(prompt), completion_tokens: estTokens(text), total_tokens: estTokens(prompt) + estTokens(text) };
    if (body.stream) {
      const pieces = text.match(/\S+\s*|\s+/g) || [text];
      const chunks = pieces.map((p) => "data: " + JSON.stringify({ ...base, object: "chat.completion.chunk", choices: [{ index: 0, delta: { content: p }, finish_reason: null }] }) + "\n\n");
      chunks.push("data: " + JSON.stringify({ ...base, object: "chat.completion.chunk", choices: [{ index: 0, delta: {}, finish_reason: finish }] }) + "\n\n", "data: [DONE]\n\n");
      return { status: 200, stream: chunks };
    }
    return json(200, { ...base, choices: [{ index: 0, message: { role: "assistant", content: text }, finish_reason: finish }], usage });
  }
  function embeddings(body, headers) {
    const auth = headers.authorization || headers.Authorization || "";
    if (!/^Bearer\s+\S{6,}/.test(auth)) return json(401, { error: { message: "Missing or invalid API key.", code: "invalid_api_key" } });
    const input = body && body.input;
    if (input == null || (Array.isArray(input) && !input.length)) return json(400, { error: { message: "'input' is required: a string or an array of strings." } });
    const list = [].concat(input);
    return json(200, { object: "list", model: (body && body.model) || "shipyard-embed-64", data: list.map((t, i) => ({ object: "embedding", index: i, embedding: embed(t) })), usage: { prompt_tokens: list.reduce((a, t) => a + estTokens(t), 0), total_tokens: list.reduce((a, t) => a + estTokens(t), 0) } });
  }

  function route(method, path, q, body, headers) {
    const p = path.replace(/\/+$/, "").split("/").filter(Boolean);
    const [r0, r1, r2] = p;
    if (r0 === "activity" && method === "GET") {
      const list = q.get("type") ? ACTIVITIES.filter((a) => a[1] === q.get("type")) : ACTIVITIES;
      if (!list.length) return json(404, { error: "No activity found with the specified parameters" });
      const a = pick(list);
      return json(200, { activity: a[0], type: a[1], participants: a[2], price: a[3], key: String(1000000 + ACTIVITIES.indexOf(a) * 7919) });
    }
    if (r0 === "dogs" && r1 === "random") {
      const d = pick(DOGS);
      return json(200, { message: svg('<rect width="400" height="300" fill="' + d[1] + '"/><text x="200" y="190" text-anchor="middle" font-size="150">' + d[0] + "</text>", 400, 300), breed: d[2], status: "success" });
    }
    if (r0 === "posts") {
      if (!r1) {
        if (method === "GET") {
          let list = posts.slice();
          if (q.get("userId")) list = list.filter((x) => String(x.userId) === q.get("userId"));
          if (q.get("_limit")) list = list.slice(0, Number(q.get("_limit")));
          return json(200, list);
        }
        if (method === "POST") {
          if (!body || typeof body !== "object") return json(400, { error: "Send a JSON body with a Content-Type: application/json header" });
          if (!body.title) return json(422, { error: "title is required" });
          return json(201, { ...body, id: nextPostId++ });
        }
        return json(405, { error: "Method not allowed" });
      }
      const post = posts.find((x) => String(x.id) === r1);
      if (!post) return json(404, { error: "Post " + r1 + " not found" });
      if (r2 === "comments") return json(200, [{ postId: post.id, id: 1, name: "Great post", email: "reader@example.com", body: "This explained it better than the docs." }, { postId: post.id, id: 2, name: "Question", email: "dev@example.com", body: "Would you do it differently today?" }]);
      if (method === "GET") return json(200, post);
      if (method === "PUT" || method === "PATCH") return json(200, { ...(method === "PATCH" ? post : { id: post.id }), ...(body || {}), id: post.id });
      if (method === "DELETE") return json(200, {});
    }
    if (r0 === "weather") {
      let c;
      if (q.get("city") || q.get("q")) { const name = (q.get("city") || q.get("q")).toLowerCase(); c = CITIES.find((x) => x[0].toLowerCase() === name); if (!c) return json(404, { cod: "404", message: "city not found" }); }
      else if (q.get("lat") && q.get("lon")) { const la = +q.get("lat"), lo = +q.get("lon"); c = CITIES.slice().sort((a, b) => Math.hypot(a[1] - la, a[2] - lo) - Math.hypot(b[1] - la, b[2] - lo))[0]; }
      else return json(400, { cod: "400", message: "Nothing to geocode: pass city, or lat and lon" });
      const imperial = q.get("units") === "imperial", jitter = (rand(30) - 15) / 10;
      const conv = (t) => Math.round((imperial ? t * 9 / 5 + 32 : t) * 10) / 10;
      return json(200, { name: c[0], coord: { lat: c[1], lon: c[2] }, weather: [{ main: c[4], description: c[5], icon: c[6], emoji: c[7] }], main: { temp: conv(c[3] + jitter), feels_like: conv(c[3] + jitter + 1.5), humidity: c[8] }, wind: { speed: Math.round((2 + Math.random() * 5) * 10) / 10 }, units: imperial ? "imperial" : "metric" });
    }
    if (r0 === "scheme") {
      const hex = (q.get("hex") || "").replace("#", "");
      if (!/^[0-9a-fA-F]{6}$/.test(hex)) return json(400, { error: "hex must be 6 hex digits, for example hex=F55A5A" });
      const count = Math.min(10, Math.max(1, Number(q.get("count") || 5))), mode = q.get("mode") || "monochrome";
      const colors = scheme(hex, mode, count);
      if (!colors) return json(400, { error: "Unknown mode. Try monochrome, monochrome-dark, monochrome-light, analogic, complement, analogic-complement, triad or quad" });
      return json(200, { mode, count, seed: { hex: { value: "#" + hex.toUpperCase(), clean: hex.toUpperCase() } }, colors: colors.map((h) => ({ hex: { value: h, clean: h.slice(1) } })) });
    }
    if (r0 === "deck") {
      if (r1 === "new") {
        const id = deckId(), cards = [];
        for (const s of SUITS) for (const v of VALUES) cards.push({ value: v, suit: s[0], code: (v === "10" ? "0" : v[0]) + s[0][0], image: cardImg(v, s) });
        for (let i = cards.length - 1; i > 0; i--) { const j = rand(i + 1); [cards[i], cards[j]] = [cards[j], cards[i]]; }
        decks[id] = cards;
        return json(200, { success: true, deck_id: id, remaining: 52, shuffled: true });
      }
      const deck = decks[r1];
      if (!deck) return json(404, { success: false, error: "Deck ID does not exist." });
      if (r2 === "draw") {
        const n = Math.max(1, Number(q.get("count") || 1));
        if (deck.length < n) return json(200, { success: false, deck_id: r1, cards: deck.splice(0), remaining: 0, error: "Not enough cards remaining to draw " + n + " additional" });
        return json(200, { success: true, deck_id: r1, cards: deck.splice(0, n), remaining: deck.length });
      }
    }
    if (r0 === "movies") {
      if (r1) {
        const m = MOVIES.find((x) => x[0] === r1);
        if (!m) return json(404, { Response: "False", Error: "Incorrect IMDb ID." });
        return json(200, { imdbID: m[0], Title: m[1], Year: String(m[2]), Runtime: m[3], Genre: m[4], Director: m[5], Plot: m[6], imdbRating: m[7], Poster: poster(m), Response: "True" });
      }
      const s = (q.get("s") || "").trim().toLowerCase();
      if (!s) return json(200, { Response: "False", Error: "Incorrect search: pass ?s=title" });
      const hits = MOVIES.filter((m) => m[1].toLowerCase().includes(s) || m[4].toLowerCase().includes(s) || m[5].toLowerCase().includes(s));
      if (!hits.length) return json(200, { Response: "False", Error: "Movie not found!" });
      return json(200, { Search: hits.map((m) => ({ Title: m[1], Year: String(m[2]), imdbID: m[0], Type: "movie", Poster: poster(m) })), totalResults: String(hits.length), Response: "True" });
    }
    if (r0 === "photos" && r1 === "random") {
      const pool = PHOTOS.filter((p) => !q.get("query") || (p[0] + p[2]).toLowerCase().includes(q.get("query").toLowerCase()));
      const p = pick(pool.length ? pool : PHOTOS);
      return json(200, { id: "ph" + PHOTOS.indexOf(p), description: p[0], urls: { full: photoSvg(p), regular: photoSvg(p) }, user: { name: p[1] }, location: { name: p[2] } });
    }
    if (r0 === "crypto" && r1) {
      const c = COINS[r1];
      if (!c) return json(404, { error: "coin not found" });
      const price = Math.round(c[2] * (1 + (Math.random() - 0.5) * 0.04) * 10000) / 10000;
      return json(200, { id: r1, symbol: c[1], name: c[0], image: { thumb: coinIcon(c), small: coinIcon(c) }, market_data: { current_price: { usd: price, inr: Math.round(price * 83.3 * 100) / 100 }, high_24h: { usd: Math.round(c[2] * 1.03 * 10000) / 10000 }, low_24h: { usd: Math.round(c[2] * 0.97 * 10000) / 10000 }, price_change_percentage_24h: Math.round((Math.random() * 8 - 4) * 100) / 100 } });
    }
    if (r0 === "catfacts") {
      const FACTS = ["Cats sleep for around 13 to 16 hours a day.", "A group of cats is called a clowder.", "Cats can rotate their ears 180 degrees.", "A cat's nose print is unique, like a fingerprint.", "Cats have five toes on their front paws but only four on the back.", "The oldest known pet cat was found in a 9,500-year-old grave in Cyprus.", "Cats can jump up to six times their length.", "A cat has 32 muscles in each ear."];
      const n = Math.min(8, Number(q.get("limit")) || 1);
      const start = rand(FACTS.length);
      return json(200, { data: Array.from({ length: n }, (_, i) => ({ fact: FACTS[(start + i) % FACTS.length], length: FACTS[(start + i) % FACTS.length].length })), fetchedAt: new Date().toISOString() });
    }
    if (r0 === "vans") {
      if (r1) { const v = VANS.find((x) => x.id === r1); return v ? json(200, { vans: v }) : json(404, { message: "No van found with id " + r1 }); }
      const type = q.get("type");
      return json(200, { vans: type ? VANS.filter((v) => v.type === type) : VANS });
    }
    if (r0 === "host" && r1 === "vans") {
      const host = q.get("hostId") || "123";
      if (r2) { const v = VANS.find((x) => x.id === r2 && x.hostId === host); return v ? json(200, { vans: [v] }) : json(404, { message: "No van found with id " + r2 }); }
      return json(200, { vans: VANS.filter((v) => v.hostId === host) });
    }
    if (r0 === "memes") {
      return json(200, { success: true, data: { memes: MEMES.map((m, i) => ({ id: String(181913649 + i * 7), name: m[0], url: memeSvg(m), width: 600, height: 450, box_count: 2 })) } });
    }
    if (r0 === "chef" && r1 === "recipe") {
      if (method !== "POST") return json(405, { error: "Use POST with { ingredients: [...] }" });
      const ing = body && Array.isArray(body.ingredients) ? body.ingredients.map((x) => String(x).trim()).filter(Boolean) : [];
      if (!ing.length) return json(400, { error: "Send at least one ingredient: { ingredients: [\"pasta\", \"garlic\"] }" });
      const main = ing[0], rest = ing.slice(1);
      const style = pick(["One-Pan", "Weeknight", "Rustic", "15-Minute", "Golden", "Smoky"]);
      const dish = pick(["Skillet", "Bowl", "Bake", "Stir-Fry", "Pasta", "Hash"]);
      const cap = (w) => w.charAt(0).toUpperCase() + w.slice(1);
      const extras = ["olive oil", "salt", "black pepper"].filter((x) => ing.indexOf(x) < 0);
      const md = "## " + style + " " + cap(main) + " " + dish + "\n\nA quick, comforting dish built around **" + main + "**" + (rest.length ? " with " + rest.join(", ") : "") + ".\n\n### Ingredients\n" +
        ing.concat(extras).map((x) => "- " + x).join("\n") + "\n\n### Instructions\n" +
        ["Prep everything first: chop, measure and set out your ingredients.", "Heat a little olive oil in a large pan over medium heat.", "Add the " + main + " and cook until it starts to colour, about 5 minutes.",
          rest.length ? "Stir in the " + rest.join(" and ") + ", and cook for another 5–7 minutes." : "Season well and keep cooking until tender.", "Taste, adjust the salt and pepper, and serve hot."].map((x, i) => (i + 1) + ". " + x).join("\n") +
        "\n\n> Chef's tip: let the pan get properly hot before adding the " + main + ". Colour is flavour.";
      return json(200, { recipe: md, model: "shipyard-chef-1" });
    }
    if (r0 === "trivia") {
      const n = Math.min(Math.max(Number(q.get("amount")) || 5, 1), TRIVIA.length);
      let list = TRIVIA.slice();
      if (q.get("difficulty")) list = list.filter((t) => t[1] === q.get("difficulty"));
      list = list.map((t) => [Math.random(), t]).sort((a, b) => a[0] - b[0]).map((x) => x[1]).slice(0, n);
      return json(200, { response_code: 0, results: list.map((t) => ({ type: t[3].length === 1 ? "boolean" : "multiple", difficulty: t[1], category: t[0], question: t[2], correct_answer: t[4], incorrect_answers: t[3] })) });
    }
    if (r0 === "v1" && r1 === "chat" && r2 === "completions") return method === "POST" ? chat(body, headers || {}) : json(405, { error: { message: "Use POST" } });
    if (r0 === "v1" && r1 === "embeddings") return method === "POST" ? embeddings(body, headers || {}) : json(405, { error: { message: "Use POST" } });
    if (r0 === "error" && r1) {
      const code = Number(r1) || 500;
      return json(code, { error: ({ 400: "Bad request", 401: "Unauthorized: missing or invalid API key", 403: "Forbidden", 404: "Not found", 429: "Too many requests, slow down", 500: "Internal server error", 503: "Service unavailable" })[code] || "Error" });
    }
    return json(404, { error: "No route for " + method + " /" + p.join("/") + ". See the lesson for available endpoints." });
  }

  async function shipyardFetch(input, init) {
    init = init || {};
    const raw = typeof input === "string" ? input : input && input.url ? input.url : String(input);
    let url;
    try { url = new URL(raw, "https://" + HOST); } catch (e) { throw new TypeError("Failed to fetch: invalid URL " + raw); }
    if (url.hostname !== HOST) {
      if (realFetch) return realFetch(input, init);
      throw new TypeError("Failed to fetch");
    }
    if (url.protocol !== "https:") throw new TypeError("Failed to fetch: use https://" + HOST);
    const method = (init.method || "GET").toUpperCase();
    let body = init.body;
    if (typeof body === "string") { try { body = JSON.parse(body); } catch (e) { body = body; } }
    const delay = url.searchParams.has("delay") ? Number(url.searchParams.get("delay")) : 200 + rand(300);
    await new Promise((r) => setTimeout(r, delay));
    const headers = {};
    if (init.headers) { const h = typeof Headers !== "undefined" && !(init.headers instanceof Headers) ? new Headers(init.headers) : init.headers; h.forEach ? h.forEach((v, k) => { headers[k.toLowerCase()] = v; }) : Object.assign(headers, init.headers); }
    const res = route(method, url.pathname, url.searchParams, body, headers);
    if (res.stream) {
      const enc = new TextEncoder();
      let i = 0;
      const stream = new ReadableStream({
        pull(controller) {
          return new Promise((r) => setTimeout(r, 25 + rand(40))).then(() => {
            if (i < res.stream.length) controller.enqueue(enc.encode(res.stream[i++]));
            else controller.close();
          });
        },
      });
      return new Response(stream, { status: res.status, headers: { "Content-Type": "text/event-stream" } });
    }
    return new Response(JSON.stringify(res.data), { status: res.status, headers: { "Content-Type": "application/json" } });
  }
  if (install && target) target.fetch = shipyardFetch;
  return shipyardFetch;
}

/* Script text for injecting the API into a playground iframe. */
export const MOCK_API_SCRIPT = "(" + shipyardApi.toString() + ")(window, true);";
