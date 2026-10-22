/**
 * Counting-Sort on three rows, for <Stepper>, driving the block
 * `counting-sort-kode` in modul 05. The one idea: first count how many times
 * each value occurs (C[v]); then make C cumulative, so C[v] = the number of
 * elements ≤ v, which is exactly the place of the last v in the sorted table
 * B. So before anything is placed, B is already divided into one block per
 * value. Then go backwards through A: put A[j] at B[C[A[j]]] and decrease
 * C[A[j]], so the next equal value goes one place to the left. Going
 * backwards fills each block from its right end, so equal values keep their
 * order from A: the sort is stable. Nothing is compared; Θ(n + k).
 *
 * Block line numbers count the header as line 1 (pseudocode line k is block
 * line k + 1), the pseudocode as CLRS 4th ed. §8.2 and the lecture print it:
 *    1 Counting-Sort(A, n, k)
 *    2 1  new: B[1 : n], C[0 : k]
 *    3 2  for i = 0 to k
 *    4 3      C[i] = 0
 *    5 4  for j = 1 to n
 *    6 5      C[A[j]] = C[A[j]] + 1
 *    7 6  for i = 1 to k
 *    8 7      C[i] = C[i] + C[i - 1]
 *    9 8  for j = n downto 1
 *   10 9      B[C[A[j]]] = A[j]
 *   11 10     C[A[j]] = C[A[j]] - 1
 *   12 11 return B
 *
 * Frames: the start (line 1: A only), the new tables (line 2: B and C appear,
 * C's cells empty), the zeroing (lines 3–4 as one frame), one frame per j of
 * the counting loop (lines 5–6), one per i of the cumulative loop (lines
 * 7–8), one per j of the placement loop (lines 9–11, the write and the
 * decrease in one frame), and the return (line 12). That is
 * 3 + n + k + n + 1 frames: 25 for the lecture's instance.
 *
 * The first instance is the lecture's (lecture 4, slides 139–202) and CLRS
 * fig. 8.2's: A[1 : 8] = 2, 5, 3, 0, 2, 3, 0, 3 with k = 5. Repeated values
 * carry primes in order of appearance in A, as on the lecture's slides:
 * 2, 5, 3, 0, 2′, 3′, 0′, 3″. The counts are C = 2, 0, 2, 3, 0, 1, the
 * cumulative C = 2, 2, 4, 7, 7, 8, so the blocks of B are 0: B[1 : 2],
 * 2: B[3 : 4], 3: B[5 : 7], 5: B[8], and 1 and 4 have empty blocks. The
 * placement loop (j = 8 … 1) writes 3″ → B[7], 0′ → B[2], 3′ → B[6],
 * 2′ → B[4], 0 → B[1], 3 → B[5], 5 → B[8], 2 → B[3], and returns
 * B = 0, 0′, 2, 2′, 3, 3′, 3″, 5; at the end C = 0, 2, 2, 4, 7, 7.
 * Checked by running this file's run() (node, see the report).
 * Later instances: n values from 0 … k, k random in 3 … 5, at least one value
 * repeated and none more than three times (so the marks stay ′ and ″).
 *
 * The drawing is CLRS fig. 8.2's three rows, top to bottom: A, C, B, all on
 * one column pitch and left-aligned, each with its 1-based (C: 0-based) index
 * under it, as the module's other steppers draw a table. A and B hold the
 * module's cards (innsetting.js): the height follows the value, the value
 * and its prime at the top, one height scale for both rows. C holds counts
 * and places, numbers, so its cells are plain cells with the number in them.
 * An empty slot of B is a low dashed socket. From the frame where C[v] gets
 * its final cumulative value, the slots of v's block are dashed sockets at
 * the height of v (so the sorted B stands as a dashed staircase before a card
 * is placed) with a bracket under them labelled «v» (block 0 appears with
 * block 1, on the first frame of the loop, since C[0] needs no addition). On
 * that frame an arrow runs from C[v] to B[C[v]], the end of the block (no
 * arrow for an empty block); on each placement frame the same arrow runs
 * from C[A[j]] to the slot written, and the old value of C[A[j]] stands
 * struck out beside the new one. The pointers j (under A's
 * indices) and i (under C's) are named under the index they hold.
 *
 * Indices are 1-based for A and B, 0-based for C (its index is the value), as
 * the lecture writes them; a run of a table is A[1 : 8] with no-break spaces.
 *
 * Colours are framework tokens only, so frames re-theme on the light/dark
 * toggle. Accent = the count being written (C[A[j]] or C[i]), the slot of B
 * written and the card just placed there, the new block's bracket, the
 * arrow, the pointers; orange outline = what this step reads (A[j] in the
 * counting loop, C[i − 1] in the cumulative loop); dashed faint with a faint
 * value = a card of A that has been placed in B (used up); green = the
 * finished B on the last frame.
 */

/** The lecture's instance (lecture 4; CLRS fig. 8.2). */
const FIRST = { A: [2, 5, 3, 0, 2, 3, 0, 3], k: 5 };

/** Marks for the 2nd and 3rd element with the same value. */
const PRIME = ["", "′", "″"];

/** `size` values from 0 … k, k in 3 … 5, some value repeated, none more than three times. */
function dealt(size) {
  const k = 3 + Math.floor(Math.random() * 3);
  for (;;) {
    const A = Array.from({ length: size }, () => Math.floor(Math.random() * (k + 1)));
    const count = new Array(k + 1).fill(0);
    A.forEach((v) => count[v]++);
    const most = Math.max(...count);
    if (most >= 2 && most <= 3) return { A, k };
  }
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
const seg = (T, a, b) => `${T}[${a}${NB}:${NB}${b}]`;
const list = (xs) => xs.join(", ");
const WORD = ["null", "ett", "to", "tre", "fire", "fem", "seks", "sju", "åtte", "ni", "ti"];
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

const FONT = "font-family:var(--font-mono)";

/** Card styles as in innsetting.js: fill, outline, outline width, value colour. */
const CARD = {
  plain: { fill: "color-mix(in srgb, var(--fg) 9%, transparent)", stroke: "color-mix(in srgb, var(--fg) 28%, transparent)", wdt: 1, text: "var(--fg)" },
  compared: { fill: "color-mix(in srgb, var(--fg) 9%, transparent)", stroke: "var(--orange)", wdt: 2.5, text: "var(--fg)" },
  key: { fill: "color-mix(in srgb, var(--accent) 16%, transparent)", stroke: "var(--accent)", wdt: 2, text: "var(--accent-ink)" },
  done: { fill: "color-mix(in srgb, var(--green) 26%, transparent)", stroke: "var(--green)", wdt: 1.5, text: "var(--fg)" },
  used: { fill: "none", stroke: "var(--faint)", wdt: 1.2, text: "var(--faint)", dash: "4 3" },
};
/** An empty slot of B: before the blocks are known, and inside a known block. */
const SLOT = {
  empty: { fill: "none", stroke: "color-mix(in srgb, var(--fg) 30%, transparent)", wdt: 1.2, dash: "4 3" },
  block: { fill: "none", stroke: "color-mix(in srgb, var(--fg) 38%, transparent)", wdt: 1.2, dash: "4 3" },
};
/** A cell of C. */
const CELL = {
  empty: { fill: "none", stroke: "color-mix(in srgb, var(--fg) 30%, transparent)", wdt: 1.2, text: "var(--fg)" },
  plain: { fill: "color-mix(in srgb, var(--fg) 6%, transparent)", stroke: "color-mix(in srgb, var(--fg) 28%, transparent)", wdt: 1, text: "var(--fg)" },
  read: { fill: "color-mix(in srgb, var(--fg) 6%, transparent)", stroke: "var(--orange)", wdt: 2.5, text: "var(--fg)" },
  key: { fill: "color-mix(in srgb, var(--accent) 16%, transparent)", stroke: "var(--accent)", wdt: 2, text: "var(--accent-ink)" },
};

const f1 = (v) => v.toFixed(1);

export default {
  sizeRange: { min: 4, max: 8, default: 8 },
  defaultData(size = 8) {
    if (calls++ === 0 || firstLoad()) return { A: [...FIRST.A], k: FIRST.k };
    return dealt(size);
  },

  run(input) {
    const A = [...input.A];
    const k = input.k;
    const n = A.length;
    const seen = new Array(k + 1).fill(0);
    const tags = A.map((v) => PRIME[Math.min(2, seen[v]++)]);
    const name = (j) => `${A[j - 1]}${tags[j - 1]}`;

    // The blocks of B, from the final cumulative counts: v owns B[from : to]
    // (empty when from > to).
    const count = new Array(k + 1).fill(0);
    A.forEach((v) => count[v]++);
    const blocks = [];
    let acc = 0;
    for (let v = 0; v <= k; v++) {
      blocks.push({ v, from: acc + 1, to: acc + count[v] });
      acc += count[v];
    }

    const frames = [];
    let C = null; // null until line 2; then an array, entries null until line 3
    let B = null; // B[t − 1] = the index j in A of the card in slot t, or null
    let aUsed = new Array(n).fill(false);
    let known = -1; // the blocks 0 … known are marked
    let vi = "–";
    let vj = "–";

    const snap = (line, desc, extra = {}) =>
      frames.push({
        line,
        desc,
        vars: { i: vi, j: vj },
        n,
        k,
        A,
        tags,
        blocks,
        known,
        C: C ? [...C] : null,
        B: B ? [...B] : null,
        aUsed: [...aUsed],
        ...extra,
      });

    snap(1, `Counting-Sort(A, ${n}, ${k}) skal sortere ${seg("A", 1, n)}. Hver verdi er et heltall fra 0 til ${k}.`);

    C = new Array(k + 1).fill(null);
    B = new Array(n).fill(null);
    snap(2, `${seg("B", 1, n)} skal holde resultatet, og ${seg("C", 0, k)} skal telle hver verdi fra 0 til ${k}.`);

    C = new Array(k + 1).fill(0);
    snap([3, 4], `Alle tellingene i ${seg("C", 0, k)} settes til 0.`);

    for (let j = 1; j <= n; j++) {
      vj = j;
      const v = A[j - 1];
      C[v] += 1;
      const last = j === n ? " Nå er C[v] antallet elementer med verdi v." : "";
      snap([5, 6], `A[${j}] = ${name(j)}, så C[${v}] blir ${C[v]}.${last}`, { jPtr: j, aRead: j, cKey: v });
    }
    vj = "–";

    for (let i = 1; i <= k; i++) {
      vi = i;
      const a = C[i];
      const b = C[i - 1];
      C[i] = a + b;
      known = i;
      const sum = `C[${i}] = C[${i}] + C[${i - 1}] = ${a} + ${b} = ${C[i]}`;
      let lead = "";
      if (i === 1 && count[0] > 0) lead = `C[0] = ${C[0]} er allerede antallet elementer ≤ 0. `;
      let desc;
      if (a === 0) {
        desc = lead
          ? `${lead}${sum}, og blokken for ${i} er tom.`
          : `${sum}. Ingen elementer har verdi ${i}, så blokken for ${i} er tom.`;
      } else {
        const many = C[i] === 1 ? "Ett element er" : `${cap(WORD[C[i]])} elementer er`;
        desc = lead
          ? `${lead}${sum}, så det siste elementet med verdi ${i} skal stå på plass ${C[i]}.`
          : `${sum}. ${many} ≤ ${i}, så det siste elementet med verdi ${i} skal stå på plass ${C[i]}.`;
      }
      snap([7, 8], desc, { iPtr: i, cKey: i, cRead: i - 1, newBlock: i, arrow: a > 0 ? { v: i, to: C[i] } : null });
    }
    vi = "–";

    let firstPlace = true;
    for (let j = n; j >= 1; j--) {
      vj = j;
      const v = A[j - 1];
      const to = C[v];
      B[to - 1] = j;
      aUsed[j - 1] = true;
      C[v] = to - 1;
      let desc = `A[${j}] = ${name(j)} går til B[C[${v}]] = B[${to}], og C[${v}] blir ${C[v]}.`;
      const blk = blocks[v];
      if (firstPlace) desc += ` Neste element med verdi ${v} skal stå én plass til venstre.`;
      else if (to === blk.from && blk.to > blk.from) {
        const names = [];
        for (let t = blk.from; t <= blk.to; t++) names.push(name(B[t - 1]));
        desc += ` Blokken for ${v} er full, og ${list(names)} står i samme rekkefølge som i A.`;
      }
      firstPlace = false;
      snap([9, 10, 11], desc, { jPtr: j, cKey: v, cOld: { v, old: to }, bKey: to, arrow: { v, to } });
    }
    vj = "–";

    const out = B.map((j) => name(j));
    snap(
      12,
      `B = ${list(out)} er sortert uten en eneste sammenligning. Like verdier står i samme rekkefølge som i A, så Counting-Sort er stabil.`,
      { done: true },
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
    const textW = (s, fs) => String(s).length * 0.6 * fs;
    const XS = `${FONT};font-size:var(--text-xs)`;
    const SM = `${FONT};font-size:var(--text-sm);font-weight:600`;
    const XSB = `${XS};font-weight:600`;

    // Horizontal: a left gutter for the row names A, C, B, then the columns,
    // one pitch for all three rows, left-aligned as in CLRS fig. 8.2.
    const k = f.k;
    const cols = Math.max(n, k + 1);
    const GUT_L = textW("A", fsSm) + 10;
    const PAD_R = 4;
    const slot = Math.min(54, (w - GUT_L - PAD_R) / cols);
    const x0 = GUT_L + Math.max(0, (w - GUT_L - PAD_R - slot * cols) / 2);
    const sep = Math.max(3, slot * 0.14);
    const cw = slot - sep;
    const left = (t) => x0 + (t - 1) * slot + sep / 2; // column t, 1-based
    const mid = (t) => x0 + (t - 0.5) * slot;
    const cLeft = (v) => left(v + 1); // C's index v sits in column v + 1
    const cMid = (v) => mid(v + 1);

    // Vertical bands, top to bottom: A's cards, indices and pointer j; C's
    // cells, indices and pointer i; the arrow's room; B's cards, indices and
    // the block brackets with their labels.
    const IDX = fsXs + 5; // index text, under a baseline
    const ROW_IDX = Math.ceil(fsXs + 8);
    const ROW_PTR = Math.ceil(fsSm + 5);
    const CELL_H = Math.round(fsSm * 2.05);
    const GAP_AC = 12;
    const GAP_CB = 10;
    const BR = 9; // bracket under B's index row
    const LBL = BR + fsXs + 4;
    const fixed = 4 + ROW_IDX + ROW_PTR + GAP_AC + CELL_H + ROW_IDX + ROW_PTR + GAP_CB + ROW_IDX + LBL + 4;
    const H = Math.max(56, Math.min(104, (h - fixed) / 2));
    const top = 4 + Math.max(0, (h - fixed - 2 * H) / 2);
    const aBase = top + H;
    const cTop = aBase + ROW_IDX + ROW_PTR + GAP_AC;
    const cBot = cTop + CELL_H;
    const cPtr = cBot + ROW_IDX;
    const bBase = cPtr + ROW_PTR + GAP_CB + H;
    const MIN_H = Math.round(fsSm * 1.95); // room for the value on the shortest card
    const height = (v) => MIN_H + (k > 0 ? (v / k) * (H - MIN_H) : 0);
    const VAL = cw < 22 ? `${FONT};font-size:var(--text-xs);font-weight:600` : SM;
    const valDy = Math.min(18, MIN_H - 7);

    let svg = "";
    const text = (x, y, s, style, anchor = "middle") =>
      (svg += `<text x="${f1(x)}" y="${f1(y)}" text-anchor="${anchor}" style="${style}">${s}</text>`);
    const rect = (x, y, wd, ht, st, rx = 4) =>
      (svg +=
        `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(wd)}" height="${f1(ht)}" rx="${rx}" ` +
        `style="fill:${st.fill};stroke:${st.stroke}" stroke-width="${st.wdt}"` +
        `${st.dash ? ` stroke-dasharray="${st.dash}"` : ""}/>`);
    const card = (t, base, j, st) => {
      const v = f.A[j - 1];
      const ht = height(v);
      rect(left(t), base - ht, cw, ht, st);
      text(left(t) + cw / 2, base - ht + valDy, `${v}${f.tags[j - 1]}`, `fill:${st.text};${VAL}`);
    };
    const baseline = (y, a, b) =>
      (svg +=
        `<line x1="${f1(left(a) - 4)}" y1="${f1(y)}" x2="${f1(left(b) + cw + 4)}" y2="${f1(y)}" ` +
        `stroke="var(--border-strong)" stroke-width="1"/>`);
    const rowName = (s, y) => text(left(1) - 7, y, s, `fill:var(--fg);${SM}`, "end");

    // ── A ──
    rowName("A", aBase - 4);
    baseline(aBase, 1, n);
    for (let t = 1; t <= n; t++) {
      let st = CARD.plain;
      if (f.aUsed[t - 1]) st = CARD.used;
      else if (f.aRead === t) st = CARD.compared;
      card(t, aBase, t, st);
      text(mid(t), aBase + IDX, t, `fill:var(--faint);${XS}`);
    }
    if (f.jPtr != null) text(mid(f.jPtr), aBase + ROW_IDX + fsSm * 0.8, "j", `fill:var(--accent);${SM}`);

    // ── C ──
    if (f.C) {
      rowName("C", cTop + CELL_H / 2 + fsSm * 0.35);
      for (let v = 0; v <= k; v++) {
        const c = f.C[v];
        let st = c == null ? CELL.empty : CELL.plain;
        if (f.cKey === v) st = CELL.key;
        else if (f.cRead === v) st = CELL.read;
        rect(cLeft(v), cTop, cw, CELL_H, st, 3);
        const ty = cTop + CELL_H / 2 + fsSm * 0.36;
        if (c != null) {
          if (f.cOld && f.cOld.v === v) {
            // The old value, struck out, left of the new one.
            const ox = cLeft(v) + cw * 0.28;
            const nx = cLeft(v) + cw * 0.7;
            const oy = ty - 1;
            text(ox, oy, f.cOld.old, `fill:var(--muted);${XS}`);
            const hw = textW(f.cOld.old, fsXs) / 2 + 1.5;
            svg +=
              `<line x1="${f1(ox - hw)}" y1="${f1(oy - fsXs * 0.32)}" x2="${f1(ox + hw)}" y2="${f1(oy - fsXs * 0.32)}" ` +
              `style="stroke:var(--muted)" stroke-width="1.3"/>`;
            text(nx, ty, c, `fill:${st.text};${SM}`);
          } else text(cLeft(v) + cw / 2, ty, c, `fill:${st.text};${SM}`);
        }
        text(cMid(v), cBot + IDX, v, `fill:var(--faint);${XS}`);
      }
      if (f.iPtr != null) text(cMid(f.iPtr), cBot + ROW_IDX + fsSm * 0.8, "i", `fill:var(--accent);${SM}`);
    }

    // ── B ──
    if (f.B) {
      rowName("B", bBase - 4);
      baseline(bBase, 1, n);
      const owner = new Array(n + 1).fill(null); // slot → its block's value, once known
      for (const b of f.blocks) if (b.v <= f.known) for (let t = b.from; t <= b.to; t++) owner[t] = b.v;
      for (let t = 1; t <= n; t++) {
        const j = f.B[t - 1];
        if (j != null) {
          let st = CARD.plain;
          if (f.done) st = CARD.done;
          else if (f.bKey === t) st = CARD.key;
          card(t, bBase, j, st);
        } else if (owner[t] != null) {
          const ht = height(owner[t]);
          rect(left(t), bBase - ht, cw, ht, SLOT.block);
        } else {
          const sh = Math.round(MIN_H * 0.8);
          rect(left(t), bBase - sh, cw, sh, SLOT.empty);
        }
        text(mid(t), bBase + IDX, t, `fill:var(--faint);${XS}`);
      }
      // The blocks: a bracket under the indices, labelled by the value.
      const by = bBase + ROW_IDX + BR - 4;
      for (const b of f.blocks) {
        if (b.from > b.to || owner[b.from] == null) continue;
        const now = f.newBlock === b.v;
        const a = left(b.from);
        const e = left(b.to) + cw;
        const tick = 5;
        svg +=
          `<path d="M ${f1(a)} ${f1(by - tick)} V ${f1(by)} H ${f1(e)} V ${f1(by - tick)}" fill="none" ` +
          `style="stroke:${now ? "var(--accent)" : "var(--muted)"}" stroke-width="${now ? 2 : 1.5}"/>`;
        text((a + e) / 2, by + fsXs + 3, b.v, `fill:${now ? "var(--accent-ink)" : "var(--fg)"};${now ? XSB : XS}`);
      }
    }

    // The arrow from C[v] to B[to]: from under C's index (and pointer) row
    // down to the top of the slot.
    if (f.arrow) {
      const { v, to } = f.arrow;
      const x1 = cMid(v);
      const y1 = cBot + ROW_IDX + (f.iPtr != null ? ROW_PTR - 1 : 1);
      const x2 = mid(to);
      const j = f.B ? f.B[to - 1] : null;
      const ht = j != null ? height(f.A[j - 1]) : height(v);
      const y2 = bBase - ht - 3;
      const dx = x2 - x1;
      const dy = y2 - y1;
      const len = Math.hypot(dx, dy) || 1;
      const ux = dx / len;
      const uy = dy / len;
      const HEAD = 7;
      const bx = x2 - ux * HEAD;
      const byy = y2 - uy * HEAD;
      svg +=
        `<line x1="${f1(x1)}" y1="${f1(y1)}" x2="${f1(bx)}" y2="${f1(byy)}" ` +
        `style="stroke:var(--accent)" stroke-width="1.8" stroke-linecap="round"/>` +
        `<path d="M ${f1(x2)} ${f1(y2)} L ${f1(bx - uy * 4)} ${f1(byy + ux * 4)} L ${f1(bx + uy * 4)} ${f1(byy - ux * 4)} Z" ` +
        `style="fill:var(--accent)"/>`;
    }

    stage.innerHTML =
      `<svg width="100%" height="100%" viewBox="0 0 ${w.toFixed(0)} ${h.toFixed(0)}" ` +
      `preserveAspectRatio="none" role="img" aria-hidden="true" style="display:block">${svg}</svg>`;
  },
};
