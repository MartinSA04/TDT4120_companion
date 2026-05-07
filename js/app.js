/* global React, ReactDOM, window */
(function () {
const { useState, useEffect, useRef, useMemo, useCallback } = React;

function App() {
  const algorithms = window.AlgViz.ALGORITHMS;
  const [algoIdx, setAlgoIdx] = useState(0);
  const [size, setSize] = useState(20);
  const [data, setData] = useState(() => algorithms[0].defaultData());
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(70);
  const [theme, setTheme] = useState("paper");
  const timerRef = useRef(null);

  const algo = algorithms[algoIdx];

  // Trace = list of frames produced by running the algorithm against `data`.
  const frames = useMemo(() => algo.run(data), [algo, data]);
  const maxValue = useMemo(
    () => frames.reduce((m, f) => Math.max(m, ...f.data), 1),
    [frames]
  );

  const total = frames.length;
  const safeIdx = Math.min(idx, total - 1);
  const frame = frames[safeIdx];

  // ---------- Apply theme to <html data-theme> ----------
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  // ---------- Playback timer ----------
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

  // ---------- Reset trace when algorithm or data changes ----------
  useEffect(() => {
    setIdx(0);
    setPlaying(false);
  }, [algoIdx, data]);

  // ---------- Algorithm selection ----------
  const selectAlgorithm = useCallback(
    (i) => {
      setAlgoIdx(i);
      const next = algorithms[i];
      const fresh = next.defaultData();
      setData(fresh);
      setSize(fresh.length);
    },
    [algorithms]
  );

  // ---------- Shuffle / size change ----------
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

  // ---------- Playback controls ----------
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

  // ---------- Keyboard shortcuts ----------
  useEffect(() => {
    const handler = (e) => {
      // Ignore when typing in form inputs
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
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
    Masthead, CatalogueBar, CodeView, DescriptionBlock,
    StepRibbon, Variables, StepLog, Legend, Transport,
    Marginalia, Viewfinder, Footer, Visualization,
    labelFor,
  } = window.AlgViz;

  const doing = labelFor(frame);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--ink)" }}>
      <Masthead
        algo={algo.name}
        n={data.length}
        idx={safeIdx}
        total={total}
        line={frame.line}
        doing={doing}
        theme={theme}
        onTheme={setTheme}
      />

      <CatalogueBar
        algorithms={algorithms}
        activeIdx={algoIdx}
        onSelect={selectAlgorithm}
        size={size}
        onSize={onSize}
        onShuffle={onShuffle}
      />

      {/* Three-column body */}
      <main
        style={{
          display: "grid",
          gridTemplateColumns: "320px 1fr 280px",
          minHeight: 700,
          borderBottom: "1px solid var(--rule-soft)",
        }}
      >
        {/* Left rail */}
        <aside
          style={{
            borderRight: "1px solid var(--rule-soft)",
            display: "flex",
            flexDirection: "column",
            background: "var(--surface)",
          }}
        >
          <CodeView
            code={algo.code}
            filename={algo.filename}
            activeLine={frame.line}
          />
          <DescriptionBlock algo={algo} />
        </aside>

        {/* Center stage */}
        <section
          style={{
            display: "flex",
            flexDirection: "column",
            padding: "20px 24px 16px",
            gap: 16,
            background: "var(--bg)",
          }}
        >
          <Viewfinder>
            <div
              style={{
                padding: "28px 22px 22px",
                background: "var(--surface)",
                border: "1px solid var(--rule-soft)",
                position: "relative",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: -10,
                  left: 18,
                  background: "var(--bg)",
                  padding: "0 10px",
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  letterSpacing: "0.18em",
                  color: "var(--ink-3)",
                }}
              >
                FIG. {String(safeIdx + 1).padStart(2, "0")} —{" "}
                {algo.name.toUpperCase()} / N={data.length}
              </div>
              <Visualization
                frame={frame}
                viewKind={algo.viewKind}
                maxValue={maxValue}
                height={300}
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

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "0 4px",
            }}
          >
            <Legend viewKind={algo.viewKind} />
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--ink-4)" }}>
              ←/→ step · space play · R restart · S shuffle
            </span>
          </div>
        </section>

        {/* Right rail */}
        <aside
          style={{
            borderLeft: "1px solid var(--rule-soft)",
            background: "var(--surface)",
            padding: "20px 22px",
            display: "flex",
            flexDirection: "column",
            gap: 24,
          }}
        >
          <Variables vars={frame.variables || {}} />
          <hr style={{ border: 0, borderTop: "1px solid var(--rule-soft)", margin: 0 }} />
          <StepLog frames={frames} currentIdx={safeIdx} onJump={onJump} />
          <hr style={{ border: 0, borderTop: "1px solid var(--rule-soft)", margin: 0 }} />
          <Marginalia frame={frame} />
        </aside>
      </main>

      <Footer algo={algo.name} idx={safeIdx} />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
})();
