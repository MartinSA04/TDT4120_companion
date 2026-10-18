/**
 * MST-Prim trace for <Stepper>, driving the Python block `prim` in modul 09,
 * on the same weighted graph as the Kruskal stepper, from r = 1. Nodes are
 * coloured as in the lecture: black once they are taken out of Q and are in
 * the tree, gray while they wait in Q with a finite key, white while the key
 * is ∞. The key stands beside each node. Tree edges (v, v.π) get a band; for
 * a gray node the edge to v.π, its lightest edge to the tree so far, is
 * dashed. Under the graph, Q stands sorted by key, so the first cell is the
 * node Extract-Min takes next.
 *
 * Line numbers refer to that <CodeBlock>:
 *    1 def mst_prim(G, w, r):  # w[u, v] = w[v, u] er vekten til kanten
 *    2     key = {u: float("inf") for u in G}
 *    3     pi = {u: None for u in G}
 *    4     key[r] = 0
 *    5     Q = set(G)
 *    6     while Q:
 *    7         u = min(Q, key=key.get)  # Extract-Min
 *    8         Q.remove(u)
 *    9         for v in G[u]:
 *   10             if v in Q and w[u, v] < key[v]:
 *   11                 pi[v] = u
 *   12                 key[v] = w[u, v]  # Decrease-Key
 *   13     return pi
 *
 * Ties in Extract-Min go to the smallest node, as Python's min over a small
 * set of integers does.
 *
 * Colours are framework tokens only, so frames re-theme on the light/dark
 * toggle without the module knowing which theme is active.
 */

import { EDGE, FONT, NODE, VEKTET, cellsSvg, graphSvg, place, reweighted, stamp, stampSides, wrapSvg } from "./_graf.js";

const BEST = { stroke: "var(--fg)", wdt: 1.4, dash: "5 3" };
const R = 1;

let calls = 0;

export default {
  // The lecture's weights first; after that, new random weights on the same graph.
  defaultData() {
    return calls++ === 0 ? VEKTET : reweighted(VEKTET);
  },

  run(graph) {
    const ids = graph.nodes.map((n) => n.id);
    const adj = new Map(ids.map((u) => [u, []]));
    // Neighbours in the order the edges are listed, from both ends.
    for (const e of graph.edges) {
      adj.get(e.from).push([e.to, e.w]);
      adj.get(e.to).push([e.from, e.w]);
    }
    for (const list of adj.values()) list.sort((a, b) => a[0] - b[0]);
    const key = Object.fromEntries(ids.map((u) => [u, Infinity]));
    const pi = Object.fromEntries(ids.map((u) => [u, null]));
    const Q = new Set(ids);
    const frames = [];
    const show = (x) => (x === Infinity ? "∞" : x);
    const snap = (line, desc, vars, extra = {}) =>
      frames.push({ line, desc, vars, graph, key: { ...key }, pi: { ...pi }, Q: new Set(Q), ...extra });

    key[R] = 0;
    snap([2, 3, 4, 5], `Alle nøklene er ∞ og alle π er nil, bortsett fra r = ${R}, som får nøkkel 0. Alle nodene står i Q.`, { r: R });

    let total = 0;
    while (Q.size) {
      let u = null;
      for (const x of [...Q].sort((a, b) => a - b)) if (u === null || key[x] < key[u]) u = x;
      Q.delete(u);
      if (pi[u] === null) {
        snap([6, 7, 8], `Extract-Min gir u = ${u} med nøkkel ${show(key[u])}. ${u} er rota og blir den første noden i treet.`, { u, "key[u]": show(key[u]) }, { cur: u });
      } else {
        total += key[u];
        snap(
          [6, 7, 8],
          `Extract-Min gir u = ${u} med nøkkel ${key[u]}. Kanten (${u}, ${pi[u]}) med vekt ${key[u]} er den letteste mellom treet og resten, og den blir med i treet.`,
          { u, "key[u]": key[u] },
          { cur: u, edge: [u, pi[u]] },
        );
      }
      for (const [v, wt] of adj.get(u)) {
        const vars = { u, v, "w[u, v]": wt, "key[v]": show(key[v]) };
        if (!Q.has(v)) {
          snap([9, 10], `Naboen ${v} er alt i treet.`, vars, { cur: u, edge: [u, v] });
        } else if (wt < key[v]) {
          const old = show(key[v]);
          pi[v] = u;
          key[v] = wt;
          snap(
            [9, 10, 11, 12],
            `Naboen ${v}: w(${u}, ${v}) = ${wt} < ${old}. Nå er ${v}.π = ${u} og ${v}.key = ${wt}.`,
            { ...vars, "key[v]": wt },
            { cur: u, edge: [u, v], changed: v },
          );
        } else {
          snap([9, 10], `Naboen ${v}: w(${u}, ${v}) = ${wt} er ikke mindre enn ${v}.key = ${key[v]}. Ingenting endres.`, vars, { cur: u, edge: [u, v] });
        }
      }
    }
    snap(13, `Q er tom. Kantene (v, v.π) er et minimalt spenntre med vektsum ${total}.`, {});
    for (const fr of frames) fr.show = Object.fromEntries(ids.map((u) => [u, show(fr.key[u])]));
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
    const pos = place(graph.nodes, { x: 0, y: 0, w, h: graphH }, { l: r + 26, r: r + 26, t: r + 22, b: r + 22 });

    const colour = (u) => (!frame.Q.has(u) ? "black" : frame.key[u] < Infinity ? "gray" : "white");
    const isEdge = (e, pair) => pair && ((e.from === pair[0] && e.to === pair[1]) || (e.from === pair[1] && e.to === pair[0]));
    const nodeStyle = (nd) => ({ st: NODE[colour(nd.id)], ring: frame.cur === nd.id });
    const edgeStyle = (e) => {
      const base = { weight: e.w, weightColor: "var(--muted)" };
      if (isEdge(e, frame.edge)) return { ...base, st: EDGE.cur, weightColor: "var(--accent-ink)", weightBold: true };
      for (const [a, b] of [[e.from, e.to], [e.to, e.from]]) {
        if (frame.pi[a] !== b) continue;
        if (!frame.Q.has(a)) return { ...base, st: EDGE.tree, weightColor: "var(--fg)", weightBold: true };
        return { ...base, st: BEST, weightColor: "var(--fg)" };
      }
      return { ...base, st: EDGE.plain };
    };
    let svg = graphSvg(graph, pos, () => shape, nodeStyle, edgeStyle);

    // key beside every node; ∞ is faint, a key that just changed is in the accent.
    const maxGy = Math.max(...graph.nodes.map((nd) => nd.gy));
    const [minGx, maxGx] = [Math.min(...graph.nodes.map((nd) => nd.gx)), Math.max(...graph.nodes.map((nd) => nd.gx))];
    const sides = stampSides(
      graph, pos, () => shape, () => 2,
      (nd) =>
        nd.gy === 0 ? ["n", "w", "e", "s"]
        : nd.gy === maxGy ? ["s", "w", "e", "n"]
        : nd.gx === maxGx ? ["e", "w", "n", "s"]
        : nd.gx === minGx ? ["w", "e", "n", "s"]
        : ["w", "e", "n", "s"],
      { w, h: graphH + 8 },
    );
    for (const nd of graph.nodes) {
      const u = nd.id;
      const c = frame.key[u] === Infinity ? "var(--faint)" : frame.changed === u ? "var(--accent-ink)" : "var(--muted)";
      svg += stamp(pos.get(u), shape, sides.get(u), frame.show[u], c);
    }

    // Q sorted by key (ties by node), so the first cell is the next Extract-Min.
    const inQ = [...frame.Q].sort((a, b) => frame.key[a] - frame.key[b] || a - b);
    const LABEL_W = 22;
    const cellW = Math.min(34, (w - LABEL_W - 4) / graph.nodes.length);
    const x0 = LABEL_W;
    const y = h - CELL_H - 2;
    svg +=
      `<text x="${x0 - 8}" y="${(y + CELL_H / 2 + 4).toFixed(1)}" text-anchor="end" ` +
      `style="fill:var(--muted);${FONT};font-weight:600">Q</text>`;
    svg += cellsSvg(x0, y, cellW, CELL_H, inQ, (i) => {
      const st = NODE[colour(inQ[i])];
      return { fill: st.fill, stroke: st.stroke, text: st.text };
    });

    stage.innerHTML = wrapSvg(w, h, svg);
  },
};
