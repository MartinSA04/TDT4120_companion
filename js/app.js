/* global React, ReactDOM, window, document, localStorage */
(function () {
const { useState, useEffect, useRef, useMemo, useCallback } = React;

const STORAGE_KEY = "algviz.studyCompanion.v1";
const VIEWS = ["study", "visualizer", "glossary", "practice", "progress"];

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
      },
    };
  } catch {
    return {
      lang: "no",
      theme: "paper",
      progress: { completedLectures: [], masteredGoals: [], quizAttempts: {} },
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

function goalCount(lectures) {
  return lectures.reduce((sum, lecture) => sum + lecture.learningGoals.length, 0);
}

function asSet(items) {
  return new Set(items || []);
}

function toggleList(items, item) {
  const next = asSet(items);
  if (next.has(item)) next.delete(item);
  else next.add(item);
  return [...next];
}

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

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ lang, theme, progress }));
  }, [lang, theme, progress]);

  const completedSet = useMemo(
    () => asSet(progress.completedLectures),
    [progress.completedLectures]
  );
  const masteredSet = useMemo(
    () => asSet(progress.masteredGoals),
    [progress.masteredGoals]
  );

  const updateLectureComplete = (lectureId) => {
    setProgress((prev) => ({
      ...prev,
      completedLectures: toggleList(prev.completedLectures, lectureId),
    }));
  };

  const updateGoalMastered = (goalId) => {
    setProgress((prev) => ({
      ...prev,
      masteredGoals: toggleList(prev.masteredGoals, goalId),
    }));
  };

  const recordQuiz = (quizId, correct) => {
    setProgress((prev) => {
      const prevAttempt = prev.quizAttempts[quizId] || { total: 0, correct: 0 };
      return {
        ...prev,
        quizAttempts: {
          ...prev.quizAttempts,
          [quizId]: {
            total: prevAttempt.total + 1,
            correct: prevAttempt.correct + (correct ? 1 : 0),
            lastCorrect: correct,
          },
        },
      };
    });
  };

  const resetProgress = () => {
    setProgress({ completedLectures: [], masteredGoals: [], quizAttempts: {} });
  };

  const common = {
    algorithms,
    course,
    lang,
    theme,
    progress,
    completedSet,
    masteredSet,
    onLang: setLang,
    onTheme: setTheme,
    onLectureComplete: updateLectureComplete,
    onGoalMastered: updateGoalMastered,
    onQuiz: recordQuiz,
    onResetProgress: resetProgress,
  };

  let body;
  if (route.view === "visualizer") {
    body = <VisualizerPage {...common} requestedAlgoId={route.detail} />;
  } else if (route.view === "glossary") {
    body = <GlossaryView {...common} />;
  } else if (route.view === "practice") {
    body = <PracticeView {...common} />;
  } else if (route.view === "progress") {
    body = <ProgressView {...common} />;
  } else {
    const lectureId = course.byId.lectures[route.detail] ? route.detail : "l01";
    body = <StudyView {...common} selectedLectureId={lectureId} />;
  }

  return (
    <div className="app-shell">
      <AppHeader
        course={course}
        lang={lang}
        theme={theme}
        view={route.view}
        onLang={setLang}
        onTheme={setTheme}
      />
      {body}
    </div>
  );
}

function AppHeader({ course, lang, theme, view, onLang, onTheme }) {
  const labels = {
    study: txt({ no: "Studie", en: "Study" }, lang),
    visualizer: txt({ no: "Visualisering", en: "Visualizer" }, lang),
    glossary: txt({ no: "Begreper", en: "Glossary" }, lang),
    practice: txt({ no: "Øving", en: "Practice" }, lang),
    progress: txt({ no: "Progresjon", en: "Progress" }, lang),
  };
  return (
    <header className="companion-header">
      <div className="companion-title">
        <span className="eyebrow">NTNU · TDT4120</span>
        <h1>{txt(course.title, lang)}</h1>
        <p>{txt(course.sourceNote, lang)}</p>
      </div>

      <nav className="app-nav" aria-label="Primary">
        {VIEWS.map((v) => (
          <button
            key={v}
            className={view === v ? "nav-tab active" : "nav-tab"}
            onClick={() => go(v, v === "study" ? "l01" : null)}
          >
            {labels[v]}
          </button>
        ))}
      </nav>

      <div className="header-controls">
        <Segmented
          label={txt({ no: "Språk", en: "Language" }, lang)}
          value={lang}
          options={[
            ["no", "NO"],
            ["en", "EN"],
          ]}
          onChange={onLang}
        />
        <Segmented
          label={txt({ no: "Tema", en: "Theme" }, lang)}
          value={theme}
          options={[
            ["paper", "Paper"],
            ["night", "Night"],
          ]}
          onChange={onTheme}
        />
      </div>
    </header>
  );
}

function Segmented({ label, value, options, onChange }) {
  return (
    <div className="segmented-wrap">
      <span className="eyebrow">{label}</span>
      <div className="segmented">
        {options.map(([id, name]) => (
          <button
            key={id}
            className={value === id ? "active" : ""}
            onClick={() => onChange(id)}
          >
            {name}
          </button>
        ))}
      </div>
    </div>
  );
}

function StudyView(props) {
  const {
    course, algorithms, lang, selectedLectureId,
    completedSet, masteredSet, progress,
    onLectureComplete, onGoalMastered, onQuiz,
  } = props;
  const lecture = course.byId.lectures[selectedLectureId];
  const concepts = lecture.conceptIds.map((id) => course.byId.glossary[id]).filter(Boolean);
  const relatedAlgorithms = lecture.algorithmIds
    .map((id) => algorithms.find((a) => a.id === id))
    .filter(Boolean);
  const planned = course.plannedTools.filter((tool) =>
    tool.lectureId === lecture.id &&
    !algorithms.some((algo) => algo.id === tool.id)
  );
  const quizzes = lecture.quizIds.map((id) => course.byId.quizzes[id]).filter(Boolean);
  const allGoals = lecture.learningGoals;
  const masteredInLecture = allGoals.filter((g) => masteredSet.has(g.id)).length;

  return (
    <main className="study-layout">
      <aside className="lecture-list">
        <div className="panel-heading">
          <span className="eyebrow">{txt({ no: "Forelesninger", en: "Lectures" }, lang)}</span>
          <span>{completedSet.size}/{course.lectures.length}</span>
        </div>
        {course.lectures.map((item) => {
          const done = completedSet.has(item.id);
          const active = item.id === lecture.id;
          return (
            <button
              key={item.id}
              className={active ? "lecture-row active" : "lecture-row"}
              onClick={() => go("study", item.id)}
            >
              <span className="lecture-no">{String(item.number).padStart(2, "0")}</span>
              <span>
                <strong>{txt(item.title, lang)}</strong>
                <small>{item.learningGoals.length} goals · {item.curriculumRefs[0]}</small>
              </span>
              <span className={done ? "status-dot done" : "status-dot"} />
            </button>
          );
        })}
      </aside>

      <section className="lecture-detail">
        <div className="lecture-hero">
          <div>
            <span className="eyebrow">Forelesning {lecture.number}</span>
            <h2>{txt(lecture.title, lang)}</h2>
            <p>{txt(lecture.summary, lang)}</p>
          </div>
          <div className="hero-actions">
            <button className="primary-action" onClick={() => onLectureComplete(lecture.id)}>
              {completedSet.has(lecture.id)
                ? txt({ no: "Marker som ikke ferdig", en: "Mark unfinished" }, lang)
                : txt({ no: "Marker forelesning ferdig", en: "Mark lecture complete" }, lang)}
            </button>
            <span className="mono-progress">
              {masteredInLecture}/{allGoals.length} {txt({ no: "mål mestret", en: "goals mastered" }, lang)}
            </span>
          </div>
        </div>

        <div className="content-grid two">
          <InfoPanel title={txt({ no: "Pensum", en: "Curriculum" }, lang)}>
            <div className="tag-list">
              {lecture.curriculumRefs.map((ref) => <span key={ref} className="tag">{ref}</span>)}
            </div>
          </InfoPanel>
          <InfoPanel title={txt({ no: "Ukens snubletråd", en: "Common pitfall" }, lang)}>
            <p className="compact-copy">{txt(lecture.pitfall, lang)}</p>
          </InfoPanel>
        </div>

        <InfoPanel title={txt({ no: "Læringsmål", en: "Learning goals" }, lang)}>
          <div className="goal-grid">
            {allGoals.map((goal) => (
              <button
                key={goal.id}
                className={masteredSet.has(goal.id) ? "goal-card mastered" : "goal-card"}
                onClick={() => onGoalMastered(goal.id)}
              >
                <span>
                  <strong>{goal.focus ? "! " : ""}{goal.id}</strong>
                  {txt(goal.text, lang)}
                </span>
                <span className="goal-check">{masteredSet.has(goal.id) ? "✓" : "○"}</span>
              </button>
            ))}
          </div>
        </InfoPanel>

        <div className="content-grid two">
          <InfoPanel title={txt({ no: "Forklar det", en: "Explain it" }, lang)}>
            <div className="concept-stack">
              {concepts.map((concept) => (
                <ConceptCard key={concept.id} concept={concept} lang={lang} compact />
              ))}
            </div>
          </InfoPanel>

          <InfoPanel title={txt({ no: "Verktøy", en: "Tools" }, lang)}>
            <div className="tool-stack">
              {relatedAlgorithms.map((algo) => (
                <button
                  key={algo.id}
                  className="tool-link live"
                  onClick={() => go("visualizer", algo.id)}
                >
                  <span>{algo.name}</span>
                  <small>{txt({ no: "Åpne visualisering", en: "Open visualization" }, lang)}</small>
                </button>
              ))}
              {planned.map((tool) => (
                <div key={tool.id} className="tool-link planned">
                  <span>{txt(tool.title, lang)}</span>
                  <small>{txt({ no: "Planlagt visualisering", en: "Planned visualization" }, lang)}</small>
                </div>
              ))}
              {relatedAlgorithms.length === 0 && planned.length === 0 && (
                <p className="muted">{txt({ no: "Ingen koblede verktøy ennå.", en: "No linked tools yet." }, lang)}</p>
              )}
            </div>
          </InfoPanel>
        </div>

        <InfoPanel title={txt({ no: "Sjekk deg selv", en: "Self-test" }, lang)}>
          {quizzes.map((quiz) => (
            <QuizCard
              key={quiz.id}
              quiz={quiz}
              lang={lang}
              attempt={progress.quizAttempts[quiz.id]}
              onAnswer={onQuiz}
            />
          ))}
        </InfoPanel>
      </section>
    </main>
  );
}

function InfoPanel({ title, children }) {
  return (
    <section className="study-panel">
      <div className="panel-heading">
        <span className="eyebrow">{title}</span>
      </div>
      {children}
    </section>
  );
}

function ConceptCard({ concept, lang, compact }) {
  const [open, setOpen] = useState(!compact);
  return (
    <article className={compact ? "concept-card compact" : "concept-card"}>
      <button className="concept-head" onClick={() => setOpen((v) => !v)}>
        <span>
          <strong>{txt(concept.term, lang)}</strong>
          <small>{concept.english}</small>
        </span>
        <span>{open ? "−" : "+"}</span>
      </button>
      {open && <p>{txt(concept.explanation, lang)}</p>}
    </article>
  );
}

function QuizCard({ quiz, lang, attempt, onAnswer }) {
  const [choice, setChoice] = useState(null);
  const answered = choice !== null;
  const correct = answered && choice === quiz.correct;
  const choose = (idx) => {
    if (answered) return;
    setChoice(idx);
    onAnswer(quiz.id, idx === quiz.correct);
  };

  return (
    <article className="quiz-card">
      <div className="quiz-head">
        <span className="eyebrow">{quiz.kind}</span>
        {attempt && (
          <span className={attempt.lastCorrect ? "attempt good" : "attempt bad"}>
            {attempt.correct}/{attempt.total}
          </span>
        )}
      </div>
      <p>{txt(quiz.prompt, lang)}</p>
      <div className="quiz-options">
        {quiz.choices.map((choiceText, idx) => {
          const selected = choice === idx;
          const isCorrect = answered && idx === quiz.correct;
          const isWrong = answered && selected && idx !== quiz.correct;
          return (
            <button
              key={idx}
              className={
                isCorrect ? "quiz-option correct" :
                isWrong ? "quiz-option wrong" :
                selected ? "quiz-option selected" : "quiz-option"
              }
              onClick={() => choose(idx)}
            >
              <span>{String.fromCharCode(65 + idx)}</span>
              {txt(choiceText, lang)}
            </button>
          );
        })}
      </div>
      {answered && (
        <p className={correct ? "answer-note good" : "answer-note bad"}>
          {txt(quiz.explanation, lang)}
        </p>
      )}
    </article>
  );
}

function VisualizerPage({ algorithms, course, lang, theme, onTheme, requestedAlgoId }) {
  const currentAlgo = algorithms.find((a) => a.id === requestedAlgoId) || algorithms[0];
  const relatedLectures = (currentAlgo.courseRefs || [])
    .map((id) => course.byId.lectures[id])
    .filter(Boolean);

  return (
    <main className="visualizer-page">
      <section className="viz-context">
        <div>
          <span className="eyebrow">{txt({ no: "Visualisering", en: "Visualizer" }, lang)}</span>
          <h2>{currentAlgo.name}</h2>
          <p>{txt(currentAlgo.explanation, lang) || currentAlgo.description}</p>
        </div>
        <div className="tag-list">
          {relatedLectures.map((lecture) => (
            <button key={lecture.id} className="tag clickable" onClick={() => go("study", lecture.id)}>
              F{lecture.number}: {txt(lecture.title, lang)}
            </button>
          ))}
        </div>
      </section>
      <VisualizerWorkbench
        algorithms={algorithms}
        lang={lang}
        theme={theme}
        onTheme={onTheme}
        requestedAlgoId={requestedAlgoId}
      />
    </main>
  );
}

function VisualizerWorkbench({ algorithms, lang, theme, onTheme, requestedAlgoId }) {
  const initialIdx = Math.max(0, algorithms.findIndex((a) => a.id === requestedAlgoId));
  const initialData = useMemo(() => algorithms[initialIdx].defaultData(), [algorithms, initialIdx]);
  const [algoIdx, setAlgoIdx] = useState(initialIdx);
  const [size, setSize] = useState(() => initialData.length);
  const [data, setData] = useState(() => initialData);
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(70);
  const timerRef = useRef(null);

  const algo = algorithms[algoIdx];

  const frames = useMemo(() => algo.run(data), [algo, data]);
  const maxValue = useMemo(
    () => frames.reduce((m, f) => Math.max(m, ...f.data), 1),
    [frames]
  );

  const total = frames.length;
  const safeIdx = Math.min(idx, total - 1);
  const frame = frames[safeIdx];

  useEffect(() => {
    const nextIdx = algorithms.findIndex((a) => a.id === requestedAlgoId);
    if (nextIdx >= 0 && nextIdx !== algoIdx) {
      const next = algorithms[nextIdx];
      const fresh = next.defaultData();
      setAlgoIdx(nextIdx);
      setData(fresh);
      setSize(fresh.length);
    }
  }, [requestedAlgoId, algorithms, algoIdx]);

  useEffect(() => {
    if (!playing) return;
    const ms = 30 + (1 - speed / 100) * 1170;
    timerRef.current = setInterval(() => {
      setIdx((prev) => {
        if (prev >= total - 1) {
          setPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, ms);
    return () => clearInterval(timerRef.current);
  }, [playing, speed, total]);

  useEffect(() => {
    setIdx(0);
    setPlaying(false);
  }, [algoIdx, data]);

  const selectAlgorithm = useCallback(
    (i) => {
      const next = algorithms[i];
      const fresh = next.defaultData();
      setAlgoIdx(i);
      setData(fresh);
      setSize(fresh.length);
      go("visualizer", next.id);
    },
    [algorithms]
  );

  const shuffle = useCallback(
    (newSize = size) => {
      const seed = Math.floor(Math.random() * 0xffffffff);
      let next;
      if (algo.viewKind === "search") {
        next = Array.from({ length: newSize }, (_, i) => (i + 1) * 2);
      } else {
        next = window.AlgViz.shuffledRange(newSize, seed);
      }
      setData(next);
      setSize(newSize);
    },
    [algo.viewKind, size]
  );

  const onSize = useCallback(
    (n) => {
      setSize(n);
      shuffle(n);
    },
    [shuffle]
  );

  const onPlay = () => {
    if (idx >= total - 1) setIdx(0);
    setPlaying((p) => !p);
  };
  const onBack = () => {
    setPlaying(false);
    setIdx((i) => Math.max(0, i - 1));
  };
  const onForward = () => setIdx((i) => Math.min(total - 1, i + 1));
  const onRestart = () => {
    setPlaying(false);
    setIdx(0);
  };
  const onShuffle = () => shuffle(size);
  const onJump = (n) => {
    setPlaying(false);
    setIdx(n);
  };

  useEffect(() => {
    const handler = (e) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLButtonElement
      ) {
        return;
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        onForward();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        onBack();
      } else if (e.key === " ") {
        e.preventDefault();
        onPlay();
      } else if (e.key.toLowerCase() === "r") {
        onRestart();
      } else if (e.key.toLowerCase() === "s") {
        onShuffle();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, total, playing, algoIdx, size]);

  const {
    CatalogueBar, CodeView, DescriptionBlock,
    StepRibbon, Variables, StepLog, Legend, Transport,
    Marginalia, Viewfinder, Footer, Visualization,
    labelFor,
  } = window.AlgViz;

  const doing = labelFor(frame);
  const compactViewKinds = new Set(["tree", "graph", "flow", "table", "buckets", "timeline", "reduction"]);
  const vizHeight = compactViewKinds.has(algo.viewKind) ? 220 : 300;

  return (
    <div className="visualizer-workbench">
      <div className="viz-stats">
        <Stat label="ALGO" value={algo.name} />
        <Stat label="N" value={data.length} />
        <Stat label="STEP" value={`${String(safeIdx + 1).padStart(3, "0")}/${String(total).padStart(3, "0")}`} />
        <Stat label="LINE" value={String(frame.line).padStart(2, "0")} />
        <Stat label="DOING" value={doing.toUpperCase()} accent />
        <Segmented
          label={txt({ no: "Tema", en: "Theme" }, lang)}
          value={theme}
          options={[
            ["paper", "Paper"],
            ["night", "Night"],
          ]}
          onChange={onTheme}
        />
      </div>

      <CatalogueBar
        algorithms={algorithms}
        activeIdx={algoIdx}
        onSelect={selectAlgorithm}
        size={size}
        onSize={onSize}
        onShuffle={onShuffle}
      />

      <main className="visualizer-grid">
        <aside className="viz-left-rail">
          <CodeView
            code={algo.code}
            filename={algo.filename}
            activeLine={frame.line}
          />
          <DescriptionBlock algo={algo} lang={lang} />
        </aside>

        <section className="viz-stage">
          <Viewfinder>
            <div className="viz-frame">
              <div className="fig-label">
                FIG. {String(safeIdx + 1).padStart(2, "0")} —{" "}
                {algo.name.toUpperCase()} / N={data.length}
              </div>
              <Visualization
                frame={frame}
                viewKind={algo.viewKind}
                maxValue={maxValue}
                height={vizHeight}
              />
            </div>
          </Viewfinder>

          <StepRibbon frame={frame} index={safeIdx} total={total} />

          <Transport
            idx={safeIdx}
            total={total}
            playing={playing}
            speed={speed}
            onPlay={onPlay}
            onBack={onBack}
            onForward={onForward}
            onRestart={onRestart}
            onShuffle={onShuffle}
            onSpeed={setSpeed}
            onJump={onJump}
          />

          <div className="viz-legend-row">
            <Legend viewKind={algo.viewKind} />
            <span className="shortcut-hint">←/→ step · space play · R restart · S shuffle</span>
          </div>
        </section>

        <aside className="viz-right-rail">
          <Variables vars={frame.variables || {}} />
          <hr className="rule" />
          <StepLog frames={frames} currentIdx={safeIdx} onJump={onJump} />
          <hr className="rule" />
          <Marginalia frame={frame} />
        </aside>
      </main>

      <Footer algo={algo.name} idx={safeIdx} />
    </div>
  );
}

function Stat({ label, value, accent }) {
  return (
    <div className="stat-cell">
      <span>{label}</span>
      <strong className={accent ? "accent" : ""}>{value}</strong>
    </div>
  );
}

function GlossaryView({ course, algorithms, lang }) {
  const [query, setQuery] = useState("");
  const normalized = query.trim().toLowerCase();
  const items = course.glossary.filter((concept) => {
    if (!normalized) return true;
    return [
      txt(concept.term, "no"),
      txt(concept.term, "en"),
      concept.english,
      txt(concept.explanation, lang),
    ].join(" ").toLowerCase().includes(normalized);
  });

  return (
    <main className="page-section">
      <div className="section-head">
        <div>
          <span className="eyebrow">{txt({ no: "Begrepskart", en: "Concept map" }, lang)}</span>
          <h2>{txt({ no: "Begreper du må kunne forklare", en: "Concepts you should be able to explain" }, lang)}</h2>
        </div>
        <input
          className="search-input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={txt({ no: "Søk begrep, forelesning eller algoritme", en: "Search concept, lecture, or algorithm" }, lang)}
        />
      </div>

      <div className="glossary-grid">
        {items.map((concept) => (
          <article key={concept.id} className="glossary-card">
            <span className="eyebrow">{concept.english}</span>
            <h3>{txt(concept.term, lang)}</h3>
            <p>{txt(concept.explanation, lang)}</p>
            <div className="tag-list">
              {concept.lectureIds.map((id) => {
                const lecture = course.byId.lectures[id];
                return lecture ? (
                  <button key={id} className="tag clickable" onClick={() => go("study", id)}>
                    F{lecture.number}
                  </button>
                ) : null;
              })}
              {concept.algorithmIds.map((id) => {
                const algo = algorithms.find((a) => a.id === id);
                return algo ? (
                  <button key={id} className="tag clickable" onClick={() => go("visualizer", id)}>
                    {algo.name}
                  </button>
                ) : null;
              })}
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}

function PracticeView({ course, algorithms, lang, progress, masteredSet, onGoalMastered, onQuiz }) {
  const focusGoals = course.lectures.flatMap((lecture) =>
    lecture.learningGoals
      .filter((goal) => goal.focus)
      .map((goal) => ({ ...goal, lecture }))
  );

  return (
    <main className="page-section">
      <div className="section-head">
        <div>
          <span className="eyebrow">{txt({ no: "Aktiv gjenhenting", en: "Active recall" }, lang)}</span>
          <h2>{txt({ no: "Øv uten å bare lese om igjen", en: "Practice without just rereading" }, lang)}</h2>
        </div>
      </div>

      <div className="content-grid two">
        <InfoPanel title={txt({ no: "Flashcards", en: "Flashcards" }, lang)}>
          <div className="concept-stack">
            {course.glossary.slice(0, 10).map((concept) => (
              <ConceptCard key={concept.id} concept={concept} lang={lang} compact />
            ))}
          </div>
        </InfoPanel>

        <InfoPanel title={txt({ no: "Forklar et viktig mål", en: "Explain a key goal" }, lang)}>
          <div className="goal-grid single">
            {focusGoals.map(({ lecture, ...goal }) => (
              <button
                key={goal.id}
                className={masteredSet.has(goal.id) ? "goal-card mastered" : "goal-card"}
                onClick={() => onGoalMastered(goal.id)}
              >
                <span>
                  <strong>{goal.id}</strong>
                  F{lecture.number}: {txt(goal.text, lang)}
                </span>
                <span className="goal-check">{masteredSet.has(goal.id) ? "✓" : "○"}</span>
              </button>
            ))}
          </div>
        </InfoPanel>
      </div>

      <InfoPanel title={txt({ no: "Quizrunde", en: "Quiz round" }, lang)}>
        <div className="quiz-grid">
          {course.quizzes.map((quiz) => (
            <QuizCard
              key={quiz.id}
              quiz={quiz}
              lang={lang}
              attempt={progress.quizAttempts[quiz.id]}
              onAnswer={onQuiz}
            />
          ))}
        </div>
      </InfoPanel>

      <InfoPanel title={txt({ no: "Trace prediction", en: "Trace prediction" }, lang)}>
        <div className="tool-grid">
          {algorithms.map((algo) => (
            <button key={algo.id} className="tool-link live" onClick={() => go("visualizer", algo.id)}>
              <span>{algo.name}</span>
              <small>{txt({ no: "Forutsi neste steg før du trykker →", en: "Predict the next step before pressing →" }, lang)}</small>
            </button>
          ))}
        </div>
      </InfoPanel>
    </main>
  );
}

function ProgressView({
  course, lang, progress, completedSet, masteredSet, onResetProgress,
}) {
  const totalGoals = goalCount(course.lectures);
  const quizTotals = Object.values(progress.quizAttempts).reduce(
    (acc, attempt) => ({
      total: acc.total + attempt.total,
      correct: acc.correct + attempt.correct,
    }),
    { total: 0, correct: 0 }
  );

  return (
    <main className="page-section">
      <div className="section-head">
        <div>
          <span className="eyebrow">{txt({ no: "Progresjon", en: "Progress" }, lang)}</span>
          <h2>{txt({ no: "Hva er gjort, og hva gjenstår?", en: "What is done, and what remains?" }, lang)}</h2>
        </div>
        <button className="secondary-action" onClick={onResetProgress}>
          {txt({ no: "Nullstill lokal progresjon", en: "Reset local progress" }, lang)}
        </button>
      </div>

      <div className="metric-grid">
        <Metric label={txt({ no: "Forelesninger", en: "Lectures" }, lang)} value={`${completedSet.size}/${course.lectures.length}`} />
        <Metric label={txt({ no: "Læringsmål", en: "Learning goals" }, lang)} value={`${masteredSet.size}/${totalGoals}`} />
        <Metric label={txt({ no: "Quiz", en: "Quizzes" }, lang)} value={`${quizTotals.correct}/${quizTotals.total || 0}`} />
      </div>

      <InfoPanel title={txt({ no: "Forelesningsstatus", en: "Lecture status" }, lang)}>
        <div className="progress-list">
          {course.lectures.map((lecture) => {
            const goals = lecture.learningGoals;
            const mastered = goals.filter((g) => masteredSet.has(g.id)).length;
            return (
              <button key={lecture.id} className="progress-row" onClick={() => go("study", lecture.id)}>
                <span className={completedSet.has(lecture.id) ? "status-dot done" : "status-dot"} />
                <strong>F{lecture.number}: {txt(lecture.title, lang)}</strong>
                <span>{mastered}/{goals.length} {txt({ no: "mål", en: "goals" }, lang)}</span>
              </button>
            );
          })}
        </div>
      </InfoPanel>
    </main>
  );
}

function Metric({ label, value }) {
  return (
    <div className="metric-card">
      <span className="eyebrow">{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
})();
