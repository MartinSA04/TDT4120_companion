/**
 * Decode-PFC, for <Stepper>, driving the block `decode-pfc` in modul 08
 * «Grådighet». The one idea: read the bits one at a time and walk down the
 * code tree, left on 0 and right on 1. A letter sits only in a leaf, so the
 * walk reaches a leaf exactly when a whole codeword has been read; print the
 * letter and start again at the root. No codeword is the start of another,
 * so there is never a choice to make.
 *
 * Block line numbers count the header as line 1, so the procedure's line k is
 * block line k + 1:
 *    1 Decode-PFC(T, C, n)
 *    2 1  x = T.root
 *    3 2  for i = 1 to n
 *    4 3      if C[i] == 0
 *    5 4          x = x.left
 *    6 5      else x = x.right
 *    7 6      if x is a leaf
 *    8 7          print x.key
 *    9 8          x = T.root
 * (the lecture's procedure, lecture 7; C is the coded text, n its length in
 * bits).
 *
 * Frames: x = T.root [2]; per bit one frame [3, 4, 5] or [3, 4, 6]; at a leaf
 * one more frame [7, 8, 9]; last the decoded text.
 *
 * The tree is Huffman's for the lecture's frequencies (A 5, B 9, C 12, D 13,
 * E 16, F 35): F 0, C 100, D 101, A 1100, B 1101, E 111. The first text is
 * BADE, the lecturer's word: 1101 1100 101 111, 14 bits (checked in node).
 * Later texts (the shuffle button): 3–5 letters drawn by frequency.
 *
 * Drawing: the tree on top (the marks of _kodetre.js), the path from the root
 * to x in accent and x itself accent; under it the bits as cells, the one
 * being read accent and the ones read faint; the printed text to the right
 * of «ut:». Colours are framework tokens only.
 */

import { svgWrap, text, cell, FONT } from "./_tre.js";
import { firstView } from "./_dp.js";
import { LECTURE, huffman, layout, drawTree, codes, depth } from "./_kodetre.js";

const view = firstView(import.meta.url);
const TREE = huffman(LECTURE).root;
const CODE = codes(TREE);
const f1 = (v) => (Math.round(v * 10) / 10).toString();

function randomWord() {
  const total = LECTURE.reduce((s, p) => s + p[1], 0);
  const len = 3 + Math.floor(Math.random() * 3);
  let w = "";
  for (let k = 0; k < len; k++) {
    let r = Math.random() * total;
    for (const [ch, fr] of LECTURE) {
      r -= fr;
      if (r < 0) {
        w += ch;
        break;
      }
    }
  }
  return w;
}

export default {
  defaultData() {
    return view.isFirst() ? "BADE" : randomWord();
  },

  run(word) {
    const bits = [...word].map((ch) => CODE[ch]).join("");
    const n = bits.length;
    const frames = [];
    const V = { i: "–", "C[i]": "–" };
    let out = "";
    let x = TREE;
    let path = [];
    const snap = (line, desc, extra = {}) =>
      frames.push({ line, desc, vars: { ...V }, dc: { bits, i: V.i, x: x.id, path: [...path], out, ...extra } });
    snap(2, `Den kodede teksten C har ${n} bits. x starter i rota.`, { i: 0 });
    for (let i = 1; i <= n; i++) {
      V.i = i;
      V["C[i]"] = bits[i - 1];
      const b = bits[i - 1];
      x = b === "0" ? x.left : x.right;
      path.push(x.id);
      const leaf = !x.left;
      snap(
        b === "0" ? [3, 4, 5] : [3, 4, 6],
        `C[${i}] = ${b}, så x går til ${b === "0" ? "venstre" : "høyre"} barn${leaf ? `, og det er løvnoden ${x.ch}.` : "."}`,
      );
      if (leaf) {
        out += x.ch;
        const ch = x.ch;
        x = TREE;
        path = [];
        snap([7, 8, 9], `x er en løvnode: skriv ut ${ch} og begynn på neste kodeord i rota.`, { printed: true });
      }
    }
    V.i = V["C[i]"] = "–";
    snap(3, `Alle ${n} bits er lest, og teksten er ${out}.`, { i: n + 1, done: true });
    return frames;
  },

  render(stage, fr, api) {
    view.drawn.add(stage);
    const { w, h } = api.getSize();
    if (w <= 0 || h <= 0) {
      stage.innerHTML = "";
      return;
    }
    const { bits, i, x, path, out } = fr.dc;
    const fs = 0.74 * parseFloat(getComputedStyle(document.documentElement).fontSize || "16");
    const LAB = `${FONT};font-size:${f1(fs)}px`;
    // Bits: as many cells per row as fit, at most 16.
    const n = bits.length;
    const perRow = (w - 8) / Math.min(n, 16) >= 16 ? Math.min(n, 16) : Math.floor((w - 8) / 16);
    const rows = Math.ceil(n / perRow);
    const cw = Math.min(26, (w - 8) / perRow);
    const chh = Math.min(26, cw * 1.15);
    const outH = fs * 1.8;
    const bitsH = rows * (chh + 4);
    const treeH = h - bitsH - outH - 14;
    const L = layout([TREE], { x: 4, y: 6, w: w - 8, h: treeH }, { levels: depth(TREE), topAlign: true, maxDy: 48 });
    const marks = new Map([[x, "current"]]);
    const edges = new Map(path.map((id) => [id, "path"]));
    let svg = drawTree(TREE, L, marks, edges, { bits: true });
    const y0 = 6 + treeH + 6;
    const x0 = (w - cw * perRow) / 2;
    for (let k = 0; k < n; k++) {
      const r = Math.floor(k / perRow);
      const c = k % perRow;
      const mark = k + 1 === i ? "current" : k + 1 < i ? "outside" : "plain";
      svg += cell(x0 + c * cw + 1, y0 + r * (chh + 4), cw - 2, chh, bits[k], mark, fs);
    }
    const yOut = y0 + bitsH + outH * 0.7;
    svg += text(x0, yOut, "ut:", `${LAB};fill:var(--muted)`, "start");
    svg += text(x0 + 3.2 * fs, yOut, out || "–", `${LAB};font-size:${f1(1.15 * fs)}px;font-weight:700;fill:var(--fg)`, "start");
    stage.setAttribute("aria-label", `Bit ${Math.min(i, n)} av ${n}. Skrevet ut: ${out || "ingenting ennå"}.`);
    stage.innerHTML = svgWrap(w, h, svg).replace("<svg ", '<svg aria-hidden="true" ');
  },
};
