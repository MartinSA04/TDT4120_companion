/* global window */
// =====================================================================
// Data-structure traces — rendered on the tree view (js/views/tree-view.js).
//   heapPQ   viewKind "tree-view"   build-max-heap, sift-down animation
//   bst      viewKind "tree-view"   binary-search-tree lookup trace
// Both use window.AlgViz.graph for node layout (heapTreePositions / bstPositions).
// =====================================================================
// See js/algorithms/_shared.js for the Frame contract.
(function () {
const A = window.AlgViz.A;
const { mulberry32, shuffledRange, range, fallbackDataForVisual, topicFrame, node, edge, graphVisual, tableVisual, clamp, demoValues, shortList, roleMap, completeTreeNodes, completeTreeEdges, circleNodes, graphEdgeKey, makeIntervalTree, liveTopicFrame, graphFromValues } = window.AlgViz.A;
const _GLIB = window.AlgViz.graph;
// Heap / Build-max-heap — full step-by-step trace using TreeView
// ============================================================
const heapPQ = {
  id: "heap-priority-queue",
  name: "Heap / Priority Queue",
  description:
    "A max-heap is an array interpreted as a complete binary tree where every parent dominates its children. Build-Max-Heap repeatedly calls Max-Heapify on each internal node from the bottom up; Max-Heapify pushes a violation downward by swapping with the larger child.",
  explanation: {
    no: "Haug-visualiseringen viser hvordan en tabell tolkes som et tre. Build-Max-Heap kjører Max-Heapify nedenfra og opp, og hver Max-Heapify-sammenligning vises trinn for trinn med både treet og tabellen synkronisert.",
    en: "The heap visualization shows how an array becomes a tree. Build-Max-Heap runs Max-Heapify bottom-up; each Max-Heapify comparison is shown step-by-step with the tree and the array kept in sync.",
  },
  courseRefs: ["l05"],
  conceptIds: ["heap"],
  learningGoalIds: ["E1", "E2", "Z7", "Z8"],
  viewKind: "tree-view",
  filename: "structures/heap.py",
  complexities: { best: "O(n)", avg: "O(n)", worst: "O(n)", space: "O(1)" },
  code:
`def max_heapify(a: list[int], i: int, heap_size: int) -> None:
    l = 2 * i + 1
    r = 2 * i + 2
    largest = i
    if l < heap_size and a[l] > a[largest]:
        largest = l
    if r < heap_size and a[r] > a[largest]:
        largest = r
    if largest != i:
        a[i], a[largest] = a[largest], a[i]
        max_heapify(a, largest, heap_size)

def build_max_heap(a: list[int]) -> None:
    for i in range(len(a) // 2 - 1, -1, -1):
        max_heapify(a, i, len(a))`,
  sizeRange: { min: 4, max: 16, default: 10 },
  defaultData(size = 10) {
    // CLRS Fig. 6.4 at default size; shuffle for other sizes.
    if (size === 10) return [4, 1, 3, 2, 16, 9, 10, 14, 8, 7];
    return shuffledRange(size, 43);
  },
  run(input) {
    const heap = input && input.length
      ? [...input]
      : [4, 1, 3, 2, 16, 9, 10, 14, 8, 7];
    const positions = _GLIB.heapTreePositions(heap.length);
    const frames = [];

    function buildNodes(rolesMap = {}) {
      return positions.map((p) => ({
        id: String(p.index),
        label: String(heap[p.index]),
        x: p.x,
        y: p.y,
        state: rolesMap[p.index] || "default",
        sublabel: `a[${p.index}]`,
      }));
    }
    function buildEdges() {
      return positions
        .filter((p) => p.parent != null)
        .map((p) => ({ from: String(p.parent), to: String(p.index), role: "default" }));
    }
    function arraySnapshot(highlights = {}) {
      return { values: [...heap], highlights, title: "array a (heap-as-array)" };
    }
    function pushFrame({ line, desc, role, rolesMap = {}, arrayHi = {}, side = null }) {
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
          nodes: buildNodes(rolesMap),
          edges: buildEdges(),
          array: arraySnapshot(arrayHi),
          side,
        },
      });
    }

    pushFrame({
      line: 14,
      desc: `Read the array as a complete binary tree of n = ${heap.length} nodes. Internal nodes are indices 0..${Math.floor(heap.length / 2) - 1}. Build-Max-Heap calls Max-Heapify on each, from the bottom up.`,
      role: "pivot",
      side: { title: "build-max-heap", rows: [
        { label: "n", value: heap.length },
        { label: "internals", value: `[0..${Math.floor(heap.length / 2) - 1}]` },
        { label: "start at", value: Math.floor(heap.length / 2) - 1 },
      ]},
    });

    function heapifyDown(i, heapSize) {
      while (true) {
        const l = 2 * i + 1;
        const r = 2 * i + 2;
        let largest = i;
        const compareIds = { [i]: "active" };
        if (l < heapSize) compareIds[l] = "compare";
        if (r < heapSize) compareIds[r] = "compare";
        const compareHi = { [i]: "active" };
        if (l < heapSize) compareHi[l] = "compare";
        if (r < heapSize) compareHi[r] = "compare";
        pushFrame({
          line: 5,
          desc: `Max-Heapify(i=${i}): compare a[${i}] = ${heap[i]} with ${l < heapSize ? `a[${l}] = ${heap[l]}` : "—"}${r < heapSize ? ` and a[${r}] = ${heap[r]}` : ""}.`,
          role: "compare",
          rolesMap: compareIds,
          arrayHi: compareHi,
          side: { title: "max-heapify", rows: [
            { label: "i", value: i },
            { label: "l, r", value: `${l}, ${r < heapSize ? r : "—"}` },
            { label: "heap_size", value: heapSize },
          ]},
        });
        if (l < heapSize && heap[l] > heap[largest]) largest = l;
        if (r < heapSize && heap[r] > heap[largest]) largest = r;
        if (largest === i) {
          pushFrame({
            line: 9,
            desc: `a[${i}] is already ≥ both children. Heap property holds at index ${i}; Max-Heapify returns.`,
            role: "found",
            rolesMap: { [i]: "found" },
            arrayHi: { [i]: "found" },
            side: { title: "max-heapify", rows: [
              { label: "i", value: i },
              { label: "largest", value: i },
              { label: "result", value: "no swap" },
            ]},
          });
          return;
        }
        pushFrame({
          line: 9,
          desc: `Largest of the three is a[${largest}] = ${heap[largest]}. Swap a[${i}] ↔ a[${largest}] and recurse on index ${largest}.`,
          role: "swap",
          rolesMap: { [i]: "swap", [largest]: "swap" },
          arrayHi: { [i]: "swap", [largest]: "swap" },
          side: { title: "max-heapify", rows: [
            { label: "swap", value: `a[${i}] ↔ a[${largest}]` },
            { label: "values", value: `${heap[i]} ↔ ${heap[largest]}` },
            { label: "recurse on", value: largest },
          ]},
        });
        [heap[i], heap[largest]] = [heap[largest], heap[i]];
        i = largest;
      }
    }

    for (let i = Math.floor(heap.length / 2) - 1; i >= 0; i--) {
      pushFrame({
        line: 13,
        desc: `Outer loop: i = ${i}. Call Max-Heapify(a, ${i}, ${heap.length}).`,
        role: "pivot",
        rolesMap: { [i]: "active" },
        arrayHi: { [i]: "active" },
        side: { title: "build-max-heap", rows: [
          { label: "i", value: i },
          { label: "subtree", value: `rooted at ${i}` },
        ]},
      });
      heapifyDown(i, heap.length);
    }

    pushFrame({
      line: 14,
      desc: `Build-Max-Heap complete. Every parent dominates its children; a[0] = ${heap[0]} is the maximum.`,
      role: "found",
      rolesMap: Object.fromEntries(positions.map((p) => [p.index, "found"])),
      arrayHi: Object.fromEntries(heap.map((_, i) => [i, "found"])),
      side: { title: "result", rows: [
        { label: "max", value: heap[0] },
        { label: "heap", value: `[${heap.join(", ")}]` },
      ]},
    });
    return frames;
  },
};

// ============================================================
// Binary Search Tree — full step-by-step search trace using TreeView
// ============================================================
const bst = {
  id: "binary-search-tree",
  name: "Binary Search Tree",
  description:
    "A BST keeps every key smaller than a node in its left subtree and every larger key in its right. Search descends one branch and prunes the rest, so each comparison eliminates roughly half the remaining keys.",
  explanation: {
    no: "BST-visualiseringen viser hvordan tre-search velger en gren og hvilket undertre som blir eliminert ved hvert sammenligningstrinn.",
    en: "The BST visualization shows how tree-search picks a branch and which subtree gets eliminated at each comparison step.",
  },
  courseRefs: ["l05"],
  conceptIds: ["bst"],
  learningGoalIds: ["E4", "Z7", "Z8"],
  viewKind: "tree-view",
  filename: "structures/bst.py",
  complexities: { best: "O(log n)", avg: "O(log n)", worst: "O(n)", space: "O(1)" },
  code:
`class Node:
    def __init__(self, key: int) -> None:
        self.key   = key
        self.left:  Node | None = None
        self.right: Node | None = None

def tree_search(x: Node | None, k: int) -> Node | None:
    if x is None or k == x.key:
        return x
    if k < x.key:
        return tree_search(x.left,  k)
    else:
        return tree_search(x.right, k)`,
  sizeRange: { min: 4, max: 15, default: 8 },
  defaultData(size = 8) {
    // CLRS-style 8-key tree at the default size, otherwise generate a
    // pseudo-random insertion order over [1..40] of the requested size.
    if (size === 8) return [15, 6, 18, 3, 7, 17, 20, 13];
    const pool = Array.from({ length: 40 }, (_, i) => i + 1);
    const rng = (function () {
      let s = 47;
      return () => (s = (s * 9301 + 49297) % 233280) / 233280;
    })();
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return pool.slice(0, size);
  },
  run(input) {
    // Build the CLRS-style demo tree by default, or whatever insertion order
    // was passed in.
    const insertOrder = input && input.length ? [...input] : [15, 6, 18, 3, 7, 17, 20, 13];
    const root = _GLIB.buildBST(insertOrder);
    const layout = _GLIB.bstPositions(root);
    // Target = an existing key roughly 3/4 of the way through the in-order
    // sequence so the search descends a non-trivial path.
    const sortedKeys = [...new Set(insertOrder)].sort((a, b) => a - b);
    const target = sortedKeys[Math.floor(sortedKeys.length * 0.7)] || sortedKeys[0];

    // Helpers to find node ids in left/right subtrees of any node, used to
    // mark eliminated branches.
    function nodeById(t, id) {
      if (!t) return null;
      if (t.id === id) return t;
      return nodeById(t.left, id) || nodeById(t.right, id);
    }
    function subtreeIds(t) {
      if (!t) return [];
      return [t.id, ...subtreeIds(t.left), ...subtreeIds(t.right)];
    }

    const eliminated = new Set();
    const visitedPath = [];
    const frames = [];

    function buildNodes(activeId, foundId = null) {
      return layout.flat.map((n) => {
        const p = layout.positions[n.id];
        let state = "default";
        if (n.id === foundId) state = "found";
        else if (n.id === activeId) state = "active";
        else if (visitedPath.includes(n.id)) state = "visited";
        else if (eliminated.has(n.id)) state = "eliminated";
        return {
          id: String(n.id),
          label: String(n.key),
          x: p.x,
          y: p.y,
          state,
        };
      });
    }
    function buildEdges() {
      return layout.flat
        .filter((n) => n.parent != null)
        .map((n) => {
          const parentNode = layout.flat.find((x) => x.id === n.parent);
          const role =
            visitedPath.includes(n.id) && visitedPath.includes(parentNode.id)
              ? "found"
              : eliminated.has(n.id)
              ? "eliminated"
              : "default";
          return {
            from: String(n.parent),
            to: String(n.id),
            label: n.key < parentNode.key ? "<" : ">",
            role,
          };
        });
    }
    function pushFrame({ line, desc, role, activeId = null, foundId = null, side }) {
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
          nodes: buildNodes(activeId, foundId),
          edges: buildEdges(),
          side,
        },
      });
    }

    pushFrame({
      line: 7,
      desc: `tree_search(root, k = ${target}). Start at the root, x = 15.`,
      role: "pivot",
      activeId: root.id,
      side: { title: "tree-search", rows: [
        { label: "k", value: target },
        { label: "x", value: 15 },
        { label: "depth", value: 0 },
      ]},
    });

    let cur = root;
    let depth = 0;
    while (cur) {
      visitedPath.push(cur.id);
      if (target === cur.key) {
        pushFrame({
          line: 8,
          desc: `k = ${target} matches x.key = ${cur.key}. Return x. Path length = ${depth}.`,
          role: "found",
          foundId: cur.id,
          side: { title: "tree-search", rows: [
            { label: "result", value: "found" },
            { label: "x", value: cur.key },
            { label: "depth", value: depth },
          ]},
        });
        break;
      }
      const goLeft = target < cur.key;
      // Mark the OTHER subtree eliminated.
      const eliminatedRoot = goLeft ? cur.right : cur.left;
      if (eliminatedRoot) {
        subtreeIds(eliminatedRoot).forEach((id) => eliminated.add(id));
      }
      pushFrame({
        line: goLeft ? 11 : 13,
        desc: goLeft
          ? `${target} < ${cur.key}: the right subtree of ${cur.key} can't contain ${target}. Recurse on the left child.`
          : `${target} > ${cur.key}: the left subtree of ${cur.key} can't contain ${target}. Recurse on the right child.`,
        role: "eliminated",
        activeId: cur.id,
        side: { title: "tree-search", rows: [
          { label: "k vs x", value: `${target} ${goLeft ? "<" : ">"} ${cur.key}` },
          { label: "go", value: goLeft ? "left" : "right" },
          { label: "pruned", value: eliminatedRoot ? `subtree at ${eliminatedRoot.key}` : "(empty)" },
        ]},
      });
      cur = goLeft ? cur.left : cur.right;
      depth++;
      if (cur) {
        pushFrame({
          line: 7,
          desc: `Now x = ${cur.key} (depth ${depth}). Compare to k = ${target}.`,
          role: "pivot",
          activeId: cur.id,
          side: { title: "tree-search", rows: [
            { label: "k", value: target },
            { label: "x", value: cur.key },
            { label: "depth", value: depth },
          ]},
        });
      } else {
        pushFrame({
          line: 8,
          desc: `Reached a NIL child. ${target} is not in the tree. Return None.`,
          role: "eliminated",
          side: { title: "tree-search", rows: [
            { label: "result", value: "not found" },
            { label: "depth", value: depth },
          ]},
        });
        break;
      }
    }
    return frames;
  },
};

A.register("heapPQ", heapPQ);
A.register("bst", bst);
})();
