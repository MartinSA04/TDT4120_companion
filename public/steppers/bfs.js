/**
 * BFS and Print-Path, for <Stepper>, driving the block `bfs-kode` in modul 09
 * «Traversering av grafer». The one idea: the FIFO queue holds the nodes at
 * distance k ahead of those at k + 1, so BFS finishes one distance before it
 * starts the next, and the first edge that reaches a node comes from a node
 * one step closer to s. Print-Path then follows π back from v to s.
 *
 * Block line numbers count the header as line 1. BFS's line k is block line
 * k + 1, block line 20 is empty, Print-Path's header is block line 21 and its
 * line k is block line k + 21:
 *    1 BFS(G, s)                          21 Print-Path(G, s, v)
 *    2 1  for each vertex u ∈ G.V − {s}   22 1  if v == s
 *   …                                     23 2      print s
 *   11 10 while Q ≠ ∅                     24 3  elseif v.π == nil
 *   12 11     u = Dequeue(Q)              25 4      print "no path from" s "to" v
 *   13 12     for each vertex v ∈ G.Adj[u]  26 5  else Print-Path(G, s, v.π)
 *   14 13         if v.color == white     27 6      print v
 *   15–18 14–17   gray, d, π, Enqueue
 *   19 18     u.color = black
 *
 * Frames: the start [2–10]; per Dequeue [11, 12]; per edge (u, v) [13, 14]
 * when v is not white and [13–18] when it is; u turning black [19]; the empty
 * queue [11]. Then Print-Path(G, s, t) for t = the node farthest from s (the
 * highest id among ties): one frame per call on the way down [22, 24, 26] and
 * one per print on the way back [23] or [27].
 *
 * The first graph is the lecture's (lecture 8, slides 754–944; _graf.js
 * FORELESNING, laid on its side), from s = 1. Queue order 1 2 3 4 7 5 8 6;
 * d = 1:0 2:1 3:2 4:2 5:3 6:4 7:3 8:4 9:∞; π = 2←1 3←2 4←2 5←3 6←5 7←3 8←7.
 * Print-Path(G, 1, 8) prints 1 2 3 7 8, as in the lecture. Later graphs (the
 * shuffle button): random edges on the same nine places, from s = 1, drawn
 * again until 1 reaches at least six nodes.
 *
 * Drawing (_graf.js): node fill = colour (empty, half, full); u ringed in the
 * accent; v.d stamped beside each node (∞ until it is found); tree edges with
 * a band; the edge looked at in the accent. Under the graph: the queue Q as a
 * row of cells, head on the left, and during Print-Path the printed nodes.
 */
import { EDGE, FONT, FORELESNING, NODE, candidates, cellsSvg, esc, graphSvg, place, randomGraph, stamp, stampSides, wrapSvg } from "./_graf.js";
import { firstView } from "./_dp.js";

const view = firstView(import.meta.url);
const PAIRS = candidates(FORELESNING.nodes, 0.45, 2.3);
const R = 14;
const SHAPE = { r: R };

export default {
  defaultData() {
    if (view.isFirst()) return FORELESNING;
    // Random edges on the same places, drawn again until 1 reaches at least six of the nine nodes.
    for (;;) {
      const g = randomGraph(FORELESNING.nodes, PAIRS, { one: 0.38, both: 0.05, min: 11, max: 15 });
      const seen = new Set([1]);
      const todo = [1];
      while (todo.length) {
        const u = todo.pop();
        for (const e of g.edges) if (e.from === u && !seen.has(e.to)) seen.add(e.to), todo.push(e.to);
      }
      if (seen.size >= 6) return g;
    }
  },

  run(graph) {
    const s = 1;
    const ids = graph.nodes.map((n) => n.id).sort((a, b) => a - b);
    const adj = new Map(ids.map((u) => [u, []]));
    for (const e of graph.edges) adj.get(e.from).push(e.to);
    const color = Object.fromEntries(ids.map((u) => [u, "white"]));
    const d = Object.fromEntries(ids.map((u) => [u, Infinity]));
    const pi = {};
    const tree = new Set();
    let Q = [];
    const frames = [];
    const V = { u: "–", v: "–" };
    const snap = (line, desc, extra = {}) =>
      frames.push({
        line,
        desc,
        vars: { ...V },
        act: { graph, s, color: { ...color }, d: { ...d }, tree: [...tree], Q: [...Q], ...extra },
      });
    const og = (xs) => (xs.length < 2 ? xs.join("") : `${xs.slice(0, -1).join(", ")} og ${xs.at(-1)}`);
    const dd = (x) => (x === Infinity ? "∞" : x);

    color[s] = "gray";
    d[s] = 0;
    Q.push(s);
    snap([2, 3, 4, 5, 6, 7, 8, 9, 10], `Alle nodene unntatt ${s} er hvite med d = ∞. ${s} er grå, ${s}.d = 0, og ${s} er den eneste noden i køen.`);
    while (Q.length) {
      const u = Q.shift();
      V.u = u;
      V.v = "–";
      snap([11, 12, 13], `u = Dequeue(Q) = ${u}, med ${u}.d = ${d[u]}. ` + (adj.get(u).length ? `Naboene til ${u} er ${og(adj.get(u))}.` : `${u} har ingen naboer.`), { u });
      for (const v of adj.get(u)) {
        V.v = v;
        const k = `${u}>${v}`;
        if (color[v] === "white") {
          color[v] = "gray";
          d[v] = d[u] + 1;
          pi[v] = u;
          tree.add(k);
          Q.push(v);
          snap(
            [13, 14, 15, 16, 17, 18],
            `${v} er hvit: ${v} blir grå, ${v}.d = ${u}.d + 1 = ${d[v]}, ${v}.π = ${u}, og ${v} settes inn bakerst i køen.`,
            { u, cur: k },
          );
        } else {
          snap([13, 14], `${v} er ${color[v] === "gray" ? "grå" : "svart"}, så den er funnet før, og ${v}.d = ${d[v]} står.`, { u, cur: k });
        }
      }
      color[u] = "black";
      V.v = "–";
      snap(19, `Alle naboene til ${u} er sett, og ${u} blir svart.`, { u });
    }
    V.u = "–";
    const lost = ids.filter((x) => d[x] === Infinity);
    snap(
      11,
      "Køen er tom, og BFS er ferdig. " +
        (lost.length
          ? `${og(lost)} ${lost.length === 1 ? "er" : "er alle"} fortsatt hvit${lost.length === 1 ? "" : "e"} med d = ∞: ingen sti fra ${s} når ${lost.length === 1 ? "den" : "dem"}.`
          : `Alle nodene kan nås fra ${s}.`),
    );

    // Print-Path to the farthest node.
    const far = ids.filter((x) => d[x] !== Infinity).reduce((a, b) => (d[b] >= d[a] ? b : a), s);
    const path = [];
    for (let v = far; v != null; v = pi[v]) path.unshift(v);
    const printed = [];
    const onPath = new Set(path);
    const pe = new Set(path.slice(1).map((v, i) => `${path[i]}>${v}`));
    const calls = [];
    for (let i = path.length - 1; i >= 0; i--) {
      const v = path[i];
      calls.push(v);
      V.u = "–";
      V.v = v;
      if (v === s) {
        printed.push(s);
        snap([22, 23], `Print-Path(G, ${s}, ${s}): v = s, så ${s} skrives ut.`, { pv: v, calls: [...calls], printed: [...printed], pe: [...pe], onPath: [...onPath] });
      } else {
        snap([22, 24, 26], `Print-Path(G, ${s}, ${v}): ${v} ≠ ${s} og ${v}.π = ${pi[v]}, så stien til ${pi[v]} skrives ut først.`, {
          pv: v,
          calls: [...calls],
          printed: [...printed],
          pe: [...pe],
          onPath: [...onPath],
        });
      }
    }
    for (let i = 1; i < path.length; i++) {
      const v = path[i];
      printed.push(v);
      calls.pop();
      V.v = v;
      snap(27, `Kallet for ${path[i - 1]} er ferdig, og Print-Path(G, ${s}, ${v}) skriver ut ${v}.` + (i === path.length - 1 ? ` Stien har ${d[v]} ${d[v] === 1 ? "kant" : "kanter"}, like mange som ${v}.d.` : ""), {
        pv: v,
        calls: [...calls],
        printed: [...printed],
        pe: [...pe],
        onPath: [...onPath],
      });
    }
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
    const rowH = 54;
    const pos = place(g.nodes, { x: 0, y: 0, w, h: h - rowH }, { l: R + 6, r: R + 6, t: R + 22, b: R + 22 });
    const tree = new Set(a.tree);
    const pe = new Set(a.pe ?? []);
    const nodeStyle = (n) => ({ st: NODE[a.color[n.id]], ring: (a.u === n.id && a.pv == null) || a.pv === n.id });
    const edgeStyle = (e) => {
      const k = `${e.from}>${e.to}`;
      if (k === a.cur) return { st: EDGE.cur };
      if (pe.has(k)) return { st: { ...EDGE.tree, stroke: "var(--accent)" } };
      if (tree.has(k)) return { st: EDGE.tree };
      return { st: EDGE.plain };
    };
    let svg = graphSvg(g, pos, () => SHAPE, nodeStyle, edgeStyle);
    const sides = stampSides(g, pos, () => SHAPE, () => 1, () => ["n", "s", "e", "w"], { w, h: h - rowH });
    for (const n of g.nodes) {
      const x = a.d[n.id];
      svg += stamp(pos.get(n.id), SHAPE, sides.get(n.id), x === Infinity ? "∞" : String(x), x === Infinity ? "var(--muted)" : "var(--fg)");
    }
    // The queue, or the printed path.
    const y = h - rowH + 14;
    const cellW = Math.min(30, (w - 40) / 9);
    if (a.printed) {
      svg += `<text x="0" y="${y + 18}" style="fill:var(--muted);${FONT}">ut</text>`;
      svg += cellsSvg(28, y, cellW, 26, a.printed.map(String), () => ({ fill: "var(--bg)", stroke: "var(--accent)", text: "var(--fg)" }));
    } else {
      svg += `<text x="0" y="${y + 18}" style="fill:var(--muted);${FONT}">Q</text>`;
      if (a.Q.length) {
        svg += cellsSvg(28, y, cellW, 26, a.Q.map(String), (i) => ({ fill: NODE.gray.fill, stroke: NODE.gray.stroke, text: NODE.gray.text }));
      } else {
        svg += `<text x="28" y="${y + 18}" style="fill:var(--muted);${FONT}">tom</text>`;
      }
    }
    stage.innerHTML = wrapSvg(w, h, svg);
    stage.setAttribute(
      "aria-label",
      `Avstandene: ${g.nodes.map((n) => `${n.id}: ${a.d[n.id] === Infinity ? "uendelig" : a.d[n.id]}`).join(", ")}. ` +
        (a.printed ? `Skrevet ut: ${a.printed.join(" ") || "ingenting ennå"}.` : `Køen: ${a.Q.join(", ") || "tom"}.`),
    );
  },
};
