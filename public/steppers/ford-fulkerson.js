// Ford-Fulkerson / Edmonds-Karp trace for <Stepper>. A fixed directed flow
// network (the classic CLRS 26.1 example: kilde s, sluk t, 6 noder). Each
// iteration finds a shortest augmenting path in the residual network with BFS
// and pushes its bottleneck capacity; the run ends when s and t are split, and
// the final value (23) equals the min-cut capacity. Drawing reuses the shared
// graph renderer: edge label = "f/c" (flyt/kapasitet), edge roles augmenting
// (current path) / saturated (f==c) / default; node roles source/target/active.
//
// The linked <CodeBlock id="maxflow" lang="python"> must contain exactly:
//   1  def ford_fulkerson(G, s, t):
//   2      for (u, v) in G.E:
//   3          f[u][v] = 0
//   4      while finnes_forøkende_sti(G_f, s, t):
//   5          p = bfs_sti(G_f, s, t)
//   6          c_f = min(restkapasitet(u, v) for (u, v) in p)
//   7          for (u, v) in p:
//   8              f[u][v] += c_f          # eller opphev motgående flyt
//   9      return sum(f[s][v] for v in G.adj[s])
import { renderGraph } from "./_graph.js";

// id, label, normalized x/y (0..100) — CLRS 26.1 layout
const POS = {
  s: [8, 50],
  a: [32, 20], b: [32, 80],
  c: [64, 20], d: [64, 80],
  t: [92, 50],
};
// directed capacities [u, v, c]
const CAPS = [
  ["s", "a", 16], ["s", "b", 13],
  ["a", "c", 12],
  ["b", "a", 4], ["b", "d", 14],
  ["c", "b", 9],
  ["d", "c", 7], ["d", "t", 4],
  ["c", "t", 20],
];
const SOURCE = "s";
const SINK = "t";

export default {
  run() {
    const ids = Object.keys(POS);

    // Residual capacities cap[u][v]; original edges keep a back-edge slot at 0.
    const cap = Object.fromEntries(ids.map((id) => [id, {}]));
    const isOriginal = {}; // "u->v" present iff u->v is a real (forward) edge
    for (const [u, v, c] of CAPS) {
      cap[u][v] = (cap[u][v] || 0) + c;
      if (cap[v][u] === undefined) cap[v][u] = 0;
      isOriginal[`${u}->${v}`] = true;
    }
    const flow = Object.fromEntries(CAPS.map(([u, v]) => [`${u}->${v}`, 0]));
    const capOf = Object.fromEntries(CAPS.map(([u, v, c]) => [`${u}->${v}`, c]));

    let total = 0;
    const frames = [];

    // Build the node/edge payload for a frame. pathNodes/pathEdges mark the
    // current augmenting path; active is the node BFS is expanding from.
    const snap = (line, desc, vars, { pathNodes = new Set(), pathEdges = new Set(), active = null } = {}) =>
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
                : id === SOURCE
                  ? "source"
                  : id === SINK
                    ? "target"
                    : pathNodes.has(id)
                      ? "frontier"
                      : "default",
          })),
          edges: CAPS.map(([u, v]) => {
            const f = flow[`${u}->${v}`];
            const c = capOf[`${u}->${v}`];
            let role = "default";
            if (pathEdges.has(`${u}->${v}`)) role = "augmenting";
            else if (f === c) role = "saturated";
            else if (f > 0) role = "tree";
            return { u, v, label: `${f}/${c}`, role };
          }),
        },
      });

    snap(
      3,
      "Sett all flyt til 0. Restkapasiteten er da lik den opprinnelige kapasiteten på hver kant. Flytverdi |f| = 0.",
      { kilde: SOURCE, sluk: SINK, "|f|": 0 },
    );

    let iter = 0;
    while (true) {
      iter++;
      // BFS in the residual network (Edmonds-Karp: shortest augmenting path).
      const parent = { [SOURCE]: SOURCE };
      const queue = [SOURCE];
      snap(
        4,
        `Iterasjon ${iter}: søk i restnettet fra ${SOURCE} med BFS etter en forøkende sti til ${SINK}.`,
        { iterasjon: iter, "|f|": total },
        { active: SOURCE },
      );
      while (queue.length && !(SINK in parent)) {
        const u = queue.shift();
        for (const v of Object.keys(cap[u]).sort()) {
          if (!(v in parent) && cap[u][v] > 0) {
            parent[v] = u;
            queue.push(v);
          }
        }
      }

      if (!(SINK in parent)) {
        // No augmenting path: the reachable set S is one side of a min cut.
        const reachable = Object.keys(parent).sort();
        const Tset = ids.filter((id) => !(id in parent)).sort();
        snap(
          9,
          `Ingen forøkende sti igjen: ${SOURCE} og ${SINK} er adskilt i restnettet. Mengden S = {${reachable.join(", ")}} gir et minimalt snitt, og maks-flyt = ${total} = snittkapasiteten.`,
          { "maks-flyt": total, S: `{${reachable.join(",")}}`, T: `{${Tset.join(",")}}` },
        );
        return frames;
      }

      // Reconstruct the path from t back to s.
      const pathNodes = [];
      const pathEdges = new Set();
      let v = SINK;
      while (v !== SOURCE) {
        pathNodes.unshift(v);
        const u = parent[v];
        pathEdges.add(`${u}->${v}`);
        v = u;
      }
      pathNodes.unshift(SOURCE);

      // Bottleneck = min residual capacity along the path.
      let push = Infinity;
      for (let i = 0; i < pathNodes.length - 1; i++) {
        push = Math.min(push, cap[pathNodes[i]][pathNodes[i + 1]]);
      }

      const markPath = {
        pathNodes: new Set(pathNodes),
        pathEdges: new Set([...pathEdges].filter((k) => isOriginal[k])),
      };
      snap(
        6,
        `Forøkende sti funnet: ${pathNodes.join(" → ")}. Flaskehalsen er minste restkapasitet langs stien, c_f = ${push}.`,
        { sti: pathNodes.join("→"), flaskehals: push, "|f|": total },
        markPath,
      );

      // Push the bottleneck: forward residuals shrink, backward residuals grow.
      // On an original edge we add flow; on a back edge we cancel earlier flow.
      for (let i = 0; i < pathNodes.length - 1; i++) {
        const u = pathNodes[i];
        const w = pathNodes[i + 1];
        cap[u][w] -= push;
        cap[w][u] += push;
        if (isOriginal[`${u}->${w}`]) flow[`${u}->${w}`] += push;
        else flow[`${w}->${u}`] -= push; // back edge: opphev tidligere flyt
      }
      total += push;
      snap(
        8,
        `Send ${push} enheter langs stien. Forover synker restkapasiteten med ${push}, bakover øker den med ${push} (mulighet til å angre). Flytverdien stiger til |f| = ${total}.`,
        { sendt: push, "|f|": total },
        markPath,
      );
    }
  },

  render(stage, frame, api) {
    renderGraph(stage, frame, api);
  },
};
