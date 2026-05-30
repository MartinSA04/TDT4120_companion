// Bubble-Sort-trace for <Stepper> — gå gjennom lista og sammenlign hvert nabopar;
// bytt hvis de er i feil rekkefølge. Etter runde i ligger de i største elementene
// låst på slutten. Portert fra algdat-visualiseringen (sorting.js `bubble`);
// stegtekst er norsk og tegningen gjenbruker den delte søyle-rendereren. Paret som
// sammenlignes er oransje, byttet er aksentfarget, og den sorterte halen er grønn.
import { shuffledRange, range } from "./_util.js";
import { renderBars } from "./_bars.js";

export default {
  sizeRange: { min: 5, max: 14, default: 9 },
  defaultData: (size = 9) => shuffledRange(size, 7),

  run(input) {
    const a = [...input];
    const n = a.length;
    const frames = [];
    // De i siste indeksene er låst etter runde i.
    const sortedTail = (i) =>
      Array.from({ length: i }, (_, k) => n - 1 - k).reverse();

    frames.push({
      line: 2,
      desc: `Les lengden: n = ${n}. Det største usorterte elementet bobler mot høyre hver runde.`,
      data: [...a],
      vars: { n },
      highlights: {},
    });

    for (let i = 0; i < n; i++) {
      frames.push({
        line: 3,
        desc: `Runde i = ${i}: skann opp til indeks ${n - i - 1}. De siste ${i} er låst.`,
        data: [...a],
        vars: { n, i },
        highlights: { sorted: sortedTail(i) },
        pointers: { i: Math.min(i, n - 1) },
      });
      if (n - i - 1 <= 0) break;
      for (let j = 0; j < n - i - 1; j++) {
        frames.push({
          line: 5,
          desc: `Sammenlign a[j] = ${a[j]} med a[j+1] = ${a[j + 1]}.`,
          data: [...a],
          vars: { n, i, j, "a[j]": a[j], "a[j+1]": a[j + 1] },
          highlights: { compare: [j, j + 1], sorted: sortedTail(i) },
          pointers: { j, "j+1": j + 1 },
        });
        if (a[j] > a[j + 1]) {
          [a[j], a[j + 1]] = [a[j + 1], a[j]];
          frames.push({
            line: 6,
            desc: `a[j] > a[j+1] — bytt: ${a[j + 1]} ↔ ${a[j]}.`,
            data: [...a],
            vars: { n, i, j, "a[j]": a[j], "a[j+1]": a[j + 1] },
            highlights: { swap: [j, j + 1], sorted: sortedTail(i) },
            pointers: { j, "j+1": j + 1 },
          });
        }
      }
    }

    frames.push({
      line: 7,
      desc: "Alle rundene fullført — lista er sortert.",
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
