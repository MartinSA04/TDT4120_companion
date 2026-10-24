/**
 * DFS and DFS-Visit, for <Stepper>, driving the block `dfs-kode` in modul 09
 * «Traversering av grafer». The one idea: DFS-Visit is a recursive traversal
 * with colours, and the two clocks it keeps (d when a node turns gray, f when
 * it turns black) nest like parentheses, because a call that starts inside
 * another call also ends inside it.
 *
 * Block line numbers count the header as line 1. DFS's line k is block line
 * k + 1, block line 9 is empty, DFS-Visit's header is block line 10 and its
 * line k is block line k + 10:
 *    1 DFS(G)                         10 DFS-Visit(G, u)
 *    2 1  for each vertex u ∈ G.V     11 1  time = time + 1
 *    3 2      u.color = white         12 2  u.d = time
 *    4 3      u.π = nil               13 3  u.color = gray
 *    5 4  time = 0                    14 4  for each vertex v ∈ G.Adj[u]
 *    6 5  for each vertex u ∈ G.V     15 5      if v.color == white
 *    7 6      if u.color == white     16 6          v.π = u
 *    8 7          DFS-Visit(G, u)     17 7          DFS-Visit(G, v)
 *                                     18 8  time = time + 1
 *                                     19 9  u.f = time
 *                                     20 10 u.color = black
 *
 * Frames: the start [2–5]; per node of the main loop [6, 7] (and [8] when it
 * calls); per call the discovery [11–13]; per edge (u, v) one frame, [14, 15]
 * when v is not white and [14–17] when it is; per call the finish [18–20].
 * Nodes the main loop passes over after the last call share one frame.
 *
 * The first graph is the lecture's example for edge classification (lecture
 * 8, slides 97–106), the graph of figures 1 and 2: 1→3; 2→1, 2→4; 3→5, 3→4,
 * 3→6; 4→1, 4→6; 5→6. Times 1 1/10, 3 2/9, 5 3/6, 6 4/5, 4 7/8, 2 11/12, and
 * the parenthesis row reads (1 (3 (5 (6 6) 5) (4 4) 3) 1) (2 2). Later graphs
 * (the shuffle button): six nodes on the same places, 8–11 random edges in
 * random list order.
 *
 * Drawing (_graf.js): node fill = the algorithm's colour (empty, half, full),
 * the running call ringed in the accent, d/f beside every node. A tree edge
 * has a band, an edge DFS has looked at that is not a tree edge is dashed, and
 * the edge being looked at is accent. Under the graph: the time row, one place
 * per time step with «(u» at u.d and «u)» at u.f; the place time points at is
 * accent. No edge letters (figure 2 has them).
 */
import { EDGE, FONT, NODE, esc, graphSvg, place, shuffle, stampSides, wrapSvg } from "./_graf.js";
import { firstView } from "./_dp.js";

const view = firstView(import.meta.url);

const PLACES = [
  { id: 1, gx: 0, gy: 0 },
  { id: 2, gx: 1, gy: 0 },
  { id: 3, gx: 0, gy: 1 },
  { id: 4, gx: 1, gy: 1 },
  { id: 5, gx: 0, gy: 2 },
  { id: 6, gx: 1, gy: 2 },
];

export const FORELESNING = {
  nodes: PLACES,
  edges: [
    [1, 3], [2, 1], [2, 4], [3, 5], [3, 4], [3, 6], [4, 1], [4, 6], [5, 6],
  ].map(([from, to]) => ({ from, to })),
};

/** Six nodes, each grid edge one way, the other way or both, and at most one diagonal per square. */
function randomGraph() {
  const sides = [[1, 2], [3, 4], [5, 6], [1, 3], [3, 5], [2, 4], [4, 6]];
  const squares = [[[1, 4], [2, 3]], [[3, 6], [4, 5]]];
  for (;;) {
    const pairs = [...sides];
    for (const sq of squares) {
      const r = Math.random();
      if (r < 0.4) pairs.push(sq[0]);
      else if (r < 0.8) pairs.push(sq[1]);
    }
    const edges = [];
    for (const [a, b] of pairs) {
      const r = Math.random();
      if (r < 0.42) edges.push({ from: a, to: b });
      else if (r < 0.84) edges.push({ from: b, to: a });
      else if (r < 0.92) edges.push({ from: a, to: b }, { from: b, to: a });
    }
    if (edges.length >= 8 && edges.length <= 11) return { nodes: PLACES, edges: shuffle(edges) };
  }
}

const R = 15;
const SHAPE = { r: R };

export default {
  defaultData() {
    return view.isFirst() ? FORELESNING : randomGraph();
  },

  run(graph) {
    const ids = graph.nodes.map((n) => n.id).sort((a, b) => a - b);
    const adj = new Map(ids.map((u) => [u, []]));
    for (const e of graph.edges) adj.get(e.from).push(e.to);
    const color = Object.fromEntries(ids.map((u) => [u, "white"]));
    const d = {};
    const f = {};
    const pi = {};
    const tree = new Set();
    const seen = new Set();
    const stack = [];
    const marks = [];
    let time = 0;
    const frames = [];
    const V = { u: "–", v: "–", time: 0 };
    const key = (u, v) => `${u}>${v}`;
    const snap = (line, desc, extra = {}) =>
      frames.push({
        line,
        desc,
        vars: { ...V },
        act: {
          graph,
          color: { ...color },
          d: { ...d },
          f: { ...f },
          tree: [...tree],
          seen: [...seen],
          marks: [...marks],
          time,
          ring: stack.at(-1) ?? null,
          ...extra,
        },
      });
    const og = (xs) => (xs.length < 2 ? xs.join("") : `${xs.slice(0, -1).join(", ")} og ${xs.at(-1)}`);
    const ord = (k) => ["null", "ett", "to", "tre", "fire", "fem", "seks"][k] ?? String(k);

    snap([2, 3, 4, 5], "Alle nodene er hvite og har ingen forgjenger, og time = 0.");

    const visit = (u) => {
      time += 1;
      d[u] = time;
      color[u] = "gray";
      stack.push(u);
      marks.push({ t: time, s: `(${u}` });
      V.u = u;
      V.v = "–";
      V.time = time;
      snap(
        [11, 12, 13],
        `DFS-Visit(G, ${u}): time = ${time}, så ${u}.d = ${time}, og ${u} blir grå. ` +
          (adj.get(u).length ? `Naboene til ${u} er ${og(adj.get(u))}.` : `${u} har ingen naboer.`),
      );
      for (const v of adj.get(u)) {
        V.u = u;
        V.v = v;
        const k = key(u, v);
        if (color[v] === "white") {
          tree.add(k);
          seen.add(k);
          pi[v] = u;
          snap([14, 15, 16, 17], `Kanten (${u}, ${v}): ${v} er hvit, så ${v}.π = ${u}, og DFS-Visit(G, ${v}) kalles.`, { cur: k });
          visit(v);
          V.u = u;
          V.v = v;
        } else {
          seen.add(k);
          snap(
            [14, 15],
            `Kanten (${u}, ${v}): ${v} er ${color[v] === "gray" ? "grå" : "svart"}, så DFS går ikke videre dit.`,
            { cur: k },
          );
        }
      }
      time += 1;
      f[u] = time;
      color[u] = "black";
      stack.pop();
      marks.push({ t: time, s: `${u})` });
      V.u = u;
      V.v = "–";
      V.time = time;
      const back = stack.at(-1);
      snap(
        [18, 19, 20],
        `Alle naboene til ${u} er sett. time = ${time}, så ${u}.f = ${time}, og ${u} blir svart. ` +
          (back != null ? `Kallet returnerer til DFS-Visit(G, ${back}).` : "Kallet returnerer til DFS."),
        { done: u },
      );
    };

    let trees = 0;
    for (let i = 0; i < ids.length; i++) {
      const u = ids[i];
      V.u = u;
      V.v = "–";
      if (color[u] === "white") {
        trees += 1;
        snap([6, 7, 8], `Hovedløkka står på ${u}. ${u} er hvit, så DFS-Visit(G, ${u}) starter et nytt dybde-først-tre med ${u} som rot.`, {
          loop: u,
        });
        visit(u);
      } else {
        const rest = ids.slice(i);
        if (rest.every((w) => color[w] !== "white")) {
          V.u = "–";
          snap(
            [6, 7],
            `Hovedløkka går gjennom ${og(rest)}, og ${rest.length === 1 ? "den er" : "alle er"} svart${rest.length === 1 ? "" : "e"}. ` +
              `DFS er ferdig, og tre-kantene danner ${trees === 1 ? "ett tre" : `${ord(trees)} trær`}.`,
            { end: true },
          );
          break;
        }
        snap([6, 7], `Hovedløkka står på ${u}. ${u} er svart, så løkka går videre.`, { loop: u });
      }
    }
    if (frames.at(-1)?.act.end !== true) {
      V.u = "–";
      V.v = "–";
      snap([6, 7], `Hovedløkka er ferdig, og tre-kantene danner ${trees === 1 ? "ett tre" : `${ord(trees)} trær`}.`, { end: true });
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
    const box = { x: 0, y: 0, w, h: h - rowH };
    const side = Math.min(80, Math.max(66, w * 0.22));
    const pos = place(g.nodes, box, { l: side, r: side, t: R + 10, b: R + 12 });
    const tree = new Set(a.tree);
    const seen = new Set(a.seen);
    const nodeStyle = (n) => ({ st: NODE[a.color[n.id]], ring: a.ring === n.id || a.loop === n.id });
    const edgeStyle = (e) => {
      const k = `${e.from}>${e.to}`;
      if (k === a.cur) return { st: EDGE.cur };
      if (tree.has(k)) return { st: EDGE.tree };
      if (seen.has(k)) return { st: EDGE.other };
      return { st: EDGE.plain };
    };
    let svg = graphSvg(g, pos, () => SHAPE, nodeStyle, edgeStyle);

    // d/f beside each node, on the outer side of its column.
    const sides = stampSides(g, pos, () => SHAPE, () => 5.6, (n) => (n.gx === 0 ? ["w", "n", "s", "e"] : ["e", "n", "s", "w"]), { w, h: h - rowH });
    for (const n of g.nodes) {
      if (a.d[n.id] == null) continue;
      const p = pos.get(n.id);
      const t = `${a.d[n.id]}/${a.f[n.id] ?? ""}`;
      const s = sides.get(n.id);
      const r = R + 8;
      const at = { w: [p.x - r, p.y + 5, "end"], e: [p.x + r, p.y + 5, "start"], n: [p.x, p.y - r - 1, "middle"], s: [p.x, p.y + r + 11, "middle"] }[s];
      svg +=
        `<text x="${at[0].toFixed(1)}" y="${at[1].toFixed(1)}" text-anchor="${at[2]}" ` +
        `style="fill:var(--fg);${FONT};font-size:var(--text-sm)">${esc(t)}</text>`;
    }

    // The time row: one place per time step, «(u» at u.d and «u)» at u.f.
    const steps = 2 * g.nodes.length;
    const x0 = 6;
    const cw = (w - 2 * x0) / steps;
    const yNum = h - rowH + 22;
    const yTok = h - rowH + 44;
    const at = new Map(a.marks.map((m) => [m.t, m.s]));
    for (let t = 1; t <= steps; t++) {
      const cx = x0 + (t - 0.5) * cw;
      const now = t === a.time && !a.end;
      svg +=
        `<text x="${cx.toFixed(1)}" y="${yNum}" text-anchor="middle" ` +
        `style="fill:${now ? "var(--accent-ink)" : "var(--muted)"};${FONT};font-size:var(--text-xs)${now ? ";font-weight:700" : ""}">${t}</text>`;
      const tok = at.get(t);
      if (tok) {
        svg +=
          `<text x="${cx.toFixed(1)}" y="${yTok}" text-anchor="middle" ` +
          `style="fill:${now ? "var(--accent-ink)" : "var(--fg)"};${FONT};font-size:var(--text-sm);font-weight:600">${esc(tok)}</text>`;
      }
    }
    svg += `<line x1="${x0}" x2="${(w - x0).toFixed(1)}" y1="${yNum + 6}" y2="${yNum + 6}" style="stroke:var(--border)" stroke-width="1"/>`;
    stage.innerHTML = wrapSvg(w, h, svg);
    stage.setAttribute(
      "aria-label",
      `Grafen med tidene: ${g.nodes
        .filter((n) => a.d[n.id] != null)
        .map((n) => `${n.id}: ${a.d[n.id]}/${a.f[n.id] ?? "–"}`)
        .join(", ") || "ingen noder oppdaget ennå"}.`,
    );
  },
};
