/**
 * Doubly linked list, for <Stepper>, driving the block `liste-kode` in modul
 * 02. The one idea: a list is nodes that point at each other. The nodes stay
 * where they are in memory, and only pointers change. List-Search walks node
 * by node along the next pointers (Θ(n)); List-Delete, List-Prepend and
 * List-Insert change a fixed number of pointers at a node you already have
 * (Θ(1)), whatever the length. A pointer is an address: the variable x holds a
 * number, and the drawing shows each node's address above it.
 *
 * Line numbers are the block's own (pseudocode as CLRS 4th ed. §10.2 and the
 * lecture print it; pseudocode line k of a procedure is block line h + k for
 * the header line h):
 *    1 List-Search(L, k)          7 List-Delete(L, x)
 *    2 1  x = L.head              8 1  if x.prev ≠ nil
 *    3 2  while x ≠ nil and …     9 2      x.prev.next = x.next
 *    4 3      x = x.next         10 3  else L.head = x.next
 *    5 4  return x               11 4  if x.next ≠ nil
 *                                12 5      x.next.prev = x.prev
 *   14 List-Prepend(L, x)        21 List-Insert(x, y)
 *   15 1  x.next = L.head        22 1  x.next = y.next
 *   16 2  x.prev = nil           23 2  x.prev = y
 *   17 3  if L.head ≠ nil        24 3  if y.next ≠ nil
 *   18 4      L.head.prev = x    25 4      y.next.prev = x
 *   19 5  L.head = x             26 5  y.next = x
 *
 * One frame per executed pseudocode line (every run of the while test and
 * every if test is a line), plus one start frame per call on its header line.
 * The default script is the lecture's list (CLRS figure 10.3) L = 9, 16, 4, 1,
 * each node at its own 4-digit address (the lecture's slides use hex; decimal
 * here): List-Search(L, 4), List-Delete(L, x) on the node found, List-Prepend
 * with a new node 25, List-Insert with a new node 36 after y = 16. That is
 * 8 + 5 + 6 + 6 = 25 frames; the calls start at frames 1, 9, 14 and 20 (the
 * step counter's numbers), and the list ends as 25, 9, 16, 36, 1. Shuffle deals
 * four random keys at random addresses and runs the same four calls.
 *
 * Drawing: a node is a rounded rect with its key, its address above it in
 * --faint. Next pointers run above the centre line, prev pointers below it
 * (every arrow keeps to the left of its direction, so a next and a prev
 * between the same two nodes never overlap, also on a diagonal). The node a
 * call links in or takes out is drawn under the row, in the gap between its
 * neighbours; the row is laid out again only when a new call starts, so no
 * node moves while its pointers change (List-Delete's start frame is where
 * the found node drops under the row). L.head's name sits on its own line
 * above the addresses and its arrow comes down beside the first slot: a
 * phone's stage is only about 276 px wide, so the name may not cost width.
 * The variables x and y are labelled arrows from below.
 *
 * Colours are framework tokens only, so frames re-theme on the light/dark
 * toggle. In the dark theme the course accent and --orange are close in hue,
 * so each role has a second cue. Accent and thick = the pointer this line
 * writes. Orange and thin = a pointer field this line reads (L.head, x.next,
 * x.prev, y.next; the variable a field is reached through is not marked).
 * Solid orange node = the node whose key the while test compares with k. Pale
 * accent with a heavy accent outline = the node x holds. A node nothing in the
 * list points at any more is dashed and faded, and its own pointers, when
 * this line does not read them, are faint and dashed.
 */

/** The lecture's list and the module's script; the module text describes it. */
const FIRST = {
  keys: [9, 16, 4, 1],
  addrs: ["4012", "1672", "2920", "3168"],
  k: 4,
  pre: { key: 25, addr: "1300" },
  ins: { key: 36, addr: "2204", y: 16 },
};

function pick(n, lo, hi) {
  const s = new Set();
  while (s.size < n) s.add(lo + Math.floor(Math.random() * (hi - lo + 1)));
  return [...s];
}

/** Four keys in 1–40 at four addresses, a key to find, two new nodes, a y. */
function dealt() {
  const keys = pick(6, 1, 40);
  const addrs = pick(6, 1000, 9999).map(String);
  const k = keys[Math.floor(Math.random() * 4)];
  const after = [keys[4], ...keys.slice(0, 4).filter((v) => v !== k)];
  return {
    keys: keys.slice(0, 4),
    addrs: addrs.slice(0, 4),
    k,
    pre: { key: keys[4], addr: addrs[4] },
    ins: { key: keys[5], addr: addrs[5], y: after[Math.floor(Math.random() * after.length)] },
  };
}

// The first view must be the lecture's script (the module text describes it),
// also when the reader comes back to the page. Same detection as
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

const WORD = ["ingen", "én", "to", "tre", "fire", "fem"];
const noder = (n) => `${WORD[n] ?? n} ${n === 1 ? "node" : "noder"}`;

const FONT = "font-family:var(--font-mono)";
const XS = `${FONT};font-size:var(--text-xs)`;
const SM = `${FONT};font-size:var(--text-sm);font-weight:600`;

/** Arrow styles: plain, written (accent, thicker), read (orange), stale. */
const PTR = {
  plain: { stroke: "var(--muted)", wdt: 1.5, head: 7 },
  set: { stroke: "var(--accent)", wdt: 3.2, head: 9 },
  read: { stroke: "var(--orange)", wdt: 1.7, head: 7 },
  stale: { stroke: "var(--faint)", wdt: 1.3, head: 6.5, dash: "4 3" },
};

const f1 = (v) => v.toFixed(1);

function unit(dx, dy) {
  const l = Math.hypot(dx, dy) || 1;
  return { x: dx / l, y: dy / l };
}

export default {
  defaultData() {
    if (calls++ === 0 || firstLoad()) return FIRST;
    return dealt();
  },

  run(input) {
    const D = input && input.keys ? input : FIRST;
    const key = new Map(); // address → key
    const next = new Map(); // address → address | null (nil); absent = not set yet
    const prev = new Map();
    D.addrs.forEach((a, i) => {
      key.set(a, D.keys[i]);
      next.set(a, i + 1 < D.addrs.length ? D.addrs[i + 1] : null);
      prev.set(a, i > 0 ? D.addrs[i - 1] : null);
    });
    let head = D.addrs[0];
    const K = (a) => key.get(a);
    const order = () => {
      const out = [];
      for (let p = head; p != null; p = next.get(p)) out.push(p);
      return out;
    };
    const listed = () => order().map(K).join(", ");
    // Does anything in the list (L.head or a node in it) point at a?
    const pointedAt = (a) => head === a || order().some((b) => b !== a && (next.get(b) === a || prev.get(b) === a));

    const frames = [];
    let slots = [];
    let vars = {};
    let gone = null; // the node List-Delete takes out, once nothing points at it
    const snap = (line, desc, m = {}) =>
      frames.push({
        line,
        desc,
        vars: { ...vars },
        slots: slots.map((s) => ({ ...s })),
        key: Object.fromEntries(key),
        next: Object.fromEntries(next),
        prev: Object.fromEntries(prev),
        head,
        x: m.x ?? null,
        y: m.y ?? null,
        set: m.set ?? [],
        read: m.read ?? [],
        compared: m.compared ?? null,
        gone: gone && !pointedAt(gone) ? gone : null,
      });
    const row = (below) => order().map((a) => ({ a, below: a === below }));

    // ---- List-Search(L, k) -------------------------------------------------
    const k = D.k;
    slots = row(null);
    vars = { "L.head": head, k, x: "–" };
    snap(1, `List-Search(L, ${k}) leter etter en node med nøkkel ${k}. Søket starter i L.head og følger next-pekerne.`);
    let x = head;
    vars.x = x;
    snap(2, `x = L.head: x får ${x} fra L.head og peker nå på ${K(x)}.`, { x, set: ["x"], read: ["head"] });
    let seen = 0;
    for (;;) {
      if (x != null && K(x) !== k) {
        seen += 1;
        snap(3, `x er ikke nil, og x.key = ${K(x)} er ikke ${k}, så løkka fortsetter.`, { x, compared: x });
        const from = x;
        x = next.get(x);
        vars.x = x ?? "nil";
        snap(
          4,
          x != null
            ? `x = x.next: x får ${x} fra next-pekeren i ${K(from)} og peker nå på ${K(x)}.`
            : `x = x.next: next-pekeren i ${K(from)} er nil, så x blir nil.`,
          { x, set: ["x"], read: [`n:${from}`] },
        );
        continue;
      }
      if (x != null) seen += 1;
      snap(3, x != null ? `x.key = ${k} er lik k, så løkka stopper.` : `x er nil, så løkka stopper.`, {
        x,
        compared: x,
      });
      break;
    }
    snap(
      5,
      x != null
        ? `List-Search returnerer x = ${x}, noden med ${k}. Søket sammenlignet k med nøkkelen i ${noder(seen)}.`
        : `List-Search returnerer nil: ingen node har nøkkel ${k}.`,
      { x },
    );

    // ---- List-Delete(L, x) on the node found -------------------------------
    const xd = x;
    slots = row(xd);
    vars = { "L.head": head, x: xd };
    gone = xd;
    snap(
      7,
      `List-Delete(L, x) tar noden med ${K(xd)} ut av lista. x = ${xd} kommer fra søket, så List-Delete trenger ikke å lete.`,
      {
        x: xd,
      },
    );
    const p = prev.get(xd);
    const q = next.get(xd);
    const still = () =>
      ` Ingen i lista peker på ${K(xd)} lenger, men ${K(xd)} peker fortsatt på ` +
      [p, q]
        .filter((a) => a != null)
        .map(K)
        .join(" og ") +
      ".";
    if (p != null) {
      snap(8, `${K(p)} står foran ${K(xd)}, så x.prev er ikke nil.`, { x: xd, read: [`p:${xd}`] });
      next.set(p, q);
      snap(
        9,
        q != null
          ? `x.prev.next = x.next: ${K(p)} peker nå forbi ${K(xd)}, rett på ${K(q)}.`
          : `x.prev.next = x.next: next-pekeren i ${K(p)} blir nil, så ${K(p)} står nå sist.`,
        { x: xd, set: [`n:${p}`], read: [`p:${xd}`, `n:${xd}`] },
      );
    } else {
      snap(8, `Ingen node står foran ${K(xd)}, så x.prev er nil.`, { x: xd, read: [`p:${xd}`] });
      head = q;
      vars["L.head"] = head ?? "nil";
      snap(10, q != null ? `L.head = x.next: lista starter nå i ${K(q)}.` : `L.head = x.next: lista er tom.`, {
        x: xd,
        set: ["head"],
        read: [`n:${xd}`],
      });
    }
    if (q != null) {
      snap(11, `${K(q)} står etter ${K(xd)}, så x.next er ikke nil.`, { x: xd, read: [`n:${xd}`] });
      prev.set(q, p);
      snap(
        12,
        (p != null
          ? `x.next.prev = x.prev: ${K(q)} peker nå tilbake på ${K(p)}.`
          : `x.next.prev = x.prev: prev-pekeren i ${K(q)} blir nil.`) + still(),
        { x: xd, set: [`p:${q}`], read: [`n:${xd}`, `p:${xd}`] },
      );
    } else {
      snap(11, `x.next er nil, fordi ${K(xd)} sto sist.` + still(), {
        x: xd,
        read: [`n:${xd}`],
      });
    }
    gone = null;

    // ---- List-Prepend(L, x) with a new node --------------------------------
    const xn = D.pre.addr;
    key.set(xn, D.pre.key);
    slots = [{ a: xn, below: true }, ...row(null)];
    vars = { "L.head": head ?? "nil", x: xn };
    snap(14, `List-Prepend(L, x) setter den nye noden x med ${K(xn)} først i lista. Pekerne i x er ikke satt ennå.`, {
      x: xn,
    });
    next.set(xn, head);
    snap(
      15,
      head != null
        ? `x.next = L.head: ${K(xn)} peker på ${K(head)}, som står først.`
        : `x.next = L.head: lista er tom, så ${K(xn)} peker på nil.`,
      { x: xn, set: [`n:${xn}`], read: ["head"] },
    );
    prev.set(xn, null);
    snap(16, `x.prev = nil: ingen node står foran ${K(xn)}.`, { x: xn, set: [`p:${xn}`] });
    if (head != null) {
      snap(17, `Lista er ikke tom, så L.head er ikke nil.`, { x: xn, read: ["head"] });
      prev.set(head, xn);
      snap(18, `L.head.prev = x: ${K(head)} peker nå tilbake på ${K(xn)}.`, {
        x: xn,
        set: [`p:${head}`],
        read: ["head"],
      });
    } else {
      snap(17, `Lista er tom, så L.head er nil.`, { x: xn, read: ["head"] });
    }
    head = xn;
    vars["L.head"] = head;
    snap(19, `L.head = x: lista er nå ${listed()}.`, { x: xn, set: ["head"] });

    // ---- List-Insert(x, y) with a new node after y -------------------------
    const xi = D.ins.addr;
    const ya = order().find((a) => K(a) === D.ins.y) ?? head;
    key.set(xi, D.ins.key);
    slots = row(null);
    slots.splice(slots.findIndex((s) => s.a === ya) + 1, 0, { a: xi, below: true });
    vars = { x: xi, y: ya };
    const xy = { x: xi, y: ya };
    snap(
      21,
      `List-Insert(x, y) setter den nye noden x med ${K(xi)} inn etter y, noden med ${K(ya)}. Pekerne i x er ikke satt ennå.`,
      xy,
    );
    const yn = next.get(ya);
    next.set(xi, yn);
    snap(
      22,
      yn != null
        ? `x.next = y.next: ${K(xi)} peker på ${K(yn)}, som står etter ${K(ya)}.`
        : `x.next = y.next: ingen node står etter ${K(ya)}, så ${K(xi)} peker på nil.`,
      { ...xy, set: [`n:${xi}`], read: [`n:${ya}`] },
    );
    prev.set(xi, ya);
    snap(23, `x.prev = y: ${K(xi)} peker tilbake på ${K(ya)}.`, { ...xy, set: [`p:${xi}`] });
    if (yn != null) {
      snap(24, `${K(yn)} står etter ${K(ya)}, så y.next er ikke nil.`, { ...xy, read: [`n:${ya}`] });
      prev.set(yn, xi);
      snap(25, `y.next.prev = x: ${K(yn)} peker nå tilbake på ${K(xi)}.`, {
        ...xy,
        set: [`p:${yn}`],
        read: [`n:${ya}`],
      });
    } else {
      snap(24, `Ingen node står etter ${K(ya)}, så y.next er nil.`, { ...xy, read: [`n:${ya}`] });
    }
    next.set(ya, xi);
    snap(26, `y.next = x: ${K(ya)} peker nå på ${K(xi)}. Lista er ${listed()}.`, { ...xy, set: [`n:${ya}`] });

    return frames;
  },

  render(stage, f, api) {
    drawn.add(stage);
    const { w, h } = api.getSize();
    if (!f.slots || !f.slots.length || w <= 0 || h <= 0) {
      stage.innerHTML = "";
      return;
    }

    // Type sizes in px, read from the root so the layout follows the reader's
    // text size. IBM Plex Mono advances 0.6 em per glyph.
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    const fsSm = 0.84 * rem;
    const fsXs = 0.72 * rem;
    const textW = (s, fs) => s.length * 0.6 * fs;

    // Horizontal: «nil» at both ends and five slots between (the most any
    // call needs; the row is centred when it uses fewer). L.head's name sits
    // on its own line above the addresses, so it costs height, not width: a
    // phone's stage is only about 276 px wide. Node size and gaps follow the
    // stage width, capped so a wide screen does not blow the nodes up; type
    // never scales.
    const NIL_L = 10; // a nil pointer's stub
    const nilW = NIL_L + 2 + textW("nil", fsXs);
    const HOOK = 11; // L.head's arrow comes down this far left of the first slot
    const leftM = Math.max(nilW, HOOK + 4) + 2;
    const rightM = nilW + 2;
    const avail = w - 4 - leftM - rightM;
    let W = Math.min(46, Math.max(24, (0.65 * avail) / 4.65));
    let G = Math.min(40, Math.max(12, (avail - 5 * W) / 4));
    if (5 * W + 4 * G > avail) W = Math.max(22, (avail - 4 * G) / 5);
    const S = W + G;
    const H = Math.min(34, Math.max(28, W));
    const OFF = Math.round(H * 0.24); // lane offset of a pointer from the centre line
    const DOFF = 5; // the same on a diagonal

    // Vertical: L.head's name, the addresses, the row, its x/y markers, then
    // the band under the row with the node a call links in or takes out, and
    // its marker. The whole block is centred, also when the band is empty, so
    // the row stays at one height through the script.
    const MK_L = 11; // a marker's arrow
    const mkBelow = 3 + MK_L + 0.75 * fsSm + 4; // node bottom → marker label baseline
    const VG = Math.min(48, Math.max(30, 0.62 * S)); // row bottom → band top
    const headLine = 0.75 * fsSm + 7; // L.head's line above the addresses
    const addrLine = 0.75 * fsXs + 9;
    const total = headLine + addrLine + H + VG + H + mkBelow + 4;
    const top = Math.max(2, (h - total) / 2);
    const headY = top + 0.75 * fsSm; // baseline of «L.head»
    const rowTop = top + headLine + addrLine;
    const rowC = rowTop + H / 2;
    const lowC = rowTop + H + VG + H / 2;

    // Gaps for this call: node size stays the same through the script, but
    // a call with four slots spreads them wider than List-Insert's five, and
    // a gap next to the node under the row is a third wider, so its
    // diagonals are less steep and clear its address.
    const n = f.slots.length;
    const low = (i) => f.slots[i].below || f.slots[i + 1].below;
    let nRl = 0;
    for (let i = 0; i + 1 < n; i++) if (low(i)) nRl += 1;
    const nRr = n - 1 - nRl;
    const free = avail - n * W;
    const Gu = free / (nRr + 1.35 * nRl || 1);
    const rr = Math.min(40, Math.max(14, Gu));
    const rl = nRl ? Math.min(1.35 * rr, Math.max(rr, (free - rr * nRr) / nRl)) : 0;
    const gaps = [];
    for (let i = 0; i + 1 < n; i++) gaps.push(low(i) ? rl : rr);
    const rowW = n * W + gaps.reduce((a, b) => a + b, 0);
    const x0 = (w - (leftM + rowW + rightM)) / 2 + leftM; // slot 0's left edge
    const box = new Map();
    let cx = x0 + W / 2;
    f.slots.forEach((s, i) => {
      box.set(s.a, { a: s.a, below: s.below, i, cx, cy: s.below ? lowC : rowC, hw: W / 2, hh: H / 2 });
      if (i < gaps.length) cx += W + gaps[i];
    });

    let svg = "";
    const text = (x, y, s, style, anchor = "middle") =>
      (svg += `<text x="${f1(x)}" y="${f1(y)}" text-anchor="${anchor}" style="${style}">${s}</text>`);

    const set = new Set(f.set);
    const read = new Set(f.read);
    const style = (id, owner) => {
      if (set.has(id)) return PTR.set;
      if (read.has(id)) return PTR.read;
      if (owner && owner === f.gone) return PTR.stale;
      return PTR.plain;
    };
    // Arrow layers: plain first, then read, then written on top.
    const layers = { plain: "", read: "", set: "" };
    const layerOf = (st) => (st === PTR.set ? "set" : st === PTR.read ? "read" : "plain");
    const headAt = (tip, u, st) => {
      const L = st.head;
      const hw = L * 0.5;
      const b = { x: tip.x - u.x * L, y: tip.y - u.y * L };
      return (
        `<polygon points="${f1(tip.x)},${f1(tip.y)} ${f1(b.x - u.y * hw)},${f1(b.y + u.x * hw)} ` +
        `${f1(b.x + u.y * hw)},${f1(b.y - u.x * hw)}" style="fill:${st.stroke}"/>`
      );
    };
    // A path that ends at `tip` arriving in direction u; `d` stops short of
    // the arrowhead so a thick line does not poke through its point.
    const arrow = (d, tip, u, st) => {
      const dash = st.dash ? ` stroke-dasharray="${st.dash}"` : "";
      layers[layerOf(st)] +=
        `<path d="${d}" fill="none" style="stroke:${st.stroke}" stroke-width="${st.wdt}"${dash}/>` + headAt(tip, u, st);
    };
    const straight = (a, b, st) => {
      const u = unit(b.x - a.x, b.y - a.y);
      const e = { x: b.x - u.x * (st.head - 1), y: b.y - u.y * (st.head - 1) };
      arrow(`M${f1(a.x)} ${f1(a.y)} L${f1(e.x)} ${f1(e.y)}`, b, u, st);
    };

    // A pointer from node A to node B. Both in the row: a straight lane above
    // (going right) or below (going left) the centre line. One of them under
    // the row: a diagonal from the row node's bottom edge to the low node's
    // side, kept to the left of its direction like the lanes.
    const link = (A, B, st) => {
      if (!A.below && !B.below) {
        const dir = Math.sign(B.cx - A.cx);
        const y = rowC - OFF * dir;
        straight({ x: A.cx + dir * A.hw, y }, { x: B.cx - dir * (B.hw + 1), y }, st);
        return;
      }
      // The pair shares one centre line, from the row node's bottom edge to
      // the low node's facing side; each pointer runs DOFF to the left of its
      // direction, so the two are parallel and never cross. Their ends sit on
      // the bottom edge and on the side, clear of the low node's address.
      const R = A.below ? B : A;
      const Lo = A.below ? A : B;
      const dir = Math.sign(Lo.cx - R.cx); // +1: the low node is right of R
      const by = R.cy + R.hh; // the row node's bottom edge
      const sx = Lo.cx - dir * Lo.hw; // the low node's facing side
      const p0 = { x: R.cx + dir * R.hw * 0.5, y: by };
      const p1 = { x: sx, y: Lo.cy + Lo.hh * 0.25 };
      const down = A === R;
      const u = down ? unit(p1.x - p0.x, p1.y - p0.y) : unit(p0.x - p1.x, p0.y - p1.y);
      const nx = u.y * DOFF;
      const ny = -u.x * DOFF;
      // Where the shifted line meets y = by and x = sx.
      const atY = { x: p0.x + nx + ((by - (p0.y + ny)) * (p1.x - p0.x)) / (p1.y - p0.y), y: by };
      const atX = { x: sx, y: p1.y + ny + ((sx - (p1.x + nx)) * (p1.y - p0.y)) / (p1.x - p0.x) };
      if (down) straight(atY, { x: atX.x - u.x, y: atX.y - u.y }, st);
      else straight(atX, { x: atY.x - u.x, y: atY.y - u.y }, st);
    };
    // A nil pointer: a stub out of the node's side and the word «nil».
    const nil = (A, isNext, st) => {
      const dir = isNext ? 1 : -1;
      const y = A.cy - OFF * dir;
      const sx = A.cx + dir * A.hw;
      const ex = sx + dir * NIL_L;
      straight({ x: sx, y }, { x: ex, y }, st);
      const col = st === PTR.set ? "var(--accent-ink)" : st === PTR.read ? "var(--orange)" : "var(--faint)";
      text(ex + dir * 2, y + 0.35 * fsXs, "nil", `fill:${col};${XS}`, isNext ? "start" : "end");
    };

    for (const A of box.values()) {
      for (const [field, isNext] of [
        ["next", true],
        ["prev", false],
      ]) {
        if (!(A.a in f[field])) continue; // not set yet
        const t = f[field][A.a];
        const st = style(`${isNext ? "n" : "p"}:${A.a}`, A.a);
        if (t == null) nil(A, isNext, st);
        else if (box.has(t)) link(A, box.get(t), st);
      }
    }

    // L.head: its name on the top line, left of the first slot's address, and
    // an arrow that comes down beside the addresses and turns right along the
    // next lane into the first node, or further down into a node under the
    // row. It always starts at the same place, so only its end moves.
    if (f.head != null && box.has(f.head)) {
      const T = box.get(f.head);
      const st = style("head", null);
      const hx = x0 - HOOK;
      text(hx - 4, headY, "L.head", `fill:var(--fg);${SM}`, "start");
      const ty = T.cy - OFF;
      const tip = { x: T.cx - T.hw - 1, y: ty };
      const e = tip.x - (st.head - 1);
      const r = 4;
      const d = `M${f1(hx)} ${f1(headY + 5)} V${f1(ty - r)} Q${f1(hx)} ${f1(ty)} ${f1(hx + r)} ${f1(ty)} H${f1(e)}`;
      arrow(d, tip, { x: 1, y: 0 }, st);
    }

    svg += layers.plain + layers.read + layers.set;

    // The nodes, with their addresses above them.
    for (const A of box.values()) {
      const x = A.cx - A.hw;
      const y = A.cy - A.hh;
      let fill = "color-mix(in srgb, var(--fg) 12%, transparent)";
      let stroke = "color-mix(in srgb, var(--fg) 30%, transparent)";
      let wdt = 1;
      let dash = "";
      let ink = "var(--fg)";
      if (A.a === f.gone) {
        // Out of the list: dashed and faded, whoever still holds it.
        fill = "none";
        stroke = "var(--muted)";
        wdt = 1.4;
        dash = ' stroke-dasharray="4 3"';
        ink = "var(--muted)";
      } else if (A.a === f.compared) {
        // Its key is read: solid orange, never told from the accent by hue alone.
        fill = "color-mix(in srgb, var(--orange) 32%, transparent)";
        stroke = "var(--orange)";
        wdt = 1.6;
      } else if (A.a === f.x) {
        // The node x holds: pale accent with a heavy accent outline.
        fill = "var(--accent-weak)";
        stroke = "var(--accent)";
        wdt = 2.4;
      }
      svg +=
        `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(W)}" height="${f1(H)}" rx="4" ` +
        `style="fill:${fill};stroke:${stroke}" stroke-width="${wdt}"${dash}/>`;
      text(A.cx, A.cy + 0.36 * fsSm, f.key[A.a], `fill:${ink};${SM}`);
      text(A.cx, y - 7, A.a, `fill:var(--faint);${XS}`);
    }

    // The variables x and y: their names under arrows that point up into the
    // node they hold. On a row node with a diagonal to its right (y, whose
    // new neighbour is under the row), the marker moves left of centre.
    const marker = (name, a, id) => {
      if (a == null || !box.has(a)) return;
      const A = box.get(a);
      let mx = A.cx;
      if (!A.below) {
        const right = [...box.values()].some((B) => B.below && B.i === A.i + 1);
        const left = [...box.values()].some((B) => B.below && B.i === A.i - 1);
        if (right && !left) mx -= A.hw * 0.6;
        else if (left && !right) mx += A.hw * 0.6;
      }
      const st = style(id, null);
      const by = A.cy + A.hh;
      straight({ x: mx, y: by + 3 + MK_L }, { x: mx, y: by + 1.5 }, st);
      text(mx, by + mkBelow, name, `fill:var(--fg);${SM}`);
    };
    layers.plain = layers.read = layers.set = "";
    marker("x", f.x, "x");
    marker("y", f.y, "y");
    svg += layers.plain + layers.read + layers.set;

    stage.innerHTML =
      `<svg width="100%" height="100%" viewBox="0 0 ${w.toFixed(0)} ${h.toFixed(0)}" ` +
      `preserveAspectRatio="none" role="img" aria-hidden="true" style="display:block">${svg}</svg>`;
  },
};
