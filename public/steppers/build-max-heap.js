/**
 * Build-Max-Heap trace for <Stepper>, driving the Python block
 * `build-max-heap` in modul 05. The stage (drawn by _haug.js) shows A as a
 * tree and as cells; dashed nodes are the ones Build-Max-Heap has not reached
 * yet, so the reader sees the heaps grow upward from the leaves.
 *
 * Line numbers refer to that <CodeBlock>:
 *    1 def max_heapify(A, i, size):
 *    2     l, r = 2 * i + 1, 2 * i + 2
 *    3     m = i
 *    4     if l < size and A[l] > A[m]:
 *    5         m = l
 *    6     if r < size and A[r] > A[m]:
 *    7         m = r
 *    8     if m != i:
 *    9         A[i], A[m] = A[m], A[i]
 *   10         max_heapify(A, m, size)
 *   11
 *   12 def build_max_heap(A, n):
 *   13     for i in range(n // 2 - 1, -1, -1):
 *   14         max_heapify(A, i, n)
 */
import { drawHeap, shuffled } from "./_haug.js";

export default {
  sizeRange: { min: 5, max: 15, default: 10 },
  defaultData: (size = 10) => shuffled(size),

  run(input) {
    const A = [...input];
    const n = A.length;
    const frames = [];
    let okFrom = n >> 1;
    const snap = (line, desc, vars, extra = {}) =>
      frames.push({ line, desc, vars, A: [...A], n, size: n, okFrom, ...extra });

    const first = (n >> 1) - 1;
    snap(
      [12, 13],
      `build_max_heap(A, ${n}): A tegnet som tre. Løvnodene, indeks ${n >> 1} til ${n - 1}, er hauger alene, så løkka starter på i = ${first} og går bakover mot rota.`,
      { n },
    );

    for (let i0 = first; i0 >= 0; i0--) {
      let i = i0;
      for (;;) {
        const l = 2 * i + 1;
        const r = 2 * i + 2;
        let m = i;
        if (l < n && A[l] > A[m]) m = l;
        if (r < n && A[r] > A[m]) m = r;
        const kids = [l, r].filter((k) => k < n);
        const kidText =
          kids.length === 2 ? `barna A[${l}] = ${A[l]} og A[${r}] = ${A[r]}` : `barnet A[${l}] = ${A[l]}`;
        const head = i === i0 ? `max_heapify(A, ${i0}): ` : `Rekursivt, max_heapify(A, ${i}): `;
        snap(
          [4, 6],
          `${head}A[${i}] = ${A[i]} sammenlignes med ${kidText}. Størst er A[${m}] = ${A[m]}.`,
          { i, l, r, m },
          { cur: i, kids, big: m },
        );
        if (m === i) {
          okFrom = i0;
          snap(
            8,
            `A[${i}] = ${A[i]} er størst, så ${i === i0 ? "ingenting gjøres" : "synkingen stopper"}. Deltreet med rot ${i0} er en maks-haug.`,
            { i, m },
            { cur: i },
          );
          break;
        }
        const small = A[i];
        [A[i], A[m]] = [A[m], A[i]];
        snap(
          9,
          `Bytt A[${i}] og A[${m}]. ${A[i]} står nå over begge barna, men ${small} kan være mindre enn sine nye barn.`,
          { i, m },
          { swap: [i, m] },
        );
        i = m;
        if (2 * i + 1 >= n) {
          okFrom = i0;
          snap(
            10,
            `max_heapify(A, ${i}): ${A[i]} er en løvnode og kan ikke synke lenger. Deltreet med rot ${i0} er en maks-haug.`,
            { i },
            { cur: i },
          );
          break;
        }
      }
    }
    okFrom = 0;
    snap(
      14,
      `Alle indre noder er behandlet. A er en maks-haug: hver node er større enn eller lik barna sine, og ${A[0]} står i rota.`,
      { n },
      { done: true },
    );
    return frames;
  },

  render(stage, frame, api) {
    drawHeap(stage, frame, api);
  },
};
