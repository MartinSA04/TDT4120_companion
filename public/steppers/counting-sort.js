/**
 * Counting-Sort trace for <Stepper>, driving the Python block `counting-sort`
 * in modul 04. Three rows on the stage: the input A, the counts C, and the
 * output B, filled from the back of A so equal values keep their order.
 *
 * Line numbers refer to that <CodeBlock>:
 *    1 def counting_sort(A, n, k):
 *    2     B = [None] * n
 *    3     C = [0] * (k + 1)
 *    4     for j in range(n):
 *    5         C[A[j]] = C[A[j]] + 1
 *    6     for i in range(1, k + 1):
 *    7         C[i] = C[i] + C[i - 1]
 *    8     for j in range(n - 1, -1, -1):
 *    9         C[A[j]] = C[A[j]] - 1
 *   10         B[C[A[j]]] = A[j]
 *   11     return B
 *
 * Equal values are told apart by prime marks in order of appearance in A
 * (2, 2′, 2″), the lecturer's own notation, so stability can be read off B.
 * Values are integers in 0 .. K with K fixed at 5; indices are 0-based, as in
 * the Python.
 *
 * Colours are framework tokens only, so frames re-theme on the light/dark
 * toggle without the module knowing which theme is active.
 */

const K = 5;
const MARKS = ["", "′", "″", "‴", "⁗"];

/** Random values in 0..K, with at least one repeated value. */
function sample(size) {
  const a = Array.from({ length: size }, () => Math.floor(Math.random() * (K + 1)));
  if (new Set(a).size === a.length) a[a.length - 1] = a[0];
  return a;
}

const esc = (v) =>
  String(v).replace(
    /[&<>"]/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c],
  );

export default {
  sizeRange: { min: 5, max: 12, default: 8 },
  defaultData: (size = 8) => sample(size),

  run(input) {
    const A = [...input];
    const n = A.length;
    const seen = Array(K + 1).fill(0);
    const tags = A.map((v) => {
      const t = `${v}${MARKS[Math.min(seen[v], MARKS.length - 1)]}`;
      seen[v] += 1;
      return t;
    });
    const C = Array(K + 1).fill(0);
    const B = Array(n).fill(null);
    const frames = [];
    const snap = (line, desc, vars, extra = {}) =>
      frames.push({ line, desc, vars, A: [...A], tags, C: [...C], B: [...B], n, k: K, ...extra });

    const dupes = [...new Set(A.filter((v) => seen[v] > 1))].sort((x, y) => x - y);
    const dupeText = dupes
      .slice(0, 2)
      .map((v) => tags.filter((t) => t.startsWith(String(v)) && (t.length === String(v).length || !/\d/.test(t[String(v).length]))).join(", "))
      .join(" og ");

    snap(
      1,
      `counting_sort(A, ${n}, ${K}): verdiene er heltall i 0 .. ${K}. Like verdier har merker (${dupeText}) så rekkefølgen kan følges.`,
      { n, k: K },
    );
    snap([2, 3], `B er tom, og C[0 .. ${K}] skal telle forekomster av hver verdi. Alt er 0.`, { n, k: K });

    for (let j = 0; j < n; j++) {
      const v = A[j];
      C[v] += 1;
      snap(5, `A[${j}] = ${v}: C[${v}] blir ${C[v]}.`, { j, "A[j]": v }, { hiA: j, hiC: [v] });
    }

    for (let i = 1; i <= K; i++) {
      C[i] += C[i - 1];
      snap(
        7,
        `C[${i}] = C[${i}] + C[${i - 1}] = ${C[i]}: antall elementer som er mindre enn eller lik ${i}.` +
          (i === K ? ` Nå er C kumulativ.` : ""),
        { i, "C[i]": C[i] },
        { hiC: [i - 1, i] },
      );
    }

    for (let j = n - 1; j >= 0; j--) {
      const v = A[j];
      C[v] -= 1;
      B[C[v]] = tags[j];
      const right = C[v] + 1 < n && B[C[v] + 1] != null && A.some((_, idx) => tags[idx] === B[C[v] + 1] && A[idx] === v) ? B[C[v] + 1] : null;
      snap(
        [9, 10],
        (j === n - 1 ? `Baklengs gjennom A. ` : "") +
          `A[${j}] = ${v}: C[${v}] blir ${C[v]}, og B[${C[v]}] = ${tags[j]}.` +
          (right ? ` Den havner rett til venstre for ${right}, som sto lenger bak i A.` : ""),
        { j, "A[j]": v, "C[A[j]]": C[v] },
        { hiA: j, hiC: [v], hiB: C[v] },
      );
    }

    snap(11, `B er sortert, og like verdier står i samme rekkefølge som i A: ${dupeText}.`, { n }, { done: true });
    return frames;
  },

  render(stage, frame, api) {
    const { w, h } = api.getSize();
    const n = frame.n;
    if (!n || w <= 0 || h <= 0) {
      stage.innerHTML = "";
      return;
    }

    const LABEL_W = 26;
    const PAD_R = 10;
    const cols = Math.max(n, frame.k + 1);
    const rowH = h / 3;
    const cellH = Math.min(30, Math.max(18, rowH - 22));
    const cellW = (w - LABEL_W - PAD_R) / cols;
    const showText = cellW >= 18;

    let svg = "";
    const cell = (x, y, wd, text, st) => {
      svg +=
        `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${wd.toFixed(1)}" height="${cellH}" rx="4" ` +
        `style="fill:${st.fill};stroke:${st.stroke}" stroke-width="${st.wdt ?? 1.2}"${st.dash ? ' stroke-dasharray="3 3"' : ""}/>`;
      if (text != null && showText) {
        svg +=
          `<text x="${(x + wd / 2).toFixed(1)}" y="${(y + cellH / 2 + 4).toFixed(1)}" text-anchor="middle" ` +
          `style="fill:${st.text};font-family:var(--font-mono);font-size:var(--text-xs)">${esc(text)}</text>`;
      }
    };
    const STYLE = {
      plain: { fill: "none", stroke: "var(--border)", text: "var(--fg)" },
      empty: { fill: "none", stroke: "var(--border)", text: "var(--faint)", dash: true },
      hot: { fill: "color-mix(in srgb, var(--orange) 18%, transparent)", stroke: "var(--orange)", text: "var(--fg)", wdt: 2 },
      count: { fill: "var(--accent-weak)", stroke: "var(--accent)", text: "var(--accent-ink)", wdt: 2 },
      filled: { fill: "color-mix(in srgb, var(--green) 14%, transparent)", stroke: "var(--green)", text: "var(--fg)" },
      written: { fill: "var(--accent-weak)", stroke: "var(--accent)", text: "var(--accent-ink)", wdt: 2.2 },
      done: { fill: "color-mix(in srgb, var(--green) 14%, transparent)", stroke: "var(--green)", text: "var(--fg)" },
    };

    const row = (rowIdx, label, cells, styleOf) => {
      const y = rowIdx * rowH + (rowH - cellH) / 2 - 4;
      svg +=
        `<text x="${(LABEL_W - 10).toFixed(1)}" y="${(y + cellH / 2 + 4).toFixed(1)}" text-anchor="end" ` +
        `style="fill:var(--muted);font-family:var(--font-mono);font-size:var(--text-xs);font-weight:600">${label}</text>`;
      cells.forEach((text, idx) => {
        const x = LABEL_W + idx * cellW + 1;
        cell(x, y, cellW - 2, text, styleOf(idx, text));
        if (showText) {
          svg +=
            `<text x="${(x + (cellW - 2) / 2).toFixed(1)}" y="${(y + cellH + 12).toFixed(1)}" text-anchor="middle" ` +
            `style="fill:var(--faint);font-family:var(--font-mono);font-size:var(--text-xs)">${idx}</text>`;
        }
      });
    };

    const hiC = new Set(frame.hiC || []);
    row(0, "A", frame.tags, (idx) => (frame.hiA === idx ? STYLE.hot : STYLE.plain));
    row(1, "C", frame.C.map(String), (idx) => (hiC.has(idx) ? STYLE.count : STYLE.plain));
    row(2, "B", frame.B, (idx, text) => {
      if (frame.done) return STYLE.done;
      if (frame.hiB === idx) return STYLE.written;
      return text == null ? STYLE.empty : STYLE.filled;
    });

    stage.innerHTML =
      `<svg width="100%" height="100%" viewBox="0 0 ${w.toFixed(0)} ${h.toFixed(0)}" ` +
      `preserveAspectRatio="none" role="img" aria-hidden="true" style="display:block">${svg}</svg>`;
  },
};
