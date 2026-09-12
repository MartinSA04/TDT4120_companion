/**
 * Radix-Sort trace for <Stepper>, driving the Python block `radix-sort` in
 * modul 04. Left column: the numbers as they stand before the pass. Right
 * column: the pass's output, filled top-down in stable order, one number per
 * step. After a pass the output becomes the next pass's input.
 *
 * Line numbers refer to that <CodeBlock>:
 *    1 def radix_sort(A, n, d):
 *    2     for i in range(d):
 *    3         A = stable_sort_on_digit(A, n, i)  # Counting-Sort med k = 9
 *    4     return A
 *
 * Digit i counts from the right (i = 0 is the last digit), as the Python
 * does. Numbers have D = 3 digits drawn from 0..3 so ties are frequent and
 * the stability is visible: a number with the same digit as an earlier one
 * lands right after it. The active digit is the accent colour; digits already
 * sorted on are green.
 *
 * Colours are framework tokens only, so frames re-theme on the light/dark
 * toggle without the module knowing which theme is active.
 */

const D = 3;
const BASE = 4; // digits 0..3

function sample(size) {
  const seen = new Set();
  const out = [];
  while (out.length < size) {
    let v = 0;
    for (let i = 0; i < D; i++) v = v * 10 + Math.floor(Math.random() * BASE);
    if (!seen.has(v)) {
      seen.add(v);
      out.push(v);
    }
  }
  return out;
}

const digit = (v, i) => Math.floor(v / 10 ** i) % 10;
const str = (v) => String(v).padStart(D, "0");

export default {
  sizeRange: { min: 5, max: 10, default: 7 },
  defaultData: (size = 7) => sample(size),

  run(input) {
    let A = [...input];
    const n = A.length;
    const frames = [];
    const snap = (line, desc, vars, extra = {}) =>
      frames.push({ line, desc, vars, n, left: [...A], right: Array(n).fill(null), digit: null, leftDone: 0, ...extra });

    snap(1, `radix_sort(A, ${n}, ${D}): ${n} tall med ${D} siffer. Sifrene behandles fra høyre, det minst signifikante først.`, { n, d: D });

    for (let i = 0; i < D; i++) {
      snap(
        2,
        `i = ${i}: sorter stabilt på siffer ${i}, det ${["bakerste", "midterste", "fremste"][i]}.` +
          (i > 0 ? ` Tallene er allerede sortert på ${i === 1 ? "det siste sifferet" : `de ${i} siste sifrene`}.` : ""),
        { i },
        { digit: i, leftDone: i },
      );

      // Counting-sort bookkeeping: each number goes to the next free slot in
      // its digit's block, blocks laid out in digit order.
      const count = Array(10).fill(0);
      for (const v of A) count[digit(v, i)] += 1;
      const next = Array(10).fill(0);
      for (let dgt = 1; dgt < 10; dgt++) next[dgt] = next[dgt - 1] + count[dgt - 1];

      const out = Array(n).fill(null);
      const lastOfDigit = Array(10).fill(null);
      for (let j = 0; j < n; j++) {
        const v = A[j];
        const dgt = digit(v, i);
        const slot = next[dgt];
        next[dgt] += 1;
        out[slot] = v;
        const prev = lastOfDigit[dgt];
        lastOfDigit[dgt] = v;
        frames.push({
          line: 3,
          desc:
            prev == null
              ? `${str(v)} har siffer ${dgt} og legges på plass ${slot}, første ledige blant ${dgt}-ene.`
              : `${str(v)} har også siffer ${dgt} og legges rett etter ${str(prev)}, som sto foran den i inputen.`,
          vars: { i, "A[j]": str(v), siffer: dgt },
          n,
          left: [...A],
          right: [...out],
          digit: i,
          leftDone: i,
          moving: { from: j, to: slot },
          moved: A.slice(0, j + 1),
        });
      }
      const passInput = [...A];
      A = out;
      frames.push({
        line: 3,
        desc: `Passet er ferdig: tallene er sortert på ${i === 0 ? "det siste sifferet" : `de ${i + 1} siste sifrene`}.`,
        vars: { i },
        n,
        left: passInput,
        right: [...A],
        digit: i,
        leftDone: i,
        moved: passInput,
        passDone: true,
      });
    }

    // The last pass's output stays on the right, all digits green.
    const last = frames[frames.length - 1];
    frames.push({
      line: 4,
      desc: `Alle ${D} sifrene er behandlet, og tallene er sortert.`,
      vars: { n },
      n,
      left: last.left,
      right: last.right,
      digit: null,
      leftDone: D - 1,
      moved: last.moved,
      done: true,
    });
    return frames;
  },

  render(stage, frame, api) {
    const { w, h } = api.getSize();
    const n = frame.n;
    if (!n || w <= 0 || h <= 0) {
      stage.innerHTML = "";
      return;
    }

    const HEAD_H = 22;
    const PAD = 12;
    const colW = (w - PAD * 2) / 2;
    const cellW = Math.min(26, Math.max(13, (colW - 24) / D));
    const cardW = cellW * D;
    const rowH = (h - HEAD_H - 6) / n;
    const cellH = Math.min(26, Math.max(14, rowH - 5));
    const showText = cellW >= 15;
    const leftX = PAD + (colW - cardW) / 2;
    const rightX = PAD + colW + (colW - cardW) / 2;
    const yOf = (row) => HEAD_H + row * rowH + (rowH - cellH) / 2;

    const moved = new Set(frame.moved || []);
    let svg = "";

    const head = (x, text) => {
      svg +=
        `<text x="${(x + cardW / 2).toFixed(1)}" y="14" text-anchor="middle" ` +
        `style="fill:var(--muted);font-family:var(--font-mono);font-size:var(--text-xs)">${text}</text>`;
    };
    head(leftX, "inn");
    head(rightX, "ut");

    // A card is D digit cells; position i (from the right) is column D-1-i.
    const card = (x, y, v, doneDigits, opts = {}) => {
      const s = str(v);
      for (let col = 0; col < D; col++) {
        const pos = D - 1 - col;
        let fill = "none";
        let stroke = "var(--border)";
        let text = "var(--fg)";
        let wdt = 1.2;
        if (frame.done || pos < doneDigits) {
          fill = "color-mix(in srgb, var(--green) 14%, transparent)";
          stroke = "var(--green)";
        }
        if (!frame.done && frame.digit === pos && opts.active) {
          fill = "var(--accent-weak)";
          stroke = "var(--accent)";
          text = "var(--accent-ink)";
          wdt = 2;
        }
        const cx = x + col * cellW;
        svg +=
          `<rect x="${cx.toFixed(1)}" y="${y.toFixed(1)}" width="${(cellW - 1).toFixed(1)}" height="${cellH}" rx="3" ` +
          `style="fill:${fill};stroke:${stroke}" stroke-width="${wdt}" opacity="${opts.opacity ?? 1}"/>`;
        if (showText) {
          svg +=
            `<text x="${(cx + (cellW - 1) / 2).toFixed(1)}" y="${(y + cellH / 2 + 4).toFixed(1)}" text-anchor="middle" ` +
            `style="fill:${text};font-family:var(--font-mono);font-size:var(--text-xs)" opacity="${opts.opacity ?? 1}">${s[col]}</text>`;
        }
      }
    };

    frame.left.forEach((v, row) => {
      const isMoving = frame.moving && frame.moving.from === row;
      const gone = moved.has(v) && !isMoving;
      card(leftX, yOf(row), v, frame.leftDone, { active: frame.digit != null && !gone, opacity: gone ? 0.3 : 1 });
    });

    frame.right.forEach((v, row) => {
      const y = yOf(row);
      if (v == null) {
        svg +=
          `<rect x="${rightX.toFixed(1)}" y="${y.toFixed(1)}" width="${(cardW - 1).toFixed(1)}" height="${cellH}" rx="3" ` +
          `fill="none" stroke="var(--border)" stroke-width="1" stroke-dasharray="3 3" opacity="0.7"/>`;
        return;
      }
      const isTarget = frame.moving && frame.moving.to === row;
      card(rightX, y, v, frame.digit == null ? frame.leftDone : frame.digit + 1, { active: isTarget });
    });

    if (frame.moving) {
      const y0 = yOf(frame.moving.from) + cellH / 2;
      const y1 = yOf(frame.moving.to) + cellH / 2;
      const x0 = leftX + cardW + 2;
      const x1 = rightX - 3;
      const mx = (x0 + x1) / 2;
      svg +=
        `<path d="M ${x0.toFixed(1)} ${y0.toFixed(1)} C ${mx.toFixed(1)} ${y0.toFixed(1)}, ${mx.toFixed(1)} ${y1.toFixed(1)}, ${x1.toFixed(1)} ${y1.toFixed(1)}" ` +
        `fill="none" stroke="var(--accent)" stroke-width="1.6"/>`;
    }

    stage.innerHTML =
      `<svg width="100%" height="100%" viewBox="0 0 ${w.toFixed(0)} ${h.toFixed(0)}" ` +
      `preserveAspectRatio="none" role="img" aria-hidden="true" style="display:block">${svg}</svg>`;
  },
};
