/**
 * Knapsack′ (the 0-1 knapsack problem, bottom-up) trace for <Stepper>,
 * driving the Python block `ryggsekk` in modul 06. The stage is the table K,
 * one row per item i = 0 .. n and one column per capacity j = 0 .. W, with
 * the weight and value of each item to the right of its row, as in the
 * lecture.
 *
 * Filling: the current cell is accent. It reads the cell straight above
 * (without item i) and, if the item fits, the cell w_i columns further left in
 * the row above (with item i); both are orange, and the larger is filled.
 * Reading the choice back: from K[n][W] upwards, a row whose value differs
 * from the one above means item i was taken, and the walk moves w_i columns
 * left. Taken items turn green.
 *
 * Line numbers refer to that <CodeBlock>:
 *    1 def knapsack(v, w, W):
 *    2     n = len(v)
 *    3     K = [[0] * (W + 1) for _ in range(n + 1)]
 *    4     for i in range(1, n + 1):
 *    5         for j in range(W + 1):
 *    6             x = K[i - 1][j]
 *    7             if j < w[i - 1]:
 *    8                 K[i][j] = x
 *    9             else:
 *   10                 y = K[i - 1][j - w[i - 1]] + v[i - 1]
 *   11                 K[i][j] = max(x, y)
 *   12     return K
 *   13
 *   14 def chosen(K, w, W):
 *   15     items, j = [], W
 *   16     for i in range(len(K) - 1, 0, -1):
 *   17         if K[i][j] != K[i - 1][j]:
 *   18             items.append(i)
 *   19             j = j - w[i - 1]
 *   20     return items
 *
 * Items are numbered from 1 in the text and on the stage, as in the lecture;
 * in the Python, item i has weight w[i - 1] and value v[i - 1].
 */
import { drawTable } from "./_tabell.js";

const W = 5;
const FIRST = { w: [2, 1, 3, 2], v: [3, 2, 5, 2], W };

let calls = 0;

function sample(size) {
  const w = Array.from({ length: size }, () => 1 + Math.floor(Math.random() * 3));
  const v = Array.from({ length: size }, () => 1 + Math.floor(Math.random() * 9));
  return { w, v, W };
}

const list = (xs) =>
  xs.length <= 1 ? xs.join("") : `${xs.slice(0, -1).join(", ")} og ${xs[xs.length - 1]}`;

export default {
  sizeRange: { min: 3, max: 6, default: 4 },
  // The first table is a fixed example with one best choice; after that, random.
  defaultData(size = 4) {
    if (calls++ === 0 && size === FIRST.w.length) return FIRST;
    return sample(size);
  },

  run(input) {
    const { w, v, W: cap } = input;
    const n = w.length;
    const K = Array.from({ length: n + 1 }, () => Array(cap + 1).fill(0));
    const frames = [];
    let filled = 0;
    const snap = (line, desc, vars, extra = {}) =>
      frames.push({ line, desc, vars, w, v, W: cap, n, K: K.map((r) => [...r]), filled, ...extra });

    snap(
      [2, 3],
      `knapsack(v, w, ${cap}): én rad per gjenstand og én kolonne per kapasitet 0 til ${cap}. Rad 0 er 0: uten gjenstander, ingen verdi.`,
      { n, W: cap },
    );

    for (let i = 1; i <= n; i++) {
      for (let j = 0; j <= cap; j++) {
        const x = K[i - 1][j];
        const wi = w[i - 1];
        const vi = v[i - 1];
        filled += 1;
        if (j < wi) {
          K[i][j] = x;
          snap(
            [6, 7, 8],
            `Gjenstand ${i} veier ${wi} og får ikke plass når kapasiteten er ${j}. K[${i}][${j}] = K[${i - 1}][${j}] = ${x}.`,
            { i, j, x },
            { cur: [i, j], deps: [[i - 1, j]], best: [i - 1, j], item: i },
          );
        } else {
          const y = K[i - 1][j - wi] + vi;
          K[i][j] = Math.max(x, y);
          const take = y > x;
          snap(
            [6, 10, 11],
            `Uten gjenstand ${i}: x = K[${i - 1}][${j}] = ${x}. Med: y = K[${i - 1}][${j - wi}] + ${vi} = ${y}. K[${i}][${j}] = ${K[i][j]}.`,
            { i, j, x, y },
            { cur: [i, j], deps: [[i - 1, j], [i - 1, j - wi]], best: take ? [i - 1, j - wi] : [i - 1, j], item: i },
          );
        }
      }
    }

    snap(12, `Tabellen er full. K[${n}][${cap}] = ${K[n][cap]} er den største verdien med kapasitet ${cap}.`, { n, W: cap }, { cur: [n, cap] });

    const path = [];
    const taken = [];
    let j = cap;
    for (let i = n; i >= 1; i--) {
      path.push([i, j]);
      if (K[i][j] !== K[i - 1][j]) {
        taken.push(i);
        const jn = j - w[i - 1];
        snap(
          [17, 18, 19],
          `K[${i}][${j}] = ${K[i][j]} ≠ K[${i - 1}][${j}] = ${K[i - 1][j]}, så gjenstand ${i} er med. Kapasiteten som er igjen, er ${j} − ${w[i - 1]} = ${jn}.`,
          { i, j },
          { path: [...path], taken: [...taken] },
        );
        j = jn;
      } else {
        snap(
          [16, 17],
          `K[${i}][${j}] = K[${i - 1}][${j}] = ${K[i][j]}, så gjenstand ${i} er ikke med.`,
          { i, j },
          { path: [...path], taken: [...taken] },
        );
      }
    }
    const items = [...taken].sort((a, b) => a - b);
    const wt = items.reduce((s, i) => s + w[i - 1], 0);
    snap(
      20,
      `Med gjenstand ${list(items)}: vekt ${wt} av ${cap}, verdi ${K[n][cap]}.`,
      { n, W: cap },
      { path: [...path], taken: [...taken], done: true },
    );
    return frames;
  },

  render(stage, frame, api) {
    const { w, v, W: cap, n, K, filled } = frame;
    const key = (p) => (p ? `${p[0]},${p[1]}` : "");
    const deps = new Set((frame.deps || []).map(key));
    const path = new Set((frame.path || []).map(key));
    const taken = new Set(frame.taken || []);
    const tracing = frame.path != null;
    const cur = key(frame.cur);
    const best = key(frame.best);
    const itemSt = (i) => {
      if (tracing) return taken.has(i) ? "take" : null;
      return frame.item === i ? "hi" : null;
    };

    drawTable(stage, api, {
      rows: n + 1,
      cols: cap + 1,
      cell(i, j) {
        const k = `${i},${j}`;
        if (i === 0) return { text: "0", st: "base" };
        const done = (i - 1) * (cap + 1) + j + 1 <= filled;
        if (!done) return { text: null, st: "empty" };
        let st = "plain";
        if (tracing) {
          if (path.has(k)) st = taken.has(i) ? "take" : "path";
        } else if (k === cur) st = "cur";
        else if (k === best) st = "depBest";
        else if (deps.has(k)) st = "dep";
        return { text: String(K[i][j]), st };
      },
      right: [
        { title: "w", values: w.map(String), st: itemSt },
        { title: "v", values: v.map(String), st: itemSt },
      ],
      footer: tracing ? `Med: ${[...taken].sort((a, b) => a - b).join(", ") || "–"}` : null,
    });
  },
};
