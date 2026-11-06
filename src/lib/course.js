import { COURSE } from "../data/course.js";
import { AI_COURSE } from "../data/ai-course.js";

export { COURSE };
export const COURSES = [COURSE, AI_COURSE];
export const courseById = Object.fromEntries(COURSES.map((c) => [c.id, c]));

export const ALL = [];
COURSES.forEach((c) => {
  c.all = [];
  c.modules.forEach((m, mi) => {
    m.course = c;
    m.lessons.forEach((l, li) => {
      Object.assign(l, { mod: m, course: c, mi, li, live: !!l.body });
      c.all.push(l);
      ALL.push(l);
    });
  });
  c.live = c.all.filter((l) => l.live);
  c.topics = c.all.reduce((a, l) => a + (l.topics ? l.topics.length : 0), 0);
  c.minutes = c.all.reduce((a, l) => a + l.min, 0);
});
export const LIVE = ALL.filter((l) => l.live);
export const byId = Object.fromEntries(ALL.map((l) => [l.id, l]));
export const pad = (n) => String(n).padStart(2, "0");
export const minutes = (m) => m.lessons.reduce((a, l) => a + l.min, 0);
