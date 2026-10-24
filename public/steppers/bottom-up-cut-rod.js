/**
 * Bottom-Up-Cut-Rod, for <Stepper>, driving the block `bottom-up-kode` in
 * modul 07 «Dynamisk programmering». The one idea: solve the lengths in the
 * order 0, 1, …, n, so every r[j − i] is already in the table when r[j]
 * needs it. Each candidate for length j is «a first piece of i cm, sold for
 * p[i], and the rest of j − i cm cut the best way, worth r[j − i]».
 *
 * Block line numbers count the header as line 1, so the procedure's line k
 * is block line k + 1:
 *    1 Bottom-Up-Cut-Rod(p, n)
 *    2 1  let r[0 : n] be a new array
 *    3 2  r[0] = 0
 *    4 3  for j = 1 to n
 *    5 4      q = −∞
 *    6 5      for i = 1 to j
 *    7 6          q = max(q, p[i] + r[j − i])
 *    8 7      r[j] = q
 *    9 8  return r[n]
 * (the lecture's version, lecture 6 slides 299–306; CLRS 4th ed. 14.1).
 *
 * Frames: the new table [2]; r[0] = 0 [3]; per j the start [4, 5]; per i
 * one frame [6, 7]; r[j] = q [8]; last the return [9]. For n = 8 that is
 * 3 + Σ (j + 2) = 3 + 36 + 16 = 55 frames.
 *
 * The instance is the lecture's (CLRS fig. 14.1): p = 1, 5, 8, 9, 10, 17,
 * 17, 20 for lengths 1 … 8, n = 8. Later instances (the shuffle button):
 * random prices for lengths 1 … 8, each at least the one before. Results (checked in node):
 * r = 0, 1, 5, 8, 10, 13, 17, 18, 22. For j = 6 the candidates are 14, 15,
 * 16, 14, 11, 17, so r[6] = 17 (the lecture's own example). For j = 8 they
 * are 19, 22, 21, 19, 18, 22, 18, 20: the first piece 2 and the rest 6 give
 * 22 first.
 *
 * Drawing: the rod of length j on top, one cell per cm, lined up with the
 * table's columns (cm k over column k). The first piece of i cm is accent
 * with its price p[i] in it; the rest is green (already cut the best way)
 * with r[j − i] in it. Under it the index row 0 … n and the rows p[1 : n] and
 * r[0 : n]. The cell r[j] being found is accent, the two cells the candidate
 * reads (p[i] and r[j − i]) are indigo, and r cells not filled yet are
 * dashed. On the r[j] = q frame the rod shows the first candidate that gave
 * q. Colours are framework tokens only (the marks of _tre.js).
 */

import { MARK, FONT, cell, text, svgWrap, remPx } from "./_tre.js";
import { firstView } from "./_dp.js";

/** The lecture's prices (CLRS fig. 14.1), lengths 1 … 8. */
export const PRICES = [1, 5, 8, 9, 10, 17, 17, 20];
const NEG = "−∞";
const NB = "\u00a0";
const view = firstView(import.meta.url);

/** Random prices for lengths 1 … 8: each at least the one before, so longer pieces never sell for less. */
function randomPrices() {
  const p = [1 + Math.floor(Math.random() * 3)];
  for (let k = 1; k < 8; k++) p.push(p[k - 1] + Math.floor(Math.random() * 7));
  return p;
}

export default {
  defaultData() {
    return view.isFirst() ? [...PRICES] : randomPrices();
  },

  run(input) {
    const prices = input?.length ? input : PRICES;
    const p = [null, ...prices];
    const n = prices.length;
    const r = Array(n + 1).fill(null);
    const V = { j: "–", i: "–", q: "–" };
    const frames = [];
    const snap = (line, desc, o = {}) =>
      frames.push({ line, desc, vars: { ...V }, rod: { n, p, r: [...r], j: o.j ?? null, i: o.i ?? null, cur: o.cur ?? null, reads: o.reads ?? [], stored: !!o.stored } });

    snap(2, `Tabellen r[0${NB}:${NB}${n}] skal holde den beste prisen for hver lengde fra 0 til ${n}. Prisene er p[1${NB}:${NB}${n}] = ${prices.join(", ")}.`);
    r[0] = 0;
    snap(3, "En stav med lengde 0 gir ingenting: r[0] = 0.", { cur: 0 });

    for (let j = 1; j <= n; j++) {
      V.j = j;
      V.i = "–";
      V.q = NEG;
      let q = -Infinity;
      let best = null;
      snap(
        [4, 5],
        j === 1
          ? "j = 1: finn den beste prisen for en stav på 1 cm. q er den beste så langt, og starter på −∞."
          : `j = ${j}: finn den beste prisen for en stav på ${j} cm. Alle kortere lengder står ferdige i r[0${NB}:${NB}${j - 1}].`,
        { j, cur: j },
      );
      for (let i = 1; i <= j; i++) {
        V.i = i;
        const v = p[i] + r[j - i];
        const better = v > q;
        const was = q;
        if (better) {
          q = v;
          best = i;
        }
        V.q = q;
        const rest = j - i === 0 ? "ingen rest, r[0] = 0" : `resten ${j - i} cm til r[${j - i}] = ${r[j - i]}`;
        const verdict = better
          ? was === -Infinity
            ? `Til sammen ${v}, så q = ${v}.`
            : `Til sammen ${v}, som er bedre enn ${was}, så q = ${v}.`
          : `Til sammen ${v}, som ikke er bedre enn q = ${q}.`;
        snap([6, 7], `i = ${i}: første bit ${i} cm til p[${i}] = ${p[i]}, ${rest}. ${verdict}`, {
          j,
          i,
          cur: j,
          reads: [["p", i], ["r", j - i]],
        });
      }
      r[j] = q;
      V.i = "–";
      const how = best === j ? "hele staven uten å kappe den" : `første bit ${best} cm og resten ${j - best} cm`;
      snap(8, `r[${j}] = ${q}, fra ${how}. Den er lagret, og de lengre lengdene kan slå den opp.`, { j, i: best, cur: j, stored: true });
    }
    V.j = V.i = "–";
    snap(9, `return r[${n}] = ${r[n]}. Hver r[j] ble regnet ut én gang, og hver kandidat var ett oppslag.`, { cur: n });
    return frames;
  },

  render(stage, f, api) {
    view.drawn.add(stage);
    const { w, h } = api.getSize();
    if (w <= 0 || h <= 0) {
      stage.innerHTML = "";
      return;
    }
    const { n, p, r, j, i, cur, reads, stored } = f.rod;
    const rem = remPx();
    const fs = 0.84 * rem;
    const LAB = `${FONT};font-size:${(Math.round(fs * 10) / 10).toString()}px`;
    const gut = 1.6 * fs;
    const cols = n + 1;
    const cw = Math.min(46, (w - gut - 10) / cols);
    const ch = Math.min(34, cw * 1.05);
    const x0 = gut + Math.max(0, (w - gut - 10 - cw * cols) / 2);
    const X = (k) => x0 + k * cw;
    const rodH = Math.min(26, ch * 0.8);
    const total = rodH + 12 + fs + 4 + ch + 6 + ch;
    const top = Math.max(4, (h - total) / 2);
    const yRod = top;
    const yIdx = yRod + rodH + 12 + fs;
    const yP = yIdx + 6;
    const yR = yP + ch + 6;
    const isRead = (row, k) => reads.some(([a, b]) => a === row && b === k);
    let svg = "";

    // The rod of length j: the first piece and the rest.
    if (j) {
      const cut = i ?? 0;
      const piece = (k0, k1, mark, label) => {
        const m = MARK[mark];
        const x = X(k0) + 2;
        const wd = (k1 - k0 + 1) * cw - 4;
        svg += `<rect x="${x.toFixed(1)}" y="${yRod.toFixed(1)}" width="${wd.toFixed(1)}" height="${rodH.toFixed(1)}" rx="5" style="fill:${m.fill};stroke:${m.stroke}" stroke-width="${m.wdt}"/>`;
        for (let k = k0; k < k1; k++)
          svg += `<line x1="${(X(k + 1)).toFixed(1)}" y1="${(yRod + rodH * 0.68).toFixed(1)}" x2="${(X(k + 1)).toFixed(1)}" y2="${(yRod + rodH - 1).toFixed(1)}" style="stroke:${m.stroke}" stroke-width="1"/>`;
        if (label !== null) svg += text(x + wd / 2, yRod + rodH / 2 + fs * 0.36, label, `${LAB};font-weight:700;fill:${m.text}`);
      };
      if (cut) {
        piece(1, cut, "current", p[cut]);
        if (cut < j) piece(cut + 1, j, "done", r[j - cut]);
      } else {
        // Before the first candidate: the whole rod, not cut yet.
        piece(1, j, "plain", null);
      }
    }

    // Index row and the two table rows.
    for (let k = 0; k <= n; k++) svg += text(X(k) + cw / 2, yIdx - 2, k, `${LAB};fill:var(--faint)`);
    svg += text(gut - 6, yP + ch / 2 + fs * 0.36, "p", `${LAB};font-weight:700;fill:var(--muted)`, "end");
    svg += text(gut - 6, yR + ch / 2 + fs * 0.36, "r", `${LAB};font-weight:700;fill:var(--muted)`, "end");
    for (let k = 1; k <= n; k++) svg += cell(X(k) + 1.5, yP, cw - 3, ch, p[k], isRead("p", k) ? "compared" : "plain", fs);
    for (let k = 0; k <= n; k++) {
      const filled = r[k] !== null;
      const mark = k === cur ? "current" : isRead("r", k) ? "compared" : filled ? "plain" : "slot";
      const show = filled && (k !== cur || stored || j === null);
      svg += cell(X(k) + 1.5, yR, cw - 3, ch, show ? r[k] : "", mark, fs);
    }

    const say = j ? `Stav på ${j} cm` + (i ? `, første bit ${i} cm` : "") + ". " : "";
    stage.setAttribute("aria-label", `${say}r = ${r.map((v) => (v === null ? "tom" : v)).join(", ")}.`);
    stage.innerHTML = svgWrap(w, h, svg).replace("<svg ", '<svg aria-hidden="true" ');
  },
};
