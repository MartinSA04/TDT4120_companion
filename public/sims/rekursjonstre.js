/**
 * Rekursjonstreet nivå for nivå — the picture behind the master theorem
 * (læringsmål C6). For T(n) = aT(n/b) + n^k the tree has a^i nodes of size
 * n/b^i on level i, so the level costs n^k · (a/b^k)^i: a geometric series
 * that grows, stays flat or shrinks with the depth. Which of the three happens
 * is exactly the case of the theorem, and the reader picks a, b and k and
 * watches the bars change shape.
 *
 * n is fixed at b^5 so every level is exact (no rounding) and the tree always
 * has six levels, root included.
 *
 * Contract: default-export init(api); host="dom", so api = { stage, controls,
 * getSize, onResize, signal }.
 */

const LEVELS = 6;

const POW = ["1", "n", "n²", "n³"];
const SUP = ["⁰", "¹", "²", "³", "⁴", "⁵", "⁶", "⁷", "⁸", "⁹"];
const sup = (num) => String(num).split("").map((d) => SUP[Number(d)] ?? d).join("");

/** Integers up to six digits as they are; larger ones as 1,2·10⁹. */
function fmtNum(x) {
  if (x < 1e6) return String(Math.round(x));
  const e = Math.floor(Math.log10(x));
  const m = (x / 10 ** e).toFixed(1).replace(".", ",");
  return `${m}·10${sup(e)}`;
}

/** log_b a as a display exponent: an integer, or two decimals. */
function fmtExp(a, b) {
  const v = Math.log(a) / Math.log(b);
  const r = Math.round(v);
  return Math.abs(v - r) < 1e-9 ? String(r) : v.toFixed(2).replace(".", ",");
}

export default function init({ stage, controls, getSize, onResize, signal }) {
  let a = 2;
  let b = 2;
  let k = 1;

  const slider = (text, min, max, value, aria, onInput, show) => {
    const label = document.createElement("label");
    label.append(text + " ");
    const out = document.createElement("output");
    const input = document.createElement("input");
    input.type = "range";
    input.min = String(min);
    input.max = String(max);
    input.step = "1";
    input.value = String(value);
    input.setAttribute("aria-label", aria);
    out.textContent = show(value);
    input.addEventListener(
      "input",
      () => {
        const v = Number(input.value);
        onInput(v);
        out.textContent = show(v);
        render();
      },
      { signal },
    );
    label.append(out, input);
    return label;
  };

  const readout = document.createElement("div");
  readout.className = "sim-readout";

  controls.append(
    slider("Kall a", 1, 8, a, "Antall rekursive kall a", (v) => (a = v), (v) => String(v)),
    slider("Deling b", 2, 4, b, "Instansen deles på b", (v) => (b = v), (v) => String(v)),
    slider("Arbeid f(n)", 0, 3, k, "Arbeid per kall, n opphøyd i k", (v) => (k = v), (v) => POW[v]),
    readout,
  );

  function render() {
    const { w, h } = getSize();
    const n = b ** (LEVELS - 1);
    const costs = [];
    for (let i = 0; i < LEVELS; i++) costs.push(a ** i * (n / b ** i) ** k);
    const maxC = Math.max(...costs);

    const padL = 8;
    const padR = 8;
    const padT = 6;
    const padB = 6;
    const labelW = Math.min(96, Math.max(64, w * 0.2));
    const valueW = 64;
    const barX = padL + labelW;
    const barMaxW = Math.max(20, w - barX - valueW - padR);
    const rowH = (h - padT - padB) / LEVELS;
    const barH = Math.max(8, Math.min(22, rowH * 0.55));

    const ratio = a / b ** k;
    const caseNo = Math.abs(ratio - 1) < 1e-9 ? 2 : ratio > 1 ? 1 : 3;
    const colour = caseNo === 2 ? "var(--accent)" : caseNo === 1 ? "var(--green)" : "var(--orange)";

    let svg = "";
    for (let i = 0; i < LEVELS; i++) {
      const y = padT + i * rowH + (rowH - barH) / 2;
      const bw = (costs[i] / maxC) * barMaxW;
      const count = a ** i;
      const size = n / b ** i;
      // Level label: how many calls, each of what size.
      svg +=
        `<text x="${(barX - 8).toFixed(1)}" y="${(y + barH / 2 + 4).toFixed(1)}" text-anchor="end" ` +
        `style="fill:var(--muted);font-family:var(--font-mono);font-size:var(--text-xs)">${fmtNum(count)} × ${fmtNum(size)}</text>`;
      svg +=
        `<rect x="${barX}" y="${y.toFixed(1)}" width="${Math.max(2, bw).toFixed(1)}" height="${barH}" rx="3" ` +
        `style="fill:${colour}" opacity="${i === 0 || i === LEVELS - 1 ? 1 : 0.75}"/>`;
      svg +=
        `<text x="${(barX + Math.max(2, bw) + 6).toFixed(1)}" y="${(y + barH / 2 + 4).toFixed(1)}" ` +
        `style="fill:var(--fg);font-family:var(--font-mono);font-size:var(--text-xs)">${fmtNum(costs[i])}</text>`;
    }
    // Root and leaves named, so the reader can tell which end dominates (the course says løvnoder, not blad).
    const tag = (i, text) => {
      const y = padT + i * rowH + (rowH - barH) / 2;
      return (
        `<text x="${(barX + 4).toFixed(1)}" y="${(y - 3).toFixed(1)}" ` +
        `style="fill:var(--faint);font-family:var(--font-mono);font-size:var(--text-xs)">${text}</text>`
      );
    };
    svg += tag(0, "rot") + tag(LEVELS - 1, "løvnoder");

    stage.innerHTML =
      `<svg width="100%" height="100%" viewBox="0 0 ${w.toFixed(0)} ${h.toFixed(0)}" ` +
      `preserveAspectRatio="none" role="img" aria-hidden="true" style="display:block">${svg}</svg>`;

    const eq = `T(n) = ${a === 1 ? "" : a}T(n/${b}) + ${POW[k]}`;
    const water = `n<sup>log<sub>${b}</sub> ${a}</sup>`;
    let tail;
    if (caseNo === 1) {
      tail =
        `er tilfelle 1: nivåkostnaden vokser med faktoren ${a}/${b ** k} nedover, ` +
        `så løvnodene dominerer og T(n) = Θ(${water}) = Θ(n${sup(fmtExp(a, b))}).`;
    } else if (caseNo === 2) {
      const ans = k === 0 ? "lg n" : `${POW[k]} lg n`;
      tail = `er tilfelle 2: alle nivåene koster like mye, og det er lg n + 1 av dem, så T(n) = Θ(${ans}).`;
    } else {
      tail =
        `er tilfelle 3: nivåkostnaden krymper med faktoren ${a}/${b ** k} nedover, ` +
        `så rota dominerer og T(n) = Θ(${POW[k]}).`;
    }
    readout.innerHTML = `<b>${eq}</b> ${tail}`;
  }

  onResize(render);
  render();
}
