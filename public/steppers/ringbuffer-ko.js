/**
 * Ring-buffer queue trace for <Stepper>, driving the Python block `ko-ring`
 * in modul 02.
 *
 * Line numbers refer to that <CodeBlock>:
 *    1 class Queue:
 *    2     def __init__(self, m):
 *    3         self.A = [None] * m
 *    4         self.head = 0  # først i køen
 *    5         self.tail = 0  # neste ledige plass
 *    6
 *    7     def enqueue(self, x):
 *    8         self.A[self.tail] = x
 *    9         self.tail = (self.tail + 1) % len(self.A)
 *   10
 *   11     def dequeue(self):
 *   12         x = self.A[self.head]
 *   13         self.head = (self.head + 1) % len(self.A)
 *   14         return x
 *
 * The trace is a fixed script (no shuffle): enough enqueues and dequeues that
 * tail wraps past the end and reuses a freed slot. A dequeued value stays in
 * its slot, faded, until it is overwritten — that is what really happens in
 * the table.
 *
 * Colours are framework tokens only, so frames re-theme on the light/dark
 * toggle without the module knowing which theme is active.
 */

const M = 8;

export default {
  run() {
    const A = Array(M).fill(null);
    let head = 0;
    let tail = 0;
    let count = 0;
    const frames = [];
    const snap = (extra) => frames.push({ A: [...A], head, tail, count, ...extra });

    snap({
      line: [3, 4, 5],
      desc: `En tom kø med plass til m = ${M} elementer. head og tail peker begge på plass 0.`,
      vars: { head, tail },
    });

    const enqueue = (x) => {
      const slot = tail;
      A[slot] = x;
      count += 1;
      snap({
        line: 8,
        desc: `enqueue(${x}): ${x} skrives på plass tail = ${slot}.`,
        vars: { x, head, tail },
        wrote: slot,
      });
      const wraps = slot === M - 1;
      tail = (slot + 1) % M;
      snap({
        line: 9,
        desc: wraps
          ? `(${slot} + 1) % ${M} = 0: tail går rundt til starten igjen. Tabellen er en ring.`
          : `tail rykker fram til ${tail}.`,
        vars: { x, head, tail },
        wrote: slot,
      });
    };

    const dequeue = () => {
      const slot = head;
      const x = A[slot];
      snap({
        line: 12,
        desc: `dequeue(): x = A[head] = A[${slot}] = ${x}. Den som kom først inn, går først ut.`,
        vars: { x, head, tail },
        read: slot,
      });
      head = (slot + 1) % M;
      count -= 1;
      snap({
        line: 13,
        desc: `head rykker fram til ${head}, og ${x} returneres. Verdien blir stående på plass ${slot} til den skrives over.`,
        vars: { x, head, tail },
        read: slot,
      });
    };

    enqueue(15);
    enqueue(6);
    enqueue(9);
    enqueue(8);
    dequeue();
    dequeue();
    enqueue(17);
    enqueue(3);
    enqueue(12);
    enqueue(7);
    enqueue(2);

    snap({
      line: 9,
      desc:
        `Køen har ${count} elementer, forrest 9 på plass head = ${head}, og neste ledige plass er ` +
        `tail = ${tail}. Ingen elementer er flyttet underveis; bare indeksene har beveget seg.`,
      vars: { head, tail },
    });

    return frames;
  },

  render(stage, frame, api) {
    const { w, h } = api.getSize();
    if (w <= 0 || h <= 0) {
      stage.innerHTML = "";
      return;
    }

    const cx = w / 2;
    const cy = h / 2 + 2;
    const R = Math.max(56, Math.min(w, h) / 2 - 52);
    const slotR = Math.min(19, Math.max(13, (2 * Math.PI * R) / M / 4.6));
    const angle = (i) => -Math.PI / 2 + (i * 2 * Math.PI) / M;
    const pos = (i, r) => ({
      x: cx + r * Math.cos(angle(i)),
      y: cy + r * Math.sin(angle(i)),
    });

    // Which slots hold live queue elements right now.
    const live = new Set();
    for (let j = 0; j < frame.count; j++) live.add((frame.head + j) % M);

    let svg = "";

    for (let i = 0; i < M; i++) {
      const p = pos(i, R);
      const v = frame.A[i];
      const isLive = live.has(i);

      let stroke = "var(--border)";
      let fill = "none";
      let dash = ' stroke-dasharray="3 3"';
      let textFill = "var(--faint)";
      if (frame.wrote === i) {
        stroke = "var(--accent)";
        fill = "var(--accent-weak)";
        dash = "";
        textFill = "var(--accent-ink)";
      } else if (frame.read === i && isLive) {
        stroke = "var(--orange)";
        fill = "color-mix(in srgb, var(--orange) 16%, transparent)";
        dash = "";
        textFill = "var(--fg)";
      } else if (isLive) {
        stroke = "var(--border)";
        fill = "color-mix(in srgb, var(--fg) 10%, transparent)";
        dash = "";
        textFill = "var(--fg)";
      }

      svg +=
        `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${slotR.toFixed(1)}" ` +
        `style="fill:${fill};stroke:${stroke}" stroke-width="1.5"${dash}/>`;
      if (v != null) {
        svg +=
          `<text x="${p.x.toFixed(1)}" y="${(p.y + 4).toFixed(1)}" text-anchor="middle" ` +
          `style="fill:${textFill};font-family:var(--font-mono);font-size:var(--text-xs)">${v}</text>`;
      }

      // Slot index, just inside the ring.
      const q = pos(i, R - slotR - 13);
      svg +=
        `<text x="${q.x.toFixed(1)}" y="${(q.y + 3).toFixed(1)}" text-anchor="middle" ` +
        `style="fill:var(--faint);font-family:var(--font-mono);font-size:var(--text-xs)">${i}</text>`;
    }

    // head/tail markers outside the ring: a triangle pointing at the slot and
    // a label beyond it. If both sit on the same slot, one combined label.
    const marker = (i, label, colour) => {
      const tip = pos(i, R + slotR + 4);
      const base = pos(i, R + slotR + 12);
      const a = angle(i);
      const px = -Math.sin(a);
      const py = Math.cos(a);
      const s = 4.5;
      svg +=
        `<polygon points="${tip.x.toFixed(1)},${tip.y.toFixed(1)} ` +
        `${(base.x + px * s).toFixed(1)},${(base.y + py * s).toFixed(1)} ` +
        `${(base.x - px * s).toFixed(1)},${(base.y - py * s).toFixed(1)}" style="fill:${colour}"/>`;
      const t = pos(i, R + slotR + 24);
      const anchor = Math.abs(t.x - cx) < R * 0.35 ? "middle" : t.x < cx ? "end" : "start";
      svg +=
        `<text x="${t.x.toFixed(1)}" y="${(t.y + 3).toFixed(1)}" text-anchor="${anchor}" ` +
        `style="fill:${colour};font-family:var(--font-mono);font-size:var(--text-xs)">${label}</text>`;
    };
    if (frame.head === frame.tail) {
      marker(frame.head, "head, tail", "var(--muted)");
    } else {
      marker(frame.head, "head", "var(--green)");
      marker(frame.tail, "tail", "var(--accent)");
    }

    // Element count in the middle of the ring.
    svg +=
      `<text x="${cx.toFixed(1)}" y="${(cy - 2).toFixed(1)}" text-anchor="middle" ` +
      `style="fill:var(--muted);font-family:var(--font-mono);font-size:var(--text-sm)">n = ${frame.count}</text>` +
      `<text x="${cx.toFixed(1)}" y="${(cy + 16).toFixed(1)}" text-anchor="middle" ` +
      `style="fill:var(--faint);font-family:var(--font-mono);font-size:var(--text-xs)">m = ${M}</text>`;

    stage.innerHTML =
      `<svg width="100%" height="100%" viewBox="0 0 ${w.toFixed(0)} ${h.toFixed(0)}" ` +
      `preserveAspectRatio="none" role="img" aria-hidden="true" style="display:block">${svg}</svg>`;
  },
};
