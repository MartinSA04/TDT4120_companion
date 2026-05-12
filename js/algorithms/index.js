/* global window */
// =====================================================================
// Algorithm catalogue — the ordered list shown in the visualizer.
// Loaded LAST (after every domain module has called A.register). Assembles
// window.AlgViz.ALGORITHMS in the canonical display order.
// =====================================================================
(function () {
const a = window.AlgViz.A.algos;
window.AlgViz = window.AlgViz || {};
window.AlgViz.ALGORITHMS = [
  a.bubble, a.insertion, a.selection, a.quick, a.binary,
  a.mergeSort, a.recursionTree, a.liveCountingRadix, a.heapPQ, a.bst,
  a.liveDPTable, a.liveActivitySelection, a.bfs, a.dfs, a.mst, a.shortestPaths,
  a.liveFloydWarshall, a.maxFlow, a.liveNPReductions,
];
})();
