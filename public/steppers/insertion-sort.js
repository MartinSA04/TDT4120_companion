/**
 * Insertion-Sort trace for <Stepper>, driving the Python block `insertion-sort`
 * in modul 01.
 *
 * Line numbers refer to that <CodeBlock>:
 *    1 def insertion_sort(A, n):
 *    2     for i in range(1, n):
 *    3         key = A[i]
 *    4         # Sett key inn i den sorterte delen A[0 : i]
 *    5         j = i - 1
 *    6         while j >= 0 and A[j] > key:
 *    7             A[j + 1] = A[j]
 *    8             j = j - 1
 *    9         A[j + 1] = key
 *   10     return A
 *
 * Indices are 0-based everywhere — in the trace, in the step captions and under
 * the bars — so what the caption says is what the Python says. The invariant is
 * stated as the slice A[0 : i], which is Python's own notation for it.
 *
 * Colours are framework tokens only, so frames re-theme on the light/dark
 * toggle without the module knowing which theme is active.
 */

/** Shuffle of 1..size, used for the shuffle button. */
function shuffled(size) {
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

export default {
  sizeRange: { min: 5, max: 12, default: 8 },
  defaultData: (size = 8) => shuffled(size),

  run(input) {
    const a = [...input];
    const n = a.length;
    const frames = [];
    /** Indices 0..k-1, i.e. the sorted slice A[0 : k]. */
    const slice = (k) => Array.from({ length: k }, (_, i) => i);

    frames.push({
      line: 1,
      desc: `A har n = ${n} elementer. A[0 : 1] er sortert allerede, siden ett element alltid er det.`,
      data: [...a],
      vars: { n },
      sorted: slice(1),
    });

    for (let i = 1; i < n; i++) {
      const key = a[i];
      let gap = i;

      frames.push({
        line: 2,
        desc: `i = ${i}. Invarianten holder: A[0 : ${i}] er sortert.`,
        data: [...a],
        vars: { i, n },
        sorted: slice(i),
        cursor: i,
      });

      frames.push({
        line: 3,
        desc: `key = A[${i}] = ${key}. Nøkkelen løftes ut, og plassen står ledig.`,
        data: [...a],
        vars: { i, key },
        sorted: slice(i),
        gap,
        lifted: key,
      });

      let j = i - 1;
      frames.push({
        line: 5,
        desc: `j = ${j}. Vi går bakover gjennom den sorterte delen.`,
        data: [...a],
        vars: { i, key, j },
        sorted: slice(i),
        gap,
        lifted: key,
        cursor: j,
      });

      while (j >= 0 && a[j] > key) {
        frames.push({
          line: 6,
          desc: `A[${j}] = ${a[j]} er større enn key = ${key}, så elementet må flyttes.`,
          data: [...a],
          vars: { i, key, j, "A[j]": a[j] },
          sorted: slice(i),
          gap,
          lifted: key,
          cursor: j,
          compare: j,
        });

        a[j + 1] = a[j];
        gap = j;
        frames.push({
          line: 7,
          desc: `A[${j + 1}] = A[${j}] = ${a[j + 1]}. Elementet er skjøvet ett hakk mot høyre, og den ledige plassen er nå ${j}.`,
          data: [...a],
          vars: { i, key, j },
          sorted: slice(i),
          gap,
          lifted: key,
          moved: j + 1,
        });

        j -= 1;
        frames.push({
          line: 8,
          desc:
            j >= 0
              ? `j = ${j}. Vi ser på neste element til venstre.`
              : `j = -1. Vi er forbi starten av tabellen.`,
          data: [...a],
          vars: { i, key, j },
          sorted: slice(i),
          gap,
          lifted: key,
          cursor: j,
        });
      }

      frames.push({
        line: 6,
        desc:
          (j < 0
            ? `j = -1, så vi er forbi starten av tabellen.`
            : `A[${j}] = ${a[j]} er ikke større enn key = ${key}.`) + ` Løkka stopper.`,
        data: [...a],
        vars: { i, key, j },
        sorted: slice(i),
        gap,
        lifted: key,
        cursor: j >= 0 ? j : null,
      });

      a[j + 1] = key;
      frames.push({
        line: 9,
        desc: `A[${j + 1}] = key = ${key}. Nøkkelen er på plass, og A[0 : ${i + 1}] er sortert.`,
        data: [...a],
        vars: { i, key },
        sorted: slice(i + 1),
        placed: j + 1,
      });
    }

    frames.push({
      line: 10,
      desc: `i har passert n - 1 = ${n - 1}. A[0 : ${n}] er hele tabellen, og den er sortert.`,
      data: [...a],
      vars: { n },
      sorted: slice(n),
      done: true,
    });

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

    const LIFT_H = 46; // band above the bars holding the extracted key
    const IDX_H = 20; // index row under the baseline
    const CUR_H = 16; // pointer row under that
    const PAD_X = 16;
    const baseY = h - IDX_H - CUR_H;
    const chartH = Math.max(20, baseY - LIFT_H - 8);
    const gapW = Math.max(3, w * 0.012);
    const barW = Math.max(6, (w - PAD_X * 2 - gapW * (n - 1)) / n);
    const xOf = (i) => PAD_X + i * (barW + gapW);
    const maxV = Math.max(1, ...data);
    // Labels are dropped rather than shrunk below the type ramp when the bars
    // get narrow (WRITING.md §6: framework type tokens only).
    const showLabels = barW >= 18;

    const sorted = new Set(frame.sorted || []);
    let svg = "";

    // Bracket over the sorted slice, the invariant made visible.
    if (sorted.size) {
      const lo = xOf(0) - 3;
      const hi = xOf(sorted.size - 1) + barW + 3;
      const y = LIFT_H - 6;
      svg +=
        `<path d="M ${lo.toFixed(1)} ${(y + 5).toFixed(1)} L ${lo.toFixed(1)} ${y.toFixed(1)} L ${hi.toFixed(1)} ${y.toFixed(1)} L ${hi.toFixed(1)} ${(y + 5).toFixed(1)}" ` +
        `fill="none" stroke="var(--green)" stroke-width="1.5" opacity="0.7"/>`;
    }

    svg +=
      `<line x1="${PAD_X}" y1="${baseY.toFixed(1)}" x2="${(w - PAD_X).toFixed(1)}" y2="${baseY.toFixed(1)}" ` +
      `stroke="var(--border)" stroke-width="1"/>`;

    data.forEach((v, i) => {
      const x = xOf(i);
      const cx = x + barW / 2;
      const bh = (v / maxV) * chartH;

      // The gap is the slot the key was lifted out of: drawn as an outline.
      if (frame.gap === i) {
        svg +=
          `<rect x="${x.toFixed(1)}" y="${(baseY - chartH).toFixed(1)}" width="${barW.toFixed(1)}" height="${chartH.toFixed(1)}" rx="3" ` +
          `fill="none" stroke="var(--accent)" stroke-width="1.5" stroke-dasharray="3 3"/>`;
      } else {
        let fill = "color-mix(in srgb, var(--fg) 16%, transparent)";
        if (frame.done) fill = "var(--green)";
        else if (frame.placed === i) fill = "var(--accent)";
        else if (frame.moved === i) fill = "var(--orange)";
        else if (frame.compare === i) fill = "var(--orange)";
        else if (sorted.has(i)) fill = "var(--green)";
        svg +=
          `<rect x="${x.toFixed(1)}" y="${(baseY - bh).toFixed(1)}" width="${barW.toFixed(1)}" height="${bh.toFixed(1)}" rx="3" ` +
          `style="fill:${fill}"/>`;
        // The value, so the caption's "A[3] = 5 > key" can be read off the
        // picture instead of inferred from the bar heights.
        if (showLabels) {
          svg +=
            `<text x="${cx.toFixed(1)}" y="${(baseY - bh - 5).toFixed(1)}" text-anchor="middle" ` +
            `style="fill:var(--muted);font-family:var(--font-mono);font-size:var(--text-xs)">${esc(v)}</text>`;
        }
      }

      // 0-based index under each bar, matching the Python.
      if (showLabels) {
        svg +=
          `<text x="${cx.toFixed(1)}" y="${(baseY + 14).toFixed(1)}" text-anchor="middle" ` +
          `style="fill:var(--faint);font-family:var(--font-mono);font-size:var(--text-xs)">${i}</text>`;
      }
    });

    // The lifted key, floating over the slot it came from.
    if (frame.lifted != null && frame.gap != null) {
      const cx = xOf(frame.gap) + barW / 2;
      const boxW = Math.max(barW, 24);
      svg +=
        `<rect x="${(cx - boxW / 2).toFixed(1)}" y="6" width="${boxW.toFixed(1)}" height="24" rx="4" ` +
        `fill="var(--accent-weak)" stroke="var(--accent)" stroke-width="1.5"/>` +
        `<text x="${cx.toFixed(1)}" y="22" text-anchor="middle" ` +
        `style="fill:var(--accent-ink);font-family:var(--font-mono);font-weight:600;font-size:var(--text-xs)">${esc(frame.lifted)}</text>`;
    }

    // j-pointer under the index row.
    if (frame.cursor != null && frame.cursor >= 0 && frame.cursor < n) {
      const cx = xOf(frame.cursor) + barW / 2;
      svg +=
        `<text x="${cx.toFixed(1)}" y="${(baseY + IDX_H + 11).toFixed(1)}" text-anchor="middle" ` +
        `style="fill:var(--accent);font-family:var(--font-mono);font-size:var(--text-xs)">▲</text>`;
    }

    stage.innerHTML =
      `<svg width="100%" height="100%" viewBox="0 0 ${w.toFixed(0)} ${h.toFixed(0)}" ` +
      `preserveAspectRatio="none" role="img" aria-hidden="true" style="display:block">${svg}</svg>`;
  },
};
