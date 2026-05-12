/* global window */
// =====================================================================
// Shared algorithm runtime
// =====================================================================
// Every algorithm module in this directory (sorting.js, graphs.js, …) is a
// plain IIFE that pulls helpers out of `window.AlgViz.A` (defined here) and,
// at the end, registers its algorithm objects with `A.register(name, obj)`.
// `js/algorithms/index.js` (loaded last) reads `A.algos` to assemble the
// ordered catalogue exposed as `window.AlgViz.ALGORITHMS`.
//
// FRAME CONTRACT — an algorithm exposes:
//   id, name, description, viewKind, code (Python source string), filename,
//   complexities {best,avg,worst,space}, sizeRange?, defaultData(size?),
//   run(input) → Frame[]
// where each Frame is:
//   {
//     line: number,        // 1-indexed line in `code` to highlight
//     desc: string,        // narrative shown in the step ribbon
//     data: number[],      // snapshot of the working list (for bar views)
//     variables: object,   // name → value, for the Variables panel
//     highlights: {        // role → indices: compare|swap|pivot|sorted|
//                          //                 eliminated|found
//     },
//     pointers: object,    // label → index, for chips above bars
//     windows?: object,    // name → [lo, hi] inclusive — outlines/regions
//     floating?: object,   // index → value — floating boxes above bars
//     visual?: object,     // structured payload for non-bar views (type: …)
//     merge?: object,      // merge-sort buffer panel state (see sorting.js)
//   }
// See js/views/ for how each field is rendered.
// =====================================================================
(function () {

// Deterministic shuffle so the page is reproducible across reloads.
function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffledRange(n, seed = 7) {
  const data = Array.from({ length: n }, (_, i) => i + 1);
  const rng = mulberry32(seed);
  for (let i = data.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [data[i], data[j]] = [data[j], data[i]];
  }
  return data;
}

function range(n) {
  return Array.from({ length: n }, (_, i) => i);
}

// ---- View-frame builders (topic / table / graph payloads) ----
function fallbackDataForVisual(visual) {
  if (!visual) return [1, 2, 3, 4];
  if (Array.isArray(visual.array) && visual.array.length) {
    return visual.array.map((value, idx) =>
      typeof value === "number" && Number.isFinite(value) ? value : idx + 1
    );
  }
  if (Array.isArray(visual.activities) && visual.activities.length) {
    return visual.activities.map((activity) =>
      Math.max(1, (activity.end || 0) - (activity.start || 0))
    );
  }
  if (Array.isArray(visual.nodes) && visual.nodes.length) {
    return Array.from(
      { length: Math.max(4, visual.nodes.length) },
      (_, idx) => idx + 1
    );
  }
  if (Array.isArray(visual.rows) && Array.isArray(visual.cols)) {
    return Array.from(
      { length: Math.max(1, visual.rows.length * visual.cols.length) },
      (_, idx) => (idx % Math.max(1, visual.cols.length)) + 1
    );
  }
  if (Array.isArray(visual.boxes) && visual.boxes.length) {
    return Array.from(
      { length: Math.max(4, visual.boxes.length) },
      (_, idx) => idx + 1
    );
  }
  return [1, 2, 3, 4];
}

function topicFrame(line, desc, visual, variables = {}, role = "pivot") {
  return {
    line,
    desc,
    data: fallbackDataForVisual(visual),
    viewKind: visual?.type || "topic",
    variables,
    highlights: role ? { [role]: [0] } : {},
    pointers: {},
    visual,
  };
}

function node(id, label, x, y, role = "default", sublabel = "") {
  return { id, label, x, y, role, sublabel };
}

function edge(from, to, label = "", role = "default") {
  return { from, to, label, role };
}

function graphVisual(kind, nodes, edges, meta = {}) {
  return { type: kind, nodes, edges, ...meta };
}

function tableVisual(rows, cols, values, meta = {}) {
  return { type: "table", rows, cols, values, ...meta };
}

// ---- Helpers for the "live" topic-style traces ----
function clamp(value, lo, hi) {
  return Math.max(lo, Math.min(hi, value));
}

function demoValues(input, max = 12, min = 4) {
  const source = Array.isArray(input) && input.length ? input : shuffledRange(min, 19);
  const n = clamp(source.length, min, max);
  return source.slice(0, n).map((value, idx) =>
    Number.isFinite(value) ? Math.max(1, Math.round(value)) : idx + 1
  );
}

function shortList(values, limit = 8) {
  const shown = values.slice(0, limit).join(" ");
  return values.length > limit ? `${shown} ...` : shown;
}

function roleMap(ids, role) {
  const map = {};
  ids.forEach((id) => { map[id] = role; });
  return map;
}

function completeTreeNodes(values, roles = {}) {
  const levels = Math.max(1, Math.floor(Math.log2(values.length)) + 1);
  return values.map((value, idx) => {
    const level = Math.floor(Math.log2(idx + 1));
    const first = 2 ** level - 1;
    const pos = idx - first;
    const slots = 2 ** level;
    const x = ((pos + 1) * 100) / (slots + 1);
    const y = 10 + level * (88 / Math.max(1, levels - 1));
    return node(String(idx), String(value), x, y, roles[idx] || "default", `a[${idx}]`);
  });
}

function completeTreeEdges(count, roles = {}) {
  const edges = [];
  for (let i = 1; i < count; i++) {
    const parent = Math.floor((i - 1) / 2);
    edges.push(edge(String(parent), String(i), "", roles[i] || "default"));
  }
  return edges;
}

function circleNodes(count, roles = {}, sublabels = {}, labels = null) {
  const r = count <= 5 ? 32 : 36;
  return Array.from({ length: count }, (_, i) => {
    const angle = -Math.PI / 2 + (2 * Math.PI * i) / count;
    return node(
      `v${i}`,
      labels?.[i] || (i === 0 ? "s" : String.fromCharCode(96 + i)),
      50 + Math.cos(angle) * r,
      52 + Math.sin(angle) * r,
      roles[`v${i}`] || "default",
      sublabels[`v${i}`] || ""
    );
  });
}

function graphEdgeKey(e) {
  return `${e.from}-${e.to}`;
}

function makeIntervalTree(values) {
  const nodes = [];
  const edges = [];
  function visit(lo, hi, depth, maxDepth, parent = null) {
    const id = `${lo}-${hi}`;
    const mid = (lo + hi) / 2;
    nodes.push(node(id, `A[${lo}..${hi}]`, 8 + (mid / Math.max(1, values.length - 1)) * 84, 10 + depth * 26, "default", shortList(values.slice(lo, hi + 1), 5)));
    if (parent) edges.push(edge(parent, id, depth === 1 ? "split" : ""));
    if (lo < hi && depth < maxDepth) {
      const m = Math.floor((lo + hi) / 2);
      visit(lo, m, depth + 1, maxDepth, id);
      visit(m + 1, hi, depth + 1, maxDepth, id);
    }
  }
  visit(0, values.length - 1, 0, Math.min(3, Math.ceil(Math.log2(values.length))));
  return { nodes, edges };
}

function liveTopicFrame(line, desc, visual, variables = {}, role = "pivot") {
  return {
    ...topicFrame(line, desc, visual, variables, role),
    note: desc,
  };
}

// (liveMergeSort removed: superseded by step-traced mergeSort.)

// (liveRecursionTree removed: superseded by step-traced recursionTree.)


function graphFromValues(input, maxNodes = 8) {
  const values = demoValues(input, maxNodes, 4);
  const n = values.length;
  const edges = [];
  for (let i = 0; i < n - 1; i++) {
    edges.push({ u: i, v: i + 1, w: 1 + (values[i] % 9) });
  }
  for (let i = 0; i < n - 2; i++) {
    if ((values[i] + i) % 2 === 0) edges.push({ u: i, v: i + 2, w: 1 + ((values[i] + values[i + 1]) % 9) });
  }
  return { values, n, edges };
}


// ---- Frame → dominant-role classification (used by the chrome) ----
function labelFor(frame) {
  const h = frame.highlights || {};
  if (h.found && h.found.length) return "found";
  if (h.swap && h.swap.length) return "swap";
  if (h.compare && h.compare.length) return "compare";
  if (h.pivot && h.pivot.length) return "pivot";
  if (h.eliminated && h.eliminated.length) return "eliminated";
  if (h.sorted && h.sorted.length) return "pass";
  return "init";
}

function roleColorVar(label) {
  if (label === "swap") return "var(--role-swap)";
  if (label === "compare") return "var(--role-compare)";
  if (label === "pivot") return "var(--role-pivot)";
  if (label === "found") return "var(--role-found)";
  if (label === "eliminated") return "var(--role-eliminated)";
  if (label === "pass") return "var(--role-sorted)";
  return "var(--ink-3)";
}

window.AlgViz = window.AlgViz || {};
window.AlgViz.A = {
  mulberry32, shuffledRange, range,
  fallbackDataForVisual, topicFrame, node, edge, graphVisual, tableVisual,
  clamp, demoValues, shortList, roleMap, completeTreeNodes, completeTreeEdges,
  circleNodes, graphEdgeKey, makeIntervalTree, liveTopicFrame, graphFromValues,
  labelFor, roleColorVar,
  algos: {},
  register(name, obj) { window.AlgViz.A.algos[name] = obj; },
};
// Legacy direct exposure (study-view.js, components.js, …)
window.AlgViz.shuffledRange = shuffledRange;
window.AlgViz.labelFor = labelFor;
window.AlgViz.roleColorVar = roleColorVar;
})();
