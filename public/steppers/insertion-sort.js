// Insertion-Sort trace for <Stepper> — builds a sorted prefix one key at a time.
// Ported from the original algdat visualizer; step text is Norwegian and the
// drawing reuses the shared bar renderer. The "key" is lifted out as a floating
// box and the gap slides left until the key drops into place.
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
      desc: "a[0] er en sortert prefiks av lengde 1. Vi setter inn hvert senere element i den.",
      data: [...a],
      vars: { n },
      highlights: { sorted: [0] },
    });

    for (let i = 1; i < n; i++) {
      const key = a[i];
      let gap = i;
      frames.push({
        line: 3,
        desc: `i = ${i}: løft nøkkelen ut av a[${i}] = ${key}. Sortert prefiks er a[0..${i - 1}].`,
        data: [...a],
        vars: { i, key },
        highlights: { sorted: prefix(i) },
        pointers: { i },
        floating: { [gap]: key },
        windows: { gap: [gap, gap] },
      });

      let j = i - 1;
      frames.push({
        line: 4,
        desc: `j = ${j}: skann mot venstre etter hvor nøkkelen skal slippes inn.`,
        data: [...a],
        vars: { i, key, j },
        highlights: { sorted: prefix(i) },
        pointers: { j },
        floating: { [gap]: key },
        windows: { gap: [gap, gap] },
      });

      while (j >= 0 && a[j] > key) {
        frames.push({
          line: 5,
          desc: `a[${j}] = ${a[j]} > nøkkel = ${key} — skyv a[${j}] mot høyre inn i gapet a[${gap}].`,
          data: [...a],
          vars: { i, key, j, "a[j]": a[j] },
          highlights: { compare: [j], sorted: prefix(i) },
          pointers: { j },
          floating: { [gap]: key },
          windows: { gap: [gap, gap] },
        });
        a[j + 1] = a[j];
        gap = j;
        frames.push({
          line: 6,
          desc: `Skjøvet: a[${j + 1}] holder nå ${a[j + 1]}. Gapet er flyttet til a[${gap}].`,
          data: [...a],
          vars: { i, key, j },
          highlights: { swap: [j + 1], sorted: prefix(i) },
          pointers: { j },
          floating: { [gap]: key },
          windows: { gap: [gap, gap] },
        });
        j -= 1;
      }

      a[j + 1] = key;
      frames.push({
        line: 8,
        desc: `Slipp nøkkelen i gapet a[${j + 1}]. Sortert prefiks vokser til a[0..${i}].`,
        data: [...a],
        vars: { i, key },
        highlights: { swap: [j + 1], sorted: prefix(i + 1) },
        pointers: { "↓": j + 1 },
      });
    }

    frames.push({
      line: 9,
      desc: "Alle elementer satt inn — lista er sortert.",
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
