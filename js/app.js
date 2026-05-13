(function () {
const { useState, useEffect, useMemo } = React;

// Constants & helpers ----------------------------------------------------
const STORAGE_KEY = "algviz.studyCompanion.v1";
const VIEWS = ["study", "visualizer", "glossary", "practice", "exam", "progress"];

function txt(value, lang) {
  if (!value || typeof value !== "object") return value || "";
  return value[lang] || value.no || value.en || "";
}

function readStoredState() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    return {
      lang: parsed.lang === "en" ? "en" : "no",
      theme: parsed.theme === "night" ? "night" : "paper",
      progress: {
        completedLectures: parsed.progress?.completedLectures || [],
        masteredGoals: parsed.progress?.masteredGoals || [],
        quizAttempts: parsed.progress?.quizAttempts || {},
        completedExamTasks: parsed.progress?.completedExamTasks || [],
      },
    };
  } catch {
    return {
      lang: "no", theme: "paper",
      progress: { completedLectures: [], masteredGoals: [], quizAttempts: {}, completedExamTasks: [] },
    };
  }
}

function parseHash() {
  const raw = window.location.hash.replace(/^#\/?/, "");
  const [view, detail] = raw.split("/");
  return {
    view: VIEWS.includes(view) ? view : "study",
    detail: detail || null,
  };
}

function go(view, detail) {
  const next = detail ? `#/${view}/${detail}` : `#/${view}`;
  if (window.location.hash === next) {
    window.dispatchEvent(new Event("hashchange"));
  } else {
    window.location.hash = next;
  }
}

function asSet(items) { return new Set(items || []); }
function toggleList(items, item) {
  const next = asSet(items);
  if (next.has(item)) next.delete(item); else next.add(item);
  return [...next];
}
function goalCount(lectures) {
  return lectures.reduce((sum, l) => sum + l.learningGoals.length, 0);
}

// Expose helpers to other view files
window.AlgViz = window.AlgViz || {};
Object.assign(window.AlgViz, {
  txt, go, parseHash, asSet, toggleList, goalCount, VIEWS, STORAGE_KEY,
});

// App shell --------------------------------------------------------------
function App() {
  const algorithms = window.AlgViz.ALGORITHMS;
  const course = window.AlgViz.COURSE;
  const stored = useMemo(readStoredState, []);
  const [route, setRoute] = useState(parseHash);
  const [lang, setLang] = useState(stored.lang);
  const [theme, setTheme] = useState(stored.theme);
  const [progress, setProgress] = useState(stored.progress);

  useEffect(() => {
    const handler = () => setRoute(parseHash());
    window.addEventListener("hashchange", handler);
    if (!window.location.hash) go("study", "l01");
    return () => window.removeEventListener("hashchange", handler);
  }, []);

  useEffect(() => { document.documentElement.dataset.theme = theme; }, [theme]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ lang, theme, progress }));
  }, [lang, theme, progress]);

  const completedSet = useMemo(() => asSet(progress.completedLectures), [progress.completedLectures]);
  const masteredSet = useMemo(() => asSet(progress.masteredGoals), [progress.masteredGoals]);
  const examDoneSet = useMemo(() => asSet(progress.completedExamTasks), [progress.completedExamTasks]);

  const updateLectureComplete = (id) => setProgress((p) => ({ ...p, completedLectures: toggleList(p.completedLectures, id) }));
  const updateGoalMastered = (id) => setProgress((p) => ({ ...p, masteredGoals: toggleList(p.masteredGoals, id) }));
  const updateExamTaskComplete = (id) => setProgress((p) => ({ ...p, completedExamTasks: toggleList(p.completedExamTasks, id) }));
  const recordQuiz = (quizId, correct) => setProgress((prev) => {
    const prior = prev.quizAttempts[quizId] || { total: 0, correct: 0 };
    return {
      ...prev,
      quizAttempts: {
        ...prev.quizAttempts,
        [quizId]: {
          total: prior.total + 1,
          correct: prior.correct + (correct ? 1 : 0),
          lastCorrect: correct,
        },
      },
    };
  });
  const resetProgress = () => setProgress({ completedLectures: [], masteredGoals: [], quizAttempts: {}, completedExamTasks: [] });

  const common = {
    algorithms, course, lang, theme, progress, completedSet, masteredSet, examDoneSet,
    onLang: setLang, onTheme: setTheme,
    onLectureComplete: updateLectureComplete,
    onGoalMastered: updateGoalMastered,
    onExamTaskComplete: updateExamTaskComplete,
    onQuiz: recordQuiz, onResetProgress: resetProgress,
  };

  let body;
  if (route.view === "visualizer") {
    body = <window.AlgViz.VisualizerPage {...common} requestedAlgoId={route.detail} />;
  } else if (route.view === "glossary") {
    body = <window.AlgViz.GlossaryView {...common} />;
  } else if (route.view === "practice") {
    body = <window.AlgViz.PracticeView {...common} />;
  } else if (route.view === "exam") {
    body = <window.AlgViz.ExamView {...common} selectedExamId={route.detail} />;
  } else if (route.view === "progress") {
    body = <window.AlgViz.ProgressView {...common} />;
  } else {
    const lectureId = course.byId.lectures[route.detail] ? route.detail : "l01";
    body = <window.AlgViz.StudyView {...common} selectedLectureId={lectureId} />;
  }

  return (
    <div className="app-shell">
      <window.AlgViz.AppHeader
        course={course} lang={lang} theme={theme} view={route.view}
        onLang={setLang} onTheme={setTheme}
      />
      {body}
    </div>
  );
}

// Boot once all view modules have registered themselves on window.AlgViz
function boot() {
  ReactDOM.createRoot(document.getElementById("root")).render(<App />);
}
window.AlgViz.boot = boot;
})();
