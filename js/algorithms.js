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

// ============================================================
// BFS + DFS — use the shared traversalGraph from window.AlgViz.graph
// ============================================================

const _GLIB = window.AlgViz.graph;

function traversalGraph() {
  // Adapt the lib's graph shape to the legacy { nodes:[], edges:[[u,v],...], adj }
  // shape used by the bfs/dfs run() blocks below.
  const g = _GLIB.traversalGraph();
  return {
    nodes: g.nodes.map((n) => ({ id: n.id, x: n.x, y: n.y })),
    edges: g.edges.map((e) => [e.u, e.v]),
    adj: g.adj,
  };
}

function edgeKey(u, v) {
  return _GLIB.edgeKey(u, v, false);
}

const bfs = {
  id: "bfs",
  name: "BFS",
  description:
    "Breadth-first search explores vertices in order of distance from the source. A FIFO queue keeps the discovered-but-unfinished frontier; every popped vertex enqueues its undiscovered neighbours.",
  explanation: {
    no: "BFS-visualiseringen viser distansebølger som brer seg ut fra kilden, sammen med FIFO-køen og hvilke kanter som klassifiseres som tre- eller kryss-kanter.",
    en: "The BFS visualization shows distance waves spreading from the source, alongside the FIFO queue and which edges are classified as tree vs. cross.",
  },
  courseRefs: ["l08"],
  conceptIds: ["graph-traversal", "bfs"],
  learningGoalIds: ["H2", "H3", "H7", "H8", "H9"],
  viewKind: "bfs",
  filename: "graphs/bfs.py",
  complexities: { best: "Θ(V+E)", avg: "Θ(V+E)", worst: "Θ(V+E)", space: "Θ(V)" },
  code:
`from collections import deque

def bfs(adj: dict[str, list[str]], source: str) -> dict[str, int]:
    dist: dict[str, int] = {source: 0}
    parent: dict[str, str | None] = {source: None}
    queue: deque[str] = deque([source])
    while queue:
        u = queue.popleft()
        for v in adj[u]:
            if v not in dist:
                dist[v] = dist[u] + 1
                parent[v] = u
                queue.append(v)
    return dist`,
  defaultData() { return range(10); },
  run() {
    const G = traversalGraph();
    const source = "s";
    const dist = { [source]: 0 };
    const parent = { [source]: null };
    const queue = [source];
    const treeEdges = new Set();
    const crossEdges = new Set();
    const frames = [];

    function snapshot({ line, desc, role = "pivot", activeNode = null, activeEdge = null, edgeKind = null, variables = {} }) {
      frames.push({
        line,
        desc,
        data: [],
        viewKind: "bfs",
        highlights: { [role]: [0] },
        pointers: {},
        variables,
        visual: {
          type: "bfs",
          nodes: G.nodes.map((n) => ({
            id: n.id,
            x: n.x,
            y: n.y,
            dist: n.id in dist ? dist[n.id] : null,
            state:
              n.id === activeNode
                ? "active"
                : n.id in dist && !queue.includes(n.id)
                ? "visited"
                : queue.includes(n.id)
                ? "frontier"
                : "undiscovered",
          })),
          edges: G.edges.map(([u, v]) => {
            const k = edgeKey(u, v);
            const isActive =
              activeEdge && edgeKey(activeEdge[0], activeEdge[1]) === k;
            let cls = "default";
            if (treeEdges.has(k)) cls = "tree";
            else if (crossEdges.has(k)) cls = "cross";
            if (isActive) cls = edgeKind || "active";
            return { from: u, to: v, role: cls };
          }),
          source,
          queue: [...queue],
          dist: { ...dist },
          parent: { ...parent },
          activeNode,
          activeEdge,
        },
      });
    }

    snapshot({
      line: 4,
      desc: `Initialise: d[${source}] = 0, queue = [${source}]. Source is the only discovered vertex.`,
      role: "found",
      activeNode: source,
      variables: { source, queue: `[${source}]`, [`d[${source}]`]: 0 },
    });

    while (queue.length) {
      const u = queue.shift();
      snapshot({
        line: 7,
        desc: `Pop u = ${u} from the front of the queue. Distance d[${u}] = ${dist[u]}.`,
        role: "pivot",
        activeNode: u,
        variables: { u, [`d[${u}]`]: dist[u], queue: queue.length ? `[${queue.join(", ")}]` : "[]" },
      });
      for (const v of G.adj[u]) {
        const k = edgeKey(u, v);
        if (!(v in dist)) {
          // Tree edge: discover v
          dist[v] = dist[u] + 1;
          parent[v] = u;
          treeEdges.add(k);
          queue.push(v);
          snapshot({
            line: 12,
            desc: `Edge ${u}–${v}: ${v} is undiscovered. Set d[${v}] = ${dist[v]}, parent[${v}] = ${u}, enqueue ${v}.`,
            role: "found",
            activeNode: u,
            activeEdge: [u, v],
            edgeKind: "tree",
            variables: {
              u, v,
              [`d[${v}]`]: dist[v],
              queue: `[${queue.join(", ")}]`,
            },
          });
        } else {
          // Cross edge — already discovered
          if (!treeEdges.has(k)) crossEdges.add(k);
          snapshot({
            line: 9,
            desc: `Edge ${u}–${v}: ${v} already has d[${v}] = ${dist[v]}. Skip — this edge is not in the BFS tree.`,
            role: "eliminated",
            activeNode: u,
            activeEdge: [u, v],
            edgeKind: "cross",
            variables: { u, v, [`d[${v}]`]: dist[v] },
          });
        }
      }
    }

    snapshot({
      line: 15,
      desc: "Queue empty. Tree edges form the BFS tree; every vertex's distance is its shortest-path length from the source.",
      role: "found",
      variables: { reached: Object.keys(dist).length },
    });
    return frames;
  },
};

const dfs = {
  id: "dfs",
  name: "DFS",
  description:
    "Depth-first search dives along one path until it dead-ends, then backtracks. A LIFO call stack records the path; non-tree edges to ancestors are back edges, revealing cycles.",
  explanation: {
    no: "DFS-visualiseringen viser anropsstakken voksne nedover, oppdagelsestid/ferdigtid på hver node, og klassifiserer kanter som tre- eller tilbake-kanter.",
    en: "The DFS visualization shows the recursion stack growing downward, discovery / finish times on each node, and classifies edges as tree or back edges.",
  },
  courseRefs: ["l08"],
  conceptIds: ["graph-traversal", "dfs"],
  learningGoalIds: ["H2", "H3", "H7", "H8", "H9"],
  viewKind: "dfs",
  filename: "graphs/dfs.py",
  complexities: { best: "Θ(V+E)", avg: "Θ(V+E)", worst: "Θ(V+E)", space: "Θ(V)" },
  code:
`def dfs(adj: dict[str, list[str]], source: str) -> tuple[dict, dict]:
    d: dict[str, int] = {}   # discovery time
    f: dict[str, int] = {}   # finish time
    parent: dict[str, str | None] = {source: None}
    time = 0

    def visit(u: str) -> None:
        nonlocal time
        time += 1
        d[u] = time
        for v in adj[u]:
            if v not in d:
                parent[v] = u
                visit(v)
        time += 1
        f[u] = time

    visit(source)
    return d, f`,
  defaultData() { return range(10); },
  run() {
    const G = traversalGraph();
    const source = "s";
    const d = {};
    const f = {};
    const parent = { [source]: null };
    const stack = []; // each frame: { u, iter }
    const treeEdges = new Set();
    const backEdges = new Set();
    let time = 0;
    const frames = [];

    function pathOnStack() {
      return stack.map((fr) => fr.u);
    }

    function snapshot({ line, desc, role = "pivot", activeEdge = null, edgeKind = null, variables = {} }) {
      const onStack = new Set(pathOnStack());
      const activeNode = stack.length ? stack[stack.length - 1].u : null;
      frames.push({
        line,
        desc,
        data: [],
        viewKind: "dfs",
        highlights: { [role]: [0] },
        pointers: {},
        variables,
        visual: {
          type: "dfs",
          nodes: G.nodes.map((n) => ({
            id: n.id,
            x: n.x,
            y: n.y,
            d: n.id in d ? d[n.id] : null,
            f: n.id in f ? f[n.id] : null,
            state:
              n.id === activeNode
                ? "active"
                : onStack.has(n.id)
                ? "onstack"
                : n.id in f
                ? "finished"
                : n.id in d
                ? "discovered"
                : "undiscovered",
          })),
          edges: G.edges.map(([u, v]) => {
            const k = edgeKey(u, v);
            const isActive =
              activeEdge && edgeKey(activeEdge[0], activeEdge[1]) === k;
            let cls = "default";
            if (treeEdges.has(k)) cls = "tree";
            else if (backEdges.has(k)) cls = "back";
            if (isActive) cls = edgeKind || "active";
            return { from: u, to: v, role: cls };
          }),
          source,
          stack: stack.map((fr) => ({
            u: fr.u,
            d: d[fr.u],
            iter: fr.iter,
            adj: G.adj[fr.u],
          })),
          path: pathOnStack(),
          d: { ...d },
          f: { ...f },
          parent: { ...parent },
          time,
          activeEdge,
        },
      });
    }

    function visit(u) {
      time += 1;
      d[u] = time;
      stack.push({ u, iter: -1 });
      snapshot({
        line: 9,
        desc: `Enter visit(${u}). Set d[${u}] = ${time}; push ${u} onto the recursion stack.`,
        role: "pivot",
        variables: { u, [`d[${u}]`]: d[u], time, "|stack|": stack.length },
      });
      for (let i = 0; i < G.adj[u].length; i++) {
        const v = G.adj[u][i];
        const k = edgeKey(u, v);
        stack[stack.length - 1].iter = i;
        if (!(v in d)) {
          treeEdges.add(k);
          parent[v] = u;
          snapshot({
            line: 11,
            desc: `Edge ${u}→${v}: ${v} is white. Tree edge — recurse.`,
            role: "found",
            activeEdge: [u, v],
            edgeKind: "tree",
            variables: { u, v, "edge": "tree" },
          });
          visit(v);
          snapshot({
            line: 12,
            desc: `Returned from visit(${v}). Continue scanning ${u}'s neighbours.`,
            role: "pivot",
            variables: { u, "back at": u },
          });
        } else if (!(v in f)) {
          // v is on stack → back edge (cycle)
          backEdges.add(k);
          snapshot({
            line: 11,
            desc: `Edge ${u}→${v}: ${v} is on the stack — back edge. Reveals a cycle through the recursion path.`,
            role: "swap",
            activeEdge: [u, v],
            edgeKind: "back",
            variables: { u, v, "edge": "back" },
          });
        } else {
          // Already finished (in undirected DFS this is just the parent edge already accounted for)
          snapshot({
            line: 11,
            desc: `Edge ${u}→${v}: ${v} is already finished — skip (already in the DFS tree).`,
            role: "eliminated",
            activeEdge: [u, v],
            edgeKind: "tree",
            variables: { u, v, "edge": "skip" },
          });
        }
      }
      time += 1;
      f[u] = time;
      stack.pop();
      snapshot({
        line: 14,
        desc: `Finish ${u}. Set f[${u}] = ${time}; pop the stack frame and backtrack.`,
        role: "found",
        variables: { u, [`f[${u}]`]: f[u], time, "|stack|": stack.length },
      });
    }

    visit(source);
    snapshot({
      line: 17,
      desc: "All vertices reachable from the source have been discovered and finished. Tree edges form the DFS tree.",
      role: "found",
      variables: { reached: Object.keys(d).length, time },
    });
    return frames;
  },
};

// ============================================================
// Kruskal's MST — full step-by-step trace using graph-lib
// ============================================================
const mst = {
  id: "mst-kruskal",
  name: "Kruskal's MST",
  description:
    "Kruskal sorts the edges by weight and greedily adds each edge that joins two different components, growing a minimum spanning forest.",
  explanation: {
    no: "Kruskal-visualiseringen viser sorterte kanter, hvilken kant som behandles nå, og hvordan disjoint-set-skogen vokser når kanter slås sammen.",
    en: "The Kruskal visualization shows sorted edges, the edge being considered, and how the disjoint-set forest grows as components merge.",
  },
  courseRefs: ["l09"],
  conceptIds: ["mst", "disjoint-set", "greedy-choice"],
  learningGoalIds: ["I1", "I2", "I3", "I4", "I5", "I6"],
  viewKind: "mst-kruskal",
  filename: "graphs/kruskal.py",
  complexities: { best: "O(E log V)", avg: "O(E log V)", worst: "O(E log V)", space: "O(V)" },
  code:
`Edge = tuple[str, str, int]   # (u, v, weight)

def kruskal(vertices: list[str], edges: list[Edge]) -> list[Edge]:
    parent = {v: v for v in vertices}
    rank   = {v: 0 for v in vertices}

    def find(x: str) -> str:
        while parent[x] != x:
            parent[x] = parent[parent[x]]   # path compression
            x = parent[x]
        return x

    def union(a: str, b: str) -> bool:
        ra, rb = find(a), find(b)
        if ra == rb:
            return False
        if   rank[ra] < rank[rb]: parent[ra] = rb
        elif rank[ra] > rank[rb]: parent[rb] = ra
        else: parent[rb] = ra; rank[ra] += 1
        return True

    tree: list[Edge] = []
    for u, v, w in sorted(edges, key=lambda e: e[2]):
        if union(u, v):
            tree.append((u, v, w))
        if len(tree) == len(vertices) - 1:
            break
    return tree`,
  defaultData() { return range(8); },
  run() {
    const G = _GLIB.spanningGraph();
    const dsu = _GLIB.makeDSU(G.nodes.map((n) => n.id));
    // Stable sort by weight (then by edge label) for deterministic ties
    const sortedEdges = [...G.edges]
      .map((e, i) => ({ ...e, originalIndex: i }))
      .sort((a, b) => a.weight - b.weight || a.u.localeCompare(b.u) || a.v.localeCompare(b.v));
    const accepted = new Set();    // edge keys
    const rejected = new Set();    // edge keys (would form cycle)
    let totalWeight = 0;
    const frames = [];
    const target = G.nodes.length - 1;

    function vertexMap(activeIds = []) {
      const states = {};
      const comps = dsu.components();
      // Tag each vertex with its component index — view uses this to
      // tint vertices by component.
      const compIndex = {};
      comps.forEach((group, ci) => group.forEach((v) => { compIndex[v] = ci; }));
      G.nodes.forEach((n) => {
        states[n.id] = {
          state: activeIds.includes(n.id) ? "active" : "default",
          component: compIndex[n.id],
        };
      });
      return states;
    }

    function edgeMap(activeKey = null, activeRole = "active") {
      const map = {};
      sortedEdges.forEach((e) => {
        const k = _GLIB.edgeKey(e.u, e.v, false);
        let role = "default";
        if (accepted.has(k)) role = "tree";
        else if (rejected.has(k)) role = "reject";
        if (k === activeKey) role = activeRole;
        map[k] = { role, weight: e.weight };
      });
      return map;
    }

    function makeFrame({ line, desc, role, activeEdge = null, activeRole = "active", activeIds = [], variables = {}, currentIndex = -1 }) {
      const k = activeEdge ? _GLIB.edgeKey(activeEdge.u, activeEdge.v, false) : null;
      frames.push(
        _GLIB.frame({
          kind: "mst-kruskal",
          line,
          desc,
          role,
          graph: G,
          vertices: vertexMap(activeIds),
          edges: edgeMap(k, activeRole),
          containers: {
            sortedEdges: sortedEdges.map((e, i) => {
              const key = _GLIB.edgeKey(e.u, e.v, false);
              let status = "pending";
              if (accepted.has(key)) status = "accepted";
              else if (rejected.has(key)) status = "rejected";
              if (i === currentIndex) status = status === "pending" ? "active" : status;
              return { u: e.u, v: e.v, weight: e.weight, key, status, index: i };
            }),
            dsu: dsu.snapshot(),
            mst: {
              chosen: [...accepted],
              totalWeight,
              target,
              progress: accepted.size,
            },
          },
          active: { edge: activeEdge ? { u: activeEdge.u, v: activeEdge.v } : null },
          variables,
        })
      );
    }

    makeFrame({
      line: 12,
      desc: "Initialise: every vertex is its own component. Sort the edge list by weight.",
      role: "pivot",
      variables: { components: G.nodes.length, edges: sortedEdges.length },
    });

    for (let i = 0; i < sortedEdges.length; i++) {
      const e = sortedEdges[i];
      const ru = dsu.find(e.u);
      const rv = dsu.find(e.v);
      if (ru !== rv) {
        // Pre-merge: highlight the candidate
        makeFrame({
          line: 22,
          desc: `Edge ${e.u}–${e.v} (w = ${e.weight}): find(${e.u}) = ${ru}, find(${e.v}) = ${rv} — different components, accept.`,
          role: "found",
          activeEdge: e,
          activeRole: "active",
          activeIds: [e.u, e.v],
          variables: { edge: `${e.u}–${e.v}`, weight: e.weight, accepted: accepted.size, rejected: rejected.size },
          currentIndex: i,
        });
        dsu.union(e.u, e.v);
        const k = _GLIB.edgeKey(e.u, e.v, false);
        accepted.add(k);
        totalWeight += e.weight;
        // Post-merge: show union effect
        makeFrame({
          line: 23,
          desc: `Union ${ru} and ${rv}. The MST now has ${accepted.size} of ${target} edges, total weight ${totalWeight}.`,
          role: "found",
          activeEdge: e,
          activeRole: "tree",
          activeIds: [e.u, e.v],
          variables: { edge: `${e.u}–${e.v}`, total: totalWeight, accepted: accepted.size, target },
          currentIndex: i,
        });
        if (accepted.size === target) {
          makeFrame({
            line: 24,
            desc: `${target} edges chosen — every vertex is connected. Total weight of the MST is ${totalWeight}. Stop.`,
            role: "found",
            variables: { totalWeight, edges: target },
            currentIndex: i,
          });
          break;
        }
      } else {
        const k = _GLIB.edgeKey(e.u, e.v, false);
        rejected.add(k);
        makeFrame({
          line: 22,
          desc: `Edge ${e.u}–${e.v} (w = ${e.weight}): find(${e.u}) = find(${e.v}) = ${ru} — same component, reject (would form a cycle).`,
          role: "eliminated",
          activeEdge: e,
          activeRole: "reject",
          activeIds: [e.u, e.v],
          variables: { edge: `${e.u}–${e.v}`, weight: e.weight, accepted: accepted.size, rejected: rejected.size },
          currentIndex: i,
        });
      }
    }
    return frames;
  },
};

// ============================================================
// Dijkstra's shortest paths — full step-by-step trace using graph-lib
// ============================================================
const shortestPaths = {
  id: "dijkstra",
  name: "Dijkstra",
  description:
    "Dijkstra repeatedly extracts the unsettled vertex with the smallest tentative distance, then relaxes each outgoing edge. With non-negative weights, the first time a vertex is extracted its distance is final.",
  explanation: {
    no: "Dijkstra-visualiseringen viser min-prioritetskøen, hvilken node som låses, og hvordan hver kant strammes (relax) for å oppdatere avstandsestimater.",
    en: "The Dijkstra visualization shows the min-priority queue, which vertex gets settled, and how each edge is relaxed to tighten distance estimates.",
  },
  courseRefs: ["l10"],
  conceptIds: ["relaxation", "dijkstra"],
  learningGoalIds: ["J6", "J7", "J8", "J9", "J10", "J11"],
  viewKind: "dijkstra",
  filename: "graphs/dijkstra.py",
  complexities: { best: "O((V+E) log V)", avg: "O((V+E) log V)", worst: "O((V+E) log V)", space: "O(V)" },
  code:
`import heapq

def dijkstra(adj: dict[str, list[tuple[str, int]]], source: str):
    dist:   dict[str, float]    = {v: float("inf") for v in adj}
    parent: dict[str, str|None] = {v: None for v in adj}
    dist[source] = 0
    pq: list[tuple[float, str]] = [(0, source)]

    while pq:
        du, u = heapq.heappop(pq)
        if du > dist[u]:        # outdated entry
            continue
        for v, w in adj[u]:
            tentative = du + w
            if tentative < dist[v]:
                dist[v]   = tentative
                parent[v] = u
                heapq.heappush(pq, (tentative, v))
    return dist, parent`,
  defaultData() { return range(7); },
  run() {
    const G = _GLIB.weightedDirectedGraph();
    const adjW = {};   // u -> [{v, w}]
    G.nodes.forEach((n) => { adjW[n.id] = []; });
    G.edges.forEach((e) => { adjW[e.u].push({ v: e.v, w: e.weight }); });
    Object.values(adjW).forEach((list) => list.sort((a, b) => a.v.localeCompare(b.v)));

    const source = "s";
    const dist = {};
    const parent = {};
    G.nodes.forEach((n) => { dist[n.id] = Infinity; parent[n.id] = null; });
    dist[source] = 0;
    const settled = new Set();
    const pq = _GLIB.makeMinPQ((x) => x.d);
    pq.push({ d: 0, v: source });

    const treeEdges = new Set();   // (parent → v) edges in the SP tree
    const relaxedEdges = new Set(); // every edge ever examined
    const frames = [];

    function vertexMap(activeId = null) {
      const states = {};
      G.nodes.forEach((n) => {
        let state = "undiscovered";
        if (n.id === activeId) state = "active";
        else if (settled.has(n.id)) state = "settled";
        else if (dist[n.id] !== Infinity) state = "frontier";
        states[n.id] = { state, dist: dist[n.id], parent: parent[n.id] };
      });
      return states;
    }

    function edgeMap(activeKey = null, activeRole = "active") {
      const map = {};
      G.edges.forEach((e) => {
        const k = _GLIB.edgeKey(e.u, e.v, true);
        let role = "default";
        if (treeEdges.has(k)) role = "tree";
        else if (relaxedEdges.has(k)) role = "examined";
        if (k === activeKey) role = activeRole;
        map[k] = { role, weight: e.weight };
      });
      return map;
    }

    function pqSnapshot() {
      // For pedagogy show the heap sorted by d, with the top item flagged.
      return pq.sortedSnapshot().map((x, i) => ({ d: x.d, v: x.v, isTop: i === 0 }));
    }

    function distSnapshot() {
      return G.nodes.map((n) => ({
        v: n.id,
        d: dist[n.id],
        parent: parent[n.id],
        settled: settled.has(n.id),
      }));
    }

    function makeFrame({ line, desc, role, activeId = null, activeKey = null, activeRole = "active", variables = {} }) {
      frames.push(
        _GLIB.frame({
          kind: "dijkstra",
          line,
          desc,
          role,
          graph: G,
          vertices: vertexMap(activeId),
          edges: edgeMap(activeKey, activeRole),
          containers: {
            pq: pqSnapshot(),
            dist: distSnapshot(),
            source,
          },
          active: { node: activeId, edge: activeKey },
          variables,
        })
      );
    }

    makeFrame({
      line: 6,
      desc: `Initialise: d[${source}] = 0, all others ∞. Push (0, ${source}) onto the min-priority queue.`,
      role: "pivot",
      activeId: source,
      variables: { source, "|PQ|": pq.size() },
    });

    while (pq.size() > 0) {
      const top = pq.pop();
      const { d: du, v: u } = top;
      if (du > dist[u]) {
        // Outdated entry — skip.
        makeFrame({
          line: 11,
          desc: `Pop (${du}, ${u}). But d[${u}] = ${dist[u]} is smaller — this is a stale entry, skip.`,
          role: "eliminated",
          activeId: u,
          variables: { popped: `(${du}, ${u})`, "d[u]": dist[u] },
        });
        continue;
      }
      settled.add(u);
      makeFrame({
        line: 9,
        desc: `Extract-min → ${u} (d = ${du}). Settle ${u}; its distance is now final.`,
        role: "found",
        activeId: u,
        variables: { u, "d[u]": dist[u], settled: settled.size, "|PQ|": pq.size() },
      });

      for (const { v, w } of adjW[u]) {
        const tentative = du + w;
        const k = _GLIB.edgeKey(u, v, true);
        relaxedEdges.add(k);
        if (tentative < dist[v]) {
          const oldD = dist[v];
          // Drop the previous tree edge (if any) — we found a better predecessor.
          if (parent[v] != null) {
            treeEdges.delete(_GLIB.edgeKey(parent[v], v, true));
          }
          dist[v] = tentative;
          parent[v] = u;
          treeEdges.add(k);
          pq.push({ d: tentative, v });
          makeFrame({
            line: 14,
            desc: `Relax ${u}→${v}: ${du} + ${w} = ${tentative} < ${oldD === Infinity ? "∞" : oldD}. Update d[${v}] = ${tentative}, parent[${v}] = ${u}, push (${tentative}, ${v}).`,
            role: "pivot",
            activeId: u,
            activeKey: k,
            activeRole: "tree",
            variables: { u, v, w, "old d[v]": oldD === Infinity ? "∞" : oldD, "new d[v]": tentative },
          });
        } else {
          makeFrame({
            line: 13,
            desc: `Examine ${u}→${v}: ${du} + ${w} = ${tentative} ≥ d[${v}] = ${dist[v] === Infinity ? "∞" : dist[v]}. No improvement.`,
            role: "eliminated",
            activeId: u,
            activeKey: k,
            activeRole: "examined",
            variables: { u, v, w, "d[v]": dist[v] === Infinity ? "∞" : dist[v] },
          });
        }
      }
    }

    makeFrame({
      line: 17,
      desc: "Priority queue empty. Every reachable vertex is settled; tree edges form the shortest-path tree rooted at the source.",
      role: "found",
      variables: { settled: settled.size, source },
    });
    return frames;
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

// ============================================================
// Edmonds-Karp Maximum Flow — full step-by-step trace using graph-lib
// ============================================================
const maxFlow = {
  id: "max-flow",
  name: "Max Flow",
  description:
    "Edmonds-Karp (BFS-based Ford-Fulkerson) repeatedly finds a shortest augmenting path in the residual network and pushes its bottleneck capacity along it. The algorithm halts when s and t are disconnected in the residual graph; the final flow value equals the min-cut capacity.",
  explanation: {
    no: "Maks-flyt-visualiseringen viser flyt/kapasitet på hver kant, restnettverket, BFS som finner forøkende sti, og hvordan minste-snittet låses når ingen sti finnes.",
    en: "The max-flow visualization shows flow/capacity per edge, the residual network, the BFS that finds augmenting paths, and how the min-cut crystallises when no path remains.",
  },
  courseRefs: ["l12"],
  conceptIds: ["max-flow", "residual-network", "reduction"],
  learningGoalIds: ["L1", "L3", "L5", "L7", "L8", "L9", "L12", "L13"],
  viewKind: "max-flow",
  filename: "graphs/edmonds_karp.py",
  complexities: { best: "O(VE²)", avg: "O(VE²)", worst: "O(VE²)", space: "Θ(V+E)" },
  code:
`from collections import deque

Edge = tuple[str, str, int]   # (u, v, capacity)

def edmonds_karp(vertices: list[str], edges: list[Edge],
                 source: str, sink: str) -> int:
    cap = {v: {} for v in vertices}
    for u, v, c in edges:
        cap[u][v] = cap[u].get(v, 0) + c
        cap[v].setdefault(u, 0)             # back-edge slot

    flow = 0
    while True:                              # one iteration per augmentation
        parent = {source: source}
        q = deque([source])
        while q and sink not in parent:
            u = q.popleft()
            for v, c in cap[u].items():
                if v not in parent and c > 0:
                    parent[v] = u
                    q.append(v)
        if sink not in parent:               # no augmenting path → done
            return flow

        # Bottleneck capacity along the path
        push = float("inf")
        v = sink
        while v != source:
            u = parent[v]
            push = min(push, cap[u][v])
            v = u

        v = sink                              # apply the push
        while v != source:
            u = parent[v]
            cap[u][v] -= push
            cap[v][u] += push
            v = u
        flow += push`,
  defaultData() { return range(6); },
  run() {
    const G = _GLIB.flowNetwork();
    const source = "s";
    const sink = "t";
    // Residual capacities: cap[u][v]
    const cap = {};
    G.nodes.forEach((n) => { cap[n.id] = {}; });
    G.edges.forEach((e) => {
      cap[e.u][e.v] = (cap[e.u][e.v] || 0) + e.capacity;
      if (cap[e.v][e.u] === undefined) cap[e.v][e.u] = 0;
    });
    // Track flow on each ORIGINAL edge for display
    const flowOn = {};   // key "u->v" → current flow
    G.edges.forEach((e) => { flowOn[`${e.u}->${e.v}`] = 0; });
    const originalCap = {};
    G.edges.forEach((e) => { originalCap[`${e.u}->${e.v}`] = e.capacity; });

    let totalFlow = 0;
    const frames = [];

    function vertexMap(activeId = null, visitedSet = new Set(), pathSet = new Set()) {
      const states = {};
      G.nodes.forEach((n) => {
        let state = "default";
        if (n.id === activeId) state = "active";
        else if (pathSet.has(n.id)) state = "frontier";
        else if (visitedSet.has(n.id)) state = "visited";
        if (n.id === source) state = "source";
        if (n.id === sink) state = "sink";
        states[n.id] = { state };
      });
      return states;
    }

    function edgeMap(pathEdges = new Set()) {
      const map = {};
      G.edges.forEach((e) => {
        const k = _GLIB.edgeKey(e.u, e.v, true);
        const f = flowOn[`${e.u}->${e.v}`];
        const c = e.capacity;
        let role = "default";
        if (pathEdges.has(`${e.u}->${e.v}`)) role = "augmenting";
        else if (f === c) role = "saturated";
        else if (f > 0) role = "tree";
        map[k] = { role, label: `${f}/${c}`, flow: f, capacity: c };
      });
      return map;
    }

    function residualSnapshot() {
      // List of (u,v,residual) where residual > 0, useful for the side panel.
      const out = [];
      Object.keys(cap).forEach((u) => {
        Object.keys(cap[u]).forEach((v) => {
          const r = cap[u][v];
          if (r > 0) out.push({ u, v, residual: r, isBack: !originalCap[`${u}->${v}`] });
        });
      });
      out.sort((x, y) => x.u.localeCompare(y.u) || x.v.localeCompare(y.v));
      return out;
    }

    function makeFrame({ line, desc, role, activeId = null, visitedSet = new Set(), pathSet = new Set(), pathEdges = new Set(), variables = {} }) {
      frames.push(
        _GLIB.frame({
          kind: "max-flow",
          line,
          desc,
          role,
          graph: G,
          vertices: vertexMap(activeId, visitedSet, pathSet),
          edges: edgeMap(pathEdges),
          containers: {
            flow: {
              value: totalFlow,
              source,
              sink,
              edges: G.edges.map((e) => ({
                u: e.u, v: e.v, flow: flowOn[`${e.u}->${e.v}`], capacity: e.capacity,
              })),
            },
            residual: residualSnapshot(),
          },
          active: { node: activeId },
          variables,
        })
      );
    }

    makeFrame({
      line: 9,
      desc: `Initialise residual capacities. Total flow value f = 0. Source = ${source}, sink = ${sink}.`,
      role: "pivot",
      variables: { source, sink, "value(f)": 0 },
    });

    let iteration = 0;
    while (true) {
      iteration++;
      // BFS in residual graph
      const parent = { [source]: source };
      const queue = [source];
      const visited = new Set([source]);
      makeFrame({
        line: 14,
        desc: `Iteration ${iteration}: search the residual network from ${source} (BFS) for an augmenting path.`,
        role: "pivot",
        activeId: source,
        visitedSet: visited,
        variables: { iteration, "value(f)": totalFlow },
      });
      while (queue.length && !(sink in parent)) {
        const u = queue.shift();
        for (const v of Object.keys(cap[u]).sort()) {
          if (!(v in parent) && cap[u][v] > 0) {
            parent[v] = u;
            queue.push(v);
            visited.add(v);
          }
        }
      }
      if (!(sink in parent)) {
        // No augmenting path — we're done; show the min-cut.
        const reachable = new Set(Object.keys(parent));
        makeFrame({
          line: 21,
          desc: `No augmenting path from ${source} to ${sink} in the residual graph. The reachable set S = {${[...reachable].sort().join(", ")}} defines the min-cut. Max flow value = ${totalFlow}.`,
          role: "found",
          visitedSet: reachable,
          variables: { "max flow": totalFlow, "S": [...reachable].sort().join(","), "T": G.nodes.map(n=>n.id).filter(id=>!reachable.has(id)).sort().join(",") },
        });
        return frames;
      }

      // Reconstruct path
      const pathNodes = [];
      const pathEdges = new Set();
      let v = sink;
      while (v !== source) {
        pathNodes.unshift(v);
        const u = parent[v];
        pathEdges.add(`${u}->${v}`);
        v = u;
      }
      pathNodes.unshift(source);

      // Bottleneck
      let push = Infinity;
      for (let i = 0; i < pathNodes.length - 1; i++) {
        const a = pathNodes[i], b = pathNodes[i + 1];
        push = Math.min(push, cap[a][b]);
      }

      makeFrame({
        line: 26,
        desc: `Augmenting path found: ${pathNodes.join(" → ")}. Bottleneck residual capacity = ${push}.`,
        role: "found",
        visitedSet: visited,
        pathSet: new Set(pathNodes),
        pathEdges,
        variables: { path: pathNodes.join("→"), bottleneck: push },
      });

      // Apply the push
      for (let i = 0; i < pathNodes.length - 1; i++) {
        const a = pathNodes[i], b = pathNodes[i + 1];
        cap[a][b] -= push;
        cap[b][a] += push;
        // If the edge a→b is an original edge, increase flow; if instead b→a is
        // the original (we're cancelling flow), decrease its flow.
        if (originalCap[`${a}->${b}`] !== undefined) {
          flowOn[`${a}->${b}`] += push;
        } else {
          flowOn[`${b}->${a}`] -= push;
        }
      }
      totalFlow += push;
      makeFrame({
        line: 33,
        desc: `Push ${push} along the path. Update residuals (forward −${push}, backward +${push}). Total flow value rises to ${totalFlow}.`,
        role: "found",
        visitedSet: visited,
        pathSet: new Set(pathNodes),
        pathEdges,
        variables: { pushed: push, "value(f)": totalFlow },
      });
    }
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
// Data-driven course visualizers
// ============================================================
function clamp(value, lo, hi) {
  return Math.max(lo, Math.min(hi, value));
}

function demoValues(input, max = 12, min = 4) {
  const source = Array.isArray(input) && input.length ? input : shuffledRange(min, 19);
  const n = clamp(source.length, min, max);
  return source.slice(0, n).map((value, idx) =>
    Number.isFinite(value) ? Math.max(1, Math.round(value)) : idx + 1
  );
}

function shortList(values, limit = 8) {
  const shown = values.slice(0, limit).join(" ");
  return values.length > limit ? `${shown} ...` : shown;
}

function roleMap(ids, role) {
  const map = {};
  ids.forEach((id) => { map[id] = role; });
  return map;
}

function completeTreeNodes(values, roles = {}) {
  const levels = Math.max(1, Math.floor(Math.log2(values.length)) + 1);
  return values.map((value, idx) => {
    const level = Math.floor(Math.log2(idx + 1));
    const first = 2 ** level - 1;
    const pos = idx - first;
    const slots = 2 ** level;
    const x = ((pos + 1) * 100) / (slots + 1);
    const y = 10 + level * (88 / Math.max(1, levels - 1));
    return node(String(idx), String(value), x, y, roles[idx] || "default", `a[${idx}]`);
  });
}

function completeTreeEdges(count, roles = {}) {
  const edges = [];
  for (let i = 1; i < count; i++) {
    const parent = Math.floor((i - 1) / 2);
    edges.push(edge(String(parent), String(i), "", roles[i] || "default"));
  }
  return edges;
}

function circleNodes(count, roles = {}, sublabels = {}, labels = null) {
  const r = count <= 5 ? 32 : 36;
  return Array.from({ length: count }, (_, i) => {
    const angle = -Math.PI / 2 + (2 * Math.PI * i) / count;
    return node(
      `v${i}`,
      labels?.[i] || (i === 0 ? "s" : String.fromCharCode(96 + i)),
      50 + Math.cos(angle) * r,
      52 + Math.sin(angle) * r,
      roles[`v${i}`] || "default",
      sublabels[`v${i}`] || ""
    );
  });
}

function graphEdgeKey(e) {
  return `${e.from}-${e.to}`;
}

function makeIntervalTree(values) {
  const nodes = [];
  const edges = [];
  function visit(lo, hi, depth, maxDepth, parent = null) {
    const id = `${lo}-${hi}`;
    const mid = (lo + hi) / 2;
    nodes.push(node(id, `A[${lo}..${hi}]`, 8 + (mid / Math.max(1, values.length - 1)) * 84, 10 + depth * 26, "default", shortList(values.slice(lo, hi + 1), 5)));
    if (parent) edges.push(edge(parent, id, depth === 1 ? "split" : ""));
    if (lo < hi && depth < maxDepth) {
      const m = Math.floor((lo + hi) / 2);
      visit(lo, m, depth + 1, maxDepth, id);
      visit(m + 1, hi, depth + 1, maxDepth, id);
    }
  }
  visit(0, values.length - 1, 0, Math.min(3, Math.ceil(Math.log2(values.length))));
  return { nodes, edges };
}

function liveTopicFrame(line, desc, visual, variables = {}, role = "pivot") {
  return {
    ...topicFrame(line, desc, visual, variables, role),
    note: desc,
  };
}

const liveMergeSort = {
  ...mergeSort,
  code:
`def merge(left: list[int], right: list[int]) -> list[int]:
    out: list[int] = []
    i = j = 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            out.append(left[i])
            i += 1
        else:
            out.append(right[j])
            j += 1
    return out + left[i:] + right[j:]

def merge_sort(a: list[int]) -> list[int]:
    if len(a) <= 1:
        return a.copy()
    mid = len(a) // 2
    left = merge_sort(a[:mid])
    right = merge_sort(a[mid:])
    return merge(left, right)`,
  defaultData() { return shuffledRange(8, 31); },
  run(input) {
    const values = demoValues(input, 8, 4);
    const sorted = [...values].sort((a, b) => a - b);
    const tree = makeIntervalTree(values);
    const rootId = `0-${values.length - 1}`;
    const firstSplitIds = tree.nodes.filter((n) => n.id !== rootId && n.id.split("-").some(Boolean)).slice(0, 2).map((n) => n.id);
    const dimmed = tree.nodes.map((n) => n.id === rootId ? { ...n, role: "focus" } : { ...n, role: "eliminated" });
    return [
      liveTopicFrame(13, "Start with the current shuffled input. The full split tree is shown dimmed so the first frame is not a placeholder.", graphVisual("tree", dimmed, tree.edges.map((e) => ({ ...e, role: "eliminated" })), { array: values }), { n: values.length, shown: `${values.length}/${input.length}` }),
      liveTopicFrame(16, "Split into left and right halves, then recurse on each half.", graphVisual("tree", tree.nodes.map((n) => firstSplitIds.includes(n.id) || n.id === rootId ? { ...n, role: "pivot" } : { ...n, role: "eliminated" }), tree.edges), { mid: Math.floor(values.length / 2) }),
      liveTopicFrame(16, "Continue splitting until every visible leaf is a base case.", graphVisual("tree", tree.nodes.map((n) => n.id.includes("-") && n.id.split("-")[0] === n.id.split("-")[1] ? { ...n, role: "found" } : n), tree.edges), { depth: Math.ceil(Math.log2(values.length)) }, "found"),
      liveTopicFrame(17, "Merge calls rebuild sorted runs while returning from recursion.", graphVisual("tree", tree.nodes.map((n) => ({ ...n, role: "sorted" })), tree.edges.map((e) => ({ ...e, role: "sorted" })), { array: sorted }), { result: `[${sorted.join(", ")}]` }, "sorted"),
    ];
  },
};

const liveRecursionTree = {
  ...recursionTree,
  code:
`def level_costs(n: int, branches: int = 2) -> list[int]:
    costs: list[int] = []
    size = n
    width = 1
    while size >= 1:
        costs.append(width * size)
        size //= branches
        width *= branches
    return costs`,
  defaultData() { return shuffledRange(8, 37); },
  run(input) {
    const n = Math.max(4, input.length || 8);
    const branches = 2 + ((input[0] || n) % 3);
    const childCount = branches;
    const root = node("n", `n=${n}`, 50, 10, "focus", `first=${input[0] || n}`);
    const children = Array.from({ length: childCount }, (_, i) =>
      node(`c${i}`, `n/${branches}`, 24 + i * (52 / Math.max(1, childCount - 1)), 42, "compare", `cost ${Math.floor(n / branches)}`)
    );
    const leaves = Array.from({ length: childCount }, (_, i) =>
      node(`l${i}`, "...", 24 + i * (52 / Math.max(1, childCount - 1)), 76, "sorted", "base cases")
    );
    const edges = [...children.map((c) => edge("n", c.id)), ...children.map((c, i) => edge(c.id, leaves[i].id))];
    return [
      liveTopicFrame(1, `Use the current size n=${n}. The first shuffled value selects a ${branches}-way recurrence for this demo.`, graphVisual("tree", [root, ...children.map((c) => ({ ...c, role: "eliminated" })), ...leaves.map((l) => ({ ...l, role: "eliminated" }))], edges.map((e) => ({ ...e, role: "eliminated" })), { levelCosts: [`${n}`] }), { n, branches }),
      liveTopicFrame(4, `Expand into ${branches} subproblems. The total work on this level is still about n.`, graphVisual("tree", [root, ...children], children.map((c) => edge("n", c.id)), { levelCosts: [`${n}`, `${branches} * ${Math.floor(n / branches)} ≈ ${n}`] }), { level: 1 }, "compare"),
      liveTopicFrame(6, "Keep expanding until the subproblem size reaches 1.", graphVisual("tree", [root, ...children, ...leaves], edges, { levelCosts: [`${n}`, `≈ ${n}`, "..."] }), { height: `log_${branches} n` }, "sorted"),
      liveTopicFrame(7, "The total is level cost times number of levels.", graphVisual("tree", [root, ...children, ...leaves].map((x) => ({ ...x, role: "found" })), edges.map((e) => ({ ...e, role: "found" })), { levelCosts: [`Θ(${n} log ${n})`] }), { total: `Theta(n log_${branches} n)` }, "found"),
    ];
  },
};

const liveCountingRadix = {
  ...countingRadix,
  code:
`def counting_sort_by_digit(a: list[int], exp: int) -> list[int]:
    count = [0] * 10
    out = [0] * len(a)
    for x in a:
        count[(x // exp) % 10] += 1
    for i in range(1, 10):
        count[i] += count[i - 1]
    for x in reversed(a):
        d = (x // exp) % 10
        out[count[d] - 1] = x
        count[d] -= 1
    return out

def radix_sort(a: list[int]) -> list[int]:
    out = a.copy()
    exp = 1
    while max(out, default=0) // exp > 0:
        out = counting_sort_by_digit(out, exp)
        exp *= 10
    return out`,
  defaultData() { return shuffledRange(10, 41); },
  run(input) {
    const values = demoValues(input, 12, 4).map((v, i) => 10 + ((v * 7 + i * 3) % 90));
    const bucketBy = (arr, exp) => arr.reduce((acc, x) => {
      const d = Math.floor(x / exp) % 10;
      acc[d] = [...(acc[d] || []), x];
      return acc;
    }, {});
    const onesBuckets = bucketBy(values, 1);
    const byOnes = Object.keys(onesBuckets).sort((a, b) => a - b).flatMap((k) => onesBuckets[k]);
    const tensBuckets = bucketBy(byOnes, 10);
    const sorted = Object.keys(tensBuckets).sort((a, b) => a - b).flatMap((k) => tensBuckets[k]);
    return [
      liveTopicFrame(19, "Convert the current input into two-digit keys, preserving shuffled order.", { type: "buckets", array: values, buckets: {}, active: "input order" }, { n: values.length }),
      liveTopicFrame(4, "Count by ones digit.", { type: "buckets", array: values, buckets: onesBuckets, active: "ones digit" }, { exp: 1 }, "compare"),
      liveTopicFrame(10, "Stable output by ones digit. Equal digits keep their previous order.", { type: "buckets", array: byOnes, buckets: { output: byOnes }, active: "stable output" }, { stable: "yes" }, "sorted"),
      liveTopicFrame(4, "Repeat counting sort by tens digit.", { type: "buckets", array: byOnes, buckets: tensBuckets, active: "tens digit" }, { exp: 10 }, "compare"),
      liveTopicFrame(20, "After the final digit pass the keys are sorted.", { type: "buckets", array: sorted, buckets: { sorted }, active: "done" }, { result: `[${sorted.join(", ")}]` }, "found"),
    ];
  },
};

const liveHeapPQ = {
  ...heapPQ,
  code:
`def max_heapify(a: list[int], i: int, heap_size: int) -> None:
    left = 2 * i + 1
    right = 2 * i + 2
    largest = i
    if left < heap_size and a[left] > a[largest]:
        largest = left
    if right < heap_size and a[right] > a[largest]:
        largest = right
    if largest != i:
        a[i], a[largest] = a[largest], a[i]
        max_heapify(a, largest, heap_size)

def build_max_heap(a: list[int]) -> None:
    for i in range(len(a) // 2 - 1, -1, -1):
        max_heapify(a, i, len(a))`,
  defaultData() { return shuffledRange(10, 43); },
  run(input) {
    const original = demoValues(input, 15, 4);
    const heap = [...original];
    const frames = [
      liveTopicFrame(14, "Read the current array as a complete binary tree.", graphVisual("tree", completeTreeNodes(heap), completeTreeEdges(heap.length), { array: heap }), { heapSize: heap.length }),
    ];
    const heapify = (i, size, collect = false) => {
      while (true) {
        const l = 2 * i + 1;
        const r = 2 * i + 2;
        let largest = i;
        if (l < size && heap[l] > heap[largest]) largest = l;
        if (r < size && heap[r] > heap[largest]) largest = r;
        if (collect) {
          frames.push(liveTopicFrame(5, `Compare index ${i} with children ${l < size ? l : "-"} and ${r < size ? r : "-"}.`, graphVisual("tree", completeTreeNodes(heap, roleMap([i, l, r].filter((x) => x < size), "compare")), completeTreeEdges(heap.length), { array: heap }), { i, largest }, "compare"));
        }
        if (largest === i) break;
        [heap[i], heap[largest]] = [heap[largest], heap[i]];
        if (collect) {
          frames.push(liveTopicFrame(10, `Swap with the larger child at index ${largest}.`, graphVisual("tree", completeTreeNodes(heap, roleMap([i, largest], "swap")), completeTreeEdges(heap.length), { array: heap }), { i, largest }, "swap"));
        }
        i = largest;
      }
    };
    for (let i = Math.floor(heap.length / 2) - 1; i >= 0; i--) heapify(i, heap.length);
    frames.push(liveTopicFrame(15, "After build_max_heap, every parent dominates its children.", graphVisual("tree", completeTreeNodes(heap, roleMap(range(heap.length), "sorted")), completeTreeEdges(heap.length), { array: heap }), { max: heap[0] }, "sorted"));
    if (heap.length > 1) {
      [heap[0], heap[heap.length - 1]] = [heap[heap.length - 1], heap[0]];
      frames.push(liveTopicFrame(10, "Extract max by swapping the root with the last heap element.", graphVisual("tree", completeTreeNodes(heap, { 0: "swap", [heap.length - 1]: "found" }), completeTreeEdges(heap.length), { array: heap }), { extracted: heap[heap.length - 1] }, "swap"));
      heapify(0, heap.length - 1, true);
      frames.push(liveTopicFrame(11, "Heapify restores the heap property on the remaining heap.", graphVisual("tree", completeTreeNodes(heap, roleMap(range(heap.length - 1), "sorted")), completeTreeEdges(heap.length), { array: heap }), { heapSize: heap.length - 1 }, "found"));
    }
    return frames;
  },
};

const liveBST = {
  ...bst,
  code:
`class Node:
    def __init__(self, key: int) -> None:
        self.key = key
        self.left: Node | None = None
        self.right: Node | None = None

def insert(root: Node | None, key: int) -> Node:
    if root is None:
        return Node(key)
    if key < root.key:
        root.left = insert(root.left, key)
    elif key > root.key:
        root.right = insert(root.right, key)
    return root

def tree_search(root: Node | None, key: int) -> Node | None:
    if root is None or root.key == key:
        return root
    if key < root.key:
        return tree_search(root.left, key)
    return tree_search(root.right, key)`,
  defaultData() { return shuffledRange(10, 47); },
  run(input) {
    const values = [...new Set(demoValues(input, 15, 4))];
    const tree = { key: values[0], left: null, right: null, id: "0" };
    let nextId = 1;
    function insertNode(root, key) {
      if (key < root.key) {
        if (root.left) insertNode(root.left, key);
        else root.left = { key, left: null, right: null, id: String(nextId++) };
      } else if (key > root.key) {
        if (root.right) insertNode(root.right, key);
        else root.right = { key, left: null, right: null, id: String(nextId++) };
      }
    }
    values.slice(1).forEach((v) => insertNode(tree, v));
    const ordered = [];
    function inorder(t, depth = 0, parent = null, edges = []) {
      if (!t) return edges;
      inorder(t.left, depth + 1, t.id, edges);
      ordered.push({ ...t, depth, parent });
      inorder(t.right, depth + 1, t.id, edges);
      return edges;
    }
    inorder(tree);
    const maxDepth = Math.max(...ordered.map((x) => x.depth), 1);
    const pos = {};
    ordered.forEach((item, i) => { pos[item.id] = { x: 8 + (i * 84) / Math.max(1, ordered.length - 1), y: 10 + (item.depth * 88) / maxDepth }; });
    const makeVisual = (roles = {}) => {
      const nodes = ordered.map((item) => node(item.id, String(item.key), pos[item.id].x, pos[item.id].y, roles[item.id] || "default"));
      const edges = ordered.filter((item) => item.parent).map((item) => edge(item.parent, item.id, item.key < ordered.find((x) => x.id === item.parent).key ? "<" : ">"));
      return graphVisual("tree", nodes, edges, { array: values });
    };
    const key = values[values.length - 1];
    const frames = [liveTopicFrame(1, `Build a BST from the shuffled insertion order, then search for ${key}.`, makeVisual({ [tree.id]: "focus" }), { key, root: tree.key })];
    let cur = tree;
    while (cur) {
      frames.push(liveTopicFrame(cur.key === key ? 18 : key < cur.key ? 20 : 21, `Compare ${key} with ${cur.key}.`, makeVisual({ [cur.id]: cur.key === key ? "found" : "pivot" }), { key, x: cur.key }, cur.key === key ? "found" : "pivot"));
      if (cur.key === key) break;
      cur = key < cur.key ? cur.left : cur.right;
    }
    return frames;
  },
};

const liveDPTable = {
  ...dpTable,
  code:
`def knapsack(values: list[int], weights: list[int], capacity: int) -> int:
    n = len(values)
    table = [[0] * (capacity + 1) for _ in range(n + 1)]
    for i in range(1, n + 1):
        for w in range(capacity + 1):
            table[i][w] = table[i - 1][w]
            if weights[i - 1] <= w:
                take = table[i - 1][w - weights[i - 1]] + values[i - 1]
                table[i][w] = max(table[i][w], take)
    return table[n][capacity]`,
  defaultData() { return shuffledRange(8, 53); },
  run(input) {
    const raw = demoValues(input, 18, 6);
    const itemCount = clamp(Math.floor(raw.length / 2), 3, 6);
    const weights = raw.slice(0, itemCount).map((v) => (v % 5) + 1);
    const values = raw.slice(itemCount, itemCount * 2).map((v) => (v % 9) + 1);
    while (values.length < itemCount) values.push((raw[values.length] % 9) + 1);
    const capacity = clamp(Math.ceil(raw.length / 2), 5, 10);
    const table = Array.from({ length: itemCount + 1 }, () => Array(capacity + 1).fill(0));
    const snapshots = [];
    for (let i = 1; i <= itemCount; i++) {
      for (let w = 0; w <= capacity; w++) {
        table[i][w] = table[i - 1][w];
        if (weights[i - 1] <= w) {
          table[i][w] = Math.max(table[i][w], table[i - 1][w - weights[i - 1]] + values[i - 1]);
        }
      }
      snapshots.push(table.map((row) => [...row]));
    }
    const rows = ["0", ...values.map((value, i) => `i${i + 1} w${weights[i]} v${value}`)];
    const cols = range(capacity + 1).map(String);
    const blank = table.map((row, i) => row.map((v) => i === 0 ? v : ""));
    return [
      liveTopicFrame(3, "Create a table from the current item weights, values, and capacity.", tableVisual(rows, cols, blank, { active: [0, 0] }), { items: itemCount, capacity, weights: `[${weights.join(", ")}]`, values: `[${values.join(", ")}]` }),
      liveTopicFrame(5, "The base row is zero because no items give no value.", tableVisual(rows, cols, blank, { rowHighlight: 0 }), { i: 0 }, "sorted"),
      liveTopicFrame(8, "Fill the first item row using the take-or-skip recurrence.", tableVisual(rows, cols, snapshots[0], { rowHighlight: 1, active: [1, Math.min(capacity, weights[0])] }), { item: 1, w: weights[0], v: values[0] }, "compare"),
      liveTopicFrame(9, "Later rows combine a skip cell and a take cell from the previous row.", tableVisual(rows, cols, snapshots[Math.min(1, snapshots.length - 1)], { rowHighlight: Math.min(2, itemCount), active: [Math.min(2, itemCount), capacity], dependency: [[Math.min(1, itemCount - 1), capacity], [Math.min(1, itemCount - 1), Math.max(0, capacity - weights[Math.min(1, itemCount - 1)])]] }), { skip: "prev row", take: "prev row minus weight" }, "pivot"),
      liveTopicFrame(11, "The final bottom-right cell is the optimum for this shuffled instance.", tableVisual(rows, cols, snapshots[snapshots.length - 1], { active: [itemCount, capacity] }), { optimum: table[itemCount][capacity] }, "found"),
    ];
  },
};

const liveActivitySelection = {
  ...activitySelection,
  code:
`Activity = tuple[int, int]

def activity_selection(activities: list[Activity]) -> list[Activity]:
    ordered = sorted(activities, key=lambda x: x[1])
    chosen: list[Activity] = []
    last_finish = -1
    for start, finish in ordered:
        if start >= last_finish:
            chosen.append((start, finish))
            last_finish = finish
    return chosen`,
  defaultData() { return shuffledRange(9, 59); },
  run(input) {
    const values = demoValues(input, 10, 5);
    const activities = values.map((v, i) => {
      const start = (v + i * 2) % 12;
      const end = start + 1 + (v % 4);
      return { id: `a${i + 1}`, label: `a${i + 1}`, start, end };
    }).sort((a, b) => a.end - b.end || a.start - b.start);
    const selected = [];
    const rejected = [];
    let lastFinish = -1;
    const frames = [liveTopicFrame(4, "Sort the generated intervals by finish time.", { type: "timeline", activities, selected: [], rejected: [], active: activities[0]?.id, range: [0, Math.max(...activities.map((a) => a.end), 10)] }, { n: activities.length })];
    activities.forEach((a) => {
      if (a.start >= lastFinish) {
        selected.push(a.id);
        lastFinish = a.end;
        frames.push(liveTopicFrame(7, `Choose ${a.label}; it starts after the previous finish time.`, { type: "timeline", activities, selected: [...selected], rejected: [...rejected], active: a.id, range: [0, Math.max(...activities.map((x) => x.end), 10)] }, { lastFinish }, "found"));
      } else {
        rejected.push(a.id);
        frames.push(liveTopicFrame(6, `Reject ${a.label}; it overlaps the last chosen activity.`, { type: "timeline", activities, selected: [...selected], rejected: [...rejected], active: a.id, range: [0, Math.max(...activities.map((x) => x.end), 10)] }, { overlap: "yes" }, "eliminated"));
      }
    });
    return frames;
  },
};

function graphFromValues(input, maxNodes = 8) {
  const values = demoValues(input, maxNodes, 4);
  const n = values.length;
  const edges = [];
  for (let i = 0; i < n - 1; i++) {
    edges.push({ u: i, v: i + 1, w: 1 + (values[i] % 9) });
  }
  for (let i = 0; i < n - 2; i++) {
    if ((values[i] + i) % 2 === 0) edges.push({ u: i, v: i + 2, w: 1 + ((values[i] + values[i + 1]) % 9) });
  }
  return { values, n, edges };
}

// (BFS / DFS are now top-level interactive algorithms with their own
//  specialized views — see `bfs` and `dfs` declarations above. No "live"
//  wrapper is needed since the trace is generated step-by-step from a
//  fixed pedagogical graph.)

// (liveMST and liveShortestPaths removed: superseded by step-traced mst & shortestPaths.)

const liveFloydWarshall = {
  ...floydWarshall,
  code:
`def floyd_warshall(weight: list[list[float]]) -> list[list[float]]:
    n = len(weight)
    dist = [row.copy() for row in weight]
    for k in range(n):
        for i in range(n):
            for j in range(n):
                dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j])
    return dist`,
  defaultData() { return shuffledRange(6, 73); },
  run(input) {
    const values = demoValues(input, 6, 4);
    const n = values.length;
    const inf = 999;
    const dist = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => i === j ? 0 : (((values[i] + values[j] + i) % 3 === 0) ? inf : 1 + ((values[i] + values[j]) % 9))));
    const rows = range(n).map((i) => String.fromCharCode(97 + i));
    const fmt = (m) => m.map((row) => row.map((v) => v >= inf ? "∞" : v));
    const frames = [liveTopicFrame(3, "Build the weight matrix from the current shuffled input.", tableVisual(rows, rows, fmt(dist), { active: [0, Math.min(1, n - 1)] }), { vertices: n })];
    for (let k = 0; k < Math.min(n, 3); k++) {
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) dist[i][j] = Math.min(dist[i][j], dist[i][k] + dist[k][j]);
      }
      frames.push(liveTopicFrame(6, `Allow ${rows[k]} as an intermediate vertex.`, tableVisual(rows, rows, fmt(dist), { rowHighlight: k, colHighlight: k, active: [0, Math.min(n - 1, k + 1)] }), { k: rows[k] }, "compare"));
    }
    for (let k = Math.min(n, 3); k < n; k++) {
      for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) dist[i][j] = Math.min(dist[i][j], dist[i][k] + dist[k][j]);
    }
    frames.push(liveTopicFrame(7, "After every k, the matrix contains all-pairs shortest path distances.", tableVisual(rows, rows, fmt(dist), { active: [n - 1, 0] }), { complete: "APSP" }, "found"));
    return frames;
  },
};

// (liveMaxFlow removed: superseded by step-traced maxFlow.)

const liveNPReductions = {
  ...npReductions,
  code:
`def subset_sum_to_knapsack(nums: list[int], target: int) -> tuple[list[int], list[int], int, int]:
    weights = nums.copy()
    values = nums.copy()
    capacity = target
    required_value = target
    return weights, values, capacity, required_value

def answer_preserved(nums: list[int], target: int, chosen: list[int]) -> bool:
    subset_yes = sum(chosen) == target
    weights, values, capacity, required_value = subset_sum_to_knapsack(nums, target)
    knapsack_yes = sum(chosen) <= capacity and sum(chosen) >= required_value
    return subset_yes == knapsack_yes`,
  defaultData() { return shuffledRange(8, 83); },
  run(input) {
    const nums = demoValues(input, 8, 4).map((v) => 1 + (v % 12));
    const target = Math.max(3, Math.floor(nums.reduce((a, b) => a + b, 0) / 2));
    const instance = `[${nums.join(", ")}], target=${target}`;
    return [
      liveTopicFrame(1, "Start with a concrete Subset Sum instance generated from the current input.", { type: "reduction", boxes: [
        { id: "known", title: "Subset Sum", body: instance, role: "focus" },
        { id: "target", title: "Knapsack decision", body: "not built yet" },
      ], arrows: [] }, { n: nums.length, target }),
      liveTopicFrame(2, "Map every number to both a weight and a value.", { type: "reduction", boxes: [
        { id: "known", title: "Subset Sum", body: instance, role: "focus" },
        { id: "transform", title: "Polynomial transform", body: "weights=nums, values=nums", role: "pivot" },
        { id: "target", title: "Knapsack", body: `capacity=${target}, required=${target}` },
      ], arrows: [["known", "transform", "O(n)"], ["transform", "target", "instance"]] }, { time: "O(n)" }, "pivot"),
      liveTopicFrame(9, "A chosen subset sums to target exactly when the constructed knapsack reaches required value within capacity.", { type: "reduction", boxes: [
        { id: "known", title: "Subset Sum yes", body: `sum(chosen) = ${target}`, role: "found" },
        { id: "target", title: "Knapsack yes", body: `weight <= ${target}, value >= ${target}`, role: "found" },
      ], arrows: [["known", "target", "iff"]] }, { preserves: "yes/no" }, "found"),
    ];
  },
};

// ============================================================
// Public registry
// ============================================================
const ALL = [
  bubble, insertion, selection, quick, binary,
  liveMergeSort, liveRecursionTree, liveCountingRadix, liveHeapPQ, liveBST,
  liveDPTable, liveActivitySelection, bfs, dfs, mst, shortestPaths,
  liveFloydWarshall, maxFlow, liveNPReductions,
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
