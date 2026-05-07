/* global React, window */
(function () {

// =============================================================
// Bars — generic bar chart that interprets every Step primitive.
//
// A single "Bars" component handles all four sort visualizations.
// Per-algorithm flavor is driven by what the frame contains:
//   - highlights → bar fill colors
//   - pointers   → labelled chips above bars
//   - windows    → "frame" outlines / "le" region shades / "gap" empty slots
//   - floating   → small boxes above the named index
//   - viewKind   → opt-in extra decorations (pair bracket, divider,
//                  ★ min badge, pivot horizontal line)
// =============================================================

const ROLE_PRIORITY = ["swap", "compare", "pivot", "found", "eliminated", "sorted"];
const FOCUS_ROLES = new Set(["compare", "swap", "pivot", "found"]);

function roleAt(highlights, idx) {
  for (const r of ROLE_PRIORITY) {
    if (highlights[r] && highlights[r].includes(idx)) return r;
  }
  return null;
}

function Bars({ frame, viewKind, maxValue, height = 280 }) {
  const data = frame.data;
  const n = data.length;
  const highlights = frame.highlights || {};
  const pointers = frame.pointers || {};
  const windows = frame.windows || {};
  const floating = frame.floating || {};

  // Pointer chips suppressed at indices that already host a floating box.
  const floatingIndices = new Set(Object.keys(floating).map((k) => +k));
  const pointerByIdx = {};
  for (const [name, idx] of Object.entries(pointers)) {
    if (floatingIndices.has(idx)) continue;
    if (!pointerByIdx[idx]) pointerByIdx[idx] = [];
    pointerByIdx[idx].push(name);
  }

  const hasFloating = floatingIndices.size > 0;
  const hasPivotLine =
    viewKind === "quick" &&
    typeof frame.variables?.pivot === "number" &&
    Array.isArray(windows.frame);

  // Top decoration band — extra room above bars for floating boxes,
  // pair brackets, ★ badges, etc.
  const topBand =
    (hasFloating ? 56 : 0) +
    (viewKind === "selection" ? 24 : 0) + // ★ min badge headroom
    8;

  // ---- Selection-sort decorations (★ min badge + horizontal min line) ----
  let selectionMin = null;
  if (viewKind === "selection") {
    const pivotIdx = highlights.pivot && highlights.pivot[0];
    if (typeof pivotIdx === "number" && pivotIdx >= 0 && pivotIdx < n) {
      selectionMin = { idx: pivotIdx, value: data[pivotIdx] };
    }
  }

  // ---- Pair bracket (bubble) ----
  let pairBracket = null;
  if (viewKind === "bubble") {
    const compare = (highlights.compare || []).slice().sort((a, b) => a - b);
    const swap = (highlights.swap || []).slice().sort((a, b) => a - b);
    const pair = swap.length ? swap : compare;
    if (pair.length >= 2) {
      pairBracket = {
        from: pair[0],
        to: pair[pair.length - 1],
        role: swap.length ? "swap" : "compare",
      };
    }
  }

  // ---- Sorted-suffix divider (bubble + selection + insertion) ----
  let divider = null;
  if (viewKind === "bubble") {
    const sortedIdx = (highlights.sorted || []).slice().sort((a, b) => a - b);
    if (sortedIdx.length && sortedIdx[0] > 0 && sortedIdx[0] < n) {
      divider = { at: sortedIdx[0], leftLabel: "unsorted", rightLabel: "sorted" };
    }
  } else if (viewKind === "selection" || viewKind === "insertion") {
    const i = frame.variables?.i;
    if (typeof i === "number" && i > 0 && i < n) {
      divider = {
        at: i,
        leftLabel: "sorted",
        rightLabel: viewKind === "insertion" ? "unsorted" : "unsorted",
      };
    }
  }

  // ---- Insertion-sort gap (rendered as outlined slot) ----
  const gapWindow = Array.isArray(windows.gap) ? windows.gap : null;
  const gapIdx = gapWindow ? gapWindow[0] : null;

  // ---- Quick-sort frame box + le region ----
  const frameWin = Array.isArray(windows.frame) ? windows.frame : null;
  const leWin = Array.isArray(windows.le) ? windows.le : null;

  // CSS column tracks
  const cols = `repeat(${n}, 1fr)`;
  const colSpan = (lo, hi) => ({
    gridColumn: `${lo + 1} / ${hi + 2}`,
  });

  return (
    <div style={{ position: "relative", padding: "0 4px", paddingTop: topBand }}>
      {/* ---------- Pointer rail ---------- */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: cols,
          gap: 4,
          minHeight: 28,
          marginBottom: 6,
          alignItems: "end",
        }}
      >
        {data.map((_, idx) => (
          <div
            key={idx}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: 2,
            }}
          >
            {pointerByIdx[idx]?.map((name) => (
              <div key={name} className="chip">{name}</div>
            ))}
          </div>
        ))}
      </div>

      {/* ---------- Floating boxes (insertion-sort key) ---------- */}
      {hasFloating && (
        <div
          style={{
            position: "relative",
            display: "grid",
            gridTemplateColumns: cols,
            gap: 4,
            height: 0,
          }}
        >
          {Object.entries(floating).map(([idxStr, value]) => {
            const idx = +idxStr;
            return (
              <div
                key={idx}
                style={{
                  ...colSpan(idx, idx),
                  position: "relative",
                  height: 0,
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    left: "50%",
                    transform: "translateX(-50%)",
                    bottom: 4,
                    padding: "4px 10px",
                    background: "var(--surface-2)",
                    border: "1px solid var(--ink)",
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    fontWeight: 600,
                    color: "var(--role-pivot)",
                    whiteSpace: "nowrap",
                  }}
                >
                  ↑ key={value}
                </div>
                {/* dotted connector to slot */}
                <div
                  style={{
                    position: "absolute",
                    left: "50%",
                    bottom: -22,
                    width: 0,
                    height: 22,
                    borderLeft: "1px dotted var(--role-pivot)",
                  }}
                />
              </div>
            );
          })}
        </div>
      )}

      {/* ---------- Bars ---------- */}
      <div
        className="bars-row"
        style={{
          display: "grid",
          gridTemplateColumns: cols,
          gap: 4,
          height,
          alignItems: "end",
          position: "relative",
        }}
      >
        {/* Quick-sort window outline (sits behind bars) */}
        {frameWin && (
          <div
            style={{
              ...colSpan(frameWin[0], frameWin[1]),
              gridRow: 1,
              border: "1px dashed var(--ink-3)",
              alignSelf: "stretch",
              margin: "-6px -4px",
              pointerEvents: "none",
            }}
          />
        )}
        {/* Quick-sort ≤-pivot region tint */}
        {leWin && leWin[0] <= leWin[1] && (
          <div
            style={{
              ...colSpan(leWin[0], leWin[1]),
              gridRow: 1,
              background:
                "color-mix(in srgb, var(--role-pivot) 12%, transparent)",
              alignSelf: "stretch",
              margin: "0 -2px",
              pointerEvents: "none",
            }}
          />
        )}
        {/* Bubble / selection sorted-region tint */}
        {(viewKind === "bubble" || viewKind === "selection" || viewKind === "insertion") &&
          (highlights.sorted || []).length > 0 &&
          (() => {
            const s = [...highlights.sorted].sort((a, b) => a - b);
            return (
              <div
                style={{
                  ...colSpan(s[0], s[s.length - 1]),
                  gridRow: 1,
                  background:
                    "color-mix(in srgb, var(--role-sorted) 12%, transparent)",
                  alignSelf: "stretch",
                  margin: "0 -2px",
                  pointerEvents: "none",
                }}
              />
            );
          })()}

        {/* Bars themselves */}
        {data.map((value, idx) => {
          const isGap = gapIdx === idx;
          const role = roleAt(highlights, idx);
          // Default fill: prussian blue (or the sorted-suffix tint via region)
          const fill = role
            ? `var(--role-${role})`
            : `var(--role-default)`;
          const h = (value / Math.max(maxValue, 1)) * (height - 4);
          const isFocus = role && FOCUS_ROLES.has(role);
          return (
            <div
              key={idx}
              style={{
                gridRow: 1,
                position: "relative",
                height: "100%",
                display: "flex",
                alignItems: "flex-end",
                zIndex: 1,
              }}
            >
              {isGap ? (
                <div
                  style={{
                    width: "100%",
                    height: 18,
                    border: "1px dashed var(--rule-strong)",
                  }}
                />
              ) : (
                <div
                  style={{
                    width: "100%",
                    height: h,
                    background: fill,
                    border: "1px solid var(--ink)",
                    borderBottom: "none",
                    position: "relative",
                    transition:
                      "height 200ms var(--ease-out), background 200ms var(--ease-out)",
                  }}
                >
                  {isFocus && (
                    <div
                      style={{
                        position: "absolute",
                        top: -22,
                        left: 0,
                        right: 0,
                        textAlign: "center",
                        fontFamily: "var(--font-mono)",
                        fontSize: 10,
                        fontWeight: 700,
                        color: `var(--role-${role})`,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {value}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Bubble pair bracket */}
        {pairBracket && (
          <div
            style={{
              ...colSpan(pairBracket.from, pairBracket.to),
              gridRow: 1,
              alignSelf: "start",
              marginTop: -10,
              marginLeft: -3,
              marginRight: -3,
              borderTop: `2px solid var(--role-${pairBracket.role})`,
              borderLeft: `2px solid var(--role-${pairBracket.role})`,
              borderRight: `2px solid var(--role-${pairBracket.role})`,
              height: 8,
              pointerEvents: "none",
              zIndex: 2,
            }}
          />
        )}

        {/* Selection ★ min badge */}
        {selectionMin && (
          <div
            style={{
              ...colSpan(selectionMin.idx, selectionMin.idx),
              gridRow: 1,
              alignSelf: "start",
              marginTop: -36,
              textAlign: "center",
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              fontWeight: 700,
              color: "var(--role-pivot)",
              whiteSpace: "nowrap",
              pointerEvents: "none",
              zIndex: 2,
            }}
          >
            ★ min
          </div>
        )}

        {/* Quick pivot horizontal line spanning the frame */}
        {hasPivotLine &&
          (() => {
            const pv = frame.variables.pivot;
            const y = (pv / Math.max(maxValue, 1)) * (height - 4);
            return (
              <div
                style={{
                  ...colSpan(frameWin[0], frameWin[1]),
                  gridRow: 1,
                  position: "relative",
                  alignSelf: "end",
                  height: 0,
                  pointerEvents: "none",
                  zIndex: 3,
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    bottom: y,
                    left: 0,
                    right: 0,
                    borderTop: "1px dashed var(--role-pivot)",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    bottom: y + 4,
                    right: 4,
                    fontFamily: "var(--font-mono)",
                    fontSize: 10,
                    fontWeight: 600,
                    color: "var(--role-pivot)",
                    background: "var(--surface)",
                    padding: "0 4px",
                  }}
                >
                  pivot = {pv}
                </div>
              </div>
            );
          })()}

        {/* Selection min horizontal line */}
        {viewKind === "selection" && selectionMin &&
          (() => {
            const i = frame.variables?.i ?? 0;
            const y = (selectionMin.value / Math.max(maxValue, 1)) * (height - 4);
            const lo = Math.max(0, Math.min(i, n - 1));
            return (
              <div
                style={{
                  ...colSpan(lo, n - 1),
                  gridRow: 1,
                  position: "relative",
                  alignSelf: "end",
                  height: 0,
                  pointerEvents: "none",
                  zIndex: 3,
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    bottom: y,
                    left: 0,
                    right: 0,
                    borderTop: "1px dashed var(--role-pivot)",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    bottom: y + 4,
                    right: 4,
                    fontFamily: "var(--font-mono)",
                    fontSize: 10,
                    fontWeight: 600,
                    color: "var(--role-pivot)",
                    background: "var(--surface)",
                    padding: "0 4px",
                  }}
                >
                  current min = {selectionMin.value}
                </div>
              </div>
            );
          })()}
      </div>

      {/* ---------- Index rail ---------- */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: cols,
          gap: 4,
          marginTop: 6,
        }}
      >
        {data.map((_, idx) => (
          <div
            key={idx}
            style={{
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

      {/* ---------- Vertical sorted/unsorted divider ---------- */}
      {divider &&
        (() => {
          // Position the divider at the boundary between two columns. We
          // overlay an absolutely-positioned line that spans the bars area.
          const left = `calc(${(divider.at / n) * 100}% + 4px)`;
          return (
            <div
              style={{
                position: "absolute",
                left,
                top: topBand,
                bottom: 32,
                width: 0,
                borderLeft: "1px dashed var(--role-sorted)",
                pointerEvents: "none",
                zIndex: 1,
              }}
              aria-hidden
            />
          );
        })()}
    </div>
  );
}

// =============================================================
// SearchView — cell strip with window bracket + dimmed halves
// =============================================================
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
  const colSpan = (a, b) => ({ gridColumn: `${a + 1} / ${b + 2}` });

  const ptrAt = {};
  for (const [name, val] of Object.entries({ lo, mid, hi })) {
    if (typeof val !== "number" || val < 0 || val >= n) continue;
    if (!ptrAt[val]) ptrAt[val] = [];
    ptrAt[val].push(name);
  }

  return (
    <div style={{ width: "100%", padding: "0 4px" }}>
      {/* Target banner */}
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

      {/* Window bracket label + frame */}
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

      {/* Cells with bracket frame around [lo..hi] */}
      <div
        style={{
          position: "relative",
          padding: 6,
        }}
      >
        {/* Bracket frame */}
        {lo <= hi && (
          <div
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: `calc(${(lo / n) * 100}%)`,
              width: `calc(${((hi - lo + 1) / n) * 100}%)`,
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

      {/* Index row + eliminated label */}
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

// =============================================================
// Top-level dispatch — pick the right visualization
// =============================================================
function Visualization({ frame, viewKind, maxValue, height }) {
  if (viewKind === "search") {
    return <SearchView frame={frame} maxValue={maxValue} height={height} />;
  }
  return (
    <Bars
      frame={frame}
      viewKind={viewKind}
      maxValue={maxValue}
      height={height}
    />
  );
}

window.AlgViz = window.AlgViz || {};
window.AlgViz.Bars = Bars;
window.AlgViz.SearchView = SearchView;
window.AlgViz.Visualization = Visualization;
})();
