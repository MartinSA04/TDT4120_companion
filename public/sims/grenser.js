/**
 * O, Ω og Θ for TDT4120 modul 01: what the three definitions demand, checked on
 * the worst-case count of Insertion-Sort.
 *
 * One idea: f(n) = O(g(n)) means that from some n₀ on, f(n) lies below c·g(n)
 * for a constant c you may choose; Ω means above c·g(n); Θ means between two
 * such multiples, c₁·g(n) ≤ f(n) ≤ c₂·g(n). The reader picks g, the bound and
 * the constants, drags n₀, and sees whether the condition holds for EVERY
 * integer n ≥ n₀. The verdict also covers the n beyond the plotted range,
 * because that is where the definition is decided.
 *
 * f(n) = (3/2)n² + (7/2)n − 4 is the number of pseudocode lines Insertion-Sort
 * executes on a hand in reverse order: T = 5n − 4 + 3S with S = n(n − 1)/2
 * moves. f(1) = 1, f(2) = 9, f(5) = 51.
 *
 * Exactness. Each constant is a two-significant-digit number (the slider is
 * log-uniform and its value is rounded to what the <output> shows), stored as
 * m thousandths. The condition is compared in integers:
 *   f(n) ≤ c·g(n)  ⇔  1000·(3n² + 7n − 8) ≤ 2·m·g(n),
 * so ties such as f(1) = 1·1 and f(8) = 15·8 come out as «holds». Near a tie
 * both sides are below 2⁵³, so the comparison is exact where it matters.
 *
 * Beyond the plot. f(n) − c·g(n) is a polynomial of degree ≤ 3, and every real
 * root lies below the Cauchy bound 1 + max|aᵢ|/|a_lead|. Past that bound the
 * sign never changes, so scanning the integers from n₀ to just past the bound
 * finds the first failure, or proves there is none. On the slider's range the
 * bound is at most 401 (g = n³, c = 0,01).
 *
 * Drawing. f is the thick solid curve; each bound c·g(n) is a dashed violet
 * curve, clipped where it leaves the top and named at its end. Violet rather
 * than the accent: this course's accent (#c2412a) is nearly the red that marks
 * a failure (#af3029). n₀ is a vertical line, the n ≥ n₀ the definition talks
 * about are tinted, and every integer n ≥ n₀ where the condition fails gets a
 * red dot on f; nothing left of n₀ is judged. The curves are drawn continuous,
 * but only integer n are checked. The y axis has no scale (N = 40 and a fixed
 * Y_MAX), so a failure of one or two lines near the origin (f(3) = 20 against
 * 2·3² = 18) shows only as its dot. The verdict sits above the plot.
 *
 * Numbers the module text uses (all checked with exact rationals):
 *   g = n²: f ≤ 2n² for n = 1 and n ≥ 6 (fails 2..5); f ≥ 1·n² for all n ≥ 1;
 *           f ≥ 1,5n² from n = 2; f ≤ 1,6n² for n = 1 and n ≥ 34; for
 *           c ≤ 1,5 the upper bound fails for every n ≥ 2.
 *   g = n:  f ≤ 20n fails from n = 12, f ≤ 100n from n = 65; f ≥ c·n holds
 *           from some n₀ for every c (c = 20: from n = 12).
 *   g = n³: f ≤ 0,02n³ fails 1..77 and holds from 78; f ≥ 0,05n³ holds 1..32
 *           and fails from 33; f ≥ 0,01n³ fails from 153.
 *
 * Contract: default-export init(api); host="dom", so api = { stage, controls,
 * getSize, onResize, signal }.
 */

/** Right end of the n axis. Wide enough that f ≤ 1,6n² visibly starts to hold (n = 34). */
const N = 40;
/** Fixed y scale, shared by f and every bound, so f keeps its shape while the bounds move. */
const Y_MAX = 2.15 * N * N;

/** 2·f(n), an integer for integer n. */
const twoF = (n) => 3 * n * n + 7 * n - 8;
const f = (n) => twoF(n) / 2;

const G = {
  n: { label: "n", aria: "g(n) = n", deg: 1 },
  n2: { label: "n²", aria: "g(n) = n i andre", deg: 2 },
  n3: { label: "n³", aria: "g(n) = n i tredje", deg: 3 },
};

const BOUNDS = {
  O: { label: "O", aria: "Store O, øvre grense", lower: false, upper: true },
  Omega: { label: "Ω", aria: "Omega, nedre grense", lower: true, upper: false },
  Theta: { label: "Θ", aria: "Theta, øvre og nedre grense", lower: true, upper: true },
};

/** Constant slider: position 0..400, c = 10^(p/100 − 2), so 0,01 … 100. */
const P_MAX = 400;

/** Slider position → the constant in thousandths, rounded to two significant digits. */
function milliOf(p) {
  const x = 10 ** (p / 100 - 2);
  let e = Math.floor(Math.log10(x) + 1e-9);
  let mant = Math.round(x / 10 ** (e - 1));
  if (mant >= 100) {
    mant = 10;
    e += 1;
  }
  return Math.round(mant * 10 ** (e + 2));
}

const posOf = (c) => Math.round(100 * (Math.log10(c) + 2));

/** A constant in thousandths as Norwegian text: 0,05 · 1,6 · 2 · 20 · 100. */
function fmtC(m) {
  const c = m / 1000;
  const dec = m >= 10000 ? 0 : m >= 1000 ? 1 : m >= 100 ? 2 : 3;
  let s = c.toFixed(dec);
  if (s.includes(".")) s = s.replace(/0+$/, "").replace(/\.$/, "");
  return s.replace(".", ",");
}

/** The bound's name as drawn on its curve: «2n²», «0,05n³», «1·n». */
const boundText = (m, g) => (m === 1000 ? `1·${g.label}` : `${fmtC(m)}${g.label}`);

/** Does f(n) ≤ c·g(n) (upper) or f(n) ≥ c·g(n) (lower) hold at integer n? */
function holds(n, deg, m, upper) {
  const lhs = 1000 * twoF(n);
  const rhs = 2 * m * n ** deg;
  return upper ? lhs <= rhs : lhs >= rhs;
}

/** Past this n, f(n) − c·g(n) has no more real roots, so its sign is fixed. */
function rootBound(deg, m) {
  const a = [-4, 3.5, 1.5, 0];
  a[deg] -= m / 1000;
  let k = 3;
  while (k > 0 && Math.abs(a[k]) < 1e-12) k -= 1;
  let r = 0;
  for (let i = 0; i < k; i++) r = Math.max(r, Math.abs(a[i]) / Math.abs(a[k]));
  return Math.ceil(1 + r) + 1;
}

/** First integer n ≥ n₀ where any active condition fails, or null if none ever does. */
function firstFailure(conds, deg, n0) {
  let end = n0;
  for (const c of conds) end = Math.max(end, rootBound(deg, c.m));
  for (let n = n0; n <= end; n++) {
    for (const c of conds) if (!holds(n, deg, c.m, c.upper)) return n;
  }
  return null;
}

export default function init({ stage, controls, getSize, onResize, signal }) {
  let gKey = "n2";
  let boundKey = "Theta";
  let pLow = posOf(1); // c₁ = 1
  let pUp = posOf(2); // c₂ = 2
  let n0 = 1;

  // ── controls ───────────────────────────────────────────────────────────────
  // A button group is a <div role="group">, styled like the framework's slider
  // labels. A <label> around buttons would forward a click on its text to the
  // first button.
  const btnGroup = (text, entries, current, onPick) => {
    const wrap = document.createElement("div");
    wrap.setAttribute("role", "group");
    wrap.setAttribute("aria-label", text);
    wrap.style.cssText =
      "display:flex;flex-direction:column;gap:var(--space-2);font-family:var(--font-mono);" +
      "font-size:var(--text-xs);color:var(--muted)";
    const tag = document.createElement("span");
    tag.textContent = text;
    const row = document.createElement("span");
    row.style.cssText = "display:flex;gap:var(--space-2)";
    const btns = {};
    for (const k of Object.keys(entries)) {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "sim-btn";
      b.textContent = entries[k].label;
      b.setAttribute("aria-label", entries[k].aria);
      b.setAttribute("aria-pressed", String(k === current));
      b.addEventListener(
        "click",
        () => {
          onPick(k);
          for (const j of Object.keys(entries)) btns[j].setAttribute("aria-pressed", String(j === k));
          sync();
          render();
        },
        { signal },
      );
      btns[k] = b;
      row.append(b);
    }
    wrap.append(tag, row);
    return wrap;
  };

  const slider = ({ min, max, value, onInput }) => {
    const label = document.createElement("label");
    const head = document.createElement("span");
    const name = document.createElement("span");
    const out = document.createElement("output");
    head.append(name, " = ", out);
    const input = document.createElement("input");
    input.type = "range";
    input.min = String(min);
    input.max = String(max);
    input.step = "1";
    input.value = String(value);
    label.append(head, input);
    input.addEventListener(
      "input",
      () => {
        onInput(Number(input.value));
        sync();
        render();
      },
      { signal },
    );
    return { el: label, name, out, input };
  };

  const lowS = slider({ min: 0, max: P_MAX, value: pLow, onInput: (p) => (pLow = p) });
  const upS = slider({ min: 0, max: P_MAX, value: pUp, onInput: (p) => (pUp = p) });
  const n0S = slider({ min: 1, max: N, value: n0, onInput: (v) => (n0 = v) });
  n0S.name.textContent = "n₀";
  n0S.input.setAttribute("aria-label", "n₀, der grensen må begynne å holde");

  // The two button groups share one row when there is room (they do at 390 px).
  const groups = document.createElement("div");
  groups.style.cssText = "display:flex;flex-wrap:wrap;gap:var(--space-4) var(--space-6);flex-basis:100%";
  groups.append(
    btnGroup("g(n)", G, gKey, (k) => (gKey = k)),
    btnGroup("Grense", BOUNDS, boundKey, (k) => (boundKey = k)),
  );
  controls.append(groups, lowS.el, upS.el, n0S.el);

  function sync() {
    const b = BOUNDS[boundKey];
    lowS.el.style.display = b.lower ? "" : "none";
    upS.el.style.display = b.upper ? "" : "none";
    const both = b.lower && b.upper;
    lowS.name.textContent = both ? "c₁" : "c";
    upS.name.textContent = both ? "c₂" : "c";
    lowS.input.setAttribute("aria-label", "Konstanten i den nedre grensen");
    upS.input.setAttribute("aria-label", "Konstanten i den øvre grensen");
    lowS.out.textContent = fmtC(milliOf(pLow));
    upS.out.textContent = fmtC(milliOf(pUp));
    n0S.out.textContent = String(n0);
  }

  // ── drawing ────────────────────────────────────────────────────────────────
  const P = (v) => v.toFixed(1);
  const MONO = "font-family:var(--font-mono);font-size:var(--text-xs)";
  const text = (x, y, s, { anchor = "start", color = "var(--muted)", extra = "" } = {}) =>
    `<text x="${P(x)}" y="${P(y)}" text-anchor="${anchor}" ` +
    `style="fill:${color};${MONO};paint-order:stroke;stroke:var(--canvas-bg);stroke-width:3px;stroke-linejoin:round${extra}">${s}</text>`;

  function render() {
    const { w, h } = getSize();
    const g = G[gKey];
    const b = BOUNDS[boundKey];
    const mLow = milliOf(pLow);
    const mUp = milliOf(pUp);

    const padT = 30; // verdict band above the plot
    const padB = 24; // tick labels and n₀
    const padL = 10;
    const padR = 56; // curve names at the right end
    const plotW = Math.max(60, w - padL - padR);
    const plotH = Math.max(60, h - padT - padB);
    const x0 = padL;
    const x1 = padL + plotW;
    const yTop = padT;
    const yAxis = padT + plotH;
    const xOf = (n) => x0 + (n / N) * plotW;
    const yOf = (v) => yAxis - (v / Y_MAX) * plotH;

    const conds = [];
    if (b.lower) conds.push({ m: mLow, upper: false });
    if (b.upper) conds.push({ m: mUp, upper: true });
    const fail = firstFailure(conds, g.deg, n0);

    let svg = "";

    // The region the definition talks about: every n ≥ n₀.
    svg +=
      `<rect x="${P(xOf(n0))}" y="${P(yTop)}" width="${P(x1 - xOf(n0))}" height="${P(plotH)}" ` +
      `fill="color-mix(in srgb, var(--fg) 6%, transparent)"/>`;

    // Axes.
    svg +=
      `<path d="M ${P(x0)} ${P(yTop)} V ${P(yAxis)} H ${P(x1)}" fill="none" stroke="var(--border-strong)" stroke-width="1"/>`;

    // n₀: a vertical line from the axis to the top, named under the axis.
    svg +=
      `<path d="M ${P(xOf(n0))} ${P(yTop)} V ${P(yAxis + 4)}" stroke="var(--fg)" stroke-width="1.5"/>`;
    svg += text(xOf(n0), yAxis + 17, "n₀", { anchor: "middle", color: "var(--fg)" });

    const labelsRight = [];
    const labelsTop = [];
    const curve = (fn, nEnd) => {
      const pts = [];
      for (let n = 1; n < nEnd; n += 0.25) pts.push(`${P(xOf(n))},${P(yOf(fn(n)))}`);
      pts.push(`${P(xOf(nEnd))},${P(yOf(fn(nEnd)))}`);
      return pts.join(" ");
    };

    // f(n), the thing being bounded.
    svg += `<polyline points="${curve(f, N)}" fill="none" stroke="var(--fg)" stroke-width="3" stroke-linejoin="round"/>`;
    labelsRight.push({ y: yOf(f(N)), s: "f(n)", color: "var(--fg)" });

    // Bounds, dashed, clipped where they leave the top of the plot. Drawn over f,
    // so a bound that runs along f (1,6n²) still shows.
    const drawBound = (m, upper) => {
      const c = m / 1000;
      const fn = (n) => c * n ** g.deg;
      const nExit = (Y_MAX / c) ** (1 / g.deg);
      const nEnd = Math.min(N, nExit);
      svg +=
        `<polyline points="${curve(fn, nEnd)}" fill="none" stroke="var(--violet)" ` +
        `stroke-width="2" stroke-dasharray="6 4"/>`;
      const label = boundText(m, g);
      if (nExit >= N) labelsRight.push({ y: yOf(fn(N)), s: label, color: "var(--violet)" });
      // x where this bound has screen height y, for placing its name beside it.
      else labelsTop.push({ xAt: (y) => xOf(((Y_MAX * (yAxis - y)) / plotH / c) ** (1 / g.deg)), s: label, upper });
    };
    if (b.lower) drawBound(mLow, false);
    if (b.upper) drawBound(mUp, true);

    // Every integer n ≥ n₀ where the condition fails: a red dot on f.
    for (let n = n0; n <= N; n++) {
      if (conds.some((c) => !holds(n, g.deg, c.m, c.upper))) {
        svg += `<circle cx="${P(xOf(n))}" cy="${P(yOf(f(n)))}" r="3" fill="var(--red)"/>`;
      }
    }

    // n ticks, dropped where they would collide with the n₀ name.
    for (const t of [10, 20, 30, 40]) {
      if (Math.abs(xOf(t) - xOf(n0)) < 26) continue;
      svg +=
        `<path d="M ${P(xOf(t))} ${P(yAxis)} v 4" stroke="var(--border-strong)" stroke-width="1"/>` +
        text(xOf(t), yAxis + 17, String(t), { anchor: "middle", color: "var(--faint)" });
    }
    svg += text(x1 + 14, yAxis + 17, "n", { color: "var(--muted)" });

    // Names at the right end, pushed apart so they never overlap.
    labelsRight.sort((a, c) => a.y - c.y);
    const GAP = 13;
    for (let i = 0; i < labelsRight.length; i++) {
      labelsRight[i].y = Math.min(yAxis - 2, Math.max(yTop + 8, labelsRight[i].y));
      if (i > 0 && labelsRight[i].y - labelsRight[i - 1].y < GAP) labelsRight[i].y = labelsRight[i - 1].y + GAP;
    }
    for (let i = labelsRight.length - 1; i >= 0; i--) {
      const lim = i === labelsRight.length - 1 ? yAxis - 2 : labelsRight[i + 1].y - GAP;
      if (labelsRight[i].y > lim) labelsRight[i].y = lim;
    }
    for (const l of labelsRight) svg += text(x1 + 6, l.y + 4, l.s, { color: l.color });

    // Names where a bound leaves the top. The upper bound's name goes to its left,
    // which is above it and so above every other curve; the lower bound's name to
    // its right, below it, where the upper bound has already left the plot. Each
    // is placed clear of its own curve over the whole height of the text.
    const charW = 7;
    const placed = [];
    for (const l of labelsTop) {
      const wTxt = l.s.length * charW;
      const y = yTop + 13;
      const xLeft = l.xAt(y + 3) - 5; // right end of the text when it sits left
      const xRight = l.xAt(y - 10) + 5; // left end of the text when it sits right
      let left = l.upper;
      if (left && xLeft - wTxt < x0 + 2) left = false;
      if (!left && xRight + wTxt > x1) left = true;
      const bx = left ? xLeft - wTxt : xRight;
      let yy = y;
      for (const q of placed) if (bx < q.bx + q.w && q.bx < bx + wTxt && Math.abs(yy - q.y) < GAP) yy = q.y + GAP;
      placed.push({ bx, w: wTxt, y: yy });
      svg += text(left ? xLeft : xRight, yy, l.s, { anchor: left ? "end" : "start", color: "var(--violet)" });
    }

    // Verdict, top left, above the plot.
    let verdict;
    if (fail === null) verdict = text(x0, 17, "holder for alle n ≥ n₀", { color: "var(--green)", extra: ";font-size:var(--text-sm);font-weight:600" });
    else
      verdict = text(x0, 17, `brytes ved n = ${fail}${fail > N ? " →" : ""}`, {
        color: "var(--red)",
        extra: ";font-size:var(--text-sm);font-weight:600",
      });
    svg += verdict;

    stage.innerHTML =
      `<svg width="100%" height="100%" viewBox="0 0 ${w.toFixed(0)} ${h.toFixed(0)}" ` +
      `preserveAspectRatio="none" role="img" aria-hidden="true" style="display:block">${svg}</svg>`;
  }

  sync();
  onResize(render);
  render();
}
