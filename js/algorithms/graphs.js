/* global window */
// =====================================================================
// Graph algorithms — each has its own specialized view (js/views/graph-views.js).
//   bfs            viewKind "bfs"          breadth-first traversal
//   dfs            viewKind "dfs"          depth-first traversal
//   mst            viewKind "mst-kruskal"  Kruskal MST with a disjoint-set forest
//   shortestPaths  viewKind "dijkstra"     Dijkstra on a weighted digraph
//   maxFlow        viewKind "max-flow"     Ford-Fulkerson / Edmonds-Karp
// All build their graphs via window.AlgViz.graph (alias _GLIB below).
// =====================================================================
// See js/algorithms/_shared.js for the Frame contract.
(function () {
const A = window.AlgViz.A;
const { mulberry32, shuffledRange, range, fallbackDataForVisual, topicFrame, node, edge, graphVisual, tableVisual, clamp, demoValues, shortList, roleMap, completeTreeNodes, completeTreeEdges, circleNodes, graphEdgeKey, makeIntervalTree, liveTopicFrame, graphFromValues } = window.AlgViz.A;
const _GLIB = window.AlgViz.graph;

function traversalGraph() {
  // Adapt the lib's graph shape to the legacy { nodes:[], edges:[[u,v],...], adj }
  // shape used by the bfs/dfs run() blocks below.
  const g = _GLIB.traversalGraph();
  return {
    nodes: g.nodes.map((n) => ({ id: n.id, x: n.x, y: n.y })),
    edges: g.edges.map((e) => [e.u, e.v]),
    adj: g.adj,
  };
}

function edgeKey(u, v) {
  return _GLIB.edgeKey(u, v, false);
}
const bfs = {
  id: "bfs",
  name: "BFS",
  description:
    "Breadth-first search explores vertices in order of distance from the source. A FIFO queue keeps the discovered-but-unfinished frontier; every popped vertex enqueues its undiscovered neighbours.",
  explanation: {
    no: "BFS-visualiseringen viser distansebølger som brer seg ut fra kilden, sammen med FIFO-køen og hvilke kanter som klassifiseres som tre- eller kryss-kanter.",
    en: "The BFS visualization shows distance waves spreading from the source, alongside the FIFO queue and which edges are classified as tree vs. cross.",
  },
  courseRefs: ["l08"],
  conceptIds: ["graph-traversal", "bfs"],
  learningGoalIds: ["H2", "H3", "H7", "H8", "H9"],
  viewKind: "bfs",
  filename: "graphs/bfs.py",
  complexities: { best: "Θ(V+E)", avg: "Θ(V+E)", worst: "Θ(V+E)", space: "Θ(V)" },
  code:
`from collections import deque

def bfs(adj: dict[str, list[str]], source: str) -> dict[str, int]:
    dist: dict[str, int] = {source: 0}
    parent: dict[str, str | None] = {source: None}
    queue: deque[str] = deque([source])
    while queue:
        u = queue.popleft()
        for v in adj[u]:
            if v not in dist:
                dist[v] = dist[u] + 1
                parent[v] = u
                queue.append(v)
    return dist`,
  defaultData() { return range(10); },
  run() {
    const G = traversalGraph();
    const source = "s";
    const dist = { [source]: 0 };
    const parent = { [source]: null };
    const queue = [source];
    const treeEdges = new Set();
    const crossEdges = new Set();
    const frames = [];

    function snapshot({ line, desc, role = "pivot", activeNode = null, activeEdge = null, edgeKind = null, variables = {} }) {
      frames.push({
        line,
        desc,
        data: [],
        viewKind: "bfs",
        highlights: { [role]: [0] },
        pointers: {},
        variables,
        visual: {
          type: "bfs",
          nodes: G.nodes.map((n) => ({
            id: n.id,
            x: n.x,
            y: n.y,
            dist: n.id in dist ? dist[n.id] : null,
            state:
              n.id === activeNode
                ? "active"
                : n.id in dist && !queue.includes(n.id)
                ? "visited"
                : queue.includes(n.id)
                ? "frontier"
                : "undiscovered",
          })),
          edges: G.edges.map(([u, v]) => {
            const k = edgeKey(u, v);
            const isActive =
              activeEdge && edgeKey(activeEdge[0], activeEdge[1]) === k;
            let cls = "default";
            if (treeEdges.has(k)) cls = "tree";
            else if (crossEdges.has(k)) cls = "cross";
            if (isActive) cls = edgeKind || "active";
            return { from: u, to: v, role: cls };
          }),
          source,
          queue: [...queue],
          dist: { ...dist },
          parent: { ...parent },
          activeNode,
          activeEdge,
        },
      });
    }

    snapshot({
      line: 4,
      desc: `Initialise: d[${source}] = 0, queue = [${source}]. Source is the only discovered vertex.`,
      role: "found",
      activeNode: source,
      variables: { source, queue: `[${source}]`, [`d[${source}]`]: 0 },
    });

    while (queue.length) {
      const u = queue.shift();
      snapshot({
        line: 7,
        desc: `Pop u = ${u} from the front of the queue. Distance d[${u}] = ${dist[u]}.`,
        role: "pivot",
        activeNode: u,
        variables: { u, [`d[${u}]`]: dist[u], queue: queue.length ? `[${queue.join(", ")}]` : "[]" },
      });
      for (const v of G.adj[u]) {
        const k = edgeKey(u, v);
        if (!(v in dist)) {
          // Tree edge: discover v
          dist[v] = dist[u] + 1;
          parent[v] = u;
          treeEdges.add(k);
          queue.push(v);
          snapshot({
            line: 12,
            desc: `Edge ${u}–${v}: ${v} is undiscovered. Set d[${v}] = ${dist[v]}, parent[${v}] = ${u}, enqueue ${v}.`,
            role: "found",
            activeNode: u,
            activeEdge: [u, v],
            edgeKind: "tree",
            variables: {
              u, v,
              [`d[${v}]`]: dist[v],
              queue: `[${queue.join(", ")}]`,
            },
          });
        } else {
          // Cross edge — already discovered
          if (!treeEdges.has(k)) crossEdges.add(k);
          snapshot({
            line: 9,
            desc: `Edge ${u}–${v}: ${v} already has d[${v}] = ${dist[v]}. Skip — this edge is not in the BFS tree.`,
            role: "eliminated",
            activeNode: u,
            activeEdge: [u, v],
            edgeKind: "cross",
            variables: { u, v, [`d[${v}]`]: dist[v] },
          });
        }
      }
    }

    snapshot({
      line: 15,
      desc: "Queue empty. Tree edges form the BFS tree; every vertex's distance is its shortest-path length from the source.",
      role: "found",
      variables: { reached: Object.keys(dist).length },
    });
    return frames;
  },
};

const dfs = {
  id: "dfs",
  name: "DFS",
  description:
    "Depth-first search dives along one path until it dead-ends, then backtracks. A LIFO call stack records the path; non-tree edges to ancestors are back edges, revealing cycles.",
  explanation: {
    no: "DFS-visualiseringen viser anropsstakken voksne nedover, oppdagelsestid/ferdigtid på hver node, og klassifiserer kanter som tre- eller tilbake-kanter.",
    en: "The DFS visualization shows the recursion stack growing downward, discovery / finish times on each node, and classifies edges as tree or back edges.",
  },
  courseRefs: ["l08"],
  conceptIds: ["graph-traversal", "dfs"],
  learningGoalIds: ["H2", "H3", "H7", "H8", "H9"],
  viewKind: "dfs",
  filename: "graphs/dfs.py",
  complexities: { best: "Θ(V+E)", avg: "Θ(V+E)", worst: "Θ(V+E)", space: "Θ(V)" },
  code:
`def dfs(adj: dict[str, list[str]], source: str) -> tuple[dict, dict]:
    d: dict[str, int] = {}   # discovery time
    f: dict[str, int] = {}   # finish time
    parent: dict[str, str | None] = {source: None}
    time = 0

    def visit(u: str) -> None:
        nonlocal time
        time += 1
        d[u] = time
        for v in adj[u]:
            if v not in d:
                parent[v] = u
                visit(v)
        time += 1
        f[u] = time

    visit(source)
    return d, f`,
  defaultData() { return range(10); },
  run() {
    const G = traversalGraph();
    const source = "s";
    const d = {};
    const f = {};
    const parent = { [source]: null };
    const stack = []; // each frame: { u, iter }
    const treeEdges = new Set();
    const backEdges = new Set();
    let time = 0;
    const frames = [];

    function pathOnStack() {
      return stack.map((fr) => fr.u);
    }

    function snapshot({ line, desc, role = "pivot", activeEdge = null, edgeKind = null, variables = {} }) {
      const onStack = new Set(pathOnStack());
      const activeNode = stack.length ? stack[stack.length - 1].u : null;
      frames.push({
        line,
        desc,
        data: [],
        viewKind: "dfs",
        highlights: { [role]: [0] },
        pointers: {},
        variables,
        visual: {
          type: "dfs",
          nodes: G.nodes.map((n) => ({
            id: n.id,
            x: n.x,
            y: n.y,
            d: n.id in d ? d[n.id] : null,
            f: n.id in f ? f[n.id] : null,
            state:
              n.id === activeNode
                ? "active"
                : onStack.has(n.id)
                ? "onstack"
                : n.id in f
                ? "finished"
                : n.id in d
                ? "discovered"
                : "undiscovered",
          })),
          edges: G.edges.map(([u, v]) => {
            const k = edgeKey(u, v);
            const isActive =
              activeEdge && edgeKey(activeEdge[0], activeEdge[1]) === k;
            let cls = "default";
            if (treeEdges.has(k)) cls = "tree";
            else if (backEdges.has(k)) cls = "back";
            if (isActive) cls = edgeKind || "active";
            return { from: u, to: v, role: cls };
          }),
          source,
          stack: stack.map((fr) => ({
            u: fr.u,
            d: d[fr.u],
            iter: fr.iter,
            adj: G.adj[fr.u],
          })),
          path: pathOnStack(),
          d: { ...d },
          f: { ...f },
          parent: { ...parent },
          time,
          activeEdge,
        },
      });
    }

    function visit(u) {
      time += 1;
      d[u] = time;
      stack.push({ u, iter: -1 });
      snapshot({
        line: 9,
        desc: `Enter visit(${u}). Set d[${u}] = ${time}; push ${u} onto the recursion stack.`,
        role: "pivot",
        variables: { u, [`d[${u}]`]: d[u], time, "|stack|": stack.length },
      });
      for (let i = 0; i < G.adj[u].length; i++) {
        const v = G.adj[u][i];
        const k = edgeKey(u, v);
        stack[stack.length - 1].iter = i;
        if (!(v in d)) {
          treeEdges.add(k);
          parent[v] = u;
          snapshot({
            line: 11,
            desc: `Edge ${u}→${v}: ${v} is white. Tree edge — recurse.`,
            role: "found",
            activeEdge: [u, v],
            edgeKind: "tree",
            variables: { u, v, "edge": "tree" },
          });
          visit(v);
          snapshot({
            line: 12,
            desc: `Returned from visit(${v}). Continue scanning ${u}'s neighbours.`,
            role: "pivot",
            variables: { u, "back at": u },
          });
        } else if (!(v in f)) {
          // v is on stack → back edge (cycle)
          backEdges.add(k);
          snapshot({
            line: 11,
            desc: `Edge ${u}→${v}: ${v} is on the stack — back edge. Reveals a cycle through the recursion path.`,
            role: "swap",
            activeEdge: [u, v],
            edgeKind: "back",
            variables: { u, v, "edge": "back" },
          });
        } else {
          // Already finished (in undirected DFS this is just the parent edge already accounted for)
          snapshot({
            line: 11,
            desc: `Edge ${u}→${v}: ${v} is already finished — skip (already in the DFS tree).`,
            role: "eliminated",
            activeEdge: [u, v],
            edgeKind: "tree",
            variables: { u, v, "edge": "skip" },
          });
        }
      }
      time += 1;
      f[u] = time;
      stack.pop();
      snapshot({
        line: 14,
        desc: `Finish ${u}. Set f[${u}] = ${time}; pop the stack frame and backtrack.`,
        role: "found",
        variables: { u, [`f[${u}]`]: f[u], time, "|stack|": stack.length },
      });
    }

    visit(source);
    snapshot({
      line: 17,
      desc: "All vertices reachable from the source have been discovered and finished. Tree edges form the DFS tree.",
      role: "found",
      variables: { reached: Object.keys(d).length, time },
    });
    return frames;
  },
};

// ============================================================
// Kruskal's MST — full step-by-step trace using graph-lib
// ============================================================
const mst = {
  id: "mst-kruskal",
  name: "Kruskal's MST",
  description:
    "Kruskal sorts the edges by weight and greedily adds each edge that joins two different components, growing a minimum spanning forest.",
  explanation: {
    no: "Kruskal-visualiseringen viser sorterte kanter, hvilken kant som behandles nå, og hvordan disjoint-set-skogen vokser når kanter slås sammen.",
    en: "The Kruskal visualization shows sorted edges, the edge being considered, and how the disjoint-set forest grows as components merge.",
  },
  courseRefs: ["l09"],
  conceptIds: ["mst", "disjoint-set", "greedy-choice"],
  learningGoalIds: ["I1", "I2", "I3", "I4", "I5", "I6"],
  viewKind: "mst-kruskal",
  filename: "graphs/kruskal.py",
  complexities: { best: "O(E log V)", avg: "O(E log V)", worst: "O(E log V)", space: "O(V)" },
  code:
`Edge = tuple[str, str, int]   # (u, v, weight)

def kruskal(vertices: list[str], edges: list[Edge]) -> list[Edge]:
    parent = {v: v for v in vertices}
    rank   = {v: 0 for v in vertices}

    def find(x: str) -> str:
        while parent[x] != x:
            parent[x] = parent[parent[x]]   # path compression
            x = parent[x]
        return x

    def union(a: str, b: str) -> bool:
        ra, rb = find(a), find(b)
        if ra == rb:
            return False
        if   rank[ra] < rank[rb]: parent[ra] = rb
        elif rank[ra] > rank[rb]: parent[rb] = ra
        else: parent[rb] = ra; rank[ra] += 1
        return True

    tree: list[Edge] = []
    for u, v, w in sorted(edges, key=lambda e: e[2]):
        if union(u, v):
            tree.append((u, v, w))
        if len(tree) == len(vertices) - 1:
            break
    return tree`,
  defaultData() { return range(8); },
  run() {
    const G = _GLIB.spanningGraph();
    const dsu = _GLIB.makeDSU(G.nodes.map((n) => n.id));
    // Stable sort by weight (then by edge label) for deterministic ties
    const sortedEdges = [...G.edges]
      .map((e, i) => ({ ...e, originalIndex: i }))
      .sort((a, b) => a.weight - b.weight || a.u.localeCompare(b.u) || a.v.localeCompare(b.v));
    const accepted = new Set();    // edge keys
    const rejected = new Set();    // edge keys (would form cycle)
    let totalWeight = 0;
    const frames = [];
    const target = G.nodes.length - 1;

    function vertexMap(activeIds = []) {
      const states = {};
      const comps = dsu.components();
      // Tag each vertex with its component index — view uses this to
      // tint vertices by component.
      const compIndex = {};
      comps.forEach((group, ci) => group.forEach((v) => { compIndex[v] = ci; }));
      G.nodes.forEach((n) => {
        states[n.id] = {
          state: activeIds.includes(n.id) ? "active" : "default",
          component: compIndex[n.id],
        };
      });
      return states;
    }

    function edgeMap(activeKey = null, activeRole = "active") {
      const map = {};
      sortedEdges.forEach((e) => {
        const k = _GLIB.edgeKey(e.u, e.v, false);
        let role = "default";
        if (accepted.has(k)) role = "tree";
        else if (rejected.has(k)) role = "reject";
        if (k === activeKey) role = activeRole;
        map[k] = { role, weight: e.weight };
      });
      return map;
    }

    function makeFrame({ line, desc, role, activeEdge = null, activeRole = "active", activeIds = [], variables = {}, currentIndex = -1 }) {
      const k = activeEdge ? _GLIB.edgeKey(activeEdge.u, activeEdge.v, false) : null;
      frames.push(
        _GLIB.frame({
          kind: "mst-kruskal",
          line,
          desc,
          role,
          graph: G,
          vertices: vertexMap(activeIds),
          edges: edgeMap(k, activeRole),
          containers: {
            sortedEdges: sortedEdges.map((e, i) => {
              const key = _GLIB.edgeKey(e.u, e.v, false);
              let status = "pending";
              if (accepted.has(key)) status = "accepted";
              else if (rejected.has(key)) status = "rejected";
              if (i === currentIndex) status = status === "pending" ? "active" : status;
              return { u: e.u, v: e.v, weight: e.weight, key, status, index: i };
            }),
            dsu: dsu.snapshot(),
            mst: {
              chosen: [...accepted],
              totalWeight,
              target,
              progress: accepted.size,
            },
          },
          active: { edge: activeEdge ? { u: activeEdge.u, v: activeEdge.v } : null },
          variables,
        })
      );
    }

    makeFrame({
      line: 12,
      desc: "Initialise: every vertex is its own component. Sort the edge list by weight.",
      role: "pivot",
      variables: { components: G.nodes.length, edges: sortedEdges.length },
    });

    for (let i = 0; i < sortedEdges.length; i++) {
      const e = sortedEdges[i];
      const ru = dsu.find(e.u);
      const rv = dsu.find(e.v);
      if (ru !== rv) {
        // Pre-merge: highlight the candidate
        makeFrame({
          line: 22,
          desc: `Edge ${e.u}–${e.v} (w = ${e.weight}): find(${e.u}) = ${ru}, find(${e.v}) = ${rv} — different components, accept.`,
          role: "found",
          activeEdge: e,
          activeRole: "active",
          activeIds: [e.u, e.v],
          variables: { edge: `${e.u}–${e.v}`, weight: e.weight, accepted: accepted.size, rejected: rejected.size },
          currentIndex: i,
        });
        dsu.union(e.u, e.v);
        const k = _GLIB.edgeKey(e.u, e.v, false);
        accepted.add(k);
        totalWeight += e.weight;
        // Post-merge: show union effect
        makeFrame({
          line: 23,
          desc: `Union ${ru} and ${rv}. The MST now has ${accepted.size} of ${target} edges, total weight ${totalWeight}.`,
          role: "found",
          activeEdge: e,
          activeRole: "tree",
          activeIds: [e.u, e.v],
          variables: { edge: `${e.u}–${e.v}`, total: totalWeight, accepted: accepted.size, target },
          currentIndex: i,
        });
        if (accepted.size === target) {
          makeFrame({
            line: 24,
            desc: `${target} edges chosen — every vertex is connected. Total weight of the MST is ${totalWeight}. Stop.`,
            role: "found",
            variables: { totalWeight, edges: target },
            currentIndex: i,
          });
          break;
        }
      } else {
        const k = _GLIB.edgeKey(e.u, e.v, false);
        rejected.add(k);
        makeFrame({
          line: 22,
          desc: `Edge ${e.u}–${e.v} (w = ${e.weight}): find(${e.u}) = find(${e.v}) = ${ru} — same component, reject (would form a cycle).`,
          role: "eliminated",
          activeEdge: e,
          activeRole: "reject",
          activeIds: [e.u, e.v],
          variables: { edge: `${e.u}–${e.v}`, weight: e.weight, accepted: accepted.size, rejected: rejected.size },
          currentIndex: i,
        });
      }
    }
    return frames;
  },
};

// ============================================================
// Dijkstra's shortest paths — full step-by-step trace using graph-lib
// ============================================================
const shortestPaths = {
  id: "dijkstra",
  name: "Dijkstra",
  description:
    "Dijkstra repeatedly extracts the unsettled vertex with the smallest tentative distance, then relaxes each outgoing edge. With non-negative weights, the first time a vertex is extracted its distance is final.",
  explanation: {
    no: "Dijkstra-visualiseringen viser min-prioritetskøen, hvilken node som låses, og hvordan hver kant strammes (relax) for å oppdatere avstandsestimater.",
    en: "The Dijkstra visualization shows the min-priority queue, which vertex gets settled, and how each edge is relaxed to tighten distance estimates.",
  },
  courseRefs: ["l10"],
  conceptIds: ["relaxation", "dijkstra"],
  learningGoalIds: ["J6", "J7", "J8", "J9", "J10", "J11"],
  viewKind: "dijkstra",
  filename: "graphs/dijkstra.py",
  complexities: { best: "O((V+E) log V)", avg: "O((V+E) log V)", worst: "O((V+E) log V)", space: "O(V)" },
  code:
`import heapq

def dijkstra(adj: dict[str, list[tuple[str, int]]], source: str):
    dist:   dict[str, float]    = {v: float("inf") for v in adj}
    parent: dict[str, str|None] = {v: None for v in adj}
    dist[source] = 0
    pq: list[tuple[float, str]] = [(0, source)]

    while pq:
        du, u = heapq.heappop(pq)
        if du > dist[u]:        # outdated entry
            continue
        for v, w in adj[u]:
            tentative = du + w
            if tentative < dist[v]:
                dist[v]   = tentative
                parent[v] = u
                heapq.heappush(pq, (tentative, v))
    return dist, parent`,
  defaultData() { return range(7); },
  run() {
    const G = _GLIB.weightedDirectedGraph();
    const adjW = {};   // u -> [{v, w}]
    G.nodes.forEach((n) => { adjW[n.id] = []; });
    G.edges.forEach((e) => { adjW[e.u].push({ v: e.v, w: e.weight }); });
    Object.values(adjW).forEach((list) => list.sort((a, b) => a.v.localeCompare(b.v)));

    const source = "s";
    const dist = {};
    const parent = {};
    G.nodes.forEach((n) => { dist[n.id] = Infinity; parent[n.id] = null; });
    dist[source] = 0;
    const settled = new Set();
    const pq = _GLIB.makeMinPQ((x) => x.d);
    pq.push({ d: 0, v: source });

    const treeEdges = new Set();   // (parent → v) edges in the SP tree
    const relaxedEdges = new Set(); // every edge ever examined
    const frames = [];

    function vertexMap(activeId = null) {
      const states = {};
      G.nodes.forEach((n) => {
        let state = "undiscovered";
        if (n.id === activeId) state = "active";
        else if (settled.has(n.id)) state = "settled";
        else if (dist[n.id] !== Infinity) state = "frontier";
        states[n.id] = { state, dist: dist[n.id], parent: parent[n.id] };
      });
      return states;
    }

    function edgeMap(activeKey = null, activeRole = "active") {
      const map = {};
      G.edges.forEach((e) => {
        const k = _GLIB.edgeKey(e.u, e.v, true);
        let role = "default";
        if (treeEdges.has(k)) role = "tree";
        else if (relaxedEdges.has(k)) role = "examined";
        if (k === activeKey) role = activeRole;
        map[k] = { role, weight: e.weight };
      });
      return map;
    }

    function pqSnapshot() {
      // For pedagogy show the heap sorted by d, with the top item flagged.
      return pq.sortedSnapshot().map((x, i) => ({ d: x.d, v: x.v, isTop: i === 0 }));
    }

    function distSnapshot() {
      return G.nodes.map((n) => ({
        v: n.id,
        d: dist[n.id],
        parent: parent[n.id],
        settled: settled.has(n.id),
      }));
    }

    function makeFrame({ line, desc, role, activeId = null, activeKey = null, activeRole = "active", variables = {} }) {
      frames.push(
        _GLIB.frame({
          kind: "dijkstra",
          line,
          desc,
          role,
          graph: G,
          vertices: vertexMap(activeId),
          edges: edgeMap(activeKey, activeRole),
          containers: {
            pq: pqSnapshot(),
            dist: distSnapshot(),
            source,
          },
          active: { node: activeId, edge: activeKey },
          variables,
        })
      );
    }

    makeFrame({
      line: 6,
      desc: `Initialise: d[${source}] = 0, all others ∞. Push (0, ${source}) onto the min-priority queue.`,
      role: "pivot",
      activeId: source,
      variables: { source, "|PQ|": pq.size() },
    });

    while (pq.size() > 0) {
      const top = pq.pop();
      const { d: du, v: u } = top;
      if (du > dist[u]) {
        // Outdated entry — skip.
        makeFrame({
          line: 11,
          desc: `Pop (${du}, ${u}). But d[${u}] = ${dist[u]} is smaller — this is a stale entry, skip.`,
          role: "eliminated",
          activeId: u,
          variables: { popped: `(${du}, ${u})`, "d[u]": dist[u] },
        });
        continue;
      }
      settled.add(u);
      makeFrame({
        line: 9,
        desc: `Extract-min → ${u} (d = ${du}). Settle ${u}; its distance is now final.`,
        role: "found",
        activeId: u,
        variables: { u, "d[u]": dist[u], settled: settled.size, "|PQ|": pq.size() },
      });

      for (const { v, w } of adjW[u]) {
        const tentative = du + w;
        const k = _GLIB.edgeKey(u, v, true);
        relaxedEdges.add(k);
        if (tentative < dist[v]) {
          const oldD = dist[v];
          // Drop the previous tree edge (if any) — we found a better predecessor.
          if (parent[v] != null) {
            treeEdges.delete(_GLIB.edgeKey(parent[v], v, true));
          }
          dist[v] = tentative;
          parent[v] = u;
          treeEdges.add(k);
          pq.push({ d: tentative, v });
          makeFrame({
            line: 14,
            desc: `Relax ${u}→${v}: ${du} + ${w} = ${tentative} < ${oldD === Infinity ? "∞" : oldD}. Update d[${v}] = ${tentative}, parent[${v}] = ${u}, push (${tentative}, ${v}).`,
            role: "pivot",
            activeId: u,
            activeKey: k,
            activeRole: "tree",
            variables: { u, v, w, "old d[v]": oldD === Infinity ? "∞" : oldD, "new d[v]": tentative },
          });
        } else {
          makeFrame({
            line: 13,
            desc: `Examine ${u}→${v}: ${du} + ${w} = ${tentative} ≥ d[${v}] = ${dist[v] === Infinity ? "∞" : dist[v]}. No improvement.`,
            role: "eliminated",
            activeId: u,
            activeKey: k,
            activeRole: "examined",
            variables: { u, v, w, "d[v]": dist[v] === Infinity ? "∞" : dist[v] },
          });
        }
      }
    }

    makeFrame({
      line: 17,
      desc: "Priority queue empty. Every reachable vertex is settled; tree edges form the shortest-path tree rooted at the source.",
      role: "found",
      variables: { settled: settled.size, source },
    });
    return frames;
  },
};

const maxFlow = {
  id: "max-flow",
  name: "Max Flow",
  description:
    "Edmonds-Karp (BFS-based Ford-Fulkerson) repeatedly finds a shortest augmenting path in the residual network and pushes its bottleneck capacity along it. The algorithm halts when s and t are disconnected in the residual graph; the final flow value equals the min-cut capacity.",
  explanation: {
    no: "Maks-flyt-visualiseringen viser flyt/kapasitet på hver kant, restnettverket, BFS som finner forøkende sti, og hvordan minste-snittet låses når ingen sti finnes.",
    en: "The max-flow visualization shows flow/capacity per edge, the residual network, the BFS that finds augmenting paths, and how the min-cut crystallises when no path remains.",
  },
  courseRefs: ["l12"],
  conceptIds: ["max-flow", "residual-network", "reduction"],
  learningGoalIds: ["L1", "L3", "L5", "L7", "L8", "L9", "L12", "L13"],
  viewKind: "max-flow",
  filename: "graphs/edmonds_karp.py",
  complexities: { best: "O(VE²)", avg: "O(VE²)", worst: "O(VE²)", space: "Θ(V+E)" },
  code:
`from collections import deque

Edge = tuple[str, str, int]   # (u, v, capacity)

def edmonds_karp(vertices: list[str], edges: list[Edge],
                 source: str, sink: str) -> int:
    cap = {v: {} for v in vertices}
    for u, v, c in edges:
        cap[u][v] = cap[u].get(v, 0) + c
        cap[v].setdefault(u, 0)             # back-edge slot

    flow = 0
    while True:                              # one iteration per augmentation
        parent = {source: source}
        q = deque([source])
        while q and sink not in parent:
            u = q.popleft()
            for v, c in cap[u].items():
                if v not in parent and c > 0:
                    parent[v] = u
                    q.append(v)
        if sink not in parent:               # no augmenting path → done
            return flow

        # Bottleneck capacity along the path
        push = float("inf")
        v = sink
        while v != source:
            u = parent[v]
            push = min(push, cap[u][v])
            v = u

        v = sink                              # apply the push
        while v != source:
            u = parent[v]
            cap[u][v] -= push
            cap[v][u] += push
            v = u
        flow += push`,
  defaultData() { return range(6); },
  run() {
    const G = _GLIB.flowNetwork();
    const source = "s";
    const sink = "t";
    // Residual capacities: cap[u][v]
    const cap = {};
    G.nodes.forEach((n) => { cap[n.id] = {}; });
    G.edges.forEach((e) => {
      cap[e.u][e.v] = (cap[e.u][e.v] || 0) + e.capacity;
      if (cap[e.v][e.u] === undefined) cap[e.v][e.u] = 0;
    });
    // Track flow on each ORIGINAL edge for display
    const flowOn = {};   // key "u->v" → current flow
    G.edges.forEach((e) => { flowOn[`${e.u}->${e.v}`] = 0; });
    const originalCap = {};
    G.edges.forEach((e) => { originalCap[`${e.u}->${e.v}`] = e.capacity; });

    let totalFlow = 0;
    const frames = [];

    function vertexMap(activeId = null, visitedSet = new Set(), pathSet = new Set()) {
      const states = {};
      G.nodes.forEach((n) => {
        let state = "default";
        if (n.id === activeId) state = "active";
        else if (pathSet.has(n.id)) state = "frontier";
        else if (visitedSet.has(n.id)) state = "visited";
        if (n.id === source) state = "source";
        if (n.id === sink) state = "sink";
        states[n.id] = { state };
      });
      return states;
    }

    function edgeMap(pathEdges = new Set()) {
      const map = {};
      G.edges.forEach((e) => {
        const k = _GLIB.edgeKey(e.u, e.v, true);
        const f = flowOn[`${e.u}->${e.v}`];
        const c = e.capacity;
        let role = "default";
        if (pathEdges.has(`${e.u}->${e.v}`)) role = "augmenting";
        else if (f === c) role = "saturated";
        else if (f > 0) role = "tree";
        map[k] = { role, label: `${f}/${c}`, flow: f, capacity: c };
      });
      return map;
    }

    function residualSnapshot() {
      // List of (u,v,residual) where residual > 0, useful for the side panel.
      const out = [];
      Object.keys(cap).forEach((u) => {
        Object.keys(cap[u]).forEach((v) => {
          const r = cap[u][v];
          if (r > 0) out.push({ u, v, residual: r, isBack: !originalCap[`${u}->${v}`] });
        });
      });
      out.sort((x, y) => x.u.localeCompare(y.u) || x.v.localeCompare(y.v));
      return out;
    }

    function makeFrame({ line, desc, role, activeId = null, visitedSet = new Set(), pathSet = new Set(), pathEdges = new Set(), variables = {} }) {
      frames.push(
        _GLIB.frame({
          kind: "max-flow",
          line,
          desc,
          role,
          graph: G,
          vertices: vertexMap(activeId, visitedSet, pathSet),
          edges: edgeMap(pathEdges),
          containers: {
            flow: {
              value: totalFlow,
              source,
              sink,
              edges: G.edges.map((e) => ({
                u: e.u, v: e.v, flow: flowOn[`${e.u}->${e.v}`], capacity: e.capacity,
              })),
            },
            residual: residualSnapshot(),
          },
          active: { node: activeId },
          variables,
        })
      );
    }

    makeFrame({
      line: 9,
      desc: `Initialise residual capacities. Total flow value f = 0. Source = ${source}, sink = ${sink}.`,
      role: "pivot",
      variables: { source, sink, "value(f)": 0 },
    });

    let iteration = 0;
    while (true) {
      iteration++;
      // BFS in residual graph
      const parent = { [source]: source };
      const queue = [source];
      const visited = new Set([source]);
      makeFrame({
        line: 14,
        desc: `Iteration ${iteration}: search the residual network from ${source} (BFS) for an augmenting path.`,
        role: "pivot",
        activeId: source,
        visitedSet: visited,
        variables: { iteration, "value(f)": totalFlow },
      });
      while (queue.length && !(sink in parent)) {
        const u = queue.shift();
        for (const v of Object.keys(cap[u]).sort()) {
          if (!(v in parent) && cap[u][v] > 0) {
            parent[v] = u;
            queue.push(v);
            visited.add(v);
          }
        }
      }
      if (!(sink in parent)) {
        // No augmenting path — we're done; show the min-cut.
        const reachable = new Set(Object.keys(parent));
        makeFrame({
          line: 21,
          desc: `No augmenting path from ${source} to ${sink} in the residual graph. The reachable set S = {${[...reachable].sort().join(", ")}} defines the min-cut. Max flow value = ${totalFlow}.`,
          role: "found",
          visitedSet: reachable,
          variables: { "max flow": totalFlow, "S": [...reachable].sort().join(","), "T": G.nodes.map(n=>n.id).filter(id=>!reachable.has(id)).sort().join(",") },
        });
        return frames;
      }

      // Reconstruct path
      const pathNodes = [];
      const pathEdges = new Set();
      let v = sink;
      while (v !== source) {
        pathNodes.unshift(v);
        const u = parent[v];
        pathEdges.add(`${u}->${v}`);
        v = u;
      }
      pathNodes.unshift(source);

      // Bottleneck
      let push = Infinity;
      for (let i = 0; i < pathNodes.length - 1; i++) {
        const a = pathNodes[i], b = pathNodes[i + 1];
        push = Math.min(push, cap[a][b]);
      }

      makeFrame({
        line: 26,
        desc: `Augmenting path found: ${pathNodes.join(" → ")}. Bottleneck residual capacity = ${push}.`,
        role: "found",
        visitedSet: visited,
        pathSet: new Set(pathNodes),
        pathEdges,
        variables: { path: pathNodes.join("→"), bottleneck: push },
      });

      // Apply the push
      for (let i = 0; i < pathNodes.length - 1; i++) {
        const a = pathNodes[i], b = pathNodes[i + 1];
        cap[a][b] -= push;
        cap[b][a] += push;
        // If the edge a→b is an original edge, increase flow; if instead b→a is
        // the original (we're cancelling flow), decrease its flow.
        if (originalCap[`${a}->${b}`] !== undefined) {
          flowOn[`${a}->${b}`] += push;
        } else {
          flowOn[`${b}->${a}`] -= push;
        }
      }
      totalFlow += push;
      makeFrame({
        line: 33,
        desc: `Push ${push} along the path. Update residuals (forward −${push}, backward +${push}). Total flow value rises to ${totalFlow}.`,
        role: "found",
        visitedSet: visited,
        pathSet: new Set(pathNodes),
        pathEdges,
        variables: { pushed: push, "value(f)": totalFlow },
      });
    }
  },
};

A.register("bfs", bfs);
A.register("dfs", dfs);
A.register("mst", mst);
A.register("shortestPaths", shortestPaths);
A.register("maxFlow", maxFlow);
})();
