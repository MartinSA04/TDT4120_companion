/**
 * Stakk og kø i en tabell, for TDT4120 modul 02: the two small sims of
 * «Stakker og køer», one file. stakk.js and ko.js are one-line wrappers,
 * make({ mode: "stakk" }) and make({ mode: "ko" }).
 *
 * STAKK. The one idea: a stack is a table plus one index, S.top, and
 * everything happens at the top. Push writes one place above the top and
 * moves S.top up; Pop moves S.top down and returns the value it passed. What
 * leaves the stack stays in the table (outline only, value in --faint) but is
 * no longer part of the stack, because the stack is S[1 : S.top].
 *   The table S[1 : 7] stands upright, plass 1 at the bottom (a stack of
 * plates grows upward), index numbers to the left, S.top as an arrow from the
 * right. S.top = 0 points at the empty place under plass 1. Every message
 * («Pop gir 17», «overflow», «underflow») sits in the label column one row
 * above the arrow, in the row of the cell that was just passed.
 *   Start state, the lecture's: S[1 : 5] = 15, 6, 2, 9, 17, S.top = 5,
 * S[6] and S[7] never written. Push pushes 3, 5, 9, then FILLER below in
 * order. A refused Push does not use up its value: the 9 that overflows is
 * the next value pushed after a Pop.
 *   Numbers the module text uses (from the start state):
 *   - Push ×3: 3 to plass 6 (S.top = 6), 5 to plass 7 (S.top = 7), the third
 *     gives «overflow» and changes nothing, since S.top = S.size = 7.
 *   - then Pop: «Pop gir 5», S.top = 6, the 5 stays in plass 7 (faint).
 *   - Nullstill, then Pop: gir 17, 9, 2, 6, 15; the 6th press: «underflow».
 *   Code lines (block `stakk-kode`, the block's own 1-based numbers): Push
 * [7, 9, 10], overflow [7, 8], Pop [13, 2, 4, 15, 16] (Pop calls
 * Stack-Empty, which answers false), underflow [13, 2, 3, 14]; none at rest.
 *
 * KØ. The one idea: a queue in a table needs two indices, Q.head (the first
 * in the queue) and Q.tail (the free place behind the last). Both move to the
 * right, and one that passes plass 12 continues at plass 1, so the table works
 * like a ring (a ring buffer). Since Q.head = Q.tail means an empty queue, a
 * table with n places holds at most n − 1 elements.
 *   The table Q[1 : 12] lies in a row, plass 1 at the left, index numbers
 * under the cells. Q.head points down from above the row and Q.tail up from
 * below it, so the two never collide, also when they point at the same place.
 * A faint arrow runs from the right end, under the row, back into plass 1:
 * the table goes round. It is drawn in the accent when the last operation
 * wrapped (line 3 of Enqueue or Dequeue ran). The message («Dequeue gir 15»,
 * «overflow», «underflow») sits over the cell it is about: the cell just read,
 * the one free place, or the place both indices point at.
 *   Start state, the lecture's and CLRS 4th ed. figure 10.2(a): Q.head = 7,
 * Q.tail = 12, Q[7 : 11] = 15, 6, 9, 8, 4, the other places never written.
 * Enqueue adds 17, 3, 5 (figure 10.2(b)), then FILLER in order.
 *   The book's Enqueue and Dequeue have no overflow or underflow test. The sim
 * refuses instead of corrupting the queue: Enqueue on a full queue (11
 * elements) and Dequeue on an empty one change nothing, show the word, and
 * highlight no lines. A refused Enqueue does not use up its value.
 *   Numbers the module text uses (from the start state):
 *   - Enqueue ×1: 17 to plass 12, Q.tail wraps to 1 (arc in the accent).
 *   - Enqueue ×3: 17, 3, 5 in plass 12, 1, 2; Q.tail = 3.
 *   - Dequeue ×1: «Dequeue gir 15», Q.head = 8, the 15 stays in plass 7.
 *   - Enqueue ×6 fill the queue: 17, 3, 5, 12, 7, 19 in plass 12, 1, 2, 3, 4, 5;
 *     Q.tail = 6, Q.head = 7, 11 elements. The 7th gives «overflow» over
 *     plass 6, the one free place (never written, so blank).
 *   Code lines (block `ko-kode`): Enqueue [2, 3, 5], Enqueue that wraps
 * [2, 3, 4], Dequeue [8, 9, 11, 12], Dequeue that wraps [8, 9, 10, 12]; none
 * at rest or on a refused operation.
 *
 * Drawing language shared by every widget of the module: a table cell is a
 * rounded rect with the value in mono; an element of the structure is filled
 * (--fg 12 %), a place outside it is outline only with any stale value in
 * --faint; the element just written is pale --accent-weak with a heavy accent
 * outline (never told from --orange by hue alone); errors are the book's word
 * in --red. Colours are framework tokens only.
 *
 * Contract: make({ mode }) returns init(api) for <Simulation host="dom">, so
 * api = { stage, controls, getSize, onResize, codeBlock, signal }.
 */

/** Values pushed or enqueued after the fixed opening ones: 1..20 in a fixed shuffled order, cycled. */
const FILLER = [12, 7, 19, 4, 14, 1, 11, 20, 8, 16, 2, 13, 6, 18, 10, 3, 15, 9, 17, 5];

const STACK_SIZE = 7;
const STACK_START = [15, 6, 2, 9, 17];
const STACK_PUSHES = [3, 5, 9];

const QUEUE_SIZE = 12;
const QUEUE_HEAD = 7;
const QUEUE_START = [15, 6, 9, 8, 4]; // Q[7 : 11]
const QUEUE_ENQUEUES = [17, 3, 5];

/** The k-th value (0-based) of a sequence that opens with `first` and goes on with FILLER. */
const valueAt = (first, k) => (k < first.length ? first[k] : FILLER[(k - first.length) % FILLER.length]);

const esc = (v) =>
  String(v).replace(
    /[&<>"]/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c],
  );

const P = (v) => v.toFixed(1);

/** Type sizes in px, read from the root so the drawing follows the reader's text size. */
function typeSizes() {
  const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
  const fsSm = 0.84 * rem;
  const fsXs = 0.72 * rem;
  // IBM Plex Mono advances 0.6 em per glyph.
  const textW = (s, fs) => String(s).length * 0.6 * fs;
  return { fsSm, fsXs, textW };
}

/** A small drawing kit that appends SVG to one string. */
function kit() {
  let svg = "";
  return {
    get svg() {
      return svg;
    },
    text(x, y, str, style, anchor = "start") {
      svg +=
        `<text x="${P(x)}" y="${P(y)}" text-anchor="${anchor}" ` +
        `style="font-family:var(--font-mono);${style}">${esc(str)}</text>`;
    },
    /**
     * One table cell: "elem" (part of the structure), "new" (the element just
     * written), "out" (part of the table only). `v` null = never written.
     */
    cell(x, y, cw, ch, v, kind, fs) {
      const rx = Math.min(4, Math.min(cw, ch) * 0.16);
      // Small cells (the queue on a phone) keep room for two digits inside a heavy outline.
      const small = Math.min(cw, ch) < 28;
      const inset = small ? 1 : 1.5;
      let ink;
      if (kind === "new") {
        const sw = small ? 2 : 2.5;
        const o = inset + sw / 2;
        svg +=
          `<rect x="${P(x + o)}" y="${P(y + o)}" width="${P(cw - 2 * o)}" height="${P(ch - 2 * o)}" rx="${P(rx)}" ` +
          `style="fill:var(--accent-weak);stroke:var(--accent)" stroke-width="${sw}"/>`;
        ink = "fill:var(--accent-ink);font-weight:600";
      } else if (kind === "elem") {
        svg +=
          `<rect x="${P(x + inset)}" y="${P(y + inset)}" width="${P(cw - 2 * inset)}" height="${P(ch - 2 * inset)}" rx="${P(rx)}" ` +
          `style="fill:color-mix(in srgb, var(--fg) 12%, transparent)"/>`;
        ink = "fill:var(--fg)";
      } else {
        const o = inset + 0.5;
        svg +=
          `<rect x="${P(x + o)}" y="${P(y + o)}" width="${P(cw - 2 * o)}" height="${P(ch - 2 * o)}" rx="${P(rx)}" ` +
          `style="fill:none;stroke:var(--border-strong)" stroke-width="1"/>`;
        ink = "fill:var(--faint)";
      }
      if (v != null) {
        this.text(x + cw / 2, y + ch / 2 + fs * 0.35, v, `${ink};font-size:${fs.toFixed(2)}px`, "middle");
      }
    },
    /** A straight arrow from (x1, y1) to its tip at (x2, y2), with a small filled head. */
    arrow(x1, y1, x2, y2, color, sw = 1.5) {
      const L = Math.hypot(x2 - x1, y2 - y1) || 1;
      const ux = (x2 - x1) / L;
      const uy = (y2 - y1) / L;
      const hl = 5 + sw * 1.5;
      const hw = 2.5 + sw;
      const bx = x2 - ux * hl;
      const by = y2 - uy * hl;
      svg +=
        `<path d="M ${P(x1)} ${P(y1)} L ${P(bx + ux)} ${P(by + uy)}" style="fill:none;stroke:${color}" stroke-width="${sw}"/>` +
        `<polygon points="${P(x2)},${P(y2)} ${P(bx - uy * hw)},${P(by + ux * hw)} ${P(bx + uy * hw)},${P(by - ux * hw)}" style="fill:${color}"/>`;
    },
    raw(s) {
      svg += s;
    },
  };
}

const paint = (stage, w, h, svg) => {
  stage.innerHTML =
    `<svg width="100%" height="100%" viewBox="0 0 ${w.toFixed(0)} ${h.toFixed(0)}" ` +
    `preserveAspectRatio="none" role="img" aria-hidden="true" style="display:block">${svg}</svg>`;
};

/** Action buttons: the operations side by side, «Nullstill» on its own. */
function buttons(controls, signal, ops, onReset) {
  const row = document.createElement("div");
  row.style.cssText = "display:flex;flex-wrap:wrap;gap:var(--space-2)";
  for (const op of ops) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "sim-btn";
    b.textContent = op.label;
    b.setAttribute("aria-label", op.aria);
    b.addEventListener("click", op.run, { signal });
    row.append(b);
  }
  const reset = document.createElement("button");
  reset.type = "button";
  reset.className = "sim-btn";
  reset.textContent = "Nullstill";
  reset.setAttribute("aria-label", "Nullstill: tilbake til starttilstanden");
  reset.addEventListener("click", onReset, { signal });
  controls.append(row, reset);
}

export function make({ mode }) {
  return mode === "ko" ? initKo : initStakk;
}

// ── Stakk ───────────────────────────────────────────────────────────────────

function initStakk({ stage, controls, getSize, onResize, codeBlock, signal }) {
  const code = codeBlock?.("stakk-kode") ?? null;
  let S;
  let top;
  let pushed; // how many values Push has used from the sequence
  let last; // what the last press did, for the drawing

  const reset = () => {
    S = Array(STACK_SIZE + 1).fill(null);
    STACK_START.forEach((v, k) => (S[k + 1] = v));
    top = STACK_START.length;
    pushed = 0;
    last = null;
    code?.clear();
  };

  const push = () => {
    if (top === STACK_SIZE) {
      last = { kind: "overflow" };
      code?.setActiveLines([7, 8]);
    } else {
      top += 1;
      S[top] = valueAt(STACK_PUSHES, pushed);
      pushed += 1;
      last = { kind: "push", cell: top };
      code?.setActiveLines([7, 9, 10]);
    }
    render();
  };

  const pop = () => {
    if (top === 0) {
      last = { kind: "underflow" };
      code?.setActiveLines([13, 2, 3, 14]);
    } else {
      top -= 1;
      last = { kind: "pop", cell: top + 1, value: S[top + 1] };
      code?.setActiveLines([13, 2, 4, 15, 16]);
    }
    render();
  };

  buttons(
    controls,
    signal,
    [
      { label: "Push", aria: "Push: legg neste verdi på toppen av stakken", run: push },
      { label: "Pop", aria: "Pop: ta det øverste elementet av stakken", run: pop },
    ],
    () => {
      reset();
      render();
    },
  );

  function render() {
    const { w, h } = getSize();
    if (w <= 0 || h <= 0) {
      stage.innerHTML = "";
      return;
    }
    const { fsSm, fsXs, textW } = typeSizes();
    const k = kit();

    // Rows, bottom to top: the empty place under plass 1 (where S.top = 0
    // points), plass 1..7, and a band over plass 7 for «overflow».
    const PAD = 8;
    const FLOOR = 0.8; // in cell heights
    const BAND = 0.75;
    const ch = Math.max(18, Math.min(40, (h - 2 * PAD) / (STACK_SIZE + FLOOR + BAND)));
    const cw = Math.round(ch * 1.35);
    const contentH = (STACK_SIZE + FLOOR + BAND) * ch;
    const yTop = (h - contentH) / 2 + BAND * ch; // top edge of plass 7
    const cellY = (i) => yTop + (STACK_SIZE - i) * ch;
    // Vertical centre of row i: 1..7 are cells, 0 the floor, 8 the band.
    const midY = (i) => {
      if (i === 0) return cellY(1) + ch + (FLOOR * ch) / 2;
      if (i > STACK_SIZE) return yTop - (BAND * ch) / 2;
      return cellY(i) + ch / 2;
    };

    // Columns: index numbers, the table, the S.top arrow and the labels.
    const IDX_GAP = 7;
    const ARROW = 22;
    const leftW = textW(String(STACK_SIZE), fsXs) + IDX_GAP;
    const labelW = Math.max(
      textW(`S.top = ${STACK_SIZE}`, fsSm),
      textW("Pop gir 20", fsSm),
      textW("underflow", fsSm),
    );
    const rightW = 4 + ARROW + 6 + labelW;
    const groupW = leftW + cw + rightW;
    const xCol = Math.max(PAD + leftW, (w - groupW) / 2 + leftW);
    const xArrow = xCol + cw + 4; // arrow tip
    const xLabel = xArrow + ARROW + 6;

    const fsCell = ch >= 28 ? fsSm : fsXs;
    for (let i = 1; i <= STACK_SIZE; i++) {
      const kind = last?.kind === "push" && last.cell === i ? "new" : i <= top ? "elem" : "out";
      k.cell(xCol, cellY(i), cw, ch, S[i], kind, fsCell);
      k.text(xCol - IDX_GAP, midY(i) + fsXs * 0.35, i, "fill:var(--faint);font-size:var(--text-xs)", "end");
    }

    // S.top: an arrow from the right at plass S.top, or under plass 1 when 0.
    const yTopMark = midY(top);
    k.arrow(xArrow + ARROW, yTopMark, xArrow, yTopMark, "var(--muted)");
    k.text(xLabel, yTopMark + fsSm * 0.35, `S.top = ${top}`, "fill:var(--fg);font-size:var(--text-sm)");

    // The message, one row above the arrow: the place just passed.
    const yMsg = midY(top + 1) + fsSm * 0.35;
    if (last?.kind === "pop") {
      k.raw(
        `<text x="${P(xLabel)}" y="${P(yMsg)}" style="font-family:var(--font-mono);font-size:var(--text-sm);fill:var(--muted)">` +
          `Pop gir <tspan style="fill:var(--fg);font-weight:600">${esc(last.value)}</tspan></text>`,
      );
    } else if (last?.kind === "overflow" || last?.kind === "underflow") {
      k.text(xLabel, yMsg, last.kind, "fill:var(--red);font-size:var(--text-sm);font-weight:600");
    }

    paint(stage, w, h, k.svg);
  }

  reset();
  onResize(render);
  render();
}

// ── Kø ──────────────────────────────────────────────────────────────────────

function initKo({ stage, controls, getSize, onResize, codeBlock, signal }) {
  const code = codeBlock?.("ko-kode") ?? null;
  const N = QUEUE_SIZE;
  let Q;
  let head;
  let tail;
  let added; // how many values Enqueue has used from the sequence
  let last;

  const reset = () => {
    Q = Array(N + 1).fill(null);
    QUEUE_START.forEach((v, k) => (Q[QUEUE_HEAD + k] = v));
    head = QUEUE_HEAD;
    tail = QUEUE_HEAD + QUEUE_START.length;
    added = 0;
    last = null;
    code?.clear();
  };

  /** Is plass i an element of the queue, Q[head .. tail − 1] going round? */
  const inQueue = (i) => (head <= tail ? i >= head && i < tail : i >= head || i < tail);
  const full = () => (tail === N ? head === 1 : head === tail + 1);

  const enqueue = () => {
    if (full()) {
      last = { kind: "overflow", cell: tail };
      code?.clear();
    } else {
      const cell = tail;
      Q[cell] = valueAt(QUEUE_ENQUEUES, added);
      added += 1;
      const wrap = tail === N;
      tail = wrap ? 1 : tail + 1;
      last = { kind: "enqueue", cell, wrap };
      code?.setActiveLines(wrap ? [2, 3, 4] : [2, 3, 5]);
    }
    render();
  };

  const dequeue = () => {
    if (head === tail) {
      last = { kind: "underflow", cell: head };
      code?.clear();
    } else {
      const cell = head;
      const wrap = head === N;
      head = wrap ? 1 : head + 1;
      last = { kind: "dequeue", cell, value: Q[cell], wrap };
      code?.setActiveLines(wrap ? [8, 9, 10, 12] : [8, 9, 11, 12]);
    }
    render();
  };

  buttons(
    controls,
    signal,
    [
      { label: "Enqueue", aria: "Enqueue: sett neste verdi inn bakerst i køen", run: enqueue },
      { label: "Dequeue", aria: "Dequeue: ta ut det første elementet i køen", run: dequeue },
    ],
    () => {
      reset();
      render();
    },
  );

  function render() {
    const { w, h } = getSize();
    if (w <= 0 || h <= 0) {
      stage.innerHTML = "";
      return;
    }
    const { fsSm, fsXs, textW } = typeSizes();
    const k = kit();

    // Columns: the arc's two sides need a margin outside the row.
    const PAD = 2;
    const SIDE = 14;
    const s = Math.max(16, Math.min(44, (w - 2 * PAD - 2 * SIDE) / N));
    const xL = (w - N * s) / 2;
    const xR = xL + N * s;
    const cx = (i) => xL + (i - 0.5) * s;

    // Rows, top to bottom: message, Q.head (label, arrow), cells, index
    // numbers, Q.tail (arrow, label), the bottom of the arc.
    const ARROW = 11;
    const lhSm = fsSm * 1.25;
    const MSG = lhSm + 6;
    const HEAD = lhSm + 3 + ARROW + 3;
    const IDX = 4 + fsXs + 3;
    const TAIL = 3 + ARROW + 3 + lhSm;
    const ARC = 9;
    const contentH = MSG + HEAD + s + IDX + TAIL + ARC;
    const y0 = Math.max(PAD, (h - contentH) / 2);
    const yMsg = y0 + lhSm * 0.8;
    const yRow = y0 + MSG + HEAD; // top of the cells
    const yMid = yRow + s / 2;
    const yIdx = yRow + s + 4 + fsXs * 0.8; // baseline of the index numbers
    const yIdxBottom = yRow + s + IDX;
    const yArc = yIdxBottom + TAIL + ARC * 0.6;

    // A label centred over x, kept inside [lo, hi].
    const placed = (x, str, fs, lo, hi) => {
      const half = textW(str, fs) / 2;
      return Math.min(hi - half, Math.max(lo + half, x));
    };

    const fsCell = s >= 30 ? fsSm : fsXs;
    for (let i = 1; i <= N; i++) {
      const kind = last?.kind === "enqueue" && last.cell === i ? "new" : inQueue(i) ? "elem" : "out";
      k.cell(xL + (i - 1) * s, yRow, s, s, Q[i], kind, fsCell);
      k.text(cx(i), yIdx, i, "fill:var(--faint);font-size:var(--text-xs)", "middle");
    }

    // The ring: from the right end of plass 12, down, left under everything,
    // and up into plass 1. Accent when the last operation went round.
    const wrapped = (last?.kind === "enqueue" || last?.kind === "dequeue") && last.wrap;
    const arcColor = wrapped ? "var(--accent)" : "var(--faint)";
    const arcW = wrapped ? 2.5 : 1.5;
    const ax = SIDE - 2; // the arc's sides, outside the row
    const xa = xR + ax;
    const xb = xL - ax;
    const rT = 3; // corners level with the row
    const rB = Math.min(12, (yArc - yMid) / 2); // corners at the bottom
    const tipX = xL - 1;
    const hl = wrapped ? 7 : 6;
    const hw = wrapped ? 4.5 : 3.5;
    k.raw(
      `<path d="M ${P(xR + 1)} ${P(yMid)} H ${P(xa - rT)} Q ${P(xa)} ${P(yMid)} ${P(xa)} ${P(yMid + rT)} ` +
        `V ${P(yArc - rB)} Q ${P(xa)} ${P(yArc)} ${P(xa - rB)} ${P(yArc)} H ${P(xb + rB)} ` +
        `Q ${P(xb)} ${P(yArc)} ${P(xb)} ${P(yArc - rB)} V ${P(yMid + rT)} Q ${P(xb)} ${P(yMid)} ${P(xb + rT)} ${P(yMid)} ` +
        `H ${P(tipX - hl + 1)}" style="fill:none;stroke:${arcColor}" stroke-width="${arcW}" stroke-linejoin="round"/>`,
    );
    k.raw(
      `<polygon points="${P(tipX)},${P(yMid)} ${P(tipX - hl)},${P(yMid - hw)} ${P(tipX - hl)},${P(yMid + hw)}" style="fill:${arcColor}"/>`,
    );

    // Q.head from above, Q.tail from below.
    const headStr = `Q.head = ${head}`;
    const yHeadTip = yRow - 3;
    k.arrow(cx(head), yHeadTip - ARROW, cx(head), yHeadTip, "var(--muted)");
    k.text(placed(cx(head), headStr, fsSm, PAD, w - PAD), yHeadTip - ARROW - 4, headStr, "fill:var(--fg);font-size:var(--text-sm)", "middle");

    const tailStr = `Q.tail = ${tail}`;
    const yTailTip = yIdxBottom;
    k.arrow(cx(tail), yTailTip + ARROW, cx(tail), yTailTip, "var(--muted)");
    k.text(
      placed(cx(tail), tailStr, fsSm, xb + 8, xa - 8),
      yTailTip + ARROW + 3 + fsSm * 0.85,
      tailStr,
      "fill:var(--fg);font-size:var(--text-sm)",
      "middle",
    );

    // The message, over the cell it is about.
    if (last?.kind === "dequeue") {
      const str = `Dequeue gir ${last.value}`;
      k.raw(
        `<text x="${P(placed(cx(last.cell), str, fsSm, PAD, w - PAD))}" y="${P(yMsg)}" text-anchor="middle" ` +
          `style="font-family:var(--font-mono);font-size:var(--text-sm);fill:var(--muted)">` +
          `Dequeue gir <tspan style="fill:var(--fg);font-weight:600">${esc(last.value)}</tspan></text>`,
      );
    } else if (last?.kind === "overflow" || last?.kind === "underflow") {
      k.text(
        placed(cx(last.cell), last.kind, fsSm, PAD, w - PAD),
        yMsg,
        last.kind,
        "fill:var(--red);font-size:var(--text-sm);font-weight:600",
        "middle",
      );
    }

    paint(stage, w, h, k.svg);
  }

  reset();
  onResize(render);
  render();
}
