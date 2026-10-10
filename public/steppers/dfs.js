/**
 * DFS trace for <Stepper>, driving the Python block `dfs` in modul 08. The
 * stage has the graph on top and the time axis underneath. In the graph each
 * node gets its colour (white, gray, black), its start and finish time as
 * "d/f", and each edge its class once DFS has examined it: tree edges get a
 * band, the others a letter, B (bakoverkant), F (foroverkant) or
 * K (krysskant). Under the graph every discovered node is a bar from u.d to
 * u.f, one row per depth in the depth-first forest, so the gray (open) bars
 * are the call stack and the nesting is the parenthesis theorem.
 *
 * Line numbers refer to that <CodeBlock>:
 *    1 def dfs(G):
 *    2     color = {u: "white" for u in G}
 *    3     pi = {u: None for u in G}
 *    4     d, f = {}, {}
 *    5     time = 0
 *    6
 *    7     def dfs_visit(u):
 *    8         nonlocal time
 *    9         time += 1
 *   10         d[u] = time
 *   11         color[u] = "gray"
 *   12         for v in G[u]:
 *   13             if color[v] == "white":
 *   14                 pi[v] = u
 *   15                 dfs_visit(v)
 *   16         time += 1
 *   17         f[u] = time
 *   18         color[u] = "black"
 *   19
 *   20     for u in G:
 *   21         if color[u] == "white":
 *   22             dfs_visit(u)
 *   23     return d, f, pi
 *
 * Colours are framework tokens only, so frames re-theme on the light/dark
 * toggle without the module knowing which theme is active.
 */

import {
  EDGE, FONT, FORELESNING, NODE, adjacency, candidates, esc, graphSvg, place, randomGraph, stamp,
  stampSides, wrapSvg,
} from "./_graf.js";

const FIRST = FORELESNING;
const PAIRS = candidates(FIRST.nodes, 0.6, 3.1);

let calls = 0;

const BADGE = { back: "B", fwd: "F", cross: "K" };

export default {
  // The first graph is the lecture's; after that, random graphs on the same nodes.
  defaultData() {
    if (calls++ === 0) return FIRST;
    return randomGraph(FIRST.nodes, PAIRS, { one: 0.42, both: 0.06 });
  },

  run(graph) {
    const adj = adjacency(graph);
    const ids = graph.nodes.map((n) => n.id);
    const color = Object.fromEntries(ids.map((u) => [u, "white"]));
    const pi = Object.fromEntries(ids.map((u) => [u, null]));
    const d = {};
    const f = {};
    const depth = {};
    const kind = {}; // "u>v" → class
    const stack = [];
    let time = 0;
    const frames = [];
    const snap = (line, desc, vars, extra = {}) =>
      frames.push({
        line, desc, vars, graph,
        color: { ...color }, d: { ...d }, f: { ...f }, depth: { ...depth },
        kind: { ...kind }, time, stack: [...stack], ...extra,
      });

    snap([2, 3, 4, 5], "Alle nodene er hvite, ingen har forgjenger, og time = 0.", { time });

    const visit = (u, dep) => {
      time += 1;
      d[u] = time;
      color[u] = "gray";
      depth[u] = dep;
      stack.push(u);
      snap(
        [9, 10, 11],
        `DFS-Visit(${u}): time = ${time}, så ${u}.d = ${time}, og ${u} blir grå.`,
        { u, time },
        { cur: u },
      );
      for (const v of adj.get(u)) {
        const key = `${u}>${v}`;
        if (color[v] === "white") {
          kind[key] = "tree";
          pi[v] = u;
          snap(
            [12, 13, 14, 15],
            `Kanten (${u}, ${v}): ${v} er hvit, så den er en tre-kant. ${v}.π = ${u}, og DFS går videre fra ${v}.`,
            { u, v, time },
            { cur: u, edge: key },
          );
          visit(v, dep + 1);
        } else {
          let k;
          let why;
          if (color[v] === "gray") {
            k = "back";
            why = `${v} er grå, altså en forfader til ${u} som ikke er ferdig. Det er en bakoverkant, og grafen har en sykel.`;
          } else if (d[u] < d[v]) {
            k = "fwd";
            why = `${v} er svart, og ${v}.d = ${d[v]} > ${u}.d = ${d[u]}: ${v} er en etterkommer av ${u}, så det er en foroverkant.`;
          } else {
            k = "cross";
            why = `${v} er svart, og ${v}.d = ${d[v]} < ${u}.d = ${d[u]}: ${v} ble ferdig før ${u} ble oppdaget, så det er en krysskant.`;
          }
          kind[key] = k;
          snap([12, 13], `Kanten (${u}, ${v}): ${why}`, { u, v, time }, { cur: u, edge: key });
        }
      }
      time += 1;
      f[u] = time;
      color[u] = "black";
      stack.pop();
      snap(
        [16, 17, 18],
        `Alle naboene til ${u} er sett. time = ${time}, så ${u}.f = ${time}, og ${u} blir svart.`,
        { u, time },
        { cur: u },
      );
    };

    let skipped = [];
    const flushSkipped = () => {
      if (!skipped.length) return;
      const list = skipped.length === 1 ? `${skipped[0]} er` : `${skipped.slice(0, -1).join(", ")} og ${skipped.at(-1)} er`;
      snap([20, 21], `Hovedløkka: ${list} ikke hvit, og hoppes over.`, { time });
      skipped = [];
    };
    for (const u of ids) {
      if (color[u] === "white") {
        flushSkipped();
        snap(
          [20, 21, 22],
          frames.length === 1
            ? `Hovedløkka tar nodene i rekkefølge. ${u} er hvit, så DFS-Visit(${u}).`
            : `Hovedløkka: ${u} er hvit, så DFS-Visit(${u}) starter et nytt dybde-først-tre.`,
          { u, time },
          { cur: u },
        );
        visit(u, 0);
      } else {
        skipped.push(u);
      }
    }
    flushSkipped();

    const roots = ids.filter((u) => pi[u] === null);
    snap(
      23,
      roots.length === 1
        ? `Ferdig. Tre-kantene utgjør ett dybde-først-tre med rot ${roots[0]}, og hver av de ${ids.length} nodene har fått en start- og en sluttid.`
        : `Ferdig. Tre-kantene utgjør en dybde-først-skog med ${roots.length} trær, med røttene ${roots.join(", ")}.`,
      { time },
    );
    // Rows for the bars and the width of every stamp, fixed for the whole trace.
    const maxDepth = Math.max(...Object.values(depth));
    const width = Object.fromEntries(ids.map((u) => [u, `${d[u]}/${f[u]}`.length]));
    for (const fr of frames) {
      fr.rows = maxDepth + 1;
      fr.width = width;
    }
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
    const T = 2 * n;

    // Time axis under the graph: one row per depth, plus tick labels.
    const ROW = Math.min(15, Math.max(11, (h * 0.34) / (frame.rows + 1)));
    const AXIS = 18;
    const barsH = frame.rows * ROW + AXIS;
    const graphH = h - barsH - 10;
    const r = Math.max(10, Math.min(14, w / 30));
    const shape = { r };
    const pos = place(graph.nodes, { x: 0, y: 0, w, h: graphH }, { l: r + 40, r: r + 16, t: r + 18, b: r + 18 });

    const nodeStyle = (nd) => ({ st: NODE[frame.color[nd.id]], ring: frame.cur === nd.id });
    const edgeStyle = (e) => {
      const key = `${e.from}>${e.to}`;
      if (frame.edge === key) return { st: EDGE.cur };
      const k = frame.kind[key];
      if (!k) return { st: EDGE.plain };
      if (k === "tree") return { st: EDGE.tree };
      return { st: EDGE.other, badge: BADGE[k] };
    };
    let svg = graphSvg(graph, pos, () => shape, nodeStyle, edgeStyle);

    // d/f stamps, each on a side of its node that no edge crosses. The sides
    // depend only on the graph, so a stamp never jumps during the trace.
    const maxGy = Math.max(...graph.nodes.map((nd) => nd.gy));
    const sides = stampSides(
      graph, pos, () => shape, (nd) => frame.width[nd.id],
      (nd) => (nd.gy === 0 ? ["n", "w", "e", "s"] : nd.gy === maxGy ? ["s", "w", "e", "n"] : ["w", "e", "n", "s"]),
      { w, h: graphH + 8 },
    );
    for (const nd of graph.nodes) {
      const u = nd.id;
      if (frame.d[u] == null) continue;
      const text = `${frame.d[u]}/${frame.f[u] ?? ""}`;
      svg += stamp(pos.get(u), shape, sides.get(u), text, "var(--muted)");
    }

    // Bars: [d, f] for finished nodes (black), [d, time] for open ones (gray).
    const x0 = 14;
    const x1 = w - 14;
    const xt = (t) => x0 + ((t - 0.5) / T) * (x1 - x0);
    const top = graphH + 10;
    const axisY = top + frame.rows * ROW + 2;
    svg += `<line x1="${x0}" y1="${axisY}" x2="${x1}" y2="${axisY}" style="stroke:var(--border)" stroke-width="1"/>`;
    const every = (x1 - x0) / T >= 16 ? 1 : 2;
    for (let t = 1; t <= T; t++) {
      const x = xt(t);
      const on = t <= frame.time;
      svg += `<line x1="${x.toFixed(1)}" y1="${axisY}" x2="${x.toFixed(1)}" y2="${axisY + 3}" style="stroke:var(--border)" stroke-width="1"/>`;
      if (t % every === 0 || every === 1) {
        svg +=
          `<text x="${x.toFixed(1)}" y="${axisY + 14}" text-anchor="middle" ` +
          `style="fill:${on ? "var(--muted)" : "var(--faint)"};${FONT}">${t}</text>`;
      }
    }
    for (const nd of graph.nodes) {
      const u = nd.id;
      if (frame.d[u] == null) continue;
      const open = frame.f[u] == null;
      const a = xt(frame.d[u]) - 5;
      const b = open ? Math.max(xt(frame.time) + 5, a + 12) : xt(frame.f[u]) + 5;
      const y = top + frame.depth[u] * ROW + 1;
      const st = open ? NODE.gray : NODE.black;
      svg +=
        `<rect x="${a.toFixed(1)}" y="${y.toFixed(1)}" width="${(b - a).toFixed(1)}" height="${(ROW - 2).toFixed(1)}" rx="3" ` +
        `style="fill:${st.fill};stroke:${frame.cur === u ? "var(--accent)" : st.stroke}" stroke-width="${frame.cur === u ? 2 : 1}"` +
        `${open ? ' stroke-dasharray="3 2"' : ""}/>`;
      svg +=
        `<text x="${((a + b) / 2).toFixed(1)}" y="${(y + ROW / 2 + 2.5).toFixed(1)}" text-anchor="middle" ` +
        `style="fill:${st.text};${FONT};font-weight:600">${esc(u)}</text>`;
    }

    stage.innerHTML = wrapSvg(w, h, svg);
  },
};
