/* global React, window */
// =====================================================================
// View dispatch — picks a visualization component for a frame's kind.
// Loaded LAST: every view module above has already registered its
// component(s) on window.AlgViz, which we destructure here.
// =====================================================================
(function () {
const {
  Bars, SearchView, BfsView, DfsView, MstView, DijkstraView, FlowView, TreeView,
  TableView, BucketsView, TimelineView, ReductionView, GraphView,
} = window.AlgViz;

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
window.AlgViz.StructuredVisualization = StructuredVisualization;
window.AlgViz.Visualization = Visualization;
})();
