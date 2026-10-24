/**
 * Huffman, for <Stepper>, driving the block `huffman` in modul 08
 * «Grådighet». The one idea: take the two trees with the lowest frequency
 * out of the queue, hang them under a new node whose frequency is their sum,
 * and put that tree back. Every merge adds one bit to the codeword of every
 * letter under it, so it costs the sum, and Huffman always takes the
 * cheapest merge there is.
 *
 * Block line numbers count the header as line 1, so the procedure's line k is
 * block line k + 1:
 *    1 Huffman(C)
 *    2 1  n = |C|
 *    3 2  Q = C
 *    4 3  for i = 1 to n − 1
 *    5 4      allocate a new node z
 *    6 5      x = Extract-Min(Q)
 *    7 6      y = Extract-Min(Q)
 *    8 7      z.left = x
 *    9 8      z.right = y
 *   10 9      z.freq = x.freq + y.freq
 *   11 10     Insert(Q, z)
 *   12 11 return Extract-Min(Q)
 * (CLRS 4th ed. 15.3.)
 *
 * Frames: the queue [2, 3]; per round x [4, 5, 6], y [7], the new tree
 * [8, 9, 10], back in the queue [11]; last the root and the codewords [12].
 * 2 + 4(n − 1) frames.
 *
 * The queue is drawn as a forest, trees in the order they leave the queue
 * (frequency, and on a tie the one that came in first). The instance is the
 * lecture's: A 5, B 9, C 12, D 13, E 16, F 35. Rounds (checked in node):
 * 5 + 9 = 14, 12 + 13 = 25, 14 + 16 = 30, 25 + 30 = 55, 35 + 55 = 90.
 * Codewords F 0, C 100, D 101, A 1100, B 1101, E 111; B(T) = 214 = 14 + 25 +
 * 30 + 55 + 90, against 270 with 3 bits per letter. Later instances (the
 * shuffle button): 3–7 letters with random frequencies 1–40.
 *
 * Marks (the marks of _kodetre.js / _tre.js): x and y accent while they are
 * taken out; the new node z accent; a tree back in the queue plain.
 */

import { svgWrap, text } from "./_tre.js";
import { firstView } from "./_dp.js";
import { LECTURE, huffman, layout, drawTree, depth, codes, leaves } from "./_kodetre.js";

const view = firstView(import.meta.url);

function randomPairs() {
  const n = 3 + Math.floor(Math.random() * 5);
  return "ABCDEFG"
    .slice(0, n)
    .split("")
    .map((ch) => [ch, 1 + Math.floor(Math.random() * 40)]);
}

const name = (t) => (t.ch ? `${t.ch}:${t.freq}` : `treet med ${t.freq}`);

export default {
  defaultData() {
    return view.isFirst() ? LECTURE.map((p) => [...p]) : randomPairs();
  },

  run(pairs) {
    const { rounds, root, start } = huffman(pairs);
    const n = pairs.length;
    const levels = depth(root);
    const frames = [];
    const V = { n, i: "–", x: "–", y: "–" };
    const snap = (line, desc, forest, marks = {}, extra = {}) =>
      frames.push({ line, desc, vars: { ...V }, hf: { forest, marks, levels, n, ...extra } });

    snap([2, 3], `Q er en min-prioritetskø med de ${n} tegnene, hvert som et tre med én node. Køen er tegnet i den rekkefølgen trærne tas ut: lavest frekvens først.`, start);
    rounds.forEach((r, k) => {
      const i = k + 1;
      V.i = i;
      const tieX = r.before[1] && r.before[1].freq === r.x.freq && r.before[0] === r.x;
      V.x = name(r.x);
      V.y = "–";
      snap([4, 5, 6], `Runde ${i}: x = Extract-Min(Q) gir ${name(r.x)}, lavest frekvens i køen${tieX ? " (lik frekvens: den som kom først inn i køen, tas først)" : ""}.`, r.before, { [r.x.id]: "current" });
      V.y = name(r.y);
      snap(7, `y = Extract-Min(Q) gir ${name(r.y)}, lavest av det som er igjen.`, r.before, { [r.x.id]: "current", [r.y.id]: "current" });
      const rest = r.before.slice(2);
      snap(
        [8, 9, 10],
        `Ny node z med x til venstre og y til høyre, og z.freq = ${r.x.freq} + ${r.y.freq} = ${r.z.freq}. Hvert tegn under z får én bit til i kodeordet, så sammenslåingen koster ${r.z.freq} bits i teksten.`,
        [r.z, ...rest],
        { [r.z.id]: "current" },
      );
      snap(11, `Insert(Q, z): treet går tilbake i køen, ordnet etter frekvensen ${r.z.freq}. ${r.after.length === 1 ? "Nå er det bare ett tre igjen." : `Køen har ${r.after.length} trær.`}`, r.after, { [r.z.id]: "done" });
    });
    V.i = V.x = V.y = "–";
    const inner = [];
    const walk = (t) => {
      if (t.ch) return;
      inner.push(t.freq);
      walk(t.left);
      walk(t.right);
    };
    walk(root);
    inner.sort((a, b) => a - b);
    const total = inner.reduce((a, b) => a + b, 0);
    const fixed = Math.ceil(Math.log2(n)) * pairs.reduce((s, p) => s + p[1], 0);
    snap(
      12,
      `return Extract-Min(Q) gir rota. Kodeordet til et tegn er veien fra rota, 0 til venstre og 1 til høyre. B(T) = ${inner.join(" + ")} = ${total} bits, mot ${fixed} med ${Math.ceil(Math.log2(n))} bits per tegn.`,
      [root],
      {},
      { final: true },
    );
    return frames;
  },

  render(stage, fr, api) {
    view.drawn.add(stage);
    const { w, h } = api.getSize();
    if (w <= 0 || h <= 0) {
      stage.innerHTML = "";
      return;
    }
    const { forest, marks, levels, final } = fr.hf;
    const fs = 0.74 * parseFloat(getComputedStyle(document.documentElement).fontSize || "16");
    const below = final ? 1.6 * fs : 0;
    const L = layout(forest, { x: 4, y: 6, w: w - 8, h: h - 12 }, { levels, below, maxDy: 54, fitGaps: fr.hf.n - 1 });
    const mk = new Map(Object.entries(marks).map(([k, v]) => [Number(k), v]));
    let svg = "";
    for (const t of forest) svg += drawTree(t, L, mk, new Map(), { bits: !!final, codes: !!final });
    const say = forest.map((t) => (t.ch ? `${t.ch} ${t.freq}` : `tre med ${t.freq} (${leaves(t).map((l) => l.ch).join("")})`)).join(", ");
    const cw = final ? ` Kodeord: ${Object.entries(codes(forest[0])).map(([c, b]) => `${c} ${b}`).join(", ")}.` : "";
    stage.setAttribute("aria-label", `Køen: ${say}.${cw}`);
    stage.innerHTML = svgWrap(w, h, svg).replace("<svg ", '<svg aria-hidden="true" ');
  },
};
