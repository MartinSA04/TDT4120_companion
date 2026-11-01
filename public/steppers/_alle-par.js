/**
 * Shared drawing for modul 12 «Korteste vei fra alle til alle»: the sim
 * «Mellomlandinger» and the stepper floyd-warshall.js. An n × n matrix with
 * row and column numbers, the lecture's example graph (the textbook's figure
 * 23.1), and the two colours for the two halves of a path through k: the part
 * from i to k in the accent and the part from k to j in cyan, in every widget
 * and figure of the module.
 *
 * Colours are framework tokens only, so frames re-theme on the light/dark
 * toggle without the module knowing which theme is active.
 */
import { FONT, NODE, esc } from "./_graf.js";

export const HALF1 = "var(--accent)";
export const HALF2 = "var(--cyan)";

export const fmt = (x) => (x === Infinity ? "∞" : String(x).replace("-", "−"));

/** A weight as the second term of a sum: a negative one in parentheses, «2 + (−4)». */
export const term = (x) => (x < 0 ? `(${fmt(x)})` : fmt(x));

/** Subscript digits for step texts: sub(4, 2) → «₄₂». */
const SUB = "₀₁₂₃₄₅₆₇₈₉";
export const sub = (...xs) => xs.map((x) => String(x).replace(/\d/g, (d) => SUB[d])).join("");

/**
 * The lecture's graph for Floyd-Warshall: five nodes, nine directed edges,
 * laid out as in the textbook (2 at the top, 1 and 3 at the sides, 5 and 4
 * at the bottom).
 */
export const GRAF = {
  nodes: [
    { id: 1, gx: 0, gy: 1 },
    { id: 2, gx: 2, gy: 0 },
    { id: 3, gx: 4, gy: 1 },
    { id: 4, gx: 3.1, gy: 2.5 },
    { id: 5, gx: 0.9, gy: 2.5 },
  ],
  edges: [
    { from: 1, to: 2, w: 3 },
    { from: 1, to: 3, w: 8 },
    { from: 1, to: 5, w: -4 },
    { from: 2, to: 4, w: 1 },
    { from: 2, to: 5, w: 7 },
    { from: 3, to: 2, w: 4 },
    { from: 4, to: 1, w: 2 },
    { from: 4, to: 3, w: -5 },
    { from: 5, to: 4, w: 6 },
  ],
};

/** The weight matrix W of a graph with nodes 1..n: 0 on the diagonal, ∞ where no edge. */
export function weightMatrix(graph) {
  const n = graph.nodes.length;
  const W = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 0 : Infinity)));
  for (const e of graph.edges) W[e.from - 1][e.to - 1] = e.w;
  return W;
}

/** Edges of a path given as a node list [a, b, c] → Set of "a-b", "b-c". */
export const pathEdges = (p) => new Set((p ?? []).slice(1).map((v, t) => `${p[t]}-${v}`));

/**
 * An n × n matrix at (x, y): a title over the row numbers, column numbers on
 * top, row numbers on the left, then the cells. `text(i, j)` gives the cell
 * text (1-based i, j); `style(i, j)` gives { fill?, stroke?, wdt?, color?,
 * bold?, dash? }. `corner` = [left word, top word] is drawn in the corner
 * cell (for a table read as «from» by row, «to» by column). Returns
 * { svg, cellAt(i, j) → { x, y, w, h } }.
 */
export function matrixSvg(x, y, cw, ch, n, text, style, { title = "", corner = null, head = cw * 0.7 } = {}) {
  let s = "";
  const x0 = x + head;
  const y0 = y + ch;
  if (title) {
    s +=
      `<text x="${(x + head / 2).toFixed(1)}" y="${(y + ch / 2 + 4).toFixed(1)}" text-anchor="middle" ` +
      `style="fill:var(--fg);${FONT};font-weight:600">${esc(title)}</text>`;
  }
  if (corner) {
    s +=
      `<text x="${(x + 2).toFixed(1)}" y="${(y + ch - 3).toFixed(1)}" style="fill:var(--faint);${FONT};font-size:10px">${esc(corner[0])}</text>` +
      `<text x="${(x0 - 2).toFixed(1)}" y="${(y + 10).toFixed(1)}" text-anchor="end" style="fill:var(--faint);${FONT};font-size:10px">${esc(corner[1])}</text>`;
  }
  for (let j = 1; j <= n; j++) {
    s +=
      `<text x="${(x0 + (j - 0.5) * cw).toFixed(1)}" y="${(y + ch / 2 + 4).toFixed(1)}" text-anchor="middle" ` +
      `style="fill:var(--muted);${FONT}">${j}</text>`;
  }
  const over = [];
  for (let i = 1; i <= n; i++) {
    const cy = y0 + (i - 1) * ch;
    s +=
      `<text x="${(x0 - 6).toFixed(1)}" y="${(cy + ch / 2 + 4).toFixed(1)}" text-anchor="end" ` +
      `style="fill:var(--muted);${FONT}">${i}</text>`;
    for (let j = 1; j <= n; j++) {
      const cx = x0 + (j - 1) * cw;
      const st = style(i, j) ?? {};
      s +=
        `<rect x="${cx.toFixed(1)}" y="${cy.toFixed(1)}" width="${cw.toFixed(1)}" height="${ch.toFixed(1)}" ` +
        `style="fill:${st.fill ?? "var(--bg)"};stroke:var(--border-strong)" stroke-width="1"/>`;
      if (st.stroke) {
        // Outlines go on top of every cell, so a neighbour's plain border cannot cut them.
        const in2 = (st.wdt ?? 2) / 2 + 0.5;
        over.push(
          `<rect x="${(cx + in2).toFixed(1)}" y="${(cy + in2).toFixed(1)}" width="${(cw - 2 * in2).toFixed(1)}" height="${(ch - 2 * in2).toFixed(1)}" rx="2" ` +
            `style="fill:none;stroke:${st.stroke}" stroke-width="${st.wdt ?? 2}"${st.dash ? ` stroke-dasharray="${st.dash}"` : ""}/>`,
        );
      }
      s +=
        `<text x="${(cx + cw / 2).toFixed(1)}" y="${(cy + ch / 2 + 4).toFixed(1)}" text-anchor="middle" ` +
        `style="fill:${st.color ?? "var(--fg)"};${FONT}${st.bold ? ";font-weight:600" : ""}">${esc(text(i, j))}</text>`;
    }
  }
  s += over.join("");
  return {
    svg: s,
    width: head + n * cw,
    height: (n + 1) * ch,
    cellAt: (i, j) => ({ x: x0 + (j - 1) * cw, y: y0 + (i - 1) * ch, w: cw, h: ch }),
  };
}

/** Gray fill for a cell that changed, the same gray as a half-filled node. */
export const CHANGED = NODE.gray.fill;
