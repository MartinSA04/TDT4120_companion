/**
 * Recursive-Activity-Selector, for <Stepper>, driving the block
 * `recursive-activity-selector` in modul 08 «Grådighet». The one idea: each
 * call takes the first activity that starts when the last chosen one has
 * finished, and leaves the rest, S_m, to one new call. The while loop looks
 * at every activity once over all the calls, so the whole run is Θ(n).
 *
 * Block line numbers count the header as line 1, so the procedure's line k is
 * block line k + 1:
 *    1 Recursive-Activity-Selector(s, f, k, n)
 *    2 1  m = k + 1
 *    3 2  while m ≤ n and s[m] < f[k]
 *    4 3      m = m + 1
 *    5 4  if m ≤ n
 *    6 5      return {aₘ} ∪ Recursive-Activity-Selector(s, f, m, n)
 *    7 6  else return ∅
 * (CLRS 4th ed. 15.1; the lecture's Rec-Act-Sel splits line 5 in two.)
 *
 * Frames: per call the start [2]; per activity looked at one frame, [3, 4]
 * when it is passed over and [3] when the loop stops at it; then the choice
 * [5, 6], or [5, 7] when m > n. Last one frame for the answer [6].
 *
 * The instance is the lecture's (CLRS fig. 15.1): s = 1 3 0 5 3 5 6 7 8 2 12,
 * f = 4 5 6 7 9 9 10 11 12 14 16, with the made-up a0, f[0] = 0. Calls k = 0,
 * 1, 4, 8, 11 (checked in node); the answer is {a1, a4, a8, a11}. Later
 * instances (the shuffle button): 6–11 random activities on 0 … 16, sorted by
 * finish time.
 *
 * Drawing (the marks of _aktiviteter.js): rows a1 … an by finish time on a
 * time axis, a0 as a dot at 0 in a row of its own above them. The time f[k]
 * is a dashed accent line, and the part of the axis from it on is shaded:
 * the activities that start there are S_k. The activity aₘ the loop looks at
 * is accent, passed-over ones faint and dashed, chosen ones green.
 */

import { svgWrap, text } from "./_tre.js";
import { firstView } from "./_dp.js";
import { CLRS_S, CLRS_F, frame, bar, timeLine } from "./_aktiviteter.js";

const view = firstView(import.meta.url);
const f1 = (v) => (Math.round(v * 10) / 10).toString();

/** 6–11 random activities on 0 … 16, sorted by finish time, as 1-based s and f with f[0] = 0. */
function randomInstance() {
  const n = 6 + Math.floor(Math.random() * 6);
  const acts = [];
  const seen = new Set();
  while (acts.length < n) {
    const s = Math.floor(Math.random() * 14);
    const f = Math.min(16, s + 1 + Math.floor(Math.random() * 5));
    if (seen.has(`${s},${f}`)) continue;
    seen.add(`${s},${f}`);
    acts.push({ s, f });
  }
  acts.sort((a, b) => a.f - b.f || a.s - b.s);
  return { s: [null, ...acts.map((a) => a.s)], f: [0, ...acts.map((a) => a.f)] };
}

export default {
  defaultData() {
    if (view.isFirst()) return { s: [null, ...CLRS_S], f: [0, ...CLRS_F] };
    return randomInstance();
  },

  run(input) {
    const { s, f } = input;
    const n = s.length - 1;
    const frames = [];
    const chosen = [];
    const passed = new Set();
    const V = { k: 0, m: "–" };
    const snap = (line, desc, extra = {}) =>
      frames.push({ line, desc, vars: { ...V }, act: { s, f, n, chosen: [...chosen], passed: [...passed], k: V.k, ...extra } });
    const a = (i) => `a${i}`;

    let k = 0;
    for (;;) {
      V.k = k;
      let m = k + 1;
      V.m = m;
      snap(
        2,
        k === 0
          ? `Første kall, k = 0. a0 er en tenkt aktivitet som slutter ved f[0] = 0, så alle aktivitetene ligger i S0. m = 1.`
          : `Nytt kall med k = ${k}. Det skraverte området er S${k}: det som starter ved f[${k}] = ${f[k]} eller senere. m = ${m}.`,
        { m },
      );
      while (m <= n && s[m] < f[k]) {
        passed.add(m);
        snap([3, 4], `s[${m}] = ${s[m]} < f[${k}] = ${f[k]}: ${a(m)} starter før ${a(k)} slutter, så den hoppes over. m = ${m + 1}.`, { m });
        m++;
        V.m = m;
      }
      if (m <= n) {
        snap(3, `s[${m}] = ${s[m]} ≥ f[${k}] = ${f[k]}: ${a(m)} er den første i S${k}, og den som slutter først av dem.`, { m });
        chosen.push(m);
        snap([5, 6], `${a(m)} tas med, og resten løses av et nytt kall med k = ${m}.`, { m, take: m });
        k = m;
      } else {
        snap(3, `m = ${m} > n = ${n}: ingen aktivitet starter ved f[${k}] = ${f[k]} eller senere.`, { m: null });
        snap([5, 7], `S${k} er tom, så kallet returnerer ∅.`, { m: null });
        break;
      }
    }
    V.m = "–";
    snap(6, `Kallene returnerer i motsatt rekkefølge, og hvert kall legger til aktiviteten det valgte: {${chosen.map(a).join(", ")}}, ${chosen.length} aktiviteter.`, {
      m: null,
      done: true,
    });
    return frames;
  },

  render(stage, fr, api) {
    view.drawn.add(stage);
    const { w, h } = api.getSize();
    if (w <= 0 || h <= 0) {
      stage.innerHTML = "";
      return;
    }
    const { s, f, n, chosen, passed, k, m, done } = fr.act;
    const tMax = 16;
    const rows = n + 1;
    const fsGuess = 0.78 * parseFloat(getComputedStyle(document.documentElement).fontSize || "16");
    const L = frame({ x: 0, y: fsGuess + 8, w, h: h - fsGuess - 10 }, { tMax, rows, gutter: 2.4 * fsGuess });
    let svg = "";
    // S_k: the part of the axis from f[k] on.
    if (!done) {
      const x = L.X(f[k]);
      svg += `<rect x="${f1(x)}" y="${f1(L.top - 2)}" width="${f1(L.x1 - x)}" height="${f1(L.axisY - L.top + 2)}" style="fill:color-mix(in srgb, var(--accent) 7%, transparent)"/>`;
    }
    svg += L.svgAxis;
    // a0: a dot at time 0.
    const y0 = L.Y(0) + L.barH / 2;
    svg += `<circle cx="${f1(L.X(0))}" cy="${f1(y0)}" r="4" style="fill:var(--muted)"/>`;
    svg += text(L.x0 - 8, y0 + L.fs * 0.36, "a0", `${L.LAB};fill:var(--muted)`, "end");
    const ch = new Set(chosen);
    const ps = new Set(passed);
    for (let i = 1; i <= n; i++) {
      const mark = ch.has(i) ? "done" : i === m ? "current" : ps.has(i) ? "outside" : "plain";
      svg += bar(L, { s: s[i], f: f[i] }, i, mark, "");
      svg += text(L.x0 - 8, L.Y(i) + L.barH / 2 + L.fs * 0.36, `a${i}`, `${L.LAB};fill:${i === m ? "var(--accent-ink)" : "var(--muted)"};font-weight:${i === m ? 700 : 400}`, "end");
    }
    if (!done) svg += timeLine(L, f[k], `f[${k}]`);
    stage.setAttribute("aria-label", `k = ${k}. Valgt: ${chosen.length ? chosen.map((i) => "a" + i).join(", ") : "ingen ennå"}.`);
    stage.innerHTML = svgWrap(w, h, svg).replace("<svg ", '<svg aria-hidden="true" ');
  },
};
