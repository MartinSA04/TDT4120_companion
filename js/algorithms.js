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
// Public registry
// ============================================================
const ALL = [bubble, insertion, selection, quick, binary];

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
