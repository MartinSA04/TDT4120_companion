/**
 * Greedy-Activity-Selector trace for <Stepper>, driving the Python block
 * `aktivitetsutvalg` in modul 07. The stage has one row per activity, sorted
 * by finish time as the procedure assumes, with each activity drawn as a bar
 * from s to f on a time axis. The dashed line is f[k], the finish time of the
 * activity chosen last: a candidate that starts at or after it is chosen
 * (green), one that starts before it overlaps and is skipped (muted).
 *
 * Line numbers refer to that <CodeBlock>:
 *    1 def recursive_activity_selector(s, f, k, n):
 *    2     m = k + 1
 *    3     while m <= n and s[m] < f[k]:
 *    4         m = m + 1
 *    5     if m <= n:
 *    6         return [m] + recursive_activity_selector(s, f, m, n)
 *    7     return []
 *    8
 *    9 def greedy_activity_selector(s, f, n):
 *   10     A = [1]
 *   11     k = 1
 *   12     for m in range(2, n + 1):
 *   13         if s[m] >= f[k]:
 *   14             A.append(m)
 *   15             k = m
 *   16     return A
 *
 * Activities are numbered from 1, as in the book; the Python lists keep the
 * fictitious a0 with f[0] = 0 at index 0, so the indices agree.
 *
 * Colours are framework tokens only, so frames re-theme on the light/dark
 * toggle without the module knowing which theme is active.
 */

// The book's eleven activities (figure 15.1), already sorted by finish time.
const FIRST = {
  s: [1, 3, 0, 5, 3, 5, 6, 7, 8, 2, 12],
  f: [4, 5, 6, 7, 9, 9, 10, 11, 12, 14, 16],
};

let calls = 0;

function sample(size) {
  const acts = Array.from({ length: size }, () => {
    const s = Math.floor(Math.random() * 13);
    return { s, f: s + 2 + Math.floor(Math.random() * 5) };
  });
  acts.sort((a, b) => a.f - b.f || a.s - b.s);
  return { s: acts.map((a) => a.s), f: acts.map((a) => a.f) };
}

const STYLE = {
  todo: { fill: "none", stroke: "var(--border)", dash: true },
  cur: { fill: "var(--accent-weak)", stroke: "var(--accent)", wdt: 2 },
  chosen: { fill: "color-mix(in srgb, var(--green) 30%, transparent)", stroke: "var(--green)", wdt: 1.6 },
  skipped: { fill: "none", stroke: "var(--faint)", wdt: 1 },
};

const FONT = "font-family:var(--font-mono);font-size:var(--text-xs)";

export default {
  sizeRange: { min: 5, max: 11, default: 11 },
  // The first set is the book's example; after that, random activities.
  defaultData(size = 11) {
    if (calls++ === 0 && size === FIRST.s.length) return FIRST;
    return sample(size);
  },

  run(input) {
    // 1-based, with the fictitious a0 (f[0] = 0) at index 0 as in the Python.
    const s = [null, ...input.s];
    const f = [0, ...input.f];
    const n = input.s.length;
    const frames = [];
    const state = Array(n + 1).fill("todo");
    let k = 1;
    const A = [1];
    const snap = (line, desc, vars, extra = {}) =>
      frames.push({ line, desc, vars, s, f, n, state: [...state], k, ...extra });

    state[1] = "chosen";
    snap(
      [10, 11],
      `Aktivitetene er sortert etter sluttid. a1 slutter først og tas med. k = 1, og f[k] = ${f[1]} er den stiplede linjen.`,
      { k, "f[k]": f[1] },
    );

    for (let m = 2; m <= n; m++) {
      if (s[m] >= f[k]) {
        state[m] = "chosen";
        A.push(m);
        const prev = k;
        k = m;
        snap(
          [12, 13, 14, 15],
          `s[${m}] = ${s[m]} ≥ f[${prev}] = ${f[prev]}: a${m} overlapper ikke a${prev}, og tas med. k = ${m}.`,
          { m, k, "s[m]": s[m], "f[k]": f[k] },
          { cur: m },
        );
      } else {
        state[m] = "skipped";
        snap(
          [12, 13],
          `s[${m}] = ${s[m]} < f[${k}] = ${f[k]}: a${m} starter før a${k} slutter, og hoppes over.`,
          { m, k, "s[m]": s[m], "f[k]": f[k] },
          { cur: m },
        );
      }
    }

    snap(
      16,
      `A = {${A.map((i) => `a${i}`).join(", ")}}, ${A.length} aktiviteter. Hver aktivitet ble sett på én gang, så løkka tar Θ(n) tid.`,
      { "len(A)": A.length },
      { k: null },
    );
    return frames;
  },

  render(stage, frame, api) {
    const { w, h } = api.getSize();
    const { n, s, f, state } = frame;
    if (!n || w <= 0 || h <= 0) {
      stage.innerHTML = "";
      return;
    }

    const LABEL_W = 30;
    const PAD_R = 10;
    const TOP = 16;
    const AXIS = 24;
    const T = Math.max(...f.slice(1));
    const plotW = w - LABEL_W - PAD_R;
    const x = (t) => LABEL_W + (t / T) * plotW;
    const rowH = (h - TOP - AXIS) / n;
    const barH = Math.max(8, Math.min(14, rowH - 6));
    const yMid = (i) => TOP + (i - 0.5) * rowH;

    let svg = "";

    // Time axis with ticks at least ~28 px apart.
    const axisY = h - AXIS + 4;
    const step = Math.max(1, Math.ceil(T / Math.max(1, Math.floor(plotW / 28))));
    svg += `<line x1="${x(0)}" y1="${axisY}" x2="${x(T)}" y2="${axisY}" style="stroke:var(--border)" stroke-width="1"/>`;
    for (let t = 0; t <= T; t += step) {
      svg += `<line x1="${x(t).toFixed(1)}" y1="${axisY}" x2="${x(t).toFixed(1)}" y2="${axisY + 4}" style="stroke:var(--border)" stroke-width="1"/>`;
      svg +=
        `<text x="${x(t).toFixed(1)}" y="${axisY + 16}" text-anchor="middle" ` +
        `style="fill:var(--muted);${FONT}">${t}</text>`;
    }

    // f[k]: the finish time a candidate has to start at or after.
    if (frame.k != null) {
      const fx = x(f[frame.k]);
      svg +=
        `<line x1="${fx.toFixed(1)}" y1="${TOP - 4}" x2="${fx.toFixed(1)}" y2="${axisY}" ` +
        `style="stroke:var(--accent)" stroke-width="1.4" stroke-dasharray="4 3"/>`;
      const anchor = fx > w - 40 ? "end" : "middle";
      svg +=
        `<text x="${fx.toFixed(1)}" y="${TOP - 6}" text-anchor="${anchor}" ` +
        `style="fill:var(--accent);${FONT};font-weight:600">f[k]</text>`;
    }

    for (let i = 1; i <= n; i++) {
      const st = frame.cur === i ? STYLE.cur : STYLE[state[i]];
      const y = yMid(i);
      svg +=
        `<text x="${LABEL_W - 6}" y="${(y + 4).toFixed(1)}" text-anchor="end" ` +
        `style="fill:${state[i] === "skipped" && frame.cur !== i ? "var(--faint)" : "var(--muted)"};${FONT}">a${i}</text>`;
      svg +=
        `<rect x="${x(s[i]).toFixed(1)}" y="${(y - barH / 2).toFixed(1)}" width="${(x(f[i]) - x(s[i])).toFixed(1)}" ` +
        `height="${barH.toFixed(1)}" rx="3" style="fill:${st.fill};stroke:${st.stroke}" stroke-width="${st.wdt ?? 1.2}"` +
        `${st.dash ? ' stroke-dasharray="3 3"' : ""}/>`;
    }

    stage.innerHTML =
      `<svg width="100%" height="100%" viewBox="0 0 ${w.toFixed(0)} ${h.toFixed(0)}" ` +
      `preserveAspectRatio="none" role="img" aria-hidden="true" style="display:block">${svg}</svg>`;
  },
};
