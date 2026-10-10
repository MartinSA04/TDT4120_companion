/**
 * BFS trace for <Stepper>, driving the Python block `bfs` in modul 08, on
 * the same graph as the DFS stepper. Each node shows its distance d from the
 * start node (∞ until it is discovered), the edges to the predecessors get a
 * band and form the breadth-first tree, and the queue Q is drawn underneath
 * as every node that has been in it, in order: the ones already taken out
 * are faded. The last two steps run print_path to the node farthest away.
 *
 * Line numbers refer to that <CodeBlock>:
 *    1 from collections import deque
 *    2
 *    3 def bfs(G, s):
 *    4     color = {u: "white" for u in G}
 *    5     d = {u: float("inf") for u in G}
 *    6     pi = {u: None for u in G}
 *    7     color[s] = "gray"
 *    8     d[s] = 0
 *    9     Q = deque([s])
 *   10     while Q:
 *   11         u = Q.popleft()
 *   12         for v in G[u]:
 *   13             if color[v] == "white":
 *   14                 color[v] = "gray"
 *   15                 d[v] = d[u] + 1
 *   16                 pi[v] = u
 *   17                 Q.append(v)
 *   18         color[u] = "black"
 *   19     return d, pi
 *   20
 *   21 def print_path(pi, s, v):
 *   22     if v == s:
 *   23         print(s)
 *   24     elif pi[v] is None:
 *   25         print("ingen sti fra", s, "til", v)
 *   26     else:
 *   27         print_path(pi, s, pi[v])
 *   28         print(v)
 *
 * Colours are framework tokens only, so frames re-theme on the light/dark
 * toggle without the module knowing which theme is active.
 */

import {
  EDGE, FONT, FORELESNING, NODE, adjacency, candidates, cellsSvg, graphSvg, place, randomGraph, stamp,
  stampSides, wrapSvg,
} from "./_graf.js";

const FIRST = FORELESNING;
const PAIRS = candidates(FIRST.nodes, 0.6, 3.1);
const S = 1;

let calls = 0;

export default {
  // The first graph is the lecture's; after that, random graphs on the same nodes.
  defaultData() {
    if (calls++ === 0) return FIRST;
    // Keep drawing until most of the graph can be reached from the start node.
    for (;;) {
      const g = randomGraph(FIRST.nodes, PAIRS, { one: 0.42, both: 0.06 });
      const adj = adjacency(g);
      const seen = new Set([S]);
      const todo = [S];
      while (todo.length) for (const v of adj.get(todo.pop())) if (!seen.has(v)) seen.add(v), todo.push(v);
      if (seen.size >= 7) return g;
    }
  },

  run(graph) {
    const adj = adjacency(graph);
    const ids = graph.nodes.map((n) => n.id);
    const color = Object.fromEntries(ids.map((u) => [u, "white"]));
    const d = Object.fromEntries(ids.map((u) => [u, Infinity]));
    const pi = Object.fromEntries(ids.map((u) => [u, null]));
    const queued = [];
    let head = 0;
    const frames = [];
    const snap = (line, desc, vars, extra = {}) =>
      frames.push({
        line, desc, vars, graph,
        color: { ...color }, d: { ...d }, pi: { ...pi }, queued: [...queued], head, ...extra,
      });
    const show = (x) => (x === Infinity ? "∞" : x);

    color[S] = "gray";
    d[S] = 0;
    queued.push(S);
    snap(
      [4, 5, 6, 7, 8, 9],
      `Alle nodene er hvite med d = ∞. Startnoden ${S} blir grå med d = 0 og er det eneste i køen.`,
      { s: S },
    );

    while (head < queued.length) {
      const u = queued[head++];
      snap([10, 11], `${u} tas ut av køen. d[${u}] = ${d[u]}.`, { u, "d[u]": d[u] }, { cur: u });
      for (const v of adj.get(u)) {
        const key = `${u}>${v}`;
        if (color[v] === "white") {
          color[v] = "gray";
          d[v] = d[u] + 1;
          pi[v] = u;
          queued.push(v);
          snap(
            [12, 13, 14, 15, 16, 17],
            `Kanten (${u}, ${v}): ${v} er hvit. Den blir grå med d = ${d[u]} + 1 = ${d[v]} og π = ${u}, og settes bakerst i køen.`,
            { u, v, "d[v]": d[v] },
            { cur: u, edge: key },
          );
        } else {
          snap(
            [12, 13],
            `Kanten (${u}, ${v}): ${v} er ${color[v] === "gray" ? "grå" : "svart"} og har alt fått d = ${d[v]}. Ingenting endres.`,
            { u, v, "d[v]": d[v] },
            { cur: u, edge: key },
          );
        }
      }
      color[u] = "black";
      snap(18, `Alle naboene til ${u} er sett, og ${u} blir svart.`, { u }, { cur: u });
    }

    const unreached = ids.filter((u) => d[u] === Infinity);
    snap(
      19,
      unreached.length
        ? `Køen er tom. ${unreached.join(", ")} kan ikke nås fra ${S} og har d = ∞. For de andre er d lengden av en korteste vei fra ${S}.`
        : `Køen er tom. Hver d er lengden av en korteste vei fra ${S}, og π-kantene utgjør bredde-først-treet.`,
      {},
    );

    // print_path to the farthest node that can be reached.
    let t = S;
    for (const u of ids) if (d[u] !== Infinity && d[u] >= d[t]) t = u;
    if (t !== S) {
      const path = [t];
      while (path[0] !== S) path.unshift(pi[path[0]]);
      const edges = path.slice(1).map((v, i) => `${path[i]}>${v}`);
      const back = path.slice(1).reverse().map((v) => `${v}.π = ${pi[v]}`).join(", ");
      snap(
        [21, 22, 24, 26, 27],
        `print_path(pi, ${S}, ${t}) følger forgjengerne bakover: ${back}.`,
        { s: S, v: t },
        { path: edges, pathNodes: path },
      );
      snap(
        [22, 23, 28],
        `På vei ut av rekursjonen skrives ${path.join(", ")}. Stien har ${path.length - 1} kanter, og d[${t}] = ${d[t]}.`,
        { s: S, v: t },
        { path: edges, pathNodes: path },
      );
    }
    for (const fr of frames) fr.show = Object.fromEntries(ids.map((u) => [u, show(fr.d[u])]));
    return frames;
  },

  render(stage, frame, api) {
    const { w, h } = api.getSize();
    const { graph } = frame;
    if (!graph || w <= 0 || h <= 0) {
      stage.innerHTML = "";
      return;
    }
    const n = graph.nodes.length;
    const CELL_H = 24;
    const graphH = h - CELL_H - 14;
    const r = Math.max(10, Math.min(14, w / 30));
    const shape = { r };
    const pos = place(graph.nodes, { x: 0, y: 0, w, h: graphH }, { l: r + 40, r: r + 16, t: r + 18, b: r + 18 });

    const onPath = new Set(frame.path ?? []);
    const nodeStyle = (nd) => ({
      st: NODE[frame.color[nd.id]],
      ring: frame.cur === nd.id || (frame.pathNodes ?? []).includes(nd.id),
    });
    const edgeStyle = (e) => {
      const key = `${e.from}>${e.to}`;
      if (frame.edge === key || onPath.has(key)) return { st: EDGE.cur };
      if (frame.pi[e.to] === e.from) return { st: EDGE.tree };
      return { st: EDGE.plain };
    };
    let svg = graphSvg(graph, pos, () => shape, nodeStyle, edgeStyle);

    // d beside every node; ∞ is faint until the node is discovered.
    const maxGy = Math.max(...graph.nodes.map((nd) => nd.gy));
    const sides = stampSides(
      graph, pos, () => shape, () => 1,
      (nd) => (nd.gy === 0 ? ["n", "w", "e", "s"] : nd.gy === maxGy ? ["s", "w", "e", "n"] : ["w", "e", "n", "s"]),
      { w, h: graphH + 8 },
    );
    for (const nd of graph.nodes) {
      const u = nd.id;
      const inf = frame.d[u] === Infinity;
      svg += stamp(pos.get(u), shape, sides.get(u), frame.show[u], inf ? "var(--faint)" : "var(--accent-ink)");
    }

    // Q: every node that has been in the queue; the ones taken out are faded.
    const LABEL_W = 22;
    const cellW = Math.min(34, (w - LABEL_W - 4) / n);
    const x0 = LABEL_W;
    const y = h - CELL_H - 2;
    svg +=
      `<text x="${x0 - 8}" y="${(y + CELL_H / 2 + 4).toFixed(1)}" text-anchor="end" ` +
      `style="fill:var(--muted);${FONT};font-weight:600">Q</text>`;
    svg += cellsSvg(x0, y, cellW, CELL_H, frame.queued, (i) => {
      const u = frame.queued[i];
      if (frame.cur === u && i < frame.head) return { fill: "var(--accent-weak)", stroke: "var(--accent)", text: "var(--accent-ink)", wdt: 2 };
      if (i < frame.head) return { fill: "none", stroke: "var(--border)", text: "var(--faint)" };
      return { fill: NODE.gray.fill, stroke: "var(--fg)", text: "var(--fg)" };
    });

    stage.innerHTML = wrapSvg(w, h, svg);
  },
};
