/**
 * «Tre grådige regler» for TDT4120 modul 08 «Grådighet».
 *
 * The one idea: «the choice that looks best right now» can be defined in
 * several ways that all sound reasonable, and one instance is enough to show
 * that a rule is wrong. Three rules for aktivitetsutvalg, each taking the
 * activity that is best by its measure among those still free, and passing
 * over every activity that overlaps it:
 *   «starter først»  the earliest start
 *   «kortest først»  the shortest
 *   «slutter først»  the earliest finish (the safe one, CLRS thm. 15.1)
 * Ties go to the activity in the earlier row (rows are in order of finish
 * time, then start).
 *
 * First instance: the module's opening, [3, 8), [2, 9), [6, 9), [8, 13).
 *   starter først: [2, 9), which overlaps all three others → 1
 *   kortest først: [6, 9) (length 3), which overlaps all three others → 1
 *   slutter først: [3, 8), then [8, 13) → 2, the most that fit.
 * «Ny instans»: seven random activities on 0 … 16, drawn again until at least
 * one of «starter først» and «kortest først» takes fewer than the most that
 * fit (which rule is the target alternates at random). «Slutter først»
 * always takes the most that fit; that is a theorem, not a filter.
 *
 * Drawing (the marks of _aktiviteter.js): one row per activity on a time
 * axis. The rule's picks are green with the order of the pick written in the
 * bar; an activity a pick overlaps is faint and dashed. A label at the top
 * left: «Regelen tar 1 · flest mulig er 2». No other readout.
 *
 * Contract: default-export init(api); host="dom", so api = { stage, controls,
 * getSize, onResize, signal }.
 */
import { svgWrap, text } from "../steppers/_tre.js";
import { frame, bar, overlap, most } from "../steppers/_aktiviteter.js";

const RULES = {
  starter: { label: "starter først", aria: "Regel: ta aktiviteten som starter først", key: (a) => a.s },
  kortest: { label: "kortest først", aria: "Regel: ta den korteste aktiviteten", key: (a) => a.f - a.s },
  slutter: { label: "slutter først", aria: "Regel: ta aktiviteten som slutter først", key: (a) => a.f },
};

export const OPENING = [
  { s: 3, f: 8 },
  { s: 2, f: 9 },
  { s: 6, f: 9 },
  { s: 8, f: 13 },
];

/** Rows in order of finish time, then start. */
const sorted = (acts) => [...acts].sort((a, b) => a.f - b.f || a.s - b.s);

/** Run a rule: picks in order, and for every activity which pick knocked it out. */
export function runRule(acts, rule) {
  const key = RULES[rule].key;
  const free = new Set(acts.map((_, i) => i));
  const order = new Map();
  const out = new Set();
  let k = 0;
  while (free.size) {
    let best = -1;
    for (const i of free) if (best < 0 || key(acts[i]) < key(acts[best])) best = i;
    order.set(best, ++k);
    free.delete(best);
    for (const i of [...free])
      if (overlap(acts[i], acts[best])) {
        free.delete(i);
        out.add(i);
      }
  }
  return { order, out, count: k };
}

/** Seven random activities where `target` takes fewer than the most that fit. */
export function randomInstance(rand = Math.random) {
  const target = rand() < 0.5 ? "kortest" : "starter";
  for (let tries = 0; tries < 5000; tries++) {
    const acts = [];
    const seen = new Set();
    while (acts.length < 7) {
      const s = Math.floor(rand() * 14);
      const f = Math.min(16, s + 1 + Math.floor(rand() * 6));
      if (seen.has(`${s},${f}`)) continue;
      seen.add(`${s},${f}`);
      acts.push({ s, f });
    }
    const A = sorted(acts);
    const best = most(A);
    if (best >= 3 && runRule(A, target).count < best) return A;
  }
  return sorted(OPENING);
}

export default function init({ stage, controls, getSize, onResize, signal }) {
  let acts = sorted(OPENING);
  let rule = "starter";

  // ── controls ────────────────────────────────────────────────────────────
  const group = document.createElement("div");
  group.setAttribute("role", "group");
  group.setAttribute("aria-label", "Regel");
  group.style.cssText =
    "display:flex;flex-direction:column;gap:var(--space-2);font-family:var(--font-mono);font-size:var(--text-xs);color:var(--muted)";
  const head = document.createElement("span");
  head.textContent = "Regel";
  const row = document.createElement("span");
  row.style.cssText = "display:flex;flex-wrap:wrap;gap:var(--space-2)";
  const btns = {};
  for (const key of Object.keys(RULES)) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "sim-btn";
    b.textContent = RULES[key].label;
    b.setAttribute("aria-label", RULES[key].aria);
    b.addEventListener(
      "click",
      () => {
        rule = key;
        sync();
        draw();
      },
      { signal },
    );
    btns[key] = b;
    row.append(b);
  }
  group.append(head, row);
  const fresh = document.createElement("button");
  fresh.type = "button";
  fresh.className = "sim-btn";
  fresh.textContent = "Ny instans";
  fresh.setAttribute("aria-label", "Ny instans: sju tilfeldige aktiviteter");
  fresh.addEventListener(
    "click",
    () => {
      acts = randomInstance();
      draw();
    },
    { signal },
  );
  controls.append(group, fresh);

  function sync() {
    for (const k of Object.keys(btns)) btns[k].setAttribute("aria-pressed", String(k === rule));
  }

  function draw() {
    const { w, h } = getSize();
    if (w <= 0 || h <= 0) return;
    const res = runRule(acts, rule);
    const best = most(acts);
    const tMax = Math.max(10, Math.ceil(Math.max(...acts.map((a) => a.f)) / 2) * 2);
    // The label sits above the first row.
    const headY = 0.78 * parseFloat(getComputedStyle(document.documentElement).fontSize || "16") + 4;
    const L2 = frame({ x: 0, y: headY + 6, w, h: h - headY - 10 }, { tMax, rows: Math.max(acts.length, 5) });
    let svg = L2.svgAxis;
    acts.forEach((a, i) => {
      const mark = res.order.has(i) ? "done" : res.out.has(i) ? "outside" : "plain";
      svg += bar(L2, a, i, mark, res.order.get(i) ?? "");
    });
    const say = `Regelen tar ${res.count} · flest mulig er ${best}`;
    svg += text(4, headY, say, `${L2.LAB};font-weight:700;fill:${res.count < best ? "var(--accent-ink)" : "var(--fg)"}`, "start");
    const list = acts.map((a, i) => `[${a.s}, ${a.f})${res.order.has(i) ? ` valgt som nummer ${res.order.get(i)}` : ""}`).join(", ");
    stage.setAttribute("aria-label", `${RULES[rule].label}: ${say}. Aktivitetene: ${list}.`);
    stage.innerHTML = svgWrap(w, h, svg).replace("<svg ", '<svg aria-hidden="true" ');
  }

  sync();
  onResize(draw);
  draw();
}
