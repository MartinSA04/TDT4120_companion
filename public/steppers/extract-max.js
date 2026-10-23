/**
 * Max-Heap-Extract-Max with Max-Heapify, for <Stepper>, driving the block
 * `extract-max-kode` in modul 06. The one idea: the largest element is always
 * A[1]. To take it out and keep the shape, the last element moves up into the
 * root and the heap shrinks by one. That element is probably too small for
 * the root, so it sinks: compare it with both children, swap with the larger
 * child if that child is larger, and repeat one level down. It swaps with
 * the larger child so that the new parent is ≥ both children. At most
 * ⌊lg n⌋ swaps.
 *
 * Block line numbers count the header as line 1. Max-Heap-Extract-Max's line
 * k is block line k + 1; block line 7 is empty; Max-Heapify's header is block
 * line 8 and its line k is block line k + 8:
 *    1 Max-Heap-Extract-Max(A)
 *    2 1  max = Max-Heap-Maximum(A)
 *    3 2  A[1] = A[A.size]
 *    4 3  A.size = A.size - 1
 *    5 4  Max-Heapify(A, 1)
 *    6 5  return max
 *    7
 *    8 Max-Heapify(A, i)
 *    9 1  l = Left(i)
 *   10 2  r = Right(i)
 *   11 3  if l ≤ A.size and A[l] > A[i]
 *   12 4      m = l
 *   13 5  else m = i
 *   14 6  if r ≤ A.size and A[r] > A[m]
 *   15 7      m = r
 *   16 8  if m ≠ i
 *   17 9      exchange A[i] with A[m]
 *   18 10     Max-Heapify(A, m)
 * The lecture writes A.size for the book's A.heap-size and m for largest.
 *
 * Frames: the start [1]; max = A[1] [2] (the «max = 16» label top left
 * stays to the end); A[1] = A[A.size] [3] (the last cell is read, indigo);
 * A.size = A.size − 1 [4] (the last cell and its node turn `outside`, the
 * stale value stays in the table); the call Max-Heapify(A, 1) [5]. Then per
 * level three frames: l and r [9, 10] (the children in the heap indigo,
 * tags «l», «r»; the recursive call [18] is folded in, the desc names
 * Max-Heapify(A, i)); the choice of m [the executed lines of 11–15] (tag
 * «m»); and either the exchange [16, 17] (the element moves down one level,
 * the way it sank is EDGE.path) or, on the last level, m = i [16]. Last the
 * return [6]. With s swaps that is 9 + 3s frames (s ≤ ⌊lg(n − 1)⌋).
 *
 * The first instance is the lecture's (lecture 5, slides 341–346; CLRS fig.
 * 6.1): A = 16, 14, 10, 8, 7, 9, 3, 2, 4, 1. max = 16; 1 moves to the root;
 * 1 swaps with 14 (children 14 and 10), then with 8 (children 8 and 7), then
 * with 4 (children 2 and 4), then has no children (l = 18, r = 19 > 9).
 * Result A[1 : 9] = 14, 8, 10, 4, 7, 9, 3, 2, 1 with the stale 1 in A[10];
 * s = 3, 18 frames. Checked by running this file's run() in node (see the
 * report). Later instances: n distinct keys from 1 … 99 made into a max-heap
 * with Build-Max-Heap.
 *
 * The drawing (_haugtegning.js): the heap as a tree over the table A, one
 * state, a node and its cell always with the same mark. Accent (`current`) =
 * the element that sinks (and the root on line 1, the max); indigo ring
 * (`compared`) = the children Max-Heapify reads, and the last cell on line 2;
 * dashed faint (`outside`) = A[n] after A.size shrinks, in the tree and the
 * table; accent edges = the way the element sank. Tags i, l, r, m beside
 * their nodes; the A.size bracket under the table.
 */

import { drawHeap, seg, list, levels, buildMaxHeap, distinctKeys, firstView, NB } from "./_haugtegning.js";

/** The lecture's instance (lecture 5; CLRS fig. 6.1). */
const FIRST = [16, 14, 10, 8, 7, 9, 3, 2, 4, 1];

const view = firstView(import.meta.url);
const DASH = "–";

export default {
  sizeRange: { min: 5, max: 15, default: 10 },
  defaultData(size = 10) {
    if (view.isFirst()) return [...FIRST];
    return buildMaxHeap(distinctKeys(size));
  },

  run(input) {
    const A = [...input];
    const n = A.length;
    let size = n;
    const V = { max: DASH, i: DASH, l: DASH, r: DASH, m: DASH };
    let maxLabel = null;
    const frames = [];
    const snap = (line, desc, o = {}) =>
      frames.push({
        line,
        desc,
        vars: { ...V, "A.size": size },
        heap: {
          A: [...A],
          size,
          tree: n,
          mk: o.mk ?? {},
          path: [...(o.path ?? [])],
          tags: o.tags ?? {},
          max: maxLabel,
          sizeNew: !!o.sizeNew,
        },
      });

    snap(1, `Max-Heap-Extract-Max(A) tar ut det største elementet fra haugen ${seg(1, n)}.`);

    const max = A[0];
    V.max = max;
    maxLabel = `max = ${max}`;
    snap(2, `Det største elementet står alltid i rota, så max = A[1] = ${max}.`, { mk: { 1: "current" } });

    const e = A[n - 1];
    A[0] = e;
    snap(3, `A[1] = A[${n}]: det siste elementet, ${e}, kopieres til rota.`, { mk: { 1: "current", [n]: "compared" } });

    size = n - 1;
    snap(
      4,
      `A.size = ${size}: A[${n}] er ikke lenger med i haugen, så treet beholder formen sin. Den gamle verdien står igjen i tabellen.`,
      { mk: { 1: "current" }, sizeNew: true },
    );

    V.i = 1;
    snap(5, `Max-Heapify(A, 1) lar ${e} synke fra rota til haugegenskapen holder igjen.`, {
      mk: { 1: "current" },
      tags: { 1: ["i"] },
    });

    let i = 1;
    const path = [];
    for (;;) {
      const l = 2 * i;
      const r = l + 1;
      V.i = i;
      V.l = l;
      V.r = r;
      V.m = DASH;
      const kids = [l, r].filter((c) => c <= size);
      const mk = { [i]: "current" };
      kids.forEach((c) => (mk[c] = "compared"));
      const tags = { [i]: ["i"] };
      if (l <= n) tags[l] = ["l"];
      if (r <= n) tags[r] = ["r"];

      const head = `Max-Heapify(A, ${i}): l = ${l} og r = ${r}.`;
      let d;
      // Values are always written with their cell, «A[9] = 4», so a value is never read as an index.
      if (kids.length === 2) d = `${head} Barna til A[${i}] = ${e} er A[${l}] = ${A[l - 1]} og A[${r}] = ${A[r - 1]}.`;
      else if (kids.length === 1) d = `${head} r er større enn A.size = ${size}, så A[${i}] = ${e} har bare ett barn i haugen, A[${l}] = ${A[l - 1]}.`;
      else d = `${head} Begge er større enn A.size = ${size}, så A[${i}] = ${e} har ingen barn i haugen.`;
      snap([9, 10], d, { mk, tags, path });

      let m = i;
      const lines = [11];
      if (l <= size && A[l - 1] > A[i - 1]) {
        m = l;
        lines.push(12);
      } else lines.push(13);
      lines.push(14);
      if (r <= size && A[r - 1] > A[m - 1]) {
        m = r;
        lines.push(15);
      }
      V.m = m;
      const tagsM = Object.fromEntries(Object.entries(tags).map(([k, v]) => [k, [...v]]));
      tagsM[m].push("m");
      const cand = [`A[${i}] = ${e}`, ...kids.map((c) => `A[${c}] = ${A[c - 1]}`)];
      if (!kids.length) d = `Ingen barn å sammenligne med, så m = i = ${i}.`;
      else if (m === i) d = `A[${i}] = ${e} er størst av ${list(cand)}, så m = i = ${i}.`;
      else d = `A[${m}] = ${A[m - 1]} er størst av ${list(cand)}, så m = ${m}.`;
      snap(lines, d, { mk, tags: tagsM, path });

      if (m === i) {
        if (!kids.length) d = `m = i: ${e} har ingen barn i haugen og blir stående.`;
        else if (kids.length === 1) d = `m = i: ${e} er større enn barnet sitt og blir stående.`;
        else d = `m = i: ${e} er større enn begge barna og blir stående.`;
        snap(16, d, { mk: { [i]: "current" }, tags: { [i]: ["i", "m"] }, path });
        break;
      }

      const big = A[m - 1];
      [A[i - 1], A[m - 1]] = [A[m - 1], A[i - 1]];
      path.push(m);
      const other = kids.filter((c) => c !== m).map((c) => A[c - 1]);
      d =
        `m ≠ i: bytt A[${i}] og A[${m}]. ${e} synker ett nivå, og ${big} står nå over ` +
        (other.length ? `både ${e} og ${other[0]}.` : `${e}.`);
      snap([16, 17], d, { mk: { [m]: "current" }, tags: { [i]: ["i"], [m]: ["m"] }, path });
      i = m;
    }

    V.i = V.l = V.r = V.m = DASH;
    const s = path.length;
    const hgt = Math.floor(Math.log2(size));
    const sank = s ? `${e} sank ${levels(s)}` : `${e} sank ikke`;
    snap(
      6,
      `return max = ${max}. ${seg(1, size)} er en maks-haug igjen. ${sank}, og et element kan aldri synke mer enn høyden til haugen, ⌊lg${NB}${size}⌋ = ${hgt}.`,
      { mk: { [i]: "current" }, path },
    );

    return frames;
  },

  render(stage, f, api) {
    view.drawn.add(stage);
    drawHeap(stage, f.heap, api);
  },
};
