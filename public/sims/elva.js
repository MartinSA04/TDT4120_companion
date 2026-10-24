/**
 * «Elva» for TDT4120 modul 10 «Minimale spenntrær».
 *
 * The one idea: Generic-MST. Split the farms in two by a river (a cut) that
 * no plowed strekning crosses, and plow the shortest strekning over the
 * river (the light edge). Whatever splits the reader picks, the plowed
 * strekninger end as a spanning tree of minimum total length.
 *
 * System: the lecture's weighted graph as nine farms and fourteen
 * strekninger (km). The reader taps a farm to move it to the other side of
 * the river. «Brøyt den korteste broen» plows the light edge; with several
 * equally short bridges it takes the first in the graph's edge order.
 * «Nye lengder» deals new lengths from 1 to 15 (ties allowed).
 *
 * Drawing: the river (steppers/_elv.js) runs between the two sides; the
 * light edge is in the accent; a plowed strekning has a band, and one that
 * crosses the river is in the accent (the cut does not respect A, and the
 * button is off). Readout: one sentence.
 *
 * Contract: default-export init(api); host="dom", so api = { stage, controls,
 * getSize, onResize, signal }.
 */
import { EDGE, NODE, VEKTET, graphSvg, place, reweighted, wrapSvg } from "../steppers/_graf.js";
import { riverPath, riverSvg } from "../steppers/_elv.js";

const key = (e) => `${e.from}-${e.to}`;
const START = [1, 2, 8];

/** Total weight of a minimum spanning tree (Kruskal). */
function mstWeight(G) {
  const p = new Map(G.nodes.map((n) => [n.id, n.id]));
  const find = (x) => (p.get(x) === x ? x : find(p.get(x)));
  let s = 0;
  for (const e of [...G.edges].sort((a, b) => a.w - b.w)) {
    const a = find(e.from);
    const b = find(e.to);
    if (a !== b) {
      p.set(a, b);
      s += e.w;
    }
  }
  return s;
}

export default function init({ stage, controls, getSize, onResize, signal }) {
  let G = VEKTET;
  let best = mstWeight(G);
  let S;
  let A;

  function reset() {
    S = new Set(START);
    A = new Set();
  }

  const crossing = (e) => S.has(e.from) !== S.has(e.to);

  /** The state the drawing and the button depend on. */
  function state() {
    const bad = G.edges.filter((e) => A.has(key(e)) && crossing(e));
    const bridges = G.edges.filter((e) => crossing(e) && !A.has(key(e)));
    const min = Math.min(...bridges.map((e) => e.w));
    const light = bad.length ? [] : bridges.filter((e) => e.w === min);
    const done = A.size === G.nodes.length - 1;
    return { bad, bridges, light, done };
  }

  const mk = (label, aria, fn) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "sim-btn";
    b.textContent = label;
    b.setAttribute("aria-label", aria);
    b.addEventListener("click", fn, { signal });
    return b;
  };
  const plow = mk("Brøyt den korteste broen", "Brøyt den korteste strekningen over elva", () => {
    const { light, done } = state();
    if (done || !light.length) return;
    A.add(key(light[0]));
    draw();
  });
  const again = mk("Start på nytt", "Fjern brøytingen og legg elva som i starten", () => {
    reset();
    draw();
  });
  const fresh = mk("Nye lengder", "Gi strekningene nye lengder og start på nytt", () => {
    G = reweighted(VEKTET);
    best = mstWeight(G);
    reset();
    draw();
  });
  const row = document.createElement("span");
  row.style.cssText = "display:flex;flex-wrap:wrap;gap:var(--space-2)";
  row.append(plow, again, fresh);
  const readout = document.createElement("div");
  readout.className = "sim-readout";
  controls.append(row, readout);

  let geo = null;
  function draw() {
    const { w, h } = getSize();
    if (w <= 0 || h <= 0) return;
    const r = Math.max(12, Math.min(16, w / 28));
    const pos = place(G.nodes, { x: 0, y: 0, w, h }, { l: r + 14, r: r + 14, t: r + 12, b: r + 12 });
    geo = { pos, r };
    const st = state();
    const lightKeys = new Set(st.light.map(key));
    const badKeys = new Set(st.bad.map(key));
    const river = riverSvg(riverPath(G.nodes.map((n) => n.id), G.edges, (id) => S.has(id), pos, w, h));
    const graph = graphSvg(
      G,
      pos,
      () => ({ r }),
      () => ({ st: NODE.white }),
      (e) => {
        const k = key(e);
        if (badKeys.has(k)) return { st: { ...EDGE.tree, stroke: "var(--accent)" }, weight: e.w, weightColor: "var(--accent)", weightBold: true };
        if (A.has(k)) return { st: EDGE.tree, weight: e.w, weightColor: "var(--fg)", weightBold: true };
        if (!st.done && lightKeys.has(k)) return { st: EDGE.cur, weight: e.w, weightColor: "var(--accent)", weightBold: true };
        return { st: EDGE.plain, weight: e.w };
      },
    );
    stage.innerHTML = wrapSvg(w, h, river + graph);

    const km = G.edges.filter((e) => A.has(key(e))).reduce((s, e) => s + e.w, 0);
    let text;
    if (st.done) text = `Alle gårdene henger sammen med <b>${km} km</b>, og billigere går det ikke.`;
    else if (st.bad.length) text = "En brøytet strekning går over elva.";
    else if (!st.bridges.length) text = "Alle gårdene ligger på samme side av elva.";
    else text = `Brøytet: <b>${km} km</b>.`;
    readout.innerHTML = text;
    const off = st.done || !st.light.length;
    plow.disabled = off;
    plow.setAttribute("aria-disabled", String(off));
    stage.setAttribute(
      "aria-label",
      `Ni gårder delt av ei elv: ${[...S].sort().join(", ") || "ingen"} på den ene siden. ${A.size} strekninger er brøytet, ${km} km.` +
        (st.light.length && !st.done ? ` Den korteste broen er ${st.light[0].w} km, mellom ${st.light[0].from} og ${st.light[0].to}.` : ""),
    );
    if (st.done && km !== best) console.warn("elva: tree is not minimal", km, best);
  }

  stage.style.cursor = "pointer";
  stage.addEventListener(
    "click",
    (ev) => {
      if (!geo) return;
      const box = stage.getBoundingClientRect();
      const { w, h } = getSize();
      const x = ((ev.clientX - box.left) / box.width) * w;
      const y = ((ev.clientY - box.top) / box.height) * h;
      let hit = null;
      let bd = Infinity;
      for (const n of G.nodes) {
        const p = geo.pos.get(n.id);
        const d = Math.hypot(p.x - x, p.y - y);
        if (d < bd) {
          bd = d;
          hit = n.id;
        }
      }
      if (hit == null || bd > geo.r * 1.9) return;
      if (S.has(hit)) S.delete(hit);
      else S.add(hit);
      draw();
    },
    { signal },
  );

  reset();
  onResize(draw);
  draw();
}
