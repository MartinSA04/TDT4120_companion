/**
 * Quicksort-treet for TDT4120 modul 04 «Splitt og hersk»: the pivot decides
 * how a segment splits, the splits decide how deep the recursion goes, and
 * the depth decides how much work Quicksort does.
 *
 * Drawing. At the top the input table A[1 : n] as cards on a baseline, whose
 * height follows the value (the module's steppers' cards, without the values,
 * which do not fit at n ≥ 16): «sortert» is a rising staircase, «tilfeldig»
 * a jagged row. Under the cards the indices: all of them when they fit (n = 8
 * everywhere, n = 16 on a wide stage), else 1 and every 4th or 8th. Under
 * that Quicksort's
 * recursion tree IN PLACE: one row per recursion depth (nivå 0 = the call on
 * the whole table), columns aligned with the cards, array position 1 … n.
 * Quicksort never moves an element out of its segment, so the call on
 * A[p : r] at depth d is drawn in row d over columns p … r, directly under the
 * part of its parent's segment it came from. A call on m ≥ 2 elements is a
 * bar of m cells: m − 1 grey cells, one per comparison its Partition makes
 * (line 4, `if A[j] ≤ x`, runs once for each j = p … r − 1), and one green
 * cell at A[q], where the pivot ends up: its final place. A one-element call
 * is a single green cell and costs no comparison. Empty calls (p > r) are not
 * drawn. So every column holds exactly one green cell, in the row where that
 * position got its final element, and the grey area is the work: one cell per
 * comparison. Two calls in one row are always separated by an empty column
 * (the pivot of their nearest common ancestor, placed higher up). Column t
 * also counts something: its grey cells are the comparisons the element that
 * ends in A[t] takes part in before it becomes a pivot (or is left alone),
 * one per level it passes through. Cells are drawn one by one (rounded, with
 * a small gap) while they are at least 6 px each way, i.e. n ≤ 32 at 390 px
 * and 1100 px; at n = 64 a call is one grey bar with its green cell.
 *
 * Behind the tree, a dashed staircase: the tree that sorted input with the
 * last element as pivot draws, n rows deep, row d over columns 1 … n − d.
 * Its grey cells number (n − 1) + (n − 2) + … + 1 = n(n − 1)/2, the most
 * Quicksort can ever compare, the same triangle as Insertion-Sort's worst
 * case. It carries its name, «verste tilfelle», in the empty corner just
 * right of its slanted side, about three quarters down (dropped if a cell of
 * the tree would touch it, which only a rare deep tree at n = 8 does). The
 * tree is drawn over it on the stage's own ground, so the dashed line shows
 * only where the tree does not reach; for «sortert» + «siste» the tree covers
 * the staircase exactly and the dashed line vanishes. The vertical scale is
 * fixed by n alone (row height = grid height / n, the staircase's depth), so
 * the order and the pivot rule never rescale the drawing; the grid's width is
 * capped at ASPECT times its height (on a wide stage the drawing is centred).
 *
 * The one label, under the grid: «140 sammenligninger» at the left and
 * «9 nivåer» (rows the tree uses = the deepest call's depth + 1) at the right,
 * in --text-sm, or --text-xs on a stage too narrow for «2016 sammenligninger»
 * and «64 nivåer» side by side (phones under about 375 px).
 *
 * Partition exactly as the book's pseudocode (spec: CLRS 4th ed. §7.1, the
 * lecture's slides): x = A[r]; i = p − 1; for j = p to r − 1: if A[j] ≤ x
 * then i = i + 1, exchange A[i] with A[j]; exchange A[i + 1] with A[r];
 * return i + 1. Randomized-Partition (§7.3): exchange A[r] with a uniformly
 * random element of A[p : r], then Partition. Quicksort(A, p, r): if p < r,
 * q = Partition(A, p, r), Quicksort(A, p, q − 1), Quicksort(A, q + 1, r).
 * The table holds the distinct values 1 … n.
 *
 * Numbers the module text uses (checked by running treeOf below):
 *  - «sortert» + «siste»: the staircase, n − 1 rows of bars plus the first
 *    element alone in the last row: n(n − 1)/2 comparisons and n nivåer.
 *    n = 8: 28, 8 nivåer; 16: 120, 16; 32: 496, 32; 64: 2016, 64.
 *  - Default (first view): «tilfeldig» + «siste», n = 32, the fixed table
 *    dealt from ORDER_SEED: 140 sammenligninger, 9 nivåer (lg 32 = 5).
 *    The same seed at n = 8: 16, 5 nivåer; 16: 51, 7; 64: 360, 12.
 *  - «sortert» + «tilfeldig» with the first-view PIVOT_SEED: n = 8: 16, 5;
 *    16: 50, 7; 32: 137, 9; 64: 375, 12. «tilfeldig» + «tilfeldig»
 *    (both seeds): n = 32: 133, 9; 64: 358, 11.
 *  - Over 20 000 random runs (any order with a random pivot, or a random
 *    order with the last pivot; the three agree): n = 32, mean 140
 *    comparisons (theory 2(n + 1)H_n − 4n = 139,9), 5 %–95 % 118–172, median
 *    9 nivåer (5 %–95 % 7–12); n = 64, mean 361 (theory 360,7), 5 %–95 %
 *    312–431, median 11–12 nivåer (10–14). The largest seen: 271 at n = 32
 *    (18 nivåer), 621 at n = 64 (20 nivåer), far below 496 and 2016.
 *
 * Deterministic first view: the table and the random pivot choices come from
 * a seeded generator (mulberry32), salted with n, so every setting shows the
 * same tree until the reader presses «Trekk på nytt», which draws fresh seeds
 * from Math.random. Toggling a control back returns to the same tree. «Ny
 * tabell» changes nothing for «sortert» + «siste», where nothing is random.
 *
 * Colours are framework tokens only. Grey and green differ in lightness as
 * well as hue (a pale cell against a solid one), so they never differ by
 * colour alone; the staircase is a dashed outline.
 *
 * Contract: default-export init(api); host="dom", so api = { stage, controls,
 * getSize, onResize, signal }.
 */

const N_CHOICES = [8, 16, 32, 64];
const N_DEFAULT = 32;

/** Seeds of the first view, chosen so each n shows a typical run. */
const ORDER_SEED = 1880;
const PIVOT_SEED = 1538;

/** Widest the grid may be, relative to its height. */
const ASPECT = 1.8;

const ORDERS = {
  tilfeldig: { label: "tilfeldig", aria: "Tilfeldig rekkefølge" },
  sortert: { label: "sortert", aria: "Sortert rekkefølge" },
};
const PIVOTS = {
  siste: { label: "siste", aria: "Siste element som pivot" },
  tilfeldig: { label: "tilfeldig", aria: "Tilfeldig element som pivot" },
};

/** A small seeded generator (mulberry32): returns numbers in [0, 1). */
function mulberry32(a) {
  return function () {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** One seed per (seed, n), so each n has its own stream. */
const salt = (seed, n) => (seed ^ Math.imul(n, 0x9e3779b1)) >>> 0;

/** A random order of 1 … n from `seed`. */
export function deal(n, seed) {
  const rnd = mulberry32(salt(seed, n));
  const a = Array.from({ length: n }, (_, i) => i + 1);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Runs Quicksort on `input` (Randomized-Partition when `randomPivot`, its
 * random choices from `seed`) and records every non-empty call: depth d, the
 * segment p … r (1-based) and q, where its pivot ends up (q = p for a
 * one-element call). Comparisons = the number of times line 4 of Partition
 * runs.
 */
export function treeOf(input, randomPivot, seed) {
  const n = input.length;
  const rnd = mulberry32(salt(seed, n));
  const A = [0, ...input]; // 1-based, as in the book
  const calls = [];
  let comparisons = 0;
  const swap = (a, b) => {
    const t = A[a];
    A[a] = A[b];
    A[b] = t;
  };
  const partition = (p, r) => {
    const x = A[r];
    let i = p - 1;
    for (let j = p; j <= r - 1; j++) {
      comparisons += 1;
      if (A[j] <= x) {
        i += 1;
        swap(i, j);
      }
    }
    swap(i + 1, r);
    return i + 1;
  };
  const randomizedPartition = (p, r) => {
    swap(r, p + Math.floor(rnd() * (r - p + 1)));
    return partition(p, r);
  };
  const quicksort = (p, r, d) => {
    if (p < r) {
      const q = randomPivot ? randomizedPartition(p, r) : partition(p, r);
      calls.push({ d, p, r, q });
      quicksort(p, q - 1, d + 1);
      quicksort(q + 1, r, d + 1);
    } else if (p === r) {
      calls.push({ d, p, r, q: p });
    }
  };
  quicksort(1, n, 0);
  const levels = calls.reduce((m, c) => Math.max(m, c.d + 1), 0);
  return { calls, comparisons, levels };
}

export default function init({ stage, controls, getSize, onResize, signal }) {
  let order = "tilfeldig";
  let pivot = "siste";
  let n = N_DEFAULT;
  let orderSeed = ORDER_SEED;
  let pivotSeed = PIVOT_SEED;

  const input = () =>
    order === "sortert" ? Array.from({ length: n }, (_, i) => i + 1) : deal(n, orderSeed);

  // ── kontroller ──────────────────────────────────────────────────────────
  // A group of buttons is not a labelable control, so each group gets the
  // framework's label layout on a <div role="group"> instead of a <label>
  // (a <label> would forward a click on its text to the first button).
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
  groups.append(orderGroup.el, pivotGroup.el, nGroup.el, dealBtn);
  controls.append(groups);

  function sync() {
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
    const { calls, comparisons, levels } = treeOf(A, pivot === "tilfeldig", pivotSeed);

    // Type sizes in px, read from the root so the layout follows the reader's
    // text size. IBM Plex Mono advances 0.6 em per glyph.
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    const fsSm = 0.84 * rem;
    const fsXs = 0.72 * rem;
    const textW = (s, fs) => String(s).length * 0.6 * fs;

    // Vertical bands, top to bottom: the input cards, their indices, the
    // grid (n rows), the label line.
    const PAD_X = 10;
    const PAD_T = 10;
    const PAD_B = 4;
    const CARDS_H = Math.round(Math.min(40, Math.max(24, h * 0.085)));
    const IDX_H = Math.ceil(fsXs) + 7;
    const GAP = 6;
    const LABEL_H = Math.ceil(fsSm * 1.9);
    const gridH = h - PAD_T - CARDS_H - IDX_H - GAP - LABEL_H - PAD_B;
    const gridW = Math.min(w - 2 * PAD_X, gridH * ASPECT);
    const col = gridW / n;
    const row = gridH / n;
    const gx = (w - gridW) / 2;
    const cardsBase = PAD_T + CARDS_H;
    const gy = cardsBase + IDX_H + GAP;
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
    // s-th position (s = 4, 8, …, the first step that leaves room both
    // between 1 and s and between two multiples of s).
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
    // The worst case behind the tree: the staircase that sorted input with
    // the last pivot draws (row d over columns 1 … n − d).
    let d = `M ${f1(X(1))} ${f1(Y(0))} H ${f1(X(n) + col)}`;
    for (let k = 0; k < n; k++) d += ` V ${f1(Y(k + 1))} H ${f1(X(n - k - 1) + col)}`;
    d += " Z";
    svg +=
      `<path d="${d}" style="fill:none;stroke:var(--faint)" ` +
      `stroke-width="1.2" stroke-dasharray="4 3" stroke-linejoin="round"/>`;

    // The tree. Cells are drawn one by one while they are wide and tall
    // enough to read as cells; below that (n = 64) a call is one grey bar
    // with its green cell, so the rows read as rows and not as stripes.
    const cells = col >= 6 && row >= 6;
    const ix = cells ? Math.min(1.5, col * 0.12) : 0;
    const iy = cells ? Math.min(1.5, row * 0.12) : 0.5;
    const cellRx = Math.min(2.5, (col - 2 * ix) * 0.2, (row - 2 * iy) * 0.25);
    const GREY = "fill:color-mix(in srgb, var(--fg) 20%, transparent)";
    const GREEN = "fill:var(--green)";
    // Each call first covers its part of the staircase with the stage's own
    // ground (reaching just past it, over half the dashed stroke); then the
    // staircase gets its faint tint. So the dashed line shows only outside
    // the tree, and the ground between the cells is the staircase's.
    const OV = 1;
    for (const c of calls) {
      rect(X(c.p) - OV, Y(c.d) - OV, X(c.r) + col - X(c.p) + 2 * OV, row + 2 * OV, "fill:var(--canvas-bg)");
    }
    svg += `<path d="${d}" style="fill:${TINT}"/>`;
    for (const c of calls) {
      const y = Y(c.d) + iy;
      const ht = row - 2 * iy;
      if (cells) {
        for (let t = c.p; t <= c.r; t++) rect(X(t) + ix, y, col - 2 * ix, ht, t === c.q ? GREEN : GREY, cellRx);
      } else {
        if (c.r > c.p) rect(X(c.p), y, X(c.r) + col - X(c.p), ht, GREY, cellRx);
        rect(X(c.q), y, col, ht, GREEN, cellRx);
      }
    }

    // The staircase's name, just right of its slanted side at about three
    // quarters of its depth, in the empty corner. Dropped if it would touch a
    // cell of the tree (only a rare deep tree at n = 8 reaches that far).
    {
      const name = "verste tilfelle";
      const k = Math.round(0.72 * n);
      const ny = Y(k) + row / 2 + fsXs * 0.35;
      const top = ny - fsXs * 0.85;
      const bot = ny + fsXs * 0.25;
      // Clear of the staircase in the highest row the text reaches.
      const kTop = Math.max(0, Math.floor((top - 2 - gy) / row));
      const nx = X(n - kTop) + col + 6;
      const nw = textW(name, fsXs);
      const hit = calls.some(
        (c) => Y(c.d) < bot + 2 && Y(c.d) + row > top - 2 && X(c.p) < nx + nw + 2 && X(c.r) + col > nx - 2,
      );
      if (!hit && nx + nw <= gx + gridW) text(nx, ny, name, "fill:var(--muted);font-size:var(--text-xs)");
    }

    // The label: the comparisons at the left, the levels at the right. The
    // type is --text-sm when both fit at the largest n (2016 and 64), else
    // --text-xs, so it never changes with n; the levels are dropped if they
    // do not fit at the largest numbers for this n (the staircase's), so
    // they never vanish when only the order or the pivot changes.
    const N_MAX = N_CHOICES[N_CHOICES.length - 1];
    const pairW = (k, fs) =>
      textW(`${(k * (k - 1)) / 2} sammenligninger`, fs) + 16 + textW(`${k} nivåer`, fs);
    const small = pairW(N_MAX, fsSm) > gridW;
    const fsL = small ? fsXs : fsSm;
    const LBL = `font-family:var(--font-mono);font-size:var(${small ? "--text-xs" : "--text-sm"});fill:var(--fg)`;
    const ly = gy + gridH + LABEL_H * 0.62 + fsL * 0.35;
    const cmpWord = comparisons === 1 ? "sammenligning" : "sammenligninger";
    const lvlWord = levels === 1 ? "nivå" : "nivåer";
    svg +=
      `<text x="${f1(gx)}" y="${f1(ly)}" style="${LBL}">` +
      `<tspan style="font-weight:600">${comparisons}</tspan> ${cmpWord}</text>`;
    if (pairW(n, fsL) <= gridW) {
      svg +=
        `<text x="${f1(gx + gridW)}" y="${f1(ly)}" text-anchor="end" style="${LBL}">` +
        `<tspan style="font-weight:600">${levels}</tspan> ${lvlWord}</text>`;
    }

    stage.setAttribute(
      "aria-label",
      `Quicksort-treet for n = ${n}: ${comparisons} ${cmpWord}, ${levels} ${lvlWord}`,
    );
    stage.innerHTML =
      `<svg width="100%" height="100%" viewBox="0 0 ${w.toFixed(0)} ${h.toFixed(0)}" ` +
      `preserveAspectRatio="none" aria-hidden="true" style="display:block">${svg}</svg>`;
  }

  sync();
  onResize(render);
  render();
}
