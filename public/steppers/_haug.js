/**
 * Shared drawing for the heap steppers build-max-heap.js and heapsort.js: the
 * table A drawn twice from the same frame, as the tree on top and as cells
 * underneath, so the reader sees that Left, Right and Parent are arithmetic on
 * indices. Indices are 0-based, as in the Python: the children of i are 2i + 1
 * and 2i + 2, and the parent is (i - 1) // 2.
 *
 * Frame fields read here (everything else belongs to the stepper):
 *   A       the values
 *   n       length of A
 *   size    heap size; cells at index >= size are outside the heap (finished,
 *           green) and are left out of the tree
 *   cur     the node being repaired (accent)
 *   kids    the children it is compared with (orange outline)
 *   big     the larger of them (orange)
 *   swap    [i, m] just exchanged (accent)
 *   okFrom  nodes at index >= okFrom already root a max-heap; the rest are
 *           drawn dashed (Build-Max-Heap only)
 *
 * Colours are framework tokens only, so frames re-theme on the light/dark
 * toggle without the module knowing which theme is active.
 */

/** A random permutation of 1..size. */
export function shuffled(size) {
  const a = Array.from({ length: size }, (_, i) => i + 1);
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const esc = (v) =>
  String(v).replace(
    /[&<>"]/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c],
  );

const STYLE = {
  plain: { fill: "none", stroke: "var(--border)", text: "var(--fg)" },
  todo: { fill: "none", stroke: "var(--border)", text: "var(--fg)", dash: true },
  cur: { fill: "var(--accent-weak)", stroke: "var(--accent)", text: "var(--accent-ink)", wdt: 2 },
  kid: { fill: "none", stroke: "var(--orange)", text: "var(--fg)", wdt: 1.6 },
  big: { fill: "color-mix(in srgb, var(--orange) 22%, transparent)", stroke: "var(--orange)", text: "var(--fg)", wdt: 2 },
  swap: { fill: "var(--accent-weak)", stroke: "var(--accent)", text: "var(--accent-ink)", wdt: 2.2 },
  sorted: { fill: "color-mix(in srgb, var(--green) 16%, transparent)", stroke: "var(--green)", text: "var(--fg)" },
};

function styleOf(frame, idx) {
  if (idx >= frame.size) return STYLE.sorted;
  if (frame.swap && frame.swap.includes(idx)) return STYLE.swap;
  if (frame.cur === idx) return STYLE.cur;
  if (frame.big === idx) return STYLE.big;
  if (frame.kids && frame.kids.includes(idx)) return STYLE.kid;
  if (frame.okFrom != null && idx < frame.okFrom) return STYLE.todo;
  return STYLE.plain;
}

const FONT = "font-family:var(--font-mono);font-size:var(--text-xs)";

export function drawHeap(stage, frame, api) {
  const { w, h } = api.getSize();
  const { A, n, size } = frame;
  if (!n || w <= 0 || h <= 0) {
    stage.innerHTML = "";
    return;
  }

  const CELL_H = 24;
  const IDX_H = 14;
  const GAP = 12;
  const LABEL_W = 22;
  const PAD_R = 4;
  const arrayY = h - IDX_H - CELL_H;
  const treeH = arrayY - GAP;
  const depth = Math.floor(Math.log2(n));
  const slotW = w / 2 ** depth;
  const r = Math.max(9, Math.min(15, slotW / 2.5, treeH / (depth + 1) / 2.4));
  const levelH = depth > 0 ? (treeH - 2 * r - 2) / depth : 0;
  const pos = (i) => {
    const d = Math.floor(Math.log2(i + 1));
    const p = i - (2 ** d - 1);
    return { x: (w / 2 ** d) * (p + 0.5), y: r + 1 + d * levelH };
  };

  let svg = "";
  // Edges first, trimmed to the circle rims so an unfilled node stays clean.
  for (let i = 1; i < size; i++) {
    const a = pos((i - 1) >> 1);
    const b = pos(i);
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = Math.hypot(dx, dy) || 1;
    const ux = dx / len;
    const uy = dy / len;
    svg +=
      `<line x1="${(a.x + ux * r).toFixed(1)}" y1="${(a.y + uy * r).toFixed(1)}" ` +
      `x2="${(b.x - ux * r).toFixed(1)}" y2="${(b.y - uy * r).toFixed(1)}" ` +
      `style="stroke:var(--border)" stroke-width="1.4"/>`;
  }
  for (let i = 0; i < size; i++) {
    const { x, y } = pos(i);
    const st = styleOf(frame, i);
    svg +=
      `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}" ` +
      `style="fill:${st.fill};stroke:${st.stroke}" stroke-width="${st.wdt ?? 1.2}"` +
      `${st.dash ? ' stroke-dasharray="3 3"' : ""}/>`;
    svg +=
      `<text x="${x.toFixed(1)}" y="${(y + 4).toFixed(1)}" text-anchor="middle" ` +
      `style="fill:${st.text};${FONT};font-weight:600">${esc(A[i])}</text>`;
  }

  // The same table as cells, indices underneath.
  const cellW = (w - LABEL_W - PAD_R) / n;
  const showText = cellW >= 18;
  svg +=
    `<text x="${LABEL_W - 8}" y="${arrayY + CELL_H / 2 + 4}" text-anchor="end" ` +
    `style="fill:var(--muted);${FONT};font-weight:600">A</text>`;
  for (let i = 0; i < n; i++) {
    const x = LABEL_W + i * cellW + 1;
    const st = styleOf(frame, i);
    svg +=
      `<rect x="${x.toFixed(1)}" y="${arrayY}" width="${(cellW - 2).toFixed(1)}" height="${CELL_H}" rx="4" ` +
      `style="fill:${st.fill};stroke:${st.stroke}" stroke-width="${st.wdt ?? 1.2}"` +
      `${st.dash ? ' stroke-dasharray="3 3"' : ""}/>`;
    if (showText) {
      const cx = (x + (cellW - 2) / 2).toFixed(1);
      svg +=
        `<text x="${cx}" y="${arrayY + CELL_H / 2 + 4}" text-anchor="middle" ` +
        `style="fill:${st.text};${FONT}">${esc(A[i])}</text>`;
      svg +=
        `<text x="${cx}" y="${arrayY + CELL_H + 11}" text-anchor="middle" ` +
        `style="fill:var(--faint);${FONT}">${i}</text>`;
    }
  }

  stage.innerHTML =
    `<svg width="100%" height="100%" viewBox="0 0 ${w.toFixed(0)} ${h.toFixed(0)}" ` +
    `preserveAspectRatio="none" role="img" aria-hidden="true" style="display:block">${svg}</svg>`;
}
