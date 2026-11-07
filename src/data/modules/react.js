/* Module — React.js Fundamentals. Lesson titles match the syllabus so the topic lists attach. */
import { REACT_A } from "./react-a.js";
import { REACT_B } from "./react-b.js";
import { REACT_C } from "./react-c.js";

export const REACT = {
  id: "react",
  title: "React.js Fundamentals",
  blurb: "Learn the most popular framework for building user interfaces.",
  concepts: ["Components and JSX", "Props and rendering lists", "State with useState", "Forms and form actions", "Effects with useEffect", "Conditional rendering"],
  lessons: [...REACT_A, ...REACT_B, ...REACT_C],
};
