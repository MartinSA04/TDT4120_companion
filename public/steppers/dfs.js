// Depth-first search trace for <Stepper>. A fixed undirected graph; DFS dives
// along one branch until it dead-ends, then backtracks. The recursion stack is
// the frontier; node sub-labels show discovery/finish times d/f, tree edges go
// green, edges back to a node still on the stack are back edges (red, dashed).
// Drawing reuses the shared graph renderer; the stack + time show on the linked
// <CodeBlock>'s variable strip.
//
// The linked <CodeBlock id="dfs" lang="python"> must contain exactly:
//   1  def dfs(adj, source):
//   2      d, f = {}, {}            # oppdagelses- og ferdigtid
//   3      time = 0
//   4
//   5      def visit(u):
//   6          nonlocal time
//   7          time += 1; d[u] = time
//   8          for v in adj[u]:
//   9              if v not in d:
//   10                 visit(v)
//   11         time += 1; f[u] = time
//   12
//   13     visit(source)
//   14     return d, f
import { renderGraph } from "./_graph.js";

// id, label, normalized x/y (0..100) — spread out to avoid overlap
const POS = {
  s: [50, 10], a: [20, 35], b: [80, 35],
  c: [12, 72], d: [42, 72], e: [70, 72], f: [50, 95],
};
// Undirected edges. Adjacency order below fixes the DFS branch order.
const EDGES = [
  ["s", "a"], ["s", "b"], ["a", "c"], ["a", "d"],
  ["b", "e"], ["c", "d"], ["d", "f"], ["e", "f"],
];
const ADJ = {};
for (const id of Object.keys(POS)) ADJ[id] = [];
for (const [u, v] of EDGES) { ADJ[u].push(v); ADJ[v].push(u); }

export default {
  run() {
    const ids = Object.keys(POS);
    const d = {};
    const f = {};
    const parent = { s: null };
    const stack = [];          // ids currently on the recursion stack
    const treeEdges = new Set();
    const backEdges = new Set();
    let time = 0;
    const frames = [];

    const eq = (u, v, x, y) => (u === x && v === y) || (u === y && v === x);

    const snap = (line, desc, vars, activeEdge) => {
      const onStack = new Set(stack);
      const top = stack[stack.length - 1] || null;
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
              id === top
                ? "active"
                : onStack.has(id)
                  ? "frontier"
                  : id in f
                    ? "done"
                    : id === "s" && !(id in d)
                      ? "source"
                      : "default",
            // sub-label shows d/f once known
            sub:
              id in f ? `${d[id]}/${f[id]}` : id in d ? `${d[id]}/·` : "",
          })),
          edges: EDGES.map(([u, v]) => {
            let role = "default";
            if ([...treeEdges].some((k) => k === `${u}-${v}` || k === `${v}-${u}`)) role = "tree";
            else if ([...backEdges].some((k) => k === `${u}-${v}` || k === `${v}-${u}`)) role = "back";
            if (activeEdge && eq(u, v, activeEdge[0], activeEdge[1]) && role === "default") role = "examined";
            return { u, v, role };
          }),
        },
      });
    };

    const stackStr = () => `[${stack.join(" → ")}]`;

    const visit = (u) => {
      time += 1;
      d[u] = time;
      stack.push(u);
      snap(7, `visit(${u}): sett d[${u}] = ${time} og legg ${u} på rekursjonsstakken.`,
        { u, [`d[${u}]`]: d[u], time, stakk: stackStr() });
      for (const v of ADJ[u]) {
        if (!(v in d)) {
          treeEdges.add(`${u}-${v}`);
          parent[v] = u;
          snap(9, `Kant ${u}–${v}: ${v} er hvit (uoppdaget) — trekant, gå dypere.`,
            { u, v, kant: "tre" }, [u, v]);
          visit(v);
          snap(8, `Tilbake i ${u} etter visit(${v}). Fortsett å skanne naboene til ${u}.`,
            { u, "tilbake i": u, stakk: stackStr() });
        } else if (!(v in f)) {
          // v discovered but not finished → still on the stack → back edge
          if (v !== parent[u]) {
            backEdges.add(`${u}-${v}`);
            snap(9, `Kant ${u}–${v}: ${v} ligger på stakken — tilbakekant. Avslører en sykel langs rekursjonsstien.`,
              { u, v, kant: "tilbake" }, [u, v]);
          }
        }
      }
      time += 1;
      f[u] = time;
      stack.pop();
      snap(11, `Ferdig med ${u}: sett f[${u}] = ${time}, og rygg tilbake (pop stakken).`,
        { u, [`f[${u}]`]: f[u], time, stakk: stackStr() });
    };

    snap(13, "Start dybde-først-søk fra kilden s.", { source: "s", time: 0, stakk: "[]" });
    visit("s");
    snap(14, "Alle noder nåbare fra s er oppdaget og ferdige. Trekantene danner DFS-treet.",
      { besøkt: Object.keys(d).length, time });
    return frames;
  },

  render(stage, frame, api) {
    renderGraph(stage, frame, api);
  },
};
