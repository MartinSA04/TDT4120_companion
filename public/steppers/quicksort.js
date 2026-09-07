/**
 * Quicksort trace for <Stepper>, driving the Python block `partition` in
 * modul 03. The whole sort: every recursive call partitions its own segment,
 * each pivot stays where Partition put it, and the trace ends with the array
 * sorted.
 *
 * Line numbers refer to that <CodeBlock>:
 *    1 def partition(A, p, r):
 *    2     x = A[r]
 *    3     i = p - 1
 *    4     for j in range(p, r):
 *    5         if A[j] <= x:
 *    6             i = i + 1
 *    7             A[i], A[j] = A[j], A[i]
 *    8     A[i + 1], A[r] = A[r], A[i + 1]
 *    9     return i + 1
 *   10
 *   11 def quicksort(A, p, r):
 *   12     if p < r:
 *   13         q = partition(A, p, r)
 *   14         quicksort(A, p, q - 1)
 *   15         quicksort(A, q + 1, r)
 *
 * The segment being partitioned is shaded, and inside it the three zones of
 * the loop invariant are the colours: A[p .. i] small (green), A[i+1 .. j-1]
 * large (orange), A[j .. r-1] not seen yet (grey), the pivot A[r] in the accent
 * colour. Outside the segment, accent bars are elements that have reached
 * their final place (placed pivots and one-element segments) and faint bars
 * are segments still waiting for their call. Indices are 0-based, as in the
 * Python. Empty segments get no frame of their own; the caller's step text
 * says the side is empty.
 *
 * Colours are framework tokens only, so frames re-theme on the light/dark
 * toggle without the module knowing which theme is active.
 */

/**
 * Shuffle of 1..size. The first pivot is the last element, and a pivot that
 * happens to be the smallest or largest value leaves one zone empty through
 * the whole first partition, so such a draw swaps a middling value into the
 * last place. Every other permutation is left as drawn.
 */
function shuffled(size) {
  const a = Array.from({ length: size }, (_, i) => i + 1);
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  const last = a.length - 1;
  if (a[last] === 1 || a[last] === a.length) {
    const mid = a.indexOf(Math.ceil(a.length / 2));
    [a[last], a[mid]] = [a[mid], a[last]];
  }
  return a;
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
    const frames = [];
    const settled = new Set();
    const snap = (line, desc, vars, extra = {}) =>
      frames.push({ line, desc, vars, data: [...a], settled: [...settled], ...extra });

    const partition = (p, r) => {
      const x = a[r];
      snap(2, `x = A[${r}] = ${x} er pivoten for ${seg(p, r)}. Alt som er mindre enn eller lik ${x}, skal til venstre.`, { p, r, x }, {
        seg: [p, r],
        x,
        i: p - 1,
        j: null,
        pivot: r,
      });
      let i = p - 1;
      snap(3, `i = ${i}. Sonen med små elementer er tom ennå.`, { p, r, x, i }, { seg: [p, r], x, i, j: null, pivot: r });

      for (let j = p; j < r; j++) {
        if (a[j] <= x) {
          i += 1;
          const swapped = i !== j;
          [a[i], a[j]] = [a[j], a[i]];
          snap(
            [5, 6, 7],
            swapped
              ? `A[${j}] = ${a[i]} ≤ x, så i blir ${i}, og A[${i}] bytter plass med A[${j}]. Det første store elementet, ${a[j]}, skyves til høyre.`
              : `A[${j}] = ${a[i]} ≤ x, så i blir ${i}. Ingen store elementer står i veien, så byttet er med seg selv.`,
            { p, r, x, i, j },
            { seg: [p, r], x, i, j: j + 1, pivot: r, swap: swapped ? [i, j] : null },
          );
        } else {
          snap(
            5,
            `A[${j}] = ${a[j]} > x, så elementet blir stående. Sonen med store elementer vokser.`,
            { p, r, x, i, j },
            { seg: [p, r], x, i, j: j + 1, pivot: r },
          );
        }
      }

      [a[i + 1], a[r]] = [a[r], a[i + 1]];
      settled.add(i + 1);
      snap(
        8,
        `A[${i + 1}] og A[${r}] bytter plass. Pivoten ${x} står mellom de små og de store, på sin endelige plass.`,
        { p, r, x, i },
        { seg: [p, r], x, i, j: r, pivot: i + 1, swap: [i + 1, r], split: true },
      );
      return i + 1;
    };

    const quicksort = (p, r, line) => {
      if (p > r) return;
      if (p === r) {
        settled.add(p);
        snap(12, `quicksort(A, ${p}, ${r}): ett element, allerede på plass.`, { p, r }, { seg: [p, r] });
        return;
      }
      snap(line, `quicksort(A, ${p}, ${r}) deler ${seg(p, r)} med Partition.`, { p, r }, { seg: [p, r] });
      const q = partition(p, r);
      const left = q - 1 >= p ? seg(p, q - 1) : "ingenting til venstre";
      const right = q + 1 <= r ? seg(q + 1, r) : "ingenting til høyre";
      snap(
        9,
        `Partition returnerer q = ${q}. Igjen står ${left} og ${right}, som sorteres hver for seg.`,
        { p, r, q },
        { seg: [p, r], x: a[q], i: q - 1, j: r, pivot: q, split: true },
      );
      quicksort(p, q - 1, 14);
      quicksort(q + 1, r, 15);
    };

    quicksort(0, n - 1, 11);
    snap(
      11,
      `Alle segmentene er ferdige. Hvert element er enten en pivot som ble satt på plass, eller et segment med ett element. Tabellen er sortert.`,
      { n },
      { done: true },
    );
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

    const [sp, sr] = frame.seg ?? [-1, -1];
    const inSeg = (idx) => idx >= sp && idx <= sr;
    const settled = new Set(frame.settled || []);
    const swap = new Set(frame.swap || []);

    let svg = "";

    // The segment this call works on, shaded from the top down to the baseline.
    if (sp >= 0 && !frame.done) {
      const x0 = xOf(sp) - gapW / 2;
      const x1 = xOf(sr) + barW + gapW / 2;
      svg +=
        `<rect x="${x0.toFixed(1)}" y="${(TOP - 8).toFixed(1)}" width="${(x1 - x0).toFixed(1)}" height="${(baseY - TOP + 8 + IDX_H).toFixed(1)}" rx="5" ` +
        `style="fill:color-mix(in srgb, var(--fg) 5%, transparent)"/>`;
    }

    svg +=
      `<line x1="${PAD_X}" y1="${baseY.toFixed(1)}" x2="${(w - PAD_X).toFixed(1)}" y2="${baseY.toFixed(1)}" ` +
      `stroke="var(--border)" stroke-width="1"/>`;

    // The pivot height across the segment: everything under the line is small.
    if (frame.x != null && sp >= 0) {
      svg +=
        `<line x1="${xOf(sp).toFixed(1)}" y1="${yOf(frame.x).toFixed(1)}" x2="${(xOf(sr) + barW).toFixed(1)}" y2="${yOf(frame.x).toFixed(1)}" ` +
        `stroke="var(--accent)" stroke-width="1.2" stroke-dasharray="4 4" opacity="0.8"/>`;
    }

    data.forEach((v, idx) => {
      const x = xOf(idx);
      const cx = x + barW / 2;
      const bh = (v / maxV) * chartH;

      let fill = "color-mix(in srgb, var(--fg) 16%, transparent)";
      let opacity = 1;
      if (frame.done) fill = "var(--green)";
      else if (settled.has(idx)) fill = "var(--accent)";
      else if (!inSeg(idx)) opacity = 0.45;
      else if (frame.x == null) fill = "color-mix(in srgb, var(--fg) 16%, transparent)";
      else if (idx === frame.pivot) fill = "var(--accent)";
      else if (frame.split) fill = idx < frame.pivot ? "var(--green)" : "var(--orange)";
      else if (idx <= frame.i) fill = "var(--green)";
      else if (frame.j != null && idx < frame.j) fill = "var(--orange)";

      svg +=
        `<rect x="${x.toFixed(1)}" y="${(baseY - bh).toFixed(1)}" width="${barW.toFixed(1)}" height="${bh.toFixed(1)}" rx="3" ` +
        `style="fill:${fill}" opacity="${opacity}"${swap.has(idx) ? ' stroke="var(--fg)" stroke-width="1.5"' : ""}/>`;
      if (showLabels) {
        svg +=
          `<text x="${cx.toFixed(1)}" y="${(baseY - bh - 5).toFixed(1)}" text-anchor="middle" ` +
          `style="fill:var(--muted);font-family:var(--font-mono);font-size:var(--text-xs)" opacity="${opacity}">${esc(v)}</text>` +
          `<text x="${cx.toFixed(1)}" y="${(baseY + 14).toFixed(1)}" text-anchor="middle" ` +
          `style="fill:var(--faint);font-family:var(--font-mono);font-size:var(--text-xs)">${idx}</text>`;
      }
    });

    // Pointer row: i (last small) and j (next to look at) while partitioning,
    // q once the pivot is placed.
    const ptr = (idx, label, colour) => {
      if (idx == null || idx < 0 || idx >= n) return;
      const cx = xOf(idx) + barW / 2;
      svg +=
        `<text x="${cx.toFixed(1)}" y="${(baseY + IDX_H + 11).toFixed(1)}" text-anchor="middle" ` +
        `style="fill:${colour};font-family:var(--font-mono);font-size:var(--text-xs)">${label}</text>`;
    };
    if (frame.x != null && !frame.done) {
      if (frame.split) ptr(frame.pivot, "q", "var(--accent)");
      else {
        if (frame.i != null && frame.i >= sp) ptr(frame.i, "i", "var(--green)");
        if (frame.j != null && frame.j < sr) ptr(frame.j, "j", "var(--orange)");
      }
    }

    stage.innerHTML =
      `<svg width="100%" height="100%" viewBox="0 0 ${w.toFixed(0)} ${h.toFixed(0)}" ` +
      `preserveAspectRatio="none" role="img" aria-hidden="true" style="display:block">${svg}</svg>`;
  },
};
