// Heap trace for <Stepper> — Build-Max-Heap (bottom-up Max-Heapify), then a
// Heapsort extract phase. The heap lives in an array, so the shared bar renderer
// fits: bars are a[], `pointers` mark the current node i and its children
// 2i+1/2i+2, `compare`/`swap` highlights drive Max-Heapify, `windows.haug` frames
// the live heap region, and a growing green `sorted` suffix is the locked-in
// output during the extract phase. Ported from the original algdat visualizer;
// step text is Norwegian. Line numbers match the linked <CodeBlock id="heap">.
import { shuffledRange } from "./_util.js";
import { renderBars } from "./_bars.js";

export default {
  sizeRange: { min: 6, max: 12, default: 8 },
  // Small, distinct heights so the tree structure reads clearly.
  defaultData: (size = 8) => shuffledRange(size, 11),

  run(input) {
    const a = input && input.length ? [...input] : shuffledRange(8, 11);
    const n = a.length;
    const frames = [];

    // Children of i within the live heap of size `hs`.
    const childPointers = (i, hs) => {
      const l = 2 * i + 1;
      const r = 2 * i + 2;
      const p = { i };
      if (l < hs) p["2i+1"] = l;
      if (r < hs) p["2i+2"] = r;
      return p;
    };
    const heapWindow = (hs) => (hs > 0 ? { haug: [0, hs - 1] } : {});

    // One Max-Heapify, iteratively sifting the violation down. Emits frames and
    // mutates `a` in place. `sorted` is the locked suffix during heapsort.
    function maxHeapify(i, hs, sorted) {
      while (true) {
        const l = 2 * i + 1;
        const r = 2 * i + 2;
        let largest = i;

        frames.push({
          line: 2,
          desc: `Max-Heapify(i = ${i}): finn det største av a[${i}] = ${a[i]}`
            + `${l < hs ? `, venstre barn a[${l}] = ${a[l]}` : ""}`
            + `${r < hs ? ` og høyre barn a[${r}] = ${a[r]}` : ""}.`,
          data: [...a],
          vars: { i, l, r: r < hs ? r : "—", heap_size: hs },
          highlights: {
            compare: [l, r].filter((x) => x < hs),
            sorted,
          },
          pointers: childPointers(i, hs),
          windows: heapWindow(hs),
        });

        if (l < hs && a[l] > a[largest]) largest = l;
        if (r < hs && a[r] > a[largest]) largest = r;

        if (largest === i) {
          frames.push({
            line: 9,
            desc: `a[${i}] = ${a[i]} dominerer allerede barna sine — haug-egenskapen `
              + `holder ved indeks ${i}. Max-Heapify er ferdig.`,
            data: [...a],
            vars: { i, largest: i, result: "ingen bytte" },
            highlights: { found: [i], sorted },
            pointers: childPointers(i, hs),
            windows: heapWindow(hs),
          });
          return;
        }

        frames.push({
          line: 10,
          desc: `Største er a[${largest}] = ${a[largest]} > a[${i}] = ${a[i]}. `
            + `Bytt a[${i}] ↔ a[${largest}] og fortsett nedover fra indeks ${largest}.`,
          data: [...a],
          vars: { i, largest, swap: `a[${i}] ↔ a[${largest}]` },
          highlights: { swap: [i, largest], sorted },
          pointers: childPointers(i, hs),
          windows: heapWindow(hs),
        });

        [a[i], a[largest]] = [a[largest], a[i]];
        i = largest;
      }
    }

    // ── Build-Max-Heap: Max-Heapify every internal node, bottom up ──────────
    const firstInternal = Math.floor(n / 2) - 1;
    frames.push({
      line: 14,
      desc: `Les tabellen som et nesten komplett binærtre med n = ${n} noder. `
        + `De interne nodene er indeks 0..${firstInternal}; bladene `
        + `${firstInternal + 1}..${n - 1} er trivielle hauger. `
        + `Build-Max-Heap kjører Max-Heapify på de interne nodene nedenfra og opp.`,
      data: [...a],
      vars: { n, intern: `[0..${firstInternal}]`, start: firstInternal },
      highlights: {},
      windows: heapWindow(n),
    });

    for (let i = firstInternal; i >= 0; i--) {
      frames.push({
        line: 15,
        desc: `Ytre løkke: i = ${i}. Kall Max-Heapify på deltreet med rot i a[${i}] = ${a[i]}.`,
        data: [...a],
        vars: { i },
        highlights: { pivot: [i] },
        pointers: childPointers(i, n),
        windows: heapWindow(n),
      });
      maxHeapify(i, n, []);
    }

    frames.push({
      line: 16,
      desc: `Build-Max-Heap er ferdig: hver forelder dominerer barna sine, og `
        + `a[0] = ${a[0]} er det største elementet. Kjøretiden er O(n), ikke O(n lg n).`,
      data: [...a],
      vars: { maks: a[0], heap: `[${a.join(", ")}]` },
      highlights: { pivot: [0] },
      windows: heapWindow(n),
    });

    // ── Heapsort: repeatedly extract the max to a growing sorted suffix ──────
    const sorted = [];
    for (let hs = n; hs >= 2; hs--) {
      const last = hs - 1;
      frames.push({
        line: 21,
        desc: `Heapsort: maksimum a[0] = ${a[0]} byttes til a[${last}], `
          + `der det havner på sin endelige sorterte plass. Krymp haugen til ${hs - 1} noder.`,
        data: [...a],
        vars: { heap_size: hs, swap: `a[0] ↔ a[${last}]` },
        highlights: { swap: [0, last], sorted: [...sorted] },
        pointers: { i: 0, "2i+1": 1, ...(2 < hs ? { "2i+2": 2 } : {}) },
        windows: heapWindow(hs),
      });
      [a[0], a[last]] = [a[last], a[0]];
      sorted.unshift(last);
      frames.push({
        line: 22,
        desc: `a[${last}] = ${a[last]} er nå låst i den sorterte halen. `
          + `Gjenopprett haug-egenskapen med Max-Heapify på rota over de ${hs - 1} gjenværende.`,
        data: [...a],
        vars: { heap_size: hs - 1 },
        highlights: { sorted: [...sorted] },
        pointers: childPointers(0, hs - 1),
        windows: heapWindow(hs - 1),
      });
      maxHeapify(0, hs - 1, [...sorted]);
    }
    sorted.unshift(0);

    frames.push({
      line: 22,
      desc: "Haugen er tømt — hver uttrukket maksverdi har lagt seg bakfra og lista er sortert.",
      data: [...a],
      vars: { n, sortert: `[${a.join(", ")}]` },
      highlights: { sorted: [...sorted] },
    });

    return frames;
  },

  render(stage, frame, api) {
    renderBars(stage, frame, api);
  },
};
