/**
 * Partition on a row of cards, for <Stepper>, driving the block
 * `partition-kode` in modul 04. The one idea: Partition walks through the
 * segment once with j and keeps it in four parts: the small elements (≤ x) in
 * A[p : i], the large ones (> x) in A[i + 1 : j − 1], the ones not looked at
 * yet in A[j : r − 1], and the pivot x in A[r]. A small A[j] swaps places with
 * the first large element, A[i + 1], so the small part grows by one and the
 * large part moves one place right; a large A[j] just stays, and the large
 * part grows. At the end the pivot swaps into A[i + 1], between the two parts,
 * and that is its final place. Each of the other elements is compared with x
 * once: Θ(n).
 *
 * Block line numbers count the header as line 1 (pseudocode line k is block
 * line k + 1), the pseudocode as CLRS 4th ed. §7.1 and the lecture print it:
 *    1 Partition(A, p, r)
 *    2 1  x = A[r]
 *    3 2  i = p - 1
 *    4 3  for j = p to r - 1
 *    5 4      if A[j] ≤ x
 *    6 5          i = i + 1
 *    7 6          exchange A[i] with A[j]
 *    8 7  exchange A[i + 1] with A[r]
 *    9 8  return i + 1
 *
 * Frames: the start (line 1), x chosen (line 2), i = p − 1 (line 3), then per
 * j the comparison (lines 4–5) and, for a small A[j], the swap (lines 6–7),
 * then the pivot's exchange (line 8) and the return (line 9). That is
 * 3 + (n − 1) + S + 2 frames, S = the number of small elements. The trace
 * always runs on the whole table, p = 1 and r = n.
 *
 * The first instance is the lecture's (lecture 3, slide 386) and CLRS fig.
 * 7.1's: A[1 : 8] = 2, 8, 7, 1, 3, 5, 6, 4 with x = 4. 2, 1 and 3 are small
 * (swaps at j = 1, with itself, j = 4 and j = 5), 8, 7, 5 and 6 large, so the
 * trace is 3 + 7 + 3 + 2 = 15 frames. The pivot ends in A[4], the table reads
 * 2, 1, 3, 4, 7, 5, 6, 8, and Partition returns q = 4 after 7 comparisons.
 * Later instances are distinct random values 1–9, 4–8 of them.
 *
 * The drawing is module 01's cards (innsetting.js): the height follows the
 * value, the value at the top, the 1-based index under the card. The pivot is
 * named «x» over its card, and a dashed line at its height runs across the
 * segment (behind the cards), so a small card ends under the line and a large
 * one reaches through it. Under the indices stand the pointers i and j
 * (i = p − 1 stands left of card 1), and under them the parts as brackets
 * labelled «≤ x» and «> x»; the cards not looked at yet have no bracket. A
 * large A[j] joins the «> x» bracket on its comparison frame (nothing else
 * happens to it); a small one stays outside both brackets until its swap.
 *
 * Colours are framework tokens only, so frames re-theme on the light/dark
 * toggle. Accent = the pivot (pale accent fill, accent outline, the dashed
 * line) and the pointer j; orange outline = A[j], compared with x in this
 * step; orange fill = a card that moved in this step; green = the pivot once
 * it stands in its final place. A swap of a card with itself moves nothing,
 * so it gets no orange fill.
 */

/** The lecture's instance (lecture 3, slide 386; CLRS fig. 7.1). */
const FIRST = [2, 8, 7, 1, 3, 5, 6, 4];

/** `size` distinct values from 1–9 in random order. */
function dealt(size) {
  const a = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a.slice(0, size);
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

const FONT = "font-family:var(--font-mono)";

/** Card styles as in innsetting.js: fill, outline, outline width, value colour. */
const CARD = {
  plain: { fill: "color-mix(in srgb, var(--fg) 9%, transparent)", stroke: "color-mix(in srgb, var(--fg) 28%, transparent)", wdt: 1, text: "var(--fg)" },
  compared: { fill: "color-mix(in srgb, var(--fg) 9%, transparent)", stroke: "var(--orange)", wdt: 2.5, text: "var(--fg)" },
  moved: { fill: "color-mix(in srgb, var(--orange) 34%, transparent)", stroke: "var(--orange)", wdt: 1.5, text: "var(--fg)" },
  key: { fill: "color-mix(in srgb, var(--accent) 16%, transparent)", stroke: "var(--accent)", wdt: 2, text: "var(--accent-ink)" },
  done: { fill: "color-mix(in srgb, var(--green) 26%, transparent)", stroke: "var(--green)", wdt: 1.5, text: "var(--fg)" },
};

const f1 = (v) => v.toFixed(1);

export default {
  sizeRange: { min: 4, max: 8, default: 8 },
  defaultData(size = 8) {
    if (calls++ === 0 || firstLoad()) return [...FIRST];
    return dealt(size);
  },

  run(input) {
    const A = [...input];
    const n = A.length;
    const p = 1;
    const r = n;
    const lo = Math.min(...A);
    const hi = Math.max(...A);
    const frames = [];
    let vx = "–";
    let vi = "–";
    let vj = "–";

    const snap = (line, desc, extra = {}) =>
      frames.push({ line, desc, vars: { x: vx, i: vi, j: vj }, A: [...A], n, lo, hi, ...extra });
    // The parts as 1-based [from, to], null when empty: the small ones
    // A[p : i] and the large ones A[i + 1 : last].
    const parts = (i, last) => ({
      small: i >= p ? [p, i] : null,
      large: last >= i + 1 ? [i + 1, last] : null,
    });

    snap(1, `Partition(A, ${p}, ${r}) skal dele segmentet ${seg(p, r)}.`);

    const x = A[r - 1];
    vx = x;
    snap(2, `x = A[${r}] = ${x} er pivoten. Elementer som er ≤ x, er små, og de som er > x, er store.`, { x, piv: r });

    let i = p - 1;
    vi = i;
    snap(3, `i = ${i}. Partition samler de små i ${seg(p, "i")}, og der står ingen ennå.`, { x, piv: r, i });

    for (let j = p; j <= r - 1; j++) {
      vj = j;
      const v = A[j - 1];
      if (v <= x) {
        snap([4, 5], `A[${j}] = ${v} ≤ x = ${x}, så ${v} er lite.`, { x, piv: r, i, j, compared: j, ...parts(i, j - 1) });
        i += 1;
        vi = i;
        [A[i - 1], A[j - 1]] = [A[j - 1], A[i - 1]];
        snap(
          [6, 7],
          i === j
            ? `i = ${i}. Ingen store er funnet ennå, så A[${i}] bytter plass med seg selv.`
            : `i = ${i}, og A[${i}] bytter plass med A[${j}]. Nå står ${A[i - 1]} sist blant de små, og ${A[j - 1]} står sist blant de store.`,
          { x, piv: r, i, j, moved: i === j ? null : [i, j], ...parts(i, j) },
        );
      } else {
        snap([4, 5], `A[${j}] = ${v} > x = ${x}, så ${v} er stort og blir stående.`, { x, piv: r, i, j, compared: j, ...parts(i, j) });
      }
    }

    // The loop is done: j has run past r − 1.
    vj = r;
    const q = i + 1;
    [A[q - 1], A[r - 1]] = [A[r - 1], A[q - 1]];
    const small = q > p;
    const large = q < r;
    const where = small && large ? "mellom de små og de store" : small ? "etter de små" : "foran de store";
    const after = { x, piv: q, done: q, small: small ? [p, q - 1] : null, large: large ? [q + 1, r] : null };
    snap(
      8,
      q === r
        ? `Løkka er ferdig. Ingen store er funnet, så A[${r}] bytter plass med seg selv, og pivoten ${x} står ${where}, på sin endelige plass.`
        : `Løkka er ferdig, og A[${q}] bytter plass med A[${r}]. Nå står pivoten ${x} ${where}, på sin endelige plass.`,
      { ...after, i, j: r, moved: q === r ? null : [r] },
    );

    const others = n - 1;
    snap(9, `Partition returnerer q = ${q}. Hvert av de ${others} andre elementene ble sammenlignet med x én gang.`, {
      ...after,
      q,
    });

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
    const textW = (s, fs) => s.length * 0.6 * fs;
    const XS = `${FONT};font-size:var(--text-xs)`;
    const SM = `${FONT};font-size:var(--text-sm);font-weight:600`;

    // Vertical bands, top to bottom: room for «x» over the tallest card, the
    // cards on their baseline, the index row, the pointer row (i, j, q), the
    // brackets with their labels.
    const TOP = fsSm + 9;
    const IDX_Y = fsXs + 5; // offsets under the baseline
    const PTR_Y = IDX_Y + fsSm + 6;
    const BR_Y = PTR_Y + 11;
    const LBL_Y = BR_Y + fsXs + 4;
    const base = h - (LBL_Y + 5);
    const H = Math.max(60, base - TOP);
    const MIN_H = Math.round(fsSm * 1.95); // room for the value on the shortest card

    // Horizontal: a left gutter where «i» stands when i = 0, then n slots.
    const GUT_L = 16;
    const PAD_R = 4;
    const slot = Math.min(72, (w - GUT_L - PAD_R) / n);
    const x0 = Math.max(GUT_L, (w - slot * n) / 2);
    const sep = Math.max(3, slot * 0.14);
    const cw = slot - sep;
    const left = (k) => x0 + (k - 1) * slot + sep / 2;
    const mid = (k) => x0 + (k - 0.5) * slot;
    const span = f.hi - f.lo;
    const height = (v) => MIN_H + (span > 0 ? ((v - f.lo) / span) * (H - MIN_H) : H - MIN_H);
    const valDy = Math.min(18, MIN_H - 7);

    let svg = "";
    const text = (x, y, s, style, anchor = "middle") =>
      (svg += `<text x="${f1(x)}" y="${f1(y)}" text-anchor="${anchor}" style="${style}">${s}</text>`);

    // The pivot's height across the segment, drawn first so the cards cover
    // it: a small card ends under the line, a large one reaches through it.
    if (f.x != null) {
      const y = base - height(f.x);
      svg +=
        `<line x1="${f1(left(1) - 5)}" y1="${f1(y)}" x2="${f1(left(n) + cw + 5)}" y2="${f1(y)}" ` +
        `style="stroke:var(--accent)" stroke-width="1.5" stroke-dasharray="5 4"/>`;
    }

    // Baseline under the whole row.
    svg +=
      `<line x1="${f1(left(1) - 5)}" y1="${f1(base)}" x2="${f1(left(n) + cw + 5)}" y2="${f1(base)}" ` +
      `stroke="var(--border-strong)" stroke-width="1"/>`;

    const moved = new Set(f.moved || []);
    for (let k = 1; k <= n; k++) {
      const v = f.A[k - 1];
      let st = CARD.plain;
      if (f.done === k) st = CARD.done;
      else if (f.piv === k) st = CARD.key;
      else if (moved.has(k)) st = CARD.moved;
      else if (f.compared === k) st = CARD.compared;
      const ht = height(v);
      const x = left(k);
      const y = base - ht;
      // An opaque underlay in the panel's colour hides the dashed line.
      svg +=
        `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(cw)}" height="${f1(ht)}" rx="4" style="fill:var(--bg-elevated)"/>` +
        `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(cw)}" height="${f1(ht)}" rx="4" ` +
        `style="fill:${st.fill};stroke:${st.stroke}" stroke-width="${st.wdt}"/>`;
      text(x + cw / 2, y + valDy, v, `fill:${st.text};${SM}`);
      if (f.piv === k) text(x + cw / 2, y - 6, "x", `fill:${f.done === k ? "var(--fg)" : "var(--accent-ink)"};${SM}`);
      text(mid(k), base + IDX_Y, k, `fill:var(--faint);${XS}`);
    }

    // Pointers under the indices; i = 0 stands left of card 1.
    const ptrX = (k) => (k >= 1 ? mid(k) : Math.max(7, mid(1) - slot));
    if (f.q != null) text(mid(f.q), base + PTR_Y, "q", `fill:var(--accent-ink);${SM}`);
    else {
      // When i = j (a small card swapped with itself) the two names share
      // the slot, side by side.
      const dx = f.i === f.j ? 0.55 * fsSm : 0;
      if (f.i != null) text(ptrX(f.i) - dx, base + PTR_Y, "i", `fill:var(--fg);${SM}`);
      if (f.j != null) text(mid(f.j) + dx, base + PTR_Y, "j", `fill:var(--accent);${SM}`);
    }

    // The parts, as brackets under the pointers.
    const bracket = (range, label) => {
      if (!range) return;
      const a = left(range[0]);
      const b = left(range[1]) + cw;
      const tick = 5;
      svg +=
        `<path d="M ${f1(a)} ${f1(base + BR_Y - tick)} V ${f1(base + BR_Y)} H ${f1(b)} V ${f1(base + BR_Y - tick)}" ` +
        `fill="none" style="stroke:var(--muted)" stroke-width="1.5"/>`;
      const lw = textW(label, fsXs);
      const cx = Math.min(w - lw / 2 - 2, Math.max(lw / 2 + 2, (a + b) / 2));
      text(cx, base + LBL_Y, label.replace(">", "&gt;"), `fill:var(--fg);${XS}`);
    };
    bracket(f.small, "≤\u202fx");
    bracket(f.large, ">\u202fx");

    stage.innerHTML =
      `<svg width="100%" height="100%" viewBox="0 0 ${w.toFixed(0)} ${h.toFixed(0)}" ` +
      `preserveAspectRatio="none" role="img" aria-hidden="true" style="display:block">${svg}</svg>`;
  },
};
