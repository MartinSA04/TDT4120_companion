/**
 * Strongly-Connected-Components trace for <Stepper>, driving the Python
 * block `sterke-komponenter` in modul 08. The stage is the lecture's graph
 * with each node's start and finish time from the first DFS beside it, and
 * the list `order` underneath, filled as nodes finish, so it ends sorted by
 * decreasing finish time. Then every edge turns around (G^T), and a second
 * DFS takes its start nodes from `order`. Each tree it grows is one strongly
 * connected component, outlined (green) once it is complete.
 *
 * Line numbers refer to that <CodeBlock>:
 *    1 def transpose(G):
 *    2     GT = {u: [] for u in G}
 *    3     for u in G:
 *    4         for v in G[u]:
 *    5             GT[v].append(u)
 *    6     return GT
 *    7
 *    8 def strongly_connected_components(G):
 *    9     order = topological_sort(G)
 *   10     GT = transpose(G)
 *   11     color = {u: "white" for u in G}
 *   12     components = []
 *   13
 *   14     def visit(u, component):
 *   15         color[u] = "gray"
 *   16         component.append(u)
 *   17         for v in GT[u]:
 *   18             if color[v] == "white":
 *   19                 visit(v, component)
 *   20         color[u] = "black"
 *   21
 *   22     for u in order:
 *   23         if color[u] == "white":
 *   24             component = []
 *   25             visit(u, component)
 *   26             components.append(component)
 *   27     return components
 *
 * The first DFS is topological_sort from the module, run on a graph that
 * may have cycles: `order` is then not a topological sort, but it still
 * lists the nodes by decreasing finish time.
 *
 * Colours are framework tokens only, so frames re-theme on the light/dark
 * toggle without the module knowing which theme is active.
 */

import {
  EDGE, FONT, NODE, adjacency, candidates, esc, graphSvg, place, randomGraph, stamp, stampSides, wrapSvg,
} from "./_graf.js";

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

// The lecture's graph, with adjacency lists that give its times
// (1: 1/6, 5: 2/5, 2: 3/4, 3: 7/10, 4: 8/9, 6: 11/14, 7: 12/13, 8: 15/16).
const FIRST = {
  nodes: NODES,
  edges: [
    [1, 5], [2, 1], [3, 2], [3, 4], [4, 3], [5, 2],
    [6, 2], [6, 5], [6, 7], [7, 6], [7, 3], [8, 4], [8, 7],
  ].map(([from, to]) => ({ from, to })),
};

const PAIRS = candidates(NODES, 0.6, 2.3);

function sample() {
  const g = randomGraph(NODES, PAIRS, { one: 0.3, both: 0.15, min: 10, max: 15 });
  // Adjacency lists in node order, each list in random order.
  return { nodes: NODES, edges: g.edges.sort((x, y) => x.from - y.from) };
}

let calls = 0;


/** A rounded outline around a set of node centres: a thick, round-joined stroke. */
function blob(points, r) {
  if (!points.length) return "";
  // Convex hull (monotone chain), so the outline stays a single shape.
  const pts = [...points].sort((a, b) => a.x - b.x || a.y - b.y);
  const cross = (o, a, b) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
  const lower = [];
  for (const p of pts) {
    while (lower.length >= 2 && cross(lower.at(-2), lower.at(-1), p) <= 0) lower.pop();
    lower.push(p);
  }
  const upper = [];
  for (const p of [...pts].reverse()) {
    while (upper.length >= 2 && cross(upper.at(-2), upper.at(-1), p) <= 0) upper.pop();
    upper.push(p);
  }
  const hull = [...lower.slice(0, -1), ...upper.slice(0, -1)];
  const ring = hull.length ? hull : pts;
  const d = ring.map((p, i) => `${i ? "L" : "M"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ") + " Z";
  // Opacity on the group, so the fill and the stroke do not add up where they overlap.
  return (
    `<g opacity="0.22"><path d="${d}" stroke-linejoin="round" stroke-linecap="round" ` +
    `style="fill:var(--green);stroke:var(--green)" stroke-width="${(2 * r + 14).toFixed(1)}"/></g>`
  );
}

export default {
  // The first graph is the lecture's; after that, random graphs on the same nodes.
  defaultData() {
    if (calls++ === 0) return FIRST;
    return sample();
  },

  run(graph) {
    const ids = graph.nodes.map((n) => n.id);
    const adj = adjacency(graph);
    const gt = { nodes: graph.nodes, edges: [] };
    for (const u of ids) for (const v of adj.get(u)) gt.edges.push({ from: v, to: u });
    const adjT = adjacency(gt);

    let color = Object.fromEntries(ids.map((u) => [u, "white"]));
    const d = {};
    const f = {};
    let seen = {};
    const order = [];
    const comps = [];
    let shown = graph;
    let time = 0;
    let phase = 1;
    const frames = [];
    const snap = (line, desc, vars, extra = {}) =>
      frames.push({
        line, desc, vars, graph: shown, phase,
        color: { ...color }, d: { ...d }, f: { ...f }, seen: { ...seen },
        order: [...order], comps: comps.map((c) => [...c]), ...extra,
      });

    // First round: DFS on G for the finish times, as topological_sort.
    snap(9, "Første runde er DFS på G. Den gir hver node en sluttid, og order blir nodene etter synkende sluttid.", {});
    const visit1 = (u) => {
      time += 1;
      d[u] = time;
      color[u] = "gray";
      snap(9, `${u} oppdages ved tid ${time} og blir grå.`, { u }, { cur: u });
      for (const v of adj.get(u)) {
        if (color[v] === "white") {
          seen[`${u}>${v}`] = "tree";
          visit1(v);
        }
      }
      time += 1;
      f[u] = time;
      color[u] = "black";
      order.unshift(u);
      snap(9, `${u} er ferdig ved tid ${time}, blir svart og settes først i order.`, { u }, { cur: u, inserted: u });
    };
    for (const u of ids) if (color[u] === "white") visit1(u);

    // Turn every edge around.
    phase = 2;
    shown = gt;
    seen = {};
    color = Object.fromEntries(ids.map((u) => [u, "white"]));
    snap(
      [10, 11, 12],
      `Gᵀ er G med alle kantene snudd. Den har de samme sterke komponentene. Alle nodene er hvite igjen, og andre runde tar startnodene fra order: ${order.join(", ")}.`,
      {},
    );

    const visit2 = (u, comp) => {
      color[u] = "gray";
      comp.push(u);
      snap([15, 16], `visit(${u}): ${u} blir grå og hører til komponenten.`, { u }, { cur: u, open: [...comp] });
      for (const v of adjT.get(u)) {
        const key = `${u}>${v}`;
        if (color[v] === "white") {
          seen[key] = "tree";
          snap([17, 18, 19], `Kanten (${u}, ${v}) i Gᵀ: ${v} er hvit, så visit(${v}).`, { u, v }, { cur: u, edge: key, open: [...comp] });
          visit2(v, comp);
        } else {
          seen[key] = "other";
          const why =
            color[v] === "gray"
              ? `${v} er grå og alt med i dette treet.`
              : comp.includes(v)
                ? `${v} er svart og alt med i dette treet.`
                : `${v} er svart og hører til en komponent som er funnet. Kanten fører ikke videre.`;
          snap([17, 18], `Kanten (${u}, ${v}) i Gᵀ: ${why}`, { u, v }, { cur: u, edge: key, open: [...comp] });
        }
      }
      color[u] = "black";
      snap(20, `Alle naboene til ${u} i Gᵀ er sett, og ${u} blir svart.`, { u }, { cur: u, open: [...comp] });
    };

    let skipped = [];
    const flush = () => {
      if (!skipped.length) return;
      const list = skipped.length === 1 ? `${skipped[0]} er` : `${skipped.slice(0, -1).join(", ")} og ${skipped.at(-1)} er`;
      snap([22, 23], `Hovedløkka: ${list} svart, og hoppes over.`, {});
      skipped = [];
    };
    for (const u of order) {
      if (color[u] !== "white") {
        skipped.push(u);
        continue;
      }
      flush();
      snap(
        [22, 23, 24],
        `Hovedløkka: ${u} har høyest sluttid av de hvite nodene, så et nytt tre starter i ${u}.`,
        { u },
        { cur: u, loop: u },
      );
      const comp = [];
      visit2(u, comp);
      comps.push(comp);
      const set = `{${[...comp].sort((a, b) => a - b).join(", ")}}`;
      snap(
        [25, 26],
        comp.length === 1
          ? `Treet fra ${u} har bare ${u}. ${set} er en sterk komponent.`
          : `Treet fra ${u} er ${set}. Det er en sterk komponent.`,
        {},
        { loop: u },
      );
    }
    flush();
    snap(27, `Ferdig: ${comps.length} sterke komponenter, ett dybde-først-tre i Gᵀ for hver.`, {});

    const width = Object.fromEntries(ids.map((u) => [u, `${d[u]}/${f[u]}`.length]));
    for (const fr of frames) fr.width = width;
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
    const ROW_H = CELL_H + 18;
    const r = 14;
    const shape = { r };
    const gw = Math.min(w, 280);
    const gx = (w - gw) / 2;
    const graphH = h - ROW_H - 8;
    const pos = place(graph.nodes, { x: gx, y: 0, w: gw, h: graphH }, { l: r + 46, r: r + 46, t: r + 6, b: r + 6 });

    let svg = "";
    for (const c of frame.comps) svg += blob(c.map((u) => pos.get(u)), r);

    const nodeStyle = (nd) => ({ st: NODE[frame.color[nd.id]], ring: frame.cur === nd.id });
    const edgeStyle = (e) => {
      const key = `${e.from}>${e.to}`;
      if (frame.edge === key) return { st: EDGE.cur };
      const k = frame.seen[key];
      if (!k) return { st: EDGE.plain };
      return { st: k === "tree" ? EDGE.tree : EDGE.other };
    };
    svg += graphSvg(graph, pos, () => shape, nodeStyle, edgeStyle);

    // Start and finish times from the first round, outside each column.
    const sides = stampSides(
      graph, pos, () => shape, (nd) => frame.width[nd.id],
      (nd) => (nd.gx === 0 ? ["w", "n", "s", "e"] : ["e", "n", "s", "w"]),
      { w, h: graphH + 6 },
    );
    for (const nd of graph.nodes) {
      const u = nd.id;
      if (frame.d[u] == null) continue;
      svg += stamp(pos.get(u), shape, sides.get(u), `${frame.d[u]}/${frame.f[u] ?? ""}`, "var(--muted)");
    }

    // order, right-aligned: the first node to finish takes the last cell, and
    // each new one goes in front of it.
    const LABEL_W = 46;
    const cellW = Math.min(34, (w - LABEL_W) / n);
    const x0 = LABEL_W + (w - LABEL_W - cellW * n) / 2;
    const y = h - CELL_H - 2;
    svg +=
      `<text x="${(x0 - 6).toFixed(1)}" y="${(y + CELL_H / 2 + 4).toFixed(1)}" text-anchor="end" ` +
      `style="fill:var(--muted);${FONT}">order</text>`;
    const offset = n - frame.order.length;
    for (let i = 0; i < n; i++) {
      const x = x0 + i * cellW;
      const k = i - offset;
      const u = k >= 0 ? frame.order[k] : null;
      let st = { fill: "none", stroke: "var(--border)", text: "var(--fg)" };
      let dash = u == null;
      if (u != null) {
        if (frame.phase === 1) st = frame.inserted === u ? { fill: "var(--accent-weak)", stroke: "var(--accent)", text: "var(--accent-ink)" } : { fill: "none", stroke: "var(--muted)", text: "var(--fg)" };
        else if (frame.loop === u) st = { fill: "var(--accent-weak)", stroke: "var(--accent)", text: "var(--accent-ink)" };
        else st = { fill: "none", stroke: "var(--muted)", text: frame.color[u] === "white" ? "var(--fg)" : "var(--faint)" };
      }
      svg +=
        `<rect x="${(x + 1).toFixed(1)}" y="${y}" width="${(cellW - 2).toFixed(1)}" height="${CELL_H}" rx="4" ` +
        `style="fill:${st.fill};stroke:${st.stroke}" stroke-width="${st.stroke === "var(--accent)" ? 2 : 1.2}"` +
        `${dash ? ' stroke-dasharray="3 3"' : ""}/>`;
      if (u != null) {
        svg +=
          `<text x="${(x + cellW / 2).toFixed(1)}" y="${(y + CELL_H / 2 + 4).toFixed(1)}" text-anchor="middle" ` +
          `style="fill:${st.text};${FONT};font-weight:600">${esc(u)}</text>`;
      }
    }
    // Which graph is drawn.
    svg +=
      `<text x="${(w - 4).toFixed(1)}" y="14" text-anchor="end" ` +
      `style="fill:var(--muted);${FONT};font-weight:600">${frame.phase === 1 ? "G" : "Gᵀ"}</text>`;

    stage.innerHTML = wrapSvg(w, h, svg);
  },
};
