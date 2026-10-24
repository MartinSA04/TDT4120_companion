/**
 * Disjoint-set forest trace for <Stepper>, driving the block
 * `disjunkte-mengder` in modul 10 «Minimale spenntrær». It runs
 * Connected-Components on the strekninger plowed in the village, in the order
 * they were plowed, and ends with Same-Component(1, 4). The first input is
 * fixed so that it shows a link of two equal ranks, a link of unequal ranks,
 * a strekning inside one set and two path compressions; shuffling deals 7–10
 * random strekninger in a random order.
 *
 * Stage: the village on top with the plowed strekninger banded (no lengths:
 * Connected-Components does not use them), the forest of parent pointers
 * under it. Every arrow is a pointer x.p, a root points to itself, and the
 * number left of a root is its rank (only roots' ranks are ever compared, and
 * at phone width a rank by every node collides with its neighbours). The
 * trees wrap onto more rows when they do not fit. Nodes on the path Find-Set follows are
 * ringed, and a pointer that changes in the step is in the accent.
 *
 * Line numbers refer to the block (header = line 1 of each procedure):
 *    1 Make-Set(x)        5 Union(x, y)        8 Link(x, y)          15 Find-Set(x)
 *    2 1 x.p = x          6 1 Link(Find-…)     9 1 if x.rank > y.rank 16 1 if x ≠ x.p
 *    3 2 x.rank = 0                           10 2   y.p = x         17 2   x.p = Find-Set(x.p)
 *                                             11 3 else x.p = y      18 3 return x.p
 *                                             12 4   if x.rank == y.rank
 *                                             13 5     y.rank = y.rank + 1
 *
 * Colours are framework tokens only, so frames re-theme on the light/dark
 * toggle without the module knowing which theme is active.
 */
import { EDGE, FONT, NODE, VEKTET, esc, graphSvg, nodeSvg, place, shuffle, wrapSvg } from "./_graf.js";

const L = { makeSet: [2, 3], linkGt: [6, 9, 10], linkNe: [6, 9, 11, 12], linkEq: [6, 9, 11, 12, 13], find: [16, 17, 18], findRoot: [16, 18] };
const FIXED = [[7, 8], [1, 2], [3, 9], [8, 9], [6, 7], [2, 8], [3, 6], [4, 5], [5, 6]];
const QUERY = [1, 4];
let calls = 0;

export default {
  defaultData() {
    if (calls++ === 0) return FIXED;
    const k = 7 + Math.floor(Math.random() * 4);
    return shuffle(VEKTET.edges.map((e) => (Math.random() < 0.5 ? [e.from, e.to] : [e.to, e.from]))).slice(0, k);
  },

  run(order) {
    const ids = VEKTET.nodes.map((n) => n.id);
    const p = new Map(ids.map((x) => [x, x]));
    const rank = new Map(ids.map((x) => [x, 0]));
    const plowed = new Set();
    const frames = [];
    const snap = (line, desc, extra = {}) =>
      frames.push({
        line,
        desc,
        p: new Map(p),
        rank: new Map(rank),
        plowed: new Set(plowed),
        cur: extra.cur ?? null,
        path: extra.path ?? [],
        changed: extra.changed ?? [],
        vars: extra.vars,
      });

    /** Find-Set with path compression, as one or two frames. */
    const findSet = (x, cur, vars) => {
      const path = [x];
      while (p.get(path.at(-1)) !== path.at(-1)) path.push(p.get(path.at(-1)));
      const root = path.at(-1);
      if (path.length <= 2) {
        snap(path.length === 1 ? L.findRoot : L.find, path.length === 1 ? `Find-Set(${x}): ${x} er en rot og representerer mengden sin.` : `Find-Set(${x}): forelderen ${root} er rota.`, { cur, path, vars });
        return root;
      }
      snap(L.find, `Find-Set(${x}) følger pekerne ${path.join(" → ")} opp til rota ${root}.`, { cur, path, vars });
      const changed = path.slice(0, -2);
      for (const y of changed) p.set(y, root);
      snap(17, `På vei tilbake setter Find-Set ${changed.join(" og ")}.p = ${root}: ${changed.length > 1 ? "nodene" : "noden"} peker nå rett på rota.`, { cur, path, changed, vars });
      return root;
    };

    snap(L.makeSet, "Make-Set for hver gård: hver gård er en mengde for seg, og hver rot peker på seg selv.");
    for (const [u, v] of order) {
      const cur = [u, v];
      plowed.add(`${Math.min(u, v)}-${Math.max(u, v)}`);
      const vars = { "(u, v)": `(${u}, ${v})` };
      const x = findSet(u, cur, vars);
      const y = findSet(v, cur, vars);
      if (x === y) {
        snap(null, `Begge har rota ${x}: gårdene henger alt sammen, så det blir ingen Union.`, { cur, vars });
        continue;
      }
      const lv = { ...vars, "x.rank": rank.get(x), "y.rank": rank.get(y) };
      if (rank.get(x) > rank.get(y)) {
        p.set(y, x);
        snap(L.linkGt, `Union(${u}, ${v}) kaller Link(${x}, ${y}). ${x} har høyest rang, så ${y} henges under ${x}, og rangene endres ikke.`, { cur, changed: [y], vars: lv });
      } else if (rank.get(x) < rank.get(y)) {
        p.set(x, y);
        snap(L.linkNe, `Union(${u}, ${v}) kaller Link(${x}, ${y}). ${y} har høyest rang, så ${x} henges under ${y}, og rangene endres ikke.`, { cur, changed: [x], vars: lv });
      } else {
        p.set(x, y);
        rank.set(y, rank.get(y) + 1);
        // The strip shows the ranks Link compared; the drawing shows the new rank.
        snap(L.linkEq, `Union(${u}, ${v}) kaller Link(${x}, ${y}). Rangene er like, så ${x} henges under ${y}, og rangen til ${y} øker til ${rank.get(y)}.`, { cur, changed: [x], vars: lv });
      }
    }
    const [a, b] = QUERY;
    const qv = { "(u, v)": `(${a}, ${b})` };
    const ra = findSet(a, null, qv);
    const rb = findSet(b, null, qv);
    snap(L.find, `Same-Component(${a}, ${b}): rotene er ${ra} og ${rb}, så svaret er ${ra === rb ? "true" : "false"}.`, { vars: qv });
    return frames;
  },

  render(stage, f, { getSize }) {
    const { w, h } = getSize();
    const gh = Math.round(h * 0.4);
    const r = Math.max(10, Math.min(13, w / 32));
    // The village, small, with the plowed strekninger.
    const pos = place(VEKTET.nodes, { x: 0, y: 0, w, h: gh }, { l: w * 0.14 + r, r: w * 0.14 + r, t: r + 6, b: r + 6 });
    const cur = f.cur ? `${Math.min(...f.cur)}-${Math.max(...f.cur)}` : null;
    let svg = graphSvg(
      { ...VEKTET, edges: VEKTET.edges },
      pos,
      () => ({ r }),
      () => ({ st: NODE.white }),
      (e) => {
        const k = `${e.from}-${e.to}`;
        if (k === cur) return { st: EDGE.cur };
        if (f.plowed.has(k)) return { st: EDGE.tree };
        return { st: EDGE.faded };
      },
    );
    svg += `<line x1="8" x2="${w - 8}" y1="${gh + 4}" y2="${gh + 4}" style="stroke:var(--border)" stroke-width="1"/>`;

    // The forest: children of each node, roots in id order, wrapped into rows
    // so that a node keeps about 46 px of width for itself and its rank.
    const ids = VEKTET.nodes.map((n) => n.id);
    const kids = new Map(ids.map((x) => [x, []]));
    const roots = [];
    for (const x of ids) {
      if (f.p.get(x) === x) roots.push(x);
      else kids.get(f.p.get(x)).push(x);
    }
    const width = (x) => Math.max(1, kids.get(x).reduce((s, c) => s + width(c), 0));
    const depth = (x) => kids.get(x).reduce((m, c) => Math.max(m, 1 + depth(c)), 0);
    const GAP = 0.35;
    const cap = (w - 16) / 46;
    const rows = [];
    for (const x of roots) {
      const row = rows.at(-1);
      const used = row ? row.reduce((s2, y) => s2 + width(y), 0) + row.length * GAP : 0;
      if (row && used + width(x) <= cap) row.push(x);
      else rows.push([x]);
    }
    const levels = rows.reduce((s2, row) => s2 + 1 + Math.max(...row.map(depth)), 0);
    const lev = Math.min(46, (h - gh - 20 - rows.length * 58) / Math.max(1, levels - rows.length));
    const at = new Map();
    let fr = 13;
    let y0 = gh + 30;
    for (const row of rows) {
      const total = row.reduce((s2, x) => s2 + width(x), 0) + (row.length - 1) * GAP;
      const unit = Math.min(46, (w - 16) / total);
      fr = Math.min(fr, Math.max(9, unit * 0.27));
      let cx = (w - total * unit) / 2;
      const lay = (x, d, left) => {
        at.set(x, { x: left + (width(x) * unit) / 2, y: y0 + d * lev });
        let l = left;
        for (const c of kids.get(x)) {
          lay(c, d + 1, l);
          l += width(c) * unit;
        }
      };
      for (const x of row) {
        lay(x, 0, cx);
        cx += (width(x) + GAP) * unit;
      }
      y0 += Math.max(...row.map(depth)) * lev + 2 * fr + 32;
    }
    const onPath = new Set(f.path);
    const changed = new Set(f.changed);
    // Pointers: child → parent, a self-loop on each root.
    for (const x of ids) {
      const a = at.get(x);
      const col = changed.has(x) ? "var(--accent)" : "var(--fg)";
      const wd = changed.has(x) ? 2.2 : 1.2;
      if (f.p.get(x) === x) {
        svg +=
          `<path d="M${(a.x - 5).toFixed(1)} ${(a.y - fr).toFixed(1)} C${(a.x - 12).toFixed(1)} ${(a.y - fr - 16).toFixed(1)} ` +
          `${(a.x + 12).toFixed(1)} ${(a.y - fr - 16).toFixed(1)} ${(a.x + 4).toFixed(1)} ${(a.y - fr - 1).toFixed(1)}" ` +
          `fill="none" style="stroke:${col}" stroke-width="${wd}"/>` +
          `<polygon points="${(a.x + 3).toFixed(1)},${(a.y - fr + 0.5).toFixed(1)} ${(a.x + 1).toFixed(1)},${(a.y - fr - 6).toFixed(1)} ${(a.x + 8).toFixed(1)},${(a.y - fr - 4).toFixed(1)}" style="fill:${col}"/>`;
        continue;
      }
      const b = at.get(f.p.get(x));
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const len = Math.hypot(dx, dy) || 1;
      const ux = dx / len;
      const uy = dy / len;
      const s = { x: a.x + ux * fr, y: a.y + uy * fr };
      const t = { x: b.x - ux * (fr + 1), y: b.y - uy * (fr + 1) };
      const base = { x: t.x - ux * 7, y: t.y - uy * 7 };
      svg +=
        `<line x1="${s.x.toFixed(1)}" y1="${s.y.toFixed(1)}" x2="${base.x.toFixed(1)}" y2="${base.y.toFixed(1)}" style="stroke:${col}" stroke-width="${wd}"/>` +
        `<polygon points="${t.x.toFixed(1)},${t.y.toFixed(1)} ${(base.x - uy * 3.5).toFixed(1)},${(base.y + ux * 3.5).toFixed(1)} ${(base.x + uy * 3.5).toFixed(1)},${(base.y - ux * 3.5).toFixed(1)}" style="fill:${col}"/>`;
    }
    for (const x of ids) {
      const a = at.get(x);
      svg += nodeSvg(a, { r: fr }, x, NODE.white, onPath.has(x));
      if (f.p.get(x) !== x) continue;
      svg +=
        `<text x="${(a.x - fr - 10).toFixed(1)}" y="${(a.y + 4).toFixed(1)}" text-anchor="end" ` +
        `style="fill:var(--muted);${FONT}">${esc(f.rank.get(x))}</text>`;
    }
    stage.innerHTML = wrapSvg(w, h, svg);
    stage.setAttribute("aria-label", f.desc);
  },
};
