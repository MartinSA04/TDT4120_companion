/**
 * The river for modul 10 «Minimale spenntrær»: a cut (S, V − S) drawn as a
 * river through the village. Shared by sims/broyt-bygda.js, sims/elva.js,
 * kruskal.js and prim.js.
 *
 * The river runs along the line that is equally far from the two sides,
 * where each side is its nodes and the edges between two of its nodes. So an
 * edge inside one side never crosses the river, and an edge between the sides
 * crosses it near its middle, where its weight label sits: the label reads as
 * the bridge. The line is found by marching squares on a grid of `cell` px.
 */

/** Squared distance from p to the segment a–b. */
function segDist2(px, py, a, b) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const L = dx * dx + dy * dy || 1;
  let t = ((px - a.x) * dx + (py - a.y) * dy) / L;
  t = t < 0 ? 0 : t > 1 ? 1 : t;
  const qx = a.x + t * dx - px;
  const qy = a.y + t * dy - py;
  return qx * qx + qy * qy;
}

/**
 * Path data for the river between the nodes in S and the rest, on a stage of
 * w × h px. `nodes` are ids, `edges` { from, to }, `inS(id)` says which side
 * a node is on, `pos` maps id → { x, y }. Returns "" when one side is empty.
 */
export function riverPath(nodes, edges, inS, pos, w, h, cell = 6) {
  const sideS = nodes.filter((id) => inS(id));
  const sideT = nodes.filter((id) => !inS(id));
  if (!sideS.length || !sideT.length) return "";
  const segs = (side) =>
    edges.filter((e) => inS(e.from) === side && inS(e.to) === side).map((e) => [pos.get(e.from), pos.get(e.to)]);
  const S = { pts: sideS.map((id) => pos.get(id)), segs: segs(true) };
  const T = { pts: sideT.map((id) => pos.get(id)), segs: segs(false) };
  const dist = (x, y, side) => {
    let m = Infinity;
    for (const p of side.pts) m = Math.min(m, (p.x - x) ** 2 + (p.y - y) ** 2);
    for (const [a, b] of side.segs) m = Math.min(m, segDist2(x, y, a, b));
    return Math.sqrt(m);
  };
  const nx = Math.ceil(w / cell) + 1;
  const ny = Math.ceil(h / cell) + 1;
  const f = new Float64Array(nx * ny);
  for (let j = 0; j < ny; j++)
    for (let i = 0; i < nx; i++) {
      const x = Math.min(i * cell, w);
      const y = Math.min(j * cell, h);
      f[j * nx + i] = dist(x, y, T) - dist(x, y, S);
    }
  const X = (i) => Math.min(i * cell, w);
  const Y = (j) => Math.min(j * cell, h);
  const lerp = (a, b, fa, fb) => a + ((b - a) * fa) / (fa - fb);
  let d = "";
  const seg = (p, q) => {
    d += `M${p[0].toFixed(1)} ${p[1].toFixed(1)}L${q[0].toFixed(1)} ${q[1].toFixed(1)}`;
  };
  for (let j = 0; j < ny - 1; j++)
    for (let i = 0; i < nx - 1; i++) {
      const a = f[j * nx + i];
      const b = f[j * nx + i + 1];
      const c = f[(j + 1) * nx + i + 1];
      const e = f[(j + 1) * nx + i];
      const k = (a > 0 ? 8 : 0) | (b > 0 ? 4 : 0) | (c > 0 ? 2 : 0) | (e > 0 ? 1 : 0);
      if (k === 0 || k === 15) continue;
      const x0 = X(i);
      const x1 = X(i + 1);
      const y0 = Y(j);
      const y1 = Y(j + 1);
      const top = [lerp(x0, x1, a, b), y0];
      const right = [x1, lerp(y0, y1, b, c)];
      const bottom = [lerp(x0, x1, e, c), y1];
      const left = [x0, lerp(y0, y1, a, e)];
      const centre = (a + b + c + e) / 4 > 0;
      switch (k) {
        case 1: case 14: seg(left, bottom); break;
        case 2: case 13: seg(bottom, right); break;
        case 3: case 12: seg(left, right); break;
        case 4: case 11: seg(top, right); break;
        case 6: case 9: seg(top, bottom); break;
        case 7: case 8: seg(left, top); break;
        case 5:
          if (centre) { seg(left, top); seg(bottom, right); } else { seg(left, bottom); seg(top, right); }
          break;
        case 10:
          if (centre) { seg(left, bottom); seg(top, right); } else { seg(left, top); seg(bottom, right); }
          break;
      }
    }
  return d;
}

/** The river as SVG: a wide pale band with a thin line along its middle. */
export function riverSvg(d) {
  if (!d) return "";
  return (
    `<path d="${d}" fill="none" stroke-linecap="round" stroke-linejoin="round" ` +
    `style="stroke:color-mix(in srgb, var(--cyan) 30%, transparent)" stroke-width="12"/>` +
    `<path d="${d}" fill="none" stroke-linecap="round" stroke-linejoin="round" ` +
    `style="stroke:color-mix(in srgb, var(--cyan) 70%, transparent)" stroke-width="1.6"/>`
  );
}
