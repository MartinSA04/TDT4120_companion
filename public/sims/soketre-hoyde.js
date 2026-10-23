/**
 * «Rekkefølgen avgjør høyden» for TDT4120 modul 06 «Rotfaste trestrukturer».
 *
 * The one idea: every operation in a binary search tree costs O(h), and h
 * depends only on the order the keys went in. The same keys 1, 2, …, n give a
 * chain of height n − 1 when they are inserted in increasing order, a
 * complete tree of height ⌊lg n⌋ when the middle key goes in first, then the
 * middles of the halves, and a bushy tree whose height is a small multiple of
 * lg n when the order is random.
 *
 * The tree is built by Tree-Insert (CLRS 4th ed. §12.3, lecture 5) of the keys
 * 1 … n in the chosen order, starting from an empty tree:
 *  - «stigende»: 1, 2, …, n. Every key is larger than all before it, so it
 *    hangs as the right child of the previous one: a chain, h = n − 1.
 *  - «midten først»: the lower median ⌊(1 + n)/2⌋ of 1 … n, then the lower
 *    medians of the two halves, level by level (breadth first over the
 *    ranges): n = 7 gives 4, 2, 6, 1, 3, 5, 7 (the lecture's slides 199–207),
 *    n = 15 gives 8, 4, 12, 2, 6, 10, 14, 1, 3, 5, 7, 9, 11, 13, 15. The range
 *    [lo, hi] puts its median at the root of its subtree and leaves
 *    ⌊(hi − lo)/2⌋ and ⌈(hi − lo)/2⌉ keys to the halves, so a range of m keys
 *    has height 1 + the height of ⌊m/2⌋ keys: h = ⌊lg n⌋ for every n.
 *  - «tilfeldig»: a uniformly random order of 1 … n (Fisher–Yates).
 *
 * Numbers the module text may use (checked by running heightOf/orderOf below
 * in node; the random rows over 10 000 random orders each, Math.random):
 *   n                     1   7   15   31   63
 *   stigende       h =    0   6   14   30   62
 *   midten først   h =    0   2    3    4    5
 *   tilfeldig, h      n = 15    n = 31    n = 63
 *     mean               5,9       8,2      10,6
 *     median               6         8        10
 *     5 % – 95 %         4–8      6–10      9–13
 *     min – max         4–11      5–15      7–19
 *   tilfeldig, mean depth of a node (the comparisons Tree-Search needs for a
 *   key in the tree, minus one): 3,09, 4,32, 5,62 (theory 2(1 + 1/n)H_n − 4:
 *   3,08, 4,31, 5,61), against ⌊lg n⌋ = 3, 4, 5.
 *   n = 10⁶, tilfeldig (30 random orders, no drawing): h = 46 … 55, mean 49,7;
 *   mean depth 24,79 (theory 24,79), so about 26 comparisons per search; a
 *   chain would need 500 000 on average, binary search on the sorted table
 *   about 20 (lg 10⁶ = 19,9).
 * The first random trees (FIRST_SEED): n = 7: 5 2 4 3 1 6 7, h = 3; n = 15:
 * 7 1 13 6 8 15 2 14 12 11 5 10 4 9 3, h = 6; n = 31: h = 8; n = 63: h = 10.
 *
 * Drawing (one SVG, sizes in CSS px from remPx(), so it follows the reader's
 * text size). The tree laid out with bstPos: x = the key's rank (key k in
 * column k, since the keys are 1 … n), y = its depth. The vertical step is
 * fixed by n alone: the chain of n − 1 steps fills the tree area, so
 * switching the order never rescales the drawing, and a short tree is seen to
 * be short. With n ≤ 15 the nodes are circles with their key; above that,
 * small dots without keys. The longest path from the root to the deepest node
 * (the leftmost one if several are equally deep) is EDGE.path with its nodes
 * MARK.current; the rest is plain. On the left a vertical bracket from the
 * root's level to the deepest level, «h = 14» under its lower end (h counts
 * steps, not nodes). A dashed horizontal line across the tree at depth
 * ⌊lg n⌋, labelled «⌊lg n⌋ = 3» just above or below it, as far right as no
 * node or edge is in the way; when no such place exists (a dense random tree
 * on a phone), the label stands at the right under the deepest level and the
 * line turns down to it at its right end. When ⌊lg n⌋ = h the line is left
 * out and the label stands there too, on the row of «h = 3». With n ≤ 15 the
 * insertion order as a row of small keys at the bottom, labelled
 * «rekkefølge:» (on its own line above the keys when both do not fit on one).
 *
 * Controls: «Rekkefølge» (stigende | tilfeldig | midten først, aria-pressed),
 * the slider «n» (1 … 63, default 15), «Trekk på nytt» (a new random order,
 * disabled unless «tilfeldig»). First view: «stigende», n = 15, the chain.
 *
 * The random order comes from a seeded generator (mulberry32) salted with n,
 * so every n shows one fixed order until «Trekk på nytt» draws a fresh seed
 * from Math.random, and switching away from «tilfeldig» and back returns the
 * same tree. FIRST_SEED is chosen so the first random trees are typical: h at
 * the median of its distribution for n = 15, 31 and 63, at the most common
 * value for n = 7.
 *
 * Colours are framework tokens only (the marks of steppers/_tre.js), so the
 * drawing re-themes on the light/dark toggle. No animation.
 *
 * Contract: default-export init(api); host="dom", so api = { stage, controls,
 * getSize, onResize, signal }.
 */
import { EDGE, FONT, node, edge, text, bstPos, svgWrap, remPx, textW } from "../steppers/_tre.js";

export const N_MIN = 1;
export const N_MAX = 63;
const N_DEFAULT = 15;
/** Keys in the nodes up to this n, dots above. */
const KEYS_MAX = 15;
/** Seed of the first random orders (see the header). */
const FIRST_SEED = 361;

const ORDERS = {
  stigende: { label: "stigende", aria: "Stigende rekkefølge: 1, 2, …, n" },
  tilfeldig: { label: "tilfeldig", aria: "Tilfeldig rekkefølge" },
  midten: { label: "midten først", aria: "Midten først: midterste nøkkel først, så midten av hver halvdel" },
};

/** A small seeded generator (mulberry32): returns numbers in [0, 1). */
export function mulberry32(a) {
  return function () {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** One seed per (seed, n), so each n has its own stream. */
const salt = (seed, n) => (seed ^ Math.imul(n, 0x9e3779b1)) >>> 0;

/** A random order of 1 … n: Fisher–Yates with `rnd`. */
export function shuffled(n, rnd) {
  const a = Array.from({ length: n }, (_, i) => i + 1);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    const t = a[i];
    a[i] = a[j];
    a[j] = t;
  }
  return a;
}

/** The middle first: lower medians, breadth first over the ranges. */
export function middleFirst(n) {
  const out = [];
  const queue = [[1, n]];
  for (let q = 0; q < queue.length; q++) {
    const [lo, hi] = queue[q];
    if (lo > hi) continue;
    const m = Math.floor((lo + hi) / 2);
    out.push(m);
    queue.push([lo, m - 1], [m + 1, hi]);
  }
  return out;
}

/** The insertion order of 1 … n for an order kind; `seed` for «tilfeldig». */
export function orderOf(kind, n, seed) {
  if (kind === "stigende") return Array.from({ length: n }, (_, i) => i + 1);
  if (kind === "midten") return middleFirst(n);
  return shuffled(n, mulberry32(salt(seed, n)));
}

/**
 * Tree-Insert of the keys in `order` into an empty tree. Returns the nodes
 * ({ key, left, right, p, d } with indices into the array, d = depth), the
 * root's index (0, the first key) and h = the largest depth.
 */
export function treeOf(order) {
  const nodes = [];
  let h = 0;
  for (const key of order) {
    const z = { key, left: null, right: null, p: null, d: 0 };
    const zi = nodes.length;
    nodes.push(z);
    if (zi === 0) continue;
    let x = 0;
    let y = null;
    while (x !== null) {
      y = x;
      x = key < nodes[x].key ? nodes[x].left : nodes[x].right;
    }
    z.p = y;
    z.d = nodes[y].d + 1;
    if (key < nodes[y].key) nodes[y].left = zi;
    else nodes[y].right = zi;
    if (z.d > h) h = z.d;
  }
  return { nodes, root: nodes.length ? 0 : null, h };
}

/** h and the mean node depth of the tree built from `order`. */
export function heightOf(order) {
  const { nodes, h } = treeOf(order);
  let sum = 0;
  for (const z of nodes) sum += z.d;
  return { h, meanDepth: nodes.length ? sum / nodes.length : 0 };
}

export default function init({ stage, controls, getSize, onResize, signal }) {
  let kind = "stigende";
  let n = N_DEFAULT;
  let seed = FIRST_SEED;

  // ── kontroller ──────────────────────────────────────────────────────────
  // A group of buttons is not a labelable control, so the group gets the
  // framework's label layout on a <div role="group"> instead of a <label>
  // (a <label> would forward a click on its text to the first button).
  const btnGroup = (name, aria, entries, isOn, onPick) => {
    const wrap = document.createElement("div");
    wrap.setAttribute("role", "group");
    wrap.setAttribute("aria-label", aria);
    wrap.style.cssText =
      "display:flex;flex-direction:column;gap:var(--space-2);font-family:var(--font-mono);" +
      "font-size:var(--text-xs);color:var(--muted)";
    const head = document.createElement("span");
    head.textContent = name;
    const row = document.createElement("span");
    row.style.cssText = "display:flex;flex-wrap:wrap;gap:var(--space-2)";
    const btns = {};
    for (const k of Object.keys(entries)) {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "sim-btn";
      b.textContent = entries[k].label;
      b.setAttribute("aria-label", entries[k].aria);
      b.addEventListener(
        "click",
        () => {
          onPick(k);
          sync();
          render();
        },
        { signal },
      );
      btns[k] = b;
      row.append(b);
    }
    wrap.append(head, row);
    return {
      el: wrap,
      sync: () => Object.keys(btns).forEach((k) => btns[k].setAttribute("aria-pressed", String(isOn(k)))),
    };
  };

  const slider = (name, aria, min, max, value, onInput) => {
    const label = document.createElement("label");
    label.append(`${name} `);
    const out = document.createElement("output");
    const input = document.createElement("input");
    input.type = "range";
    input.min = String(min);
    input.max = String(max);
    input.step = "1";
    input.value = String(value);
    input.setAttribute("aria-label", aria);
    label.append(out, input);
    input.addEventListener(
      "input",
      () => {
        onInput(Number(input.value));
        sync();
        render();
      },
      { signal },
    );
    return { el: label, out, input };
  };

  const orderGroup = btnGroup("Rekkefølge", "Rekkefølgen nøklene settes inn i", ORDERS, (k) => k === kind, (k) => (kind = k));
  const nS = slider("n", "Antall nøkler n", N_MIN, N_MAX, n, (v) => (n = v));
  const dealBtn = document.createElement("button");
  dealBtn.type = "button";
  dealBtn.className = "sim-btn";
  dealBtn.textContent = "Trekk på nytt";
  dealBtn.setAttribute("aria-label", "Trekk på nytt: en ny tilfeldig rekkefølge");
  dealBtn.addEventListener(
    "click",
    () => {
      seed = Math.floor(Math.random() * 2 ** 32) >>> 0;
      sync();
      render();
    },
    { signal },
  );

  const groups = document.createElement("div");
  groups.style.cssText = "display:flex;flex-wrap:wrap;align-items:flex-end;gap:var(--space-4) var(--space-5)";
  groups.append(orderGroup.el, dealBtn);
  controls.append(groups, nS.el);

  function sync() {
    orderGroup.sync();
    nS.out.textContent = String(n);
    dealBtn.disabled = kind !== "tilfeldig";
  }

  // ── tegning ─────────────────────────────────────────────────────────────
  function render() {
    const { w, h } = getSize();
    if (w <= 0 || h <= 0) {
      stage.innerHTML = "";
      return;
    }
    const order = orderOf(kind, n, seed);
    const { nodes, root, h: height } = treeOf(order);
    const lgn = Math.floor(Math.log2(n));
    const keys = n <= KEYS_MAX;

    // Type sizes in px, read from the root so the layout follows the
    // reader's text size.
    const rem = remPx();
    const fsKey = 0.84 * rem;
    const fsLab = 0.84 * rem;
    const fsRow = 0.72 * rem;

    // Horizontal: the bracket at the left, then the tree's columns.
    const BR_X = 5;
    const TICK = 5;
    const x0 = BR_X + TICK + 4;
    const x1 = w - 4;
    const pitch = (x1 - x0) / n;

    // Vertical, bottom up: the order row (n ≤ 15), the band for «h = …»
    // under the deepest level, then the tree area. One line for the order
    // row if «rekkefølge:» and the keys fit side by side, else two.
    const rowGap = 0.6 * fsRow;
    const rowW = order.reduce((s, k) => s + textW(k, fsRow), 0) + (n - 1) * rowGap;
    const headW = textW("rekkefølge:", fsRow) + rowGap;
    const rowLines = !keys ? 0 : headW + rowW <= w - 8 ? 1 : 2;
    const rowBand = rowLines ? rowLines * fsRow * 1.45 + 8 : 0;
    const labBand = fsLab + 8;
    const PAD_T = 6;
    // A two-digit key needs r ≥ 8,8 to be drawn at 11 px (node() fits the
    // key inside the circle); 15 columns leave room for that on a phone.
    const R_KEY = 8.8;
    let r = keys ? Math.min(0.8 * rem, Math.max(R_KEY, 0.46 * pitch)) : Math.max(1.6, Math.min(3.4, 0.36 * pitch));
    const y0 = PAD_T + r;
    const yMax = h - rowBand - labBand - r;
    const DY_MAX = keys ? 3.4 * r : 22;
    const dy = n > 1 ? Math.min(DY_MAX, (yMax - y0) / (n - 1)) : 0;
    // Two neighbours in sorted order are a pitch apart sideways and at least
    // one step apart in depth (or two pitches apart on one level), so the
    // node radius leaves an edge visible between them.
    const near = Math.min(Math.hypot(pitch, dy), 2 * pitch);
    r = keys ? Math.max(R_KEY, Math.min(r, (near - 6) / 2)) : Math.min(r, 0.38 * near);

    const box = { x0, y0, w: x1 - x0, dy };
    const { pos } = bstPos(nodes, root, box);
    const Y = (d) => y0 + d * dy;

    // The longest path: from the leftmost deepest node up to the root.
    let deepest = null;
    for (const [i, p] of pos) if (nodes[i].d === height && (deepest === null || p.x < pos.get(deepest).x)) deepest = i;
    const onPath = new Set();
    for (let i = deepest; i !== null; i = nodes[i].p) onPath.add(i);

    let svg = "";
    const XS = `${FONT};font-size:${(Math.round(fsRow * 10) / 10).toString()}px`;
    const LAB = `${FONT};font-size:${(Math.round(fsLab * 10) / 10).toString()}px`;

    // The dashed line at depth ⌊lg n⌋, behind the tree.
    const lineY = Y(lgn);
    if (lgn < height)
      svg +=
        `<line x1="${x0.toFixed(1)}" y1="${lineY.toFixed(1)}" x2="${x1.toFixed(1)}" y2="${lineY.toFixed(1)}" ` +
        `style="stroke:var(--muted)" stroke-width="1.2" stroke-dasharray="6 4"/>`;

    // Edges, plain first, the path on top.
    const dotEdge = (a, b, mark) => {
      const e = EDGE[mark];
      return `<line x1="${a.x.toFixed(1)}" y1="${a.y.toFixed(1)}" x2="${b.x.toFixed(1)}" y2="${b.y.toFixed(1)}" style="stroke:${e.stroke}" stroke-width="${mark === "path" ? 2 : 1}" stroke-linecap="round"/>`;
    };
    const segs = [];
    for (const pass of ["plain", "path"])
      nodes.forEach((z, i) => {
        if (z.p === null) return;
        const mark = onPath.has(i) ? "path" : "plain";
        if (mark !== pass) return;
        const a = pos.get(z.p);
        const b = pos.get(i);
        segs.push([a, b]);
        svg += keys ? edge(a, b, r, mark) : dotEdge(a, b, mark);
      });

    // Nodes.
    nodes.forEach((z, i) => {
      const p = pos.get(i);
      const mark = onPath.has(i) ? "current" : "plain";
      if (keys) svg += node(p.x, p.y, r, z.key, mark, fsKey);
      else {
        const col = mark === "current" ? "var(--accent)" : "color-mix(in srgb, var(--fg) 55%, transparent)";
        svg += `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${r.toFixed(2)}" style="fill:${col}"/>`;
      }
    });

    // The bracket from the root's level to the deepest level, «h = …» under it.
    const yTop = Y(0);
    const yBot = Y(height);
    const BR = "stroke:color-mix(in srgb, var(--fg) 70%, transparent)";
    // No bracket for a lone root (h = 0): its two ends would meet in a dash.
    if (height > 0)
      svg +=
        `<path d="M ${BR_X + TICK} ${yTop.toFixed(1)} H ${BR_X} V ${yBot.toFixed(1)} H ${BR_X + TICK}" ` +
        `style="fill:none;${BR}" stroke-width="1.5" stroke-linejoin="round"/>`;
    const hLab = `h = ${height}`;
    const hY = yBot + r + fsLab * 0.8 + 3;
    svg += text(BR_X - 3, hY, hLab, `${LAB};font-weight:700;fill:var(--fg)`, "start");
    const hBox = { x: BR_X - 3, y: hY - fsLab * 0.8, w: textW(hLab, fsLab), h: fsLab };

    // «⌊lg n⌋ = …» by the dashed line, where nothing is drawn, in the small
    // size (it is a third of a phone stage wide even so).
    const lgLab = `⌊lg n⌋ = ${lgn}`;
    const lw = textW(lgLab, fsRow);
    const lh = fsRow;
    const free = (bx) => {
      const pad = 2;
      const L = bx.x - pad;
      const R = bx.x + bx.w + pad;
      const T = bx.y - pad;
      const B = bx.y + bx.h + pad;
      if (T < 0 || B > h - rowBand) return false;
      for (const p of pos.values()) if (p.x + r > L && p.x - r < R && p.y + r > T && p.y - r < B) return false;
      for (const [a, b] of segs) if (segHitsRect(a, b, L, T, R, B)) return false;
      if (L < hBox.x + hBox.w && R > hBox.x && T < hBox.y + hBox.h && B > hBox.y) return false;
      return true;
    };
    // Close to the line first, then clear of the nodes standing on it; on
    // each, the free place farthest to the right.
    const ys = [lineY - 4 - lh, lineY + 4, lineY - r - 3 - lh, lineY + r + 3];
    const xs = [];
    for (let x = x1 - lw; x >= x0 + 2; x -= 2) xs.push(x);
    const cands = ys.flatMap((y) => xs.map((x) => ({ x, y, w: lw, h: lh })));
    // Without the line (⌊lg n⌋ = h) the label pairs with «h = …» instead.
    const spot = lgn < height ? cands.find(free) : undefined;
    // Else (no line, or a dense tree on a phone): under the deepest level at
    // the right, on the row of «h = …», with the line (if any) turning down
    // to it at its right end, where no node or edge reaches.
    const at = spot ?? { x: x1 - lw, y: hY - lh * 0.8 };
    if (!spot && lgn < height)
      svg +=
        `<path d="M ${x1.toFixed(1)} ${lineY.toFixed(1)} V ${(at.y - 3).toFixed(1)}" ` +
        `style="fill:none;stroke:var(--muted)" stroke-width="1.2" stroke-dasharray="3 3"/>`;
    svg += text(at.x, at.y + lh * 0.8, lgLab, `${XS};fill:var(--muted)`, "start");

    // The insertion order at the bottom.
    if (rowLines) {
      const baseLast = h - 7;
      const lineH = fsRow * 1.45;
      let x = 4;
      let y = rowLines === 1 ? baseLast : baseLast - lineH;
      svg += text(x, y, "rekkefølge:", `${XS};fill:var(--muted)`, "start");
      if (rowLines === 1) x += headW;
      else y = baseLast;
      for (const k of order) {
        svg += text(x, y, k, `${XS};fill:var(--fg)`, "start");
        x += textW(k, fsRow) + rowGap;
      }
    }

    const how = kind === "stigende" ? "i stigende rekkefølge" : kind === "midten" ? "med midten først" : "i tilfeldig rekkefølge";
    stage.setAttribute(
      "aria-label",
      `Binært søketre med nøklene 1 til ${n} satt inn ${how}: høyden er h = ${height}, og ⌊lg n⌋ = ${lgn}.` +
        (keys ? ` Rekkefølge: ${order.join(", ")}.` : ""),
    );
    stage.innerHTML = svgWrap(w, h, svg).replace("<svg ", '<svg aria-hidden="true" ');
  }

  sync();
  onResize(render);
  render();
}

/** Does the segment a–b cross the rectangle [L, R] × [T, B]? */
function segHitsRect(a, b, L, T, R, B) {
  const inside = (p) => p.x >= L && p.x <= R && p.y >= T && p.y <= B;
  if (inside(a) || inside(b)) return true;
  // Liang–Barsky clipping.
  let t0 = 0;
  let t1 = 1;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const clip = (p, q) => {
    if (p === 0) return q >= 0;
    const t = q / p;
    if (p < 0) {
      if (t > t1) return false;
      if (t > t0) t0 = t;
    } else {
      if (t < t0) return false;
      if (t < t1) t1 = t;
    }
    return true;
  };
  return clip(-dx, a.x - L) && clip(dx, R - a.x) && clip(-dy, a.y - T) && clip(dy, B - a.y) && t0 <= t1;
}
