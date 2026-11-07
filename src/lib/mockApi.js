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

  /* ── router ── */
  const json = (status, data) => ({ status, data });
  function route(method, path, q, body) {
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
    const res = route(method, url.pathname, url.searchParams, body);
    return new Response(JSON.stringify(res.data), { status: res.status, headers: { "Content-Type": "application/json" } });
  }
  if (install && target) target.fetch = shipyardFetch;
  return shipyardFetch;
}

/* Script text for injecting the API into a playground iframe. */
export const MOCK_API_SCRIPT = "(" + shipyardApi.toString() + ")(window, true);";
