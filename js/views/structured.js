/* global React, window */
// =====================================================================
// Structured table-style views, each driven by frame.visual:
//   TableView      viewKind "table"      grid of cells (DP / Floyd-Warshall)
//   BucketsView    viewKind "buckets"    counting / radix sort buckets
//   TimelineView   viewKind "timeline"   interval scheduling lanes
//   ReductionView  viewKind "reduction"  boxes + arrows for poly-time reductions
// =====================================================================
(function () {
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


window.AlgViz = window.AlgViz || {};
window.AlgViz.TableView = TableView;
window.AlgViz.BucketsView = BucketsView;
window.AlgViz.TimelineView = TimelineView;
window.AlgViz.ReductionView = ReductionView;
})();
