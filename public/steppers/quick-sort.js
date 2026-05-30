// Quicksort trace for <Stepper> — Lomuto-partisjonering med høyre pivot.
// Portert fra algdat-visualiseringen (sorting.js `quick`); stegtekst er norsk og
// tegningen gjenbruker den delte søyle-rendereren. Pivoten er fiolett, elementet
// som sammenlignes er oransje, et bytte er aksentfarget, og ferdigplasserte
// pivoter låses grønne. Vinduet [lo..hi] tegnes som en stiplet ramme.
import { shuffledRange, range } from "./_util.js";
import { renderBars } from "./_bars.js";

export default {
  sizeRange: { min: 5, max: 14, default: 9 },
  defaultData: (size = 9) => shuffledRange(size, 11),

  run(input) {
    const a = [...input];
    const n = a.length;
    const frames = [];
    const sortedSet = new Set();
    const sortedNow = () => [...sortedSet].sort((x, y) => x - y);

    function quick(lo, hi) {
      if (lo >= hi) {
        if (lo === hi) {
          sortedSet.add(lo);
          frames.push({
            line: 5,
            desc: `Vinduet [${lo}..${hi}] har ett element — det er trivielt på plass.`,
            data: [...a],
            vars: { lo, hi },
            highlights: { sorted: sortedNow() },
            pointers: { "lo/hi": lo },
            windows: { vindu: [lo, hi] },
          });
        }
        return;
      }
      const pivot = a[hi];
      frames.push({
        line: 6,
        desc: `Partisjoner vinduet [${lo}..${hi}]. Pivot = a[hi] = ${pivot}.`,
        data: [...a],
        vars: { lo, hi, pivot },
        highlights: { pivot: [hi], sorted: sortedNow() },
        pointers: { lo, hi },
        windows: { vindu: [lo, hi] },
      });
      let i = lo - 1;
      frames.push({
        line: 7,
        desc: `i = ${i}: grensa for ≤-pivot-regionen (foreløpig tom).`,
        data: [...a],
        vars: { lo, hi, pivot, i },
        highlights: { pivot: [hi], sorted: sortedNow() },
        pointers: { lo, hi },
        windows: { vindu: [lo, hi] },
      });
      for (let j = lo; j < hi; j++) {
        const lePtr = i >= lo ? { i } : {};
        const leWin = i >= lo ? { "≤": [lo, i] } : {};
        frames.push({
          line: 9,
          desc: `j = ${j}: sammenlign a[j] = ${a[j]} med pivot ${pivot}.`,
          data: [...a],
          vars: { lo, hi, pivot, i, j, "a[j]": a[j] },
          highlights: { compare: [j], pivot: [hi], sorted: sortedNow() },
          pointers: { j, hi, ...lePtr },
          windows: { vindu: [lo, hi], ...leWin },
        });
        if (a[j] <= pivot) {
          i += 1;
          if (i !== j) {
            [a[i], a[j]] = [a[j], a[i]];
            frames.push({
              line: 11,
              desc: `a[j] ≤ pivot: utvid ≤-regionen ved å bytte a[${i}] og a[${j}].`,
              data: [...a],
              vars: { lo, hi, pivot, i, j },
              highlights: { swap: [i, j], pivot: [hi], sorted: sortedNow() },
              pointers: { i, j, hi },
              windows: { vindu: [lo, hi], "≤": [lo, i] },
            });
          } else {
            frames.push({
              line: 10,
              desc: `a[j] ≤ pivot: i og j er like, så vi utvider bare i (ingen bytte).`,
              // line 10 = `i += 1` (vi øker bare grensa, intet bytte på linje 11)
              data: [...a],
              vars: { lo, hi, pivot, i, j },
              highlights: { pivot: [hi], sorted: sortedNow() },
              pointers: { i, j, hi },
              windows: { vindu: [lo, hi], "≤": [lo, i] },
            });
          }
        }
      }
      [a[i + 1], a[hi]] = [a[hi], a[i + 1]];
      sortedSet.add(i + 1);
      frames.push({
        line: 12,
        desc: `Slipp pivoten på a[${i + 1}], mellom ≤- og >-regionen. Den ligger nå på sin endelige plass.`,
        data: [...a],
        vars: { lo, hi, pivot, q: i + 1 },
        highlights: { swap: [i + 1], sorted: sortedNow() },
        pointers: { "pivot→": i + 1 },
        windows: { vindu: [lo, hi] },
      });
      quick(lo, i);
      quick(i + 2, hi);
    }

    frames.push({
      line: 1,
      desc: `Første kall: quick_sort(a, lo = 0, hi = ${n - 1}).`,
      data: [...a],
      vars: { n, lo: 0, hi: n - 1 },
      highlights: {},
      windows: { vindu: [0, n - 1] },
    });
    quick(0, n - 1);
    frames.push({
      line: 1,
      desc: "Ferdig — lista er sortert.",
      data: [...a],
      vars: { n },
      highlights: { sorted: range(n) },
    });
    return frames;
  },

  render(stage, frame, api) {
    renderBars(stage, frame, api);
  },
};
