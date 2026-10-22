/**
 * Kjipingen for TDT4120 modul 05 «Rangering i lineær tid»: sorting by
 * comparisons is a game of yes/no questions about which of the n! orderings
 * the input is.
 *
 * One idea: a comparison «er A[i] ≤ A[j]?» is a yes/no question, and the
 * input is one of n! orderings (rekkefølger). Each answer at best halves the
 * orderings that are left, and the kjiping, who knows your questions and
 * picks the input as you go, always gives the answer that leaves more of them.
 * So nobody can be sure to finish in fewer than ⌈lg n!⌉ questions: 3 for
 * n = 3 (6 orderings), 5 for n = 4 (24), 7 for n = 5 (120).
 *
 * Drawing, top to bottom:
 *  - n face-down cards in a row (the module's card at one uniform height, a
 *    light diagonal hatch as its back), the 1-based position under each. The
 *    reader taps one card, then another: that asks «er A[i] ≤ A[j]?» in the
 *    order tapped. The first card gets the accent outline (CARD.key); the
 *    answer frame gives both cards the orange outline (CARD.compared).
 *  - One answer line under the positions: «Velg to kort» at rest (muted),
 *    «A[2] ≤ …» while one card is chosen (muted), «A[2] ≤ A[4]: ja» /
 *    «A[2] ≤ A[4]: nei» after an answer, and at the end of a round
 *    «Funnet etter 5 spørsmål» (green, bold).
 *  - Every one of the n! orderings as a tile: n thin bars whose heights are
 *    the ranks of A[1] … A[n], left to right as the cards, in a fixed grid in
 *    lexicographic order of the ranks (row by row). A bright tile is an input
 *    the kjiping can still have picked; an answer fades every tile that
 *    contradicts it to 14 % (350 ms, none under prefers-reduced-motion), in
 *    place. The grid is laid out once per round and stage width; tiles never
 *    move or resize during a round.
 *  - One status line under the tiles: how many orderings are left after each
 *    question so far, «24 · 12 · 6 · 3 · 2 · 1», the newest number bold, in
 *    --text-sm (--text-xs on a phone, where «120 · 60 · 30 · 15 · 8 · 4 · 2 ·
 *    1» would not fit). A line too long for the stage is split into two
 *    lines as even as they go (Insertion-Sort at n = 5 on a phone); only
 *    past two lines are the oldest numbers replaced by «…».
 * When one tile is left, the cards turn face up (height = rank, the value
 * 1 … n printed at the top, as the steppers' cards), that tile turns green
 * (an ordering found) and the answer line says how many questions it took.
 * A question whose answer is already known (no tile fades) still counts.
 *
 * Opponents («Motspiller»): «kjiping» counts the bright tiles on each side
 * and answers so that more stay bright, «ja» on a tie; it is deterministic,
 * so every sequence of questions gives the same answers every time.
 * «tilfeldig» deals a hidden ordering at the start of the round (uniform,
 * Math.random) and answers the truth about it.
 *
 * «La algoritmen spørre»: «Insertion-Sort» or «Merge-Sort» starts a new round
 * and lets that algorithm ask, one question every 700 ms (all at once under
 * prefers-reduced-motion), with the same drawing. A question is always about
 * two of the ORIGINAL cards: the algorithms move positions in their own
 * array, and each question names the cards by where they were dealt.
 *  - Insertion-Sort as the book (module 01): for j = 2 … n, compare the key
 *    with the element to its left, «er A[i] ≤ key?»; «nei» shifts and goes on
 *    left, «ja» (or the left end) stops.
 *  - Merge-Sort: q = ⌊(p + r)/2⌋, sort both halves, merge by asking
 *    «er L-front ≤ R-front?» until one side is empty (the book's Merge without
 *    sentinels; a comparison with ∞ would not be a question).
 *
 * Numbers the module text uses (checked by running this file's functions
 * against every setting; the kjiping is deterministic):
 *  - First view: n = 4, kjiping, 4 face-down cards, 24 bright tiles,
 *    «Velg to kort», status «24».
 *  - n = 4, kjiping, A[1]:A[2] ja (12 of 24 each way, tie) → 12;
 *    A[3]:A[4] ja (6 of 12, tie) → 6; A[1]:A[3] ja (3 of 6, tie) → 3;
 *    then A[2]:A[3] nei (1 of 3 say ja) → 2; A[2]:A[4] ja (1 of 2, tie) → 1.
 *    «24 · 12 · 6 · 3 · 2 · 1», «Funnet etter 5 spørsmål»; the input
 *    A[1 : 4] has the ranks 1, 3, 2, 4.
 *  - Against the kjiping: Insertion-Sort 3, 6, 10 questions for n = 3, 4, 5
 *    (its worst case n(n − 1)/2): n = 4 «24 · 12 · 8 · 4 · 3 · 2 · 1»,
 *    n = 5 «120 · 60 · 40 · 20 · 15 · 10 · 5 · 4 · 3 · 2 · 1».
 *    Merge-Sort 3, 5, 8: n = 4 «24 · 12 · 6 · 3 · 2 · 1»,
 *    n = 5 «120 · 60 · 40 · 20 · 10 · 6 · 3 · 2 · 1». n = 3 both «6 · 3 · 2 · 1».
 *  - Fewest questions against the kjiping (exhaustive search): 5 at n = 4,
 *    7 at n = 5 (= ⌈lg n!⌉). At n = 5 the Ford–Johnson order reaches 7:
 *    A[1]:A[2] ja, A[3]:A[4] ja, A[2]:A[4] ja (now A[1] < A[2] < A[4] and
 *    A[3] < A[4]), insert A[5] into that chain of three by halving,
 *    A[2]:A[5] nei, A[1]:A[5] ja, then A[3] among the three below A[4],
 *    A[5]:A[3] ja, A[2]:A[3] ja: «120 · 60 · 30 · 15 · 8 · 4 · 2 · 1».
 *  - Truthful answers over all inputs: Insertion-Sort asks 2–3 (n = 3),
 *    3–6 (n = 4), 4–10 (n = 5); Merge-Sort 2–3, 4–5, 5–8.
 *
 * Input: each card is a transparent <button> over its drawing (aria-label
 * «A[2]», aria-pressed while chosen), so taps, clicks and Enter/Space all
 * work, and focus survives the redraw. The stage holds buttons, so it is a
 * group; each answer is mirrored to a polite live region.
 *
 * Colours are framework tokens only. Never by colour alone: a chosen card is
 * a heavier outline plus the «A[2] ≤ …» line, a compared card the heaviest
 * outline plus the answer line, a faded tile is faint, the found tile is
 * outlined.
 *
 * Contract: default-export init(api); host="dom", so api = { stage, controls,
 * getSize, onResize, signal }.
 */

const N_CHOICES = [3, 4, 5];
const N_DEFAULT = 4;
/** Time between two of an algorithm's questions, and before its first. */
const STEP_MS = 700;
const FIRST_MS = 400;
const FADE_MS = 350;
/** Opacity of a tile the answers have ruled out. */
const OFF = 0.14;

const OPPONENTS = {
  kjiping: { label: "kjiping", aria: "Motspiller: kjipingen, som gir det svaret som lar flere rekkefølger være igjen" },
  tilfeldig: { label: "tilfeldig", aria: "Motspiller: en skjult, tilfeldig rekkefølge, og svarene er sanne" },
};
const ALGOS = {
  insertion: { label: "Insertion-Sort", aria: "La Insertion-Sort spørre" },
  merge: { label: "Merge-Sort", aria: "La Merge-Sort spørre" },
};

/** Every ordering of n elements as the ranks of A[1] … A[n], lexicographic. */
export function orderings(n) {
  const out = [];
  const used = Array(n + 1).fill(false);
  const cur = [];
  const rec = () => {
    if (cur.length === n) return void out.push([...cur]);
    for (let v = 1; v <= n; v++) {
      if (used[v]) continue;
      used[v] = true;
      cur.push(v);
      rec();
      cur.pop();
      used[v] = false;
    }
  };
  rec();
  return out;
}

/** The true answer to «er A[i] ≤ A[j]?» for one ordering (1-based i, j). */
export const truth = (ranks, i, j) => ranks[i - 1] <= ranks[j - 1];

/** The kjiping's answer: the side that leaves more of `alive` bright, «ja» on a tie. */
export function kjiping(all, alive, i, j) {
  let yes = 0;
  for (const t of alive) if (truth(all[t], i, j)) yes++;
  return yes >= alive.length - yes;
}

/**
 * Insertion-Sort's questions (the book's, module 01). Yields [a, b] for
 * «er A[a] ≤ A[b]?», a and b positions as dealt; receives the answer.
 */
export function* insertionSort(n) {
  const A = Array.from({ length: n }, (_, k) => k + 1); // A[k − 1] = the card now in place k
  for (let j = 2; j <= n; j++) {
    const key = A[j - 1];
    let i = j - 1;
    while (i > 0) {
      const le = yield [A[i - 1], key]; // the loop test A[i] > key, asked as A[i] ≤ key
      if (le) break;
      A[i] = A[i - 1];
      i -= 1;
    }
    A[i] = key;
  }
}

/** Merge-Sort's questions: split at ⌊(p + r)/2⌋, merge front against front. */
export function* mergeSort(n) {
  const A = Array.from({ length: n }, (_, k) => k + 1);
  function* sort(p, r) {
    if (p >= r) return;
    const q = Math.floor((p + r) / 2);
    yield* sort(p, q);
    yield* sort(q + 1, r);
    const L = A.slice(p - 1, q);
    const R = A.slice(q, r);
    let i = 0;
    let j = 0;
    let k = p - 1;
    while (i < L.length && j < R.length) {
      const le = yield [L[i], R[j]];
      A[k++] = le ? L[i++] : R[j++];
    }
    while (i < L.length) A[k++] = L[i++];
    while (j < R.length) A[k++] = R[j++];
  }
  yield* sort(1, n);
}

const GENS = { insertion: insertionSort, merge: mergeSort };

const FONT = "font-family:var(--font-mono)";
const NB = " ";

/** Card styles as in the module's steppers (partition.js, innsetting.js). */
const CARD = {
  plain: { fill: "color-mix(in srgb, var(--fg) 9%, transparent)", stroke: "color-mix(in srgb, var(--fg) 28%, transparent)", wdt: 1, text: "var(--fg)" },
  compared: { fill: "color-mix(in srgb, var(--fg) 9%, transparent)", stroke: "var(--orange)", wdt: 2.5, text: "var(--fg)" },
  key: { fill: "color-mix(in srgb, var(--accent) 16%, transparent)", stroke: "var(--accent)", wdt: 2, text: "var(--accent-ink)" },
};
const HATCH_INK = "color-mix(in srgb, var(--fg) 16%, transparent)";
const TILE_BG = "color-mix(in srgb, var(--fg) 6%, transparent)";
const TILE_BAR = "color-mix(in srgb, var(--fg) 50%, transparent)";
const FOUND_BG = "color-mix(in srgb, var(--green) 20%, transparent)";

const f1 = (v) => v.toFixed(1);
let instances = 0;

export default function init({ stage, controls, getSize, onResize, signal }) {
  const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hatchId = `kjiping-hatch-${++instances}`;

  let n = N_DEFAULT;
  let opponent = "kjiping";
  let all = orderings(n);
  // Round state.
  let alive = [];
  let counts = [];
  let first = null; // the chosen card, waiting for the second
  let last = null; // { i, j, yes } of the latest question
  let hidden = null; // the dealt ordering against «tilfeldig»
  let algo = null; // the algorithm asking this round
  let gen = null;
  let timer = 0;
  let done = false;

  // ── scene ────────────────────────────────────────────────────────────────
  // The SVG is laid out once per round and stage width; an answer only
  // changes the tiles' opacity (so the fade is a CSS transition) and redraws
  // the cards and the two lines. The card buttons over it stay, so a focused
  // card keeps focus.
  stage.setAttribute("role", "group");
  stage.setAttribute("aria-label", "Kjipingen");
  stage.style.position = "relative";
  const art = document.createElement("div");
  art.setAttribute("aria-hidden", "true");
  art.style.cssText = "position:absolute;inset:0";
  const hits = document.createElement("div");
  hits.style.cssText = "position:absolute;inset:0;pointer-events:none";
  const live = document.createElement("p");
  live.className = "sr-only";
  live.setAttribute("aria-live", "polite");
  stage.replaceChildren(art, hits, live);

  let buttons = [];
  function makeButtons() {
    hits.replaceChildren();
    buttons = [];
    for (let k = 1; k <= n; k++) {
      const b = document.createElement("button");
      b.type = "button";
      b.style.cssText =
        "position:absolute;left:0;top:0;margin:0;padding:0;border:0;border-radius:6px;" +
        "background:transparent;pointer-events:auto;touch-action:manipulation;" +
        "-webkit-tap-highlight-color:transparent;cursor:pointer";
      b.addEventListener("click", () => pick(k), { signal });
      buttons.push(b);
      hits.append(b);
    }
  }

  // ── kontroller ───────────────────────────────────────────────────────────
  // A group of buttons is not a labelable control, so each group gets the
  // framework's label layout on a <div role="group"> (as quicksort-tre.js).
  const btnGroup = (text, aria, entries, isOn, onPick) => {
    const wrap = document.createElement("div");
    wrap.setAttribute("role", "group");
    wrap.setAttribute("aria-label", aria);
    wrap.style.cssText =
      "display:flex;flex-direction:column;gap:var(--space-2);font-family:var(--font-mono);" +
      "font-size:var(--text-xs);color:var(--muted)";
    const tag = document.createElement("span");
    tag.textContent = text;
    const row = document.createElement("span");
    row.style.cssText = "display:flex;flex-wrap:wrap;gap:var(--space-2)";
    const btns = {};
    for (const k of Object.keys(entries)) {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "sim-btn";
      b.textContent = entries[k].label;
      b.setAttribute("aria-label", entries[k].aria);
      b.addEventListener("click", () => onPick(k), { signal });
      btns[k] = b;
      row.append(b);
    }
    wrap.append(tag, row);
    return {
      el: wrap,
      sync: () => Object.keys(btns).forEach((k) => btns[k].setAttribute("aria-pressed", String(isOn(k)))),
    };
  };

  const SIZES = Object.fromEntries(N_CHOICES.map((k) => [k, { label: String(k), aria: `n = ${k} kort` }]));
  const nGroup = btnGroup("n", "Antall kort n", SIZES, (k) => Number(k) === n, (k) => {
    n = Number(k);
    all = orderings(n);
    newRound();
  });
  const oppGroup = btnGroup("Motspiller", "Motspiller", OPPONENTS, (k) => k === opponent, (k) => {
    opponent = k;
    newRound();
  });
  const algoGroup = btnGroup("La algoritmen spørre", "La algoritmen spørre", ALGOS, (k) => k === algo, (k) => runAlgo(k));

  const roundBtn = document.createElement("button");
  roundBtn.type = "button";
  roundBtn.className = "sim-btn";
  roundBtn.textContent = "Ny runde";
  roundBtn.setAttribute("aria-label", "Ny runde: alle kortene snus, og alle rekkefølgene er med igjen");
  roundBtn.addEventListener("click", () => newRound(), { signal });

  const groups = document.createElement("div");
  groups.style.cssText = "display:flex;flex-wrap:wrap;align-items:flex-end;gap:var(--space-4) var(--space-5)";
  groups.append(nGroup.el, oppGroup.el, roundBtn, algoGroup.el);
  controls.append(groups);

  function sync() {
    nGroup.sync();
    oppGroup.sync();
    algoGroup.sync();
  }

  // ── runden ───────────────────────────────────────────────────────────────
  function stop() {
    clearTimeout(timer);
    timer = 0;
    gen = null;
  }
  signal.addEventListener("abort", stop);

  function newRound() {
    stop();
    algo = null;
    alive = all.map((_, t) => t);
    counts = [alive.length];
    first = null;
    last = null;
    done = false;
    hidden = opponent === "tilfeldig" ? Math.floor(Math.random() * all.length) : null;
    sync();
    layout();
  }

  /** Asks «er A[i] ≤ A[j]?» and returns the answer. */
  function ask(i, j) {
    const yes = hidden == null ? kjiping(all, alive, i, j) : truth(all[hidden], i, j);
    alive = alive.filter((t) => truth(all[t], i, j) === yes);
    counts.push(alive.length);
    last = { i, j, yes };
    done = alive.length === 1;
    const q = counts.length - 1;
    live.textContent = done
      ? `A[${i}] ≤ A[${j}]: ${yes ? "ja" : "nei"}. Funnet etter ${q} spørsmål.`
      : `A[${i}] ≤ A[${j}]: ${yes ? "ja" : "nei"}. ${alive.length} rekkefølger er igjen.`;
    return yes;
  }

  function pick(k) {
    if (done || gen) return;
    if (first === k) first = null;
    else if (first == null) first = k;
    else {
      ask(first, k);
      first = null;
    }
    update();
  }

  function runAlgo(k) {
    newRound();
    algo = k;
    sync();
    gen = GENS[k](n);
    let reply;
    const step = () => {
      if (!gen) return;
      const r = gen.next(reply);
      if (r.done) {
        gen = null;
        update();
        return false;
      }
      reply = ask(r.value[0], r.value[1]);
      if (done) gen = null;
      return !done;
    };
    if (still) {
      while (step());
      update();
      return;
    }
    const tick = () => {
      const more = step();
      update();
      if (more) timer = setTimeout(tick, STEP_MS);
    };
    timer = setTimeout(tick, FIRST_MS);
  }

  // ── tegning ──────────────────────────────────────────────────────────────
  let L = null; // the current layout
  let tileEls = [];
  let dyn = null;

  function layout() {
    const { w, h } = getSize();
    if (w <= 0 || h <= 0) {
      art.innerHTML = "";
      L = null;
      return;
    }
    // Type sizes in px, read from the root so the layout follows the reader's
    // text size. IBM Plex Mono advances 0.6 em per glyph.
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    const fsSm = 0.84 * rem;
    const fsXs = 0.72 * rem;
    const textW = (s, fs) => String(s).length * 0.6 * fs;

    // Vertical bands, top to bottom: the cards on their baseline, the
    // positions, the answer line, the tiles, the status line (room for two
    // lines where a long one may need them).
    const PAD_X = 6;
    const PAD_T = 8;
    const CARD_H = Math.round(Math.min(72, Math.max(52, h * 0.16)));
    const IDX_H = Math.ceil(fsXs) + 6;
    const ANS_H = Math.ceil(fsSm * 2.2);
    // The status line is --text-sm where the shortest round at n = 5
    // (7 questions, 8 numbers) fits on one line, else --text-xs (phones);
    // it is set by the stage width alone, so it never changes with n.
    const fsStat = textW("120 · 60 · 30 · 15 · 8 · 4 · 2 · 1", fsSm) <= w - 12 ? fsSm : fsXs;
    const lineH = Math.ceil(fsStat * 1.45);
    const W = w - 2 * PAD_X;
    // The longest status the algorithms can produce at this n, at --text-sm.
    const nf = all.length;
    const longest = n === 5 ? "120 · 60 · 40 · 20 · 15 · 10 · 5 · 4 · 3 · 2 · 1" : n === 4 ? "24 · 12 · 8 · 4 · 3 · 2 · 1" : "6 · 3 · 2 · 1";
    const statLines = textW(longest, fsStat) > W ? 2 : 1;
    const STAT_H = lineH * statLines + Math.ceil(fsStat * 0.9);
    const base = PAD_T + CARD_H;
    const ansY = base + IDX_H + ANS_H * 0.62;
    const gridTop = base + IDX_H + ANS_H;
    const PAD_B = 4;

    // Cards: slots up to 76 px, centred.
    const slot = Math.min(76, W / n);
    const x0 = (w - slot * n) / 2;
    const sep = Math.max(6, slot * 0.16);
    const cw = slot - sep;
    const MIN_H = Math.round(fsSm * 1.95); // room for the value on the shortest card

    // Tiles: the grid of full rows that gives the largest tile, a tile no
    // wider than 1,5 times its height nor taller than 1,25 times its width.
    // A tile is a miniature: at most 0,8 of a card's height, bars at most
    // 12 px wide. Of the grids within 3 % of the largest tile, the one whose
    // shape is closest to the free space's (n = 3: 3 × 2; n = 4: 6 × 4 on a
    // phone, 8 × 3 at 1100 px; n = 5: 10 × 12 on a phone, 20 × 6 at 1100 px).
    const gH = h - PAD_B - gridTop - STAT_H;
    const maxTw = (n * 12) / 0.72 + 6;
    const maxTh = 0.8 * CARD_H;
    const cands = [];
    for (let c = 1; c <= nf; c++) {
      if (nf % c) continue; // full rows only
      const rows = nf / c;
      const cellW = W / c;
      const cellH = gH / rows;
      const gap = Math.max(3, Math.min(10, Math.min(cellW, cellH) * 0.16));
      let tw = cellW - gap;
      let th = cellH - gap;
      tw = Math.min(tw, th * 1.5, maxTw);
      th = Math.min(th, tw * 1.25, maxTh);
      tw = Math.min(tw, th * 1.5);
      if (tw <= 0 || th <= 0) continue;
      cands.push({ c, rows, tw, th, gap, score: tw * th });
    }
    const top = Math.max(...cands.map((k) => k.score));
    const shapeOff = (k) => Math.abs(Math.log((k.c * (k.tw + k.gap)) / (k.rows * (k.th + k.gap)) / (W / gH)));
    const best = cands.filter((k) => k.score >= 0.97 * top).sort((a, b) => shapeOff(a) - shapeOff(b))[0];
    const { c: cols, rows, tw, th, gap } = best;
    const pitchX = tw + gap;
    const pitchY = th + gap;
    const gx0 = (w - (cols * pitchX - gap)) / 2;
    // The grid with the status line right under it, centred in the space
    // under the answer line.
    const gridHt = rows * pitchY - gap;
    const gy0 = gridTop + Math.max(0, (gH - gridHt) / 2);
    const statTop = gy0 + gridHt;

    L = { w, fsSm, fsStat, textW, base, ansY, CARD_H, MIN_H, slot, x0, sep, cw, W, statLines, lineH, statTop };

    // The tiles, built once: a pale ground and n bars, height = rank.
    const pad = Math.max(2, Math.min(5, tw * 0.1));
    const bw = (tw - 2 * pad) / n;
    const barW = bw * 0.72;
    const unit = (th - 2 * pad) / n;
    const rx = Math.min(3, tw * 0.1);
    let tiles = "";
    all.forEach((ranks, t) => {
      const tx = gx0 + (t % cols) * pitchX;
      const ty = gy0 + Math.floor(t / cols) * pitchY;
      let g =
        `<g data-t="${t}" style="opacity:1${still ? "" : `;transition:opacity ${FADE_MS}ms ease`}">` +
        `<rect x="${f1(tx)}" y="${f1(ty)}" width="${f1(tw)}" height="${f1(th)}" rx="${f1(rx)}" style="fill:${TILE_BG}"/>`;
      ranks.forEach((r, k) => {
        const bh = r * unit;
        g +=
          `<rect x="${f1(tx + pad + k * bw + (bw - barW) / 2)}" y="${f1(ty + th - pad - bh)}" ` +
          `width="${f1(barW)}" height="${f1(bh)}" rx="${f1(Math.min(1, barW * 0.25))}" style="fill:${TILE_BAR}"/>`;
      });
      tiles += g + "</g>";
    });

    // The cards' back: a light diagonal hatch, clipped by the card's shape.
    const defs =
      `<defs><pattern id="${hatchId}" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">` +
      `<line x1="0" y1="0" x2="0" y2="6" style="stroke:${HATCH_INK}" stroke-width="2"/></pattern></defs>`;

    art.innerHTML =
      `<svg width="100%" height="100%" viewBox="0 0 ${w.toFixed(0)} ${h.toFixed(0)}" ` +
      `preserveAspectRatio="none" style="display:block">${defs}<g>${tiles}</g><g></g></svg>`;
    const svg = art.firstElementChild;
    tileEls = [...svg.children[1].children];
    dyn = svg.children[2];

    if (buttons.length !== n) makeButtons();
    buttons.forEach((b, k) => {
      b.style.width = `${f1(cw)}px`;
      b.style.height = `${f1(CARD_H + IDX_H)}px`;
      b.style.transform = `translate(${f1(x0 + k * slot + sep / 2)}px, ${f1(base - CARD_H)}px)`;
    });
    update();
  }

  function update() {
    if (!L) return;
    const { fsSm, fsStat, textW, base, ansY, CARD_H, MIN_H, slot, x0, sep, cw, W, statLines, lineH, statTop, w } = L;
    const XS = `${FONT};font-size:var(--text-xs)`;
    const SM = `${FONT};font-size:var(--text-sm)`;

    // Tiles: bright, faded, or the one found.
    const on = new Set(alive);
    tileEls.forEach((g, t) => {
      const lit = on.has(t);
      g.style.opacity = lit ? "1" : String(OFF);
      const found = done && lit;
      const bg = g.firstElementChild;
      bg.style.fill = found ? FOUND_BG : TILE_BG;
      bg.style.stroke = found ? "var(--green)" : "none";
      bg.style.strokeWidth = found ? "1.5" : "0";
      for (let k = 1; k < g.children.length; k++) g.children[k].style.fill = found ? "var(--green)" : TILE_BAR;
    });

    let svg = "";
    const text = (x, y, s, style, anchor = "middle") =>
      (svg += `<text x="${f1(x)}" y="${f1(y)}" text-anchor="${anchor}" style="${style}">${s}</text>`);

    // The cards: face down during the round, face up (height = rank) at the end.
    const ranks = done ? all[alive[0]] : null;
    const marks = first == null && last && !done ? new Set([last.i, last.j]) : new Set();
    svg +=
      `<line x1="${f1(x0 + sep / 2 - 5)}" y1="${f1(base)}" x2="${f1(x0 + n * slot - sep / 2 + 5)}" y2="${f1(base)}" ` +
      `style="stroke:var(--border-strong)" stroke-width="1"/>`;
    for (let k = 1; k <= n; k++) {
      const st = first === k ? CARD.key : marks.has(k) ? CARD.compared : CARD.plain;
      const ht = ranks ? MIN_H + (n > 1 ? ((ranks[k - 1] - 1) / (n - 1)) * (CARD_H - MIN_H) : 0) : CARD_H;
      const x = x0 + (k - 1) * slot + sep / 2;
      const y = base - ht;
      svg +=
        `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(cw)}" height="${f1(ht)}" rx="4" style="fill:var(--bg-elevated)"/>` +
        `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(cw)}" height="${f1(ht)}" rx="4" style="fill:${st.fill}"/>`;
      if (!ranks) svg += `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(cw)}" height="${f1(ht)}" rx="4" style="fill:url(#${hatchId})"/>`;
      svg +=
        `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(cw)}" height="${f1(ht)}" rx="4" ` +
        `style="fill:none;stroke:${st.stroke}" stroke-width="${st.wdt}"/>`;
      if (ranks) text(x + cw / 2, y + Math.min(18, MIN_H - 7), ranks[k - 1], `fill:${st.text};${SM};font-weight:600`);
      text(x + cw / 2, base + fsSm + 2, k, `fill:var(--faint);${XS}`);
      const b = buttons[k - 1];
      if (b) {
        b.setAttribute("aria-label", ranks ? `A[${k}] = ${ranks[k - 1]}` : `A[${k}]`);
        b.setAttribute("aria-pressed", String(first === k));
        b.setAttribute("aria-disabled", String(done));
        b.style.cursor = done || gen ? "default" : "pointer";
      }
    }

    // The answer line.
    const cx = w / 2;
    const q = counts.length - 1;
    if (done) {
      text(cx, ansY, `Funnet etter ${q} spørsmål`, `fill:var(--green);${SM};font-weight:600`);
    } else if (first != null) {
      text(cx, ansY, `A[${first}] ≤ …`, `fill:var(--muted);${SM}`);
    } else if (last) {
      text(
        cx,
        ansY,
        `A[${last.i}] ≤ A[${last.j}]: <tspan style="font-weight:600">${last.yes ? "ja" : "nei"}</tspan>`,
        `fill:var(--fg);${SM}`,
      );
    } else {
      text(cx, ansY, "Velg to kort", `fill:var(--muted);${SM}`);
    }

    // The status line: orderings left after each question, newest bold. One
    // line where it fits, else two lines split as evenly as they go (only
    // where the layout has room for two); past that the oldest numbers give
    // way to «…».
    const sepS = " · ";
    const words = counts.map(String);
    const wide = (ws, end) => textW(ws.join(sepS) + (end ? "" : " ·"), fsStat);
    const split = (ws) => {
      if (wide(ws, true) <= W) return [ws];
      if (statLines < 2) return null;
      let pick = null;
      for (let k = 1; k < ws.length; k++) {
        const m = Math.max(wide(ws.slice(0, k), false), wide(ws.slice(k), true));
        if (m <= W && (!pick || m < pick.m)) pick = { m, lines: [ws.slice(0, k), ws.slice(k)] };
      }
      return pick && pick.lines;
    };
    let lines = split(words);
    for (let drop = 2; !lines && drop < words.length; drop++) lines = split(["…", ...words.slice(drop)]);
    if (!lines) lines = [words.slice(-1)];
    const STAT = `${FONT};font-size:var(${fsStat === fsSm ? "--text-sm" : "--text-xs"})`;
    const sy = statTop + fsStat * 0.45 + lineH * 0.72;
    lines.forEach((ln, li) => {
      const isLast = li === lines.length - 1;
      const body = ln
        .map((t, k) => (isLast && k === ln.length - 1 ? `<tspan style="font-weight:600">${t}</tspan>` : t))
        .join(sepS);
      text(cx, sy + li * lineH, body + (isLast ? "" : " ·"), `fill:var(--fg);${STAT}`);
    });

    dyn.innerHTML = svg;
  }

  newRound();
  onResize(layout);
}
