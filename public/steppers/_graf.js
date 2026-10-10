/**
 * Shared drawing for the graph steppers (dfs.js, topologisk-sortering.js,
 * sterke-komponenter.js and bfs.js in modul 08, and the graph modules after
 * it). A graph is a list of nodes on a small grid and a list of directed
 * edges; this file maps the grid into a box on the stage and returns SVG
 * strings, so each stepper only decides what state every node and edge is in.
 *
 * Nodes are drawn in the colours the algorithms use, as ink density: a white
 * node is empty, a gray node is half-filled and a black node is filled with
 * the ink colour. On the dark theme the ink is light, so "black" is the
 * strongest fill there too. The accent marks what the current step works on.
 *
 * A node is { id, gx, gy, label?, w? }: grid position, the text drawn in it
 * (the id if absent), and for box nodes the box width in px. Edges are
 * { from, to }. When both (u, v) and (v, u) exist, both are drawn bent so
 * they do not overlap.
 *
 * Colours are framework tokens only, so frames re-theme on the light/dark
 * toggle without the module knowing which theme is active.
 */

export const esc = (v) =>
  String(v).replace(
    /[&<>"]/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c],
  );

export const FONT = "font-family:var(--font-mono);font-size:var(--text-xs)";

/** Node styles. `white`/`gray`/`black` are the algorithms' own colours. */
export const NODE = {
  white: { fill: "var(--bg)", stroke: "var(--muted)", text: "var(--fg)" },
  gray: { fill: "color-mix(in srgb, var(--fg) 30%, var(--bg))", stroke: "var(--fg)", text: "var(--fg)" },
  black: { fill: "var(--fg)", stroke: "var(--fg)", text: "var(--bg)" },
};

/** Edge styles. `tree` gets a soft band under it, like the lecture slides. */
export const EDGE = {
  plain: { stroke: "var(--faint)", wdt: 1.2, opacity: 0.55 },
  cur: { stroke: "var(--accent)", wdt: 2.4 },
  tree: { stroke: "var(--fg)", wdt: 1.6, band: true },
  other: { stroke: "var(--muted)", wdt: 1.2, dash: "4 3" },
  faded: { stroke: "var(--faint)", wdt: 1, opacity: 0.35 },
};

/**
 * Pixel positions for the nodes, fitted into `box` = { x, y, w, h } with
 * `pad` = { l, r, t, b } kept free at the edges for node radii and stamps.
 * Returns a Map id → { x, y }.
 */
export function place(nodes, box, pad) {
  const gxs = nodes.map((n) => n.gx);
  const gys = nodes.map((n) => n.gy);
  const [x0, x1] = [Math.min(...gxs), Math.max(...gxs)];
  const [y0, y1] = [Math.min(...gys), Math.max(...gys)];
  const iw = box.w - pad.l - pad.r;
  const ih = box.h - pad.t - pad.b;
  const sx = x1 > x0 ? iw / (x1 - x0) : 0;
  const sy = y1 > y0 ? ih / (y1 - y0) : 0;
  const ox = box.x + pad.l + (x1 > x0 ? 0 : iw / 2);
  const oy = box.y + pad.t + (y1 > y0 ? 0 : ih / 2);
  const pos = new Map();
  for (const n of nodes) pos.set(n.id, { x: ox + (n.gx - x0) * sx, y: oy + (n.gy - y0) * sy });
  return pos;
}

/** Distance from a node's centre to its rim in direction (ux, uy). */
function rim(shape, ux, uy) {
  if (shape.r) return shape.r;
  const tx = Math.abs(ux) > 1e-9 ? shape.hw / Math.abs(ux) : Infinity;
  const ty = Math.abs(uy) > 1e-9 ? shape.hh / Math.abs(uy) : Infinity;
  return Math.min(tx, ty);
}

const unit = (dx, dy) => {
  const len = Math.hypot(dx, dy) || 1;
  return [dx / len, dy / len];
};

const ARROW = 8;

/**
 * Geometry for the edge a → b between two shapes. `bend` > 0 curves the edge
 * to the left of its direction. Returns { d, head, mid }: the path for the
 * line (stopping at the arrowhead's base), the arrowhead polygon points and
 * the curve's midpoint for a badge.
 */
export function edgeGeom(a, b, sa, sb, bend = 0) {
  const [dx, dy] = unit(b.x - a.x, b.y - a.y);
  const c = { x: (a.x + b.x) / 2 - dy * bend, y: (a.y + b.y) / 2 + dx * bend };
  const [ax, ay] = bend ? unit(c.x - a.x, c.y - a.y) : [dx, dy];
  const [bx, by] = bend ? unit(c.x - b.x, c.y - b.y) : [-dx, -dy];
  const p = { x: a.x + ax * rim(sa, ax, ay), y: a.y + ay * rim(sa, ax, ay) };
  const tip = { x: b.x + bx * (rim(sb, -bx, -by) + 1), y: b.y + by * (rim(sb, -bx, -by) + 1) };
  // Direction the line arrives in at the tip.
  const [tx, ty] = bend ? unit(tip.x - c.x, tip.y - c.y) : [dx, dy];
  const base = { x: tip.x - tx * ARROW, y: tip.y - ty * ARROW };
  const head =
    `${tip.x.toFixed(1)},${tip.y.toFixed(1)} ` +
    `${(base.x - ty * 4).toFixed(1)},${(base.y + tx * 4).toFixed(1)} ` +
    `${(base.x + ty * 4).toFixed(1)},${(base.y - tx * 4).toFixed(1)}`;
  const end = { x: tip.x - tx * (ARROW - 1), y: tip.y - ty * (ARROW - 1) };
  const d = bend
    ? `M${p.x.toFixed(1)} ${p.y.toFixed(1)} Q${c.x.toFixed(1)} ${c.y.toFixed(1)} ${end.x.toFixed(1)} ${end.y.toFixed(1)}`
    : `M${p.x.toFixed(1)} ${p.y.toFixed(1)} L${end.x.toFixed(1)} ${end.y.toFixed(1)}`;
  const mid = bend
    ? { x: 0.25 * p.x + 0.5 * c.x + 0.25 * tip.x, y: 0.25 * p.y + 0.5 * c.y + 0.25 * tip.y }
    : { x: (p.x + tip.x) / 2, y: (p.y + tip.y) / 2 };
  const len = Math.hypot(tip.x - p.x, tip.y - p.y);
  return { d, head, mid, len, nx: -dy, ny: dx };
}

/**
 * SVG for one edge. `st` is an EDGE style; `badge` an optional letter drawn
 * in a small disc at the middle of the edge.
 */
export function edgeSvg(g, st, badge) {
  let s = "";
  const op = st.opacity != null ? ` opacity="${st.opacity}"` : "";
  if (st.band) {
    s +=
      `<path d="${g.d}" fill="none" stroke-linecap="round" ` +
      `style="stroke:color-mix(in srgb, var(--fg) 16%, transparent)" stroke-width="9"/>`;
  }
  s +=
    `<path d="${g.d}" fill="none"${op} style="stroke:${st.stroke}" stroke-width="${st.wdt}"` +
    `${st.dash ? ` stroke-dasharray="${st.dash}"` : ""}/>`;
  s += `<polygon points="${g.head}"${op} style="fill:${st.stroke}"/>`;
  if (badge) {
    // On a short edge the badge would hide the arrowhead: lift it off the line.
    if (g.len < 46) g = { ...g, mid: { x: g.mid.x + g.nx * 12, y: g.mid.y + g.ny * 12 } };
    s +=
      `<circle cx="${g.mid.x.toFixed(1)}" cy="${g.mid.y.toFixed(1)}" r="8.5" ` +
      `style="fill:var(--bg);stroke:${st.stroke}" stroke-width="1"/>`;
    s +=
      `<text x="${g.mid.x.toFixed(1)}" y="${(g.mid.y + 4).toFixed(1)}" text-anchor="middle" ` +
      `style="fill:${st.stroke};${FONT};font-weight:600">${esc(badge)}</text>`;
  }
  return s;
}

/** Bend for an edge whose reverse also exists, else 0. */
export function bendFor(edges, e, amount = 9) {
  return edges.some((f) => f.from === e.to && f.to === e.from) ? amount : 0;
}

/**
 * SVG for one node. `st` is a NODE style; `ring` an optional accent ring
 * (the node the step works on); `sub` an optional second line under the
 * label, for box nodes.
 */
export function nodeSvg(p, shape, label, st, ring, sub) {
  let s = "";
  if (shape.r) {
    if (ring) {
      s +=
        `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${(shape.r + 4).toFixed(1)}" ` +
        `style="fill:none;stroke:var(--accent)" stroke-width="2.4"/>`;
    }
    s +=
      `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${shape.r.toFixed(1)}" ` +
      `style="fill:${st.fill};stroke:${st.stroke}" stroke-width="1.4"/>`;
  } else {
    if (ring) {
      s +=
        `<rect x="${(p.x - shape.hw - 4).toFixed(1)}" y="${(p.y - shape.hh - 4).toFixed(1)}" ` +
        `width="${(2 * shape.hw + 8).toFixed(1)}" height="${(2 * shape.hh + 8).toFixed(1)}" rx="7" ` +
        `style="fill:none;stroke:var(--accent)" stroke-width="2.4"/>`;
    }
    s +=
      `<rect x="${(p.x - shape.hw).toFixed(1)}" y="${(p.y - shape.hh).toFixed(1)}" ` +
      `width="${(2 * shape.hw).toFixed(1)}" height="${(2 * shape.hh).toFixed(1)}" rx="4" ` +
      `style="fill:${st.fill};stroke:${st.stroke}" stroke-width="1.4"/>`;
  }
  const ly = sub != null ? p.y - 2 : p.y + 4;
  s +=
    `<text x="${p.x.toFixed(1)}" y="${ly.toFixed(1)}" text-anchor="middle" ` +
    `style="fill:${st.text};${FONT};font-weight:600">${esc(label)}</text>`;
  if (sub != null) {
    s +=
      `<text x="${p.x.toFixed(1)}" y="${(p.y + 12).toFixed(1)}" text-anchor="middle" ` +
      `style="fill:${st.text};${FONT};opacity:0.8">${esc(sub)}</text>`;
  }
  return s;
}

/**
 * The whole graph: edges first (each from `edgeStyle(e)` → { st, badge }),
 * then nodes (from `nodeStyle(n)` → { st, ring, sub }). `shapeOf(n)` gives the
 * node shape, { r } for a circle or { hw, hh } for a box.
 */
export function graphSvg(graph, pos, shapeOf, nodeStyle, edgeStyle) {
  const byId = new Map(graph.nodes.map((n) => [n.id, n]));
  const drawn = graph.edges.map((e) => ({ e, ...edgeStyle(e) }));
  // Plain edges at the bottom, then styled ones, so highlights sit on top.
  const rank = (x) => (x.st === EDGE.plain || x.st === EDGE.faded ? 0 : x.st === EDGE.cur ? 2 : 1);
  drawn.sort((x, y) => rank(x) - rank(y));
  let s = "";
  for (const { e, st, badge } of drawn) {
    const g = edgeGeom(
      pos.get(e.from),
      pos.get(e.to),
      shapeOf(byId.get(e.from)),
      shapeOf(byId.get(e.to)),
      bendFor(graph.edges, e),
    );
    s += edgeSvg(g, st, badge);
  }
  for (const n of graph.nodes) {
    const { st, ring, sub } = nodeStyle(n);
    s += nodeSvg(pos.get(n.id), shapeOf(n), n.label ?? n.id, st, ring, sub);
  }
  return s;
}

/** A small text label next to a node: `side` is "n", "s", "e" or "w". */
export function stamp(p, shape, side, text, color = "var(--muted)") {
  const r = shape.r ?? (side === "e" || side === "w" ? shape.hw : shape.hh);
  const gap = 8;
  const at = {
    n: [p.x, p.y - r - gap - 1, "middle"],
    s: [p.x, p.y + r + gap + 10, "middle"],
    e: [p.x + r + gap, p.y + 4, "start"],
    w: [p.x - r - gap, p.y + 4, "end"],
  }[side];
  return (
    `<text x="${at[0].toFixed(1)}" y="${at[1].toFixed(1)}" text-anchor="${at[2]}" ` +
    `style="fill:${color};${FONT}">${esc(text)}</text>`
  );
}

/**
 * A row of cells, as for a queue or a list. `items` are the texts; `styleOf(i)`
 * returns { fill, stroke, text } for cell i. Returns the SVG string.
 */
export function cellsSvg(x, y, cellW, cellH, items, styleOf) {
  let s = "";
  items.forEach((it, i) => {
    const st = styleOf(i);
    const cx = x + i * cellW;
    s +=
      `<rect x="${(cx + 1).toFixed(1)}" y="${y.toFixed(1)}" width="${(cellW - 2).toFixed(1)}" height="${cellH}" rx="4" ` +
      `style="fill:${st.fill};stroke:${st.stroke}" stroke-width="${st.wdt ?? 1.2}"/>`;
    s +=
      `<text x="${(cx + cellW / 2).toFixed(1)}" y="${(y + cellH / 2 + 4).toFixed(1)}" text-anchor="middle" ` +
      `style="fill:${st.text};${FONT}">${esc(it)}</text>`;
  });
  return s;
}

export function wrapSvg(w, h, body) {
  return (
    `<svg width="100%" height="100%" viewBox="0 0 ${w.toFixed(0)} ${h.toFixed(0)}" ` +
    `preserveAspectRatio="none" role="img" aria-hidden="true" style="display:block">${body}</svg>`
  );
}

/**
 * Pairs of nodes whose straight segment keeps at least `clear` grid units
 * away from every other node and spans at most `maxLen` grid units: the
 * edges a random graph on this layout may use without running through a node.
 */
export function candidates(nodes, clear = 0.45, maxLen = 3.2) {
  const out = [];
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i];
      const b = nodes[j];
      const len = Math.hypot(b.gx - a.gx, b.gy - a.gy);
      if (len > maxLen) continue;
      const ok = nodes.every((c) => {
        if (c === a || c === b) return true;
        const t = ((c.gx - a.gx) * (b.gx - a.gx) + (c.gy - a.gy) * (b.gy - a.gy)) / (len * len);
        if (t <= 0 || t >= 1) return true;
        const px = a.gx + t * (b.gx - a.gx) - c.gx;
        const py = a.gy + t * (b.gy - a.gy) - c.gy;
        return Math.hypot(px, py) > clear;
      });
      if (ok) out.push([a.id, b.id]);
    }
  }
  return out;
}

export function shuffle(a) {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
}

/** Adjacency lists in the edges' order: id → [ids]. */
export function adjacency(graph) {
  const adj = new Map(graph.nodes.map((n) => [n.id, []]));
  for (const e of graph.edges) adj.get(e.from).push(e.to);
  return adj;
}

/** Whether segment p–q crosses the axis-aligned rectangle b = { x0, y0, x1, y1 }. */
function segHitsRect(p, q, b) {
  // Liang–Barsky clipping: the segment hits the box if some part survives.
  let t0 = 0;
  let t1 = 1;
  const dx = q.x - p.x;
  const dy = q.y - p.y;
  for (const [pp, qq] of [[-dx, p.x - b.x0], [dx, b.x1 - p.x], [-dy, p.y - b.y0], [dy, b.y1 - p.y]]) {
    if (pp === 0) {
      if (qq < 0) return false;
    } else {
      const t = qq / pp;
      if (pp < 0) t0 = Math.max(t0, t);
      else t1 = Math.min(t1, t);
      if (t0 > t1) return false;
    }
  }
  return true;
}

/**
 * The side ("n", "s", "e", "w") for each node's stamp where a stamp of
 * `chars(node)` characters touches no edge, no other node and no stamp
 * placed before it, and stays inside `bounds` = { w, h }. The sides are
 * tried in the order of `prefer(node)`; if all are taken, the side with
 * fewest hits wins.
 */
export function stampSides(graph, pos, shapeOf, chars, prefer, bounds = { w: Infinity, h: Infinity }) {
  const out = new Map();
  const placed = [];
  for (const nd of graph.nodes) {
    const p = pos.get(nd.id);
    const sh = shapeOf(nd);
    const rx = sh.r ?? sh.hw;
    const ry = sh.r ?? sh.hh;
    const cw = 7 * chars(nd);
    const box = {
      n: { x0: p.x - cw / 2, x1: p.x + cw / 2, y0: p.y - ry - 21, y1: p.y - ry - 6 },
      s: { x0: p.x - cw / 2, x1: p.x + cw / 2, y0: p.y + ry + 6, y1: p.y + ry + 21 },
      e: { x0: p.x + rx + 6, x1: p.x + rx + 8 + cw, y0: p.y - 8, y1: p.y + 8 },
      w: { x0: p.x - rx - 8 - cw, x1: p.x - rx - 6, y0: p.y - 8, y1: p.y + 8 },
    };
    let best = null;
    for (const side of prefer(nd)) {
      const b = box[side];
      let hits = b.x0 < 0 || b.y0 < 0 || b.x1 > bounds.w || b.y1 > bounds.h ? 2 : 0;
      for (const e of graph.edges) {
        if (segHitsRect(pos.get(e.from), pos.get(e.to), b)) hits++;
      }
      for (const m of graph.nodes) {
        if (m === nd) continue;
        const q = pos.get(m.id);
        const r = (shapeOf(m).r ?? shapeOf(m).hw) + 2;
        if (q.x + r > b.x0 && q.x - r < b.x1 && q.y + r > b.y0 && q.y - r < b.y1) hits++;
      }
      for (const o of placed) {
        if (o.x0 - 8 < b.x1 && o.x1 + 8 > b.x0 && o.y0 - 2 < b.y1 && o.y1 + 2 > b.y0) hits += 2;
      }
      if (!best || hits < best.hits) best = { side, hits, b };
      if (hits === 0) break;
    }
    placed.push(best.b);
    out.set(nd.id, best.side);
  }
  return out;
}

/**
 * The lecture's example graph for DFS and BFS, laid out on its side so it
 * fits a phone: node 1 at the top left, 9 to the right. The adjacency lists
 * are in the lecture's order (from 3, DFS goes to 7 before 5).
 */
export const FORELESNING = {
  nodes: [
    { id: 1, gx: 1, gy: 0 },
    { id: 2, gx: 1, gy: 1 },
    { id: 3, gx: 2, gy: 0 },
    { id: 4, gx: 2, gy: 2 },
    { id: 5, gx: 3, gy: 1 },
    { id: 6, gx: 4, gy: 1 },
    { id: 7, gx: 5, gy: 0 },
    { id: 8, gx: 5, gy: 2 },
    { id: 9, gx: 6, gy: 1 },
  ],
  edges: [
    [1, 2], [2, 3], [2, 4], [3, 7], [3, 5], [4, 5],
    [5, 6], [6, 7], [7, 8], [8, 6], [8, 4], [9, 8],
  ].map(([from, to]) => ({ from, to })),
};

/** A random graph on `nodes`: each candidate pair one way, the other way, both or neither. */
export function randomGraph(nodes, pairs, { one = 0.4, both = 0.06, min = 10, max = 16 } = {}) {
  for (;;) {
    const edges = [];
    for (const [a, b] of pairs) {
      const r = Math.random();
      if (r < one) edges.push({ from: a, to: b });
      else if (r < 2 * one) edges.push({ from: b, to: a });
      else if (r < 2 * one + both) edges.push({ from: a, to: b }, { from: b, to: a });
    }
    if (edges.length >= min && edges.length <= max) return { nodes, edges: shuffle(edges) };
  }
}
