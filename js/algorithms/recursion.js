/* global window */
// =====================================================================
// Recurrences — the recursion tree of T(n) = 2T(n/2) + n, expanded level
// by level on the tree view.
//   recursionTree   viewKind "tree-view"
// =====================================================================
// See js/algorithms/_shared.js for the Frame contract.
(function () {
const A = window.AlgViz.A;
const { mulberry32, shuffledRange, range, fallbackDataForVisual, topicFrame, node, edge, graphVisual, tableVisual, clamp, demoValues, shortList, roleMap, completeTreeNodes, completeTreeEdges, circleNodes, graphEdgeKey, makeIntervalTree, liveTopicFrame, graphFromValues } = window.AlgViz.A;
// ============================================================
// Recursion Tree — full step-by-step expansion using TreeView
//
// We expand T(n) = 2 T(n/2) + n level by level, accumulating per-level
// totals on the side panel until we sum to T(n) = Θ(n lg n).
// Each level adds a row of nodes carrying their cost.
// ============================================================
const recursionTree = {
  id: "recursion-tree",
  name: "Recursion Tree",
  description:
    "Expand the recurrence T(n) = 2T(n/2) + n into a tree. Each node's cost is the non-recursive work it does. Sum the costs at each level, then sum across levels to get T(n).",
  explanation: {
    no: "Rekursjonstre-visualiseringen avslører nivåene én etter én: vis nodene på neste nivå, beregn totalen for det nivået, og legg til totalsummen.",
    en: "The recursion-tree visualization reveals levels one at a time: show the nodes on the next level, compute that level's total, and add it to the running grand total.",
  },
  courseRefs: ["l03"],
  conceptIds: ["recurrence", "divide-and-conquer"],
  learningGoalIds: ["C5", "C6"],
  viewKind: "tree-view",
  filename: "analysis/recursion_tree.py",
  complexities: { best: "Θ(n log n)", avg: "Θ(n log n)", worst: "Θ(n log n)", space: "stack" },
  code:
`# Recurrence:    T(n) = 2 * T(n/2) + n
# Per node cost: f(n) = n  (the non-recursive work)
# Branching:     a = 2,  b = 2

def level_cost(n: int, level: int, a: int = 2, b: int = 2) -> int:
    nodes = a ** level                 # nodes on this level
    sub   = n / (b ** level)           # size of each subproblem
    return nodes * sub                 # total non-recursive work

def total_work(n: int, a: int = 2, b: int = 2) -> int:
    levels = math.ceil(math.log(n, b)) + 1
    return sum(level_cost(n, k, a, b) for k in range(levels))`,
  // n must be a power of 2 for clean depths; the slider snaps to {4, 8, 16, 32}.
  sizeRange: { min: 2, max: 5, default: 4 },   // log₂(n): 2→4, 3→8, 4→16, 5→32
  defaultData(size = 4) {
    const slider = Math.min(5, Math.max(1, size));
    const n = 2 ** slider;
    return Array.from({ length: n }, (_, i) => i + 1);
  },
  run(input) {
    // T(n) = 2T(n/2) + n  with n derived from the input length (rounded down
    // to the nearest power of 2 so the recursion tree stays balanced).
    const requested = input && input.length ? input.length : 16;
    const N = 2 ** Math.max(1, Math.floor(Math.log2(requested)));
    const branches = 2;
    const depth = Math.floor(Math.log2(N));   // log₂(N) levels of internal expansion + leaves at the bottom
    const totalLevels = depth + 1;             // include leaf row

    // Pre-compute layout positions for every node we will ever reveal.
    // Identify each node by (level, indexInLevel).
    const nodes = [];
    const edges = [];
    for (let lvl = 0; lvl <= depth; lvl++) {
      const count = branches ** lvl;
      const subSize = N / count;
      for (let i = 0; i < count; i++) {
        const id = `L${lvl}-${i}`;
        const x = count === 1 ? 50 : 6 + (i / (count - 1)) * 88;
        const y = 12 + (lvl / Math.max(1, totalLevels - 1)) * 76;
        const isLeaf = lvl === depth;
        const label = isLeaf ? "1" : `T(${subSize})`;
        const sublabel = isLeaf ? "leaf" : `cost ${subSize}`;
        nodes.push({ id, level: lvl, index: i, label, sublabel, x, y, subSize });
        if (lvl > 0) {
          const parentIdx = Math.floor(i / branches);
          edges.push({ from: `L${lvl - 1}-${parentIdx}`, to: id });
        }
      }
    }

    // levelCost[k] for k = 0..depth-1 is n  (each internal level contributes n).
    // For leaves (level = depth), there are n leaves of cost 1 → total n.
    const levelCost = (lvl) => N;       // for this recurrence every level totals n

    const revealed = new Set();         // which (lvl, idx) ids exist yet
    const finalLvls = new Set();        // levels that have been "summed"
    const frames = [];

    function buildNodes(activeLevel, finishedSum = false) {
      return nodes.map((n) => {
        const inTree = revealed.has(n.id);
        let state;
        if (!inTree) state = "eliminated";
        else if (finishedSum) state = "found";
        else if (n.level === activeLevel) state = "active";
        else state = "visited";
        // Same compaction strategy as merge sort: when a level has many
        // siblings, the per-node slot shrinks below what a `T(n)` rect can
        // legibly fill. Drop to a circle and shorten the label.
        const siblings = branches ** n.level;
        const slotW = 88 / Math.max(1, siblings);
        const isLeaf = n.level === depth;
        const useRect = slotW >= 16 && !isLeaf;
        const labelText = useRect
          ? `T(${n.subSize})`
          : isLeaf
          ? "1"
          : `${n.subSize}`;             // dense internal — just the size
        const sublabelText = useRect
          ? `cost ${n.subSize}`
          : (slotW >= 8 && !isLeaf ? `n=${n.subSize}` : null);
        return {
          id: n.id,
          label: labelText,
          x: n.x,
          y: n.y,
          state,
          sublabel: sublabelText,
          shape: useRect ? "rect" : "circle",
          maxWidth: Math.max(7, slotW - 2),
        };
      });
    }
    function buildEdges() {
      return edges.map((e) => ({
        from: e.from,
        to: e.to,
        role: revealed.has(e.from) && revealed.has(e.to) ? "tree" : "eliminated",
      }));
    }
    function levelRows(currentLvl, runningTotal, finished = false) {
      const rows = [];
      for (let k = 0; k <= currentLvl; k++) {
        const nodesK = branches ** k;
        const subSize = k === depth ? 1 : N / nodesK;
        rows.push({
          label: `level ${k}`,
          value: `${nodesK} × ${subSize} = ${nodesK * subSize}`,
          role: k === currentLvl && !finished ? "active" : "",
        });
      }
      rows.push({
        label: "running Σ",
        value: `${runningTotal}${finished ? "  ✓" : ""}`,
        role: finished ? "active" : "",
      });
      return rows;
    }
    function pushFrame({ line, desc, role, activeLevel, finishedSum = false, runningTotal = 0, sideTitle = "level analysis", note = null }) {
      frames.push({
        line,
        desc,
        data: [],
        viewKind: "tree-view",
        highlights: { [role]: [0] },
        pointers: {},
        variables: {},
        visual: {
          type: "tree-view",
          nodes: buildNodes(activeLevel, finishedSum),
          edges: buildEdges(),
          side: {
            title: sideTitle,
            meta: `n = ${N}, recurrence T(n) = 2T(n/2) + n`,
            rows: levelRows(activeLevel, runningTotal, finishedSum),
            note,
          },
        },
      });
    }

    // Level 0 (root)
    revealed.add("L0-0");
    let runningTotal = levelCost(0);
    pushFrame({
      line: 4,
      desc: `Start with the root T(${N}). It does ${N} units of non-recursive work itself before recursing.`,
      role: "pivot",
      activeLevel: 0,
      runningTotal,
      sideTitle: "expand level 0",
    });

    for (let lvl = 1; lvl <= depth; lvl++) {
      // Reveal all nodes at this level
      for (let i = 0; i < branches ** lvl; i++) {
        revealed.add(`L${lvl}-${i}`);
      }
      const nodesK = branches ** lvl;
      const subSize = lvl === depth ? 1 : N / nodesK;
      const total = nodesK * subSize;
      runningTotal += total;
      const desc = lvl === depth
        ? `Reveal level ${lvl} — the leaves. There are ${nodesK} leaves of cost 1, totalling ${total}.`
        : `Each node at level ${lvl - 1} branches into ${branches} subproblems of size ${subSize}. Total work at level ${lvl}: ${nodesK} × ${subSize} = ${total}.`;
      pushFrame({
        line: 4,
        desc,
        role: lvl === depth ? "found" : "compare",
        activeLevel: lvl,
        runningTotal,
        sideTitle: `expand level ${lvl}`,
      });
    }

    pushFrame({
      line: 9,
      desc: `Sum across all ${totalLevels} levels: each contributes ${N}, so T(${N}) = ${totalLevels} × ${N} = ${totalLevels * N}. With n = ${N} this is Θ(n lg n).`,
      role: "found",
      activeLevel: depth,
      finishedSum: true,
      runningTotal,
      sideTitle: "total work",
      note: `T(n) = (lg n + 1) × n  →  Θ(n lg n)`,
    });
    return frames;
  },
};
A.register("recursionTree", recursionTree);
})();
