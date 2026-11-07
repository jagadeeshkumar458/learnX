/* Module — Accessible Development. Lesson titles match the syllabus.
   `a11yplay` = HTML/CSS(/JS) editor with live preview, accessibility audit, screen reader view and tab order.
   `a11ych` = challenge; checks get (d, w, a): d = scoped document, a = { issues, has(rule), tree, tabs }.
   `contrast` = colour contrast checker. */

const errors = (a) => a.issues.filter((i) => i.level === "error");

const CAFE_HTML = `<div class="top">
  <img src="logo.svg">
  <div class="links">
    <a href="#menu">Click here</a>
    <a href="#visit">Click here</a>
  </div>
</div>
<div class="big">Bean Scene</div>
<p class="faint">Small-batch coffee, roasted in the back room.</p>
<div class="hero-btn" onclick="order()">Order now</div>
<h4>Opening hours</h4>
<div>Mon–Fri 7am–6pm</div>
<div>Sat–Sun 8am–4pm</div>
<h2>Join our newsletter</h2>
<input type="email" placeholder="Email">
<div class="btn" onclick="subscribe()">Subscribe</div>`;

const CAFE_CSS = `.top { display: flex; justify-content: space-between; align-items: center; }
.top img { width: 40px; height: 40px; background: #6b3f2a; border-radius: 50%; }
.links a { margin-left: 12px; color: #8a7a70; }
.big { font-size: 32px; font-weight: 800; color: #3b2418; margin: 16px 0 4px; }
.faint { color: #b8aca4; }
.hero-btn, .btn { display: inline-block; background: #e9b79a; color: #fff; padding: 10px 16px; border-radius: 8px; cursor: pointer; }`;

const CAFE_SOLUTION_HTML = `<header class="top">
  <img src="logo.svg" alt="Bean Scene">
  <nav aria-label="Main">
    <ul class="links">
      <li><a href="#menu">See the menu</a></li>
      <li><a href="#visit">Plan your visit</a></li>
    </ul>
  </nav>
</header>
<main>
  <h1 class="big">Bean Scene</h1>
  <p class="faint">Small-batch coffee, roasted in the back room.</p>
  <button class="hero-btn" type="button">Order now</button>
  <h2 id="visit">Opening hours</h2>
  <ul>
    <li>Mon–Fri 7am–6pm</li>
    <li>Sat–Sun 8am–4pm</li>
  </ul>
  <h2>Join our newsletter</h2>
  <form>
    <label for="email">Email</label>
    <input type="email" id="email" name="email" autocomplete="email">
    <button class="btn">Subscribe</button>
  </form>
</main>`;

const CAFE_SOLUTION_CSS = `.top { display: flex; justify-content: space-between; align-items: center; }
.top img { width: 40px; height: 40px; background: #6b3f2a; border-radius: 50%; }
.links { display: flex; gap: 12px; list-style: none; margin: 0; padding: 0; }
.links a { color: #5c4a3f; }
.big { font-size: 32px; font-weight: 800; color: #3b2418; margin: 16px 0 4px; }
.faint { color: #6e5f56; }
.hero-btn, .btn { display: inline-block; background: #8a3f17; color: #fff; padding: 10px 16px; border-radius: 8px; cursor: pointer; border: 0; font: inherit; }`;

export const A11Y = {
  id: "a11y",
  title: "Accessible Development",
  blurb: "Build websites everyone can use: screen readers, keyboards, low vision and more.",
  concepts: ["WCAG and the POUR principles", "Colour contrast and use of colour", "Alt text, links and labels", "Semantic HTML, headings and lists", "ARIA and live regions", "Keyboard access and skip links"],
  lessons: [
    { id: "a11y-welcome", title: "Welcome to Accessible Development", min: 8, kind: "lesson", body: [
      { t: "p", h: "The World Health Organization estimates that about <b>1.3 billion people</b>, roughly 1 in 6, live with a significant disability. Many browse with a screen reader, a keyboard instead of a mouse, magnification, voice control or switch devices. Accessible development means building pages that work for all of them, and it makes sites better for everyone else too." },
      { t: "steps", items: [
        "<b>Permanent</b>: someone who is blind uses a screen reader every day",
        "<b>Temporary</b>: a broken arm means keyboard-only browsing for six weeks",
        "<b>Situational</b>: bright sunlight on a phone screen makes low-contrast text unreadable",
      ] },
      { t: "callout", kind: "key", h: "Accessibility is also the law in many places: the Americans with Disabilities Act is applied to websites in US courts, and the European Accessibility Act has applied to many products and services since June 2025. Most laws point to the same standard: <b>WCAG 2.x, level AA</b>." },
      { t: "p", h: "Every lab in this module has an <b>audit</b> tab that checks your page as you type, a <b>screen reader</b> tab that shows (and can read aloud) what assistive technology would announce, and a <b>tab order</b> tab for keyboard users. Explore this deliberately broken page:" },
      { t: "a11yplay", html: CAFE_HTML, css: CAFE_CSS, task: "Open each tab. How many problems does the audit find? Listen to the screen reader view: what does \"Click here\" tell you?" },
      { t: "recap", items: ["About 1 in 6 people live with a disability; everyone has situational limits", "WCAG 2.x AA is the standard most laws reference", "The labs audit your HTML live and show the screen reader's view"] },
    ]},
    { id: "a11y-understanding", title: "Understanding web accessibility", min: 12, kind: "lesson", body: [
      { t: "p", h: "The <b>Web Content Accessibility Guidelines (WCAG)</b>, published by the W3C, organise everything around four principles, usually remembered as <b>POUR</b>:" },
      { t: "steps", items: [
        "<b>Perceivable</b>: people can see or hear the content. Text alternatives, captions, enough contrast",
        "<b>Operable</b>: people can use it. Everything works with a keyboard, there's enough time, nothing flashes dangerously",
        "<b>Understandable</b>: content and controls are clear and predictable. Labels, error messages, consistent navigation",
        "<b>Robust</b>: it works with current and future assistive technology. Valid, semantic HTML",
      ] },
      { t: "p", h: "Each guideline has testable <b>success criteria</b> at three levels: <b>A</b> (the minimum), <b>AA</b> (the usual legal and industry target) and <b>AAA</b> (enhanced, not expected for whole sites). WCAG 2.2 is the current version." },
      { t: "h", h: "Assistive technology" },
      { t: "steps", items: [
        "<b>Screen readers</b> read the page aloud or to a braille display: NVDA and JAWS on Windows, VoiceOver on Mac and iPhone, TalkBack on Android",
        "<b>Screen magnifiers</b> and browser zoom enlarge everything",
        "<b>Keyboard</b> and <b>switch</b> users move through focusable elements in order",
        "<b>Voice control</b> users say the visible label of a button to press it",
      ] },
      { t: "callout", kind: "tip", h: "Try it today: press <kbd>Tab</kbd> through a website you use. Can you always see where focus is? Can you reach everything? Then turn on your phone's screen reader for five minutes." },
      { t: "quiz", q: "Which WCAG level do most organisations and laws target?", opts: ["A", "AA", "AAA"], a: 1, why: "AA covers the most important barriers without requirements that are impractical for every page." },
      { t: "quiz", q: "A site works perfectly with a mouse but you can't open its menu with a keyboard. Which principle does it fail?", opts: ["Perceivable", "Operable", "Understandable", "Robust"], a: 1, why: "If you can't use a control, the interface isn't operable." },
      { t: "recap", items: ["POUR: Perceivable, Operable, Understandable, Robust", "Levels A, AA, AAA; aim for AA", "Test with a keyboard and a screen reader, not just automated tools"] },
    ]},
    { id: "a11y-contrast-aside", title: "Aside: Text contrast", min: 10, kind: "lesson", body: [
      { t: "p", h: "<b>Contrast ratio</b> compares the relative luminance of text and its background, from 1:1 (same colour) to 21:1 (black on white). Low-contrast text is hard to read for people with low vision, colour vision deficiency, ageing eyes, or anyone on a phone in the sun." },
      { t: "steps", items: [
        "Normal text: at least <b>4.5:1</b> (AA)",
        "Large text (24px+, or 18.66px+ bold): at least <b>3:1</b>",
        "Icons, input borders and focus indicators: at least <b>3:1</b> against what's next to them",
        "AAA asks for 7:1 for normal text",
      ] },
      { t: "contrast", fg: "#9a9a9a", bg: "#ffffff" },
      { t: "callout", kind: "tip", h: "Light grey on white is the most common failure on the web. <code>#767676</code> is the lightest grey that passes 4.5:1 on white. Browser DevTools show the ratio when you inspect text." },
      { t: "quiz", q: "A 16px grey label has a 3.8:1 contrast ratio on its background. Does it pass WCAG AA?", opts: ["Yes, anything over 3:1 passes", "No, normal-size text needs 4.5:1", "Only on mobile"], a: 1, why: "3:1 is only enough for large text and non-text elements." },
    ]},
    { id: "a11y-color", title: "Aside: Use of color", min: 8, kind: "lesson", body: [
      { t: "p", h: "About 1 in 12 men and 1 in 200 women have some form of colour vision deficiency. If colour is the <b>only</b> way you show something, some users miss it entirely. WCAG 1.4.1: don't use colour as the only visual means of conveying information." },
      { t: "steps", items: [
        "Links in text: keep the underline (or another non-colour cue), not just a different colour",
        "Form errors: add an icon and a text message, not just a red border",
        "Charts: add labels, patterns or direct annotations, not just a colour legend",
        "Status: \"✓ Paid\" and \"! Overdue\", not green and red dots",
      ] },
      { t: "a11yplay", html: `<h2>Order status</h2>
<ul class="orders">
  <li><span class="dot ok"></span> Order #1042</li>
  <li><span class="dot bad"></span> Order #1043</li>
</ul>
<p>Read our <a href="/terms" class="plain">terms</a> before ordering.</p>`, css: `.orders { list-style: none; padding: 0; }
.dot { display: inline-block; width: 12px; height: 12px; border-radius: 50%; }
.ok { background: #2e9d4f; }
.bad { background: #d23b3b; }
a.plain { color: #1a5fb4; text-decoration: none; }`, task: "Check the screen reader tab: which orders failed? Add text like \"Delivered\" and \"Payment failed\" next to each dot, and bring back the link underline." },
      { t: "quiz", q: "Which is the most accessible way to mark a required field?", opts: ["Make its border red", "Add the word \"required\" (or an asterisk explained above the form) plus the required attribute", "Make the label bold"], a: 1, why: "Text is perceivable by everyone, and the required attribute is announced by screen readers." },
    ]},
    { id: "a11y-contrast", title: "Text contrast", min: 10, kind: "challenge", body: [
      { t: "p", h: "Time to fix some real contrast problems. The audit reports each failure with its ratio and the colours involved." },
      { t: "a11ych", prompt: "Fix the colours so every piece of text on the card passes WCAG AA, without changing the layout. Keep the brand feel: just darken (or lighten) the colours.", html: `<article class="card">
  <p class="eyebrow">New in store</p>
  <h2>Cold brew concentrate</h2>
  <p class="desc">Steeped for 18 hours. Mix one part with three parts water or milk.</p>
  <a class="cta" href="/shop/cold-brew">Shop cold brew</a>
</article>`, css: `.card { background: #fff8f0; padding: 16px; border-radius: 12px; }
.eyebrow { color: #f0a868; font-size: 13px; text-transform: uppercase; letter-spacing: .1em; }
h2 { color: #c9a58a; margin: 4px 0; }
.desc { color: #b9aea4; }
.cta { display: inline-block; background: #f6b26b; color: #ffffff; padding: 8px 14px; border-radius: 8px; text-decoration: none; }`, solution: { css: `.card { background: #fff8f0; padding: 16px; border-radius: 12px; }
.eyebrow { color: #a14d0c; font-size: 13px; text-transform: uppercase; letter-spacing: .1em; }
h2 { color: #5c3a22; margin: 4px 0; }
.desc { color: #5f554c; }
.cta { display: inline-block; background: #9a4a10; color: #ffffff; padding: 8px 14px; border-radius: 8px; text-decoration: none; }` }, checks: [
        { msg: "The eyebrow text passes", fn: (d, w, a) => !a.issues.some((i) => i.rule === "contrast" && i.el && i.el.classList.contains("eyebrow")) },
        { msg: "The heading passes", fn: (d, w, a) => !a.issues.some((i) => i.rule === "contrast" && i.el && i.el.tagName === "H2") },
        { msg: "The description passes", fn: (d, w, a) => !a.issues.some((i) => i.rule === "contrast" && i.el && i.el.classList.contains("desc")) },
        { msg: "The button text passes", fn: (d, w, a) => !a.issues.some((i) => i.rule === "contrast" && i.el && i.el.classList.contains("cta")) },
        { msg: "The card keeps its background", fn: (d) => getComputedStyle(d.querySelector(".card")).backgroundColor === "rgb(255, 248, 240)" },
      ] },
    ]},
    { id: "a11y-alt-aside", title: "Aside: Alternative text", min: 10, kind: "lesson", body: [
      { t: "p", h: "Screen readers can't see images. The <code>alt</code> attribute is what they read instead. Writing good alt text depends on the image's <b>purpose</b>:" },
      { t: "steps", items: [
        "<b>Informative</b> images: describe what matters in context. <code>alt=\"Barista pouring latte art in a cup\"</code>",
        "<b>Decorative</b> images: use an empty alt, <code>alt=\"\"</code>, so screen readers skip them. Never leave alt out: then many screen readers read the file name",
        "<b>Functional</b> images (inside a link or button): describe the action. A magnifying glass icon in a search button: <code>alt=\"Search\"</code>",
        "<b>Images of text</b>: repeat the text",
        "<b>Complex</b> images like charts: a short alt, plus the full details in nearby text or a <code>&lt;figcaption&gt;</code>",
      ] },
      { t: "callout", kind: "tip", h: "Skip \"image of\" or \"picture of\": screen readers already announce \"image\". Keep alt text concise, usually under about 150 characters." },
      { t: "a11yplay", html: `<img src="latte.jpg">
<img src="divider.png" alt="divider.png">
<a href="/"><img src="logo.svg" alt="logo"></a>
<img src="team.jpg" alt="Image of our team">`, css: `img { display: block; width: 120px; height: 60px; background: #ddd; margin: 6px 0; }`, task: "Fix all four images: one informative, one decorative, one a link to the home page, one a team photo. Watch the screen reader tab." },
      { t: "quiz", q: "A logo inside a link to the home page. What's the best alt?", opts: ["alt=\"logo\"", "alt=\"\"", "alt=\"Bean Scene home\"", "No alt"], a: 2, why: "The image is the link's only content, so its alt is the link's name. Describe the destination." },
    ]},
    { id: "a11y-links-aside", title: "Aside: Links", min: 8, kind: "lesson", body: [
      { t: "p", h: "Screen reader users often pull up a list of every link on the page to navigate. Out of context, \"Click here\", \"Read more\" and \"Learn more\" are meaningless, and five identical \"Read more\" links are worse. Make link text describe the destination." },
      { t: "code", lang: "html", code: `<!-- ✗ -->
<p>To see our menu, <a href="/menu">click here</a>.</p>

<!-- ✓ -->
<p>See <a href="/menu">our full menu</a>.</p>

<!-- Card links with visible "Read more"? Add context for screen readers -->
<a href="/blog/cold-brew">Read more<span class="visually-hidden"> about cold brew</span></a>` },
      { t: "steps", items: [
        "<b>Links go somewhere</b> (another page, a section); <b>buttons do something</b> (submit, open, toggle). Use the right element",
        "Warn before opening a new tab: \"Menu (opens in a new tab)\"",
        "Keep links visually distinct (underlined) and keep a visible focus style",
      ] },
      { t: "quiz", q: "Which element should open a modal dialog?", opts: ["<a href=\"#\">", "<button>", "<div onclick>"], a: 1, why: "Opening a dialog is an action, not navigation. Buttons are focusable and work with Enter and Space automatically." },
    ]},
    { id: "a11y-links", title: "Links and alternative text", min: 12, kind: "challenge", body: [
      { t: "a11ych", prompt: "Fix this blog teaser: give every image the right alt text (the hero photo is informative, the divider is decorative, the social icons are links), and replace the vague link text so each link makes sense on its own.", html: `<img class="hero" src="farm.jpg">
<h2>Meet our Colombian growers</h2>
<p>We spent a week with the Rojas family. <a href="/blog/rojas">Read more</a></p>
<img src="divider.png">
<p>Follow us:
  <a href="https://instagram.com"><img src="ig.svg"></a>
  <a href="https://youtube.com"><img src="yt.svg"></a>
</p>
<p>Questions? <a href="/contact">Click here</a>.</p>`, css: `img { background: #ddd; } .hero { width: 220px; height: 90px; display: block; } a img { width: 20px; height: 20px; vertical-align: middle; }`, solution: { html: `<img class="hero" src="farm.jpg" alt="Coffee cherries drying in the sun on a hillside farm">
<h2>Meet our Colombian growers</h2>
<p>We spent a week with the Rojas family. <a href="/blog/rojas">Read the story of the Rojas family farm</a></p>
<img src="divider.png" alt="">
<p>Follow us:
  <a href="https://instagram.com"><img src="ig.svg" alt="Bean Scene on Instagram"></a>
  <a href="https://youtube.com"><img src="yt.svg" alt="Bean Scene on YouTube"></a>
</p>
<p>Questions? <a href="/contact">Contact us</a>.</p>` }, checks: [
        { msg: "Every image has an alt attribute", fn: (d, w, a) => !a.has("alt") },
        { msg: "The hero photo has a real description (10+ characters)", fn: (d) => (d.querySelector(".hero").getAttribute("alt") || "").trim().length >= 10 },
        { msg: "The divider is marked decorative (alt=\"\")", fn: (d) => d.querySelector('img[src="divider.png"]').getAttribute("alt") === "" },
        { msg: "Both social links have names", fn: (d, w, a) => !a.has("link-name") && Array.from(d.querySelectorAll("a img")).every((i) => (i.getAttribute("alt") || "").trim().length > 2) },
        { msg: "No vague link text like \"Read more\" or \"Click here\"", fn: (d, w, a) => !a.has("link-vague") },
      ] },
    ]},
    { id: "a11y-labels-aside", title: "Aside: Labels", min: 10, kind: "lesson", body: [
      { t: "p", h: "Every form field needs a <b>label</b>: it's what screen readers announce when the field gets focus, and clicking it focuses the field (a bigger target for everyone). Connect them with <code>for</code> and <code>id</code>, or wrap the input in the label." },
      { t: "code", lang: "html", code: `<label for="email">Email</label>
<input type="email" id="email" name="email" autocomplete="email" required>

<label><input type="checkbox" name="news"> Send me the newsletter</label>

<!-- hints and errors: connect them with aria-describedby -->
<label for="pw">Password</label>
<input type="password" id="pw" aria-describedby="pw-hint">
<p id="pw-hint">At least 12 characters.</p>` },
      { t: "callout", kind: "warn", h: "A <b>placeholder is not a label</b>. It disappears as soon as you type, it's usually low contrast, and some screen readers don't announce it. Use it for an example, if at all." },
      { t: "a11yplay", html: `<input type="text" placeholder="Your name">
<input type="email" placeholder="Email">
<input type="checkbox" id="terms"> I agree to the terms
<button></button>`, css: `input, button { display: block; margin: 8px 0; padding: 6px; }`, task: "Make every control announce a sensible name. The button is for submitting the form; give it text." },
    ]},
    { id: "a11y-radio-aside", title: "Aside: Radio buttons", min: 8, kind: "lesson", body: [
      { t: "p", h: "A radio button's label says \"Small\", but small <i>what</i>? Group related radio buttons (and checkboxes) in a <code>&lt;fieldset&gt;</code> with a <code>&lt;legend&gt;</code>. Screen readers announce the legend when you enter the group: \"Cup size, group. Small, radio button, 1 of 3\"." },
      { t: "code", lang: "html", code: `<fieldset>
  <legend>Cup size</legend>
  <label><input type="radio" name="size" value="s"> Small</label>
  <label><input type="radio" name="size" value="m" checked> Medium</label>
  <label><input type="radio" name="size" value="l"> Large</label>
</fieldset>` },
      { t: "callout", kind: "tip", h: "Radio buttons sharing a <code>name</code> form one Tab stop: Tab into the group, then use the arrow keys to choose. That's built in, for free, when you use native inputs." },
      { t: "quiz", q: "What does the <legend> of a fieldset do for screen reader users?", opts: ["Nothing, it's only visual", "It's announced as the group's name, giving each option context", "It makes the options required"], a: 1, why: "Without it, users hear \"Small, radio button\" with no idea what question it answers." },
    ]},
    { id: "a11y-labels", title: "Labels", min: 12, kind: "challenge", body: [
      { t: "a11ych", prompt: "Make this order form accessible: every field gets a proper label, the milk options become a group with a legend, and the submit button gets a name.", html: `<form>
  <input type="text" id="name" placeholder="Name for the order">
  <p>Milk</p>
  <input type="radio" name="milk" value="dairy"> Dairy
  <input type="radio" name="milk" value="oat"> Oat
  <input type="radio" name="milk" value="none"> None
  <select id="size"><option>Small</option><option>Large</option></select>
  <button><img src="cup.svg"></button>
</form>`, css: `input[type=text], select { display: block; margin: 6px 0; padding: 6px; }`, solution: { html: `<form>
  <label for="name">Name for the order</label>
  <input type="text" id="name" autocomplete="name">
  <fieldset>
    <legend>Milk</legend>
    <label><input type="radio" name="milk" value="dairy"> Dairy</label>
    <label><input type="radio" name="milk" value="oat"> Oat</label>
    <label><input type="radio" name="milk" value="none"> None</label>
  </fieldset>
  <label for="size">Size</label>
  <select id="size"><option>Small</option><option>Large</option></select>
  <button><img src="cup.svg" alt=""> Place order</button>
</form>` }, checks: [
        { msg: "Every field has a label", fn: (d, w, a) => !a.has("label") && !a.has("label-for") },
        { msg: "The milk options are in a fieldset with a legend", fn: (d, w, a) => !a.has("radiogroup") && !a.has("legend") && !!d.querySelector("fieldset legend") },
        { msg: "Each radio button has its own label", fn: (d, w, a) => a.tree.filter((x) => x.role === "radio button").every((x) => /dairy|oat|none/i.test(x.name)) && a.tree.filter((x) => x.role === "radio button").length === 3 },
        { msg: "The submit button has a name", fn: (d, w, a) => !a.has("button-name") && !a.has("alt") },
      ] },
    ]},
    { id: "a11y-semantic", title: "Semantic HTML", min: 14, kind: "lesson", body: [
      { t: "p", h: "<b>Semantic HTML</b> means using elements for what they <i>are</i>: <code>&lt;button&gt;</code> for buttons, <code>&lt;nav&gt;</code> for navigation, <code>&lt;h2&gt;</code> for a heading. Browsers give these elements roles, keyboard support and focus behaviour for free. A <code>&lt;div&gt;</code> with an <code>onclick</code> has none of that: it can't be tabbed to, Enter does nothing, and screen readers don't call it a button." },
      { t: "steps", items: [
        "<b>Landmarks</b>: <code>&lt;header&gt;</code>, <code>&lt;nav&gt;</code>, <code>&lt;main&gt;</code>, <code>&lt;aside&gt;</code>, <code>&lt;footer&gt;</code>. Screen reader users jump between them",
        "<b>One <code>&lt;main&gt;</code></b> per page, around the main content",
        "<b>Interactive</b>: <code>&lt;button&gt;</code>, <code>&lt;a href&gt;</code>, <code>&lt;input&gt;</code>, <code>&lt;select&gt;</code>, <code>&lt;details&gt;</code>",
        "<b>Content</b>: headings, lists, <code>&lt;table&gt;</code> for tabular data, <code>&lt;figure&gt;</code>",
      ] },
      { t: "a11ych", prompt: "Turn the div soup into semantic HTML: a <code>&lt;header&gt;</code> with a <code>&lt;nav&gt;</code>, a <code>&lt;main&gt;</code>, a real <code>&lt;button&gt;</code> and a <code>&lt;footer&gt;</code>. Keep the class names so the styles still apply.", html: `<div class="header">
  <div class="logo">Bean Scene</div>
  <div class="nav"><a href="/menu">Menu</a> <a href="/visit">Visit</a></div>
</div>
<div class="content">
  <div class="title">Fresh roasts every Friday</div>
  <div class="button" onclick="alert('Ordered!')">Order a bag</div>
</div>
<div class="footer">© Bean Scene</div>`, css: `.header { display: flex; justify-content: space-between; background: #3b2418; color: #fff; padding: 10px; }
.header a { color: #fff; }
.title { font-size: 24px; font-weight: 700; margin: 12px 0; }
.button { display: inline-block; background: #8a3f17; color: #fff; padding: 8px 14px; border-radius: 6px; border: 0; font: inherit; }
.footer { margin-top: 16px; color: #555; }`, solution: { html: `<header class="header">
  <p class="logo">Bean Scene</p>
  <nav class="nav" aria-label="Main"><a href="/menu">Menu</a> <a href="/visit">Visit</a></nav>
</header>
<main class="content">
  <h1 class="title">Fresh roasts every Friday</h1>
  <button class="button" type="button" onclick="alert('Ordered!')">Order a bag</button>
</main>
<footer class="footer">© Bean Scene</footer>` }, checks: [
        { msg: "There's a <header> containing a <nav>", fn: (d) => !!d.querySelector("header nav") },
        { msg: "The content is in <main>", fn: (d) => !!d.querySelector("main") && d.querySelector("main").textContent.includes("Fresh roasts") },
        { msg: "\"Order a bag\" is a real <button>", fn: (d, w, a) => !a.has("fake-button") && Array.from(d.querySelectorAll("button")).some((b) => /order a bag/i.test(b.textContent)) },
        { msg: "The title is a heading", fn: (d) => Array.from(d.querySelectorAll("h1,h2")).some((h) => /fresh roasts/i.test(h.textContent)) },
        { msg: "There's a <footer>", fn: (d) => !!d.querySelector("footer") },
      ] },
    ]},
    { id: "a11y-lists", title: "Lists", min: 8, kind: "lesson", body: [
      { t: "p", h: "When a screen reader reaches a list, it says \"list, 4 items\", so users know how much is coming and can skip it. Use <code>&lt;ul&gt;</code> for unordered items, <code>&lt;ol&gt;</code> when order matters (steps, rankings), and <code>&lt;dl&gt;</code> for term–description pairs. Navigation menus are lists of links." },
      { t: "a11yplay", html: `<div class="menu">
  <a href="/espresso">Espresso</a>
  <a href="/filter">Filter</a>
  <a href="/tea">Tea</a>
</div>
<p>How to brew:</p>
<div>1. Grind the beans</div>
<div>2. Heat the water to 94°C</div>
<div>3. Pour slowly</div>`, css: `.menu { display: flex; gap: 12px; }`, task: "Turn the menu into a <code>&lt;ul&gt;</code> (inside a <code>&lt;nav&gt;</code>) and the brewing steps into an <code>&lt;ol&gt;</code>. Compare the screen reader tab before and after. Use CSS to keep the menu horizontal: <code>list-style: none; display: flex</code>." },
      { t: "callout", kind: "warn", h: "In Safari, <code>list-style: none</code> can make VoiceOver stop announcing a list. If it matters, add <code>role=\"list\"</code> to the <code>&lt;ul&gt;</code>." },
    ]},
    { id: "a11y-text-size", title: "Text size", min: 10, kind: "lesson", body: [
      { t: "p", h: "Many people raise their browser's default font size or zoom in. WCAG 1.4.4 asks that text can be resized to <b>200%</b> without losing content or function, and 1.4.10 that the page reflows at 320px wide without horizontal scrolling." },
      { t: "steps", items: [
        "Set font sizes in <code>rem</code>, not <code>px</code>: <code>1rem</code> follows the user's preferred size (16px by default)",
        "Keep body text around 1rem (16px) and don't go below 0.75rem for anything people need to read",
        "Use a comfortable line height (around 1.5) and line length (roughly 45–75 characters)",
        "Avoid fixed heights on text containers: text that grows will overflow",
        "Never disable zoom with <code>user-scalable=no</code> in the viewport meta tag",
      ] },
      { t: "a11yplay", html: `<article class="post">
  <h2>Why we roast on Fridays</h2>
  <p>Beans need a few days to rest after roasting, so Friday's batch is at its best by Monday morning.</p>
  <p class="small">Posted by Maya · 4 min read</p>
</article>`, css: `.post { width: 260px; height: 120px; overflow: hidden; border: 1px solid #ccc; padding: 8px; }
h2 { font-size: 18px; }
p { font-size: 13px; line-height: 1.1; }
.small { font-size: 9px; }`, task: "The audit flags the 9px text. Switch to <code>rem</code>, raise the sizes, add line-height 1.5, and replace the fixed height with <code>min-height</code>." },
      { t: "quiz", q: "Why prefer rem over px for font sizes?", opts: ["rem is faster", "rem scales with the user's preferred browser font size; px ignores it", "px doesn't work on phones"], a: 1, why: "Someone who sets a larger default font size gets larger text everywhere you used rem." },
    ]},
    { id: "a11y-headings", title: "Headings", min: 10, kind: "lesson", body: [
      { t: "p", h: "Surveys of screen reader users, such as WebAIM's, consistently find that navigating by headings is the most common way they find information on a page. Headings work like a table of contents, so their <b>levels</b> must describe the structure, not the font size you want." },
      { t: "steps", items: [
        "One <code>&lt;h1&gt;</code> describing the page",
        "Don't skip levels going down: h2, then h3 inside it, not h2 then h4",
        "Choose the level by structure; change the size with CSS",
        "Don't use headings for text that isn't a heading, or bold paragraphs for things that are",
      ] },
      { t: "a11ych", prompt: "Fix the heading structure: one <code>&lt;h1&gt;</code>, no skipped levels, and the bold \"Seasonal specials\" paragraph becomes a real heading. Use CSS (the class) to keep the sizes looking the same.", html: `<h3 class="page-title">Bean Scene menu</h3>
<h5>Espresso drinks</h5>
<p>Flat white, cortado, latte</p>
<h5>Filter</h5>
<p>V60, Chemex, batch brew</p>
<p><b>Seasonal specials</b></p>
<p>Maple oat latte</p>`, css: `.page-title { font-size: 20px; }
h2, h5 { font-size: 15px; }`, solution: { html: `<h1 class="page-title">Bean Scene menu</h1>
<h2>Espresso drinks</h2>
<p>Flat white, cortado, latte</p>
<h2>Filter</h2>
<p>V60, Chemex, batch brew</p>
<h2>Seasonal specials</h2>
<p>Maple oat latte</p>` }, checks: [
        { msg: "There's exactly one <h1>", fn: (d) => d.querySelectorAll("h1").length === 1 },
        { msg: "No skipped heading levels", fn: (d, w, a) => !a.has("heading-skip") && !a.has("h1") },
        { msg: "\"Seasonal specials\" is a heading at the same level as the other sections", fn: (d) => { const hs = Array.from(d.querySelectorAll("h1,h2,h3,h4,h5,h6")); const s = hs.find((h) => /seasonal specials/i.test(h.textContent)); const e = hs.find((h) => /espresso/i.test(h.textContent)); return !!s && !!e && s.tagName === e.tagName; } },
        { msg: "There are no fake headings made of bold paragraphs", fn: (d) => !Array.from(d.querySelectorAll("p > b, p > strong")).some((b) => b.parentElement.textContent.trim() === b.textContent.trim()) },
      ] },
    ]},
    { id: "a11y-aria", title: "ARIA", min: 14, kind: "lesson", body: [
      { t: "p", h: "<b>ARIA</b> (Accessible Rich Internet Applications) is a set of attributes that add accessibility information HTML can't express on its own: <b>roles</b> (what it is), <b>states</b> (<code>aria-expanded</code>, <code>aria-pressed</code>) and <b>properties</b> (<code>aria-label</code>, <code>aria-describedby</code>)." },
      { t: "callout", kind: "key", h: "The <b>first rule of ARIA</b>: if a native HTML element does the job, use it. <code>&lt;button&gt;</code> beats <code>&lt;div role=\"button\" tabindex=\"0\"&gt;</code> plus keyboard handlers. ARIA changes what's <i>announced</i>, not how things <i>behave</i>. WebAIM's yearly survey of the top million home pages keeps finding more errors on pages that use ARIA than on pages that don't." },
      { t: "steps", items: [
        "<code>aria-label=\"Close\"</code>: a name for icon-only buttons",
        "<code>aria-labelledby=\"id\"</code> / <code>aria-describedby=\"id\"</code>: point at visible text",
        "<code>aria-expanded=\"true|false\"</code>: on the button that opens a menu or accordion",
        "<code>aria-current=\"page\"</code>: the current page link in a nav",
        "<code>aria-hidden=\"true\"</code>: hide decorative icons from screen readers (never on focusable things)",
      ] },
      { t: "a11yplay", html: `<button id="menu-btn" aria-expanded="false" aria-controls="menu">☰</button>
<ul id="menu" hidden>
  <li><a href="/menu">Menu</a></li>
  <li><a href="/visit">Visit</a></li>
</ul>`, css: `#menu-btn { font-size: 20px; padding: 4px 10px; }`, js: `const btn = document.getElementById("menu-btn")
const menu = document.getElementById("menu")

btn.addEventListener("click", () => {
  const open = btn.getAttribute("aria-expanded") === "true"
  btn.setAttribute("aria-expanded", String(!open))
  menu.hidden = open
})`, task: "Click the button in the preview: the screen reader tab shows \"collapsed\" / \"expanded\". But what's the button called? Add <code>aria-label=\"Main menu\"</code>." },
      { t: "quiz", q: "Which is better for a clickable control?", opts: ["<div role=\"button\" tabindex=\"0\"> with click and keydown handlers", "<button type=\"button\">", "<span aria-label=\"button\">"], a: 1, why: "The native button is focusable, works with Enter and Space, and is announced correctly, with zero extra code." },
    ]},
    { id: "a11y-live", title: "ARIA live regions", min: 12, kind: "lesson", body: [
      { t: "p", h: "When something changes on screen without a page load (\"Added to cart\", \"3 results\", an error), sighted users see it, but screen reader users don't hear it, because their focus is somewhere else. A <b>live region</b> is an element whose changes are announced automatically." },
      { t: "code", lang: "html", code: `<div aria-live="polite" class="visually-hidden" id="status"></div>   <!-- waits for a pause -->
<div role="alert">Payment failed. Check your card details.</div>        <!-- interrupts: errors only -->
<div role="status">Saved</div>                                           <!-- same as aria-live="polite" -->` },
      { t: "callout", kind: "warn", h: "The live region must <b>already exist</b> in the page before you change its text. Inserting a new element that has <code>aria-live</code> often isn't announced. Create it empty, then update its <code>textContent</code>." },
      { t: "a11ych", prompt: "When someone adds a coffee to the cart, screen readers should announce it. Add an empty live region with <code>id=\"cart-status\"</code> and <code>aria-live=\"polite\"</code>, and update its text in the click handler to say what was added, e.g. \"Flat white added to your cart\".", html: `<button class="add" data-name="Flat white">Add flat white</button>
<button class="add" data-name="Cortado">Add cortado</button>
<p>Cart: <span id="count">0</span> items</p>`, css: `.visually-hidden { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }`, js: `let count = 0
document.querySelectorAll(".add").forEach(btn => {
  btn.addEventListener("click", () => {
    count++
    document.getElementById("count").textContent = count
    // announce it here
  })
})`, solution: { html: `<button class="add" data-name="Flat white">Add flat white</button>
<button class="add" data-name="Cortado">Add cortado</button>
<p>Cart: <span id="count">0</span> items</p>
<div id="cart-status" aria-live="polite" class="visually-hidden"></div>`, js: `let count = 0
document.querySelectorAll(".add").forEach(btn => {
  btn.addEventListener("click", () => {
    count++
    document.getElementById("count").textContent = count
    document.getElementById("cart-status").textContent = btn.dataset.name + " added to your cart"
  })
})` }, checks: [
        { msg: "There's a live region with id cart-status", fn: (d) => { const s = d.getElementById("cart-status"); return !!s && (s.getAttribute("aria-live") === "polite" || s.getAttribute("role") === "status"); } },
        { msg: "It starts empty (so the first update is announced)", fn: (d) => { const s = d.getElementById("cart-status"); return !!s && s.textContent.trim() === ""; } },
        { msg: "Clicking \"Add cortado\" announces \"Cortado added…\"", fn: (d) => { d.querySelectorAll(".add")[1].click(); const s = d.getElementById("cart-status"); return !!s && /cortado added/i.test(s.textContent); } },
        { msg: "The counter still works", fn: (d) => { d.querySelectorAll(".add")[0].click(); return Number(d.getElementById("count").textContent) >= 1; } },
      ] },
    ]},
    { id: "a11y-js", title: "Aside: Accessible JavaScript", min: 12, kind: "lesson", body: [
      { t: "steps", items: [
        "<b>Use native controls</b>: <code>&lt;button&gt;</code> fires <code>click</code> for mouse, Enter and Space. A div needs all of that written by hand",
        "<b>Manage focus</b>: when a dialog opens, move focus into it; when it closes, return focus to the button that opened it. After deleting an item, move focus somewhere sensible",
        "<b>Keep focus visible</b>: never <code>outline: none</code> without a replacement. Style <code>:focus-visible</code> instead",
        "<b>Announce changes</b> with live regions",
        "<b>Respect motion preferences</b>: wrap animations in <code>@media (prefers-reduced-motion: no-preference)</code>",
        "<b>Don't trap keyboard users</b> (except inside an open modal, and let Escape close it)",
      ] },
      { t: "code", lang: "javascript", code: `const dialog = document.querySelector("dialog")
openBtn.addEventListener("click", () => dialog.showModal())   // <dialog> moves focus, traps it, and closes on Esc
dialog.addEventListener("close", () => openBtn.focus())       // give focus back` },
      { t: "code", lang: "css", code: `button:focus-visible {
  outline: 3px solid #1a5fb4;
  outline-offset: 2px;
}
@media (prefers-reduced-motion: reduce) {
  * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
}` },
      { t: "quiz", q: "A modal closes. Where should keyboard focus go?", opts: ["To the top of the page", "Nowhere in particular", "Back to the element that opened the modal"], a: 2, why: "Otherwise keyboard users lose their place and have to tab through the whole page again." },
    ]},
    { id: "a11y-hiding", title: "Aside: Hiding content", min: 8, kind: "lesson", body: [
      { t: "p", h: "There are three different ways to hide something, and they hide it from different people:" },
      { t: "steps", items: [
        "<code>display: none</code>, <code>visibility: hidden</code> or the <code>hidden</code> attribute: hidden from <b>everyone</b>",
        "<code>aria-hidden=\"true\"</code>: visible on screen, hidden from <b>screen readers</b>. For decorative icons and duplicated content",
        "A <b>visually-hidden</b> class: hidden from <b>sight</b>, still read by screen readers. For extra context like \"(opens in a new tab)\" or a skip link",
      ] },
      { t: "code", lang: "css", code: `.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}` },
      { t: "a11yplay", html: `<button><span aria-hidden="true">🛒</span> Cart <span class="visually-hidden">(3 items)</span></button>
<p hidden>This paragraph is hidden from everyone.</p>
<a href="/menu">Menu <span class="visually-hidden">(opens a PDF)</span></a>`, css: `.visually-hidden { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }`, task: "Compare the preview with the screen reader tab. Then put <code>aria-hidden=\"true\"</code> on the whole button: what does the audit say, and why?" },
    ]},
    { id: "a11y-skip-1", title: "Aside: Skip Navigation Link part 1", min: 6, kind: "lesson", body: [
      { t: "p", h: "Keyboard users press Tab through every link in your header on every page before reaching the content. A <b>skip link</b> is the first focusable element on the page; it jumps straight to <code>&lt;main&gt;</code>. WCAG 2.4.1 asks for a way to bypass repeated blocks." },
      { t: "code", lang: "html", code: `<body>
  <a class="skip-link" href="#main">Skip to main content</a>
  <header>…lots of navigation…</header>
  <main id="main">…</main>
</body>` },
    ]},
    { id: "a11y-skip-2", title: "Aside: Skip Navigation Link part 2", min: 6, kind: "lesson", body: [
      { t: "p", h: "Sighted keyboard users need to see the skip link when it's focused, but mouse users don't need it cluttering the header. Move it off-screen, and bring it back on <code>:focus</code>." },
      { t: "code", lang: "css", code: `.skip-link {
  position: absolute;
  left: 8px;
  top: -40px;
  background: #111;
  color: #fff;
  padding: 8px 12px;
  z-index: 100;
}
.skip-link:focus {
  top: 8px;
}` },
      { t: "callout", kind: "tip", h: "Press Tab on GitHub, GOV.UK or many large sites and you'll see their skip links appear." },
    ]},
    { id: "a11y-skip", title: "Skip Navigation Link", min: 10, kind: "challenge", body: [
      { t: "a11ych", prompt: "Add a skip link: the <b>first</b> focusable element, with the text \"Skip to main content\", pointing at <code>&lt;main id=\"main\"&gt;</code>. Hide it off-screen until it receives focus.", html: `<header>
  <nav>
    <a href="/">Home</a> <a href="/menu">Menu</a> <a href="/beans">Beans</a>
    <a href="/gear">Gear</a> <a href="/visit">Visit</a> <a href="/blog">Blog</a>
  </nav>
</header>
<main>
  <h1>Bean Scene</h1>
  <p>Fresh roasts every Friday.</p>
</main>`, css: `header { position: relative; }`, solution: { html: `<a class="skip-link" href="#main">Skip to main content</a>
<header>
  <nav>
    <a href="/">Home</a> <a href="/menu">Menu</a> <a href="/beans">Beans</a>
    <a href="/gear">Gear</a> <a href="/visit">Visit</a> <a href="/blog">Blog</a>
  </nav>
</header>
<main id="main">
  <h1>Bean Scene</h1>
  <p>Fresh roasts every Friday.</p>
</main>`, css: `header { position: relative; }
.skip-link { position: absolute; left: 8px; top: -40px; background: #111; color: #fff; padding: 8px 12px; z-index: 100; }
.skip-link:focus { top: 8px; }` }, checks: [
        { msg: "The first focusable element is a link to #main", fn: (d, w, a) => !!a.tabs[0] && a.tabs[0].el.getAttribute("href") === "#main" },
        { msg: "Its text says \"Skip to main content\"", fn: (d, w, a) => !!a.tabs[0] && /skip to (the )?main content/i.test(a.tabs[0].name) },
        { msg: "<main> has id=\"main\"", fn: (d) => !!d.querySelector("main#main") },
        { msg: "It's moved off-screen until focused", fn: (d) => { const l = d.querySelector('a[href="#main"]'); if (!l) return false; const r = l.getBoundingClientRect(), b = d.body.getBoundingClientRect(); return r.bottom <= b.top + 2 || r.right <= b.left + 2 || getComputedStyle(l).clip !== "auto"; } },
        { msg: "There's a :focus (or :focus-visible) style for it", fn: (d) => Array.from(d.root.styleSheets || []).some((ss) => Array.from(ss.cssRules).some((r) => /:focus/.test(r.selectorText || "") && /skip|#main|href/.test(r.selectorText || ""))) },
      ] },
    ]},
    { id: "a11y-final-1", title: "Final challenge part 1", min: 20, kind: "challenge", body: [
      { t: "p", h: "Bean Scene's homepage, from the first lesson, needs a full accessibility pass. Use everything from this module: landmarks, headings, lists, labels, link text, buttons, alt text and contrast. Aim for zero errors in the audit." },
      { t: "a11ych", prompt: "Make the Bean Scene homepage pass: no audit errors, a single <code>&lt;h1&gt;</code>, landmarks, real buttons, labelled fields, descriptive links, and readable contrast.", html: CAFE_HTML, css: CAFE_CSS, solution: { html: CAFE_SOLUTION_HTML, css: CAFE_SOLUTION_CSS }, checks: [
        { msg: "No errors in the audit", fn: (d, w, a) => errors(a).length === 0 },
        { msg: "Exactly one <h1>, and no skipped heading levels", fn: (d, w, a) => d.querySelectorAll("h1").length === 1 && !a.has("heading-skip") },
        { msg: "Uses <header>, <nav> and <main>", fn: (d) => !!d.querySelector("header") && !!d.querySelector("nav") && !!d.querySelector("main") },
        { msg: "No vague links", fn: (d, w, a) => !a.has("link-vague") },
        { msg: "Opening hours are a list", fn: (d) => Array.from(d.querySelectorAll("li")).some((li) => /mon/i.test(li.textContent)) },
        { msg: "The email field has a real label", fn: (d, w, a) => !a.has("label") && a.tree.some((x) => x.role === "edit text" && /email/i.test(x.name)) },
      ] },
    ]},
    { id: "a11y-final-2", title: "Final challenge part 2", min: 15, kind: "challenge", body: [
      { t: "p", h: "Now the interactive part: an accessible \"Today's specials\" disclosure. The button controls a panel and tells screen readers whether it's open." },
      { t: "a11ych", prompt: "Make the toggle accessible: use a real <code>&lt;button&gt;</code> with <code>aria-expanded</code> (false while closed) and <code>aria-controls=\"specials\"</code>, keep the panel hidden with the <code>hidden</code> attribute until it's opened, and update both when it's clicked.", html: `<div class="toggle" id="toggle">Today's specials ▾</div>
<div id="specials" class="panel" style="display:none">
  <ul><li>Maple oat latte</li><li>Cardamom bun</li></ul>
</div>`, css: `.toggle, button { font: inherit; background: #3b2418; color: #fff; border: 0; padding: 8px 12px; border-radius: 6px; cursor: pointer; }`, js: `const toggle = document.getElementById("toggle")
const panel = document.getElementById("specials")
toggle.addEventListener("click", () => {
  panel.style.display = panel.style.display === "none" ? "block" : "none"
})`, solution: { html: `<button type="button" id="toggle" aria-expanded="false" aria-controls="specials">Today's specials <span aria-hidden="true">▾</span></button>
<div id="specials" class="panel" hidden>
  <ul><li>Maple oat latte</li><li>Cardamom bun</li></ul>
</div>`, js: `const toggle = document.getElementById("toggle")
const panel = document.getElementById("specials")
toggle.addEventListener("click", () => {
  const open = toggle.getAttribute("aria-expanded") === "true"
  toggle.setAttribute("aria-expanded", String(!open))
  panel.hidden = open
})` }, checks: [
        { msg: "The toggle is a <button>", fn: (d) => !!d.getElementById("toggle") && d.getElementById("toggle").tagName === "BUTTON" },
        { msg: "It starts with aria-expanded=\"false\" and aria-controls=\"specials\"", fn: (d) => { const b = d.getElementById("toggle"); return !!b && b.getAttribute("aria-expanded") === "false" && b.getAttribute("aria-controls") === "specials"; } },
        { msg: "The panel starts hidden with the hidden attribute", fn: (d) => d.getElementById("specials").hidden === true },
        { msg: "Clicking opens it: aria-expanded=\"true\" and the panel is shown", fn: (d) => { const b = d.getElementById("toggle"); b.click(); return b.getAttribute("aria-expanded") === "true" && !d.getElementById("specials").hidden; } },
        { msg: "Each click toggles it, keeping aria-expanded and the panel in sync", fn: (d) => { const b = d.getElementById("toggle"), p = d.getElementById("specials"); const states = []; for (let i = 0; i < 2; i++) { b.click(); states.push([b.getAttribute("aria-expanded"), p.hidden]); } return states[0][0] !== states[1][0] && states.every(([e, h]) => (e === "true") === !h); } },
      ] },
    ]},
    { id: "a11y-outro", title: "Outro", min: 6, kind: "lesson", body: [
      { t: "p", h: "Accessibility isn't a feature you bolt on at the end. It's mostly about good HTML, sensible design and testing with the tools real people use. Automated checkers (like this module's audit, axe or Lighthouse) catch maybe a third of issues; the rest needs a keyboard, a screen reader and some empathy." },
      { t: "steps", items: [
        "Before shipping: Tab through the page, zoom to 200%, run an automated checker, and try a screen reader for the key flows",
        "Use native HTML first; reach for ARIA only to fill gaps",
        "Write down accessibility requirements with your designs, not after",
        "Involve disabled users in testing whenever you can",
      ] },
      { t: "quiz", q: "An automated checker reports zero issues. Is the page accessible?", opts: ["Yes", "Not necessarily: automated tools miss many issues, like poor alt text, confusing focus order or unclear labels", "Only if Lighthouse agrees"], a: 1, why: "Tools can check that alt exists, not that it's useful. Manual testing is essential." },
      { t: "recap", items: ["Contrast, colour, text size", "Alt text, link text, labels, fieldsets", "Semantic HTML, headings, lists, landmarks", "ARIA (sparingly) and live regions", "Keyboard access, focus management and skip links"] },
    ]},
  ],
};
