/**
 * «To måter å bygge en haug på» for TDT4120 modul 06 «Rotfaste trestrukturer».
 *
 * The one idea: inserting n elements one at a time, each new element rises
 * up to its depth; building with Build-Max-Heap, each Max-Heapify call sinks
 * its element at most its height. Most nodes are near the bottom, where the
 * depth is large and the height is small. So for increasing input one at a
 * time costs about n lg n swaps and Build-Max-Heap fewer than n.
 *
 * The two methods, as the lecture's pseudocode (CLRS 4th ed. ch. 6):
 *  - «én og én»: from an empty heap, Max-Heap-Insert of A[1], A[2], …, A[n]
 *    in that order. Call k puts the element in slot k (A.size = k) and
 *    Max-Heap-Increase-Key lets it rise: while i > 1 and A[Parent(i)] < A[i],
 *    exchange A[i] with A[Parent(i)] and i = Parent(i). n calls.
 *  - «Build-Max-Heap»: the module shows its block next to the sim (not
 *    synced):
 *        Build-Max-Heap(A, n)
 *        1  A.size = n
 *        2  for i = ⌊n/2⌋ downto 1
 *        3      Max-Heapify(A, i)
 *    Max-Heapify(A, i) lets A[i] sink: m = the largest of A[i], A[Left(i)],
 *    A[Right(i)] (inside the heap); if m ≠ i, exchange and go on from m.
 *    ⌊n/2⌋ calls, i going from ⌊n/2⌋ down to 1.
 * A swap is one exchange (line 6 of Max-Heap-Increase-Key, line 9 of
 * Max-Heapify). A call's swaps are counted on the level it started on: the
 * level ⌊lg k⌋ of the slot the element was inserted into, or the level ⌊lg i⌋
 * of i. «stigende» is 1, 2, …, n; «tilfeldig» a uniformly random order of
 * 1 … n. Both methods get the same input.
 *
 * Numbers the module text may use (checked by running callsOf below in node):
 *   stigende, n = 15: én og én 0, 2, 8, 24 per level from the root, 34 in
 *                     all; Build-Max-Heap 3, 4, 4, 0, 11 in all.
 *   stigende, n = 31: én og én 98 (0, 2, 8, 24, 64); Build-Max-Heap 26
 *                     (4, 6, 8, 8, 0).
 *   stigende, n = 63: én og én 258 (0, 2, 8, 24, 64, 160); Build-Max-Heap 57
 *                     (5, 8, 12, 16, 16, 0).
 *   tilfeldig, total swaps over 10 000 random inputs (mean, 5 % – 95 %, the
 *   largest seen in two such runs):
 *     n = 15: én og én 11,2 (6–17, 26);   Build-Max-Heap 7,8 (5–10, 11)
 *     n = 31: én og én 28,3 (19–38, 53);  Build-Max-Heap 18,8 (14–23, 26)
 *     n = 63: én og én 65,3 (51–80, 108); Build-Max-Heap 41,6 (35–48, 53)
 *   Worst case. Én og én: an element inserted in slot k rises at most ⌊lg k⌋
 *   levels, and increasing input makes every one rise to the root, so
 *   stigende is the worst case for every n (no random input exceeded it,
 *   20 000 per n for n = 3 … 63; all inputs for n ≤ 9). Build-Max-Heap: a
 *   call sinks at most the height of i, and stigende reaches that sum when
 *   the tree is full (n = 7, 15, 31, 63: 4, 11, 26, 57), so there it is the
 *   worst case. Not for every n: n = 8 has 7 as its most (e.g. 1 5 4 7 2 3 6
 *   8) against 6 for stigende, and random inputs also beat stigende by 1–2 at
 *   n = 12, 16, 17, 20, 21, 24, 25, 28, 29, 32, 33 and 49.
 * The first random inputs (FIRST_SEED): n = 15: 2 12 11 3 4 9 15 1 8 13 14 6
 * 7 5 10, én og én 0, 1, 4, 6 = 11, Build-Max-Heap 3, 3, 2, 0 = 8; n = 31:
 * 28 and 19; n = 63: 66 and 42.
 *
 * State: the calls done so far, 0 … n (én og én) or 0 … ⌊n/2⌋ (Build-Max-Heap).
 * «Neste kall» runs one more, «Alle kall» all that are left, «Start på nytt»
 * goes back to zero calls, «Trekk på nytt» deals a new random input (disabled
 * unless «tilfeldig») and goes back to zero calls. Changing the method, the
 * input or n also goes back to zero calls (pressing the method or input
 * already chosen changes nothing). First view: «én og én»,
 * «stigende», n = 15, zero calls: an empty heap of 15 dashed slots.
 *
 * Drawing (one SVG, sizes in CSS px from remPx(), so it follows the reader's
 * text size). The heap as a tree laid out with heapPos (CLRS fig. 6.1): node i
 * at depth ⌊lg i⌋, the 2^d places of level d spread over the width. Keys in
 * the nodes when n ≤ 15, small dots above. For «én og én», slots not filled
 * yet are MARK.slot circles (dashed) with dashed edges. The part that is
 * already a heap is MARK.done (green): for «én og én» every filled slot; for
 * Build-Max-Heap every node i' ≥ i, where i is the last call's i (before the
 * first call, every leaf, i' > ⌊n/2⌋), which is exactly CLRS's loop
 * invariant: each of i, i + 1, …, n is the root of a max-heap. So the green
 * spreads upward, back through the reading order, as the calls go. The last
 * call's element is MARK.current at its final place, and the way it rose or
 * sank is EDGE.path. On the right of each level, the swaps made so far by
 * calls that started on that level, e.g. «24» (accent for the level of the
 * last call); at the top left the total, «bytter: 34». No other readout.
 *
 * The random input comes from a seeded generator (mulberry32) salted with n,
 * so every n shows one fixed input until «Trekk på nytt» draws a fresh seed
 * from Math.random; FIRST_SEED is chosen so the first random inputs give
 * typical totals.
 *
 * Colours are framework tokens only (the marks of steppers/_tre.js), so the
 * drawing re-themes on the light/dark toggle. No animation.
 *
 * Contract: default-export init(api); host="dom", so api = { stage, controls,
 * getSize, onResize, signal }.
 */
import { MARK, EDGE, FONT, node, edge, text, heapPos, svgWrap, remPx, textW } from "../steppers/_tre.js";

export const N_MIN = 3;
export const N_MAX = 63;
const N_DEFAULT = 15;
/** Keys in the nodes up to this n, dots above. */
const KEYS_MAX = 15;
/** Seed of the first random inputs (see the header). */
const FIRST_SEED = 1498;

const METHODS = {
  enOgEn: { label: "én og én", aria: "Én og én: Max-Heap-Insert av hvert element i tur og orden" },
  build: { label: "Build-Max-Heap", aria: "Build-Max-Heap: Max-Heapify fra ⌊n/2⌋ ned til 1" },
};
const INPUTS = {
  stigende: { label: "stigende", aria: "Stigende input: 1, 2, …, n" },
  tilfeldig: { label: "tilfeldig", aria: "Tilfeldig input" },
};

/** A small seeded generator (mulberry32): returns numbers in [0, 1). */
function mulberry32(a) {
  return function () {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** One seed per (seed, n), so each n has its own stream. */
const salt = (seed, n) => (seed ^ Math.imul(n, 0x9e3779b1)) >>> 0;

/** A random order of 1 … n: Fisher–Yates with `rnd`. */
export function shuffled(n, rnd) {
  const a = Array.from({ length: n }, (_, i) => i + 1);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    const t = a[i];
    a[i] = a[j];
    a[j] = t;
  }
  return a;
}

/** The input A[1 : n] (as a 0-based JS array) for an input kind. */
export function inputOf(kind, n, seed) {
  if (kind === "stigende") return Array.from({ length: n }, (_, i) => i + 1);
  return shuffled(n, mulberry32(salt(seed, n)));
}

/** Level (depth) of heap node i, 1-based: ⌊lg i⌋. */
const level = (i) => 31 - Math.clz32(i);

/** The number of calls a method makes on n elements. */
export const callCount = (method, n) => (method === "enOgEn" ? n : Math.floor(n / 2));

/**
 * Runs the first `upTo` calls of a method on `input` (default: all). Returns
 * A (1-based: A[0] unused, null for a slot not filled yet), size (A.size),
 * the swaps per level (index = level), the total, and the last call:
 * { start, level, swaps, path } with path = the slots its element passed,
 * from where the call started to where the element ended.
 */
export function callsOf(method, input, upTo = Infinity) {
  const n = input.length;
  const A = new Array(n + 1).fill(null);
  const levels = new Array(level(n) + 1).fill(0);
  let total = 0;
  let size = 0;
  let last = null;
  const calls = Math.min(upTo, callCount(method, n));
  const swap = (a, b) => {
    const t = A[a];
    A[a] = A[b];
    A[b] = t;
  };
  if (method === "build") {
    for (let k = 1; k <= n; k++) A[k] = input[k - 1];
    size = n;
  }
  for (let c = 1; c <= calls; c++) {
    let i;
    const path = [];
    let swaps = 0;
    if (method === "enOgEn") {
      // Max-Heap-Insert of A[c]: the element goes in slot c and rises.
      size = c;
      i = c;
      A[i] = input[c - 1];
      path.push(i);
      while (i > 1 && A[i >> 1] < A[i]) {
        swap(i, i >> 1);
        i >>= 1;
        path.push(i);
        swaps++;
      }
    } else {
      // Max-Heapify(A, i) with i = ⌊n/2⌋ − c + 1: the element sinks.
      i = Math.floor(n / 2) - c + 1;
      path.push(i);
      for (;;) {
        const l = 2 * i;
        const r = 2 * i + 1;
        let m = i;
        if (l <= size && A[l] > A[m]) m = l;
        if (r <= size && A[r] > A[m]) m = r;
        if (m === i) break;
        swap(i, m);
        i = m;
        path.push(i);
        swaps++;
      }
    }
    const lv = level(path[0]);
    levels[lv] += swaps;
    total += swaps;
    last = { start: path[0], level: lv, swaps, path };
  }
  return { A, size, levels, total, calls, last };
}

/** Is A[1 : size] a max-heap? */
export function isMaxHeap(A, size) {
  for (let i = 2; i <= size; i++) if (A[i >> 1] < A[i]) return false;
  return true;
}

export default function init({ stage, controls, getSize, onResize, signal }) {
  let method = "enOgEn";
  let kind = "stigende";
  let n = N_DEFAULT;
  let seed = FIRST_SEED;
  let done = 0; // calls done

  // ── kontroller ──────────────────────────────────────────────────────────
  // A group of buttons is not a labelable control, so each group gets the
  // framework's label layout on a <div role="group"> instead of a <label>
  // (a <label> would forward a click on its text to the first button).
  const btnGroup = (name, aria, entries, isOn, onPick) => {
    const wrap = document.createElement("div");
    wrap.setAttribute("role", "group");
    wrap.setAttribute("aria-label", aria);
    wrap.style.cssText =
      "display:flex;flex-direction:column;gap:var(--space-2);font-family:var(--font-mono);" +
      "font-size:var(--text-xs);color:var(--muted)";
    const head = document.createElement("span");
    head.textContent = name;
    const row = document.createElement("span");
    row.style.cssText = "display:flex;flex-wrap:wrap;gap:var(--space-2)";
    const btns = {};
    for (const k of Object.keys(entries)) {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "sim-btn";
      b.textContent = entries[k].label;
      b.setAttribute("aria-label", entries[k].aria);
      b.addEventListener(
        "click",
        () => {
          // A new method or input starts over; pressing the one in use keeps the calls.
          if (!isOn(k)) done = 0;
          onPick(k);
          sync();
          render();
        },
        { signal },
      );
      btns[k] = b;
      row.append(b);
    }
    wrap.append(head, row);
    return {
      el: wrap,
      sync: () => Object.keys(btns).forEach((k) => btns[k].setAttribute("aria-pressed", String(isOn(k)))),
    };
  };
  const button = (label, aria, onClick) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "sim-btn";
    b.textContent = label;
    b.setAttribute("aria-label", aria);
    b.addEventListener(
      "click",
      () => {
        onClick();
        sync();
        render();
      },
      { signal },
    );
    return b;
  };
  const slider = (name, aria, min, max, value, onInput) => {
    const label = document.createElement("label");
    label.append(`${name} `);
    const out = document.createElement("output");
    const input = document.createElement("input");
    input.type = "range";
    input.min = String(min);
    input.max = String(max);
    input.step = "1";
    input.value = String(value);
    input.setAttribute("aria-label", aria);
    label.append(out, input);
    input.addEventListener(
      "input",
      () => {
        onInput(Number(input.value));
        sync();
        render();
      },
      { signal },
    );
    return { el: label, out, input };
  };

  const nextBtn = button("Neste kall", "Neste kall: kjør ett kall til", () => (done = Math.min(callCount(method, n), done + 1)));
  const allBtn = button("Alle kall", "Alle kall: kjør resten av kallene", () => (done = callCount(method, n)));
  const resetBtn = button("Start på nytt", "Start på nytt: tilbake til null kall", () => (done = 0));
  const dealBtn = button("Trekk på nytt", "Trekk på nytt: ny tilfeldig input", () => {
    seed = Math.floor(Math.random() * 2 ** 32) >>> 0;
    done = 0;
  });
  const methodGroup = btnGroup("Metode", "Måte å bygge haugen på", METHODS, (k) => k === method, (k) => (method = k));
  const inputGroup = btnGroup("Input", "Rekkefølgen på input", INPUTS, (k) => k === kind, (k) => (kind = k));
  const nS = slider("n", "Antall elementer n", N_MIN, N_MAX, n, (v) => {
    n = v;
    done = 0;
  });

  const actions = document.createElement("div");
  actions.style.cssText = "display:flex;flex-wrap:wrap;gap:var(--space-2);flex-basis:100%";
  actions.append(nextBtn, allBtn, resetBtn);
  const groups = document.createElement("div");
  groups.style.cssText = "display:flex;flex-wrap:wrap;align-items:flex-end;gap:var(--space-4) var(--space-5)";
  groups.append(methodGroup.el, inputGroup.el, dealBtn);
  controls.append(actions, groups, nS.el);

  function sync() {
    methodGroup.sync();
    inputGroup.sync();
    nS.out.textContent = String(n);
    const all = callCount(method, n);
    nextBtn.disabled = done >= all;
    allBtn.disabled = done >= all;
    resetBtn.disabled = done === 0;
    dealBtn.disabled = kind !== "tilfeldig";
  }

  // ── tegning ─────────────────────────────────────────────────────────────
  function render() {
    const { w, h } = getSize();
    if (w <= 0 || h <= 0) {
      stage.innerHTML = "";
      return;
    }
    const input = inputOf(kind, n, seed);
    const st = callsOf(method, input, done);
    const { A, size, levels, total, last } = st;
    const L = levels.length; // levels 0 … L − 1
    const keys = n <= KEYS_MAX;
    const half = Math.floor(n / 2);
    // Build-Max-Heap: every node from the last call's i on is a heap.
    const firstDone = method === "build" ? (last ? last.start : half + 1) : 1;
    const filled = (i) => A[i] !== null && i <= size;
    const isDone = (i) => (method === "build" ? i >= firstDone : filled(i));
    const end = last ? last.path[last.path.length - 1] : null;
    const pathEdges = new Set();
    if (last) for (let s = 1; s < last.path.length; s++) pathEdges.add(Math.max(last.path[s], last.path[s - 1]));

    // Type sizes in px, read from the root so the layout follows the
    // reader's text size.
    const rem = remPx();
    const fsKey = 0.84 * rem;
    const fsLab = 0.84 * rem;
    const LAB = `${FONT};font-size:${(Math.round(fsLab * 10) / 10).toString()}px`;

    // Horizontal: the tree, then the column of level totals at the right.
    const colW = textW("000", fsLab) + 6;
    const x0 = 4;
    const boxW = w - x0 - colW - 8;
    const bottomPitch = boxW / 2 ** (L - 1);
    const r = keys ? Math.min(0.8 * rem, 0.42 * bottomPitch) : Math.max(2, Math.min(4.5, 0.3 * bottomPitch));

    // Vertical: the total in a band at the top, then the levels.
    const headH = fsLab + 8;
    // Below the last level: the larger of its nodes and its number, and a
    // margin (the stage shows 2 px less than getSize says, its border).
    const below = Math.max(r, 0.6 * fsLab) + 7;
    const avail = h - headH - r - 4 - below;
    const DY_MAX = keys ? 4.6 * r : 60;
    const dy = L > 1 ? Math.min(DY_MAX, avail / (L - 1)) : 0;
    const used = (L - 1) * dy;
    const y0 = headH + r + 4 + Math.max(0, (avail - used) / 2);
    const box = { x0, y0, w: boxW, dy };
    const P = (i) => heapPos(i, box);

    let svg = "";

    // Edges: to unfilled slots dashed, plain, then the path on top.
    const dotEdge = (a, b, mark) => {
      const e = EDGE[mark];
      const dash = e.dash ? ` stroke-dasharray="3 3"` : "";
      return `<line x1="${a.x.toFixed(1)}" y1="${a.y.toFixed(1)}" x2="${b.x.toFixed(1)}" y2="${b.y.toFixed(1)}" style="stroke:${e.stroke}" stroke-width="${mark === "path" ? 2.2 : 1}" stroke-linecap="round"${dash}/>`;
    };
    for (const pass of ["slot", "plain", "path"])
      for (let i = 2; i <= n; i++) {
        const mark = pathEdges.has(i) ? "path" : filled(i) ? "plain" : "slot";
        if (mark !== pass) continue;
        svg += keys ? edge(P(i >> 1), P(i), r, mark) : dotEdge(P(i >> 1), P(i), mark);
      }

    // Nodes.
    for (let i = 1; i <= n; i++) {
      const p = P(i);
      const mark = !filled(i) ? "slot" : i === end ? "current" : isDone(i) ? "done" : "plain";
      if (keys) svg += node(p.x, p.y, r, filled(i) ? A[i] : "", mark, fsKey);
      else if (mark === "slot")
        svg += `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${(r - 0.5).toFixed(2)}" style="fill:none;stroke:${MARK.slot.stroke}" stroke-width="1"/>`;
      else {
        const col = mark === "current" ? "var(--accent)" : mark === "done" ? "var(--green)" : "color-mix(in srgb, var(--fg) 55%, transparent)";
        const rr = mark === "current" ? r * 1.45 : r;
        svg += `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${rr.toFixed(2)}" style="fill:${col}"/>`;
      }
    }

    // The swaps per level, at the right of each level, and the total.
    const colX = w - 4;
    for (let d = 0; d < L; d++) {
      const y = y0 + d * dy + fsLab * 0.36;
      const on = last && last.level === d;
      svg += text(colX, y, levels[d], `${LAB};font-weight:600;fill:${on ? "var(--accent-ink)" : "var(--fg)"}`, "end");
    }
    svg += text(4, fsLab + 2, `bytter: ${total}`, `${LAB};font-weight:700;fill:var(--fg)`, "start");

    const all = callCount(method, n);
    const how = method === "enOgEn" ? "Én og én" : "Build-Max-Heap";
    stage.setAttribute(
      "aria-label",
      `${how} på ${kind} input, n = ${n}: ${done} av ${all} kall, ${total} bytter. ` +
        `Bytter per nivå fra rota: ${levels.join(", ")}.` +
        (keys ? ` Tabellen: ${A.slice(1).map((v) => (v === null ? "tom" : v)).join(", ")}.` : ""),
    );
    stage.innerHTML = svgWrap(w, h, svg).replace("<svg ", '<svg aria-hidden="true" ');
  }

  sync();
  onResize(render);
  render();
}
