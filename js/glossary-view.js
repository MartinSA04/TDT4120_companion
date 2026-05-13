(function () {
const { useState, useMemo } = React;
const { txt, go, Section, Eyebrow, MonoMeta } = window.AlgViz;

function GlossaryView({ course, algorithms, lang }) {
  const [query, setQuery] = useState("");
  const [letter, setLetter] = useState("ALL");

  const all = course.glossary;
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return all.filter((c) => {
      const term = txt(c.term, lang).toLowerCase();
      const en = (c.english || "").toLowerCase();
      const expl = txt(c.explanation, lang).toLowerCase();
      const matchQ = !q || term.includes(q) || en.includes(q) || expl.includes(q);
      const matchL = letter === "ALL" || term[0]?.toUpperCase() === letter;
      return matchQ && matchL;
    });
  }, [all, query, letter, lang]);

  const letters = useMemo(() => {
    const set = new Set(all.map((c) => txt(c.term, lang)[0]?.toUpperCase()).filter(Boolean));
    return Array.from(set).sort();
  }, [all, lang]);

  const algoIndex = algorithms.reduce((acc, a) => { acc[a.id] = a; return acc; }, {});

  return (
    <main className="fn-glossary">
      <Section
        eyebrow={txt({ no: "§ — Begrepskatalog", en: "§ — Concept catalogue" }, lang)}
        title={txt({ no: "Begreper, alfabetisk", en: "Concepts, alphabetical" }, lang)}
        italic={txt({
          no: "Hvert begrep er ett fokus, ett spørsmål, og en lenke til verktøyet som viser det.",
          en: "Each entry is one focus, one question, and a link to the tool that shows it.",
        }, lang)}
      >
        <div className="fn-glossary-controls">
          <div className="fn-search">
            <Eyebrow>{txt({ no: "Søk", en: "Search" }, lang)}</Eyebrow>
            <input
              type="text" value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder={txt({ no: "f.eks. asymptotisk…", en: "e.g. asymptotic…" }, lang)}
            />
          </div>
          <div className="fn-letters">
            <button className={letter === "ALL" ? "active" : ""} onClick={() => setLetter("ALL")}>ALL</button>
            {letters.map((L) => (
              <button key={L} className={letter === L ? "active" : ""} onClick={() => setLetter(L)}>{L}</button>
            ))}
          </div>
          <MonoMeta>{filtered.length} / {all.length}</MonoMeta>
        </div>

        <ul className="fn-glossary-list">
          {filtered.map((c) => {
            const linkedIds = [...new Set([...(c.toolIds || []), ...(c.algorithmIds || [])])];
            const linkedAlgos = linkedIds
              .map((id) => algoIndex[id]).filter(Boolean);
            return (
              <li key={c.id} className="fn-glossary-row">
                <div className="fn-glossary-term">
                  <h3 className="serif">{txt(c.term, lang)}</h3>
                  <span className="mono fn-en">{c.english}</span>
                </div>
                <p className="serif fn-italic">{txt(c.explanation, lang)}</p>
                {linkedAlgos.length > 0 && (
                  <div className="fn-glossary-links">
                    {linkedAlgos.map((a) => (
                      <button key={a.id} className="fn-link" onClick={() => go("visualizer", a.id)}>
                        {a.name} →
                      </button>
                    ))}
                  </div>
                )}
              </li>
            );
          })}
          {filtered.length === 0 && (
            <li className="fn-glossary-empty serif fn-italic">
              {txt({ no: "Ingen begreper passer.", en: "No concepts match." }, lang)}
            </li>
          )}
        </ul>
      </Section>
    </main>
  );
}

Object.assign(window.AlgViz, { GlossaryView });
})();
