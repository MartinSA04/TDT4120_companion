/**
 * Merge-Sort trace for <Stepper>, driving the Python block `merge-sort` in
 * modul 03. The stage is the recursion tree itself: one row per depth, one box
 * per call, and the boxes fill in as the merges run back up the tree.
 *
 * Line numbers refer to that <CodeBlock>:
 *    1 inf = float("inf")
 *    2
 *    3 def merge_sort(A, p, r):
 *    4     if p >= r:
 *    5         return
 *    6     q = (p + r) // 2
 *    7     merge_sort(A, p, q)
 *    8     merge_sort(A, q + 1, r)
 *    9     merge(A, p, q, r)
 *   10
 *   11 def merge(A, p, q, r):
 *   12     L = A[p : q + 1] + [inf]
 *   13     R = A[q + 1 : r + 1] + [inf]
 *   14     i = j = 0
 *   15     for k in range(p, r + 1):
 *   16         if L[i] <= R[j]:
 *   17             A[k] = L[i]
 *   18             i = i + 1
 *   19         else:
 *   20             A[k] = R[j]
 *   21             j = j + 1
 *
 * Indices are 0-based and the segment A[p .. r] is inclusive, as in the
 * Python. During a merge the two children show the copies L and R (with the
 * sentinel drawn as an ∞ marker past the last cell), because merge overwrites
 * A[p .. r] while it reads them.
 *
 * Colours are framework tokens only, so frames re-theme on the light/dark
 * toggle without the module knowing which theme is active.
 */

function shuffled(size) {
  const a = Array.from({ length: size }, (_, i) => i + 1);
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const fmt = (v) => (v === Infinity ? "∞" : String(v));

export default {
  sizeRange: { min: 4, max: 8, default: 8 },
  defaultData: (size = 8) => shuffled(size),

  run(input) {
    const A = [...input];
    const n = A.length;
    const nodes = new Map();
    const key = (p, r) => `${p}-${r}`;
    let maxDepth = 0;

    const build = (p, r, depth) => {
      nodes.set(key(p, r), { p, r, depth, state: "todo", vals: null, used: 0 });
      maxDepth = Math.max(maxDepth, depth);
      if (p < r) {
        const q = Math.floor((p + r) / 2);
        build(p, q, depth + 1);
        build(q + 1, r, depth + 1);
      }
    };
    build(0, n - 1, 0);

    const frames = [];
    const snap = (line, desc, vars, extra = {}) => {
      // Every box that is not a copy (L or R) is a view of the one array A, so
      // a call that is still open shows what A holds right now, including the
      // cells its own children have already written.
      for (const nd of nodes.values()) if (nd.state === "active") nd.vals = A.slice(nd.p, nd.r + 1);
      frames.push({
        line,
        desc,
        vars,
        n,
        maxDepth,
        nodes: [...nodes.values()].map((nd) => ({ ...nd, vals: nd.vals ? [...nd.vals] : null })),
        ...extra,
      });
    };

    const sort = (p, r) => {
      const nd = nodes.get(key(p, r));
      nd.state = "active";
      nd.vals = A.slice(p, r + 1);
      if (p >= r) {
        nd.state = "sorted";
        snap(4, `merge_sort(A, ${p}, ${r}): ett element er sortert allerede. Grunntilfellet.`, { p, r });
        return;
      }
      const q = Math.floor((p + r) / 2);
      snap(6, `merge_sort(A, ${p}, ${r}): q = ${q}. Halvdelene er A[${p} .. ${q}] og A[${q + 1} .. ${r}].`, {
        p,
        q,
        r,
      });
      sort(p, q);
      sort(q + 1, r);

      const L = [...A.slice(p, q + 1), Infinity];
      const R = [...A.slice(q + 1, r + 1), Infinity];
      const left = nodes.get(key(p, q));
      const right = nodes.get(key(q + 1, r));
      left.state = "src";
      left.vals = L;
      left.used = 0;
      right.state = "src";
      right.vals = R;
      right.used = 0;
      nd.state = "merging";
      nd.vals = Array(r - p + 1).fill(null);
      snap(
        [12, 13],
        `merge(A, ${p}, ${q}, ${r}): halvdelene kopieres til L og R, med ∞ som vaktpost bakerst i hver.`,
        { p, q, r },
        { merge: { p, q, r, i: 0, j: 0, k: null } },
      );

      let i = 0;
      let j = 0;
      for (let k = p; k <= r; k++) {
        const lv = fmt(L[i]);
        const rv = fmt(R[j]);
        if (L[i] <= R[j]) {
          A[k] = L[i];
          nd.vals[k - p] = L[i];
          snap(
            [16, 17, 18],
            `L[${i}] = ${lv} ≤ R[${j}] = ${rv}, så A[${k}] = ${lv}, og i rykker fram.`,
            { i, j, k },
            { merge: { p, q, r, i, j, k, take: "L" } },
          );
          i += 1;
          left.used = i;
        } else {
          A[k] = R[j];
          nd.vals[k - p] = R[j];
          snap(
            [16, 20, 21],
            `L[${i}] = ${lv} > R[${j}] = ${rv}, så A[${k}] = ${rv}, og j rykker fram.`,
            { i, j, k },
            { merge: { p, q, r, i, j, k, take: "R" } },
          );
          j += 1;
          right.used = j;
        }
      }

      nd.state = "sorted";
      left.state = "done";
      left.vals = L.slice(0, -1);
      right.state = "done";
      right.vals = R.slice(0, -1);
      snap(15, `Løkka er ferdig: A[${p} .. ${r}] er sortert.`, { p, q, r });
    };

    const root = nodes.get(key(0, n - 1));
    root.state = "active";
    root.vals = [...A];
    snap(3, `merge_sort(A, 0, ${n - 1}) sorterer hele tabellen med n = ${n} elementer.`, { p: 0, r: n - 1 });
    sort(0, n - 1);
    frames[frames.length - 1].desc = `Rota er flettet: hele tabellen er sortert. Treet har ${maxDepth + 1} nivåer, og hvert nivå flettet til sammen ${n} elementer.`;
    frames[frames.length - 1].done = true;
    return frames;
  },

  render(stage, frame, api) {
    const { w, h } = api.getSize();
    const n = frame.n;
    if (!n || w <= 0 || h <= 0) {
      stage.innerHTML = "";
      return;
    }

    const rows = frame.maxDepth + 1;
    const PAD_X = 14;
    const rowH = h / rows;
    const cellH = Math.min(30, Math.max(18, rowH - 16));
    const cellW = (w - PAD_X * 2) / n;
    const showText = cellW >= 18;
    const m = frame.merge;

    let svg = "";
    const cell = (x, y, wd, text, style) => {
      svg +=
        `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${wd.toFixed(1)}" height="${cellH}" rx="4" ` +
        `style="fill:${style.fill};stroke:${style.stroke}" stroke-width="${style.wdt ?? 1.2}"` +
        `${style.dash ? ' stroke-dasharray="3 3"' : ""}/>`;
      if (text != null && showText) {
        svg +=
          `<text x="${(x + wd / 2).toFixed(1)}" y="${(y + cellH / 2 + 4).toFixed(1)}" text-anchor="middle" ` +
          `style="fill:${style.text};font-family:var(--font-mono);font-size:var(--text-xs)">${text}</text>`;
      }
    };

    const STYLE = {
      todo: { fill: "none", stroke: "var(--border)", text: "var(--faint)", dash: true },
      active: { fill: "color-mix(in srgb, var(--fg) 6%, transparent)", stroke: "var(--border)", text: "var(--muted)" },
      sorted: { fill: "color-mix(in srgb, var(--green) 14%, transparent)", stroke: "var(--green)", text: "var(--fg)" },
      done: { fill: "none", stroke: "var(--faint)", text: "var(--faint)" },
      src: { fill: "color-mix(in srgb, var(--green) 14%, transparent)", stroke: "var(--green)", text: "var(--fg)" },
      used: { fill: "none", stroke: "var(--faint)", text: "var(--faint)", dash: true },
      cursor: { fill: "color-mix(in srgb, var(--orange) 18%, transparent)", stroke: "var(--orange)", text: "var(--fg)", wdt: 2 },
      empty: { fill: "none", stroke: "var(--accent)", text: "var(--faint)", dash: true },
      filled: { fill: "var(--accent-weak)", stroke: "var(--accent)", text: "var(--accent-ink)" },
      written: { fill: "var(--accent-weak)", stroke: "var(--accent)", text: "var(--accent-ink)", wdt: 2.2 },
    };

    for (const nd of frame.nodes) {
      const y = nd.depth * rowH + (rowH - cellH) / 2;
      const len = nd.r - nd.p + 1;
      // Inset the segment so neighbouring calls read as separate boxes.
      const x0 = PAD_X + nd.p * cellW + 2;
      const wd = (cellW * len - 4) / len;

      let cursor = null;
      if (nd.state === "src" && m) {
        const isLeft = nd.p === m.p;
        cursor = isLeft ? m.i : m.j;
      }

      for (let idx = 0; idx < len; idx++) {
        const x = x0 + idx * wd;
        const v = nd.vals ? nd.vals[idx] : null;
        let st = STYLE[nd.state] ?? STYLE.todo;
        let text = nd.state === "todo" ? null : v == null ? null : fmt(v);
        if (nd.state === "src") {
          if (idx < nd.used) st = STYLE.used;
          if (cursor === idx) st = STYLE.cursor;
        } else if (nd.state === "merging") {
          st = v == null ? STYLE.empty : STYLE.filled;
          if (m && m.k === nd.p + idx) st = STYLE.written;
        }
        cell(x, y, wd - 1, text, st);
      }

      // The sentinel: once a half is used up the cursor stands on its ∞, drawn
      // under the segment so the loop is seen to keep taking from the other half.
      if (nd.state === "src" && cursor === len) {
        svg +=
          `<text x="${(x0 + (len * wd) / 2).toFixed(1)}" y="${(y + cellH + 13).toFixed(1)}" text-anchor="middle" ` +
          `style="fill:var(--orange);font-family:var(--font-mono);font-size:var(--text-xs);font-weight:700">∞</text>`;
      }
    }

    stage.innerHTML =
      `<svg width="100%" height="100%" viewBox="0 0 ${w.toFixed(0)} ${h.toFixed(0)}" ` +
      `preserveAspectRatio="none" role="img" aria-hidden="true" style="display:block">${svg}</svg>`;
  },
};
