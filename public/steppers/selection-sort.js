// Selection-Sort-trace for <Stepper> — bygg en sortert prefiks ved gjentatte
// ganger å skanne den usorterte halen etter minimumet og bytte det inn i neste
// luke. Portert fra algdat-visualiseringen (sorting.js `selection`); stegtekst er
// norsk og tegningen gjenbruker den delte søyle-rendereren. Det løpende minimumet
// er cyan (min), elementet som sammenlignes er oransje, byttet er aksentfarget, og
// den sorterte prefiksen låses grønn.
import { shuffledRange, range } from "./_util.js";
import { renderBars } from "./_bars.js";

export default {
  sizeRange: { min: 5, max: 14, default: 9 },
  defaultData: (size = 9) => shuffledRange(size, 7),

  run(input) {
    const a = [...input];
    const n = a.length;
    const frames = [];
    const prefix = (k) => range(k);

    frames.push({
      line: 2,
      desc: `Les lengden: n = ${n}. Hver runde plasserer minimumet av a[i:] på indeks i.`,
      data: [...a],
      vars: { n },
      highlights: {},
    });

    for (let i = 0; i < n; i++) {
      let m = i;
      frames.push({
        line: 4,
        desc: `Ytre runde i = ${i}: anta foreløpig at minimumet er a[${m}] = ${a[m]}.`,
        data: [...a],
        vars: { n, i, m, "a[m]": a[m] },
        highlights: { min: [m], sorted: prefix(i) },
        pointers: { i },
      });

      for (let j = i + 1; j < n; j++) {
        frames.push({
          line: 6,
          desc: `Sammenlign a[j] = ${a[j]} med løpende minimum a[m] = ${a[m]}.`,
          data: [...a],
          vars: { n, i, m, j, "a[j]": a[j], "a[m]": a[m] },
          highlights: { compare: [j], min: [m], sorted: prefix(i) },
          pointers: { i, j },
        });
        if (a[j] < a[m]) {
          m = j;
          frames.push({
            line: 7,
            desc: `a[j] < a[m]: nytt minimum er a[${m}] = ${a[m]}.`,
            data: [...a],
            vars: { n, i, m, j, "a[m]": a[m] },
            highlights: { min: [m], sorted: prefix(i) },
            pointers: { i, j },
          });
        }
      }

      if (m !== i) {
        [a[i], a[m]] = [a[m], a[i]];
        frames.push({
          line: 8,
          desc: `Bytt a[${i}] og a[${m}]: minimumet havner i den sorterte prefiksen.`,
          data: [...a],
          vars: { n, i, m, "a[i]": a[i] },
          highlights: { swap: [i, m], sorted: prefix(i + 1) },
          pointers: { i },
        });
      } else {
        frames.push({
          line: 8,
          desc: `a[${i}] var allerede minimumet — ingen bytte trengs.`,
          data: [...a],
          vars: { n, i, m, "a[i]": a[i] },
          highlights: { sorted: prefix(i + 1) },
          pointers: { i },
        });
      }
    }

    frames.push({
      line: 9,
      desc: "Alle elementer plassert — lista er sortert.",
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
