/**
 * CLIQUE for TDT4120 modul 03 «Problemer og reduksjoner»: checking a proposed
 * answer is easy, finding one is not.
 *
 * One idea: to check that k chosen nodes are a klikk (a certificate), look up
 * every pair of them, k(k − 1)/2 look-ups; to find a klikk, choose among the
 * sets of k nodes, and nothing tells you which one to try. The reader taps
 * nodes; for every pair of chosen nodes the drawing shows the look-up: a heavy
 * ink line when the pair is a kant, a red dashed line when it is not.
 * Exactly k chosen nodes with every pair a kant is a klikk, drawn green with a
 * band under its kanter, the lecture's mark for the clique.
 *
 * The first view is the lecture's graph (forelesning 2b, «CLIQUE · Relasjon»,
 * slides 42–48), laid out as on the slide: 4 and 5 on top, 3 left and 6 right
 * in the middle, 2 and 1 at the bottom, «k = 4» right of 1, under 6. Ten
 * kanter: 1–2, 1–3, 1–4, 1–5, 2–4, 2–5, 2–6, 3–4, 3–6, 4–5. The kanter 1–4 and
 * 2–5 cross in the middle and 3–6 runs through the crossing, as on the slide;
 * no kant passes through a node.
 *
 * The module has not taught graphs yet, so every reader-facing string (status,
 * buttons, aria labels) speaks of people who know each other: a node is a
 * person, a kant is a pair who know each other. The code keeps graph names.
 *
 * Numbers the module text uses (lecture graph, checked against missingPairs
 * and the status below):
 *  - Nothing chosen: «Velg 4 personer».
 *  - 1, 2, 4, 5: the six pairs 1–2, 1–4, 1–5, 2–4, 2–5, 4–5 are all kanter;
 *    the four nodes and six kanter turn green, «En klikk med 4 personer». It is
 *    the graph's only klikk with 4 nodes (15 sets of 4 nodes in all).
 *  - 1, 3, 4, 5: five pairs are kanter (1–3, 1–4, 1–5, 3–4, 4–5) and one, the
 *    pair 3 and 5, is not: one red dashed line 3–5, «1 par kjenner ikke
 *    hverandre».
 *  - The five pairs of the graph that are not kanter: 1–6, 2–3, 3–5, 4–6, 5–6.
 *
 * Status line (under the graph at the left, the one sentence in the
 * drawing): «Velg 4 personer» with nothing chosen; «m par kjenner ikke
 * hverandre» (red) when m chosen pairs are not kanter and at most 4 nodes are
 * chosen; «En klikk med 4 personer» (green) for a klikk; «n av 4 valgt» while fewer than 4 are chosen
 * and nothing is missing; «n valgt, velg 4» when more than 4 are chosen.
 *
 * «Ny instans» deals a graph with 10 nodes numbered 1–10 (k stays 4) on a 3-4-3
 * layout with a little jitter: exactly one planted klikk with 4 nodes, at
 * least 10 triangles, at least 4 sets of 4 nodes that miss only one pair
 * (decoys), every node with at least 2 neighbours, connected, no kant through
 * a node (`candidates`), and at least one node outside the klikk as well
 * connected as the best-connected node in it, so degree gives nothing away.
 * Checked by brute force over all 210 sets of 4 nodes. «Første instans» brings
 * back the lecture's graph. «Tøm» clears the selection.
 *
 * Input: a node is a transparent <button> over its circle (aria-pressed,
 * «Person 3»), so taps, clicks and Enter/Space on a focused node all toggle it,
 * and focus survives the redraw (the SVG is redrawn through innerHTML; the
 * buttons stay). Because the stage now holds buttons, it is a group, not an
 * image, and the status line is mirrored to a polite live region.
 *
 * Drawing language shared with finn-klikk.js and storste-gruppe.js (the course
 * graph steppers' _graf.js): node = circle r 14 with the label in mono,
 * ordinary kant = --muted 1.4 px, a looked-up kant = --fg 2.8 px, accent =
 * what the reader just chose, green with a band = the answer. A chosen node
 * is pale accent with a heavy accent outline; a node of the klikk is pale
 * green with a green outline. Never by colour alone: a missing pair is
 * dashed, a looked-up kant solid, the klikk banded.
 *
 * Deterministic first view; Math.random only after «Ny instans».
 *
 * Contract: default-export init(api); host="dom", so api = { stage, controls,
 * getSize, onResize, signal }.
 */

import { FONT, NODE, candidates, esc, lineGeom, place, shuffle } from "../steppers/_graf.js";

const K = 4;

/** The lecture's graph (slide 44), on the slide's grid. */
const FORELESNING = {
  undirected: true,
  nodes: [
    { id: 4, gx: 1, gy: 0 },
    { id: 5, gx: 3, gy: 0 },
    { id: 3, gx: 0, gy: 1.5 },
    { id: 6, gx: 4, gy: 1.5 },
    { id: 2, gx: 1, gy: 3 },
    { id: 1, gx: 3, gy: 3 },
  ],
  edges: [
    [1, 2], [1, 3], [1, 4], [1, 5], [2, 4], [2, 5], [2, 6], [3, 4], [3, 6], [4, 5],
  ].map(([from, to]) => ({ from, to })),
};

/**
 * Ten places in rows of 3, 4 and 3 on the lecture graph's 4 × 3 grid. The
 * bottom row stops at 2.75, so the corner (4, 3) stays free for «k = 4», as
 * on the lecture's graph.
 */
const SLOTS = [
  [0.67, 0], [2, 0], [3.33, 0],
  [0, 1.5], [1.33, 1.5], [2.67, 1.5], [4, 1.5],
  [0.25, 3], [1.5, 3], [2.75, 3],
];

const pairKey = (a, b) => (a < b ? `${a}-${b}` : `${b}-${a}`);

/** All subsets of `ids` with `size` elements. */
function subsets(ids, size) {
  const out = [];
  const pick = (start, cur) => {
    if (cur.length === size) return void out.push([...cur]);
    for (let i = start; i < ids.length; i++) pick(i + 1, [...cur, ids[i]]);
  };
  pick(0, []);
  return out;
}

/** Neighbour sets: id → Set of ids. */
function neighbours(graph) {
  const nb = new Map(graph.nodes.map((n) => [n.id, new Set()]));
  for (const e of graph.edges) {
    nb.get(e.from).add(e.to);
    nb.get(e.to).add(e.from);
  }
  return nb;
}

/** The chosen pairs that are not kanter, as [a, b] with a < b. */
function missingPairs(nb, chosen) {
  const ids = [...chosen].sort((a, b) => a - b);
  const out = [];
  for (let i = 0; i < ids.length; i++) {
    for (let j = i + 1; j < ids.length; j++) if (!nb.get(ids[i]).has(ids[j])) out.push([ids[i], ids[j]]);
  }
  return out;
}

/**
 * A random graph with 10 nodes and exactly one klikk with 4 nodes, hard to
 * spot by eye (see the header for every condition).
 */
export function dealGraph() {
  const jit = (a) => (Math.random() * 2 - 1) * a;
  for (let attempt = 0; attempt < 5000; attempt++) {
    const ids = shuffle(Array.from({ length: 10 }, (_, i) => i + 1));
    const nodes = ids.map((id, i) => ({ id, gx: SLOTS[i][0] + jit(0.16), gy: SLOTS[i][1] + jit(0.2) }));
    const pairs = candidates(nodes, 0.5, 3.2);
    const ok = new Set(pairs.map(([a, b]) => pairKey(a, b)));
    const quads = subsets(ids, K).filter((q) => subsets(q, 2).every(([a, b]) => ok.has(pairKey(a, b))));
    if (!quads.length) continue;
    const planted = quads[Math.floor(Math.random() * quads.length)];
    const nb = new Map(ids.map((id) => [id, new Set()]));
    const edges = [];
    const add = (a, b) => {
      nb.get(a).add(b);
      nb.get(b).add(a);
      edges.push({ from: a, to: b });
    };
    for (const [a, b] of subsets(planted, 2)) add(a, b);
    const target = 19 + Math.floor(Math.random() * 4);
    for (const [a, b] of shuffle(pairs)) {
      if (edges.length >= target) break;
      if (nb.get(a).has(b)) continue;
      // a–b closes a klikk with 4 nodes when two common neighbours are neighbours.
      const common = [...nb.get(a)].filter((x) => nb.get(b).has(x));
      if (common.some((x) => common.some((y) => x !== y && nb.get(x).has(y)))) continue;
      add(a, b);
    }
    if (edges.length < target) continue;
    if (ids.some((id) => nb.get(id).size < 2)) continue;
    // Connected.
    const seen = new Set([ids[0]]);
    const todo = [ids[0]];
    while (todo.length) for (const y of nb.get(todo.pop())) if (!seen.has(y)) seen.add(y), todo.push(y);
    if (seen.size < ids.length) continue;
    // Triangles and near-klikker (sets of 4 that miss exactly one pair).
    const tri = subsets(ids, 3).filter(([a, b, c]) => nb.get(a).has(b) && nb.get(a).has(c) && nb.get(b).has(c)).length;
    if (tri < 10) continue;
    let near = 0;
    for (const q of subsets(ids, K)) {
      const m = subsets(q, 2).filter(([a, b]) => !nb.get(a).has(b)).length;
      if (m === 1) near++;
    }
    if (near < 4) continue;
    // Degree must not give the klikk away.
    const top = Math.max(...planted.map((id) => nb.get(id).size));
    if (!ids.some((id) => !planted.includes(id) && nb.get(id).size >= top)) continue;
    // No two kanter leave a node in almost the same direction.
    const pos = new Map(nodes.map((n) => [n.id, n]));
    const crowded = ids.some((id) => {
      const p = pos.get(id);
      const ang = [...nb.get(id)].map((o) => Math.atan2(pos.get(o).gy - p.gy, pos.get(o).gx - p.gx)).sort((x, y) => x - y);
      for (let i = 0; i < ang.length; i++) {
        const d = i + 1 < ang.length ? ang[i + 1] - ang[i] : ang[0] + 2 * Math.PI - ang[i];
        if (d < 0.3) return true;
      }
      return false;
    });
    if (crowded) continue;
    return { undirected: true, nodes, edges, planted };
  }
  return FORELESNING;
}

const P = (v) => v.toFixed(1);

/** Ordinary kant, a kant the reader's choice looks up, and a missing pair. */
const LINE = {
  plain: { stroke: "var(--muted)", wdt: 1.4 },
  checked: { stroke: "var(--fg)", wdt: 2.8 },
  missing: { stroke: "var(--red)", wdt: 2.2, dash: "6 4" },
  answer: { stroke: "var(--green)", wdt: 2.2 },
};

/** The radius of a node and the side of its tap target, in px. */
const R = 14;
const HIT = 40;

export default function init({ stage, controls, getSize, onResize, signal }) {
  let graph = FORELESNING;
  let nb = neighbours(graph);
  const chosen = new Set();

  // ── scene ────────────────────────────────────────────────────────────────
  // The drawing is redrawn through innerHTML; the node buttons over it stay,
  // so a focused node keeps focus. The stage holds buttons, so it is a group.
  stage.setAttribute("role", "group");
  stage.style.position = "relative";
  const art = document.createElement("div");
  art.setAttribute("aria-hidden", "true");
  art.style.cssText = "position:absolute;inset:0";
  const hits = document.createElement("div");
  hits.style.cssText = "position:absolute;inset:0;pointer-events:none";
  const live = document.createElement("p");
  live.className = "sr-only";
  live.setAttribute("aria-live", "polite");
  stage.replaceChildren(art, hits, live);

  let buttons = new Map();
  function makeButtons() {
    buttons = new Map();
    hits.replaceChildren();
    for (const id of graph.nodes.map((n) => n.id).sort((a, b) => a - b)) {
      const b = document.createElement("button");
      b.type = "button";
      b.style.cssText =
        `position:absolute;left:0;top:0;width:${HIT}px;height:${HIT}px;margin:0;padding:0;border:0;` +
        "border-radius:50%;background:transparent;pointer-events:auto;touch-action:manipulation;" +
        "-webkit-tap-highlight-color:transparent";
      b.setAttribute("aria-label", `Person ${id}`);
      b.addEventListener(
        "click",
        () => {
          if (chosen.has(id)) chosen.delete(id);
          else chosen.add(id);
          render();
        },
        { signal },
      );
      buttons.set(id, b);
      hits.append(b);
    }
  }

  // ── kontroller ─────────────────────────────────────────────────────────
  const group = document.createElement("div");
  group.setAttribute("role", "group");
  group.setAttribute("aria-label", "Instansen");
  group.style.cssText = "display:flex;flex-wrap:wrap;gap:var(--space-2)";
  const btn = (label, aria, onClick) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "sim-btn";
    b.textContent = label;
    b.setAttribute("aria-label", aria);
    b.addEventListener("click", onClick, { signal });
    group.append(b);
    return b;
  };
  btn("Ny instans", "Ny instans, tilfeldig, med 10 personer", () => {
    graph = dealGraph();
    nb = neighbours(graph);
    chosen.clear();
    makeButtons();
    render();
  });
  btn("Første instans", "Tilbake til den første instansen", () => {
    graph = FORELESNING;
    nb = neighbours(graph);
    chosen.clear();
    makeButtons();
    render();
  });
  btn("Tøm", "Tøm valget", () => {
    chosen.clear();
    render();
  });
  controls.append(group);

  /** The status sentence and its colour. */
  function status(missing) {
    const n = chosen.size;
    if (n === 0) return { text: `Velg ${K} personer`, color: "var(--muted)" };
    if (n > K) return { text: `${n} valgt, velg ${K}`, color: "var(--fg)" };
    if (missing.length) return { text: `${missing.length} par kjenner ikke hverandre`, color: "var(--red)", bold: true };
    if (n === K) return { text: `En klikk med ${K} personer`, color: "var(--green)", bold: true };
    return { text: `${n} av ${K} valgt`, color: "var(--fg)" };
  }

  /**
   * A missing pair as a path from rim to rim: straight when it clears every
   * other node, else bent just enough (a quadratic curve) to pass beside them.
   */
  function pairPath(pa, pb, others) {
    const dx = pb.x - pa.x;
    const dy = pb.y - pa.y;
    const L = Math.hypot(dx, dy) || 1;
    const nx = -dy / L;
    const ny = dx / L;
    const clear = R + 6;
    const fits = (c) => {
      for (let i = 1; i < 32; i++) {
        const t = i / 32;
        const x = (1 - t) * (1 - t) * pa.x + 2 * (1 - t) * t * c.x + t * t * pb.x;
        const y = (1 - t) * (1 - t) * pa.y + 2 * (1 - t) * t * c.y + t * t * pb.y;
        for (const o of others) if (Math.hypot(x - o.x, y - o.y) < clear) return false;
      }
      return true;
    };
    let c = null;
    for (const b of [0, 28, -28, 44, -44, 60, -60, 80, -80, 104, -104]) {
      const t = { x: (pa.x + pb.x) / 2 + nx * b, y: (pa.y + pb.y) / 2 + ny * b };
      if (fits(t)) {
        c = b === 0 ? null : t;
        break;
      }
    }
    if (!c) return lineGeom(pa, pb, { r: R }, { r: R }).d;
    const u = (p) => {
      const l = Math.hypot(c.x - p.x, c.y - p.y) || 1;
      return { x: p.x + ((c.x - p.x) / l) * R, y: p.y + ((c.y - p.y) / l) * R };
    };
    const s = u(pa);
    const e = u(pb);
    return `M${P(s.x)} ${P(s.y)} Q${P(c.x)} ${P(c.y)} ${P(e.x)} ${P(e.y)}`;
  }

  // ── tegning ─────────────────────────────────────────────────────────────
  let lastLive = null;
  function render() {
    const { w, h } = getSize();
    if (w <= 0 || h <= 0) {
      art.innerHTML = "";
      return;
    }
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    const fsSm = 0.84 * rem;

    // The graph fills the stage above a strip for the status line; the grid
    // may stretch up to 1.35 times more in one direction than the other.
    const STRIP = Math.round(fsSm * 2.4);
    const pad = R + 10;
    const gxs = graph.nodes.map((n) => n.gx);
    const gys = graph.nodes.map((n) => n.gy);
    const gw = Math.max(...gxs) - Math.min(...gxs) || 1;
    const gh = Math.max(...gys) - Math.min(...gys) || 1;
    const areaH = h - STRIP;
    let sx = (w - 2 * pad) / gw;
    let sy = (areaH - 2 * pad) / gh;
    const STRETCH = 1.35;
    sx = Math.min(sx, sy * STRETCH);
    sy = Math.min(sy, sx * STRETCH);
    const bw = gw * sx + 2 * pad;
    const bh = gh * sy + 2 * pad;
    const box = { x: (w - bw) / 2, y: Math.max(0, (areaH - bh) / 2), w: bw, h: bh };
    const pos = place(graph.nodes, box, { l: pad, r: pad, t: pad, b: pad });

    const missing = missingPairs(nb, chosen);
    const isClique = chosen.size === K && missing.length === 0;
    const st = status(missing);

    let svg = "";
    const path = (d, ln) =>
      (svg +=
        `<path d="${d}" fill="none" stroke-linecap="round" style="stroke:${ln.stroke}" stroke-width="${ln.wdt}"` +
        `${ln.dash ? ` stroke-dasharray="${ln.dash}"` : ""}/>`);
    const shape = { r: R };

    // Kanter: ordinary ones first, then the looked-up ones on top.
    const top = [];
    for (const e of graph.edges) {
      const g = lineGeom(pos.get(e.from), pos.get(e.to), shape, shape);
      if (chosen.has(e.from) && chosen.has(e.to)) top.push(g);
      else path(g.d, LINE.plain);
    }
    // Missing pairs, dashed, under the looked-up kanter.
    for (const [a, b] of missing) {
      const others = graph.nodes.filter((n) => n.id !== a && n.id !== b).map((n) => pos.get(n.id));
      path(pairPath(pos.get(a), pos.get(b), others), LINE.missing);
    }
    for (const g of top) {
      if (isClique) {
        svg +=
          `<path d="${g.d}" fill="none" stroke-linecap="round" ` +
          `style="stroke:color-mix(in srgb, var(--green) 30%, transparent)" stroke-width="10"/>`;
        path(g.d, LINE.answer);
      } else path(g.d, LINE.checked);
    }

    // Nodes.
    for (const n of graph.nodes) {
      const p = pos.get(n.id);
      const on = chosen.has(n.id);
      let fill = NODE.white.fill;
      let stroke = NODE.white.stroke;
      let ink = NODE.white.text;
      let sw = 1.4;
      if (on && isClique) {
        fill = "color-mix(in srgb, var(--green) 22%, var(--bg))";
        stroke = "var(--green)";
        sw = 2.6;
      } else if (on) {
        fill = "color-mix(in srgb, var(--accent) 14%, var(--bg))";
        stroke = "var(--accent)";
        ink = "var(--accent-ink)";
        sw = 2.6;
      }
      svg +=
        `<circle cx="${P(p.x)}" cy="${P(p.y)}" r="${R}" style="fill:${fill};stroke:${stroke}" stroke-width="${sw}"/>` +
        `<text x="${P(p.x)}" y="${P(p.y + 4)}" text-anchor="middle" style="fill:${ink};${FONT};font-weight:600">${esc(n.id)}</text>`;
    }

    // «k = 4» where the slide has it: right of the bottom row, ending under
    // the right edge of the right-hand node (every layout here leaves that
    // corner of the grid free).
    const kx = box.x + pad + gw * sx;
    const ky = box.y + pad + gh * sy;
    svg +=
      `<text x="${P(Math.min(w - 10, kx + R))}" y="${P(ky + fsSm * 0.35)}" text-anchor="end" ` +
      `style="fill:var(--muted);font-family:var(--font-mono);font-size:var(--text-sm)"><tspan style="font-style:italic">k</tspan> = ${K}</text>`;

    // The status line, in the strip under the graph, lined up with the
    // graph's left node (on a wide stage the graph is centred).
    const xs = graph.nodes.map((n) => pos.get(n.id).x);
    const left = Math.max(12, Math.min(...xs) - R);
    const ty = h - STRIP / 2 + fsSm * 0.35;
    svg +=
      `<text x="${P(left)}" y="${P(ty)}" style="fill:${st.color};font-family:var(--font-mono);font-size:var(--text-sm)` +
      `${st.bold ? ";font-weight:600" : ""}">${esc(st.text)}</text>`;

    art.innerHTML =
      `<svg width="100%" height="100%" viewBox="0 0 ${w.toFixed(0)} ${h.toFixed(0)}" ` +
      `preserveAspectRatio="none" style="display:block">${svg}</svg>`;

    for (const [id, b] of buttons) {
      const p = pos.get(id);
      b.style.transform = `translate(${P(p.x - HIT / 2)}px, ${P(p.y - HIT / 2)}px)`;
      b.setAttribute("aria-pressed", String(chosen.has(id)));
    }
    // Announce changes only; the first view is not announced.
    if (lastLive !== null && st.text !== lastLive) live.textContent = st.text;
    lastLive = st.text;
  }

  makeButtons();
  onResize(render);
  render();
}
