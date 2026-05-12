/* global window */
// =====================================================================
// NP & reductions — polynomial-time reduction sketches on the reduction view.
//   npReductions      viewKind "reduction"  (reference)
//   liveNPReductions  viewKind "reduction"  Subset-Sum ≤p Knapsack, catalogue entry
// =====================================================================
// See js/algorithms/_shared.js for the Frame contract.
(function () {
const A = window.AlgViz.A;
const { mulberry32, shuffledRange, range, fallbackDataForVisual, topicFrame, node, edge, graphVisual, tableVisual, clamp, demoValues, shortList, roleMap, completeTreeNodes, completeTreeEdges, circleNodes, graphEdgeKey, makeIntervalTree, liveTopicFrame, graphFromValues } = window.AlgViz.A;
const npReductions = {
  id: "np-reductions",
  name: "NP Reductions",
  description:
    "To show X is hard, transform instances of a known hard problem into instances of X.",
  explanation: {
    no: "NP-reduksjonsvisualiseringen holder retningen tydelig: kjent vanskelig problem inn, problemet du undersøker ut.",
    en: "The NP-reduction visualization keeps the direction clear: known hard problem in, your target problem out.",
  },
  courseRefs: ["l13", "l14"],
  conceptIds: ["np-completeness", "karp-reduction", "reduction"],
  learningGoalIds: ["M6", "M7", "M9", "M10", "N1", "N2", "N6"],
  viewKind: "reduction",
  filename: "complexity/reduction.py",
  complexities: { best: "poly", avg: "poly", worst: "poly", space: "poly" },
  code:
`# To prove X is NP-hard:
known_hard_instance = y
x = transform(y)       # polynomial time
answer_y = oracle_X(x)
return answer_y

# Direction: known hard problem <=p X`,
  defaultData() { return range(8); },
  run() {
    return [
      topicFrame(1, "Pick a known NP-complete problem, such as 3-CNF-SAT.", { type: "reduction", boxes: [
        { id: "known", title: "Known hard", body: "3-CNF-SAT instance", role: "focus" },
        { id: "target", title: "Target X", body: "problem to classify" },
      ], arrows: [] }, { source: "3-CNF-SAT" }),
      topicFrame(3, "Build a polynomial transformation from the known instance to an instance of X.", { type: "reduction", boxes: [
        { id: "known", title: "Known hard", body: "formula φ", role: "focus" },
        { id: "transform", title: "Polynomial transform", body: "f(φ)", role: "pivot" },
        { id: "target", title: "Target X", body: "instance f(φ)" },
      ], arrows: [["known", "transform", "poly"], ["transform", "target", "instance"]] }, { time: "poly" }, "pivot"),
      topicFrame(4, "Show answer preservation: φ is satisfiable iff f(φ) is a yes-instance of X.", { type: "reduction", boxes: [
        { id: "known", title: "3-CNF-SAT", body: "yes/no", role: "focus" },
        { id: "target", title: "X", body: "same yes/no", role: "found" },
      ], arrows: [["known", "target", "iff"]] }, { preserves: "yes/no" }, "found"),
      topicFrame(6, "If X had a polynomial algorithm, this pipeline would solve the known hard problem in polynomial time.", { type: "reduction", boxes: [
        { id: "known", title: "Known hard", body: "would become easy", role: "swap" },
        { id: "target", title: "Algorithm for X", body: "hypothetical poly solver", role: "pivot" },
      ], arrows: [["known", "target", "reduce to"], ["target", "known", "solve indirectly"]] }, { implication: "too good" }, "compare"),
      topicFrame(6, "Therefore X is NP-hard. If X is also in NP, then X is NP-complete.", { type: "reduction", boxes: [
        { id: "hard", title: "NP-hard", body: "all NP reduces to X", role: "found" },
        { id: "inNP", title: "in NP", body: "solutions verifiable", role: "found" },
        { id: "npc", title: "NP-complete", body: "hard + in NP", role: "found" },
      ], arrows: [["hard", "npc", "+"], ["inNP", "npc", "+"]] }, { result: "NPC" }, "found"),
    ];
  },
};

const liveNPReductions = {
  ...npReductions,
  code:
`def subset_sum_to_knapsack(nums: list[int], target: int) -> tuple[list[int], list[int], int, int]:
    weights = nums.copy()
    values = nums.copy()
    capacity = target
    required_value = target
    return weights, values, capacity, required_value

def answer_preserved(nums: list[int], target: int, chosen: list[int]) -> bool:
    subset_yes = sum(chosen) == target
    weights, values, capacity, required_value = subset_sum_to_knapsack(nums, target)
    knapsack_yes = sum(chosen) <= capacity and sum(chosen) >= required_value
    return subset_yes == knapsack_yes`,
  sizeRange: { min: 4, max: 12, default: 8 },
  defaultData(size = 8) { return shuffledRange(size, 83); },
  run(input) {
    const nums = demoValues(input, 8, 4).map((v) => 1 + (v % 12));
    const target = Math.max(3, Math.floor(nums.reduce((a, b) => a + b, 0) / 2));
    const instance = `[${nums.join(", ")}], target=${target}`;
    return [
      liveTopicFrame(1, "Start with a concrete Subset Sum instance generated from the current input.", { type: "reduction", boxes: [
        { id: "known", title: "Subset Sum", body: instance, role: "focus" },
        { id: "target", title: "Knapsack decision", body: "not built yet" },
      ], arrows: [] }, { n: nums.length, target }),
      liveTopicFrame(2, "Map every number to both a weight and a value.", { type: "reduction", boxes: [
        { id: "known", title: "Subset Sum", body: instance, role: "focus" },
        { id: "transform", title: "Polynomial transform", body: "weights=nums, values=nums", role: "pivot" },
        { id: "target", title: "Knapsack", body: `capacity=${target}, required=${target}` },
      ], arrows: [["known", "transform", "O(n)"], ["transform", "target", "instance"]] }, { time: "O(n)" }, "pivot"),
      liveTopicFrame(9, "A chosen subset sums to target exactly when the constructed knapsack reaches required value within capacity.", { type: "reduction", boxes: [
        { id: "known", title: "Subset Sum yes", body: `sum(chosen) = ${target}`, role: "found" },
        { id: "target", title: "Knapsack yes", body: `weight <= ${target}, value >= ${target}`, role: "found" },
      ], arrows: [["known", "target", "iff"]] }, { preserves: "yes/no" }, "found"),
    ];
  },
};

A.register("npReductions", npReductions);
A.register("liveNPReductions", liveNPReductions);
})();
