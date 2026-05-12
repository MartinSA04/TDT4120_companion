/* global React, window */
// =====================================================================
// DfsView — depth-first traversal: recursion call stack, discovery/finish
// timeline, tree/back/forward/cross edge styling. (viewKind "dfs")
// =====================================================================
(function () {
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


window.AlgViz = window.AlgViz || {};
window.AlgViz.DfsView = DfsView;
})();
