/**
 * Shared helpers for the dynamic-programming steppers of modul 07
 * (bottom-up-cut-rod.js, lcs-length.js, knapsack.js).
 *
 * firstView: the first defaultData() call on a page returns the module's own
 * instance, later calls (the shuffle button) a random one. The same helper as
 * in _haugtegning.js: a stage that mounts fresh (a new page view) counts as
 * first again.
 *
 * grid: a DP table as SVG, index labels along the top and left, optional
 * letters beside them (the two strings in LCS) and optional extra columns on
 * the right (w and v in the knapsack table). Each cell is { value, arrow,
 * mark }, drawn with the marks of _tre.js: slot (not filled yet, dashed),
 * plain, current (the cell being filled, accent), compared (a cell the step
 * reads, indigo) and done (the path of a read-back, green).
 */
import { MARK, FONT, text, remPx } from "./_tre.js";

export function firstView(selfUrl) {
  const SELF = new URL(selfUrl).pathname;
  const drawn = new WeakSet();
  let calls = 0;
  const firstLoad = () => {
    if (typeof document === "undefined") return false;
    for (const fig of document.querySelectorAll("[data-stepper-src]")) {
      if (new URL(fig.dataset.stepperSrc, location.href).pathname !== SELF) continue;
      const stage = fig.querySelector(".stepper-stage");
      if (fig.dataset.ready === "true" && stage && !drawn.has(stage)) return true;
    }
    return false;
  };
  return { drawn, isFirst: () => calls++ === 0 || firstLoad() };
}

const f1 = (v) => (Math.round(v * 10) / 10).toString();
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/**
 * Draw a table into a box { x, y, w, h }. spec: rows, cols (row 0 and
 * column 0 included), cell(i, j) → { value, arrow, mark }, top / left
 * (letters for columns / rows 1 …, optional), letterMark(side, k) → mark or
 * null, right: [{ title, values (rows 1 …), mark(i) }]. Returns { svg,
 * x0, y0, size, xOf(j), yOf(i) } so a caller can draw on top.
 */
export function grid(box, spec) {
  const rem = remPx();
  const fs = 0.8 * rem;
  const LAB = `${FONT};font-size:${f1(fs)}px`;
  const idxW = 1.4 * fs;
  const letW = spec.left ? 1.3 * fs : 0;
  const idxH = fs + 4;
  const letH = spec.top ? fs + 8 : 0;
  const rightW = (spec.right?.length ?? 0) * 1.9 * fs + (spec.right?.length ? 8 : 0);
  const availW = box.w - idxW - letW - rightW - 4;
  const availH = box.h - idxH - letH - 2;
  const size = Math.max(16, Math.min(44, availW / spec.cols, availH / spec.rows));
  const gw = size * spec.cols;
  const x0 = box.x + idxW + letW + Math.max(0, (availW - gw) / 2);
  const y0 = box.y + idxH + letH + Math.max(0, (availH - size * spec.rows) / 2);
  const xOf = (j) => x0 + j * size;
  const yOf = (i) => y0 + i * size;
  let svg = "";
  const t = (x, y, s, style, anchor = "middle") =>
    (svg += `<text x="${f1(x)}" y="${f1(y)}" text-anchor="${anchor}" style="${style}">${esc(s)}</text>`);
  const box1 = (x, y, w, h, mark) => {
    const m = MARK[mark] ?? MARK.plain;
    const dash = m.dash ? ` stroke-dasharray="${m.dash}"` : "";
    svg += `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" rx="3" style="fill:${m.fill};stroke:${m.stroke}" stroke-width="${m.wdt}"${dash}/>`;
  };

  for (let j = 0; j < spec.cols; j++) t(xOf(j) + size / 2, y0 - letH - 5, j, `${LAB};fill:var(--faint)`);
  for (let i = 0; i < spec.rows; i++) t(x0 - letW - 5, yOf(i) + size / 2 + fs * 0.36, i, `${LAB};fill:var(--faint)`, "end");
  const letter = (x, y, s, mark) => {
    if (mark) box1(x - 0.62 * fs, y - fs * 0.95, 1.24 * fs, 1.3 * fs, mark);
    const m = mark ? MARK[mark] : null;
    t(x, y, s, `${LAB};font-weight:700;fill:${m ? m.text : "var(--fg)"}`);
  };
  spec.top?.forEach((s, k) => letter(xOf(k + 1) + size / 2, y0 - 6, s, spec.letterMark?.("top", k + 1)));
  spec.left?.forEach((s, k) => letter(x0 - letW / 2 - 1, yOf(k + 1) + size / 2 + fs * 0.36, s, spec.letterMark?.("left", k + 1)));

  for (let i = 0; i < spec.rows; i++)
    for (let j = 0; j < spec.cols; j++) {
      const c = spec.cell(i, j);
      const m = MARK[c.mark] ?? MARK.plain;
      box1(xOf(j) + 1, yOf(i) + 1, size - 2, size - 2, c.mark);
      if (c.value === null || c.value === undefined || c.value === "") continue;
      if (c.arrow) {
        t(xOf(j) + size * 0.27, yOf(i) + size * 0.42, c.arrow, `${FONT};font-size:${f1(0.72 * fs)}px;fill:var(--muted)`);
        t(xOf(j) + size * 0.64, yOf(i) + size * 0.8, c.value, `${LAB};font-weight:600;fill:${m.text}`);
      } else t(xOf(j) + size / 2, yOf(i) + size / 2 + fs * 0.36, c.value, `${LAB};font-weight:600;fill:${m.text}`);
    }

  (spec.right ?? []).forEach((col, k) => {
    const cx = x0 + gw + 8 + (k + 0.5) * 1.9 * fs;
    t(cx, y0 - letH - 5, col.title, `${LAB};font-style:italic;font-weight:700;fill:var(--muted)`);
    col.values.forEach((v, idx) => {
      const i = idx + 1;
      const mark = col.mark?.(i);
      if (mark) box1(cx - 0.85 * fs, yOf(i) + 3, 1.7 * fs, size - 6, mark);
      t(cx, yOf(i) + size / 2 + fs * 0.36, v, `${LAB};font-weight:600;fill:${mark ? MARK[mark].text : "var(--fg)"}`);
    });
  });
  return { svg, x0, y0, size, xOf, yOf, fs };
}
