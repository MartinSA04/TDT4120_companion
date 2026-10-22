/**
 * Radix-Sort for TDT4120 modul 05 «Rangering i lineær tid»: sort on one digit
 * at a time, the least significant digit first, with a stable sort each time.
 *
 * The one idea: after pass i the numbers are sorted on their last i digits.
 * The pass orders them by digit i, and two numbers with the same digit i keep
 * the order they had before the pass, which was sorted on the digits below.
 * Both conditions are needed. Sort on the most significant digit first and
 * the last pass undoes the earlier ones; use an unstable sort and numbers
 * with the same digit lose the order from the lower digits.
 *
 * Drawing. Two tables side by side: the table before the current pass (left)
 * and after it (right), with a thin line from each number's row before the
 * pass to its row after it. Each number is a card whose WIDTH follows its
 * value (the module's cards, lying down: a sorted table reads as a staircase
 * of widths), with its four digits printed in it, leading zeros included.
 * The left table's cards are aligned at their right ends and the right
 * table's at their left ends, so the digits of both tables stand in fixed
 * columns next to the lines between them, and the lines start and end on a
 * straight edge. Over each table the digit numbers 4 3 2 1 (CLRS and the
 * lecture: digit 1 is the last, least significant one). The digit the pass
 * sorts on has the accent outline in both tables; digits already passed
 * have a neutral tint. A line of a number whose digit is shared with another
 * number (a tie in this pass) is drawn heavier, one colour per group of equal
 * digits (accent, violet, cyan in the order the groups stand after the pass;
 * a pass on seven numbers has at most three such groups), so the reader can
 * see whether the lines of one group cross: in a stable sort they never do.
 * Lines of numbers alone with their digit are thin and muted. After the last
 * pass the right table is the result; if it is sorted, its cards turn green
 * (the staircase). At rest (no pass done) the right table is seven empty
 * dashed slots and the digit the first pass will sort on has a dashed accent
 * outline. On «Neste pass» the right table's cards slide from the rows they
 * had before the pass to their new rows (450 ms, eased; each line's right end
 * rides with its card), so cards with equal digits are seen to pass each
 * other or not; instant under prefers-reduced-motion. The cards are opaque
 * (an underlay in the stage's colour), so a sliding card covers another
 * cleanly.
 *
 * Pseudocode (lecture 4, CLRS 4th ed. §8.3): Radix-Sort(A, n, d): for i = 1
 * to d, sort A[1 : n] on digit i. The sort per digit is Counting-Sort with
 * k = 9. «ustabil» is a specific, deterministic unstable sort: Counting-Sort
 * with its last loop running forwards (for j = 1 to n), which puts numbers
 * with equal digits in the reverse of their order before the pass (exam
 * 2024-aug-kont task 3). «fremste siffer først» runs the passes on digits
 * 4, 3, 2, 1.
 *
 * Numbers the module text uses (the lecture's instance, lecture 4 slides
 * 215–239: A[1 : 7] = 1736, 0529, 1938, 1223, 0531, 2007, 2016), checked by
 * running passesOf below:
 *  - bakerste først + stabil: 0531 1223 1736 2016 2007 1938 0529 |
 *    2007 2016 1223 0529 0531 1736 1938 | the same again (pass 3 moves
 *    nothing) | 0529 0531 1223 1736 1938 2007 2016, sorted.
 *  - bakerste først + ustabil: 0531 1223 2016 1736 2007 1938 0529 |
 *    2007 2016 0529 1223 1938 1736 0531 | 2016 2007 1223 0531 0529 1736 1938 |
 *    0529 0531 1938 1736 1223 2007 2016, NOT sorted.
 *  - fremste først + stabil: 0529 0531 1736 1938 1223 2007 2016 |
 *    2007 2016 1223 0529 0531 1736 1938 | the same | 0531 1223 2016 1736
 *    2007 1938 0529, not sorted (the lecture's slide 233).
 *  - fremste først + ustabil: 0531 0529 1223 1938 1736 2016 2007 |
 *    2007 2016 1223 0529 0531 1736 1938 | 2007 2016 0529 1223 1938 1736 0531 |
 *    0531 1223 1736 2016 2007 1938 0529, not sorted.
 *
 * «Ny tabell» deals seven distinct four-digit numbers whose digits in each
 * position come from three digits drawn for that position, so every pass has
 * a group of at least three equal digits; it deals again until both wrong
 * variants (bakerste + ustabil, fremste + stabil) end unsorted, so the
 * failures show on every table.
 *
 * Controls, «Neste pass» first so it sits right under the drawing on a phone:
 * «Retning» (bakerste | fremste siffer først) and «Sortering per
 * siffer» (stabil | ustabil) keep the pass the reader is at and redraw it for
 * the new variant, so the two variants can be compared at the same pass;
 * «Neste pass» runs the next pass (disabled after pass 4); «Start på nytt»
 * goes back to the rest; «Ny tabell» deals a new table and goes to the rest.
 * One status line under the drawing: «Pass 2 av 4: sortert på siffer 2», at
 * rest «Pass 1 skal sortere på siffer 1».
 *
 * Deterministic first view: the lecture's table; Math.random only after «Ny
 * tabell».
 *
 * Colours are framework tokens only. The groups' line colours are an aid:
 * which group a line belongs to is also printed (the outlined digit at both
 * ends), and a crossing is a shape, not a colour.
 *
 * Contract: default-export init(api); host="dom", so api = { stage, controls,
 * getSize, onResize, signal }.
 */

/** The lecture's table (lecture 4, slides 215–239). */
const FIRST = [1736, 529, 1938, 1223, 531, 2007, 2016];
const D = 4;

const ORDERS = {
  lsd: { label: "bakerste siffer først", aria: "Bakerste siffer først", digits: [1, 2, 3, 4] },
  msd: { label: "fremste siffer først", aria: "Fremste siffer først", digits: [4, 3, 2, 1] },
};
const SORTS = {
  stabil: { label: "stabil", aria: "Stabil sortering per siffer" },
  ustabil: { label: "ustabil", aria: "Ustabil sortering per siffer" },
};

/** Digit i of v, digit 1 the last. */
export const digit = (v, i) => Math.floor(v / 10 ** (i - 1)) % 10;
const pad = (v) => String(v).padStart(D, "0");

/**
 * One pass: Counting-Sort of `A` on digit i with k = 9. Its last loop runs
 * j = n downto 1 when `stable`, else j = 1 to n. Returns the new table and,
 * for each row after the pass, the row (0-based) it came from.
 */
function countingPass(A, i, stable) {
  const n = A.length;
  const C = new Array(10).fill(0);
  for (const v of A) C[digit(v, i)] += 1;
  for (let d = 1; d <= 9; d++) C[d] += C[d - 1];
  const B = new Array(n);
  const from = new Array(n);
  for (let s = 0; s < n; s++) {
    const j = stable ? n - 1 - s : s;
    const d = digit(A[j], i);
    C[d] -= 1;
    B[C[d]] = A[j];
    from[C[d]] = j;
  }
  return { B, from };
}

/** All passes for a table and a variant: tables[0] = the input, tables[p] after pass p. */
export function passesOf(input, order, stable) {
  const tables = [[...input]];
  const steps = [];
  for (const i of ORDERS[order].digits) {
    const { B, from } = countingPass(tables[tables.length - 1], i, stable);
    steps.push({ i, from });
    tables.push(B);
  }
  return { tables, steps };
}

const isSorted = (A) => A.every((v, k) => k === 0 || A[k - 1] <= v);

/** Seven distinct numbers, each position's digit from three digits drawn for it. */
function dealt() {
  for (;;) {
    const pools = Array.from({ length: D }, (_, p) => {
      const ds = [];
      const top = p === D - 1 ? 3 : 10; // leading digits 0–2, as the lecture's
      while (ds.length < 3) {
        const d = Math.floor(Math.random() * top);
        if (!ds.includes(d)) ds.push(d);
      }
      return ds;
    });
    const seen = new Set();
    const A = [];
    let tries = 0;
    while (A.length < 7 && tries++ < 200) {
      let v = 0;
      for (let p = D - 1; p >= 0; p--) v = v * 10 + pools[p][Math.floor(Math.random() * 3)];
      if (!seen.has(v)) {
        seen.add(v);
        A.push(v);
      }
    }
    if (A.length < 7 || isSorted(A)) continue;
    const lsdBad = passesOf(A, "lsd", false).tables[D];
    const msdBad = passesOf(A, "msd", true).tables[D];
    if (!isSorted(lsdBad) && !isSorted(msdBad)) return A;
  }
}

export default function init({ stage, controls, getSize, onResize, signal }) {
  let table = [...FIRST];
  let order = "lsd";
  let sort = "stabil";
  let pass = 0; // passes done, 0 … 4
  // The slide after «Neste pass»: 0 → 1, the right table's cards moving
  // from the rows they had before the pass to their new rows.
  let anim = 1;
  let raf = 0;
  const SLIDE_MS = 450;
  const reduced = () => typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
  const stop = () => {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    anim = 1;
  };
  signal?.addEventListener("abort", stop);
  function slide() {
    stop();
    if (reduced()) return;
    anim = 0;
    let t0 = null;
    const tick = (now) => {
      if (signal?.aborted) return stop();
      if (t0 == null) t0 = now;
      anim = Math.min(1, Math.max(0, (now - t0) / SLIDE_MS));
      render();
      raf = anim < 1 ? requestAnimationFrame(tick) : 0;
    };
    raf = requestAnimationFrame(tick);
  }

  // ── kontroller ──────────────────────────────────────────────────────────
  // A group of buttons is not a labelable control, so each group gets the
  // framework's label layout on a <div role="group"> (as quicksort-tre.js).
  const btnGroup = (text, aria, entries, isOn, onPick) => {
    const wrap = document.createElement("div");
    wrap.setAttribute("role", "group");
    wrap.setAttribute("aria-label", aria);
    wrap.style.cssText =
      "display:flex;flex-direction:column;gap:var(--space-2);font-family:var(--font-mono);" +
      "font-size:var(--text-xs);color:var(--muted)";
    const tag = document.createElement("span");
    tag.textContent = text;
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
          stop();
          onPick(k);
          sync();
          render();
        },
        { signal },
      );
      btns[k] = b;
      row.append(b);
    }
    wrap.append(tag, row);
    return {
      el: wrap,
      sync: () => Object.keys(btns).forEach((k) => btns[k].setAttribute("aria-pressed", String(isOn(k)))),
    };
  };
  const button = (text, aria, onClick) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "sim-btn";
    b.textContent = text;
    b.setAttribute("aria-label", aria);
    b.addEventListener(
      "click",
      () => {
        stop();
        onClick();
        sync();
        render();
      },
      { signal },
    );
    return b;
  };

  const orderGroup = btnGroup("Retning", "Hvilket siffer som sorteres først", ORDERS, (k) => k === order, (k) => (order = k));
  const sortGroup = btnGroup("Sortering per siffer", "Sortering per siffer", SORTS, (k) => k === sort, (k) => (sort = k));
  const nextBtn = button("Neste pass", "Neste pass: sorter på neste siffer", () => {
    pass = Math.min(D, pass + 1);
    slide();
  });
  const resetBtn = button("Start på nytt", "Start på nytt: tilbake til tabellen før pass 1", () => (pass = 0));
  const dealBtn = button("Ny tabell", "Ny tabell: sju nye tilfeldige tall", () => {
    table = dealt();
    pass = 0;
  });

  const groups = document.createElement("div");
  groups.style.cssText = "display:flex;flex-wrap:wrap;align-items:flex-end;gap:var(--space-4) var(--space-5)";
  const actions = document.createElement("div");
  actions.style.cssText = "display:flex;flex-wrap:wrap;gap:var(--space-2)";
  actions.append(nextBtn, resetBtn, dealBtn);
  groups.append(actions, orderGroup.el, sortGroup.el);
  controls.append(groups);

  function sync() {
    orderGroup.sync();
    sortGroup.sync();
    nextBtn.disabled = pass >= D;
    resetBtn.disabled = pass === 0;
  }

  // ── tegning ─────────────────────────────────────────────────────────────
  function render() {
    const { w, h } = getSize();
    if (w <= 0 || h <= 0) {
      stage.innerHTML = "";
      return;
    }
    const n = table.length;
    const { tables, steps } = passesOf(table, order, sort === "stabil");
    const digits = ORDERS[order].digits;
    const before = tables[Math.max(0, pass - 1)];
    const after = pass > 0 ? tables[pass] : null;
    const step = pass > 0 ? steps[pass - 1] : null;
    const active = pass > 0 ? step.i : digits[0];
    const passed = digits.slice(0, Math.max(0, pass - 1));
    const finalSorted = pass === D && isSorted(after);

    // Type sizes in px, read from the root so the layout follows the reader's
    // text size. IBM Plex Mono advances 0.6 em per glyph.
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    const fsSm = 0.84 * rem;
    const fsXs = 0.72 * rem;
    const textW = (s, fs) => String(s).length * 0.6 * fs;
    const XS = "font-family:var(--font-mono);font-size:var(--text-xs)";
    const SM = "font-family:var(--font-mono);font-size:var(--text-sm)";

    // Horizontal: [left table, cards right-aligned] [lines] [right table,
    // cards left-aligned]. A card holds its four digits at the end next to
    // the lines; its width follows the value from MIN_W (the digits alone)
    // to MAX_W.
    const DW = Math.ceil(0.6 * fsSm + 2.5); // one digit cell
    const PADC = 7; // card padding beside the digits
    const MIN_W = D * DW + 2 * PADC;
    const PAD_X = 4;
    const GAP = Math.max(40, Math.min(110, (w - 2 * PAD_X) * 0.2));
    const MAX_W = Math.max(MIN_W + 30, Math.min(150, (w - 2 * PAD_X - GAP) / 2));
    const total = 2 * MAX_W + GAP;
    const xL = (w - total) / 2 + MAX_W; // right edge of the left table
    const xR = xL + GAP; // left edge of the right table
    const lo = Math.min(...table);
    const hi = Math.max(...table);
    const width = (v) => MIN_W + (hi > lo ? ((v - lo) / (hi - lo)) * (MAX_W - MIN_W) : 0);
    // Digit p (4 … 1) of a card: its cell's centre. Left table: the digits
    // end at the card's right edge; right table: they start at its left edge.
    const digitX = (side, p) =>
      side === "L" ? xL - PADC - (p - 0.5) * DW : xR + PADC + (D - p + 0.5) * DW;

    // Vertical bands: the titles, the digit numbers, seven rows, the status.
    const PAD_T = 6;
    const TITLE_H = Math.ceil(fsXs + 8);
    const HEAD_H = Math.ceil(fsXs + 9);
    const STATUS_H = Math.ceil(fsSm * 2.2);
    const avail = h - PAD_T - TITLE_H - HEAD_H - STATUS_H - 4;
    const pitch = Math.min(40, avail / n);
    const cardH = Math.min(28, pitch - 7);
    const block = TITLE_H + HEAD_H + pitch * n + STATUS_H;
    const top = PAD_T + Math.max(0, (h - 4 - PAD_T - block) / 2);
    const rowsTop = top + TITLE_H + HEAD_H;
    const rowY = (r) => rowsTop + (r + 0.5) * pitch; // centre of row r (0-based)

    // Where a card of the right table stands now: during the slide it moves
    // from the row it had before the pass to its new row (eased).
    const ease = (u) => (u < 0.5 ? 2 * u * u : 1 - 2 * (1 - u) * (1 - u));
    const nowY = (r) => (step ? rowY(step.from[r]) + (rowY(r) - rowY(step.from[r])) * ease(anim) : rowY(r));

    let svg = "";
    const f1 = (v) => v.toFixed(1);
    const text = (x, y, s, style, anchor = "middle") =>
      (svg += `<text x="${f1(x)}" y="${f1(y)}" text-anchor="${anchor}" style="${style}">${s}</text>`);
    const rect = (x, y, wd, ht, style, rx = 4, extra = "") =>
      (svg +=
        `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(Math.max(0, wd))}" height="${f1(Math.max(0, ht))}" ` +
        `rx="${rx}" style="${style}"${extra}/>`);

    // Titles over the tables, next to the lines.
    const tY = top + fsXs;
    text(xL, tY, pass > 0 ? `før pass ${pass}` : "før pass 1", `fill:var(--muted);${XS}`, "end");
    text(xR, tY, `etter pass ${Math.max(1, pass)}`, `fill:var(--muted);${XS}`, "start");

    // Digit numbers over each table, and the column marks: a tint over the
    // digits already passed (a band behind the rows, repeated inside each
    // opaque card), an accent outline on the digit of this pass (dashed at
    // rest: the digit pass 1 will use).
    const hY = top + TITLE_H + fsXs + 1;
    const colTop = rowsTop + (pitch - cardH) / 2 - 3;
    const colH = pitch * (n - 1) + cardH + 6;
    const TINT = "fill:color-mix(in srgb, var(--fg) 10%, transparent)";
    const marks = (side, show) => {
      for (let p = D; p >= 1; p--) {
        const cx = digitX(side, p);
        const on = p === active;
        text(cx, hY, p, `fill:${on ? "var(--accent-ink)" : "var(--faint)"};${XS};font-weight:${on ? 700 : 400}`);
      }
      if (!show) return;
      for (const p of passed) rect(digitX(side, p) - DW / 2, colTop, DW, colH, TINT, 3);
    };
    const outline = (side, dashed) => {
      const cx = digitX(side, active);
      rect(
        cx - DW / 2,
        colTop,
        DW,
        colH,
        "fill:none;stroke:var(--accent)",
        4,
        ` stroke-width="2"${dashed ? ' stroke-dasharray="4 3"' : ""}`,
      );
    };
    marks("L", true);
    marks("R", !!after);

    // A card with its digits; `side` "L" = right-aligned at xL, "R" = left-aligned at xR.
    // An opaque underlay in the stage's colour, so a card sliding over
    // another during the slide covers it cleanly.
    const card = (side, r, v, st, yc = rowY(r)) => {
      const wd = width(v);
      const x = side === "L" ? xL - wd : xR;
      const y = yc - cardH / 2;
      rect(x, y, wd, cardH, "fill:var(--canvas-bg)");
      rect(x, y, wd, cardH, `fill:${st.fill};stroke:${st.stroke}`, 4, ` stroke-width="${st.wdt}"`);
      if (side === "L" || after) for (const p of passed) svg += `<rect x="${f1(digitX(side, p) - DW / 2)}" y="${f1(y + 0.75)}" width="${DW}" height="${f1(cardH - 1.5)}" style="${TINT}"/>`;
      const s = pad(v);
      for (let p = D; p >= 1; p--) {
        const ch = s[D - p];
        text(digitX(side, p), yc + fsSm * 0.36, ch, `fill:var(--fg);${SM};font-weight:600`);
      }
    };
    const PLAIN = { fill: "color-mix(in srgb, var(--fg) 9%, transparent)", stroke: "color-mix(in srgb, var(--fg) 28%, transparent)", wdt: 1 };
    const DONE = { fill: "color-mix(in srgb, var(--green) 26%, transparent)", stroke: "var(--green)", wdt: 1.5 };

    // The lines, behind nothing: they live in the gap between the tables.
    // Each is an S-curve from the left table's edge to the right table's,
    // so two lines cross exactly when their numbers swap order.
    if (after) {
      const groupOf = (v) => digit(v, step.i);
      const size = new Map();
      for (const v of after) size.set(groupOf(v), (size.get(groupOf(v)) || 0) + 1);
      const tieColour = new Map();
      const COLOURS = ["var(--accent)", "var(--violet)", "var(--cyan)"];
      for (const v of after) {
        const g = groupOf(v);
        if (size.get(g) > 1 && !tieColour.has(g)) tieColour.set(g, COLOURS[tieColour.size % COLOURS.length]);
      }
      const x1 = xL + 3;
      const x2 = xR - 3;
      const cx1 = x1 + (x2 - x1) * 0.45;
      const cx2 = x2 - (x2 - x1) * 0.45;
      // Thin lines first, so the groups' lines lie on top.
      const order2 = after.map((v, r) => r).sort((a, b) => (tieColour.has(groupOf(after[a])) ? 1 : 0) - (tieColour.has(groupOf(after[b])) ? 1 : 0));
      for (const r of order2) {
        const v = after[r];
        const y1 = rowY(step.from[r]);
        const y2 = nowY(r);
        const col = tieColour.get(groupOf(v));
        svg +=
          `<path d="M ${f1(x1)} ${f1(y1)} C ${f1(cx1)} ${f1(y1)}, ${f1(cx2)} ${f1(y2)}, ${f1(x2)} ${f1(y2)}" ` +
          `style="fill:none;stroke:${col || "var(--muted)"}" stroke-width="${col ? 2 : 1}" stroke-linecap="round"/>`;
      }
    }

    // The tables.
    before.forEach((v, r) => card("L", r, v, PLAIN));
    if (after) after.forEach((v, r) => card("R", r, v, finalSorted && anim >= 1 ? DONE : PLAIN, nowY(r)));
    else
      for (let r = 0; r < n; r++)
        rect(xR, rowY(r) - cardH / 2, MIN_W, cardH, "fill:none;stroke:color-mix(in srgb, var(--fg) 30%, transparent)", 4, ' stroke-width="1.2" stroke-dasharray="4 3"');
    outline("L", !after);
    if (after) outline("R", false);

    // The status line.
    const status = after ? `Pass ${pass} av ${D}: sortert på siffer ${step.i}` : `Pass 1 skal sortere på siffer ${digits[0]}`;
    text(w / 2, top + block - STATUS_H * 0.32, status, `fill:var(--fg);${SM}`);

    stage.setAttribute("aria-label", `Radix-Sort, ${status}. ${after ? `Etter passet: ${after.map(pad).join(", ")}` : `Tabellen: ${before.map(pad).join(", ")}`}.`);
    stage.innerHTML =
      `<svg width="100%" height="100%" viewBox="0 0 ${w.toFixed(0)} ${h.toFixed(0)}" ` +
      `preserveAspectRatio="none" aria-hidden="true" style="display:block">${svg}</svg>`;
  }

  sync();
  onResize(render);
  render();
}
