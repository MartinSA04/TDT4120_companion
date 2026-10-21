/**
 * Insertion-Sort as decomposition, for <Stepper>, driving the block
 * `innsetting-rekursiv-kode` in modul 03. The one idea: sorting A[1 : n] is
 * reduced to sorting the smaller instance A[1 : n − 1] and inserting one
 * element. The same happens on every level down to one element, which is
 * already sorted, and then the answers come back up. All the work (every
 * move) happens on the way up.
 *
 * The drawing is the lecture's ladder (lecture 2b, «dekomponering»: the
 * general ladder on slides 124–135, Insertion-Sort on it on slides 138–154,
 * «Kutt av siste element», «Sett inn siste element», «alt arbeidet ligger i
 * løsningsbyggingen»): one row per level, the whole instance at the top. The left column
 * holds the instances A[1 : m] as the call with n = m receives them, the right
 * column the answers, the sorted A[1 : m], once that call has returned. Arrows
 * run down the left column («kutt av siste»: the call hands A[1 : m − 1] to
 * itself), across the bottom row («grunntilfelle»: one element is its own
 * answer) and up the right column («sett inn»: the call inserts A[m] into the
 * answer from the row below). An arrow the trace has not used yet is drawn
 * faint and dashed, so the reader sees the whole route from the first frame.
 *
 * Block line numbers count the header as line 1 (pseudocode line k is block
 * line k + 1):
 *    1 Insertion-Sort-Rec(A, n)
 *    2 1  if n > 1
 *    3 2      Insertion-Sort-Rec(A, n - 1)
 *    4 3      key = A[n]
 *    5 4      j = n - 1
 *    6 5      while j > 0 and A[j] > key
 *    7 6          A[j + 1] = A[j]
 *    8 7          j = j - 1
 *    9 8      A[j + 1] = key
 *
 * Frames: the start (line 1), one per call going down (lines 2–3), the base
 * case (line 2, n = 1), two per insertion going up (lines 4–5: the answer
 * from below comes up and key = A[n] is set aside; lines 6–9, or 6 and 9 when
 * nothing moves: key in its place), and the end (line 1, the top call
 * returns). That is 3n frames. For the lecture's 4 2 1 3 (n = 4, slide 154):
 * 12 frames; the insertions move 1, 2 and 1 elements (4 moves in all) and
 * the answers are 4 | 2 4 | 1 2 4 | 1 2 3 4.
 *
 * The cells are module 01's cards (innsetting.js): the height follows the
 * value and the value stands at the top, so a sorted row reads as a rising
 * staircase. The key set aside stands a third of a slot right of its place,
 * named «key», as the lecture shows «1 2 4 3» before the 3 is inserted. Each
 * arrow kind is named once, on the first arrow of that kind the trace uses.
 *
 * Size: 3–5 elements. At 5 a phone's stage (about 276 px wide) gives cards
 * about 17 px wide with the value in --text-xs; 6 would need narrower cards
 * than that, and more height than the 340 px stage has. Indices are 1-based in every visible text, and a run of the
 * array is written A[1 : 3], as the lecture does. The variable strip shows
 * the running call's n and key; «–» means that call has no key yet.
 *
 * Colours are framework tokens only, so frames re-theme on the light/dark
 * toggle. Accent = what this step works on: the arrow just used, the running
 * call's «n = …», the key (pale accent fill, accent outline) and, while it is
 * set aside, the instance cell it came from. Solid orange = an element that
 * moved one place to the right in this insertion. Green = the finished
 * answer, on the last frame only.
 */

/** The lecture's instance (slide 154), which the module text also uses. */
const FIRST = [4, 2, 1, 3];

/** `size` distinct values from 1–9 in random order. */
function dealt(size) {
  const a = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a.slice(0, size);
}

// The first view must be the lecture's instance (the module text describes
// it), also when the reader comes back to the page. Same detection as
// innsetting.js: a call while one of this module's ready figures has not drawn
// yet is that figure's first load; otherwise only the very first call.
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

const NB = " ";
const run_ = (a, b) => `A[${a}${NB}:${NB}${b}]`;
/** «4», «2 og 4», «1, 2 og 4». */
const og = (xs) => (xs.length < 2 ? xs.join("") : `${xs.slice(0, -1).join(", ")} og ${xs[xs.length - 1]}`);
const list = (xs) => xs.join(", ");

const FONT = "font-family:var(--font-mono)";

/** Card styles as in innsetting.js: fill, outline, outline width, value colour. */
const CARD = {
  plain: { fill: "color-mix(in srgb, var(--fg) 9%, transparent)", stroke: "color-mix(in srgb, var(--fg) 28%, transparent)", wdt: 1, text: "var(--fg)" },
  moved: { fill: "color-mix(in srgb, var(--orange) 34%, transparent)", stroke: "var(--orange)", wdt: 1.5, text: "var(--fg)" },
  key: { fill: "color-mix(in srgb, var(--accent) 16%, transparent)", stroke: "var(--accent)", wdt: 2, text: "var(--accent-ink)" },
  placed: { fill: "color-mix(in srgb, var(--accent) 16%, transparent)", stroke: "var(--accent)", wdt: 2.6, text: "var(--accent-ink)" },
  done: { fill: "color-mix(in srgb, var(--green) 26%, transparent)", stroke: "var(--green)", wdt: 1.5, text: "var(--fg)" },
};

/** Arrow styles: not used yet, used, used in this step. */
const ARROW = {
  todo: { stroke: "var(--border-strong)", wdt: 1.2, head: 6, dash: "3 3", ink: null },
  used: { stroke: "var(--muted)", wdt: 1.5, head: 7, ink: "var(--muted)" },
  now: { stroke: "var(--accent)", wdt: 2.4, head: 9, ink: "var(--accent-ink)" },
};

const f1 = (v) => v.toFixed(1);

export default {
  sizeRange: { min: 3, max: 5, default: 4 },
  defaultData(size = 4) {
    if (calls++ === 0 || firstLoad()) return [...FIRST];
    return dealt(size);
  },

  run(input) {
    const A = [...input];
    const N = A.length;
    const lo = Math.min(...A);
    const hi = Math.max(...A);
    const frames = [];

    // inst[m]: the instance of the call with n = m, as that call receives it.
    // ans[m]: that call's answer row, as cells { v, st, aside }.
    const inst = Array(N + 1).fill(null);
    const ans = Array(N + 1).fill(null);
    let level = N; // the running call's n
    let down = N; // lowest instance row reached (arrows N → down used)
    let base = false; // base arrow used
    let up = 1; // highest answer row reached by an up arrow
    let now = null; // the arrow this step uses: { kind, m }
    let keyFrom = null; // instance row whose last cell is the key, while it is set aside
    let vkey = "–";
    let S = 0; // moves, for the last frame

    const snap = (line, desc, extra = {}) =>
      frames.push({
        line,
        desc,
        vars: { n: level, key: vkey },
        N,
        lo,
        hi,
        level,
        down,
        base,
        up,
        now,
        keyFrom,
        inst: inst.map((r) => (r ? [...r] : null)),
        ans: ans.map((r) => (r ? r.map((c) => ({ ...c })) : null)),
        ...extra,
      });

    inst[N] = A.slice(0, N);
    snap(1, `Insertion-Sort-Rec(A, ${N}) skal sortere instansen ${run_(1, N)} = ${list(A)}.`);

    for (let m = N; m >= 2; m--) {
      level = m;
      inst[m - 1] = A.slice(0, m - 1);
      down = m - 1;
      now = { kind: "down", m };
      snap(
        [2, 3],
        `n = ${m} er større enn 1, så kallet lar Insertion-Sort-Rec(A, ${m - 1}) sortere delinstansen ${run_(1, m - 1)} først. Ingen elementer flyttes.`,
      );
    }

    level = 1;
    base = true;
    now = { kind: "base", m: 1 };
    ans[1] = [{ v: A[0], st: "plain" }];
    snap(
      2,
      `n = 1 er grunntilfellet. Testen n > 1 er usann, så kallet gjør ingenting. Ett element er alltid sortert, så ${run_(1, 1)} = ${A[0]} er allerede svaret.`,
    );

    for (let m = 2; m <= N; m++) {
      // The row below is finished: its marks belong to its own insertion.
      ans[m - 1] = ans[m - 1].map((c) => ({ v: c.v, st: "plain" }));
      level = m;
      up = m;
      now = { kind: "up", m };
      const key = A[m - 1];
      vkey = key;
      keyFrom = m;
      ans[m] = [...A.slice(0, m - 1).map((v) => ({ v, st: "plain" })), { v: key, st: "key", aside: true }];
      snap(
        [4, 5],
        `Kallet med n = ${m} får delsvaret ${run_(1, m - 1)} = ${list(A.slice(0, m - 1))} tilbake. key = A[${m}] = ${key} skal settes inn i delsvaret.`,
      );

      // The insertion, lines 5–8 of the pseudocode (0-based j here is the
      // book's j − 1).
      let j = m - 2;
      const moved = [];
      while (j >= 0 && A[j] > key) {
        A[j + 1] = A[j];
        moved.push(A[j]);
        j -= 1;
      }
      A[j + 1] = key;
      S += moved.length;
      const pos = j + 1; // 0-based place of the key
      now = null;
      keyFrom = null;
      ans[m] = A.slice(0, m).map((v, k) => ({ v, st: k === pos ? "placed" : k > pos ? "moved" : "plain" }));
      const sorted = `${run_(1, m)} = ${list(A.slice(0, m))} er sortert.`;
      snap(
        moved.length ? [6, 7, 8, 9] : [6, 9],
        moved.length
          ? `${og(moved.reverse())} er større enn key = ${key} og flyttes én plass til høyre. key settes inn på plass ${pos + 1}. ${sorted}`
          : `Ingen elementer er større enn key = ${key}, så key blir stående på plass ${m}. ${sorted}`,
      );
    }

    level = N;
    ans[N] = A.map((v) => ({ v, st: "done" }));
    const tally =
      S === 0
        ? "Ingen elementer flyttet seg, fordi hver key var større enn alt foran den."
        : `Elementene flyttet seg ${S} ${S === 1 ? "gang" : "ganger"}, alle i innsettingene på vei opp.`;
    snap(1, `Insertion-Sort-Rec(A, ${N}) er ferdig, og hele ${run_(1, N)} = ${list(A)} er sortert. ${tally}`, {
      done: true,
    });

    return frames;
  },

  render(stage, f, api) {
    drawn.add(stage);
    const { w, h } = api.getSize();
    const N = f.N;
    if (!N || w <= 0 || h <= 0) {
      stage.innerHTML = "";
      return;
    }

    // Type sizes in px, read from the root so the layout follows the reader's
    // text size. IBM Plex Mono advances 0.6 em per glyph.
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    const fsSm = 0.84 * rem;
    const fsXs = 0.72 * rem;
    const textW = (s, fs) => s.length * 0.6 * fs;
    const XS = `${FONT};font-size:var(--text-xs)`;
    const SM = `${FONT};font-size:var(--text-sm);font-weight:600`;

    // Horizontal, left to right: the down rail, the instance column (N
    // slots), the «n = …» labels, the up rail, the answer column (N slots and
    // room for the key set aside). Slots follow the stage width, capped.
    const PADX = 2;
    const RAIL = 11; // a rail's arrow stands this far left of its column
    const MID = textW("n = 5", fsXs) + 12;
    const ASIDE = 0.3; // the key set aside, in slots
    const s = Math.min(38, (w - 2 * PADX - 2 * RAIL - MID) / (2 * N + ASIDE));
    const sep = Math.max(3, s * 0.14);
    const cw = s - sep;
    const totalW = 2 * RAIL + MID + (2 * N + ASIDE) * s;
    const xL = (w - totalW) / 2 + RAIL; // instance slot 1
    const xR = xL + N * s + MID + RAIL; // answer slot 1
    const midX = xL + N * s + MID / 2;

    // Vertical: the column titles, then N rows (m = N at the top) with a gap
    // between rows for the rail arrows and their names, then room under the
    // bottom row for «grunntilfelle». Cards stand on their row's floor.
    const HEAD = fsSm + 10;
    const FOOT = fsXs + 6;
    const MIN_H = Math.round(fsSm * 1.9);
    const avail = h - 8 - HEAD - FOOT;
    // The tallest card: as tall as the rows allow with the smallest gap,
    // capped so a card stays card-shaped; the rest of the height goes to the
    // gaps, capped too, and what is left centres the block.
    const G_MIN = fsXs + 14;
    const B = Math.max(MIN_H + 6, Math.min(58, Math.max(MIN_H + 10, 2.4 * cw), (avail - (N - 1) * G_MIN) / N));
    const G = N > 1 ? Math.max(G_MIN, Math.min(34, (avail - N * B) / (N - 1))) : 0;
    const blockH = HEAD + N * B + (N - 1) * G + FOOT;
    const top = Math.max(4, (h - blockH) / 2);
    const rowTop = (m) => top + HEAD + (N - m) * (B + G);
    const floor = (m) => rowTop(m) + B;
    const rung = (m) => floor(m) - MIN_H / 2;
    const span = f.hi - f.lo;
    const height = (v) => MIN_H + (span > 0 ? ((v - f.lo) / span) * (B - MIN_H) : B - MIN_H);
    const VAL = cw < 18 ? `${FONT};font-size:var(--text-xs);font-weight:600` : SM;
    const valDy = Math.min(18, MIN_H - 7);

    let svg = "";
    const text = (x, y, s, style, anchor = "middle") =>
      (svg += `<text x="${f1(x)}" y="${f1(y)}" text-anchor="${anchor}" style="${style}">${s}</text>`);
    // A card on row m's floor; `named` writes «key» over it.
    const card = (x, m, v, st, named = false) => {
      const ht = height(v);
      const y = floor(m) - ht;
      if (named) text(x + cw / 2, y - 6, "key", `fill:var(--accent-ink);${XS}`);
      svg +=
        `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(cw)}" height="${f1(ht)}" rx="4" ` +
        `style="fill:${st.fill};stroke:${st.stroke}" stroke-width="${st.wdt}"/>`;
      text(x + cw / 2, y + valDy, v, `fill:${st.text};${VAL}`);
    };
    const arrow = (x1, y1, x2, y2, st) => {
      const L = Math.hypot(x2 - x1, y2 - y1) || 1;
      const ux = (x2 - x1) / L;
      const uy = (y2 - y1) / L;
      const hl = st.head;
      const hw = hl * 0.5;
      const bx = x2 - ux * hl;
      const by = y2 - uy * hl;
      const ex = x2 - ux * (hl - 1);
      const ey = y2 - uy * (hl - 1);
      const dash = st.dash ? ` stroke-dasharray="${st.dash}"` : "";
      svg +=
        `<path d="M${f1(x1)} ${f1(y1)} L${f1(ex)} ${f1(ey)}" fill="none" style="stroke:${st.stroke}" stroke-width="${st.wdt}"${dash}/>` +
        `<polygon points="${f1(x2)},${f1(y2)} ${f1(bx - uy * hw)},${f1(by + ux * hw)} ${f1(bx + uy * hw)},${f1(by - ux * hw)}" style="fill:${st.stroke}"/>`;
    };
    const isNow = (kind, m) => f.now && f.now.kind === kind && f.now.m === m;

    // Column titles.
    text(xL, top + fsSm, "instans", `fill:var(--fg);${SM}`, "start");
    text(xR, top + fsSm, "svar", `fill:var(--fg);${SM}`, "start");

    // Down the left rail: from the call with n = m to the call with n = m − 1.
    const railL = xL - RAIL + 3;
    const railR = xR - RAIL + 3;
    const gapMid = (m) => floor(m) + G / 2 + 0.35 * fsXs; // label baseline in the gap under row m
    for (let m = N; m >= 2; m--) {
      const st = isNow("down", m) ? ARROW.now : m > f.down ? ARROW.used : ARROW.todo;
      arrow(railL, rung(m) + 5, railL, rung(m - 1) - 5, st);
      if (st.ink && m === N) text(railL + 7, gapMid(m), "kutt av siste", `fill:${st.ink};${XS}`, "start");
    }
    // Up the right rail: from the answer of n = m − 1 to the call with n = m.
    for (let m = 2; m <= N; m++) {
      const st = isNow("up", m) ? ARROW.now : m <= f.up ? ARROW.used : ARROW.todo;
      arrow(railR, rung(m - 1) - 5, railR, rung(m) + 5, st);
      if (st.ink && m === 2) text(railR + 7, gapMid(m), "sett inn", `fill:${st.ink};${XS}`, "start");
    }
    // Across the bottom row: one element is its own answer.
    {
      const st = isNow("base", 1) ? ARROW.now : f.base ? ARROW.used : ARROW.todo;
      const x1 = xL + sep / 2 + cw + 4;
      const x2 = xR + sep / 2 - 4;
      arrow(x1, rung(1), x2, rung(1), st);
      if (st.ink) text((x1 + x2) / 2, rung(1) + fsXs + 3, "grunntilfelle", `fill:${st.ink};${XS}`);
    }

    // The rows: instance, «n = m», answer.
    for (let m = N; m >= 1; m--) {
      const r = f.inst[m];
      const lab = `n = ${m}`;
      let ink = "var(--faint)";
      let weight = "";
      if (m === f.level && !f.done) {
        ink = "var(--accent-ink)";
        weight = ";font-weight:600";
      } else if (r) ink = "var(--muted)";
      text(midX, rung(m) - 5, lab, `fill:${ink};${XS}${weight}`);
      if (r) {
        r.forEach((v, k) => {
          const st = f.keyFrom === m && k === m - 1 ? CARD.key : CARD.plain;
          card(xL + k * s + sep / 2, m, v, st);
        });
      }
      const a = f.ans[m];
      if (a) {
        a.forEach((c, k) => {
          const x = xR + k * s + sep / 2 + (c.aside ? ASIDE * s : 0);
          card(x, m, c.v, CARD[c.st], !!c.aside);
        });
      }
    }

    stage.innerHTML =
      `<svg width="100%" height="100%" viewBox="0 0 ${w.toFixed(0)} ${h.toFixed(0)}" ` +
      `preserveAspectRatio="none" role="img" aria-hidden="true" style="display:block">${svg}</svg>`;
  },
};
