/**
 * «Strøm fra hytta» for TDT4120 modul 11 «Korteste vei fra én til alle».
 *
 * The one idea: an estimate v.d is the power use of a route already found,
 * so it only falls and never gets below the least possible. Trying one
 * stretch (u, v) lowers v.d when the route to u plus the stretch is better.
 * When no stretch can lower any estimate, every estimate is the least
 * possible, and the stretches that set them form a tree from the hut.
 *
 * System: the map in steppers/_kart.js, with kWh as weights. The hut (1)
 * starts at 0 and every other place at ∞. The reader taps a stretch to try
 * it. «Feil på kartet» changes the stretch from 6 to 5 to −2, so the round
 * trip between the quay and the shop gives power, and the estimates on it
 * can be lowered for ever.
 *
 * Drawing: as in _kart.js. The stretch last tried is in the accent; the
 * place whose estimate it lowered is ringed. The stretch that set each
 * place's estimate (v.π) has a band. Readout: one sentence, the number of
 * taps, and when no stretch can lower an estimate, that.
 *
 * Contract: default-export init(api); host="dom", so api = { stage, controls,
 * getSize, onResize, signal }.
 */
import { EDGE, NODE, wrapSvg } from "../steppers/_graf.js";
import { STROM, fmt, kartSvg, layout, nearestEdge } from "../steppers/_kart.js";

const S = 1;
const FEIL = { from: 6, to: 5, w: -2 };

export default function init({ stage, controls, getSize, onResize, signal }) {
  let feil = false;
  let graph = STROM;
  let d;
  let pi;
  let taps;
  let last;
  let lowered;

  function reset() {
    d = new Map(graph.nodes.map((n) => [n.id, Infinity]));
    d.set(S, 0);
    pi = new Map();
    taps = 0;
    last = null;
    lowered = false;
  }

  function setGraph() {
    graph = feil
      ? { ...STROM, edges: STROM.edges.map((e) => (e.from === FEIL.from && e.to === FEIL.to ? { ...e, w: FEIL.w } : e)) }
      : STROM;
  }

  const again = document.createElement("button");
  again.type = "button";
  again.className = "sim-btn";
  again.textContent = "Start på nytt";
  again.addEventListener(
    "click",
    () => {
      reset();
      draw();
    },
    { signal },
  );
  const wrong = document.createElement("button");
  wrong.type = "button";
  wrong.className = "sim-btn";
  wrong.setAttribute("aria-pressed", "false");
  wrong.textContent = "Feil på kartet";
  wrong.addEventListener(
    "click",
    () => {
      feil = !feil;
      wrong.setAttribute("aria-pressed", String(feil));
      setGraph();
      reset();
      draw();
    },
    { signal },
  );
  const readout = document.createElement("div");
  readout.className = "sim-readout";
  controls.append(again, wrong, readout);

  const same = (a, b) => a && b && a.from === b.from && a.to === b.to;
  let geo = null;

  function draw() {
    const { w, h } = getSize();
    if (w <= 0 || h <= 0) return;
    const { pos, r, axis } = layout(w, h);
    geo = { pos, r };
    const svg =
      axis +
      kartSvg(
        graph,
        pos,
        r,
        (n) => ({
          text: fmt(d.get(n.id)),
          st: d.get(n.id) === Infinity ? NODE.white : NODE.gray,
          ring: lowered && last && last.to === n.id,
          hot: lowered && last && last.to === n.id,
        }),
        (e) => {
          const wrongEdge = feil && e.from === FEIL.from && e.to === FEIL.to;
          if (same(e, last)) return { st: EDGE.cur, color: "var(--accent)", bold: true };
          if (pi.get(e.to) === e.from) return { st: EDGE.tree, color: "var(--fg)", bold: true };
          return { st: EDGE.plain, color: wrongEdge ? "var(--fg)" : "var(--muted)", bold: wrongEdge };
        },
      );
    stage.innerHTML = wrapSvg(w, h, svg);

    const done = graph.edges.every((e) => !(d.get(e.from) + e.w < d.get(e.to)));
    readout.textContent = `${taps} trykk.` + (done ? " Ingen strekning gir et lavere tall." : "");
    stage.setAttribute(
      "aria-label",
      "Seks steder og strømforbruket på strekningene mellom dem. Tallene i stedene er " +
        graph.nodes.map((n) => `${n.id}: ${fmt(d.get(n.id))}`).join(", ") +
        ".",
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
      const e = nearestEdge(graph, geo.pos, geo.r, x, y);
      if (!e) return;
      taps++;
      last = e;
      lowered = d.get(e.from) + e.w < d.get(e.to);
      if (lowered) {
        d.set(e.to, d.get(e.from) + e.w);
        pi.set(e.to, e.from);
      }
      draw();
    },
    { signal },
  );

  reset();
  onResize(draw);
  draw();
}
