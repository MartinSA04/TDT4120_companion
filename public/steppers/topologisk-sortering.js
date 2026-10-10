/**
 * Topological-Sort trace for <Stepper>, driving the Python block
 * `topologisk-sortering` in modul 08. The stage has the lecture's
 * dressing graph on the left: an edge (u, v) means u has to go on before v.
 * Each box shows the garment and its start and finish time, "d/f", as in
 * DFS. On the right is the list `order`: a garment is inserted at the front
 * when it turns black, so the list grows upwards. Every edge out of a node in
 * the list is drawn as an arc on the right of the list, and every arc points
 * down, because a node finishes after everything it has an edge to.
 *
 * Line numbers refer to that <CodeBlock>:
 *    1 from collections import deque
 *    2
 *    3 def topological_sort(G):
 *    4     color = {u: "white" for u in G}
 *    5     order = deque()
 *    6
 *    7     def visit(u):
 *    8         color[u] = "gray"
 *    9         for v in G[u]:
 *   10             if color[v] == "white":
 *   11                 visit(v)
 *   12         color[u] = "black"
 *   13         order.appendleft(u)
 *   14
 *   15     for u in G:
 *   16         if color[u] == "white":
 *   17             visit(u)
 *   18     return list(order)
 *
 * Shuffling keeps the graph and changes the order of the main loop and of
 * the adjacency lists, so the reader sees that the sorting is not unique.
 *
 * Colours are framework tokens only, so frames re-theme on the light/dark
 * toggle without the module knowing which theme is active.
 */

import { EDGE, FONT, NODE, esc, graphSvg, place, shuffle, wrapSvg } from "./_graf.js";

// The lecture's layout: two columns of garments.
const NODES = [
  { id: "klokke", gx: 0, gy: 0 },
  { id: "truse", gx: 0, gy: 1 },
  { id: "bukse", gx: 0, gy: 2 },
  { id: "belte", gx: 0, gy: 3 },
  { id: "sokker", gx: 1, gy: 0 },
  { id: "sko", gx: 1, gy: 1 },
  { id: "skjorte", gx: 1, gy: 2 },
  { id: "slips", gx: 1, gy: 3 },
  { id: "jakke", gx: 1, gy: 4 },
];

// G.V and the adjacency lists in an order that gives the lecture's times:
// skjorte 1/8, klokke 9/10, truse 11/16 and sokker 17/18.
const FIRST = {
  V: ["skjorte", "slips", "jakke", "belte", "klokke", "truse", "bukse", "sko", "sokker"],
  adj: {
    skjorte: ["slips", "belte"],
    slips: ["jakke"],
    jakke: [],
    belte: ["jakke"],
    klokke: [],
    truse: ["bukse", "sko"],
    bukse: ["sko", "belte"],
    sko: [],
    sokker: ["sko"],
  },
};

let calls = 0;

function sample() {
  const adj = {};
  for (const u of Object.keys(FIRST.adj)) adj[u] = shuffle(FIRST.adj[u]);
  return { V: shuffle(FIRST.V), adj };
}

const LIST_W = 64;
const ARC_W = 34;

export default {
  // The first run is the lecture's order; after that, the same graph with the
  // main loop and the adjacency lists in random order.
  defaultData() {
    if (calls++ === 0) return FIRST;
    return sample();
  },

  run(input) {
    const { V, adj } = input;
    const graph = {
      nodes: NODES,
      edges: V.flatMap((u) => adj[u].map((v) => ({ from: u, to: v }))),
    };
    const color = Object.fromEntries(V.map((u) => [u, "white"]));
    const d = {};
    const f = {};
    const seen = {}; // "u>v" → "tree" | "other"
    const order = [];
    let time = 0;
    const frames = [];
    const snap = (line, desc, vars, extra = {}) =>
      frames.push({
        line, desc, vars, graph, adj,
        color: { ...color }, d: { ...d }, f: { ...f }, seen: { ...seen }, order: [...order], ...extra,
      });

    snap([4, 5], "Alle nodene er hvite, og lista order er tom.", {});

    const visit = (u, fromLoop) => {
      time += 1;
      d[u] = time;
      color[u] = "gray";
      snap(
        fromLoop ? [15, 16, 17, 8] : 8,
        fromLoop
          ? `Hovedløkka: ${u} er hvit, så visit(${u}). ${u} blir grå.`
          : `visit(${u}): ${u} blir grå.`,
        { u },
        { cur: u },
      );
      for (const v of adj[u]) {
        const key = `${u}>${v}`;
        if (color[v] === "white") {
          seen[key] = "tree";
          snap([9, 10, 11], `Kanten (${u}, ${v}): ${v} er hvit, så visit(${v}).`, { u, v }, { cur: u, edge: key });
          visit(v, false);
        } else {
          seen[key] = "other";
          snap(
            [9, 10],
            `Kanten (${u}, ${v}): ${v} er svart og står alt i lista. ${u} kommer til å havne foran den.`,
            { u, v },
            { cur: u, edge: key },
          );
        }
      }
      time += 1;
      f[u] = time;
      color[u] = "black";
      order.unshift(u);
      const outs = adj[u].length;
      snap(
        [12, 13],
        outs === 0
          ? `${u} har ingen kanter ut. ${u} blir svart med sluttid ${time} og settes først i lista.`
          : `Alle naboene til ${u} er ferdige. ${u} blir svart med sluttid ${time} og settes først i lista, så ${outs === 1 ? "kanten ut av den peker" : `de ${outs} kantene ut av den peker`} nedover.`,
        { u },
        { cur: u, inserted: u },
      );
    };

    let skipped = [];
    const flush = () => {
      if (!skipped.length) return;
      const list = skipped.length === 1 ? `${skipped[0]} er` : `${skipped.slice(0, -1).join(", ")} og ${skipped.at(-1)} er`;
      snap([15, 16], `Hovedløkka: ${list} svart, og hoppes over.`, {});
      skipped = [];
    };
    for (const u of V) {
      if (color[u] === "white") {
        flush();
        visit(u, true);
      } else {
        skipped.push(u);
      }
    }
    flush();
    snap(18, "Lista er en topologisk sortering, ordnet etter synkende sluttid: alle kantene peker nedover.", {}, { done: true });
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
    const hw = 31;
    const hh = 17;
    const shape = { hw, hh };
    const listX = w - LIST_W - ARC_W;
    const gw = listX - 14;
    const pos = place(graph.nodes, { x: 0, y: 0, w: gw, h }, { l: hw + 6, r: hw + 6, t: hh + 6, b: hh + 6 });

    const nodeStyle = (nd) => ({
      st: NODE[frame.color[nd.id]],
      ring: frame.cur === nd.id,
      sub: frame.d[nd.id] == null ? "" : `${frame.d[nd.id]}/${frame.f[nd.id] ?? ""}`,
    });
    const edgeStyle = (e) => {
      const key = `${e.from}>${e.to}`;
      if (frame.edge === key) return { st: EDGE.cur };
      const k = frame.seen[key];
      if (!k) return { st: EDGE.plain };
      return { st: k === "tree" ? EDGE.tree : EDGE.other };
    };
    let svg = graphSvg(graph, pos, () => shape, nodeStyle, edgeStyle);

    // The list, bottom-aligned: the first node to finish sits in the lowest
    // slot, and each new one goes in above it, at the front.
    const TOP = 18;
    const slotH = (h - TOP) / n;
    const slotY = (k) => TOP + (n - frame.order.length + k) * slotH; // k = index in order
    svg +=
      `<text x="${(listX + LIST_W / 2).toFixed(1)}" y="12" text-anchor="middle" ` +
      `style="fill:var(--muted);${FONT}">order</text>`;
    for (let i = 0; i < n; i++) {
      const y = TOP + i * slotH + 2;
      svg +=
        `<rect x="${listX}" y="${y.toFixed(1)}" width="${LIST_W}" height="${(slotH - 4).toFixed(1)}" rx="4" ` +
        `style="fill:none;stroke:var(--border)" stroke-width="1" stroke-dasharray="3 3"/>`;
    }
    const at = new Map(frame.order.map((u, k) => [u, k]));
    frame.order.forEach((u, k) => {
      const y = slotY(k) + 2;
      const st = NODE.black;
      const isNew = frame.inserted === u;
      svg +=
        `<rect x="${listX}" y="${y.toFixed(1)}" width="${LIST_W}" height="${(slotH - 4).toFixed(1)}" rx="4" ` +
        `style="fill:${st.fill};stroke:${isNew ? "var(--accent)" : st.stroke}" stroke-width="${isNew ? 2.4 : 1.2}"/>`;
      svg +=
        `<text x="${(listX + LIST_W / 2).toFixed(1)}" y="${(y + (slotH - 4) / 2 + 4).toFixed(1)}" text-anchor="middle" ` +
        `style="fill:${st.text};${FONT};font-weight:600">${esc(u)}</text>`;
    });

    // Arcs for the edges out of every listed node. They all point down.
    const xr = listX + LIST_W + 1;
    for (const u of frame.order) {
      for (const v of frame.adj[u]) {
        const a = slotY(at.get(u)) + slotH / 2;
        const b = slotY(at.get(v)) + slotH / 2;
        const span = Math.abs(at.get(v) - at.get(u));
        const bulge = Math.min(ARC_W - 3, 6 + 3.6 * span);
        const hot = frame.inserted === u;
        const col = hot ? "var(--accent)" : "var(--muted)";
        svg +=
          `<path d="M${xr} ${(a + 3).toFixed(1)} C${(xr + bulge).toFixed(1)} ${(a + 3).toFixed(1)} ` +
          `${(xr + bulge).toFixed(1)} ${(b - 3).toFixed(1)} ${(xr + 7).toFixed(1)} ${(b - 3).toFixed(1)}" ` +
          `fill="none" style="stroke:${col}" stroke-width="${hot ? 2 : 1.2}"/>`;
        svg +=
          `<polygon points="${xr},${(b - 3).toFixed(1)} ${xr + 8},${(b - 7).toFixed(1)} ${xr + 8},${(b + 1).toFixed(1)}" ` +
          `style="fill:${col}"/>`;
      }
    }

    stage.innerHTML = wrapSvg(w, h, svg);
  },
};
