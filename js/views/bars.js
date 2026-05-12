/* global React, window */
// =====================================================================
// Bars — the generic bar-chart view used by every array-based algorithm
// (bubble / insertion / selection / quick / merge sorts; viewKind picks the
// extra decorations). Interprets the Frame primitives data / highlights /
// pointers / windows / floating / merge into bars + absolute-positioned
// overlays. Self-contained: roleAt / bandOf / columnLeftPct are private here.
// =====================================================================
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

  // ---- Merge-sort divide & conquer overlays ----
  const isMerge = viewKind === "merge";
  const depthStack = isMerge && Array.isArray(windows.depthStack) ? windows.depthStack : null;
  const leftHalf = isMerge && Array.isArray(windows.leftHalf) ? windows.leftHalf : null;
  const rightHalf = isMerge && Array.isArray(windows.rightHalf) ? windows.rightHalf : null;
  const mergedWin = isMerge && Array.isArray(windows.merged) ? windows.merged : null;
  const runWins = isMerge && Array.isArray(windows.runs) ? windows.runs : null;
  const mergeInfo = isMerge && frame.merge ? frame.merge : null;
  const BRACKET_STEP = 15;
  // Reserve a fixed amount of headroom for the deepest possible bracket stack
  // so the bars never shift between steps.
  const mergeBracketsH = isMerge ? (Math.ceil(Math.log2(Math.max(2, n))) + 1) * BRACKET_STEP + 8 : 0;
  // For merge sort, the bars take ~60% of the stage and the bottom holds the
  // two "lifted out" half-buffers; the panel area is reserved on every step so
  // the bars don't jump between divide / merge frames.
  const barAreaH = isMerge ? Math.round(height * 0.58) : height;
  const panelBarsH = isMerge ? Math.round(height * 0.30) : 0;
  const mergePanelH = isMerge ? panelBarsH + 56 : 0;   // 12 (title) + 16 (chips) + bars + slack

  // Pointer chips suppressed at indices that already host a floating box.
  const floatingIndices = new Set(Object.keys(floating).map((k) => +k));
  const pointerByIdx = {};
  for (const [name, idx] of Object.entries(pointers)) {
    if (floatingIndices.has(idx)) continue;
    if (!pointerByIdx[idx]) pointerByIdx[idx] = [];
    pointerByIdx[idx].push(name);
  }

  // Headroom above the bar grid is carved into three vertical rows so
  // labels and markers never sit at the same y:
  //
  //   chips           ← topmost (j, j+1, i, …)
  //   pair bracket    ← above the focus-value labels
  //   focus values    ← just above tall bars (15, 17, …)
  //   bars
  //
  // CHIP_TO_BARS reserves the space for the bracket + focus labels rows
  // BETWEEN the chip rail and the bar tops.
  const hasFloating = floatingIndices.size > 0;
  const pointerStack = Math.max(
    1,
    ...Object.values(pointerByIdx).map((ns) => ns.length)
  );
  const pointerH = 6 + pointerStack * 18 + 8;
  const floatingH = hasFloating ? 60 : 0;
  const minBadgeH = viewKind === "selection" ? 22 : 0;
  const FOCUS_LABEL_GAP = 22;   // top: -22 of bars-row for the value labels
  const BRACKET_GAP = 14;        // pair-bracket lives above the focus labels
  const CHIP_TO_BARS = FOCUS_LABEL_GAP + BRACKET_GAP + 4;
  const topBand = pointerH + CHIP_TO_BARS + floatingH + minBadgeH + mergeBracketsH;

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
        {/* ---------- Merge-sort recursion brackets (deepest nearest the bars) ---------- */}
        {depthStack &&
          depthStack.map((w, m) => {
            const fromBottom = depthStack.length - 1 - m; // 0 = deepest = lowest
            const bottom =
              CHIP_TO_BARS + pointerH + floatingH + minBadgeH + 4 + fromBottom * BRACKET_STEP;
            const active = m === depthStack.length - 1;
            const col = active ? "var(--accent)" : "var(--rule-strong)";
            return (
              <div
                key={`brk-${m}`}
                style={{
                  position: "absolute",
                  bottom,
                  ...bandOf(w.lo, w.hi, n),
                  height: BRACKET_STEP - 5,
                  borderTop: `2px solid ${col}`,
                  borderLeft: `2px solid ${col}`,
                  borderRight: `2px solid ${col}`,
                  boxSizing: "border-box",
                  pointerEvents: "none",
                  zIndex: 1,
                }}
              >
                {active && (
                  <span
                    style={{
                      position: "absolute",
                      top: -1,
                      left: "50%",
                      transform: "translate(-50%, -100%)",
                      fontFamily: "var(--font-mono)",
                      fontSize: 9,
                      fontWeight: 700,
                      color: "var(--accent)",
                      background: "var(--surface)",
                      padding: "0 3px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    [{w.lo}..{w.hi}]
                  </span>
                )}
              </div>
            );
          })}
        {/* ---------- Pointer rail (chips above bars) ---------- */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: CHIP_TO_BARS,
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
                  bottom: pointerH + CHIP_TO_BARS + 6,
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
              bottom: pointerH + CHIP_TO_BARS + floatingH + 4,
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
          height: barAreaH,
        }}
      >
        {/* === Decoration overlays (BEHIND the bars) === */}

        {/* Merge-sort: finished sorted runs (light green) */}
        {runWins &&
          runWins.map(([lo, hi], ri) =>
            lo <= hi ? (
              <div
                key={`run-${ri}`}
                style={{
                  position: "absolute",
                  top: 0,
                  bottom: 0,
                  ...bandOf(lo, hi, n),
                  background: "color-mix(in srgb, var(--role-sorted) 14%, transparent)",
                  borderLeft: "1px solid color-mix(in srgb, var(--role-sorted) 35%, transparent)",
                  borderRight: "1px solid color-mix(in srgb, var(--role-sorted) 35%, transparent)",
                  boxSizing: "border-box",
                  pointerEvents: "none",
                  zIndex: 0,
                }}
              />
            ) : null
          )}

        {/* Merge-sort: left half being merged (compare colour) */}
        {leftHalf && leftHalf[0] <= leftHalf[1] && (
          <div
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              ...bandOf(leftHalf[0], leftHalf[1], n),
              background: "color-mix(in srgb, var(--role-compare) 16%, transparent)",
              pointerEvents: "none",
              zIndex: 0,
            }}
          />
        )}
        {/* Merge-sort: right half being merged (pivot colour) */}
        {rightHalf && rightHalf[0] <= rightHalf[1] && (
          <div
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              ...bandOf(rightHalf[0], rightHalf[1], n),
              background: "color-mix(in srgb, var(--role-pivot) 16%, transparent)",
              pointerEvents: "none",
              zIndex: 0,
            }}
          />
        )}
        {/* Merge-sort: merged-so-far prefix (green, drawn on top of the halves) */}
        {mergedWin && mergedWin[0] <= mergedWin[1] && (
          <div
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              ...bandOf(mergedWin[0], mergedWin[1], n),
              background: "color-mix(in srgb, var(--role-sorted) 26%, transparent)",
              borderRight: "2px solid var(--role-sorted)",
              boxSizing: "border-box",
              pointerEvents: "none",
              zIndex: 0,
            }}
          />
        )}

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
            const blank = mergeInfo && idx >= mergeInfo.k && idx <= mergeInfo.hi;
            const role = roleAt(highlights, idx);
            const fill = role ? `var(--role-${role})` : "var(--role-default)";
            const h = (value / Math.max(maxValue, 1)) * (barAreaH - 4);
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
                {blank ? (
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      border: "1px dashed color-mix(in srgb, var(--role-sorted) 45%, var(--rule-strong))",
                      background: "color-mix(in srgb, var(--role-sorted) 5%, transparent)",
                      boxSizing: "border-box",
                    }}
                  />
                ) : isGap ? (
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

        {/* Bubble pair bracket — sits ABOVE the focus value labels so the
            two never share a row. */}
        {pairBracket && (
          <div
            style={{
              position: "absolute",
              top: -(FOCUS_LABEL_GAP + 12),
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

      {/* ---------- Merge-sort: the two "lifted out" half-buffers ---------- */}
      {isMerge && mergeInfo && (() => {
        const { left, right, i, j } = mergeInfo;
        // Each buffer lives in its own well-separated box so the two arrays
        // read as distinct collections (no longer column-aligned to the array).
        const renderHalf = (vals, ptr, ptrName, accent, box) => {
          const m = vals.length;
          return (
            <div
              key={ptrName}
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                ...box,
                display: "grid",
                gridTemplateColumns: `repeat(${m}, minmax(0, 26px))`,
                gap: 5,
                justifyContent: "center",
                alignContent: "stretch",
                border: "1px solid var(--rule-soft)",
                borderRadius: 2,
                background: `color-mix(in srgb, ${accent} 6%, transparent)`,
                padding: "0 6px",
              }}
            >
              {vals.map((v, k) => {
                const consumed = k < ptr;
                const cur = k === ptr;
                const bh = Math.max(2, (v / Math.max(maxValue, 1)) * (panelBarsH - 4));
                return (
                  <div
                    key={k}
                    style={{
                      gridColumn: `${k + 1} / ${k + 2}`,
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                    }}
                  >
                    <div style={{ height: 18, display: "flex", alignItems: "flex-end", marginBottom: 2 }}>
                      {cur && <div className="chip">{ptrName}</div>}
                    </div>
                    <div style={{ flex: 1 }} />
                    {consumed ? (
                      <div
                        style={{
                          width: "100%",
                          height: bh,
                          border: "1px dashed var(--rule-strong)",
                          boxSizing: "border-box",
                          opacity: 0.4,
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: "100%",
                          height: bh,
                          background: cur
                            ? "var(--role-compare)"
                            : `color-mix(in srgb, ${accent} 40%, var(--role-default))`,
                          border: "1px solid var(--ink)",
                          borderBottom: "none",
                          transition:
                            "height 200ms var(--ease-out), background 200ms var(--ease-out)",
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          );
        };
        return (
          <div style={{ position: "relative", height: mergePanelH, marginTop: 16, padding: "0 4px" }}>
            <div
              style={{
                position: "absolute",
                top: -2,
                left: 0,
                right: 0,
                textAlign: "center",
                fontFamily: "var(--font-mono)",
                fontSize: 9,
                fontWeight: 600,
                letterSpacing: 1.2,
                textTransform: "uppercase",
                color: "var(--ink-4)",
              }}
            >
              merge buffers — pull the smaller of left[i] / right[j] up into a[k]
            </div>
            <div style={{ position: "absolute", top: 16, left: 0, right: 0, bottom: 0 }}>
              {renderHalf(left, i, "i", "var(--role-compare)", { left: "1%", width: "44%" })}
              {renderHalf(right, j, "j", "var(--role-pivot)", { left: "55%", width: "44%" })}
            </div>
          </div>
        );
      })()}
    </div>
  );
}


window.AlgViz = window.AlgViz || {};
window.AlgViz.Bars = Bars;
})();
