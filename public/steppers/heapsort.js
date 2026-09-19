/**
 * Heapsort trace for <Stepper>, driving the Python block `heapsort` in modul
 * 05. Build-Max-Heap has its own stepper, so here it is a single frame; the
 * trace is the n - 1 extractions, each a swap, a shrink and a sink. Green
 * cells are outside the heap and finished. The stage is drawn by _haug.js.
 *
 * Line numbers refer to that <CodeBlock>:
 *    1 def heapsort(A, n):
 *    2     build_max_heap(A, n)
 *    3     size = n
 *    4     for i in range(n - 1, 0, -1):
 *    5         A[0], A[i] = A[i], A[0]
 *    6         size = size - 1
 *    7         max_heapify(A, 0, size)
 */
import { drawHeap, shuffled } from "./_haug.js";

function maxHeapify(A, i, size) {
  for (;;) {
    const l = 2 * i + 1;
    const r = 2 * i + 2;
    let m = i;
    if (l < size && A[l] > A[m]) m = l;
    if (r < size && A[r] > A[m]) m = r;
    if (m === i) return;
    [A[i], A[m]] = [A[m], A[i]];
    i = m;
  }
}

export default {
  sizeRange: { min: 5, max: 15, default: 10 },
  defaultData: (size = 10) => shuffled(size),

  run(input) {
    const A = [...input];
    const n = A.length;
    const frames = [];
    let size = n;
    const snap = (line, desc, vars, extra = {}) =>
      frames.push({ line, desc, vars, A: [...A], n, size, ...extra });

    for (let i = (n >> 1) - 1; i >= 0; i--) maxHeapify(A, i, n);
    snap(
      [2, 3],
      `build_max_heap(A, ${n}) gjør hele A til en maks-haug i Θ(n). Det største elementet, ${A[0]}, står i rota A[0], og size = ${n}.`,
      { n, size },
    );

    for (let i = n - 1; i >= 1; i--) {
      [A[0], A[i]] = [A[i], A[0]];
      snap(
        5,
        `i = ${i}: bytt rota A[0] = ${A[i]} med det siste elementet i haugen, A[${i}] = ${A[0]}.`,
        { i, size },
        { swap: [0, i] },
      );
      size -= 1;
      snap(
        6,
        `size = ${size}. ${A[i]} står utenfor haugen og på rett plass, så alt fra og med indeks ${i} er sortert. Rota ${A[0]} kan være for liten.`,
        { i, size },
        { cur: 0 },
      );
      let j = 0;
      for (;;) {
        const l = 2 * j + 1;
        const r = 2 * j + 2;
        let m = j;
        if (l < size && A[l] > A[m]) m = l;
        if (r < size && A[r] > A[m]) m = r;
        const kids = [l, r].filter((k) => k < size);
        if (m === j) {
          const why =
            kids.length === 0
              ? `${A[j]} er en løvnode`
              : kids.length === 2
                ? `${A[j]} er større enn begge barna sine`
                : `${A[j]} er større enn barnet sitt`;
          snap(7, `max_heapify(A, 0, ${size}): ${why}, så haugen er i orden.`, { i, size }, { cur: j, kids });
          break;
        }
        const small = A[j];
        const big = A[m];
        [A[j], A[m]] = [A[m], A[j]];
        snap(
          7,
          `max_heapify(A, 0, ${size}): A[${j}] = ${small} er mindre enn det største barnet A[${m}] = ${big}, så de bytter plass.`,
          { i, size },
          { swap: [j, m], kids },
        );
        j = m;
      }
    }
    size = 0;
    snap(4, `Løkka er ferdig, og A er sortert stigende.`, { size: 0 }, { done: true });
    return frames;
  },

  render(stage, frame, api) {
    drawHeap(stage, frame, api);
  },
};
