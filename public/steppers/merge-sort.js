/**
 * Merge-Sort as a recursion tree, for <Stepper>, driving the block
 * `merge-sort-kode` in modul 04. The one idea: Merge-Sort is module 03's
 * ladder with two subinstances per rung, so the ladder branches into a tree.
 * Going down, every call only splits its segment in the middle; nothing moves.
 * All the work happens on the way up, in the merges, and every row of the tree
 * merges each of the n elements exactly once: lg n rows that merge, n
 * placements each, n lg n in all.
 *
 * Block line numbers count the header as line 1 (pseudocode line k is block
 * line k + 1):
 *    1 Merge-Sort(A, p, r)
 *    2 1  if p ≥ r
 *    3 2      return
 *    4 3  q = ⌊(p + r)/2⌋
 *    5 4  Merge-Sort(A, p, q)
 *    6 5  Merge-Sort(A, q + 1, r)
 *    7 6  Merge(A, p, q, r)
 *
 * Frames: the start (line 1); one per call on two or more elements, when it
 * splits (line 4: its two halves appear in the row below as empty frames);
 * one per one-element call (lines 2–3: the base case); one per merge (line 7:
 * the parent's row holds the merged segment, the children's cards are used
 * up); the end (line 1: the top row green). For n elements that is
 * (n − 1) + n + (n − 1) + 2 = 3n frames: 24 for n = 8.
 *
 * The lecture's instance (lecture 3, slide 285), the first view:
 * A[1 : 8] = 7, 6, 3, 4, 2, 5, 2, 1. Its merges, in the order they run:
 * A[1 : 2] = 6, 7; A[3 : 4] = 3, 4; A[1 : 4] = 3, 4, 6, 7; A[5 : 6] = 2, 5;
 * A[7 : 8] = 1, 2; A[5 : 8] = 1, 2, 2, 5; A[1 : 8] = 1, 2, 2, 3, 4, 5, 6, 7.
 * The tree has four rows (depth 0–3); rows 0, 1 and 2 each merge all 8
 * elements (the counts end at 8, 8, 8), row 3 holds the eight base cases and
 * merges nothing. The rows fill up at frames 21 (row 2), 22 (row 1) and 23
 * (row 0). Later instances are random values 1–9 (duplicates allowed); for n
 * not a power of 2 the halves are uneven (q = ⌊(p + r)/2⌋, as in the code),
 * the tree has ⌈lg n⌉ + 1 rows and the deepest merging row places fewer than
 * n (n = 5: 5, 5 and 2).
 *
 * The drawing is the recursion tree as rows, one row per depth, depth 0 (the
 * whole table) at the top, with columns aligned by index: element position t
 * has the same x in every row, so a call on A[p : r] sits directly under the
 * part of its parent it came from. The indices 1 … n stand once, above the
 * top row. Each call is a thin frame around its cards; a call that has been
 * made but not started yet is an empty dashed frame. A call's cards are the
 * values A[p : r] holds when the call starts (the instance it receives); its
 * merge replaces them with the merged segment, and the children's cards are
 * then drawn used up (dashed, faint), because their elements moved up. At the
 * right end of each row, a small number counts the elements merges on that
 * row have placed so far (shown once it is not 0).
 *
 * The cards are module 01's and Merge's (innsetting.js, merge.js): the height
 * follows the value and the value stands at the top, so a sorted segment reads
 * as a rising staircase. Indices are 1-based in every visible text, and a run
 * of the array is written A[1 : 8] with no-break spaces, as the lecture does.
 * The variable strip shows the running call's p, q and r; «–» means that call
 * has no q (a base case, or the start). Size 2–8.
 *
 * Colours are framework tokens only, so frames re-theme on the light/dark
 * toggle. Accent = the running call (its frame) and, on a merge frame, the
 * merged cards; used up = dashed faint; green = the sorted table, on the last
 * frame only.
 */

/** The lecture's instance (slide 285), which the module text also uses. */
const FIRST = [7, 6, 3, 4, 2, 5, 2, 1];

/** `size` random values from 1–9, duplicates allowed. */
function dealt(size) {
  return Array.from({ length: size }, () => 1 + Math.floor(Math.random() * 9));
}

// The first view must be the lecture's instance (the module text describes
// it), also when the reader comes back to the page. Same detection as
// innsetting.js: a call while one of this module's ready figures has not drawn
// yet is that figure's first load; otherwise only the very first call.
const SELF = new URL(import.meta.url).pathname;
const drawn = new WeakSet();
let calls = 0;
function firstLoad() {
  if (typeof document === "undefined") return false;
  for (const fig of document.querySelectorAll("[data-stepper-src]")) {
    if (new URL(fig.dataset.stepperSrc, location.href).pathname !== SELF) continue;
    const stage = fig.querySelector(".stepper-stage");
    if (fig.dataset.ready === "true" && stage && !drawn.has(stage)) return true;
  }
  return false;
}

const NB = " ";
const seg = (a, b) => `A[${a}${NB}:${NB}${b}]`;
const list = (xs) => xs.join(", ");
/** «5 og 2», «5, 5 og 2». */
const og = (xs) => (xs.length < 2 ? xs.join("") : `${xs.slice(0, -1).join(", ")} og ${xs[xs.length - 1]}`);

const FONT = "font-family:var(--font-mono)";

/** Card styles as in innsetting.js and merge.js: fill, outline, outline width, value colour. */
const CARD = {
  plain: { fill: "color-mix(in srgb, var(--fg) 9%, transparent)", stroke: "color-mix(in srgb, var(--fg) 28%, transparent)", wdt: 1, text: "var(--fg)" },
  placed: { fill: "color-mix(in srgb, var(--accent) 16%, transparent)", stroke: "var(--accent)", wdt: 2.6, text: "var(--accent-ink)" },
  done: { fill: "color-mix(in srgb, var(--green) 26%, transparent)", stroke: "var(--green)", wdt: 1.5, text: "var(--fg)" },
  used: { fill: "none", stroke: "var(--faint)", wdt: 1.2, text: "var(--faint)", dash: "4 3" },
};
/** Frames around a call's cards. */
const FRAME = {
  pending: { stroke: "color-mix(in srgb, var(--fg) 34%, transparent)", wdt: 1.2, dash: "4 3" },
  live: { stroke: "color-mix(in srgb, var(--fg) 34%, transparent)", wdt: 1.2 },
  running: { stroke: "var(--accent)", wdt: 2.4 },
  used: { stroke: "color-mix(in srgb, var(--fg) 16%, transparent)", wdt: 1 },
};

const f1 = (v) => v.toFixed(1);

/** The calls of Merge-Sort(A, 1, n) in the order they start, with their depth and halves. */
function tree(n) {
  const out = [];
  const build = (p, r, d) => {
    const c = { id: out.length, p, r, d, q: null, kids: null };
    out.push(c);
    if (p < r) {
      c.q = Math.floor((p + r) / 2);
      c.kids = [build(p, c.q, d + 1), build(c.q + 1, r, d + 1)];
    }
    return c.id;
  };
  build(1, n, 0);
  return out;
}

export default {
  sizeRange: { min: 2, max: 8, default: 8 },
  defaultData(size = 8) {
    if (calls++ === 0 || firstLoad()) return [...FIRST];
    return dealt(size);
  },

  run(input) {
    const A = [...input];
    const n = A.length;
    const T = tree(n);
    const depth = Math.max(...T.map((c) => c.d));
    const lo = Math.min(...A);
    const hi = Math.max(...A);
    const frames = [];

    // One state per call: st is hidden | pending | live | used; vals are the
    // cards it shows; mark is plain | placed | done.
    const S = T.map(() => ({ st: "hidden", vals: null, mark: "plain" }));
    const count = Array(depth + 1).fill(0);
    // Each row's final count, to say when a row has placed all n.
    const total = Array(depth + 1).fill(0);
    const merges = Array(depth + 1).fill(0);
    for (const c of T) if (c.kids) {
      total[c.d] += c.r - c.p + 1;
      merges[c.d] += 1;
    }
    let running = 0;
    let vp = 1;
    let vq = "–";
    let vr = n;
    let firstSplit = true;

    const snap = (line, desc, extra = {}) =>
      frames.push({
        line,
        desc,
        vars: { p: vp, q: vq, r: vr },
        n,
        depth,
        lo,
        hi,
        running,
        calls: T.map((c, k) => ({ p: c.p, r: c.r, d: c.d, ...S[k], vals: S[k].vals ? [...S[k].vals] : null })),
        count: [...count],
        ...extra,
      });

    S[0].st = "live";
    S[0].vals = A.slice(0, n);
    snap(1, `Merge-Sort(A, 1, ${n}) skal sortere ${seg(1, n)} = ${list(A)}.`);

    const sort = (id) => {
      const c = T[id];
      running = id;
      vp = c.p;
      vr = c.r;
      vq = "–";
      S[id].st = "live";
      S[id].vals = A.slice(c.p - 1, c.r);
      if (!c.kids) {
        snap(
          [2, 3],
          `p = r = ${c.p}, så ${seg(c.p, c.r)} = ${A[c.p - 1]} er et grunntilfelle. Ett element er allerede sortert.`,
        );
        return;
      }
      vq = c.q;
      const [a, b] = c.kids;
      S[a].st = "pending";
      S[b].st = "pending";
      snap(
        4,
        `q = ${c.q}, så ${seg(c.p, c.r)} deles i ${seg(c.p, c.q)} og ${seg(c.q + 1, c.r)}.` +
          (firstSplit ? " Ingen elementer flyttes." : ""),
      );
      firstSplit = false;
      sort(a);
      sort(b);

      // Merge: the two sorted halves, the smaller front first, ties from the left.
      const L = A.slice(c.p - 1, c.q);
      const R = A.slice(c.q, c.r);
      let i = 0;
      let j = 0;
      for (let k = c.p - 1; k < c.r; k++) A[k] = j >= R.length || (i < L.length && L[i] <= R[j]) ? L[i++] : R[j++];
      running = id;
      vp = c.p;
      vq = c.q;
      vr = c.r;
      S[id].vals = A.slice(c.p - 1, c.r);
      S[id].mark = "placed";
      S[a].st = "used";
      S[b].st = "used";
      const m = c.r - c.p + 1;
      count[c.d] += m;
      // A row below the top that has just placed all n says so; the top row
      // has one merge, and the end frame sums the rows.
      const full = c.d > 0 && count[c.d] === total[c.d] && total[c.d] === n;
      snap(
        7,
        `Merge(A, ${c.p}, ${c.q}, ${c.r}) fletter de to delsvarene til ${seg(c.p, c.r)} = ${list(S[id].vals)}.` +
          (full
            ? ` ${`De ${merges[c.d]} flettingene`} på dette nivået har nå plassert alle ${n} elementene.`
            : ""),
      );
      S[id].mark = "plain";
    };
    sort(0);

    running = null;
    vp = 1;
    vq = T[0].q ?? "–";
    vr = n;
    S[0].mark = "done";
    const rows = total.filter((x) => x > 0);
    const sum = rows.reduce((x, y) => x + y, 0);
    const tally = n === 2
      ? "Flettingen plasserte begge elementene."
      : rows.every((x) => x === n)
        ? `Flettingene plasserte ${n} elementer på hvert av de ${rows.length} nivåene, ${sum} i alt.`
        : `Flettingene på de ${rows.length} nivåene plasserte ${og(rows)} elementer, ${sum} i alt.`;
    snap(1, `Merge-Sort(A, 1, ${n}) er ferdig, og ${seg(1, n)} = ${list(A)} er sortert. ${tally}`, { done: true });

    return frames;
  },

  render(stage, f, api) {
    drawn.add(stage);
    const { w, h } = api.getSize();
    const n = f.n;
    if (!n || w <= 0 || h <= 0) {
      stage.innerHTML = "";
      return;
    }

    // Type sizes in px, read from the root so the layout follows the reader's
    // text size. IBM Plex Mono advances 0.6 em per glyph.
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    const fsSm = 0.84 * rem;
    const fsXs = 0.72 * rem;
    const textW = (str, fs) => String(str).length * 0.6 * fs;
    const XS = `${FONT};font-size:var(--text-xs)`;
    const SM = `${FONT};font-size:var(--text-sm);font-weight:600`;

    // Horizontal: n slots, then the count column; the block is centred.
    const PADX = 2;
    const CNT = textW(String(n), fsXs) + 10;
    const s = Math.min(52, (w - 2 * PADX - CNT) / n);
    const sep = Math.max(7, s * 0.26);
    const cw = s - sep;
    const FP = 1.5; // a frame stands this far outside its cards, so neighbours keep a clear gap
    const x0 = (w - (n * s + CNT)) / 2;
    const xCard = (t) => x0 + (t - 1) * s + sep / 2;

    // Vertical: the index row, then one row per depth. A row is a frame
    // around cards standing on the row's floor; B is the tallest card.
    const TOP = 4;
    const IDX = fsXs + 7;
    const rows = f.depth + 1;
    const FPV = 4;
    const G = rows > 1 ? Math.max(10, Math.min(18, (h - 8 - IDX) * 0.05)) : 0;
    const MIN_H = Math.round(fsSm * 1.9);
    const B = Math.max(MIN_H + 8, Math.min(78, (h - 8 - IDX - (rows - 1) * G) / rows - 2 * FPV));
    const block = IDX + rows * (B + 2 * FPV) + (rows - 1) * G;
    const top = TOP + Math.max(0, (h - 8 - block) / 2);
    const rowTop = (d) => top + IDX + d * (B + 2 * FPV + G) + FPV;
    const floor = (d) => rowTop(d) + B;
    const span = f.hi - f.lo;
    const height = (v) => MIN_H + (span > 0 ? ((v - f.lo) / span) * (B - MIN_H) : (B - MIN_H) / 2);
    const VAL = cw < 18 ? `${FONT};font-size:var(--text-xs);font-weight:600` : SM;
    const valDy = Math.min(18, MIN_H - 7);

    let svg = "";
    const text = (x, y, str, style, anchor = "middle") =>
      (svg += `<text x="${f1(x)}" y="${f1(y)}" text-anchor="${anchor}" style="${style}">${str}</text>`);
    const rect = (x, y, wd, ht, fill, st, rx = 4) =>
      (svg +=
        `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(wd)}" height="${f1(ht)}" rx="${rx}" ` +
        `style="fill:${fill};stroke:${st.stroke}" stroke-width="${st.wdt}"` +
        `${st.dash ? ` stroke-dasharray="${st.dash}"` : ""}/>`);

    // The indices, once, over the top row.
    for (let t = 1; t <= n; t++) text(xCard(t) + cw / 2, top + fsXs, t, `fill:var(--faint);${XS}`);

    // The calls: frame, then cards. The running call is drawn last, so its
    // accent frame is never covered by a neighbour's.
    const order = f.calls.map((_, k) => k).filter((k) => k !== f.running);
    if (f.running != null) order.push(f.running);
    for (const k of order) {
      const c = f.calls[k];
      if (c.st === "hidden") continue;
      const fx = xCard(c.p) - FP;
      const fw = xCard(c.r) + cw + FP - fx;
      const fy = rowTop(c.d) - FPV;
      const fh = B + 2 * FPV;
      const fst = k === f.running ? FRAME.running : c.st === "used" ? FRAME.used : c.st === "pending" ? FRAME.pending : FRAME.live;
      rect(fx, fy, fw, fh, "none", fst, 5);
      if (!c.vals) continue;
      const cst = c.st === "used" ? CARD.used : CARD[c.mark];
      c.vals.forEach((v, t0) => {
        const x = xCard(c.p + t0);
        const ht = height(v);
        const y = floor(c.d) - ht;
        rect(x, y, cw, ht, cst.fill, cst);
        text(x + cw / 2, y + valDy, v, `fill:${cst.text};${VAL}`);
      });
    }

    // How many elements the merges on each row have placed so far.
    const cx = x0 + n * s + 6;
    f.count.forEach((m, d) => {
      if (m > 0) text(cx, rowTop(d) + B / 2 + 0.35 * fsXs, m, `fill:var(--muted);${XS}`, "start");
    });

    stage.innerHTML =
      `<svg width="100%" height="100%" viewBox="0 0 ${w.toFixed(0)} ${h.toFixed(0)}" ` +
      `preserveAspectRatio="none" role="img" aria-hidden="true" style="display:block">${svg}</svg>`;
  },
};
