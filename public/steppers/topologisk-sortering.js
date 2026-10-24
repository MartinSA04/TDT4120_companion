/**
 * Topological-Sort, for <Stepper>, driving the block `topsort-kode` in modul
 * 09 «Traversering av grafer». The one idea: when DFS finishes a node, every
 * node it has an edge to is already finished, so putting each finished node at
 * the front of a list leaves every edge pointing down the list.
 *
 * Block lines (header = line 1):
 *   1 Topological-Sort(G)
 *   2 1  call DFS(G) to compute finish times v.f for each vertex v
 *   3 2  as each vertex is finished, insert it onto the front of a linked list
 *   4 3  return the linked list of vertices
 *
 * Frames: the start [2]; per node the main loop starts a call from [2]; per
 * discovery [2]; per edge (u, v) [2] (v white: the call goes on; v black: v
 * is already in the list); per finish [3], with the node put at the front of
 * the list; the end [4], with the edges drawn as arcs beside the list.
 *
 * The first instance is the lecture's and the textbook's (CLRS 4th ed. fig.
 * 20.7; lecture 8 slides 526–544): truse→bukse, truse→sko, bukse→sko,
 * bukse→belte, belte→jakke, skjorte→belte, skjorte→slips, slips→jakke,
 * sokker→sko, and klokke alone. Main loop skjorte, slips, jakke, belte,
 * klokke, truse, bukse, sko, sokker gives the lecture's times (skjorte 1/8,
 * slips 2/5, jakke 3/4, belte 6/7, klokke 9/10, truse 11/16, bukse 12/15,
 * sko 13/14, sokker 17/18) and the list sokker, truse, bukse, sko, klokke,
 * skjorte, belte, slips, jakke. Later instances (the shuffle button): the same
 * garments and edges, with the main loop and every adjacency list in random
 * order, which gives another valid order.
 *
 * Drawing (_graf.js): the garments as boxes in the lecture's two columns,
 * each with d/f under its name; box fill = colour; the running call ringed in
 * the accent; tree edges with a band, the edge looked at accent. To the right,
 * the list, front at the top; the node just put in is accent. At the end the
 * edges are drawn as arcs on the list's right side, all pointing down.
 */
import { EDGE, FONT, NODE, esc, graphSvg, place, shuffle, wrapSvg } from "./_graf.js";
import { firstView } from "./_dp.js";

const view = firstView(import.meta.url);

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
const EDGES = [
  ["skjorte", "slips"], ["skjorte", "belte"], ["slips", "jakke"], ["belte", "jakke"],
  ["truse", "bukse"], ["truse", "sko"], ["bukse", "sko"], ["bukse", "belte"], ["sokker", "sko"],
];
const LECTURE_LOOP = ["skjorte", "slips", "jakke", "belte", "klokke", "truse", "bukse", "sko", "sokker"];

export default {
  defaultData() {
    if (view.isFirst()) return { loop: LECTURE_LOOP, edges: EDGES };
    return { loop: shuffle(LECTURE_LOOP), edges: shuffle(EDGES) };
  },

  run({ loop, edges }) {
    const graph = { nodes: NODES, edges: edges.map(([from, to]) => ({ from, to })) };
    const adj = new Map(NODES.map((n) => [n.id, []]));
    for (const [a, b] of edges) adj.get(a).push(b);
    const color = Object.fromEntries(NODES.map((n) => [n.id, "white"]));
    const d = {};
    const f = {};
    const tree = new Set();
    const list = [];
    const stack = [];
    const cap = (x) => x[0].toUpperCase() + x.slice(1);
    let time = 0;
    const frames = [];
    const snap = (line, desc, extra = {}) =>
      frames.push({
        line,
        desc,
        vars: { time },
        act: { graph, color: { ...color }, d: { ...d }, f: { ...f }, tree: [...tree], list: [...list], ring: stack.at(-1) ?? null, ...extra },
      });

    snap(2, "Alle plaggene er hvite, og lista er tom.");
    const visit = (u) => {
      time += 1;
      d[u] = time;
      color[u] = "gray";
      stack.push(u);
      snap(2, `${cap(u)} oppdages: ${u}.d = ${time}.`);
      for (const v of adj.get(u)) {
        const k = `${u}>${v}`;
        if (color[v] === "white") {
          tree.add(k);
          snap(2, `Kanten (${u}, ${v}): ${v} er hvit, så DFS går videre til ${v}.`, { cur: k });
          visit(v);
        } else {
          snap(2, `Kanten (${u}, ${v}): ${v} er svart og står allerede i lista. ${cap(u)} er ikke ferdig, så ${u} havner foran ${v}.`, { cur: k });
        }
      }
      time += 1;
      f[u] = time;
      color[u] = "black";
      stack.pop();
      list.unshift(u);
      snap(3, `${cap(u)} er ferdig: ${u}.f = ${time}, og ${u} settes inn først i lista.`, { fresh: u });
    };
    for (const u of loop) {
      if (color[u] !== "white") continue;
      snap(2, `Hovedløkka i DFS finner ${u} hvit og starter et nytt kall der.`, { loop: u });
      visit(u);
    }
    snap(4, `Lista er ${list.join(", ")}. Hver kant går fra et plagg til et plagg lenger ned i lista.`, { end: true });
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
    const listW = Math.max(76, Math.min(110, w * 0.3));
    const arcW = 34;
    const hw = Math.max(34, Math.min(46, (w - listW - arcW) / 5.2));
    const hh = 17;
    const SH = { hw, hh };
    const gw = w - listW - arcW - 10;
    const pos = place(g.nodes, { x: 0, y: 0, w: gw, h }, { l: hw + 6, r: hw + 6, t: hh + 6, b: hh + 6 });
    const tree = new Set(a.tree);
    const nodeStyle = (n) => ({
      st: NODE[a.color[n.id]],
      ring: a.ring === n.id || a.loop === n.id,
      sub: a.d[n.id] != null ? `${a.d[n.id]}/${a.f[n.id] ?? ""}` : "",
    });
    const edgeStyle = (e) => {
      const k = `${e.from}>${e.to}`;
      if (k === a.cur) return { st: EDGE.cur };
      if (tree.has(k)) return { st: EDGE.tree };
      return { st: EDGE.plain };
    };
    let svg = graphSvg(g, pos, () => SH, nodeStyle, edgeStyle);

    // The list, front at the top.
    const lx = w - arcW - listW;
    const rowH = Math.min(30, (h - 22) / 9);
    svg += `<text x="${(lx + listW / 2).toFixed(1)}" y="13" text-anchor="middle" style="fill:var(--muted);${FONT}">lista</text>`;
    const at = new Map();
    a.list.forEach((u, i) => {
      const y = 20 + i * rowH;
      at.set(u, y + (rowH - 4) / 2);
      const fresh = a.fresh === u;
      svg +=
        `<rect x="${lx.toFixed(1)}" y="${y.toFixed(1)}" width="${listW.toFixed(1)}" height="${(rowH - 4).toFixed(1)}" rx="4" ` +
        `style="fill:var(--bg);stroke:${fresh ? "var(--accent)" : "var(--border)"}" stroke-width="${fresh ? 2 : 1.2}"/>` +
        `<text x="${(lx + listW / 2).toFixed(1)}" y="${(y + (rowH - 4) / 2 + 4).toFixed(1)}" text-anchor="middle" ` +
        `style="fill:var(--fg);${FONT}">${esc(u)}</text>`;
    });
    if (a.end) {
      // Every edge as an arc on the right of the list, from the higher row down to the lower. A
      // longer arc bulges further out, so the arcs nest instead of bundling.
      const x0 = lx + listW;
      const rowOf = new Map(a.list.map((u, i) => [u, i]));
      for (const e of g.edges) {
        const y1 = at.get(e.from);
        const y2 = at.get(e.to);
        const span = Math.abs(rowOf.get(e.to) - rowOf.get(e.from));
        const bulge = Math.min(arcW - 2, 3 + span * 3.6);
        svg +=
          `<path d="M${x0.toFixed(1)} ${y1.toFixed(1)} C${(x0 + bulge * 1.33).toFixed(1)} ${y1.toFixed(1)} ${(x0 + bulge * 1.33).toFixed(1)} ${y2.toFixed(1)} ${(x0 + 3).toFixed(1)} ${y2.toFixed(1)}" ` +
          `style="fill:none;stroke:var(--muted)" stroke-width="1.2"/>` +
          `<polygon points="${(x0 + 1).toFixed(1)},${y2.toFixed(1)} ${(x0 + 7).toFixed(1)},${(y2 - 3.5).toFixed(1)} ${(x0 + 7).toFixed(1)},${(y2 + 3.5).toFixed(1)}" style="fill:var(--muted)"/>`;
      }
    }
    stage.innerHTML = wrapSvg(w, h, svg);
    stage.setAttribute("aria-label", `Lista: ${a.list.join(", ") || "tom"}.`);
  },
};
