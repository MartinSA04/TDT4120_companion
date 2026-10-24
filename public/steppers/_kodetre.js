/**
 * Shared drawing for the code trees of modul 08 «Grådighet»: the steppers
 * huffman.js and decode-pfc.js. One object keeps one mark in both: a leaf is
 * a rounded box with its letter over its frequency (CLRS fig. 15.5 writes
 * «a:45» on one line, which does not fit seven leaves on a phone), an inner node is a circle with the sum of the frequencies
 * under it, and the edge to a left child carries 0, to a right child 1. The
 * marks are those of _tre.js (plain, current, compared, done, outside).
 *
 * A tree node is { ch, freq, left, right, id }; a leaf has ch and no
 * children. Layout: the leaves of a forest stand side by side in left-to-right
 * order, a small gap between trees, and an inner node is centred over its two
 * children, one level per depth (CLRS fig. 15.6 draws the queue this way).
 *
 * Everything is returned as SVG strings in CSS px with framework tokens only.
 */
import { MARK, EDGE, FONT, text, remPx } from "./_tre.js";

const f1 = (v) => (Math.round(v * 10) / 10).toString();

/** The lecture's frequencies (CLRS fig. 15.4 renamed): A 5, B 9, C 12, D 13, E 16, F 35. */
export const LECTURE = [
  ["A", 5],
  ["B", 9],
  ["C", 12],
  ["D", 13],
  ["E", 16],
  ["F", 35],
];

export const isLeaf = (t) => !t.left && !t.right;
export const depth = (t) => (isLeaf(t) ? 0 : 1 + Math.max(depth(t.left), depth(t.right)));
export const leaves = (t) => (isLeaf(t) ? [t] : [...leaves(t.left), ...leaves(t.right)]);

/** Codeword of every letter: the path from the root, 0 left and 1 right. */
export function codes(t, pre = "", out = {}) {
  if (isLeaf(t)) out[t.ch] = pre || "0";
  else {
    codes(t.left, pre + "0", out);
    codes(t.right, pre + "1", out);
  }
  return out;
}

/**
 * Huffman(C) with a stable priority queue: on equal frequency the node that
 * entered the queue first comes out first, and a new node z enters after the
 * nodes already there. Returns the rounds [{ x, y, z, queueBefore, queueAfter }]
 * and the root.
 */
export function huffman(pairs) {
  let id = 0;
  let seq = 0;
  let Q = pairs.map(([ch, freq]) => ({ ch, freq, id: id++, seq: seq++ }));
  const order = (q) => [...q].sort((a, b) => a.freq - b.freq || a.seq - b.seq);
  Q = order(Q);
  const rounds = [];
  for (let i = 1; i < pairs.length; i++) {
    const before = Q;
    const [x, y, ...rest] = Q;
    const z = { freq: x.freq + y.freq, left: x, right: y, id: id++, seq: seq++ };
    Q = order([...rest, z]);
    rounds.push({ x, y, z, before, after: Q });
  }
  return { rounds, root: Q[0], start: order(pairs.map((p, k) => ({ ch: p[0], freq: p[1], id: k, seq: k }))) };
}

/**
 * Lay out a forest (array of roots) in a box { x, y, w, h }. Returns
 * { pos: Map(id → {x, y}), r, lw, lh, fs, dy }.
 */
export function layout(forest, box, opts = {}) {
  const rem = remPx();
  const fs = opts.fs ?? 0.74 * rem;
  const nLeaves = forest.reduce((s, t) => s + leaves(t).length, 0);
  const gaps = forest.length - 1;
  const gapW = 0.35;
  const unit = box.w / (nLeaves + gaps * gapW);
  // Leaf size and label style come from opts.fitGaps (the most trees the run will show side by
  // side) when given, so a stepper keeps one leaf style through all its frames.
  const fitUnit = box.w / (nLeaves + (opts.fitGaps ?? gaps) * gapW);
  const lw = Math.min(fitUnit - 7, 2.6 * fs);
  // One font size for every leaf label, so the forest reads evenly: the letter over the frequency.
  const digits = Math.max(2, ...forest.flatMap((t) => leaves(t).map((l) => String(l.freq).length)));
  const leafFs = Math.min(fs, (lw - 4) / (0.6 * digits));
  const lh = 2.3 * leafFs + 6;
  const r = Math.min(1.25 * fs, (unit - 4) / 2);
  const levels = Math.max(1, opts.levels ?? 0, ...forest.map(depth));
  const below = opts.below ?? 0;
  const dy = Math.min(opts.maxDy ?? 52, (box.h - lh - r - below) / levels);
  const pos = new Map();
  let k = 0;
  forest.forEach((t, ti) => {
    const d0 = levels - depth(t); // trees stand on a common ground line
    const place = (n, d) => {
      if (isLeaf(n)) {
        pos.set(n.id, { x: box.x + (k + ti * gapW + 0.5) * unit, y: box.y + r + d * dy });
        k++;
      } else {
        place(n.left, d + 1);
        place(n.right, d + 1);
        const a = pos.get(n.left.id);
        const b = pos.get(n.right.id);
        pos.set(n.id, { x: (a.x + b.x) / 2, y: box.y + r + d * dy });
      }
    };
    place(t, opts.topAlign ? 0 : d0);
  });
  return { pos, r, lw, lh, fs, dy, unit, leafFs };
}

/**
 * Draw a tree from a layout. marks: Map(id → mark) for nodes, edges: Map(id
 * of the child → edge mark). opts.bits writes 0/1 on the edges, opts.codes
 * writes each leaf's codeword under it.
 */
export function drawTree(t, L, marks = new Map(), edges = new Map(), opts = {}) {
  const LAB = `${FONT};font-size:${f1(L.fs)}px`;
  let s = "";
  const walk = (n) => {
    if (isLeaf(n)) return;
    for (const [c, bit] of [
      [n.left, "0"],
      [n.right, "1"],
    ]) {
      const a = L.pos.get(n.id);
      const b = L.pos.get(c.id);
      const e = EDGE[edges.get(c.id) ?? "plain"] ?? EDGE.plain;
      const by = isLeaf(c) ? b.y - L.lh / 2 : b.y - L.r;
      const dx = b.x - a.x;
      const dyy = by - a.y;
      const d = Math.hypot(dx, dyy) || 1;
      const x1 = a.x + (dx / d) * L.r;
      const y1 = a.y + (dyy / d) * L.r;
      const dash = e.dash ? ` stroke-dasharray="${e.dash}"` : "";
      s += `<line x1="${f1(x1)}" y1="${f1(y1)}" x2="${f1(b.x)}" y2="${f1(by)}" style="stroke:${e.stroke}" stroke-width="${e.wdt}" stroke-linecap="round"${dash}/>`;
      if (opts.bits) {
        const mx = (x1 + b.x) / 2 + (bit === "0" ? -1 : 1) * 0.55 * L.fs;
        const my = (y1 + by) / 2 + 0.2 * L.fs;
        const on = edges.get(c.id) === "path";
        s += text(mx, my, bit, `${LAB};font-size:${f1(0.86 * L.fs)}px;fill:${on ? "var(--accent-ink)" : "var(--muted)"};font-weight:${on ? 700 : 400}`);
      }
      walk(c);
    }
  };
  walk(t);
  const code = opts.codes ? codes(t) : null;
  // Codewords under neighbouring leaves must not run together.
  const cf = code ? Math.min(L.fs, (L.unit - 4) / (0.6 * Math.max(...Object.values(code).map((c) => c.length)))) : L.fs;
  const draw = (n) => {
    const p = L.pos.get(n.id);
    const m = MARK[marks.get(n.id) ?? "plain"] ?? MARK.plain;
    const dash = m.dash ? ` stroke-dasharray="${m.dash}"` : "";
    if (isLeaf(n)) {
      s += `<rect x="${f1(p.x - L.lw / 2)}" y="${f1(p.y - L.lh / 2)}" width="${f1(L.lw)}" height="${f1(L.lh)}" rx="5" style="fill:${m.fill};stroke:${m.stroke}" stroke-width="${m.wdt}"${dash}/>`;
      const lf = L.leafFs;
      const st = `${FONT};font-size:${f1(lf)}px;font-weight:600;fill:${m.text}`;
      s += text(p.x, p.y - 0.18 * lf, n.ch, `${st};font-weight:700`) + text(p.x, p.y + 0.95 * lf, n.freq, st);
      if (code) s += text(p.x, p.y + L.lh / 2 + cf * 1.15, code[n.ch], `${FONT};font-size:${f1(cf)}px;font-weight:700;fill:var(--accent-ink)`);
    } else {
      s += `<circle cx="${f1(p.x)}" cy="${f1(p.y)}" r="${f1(L.r)}" style="fill:${m.fill};stroke:${m.stroke}" stroke-width="${m.wdt}"${dash}/>`;
      s += text(p.x, p.y + L.fs * 0.36, n.freq, `${LAB};font-weight:600;fill:${m.text}`);
      draw(n.left);
      draw(n.right);
    }
  };
  draw(t);
  return s;
}
