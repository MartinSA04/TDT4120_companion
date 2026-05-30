// Breadth-first search trace for <Stepper>. A fixed undirected graph; BFS from s
// discovers vertices layer by layer (shortest paths in #edges). Drawing reuses
// the shared graph renderer; node sub-labels show dist, the queue + current
// vertex show on the linked <CodeBlock>'s variable strip.
//
// The linked <CodeBlock id="bfs" lang="python"> must contain exactly:
//   1  def bfs(G, s):
//   2      for u in G.V:
//   3          dist[u] = INF
//   4      dist[s] = 0
//   5      Q = [s]
//   6      while Q:
//   7          u = Q.pop(0)
//   8          for v in G.adj[u]:
//   9              if dist[v] != INF:
//   10                 continue
//   11             dist[v] = dist[u] + 1
//   12             Q.append(v)
import { renderGraph } from "./_graph.js";

// id, label, normalized x/y (0..100)
const POS = {
  s: [8, 50], a: [28, 20], b: [28, 80], c: [50, 50],
  d: [72, 22], e: [72, 78], f: [93, 50],
};
const EDGES = [
  ["s", "a"], ["s", "b"], ["a", "c"], ["b", "c"],
  ["c", "d"], ["c", "e"], ["d", "f"], ["e", "f"],
];
const ADJ = {};
for (const id of Object.keys(POS)) ADJ[id] = [];
for (const [u, v] of EDGES) { ADJ[u].push(v); ADJ[v].push(u); }

const INF = "∞";

export default {
  run() {
    const ids = Object.keys(POS);
    const dist = Object.fromEntries(ids.map((id) => [id, INF]));
    const parent = {};
    const state = Object.fromEntries(ids.map((id) => [id, "idle"])); // idle|frontier|active|done
    const treeEdges = new Set();
    const frames = [];

    const snap = (line, desc, vars, activeEdge) =>
      frames.push({
        line,
        desc,
        vars,
        graph: {
          nodes: ids.map((id) => ({
            id,
            label: id,
            x: POS[id][0],
            y: POS[id][1],
            role:
              state[id] === "active"
                ? "active"
                : state[id] === "frontier"
                  ? "frontier"
                  : state[id] === "done"
                    ? "done"
                    : id === "s"
                      ? "source"
                      : "default",
            sub: dist[id] === INF ? INF : String(dist[id]),
          })),
          edges: EDGES.map(([u, v]) => ({
            u,
            v,
            role: treeEdges.has(`${u}-${v}`) || treeEdges.has(`${v}-${u}`)
              ? "tree"
              : activeEdge && ((activeEdge[0] === u && activeEdge[1] === v) || (activeEdge[0] === v && activeEdge[1] === u))
                ? "examined"
                : "default",
          })),
        },
      });

    const qstr = (Q) => `[${Q.join(", ")}]`;

    dist.s = 0;
    state.s = "frontier";
    let Q = ["s"];
    snap(5, "Sett dist[s] = 0 og legg s i køen Q.", { Q: qstr(Q), s: "s" });

    while (Q.length) {
      const u = Q.shift();
      state[u] = "active";
      snap(7, `Ta ut u = ${u} fra fronten av køen (FIFO).`, { Q: qstr(Q), u });
      for (const v of ADJ[u]) {
        if (dist[v] === INF) {
          dist[v] = dist[u] + 1;
          parent[v] = u;
          treeEdges.add(`${u}-${v}`);
          state[v] = "frontier";
          Q.push(v);
          snap(
            11,
            `${v} er uoppdaget: dist[${v}] = dist[${u}] + 1 = ${dist[v]}. Legg ${v} bakerst i køen.`,
            { Q: qstr(Q), u, v },
            [u, v],
          );
        } else {
          snap(9, `${v} er allerede oppdaget (dist[${v}] = ${dist[v]}) — hopp over.`, { Q: qstr(Q), u, v }, [u, v]);
        }
      }
      state[u] = "done";
    }
    snap(6, "Køen er tom — alle noder har korteste avstand fra s (i antall kanter).", { Q: "[]" });
    return frames;
  },

  render(stage, frame, api) {
    renderGraph(stage, frame, api);
  },
};
