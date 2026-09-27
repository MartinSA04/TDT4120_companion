/**
 * LCS-Length and Print-LCS trace for <Stepper>, driving the Python block
 * `lcs` in modul 06. The stage is the table c with the arrows b in the
 * corner of each cell, X down the left side and Y along the top, the way the
 * textbook draws it. Row 0 and column 0 are the empty prefixes.
 *
 * Filling: the current cell is accent; the cells it reads are orange, and the
 * one it copies from is filled. Printing: Print-LCS follows the arrows back
 * from c[m][n], and the diagonal cells on that path, the letters in the LCS,
 * turn green. The letters are printed on the way back out of the recursion,
 * so the footer fills from the left.
 *
 * Line numbers refer to that <CodeBlock>:
 *    1 def lcs_length(X, Y):
 *    2     m, n = len(X), len(Y)
 *    3     c = [[0] * (n + 1) for _ in range(m + 1)]
 *    4     b = [[""] * (n + 1) for _ in range(m + 1)]
 *    5     for i in range(1, m + 1):
 *    6         for j in range(1, n + 1):
 *    7             if X[i - 1] == Y[j - 1]:
 *    8                 c[i][j] = c[i - 1][j - 1] + 1
 *    9                 b[i][j] = "↖"
 *   10             elif c[i - 1][j] >= c[i][j - 1]:
 *   11                 c[i][j] = c[i - 1][j]
 *   12                 b[i][j] = "↑"
 *   13             else:
 *   14                 c[i][j] = c[i][j - 1]
 *   15                 b[i][j] = "←"
 *   16     return c, b
 *   17
 *   18 def print_lcs(b, X, i, j):
 *   19     if i == 0 or j == 0:
 *   20         return
 *   21     if b[i][j] == "↖":
 *   22         print_lcs(b, X, i - 1, j - 1)
 *   23         print(X[i - 1], end="")
 *   24     elif b[i][j] == "↑":
 *   25         print_lcs(b, X, i - 1, j)
 *   26     else:
 *   27         print_lcs(b, X, i, j - 1)
 *
 * The word pairs are from the lecture, with the longer word down the side so
 * the table stays narrow on a phone.
 */
import { drawTable } from "./_tabell.js";

const PAIRS = [
  ["bakverk", "basker"],
  ["fotfeste", "tresteg"],
  ["siktelse", "snirkle"],
  ["plaskvåt", "piltast"],
  ["damekor", "marmor"],
  ["klapper", "takpapp"],
  ["signatur", "skigard"],
  ["utvekst", "veikart"],
];

let calls = 0;
let last = 0;

export default {
  // The first table is the pair the module text uses; shuffle picks another.
  defaultData() {
    if (calls++ === 0) return PAIRS[0];
    let k = last;
    while (k === last) k = Math.floor(Math.random() * PAIRS.length);
    last = k;
    return PAIRS[k];
  },

  run(input) {
    const [X, Y] = input;
    const m = X.length;
    const n = Y.length;
    const c = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
    const b = Array.from({ length: m + 1 }, () => Array(n + 1).fill(""));
    const frames = [];
    let filled = 0; // cells (i, j) with i, j >= 1 filled so far, row-major
    const snap = (line, desc, vars, extra = {}) =>
      frames.push({ line, desc, vars, X, Y, m, n, c: c.map((r) => [...r]), b: b.map((r) => [...r]), filled, ...extra });

    snap(
      [2, 3, 4],
      `lcs_length("${X}", "${Y}"): rad 0 og kolonne 0 er 0, for en LCS med et tomt prefiks er tom.`,
      { m, n },
    );

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        const xi = X[i - 1];
        const yj = Y[j - 1];
        let line;
        let desc;
        let best;
        let deps;
        if (xi === yj) {
          c[i][j] = c[i - 1][j - 1] + 1;
          b[i][j] = "↖";
          line = [7, 8, 9];
          deps = [[i - 1, j - 1]];
          best = [i - 1, j - 1];
          desc = `Rad ${i} og kolonne ${j} har samme bokstav, ${xi}. c[${i}][${j}] = c[${i - 1}][${j - 1}] + 1 = ${c[i][j]}, pil ↖.`;
        } else if (c[i - 1][j] >= c[i][j - 1]) {
          c[i][j] = c[i - 1][j];
          b[i][j] = "↑";
          line = [10, 11, 12];
          deps = [[i - 1, j], [i, j - 1]];
          best = [i - 1, j];
          desc = `${xi} ≠ ${yj}. Ovenfra ${c[i - 1][j]} ≥ fra venstre ${c[i][j - 1]}, så c[${i}][${j}] = ${c[i][j]}, pil ↑.`;
        } else {
          c[i][j] = c[i][j - 1];
          b[i][j] = "←";
          line = [13, 14, 15];
          deps = [[i - 1, j], [i, j - 1]];
          best = [i, j - 1];
          desc = `${xi} ≠ ${yj}. Fra venstre ${c[i][j - 1]} > ovenfra ${c[i - 1][j]}, så c[${i}][${j}] = ${c[i][j]}, pil ←.`;
        }
        filled += 1;
        snap(line, desc, { i, j, "X[i-1]": xi, "Y[j-1]": yj }, { cur: [i, j], deps, best });
      }
    }

    snap(16, `Tabellen er full. c[${m}][${n}] = ${c[m][n]} er lengden av en LCS.`, { m, n }, { cur: [m, n] });

    // Print-LCS: down the recursion along the arrows, then back out, printing.
    const path = [];
    const take = [];
    let i = m;
    let j = n;
    while (i > 0 && j > 0) {
      path.push([i, j]);
      const arrow = b[i][j];
      if (arrow === "↖") {
        take.push([i, j]);
        snap([21, 22], `print_lcs(b, X, ${i}, ${j}): pil ↖, så ${X[i - 1]} er med. Den skrives ut når kallet på (${i - 1}, ${j - 1}) er ferdig.`, { i, j }, { path: [...path], take: [...take], out: "" });
        i -= 1;
        j -= 1;
      } else if (arrow === "↑") {
        snap([24, 25], `print_lcs(b, X, ${i}, ${j}): pil ↑, gå til (${i - 1}, ${j}).`, { i, j }, { path: [...path], take: [...take], out: "" });
        i -= 1;
      } else {
        snap([26, 27], `print_lcs(b, X, ${i}, ${j}): pil ←, gå til (${i}, ${j - 1}).`, { i, j }, { path: [...path], take: [...take], out: "" });
        j -= 1;
      }
    }
    snap([19, 20], `print_lcs(b, X, ${i}, ${j}): et prefiks er tomt. Rekursjonen snur, og bokstavene skrives ut på vei tilbake.`, { i, j }, { path: [...path], take: [...take], out: "", stop: [i, j] });
    let out = "";
    for (let k = take.length - 1; k >= 0; k--) {
      const [ti, tj] = take[k];
      out += X[ti - 1];
      snap(23, `Tilbake i kallet på (${ti}, ${tj}): print(X[${ti - 1}]) skriver ${X[ti - 1]}.`, { i: ti, j: tj }, { path: [...path], take: [...take], out, printed: [ti, tj] });
    }
    snap(23, `En LCS av ${X} og ${Y} er ${out}, med lengde ${out.length}.`, { m, n }, { path: [...path], take: [...take], out, done: true });
    return frames;
  },

  render(stage, frame, api) {
    const { X, Y, m, n, c, b, filled } = frame;
    const key = (p) => (p ? `${p[0]},${p[1]}` : "");
    const deps = new Set((frame.deps || []).map(key));
    const path = new Set((frame.path || []).map(key));
    const take = new Set((frame.take || []).map(key));
    const tracing = frame.path != null;
    const cur = key(frame.cur);
    const best = key(frame.best);

    drawTable(stage, api, {
      rows: m + 1,
      cols: n + 1,
      topLetters: [...Y],
      leftLetters: [...X],
      cell(i, j) {
        const k = `${i},${j}`;
        if (i === 0 || j === 0) return { text: "0", st: "base" };
        const done = (i - 1) * n + j <= filled;
        if (!done) return { text: null, st: "empty" };
        let st = "plain";
        if (tracing) {
          if (take.has(k)) st = "take";
          else if (path.has(k)) st = "path";
        } else if (k === cur) st = "cur";
        else if (k === best) st = "depBest";
        else if (deps.has(k)) st = "dep";
        return { text: String(c[i][j]), arrow: b[i][j], st };
      },
      letterSt(side, idx) {
        if (tracing) {
          for (const [ti, tj] of frame.take) {
            if ((side === "left" && ti === idx) || (side === "top" && tj === idx)) return "take";
          }
          return null;
        }
        if (!frame.cur || !frame.deps) return null;
        const [ci, cj] = frame.cur;
        if ((side === "left" && ci === idx) || (side === "top" && cj === idx)) return "hi";
        return null;
      },
      footer: tracing ? `LCS: ${frame.out || ""}` : null,
    });
  },
};
