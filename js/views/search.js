/* global React, window */
// =====================================================================
// SearchView — binary-search cell strip: a [lo,hi] window bracket, dimmed
// eliminated halves, and a mid marker. (viewKind "search")
// =====================================================================
(function () {
function SearchView({ frame, maxValue, height = 280 }) {
  const data = frame.data;
  const n = data.length;
  const v = frame.variables || {};
  const lo = typeof v.lo === "number" ? v.lo : 0;
  const hi = typeof v.hi === "number" ? v.hi : n - 1;
  const mid = typeof v.mid === "number" ? v.mid : null;
  const target = v.target;
  const found = (frame.highlights?.found || []).slice();

  const cellStyle = (idx) => {
    const inRange = idx >= lo && idx <= hi;
    let bg, color;
    if (found.includes(idx)) {
      bg = "var(--role-found)";
      color = "var(--surface-2)";
    } else if (mid === idx) {
      bg = "var(--role-pivot)";
      color = "var(--surface-2)";
    } else if (!inRange) {
      bg = "var(--role-eliminated)";
      color = "var(--ink-3)";
    } else {
      bg = "var(--role-default)";
      color = "var(--surface-2)";
    }
    return { bg, color };
  };

  const cols = `repeat(${n}, 1fr)`;

  const ptrAt = {};
  for (const [name, val] of Object.entries({ lo, mid, hi })) {
    if (typeof val !== "number" || val < 0 || val >= n) continue;
    if (!ptrAt[val]) ptrAt[val] = [];
    ptrAt[val].push(name);
  }

  return (
    <div style={{ width: "100%", padding: "0 4px" }}>
      {target !== undefined && (
        <div
          style={{
            textAlign: "center",
            fontFamily: "var(--font-display)",
            fontStyle: "italic",
            fontSize: 16,
            color: "var(--accent)",
            marginBottom: 12,
          }}
        >
          target = {target}
        </div>
      )}

      <div
        style={{
          textAlign: "center",
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: 1.2,
          textTransform: "uppercase",
          color: "var(--ink-2)",
          marginBottom: 6,
        }}
      >
        WINDOW [{lo} .. {hi}] · {hi - lo + 1} candidate
        {hi - lo + 1 === 1 ? "" : "s"}
      </div>

      {/* Pointer rail */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: cols,
          gap: 4,
          height: 28,
          marginBottom: 6,
        }}
      >
        {data.map((_, idx) => (
          <div
            key={idx}
            style={{
              gridColumn: `${idx + 1} / ${idx + 2}`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: 2,
            }}
          >
            {ptrAt[idx]?.map((name) => (
              <div key={name} className="chip">{name}</div>
            ))}
          </div>
        ))}
      </div>

      {/* Cells with absolute-positioned bracket */}
      <div style={{ position: "relative", padding: 6 }}>
        {lo <= hi && (
          <div
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: `${(lo / n) * 100}%`,
              width: `${((hi - lo + 1) / n) * 100}%`,
              border: "1px dashed var(--ink)",
              pointerEvents: "none",
            }}
          />
        )}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: cols,
            gap: 4,
            position: "relative",
          }}
        >
          {data.map((value, idx) => {
            const { bg, color } = cellStyle(idx);
            return (
              <div
                key={idx}
                style={{
                  gridColumn: `${idx + 1} / ${idx + 2}`,
                  height: 56,
                  background: bg,
                  border: "1px solid var(--ink)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "var(--font-mono)",
                  fontSize: 13,
                  fontWeight: 600,
                  color,
                  transition: "background 200ms var(--ease-out)",
                }}
              >
                {value}
              </div>
            );
          })}
        </div>
      </div>

      {/* Index row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: cols,
          gap: 4,
          marginTop: 8,
        }}
      >
        {data.map((_, idx) => (
          <div
            key={idx}
            style={{
              gridColumn: `${idx + 1} / ${idx + 2}`,
              textAlign: "center",
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              color: "var(--ink-4)",
            }}
          >
            {idx}
          </div>
        ))}
      </div>
      {v.eliminated && mid !== null && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            marginTop: 8,
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            color: "var(--ink-4)",
          }}
        >
          <span style={{ textAlign: "center" }}>
            {v.eliminated === "left" ? "← eliminated" : ""}
          </span>
          <span style={{ textAlign: "center" }}>
            {v.eliminated === "right" ? "eliminated →" : ""}
          </span>
        </div>
      )}
    </div>
  );
}


window.AlgViz = window.AlgViz || {};
window.AlgViz.SearchView = SearchView;
})();
