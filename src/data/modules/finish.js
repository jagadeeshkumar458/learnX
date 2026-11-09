/* Module — What to Learn Next. */
export const FINISH = {
  id: "finish",
  title: "What to Learn Next",
  blurb: "Plan your next steps and claim your certificate.",
  concepts: ["Specialising: frontend, backend, AI", "Open source contributions", "Showcasing your certificate"],
  lessons: [
    { id: "fin-next", title: "What to Learn Next", min: 15, kind: "lesson", body: [
      { t: "p", h: "You've gone from your first HTML tag to full-stack apps with React, Node, SQL, TypeScript, Next.js and AI. The best next step is to <b>build</b>: pick a real problem you or someone you know has, and ship a solution. Then go deeper in one direction." },
      { t: "steps", items: ["<b>Frontend</b>: design systems, advanced CSS and animation, performance, accessibility audits, React Native for mobile", "<b>Backend</b>: databases in depth (indexes, transactions), authentication, queues, Docker and cloud deployment", "<b>AI engineering</b>: the <b>AI Engineer Path</b> on this platform: evals, agents, MCP, fine-tuning and production AI apps", "<b>Open source</b>: start with documentation fixes and 'good first issue' labels on tools you already use"] },
      { t: "callout", kind: "tip", h: "Learning sticks when you teach it. Write a short post about one thing from each module, or explain it to a friend. Your future interviewers will love it." },
      { t: "quiz", q: "You finished the path. What's the most valuable next step?", opts: ["Start another course immediately", "Build and ship a real project for a real user, then go deeper in one area", "Memorise more syntax"], a: 1, why: "Real projects expose gaps, create portfolio stories and teach what courses can't." },
    ]},
    { id: "fin-cert-use", title: "How to Utilize Your Certificate", min: 8, kind: "lesson", body: [
      { t: "p", h: "A certificate shows commitment, but it isn't the thing that gets you hired: your projects are. Use it to back up the story you tell with your work." },
      { t: "steps", items: ["Add it to LinkedIn under <b>Licenses &amp; certifications</b>", "Mention the path in your CV's education section, with two or three projects you built along the way", "Post about finishing it, with what you built and what you'd do next. Posts like that start conversations with recruiters"] },
    ]},
    { id: "fin-cert", title: "Certificate of Completion", min: 5, kind: "lesson", body: [
      { t: "p", h: "Congratulations on reaching the end of the Fullstack Developer Path! 🎉" },
      { t: "widget", name: "certificate" },
    ]},
  ],
};
