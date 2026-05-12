/* global React, window */
// =====================================================================
// BfsView — breadth-first traversal: layer bands, FIFO queue, distance
// table, tree/cross edge styling. (viewKind "bfs")  Self-contained.
// =====================================================================
(function () {
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


window.AlgViz = window.AlgViz || {};
window.AlgViz.BfsView = BfsView;
})();
