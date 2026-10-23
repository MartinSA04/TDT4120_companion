/**
 * Shared drawing for the binary trees of modul 06 «Rotfaste trestrukturer»:
 * the search-tree steppers (tree-insert.js, inorder-tree-walk.js), the heap
 * steppers (extract-max.js, max-heap-insert.js, heapsort.js) and the sims
 * that import it (../steppers/_tre.js). One object keeps one mark in every
 * widget of the module, so the marks live here:
 *
 *   plain    a node or cell at rest
 *   current  the node the procedure stands on: x in a search tree, the
 *            element that sinks or rises in a heap (accent)
 *   compared what this step reads: the children Max-Heapify compares, the
 *            parent the rising element is compared with (indigo ring; orange was
 *            too close to the red accent in dark mode)
 *   done     finished: the new node z once it hangs in the tree, the sorted
 *            tail outside the heap (green)
 *   outside  in the table but outside the heap, not yet sorted, or a node
 *            used up (faint, dashed)
 *   slot     an empty place: the nil where z will hang, a heap slot that is
 *            not filled yet (dashed outline, no fill)
 *
 * Edges: plain; path (accent, the way down a search tree or the call stack
 * of a recursive walk, the way an element sank or rose); outside (dashed
 * faint, an edge to a node outside the heap).
 *
 * Everything is returned as SVG strings in CSS px, colours are framework
 * tokens only, so a frame re-themes on the light/dark toggle.
 *
 * Layouts:
 *   heapPos   node i of a heap (1-based) at depth ⌊lg i⌋, spread over its
 *             level, as CLRS fig. 6.1 draws a heap.
 *   bstPos    a search tree with x = the node's rank in sorted order (its
 *             place in Inorder-Tree-Walk) and y = its depth, so every node
 *             stands right above its place in the sorted row and a sorted
 *             row drawn under the tree lines up with the nodes.
 */

export const FONT = "font-family:var(--font-mono)";

/** Root font size in px, so drawings follow the reader's text size. */
export function remPx() {
  if (typeof document === "undefined") return 16;
  return parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
}

/** Fill, outline, outline width, text colour, dash. */
export const MARK = {
  plain: { fill: "color-mix(in srgb, var(--fg) 8%, var(--bg))", stroke: "color-mix(in srgb, var(--fg) 40%, transparent)", wdt: 1.3, text: "var(--fg)" },
  current: { fill: "color-mix(in srgb, var(--accent) 18%, var(--bg))", stroke: "var(--accent)", wdt: 2.4, text: "var(--accent-ink)" },
  compared: { fill: "color-mix(in srgb, var(--fg) 8%, var(--bg))", stroke: "var(--indigo)", wdt: 2.8, text: "var(--fg)" },
  done: { fill: "color-mix(in srgb, var(--green) 26%, var(--bg))", stroke: "var(--green)", wdt: 1.6, text: "var(--fg)" },
  outside: { fill: "var(--bg)", stroke: "var(--faint)", wdt: 1.2, text: "var(--faint)", dash: "4 3" },
  slot: { fill: "none", stroke: "color-mix(in srgb, var(--fg) 38%, transparent)", wdt: 1.3, text: "var(--muted)", dash: "4 3" },
};

export const EDGE = {
  plain: { stroke: "color-mix(in srgb, var(--fg) 38%, transparent)", wdt: 1.5 },
  path: { stroke: "var(--accent)", wdt: 3 },
  outside: { stroke: "var(--faint)", wdt: 1.2, dash: "4 3" },
  slot: { stroke: "color-mix(in srgb, var(--fg) 38%, transparent)", wdt: 1.3, dash: "4 3" },
};

const f1 = (v) => (Math.round(v * 10) / 10).toString();
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Width in px of a string in the mono font at size fs (0.6 em per glyph). */
export const textW = (s, fs) => String(s).length * 0.6 * fs;

/** Plain text. `style` is inline CSS (font, colour). */
export function text(x, y, s, style, anchor = "middle") {
  return `<text x="${f1(x)}" y="${f1(y)}" text-anchor="${anchor}" style="${style}">${esc(s)}</text>`;
}

/**
 * A node: a circle of radius r with its key centred in it. `fs` is the key's
 * font size in px; a key wider than the circle is drawn smaller.
 */
export function node(x, y, r, key, mark = "plain", fs = 14) {
  const m = MARK[mark] ?? MARK.plain;
  const dash = m.dash ? ` stroke-dasharray="${m.dash}"` : "";
  let s = `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r)}" style="fill:${m.fill};stroke:${m.stroke}" stroke-width="${m.wdt}"${dash}/>`;
  if (key !== null && key !== undefined && key !== "") {
    const k = String(key);
    const size = Math.min(fs, (2 * r - 4) / Math.max(1, k.length * 0.6));
    s += `<text x="${f1(x)}" y="${f1(y + size * 0.36)}" text-anchor="middle" style="${FONT};font-size:${f1(size)}px;font-weight:600;fill:${m.text}">${esc(k)}</text>`;
  }
  return s;
}

/** An edge from the circle around a to the circle around b (both radius r). */
export function edge(a, b, r, mark = "plain", rb = r) {
  const e = EDGE[mark] ?? EDGE.plain;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const d = Math.hypot(dx, dy) || 1;
  const x1 = a.x + (dx / d) * r;
  const y1 = a.y + (dy / d) * r;
  const x2 = b.x - (dx / d) * rb;
  const y2 = b.y - (dy / d) * rb;
  const dash = e.dash ? ` stroke-dasharray="${e.dash}"` : "";
  return `<line x1="${f1(x1)}" y1="${f1(y1)}" x2="${f1(x2)}" y2="${f1(y2)}" style="stroke:${e.stroke}" stroke-width="${e.wdt}" stroke-linecap="round"${dash}/>`;
}

/** A table cell (x, y = top left) with its value centred. */
export function cell(x, y, w, h, value, mark = "plain", fs = 14) {
  const m = MARK[mark] ?? MARK.plain;
  const dash = m.dash ? ` stroke-dasharray="${m.dash}"` : "";
  let s = `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" rx="3" style="fill:${m.fill};stroke:${m.stroke}" stroke-width="${m.wdt}"${dash}/>`;
  if (value !== null && value !== undefined && value !== "") {
    const v = String(value);
    const size = Math.min(fs, (w - 4) / Math.max(1, v.length * 0.6));
    s += `<text x="${f1(x + w / 2)}" y="${f1(y + h / 2 + size * 0.36)}" text-anchor="middle" style="${FONT};font-size:${f1(size)}px;font-weight:600;fill:${m.text}">${esc(v)}</text>`;
  }
  return s;
}

/** A small pointer name (x, y, i, m …) beside a node, in the accent unless told otherwise. */
export function tag(x, y, name, fs = 13, color = "var(--accent-ink)", anchor = "middle") {
  return `<text x="${f1(x)}" y="${f1(y)}" text-anchor="${anchor}" style="${FONT};font-size:${f1(fs)}px;font-weight:700;fill:${color}">${esc(name)}</text>`;
}

/** Depth of heap node i (1-based): ⌊lg i⌋. */
export const heapDepth = (i) => Math.floor(Math.log2(i));

/**
 * Position of heap node i (1-based) in a box { x0, y0, w, dy }: depth d =
 * ⌊lg i⌋ at y0 + d·dy, and the 2^d places of level d spread evenly over w.
 */
export function heapPos(i, box) {
  const d = heapDepth(i);
  const p = i - 2 ** d;
  return { x: box.x0 + ((p + 0.5) / 2 ** d) * box.w, y: box.y0 + d * box.dy, d };
}

/**
 * Layout of a binary search tree. `nodes` is an array of { key, left, right }
 * with left/right as indices into the array or null; `root` an index. Extra
 * places (a nil slot that is about to be filled) can be passed as `extra`:
 * [{ parent, side, key }], placed in sorted order like a node. Returns
 * { pos: Map(index → { x, y, d, rank }), extraPos: [{ x, y, d, rank }],
 * count, depth } with x = x0 + (rank + 0.5)·pitch over the box { x0, y0, w,
 * dy }.
 */
export function bstPos(nodes, root, box, extra = []) {
  // In-order list of places: real nodes and the extra slots hung on them.
  const order = [];
  const depth = new Map();
  const slotsAt = new Map(); // `${parent}:${side}` → extra index
  extra.forEach((e, j) => slotsAt.set(`${e.parent}:${e.side}`, j));
  let maxD = 0;
  const walk = (i, d) => {
    if (i === null || i === undefined) return;
    const n = nodes[i];
    const ls = slotsAt.get(`${i}:left`);
    if (n.left !== null && n.left !== undefined) walk(n.left, d + 1);
    else if (ls !== undefined) order.push({ extra: ls, d: d + 1 });
    order.push({ node: i, d });
    depth.set(i, d);
    maxD = Math.max(maxD, d);
    const rs = slotsAt.get(`${i}:right`);
    if (n.right !== null && n.right !== undefined) walk(n.right, d + 1);
    else if (rs !== undefined) order.push({ extra: rs, d: d + 1 });
  };
  if (root === null || root === undefined) {
    extra.forEach((e, j) => order.push({ extra: j, d: 0 }));
  } else walk(root, 0);
  const count = order.length;
  const pitch = box.w / Math.max(1, count);
  const pos = new Map();
  const extraPos = [];
  order.forEach((o, rank) => {
    const p = { x: box.x0 + (rank + 0.5) * pitch, y: box.y0 + o.d * box.dy, d: o.d, rank };
    maxD = Math.max(maxD, o.d);
    if (o.node !== undefined) pos.set(o.node, p);
    else extraPos[o.extra] = p;
  });
  return { pos, extraPos, count, depth: maxD, pitch };
}

/** The SVG wrapper every widget of the module uses. */
export function svgWrap(w, h, body, label = "") {
  const aria = label ? ` role="img" aria-label="${esc(label)}"` : "";
  return `<svg style="display:block" width="100%" height="100%" viewBox="0 0 ${Math.round(w)} ${Math.round(h)}" preserveAspectRatio="xMidYMid meet"${aria} xmlns="http://www.w3.org/2000/svg">${body}</svg>`;
}
