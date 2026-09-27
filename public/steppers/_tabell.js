/**
 * Shared drawing for the dynamic-programming table steppers lcs.js and
 * ryggsekk.js: a grid of cells with index labels along the top and left, an
 * optional row of letters under the top indices and a column of letters next
 * to the left ones (the two strings in LCS), optional extra columns on the
 * right (w and v per item in the knapsack table), and a footer line.
 *
 * spec fields:
 *   rows, cols      table size, including row 0 and column 0
 *   cell(i, j)      → { text, arrow, st } for every cell; `st` names a STYLE
 *   topLetters      strings for columns 1 .. cols - 1 (optional)
 *   leftLetters     strings for rows 1 .. rows - 1 (optional)
 *   letterSt(side, idx) → STYLE name for a header letter, or null (optional)
 *   right           [{ title, values, st(i) }] extra columns, values[i] for
 *                   rows 1 .. rows - 1 (optional)
 *   footer          text under the grid (optional)
 *
 * Colours are framework tokens only, so frames re-theme on the light/dark
 * toggle without the module knowing which theme is active.
 */

export const esc = (v) =>
  String(v).replace(
    /[&<>"]/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c],
  );

const STYLE = {
  empty: { fill: "none", stroke: "var(--border)", text: "var(--faint)", dash: true },
  base: { fill: "none", stroke: "var(--border)", text: "var(--muted)" },
  plain: { fill: "none", stroke: "var(--border)", text: "var(--fg)" },
  cur: { fill: "var(--accent-weak)", stroke: "var(--accent)", text: "var(--accent-ink)", wdt: 2.2 },
  dep: { fill: "none", stroke: "var(--orange)", text: "var(--fg)", wdt: 1.8 },
  depBest: { fill: "color-mix(in srgb, var(--orange) 22%, transparent)", stroke: "var(--orange)", text: "var(--fg)", wdt: 2 },
  path: { fill: "none", stroke: "var(--accent)", text: "var(--fg)", wdt: 2 },
  take: { fill: "color-mix(in srgb, var(--green) 18%, transparent)", stroke: "var(--green)", text: "var(--fg)", wdt: 2 },
  hi: { fill: "var(--accent-weak)", stroke: "var(--accent)", text: "var(--accent-ink)", wdt: 1.6 },
};

const FONT = "font-family:var(--font-mono);font-size:var(--text-xs)";

export function drawTable(stage, api, spec) {
  const { w, h } = api.getSize();
  const { rows, cols } = spec;
  if (!rows || !cols || w <= 0 || h <= 0) {
    stage.innerHTML = "";
    return;
  }

  const IDX = 16;
  const LET = spec.topLetters || spec.leftLetters ? 20 : 0;
  const RIGHT_W = 28;
  const right = spec.right || [];
  const FOOT = spec.footer != null ? 26 : 0;
  const left = IDX + (spec.leftLetters ? LET : 0);
  const top = IDX + (spec.topLetters ? LET : 0);
  const availW = w - left - right.length * RIGHT_W - (right.length ? 14 : 4);
  const availH = h - top - FOOT - 2;
  const size = Math.max(18, Math.min(46, availW / cols, availH / rows));
  const gridW = size * cols;
  const x0 = left + Math.max(0, (availW - gridW) / 2);
  const y0 = top;
  // Centre the table vertically when the width, not the height, sets the cell size.
  const oy = Math.max(0, (h - (top + size * rows + FOOT)) / 2);

  let svg = "";
  const text = (x, y, s, style, anchor = "middle", extra = "") =>
    (svg +=
      `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" text-anchor="${anchor}" ` +
      `style="${style};${FONT}"${extra}>${esc(s)}</text>`);
  const box = (x, y, wd, ht, st) =>
    (svg +=
      `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${wd.toFixed(1)}" height="${ht.toFixed(1)}" rx="3" ` +
      `style="fill:${st.fill};stroke:${st.stroke}" stroke-width="${st.wdt ?? 1}"${st.dash ? ' stroke-dasharray="3 3"' : ""}/>`);

  // Index labels.
  for (let j = 0; j < cols; j++) text(x0 + j * size + size / 2, IDX - 4, j, "fill:var(--faint)");
  for (let i = 0; i < rows; i++) text(IDX - 4, y0 + i * size + size / 2 + 4, i, "fill:var(--faint)", "end");

  // Header letters, in their own small boxes when highlighted.
  const letter = (x, y, s, stName) => {
    if (stName) box(x - 9, y - 13, 18, 18, STYLE[stName]);
    text(x, y, s, `fill:${stName ? STYLE[stName].text : "var(--fg)"};font-weight:600`);
  };
  if (spec.topLetters) {
    spec.topLetters.forEach((s, k) =>
      letter(x0 + (k + 1) * size + size / 2, IDX + LET - 5, s, spec.letterSt?.("top", k + 1)),
    );
  }
  if (spec.leftLetters) {
    spec.leftLetters.forEach((s, k) =>
      letter(IDX + LET / 2 + 1, y0 + (k + 1) * size + size / 2 + 4, s, spec.letterSt?.("left", k + 1)),
    );
  }

  // Cells: value low-right, the arrow (if any) high-left.
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const c = spec.cell(i, j);
      const st = STYLE[c.st] || STYLE.plain;
      const x = x0 + j * size;
      const y = y0 + i * size;
      box(x + 1, y + 1, size - 2, size - 2, st);
      if (c.text == null) continue;
      if (c.arrow) {
        text(x + size * 0.3, y + size * 0.42, c.arrow, `fill:${c.st === "empty" ? "var(--faint)" : "var(--muted)"}`);
        text(x + size * 0.64, y + size * 0.78, c.text, `fill:${st.text}`);
      } else {
        text(x + size / 2, y + size / 2 + 4, c.text, `fill:${st.text}`);
      }
    }
  }

  // Extra columns on the right.
  right.forEach((col, k) => {
    const x = x0 + gridW + 6 + k * RIGHT_W + RIGHT_W / 2;
    text(x, IDX - 4, col.title, "fill:var(--muted);font-weight:600");
    col.values.forEach((v, idx) => {
      const i = idx + 1;
      const stName = col.st?.(i);
      const y = y0 + i * size;
      if (stName) box(x - RIGHT_W / 2 + 2, y + 3, RIGHT_W - 4, size - 6, STYLE[stName]);
      text(x, y + size / 2 + 4, v, `fill:${stName ? STYLE[stName].text : "var(--fg)"}`);
    });
  });

  if (spec.footer != null) {
    text(x0, y0 + rows * size + 18, spec.footer, "fill:var(--fg);font-weight:600", "start");
  }

  stage.innerHTML =
    `<svg width="100%" height="100%" viewBox="0 0 ${w.toFixed(0)} ${h.toFixed(0)}" ` +
    `preserveAspectRatio="none" role="img" aria-hidden="true" style="display:block"><g transform="translate(0 ${oy.toFixed(1)})">${svg}</g></svg>`;
}
