/**
 * Shared drawing for the activity widgets of modul 08 «Grådighet»: the
 * stepper recursive-activity-selector.js and the sim ../sims/gradige-regler.js.
 * One object keeps one mark in every widget of the module, so both draw an
 * activity the same way: a bar from s to f on a time axis, one row per
 * activity, rows in order of finish time (as CLRS fig. 15.2 and the lecture
 * draw them). The marks are those of _tre.js:
 *
 *   plain    not looked at yet
 *   current  the activity the procedure looks at now (accent)
 *   done     chosen, part of the answer (green)
 *   outside  passed over: it overlaps a chosen activity (faint, dashed)
 *
 * Intervals are half-open, [s, f): an activity that starts when another
 * finishes does not overlap it.
 *
 * Everything is returned as SVG strings in CSS px with framework tokens only,
 * so a frame re-themes on the light/dark toggle.
 */
import { MARK, FONT, text, remPx } from "./_tre.js";

/** The lecture's eleven activities (CLRS fig. 15.1), sorted by finish time. */
export const CLRS_S = [1, 3, 0, 5, 3, 5, 6, 7, 8, 2, 12];
export const CLRS_F = [4, 5, 6, 7, 9, 9, 10, 11, 12, 14, 16];

const f1 = (v) => (Math.round(v * 10) / 10).toString();

/** Do [a.s, a.f) and [b.s, b.f) overlap? */
export const overlap = (a, b) => a.s < b.f && b.s < a.f;

/** The most activities that fit together (sort by finish time, then a longest chain). */
export function most(acts) {
  const A = [...acts].sort((x, y) => x.f - y.f);
  const c = [];
  let m = 0;
  for (let i = 0; i < A.length; i++) {
    let v = 1;
    for (let j = 0; j < i; j++) if (A[j].f <= A[i].s) v = Math.max(v, c[j] + 1);
    c.push(v);
    m = Math.max(m, v);
  }
  return m;
}

/** A tick step that leaves room for the labels: 1, 2 or 4 time units. */
function tickStep(pxPerUnit, fs) {
  for (const st of [1, 2, 4, 8]) if (st * pxPerUnit >= 2.4 * fs) return st;
  return 8;
}

/**
 * Lay out rows and a time axis in a box { x, y, w, h }. opts: tMax, rows (the
 * number of rows), gutter (px kept free on the left for row labels).
 * Returns { X(t), Y(row), barH, axisY, svgAxis }.
 */
export function frame(box, opts) {
  const rem = remPx();
  const fs = 0.78 * rem;
  const LAB = `${FONT};font-size:${f1(fs)}px`;
  const gutter = opts.gutter ?? 0;
  const axisH = fs + 10;
  const x0 = box.x + gutter + 4;
  const x1 = box.x + box.w - 8;
  const pxPerUnit = (x1 - x0) / opts.tMax;
  const X = (t) => x0 + t * pxPerUnit;
  const rowH = Math.min(30, (box.h - axisH) / Math.max(1, opts.rows));
  const barH = Math.max(10, rowH * 0.72);
  const top = box.y + Math.max(0, (box.h - axisH - rowH * opts.rows) / 2);
  const Y = (row) => top + row * rowH + (rowH - barH) / 2;
  const axisY = top + rowH * opts.rows + 4;
  const st = tickStep(pxPerUnit, fs);
  let svg = `<line x1="${f1(x0)}" y1="${f1(axisY)}" x2="${f1(x1)}" y2="${f1(axisY)}" style="stroke:var(--muted)" stroke-width="1.2"/>`;
  for (let t = 0; t <= opts.tMax; t += 1) {
    const big = t % st === 0;
    svg += `<line x1="${f1(X(t))}" y1="${f1(axisY)}" x2="${f1(X(t))}" y2="${f1(axisY + (big ? 5 : 3))}" style="stroke:var(--muted)" stroke-width="1"/>`;
    if (big) svg += text(X(t), axisY + 6 + fs, t, `${LAB};fill:var(--muted)`);
  }
  return { X, Y, barH, rowH, axisY, top, fs, LAB, svgAxis: svg, x0, x1 };
}

/** One activity as a bar from X(s) to X(f) in row `row`, with an optional label inside. */
export function bar(L, act, row, mark = "plain", label = "") {
  const m = MARK[mark] ?? MARK.plain;
  const x = L.X(act.s) + 1;
  const w = Math.max(3, L.X(act.f) - L.X(act.s) - 2);
  const y = L.Y(row);
  const dash = m.dash ? ` stroke-dasharray="${m.dash}"` : "";
  let s = `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(L.barH)}" rx="4" style="fill:${m.fill};stroke:${m.stroke}" stroke-width="${m.wdt}"${dash}/>`;
  const lab = String(label);
  if (lab && w >= lab.length * 0.62 * L.fs + 4)
    s += text(x + w / 2, y + L.barH / 2 + L.fs * 0.36, lab, `${L.LAB};font-weight:700;fill:${m.text}`);
  return s;
}

/** A dashed vertical line at time t over all rows, with a label at the top. */
export function timeLine(L, t, label, color = "var(--accent)") {
  const x = L.X(t);
  let s = `<line x1="${f1(x)}" y1="${f1(L.top - 2)}" x2="${f1(x)}" y2="${f1(L.axisY)}" style="stroke:${color}" stroke-width="1.8" stroke-dasharray="5 4"/>`;
  if (label) s += text(x, L.top - 6, label, `${L.LAB};font-weight:700;fill:${color}`, x > L.x1 - 30 ? "end" : x < L.x0 + 30 ? "start" : "middle");
  return s;
}
