/* global window */
// =====================================================================
// Sorting algorithms
// =====================================================================
//   bubble            viewKind "bubble"    adjacent-compare-and-swap
//   insertion         viewKind "insertion" shift the key left into place
//   selection         viewKind "selection" repeatedly extract the minimum
//   quick             viewKind "quick"     Lomuto partition, recursive
//   mergeSort         viewKind "merge"     recursive divide & conquer; the
//                                          merge step animates two half-buffers
//   countingRadix     viewKind "buckets"   (kept for reference)
//   liveCountingRadix viewKind "buckets"   counting / radix sort, catalogue entry
// All but the bucket sorts render on the bar view (js/views/bars.js).
// See js/algorithms/_shared.js for the Frame contract.
(function () {
const A = window.AlgViz.A;
const { mulberry32, shuffledRange, range, fallbackDataForVisual, topicFrame, node, edge, graphVisual, tableVisual, clamp, demoValues, shortList, roleMap, completeTreeNodes, completeTreeEdges, circleNodes, graphEdgeKey, makeIntervalTree, liveTopicFrame, graphFromValues } = window.AlgViz.A;
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
  sizeRange: { min: 4, max: 40, default: 20 },
  defaultData(size = 20) {
    return shuffledRange(size, 7);
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
  sizeRange: { min: 4, max: 40, default: 20 },
  defaultData(size = 20) {
    return shuffledRange(size, 7);
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
  sizeRange: { min: 4, max: 40, default: 20 },
  defaultData(size = 20) {
    return shuffledRange(size, 7);
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
  sizeRange: { min: 4, max: 40, default: 20 },
  defaultData(size = 20) {
    return shuffledRange(size, 11);
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
// Merge Sort — step-by-step trace on the bar view.
//
//  Divide & conquer is shown directly on the bars:
//   - every recursion level currently on the call stack is drawn as a
//     nested bracket above the array (deepest = closest to the bars);
//   - finished sorted runs are tinted green;
//   - a DIVIDE step lights up the left/right halves in two colours;
//   - a MERGE step grows the green "merged" prefix left-to-right out of the
//     two coloured halves while the write head k walks the window.
// ============================================================
const mergeSort = {
  id: "merge-sort",
  name: "Merge Sort",
  description:
    "Merge Sort splits the array in half, recursively sorts each half, then merges the two sorted halves with a linear two-finger pass. Θ(log n) recursion levels × Θ(n) work per level ⇒ Θ(n log n).",
  explanation: {
    no: "Merge Sort-visualiseringen viser splitt-og-hersk rett på søylene: hvert aktivt rekursjonsnivå tegnes som en nøstet klamme over arrayet (dypest nederst), ferdig sorterte delsekvenser tones grønne, et DELE-steg lyser opp venstre/høyre halvdel, og et FLETT-steg lar det grønne «flettede» prefikset vokse fra venstre mens skrivehodet k går gjennom vinduet.",
    en: "The Merge Sort visualization shows divide-and-conquer right on the bars: every active recursion level is a nested bracket above the array (deepest nearest the bars), finished sorted runs are tinted green, a DIVIDE step lights up the left/right halves, and a MERGE step grows the green \"merged\" prefix from the left while the write head k walks the window.",
  },
  courseRefs: ["l03"],
  conceptIds: ["divide-and-conquer", "recurrence"],
  learningGoalIds: ["C1", "C3", "C5", "Z3", "Z4", "Z6"],
  viewKind: "merge",
  filename: "algorithms/merge_sort.py",
  complexities: { best: "Θ(n log n)", avg: "Θ(n log n)", worst: "Θ(n log n)", space: "Θ(n)" },
  code:
`def merge_sort(a: list[int], lo: int, hi: int) -> None:
    if lo >= hi:                        # 0 or 1 elements — already sorted
        return
    mid = (lo + hi) // 2
    merge_sort(a, lo, mid)              # divide: sort left half
    merge_sort(a, mid + 1, hi)         # divide: sort right half
    merge(a, lo, mid, hi)              # conquer: combine the halves

def merge(a: list[int], lo: int, mid: int, hi: int) -> None:
    left, right = a[lo : mid + 1], a[mid + 1 : hi + 1]
    i = j = 0
    for k in range(lo, hi + 1):
        take_left = j == len(right) or (i < len(left) and left[i] <= right[j])
        if take_left:
            a[k] = left[i]; i += 1
        else:
            a[k] = right[j]; j += 1`,
  sizeRange: { min: 4, max: 32, default: 16 },
  defaultData(size = 16) {
    if (size === 16) return [8, 3, 12, 1, 10, 5, 15, 2, 11, 6, 16, 13, 4, 14, 7, 9];
    return shuffledRange(size, 31);
  },
  run(input) {
    const a = input && input.length ? [...input] : [8, 3, 12, 1, 10, 5, 15, 2, 11, 6, 16, 13, 4, 14, 7, 9];
    const n = a.length;
    const frames = [];
    let runs = [];            // sorted-run segments [lo, hi], non-overlapping
    const stack = [];         // active recursion windows {lo, hi, depth}, root → current

    const LINE = { def: 1, base: 2, mid: 4, merge: 7, mergeSlice: 10, takeL: 15, takeR: 17 };

    const idxRange = (lo, hi) => { const o = []; for (let k = lo; k <= hi; k++) o.push(k); return o; };
    const depthStack = () => stack.map((s) => ({ lo: s.lo, hi: s.hi, depth: s.depth }));
    const runWindows = () => runs.map((r) => [r[0], r[1]]);
    const addRun = (lo, hi) => { runs.push([lo, hi]); runs.sort((p, q) => p[0] - q[0]); };
    const dropRunsIn = (lo, hi) => { runs = runs.filter((r) => r[1] < lo || r[0] > hi); };

    function emit({ line, desc, highlights = {}, pointers = {}, windows = {}, variables = {}, merge = null }) {
      frames.push({
        line, desc, data: [...a],
        highlights,
        pointers, variables, merge,
        windows: { depthStack: depthStack(), runs: runWindows(), ...windows },
      });
    }

    function mergeSortRec(lo, hi, depth) {
      if (lo > hi) return;                       // empty slice — no frame
      if (lo === hi) {
        stack.push({ lo, hi, depth });
        addRun(lo, hi);
        emit({
          line: LINE.base,
          desc: `merge_sort([${lo}..${hi}]) — the single element a[${lo}] = ${a[lo]} is trivially sorted. Return.`,
          highlights: { found: [lo] },
          windows: { frame: [lo, hi] },
          variables: { lo, hi },
        });
        stack.pop();
        return;
      }
      const mid = Math.floor((lo + hi) / 2);
      stack.push({ lo, hi, depth });
      emit({
        line: LINE.mid,
        desc: `DIVIDE — merge_sort([${lo}..${hi}]) splits at mid = ${mid}: left half [${lo}..${mid}] (${mid - lo + 1} elem), right half [${mid + 1}..${hi}] (${hi - mid} elem).`,
        windows: { frame: [lo, hi], leftHalf: [lo, mid], rightHalf: [mid + 1, hi] },
        variables: { lo, mid, hi },
        pointers: { lo, mid, hi },
      });
      mergeSortRec(lo, mid, depth + 1);
      mergeSortRec(mid + 1, hi, depth + 1);

      // ---- CONQUER: merge the two sorted halves a[lo..mid] and a[mid+1..hi] ----
      // The two halves are "lifted out" into separate buffers shown below the
      // main array; we then refill a[lo..hi] left-to-right, pulling the smaller
      // current element up from one of the two buffers each step.
      const left = a.slice(lo, mid + 1);
      const right = a.slice(mid + 1, hi + 1);
      dropRunsIn(lo, hi);                        // the two child runs are consumed
      let i = 0, j = 0;
      const mergeObj = (k) => ({ lo, mid, hi, left: [...left], right: [...right], i, j, k });
      emit({
        line: LINE.mergeSlice,
        desc: `MERGE — lift the sorted halves out: left = a[${lo}..${mid}] = [${left.join(", ")}], right = a[${mid + 1}..${hi}] = [${right.join(", ")}]. Refill a[${lo}..${hi}] left-to-right; fingers i = 0, j = 0, write head k = ${lo}.`,
        windows: { frame: [lo, hi] },
        variables: { lo, mid, hi, i, j, k: lo },
        pointers: { k: lo },
        merge: mergeObj(lo),
      });
      for (let p = lo; p <= hi; p++) {
        const takeLeft = j === right.length || (i < left.length && left[i] <= right[j]);
        let why;
        if (takeLeft) {
          why = j === right.length
            ? `right buffer is empty → pull left[${i}] = ${left[i]} up`
            : `left[${i}] = ${left[i]} ≤ right[${j}] = ${right[j]} → pull from left`;
        } else {
          why = i === left.length
            ? `left buffer is empty → pull right[${j}] = ${right[j]} up`
            : `right[${j}] = ${right[j]} < left[${i}] = ${left[i]} → pull from right`;
        }
        const chosen = takeLeft ? left[i] : right[j];
        a[p] = chosen;
        if (takeLeft) i++; else j++;
        emit({
          line: takeLeft ? LINE.takeL : LINE.takeR,
          desc: `${why}: a[${p}] ← ${chosen}.${p < hi ? ` Advance ${takeLeft ? "i" : "j"} and k → ${p + 1}.` : ""}`,
          highlights: { swap: [p] },
          windows: { frame: [lo, hi], merged: [lo, p] },
          variables: { lo, mid, hi, i, j, k: p + 1 },
          pointers: p < hi ? { k: p + 1 } : {},
          merge: mergeObj(p + 1),
        });
      }
      addRun(lo, hi);
      emit({
        line: LINE.merge,
        desc: `merge_sort([${lo}..${hi}]) done — a[${lo}..${hi}] = [${a.slice(lo, hi + 1).join(", ")}] is now one sorted run. Return.`,
        highlights: { found: idxRange(lo, hi) },
        windows: { frame: [lo, hi], merged: [lo, hi] },
        variables: { lo, mid, hi },
      });
      stack.pop();
    }

    emit({
      line: LINE.def,
      desc: `merge_sort(a, 0, ${n - 1}) on a = [${a.join(", ")}]. We split, recurse, then merge — the brackets above the bars track how deep the recursion currently is.`,
      windows: { frame: [0, n - 1] },
      variables: { n, lo: 0, hi: n - 1 },
    });
    mergeSortRec(0, n - 1, 0);
    runs = [[0, n - 1]];
    emit({
      line: LINE.def,
      desc: `Done — the array is sorted. Total work: Θ(log n) levels × Θ(n) per level = Θ(n log n).`,
      highlights: { found: idxRange(0, n - 1) },
      windows: { merged: [0, n - 1] },
    });
    return frames;
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

// ============================================================
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
  sizeRange: { min: 6, max: 24, default: 10 },
  defaultData(size = 10) { return shuffledRange(size, 41); },
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

// (liveHeapPQ removed: superseded by step-traced heapPQ.)

// (liveBST removed: superseded by step-traced bst.)

A.register("bubble", bubble);
A.register("insertion", insertion);
A.register("selection", selection);
A.register("quick", quick);
A.register("mergeSort", mergeSort);
A.register("countingRadix", countingRadix);
A.register("liveCountingRadix", liveCountingRadix);
})();
