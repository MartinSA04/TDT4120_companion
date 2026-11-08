/**
 * Shared drawing for modul 13 «Maksimal flyt»: the lecture's flow network,
 * used by the sim «Vann fra kilden til sluket» (sims/vann.js), the stepper
 * «Edmonds-Karp» (edmonds-karp.js) and the module's figures.
 *
 * Kilde and sluk are water words, so an edge is drawn as a one-way pipe: a
 * hollow tube whose width follows the capacity, with a solid head at the end
 * it points to. The water is a cyan band inside the tube, as wide as the
 * flow, so a full pipe is cyan from wall to wall. When `moving` is set, faint
 * dashes run along the band in the direction of the pipe.
 *
 * The residual network is drawn on the same node positions with ordinary
 * arrows: a forward arrow with c − f where the pipe has room, a backward
 * arrow with f where it carries water, bent apart when both exist.
 *
 * Colours are framework tokens, passed through `pal` so the figure generator
 * can swap in mid-tone colours for a static <img>.
 */
import { FONT, edgeGeom, esc } from "./_graf.js";

/** The lecture's network: s = 1 at the top, t = 6 at the bottom. */
export const NETT = {
  s: 1,
  t: 6,
  nodes: [
    { id: 1, gx: 1, gy: 0 },
    { id: 2, gx: 0, gy: 1 },
    { id: 3, gx: 2, gy: 1 },
    { id: 4, gx: 0, gy: 2.25 },
    { id: 5, gx: 2, gy: 2.25 },
    { id: 6, gx: 1, gy: 3.25 },
  ],
  // side: which side of the pipe its label goes on (+1 = left of the direction).
  edges: [
    { from: 1, to: 2, c: 13, side: 1 },
    { from: 1, to: 3, c: 13, side: -1 },
    { from: 3, to: 2, c: 4, side: 1 },
    { from: 2, to: 4, c: 14, side: 1 },
    { from: 3, to: 4, c: 9, side: -1, at: 0.4 },
    { from: 3, to: 5, c: 12, side: -1 },
    { from: 5, to: 4, c: 7, side: -1 },
    { from: 4, to: 6, c: 4, side: 1 },
    { from: 5, to: 6, c: 20, side: -1 },
  ],
  // The order BFS looks at a node's neighbours in, out-edges and in-edges together.
  order: { 1: [3, 2], 2: [4, 1, 3], 3: [2, 4, 5, 1], 4: [6, 3, 2, 5], 5: [6, 4, 3], 6: [5, 4] },
};

export const TOKENS = {
  fg: "var(--fg)",
  bg: "var(--bg)",
  muted: "var(--muted)",
  faint: "var(--faint)",
  wall: "var(--border-strong)",
  water: "var(--cyan)",
  ripple: "color-mix(in srgb, var(--cyan) 45%, var(--bg))",
  accent: "var(--accent)",
  patch: "var(--bg-elevated)",
  font: FONT,
};

const f1 = (x) => x.toFixed(1);

/** Pixel positions: the layout's grid fitted into box = { x, y, w, h } minus pad. */
export function place(nodes, box, pad) {
  const xs = nodes.map((n) => n.gx);
  const ys = nodes.map((n) => n.gy);
  const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  const sx = (box.w - pad.l - pad.r) / (x1 - x0 || 1);
  const sy = (box.h - pad.t - pad.b) / (y1 - y0 || 1);
  return new Map(nodes.map((n) => [n.id, { x: box.x + pad.l + (n.gx - x0) * sx, y: box.y + pad.t + (n.gy - y0) * sy }]));
}

const key = (u, v) => `${u}-${v}`;

/** Room in the residual network from u to v (the book's c_f(u, v)). */
export function cf(edges, flow, u, v) {
  const e = edges.find((x) => x.from === u && x.to === v);
  if (e) return e.c - (flow.get(key(u, v)) ?? 0);
  const r = edges.find((x) => x.from === v && x.to === u);
  return r ? (flow.get(key(v, u)) ?? 0) : 0;
}

/** Breadth-first search from s in the residual network, in `order`. Returns { d, pi }. */
export function bfs(net, flow, allowBack = true) {
  const d = new Map([[net.s, 0]]);
  const pi = new Map([[net.s, null]]);
  const q = [net.s];
  while (q.length) {
    const u = q.shift();
    for (const v of net.order[u]) {
      if (d.has(v)) continue;
      const fwd = net.edges.some((e) => e.from === u && e.to === v);
      if (!fwd && !allowBack) continue;
      if (cf(net.edges, flow, u, v) > 0) {
        d.set(v, d.get(u) + 1);
        pi.set(v, u);
        q.push(v);
      }
    }
  }
  return { d, pi };
}

/** Geometry of a straight pipe from a to b between nodes of radius r, outer width W. */
function pipeGeom(a, b, r, W) {
  const len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
  const ux = (b.x - a.x) / len;
  const uy = (b.y - a.y) / len;
  const nx = -uy;
  const ny = ux;
  const head = Math.max(9, 0.45 * W + 6);
  const p0 = { x: a.x + ux * (r + 1), y: a.y + uy * (r + 1) };
  const tip = { x: b.x - ux * (r + 2), y: b.y - uy * (r + 2) };
  const base = { x: tip.x - ux * head, y: tip.y - uy * head };
  return { ux, uy, nx, ny, p0, tip, base, head, len };
}

/**
 * One pipe. `k` is px per unit of capacity; `c` the capacity and `f` the flow.
 * opts: { moving, ring (accent outline), label (text or null), labelColor, side, at, inline (label on
 * the pipe), pal }.
 */
export function pipeSvg(a, b, r, k, c, f, opts = {}) {
  const pal = opts.pal ?? TOKENS;
  const inner = k * c;
  const W = inner + 3;
  const g = pipeGeom(a, b, r, W);
  const { nx, ny, p0, tip, base } = g;
  const hw = W / 2;
  const hh = hw + Math.max(4, 0.18 * W);
  const pt = (p, s) => `${f1(p.x + nx * s)},${f1(p.y + ny * s)}`;
  const body = `${pt(p0, hw)} ${pt(base, hw)} ${pt(base, -hw)} ${pt(p0, -hw)}`;
  const head = `${pt(base, hh)} ${f1(tip.x)},${f1(tip.y)} ${pt(base, -hh)}`;
  let s = "";
  if (opts.ring) {
    s +=
      `<polygon points="${pt(p0, hw + 3)} ${pt(base, hw + 3)} ${pt(base, -hw - 3)} ${pt(p0, -hw - 3)}" ` +
      `style="fill:none;stroke:${pal.accent}" stroke-width="2.2" stroke-linejoin="round"/>`;
  }
  s += `<polygon points="${body}" style="fill:${pal.bg};stroke:${pal.wall}" stroke-width="1.2" stroke-linejoin="round"/>`;
  if (f > 0) {
    const bw = Math.max(1.2, k * f);
    const line = `M${f1(p0.x)} ${f1(p0.y)} L${f1(base.x)} ${f1(base.y)}`;
    s += `<path d="${line}" style="stroke:${pal.water}" stroke-width="${f1(bw)}" fill="none"/>`;
    if (opts.moving) {
      s +=
        `<path d="${line}" style="stroke:${pal.ripple}" stroke-width="${f1(Math.max(1, bw * 0.55))}" ` +
        `stroke-dasharray="2 10" fill="none"><animate attributeName="stroke-dashoffset" from="12" to="0" ` +
        `dur="0.9s" repeatCount="indefinite"/></path>`;
    }
  }
  s += `<polygon points="${head}" style="fill:${pal.wall}"/>`;
  if (opts.label != null) {
    const at = opts.at ?? 0.5;
    const m = { x: p0.x + (base.x - p0.x) * at, y: p0.y + (base.y - p0.y) * at };
    const side = opts.side ?? 1;
    const t = String(opts.label);
    const tw = 7 * t.length + 6;
    // Push the label out along the normal until its box clears the pipe.
    const off = opts.inline ? 0 : hw + 4 + Math.abs(nx) * (tw / 2) + Math.abs(ny) * 8;
    const lx = m.x + nx * side * off;
    const ly = m.y + ny * side * off;
    s +=
      `<rect x="${f1(lx - tw / 2)}" y="${f1(ly - 8)}" width="${tw}" height="16" rx="3" style="fill:${pal.patch}${opts.inline ? `;stroke:${pal.wall}` : ""}" stroke-width="1"/>` +
      `<text x="${f1(lx)}" y="${f1(ly + 4)}" text-anchor="middle" style="fill:${opts.labelColor ?? pal.fg};${pal.font}${opts.bold ? ";font-weight:600" : ""}">${esc(t)}</text>`;
  }
  return { svg: s, g };
}

/**
 * An arrow along a pipe for one step of a path: forward (with the pipe) or
 * backward (against it), drawn on the pipe's centre line in the accent, with
 * the step's room as a label on the other side from the pipe's own label.
 */
export function stepSvg(a, b, r, room, opts = {}) {
  const pal = opts.pal ?? TOKENS;
  const g = pipeGeom(a, b, r, 0);
  const { ux, uy, nx, ny, p0, tip } = g;
  const from = { x: p0.x + ux * 2, y: p0.y + uy * 2 };
  const to = { x: tip.x - ux * 1, y: tip.y - uy * 1 };
  const base = { x: to.x - ux * 9, y: to.y - uy * 9 };
  let s =
    `<path d="M${f1(from.x)} ${f1(from.y)} L${f1(base.x)} ${f1(base.y)}" style="stroke:${pal.accent}" ` +
    `stroke-width="2.6" fill="none" stroke-linecap="round"/>` +
    `<polygon points="${f1(to.x)},${f1(to.y)} ${f1(base.x + nx * 5)},${f1(base.y + ny * 5)} ${f1(base.x - nx * 5)},${f1(base.y - ny * 5)}" style="fill:${pal.accent}"/>`;
  if (room != null) {
    const at = opts.at ?? 0.5;
    const m = { x: from.x + (to.x - from.x) * at, y: from.y + (to.y - from.y) * at };
    const side = opts.side ?? -1;
    const t = String(room);
    const tw = 7 * t.length + 8;
    const off = (opts.clear ?? 8) + 4 + Math.abs(nx) * (tw / 2) + Math.abs(ny) * 8;
    const lx = m.x + nx * side * off;
    const ly = m.y + ny * side * off;
    s +=
      `<rect x="${f1(lx - tw / 2)}" y="${f1(ly - 8.5)}" width="${tw}" height="17" rx="8.5" ` +
      `style="fill:${pal.bg};stroke:${pal.accent}" stroke-width="${opts.bold ? 2 : 1}"/>` +
      `<text x="${f1(lx)}" y="${f1(ly + 4)}" text-anchor="middle" style="fill:${pal.accent};${pal.font}${opts.bold ? ";font-weight:700" : ""}">${esc(t)}</text>`;
  }
  return s;
}

/** A node: white, or filled with the ink when it is in S. ring: "cand" (dashed) or "on" (solid). */
export function nodeSvg(p, r, id, opts = {}) {
  const pal = opts.pal ?? TOKENS;
  let s = "";
  if (opts.ring) {
    s +=
      `<circle cx="${f1(p.x)}" cy="${f1(p.y)}" r="${f1(r + 4.5)}" style="fill:none;stroke:${pal.accent}" ` +
      `stroke-width="2.2"${opts.ring === "cand" ? ' stroke-dasharray="4 3"' : ""}/>`;
  }
  const filled = !!opts.filled;
  s +=
    `<circle data-node="${id}" cx="${f1(p.x)}" cy="${f1(p.y)}" r="${f1(r)}" ` +
    `style="fill:${filled ? pal.fg : pal.bg};stroke:${filled ? pal.fg : pal.muted}" stroke-width="1.4"/>` +
    `<text x="${f1(p.x)}" y="${f1(p.y + 4.5)}" text-anchor="middle" style="fill:${filled ? (pal.onfill ?? pal.bg) : pal.fg};${pal.font};font-weight:600;pointer-events:none">${id}</text>`;
  return s;
}

/**
 * The residual network for `flow`: for each pipe a forward arrow with c − f and a
 * backward arrow with f, each only when positive, bent apart when both exist.
 * `hl(u, v)` → null | "path" | "neck" styles an arrow on the augmenting path.
 */
export function residualSvg(net, pos, r, flow, opts = {}) {
  const pal = opts.pal ?? TOKENS;
  const hl = opts.hl ?? (() => null);
  let lines = "";
  let labels = "";
  const arrow = (u, v, room, bend) => {
    const style = hl(u, v);
    const col = style ? pal.accent : pal.muted;
    const g = edgeGeom(pos.get(u), pos.get(v), { r }, { r }, bend);
    lines +=
      `<path d="${g.d}" fill="none" style="stroke:${col}" stroke-width="${style ? 2.4 : 1.2}"/>` +
      `<polygon points="${g.head}" style="fill:${col}"/>`;
    const t = String(room);
    const tw = 7 * t.length + 6;
    const bold = style === "neck";
    // A bent arc bows to its left; its label moves further out that way, clear of its partner.
    const out = bend ? 2 + Math.abs(g.nx) * (tw / 2) + Math.abs(g.ny) * 8 : 0;
    const mx = g.mid.x + g.nx * out;
    const my = g.mid.y + g.ny * out;
    labels +=
      `<rect x="${f1(mx - tw / 2)}" y="${f1(my - 8)}" width="${tw}" height="16" rx="3" style="fill:${pal.patch}${bold ? `;stroke:${pal.accent}` : ""}" stroke-width="1.5"/>` +
      `<text x="${f1(mx)}" y="${f1(my + 4)}" text-anchor="middle" style="fill:${style ? pal.accent : pal.fg};${pal.font}${style ? ";font-weight:600" : ""}">${esc(t)}</text>`;
  };
  for (const e of net.edges) {
    const f = flow.get(key(e.from, e.to)) ?? 0;
    const both = f > 0 && f < e.c;
    const bend = both ? (opts.bend ?? 12) : 0;
    if (e.c - f > 0) arrow(e.from, e.to, e.c - f, bend);
    if (f > 0) arrow(e.to, e.from, f, bend);
  }
  return lines + labels;
}

export { key };
