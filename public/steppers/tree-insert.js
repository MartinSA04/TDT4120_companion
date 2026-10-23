/**
 * Tree-Insert on a binary search tree, for <Stepper>, driving the block
 * `tree-insert-kode` in modul 06. The one idea: Tree-Insert walks down exactly
 * the path Tree-Search would take for z.key, until it falls off the tree at a
 * nil. y trails one step behind x, so when x is nil, y is the node z must hang
 * on, and z.key < y.key says on which side. A new node always becomes a leaf,
 * and it lands in the gap between its neighbours in sorted order.
 *
 * Block line numbers count the header as line 1 (pseudocode line k is block
 * line k + 1), the pseudocode as CLRS 4th ed. §12.3 and the lecture print it:
 *    1 Tree-Insert(T, z)
 *    2 1  x = T.root
 *    3 2  y = nil
 *    4 3  while x ≠ nil
 *    5 4      y = x
 *    6 5      if z.key < x.key
 *    7 6          x = x.left
 *    8 7      else x = x.right
 *    9 8  z.p = y
 *   10 9  if y == nil
 *   11 10     T.root = z
 *   12 11 elseif z.key < y.key
 *   13 12     y.left = z
 *   14 13 else y.right = z
 *
 * Input { keys, z }: the tree is built by inserting `keys` in that order (no
 * frames for that), then Tree-Insert(T, z) is traced. Frames: the start (1),
 * x = T.root (2), y = nil (3), per node on the way down two frames: the loop
 * test with y = x (4, 5) and the comparison with x's move (6, 7 or 6, 8);
 * then the loop test that stops it (4), z.p = y (9), y == nil? (10),
 * z.key < y.key? (12) and the hanging of z (13 or 14). With L nodes on the
 * way down (L = the depth z gets) that is 8 + 2L frames: 14 for the
 * lecture's instance. The tree is never empty (n ≥ 4), so line 11 is never
 * reached.
 *
 * The first instance is the lecture's (lecture 5) and CLRS fig. 12.3's: keys
 * 12, 5, 18, 2, 9, 15, 19, 17 give root 12; 5 and 18 under it; 2 and 9 under
 * 5; 15 and 19 under 18; 17 the right child of 15. z.key = 13. The way down
 * is 12 (13 < 12 usant, right) → 18 (13 < 18 sant, left) → 15 (13 < 15 sant,
 * left) → nil, so y = 15 and z becomes 15's left child, between 12 and 15 in
 * sorted order. Checked by running this file's run() in node (see the
 * report). Later instances: n distinct keys from 1 … 99 in random order and
 * a random z.key from 1 … 99 not in the tree.
 *
 * The drawing: the tree laid out with bstPos (x = the node's place in sorted
 * order, y = its depth), so «smaller to the left» is «further left». Of the
 * nil children only the one z will take is drawn, from the first frame on:
 * a dashed empty circle hung on y by a dashed line. It is the gap in sorted
 * order where z.key belongs. z stands as its own node in the top right
 * corner until line 13/14 hangs it; then it stands in that place, green. The
 * pointers x and y are small tags beside their node, y preferring the left
 * and x the right, each moved round the node when a line or circle is in the
 * way, so both read when they stand on the same node; when x is nil, its tag
 * stands at the dashed place. z waits in the top left corner instead when the
 * tree reaches into the top right one, and when both are taken the tree moves
 * down below it; the choice holds for every frame of an instance. The way
 * down from the root to x (to the dashed place once x is nil) is drawn in
 * the accent.
 *
 * Colours are framework tokens only, through _tre.js's marks, so frames
 * re-theme on the light/dark toggle: current (accent) = x's node and z while
 * it waits; compared (indigo ring) = the node whose key z.key is compared
 * with on this frame (x's old node on block line 6, y on block line 12);
 * done (green) = z once it hangs; slot (dashed, empty) = the nil place z
 * will take.
 */

import { EDGE, node, edge, tag, bstPos, svgWrap, remPx, textW } from "./_tre.js";

/** The lecture's instance (lecture 5; CLRS fig. 12.3). */
const FIRST = { keys: [12, 5, 18, 2, 9, 15, 19, 17], z: 13 };

/** `size` distinct keys from 1 … 99 in random order, and a z.key not among them. */
function dealt(size) {
  const pool = Array.from({ length: 99 }, (_, i) => i + 1);
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return { keys: pool.slice(0, size), z: pool[size] };
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

const SIDE = { left: "venstre", right: "høyre" };

export default {
  sizeRange: { min: 4, max: 12, default: 8 },
  defaultData(size = 8) {
    if (calls++ === 0 || firstLoad()) return { keys: [...FIRST.keys], z: FIRST.z };
    return dealt(size);
  },

  run(input) {
    const { nodes, root } = build(input.keys);
    const zKey = input.z;
    const n = nodes.length;
    const key = (i) => nodes[i].key;

    // The way down Tree-Search would take for z.key, and the nil it ends at.
    const path = [];
    for (let x = root; x !== null; x = zKey < key(x) ? nodes[x].left : nodes[x].right) path.push(x);
    const y = path[path.length - 1];
    const side = zKey < key(y) ? "left" : "right";
    const slot = [{ parent: y, side }];

    // z.key's neighbours in sorted order: the gap the dashed place stands in.
    const sorted = nodes.map((nd) => nd.key).sort((a, b) => a - b);
    const below = sorted.filter((k) => k < zKey);
    const above = sorted.filter((k) => k > zKey);
    const lo = below.length ? below[below.length - 1] : null;
    const hi = above.length ? above[0] : null;
    let gap;
    if (lo === null) gap = `foran ${hi}`;
    else if (hi === null) gap = `etter ${lo}`;
    else gap = `mellom ${lo} og ${hi}`;

    const frames = [];
    let vx = "–";
    let vy = "–";
    const snap = (line, desc, st) =>
      frames.push({
        line,
        desc,
        vars: { x: vx, y: vy, "z.key": zKey },
        n,
        nodes,
        root,
        slot,
        path,
        zKey,
        xAt: null, // a node index, "slot" (x = nil) or null (x not set)
        yAt: null,
        cmp: null,
        pathLen: 0, // the first pathLen nodes of `path` are on the accent way
        pathSlot: false, // the dashed line from y to the place, in the accent
        hung: false,
        ...st,
      });

    snap(
      1,
      `Tree-Insert(T, z) skal sette inn z, med nøkkel ${zKey}. ` +
        `I sortert rekkefølge hører ${zKey} hjemme ${gap}, der den tomme plassen står.`,
      {},
    );

    vx = key(root);
    snap(2, `x = T.root: x står på rota, ${key(root)}.`, { xAt: root, pathLen: 1 });

    vy = "nil";
    snap(3, "y = nil. På veien ned følger y ett steg bak x.", { xAt: root, pathLen: 1 });

    for (let k = 0; k < path.length; k++) {
      const at = path[k];
      vy = key(at);
      snap([4, 5], `x ≠ nil, så y = x: y står på ${key(at)}.`, { xAt: at, yAt: at, pathLen: k + 1 });

      const less = zKey < key(at);
      const next = k + 1 < path.length ? path[k + 1] : null;
      const cmp = `${zKey} < ${key(at)} er ${less ? "sant" : "usant"}, så x = x.${less ? "left" : "right"}`;
      if (next !== null) {
        vx = key(next);
        snap(less ? [6, 7] : [6, 8], `${cmp}: x går til ${key(next)}.`, {
          xAt: next,
          yAt: at,
          cmp: at,
          pathLen: k + 2,
        });
      } else {
        vx = "nil";
        snap(less ? [6, 7] : [6, 8], `${cmp}. ${key(at)} har ikke noe ${SIDE[side]} barn, så x = nil.`, {
          xAt: "slot",
          yAt: at,
          cmp: at,
          pathLen: k + 1,
          pathSlot: true,
        });
      }
    }

    const after = { xAt: "slot", yAt: y, pathLen: path.length, pathSlot: true };
    snap(4, `x = nil, så løkka stopper. y = ${key(y)} er den siste noden på veien.`, after);
    snap(9, `z.p = y: forelderen til z blir ${key(y)}.`, after);
    snap(10, "y == nil er usant, fordi treet ikke er tomt.", after);
    const less = side === "left";
    snap(12, `z.key < y.key: ${zKey} < ${key(y)} er ${less ? "sant" : "usant"}.`, { ...after, cmp: y });
    snap(
      less ? 13 : 14,
      `y.${side} = z: ${zKey} henger som ${SIDE[side]} barn av ${key(y)}. ` +
        `Den nye noden er en løvnode og står ${gap} i sortert rekkefølge.`,
      { ...after, hung: true },
    );
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

    // Horizontal: one place per node plus the dashed place, at one pitch.
    // The side margin leaves room for a tag beside the outermost node.
    const probe = bstPos(f.nodes, f.root, { x0: 0, y0: 0, w: 1, dy: 1 }, f.slot);
    const places = probe.count;
    const D = Math.max(1, probe.depth);
    const rMax = Math.max(12, Math.min(17, 1.05 * rem));
    let padX = 4;
    let pitch = 0;
    let r = 0;
    for (let pass = 0; pass < 3; pass++) {
      pitch = (w - 2 * padX) / places;
      r = Math.min(rMax, pitch * 0.42);
      padX = Math.max(4, r + TAG_GAP + tagW + 2 - pitch / 2);
    }
    // A small tree keeps its proportions on a wide stage and stands centred.
    pitch = Math.min(pitch, 4.6 * rMax);
    const x0 = (w - pitch * places) / 2;

    // Vertical: the levels share the height, at most about three radii apart,
    // and the tree stands centred. z waits in the top right corner, or in the
    // top left one when the tree's top levels reach into the right one; when
    // both are taken, the tree moves down below z. The choice is the same on
    // every frame of an instance, so the tree never jumps.
    const PAD = 4;
    const layout = (top) => {
      const room = h - top - PAD - 2 * r;
      const dy = Math.min(3.4 * r, room / D);
      // Nodes next to each other in sorted order are never on the same level,
      // so they stand at least √(pitch² + dy²) apart; keep the circles clear.
      const rr = Math.min(r, (Math.hypot(pitch, dy) - 3) / 2);
      const used = 2 * rr + D * dy;
      const y0 = top + rr + Math.max(0, (h - top - PAD - used) / 2);
      return { rr, dy, ...bstPos(f.nodes, f.root, { x0, y0, w: pitch * places, dy }, f.slot) };
    };
    let L = layout(PAD);
    const zy = PAD + r;
    const corners = [w - PAD - r, PAD + TAG_GAP + tagW + 2 + r];
    const clear = (zx) =>
      ![...L.pos.values(), ...L.extraPos].some(
        (p) => Math.abs(p.x - zx) < 2 * L.rr + TAG_GAP + tagW + 10 && Math.abs(p.y - zy) < 2 * L.rr + 12,
      );
    let zx = corners.find(clear);
    if (zx === undefined) {
      zx = corners[0];
      L = layout(zy + r + 20);
    }
    const R = L.rr;
    const fsN = Math.min(fsKey, (2 * R - 4) / (2 * 0.6));
    const P = (i) => L.pos.get(i);
    const S = L.extraPos[0];
    const yNode = f.slot[0].parent;

    // The accent way: the first pathLen nodes of the path.
    const onWay = new Set();
    for (let k = 1; k < f.pathLen; k++) onWay.add(f.path[k]);

    let svg = "";
    const lines = []; // every line drawn, for placing the tags
    // Edges: every real edge, the way down in the accent.
    f.nodes.forEach((nd, i) => {
      if (nd.p === null) return;
      svg += edge(P(nd.p), P(i), R, onWay.has(i) ? "path" : "plain");
      lines.push({ a: P(nd.p), b: P(i) });
    });
    // The dashed line from y to the place z will take.
    {
      const a = P(yNode);
      lines.push({ a, b: S });
      if (f.hung) svg += edge(a, S, R, "path");
      else {
        const dx = S.x - a.x;
        const dy = S.y - a.y;
        const d = Math.hypot(dx, dy) || 1;
        const st = f.pathSlot ? EDGE.path : EDGE.slot;
        svg +=
          `<line x1="${(a.x + (dx / d) * R).toFixed(1)}" y1="${(a.y + (dy / d) * R).toFixed(1)}" ` +
          `x2="${(S.x - (dx / d) * R).toFixed(1)}" y2="${(S.y - (dy / d) * R).toFixed(1)}" ` +
          `style="stroke:${st.stroke}" stroke-width="${f.pathSlot ? 2.2 : st.wdt}" stroke-linecap="round" stroke-dasharray="4 4"/>`;
      }
    }

    // Nodes.
    f.nodes.forEach((nd, i) => {
      let mark = "plain";
      if (f.cmp === i) mark = "compared";
      else if (f.xAt === i) mark = "current";
      const p = P(i);
      svg += node(p.x, p.y, R, nd.key, mark, fsN);
    });
    // The place z takes: dashed and empty, then z itself, green.
    svg += f.hung ? node(S.x, S.y, R, f.zKey, "done", fsN) : node(S.x, S.y, R, "", "slot", fsN);

    // Tags, placed clear of every line and circle: y prefers the left of its
    // node, x the right (of the dashed place when x = nil); once z hangs, z's
    // own tag takes x's side. z waits in the corner with its tag to the left.
    const circles = [...f.nodes.map((_, i) => ({ ...P(i), r: R })), { ...S, r: R }];
    if (!f.hung) circles.push({ x: zx, y: zy, r: R });
    const scene = { lines, circles, taken: [], fs: fsTag, tw: tagW, w, h };
    const put = (p, name, prefer) => {
      const t = tagSpot(p, R, prefer, scene);
      svg += tag(t.x, t.y + fsTag * 0.36, name, fsTag);
    };
    if (!f.hung) {
      svg += node(zx, zy, R, f.zKey, "current", fsN);
      put({ x: zx, y: zy }, "z", Math.PI);
    }
    if (f.yAt !== null) put(P(f.yAt), "y", Math.PI);
    if (f.hung) put(S, "z", 0);
    else if (f.xAt === "slot") put(S, "x", 0);
    else if (f.xAt !== null) put(P(f.xAt), "x", 0);

    const where =
      f.xAt === "slot" ? "x er nil" : f.xAt !== null ? `x står på ${f.nodes[f.xAt].key}` : "x er ikke satt ennå";
    const label = f.hung
      ? `Søketreet med ${f.zKey} hengt på som ${f.slot[0].side === "left" ? "venstre" : "høyre"} barn av ${f.nodes[yNode].key}.`
      : `Søketreet med ${f.n} noder og z = ${f.zKey} ved siden av; ${where}.`;
    stage.innerHTML = svgWrap(w, h, svg, label);
  },
};
