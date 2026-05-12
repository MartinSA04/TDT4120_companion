/* global React, window */
// =====================================================================
// DijkstraView — single-source shortest paths on a weighted digraph: the
// min-priority-queue, the distance table, relaxed edges. (viewKind "dijkstra")
// Uses GraphEdgeLine / ArrowMarkers from window.AlgViz (graph-common.js).
// =====================================================================
(function () {
const { GraphEdgeLine, ArrowMarkers } = window.AlgViz;
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


window.AlgViz = window.AlgViz || {};
window.AlgViz.DijkstraView = DijkstraView;
})();
