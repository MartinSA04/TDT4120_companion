/**
 * Floyd-Warshall′ trace for <Stepper>, driving the block `fw-kode` in modul
 * 12 «Korteste vei fra alle til alle». One table D and the predecessor table
 * Π, as in the lecture. The input is a weighting of the nine edges of the
 * lecture's graph (GRAF in _alle-par.js); the first input is the lecture's
 * own weights, and shuffling deals new ones from −4 to 9 with no negative
 * cycle.
 *
 * Stage: the graph on top, D and Π side by side under it. Nodes 1..k are
 * half-filled: a path may pass through them. For the cell (i, j) being
 * checked, the path behind d_ij has a band, the path behind d_ik is in the
 * accent and the path behind d_kj in cyan; in D and Π the cell (i, j) is
 * ringed and (i, k) and (k, j) are outlined in the same colours. A value that
 * just changed is in the accent. An empty cell in Π is nil.
 *
 * Block lines count the header as line 1, so code line k is block line k + 1.
 *
 * Colours are framework tokens only, so frames re-theme on the light/dark
 * toggle without the module knowing which theme is active.
 */
import { EDGE, NODE, edgeGeom, edgeSvg, place, weightSvg, nodeSvg, wrapSvg } from "./_graf.js";
import { GRAF, HALF1, HALF2, fmt, matrixSvg, pathEdges, sub, term, weightMatrix } from "./_alle-par.js";

let calls = 0;

function negativeCycle(W) {
  const n = W.length;
  const D = W.map((r) => [...r]);
  for (let k = 0; k < n; k++) for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) if (D[i][k] + D[k][j] < D[i][j]) D[i][j] = D[i][k] + D[k][j];
  return D.some((r, i) => r[i] < 0);
}

export default {
  defaultData() {
    if (calls++ === 0) return GRAF.edges.map((e) => e.w);
    for (;;) {
      const ws = GRAF.edges.map(() => Math.floor(Math.random() * 14) - 4);
      const g = { ...GRAF, edges: GRAF.edges.map((e, t) => ({ ...e, w: ws[t] })) };
      if (!negativeCycle(weightMatrix(g))) return ws;
    }
  },

  run(ws) {
    const graph = { ...GRAF, edges: GRAF.edges.map((e, t) => ({ ...e, w: ws[t] })) };
    const n = graph.nodes.length;
    const D = weightMatrix(graph);
    const P = D.map((r, i) => r.map((w, j) => (i !== j && w < Infinity ? i + 1 : null)));
    const path = D.map((r, i) => r.map((w, j) => (i === j ? [i + 1] : w < Infinity ? [i + 1, j + 1] : null)));
    const frames = [];
    const snap = (line, desc, extra = {}) =>
      frames.push({
        graph,
        line,
        desc,
        D: D.map((r) => [...r]),
        P: P.map((r) => [...r]),
        path: path.map((r) => [...r]),
        k: extra.k ?? 0,
        i: extra.i ?? null,
        j: extra.j ?? null,
        hot: extra.hot ?? false,
        vars: extra.vars,
      });

    snap(2, "Linje 1: D = W, og πᵢⱼ = i for hver kant (i, j). En sti uten mellomnoder har høyst én kant.");
    for (let k = 1; k <= n; k++) {
      snap(3, `k = ${k}: nå får stiene også gå innom node ${k}.`, { k, vars: { k } });
      for (let i = 1; i <= n; i++) {
        for (let j = 1; j <= n; j++) {
          const dij = D[i - 1][j - 1];
          const dik = D[i - 1][k - 1];
          const dkj = D[k - 1][j - 1];
          const via = dik + dkj;
          const vars = { k, i, j };
          const at = { k, i, j, vars };
          const sum = `d${sub(i, k)} + d${sub(k, j)} = ${fmt(dik)} + ${term(dkj)}`;
          if (via < dij) {
            D[i - 1][j - 1] = via;
            P[i - 1][j - 1] = P[k - 1][j - 1];
            path[i - 1][j - 1] = [...path[i - 1][k - 1], ...path[k - 1][j - 1].slice(1)];
            snap(
              [6, 7, 8],
              `${sum} = ${fmt(via)} er mindre enn d${sub(i, j)} = ${fmt(dij)}. Da blir d${sub(i, j)} = ${fmt(via)} og π${sub(i, j)} = π${sub(k, j)} = ${P[k - 1][j - 1]}.`,
              { ...at, hot: true },
            );
          } else if (i === k) {
            snap(6, `i = k, så d${sub(k, k)} + d${sub(k, j)} = 0 + d${sub(k, j)}, som er d${sub(i, j)} selv. Ingenting endres.`, at);
          } else if (j === k) {
            snap(6, `j = k, så d${sub(i, k)} + d${sub(k, k)} = d${sub(i, k)} + 0, som er d${sub(i, j)} selv. Ingenting endres.`, at);
          } else if (via === Infinity) {
            snap(6, `${sum} = ∞, så d${sub(i, j)} = ${fmt(dij)} står.`, at);
          } else {
            snap(6, `${sum} = ${fmt(via)} er ikke mindre enn d${sub(i, j)} = ${fmt(dij)}, så d${sub(i, j)} står.`, at);
          }
        }
      }
    }
    snap(9, "Ferdig: dᵢⱼ er vekten til en korteste vei fra i til j, og πᵢⱼ er noden foran j på den.", { k: n + 1 });
    return frames;
  },

  render(stage, f, { getSize }) {
    const { w, h } = getSize();
    if (w <= 0 || h <= 0) return;
    const n = f.graph.nodes.length;

    // ── matrices ──────────────────────────────────────────────────────────
    const gap = 14;
    const head = 18;
    const cw = Math.min(40, (w - gap - 2 * head - 4) / (2 * n));
    const ch = Math.min(26, cw * 0.9);
    const mw = head + n * cw;
    const mh = (n + 1) * ch;
    const x0 = (w - (2 * mw + gap)) / 2;
    const y0 = h - mh - 4;
    const { i: ci, j: cj, k } = f;
    const active = ci != null;
    const styleFor = (hotText) => (i, j) => {
      const st = {};
      if (i === j) st.color = "var(--faint)";
      if (active && i === ci && j === cj) {
        Object.assign(st, { stroke: "var(--fg)", wdt: 2.4 });
        if (f.hot) Object.assign(st, { color: "var(--accent)", bold: true });
      } else if (active && i === ci && j === k && ci !== k) Object.assign(st, { stroke: HALF1, wdt: 2 });
      else if (active && i === k && j === cj && cj !== k) Object.assign(st, { stroke: HALF2, wdt: 2 });
      return hotText ? st : st;
    };
    const dm = matrixSvg(x0, y0, cw, ch, n, (i, j) => fmt(f.D[i - 1][j - 1]), styleFor(true), { title: "D", head });
    const pm = matrixSvg(x0 + mw + gap, y0, cw, ch, n, (i, j) => (f.P[i - 1][j - 1] ?? ""), styleFor(true), { title: "Π", head });

    // ── graph ─────────────────────────────────────────────────────────────
    const r = Math.max(12, Math.min(15, w / 28));
    const pos = place(f.graph.nodes, { x: 0, y: 0, w, h: y0 - 8 }, { l: r + 26, r: r + 26, t: r + 6, b: r + 6 });
    const pij = active && f.D[ci - 1][cj - 1] < Infinity ? pathEdges(f.path[ci - 1][cj - 1]) : new Set();
    const both = active && ci !== k && cj !== k && f.D[ci - 1][k - 1] < Infinity && f.D[k - 1][cj - 1] < Infinity;
    const pik = both ? pathEdges(f.path[ci - 1][k - 1]) : new Set();
    const pkj = both ? pathEdges(f.path[k - 1][cj - 1]) : new Set();
    let s = "";
    let weights = "";
    const order = [...f.graph.edges].sort((a, b) => rank(a) - rank(b));
    function rank(e) {
      const key = `${e.from}-${e.to}`;
      return pik.has(key) || pkj.has(key) ? 2 : pij.has(key) ? 1 : 0;
    }
    for (const e of order) {
      const key = `${e.from}-${e.to}`;
      const g = edgeGeom(pos.get(e.from), pos.get(e.to), { r }, { r }, 0);
      const band = pij.has(key);
      let st = band ? EDGE.tree : EDGE.plain;
      let col = band ? "var(--fg)" : "var(--muted)";
      if (pik.has(key)) {
        st = { stroke: HALF1, wdt: 2.4, band };
        col = HALF1;
      } else if (pkj.has(key)) {
        st = { stroke: HALF2, wdt: 2.4, band };
        col = HALF2;
      }
      s += edgeSvg(g, st);
      weights += weightSvg(g, fmt(e.w), col, st !== EDGE.plain);
    }
    s += weights;
    for (const node of f.graph.nodes) {
      const st = node.id <= k ? NODE.gray : NODE.white;
      const ring = active && (node.id === ci || node.id === cj);
      s += nodeSvg(pos.get(node.id), { r }, node.id, st, false);
      if (ring) {
        const p = pos.get(node.id);
        s +=
          `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${(r + 4).toFixed(1)}" ` +
          `style="fill:none;stroke:var(--fg)" stroke-width="2"/>`;
      }
    }

    stage.innerHTML = wrapSvg(w, h, s + dm.svg + pm.svg);
    stage.setAttribute("aria-label", f.desc);
  },
};
