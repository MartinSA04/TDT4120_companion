/**
 * Select-stien for TDT4120 modul 05 «Rangering i lineær tid»:
 * Randomized-Select is one path down Quicksort's recursion tree. Quicksort
 * partitions every segment on every level; Randomized-Select partitions one
 * segment per level, the one that holds rank i, so its rows shrink
 * geometrically and the grey area (the comparisons) stays a small multiple
 * of n, while Quicksort's tree has about lg n full rows. When the pivot lands
 * at the end of the segment every time («sortert» + «siste», rank «minste»),
 * the path is the whole staircase, n(n − 1)/2 comparisons: the worst case.
 *
 * Drawing. Module 04's quicksort-tre.js, the same layout and marks (its
 * `deal` and `treeOf` are imported): the input table A[1 : n] as cards on a
 * baseline at the top (heights follow the value, no values), the indices
 * under them, then one row per recursion depth with columns aligned to array
 * positions 1 … n. Each call of Randomized-Select on A[p : r] with p < r is a
 * bar of r − p + 1 cells in row d over columns p … r: r − p grey cells, one
 * per comparison its Partition makes, and a green cell at q, where the pivot
 * ends (its final place). The base case p == r is a single green cell. The
 * path ends on the green cell of the call whose pivot has rank i (or on a
 * one-element call). Cells are drawn one by one while they are at least
 * 6 px each way (n ≤ 32 at 390 px and 1100 px); at n = 64 a call is one grey
 * bar with its green cell, as in quicksort-tre.js.
 *
 * The target column p + i − 1 of the first call, = i (p = 1): a dashed violet
 * line through every row from a label «i» just over the grid (right under the
 * index row, so «i» stands under its index where that is printed), the same
 * mark as the target place in steppers/randomized-select.js. It is drawn
 * under the path's cells: every row's segment contains that column, and the
 * last green cell covers the line.
 *
 * The ghost of Quicksort: behind the path, every other call Quicksort makes on
 * the same table with the same pivot rule, as an empty box with a faint
 * outline in its row and columns (no grey cells, no green); at n = 64, where
 * a row is about 4 px and a box reads as two lines much like a path bar, as a
 * faint bar (8 % ink) instead. So the reader sees which part of
 * Quicksort's tree Randomized-Select skips. The path is exactly a part of that
 * tree: a call's segment holds the same elements in both algorithms (only the
 * calls above it have touched them, and they are the same calls), and with
 * «tilfeldig» pivot both take the call's random choice from the one stream
 * treeOf draws in Quicksort's order, so the pivots agree too. Behind both, the
 * dashed staircase of the worst case with its name «verste tilfelle», as in
 * quicksort-tre.js (the ground is covered under every Quicksort call, so the
 * dashed line shows only outside Quicksort's tree).
 *
 * The staircase's name sits right of its slanted side at about three
 * quarters of its depth, or higher up where the target line would cross it
 * there (the median), and is dropped where nothing is clear (often at n = 8).
 *
 * The one label, under the grid: «80 sammenligninger» (the path's grey cells)
 * at the left and «Quicksort: 140» (the whole tree's) at the right, muted,
 * in --text-sm, or --text-xs on a stage too narrow for «2016 sammenligninger»
 * and «Quicksort: 2016» side by side (phones). Quicksort's number is dropped
 * where even that does not fit at the largest numbers for this n: at n = 64
 * on a stage under 283 px (a 390 px phone has 291 px, a 375 px phone 276 px),
 * at n = 32 under 268 px (a 360 px phone, 261 px).
 *
 * Numbers the module text uses (checked by running treeOf and pathOf below in
 * node, 20 000 random runs per setting):
 *  - Default (first view): «median» (i = ⌊(n + 1)/2⌋), «tilfeldig», «siste»,
 *    n = 32, the table quicksort-tre.js shows first (deal(32, 1880)):
 *    80 sammenligninger in 7 rows, Quicksort: 140 (9 nivåer).
 *  - «tilfeldig» + «siste» (the same tables as quicksort-tre's first view):
 *    n = 32: minste 37 (3 rows), median 80 (7), største 67 (4); Quicksort 140.
 *    n = 64: minste 67 (3), median 183 (6), største 149 (5); Quicksort 360.
 *    n = 8: 7, 12, 16 (Quicksort 16); n = 16: 20, 32, 23 (Quicksort 51).
 *  - Random runs (random order with «siste», or any order with «tilfeldig»
 *    pivot; the two agree), median: n = 32 mean 85,4 comparisons = 2,67 n,
 *    5 %–95 % 48–135, 2–9 rows (median 6); n = 64 mean 189 = 2,95 n,
 *    5 %–95 % 107–293, 3–11 rows (median 7). minste/største: n = 32 mean 56
 *    = 1,75 n (31–93); n = 64 mean 118 = 1,85 n (65–199). (For large n the
 *    mean tends to 2(1 + ln 2) n ≈ 3,4 n for the median and 2n for the ends.)
 *    Quicksort on the same tables: mean 140 at n = 32, 361 at n = 64.
 *  - «sortert» + «siste»: every pivot is the segment's largest element and
 *    lands at its end, so the path walks down the staircase. minste: the whole
 *    staircase, n(n − 1)/2 = 28, 120, 496, 2016 comparisons in n rows (all of
 *    Quicksort's tree: the ghost is empty). median: rows 0 … n − i, n = 32:
 *    391 in 17 rows, n = 64: 1551 in 33 rows. største: the first pivot is the
 *    answer, n − 1 = 31 or 63 comparisons in one row. Quicksort: n(n − 1)/2.
 *  - «sortert» + «tilfeldig» with the first-view PIVOT_SEED: median n = 32:
 *    82 in 5 rows (segments 32, 21, 19, 9, 6; Quicksort 134); n = 64: 193 in
 *    8 rows (Quicksort 354); minste/største n = 32: 43/51, n = 64: 136/106.
 *    «tilfeldig» + «tilfeldig» (both first-view seeds): median n = 32: 76 in
 *    6 rows (Quicksort 135); n = 64: 188 in 5 rows (Quicksort 346).
 *  - The default's segments, row by row: 32, 24, 9, 8, 7, 5, 2 (the path
 *    ends on the green cell in column 16 of row 6). At n = 64: 64, 58, 38, 14,
 *    9, 6.
 *
 * Deterministic first view: the table comes from quicksort-tre's ORDER_SEED
 * (1880) through its `deal`, so «tilfeldig» + «siste» at each n is the table
 * module 04's sim shows first. The pivot stream uses this file's own
 * PIVOT_SEED (118078, not quicksort-tre's 1538): with 1538 the median path for
 * «sortert» + «tilfeldig» at n = 32 was one row (the first random pivot hit
 * rank 16, a 1-in-32 chance), and the first view should show a typical run;
 * 118078 is typical at n = 32 and 64 for both orders. «Trekk på nytt» draws
 * fresh seeds from Math.random; toggling a control back returns to the same
 * tree.
 *
 * Colours are framework tokens only. Grey and green differ in lightness as
 * well as hue; the ghost is an empty outline (a faint bar at n = 64), the path
 * is filled cells; the target line is dashed, violet and named.
 *
 * Contract: default-export init(api); host="dom", so api = { stage, controls,
 * getSize, onResize, signal }.
 */

import { deal, treeOf } from "./quicksort-tre.js";

const N_CHOICES = [8, 16, 32, 64];
const N_DEFAULT = 32;

/** quicksort-tre.js's order seed (its first-view table); this file's pivot seed. */
const ORDER_SEED = 1880;
const PIVOT_SEED = 118078;

/** Widest the grid may be, relative to its height (as quicksort-tre.js). */
const ASPECT = 1.8;

const RANKS = {
  minste: { label: "minste", aria: "Rang 1, det minste elementet", i: () => 1 },
  median: { label: "median", aria: "Nedre median, rang (n + 1)/2 rundet ned", i: (n) => Math.floor((n + 1) / 2) },
  storste: { label: "største", aria: "Rang n, det største elementet", i: (n) => n },
};
const ORDERS = {
  tilfeldig: { label: "tilfeldig", aria: "Tilfeldig rekkefølge" },
  sortert: { label: "sortert", aria: "Sortert rekkefølge" },
};
const PIVOTS = {
  siste: { label: "siste", aria: "Siste element som pivot" },
  tilfeldig: { label: "tilfeldig", aria: "Tilfeldig element som pivot" },
};

/**
 * Randomized-Select's calls, read off Quicksort's: from the call on A[1 : n]
 * with rank i, step into the child that holds rank i until the pivot has
 * rank i (k = i) or the segment has one element. Every call of the path is a
 * call of Quicksort's tree (the same segment, the same pivot), see the header.
 */
export function pathOf(calls, n, i0) {
  const byRange = new Map(calls.map((c) => [`${c.p}:${c.r}`, c]));
  const path = [];
  let p = 1;
  let r = n;
  let i = i0;
  for (;;) {
    const c = byRange.get(`${p}:${r}`);
    path.push(c);
    if (p === r) break;
    const k = c.q - p + 1;
    if (i === k) break;
    if (i < k) r = c.q - 1;
    else {
      p = c.q + 1;
      i -= k;
    }
  }
  return path;
}

export default function init({ stage, controls, getSize, onResize, signal }) {
  let rank = "median";
  let order = "tilfeldig";
  let pivot = "siste";
  let n = N_DEFAULT;
  let orderSeed = ORDER_SEED;
  let pivotSeed = PIVOT_SEED;

  const input = () =>
    order === "sortert" ? Array.from({ length: n }, (_, i) => i + 1) : deal(n, orderSeed);

  // ── kontroller ──────────────────────────────────────────────────────────
  // As quicksort-tre.js: a group of buttons is not a labelable control, so
  // each group gets the framework's label layout on a <div role="group">.
  const btnGroup = (text, aria, entries, isOn, onPick) => {
    const wrap = document.createElement("div");
    wrap.setAttribute("role", "group");
    wrap.setAttribute("aria-label", aria);
    wrap.style.cssText =
      "display:flex;flex-direction:column;gap:var(--space-2);font-family:var(--font-mono);" +
      "font-size:var(--text-xs);color:var(--muted)";
    const tag = document.createElement("span");
    tag.textContent = text;
    const row = document.createElement("span");
    row.style.cssText = "display:flex;flex-wrap:wrap;gap:var(--space-2)";
    const btns = {};
    for (const k of Object.keys(entries)) {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "sim-btn";
      b.textContent = entries[k].label;
      b.setAttribute("aria-label", entries[k].aria);
      b.addEventListener(
        "click",
        () => {
          onPick(k);
          sync();
          render();
        },
        { signal },
      );
      btns[k] = b;
      row.append(b);
    }
    wrap.append(tag, row);
    return {
      el: wrap,
      sync: () => Object.keys(btns).forEach((k) => btns[k].setAttribute("aria-pressed", String(isOn(k)))),
    };
  };

  const rankGroup = btnGroup("Rang", "Rangen det letes etter", RANKS, (k) => k === rank, (k) => (rank = k));
  const orderGroup = btnGroup("Rekkefølge", "Rekkefølge på tabellen", ORDERS, (k) => k === order, (k) => (order = k));
  const pivotGroup = btnGroup("Pivot", "Valg av pivot", PIVOTS, (k) => k === pivot, (k) => (pivot = k));
  const SIZES = Object.fromEntries(N_CHOICES.map((k) => [k, { label: String(k), aria: `n = ${k} elementer` }]));
  const nGroup = btnGroup("n", "Antall elementer n", SIZES, (k) => Number(k) === n, (k) => (n = Number(k)));

  const dealBtn = document.createElement("button");
  dealBtn.type = "button";
  dealBtn.className = "sim-btn";
  dealBtn.textContent = "Trekk på nytt";
  dealBtn.setAttribute("aria-label", "Trekk på nytt: ny tilfeldig rekkefølge og nye tilfeldige pivoter");
  dealBtn.addEventListener(
    "click",
    () => {
      orderSeed = Math.floor(Math.random() * 2 ** 32) >>> 0;
      pivotSeed = Math.floor(Math.random() * 2 ** 32) >>> 0;
      render();
    },
    { signal },
  );

  const groups = document.createElement("div");
  groups.style.cssText = "display:flex;flex-wrap:wrap;align-items:flex-end;gap:var(--space-4) var(--space-5)";
  groups.append(rankGroup.el, orderGroup.el, pivotGroup.el, nGroup.el, dealBtn);
  controls.append(groups);

  function sync() {
    rankGroup.sync();
    orderGroup.sync();
    pivotGroup.sync();
    nGroup.sync();
  }

  // ── tegning ─────────────────────────────────────────────────────────────
  function render() {
    const { w, h } = getSize();
    if (w <= 0 || h <= 0) {
      stage.innerHTML = "";
      return;
    }
    const A = input();
    const target = RANKS[rank].i(n);
    const { calls, comparisons: qsComparisons } = treeOf(A, pivot === "tilfeldig", pivotSeed);
    const path = pathOf(calls, n, target);
    const onPath = new Set(path);
    const comparisons = path.reduce((s, c) => s + (c.r - c.p), 0);

    // Type sizes in px, read from the root so the layout follows the reader's
    // text size. IBM Plex Mono advances 0.6 em per glyph.
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    const fsSm = 0.84 * rem;
    const fsXs = 0.72 * rem;
    const textW = (s, fs) => String(s).length * 0.6 * fs;

    // Vertical bands, top to bottom: the input cards, their indices, the
    // target's name «i», the grid (n rows), the label line.
    const PAD_X = 8;
    const PAD_T = 10;
    const PAD_B = 4;
    const CARDS_H = Math.round(Math.min(40, Math.max(24, h * 0.085)));
    const IDX_H = Math.ceil(fsXs) + 7;
    const MARK_H = Math.ceil(fsSm) + 5;
    const GAP = 3;
    const LABEL_H = Math.ceil(fsSm * 1.9);
    const gridH = h - PAD_T - CARDS_H - IDX_H - MARK_H - GAP - LABEL_H - PAD_B;
    const gridW = Math.min(w - 2 * PAD_X, gridH * ASPECT);
    const col = gridW / n;
    const row = gridH / n;
    const gx = (w - gridW) / 2;
    const cardsBase = PAD_T + CARDS_H;
    const markY = cardsBase + IDX_H + MARK_H - 5; // baseline of «i»
    const gy = cardsBase + IDX_H + MARK_H + GAP;
    const X = (t) => gx + (t - 1) * col; // left edge of column t (1-based)
    const Y = (d) => gy + d * row; // top of row d

    let svg = "";
    const f1 = (v) => v.toFixed(1);
    const rect = (x, y, wd, ht, style, rx = 0) =>
      (svg +=
        `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(Math.max(0, wd))}" height="${f1(Math.max(0, ht))}"` +
        `${rx > 0 ? ` rx="${f1(rx)}"` : ""} style="${style}"/>`);
    const text = (x, y, s, style, anchor = "start") =>
      (svg +=
        `<text x="${f1(x)}" y="${f1(y)}" text-anchor="${anchor}" ` +
        `style="font-family:var(--font-mono);${style}">${s}</text>`);

    // The input: cards whose height follows the value, on one baseline.
    const sep = Math.max(1, Math.min(4, col * 0.16));
    const cw = col - sep;
    const outlined = cw >= 8;
    const minH = Math.max(3, CARDS_H * 0.14);
    const cardRx = Math.min(3, cw * 0.2);
    A.forEach((v, k) => {
      const ht = minH + (n > 1 ? ((v - 1) / (n - 1)) * (CARDS_H - minH) : 0);
      const style = outlined
        ? "fill:color-mix(in srgb, var(--fg) 9%, transparent);stroke:color-mix(in srgb, var(--fg) 28%, transparent);stroke-width:1"
        : "fill:color-mix(in srgb, var(--fg) 30%, transparent)";
      rect(X(k + 1) + sep / 2, cardsBase - ht, cw, ht, style, cardRx);
    });
    svg +=
      `<line x1="${f1(X(1) - 3)}" y1="${f1(cardsBase)}" x2="${f1(X(n) + col + 3)}" y2="${f1(cardsBase)}" ` +
      `style="stroke:var(--border-strong)" stroke-width="1"/>`;

    // Indices under the cards: every one when they fit, else 1 and every
    // s-th position, as in quicksort-tre.js.
    const need = textW(n, fsXs) + 6;
    let step = 1;
    if (col < need) {
      step = 4;
      while (step < n && (step - 1) * col < need) step *= 2;
    }
    const idxY = cardsBase + IDX_H - 4;
    const idx = step === 1 ? Array.from({ length: n }, (_, i) => i + 1) : [1];
    if (step > 1) for (let t = step; t <= n; t += step) idx.push(t);
    for (const t of idx) text(X(t) + col / 2, idxY, t, "fill:var(--faint);font-size:var(--text-xs)", "middle");

    const TINT = "color-mix(in srgb, var(--fg) 3%, transparent)";
    // The worst case behind everything: the staircase that sorted input with
    // the last pivot draws (row d over columns 1 … n − d).
    let stair = `M ${f1(X(1))} ${f1(Y(0))} H ${f1(X(n) + col)}`;
    for (let k = 0; k < n; k++) stair += ` V ${f1(Y(k + 1))} H ${f1(X(n - k - 1) + col)}`;
    stair += " Z";
    svg +=
      `<path d="${stair}" style="fill:none;stroke:var(--faint)" ` +
      `stroke-width="1.2" stroke-dasharray="4 3" stroke-linejoin="round"/>`;

    // Cell geometry as quicksort-tre.js: cells one by one while they are wide
    // and tall enough to read as cells; below that (n = 64) a call is one
    // grey bar with its green cell.
    const cells = col >= 6 && row >= 6;
    const ix = cells ? Math.min(1.5, col * 0.12) : 0;
    const iy = cells ? Math.min(1.5, row * 0.12) : 0.5;
    const cellRx = Math.min(2.5, (col - 2 * ix) * 0.2, (row - 2 * iy) * 0.25);
    const GREY = "fill:color-mix(in srgb, var(--fg) 20%, transparent)";
    const GREEN = "fill:var(--green)";

    // Every Quicksort call covers its part of the staircase with the stage's
    // own ground, then the staircase gets its tint: the dashed line shows only
    // outside Quicksort's tree.
    const OV = 1;
    for (const c of calls) {
      rect(X(c.p) - OV, Y(c.d) - OV, X(c.r) + col - X(c.p) + 2 * OV, row + 2 * OV, "fill:var(--canvas-bg)");
    }
    svg += `<path d="${stair}" style="fill:${TINT}"/>`;

    // The ghost: Quicksort's other calls. Where cells are drawn, an empty
    // box over the call's columns (an outline on the stage's own ground, so
    // the staircase's tint does not fill half of it). At n = 64 a 4 px box
    // reads as two lines and looks like a path bar, so there a call is a faint
    // bar instead, well under the path's grey.
    const GHOST = cells
      ? "fill:var(--canvas-bg);stroke:color-mix(in srgb, var(--fg) 24%, transparent);stroke-width:1"
      : "fill:color-mix(in srgb, var(--fg) 8%, transparent)";
    for (const c of calls) {
      if (onPath.has(c)) continue;
      if (cells) {
        const x = X(c.p) + ix + 0.5;
        const y = Y(c.d) + iy + 0.5;
        rect(x, y, X(c.r) + col - ix - 0.5 - x, row - 2 * iy - 1, GHOST, cellRx);
      } else {
        rect(X(c.p), Y(c.d) + iy, X(c.r) + col - X(c.p), row - 2 * iy, GHOST, cellRx);
      }
    }

    // The target column: a dashed line through every row, named «i» over the
    // grid, the stepper's mark for the target place. Drawn under the path, so
    // the path's cells stand on it and its last green cell covers it.
    {
      const xm = X(target) + col / 2;
      svg +=
        `<line x1="${f1(xm)}" y1="${f1(markY + 3)}" x2="${f1(xm)}" y2="${f1(gy + gridH)}" ` +
        `style="stroke:var(--violet)" stroke-width="1.5" stroke-dasharray="4 3"/>`;
      text(xm, markY, "i", "fill:var(--violet);font-size:var(--text-sm);font-weight:600", "middle");
    }

    // The path: grey cells (comparisons) and the green cell at q.
    for (const c of path) {
      const y = Y(c.d) + iy;
      const ht = row - 2 * iy;
      if (cells) {
        for (let t = c.p; t <= c.r; t++) rect(X(t) + ix, y, col - 2 * ix, ht, t === c.q ? GREEN : GREY, cellRx);
      } else {
        if (c.r > c.p) rect(X(c.p), y, X(c.r) + col - X(c.p), ht, GREY, cellRx);
        rect(X(c.q), y, col, ht, GREEN, cellRx);
      }
    }

    // The staircase's name, just right of its slanted side, as in
    // quicksort-tre.js: at about three quarters of its depth, or, when the
    // target line would cross it there (the median), at the nearest depth
    // above where it fits right of the line. Dropped if no depth down to a
    // third of the staircase is clear of the tree and the line.
    {
      const name = "verste tilfelle";
      const nw = textW(name, fsXs);
      const xm = X(target) + col / 2;
      const at = (k) => {
        const ny = Y(k) + row / 2 + fsXs * 0.35;
        const top = ny - fsXs * 0.85;
        const bot = ny + fsXs * 0.25;
        const kTop = Math.max(0, Math.floor((top - 2 - gy) / row));
        const nx = X(n - kTop) + col + 6;
        const hit = calls.some(
          (c) => Y(c.d) < bot + 2 && Y(c.d) + row > top - 2 && X(c.p) < nx + nw + 2 && X(c.r) + col > nx - 2,
        );
        const crosses = xm > nx - 6 && xm < nx + nw + 6;
        return !hit && !crosses && nx + nw <= gx + gridW ? { nx, ny } : null;
      };
      let spot = null;
      for (let k = Math.round(0.72 * n); k >= Math.round(n / 3) && !spot; k--) spot = at(k);
      if (spot) text(spot.nx, spot.ny, name, "fill:var(--muted);font-size:var(--text-xs)");
    }

    // The label: the path's comparisons at the left, Quicksort's at the
    // right (muted, it belongs to the ghost). --text-sm when both fit at the
    // largest n (2016 each), else --text-xs, so the type never changes with
    // n; Quicksort's number is dropped if it does not fit at this n's largest
    // numbers, so it never vanishes when only the rank, order or pivot change.
    const N_MAX = N_CHOICES[N_CHOICES.length - 1];
    const pairW = (k, fs) =>
      textW(`${(k * (k - 1)) / 2} sammenligninger`, fs) + 10 + textW(`Quicksort: ${(k * (k - 1)) / 2}`, fs);
    const small = pairW(N_MAX, fsSm) > gridW;
    const fsL = small ? fsXs : fsSm;
    const LBL = `font-family:var(--font-mono);font-size:var(${small ? "--text-xs" : "--text-sm"})`;
    const ly = gy + gridH + LABEL_H * 0.62 + fsL * 0.35;
    const cmpWord = comparisons === 1 ? "sammenligning" : "sammenligninger";
    svg +=
      `<text x="${f1(gx)}" y="${f1(ly)}" style="${LBL};fill:var(--fg)">` +
      `<tspan style="font-weight:600">${comparisons}</tspan> ${cmpWord}</text>`;
    if (pairW(n, fsL) <= gridW) {
      svg +=
        `<text x="${f1(gx + gridW)}" y="${f1(ly)}" text-anchor="end" style="${LBL};fill:var(--muted)">` +
        `Quicksort: <tspan style="font-weight:600">${qsComparisons}</tspan></text>`;
    }

    stage.setAttribute(
      "aria-label",
      `Select-stien for n = ${n} og rang ${target}: ${comparisons} ${cmpWord} i ${path.length} ` +
        `${path.length === 1 ? "rad" : "rader"}, mot ${qsComparisons} for Quicksort`,
    );
    stage.innerHTML =
      `<svg width="100%" height="100%" viewBox="0 0 ${w.toFixed(0)} ${h.toFixed(0)}" ` +
      `preserveAspectRatio="none" aria-hidden="true" style="display:block">${svg}</svg>`;
  }

  sync();
  onResize(render);
  render();
}
