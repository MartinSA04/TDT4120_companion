// Shared graph renderer for graph-algorithm <Stepper>s (TDT4120):
// BFS, DFS, Kruskal/Prim (MST), Dijkstra/Bellman-Ford, Ford-Fulkerson.
//
// A frame supplies `graph`:
//   {
//     nodes: [{ id, label, x, y, role?, sub? }],  // x,y normalized 0..100
//     edges: [{ u, v, w?, label?, role? }],        // u,v = node ids
//     directed?: boolean,                          // draw arrowheads
//   }
// Node roles:  active | frontier | done | source | target | reject | (default)
// Edge roles:  tree | active | path | augmenting | examined | back | reject | (default)
// Colours are framework theme tokens, so frames re-theme on light/dark toggle.
import { esc } from "./_util.js";

const NODE = {
  active: { stroke: "var(--accent)", fill: "var(--accent-weak)" },
  frontier: { stroke: "var(--orange)", fill: "color-mix(in srgb, var(--orange) 14%, var(--bg-elevated))" },
  done: { stroke: "var(--green)", fill: "color-mix(in srgb, var(--green) 16%, var(--bg-elevated))" },
  source: { stroke: "var(--violet)", fill: "color-mix(in srgb, var(--violet) 14%, var(--bg-elevated))" },
  target: { stroke: "var(--cyan)", fill: "color-mix(in srgb, var(--cyan) 14%, var(--bg-elevated))" },
  reject: { stroke: "var(--red)", fill: "var(--bg-elevated)" },
};
const NODE_DEFAULT = { stroke: "var(--muted)", fill: "var(--bg-elevated)" };

const EDGE = {
  tree: { c: "var(--green)", w: 3, dash: "" },
  path: { c: "var(--accent)", w: 3.4, dash: "" },
  active: { c: "var(--accent)", w: 3.4, dash: "" },
  augmenting: { c: "var(--accent)", w: 3.4, dash: "" },
  examined: { c: "var(--orange)", w: 2, dash: "" },
  saturated: { c: "var(--red)", w: 2.6, dash: "" },
  back: { c: "var(--red)", w: 1.8, dash: "4 3" },
  reject: { c: "var(--red)", w: 1.6, dash: "4 3" },
};
const EDGE_DEFAULT = { c: "var(--border-strong)", w: 1.4, dash: "" };

const ARROW_ROLES = { default: "var(--border-strong)", active: "var(--accent)", path: "var(--accent)", tree: "var(--green)", augmenting: "var(--accent)" };

/**
 * @param {HTMLElement} stage
 * @param {any} frame  { graph: {...} }
 * @param {{getSize:()=>{w:number,h:number}}} api
 */
export function renderGraph(stage, frame, api, opts = {}) {
  const { w, h } = api.getSize();
  const g = frame.graph || {};
  const nodes = g.nodes || [];
  const edges = g.edges || [];
  if (!nodes.length || w <= 0) {
    stage.innerHTML = "";
    return;
  }
  const directed = !!g.directed;
  const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));

  const pad = 30;
  const R = Math.max(11, Math.min(20, 22 - nodes.length * 0.5));
  const px = (nx) => pad + (nx / 100) * (w - 2 * pad);
  const py = (ny) => pad + (ny / 100) * (h - 2 * pad);

  const markers = directed
    ? `<defs>${Object.entries(ARROW_ROLES)
        .map(
          ([role, c]) =>
            `<marker id="ah-${role}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="${c}"/></marker>`,
        )
        .join("")}</defs>`
    : "";

  // ── edges (under nodes) ───────────────────────────────────────────────────
  let body = "";
  for (const e of edges) {
    const a = byId[e.u];
    const b = byId[e.v];
    if (!a || !b) continue;
    const st = EDGE[e.role] || EDGE_DEFAULT;
    const ax = px(a.x), ay = py(a.y), bx = px(b.x), by = py(b.y);
    const dx = bx - ax, dy = by - ay;
    const len = Math.hypot(dx, dy) || 1;
    const ux = dx / len, uy = dy / len;
    const x1 = ax + ux * R, y1 = ay + uy * R;
    const x2 = bx - ux * (R + (directed ? 4 : 0)), y2 = by - uy * (R + (directed ? 4 : 0));
    const markerRole = ARROW_ROLES[e.role] ? e.role : "default";
    body += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${st.c}" stroke-width="${st.w}" ${st.dash ? `stroke-dasharray="${st.dash}"` : ""} stroke-linecap="round"${directed ? ` marker-end="url(#ah-${markerRole})"` : ""}/>`;
    const wl = e.label != null ? e.label : e.w;
    if (wl != null && wl !== "") {
      const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
      const nx = -uy, ny = ux; // perpendicular offset so the label clears the line
      body += `<text x="${(mx + nx * 11).toFixed(1)}" y="${(my + ny * 11 + 4).toFixed(1)}" text-anchor="middle" style="fill:var(--fg);font-family:var(--font-mono);font-size:12px;paint-order:stroke;stroke:var(--bg-elevated);stroke-width:3px">${esc(wl)}</text>`;
    }
  }

  // ── nodes ─────────────────────────────────────────────────────────────────
  for (const n of nodes) {
    const c = px(n.x), cy = py(n.y);
    const sc = NODE[n.role] || NODE_DEFAULT;
    const sw = n.role && n.role !== "default" ? 2.6 : 1.6;
    body += `<circle cx="${c.toFixed(1)}" cy="${cy.toFixed(1)}" r="${R}" fill="${sc.fill}" stroke="${sc.stroke}" stroke-width="${sw}"/>`;
    body += `<text x="${c.toFixed(1)}" y="${(cy + 4.5).toFixed(1)}" text-anchor="middle" style="fill:var(--fg);font-family:var(--font-mono);font-weight:600;font-size:13px">${esc(n.label)}</text>`;
    if (n.sub != null && n.sub !== "")
      body += `<text x="${c.toFixed(1)}" y="${(cy + R + 13).toFixed(1)}" text-anchor="middle" style="fill:var(--accent);font-family:var(--font-mono);font-size:11px">${esc(n.sub)}</text>`;
  }

  stage.innerHTML = `<svg width="100%" height="100%" viewBox="0 0 ${w.toFixed(0)} ${h.toFixed(0)}" preserveAspectRatio="xMidYMid meet" role="img" aria-hidden="true" style="display:block">${markers}${body}</svg>`;
}
