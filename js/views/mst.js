/* global React, window */
// =====================================================================
// MstView — Kruskal MST: sorted edge list, the candidate edge, and the
// disjoint-set forest growing as components merge. (viewKind "mst-kruskal")
// Uses GraphEdgeLine / ArrowMarkers from window.AlgViz (graph-common.js).
// =====================================================================
(function () {
const { GraphEdgeLine, ArrowMarkers } = window.AlgViz;
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


window.AlgViz = window.AlgViz || {};
window.AlgViz.MstView = MstView;
})();
