/* global window */
/*
 * graph-lib — central graph utilities for the visualizer.
 *
 * Exposes everything via window.AlgViz.graph so it can be consumed by any
 * algorithm or view file (load order: graph-lib must come before
 * algorithms.js).
 *
 * What's in here:
 *   • Edge-key normalisation + canonical adjacency-list builder
 *   • A few hand-tuned demo graphs (traversal / weighted MST / weighted
 *     directed / source-sink flow / dense APSP) shared across algorithms
 *   • Layout helpers (circular ring, layered by BFS distance,
 *     left-to-right source-sink layout for flow networks)
 *   • Disjoint-set forest (union–find) for Kruskal
 *   • Min-priority-queue (binary heap) for Dijkstra / Prim
 *   • Snapshot factory `frame(...)` that produces frames in the shape the
 *     specialized React views expect (vertices keyed by id, edges keyed by
 *     canonical edge string, plus per-frame containers like queue / stack /
 *     pq / dsu / flow / table). Every algorithm in the lecture series can
 *     speak this single vocabulary.
 *   • Re-exports the existing `node` / `edge` constructors so legacy
 *     algorithms keep working unchanged.
 */
(function () {
  // -------------------- Edge keys --------------------

  function edgeKey(u, v, directed = false) {
    if (directed) return `${u}->${v}`;
    return u < v ? `${u}-${v}` : `${v}-${u}`;
  }

  function edgeMatches(eKey, u, v, directed = false) {
    return eKey === edgeKey(u, v, directed);
  }

  // -------------------- Graph factories --------------------

  function makeNode(id, label, x, y, extra = {}) {
    return { id, label: label != null ? label : id, x, y, ...extra };
  }

  function makeEdge(u, v, weight = null, capacity = null, extra = {}) {
    return { u, v, weight, capacity, ...extra };
  }

  function buildAdj(nodes, edges, directed = false) {
    const adj = {};
    nodes.forEach((n) => { adj[n.id] = []; });
    edges.forEach((e) => {
      adj[e.u].push(e.v);
      if (!directed) adj[e.v].push(e.u);
    });
    Object.values(adj).forEach((list) => list.sort());
    return adj;
  }

  function makeGraph({ nodes, edges, directed = false, weighted = false }) {
    return {
      nodes,
      edges,
      adj: buildAdj(nodes, edges, directed),
      directed,
      weighted,
    };
  }

  // -------------------- Hand-tuned demo graphs --------------------
  //
  //  traversalGraph       — 10 nodes, 13 edges, layered s..t
  //  spanningGraph        — 8 nodes, 12 weighted undirected edges
  //  weightedDirectedGraph— 7 nodes, 11 weighted directed edges
  //  flowNetwork          — 6 nodes, 9 capacities, source s sink t
  //  apspGraph            — 4 nodes, near-complete weighted directed

  function traversalGraph() {
    const nodes = [
      makeNode("s", "s", 50, 8),
      makeNode("a", "a", 24, 28), makeNode("b", "b", 76, 28),
      makeNode("c", "c", 10, 50), makeNode("d", "d", 38, 50),
      makeNode("e", "e", 62, 50), makeNode("f", "f", 90, 50),
      makeNode("g", "g", 24, 74), makeNode("h", "h", 76, 74),
      makeNode("t", "t", 50, 92),
    ];
    const edges = [
      ["s", "a"], ["s", "b"],
      ["a", "c"], ["a", "d"], ["b", "e"], ["b", "f"],
      ["c", "g"], ["d", "g"], ["e", "h"], ["f", "h"],
      ["d", "e"],
      ["g", "t"], ["h", "t"],
    ].map(([u, v]) => makeEdge(u, v));
    return makeGraph({ nodes, edges, directed: false });
  }

  function spanningGraph() {
    // 8 nodes laid out in two rows; weights chosen so Kruskal builds an
    // interesting forest that merges in a non-trivial order.
    const nodes = [
      makeNode("a", "a", 12, 22), makeNode("b", "b", 38, 12),
      makeNode("c", "c", 64, 12), makeNode("d", "d", 90, 22),
      makeNode("e", "e", 12, 78), makeNode("f", "f", 38, 88),
      makeNode("g", "g", 64, 88), makeNode("h", "h", 90, 78),
    ];
    const edges = [
      ["a", "b", 4],  ["b", "c", 8],  ["c", "d", 7],
      ["a", "e", 2],  ["b", "f", 11], ["c", "g", 1],  ["d", "h", 9],
      ["e", "f", 6],  ["f", "g", 5],  ["g", "h", 3],
      ["b", "e", 14], ["c", "f", 10],
    ].map(([u, v, w]) => makeEdge(u, v, w));
    return makeGraph({ nodes, edges, directed: false, weighted: true });
  }

  function weightedDirectedGraph() {
    // 7 nodes, directed, positive weights. Designed so Dijkstra has to
    // reorder the priority queue (b is reached at 1, then later improved).
    const nodes = [
      makeNode("s", "s", 8, 50),
      makeNode("a", "a", 30, 22), makeNode("b", "b", 30, 78),
      makeNode("c", "c", 55, 14), makeNode("d", "d", 55, 50),
      makeNode("e", "e", 55, 86),
      makeNode("t", "t", 88, 50),
    ];
    const edges = [
      ["s", "a", 4], ["s", "b", 1],
      ["a", "c", 3], ["a", "d", 2],
      ["b", "a", 2], ["b", "d", 5], ["b", "e", 4],
      ["c", "t", 4], ["d", "t", 6], ["d", "c", 1],
      ["e", "t", 3],
    ].map(([u, v, w]) => makeEdge(u, v, w));
    return makeGraph({ nodes, edges, directed: true, weighted: true });
  }

  function flowNetwork() {
    // Classic 6-node flow network (CLRS 26.1).
    const nodes = [
      makeNode("s", "s", 8, 50),
      makeNode("a", "a", 32, 22), makeNode("b", "b", 32, 78),
      makeNode("c", "c", 64, 22), makeNode("d", "d", 64, 78),
      makeNode("t", "t", 92, 50),
    ];
    const edges = [
      ["s", "a", 16], ["s", "b", 13],
      ["a", "c", 12],
      ["b", "a", 4],  ["b", "d", 14],
      ["c", "b", 9],
      ["d", "c", 7],  ["d", "t", 4],
      ["c", "t", 20],
    ].map(([u, v, c]) => ({ ...makeEdge(u, v), capacity: c }));
    return makeGraph({ nodes, edges, directed: true, weighted: true });
  }

  // -------------------- Layouts --------------------

  function circularPositions(n, opts = {}) {
    const r = opts.radius || 36;
    const cx = opts.cx != null ? opts.cx : 50;
    const cy = opts.cy != null ? opts.cy : 50;
    return Array.from({ length: n }, (_, i) => {
      const angle = -Math.PI / 2 + (2 * Math.PI * i) / n;
      return { x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r };
    });
  }

  function layeredPositions(graph, source) {
    // BFS-distance layered layout: vertices at the same distance share a y-row.
    const dist = { [source]: 0 };
    const queue = [source];
    while (queue.length) {
      const u = queue.shift();
      for (const v of graph.adj[u]) {
        if (!(v in dist)) { dist[v] = dist[u] + 1; queue.push(v); }
      }
    }
    const layers = {};
    Object.entries(dist).forEach(([id, d]) => {
      if (!layers[d]) layers[d] = [];
      layers[d].push(id);
    });
    const maxD = Math.max(...Object.keys(layers).map(Number));
    const positions = {};
    Object.entries(layers).forEach(([d, ids]) => {
      const y = 8 + (Number(d) / Math.max(1, maxD)) * 84;
      ids.sort();
      ids.forEach((id, i) => {
        const x = ids.length === 1 ? 50 : 8 + (i / (ids.length - 1)) * 84;
        positions[id] = { x, y };
      });
    });
    return positions;
  }

  function sourceSinkPositions(internalIds, opts = {}) {
    // s on the left, t on the right, internal nodes in the middle, alternating
    // top/bottom for visual clarity.
    const out = { s: { x: 8, y: 50 }, t: { x: 92, y: 50 } };
    const n = internalIds.length;
    internalIds.forEach((id, i) => {
      const x = 28 + (i / Math.max(1, n - 1)) * 44;
      const y = i % 2 === 0 ? 24 : 76;
      out[id] = { x, y };
    });
    return out;
  }

  // -------------------- Disjoint Set Forest (union-find) --------------------

  function makeDSU(ids) {
    const parent = {};
    const rank = {};
    ids.forEach((id) => { parent[id] = id; rank[id] = 0; });
    function find(x) {
      while (parent[x] !== x) {
        parent[x] = parent[parent[x]];
        x = parent[x];
      }
      return x;
    }
    function union(x, y) {
      const rx = find(x);
      const ry = find(y);
      if (rx === ry) return false;
      if (rank[rx] < rank[ry]) parent[rx] = ry;
      else if (rank[rx] > rank[ry]) parent[ry] = rx;
      else { parent[ry] = rx; rank[rx]++; }
      return true;
    }
    function components() {
      const groups = {};
      ids.forEach((id) => {
        const r = find(id);
        if (!groups[r]) groups[r] = [];
        groups[r].push(id);
      });
      return Object.values(groups).map((g) => g.sort());
    }
    function snapshot() { return { parent: { ...parent }, components: components() }; }
    return { find, union, components, snapshot };
  }

  // -------------------- Min-priority queue (binary heap) --------------------

  function makeMinPQ(keyFn = (x) => x) {
    const heap = [];
    function up(i) {
      while (i > 0) {
        const p = (i - 1) >> 1;
        if (keyFn(heap[i]) < keyFn(heap[p])) {
          [heap[i], heap[p]] = [heap[p], heap[i]];
          i = p;
        } else break;
      }
    }
    function down(i) {
      while (true) {
        const l = i * 2 + 1;
        const r = l + 1;
        let s = i;
        if (l < heap.length && keyFn(heap[l]) < keyFn(heap[s])) s = l;
        if (r < heap.length && keyFn(heap[r]) < keyFn(heap[s])) s = r;
        if (s === i) return;
        [heap[i], heap[s]] = [heap[s], heap[i]];
        i = s;
      }
    }
    return {
      push(item) { heap.push(item); up(heap.length - 1); },
      pop() {
        if (!heap.length) return undefined;
        const top = heap[0];
        const last = heap.pop();
        if (heap.length) { heap[0] = last; down(0); }
        return top;
      },
      size: () => heap.length,
      peek: () => heap[0],
      // Snapshot of items in heap order (NOT sorted) — best for showing the
      // actual binary-heap structure when displayed level-by-level. Add
      // `.sortedSnapshot()` for a sorted view.
      snapshot: () => heap.map((x) => x),
      sortedSnapshot: () => [...heap].sort((a, b) => keyFn(a) - keyFn(b)),
    };
  }

  // -------------------- Snapshot frame factory --------------------
  //
  // Every graph algorithm produces frames with a consistent shape so the
  // matching React view can render them. The shape is:
  //
  //   {
  //     line, desc,                  // narrative
  //     viewKind: <kind>,            // dispatcher hint
  //     visual: {
  //       type: <kind>,              // also dispatcher hint (frame.visual.type wins)
  //       graph: { nodes, edges, directed, adj },
  //       vertices: { [id]: { state, role, labels } },
  //       edges:    { [key]: { role, label } },
  //       containers: { ... }        // queue/stack/pq/dsu/flow/etc.
  //       active: { node, edge },
  //     },
  //     variables, highlights, pointers, data,
  //   }
  //
  // `kind` is one of: bfs, dfs, mst-kruskal, dijkstra, max-flow, etc.

  function frame({
    kind,
    line,
    desc,
    role = "pivot",
    graph,
    vertices = {},
    edges = {},
    containers = {},
    active = {},
    variables = {},
  }) {
    return {
      line,
      desc,
      data: [],
      viewKind: kind,
      highlights: { [role]: [0] },
      pointers: {},
      variables,
      visual: {
        type: kind,
        graph: graph
          ? {
              nodes: graph.nodes,
              edges: graph.edges,
              directed: !!graph.directed,
            }
          : null,
        vertices,
        edges,
        containers,
        active,
      },
    };
  }

  // -------------------- Edge state helper --------------------
  //
  // Builds an edges-state map from a list of (key, role, optional label).
  function edgeStates(entries) {
    const map = {};
    entries.forEach(({ key, role, label }) => {
      map[key] = { role, label };
    });
    return map;
  }

  // -------------------- Vertex state helper --------------------
  function vertexStates(idsOrEntries, defaults = {}) {
    const map = {};
    if (Array.isArray(idsOrEntries) && idsOrEntries.length && typeof idsOrEntries[0] === "object") {
      idsOrEntries.forEach(({ id, ...rest }) => {
        map[id] = { ...defaults, ...rest };
      });
    } else {
      idsOrEntries.forEach((id) => {
        map[id] = { ...defaults };
      });
    }
    return map;
  }

  // -------------------- Tree layouts --------------------
  //
  // Heap, BST, and merge-sort recursion trees all want the same look-and-feel
  // — circles + lines + an optional array sidecar. These helpers compute
  // {id, x, y, depth, …} positions in the 0–100 viewBox so a single TreeView
  // can render any of them.

  function heapTreePositions(n) {
    // Complete-binary-tree positions for an array of length n laid out
    // level-by-level. Returns an array indexed by heap index.
    const positions = [];
    const levels = Math.max(1, Math.ceil(Math.log2(n + 1)));
    for (let i = 0; i < n; i++) {
      const level = Math.floor(Math.log2(i + 1));
      const first = 2 ** level - 1;
      const slot = i - first;
      const slots = 2 ** level;
      const x = ((slot + 1) * 100) / (slots + 1);
      const y = 14 + (level / Math.max(1, levels - 1)) * 70;
      positions.push({ index: i, x, y, level, parent: i === 0 ? null : Math.floor((i - 1) / 2) });
    }
    return positions;
  }

  function buildBST(keys) {
    // Insert `keys` in order, return root with .id, .key, .left, .right
    let nextId = 0;
    const make = (key) => ({ id: nextId++, key, left: null, right: null });
    if (!keys.length) return null;
    const root = make(keys[0]);
    function insert(node, key) {
      if (key < node.key) {
        if (node.left) insert(node.left, key);
        else node.left = make(key);
      } else if (key > node.key) {
        if (node.right) insert(node.right, key);
        else node.right = make(key);
      }
    }
    for (let i = 1; i < keys.length; i++) insert(root, keys[i]);
    return root;
  }

  function bstPositions(root) {
    // In-order traversal lays nodes out left-to-right; depth gives y.
    const flat = [];
    function inorder(node, depth, parent) {
      if (!node) return;
      inorder(node.left, depth + 1, node);
      flat.push({ id: node.id, key: node.key, depth, parent: parent ? parent.id : null });
      inorder(node.right, depth + 1, node);
    }
    inorder(root, 0, null);
    const maxDepth = Math.max(1, ...flat.map((n) => n.depth));
    const positions = {};
    flat.forEach((n, i) => {
      positions[n.id] = {
        id: n.id,
        x: 8 + (i / Math.max(1, flat.length - 1)) * 84,
        y: 12 + (n.depth / Math.max(1, maxDepth)) * 76,
        depth: n.depth,
        key: n.key,
        parent: n.parent,
      };
    });
    return { flat, positions, maxDepth };
  }

  function mergeRecursionTree(n) {
    // Build the recursion tree of merge_sort(0..n-1).
    const nodes = [];
    const edges = [];
    function visit(lo, hi, depth, parentId) {
      const id = `${lo}-${hi}`;
      nodes.push({ id, lo, hi, depth, slots: hi - lo + 1 });
      if (parentId != null) edges.push({ from: parentId, to: id });
      if (lo < hi) {
        const mid = Math.floor((lo + hi) / 2);
        visit(lo, mid, depth + 1, id);
        visit(mid + 1, hi, depth + 1, id);
      }
    }
    visit(0, n - 1, 0, null);

    // Position: leaves spread evenly along x; internal nodes at avg of children.
    const maxDepth = Math.max(0, ...nodes.map((n) => n.depth));
    const leaves = nodes.filter((n) => n.lo === n.hi).sort((a, b) => a.lo - b.lo);
    const xMap = {};
    leaves.forEach((leaf, i) => {
      xMap[leaf.id] = 6 + (i / Math.max(1, leaves.length - 1)) * 88;
    });
    function assignX(nodeId) {
      if (xMap[nodeId] != null) return xMap[nodeId];
      const childIds = edges.filter((e) => e.from === nodeId).map((e) => e.to);
      const xs = childIds.map(assignX);
      xMap[nodeId] = xs.reduce((s, x) => s + x, 0) / xs.length;
      return xMap[nodeId];
    }
    nodes.forEach((n) => assignX(n.id));
    const positions = {};
    nodes.forEach((n) => {
      positions[n.id] = {
        id: n.id,
        x: xMap[n.id],
        y: 12 + (n.depth / Math.max(1, maxDepth)) * 74,
        depth: n.depth,
        lo: n.lo,
        hi: n.hi,
      };
    });
    return { nodes, edges, positions, maxDepth };
  }

  // -------------------- Public surface --------------------

  const lib = {
    edgeKey,
    edgeMatches,
    makeNode,
    makeEdge,
    makeGraph,
    buildAdj,
    // Demo graphs
    traversalGraph,
    spanningGraph,
    weightedDirectedGraph,
    flowNetwork,
    // Layouts
    circularPositions,
    layeredPositions,
    sourceSinkPositions,
    // Tree layouts
    heapTreePositions,
    buildBST,
    bstPositions,
    mergeRecursionTree,
    // Data structures
    makeDSU,
    makeMinPQ,
    // Snapshot factory + helpers
    frame,
    edgeStates,
    vertexStates,
  };

  window.AlgViz = window.AlgViz || {};
  window.AlgViz.graph = lib;
})();
