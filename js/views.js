/* global React, window */
(function () {

// =============================================================
// Bars — generic bar chart that interprets every Step primitive.
//
// Layout strategy:
//   - The bars themselves live in a CSS grid `repeat(N, 1fr)` so column
//     widths stay aligned to indices.
//   - All decorations (sorted-region tints, partition outline, pair bracket,
//     ★ min badge, horizontal pivot/min lines, vertical divider) are
//     ABSOLUTE-positioned overlays on top of the same wrapper. They compute
//     their `left` / `width` from index ranges so they never compete with
//     bars for grid cells (which is what was making bars jump on step).
// =============================================================

const ROLE_PRIORITY = ["swap", "compare", "pivot", "found", "eliminated", "sorted"];
const FOCUS_ROLES = new Set(["compare", "swap", "pivot", "found"]);

function roleAt(highlights, idx) {
  for (const r of ROLE_PRIORITY) {
    if (highlights[r] && highlights[r].includes(idx)) return r;
  }
  return null;
}

// Convert an inclusive index range [lo, hi] into the {left, width} percent
// pair that overlays exactly the bar columns lo..hi (treating the bar grid
// as N equal columns; gaps between bars are bridged by the overlay).
function bandOf(lo, hi, n) {
  const cell = 100 / n;
  return {
    left: `${lo * cell}%`,
    width: `${(hi - lo + 1) * cell}%`,
  };
}

function columnLeftPct(idx, n) {
  return `${(idx + 0.5) * (100 / n)}%`;
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

  // Headroom above the bar grid: pointer rail + (optional) floating-box
  // band + (optional) ★ min badge band.
  const hasFloating = floatingIndices.size > 0;
  const pointerStack = Math.max(
    1,
    ...Object.values(pointerByIdx).map((ns) => ns.length)
  );
  const pointerH = 6 + pointerStack * 18 + 8;
  const floatingH = hasFloating ? 60 : 0;
  const minBadgeH = viewKind === "selection" ? 22 : 0;
  const topBand = pointerH + floatingH + minBadgeH;

  // ---- Sorted-region tint band ----
  let sortedBand = null;
  if (
    (viewKind === "bubble" ||
      viewKind === "selection" ||
      viewKind === "insertion") &&
    (highlights.sorted || []).length > 0
  ) {
    const s = [...highlights.sorted].sort((a, b) => a - b);
    sortedBand = { from: s[0], to: s[s.length - 1] };
  }
  // ---- Quick-sort partition window + ≤-region ----
  const frameWin = Array.isArray(windows.frame) ? windows.frame : null;
  const leWin = Array.isArray(windows.le) ? windows.le : null;

  // ---- Selection-sort: ★ min + horizontal min-value line ----
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

  // ---- Vertical sorted/unsorted divider ----
  let divider = null;
  if (viewKind === "bubble") {
    const sortedIdx = (highlights.sorted || []).slice().sort((a, b) => a - b);
    if (sortedIdx.length && sortedIdx[0] > 0 && sortedIdx[0] < n) {
      divider = { at: sortedIdx[0] };
    }
  } else if (viewKind === "selection" || viewKind === "insertion") {
    const i = frame.variables?.i;
    if (typeof i === "number" && i > 0 && i < n) {
      divider = { at: i };
    }
  }

  // ---- Insertion-sort gap (rendered as outlined slot in place of the bar) ----
  const gapWindow = Array.isArray(windows.gap) ? windows.gap : null;
  const gapIdx = gapWindow ? gapWindow[0] : null;

  // ---- Quick-sort horizontal pivot line (height-relative y) ----
  const hasPivotLine =
    viewKind === "quick" &&
    typeof frame.variables?.pivot === "number" &&
    frameWin;

  const cols = `repeat(${n}, 1fr)`;

  return (
    <div style={{ position: "relative", padding: "0 4px" }}>
      {/* Headroom above bars for the pointer rail, floating boxes, ★ min badge */}
      <div style={{ height: topBand, position: "relative" }}>
        {/* ---------- Pointer rail (chips above bars) ---------- */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: pointerH,
            display: "grid",
            gridTemplateColumns: cols,
            gap: 4,
            alignItems: "end",
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
                paddingBottom: 4,
              }}
            >
              {pointerByIdx[idx]?.map((name) => (
                <div key={name} className="chip">
                  {name}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* ---------- Floating boxes (insertion-sort key) ---------- */}
        {hasFloating &&
          Object.entries(floating).map(([idxStr, value]) => {
            const idx = +idxStr;
            const left = columnLeftPct(idx, n);
            return (
              <div
                key={idx}
                style={{
                  position: "absolute",
                  left,
                  bottom: pointerH + 6,
                  transform: "translateX(-50%)",
                  pointerEvents: "none",
                }}
              >
                <div
                  style={{
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
              </div>
            );
          })}

        {/* ---------- ★ min badge ---------- */}
        {selectionMin && (
          <div
            style={{
              position: "absolute",
              left: columnLeftPct(selectionMin.idx, n),
              bottom: pointerH + floatingH + 4,
              transform: "translateX(-50%)",
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              fontWeight: 700,
              color: "var(--role-pivot)",
              whiteSpace: "nowrap",
              pointerEvents: "none",
            }}
          >
            ★ min
          </div>
        )}
      </div>

      {/* ---------- Bars + decorations ---------- */}
      <div
        className="bars-row"
        style={{
          position: "relative",
          height,
        }}
      >
        {/* === Decoration overlays (BEHIND the bars) === */}

        {/* Sorted-region soft tint */}
        {sortedBand && (
          <div
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              ...bandOf(sortedBand.from, sortedBand.to, n),
              background:
                "color-mix(in srgb, var(--role-sorted) 12%, transparent)",
              pointerEvents: "none",
              zIndex: 0,
            }}
          />
        )}

        {/* Quick-sort ≤-pivot region tint */}
        {leWin && leWin[0] <= leWin[1] && (
          <div
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              ...bandOf(leWin[0], leWin[1], n),
              background:
                "color-mix(in srgb, var(--role-pivot) 12%, transparent)",
              pointerEvents: "none",
              zIndex: 0,
            }}
          />
        )}

        {/* Quick-sort partition window outline */}
        {frameWin && frameWin[0] <= frameWin[1] && (
          <div
            style={{
              position: "absolute",
              top: -6,
              bottom: -6,
              ...bandOf(frameWin[0], frameWin[1], n),
              border: "1px dashed var(--ink-3)",
              pointerEvents: "none",
              zIndex: 0,
            }}
          />
        )}

        {/* Vertical sorted/unsorted divider */}
        {divider && (
          <div
            style={{
              position: "absolute",
              left: `${(divider.at * 100) / n}%`,
              top: -8,
              bottom: -8,
              width: 0,
              borderLeft: "1px dashed var(--role-sorted)",
              pointerEvents: "none",
              zIndex: 0,
            }}
          />
        )}

        {/* === Bars themselves (in their own clean grid) === */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "grid",
            gridTemplateColumns: cols,
            gap: 4,
            alignItems: "end",
            zIndex: 1,
          }}
        >
          {data.map((value, idx) => {
            const isGap = gapIdx === idx;
            const role = roleAt(highlights, idx);
            const fill = role ? `var(--role-${role})` : "var(--role-default)";
            const h = (value / Math.max(maxValue, 1)) * (height - 4);
            const isFocus = role && FOCUS_ROLES.has(role);
            return (
              <div
                key={idx}
                style={{
                  gridColumn: `${idx + 1} / ${idx + 2}`,
                  position: "relative",
                  height: "100%",
                  display: "flex",
                  alignItems: "flex-end",
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
        </div>

        {/* === Above-bars overlays === */}

        {/* Bubble pair bracket (sits at top of bars area) */}
        {pairBracket && (
          <div
            style={{
              position: "absolute",
              top: -10,
              ...bandOf(pairBracket.from, pairBracket.to, n),
              borderTop: `2px solid var(--role-${pairBracket.role})`,
              borderLeft: `2px solid var(--role-${pairBracket.role})`,
              borderRight: `2px solid var(--role-${pairBracket.role})`,
              height: 8,
              pointerEvents: "none",
              zIndex: 2,
            }}
          />
        )}

        {/* Quick-sort pivot horizontal line */}
        {hasPivotLine &&
          (() => {
            const pv = frame.variables.pivot;
            const y = (pv / Math.max(maxValue, 1)) * (height - 4);
            return (
              <div
                style={{
                  position: "absolute",
                  ...bandOf(frameWin[0], frameWin[1], n),
                  bottom: y,
                  height: 0,
                  borderTop: "1px dashed var(--role-pivot)",
                  pointerEvents: "none",
                  zIndex: 2,
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    bottom: 4,
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
                </span>
              </div>
            );
          })()}

        {/* Selection horizontal min line */}
        {viewKind === "selection" &&
          selectionMin &&
          (() => {
            const i = frame.variables?.i ?? 0;
            const lo = Math.max(0, Math.min(i, n - 1));
            const y = (selectionMin.value / Math.max(maxValue, 1)) * (height - 4);
            return (
              <div
                style={{
                  position: "absolute",
                  ...bandOf(lo, n - 1, n),
                  bottom: y,
                  height: 0,
                  borderTop: "1px dashed var(--role-pivot)",
                  pointerEvents: "none",
                  zIndex: 2,
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    bottom: 4,
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
                </span>
              </div>
            );
          })()}

        {/* Floating-box → gap-slot dotted connectors */}
        {hasFloating &&
          Object.keys(floating).map((idxStr) => {
            const idx = +idxStr;
            return (
              <div
                key={`conn-${idx}`}
                style={{
                  position: "absolute",
                  left: columnLeftPct(idx, n),
                  top: -22,
                  bottom: 18,
                  width: 0,
                  borderLeft: "1px dotted var(--role-pivot)",
                  pointerEvents: "none",
                  zIndex: 2,
                }}
              />
            );
          })}
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

// =============================================================
// Top-level dispatch
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
