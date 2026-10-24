/**
 * Strongly-Connected-Components, for <Stepper>, driving the block `scc-kode`
 * in modul 09 «Traversering av grafer». The one idea: the node that finishes
 * last in the first DFS lies in a component no other component has an edge
 * into. With every edge turned round, a DFS started there cannot leave that
 * component, and each later start in decreasing finish time is trapped in the
 * next component the same way, so each tree is one component.
 *
 * Block lines (header = line 1; the lecture's four lines, lecture 8 slide 573):
 *   1 Strongly-Connected-Components(G)
 *   2 1  DFS(G) to get u.f for each u
 *   3 2  create Gᵀ
 *   4 3  DFS(Gᵀ) by decreasing u.f
 *   5 4  output DFS-trees as SCCs
 *
 * Frames: pass 1 on G [2], one frame per discovery and per finish; the edges
 * turned round [3]; pass 2 on Gᵀ [4], one frame per start of a tree, per
 * discovery and per finish; one frame per finished tree [5], which outlines
 * the component.
 *
 * The first graph is the lecture's (slides 548–575): 1→5, 2→1, 3→2, 3→4,
 * 4→3, 5→2, 6→2, 6→5, 6→7, 7→6, 7→3, 8→4, 8→7, in two columns (1–4 left,
 * 5–8 right). Pass 1 with the main loop in node order and these lists gives
 * f = 1:6 2:4 3:10 4:9 5:5 6:14 7:13 8:16, so pass 2 starts in 8, 6, 3, 1
 * and finds {8}, {6, 7}, {3, 4}, {1, 2, 5}. Later graphs (the shuffle
 * button): random edges on the same places, drawn again until there are three
 * to five components and at least one has two nodes or more.
 *
 * Drawing (_graf.js): node fill = colour in the pass that runs; the running
 * call ringed in the accent; pass 1 stamps d/f beside each node, pass 2 keeps
 * only f from pass 1. A component found is outlined in green. Under the
 * graph in pass 2: the nodes in decreasing f, the one the main loop stands on
 * in the accent.
 */
import { EDGE, FONT, NODE, candidates, esc, graphSvg, place, randomGraph, stampSides, wrapSvg } from "./_graf.js";
import { firstView } from "./_dp.js";

const view = firstView(import.meta.url);

const NODES = [
  { id: 1, gx: 0, gy: 0 },
  { id: 2, gx: 0, gy: 1 },
  { id: 3, gx: 0, gy: 2 },
  { id: 4, gx: 0, gy: 3 },
  { id: 5, gx: 1, gy: 0 },
  { id: 6, gx: 1, gy: 1 },
  { id: 7, gx: 1, gy: 2 },
  { id: 8, gx: 1, gy: 3 },
];
export const FORELESNING = {
  nodes: NODES,
  edges: [
    [1, 5], [2, 1], [3, 2], [3, 4], [4, 3], [5, 2],
    [6, 2], [6, 5], [6, 7], [7, 6], [7, 3], [8, 4], [8, 7],
  ].map(([from, to]) => ({ from, to })),
};
const PAIRS = candidates(NODES, 0.3, 1.5);

/** Components by brute force (mutual reachability), to filter random graphs. */
function components(g) {
  const ids = g.nodes.map((n) => n.id);
  const reach = (s) => {
    const seen = new Set([s]);
    const todo = [s];
    while (todo.length) {
      const u = todo.pop();
      for (const e of g.edges) if (e.from === u && !seen.has(e.to)) seen.add(e.to), todo.push(e.to);
    }
    return seen;
  };
  const R = new Map(ids.map((u) => [u, reach(u)]));
  const comp = new Map();
  const out = [];
  for (const u of ids) {
    if (comp.has(u)) continue;
    const c = ids.filter((v) => R.get(u).has(v) && R.get(v).has(u));
    for (const v of c) comp.set(v, out.length);
    out.push(c);
  }
  return out;
}

function sample() {
  for (;;) {
    const g = randomGraph(NODES, PAIRS, { one: 0.3, both: 0.14, min: 10, max: 14 });
    g.edges.sort((x, y) => x.from - y.from);
    const cs = components(g);
    if (cs.length >= 3 && cs.length <= 5 && cs.some((c) => c.length >= 2)) return g;
  }
}

/**
 * A soft outline around one component: a disc at every node and a thick band along the
 * tree edges of the second pass that join them, so the outline follows the tree and never
 * covers a node outside the component.
 */
function blob(nodes, tree, pos, r) {
  const set = new Set(nodes);
  let d = "";
  for (const k of tree) {
    const [a, b] = k.split(">").map(Number);
    if (!set.has(a) || !set.has(b)) continue;
    const p = pos.get(a);
    const q = pos.get(b);
    d += `<line x1="${p.x.toFixed(1)}" y1="${p.y.toFixed(1)}" x2="${q.x.toFixed(1)}" y2="${q.y.toFixed(1)}" stroke-linecap="round" style="stroke:var(--green)" stroke-width="${(2 * r + 14).toFixed(1)}"/>`;
  }
  for (const u of nodes) {
    const p = pos.get(u);
    d += `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${(r + 7).toFixed(1)}" style="fill:var(--green)"/>`;
  }
  // Opacity on the group, so overlapping pieces do not add up.
  return `<g opacity="0.24">${d}</g>`;
}

const R = 15;
const SHAPE = { r: R };

export default {
  defaultData() {
    return view.isFirst() ? FORELESNING : sample();
  },

  run(graph) {
    const ids = graph.nodes.map((n) => n.id).sort((a, b) => a - b);
    const adj = new Map(ids.map((u) => [u, []]));
    for (const e of graph.edges) adj.get(e.from).push(e.to);
    const gt = { nodes: graph.nodes, edges: graph.edges.map((e) => ({ from: e.to, to: e.from })) };
    const adjT = new Map(ids.map((u) => [u, []]));
    for (const e of gt.edges) adjT.get(e.from).push(e.to);

    let color = Object.fromEntries(ids.map((u) => [u, "white"]));
    const d = {};
    const f = {};
    let tree = new Set();
    let stack = [];
    let time = 0;
    let pass = 1;
    let shown = graph;
    let order = [];
    const comps = [];
    const frames = [];
    const snap = (line, desc, extra = {}) =>
      frames.push({
        line,
        desc,
        vars: { time: pass === 1 ? time : "–" },
        act: {
          graph: shown,
          pass,
          color: { ...color },
          d: { ...d },
          f: { ...f },
          tree: [...tree],
          ring: stack.at(-1) ?? null,
          order: [...order],
          comps: comps.map((c) => [...c]),
          ...extra,
        },
      });

    // Pass 1: DFS on G.
    const visit1 = (u) => {
      d[u] = ++time;
      color[u] = "gray";
      stack.push(u);
      snap(2, `${u} oppdages: ${u}.d = ${time}.`);
      for (const v of adj.get(u)) {
        if (color[v] !== "white") continue;
        tree.add(`${u}>${v}`);
        visit1(v);
      }
      f[u] = ++time;
      color[u] = "black";
      stack.pop();
      snap(2, `${u} er ferdig: ${u}.f = ${time}.`);
    };
    snap(2, "Første runde er et vanlig DFS på G, med hovedløkka i nummerrekkefølge.");
    for (const u of ids) if (color[u] === "white") visit1(u);

    // Turn the edges round.
    pass = 2;
    shown = gt;
    tree = new Set();
    color = Object.fromEntries(ids.map((u) => [u, "white"]));
    order = [...ids].sort((a, b) => f[b] - f[a]);
    const top = order[0];
    snap(3, `Alle kantene snus, og grafen blir Gᵀ. Sluttidene fra første runde står igjen. ${top} har den høyeste, ${top}.f = ${f[top]}.`);

    // Pass 2: DFS on Gᵀ in decreasing f.
    let comp = [];
    const visit2 = (u) => {
      color[u] = "gray";
      comp.push(u);
      stack.push(u);
      snap(4, `${u} oppdages i Gᵀ.`);
      for (const v of adjT.get(u)) {
        if (color[v] !== "white") continue;
        tree.add(`${u}>${v}`);
        visit2(v);
      }
      color[u] = "black";
      stack.pop();
      snap(4, `${u} er ferdig i Gᵀ.`);
    };
    for (const u of order) {
      if (color[u] !== "white") continue;
      snap(4, `Den første hvite noden i rekkefølgen er ${u}, med ${u}.f = ${f[u]}. Et nytt tre starter der.`, { loop: u });
      comp = [];
      visit2(u);
      comps.push([...comp].sort((a, b) => a - b));
      snap(5, `Treet har nodene {${comps.at(-1).join(", ")}}, og det er en sterk komponent.`);
    }
    snap(5, `Alle nodene er svarte. Grafen har ${comps.length} sterke komponenter.`, { end: true });
    return frames;
  },

  render(stage, fr, api) {
    view.drawn.add(stage);
    const { w, h } = api.getSize();
    if (w <= 0 || h <= 0) {
      stage.innerHTML = "";
      return;
    }
    const a = fr.act;
    const g = a.graph;
    const rowH = a.pass === 2 ? 46 : 0;
    const side = Math.min(90, Math.max(70, w * 0.24));
    const pos = place(g.nodes, { x: 0, y: 0, w, h: h - rowH }, { l: side, r: side, t: R + 10, b: R + 10 });
    let svg = "";
    const tree = new Set(a.tree);
    for (const c of a.comps) svg += blob(c, tree, pos, R);
    svg += graphSvg(
      g,
      pos,
      () => SHAPE,
      (n) => ({ st: NODE[a.color[n.id]], ring: a.ring === n.id || a.loop === n.id }),
      (e) => ({ st: tree.has(`${e.from}>${e.to}`) ? EDGE.tree : EDGE.plain }),
    );
    const sides = stampSides(g, pos, () => SHAPE, () => 5.6, (n) => (n.gx === 0 ? ["w", "n", "s", "e"] : ["e", "n", "s", "w"]), { w, h: h - rowH });
    for (const n of g.nodes) {
      const dd = a.d[n.id];
      if (dd == null) continue;
      const t = a.pass === 1 ? `${dd}/${a.f[n.id] ?? ""}` : `f=${a.f[n.id]}`;
      const p = pos.get(n.id);
      const r = R + 8;
      const at = { w: [p.x - r, p.y + 5, "end"], e: [p.x + r, p.y + 5, "start"], n: [p.x, p.y - r - 1, "middle"], s: [p.x, p.y + r + 11, "middle"] }[sides.get(n.id)];
      svg +=
        `<text x="${at[0].toFixed(1)}" y="${at[1].toFixed(1)}" text-anchor="${at[2]}" ` +
        `style="fill:${a.pass === 1 ? "var(--fg)" : "var(--muted)"};${FONT};font-size:var(--text-sm)">${esc(t)}</text>`;
    }
    if (a.pass === 2) {
      const y = h - rowH + 18;
      const cw = Math.min(28, (w - 12) / a.order.length);
      const x0 = (w - cw * a.order.length) / 2;
      svg += `<text x="${(w / 2).toFixed(1)}" y="${y - 4}" text-anchor="middle" style="fill:var(--muted);${FONT};font-size:var(--text-xs)">synkende f</text>`;
      a.order.forEach((u, i) => {
        const now = a.loop === u;
        const done = a.color[u] !== "white";
        svg +=
          `<text x="${(x0 + (i + 0.5) * cw).toFixed(1)}" y="${y + 18}" text-anchor="middle" ` +
          `style="fill:${now ? "var(--accent-ink)" : done ? "var(--muted)" : "var(--fg)"};${FONT};font-size:var(--text-sm);font-weight:${now ? 700 : 600}">${u}</text>`;
      });
    }
    stage.innerHTML = wrapSvg(w, h, svg);
    stage.setAttribute(
      "aria-label",
      a.pass === 1 ? "Første runde: DFS på G." : `Andre runde på Gᵀ. Komponenter funnet: ${a.comps.map((c) => `{${c.join(", ")}}`).join(", ") || "ingen ennå"}.`,
    );
  },
};
