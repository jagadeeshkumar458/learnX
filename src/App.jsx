import React, { useEffect, useState } from "react";
import { COURSES, byId, courseById } from "./lib/course.js";
import { useProgress, level } from "./lib/progress.jsx";
import Rail, { BrandMark } from "./components/Rail.jsx";
import CoursePage, { Catalog } from "./components/Home.jsx";
import Lesson from "./components/Lesson.jsx";
import Palette from "./components/Palette.jsx";

function useHash() {
  const [hash, setHash] = useState(() => location.hash.slice(1));
  useEffect(() => {
    const on = () => setHash(location.hash.slice(1));
    addEventListener("hashchange", on);
    return () => removeEventListener("hashchange", on);
  }, []);
  return hash;
}

export default function App() {
  const hash = useHash();
  const { S } = useProgress();
  const [drawer, setDrawer] = useState(false);
  const [palette, setPalette] = useState(false);
  const lesson = byId[hash];
  const pageCourse = hash.startsWith("c-") ? courseById[hash.slice(2)] : null;
  const [railCourse, setRailCourse] = useState(() => (byId[S.lastLesson] || {}).course || COURSES[0]);
  const active = lesson ? lesson.course : pageCourse || railCourse;
  useEffect(() => { if (active !== railCourse) setRailCourse(active); }, [active]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { setDrawer(false); scrollTo(0, 0); }, [hash]);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setPalette(true); }
      if (e.altKey && (e.key === "ArrowRight" || e.key === "ArrowLeft")) {
        const l = byId[location.hash.slice(1)];
        if (!l) return;
        const all = l.course.all;
        const n = all[all.indexOf(l) + (e.key === "ArrowRight" ? 1 : -1)];
        if (n) location.hash = n.id;
      }
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className={"app" + (drawer ? " drawer" : "")}>
      <Rail current={hash} course={active} onCourse={(c) => { setRailCourse(c); location.hash = "c-" + c.id; }} onSearch={() => setPalette(true)} />
      {drawer && <div className="scrim" onClick={() => setDrawer(false)} />}
      <div className="main">
        <div className="topbar">
          <button className="ghost" aria-label="Open course outline" onClick={() => setDrawer(true)}>☰</button>
          <a className="brand" href="#home"><BrandMark />Shipyard</a>
          <span className="xp">{S.xp} XP · Lv {level(S.xp)}</span>
        </div>
        {lesson && <ReadBar key={hash} />}
        <div className="wrap">
          {lesson ? <Lesson key={lesson.id} lesson={lesson} />
            : pageCourse ? <CoursePage key={pageCourse.id} course={pageCourse} onSearch={() => setPalette(true)} />
            : <Catalog onSearch={() => setPalette(true)} />}
        </div>
      </div>
      {palette && <Palette onClose={() => setPalette(false)} />}
    </div>
  );
}

function ReadBar() {
  const [w, setW] = useState(0);
  useEffect(() => {
    const on = () => {
      const h = document.documentElement.scrollHeight - innerHeight;
      setW(h > 0 ? (scrollY / h) * 100 : 0);
    };
    addEventListener("scroll", on, { passive: true });
    return () => removeEventListener("scroll", on);
  }, []);
  return <div className="progress-top"><span style={{ width: w + "%" }} /></div>;
}
