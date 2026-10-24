/**
 * MST-Kruskal trace for <Stepper>, driving the block `kruskal-kode` in modul
 * 10 «Minimale spenntrær». The first input is the lecture's weighted graph
 * (the village of the module); shuffling deals new weights from 1 to 15 on
 * the same graph. Ties keep the graph's edge order (a stable sort).
 *
 * Stage: the graph on top, the edges sorted by weight in a row under it.
 * Edges in A have a band. The current edge is in the accent. When it joins
 * two trees, the river is drawn around the tree that u lies in: that cut
 * respects A, and the current edge is the shortest one across it. When both
 * ends are in one tree, the path between them in A is in the accent too: the
 * sykel the edge would close. In the row, a taken edge is filled, a skipped
 * one is struck through, and the current one is ringed.
 *
 * Block lines count the header as line 1, so code line k is block line k + 1.
 *
 * Colours are framework tokens only, so frames re-theme on the light/dark
 * toggle without the module knowing which theme is active.
 */
import { EDGE, FONT, NODE, VEKTET, esc, graphSvg, place, reweighted, wrapSvg } from "./_graf.js";
import { riverPath, riverSvg } from "./_elv.js";

const key = (e) => `${e.from}-${e.to}`;
let calls = 0;

/** The path from a to b along the edges in `A` (keys), as a list of edge keys. */
function pathIn(graph, A, a, b) {
  const adj = new Map(graph.nodes.map((n) => [n.id, []]));
  for (const e of graph.edges) {
    if (!A.has(key(e))) continue;
    adj.get(e.from).push([e.to, key(e)]);
    adj.get(e.to).push([e.from, key(e)]);
  }
  const prev = new Map([[a, null]]);
  const q = [a];
  while (q.length) {
    const x = q.shift();
    for (const [y, k] of adj.get(x)) {
      if (prev.has(y)) continue;
      prev.set(y, [x, k]);
      q.push(y);
    }
  }
  const out = [];
  for (let y = b; prev.get(y); y = prev.get(y)[0]) out.push(prev.get(y)[1]);
  return out;
}

export default {
  defaultData() {
    return calls++ === 0 ? VEKTET : reweighted(VEKTET);
  },

  run(graph) {
    const frames = [];
    const sorted = graph.edges.map((e, i) => ({ ...e, i })).sort((a, b) => a.w - b.w || a.i - b.i);
    const status = new Map(); // key → "taken" | "skipped"
    const A = new Set();
    const p = new Map(graph.nodes.map((n) => [n.id, n.id]));
    const find = (x) => (p.get(x) === x ? x : find(p.get(x)));
    const snap = (line, desc, extra = {}) =>
      frames.push({
        graph,
        sorted,
        line,
        desc,
        A: new Set(A),
        status: new Map(status),
        listed: extra.listed ?? true,
        cur: extra.cur ?? null,
        river: extra.river ?? null,
        cycle: extra.cycle ?? [],
        vars: extra.vars,
      });

    snap(2, "A = ∅: ingen kanter er valgt ennå.", { listed: false });
    snap([3, 4], "Make-Set(v) for hver node: hver node er en mengde for seg, og i skogen (V, A) er hver node et tre for seg.", { listed: false });
    snap([5, 6], "Kantene sorteres etter vekt. Raden under grafen viser rekkefølgen.");
    for (const e of sorted) {
      const k = key(e);
      const vars = { "(u, v)": `(${e.from}, ${e.to})`, "w(u, v)": e.w };
      const ru = find(e.from);
      const rv = find(e.to);
      if (ru !== rv) {
        const tree = graph.nodes.map((n) => n.id).filter((id) => find(id) === ru);
        snap(
          [7, 8],
          `${e.from} og ${e.to} er i ulike trær. Elva rundt treet til ${e.from} krysses ikke av noen kant i A, og (${e.from}, ${e.to}) er den korteste broen over den.`,
          { cur: e, river: tree, vars },
        );
        A.add(k);
        status.set(k, "taken");
        p.set(ru, rv);
        snap([9, 10], `(${e.from}, ${e.to}) legges til A, og Union slår sammen de to trærne.`, { cur: e, vars });
      } else {
        status.set(k, "skipped");
        snap(
          [7, 8],
          `${e.from} og ${e.to} er alt i samme tre. Kanten ville lukket en sykel med den markerte stien i A, så den hoppes over.`,
          { cur: e, cycle: pathIn(graph, A, e.from, e.to), vars },
        );
      }
    }
    const total = graph.edges.filter((e) => A.has(key(e))).reduce((s, e) => s + e.w, 0);
    snap(11, `Alle kantene er sett. A har ${A.size} kanter med vektsum ${total} og er et minimalt spenntre.`);
    return frames;
  },

  render(stage, f, { getSize }) {
    const { w, h } = getSize();
    const n = f.sorted.length;
    // One row of cells when they fit, else two.
    const rows = w / n >= 24 ? 1 : 2;
    const perRow = Math.ceil(n / rows);
    const cw = Math.min(30, (w - 16) / perRow);
    const ch = 24;
    const rowH = rows * (ch + 6) + 8;
    const gh = h - rowH;
    const r = Math.max(12, Math.min(15, w / 28));
    const pos = place(f.graph.nodes, { x: 0, y: 0, w, h: gh }, { l: r + 10, r: r + 10, t: r + 8, b: r + 8 });
    const cyc = new Set(f.cycle);
    const curK = f.cur ? key(f.cur) : null;
    let svg = "";
    if (f.river) {
      const inS = new Set(f.river);
      svg += riverSvg(riverPath(f.graph.nodes.map((x) => x.id), f.graph.edges, (id) => inS.has(id), pos, w, gh));
    }
    svg += graphSvg(
      f.graph,
      pos,
      () => ({ r }),
      () => ({ st: NODE.white }),
      (e) => {
        const k = key(e);
        if (k === curK) {
          return { st: EDGE.cur, weight: e.w, weightColor: "var(--accent)", weightBold: true };
        }
        if (cyc.has(k)) return { st: { ...EDGE.tree, stroke: "var(--accent)" }, weight: e.w, weightColor: "var(--accent)", weightBold: true };
        if (f.A.has(k)) return { st: EDGE.tree, weight: e.w, weightColor: "var(--fg)", weightBold: true };
        if (f.status.get(k) === "skipped") return { st: EDGE.faded, weight: e.w, weightColor: "var(--faint)" };
        return { st: EDGE.plain, weight: e.w };
      },
    );
    if (f.listed) {
      const x0 = (w - perRow * cw) / 2;
      f.sorted.forEach((e, i) => {
        const k = key(e);
        const cx = x0 + (i % perRow) * cw;
        const cy = gh + 4 + Math.floor(i / perRow) * (ch + 6);
        const s = f.status.get(k);
        const isCur = k === curK;
        const fill = s === "taken" ? "var(--fg)" : "var(--bg)";
        const text = s === "taken" ? "var(--bg)" : s === "skipped" ? "var(--faint)" : "var(--fg)";
        const stroke = isCur ? "var(--accent)" : s === "skipped" ? "var(--border)" : "var(--muted)";
        svg +=
          `<rect x="${(cx + 1.5).toFixed(1)}" y="${cy.toFixed(1)}" width="${(cw - 3).toFixed(1)}" height="${ch}" rx="4" ` +
          `style="fill:${fill};stroke:${stroke}" stroke-width="${isCur ? 2.4 : 1.1}"/>` +
          `<text x="${(cx + cw / 2).toFixed(1)}" y="${(cy + ch / 2 + 4).toFixed(1)}" text-anchor="middle" ` +
          `style="fill:${text};${FONT};font-weight:${isCur ? 600 : 400}">${esc(e.w)}</text>`;
        if (s === "skipped") {
          svg +=
            `<line x1="${(cx + 5).toFixed(1)}" y1="${(cy + ch - 5).toFixed(1)}" x2="${(cx + cw - 5).toFixed(1)}" y2="${(cy + 5).toFixed(1)}" ` +
            `style="stroke:var(--faint)" stroke-width="1"/>`;
        }
      });
    }
    stage.innerHTML = wrapSvg(w, h, svg);
    stage.setAttribute("aria-label", f.desc);
  },
};
