/**
 * Tabelldobling: what n calls of Table-Insert cost, and why doubling the
 * table when it is full keeps the total under 3n while growing it by one
 * place costs n(n − 1)/2 copies.
 *
 * One row per insertion i = 1, …, n, top to bottom, like module 01's
 * arbeidet.js. Row i shows the internal table T.table right after insertion
 * i, plass 1..T.size. The element inserted in this insertion (plass i) is a
 * pale tile with a heavy accent outline; the elements copied into a new table
 * in this insertion are solid orange; the older elements that did not move
 * are neutral; free capacity (plass i + 1..T.size) is a dashed outline. The
 * rows share their left edge (plass 1), so the capacity visibly jumps.
 *
 * Table-Insert as the book writes it (the bench's block `table-insert`): if
 * T.size == 0 allocate a table of one place; if T.num == T.size allocate a
 * larger table, copy the T.num elements over (line 6) and free the old one;
 * then insert x (line 10). Cost model of the book and the lecture: 1 per
 * insertion and 1 per element copied; allocation and freeing are free.
 *
 *  - «×2» (the book): A[1 : 2 · T.size]. Insertion i copies when i − 1 is a
 *    power of 2 (i = 2, 3, 5, 9, 17), and then copies i − 1 elements. Copies
 *    for n insertions = the sum of the powers of 2 below n, which is < 2n:
 *    n = 16: 1 + 2 + 4 + 8 = 15, total 15 + 16 = 31;
 *    n = 17: 31 copies, total 48 (the worst ratio on the slider, 48/17 ≈ 2,8);
 *    n = 32: 31 copies, total 63.
 *  - «+1»: A[1 : T.size + 1]. Every insertion i ≥ 2 finds the table full and
 *    copies i − 1 elements: n(n − 1)/2 copies, the staircase of
 *    Insertion-Sort's worst case. n = 16: 120, total 136; n = 32: 496,
 *    total 528.
 *
 * The one readout is the note «15 kopieringer / 16 innsettinger / 31 i alt».
 * Its first two lines carry a swatch each (orange, accent), so the note is
 * also the legend: the orange tiles are the copies, the accent tiles the
 * insertions. It sits in the empty corner right of the short top rows when
 * that costs the drawing little at every n (a 390 px phone and wider),
 * otherwise under the drawing (narrower phones). The drawing is as wide as 32
 * cells at n ≥ 17, so on a phone those cells are about 8 px, and only the odd
 * rows (1, 3, 5, 9, 17, …) keep their label. The geometry depends on n only,
 * never on the strategy:
 * the drawing is always as wide as the doubling table after n insertions
 * (the smallest power of 2 ≥ n, which is ≥ the +1 table's n places), and the
 * note is sized for the larger +1 numbers. Cells are square, at most
 * CELL_MAX; the values 1..i (the element inserted in insertion j sits at
 * plass j) are printed only when the widest one fits inside a cell.
 *
 * Deterministic: no randomness anywhere.
 *
 * Colours are framework tokens only. The course accent (vermillion) is close
 * to --orange in hue, so the two never differ by hue alone: a copied element
 * is a solid orange tile, the new element a pale tile with a heavy accent
 * outline.
 *
 * Contract: default-export init(api); host="dom", so api = { stage, controls,
 * getSize, onResize, signal }.
 */

const N_MIN = 1;
const N_MAX = 32;
const N_DEFAULT = 16;

const GROWTH = {
  dobbel: { label: "×2", aria: "Dobbel kapasitet når tabellen er full" },
  pluss: { label: "+1", aria: "Én plass mer når tabellen er full" },
};

/** Largest cell side in px; square cells stop growing past this. */
const CELL_MAX = 40;

const esc = (v) =>
  String(v).replace(
    /[&<>"]/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c],
  );

/** Smallest power of 2 ≥ k: the doubling table's T.size after k insertions. */
const pow2ceil = (k) => {
  let p = 1;
  while (p < k) p *= 2;
  return p;
};

/**
 * Runs n calls of Table-Insert and records, for every insertion i, T.size
 * right after it and how many elements line 6 copied in it.
 */
function rowsOf(n, growth) {
  const rows = [];
  let size = 0;
  let num = 0;
  for (let i = 1; i <= n; i++) {
    let copied = 0;
    if (size === 0) size = 1;
    if (num === size) {
      size = growth === "dobbel" ? 2 * size : size + 1;
      copied = num;
    }
    num += 1;
    rows.push({ i, size, copied });
  }
  return rows;
}

export default function init({ stage, controls, getSize, onResize, signal }) {
  let growth = "dobbel";
  let n = N_DEFAULT;

  // ── kontroller ──────────────────────────────────────────────────────────
  // A group of buttons is not a labelable control, so the group gets the
  // framework's label layout on a <div role="group"> instead of a <label>
  // (a <label> would forward a click on its text to the first button).
  const group = document.createElement("div");
  group.setAttribute("role", "group");
  group.setAttribute("aria-label", "Vekst når tabellen er full");
  group.style.cssText =
    "flex:1;min-width:180px;display:flex;flex-direction:column;gap:var(--space-2);" +
    "font-family:var(--font-mono);font-size:var(--text-xs);color:var(--muted)";
  const groupText = document.createElement("span");
  groupText.textContent = "Vekst";
  const row = document.createElement("span");
  row.style.cssText = "display:flex;flex-wrap:wrap;gap:var(--space-2)";
  const growthBtns = {};
  for (const k of Object.keys(GROWTH)) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "sim-btn";
    b.textContent = GROWTH[k].label;
    b.setAttribute("aria-label", GROWTH[k].aria);
    b.addEventListener(
      "click",
      () => {
        growth = k;
        sync();
        render();
      },
      { signal },
    );
    growthBtns[k] = b;
    row.append(b);
  }
  group.append(groupText, row);

  const nLabel = document.createElement("label");
  nLabel.append("n ");
  const nOut = document.createElement("output");
  const nInput = document.createElement("input");
  nInput.type = "range";
  nInput.min = String(N_MIN);
  nInput.max = String(N_MAX);
  nInput.step = "1";
  nInput.value = String(n);
  nInput.setAttribute("aria-label", "Antall innsettinger n");
  nLabel.append(nOut, nInput);
  nInput.addEventListener(
    "input",
    () => {
      n = Number(nInput.value);
      sync();
      render();
    },
    { signal },
  );

  controls.append(group, nLabel);

  function sync() {
    for (const k of Object.keys(GROWTH)) growthBtns[k].setAttribute("aria-pressed", String(k === growth));
    nOut.textContent = String(n);
  }

  // ── tegning ─────────────────────────────────────────────────────────────
  function render() {
    const { w, h } = getSize();
    if (w <= 0 || h <= 0) {
      stage.innerHTML = "";
      return;
    }
    const rows = rowsOf(n, growth);
    const copies = rows.reduce((s, r) => s + r.copied, 0);

    // Type sizes in px, read from the root so the layout follows the reader's
    // text size. IBM Plex Mono advances 0.6 em per glyph.
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    const fsSm = 0.84 * rem;
    const fsXs = 0.72 * rem;
    const textW = (s, fs) => s.length * 0.6 * fs;

    // The note: three lines, the first two with a swatch. Its width is taken
    // at the +1 numbers for each n (the larger ones), so nothing moves when
    // only the strategy changes.
    const SW = Math.round(fsXs); // swatch side
    const SW_GAP = 6;
    const lh = fsSm * 1.4;
    const noteH = 3 * lh;
    const noteWof = (k) => {
      const c = (k * (k - 1)) / 2;
      return (
        SW +
        SW_GAP +
        Math.max(textW(`${c} kopieringer`, fsSm), textW(`${k} innsettinger`, fsSm), textW(`${c + k} i alt`, fsSm))
      );
    };

    const PAD_X = 8;
    const PAD_Y = 12;
    const LABEL_W = Math.ceil(textW(String(N_MAX), fsXs)) + 8; // row labels i = 1..n
    const HEAD_H = Math.ceil(fsXs) + 8; // the «i» header
    const GAP = 14; // between the drawing and the note
    const availW = w - 2 * PAD_X;
    const availH = h - 2 * PAD_Y;

    // Two places for the note. «corner»: in the empty corner right of the
    // short top rows, beside the widest row it overlaps (the doubling table's
    // row, which is never narrower than the +1 table's). «below»: under the
    // drawing. For a given k (insertions) each place gets the largest square
    // cell that fits.
    const corner = (k, s) => {
      const cols = pow2ceil(k);
      const noteW = noteWof(k);
      const rowsUnder = Math.min(k, Math.max(1, Math.ceil(noteH / s)));
      const widest = pow2ceil(rowsUnder) * s;
      return {
        s,
        mode: "corner",
        noteW,
        contentW: LABEL_W + Math.max(cols * s, widest + GAP + noteW),
        contentH: HEAD_H + Math.max(k * s, noteH),
      };
    };
    const below = (k, s) => {
      const cols = pow2ceil(k);
      const noteW = noteWof(k);
      return {
        s,
        mode: "below",
        noteW,
        contentW: LABEL_W + Math.max(cols * s, noteW),
        contentH: HEAD_H + k * s + GAP + noteH,
      };
    };
    const largest = (fn, k) => {
      for (let s = CELL_MAX; s >= 5; s -= 0.25) {
        const L = fn(k, s);
        if (L.contentW <= availW && L.contentH <= availH) return L;
      }
      return fn(k, 5);
    };
    // The place depends on the stage only, never on n, so the note does not
    // jump while the reader drags the slider: the corner is used when it
    // costs the drawing little for every n.
    let useCorner = true;
    for (let k = N_MIN; k <= N_MAX; k++) {
      if (largest(corner, k).s < 0.8 * largest(below, k).s) {
        useCorner = false;
        break;
      }
    }
    const L = largest(useCorner ? corner : below, n);
    const s = L.s;
    const ox = PAD_X + Math.max(0, (availW - L.contentW) / 2);
    const oy = PAD_Y + Math.max(0, (availH - L.contentH) / 2);
    const gx = ox + LABEL_W; // left edge of plass 1
    const gy = oy + HEAD_H; // top of row i = 1
    const fsCell = s >= 30 ? fsSm : fsXs;
    const inset = s >= 14 ? 1.5 : s >= 9 ? 1 : 0.75;
    // Values only where the widest one clears the accent outline with a
    // margin; otherwise the colours alone carry the row (type never shrinks
    // below xs).
    const showValues = s >= String(n).length * 0.6 * fsCell + 2 * (inset + 2) + 5;
    const rx = Math.min(4, s * 0.16);
    const accentW = s >= 14 ? 2 : 1.5;
    // Free capacity: a dashed outline whose dashes sit symmetrically on each
    // side with the corners open, so even a tiny cell reads as an empty box
    // and not as a dotted texture. The rounded rect's path starts where the
    // top edge leaves the top-left corner; one side, corner arcs included, is
    // a quarter of the perimeter.
    const freeO = inset + 0.5;
    const freeL = s - 2 * freeO;
    const freeR = Math.min(rx, freeL / 2);
    const side = (4 * (freeL - 2 * freeR) + 2 * Math.PI * freeR) / 4;
    // One dash per side on a tiny cell (two would read as dots), otherwise
    // dashes about 3 px long.
    const perSide = freeL < 9 ? 1 : Math.max(2, Math.round(freeL / 6));
    const period = side / perSide;
    const dashLen = 0.55 * period;
    const firstDash = (freeL - 2 * freeR) / 2 - side / 2 + period / 2 - dashLen / 2;
    const dashAttr =
      ` stroke-width="1" stroke-dasharray="${dashLen.toFixed(2)} ${(period - dashLen).toFixed(2)}"` +
      ` stroke-dashoffset="${(-firstDash).toFixed(2)}"`;

    let svg = "";
    const text = (x, y, str, style, anchor = "start") =>
      (svg +=
        `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" text-anchor="${anchor}" ` +
        `style="font-family:var(--font-mono);${style}">${esc(str)}</text>`);
    const tile = (x, y, o, style, extra = "") =>
      (svg +=
        `<rect x="${(x + o).toFixed(2)}" y="${(y + o).toFixed(2)}" width="${(s - 2 * o).toFixed(2)}" ` +
        `height="${(s - 2 * o).toFixed(2)}" rx="${rx.toFixed(1)}" style="${style}"${extra}/>`);

    // Header and row labels: the value of i.
    text(gx - 8, gy - 7, "i", "fill:var(--faint);font-size:var(--text-xs);font-style:italic", "end");

    for (const r of rows) {
      const y = gy + (r.i - 1) * s;
      const cy = y + s / 2;
      // When the rows get lower than the label type, only the odd rows keep
      // their label: row 1 and the rows where doubling copies (3, 5, 9, 17).
      if (s >= fsXs * 1.15 || r.i % 2 === 1) {
        text(gx - 8, cy + fsXs * 0.35, r.i, "fill:var(--faint);font-size:var(--text-xs)", "end");
      }
      for (let j = 1; j <= r.size; j++) {
        const x = gx + (j - 1) * s;
        let ink = null;
        if (j === r.i) {
          // The new element: pale fill and a heavy outline, kept inside the cell.
          tile(x, y, inset + accentW / 2, "fill:var(--accent-weak);stroke:var(--accent)", ` stroke-width="${accentW}"`);
          ink = "fill:var(--accent-ink);font-weight:600";
        } else if (j < r.i && j <= r.copied) {
          tile(x, y, inset, "fill:var(--orange)");
          ink = "fill:var(--bg);font-weight:600";
        } else if (j < r.i) {
          tile(x, y, inset, "fill:color-mix(in srgb, var(--fg) 12%, transparent)");
          ink = "fill:var(--muted)";
        } else {
          // Free capacity: part of the table, holds no element.
          tile(x, y, freeO, "fill:none;stroke:var(--border-strong)", dashAttr);
        }
        if (ink && showValues) {
          text(x + s / 2, cy + fsCell * 0.35, j, `${ink};font-size:${fsCell.toFixed(2)}px`, "middle");
        }
      }
    }

    // The note. In the corner it is left-aligned against the right edge of
    // the content, beside the short top rows; below, it starts under plass 1.
    let nx;
    let ny;
    if (L.mode === "corner") {
      nx = ox + L.contentW - L.noteW;
      ny = gy;
    } else {
      nx = gx;
      ny = gy + n * s + GAP;
    }
    const tx = nx + SW + SW_GAP;
    const base = (k) => ny + k * lh + lh / 2 + fsSm * 0.35;
    const line = (k, num, word, color) =>
      (svg +=
        `<text x="${tx.toFixed(1)}" y="${base(k).toFixed(1)}" style="font-family:var(--font-mono);font-size:var(--text-sm);fill:${color}">` +
        `<tspan style="font-weight:600">${num}</tspan> ${esc(word)}</text>`);
    const swY = (k) => ny + k * lh + (lh - SW) / 2;
    svg += `<rect x="${nx.toFixed(1)}" y="${swY(0).toFixed(1)}" width="${SW}" height="${SW}" rx="2" style="fill:var(--orange)"/>`;
    svg +=
      `<rect x="${(nx + 0.75).toFixed(1)}" y="${(swY(1) + 0.75).toFixed(1)}" width="${SW - 1.5}" height="${SW - 1.5}" rx="2" ` +
      `style="fill:var(--accent-weak);stroke:var(--accent);stroke-width:1.5"/>`;
    line(0, copies, copies === 1 ? "kopiering" : "kopieringer", "var(--fg)");
    line(1, n, n === 1 ? "innsetting" : "innsettinger", "var(--fg)");
    line(2, copies + n, "i alt", "var(--muted)");

    stage.innerHTML =
      `<svg width="100%" height="100%" viewBox="0 0 ${w.toFixed(0)} ${h.toFixed(0)}" ` +
      `preserveAspectRatio="none" role="img" aria-hidden="true" style="display:block">${svg}</svg>`;
  }

  sync();
  onResize(render);
  render();
}
