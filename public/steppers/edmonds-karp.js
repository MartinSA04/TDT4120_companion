/**
 * Edmonds-Karp trace for <Stepper>, driving the block `ff-kode` (the book's
 * Ford-Fulkerson) in modul 13 «Maksimal flyt»: the path in line 3 is found by
 * breadth-first search in the residual network. The input is the capacities
 * of the nine pipes of the lecture's network (NETT in _flytnett.js); the first
 * input is the lecture's own, and shuffling deals new ones from 1 to 20.
 *
 * Stage: G with its pipes on the left and the residual network G_f on the
 * right, as on the lecture's slides. During an augmentation G_f stays as BFS
 * saw it; a frame after the last edge shows the new G_f. BFS distances from s
 * are small numbers by the nodes of G_f. The path is in the accent, its
 * bottleneck boxed. When BFS no longer reaches t, the nodes it reached are
 * filled in both panels.
 *
 * Block lines count the header as line 1, so code line k is block line k + 1.
 */
import { wrapSvg } from "./_graf.js";

const list = (xs) => (xs.length < 2 ? xs.join("") : `${xs.slice(0, -1).join(", ")} og ${xs[xs.length - 1]}`);
import { NETT, TOKENS, bfs, cf, key, nodeSvg, pipeSvg, place, residualSvg } from "./_flytnett.js";

let calls = 0;
const L = (k) => k + 1;

export default {
  defaultData() {
    if (calls++ === 0) return NETT.edges.map((e) => e.c);
    return NETT.edges.map(() => 1 + Math.floor(Math.random() * 20));
  },

  run(caps) {
    const net = { ...NETT, edges: NETT.edges.map((e, i) => ({ ...e, c: caps[i] })) };
    const { s, t } = net;
    const flow = new Map();
    let val = 0;
    const frames = [];
    const snap = (line, desc, x = {}) =>
      frames.push({
        net,
        line,
        desc,
        flow: new Map(flow),
        rflow: new Map(x.rflow ?? flow),
        path: x.path ?? null,
        neck: x.neck ?? null,
        cur: x.cur ?? null,
        dist: x.dist ?? null,
        S: x.S ?? null,
        vars: { "|f|": val, ...(x.vars ?? {}) },
      });

    snap([L(1), L(2)], "Linje 1–2: flyten er 0 i alle rørene. Da har hvert rør ledig plass lik kapasiteten, og restnettet er en kopi av G.");
    for (let round = 1; ; round++) {
      const { d, pi } = bfs(net, flow);
      if (!d.has(t)) {
        const S = new Set(d.keys());
        const sorted = [...S].sort((a, b) => a - b);
        const names = list(sorted);
        snap(L(3), `BFS i restnettet kommer bare fram til ${names}, ikke til ${t}. Det finnes ingen forøkende sti, så løkka stopper.`, { dist: d, S });
        const out = net.edges.filter((e) => S.has(e.from) && !S.has(e.to));
        const inn = net.edges.filter((e) => !S.has(e.from) && S.has(e.to));
        const cap = out.reduce((a, e) => a + e.c, 0);
        const pipe = (e) => `(${e.from}, ${e.to})`;
        let msg = `|f| = ${val}. Rørene ut av {${sorted.join(", ")}} er fulle: ${list(out.map(pipe))} med ${out.map((e) => e.c).join(" + ")} = ${cap}.`;
        if (inn.length) msg += ` ${inn.length === 1 ? "Røret inn," : "Rørene inn,"} ${list(inn.map(pipe))}, er tom${inn.length === 1 ? "t" : "e"}.`;
        snap(L(9), msg, { S, dist: d });
        break;
      }
      const path = [t];
      while (pi.get(path[0]) != null) path.unshift(pi.get(path[0]));
      const steps = [];
      for (let i = 1; i < path.length; i++) steps.push([path[i - 1], path[i], cf(net.edges, flow, path[i - 1], path[i])]);
      const b = Math.min(...steps.map((x) => x[2]));
      const rflow = new Map(flow);
      const base = { path, rflow, dist: d };
      snap(
        L(3),
        `Runde ${round}: BFS i restnettet finner stien ${path.join(", ")}, med ${path.length - 1} kanter. Ingen sti fra ${s} til ${t} i restnettet har færre.`,
        base,
      );
      const necks = steps.filter((x) => x[2] === b).map((x) => `${x[0]}-${x[1]}`);
      snap(L(4), `Restkapasitetene langs stien er ${steps.map((x) => x[2]).join(", ")}. Den minste er flaskehalsen: c_f(p) = ${b}.`, {
        ...base,
        neck: necks,
        vars: { "c_f(p)": b },
      });
      for (const [u, v] of steps) {
        const fwd = net.edges.some((e) => e.from === u && e.to === v);
        if (fwd) {
          const old = flow.get(key(u, v)) ?? 0;
          flow.set(key(u, v), old + b);
          const c = net.edges.find((e) => e.from === u && e.to === v).c;
          snap([L(6), L(7)], `(${u}, ${v}) er en kant i G, så flyten øker: (${u}, ${v}).f = ${old} + ${b} = ${old + b} av ${c}.`, {
            ...base,
            cur: [u, v],
            vars: { "c_f(p)": b, "(u, v)": `(${u}, ${v})` },
          });
        } else {
          const old = flow.get(key(v, u)) ?? 0;
          flow.set(key(v, u), old - b);
          snap(
            [L(6), L(8)],
            `(${u}, ${v}) er ikke en kant i G, men (${v}, ${u}) er det. Stien går mot røret, så flyten i det synker: (${v}, ${u}).f = ${old} − ${b} = ${old - b}.`,
            { ...base, cur: [v, u], vars: { "c_f(p)": b, "(u, v)": `(${u}, ${v})` } },
          );
        }
      }
      val += b;
      snap(L(3), `Flyten har økt med ${b} til |f| = ${val}. Restnettet til høyre er nå restnettet for den nye flyten.`, {});
    }
    return frames;
  },

  render(stage, fr, { getSize }) {
    const { w, h } = getSize();
    if (w <= 0 || h <= 0) return;
    const { net } = fr;
    const r = w < 420 ? 11 : 13;
    const k = w < 420 ? 0.42 : 0.6;
    const gap = 10;
    const top = 22;
    const gw = Math.min(260, (w - gap) * 0.54);
    const rw = Math.min(230, w - gap - gw);
    const x0 = (w - gw - gap - rw) / 2;
    const posG = place(net.nodes, { x: x0, y: top, w: gw, h: h - top }, { l: r + 30, r: r + 30, t: r + 4, b: r + 6 });
    const posR = place(net.nodes, { x: x0 + gw + gap, y: top, w: rw, h: h - top }, { l: r + 10, r: r + 10, t: r + 4, b: r + 6 });

    let s = "";
    const cur = fr.cur ? `${fr.cur[0]}-${fr.cur[1]}` : null;
    for (const e of net.edges) {
      const f = fr.flow.get(key(e.from, e.to)) ?? 0;
      s += pipeSvg(posG.get(e.from), posG.get(e.to), r, k, e.c, f, {
        label: `${f}/${e.c}`,
        side: e.side,
        at: e.at,
        inline: e.from === 3 && e.to === 4,
        ring: cur === `${e.from}-${e.to}`,
        labelColor: f > 0 ? TOKENS.fg : TOKENS.muted,
      }).svg;
    }
    const onPath = new Set();
    if (fr.path) for (let i = 1; i < fr.path.length; i++) onPath.add(`${fr.path[i - 1]}-${fr.path[i]}`);
    const necks = new Set(fr.neck ?? []);
    s += residualSvg(net, posR, r, fr.rflow, {
      bend: 9,
      hl: (u, v) => (necks.has(`${u}-${v}`) ? "neck" : onPath.has(`${u}-${v}`) ? "path" : null),
    });
    for (const [pos, isR] of [
      [posG, false],
      [posR, true],
    ]) {
      for (const n of net.nodes) {
        const p = pos.get(n.id);
        s += nodeSvg(p, r, n.id, { filled: fr.S?.has(n.id) });
        if (isR && fr.dist?.has(n.id)) {
          const left = n.gx < 1 || (n.gx === 1 && n.gy === 0);
          s +=
            `<text x="${(p.x + (left ? -r - 4 : r + 4)).toFixed(1)}" y="${(p.y - r + 2).toFixed(1)}" ` +
            `text-anchor="${left ? "end" : "start"}" style="fill:var(--green);${TOKENS.font};font-weight:600">${fr.dist.get(n.id)}</text>`;
        }
      }
    }
    s +=
      `<text x="${(x0 + gw / 2).toFixed(1)}" y="14" text-anchor="middle" style="fill:var(--muted);${TOKENS.font}">G</text>` +
      `<text x="${(x0 + gw + gap + rw / 2).toFixed(1)}" y="14" text-anchor="middle" style="fill:var(--muted);${TOKENS.font}">restnettet G<tspan dy="4" font-size="80%">f</tspan></text>`;
    stage.innerHTML = wrapSvg(w, h, s);
  },
};
