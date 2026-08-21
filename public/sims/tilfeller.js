/**
 * Beste, verste og gjennomsnittlige tilfelle — why «kjøretiden» is not one
 * function of n, and why the choice of case is independent of the choice of
 * asymptotic operator (læringsmål A5 og A6).
 *
 * For every n the sim runs Insertion-Sort on a sample of real random
 * permutations and plots what each one actually costs, as one dot. The cloud of
 * dots IS the point: a size does not determine a cost. The three curves through
 * it are the cheapest instance, the mean, and the dearest one.
 *
 * Cost counted = outer iterations + shifts, i.e. (n-1) + inversions. Counting
 * shifts alone would put the best case at 0 and suggest the algorithm is free on
 * sorted input, when it is Θ(n).
 *
 * The dots are sampled, so the extremes of the cloud sit inside the true best
 * and worst curves. Those two curves are drawn from the exact formulas
 * (n-1 and n-1 + n(n-1)/2), not from the sample.
 *
 * Contract: default-export init(api); host="dom", so api = { stage, controls,
 * getSize, onResize, signal }.
 */

const N_MAX = 26;
const SAMPLES = 24;

const CASES = {
  best: {
    label: "Beste",
    short: "Beste",
    aria: "Beste tilfelle",
    color: "var(--green)",
    f: (n) => n - 1,
  },
  avg: {
    label: "Gjennomsnittlige",
    short: "Snitt",
    aria: "Gjennomsnittlige tilfelle",
    color: "var(--cyan)",
    // A random permutation has n(n-1)/4 inversions on average.
    f: (n) => n - 1 + (n * (n - 1)) / 4,
  },
  worst: {
    label: "Verste",
    short: "Verste",
    aria: "Verste tilfelle",
    color: "var(--red)",
    f: (n) => n - 1 + (n * (n - 1)) / 2,
  },
};

/** Headroom so the drawn O/Θ bound (1.35×) clears the top of the plot. */
const Y_HEADROOM = 1.45;

const BOUNDS = {
  O: { label: "O", aria: "Store O, øvre grense", word: "høyst" },
  Omega: { label: "Ω", aria: "Omega, nedre grense", word: "minst" },
  Theta: { label: "Θ", aria: "Theta, stram grense", word: "nøyaktig" },
};

/** Cost of Insertion-Sort on `a`: outer iterations plus shifts. */
function cost(a) {
  let shifts = 0;
  const b = [...a];
  for (let i = 1; i < b.length; i++) {
    const key = b[i];
    let j = i - 1;
    while (j >= 0 && b[j] > key) {
      b[j + 1] = b[j];
      j -= 1;
      shifts += 1;
    }
    b[j + 1] = key;
  }
  return b.length - 1 + shifts;
}

function sampleCloud() {
  const random = [];
  const extremes = [];
  for (let n = 2; n <= N_MAX; n++) {
    const sorted = Array.from({ length: n }, (_, i) => i);
    // The cheapest and the dearest instance are real instances, and random
    // sampling clusters around the mean and would never reach either curve.
    // They are drawn darker so the spread visibly runs from one curve to the
    // other, and last of all so the case curves do not paint over them.
    extremes.push([n, cost(sorted)], [n, cost([...sorted].reverse())]);
    for (let s = 0; s < SAMPLES; s++) {
      const a = [...sorted];
      for (let i = n - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      random.push([n, cost(a)]);
    }
  }
  return { random, extremes };
}

export default function init({ stage, controls, getSize, onResize, signal }) {
  let caseKey = "worst";
  let boundKey = "Theta";
  const cloud = sampleCloud();

  const btnGroup = (text, entries, current, onPick) => {
    const label = document.createElement("label");
    label.append(text + " ");
    const row = document.createElement("span");
    row.style.display = "flex";
    row.style.gap = "var(--space-2)";
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
          render();
        },
        { signal },
      );
      btns[k] = b;
      row.append(b);
    }
    label.append(row);
    return label;
  };

  const readout = document.createElement("div");
  readout.className = "sim-readout";

  controls.append(
    btnGroup("Tilfelle", CASES, caseKey, (k) => (caseKey = k)),
    btnGroup("Grense", BOUNDS, boundKey, (k) => (boundKey = k)),
    readout,
  );

  function render() {
    const { w, h } = getSize();
    const padL = 44, padR = 74, padT = 14, padB = 28;
    const plotW = Math.max(40, w - padL - padR);
    const plotH = Math.max(40, h - padT - padB);
    const yMax = CASES.worst.f(N_MAX) * Y_HEADROOM;
    const xOf = (n) => padL + (n / N_MAX) * plotW;
    const yOf = (v) => padT + (1 - Math.min(v, yMax) / yMax) * plotH;

    let svg = "";

    svg +=
      `<line x1="${padL}" y1="${padT}" x2="${padL}" y2="${(padT + plotH).toFixed(1)}" stroke="var(--border-strong)" stroke-width="1"/>` +
      `<line x1="${padL}" y1="${(padT + plotH).toFixed(1)}" x2="${(padL + plotW).toFixed(1)}" y2="${(padT + plotH).toFixed(1)}" stroke="var(--border-strong)" stroke-width="1"/>`;
    for (const tick of [5, 10, 15, 20, 25]) {
      svg +=
        `<text x="${xOf(tick).toFixed(1)}" y="${(padT + plotH + 16).toFixed(1)}" text-anchor="middle" ` +
        `style="fill:var(--faint);font-family:var(--font-mono);font-size:var(--text-xs)">${tick}</text>`;
    }
    svg +=
      `<text x="${(padL - 6).toFixed(1)}" y="${(padT + 8).toFixed(1)}" text-anchor="end" ` +
      `style="fill:var(--faint);font-family:var(--font-mono);font-size:var(--text-xs)">kost</text>`;

    const dots = (pts, r, opacity) => {
      let out = "";
      for (const [n, c] of pts) {
        out +=
          `<circle cx="${xOf(n).toFixed(1)}" cy="${yOf(c).toFixed(1)}" r="${r}" ` +
          `fill="var(--fg)" opacity="${opacity}"/>`;
      }
      return out;
    };

    // One dot per sampled instance: the spread of costs at each size.
    svg += dots(cloud.random, 1.6, 0.18);

    const curve = (fn) => {
      const pts = [];
      for (let n = 1; n <= N_MAX; n++) pts.push(`${xOf(n).toFixed(1)},${yOf(fn(n)).toFixed(1)}`);
      return pts.join(" ");
    };

    for (const k of Object.keys(CASES)) {
      const sel = k === caseKey;
      svg +=
        `<polyline points="${curve(CASES[k].f)}" fill="none" stroke="${CASES[k].color}" ` +
        `stroke-width="${sel ? 2.5 : 1.5}" opacity="${sel ? 1 : 0.4}"/>` +
        `<text x="${(padL + plotW + 6).toFixed(1)}" y="${(yOf(CASES[k].f(N_MAX)) + 4).toFixed(1)}" ` +
        `style="fill:${CASES[k].color};font-family:var(--font-mono);font-size:var(--text-xs);opacity:${sel ? 1 : 0.5}">${CASES[k].short}</text>`;
    }

    // The chosen bound, drawn on the chosen case only. Constants are fitted at
    // n = N_MAX so the bound curve touches the case curve at the right edge.
    const cf = CASES[caseKey].f;
    const order = caseKey === "best" ? (n) => n : (n) => n * n;
    const k = cf(N_MAX) / order(N_MAX);
    const drawBound = (mult, dashed) =>
      `<polyline points="${curve((n) => mult * k * order(n))}" fill="none" stroke="var(--accent)" ` +
      `stroke-width="1.5" ${dashed ? 'stroke-dasharray="5 4"' : ""}/>`;
    if (boundKey === "O") svg += drawBound(1.35, true);
    else if (boundKey === "Omega") svg += drawBound(0.65, true);
    else svg += drawBound(1.35, true) + drawBound(0.65, true);

    // Last, so the cheapest and the dearest instance stay visible on top of the
    // curve that describes them.
    svg += dots(cloud.extremes, 2, 0.5);

    stage.innerHTML =
      `<svg width="100%" height="100%" viewBox="0 0 ${w.toFixed(0)} ${h.toFixed(0)}" ` +
      `preserveAspectRatio="none" role="img" aria-hidden="true" style="display:block">${svg}</svg>`;

    const orderTex = caseKey === "best" ? "n" : "n²";
    const b = BOUNDS[boundKey];
    readout.innerHTML =
      `<b>${CASES[caseKey].label.toLowerCase()} tilfelle = ${b.label}(${orderTex})</b>: ` +
      `den ${caseKey === "best" ? "billigste" : caseKey === "worst" ? "dyreste" : "gjennomsnittlige"} ` +
      `instansen av størrelse n koster ${b.word} ${orderTex}, opp til en konstant. ` +
      `Alle ni kombinasjonene er lovlige utsagn.`;
  }

  onResize(render);
  render();
}
