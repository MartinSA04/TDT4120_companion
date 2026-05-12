(function () {
const { useState } = React;
const { txt, go, Section, Eyebrow, MonoMeta } = window.AlgViz;

// ── Concept card (mono term + italic gloss) ──
function ConceptCard({ concept, lang, defaultOpen }) {
  const [open, setOpen] = useState(!!defaultOpen);
  return (
    <article className={open ? "fn-concept open" : "fn-concept"}>
      <button className="fn-concept-head" onClick={() => setOpen((v) => !v)}>
        <span className="fn-concept-term">
          <strong className="serif">{txt(concept.term, lang)}</strong>
          <em className="fn-concept-en">{concept.english}</em>
        </span>
        <span className="fn-concept-toggle">{open ? "−" : "+"}</span>
      </button>
      {open && <p className="serif fn-italic fn-concept-body">{txt(concept.explanation, lang)}</p>}
    </article>
  );
}

// ── Quiz card ──
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
    <article className="fn-quiz">
      <div className="fn-quiz-head">
        <Eyebrow>{quiz.kind}</Eyebrow>
        {attempt && (
          <MonoMeta>
            <span className={attempt.lastCorrect ? "fn-good" : "fn-bad"}>
              {attempt.correct}/{attempt.total}
            </span>
          </MonoMeta>
        )}
      </div>
      <p className="serif fn-quiz-prompt">{txt(quiz.prompt, lang)}</p>
      <div className="fn-quiz-options">
        {quiz.choices.map((c, idx) => {
          const isCorrect = answered && idx === quiz.correct;
          const isWrong = answered && choice === idx && idx !== quiz.correct;
          const cls = isCorrect ? "fn-quiz-opt correct" : isWrong ? "fn-quiz-opt wrong" : "fn-quiz-opt";
          return (
            <button key={idx} className={cls} onClick={() => choose(idx)}>
              <span className="fn-quiz-letter">{String.fromCharCode(65 + idx)}</span>
              <span>{txt(c, lang)}</span>
            </button>
          );
        })}
      </div>
      {answered && (
        <p className={correct ? "fn-quiz-note good" : "fn-quiz-note bad"}>
          <em className="serif">{txt(quiz.explanation, lang)}</em>
        </p>
      )}
    </article>
  );
}

// ── Lecture index (sidebar) ──
function LectureIndex({ course, lectureId, completedSet, lang }) {
  return (
    <aside className="fn-index">
      <div className="fn-index-head">
        <Eyebrow>{txt({ no: "Forelesninger", en: "Lectures" }, lang)}</Eyebrow>
        <MonoMeta>{completedSet.size}/{course.lectures.length}</MonoMeta>
      </div>
      {/* Mobile / narrow screens: the lecture list collapses to a dropdown */}
      <label className="fn-index-select">
        <span className="eyebrow">{txt({ no: "Forelesning", en: "Lecture" }, lang)}</span>
        <select value={lectureId} onChange={(e) => go("study", e.target.value)}>
          {course.lectures.map((it) => (
            <option key={it.id} value={it.id}>
              {String(it.number).padStart(2, "0")} · {txt(it.title, lang)}
              {completedSet.has(it.id) ? " ✓" : ""}
            </option>
          ))}
        </select>
      </label>
      <ol className="fn-index-list">
        {course.lectures.map((it) => {
          const done = completedSet.has(it.id);
          const active = it.id === lectureId;
          return (
            <li key={it.id}>
              <button
                className={active ? "fn-index-row active" : "fn-index-row"}
                onClick={() => go("study", it.id)}
              >
                <span className="fn-index-no serif">{String(it.number).padStart(2, "0")}</span>
                <span className="fn-index-text">
                  <strong>{txt(it.title, lang)}</strong>
                  <small className="mono">
                    {it.learningGoals.length} goals · {it.curriculumRefs[0] || "—"}
                  </small>
                </span>
                <span className={done ? "fn-mark done" : "fn-mark"} aria-hidden="true" />
              </button>
            </li>
          );
        })}
      </ol>
    </aside>
  );
}

// ── Hero (lecture title + actions) ──
function LectureHero({ lecture, lang, completed, onComplete, masteredCount, totalGoals }) {
  return (
    <header className="fn-lecture-hero">
      <div>
        <Eyebrow>
          {txt({ no: "Forelesning", en: "Lecture" }, lang)} {String(lecture.number).padStart(2, "0")}
        </Eyebrow>
        <h2 className="serif">{txt(lecture.title, lang)}</h2>
        <p className="serif fn-italic">{txt(lecture.summary, lang)}</p>
      </div>
      <div className="fn-lecture-hero-side">
        <button className={completed ? "fn-btn ghost" : "fn-btn primary"} onClick={onComplete}>
          {completed
            ? txt({ no: "Markert ferdig ✓", en: "Marked complete ✓" }, lang)
            : txt({ no: "Marker forelesning ferdig", en: "Mark lecture complete" }, lang)}
        </button>
        <MonoMeta>
          <span className="fn-mono-num">{masteredCount}</span>
          <span className="fn-mono-slash"> / {totalGoals}</span>
          <span className="fn-mono-tail"> {txt({ no: "mål mestret", en: "goals mastered" }, lang)}</span>
        </MonoMeta>
      </div>
    </header>
  );
}

// ── Goals as field-note checkboxes ──
function GoalsList({ goals, masteredSet, onToggle, lang }) {
  return (
    <ul className="fn-goals">
      {goals.map((g) => {
        const mastered = masteredSet.has(g.id);
        return (
          <li key={g.id}>
            <button
              className={mastered ? "fn-goal-row mastered" : "fn-goal-row"}
              onClick={() => onToggle(g.id)}
            >
              <span className={mastered ? "fn-checkbox checked" : "fn-checkbox"} aria-hidden="true">
                {mastered ? "✓" : ""}
              </span>
              <span className="fn-goal-id mono">{g.id}{g.focus ? "★" : ""}</span>
              <span className="serif fn-goal-text">{txt(g.text, lang)}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

// ── StudyView ──
function StudyView(props) {
  const {
    course, algorithms, lang, selectedLectureId,
    completedSet, masteredSet, progress,
    onLectureComplete, onGoalMastered, onQuiz,
  } = props;
  const lecture = course.byId.lectures[selectedLectureId];
  const concepts = lecture.conceptIds.map((id) => course.byId.glossary[id]).filter(Boolean);
  const relatedAlgorithms = lecture.algorithmIds
    .map((id) => algorithms.find((a) => a.id === id)).filter(Boolean);
  const planned = course.plannedTools.filter((tool) =>
    tool.lectureId === lecture.id && !algorithms.some((a) => a.id === tool.id));
  const quizzes = lecture.quizIds.map((id) => course.byId.quizzes[id]).filter(Boolean);
  const allGoals = lecture.learningGoals;
  const masteredInLecture = allGoals.filter((g) => masteredSet.has(g.id)).length;

  return (
    <main className="fn-study">
      <LectureIndex course={course} lectureId={lecture.id} completedSet={completedSet} lang={lang} />

      <article className="fn-spread">
        <LectureHero
          lecture={lecture} lang={lang}
          completed={completedSet.has(lecture.id)}
          onComplete={() => onLectureComplete(lecture.id)}
          masteredCount={masteredInLecture}
          totalGoals={allGoals.length}
        />

        {/* Curriculum strip + pitfall callout */}
        <div className="fn-row two">
          <div className="fn-block">
            <Eyebrow>{txt({ no: "Pensum", en: "Curriculum" }, lang)}</Eyebrow>
            <div className="fn-chips">
              {lecture.curriculumRefs.map((ref) => (
                <span key={ref} className="fn-chip mono">{ref}</span>
              ))}
            </div>
          </div>
          <aside className="fn-callout">
            <Eyebrow>{txt({ no: "Snubletråd", en: "Common pitfall" }, lang)}</Eyebrow>
            <p className="serif fn-italic">{txt(lecture.pitfall, lang)}</p>
          </aside>
        </div>

        {/* Learning goals */}
        <Section eyebrow={txt({ no: "§ 02 — Læringsmål", en: "§ 02 — Learning goals" }, lang)}>
          <GoalsList goals={allGoals} masteredSet={masteredSet} onToggle={onGoalMastered} lang={lang} />
        </Section>

        {/* Two columns: explain it + tools */}
        <div className="fn-row two">
          <Section eyebrow={txt({ no: "§ 03 — Forklar det", en: "§ 03 — Explain it" }, lang)}>
            <div className="fn-stack">
              {concepts.map((c) => <ConceptCard key={c.id} concept={c} lang={lang} />)}
            </div>
          </Section>
          <Section eyebrow={txt({ no: "§ 04 — Verktøy", en: "§ 04 — Tools" }, lang)}>
            <div className="fn-stack">
              {relatedAlgorithms.map((a) => (
                <button key={a.id} className="fn-tool live" onClick={() => go("visualizer", a.id)}>
                  <span className="serif">{a.name}</span>
                  <span className="mono fn-tool-meta">
                    {txt({ no: "Åpne visualisering →", en: "Open visualization →" }, lang)}
                  </span>
                </button>
              ))}
              {planned.map((p) => (
                <div key={p.id} className="fn-tool planned">
                  <span className="serif">{txt(p.title, lang)}</span>
                  <span className="mono fn-tool-meta">
                    {txt({ no: "Planlagt", en: "Planned" }, lang)}
                  </span>
                </div>
              ))}
              {relatedAlgorithms.length === 0 && planned.length === 0 && (
                <p className="serif fn-italic fn-muted">
                  {txt({ no: "Ingen koblede verktøy ennå.", en: "No linked tools yet." }, lang)}
                </p>
              )}
            </div>
          </Section>
        </div>

        {/* Self-test */}
        <Section eyebrow={txt({ no: "§ 05 — Sjekk deg selv", en: "§ 05 — Self-test" }, lang)}>
          <div className="fn-quiz-grid">
            {quizzes.map((q) => (
              <QuizCard
                key={q.id} quiz={q} lang={lang}
                attempt={progress.quizAttempts[q.id]}
                onAnswer={onQuiz}
              />
            ))}
            {quizzes.length === 0 && (
              <p className="serif fn-italic fn-muted">
                {txt({ no: "Ingen quiz for denne forelesningen.", en: "No quiz for this lecture." }, lang)}
              </p>
            )}
          </div>
        </Section>
      </article>
    </main>
  );
}

Object.assign(window.AlgViz, { StudyView, ConceptCard, QuizCard });
})();
