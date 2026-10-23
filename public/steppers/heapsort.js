/**
 * Heapsort, for <Stepper>, driving the block `heapsort-kode` in modul 06.
 * The one idea: after Build-Max-Heap the largest element is in A[1]. Swap it
 * with A[i], the last slot of the heap, so it lands right where it belongs
 * in sorted order, shrink the heap by one so it stays there, and let the new
 * root sink with Max-Heapify. Everything outside the heap is larger than
 * everything in it, and sorted: the sorted tail grows from the back.
 *
 * Block line numbers count the header as line 1 (pseudocode line k is block
 * line k + 1):
 *    1 Heapsort(A, n)
 *    2 1  Build-Max-Heap(A, n)
 *    3 2  for i = n downto 2
 *    4 3      exchange A[1] with A[i]
 *    5 4      A.size = A.size - 1
 *    6 5      Max-Heapify(A, 1)
 * The lecture writes A.size for the book's A.heap-size.
 *
 * Frames: the start [1] (the unsorted table drawn as a tree, no A.size yet);
 * Build-Max-Heap as one frame [2] showing the heap it makes; then per i from
 * n down to 2 three frames: the exchange [3, 4] (A[1] and A[i] accent, the
 * old max now in slot i, still in the heap for this frame); A.size = i − 1
 * [5] (slot i turns green in the table, its node green in the tree with a
 * dashed edge to its parent); Max-Heapify(A, 1) as one frame [6] (the way
 * the root element sank is EDGE.path, the element accent at its new place,
 * the desc lists the swaps). Last frame after i = 2 [3]: everything green,
 * «A[1 : n] er sortert». That is 3 + 3(n − 1) frames: 30 for n = 10.
 *
 * The first instance is the lecture's (lecture 5, slides 412–449; CLRS fig.
 * 6.4): A = 4, 1, 3, 2, 16, 9, 10, 14, 8, 7. Build-Max-Heap gives 16, 14,
 * 10, 8, 7, 9, 3, 2, 4, 1. The Max-Heapify calls (the element that sinks,
 * then the keys it swaps with): i = 10: 1 with 14, 8, 4; i = 9: 1 with 10,
 * 9; i = 8: 2 with 9, 3; i = 7: 2 with 8, 7; i = 6: 1 with 7, 4; i = 5: 2
 * with 4; i = 4: 1 with 3; i = 3: 1 with 2; i = 2: 1 stays (a heap of one).
 * The heaps after each call are CLRS fig. 6.4 (b)–(j). End 1, 2, 3, 4, 7,
 * 8, 9, 10, 14, 16. Checked by running this file's run() in
 * node (see the report). Later instances: n distinct keys from 1 … 99 in
 * random order.
 *
 * The drawing (_haugtegning.js): the heap as a tree over the table A, one
 * state, a node and its cell always with the same mark. Accent (`current`) =
 * the two elements the exchange moves, then the root element that sinks;
 * green (`done`) = the sorted tail A[i : n] outside the heap, in the tree
 * with dashed edges; accent edges = the way the root element sank. The tag
 * «i» marks slot i on the exchange and A.size frames; the A.size bracket
 * under the table, accent when A.size shrinks.
 */

import { drawHeap, seg, buildMaxHeap, maxHeapify, distinctKeys, firstView } from "./_haugtegning.js";

/** The lecture's instance (lecture 5; CLRS fig. 6.4). */
const FIRST = [4, 1, 3, 2, 16, 9, 10, 14, 8, 7];

const view = firstView(import.meta.url);
const DASH = "–";

export default {
  sizeRange: { min: 5, max: 15, default: 10 },
  defaultData(size = 10) {
    if (view.isFirst()) return [...FIRST];
    return distinctKeys(size);
  },

  run(input) {
    const A = [...input];
    const n = A.length;
    let size = null;
    const V = { i: DASH };
    const frames = [];
    const doneFrom = (a) => {
      const mk = {};
      for (let t = a; t <= n; t++) mk[t] = "done";
      return mk;
    };
    const snap = (line, desc, o = {}) =>
      frames.push({
        line,
        desc,
        vars: { ...V, "A.size": size === null ? DASH : size },
        heap: {
          A: [...A],
          size,
          tree: n,
          mk: o.mk ?? {},
          path: [...(o.path ?? [])],
          tags: o.tags ?? {},
          sizeNew: !!o.sizeNew,
        },
      });

    snap(
      1,
      `Heapsort(A, ${n}) skal sortere ${seg(1, n)}. Treet viser tabellen som en haug: A[1] i rota, og barna til A[i] er A[2i] og A[2i + 1].`,
    );

    buildMaxHeap(A);
    size = n;
    snap(2, `Build-Max-Heap gjør A til en maks-haug: ${A.join(", ")}. Nå er A.size = ${n}, og det største elementet står i rota.`, {
      sizeNew: true,
    });

    for (let i = n; i >= 2; i--) {
      V.i = i;
      const mx = A[0];
      const lo = A[i - 1];
      [A[0], A[i - 1]] = [A[i - 1], A[0]];
      const place = i === n ? `bakerst, i A[${i}]` : `i A[${i}], rett foran ${A[i]}`;
      snap([3, 4], `Bytt A[1] og A[${i}]: ${mx} er størst i haugen og hører hjemme ${place}. ${lo} kommer i rota.`, {
        mk: { ...doneFrom(i + 1), 1: "current", [i]: "current" },
        tags: { [i]: ["i"] },
      });

      size = i - 1;
      const tail =
        i === n
          ? `A[${i}] = ${mx} er ute av haugen og står der den skal stå i sortert rekkefølge.`
          : `A[${i}] er ute av haugen. ${seg(i, n)} er sortert, og alt der er større enn alt i haugen.`;
      snap(5, `A.size = ${size}: ${tail}`, {
        mk: { ...doneFrom(i), 1: "current" },
        tags: { [i]: ["i"] },
        sizeNew: true,
      });

      const e = A[0];
      const { path, swapped, at } = maxHeapify(A, 1, size);
      let d;
      if (swapped.length) {
        const steps = swapped.map((v, k) => (k ? `så med ${v}` : `med ${v}`));
        const said = steps.length === 1 ? steps[0] : `${steps.slice(0, -1).join(", ")} og ${steps[steps.length - 1]}`;
        d = `Max-Heapify(A, 1) lar ${e} synke: den bytter ${said}.`;
      }
      else if (size === 1) d = `Max-Heapify(A, 1): haugen har bare ett element, så ${e} står allerede riktig.`;
      else if (size === 2) d = `Max-Heapify(A, 1): ${e} er større enn barnet sitt og står allerede riktig.`;
      else d = `Max-Heapify(A, 1): ${e} er større enn begge barna og står allerede riktig.`;
      snap(6, d, { mk: { ...doneFrom(i), [at]: "current" }, path });
    }

    V.i = DASH;
    snap(3, `Løkka er ferdig, og A[1] = ${A[0]} er det minste elementet. ${seg(1, n)} er sortert.`, { mk: doneFrom(1) });

    return frames;
  },

  render(stage, f, api) {
    view.drawn.add(stage);
    drawHeap(stage, f.heap, api);
  },
};
