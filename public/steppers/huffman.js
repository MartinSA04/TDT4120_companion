/**
 * Huffman trace for <Stepper>, driving the Python block `huffman` in modul 07.
 * The stage is the min-priority queue Q drawn as a forest, sorted by
 * frequency with the lowest to the left, as in the book's figure: leaves are
 * boxes with character and frequency, internal nodes circles with the sum of
 * the frequencies below them. Each iteration first marks the two trees
 * Extract-Min returns (orange), then shows the new node z (accent) back in the
 * queue. At the end the edges get 0 and 1, the codewords appear under the
 * leaves, and the leaves turn green.
 *
 * Ties are broken the way the Python breaks them: the queue holds
 * (freq, tie, tree) tuples, so of two equal frequencies the one that entered
 * the queue first comes out first.
 *
 * Line numbers refer to that <CodeBlock>:
 *    1 import heapq
 *    2 from itertools import count
 *    3
 *    4 def huffman(C):
 *    5     tie = count()
 *    6     Q = [(freq, next(tie), c) for c, freq in C.items()]
 *    7     heapq.heapify(Q)
 *    8     for i in range(1, len(C)):
 *    9         fx, _, x = heapq.heappop(Q)
 *   10         fy, _, y = heapq.heappop(Q)
 *   11         z = (x, y)
 *   12         heapq.heappush(Q, (fx + fy, next(tie), z))
 *   13     return Q[0][2]
 *   14
 *   15 def codes(T, prefix=""):
 *   16     if isinstance(T, str):
 *   17         return {T: prefix}
 *   18     return codes(T[0], prefix + "0") | codes(T[1], prefix + "1")
 *
 * Colours are framework tokens only, so frames re-theme on the light/dark
 * toggle without the module knowing which theme is active.
 */

const esc = (v) =>
  String(v).replace(
    /[&<>"]/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c],
  );

// The lecture's example: A:5 B:9 C:12 D:13 E:16 F:35.
const FIRST = [5, 9, 12, 13, 16, 35];

let calls = 0;

function sample(size) {
  return Array.from({ length: size }, () => 4 + Math.floor(Math.random() * 27));
}

const LETTERS = "ABCDEFG";

const STYLE = {
  plain: { fill: "none", stroke: "var(--border)", text: "var(--fg)" },
  pick: { fill: "color-mix(in srgb, var(--orange) 18%, transparent)", stroke: "var(--orange)", text: "var(--fg)", wdt: 2 },
  made: { fill: "var(--accent-weak)", stroke: "var(--accent)", text: "var(--accent-ink)", wdt: 2 },
  coded: { fill: "color-mix(in srgb, var(--green) 16%, transparent)", stroke: "var(--green)", text: "var(--fg)", wdt: 1.6 },
};

const FONT = "font-family:var(--font-mono);font-size:var(--text-xs)";

const name = (t) => (t.ch ? `${t.ch}:${t.freq}` : String(t.freq));
const height = (t) => (t.ch ? 0 : 1 + Math.max(height(t.left), height(t.right)));
const leaves = (t) => (t.ch ? [t] : [...leaves(t.left), ...leaves(t.right)]);

export default {
  sizeRange: { min: 4, max: 7, default: 6 },
  // The first queue is the lecture's example; after that, random frequencies.
  defaultData(size = 6) {
    if (calls++ === 0 && size === FIRST.length) return FIRST;
    return sample(size);
  },

  run(input) {
    const freqs = [...input];
    const n = freqs.length;
    let tie = 0;
    let Q = freqs.map((f, i) => ({ freq: f, tie: tie++, tree: { ch: LETTERS[i], freq: f, id: i } }));
    const order = () => [...Q].sort((a, b) => a.freq - b.freq || a.tie - b.tie);

    // Run once to fix the height of the final tree, so the layout never rescales.
    let H = 0;
    {
      let q = Q.map((e) => ({ ...e }));
      let t = tie;
      for (let i = 1; i < n; i++) {
        q.sort((a, b) => a.freq - b.freq || a.tie - b.tie);
        const [x, y] = q.splice(0, 2);
        q.push({ freq: x.freq + y.freq, tie: t++, tree: { left: x.tree, right: y.tree, freq: x.freq + y.freq } });
      }
      H = height(q[0].tree);
    }

    const frames = [];
    let nextId = n;
    const snap = (line, desc, vars, extra = {}) =>
      frames.push({ line, desc, vars, n, H, forest: order().map((e) => e.tree), phase: "build", ...extra });

    snap(
      [5, 6, 7],
      `Q = C: én løvnode per tegn i en min-prioritetskø på frekvens. Køen er tegnet sortert, med lavest frekvens til venstre.`,
      { "len(Q)": n },
    );

    const merged = [];
    for (let i = 1; i < n; i++) {
      const [ex, ey] = order().slice(0, 2);
      snap(
        [9, 10],
        `Runde ${i} av ${n - 1}: Extract-Min to ganger gir de to trærne med lavest frekvens, x = ${name(ex.tree)} og y = ${name(ey.tree)}.`,
        { i, fx: ex.freq, fy: ey.freq },
        { pick: [ex.tree.id, ey.tree.id] },
      );
      const z = { left: ex.tree, right: ey.tree, freq: ex.freq + ey.freq, id: nextId++ };
      merged.push(z.freq);
      Q = Q.filter((e) => e !== ex && e !== ey);
      Q.push({ freq: z.freq, tie: tie++, tree: z });
      snap(
        [11, 12],
        `z får x som venstre barn og y som høyre, og frekvensen ${ex.freq} + ${ey.freq} = ${z.freq}. z settes inn i køen, som nå har ${Q.length} ${Q.length === 1 ? "tre" : "trær"}.`,
        { i, "fx + fy": z.freq, "len(Q)": Q.length },
        { made: z.id },
      );
    }

    const T = Q[0].tree;
    snap(
      13,
      `Etter n − 1 = ${n - 1} sammenslåinger er ett tre igjen i køen. Det er kodetreet, og rota har frekvensen ${T.freq}, summen av alle.`,
      { "len(Q)": 1 },
    );

    const codes = new Map();
    const walk = (t, p) => {
      if (t.ch) codes.set(t.ch, p);
      else {
        walk(t.left, p + "0");
        walk(t.right, p + "1");
      }
    };
    walk(T, "");
    const ls = leaves(T);
    snap(
      [15, 16, 17, 18],
      `codes(T): 0 er venstre og 1 er høyre. Kodeordet til et tegn er stien fra rota, så lengden er dybden. ${ls
        .map((l) => `${l.ch} = ${codes.get(l.ch)}`)
        .join(", ")}.`,
      {},
      { phase: "codes", codes: Object.fromEntries(codes) },
    );

    const terms = [...ls].sort((a, b) => a.ch.localeCompare(b.ch));
    const B = terms.reduce((s, l) => s + l.freq * codes.get(l.ch).length, 0);
    snap(
      [],
      `B(T) = ${terms.map((l) => `${l.freq}·${codes.get(l.ch).length}`).join(" + ")} = ${B}. Det er også summen av frekvensene i de indre nodene, ${merged.join(" + ")} = ${B}.`,
      {},
      { phase: "codes", codes: Object.fromEntries(codes) },
    );

    return frames;
  },

  render(stage, frame, api) {
    const { w, h } = api.getSize();
    const { n, H, forest } = frame;
    if (!n || w <= 0 || h <= 0) {
      stage.innerHTML = "";
      return;
    }

    const PAD = 4;
    const BOX_H = 22;
    const R = 13;
    const coded = frame.phase === "codes";
    // Room for the codeword under the deepest leaf, kept in every frame so the
    // layout does not move when the codes appear.
    const CODE_H = 16;
    const colW = (w - 2 * PAD) / n;
    const boxW = Math.min(colW - 6, 46);
    const top = R + 2;
    const bottom = h - CODE_H - BOX_H / 2 - 4;
    const levelH = H > 0 ? Math.min(56, (bottom - top) / H) : 0;

    // Leaves take consecutive columns in queue order; a parent sits midway.
    const pos = new Map();
    let col = 0;
    const place = (t, depth) => {
      if (t.ch) {
        pos.set(t, { x: PAD + colW * (col + 0.5), y: top + depth * levelH });
        col += 1;
      } else {
        place(t.left, depth + 1);
        place(t.right, depth + 1);
        const a = pos.get(t.left);
        const b = pos.get(t.right);
        pos.set(t, { x: (a.x + b.x) / 2, y: top + depth * levelH });
      }
    };
    for (const t of forest) place(t, 0);

    const pick = new Set(frame.pick || []);
    const styleOf = (t) => {
      if (coded && t.ch) return STYLE.coded;
      if (pick.has(t.id)) return STYLE.pick;
      if (frame.made === t.id) return STYLE.made;
      return STYLE.plain;
    };
    // A picked tree is orange all through, since all of it leaves the queue;
    // a new node z has only its own two edges in accent.
    const edgeColour = (t, picked) =>
      picked ? "var(--orange)" : frame.made === t.id ? "var(--accent)" : "var(--border)";

    let svg = "";
    const edges = (t, picked) => {
      if (t.ch) return;
      const p = pos.get(t);
      const inPick = picked || pick.has(t.id);
      for (const [c, bit] of [
        [t.left, "0"],
        [t.right, "1"],
      ]) {
        const q = pos.get(c);
        const dx = q.x - p.x;
        const dy = q.y - p.y;
        const len = Math.hypot(dx, dy) || 1;
        const x1 = p.x + (dx / len) * R;
        const y1 = p.y + (dy / len) * R;
        // End on the child's outline: the circle, or the top of the box.
        let x2 = q.x - (dx / len) * R;
        let y2 = q.y - (dy / len) * R;
        if (c.ch) {
          y2 = q.y - BOX_H / 2;
          x2 = p.x + (dx / dy) * (y2 - p.y);
        }
        svg +=
          `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" ` +
          `style="stroke:${edgeColour(t, inPick)}" stroke-width="1.4"/>`;
        if (coded) {
          const mx = (x1 + x2) / 2 + (bit === "0" ? -7 : 7);
          const my = (y1 + y2) / 2 + 4;
          svg +=
            `<text x="${mx.toFixed(1)}" y="${my.toFixed(1)}" text-anchor="middle" ` +
            `style="fill:var(--muted);${FONT}">${bit}</text>`;
        }
        edges(c, inPick);
      }
    };
    for (const t of forest) edges(t, false);

    const nodes = (t) => {
      const { x, y } = pos.get(t);
      const st = styleOf(t);
      if (t.ch) {
        svg +=
          `<rect x="${(x - boxW / 2).toFixed(1)}" y="${(y - BOX_H / 2).toFixed(1)}" width="${boxW.toFixed(1)}" ` +
          `height="${BOX_H}" rx="4" style="fill:${st.fill};stroke:${st.stroke}" stroke-width="${st.wdt ?? 1.2}"/>`;
        svg +=
          `<text x="${x.toFixed(1)}" y="${(y + 4).toFixed(1)}" text-anchor="middle" ` +
          `style="fill:${st.text};${FONT};font-weight:600">${esc(name(t))}</text>`;
        if (coded) {
          svg +=
            `<text x="${x.toFixed(1)}" y="${(y + BOX_H / 2 + 14).toFixed(1)}" text-anchor="middle" ` +
            `style="fill:var(--fg);${FONT}">${esc(frame.codes[t.ch])}</text>`;
        }
        return;
      }
      svg +=
        `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${R}" ` +
        `style="fill:${st.fill};stroke:${st.stroke}" stroke-width="${st.wdt ?? 1.2}"/>`;
      svg +=
        `<text x="${x.toFixed(1)}" y="${(y + 4).toFixed(1)}" text-anchor="middle" ` +
        `style="fill:${st.text};${FONT};font-weight:600">${t.freq}</text>`;
      nodes(t.left);
      nodes(t.right);
    };
    for (const t of forest) nodes(t);

    stage.innerHTML =
      `<svg width="100%" height="100%" viewBox="0 0 ${w.toFixed(0)} ${h.toFixed(0)}" ` +
      `preserveAspectRatio="none" role="img" aria-hidden="true" style="display:block">${svg}</svg>`;
  },
};
