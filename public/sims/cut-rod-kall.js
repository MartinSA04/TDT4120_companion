/**
 * «Kallene til Cut-Rod» for TDT4120 modul 07 «Dynamisk programmering».
 *
 * The one idea: Cut-Rod(p, n) calls itself on every shorter length, so its
 * calls form a tree with 2^n nodes, but there are only n + 1 different
 * lengths. Storing each answer the first time folds every later call on the
 * same length into a lookup, and merging the calls on one length into one
 * node gives the delinstansgraf.
 *
 * Three views of one run, chosen with the buttons:
 *  - «uten lagring»: the whole call tree, root n at the top and the children
 *    n − 1, n − 2, …, 0 left to right, as Cut-Rod's loop makes the calls
 *    (CLRS fig. 14.3). The first call on each length (in call order: the left
 *    spine n, n − 1, …, 0) is solid. Every other call is on a length that was
 *    already solved earlier in the run; it is dashed and faint, and so is
 *    everything below it. 2^n calls.
 *  - «med lagring»: Memoized-Cut-Rod. The spine still recurses; every other
 *    call is a lookup (a dashed ring) and the subtree under it is gone.
 *    1 + n(n + 1)/2 calls: the spine call on length k makes k calls.
 *  - «delinstansgraf»: the calls on one length merge into one node. Nodes
 *    0 … n in a column, n at the top (at the height the spine had), and an
 *    arrow from j up to k for every j < k, n(n + 1)/2 arrows. The arrows go
 *    from the subinstance to the instance that builds on it, as the lecture
 *    draws them (the book draws them the other way). Neighbours are joined
 *    by a straight arrow; longer arrows bend, odd spans to the right and
 *    even spans to the left, wider for a longer span.
 *
 * Numbers the module text may use (checked by running callCounts in node):
 *   n = 4: 16 calls; lengths 4, 3, 2, 1, 0 are called 1, 1, 2, 4, 8 times;
 *          with storage 11 calls; the graph has 5 nodes and 10 arrows.
 *   n = 7: 128 calls; with storage 29; 8 nodes, 28 arrows.
 *   In general a call on length k occurs 2^(n−k−1) times for k < n.
 *
 * Tapping a node marks every node of the same length (accent); tapping a
 * marked node or the background clears the mark. The mark survives a change
 * of view and is cleared when n changes.
 *
 * A label at the top left gives the count for the view: «16 kall», «11 kall»
 * or «5 delinstanser, 10 piler». No other readout.
 *
 * Changing the view animates every node and edge from where it is to where
 * it belongs (0,55 s, none under prefers-reduced-motion): calls that vanish
 * shrink into the lookup or node that replaces them. Changing n redraws.
 * Lengths are written in the nodes while the radius allows (on a phone up to
 * n = 5), dots above.
 *
 * Colours are framework tokens only (the marks of steppers/_tre.js), so the
 * drawing re-themes on the light/dark toggle.
 *
 * Contract: default-export init(api); host="dom", so api = { stage, controls,
 * getSize, onResize, signal }.
 */
import { MARK, EDGE, FONT, text, svgWrap, remPx } from "../steppers/_tre.js";

export const N_MIN = 1;
export const N_MAX = 7;
const N_DEFAULT = 4;
const ANIM_MS = 550;

const VIEWS = {
  uten: { label: "uten lagring", aria: "Uten lagring: hele treet av kall Cut-Rod gjør" },
  med: { label: "med lagring", aria: "Med lagring: Memoized-Cut-Rod, der et kall på en lengde som er løst før, slår opp svaret" },
  graf: { label: "delinstansgraf", aria: "Delinstansgraf: én node per lengde og en pil fra hver delinstans til instansen som bygger på den" },
};

/**
 * The call tree of Cut-Rod(p, n). Each node: { k, parent, depth, kids,
 * spine, memo, anchor }. spine = the first call on its length (the left
 * spine); memo = the call happens with storage too (the spine and the
 * spine's other children, which are lookups); anchor = the nearest memo node
 * at or above it.
 */
export function buildTree(n) {
  const nodes = [];
  const rec = (k, parent, depth, spine) => {
    const idx = nodes.length;
    const memo = spine || (parent >= 0 && nodes[parent].spine);
    nodes.push({ k, parent, depth, kids: [], spine, memo, anchor: memo ? idx : nodes[parent].anchor });
    if (parent >= 0) nodes[parent].kids.push(idx);
    for (let i = 1; i <= k; i++) rec(k - i, idx, depth + 1, spine && i === 1);
    return idx;
  };
  rec(n, -1, 0, true);
  return nodes;
}

/** Calls without and with storage, and the graph's nodes and arrows. */
export function callCounts(n) {
  const nodes = buildTree(n);
  const per = Array(n + 1).fill(0);
  nodes.forEach((v) => per[v.k]++);
  return { calls: nodes.length, memo: nodes.filter((v) => v.memo).length, perLength: per, graphNodes: n + 1, arrows: (n * (n + 1)) / 2 };
}

/** Tidy layout of the subtree of nodes passing `keep`: leaves evenly spaced, a parent over its outer children. */
function tidy(nodes, keep, box) {
  const leaves = [];
  const walk = (i) => {
    const ks = nodes[i].kids.filter((c) => keep(nodes[c]));
    if (!ks.length) leaves.push(i);
    ks.forEach(walk);
  };
  walk(0);
  const pitch = box.w / Math.max(1, leaves.length);
  const x = new Map();
  leaves.forEach((i, r) => x.set(i, box.x0 + (r + 0.5) * pitch));
  const place = (i) => {
    const ks = nodes[i].kids.filter((c) => keep(nodes[c]));
    if (!ks.length) return x.get(i);
    const xs = ks.map(place);
    const xi = (xs[0] + xs[xs.length - 1]) / 2;
    x.set(i, xi);
    return xi;
  };
  place(0);
  return { x, pitch };
}

const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const lerp = (a, b, t) => a + (b - a) * t;
const f1 = (v) => (Math.round(v * 10) / 10).toString();

export default function init({ stage, controls, getSize, onResize, signal }) {
  let n = N_DEFAULT;
  let view = "uten";
  let sel = null; // marked length, or null
  let nodes = buildTree(n);
  let shown = null; // the state on screen: { P: [...], E: [...], label }
  let anim = null; // { from, to, t0 }
  let raf = 0;
  const reduced = typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ── controls ────────────────────────────────────────────────────────────
  const group = document.createElement("div");
  group.setAttribute("role", "group");
  group.setAttribute("aria-label", "Hvilke kall som vises");
  group.style.cssText =
    "display:flex;flex-direction:column;gap:var(--space-2);font-family:var(--font-mono);font-size:var(--text-xs);color:var(--muted)";
  const head = document.createElement("span");
  head.textContent = "Kall";
  const row = document.createElement("span");
  row.style.cssText = "display:flex;flex-wrap:wrap;gap:var(--space-2)";
  const btns = {};
  for (const key of Object.keys(VIEWS)) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "sim-btn";
    b.textContent = VIEWS[key].label;
    b.setAttribute("aria-label", VIEWS[key].aria);
    b.addEventListener(
      "click",
      () => {
        if (view === key) return;
        view = key;
        sync();
        go(true);
      },
      { signal },
    );
    btns[key] = b;
    row.append(b);
  }
  group.append(head, row);

  const label = document.createElement("label");
  label.append("n ");
  const out = document.createElement("output");
  const input = document.createElement("input");
  input.type = "range";
  input.min = String(N_MIN);
  input.max = String(N_MAX);
  input.step = "1";
  input.value = String(n);
  input.setAttribute("aria-label", "Lengden n på staven");
  label.append(out, input);
  input.addEventListener(
    "input",
    () => {
      n = Number(input.value);
      nodes = buildTree(n);
      sel = null;
      sync();
      go(false);
    },
    { signal },
  );
  controls.append(group, label);

  function sync() {
    for (const k of Object.keys(btns)) btns[k].setAttribute("aria-pressed", String(k === view));
    out.textContent = String(n);
  }

  // ── layout of one view ──────────────────────────────────────────────────
  // Returns P[i] = { x, y, r, a, mark } per node and E[c] = { x1, y1, x2,
  // y2, cx, cy, a, head, mark } for the edge from c's parent to c.
  function layout(v) {
    const { w, h } = getSize();
    const rem = remPx();
    const fsLab = 0.84 * rem;
    const headH = fsLab + 10;
    const levels = n; // depths 0 … n
    const rMaxTree = 0.78 * rem;
    const below = rMaxTree + 6;
    const avail = h - headH - rMaxTree - 4 - below;
    const dy = levels ? Math.min(62, avail / levels) : 0;
    const y0 = headH + rMaxTree + 4 + Math.max(0, (avail - levels * dy) / 2);
    const yOf = (depth) => y0 + depth * dy;
    const box = { x0: 6, w: w - 12 };
    const P = new Array(nodes.length);
    const E = new Array(nodes.length);
    const capR = (pitch) => Math.min(rMaxTree, 0.42 * pitch, 0.34 * (dy || 99));

    if (v === "graf") {
      const xc = w / 2;
      const r = Math.min(0.9 * rem, 0.34 * (dy || 99));
      const at = (k) => ({ x: xc, y: yOf(n - k) });
      const span = Math.max(1, (w / 2 - 14 - r) * 2); // a bend B reaches B/2 from the column
      const bend = (s) => (s <= 1 ? 0 : ((s % 2 ? 1 : -1) * span * (n <= 2 ? 1 : (s - 1) / (n - 1))));
      nodes.forEach((v2, i) => {
        const a = nodes[v2.anchor];
        const p = at(a.k);
        P[i] = { x: p.x, y: p.y, r: v2.spine ? r : v2.memo ? r : 0, a: v2.spine ? 1 : 0, mark: "plain" };
      });
      nodes.forEach((c, i) => {
        if (c.parent < 0) return;
        const par = nodes[c.parent];
        if (c.memo) {
          const from = at(c.k);
          const to = at(par.k);
          const b = bend(par.k - c.k);
          E[i] = { x1: from.x, y1: from.y, x2: to.x, y2: to.y, cx: from.x + b, cy: (from.y + to.y) / 2, a: 1, head: 1, mark: "plain", r1: r, r2: r };
        } else {
          const p = at(nodes[c.anchor].k);
          E[i] = { x1: p.x, y1: p.y, x2: p.x, y2: p.y, cx: p.x, cy: p.y, a: 0, head: 0, mark: "plain", r1: 0, r2: 0 };
        }
      });
      return { P, E, label: `${n + 1} delinstanser, ${(n * (n + 1)) / 2} ${n * (n + 1) === 2 ? "pil" : "piler"}` };
    }

    const keep = v === "med" ? (x) => x.memo : () => true;
    const { x, pitch } = tidy(nodes, keep, box);
    const r = capR(pitch);
    nodes.forEach((v2, i) => {
      const kept = keep(v2);
      const a = kept ? i : v2.anchor;
      const mark = v === "uten" ? (v2.spine ? "plain" : "outside") : v2.spine ? "plain" : "slot";
      P[i] = { x: x.get(a), y: yOf(nodes[a].depth), r: kept ? r : 0, a: kept ? 1 : 0, mark };
    });
    nodes.forEach((c, i) => {
      if (c.parent < 0) return;
      const kept = keep(c);
      const pp = P[c.parent];
      const pc = P[i];
      const mark = v === "uten" ? (c.spine ? "plain" : "outside") : c.spine ? "plain" : "slot";
      if (kept) {
        E[i] = { x1: pc.x, y1: pc.y, x2: pp.x, y2: pp.y, cx: (pc.x + pp.x) / 2, cy: (pc.y + pp.y) / 2, a: 1, head: 0, mark, r1: r, r2: r };
      } else {
        E[i] = { x1: pc.x, y1: pc.y, x2: pc.x, y2: pc.y, cx: pc.x, cy: pc.y, a: 0, head: 0, mark, r1: 0, r2: 0 };
      }
    });
    const count = v === "uten" ? nodes.length : nodes.filter((v2) => v2.memo).length;
    return { P, E, label: `${count} kall` };
  }

  function mix(A, B, t) {
    const P = A.P.map((p, i) => {
      const q = B.P[i];
      return { x: lerp(p.x, q.x, t), y: lerp(p.y, q.y, t), r: lerp(p.r, q.r, t), a: lerp(p.a, q.a, t), mark: q.mark };
    });
    const E = A.E.map((e, i) => {
      if (!e) return e;
      const f = B.E[i];
      const o = {};
      for (const k of ["x1", "y1", "x2", "y2", "cx", "cy", "a", "head", "r1", "r2"]) o[k] = lerp(e[k], f[k], t);
      o.mark = f.mark;
      return o;
    });
    return { P, E, label: B.label };
  }

  // ── drawing ─────────────────────────────────────────────────────────────
  function draw(S) {
    const { w, h } = getSize();
    if (w <= 0 || h <= 0) {
      stage.innerHTML = "";
      return;
    }
    const rem = remPx();
    const fsLab = 0.84 * rem;
    const LAB = `${FONT};font-size:${f1(fsLab)}px`;
    let svg = "";

    // Edges, the dashed ones first.
    const order = [...S.E.keys()].filter((i) => S.E[i] && S.E[i].a > 0.02);
    order.sort((i, j) => (S.E[i].mark === "plain") - (S.E[j].mark === "plain"));
    for (const i of order) {
      const e = S.E[i];
      const st = EDGE[e.mark] ?? EDGE.plain;
      // Trim both ends to the circles: step along the curve's end tangents.
      const t1x = e.cx - e.x1, t1y = e.cy - e.y1;
      const t2x = e.cx - e.x2, t2y = e.cy - e.y2;
      const d1 = Math.hypot(t1x, t1y) || 1, d2 = Math.hypot(t2x, t2y) || 1;
      const sx = e.x1 + (t1x / d1) * e.r1, sy = e.y1 + (t1y / d1) * e.r1;
      const ex = e.x2 + (t2x / d2) * (e.r2 + e.head * 2.5), ey = e.y2 + (t2y / d2) * (e.r2 + e.head * 2.5);
      const thin = e.r1 < 5 && e.mark !== "plain";
      const wdt = e.r1 < 5 ? 1 : st.wdt;
      const dash = st.dash ? ` stroke-dasharray="${thin ? "2 2" : st.dash}"` : "";
      svg += `<path d="M${f1(sx)} ${f1(sy)} Q${f1(e.cx)} ${f1(e.cy)} ${f1(ex)} ${f1(ey)}" fill="none" style="stroke:${st.stroke};opacity:${f1(e.a)}" stroke-width="${wdt}" stroke-linecap="round"${dash}/>`;
      if (e.head > 0.02) {
        // An arrowhead at the instance end, along the end tangent.
        const ux = -t2x / d2, uy = -t2y / d2;
        const tipx = e.x2 - ux * e.r2, tipy = e.y2 - uy * e.r2;
        const L = 7, W = 3.6;
        const bx = tipx - ux * L, by = tipy - uy * L;
        svg += `<path d="M${f1(tipx)} ${f1(tipy)} L${f1(bx - uy * W)} ${f1(by + ux * W)} L${f1(bx + uy * W)} ${f1(by - ux * W)} Z" style="fill:${st.stroke};opacity:${f1(e.head * e.a)}"/>`;
      }
    }

    // Nodes: the vanishing ones first, the marked length on top.
    const ids = [...S.P.keys()].filter((i) => S.P[i].a > 0.02 && S.P[i].r > 0.4);
    ids.sort((i, j) => S.P[i].a - S.P[j].a || (nodes[i].k === sel) - (nodes[j].k === sel));
    for (const i of ids) {
      const p = S.P[i];
      const mk = nodes[i].k === sel ? "current" : p.mark;
      const m = MARK[mk] ?? MARK.plain;
      const op = `opacity:${f1(p.a)}`;
      if (p.r >= 5) {
        const dash = m.dash ? ` stroke-dasharray="${m.dash}"` : "";
        svg += `<circle cx="${f1(p.x)}" cy="${f1(p.y)}" r="${f1(p.r)}" style="fill:${m.fill};stroke:${m.stroke};${op}" stroke-width="${m.wdt}"${dash}/>`;
        if (p.r >= 6.5) {
          const fs = Math.min(0.84 * rem, 1.15 * p.r);
          svg += `<text x="${f1(p.x)}" y="${f1(p.y + fs * 0.36)}" text-anchor="middle" style="${FONT};font-size:${f1(fs)}px;font-weight:600;fill:${m.text};${op}">${nodes[i].k}</text>`;
        }
      } else if (mk === "slot" || mk === "outside") {
        svg += `<circle cx="${f1(p.x)}" cy="${f1(p.y)}" r="${f1(Math.max(0.5, p.r - 0.5))}" style="fill:none;stroke:${mk === "outside" ? "var(--faint)" : MARK.slot.stroke};${op}" stroke-width="1"/>`;
      } else {
        const col = mk === "current" ? "var(--accent)" : "color-mix(in srgb, var(--fg) 60%, transparent)";
        const rr = mk === "current" ? p.r * 1.4 : p.r;
        svg += `<circle cx="${f1(p.x)}" cy="${f1(p.y)}" r="${f1(rr)}" style="fill:${col};${op}"/>`;
      }
    }

    svg += text(6, fsLab + 2, S.label, `${LAB};font-weight:700;fill:var(--fg)`, "start");

    const c = callCounts(n);
    const what =
      view === "uten"
        ? `Uten lagring gjør Cut-Rod(p, ${n}) ${c.calls} kall. Lengdene ${n} ned til 0 kalles ${c.perLength.slice().reverse().join(", ")} ganger.`
        : view === "med"
          ? `Med lagring gjør Cut-Rod ${c.memo} kall: det første kallet på hver lengde løser den, de andre slår opp svaret.`
          : `Delinstansgrafen har ${c.graphNodes} noder, lengdene 0 til ${n}, og ${c.arrows} piler, én fra hver kortere lengde til hver lengre.`;
    stage.setAttribute("role", "img");
    stage.setAttribute("aria-label", what + (sel !== null ? ` Lengde ${sel} er markert.` : ""));
    stage.innerHTML = svgWrap(w, h, svg).replace("<svg ", '<svg aria-hidden="true" ');
  }

  function frame(now) {
    if (signal?.aborted) return;
    if (!anim) return;
    const t = Math.min(1, (now - anim.t0) / ANIM_MS);
    shown = t >= 1 ? anim.to : mix(anim.from, anim.to, ease(t));
    draw(shown);
    if (t < 1) raf = requestAnimationFrame(frame);
    else anim = null;
  }

  function go(animate) {
    const target = layout(view);
    cancelAnimationFrame(raf);
    if (animate && shown && !reduced && shown.P.length === target.P.length) {
      anim = { from: shown, to: target, t0: performance.now() };
      raf = requestAnimationFrame(frame);
    } else {
      anim = null;
      shown = target;
      draw(shown);
    }
  }

  // Tap: mark the length of the nearest visible node, or clear.
  stage.addEventListener(
    "click",
    (ev) => {
      if (!shown) return;
      const rect = stage.getBoundingClientRect();
      const { w, h } = getSize();
      const sx = w / rect.width, sy = h / rect.height;
      const x = (ev.clientX - rect.left) * sx, y = (ev.clientY - rect.top) * sy;
      let best = -1, bd = Infinity;
      shown.P.forEach((p, i) => {
        if (p.a < 0.5) return;
        const d = Math.hypot(p.x - x, p.y - y);
        if (d < Math.max(p.r, 4) + 8 && d < bd) (bd = d), (best = i);
      });
      sel = best < 0 || nodes[best].k === sel ? null : nodes[best].k;
      draw(shown);
    },
    { signal },
  );
  signal?.addEventListener("abort", () => cancelAnimationFrame(raf));

  sync();
  onResize(() => go(false));
  go(false);
}
