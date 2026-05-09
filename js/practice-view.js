(function () {
const { useState, useMemo } = React;
const { txt, go, Section, Eyebrow, MonoMeta } = window.AlgViz;

function PracticeView({ course, algorithms, lang, progress, masteredSet, onGoalMastered, onQuiz }) {
  const [filter, setFilter] = useState("all");
  const lectures = course.lectures;

  const allGoals = lectures.flatMap((l) =>
    l.learningGoals.map((g) => ({ ...g, lectureId: l.id, lectureNo: l.number, lectureTitle: l.title }))
  );

  const filteredGoals = useMemo(() => {
    if (filter === "mastered") return allGoals.filter((g) => masteredSet.has(g.id));
    if (filter === "open") return allGoals.filter((g) => !masteredSet.has(g.id));
    if (filter === "focus") return allGoals.filter((g) => g.focus);
    return allGoals;
  }, [allGoals, filter, masteredSet]);

  const allQuizzes = course.quizzes;
  const totalAttempted = Object.keys(progress.quizAttempts).length;
  const totalCorrect = Object.values(progress.quizAttempts).filter((a) => a.lastCorrect).length;

  const StudyView = window.AlgViz; // for inline QuizCard
  const QuizCard = window.AlgViz.QuizCard;

  return (
    <main className="fn-practice">
      <Section
        eyebrow={txt({ no: "§ — Øving", en: "§ — Practice" }, lang)}
        title={txt({ no: "Læringsmål og selvtest", en: "Learning goals & self-test" }, lang)}
        italic={txt({
          no: "Et felt for å sjekke seg selv før eksamen — kryss av mål, ta quiz, åpne verktøy.",
          en: "A page to check yourself before the exam — tick goals, take quizzes, open tools.",
        }, lang)}
        actions={(
          <div className="fn-seg">
            {[
              ["all", txt({ no: "Alle", en: "All" }, lang)],
              ["focus", txt({ no: "Fokus", en: "Focus" }, lang)],
              ["open", txt({ no: "Åpne", en: "Open" }, lang)],
              ["mastered", txt({ no: "Mestret", en: "Mastered" }, lang)],
            ].map(([id, label]) => (
              <button key={id} className={filter === id ? "active" : ""} onClick={() => setFilter(id)}>
                {label}
              </button>
            ))}
          </div>
        )}
      >
        <div className="fn-practice-strip">
          <Eyebrow>{txt({ no: "Status", en: "Status" }, lang)}</Eyebrow>
          <MonoMeta>
            {masteredSet.size} {txt({ no: "mestret", en: "mastered" }, lang)}
            {" · "}
            {filteredGoals.length} {txt({ no: "synlig", en: "visible" }, lang)}
            {" · "}
            {totalCorrect}/{totalAttempted} {txt({ no: "siste quizsvar riktig", en: "last quiz answers correct" }, lang)}
          </MonoMeta>
        </div>

        <ul className="fn-practice-goals">
          {filteredGoals.map((g) => {
            const mastered = masteredSet.has(g.id);
            return (
              <li key={g.id} className={mastered ? "fn-pgoal mastered" : "fn-pgoal"}>
                <button
                  className={mastered ? "fn-checkbox checked" : "fn-checkbox"}
                  onClick={() => onGoalMastered(g.id)}
                  aria-label="toggle"
                >{mastered ? "✓" : ""}</button>
                <div className="fn-pgoal-text">
                  <span className="mono fn-pgoal-id">
                    L{String(g.lectureNo).padStart(2, "0")} · {g.id}{g.focus ? "★" : ""}
                  </span>
                  <p className="serif">{txt(g.text, lang)}</p>
                  <small className="mono">{txt(g.lectureTitle, lang)}</small>
                </div>
                <button className="fn-link" onClick={() => go("study", g.lectureId)}>
                  {txt({ no: "Til forelesning", en: "To lecture" }, lang)} →
                </button>
              </li>
            );
          })}
        </ul>
      </Section>

      <Section
        eyebrow={txt({ no: "§ — Quiz-arkiv", en: "§ — Quiz archive" }, lang)}
        italic={txt({
          no: "Alle spørsmål, alle forelesninger.",
          en: "Every question, every lecture.",
        }, lang)}
      >
        <div className="fn-quiz-grid">
          {allQuizzes.map((q) => (
            <QuizCard
              key={q.id} quiz={q} lang={lang}
              attempt={progress.quizAttempts[q.id]}
              onAnswer={onQuiz}
            />
          ))}
        </div>
      </Section>
    </main>
  );
}

Object.assign(window.AlgViz, { PracticeView });
})();
