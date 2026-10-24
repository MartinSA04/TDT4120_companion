/**
 * «Huskelisten» for TDT4120 modul 09 «Traversering av grafer».
 *
 * The one idea: a traversal keeps a to-do list of nodes it has discovered but
 * not finished. Which node it takes next from the list decides the traversal
 * tree, never which nodes get visited. Taking the oldest first gives every
 * node the fewest edges from the start.
 *
 * System: a street grid of 5 × 5 crossings, the start s in the top left
 * corner. Streets go both ways. One visit takes a node u off the list, marks
 * it black, and looks at its neighbours in the order south, east, north, west:
 * a white neighbour turns gray, gets u as its forgjenger and goes on the list.
 *   eldste først  take the node that has been on the list longest (a queue)
 *   nyeste først  take the node put on the list last (a stack). A gray
 *                 neighbour seen again moves to the newest end and gets u as
 *                 its new forgjenger (the priority is updated, pensumhefte
 *                 app. F), so the visits come in a depth-first order. On the
 *                 full grid this is a snake: row by row, ending in the far
 *                 corner at 24 streets.
 *   du velger     the reader clicks the gray node to visit next.
 * «Nye gater» keeps each street with probability 0.75, so some crossings may
 * be cut off; they stay white.
 *
 * Drawing: streets are faint lines; a street in the traversal tree (from a
 * node to its forgjenger) has a soft band. Node fill = colour (empty, half,
 * full). The start node is labelled s; the number in any other gray or black node
 * = streets from s along the tree.
 * The node the rule takes next has an accent ring. No readout.
 *
 * Contract: default-export init(api); host="dom", so api = { stage, controls,
 * getSize, onResize, signal }.
 */
import { FONT, NODE, esc, wrapSvg } from "../steppers/_graf.js";

const N = 5;
const id = (x, y) => y * N + x;
const XY = (i) => [i % N, Math.floor(i / N)];
// South, east, north, west.
const DIRS = [[0, 1], [1, 0], [0, -1], [-1, 0]];

/** All streets of the full grid, as a set of "a-b" keys with a < b. */
function fullGrid() {
  const s = new Set();
  for (let y = 0; y < N; y++)
    for (let x = 0; x < N; x++) {
      if (x + 1 < N) s.add(`${id(x, y)}-${id(x + 1, y)}`);
      if (y + 1 < N) s.add(`${id(x, y)}-${id(x, y + 1)}`);
    }
  return s;
}

const key = (a, b) => (a < b ? `${a}-${b}` : `${b}-${a}`);

function randomStreets() {
  for (;;) {
    const s = new Set([...fullGrid()].filter(() => Math.random() < 0.75));
    // The start needs a street, or nothing happens.
    if (s.has(key(0, 1)) || s.has(key(0, N))) return s;
  }
}

function neighbours(streets, u) {
  const [x, y] = XY(u);
  const out = [];
  for (const [dx, dy] of DIRS) {
    const a = x + dx;
    const b = y + dy;
    if (a < 0 || b < 0 || a >= N || b >= N) continue;
    const v = id(a, b);
    if (streets.has(key(u, v))) out.push(v);
  }
  return out;
}

const RULES = {
  eldste: { label: "eldste først", aria: "Regel: besøk noden som har stått lengst på lista" },
  nyeste: { label: "nyeste først", aria: "Regel: besøk noden som kom sist på lista" },
  velger: { label: "du velger", aria: "Regel: du trykker på den grå noden som skal besøkes" },
};

export default function init({ stage, controls, getSize, onResize, signal }) {
  let streets = fullGrid();
  let rule = "eldste";
  let st;
  let timer = null;

  function reset() {
    stop();
    st = { color: new Array(N * N).fill("white"), pi: new Array(N * N).fill(null), list: [0] };
    st.color[0] = "gray";
  }

  const depth = (v) => {
    let k = 0;
    for (let u = v; st.pi[u] != null; u = st.pi[u]) k++;
    return k;
  };

  function next() {
    if (!st.list.length || rule === "velger") return null;
    return rule === "eldste" ? st.list[0] : st.list.at(-1);
  }

  function visit(u) {
    const i = st.list.indexOf(u);
    if (i < 0) return;
    st.list.splice(i, 1);
    st.color[u] = "black";
    for (const v of neighbours(streets, u)) {
      if (st.color[v] === "white") {
        st.color[v] = "gray";
        st.pi[v] = u;
        st.list.push(v);
      } else if (st.color[v] === "gray" && rule === "nyeste") {
        st.list.splice(st.list.indexOf(v), 1);
        st.list.push(v);
        st.pi[v] = u;
      }
    }
  }

  function stop() {
    if (timer != null) clearInterval(timer);
    timer = null;
  }

  // ── controls ────────────────────────────────────────────────────────────
  const mk = (label, aria, fn) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "sim-btn";
    b.textContent = label;
    b.setAttribute("aria-label", aria);
    b.addEventListener("click", fn, { signal });
    return b;
  };
  const group = document.createElement("div");
  group.setAttribute("role", "group");
  group.setAttribute("aria-label", "Regel");
  group.style.cssText =
    "display:flex;flex-direction:column;gap:var(--space-2);font-family:var(--font-mono);font-size:var(--text-xs);color:var(--muted)";
  const head = document.createElement("span");
  head.textContent = "Regel";
  const row = document.createElement("span");
  row.style.cssText = "display:flex;flex-wrap:wrap;gap:var(--space-2)";
  const ruleBtns = {};
  for (const k of Object.keys(RULES)) {
    ruleBtns[k] = mk(RULES[k].label, RULES[k].aria, () => {
      rule = k;
      reset();
      sync();
      draw();
    });
    row.append(ruleBtns[k]);
  }
  group.append(head, row);
  const one = mk("Ett besøk", "Besøk én node etter regelen", () => {
    stop();
    const u = next();
    if (u != null) visit(u);
    sync();
    draw();
  });
  const all = mk("Besøk alle", "Besøk nodene etter regelen til lista er tom", () => {
    if (timer != null) return;
    timer = setInterval(() => {
      const u = next();
      if (u == null) {
        stop();
        sync();
        return;
      }
      visit(u);
      sync();
      draw();
    }, 140);
  });
  const again = mk("Start på nytt", "Start traverseringen på nytt med de samme gatene", () => {
    reset();
    sync();
    draw();
  });
  const fresh = mk("Nye gater", "Nye gater: hver gate er med med sannsynlighet tre firedeler", () => {
    streets = randomStreets();
    reset();
    sync();
    draw();
  });
  const acts = document.createElement("span");
  acts.style.cssText = "display:flex;flex-wrap:wrap;gap:var(--space-2)";
  acts.append(one, all, again, fresh);
  controls.append(group, acts);
  signal.addEventListener("abort", stop);

  function sync() {
    for (const k of Object.keys(ruleBtns)) ruleBtns[k].setAttribute("aria-pressed", String(k === rule));
    const auto = rule !== "velger" && st.list.length > 0;
    for (const b of [one, all]) {
      b.disabled = !auto;
      b.setAttribute("aria-disabled", String(!auto));
    }
  }

  let geo = null;
  function draw() {
    const { w, h } = getSize();
    if (w <= 0 || h <= 0) return;
    const r = Math.max(11, Math.min(15, w / 26));
    const pad = r + 8;
    const step = Math.min((w - 2 * pad) / (N - 1), (h - 2 * pad) / (N - 1));
    const ox = (w - step * (N - 1)) / 2;
    const oy = (h - step * (N - 1)) / 2;
    const P = (i) => {
      const [x, y] = XY(i);
      return { x: ox + x * step, y: oy + y * step };
    };
    geo = { P, r };
    let svg = "";
    // Streets, then the tree's bands on top of them.
    for (const k of streets) {
      const [a, b] = k.split("-").map(Number);
      const p = P(a);
      const q = P(b);
      svg += `<line x1="${p.x.toFixed(1)}" y1="${p.y.toFixed(1)}" x2="${q.x.toFixed(1)}" y2="${q.y.toFixed(1)}" style="stroke:var(--faint)" stroke-width="1.4"/>`;
    }
    for (let v = 0; v < N * N; v++) {
      const u = st.pi[v];
      if (u == null) continue;
      const p = P(u);
      const q = P(v);
      svg +=
        `<line x1="${p.x.toFixed(1)}" y1="${p.y.toFixed(1)}" x2="${q.x.toFixed(1)}" y2="${q.y.toFixed(1)}" stroke-linecap="round" ` +
        `style="stroke:color-mix(in srgb, var(--fg) 16%, transparent)" stroke-width="9"/>` +
        `<line x1="${p.x.toFixed(1)}" y1="${p.y.toFixed(1)}" x2="${q.x.toFixed(1)}" y2="${q.y.toFixed(1)}" style="stroke:var(--fg)" stroke-width="1.6"/>`;
    }
    const nx = next();
    for (let v = 0; v < N * N; v++) {
      const p = P(v);
      const c = st.color[v];
      const s = NODE[c];
      if (v === nx) {
        svg += `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${(r + 4).toFixed(1)}" style="fill:none;stroke:var(--accent)" stroke-width="2.4"/>`;
      }
      const pick = rule === "velger" && c === "gray";
      svg +=
        `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${r.toFixed(1)}" style="fill:${s.fill};stroke:${pick ? "var(--accent)" : s.stroke}${pick ? ";cursor:pointer" : ""}" stroke-width="${pick ? 2 : 1.4}"/>`;
      if (c !== "white") {
        svg +=
          `<text x="${p.x.toFixed(1)}" y="${(p.y + 4).toFixed(1)}" text-anchor="middle" ` +
          `style="fill:${s.text};${FONT};font-weight:600;pointer-events:none">${v === 0 ? "s" : esc(depth(v))}</text>`;
      }
    }
    stage.innerHTML = wrapSvg(w, h, svg);
    const seen = st.color.filter((c) => c !== "white").length;
    const done = st.color.filter((c) => c === "black").length;
    stage.setAttribute(
      "aria-label",
      `Gatenett med ${N * N} kryss. Regel: ${RULES[rule].label}. ${done} kryss er besøkt og ${seen - done} står på lista.` +
        (st.list.length ? "" : " Lista er tom."),
    );
  }

  stage.addEventListener(
    "click",
    (ev) => {
      if (rule !== "velger" || !geo) return;
      const box = stage.getBoundingClientRect();
      const { w, h } = getSize();
      const x = ((ev.clientX - box.left) / box.width) * w;
      const y = ((ev.clientY - box.top) / box.height) * h;
      let best = null;
      let bd = Infinity;
      for (const v of st.list) {
        const p = geo.P(v);
        const dd = Math.hypot(p.x - x, p.y - y);
        if (dd < bd) {
          bd = dd;
          best = v;
        }
      }
      if (best != null && bd <= geo.r * 1.8) {
        visit(best);
        sync();
        draw();
      }
    },
    { signal },
  );

  reset();
  sync();
  onResize(draw);
  draw();
}
