// Dijkstra's shortest-paths trace for <Stepper>. A fixed weighted *directed*
// graph; the algorithm repeatedly extracts the unsettled vertex with the
// smallest tentative distance and relaxes its outgoing edges. With non-negative
// weights, a vertex's distance is final the first time it is extracted. Node
// sub-labels show the current d[]; the just-extracted node is active, reached-
// but-unsettled nodes are frontier, settled nodes are done. Tree edges (current
// shortest-path predecessors) go accent; merely examined edges go orange.
// Drawing reuses the shared graph renderer; the priority queue shows on the
// linked <CodeBlock>'s variable strip.
//
// The linked <CodeBlock id="dijkstra" lang="python"> must contain exactly:
//   1  def dijkstra(adj, source):
//   2      d = {v: INF for v in adj}
//   3      d[source] = 0
//   4      Q = set(adj)                  # uoppgjorte noder
//   5      while Q:
//   6          u = min(Q, key=lambda v: d[v])   # extract-min
//   7          Q.remove(u)
//   8          for v, w in adj[u]:
//   9              if d[u] + w < d[v]:           # relax
//   10                 d[v] = d[u] + w
//   11                 parent[v] = u
//   12     return d
import { renderGraph } from "./_graph.js";

// 7 nodes, directed; positions hand-placed (left→right) so arrows read clearly
const POS = {
  s: [8, 50], a: [32, 20], b: [32, 80],
  c: [58, 12], d: [58, 50], e: [58, 88], t: [90, 50],
};
// [u, v, weight] — all non-negative
const EDGES = [
  ["s", "a", 4], ["s", "b", 1],
  ["a", "c", 3], ["a", "d", 2],
  ["b", "a", 2], ["b", "d", 5], ["b", "e", 4],
  ["c", "t", 4], ["d", "c", 1], ["d", "t", 6],
  ["e", "t", 3],
];
const ADJ = {};
for (const id of Object.keys(POS)) ADJ[id] = [];
for (const [u, v, w] of EDGES) ADJ[u].push([v, w]);

const INF = "∞";

export default {
  run() {
    const ids = Object.keys(POS);
    const dist = Object.fromEntries(ids.map((id) => [id, Infinity]));
    const parent = {};
    const Q = new Set(ids);            // unsettled vertices
    const settled = new Set();
    const examined = new Set();        // edge keys ever relaxed/examined
    const treeEdges = {};              // v -> "u-v" current predecessor edge
    const frames = [];

    dist.s = 0;

    const dstr = (id) => (dist[id] === Infinity ? INF : String(dist[id]));
    const eq = (u, v, x, y) => u === x && v === y;

    const snap = (line, desc, vars, active, activeEdge, activeRole) => {
      const treeSet = new Set(Object.values(treeEdges));
      frames.push({
        line,
        desc,
        vars,
        graph: {
          directed: true,
          nodes: ids.map((id) => ({
            id,
            label: id,
            x: POS[id][0],
            y: POS[id][1],
            role:
              id === active
                ? "active"
                : settled.has(id)
                  ? "done"
                  : dist[id] !== Infinity
                    ? "frontier"
                    : "default",
            sub: dstr(id),
          })),
          edges: EDGES.map(([u, v, w]) => {
            const key = `${u}-${v}`;
            let role = "default";
            if (treeSet.has(key)) role = "tree";
            else if (examined.has(key)) role = "examined";
            if (activeEdge && eq(u, v, activeEdge[0], activeEdge[1])) role = activeRole || "examined";
            return { u, v, w, role };
          }),
        },
      });
    };

    const qstr = () =>
      `{${[...Q].filter((v) => dist[v] !== Infinity).sort((a, b) => dist[a] - dist[b]).map((v) => `${v}:${dist[v]}`).join(", ")}}`;

    snap(3, "Sett d[s] = 0 og alle andre til ∞. Alle noder ligger i mengden Q av uoppgjorte noder.",
      { source: "s", Q: qstr() });

    while (Q.size) {
      // extract-min over the reachable unsettled vertices
      let u = null;
      let best = Infinity;
      for (const v of Q) {
        if (dist[v] < best) { best = dist[v]; u = v; }
      }
      if (u === null) break;            // remaining vertices unreachable
      Q.delete(u);
      settled.add(u);
      snap(6, `Extract-min → ${u} (d = ${dist[u]}). ${u} gjøres opp; avstanden er nå endelig.`,
        { u, [`d[${u}]`]: dist[u], oppgjort: settled.size, Q: qstr() }, u);

      for (const [v, w] of ADJ[u]) {
        const tentative = dist[u] + w;
        examined.add(`${u}-${v}`);
        if (tentative < dist[v]) {
          const old = dstr(v);
          // drop v's previous tree edge, if any
          delete treeEdges[v];
          dist[v] = tentative;
          parent[v] = u;
          treeEdges[v] = `${u}-${v}`;
          snap(10, `Relax ${u}→${v}: ${dist[u]} + ${w} = ${tentative} < ${old}. Oppdater d[${v}] = ${tentative}.`,
            { u, v, w, "ny d[v]": tentative, Q: qstr() }, u, [u, v], "tree");
        } else {
          snap(9, `Sjekk ${u}→${v}: ${dist[u]} + ${w} = ${tentative} ≥ d[${v}] = ${dstr(v)}. Ingen forbedring.`,
            { u, v, w, "d[v]": dstr(v) }, u, [u, v], "examined");
        }
      }
    }

    snap(12, "Q er tom — alle nåbare noder er oppgjort. Trekantene danner korteste-vei-treet fra s.",
      { oppgjort: settled.size, source: "s" });
    return frames;
  },

  render(stage, frame, api) {
    renderGraph(stage, frame, api);
  },
};
