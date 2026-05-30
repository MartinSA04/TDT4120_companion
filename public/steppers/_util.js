// Shared helpers for course-owned <Stepper> modules (TDT4120).
// Loaded via native ESM relative imports from the stepper modules — Astro serves
// public/ verbatim, so `import { … } from "./_util.js"` resolves at runtime.

/** Deterministic PRNG so the first frame (build screenshot) is stable. */
export function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A deterministic permutation of 1..n (heights for a bar chart). */
export function shuffledRange(n, seed = 7) {
  const data = Array.from({ length: n }, (_, i) => i + 1);
  const rng = mulberry32(seed);
  for (let i = data.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [data[i], data[j]] = [data[j], data[i]];
  }
  return data;
}

export const range = (n) => Array.from({ length: n }, (_, i) => i);

/** Escape text destined for SVG/HTML. */
export function esc(s) {
  return String(s).replace(
    /[&<>"]/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c],
  );
}
