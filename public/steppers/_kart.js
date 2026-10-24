/**
 * The map of modul 11 «Korteste vei fra én til alle», shared by the sim
 * «Strøm fra hytta» and the steppers bellman-ford.js, dijkstra.js and
 * dijkstra-strom.js. Six places in the mountains, drawn with height
 * upwards: 1 hytta (700 m), 2 skaret (900 m), 3 setra and 4 bygda (300 m),
 * 5 kaia and 6 butikken by the fjord (0 m). Seven roads, each driven both
 * ways.
 *
 * STROM is the map as a directed graph whose weights are what an electric
 * car uses in kWh: uphill costs, a steep downhill charges the battery, so
 * some weights are negative, but every round trip costs more than it gives.
 * KM is the same map with the road lengths, undirected.
 *
 * As on the lecture slides, a node shows its estimate v.d inside the circle
 * and its number outside. Each directed edge of STROM is bent, so a road
 * shows as two arcs with the weight of each on its own arc.
 *
 * Colours are framework tokens only, so frames re-theme on the light/dark
 * toggle without the module knowing which theme is active.
 */
import { EDGE, FONT, NODE, edgeGeom, edgeSvg, esc, lineGeom, weightSvg } from "./_graf.js";

/** Places: grid x, height in metres, and the side the number goes on. */
export const STEDER = [
  { id: 1, gx: 0, h: 700, side: "w" },
  { id: 2, gx: 2, h: 900, side: "e" },
  { id: 3, gx: 1, h: 300, side: "w" },
  { id: 4, gx: 3, h: 300, side: "e" },
  { id: 5, gx: 0.4, h: 0, side: "w" },
  { id: 6, gx: 3.4, h: 0, side: "e" },
];

/** Roads: [a, b, km, kWh a→b, kWh b→a]. */
const VEIER = [
  [1, 2, 3, 2, -1],
  [1, 3, 8, 1, 4],
  [2, 3, 6, -2, 5],
  [2, 4, 5, -2, 5],
  [3, 5, 4, -1, 3],
  [4, 6, 3, -1, 3],
  [5, 6, 6, 1, 1],
];

export const STROM = {
  nodes: STEDER,
  edges: VEIER.flatMap(([a, b, , wab, wba]) => [
    { from: a, to: b, w: wab },
    { from: b, to: a, w: wba },
  ]),
};

export const KM = {
  undirected: true,
  nodes: STEDER,
  edges: VEIER.map(([a, b, km]) => ({ from: a, to: b, w: km })),
};

export const fmt = (x) => (x === Infinity ? "∞" : x === -Infinity ? "−∞" : String(x).replace("-", "−"));

/** A weight as the second term of a sum: a negative one in parentheses, «6 + (−1)». */
export const term = (x) => (x < 0 ? `(${fmt(x)})` : fmt(x));

/**
 * Pixel positions in a w × h stage: height upwards, with `left` px kept free
 * for the height axis. Returns { pos, r, axis } where axis is the SVG of the
 * gridlines and their labels.
 */
export function layout(w, h, { left = 50, top = 24, bottom = 24, right = 26 } = {}) {
  const r = Math.max(13, Math.min(16, w / 26));
  const xs = STEDER.map((n) => n.gx);
  const x0 = Math.min(...xs);
  const x1 = Math.max(...xs);
  const padX = r + 22;
  const iw = w - left - right - 2 * padX;
  const ih = h - top - bottom - 2 * r;
  const X = (gx) => left + padX + ((gx - x0) / (x1 - x0)) * iw;
  const Y = (m) => top + r + (1 - m / 900) * ih;
  const pos = new Map(STEDER.map((n) => [n.id, { x: X(n.gx), y: Y(n.h) }]));
  let axis = "";
  for (const m of [0, 300, 600, 900]) {
    const y = Y(m);
    axis +=
      `<line x1="${left - 4}" y1="${y.toFixed(1)}" x2="${(w - 4).toFixed(1)}" y2="${y.toFixed(1)}" ` +
      `style="stroke:var(--border)" stroke-width="1" stroke-dasharray="2 4"/>` +
      `<text x="${left - 8}" y="${(y + 4).toFixed(1)}" text-anchor="end" style="fill:var(--faint);${FONT}">${m} m</text>`;
  }
  return { pos, r, axis };
}

/**
 * Bend of each arc, how far its weight sits outside the arc, and where along
 * the arc: a little before the middle, so the weights of two arcs that leave
 * one node in different directions do not meet.
 */
const BEND = 17;
const LIFT = 7;
const AT = 0.42;

/** Geometry of the directed edge e, with `lab` = where its weight goes. */
export function arc(pos, r, e) {
  const g = edgeGeom(pos.get(e.from), pos.get(e.to), { r }, { r }, BEND);
  const [px, py, cx, cy, qx, qy] = g.d.match(/-?\d+(\.\d+)?/g).map(Number);
  const u = 1 - AT;
  const x = u * u * px + 2 * u * AT * cx + AT * AT * qx;
  const y = u * u * py + 2 * u * AT * cy + AT * AT * qy;
  return { ...g, lab: { x: x + g.nx * LIFT, y: y + g.ny * LIFT } };
}

/** Geometry of the undirected road e, weight at the middle. */
export function line(pos, r, e) {
  const g = lineGeom(pos.get(e.from), pos.get(e.to), { r }, { r });
  return { ...g, lab: g.mid };
}

/**
 * One node: the estimate inside, the number outside on its side. `st` is a
 * NODE style; `ring` an accent ring; `hot` draws the estimate in the accent
 * (on a white or gray node) to show that it just changed.
 */
export function stedSvg(p, r, node, text, st, ring = false, hot = false) {
  let s = "";
  if (ring) {
    s +=
      `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${(r + 4).toFixed(1)}" ` +
      `style="fill:none;stroke:var(--accent)" stroke-width="2.4"/>`;
  }
  s +=
    `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${r.toFixed(1)}" ` +
    `style="fill:${st.fill};stroke:${hot ? "var(--accent)" : st.stroke}" stroke-width="${hot ? 2.2 : 1.4}"/>`;
  const col = hot && st !== NODE.black ? "var(--accent)" : st.text;
  s +=
    `<text x="${p.x.toFixed(1)}" y="${(p.y + 4).toFixed(1)}" text-anchor="middle" ` +
    `style="fill:${col};${FONT};font-weight:600">${esc(text)}</text>`;
  const gap = r + 6;
  const [x, y, anchor] = {
    w: [p.x - gap, p.y + 4, "end"],
    e: [p.x + gap, p.y + 4, "start"],
    n: [p.x, p.y - gap, "middle"],
    s: [p.x, p.y + gap + 9, "middle"],
  }[node.side];
  s +=
    `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" text-anchor="${anchor}" ` +
    `style="fill:var(--muted);${FONT}">${esc(node.id)}</text>`;
  return s;
}

/**
 * The whole map. `edgeStyle(e)` → { st, color?, bold? } for each edge;
 * `nodeOf(n)` → { text, st, ring?, hot? }. Plain edges go below styled ones,
 * and all weights go on top of all edges.
 */
export function kartSvg(graph, pos, r, nodeOf, edgeStyle) {
  const geo = graph.undirected ? line : arc;
  const drawn = graph.edges.map((e) => ({ e, g: geo(pos, r, e), ...edgeStyle(e) }));
  const rank = (x) => (x.st === EDGE.plain || x.st === EDGE.faded ? 0 : x.st === EDGE.cur ? 2 : 1);
  drawn.sort((a, b) => rank(a) - rank(b));
  let s = "";
  let labels = "";
  for (const d of drawn) {
    s += edgeSvg(d.g, d.st);
    labels += weightSvg({ mid: d.g.lab }, fmt(d.e.w), d.color ?? "var(--muted)", d.bold ?? false);
  }
  s += labels;
  for (const n of graph.nodes) {
    const o = nodeOf(n);
    s += stedSvg(pos.get(n.id), r, n, o.text, o.st, o.ring, o.hot);
  }
  return s;
}

/**
 * The edge nearest to (x, y), within reach: its weight label counts, and so
 * does any point on its line or arc.
 */
export function nearestEdge(graph, pos, r, x, y) {
  const geo = graph.undirected ? line : arc;
  let best = null;
  let bd = Infinity;
  for (const e of graph.edges) {
    const g = geo(pos, r, e);
    const n = g.d.match(/-?\d+(\.\d+)?/g).map(Number);
    // "M x y L x y" or "M x y Q cx cy x y": sample the line or the curve.
    const [p, c, q] = n.length === 4 ? [n.slice(0, 2), null, n.slice(2)] : [n.slice(0, 2), n.slice(2, 4), n.slice(4)];
    let d = Math.hypot(g.lab.x - x, g.lab.y - y) - 6;
    for (let t = 0; t <= 1.0001; t += 0.05) {
      const u = 1 - t;
      const px = c ? u * u * p[0] + 2 * u * t * c[0] + t * t * q[0] : u * p[0] + t * q[0];
      const py = c ? u * u * p[1] + 2 * u * t * c[1] + t * t * q[1] : u * p[1] + t * q[1];
      d = Math.min(d, Math.hypot(px - x, py - y));
    }
    if (d < bd) {
      bd = d;
      best = e;
    }
  }
  return bd <= 18 ? best : null;
}
