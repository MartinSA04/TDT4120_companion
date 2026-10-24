/**
 * Bellman-Ford trace for <Stepper>, driving the block `bellman-ford-kode` in
 * modul 11 «Korteste vei fra én til alle». The input is the map in _kart.js
 * with kWh as weights, from s = 1, and an order of the 14 edges. The first
 * order lists the edges by tail, from 6 down to 1, so the estimates need
 * three rounds; shuffling deals a new order.
 *
 * Stage: the map on top, the edge order below it as two rows of cells. The
 * cell of the edge (u, v) being relaxed is in the accent and u is ringed, and
 * a cell turns gray when its edge lowered an estimate in the round so far. Nodes: white = ∞,
 * gray = finite estimate; the edge (v.π, v) has a band.
 *
 * Block lines count the header as line 1, so code line k is block line k + 1.
 *
 * Colours are framework tokens only, so frames re-theme on the light/dark
 * toggle without the module knowing which theme is active.
 */
import { EDGE, FONT, NODE, esc, shuffle, wrapSvg } from "./_graf.js";
import { STROM, fmt, kartSvg, layout, term } from "./_kart.js";

const S = 1;
let calls = 0;

const byTail = [...STROM.edges].sort((a, b) => b.from - a.from || b.to - a.to);

export default {
  defaultData() {
    return calls++ === 0 ? byTail : shuffle(STROM.edges);
  },

  run(order) {
    const ids = STROM.nodes.map((n) => n.id);
    const d = new Map(ids.map((x) => [x, Infinity]));
    const pi = new Map();
    const frames = [];
    let lowered = new Set();
    const snap = (line, desc, extra = {}) =>
      frames.push({
        order,
        line,
        desc,
        d: new Map(d),
        pi: new Map(pi),
        lowered: new Set(lowered),
        cur: extra.cur ?? null,
        hot: extra.hot ?? null,
        vars: extra.vars,
      });

    d.set(S, 0);
    snap(2, `Initialize-Single-Source: s.d = 0 for startnoden ${S} og v.d = ∞ for de andre.`);
    const n = ids.length;
    for (let i = 1; i <= n - 1; i++) {
      lowered = new Set();
      let changed = 0;
      order.forEach((e, k) => {
        const du = d.get(e.from);
        const vars = { i, u: e.from, v: e.to };
        if (du + e.w < d.get(e.to)) {
          const old = d.get(e.to);
          d.set(e.to, du + e.w);
          pi.set(e.to, e.from);
          lowered.add(k);
          changed++;
          snap([4, 5], `Runde ${i}: ${fmt(du)} + ${term(e.w)} = ${fmt(du + e.w)} er mindre enn ${fmt(old)}, så ${e.to}.d = ${fmt(du + e.w)} og ${e.to}.π = ${e.from}.`, { cur: k, hot: e.to, vars });
        } else if (du === Infinity) {
          snap([4, 5], `Runde ${i}: ${e.from}.d = ∞, så kanten (${e.from}, ${e.to}) kan ikke senke noe.`, { cur: k, vars });
        } else {
          snap([4, 5], `Runde ${i}: ${fmt(du)} + ${term(e.w)} = ${fmt(du + e.w)} er ikke mindre enn ${fmt(d.get(e.to))}, så ${e.to}.d står.`, { cur: k, vars });
        }
      });
      snap(3, changed ? `Runde ${i} er ferdig. ${changed} av kantene senket et estimat.` : `Runde ${i} er ferdig, og ingen kant senket noe estimat.`, { vars: { i } });
    }
    lowered = new Set();
    order.forEach((e, k) => {
      const du = d.get(e.from);
      snap([6, 7], `Sjekk: ${fmt(du)} + ${term(e.w)} er ikke mindre enn ${fmt(d.get(e.to))}, så (${e.from}, ${e.to}) kan ikke senke ${e.to}.d.`, { cur: k, vars: { u: e.from, v: e.to } });
    });
    snap(9, "Ingen kant kan senke et estimat, så grafen har ingen negativ sykel som kan nås fra startnoden. Bellman-Ford returnerer true.");
    return frames;
  },

  render(stage, f, { getSize }) {
    const { w, h } = getSize();
    if (w <= 0 || h <= 0) return;
    const cellH = 24;
    const rows = 2;
    const listH = rows * (cellH + 4) + 8;
    const { pos, r, axis } = layout(w, h - listH);
    const cur = f.cur != null ? f.order[f.cur] : null;
    let svg =
      axis +
      kartSvg(
        STROM,
        pos,
        r,
        (n) => ({
          text: fmt(f.d.get(n.id)),
          st: f.d.get(n.id) === Infinity ? NODE.white : NODE.gray,
          ring: cur != null && cur.from === n.id,
          hot: f.hot === n.id,
        }),
        (e) => {
          if (cur && e.from === cur.from && e.to === cur.to) return { st: EDGE.cur, color: "var(--accent)", bold: true };
          if (f.pi.get(e.to) === e.from) return { st: EDGE.tree, color: "var(--fg)", bold: true };
          return { st: EDGE.plain };
        },
      );
    // The edge order, seven to a row.
    const per = Math.ceil(f.order.length / rows);
    const cw = Math.min(46, (w - 8) / per);
    const x0 = (w - per * cw) / 2;
    f.order.forEach((e, k) => {
      const row = Math.floor(k / per);
      const x = x0 + (k % per) * cw;
      const y = h - listH + 6 + row * (cellH + 4);
      const isCur = k === f.cur;
      const st = f.lowered.has(k) ? NODE.gray : NODE.white;
      svg +=
        `<rect x="${(x + 1.5).toFixed(1)}" y="${y.toFixed(1)}" width="${(cw - 3).toFixed(1)}" height="${cellH}" rx="4" ` +
        `style="fill:${st.fill};stroke:${isCur ? "var(--accent)" : st.stroke}" stroke-width="${isCur ? 2.2 : 1}"/>` +
        `<text x="${(x + cw / 2).toFixed(1)}" y="${(y + cellH / 2 + 4).toFixed(1)}" text-anchor="middle" ` +
        `style="fill:${isCur ? "var(--accent)" : st.text};${FONT}${isCur ? ";font-weight:600" : ""}">${esc(`${e.from}→${e.to}`)}</text>`;
    });
    stage.innerHTML = wrapSvg(w, h, svg);
    stage.setAttribute("aria-label", f.desc);
  },
};
