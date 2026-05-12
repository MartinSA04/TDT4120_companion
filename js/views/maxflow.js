/* global React, window */
// =====================================================================
// FlowView — Ford-Fulkerson / Edmonds-Karp: residual network panel, an
// augmenting path, and a flow/capacity gauge. (viewKind "max-flow")
// Uses GraphEdgeLine / ArrowMarkers from window.AlgViz (graph-common.js).
// =====================================================================
(function () {
const { GraphEdgeLine, ArrowMarkers } = window.AlgViz;
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


window.AlgViz = window.AlgViz || {};
window.AlgViz.FlowView = FlowView;
})();
