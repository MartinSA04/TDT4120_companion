/**
 * «Vann fra kilden til sluket» for TDT4120 modul 13 «Maksimal flyt».
 *
 * The one idea: a flow is water sent along paths from the source. Sending
 * only along pipes with room can get stuck below the maximum. A path that goes
 * against a pipe carrying water turns that pipe down and frees room elsewhere,
 * and then the flow reaches the maximum. When no path is left, the nodes a
 * path can still reach are one side of a cut whose pipes out are full and
 * pipes in are empty, and the flow equals the cut's capacity.
 *
 * System: the lecture's flow network in steppers/_flytnett.js, as pipes from
 * the source 1 down to the sink 6. Capacities in litres per second.
 *
 * Controls: the path starts at 1. The pipes it can take next are outlined in
 * the accent with a faint arrow the way the path would go (none once no path
 * from 1 reaches 6): along a pipe with
 * room, or against a pipe that carries water. Tapping such a pipe (or the node
 * at its far end) extends the path. When the path reaches 6, «Send» sends the
 * smallest room on it. «Angre» takes back the last step, «Nullstill» empties
 * the pipes. One readout line says where the path is.
 *
 * Drawing: as in _flytnett.js. The path is accent arrows along the pipes, each
 * with its room (c − f with the pipe, f against it); the smallest is bold.
 * When no path from 1 reaches 6, the nodes a path can still reach are filled.
 *
 * Contract: default-export init(api); host="dom", so api = { stage, controls,
 * getSize, onResize, signal }.
 */
import { wrapSvg } from "../steppers/_graf.js";
import { NETT, TOKENS, bfs, cf, key, nodeSvg, pipeSvg, place, stepSvg } from "../steppers/_flytnett.js";

const { s: S, t: T, edges } = NETT;
const RIPPLE = !globalThis.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
const isPipe = (u, v) => edges.some((e) => e.from === u && e.to === v);
const pipeOf = (u, v) => edges.find((e) => (e.from === u && e.to === v) || (e.from === v && e.to === u));

export default function init({ stage, controls, getSize, onResize, signal }) {
  let flow = new Map();
  let shown = new Map(); // the flow as drawn, eased towards `flow` while water is sent
  let path = [S];
  let busy = false;
  let hit = []; // { u, v, a, b, r, node } for each step the path can take next, in screen px

  const readout = document.createElement("div");
  readout.className = "sim-readout";
  readout.setAttribute("aria-live", "polite");
  const sendBtn = document.createElement("button");
  sendBtn.type = "button";
  sendBtn.className = "sim-btn";
  const undo = document.createElement("button");
  undo.type = "button";
  undo.className = "sim-btn";
  undo.textContent = "Angre";
  const reset = document.createElement("button");
  reset.type = "button";
  reset.className = "sim-btn";
  reset.textContent = "Nullstill";
  controls.append(readout, sendBtn, undo, reset);

  const room = (u, v) => cf(edges, flow, u, v);
  const steps = () => path.slice(1).map((v, i) => [path[i], v, room(path[i], v)]);
  /** The steps the path can take next from its end: [u, v, along-the-pipe?]. */
  function options() {
    const end = path[path.length - 1];
    if (end === T || busy || !bfs(NETT, flow, true).d.has(T)) return [];
    const out = [];
    for (const e of edges) {
      if (e.from === end && !path.includes(e.to) && room(end, e.to) > 0) out.push([end, e.to, true]);
      if (e.to === end && !path.includes(e.from) && room(end, e.from) > 0) out.push([end, e.from, false]);
    }
    return out;
  }

  sendBtn.addEventListener("click", () => send(), { signal });
  undo.addEventListener(
    "click",
    () => {
      if (busy || path.length < 2) return;
      path = path.slice(0, -1);
      draw();
    },
    { signal },
  );
  reset.addEventListener(
    "click",
    () => {
      if (busy) return;
      flow = new Map();
      shown = new Map();
      path = [S];
      draw();
    },
    { signal },
  );

  function send() {
    if (busy || path[path.length - 1] !== T) return;
    const st = steps();
    const neck = Math.min(...st.map((x) => x[2]));
    const next = new Map(flow);
    for (const [u, v] of st) {
      if (isPipe(u, v)) next.set(key(u, v), (next.get(key(u, v)) ?? 0) + neck);
      else next.set(key(v, u), (next.get(key(v, u)) ?? 0) - neck);
    }
    const from = new Map(flow);
    const sentPath = path;
    const sentSteps = st;
    flow = next;
    busy = true;
    const t0 = performance.now();
    const dur = RIPPLE ? 700 : 0;
    const tick = (now) => {
      if (signal.aborted) return;
      const x = dur ? Math.min(1, Math.max(0, (now - t0) / dur)) : 1;
      const e = x * x * (3 - 2 * x);
      shown = new Map(
        edges.map((ed) => {
          const k = key(ed.from, ed.to);
          const a = from.get(k) ?? 0;
          return [k, a + ((flow.get(k) ?? 0) - a) * e];
        }),
      );
      if (x < 1) {
        draw(sentPath, sentSteps);
        requestAnimationFrame(tick);
      } else {
        shown = new Map(flow);
        busy = false;
        path = [S];
        draw();
      }
    };
    requestAnimationFrame(tick);
  }

  function draw(drawnPath = path, drawnSteps = null) {
    const { w, h } = getSize();
    if (w <= 0 || h <= 0) return;
    const r = Math.max(13, Math.min(16, w / 26));
    const k = Math.min(0.95, Math.max(0.62, w / 460));
    const gw = Math.min(w, 380);
    const box = { x: (w - gw) / 2, y: 0, w: gw, h };
    const pos = place(NETT.nodes, box, { l: r + 46, r: r + 46, t: r + 14, b: r + 30 });
    const now = busy ? shown : flow;
    const st = drawnSteps ?? steps();
    const neck = st.length ? Math.min(...st.map((x) => x[2])) : null;
    const opts = options();
    const end = path[path.length - 1];

    const reach = bfs(NETT, now, true).d;
    const stuck = !busy && !reach.has(T);
    const onPath = (u, v) => st.some(([a, b]) => (a === u && b === v) || (a === v && b === u));
    const lit = (e) => opts.some(([a, b]) => (a === e.from && b === e.to) || (a === e.to && b === e.from));

    let s = "";
    for (const e of edges) {
      const f = now.get(key(e.from, e.to)) ?? 0;
      s += pipeSvg(pos.get(e.from), pos.get(e.to), r, k, e.c, f, {
        moving: RIPPLE,
        label: `${Math.round(f)}/${e.c}`,
        side: e.side,
        at: e.at,
        ring: lit(e),
        labelColor: f > 0 ? TOKENS.fg : TOKENS.muted,
        bold: onPath(e.from, e.to),
      }).svg;
    }
    // A faint arrow on each pipe the path can take next, the way it would go.
    hit = [];
    for (const [u, v] of opts) {
      s += `<g opacity="0.75">${stepSvg(pos.get(u), pos.get(v), r, null)}</g>`;
      const a = pos.get(u);
      const b = pos.get(v);
      const e = pipeOf(u, v);
      hit.push({ u, v, a, b, r: Math.max(16, (k * e.c + 3) / 2 + 8), node: b });
    }
    for (const [u, v, rm] of st) {
      const e = pipeOf(u, v);
      const fwd = e.from === u;
      // The room goes on the other side of the pipe from its f/c label.
      const side = fwd ? -e.side : e.side;
      const clear = (k * e.c + 3) / 2;
      s += stepSvg(pos.get(u), pos.get(v), r, rm, {
        side,
        clear,
        at: e.at ? (fwd ? e.at : 1 - e.at) : 0.5,
        bold: rm === neck,
      });
    }
    for (const n of NETT.nodes) {
      const ring = !busy && n.id === end && path.length > 1 ? "on" : null;
      s += nodeSvg(pos.get(n.id), r, n.id, { filled: stuck && reach.has(n.id), ring });
    }
    const p1 = pos.get(S);
    const p6 = pos.get(T);
    const val = Math.round(edges.filter((e) => e.from === S).reduce((a, e) => a + (now.get(key(S, e.to)) ?? 0), 0));
    s +=
      `<text x="${(p1.x - r - 10).toFixed(1)}" y="${(p1.y + 4).toFixed(1)}" text-anchor="end" style="fill:var(--muted);${TOKENS.font}">kilde</text>` +
      `<text x="${(p6.x - r - 10).toFixed(1)}" y="${(p6.y + 4).toFixed(1)}" text-anchor="end" style="fill:var(--muted);${TOKENS.font}">sluk</text>` +
      `<text x="${(p6.x + r + 10).toFixed(1)}" y="${(p6.y + 5).toFixed(1)}" text-anchor="start" style="fill:var(--cyan);${TOKENS.font};font-size:var(--text-sm);font-weight:700">${val} l/s</text>`;
    stage.innerHTML = wrapSvg(w, h, s);

    // Controls and the one readout line.
    const atSink = end === T;
    sendBtn.textContent = atSink && neck != null ? `Send ${neck} l/s` : "Send";
    sendBtn.disabled = busy || !atSink;
    undo.disabled = busy || path.length < 2;
    reset.disabled = busy;
    const route = drawnPath.join(", ");
    let text;
    if (busy) text = `Sender ${neck} l/s langs ${route}.`;
    else if (stuck && path.length === 1) text = "Ingen sti kommer fram til sluket.";
    else if (atSink) text = `Stien ${route} kan ta ${neck} l/s til.`;
    else if (!opts.length) text = `Stien ${route} kommer ikke videre. Angre et steg.`;
    else if (path.length === 1) text = "Trykk på et markert rør for å starte stien.";
    else text = `Stien: ${route}. Trykk på et markert rør.`;
    readout.textContent = text;
    stage.setAttribute("aria-label", `Seks noder og ni rør fra kilden 1 til sluket 6. ${val} liter i sekundet kommer fram. ${text}`);
  }

  /** Distance from point p to the segment a–b. */
  const dist = (p, a, b) => {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / (dx * dx + dy * dy || 1)));
    return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy));
  };
  stage.style.cursor = "pointer";
  stage.addEventListener(
    "click",
    (ev) => {
      if (busy || !hit.length) return;
      const bx = stage.getBoundingClientRect();
      const { w, h } = getSize();
      const p = { x: ((ev.clientX - bx.left) / bx.width) * w, y: ((ev.clientY - bx.top) / bx.height) * h };
      let best = null;
      let bd = Infinity;
      for (const x of hit) {
        const d = Math.min(dist(p, x.a, x.b), Math.hypot(p.x - x.node.x, p.y - x.node.y) - 6);
        if (d < x.r && d < bd) [best, bd] = [x, d];
      }
      if (!best) return;
      path = [...path, best.v];
      draw();
    },
    { signal },
  );

  onResize(() => draw());
  draw();
}
