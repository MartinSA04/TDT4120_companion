/**
 * Max-Heap-Insert with Max-Heap-Increase-Key, for <Stepper>, driving the
 * block `max-heap-insert-kode` in modul 06. The one idea: the new element
 * goes in the first free slot, which keeps the shape, and then rises: while
 * it is larger than its parent, they swap. Max-Heap-Insert does it by giving
 * x the key −∞ (which can sit anywhere without breaking the heap property)
 * and asking Max-Heap-Increase-Key to raise the key to the real one;
 * Increase-Key is the same rise, used when a key grows. At most ⌊lg n⌋
 * swaps.
 *
 * Block line numbers count the header as line 1. Max-Heap-Insert's line k is
 * block line k + 1; block line 9 is empty; Max-Heap-Increase-Key's header is
 * block line 10 and its line k is block line k + 10:
 *    1 Max-Heap-Insert(A, x, n)
 *    2 1  if A.size == n
 *    3 2      error "heap overflow"
 *    4 3  A.size = A.size + 1
 *    5 4  k = x.key
 *    6 5  x.key = -∞
 *    7 6  A[A.size] = x
 *    8 7  Max-Heap-Increase-Key(A, x, k)
 *    9
 *   10 Max-Heap-Increase-Key(A, x, key)
 *   11 1  if key < x.key
 *   12 2      error "new key is smaller"
 *   13 3  x.key = key
 *   14 4  find index i of x
 *   15 5  while i > 1 and A[Parent(i)].key < A[i].key
 *   16 6      exchange A[i] with A[Parent(i)]
 *   17 7      i = Parent(i)
 * n is the table's capacity; A.size the heap's size (the book's heap-size).
 *
 * Frames: the start [1]; A.size == n? [2] (usant); A.size = A.size + 1 [4];
 * k = x.key [5]; x.key = −∞ [6]; A[A.size] = x [7] (x moves from the corner
 * into the tree and the table); the call [8]; key < x.key? [11] (usant);
 * x.key = key [13]; i = the index of x [14] (tag «i»). Per loop round: the
 * test [15] (the parent indigo) and, while the parent is smaller, the
 * exchange and i = Parent(i) [16, 17] in one frame (the way x rose is
 * EDGE.path). The last frame is the test that stops the loop [15]: the
 * parent is larger, or i = 1. With s swaps that is 11 + 2s frames
 * (s ≤ ⌊lg(A.size)⌋).
 *
 * The first instance is the lecture's (lecture 5, slides 377–383): heap
 * 16, 14, 10, 8, 7, 9, 3, 2 (A.size = 8) in a table with capacity n = 10,
 * x.key = 15. x goes to A[9] (the child of A[4] = 8), swaps with 8, then with
 * 14 (A[2]), then stops under 16. Result 16, 15, 10, 14, 7, 9, 3, 2, 8 with
 * A[10] still empty; s = 2, 15 frames. Checked by running this file's run()
 * in node (see the report). Later instances: a heap of `size` distinct keys
 * from 1 … 99 made with Build-Max-Heap, capacity size + 2, and a new key from
 * 1 … 99 not in the heap.
 *
 * The drawing (_haugtegning.js): the heap as a tree over the table A, one
 * state, a node and its cell always with the same mark. The table has n
 * cells; the empty ones are dashed `slot` cells, and the slot x will fill is
 * also a dashed circle in the tree. Until line 6 x stands as a separate
 * accent node top right with the tag «x», its key 15, then −∞ (U+2212). In
 * the tree x keeps the tag «x» until i is set, then «i». Accent = x;
 * indigo ring = the parent x is compared with; accent edges = the way x
 * rose; the A.size bracket under the table, accent when A.size grows.
 */

import { drawHeap, seg, levels, buildMaxHeap, distinctKeys, firstView } from "./_haugtegning.js";

/** The lecture's instance (lecture 5, slides 377–383). */
const FIRST = { heap: [16, 14, 10, 8, 7, 9, 3, 2], key: 15, n: 10 };

const NEG = "−∞";
const view = firstView(import.meta.url);
const DASH = "–";

export default {
  sizeRange: { min: 4, max: 14, default: 8 },
  defaultData(size = 8) {
    if (view.isFirst()) return { heap: [...FIRST.heap], key: FIRST.key, n: FIRST.n };
    const keys = distinctKeys(size + 1);
    const key = keys.pop();
    return { heap: buildMaxHeap(keys), key, n: size + 2 };
  },

  run(input) {
    const key = input.key;
    const n = input.n;
    const A = [...input.heap, ...new Array(Math.max(0, n - input.heap.length)).fill(null)];
    let size = input.heap.length;
    const slot = size + 1; // the first free slot, where x goes
    const V = { k: DASH, key: DASH, i: DASH };
    let xnode = { key: String(key) };
    const frames = [];
    const snap = (line, desc, o = {}) =>
      frames.push({
        line,
        desc,
        vars: { ...V, "A.size": size },
        heap: {
          A: [...A],
          size,
          tree: Math.min(slot, n),
          mk: o.mk ?? {},
          path: [...(o.path ?? [])],
          tags: o.tags ?? {},
          xnode: xnode ? { ...xnode } : null,
          sizeNew: !!o.sizeNew,
        },
      });

    snap(
      1,
      `Max-Heap-Insert(A, x, ${n}) setter inn x med nøkkel ${key} i haugen ${seg(1, size)}. Tabellen har plass til n = ${n} elementer.`,
    );

    if (size === n) {
      snap(2, `A.size = ${size} = n: tabellen er full.`);
      snap(3, `error "heap overflow": det er ikke plass til x.`);
      return frames;
    }
    snap(2, `A.size = ${size} og n = ${n}, så A.size == n er usant: det er plass til x.`);

    size += 1;
    snap(4, `A.size = ${size}: A[${size}], den første ledige plassen, blir med i haugen. Da beholder treet formen sin.`, {
      sizeNew: true,
    });

    V.k = key;
    snap(5, `k = x.key = ${key} tar vare på nøkkelen til x.`);

    xnode.key = NEG;
    snap(6, `x.key = −∞. En nøkkel som er mindre enn alle andre, kan stå hvor som helst i haugen uten å bryte haugegenskapen.`);

    A[size - 1] = NEG;
    xnode = null;
    const p0 = size >> 1;
    const where = size === 1 ? "i rota" : `bakerst i haugen, som barn av A[${p0}] = ${A[p0 - 1]}`;
    snap(7, `A[${size}] = x: x står nå ${where}. Med nøkkelen −∞ holder haugegenskapen fortsatt.`, {
      mk: { [size]: "current" },
      tags: { [size]: ["x"] },
    });

    V.key = key;
    snap(8, `Max-Heap-Increase-Key(A, x, ${key}) skal heve nøkkelen til x fra −∞ til ${key}.`, {
      mk: { [size]: "current" },
      tags: { [size]: ["x"] },
    });

    snap(11, `${key} < −∞ er usant, så den nye nøkkelen er ikke mindre enn den gamle.`, {
      mk: { [size]: "current" },
      tags: { [size]: ["x"] },
    });

    A[size - 1] = key;
    snap(
      13,
      `x.key = ${key}. Nå kan x være større enn forelderen sin, og bare der kan haugegenskapen være brutt.`,
      { mk: { [size]: "current" }, tags: { [size]: ["x"] } },
    );

    let i = size;
    V.i = i;
    snap(14, `x står i A[${i}], så i = ${i}.`, { mk: { [i]: "current" }, tags: { [i]: ["i"] } });

    const path = [];
    for (;;) {
      const s = path.length;
      if (i === 1) {
        const rose = s ? ` ${key} steg ${levels(s)}, og` : "";
        snap(15, `i = 1: x står i rota, og løkka stopper.${rose} ${seg(1, size)} er en maks-haug igjen.`, {
          mk: { 1: "current" },
          tags: { 1: ["i"] },
          path,
        });
        break;
      }
      const p = i >> 1;
      const pv = A[p - 1];
      const mk = { [i]: "current", [p]: "compared" };
      if (!(pv < key)) {
        const rose = s ? `${key} steg ${levels(s)}, og ` : "";
        snap(
          15,
          `Parent(${i}) = ${p}. A[${p}] = ${pv} < A[${i}] = ${key} er usant, så løkka stopper. ${rose}${seg(1, size)} er en maks-haug igjen.`,
          { mk, tags: { [i]: ["i"] }, path },
        );
        break;
      }
      snap(15, `Parent(${i}) = ${p}. A[${p}] = ${pv} < A[${i}] = ${key} er sant, så x skal stige.`, {
        mk,
        tags: { [i]: ["i"] },
        path,
      });
      [A[i - 1], A[p - 1]] = [A[p - 1], A[i - 1]];
      path.push(i);
      const sib = i % 2 === 0 ? i + 1 : i - 1;
      const sibTxt = sib <= size ? ` ${A[sib - 1]} var mindre enn ${pv}, så den er også mindre enn ${key}.` : "";
      const was = i;
      i = p;
      V.i = i;
      snap([16, 17], `Bytt A[${was}] og A[${p}], og i = ${p}: ${key} stiger ett nivå, og ${pv} flytter ned under den.${sibTxt}`, {
        mk: { [p]: "current" },
        tags: { [p]: ["i"] },
        path,
      });
    }

    return frames;
  },

  render(stage, f, api) {
    view.drawn.add(stage);
    drawHeap(stage, f.heap, api);
  },
};
