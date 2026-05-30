// Kruskal's MST trace for <Stepper>. A fixed weighted undirected graph; edges
// are sorted by weight and each is accepted if it joins two different
// components (union-find), otherwise rejected (it would close a cycle). Accepted
// edges go green (tree); rejected edges go red/dashed. Node sub-labels show the
// component representative each vertex currently belongs to; edge weights are
// drawn via edges[].w. Drawing reuses the shared graph renderer.
//
// The linked <CodeBlock id="kruskal" lang="python"> must contain exactly:
//   1  def kruskal(V, edges):
//   2      parent = {v: v for v in V}
//   3      def find(x):
//   4          while parent[x] != x:
//   5              x = parent[x]
//   6          return x
//   7      tree = []
//   8      for u, v, w in sorted(edges, key=lambda e: e[2]):
//   9          if find(u) != find(v):
//   10             parent[find(u)] = find(v)
//   11             tree.append((u, v, w))
//   12     return tree
import { renderGraph } from "./_graph.js";

// 7 nodes, hand-placed so edges don't overlap badly
const POS = {
  a: [12, 25], b: [40, 12], c: [70, 18],
  d: [92, 50], e: [18, 72], f: [50, 88], g: [80, 75],
};
// [u, v, weight] — weights chosen so the merge order is interesting
const EDGES = [
  ["a", "b", 4], ["b", "c", 8], ["c", "d", 7],
  ["a", "e", 2], ["c", "g", 1], ["d", "g", 9],
  ["e", "f", 6], ["f", "g", 5], ["b", "f", 11],
  ["c", "f", 10],
];

export default {
  run() {
    const ids = Object.keys(POS);
    // union-find with the simple representative-chasing find above
    const parent = Object.fromEntries(ids.map((id) => [id, id]));
    const find = (x) => { while (parent[x] !== x) x = parent[x]; return x; };

    const sorted = [...EDGES].sort((a, b) => a[2] - b[2] || a[0].localeCompare(b[0]));
    const accepted = new Set();   // "u-v" keys in the MST
    const rejected = new Set();   // "u-v" keys that would close a cycle
    let total = 0;
    const target = ids.length - 1;
    const frames = [];

    const eq = (u, v, x, y) => (u === x && v === y) || (u === y && v === x);
    const hasKey = (set, u, v) => set.has(`${u}-${v}`) || set.has(`${v}-${u}`);

    const snap = (line, desc, vars, activeEdge, activeRole) =>
      frames.push({
        line,
        desc,
        vars,
        graph: {
          directed: false,
          nodes: ids.map((id) => ({
            id,
            label: id,
            x: POS[id][0],
            y: POS[id][1],
            role:
              activeEdge && (id === activeEdge[0] || id === activeEdge[1])
                ? "active"
                : "default",
            sub: find(id),          // current component representative
          })),
          edges: EDGES.map(([u, v, w]) => {
            let role = "default";
            if (hasKey(accepted, u, v)) role = "tree";
            else if (hasKey(rejected, u, v)) role = "reject";
            if (activeEdge && eq(u, v, activeEdge[0], activeEdge[1]) && role === "default")
              role = activeRole || "examined";
            return { u, v, w, role };
          }),
        },
      });

    snap(2, "Hver node er sin egen mengde. Sorter kantene etter vekt og gå gjennom dem fra lettest til tyngst.",
      { mengder: ids.length, kanter: sorted.length });

    for (const [u, v, w] of sorted) {
      const ru = find(u);
      const rv = find(v);
      if (ru !== rv) {
        snap(9, `Kant ${u}–${v} (w = ${w}): find(${u}) = ${ru} ≠ find(${v}) = ${rv} — ulike komponenter, godta.`,
          { kant: `${u}–${v}`, vekt: w, valgt: accepted.size, target }, [u, v], "active");
        parent[ru] = rv;
        accepted.add(`${u}-${v}`);
        total += w;
        snap(11, `Union: slå sammen komponentene. MST-treet har nå ${accepted.size} av ${target} kanter, total vekt ${total}.`,
          { kant: `${u}–${v}`, total, valgt: accepted.size, target }, [u, v], "tree");
        if (accepted.size === target) {
          snap(12, `${target} kanter valgt — alle noder er koblet sammen. Minimal totalvekt = ${total}. Ferdig.`,
            { totalvekt: total, kanter: target });
          break;
        }
      } else {
        rejected.add(`${u}-${v}`);
        snap(9, `Kant ${u}–${v} (w = ${w}): find(${u}) = find(${v}) = ${ru} — samme komponent, forkast (ville lagd en sykel).`,
          { kant: `${u}–${v}`, vekt: w, forkastet: rejected.size }, [u, v], "reject");
      }
    }
    return frames;
  },

  render(stage, frame, api) {
    renderGraph(stage, frame, api);
  },
};
