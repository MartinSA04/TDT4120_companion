/**
 * Dag-Shortest-Paths trace for <Stepper>, driving the block `dag-kode` in
 * modul 11 «Korteste vei fra én til alle». The first input is the lecture's
 * acyclic graph (the textbook's figure, with r, s, t, x, y, z numbered 1–6),
 * from s = 2; shuffling deals new weights from −3 to 9 on the same edges.
 *
 * Stage: the nodes in one row in topological order, 1 to 6 from the left, so
 * every edge points to the right. An edge between neighbours in the row is
 * straight; a longer one bends above or below the row. Each node shows its
 * estimate inside and its number outside. White = ∞, gray = finite
 * estimate, filled = its out-edges are relaxed. The edge (v.π, v) has a
 * band, the edge being relaxed is in the accent and u is ringed.
 *
 * Block lines count the header as line 1, so code line k is block line k + 1.
 *
 * Colours are framework tokens only, so frames re-theme on the light/dark
 * toggle without the module knowing which theme is active.
 */
import { EDGE, FONT, NODE, edgeGeom, edgeSvg, esc, weightSvg, wrapSvg } from "./_graf.js";
import { fmt, term } from "./_kart.js";

const S = 2;
let calls = 0;

/** [from, to, w, side]: side 0 = straight, +1 = below the row, −1 = above. */
const KANTER = [
  [1, 2, 5, 0], [1, 3, 3, 1], [2, 3, 2, 0], [2, 4, 6, -1], [3, 4, 7, 0],
  [3, 5, 4, 1], [3, 6, 2, -1], [4, 5, -1, 0], [4, 6, 1, 1], [5, 6, -2, 0],
];
const DAG = KANTER.map(([from, to, w, side]) => ({ from, to, w, side }));

export default {
  defaultData() {
    return calls++ === 0 ? DAG : DAG.map((e) => ({ ...e, w: -3 + Math.floor(Math.random() * 13) }));
  },

  run(edges) {
    const ids = [1, 2, 3, 4, 5, 6];
    const d = new Map(ids.map((x) => [x, Infinity]));
    const pi = new Map();
    const done = new Set();
    const frames = [];
    const snap = (line, desc, extra = {}) =>
      frames.push({
        edges,
        line,
        desc,
        d: new Map(d),
        pi: new Map(pi),
        done: new Set(done),
        u: extra.u ?? null,
        v: extra.v ?? null,
        hot: extra.hot ?? null,
        vars: extra.vars,
      });

    snap(2, "Grafen er sortert topologisk: hver kant går fra venstre mot høyre, og nodene behandles fra 1 til 6.");
    d.set(S, 0);
    snap(3, `Initialize-Single-Source: s.d = 0 for startnoden ${S} og v.d = ∞ for de andre.`);
    for (const u of ids) {
      const out = edges.filter((e) => e.from === u);
      snap(4, d.get(u) === Infinity ? `${u} er neste i rekkefølgen. ${u}.d = ∞: ingen sti fra ${S} når hit.` : `${u} er neste i rekkefølgen, og ${u}.d = ${fmt(d.get(u))} er riktig, fordi alle kantene inn til ${u} er slakket.`, { u, vars: { u } });
      for (const e of out) {
        const v = e.to;
        const du = d.get(u);
        const vars = { u, v };
        if (du + e.w < d.get(v)) {
          const old = d.get(v);
          d.set(v, du + e.w);
          pi.set(v, u);
          snap([5, 6], `${fmt(du)} + ${term(e.w)} = ${fmt(du + e.w)} er mindre enn ${fmt(old)}, så ${v}.d = ${fmt(du + e.w)} og ${v}.π = ${u}.`, { u, v, hot: v, vars });
        } else if (du === Infinity) {
          snap([5, 6], `${u}.d = ∞, så kanten (${u}, ${v}) kan ikke senke ${v}.d.`, { u, v, vars });
        } else {
          snap([5, 6], `${fmt(du)} + ${term(e.w)} = ${fmt(du + e.w)} er ikke mindre enn ${fmt(d.get(v))}, så ${v}.d står.`, { u, v, vars });
        }
      }
      done.add(u);
    }
    snap(4, "Alle nodene er behandlet. Hver v.d er avstanden fra 2, og hver kant er slakket én gang.");
    return frames;
  },

  render(stage, f, { getSize }) {
    const { w, h } = getSize();
    if (w <= 0 || h <= 0) return;
    const r = Math.max(12, Math.min(15, w / 26));
    const pad = r + 8;
    const gap = (w - 2 * pad) / 5;
    const y = h * 0.5;
    const pos = new Map([1, 2, 3, 4, 5, 6].map((id, i) => [id, { x: pad + i * gap, y }]));
    const cur = (e) => e.from === f.u && e.to === f.v;
    const styleOf = (e) =>
      cur(e) ? { st: EDGE.cur, color: "var(--accent)", bold: true }
      : f.pi.get(e.to) === e.from ? { st: EDGE.tree, color: "var(--fg)", bold: true }
      : { st: EDGE.plain, color: "var(--muted)", bold: false };
    const drawn = f.edges.map((e) => {
      const span = e.to - e.from;
      const bend = e.side * Math.min(90, 1.6 * gap);
      const g = edgeGeom(pos.get(e.from), pos.get(e.to), { r }, { r }, bend);
      // Weight: at the middle of a straight edge, at the outside of an arc.
      const lab = e.side === 0 ? { x: g.mid.x, y: g.mid.y - 13 } : { x: g.mid.x, y: g.mid.y + e.side * 9 };
      return { e, g, lab, ...styleOf(e) };
    });
    const rank = (x) => (x.st === EDGE.plain ? 0 : x.st === EDGE.cur ? 2 : 1);
    drawn.sort((a, b) => rank(a) - rank(b));
    let svg = "";
    let labels = "";
    for (const x of drawn) {
      svg += edgeSvg(x.g, x.st);
      labels += weightSvg({ mid: x.lab }, fmt(x.e.w), x.color, x.bold);
    }
    svg += labels;
    for (const [id, p] of pos) {
      const st = f.done.has(id) ? NODE.black : f.d.get(id) < Infinity ? NODE.gray : NODE.white;
      const hot = id === f.hot;
      if (id === f.u) {
        svg += `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${r + 4}" style="fill:none;stroke:var(--accent)" stroke-width="2.4"/>`;
      }
      svg +=
        `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${r}" style="fill:${st.fill};stroke:${hot ? "var(--accent)" : st.stroke}" stroke-width="${hot ? 2.2 : 1.4}"/>` +
        `<text x="${p.x.toFixed(1)}" y="${(p.y + 4).toFixed(1)}" text-anchor="middle" style="fill:${hot && st !== NODE.black ? "var(--accent)" : st.text};${FONT};font-weight:600">${esc(fmt(f.d.get(id)))}</text>` +
        `<text x="${p.x.toFixed(1)}" y="${(p.y + r + 13).toFixed(1)}" text-anchor="middle" style="fill:var(--muted);${FONT}">${id}</text>`;
    }
    stage.innerHTML = wrapSvg(w, h, svg);
    stage.setAttribute("aria-label", f.desc);
  },
};
