(function () {
const { useState } = React;
const { txt, go, VIEWS } = window.AlgViz;

function AppHeader({ course, lang, theme, view, onLang, onTheme }) {
  const labels = {
    study: txt({ no: "Studie", en: "Study" }, lang),
    visualizer: txt({ no: "Visualisering", en: "Visualizer" }, lang),
    glossary: txt({ no: "Begreper", en: "Glossary" }, lang),
    practice: txt({ no: "Øving", en: "Practice" }, lang),
    progress: txt({ no: "Progresjon", en: "Progress" }, lang),
  };
  return (
    <header className="fn-masthead">
      <div className="fn-mast-title">
        <span className="eyebrow">NTNU · TDT4120 · Field Notes</span>
        <h1 className="serif">{txt(course.title, lang)}</h1>
        <p className="serif fn-tagline">{txt(course.sourceNote, lang)}</p>
      </div>
      <nav className="fn-tabs" aria-label="Primary">
        {VIEWS.map((v) => (
          <button
            key={v}
            className={view === v ? "fn-tab active" : "fn-tab"}
            onClick={() => go(v, v === "study" ? "l01" : null)}
          >{labels[v]}</button>
        ))}
      </nav>
      <div className="fn-mast-controls">
        <Segmented value={lang} options={[["no","NO"],["en","EN"]]} onChange={onLang} />
        <Segmented value={theme} options={[["paper","Paper"],["night","Night"]]} onChange={onTheme} />
      </div>
    </header>
  );
}

function Segmented({ value, options, onChange }) {
  return (
    <div className="fn-seg">
      {options.map(([id, name]) => (
        <button key={id} className={value === id ? "active" : ""} onClick={() => onChange(id)}>
          {name}
        </button>
      ))}
    </div>
  );
}

// Re-usable primitives ----------------------------------------------------
function Section({ eyebrow, title, italic, actions, children }) {
  return (
    <section className="fn-section">
      <header className="fn-section-head">
        <div className="fn-section-title">
          {eyebrow && <span className="eyebrow">{eyebrow}</span>}
          {title && <h2 className="serif">{title}</h2>}
          {italic && <p className="serif fn-italic">{italic}</p>}
        </div>
        {actions && <div className="fn-section-actions">{actions}</div>}
      </header>
      <div className="fn-section-body">{children}</div>
    </section>
  );
}

function FigureCard({ label, children }) {
  return (
    <div className="fn-figure">
      {label && <div className="fn-figure-label">{label}</div>}
      {children}
    </div>
  );
}

function Eyebrow({ children }) { return <span className="eyebrow">{children}</span>; }
function MonoMeta({ children }) { return <span className="fn-mono-meta">{children}</span>; }

Object.assign(window.AlgViz, { AppHeader, Segmented, Section, FigureCard, Eyebrow, MonoMeta });
})();
