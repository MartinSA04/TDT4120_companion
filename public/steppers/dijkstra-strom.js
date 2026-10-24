/**
 * Dijkstra on the map with kWh, for <Stepper> in modul 11 «Korteste vei fra
 * én til alle»: the same code as dijkstra.js, on weights where some are
 * negative. Extract-Min takes setra (3) at 1 kWh before skaret (2), so 3 is
 * in S when the route over skaret lowers 3.d to 0, and kaia (5), which got
 * its estimate through 3, keeps 0 where the least is −1. No shuffle: the
 * trace is about this one map.
 *
 * Colours are framework tokens only, so frames re-theme on the light/dark
 * toggle without the module knowing which theme is active.
 */
import { STROM, fmt } from "./_kart.js";
import { draw, trace } from "./dijkstra.js";

/** Least kWh from 1, by Bellman-Ford, to compare with at the end. */
function least() {
  const d = new Map(STROM.nodes.map((n) => [n.id, Infinity]));
  d.set(1, 0);
  for (let i = 1; i < STROM.nodes.length; i++) {
    for (const e of STROM.edges) if (d.get(e.from) + e.w < d.get(e.to)) d.set(e.to, d.get(e.from) + e.w);
  }
  return d;
}

export default {
  run() {
    const best = least();
    return trace(STROM, 1, (d) => {
      const wrong = STROM.nodes.filter((n) => d.get(n.id) !== best.get(n.id));
      return (
        "Q er tom. " +
        wrong.map((n) => `Dijkstra gir ${n.id}.d = ${fmt(d.get(n.id))}, men det minste strømforbruket fra 1 til ${n.id} er ${fmt(best.get(n.id))}.`).join(" ")
      );
    });
  },

  render: draw,
};
