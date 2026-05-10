(function () {
const { useState, useEffect, useRef, useMemo } = React;
const A = window.AlgViz;

function VisualizerPage({ algorithms, course, lang, theme, onTheme, requestedAlgoId }) {
  return (
    <main className="fn-visualizer">
      <VisualizerWorkbench
        algorithms={algorithms} lang={lang} theme={theme} onTheme={onTheme}
        requestedAlgoId={requestedAlgoId}
      />
    </main>
  );
}

function VisualizerWorkbench({ algorithms, lang, theme, onTheme, requestedAlgoId }) {
  const initialIdx = Math.max(0, algorithms.findIndex((a) => a.id === requestedAlgoId));
  const [algoIdx, setAlgoIdx] = useState(initialIdx >= 0 ? initialIdx : 0);
  const algo = algorithms[algoIdx];
  const [seed, setSeed] = useState(0);
  const [size, setSize] = useState(() => algo.sizeRange?.default ?? 0);

  useEffect(() => {
    const idx = algorithms.findIndex((a) => a.id === requestedAlgoId);
    if (idx >= 0) setAlgoIdx(idx);
  }, [requestedAlgoId, algorithms]);

  // When the algorithm changes, reset the size to its default (or 0 if the
  // algorithm doesn't expose a size range).
  useEffect(() => {
    setSize(algo.sizeRange?.default ?? 0);
  }, [algoIdx, algo]);

  const input = useMemo(() => {
    try { return algo.defaultData ? algo.defaultData(size) : []; }
    catch (e) { return []; }
  }, [algo, seed, size]);

  const frames = useMemo(() => {
    try {
      const result = algo.run ? algo.run(input) : [];
      return Array.isArray(result) ? result : (result.frames || []);
    } catch (e) { console.error(e); return []; }
  }, [algo, input]);

  const code = algo.code || "";

  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(60);
  const timerRef = useRef(null);

  useEffect(() => { setIdx(0); setPlaying(false); }, [algoIdx, seed, size]);

  useEffect(() => {
    if (!playing || frames.length === 0) return;
    const ms = 80 + (1 - speed / 100) * 900;
    timerRef.current = setInterval(() => {
      setIdx((p) => (p >= frames.length - 1 ? (setPlaying(false), p) : p + 1));
    }, ms);
    return () => clearInterval(timerRef.current);
  }, [playing, speed, frames.length]);

  useEffect(() => {
    const handler = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      if (e.key === "ArrowLeft") { setPlaying(false); setIdx((i) => Math.max(0, i - 1)); }
      else if (e.key === "ArrowRight") setIdx((i) => Math.min(frames.length - 1, i + 1));
      else if (e.key === " ") { e.preventDefault(); setPlaying((p) => !p); }
      else if (e.key === "r" || e.key === "R") { setIdx(0); setPlaying(false); }
      else if (e.key === "s" || e.key === "S") { setSeed((s) => s + 1); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [frames.length]);

  if (frames.length === 0) {
    return (
      <div className="fn-vis-shell">
        <div style={{ padding: "var(--s-7)", fontStyle: "italic", color: "var(--ink-3)" }}>
          {algo.name}: no frames available.
        </div>
      </div>
    );
  }

  const frame = frames[Math.min(idx, frames.length - 1)] || {};
  const data = frame.data || input || [];
  const maxValue = data.length ? Math.max(...data, 1) : 1;
  const visualKind = (frame.visual && frame.visual.kind) || algo.viewKind || "bars";
  const doing = A.labelFor ? A.labelFor(frame) : "";

  return (
    <div className="fn-vis-shell">
      {A.Masthead && (
        <A.Masthead
          algo={algo.name} n={data.length} idx={idx} total={frames.length}
          line={frame.line} doing={doing}
        />
      )}

      {A.CatalogueBar && (
        <A.CatalogueBar
          algorithms={algorithms} activeIdx={algoIdx} onSelect={setAlgoIdx}
          size={size} onSize={setSize} sizeRange={algo.sizeRange}
          onShuffle={() => setSeed((s) => s + 1)}
        />
      )}

      <div className="fn-vis-grid">
        <div className="fn-vis-stage">
          {A.Viewfinder ? (
            <A.Viewfinder>
              <A.Visualization frame={frame} viewKind={visualKind} maxValue={maxValue} height={320} />
            </A.Viewfinder>
          ) : (
            <A.Visualization frame={frame} viewKind={visualKind} maxValue={maxValue} height={320} />
          )}

          {A.StepRibbon && <A.StepRibbon frame={frame} index={idx} total={frames.length} />}

          {A.Transport && (
            <A.Transport
              idx={idx} total={frames.length} playing={playing}
              onPlay={() => setPlaying((p) => !p)}
              onBack={() => { setPlaying(false); setIdx((i) => Math.max(0, i - 1)); }}
              onForward={() => setIdx((i) => Math.min(frames.length - 1, i + 1))}
              onRestart={() => { setPlaying(false); setIdx(0); }}
              onShuffle={() => setSeed((s) => s + 1)}
              speed={speed} onSpeed={setSpeed}
              onJump={(n) => { setPlaying(false); setIdx(n); }}
            />
          )}

          {A.CodeView && (
            <A.CodeView
              code={code}
              filename={algo.filename || (algo.id + ".py")}
              activeLine={frame.line}
            />
          )}
        </div>

        <aside className="fn-vis-side">
          {A.DescriptionBlock && <A.DescriptionBlock algo={algo} lang={lang} />}
          {A.Variables && <A.Variables vars={frame.vars} />}
          {A.Marginalia && <A.Marginalia frame={frame} />}
          {A.Legend && <A.Legend viewKind={visualKind} />}
          {A.StepLog && (
            <A.StepLog
              frames={frames} currentIdx={idx}
              onJump={(n) => { setPlaying(false); setIdx(n); }}
            />
          )}
        </aside>
      </div>

      {A.Footer && <A.Footer algo={algo.name} idx={idx} />}
    </div>
  );
}

Object.assign(window.AlgViz, { VisualizerPage, VisualizerWorkbench });
})();
