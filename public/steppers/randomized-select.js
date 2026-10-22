/**
 * Randomized-Select on a row of cards, for <Stepper>, driving the block
 * `randomized-select-kode` in modul 05. The one idea: Randomized-Partition
 * puts the pivot in its final place q, so the pivot's rank in the segment is
 * known without sorting, k = q − p + 1. If k = i, the pivot is the answer.
 * Otherwise the answer is among the small elements, where it still has rank i,
 * or among the large ones, where k elements fewer lie below it, so it has rank
 * i − k there; only that side is searched further, like binary search. The
 * answer's place never moves: it is p + i − 1, where rank i of the segment
 * stands once the segment is sorted, and going right adds k to p and takes k
 * from i, so p + i − 1 is the same column in every call. The answer ends
 * exactly there (a pivot with k = i stands at q = p + i − 1; a one-element
 * segment has p = r and i = 1).
 *
 * Block line numbers count the header as line 1 (pseudocode line k is block
 * line k + 1), the lecture's pseudocode (lecture 4, slides 31–40; CLRS 4th
 * ed. §9.2):
 *     1 Randomized-Select(A, p, r, i)
 *     2 1  if p == r
 *     3 2      return A[p]
 *     4 3  q = Randomized-Partition(A, p, r)
 *     5 4  k = q - p + 1
 *     6 5  if i == k
 *     7 6      return A[q]
 *     8 7  elseif i < k
 *     9 8      return Randomized-Select(A, p, q - 1, i)
 *    10 9  else return Randomized-Select(A, q + 1, r, i - k)
 * Randomized-Partition(A, p, r) = t = Random(p, r); exchange A[r] with A[t];
 * Partition(A, p, r), the lecture's (Lomuto) Partition exactly as in
 * partition.js.
 *
 * Frames: the start (line 1). Then per call on two or more elements: the
 * random choice (line 4: «Random(1, 8) = 8», the chosen element swapped into
 * A[r], marked «x» with the dashed pivot line across the segment), the
 * partitioned segment (line 4 again: the pivot green at q, brackets «≤ x» and
 * «> x»), k (line 5), the test i == k (line 6), and then either the answer
 * (line 7) or the test i < k (line 8) and the next call (line 9 or 10: the
 * side that is left stays, the pivot and the other side go out of play). A
 * call on one element is one frame (lines 2–3). The start frame stands for
 * the first call; the line 9/10 frame for each later one.
 *
 * The first instance is the lecture's (lecture 4, slides 41–53):
 * A[1 : 8] = 4, 6, 8, 3, 2, 5, 7, 1, i = 4, Random returns 8 both times.
 * The first pivot is A[8] = 1 (a swap with itself); Partition finds no small
 * elements and puts 1 in A[1]: q = 1, k = 1, A = 1, 6, 8, 3, 2, 5, 7, 4.
 * i = 4 > 1, so rank 4 − 1 = 3 is searched for in A[2 : 8]. The second pivot
 * is A[8] = 4; Partition gives A[2 : 8] = 3, 2, 4, 8, 5, 7, 6 (the slide 49
 * column), q = 4, k = 4 − 2 + 1 = 3 = i, and the answer is A[4] = 4. That is
 * 12 frames: start; 4, 4, 5, 6, 8, 10; 4, 4, 5, 6, 7. Checked by running this
 * file's run() in node against the slides.
 *
 * Later instances: n distinct random values 1–9 (n from the size slider,
 * 4–8), a random rank i in 1 … n, and the picks Random(p, r) returns, drawn
 * in defaultData by running the search once with Math.random (so every pick
 * lies in its call's range, at most n − 1 of them). run() is deterministic
 * for a given { A, i, picks }; a missing or out-of-range pick counts as r.
 *
 * The drawing is partition.js's: the whole table A[1 : n] as one row of
 * cards, the height follows the value, the value at the top, the 1-based index
 * under the card. The current segment A[p : r] is drawn normally; everything
 * outside it is out of play (dashed faint outline, faint value), so the reader
 * still sees where it is. Under the indices the pointers p and r (violet, the
 * call's bounds, as merge.js draws them) and, once Partition has run, q
 * (accent ink, as partition.js); two names in one slot stand side by side.
 * The target place p + i − 1 is a dashed violet line down the column from a
 * label «i» at the top (violet like p and r: the call's arguments). It stays
 * on the same column through every call; the answer ends on it.
 *
 * Colours are framework tokens only, so frames re-theme on the light/dark
 * toggle. Accent = the pivot (pale accent fill, accent outline, «x», the
 * dashed pivot line) and q; orange fill = the card the random choice swapped
 * out of A[r] (the pivot, which moved into A[r], keeps the accent); green =
 * the pivot in its final place, and the answer (green with the accent
 * outline); out of play = dashed faint. The partition frame shows Partition's
 * result only: the cards it rearranged are not marked as moved (module 04's
 * stepper shows how Partition moves them). Indices are 1-based in every
 * visible text, and a run of the array is written A[1 : 8] with no-break
 * spaces, as the lecture does.
 */

/** The lecture's instance (lecture 4, slides 41–53). */
const FIRST = { A: [4, 6, 8, 3, 2, 5, 7, 1], i: 4, picks: [8, 8] };

/** `size` distinct values from 1–9 in random order. */
function dealt(size) {
  const a = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a.slice(0, size);
}

/**
 * The lecture's Partition on the 1-based table T (T[0] unused), exactly as in
 * partition.js; returns q.
 */
function partition(T, p, r) {
  const x = T[r];
  let i = p - 1;
  for (let j = p; j <= r - 1; j++) {
    if (T[j] <= x) {
      i += 1;
      [T[i], T[j]] = [T[j], T[i]];
    }
  }
  [T[i + 1], T[r]] = [T[r], T[i + 1]];
  return i + 1;
}

/** The picks a run of Randomized-Select on (A, i) needs, drawn with Math.random. */
function drawPicks(A, i0) {
  const T = [0, ...A];
  const picks = [];
  let p = 1;
  let r = A.length;
  let i = i0;
  while (p < r) {
    const t = p + Math.floor(Math.random() * (r - p + 1));
    picks.push(t);
    [T[t], T[r]] = [T[r], T[t]];
    const q = partition(T, p, r);
    const k = q - p + 1;
    if (i === k) break;
    if (i < k) r = q - 1;
    else {
      p = q + 1;
      i -= k;
    }
  }
  return picks;
}

// The first view must be the lecture's instance (the module text describes
// it), also when the reader comes back to the page. Same detection as
// innsetting.js and partition.js: a call while one of this module's ready
// figures has not drawn yet is that figure's first load; otherwise only the
// very first call.
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

const NB = "\u00a0";
const seg = (a, b) => `A[${a}${NB}:${NB}${b}]`;

const FONT = "font-family:var(--font-mono)";

/** Card styles as in partition.js: fill, outline, outline width, value colour. */
const CARD = {
  plain: { fill: "color-mix(in srgb, var(--fg) 9%, transparent)", stroke: "color-mix(in srgb, var(--fg) 28%, transparent)", wdt: 1, text: "var(--fg)" },
  moved: { fill: "color-mix(in srgb, var(--orange) 34%, transparent)", stroke: "var(--orange)", wdt: 1.5, text: "var(--fg)" },
  key: { fill: "color-mix(in srgb, var(--accent) 16%, transparent)", stroke: "var(--accent)", wdt: 2, text: "var(--accent-ink)" },
  done: { fill: "color-mix(in srgb, var(--green) 26%, transparent)", stroke: "var(--green)", wdt: 1.5, text: "var(--fg)" },
  answer: { fill: "color-mix(in srgb, var(--green) 26%, transparent)", stroke: "var(--accent)", wdt: 2.6, text: "var(--fg)" },
  out: { fill: "none", stroke: "var(--faint)", wdt: 1.2, text: "var(--faint)", dash: "4 3" },
};

const f1 = (v) => v.toFixed(1);

export default {
  sizeRange: { min: 4, max: 8, default: 8 },
  defaultData(size = 8) {
    if (calls++ === 0 || firstLoad()) return { A: [...FIRST.A], i: FIRST.i, picks: [...FIRST.picks] };
    const A = dealt(size);
    const i = 1 + Math.floor(Math.random() * size);
    return { A, i, picks: drawPicks(A, i) };
  },

  run(input) {
    const A = [...input.A];
    const n = A.length;
    const picks = input.picks || [];
    const lo = Math.min(...A);
    const hi = Math.max(...A);
    // The answer's place, p + i − 1 of the first call (p = 1).
    const target = input.i;
    const frames = [];
    let p = 1;
    let r = n;
    let i = input.i;
    let vq = "–";
    let vk = "–";
    let next = 0;

    const snap = (line, desc, extra = {}) =>
      frames.push({ line, desc, vars: { p, r, i, q: vq, k: vk }, A: [...A], n, lo, hi, p, r, target, ...extra });

    snap(
      1,
      `Randomized-Select(A, ${p}, ${r}, ${i}) skal finne elementet med rang ${i} i ${seg(p, r)}, ` +
        `det som står på plass ${target} når tabellen er sortert.`,
    );

    for (;;) {
      if (p === r) {
        snap(
          [2, 3],
          `p = r = ${p}, så ${seg(p, r)} har bare ett element, og det må være svaret. ` +
            `A[${p}] = ${A[p - 1]} har rang ${target} i hele tabellen.`,
          { answer: p },
        );
        break;
      }

      // Randomized-Partition, part 1: the random choice, swapped into A[r].
      let t = picks[next++];
      if (!(t >= p && t <= r)) t = r;
      [A[t - 1], A[r - 1]] = [A[r - 1], A[t - 1]];
      const x = A[r - 1];
      snap(
        4,
        t === r
          ? `Random(${p}, ${r}) = ${r}, så A[${r}] bytter plass med seg selv, og x = ${x} er pivoten.`
          : `Random(${p}, ${r}) = ${t}, og A[${t}] bytter plass med A[${r}]. Pivoten er x = ${x}.`,
        { x, piv: r, moved: t === r ? null : [t] },
      );

      // Part 2: Partition, shown as its result: the pivot in its final place
      // and the two parts. The cards Partition rearranged are not marked as
      // moved: how Partition moves them is module 04's stepper; here only
      // where the pivot lands matters, and four orange cards drew the eye away
      // from it.
      const T = [0, ...A];
      const q = partition(T, p, r);
      for (let s = 1; s <= n; s++) A[s - 1] = T[s];
      vq = q;
      const part = {
        x,
        piv: q,
        done: q,
        q,
        small: q > p ? [p, q - 1] : null,
        large: q < r ? [q + 1, r] : null,
      };
      const sides =
        q === p
          ? "Det finnes ingen små elementer, så alle de andre er store."
          : q === r
            ? "Det finnes ingen store elementer, så alle de andre er små."
            : "De små står til venstre for den, og de store til høyre.";
      snap(4, `Randomized-Partition setter pivoten ${x} på sin endelige plass, q = ${q}. ${sides}`, part);

      const k = q - p + 1;
      vk = k;
      snap(5, `k = q − p + 1 = ${q} − ${p} + 1 = ${k}, så pivoten har rang ${k} i ${seg(p, r)}.`, part);

      if (i === k) {
        snap(6, `i = k = ${k}, så pivoten er svaret.`, part);
        snap(7, `Randomized-Select returnerer A[${q}] = ${x}, som har rang ${target} i hele tabellen.`, {
          ...part,
          answer: q,
        });
        break;
      }
      snap(6, `i = ${i} og k = ${k} er forskjellige, så pivoten er ikke svaret.`, part);

      if (i < k) {
        snap(8, `i = ${i} er mindre enn k = ${k}, så svaret er blant de små.`, part);
        r = q - 1;
        vq = "–";
        vk = "–";
        snap(9, `Let etter rang ${i} blant de små, i ${seg(p, r)}.`);
      } else {
        snap(8, `i = ${i} er større enn k = ${k}, så svaret er blant de store.`, part);
        const iOld = i;
        p = q + 1;
        i -= k;
        vq = "–";
        vk = "–";
        snap(
          10,
          `Let etter rang ${iOld} − ${k} = ${i} blant de store, i ${seg(p, r)}. ` +
            `Svaret havner fortsatt på plass ${p} + ${i} − 1 = ${target}.`,
        );
      }
    }

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

    // Vertical bands, top to bottom: the target's name «i», room for «x»
    // over the tallest card, the cards on their baseline, the index row, the
    // pointer row (p, q, r), the brackets with their labels.
    const MARK_Y = fsSm + 2; // baseline of «i»
    const MARK_B = MARK_Y + 5; // where the target line starts
    const TOP = MARK_B + fsSm + 9;
    const IDX_Y = fsXs + 5; // offsets under the baseline
    const PTR_Y = IDX_Y + fsSm + 6;
    const BR_Y = PTR_Y + 11;
    const LBL_Y = BR_Y + fsXs + 4;
    const base = h - (LBL_Y + 5);
    const H = Math.max(60, base - TOP);
    const MIN_H = Math.round(fsSm * 1.95); // room for the value on the shortest card

    // Horizontal: n slots, centred.
    const PAD = 6;
    const slot = Math.min(72, (w - 2 * PAD) / n);
    const x0 = (w - slot * n) / 2;
    const sep = Math.max(3, slot * 0.14);
    const cw = slot - sep;
    const left = (k) => x0 + (k - 1) * slot + sep / 2;
    const mid = (k) => x0 + (k - 0.5) * slot;
    const span = f.hi - f.lo;
    const height = (v) => MIN_H + (span > 0 ? ((v - f.lo) / span) * (H - MIN_H) : H - MIN_H);
    const valDy = Math.min(18, MIN_H - 7);
    const inSeg = (k) => k >= f.p && k <= f.r;

    let svg = "";
    const text = (x, y, s, style, anchor = "middle") =>
      (svg += `<text x="${f1(x)}" y="${f1(y)}" text-anchor="${anchor}" style="${style}">${s}</text>`);

    // The target place: a dashed line down its column, behind the cards, from
    // its name to the baseline. When the pivot stands there, the line stops
    // above the pivot's «x».
    {
      const xm = mid(f.target);
      const top = base - height(f.A[f.target - 1]);
      const end = f.piv === f.target && f.answer !== f.target ? top - fsSm - 6 : base;
      if (end > MARK_B + 2) {
        svg +=
          `<line x1="${f1(xm)}" y1="${f1(MARK_B)}" x2="${f1(xm)}" y2="${f1(end)}" ` +
          `style="stroke:var(--violet)" stroke-width="1.5" stroke-dasharray="4 3"/>`;
      }
      text(xm, MARK_Y, "i", `fill:var(--violet);${SM}`);
    }

    // The pivot's height across the segment, drawn before the cards so they
    // cover it: a small card ends under the line, a large one reaches through.
    if (f.x != null) {
      const y = base - height(f.x);
      svg +=
        `<line x1="${f1(left(f.p) - 5)}" y1="${f1(y)}" x2="${f1(left(f.r) + cw + 5)}" y2="${f1(y)}" ` +
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
      if (f.answer === k) st = CARD.answer;
      else if (!inSeg(k)) st = CARD.out;
      else if (f.done === k) st = CARD.done;
      else if (f.piv === k) st = CARD.key;
      else if (moved.has(k)) st = CARD.moved;
      const ht = height(v);
      const x = left(k);
      const y = base - ht;
      // An opaque underlay in the panel's colour hides the lines behind.
      svg +=
        `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(cw)}" height="${f1(ht)}" rx="4" style="fill:var(--bg-elevated)"/>` +
        `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(cw)}" height="${f1(ht)}" rx="4" ` +
        `style="fill:${st.fill};stroke:${st.stroke}" stroke-width="${st.wdt}"` +
        `${st.dash ? ` stroke-dasharray="${st.dash}"` : ""}/>`;
      text(x + cw / 2, y + valDy, v, `fill:${st.text};${SM}`);
      if (f.piv === k && f.answer !== k) {
        text(x + cw / 2, y - 6, "x", `fill:${f.done === k ? "var(--fg)" : "var(--accent-ink)"};${SM}`);
      }
      text(mid(k), base + IDX_Y, k, `fill:var(--faint);${XS}`);
    }

    // Pointers under the indices: p and r (the call's bounds), q once
    // Partition has run. Two names in one slot stand side by side.
    const names = new Map();
    const put = (k, name, color) => {
      if (!names.has(k)) names.set(k, []);
      names.get(k).push({ name, color });
    };
    put(f.p, "p", "var(--violet)");
    if (f.q != null) put(f.q, "q", "var(--accent-ink)");
    put(f.r, "r", "var(--violet)");
    for (const [k, list] of names) {
      const dx = list.length > 1 ? 0.55 * fsSm : 0;
      list.forEach((nm, t) => text(mid(k) + (t === 0 ? -dx : dx), base + PTR_Y, nm.name, `fill:${nm.color};${SM}`));
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
    bracket(f.small, "≤ x");
    bracket(f.large, "> x");

    stage.innerHTML =
      `<svg width="100%" height="100%" viewBox="0 0 ${w.toFixed(0)} ${h.toFixed(0)}" ` +
      `preserveAspectRatio="none" role="img" aria-hidden="true" style="display:block">${svg}</svg>`;
  },
};
