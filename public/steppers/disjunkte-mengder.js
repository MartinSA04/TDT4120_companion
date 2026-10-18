/**
 * Disjoint-set forest trace for <Stepper>, driving the Python block
 * `disjunkte-mengder` in modul 09. It runs Connected-Components on the
 * lecture's graph (the textbook's ten nodes a–j, edges in the book's order)
 * and then two Same-Component queries, the first of which compresses a path.
 *
 * The stage has the edge list on top (current edge in the accent, edges that
 * led to a Union filled, edges inside one set faint) and the forest under
 * it: every arrow is a parent pointer x.p, a root points to itself, and the
 * number left of a node is its rank. Nodes on the path Find-Set follows are
 * ringed, and a pointer that changes in the step is in the accent colour.
 * When the trees do not fit side by side, they wrap onto a second row.
 *
 * Line numbers refer to that <CodeBlock>:
 *    1 p, rank = {}, {}  # x.p og x.rank er p[x] og rank[x]
 *    2
 *    3 def make_set(x):
 *    4     p[x] = x
 *    5     rank[x] = 0
 *    6
 *    7 def find_set(x):
 *    8     if x != p[x]:
 *    9         p[x] = find_set(p[x])
 *   10     return p[x]
 *   11
 *   12 def link(x, y):
 *   13     if rank[x] > rank[y]:
 *   14         p[y] = x
 *   15     else:
 *   16         p[x] = y
 *   17         if rank[x] == rank[y]:
 *   18             rank[y] += 1
 *   19
 *   20 def union(x, y):
 *   21     link(find_set(x), find_set(y))
 *
 * Colours are framework tokens only, so frames re-theme on the light/dark
 * toggle without the module knowing which theme is active.
 */

import { EDGE, FONT, NODE, cellsSvg, edgeGeom, edgeSvg, esc, nodeSvg, shuffle, wrapSvg } from "./_graf.js";

const IDS = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"];
const BOOK = [["b", "d"], ["e", "f"], ["a", "c"], ["h", "i"], ["a", "b"], ["f", "g"], ["b", "c"]];
const PTR = { stroke: "var(--fg)", wdt: 1.3 };

let calls = 0;

export default {
  // The book's edges first; after that, random graphs on the same ten nodes.
  defaultData() {
    if (calls++ === 0) return BOOK;
    const pairs = [];
    for (let i = 0; i < IDS.length; i++) for (let j = i + 1; j < IDS.length; j++) pairs.push([IDS[i], IDS[j]]);
    return shuffle(pairs).slice(0, 7 + Math.floor(Math.random() * 3)).map((e) => (Math.random() < 0.5 ? e : [e[1], e[0]]));
  },

  run(edges) {
    const p = {};
    const rank = {};
    const status = edges.map(() => "todo");
    const frames = [];
    let idx = -1;
    const snap = (line, desc, vars, extra = {}) =>
      frames.push({ line, desc, vars, edges, status: [...status], idx, p: { ...p }, rank: { ...rank }, ...extra });

    for (const x of IDS) {
      p[x] = x;
      rank[x] = 0;
    }
    snap([4, 5], "Make-Set på alle nodene: hver node er en rot med rang 0 og peker på seg selv.", {});

    const pathOf = (x) => {
      const path = [x];
      while (p[path[path.length - 1]] !== path[path.length - 1]) path.push(p[path[path.length - 1]]);
      return path;
    };
    // Find-Set(x) as frames: one frame if nothing changes, else the path and then the compression.
    const find = (x, lead) => {
      const path = pathOf(x);
      const root = path[path.length - 1];
      const moved = path.slice(0, -1).filter((y) => p[y] !== root);
      if (!moved.length) return { root, path };
      snap([8, 9], `${lead}Find-Set(${x}) følger ${path.join(" → ")} til rota ${root}.`, { x }, { path });
      for (const y of moved) p[y] = root;
      snap(
        [9, 10],
        `På vei ut av rekursjonen får ${moved.join(" og ")} forelder ${root}. Neste Find-Set fra ${moved[0]} går rett til rota.`,
        { x },
        { path, changed: moved },
      );
      return { root, path, compressed: true };
    };

    edges.forEach(([u, v], i) => {
      idx = i;
      const lead = `Kanten (${u}, ${v}): `;
      const fu = find(u, lead);
      const fv = find(v, fu.compressed ? "" : lead);
      const both = [...fu.path, ...fv.path];
      if (fu.root === fv.root) {
        status[i] = "skip";
        snap(
          [8, 10],
          `${fu.compressed || fv.compressed ? "" : lead}Find-Set(${u}) = Find-Set(${v}) = ${fu.root}, så ${u} og ${v} er alt i samme mengde, og Union kalles ikke.`,
          { u, v },
          { path: both },
        );
        return;
      }
      snap(
        [8, 10],
        `${fu.compressed || fv.compressed ? "" : lead}` +
          (fu.path.length === 1 && fv.path.length === 1
            ? `${u} og ${v} er røtter, så Find-Set gir ${u} og ${v}. Mengdene er ulike.`
            : `Find-Set(${u}) = ${fu.root} og Find-Set(${v}) = ${fv.root}. Mengdene er ulike.`),
        { u, v },
        { path: both },
      );
      const [x, y] = [fu.root, fv.root];
      status[i] = "union";
      if (rank[x] > rank[y]) {
        p[y] = x;
        snap([13, 14, 21], `Union kaller Link(${x}, ${y}). ${x} har høyere rang enn ${y}, så ${y}.p = ${x}, og rangene endres ikke.`, { x, y }, { changed: [y], path: [x, y] });
      } else if (rank[x] < rank[y]) {
        p[x] = y;
        snap([15, 16, 17, 21], `Union kaller Link(${x}, ${y}). ${y} har høyere rang enn ${x}, så ${x}.p = ${y}, og rangene endres ikke.`, { x, y }, { changed: [x], path: [x, y] });
      } else {
        p[x] = y;
        rank[y] += 1;
        snap(
          [15, 16, 17, 18, 21],
          `Union kaller Link(${x}, ${y}). Begge har rang ${rank[x]}, så ${x}.p = ${y}, og ${y} får rang ${rank[y]}.`,
          { x, y },
          { changed: [x], path: [x, y], bumped: y },
        );
      }
    });

    idx = edges.length;
    // Same-Component: first from the deepest node to another node in its set, then across two sets.
    const depth = (x) => pathOf(x).length - 1;
    const deepest = [...IDS].sort((a, b) => depth(b) - depth(a) || IDS.indexOf(a) - IDS.indexOf(b))[0];
    const rootOf = (x) => pathOf(x)[pathOf(x).length - 1];
    const mate = IDS.find((y) => y !== deepest && rootOf(y) === rootOf(deepest) && p[y] !== deepest);
    const other = IDS.find((y) => rootOf(y) !== rootOf(deepest));
    const queries = [];
    if (mate) queries.push([deepest, mate]);
    if (other) queries.push([deepest, other]);
    for (const [u, v] of queries) {
      const lead = `Same-Component(${u}, ${v}): `;
      const fu = find(u, lead);
      const fv = find(v, "");
      const same = fu.root === fv.root;
      snap(
        [8, 10],
        `${fu.compressed ? "" : lead}Find-Set(${u}) = ${fu.root} og Find-Set(${v}) = ${fv.root}, så Same-Component(${u}, ${v}) gir ${same ? "True" : "False"}.`,
        { u, v },
        { path: [...fu.path, ...fv.path] },
      );
    }
    return frames;
  },

  render(stage, frame, api) {
    const { w, h } = api.getSize();
    if (!frame.p || w <= 0 || h <= 0) {
      stage.innerHTML = "";
      return;
    }
    const r = Math.max(10, Math.min(13, w / 32));
    const shape = { r };
    const CELL_H = 24;
    let svg = "";

    // The edge list on top.
    const n = frame.edges.length;
    const cellW = Math.min(52, (w - 4) / n);
    const cx0 = (w - cellW * n) / 2;
    svg += cellsSvg(cx0, 2, cellW, CELL_H, frame.edges.map(([u, v]) => `${u},${v}`), (i) => {
      if (i === frame.idx) return { fill: "var(--accent-weak)", stroke: "var(--accent)", text: "var(--accent-ink)", wdt: 2 };
      if (frame.status[i] === "union") return { fill: "color-mix(in srgb, var(--fg) 16%, transparent)", stroke: "var(--fg)", text: "var(--fg)" };
      if (frame.status[i] === "skip") return { fill: "none", stroke: "var(--border)", text: "var(--faint)" };
      return { fill: "var(--bg)", stroke: "var(--muted)", text: "var(--fg)" };
    });

    // The forest: trees left to right by their first node, wrapped into rows.
    const p = frame.p;
    const kids = new Map(IDS.map((x) => [x, []]));
    const roots = [];
    for (const x of IDS) (p[x] === x ? roots : kids.get(p[x])).push(x);
    const first = (x) => Math.min(IDS.indexOf(x), ...kids.get(x).map(first));
    const levels = (x) => 1 + Math.max(0, ...kids.get(x).map(levels));
    const leaves = (x) => (kids.get(x).length ? kids.get(x).reduce((s, c) => s + leaves(c), 0) : 1);
    roots.sort((a, b) => first(a) - first(b));
    const SW = 2 * r + 34;
    const perRow = Math.max(1, Math.floor(w / SW));
    const rows = [];
    let row = [];
    let used = 0;
    for (const t of roots) {
      if (row.length && used + leaves(t) > perRow) {
        rows.push(row);
        row = [];
        used = 0;
      }
      row.push(t);
      used += leaves(t);
    }
    if (row.length) rows.push(row);

    const LOOP = r + 16; // room above a root for its self-loop
    const top = CELL_H + 10;
    const avail = h - top - 4;
    const fixed = rows.reduce((s, rw) => s + LOOP + 2 * r + 6, 0);
    const gaps = rows.reduce((s, rw) => s + Math.max(...rw.map(levels)) - 1, 0);
    const LS = gaps ? Math.max(30, Math.min(54, (avail - fixed) / gaps)) : 0;
    const usedH = fixed + gaps * LS;
    let y0 = top + Math.max(0, (avail - usedH) / 2);
    const pos = new Map();
    for (const rw of rows) {
      const lv = Math.max(...rw.map(levels));
      let x = (w - rw.reduce((s, t) => s + leaves(t), 0) * SW) / 2 + SW / 2;
      const put = (node, d) => {
        const yy = y0 + LOOP + r + d * LS;
        const ks = kids.get(node);
        if (!ks.length) {
          pos.set(node, { x, y: yy });
          x += SW;
          return;
        }
        ks.forEach((k) => put(k, d + 1));
        const xs = ks.map((k) => pos.get(k).x);
        pos.set(node, { x: (Math.min(...xs) + Math.max(...xs)) / 2, y: yy });
      };
      rw.forEach((t) => put(t, 0));
      y0 += LOOP + 2 * r + 6 + (lv - 1) * LS;
    }

    const changed = new Set(frame.changed ?? []);
    const onPath = new Set(frame.path ?? []);
    for (const x of IDS) {
      const a = pos.get(x);
      // A ringed root gets its loop lifted clear of the ring.
      const lift = onPath.has(x) ? 4 : 0;
      if (p[x] !== x) {
        const g = edgeGeom(a, pos.get(p[x]), shape, shape, 0);
        svg += edgeSvg(g, changed.has(x) ? EDGE.cur : PTR);
        continue;
      }
      // A root points to itself: a small loop over the node.
      const s = { x: a.x - r * 0.42, y: a.y - r * 0.9 - lift };
      const e = { x: a.x + r * 0.42, y: a.y - r * 0.9 - lift };
      const c1 = { x: a.x - r * 1.1, y: a.y - r - 15 - lift };
      const c2 = { x: a.x + r * 1.1, y: a.y - r - 15 - lift };
      const len = Math.hypot(e.x - c2.x, e.y - c2.y);
      const [ux, uy] = [(e.x - c2.x) / len, (e.y - c2.y) / len];
      const b = { x: e.x - ux * 6, y: e.y - uy * 6 };
      svg +=
        `<path d="M${s.x.toFixed(1)} ${s.y.toFixed(1)} C${c1.x.toFixed(1)} ${c1.y.toFixed(1)} ${c2.x.toFixed(1)} ${c2.y.toFixed(1)} ${b.x.toFixed(1)} ${b.y.toFixed(1)}" ` +
        `fill="none" style="stroke:var(--muted)" stroke-width="1.2"/>` +
        `<polygon points="${e.x.toFixed(1)},${e.y.toFixed(1)} ${(b.x - uy * 3.5).toFixed(1)},${(b.y + ux * 3.5).toFixed(1)} ${(b.x + uy * 3.5).toFixed(1)},${(b.y - ux * 3.5).toFixed(1)}" style="fill:var(--muted)"/>`;
    }
    for (const x of IDS) {
      const a = pos.get(x);
      svg += nodeSvg(a, shape, x, NODE.white, onPath.has(x));
      const bumped = frame.bumped === x;
      svg +=
        `<text x="${(a.x - r - 9).toFixed(1)}" y="${(a.y + 4).toFixed(1)}" text-anchor="end" ` +
        `style="fill:${bumped ? "var(--accent-ink)" : "var(--muted)"};${FONT}${bumped ? ";font-weight:600" : ""}">${esc(frame.rank[x])}</text>`;
    }

    stage.innerHTML = wrapSvg(w, h, svg);
  },
};
