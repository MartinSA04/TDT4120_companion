/* global React, window */
// =====================================================================
// TreeView — node/edge tree layout used by heap, BST, recursion-tree, and
// (legacy) merge-sort recursion. Includes the array strip, merge-buffer
// panel, and side panel sub-components. (viewKind "tree-view")
// =====================================================================
(function () {
function TreeNodeShape({ node }) {
  const state = node.state || "default";
  const fill = (() => {
    switch (state) {
      case "active":     return "var(--role-pivot)";
      case "compare":    return "var(--role-compare)";
      case "swap":       return "var(--role-swap)";
      case "frontier":   return "var(--role-compare)";
      case "visited":    return "var(--role-sorted)";
      case "settled":    return "var(--role-sorted)";
      case "found":      return "var(--role-sorted)";
      case "eliminated": return "var(--role-eliminated)";
      default:           return "var(--surface-2)";
    }
  })();
  const stroke = state === "default" ? "var(--rule-soft)"
    : state === "eliminated" ? "var(--ink-4)"
    : "var(--ink)";
  const textColor = state === "default" || state === "eliminated"
    ? "var(--ink)" : "var(--surface-2)";
  // `maxWidth` (in viewBox units) is the algorithm's hint about how much
  // horizontal room this node has. Rect nodes never grow wider than that,
  // and circle nodes shrink their radius so adjacent siblings don't overlap.
  const maxWidth = typeof node.maxWidth === "number" ? node.maxWidth : 38;
  const isRect = node.shape === "rect";
  const labelStr = String(node.label ?? "");
  const naturalRectW = Math.max(14, labelStr.length * 2.4 + 4);
  const w = isRect ? Math.min(maxWidth, Math.min(38, naturalRectW)) : null;
  const r = isRect ? null : Math.max(2.2, Math.min(4.7, (maxWidth - 1) / 2));
  const labelFontPx = isRect
    ? null
    : (r >= 4 ? 3.1 : r >= 3 ? 2.6 : r >= 2.4 ? 2.2 : 0);  // 0 = hide label

  return (
    <g opacity={state === "eliminated" ? 0.5 : 1}>
      {isRect ? (
        <rect
          x={node.x - w / 2}
          y={node.y - 4.6}
          width={w}
          height={9.2}
          fill={fill}
          stroke={stroke}
          strokeWidth={state === "active" ? 1.4 : 0.9}
        />
      ) : (
        <circle
          cx={node.x}
          cy={node.y}
          r={r}
          fill={fill}
          stroke={stroke}
          strokeWidth={state === "active" ? 1.4 : 0.8}
        />
      )}
      {(isRect || labelFontPx > 0) && (
        <text
          x={node.x}
          y={node.y + 1.4}
          textAnchor="middle"
          className="node-label"
          fill={textColor}
          style={!isRect && labelFontPx ? { fontSize: `${labelFontPx}px` } : undefined}
        >
          {node.label}
        </text>
      )}
      {node.sublabel && (isRect || (r >= 3.5)) && (
        <text x={node.x} y={node.y + 9.5} textAnchor="middle" className="node-sublabel">
          {node.sublabel}
        </text>
      )}
      {node.badge && (
        <g>
          <rect
            x={node.x - 9}
            y={node.y - 13}
            width={18}
            height={5}
            fill="var(--accent)"
            opacity="0.95"
          />
          <text x={node.x} y={node.y - 9.2} textAnchor="middle" className="node-badge">
            {node.badge}
          </text>
        </g>
      )}
    </g>
  );
}

function TreeEdgeLine({ a, b, edge }) {
  let stroke = "var(--rule-soft)";
  let width = 0.6;
  let dash = "";
  let opacity = 0.85;
  switch (edge.role) {
    case "active":     stroke = "var(--accent)"; width = 1.6; break;
    case "tree":       stroke = "var(--role-sorted)"; width = 1.4; break;
    case "found":      stroke = "var(--role-sorted)"; width = 1.4; break;
    case "compare":    stroke = "var(--role-compare)"; width = 1.2; break;
    case "swap":       stroke = "var(--role-swap)"; width = 1.4; break;
    case "eliminated": stroke = "var(--ink-4)"; width = 0.4; dash = "1.5 1.5"; opacity = 0.45; break;
    default:           break;
  }
  // Shrink endpoints so the lines don't bleed under the node circles
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len, uy = dy / len;
  const r = 4.7;
  const x1 = a.x + ux * r;
  const y1 = a.y + uy * r;
  const x2 = b.x - ux * r;
  const y2 = b.y - uy * r;

  return (
    <g>
      <line
        x1={x1} y1={y1} x2={x2} y2={y2}
        stroke={stroke}
        strokeWidth={width}
        strokeDasharray={dash}
        opacity={opacity}
      />
      {edge.label && (
        <text
          x={(x1 + x2) / 2}
          y={(y1 + y2) / 2 - 1.3}
          textAnchor="middle"
          className="edge-label"
        >
          {edge.label}
        </text>
      )}
    </g>
  );
}

function TreeArrayStrip({ array, highlights = {}, slotLabels = null, title = "array view" }) {
  if (!array || !array.length) return null;
  return (
    <div className="tree-array">
      <div className="tree-array-head">
        <span className="eyebrow">{title}</span>
        <span className="tree-array-meta">n = {array.length}</span>
      </div>
      <div className="tree-array-cells">
        {array.map((v, i) => {
          const role = highlights[i];
          const cls = role ? `tree-array-cell role-${role}` : "tree-array-cell";
          return (
            <div key={i} className={cls}>
              <span className="tree-array-value">{v}</span>
              <span className="tree-array-index">{slotLabels ? slotLabels[i] : i}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MergePanel({ left, right, output, i, j, role = null }) {
  if (!left && !right && !output) return null;
  return (
    <div className="merge-panel">
      <div className="merge-panel-head">
        <span className="eyebrow">merge two sorted halves</span>
        {role && <span className="merge-panel-meta">{role}</span>}
      </div>
      <div className="merge-panel-grid">
        <MergeRow label="left" arr={left} ptr={i} />
        <MergeRow label="right" arr={right} ptr={j} />
        <MergeRow label="output" arr={output} ptr={null} highlight />
      </div>
    </div>
  );
}

function MergeRow({ label, arr, ptr, highlight = false }) {
  if (!arr) return null;
  return (
    <div className="merge-row">
      <span className="merge-row-label">{label}</span>
      <div className="merge-row-cells">
        {arr.map((v, i) => {
          const isCur = ptr === i;
          const cls = isCur
            ? "merge-cell cur"
            : highlight
            ? "merge-cell out"
            : "merge-cell";
          return <span key={i} className={cls}>{v}</span>;
        })}
        {arr.length === 0 && <span className="merge-cell empty">(empty)</span>}
      </div>
    </div>
  );
}

function TreeSidePanel({ panel }) {
  if (!panel) return null;
  return (
    <aside className="tree-side">
      <div className="tree-side-head">
        <span className="eyebrow">{panel.title}</span>
        {panel.meta && <span className="tree-side-meta">{panel.meta}</span>}
      </div>
      {panel.rows && (
        <div className="tree-side-rows">
          {panel.rows.map((r, i) => (
            <div key={i} className="tree-side-row">
              <span className="tree-side-label">{r.label}</span>
              <span className={`tree-side-value ${r.role || ""}`}>{r.value}</span>
            </div>
          ))}
        </div>
      )}
      {panel.note && (
        <div className="tree-side-note">{panel.note}</div>
      )}
    </aside>
  );
}

function TreeView({ frame, height = 320 }) {
  const v = frame.visual || {};
  const nodes = v.nodes || [];
  const edges = v.edges || [];
  const arrayInfo = v.array;
  const merge = v.merge;
  const side = v.side;
  const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));

  return (
    <div className="tree-view" style={{ minHeight: height }}>
      <div className="tree-stage">
        <svg viewBox="0 0 100 100" className="tree-svg" role="img">
          {edges.map((e, i) => {
            const a = byId[e.from];
            const b = byId[e.to];
            if (!a || !b) return null;
            return <TreeEdgeLine key={`${e.from}-${e.to}-${i}`} a={a} b={b} edge={e} />;
          })}
          {nodes.map((n) => (
            <TreeNodeShape key={n.id} node={n} />
          ))}
        </svg>
        {side && <TreeSidePanel panel={side} />}
      </div>
      {arrayInfo && (
        <TreeArrayStrip
          array={arrayInfo.values}
          highlights={arrayInfo.highlights || {}}
          slotLabels={arrayInfo.slotLabels}
          title={arrayInfo.title || "array view"}
        />
      )}
      {merge && (
        <MergePanel
          left={merge.left}
          right={merge.right}
          output={merge.output}
          i={merge.i}
          j={merge.j}
          role={merge.role}
        />
      )}
    </div>
  );
}


window.AlgViz = window.AlgViz || {};
window.AlgViz.TreeView = TreeView;
})();
