/**
 * Knapsack′, for <Stepper>, driving the block `knapsack-kode` in modul 07
 * «Dynamisk programmering». The one idea: K[i, j] is the better of two cells
 * in the row above, «without item i» straight above it and «with item i»
 * w[i] columns further left, plus v[i]. Row by row, both are always filled.
 * Afterwards the table says which items were taken: walk up from K[n, W];
 * where a cell differs from the one above it, item i was taken.
 *
 * Block line numbers count the header as line 1, so the procedure's line k
 * is block line k + 1:
 *    1 Knapsack′(n, W)
 *    2 1  let K[0 : n, 0 : W] be a new table
 *    3 2  for j = 0 to W
 *    4 3      K[0, j] = 0
 *    5 4  for i = 1 to n
 *    6 5      for j = 0 to W
 *    7 6          x = K[i − 1, j]
 *    8 7          if j < w[i]
 *    9 8              K[i, j] = x
 *   10 9          else y = K[i − 1, j − w[i]] + v[i]
 *   11 10             K[i, j] = max(x, y)
 *   12 11 return K[n, W]
 * (the pensumhefte's appendix E and lecture 6 slides 632–729).
 *
 * Frames: the new table [2]; row 0 [3, 4]; one frame per cell (i, j) [7, 8,
 * 9] or [7, 8, 10, 11]; the return [12]; then the read-back, which is not in
 * the code (line: none): one frame per row from n up to 1, and a last frame
 * with the items taken. For the lecture's instance 2 + 36 + 1 + 6 + 1 = 46.
 *
 * The first instance is the lecture's (slide 729): w = 1, 2, 1, 3, 1, 2,
 * v = 6, 5, 2, 1, 3, 4, W = 5. K[6, 5] = 16 (checked in node); rows 0 … 6:
 *   0 0 0 0 0 0 / 0 6 6 6 6 6 / 0 6 6 11 11 11 / 0 6 8 11 13 13 /
 *   0 6 8 11 13 13 / 0 6 9 11 14 16 / 0 6 9 11 14 16.
 * Read-back: K[6, 5] = K[5, 5] (6 not taken); K[5, 5] = 16 ≠ 13 (5 taken,
 * to j = 4); K[4, 4] = K[3, 4] (4 not); K[3, 4] = 13 ≠ 11 (3 taken, j = 3);
 * K[2, 3] = 11 ≠ 6 (2 taken, j = 1); K[1, 1] = 6 ≠ 0 (1 taken, j = 0).
 * Items 1, 2, 3, 5: weight 5, value 16. Later instances (the shuffle
 * button): 4 – 6 random items with w from 1 to 4 and v from 1 to 9, and W
 * from 4 to 7.
 *
 * Drawing (_dp.js grid): the table with the columns w and v on the right, as
 * the lecture's slide. The cell being filled is accent; the cell above
 * («uten») and the cell w[i] columns left in the row above («med», when it
 * exists) are indigo, each joined to the current cell by a short arrow;
 * item i's w and v are marked. In the read-back
 * the path is green and the items taken are green in the w and v columns;
 * under the table a bar of W cells, lined up with columns 1 … W, fills with
 * one block per item taken, as wide as its weight.
 */

import { FONT, text, svgWrap, remPx } from "./_tre.js";
import { firstView, grid } from "./_dp.js";

const FIRST = { w: [1, 2, 1, 3, 1, 2], v: [6, 5, 2, 1, 3, 4], W: 5 };
const view = firstView(import.meta.url);

function randomInstance() {
  const n = 4 + Math.floor(Math.random() * 3);
  const w = Array.from({ length: n }, () => 1 + Math.floor(Math.random() * 4));
  const v = Array.from({ length: n }, () => 1 + Math.floor(Math.random() * 9));
  return { w, v, W: 4 + Math.floor(Math.random() * 4) };
}

export default {
  defaultData() {
    return view.isFirst() ? { ...FIRST } : randomInstance();
  },

  run(input) {
    const inst = input && input.w ? input : FIRST;
    const w = [null, ...inst.w];
    const v = [null, ...inst.v];
    const n = inst.w.length;
    const W = inst.W;
    const K = Array.from({ length: n + 1 }, () => Array(W + 1).fill(null));
    const V = { i: "–", j: "–", x: "–", y: "–" };
    const frames = [];
    const snap = (line, desc, o = {}) =>
      frames.push({
        line,
        // Index pairs such as K[3, 0] never wrap inside the brackets.
        desc: desc.replace(/\[(\d+), (\d+)\]/g, "[$1,\u00a0$2]"),
        vars: { ...V },
        t: { w: inst.w, v: inst.v, W, K: K.map((r) => [...r]), cur: o.cur ?? null, up: o.up ?? null, diag: o.diag ?? null, item: o.item ?? null, path: o.path ? [...o.path] : [], taken: o.taken ? [...o.taken] : null },
      });

    snap(2, `${n} gjenstander og kapasitet W = ${W}. K[i, j] skal bli den største verdien du kan få med gjenstandene 1 til i og kapasitet j.`);
    for (let j = 0; j <= W; j++) K[0][j] = 0;
    snap([3, 4], "Rad 0: uten gjenstander er verdien 0, uansett kapasitet.");

    for (let i = 1; i <= n; i++) {
      for (let j = 0; j <= W; j++) {
        V.i = i;
        V.j = j;
        const x = K[i - 1][j];
        V.x = x;
        const head = `i = ${i} (w = ${w[i]}, v = ${v[i]}), j = ${j}: uten gjenstand ${i} er det beste K[${i - 1}, ${j}] = ${x}.`;
        if (j < w[i]) {
          K[i][j] = x;
          V.y = "–";
          snap([7, 8, 9], `${head} Gjenstand ${i} veier ${w[i]} og får ikke plass, så K[${i}, ${j}] = ${x}.`, { cur: [i, j], up: [i - 1, j], item: i });
        } else {
          const y = K[i - 1][j - w[i]] + v[i];
          V.y = y;
          K[i][j] = Math.max(x, y);
          const which = y > x ? "med er best" : y === x ? "like gode" : "uten er best";
          snap([7, 8, 10, 11], `${head} Med den er det K[${i - 1}, ${j - w[i]}] + ${v[i]} = ${y}: ${which}, så K[${i}, ${j}] = ${K[i][j]}.`, {
            cur: [i, j],
            up: [i - 1, j],
            diag: [i - 1, j - w[i]],
            item: i,
          });
        }
      }
    }
    V.i = V.j = V.x = V.y = "–";
    snap(12, `return K[${n}, ${W}] = ${K[n][W]}: den største verdien med alle ${n} gjenstandene og kapasitet ${W}. Tabellen sier også hvilke gjenstander som gir den.`, { cur: [n, W] });

    // Read-back: not in the code.
    const path = [];
    const taken = [];
    let j = W;
    for (let i = n; i >= 1; i--) {
      path.push([i, j]);
      if (K[i][j] !== K[i - 1][j]) {
        taken.push(i);
        snap(null, `K[${i}, ${j}] = ${K[i][j]} er større enn K[${i - 1}, ${j}] = ${K[i - 1][j]} rett over, så gjenstand ${i} er med. Fortsett fra K[${i - 1}, ${j - w[i]}], med ${w[i]} mindre kapasitet.`, {
          cur: [i, j],
          up: [i - 1, j],
          path,
          taken,
          item: i,
        });
        j -= w[i];
      } else {
        snap(null, `K[${i}, ${j}] = K[${i - 1}, ${j}] = ${K[i][j]}, så det beste kommer uten gjenstand ${i}. Fortsett rett opp.`, { cur: [i, j], up: [i - 1, j], path, taken, item: i });
      }
    }
    path.push([0, j]);
    const sw = taken.reduce((a, k) => a + w[k], 0);
    const sv = taken.reduce((a, k) => a + v[k], 0);
    const list = taken.slice().reverse();
    const names = list.length > 1 ? `${list.slice(0, -1).join(", ")} og ${list[list.length - 1]}` : `${list[0] ?? "ingen"}`;
    snap(null, `Gjenstandene ${names} veier ${sw} til sammen og er verdt ${sv}, som er K[${n}, ${W}].`, { path, taken });
    return frames;
  },

  render(stage, f, api) {
    view.drawn.add(stage);
    const { w: Wd, h } = api.getSize();
    if (Wd <= 0 || h <= 0) {
      stage.innerHTML = "";
      return;
    }
    const T = f.t;
    const n = T.w.length;
    const rem = remPx();
    const fs = 0.8 * rem;
    const barH = T.taken ? Math.max(22, fs + 10) + 10 : 0;
    const onPath = (i, j) => T.path.some(([a, b]) => a === i && b === j);
    const at = (p, i, j) => p && p[0] === i && p[1] === j;
    const g = grid(
      { x: 4, y: 4, w: Wd - 8, h: h - 8 - barH },
      {
        rows: n + 1,
        cols: T.W + 1,
        right: [
          { title: "w", values: T.w, mark: (i) => (T.taken?.includes(i) ? "done" : i === T.item ? "compared" : null) },
          { title: "v", values: T.v, mark: (i) => (T.taken?.includes(i) ? "done" : i === T.item ? "compared" : null) },
        ],
        cell: (i, j) => {
          const val = T.K[i][j];
          const mark = at(T.cur, i, j) ? "current" : at(T.up, i, j) || at(T.diag, i, j) ? "compared" : onPath(i, j) ? "done" : val === null ? "slot" : "plain";
          return { value: val, mark };
        },
      },
    );
    let svg = g.svg;
    const s = g.size;
    const c = (i, j) => ({ x: g.xOf(j) + s / 2, y: g.yOf(i) + s / 2 });
    const arrow = (a, b, label) => {
      // From the edge of cell a toward the edge of cell b, with a head at b.
      const dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || 1;
      const ux = dx / d, uy = dy / d;
      const pad = s * 0.3;
      const x1 = a.x + ux * pad, y1 = a.y + uy * pad, x2 = b.x - ux * pad, y2 = b.y - uy * pad;
      svg += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" style="stroke:var(--indigo)" stroke-width="1.8" stroke-linecap="round"/>`;
      const L = 6, Wh = 3.4, bx = x2 - ux * L, by = y2 - uy * L;
      svg += `<path d="M${x2.toFixed(1)} ${y2.toFixed(1)} L${(bx - uy * Wh).toFixed(1)} ${(by + ux * Wh).toFixed(1)} L${(bx + uy * Wh).toFixed(1)} ${(by - ux * Wh).toFixed(1)} Z" style="fill:var(--indigo)"/>`;
      if (label) {
        const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
        svg += text(mx - uy * 0.9 * fs, my + ux * 0.9 * fs + fs * 0.36, label, `${FONT};font-size:${(Math.round(fs * 10) / 10).toString()}px;font-weight:700;fill:var(--indigo)`);
      }
    };
    if (T.cur && T.up && !T.taken) arrow(c(...T.up), c(...T.cur), null);
    if (T.cur && T.diag && !T.taken) arrow(c(...T.diag), c(...T.cur), null);

    // The sack: W cells under columns 1 … W, one block per item taken.
    if (T.taken) {
      const y = g.yOf(n + 1) + 8;
      const hh = barH - 12;
      svg += `<rect x="${(g.xOf(1) + 1).toFixed(1)}" y="${y.toFixed(1)}" width="${(T.W * s - 2).toFixed(1)}" height="${hh.toFixed(1)}" rx="4" style="fill:none;stroke:color-mix(in srgb, var(--fg) 38%, transparent)" stroke-width="1.3" stroke-dasharray="4 3"/>`;
      let k0 = 1;
      for (const it of T.taken.slice().reverse()) {
        const wd = T.w[it - 1] * s;
        svg += `<rect x="${(g.xOf(k0) + 2).toFixed(1)}" y="${(y + 2).toFixed(1)}" width="${(wd - 4).toFixed(1)}" height="${(hh - 4).toFixed(1)}" rx="3" style="fill:color-mix(in srgb, var(--green) 26%, var(--bg));stroke:var(--green)" stroke-width="1.6"/>`;
        svg += text(g.xOf(k0) + wd / 2, y + hh / 2 + fs * 0.36, it, `${FONT};font-size:${(Math.round(fs * 10) / 10).toString()}px;font-weight:700;fill:var(--fg)`);
        k0 += T.w[it - 1];
      }
      svg += text(g.x0 + s / 2, y + hh / 2 + fs * 0.36, "sekk", `${FONT};font-size:${(Math.round(fs * 0.85 * 10) / 10).toString()}px;fill:var(--muted)`);
    }
    stage.setAttribute(
      "aria-label",
      `Ryggsekktabellen K med W = ${T.W}.` + (T.cur ? ` Cellen K[${T.cur[0]}, ${T.cur[1]}] er markert.` : "") + (T.taken ? ` Med i sekken: ${T.taken.slice().reverse().join(", ") || "ingen"}.` : ""),
    );
    stage.innerHTML = svgWrap(Wd, h, svg).replace("<svg ", '<svg aria-hidden="true" ');
  },
};
