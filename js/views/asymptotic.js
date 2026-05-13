/* global React, window */
// =====================================================================
// AsymptoticGraphView — line plots for growth-rate comparisons.
// =====================================================================
(function () {
const ROLE_COLOR = {
  target: "var(--accent)",
  upper: "var(--role-sorted)",
  lower: "var(--role-pivot)",
  reference: "var(--ink-3)",
  muted: "var(--rule-soft)",
};

function colorFor(role) {
  return ROLE_COLOR[role] || "var(--role-default)";
}

function localText(value, lang) {
  const txt = window.AlgViz?.txt;
  if (txt) return txt(value, lang);
  if (!value || typeof value !== "object") return value || "";
  return value[lang] || value.no || value.en || "";
}

function formatNumber(value) {
  if (!Number.isFinite(value)) return "";
  if (Math.abs(value) >= 1000) return `${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}k`;
  if (Math.abs(value) >= 10) return String(Math.round(value));
  if (Number.isInteger(value)) return String(value);
  return value.toFixed(1);
}

function AsymptoticGraphView({ frame, height = 300, lang = "en" }) {
  const visual = frame.visual || {};
  const curves = visual.curves || [];
  const thresholds = visual.thresholds || [];
  const xMax = visual.xMax || 16;
  const yMax = visual.yMax || 1;
  const useLogY = visual.yScale === "log";
  const yMin = useLogY ? Math.max(0.000001, visual.yMin || 1) : 0;
  const plot = { left: 9, top: 7, right: 96, bottom: 61 };
  const width = plot.right - plot.left;
  const chartHeight = plot.bottom - plot.top;

  const xScale = (x) => plot.left + (Math.max(0, Math.min(xMax, x)) / xMax) * width;
  const yScale = (y) => {
    if (!useLogY) {
      return plot.bottom - (Math.max(0, Math.min(yMax, y)) / yMax) * chartHeight;
    }
    const lo = Math.log10(yMin);
    const hi = Math.log10(Math.max(yMin * 10, yMax));
    const yy = Math.log10(Math.max(yMin, Math.min(yMax, y)));
    return plot.bottom - ((yy - lo) / (hi - lo)) * chartHeight;
  };
  const pathFor = (points) =>
    points.map(([x, y], i) => `${i === 0 ? "M" : "L"} ${xScale(x).toFixed(2)} ${yScale(y).toFixed(2)}`).join(" ");

  const xTicks = [0, Math.round(xMax / 2), xMax];
  const yTicks = visual.yTicks || (useLogY ? [yMin, Math.sqrt(yMin * yMax), yMax] : [0, yMax / 2, yMax]);
  const n0X = typeof visual.n0 === "number" ? xScale(visual.n0) : null;

  return (
    <div className="asymptotic-view" style={{ minHeight: height }}>
      <div className="asymptotic-head">
        <strong>{localText(visual.title, lang)}</strong>
        {visual.subtitle && <span>{localText(visual.subtitle, lang)}</span>}
      </div>
      <svg viewBox="0 0 100 76" className="asymptotic-svg" role="img" aria-label={localText(visual.title, lang) || "Asymptotic graph"}>
        {visual.shadedAfter && n0X !== null && (
          <rect
            x={n0X}
            y={plot.top}
            width={plot.right - n0X}
            height={chartHeight}
            fill="var(--accent)"
            opacity="0.07"
          />
        )}

        {yTicks.map((tick) => (
          <g key={`y-${tick}`}>
            <line x1={plot.left} y1={yScale(tick)} x2={plot.right} y2={yScale(tick)} className="asymptotic-grid" />
            <text x={plot.left - 1.4} y={yScale(tick) + 1.1} textAnchor="end" className="asymptotic-tick">
              {formatNumber(tick)}
            </text>
          </g>
        ))}
        {xTicks.map((tick) => (
          <g key={`x-${tick}`}>
            <line x1={xScale(tick)} y1={plot.top} x2={xScale(tick)} y2={plot.bottom} className="asymptotic-grid faint" />
            <text x={xScale(tick)} y={plot.bottom + 4.8} textAnchor="middle" className="asymptotic-tick">
              {formatNumber(tick)}
            </text>
          </g>
        ))}

        <line x1={plot.left} y1={plot.bottom} x2={plot.right} y2={plot.bottom} className="asymptotic-axis" />
        <line x1={plot.left} y1={plot.top} x2={plot.left} y2={plot.bottom} className="asymptotic-axis" />
        <text x={plot.right} y={plot.bottom + 9} textAnchor="end" className="asymptotic-axis-label">{visual.xLabel || "n"}</text>
        <text x={plot.left - 6.8} y={plot.top - 1.4} textAnchor="start" className="asymptotic-axis-label">{visual.yLabel || "work"}</text>

        {thresholds.map((threshold) => (
          <g key={threshold.label}>
            <line
              x1={plot.left}
              y1={yScale(threshold.y)}
              x2={plot.right}
              y2={yScale(threshold.y)}
              stroke={colorFor(threshold.role)}
              className="asymptotic-threshold"
            />
            <text x={plot.right - 1} y={yScale(threshold.y) - 1.5} textAnchor="end" className="asymptotic-note">
              {threshold.label}
            </text>
          </g>
        ))}

        {n0X !== null && (
          <g>
            <line x1={n0X} y1={plot.top} x2={n0X} y2={plot.bottom} className="asymptotic-n0" />
            <text x={n0X + 1.2} y={plot.top + 3.2} className="asymptotic-note">n0 = {visual.n0}</text>
          </g>
        )}

        {curves.map((curve) => (
          <path
            key={curve.id}
            d={pathFor(curve.points || [])}
            fill="none"
            stroke={colorFor(curve.role)}
            strokeWidth={curve.role === "target" ? 1.55 : 1.05}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={curve.role === "muted" ? 0.68 : 1}
          />
        ))}
      </svg>
      <div className="asymptotic-legend">
        {curves.map((curve) => (
          <span key={curve.id}>
            <i style={{ background: colorFor(curve.role) }} />
            {localText(curve.label, lang)}
          </span>
        ))}
      </div>
    </div>
  );
}

function AsymptoticNotationExplainer({ algo, lang = "en" }) {
  const size = algo.sizeRange?.default || 48;
  const frames = algo.run(algo.defaultData(size));
  const title = localText({
    no: "Asymptotisk notasjon",
    en: "Asymptotic notation",
  }, lang);
  const lead = localText({
    no: "Notasjonen beskriver veksten til funksjoner. Velg først hvilken kjøretidsfunksjon du analyserer, for eksempel best-, average- eller worst-case. Deretter beskriver O, Omega, Theta, o og omega forholdet mellom den funksjonen og en enklere referansefunksjon.",
    en: "The notation describes growth of functions. First choose which running-time function you are analyzing, such as best-, average-, or worst-case. Then O, Omega, Theta, o, and omega describe the relationship between that function and a simpler reference function.",
  }, lang);
  const principles = [
    {
      label: "n0",
      body: localText({
        no: "Små input kan ignoreres. Det som teller er hva som er sant for alle n etter terskelen.",
        en: "Small inputs may be ignored. What matters is what remains true for every n after the threshold.",
      }, lang),
    },
    {
      label: "c",
      body: localText({
        no: "Konstante faktorer kan absorberes i O, Omega og Theta. Derfor sammenligner vi former mer enn eksakte høyder.",
        en: "Constant factors can be absorbed in O, Omega, and Theta. That is why we compare shapes more than exact heights.",
      }, lang),
    },
    {
      label: "case",
      body: localText({
        no: "Best-, average- og worst-case er egne funksjoner. Hver av dem kan ha en O-, Omega- eller Theta-grense.",
        en: "Best-, average-, and worst-case are separate functions. Each can have an O, Omega, or Theta bound.",
      }, lang),
    },
  ];

  return (
    <section className="asymptotic-explainer">
      <header className="asymptotic-explainer-head">
        <span className="eyebrow">{localText({ no: "Visualisering", en: "Visualization" }, lang)}</span>
        <h1>{title}</h1>
        <p>{lead}</p>
      </header>

      <div className="asymptotic-principles" aria-label={localText({ no: "Nøkkelideer", en: "Key ideas" }, lang)}>
        {principles.map((item) => (
          <div key={item.label}>
            <strong>{item.label}</strong>
            <span>{item.body}</span>
          </div>
        ))}
      </div>

      <div className="asymptotic-panel-grid">
        {frames.map((frame) => (
          <article key={frame.line} className="asymptotic-panel">
            <AsymptoticGraphView frame={frame} height={260} lang={lang} />
            <p>{localText(frame.visual?.explanation || frame.desc, lang)}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

window.AlgViz = window.AlgViz || {};
window.AlgViz.AsymptoticGraphView = AsymptoticGraphView;
window.AlgViz.AsymptoticNotationExplainer = AsymptoticNotationExplainer;
})();
