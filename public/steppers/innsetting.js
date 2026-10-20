/**
 * Insertion-Sort on a hand of cards, for <Stepper>, driving the block
 * `insertion-sort-bok` in modul 01. The one idea: the cards left of i are
 * always sorted. Each iteration lifts the key out, moves every larger card one
 * place to the right, and drops the key into the gap, so the sorted part grows
 * by one card. The bracket «sortert» over A[1 : i − 1] is that invariant,
 * drawn.
 *
 * Line numbers refer to that <CodeBlock> (pseudocode line k is code line k + 1),
 * the pseudocode as CLRS 4th ed. §2.1 and the lecture print it:
 *    1 Insertion-Sort(A, n)
 *    2 1  for i = 2 to n
 *    3 2      key = A[i]
 *    4 3      j = i - 1
 *    5 4      while j > 0 and A[j] > key
 *    6 5          A[j + 1] = A[j]
 *    7 6          j = j - 1
 *    8 7      A[j + 1] = key
 *
 * One frame per executed pseudocode line, plus one frame before the loop. That
 * makes the trace exactly the RAM-model count T = 5n − 4 + 3S steps long (S =
 * the number of moves on line 5), plus one: for the lecture's hand
 * 6 8 3 5 2 7 4 1 (n = 8, S = 20) that is 96 + 1 = 97 frames.
 *
 * Indices are 1-based everywhere (trace, step text, labels), as in the book and
 * the lecture. A run of the array is written A[1 : 3] in visible text, so it
 * is never read as Python's slice, which excludes its end. The variable strip
 * keeps each variable's last value, as the program's memory does; «–» means it
 * has no value yet, the lecture's «i, j, key = –, –, –».
 *
 * The drawing is the hand metaphor: the slot the key was lifted out of is drawn
 * empty (dashed, the key's height), and it moves left as cards move right. In
 * memory that slot still holds a copy of the card that last left it, until
 * pseudocode line 7 (or the next move) overwrites it.
 *
 * Colours are framework tokens only, so frames re-theme on the light/dark
 * toggle. Accent = the key; orange outline = the card compared with the key;
 * orange fill = the card just moved; green only when the whole hand is sorted.
 */

/** The lecture's hand, which the module text also opens with. */
const FIRST = [6, 8, 3, 5, 2, 7, 4, 1];

function shuffled(size) {
  const a = Array.from({ length: size }, (_, i) => i + 1);
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// The first view must be the lecture's hand (the module text describes it),
// also when the reader comes back to the page or the module mounts this
// stepper twice. The framework calls defaultData() on mount, on shuffle and on
// a size change, and it marks a figure ready just before the mount call. So a
// call while one of this module's ready figures has not drawn yet is that
// figure's first load. If that markup ever changes, this falls back to "only
// the very first call", which is what the course's ryggsekk.js does.
const SELF = new URL(import.meta.url).pathname;
const drawn = new WeakSet();
let calls = 0;
function firstLoad() {
  if (typeof document === "undefined") return false;
  for (const fig of document.querySelectorAll("[data-stepper-src]")) {
    if (new URL(fig.dataset.stepperSrc, location.href).pathname !== SELF) continue;
    const stage = fig.querySelector(".stepper-stage");
    if (fig.dataset.ready === "true" && stage && !drawn.has(stage)) return true;
  }
  return false;
}

const FONT = "font-family:var(--font-mono)";
const XS = `${FONT};font-size:var(--text-xs)`;
const SM = `${FONT};font-size:var(--text-sm);font-weight:600`;

/** Card styles: fill, outline and value colour. */
const CARD = {
  plain: { fill: "color-mix(in srgb, var(--fg) 9%, transparent)", stroke: "color-mix(in srgb, var(--fg) 28%, transparent)", wdt: 1, text: "var(--fg)" },
  compared: { fill: "color-mix(in srgb, var(--fg) 9%, transparent)", stroke: "var(--orange)", wdt: 2.5, text: "var(--fg)" },
  moved: { fill: "color-mix(in srgb, var(--orange) 34%, transparent)", stroke: "var(--orange)", wdt: 1.5, text: "var(--fg)" },
  key: { fill: "color-mix(in srgb, var(--accent) 16%, transparent)", stroke: "var(--accent)", wdt: 2, text: "var(--accent-ink)" },
  done: { fill: "color-mix(in srgb, var(--green) 26%, transparent)", stroke: "var(--green)", wdt: 1.5, text: "var(--fg)" },
};

const f1 = (v) => v.toFixed(1);

export default {
  sizeRange: { min: 4, max: 10, default: 8 },
  defaultData(size = 8) {
    if (calls++ === 0 || firstLoad()) return [...FIRST];
    return shuffled(size);
  },

  run(input) {
    const A = [...input];
    const n = A.length;
    const lo = Math.min(...A);
    const hi = Math.max(...A);
    const frames = [];
    let vi = "–";
    let vj = "–";
    let vkey = "–";
    // Moves on line 5, quoted on the last frame so the reader can check
    // T + 1 = 5n − 3 + 3S against the step counter on any hand.
    let S = 0;
    // `sorted` = k draws the bracket over A[1 : k]. Pointers and slots are
    // 1-based; null hides them.
    const snap = (line, desc, extra) =>
      frames.push({
        line,
        desc,
        vars: { i: vi, j: vj, key: vkey },
        A: [...A],
        n,
        lo,
        hi,
        ...extra,
      });

    snap(2, `A[1\u00a0:\u00a01] er sortert, siden ett kort alene alltid er sortert.`, { sorted: 1 });

    for (let i = 2; i <= n; i++) {
      vi = i;
      snap(2, `i = ${i}. A[1\u00a0:\u00a0${i - 1}] er sortert.`, { sorted: i - 1, i });

      const key = A[i - 1];
      vkey = key;
      let gap = i;
      snap(3, `key = A[${i}] = ${key}. Kortet løftes ut, og plassen blir ledig.`, {
        sorted: i - 1,
        i,
        gap,
        key,
      });

      let j = i - 1;
      vj = j;
      snap(4, `j = ${j}.`, { sorted: i - 1, i, j, gap, key });

      let moved = null;
      for (;;) {
        if (j > 0 && A[j - 1] > key) {
          snap(5, `A[${j}] = ${A[j - 1]} er større enn key = ${key}.`, {
            sorted: i - 1, i, j, gap, key, moved, compared: j,
          });
        } else {
          snap(
            5,
            j > 0
              ? `A[${j}] = ${A[j - 1]} er ikke større enn key = ${key}, så while-løkka stopper.`
              : `j = 0. Det er ingen kort igjen til venstre, så while-løkka stopper.`,
            { sorted: i - 1, i, j, gap, key, moved, compared: j > 0 ? j : null },
          );
          break;
        }

        A[j] = A[j - 1];
        S += 1;
        gap = j;
        moved = j + 1;
        snap(6, `A[${j + 1}] = A[${j}]. Kortet ${A[j]} flyttes én plass til høyre.`, {
          sorted: i - 1, i, j, gap, key, moved,
        });

        j -= 1;
        vj = j;
        snap(7, `j = ${j}.`, { sorted: i - 1, i, j, gap, key, moved });
      }

      A[j] = key;
      snap(8, `A[${j + 1}] = key = ${key}. A[1\u00a0:\u00a0${i}] er sortert.`, {
        sorted: i, i, j, placed: j + 1,
      });
    }

    vi = n + 1;
    snap(2, `i = ${n + 1} er større enn n = ${n}, så for-løkka er ferdig. Hele A[1\u00a0:\u00a0${n}] er sortert, og kortene flyttet seg ${S} ${S === 1 ? "gang" : "ganger"}.`, {
      sorted: n,
      done: true,
    });

    return frames;
  },

  render(stage, f, api) {
    drawn.add(stage);
    const { w, h } = api.getSize();
    const n = f.n;
    if (!n || w <= 0 || h <= 0) {
      stage.innerHTML = "";
      return;
    }

    // Vertical bands, top to bottom: the bracket «sortert», the lifted key,
    // the cards on their baseline, the index row, the pointer row (i, j).
    const BR_Y = 20; // bracket line
    const KEY_Y = 31; // top of the key box
    const KEY_H = 27;
    const CARD_TOP = KEY_Y + KEY_H + 7;
    const base = h - 40;
    const IDX_Y = base + 16;
    const PTR_Y = base + 34;
    const H = Math.max(40, base - CARD_TOP);
    const MIN_H = 27; // room for the value on the shortest card

    // Horizontal: a left gutter where «j» stands when j = 0, then n slots.
    const GUT_L = 16;
    const PAD_R = 4;
    const slot = Math.min(72, (w - GUT_L - PAD_R) / n);
    const x0 = Math.max(GUT_L, (w - slot * n) / 2);
    const sep = Math.max(3, slot * 0.14);
    const cw = slot - sep;
    const left = (k) => x0 + (k - 1) * slot + sep / 2;
    const mid = (k) => x0 + (k - 0.5) * slot;
    const span = f.hi - f.lo;
    const height = (v) => MIN_H + (span > 0 ? ((v - f.lo) / span) * (H - MIN_H) : H - MIN_H);

    // Two-digit values on narrow cards (n = 10 on a phone) drop to --text-xs.
    const VAL = cw < 24 ? `${FONT};font-size:var(--text-xs);font-weight:600` : SM;

    let svg = "";
    const text = (x, y, s, style, anchor = "middle") =>
      (svg += `<text x="${f1(x)}" y="${f1(y)}" text-anchor="${anchor}" style="${style}">${s}</text>`);
    const box = (x, y, wd, ht, st, dash = false) =>
      (svg +=
        `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(wd)}" height="${f1(ht)}" rx="4" ` +
        `style="fill:${st.fill};stroke:${st.stroke}" stroke-width="${st.wdt}"` +
        `${dash ? ' stroke-dasharray="4 3"' : ""}/>`);

    // The sorted part A[1 : sorted]: the invariant, drawn.
    if (f.sorted) {
      const a = left(1) - 1;
      const b = left(f.sorted) + cw + 1;
      const tick = 7;
      svg +=
        `<path d="M ${f1(a)} ${BR_Y + tick} V ${BR_Y} H ${f1(b)} V ${BR_Y + tick}" fill="none" ` +
        `stroke="${f.done ? "var(--green)" : "var(--fg)"}" stroke-width="1.5"/>`;
      const lw = 7 * 7.5; // «sortert», 7 mono glyphs at --text-xs
      const cx = Math.min(w - lw / 2 - 2, Math.max(lw / 2 + 2, (a + b) / 2));
      text(cx, BR_Y - 6, "sortert", `fill:var(--fg);${XS}`);
    }

    // Baseline under the whole row.
    svg +=
      `<line x1="${f1(left(1) - 4)}" y1="${f1(base)}" x2="${f1(left(n) + cw + 4)}" y2="${f1(base)}" ` +
      `stroke="var(--border-strong)" stroke-width="1"/>`;

    for (let k = 1; k <= n; k++) {
      const x = left(k);
      if (f.gap === k) {
        // The empty slot, as tall as the key that will drop into it.
        const ht = height(f.key);
        box(x, base - ht, cw, ht, { fill: "none", stroke: "var(--accent)", wdt: 1.5 }, true);
      } else {
        const v = f.A[k - 1];
        let st = CARD.plain;
        if (f.done) st = CARD.done;
        else if (f.placed === k) st = CARD.key;
        else if (f.moved === k) st = CARD.moved;
        else if (f.compared === k) st = CARD.compared;
        const ht = height(v);
        box(x, base - ht, cw, ht, st);
        text(x + cw / 2, base - ht + 18, v, `fill:${st.text};${VAL}`);
      }
      text(mid(k), IDX_Y, k, `fill:var(--faint);${XS}`);
    }

    // The key, lifted out and held over the empty slot it will drop into.
    if (f.gap != null) {
      const cx = mid(f.gap);
      const kw = Math.max(cw, 30);
      const bx = Math.min(w - kw - 1, Math.max(1, cx - kw / 2));
      box(bx, KEY_Y, kw, KEY_H, CARD.key);
      text(bx + kw / 2, KEY_Y + 19, f.key, `fill:${CARD.key.text};${VAL}`);
      // Name it «key», on whichever side has room.
      const lw = 3 * 7.5;
      if (bx - 6 - lw >= 0) text(bx - 6, KEY_Y + 18, "key", `fill:var(--accent-ink);${XS}`, "end");
      else text(bx + kw + 6, KEY_Y + 18, "key", `fill:var(--accent-ink);${XS}`, "start");
    }

    // Pointer names under their positions; j = 0 stands left of card 1.
    if (f.i != null && f.i <= n) text(mid(f.i), PTR_Y, "i", `fill:var(--muted);${SM}`);
    if (f.j != null) {
      const x = f.j >= 1 ? mid(f.j) : Math.max(7, mid(1) - slot);
      text(x, PTR_Y, "j", `fill:var(--accent);${SM}`);
    }

    stage.innerHTML =
      `<svg width="100%" height="100%" viewBox="0 0 ${w.toFixed(0)} ${h.toFixed(0)}" ` +
      `preserveAspectRatio="none" role="img" aria-hidden="true" style="display:block">${svg}</svg>`;
  },
};
