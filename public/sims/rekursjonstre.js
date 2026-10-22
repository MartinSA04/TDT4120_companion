/**
 * Rekursjonstreet for TDT4120 modul 04 «Splitt og hersk»: where the work of
 * T(n) = aT(n/b) + f(n) sits in the recursion tree, and why the master
 * theorem compares f(n) with n^(log_b a).
 *
 * One idea: level i of the tree has a^i calls on instances of size n/b^i, and
 * each call does f(n/b^i) work outside its recursive calls, so level i costs
 * a^i · f(n/b^i). With f(n) = n^d, that is n^d · (a/b^d)^i: a geometric series
 * that grows toward the leaves (a/b^d > 1), stays level (a/b^d = 1) or shrinks
 * toward the root (a/b^d < 1). The leaf row has a^L = n^(log_b a) leaves.
 *
 * Drawing: an icicle diagram. Row i spans the full width and is split into
 * a^i equal boxes, so the children of a box lie directly under it. Row height
 * is proportional to the level's cost, and the rows together fill the
 * drawing's height (normalised by T(n)), so a box's area is the work of that
 * one call and the whole area is T(n). Levels 0..L with L = 5 and n = b^L
 * (32, 243 or 1024). A leaf (level L, size 1) is a base case and costs 1, so
 * the leaf row costs a^L. Internal levels cost a^i · f(n/b^i) with
 * f(m) = m^d · lg^k m; at level L − 1 the size is b ≥ 2, so lg m ≥ 1 and no
 * internal row is ever empty.
 *
 * Marks (tokens only; neutral like the plain card of innsetting-rekursiv.js,
 * a little stronger so the area still reads in the dark theme):
 *  - a box: fill fg 13 %, outline fg 38 % (one call; its area is its work).
 *    The borders between boxes are 1 px down to 8 px wide boxes, then the
 *    thinnest crisp line (one device pixel at 2×), so a row of many narrow
 *    boxes reads as a fine comb. Every edge is snapped to the device-pixel
 *    grid, so the comb is even;
 *  - a row whose boxes would be narrower than MIN_BOX: one even, denser fill
 *    (fg 22 %, about what the borders would add up to) with the row's
 *    outline and no inner borders (no moiré); its label gives the count;
 *  - a row thinner than THIN: a solid hairline in the outline ink, at least
 *    MIN_ROW tall, so every level stays countable when the leaves or the root
 *    dominate. Rows are GAP apart, so two hairlines never merge.
 * No accent, orange or green: nothing here is a step, a comparison or a final
 * place.
 *
 * Labels in the drawing: the recurrence the controls define («T(n) =
 * 2T(n/2) + n»; a = 1 drops the coefficient; f written with Unicode: 1, √n,
 * n, n√n, n², n³, times lg n or lg² n), «rota, n = 32» above the top row,
 * «løvnoder» under the bottom row, and on every row tall enough to hold it
 * how many calls and what each costs: «4 × f(8)» (four calls, each doing
 * f(8)), the leaf row «32 × T(1)». A row too thin for its label drops it.
 * No verdict text: the reader reads the case off the shape.
 *
 * Level costs the module text uses, root first (checked against `levels`):
 *  - Merge-Sort (2, 2, 1, 0), n = 32: 32 on all six rows, T = 192.
 *  - Binærsøk (1, 2, 0, 0): 1 on all six rows (one box each), T = 6.
 *  - 4T(n/2) + n: 32, 64, 128, 256, 512, leaves 1024 (half the area).
 *  - 2T(n/2) + n²: 1024, 512, 256, 128, 64, leaves 32 (the root half).
 *  - 4T(n/2) + n²: 1024 on all six rows, T = 6144.
 *  - 2T(n/4) + √n lg² n, n = 1024: 3200, 2048, 1152, 512, 128, leaves 32
 *    (32 · 4(5 − i)²: shrinking toward the leaves, not geometrically).
 *  - 8T(n/2) + n²: 1024, 2048, 4096, 8192, 16 384, leaves 32 768 (half).
 *  - 8T(n/2) + 1: 1, 8, 64, 512, 4096, leaves 32 768 (87,5 %).
 *  - T(n/2) + n³: 32 768, 4096, 512, 64, 8, leaf 1 (the root 87,5 %).
 *
 * Deterministic: no randomness anywhere. Default a = 2, b = 2, d = 1, k = 0.
 *
 * Contract: default-export init(api); host="dom", so api = { stage, controls,
 * getSize, onResize, signal }.
 */

/** Levels below the root; n = b^L. */
const L = 5;
const A_MIN = 1;
const A_MAX = 8;
const A_DEFAULT = 2;
const B_VALUES = [2, 3, 4];
const B_DEFAULT = 2;
/** d for f(n) = n^d · lg^k n, with its slider text and aria text. */
const D_VALUES = [
  { v: 0, label: "0", aria: "0" },
  { v: 0.5, label: "1/2", aria: "1/2" },
  { v: 1, label: "1", aria: "1" },
  { v: 1.5, label: "3/2", aria: "3/2" },
  { v: 2, label: "2", aria: "2" },
  { v: 3, label: "3", aria: "3" },
];
const D_DEFAULT = 2; // index: d = 1
const K_VALUES = [0, 1, 2];
const K_DEFAULT = 0;

/** Boxes narrower than this (px) are not drawn one by one. */
const MIN_BOX = 3;
/** Rows thinner than this (px) are drawn as a solid hairline. */
const THIN = 3;
/** The least height of a row (px), so every level can be counted. */
const MIN_ROW = 1.5;
/** Vertical gap between rows (px). */
const GAP = 3;

const INK = "color-mix(in srgb, var(--fg) 38%, transparent)";
const FILL = "color-mix(in srgb, var(--fg) 13%, transparent)";
const DENSE = "color-mix(in srgb, var(--fg) 22%, transparent)";

const esc = (v) =>
  String(v).replace(
    /[&<>"]/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c],
  );

/** Norwegian digit grouping: a narrow no-break space in numbers ≥ 10 000. */
const num = (x) => (x >= 10000 ? String(x).replace(/\B(?=(\d{3})+(?!\d))/g, "\u202f") : String(x));

/** f(m) = m^d · lg^k m. */
const f = (m, d, k) => m ** d * Math.log2(m) ** k;

/** The tree's levels 0..L: calls, instance size and the level's cost. */
export function levels(a, b, d, k) {
  const n = b ** L;
  const rows = [];
  for (let i = 0; i <= L; i++) {
    const calls = a ** i;
    const size = n / b ** i;
    rows.push({ i, calls, size, cost: calls * (i < L ? f(size, d, k) : 1) });
  }
  return { n, rows };
}

/** f(n) written out: 1, √n, n, n√n, n², n³, each times lg n or lg² n. */
function fText(dIdx, k) {
  const pow = ["", "√n", "n", "n√n", "n²", "n³"][dIdx];
  const lg = ["", "lg n", "lg² n"][k];
  if (!pow && !lg) return "1";
  return [pow, lg].filter(Boolean).join(" ");
}

export default function init({ stage, controls, getSize, onResize, signal }) {
  let a = A_DEFAULT;
  let b = B_DEFAULT;
  let dIdx = D_DEFAULT;
  let k = K_DEFAULT;

  // ── kontroller ──────────────────────────────────────────────────────────
  // Two sliders (a, d) and two button groups (b, k). Each slider label may
  // shrink to SLIDER_MIN, so a slider and a group share a row at 390 px (a, b
  // on the first, d, k on the second) and all four fit one row on a desktop.
  const SLIDER_MIN = "110px";
  const slider = (name, aria, min, max, value, onInput) => {
    const label = document.createElement("label");
    label.style.minWidth = SLIDER_MIN;
    label.style.flexBasis = SLIDER_MIN;
    label.append(`${name} `);
    const out = document.createElement("output");
    const input = document.createElement("input");
    input.type = "range";
    input.min = String(min);
    input.max = String(max);
    input.step = "1";
    input.value = String(value);
    input.style.width = "100%";
    input.setAttribute("aria-label", aria);
    label.append(out, input);
    input.addEventListener(
      "input",
      () => {
        onInput(Number(input.value));
        sync();
        render();
      },
      { signal },
    );
    return { el: label, out, input };
  };

  // A group of buttons is not a labelable control, so each group gets the
  // framework's label layout on a <div role="group"> instead of a <label>
  // (a <label> would forward a click on its text to the first button).
  const btnGroup = (name, aria, values, isOn, onPick) => {
    const wrap = document.createElement("div");
    wrap.setAttribute("role", "group");
    wrap.setAttribute("aria-label", aria);
    wrap.style.cssText =
      "display:flex;flex-direction:column;justify-content:space-between;align-self:stretch;" +
      "gap:var(--space-2);font-family:var(--font-mono);font-size:var(--text-xs);color:var(--muted)";
    const tag = document.createElement("span");
    tag.textContent = name;
    const row = document.createElement("span");
    row.style.cssText = "display:flex;flex-wrap:wrap;gap:var(--space-2)";
    const btns = values.map((v) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "sim-btn";
      btn.textContent = String(v);
      btn.setAttribute("aria-label", `${name} = ${v}`);
      btn.addEventListener(
        "click",
        () => {
          onPick(v);
          sync();
          render();
        },
        { signal },
      );
      row.append(btn);
      return btn;
    });
    wrap.append(tag, row);
    return { el: wrap, sync: () => btns.forEach((btn, j) => btn.setAttribute("aria-pressed", String(isOn(values[j])))) };
  };

  const aS = slider("a", "Antall delinstanser a", A_MIN, A_MAX, a, (v) => (a = v));
  const bG = btnGroup("b", "Størrelsen deles på b", B_VALUES, (v) => v === b, (v) => (b = v));
  // The d slider runs over the index into D_VALUES; aria-valuetext says d.
  const dS = slider("d", "Eksponenten d i f(n) = n^d · lg^k n", 0, D_VALUES.length - 1, dIdx, (v) => (dIdx = v));
  const kG = btnGroup("k", "Eksponenten k i f(n) = n^d · lg^k n", K_VALUES, (v) => v === k, (v) => (k = v));
  controls.append(aS.el, bG.el, dS.el, kG.el);

  function sync() {
    aS.out.textContent = String(a);
    dS.out.textContent = D_VALUES[dIdx].label;
    dS.input.setAttribute("aria-valuetext", D_VALUES[dIdx].aria);
    bG.sync();
    kG.sync();
  }

  // ── tegning ─────────────────────────────────────────────────────────────
  function render() {
    const { w, h } = getSize();
    if (w <= 0 || h <= 0) {
      stage.innerHTML = "";
      return;
    }
    const d = D_VALUES[dIdx].v;
    const { n, rows } = levels(a, b, d, k);
    const total = rows.reduce((s, r) => s + r.cost, 0);
    const rec = `T(n) = ${a === 1 ? "" : a}T(n/${b}) + ${fText(dIdx, k)}`;

    // Type sizes in px, read from the root so the layout follows the reader's
    // text size. IBM Plex Mono advances 0.6 em per glyph.
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    const fsSm = 0.84 * rem;
    const fsXs = 0.72 * rem;
    const textW = (s, fs) => [...s].length * 0.6 * fs;

    const PAD_X = 10;
    const PAD_T = 10;
    const PAD_B = 8;
    const x0 = PAD_X;
    const W = w - 2 * PAD_X;
    const recBase = PAD_T + fsSm * 0.8;
    const rootBase = recBase + fsSm * 0.55 + fsXs * 1.15;
    const top = rootBase + fsXs * 0.45;
    const leafBase = h - PAD_B - fsXs * 0.25;
    const bottom = leafBase - fsXs * 1.05;

    // Row heights ∝ cost, filling (bottom − top − gaps). Rows that would come
    // out thinner than MIN_ROW get MIN_ROW, and the rest share what is left.
    const avail = bottom - top - L * GAP;
    const hs = new Array(rows.length).fill(0);
    const pinned = new Set();
    for (let pass = 0; pass <= rows.length; pass++) {
      const free = rows.filter((r) => !pinned.has(r.i));
      const rest = avail - pinned.size * MIN_ROW;
      const sum = free.reduce((s, r) => s + r.cost, 0);
      let changed = false;
      for (const r of free) {
        hs[r.i] = (r.cost / sum) * rest;
        if (hs[r.i] < MIN_ROW) {
          pinned.add(r.i);
          changed = true;
        }
      }
      for (const i of pinned) hs[i] = MIN_ROW;
      if (!changed) break;
    }

    let svg = "";
    const text = (x, y, str, style, anchor = "start") =>
      (svg +=
        `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" text-anchor="${anchor}" ` +
        `style="font-family:var(--font-mono);${style}">${esc(str)}</text>`);

    text(x0, recBase, rec, "fill:var(--fg);font-size:var(--text-sm);font-weight:600");
    text(x0, rootBase, `rota, n = ${num(n)}`, "fill:var(--muted);font-size:var(--text-xs)");
    text(x0, leafBase, "løvnoder", "fill:var(--muted);font-size:var(--text-xs)");

    // Every edge sits on the device-pixel grid, so the lines stay crisp and
    // evenly spaced (no beat between line positions and pixels).
    const dpr = window.devicePixelRatio || 1;
    const snap = (v) => Math.round(v * dpr) / dpr;
    const px = 1 / dpr;
    const hair = Math.max(1, Math.round(0.5 * dpr)) / dpr; // the thinnest crisp line ≥ 0.5 px
    const xL = snap(x0);
    const xR = snap(x0 + W);

    const labels = [];
    let y = top;
    rows.forEach((r, i) => {
      const yT = snap(y);
      const yB = snap(y + Math.max(hs[i], MIN_ROW));
      const hh = yB - yT;
      if (hs[i] < THIN) {
        // A hairline: the level is there, its cost too small to draw.
        svg += `<rect x="${xL}" y="${yT}" width="${xR - xL}" height="${Math.max(hh, px)}" style="fill:${INK}"/>`;
      } else {
        const boxW = W / r.calls;
        const fine = boxW < MIN_BOX;
        const rx = Math.min(2, hh / 4);
        svg +=
          `<rect x="${xL + 0.5}" y="${yT + 0.5}" width="${xR - xL - 1}" height="${hh - 1}" rx="${rx.toFixed(1)}" ` +
          `style="fill:${fine ? DENSE : FILL};stroke:${INK}" stroke-width="1"/>`;
        if (!fine && r.calls > 1) {
          // The borders between the boxes; thinner where the boxes are narrow.
          const sw = boxW >= 8 ? 1 : hair;
          let p = "";
          for (let j = 1; j < r.calls; j++) {
            const x = snap(x0 + j * boxW - sw / 2);
            p += `M${x} ${yT + 1}h${sw}V${yB - 1}h${-sw}Z`;
          }
          svg += `<path d="${p}" style="fill:${INK}"/>`;
        }
        // The row's label: how many calls and what each one costs.
        const plateH = fsXs + 4;
        if (hh >= plateH + 2) {
          const str = i < L ? `${num(r.calls)} × f(${num(r.size)})` : `${num(r.calls)} × T(1)`;
          labels.push({ str, y: (yT + yB) / 2, plateH });
        }
      }
      y += Math.max(hs[i], MIN_ROW) + GAP;
    });

    // Labels last, on a plate of the stage's ground, so no border crosses them.
    for (const lb of labels) {
      const tw = textW(lb.str, fsXs);
      svg +=
        `<rect x="${(x0 + 4).toFixed(1)}" y="${(lb.y - lb.plateH / 2).toFixed(1)}" width="${(tw + 8).toFixed(1)}" height="${lb.plateH.toFixed(1)}" rx="3" ` +
        `style="fill:var(--bg-elevated)"/>`;
      text(x0 + 8, lb.y + fsXs * 0.35, lb.str, "fill:var(--fg);font-size:var(--text-xs)");
    }

    stage.setAttribute(
      "aria-label",
      `Rekursjonstreet for ${rec} med n = ${n}. Arbeid per nivå fra rota til løvnodene: ` +
        rows.map((r) => num(r.cost >= 100 ? Math.round(r.cost) : Math.round(r.cost * 10) / 10).replace(".", ",")).join(", ") +
        `, i alt ${num(Math.round(total))}.`,
    );
    stage.innerHTML =
      `<svg width="100%" height="100%" viewBox="0 0 ${w.toFixed(0)} ${h.toFixed(0)}" ` +
      `preserveAspectRatio="none" role="img" aria-hidden="true" style="display:block">${svg}</svg>`;
  }

  sync();
  onResize(render);
  render();
}
