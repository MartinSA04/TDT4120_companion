/* global React, window */
// =====================================================================
// Shared graph-drawing primitives:
//   GraphView      generic structured-graph fallback view (uses MetaStrip)
//   MetaStrip      small key/value strip above a graph
//   GraphEdgeLine  one <line>/<path> edge with optional arrowhead + weight
//   ArrowMarkers   <defs> arrowhead markers (include once per <svg>)
// MstView / DijkstraView / FlowView read GraphEdgeLine + ArrowMarkers off
// window.AlgViz, so this module must load before them.
// =====================================================================
(function () {
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


window.AlgViz = window.AlgViz || {};
window.AlgViz.GraphView = GraphView;
window.AlgViz.MetaStrip = MetaStrip;
window.AlgViz.GraphEdgeLine = GraphEdgeLine;
window.AlgViz.ArrowMarkers = ArrowMarkers;
})();
