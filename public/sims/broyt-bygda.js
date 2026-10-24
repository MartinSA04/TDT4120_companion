/**
 * «Brøyt bygda» for TDT4120 modul 10 «Minimale spenntrær».
 *
 * The one idea: the cheapest set of strekninger that lets every farm reach
 * every other has no sykel, so it is a spanning tree. A strekning between
 * two farms that already reach each other closes a sykel, and any strekning
 * on that sykel can go again without cutting anyone off.
 *
 * System: the lecture's weighted graph as nine farms (1–9) and fourteen
 * strekninger with their length in km. The reader taps a strekning to plow it
 * and taps it again to leave it unplowed.
 *
 * Drawing: a plowed strekning is a line with a band, in ink, or in the accent
 * when it lies on a sykel of plowed strekninger. Readout: one
 * sentence with the plowed km and how many groups the farms hang together in.
 *
 * Contract: default-export init(api); host="dom", so api = { stage, controls,
 * getSize, onResize, signal }.
 */
import { EDGE, NODE, VEKTET, graphSvg, place, wrapSvg } from "../steppers/_graf.js";

const G = VEKTET;
const BEST = 37;
const key = (e) => `${e.from}-${e.to}`;

/** Union-find over the plowed strekninger: id → group root. */
function groups(plowed, skip = null) {
  const p = new Map(G.nodes.map((n) => [n.id, n.id]));
  const find = (x) => (p.get(x) === x ? x : find(p.get(x)));
  for (const e of G.edges) {
    if (!plowed.has(key(e)) || key(e) === skip) continue;
    p.set(find(e.from), find(e.to));
  }
  return find;
}

/** The plowed strekninger that lie on a sykel: their ends still meet without them. */
function onCycle(plowed) {
  const out = new Set();
  for (const e of G.edges) {
    if (!plowed.has(key(e))) continue;
    const find = groups(plowed, key(e));
    if (find(e.from) === find(e.to)) out.add(key(e));
  }
  return out;
}

export default function init({ stage, controls, getSize, onResize, signal }) {
  let plowed = new Set();

  const readout = document.createElement("div");
  readout.className = "sim-readout";
  const again = document.createElement("button");
  again.type = "button";
  again.className = "sim-btn";
  again.textContent = "Start på nytt";
  again.setAttribute("aria-label", "Fjern all brøyting og start på nytt");
  again.addEventListener(
    "click",
    () => {
      plowed = new Set();
      draw();
    },
    { signal },
  );
  controls.append(again, readout);

  let geo = null;
  function draw() {
    const { w, h } = getSize();
    if (w <= 0 || h <= 0) return;
    const r = Math.max(12, Math.min(16, w / 28));
    const pos = place(G.nodes, { x: 0, y: 0, w, h }, { l: r + 10, r: r + 10, t: r + 10, b: r + 10 });
    geo = { pos, r };
    const loop = onCycle(plowed);
    const svg = graphSvg(
      G,
      pos,
      () => ({ r }),
      () => ({ st: NODE.white }),
      (e) => {
        const k = key(e);
        if (loop.has(k)) return { st: { ...EDGE.tree, stroke: "var(--accent)" }, weight: e.w, weightColor: "var(--accent)", weightBold: true };
        if (plowed.has(k)) return { st: EDGE.tree, weight: e.w, weightColor: "var(--fg)", weightBold: true };
        return { st: EDGE.plain, weight: e.w };
      },
    );
    stage.innerHTML = wrapSvg(w, h, svg);

    const km = G.edges.filter((e) => plowed.has(key(e))).reduce((s, e) => s + e.w, 0);
    const find = groups(plowed);
    const k = new Set(G.nodes.map((n) => find(n.id))).size;
    let text = `Brøytet: <b>${km} km</b>. `;
    text += k === 1 ? "Alle gårdene henger sammen." : `Gårdene henger sammen i ${k} grupper.`;
    if (k === 1 && km === BEST) text += " Billigere går det ikke.";
    readout.innerHTML = text;
    stage.setAttribute(
      "aria-label",
      `Ni gårder og fjorten strekninger. ${plowed.size} strekninger er brøytet, ${km} km.` +
        (loop.size ? ` ${loop.size} brøytede strekninger ligger på en sykel.` : ""),
    );
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
      let best = null;
      let bd = Infinity;
      for (const e of G.edges) {
        const a = geo.pos.get(e.from);
        const b = geo.pos.get(e.to);
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const t = Math.max(0, Math.min(1, ((x - a.x) * dx + (y - a.y) * dy) / (dx * dx + dy * dy)));
        const d = Math.hypot(a.x + t * dx - x, a.y + t * dy - y);
        if (d < bd) {
          bd = d;
          best = e;
        }
      }
      if (!best || bd > 16) return;
      const k = key(best);
      if (plowed.has(k)) plowed.delete(k);
      else plowed.add(k);
      draw();
    },
    { signal },
  );

  onResize(draw);
  draw();
}
