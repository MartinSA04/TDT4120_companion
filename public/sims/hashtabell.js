/**
 * Hashtabell med kjeding for TDT4120 modul 02: how long the lists get depends
 * on how well the hash function spreads the keys.
 *
 * One idea: the table T[0 : m − 1] has one linked list per slot, and key k goes
 * into the list in slot h(k). With a good spread every list holds about
 * α = n/m keys, and a search walks about that far; with a bad spread a few
 * lists get almost everything. The division method h(k) = k mod m sees only
 * k mod m (with m = 10, the last digit), so the choice of m matters for it;
 * the multiplication method h(k) = ⌊m · (kA mod 1)⌋, A = (√5 − 1)/2, mixes
 * every digit of k and cares much less about m.
 *
 * Drawing (CLRS figure 11.3): T as a vertical column of slots with the index
 * j beside each. A non-empty slot holds a pointer (a dot and an arrow) to the
 * first node of its list; an empty slot holds nil and is drawn as an empty
 * cell (a «nil» in each of up to 16 cells cost the chains the width they need
 * on a phone). The nodes of a list go right in a row, next arrows only (the
 * book's lists are doubly linked; the text says so). Insertion is
 * Chained-Hash-Insert, which is List-Prepend: the keys are inserted in list
 * order, each at the FRONT of its list, so the newest key of a list stands
 * first. The key inserted last of all (the n-th) is the accent node, the
 * element written in the last step.
 *
 * α = n/m is one dashed violet line across the chains at the right edge of
 * node α: x = right edge of the slot + α node pitches (the slot's arrow plus
 * a node is one pitch), so a list of L nodes reaches past the line exactly when
 * L > α and ends on it when L = α. It is drawn behind the nodes, so a list
 * longer than α covers it. Its label at the top is the only number outside the
 * keys: «α = 1,2», or «α ≈ 1,09» when n/m is rounded to two decimals.
 *
 * The node pitch is fixed by the stage width alone: the line at the largest α
 * (32/5 = 6,4) must fit. A list longer than the stage holds shows the nodes
 * that fit, then a next arrow to «+k» (the nodes not drawn) at the right end
 * of the stage, past the line at every α; like a node, the label hides the
 * line. On the 291 px stage at 390 px a list is drawn in full up to 6 nodes,
 * otherwise as 5 nodes and «+k»; on the 739 px stage at 1100 px in full up to
 * 14, otherwise as 13 and «+k». The row pitch is set for m = 16 and the
 * column is anchored at the top, so changing m or n only grows or shrinks the
 * column and rebuilds the lists.
 *
 * Numbers the module text uses (default key lists below, checked by running
 * this file's own chainsOf and HASH; lists front first):
 *  - Rest (k mod m, tilfeldige, m = 10, n = 12): keys per slot 0..9 are
 *    2, 2, 1, 0, 2, 0, 1, 1, 3, 0. Empty: 3, 5, 9. Longest: slot 8,
 *    808 → 548 → 888. The newest key is 280 (slot 0, first).
 *  - tiere, k mod m, m = 10: every key in slot 0 (n = 12: one list of 12,
 *    820 first). m = 11, n = 12: 2, 1, 0, 1, 2, 1, 2, 0, 1, 1, 1, empty 2 and
 *    7, longest 2 (slots 0, 4, 6); n = 32: no empty slot, longest 5 (slot 10).
 *    m = 15: only slots 0, 5, 10 (n = 12: 2, 3, 7; n = 32: 10, 9, 13).
 *    m = 16: only even slots (n = 12: slots 0, 2, 4, 6, 8, 12, 14 hold
 *    3, 1, 2, 1, 1, 2, 2 and slot 10 is empty too; n = 32: all eight even
 *    slots, 5, 4, 4, 2, 4, 2, 6, 5).
 *  - multiplikasjon, tiere, m = 10, n = 12: 1, 1, 2, 1, 1, 0, 0, 2, 1, 3,
 *    empty 5 and 6, longest 3 (slot 9); n = 32: no empty slot, longest 4.
 *  - multiplikasjon, tilfeldige, m = 10, n = 12: 2, 1, 3, 1, 0, 0, 1, 1, 2, 1,
 *    empty 4 and 5, longest 3 (slot 2).
 *  - tilfeldige, k mod m, m = 10, n = 32: α = 3,2; 3, 3, 4, 3, 5, 4, 3, 1, 4,
 *    2, no empty slot, longest 5 (slot 4).
 *
 * Deterministic first view: fixed lists of 32 keys per kind, n takes the first
 * n. Math.random is used only after «Stokk», which deals new keys of the
 * current kind.
 *
 * Colours are framework tokens only. The node fill is opaque (mixed into
 * --bg-elevated, the stage's own background) so the α line passes behind it.
 *
 * Contract: default-export init(api); host="dom", so api = { stage, controls,
 * getSize, onResize, signal }.
 */

const M_MIN = 5;
const M_MAX = 16;
const M_DEFAULT = 10;
const N_MIN = 0;
const N_MAX = 32;
const N_DEFAULT = 12;

/** The fixed first-view keys: 32 distinct keys of each kind, inserted in this order. */
const KEYS = {
  tilfeldige: [
    760, 392, 356, 584, 888, 667, 548, 421, 804, 201, 808, 280, 481, 852, 623, 225,
    705, 429, 974, 134, 924, 155, 215, 273, 106, 946, 508, 672, 989, 310, 522, 413,
  ],
  tiere: [
    220, 790, 580, 670, 440, 720, 620, 960, 290, 160, 430, 820, 450, 890, 520, 190,
    140, 480, 120, 280, 800, 350, 150, 700, 130, 650, 180, 530, 900, 510, 780, 940,
  ],
};

const KINDS = {
  tilfeldige: { label: "tilfeldige", aria: "Tilfeldige tresifrede nøkler" },
  tiere: { label: "tiere", aria: "Nøkler som alle er delelige med 10" },
};

/** A = (√5 − 1)/2, Knuth's choice for the multiplication method. */
const A = (Math.sqrt(5) - 1) / 2;

const HASH = {
  mod: { label: "k mod m", aria: "Divisjonsmetoden, k mod m", h: (k, m) => k % m },
  // kA mod 1 is the fractional part of kA. On keys 100..999 and m = 5..16 the
  // product m · (kA mod 1) is never closer than 4·10⁻⁵ to an integer, so the
  // floating-point floor is exact.
  mul: { label: "multiplikasjon", aria: "Multiplikasjonsmetoden", h: (k, m) => Math.floor(m * ((k * A) % 1)) },
};

/** α never exceeds this (n = 32, m = 5); the node pitch is chosen so its line fits. */
const ALPHA_MAX = N_MAX / M_MIN;

/** Largest node in px; nodes stop growing past this on a wide stage. */
const NODE_W_MAX = 36;
const GAP_MAX = 18;
const ROW_MAX = 30;

const esc = (v) =>
  String(v).replace(
    /[&<>"]/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c],
  );

/** `count` distinct keys of a kind in random order. */
function dealKeys(kind, count) {
  const pool =
    kind === "tiere"
      ? Array.from({ length: 90 }, (_, i) => 100 + 10 * i)
      : Array.from({ length: 900 }, (_, i) => 100 + i);
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, count);
}

/**
 * Chained-Hash-Insert of keys[0..n − 1] in order: each key is prepended to the
 * list in slot h(k), so every list runs from its newest key to its oldest.
 */
function chainsOf(keys, n, m, h) {
  const lists = Array.from({ length: m }, () => []);
  for (let i = 0; i < n; i++) lists[h(keys[i], m)].unshift(keys[i]);
  return lists;
}

/** α = n/m with a decimal comma: «1,2», «2», or «1,09» marked as rounded. */
function alphaText(n, m) {
  const a = n / m;
  const r = Math.round(a * 100) / 100;
  const s = r.toFixed(2).replace(/0+$/, "").replace(/\.$/, "").replace(".", ",");
  return `α ${Math.abs(r - a) < 1e-9 ? "=" : "≈"} ${s}`;
}

export default function init({ stage, controls, getSize, onResize, signal }) {
  let hashKey = "mod";
  let kind = "tilfeldige";
  let m = M_DEFAULT;
  let n = N_DEFAULT;
  const keys = { tilfeldige: [...KEYS.tilfeldige], tiere: [...KEYS.tiere] };

  // ── kontroller ──────────────────────────────────────────────────────────
  // A group of buttons is not a labelable control, so each group gets the
  // framework's label layout on a <div role="group"> instead of a <label>
  // (a <label> would forward a click on its text to the first button).
  const btnGroup = (text, entries, isOn, onPick) => {
    const wrap = document.createElement("div");
    wrap.setAttribute("role", "group");
    wrap.setAttribute("aria-label", text);
    wrap.style.cssText =
      "display:flex;flex-direction:column;gap:var(--space-2);font-family:var(--font-mono);" +
      "font-size:var(--text-xs);color:var(--muted)";
    const tag = document.createElement("span");
    tag.textContent = text;
    const row = document.createElement("span");
    row.style.cssText = "display:flex;flex-wrap:wrap;gap:var(--space-2)";
    const btns = {};
    for (const k of Object.keys(entries)) {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "sim-btn";
      b.textContent = entries[k].label;
      b.setAttribute("aria-label", entries[k].aria);
      b.addEventListener(
        "click",
        () => {
          onPick(k);
          sync();
          render();
        },
        { signal },
      );
      btns[k] = b;
      row.append(b);
    }
    wrap.append(tag, row);
    return { el: wrap, sync: () => Object.keys(btns).forEach((k) => btns[k].setAttribute("aria-pressed", String(isOn(k)))) };
  };

  const slider = (name, aria, min, max, value, onInput) => {
    const label = document.createElement("label");
    label.append(`${name} `);
    const out = document.createElement("output");
    const input = document.createElement("input");
    input.type = "range";
    input.min = String(min);
    input.max = String(max);
    input.step = "1";
    input.value = String(value);
    input.setAttribute("aria-label", aria);
    label.append(out, input);
    input.addEventListener(
      "input",
      () => {
        onInput(Number(input.value));
        sync();
        render();
      },
      { signal },
    );
    return { el: label, out };
  };

  const hashGroup = btnGroup("Hashfunksjon", HASH, (k) => k === hashKey, (k) => (hashKey = k));
  const kindGroup = btnGroup("Nøkler", KINDS, (k) => k === kind, (k) => (kind = k));
  const groups = document.createElement("div");
  groups.style.cssText = "display:flex;flex-wrap:wrap;gap:var(--space-4) var(--space-6);flex-basis:100%";
  groups.append(hashGroup.el, kindGroup.el);

  const mS = slider("m", "Antall plasser m", M_MIN, M_MAX, m, (v) => (m = v));
  const nS = slider("n", "Antall nøkler n", N_MIN, N_MAX, n, (v) => (n = v));

  const shuffleBtn = document.createElement("button");
  shuffleBtn.type = "button";
  shuffleBtn.className = "sim-btn";
  shuffleBtn.textContent = "Stokk";
  shuffleBtn.setAttribute("aria-label", "Trekk nye tilfeldige nøkler av samme slag");
  shuffleBtn.addEventListener(
    "click",
    () => {
      keys[kind] = dealKeys(kind, N_MAX);
      render();
    },
    { signal },
  );

  controls.append(groups, mS.el, nS.el, shuffleBtn);

  function sync() {
    hashGroup.sync();
    kindGroup.sync();
    mS.out.textContent = String(m);
    nS.out.textContent = String(n);
  }

  // ── tegning ─────────────────────────────────────────────────────────────
  function render() {
    const { w, h } = getSize();
    if (w <= 0 || h <= 0) {
      stage.innerHTML = "";
      return;
    }
    const lists = chainsOf(keys[kind], n, m, HASH[hashKey].h);
    const newest = n > 0 ? keys[kind][n - 1] : null;

    // Type sizes in px, read from the root so the layout follows the reader's
    // text size. IBM Plex Mono advances 0.6 em per glyph.
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    const fsSm = 0.84 * rem;
    const fsXs = 0.72 * rem;
    const textW = (s, fs) => String(s).length * 0.6 * fs;

    // Horizontal: [index][slot][arrow, node, arrow, node, …][«+k»].
    const PAD = 5;
    const IDX_W = Math.ceil(textW("15", fsXs)) + 5;
    const SLOT_W = 20;
    const slotX = PAD + IDX_W;
    const slotR = slotX + SLOT_W; // α = 0 sits here
    const chainW = w - PAD - slotR;
    const chainEnd = slotR + chainW;
    const MORE_W = Math.ceil(textW("+26", fsXs)) + 2;
    // Pitch: the line at the largest α (6,4) must fit, with room for its label.
    let pitch = Math.min(NODE_W_MAX + GAP_MAX, (chainW - 6) / ALPHA_MAX);
    const gap = Math.max(8, Math.min(GAP_MAX, pitch * 0.24));
    const nodeW = Math.min(NODE_W_MAX, pitch - gap);
    pitch = nodeW + gap;
    const fits = Math.floor(chainW / pitch + 1e-9); // a list this long is drawn in full
    // A longer list: the nodes that fit, then an arrow to «+k» at the right
    // end of the stage, which lies past the line at every α.
    const shown = Math.max(1, Math.floor((chainW - gap - MORE_W) / pitch + 1e-9));

    // Vertical: a header for «T» and α, then 16 rows; the column is top-anchored.
    const HEAD_H = Math.ceil(fsXs) + 12;
    const rowH = Math.min(ROW_MAX, (h - 2 * PAD - HEAD_H) / M_MAX);
    const nodeH = Math.max(fsXs + 6, rowH - Math.max(4, rowH * 0.2));
    const top = PAD + HEAD_H;
    const fsKey = nodeW >= textW("000", fsSm) + 10 && nodeH >= fsSm + 6 ? fsSm : fsXs;

    const P = (v) => v.toFixed(1);
    // One next arrow: 1.5 px, --muted, a small filled head.
    let svg =
      `<defs><marker id="ht-next" markerWidth="5" markerHeight="6" refX="5" refY="3" orient="auto" markerUnits="userSpaceOnUse">` +
      `<path d="M0 0.5 L5 3 L0 5.5 z" style="fill:var(--muted)"/></marker></defs>`;
    const text = (x, y, s, style, anchor = "start") =>
      (svg +=
        `<text x="${P(x)}" y="${P(y)}" text-anchor="${anchor}" ` +
        `style="font-family:var(--font-mono);${style}">${esc(s)}</text>`);
    const arrow = (x1, x2, y) =>
      (svg +=
        `<path d="M ${P(x1)} ${P(y)} H ${P(x2)}" style="stroke:var(--muted)" stroke-width="1.5" ` +
        `marker-end="url(#ht-next)"/>`);

    // α, behind everything: the right edge of node α.
    const xA = slotR + (n / m) * pitch;
    const yEnd = top + m * rowH;
    svg +=
      `<path d="M ${P(xA)} ${P(top - 4)} V ${P(yEnd + 2)}" style="stroke:var(--violet)" ` +
      `stroke-width="1.5" stroke-dasharray="4 3"/>`;

    // Header: «T» over the slots, the α label over its line (kept clear of «T»
    // and inside the stage).
    const headY = PAD + fsXs;
    text(slotX + SLOT_W / 2, headY, "T", "fill:var(--fg);font-size:var(--text-xs);font-style:italic", "middle");
    const aStr = alphaText(n, m);
    const aW = textW(aStr, fsXs);
    const aX = Math.min(w - PAD - aW / 2, Math.max(slotR + 6 + aW / 2, xA));
    text(aX, headY, aStr, "fill:var(--violet);font-size:var(--text-xs);font-weight:600", "middle");

    for (let j = 0; j < m; j++) {
      const y = top + j * rowH;
      const cy = y + rowH / 2;
      const ty = cy + fsXs * 0.35;
      text(slotX - 5, ty, j, "fill:var(--faint);font-size:var(--text-xs)", "end");
      svg +=
        `<rect x="${P(slotX + 0.75)}" y="${P(y + 0.75)}" width="${P(SLOT_W - 1.5)}" height="${P(rowH - 1.5)}" rx="3" ` +
        `style="fill:none;stroke:var(--border-strong)" stroke-width="1"/>`;
      const list = lists[j];
      if (list.length === 0) continue; // nil: an empty cell
      // The slot's pointer to the first node.
      const sx = slotX + SLOT_W / 2;
      svg += `<circle cx="${P(sx)}" cy="${P(cy)}" r="2.5" style="fill:var(--muted)"/>`;
      arrow(sx, slotR + gap, cy);

      const drawn = list.length <= fits ? list.length : shown;
      for (let i = 0; i < drawn; i++) {
        const x = slotR + i * pitch + gap;
        const k = list[i];
        const isNew = k === newest;
        if (i > 0) arrow(x - gap, x, cy);
        const sw = isNew ? 2 : 0;
        const o = sw / 2;
        svg +=
          `<rect x="${P(x + o)}" y="${P(cy - nodeH / 2 + o)}" width="${P(nodeW - 2 * o)}" height="${P(nodeH - 2 * o)}" rx="4" ` +
          (isNew
            ? `style="fill:color-mix(in srgb, var(--accent) 12%, var(--bg-elevated));stroke:var(--accent)" stroke-width="2"/>`
            : `style="fill:color-mix(in srgb, var(--fg) 12%, var(--bg-elevated))"/>`);
        text(
          x + nodeW / 2,
          cy + fsKey * 0.35,
          k,
          `fill:${isNew ? "var(--accent-ink)" : "var(--fg)"};font-size:${fsKey.toFixed(2)}px${isNew ? ";font-weight:600" : ""}`,
          "middle",
        );
      }
      if (drawn < list.length) {
        // «+k» is part of the list, so like a node it hides the α line.
        arrow(slotR + drawn * pitch, chainEnd - MORE_W, cy);
        svg +=
          `<rect x="${P(chainEnd - MORE_W + 1)}" y="${P(cy - nodeH / 2)}" width="${P(MORE_W - 1)}" height="${P(nodeH)}" ` +
          `style="fill:var(--bg-elevated)"/>`;
        text(chainEnd - MORE_W + 2, cy + fsXs * 0.35, `+${list.length - drawn}`, "fill:var(--muted);font-size:var(--text-xs)");
      }
    }

    stage.innerHTML =
      `<svg width="100%" height="100%" viewBox="0 0 ${w.toFixed(0)} ${h.toFixed(0)}" ` +
      `preserveAspectRatio="none" role="img" aria-hidden="true" style="display:block">${svg}</svg>`;
  }

  sync();
  onResize(render);
  render();
}
