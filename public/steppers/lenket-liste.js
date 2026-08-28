/**
 * Doubly linked list pointer trace for <Stepper>, driving the Python block
 * `liste-ops` in modul 02a.
 *
 * Line numbers refer to that <CodeBlock>:
 *    1 def insert_after(a, x):
 *    2     x.prev = a
 *    3     x.next = a.next
 *    4     a.next.prev = x
 *    5     a.next = x
 *    6
 *    7 def delete(x):
 *    8     x.prev.next = x.next
 *    9     x.next.prev = x.prev
 *
 * The trace is a fixed script (no shuffle): x is inserted between a and b,
 * one pointer assignment per step, and then deleted again. The nodes never
 * move on the stage — the whole point — only the pointers change.
 *
 * Colours are framework tokens only, so frames re-theme on the light/dark
 * toggle without the module knowing which theme is active.
 */

export default {
  run() {
    const frames = [];
    // ptr: the four pointers we draw. set/read: which of them this step
    // writes (accent) and reads (orange). out: x is unlinked and fades.
    const snap = (ptr, extra) => frames.push({ ptr: { ...ptr }, ...extra });

    const start = { aNext: "b", bPrev: "a", xPrev: null, xNext: null };
    snap(start, {
      line: 1,
      desc:
        "Lista er a ↔ b. Noden x er opprettet, men står utenfor: ingen pekere " +
        "rører den. insert_after(a, x) setter den inn etter a.",
    });
    snap({ ...start, xPrev: "a" }, {
      line: 2,
      set: ["xPrev"],
      desc: "x.prev = a. Lista er uendret; det er bare x som har fått en peker.",
    });
    snap({ ...start, xPrev: "a", xNext: "b" }, {
      line: 3,
      set: ["xNext"],
      read: ["aNext"],
      desc:
        "x.next = a.next, altså b. Nå peker x inn i lista begge veier, men " +
        "ingen i lista peker på x ennå.",
    });
    snap({ aNext: "b", bPrev: "x", xPrev: "a", xNext: "b" }, {
      line: 4,
      set: ["bPrev"],
      read: ["aNext"],
      desc:
        "a.next.prev = x: a.next er fortsatt b, så det er b.prev som settes. " +
        "Pekeren fra b tilbake til a skrives over.",
    });
    const linked = { aNext: "x", bPrev: "x", xPrev: "a", xNext: "b" };
    snap(linked, {
      line: 5,
      set: ["aNext"],
      desc: "a.next = x. Rekkefølgen er a, x, b, og ingen noder er flyttet.",
    });
    snap(linked, {
      line: [2, 3, 4, 5],
      desc:
        "Fire tilordninger, uansett hvor lang lista er. Nodene ligger der de " +
        "ligger; rekkefølgen er bestemt av pekerne alene.",
    });
    snap(linked, {
      line: 7,
      desc: "delete(x) tar noden ut igjen. Vi står allerede ved x, så ingenting må søkes opp.",
    });
    snap({ ...linked, aNext: "b" }, {
      line: 8,
      set: ["aNext"],
      read: ["xPrev", "xNext"],
      desc: "x.prev.next = x.next: a settes til å peke på b, forbi x.",
    });
    snap({ aNext: "b", bPrev: "a", xPrev: "a", xNext: "b" }, {
      line: 9,
      set: ["bPrev"],
      read: ["xPrev", "xNext"],
      desc: "x.next.prev = x.prev: b peker tilbake på a. Lista er a ↔ b igjen.",
    });
    snap({ aNext: "b", bPrev: "a", xPrev: "a", xNext: "b" }, {
      line: [8, 9],
      out: true,
      desc:
        "To tilordninger. x er ute av lista, men uendret: pekerne i x står " +
        "fortsatt mot a og b. Noden er hoppet over, ikke rørt.",
    });

    return frames;
  },

  render(stage, frame, api) {
    const { w, h } = api.getSize();
    if (w <= 0 || h <= 0) {
      stage.innerHTML = "";
      return;
    }

    const BW = 64;
    const BH = 40;
    const a = { cx: w * 0.26, cy: h * 0.3 };
    const b = { cx: w * 0.74, cy: h * 0.3 };
    const x = { cx: w * 0.5, cy: h * 0.74 };
    for (const n of [a, b, x]) {
      n.x1 = n.cx - BW / 2;
      n.x2 = n.cx + BW / 2;
      n.y1 = n.cy - BH / 2;
      n.y2 = n.cy + BH / 2;
    }

    const set = frame.set ?? [];
    const read = frame.read ?? [];
    const colour = (key) => {
      if (set.includes(key)) return { stroke: "var(--accent)", wdt: 2, marker: "pl-accent" };
      if (read.includes(key)) return { stroke: "var(--orange)", wdt: 1.8, marker: "pl-orange" };
      if (frame.out && (key === "xPrev" || key === "xNext"))
        return { stroke: "var(--faint)", wdt: 1.4, marker: "pl-faint", dash: true };
      return { stroke: "var(--muted)", wdt: 1.5, marker: "pl-muted" };
    };

    // One path per live pointer. The a<->b lanes are straight; anything that
    // touches x curves down into the lower row.
    const paths = {
      aNext:
        frame.ptr.aNext === "b"
          ? `M ${a.x2},${a.cy - 8} L ${b.x1 - 6},${a.cy - 8}`
          : `M ${a.cx + 16},${a.y2} Q ${a.cx + 18},${x.cy - 6} ${x.x1 - 6},${x.cy - 6}`,
      bPrev:
        frame.ptr.bPrev === "a"
          ? `M ${b.x1},${b.cy + 8} L ${a.x2 + 6},${a.cy + 8}`
          : `M ${b.cx + 16},${b.y2} Q ${b.cx + 18},${x.cy + 8} ${x.x2 + 6},${x.cy + 8}`,
      xPrev: frame.ptr.xPrev
        ? `M ${x.x1},${x.cy + 8} Q ${a.cx - 18},${x.cy + 8} ${a.cx - 16},${a.y2 + 6}`
        : null,
      xNext: frame.ptr.xNext
        ? `M ${x.x2},${x.cy - 6} Q ${b.cx - 18},${x.cy - 6} ${b.cx - 16},${b.y2 + 6}`
        : null,
    };

    let svg =
      `<defs>` +
      ["accent", "orange", "muted", "faint"]
        .map(
          (c) =>
            `<marker id="pl-${c}" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">` +
            `<path d="M0 0 L8 4 L0 8 z" style="fill:var(--${c})"/></marker>`,
        )
        .join("") +
      `</defs>`;

    for (const key of ["aNext", "bPrev", "xPrev", "xNext"]) {
      const d = paths[key];
      if (!d) continue;
      const c = colour(key);
      svg +=
        `<path d="${d}" fill="none" style="stroke:${c.stroke}" stroke-width="${c.wdt}"` +
        `${c.dash ? ' stroke-dasharray="4 4"' : ""} marker-end="url(#${c.marker})"/>`;
    }

    const box = (n, name) => {
      const gone = frame.out && name === "x";
      const line = gone ? "var(--faint)" : "var(--border)";
      const text = gone ? "var(--faint)" : "var(--fg)";
      const fill = gone ? "none" : "color-mix(in srgb, var(--fg) 6%, transparent)";
      return (
        `<rect x="${n.x1}" y="${n.y1}" width="${BW}" height="${BH}" rx="6" ` +
        `style="fill:${fill};stroke:${line}" stroke-width="1.5"${gone ? ' stroke-dasharray="4 4"' : ""}/>` +
        `<text x="${n.cx}" y="${n.cy + 5}" text-anchor="middle" ` +
        `style="fill:${text};font-family:var(--font-mono);font-size:var(--text-sm)">${name}</text>`
      );
    };
    svg += box(a, "a") + box(b, "b") + box(x, "x");

    stage.innerHTML =
      `<svg width="100%" height="100%" viewBox="0 0 ${w.toFixed(0)} ${h.toFixed(0)}" ` +
      `preserveAspectRatio="none" role="img" aria-hidden="true" style="display:block">${svg}</svg>`;
  },
};
