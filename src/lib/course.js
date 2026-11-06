import { COURSE } from "../data/course.js";

export { COURSE };
export const ALL = [];
COURSE.modules.forEach((m, mi) =>
  m.lessons.forEach((l, li) => {
    l.mod = m; l.mi = mi; l.li = li; l.live = !!l.body;
    ALL.push(l);
  })
);
export const LIVE = ALL.filter((l) => l.live);
export const byId = Object.fromEntries(ALL.map((l) => [l.id, l]));
export const pad = (n) => String(n).padStart(2, "0");
export const minutes = (m) => m.lessons.reduce((a, l) => a + l.min, 0);
