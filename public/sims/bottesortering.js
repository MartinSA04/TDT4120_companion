/**
 * Bøttene, for TDT4120 modul 05 «Rangering i lineær tid»: Bucket-Sort is fast
 * when no bucket gets many elements, and the input's distribution decides
 * whether that happens.
 *
 * Bucket-Sort(A, n) puts A[i] in bucket ⌊n · A[i]⌋ of the n equal intervals
 * of [0, 1), sorts each bucket with Insertion-Sort and joins the buckets in
 * order. It is hashing with chaining (module 02) with a hash function that
 * keeps the order: everything in bucket j is smaller than everything in
 * bucket j + 1. Insertion-Sort on a bucket of m elements makes at most
 * m(m − 1)/2 comparisons, so the work grows like the square of the pile.
 *
 * Drawing, top to bottom. The interval [0, 1) as an axis with a tick at every
 * bucket boundary j/n, labelled «0», «0,5» and «1» above it, and every
 * element as a dot on the axis at its value. Under it the n buckets as a row
 * of open slots on one floor (short walls at the boundaries), each slot
 * exactly under its interval of the axis, so a dot always sits straight above
 * the slot it falls into. In each slot the bucket's elements as a pile of
 * cards (the module's card, CARD.plain), sorted bottom to top, the value
 * printed at n = 10 where it fits: «0,78» when the stage is wide enough
 * (from about 350 px; 1100 px pages), «,78» on a phone. At n = 10 and 20 a
 * thin line runs from each dot down to its card (behind the pile, so it ends
 * where it enters the pile); at n = 40 the lines are left out and the
 * alignment carries the mapping. Under the floor the bucket index j
 * (0-based, as B[0 : n − 1] in the code): every index where they fit, else 0
 * and every 5th.
 *
 * The work. Under each bucket with m ≥ 2 elements hangs module 01's
 * Insertion-Sort triangle in miniature: m − 1 rows of 1, 2, …, m − 1 grey
 * cells, one cell per comparison in the worst case, under the bucket's left
 * edge and narrow at the top (opening to the left instead, under the
 * bucket's right edge, where it would pass the grid's right end).
 * layoutTriangles keeps every two triangles apart by the air two unmoved
 * neighbours have, also between a row and the rows above and below it, by
 * moving a triangle sideways (right, or left at the right end) as little as
 * that takes; with «jevn» under 1 % of the triangles move more than one
 * bucket, with «skjev» at n = 20 and 40 the small triangles beside bucket 0's
 * big one are pushed a few buckets right (12–25 % of them more than one
 * bucket). Cells sit on a pale plate of their triangle with thin seams, so
 * each triangle reads as one shape; below 6 px a triangle is one grey
 * staircase.
 *
 * Sizes. A card's height hc and a cell's side c are each as large as they
 * may be (24 px; a card at most twice as tall as wide; a cell at most 0.6 of
 * a bucket wide, or the bucket less 6 px if that is wider, so neighbouring
 * triangles keep air), and smaller only when the tallest pile (in a fixed
 * band of 55 % of the free height) or its triangle (the other 45 %) would not
 * fit. So «jevn» and «skjev» are drawn on one scale at each n except when a
 * pile is very tall, and «samlet» shrinks cards and cells until the whole
 * input fits in bucket 0 and its triangle fits under it.
 *
 * The one label, under the drawing: «høyst 5 sammenligninger i bøttene», the
 * sum of m(m − 1)/2 over the buckets, the grey cells counted («ingen
 * sammenligninger i bøttene» when every bucket has at most one element).
 *
 * Distributions. «jevn»: uniform on [0, 1). «skjev»: x = u³ for uniform u,
 * so the values bunch near 0. «samlet»: uniform on [0, 1/n), so every element
 * lands in bucket 0. At n = 10 the values are printed, so they are whole
 * hundredths (x rounded down, which keeps its bucket, so the statistics are
 * those of the continuous x; two elements may share a value, which
 * Bucket-Sort handles like any other); at n = 20 and 40 they are floats.
 *
 * Numbers the module text uses (checked by running bucketsOf over this
 * file's own valuesOf):
 *  - Default (first view): «jevn», n = 10, the lecture's and CLRS fig. 8.4's
 *    values .78 .17 .39 .26 .72 .94 .21 .12 .23 .68. Buckets 1: ,12 ,17;
 *    2: ,21 ,23 ,26; 3: ,39; 6: ,68; 7: ,72 ,78; 9: ,94; empty 0, 4, 5, 8.
 *    Work 1 + 3 + 1 = 5: «høyst 5 sammenligninger i bøttene».
 *  - First views of the other settings (SEED): «jevn» n = 20: 9 (piles of
 *    at most 3), n = 40: 20 (at most 3); «skjev» n = 10: 10 (bucket 0 holds
 *    ,00 ,01 ,01 ,02 ,03, then ,18 ,22 ,39 ,69 ,72 one per bucket), n = 20: 31
 *    (bucket 0 holds 8), n = 40: 84 (bucket 0 holds 12, buckets 1 and 2 four
 *    each); «samlet»: 45, 190, 780, n(n − 1)/2 at every draw.
 *  - Over 100 000 draws: «jevn» n = 10 mean 4,50 (5 %–95 % 2–8), n = 20 mean
 *    9,48 (5–15), n = 40 mean 19,52 (13–27), against (n − 1)/2 = 4,5, 9,5,
 *    19,5 (each pair shares a bucket with probability 1/n); about 92–93 % of
 *    the buckets hold 0, 1 or 2 elements. «skjev» n = 10 mean 11,4 (4–22),
 *    n = 20 mean 31,2 (13–58), n = 40 mean 82,4 (41–142); its tallest pile
 *    has median 5, 7, 12.
 *
 * Deterministic first view: the values come from a seeded generator
 * (mulberry32) salted with n and the distribution, so every setting shows the
 * same draw until the reader presses «Trekk på nytt», which draws a fresh
 * seed from Math.random; toggling a control back returns to the same draw.
 * With the first seed, «jevn» at n = 10 is the lecture's ten values.
 *
 * Colours are framework tokens only. Dots and cards are neutral, the work
 * cells grey (the module-01 triangle's and quicksort-tre's cell); no accent
 * and no green, since nothing is being worked on and nothing is placed.
 *
 * Contract: default-export init(api); host="dom", so api = { stage, controls,
 * getSize, onResize, signal }.
 */

const N_CHOICES = [10, 20, 40];
const N_DEFAULT = 10;

/** The lecture's (and CLRS fig. 8.4's) ten values, in hundredths. */
const LECTURE = [78, 17, 39, 26, 72, 94, 21, 12, 23, 68];

/** Seed of the first view, chosen so each setting shows a typical draw. */
const SEED = 3897;

/** Widest the drawing gets on a wide stage, in px. */
const GRID_MAX = 560;

/** Largest card height and cell side, in px. */
const C_MAX = 24;

/**
 * Widest a work cell may be: CELL_OF_BUCKET of a bucket, or the bucket less
 * CELL_AIR px if that is wider, so two neighbouring triangles keep a gap.
 */
const CELL_OF_BUCKET = 0.6;
const CELL_AIR = 6;

const DISTS = {
  jevn: { label: "jevn", aria: "Jevnt fordelte verdier i [0, 1)", salt: 1 },
  skjev: { label: "skjev", aria: "Skjevt fordelte verdier, samlet nær 0", salt: 2 },
  samlet: { label: "samlet", aria: "Alle verdiene i den første bøtta", salt: 3 },
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

/** One seed per (seed, n, distribution), so each setting has its own stream. */
const salt = (seed, n, d) => (seed ^ Math.imul(n, 0x9e3779b1) ^ Math.imul(d, 0x85ebca6b)) >>> 0;

/**
 * The input A[1 : n] as elements { v, k, b }: the value v in [0, 1), its
 * hundredths k at n = 10 (null otherwise) and its bucket b = ⌊n · v⌋.
 */
export function valuesOf(dist, n, seed) {
  if (dist === "jevn" && n === 10 && seed === SEED) {
    return LECTURE.map((k) => ({ v: k / 100, k, b: Math.floor((k * n) / 100) }));
  }
  const rnd = mulberry32(salt(seed, n, DISTS[dist].salt));
  const draw = () => {
    const u = rnd();
    return dist === "skjev" ? u * u * u : dist === "samlet" ? u / n : u;
  };
  const out = [];
  if (n === 10) {
    // Whole hundredths, since they are printed: x rounded down, which keeps
    // its bucket (the first decimal). Two elements may get the same value.
    for (let i = 0; i < n; i++) {
      const k = Math.floor(draw() * 100);
      out.push({ v: k / 100, k, b: Math.floor((k * n) / 100) });
    }
  } else {
    for (let i = 0; i < n; i++) {
      const v = draw();
      out.push({ v, k: null, b: Math.min(n - 1, Math.floor(n * v)) });
    }
  }
  return out;
}

/** The buckets B[0 : n − 1], each sorted, and the work Σ m(m − 1)/2. */
export function bucketsOf(els, n) {
  const B = Array.from({ length: n }, () => []);
  for (const e of els) B[e.b].push(e);
  for (const b of B) b.sort((x, y) => x.v - y.v);
  const work = B.reduce((s, b) => s + (b.length * (b.length - 1)) / 2, 0);
  return { B, work };
}

/**
 * Where the work triangles go, in grid coordinates (bucket j spans
 * [j·s, (j + 1)·s), the grid ends at W = n·s). ms = the pile sizes; a cell is
 * c wide; pad = the card's margin in its bucket; gap = the least air between
 * two triangles. A triangle has rows k = 1 … m − 1 with k cells in row k. It
 * opens to the right («høyre»: row k spans [x, x + k·c], x under the left
 * edge of its bucket, as module 01's triangle) unless that would pass the
 * grid's right end; then it opens to the left («venstre»: row k spans
 * [x − k·c, x], x under the right edge of its bucket). Going left to right,
 * each is moved right only as far as it must to keep gap from the triangles
 * already placed, in its own rows and in the rows just above and below (so
 * a narrow top can sit beside a wide bottom, one row clear of it); walking
 * back, any that would pass the grid's right end are pulled left.
 * Returns [{ j, m, open, x }] and whether anything still overlaps or passes
 * the grid (never seen in 100 000 draws per setting at 390 px and 1100 px).
 */
export function layoutTriangles(ms, s, c, pad, gap) {
  const W = ms.length * s;
  const lo = (tr, k) => (tr.open === "høyre" ? tr.x : tr.x - k * c);
  const hi = (tr, k) => (tr.open === "høyre" ? tr.x + k * c : tr.x);
  const near = (k) => [k - 1, k, k + 1];
  const rowEnd = []; // rightmost x used so far, per row
  const out = [];
  ms.forEach((m, j) => {
    if (m < 2) return;
    const rows = m - 1;
    // Row k must clear rows k − 1, k and k + 1 of the triangles placed so
    // far, so two triangles never touch, not even above each other.
    const leftOf = (k) => Math.max(...near(k).map((r) => (rowEnd[r] == null ? -Infinity : rowEnd[r] + gap)));
    // Opening right: row k's left edge is x.
    const tr = { j, m, open: "høyre", x: j * s + pad };
    for (let k = 1; k <= rows; k++) tr.x = Math.max(tr.x, leftOf(k));
    if (tr.x + rows * c > W - pad + 1e-9) {
      // Opening left: row k's left edge is x − k·c.
      tr.open = "venstre";
      tr.x = (j + 1) * s - pad;
      for (let k = 1; k <= rows; k++) tr.x = Math.max(tr.x, leftOf(k) + k * c);
    }
    for (let k = 1; k <= rows; k++) rowEnd[k] = Math.max(rowEnd[k] ?? -Infinity, hi(tr, k));
    out.push(tr);
  });
  // Near the right end a triangle can still pass the grid or the one to its
  // right; walking back, each is pulled left as far as that takes.
  const rowStart = [];
  for (let i = out.length - 1; i >= 0; i--) {
    const tr = out[i];
    let dx = 0;
    for (let k = 1; k < tr.m; k++) {
      const bound = Math.min(W - pad, ...near(k).map((r) => (rowStart[r] == null ? Infinity : rowStart[r] - gap)));
      dx = Math.max(dx, hi(tr, k) - bound);
    }
    if (dx > 1e-9) tr.x -= dx;
    for (let k = 1; k < tr.m; k++) rowStart[k] = Math.min(rowStart[k] ?? Infinity, lo(tr, k));
  }
  // Check the result: inside the grid, and no two triangles closer than gap
  // in the same or a neighbouring row.
  let clash = false;
  for (const a of out) {
    for (let k = 1; k < a.m; k++) if (lo(a, k) < -1e-9 || hi(a, k) > W + 1e-9) clash = true;
    for (const b of out) {
      if (b.j <= a.j) continue;
      for (let k = 1; k < a.m; k++) {
        for (const r of near(k)) {
          if (r < 1 || r >= b.m) continue;
          if (lo(b, r) < hi(a, k) + gap - 1e-6 && hi(b, r) > lo(a, k) - gap + 1e-6) clash = true;
        }
      }
    }
  }
  return { tris: out, clash };
}

/** A value in hundredths with a decimal comma: «0,78», or «,78» when short. */
const valueText = (k, short) => `${short ? "" : "0"},${String(k).padStart(2, "0")}`;

export default function init({ stage, controls, getSize, onResize, signal }) {
  let dist = "jevn";
  let n = N_DEFAULT;
  let seed = SEED;

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

  const distGroup = btnGroup("Fordeling", "Fordeling av verdiene", DISTS, (k) => k === dist, (k) => (dist = k));
  const SIZES = Object.fromEntries(N_CHOICES.map((k) => [k, { label: String(k), aria: `n = ${k} elementer` }]));
  const nGroup = btnGroup("n", "Antall elementer n", SIZES, (k) => Number(k) === n, (k) => (n = Number(k)));

  const dealBtn = document.createElement("button");
  dealBtn.type = "button";
  dealBtn.className = "sim-btn";
  dealBtn.textContent = "Trekk på nytt";
  dealBtn.setAttribute("aria-label", "Trekk på nytt: nye tilfeldige verdier med samme fordeling");
  dealBtn.addEventListener(
    "click",
    () => {
      seed = Math.floor(Math.random() * 2 ** 32) >>> 0;
      if (seed === SEED) seed += 1;
      render();
    },
    { signal },
  );

  const groups = document.createElement("div");
  groups.style.cssText = "display:flex;flex-wrap:wrap;align-items:flex-end;gap:var(--space-4) var(--space-5)";
  groups.append(distGroup.el, nGroup.el, dealBtn);
  controls.append(groups);

  function sync() {
    distGroup.sync();
    nGroup.sync();
  }

  // ── tegning ─────────────────────────────────────────────────────────────
  function render() {
    const { w, h } = getSize();
    if (w <= 0 || h <= 0) {
      stage.innerHTML = "";
      return;
    }
    const els = valuesOf(dist, n, seed);
    const { B, work } = bucketsOf(els, n);

    // Type sizes in px, read from the root so the layout follows the reader's
    // text size. IBM Plex Mono advances 0.6 em per glyph.
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    const fsSm = 0.84 * rem;
    const fsXs = 0.72 * rem;
    const textW = (s, fs) => String(s).length * 0.6 * fs;

    // Horizontal: the axis and the row of buckets share one grid, bucket j
    // under its interval [j/n, (j + 1)/n).
    const PAD_X = 6;
    const gridW = Math.min(w - 2 * PAD_X, GRID_MAX);
    const gx = (w - gridW) / 2;
    const s = gridW / n; // one bucket
    const X = (v) => gx + v * gridW;
    const L = (j) => gx + j * s;

    // Vertical bands, top to bottom: the axis labels, the axis, the piles
    // (with the lines from the dots), the floor and the bucket indices, the
    // triangles, the label line. Every band is fixed by the stage size.
    const PAD_T = 4;
    const yAxis = PAD_T + fsXs + 9;
    const DROP_MIN = 12;
    const IDX_H = Math.ceil(fsXs) + 8;
    const TRI_GAP = 3;
    const LABEL_H = Math.ceil(fsSm * 1.9);
    const PAD_B = 2;
    const free = h - yAxis - DROP_MIN - IDX_H - TRI_GAP - LABEL_H - PAD_B;
    // The floor is fixed: the piles get a little over half of the free
    // height, the triangles the rest (a pile of m cards hangs m − 1 rows).
    const pileH = free * 0.55;
    const triH = free - pileH;
    const yFloor = yAxis + DROP_MIN + pileH;
    const yTri = yFloor + IDX_H + TRI_GAP;
    const yLabel = yTri + triH;
    // The card height hc and the cell side c: as large as C_MAX and the
    // bucket width allow (a card at most twice as tall as it is wide, a cell
    // at most CELL_OF_BUCKET of a bucket wide, so the triangles under two
    // neighbouring buckets keep a gap), smaller only when the tallest pile or
    // its triangle would not fit.
    const sep = Math.max(1, Math.min(4, s * 0.1));
    const cw = s - sep;
    const tallest = Math.max(...B.map((b) => b.length));
    const hc = Math.max(1, Math.min(C_MAX, 2 * cw, pileH / Math.max(1, tallest)));
    const c = Math.max(1, Math.min(C_MAX, Math.max(CELL_OF_BUCKET * s, s - CELL_AIR), triH / Math.max(1, tallest - 1)));

    let svg = "";
    const f1 = (v) => v.toFixed(1);
    const rect = (x, y, wd, ht, style, rx = 0) =>
      (svg +=
        `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(Math.max(0, wd))}" height="${f1(Math.max(0, ht))}"` +
        `${rx > 0 ? ` rx="${f1(rx)}"` : ""} style="${style}"/>`);
    const text = (x, y, str, style, anchor = "start") =>
      (svg +=
        `<text x="${f1(x)}" y="${f1(y)}" text-anchor="${anchor}" ` +
        `style="font-family:var(--font-mono);${style}">${str}</text>`);

    // ── the axis [0, 1) ──
    svg +=
      `<line x1="${f1(X(0))}" y1="${f1(yAxis)}" x2="${f1(X(1))}" y2="${f1(yAxis)}" ` +
      `style="stroke:var(--border-strong)" stroke-width="1"/>`;
    for (let j = 0; j <= n; j++) {
      const end = j === 0 || j === n;
      const t = end ? 5 : 3;
      svg +=
        `<line x1="${f1(L(j))}" y1="${f1(yAxis - t)}" x2="${f1(L(j))}" y2="${f1(yAxis + t)}" ` +
        `style="stroke:var(--border-strong)" stroke-width="1"/>`;
    }
    const axY = yAxis - 8;
    text(X(0), axY, "0", "fill:var(--muted);font-size:var(--text-xs)", "middle");
    text(X(0.5), axY, "0,5", "fill:var(--muted);font-size:var(--text-xs)", "middle");
    text(X(1), axY, "1", "fill:var(--muted);font-size:var(--text-xs)", "middle");

    // ── the cards: positions first, so the lines can run to them ──
    const cardGap = hc >= 8 ? 1.5 : hc >= 4 ? 1 : 0.5;
    const cardRx = Math.min(3, cw * 0.2, (hc - cardGap) * 0.3);
    const pos = new Map(); // element → its card's centre
    B.forEach((b, j) =>
      b.forEach((e, r) => pos.set(e, { x: L(j) + s / 2, y: yFloor - (r + 0.5) * hc, r, j })),
    );

    // ── lines from each dot to its card, behind the cards ──
    const lines = n <= 20;
    if (lines) {
      for (const e of els) {
        const p = pos.get(e);
        svg +=
          `<line x1="${f1(X(e.v))}" y1="${f1(yAxis)}" x2="${f1(p.x)}" y2="${f1(p.y)}" ` +
          `style="stroke:color-mix(in srgb, var(--fg) 32%, transparent)" stroke-width="1"/>`;
      }
    }

    // ── the floor and the slots' walls ──
    const WALL = Math.min(9, Math.max(5, hc * 0.7));
    let floor = `M ${f1(L(0))} ${f1(yFloor - WALL)} V ${f1(yFloor)} H ${f1(L(n))} V ${f1(yFloor - WALL)}`;
    for (let j = 1; j < n; j++) floor += ` M ${f1(L(j))} ${f1(yFloor)} V ${f1(yFloor - WALL)}`;
    svg += `<path d="${floor}" style="fill:none;stroke:var(--border-strong)" stroke-width="1"/>`;

    // ── the stacks ──
    const fsCard = fsXs;
    const fits = (str) => cw >= textW(str, fsCard) + 3 && hc - cardGap >= fsCard * 0.72 + 5;
    const short = !fits("0,00");
    const showValues = n === 10 && fits(short ? ",00" : "0,00");
    // An opaque underlay in the stage's colour under each pile hides the
    // lines behind it, also in the gaps between its cards.
    B.forEach((b, j) => {
      if (b.length) rect(L(j) + sep / 2, yFloor - b.length * hc + cardGap / 2, cw, b.length * hc - cardGap, "fill:var(--canvas-bg)", cardRx);
    });
    for (const e of els) {
      const p = pos.get(e);
      const x = L(p.j) + sep / 2;
      const y = yFloor - (p.r + 1) * hc + cardGap / 2;
      const ht = hc - cardGap;
      rect(
        x,
        y,
        cw,
        ht,
        "fill:color-mix(in srgb, var(--fg) 9%, transparent);" +
          `stroke:color-mix(in srgb, var(--fg) 28%, transparent);stroke-width:${hc >= 6 && cw >= 6 ? 1 : 0.6}`,
        cardRx,
      );
      if (showValues) {
        text(p.x, y + ht / 2 + fsCard * 0.36, valueText(e.k, short), `fill:var(--fg);font-size:var(--text-xs)`, "middle");
      }
    }

    // ── the dots on the axis, over the lines ──
    const dotR = n <= 10 ? 3.2 : n <= 20 ? 2.7 : 2.2;
    for (const e of els) {
      svg +=
        `<circle cx="${f1(X(e.v))}" cy="${f1(yAxis)}" r="${dotR}" ` +
        `style="fill:color-mix(in srgb, var(--fg) 62%, transparent)"/>`;
    }

    // ── the bucket indices: all where they fit, else 0 and every 5th/10th ──
    const need = textW(n - 1, fsXs) + 4;
    let step = 1;
    if (s < need) {
      step = 5;
      while (step < n && step * s < need + 6) step *= 2;
    }
    const idxY = yFloor + IDX_H - 5;
    for (let j = 0; j < n; j += step) {
      text(L(j) + s / 2, idxY, j, "fill:var(--faint);font-size:var(--text-xs)", "middle");
    }

    // ── the work: one triangle per bucket with m ≥ 2 ──
    // Row k (1 … m − 1) has k cells; placed by layoutTriangles.
    const GREY = "fill:color-mix(in srgb, var(--fg) 20%, transparent)";
    const PLATE = "fill:color-mix(in srgb, var(--fg) 8%, transparent)";
    const cells = c >= 6;
    // Thin seams inside a triangle, wide air between two triangles.
    const inset = cells ? Math.min(0.75, c * 0.06) : 0;
    const cellRx = cells ? Math.min(2, (c - 2 * inset) * 0.18) : 0;
    // Between two triangles as much air as two neighbours have unmoved.
    const GAP_T = s - c - 2 * inset;
    const { tris } = layoutTriangles(B.map((b) => b.length), s, c, sep / 2, GAP_T);
    for (const { m, open, x } of tris) {
      // The triangle's own x: a = the edge under its bucket, sg = the way it
      // opens (+1 right, −1 left). Its staircase outline is a pale plate
      // behind its cells, so each triangle reads as one shape also where two
      // sit close.
      const a = gx + x;
      const sg = open === "høyre" ? 1 : -1;
      let d = `M ${f1(a)} ${f1(yTri)} H ${f1(a + sg * c)}`;
      for (let k = 1; k <= m - 1; k++) {
        d += ` V ${f1(yTri + k * c)}`;
        if (k < m - 1) d += ` H ${f1(a + sg * (k + 1) * c)}`;
      }
      d += ` H ${f1(a)} Z`;
      if (cells) {
        svg += `<path d="${d}" style="${PLATE}"/>`;
        for (let k = 1; k <= m - 1; k++) {
          const y = yTri + (k - 1) * c + inset;
          for (let t = 0; t < k; t++) {
            const left = sg > 0 ? a + t * c : a - (t + 1) * c;
            rect(left + inset, y, c - 2 * inset, c - 2 * inset, GREY, cellRx);
          }
        }
      } else {
        svg += `<path d="${d}" style="${GREY}"/>`;
      }
    }

    // ── the label ──
    // --text-sm when the longest label (n = 40, all in one bucket) fits
    // between the grid's left edge and the stage's right edge, else
    // --text-xs; decided by the stage width, never by n.
    const N_MAX = N_CHOICES[N_CHOICES.length - 1];
    const longest = `høyst ${(N_MAX * (N_MAX - 1)) / 2} sammenligninger i bøttene`;
    const small = textW(longest, fsSm) > w - gx - 2;
    const fsL = small ? fsXs : fsSm;
    const ly = yLabel + LABEL_H * 0.62 + fsL * 0.35;
    const LBL = `font-family:var(--font-mono);font-size:var(${small ? "--text-xs" : "--text-sm"});fill:var(--fg)`;
    const said =
      work === 0
        ? "ingen sammenligninger i bøttene"
        : `høyst <tspan style="font-weight:600">${work}</tspan> ${work === 1 ? "sammenligning" : "sammenligninger"} i bøttene`;
    svg += `<text x="${f1(gx)}" y="${f1(ly)}" style="${LBL}">${said}</text>`;

    stage.setAttribute(
      "aria-label",
      `Bucket-Sort med n = ${n}, fordeling ${dist}: ` +
        (work === 0 ? "ingen sammenligninger i bøttene" : `høyst ${work} sammenligninger i bøttene`),
    );
    stage.innerHTML =
      `<svg width="100%" height="100%" viewBox="0 0 ${w.toFixed(0)} ${h.toFixed(0)}" ` +
      `preserveAspectRatio="none" aria-hidden="true" style="display:block">${svg}</svg>`;
  }

  sync();
  onResize(render);
  render();
}
