/**
 * Memoized Cut-Rod trace for <Stepper>, driving the Python block
 * `stavkapping-memo` in modul 06.
 *
 * The top of the stage is the whole call tree of Cut-Rod without memo: the
 * call on length k calls k - 1, k - 2, ..., 0, so the tree has 2^n nodes.
 * The memoized version walks the same tree in the same order, but a call on a
 * length that is already in r returns at once, and nothing under it is ever
 * called. Those subtrees fade as soon as the lookup happens, so the reader
 * sees the tree shrink to what is actually computed.
 *
 * The bottom row is r[0 .. n], the delinstansgraf drawn as cells: an arc from
 * k to j < k is the edge "k builds on j". Every arc is followed exactly once,
 * when aux(k) calls aux(j), so the number of arcs is the work done.
 *
 * Line numbers refer to that <CodeBlock>:
 *    1 from math import inf
 *    2
 *    3 def memoized_cut_rod(p, n):
 *    4     r = [-inf] * (n + 1)
 *    5     return aux(p, n, r)
 *    6
 *    7 def aux(p, n, r):
 *    8     if r[n] >= 0:
 *    9         return r[n]
 *   10     if n == 0:
 *   11         q = 0
 *   12     else:
 *   13         q = -inf
 *   14         for i in range(1, n + 1):
 *   15             q = max(q, p[i] + aux(p, n - i, r))
 *   16     r[n] = q
 *   17     return q
 *
 * Prices are the textbook's, p[i] for a piece of length i. Green is reserved
 * for solved subproblems (stored in r).
 *
 * Colours are framework tokens only, so frames re-theme on the light/dark
 * toggle without the module knowing which theme is active.
 */

const P = [0, 1, 5, 8, 9, 10, 17, 17, 20, 24, 30];

const esc = (v) =>
  String(v).replace(
    /[&<>"]/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c],
  );

/** The full call tree of Cut-Rod(n) without memo, children in call order. */
function buildTree(n) {
  const nodes = [];
  const make = (k, depth, parent) => {
    const node = { id: nodes.length, k, depth, parent, kids: [], leaves: 0 };
    nodes.push(node);
    for (let i = 1; i <= k; i++) node.kids.push(make(k - i, depth + 1, node.id).id);
    node.leaves = node.kids.length ? node.kids.reduce((s, c) => s + nodes[c].leaves, 0) : 1;
    return node;
  };
  make(n, 0, -1);
  // x in leaf units: each subtree gets a band as wide as its leaf count.
  const place = (id, left) => {
    const node = nodes[id];
    node.x = left + node.leaves / 2;
    let l = left;
    for (const c of node.kids) {
      place(c, l);
      l += nodes[c].leaves;
    }
  };
  place(0, 0);
  return nodes;
}

export default {
  sizeRange: { min: 2, max: 5, default: 4 },
  defaultData: (size = 4) => size,

  run(input) {
    const n = Math.max(1, Math.min(5, Number(input) || 4));
    const tree = buildTree(n);
    const state = tree.map(() => "todo");
    const r = Array(n + 1).fill(null);
    const used = new Set();
    const frames = [];
    let calls = 0;
    let hits = 0;

    const snap = (line, desc, vars, extra = {}) =>
      frames.push({
        line,
        desc,
        vars,
        n,
        tree,
        state: [...state],
        r: [...r],
        used: [...used],
        ...extra,
      });

    const prune = (id) => {
      for (const c of tree[id].kids) {
        state[c] = "pruned";
        prune(c);
      }
    };

    snap(
      [3, 4],
      `memoized_cut_rod(p, ${n}): r[0 .. ${n}] starter som −∞: ingen delinstans er løst. Treet er alle ${tree.length} kallene Cut-Rod gjør uten memo.`,
      { n },
    );

    const aux = (id) => {
      const node = tree[id];
      const k = node.k;
      calls += 1;
      if (r[k] != null) {
        hits += 1;
        state[id] = "hit";
        prune(id);
        const nb = countBelow(tree, id);
        const below = nb === 0 ? "" : nb === 1 ? " Kallet under den blir aldri utført." : ` De ${nb} kallene under den blir aldri utført.`;
        snap([8, 9], `aux(p, ${k}, r): r[${k}] = ${r[k]} er lagret. Slå opp og returner.${below}`, { n: k, "r[n]": r[k] }, { cur: id, cell: k, look: true });
        return r[k];
      }
      state[id] = "cur";
      let q;
      if (k === 0) {
        q = 0;
        snap([10, 11], `aux(p, 0, r): grunntilfellet. En stav med lengde 0 gir 0 kr.`, { n: 0, q }, { cur: id, cell: 0 });
      } else {
        snap(
          [8, 13, 14],
          `aux(p, ${k}, r): r[${k}] er ikke løst. Prøv alle første kutt i = 1 til ${k}.`,
          { n: k, q: "−∞" },
          { cur: id, cell: k },
        );
        q = -Infinity;
        node.kids.forEach((c, idx) => {
          const i = idx + 1;
          state[id] = "stack";
          used.add(`${k}-${k - i}`);
          const sub = aux(c);
          state[id] = "cur";
          const cand = P[i] + sub;
          const before = q;
          q = Math.max(q, cand);
          const beforeText = before === -Infinity ? "−∞" : String(before);
          snap(
            15,
            `i = ${i}: p[${i}] + aux(p, ${k - i}, r) = ${P[i]} + ${sub} = ${cand}. q = max(${beforeText}, ${cand}) = ${q}.`,
            { n: k, i, q },
            { cur: id, cell: k, from: c, arc: `${k}-${k - i}`, dep: k - i },
          );
        });
      }
      r[k] = q;
      state[id] = "done";
      snap(
        [16, 17],
        `r[${k}] = ${q}. Delinstansen med lengde ${k} er løst og lagret.`,
        { n: k, "r[n]": q },
        { cur: id, cell: k, stored: true },
      );
      return q;
    };

    const best = aux(0);
    const skipped = state.filter((s) => s === "pruned").length;
    snap(
      5,
      `Ferdig: r[${n}] = ${best} kr. aux ble kalt ${calls} ganger, ${n + 1} beregninger og ${hits} oppslag. De ${skipped} stiplede kallene skjedde aldri.`,
      { n, "r[n]": best },
      { done: true },
    );
    return frames;
  },

  render(stage, frame, api) {
    const { w, h } = api.getSize();
    const { n, tree, state, r } = frame;
    if (!tree || w <= 0 || h <= 0) {
      stage.innerHTML = "";
      return;
    }

    const FONT = "font-family:var(--font-mono);font-size:var(--text-xs)";
    const LABEL_W = 22;
    const PAD_R = 6;

    // Bottom band: the r row with the graph arcs above it.
    const CELL_H = 26;
    const IDX_H = 14;
    const cellsW = w - LABEL_W - PAD_R;
    const cellW = Math.min(56, cellsW / (n + 1));
    const rowX0 = LABEL_W + (cellsW - cellW * (n + 1)) / 2;
    const rowY = h - IDX_H - CELL_H;
    const ARC_STEP = Math.min(9, cellW / 3.2);
    const arcBand = n * ARC_STEP + 6;
    const treeH = rowY - arcBand - 10;

    // Tree geometry.
    const leaves = tree[0].leaves;
    const maxDepth = n;
    const unit = (w - 8) / leaves;
    const rad = Math.max(8, Math.min(13, unit / 2.3, treeH / (maxDepth + 1) / 2.4));
    const levelH = maxDepth > 0 ? (treeH - 2 * rad - 2) / maxDepth : 0;
    const pos = (node) => ({ x: 4 + node.x * unit, y: rad + 1 + node.depth * levelH });

    const NODE = {
      todo: { fill: "none", stroke: "var(--border)", text: "var(--muted)", dash: true },
      pruned: { fill: "none", stroke: "var(--border)", text: "var(--faint)", dash: true, op: 0.4 },
      stack: { fill: "none", stroke: "var(--accent)", text: "var(--fg)", wdt: 1.6 },
      cur: { fill: "var(--accent-weak)", stroke: "var(--accent)", text: "var(--accent-ink)", wdt: 2.2 },
      hit: { fill: "color-mix(in srgb, var(--orange) 22%, transparent)", stroke: "var(--orange)", text: "var(--fg)", wdt: 1.8 },
      done: { fill: "color-mix(in srgb, var(--green) 16%, transparent)", stroke: "var(--green)", text: "var(--fg)" },
    };
    const styleOf = (id) => {
      const s = state[id];
      if (frame.cur === id && s !== "hit") return NODE.cur;
      return NODE[s] || NODE.todo;
    };

    let svg = "";
    // Edges, trimmed to the rims.
    for (const node of tree) {
      if (node.parent < 0) continue;
      const a = pos(tree[node.parent]);
      const b = pos(node);
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const len = Math.hypot(dx, dy) || 1;
      const ux = dx / len;
      const uy = dy / len;
      const s = state[node.id];
      const called = s !== "todo" && s !== "pruned";
      const hot = frame.from === node.id;
      svg +=
        `<line x1="${(a.x + ux * rad).toFixed(1)}" y1="${(a.y + uy * rad).toFixed(1)}" ` +
        `x2="${(b.x - ux * rad).toFixed(1)}" y2="${(b.y - uy * rad).toFixed(1)}" ` +
        `style="stroke:${hot ? "var(--accent)" : called ? "var(--muted)" : "var(--border)"}" ` +
        `stroke-width="${hot ? 2 : called ? 1.3 : 1}"${called ? "" : ' stroke-dasharray="3 3"'}` +
        `${s === "pruned" ? ' opacity="0.4"' : ""}/>`;
    }
    for (const node of tree) {
      const { x, y } = pos(node);
      const st = styleOf(node.id);
      svg +=
        `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${rad.toFixed(1)}" ` +
        `style="fill:${st.fill};stroke:${st.stroke}" stroke-width="${st.wdt ?? 1.2}"` +
        `${st.dash ? ' stroke-dasharray="3 3"' : ""}${st.op ? ` opacity="${st.op}"` : ""}/>`;
      svg +=
        `<text x="${x.toFixed(1)}" y="${(y + 4).toFixed(1)}" text-anchor="middle" ` +
        `style="fill:${st.text};${FONT};font-weight:600"${st.op ? ` opacity="${st.op}"` : ""}>${node.k}</text>`;
    }

    // The delinstansgraf: arcs above the r row, k -> j for every j < k.
    const cx = (k) => rowX0 + k * cellW + cellW / 2;
    const used = new Set(frame.used);
    for (let k = 1; k <= n; k++) {
      for (let j = 0; j < k; j++) {
        const key = `${k}-${j}`;
        const hot = frame.arc === key;
        const on = used.has(key);
        const x1 = cx(k) - 3;
        const x2 = cx(j) + 3;
        const top = rowY - 3 - (k - j) * ARC_STEP;
        svg +=
          `<path d="M${x1.toFixed(1)},${rowY - 1} C${x1.toFixed(1)},${top.toFixed(1)} ${x2.toFixed(1)},${top.toFixed(1)} ${x2.toFixed(1)},${rowY - 1}" ` +
          `style="fill:none;stroke:${hot ? "var(--accent)" : on ? "var(--muted)" : "var(--border)"}" ` +
          `stroke-width="${hot ? 2.2 : on ? 1.2 : 1}"${on || hot ? "" : ' stroke-dasharray="2 3"'}/>`;
      }
    }

    // The r row.
    svg +=
      `<text x="${(rowX0 - 8).toFixed(1)}" y="${rowY + CELL_H / 2 + 4}" text-anchor="end" ` +
      `style="fill:var(--muted);${FONT};font-weight:600">r</text>`;
    const CELL = {
      empty: { fill: "var(--bg-elevated)", stroke: "var(--border)", text: "var(--faint)", dash: true },
      done: { fill: "color-mix(in srgb, var(--green) 16%, transparent)", stroke: "var(--green)", text: "var(--fg)" },
      cur: { fill: "var(--accent-weak)", stroke: "var(--accent)", text: "var(--accent-ink)", wdt: 2.2 },
      look: { fill: "color-mix(in srgb, var(--orange) 22%, transparent)", stroke: "var(--orange)", text: "var(--fg)", wdt: 2 },
    };
    for (let k = 0; k <= n; k++) {
      let st = r[k] == null ? CELL.empty : CELL.done;
      if (frame.dep === k) st = CELL.look;
      if (frame.cell === k) st = frame.look ? CELL.look : CELL.cur;
      const x = rowX0 + k * cellW + 2;
      svg +=
        `<rect x="${x.toFixed(1)}" y="${rowY}" width="${(cellW - 4).toFixed(1)}" height="${CELL_H}" rx="4" ` +
        `style="fill:${st.fill};stroke:${st.stroke}" stroke-width="${st.wdt ?? 1.2}"${st.dash ? ' stroke-dasharray="3 3"' : ""}/>`;
      svg +=
        `<text x="${cx(k).toFixed(1)}" y="${rowY + CELL_H / 2 + 4}" text-anchor="middle" ` +
        `style="fill:${st.text};${FONT}">${r[k] == null ? "−∞" : esc(r[k])}</text>`;
      svg +=
        `<text x="${cx(k).toFixed(1)}" y="${rowY + CELL_H + 11}" text-anchor="middle" ` +
        `style="fill:var(--faint);${FONT}">${k}</text>`;
    }

    stage.innerHTML =
      `<svg width="100%" height="100%" viewBox="0 0 ${w.toFixed(0)} ${h.toFixed(0)}" ` +
      `preserveAspectRatio="none" role="img" aria-hidden="true" style="display:block">${svg}</svg>`;
  },
};

/** Number of nodes strictly below `id` in the full tree. */
function countBelow(tree, id) {
  return tree[id].kids.reduce((s, c) => s + 1 + countBelow(tree, c), 0);
}
