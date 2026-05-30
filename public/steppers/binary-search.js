// Binærsøk-trace for <Stepper> — vedlikehold et [lo, hi]-vindu over en sortert
// tabell og halver det hvert steg. Portert fra algdat-visualiseringen
// (searching.js `binary`); stegtekst er norsk og tegningen gjenbruker den delte
// søyle-rendereren. Midtelementet sammenlignes (oransje), den forkastede halvdelen
// tones ut (eliminated), og treffet låses grønt (found). lo/mid/hi vises som pekere.
import { range } from "./_util.js";
import { renderBars } from "./_bars.js";

export default {
  sizeRange: { min: 5, max: 14, default: 9 },
  // Sortert input: partall 2, 4, 6, … så søylene er stigende og lette å lese.
  defaultData: (size = 9) => Array.from({ length: size }, (_, i) => (i + 1) * 2),

  run(input) {
    const a = [...input];
    const n = a.length;
    // Velg et mål som finnes i lista (om lag 1/3 inn) så søket ender med et treff
    // og rekker å forkaste både en venstre og en høyre halvdel underveis.
    const target = a[Math.floor(n / 3)];
    let lo = 0;
    let hi = n - 1;
    const frames = [];
    // Indekser utenfor [lo..hi] er eliminert.
    const eliminatedOutside = () => {
      const out = [];
      for (let k = 0; k < n; k++) if (k < lo || k > hi) out.push(k);
      return out;
    };

    frames.push({
      line: 2,
      desc: `Startvindu: lo = 0, hi = ${hi}. Vi leter etter mål = ${target}.`,
      data: [...a],
      vars: { mål: target, lo, hi, n },
      highlights: {},
      pointers: { lo, hi },
      windows: { vindu: [lo, hi] },
    });

    while (lo <= hi) {
      frames.push({
        line: 3,
        desc: `Vinduet er ikke tomt (lo = ${lo} ≤ hi = ${hi}); fortsett søket.`,
        data: [...a],
        vars: { mål: target, lo, hi },
        highlights: { eliminated: eliminatedOutside() },
        pointers: { lo, hi },
        windows: { vindu: [lo, hi] },
      });

      const mid = (lo + hi) >> 1;
      frames.push({
        line: 4,
        desc: `mid = (lo + hi) // 2 = ${mid}. Undersøk a[mid] = ${a[mid]}.`,
        data: [...a],
        vars: { mål: target, lo, hi, mid, "a[mid]": a[mid] },
        highlights: { compare: [mid], eliminated: eliminatedOutside() },
        pointers: { lo, mid, hi },
        windows: { vindu: [lo, hi] },
      });

      if (a[mid] === target) {
        frames.push({
          line: 6,
          desc: `a[mid] == mål — funnet ${target} på indeks ${mid}.`,
          data: [...a],
          vars: { mål: target, mid, svar: mid },
          highlights: { found: [mid], eliminated: eliminatedOutside() },
          pointers: { mid },
          windows: { vindu: [lo, hi] },
        });
        return frames;
      }

      if (a[mid] < target) {
        lo = mid + 1;
        frames.push({
          line: 8,
          desc: `a[mid] = ${a[mid]} < mål: forkast venstre halvdel. Nytt lo = ${lo}.`,
          data: [...a],
          vars: { mål: target, lo, hi, mid },
          highlights: { compare: [mid], eliminated: eliminatedOutside() },
          pointers: { lo, hi },
          windows: { vindu: [lo, hi] },
        });
      } else {
        hi = mid - 1;
        frames.push({
          line: 10,
          desc: `a[mid] = ${a[mid]} > mål: forkast høyre halvdel. Nytt hi = ${hi}.`,
          data: [...a],
          vars: { mål: target, lo, hi, mid },
          highlights: { compare: [mid], eliminated: eliminatedOutside() },
          pointers: { lo, hi },
          windows: { vindu: [lo, hi] },
        });
      }
    }

    frames.push({
      line: 11,
      desc: `Vinduet kollapset (lo > hi): ${target} finnes ikke i lista.`,
      data: [...a],
      vars: { mål: target, lo, hi, svar: -1 },
      highlights: { eliminated: range(n) },
    });
    return frames;
  },

  render(stage, frame, api) {
    renderBars(stage, frame, api);
  },
};
