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
// Structured topic views — trees, graphs, tables, buckets, timelines
// =============================================================
function colorForRole(role) {
  if (role === "found" || role === "sorted") return "var(--role-sorted)";
  if (role === "swap") return "var(--role-swap)";
  if (role === "compare") return "var(--role-compare)";
  if (role === "pivot" || role === "focus") return "var(--role-pivot)";
  if (role === "eliminated") return "var(--role-eliminated)";
  return "var(--role-default)";
}

function GraphView({ frame, height = 300 }) {
  const visual = frame.visual || {};
  const nodes = visual.nodes || [];
  const edges = visual.edges || [];
  const byId = {};
  nodes.forEach((n) => { byId[n.id] = n; });
  const isTree = visual.type === "tree";

  return (
    <div className="structured-view" style={{ minHeight: height }}>
      <svg viewBox="0 0 100 120" className="diagram-svg" role="img">
        {edges.map((e, idx) => {
          const a = byId[e.from];
          const b = byId[e.to];
          if (!a || !b) return null;
          const color = colorForRole(e.role);
          return (
            <g key={`${e.from}-${e.to}-${idx}`}>
              <line
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke={color}
                strokeWidth={e.role && e.role !== "default" ? 1.2 : 0.55}
                strokeDasharray={e.role === "eliminated" ? "2 2" : ""}
                opacity={e.role === "eliminated" ? 0.45 : 0.95}
              />
              {e.label && (
                <text
                  x={(a.x + b.x) / 2}
                  y={(a.y + b.y) / 2 - 2}
                  textAnchor="middle"
                  className="edge-label"
                >
                  {e.label}
                </text>
              )}
            </g>
          );
        })}
        {nodes.map((n) => {
          const role = n.role || "default";
          const fill = role === "eliminated" ? "var(--surface-sunken)" : "var(--surface-2)";
          const stroke = colorForRole(role);
          const wide = isTree && String(n.label).length > 3;
          const w = Math.min(36, Math.max(13, String(n.label).length * 2.25));
          return (
            <g key={n.id} opacity={role === "eliminated" ? 0.55 : 1}>
              {wide ? (
                <rect
                  x={n.x - w / 2}
                  y={n.y - 4.8}
                  width={w}
                  height={9.6}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth={role !== "default" ? 1.2 : 0.7}
                />
              ) : (
                <circle
                  cx={n.x}
                  cy={n.y}
                  r={isTree ? 5.3 : 5.8}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth={role !== "default" ? 1.4 : 0.7}
                />
              )}
              <text x={n.x} y={n.y + 1.5} textAnchor="middle" className="node-label">
                {n.label}
              </text>
              {n.sublabel && (
                <text x={n.x} y={n.y + 10.5} textAnchor="middle" className="node-sublabel">
                  {n.sublabel}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      <MetaStrip visual={visual} />
    </div>
  );
}

// =============================================================
// BFS view — graph + FIFO queue + distance map
// =============================================================
//
//   ┌────────── graph (svg) ────────────┐ ┌── distance ──┐
//   │   nodes coloured by state         │ │  s   d=0     │
//   │   tree edges solid, cross dashed  │ │  a   d=1     │
//   │   active edge in accent           │ │  b   d=1     │
//   │   d=N labelled under each node    │ │  …           │
//   └───────────────────────────────────┘ └──────────────┘
//   ┌──────────── FIFO queue ──────────────────────────────┐
//   │  ◀ front  [ a ][ b ][ c ][ d ]  back ▶               │
//   └──────────────────────────────────────────────────────┘
function BfsView({ frame, height = 320 }) {
  const v = frame.visual || {};
  const nodes = v.nodes || [];
  const edges = v.edges || [];
  const queue = v.queue || [];
  const dist = v.dist || {};

  const layers = {};
  Object.entries(dist).forEach(([id, d]) => {
    if (!layers[d]) layers[d] = [];
    layers[d].push(id);
  });
  const distLayers = Object.keys(layers).map(Number).sort((a, b) => a - b);

  return (
    <div className="bfs-view" style={{ minHeight: height }}>
      <div className="bfs-stage">
        <svg viewBox="0 0 100 100" className="bfs-svg" role="img">
          <BfsLayerBands layers={distLayers} nodes={nodes} dist={dist} />
          {edges.map((e, i) => (
            <TraversalEdge key={`${e.from}-${e.to}-${i}`} edge={e} byId={Object.fromEntries(nodes.map((n) => [n.id, n]))} />
          ))}
          {nodes.map((n) => (
            <BfsNode key={n.id} n={n} />
          ))}
        </svg>
        <DistanceTable dist={dist} layers={layers} distLayers={distLayers} />
      </div>
      <Fifo queue={queue} source={v.source} />
    </div>
  );
}

function BfsLayerBands({ layers, nodes, dist }) {
  // Faint horizontal bands shading each distance layer to make BFS waves
  // visible at a glance.
  if (!layers.length) return null;
  return layers.map((d) => {
    const ys = nodes.filter((n) => dist[n.id] === d).map((n) => n.y);
    if (!ys.length) return null;
    const minY = Math.min(...ys) - 7;
    const maxY = Math.max(...ys) + 7;
    return (
      <rect
        key={`band-${d}`}
        x={0}
        y={minY}
        width={100}
        height={maxY - minY}
        fill="var(--role-sorted)"
        opacity={0.05 + 0.04 * d}
      />
    );
  });
}

function BfsNode({ n }) {
  const fill = (() => {
    if (n.state === "active") return "var(--role-pivot)";
    if (n.state === "frontier") return "var(--role-compare)";
    if (n.state === "visited") return "var(--role-sorted)";
    return "var(--surface-2)";
  })();
  const stroke = (() => {
    if (n.state === "undiscovered") return "var(--rule-soft)";
    if (n.state === "active") return "var(--role-pivot)";
    return "var(--ink)";
  })();
  const textColor = n.state === "undiscovered" ? "var(--ink-3)" : "var(--surface-2)";
  return (
    <g>
      <circle
        cx={n.x}
        cy={n.y}
        r={4.4}
        fill={fill}
        stroke={stroke}
        strokeWidth={n.state === "active" ? 1.4 : 0.8}
      />
      <text x={n.x} y={n.y + 1.4} textAnchor="middle" className="node-label" fill={textColor}>
        {n.id}
      </text>
      {n.dist !== null && n.dist !== undefined && (
        <text x={n.x} y={n.y + 9.5} textAnchor="middle" className="node-sublabel">
          d={n.dist}
        </text>
      )}
    </g>
  );
}

function TraversalEdge({ edge, byId }) {
  const a = byId[edge.from];
  const b = byId[edge.to];
  if (!a || !b) return null;
  let stroke = "var(--rule-soft)";
  let width = 0.5;
  let dash = "";
  let opacity = 0.85;
  switch (edge.role) {
    case "tree":
      stroke = "var(--role-sorted)";
      width = 1.4;
      break;
    case "back":
      stroke = "var(--role-swap)";
      width = 1.1;
      dash = "1.5 1.5";
      break;
    case "cross":
      stroke = "var(--ink-4)";
      width = 0.5;
      dash = "1 1.5";
      opacity = 0.6;
      break;
    case "active":
      stroke = "var(--accent)";
      width = 1.6;
      break;
    default:
      break;
  }
  return (
    <line
      x1={a.x}
      y1={a.y}
      x2={b.x}
      y2={b.y}
      stroke={stroke}
      strokeWidth={width}
      strokeDasharray={dash}
      opacity={opacity}
    />
  );
}

function DistanceTable({ dist, layers, distLayers }) {
  if (!Object.keys(dist).length) {
    return (
      <aside className="bfs-distance">
        <div className="bfs-distance-head">distance map</div>
        <div className="bfs-distance-empty">(empty — nothing discovered yet)</div>
      </aside>
    );
  }
  return (
    <aside className="bfs-distance">
      <div className="bfs-distance-head">distance map</div>
      {distLayers.map((d) => (
        <div key={d} className="bfs-distance-row">
          <span className="bfs-distance-label">d = {d}</span>
          <span className="bfs-distance-vertices">
            {layers[d].sort().join("  ")}
          </span>
        </div>
      ))}
    </aside>
  );
}

function Fifo({ queue, source }) {
  return (
    <div className="bfs-fifo">
      <div className="bfs-fifo-head">
        <span className="eyebrow">FIFO queue</span>
        <span className="bfs-fifo-meta">
          source = <strong>{source}</strong> · |Q| = {queue.length}
        </span>
      </div>
      <div className="bfs-fifo-track">
        <span className="bfs-fifo-end">◀ pop</span>
        {queue.length === 0 ? (
          <span className="bfs-fifo-empty">empty</span>
        ) : (
          <div className="bfs-fifo-cells">
            {queue.map((id, i) => (
              <span
                key={`${id}-${i}`}
                className={i === 0 ? "bfs-fifo-cell front" : "bfs-fifo-cell"}
              >
                {id}
              </span>
            ))}
          </div>
        )}
        <span className="bfs-fifo-end">push ▶</span>
      </div>
    </div>
  );
}

// =============================================================
// DFS view — graph + recursion stack + d/f times
// =============================================================
//
//   ┌────────── graph (svg) ───────────┐ ┌─── stack ───┐
//   │   path bolded along recursion    │ │  ▼ top      │
//   │   tree edges solid moss          │ │  [ t  d=10 ]│
//   │   back edges dashed vermillion   │ │  [ h  d=9  ]│
//   │   nodes labelled "d/f"           │ │  [ f  d=8  ]│
//   └──────────────────────────────────┘ │     …       │
//   ┌────────────── d / f timeline ─────┘─────────────┐
//   │   s ▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮ time 1..20            │
//   │   a ▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮                          │
//   │     …                                            │
//   └──────────────────────────────────────────────────┘
function DfsView({ frame, height = 320 }) {
  const v = frame.visual || {};
  const nodes = v.nodes || [];
  const edges = v.edges || [];
  const stack = v.stack || [];
  const path = v.path || [];
  const d = v.d || {};
  const f = v.f || {};
  const time = v.time || 0;

  const pathSet = new Set(path);
  // Highlight tree edges that are currently on the active path
  const enrichedEdges = edges.map((e) => {
    if (e.role !== "tree") return e;
    const onPath = pathSet.has(e.from) && pathSet.has(e.to);
    return onPath ? { ...e, role: "active" } : e;
  });

  const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));

  return (
    <div className="dfs-view" style={{ minHeight: height }}>
      <div className="dfs-stage">
        <svg viewBox="0 0 100 100" className="dfs-svg" role="img">
          {enrichedEdges.map((e, i) => (
            <TraversalEdge key={`${e.from}-${e.to}-${i}`} edge={e} byId={byId} />
          ))}
          {nodes.map((n) => (
            <DfsNode key={n.id} n={n} />
          ))}
        </svg>
        <CallStack stack={stack} source={v.source} />
      </div>
      <DfsTimeline nodes={nodes} d={d} f={f} time={time} />
    </div>
  );
}

function DfsNode({ n }) {
  const fill = (() => {
    if (n.state === "active") return "var(--role-pivot)";
    if (n.state === "onstack") return "var(--role-compare)";
    if (n.state === "finished") return "var(--role-sorted)";
    if (n.state === "discovered") return "var(--role-compare)";
    return "var(--surface-2)";
  })();
  const stroke = (() => {
    if (n.state === "undiscovered") return "var(--rule-soft)";
    if (n.state === "active") return "var(--role-pivot)";
    return "var(--ink)";
  })();
  const textColor = n.state === "undiscovered" ? "var(--ink-3)" : "var(--surface-2)";
  const dfLabel = n.f != null ? `${n.d}/${n.f}` : (n.d != null ? `${n.d}/—` : "");
  return (
    <g>
      <circle
        cx={n.x}
        cy={n.y}
        r={4.4}
        fill={fill}
        stroke={stroke}
        strokeWidth={n.state === "active" ? 1.6 : 0.8}
      />
      <text x={n.x} y={n.y + 1.4} textAnchor="middle" className="node-label" fill={textColor}>
        {n.id}
      </text>
      {dfLabel && (
        <text x={n.x} y={n.y + 9.5} textAnchor="middle" className="node-sublabel">
          {dfLabel}
        </text>
      )}
    </g>
  );
}

function CallStack({ stack, source }) {
  return (
    <aside className="dfs-stack">
      <div className="dfs-stack-head">
        <span className="eyebrow">call stack</span>
        <span className="dfs-stack-meta">
          source = <strong>{source}</strong> · depth = {stack.length}
        </span>
      </div>
      <div className="dfs-stack-arrow">▼ top of stack (current call)</div>
      <div className="dfs-stack-cells">
        {stack.length === 0 ? (
          <div className="dfs-stack-empty">empty</div>
        ) : (
          [...stack]
            .reverse()
            .map((fr, idx) => {
              const total = stack.length;
              const isTop = idx === 0;
              const adj = fr.adj || [];
              return (
                <div
                  key={`${fr.u}-${total - 1 - idx}`}
                  className={isTop ? "dfs-stack-cell top" : "dfs-stack-cell"}
                >
                  <div className="dfs-stack-cell-head">
                    <span className="dfs-stack-cell-vertex">visit({fr.u})</span>
                    <span className="dfs-stack-cell-d">d = {fr.d}</span>
                  </div>
                  <div className="dfs-stack-cell-iter">
                    {adj.length > 0 ? (
                      <>
                        adj = [
                        {adj.map((nb, i) => (
                          <span
                            key={`${nb}-${i}`}
                            className={i === fr.iter ? "dfs-iter cur" : "dfs-iter"}
                          >
                            {nb}
                          </span>
                        ))}
                        ]
                      </>
                    ) : "adj = []"}
                  </div>
                </div>
              );
            })
        )}
      </div>
      <div className="dfs-stack-arrow base">▲ source frame (bottom)</div>
    </aside>
  );
}

function DfsTimeline({ nodes, d, f, time }) {
  const seenIds = nodes.filter((n) => n.d != null).map((n) => n.id);
  if (seenIds.length === 0) {
    return (
      <div className="dfs-timeline">
        <div className="dfs-timeline-head">
          <span className="eyebrow">discovery / finish times</span>
          <span className="dfs-timeline-meta">time = 0</span>
        </div>
        <div className="dfs-timeline-empty">(no vertices visited yet)</div>
      </div>
    );
  }
  // Total ticks = 2 * |V| (each vertex contributes a discover and a finish).
  const totalTicks = nodes.length * 2;
  const sorted = [...seenIds].sort((a, b) => d[a] - d[b]);
  return (
    <div className="dfs-timeline">
      <div className="dfs-timeline-head">
        <span className="eyebrow">discovery / finish times</span>
        <span className="dfs-timeline-meta">time = {time}</span>
      </div>
      <div className="dfs-timeline-grid">
        {sorted.map((id) => {
          const di = d[id];
          const fi = f[id];
          const start = ((di - 1) / totalTicks) * 100;
          const end = (fi != null ? fi : time) / totalTicks * 100;
          const width = Math.max(end - start, 1.5);
          const open = fi == null;
          return (
            <div key={id} className="dfs-timeline-row">
              <span className="dfs-timeline-vertex">{id}</span>
              <div className="dfs-timeline-track">
                <span
                  className={open ? "dfs-timeline-bar open" : "dfs-timeline-bar"}
                  style={{ left: `${start}%`, width: `${width}%` }}
                />
                <span
                  className="dfs-timeline-tick discover"
                  style={{ left: `${start}%` }}
                  title={`d=${di}`}
                >
                  {di}
                </span>
                {fi != null && (
                  <span
                    className="dfs-timeline-tick finish"
                    style={{ left: `${end}%` }}
                    title={`f=${fi}`}
                  >
                    {fi}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MetaStrip({ visual }) {
  const items = [];
  if (visual.array) items.push(["array", `[${visual.array.join(", ")}]`]);
  if (visual.frontier) items.push(["frontier", visual.frontier.join(" → ")]);
  if (visual.mode) items.push(["mode", visual.mode]);
  if (visual.sets) items.push(["sets", visual.sets.join("   ")]);
  if (visual.cut) items.push(["cut side", visual.cut.join(", ")]);
  if (visual.minCut) items.push(["min cut", visual.minCut]);
  if (visual.residual) items.push(["residual", visual.residual.join(" · ")]);
  if (visual.levelCosts) items.push(["levels", visual.levelCosts.join(" | ")]);
  if (!items.length) return null;

  return (
    <div className="meta-strip">
      {items.map(([label, value]) => (
        <span key={label}><strong>{label}</strong>{value}</span>
      ))}
    </div>
  );
}

function TableView({ frame, height = 300 }) {
  const visual = frame.visual || {};
  const rows = visual.rows || [];
  const cols = visual.cols || [];
  const values = visual.values || [];
  const activeKey = Array.isArray(visual.active) ? visual.active.join(":") : "";
  const deps = new Set((visual.dependency || []).map((p) => p.join(":")));
  const path = new Set((visual.path || []).map((p) => p.join(":")));

  return (
    <div className="structured-view table-view" style={{ minHeight: height }}>
      <div
        className="dp-grid"
        style={{
          gridTemplateColumns: `minmax(54px, auto) repeat(${cols.length}, minmax(44px, 1fr))`,
        }}
      >
        <div className="dp-corner">i \ j</div>
        {cols.map((c, j) => (
          <div key={c} className={visual.colHighlight === j ? "dp-head active" : "dp-head"}>{c}</div>
        ))}
        {rows.map((r, i) => (
          <React.Fragment key={r}>
            <div className={visual.rowHighlight === i ? "dp-row-head active" : "dp-row-head"}>{r}</div>
            {cols.map((c, j) => {
              const key = `${i}:${j}`;
              const cls = [
                "dp-cell",
                activeKey === key ? "active" : "",
                deps.has(key) ? "dependency" : "",
                path.has(key) ? "path" : "",
              ].filter(Boolean).join(" ");
              return <div key={`${r}-${c}`} className={cls}>{values[i]?.[j] ?? ""}</div>;
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

function BucketsView({ frame, height = 300 }) {
  const visual = frame.visual || {};
  const array = visual.array || [];
  const buckets = visual.buckets || {};
  return (
    <div className="structured-view buckets-view" style={{ minHeight: height }}>
      <div className="bucket-active">{visual.active}</div>
      <div className="array-strip">
        {array.map((v, i) => <span key={`${v}-${i}`}>{v}</span>)}
      </div>
      <div className="bucket-grid">
        {Object.entries(buckets).map(([label, items]) => (
          <div key={label} className="bucket">
            <strong>{label}</strong>
            <div>
              {(items || []).map((v, i) => <span key={`${v}-${i}`}>{v}</span>)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TimelineView({ frame, height = 300 }) {
  const visual = frame.visual || {};
  const activities = visual.activities || [];
  const selected = new Set(visual.selected || []);
  const rejected = new Set(visual.rejected || []);
  const [lo, hi] = visual.range || [0, 10];
  const span = Math.max(1, hi - lo);
  return (
    <div className="structured-view timeline-view" style={{ minHeight: height }}>
      <div className="timeline-axis">
        {Array.from({ length: hi - lo + 1 }).map((_, i) => (
          <span key={i}>{lo + i}</span>
        ))}
      </div>
      <div className="timeline-rows">
        {activities.map((a) => {
          const left = ((a.start - lo) / span) * 100;
          const width = ((a.end - a.start) / span) * 100;
          const role = selected.has(a.id) ? "selected" : rejected.has(a.id) ? "rejected" : visual.active === a.id ? "active" : "";
          return (
            <div key={a.id} className="timeline-row">
              <span className="timeline-label">{a.label}</span>
              <div className="timeline-track">
                <span
                  className={`interval ${role}`}
                  style={{ left: `${left}%`, width: `${width}%` }}
                >
                  {a.start}-{a.end}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ReductionView({ frame, height = 300 }) {
  const visual = frame.visual || {};
  const boxes = visual.boxes || [];
  const arrows = visual.arrows || [];
  const pos = {};
  boxes.forEach((b, i) => {
    pos[b.id] = { x: 12 + i * (76 / Math.max(1, boxes.length - 1)), y: 48 };
  });
  return (
    <div className="structured-view reduction-view" style={{ minHeight: height }}>
      <svg viewBox="0 0 100 100" className="diagram-svg" role="img">
        {arrows.map(([from, to, label], i) => {
          const a = pos[from];
          const b = pos[to];
          if (!a || !b) return null;
          const y = i % 2 ? 66 : 35;
          return (
            <g key={`${from}-${to}-${i}`}>
              <path
                d={`M ${a.x + 9} ${y} C ${(a.x + b.x) / 2} ${y - 12}, ${(a.x + b.x) / 2} ${y - 12}, ${b.x - 9} ${y}`}
                fill="none"
                stroke="var(--accent)"
                strokeWidth="0.8"
                markerEnd="url(#arrow)"
              />
              <text x={(a.x + b.x) / 2} y={y - 14} textAnchor="middle" className="edge-label">{label}</text>
            </g>
          );
        })}
        <defs>
          <marker id="arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 z" fill="var(--accent)" />
          </marker>
        </defs>
      </svg>
      <div
        className="reduction-boxes"
        style={{ gridTemplateColumns: `repeat(${boxes.length || 1}, minmax(0, 1fr))` }}
      >
        {boxes.map((box) => (
          <div key={box.id} className={`reduction-box ${box.role || ""}`}>
            <strong>{box.title}</strong>
            <span>{box.body}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// =============================================================
// Helpers shared by graph-lib-driven views
// =============================================================

// Resolve the directed/undirected edge endpoint pair from a graph spec.
function edgeEndpoints(graph) {
  return Object.fromEntries((graph?.nodes || []).map((n) => [n.id, n]));
}

// Wrapper that handles directed edges (drawn with arrowhead via SVG marker)
// + the now-richer set of role colours used by MST/Dijkstra/Flow.
function GraphEdgeLine({ edge, byId, directed = false, label = null, weight = null }) {
  const a = byId[edge.u || edge.from];
  const b = byId[edge.v || edge.to];
  if (!a || !b) return null;
  const role = edge.role || "default";
  let stroke = "var(--rule-soft)";
  let width = 0.5;
  let dash = "";
  let opacity = 0.9;
  switch (role) {
    case "tree":
      stroke = "var(--role-sorted)"; width = 1.6; opacity = 0.95; break;
    case "back":
      stroke = "var(--role-swap)"; width = 1.1; dash = "1.5 1.5"; break;
    case "cross":
      stroke = "var(--ink-4)"; width = 0.5; dash = "1 1.5"; opacity = 0.55; break;
    case "active":
      stroke = "var(--accent)"; width = 1.8; break;
    case "examined":
      stroke = "var(--role-compare)"; width = 0.8; opacity = 0.6; break;
    case "augmenting":
      stroke = "var(--accent)"; width = 2; break;
    case "saturated":
      stroke = "var(--role-swap)"; width = 1.4; opacity = 0.95; break;
    case "reject":
      stroke = "var(--role-swap)"; width = 0.9; dash = "1.5 1.5"; opacity = 0.7; break;
    default: break;
  }

  // Shrink endpoints so arrowheads don't overlap node circles
  const r = 4.6;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len, uy = dy / len;
  const x1 = a.x + ux * r;
  const y1 = a.y + uy * r;
  const x2 = b.x - ux * (r + (directed ? 1.4 : 0));
  const y2 = b.y - uy * (r + (directed ? 1.4 : 0));

  const labelText = label != null ? label : weight;
  // Slight offset to keep label off the line
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  return (
    <g>
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={stroke}
        strokeWidth={width}
        strokeDasharray={dash}
        opacity={opacity}
        markerEnd={directed ? `url(#arrow-${role})` : undefined}
      />
      {labelText != null && (
        <text x={mx} y={my - 1.3} textAnchor="middle" className="edge-label">
          {labelText}
        </text>
      )}
    </g>
  );
}

// SVG <defs> with arrowhead markers in every role colour we use.
function ArrowMarkers() {
  const markers = [
    ["default", "var(--rule-soft)"],
    ["active", "var(--accent)"],
    ["tree", "var(--role-sorted)"],
    ["augmenting", "var(--accent)"],
    ["saturated", "var(--role-swap)"],
    ["examined", "var(--role-compare)"],
  ];
  return (
    <defs>
      {markers.map(([role, color]) => (
        <marker
          key={role}
          id={`arrow-${role}`}
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="3"
          markerHeight="3"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill={color} />
        </marker>
      ))}
    </defs>
  );
}

// =============================================================
// MST (Kruskal) view
// =============================================================
function MstView({ frame, height = 320 }) {
  const v = frame.visual || {};
  const graph = v.graph;
  const nodes = graph?.nodes || [];
  const edges = graph?.edges || [];
  const vState = v.vertices || {};
  const eState = v.edges || {};
  const sortedEdges = v.containers?.sortedEdges || [];
  const dsu = v.containers?.dsu || { components: [] };
  const mst = v.containers?.mst || { chosen: [], totalWeight: 0, target: 0, progress: 0 };
  const byId = edgeEndpoints(graph);

  // Per-component tint cycle so vertices in the same set share an outline
  // colour while DSU is still partitioned.
  const compColors = ["var(--accent)", "var(--role-sorted)", "var(--role-pivot)", "var(--role-compare)", "var(--ink-3)", "var(--role-swap)"];

  return (
    <div className="mst-view" style={{ minHeight: height }}>
      <div className="mst-stage">
        <svg viewBox="0 0 100 100" className="mst-svg" role="img">
          <ArrowMarkers />
          {edges.map((e, i) => {
            const k = window.AlgViz.graph.edgeKey(e.u, e.v, false);
            const merged = { ...e, role: eState[k]?.role || "default" };
            return (
              <GraphEdgeLine
                key={`${e.u}-${e.v}-${i}`}
                edge={merged}
                byId={byId}
                weight={e.weight}
              />
            );
          })}
          {nodes.map((n) => {
            const s = vState[n.id] || {};
            const compIdx = s.component != null ? s.component : 0;
            const tint = compColors[compIdx % compColors.length];
            const stroke = s.state === "active" ? "var(--accent)" : tint;
            return (
              <g key={n.id}>
                <circle
                  cx={n.x}
                  cy={n.y}
                  r={4.6}
                  fill="var(--surface-2)"
                  stroke={stroke}
                  strokeWidth={s.state === "active" ? 1.6 : 1}
                />
                <text x={n.x} y={n.y + 1.4} textAnchor="middle" className="node-label">
                  {n.id}
                </text>
              </g>
            );
          })}
        </svg>
        <DsuPanel components={dsu.components} compColors={compColors} />
      </div>
      <SortedEdgeList edges={sortedEdges} mst={mst} />
    </div>
  );
}

function DsuPanel({ components, compColors }) {
  return (
    <aside className="mst-dsu">
      <div className="mst-dsu-head">
        <span className="eyebrow">disjoint-set forest</span>
        <span className="mst-dsu-meta">{components.length} component{components.length === 1 ? "" : "s"}</span>
      </div>
      <div className="mst-dsu-list">
        {components.map((group, i) => (
          <div
            key={group.join(",")}
            className="mst-dsu-row"
            style={{ borderLeft: `3px solid ${compColors[i % compColors.length]}` }}
          >
            <span className="mst-dsu-rep">root: <strong>{group[0]}</strong></span>
            <span className="mst-dsu-members">{`{${group.join(", ")}}`}</span>
          </div>
        ))}
      </div>
    </aside>
  );
}

function SortedEdgeList({ edges, mst }) {
  return (
    <div className="mst-edges">
      <div className="mst-edges-head">
        <span className="eyebrow">edges sorted by weight</span>
        <span className="mst-edges-meta">
          MST: <strong>{mst.progress}</strong> / {mst.target} edges &nbsp;·&nbsp; total weight = <strong>{mst.totalWeight}</strong>
        </span>
      </div>
      <div className="mst-edges-list">
        {edges.map((e) => (
          <div key={e.key} className={`mst-edge mst-edge-${e.status}`}>
            <span className="mst-edge-w">{String(e.weight).padStart(2, "0")}</span>
            <span className="mst-edge-pair">{e.u}–{e.v}</span>
            <span className="mst-edge-mark">
              {e.status === "accepted" ? "✓ accepted"
                : e.status === "rejected" ? "✗ cycle"
                : e.status === "active" ? "← examining"
                : "pending"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// =============================================================
// Dijkstra view
// =============================================================
function DijkstraView({ frame, height = 320 }) {
  const v = frame.visual || {};
  const graph = v.graph;
  const nodes = graph?.nodes || [];
  const edges = graph?.edges || [];
  const directed = !!graph?.directed;
  const vState = v.vertices || {};
  const eState = v.edges || {};
  const pq = v.containers?.pq || [];
  const distRows = v.containers?.dist || [];
  const source = v.containers?.source;
  const byId = edgeEndpoints(graph);

  return (
    <div className="dijkstra-view" style={{ minHeight: height }}>
      <div className="dijkstra-stage">
        <svg viewBox="0 0 100 100" className="dijkstra-svg" role="img">
          <ArrowMarkers />
          {edges.map((e, i) => {
            const k = window.AlgViz.graph.edgeKey(e.u, e.v, true);
            const merged = { ...e, role: eState[k]?.role || "default" };
            return (
              <GraphEdgeLine
                key={`${e.u}-${e.v}-${i}`}
                edge={merged}
                byId={byId}
                directed={directed}
                weight={e.weight}
              />
            );
          })}
          {nodes.map((n) => {
            const s = vState[n.id] || {};
            const fill = (() => {
              if (s.state === "active") return "var(--role-pivot)";
              if (s.state === "settled") return "var(--role-sorted)";
              if (s.state === "frontier") return "var(--role-compare)";
              return "var(--surface-2)";
            })();
            const stroke = s.state === "undiscovered" ? "var(--rule-soft)" : "var(--ink)";
            const textColor = s.state === "undiscovered" ? "var(--ink-3)" : "var(--surface-2)";
            const dist = s.dist;
            const dStr = dist === Infinity || dist == null ? "∞" : dist;
            return (
              <g key={n.id}>
                <circle
                  cx={n.x}
                  cy={n.y}
                  r={4.7}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth={s.state === "active" ? 1.6 : 0.9}
                />
                <text x={n.x} y={n.y + 1.4} textAnchor="middle" className="node-label" fill={textColor}>
                  {n.id}
                </text>
                <text x={n.x} y={n.y + 9.5} textAnchor="middle" className="node-sublabel">
                  d={dStr}
                </text>
              </g>
            );
          })}
        </svg>
        <DijkstraPQ items={pq} />
      </div>
      <DijkstraDistTable rows={distRows} source={source} />
    </div>
  );
}

function DijkstraPQ({ items }) {
  return (
    <aside className="dijkstra-pq">
      <div className="dijkstra-pq-head">
        <span className="eyebrow">min-priority queue</span>
        <span className="dijkstra-pq-meta">|PQ| = {items.length}</span>
      </div>
      <div className="dijkstra-pq-arrow">▼ extract-min (lowest d)</div>
      {items.length === 0 ? (
        <div className="dijkstra-pq-empty">empty</div>
      ) : (
        <div className="dijkstra-pq-list">
          {items.map((it, i) => (
            <div
              key={`${it.v}-${it.d}-${i}`}
              className={it.isTop ? "dijkstra-pq-cell top" : "dijkstra-pq-cell"}
            >
              <span className="dijkstra-pq-d">d = {it.d === Infinity ? "∞" : it.d}</span>
              <span className="dijkstra-pq-v">{it.v}</span>
            </div>
          ))}
        </div>
      )}
    </aside>
  );
}

function DijkstraDistTable({ rows, source }) {
  return (
    <div className="dijkstra-dist">
      <div className="dijkstra-dist-head">
        <span className="eyebrow">distance &amp; predecessor</span>
        <span className="dijkstra-dist-meta">
          source = <strong>{source}</strong>
        </span>
      </div>
      <div className="dijkstra-dist-grid">
        <div className="dijkstra-dist-col-head">v</div>
        <div className="dijkstra-dist-col-head">d[v]</div>
        <div className="dijkstra-dist-col-head">π[v]</div>
        <div className="dijkstra-dist-col-head">state</div>
        {rows.map((r) => (
          <React.Fragment key={r.v}>
            <div className="dijkstra-dist-cell vertex">{r.v}</div>
            <div className="dijkstra-dist-cell value">
              {r.d === Infinity ? "∞" : r.d}
            </div>
            <div className="dijkstra-dist-cell value">{r.parent ?? "—"}</div>
            <div className={`dijkstra-dist-cell tag ${r.settled ? "settled" : "open"}`}>
              {r.settled ? "settled" : (r.d === Infinity ? "—" : "in PQ")}
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

// =============================================================
// Max Flow view
// =============================================================
function FlowView({ frame, height = 320 }) {
  const v = frame.visual || {};
  const graph = v.graph;
  const nodes = graph?.nodes || [];
  const edges = graph?.edges || [];
  const vState = v.vertices || {};
  const eState = v.edges || {};
  const flow = v.containers?.flow || { value: 0, edges: [], source: "s", sink: "t" };
  const residual = v.containers?.residual || [];
  const byId = edgeEndpoints(graph);

  // Find total source-out capacity (so the gauge has a sensible max)
  const sourceOutCap = edges
    .filter((e) => e.u === flow.source)
    .reduce((s, e) => s + (e.capacity || 0), 0);

  return (
    <div className="flow-view" style={{ minHeight: height }}>
      <div className="flow-stage">
        <svg viewBox="0 0 100 100" className="flow-svg" role="img">
          <ArrowMarkers />
          {edges.map((e, i) => {
            const k = window.AlgViz.graph.edgeKey(e.u, e.v, true);
            const eDisp = { ...e, role: eState[k]?.role || "default" };
            const label = eState[k]?.label || `${flow.edges[i]?.flow ?? 0}/${e.capacity}`;
            return (
              <GraphEdgeLine
                key={`${e.u}-${e.v}-${i}`}
                edge={eDisp}
                byId={byId}
                directed
                label={label}
              />
            );
          })}
          {nodes.map((n) => {
            const s = vState[n.id] || {};
            const isSource = n.id === flow.source;
            const isSink = n.id === flow.sink;
            const fill = (() => {
              if (s.state === "active") return "var(--role-pivot)";
              if (s.state === "frontier") return "var(--accent)";
              if (s.state === "visited") return "var(--role-compare)";
              if (isSource || isSink) return "var(--ink)";
              return "var(--surface-2)";
            })();
            const textColor =
              isSource || isSink || s.state === "active" || s.state === "frontier" || s.state === "visited"
                ? "var(--surface-2)"
                : "var(--ink)";
            return (
              <g key={n.id}>
                <circle
                  cx={n.x}
                  cy={n.y}
                  r={isSource || isSink ? 5.6 : 4.7}
                  fill={fill}
                  stroke="var(--ink)"
                  strokeWidth={isSource || isSink ? 1.4 : 0.9}
                />
                <text x={n.x} y={n.y + 1.4} textAnchor="middle" className="node-label" fill={textColor}>
                  {n.id}
                </text>
              </g>
            );
          })}
        </svg>
        <ResidualPanel residual={residual} source={flow.source} sink={flow.sink} />
      </div>
      <FlowGauge value={flow.value} cap={sourceOutCap} source={flow.source} sink={flow.sink} edges={flow.edges} />
    </div>
  );
}

function ResidualPanel({ residual, source, sink }) {
  const forward = residual.filter((r) => !r.isBack);
  const backward = residual.filter((r) => r.isBack);
  return (
    <aside className="flow-residual">
      <div className="flow-residual-head">
        <span className="eyebrow">residual graph</span>
        <span className="flow-residual-meta">
          {residual.length} edge{residual.length === 1 ? "" : "s"} with capacity &gt; 0
        </span>
      </div>
      <div className="flow-residual-section">
        <div className="flow-residual-label">forward (cap − flow)</div>
        {forward.length === 0 ? (
          <div className="flow-residual-empty">all forward edges saturated</div>
        ) : (
          <div className="flow-residual-list">
            {forward.map((r) => (
              <div key={`${r.u}->${r.v}`} className="flow-residual-row">
                <span className="flow-residual-pair">{r.u} → {r.v}</span>
                <span className="flow-residual-cap">{r.residual}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="flow-residual-section">
        <div className="flow-residual-label">backward (cancellable flow)</div>
        {backward.length === 0 ? (
          <div className="flow-residual-empty">no flow to cancel</div>
        ) : (
          <div className="flow-residual-list">
            {backward.map((r) => (
              <div key={`${r.u}->${r.v}`} className="flow-residual-row back">
                <span className="flow-residual-pair">{r.u} ↩ {r.v}</span>
                <span className="flow-residual-cap">{r.residual}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}

function FlowGauge({ value, cap, source, sink, edges }) {
  const pct = cap > 0 ? Math.min(100, (value / cap) * 100) : 0;
  return (
    <div className="flow-gauge">
      <div className="flow-gauge-head">
        <span className="eyebrow">value of flow</span>
        <span className="flow-gauge-meta">|f| from {source} → {sink} = <strong>{value}</strong> / max source out-cap = {cap}</span>
      </div>
      <div className="flow-gauge-bar">
        <div className="flow-gauge-fill" style={{ width: `${pct}%` }} />
        <div className="flow-gauge-marker" style={{ left: `${pct}%` }} />
      </div>
      <div className="flow-gauge-edges">
        {edges.map((e) => {
          const fp = e.capacity > 0 ? (e.flow / e.capacity) * 100 : 0;
          const sat = e.flow === e.capacity && e.capacity > 0;
          return (
            <div key={`${e.u}-${e.v}`} className={sat ? "flow-edge-row sat" : "flow-edge-row"}>
              <span className="flow-edge-pair">{e.u} → {e.v}</span>
              <div className="flow-edge-bar">
                <div className="flow-edge-fill" style={{ width: `${fp}%` }} />
              </div>
              <span className="flow-edge-num">{e.flow}/{e.capacity}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// =============================================================
// Unified TreeView — heap, BST, merge-sort recursion, recursion tree
// All three trees share the same SVG primitives (circles + lines + labels)
// styled like the MST/Dijkstra/Flow views, with optional side panels:
//   • array strip below (for heap / merge sort)
//   • merge buffer panel (for merge-sort merge step)
//   • side container (for traversal / call info)
// =============================================================

function TreeNodeShape({ node }) {
  const state = node.state || "default";
  const fill = (() => {
    switch (state) {
      case "active":     return "var(--role-pivot)";
      case "compare":    return "var(--role-compare)";
      case "swap":       return "var(--role-swap)";
      case "frontier":   return "var(--role-compare)";
      case "visited":    return "var(--role-sorted)";
      case "settled":    return "var(--role-sorted)";
      case "found":      return "var(--role-sorted)";
      case "eliminated": return "var(--role-eliminated)";
      default:           return "var(--surface-2)";
    }
  })();
  const stroke = state === "default" ? "var(--rule-soft)"
    : state === "eliminated" ? "var(--ink-4)"
    : "var(--ink)";
  const textColor = state === "default" || state === "eliminated"
    ? "var(--ink)" : "var(--surface-2)";
  const isWide = node.shape === "rect" || (node.label && String(node.label).length > 3);
  const w = isWide ? Math.min(38, Math.max(14, String(node.label).length * 2.4 + 4)) : null;

  return (
    <g opacity={state === "eliminated" ? 0.5 : 1}>
      {isWide ? (
        <rect
          x={node.x - w / 2}
          y={node.y - 4.6}
          width={w}
          height={9.2}
          fill={fill}
          stroke={stroke}
          strokeWidth={state === "active" ? 1.4 : 0.9}
        />
      ) : (
        <circle
          cx={node.x}
          cy={node.y}
          r={4.7}
          fill={fill}
          stroke={stroke}
          strokeWidth={state === "active" ? 1.6 : 0.9}
        />
      )}
      <text x={node.x} y={node.y + 1.4} textAnchor="middle" className="node-label" fill={textColor}>
        {node.label}
      </text>
      {node.sublabel && (
        <text x={node.x} y={node.y + 9.5} textAnchor="middle" className="node-sublabel">
          {node.sublabel}
        </text>
      )}
      {node.badge && (
        <g>
          <rect
            x={node.x - 9}
            y={node.y - 13}
            width={18}
            height={5}
            fill="var(--accent)"
            opacity="0.95"
          />
          <text x={node.x} y={node.y - 9.2} textAnchor="middle" className="node-badge">
            {node.badge}
          </text>
        </g>
      )}
    </g>
  );
}

function TreeEdgeLine({ a, b, edge }) {
  let stroke = "var(--rule-soft)";
  let width = 0.6;
  let dash = "";
  let opacity = 0.85;
  switch (edge.role) {
    case "active":     stroke = "var(--accent)"; width = 1.6; break;
    case "tree":       stroke = "var(--role-sorted)"; width = 1.4; break;
    case "found":      stroke = "var(--role-sorted)"; width = 1.4; break;
    case "compare":    stroke = "var(--role-compare)"; width = 1.2; break;
    case "swap":       stroke = "var(--role-swap)"; width = 1.4; break;
    case "eliminated": stroke = "var(--ink-4)"; width = 0.4; dash = "1.5 1.5"; opacity = 0.45; break;
    default:           break;
  }
  // Shrink endpoints so the lines don't bleed under the node circles
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len, uy = dy / len;
  const r = 4.7;
  const x1 = a.x + ux * r;
  const y1 = a.y + uy * r;
  const x2 = b.x - ux * r;
  const y2 = b.y - uy * r;

  return (
    <g>
      <line
        x1={x1} y1={y1} x2={x2} y2={y2}
        stroke={stroke}
        strokeWidth={width}
        strokeDasharray={dash}
        opacity={opacity}
      />
      {edge.label && (
        <text
          x={(x1 + x2) / 2}
          y={(y1 + y2) / 2 - 1.3}
          textAnchor="middle"
          className="edge-label"
        >
          {edge.label}
        </text>
      )}
    </g>
  );
}

function TreeArrayStrip({ array, highlights = {}, slotLabels = null, title = "array view" }) {
  if (!array || !array.length) return null;
  return (
    <div className="tree-array">
      <div className="tree-array-head">
        <span className="eyebrow">{title}</span>
        <span className="tree-array-meta">n = {array.length}</span>
      </div>
      <div className="tree-array-cells">
        {array.map((v, i) => {
          const role = highlights[i];
          const cls = role ? `tree-array-cell role-${role}` : "tree-array-cell";
          return (
            <div key={i} className={cls}>
              <span className="tree-array-value">{v}</span>
              <span className="tree-array-index">{slotLabels ? slotLabels[i] : i}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MergePanel({ left, right, output, i, j, role = null }) {
  if (!left && !right && !output) return null;
  return (
    <div className="merge-panel">
      <div className="merge-panel-head">
        <span className="eyebrow">merge two sorted halves</span>
        {role && <span className="merge-panel-meta">{role}</span>}
      </div>
      <div className="merge-panel-grid">
        <MergeRow label="left" arr={left} ptr={i} />
        <MergeRow label="right" arr={right} ptr={j} />
        <MergeRow label="output" arr={output} ptr={null} highlight />
      </div>
    </div>
  );
}

function MergeRow({ label, arr, ptr, highlight = false }) {
  if (!arr) return null;
  return (
    <div className="merge-row">
      <span className="merge-row-label">{label}</span>
      <div className="merge-row-cells">
        {arr.map((v, i) => {
          const isCur = ptr === i;
          const cls = isCur
            ? "merge-cell cur"
            : highlight
            ? "merge-cell out"
            : "merge-cell";
          return <span key={i} className={cls}>{v}</span>;
        })}
        {arr.length === 0 && <span className="merge-cell empty">(empty)</span>}
      </div>
    </div>
  );
}

function TreeSidePanel({ panel }) {
  if (!panel) return null;
  return (
    <aside className="tree-side">
      <div className="tree-side-head">
        <span className="eyebrow">{panel.title}</span>
        {panel.meta && <span className="tree-side-meta">{panel.meta}</span>}
      </div>
      {panel.rows && (
        <div className="tree-side-rows">
          {panel.rows.map((r, i) => (
            <div key={i} className="tree-side-row">
              <span className="tree-side-label">{r.label}</span>
              <span className={`tree-side-value ${r.role || ""}`}>{r.value}</span>
            </div>
          ))}
        </div>
      )}
      {panel.note && (
        <div className="tree-side-note">{panel.note}</div>
      )}
    </aside>
  );
}

function TreeView({ frame, height = 320 }) {
  const v = frame.visual || {};
  const nodes = v.nodes || [];
  const edges = v.edges || [];
  const arrayInfo = v.array;
  const merge = v.merge;
  const side = v.side;
  const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));

  return (
    <div className="tree-view" style={{ minHeight: height }}>
      <div className="tree-stage">
        <svg viewBox="0 0 100 100" className="tree-svg" role="img">
          {edges.map((e, i) => {
            const a = byId[e.from];
            const b = byId[e.to];
            if (!a || !b) return null;
            return <TreeEdgeLine key={`${e.from}-${e.to}-${i}`} a={a} b={b} edge={e} />;
          })}
          {nodes.map((n) => (
            <TreeNodeShape key={n.id} node={n} />
          ))}
        </svg>
        {side && <TreeSidePanel panel={side} />}
      </div>
      {arrayInfo && (
        <TreeArrayStrip
          array={arrayInfo.values}
          highlights={arrayInfo.highlights || {}}
          slotLabels={arrayInfo.slotLabels}
          title={arrayInfo.title || "array view"}
        />
      )}
      {merge && (
        <MergePanel
          left={merge.left}
          right={merge.right}
          output={merge.output}
          i={merge.i}
          j={merge.j}
          role={merge.role}
        />
      )}
    </div>
  );
}

function StructuredVisualization({ frame, viewKind, height }) {
  const kind = frame.visual?.type || frame.viewKind || viewKind;
  if (kind === "table") return <TableView frame={frame} height={height} />;
  if (kind === "buckets") return <BucketsView frame={frame} height={height} />;
  if (kind === "timeline") return <TimelineView frame={frame} height={height} />;
  if (kind === "reduction") return <ReductionView frame={frame} height={height} />;
  return <GraphView frame={frame} height={height} />;
}

// =============================================================
// Top-level dispatch
// =============================================================
function Visualization({ frame, viewKind, maxValue, height }) {
  const kind = frame.visual?.type || frame.viewKind || viewKind;
  if (kind === "search") {
    return <SearchView frame={frame} maxValue={maxValue} height={height} />;
  }
  if (kind === "bfs") return <BfsView frame={frame} height={height} />;
  if (kind === "dfs") return <DfsView frame={frame} height={height} />;
  if (kind === "mst-kruskal") return <MstView frame={frame} height={height} />;
  if (kind === "dijkstra") return <DijkstraView frame={frame} height={height} />;
  if (kind === "max-flow") return <FlowView frame={frame} height={height} />;
  if (kind === "tree-view") return <TreeView frame={frame} height={height} />;
  if (["tree", "graph", "flow", "table", "buckets", "timeline", "reduction"].includes(kind)) {
    return <StructuredVisualization frame={frame} viewKind={kind} height={height} />;
  }
  return (
    <Bars
      frame={frame}
      viewKind={kind}
      maxValue={maxValue}
      height={height}
    />
  );
}

window.AlgViz = window.AlgViz || {};
window.AlgViz.Bars = Bars;
window.AlgViz.SearchView = SearchView;
window.AlgViz.BfsView = BfsView;
window.AlgViz.DfsView = DfsView;
window.AlgViz.MstView = MstView;
window.AlgViz.DijkstraView = DijkstraView;
window.AlgViz.FlowView = FlowView;
window.AlgViz.TreeView = TreeView;
window.AlgViz.Visualization = Visualization;
})();
