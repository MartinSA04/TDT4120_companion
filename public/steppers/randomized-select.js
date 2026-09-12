/**
 * Randomized-Select trace for <Stepper>, driving the Python block
 * `randomized-select` in modul 04. Quicksort with one recursive call: every
 * partition places its pivot, and only the side that holds rank i is kept.
 *
 * Line numbers refer to that <CodeBlock>:
 *    1 from random import randint
 *    2
 *    3 def randomized_partition(A, p, r):
 *    4     j = randint(p, r)
 *    5     A[j], A[r] = A[r], A[j]
 *    6     return partition(A, p, r)
 *    7
 *    8 def randomized_select(A, p, r, i):
 *    9     if p == r:
 *   10         return A[p]
 *   11     q = randomized_partition(A, p, r)
 *   12     k = q - p + 1
 *   13     if i == k:
 *   14         return A[q]
 *   15     elif i < k:
 *   16         return randomized_select(A, p, q - 1, i)
 *   17     else:
 *   18         return randomized_select(A, q + 1, r, i - k)
 *
 * The target is the lower median, rank ⌊(n+1)/2⌋, and the marker `i` under
 * the bars is the index that element has once the array is sorted. The
 * segment still in play is shaded; a placed pivot splits it into small
 * (yellow) and large (orange), and the side that cannot hold rank i fades.
 * Green is the answer. Indices are 0-based, as in the Python.
 *
 * The "random" pivot comes from a small generator seeded by the input, so a
 * given input always replays the same trace (the framework requires run() to
 * be deterministic); shuffling draws a new input and hence new pivots.
 *
 * Colours are framework tokens only, so frames re-theme on the light/dark
 * toggle without the module knowing which theme is active.
 */

function shuffled(size) {
  const a = Array.from({ length: size }, (_, i) => i + 1);
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Deterministic generator seeded by the input values. */
function rng(input) {
  let s = 2166136261;
  for (const v of input) s = Math.imul(s ^ v, 16777619) >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

const esc = (v) =>
  String(v).replace(
    /[&<>"]/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c],
  );

const seg = (p, r) => `A[${p} .. ${r}]`;

export default {
  sizeRange: { min: 5, max: 12, default: 8 },
  defaultData: (size = 8) => shuffled(size),

  run(input) {
    const a = [...input];
    const n = a.length;
    const rand = rng(a);
    const i0 = Math.floor((n + 1) / 2);
    const target = i0 - 1;
    const frames = [];
    const snap = (line, desc, vars, extra = {}) =>
      frames.push({ line, desc, vars, data: [...a], target, ...extra });

    const partition = (p, r) => {
      const x = a[r];
      let i = p - 1;
      for (let j = p; j < r; j++) {
        if (a[j] <= x) {
          i += 1;
          [a[i], a[j]] = [a[j], a[i]];
        }
      }
      [a[i + 1], a[r]] = [a[r], a[i + 1]];
      return i + 1;
    };

    const select = (p, r, i, line) => {
      if (p === r) {
        snap(
          [9, 10],
          `p = r = ${p}: ett element igjen, og det må ha rang ${i}. Svaret er A[${p}] = ${a[p]}.`,
          { p, r, i },
          { seg: [p, r], found: p },
        );
        return;
      }
      snap(line, `randomized_select(A, ${p}, ${r}, ${i}): finn det ${i}-ende minste i ${seg(p, r)}.`, { p, r, i }, { seg: [p, r] });

      const j = p + Math.floor(rand() * (r - p + 1));
      [a[j], a[r]] = [a[r], a[j]];
      const x = a[r];
      snap(
        [4, 5],
        `randomized_partition velger j = ${j} tilfeldig, og A[${j}] = ${x} byttes inn bakerst som pivot.`,
        { p, r, i, j },
        { seg: [p, r], x, pivot: r },
      );

      const q = partition(p, r);
      snap(
        6,
        `Partition deler ${seg(p, r)}: alt mindre enn ${x} til venstre, alt større til høyre, og pivoten på plass q = ${q}.`,
        { p, r, i, q },
        { seg: [p, r], x, pivot: q, split: true },
      );

      const k = q - p + 1;
      snap(
        12,
        `k = q - p + 1 = ${k}: pivoten er det ${k}-ende minste i segmentet, og vi leter etter det ${i}-ende.`,
        { p, r, i, q, k },
        { seg: [p, r], x, pivot: q, split: true },
      );

      if (i === k) {
        snap([13, 14], `i = k, så pivoten er svaret: A[${q}] = ${x}.`, { i, k, q }, { seg: [p, r], found: q });
      } else if (i < k) {
        snap(
          [15, 16],
          `i < k: svaret er blant de ${k - 1} små. De store forkastes, og vi søker etter rang ${i} i ${seg(p, q - 1)}.`,
          { i, k, p, q },
          { seg: [p, q - 1], x, pivot: q, split: true, keep: [p, q - 1] },
        );
        select(p, q - 1, i, 16);
      } else {
        snap(
          [17, 18],
          `i > k: ${k} elementer er mindre enn eller lik pivoten, så svaret har rang ${i - k} blant de store. Vi søker i ${seg(q + 1, r)}.`,
          { i, k, q, r },
          { seg: [q + 1, r], x, pivot: q, split: true, keep: [q + 1, r] },
        );
        select(q + 1, r, i - k, 18);
      }
    };

    snap(
      8,
      `randomized_select(A, 0, ${n - 1}, ${i0}): finn medianen, elementet med rang ${i0}. Markøren i er plassen det har i sortert rekkefølge.`,
      { n, i: i0 },
      { seg: [0, n - 1] },
    );
    select(0, n - 1, i0, 8);
    const last = frames[frames.length - 1];
    last.desc += ` Elementene til venstre er mindre og til høyre større, men ingen av delene er sortert.`;
    last.done = true;
    return frames;
  },

  render(stage, frame, api) {
    const { w, h } = api.getSize();
    const data = frame.data || [];
    const n = data.length;
    if (!n || w <= 0) {
      stage.innerHTML = "";
      return;
    }

    const TOP = 14;
    const IDX_H = 20;
    const PTR_H = 16;
    const PAD_X = 16;
    const baseY = h - IDX_H - PTR_H;
    const chartH = Math.max(20, baseY - TOP);
    const gapW = Math.max(3, w * 0.012);
    const barW = Math.max(6, (w - PAD_X * 2 - gapW * (n - 1)) / n);
    const xOf = (i) => PAD_X + i * (barW + gapW);
    const maxV = Math.max(1, ...data);
    const showLabels = barW >= 18;
    const yOf = (v) => baseY - (v / maxV) * chartH;

    const [sp, sr] = frame.seg ?? [0, n - 1];
    const inSeg = (idx) => idx >= sp && idx <= sr;

    let svg = "";

    // The segment still in play, shaded from the top down to the baseline.
    if (frame.found == null) {
      const x0 = xOf(sp) - gapW / 2;
      const x1 = xOf(sr) + barW + gapW / 2;
      svg +=
        `<rect x="${x0.toFixed(1)}" y="${(TOP - 8).toFixed(1)}" width="${(x1 - x0).toFixed(1)}" height="${(baseY - TOP + 8 + IDX_H).toFixed(1)}" rx="5" ` +
        `style="fill:color-mix(in srgb, var(--fg) 5%, transparent)"/>`;
    }

    svg +=
      `<line x1="${PAD_X}" y1="${baseY.toFixed(1)}" x2="${(w - PAD_X).toFixed(1)}" y2="${baseY.toFixed(1)}" ` +
      `stroke="var(--border)" stroke-width="1"/>`;

    // The pivot height across the segment it was chosen for: everything under
    // the line is small.
    if (frame.x != null && frame.found == null) {
      const [lp, lr] = frame.keep ? [Math.min(frame.pivot, sp), Math.max(frame.pivot, sr)] : [sp, sr];
      svg +=
        `<line x1="${xOf(lp).toFixed(1)}" y1="${yOf(frame.x).toFixed(1)}" x2="${(xOf(lr) + barW).toFixed(1)}" y2="${yOf(frame.x).toFixed(1)}" ` +
        `stroke="var(--accent)" stroke-width="1.2" stroke-dasharray="4 4" opacity="0.8"/>`;
    }

    data.forEach((v, idx) => {
      const x = xOf(idx);
      const cx = x + barW / 2;
      const bh = (v / maxV) * chartH;

      let fill = "color-mix(in srgb, var(--fg) 16%, transparent)";
      let opacity = 1;
      if (frame.found === idx) fill = "var(--green)";
      else if (frame.found != null) opacity = 0.45;
      else if (idx === frame.pivot && frame.x != null) fill = "var(--accent)";
      else if (frame.split && (inSeg(idx) || (frame.keep && idx !== frame.pivot))) {
        // Inside the partitioned segment (or the side just discarded, still
        // coloured but faded) the zones show what Partition did.
        const small = idx < frame.pivot;
        fill = small ? "var(--yellow)" : "var(--orange)";
        if (!inSeg(idx)) opacity = 0.3;
      } else if (!inSeg(idx)) opacity = 0.3;

      svg +=
        `<rect x="${x.toFixed(1)}" y="${(baseY - bh).toFixed(1)}" width="${barW.toFixed(1)}" height="${bh.toFixed(1)}" rx="3" ` +
        `style="fill:${fill}" opacity="${opacity}"/>`;
      if (showLabels) {
        svg +=
          `<text x="${cx.toFixed(1)}" y="${(baseY - bh - 5).toFixed(1)}" text-anchor="middle" ` +
          `style="fill:var(--muted);font-family:var(--font-mono);font-size:var(--text-xs)" opacity="${opacity}">${esc(v)}</text>` +
          `<text x="${cx.toFixed(1)}" y="${(baseY + 14).toFixed(1)}" text-anchor="middle" ` +
          `style="fill:var(--faint);font-family:var(--font-mono);font-size:var(--text-xs)">${idx}</text>`;
      }
    });

    // Pointer row: the target rank's sorted position always, q once a pivot
    // is placed.
    const ptr = (idx, label, colour) => {
      if (idx == null || idx < 0 || idx >= n) return;
      const cx = xOf(idx) + barW / 2;
      svg +=
        `<text x="${cx.toFixed(1)}" y="${(baseY + IDX_H + 11).toFixed(1)}" text-anchor="middle" ` +
        `style="fill:${colour};font-family:var(--font-mono);font-size:var(--text-xs)">${label}</text>`;
    };
    if (frame.split && frame.found == null && frame.pivot !== frame.target) ptr(frame.pivot, "q", "var(--accent)");
    ptr(frame.target, "i", frame.found != null ? "var(--green)" : "var(--accent)");

    stage.innerHTML =
      `<svg width="100%" height="100%" viewBox="0 0 ${w.toFixed(0)} ${h.toFixed(0)}" ` +
      `preserveAspectRatio="none" role="img" aria-hidden="true" style="display:block">${svg}</svg>`;
  },
};
