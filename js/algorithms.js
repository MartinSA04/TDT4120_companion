/* global window */
(function () {
/* All five algorithms ported to JS.

Each algorithm exposes:
  - name           — display label
  - description    — italic blurb in the left rail
  - viewKind       — which visualization to render
  - code           — Python source as a string (shown in the CodeView)
  - filename       — for the code-view header
  - complexities   — { best, avg, worst, space }
  - defaultData()  — initial input array
  - run(input)     — returns an array of frames; each frame is:
      {
        line: number,        // 1-indexed line in `code` to highlight
        desc: string,        // narrative shown in the step ribbon
        data: number[],      // snapshot of the working list
        variables: object,   // name → value, for the Variables panel
        highlights: {        // role → indices
          compare?: number[], swap?: number[], pivot?: number[],
          sorted?: number[],  eliminated?: number[], found?: number[],
        },
        pointers: object,    // label → index, for chips above bars
        windows?: object,    // name → [lo, hi] inclusive — outlines/regions
        floating?: object,   // index → value — floating boxes above bars
      }
*/

// Deterministic shuffle so the page is reproducible across reloads.
function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffledRange(n, seed = 7) {
  const data = Array.from({ length: n }, (_, i) => i + 1);
  const rng = mulberry32(seed);
  for (let i = data.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [data[i], data[j]] = [data[j], data[i]];
  }
  return data;
}

function range(n) {
  return Array.from({ length: n }, (_, i) => i);
}

// ============================================================
// Bubble Sort
// ============================================================
const bubble = {
  id: "bubble-sort",
  name: "Bubble Sort",
  description:
    "Walk the list comparing each adjacent pair; swap if out of order. After pass i, the i largest elements are locked in at the end.",
  explanation: {
    no: "Bubble Sort er en enkel sammenligningssortering som gjør lokale bytter. Den er nyttig for å se løkkeinvarianter og forskjellen på best-, average- og worst-case.",
    en: "Bubble Sort is a simple comparison sort based on local swaps. It is useful for seeing loop invariants and the difference between best-, average-, and worst-case.",
  },
  courseRefs: ["l01", "l04"],
  conceptIds: ["asymptotic-notation", "loop-invariant"],
  learningGoalIds: ["A4", "A5", "Z3", "Z4", "Z6"],
  viewKind: "bubble",
  filename: "algorithms/bubble_sort.py",
  complexities: { best: "O(n)", avg: "O(n²)", worst: "O(n²)", space: "O(1)" },
  code:
`def bubble_sort(a: list[int]) -> list[int]:
    n = len(a)
    for i in range(n):
        for j in range(n - i - 1):
            if a[j] > a[j + 1]:
                a[j], a[j + 1] = a[j + 1], a[j]
    return a`,
  defaultData() {
    return shuffledRange(20, 7);
  },
  run(input) {
    const a = [...input];
    const n = a.length;
    const frames = [];
    const sortedTail = (i) =>
      Array.from({ length: i }, (_, k) => n - 1 - k).reverse();

    frames.push({
      line: 2,
      desc: `Read length: n = ${n}. The largest unsorted element will bubble right each pass.`,
      data: [...a],
      variables: { n },
      highlights: {},
      pointers: {},
    });
    for (let i = 0; i < n; i++) {
      frames.push({
        line: 3,
        desc: `Pass i = ${i}: scan up to index ${n - i - 1}. The last ${i} are locked in.`,
        data: [...a],
        variables: { n, i },
        highlights: { sorted: sortedTail(i) },
        pointers: { i: Math.min(i, n - 1) },
      });
      if (n - i - 1 <= 0) break;
      for (let j = 0; j < n - i - 1; j++) {
        frames.push({
          line: 5,
          desc: `Compare a[j] = ${a[j]} with a[j+1] = ${a[j + 1]}.`,
          data: [...a],
          variables: { n, i, j, "a[j]": a[j], "a[j+1]": a[j + 1] },
          highlights: { compare: [j, j + 1], sorted: sortedTail(i) },
          pointers: { j, "j+1": j + 1 },
        });
        if (a[j] > a[j + 1]) {
          [a[j], a[j + 1]] = [a[j + 1], a[j]];
          frames.push({
            line: 6,
            desc: `a[j] > a[j+1] — swap: ${a[j + 1]} ↔ ${a[j]}.`,
            data: [...a],
            variables: { n, i, j, "a[j]": a[j], "a[j+1]": a[j + 1] },
            highlights: { swap: [j, j + 1], sorted: sortedTail(i) },
            pointers: { j, "j+1": j + 1 },
          });
        }
      }
    }
    frames.push({
      line: 7,
      desc: "All passes complete — the list is sorted.",
      data: [...a],
      variables: { n },
      highlights: { sorted: range(n) },
      pointers: {},
    });
    return frames;
  },
};

// ============================================================
// Insertion Sort
// ============================================================
const insertion = {
  id: "insertion-sort",
  name: "Insertion Sort",
  description:
    "Take each new element as the 'key', lift it out, then slide cells right across the sorted prefix until the key drops into its place.",
  explanation: {
    no: "Insertion Sort bygger en sortert prefiks én nøkkel av gangen. Den er pensumnær tidlig fordi korrektheten kan vises med en tydelig løkkeinvariant.",
    en: "Insertion Sort builds a sorted prefix one key at a time. It is useful early in the course because correctness follows from a clear loop invariant.",
  },
  courseRefs: ["l01"],
  conceptIds: ["asymptotic-notation", "loop-invariant"],
  learningGoalIds: ["A7", "Z3", "Z4", "Z6"],
  viewKind: "insertion",
  filename: "algorithms/insertion_sort.py",
  complexities: { best: "O(n)", avg: "O(n²)", worst: "O(n²)", space: "O(1)" },
  code:
`def insertion_sort(a: list[int]) -> list[int]:
    for i in range(1, len(a)):
        key = a[i]
        j = i - 1
        while j >= 0 and a[j] > key:
            a[j + 1] = a[j]
            j -= 1
        a[j + 1] = key
    return a`,
  defaultData() {
    return shuffledRange(20, 7);
  },
  run(input) {
    const a = [...input];
    const n = a.length;
    const frames = [];
    const prefix = (k) => range(k);

    frames.push({
      line: 2,
      desc: "Treat a[0] as a sorted prefix of length 1. We'll insert each later element into it.",
      data: [...a],
      variables: { n },
      highlights: { sorted: [0] },
      pointers: {},
    });
    for (let i = 1; i < n; i++) {
      const key = a[i];
      let gap = i;
      frames.push({
        line: 3,
        desc: `i = ${i}: lift the key out of a[i]. Sorted prefix is a[:${i}].`,
        data: [...a],
        variables: { n, i, key },
        highlights: { sorted: prefix(i) },
        pointers: { i },
        floating: { [gap]: key },
        windows: { gap: [gap, gap] },
      });
      let j = i - 1;
      frames.push({
        line: 4,
        desc: `j = ${j}: scan left looking for where the key should drop in.`,
        data: [...a],
        variables: { n, i, key, j },
        highlights: { sorted: prefix(i) },
        pointers: { j },
        floating: { [gap]: key },
        windows: { gap: [gap, gap] },
      });
      while (j >= 0 && a[j] > key) {
        frames.push({
          line: 5,
          desc: `a[j] = ${a[j]} > key = ${key} — shift a[j] right into the gap a[${gap}].`,
          data: [...a],
          variables: { n, i, key, j, "a[j]": a[j] },
          highlights: { compare: [j], sorted: prefix(i) },
          pointers: { j },
          floating: { [gap]: key },
          windows: { gap: [gap, gap] },
        });
        a[j + 1] = a[j];
        gap = j;
        frames.push({
          line: 6,
          desc: `Shifted: a[${j + 1}] now holds ${a[j + 1]}. Gap is now at a[${gap}].`,
          data: [...a],
          variables: { n, i, key, j },
          highlights: { swap: [j + 1], sorted: prefix(i) },
          pointers: { j },
          floating: { [gap]: key },
          windows: { gap: [gap, gap] },
        });
        j -= 1;
      }
      a[j + 1] = key;
      frames.push({
        line: 8,
        desc: `Drop the key into the gap at a[${j + 1}]. Sorted prefix grows to a[:${i + 1}].`,
        data: [...a],
        variables: { n, i, key, j },
        highlights: { swap: [j + 1], sorted: prefix(i + 1) },
        pointers: { "key→": j + 1 },
      });
    }
    frames.push({
      line: 9,
      desc: "All elements inserted — list is sorted.",
      data: [...a],
      variables: { n },
      highlights: { sorted: range(n) },
      pointers: {},
    });
    return frames;
  },
};

// ============================================================
// Selection Sort
// ============================================================
const selection = {
  id: "selection-sort",
  name: "Selection Sort",
  description:
    "Build a sorted prefix by repeatedly scanning the unsorted suffix for its minimum, then swapping that minimum into the next slot.",
  explanation: {
    no: "Selection Sort gjør alltid samme antall sammenligninger, uavhengig av inputrekkefølge. Den gir en ryddig kontrast til adaptive algoritmer som Insertion Sort.",
    en: "Selection Sort performs the same number of comparisons regardless of input order. It gives a clean contrast to adaptive algorithms such as Insertion Sort.",
  },
  courseRefs: ["l04"],
  conceptIds: ["asymptotic-notation", "comparison-lower-bound", "loop-invariant"],
  learningGoalIds: ["D1", "Z3", "Z4", "Z6"],
  viewKind: "selection",
  filename: "algorithms/selection_sort.py",
  complexities: { best: "O(n²)", avg: "O(n²)", worst: "O(n²)", space: "O(1)" },
  code:
`def selection_sort(a: list[int]) -> list[int]:
    n = len(a)
    for i in range(n):
        m = i
        for j in range(i + 1, n):
            if a[j] < a[m]:
                m = j
        a[i], a[m] = a[m], a[i]
    return a`,
  defaultData() {
    return shuffledRange(20, 7);
  },
  run(input) {
    const a = [...input];
    const n = a.length;
    const frames = [];
    const prefix = (k) => range(k);

    frames.push({
      line: 2,
      desc: `Read length: n = ${n}. We'll place the minimum of a[i:] at index i each pass.`,
      data: [...a],
      variables: { n },
      highlights: {},
      pointers: {},
    });
    for (let i = 0; i < n; i++) {
      let m = i;
      frames.push({
        line: 3,
        desc: `Outer pass i = ${i}: searching a[${i}:] for its minimum.`,
        data: [...a],
        variables: { n, i, m, "a[m]": a[m] },
        highlights: { pivot: [m], sorted: prefix(i) },
        pointers: { i },
      });
      frames.push({
        line: 4,
        desc: `Tentatively m = i = ${i}; smallest seen so far is a[m] = ${a[m]}.`,
        data: [...a],
        variables: { n, i, m, "a[m]": a[m] },
        highlights: { pivot: [m], sorted: prefix(i) },
        pointers: { i },
      });
      for (let j = i + 1; j < n; j++) {
        frames.push({
          line: 6,
          desc: `Compare a[j] = ${a[j]} against current min a[m] = ${a[m]}.`,
          data: [...a],
          variables: { n, i, m, j, "a[j]": a[j], "a[m]": a[m] },
          highlights: { compare: [j], pivot: [m], sorted: prefix(i) },
          pointers: { i, j },
        });
        if (a[j] < a[m]) {
          m = j;
          frames.push({
            line: 7,
            desc: `a[j] < a[m]: new minimum is a[${m}] = ${a[m]}.`,
            data: [...a],
            variables: { n, i, m, j, "a[m]": a[m] },
            highlights: { pivot: [m], sorted: prefix(i) },
            pointers: { i, j },
          });
        }
      }
      if (m !== i) {
        [a[i], a[m]] = [a[m], a[i]];
        frames.push({
          line: 8,
          desc: `Swap a[${i}] and a[${m}]: minimum lands in the sorted prefix.`,
          data: [...a],
          variables: { n, i, m, "a[i]": a[i] },
          highlights: { swap: [i, m], sorted: prefix(i + 1) },
          pointers: { i },
        });
      } else {
        frames.push({
          line: 8,
          desc: `a[${i}] was already the minimum — no swap needed.`,
          data: [...a],
          variables: { n, i, m, "a[i]": a[i] },
          highlights: { sorted: prefix(i + 1) },
          pointers: { i },
        });
      }
    }
    frames.push({
      line: 9,
      desc: "All elements placed — sorted.",
      data: [...a],
      variables: { n },
      highlights: { sorted: range(n) },
      pointers: {},
    });
    return frames;
  },
};

// ============================================================
// Quick Sort  (Lomuto partition, rightmost pivot)
// ============================================================
const quick = {
  id: "quick-sort",
  name: "Quick Sort",
  description:
    "Choose a pivot (here: rightmost), partition the window into ≤ pivot / > pivot, drop the pivot between them, then recurse on each side.",
  explanation: {
    no: "Quicksort viser splitt og hersk med partisjonering. Den er rask i forventning, men pivotvalg bestemmer forskjellen mellom god og dårlig kjøretid.",
    en: "Quicksort demonstrates divide and conquer through partitioning. It is fast in expectation, but pivot choice determines the difference between good and poor running time.",
  },
  courseRefs: ["l03", "l04"],
  conceptIds: ["divide-and-conquer", "recurrence", "comparison-lower-bound"],
  learningGoalIds: ["C1", "C4", "C5", "Z3", "Z4", "Z6"],
  viewKind: "quick",
  filename: "algorithms/quick_sort.py",
  complexities: {
    best: "O(n log n)",
    avg: "O(n log n)",
    worst: "O(n²)",
    space: "O(log n)",
  },
  code:
`def quick_sort(a: list[int], lo: int = 0, hi: int | None = None) -> None:
    if hi is None:
        hi = len(a) - 1
    if lo >= hi:
        return
    pivot = a[hi]
    i = lo - 1
    for j in range(lo, hi):
        if a[j] <= pivot:
            i += 1
            a[i], a[j] = a[j], a[i]
    a[i + 1], a[hi] = a[hi], a[i + 1]
    quick_sort(a, lo, i)
    quick_sort(a, i + 2, hi)`,
  defaultData() {
    return shuffledRange(20, 11);
  },
  run(input) {
    const a = [...input];
    const n = a.length;
    const frames = [];
    const sortedSet = new Set();

    function partition(lo, hi) {
      if (lo >= hi) {
        if (lo === hi) {
          sortedSet.add(lo);
          frames.push({
            line: 5,
            desc: `Window [${lo}..${hi}] has one element — it's trivially in place.`,
            data: [...a],
            variables: { lo, hi },
            highlights: { sorted: [...sortedSet].sort((x, y) => x - y) },
            pointers: { "lo/hi": lo },
            windows: { frame: [lo, hi] },
          });
        }
        return;
      }
      const sortedAtEntry = [...sortedSet].sort((x, y) => x - y);
      const pivot = a[hi];
      frames.push({
        line: 6,
        desc: `Partition window [${lo}..${hi}]. Pivot = a[hi] = ${pivot}.`,
        data: [...a],
        variables: { lo, hi, pivot },
        highlights: { pivot: [hi], sorted: sortedAtEntry },
        pointers: { lo, hi },
        windows: { frame: [lo, hi] },
      });
      let i = lo - 1;
      frames.push({
        line: 7,
        desc: `i = ${i}: boundary of the ≤-pivot region (none yet).`,
        data: [...a],
        variables: { lo, hi, pivot, i },
        highlights: { pivot: [hi], sorted: sortedAtEntry },
        pointers: { lo, hi },
        windows: { frame: [lo, hi] },
      });
      for (let j = lo; j < hi; j++) {
        const lePtr = i >= lo ? { i } : {};
        const leWin = i >= lo ? { le: [lo, i] } : {};
        frames.push({
          line: 9,
          desc: `j = ${j}: compare a[j] = ${a[j]} against pivot ${pivot}.`,
          data: [...a],
          variables: { lo, hi, pivot, i, j, "a[j]": a[j] },
          highlights: { compare: [j], pivot: [hi], sorted: sortedAtEntry },
          pointers: { j, hi, ...lePtr },
          windows: { frame: [lo, hi], ...leWin },
        });
        if (a[j] <= pivot) {
          i += 1;
          if (i !== j) {
            [a[i], a[j]] = [a[j], a[i]];
            frames.push({
              line: 11,
              desc: `a[j] ≤ pivot: grow ≤-region by swapping a[${i}] with a[${j}].`,
              data: [...a],
              variables: { lo, hi, pivot, i, j },
              highlights: { swap: [i, j], pivot: [hi], sorted: sortedAtEntry },
              pointers: { i, j, hi },
              windows: { frame: [lo, hi], le: [lo, i] },
            });
          } else {
            frames.push({
              line: 10,
              desc: "a[j] ≤ pivot: i and j coincide, so just extend i (no swap).",
              data: [...a],
              variables: { lo, hi, pivot, i, j },
              highlights: { pivot: [hi], sorted: sortedAtEntry },
              pointers: { i, j, hi },
              windows: { frame: [lo, hi], le: [lo, i] },
            });
          }
        }
      }
      [a[i + 1], a[hi]] = [a[hi], a[i + 1]];
      sortedSet.add(i + 1);
      frames.push({
        line: 12,
        desc: `Drop the pivot at a[${i + 1}], between the ≤- and >-regions.`,
        data: [...a],
        variables: { lo, hi, pivot, i },
        highlights: {
          swap: [i + 1],
          sorted: [...sortedSet].sort((x, y) => x - y),
        },
        pointers: { "pivot→": i + 1 },
        windows: { frame: [lo, hi] },
      });
      partition(lo, i);
      partition(i + 2, hi);
    }

    frames.push({
      line: 2,
      desc: `Initial call: lo = 0, hi = ${n - 1}.`,
      data: [...a],
      variables: { n, lo: 0, hi: n - 1 },
      highlights: {},
      pointers: {},
      windows: { frame: [0, n - 1] },
    });
    partition(0, n - 1);
    frames.push({
      line: 2,
      desc: "Done — list is sorted.",
      data: [...a],
      variables: {},
      highlights: { sorted: range(n) },
      pointers: {},
    });
    return frames;
  },
};

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
  defaultData() {
    // Sorted even numbers 2..40
    return Array.from({ length: 20 }, (_, i) => (i + 1) * 2);
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

// ============================================================
// Course-topic visualizations
// ============================================================
function fallbackDataForVisual(visual) {
  if (!visual) return [1, 2, 3, 4];
  if (Array.isArray(visual.array) && visual.array.length) {
    return visual.array.map((value, idx) =>
      typeof value === "number" && Number.isFinite(value) ? value : idx + 1
    );
  }
  if (Array.isArray(visual.activities) && visual.activities.length) {
    return visual.activities.map((activity) =>
      Math.max(1, (activity.end || 0) - (activity.start || 0))
    );
  }
  if (Array.isArray(visual.nodes) && visual.nodes.length) {
    return Array.from(
      { length: Math.max(4, visual.nodes.length) },
      (_, idx) => idx + 1
    );
  }
  if (Array.isArray(visual.rows) && Array.isArray(visual.cols)) {
    return Array.from(
      { length: Math.max(1, visual.rows.length * visual.cols.length) },
      (_, idx) => (idx % Math.max(1, visual.cols.length)) + 1
    );
  }
  if (Array.isArray(visual.boxes) && visual.boxes.length) {
    return Array.from(
      { length: Math.max(4, visual.boxes.length) },
      (_, idx) => idx + 1
    );
  }
  return [1, 2, 3, 4];
}

function topicFrame(line, desc, visual, variables = {}, role = "pivot") {
  return {
    line,
    desc,
    data: fallbackDataForVisual(visual),
    viewKind: visual?.type || "topic",
    variables,
    highlights: role ? { [role]: [0] } : {},
    pointers: {},
    visual,
  };
}

function node(id, label, x, y, role = "default", sublabel = "") {
  return { id, label, x, y, role, sublabel };
}

function edge(from, to, label = "", role = "default") {
  return { from, to, label, role };
}

function graphVisual(kind, nodes, edges, meta = {}) {
  return { type: kind, nodes, edges, ...meta };
}

function tableVisual(rows, cols, values, meta = {}) {
  return { type: "table", rows, cols, values, ...meta };
}

const mergeSort = {
  id: "merge-sort",
  name: "Merge Sort",
  description:
    "Split the array in half, sort both halves recursively, then merge two sorted halves into one sorted array.",
  explanation: {
    no: "Merge Sort viser splitt og hersk i ren form: del i to, sorter delene rekursivt, og flett sorterte delresultater.",
    en: "Merge Sort shows divide and conquer in a clean form: split in two, sort the parts recursively, and merge sorted subresults.",
  },
  courseRefs: ["l03"],
  conceptIds: ["divide-and-conquer", "recurrence"],
  learningGoalIds: ["C1", "C3", "C5", "Z3", "Z4", "Z6"],
  viewKind: "tree",
  filename: "algorithms/merge_sort.py",
  complexities: { best: "O(n log n)", avg: "O(n log n)", worst: "O(n log n)", space: "O(n)" },
  code:
`def merge_sort(a):
    if len(a) <= 1:
        return a
    mid = len(a) // 2
    left = merge_sort(a[:mid])
    right = merge_sort(a[mid:])
    return merge(left, right)`,
  defaultData() { return range(8); },
  run() {
    const nodes = [
      node("a", "A[0..7]", 50, 8, "focus", "8 3 7 4 9 2 6 5"),
      node("l", "A[0..3]", 28, 30, "default", "8 3 7 4"),
      node("r", "A[4..7]", 72, 30, "default", "9 2 6 5"),
      node("ll", "A[0..1]", 16, 52, "default", "8 3"),
      node("lr", "A[2..3]", 40, 52, "default", "7 4"),
      node("rl", "A[4..5]", 60, 52, "default", "9 2"),
      node("rr", "A[6..7]", 84, 52, "default", "6 5"),
      node("m1", "3 8", 16, 76, "sorted"),
      node("m2", "4 7", 40, 76, "sorted"),
      node("m3", "2 9", 60, 76, "sorted"),
      node("m4", "5 6", 84, 76, "sorted"),
    ];
    const edges = [
      edge("a", "l", "split"), edge("a", "r", "split"),
      edge("l", "ll"), edge("l", "lr"), edge("r", "rl"), edge("r", "rr"),
      edge("ll", "m1", "merge"), edge("lr", "m2", "merge"),
      edge("rl", "m3", "merge"), edge("rr", "m4", "merge"),
    ];
    const splitSkeleton = {
      nodes: nodes.slice(0, 7).map((item) =>
        item.id === "a" ? item : { ...item, role: "eliminated" }
      ),
      edges: edges.slice(0, 6).map((item) => ({ ...item, role: "eliminated" })),
    };
    return [
      topicFrame(1, "Start with one unsorted instance. The dimmed nodes show the subproblems we are about to create.", graphVisual("tree", splitSkeleton.nodes, splitSkeleton.edges, { array: [8, 3, 7, 4, 9, 2, 6, 5] }), { n: 8 }),
      topicFrame(4, "Split at the midpoint. The two recursive calls are independent subinstances.", graphVisual("tree", nodes.slice(0, 3), edges.slice(0, 2)), { mid: 4 }),
      topicFrame(5, "Keep splitting until the base cases are single elements.", graphVisual("tree", nodes.slice(0, 7), edges.slice(0, 6)), { depth: 2 }),
      topicFrame(7, "Merge sorted pairs while returning from recursion.", graphVisual("tree", nodes, edges), { mergeWidth: 2 }, "sorted"),
      topicFrame(7, "Final merge combines [3,4,7,8] and [2,5,6,9] into a sorted array.", graphVisual("tree", [
        ...nodes,
        node("lm", "3 4 7 8", 28, 92, "sorted"),
        node("rm", "2 5 6 9", 72, 92, "sorted"),
        node("done", "sorted", 50, 108, "found", "2 3 4 5 6 7 8 9"),
      ], [...edges, edge("m1", "lm"), edge("m2", "lm"), edge("m3", "rm"), edge("m4", "rm"), edge("lm", "done"), edge("rm", "done")]), { T: "2T(n/2)+Theta(n)" }, "found"),
    ];
  },
};

const recursionTree = {
  id: "recursion-tree",
  name: "Recursion Tree",
  description:
    "Expand a recurrence into levels. Sum the cost across each level, then sum the levels.",
  explanation: {
    no: "Rekursjonstrær gjør rekurrenser visuelle: hver node er et rekursivt kall, og hvert nivå viser samlet arbeid.",
    en: "Recursion trees make recurrences visual: each node is a recursive call, and each level shows total work.",
  },
  courseRefs: ["l03"],
  conceptIds: ["recurrence", "divide-and-conquer"],
  learningGoalIds: ["C5", "C6"],
  viewKind: "tree",
  filename: "analysis/recursion_tree.py",
  complexities: { best: "—", avg: "T(n)", worst: "Θ(n log n)", space: "stack" },
  code:
`T(n) = 2T(n/2) + n

level 0: n
level 1: 2 * n/2 = n
level 2: 4 * n/4 = n
...
lg n levels
total = n lg n`,
  defaultData() { return range(8); },
  run() {
    const nodes = [
      node("n", "n", 50, 8, "focus", "cost n"),
      node("n2a", "n/2", 30, 30, "compare", "cost n/2"),
      node("n2b", "n/2", 70, 30, "compare", "cost n/2"),
      node("n4a", "n/4", 18, 52, "pivot", "cost n/4"),
      node("n4b", "n/4", 42, 52, "pivot", "cost n/4"),
      node("n4c", "n/4", 58, 52, "pivot", "cost n/4"),
      node("n4d", "n/4", 82, 52, "pivot", "cost n/4"),
      node("leaf", "1 ... 1", 50, 78, "sorted", "n leaves"),
    ];
    const edges = [
      edge("n", "n2a"), edge("n", "n2b"),
      edge("n2a", "n4a"), edge("n2a", "n4b"),
      edge("n2b", "n4c"), edge("n2b", "n4d"),
      edge("n4a", "leaf"), edge("n4b", "leaf"), edge("n4c", "leaf"), edge("n4d", "leaf"),
    ];
    const skeletonNodes = nodes.map((item) =>
      item.id === "n" ? item : { ...item, role: "eliminated" }
    );
    const skeletonEdges = edges.map((item) => ({ ...item, role: "eliminated" }));
    return [
      topicFrame(1, "Start from the recurrence. The full dimmed skeleton shows the expansion we will reveal level by level.", graphVisual("tree", skeletonNodes, skeletonEdges, { levelCosts: ["n"] }), { recurrence: "2T(n/2)+n" }),
      topicFrame(1, "Expand the two T(n/2) terms. Together, level 1 also costs n.", graphVisual("tree", nodes.slice(0, 3), edges.slice(0, 2), { levelCosts: ["n", "n"] }), { level: 1 }),
      topicFrame(1, "Expand again. Four calls each cost n/4, so the level total is still n.", graphVisual("tree", nodes.slice(0, 7), edges.slice(0, 6), { levelCosts: ["n", "n", "n"] }), { level: 2 }),
      topicFrame(6, "There are lg n levels before the subproblem size reaches 1.", graphVisual("tree", nodes, edges, { levelCosts: ["n", "n", "n", "...", "n"] }), { height: "lg n" }),
      topicFrame(7, "Sum level cost n over lg n levels: T(n) = Θ(n lg n).", graphVisual("tree", nodes, edges, { levelCosts: ["n repeated lg n times", "total Θ(n lg n)"] }), { total: "Theta(n lg n)" }, "found"),
    ];
  },
};

const countingRadix = {
  id: "counting-radix",
  name: "Counting / Radix Sort",
  description:
    "Counting sort places keys by counts. Radix sort repeats a stable counting sort on digit positions.",
  explanation: {
    no: "Counting Sort bruker antakelser om nøkkelområdet. Radix Sort er riktig fordi hvert siffersteg er stabilt.",
    en: "Counting Sort uses assumptions about the key range. Radix Sort is correct because every digit pass is stable.",
  },
  courseRefs: ["l04"],
  conceptIds: ["stable-sort", "comparison-lower-bound"],
  learningGoalIds: ["D2", "D3", "D4", "Z3", "Z6"],
  viewKind: "buckets",
  filename: "algorithms/radix_sort.py",
  complexities: { best: "Θ(d(n+k))", avg: "Θ(d(n+k))", worst: "Θ(d(n+k))", space: "Θ(n+k)" },
  code:
`def radix_sort(a, digits):
    for pos in range(digits):
        stable_counting_sort(a, key=lambda x: digit(x, pos))
    return a`,
  defaultData() { return range(8); },
  run() {
    return [
      topicFrame(2, "Start with two-digit keys. We first sort by the ones digit.", { type: "buckets", array: [23, 11, 42, 32, 15, 21], buckets: {}, active: "ones" }, { pass: "ones" }),
      topicFrame(3, "Counting sort groups by ones digit: 1, 2, 3, and 5.", { type: "buckets", array: [23, 11, 42, 32, 15, 21], buckets: { 1: [11, 21], 2: [42, 32], 3: [23], 5: [15] }, active: "count" }, { buckets: 4 }, "compare"),
      topicFrame(3, "Stable output by ones digit keeps 42 before 32 because both have digit 2.", { type: "buckets", array: [11, 21, 42, 32, 23, 15], buckets: { output: [11, 21, 42, 32, 23, 15] }, active: "stable output" }, { stable: "yes" }, "sorted"),
      topicFrame(3, "Now sort stably by tens digit. Stability preserves the ones-order inside equal tens groups.", { type: "buckets", array: [11, 21, 42, 32, 23, 15], buckets: { 1: [11, 15], 2: [21, 23], 3: [32], 4: [42] }, active: "tens" }, { pass: "tens" }, "compare"),
      topicFrame(4, "After the final stable digit pass, the whole array is sorted.", { type: "buckets", array: [11, 15, 21, 23, 32, 42], buckets: { sorted: [11, 15, 21, 23, 32, 42] }, active: "done" }, { result: "sorted" }, "found"),
    ];
  },
};

const heapPQ = {
  id: "heap-priority-queue",
  name: "Heap / Priority Queue",
  description:
    "A heap stores a nearly complete tree in an array and restores the heap property with local swaps.",
  explanation: {
    no: "Haugen viser hvordan en tabell kan tolkes som et tre, og hvordan Max-Heapify flytter et brudd nedover.",
    en: "The heap shows how an array can be interpreted as a tree, and how Max-Heapify moves a violation downward.",
  },
  courseRefs: ["l05"],
  conceptIds: ["heap"],
  learningGoalIds: ["E1", "E2", "Z7", "Z8"],
  viewKind: "tree",
  filename: "structures/heap.py",
  complexities: { best: "O(1)", avg: "O(log n)", worst: "O(log n)", space: "O(1)" },
  code:
`def max_heapify(a, i, heap_size):
    l, r = left(i), right(i)
    largest = i
    if l < heap_size and a[l] > a[largest]:
        largest = l
    if r < heap_size and a[r] > a[largest]:
        largest = r
    if largest != i:
        swap(a[i], a[largest])
        max_heapify(a, largest, heap_size)`,
  defaultData() { return range(8); },
  run() {
    const base = [
      node("16", "16", 50, 8, "sorted", "a[0]"),
      node("14", "14", 30, 30, "sorted", "a[1]"),
      node("10", "10", 70, 30, "sorted", "a[2]"),
      node("8", "8", 20, 52, "sorted", "a[3]"),
      node("7", "7", 40, 52, "sorted", "a[4]"),
      node("9", "9", 60, 52, "sorted", "a[5]"),
      node("3", "3", 80, 52, "sorted", "a[6]"),
    ];
    const broken = [node("4", "4", 50, 8, "swap", "a[0]"), ...base.slice(1)];
    const edges = [edge("16", "14"), edge("16", "10"), edge("14", "8"), edge("14", "7"), edge("10", "9"), edge("10", "3")];
    const brokenEdges = [edge("4", "14"), edge("4", "10"), ...edges.slice(2)];
    return [
      topicFrame(1, "A max-heap is a complete tree represented as an array. Parent values dominate children.", graphVisual("tree", base, edges, { array: [16, 14, 10, 8, 7, 9, 3] }), { heapSize: 7 }, "sorted"),
      topicFrame(1, "After extracting the max, the last value moves to the root and may violate the heap property.", graphVisual("tree", broken, brokenEdges, { array: [4, 14, 10, 8, 7, 9, 3] }), { i: 0 }, "swap"),
      topicFrame(4, "Compare the root with its children. The largest child is 14.", graphVisual("tree", broken.map((n) => n.id === "14" ? { ...n, role: "pivot" } : n), brokenEdges, { array: [4, 14, 10, 8, 7, 9, 3] }), { largest: 1 }, "compare"),
      topicFrame(9, "Swap 4 with 14 and continue heapifying at the child position.", graphVisual("tree", [
        node("14", "14", 50, 8, "sorted", "a[0]"),
        node("4", "4", 30, 30, "swap", "a[1]"),
        ...base.slice(2),
      ], [edge("14", "4"), edge("14", "10"), ...edges.slice(2)], { array: [14, 4, 10, 8, 7, 9, 3] }), { i: 1 }, "swap"),
      topicFrame(10, "One more local swap restores the max-heap property.", graphVisual("tree", [
        node("14", "14", 50, 8, "sorted", "a[0]"),
        node("8", "8", 30, 30, "sorted", "a[1]"),
        node("10", "10", 70, 30, "sorted", "a[2]"),
        node("4", "4", 20, 52, "found", "a[3]"),
        ...base.slice(4),
      ], [edge("14", "8"), edge("14", "10"), edge("8", "4"), edge("8", "7"), edge("10", "9"), edge("10", "3")], { array: [14, 8, 10, 4, 7, 9, 3] }), { property: "restored" }, "found"),
    ];
  },
};

const bst = {
  id: "binary-search-tree",
  name: "Binary Search Tree",
  description:
    "A binary search tree keeps all smaller keys left of a node and all larger keys right of it, recursively.",
  explanation: {
    no: "BST-visualiseringen viser hvordan søk og innsetting følger søketre-egenskapen nedover treet.",
    en: "The BST visualization shows how search and insertion follow the search-tree property down the tree.",
  },
  courseRefs: ["l05"],
  conceptIds: ["bst"],
  learningGoalIds: ["E4", "Z7", "Z8"],
  viewKind: "tree",
  filename: "structures/bst.py",
  complexities: { best: "O(log n)", avg: "O(log n)", worst: "O(n)", space: "O(1)" },
  code:
`def tree_search(x, k):
    if x is None or k == x.key:
        return x
    if k < x.key:
        return tree_search(x.left, k)
    return tree_search(x.right, k)`,
  defaultData() { return range(8); },
  run() {
    const nodes = [
      node("15", "15", 50, 8),
      node("6", "6", 28, 30),
      node("18", "18", 72, 30),
      node("3", "3", 16, 52),
      node("7", "7", 40, 52),
      node("17", "17", 62, 52),
      node("20", "20", 84, 52),
      node("13", "13", 45, 74),
    ];
    const edges = [edge("15", "6", "<"), edge("15", "18", ">"), edge("6", "3"), edge("6", "7"), edge("18", "17"), edge("18", "20"), edge("7", "13")];
    return [
      topicFrame(1, "Search for 13. Start at the root and compare keys.", graphVisual("tree", nodes.map((n) => n.id === "15" ? { ...n, role: "focus" } : n), edges), { k: 13, x: 15 }),
      topicFrame(4, "13 < 15, so the right subtree cannot contain the key. Go left.", graphVisual("tree", nodes.map((n) => n.id === "6" ? { ...n, role: "focus" } : n.id === "18" || n.id === "20" || n.id === "17" ? { ...n, role: "eliminated" } : n), edges), { k: 13, x: 6 }, "eliminated"),
      topicFrame(6, "13 > 6, so go right.", graphVisual("tree", nodes.map((n) => n.id === "7" ? { ...n, role: "focus" } : n), edges), { k: 13, x: 7 }),
      topicFrame(6, "13 > 7, so go right again.", graphVisual("tree", nodes.map((n) => n.id === "13" ? { ...n, role: "focus" } : n), edges), { k: 13, x: 13 }),
      topicFrame(2, "The key matches. The path length is the tree height along this branch.", graphVisual("tree", nodes.map((n) => ["15", "6", "7", "13"].includes(n.id) ? { ...n, role: "found" } : n), edges), { result: "found" }, "found"),
    ];
  },
};

const dpTable = {
  id: "dp-table",
  name: "DP Table",
  description:
    "Dynamic programming stores overlapping subproblem answers in a table and fills it in dependency order.",
  explanation: {
    no: "DP-tabellen viser binært ryggsekkproblem: hver celle K[i,j] spør hvor mye verdi vi kan få med de i første gjenstandene og kapasitet j.",
    en: "The DP table shows 0/1 knapsack: each cell K[i,j] asks how much value we can get from the first i items and capacity j.",
  },
  courseRefs: ["l06"],
  conceptIds: ["dynamic-programming", "binary-knapsack"],
  learningGoalIds: ["F1", "F2", "F3", "F4", "F5", "F9"],
  viewKind: "table",
  filename: "dp/knapsack.py",
  complexities: { best: "Θ(nW)", avg: "Θ(nW)", worst: "Θ(nW)", space: "Θ(nW)" },
  code:
`def knapsack(values, weights, W):
    K = table(n + 1, W + 1)
    for i in range(1, n + 1):
        for j in range(W + 1):
            K[i,j] = K[i-1,j]
            if weights[i] <= j:
                K[i,j] = max(K[i,j], K[i-1,j-weights[i]] + values[i])
    return K[n,W]`,
  defaultData() { return range(8); },
  run() {
    const rows = ["0", "item 1", "item 2", "item 3"];
    const cols = ["0", "1", "2", "3", "4", "5"];
    return [
      topicFrame(2, "Create a table. Row i means first i items; column j means capacity j.", tableVisual(rows, cols, [
        [0, 0, 0, 0, 0, 0],
        ["", "", "", "", "", ""],
        ["", "", "", "", "", ""],
        ["", "", "", "", "", ""],
      ], { active: [0, 0] }), { n: 3, W: 5 }),
      topicFrame(5, "Base row is zero: with no items, every capacity gives value 0.", tableVisual(rows, cols, [
        [0, 0, 0, 0, 0, 0],
        ["", "", "", "", "", ""],
        ["", "", "", "", "", ""],
        ["", "", "", "", "", ""],
      ], { rowHighlight: 0 }), { i: 0 }, "sorted"),
      topicFrame(6, "Item 1 has weight 2 and value 3. For capacity 2 and above, include it.", tableVisual(rows, cols, [
        [0, 0, 0, 0, 0, 0],
        [0, 0, 3, 3, 3, 3],
        ["", "", "", "", "", ""],
        ["", "", "", "", "", ""],
      ], { rowHighlight: 1, active: [1, 2] }), { item: 1, w: 2, v: 3 }, "compare"),
      topicFrame(7, "Item 2 has weight 3 and value 4. Each cell chooses max(skip, take).", tableVisual(rows, cols, [
        [0, 0, 0, 0, 0, 0],
        [0, 0, 3, 3, 3, 3],
        [0, 0, 3, 4, 4, 7],
        ["", "", "", "", "", ""],
      ], { rowHighlight: 2, active: [2, 5], dependency: [[1, 5], [1, 2]] }), { skip: 3, take: 7 }, "pivot"),
      topicFrame(8, "After item 3, the optimum at K[3,5] is 7. Reconstruction follows the choices backward.", tableVisual(rows, cols, [
        [0, 0, 0, 0, 0, 0],
        [0, 0, 3, 3, 3, 3],
        [0, 0, 3, 4, 4, 7],
        [0, 0, 3, 4, 5, 7],
      ], { active: [3, 5], path: [[3, 5], [2, 5], [1, 2]] }), { optimum: 7 }, "found"),
    ];
  },
};

const activitySelection = {
  id: "activity-selection",
  name: "Activity Selection",
  description:
    "Pick the compatible activity that finishes first, then repeat on what remains.",
  explanation: {
    no: "Aktivitetsutvelgelse viser et klassisk grådig valg: velg aktiviteten som slutter tidligst.",
    en: "Activity selection shows a classic greedy choice: choose the activity that finishes earliest.",
  },
  courseRefs: ["l07"],
  conceptIds: ["greedy-choice"],
  learningGoalIds: ["G1", "G2", "G3"],
  viewKind: "timeline",
  filename: "greedy/activity_selection.py",
  complexities: { best: "Θ(n)", avg: "Θ(n)", worst: "Θ(n)", space: "O(1)" },
  code:
`def activity_selection(activities):
    sort by finish time
    last_finish = 0
    for activity in activities:
        if activity.start >= last_finish:
            choose activity
            last_finish = activity.finish`,
  defaultData() { return range(8); },
  run() {
    const activities = [
      { id: "a1", label: "a1", start: 1, end: 4 },
      { id: "a2", label: "a2", start: 3, end: 5 },
      { id: "a3", label: "a3", start: 0, end: 6 },
      { id: "a4", label: "a4", start: 5, end: 7 },
      { id: "a5", label: "a5", start: 8, end: 9 },
      { id: "a6", label: "a6", start: 5, end: 9 },
    ];
    return [
      topicFrame(2, "Sort activities by finish time. The first finish leaves maximum room for the rest.", { type: "timeline", activities, selected: [], active: "a1", range: [0, 10] }, { sortedBy: "finish" }),
      topicFrame(5, "Choose a1 because it finishes first.", { type: "timeline", activities, selected: ["a1"], active: "a1", range: [0, 10] }, { lastFinish: 4 }, "found"),
      topicFrame(4, "Reject a2 and a3 because they overlap the last chosen activity.", { type: "timeline", activities, selected: ["a1"], rejected: ["a2", "a3"], active: "a2", range: [0, 10] }, { overlap: "yes" }, "eliminated"),
      topicFrame(5, "Choose a4, the next compatible activity with earliest finish.", { type: "timeline", activities, selected: ["a1", "a4"], active: "a4", range: [0, 10] }, { lastFinish: 7 }, "found"),
      topicFrame(5, "Choose a5 and finish with a maximal compatible set.", { type: "timeline", activities, selected: ["a1", "a4", "a5"], rejected: ["a2", "a3", "a6"], active: "a5", range: [0, 10] }, { count: 3 }, "found"),
    ];
  },
};

const bfsDfs = {
  id: "bfs-dfs",
  name: "BFS / DFS",
  description:
    "Graph traversal is controlled by the frontier discipline: FIFO gives BFS, LIFO/recursion gives DFS.",
  explanation: {
    no: "BFS/DFS-visualiseringen viser samme graf med ulike frontier-regler.",
    en: "The BFS/DFS visualization shows the same graph under different frontier rules.",
  },
  courseRefs: ["l08"],
  conceptIds: ["graph-traversal", "bfs", "dfs"],
  learningGoalIds: ["H2", "H3", "H7", "H8", "H9"],
  viewKind: "graph",
  filename: "graphs/traversal.py",
  complexities: { best: "Θ(V+E)", avg: "Θ(V+E)", worst: "Θ(V+E)", space: "Θ(V)" },
  code:
`def traverse(G, s, frontier):
    discover s
    while frontier:
        u = frontier.pop()
        for v in G.adj[u]:
            if v is white:
                discover v
                frontier.push(v)`,
  defaultData() { return range(8); },
  run() {
    const nodes = [
      node("s", "s", 15, 42), node("a", "a", 34, 20), node("b", "b", 34, 64),
      node("c", "c", 56, 20), node("d", "d", 56, 64), node("e", "e", 78, 42),
    ];
    const edges = [edge("s", "a"), edge("s", "b"), edge("a", "c"), edge("b", "d"), edge("c", "e"), edge("d", "e")];
    return [
      topicFrame(1, "Start at s. The frontier contains discovered but unfinished nodes.", graphVisual("graph", nodes.map((n) => n.id === "s" ? { ...n, role: "focus" } : n), edges, { frontier: ["s"] }), { frontier: "queue/stack" }),
      topicFrame(4, "BFS with a FIFO queue discovers a and b as distance 1.", graphVisual("graph", nodes.map((n) => ["s", "a", "b"].includes(n.id) ? { ...n, role: "found" } : n), edges.map((e) => e.from === "s" ? { ...e, role: "found" } : e), { frontier: ["a", "b"], mode: "BFS" }), { distance: 1 }, "found"),
      topicFrame(4, "BFS continues layer by layer, reaching c and d before e.", graphVisual("graph", nodes.map((n) => ["s", "a", "b", "c", "d"].includes(n.id) ? { ...n, role: "found" } : n), edges, { frontier: ["c", "d"], mode: "BFS" }), { distance: 2 }, "found"),
      topicFrame(4, "DFS uses the newest frontier item first, following one branch deeply.", graphVisual("graph", nodes.map((n) => ["s", "a", "c", "e"].includes(n.id) ? { ...n, role: "pivot" } : n), edges.map((e) => ["s-a", "a-c", "c-e"].includes(`${e.from}-${e.to}`) ? { ...e, role: "pivot" } : e), { frontier: ["b"], mode: "DFS" }), { path: "s-a-c-e" }, "pivot"),
      topicFrame(5, "Both visit the reachable component in Θ(V+E); the frontier rule changes the traversal tree.", graphVisual("graph", nodes.map((n) => ({ ...n, role: "found" })), edges.map((e) => ({ ...e, role: "found" })), { mode: "complete" }), { time: "Theta(V+E)" }, "found"),
    ];
  },
};

const mst = {
  id: "mst-kruskal-prim",
  name: "MST: Kruskal / Prim",
  description:
    "Minimum-spanning-tree algorithms repeatedly choose safe light edges.",
  explanation: {
    no: "MST-visualiseringen fokuserer på trygge kanter, snitt og hvordan Kruskal bygger en skog.",
    en: "The MST visualization focuses on safe edges, cuts, and how Kruskal builds a forest.",
  },
  courseRefs: ["l09"],
  conceptIds: ["mst", "disjoint-set", "greedy-choice"],
  learningGoalIds: ["I1", "I2", "I3", "I4", "I5", "I6"],
  viewKind: "graph",
  filename: "graphs/mst.py",
  complexities: { best: "O(E log V)", avg: "O(E log V)", worst: "O(E log V)", space: "O(V)" },
  code:
`def kruskal(G):
    A = empty set
    for each vertex v:
        make_set(v)
    for edge (u, v) in sorted_edges:
        if find_set(u) != find_set(v):
            A.add((u, v))
            union(u, v)
    return A`,
  defaultData() { return range(8); },
  run() {
    const nodes = [node("a", "a", 18, 25), node("b", "b", 44, 18), node("c", "c", 72, 30), node("d", "d", 30, 70), node("e", "e", 62, 74)];
    const edges = [
      edge("a", "b", "1"), edge("b", "c", "2"), edge("a", "d", "3"), edge("d", "e", "4"), edge("c", "e", "5"), edge("b", "d", "6"), edge("b", "e", "7"),
    ];
    return [
      topicFrame(1, "Start with each vertex in its own disjoint set.", graphVisual("graph", nodes, edges, { sets: ["{a}", "{b}", "{c}", "{d}", "{e}"] }), { components: 5 }),
      topicFrame(5, "Take the lightest edge a-b. It connects two components, so it is safe.", graphVisual("graph", nodes, edges.map((e) => e.from === "a" && e.to === "b" ? { ...e, role: "found" } : e), { sets: ["{a,b}", "{c}", "{d}", "{e}"] }), { edge: "a-b", w: 1 }, "found"),
      topicFrame(5, "Take b-c next. It also crosses between components.", graphVisual("graph", nodes, edges.map((e) => ["a-b", "b-c"].includes(`${e.from}-${e.to}`) ? { ...e, role: "found" } : e), { sets: ["{a,b,c}", "{d}", "{e}"] }), { edge: "b-c", w: 2 }, "found"),
      topicFrame(5, "Take a-d. The growing forest still has no cycle.", graphVisual("graph", nodes, edges.map((e) => ["a-b", "b-c", "a-d"].includes(`${e.from}-${e.to}`) ? { ...e, role: "found" } : e), { sets: ["{a,b,c,d}", "{e}"] }), { edge: "a-d", w: 3 }, "found"),
      topicFrame(5, "Take d-e and stop: V-1 edges connect all vertices.", graphVisual("graph", nodes, edges.map((e) => ["a-b", "b-c", "a-d", "d-e"].includes(`${e.from}-${e.to}`) ? { ...e, role: "found" } : { ...e, role: "eliminated" }), { sets: ["{a,b,c,d,e}"] }), { totalWeight: 10 }, "found"),
    ];
  },
};

const shortestPaths = {
  id: "shortest-paths",
  name: "Shortest Paths",
  description:
    "Relaxation improves distance estimates. Dijkstra chooses the unsettled vertex with minimum estimate when weights are nonnegative.",
  explanation: {
    no: "Korteste-vei-visualiseringen viser Relax og hvorfor Dijkstra kan låse noder når vektene er ikke-negative.",
    en: "The shortest-path visualization shows Relax and why Dijkstra can settle vertices when weights are nonnegative.",
  },
  courseRefs: ["l10"],
  conceptIds: ["relaxation", "dijkstra"],
  learningGoalIds: ["J6", "J7", "J8", "J9", "J10", "J11"],
  viewKind: "graph",
  filename: "graphs/dijkstra.py",
  complexities: { best: "O((V+E) log V)", avg: "O((V+E) log V)", worst: "O((V+E) log V)", space: "O(V)" },
  code:
`def relax(u, v, w):
    if d[v] > d[u] + w(u, v):
        d[v] = d[u] + w(u, v)
        pi[v] = u

def dijkstra(G, s):
    d[s] = 0
    while Q:
        u = extract_min(Q)
        for v in G.adj[u]:
            relax(u, v, w)`,
  defaultData() { return range(8); },
  run() {
    const nodes = [node("s", "s", 12, 45), node("a", "a", 35, 22), node("b", "b", 35, 68), node("c", "c", 62, 24), node("t", "t", 82, 50)];
    const edges = [edge("s", "a", "4"), edge("s", "b", "1"), edge("b", "a", "2"), edge("a", "c", "1"), edge("b", "c", "5"), edge("c", "t", "3"), edge("b", "t", "10")];
    return [
      topicFrame(7, "Initialize d[s]=0 and all other estimates to infinity.", graphVisual("graph", nodes.map((n) => n.id === "s" ? { ...n, role: "found", sublabel: "d=0" } : { ...n, sublabel: "d=∞" }), edges), { source: "s" }),
      topicFrame(2, "Relax outgoing edges from s: d[a]=4 and d[b]=1.", graphVisual("graph", nodes.map((n) => n.id === "a" ? { ...n, role: "pivot", sublabel: "d=4" } : n.id === "b" ? { ...n, role: "pivot", sublabel: "d=1" } : n.id === "s" ? { ...n, role: "found", sublabel: "d=0" } : { ...n, sublabel: "d=∞" }), edges.map((e) => e.from === "s" ? { ...e, role: "pivot" } : e)), { relaxed: "s" }, "pivot"),
      topicFrame(9, "Extract b next because it has the smallest unsettled estimate.", graphVisual("graph", nodes.map((n) => n.id === "b" || n.id === "s" ? { ...n, role: "found", sublabel: n.id === "b" ? "d=1" : "d=0" } : n.id === "a" ? { ...n, sublabel: "d=4" } : { ...n, sublabel: "d=∞" }), edges), { u: "b" }, "found"),
      topicFrame(2, "Relax b-a: d[a] improves from 4 to 3. Relax b-c and b-t too.", graphVisual("graph", nodes.map((n) => n.id === "a" ? { ...n, role: "pivot", sublabel: "d=3" } : n.id === "c" ? { ...n, role: "pivot", sublabel: "d=6" } : n.id === "t" ? { ...n, sublabel: "d=11" } : n.id === "b" || n.id === "s" ? { ...n, role: "found", sublabel: n.id === "b" ? "d=1" : "d=0" } : n), edges.map((e) => e.from === "b" ? { ...e, role: "pivot" } : e)), { update: "a=3" }, "pivot"),
      topicFrame(10, "Settled predecessors form the shortest-path tree.", graphVisual("graph", nodes.map((n) => ({ ...n, role: "found", sublabel: n.id === "s" ? "d=0" : n.id === "b" ? "d=1" : n.id === "a" ? "d=3" : n.id === "c" ? "d=4" : "d=7" })), edges.map((e) => ["s-b", "b-a", "a-c", "c-t"].includes(`${e.from}-${e.to}`) ? { ...e, role: "found" } : { ...e, role: "eliminated" })), { distT: 7 }, "found"),
    ];
  },
};

const floydWarshall = {
  id: "floyd-warshall",
  name: "Floyd-Warshall",
  description:
    "All-pairs shortest paths by dynamic programming over which intermediate vertices are allowed.",
  explanation: {
    no: "Floyd-Warshall viser DP-lag der k betyr at bare de k første nodene kan brukes som mellomliggende.",
    en: "Floyd-Warshall shows DP layers where k means only the first k vertices may be used as intermediates.",
  },
  courseRefs: ["l11"],
  conceptIds: ["apsp", "dynamic-programming"],
  learningGoalIds: ["K1", "K2", "K3", "K4"],
  viewKind: "table",
  filename: "graphs/floyd_warshall.py",
  complexities: { best: "Θ(V³)", avg: "Θ(V³)", worst: "Θ(V³)", space: "Θ(V²)" },
  code:
`def floyd_warshall(W):
    D = W
    for k in range(n):
        for i in range(n):
            for j in range(n):
                D[i,j] = min(D[i,j], D[i,k] + D[k,j])
    return D`,
  defaultData() { return range(8); },
  run() {
    const rows = ["a", "b", "c", "d"];
    const cols = ["a", "b", "c", "d"];
    return [
      topicFrame(2, "Start with direct edge weights. ∞ means no known direct path.", tableVisual(rows, cols, [
        [0, 3, "∞", 7],
        [8, 0, 2, "∞"],
        [5, "∞", 0, 1],
        [2, "∞", "∞", 0],
      ], { active: [0, 3] }), { k: 0 }),
      topicFrame(3, "Let a be an allowed intermediate. Check every i→a→j route.", tableVisual(rows, cols, [
        [0, 3, "∞", 7],
        [8, 0, 2, 15],
        [5, 8, 0, 1],
        [2, 5, "∞", 0],
      ], { rowHighlight: 0, colHighlight: 0, active: [3, 1] }), { k: "a" }, "compare"),
      topicFrame(5, "Let b be allowed too. a→c improves through b: 3 + 2 = 5.", tableVisual(rows, cols, [
        [0, 3, 5, 7],
        [8, 0, 2, 15],
        [5, 8, 0, 1],
        [2, 5, 7, 0],
      ], { rowHighlight: 1, colHighlight: 1, dependency: [[0, 1], [1, 2]], active: [0, 2] }), { update: "a-c=5" }, "pivot"),
      topicFrame(5, "Let c be allowed. b→d improves through c: 2 + 1 = 3.", tableVisual(rows, cols, [
        [0, 3, 5, 6],
        [7, 0, 2, 3],
        [5, 8, 0, 1],
        [2, 5, 7, 0],
      ], { rowHighlight: 2, colHighlight: 2, dependency: [[1, 2], [2, 3]], active: [1, 3] }), { update: "b-d=3" }, "pivot"),
      topicFrame(6, "After all k, every entry is the shortest distance for its pair.", tableVisual(rows, cols, [
        [0, 3, 5, 6],
        [5, 0, 2, 3],
        [3, 6, 0, 1],
        [2, 5, 7, 0],
      ], { active: [2, 0] }), { complete: "APSP" }, "found"),
    ];
  },
};

const maxFlow = {
  id: "max-flow",
  name: "Maximum Flow",
  description:
    "Ford-Fulkerson repeatedly finds an augmenting path in the residual network and pushes as much flow as possible.",
  explanation: {
    no: "Maks-flyt-visualiseringen viser restkapasitet, forøkende sti og hvordan flyt kan økes til snittet blir tett.",
    en: "The max-flow visualization shows residual capacity, augmenting paths, and how flow grows until the cut is tight.",
  },
  courseRefs: ["l12"],
  conceptIds: ["max-flow", "residual-network", "reduction"],
  learningGoalIds: ["L1", "L3", "L5", "L7", "L8", "L9", "L12", "L13"],
  viewKind: "graph",
  filename: "graphs/max_flow.py",
  complexities: { best: "depends", avg: "depends", worst: "O(VE²)", space: "Θ(V+E)" },
  code:
`def ford_fulkerson(G, s, t):
    initialize flow f = 0
    while there is an augmenting path p in residual graph:
        c = residual capacity of p
        augment f along p by c
    return f`,
  defaultData() { return range(8); },
  run() {
    const nodes = [node("s", "s", 12, 45), node("a", "a", 36, 22), node("b", "b", 36, 68), node("c", "c", 62, 45), node("t", "t", 86, 45)];
    const base = [edge("s", "a", "0/10"), edge("s", "b", "0/5"), edge("a", "b", "0/15"), edge("a", "c", "0/10"), edge("b", "c", "0/10"), edge("c", "t", "0/10")];
    return [
      topicFrame(1, "Start with zero flow. Edge labels show flow/capacity.", graphVisual("flow", nodes, base), { value: 0 }),
      topicFrame(2, "Find augmenting path s-a-c-t. Its bottleneck residual capacity is 10.", graphVisual("flow", nodes, base.map((e) => ["s-a", "a-c", "c-t"].includes(`${e.from}-${e.to}`) ? { ...e, role: "pivot" } : e), { path: ["s", "a", "c", "t"] }), { bottleneck: 10 }, "pivot"),
      topicFrame(3, "Push 10 units. Forward residual capacity on c-t is now 0, and backward residual edges exist.", graphVisual("flow", nodes, [edge("s", "a", "10/10", "found"), edge("s", "b", "0/5"), edge("a", "b", "0/15"), edge("a", "c", "10/10", "found"), edge("b", "c", "0/10"), edge("c", "t", "10/10", "found")], { residual: ["a→s:10", "c→a:10", "t→c:10"] }), { value: 10 }, "found"),
      topicFrame(2, "Try another path from s. It reaches b, but c-t has no residual capacity.", graphVisual("flow", nodes.map((n) => n.id === "t" ? { ...n, role: "eliminated" } : n), [edge("s", "a", "10/10", "found"), edge("s", "b", "0/5", "pivot"), edge("a", "b", "0/15"), edge("a", "c", "10/10"), edge("b", "c", "0/10", "pivot"), edge("c", "t", "10/10", "eliminated")], { cut: ["s", "a", "b", "c"] }), { blocked: "c-t" }, "eliminated"),
      topicFrame(4, "No augmenting path remains. The cut capacity equals flow value 10.", graphVisual("flow", nodes.map((n) => n.id === "t" ? { ...n, role: "eliminated" } : { ...n, role: "found" }), [edge("s", "a", "10/10", "found"), edge("s", "b", "0/5", "found"), edge("a", "b", "0/15", "found"), edge("a", "c", "10/10", "found"), edge("b", "c", "0/10", "found"), edge("c", "t", "10/10", "swap")], { minCut: "S={s,a,b,c}, T={t}" }), { maxFlow: 10 }, "found"),
    ];
  },
};

const npReductions = {
  id: "np-reductions",
  name: "NP Reductions",
  description:
    "To show X is hard, transform instances of a known hard problem into instances of X.",
  explanation: {
    no: "NP-reduksjonsvisualiseringen holder retningen tydelig: kjent vanskelig problem inn, problemet du undersøker ut.",
    en: "The NP-reduction visualization keeps the direction clear: known hard problem in, your target problem out.",
  },
  courseRefs: ["l13", "l14"],
  conceptIds: ["np-completeness", "karp-reduction", "reduction"],
  learningGoalIds: ["M6", "M7", "M9", "M10", "N1", "N2", "N6"],
  viewKind: "reduction",
  filename: "complexity/reduction.py",
  complexities: { best: "poly", avg: "poly", worst: "poly", space: "poly" },
  code:
`# To prove X is NP-hard:
known_hard_instance = y
x = transform(y)       # polynomial time
answer_y = oracle_X(x)
return answer_y

# Direction: known hard problem <=p X`,
  defaultData() { return range(8); },
  run() {
    return [
      topicFrame(1, "Pick a known NP-complete problem, such as 3-CNF-SAT.", { type: "reduction", boxes: [
        { id: "known", title: "Known hard", body: "3-CNF-SAT instance", role: "focus" },
        { id: "target", title: "Target X", body: "problem to classify" },
      ], arrows: [] }, { source: "3-CNF-SAT" }),
      topicFrame(3, "Build a polynomial transformation from the known instance to an instance of X.", { type: "reduction", boxes: [
        { id: "known", title: "Known hard", body: "formula φ", role: "focus" },
        { id: "transform", title: "Polynomial transform", body: "f(φ)", role: "pivot" },
        { id: "target", title: "Target X", body: "instance f(φ)" },
      ], arrows: [["known", "transform", "poly"], ["transform", "target", "instance"]] }, { time: "poly" }, "pivot"),
      topicFrame(4, "Show answer preservation: φ is satisfiable iff f(φ) is a yes-instance of X.", { type: "reduction", boxes: [
        { id: "known", title: "3-CNF-SAT", body: "yes/no", role: "focus" },
        { id: "target", title: "X", body: "same yes/no", role: "found" },
      ], arrows: [["known", "target", "iff"]] }, { preserves: "yes/no" }, "found"),
      topicFrame(6, "If X had a polynomial algorithm, this pipeline would solve the known hard problem in polynomial time.", { type: "reduction", boxes: [
        { id: "known", title: "Known hard", body: "would become easy", role: "swap" },
        { id: "target", title: "Algorithm for X", body: "hypothetical poly solver", role: "pivot" },
      ], arrows: [["known", "target", "reduce to"], ["target", "known", "solve indirectly"]] }, { implication: "too good" }, "compare"),
      topicFrame(6, "Therefore X is NP-hard. If X is also in NP, then X is NP-complete.", { type: "reduction", boxes: [
        { id: "hard", title: "NP-hard", body: "all NP reduces to X", role: "found" },
        { id: "inNP", title: "in NP", body: "solutions verifiable", role: "found" },
        { id: "npc", title: "NP-complete", body: "hard + in NP", role: "found" },
      ], arrows: [["hard", "npc", "+"], ["inNP", "npc", "+"]] }, { result: "NPC" }, "found"),
    ];
  },
};

// ============================================================
// Public registry
// ============================================================
const ALL = [
  bubble, insertion, selection, quick, binary,
  mergeSort, recursionTree, countingRadix, heapPQ, bst, dpTable,
  activitySelection, bfsDfs, mst, shortestPaths, floydWarshall, maxFlow,
  npReductions,
];

function labelFor(frame) {
  const h = frame.highlights || {};
  if (h.found && h.found.length) return "found";
  if (h.swap && h.swap.length) return "swap";
  if (h.compare && h.compare.length) return "compare";
  if (h.pivot && h.pivot.length) return "pivot";
  if (h.eliminated && h.eliminated.length) return "eliminated";
  if (h.sorted && h.sorted.length) return "pass";
  return "init";
}

function roleColorVar(label) {
  if (label === "swap") return "var(--role-swap)";
  if (label === "compare") return "var(--role-compare)";
  if (label === "pivot") return "var(--role-pivot)";
  if (label === "found") return "var(--role-found)";
  if (label === "eliminated") return "var(--role-eliminated)";
  if (label === "pass") return "var(--role-sorted)";
  return "var(--ink-3)";
}

window.AlgViz = window.AlgViz || {};
window.AlgViz.ALGORITHMS = ALL;
window.AlgViz.labelFor = labelFor;
window.AlgViz.roleColorVar = roleColorVar;
window.AlgViz.shuffledRange = shuffledRange;
})();
