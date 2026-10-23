/**
 * Shared drawing and helpers for the three heap steppers of modul 06
 * «Rotfaste trestrukturer»: extract-max.js, max-heap-insert.js and
 * heapsort.js. All three draw one state twice: the heap as a tree (heapPos,
 * A[1] in the root, the children of A[i] are A[2i] and A[2i + 1]) and, under
 * it, the table A with one cell per slot on one pitch and the 1-based index
 * under each cell. When one row would be too narrow for a two-digit key (12
 * or more cells on a phone), the table wraps into two rows of ⌈N/2⌉ cells on
 * the same pitch. A node and its cell always carry the same mark (MARK in
 * _tre.js), so the reader ties the two pictures together. A bracket under the
 * indices spans A[1 : A.size] (in two pieces when the table wraps) and is
 * labelled «A.size» at its right end; it is drawn in the accent on the frame
 * where A.size changes.
 *
 * Stage height: 330 px for all three steppers. At phone width with a wrapped
 * table the levels of a four-level tree are about 45 px apart; with one row
 * (the first instances) about 70 px.
 *
 * Default marks, when the frame names none for a slot: a slot with no value
 * is `slot` (dashed, empty); a slot after A.size is `outside` (dashed, its
 * stale value faint); everything else `plain`. The stepper overrides with
 * `mk` (index → mark): `current` for the moving element, `compared` for what
 * the step reads, `done` for Heapsort's sorted tail.
 *
 * Tree edges: EDGE.path for the edges in `path` (each listed by its child's
 * index: the way an element sank or rose); EDGE.slot to an empty slot;
 * EDGE.outside to a node after A.size; otherwise plain.
 *
 * Pointer names (i, l, r, m, x) are small bold mono tags at their node. At a
 * node with children in the drawing they stand beside it on the outer side
 * (left for a left child and the root, right for a right child; flipped when
 * that side would leave the stage), two names stacked. At a node without
 * children they stand under it, joined by a comma («r,m»): on the bottom
 * level the neighbours are too close for a tag beside a node at phone width
 * (the stage is about 275 px wide there), and under a leaf nothing else is
 * drawn. The gap between the tree and the table leaves room for that row.
 *
 * Corner items, on the root's level: a text label top left (Extract-Max's
 * «max = 16») and a separate node top right (Insert's x, before it is put
 * into the table) with the tag «x» on its left.
 *
 * The heap state a frame carries (`frame.heap`):
 *   A       values of A[1 … N] (index 0 holds A[1]); null = empty slot
 *   size    A.size, or null before it is set (no bracket)
 *   tree    how many nodes the tree draws (A[1 … tree])
 *   mk      { index: mark } overrides
 *   path    child indices whose edge to the parent is EDGE.path
 *   tags    { index: ["i", "m"] }
 *   max     corner label top left, or null
 *   xnode   { key } for the separate node top right, or null
 *   sizeNew true on the frame where A.size changes
 *
 * Sizes are read from the root font size (remPx), so the drawing follows the
 * reader's text size. Colours are framework tokens only.
 */

import { FONT, node, edge, cell, tag, text, heapPos, heapDepth, svgWrap, remPx, textW } from "./_tre.js";

export const NB = " ";
/** A run of the table as the lecture writes it, A[1 : n], with no-break spaces. */
export const seg = (a, b) => (a === b ? `A[${a}]` : `A[${a}${NB}:${NB}${b}]`);
/** «a, b og c» (no comma before og). */
export const list = (xs) => (xs.length <= 1 ? xs.join("") : `${xs.slice(0, -1).join(", ")} og ${xs[xs.length - 1]}`);
/** «1 nivå», «3 nivåer». */
export const levels = (s) => `${s} ${s === 1 ? "nivå" : "nivåer"}`;

/** `n` distinct integer keys from lo … hi, in random order. */
export function distinctKeys(n, lo = 1, hi = 99) {
  const all = [];
  for (let v = lo; v <= hi; v++) all.push(v);
  for (let j = all.length - 1; j > 0; j--) {
    const k = Math.floor(Math.random() * (j + 1));
    [all[j], all[k]] = [all[k], all[j]];
  }
  return all.slice(0, n);
}

/**
 * Max-Heapify(A, i) on A[1 : size] (A is a 0-based JS array holding A[1 …]),
 * in place. Returns the indices the element passed through after i (the
 * children it swapped into) and the values it swapped with.
 */
export function maxHeapify(A, i, size) {
  const path = [];
  const swapped = [];
  for (;;) {
    const l = 2 * i;
    const r = l + 1;
    let m = i;
    if (l <= size && A[l - 1] > A[i - 1]) m = l;
    if (r <= size && A[r - 1] > A[m - 1]) m = r;
    if (m === i) return { path, swapped, at: i };
    swapped.push(A[m - 1]);
    [A[i - 1], A[m - 1]] = [A[m - 1], A[i - 1]];
    path.push(m);
    i = m;
  }
}

/** Build-Max-Heap(A, n) in place: Max-Heapify from ⌊n/2⌋ down to 1. */
export function buildMaxHeap(A) {
  for (let i = Math.floor(A.length / 2); i >= 1; i--) maxHeapify(A, i, A.length);
  return A;
}

/** True when A[1 : size] has the heap property (every parent ≥ its children). */
export function isMaxHeap(A, size = A.length) {
  for (let c = 2; c <= size; c++) if (A[(c >> 1) - 1] < A[c - 1]) return false;
  return true;
}

/**
 * The first view must be the lecture's instance, also when the reader comes
 * back to the page. Same detection as counting-sort.js: a call while one of
 * this module's ready figures has not drawn yet is that figure's first load;
 * otherwise only the very first call. `selfUrl` is the stepper's
 * import.meta.url; call `drawn.add(stage)` in render().
 */
export function firstView(selfUrl) {
  const SELF = new URL(selfUrl).pathname;
  const drawn = new WeakSet();
  let calls = 0;
  const firstLoad = () => {
    if (typeof document === "undefined") return false;
    for (const fig of document.querySelectorAll("[data-stepper-src]")) {
      if (new URL(fig.dataset.stepperSrc, location.href).pathname !== SELF) continue;
      const stage = fig.querySelector(".stepper-stage");
      if (fig.dataset.ready === "true" && stage && !drawn.has(stage)) return true;
    }
    return false;
  };
  return { drawn, isFirst: () => calls++ === 0 || firstLoad() };
}

const f1 = (v) => (Math.round(v * 10) / 10).toString();

/** Draw one heap state (tree over table) into `stage`. */
export function drawHeap(stage, s, api) {
  const { w, h } = api.getSize();
  const N = s.A.length;
  if (!N || w <= 0 || h <= 0) {
    stage.innerHTML = "";
    return;
  }

  // Type sizes in px from the root, so the layout follows the reader's text
  // size. IBM Plex Mono advances 0.6 em per glyph (textW).
  const rem = remPx();
  const fsKey = 0.84 * rem;
  const fsIdx = 0.72 * rem;
  const fsTag = 0.8 * rem;
  const PAD = 4;
  const LBL = `${FONT};font-size:${f1(fsTag)}px;font-weight:600`;

  const markOf = (i) => {
    if (s.mk && s.mk[i]) return s.mk[i];
    if (s.A[i - 1] === null || s.A[i - 1] === undefined) return "slot";
    if (s.size !== null && s.size !== undefined && i > s.size) return "outside";
    return "plain";
  };

  // ── Table: the row name «A», then the cells on one pitch, the group
  // centred. One row when a cell can hold a two-digit key and its index with
  // room to spare; otherwise (N ≥ 12 on a phone, where the stage is about
  // 275 px wide) two rows, A[1 : K] over A[K + 1 : N] with K = ⌈N/2⌉, on the
  // same pitch, left-aligned, like a line of text that wraps.
  const nameW = textW("A", fsKey) + 7;
  const avail = w - 2 * PAD - nameW;
  const minPitch = Math.max(textW("99", fsKey), textW("16", fsIdx)) + 6;
  const K = avail / N >= minPitch ? N : Math.ceil(N / 2);
  const rows = Math.ceil(N / K);
  const pitch = Math.min(46, avail / K);
  const sep = Math.max(2, pitch * 0.1);
  const cw = pitch - sep;
  const tx0 = (w - nameW - pitch * K) / 2 + nameW;
  const rowOf = (i) => Math.floor((i - 1) / K);
  const left = (i) => tx0 + ((i - 1) % K) * pitch + sep / 2;
  const CH = Math.round(fsKey * 2);
  const IDX = fsIdx + 3; // index baseline under the cell
  const BRK = 7; // bracket line under the index baseline
  const ROW = CH + IDX + BRK + fsTag + 7; // cells, indices, bracket, its label
  const tableH = rows * ROW - 4 + PAD;
  const rowTop = (q) => h - tableH + q * ROW;
  const cellTop = rowTop(0);

  // ── Tree: heapPos over a box whose bottom level has pitch pb.
  const T = Math.max(1, s.tree);
  const L = heapDepth(T) + 1;
  const pb = Math.min(62, (w - 2 * PAD) / 2 ** (L - 1));
  const r = Math.max(11, Math.min(17, 0.38 * pb));
  const TW = pb * 2 ** (L - 1);
  const bx0 = (w - TW) / 2;
  const GAP = fsTag + 8; // room for a tag under a node on the bottom level
  const top = PAD + r;
  const bottom = cellTop - GAP - r;
  const dy = L > 1 ? Math.min(72, (bottom - top) / (L - 1)) : 0;
  const y0 = top + Math.max(0, (bottom - top - dy * (L - 1)) / 2);
  const box = { x0: bx0, y0, w: TW, dy };
  const P = (i) => heapPos(i, box);

  let svg = "";

  // Edges, then nodes.
  const onPath = new Set(s.path ?? []);
  for (let c = 2; c <= T; c++) {
    const m = markOf(c);
    let em = "plain";
    if (onPath.has(c)) em = "path";
    else if (m === "slot") em = "slot";
    else if (s.size !== null && s.size !== undefined && c > s.size) em = "outside";
    svg += edge(P(c >> 1), P(c), r, em);
  }
  for (let i = 1; i <= T; i++) {
    const p = P(i);
    const v = s.A[i - 1];
    svg += node(p.x, p.y, r, v === null || v === undefined ? "" : v, markOf(i), fsKey);
  }

  // Tags. Under a node with no children drawn (nothing else is there; beside
  // it the neighbour on the bottom level is too close at phone width), the
  // names joined by commas. Beside a node with children, on the outer side,
  // several names stacked.
  for (const [k, names] of Object.entries(s.tags ?? {})) {
    const i = Number(k);
    if (i < 1 || i > T || !names.length) continue;
    const p = P(i);
    if (2 * i > T) {
      const s1 = names.join(",");
      const tw1 = textW(s1, fsTag);
      const tx = Math.min(w - tw1 / 2 - 2, Math.max(tw1 / 2 + 2, p.x));
      svg += tag(tx, p.y + r + fsTag * 0.95, s1, fsTag, "var(--accent-ink)", "middle");
      continue;
    }
    const tw = Math.max(...names.map((nm) => textW(nm, fsTag)));
    const off = r + 3;
    let side = i === 1 || i % 2 === 0 ? -1 : 1;
    if (side > 0 && p.x + off + tw > w - 2) side = -1;
    else if (side < 0 && p.x - off - tw < 2) side = 1;
    const lh = fsTag * 1.02;
    const yb = p.y + fsTag * 0.35 - ((names.length - 1) * lh) / 2;
    names.forEach((nm, j) => {
      svg += tag(p.x + side * off, yb + j * lh, nm, fsTag, "var(--accent-ink)", side > 0 ? "start" : "end");
    });
  }

  // Corner items on the root's level.
  if (s.max) svg += text(bx0 + 2, y0 + fsTag * 0.35, s.max, `fill:var(--fg);${LBL}`, "start");
  if (s.xnode) {
    const xc = bx0 + TW - r - 2;
    svg += node(xc, y0, r, s.xnode.key, "current", fsKey);
    svg += tag(xc - r - 4, y0 + fsTag * 0.35, "x", fsTag, "var(--accent-ink)", "end");
  }

  // ── Table cells, indices, the row name and the A.size bracket.
  svg += text(tx0 - 6, cellTop + CH / 2 + fsKey * 0.36, "A", `fill:var(--fg);${FONT};font-size:${f1(fsKey)}px;font-weight:600`, "end");
  for (let i = 1; i <= N; i++) {
    const v = s.A[i - 1];
    const y = rowTop(rowOf(i));
    svg += cell(left(i), y, cw, CH, v === null || v === undefined ? "" : v, markOf(i), fsKey);
    svg += text(left(i) + cw / 2, y + CH + IDX, i, `fill:var(--muted);${FONT};font-size:${f1(fsIdx)}px`);
  }
  if (s.size !== null && s.size !== undefined && s.size > 0) {
    // One bracket piece per row the heap reaches into; the end ticks only at
    // A[1] and A[A.size], so a wrapped bracket reads as one.
    const tick = 5;
    const col = s.sizeNew ? "var(--accent)" : "var(--muted)";
    const last = rowOf(s.size);
    for (let q = 0; q <= last; q++) {
      const from = q * K + 1;
      const to = Math.min(s.size, (q + 1) * K);
      const a = left(from) - sep / 2;
      const e = left(to) + cw + sep / 2;
      const by = rowTop(q) + CH + IDX + BRK - 2;
      const d =
        (from === 1 ? `M ${f1(a)} ${f1(by - tick)} V ${f1(by)}` : `M ${f1(a - sep / 2)} ${f1(by)}`) +
        ` H ${f1(e)}` +
        (to === s.size ? ` V ${f1(by - tick)}` : ` H ${f1(e + sep / 2)}`);
      svg += `<path d="${d}" fill="none" style="stroke:${col}" stroke-width="${s.sizeNew ? 2 : 1.5}"/>`;
      if (q === last) {
        const lw = textW("A.size", fsTag);
        const lx = Math.min(w - lw / 2 - 2, Math.max(lw / 2 + 2, e));
        svg += text(lx, by + fsTag + 2, "A.size", `fill:${s.sizeNew ? "var(--accent-ink)" : "var(--fg)"};${LBL}`);
      }
    }
  }

  const vals = s.A.map((v) => (v === null || v === undefined ? "tom" : v)).join(", ");
  const sizeTxt = s.size === null || s.size === undefined ? "" : ` A.size = ${s.size}.`;
  stage.innerHTML = svgWrap(w, h, svg, `Haugen som tre og som tabell. A = ${vals}.${sizeTxt}`);
}
