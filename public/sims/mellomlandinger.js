/**
 * «Mellomlandinger» for TDT4120 modul 12 «Korteste vei fra alle til alle».
 *
 * The one idea: d^(k)_ij is the cheapest trip from i to j when you may
 * change planes only at airports 1 to k. Allowing k lowers a cell only when a
 * trip through k is cheaper, and the new trip is then the cheapest trip from
 * i to k followed by the cheapest from k to j, two cells already in the table.
 *
 * System: five airports numbered from south to north, seven direct routes,
 * each the same price both ways, one ticket per flight. Bergen has no direct
 * flight to Bodø or Tromsø. The prices are made up for the example. The
 * airports sit where they are in Norway: latitude and longitude projected to
 * km, with the same scale across and up, so the map keeps the country's shape.
 *
 * Controls: a slider for k (0 to 5), and a tap on a cell of the table chooses
 * the pair. Starts at k = 0 with Bergen to Tromsø.
 *
 * Drawing: the map beside the table, or above it when the stage is too
 * narrow for both side by side. Airports 1..k are half-filled (a change of planes is
 * allowed there). The chosen trip is drawn bold with arrowheads, split at its
 * highest-numbered change m: the part to m in the accent, the rest in cyan.
 * The two long routes from Oslo are drawn as arcs east of Trondheim.
 * The table: row = from, column = to; a cell that got cheaper when k
 * was allowed is gray; the chosen cell is ringed; cells (i, m) and (m, j) are
 * outlined in the colours of the two parts. Readout: the chosen trip in one
 * sentence.
 *
 * Contract: default-export init(api); host="dom", so api = { stage, controls,
 * getSize, onResize, signal }.
 */
import { EDGE, FONT, NODE, edgeGeom, edgeSvg, esc, lineGeom, weightSvg, wrapSvg } from "../steppers/_graf.js";
import { CHANGED, HALF1, HALF2, matrixSvg } from "../steppers/_alle-par.js";

// The airports' latitude and longitude (Gardermoen, Flesland, Værnes, Bodø, Langnes).
const FLYPLASSER = [
  { id: 1, navn: "Oslo", lat: 60.194, lon: 11.1, side: "e" },
  { id: 2, navn: "Bergen", lat: 60.293, lon: 5.218, side: "s" },
  { id: 3, navn: "Trondheim", lat: 63.458, lon: 10.924, side: "w" },
  { id: 4, navn: "Bodø", lat: 67.269, lon: 14.365, side: "w" },
  { id: 5, navn: "Tromsø", lat: 69.683, lon: 18.919, side: "w" },
];
/** km east of 15° E and north of the equator (sinusoidal projection). */
const KM = FLYPLASSER.map((a) => ({
  x: (a.lon - 15) * Math.cos((a.lat * Math.PI) / 180) * 111.32,
  y: a.lat * 110.57,
}));
const SPAN = {
  x0: Math.min(...KM.map((p) => p.x)),
  x1: Math.max(...KM.map((p) => p.x)),
  y0: Math.min(...KM.map((p) => p.y)),
  y1: Math.max(...KM.map((p) => p.y)),
};
// [from, to, price, bend]: the routes run south to north, and a positive bend
// bows the route east, as a fraction of its length.
const RUTER = [
  [1, 2, 700, 0],
  [1, 3, 800, 0],
  [1, 4, 1500, 0.14],
  [1, 5, 1800, 0.24],
  [2, 3, 1200, 0],
  [3, 4, 600, 0],
  [4, 5, 500, 0],
];
const N = FLYPLASSER.length;
const navn = (id) => FLYPLASSER[id - 1].navn;
const kr = (x) => (x === Infinity ? "∞" : String(x));

/** Floyd-Warshall level by level: D[k], and the trip behind each cell as a node list. */
function levels() {
  const D = Array.from({ length: N }, (_, i) => Array.from({ length: N }, (_, j) => (i === j ? 0 : Infinity)));
  const P = Array.from({ length: N }, (_, i) => Array.from({ length: N }, (_, j) => (i === j ? [i + 1] : null)));
  for (const [a, b, p] of RUTER) {
    D[a - 1][b - 1] = D[b - 1][a - 1] = p;
    P[a - 1][b - 1] = [a, b];
    P[b - 1][a - 1] = [b, a];
  }
  const out = [{ D: D.map((r) => [...r]), P: P.map((r) => [...r]) }];
  for (let k = 0; k < N; k++) {
    const prev = out[out.length - 1];
    const nd = prev.D.map((r) => [...r]);
    const np = prev.P.map((r) => [...r]);
    for (let i = 0; i < N; i++)
      for (let j = 0; j < N; j++) {
        const via = prev.D[i][k] + prev.D[k][j];
        if (via < prev.D[i][j]) {
          nd[i][j] = via;
          np[i][j] = [...prev.P[i][k], ...prev.P[k][j].slice(1)];
        }
      }
    out.push({ D: nd, P: np });
  }
  return out;
}
const LEVELS = levels();

/** An undirected route from a to b, straight or bowed by `bend` px, from rim to rim. */
function routeGeom(a, b, r, bend) {
  if (!bend) return lineGeom(a, b, { r }, { r });
  const len = Math.hypot(b.x - a.x, b.y - a.y);
  const [dx, dy] = [(b.x - a.x) / len, (b.y - a.y) / len];
  const c = { x: (a.x + b.x) / 2 - dy * bend, y: (a.y + b.y) / 2 + dx * bend };
  const rimTo = (p) => {
    const l = Math.hypot(c.x - p.x, c.y - p.y);
    return { x: p.x + ((c.x - p.x) / l) * r, y: p.y + ((c.y - p.y) / l) * r };
  };
  const p = rimTo(a);
  const q = rimTo(b);
  const f = (v) => v.toFixed(1);
  return {
    d: `M${f(p.x)} ${f(p.y)} Q${f(c.x)} ${f(c.y)} ${f(q.x)} ${f(q.y)}`,
    head: null,
    mid: { x: 0.25 * a.x + 0.5 * c.x + 0.25 * b.x, y: 0.25 * a.y + 0.5 * c.y + 0.25 * b.y },
    len,
    nx: -dy,
    ny: dx,
  };
}

export default function init({ stage, controls, getSize, onResize, signal }) {
  let k = 0;
  let sel = [2, 5];

  const label = document.createElement("label");
  label.append("k ");
  const out = document.createElement("output");
  const input = document.createElement("input");
  input.type = "range";
  input.min = "0";
  input.max = String(N);
  input.step = "1";
  input.value = String(k);
  input.setAttribute("aria-label", "Mellomlanding tillatt i flyplass 1 til k");
  label.append(out, input);
  input.addEventListener(
    "input",
    () => {
      k = Number(input.value);
      draw();
    },
    { signal },
  );
  const readout = document.createElement("div");
  readout.className = "sim-readout";
  controls.append(label, readout);

  let cells = null;

  function draw() {
    const { w, h } = getSize();
    if (w <= 0 || h <= 0) return;
    out.textContent = String(k);
    const { D, P } = LEVELS[k];
    const prevD = k > 0 ? LEVELS[k - 1].D : null;
    const [si, sj] = sel;
    const trip = P[si - 1][sj - 1];
    // Highest-numbered change of planes on the trip.
    const stops = trip ? trip.slice(1, -1) : [];
    const m = stops.length ? Math.max(...stops) : null;
    const cut = m != null ? trip.indexOf(m) : -1;
    const part1 = new Set();
    const part2 = new Set();
    if (trip) {
      for (let t = 1; t < trip.length; t++) {
        const key = `${trip[t - 1]}-${trip[t]}`;
        if (cut < 0 || t <= cut) part1.add(key);
        else part2.add(key);
      }
    }

    // ── layout ────────────────────────────────────────────────────────────
    const ch = 26;
    const cw = Math.min(54, (w - 34) / N);
    const head = 30;
    const tableW = head + N * cw;
    const tableH = (N + 1) * ch;
    const r = Math.max(11, Math.min(14, w / 30));
    const pad = { l: Math.max(r + 6, 24), r: r + 6, t: r + 6, b: r + 24 };
    const kmW = SPAN.x1 - SPAN.x0;
    const kmH = SPAN.y1 - SPAN.y0;
    // Side by side when the map, at the full height, fits beside the table.
    const gap = 24;
    const sideW = ((h - pad.t - pad.b) / kmH) * kmW + pad.l + pad.r;
    const side = sideW + gap + tableW <= w;
    let tx, ty, box;
    if (side) {
      tx = (w + sideW + gap - tableW) / 2;
      ty = (h - tableH) / 2;
      box = { x: tx - gap - sideW, y: 0, w: sideW, h };
    } else {
      tx = (w - tableW) / 2;
      ty = h - tableH - 4;
      box = { x: 0, y: 0, w, h: ty - 8 };
    }
    const table = matrixSvg(
      tx,
      ty,
      cw,
      ch,
      N,
      (i, j) => (i === j ? "0" : kr(D[i - 1][j - 1])),
      (i, j) => {
        const st = {};
        if (i === j) st.color = "var(--faint)";
        if (prevD && D[i - 1][j - 1] < prevD[i - 1][j - 1]) st.fill = CHANGED;
        if (i === si && j === sj) Object.assign(st, { stroke: "var(--fg)", wdt: 2.4, bold: true });
        else if (m != null && i === si && j === m) Object.assign(st, { stroke: HALF1, wdt: 2 });
        else if (m != null && i === m && j === sj) Object.assign(st, { stroke: HALF2, wdt: 2 });
        return st;
      },
      { corner: ["fra", "til"], head },
    );
    cells = table;

    // ── map ───────────────────────────────────────────────────────────────
    const sc = Math.min((box.w - pad.l - pad.r) / kmW, (box.h - pad.t - pad.b) / kmH);
    const ox = box.x + pad.l + (box.w - pad.l - pad.r - sc * kmW) / 2;
    const oy = box.y + pad.t + (box.h - pad.t - pad.b - sc * kmH) / 2;
    const pos = new Map(FLYPLASSER.map((a, t) => [a.id, { x: ox + sc * (KM[t].x - SPAN.x0), y: oy + sc * (SPAN.y1 - KM[t].y) }]));
    const bendOf = new Map(RUTER.map(([a, b, , f]) => [`${a}-${b}`, f]));
    const bendPx = (a, b) => {
      const f = bendOf.get(`${a}-${b}`) ?? -(bendOf.get(`${b}-${a}`) ?? 0);
      const pa = pos.get(a);
      const pb = pos.get(b);
      return f * Math.hypot(pb.x - pa.x, pb.y - pa.y);
    };

    let s = "";
    let prices = "";
    let tripSvg = "";
    for (const [a, b, p] of RUTER) {
      const g = routeGeom(pos.get(a), pos.get(b), r, bendPx(a, b));
      const onTrip = part1.has(`${a}-${b}`) || part1.has(`${b}-${a}`) || part2.has(`${a}-${b}`) || part2.has(`${b}-${a}`);
      s += edgeSvg(g, onTrip ? EDGE.faded : EDGE.plain);
      prices += weightSvg(g, String(p), onTrip ? "var(--fg)" : "var(--muted)", onTrip);
    }
    if (trip) {
      for (let t = 1; t < trip.length; t++) {
        const a = trip[t - 1];
        const b = trip[t];
        const g = edgeGeom(pos.get(a), pos.get(b), { r }, { r }, bendPx(a, b));
        const col = part2.has(`${a}-${b}`) ? HALF2 : HALF1;
        tripSvg += edgeSvg(g, { stroke: col, wdt: 2.6 });
      }
    }
    s += tripSvg + prices;
    for (const a of FLYPLASSER) {
      const p = pos.get(a.id);
      const allowed = a.id <= k;
      const st = allowed ? NODE.gray : NODE.white;
      const end = a.id === si || a.id === sj;
      if (end) {
        s +=
          `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${(r + 4).toFixed(1)}" ` +
          `style="fill:none;stroke:var(--fg)" stroke-width="2"/>`;
      }
      s +=
        `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${r.toFixed(1)}" ` +
        `style="fill:${st.fill};stroke:${st.stroke}" stroke-width="1.4"/>` +
        `<text x="${p.x.toFixed(1)}" y="${(p.y + 4).toFixed(1)}" text-anchor="middle" ` +
        `style="fill:${st.text};${FONT};font-weight:600">${a.id}</text>`;
      const gap = r + (end ? 9 : 6);
      const [lx, ly, anchor] = {
        w: [p.x - gap, p.y + 4, "end"],
        e: [p.x + gap, p.y + 4, "start"],
        s: [p.x, p.y + gap + 10, "middle"],
        n: [p.x, p.y - gap - 2, "middle"],
      }[a.side];
      s +=
        `<text x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" text-anchor="${anchor}" ` +
        `style="fill:var(--muted);${FONT}">${esc(a.navn)}</text>`;
    }

    stage.innerHTML = wrapSvg(w, h, s + table.svg);

    const dij = D[si - 1][sj - 1];
    let text;
    if (dij === Infinity) text = k === 0 ? "ingen direktefly." : `ingen reise med mellomlanding bare i 1 til ${k}.`;
    else if (!stops.length) text = `${dij} kr, direktefly.`;
    else text = `${dij} kr, mellomlanding i ${stops.map(navn).join(" og ")}.`;
    readout.textContent = `${navn(si)} til ${navn(sj)}: ${text}`;
    stage.setAttribute(
      "aria-label",
      `Fem flyplasser og en tabell over den billigste reisen mellom hvert par med mellomlanding bare i flyplass 1 til ${k}. ${readout.textContent}`,
    );
  }

  stage.style.cursor = "pointer";
  stage.addEventListener(
    "click",
    (ev) => {
      if (!cells) return;
      const box = stage.getBoundingClientRect();
      const { w, h } = getSize();
      const x = ((ev.clientX - box.left) / box.width) * w;
      const y = ((ev.clientY - box.top) / box.height) * h;
      for (let i = 1; i <= N; i++)
        for (let j = 1; j <= N; j++) {
          if (i === j) continue;
          const c = cells.cellAt(i, j);
          if (x >= c.x && x <= c.x + c.w && y >= c.y && y <= c.y + c.h) {
            sel = [i, j];
            draw();
            return;
          }
        }
    },
    { signal },
  );

  onResize(draw);
  draw();
}
