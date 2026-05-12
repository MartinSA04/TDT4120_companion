/* global window */
// =====================================================================
// Searching — binary search over a sorted array.
//   binary   viewKind "search"   maintain a [lo,hi] window, halve each step
// =====================================================================
// See js/algorithms/_shared.js for the Frame contract.
(function () {
const A = window.AlgViz.A;
const { mulberry32, shuffledRange, range, fallbackDataForVisual, topicFrame, node, edge, graphVisual, tableVisual, clamp, demoValues, shortList, roleMap, completeTreeNodes, completeTreeEdges, circleNodes, graphEdgeKey, makeIntervalTree, liveTopicFrame, graphFromValues } = window.AlgViz.A;
// ============================================================
// Binary Search
// ============================================================
const binary = {
  id: "binary-search",
  name: "Binary Search",
  description:
    "Maintain a [lo, hi] window. Inspect the middle; if it isn't the target, eliminate the half that can't possibly contain it. O(log n).",
  explanation: {
    no: "Binærsøk bruker sortert input til å halvere søkevinduet. Det er en kompakt modell for rekursiv dekomponering, induksjon og logaritmisk kjøretid.",
    en: "Binary search uses sorted input to halve the search window. It is a compact model for recursive decomposition, induction, and logarithmic running time.",
  },
  courseRefs: ["l03"],
  conceptIds: ["divide-and-conquer", "recurrence", "induction", "bst"],
  learningGoalIds: ["C2", "C5", "Z2", "Z3", "Z4", "Z6"],
  viewKind: "search",
  filename: "algorithms/binary_search.py",
  complexities: {
    best: "O(1)",
    avg: "O(log n)",
    worst: "O(log n)",
    space: "O(1)",
  },
  code:
`def binary_search(a: list[int], target: int) -> int:
    lo, hi = 0, len(a) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if a[mid] == target:
            return mid
        if a[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1`,
  sizeRange: { min: 4, max: 40, default: 20 },
  defaultData(size = 20) {
    // Sorted even numbers 2, 4, 6, …
    return Array.from({ length: size }, (_, i) => (i + 1) * 2);
  },
  run(input) {
    const a = [...input];
    const n = a.length;
    const target = a[Math.floor((n * 3) / 4)];
    let lo = 0;
    let hi = n - 1;
    const frames = [];

    frames.push({
      line: 2,
      desc: `Initial window: lo = 0, hi = ${hi}. Searching for target = ${target}.`,
      data: [...a],
      variables: { target, lo, hi, n },
      highlights: {},
      pointers: {},
      windows: { frame: [lo, hi] },
    });
    while (lo <= hi) {
      frames.push({
        line: 3,
        desc: `Window non-empty (lo = ${lo} ≤ hi = ${hi}); continue searching.`,
        data: [...a],
        variables: { target, lo, hi },
        highlights: {},
        pointers: {},
        windows: { frame: [lo, hi] },
      });
      const mid = (lo + hi) >> 1;
      frames.push({
        line: 4,
        desc: `mid = (lo + hi) // 2 = ${mid}. Inspecting a[mid] = ${a[mid]}.`,
        data: [...a],
        variables: { target, lo, hi, mid, "a[mid]": a[mid] },
        highlights: { pivot: [mid] },
        pointers: {},
        windows: { frame: [lo, hi] },
      });
      if (a[mid] === target) {
        frames.push({
          line: 6,
          desc: `a[mid] == target — found ${target} at index ${mid}.`,
          data: [...a],
          variables: { target, lo, hi, mid, result: mid },
          highlights: { found: [mid] },
          pointers: {},
          windows: { frame: [lo, hi] },
        });
        return frames;
      }
      if (a[mid] < target) {
        frames.push({
          line: 8,
          desc: `a[mid] = ${a[mid]} < target: discard the left half.`,
          data: [...a],
          variables: { target, lo, hi, mid, eliminated: "left" },
          highlights: { pivot: [mid] },
          pointers: {},
          windows: { frame: [lo, hi] },
        });
        lo = mid + 1;
      } else {
        frames.push({
          line: 10,
          desc: `a[mid] = ${a[mid]} > target: discard the right half.`,
          data: [...a],
          variables: { target, lo, hi, mid, eliminated: "right" },
          highlights: { pivot: [mid] },
          pointers: {},
          windows: { frame: [lo, hi] },
        });
        hi = mid - 1;
      }
    }
    frames.push({
      line: 11,
      desc: `Window collapsed (lo > hi): ${target} is not in the list.`,
      data: [...a],
      variables: { target, lo, hi, result: -1 },
      highlights: {},
      pointers: {},
    });
    return frames;
  },
};

A.register("binary", binary);
})();
