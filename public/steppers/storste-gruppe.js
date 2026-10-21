/**
 * Largest-Group trace for <Stepper>, driving the block `storste-gruppe-kode`
 * in modul 03. The one idea: a person who knows fewer than k of the people
 * still in S cannot be in any group where everyone knows at least k others in
 * the group, so removing that person loses no answer. A removal lowers the
 * count of everyone the removed person knew, which can push one of them below
 * k, so the removals cascade. When nobody is below k, everyone left is the
 * answer.
 *
 * Line numbers refer to that <CodeBlock> (pseudocode line m is block line
 * m + 1):
 *    1 Largest-Group(S, k)
 *    2 1  if everyone in S knows at least k others in S
 *    3 2      return S
 *    4 3  p = a person in S who knows fewer than k others in S
 *    5 4  return Largest-Group(S - {p}, k)
 *
 * The module has not taught graphs yet, so every reader-facing string speaks
 * of people who know each other, never of nodes, edges or a graph; the code
 * below keeps the graph names internally.
 *
 * Frames: for each call, the check (line 2), the choice of p (line 4) and the
 * removal that makes the next call (line 5); then the base case (lines 2–3)
 * and one frame where the calls return its group unchanged (line 5). p is the
 * alphabetically first person below k, so an instance has exactly one trace.
 *
 * The first graph is designed for the module text (k = 3, nine people). a–f
 * are a hexagon with its three long diagonals, so each of them knows exactly
 * three of the others (they are not a clique); g, h and j hang outside, next
 * to a, b and c. Counts at the start: a 4, b 4, c 5, d 3, e 3, f 3, g 3, h 3,
 * j 2, so only j is below 3. Removing j drops h to 2 (c to 4); removing h
 * drops g to 2 (c to 3); removing g drops a and b to 3. Then all of a–f know
 * three of the others, and the answer is a, b, c, d, e, f. That is 11 frames:
 * (2, 4, 5) for j, for h and for g, then (2–3) and (5). Later graphs are
 * random: 8–10 people, k = 2 or 3, at least one removal that only happens
 * because of an earlier one, and a group of at least four left at the end.
 *
 * Drawing, shared with klikk.js and finn-klikk.js: a person is a node and
 * «kjenner» an edge. The number beside each person in S is how many of the
 * others in S they know: red when it is below k, and orange, written as the
 * drop «3→2», on the frame where a removal lowers it. The accent marks the
 * person the step works on, with the edges being counted. A removed person is
 * a dashed faint circle with faded edges. Green, with a band under the edges,
 * is the answer.
 *
 * Colours are framework tokens only, so frames re-theme on the light/dark
 * toggle without the module knowing which theme is active.
 */

import { EDGE, FONT, NODE, candidates, edgeSvg, esc, lineGeom, place, shuffle, stampSides, wrapSvg } from "./_graf.js";

/** The designed first graph: grid positions, y downwards. */
const FIRST = {
  k: 3,
  graph: {
    undirected: true,
    nodes: [
      { id: "a", gx: -0.87, gy: -0.5 },
      { id: "b", gx: 0, gy: -1 },
      { id: "c", gx: 0.87, gy: -0.5 },
      { id: "d", gx: 0.87, gy: 0.5 },
      { id: "e", gx: 0, gy: 1 },
      { id: "f", gx: -0.87, gy: 0.5 },
      { id: "g", gx: -0.75, gy: -1.85 },
      { id: "h", gx: 0.75, gy: -1.85 },
      { id: "j", gx: 1.75, gy: -1.05 },
    ],
    edges: [
      ["a", "b"], ["b", "c"], ["c", "d"], ["d", "e"], ["e", "f"], ["f", "a"],
      ["a", "d"], ["b", "e"], ["c", "f"],
      ["g", "a"], ["g", "b"], ["g", "h"], ["h", "c"], ["h", "j"], ["j", "c"],
    ].map(([from, to]) => ({ from, to })),
  },
};

/** Twelve places for a random graph: four rows, every other row shifted half a step. */
const SLOTS = [];
for (let row = 0; row < 4; row++) {
  for (let col = 0; col < 3; col++) SLOTS.push({ gx: col + (row % 2 ? 0.5 : 0), gy: row * 0.9 });
}

// No «i»: in Norwegian the person i reads as the preposition «i».
const LETTERS = "abcdefghjk";

/** The stage on a phone (390 px wide page), where a random graph must read. */
const PHONE = { w: 276, h: 340 };
/** Counts are placed as if each were as wide as «3→2». */
const STAMP_CHARS = 3;

/** The node radius, the same in all three graph widgets of the module. */
const R = 14;

/** The root font size in px, so the layout follows the reader's text size. */
function remPx() {
  if (typeof document === "undefined") return 16;
  return parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
}

/**
 * Pixel positions for the people. The graph keeps its proportions within a
 * factor 1.15 across (so the hexagon stays a hexagon on a wide stage) and 1.3
 * down (so it fills the tall stage on a phone), centred in what is left. The
 * sides keep room for a count as wide as «3→2», the top and bottom for one
 * line of counts. Returns { pos, r }.
 */
function layout(graph, w, h) {
  const r = R;
  const padX = r + 34;
  const padY = r + 24;
  const gxs = graph.nodes.map((n) => n.gx);
  const gys = graph.nodes.map((n) => n.gy);
  const gw = Math.max(...gxs) - Math.min(...gxs);
  const gh = Math.max(...gys) - Math.min(...gys);
  const iw = w - 2 * padX;
  const ih = h - 2 * padY;
  const s = Math.min(iw / gw, ih / gh);
  const bw = Math.min(iw, gw * s * 1.15);
  const bh = Math.min(ih, gh * s * 1.3);
  const x0 = (w - bw) / 2;
  const y0 = (h - bh) / 2;
  const pos = place(graph.nodes, { x: x0, y: y0, w: bw, h: bh }, { l: 0, r: 0, t: 0, b: 0 });
  return { pos, r };
}

/**
 * Where «k = 3» goes: under the graph, right-aligned with its rightmost
 * person, as in klikk.js and finn-klikk.js (the slide puts k at the bottom
 * right). Returns the text's anchor and its box.
 */
function kLabel(graph, pos, w, h) {
  const fs = 0.84 * remPx(); // --text-sm
  const xs = graph.nodes.map((n) => pos.get(n.id).x);
  const x = Math.min(w - 12, Math.max(...xs) + R);
  const y = h - 8;
  const tw = 5 * 0.6 * fs; // «k = 3» in mono
  return { x, y, box: { x0: x - tw, x1: x, y0: y - fs, y1: y + 2 } };
}

/** Sides to try for a person's count: away from the middle of the graph first. */
function preferFor(graph) {
  const gxs = graph.nodes.map((n) => n.gx);
  const gys = graph.nodes.map((n) => n.gy);
  const cx = (Math.min(...gxs) + Math.max(...gxs)) / 2;
  const cy = (Math.min(...gys) + Math.max(...gys)) / 2;
  const opp = { e: "w", w: "e", n: "s", s: "n" };
  return (nd) => {
    const dx = nd.gx - cx;
    const dy = (nd.gy - cy) * 1.2;
    const hz = dx >= 0 ? "e" : "w";
    const vt = dy >= 0 ? "s" : "n";
    return Math.abs(dx) >= Math.abs(dy) ? [hz, vt, opp[vt], opp[hz]] : [vt, hz, opp[hz], opp[vt]];
  };
}

/** For each person still in G (`alive`), how many of the others in G they know. */
function counts(adj, alive) {
  const c = {};
  for (const u of alive) c[u] = [...adj.get(u)].filter((x) => alive.has(x)).length;
  return c;
}

function adjOf(graph) {
  const adj = new Map(graph.nodes.map((n) => [n.id, new Set()]));
  for (const e of graph.edges) {
    adj.get(e.from).add(e.to);
    adj.get(e.to).add(e.from);
  }
  return adj;
}

/** The removals Largest-Group makes, in order, and the group it returns. */
function simulate(graph, k) {
  const adj = adjOf(graph);
  const alive = new Set(graph.nodes.map((n) => n.id));
  const removed = [];
  for (;;) {
    const c = counts(adj, alive);
    const below = [...alive].filter((u) => c[u] < k).sort();
    if (!below.length) return { removed, group: [...alive].sort() };
    alive.delete(below[0]);
    removed.push(below[0]);
  }
}

/** Whether segments p–q and a–b cross at a point inside both. */
function cross(p, q, a, b) {
  const o = (u, v, w) => (v.x - u.x) * (w.y - u.y) - (v.y - u.y) * (w.x - u.x);
  return o(p, q, a) * o(p, q, b) < 0 && o(a, b, p) * o(a, b, q) < 0;
}

/** Whether segment p–q passes through the box b = { x0, y0, x1, y1 } (as _graf.js tests it). */
function segHitsRect(p, q, b) {
  let t0 = 0;
  let t1 = 1;
  const dx = q.x - p.x;
  const dy = q.y - p.y;
  for (const [pp, qq] of [[-dx, p.x - b.x0], [dx, b.x1 - p.x], [-dy, p.y - b.y0], [dy, b.y1 - p.y]]) {
    if (pp === 0) {
      if (qq < 0) return false;
    } else {
      const t = qq / pp;
      if (pp < 0) t0 = Math.max(t0, t);
      else t1 = Math.min(t1, t);
      if (t0 > t1) return false;
    }
  }
  return true;
}

/**
 * Whether every count finds a side where it touches no edge, no person and no
 * other count, at the phone's stage size: the boxes are the ones stampSides
 * in _graf.js tests, for the widest count «3→2».
 */
function countsFit(graph) {
  const { w, h } = PHONE;
  const { pos, r } = layout(graph, w, h);
  const sides = stampSides(graph, pos, () => ({ r }), () => STAMP_CHARS, preferFor(graph), { w, h });
  const cw = 7 * STAMP_CHARS;
  const placed = [kLabel(graph, pos, w, h).box];
  for (const nd of graph.nodes) {
    const q = pos.get(nd.id);
    const b = placed[0];
    if (q.x + r + 2 > b.x0 && q.x - r - 2 < b.x1 && q.y + r + 2 > b.y0 && q.y - r - 2 < b.y1) return false;
  }
  for (const nd of graph.nodes) {
    const p = pos.get(nd.id);
    const b = {
      n: { x0: p.x - cw / 2, x1: p.x + cw / 2, y0: p.y - r - 21, y1: p.y - r - 6 },
      s: { x0: p.x - cw / 2, x1: p.x + cw / 2, y0: p.y + r + 6, y1: p.y + r + 21 },
      e: { x0: p.x + r + 6, x1: p.x + r + 8 + cw, y0: p.y - 8, y1: p.y + 8 },
      w: { x0: p.x - r - 8 - cw, x1: p.x - r - 6, y0: p.y - 8, y1: p.y + 8 },
    }[sides.get(nd.id)];
    if (b.x0 < 0 || b.y0 < 0 || b.x1 > w || b.y1 > h) return false;
    if (graph.edges.some((e) => segHitsRect(pos.get(e.from), pos.get(e.to), b))) return false;
    for (const m of graph.nodes) {
      const q = pos.get(m.id);
      if (m !== nd && q.x + r + 2 > b.x0 && q.x - r - 2 < b.x1 && q.y + r + 2 > b.y0 && q.y - r - 2 < b.y1) return false;
    }
    if (placed.some((o) => o.x0 - 8 < b.x1 && o.x1 + 8 > b.x0 && o.y0 - 2 < b.y1 && o.y1 + 2 > b.y0)) return false;
    placed.push(b);
  }
  return true;
}

/**
 * A random instance: 8–10 people on the slots, edges only between slots whose
 * line passes no other person, k = 2 or 3. Kept when nobody is alone, two to
 * five people are removed, at least one of them knew k or more at the start
 * (so a removal cascaded), a group of at least four is left, at most two
 * pairs of edges cross, and every count has a clear spot at phone width.
 */
function randomInstance() {
  const k = 2 + Math.floor(Math.random() * 2);
  for (;;) {
    const n = 8 + Math.floor(Math.random() * 3);
    // Drop slots from the corners, so the shape stays compact; the bottom
    // right one always goes, to leave room for «k = 3».
    const corners = [11, ...shuffle([0, 2, 9]).slice(0, 11 - n)];
    const nodes = SLOTS.filter((_, i) => !corners.includes(i)).map((s, i) => ({ id: LETTERS[i], ...s }));
    // Neighbouring slots (one step) are likely to know each other; for k = 3
    // also the longer pairs that pass no one, else no core survives.
    const pairs = candidates(nodes, 0.35, k === 2 ? 1.1 : 1.85);
    const byId = new Map(nodes.map((nd) => [nd.id, nd]));
    const len = ([a, b]) => Math.hypot(byId.get(a).gx - byId.get(b).gx, byId.get(a).gy - byId.get(b).gy);
    const p = (pr) => (len(pr) < 1.1 ? (k === 2 ? 0.5 : 0.7) : 0.3);
    const edges = pairs.filter((pr) => Math.random() < p(pr)).map(([from, to]) => ({ from, to }));
    const graph = { undirected: true, nodes, edges };
    const adj = adjOf(graph);
    if ([...adj.values()].some((s) => s.size === 0)) continue;
    const { removed, group } = simulate(graph, k);
    if (removed.length < 2 || removed.length > 5 || group.length < 4) continue;
    if (!removed.some((u) => adj.get(u).size >= k)) continue;
    const at = (id) => ({ x: byId.get(id).gx, y: byId.get(id).gy });
    let crossings = 0;
    for (let i = 0; i < edges.length; i++) {
      for (let j = i + 1; j < edges.length; j++) {
        const [a, b] = [edges[i], edges[j]];
        if (cross(at(a.from), at(a.to), at(b.from), at(b.to))) crossings++;
      }
    }
    if (crossings > 2 || !countsFit(graph)) continue;
    return { k, graph };
  }
}

/** «a», «a og b», «a, b og c». */
function list(xs) {
  return xs.length < 2 ? xs.join("") : `${xs.slice(0, -1).join(", ")} og ${xs[xs.length - 1]}`;
}

// The first view must be the designed graph (the module text describes it),
// also when the reader comes back to the page or the module mounts this
// stepper twice. The framework calls defaultData() on mount and on shuffle,
// and it marks a figure ready just before the mount call, so a call while one
// of this module's ready figures has not drawn yet is that figure's first
// load (the same test as innsetting.js in modul 01).
const SELF = new URL(import.meta.url).pathname;
const drawn = new WeakSet();
let calls = 0;
function firstLoad() {
  if (typeof document === "undefined") return false;
  for (const fig of document.querySelectorAll("[data-stepper-src]")) {
    if (new URL(fig.dataset.stepperSrc, location.href).pathname !== SELF) continue;
    const stage = fig.querySelector(".stepper-stage");
    if (fig.dataset.ready === "true" && stage && !drawn.has(stage)) return true;
  }
  return false;
}

/** An ordinary acquaintance: clear at phone width, unlike EDGE.plain. */
const KNOWS = { stroke: "var(--muted)", wdt: 1.4 };
const f1 = (v) => v.toFixed(1);

export default {
  defaultData() {
    if (calls++ === 0 || firstLoad()) return FIRST;
    return randomInstance();
  },

  run({ graph, k }) {
    const adj = adjOf(graph);
    const alive = new Set(graph.nodes.map((n) => n.id));
    const removed = [];
    const frames = [];
    const snap = (line, desc, vars, extra = {}) =>
      frames.push({ line, desc, vars, graph, k, alive: new Set(alive), count: counts(adj, alive), ...extra });

    for (;;) {
      const c = counts(adj, alive);
      const below = [...alive].filter((u) => c[u] < k).sort();
      const others = removed.length ? "dem som er igjen" : "de andre";
      if (!below.length) {
        const group = [...alive].sort();
        snap(
          [2, 3],
          `${removed.length ? "Alle som er igjen," : "Alle"} kjenner minst ${k} av de andre. I dette grunntilfellet returnerer kallet ${list(group)}.`,
          { k, p: "–" },
          { done: true },
        );
        if (removed.length) {
          snap(
            5,
            `${removed.length === 1 ? "Kallet" : "Kallene"} som fjernet ${list([...removed].reverse())}, returnerer den samme gruppa uendret. Svaret er ${list(group)}.`,
            { k },
            { done: true },
          );
        }
        break;
      }

      const now = removed.length ? " nå" : "";
      let check;
      if (below.length > 1) check = `${list(below)} kjenner færre enn ${k} av ${others}.`;
      else if (c[below[0]] === 0) check = `${below[0]} kjenner${now} ingen av ${others}.`;
      else check = `${below[0]} kjenner${now} bare ${c[below[0]]} av ${others}, færre enn k\u00a0=\u00a0${k}.`;
      snap(2, check, { k, p: "–" });

      const v = below[0];
      snap(
        4,
        c[v] === 0
          ? `p = ${v}. ${v} kjenner ingen av ${others} og kan ikke være med i svaret.`
          : `p = ${v}. ${v} kjenner høyst ${c[v]} av de andre i enhver gruppe og kan ikke være med i svaret.`,
        { k, p: v },
        { cur: v },
      );

      const nbrs = [...adj.get(v)].filter((u) => alive.has(u)).sort();
      alive.delete(v);
      removed.push(v);
      snap(
        5,
        `${v} fjernes, og Largest-Group kalles på dem som er igjen. ` +
          (nbrs.length ? `${list(nbrs)} kjenner nå én person færre.` : "Ingen andre tall endres."),
        { k, p: v },
        { dropped: Object.fromEntries(nbrs.map((u) => [u, c[u]])) },
      );
    }
    return frames;
  },

  render(stage, frame, api) {
    drawn.add(stage);
    const { w, h } = api.getSize();
    const { graph, k } = frame;
    if (!graph || w <= 0 || h <= 0) {
      stage.innerHTML = "";
      return;
    }

    const { pos, r } = layout(graph, w, h);
    const shape = { r };

    const alive = frame.alive;
    const dropped = frame.dropped ?? {};
    const live = (e) => alive.has(e.from) && alive.has(e.to);
    const counted = (e) => frame.cur != null && live(e) && (e.from === frame.cur || e.to === frame.cur);
    const geom = (e) => lineGeom(pos.get(e.from), pos.get(e.to), shape, shape);

    // Edges, bottom to top: those of removed people (faded), the ordinary
    // ones, and the ones the step counts (accent). The answer's edges are
    // green over a green band.
    let svg = "";
    for (const e of graph.edges) if (!live(e)) svg += edgeSvg(geom(e), EDGE.faded);
    for (const e of graph.edges) {
      if (!live(e) || counted(e)) continue;
      const g = geom(e);
      if (frame.done) {
        svg +=
          `<path d="${g.d}" fill="none" stroke-linecap="round" ` +
          `style="stroke:color-mix(in srgb, var(--green) 30%, transparent)" stroke-width="10"/>`;
        svg += edgeSvg(g, { stroke: "var(--green)", wdt: 2.2 });
      } else svg += edgeSvg(g, KNOWS);
    }
    for (const e of graph.edges) if (counted(e)) svg += edgeSvg(geom(e), EDGE.cur);

    // People. A removed person stays where they were, dashed and faint.
    for (const nd of graph.nodes) {
      const p = pos.get(nd.id);
      const c = `cx="${f1(p.x)}" cy="${f1(p.y)}"`;
      const label = (ink) =>
        `<text x="${f1(p.x)}" y="${f1(p.y + 4)}" text-anchor="middle" style="fill:${ink};${FONT};font-weight:600">${esc(nd.id)}</text>`;
      if (frame.cur === nd.id) {
        svg += `<circle ${c} r="${r + 4}" style="fill:none;stroke:var(--accent)" stroke-width="2.4"/>`;
      }
      if (!alive.has(nd.id)) {
        svg +=
          `<circle ${c} r="${r}" style="fill:none;stroke:var(--faint)" stroke-width="1.4" stroke-dasharray="3 3"/>` +
          label("var(--faint)");
      } else if (frame.done) {
        svg +=
          `<circle ${c} r="${r}" style="fill:color-mix(in srgb, var(--green) 22%, var(--bg));stroke:var(--green)" stroke-width="2.6"/>` +
          label("var(--fg)");
      } else {
        svg += `<circle ${c} r="${r}" style="fill:${NODE.white.fill};stroke:${NODE.white.stroke}" stroke-width="1.4"/>` + label(NODE.white.text);
      }
    }

    // The count beside every person in G, on the side facing away from the
    // middle of the graph where there is room. The sides are chosen once for
    // the whole graph and for the widest count («3→2»), so a count never jumps
    // to another side of its person from one frame to the next.
    const text = (u) => (u in dropped ? `${dropped[u]}→${frame.count[u]}` : String(frame.count[u]));
    const sides = stampSides(graph, pos, () => shape, () => STAMP_CHARS, preferFor(graph), { w, h });
    for (const nd of graph.nodes) {
      const u = nd.id;
      if (!alive.has(u)) continue;
      const colour = u in dropped ? "var(--orange)" : frame.count[u] < k ? "var(--red)" : "var(--muted)";
      const bold = u in dropped || frame.count[u] < k;
      svg += stampAt(pos.get(u), r, sides.get(u), text(u), colour, bold);
    }

    // k, under the graph at the right, where the slide puts it.
    const kl = kLabel(graph, pos, w, h);
    svg +=
      `<text x="${f1(kl.x)}" y="${f1(kl.y)}" text-anchor="end" ` +
      `style="fill:var(--muted);font-family:var(--font-mono);font-size:var(--text-sm)"><tspan style="font-style:italic">k</tspan> = ${k}</text>`;

    stage.innerHTML = wrapSvg(w, h, svg);
  },
};

/** A count beside a node, as _graf.js's stamp, with an optional bold weight. */
function stampAt(p, r, side, t, colour, bold) {
  const gap = 8;
  const at = {
    n: [p.x, p.y - r - gap - 1, "middle"],
    s: [p.x, p.y + r + gap + 10, "middle"],
    e: [p.x + r + gap, p.y + 4, "start"],
    w: [p.x - r - gap, p.y + 4, "end"],
  }[side];
  return (
    `<text x="${at[0].toFixed(1)}" y="${at[1].toFixed(1)}" text-anchor="${at[2]}" ` +
    `style="fill:${colour};${FONT}${bold ? ";font-weight:600" : ""}">${esc(t)}</text>`
  );
}
