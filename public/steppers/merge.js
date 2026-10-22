/**
 * Merge, for <Stepper>, driving the block `merge-kode` in modul 04. The one
 * idea: both halves are sorted, so the smallest element not yet placed stands
 * first in L or first in R. One comparison picks it, and each round of the
 * loop places exactly one element, so Merge makes r − p + 1 comparisons. When
 * one half is used up, its front is the sentinel ∞, which is larger than
 * every value, so the rest comes from the other half without a separate test.
 *
 * Block line numbers count the header as line 1 (pseudocode line k is block
 * line k + 1), the lecturer's version (lecture 3, slides 191–233):
 *    1 Merge(A, p, q, r)
 *    2 1  copy into L and R
 *    3 2  for k = p to r
 *    4 3      if L[i] ≤ R[j]
 *    5 4          A[k] = L[i]
 *    6 5          i = i + 1
 *    7 6      else A[k] = R[j]
 *    8 7          j = j + 1
 * Line 1 copies A[p : q] into L[1 : n₁] and A[q + 1 : r] into R[1 : n₂], sets
 * L[n₁ + 1] = R[n₂ + 1] = ∞ and i = j = 1. The lecture calls L and R two
 * queues: «Neste i venstre «kø» rykker frem».
 *
 * Frames: the start (line 1: A holds the two sorted halves, with p, q and r
 * under the indices), the copy (line 2: L and R appear, A's slots empty),
 * then two per k: the comparison (line 4: the fronts L[i] and R[j] outlined,
 * the slot A[k] waiting) and the placement (lines 5–6 or 7–8: the card stands
 * in A[k], its copy in L or R is used up, the pointer moves on), and the end
 * (line 3: k = r + 1, A[p : r] green). That is 2n + 3 frames: 19 for n = 8.
 *
 * The lecture's instance (CLRS fig. 2.3's numbers), the first view:
 * A[1 : 8] = 2, 4, 5, 7, 1, 2, 3, 6, p = 1, q = 4, r = 8, so
 * L = 2 4 5 7 ∞ and R = 1 2 3 6 ∞. The placements take R, L (the tie 2 ≤ 2
 * goes to L), R, R, L, L, R, L; R is used up before the last round, so the
 * last comparison is L[4] = 7 ≤ R[5] = ∞. Result 1, 2, 2, 3, 4, 5, 6, 7 after
 * 8 comparisons. Later instances are two sorted halves of random values 1–9
 * (duplicates allowed, so a tie shows that ≤ takes from L), ⌈n/2⌉ and ⌊n/2⌋
 * elements as Merge-Sort's split q = ⌊(p + r)/2⌋ gives them.
 *
 * The drawing is CLRS fig. 2.3's: A on top, L and R side by side under it.
 * The cards are module 01's (innsetting.js): the height follows the value and
 * the value stands at the top, so a sorted run reads as a rising staircase,
 * one height scale for all three rows. ∞ is a card of its own: taller than
 * every value, with a double outline. An empty slot of A is a low dashed
 * socket with no value; a card that has been placed in A is drawn used up
 * (dashed faint outline, faint value) where it stood in L or R, so the reader
 * sees how much of each half is left. Every pointer is named under the index
 * it holds, as in innsetting.js: «k» under the slot of A being written, «i»
 * and «j» under the fronts of L and R, and on the start frame p, q and r
 * (violet, the bounds of the call) in k's row. A «k» over the row stood far
 * above the low empty slot and did not read as pointing at it. Brackets
 * «sortert» over the two halves on the start frame are the precondition.
 *
 * Indices are 1-based in every visible text, and a run of the array is
 * written A[1 : 8] with no-break spaces, as the lecture does. Size 2–8.
 *
 * Colours are framework tokens only, so frames re-theme on the light/dark
 * toggle. Accent = the slot A[k] being written and the card just placed
 * there; orange outline = the two fronts being compared; orange fill = the
 * cards that moved in this step (the copy into L and R); green = the merged
 * A[p : r], on the last frame only.
 */

/** The lecture's instance, which the module text also uses. */
const FIRST = [2, 4, 5, 7, 1, 2, 3, 6];
const INF = "∞";

/** `m` random values from 1–9, sorted. */
function sortedRun(m) {
  return Array.from({ length: m }, () => 1 + Math.floor(Math.random() * 9)).sort((a, b) => a - b);
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

const FONT = "font-family:var(--font-mono)";

/** Card styles as in innsetting.js: fill, outline, outline width, value colour. */
const CARD = {
  plain: { fill: "color-mix(in srgb, var(--fg) 9%, transparent)", stroke: "color-mix(in srgb, var(--fg) 28%, transparent)", wdt: 1, text: "var(--fg)" },
  compared: { fill: "color-mix(in srgb, var(--fg) 9%, transparent)", stroke: "var(--orange)", wdt: 2.5, text: "var(--fg)" },
  moved: { fill: "color-mix(in srgb, var(--orange) 34%, transparent)", stroke: "var(--orange)", wdt: 1.5, text: "var(--fg)" },
  placed: { fill: "color-mix(in srgb, var(--accent) 16%, transparent)", stroke: "var(--accent)", wdt: 2.6, text: "var(--accent-ink)" },
  done: { fill: "color-mix(in srgb, var(--green) 26%, transparent)", stroke: "var(--green)", wdt: 1.5, text: "var(--fg)" },
  used: { fill: "none", stroke: "var(--faint)", wdt: 1.2, text: "var(--faint)", dash: "4 3" },
};
/** An empty slot of A, and the one being written. */
const SLOT = {
  empty: { fill: "none", stroke: "color-mix(in srgb, var(--fg) 30%, transparent)", wdt: 1.2, dash: "4 3" },
  now: { fill: "color-mix(in srgb, var(--accent) 8%, transparent)", stroke: "var(--accent)", wdt: 2, dash: "4 3" },
};

const f1 = (v) => v.toFixed(1);

export default {
  sizeRange: { min: 2, max: 8, default: 8 },
  defaultData(size = 8) {
    if (calls++ === 0 || firstLoad()) return [...FIRST];
    return [...sortedRun(Math.ceil(size / 2)), ...sortedRun(Math.floor(size / 2))];
  },

  run(input) {
    const A0 = [...input];
    const n = A0.length;
    const p = 1;
    const r = n;
    const q = Math.floor((p + r) / 2);
    const n1 = q - p + 1;
    const n2 = r - q;
    const L = [...A0.slice(0, n1), INF];
    const R = [...A0.slice(n1), INF];
    const lo = Math.min(...A0);
    const hi = Math.max(...A0);
    const frames = [];

    // aRow[t]: A[t + 1] as { v, st }, or null for an empty slot.
    let aRow = A0.map((v) => ({ v, st: "plain" }));
    let i = 1;
    let j = 1;
    let vk = "–";
    let vi = "–";
    let vj = "–";
    const snap = (line, desc, extra = {}) =>
      frames.push({
        line,
        desc,
        vars: { k: vk, i: vi, j: vj },
        n,
        n1,
        n2,
        q,
        lo,
        hi,
        L,
        R,
        aRow: aRow.map((c) => (c ? { ...c } : null)),
        ...extra,
      });

    snap(
      1,
      `${seg(p, q)} = ${list(A0.slice(0, n1))} og ${seg(q + 1, r)} = ${list(A0.slice(n1))} er sortert hver for seg. ` +
        `Merge(A, ${p}, ${q}, ${r}) skal flette dem sammen i ${seg(p, r)}.`,
      { start: true },
    );

    aRow = A0.map(() => null);
    vi = 1;
    vj = 1;
    snap(
      2,
      `Halvdelene kopieres til L og R, med vaktposten ∞ bakerst i hver. Nå kan ${seg(p, r)} skrives over.`,
      { lr: true, copied: true, i, j },
    );

    let lOut = false;
    let rOut = false;
    for (let k = p; k <= r; k++) {
      vk = k;
      const li = L[i - 1];
      const rj = R[j - 1];
      aRow = aRow.map((c) => (c ? { v: c.v, st: "plain" } : null));
      let lead = "";
      if (li === INF && !lOut) {
        lOut = true;
        lead = `L er brukt opp. L[${i}] = ∞ er større enn alle verdier, så resten tas fra R, og R[${j}] = ${rj} skal til A[${k}].`;
      } else if (rj === INF && !rOut) {
        rOut = true;
        lead = `R er brukt opp. R[${j}] = ∞ er større enn alle verdier, så resten tas fra L, og L[${i}] = ${li} skal til A[${k}].`;
      }
      snap(4, lead || `Den minste av L[${i}] = ${li} og R[${j}] = ${rj} skal til A[${k}].`, {
        lr: true,
        i,
        j,
        k,
        cmp: true,
      });

      // L[i] ≤ R[j], with ∞ larger than every value (never both ∞ here).
      const takeL = rj === INF || (li !== INF && li <= rj);
      if (takeL) {
        aRow[k - 1] = { v: li, st: "placed" };
        const tie = li === rj ? " Ved like verdier tas elementet fra L, fordi testen er ≤." : "";
        i += 1;
        vi = i;
        snap(
          [5, 6],
          `L[${i - 1}] = ${li} ≤ R[${j}] = ${rj}, så A[${k}] = L[${i - 1}] = ${li}, og i rykker fram.${tie}`,
          { lr: true, i, j, k },
        );
      } else {
        aRow[k - 1] = { v: rj, st: "placed" };
        j += 1;
        vj = j;
        snap(
          [7, 8],
          `L[${i}] = ${li} > R[${j - 1}] = ${rj}, så A[${k}] = R[${j - 1}] = ${rj}, og j rykker fram.`,
          { lr: true, i, j, k },
        );
      }
    }

    vk = r + 1;
    aRow = aRow.map((c) => ({ v: c.v, st: "done" }));
    snap(
      3,
      `k = ${r + 1} er større enn r = ${r}, så for-løkka er ferdig. ${seg(p, r)} er sortert etter ${n} ` +
        `${n === 1 ? "sammenligning" : "sammenligninger"}, én per element.`,
      { lr: true, i, j, done: true },
    );

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
    const XS = `${FONT};font-size:var(--text-xs)`;
    const SM = `${FONT};font-size:var(--text-sm);font-weight:600`;

    // Horizontal: L (n₁ + 1 slots), a gap, R (n₂ + 1 slots) fill the width;
    // A (n slots) is centred over them with the same slot width, so a value
    // is the same card in every row.
    const PADX = 2;
    const GAP = 0.8; // between L and R, in slots
    const cols = f.n1 + 1 + GAP + f.n2 + 1;
    const s = Math.min(52, (w - 2 * PADX) / cols);
    const sep = Math.max(3, s * 0.14);
    const cw = s - sep;
    const x0 = (w - cols * s) / 2;
    const xL = (t) => x0 + (t - 1) * s + sep / 2;
    const xR = (t) => x0 + (f.n1 + 1 + GAP + t - 1) * s + sep / 2;
    const xA0 = (w - n * s) / 2;
    const xA = (t) => xA0 + (t - 1) * s + sep / 2;

    // Vertical, top to bottom: the start's brackets «sortert», A's cards, A's
    // indices, A's pointer row (p, q, r on the start frame, then «k»), the
    // titles «L» and «R», their cards, their indices, «i» and «j». Every
    // pointer stands under the index it holds, as in innsetting.js. ∞ is the
    // full card height H; the largest value stands a step lower, so ∞ reads as
    // larger than all.
    const TOP = 4;
    const BR_BAND = fsXs + 14;
    const IDX = fsXs + 5;
    const PTR = fsSm + 6;
    const GAP_V = 10;
    const TITLE = fsSm + 6;
    const fixed = TOP + BR_BAND + IDX + PTR + GAP_V + TITLE + IDX + PTR + 6;
    const STEP = 0.82; // largest value / ∞
    const H = Math.max(60, Math.min(132, (h - fixed) / (1 + STEP)));
    const HV = STEP * H;
    const MIN_H = Math.round(fsSm * 1.9);
    const block = fixed + H + HV;
    const top = TOP + Math.max(0, (h - block) / 2);
    const aTop = top + BR_BAND;
    const aFloor = aTop + HV;
    const aIdx = aFloor + fsXs + 3;
    const aPtr = aIdx + fsSm + 4;
    const lrTitle = aPtr + GAP_V + TITLE - 2;
    const lrFloor = lrTitle + 6 + H;
    const lrIdx = lrFloor + fsXs + 3;
    const lrPtr = lrIdx + fsSm + 4;
    const span = f.hi - f.lo;
    const height = (v) =>
      v === INF ? H : MIN_H + (span > 0 ? ((v - f.lo) / span) * (HV - MIN_H) : (HV - MIN_H) / 2);
    const VAL = cw < 18 ? `${FONT};font-size:var(--text-xs);font-weight:600` : SM;
    const valDy = Math.min(18, MIN_H - 7);
    const INF_VAL = `${FONT};font-size:calc(var(--text-sm) * 1.35);font-weight:600`;

    let svg = "";
    const text = (x, y, str, style, anchor = "middle") =>
      (svg += `<text x="${f1(x)}" y="${f1(y)}" text-anchor="${anchor}" style="${style}">${str}</text>`);
    const rect = (x, y, wd, ht, st, rx = 4) =>
      (svg +=
        `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(wd)}" height="${f1(ht)}" rx="${rx}" ` +
        `style="fill:${st.fill};stroke:${st.stroke}" stroke-width="${st.wdt}"` +
        `${st.dash ? ` stroke-dasharray="${st.dash}"` : ""}/>`);
    // A card standing on `floor`; ∞ gets a second outline inside the first.
    const card = (x, floor, v, st) => {
      const ht = height(v);
      const y = floor - ht;
      rect(x, y, cw, ht, st);
      if (v === INF) {
        const ins = 3;
        rect(x + ins, y + ins, cw - 2 * ins, ht - 2 * ins, { fill: "none", stroke: "color-mix(in srgb, var(--fg) 28%, transparent)", wdt: 1 }, 2);
      }
      text(x + cw / 2, y + valDy, v, `fill:${st.text};${v === INF ? INF_VAL : VAL}`);
    };
    const bracket = (a, b, y, label) => {
      const tick = 6;
      svg +=
        `<path d="M ${f1(a)} ${f1(y + tick)} V ${f1(y)} H ${f1(b)} V ${f1(y + tick)}" fill="none" ` +
        `stroke="var(--fg)" stroke-width="1.5"/>`;
      text((a + b) / 2, y - 5, label, `fill:var(--fg);${XS}`);
    };

    // A: its name, the cards or empty slots, the indices.
    text(xA(1) - 7, aFloor - 4, "A", `fill:var(--fg);${SM}`, "end");
    svg +=
      `<line x1="${f1(xA(1) - 3)}" y1="${f1(aFloor)}" x2="${f1(xA(n) + cw + 3)}" y2="${f1(aFloor)}" ` +
      `stroke="var(--border-strong)" stroke-width="1"/>`;
    for (let t = 1; t <= n; t++) {
      const c = f.aRow[t - 1];
      if (c) card(xA(t), aFloor, c.v, CARD[c.st]);
      else {
        const sh = Math.round(MIN_H * 0.8);
        rect(xA(t), aFloor - sh, cw, sh, f.cmp && f.k === t ? SLOT.now : SLOT.empty);
      }
      text(xA(t) + cw / 2, aIdx, t, `fill:var(--faint);${XS}`);
    }

    // The start: the two sorted halves, and p, q, r under their indices.
    if (f.start) {
      const by = top + fsXs + 4;
      bracket(xA(1), xA(f.q) + cw, by, "sortert");
      if (f.q < n) bracket(xA(f.q + 1), xA(n) + cw, by, "sortert");
      const py = aPtr;
      const names = new Map();
      for (const [nm, t] of [["p", 1], ["q", f.q], ["r", n]]) names.set(t, names.has(t) ? `${names.get(t)},${nm}` : nm);
      for (const [t, nm] of names) text(xA(t) + cw / 2, py, nm, `fill:var(--violet);${SM}`);
    }

    // «k» under the slot being written.
    if (f.k != null && !f.done) text(xA(f.k) + cw / 2, aPtr, "k", `fill:var(--accent);${SM}`);

    // L and R.
    if (f.lr) {
      text(xL(1), lrTitle, "L", `fill:var(--fg);${SM}`, "start");
      text(xR(1), lrTitle, "R", `fill:var(--fg);${SM}`, "start");
      const row = (vals, xOf, front) => {
        svg +=
          `<line x1="${f1(xOf(1) - 3)}" y1="${f1(lrFloor)}" x2="${f1(xOf(vals.length) + cw + 3)}" y2="${f1(lrFloor)}" ` +
          `stroke="var(--border-strong)" stroke-width="1"/>`;
        vals.forEach((v, t0) => {
          const t = t0 + 1;
          let st = CARD.plain;
          if (v !== INF) {
            if (t < front) st = CARD.used;
            else if (f.copied) st = CARD.moved;
          }
          if (f.cmp && t === front) st = { ...CARD.compared, fill: st.fill };
          card(xOf(t), lrFloor, v, st);
          text(xOf(t) + cw / 2, lrIdx, t, `fill:var(--faint);${XS}`);
        });
      };
      row(f.L, xL, f.i);
      row(f.R, xR, f.j);
      text(xL(f.i) + cw / 2, lrPtr, "i", `fill:var(--muted);${SM}`);
      text(xR(f.j) + cw / 2, lrPtr, "j", `fill:var(--muted);${SM}`);
    }

    stage.innerHTML =
      `<svg width="100%" height="100%" viewBox="0 0 ${w.toFixed(0)} ${h.toFixed(0)}" ` +
      `preserveAspectRatio="none" role="img" aria-hidden="true" style="display:block">${svg}</svg>`;
  },
};
