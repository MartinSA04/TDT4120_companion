// Shared bar-chart renderer for sorting/scan <Stepper>s (TDT4120).
// A frame supplies: data (number[]), and optional highlights, pointers,
// floating, windows. Colours come from framework theme tokens so frames
// re-theme on light/dark toggle.
import { esc } from "./_util.js";

// role → fill. Precedence (high→low) when an index has several roles.
const ROLE = {
  swap: "var(--accent)", // moving / placing
  found: "var(--green)",
  compare: "var(--orange)", // being compared
  pivot: "var(--violet)",
  min: "var(--cyan)", // running min/max (selection)
  sorted: "var(--green)", // locked-in prefix/suffix
  eliminated: "color-mix(in srgb, var(--faint) 35%, transparent)",
};
const ORDER = ["swap", "found", "compare", "pivot", "min", "sorted", "eliminated"];
const BASE = "color-mix(in srgb, var(--fg) 16%, transparent)";

/**
 * @param {HTMLElement} stage
 * @param {any} frame  { data, highlights?, pointers?, floating?, windows? }
 * @param {{getSize:()=>{w:number,h:number}}} api
 * @param {{labels?:boolean}} [opts]
 */
export function renderBars(stage, frame, api, opts = {}) {
  const { w, h } = api.getSize();
  const data = frame.data || [];
  const n = data.length;
  if (!n || w <= 0) {
    stage.innerHTML = "";
    return;
  }
  const hl = frame.highlights || {};
  const floating = frame.floating || {};
  const pointers = frame.pointers || {};
  const windows = frame.windows || {};

  // role lookup per index
  const roleOf = (i) => {
    for (const r of ORDER) if ((hl[r] || []).includes(i)) return r;
    return null;
  };

  const maxV = Math.max(1, ...data);
  const floatBand = Object.keys(floating).length ? 34 : 8; // room for lifted key
  const padX = 14;
  const labelH = 18;
  const ptrRows = Object.keys(pointers).length ? 18 : 0;
  const baseY = h - labelH - ptrRows;
  const chartH = Math.max(16, baseY - floatBand);
  const gap = Math.max(3, w * 0.012);
  const bw = Math.max(4, (w - padX * 2 - gap * (n - 1)) / n);
  const xOf = (i) => padX + i * (bw + gap);
  const showLabels = opts.labels !== false && bw >= 13;
  const labelFs = Math.min(14, Math.max(9, bw * 0.46));

  let body = "";

  // window outline (e.g. the partition / gap region)
  for (const key of Object.keys(windows)) {
    const [lo, hi] = windows[key];
    if (lo == null || hi == null) continue;
    const x = xOf(Math.min(lo, hi)) - 3;
    const x2 = xOf(Math.max(lo, hi)) + bw + 3;
    body += `<rect x="${x.toFixed(1)}" y="${(floatBand - 4).toFixed(1)}" width="${(x2 - x).toFixed(1)}" height="${(baseY - floatBand + 8).toFixed(1)}" rx="6" fill="none" stroke="var(--accent-ring)" stroke-width="1.5" stroke-dasharray="3 3"/>`;
  }

  // baseline
  body += `<line x1="${padX}" y1="${baseY}" x2="${(w - padX).toFixed(1)}" y2="${baseY}" stroke="var(--border)" stroke-width="1"/>`;

  // bars + value labels
  data.forEach((v, i) => {
    const bh = (v / maxV) * chartH;
    const x = xOf(i);
    const cx = x + bw / 2;
    const role = roleOf(i);
    const fill = role ? ROLE[role] : BASE;
    body += `<rect x="${x.toFixed(1)}" y="${(baseY - bh).toFixed(1)}" width="${bw.toFixed(1)}" height="${bh.toFixed(1)}" rx="2.5" style="fill:${fill}"/>`;
    if (showLabels)
      body += `<text x="${cx.toFixed(1)}" y="${(baseY + 14).toFixed(1)}" text-anchor="middle" style="fill:var(--faint);font-family:var(--font-mono);font-size:${labelFs.toFixed(1)}px">${esc(v)}</text>`;
  });

  // floating "lifted" values (insertion key, extracted min, …)
  for (const idx of Object.keys(floating)) {
    const i = Number(idx);
    const v = floating[idx];
    const x = xOf(i);
    const cx = x + bw / 2;
    const bwF = Math.max(bw, 16);
    body +=
      `<rect x="${(cx - bwF / 2).toFixed(1)}" y="4" width="${bwF.toFixed(1)}" height="24" rx="4" fill="var(--accent-weak)" stroke="var(--accent)" stroke-width="1.5"/>` +
      `<text x="${cx.toFixed(1)}" y="20" text-anchor="middle" style="fill:var(--accent);font-family:var(--font-mono);font-weight:600;font-size:12px">${esc(v)}</text>`;
  }

  // pointer chips under the labels
  const ptrY = baseY + labelH + 2;
  for (const label of Object.keys(pointers)) {
    const i = pointers[label];
    if (i == null || i < 0 || i >= n) continue;
    const cx = xOf(i) + bw / 2;
    body += `<text x="${cx.toFixed(1)}" y="${(ptrY + 9).toFixed(1)}" text-anchor="middle" style="fill:var(--accent);font-family:var(--font-mono);font-size:10.5px">${esc(label)}</text>`;
  }

  stage.innerHTML = `<svg width="100%" height="100%" viewBox="0 0 ${w.toFixed(0)} ${h.toFixed(0)}" preserveAspectRatio="none" role="img" aria-hidden="true" style="display:block">${body}</svg>`;
}
