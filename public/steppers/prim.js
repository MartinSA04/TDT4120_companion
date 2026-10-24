/**
 * MST-Prim trace for <Stepper>, driving the block `prim-kode` in modul 10
 * «Minimale spenntrær». The first input is the lecture's weighted graph (the
 * village of the module) from r = 1; shuffling deals new weights from 1 to 15
 * on the same graph. Adjacency lists follow the graph's edge order, and
 * Extract-Min breaks a tie between equal keys by the lowest node number.
 *
 * Stage: the graph on top, Q under it sorted by key. Node colours as in the
 * lecture: white = key ∞, gray = in Q with a key, black (filled) = taken out
 * of Q. Q under the graph shows each node in it with its key. A black node's edge to
 * v.π has a band; a gray node's best edge to the tree, (v, v.π), is dashed.
 * The river runs around the black nodes, the tree's cut. In the step that
 * takes u out of Q, its edge to the tree is in the accent: the light edge
 * over that cut. While u's neighbours are checked, the edge (u, v) is in the
 * accent and u is ringed.
 *
 * Block lines count the header as line 1, so code line k is block line k + 1.
 *
 * Colours are framework tokens only, so frames re-theme on the light/dark
 * toggle without the module knowing which theme is active.
 */
import { EDGE, FONT, NODE, VEKTET, esc, graphSvg, place, reweighted, wrapSvg } from "./_graf.js";
import { riverPath, riverSvg } from "./_elv.js";

const R = 1;
let calls = 0;
const fmt = (k) => (k === Infinity ? "∞" : String(k));

export default {
  defaultData() {
    return calls++ === 0 ? VEKTET : reweighted(VEKTET);
  },

  run(graph) {
    const ids = graph.nodes.map((n) => n.id);
    const adj = new Map(ids.map((x) => [x, []]));
    for (const e of graph.edges) {
      adj.get(e.from).push([e.to, e.w]);
      adj.get(e.to).push([e.from, e.w]);
    }
    const keyOf = new Map(ids.map((x) => [x, Infinity]));
    const pi = new Map(ids.map((x) => [x, null]));
    const inQ = new Set();
    const black = new Set();
    const frames = [];
    const snap = (line, desc, extra = {}) =>
      frames.push({
        graph,
        line,
        desc,
        key: new Map(keyOf),
        pi: new Map(pi),
        inQ: new Set(inQ),
        black: new Set(black),
        u: extra.u ?? null,
        v: extra.v ?? null,
        light: extra.light ?? null,
        river: extra.river ?? false,
        changed: extra.changed ?? null,
        vars: extra.vars,
      });

    snap([2, 3, 4], "Alle nodene får u.key = ∞ og u.π = nil: ingen kant til treet er funnet ennå.");
    keyOf.set(R, 0);
    snap(5, `r.key = 0, så startnoden ${R} blir den første som tas ut.`, { changed: R });
    for (const x of ids) inQ.add(x);
    snap([6, 7, 8], "Alle nodene settes inn i min-prioritetskøen Q, med nøkkelen sin som prioritet.");
    while (inQ.size) {
      let u = null;
      for (const x of [...inQ].sort((a, b) => a - b)) if (u == null || keyOf.get(x) < keyOf.get(u)) u = x;
      const pu = pi.get(u);
      if (pu == null) {
        snap([9, 10], `Extract-Min(Q) gir startnoden ${u}, med nøkkel 0.`, { u, vars: { u } });
      } else {
        snap(
          [9, 10],
          `Extract-Min(Q) gir ${u}, med nøkkel ${keyOf.get(u)}. Kanten (${u}, ${pu}) er den korteste broen over elva rundt treet.`,
          { u, light: [u, pu], river: true, vars: { u } },
        );
      }
      inQ.delete(u);
      black.add(u);
      for (const [v, wt] of adj.get(u)) {
        const vars = { u, v, "w(u, v)": wt, "v.key": fmt(keyOf.get(v)) };
        if (!inQ.has(v)) {
          snap([11, 12], `${v} er alt tatt ut av Q og er i treet.`, { u, v, vars });
        } else if (wt < keyOf.get(v)) {
          keyOf.set(v, wt);
          pi.set(v, u);
          snap(
            [12, 13, 14, 15],
            `w(${u}, ${v}) = ${wt} er mindre enn nøkkelen til ${v}. Nå er v.π = ${u} og v.key = ${wt}, og Decrease-Key flytter ${v} fram i Q.`,
            { u, v, changed: v, vars: { ...vars, "v.key": wt } },
          );
        } else {
          snap([11, 12], `w(${u}, ${v}) = ${wt} er ikke mindre enn nøkkelen ${keyOf.get(v)}, så ${v} beholder kanten den har.`, { u, v, vars });
        }
      }
    }
    const total = ids.filter((x) => pi.get(x) != null).reduce((s, x) => s + keyOf.get(x), 0);
    snap(9, `Q er tom. Kantene (v, v.π) er et minimalt spenntre med vektsum ${total}.`);
    return frames;
  },

  render(stage, f, { getSize }) {
    const { w, h } = getSize();
    const ids = f.graph.nodes.map((n) => n.id);
    const cellH = 34;
    const gh = h - cellH - 14;
    const r = Math.max(12, Math.min(15, w / 28));
    const pos = place(f.graph.nodes, { x: 0, y: 0, w, h: gh }, { l: r + 12, r: r + 12, t: r + 10, b: r + 10 });
    const same = (e, a, b) => (e.from === a && e.to === b) || (e.from === b && e.to === a);
    let svg = "";
    if (f.river && f.black.size && f.black.size < ids.length) {
      svg += riverSvg(riverPath(ids, f.graph.edges, (id) => f.black.has(id), pos, w, gh));
    }
    const colour = (x) => (f.black.has(x) ? "black" : f.inQ.has(x) && f.key.get(x) < Infinity ? "gray" : "white");
    svg += graphSvg(
      f.graph,
      pos,
      () => ({ r }),
      (n) => ({ st: NODE[colour(n.id)], ring: n.id === f.u }),
      (e) => {
        if ((f.light && same(e, ...f.light)) || (f.u != null && f.v != null && same(e, f.u, f.v)))
          return { st: EDGE.cur, weight: e.w, weightColor: "var(--accent)", weightBold: true };
        const tree = [...f.black].some((x) => f.pi.get(x) != null && same(e, x, f.pi.get(x)));
        if (tree) return { st: EDGE.tree, weight: e.w, weightColor: "var(--fg)", weightBold: true };
        const best = [...f.inQ].some((x) => f.pi.get(x) != null && same(e, x, f.pi.get(x)));
        if (best) return { st: EDGE.other, weight: e.w };
        return { st: EDGE.plain, weight: e.w };
      },
    );
    // Q, sorted by key (ties by node number).
    const q = [...f.inQ].sort((a, b) => f.key.get(a) - f.key.get(b) || a - b);
    const cw = Math.min(38, (w - 40) / ids.length);
    const y0 = gh + 8;
    svg +=
      `<text x="8" y="${(y0 + cellH / 2 + 4).toFixed(1)}" style="fill:var(--muted);${FONT}">Q</text>`;
    const x0 = 24;
    q.forEach((x, i) => {
      const cx = x0 + i * cw;
      const st = NODE[colour(x)];
      const hot = x === f.changed;
      svg +=
        `<rect x="${(cx + 1.5).toFixed(1)}" y="${y0}" width="${(cw - 3).toFixed(1)}" height="${cellH}" rx="4" ` +
        `style="fill:${st.fill};stroke:${hot ? "var(--accent)" : st.stroke}" stroke-width="${hot ? 2.2 : 1.1}"/>` +
        `<text x="${(cx + cw / 2).toFixed(1)}" y="${y0 + 14}" text-anchor="middle" style="fill:${st.text};${FONT};font-weight:600">${esc(x)}</text>` +
        `<text x="${(cx + cw / 2).toFixed(1)}" y="${y0 + 28}" text-anchor="middle" style="fill:${hot ? "var(--accent)" : st.text};${FONT}">${esc(fmt(f.key.get(x)))}</text>`;
    });
    stage.innerHTML = wrapSvg(w, h, svg);
    stage.setAttribute("aria-label", f.desc);
  },
};
