/* global React, window */
(function () {
const { useState, useEffect, useRef, useMemo } = React;

// =============================================================
// CodeView — Python source with syntax highlighting + active line
// =============================================================
function tokenize(line) {
  const kw = /^\b(def|for|if|in|return|else|elif|while|None|True|False|is|not|and|or|class|with)\b/;
  const num = /^\b\d+\b/;
  const str = /^("[^"]*"|'[^']*')/;
  const builtin = /^\b(len|range|list|int|set|dict|str|float|bool|tuple)\b/;
  const comment = /^#.*$/;
  const op = /^[\[\](){}:,.+\-*/<>=!|]/;
  const tokens = [];
  let rest = line;
  while (rest.length) {
    let m;
    if ((m = rest.match(/^\s+/))) { tokens.push({ t: "ws", v: m[0] }); rest = rest.slice(m[0].length); continue; }
    if ((m = rest.match(comment))) { tokens.push({ t: "comment", v: m[0] }); rest = ""; continue; }
    if ((m = rest.match(str))) { tokens.push({ t: "string", v: m[0] }); rest = rest.slice(m[0].length); continue; }
    if ((m = rest.match(kw))) { tokens.push({ t: "keyword", v: m[0] }); rest = rest.slice(m[0].length); continue; }
    if ((m = rest.match(builtin))) { tokens.push({ t: "builtin", v: m[0] }); rest = rest.slice(m[0].length); continue; }
    if ((m = rest.match(num))) { tokens.push({ t: "number", v: m[0] }); rest = rest.slice(m[0].length); continue; }
    if ((m = rest.match(/^[A-Za-z_][A-Za-z0-9_]*/))) { tokens.push({ t: "ident", v: m[0] }); rest = rest.slice(m[0].length); continue; }
    if ((m = rest.match(op))) { tokens.push({ t: "op", v: m[0] }); rest = rest.slice(m[0].length); continue; }
    tokens.push({ t: "raw", v: rest[0] });
    rest = rest.slice(1);
  }
  return tokens;
}

function tokenColor(t) {
  switch (t) {
    case "keyword": return "var(--code-keyword)";
    case "string": return "var(--code-string)";
    case "number": return "var(--code-number)";
    case "builtin": return "var(--code-builtin)";
    case "comment": return "var(--code-comment)";
    default: return "var(--ink)";
  }
}

function CodeView({ code, filename, activeLine, language = "python" }) {
  const lines = useMemo(() => code.split("\n"), [code]);
  return (
    <div
      style={{
        background: "var(--code-bg)",
        border: "1px solid var(--rule-soft)",
        fontFamily: "var(--font-mono)",
        fontSize: 13,
        lineHeight: 1.7,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "10px 14px",
          borderBottom: "1px solid var(--rule-soft)",
          background: "var(--surface)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span className="eyebrow">§ 01 · Source</span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-4)" }}>
            {filename}
          </span>
        </div>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-4)" }}>
          {lines.length} lines · {language}
        </span>
      </div>
      <div style={{ padding: "16px 18px", overflowX: "auto" }}>
        {lines.map((line, idx) => {
          const lineNo = idx + 1;
          const active = lineNo === activeLine;
          return (
            <div key={idx} className={active ? "code-line active" : "code-line"}>
              <span className="gutter">{lineNo}</span>
              <span>
                {tokenize(line).map((tok, i) => (
                  <span
                    key={i}
                    style={{
                      color: tokenColor(tok.t),
                      fontStyle: tok.t === "comment" ? "italic" : "normal",
                      whiteSpace: "pre",
                    }}
                  >
                    {tok.v}
                  </span>
                ))}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// =============================================================
// Variables panel
// =============================================================
function Variables({ vars }) {
  const entries = Object.entries(vars || {});
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
        <span className="eyebrow">§ 03 · Variables</span>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--ink-4)" }}>
          {entries.length} bound
        </span>
      </div>
      {entries.length === 0 ? (
        <div style={{ color: "var(--ink-4)", fontStyle: "italic", fontSize: 13 }}>
          (no variables)
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "6px 16px" }}>
          {entries.map(([name, val]) => (
            <React.Fragment key={name}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--accent)", fontWeight: 600 }}>
                {name}
              </span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--ink)", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                {String(val)}
              </span>
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
}

// =============================================================
// Step ribbon
// =============================================================
function StepRibbon({ frame, index, total }) {
  const label = window.AlgViz.labelFor(frame);
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "auto 1fr auto",
        alignItems: "center",
        gap: 18,
        padding: "14px 18px",
        background: "var(--surface)",
        border: "1px solid var(--rule-soft)",
        borderLeft: "3px solid var(--accent)",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--ink-3)", letterSpacing: "0.12em" }}>STEP</span>
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 28,
            fontWeight: 400,
            lineHeight: 1,
            color: "var(--ink)",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {String(index + 1).padStart(3, "0")}
        </span>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--ink-4)" }}>
          of {total}
        </span>
      </div>
      <div
        style={{
          fontFamily: "var(--font-display)",
          fontSize: 18,
          lineHeight: 1.4,
          fontStyle: "italic",
          color: "var(--ink)",
        }}
      >
        “{frame.desc}”
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--ink-3)" }}>
          line {String(frame.line).padStart(2, "0")}
        </span>
        <span
          style={{
            padding: "2px 8px",
            background: "var(--bg-tint)",
            border: "1px solid var(--rule-soft)",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            fontWeight: 600,
            color: window.AlgViz.roleColorVar(label),
            fontFamily: "var(--font-mono)",
            fontSize: 10,
          }}
        >
          {label}
        </span>
      </div>
    </div>
  );
}

// =============================================================
// StepLog — windowed list of recent steps (clickable)
// =============================================================
function StepLog({ frames, currentIdx, onJump }) {
  const start = Math.max(0, currentIdx - 4);
  const end = Math.min(frames.length, currentIdx + 6);
  const items = frames.slice(start, end);
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
        <span className="eyebrow">§ 04 · Trace log</span>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--ink-4)" }}>
          scrubbing
        </span>
      </div>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}>
        {items.map((f, i) => {
          const idx = start + i;
          const active = idx === currentIdx;
          const label = window.AlgViz.labelFor(f);
          const role = window.AlgViz.roleColorVar(label);
          return (
            <div
              key={idx}
              className={active ? "trace-row active" : "trace-row"}
              onClick={() => onJump(idx)}
              style={{
                display: "grid",
                gridTemplateColumns: "44px 56px 1fr",
                gap: 10,
                padding: "4px 8px",
                margin: "0 -8px",
                background: active ? "var(--bg-tint)" : "transparent",
                borderLeft: active ? "2px solid var(--accent)" : "2px solid transparent",
                color: active ? "var(--ink)" : "var(--ink-3)",
                opacity: active ? 1 : 0.85,
              }}
            >
              <span style={{ color: "var(--ink-4)", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                {String(idx + 1).padStart(3, "0")}
              </span>
              <span
                style={{
                  color: role,
                  textTransform: "uppercase",
                  fontWeight: 600,
                  fontSize: 10,
                  letterSpacing: "0.1em",
                  paddingTop: 1,
                }}
              >
                {label}
              </span>
              <span
                style={{
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  fontFamily: "var(--font-body)",
                  fontSize: 12,
                }}
              >
                {f.desc}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// =============================================================
// Marginalia
// =============================================================
const NOTE_FOR = {
  swap: (v) =>
    `Out of order — ${v["a[j]"] ?? "?"} should be after ${v["a[j+1]"] ?? "?"}. Pull them past one another.`,
  compare: () =>
    "Reading two adjacent values. If the left one is larger, they will trade places next.",
  pivot: () =>
    "Pivot fixed. Everything will be partitioned around this value before we recurse.",
  found: () => "Resolved — the search window collapsed onto the answer.",
  eliminated: () =>
    "Half the window goes dark. The target can't possibly live there.",
  pass: (v) =>
    `Outer pass ${v.i ?? "?"}. The right-hand positions are settled; we ignore them now.`,
  init: () =>
    "The list is read top-to-bottom each pass. Like proof-reading: pair by pair.",
};

function Marginalia({ frame }) {
  const label = window.AlgViz.labelFor(frame);
  const note = frame.note || (NOTE_FOR[label] || NOTE_FOR.init)(frame.variables || {});
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
        <span className="eyebrow">§ 05 · Marginalia</span>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--ink-4)" }}>
          —— hand
        </span>
      </div>
      <div className="marginalia-card">
        <p
          style={{
            margin: 0,
            fontFamily: "var(--font-display)",
            fontSize: 13.5,
            lineHeight: 1.55,
            fontStyle: "italic",
            color: "var(--ink-2)",
          }}
        >
          {note}
        </p>
      </div>
    </div>
  );
}

// =============================================================
// Legend
// =============================================================
const LEGEND_FOR = {
  bubble: [
    ["default", "unsorted"],
    ["compare", "comparing"],
    ["swap", "swapping"],
    ["sorted", "in place"],
  ],
  insertion: [
    ["default", "unsorted"],
    ["compare", "comparing"],
    ["pivot", "key"],
    ["sorted", "in place"],
  ],
  selection: [
    ["default", "unsorted"],
    ["compare", "comparing"],
    ["pivot", "current min"],
    ["sorted", "in place"],
  ],
  quick: [
    ["default", "unsorted"],
    ["pivot", "pivot"],
    ["swap", "swapping"],
    ["sorted", "in place"],
  ],
  merge: [
    ["default", "unsorted"],
    ["compare", "left half"],
    ["pivot", "right half"],
    ["sorted", "merged / sorted run"],
    ["swap", "writing a[k]"],
  ],
  search: [
    ["default", "candidate"],
    ["pivot", "mid"],
    ["eliminated", "eliminated"],
    ["found", "found"],
  ],
  tree: [
    ["default", "node"],
    ["pivot", "active"],
    ["swap", "violation"],
    ["sorted", "settled"],
    ["found", "chosen"],
  ],
  graph: [
    ["default", "unknown"],
    ["pivot", "frontier"],
    ["eliminated", "blocked"],
    ["found", "accepted"],
  ],
  table: [
    ["default", "cell"],
    ["pivot", "dependency"],
    ["compare", "choice"],
    ["found", "answer"],
  ],
  buckets: [
    ["default", "input"],
    ["compare", "counting"],
    ["sorted", "stable"],
    ["found", "sorted"],
  ],
  timeline: [
    ["default", "candidate"],
    ["pivot", "active"],
    ["eliminated", "rejected"],
    ["found", "selected"],
  ],
  reduction: [
    ["default", "problem"],
    ["pivot", "transform"],
    ["compare", "assumption"],
    ["found", "result"],
  ],
};

function Legend({ viewKind }) {
  const items = LEGEND_FOR[viewKind] || LEGEND_FOR.bubble;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
      <span className="eyebrow" style={{ marginRight: 4 }}>Legend</span>
      {items.map(([role, label]) => (
        <div key={role} style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span
            style={{
              display: "inline-block",
              width: 10,
              height: 14,
              background: `var(--role-${role})`,
              border: "1px solid var(--ink)",
            }}
          />
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-2)" }}>
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}

// =============================================================
// Transport — playback bar
// =============================================================
function TKey({ label, primary, onClick, title, disabled }) {
  return (
    <button
      onClick={onClick}
      title={title}
      disabled={disabled}
      className={primary ? "tkey primary" : "tkey"}
    >
      {label}
    </button>
  );
}

function Transport({
  idx, total, playing, speed,
  onPlay, onBack, onForward, onRestart, onShuffle,
  onSpeed, onJump,
}) {
  const trackRef = useRef(null);
  const onScrub = (e) => {
    const r = trackRef.current.getBoundingClientRect();
    const t = (e.clientX - r.left) / r.width;
    onJump(Math.max(0, Math.min(total - 1, Math.round(t * (total - 1)))));
  };
  return (
    <div
      className="vis-transport"
      style={{
        display: "grid",
        gridTemplateColumns: "auto 1fr auto",
        alignItems: "center",
        gap: 24,
        padding: "12px 18px",
        background: "var(--surface)",
        border: "1px solid var(--rule-soft)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <TKey label="R" onClick={onRestart} title="Restart" />
        <TKey label="S" onClick={onShuffle} title="Shuffle" />
        <span style={{ width: 12 }} />
        <TKey label="←" onClick={onBack} title="Back" disabled={idx === 0} />
        <TKey
          label={playing ? "❚❚" : "▶"}
          primary
          onClick={onPlay}
          title={playing ? "Pause" : "Play"}
          disabled={total <= 1}
        />
        <TKey label="→" onClick={onForward} title="Forward" disabled={idx === total - 1} />
      </div>

      {/* Scrubber */}
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <div ref={trackRef} className="scrubber-track" onClick={onScrub}>
          <div
            className="scrubber-fill"
            style={{ width: `${(idx / Math.max(1, total - 1)) * 100}%` }}
          />
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="scrubber-tick"
              style={{ left: `${(i / 19) * 100}%` }}
            />
          ))}
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            color: "var(--ink-4)",
          }}
        >
          <span>00 :: 00</span>
          <span style={{ color: "var(--ink-2)" }}>
            {String(idx + 1).padStart(3, "0")} / {String(total).padStart(3, "0")}
          </span>
          <span>00 :: {String(total).padStart(2, "0")}</span>
        </div>
      </div>

      {/* Tempo */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span className="eyebrow">Tempo</span>
        <input
          type="range"
          min={0}
          max={100}
          value={speed}
          onChange={(e) => onSpeed(parseInt(e.target.value, 10))}
          style={{ width: 110 }}
        />
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            color: "var(--ink-3)",
            minWidth: 36,
            textAlign: "right",
          }}
        >
          {speed}%
        </span>
      </div>
    </div>
  );
}

// =============================================================
// Masthead — eyebrow, H1, italic subtitle, stat ribbon, theme switch
// =============================================================
function StatCell({ label, value, accent }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2, alignItems: "flex-start" }}>
      <span style={{ fontSize: 10, color: "var(--ink-4)", letterSpacing: "0.15em" }}>{label}</span>
      <span
        style={{
          fontSize: 13,
          color: accent ? "var(--accent)" : "var(--ink)",
          fontWeight: 600,
          fontVariantNumeric: "tabular-nums",
          fontFamily: "var(--font-mono)",
        }}
      >
        {value}
      </span>
    </div>
  );
}

function Masthead({ algo, n, idx, total, line, doing }) {
  return (
    <header
      className="vm-masthead"
      style={{
        display: "grid",
        gridTemplateColumns: "auto 1fr",
        alignItems: "end",
        gap: 32,
        padding: "28px 36px 18px",
        borderBottom: "2px solid var(--ink)",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.2em", color: "var(--ink-3)" }}>
          ALGORITHM VISUALIZER · v0.1
        </span>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
          <h1
            style={{
              margin: 0,
              fontFamily: "var(--font-display)",
              fontSize: 44,
              fontWeight: 400,
              lineHeight: 1,
              letterSpacing: "-0.015em",
              color: "var(--ink)",
            }}
          >
            Field Notes
          </h1>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 22,
              fontStyle: "italic",
              color: "var(--ink-3)",
            }}
          >
            for {algo.toLowerCase()}
          </span>
        </div>
      </div>

      <div
        className="vm-stats"
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: 28,
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          color: "var(--ink-3)",
        }}
      >
        <StatCell label="ALGO" value={algo} />
        <StatCell label="N" value={n} />
        <StatCell
          label="STEP"
          value={`${String(idx + 1).padStart(3, "0")}/${String(total).padStart(3, "0")}`}
        />
        <StatCell label="LINE" value={String(line).padStart(2, "0")} />
        <StatCell label="DOING" value={doing.toUpperCase()} accent />
      </div>
    </header>
  );
}

// =============================================================
// Catalogue bar — algorithm tabs + size slider + shuffle
// =============================================================
function CatalogueBar({ algorithms, activeIdx, onSelect, size, onSize, sizeRange, onShuffle }) {
  return (
    <div
      className="catalogue-bar"
      style={{
        display: "grid",
        gridTemplateColumns: "var(--catalogue-grid-cols, 1fr auto)",
        gap: 14,
        alignItems: "center",
        padding: "8px 20px",
        borderBottom: "1px solid var(--rule-soft)",
      }}
    >
      {/* Mobile / narrow screens: a plain dropdown instead of the tab strip */}
      <label className="cat-select">
        <span className="eyebrow" style={{ marginRight: 10 }}>Catalogue</span>
        <select
          value={activeIdx}
          onChange={(e) => onSelect(parseInt(e.target.value, 10))}
        >
          {algorithms.map((a, i) => (
            <option key={a.name} value={i}>
              {a.name}
              {a.complexities?.avg || a.complexities?.worst
                ? ` — ${a.complexities.avg || a.complexities.worst}`
                : ""}
            </option>
          ))}
        </select>
      </label>

      <div className="cat-tabs" style={{ display: "flex", alignItems: "center", gap: 0, flexWrap: "wrap" }}>
        <span className="eyebrow" style={{ marginRight: 12 }}>Catalogue</span>
        {algorithms.map((a, i) => {
          const active = i === activeIdx;
          const big_o =
            a.complexities?.avg ||
            a.complexities?.worst ||
            "";
          return (
            <button
              key={a.name}
              className={active ? "cat-tab active" : "cat-tab"}
              onClick={() => onSelect(i)}
              style={{
                background: active ? "var(--ink)" : "transparent",
                color: active ? "var(--bg)" : "var(--ink-2)",
                border: "1px solid transparent",
                borderRight: "1px solid var(--rule-faint)",
                padding: "6px 10px",
                fontFamily: "var(--font-body)",
                fontSize: 12,
                fontWeight: active ? 600 : 400,
                cursor: "pointer",
                display: "flex",
                alignItems: "baseline",
                gap: 8,
              }}
            >
              <span>{a.name}</span>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  color: active ? "var(--bg-tint)" : "var(--ink-4)",
                  opacity: 0.85,
                }}
              >
                {big_o}
              </span>
            </button>
          );
        })}
      </div>

      <div className="cat-controls" style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {sizeRange && (
          <>
            <span className="eyebrow">Size n =</span>
            <input
              type="range"
              min={sizeRange.min}
              max={sizeRange.max}
              value={size}
              onChange={(e) => onSize(parseInt(e.target.value, 10))}
              style={{ width: 110 }}
            />
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 12,
                color: "var(--ink-2)",
                fontWeight: 600,
                minWidth: 24,
                textAlign: "right",
              }}
            >
              {size}
            </span>
          </>
        )}
        <button
          onClick={onShuffle}
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            fontWeight: 600,
            padding: "5px 12px",
            background: "var(--surface-2)",
            color: "var(--ink)",
            border: "1px solid var(--ink)",
            cursor: "pointer",
            boxShadow: "1px 1px 0 var(--rule-soft)",
          }}
        >
          ↻ shuffle
        </button>
      </div>
    </div>
  );
}

// =============================================================
// Description block (left rail, below CodeView)
// =============================================================
function Cell({ label, value }) {
  return (
    <div
      style={{
        padding: "8px 10px",
        background: "var(--bg-tint)",
        border: "1px solid var(--rule-faint)",
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 9,
          letterSpacing: "0.15em",
          color: "var(--ink-3)",
          textTransform: "uppercase",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 13,
          color: "var(--ink)",
          fontWeight: 600,
          marginTop: 2,
        }}
      >
        {value}
      </div>
    </div>
  );
}

function DescriptionBlock({ algo, lang = "en" }) {
  const translated = algo.explanation?.[lang] || algo.description;
  return (
    <div style={{ flex: 1, padding: "16px 18px", borderTop: "1px solid var(--rule-soft)" }}>
      <span className="eyebrow">§ 02 · Description</span>
      <p
        style={{
          margin: "8px 0 0",
          fontFamily: "var(--font-display)",
          fontSize: 14,
          lineHeight: 1.55,
          fontStyle: "italic",
          color: "var(--ink-2)",
        }}
      >
        {translated}
      </p>
      <div
        style={{
          marginTop: 14,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 10,
        }}
      >
        <Cell label="best" value={algo.complexities.best} />
        <Cell label="avg" value={algo.complexities.avg} />
        <Cell label="worst" value={algo.complexities.worst} />
        <Cell label="space" value={algo.complexities.space} />
      </div>
    </div>
  );
}

// =============================================================
// Viewfinder — corner-mark frame around the stage
// =============================================================
function Viewfinder({ children }) {
  const corner = (style) => ({
    position: "absolute",
    width: 14,
    height: 14,
    borderColor: "var(--ink)",
    borderStyle: "solid",
    ...style,
  });
  return (
    <div style={{ position: "relative", padding: 6 }}>
      <div style={corner({ top: 0, left: 0, borderWidth: "2px 0 0 2px" })} />
      <div style={corner({ top: 0, right: 0, borderWidth: "2px 2px 0 0" })} />
      <div style={corner({ bottom: 0, left: 0, borderWidth: "0 0 2px 2px" })} />
      <div style={corner({ bottom: 0, right: 0, borderWidth: "0 2px 2px 0" })} />
      {children}
    </div>
  );
}

// =============================================================
// Footer
// =============================================================
function Footer({ algo, idx }) {
  return (
    <footer
      style={{
        display: "grid",
        gridTemplateColumns: "auto 1fr auto",
        gap: 24,
        alignItems: "center",
        padding: "16px 36px",
        fontFamily: "var(--font-mono)",
        fontSize: 10,
        color: "var(--ink-4)",
        letterSpacing: "0.08em",
        borderTop: "1px solid var(--rule-soft)",
      }}
    >
      <span>FIELD NOTES · NO. {String(idx + 1).padStart(3, "0")}</span>
      <span style={{ textAlign: "center", color: "var(--ink-3)" }}>
        —— page {Math.floor(idx / 10) + 1} ——
      </span>
      <span>{algo.toUpperCase()} · {new Date().getFullYear()}</span>
    </footer>
  );
}

window.AlgViz = window.AlgViz || {};
Object.assign(window.AlgViz, {
  CodeView, Variables, StepRibbon, StepLog, Marginalia,
  Legend, Transport, Masthead, CatalogueBar, DescriptionBlock,
  Viewfinder, Footer,
});
})();
