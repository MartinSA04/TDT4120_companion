(function () {
const { useMemo } = React;
const { txt, go, Section, Eyebrow, MonoMeta } = window.AlgViz;

function Bar({ value, max, label }) {
  const pct = Math.round((value / Math.max(1, max)) * 100);
  return (
    <div className="fn-bar">
      <div className="fn-bar-head">
        <span className="serif">{label}</span>
        <span className="mono">{value} / {max} · {pct}%</span>
      </div>
      <div className="fn-bar-track">
        <div className="fn-bar-fill" style={{ width: pct + "%" }} />
      </div>
    </div>
  );
}

function ProgressView({ course, lang, progress, completedSet, masteredSet, onResetProgress }) {
  const totalGoals = useMemo(
    () => course.lectures.reduce((s, l) => s + l.learningGoals.length, 0),
    [course.lectures]
  );
  const totalLectures = course.lectures.length;
  const totalQuizzes = course.quizzes.length;
  const attempts = progress.quizAttempts;
  const totalAttempts = Object.values(attempts).reduce((s, a) => s + a.total, 0);
  const totalCorrect = Object.values(attempts).reduce((s, a) => s + a.correct, 0);

  return (
    <main className="fn-progress">
      <Section
        eyebrow={txt({ no: "§ — Loggbok", en: "§ — Progress log" }, lang)}
        title={txt({ no: "Hvor langt er jeg?", en: "How far am I?" }, lang)}
        italic={txt({
          no: "Kort, ærlig oversikt over forelesninger, mål og quizsvar.",
          en: "A short, honest summary of lectures, goals, and quiz answers.",
        }, lang)}
        actions={(
          <button className="fn-btn ghost danger" onClick={onResetProgress}>
            {txt({ no: "Nullstill alt", en: "Reset everything" }, lang)}
          </button>
        )}
      >
        <div className="fn-progress-bars">
          <Bar
            value={completedSet.size} max={totalLectures}
            label={txt({ no: "Forelesninger lest", en: "Lectures read" }, lang)}
          />
          <Bar
            value={masteredSet.size} max={totalGoals}
            label={txt({ no: "Læringsmål mestret", en: "Learning goals mastered" }, lang)}
          />
          <Bar
            value={totalCorrect} max={Math.max(totalQuizzes, totalAttempts)}
            label={txt({ no: "Quizsvar riktig (totalt forsøk)", en: "Quiz answers correct (of attempts)" }, lang)}
          />
        </div>
      </Section>

      <Section eyebrow={txt({ no: "§ — Per forelesning", en: "§ — By lecture" }, lang)}>
        <table className="fn-table">
          <thead>
            <tr>
              <th className="mono">№</th>
              <th>{txt({ no: "Tittel", en: "Title" }, lang)}</th>
              <th className="mono">{txt({ no: "Mål", en: "Goals" }, lang)}</th>
              <th className="mono">{txt({ no: "Quiz", en: "Quiz" }, lang)}</th>
              <th className="mono">{txt({ no: "Lest", en: "Read" }, lang)}</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {course.lectures.map((l) => {
              const mastered = l.learningGoals.filter((g) => masteredSet.has(g.id)).length;
              const lectureQuizzes = l.quizIds.map((id) => attempts[id]).filter(Boolean);
              const correct = lectureQuizzes.filter((a) => a.lastCorrect).length;
              const done = completedSet.has(l.id);
              return (
                <tr key={l.id}>
                  <td className="mono">{String(l.number).padStart(2, "0")}</td>
                  <td className="serif">{txt(l.title, lang)}</td>
                  <td className="mono">{mastered}/{l.learningGoals.length}</td>
                  <td className="mono">{correct}/{l.quizIds.length}</td>
                  <td className="mono"><span className={done ? "fn-mark done inline" : "fn-mark inline"} /></td>
                  <td>
                    <button className="fn-link" onClick={() => go("study", l.id)}>
                      {txt({ no: "Åpne", en: "Open" }, lang)} →
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Section>
    </main>
  );
}

Object.assign(window.AlgViz, { ProgressView });
})();
