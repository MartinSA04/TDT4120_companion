/**
 * MST-Kruskal trace for <Stepper>, driving the Python block `kruskal` in
 * modul 09, on the lecture's weighted graph. The edges in A get a band like
 * a traversal tree, the edge being looked at is in the accent colour, and an
 * edge that is skipped stays dashed. An edge that is skipped is dashed in the
 * accent colour while it is looked at, and the path in A between its ends is
 * drawn in the accent too, so the cycle it would close shows as one loop. Under the graph the
 * edges stand sorted by weight: taken ones filled, skipped ones faint.
 *
 * Line numbers refer to that <CodeBlock>:
 *    1 def mst_kruskal(V, E, w):  # w[u, v] er vekten til kanten (u, v)
 *    2     A = []
 *    3     for v in V:
 *    4         make_set(v)
 *    5     E = sorted(E, key=lambda e: w[e])
 *    6     for u, v in E:
 *    7         if find_set(u) != find_set(v):
 *    8             A.append((u, v))
 *    9             union(u, v)
 *   10     return A
 *
 * The disjoint sets are a black box here, as in the lecture: the stepper
 * keeps its own component labels and draws only the forest (V, A).
 *
 * Colours are framework tokens only, so frames re-theme on the light/dark
 * toggle without the module knowing which theme is active.
 */

import { EDGE, NODE, VEKTET, cellsSvg, graphSvg, place, reweighted, wrapSvg } from "./_graf.js";

const CYCLE = { stroke: "var(--accent)", wdt: 2.4, band: true };
const CUR_SKIP = { stroke: "var(--accent)", wdt: 2.4, dash: "6 4" };
const SKIPPED = { stroke: "var(--muted)", wdt: 1.2, dash: "4 3", opacity: 0.7 };

let calls = 0;

const key = (e) => `${e.from}-${e.to}`;

/** The path from u to v along the edges in A, as a list of edge keys. */
function pathInA(graph, A, u, v) {
  const adj = new Map(graph.nodes.map((n) => [n.id, []]));
  for (const e of graph.edges) {
    if (!A.has(key(e))) continue;
    adj.get(e.from).push([e.to, key(e)]);
    adj.get(e.to).push([e.from, key(e)]);
  }
  const back = new Map([[u, null]]);
  const todo = [u];
  while (todo.length) {
    const x = todo.shift();
    for (const [y, k] of adj.get(x)) if (!back.has(y)) back.set(y, [x, k]), todo.push(y);
  }
  const keys = [];
  const nodes = [v];
  for (let x = v; back.get(x); x = back.get(x)[0]) {
    keys.push(back.get(x)[1]);
    nodes.push(back.get(x)[0]);
  }
  return { keys, nodes: nodes.reverse() };
}

export default {
  // The lecture's weights first; after that, new random weights on the same graph.
  defaultData() {
    return calls++ === 0 ? VEKTET : reweighted(VEKTET);
  },

  run(graph) {
    // Python's sorted is stable, so ties keep the order of E.
    const sorted = graph.edges.map((e, i) => ({ e, i })).sort((a, b) => a.e.w - b.e.w || a.i - b.i).map((x) => x.e);
    const comp = new Map(graph.nodes.map((n) => [n.id, n.id]));
    const A = new Set();
    const skipped = new Set();
    let total = 0;
    const frames = [];
    const snap = (line, desc, vars, extra = {}) =>
      frames.push({ line, desc, vars, graph, sorted, A: new Set(A), skipped: new Set(skipped), ...extra });

    snap([2, 3, 4, 5], "A er tom, og Make-Set gjør hver node til sitt eget tre. Kantene sorteres etter stigende vekt.", {});

    sorted.forEach((e, idx) => {
      const { from: u, to: v, w } = e;
      const vars = { u, v, "w[u, v]": w };
      if (comp.get(u) !== comp.get(v)) {
        A.add(key(e));
        total += w;
        const [keep, gone] = [comp.get(v), comp.get(u)];
        for (const [x, c] of comp) if (c === gone) comp.set(x, keep);
        snap(
          [6, 7, 8, 9],
          `Kanten (${u}, ${v}) med vekt ${w}: ${u} og ${v} er i ulike trær. Kanten legges i A, og Union slår sammen de to trærne.`,
          vars,
          { cur: key(e), idx, ends: [u, v] },
        );
      } else {
        const { keys, nodes } = pathInA(graph, A, u, v);
        skipped.add(key(e));
        snap(
          [6, 7],
          `Kanten (${u}, ${v}) med vekt ${w}: ${u} og ${v} er alt i samme tre, og kanten ville lukket sykelen ${nodes.join(", ")}. Den hoppes over.`,
          vars,
          { cur: key(e), idx, ends: [u, v], cycle: keys },
        );
      }
    });

    snap(
      10,
      `A har ${A.size} kanter og når alle nodene, med vektsum ${total}. A er et minimalt spenntre.`,
      {},
      { idx: sorted.length },
    );
    return frames;
  },

  render(stage, frame, api) {
    const { w, h } = api.getSize();
    const { graph } = frame;
    if (!graph || w <= 0 || h <= 0) {
      stage.innerHTML = "";
      return;
    }
    const CELL_H = 24;
    const graphH = h - CELL_H - 16;
    const r = Math.max(10, Math.min(14, w / 30));
    const shape = { r };
    const pos = place(graph.nodes, { x: 0, y: 0, w, h: graphH }, { l: r + 6, r: r + 6, t: r + 6, b: r + 6 });

    const cycle = new Set(frame.cycle ?? []);
    const nodeStyle = (nd) => ({ st: NODE.white, ring: (frame.ends ?? []).includes(nd.id) });
    const edgeStyle = (e) => {
      const k = key(e);
      const base = { weight: e.w, weightColor: "var(--muted)" };
      if (frame.cur === k) return { ...base, st: frame.cycle ? CUR_SKIP : EDGE.cur, weightColor: "var(--accent-ink)", weightBold: true };
      if (cycle.has(k)) return { ...base, st: CYCLE, weightColor: "var(--accent-ink)", weightBold: true };
      if (frame.A.has(k)) return { ...base, st: EDGE.tree, weightColor: "var(--fg)", weightBold: true };
      if (frame.skipped.has(k)) return { ...base, st: SKIPPED, weightColor: "var(--faint)" };
      return { ...base, st: EDGE.plain };
    };
    let svg = graphSvg(graph, pos, () => shape, nodeStyle, edgeStyle);

    // The sorted edge list: taken edges filled, skipped ones faint, the current one in the accent.
    const n = frame.sorted.length;
    const cellW = Math.min(34, (w - 2) / n);
    const x0 = (w - cellW * n) / 2;
    const y = h - CELL_H - 2;
    svg += cellsSvg(x0, y, cellW, CELL_H, frame.sorted.map((e) => e.w), (i) => {
      const k = key(frame.sorted[i]);
      if (i === frame.idx) return { fill: "var(--accent-weak)", stroke: "var(--accent)", text: "var(--accent-ink)", wdt: 2 };
      if (frame.A.has(k)) return { fill: "color-mix(in srgb, var(--fg) 16%, transparent)", stroke: "var(--fg)", text: "var(--fg)" };
      if (frame.skipped.has(k)) return { fill: "none", stroke: "var(--border)", text: "var(--faint)" };
      return { fill: "var(--bg)", stroke: "var(--muted)", text: "var(--fg)" };
    });

    stage.innerHTML = wrapSvg(w, h, svg);
  },
};
