/**
 * Inorder-Tree-Walk on a binary search tree, for <Stepper>, driving the block
 * `inorder-kode` in modul 06. The one idea: the walk prints the left subtree,
 * then the node, then the right subtree, so a search tree comes out in sorted
 * order. Drawn with x = rank, every node stands right above its place in the
 * sorted row under the tree, and printing is reading the tree from left to
 * right. What the walk does between printing one key and the next is
 * Tree-Successor: if the printed node has a right subtree, it goes down into
 * it and left as far as it can; otherwise it returns up until it comes back
 * from a left child.
 *
 * Block line numbers count the header as line 1 (pseudocode line k is block
 * line k + 1), the pseudocode as CLRS 4th ed. §12.1 and the lecture print it:
 *    1 Inorder-Tree-Walk(x)
 *    2 1  if x ≠ nil
 *    3 2      Inorder-Tree-Walk(x.left)
 *    4 3      print x.key
 *    5 4      Inorder-Tree-Walk(x.right)
 *
 * Input: the keys in insertion order; the tree is what Tree-Insert builds
 * from them. Frames: the start (1); per node v four frames: the call on v
 * with its descent to the left child (2, 3), print v (4), the call on the
 * right child (5), and the return from v's subtree to its parent (3 when v
 * is a left child, then the parent is printed next; 5 when v is a right
 * child, then the parent is finished too); for the root that return is the
 * last frame (5). Per nil child one frame (2): «x = nil: ingenting å gjøre,
 * tilbake til v», and its return is folded into the next frame. That is
 * 1 + 4n + (n + 1) = 5n + 2 frames: 37 for the lecture's instance.
 *
 * The first instance is the lecture's (lecture 5, slides 51–101): keys 4, 2,
 * 6, 1, 3, 5, 7 give the complete tree 4; 2, 6; 1, 3, 5, 7. The call path
 * goes 4 › 2 › 1 › nil, prints 1, 4 › 2 › 1 › nil, returns to 2 (1 was a
 * left child), prints 2, 4 › 2 › 3 › nil, prints 3, 4 › 2 › 3 › nil, returns
 * to 2 (3 was a right child, so 2 is finished too) and on to 4 (2 was a left
 * child), prints 4, and so on: output 1 2 3 4 5 6 7.
 * Checked by running this file's run() in node (see the report). Later
 * instances: n distinct keys from 1 … 99 in random order.
 *
 * The drawing: the tree laid out with bstPos (x = the node's place in sorted
 * order, y = its depth), and under it the output row: one cell per node at
 * the node's x, on the same pitch, empty and dashed until the key is
 * printed, then holding it, green. A printed node turns green in the tree
 * too, and on its print frame a dashed line drops from the node to its cell.
 * The call stack is the way from the root to the current call's node, drawn
 * in the accent; the current call's node is accent (accent outline on green
 * once it is printed), with the pointer tag «x» beside it, on the side that
 * keeps it clear of every line and circle (the right when that is free). A
 * call on nil is
 * a short dashed accent stub from the parent down to a small dashed circle
 * on that side, half a pitch out (the gap in sorted order that nil stands
 * for), drawn only while that call runs.
 *
 * Colours are framework tokens only, through _tre.js's marks, so frames
 * re-theme on the light/dark toggle: current (accent) = the running call's
 * node; done (green) = printed, in the tree and in the row; slot (dashed) =
 * a cell not printed yet; EDGE.path (accent) = the call stack.
 */

import { MARK, EDGE, node, edge, cell, tag, bstPos, svgWrap, remPx, textW } from "./_tre.js";

/** The lecture's instance (lecture 5, slides 51–101). */
const FIRST = [4, 2, 6, 1, 3, 5, 7];

/** `size` distinct keys from 1 … 99 in random order. */
function dealt(size) {
  const pool = Array.from({ length: 99 }, (_, i) => i + 1);
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, size);
}

// The first view must be the lecture's instance (the module text describes
// it), also when the reader comes back to the page. Same detection as
// counting-sort.js: a call while one of this module's ready figures has not
// drawn yet is that figure's first load; otherwise only the very first call.
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

/** The search tree `keys` give when inserted in that order: { nodes, root }. */
function build(keys) {
  const nodes = [];
  let root = null;
  for (const key of keys) {
    let x = root;
    let y = null;
    while (x !== null) {
      y = x;
      x = key < nodes[x].key ? nodes[x].left : nodes[x].right;
    }
    const i = nodes.push({ key, left: null, right: null, p: y }) - 1;
    if (y === null) root = i;
    else if (key < nodes[y].key) nodes[y].left = i;
    else nodes[y].right = i;
  }
  return { nodes, root };
}

/**
 * Where a pointer tag goes beside its node: of 24 directions round the
 * circle, the one that keeps the tag off every drawn line and circle, off the
 * tags already placed and inside the stage, at least 45° from the lines that
 * leave the node, and as close as that allows to the preferred direction
 * (`prefer`, radians, 0 = right, π = left). Returns the tag's centre.
 */
function tagSpot(p, R, prefer, scene) {
  const { lines, circles, taken, fs, tw, w, h } = scene;
  const rho = Math.max(tw, 0.55 * fs) / 2 + 1.5;
  const segDist = (x, y, a, b) => {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const t = Math.max(0, Math.min(1, ((x - a.x) * dx + (y - a.y) * dy) / (dx * dx + dy * dy || 1)));
    return Math.hypot(x - (a.x + t * dx), y - (a.y + t * dy));
  };
  const own = lines
    .filter((l) => Math.hypot(l.a.x - p.x, l.a.y - p.y) < R + 1 || Math.hypot(l.b.x - p.x, l.b.y - p.y) < R + 1)
    .map((l) => {
      const q = Math.hypot(l.a.x - p.x, l.a.y - p.y) < R + 1 ? l.b : l.a;
      return Math.atan2(q.y - p.y, q.x - p.x);
    });
  const angDist = (a, b) => {
    const d = Math.abs(a - b) % (2 * Math.PI);
    return d > Math.PI ? 2 * Math.PI - d : d;
  };
  let best = null;
  for (let k = 0; k < 24; k++) {
    const a = (k * Math.PI) / 12;
    const c = Math.cos(a);
    const sn = Math.sin(a);
    const d = R + 3 + Math.abs(c) * (tw / 2) + Math.abs(sn) * fs * 0.4;
    const x = p.x + c * d;
    const y = p.y + sn * d;
    let free = Math.PI / 4;
    for (const o of own) free = Math.min(free, angDist(a, o));
    let score = 3 * free + 0.35 * Math.cos(a - prefer);
    if (x - tw / 2 < 1 || x + tw / 2 > w - 1 || y - fs * 0.45 < 1 || y + fs * 0.45 > h - 1) score -= 10;
    for (const l of lines) if (segDist(x, y, l.a, l.b) < rho + 1.5) score -= 10;
    for (const o of circles) if (Math.hypot(o.x - x, o.y - y) < o.r + rho + 1) score -= 10;
    for (const t of taken) if (Math.hypot(t.x - x, t.y - y) < 2 * rho + 2) score -= 10;
    if (!best || score > best.score) best = { score, x, y };
  }
  taken.push(best);
  return best;
}


const SEP = " › ";

export default {
  sizeRange: { min: 3, max: 12, default: 7 },
  defaultData(size = 7) {
    if (calls++ === 0 || firstLoad()) return [...FIRST];
    return dealt(size);
  },

  run(input) {
    const { nodes, root } = build([...input]);
    const n = nodes.length;
    const key = (i) => nodes[i].key;

    const frames = [];
    const printed = new Array(n).fill(false);
    const out = [];
    const stack = []; // node indices of the running calls, root first
    const snap = (line, desc, st = {}) => {
      const nil = !!st.nil;
      const kall = stack.length ? stack.map(key).concat(nil ? ["nil"] : []).join(SEP) : "–";
      let x = "–";
      if (nil) x = "nil";
      else if (stack.length) x = key(stack[stack.length - 1]);
      frames.push({
        line,
        desc,
        vars: { x, kall, ut: out.length ? out.join(" ") : "–" },
        n,
        nodes,
        root,
        stack: [...stack],
        printed: [...printed],
        nil: null, // { parent, side } while a call on nil runs
        justPrinted: null,
        ...st,
      });
    };

    snap(1, `Inorder-Tree-Walk(${key(root)}) skal skrive ut nøklene i treet med rot ${key(root)}. Raden under treet er utskriften, tom ennå.`);

    const callNil = (parent, side) =>
      snap(2, `x = nil: ingenting å gjøre, tilbake til ${key(parent)}.`, { nil: { parent, side } });

    const walk = (i, parent, side) => {
      stack.push(i);
      const l = nodes[i].left;
      snap([2, 3], `Inorder-Tree-Walk(${key(i)}): x ≠ nil, så kall på venstre barn, ${l === null ? "som er nil" : key(l)}.`);
      if (l === null) callNil(i, "left");
      else walk(l, i, "left");

      printed[i] = true;
      out.push(key(i));
      const before = out.length > 1
        ? `Alle nøklene til venstre for ${key(i)} er allerede skrevet ut.`
        : `Ingen node står til venstre for ${key(i)}, så ${key(i)} er den minste nøkkelen.`;
      snap(4, `print ${key(i)}. ${before}`, { justPrinted: i });

      const r = nodes[i].right;
      snap(5, `${key(i)} er skrevet ut, så kall på høyre barn, ${r === null ? "som er nil" : key(r)}.`);
      if (r === null) callNil(i, "right");
      else walk(r, i, "right");

      stack.pop();
      if (parent === null) {
        snap(5, `Ferdig med deltreet til ${key(i)}, som er hele treet. Utskriften ${out.join(" ")} er nøklene i sortert rekkefølge.`);
      } else if (side === "left") {
        snap(3, `Ferdig med deltreet til ${key(i)}. Det var venstre deltre til ${key(parent)}, så nå skal ${key(parent)} skrives ut.`);
      } else {
        snap(5, `Ferdig med deltreet til ${key(i)}. Det var høyre deltre til ${key(parent)}, så også ${key(parent)} er ferdig.`);
      }
    };
    walk(root, null, null);
    return frames;
  },

  render(stage, f, api) {
    drawn.add(stage);
    const { w, h } = api.getSize();
    if (!f.n || w <= 0 || h <= 0) {
      stage.innerHTML = "";
      return;
    }

    // Type sizes in px, from the root so the drawing follows the reader's
    // text size; never under 11 px.
    const rem = remPx();
    const fsKey = Math.max(11, Math.min(15, 0.86 * rem));
    const fsTag = Math.max(11, Math.min(14, 0.82 * rem));
    const tagW = textW("x", fsTag);
    const TAG_GAP = 3;

    // Horizontal: one place per node, one pitch for the tree and the row.
    const probe = bstPos(f.nodes, f.root, { x0: 0, y0: 0, w: 1, dy: 1 });
    const places = probe.count;
    const D = Math.max(1, probe.depth);
    const rMax = Math.max(12, Math.min(17, 1.05 * rem));
    let padX = 4;
    let pitch = 0;
    let r = 0;
    for (let pass = 0; pass < 3; pass++) {
      pitch = (w - 2 * padX) / places;
      r = Math.min(rMax, pitch * 0.42);
      padX = Math.max(4, r + TAG_GAP + tagW + 2 - pitch / 2, 0.4 * r + TAG_GAP + tagW + 2);
    }
    // A small tree keeps its proportions on a wide stage and stands centred.
    pitch = Math.min(pitch, 4.6 * rMax);
    const x0 = (w - pitch * places) / 2;

    // Vertical, top to bottom: the tree, room under the deepest level for a
    // nil stub, the output row.
    // The whole picture stands centred in the stage.
    const PAD = 4;
    const CELL_H = Math.round(Math.max(22, fsKey * 1.9));
    const GAP_ROW = 14;
    const avail = h - 2 * PAD - CELL_H - GAP_ROW; // the tree and its nil stubs
    const stubOf = (dy, rr) => Math.max(rr + 8, Math.min(dy * 0.62, rr * 1.9));
    let dy = Math.min(3.4 * r, (avail - r - stubOf(3.1 * r, r) - 5) / D);
    const R = Math.min(r, (Math.hypot(pitch, dy) - 3) / 2);
    const rn = Math.max(4.5, R * 0.4);
    const fsN = Math.min(fsKey, (2 * R - 4) / (2 * 0.6));
    const stub = stubOf(dy, R);
    if (R + D * dy + stub + rn > avail) dy = Math.max(1, (avail - R - stub - rn) / D);
    const used = R + D * dy + stub + rn;
    const top = PAD + Math.max(0, (h - 2 * PAD - used - GAP_ROW - CELL_H) / 2);
    const y0 = top + R;
    const rowTop = top + used + GAP_ROW;
    const L = bstPos(f.nodes, f.root, { x0, y0, w: pitch * places, dy });
    const P = (i) => L.pos.get(i);

    const cur = f.nil ? null : f.stack.length ? f.stack[f.stack.length - 1] : null;
    const onStack = new Set(f.stack);

    let svg = "";
    const lines = []; // every line drawn, for placing the tag
    // Edges: the call stack in the accent.
    f.nodes.forEach((nd, i) => {
      if (nd.p === null) return;
      svg += edge(P(nd.p), P(i), R, onStack.has(i) && onStack.has(nd.p) ? "path" : "plain");
      lines.push({ a: P(nd.p), b: P(i) });
    });

    // The call on nil: a dashed stub half a pitch out, to a small dashed circle.
    let nilPos = null;
    if (f.nil) {
      const a = P(f.nil.parent);
      nilPos = { x: a.x + (f.nil.side === "left" ? -1 : 1) * pitch * 0.5, y: a.y + stub };
      lines.push({ a, b: nilPos });
      const dx = nilPos.x - a.x;
      const dyy = nilPos.y - a.y;
      const d = Math.hypot(dx, dyy) || 1;
      svg +=
        `<line x1="${(a.x + (dx / d) * R).toFixed(1)}" y1="${(a.y + (dyy / d) * R).toFixed(1)}" ` +
        `x2="${(nilPos.x - (dx / d) * rn).toFixed(1)}" y2="${(nilPos.y - (dyy / d) * rn).toFixed(1)}" ` +
        `style="stroke:${EDGE.path.stroke}" stroke-width="2.2" stroke-linecap="round" stroke-dasharray="3 3"/>` +
        `<circle cx="${nilPos.x.toFixed(1)}" cy="${nilPos.y.toFixed(1)}" r="${rn.toFixed(1)}" ` +
        `style="fill:none;stroke:${MARK.current.stroke}" stroke-width="1.8" stroke-dasharray="2.5 2"/>`;
    }

    // On a print frame, a dashed line from the node down to its cell.
    if (f.justPrinted !== null) {
      const p = P(f.justPrinted);
      lines.push({ a: p, b: { x: p.x, y: rowTop } });
      svg +=
        `<line x1="${p.x.toFixed(1)}" y1="${(p.y + R + 2).toFixed(1)}" x2="${p.x.toFixed(1)}" y2="${(rowTop - 3).toFixed(1)}" ` +
        `style="stroke:var(--green)" stroke-width="1.4" stroke-dasharray="3 3"/>`;
    }

    // Nodes: printed green, the running call accent (accent ring on green).
    f.nodes.forEach((nd, i) => {
      const p = P(i);
      const done = f.printed[i];
      if (i === cur && done) {
        svg += node(p.x, p.y, R, nd.key, "done", fsN);
        svg +=
          `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${R.toFixed(1)}" ` +
          `style="fill:none;stroke:${MARK.current.stroke}" stroke-width="${MARK.current.wdt}"/>`;
      } else svg += node(p.x, p.y, R, nd.key, i === cur ? "current" : done ? "done" : "plain", fsN);
    });

    // The pointer x beside the running call: it prefers the right of the
    // node, or the outer side of the nil circle, and keeps clear of every
    // line and circle.
    const circles = f.nodes.map((_, i) => ({ ...P(i), r: R }));
    if (nilPos) circles.push({ ...nilPos, r: rn });
    const scene = { lines, circles, taken: [], fs: fsTag, tw: tagW, w, h: rowTop - 2 };
    let spot = null;
    if (cur !== null) spot = tagSpot(P(cur), R, 0, scene);
    else if (nilPos) spot = tagSpot(nilPos, rn, f.nil.side === "left" ? Math.PI : 0, scene);
    if (spot) svg += tag(spot.x, spot.y + fsTag * 0.36, "x", fsTag);

    // The output row: the cell of each key right under its node.
    const cw = Math.max(8, pitch - Math.max(3, pitch * 0.12));
    const fsC = Math.min(fsKey, (cw - 4) / (2 * 0.6));
    f.nodes.forEach((nd, i) => {
      const p = P(i);
      svg += f.printed[i]
        ? cell(p.x - cw / 2, rowTop, cw, CELL_H, nd.key, "done", fsC)
        : cell(p.x - cw / 2, rowTop, cw, CELL_H, "", "slot", fsC);
    });

    const outKeys = f.nodes.filter((_, i) => f.printed[i]).map((nd) => nd.key).sort((a, b) => a - b);
    const label =
      `Søketre med ${f.n} noder over utskriftsraden. ` +
      (outKeys.length ? `Skrevet ut: ${outKeys.join(" ")}.` : "Ingenting er skrevet ut ennå.");
    stage.innerHTML = svgWrap(w, h, svg, label);
  },
};
