/**
 * Arbeidet til Insertion-Sort: how many moves (line 5, one card one place to
 * the right) the algorithm makes on one input, and why that number depends on
 * the ORDER of the input and not only on n.
 *
 * One row per iteration i = 2, …, n, top to bottom. Row i shows the cards in
 * positions 1..i at the START of iteration i, exactly as the real algorithm
 * leaves them: the sorted part A[1 : i − 1] and the key A[i]. The rows share
 * their left edge (position 1), so they form a staircase. In each row the cards
 * of A[1 : i − 1] that are larger than the key are the ones line 5 moves in
 * this iteration (solid orange); the key is outlined in the accent colour; the
 * other cards of the sorted part stay where they are (neutral grey).
 *
 * The numbers the module text uses (checked against rowsOf below):
 *  - S = the number of orange cells = the number of moves.
 *  - The cells of A[1 : i − 1] over all rows are 1 + 2 + … + (n − 1)
 *    = n(n − 1)/2: the most moves possible for this n. They are exactly half of
 *    the drawing's bounding box, which is n − 1 rows (i = 2..n) by n columns;
 *    the keys plus the empty corner are the other half, the same staircase
 *    turned around.
 *  - «sortert» (1..n): no card is larger than its key, S = 0; every iteration
 *    only looks at the key and the card left of it.
 *  - «omvendt» (n..1): every card of the sorted part is larger than the key,
 *    S = n(n − 1)/2: 28 at n = 8, 120 at n = 16.
 *  - The default hand [6, 8, 3, 5, 2, 7, 4, 1] (the lecture's example, also
 *    the module's stepper's): moves per iteration i = 2..8 are
 *    0, 2, 2, 4, 1, 4, 7, so S = 20 of at most 28.
 *  - A random order of n distinct cards has n(n − 1)/4 moves on average (each
 *    pair is out of order with probability 1/2), half the staircase.
 *
 * The totals («20 flyttinger / av høyst 28») and a two-swatch legend sit in
 * the empty corner right of the short top rows; on a stage too narrow for that
 * at every n (phones under about 390 px) they sit under the staircase instead.
 * Cells are square, at most CELL_MAX, and the values are printed only when the
 * widest one fits inside the key's outline.
 *
 * Deterministic first view: «tilfeldig» with the lecture's hand at n = 8.
 * Math.random is used only after a «Stokk» or a change of n.
 *
 * Colours are framework tokens only. The course accent (vermillion) is close
 * to --orange in hue, so the two never differ by hue alone: a moved card is a
 * solid orange tile, the key a pale tile with a heavy accent outline.
 *
 * Contract: default-export init(api); host="dom", so api = { stage, controls,
 * getSize, onResize, signal }.
 */

const N_MIN = 4;
const N_MAX = 16;
const N_DEFAULT = 8;
/** The lecture's example hand, also the one the module's stepper sorts. */
const LECTURE_HAND = [6, 8, 3, 5, 2, 7, 4, 1];

const ORDERS = {
  sortert: { label: "sortert", aria: "Sortert rekkefølge" },
  tilfeldig: { label: "tilfeldig", aria: "Tilfeldig rekkefølge" },
  omvendt: { label: "omvendt", aria: "Omvendt rekkefølge" },
};

/** Largest cell side in px; square cells stop growing past this. */
const CELL_MAX = 40;

const esc = (v) =>
  String(v).replace(
    /[&<>"]/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c],
  );

/** A random order of 1..n. */
function shuffled(n) {
  const a = Array.from({ length: n }, (_, i) => i + 1);
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Runs Insertion-Sort on `hand` and records, for every iteration i = 2..n,
 * the cards in positions 1..i at the start of the iteration (the sorted part
 * and the key) and how many cards line 5 moves in it.
 */
function rowsOf(hand) {
  const a = [...hand];
  const rows = [];
  // 0-based k here is the book's i − 1.
  for (let k = 1; k < a.length; k++) {
    const cards = a.slice(0, k + 1);
    const key = a[k];
    let j = k - 1;
    while (j >= 0 && a[j] > key) {
      a[j + 1] = a[j];
      j -= 1;
    }
    a[j + 1] = key;
    rows.push({ i: k + 1, cards, moves: k - 1 - j });
  }
  return rows;
}

export default function init({ stage, controls, getSize, onResize, signal }) {
  let order = "tilfeldig";
  let n = N_DEFAULT;
  let randomHand = [...LECTURE_HAND];

  const hand = () => {
    if (order === "sortert") return Array.from({ length: n }, (_, i) => i + 1);
    if (order === "omvendt") return Array.from({ length: n }, (_, i) => n - i);
    return randomHand;
  };

  // ── kontroller ──────────────────────────────────────────────────────────
  // A group of buttons is not a labelable control, so the group gets the
  // framework's label layout on a <div role="group"> instead of a <label>
  // (a <label> would forward a click on its text to the first button).
  const group = document.createElement("div");
  group.setAttribute("role", "group");
  group.setAttribute("aria-label", "Rekkefølge på kortene");
  group.style.cssText =
    "flex:1;min-width:180px;display:flex;flex-direction:column;gap:var(--space-2);" +
    "font-family:var(--font-mono);font-size:var(--text-xs);color:var(--muted)";
  const groupText = document.createElement("span");
  groupText.textContent = "Rekkefølge";
  const row = document.createElement("span");
  row.style.cssText = "display:flex;flex-wrap:wrap;gap:var(--space-2)";
  const orderBtns = {};
  for (const k of Object.keys(ORDERS)) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "sim-btn";
    b.textContent = ORDERS[k].label;
    b.setAttribute("aria-label", ORDERS[k].aria);
    b.addEventListener(
      "click",
      () => {
        order = k;
        sync();
        render();
      },
      { signal },
    );
    orderBtns[k] = b;
    row.append(b);
  }
  group.append(groupText, row);

  const nLabel = document.createElement("label");
  nLabel.append("n ");
  const nOut = document.createElement("output");
  const nInput = document.createElement("input");
  nInput.type = "range";
  nInput.min = String(N_MIN);
  nInput.max = String(N_MAX);
  nInput.step = "1";
  nInput.value = String(n);
  nInput.setAttribute("aria-label", "Antall kort n");
  nLabel.append(nOut, nInput);
  nInput.addEventListener(
    "input",
    () => {
      n = Number(nInput.value);
      randomHand = shuffled(n);
      sync();
      render();
    },
    { signal },
  );

  const shuffleBtn = document.createElement("button");
  shuffleBtn.type = "button";
  shuffleBtn.className = "sim-btn";
  shuffleBtn.textContent = "Stokk";
  shuffleBtn.setAttribute("aria-label", "Stokk kortene i en ny tilfeldig rekkefølge");
  shuffleBtn.addEventListener(
    "click",
    () => {
      order = "tilfeldig";
      randomHand = shuffled(n);
      sync();
      render();
    },
    { signal },
  );

  controls.append(group, nLabel, shuffleBtn);

  function sync() {
    for (const k of Object.keys(ORDERS)) orderBtns[k].setAttribute("aria-pressed", String(k === order));
    nOut.textContent = String(n);
  }

  // ── tegning ─────────────────────────────────────────────────────────────
  function render() {
    const { w, h } = getSize();
    if (w <= 0 || h <= 0) {
      stage.innerHTML = "";
      return;
    }
    const rows = rowsOf(hand());
    const S = rows.reduce((s, r) => s + r.moves, 0);
    const most = (n * (n - 1)) / 2;

    // Type sizes in px, read from the root so the layout follows the reader's
    // text size. IBM Plex Mono advances 0.6 em per glyph.
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    const fsSm = 0.84 * rem;
    const fsXs = 0.72 * rem;
    const textW = (s, fs) => s.length * 0.6 * fs;

    // The note: the totals (two lines) and the legend (two swatches). Its size
    // is taken at the largest S for each n, so the staircase keeps its size
    // when only the order changes.
    const line2 = `av høyst ${most}`;
    const SW = Math.round(fsXs); // legend swatch side
    const legend = ["flyttes", "nøkkel"];
    const lhSm = fsSm * 1.35;
    const lhXs = Math.max(SW + 6, fsXs * 1.45);
    const totWof = (k) => {
      const m = (k * (k - 1)) / 2;
      return Math.max(textW(`${m} flyttinger`, fsSm), textW(`av høyst ${m}`, fsSm));
    };
    const totW = totWof(n);
    const totH = 2 * lhSm;
    const legW = Math.max(...legend.map((t) => SW + 6 + textW(t, fsXs)));
    const legH = 2 * lhXs;
    const STACK = 8; // between the totals and the legend when stacked
    const SIDE = 24; // between them when side by side

    const PAD = 12;
    const LABEL_W = Math.ceil(textW("16", fsXs)) + 10; // row labels i = 2..n
    const HEAD_H = Math.ceil(fsXs) + 8; // the «i» header
    const GAP = 14; // between the staircase and the note
    const availW = w - 2 * PAD;
    const availH = h - 2 * PAD;

    // Two places for the note. «corner»: stacked in the empty corner right of
    // the short top rows, beside the widest row it overlaps. «below»: under the
    // staircase, totals and legend side by side when they fit. For a given k
    // (the number of cards) each place gets the largest square cell that fits.
    const corner = (k, s) => {
      const noteW = Math.max(totWof(k), legW);
      const noteH = totH + STACK + legH;
      const rowsUnder = Math.min(k - 1, Math.max(1, Math.ceil(noteH / s)));
      const widest = (rowsUnder + 1) * s; // row i = rowsUnder + 1 has i cells
      return {
        s,
        mode: "corner",
        side: false,
        contentW: LABEL_W + Math.max(k * s, widest + GAP + noteW),
        contentH: HEAD_H + Math.max((k - 1) * s, noteH),
      };
    };
    const below = (k, s) => {
      const tw = totWof(k);
      const side = LABEL_W + tw + SIDE + legW <= availW;
      const bandW = side ? tw + SIDE + legW : Math.max(tw, legW);
      const bandH = side ? Math.max(totH, legH) : totH + STACK + legH;
      return {
        s,
        mode: "below",
        side,
        contentW: LABEL_W + Math.max(k * s, bandW),
        contentH: HEAD_H + (k - 1) * s + GAP + bandH,
      };
    };
    const largest = (fn, k) => {
      for (let s = CELL_MAX; s >= 6; s -= 0.5) {
        const L = fn(k, s);
        if (L.contentW <= availW && L.contentH <= availH) return L;
      }
      return fn(k, 6);
    };
    // The place depends on the stage width only, never on n, so the note does
    // not jump while the reader drags the slider: the corner is used when it
    // costs the staircase little for every n (on a narrow phone at large n it
    // would squeeze the staircase to nothing).
    let useCorner = true;
    for (let k = N_MIN; k <= N_MAX; k++) {
      if (largest(corner, k).s < 0.7 * largest(below, k).s) {
        useCorner = false;
        break;
      }
    }
    const L = largest(useCorner ? corner : below, n);
    const s = L.s;
    const ox = PAD + Math.max(0, (availW - L.contentW) / 2);
    const oy = PAD + Math.max(0, (availH - L.contentH) / 2);
    const gx = ox + LABEL_W; // left edge of position 1
    const gy = oy + HEAD_H; // top of row i = 2
    const fsCell = s >= 30 ? fsSm : fsXs;
    const inset = s >= 14 ? 1.5 : 1;
    // Values only where the widest one clears the key's outline with a margin;
    // otherwise the colours alone carry the row (type never shrinks below xs).
    const showValues = s >= String(n).length * 0.6 * fsCell + 2 * (inset + 2) + 5;
    const rx = Math.min(4, s * 0.16);

    let svg = "";
    const text = (x, y, str, style, anchor = "start") =>
      (svg +=
        `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" text-anchor="${anchor}" ` +
        `style="font-family:var(--font-mono);${style}">${esc(str)}</text>`);

    // Header and row labels: the value of i.
    text(gx - 8, gy - 7, "i", "fill:var(--faint);font-size:var(--text-xs);font-style:italic", "end");

    rows.forEach((r, ri) => {
      const y = gy + ri * s;
      const cy = y + s / 2;
      // On a very narrow stage the rows get lower than the label type; then
      // only every other row (even i) keeps its label.
      if (s >= fsXs * 1.15 || r.i % 2 === 0) {
        text(gx - 8, cy + fsXs * 0.35, r.i, "fill:var(--faint);font-size:var(--text-xs)", "end");
      }

      const key = r.cards[r.cards.length - 1];
      r.cards.forEach((v, k) => {
        const x = gx + k * s;
        const isKey = k === r.cards.length - 1;
        const moved = !isKey && v > key;
        let rect;
        let ink;
        if (isKey) {
          // Pale fill and a heavy outline, kept inside the cell.
          const sw = s >= 14 ? 2 : 1.5;
          const o = inset + sw / 2;
          rect =
            `<rect x="${(x + o).toFixed(1)}" y="${(y + o).toFixed(1)}" width="${(s - 2 * o).toFixed(1)}" height="${(s - 2 * o).toFixed(1)}" rx="${rx.toFixed(1)}" ` +
            `style="fill:var(--accent-weak);stroke:var(--accent)" stroke-width="${sw}"/>`;
          ink = "fill:var(--accent-ink);font-weight:600";
        } else {
          const fill = moved ? "var(--orange)" : "color-mix(in srgb, var(--fg) 12%, transparent)";
          rect =
            `<rect x="${(x + inset).toFixed(1)}" y="${(y + inset).toFixed(1)}" width="${(s - 2 * inset).toFixed(1)}" height="${(s - 2 * inset).toFixed(1)}" rx="${rx.toFixed(1)}" ` +
            `style="fill:${fill}"/>`;
          ink = moved ? "fill:var(--bg);font-weight:600" : "fill:var(--muted)";
        }
        svg += rect;
        if (showValues) {
          text(x + s / 2, cy + fsCell * 0.35, v, `${ink};font-size:${fsCell.toFixed(2)}px`, "middle");
        }
      });
    });

    // The note. In the corner it is left-aligned against the right edge of the
    // content, beside the short top rows; below, it starts under position 1.
    let tx;
    let ty;
    let lx;
    let ly;
    if (L.mode === "corner") {
      tx = lx = ox + L.contentW - Math.max(totW, legW);
      ty = gy;
      ly = ty + totH + STACK;
    } else {
      tx = gx;
      ty = gy + (n - 1) * s + GAP;
      lx = L.side ? tx + totW + SIDE : tx;
      ly = L.side ? ty + (totH - legH) / 2 : ty + totH + STACK;
    }
    svg +=
      `<text x="${tx.toFixed(1)}" y="${(ty + lhSm * 0.72).toFixed(1)}" style="font-family:var(--font-mono);font-size:var(--text-sm);fill:var(--fg)">` +
      `<tspan style="font-weight:600">${S}</tspan> ${S === 1 ? "flytting" : "flyttinger"}</text>`;
    text(tx, ty + lhSm * 1.72, line2, "fill:var(--muted);font-size:var(--text-sm)");
    const swatchRow = (yTop, style, label) => {
      svg +=
        `<rect x="${lx.toFixed(1)}" y="${(yTop + (lhXs - SW) / 2).toFixed(1)}" width="${SW}" height="${SW}" rx="2" style="${style}"/>`;
      text(lx + SW + 6, yTop + lhXs / 2 + fsXs * 0.35, label, "fill:var(--muted);font-size:var(--text-xs)");
    };
    swatchRow(ly, "fill:var(--orange)", legend[0]);
    swatchRow(ly + lhXs, "fill:var(--accent-weak);stroke:var(--accent);stroke-width:1.5", legend[1]);

    stage.innerHTML =
      `<svg width="100%" height="100%" viewBox="0 0 ${w.toFixed(0)} ${h.toFixed(0)}" ` +
      `preserveAspectRatio="none" role="img" aria-hidden="true" style="display:block">${svg}</svg>`;
  }

  sync();
  onResize(render);
  render();
}
