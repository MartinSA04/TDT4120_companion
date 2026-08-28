/**
 * Stripping trace for <Stepper> in modul 02b: the "flest mulig"-oppgave with
 * k = 2. Eight people; everyone who knows fewer than two of the remaining is
 * struck, and one strike can make the next neighbour strikable.
 *
 * The trace is a fixed script (no shuffle, no code block): the graph has a
 * 5-cycle core that survives and a three-node tail c—h—g—f that cascades.
 *
 * Colours are framework tokens only, so frames re-theme on the light/dark
 * toggle without the module knowing which theme is active.
 */

const NODES = {
  a: [0.39, 0.24],
  b: [0.51, 0.44],
  c: [0.465, 0.76],
  d: [0.315, 0.76],
  e: [0.245, 0.44],
  f: [0.71, 0.28],
  g: [0.75, 0.6],
  h: [0.61, 0.84],
};
const EDGES = [
  ["a", "b"],
  ["b", "c"],
  ["c", "d"],
  ["d", "e"],
  ["e", "a"],
  ["c", "h"],
  ["h", "g"],
  ["g", "f"],
];

export default {
  run() {
    return [
      {
        removed: [],
        desc:
          "Åtte personer, og kravet er k = 2: alle i gruppa skal kjenne minst " +
          "to andre i gruppa. Vi stryker alle som kjenner færre enn to av de gjenværende.",
      },
      {
        removed: [],
        candidate: "f",
        desc: "f kjenner bare g. Det er færre enn to, så f strykes.",
      },
      {
        removed: ["f"],
        candidate: "g",
        desc: "Uten f kjenner g bare h. Da strykes g også.",
      },
      {
        removed: ["f", "g"],
        candidate: "h",
        desc: "Uten g kjenner h bare c. Da strykes h.",
      },
      {
        removed: ["f", "g", "h"],
        done: true,
        desc:
          "Ingen flere kan strykes: de fem som står igjen, kjenner minst to av " +
          "hverandre. Ingen gyldig gruppe mistet medlemmer på veien, så dette er den største.",
      },
    ];
  },

  render(stage, frame, api) {
    const { w, h } = api.getSize();
    if (w <= 0 || h <= 0) {
      stage.innerHTML = "";
      return;
    }

    const pos = {};
    for (const [name, [fx, fy]] of Object.entries(NODES))
      pos[name] = { x: fx * w, y: fy * h };
    const gone = new Set(frame.removed);
    const R = 13;

    let svg = "";
    for (const [p, q] of EDGES) {
      const dead = gone.has(p) || gone.has(q);
      const A = pos[p];
      const B = pos[q];
      // Trim the edge to the circle borders.
      const len = Math.hypot(B.x - A.x, B.y - A.y);
      const ux = (B.x - A.x) / len;
      const uy = (B.y - A.y) / len;
      svg +=
        `<line x1="${(A.x + ux * (R + 2)).toFixed(1)}" y1="${(A.y + uy * (R + 2)).toFixed(1)}" ` +
        `x2="${(B.x - ux * (R + 2)).toFixed(1)}" y2="${(B.y - uy * (R + 2)).toFixed(1)}" ` +
        `style="stroke:${dead ? "var(--faint)" : "var(--muted)"}" ` +
        `stroke-width="${dead ? 1.2 : 1.5}"${dead ? ' stroke-dasharray="4 4"' : ""}/>`;
    }

    for (const name of Object.keys(NODES)) {
      const p = pos[name];
      let stroke = "var(--border)";
      let fill = "color-mix(in srgb, var(--fg) 8%, transparent)";
      let text = "var(--fg)";
      let wdt = 1.5;
      let dash = "";
      if (gone.has(name)) {
        stroke = "var(--faint)";
        fill = "none";
        text = "var(--faint)";
        wdt = 1.2;
        dash = ' stroke-dasharray="3 3"';
      } else if (frame.candidate === name) {
        stroke = "var(--orange)";
        fill = "color-mix(in srgb, var(--orange) 15%, transparent)";
        wdt = 2;
      } else if (frame.done) {
        stroke = "var(--green)";
        fill = "color-mix(in srgb, var(--green) 12%, transparent)";
        wdt = 2;
      }
      svg +=
        `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${R}" ` +
        `style="fill:${fill};stroke:${stroke}" stroke-width="${wdt}"${dash}/>` +
        `<text x="${p.x.toFixed(1)}" y="${(p.y + 4).toFixed(1)}" text-anchor="middle" ` +
        `style="fill:${text};font-family:var(--font-mono);font-size:var(--text-xs)">${name}</text>`;
    }

    stage.innerHTML =
      `<svg width="100%" height="100%" viewBox="0 0 ${w.toFixed(0)} ${h.toFixed(0)}" ` +
      `preserveAspectRatio="none" role="img" aria-hidden="true" style="display:block">${svg}</svg>`;
  },
};
