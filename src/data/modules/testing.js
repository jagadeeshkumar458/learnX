/* Module — Testing. Lesson titles match the syllabus.
   Labs run in the testing lab (src/lib/testLab.js): vitest, @testing-library/react, user-event,
   jest-dom matchers, msw and vitest-axe. Challenges grade tests by running them against the working
   Meme Generator (they must pass) and against mutants with one bug each (some test must fail). */
import { APP, MUT, VITE_CONFIG, PKG, SETUP, ACTIONS_BROKEN, ACTIONS_FIXED, ACTIONS_NAMED_NO_SHARE } from "./testing-files.js";

const T = (files) => ({ ...APP, ...files });

const UTILS_TEST_START = `import { describe, it, expect } from "vitest"
import { getRandomMeme, formatMemeText } from "./memeUtils"

describe("formatMemeText", () => {
  it.todo("uppercases the text")
  it.todo("trims spaces from both ends")
})

describe("getRandomMeme", () => {
  it.todo("returns null for an empty list")
  it.todo("uses the random number to pick a meme")
})
`;
const UTILS_TEST_DONE = `import { describe, it, expect } from "vitest"
import { getRandomMeme, formatMemeText } from "./memeUtils"

describe("formatMemeText", () => {
  it("uppercases the text", () => {
    expect(formatMemeText("hello")).toBe("HELLO")
  })
  it("trims spaces from both ends", () => {
    expect(formatMemeText("  hi there  ")).toBe("HI THERE")
  })
})

describe("getRandomMeme", () => {
  const memes = [{ id: "a" }, { id: "b" }, { id: "c" }]

  it("returns null for an empty list", () => {
    expect(getRandomMeme([])).toBeNull()
  })
  it("uses the random number to pick a meme", () => {
    expect(getRandomMeme(memes, () => 0)).toEqual({ id: "a" })
    expect(getRandomMeme(memes, () => 0.5)).toEqual({ id: "b" })
    expect(getRandomMeme(memes, () => 0.99)).toEqual({ id: "c" })
  })
})
`;

const HEADER_TEST_DONE = `import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import Header from "./Header"

describe("Header", () => {
  it("shows the app name as the main heading", () => {
    render(<Header />)
    expect(screen.getByRole("heading", { level: 1, name: "Meme Generator" })).toBeInTheDocument()
  })

  it("has a logo with alt text", () => {
    render(<Header />)
    expect(screen.getByRole("img", { name: /troll face/i })).toBeInTheDocument()
  })
})
`;
const MAIN_RENDER_TEST_DONE = `import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import Main from "./Main"

describe("Main", () => {
  it("starts with the default captions", () => {
    render(<Main />)
    expect(screen.getByLabelText("Top Text")).toHaveValue("One does not simply")
    expect(screen.getByLabelText("Bottom Text")).toHaveValue("Walk into Mordor")
  })
})
`;

const INTERACT_START = `import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import Main from "./Main"

describe("Main: editing captions", () => {
  it("shows the top text in capitals on the meme", async () => {
    const user = userEvent.setup()
    render(<Main />)
    // 1. find the Top Text input by its label
    // 2. clear it, then type "hello world"
    // 3. expect the meme to show HELLO WORLD
  })

  // add a test for the bottom text
})
`;
const INTERACT_DONE = `import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import Main from "./Main"

describe("Main: editing captions", () => {
  it("shows the top text in capitals on the meme", async () => {
    const user = userEvent.setup()
    render(<Main />)
    const input = screen.getByLabelText("Top Text")
    await user.clear(input)
    await user.type(input, "hello world")
    expect(input).toHaveValue("hello world")
    expect(screen.getByText("HELLO WORLD")).toBeInTheDocument()
  })

  it("updates only the bottom text", async () => {
    const user = userEvent.setup()
    render(<Main />)
    const input = screen.getByLabelText("Bottom Text")
    await user.clear(input)
    await user.type(input, "bottom line")
    expect(screen.getByText("BOTTOM LINE")).toBeInTheDocument()
    expect(screen.getByText("ONE DOES NOT SIMPLY")).toBeInTheDocument()
  })
})
`;

const MSW_SETUP = `import { http, HttpResponse } from "msw"
import { setupServer } from "msw/node"
import { MEMES_URL } from "./Main"

const testMemes = [{ id: "1", name: "Drake", url: "https://i.imgflip.com/drake.jpg" }]

// msw intercepts fetch() calls that match a handler and answers with fake data
const server = setupServer(
  http.get(MEMES_URL, () => HttpResponse.json({ success: true, data: { memes: testMemes } }))
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
`;
const MSW_START = `import { describe, it, expect, beforeAll, afterEach, afterAll } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import Main from "./Main"
${MSW_SETUP}
describe("Main: memes from the API", () => {
  it("shows a new meme image when the button is clicked", async () => {
    // wait for the button to be enabled (the memes have loaded), click it,
    // and expect the img to have the Drake URL as its src
  })

  it("shows an error message when the memes can't load", async () => {
    // override the handler with server.use for this test only: respond with status 500
  })
})
`;
const MSW_TESTS = `describe("Main: memes from the API", () => {
  it("shows a new meme image when the button is clicked", async () => {
    const user = userEvent.setup()
    render(<Main />)
    const button = screen.getByRole("button", { name: /get a new meme image/i })
    await waitFor(() => expect(button).toBeEnabled())
    await user.click(button)
    expect(screen.getByRole("img", { name: "Meme" })).toHaveAttribute("src", "https://i.imgflip.com/drake.jpg")
  })

  it("shows an error message when the memes can't load", async () => {
    server.use(http.get(MEMES_URL, () => new HttpResponse(null, { status: 500 })))
    render(<Main />)
    expect(await screen.findByRole("alert")).toHaveTextContent(/couldn't load memes/i)
  })
})
`;
const MSW_DONE = `import { describe, it, expect, beforeAll, afterEach, afterAll } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import Main from "./Main"
${MSW_SETUP}
${MSW_TESTS}`;

const COVERAGE_START = `import { describe, it, expect, beforeAll, afterEach, afterAll } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import Main from "./Main"
${MSW_SETUP}
describe("Main", () => {
  it("renders the default captions", () => {
    render(<Main />)
    expect(screen.getByText("ONE DOES NOT SIMPLY")).toBeInTheDocument()
  })
})
`;
const COVERAGE_DONE = MSW_DONE.replace('describe("Main: memes from the API", () => {', `describe("Main: captions", () => {
  it("updates the caption as you type", async () => {
    const user = userEvent.setup()
    render(<Main />)
    const input = screen.getByLabelText("Top Text")
    await user.clear(input)
    await user.type(input, "tests")
    expect(screen.getByText("TESTS")).toBeInTheDocument()
  })

  it("keeps the captions separate", async () => {
    const user = userEvent.setup()
    render(<Main />)
    const input = screen.getByLabelText("Bottom Text")
    await user.clear(input)
    await user.type(input, "pass")
    expect(screen.getByText("PASS")).toBeInTheDocument()
    expect(screen.getByText("ONE DOES NOT SIMPLY")).toBeInTheDocument()
  })
})

describe("Main: memes from the API", () => {`);

const AXE_START = `import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { axe } from "vitest-axe"
import MemeActions from "./MemeActions"

describe("MemeActions", () => {
  it("has no accessibility violations", async () => {
    // render it, run axe on the container, expect no violations
  })

  it("calls onShare when the Share meme button is clicked", async () => {
    // write this test first (red), then make it pass (green)
  })
})
`;
const AXE_DONE = `import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { axe } from "vitest-axe"
import MemeActions from "./MemeActions"

describe("MemeActions", () => {
  it("has no accessibility violations", async () => {
    const { container } = render(<MemeActions onDownload={() => {}} onShare={() => {}} />)
    expect(await axe(container)).toHaveNoViolations()
  })

  it("calls onShare when the Share meme button is clicked", async () => {
    const onShare = vi.fn()
    render(<MemeActions onDownload={() => {}} onShare={onShare} />)
    await userEvent.setup().click(screen.getByRole("button", { name: "Share meme" }))
    expect(onShare).toHaveBeenCalledTimes(1)
  })
})
`;

export const TESTING = {
  id: "testing",
  title: "Testing",
  blurb: "Learn how to write tests that make your apps more robust and less buggy.",
  concepts: ["Unit vs integration vs e2e", "Testing user interactions", "Mocking external services", "Code coverage", "Accessibility testing and TDD"],
  lessons: [
    { id: "test-welcome", title: "Welcome to the Testing Module", min: 8, kind: "lesson", body: [
      { t: "p", h: "Every time you change code, something you didn't touch can break. Clicking through the app by hand after each change doesn't scale. <b>Automated tests</b> are small programs that check your code still does what it should, in seconds, every time." },
      { t: "callout", kind: "key", h: "A good test describes <b>behaviour</b> the user cares about (\"typing updates the caption\"), not implementation details (\"state has a key called topText\"). Then you can refactor freely, and the tests only fail when something is actually broken." },
      { t: "video", name: "rtl" },
      { t: "p", h: "You'll use <b>Vitest</b> (a fast test runner built for Vite projects), <b>React Testing Library</b> (render components and query them the way users find things), <b>user-event</b> (realistic typing and clicking), <b>msw</b> (fake network responses) and <b>axe</b> (automatic accessibility checks)." },
      { t: "callout", kind: "tip", h: "How the challenges work: your tests run against the working app, where they must pass, and against copies of the app with a bug planted in each. A useful test fails when there's a bug. If your tests pass on a broken copy, they're not testing enough." },
      { t: "quiz", q: "Which test is more useful to keep?", opts: ["Checks that a component's state object has the key topText", "Checks that typing in the Top Text field shows the text on the meme", "Checks that the component file has 40 lines"], a: 1, why: "It describes what the user experiences, so it survives refactors and fails only when the feature breaks." },
    ]},

    { id: "test-what", title: "What we will test: Meme Generator", min: 10, kind: "lesson", body: [
      { t: "p", h: "We'll test the Meme Generator you built in the React module: a header, two caption inputs, a button that picks a random meme image from an API, and the meme itself. Open the <b>App</b> tab to use it, then run the one test that already exists." },
      { t: "tplay", task: "Run the tests. Then break the app on purpose: change the heading in <code>Header.jsx</code> and run them again. Watch the test catch it.", files: T({ "src/components/Header.test.jsx": HEADER_TEST_DONE }), tabs: ["src/components/Header.test.jsx", "src/components/Header.jsx", "src/components/Main.jsx", "src/utils/memeUtils.js"], autorun: true },
      { t: "h", h: "What's worth testing here?" },
      { t: "steps", items: ["<b>Pure functions</b> in <code>memeUtils.js</code>: easy, fast unit tests", "<b>Rendering</b>: the header, labelled inputs and default captions", "<b>Interactions</b>: typing updates the meme in capitals", "<b>Network</b>: the button shows a meme from the API, and errors are shown when the API fails", "<b>Accessibility</b>: no missing names or labels"] },
      { t: "diagram", name: "meme-tests" },
    ]},

    { id: "test-setup", title: "Set up the testing", min: 15, kind: "lesson", body: [
      { t: "p", h: "In a real Vite + React project, install the tools as dev dependencies and tell Vitest to use a simulated browser (jsdom)." },
      { t: "code", lang: "bash", code: `npm install -D vitest jsdom @testing-library/react @testing-library/user-event @testing-library/jest-dom
npm test        # runs vitest in watch mode: re-runs tests when you save` },
      { t: "code", lang: "javascript", code: VITE_CONFIG },
      { t: "p", h: "<code>setupTests.js</code> runs before each test file. Importing <code>@testing-library/jest-dom/vitest</code> adds DOM matchers like <code>toBeInTheDocument()</code> and <code>toHaveValue()</code>." },
      { t: "tplay", task: "This is the lab's version of the setup. Run the sanity test, then make it fail by changing the expected value: read the error message carefully.", files: { "vite.config.js": VITE_CONFIG, "package.json": PKG, "src/setupTests.js": SETUP, "src/sanity.test.js": `import { describe, it, expect } from "vitest"

describe("the test setup", () => {
  it("can do maths", () => {
    expect(1 + 1).toBe(2)
  })

  it("can find things in the DOM", () => {
    document.body.innerHTML = "<button>Click me</button>"
    expect(document.querySelector("button")).toBeInTheDocument()
  })
})
` }, tabs: ["src/sanity.test.js", "vite.config.js", "src/setupTests.js", "package.json"], autorun: true },
      { t: "callout", kind: "tip", h: "Test files live next to the code they test and end in <code>.test.js</code> or <code>.test.jsx</code>. Vitest finds them automatically." },
    ]},

    { id: "test-first", title: "Write your first test", min: 25, kind: "lesson", body: [
      { t: "p", h: "Start with <b>unit tests</b> for pure functions: same input, same output, no DOM, no network. Every test follows <b>Arrange, Act, Assert</b>: set up the input, call the code, check the result." },
      { t: "code", lang: "javascript", code: `import { describe, it, expect } from "vitest"
import { formatMemeText } from "./memeUtils"

describe("formatMemeText", () => {            // groups related tests
  it("uppercases the text", () => {           // one behaviour per test
    const result = formatMemeText("hello")    // arrange + act
    expect(result).toBe("HELLO")              // assert
  })
})` },
      { t: "p", h: "<code>toBe</code> compares with <code>Object.is</code>, which is right for strings and numbers. For objects and arrays use <code>toEqual</code>, which compares contents. <code>getRandomMeme</code> takes the random function as a parameter, which makes it testable: pass <code>() => 0</code> and you know exactly which meme you'll get." },
      { t: "tch", prompt: "Replace the <code>it.todo</code>s with real tests for <code>formatMemeText</code> and <code>getRandomMeme</code>. Your tests must pass on the real code and catch all four planted bugs.", files: T({ "src/utils/memeUtils.test.js": UTILS_TEST_START }), tabs: ["src/utils/memeUtils.test.js", "src/utils/memeUtils.js"], minTests: 4, solution: { "src/utils/memeUtils.test.js": UTILS_TEST_DONE }, mutants: [
        { bug: "formatMemeText doesn't trim spaces", files: MUT.utilsNoTrim },
        { bug: "formatMemeText forgets to uppercase", files: MUT.utilsNoUpper },
        { bug: "getRandomMeme uses Math.round, so it can go past the end", files: MUT.utilsRound },
        { bug: "getRandomMeme returns undefined for an empty list", files: MUT.utilsEmpty },
      ] },
      { t: "quiz", q: "Why does getRandomMeme accept a random function as a parameter?", opts: ["Math.random is slow", "So tests can pass a predictable function and know which meme comes back", "Because React requires it"], a: 1, why: "Injecting dependencies (randomness, time, network) makes code deterministic under test." },
    ]},

    { id: "test-practice", title: "Practice, practice, and practice", min: 30, kind: "lesson", body: [
      { t: "p", h: "Now components. <code>render()</code> puts a component into the test DOM, and <code>screen</code> finds things in it. Choose queries the way a user finds things, in this order of preference:" },
      { t: "steps", items: ["<code>getByRole(\"button\", { name: /save/i })</code>: what assistive tech sees. Your first choice.", "<code>getByLabelText(\"Email\")</code>: form fields, by their label", "<code>getByText(\"Welcome\")</code>: non-interactive text", "<code>getByAltText</code>, <code>getByPlaceholderText</code>, <code>getByDisplayValue</code>", "<code>getByTestId</code>: last resort, when nothing user-visible identifies it"] },
      { t: "callout", kind: "key", h: "<code>getBy…</code> throws if there's no match (or more than one). <code>queryBy…</code> returns <code>null</code>, for asserting something is <b>absent</b>. <code>findBy…</code> returns a promise and waits, for things that appear <b>later</b>." },
      { t: "code", lang: "jsx", code: `render(<Header />)
screen.getByRole("heading", { level: 1, name: "Meme Generator" })
expect(screen.queryByRole("alert")).not.toBeInTheDocument()` },
      { t: "tch", prompt: "Write component tests: in <code>Header.test.jsx</code>, check the level-1 heading and the logo's alt text; in <code>Main.test.jsx</code>, check that the <b>Top Text</b> and <b>Bottom Text</b> inputs (found by label) start with the default captions. Catch all four bugs.", files: T({ "src/components/Header.test.jsx": `import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import Header from "./Header"

describe("Header", () => {

})
`, "src/components/Main.test.jsx": `import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import Main from "./Main"

describe("Main", () => {

})
` }), tabs: ["src/components/Header.test.jsx", "src/components/Main.test.jsx", "src/components/Header.jsx", "src/components/Main.jsx"], minTests: 3, solution: { "src/components/Header.test.jsx": HEADER_TEST_DONE, "src/components/Main.test.jsx": MAIN_RENDER_TEST_DONE }, mutants: [
        { bug: "the logo has no alt text", files: MUT.headerNoAlt },
        { bug: "the title is an h2, so the page has no h1", files: MUT.headerTitle },
        { bug: "the top caption starts empty", files: MUT.mainNoDefault },
        { bug: "the Top Text input lost its label", files: MUT.mainNoLabel },
      ], checks: [{ msg: "Uses getByRole at least once", fn: (c) => /getByRole|findByRole/.test(c.src("src/components/Header.test.jsx") + c.src("src/components/Main.test.jsx")) }] },
    ]},

    { id: "test-interactions", title: "Test user interactions", min: 30, kind: "lesson", body: [
      { t: "p", h: "<b>user-event</b> simulates what a real user does: focusing, typing each character, clicking. Create a user with <code>userEvent.setup()</code> and <code>await</code> every action, because they're asynchronous." },
      { t: "code", lang: "jsx", code: `const user = userEvent.setup()
render(<Main />)
const input = screen.getByLabelText("Top Text")
await user.clear(input)          // the input starts with "One does not simply"
await user.type(input, "hello")
expect(screen.getByText("HELLO")).toBeInTheDocument()` },
      { t: "callout", kind: "warn", h: "<code>user.type</code> types at the end of what's already there. Forget <code>user.clear</code> and you'll get \"One does not simplyhello\"." },
      { t: "tch", prompt: "Test editing the captions: typing in <b>Top Text</b> shows it in capitals on the meme, and typing in <b>Bottom Text</b> changes only the bottom caption. Catch all three bugs.", files: T({ "src/components/Main.test.jsx": INTERACT_START }), tabs: ["src/components/Main.test.jsx", "src/components/Main.jsx"], minTests: 2, solution: { "src/components/Main.test.jsx": INTERACT_DONE }, mutants: [
        { bug: "every input updates the top caption", files: MUT.changeAlwaysTop },
        { bug: "the captions aren't shown in capitals", files: MUT.noFormat },
        { bug: "the Bottom Text input isn't wired up", files: MUT.bottomNotWired },
      ], checks: [{ msg: "Uses userEvent (not fireEvent)", fn: (c) => /userEvent|user\.(type|click)/.test(c.src("src/components/Main.test.jsx")) }] },
    ]},

    { id: "test-mock-setup", title: "Mock external services: Set up the tooling", min: 20, kind: "lesson", body: [
      { t: "p", h: "<code>Main</code> fetches memes when it mounts. Tests that hit a real API are slow, flaky (what if it's down?) and can't easily test errors. Instead, <b>mock</b> the network. <b>Mock Service Worker (msw)</b> intercepts <code>fetch</code> at the network level and answers with data you define, so your component code doesn't change at all." },
      { t: "code", lang: "bash", code: "npm install -D msw" },
      { t: "code", lang: "javascript", code: MSW_SETUP },
      { t: "steps", items: ["<code>http.get(url, resolver)</code> describes one fake endpoint", "<code>HttpResponse.json(data, { status })</code> builds the response", "<code>server.listen()</code> before all tests starts intercepting", "<code>server.use(…)</code> overrides a handler for one test (an error, say)", "<code>server.resetHandlers()</code> after each test removes those overrides", "<code>server.close()</code> after all tests stops intercepting"] },
      { t: "tplay", task: "Run the test. Then change the fake meme's URL in the handler and watch the test fail, because the component now shows different data.", files: T({ "src/components/Main.test.jsx": MSW_DONE.replace(MSW_TESTS, `describe("Main: memes from the API", () => {
  it("loads memes from the (fake) API", async () => {
    render(<Main />)
    const button = screen.getByRole("button", { name: /get a new meme image/i })
    expect(button).toBeDisabled()                        // nothing loaded yet
    await waitFor(() => expect(button).toBeEnabled())    // msw answered
    await userEvent.setup().click(button)
    expect(screen.getByRole("img", { name: "Meme" })).toHaveAttribute("src", testMemes[0].url)
  })
})
`) }), tabs: ["src/components/Main.test.jsx", "src/components/Main.jsx"], autorun: true },
      { t: "callout", kind: "tip", h: "In the real world, put handlers in <code>src/mocks/handlers.js</code> and the server in <code>src/mocks/server.js</code>, and start it from <code>setupTests.js</code> so every test file gets it. The same handlers can power a fake backend in the browser during development." },
    ]},

    { id: "test-mock-app", title: "Mock external services: test the app", min: 30, kind: "lesson", body: [
      { t: "p", h: "Data from a mocked request arrives <b>after</b> the first render. Wait for it with <code>findBy…</code> (waits until an element appears) or <code>waitFor(() => expect(…))</code> (retries an assertion until it passes, or times out after 1 second)." },
      { t: "video", name: "rtl" },
      { t: "tch", prompt: "Test the API behaviour: clicking <b>Get a new meme image</b> shows the mocked Drake image, and when the API responds with status 500 an error message (<code>role=\"alert\"</code>) appears. Catch both bugs.", files: T({ "src/components/Main.test.jsx": MSW_START }), tabs: ["src/components/Main.test.jsx", "src/components/Main.jsx"], minTests: 2, solution: { "src/components/Main.test.jsx": MSW_DONE }, mutants: [
        { bug: "the button doesn't change the image", files: MUT.buttonNoop },
        { bug: "API errors are swallowed silently", files: MUT.noErrorMessage },
      ], checks: [{ msg: "Overrides a handler with server.use() for the error case", fn: (c) => /server\.use\(/.test(c.src("src/components/Main.test.jsx")) }] },
      { t: "quiz", q: "After clicking a button, the app fetches data and then shows a list. Which query should find the list?", opts: ["getByRole, straight away", "findByRole, which waits for it to appear", "queryByRole, which returns null"], a: 1, why: "The list appears asynchronously. findBy… polls until it appears, or fails after its timeout." },
    ]},

    { id: "test-coverage", title: "View code coverage", min: 20, kind: "lesson", body: [
      { t: "p", h: "<b>Code coverage</b> measures which parts of your code ran during the tests. <code>vitest run --coverage</code> reports the percentage of <b>statements</b>, <b>branches</b>, <b>functions</b> and <b>lines</b> covered, and which lines never ran." },
      { t: "code", lang: "bash", code: `npm install -D @vitest/coverage-v8
npx vitest run --coverage` },
      { t: "tplay", task: "Run with coverage on (it's ticked). Which function in <code>Main.jsx</code> never ran? Look at the uncovered line numbers and think about which test would reach them.", files: T({ "src/components/Main.test.jsx": COVERAGE_START }), tabs: ["src/components/Main.test.jsx", "src/components/Main.jsx"], coverage: true, autorun: true },
      { t: "callout", kind: "warn", h: "Coverage tells you what's <b>untested</b>, not what's <b>well tested</b>. A test with no assertions can reach 100%. Use it to find gaps, not as a target to game. Many teams aim for around 80% and focus on critical paths." },
      { t: "tch", prompt: "Bring <code>Main.jsx</code> to <b>100% function coverage</b> and at least <b>95% statement coverage</b>: cover typing, the button, and the error path. Your tests must still catch the bugs.", coverage: true, files: T({ "src/components/Main.test.jsx": COVERAGE_START }), tabs: ["src/components/Main.test.jsx", "src/components/Main.jsx"], minTests: 3, solution: { "src/components/Main.test.jsx": COVERAGE_DONE }, mutants: [
        { bug: "the button doesn't change the image", files: MUT.buttonNoop },
        { bug: "API errors are swallowed silently", files: MUT.noErrorMessage },
        { bug: "every input updates the top caption", files: MUT.changeAlwaysTop },
      ], checks: [
        { msg: "Main.jsx: 100% of functions covered", fn: (c) => { const r = c.cov("src/components/Main.jsx"); return r && r.f[1] > 0 && r.f[0] === r.f[1]; } },
        { msg: "Main.jsx: at least 95% of statements covered", fn: (c) => { const r = c.cov("src/components/Main.jsx"); return r && r.s[0] / r.s[1] >= 0.95; } },
      ] },
    ]},

    { id: "test-a11y", title: "Accessibility testing with a side of TDD", min: 30, kind: "lesson", body: [
      { t: "p", h: "<b>axe</b> scans rendered HTML for common accessibility problems: images without alt text, buttons and links without names, inputs without labels. <code>vitest-axe</code> runs it inside your tests, so regressions fail the build." },
      { t: "code", lang: "jsx", code: `import { axe } from "vitest-axe"
const { container } = render(<MemeActions />)
expect(await axe(container)).toHaveNoViolations()` },
      { t: "p", h: "<b>Test-driven development (TDD)</b> flips the order: write a failing test for the behaviour you want (<b>red</b>), write the simplest code that passes (<b>green</b>), then tidy up (<b>refactor</b>). It forces you to define \"done\" before you start." },
      { t: "callout", kind: "warn", h: "Automated tools catch roughly a third of accessibility issues. They can't judge whether alt text is meaningful or whether a flow makes sense with a keyboard. Keep testing manually too." },
      { t: "tch", prompt: "TDD time. <code>MemeActions</code> has two icon-only buttons. First write the tests (red): no axe violations, and clicking <b>Share meme</b> calls <code>onShare</code>. Then fix the component (green): give the buttons accessible names <code>\"Download meme\"</code> and <code>\"Share meme\"</code> and wire up <code>onShare</code>.", files: { ...APP, "src/components/MemeActions.jsx": ACTIONS_BROKEN, "src/components/MemeActions.test.jsx": AXE_START }, tabs: ["src/components/MemeActions.test.jsx", "src/components/MemeActions.jsx"], minTests: 2, passMsg: "Your tests pass on your fixed component", solution: { "src/components/MemeActions.test.jsx": AXE_DONE, "src/components/MemeActions.jsx": ACTIONS_FIXED }, mutants: [
        { bug: "the original component: icon buttons with no names", files: { "src/components/MemeActions.jsx": ACTIONS_BROKEN } },
        { bug: "named buttons, but Share does nothing", files: { "src/components/MemeActions.jsx": ACTIONS_NAMED_NO_SHARE } },
      ], checks: [{ msg: "Runs axe in a test", fn: (c) => /axe\(/.test(c.src("src/components/MemeActions.test.jsx")) && /toHaveNoViolations/.test(c.src("src/components/MemeActions.test.jsx")) }] },
    ]},

    { id: "test-types", title: "Types of testing", min: 15, kind: "lesson", body: [
      { t: "diagram", name: "testing-trophy" },
      { t: "steps", items: ["<b>Static analysis</b>: TypeScript and ESLint catch typos and type errors as you type", "<b>Unit tests</b>: one function or component in isolation. Fast and precise", "<b>Integration tests</b>: several units together, like a component with its children and a mocked API. Most of this module", "<b>End-to-end (e2e) tests</b>: a real browser drives the real app, often with Playwright or Cypress. Slowest, most realistic", "<b>Manual and exploratory testing</b>: people find what nobody thought to automate"] },
      { t: "code", lang: "javascript", code: `// An end-to-end test with Playwright: a real browser, the real app
import { test, expect } from "@playwright/test"

test("make a meme", async ({ page }) => {
  await page.goto("http://localhost:5173")
  await page.getByLabel("Top Text").fill("hello")
  await expect(page.getByText("HELLO")).toBeVisible()
})` },
      { t: "p", h: "Notice the queries look just like Testing Library's. Favour <b>integration tests</b> for confidence per minute, a few <b>e2e tests</b> for your most important journeys (sign-up, checkout), and <b>unit tests</b> for tricky logic." },
      { t: "quiz", q: "Your checkout flow depends on a payment page, a cart and an API. What gives the most confidence that a real customer can pay?", opts: ["A unit test of the price formatter", "An end-to-end test that goes through checkout in a browser", "100% statement coverage"], a: 1, why: "Only an e2e test exercises the whole journey as a user would. Keep a few for critical paths." },
      { t: "quiz", q: "A test only fails when you rename an internal variable. What kind of problem is that?", opts: ["It's testing implementation details", "It's a flaky test", "It's an e2e test"], a: 0, why: "Tests coupled to internals break on harmless refactors. Test behaviour through the UI or public API instead." },
    ]},

    { id: "test-done", title: "Congratulations!", min: 5, kind: "lesson", body: [
      { t: "p", h: "You can now prove your code works and keep it working: unit tests for logic, component tests with Testing Library, realistic interactions with user-event, a mocked network with msw, coverage to find gaps, accessibility checks with axe, and TDD to define done before you start." },
      { t: "recap", items: ["Arrange, act, assert; one behaviour per test", "Query like a user: getByRole first, getByTestId last", "getBy (now), queryBy (absent), findBy (later)", "userEvent.setup() and await every action", "msw: fake the network, override per test with server.use", "Coverage finds gaps; it doesn't prove quality", "axe in tests catches common a11y bugs; TDD: red, green, refactor", "A good test fails when there's a bug"] },
    ]},
  ],
};
