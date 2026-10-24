/**
 * Dijkstra trace for <Stepper>, driving the block `dijkstra-kode` in modul
 * 11 «Korteste vei fra én til alle». The first input is the map in _kart.js
 * with the road lengths in km, from s = 1; shuffling deals new lengths from
 * 1 to 9 on the same roads. Each road can be driven both ways, so Adj[u]
 * holds every neighbour of u, in increasing number, and Extract-Min breaks a
 * tie between equal estimates by the lowest node number.
 *
 * Stage: the map on top, Q under it sorted by estimate. Node colours as in
 * the lecture: white = estimate ∞, gray = an estimate, filled = finished (in
 * S, with its out-edges relaxed). The edge (v.π, v) has a band; the edge
 * being relaxed is in the accent and u is ringed.
 *
 * `trace` and `draw` are also used by dijkstra-strom.js, which runs the same
 * code on the map with kWh, where it goes wrong.
 *
 * Block lines count the header as line 1, so code line k is block line k + 1.
 *
 * Colours are framework tokens only, so frames re-theme on the light/dark
 * toggle without the module knowing which theme is active.
 */
import { EDGE, FONT, NODE, esc, wrapSvg } from "./_graf.js";
import { KM, fmt, kartSvg, layout, term } from "./_kart.js";

const S = 1;
let calls = 0;

/** Out-edges of u as [v, w], in increasing v; an undirected graph has both ways. */
function adjacency(graph) {
  const adj = new Map(graph.nodes.map((n) => [n.id, []]));
  for (const e of graph.edges) {
    adj.get(e.from).push([e.to, e.w]);
    if (graph.undirected) adj.get(e.to).push([e.from, e.w]);
  }
  for (const l of adj.values()) l.sort((a, b) => a[0] - b[0]);
  return adj;
}

/**
 * Frames of Dijkstra(G, w, s). When Relax lowers the estimate of a node that
 * is already in S, the step says so (it only happens with negative weights).
 */
export function trace(graph, s, last) {
  const ids = graph.nodes.map((n) => n.id);
  const adj = adjacency(graph);
  const d = new Map(ids.map((x) => [x, Infinity]));
  const pi = new Map();
  const inQ = new Set();
  const done = new Set();
  const frames = [];
  const snap = (line, desc, extra = {}) =>
    frames.push({
      graph,
      line,
      desc,
      d: new Map(d),
      pi: new Map(pi),
      inQ: new Set(inQ),
      done: new Set(done),
      u: extra.u ?? null,
      v: extra.v ?? null,
      hot: extra.hot ?? null,
      vars: extra.vars,
    });

  d.set(s, 0);
  snap(2, `Initialize-Single-Source: s.d = 0 for startnoden ${s} og v.d = ∞ for de andre.`);
  snap([3, 4], "S og Q er tomme.");
  for (const x of ids) inQ.add(x);
  snap([5, 6], "Alle nodene settes inn i min-prioritetskøen Q, med estimatet som prioritet.");
  while (inQ.size) {
    let u = null;
    for (const x of [...inQ].sort((a, b) => a - b)) if (u == null || d.get(x) < d.get(u)) u = x;
    inQ.delete(u);
    snap([7, 8], `Extract-Min(Q) gir ${u}, med det laveste estimatet i Q: ${fmt(d.get(u))}.`, { u, vars: { u } });
    done.add(u);
    snap(9, `${u} legges i S.`, { u, vars: { u } });
    for (const [v, wt] of adj.get(u)) {
      const vars = { u, v };
      const du = d.get(u);
      if (du + wt < d.get(v)) {
        const old = d.get(v);
        d.set(v, du + wt);
        pi.set(v, u);
        if (inQ.has(v)) {
          snap([10, 11, 12, 13], `${fmt(du)} + ${term(wt)} = ${fmt(du + wt)} er mindre enn ${fmt(old)}, så ${v}.d = ${fmt(du + wt)} og ${v}.π = ${u}, og Decrease-Key flytter ${v} fram i Q.`, { u, v, hot: v, vars });
        } else {
          const after = ids.filter((x) => pi.get(x) === v);
          snap(
            [10, 11, 12],
            `${fmt(du)} + ${term(wt)} = ${fmt(du + wt)} er mindre enn ${fmt(old)}, så ${v}.d synker til ${fmt(du + wt)}. Men ${v} er alt i S og er ikke i Q.` +
              (after.length ? ` ${after.join(" og ")} fikk estimatet sitt gjennom ${v} og blir ikke oppdatert.` : ""),
            { u, v, hot: v, vars },
          );
        }
      } else {
        snap([10, 11], `${fmt(du)} + ${term(wt)} = ${fmt(du + wt)} er ikke mindre enn ${fmt(d.get(v))}, så ${v}.d står.`, { u, v, vars });
      }
    }
  }
  snap(7, last(d, pi));
  return frames;
}

/** One frame: the map with Q below it. */
export function draw(stage, f, { getSize }) {
  const { w, h } = getSize();
  if (w <= 0 || h <= 0) return;
  const cellH = 34;
  const { pos, r, axis } = layout(w, h - cellH - 12);
  // As in the lecture, u turns black when its out-edges are relaxed: while they are, it is ringed and gray.
  const colour = (x) => (f.done.has(x) && x !== f.u ? "black" : f.d.get(x) < Infinity ? "gray" : "white");
  const curEdge = (e) =>
    f.u != null && f.v != null && ((e.from === f.u && e.to === f.v) || (f.graph.undirected && e.from === f.v && e.to === f.u));
  const treeEdge = (e) => f.pi.get(e.to) === e.from || (f.graph.undirected && f.pi.get(e.from) === e.to);
  let svg =
    axis +
    kartSvg(
      f.graph,
      pos,
      r,
      (n) => ({ text: fmt(f.d.get(n.id)), st: NODE[colour(n.id)], ring: n.id === f.u, hot: n.id === f.hot }),
      (e) => {
        if (curEdge(e)) return { st: EDGE.cur, color: "var(--accent)", bold: true };
        if (treeEdge(e)) return { st: EDGE.tree, color: "var(--fg)", bold: true };
        return { st: EDGE.plain };
      },
    );
  const ids = f.graph.nodes.map((n) => n.id);
  const q = [...f.inQ].sort((a, b) => f.d.get(a) - f.d.get(b) || a - b);
  const cw = Math.min(40, (w - 40) / ids.length);
  const y0 = h - cellH - 4;
  svg += `<text x="8" y="${(y0 + cellH / 2 + 4).toFixed(1)}" style="fill:var(--muted);${FONT}">Q</text>`;
  q.forEach((x, i) => {
    const cx = 24 + i * cw;
    const st = NODE[colour(x)];
    const hot = x === f.hot;
    svg +=
      `<rect x="${(cx + 1.5).toFixed(1)}" y="${y0}" width="${(cw - 3).toFixed(1)}" height="${cellH}" rx="4" ` +
      `style="fill:${st.fill};stroke:${hot ? "var(--accent)" : st.stroke}" stroke-width="${hot ? 2.2 : 1.1}"/>` +
      `<text x="${(cx + cw / 2).toFixed(1)}" y="${y0 + 14}" text-anchor="middle" style="fill:${st.text};${FONT};font-weight:600">${esc(x)}</text>` +
      `<text x="${(cx + cw / 2).toFixed(1)}" y="${y0 + 28}" text-anchor="middle" style="fill:${hot ? "var(--accent)" : st.text};${FONT}">${esc(fmt(f.d.get(x)))}</text>`;
  });
  stage.innerHTML = wrapSvg(w, h, svg);
  stage.setAttribute("aria-label", f.desc);
}

export default {
  defaultData() {
    if (calls++ === 0) return KM;
    return { ...KM, edges: KM.edges.map((e) => ({ ...e, w: 1 + Math.floor(Math.random() * 9) })) };
  },

  run(graph) {
    return trace(graph, S, () => "Q er tom. Hver v.d er lengden av den korteste veien fra 1 til v, og kantene (v.π, v) danner et korteste-vei-tre.");
  },

  render: draw,
};
