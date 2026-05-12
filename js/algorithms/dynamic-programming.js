/* global window */
// =====================================================================
// Dynamic programming & related table-filling traces.
//   dpTable               viewKind "table"     (reference)
//   liveDPTable           viewKind "table"     0/1 knapsack table, catalogue entry
//   activitySelection     viewKind "timeline"  (reference)
//   liveActivitySelection viewKind "timeline"  greedy interval scheduling, catalogue
//   floydWarshall         viewKind "table"     (reference)
//   liveFloydWarshall     viewKind "table"     all-pairs shortest paths, catalogue
// =====================================================================
// See js/algorithms/_shared.js for the Frame contract.
(function () {
const A = window.AlgViz.A;
const { mulberry32, shuffledRange, range, fallbackDataForVisual, topicFrame, node, edge, graphVisual, tableVisual, clamp, demoValues, shortList, roleMap, completeTreeNodes, completeTreeEdges, circleNodes, graphEdgeKey, makeIntervalTree, liveTopicFrame, graphFromValues } = window.AlgViz.A;
const dpTable = {
  id: "dp-table",
  name: "DP Table",
  description:
    "Dynamic programming stores overlapping subproblem answers in a table and fills it in dependency order.",
  explanation: {
    no: "DP-tabellen viser binært ryggsekkproblem: hver celle K[i,j] spør hvor mye verdi vi kan få med de i første gjenstandene og kapasitet j.",
    en: "The DP table shows 0/1 knapsack: each cell K[i,j] asks how much value we can get from the first i items and capacity j.",
  },
  courseRefs: ["l06"],
  conceptIds: ["dynamic-programming", "binary-knapsack"],
  learningGoalIds: ["F1", "F2", "F3", "F4", "F5", "F9"],
  viewKind: "table",
  filename: "dp/knapsack.py",
  complexities: { best: "Θ(nW)", avg: "Θ(nW)", worst: "Θ(nW)", space: "Θ(nW)" },
  code:
`def knapsack(values, weights, W):
    K = table(n + 1, W + 1)
    for i in range(1, n + 1):
        for j in range(W + 1):
            K[i,j] = K[i-1,j]
            if weights[i] <= j:
                K[i,j] = max(K[i,j], K[i-1,j-weights[i]] + values[i])
    return K[n,W]`,
  defaultData() { return range(8); },
  run() {
    const rows = ["0", "item 1", "item 2", "item 3"];
    const cols = ["0", "1", "2", "3", "4", "5"];
    return [
      topicFrame(2, "Create a table. Row i means first i items; column j means capacity j.", tableVisual(rows, cols, [
        [0, 0, 0, 0, 0, 0],
        ["", "", "", "", "", ""],
        ["", "", "", "", "", ""],
        ["", "", "", "", "", ""],
      ], { active: [0, 0] }), { n: 3, W: 5 }),
      topicFrame(5, "Base row is zero: with no items, every capacity gives value 0.", tableVisual(rows, cols, [
        [0, 0, 0, 0, 0, 0],
        ["", "", "", "", "", ""],
        ["", "", "", "", "", ""],
        ["", "", "", "", "", ""],
      ], { rowHighlight: 0 }), { i: 0 }, "sorted"),
      topicFrame(6, "Item 1 has weight 2 and value 3. For capacity 2 and above, include it.", tableVisual(rows, cols, [
        [0, 0, 0, 0, 0, 0],
        [0, 0, 3, 3, 3, 3],
        ["", "", "", "", "", ""],
        ["", "", "", "", "", ""],
      ], { rowHighlight: 1, active: [1, 2] }), { item: 1, w: 2, v: 3 }, "compare"),
      topicFrame(7, "Item 2 has weight 3 and value 4. Each cell chooses max(skip, take).", tableVisual(rows, cols, [
        [0, 0, 0, 0, 0, 0],
        [0, 0, 3, 3, 3, 3],
        [0, 0, 3, 4, 4, 7],
        ["", "", "", "", "", ""],
      ], { rowHighlight: 2, active: [2, 5], dependency: [[1, 5], [1, 2]] }), { skip: 3, take: 7 }, "pivot"),
      topicFrame(8, "After item 3, the optimum at K[3,5] is 7. Reconstruction follows the choices backward.", tableVisual(rows, cols, [
        [0, 0, 0, 0, 0, 0],
        [0, 0, 3, 3, 3, 3],
        [0, 0, 3, 4, 4, 7],
        [0, 0, 3, 4, 5, 7],
      ], { active: [3, 5], path: [[3, 5], [2, 5], [1, 2]] }), { optimum: 7 }, "found"),
    ];
  },
};

const activitySelection = {
  id: "activity-selection",
  name: "Activity Selection",
  description:
    "Pick the compatible activity that finishes first, then repeat on what remains.",
  explanation: {
    no: "Aktivitetsutvelgelse viser et klassisk grådig valg: velg aktiviteten som slutter tidligst.",
    en: "Activity selection shows a classic greedy choice: choose the activity that finishes earliest.",
  },
  courseRefs: ["l07"],
  conceptIds: ["greedy-choice"],
  learningGoalIds: ["G1", "G2", "G3"],
  viewKind: "timeline",
  filename: "greedy/activity_selection.py",
  complexities: { best: "Θ(n)", avg: "Θ(n)", worst: "Θ(n)", space: "O(1)" },
  code:
`def activity_selection(activities):
    sort by finish time
    last_finish = 0
    for activity in activities:
        if activity.start >= last_finish:
            choose activity
            last_finish = activity.finish`,
  defaultData() { return range(8); },
  run() {
    const activities = [
      { id: "a1", label: "a1", start: 1, end: 4 },
      { id: "a2", label: "a2", start: 3, end: 5 },
      { id: "a3", label: "a3", start: 0, end: 6 },
      { id: "a4", label: "a4", start: 5, end: 7 },
      { id: "a5", label: "a5", start: 8, end: 9 },
      { id: "a6", label: "a6", start: 5, end: 9 },
    ];
    return [
      topicFrame(2, "Sort activities by finish time. The first finish leaves maximum room for the rest.", { type: "timeline", activities, selected: [], active: "a1", range: [0, 10] }, { sortedBy: "finish" }),
      topicFrame(5, "Choose a1 because it finishes first.", { type: "timeline", activities, selected: ["a1"], active: "a1", range: [0, 10] }, { lastFinish: 4 }, "found"),
      topicFrame(4, "Reject a2 and a3 because they overlap the last chosen activity.", { type: "timeline", activities, selected: ["a1"], rejected: ["a2", "a3"], active: "a2", range: [0, 10] }, { overlap: "yes" }, "eliminated"),
      topicFrame(5, "Choose a4, the next compatible activity with earliest finish.", { type: "timeline", activities, selected: ["a1", "a4"], active: "a4", range: [0, 10] }, { lastFinish: 7 }, "found"),
      topicFrame(5, "Choose a5 and finish with a maximal compatible set.", { type: "timeline", activities, selected: ["a1", "a4", "a5"], rejected: ["a2", "a3", "a6"], active: "a5", range: [0, 10] }, { count: 3 }, "found"),
    ];
  },
};

const floydWarshall = {
  id: "floyd-warshall",
  name: "Floyd-Warshall",
  description:
    "All-pairs shortest paths by dynamic programming over which intermediate vertices are allowed.",
  explanation: {
    no: "Floyd-Warshall viser DP-lag der k betyr at bare de k første nodene kan brukes som mellomliggende.",
    en: "Floyd-Warshall shows DP layers where k means only the first k vertices may be used as intermediates.",
  },
  courseRefs: ["l11"],
  conceptIds: ["apsp", "dynamic-programming"],
  learningGoalIds: ["K1", "K2", "K3", "K4"],
  viewKind: "table",
  filename: "graphs/floyd_warshall.py",
  complexities: { best: "Θ(V³)", avg: "Θ(V³)", worst: "Θ(V³)", space: "Θ(V²)" },
  code:
`def floyd_warshall(W):
    D = W
    for k in range(n):
        for i in range(n):
            for j in range(n):
                D[i,j] = min(D[i,j], D[i,k] + D[k,j])
    return D`,
  defaultData() { return range(8); },
  run() {
    const rows = ["a", "b", "c", "d"];
    const cols = ["a", "b", "c", "d"];
    return [
      topicFrame(2, "Start with direct edge weights. ∞ means no known direct path.", tableVisual(rows, cols, [
        [0, 3, "∞", 7],
        [8, 0, 2, "∞"],
        [5, "∞", 0, 1],
        [2, "∞", "∞", 0],
      ], { active: [0, 3] }), { k: 0 }),
      topicFrame(3, "Let a be an allowed intermediate. Check every i→a→j route.", tableVisual(rows, cols, [
        [0, 3, "∞", 7],
        [8, 0, 2, 15],
        [5, 8, 0, 1],
        [2, 5, "∞", 0],
      ], { rowHighlight: 0, colHighlight: 0, active: [3, 1] }), { k: "a" }, "compare"),
      topicFrame(5, "Let b be allowed too. a→c improves through b: 3 + 2 = 5.", tableVisual(rows, cols, [
        [0, 3, 5, 7],
        [8, 0, 2, 15],
        [5, 8, 0, 1],
        [2, 5, 7, 0],
      ], { rowHighlight: 1, colHighlight: 1, dependency: [[0, 1], [1, 2]], active: [0, 2] }), { update: "a-c=5" }, "pivot"),
      topicFrame(5, "Let c be allowed. b→d improves through c: 2 + 1 = 3.", tableVisual(rows, cols, [
        [0, 3, 5, 6],
        [7, 0, 2, 3],
        [5, 8, 0, 1],
        [2, 5, 7, 0],
      ], { rowHighlight: 2, colHighlight: 2, dependency: [[1, 2], [2, 3]], active: [1, 3] }), { update: "b-d=3" }, "pivot"),
      topicFrame(6, "After all k, every entry is the shortest distance for its pair.", tableVisual(rows, cols, [
        [0, 3, 5, 6],
        [5, 0, 2, 3],
        [3, 6, 0, 1],
        [2, 5, 7, 0],
      ], { active: [2, 0] }), { complete: "APSP" }, "found"),
    ];
  },
};

// ============================================================
// Edmonds-Karp Maximum Flow — full step-by-step trace using graph-lib
// ============================================================
const liveDPTable = {
  ...dpTable,
  code:
`def knapsack(values: list[int], weights: list[int], capacity: int) -> int:
    n = len(values)
    table = [[0] * (capacity + 1) for _ in range(n + 1)]
    for i in range(1, n + 1):
        for w in range(capacity + 1):
            table[i][w] = table[i - 1][w]
            if weights[i - 1] <= w:
                take = table[i - 1][w - weights[i - 1]] + values[i - 1]
                table[i][w] = max(table[i][w], take)
    return table[n][capacity]`,
  sizeRange: { min: 4, max: 14, default: 8 },
  defaultData(size = 8) { return shuffledRange(size, 53); },
  run(input) {
    const raw = demoValues(input, 18, 6);
    const itemCount = clamp(Math.floor(raw.length / 2), 3, 6);
    const weights = raw.slice(0, itemCount).map((v) => (v % 5) + 1);
    const values = raw.slice(itemCount, itemCount * 2).map((v) => (v % 9) + 1);
    while (values.length < itemCount) values.push((raw[values.length] % 9) + 1);
    const capacity = clamp(Math.ceil(raw.length / 2), 5, 10);
    const table = Array.from({ length: itemCount + 1 }, () => Array(capacity + 1).fill(0));
    const snapshots = [];
    for (let i = 1; i <= itemCount; i++) {
      for (let w = 0; w <= capacity; w++) {
        table[i][w] = table[i - 1][w];
        if (weights[i - 1] <= w) {
          table[i][w] = Math.max(table[i][w], table[i - 1][w - weights[i - 1]] + values[i - 1]);
        }
      }
      snapshots.push(table.map((row) => [...row]));
    }
    const rows = ["0", ...values.map((value, i) => `i${i + 1} w${weights[i]} v${value}`)];
    const cols = range(capacity + 1).map(String);
    const blank = table.map((row, i) => row.map((v) => i === 0 ? v : ""));
    return [
      liveTopicFrame(3, "Create a table from the current item weights, values, and capacity.", tableVisual(rows, cols, blank, { active: [0, 0] }), { items: itemCount, capacity, weights: `[${weights.join(", ")}]`, values: `[${values.join(", ")}]` }),
      liveTopicFrame(5, "The base row is zero because no items give no value.", tableVisual(rows, cols, blank, { rowHighlight: 0 }), { i: 0 }, "sorted"),
      liveTopicFrame(8, "Fill the first item row using the take-or-skip recurrence.", tableVisual(rows, cols, snapshots[0], { rowHighlight: 1, active: [1, Math.min(capacity, weights[0])] }), { item: 1, w: weights[0], v: values[0] }, "compare"),
      liveTopicFrame(9, "Later rows combine a skip cell and a take cell from the previous row.", tableVisual(rows, cols, snapshots[Math.min(1, snapshots.length - 1)], { rowHighlight: Math.min(2, itemCount), active: [Math.min(2, itemCount), capacity], dependency: [[Math.min(1, itemCount - 1), capacity], [Math.min(1, itemCount - 1), Math.max(0, capacity - weights[Math.min(1, itemCount - 1)])]] }), { skip: "prev row", take: "prev row minus weight" }, "pivot"),
      liveTopicFrame(11, "The final bottom-right cell is the optimum for this shuffled instance.", tableVisual(rows, cols, snapshots[snapshots.length - 1], { active: [itemCount, capacity] }), { optimum: table[itemCount][capacity] }, "found"),
    ];
  },
};

const liveActivitySelection = {
  ...activitySelection,
  code:
`Activity = tuple[int, int]

def activity_selection(activities: list[Activity]) -> list[Activity]:
    ordered = sorted(activities, key=lambda x: x[1])
    chosen: list[Activity] = []
    last_finish = -1
    for start, finish in ordered:
        if start >= last_finish:
            chosen.append((start, finish))
            last_finish = finish
    return chosen`,
  sizeRange: { min: 4, max: 14, default: 9 },
  defaultData(size = 9) { return shuffledRange(size, 59); },
  run(input) {
    const values = demoValues(input, 10, 5);
    const activities = values.map((v, i) => {
      const start = (v + i * 2) % 12;
      const end = start + 1 + (v % 4);
      return { id: `a${i + 1}`, label: `a${i + 1}`, start, end };
    }).sort((a, b) => a.end - b.end || a.start - b.start);
    const selected = [];
    const rejected = [];
    let lastFinish = -1;
    const frames = [liveTopicFrame(4, "Sort the generated intervals by finish time.", { type: "timeline", activities, selected: [], rejected: [], active: activities[0]?.id, range: [0, Math.max(...activities.map((a) => a.end), 10)] }, { n: activities.length })];
    activities.forEach((a) => {
      if (a.start >= lastFinish) {
        selected.push(a.id);
        lastFinish = a.end;
        frames.push(liveTopicFrame(7, `Choose ${a.label}; it starts after the previous finish time.`, { type: "timeline", activities, selected: [...selected], rejected: [...rejected], active: a.id, range: [0, Math.max(...activities.map((x) => x.end), 10)] }, { lastFinish }, "found"));
      } else {
        rejected.push(a.id);
        frames.push(liveTopicFrame(6, `Reject ${a.label}; it overlaps the last chosen activity.`, { type: "timeline", activities, selected: [...selected], rejected: [...rejected], active: a.id, range: [0, Math.max(...activities.map((x) => x.end), 10)] }, { overlap: "yes" }, "eliminated"));
      }
    });
    return frames;
  },
};

const liveFloydWarshall = {
  ...floydWarshall,
  code:
`def floyd_warshall(weight: list[list[float]]) -> list[list[float]]:
    n = len(weight)
    dist = [row.copy() for row in weight]
    for k in range(n):
        for i in range(n):
            for j in range(n):
                dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j])
    return dist`,
  sizeRange: { min: 3, max: 7, default: 6 },
  defaultData(size = 6) { return shuffledRange(size, 73); },
  run(input) {
    const values = demoValues(input, 6, 4);
    const n = values.length;
    const inf = 999;
    const dist = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => i === j ? 0 : (((values[i] + values[j] + i) % 3 === 0) ? inf : 1 + ((values[i] + values[j]) % 9))));
    const rows = range(n).map((i) => String.fromCharCode(97 + i));
    const fmt = (m) => m.map((row) => row.map((v) => v >= inf ? "∞" : v));
    const frames = [liveTopicFrame(3, "Build the weight matrix from the current shuffled input.", tableVisual(rows, rows, fmt(dist), { active: [0, Math.min(1, n - 1)] }), { vertices: n })];
    for (let k = 0; k < Math.min(n, 3); k++) {
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) dist[i][j] = Math.min(dist[i][j], dist[i][k] + dist[k][j]);
      }
      frames.push(liveTopicFrame(6, `Allow ${rows[k]} as an intermediate vertex.`, tableVisual(rows, rows, fmt(dist), { rowHighlight: k, colHighlight: k, active: [0, Math.min(n - 1, k + 1)] }), { k: rows[k] }, "compare"));
    }
    for (let k = Math.min(n, 3); k < n; k++) {
      for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) dist[i][j] = Math.min(dist[i][j], dist[i][k] + dist[k][j]);
    }
    frames.push(liveTopicFrame(7, "After every k, the matrix contains all-pairs shortest path distances.", tableVisual(rows, rows, fmt(dist), { active: [n - 1, 0] }), { complete: "APSP" }, "found"));
    return frames;
  },
};

// (liveMaxFlow removed: superseded by step-traced maxFlow.)

A.register("dpTable", dpTable);
A.register("activitySelection", activitySelection);
A.register("floydWarshall", floydWarshall);
A.register("liveDPTable", liveDPTable);
A.register("liveActivitySelection", liveActivitySelection);
A.register("liveFloydWarshall", liveFloydWarshall);
})();
