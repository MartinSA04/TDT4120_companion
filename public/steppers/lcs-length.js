/**
 * LCS-Length and Print-LCS, for <Stepper>, driving the block `lcs-kode` in
 * modul 07 «Dynamisk programmering». The one idea: c[i, j] needs only the
 * cell diagonally above-left (when the last letters are equal) or the cells
 * above and to the left (when they differ), so the table can be filled row by
 * row; the arrows b store which one won, and Print-LCS follows them back
 * from the corner.
 *
 * Block line numbers count the header as line 1. LCS-Length's line k is
 * block line k + 1; block line 18 is empty; Print-LCS's header is block line
 * 19 and its line k is block line k + 19:
 *    1 LCS-Length(X, Y, m, n)              19 Print-LCS(b, X, i, j)
 *    2 1  new: b[1 : m, 1 : n], …           20 1  if i == 0 or j == 0
 *    3 2  for i = 1 to m                    21 2      return
 *    4 3      c[i, 0] = 0                   22 3  if b[i, j] == "↖"
 *    5 4  for j = 0 to n                    23 4      Print-LCS(b, X, i − 1, j − 1)
 *    6 5      c[0, j] = 0                   24 5      print X[i]
 *    7 6  for i = 1 to m                    25 6  elseif b[i, j] == "↑"
 *    8 7      for j = 1 to n                26 7      Print-LCS(b, X, i − 1, j)
 *    9 8          if X[i] == Y[j]           27 8  else Print-LCS(b, X, i, j − 1)
 *   10 9              c[i, j] = c[i − 1, j − 1] + 1
 *   11 10             b[i, j] = "↖"
 *   12 11         elseif c[i − 1, j] ≥ c[i, j − 1]
 *   13 12             c[i, j] = c[i − 1, j]
 *   14 13             b[i, j] = "↑"
 *   15 14         else c[i, j] = c[i, j − 1]
 *   16 15             b[i, j] = "←"
 *   17 16 return c and b
 * The lecture's version (lecture 6 slides 420–437 and 548–557; CLRS 4th ed.
 * 14.4): ties go up (≥), and x_i, y_j are written X[i], Y[j].
 *
 * Frames: the new tables [2]; column 0 [3, 4]; row 0 [5, 6]; one frame per
 * cell (i, j) with the lines of its branch; the return [17]. Then Print-LCS
 * from (m, n): one frame per call [20 and 22/25/27 with the call line], the
 * call that reaches row or column 0 [20, 21], and one frame per print on the
 * way back [24]. For signatur × skigard: 3 + 56 + 1 + 11 + 5 = 76 frames.
 *
 * The first instance is the lecture's (slide 438): X = signatur (rows),
 * Y = skigard (columns). c[8, 7] = 5, the LCS is «sigar», and Print-LCS
 * walks 8,7 > 8,6 > 7,5 > 6,5 > 5,5 > 4,4 > 3,4 > 2,3 > 1,2 > 1,1 > 0,0
 * (as the lecture's slides 557–600). Later instances (the shuffle button):
 * the lecture's other word pairs, fotfeste/tresteg, basker/bakverk,
 * marmor/damekor, klapper/takpapp, siktelse/snirkle, plaskvåt/piltast and
 * utvekst/veikart.
 *
 * Drawing (_dp.js grid): Y over the columns, X beside the rows; each filled
 * cell has its value and arrow. The cell being filled is accent, the cells
 * it reads indigo, and the letters X[i] and Y[j] are marked indigo, green
 * when they are equal. Print-LCS: the path green, the current call accent,
 * and the letters printed so far in a row under the table.
 */

import { MARK, FONT, text, svgWrap, remPx } from "./_tre.js";
import { firstView, grid } from "./_dp.js";

const FIRST = ["signatur", "skigard"];
const OTHERS = [
  ["fotfeste", "tresteg"],
  ["basker", "bakverk"],
  ["marmor", "damekor"],
  ["klapper", "takpapp"],
  ["siktelse", "snirkle"],
  ["plaskvåt", "piltast"],
  ["utvekst", "veikart"],
];
const view = firstView(import.meta.url);
let last = -1;

export default {
  defaultData() {
    if (view.isFirst()) return [...FIRST];
    let k = Math.floor(Math.random() * OTHERS.length);
    if (k === last) k = (k + 1) % OTHERS.length;
    last = k;
    return [...OTHERS[k]];
  },

  run(input) {
    const [Xs, Ys] = input?.length ? input : FIRST;
    const X = [null, ...Xs];
    const Y = [null, ...Ys];
    const m = Xs.length;
    const n = Ys.length;
    const c = Array.from({ length: m + 1 }, () => Array(n + 1).fill(null));
    const b = Array.from({ length: m + 1 }, () => Array(n + 1).fill(null));
    const V = { i: "–", j: "–" };
    const frames = [];
    const snap = (line, desc, o = {}) =>
      frames.push({
        line,
        // Index pairs such as K[3, 0] never wrap inside the brackets.
        desc: desc.replace(/\[(\d+), (\d+)\]/g, "[$1,\u00a0$2]"),
        vars: { ...V },
        t: {
          X: Xs,
          Y: Ys,
          c: c.map((r) => [...r]),
          b: b.map((r) => [...r]),
          cur: o.cur ?? null,
          reads: o.reads ?? [],
          letters: o.letters ?? null,
          path: o.path ? [...o.path] : [],
          out: o.out ?? null,
        },
      });

    snap(2, `X = ${Xs} har m = ${m} bokstaver og Y = ${Ys} har n = ${n}. c[i, j] skal bli lengden av en LCS av de i første bokstavene i X og de j første i Y.`);
    for (let i = 1; i <= m; i++) c[i][0] = 0;
    snap([3, 4], "Kolonne 0: når Y-prefikset er tomt, er LCS-en tom, så c[i, 0] = 0.");
    for (let j = 0; j <= n; j++) c[0][j] = 0;
    snap([5, 6], "Rad 0: når X-prefikset er tomt, er c[0, j] = 0.");

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        V.i = i;
        V.j = j;
        const same = X[i] === Y[j];
        const lt = `X[${i}] = ${X[i]} og Y[${j}] = ${Y[j]}`;
        if (same) {
          c[i][j] = c[i - 1][j - 1] + 1;
          b[i][j] = "↖";
          snap([9, 10, 11], `${lt} er like. Da kan de stå sist i LCS-en: c[${i}, ${j}] = c[${i - 1}, ${j - 1}] + 1 = ${c[i][j]}, og pilen peker skrått opp.`, {
            cur: [i, j],
            reads: [[i - 1, j - 1]],
            letters: [i, j, true],
          });
        } else {
          const up = c[i - 1][j];
          const left = c[i][j - 1];
          const reads = [[i - 1, j], [i, j - 1]];
          if (up >= left) {
            c[i][j] = up;
            b[i][j] = "↑";
            const why = up === left ? `begge er ${up}, og ved likhet velges den ovenfor` : `den ovenfor, ${up}, er størst`;
            snap([9, 12, 13, 14], `${lt} er ulike, så ett av dem står utenfor. Ovenfor er c[${i - 1}, ${j}] = ${up} og til venstre c[${i}, ${j - 1}] = ${left}: ${why}.`, {
              cur: [i, j],
              reads,
              letters: [i, j, false],
            });
          } else {
            c[i][j] = left;
            b[i][j] = "←";
            snap([9, 12, 15, 16], `${lt} er ulike. Til venstre er c[${i}, ${j - 1}] = ${left}, mer enn c[${i - 1}, ${j}] = ${up} ovenfor, så c[${i}, ${j}] = ${left} med pilen mot venstre.`, {
              cur: [i, j],
              reads,
              letters: [i, j, false],
            });
          }
        }
      }
    }
    V.i = V.j = "–";
    snap(17, `c[${m}, ${n}] = ${c[m][n]} er lengden av en LCS av ${Xs} og ${Ys}. Pilene i b sier hvilket valg hver celle bygde på.`, { cur: [m, n] });

    // Print-LCS from (m, n): calls down, prints on the way back.
    const path = [];
    const stack = [];
    let i = m;
    let j = n;
    for (;;) {
      V.i = i;
      V.j = j;
      if (i === 0 || j === 0) {
        snap([20, 21], `Print-LCS(b, X, ${i}, ${j}): ${i === 0 ? "i" : "j"} er 0, så kallet returnerer. Nå skrives bokstavene ut mens kallene returnerer.`, { path, out: "" });
        break;
      }
      path.push([i, j]);
      const a = b[i][j];
      if (a === "↖") {
        stack.push(i);
        snap([20, 22, 23], `Print-LCS(b, X, ${i}, ${j}): b[${i}, ${j}] = ↖, så X[${i}] = ${X[i]} er med. Først skrives resten, fra c[${i - 1}, ${j - 1}].`, { cur: [i, j], path, out: "" });
        i--;
        j--;
      } else if (a === "↑") {
        snap([20, 22, 25, 26], `Print-LCS(b, X, ${i}, ${j}): b[${i}, ${j}] = ↑, så fortsett fra c[${i - 1}, ${j}].`, { cur: [i, j], path, out: "" });
        i--;
      } else {
        snap([20, 22, 25, 27], `Print-LCS(b, X, ${i}, ${j}): b[${i}, ${j}] = ←, så fortsett fra c[${i}, ${j - 1}].`, { cur: [i, j], path, out: "" });
        j--;
      }
    }
    let out = "";
    while (stack.length) {
      const k = stack.pop();
      out += X[k];
      V.i = k;
      V.j = "–";
      const cellAt = path.find(([pi, pj]) => pi === k && b[pi][pj] === "↖");
      snap(24, `print X[${k}] = ${X[k]}. Utskriften er nå «${out}».`, { cur: cellAt, path, out });
    }
    V.i = V.j = "–";
    frames[frames.length - 1].desc += ` Det er en LCS med ${out.length} ${out.length === 1 ? "bokstav" : "bokstaver"}, like mange som c[${m},\u00a0${n}].`;
    return frames;
  },

  render(stage, f, api) {
    view.drawn.add(stage);
    const { w, h } = api.getSize();
    if (w <= 0 || h <= 0) {
      stage.innerHTML = "";
      return;
    }
    const T = f.t;
    const m = T.X.length;
    const n = T.Y.length;
    const rem = remPx();
    const fs = 0.84 * rem;
    const outH = T.out !== null ? fs + 14 : 0;
    const onPath = (i, j) => T.path.some(([a, bb]) => a === i && bb === j);
    const isRead = (i, j) => T.reads.some(([a, bb]) => a === i && bb === j);
    const isCur = (i, j) => T.cur && T.cur[0] === i && T.cur[1] === j;
    const g = grid(
      { x: 4, y: 4, w: w - 8, h: h - 8 - outH },
      {
        rows: m + 1,
        cols: n + 1,
        top: [...T.Y],
        left: [...T.X],
        letterMark: (side, k) => {
          if (!T.letters) return null;
          const [li, lj, eq] = T.letters;
          if ((side === "left" && k === li) || (side === "top" && k === lj)) return eq ? "done" : "compared";
          return null;
        },
        cell: (i, j) => {
          const v = T.c[i][j];
          const mark = isCur(i, j) ? "current" : isRead(i, j) ? "compared" : onPath(i, j) ? "done" : v === null ? "slot" : "plain";
          return { value: v, arrow: T.b[i][j], mark };
        },
      },
    );
    let svg = g.svg;
    if (T.out !== null) {
      const y = g.yOf(m + 1) + fs + 6;
      svg += text(g.x0, y, `utskrift: ${T.out}`, `${FONT};font-size:${(Math.round(fs * 10) / 10).toString()}px;font-weight:700;fill:var(--fg)`, "start");
    }
    stage.setAttribute(
      "aria-label",
      `LCS-tabellen for X = ${T.X} og Y = ${T.Y}.` + (T.cur ? ` Cellen c[${T.cur[0]}, ${T.cur[1]}] er markert.` : "") + (T.out ? ` Utskrift: ${T.out}.` : ""),
    );
    stage.innerHTML = svgWrap(w, h, svg).replace("<svg ", '<svg aria-hidden="true" ');
  },
};
