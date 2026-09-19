/**
 * Binary-search-tree trace for <Stepper>, driving the Python block
 * `binaert-soketre` in modul 05: Tree-Insert once per key, in the order the
 * keys arrive, then Inorder-Tree-Walk over the finished tree.
 *
 * Each node's x is its rank among all the keys and its y is its depth, so
 * "left subtree = smaller, right subtree = larger" is visible as "left of,
 * right of", and a sorted insertion order shows up as a chain. The row under
 * the tree is the input in arrival order while inserting and the printed
 * output while walking. Green is reserved for printed keys, which come out
 * sorted.
 *
 * Line numbers refer to that <CodeBlock>:
 *    1 def tree_insert(T, z):
 *    2     x, y = T.root, None
 *    3     while x is not None:
 *    4         y = x
 *    5         if z.key < x.key:
 *    6             x = x.left
 *    7         else:
 *    8             x = x.right
 *    9     z.p = y
 *   10     if y is None:
 *   11         T.root = z
 *   12     elif z.key < y.key:
 *   13         y.left = z
 *   14     else:
 *   15         y.right = z
 *   16
 *   17 def inorder_tree_walk(x):
 *   18     if x is not None:
 *   19         inorder_tree_walk(x.left)
 *   20         print(x.key)
 *   21         inorder_tree_walk(x.right)
 *
 * Colours are framework tokens only, so frames re-theme on the light/dark
 * toggle without the module knowing which theme is active.
 */

const esc = (v) =>
  String(v).replace(
    /[&<>"]/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c],
  );

/** `size` distinct keys from 1..20 in random order. */
function sample(size) {
  const pool = Array.from({ length: 20 }, (_, i) => i + 1);
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, size);
}

/** Height of the tree the keys build, so the layout can be fixed up front. */
function finalHeight(keys) {
  let root = null;
  let height = 0;
  for (const k of keys) {
    let x = root;
    let y = null;
    while (x) {
      y = x;
      x = k < x.key ? x.left : x.right;
    }
    const z = { key: k, left: null, right: null, depth: y ? y.depth + 1 : 0 };
    if (!y) root = z;
    else if (k < y.key) y.left = z;
    else y.right = z;
    height = Math.max(height, z.depth);
  }
  return height;
}

const STYLE = {
  plain: { fill: "none", stroke: "var(--border)", text: "var(--fg)" },
  todo: { fill: "none", stroke: "var(--border)", text: "var(--faint)", dash: true },
  cur: { fill: "var(--accent-weak)", stroke: "var(--accent)", text: "var(--accent-ink)", wdt: 2 },
  prev: { fill: "none", stroke: "var(--orange)", text: "var(--fg)", wdt: 1.8 },
  printed: { fill: "color-mix(in srgb, var(--green) 16%, transparent)", stroke: "var(--green)", text: "var(--fg)" },
};

const FONT = "font-family:var(--font-mono);font-size:var(--text-xs)";

export default {
  sizeRange: { min: 5, max: 10, default: 8 },
  defaultData: (size = 8) => sample(size),

  run(input) {
    const keys = [...input];
    const n = keys.length;
    const sorted = [...keys].sort((a, b) => a - b);
    const col = new Map(sorted.map((k, i) => [k, i]));
    const height = finalHeight(keys);
    const nodes = new Map();
    let root = null;
    const frames = [];
    const view = () =>
      [...nodes.values()].map((nd) => ({ key: nd.key, p: nd.p ? nd.p.key : null, depth: nd.depth, col: col.get(nd.key) }));
    const snap = (line, desc, vars, extra = {}) =>
      frames.push({ line, desc, vars, nodes: view(), n, keys, height, phase: "insert", ...extra });

    keys.forEach((k, idx) => {
      snap(
        2,
        `${idx === 0 ? "Nøklene settes inn i den rekkefølgen de står i raden under. " : ""}tree_insert(T, ${k}): x starter i rota${root ? `, ${root.key}` : ", som er nil"}, og y er nil.`,
        { "z.key": k },
        { cur: root ? root.key : null, inIdx: idx },
      );
      let x = root;
      let y = null;
      while (x) {
        y = x;
        const left = k < x.key;
        const next = left ? x.left : x.right;
        snap(
          left ? [4, 5, 6] : [4, 7, 8],
          `${k} ${left ? "<" : ">"} ${x.key}: y = ${x.key}, og x går til ${left ? "venstre" : "høyre"} barn, ${next ? next.key : "som er nil"}.`,
          { "z.key": k, "x.key": next ? next.key : "None", "y.key": y.key },
          { cur: next ? next.key : null, prev: y.key, inIdx: idx },
        );
        x = next;
      }
      const z = { key: k, left: null, right: null, p: y, depth: y ? y.depth + 1 : 0 };
      nodes.set(k, z);
      if (!y) {
        root = z;
        snap([9, 10, 11], `y er nil, så treet var tomt, og ${k} blir rot.`, { "z.key": k }, { cur: k, inIdx: idx });
      } else if (k < y.key) {
        y.left = z;
        snap(
          [9, 12, 13],
          `x er nil, så ${k} henges på y = ${y.key}. ${k} < ${y.key}: venstre barn, dybde ${z.depth}.`,
          { "z.key": k, "y.key": y.key },
          { cur: k, prev: y.key, inIdx: idx },
        );
      } else {
        y.right = z;
        snap(
          [9, 14, 15],
          `x er nil, så ${k} henges på y = ${y.key}. ${k} > ${y.key}: høyre barn, dybde ${z.depth}.`,
          { "z.key": k, "y.key": y.key },
          { cur: k, prev: y.key, inIdx: idx },
        );
      }
    });

    const out = [];
    snap(
      [17, 18, 19],
      `Alle ${n} nøklene er satt inn, og høyden er ${height}. inorder_tree_walk(${root.key}): skriv ut venstre deltre, så noden, så høyre deltre, rekursivt.`,
      { "x.key": root.key },
      { phase: "walk", out: [] },
    );
    const walk = (x) => {
      if (!x) return;
      walk(x.left);
      out.push(x.key);
      snap(
        20,
        `${x.left ? `Venstre deltre til ${x.key} er skrevet ut. ` : `${x.key} har ikke noe venstre deltre. `}print(${x.key}).${x.right ? " Deretter høyre deltre." : ""}`,
        { "x.key": x.key },
        { phase: "walk", cur: x.key, out: [...out] },
      );
      walk(x.right);
    };
    walk(root);
    snap(
      21,
      `Utskriften er ${out.join(", ")}, stigende. Det følger av binær-søketre-egenskapen.`,
      {},
      { phase: "walk", out: [...out], done: true },
    );
    return frames;
  },

  render(stage, frame, api) {
    const { w, h } = api.getSize();
    const { n, nodes, height } = frame;
    if (!n || w <= 0 || h <= 0) {
      stage.innerHTML = "";
      return;
    }

    const CELL_H = 24;
    const GAP = 12;
    const LABEL_W = 30;
    const PAD_R = 4;
    const rowY = h - CELL_H;
    const treeH = rowY - GAP;
    const colW = w / n;
    const r = Math.max(9, Math.min(14, colW / 2.4, treeH / (height + 1) / 2.3));
    const levelH = height > 0 ? (treeH - 2 * r - 2) / height : 0;
    const pos = (nd) => ({ x: colW * (nd.col + 0.5), y: r + 1 + nd.depth * levelH });
    const byKey = new Map(nodes.map((nd) => [nd.key, nd]));
    const printed = new Set(frame.out || []);
    const styleOf = (key) => {
      if (printed.has(key)) return STYLE.printed;
      if (frame.cur === key) return STYLE.cur;
      if (frame.prev === key) return STYLE.prev;
      return STYLE.plain;
    };

    let svg = "";
    for (const nd of nodes) {
      if (nd.p == null) continue;
      const a = pos(byKey.get(nd.p));
      const b = pos(nd);
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const len = Math.hypot(dx, dy) || 1;
      const ux = dx / len;
      const uy = dy / len;
      svg +=
        `<line x1="${(a.x + ux * r).toFixed(1)}" y1="${(a.y + uy * r).toFixed(1)}" ` +
        `x2="${(b.x - ux * r).toFixed(1)}" y2="${(b.y - uy * r).toFixed(1)}" ` +
        `style="stroke:var(--border)" stroke-width="1.4"/>`;
    }
    for (const nd of nodes) {
      const { x, y } = pos(nd);
      const st = styleOf(nd.key);
      svg +=
        `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}" ` +
        `style="fill:${st.fill};stroke:${st.stroke}" stroke-width="${st.wdt ?? 1.2}"/>`;
      svg +=
        `<text x="${x.toFixed(1)}" y="${(y + 4).toFixed(1)}" text-anchor="middle" ` +
        `style="fill:${st.text};${FONT};font-weight:600">${esc(nd.key)}</text>`;
    }

    // The row: input in arrival order while inserting, printed keys while walking.
    const walking = frame.phase === "walk";
    const cells = walking ? frame.out : frame.keys;
    const cellW = (w - LABEL_W - PAD_R) / n;
    const showText = cellW >= 18;
    svg +=
      `<text x="${LABEL_W - 8}" y="${rowY + CELL_H / 2 + 4}" text-anchor="end" ` +
      `style="fill:var(--muted);${FONT};font-weight:600">${walking ? "ut" : "inn"}</text>`;
    for (let i = 0; i < n; i++) {
      const v = cells[i];
      let st;
      if (walking) st = v == null ? STYLE.todo : STYLE.printed;
      else st = i < frame.inIdx ? STYLE.plain : i === frame.inIdx ? STYLE.cur : STYLE.todo;
      const x = LABEL_W + i * cellW + 1;
      svg +=
        `<rect x="${x.toFixed(1)}" y="${rowY}" width="${(cellW - 2).toFixed(1)}" height="${CELL_H}" rx="4" ` +
        `style="fill:${st.fill};stroke:${st.stroke}" stroke-width="${st.wdt ?? 1.2}"` +
        `${st.dash ? ' stroke-dasharray="3 3"' : ""}/>`;
      if (showText && v != null) {
        svg +=
          `<text x="${(x + (cellW - 2) / 2).toFixed(1)}" y="${rowY + CELL_H / 2 + 4}" text-anchor="middle" ` +
          `style="fill:${st.text};${FONT}">${esc(v)}</text>`;
      }
    }

    stage.innerHTML =
      `<svg width="100%" height="100%" viewBox="0 0 ${w.toFixed(0)} ${h.toFixed(0)}" ` +
      `preserveAspectRatio="none" role="img" aria-hidden="true" style="display:block">${svg}</svg>`;
  },
};
