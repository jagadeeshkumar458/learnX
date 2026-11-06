/* Grading for the interview coach.
   Rubric grading runs entirely in the browser. Optional AI grading calls Claude with the
   learner's own API key (stored only in their browser). */

const norm = (s) => " " + String(s || "").toLowerCase().replace(/[’‘]/g, "'").replace(/\s+/g, " ") + " ";
const hits = (text, k) => k.filter((src) => { try { return new RegExp(src, "i").test(text); } catch { return false; } });
const pointMet = (text, p) => (p.min ? hits(text, p.k).length >= p.min : hits(text, p.k).length > 0);

export function verdictOf(score) {
  return score >= 80 ? "strong" : score >= 50 ? "partial" : "weak";
}

/* Concept questions: which rubric points does the answer cover? */
export function gradeConcept(q, answer, already = []) {
  const text = norm(answer);
  const words = answer.trim().split(/\s+/).filter(Boolean).length;
  const core = q.points.filter((p) => !p.bonus), bonus = q.points.filter((p) => p.bonus);
  const covered = q.points.filter((p) => already.includes(p.c) || pointMet(text, p));
  const coveredCore = core.filter((p) => covered.includes(p));
  const coveredBonus = bonus.filter((p) => covered.includes(p));
  const wrong = (q.wrong || []).filter((w) => hits(text, w.k).length);
  let score = Math.round((coveredCore.length / core.length) * 100 + coveredBonus.length * 8 - wrong.length * 15);
  if (words < 4 && !already.length) score = Math.min(score, 40);
  score = Math.max(0, Math.min(100, score));
  const missing = core.filter((p) => !covered.includes(p));
  const probe = missing.find((p) => p.ask);
  return {
    score, verdict: verdictOf(score), graded: "rubric",
    covered: covered.map((p) => p.c), missing: missing.map((p) => p.c), wrong: wrong.map((w) => w.fb),
    tooShort: words < 4,
    followup: probe ? probe.ask : null,
    feedback: summary(score, coveredCore.length, core.length, wrong.length, words),
  };
}

function summary(score, got, total, wrongN, words) {
  if (words === 0) return "No answer given. In a real interview, talk through what you do know; partial reasoning still earns credit.";
  if (words < 4) return "That answer is too short. Interviewers want to hear your reasoning, so explain the why, not just the what.";
  if (wrongN) return "There's a misconception in your answer. Fix that first, because an interviewer will notice it before anything else.";
  if (score >= 90) return "Excellent. You covered every key point clearly, which is exactly what interviewers listen for.";
  if (score >= 80) return "Strong answer. You hit the essentials; adding the extra detail below would make it stand out.";
  if (score >= 50) return `Good start. You covered ${got} of ${total} key points; the missing ones are below.`;
  return `This needs more depth. You covered ${got} of ${total} key points. Review the model answer and the lesson.`;
}

/* Predict-the-output questions: exact answer match. */
export function gradeOutput(q, answer) {
  const a = String(answer || "").trim().replace(/;$/, "").toLowerCase();
  const ok = q.answer.some((src) => new RegExp(src, "i").test(a));
  return { score: ok ? 100 : 0, verdict: ok ? "strong" : "weak", graded: "exact", covered: ok ? ["Correct output"] : [], missing: ok ? [] : ["The correct output"], wrong: [], feedback: ok ? "Correct." : "Not quite. Here's what actually happens." };
}

/* Coding questions: run the learner's function against tests. */
export function gradeCode(q, code) {
  let f, error = "";
  try {
    f = new Function(`"use strict";\n${code}\n;return typeof ${q.fn} === "function" ? ${q.fn} : undefined;`)();
    if (typeof f !== "function") error = `Define a function named ${q.fn}.`;
  } catch (e) { error = `${e.name}: ${e.message}`; }
  const results = q.tests.map((t) => { if (typeof f !== "function") return false; try { return !!t.fn(f); } catch (e) { error = error || `${e.name}: ${e.message}`; return false; } });
  const passed = results.filter(Boolean).length;
  const score = Math.round((passed / q.tests.length) * 100);
  return {
    score, verdict: verdictOf(score), graded: "tests", results, error,
    covered: q.tests.filter((_, i) => results[i]).map((t) => t.msg), missing: q.tests.filter((_, i) => !results[i]).map((t) => t.msg), wrong: [],
    feedback: score === 100 ? "All tests pass. Nice, clean solution." : error ? `Your code threw an error: ${error}` : `${passed} of ${q.tests.length} tests pass. Check the failing cases below.`,
  };
}

/* Optional: ask Claude to grade a concept answer. Falls back to rubric grading on any failure. */
export async function gradeWithAI(q, answer, { key, model }) {
  const rubric = q.points.map((p) => `- ${p.c}${p.bonus ? " (bonus)" : ""}`).join("\n");
  const prompt = `Interview question: ${q.q}

Key points a strong answer covers:
${rubric}

Model answer: ${q.model}

Candidate's answer:
"""${answer}"""

Grade the candidate's answer. Judge meaning, not keywords: accept correct ideas in any wording, and flag anything technically wrong. Reply with JSON only, no prose, in exactly this shape:
{"score": <0-100>, "covered": [<key points the candidate covered, short>], "missing": [<key points missing, short>], "wrong": [<technically incorrect statements, with the correction>], "feedback": "<2-3 sentences of direct, encouraging, specific feedback addressed to the candidate>", "followup": <one short follow-up question probing the most important gap, or null if the answer was strong>}`;
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" },
    body: JSON.stringify({
      model, max_tokens: 700,
      system: "You are a fair, senior software engineering interviewer grading answers for a junior-to-mid level candidate. You are precise about technical correctness and generous about wording.",
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try { const j = await res.json(); msg = j.error?.message || msg; } catch { /* ignore */ }
    throw new Error(msg);
  }
  const data = await res.json();
  const text = (data.content || []).map((c) => c.text || "").join("");
  const json = JSON.parse(text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1));
  const score = Math.max(0, Math.min(100, Math.round(Number(json.score) || 0)));
  return {
    score, verdict: verdictOf(score), graded: "ai",
    covered: json.covered || [], missing: json.missing || [], wrong: json.wrong || [],
    feedback: json.feedback || "", followup: json.followup || null,
  };
}
