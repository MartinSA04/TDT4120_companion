(function () {
const { useMemo, useState } = React;
const { txt, go, Section, Eyebrow, MonoMeta } = window.AlgViz;

const topicRules = [
  { rx: /asymptotisk|asymptotic|best-case|worst-case|average-case|gjennomsnitt|kjøretid|running time|o-notasjon|Ω|Ω|Θ|omega|theta/i, conceptIds: ["asymptotic-notation"], lectureIds: ["l01"] },
  { rx: /ram-modell|ram model|logaritmisk minne|inputstørrelse|problemstørrelse/i, conceptIds: ["ram-model", "problem-instance"], lectureIds: ["l01"] },
  { rx: /insertion-sort|insertion sort|insertionsort/i, algorithmIds: ["insertion-sort"], lectureIds: ["l01"], conceptIds: ["loop-invariant"] },
  { rx: /merge-sort|merge sort|flettesort/i, algorithmIds: ["merge-sort"], lectureIds: ["l03"], conceptIds: ["divide-and-conquer", "recurrence"] },
  { rx: /quick|partition|pivot|randomized-select|select\(/i, algorithmIds: ["quick-sort"], lectureIds: ["l03", "l04"], conceptIds: ["divide-and-conquer", "recurrence"] },
  { rx: /rekurrens|recurrence|masterteorem|master theorem|substitusjon|rekursjonstr|T\(n\)|algoritmisk rekurrens/i, algorithmIds: ["recursion-tree"], lectureIds: ["l03"], conceptIds: ["recurrence"] },
  { rx: /counting-sort|tellesort|radix|bucket|sammenligningsbasert|comparison sort|nedre grense|sortering/i, algorithmIds: ["counting-radix"], lectureIds: ["l04"], conceptIds: ["stable-sort", "comparison-lower-bound"] },
  { rx: /haug|heap|build-max-heap|prioritetskø|priority queue|extract-min|decrease-key/i, algorithmIds: ["heap-priority-queue"], lectureIds: ["l05"], conceptIds: ["heap"] },
  { rx: /binært søketre|binary search tree|tree-insert|tree-search|inorder|søketre/i, algorithmIds: ["binary-search-tree"], lectureIds: ["l05"], conceptIds: ["bst"] },
  { rx: /lenket liste|linked list|stakk|stack|fifo|enqueue|dequeue|kø|queue|dynamisk tabell|table-insert|hash|hashtabell|chaining|kjeding|kollider/i, lectureIds: ["l05"], terms: [{ no: "Grunnleggende datastrukturer", en: "Basic data structures" }] },
  { rx: /dynamisk programmering|dynamic programming|memoisering|memoization|overlappende|lcs|longest common subsequence|knapsack|ryggsekk|subset-sum|delsum|bottom-up|top-down/i, algorithmIds: ["dp-table"], lectureIds: ["l06", "l13"], conceptIds: ["dynamic-programming", "binary-knapsack"] },
  { rx: /grådig|greedy|huffman|aktivitet|activity selection|kontinuerlig ryggsekk/i, algorithmIds: ["activity-selection"], lectureIds: ["l07"], conceptIds: ["greedy-choice"] },
  { rx: /stable matching|stabil matching|gale-shapley|matching|misunne|organdonor/i, lectureIds: ["l07"], terms: [{ no: "Stabil matching", en: "Stable matching" }] },
  { rx: /bfs|bredde|korteste veier i uvektede|uvektet graf|reachability|sti fra s til t|grafrepresentasjon|nabomatrise|bipartitt|tofargbar/i, algorithmIds: ["bfs"], lectureIds: ["l08"], conceptIds: ["graph-traversal", "bfs"] },
  { rx: /dfs|dybde|topologisk|sterke komponent|strongly connected|scc|odde sykel|cycle/i, algorithmIds: ["dfs"], lectureIds: ["l08"], conceptIds: ["graph-traversal", "dfs"] },
  { rx: /spenntre|mst|kruskal|prim|snitt|cut|trygg|safe|letteste kant|disjunkt|find-set|union/i, algorithmIds: ["mst-kruskal"], lectureIds: ["l09"], conceptIds: ["mst", "disjoint-set", "greedy-choice"] },
  { rx: /dijkstra|bellman-ford|relax|dag-shortest|korteste vei|shortest path|negative kant|avstandsestimat/i, algorithmIds: ["dijkstra"], lectureIds: ["l10"], conceptIds: ["relaxation", "dijkstra"] },
  { rx: /floyd-warshall|slow-apsp|faster-apsp|apsp|transitive-closure|alle par|mellomliggende|vektmatrise/i, algorithmIds: ["floyd-warshall"], lectureIds: ["l11"], conceptIds: ["apsp", "dynamic-programming"] },
  { rx: /flyt|flow|restkapasitet|residual|edmonds|ford-fulkerson|forøkende|augmenting|heltallsteoremet|integrality|maks-flyt|min-snitt/i, algorithmIds: ["max-flow"], lectureIds: ["l12"], conceptIds: ["max-flow", "residual-network", "reduction"] },
  { rx: /np-|npc|np-komplett|np-hard|polynomisk|reduksjon|reduce|reducer|circuit-sat|vertex-cover|nodedekke|tsp|traveling|homomorfi|karp|faktorisering|grafisomorfi/i, algorithmIds: ["np-reductions"], lectureIds: ["l13", "l14"], conceptIds: ["np-completeness", "karp-reduction", "reduction"] },
];

const archiveBase = "https://algdat.idi.ntnu.no/arkiv/";

const categories = [
  { id: "all", label: { no: "Alle kategorier", en: "All categories" } },
  { id: "analysis", label: { no: "Analyse og kjøretid", en: "Analysis and runtime" } },
  { id: "sorting", label: { no: "Sortering og rangering", en: "Sorting and ranking" } },
  { id: "data-structures", label: { no: "Datastrukturer", en: "Data structures" } },
  { id: "dynamic-programming", label: { no: "Dynamisk programmering", en: "Dynamic programming" } },
  { id: "greedy", label: { no: "Grådighet og matching", en: "Greedy and matching" } },
  { id: "graphs", label: { no: "Grafer og traversering", en: "Graphs and traversal" } },
  { id: "shortest-paths", label: { no: "Korteste veier", en: "Shortest paths" } },
  { id: "mst", label: { no: "Spenntrær", en: "Spanning trees" } },
  { id: "flow", label: { no: "Flyt", en: "Flow" } },
  { id: "np", label: { no: "NP og reduksjoner", en: "NP and reductions" } },
  { id: "other", label: { no: "Blandet", en: "Mixed" } },
];

const categoryRules = [
  { id: "flow", rx: /flyt|flow|restkapasitet|residual|edmonds|ford-fulkerson|forøkende|augmenting|heltallsteoremet|integrality|maks-flyt|min-snitt/i },
  { id: "np", rx: /np-|npc|np-komplett|np-hard|polynomisk|reduksjon|circuit-sat|vertex-cover|nodedekke|subset-sum|delsum|tsp|traveling|homomorfi|karp|faktorisering|grafisomorfi/i },
  { id: "shortest-paths", rx: /dijkstra|bellman-ford|relax|dag-shortest|korteste vei|shortest path|floyd-warshall|slow-apsp|faster-apsp|apsp|transitive-closure|vektmatrise/i },
  { id: "mst", rx: /spenntre|mst|kruskal|prim|snitt|cut|trygg|safe|letteste kant/i },
  { id: "graphs", rx: /bfs|dfs|bredde|dybde|topologisk|sterke komponent|strongly connected|scc|grafrepresentasjon|nabomatrise|bipartitt|tofargbar|odde sykel/i },
  { id: "dynamic-programming", rx: /dynamisk programmering|dynamic programming|memoisering|memoization|overlappende|lcs|longest common subsequence|knapsack|ryggsekk|bottom-up|top-down/i },
  { id: "greedy", rx: /grådig|greedy|huffman|aktivitet|activity selection|stable matching|stabil matching|gale-shapley|matching|misunne|organdonor/i },
  { id: "data-structures", rx: /haug|heap|build-max-heap|prioritetskø|priority queue|binært søketre|binary search tree|tree-insert|tree-search|inorder|søketre|lenket liste|linked list|stakk|stack|fifo|enqueue|dequeue|kø|queue|hash|hashtabell|chaining|kjeding|kollider|table-insert|dynamisk tabell/i },
  { id: "sorting", rx: /sortering|sort|counting-sort|tellesort|radix|bucket|merge-sort|quick|partition|pivot|randomized-select|insertion-sort|comparison sort|sammenligningsbasert/i },
  { id: "analysis", rx: /asymptotisk|asymptotic|best-case|worst-case|average-case|gjennomsnitt|kjøretid|running time|rekurrens|recurrence|masterteorem|master theorem|substitusjon|T\(n\)|Ω|Ω|Θ|theta|o-notasjon/i },
];

function addUnique(target, values) {
  (values || []).forEach((value) => {
    if (value && !target.includes(value)) target.push(value);
  });
}

function addTerm(target, terms) {
  (terms || []).forEach((term) => {
    const key = `${term.no || ""}|${term.en || ""}`;
    if (!target.some((it) => `${it.no || ""}|${it.en || ""}` === key)) target.push(term);
  });
}

function linkTo(pdf, page) {
  const filename = pdf.split("/").pop();
  return `${archiveBase}${filename}#page=${page || 1}`;
}

function blockText(block) {
  if (!block) return "";
  if (typeof block === "string") return block;
  if (block.type === "text" || block.type === "paragraph") return block.text || "";
  if (block.type === "list") return (block.items || []).join(" ");
  if (block.type === "code") return `${block.title || ""} ${block.code || ""}`;
  if (block.type === "equation") return `${block.title || ""} ${(block.lines || []).join(" ")}`;
  if (block.type === "visual") return block.kind || "";
  return "";
}

function contentText(content) {
  if (Array.isArray(content)) return content.map(blockText).join("\n");
  return String(content || "");
}

function problemText(problem) {
  return `${problem.number}\n${contentText(problem.prompt)}\n${contentText(problem.solution)}`;
}

function categoryFor(problem) {
  const haystack = problemText(problem);
  return categoryRules.find((rule) => rule.rx.test(haystack))?.id || "other";
}

function categoryLabel(categoryId, lang) {
  return txt(categories.find((item) => item.id === categoryId)?.label || categories[0].label, lang);
}

function normalizeMathText(text, problem) {
  let next = String(text || "");
  const replacements = {
    "2022-des-09": [["Hva blir l3,1 ?", "Hva blir l^(2)_(3,1)?"]],
    "2024-des-15": [["Hva blir l1,5 ?", "Hva blir l^(3)_(1,5)?"]],
  };
  (replacements[problem.id] || []).forEach(([from, to]) => {
    next = next.replace(from, to);
  });
  return next
    .replace(/n2\b/g, "n^2")
    .replace(/n3\b/g, "n^3")
    .replace(/n1\/2\b/g, "n^(1/2)")
    .replace(/\)\s*2\b/g, ")^2")
    .replace(/\)\s*3\b/g, ")^3")
    .replace(/lg2\s*n/g, "lg^2 n")
    .replace(/lg3\s*n/g, "lg^3 n")
    .replace(/log4\s*2/g, "log_4 2")
    .replace(/\(n lg n\)2/g, "(n lg n)^2")
    .replace(/\bXi\b/g, "X_i")
    .replace(/\bY j\b/g, "Y_j")
    .replace(/\bxi\b/g, "x_i")
    .replace(/\by j\b/g, "y_j")
    .replace(/\bc f\b/g, "c_f")
    .replace(/\bv\. f\b/g, "v.f")
    .replace(/\bf \(\s*/g, "f(")
    .replace(/\bg \(\s*/g, "g(");
}

function InlineText({ text, problem }) {
  const normalized = normalizeMathText(text, problem);
  const token = /([A-Za-z])\^\(([^)]+)\)_\(([^)]+)\)|([A-Za-z])\^\(([^)]+)\)|([A-Za-z])\^([0-9])|([A-Za-z])_([A-Za-z0-9]+)|lg\^([0-9])|log_([0-9]+)|([A-Za-z])\(([^)]*)\)/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = token.exec(normalized)) !== null) {
    if (match.index > lastIndex) parts.push(normalized.slice(lastIndex, match.index));
    if (match[1]) {
      parts.push(<span key={parts.length} className="fn-inline-math">{match[1]}<sup>({match[2]})</sup><sub>{match[3]}</sub></span>);
    } else if (match[4]) {
      parts.push(<span key={parts.length} className="fn-inline-math">{match[4]}<sup>({match[5]})</sup></span>);
    } else if (match[6]) {
      parts.push(<span key={parts.length} className="fn-inline-math">{match[6]}<sup>{match[7]}</sup></span>);
    } else if (match[8]) {
      parts.push(<span key={parts.length} className="fn-inline-math">{match[8]}<sub>{match[9]}</sub></span>);
    } else if (match[10]) {
      parts.push(<span key={parts.length} className="fn-inline-math">lg<sup>{match[10]}</sup></span>);
    } else if (match[11]) {
      parts.push(<span key={parts.length} className="fn-inline-math">log<sub>{match[11]}</sub></span>);
    } else {
      parts.push(<span key={parts.length} className="fn-inline-math">{match[12]}({match[13]})</span>);
    }
    lastIndex = token.lastIndex;
  }
  if (lastIndex < normalized.length) parts.push(normalized.slice(lastIndex));
  return <>{parts}</>;
}

function VisualFrame({ title, children, narrow = false }) {
  return (
    <figure className={narrow ? "fn-exam-visual narrow" : "fn-exam-visual"}>
      <figcaption><Eyebrow>{title}</Eyebrow></figcaption>
      {children}
    </figure>
  );
}

function MatrixTable({ title, columns, rows, values }) {
  return (
    <div className="fn-matrix-wrap">
      <table className="fn-matrix">
        <caption>{title}</caption>
        <thead>
          <tr>
            <th aria-label="row" />
            {columns.map((column) => <th key={column}>{column}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={row}>
              <th>{row}</th>
              {values[rowIndex].map((value, columnIndex) => (
                <td key={`${row}-${columnIndex}`} className={value === "" ? "blank" : ""}>{value}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

let examGraphSequence = 0;

function ExamGraph({ title, nodes, edges, width = 520, height = 240, directed = true }) {
  const markerId = useMemo(() => `exam-arrow-${examGraphSequence += 1}`, []);
  const byId = nodes.reduce((acc, node) => {
    acc[node.id] = node;
    return acc;
  }, {});

  const isDirected = (edge) => directed && edge.directed !== false;

  const trimmedEndpoints = (edge) => {
    const from = byId[edge.from];
    const to = byId[edge.to];
    if (!from || !to) return null;

    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    const ux = dx / len;
    const uy = dy / len;
    const fromRadius = from.r || 16;
    const toRadius = to.r || 16;
    const startPad = Math.min(edge.startPad ?? fromRadius + 2, len / 3);
    const endPad = Math.min(edge.endPad ?? toRadius + (isDirected(edge) ? 7 : 2), len / 3);

    return {
      from,
      to,
      start: { x: from.x + ux * startPad, y: from.y + uy * startPad },
      end: { x: to.x - ux * endPad, y: to.y - uy * endPad },
    };
  };

  const edgePath = (edge) => {
    const from = byId[edge.from];
    const to = byId[edge.to];
    if (!from || !to) return "";
    if (edge.loop) {
      const nodeRadius = from.r || 16;
      const r = edge.loopRadius || 18;
      const y = from.y - nodeRadius - 4;
      return `M ${from.x - 8} ${y} C ${from.x - r} ${from.y - 48}, ${from.x + r} ${from.y - 48}, ${from.x + 8} ${y}`;
    }
    const trimmed = trimmedEndpoints(edge);
    if (!trimmed) return "";
    if (!edge.curve) return `M ${trimmed.start.x} ${trimmed.start.y} L ${trimmed.end.x} ${trimmed.end.y}`;
    const dx = trimmed.end.x - trimmed.start.x;
    const dy = trimmed.end.y - trimmed.start.y;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    const cx = (trimmed.start.x + trimmed.end.x) / 2 - (dy / len) * edge.curve;
    const cy = (trimmed.start.y + trimmed.end.y) / 2 + (dx / len) * edge.curve;
    return `M ${trimmed.start.x} ${trimmed.start.y} Q ${cx} ${cy} ${trimmed.end.x} ${trimmed.end.y}`;
  };

  const labelPoint = (edge) => {
    const from = byId[edge.from];
    const to = byId[edge.to];
    const offset = edge.labelOffset || [0, 0];
    if (!from || !to) return { x: 0, y: 0 };
    return { x: (from.x + to.x) / 2 + offset[0], y: (from.y + to.y) / 2 + offset[1] };
  };

  return (
    <VisualFrame title={title}>
      <svg className="fn-graph-svg" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={title}>
        <defs>
          <marker id={markerId} markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto" markerUnits="strokeWidth">
            <path d="M 0 0 L 8 4 L 0 8 z" />
          </marker>
        </defs>
        {edges.map((edge, index) => {
          const point = labelPoint(edge);
          return (
            <g key={`${edge.from}-${edge.to}-${index}`} className={edge.strong ? "strong" : ""}>
              <path
                d={edgePath(edge)}
                className={edge.dashed ? "dashed" : ""}
                markerEnd={isDirected(edge) ? `url(#${markerId})` : undefined}
              />
              {edge.label && <text x={point.x} y={point.y} className="edge-label">{edge.label}</text>}
            </g>
          );
        })}
        {edges.filter((edge) => edge.cutPath).map((edge, index) => (
          <path key={`cut-${index}`} d={edge.cutPath} className="cut-line" markerEnd={undefined} />
        ))}
        {nodes.map((node) => (
          <g key={node.id} className={node.highlight ? "node highlight" : "node"}>
            <circle cx={node.x} cy={node.y} r={node.r || 16} />
            <text x={node.x} y={node.y + 4}>{node.label || node.id}</text>
            {node.note && <text x={node.x} y={node.y + 32} className="node-note">{node.note}</text>}
          </g>
        ))}
      </svg>
    </VisualFrame>
  );
}

function MiniTree({ label, leaves }) {
  const positions = {
    root: [90, 18], left: [55, 62], right: [125, 62],
    leftLeft: [35, 106], leftRight: [75, 106], rightLeft: [105, 106], rightRight: [145, 106],
    deep: [125, 106], deepLeft: [105, 150], deepRight: [145, 150],
  };
  const edges = leaves.edges || [];
  const boxes = leaves.boxes || [];
  return (
    <svg className="fn-mini-tree" viewBox="0 0 180 180" role="img" aria-label={`Huffmantre ${label}`}>
      {edges.map(([from, to, bit], index) => (
        <g key={`${from}-${to}-${index}`}>
          <line x1={positions[from][0]} y1={positions[from][1] + 8} x2={positions[to][0]} y2={positions[to][1] - 10} />
          <text x={(positions[from][0] + positions[to][0]) / 2 - 7} y={(positions[from][1] + positions[to][1]) / 2}>{bit}</text>
        </g>
      ))}
      {["root", "left", "right", "deep"].filter((id) => leaves.nodes?.includes(id)).map((id) => (
        <circle key={id} cx={positions[id][0]} cy={positions[id][1]} r="8" />
      ))}
      {boxes.map(([id, text]) => (
        <g key={id}>
          <rect x={positions[id][0] - 14} y={positions[id][1] - 12} width="28" height="24" />
          <text x={positions[id][0]} y={positions[id][1] + 4}>{text}</text>
        </g>
      ))}
      <text className="tree-label" x="90" y="174">({label})</text>
    </svg>
  );
}

function ProcedurePairVisual() {
  const procedures = [
    { title: "Lurvik-Sort(A, n)", lines: ["Insertion-Sort(A, n)", "Merge-Sort(A, 1, n)"] },
    { title: "Smartnes-Sort(A, n)", lines: ["Merge-Sort(A, 1, n)", "Insertion-Sort(A, n)"] },
  ];
  return (
    <VisualFrame title="To sorteringsprosedyrer">
      <div className="fn-procedure-pair">
        {procedures.map((procedure) => (
          <div key={procedure.title} className="fn-procedure-box">
            <strong>{procedure.title}</strong>
            {procedure.lines.map((line, index) => (
              <div key={line} className="fn-procedure-line"><span>{index + 1}</span><code>{line}</code></div>
            ))}
          </div>
        ))}
      </div>
    </VisualFrame>
  );
}

function MatchingPreferenceTable() {
  const rows = [
    ["Lurvik", "Gløgsund", "Flinckenhagen", "Klokland", "Flinckenhagen"],
    ["Smartnes", "Gløgsund", "Klokland", "Flinckenhagen", "Gløgsund"],
    ["Visdal", "Klokland", "Flinckenhagen", "Gløgsund", "Klokland"],
    ["Gløgsund", "Lurvik", "Smartnes", "Visdal", "Smartnes"],
    ["Klokland", "Visdal", "Smartnes", "Lurvik", "Visdal"],
    ["Flinckenhagen", "Lurvik", "Smartnes", "Visdal", "Lurvik"],
  ];
  return (
    <VisualFrame title="Preferanser og oppgitt matching">
      <div className="fn-preference-wrap">
        <table className="fn-preference-table">
          <thead>
            <tr>
              <th>Person</th>
              <th>1. valg</th>
              <th>2. valg</th>
              <th>3. valg</th>
              <th>Matchet med</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={row[0]} className={index === 3 ? "group-start" : ""}>
                <th>{row[0]}</th>
                {row.slice(1).map((cell) => <td key={cell}>{cell}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </VisualFrame>
  );
}

function AlgorithmCodeVisual({ title, code }) {
  const CodeView = window.AlgViz.CodeView;
  return (
    <div className="fn-exam-code fn-leading-code">
      {CodeView
        ? <CodeView code={code} filename={title} language="pseudokode" />
        : <pre>{code}</pre>}
    </div>
  );
}

function FormulaVisual({ kind }) {
  if (kind === "lcs-formula-2025") {
    return (
      <VisualFrame title="Rekurrens med manglende ledd" narrow>
        <div className="fn-formula">
          <span className="lhs">c[i, j] =</span>
          <span className="brace">{`{`}</span>
          <div className="cases">
            <span>0</span><span>hvis i = 0 eller j = 0</span>
            <span className="redacted" aria-label="manglende ledd" />
            <span>hvis i, j &gt; 0 og x<sub>i</sub> = y<sub>j</sub></span>
            <span>max{`{c[i, j - 1], c[i - 1, j]}`}</span>
            <span>hvis i, j &gt; 0 og x<sub>i</sub> != y<sub>j</sub></span>
          </div>
        </div>
      </VisualFrame>
    );
  }
  if (kind === "residual-formula-2025") {
    return (
      <VisualFrame title="Restkapasitet med manglende ledd" narrow>
        <div className="fn-formula">
          <span className="lhs">c<sub>f</sub>(u, v) =</span>
          <span className="brace">{`{`}</span>
          <div className="cases">
            <span className="redacted" aria-label="manglende ledd" />
            <span>hvis (u, v) ∈ E</span>
            <span className="redacted short" aria-label="manglende ledd" />
            <span>hvis (v, u) ∈ E</span>
            <span>0</span><span>ellers</span>
          </div>
        </div>
      </VisualFrame>
    );
  }
  if (kind === "recurrence-2023-aug-12") {
    return (
      <VisualFrame title="Rekurrens" narrow>
        <div className="fn-formula single">T(n) = 2T(n/2) + n/lg n</div>
      </VisualFrame>
    );
  }
  if (kind === "sqrt-laws-2024-des") {
    return (
      <VisualFrame title="Oppgitte rotregler" narrow>
        <div className="fn-formula single">√x = x<sup>1/2</sup> og √xy = √x · √y</div>
      </VisualFrame>
    );
  }
  return null;
}

function ExamVisual({ kind }) {
  if (kind === "matching-preferences-2023-aug") return <MatchingPreferenceTable />;
  if (kind === "randomized-select-2022-des") {
    return <AlgorithmCodeVisual title="Algoritme 1 · Randomized-Select(A, p, r, i)" code={`if r <= p
  return A[p]
q = Randomized-Partition(A, p, r)
k = q - p + 1
if i == k
  return A[q]
elseif i < k
  Randomized-Select(A, p, q - 1, i)
  Randomized-Select(A, q + 1, r, i - k)`} />;
  }
  if (kind === "fung-sort-2023-aug") {
    return <AlgorithmCodeVisual title="Algoritme 1 · Fung-Sort(A, n)" code={`for i = 1 to n
  for j = 1 to n
    if A[i] < A[j]
      swap A[i] and A[j]`} />;
  }
  if (kind === "unzip-2024-aug") {
    return <AlgorithmCodeVisual title="Algoritme 1 · Unzip(x)" code={`if x == null
  let L, R be new lists
else allocate new nodes y and z
  y.key = x.key[1]
  z.key = x.key[2]
  L = Unzip(x.next)[1]
  R = Unzip(x.next)[2]
  List-Prepend(L, y)
  List-Prepend(R, z)
return <L, R>`} />;
  }
  if (kind === "bellman-queue-2024-des") {
    return <AlgorithmCodeVisual title="Algoritme 1 · Prioritetskø for avstandsestimater" code={`for each vertex u in G.V - {s}
  u.d = infinity
s.d = 0
Q = empty
Insert(Q, s)
while Q != empty
  u = Extract-Min(Q)
  for each vertex v in G.Adj[u]
    if v.d > u.d + w(u, v)
      v.d = u.d + w(u, v)
      if v is in Q
        Decrease-Key(Q, v, v.d)
      else Insert(Q, v)`} />;
  }
  if (kind === "too-tired-2025-aug") {
    return <AlgorithmCodeVisual title="Algoritme 1 · Too-Tired-For-This(X, n, k)" code={`for i = 2 to n
  y = X[i]
  j = i - 1
  while j > 0 and X[j] > y and j >= i - k
    X[j + 1] = X[j]
    j = j - 1
  X[j + 1] = y
  if j > 0 and X[j] > y
    return false
return true`} />;
  }
  if (kind === "sort-comparison-2023-aug") return <ProcedurePairVisual />;
  if (kind === "matrix-2022-w") {
    return (
      <VisualFrame title="Vektmatrise W" narrow>
        <MatrixTable title="W" columns={["1", "2", "3", "4"]} rows={["1", "2", "3", "4"]} values={[
          ["0", "8", "∞", "2"],
          ["1", "0", "5", "1"],
          ["7", "∞", "0", "1"],
          ["5", "8", "6", "0"],
        ]} />
      </VisualFrame>
    );
  }
  if (kind === "runtime-choices-2025") {
    return (
      <VisualFrame title="Mulige kjøretidsbeskrivelser" narrow>
        <ol className="fn-choice-list">
          <li>T(n) = O(n<sup>3</sup>)</li>
          <li>T(n) = Ω(n<sup>3</sup>)</li>
          <li>T(n) = Θ(n<sup>3</sup>)</li>
        </ol>
      </VisualFrame>
    );
  }
  if (kind === "disjoint-forest-2023") {
    return <ExamGraph title="Disjunkt-mengde-skog" width={520} height={260} nodes={[
      { id: "1", x: 190, y: 45 }, { id: "2", x: 350, y: 45 },
      { id: "3", x: 190, y: 95 }, { id: "4", x: 350, y: 95 },
      { id: "5", x: 145, y: 145 }, { id: "6", x: 235, y: 145 }, { id: "7", x: 315, y: 145 }, { id: "8", x: 385, y: 145 },
      { id: "9", x: 125, y: 200 }, { id: "10", x: 215, y: 200 }, { id: "11", x: 260, y: 200, highlight: true },
      { id: "12", x: 260, y: 245 },
    ]} edges={[
      { from: "1", to: "1", loop: true }, { from: "2", to: "2", loop: true },
      { from: "3", to: "1" }, { from: "5", to: "3" }, { from: "6", to: "3" }, { from: "9", to: "5" },
      { from: "10", to: "6" }, { from: "11", to: "6" }, { from: "12", to: "11" },
      { from: "4", to: "2" }, { from: "7", to: "4" }, { from: "8", to: "4" },
    ]} />;
  }
  if (kind === "flow-2023-des") {
    return <ExamGraph title="Flytnett, figur 2" width={560} height={300} nodes={[
      { id: "1", x: 95, y: 55 }, { id: "2", x: 280, y: 55 }, { id: "3", x: 465, y: 55 },
      { id: "4", label: "s=4", x: 95, y: 150 }, { id: "5", x: 280, y: 150 }, { id: "6", label: "6=t", x: 465, y: 150 },
      { id: "7", x: 95, y: 245 }, { id: "8", x: 280, y: 245 }, { id: "9", x: 465, y: 245 },
    ]} edges={[
      { from: "1", to: "2", label: "5/9", labelOffset: [0, -8] }, { from: "2", to: "3", label: "5/5", labelOffset: [0, -8] },
      { from: "4", to: "1", label: "7/7", labelOffset: [-18, 0] }, { from: "1", to: "5", label: "2/8", labelOffset: [0, -10] },
      { from: "3", to: "5", label: "2/9", labelOffset: [0, -10] }, { from: "3", to: "6", label: "3/6", labelOffset: [18, 0] },
      { from: "4", to: "5", label: "1/3", labelOffset: [0, -8] }, { from: "5", to: "6", label: "5/5", labelOffset: [0, -8] },
      { from: "4", to: "7", label: "2/5", labelOffset: [-18, 0] }, { from: "4", to: "8", label: "3/3", labelOffset: [0, 10] },
      { from: "8", to: "6", label: "2/2", labelOffset: [0, 8] }, { from: "6", to: "9", label: "3/7", labelOffset: [18, 0] },
      { from: "7", to: "8", label: "2/4", labelOffset: [0, 14] }, { from: "8", to: "9", label: "3/5", labelOffset: [0, 14] },
    ]} />;
  }
  if (kind === "adjacency-2024-aug") {
    return (
      <VisualFrame title="Graf og tom nabomatrise">
        <div className="fn-visual-split">
          <ExamGraph title="Graf til oppgave 10" width={360} height={230} directed={false} nodes={[
            { id: "1", x: 180, y: 45 }, { id: "2", x: 270, y: 100 }, { id: "3", x: 225, y: 180 },
            { id: "4", x: 135, y: 180 }, { id: "5", x: 90, y: 100 },
          ]} edges={[
            { from: "1", to: "2" }, { from: "1", to: "3" }, { from: "1", to: "4" }, { from: "1", to: "5" },
            { from: "2", to: "3" }, { from: "3", to: "4" }, { from: "4", to: "5" },
          ]} />
          <MatrixTable title="A" columns={["1", "2", "3", "4", "5"]} rows={["1", "2", "3", "4", "5"]} values={Array.from({ length: 5 }, () => Array.from({ length: 5 }, () => ""))} />
        </div>
      </VisualFrame>
    );
  }
  if (kind === "relax-graph-2024-aug") {
    return <ExamGraph title="Graf for én Relax-runde" width={560} height={150} nodes={[
      { id: "0", x: 55, y: 55, note: "d=1" }, { id: "1", x: 175, y: 55, note: "d=2" },
      { id: "3", x: 295, y: 55, note: "d=3" }, { id: "6", x: 415, y: 55, note: "d=4" },
      { id: "9", x: 535, y: 55, note: "d=5", highlight: true },
    ]} edges={[
      { from: "0", to: "1", label: "4" }, { from: "1", to: "3", label: "3" },
      { from: "3", to: "6", label: "2" }, { from: "6", to: "9", label: "1" },
    ]} />;
  }
  if (kind === "dfs-chain-2024-des") {
    return <ExamGraph title="Rettet graf for DFS" width={420} height={110} nodes={[
      { id: "x", x: 60, y: 55 }, { id: "y", x: 160, y: 55 }, { id: "z", x: 260, y: 55 }, { id: "w", x: 360, y: 55 },
    ]} edges={[{ from: "x", to: "y" }, { from: "y", to: "z" }, { from: "z", to: "w" }]} />;
  }
  if (kind === "residual-edge-2024-des") {
    return <ExamGraph title="Kant med flyt og kapasitet" width={260} height={90} nodes={[
      { id: "u", x: 55, y: 45 }, { id: "v", x: 205, y: 45 },
    ]} edges={[{ from: "v", to: "u", label: "3/5", labelOffset: [0, -10] }]} />;
  }
  if (kind === "huffman-2024-des") {
    return (
      <VisualFrame title="Huffmankandidater">
        <div className="fn-huffman-grid">
          <MiniTree label="1" leaves={{
            nodes: ["root", "left", "deep"],
            edges: [["root", "left", "0"], ["root", "right", "1"], ["left", "deep", "0"], ["left", "leftRight", "1"], ["deep", "deepLeft", "0"], ["deep", "deepRight", "1"]],
            boxes: [["right", "d"], ["leftRight", "c"], ["deepLeft", "a"], ["deepRight", "b"]],
          }} />
          <MiniTree label="2" leaves={{ nodes: ["root", "left", "right"], edges: [["root", "left", "0"], ["root", "right", "1"], ["left", "leftLeft", "0"], ["left", "leftRight", "1"], ["right", "rightLeft", "0"], ["right", "rightRight", "1"]], boxes: [["leftLeft", "a"], ["leftRight", "b"], ["rightLeft", "c"], ["rightRight", "d"]] }} />
          <MiniTree label="3" leaves={{ nodes: ["root", "right", "deep"], edges: [["root", "left", "0"], ["root", "right", "1"], ["right", "rightLeft", "0"], ["right", "deep", "1"], ["deep", "deepLeft", "0"], ["deep", "deepRight", "1"]], boxes: [["left", "a"], ["rightLeft", "b"], ["deepLeft", "c"], ["deepRight", "d"]] }} />
          <MiniTree label="4" leaves={{ nodes: ["root", "right", "deep"], edges: [["root", "left", "0"], ["root", "right", "1"], ["right", "deep", "0"], ["right", "rightRight", "1"], ["deep", "deepLeft", "0"], ["deep", "deepRight", "1"]], boxes: [["left", "a"], ["rightRight", "d"], ["deepLeft", "b"], ["deepRight", "c"]] }} />
          <MiniTree label="5" leaves={{ nodes: ["root", "left", "deep"], edges: [["root", "left", "0"], ["root", "right", "1"], ["left", "leftLeft", "0"], ["left", "deep", "1"], ["deep", "deepLeft", "0"], ["deep", "deepRight", "1"]], boxes: [["right", "d"], ["leftLeft", "a"], ["deepLeft", "b"], ["deepRight", "c"]] }} />
        </div>
      </VisualFrame>
    );
  }
  if (kind === "mst-cut-2024-des") {
    const nodes = [
      [115, 130], [175, 70], [175, 190],
      [255, 130], [330, 70], [330, 190],
      [450, 70], [450, 190], [520, 130],
    ];
    const edges = [
      [0, 1], [0, 2], [1, 2], [1, 4],
      [2, 3], [2, 5], [3, 4], [3, 5],
      [4, 6], [4, 7], [5, 7], [6, 7], [6, 8], [7, 8],
    ];
    const aEdges = [[2, 5], [6, 8]];
    const aNodes = new Set(aEdges.flat());
    return (
      <VisualFrame title="Snitt og foreløpig kantmengde A">
        <svg className="fn-graph-svg mst-cut-svg" viewBox="0 0 620 250" role="img" aria-label="Snitt og foreløpig kantmengde A">
          <line x1="48" y1="36" x2="92" y2="36" className="mst-a-edge" />
          <line x1="48" y1="36" x2="92" y2="36" />
          <text x="124" y="41" className="edge-label">= A</text>
          <path className="cut-line" d="M 55 130 C 110 123, 128 170, 170 166 S 220 108, 260 68 S 330 18, 377 58 S 425 126, 466 166 S 510 121, 575 130" />
          <text x="572" y="83" className="edge-label">↑ S</text>
          <text x="570" y="142" className="edge-label">↓ V - S</text>
          {aEdges.map(([a, b]) => (
            <line key={`a-${a}-${b}`} x1={nodes[a][0]} y1={nodes[a][1]} x2={nodes[b][0]} y2={nodes[b][1]} className="mst-a-edge" />
          ))}
          {edges.map(([a, b]) => (
            <line key={`${a}-${b}`} x1={nodes[a][0]} y1={nodes[a][1]} x2={nodes[b][0]} y2={nodes[b][1]} />
          ))}
          {nodes.map(([x, y], index) => (
            <g key={index} className="node">
              {aNodes.has(index) && <circle cx={x} cy={y} r="22" className="mst-a-node" />}
              <circle cx={x} cy={y} r="15" />
            </g>
          ))}
        </svg>
      </VisualFrame>
    );
  }
  if (kind === "apsp-2024-des") {
    return (
      <VisualFrame title="W og L(2)">
        <div className="fn-visual-split">
          <MatrixTable title="W" columns={["1", "2", "3", "4", "5"]} rows={["1", "2", "3", "4", "5"]} values={[
            ["0", "1", "∞", "∞", "7"], ["∞", "0", "1", "3", "5"], ["∞", "∞", "0", "1", "∞"], ["∞", "∞", "∞", "0", "1"], ["∞", "∞", "∞", "∞", "0"],
          ]} />
          <MatrixTable title="L(2)" columns={["1", "2", "3", "4", "5"]} rows={["1", "2", "3", "4", "5"]} values={[
            ["0", "1", "2", "4", "6"], ["∞", "0", "1", "2", "4"], ["∞", "∞", "0", "1", "2"], ["∞", "∞", "∞", "0", "1"], ["∞", "∞", "∞", "∞", "0"],
          ]} />
        </div>
      </VisualFrame>
    );
  }
  if (kind === "array-tree-2024-des") {
    return <ExamGraph title="Perfekt binært søketre lagret nivåvis nedenfra" width={620} height={245} directed={false} nodes={[
      { id: "a15", x: 310, y: 32 }, { id: "a13", x: 190, y: 92 }, { id: "a14", x: 430, y: 92 },
      { id: "a9", x: 90, y: 155 }, { id: "a10", x: 210, y: 155 }, { id: "a11", x: 410, y: 155 }, { id: "a12", x: 530, y: 155 },
      { id: "a1", x: 45, y: 220 }, { id: "a2", x: 110, y: 220 }, { id: "a3", x: 175, y: 220 }, { id: "a4", x: 240, y: 220 },
      { id: "a5", x: 375, y: 220 }, { id: "a6", x: 440, y: 220 }, { id: "a7", x: 505, y: 220 }, { id: "a8", x: 570, y: 220 },
    ]} edges={[
      { from: "a15", to: "a13" }, { from: "a15", to: "a14" }, { from: "a13", to: "a9" }, { from: "a13", to: "a10" },
      { from: "a14", to: "a11" }, { from: "a14", to: "a12" }, { from: "a9", to: "a1" }, { from: "a9", to: "a2" },
      { from: "a10", to: "a3" }, { from: "a10", to: "a4" }, { from: "a11", to: "a5" }, { from: "a11", to: "a6" },
      { from: "a12", to: "a7" }, { from: "a12", to: "a8" },
    ]} />;
  }
  if (kind === "stable-matching-2024-des") {
    return (
      <VisualFrame title="Stabil og ustabil matching">
        <div className="fn-matching-visual">
          {["stabil", "ustabil"].map((label) => (
            <svg key={label} viewBox="0 0 230 190" role="img" aria-label={label}>
              <text x="115" y="182" className="caption">{label}</text>
              {[35, 75, 115, 155].map((y, i) => (
                <g key={`${label}-${i}`}>
                  <circle cx="55" cy={y} r="12" />
                  <circle cx="175" cy={y} r="12" />
                </g>
              ))}
              <path className="match" d={label === "stabil" ? "M55 35 L175 75 M55 75 L175 115 M55 115 L175 155" : "M55 35 L175 35 M55 75 L175 115 M55 115 L175 75 M55 155 L175 155"} />
              {label === "ustabil" && <>
                <path className="blocking" d="M55 75 L175 75" />
                <text x="47" y="80">w</text><text x="169" y="80">m</text>
                <text x="145" y="62" className="small">blokkerende</text><text x="145" y="78" className="small">par</text>
              </>}
            </svg>
          ))}
        </div>
      </VisualFrame>
    );
  }
  if (kind === "dag-2025-des") {
    return <ExamGraph title="Vektet rettet graf, figur 1" width={520} height={180} nodes={[
      { id: "1", x: 55, y: 120 }, { id: "2", x: 175, y: 55 }, { id: "3", x: 275, y: 120 }, { id: "4", x: 380, y: 55 }, { id: "5", x: 485, y: 120 },
    ]} edges={[
      { from: "1", to: "2", label: "3" }, { from: "1", to: "3", label: "5" }, { from: "2", to: "3", label: "4" },
      { from: "2", to: "4", label: "2" }, { from: "3", to: "4", label: "7" }, { from: "3", to: "5", label: "1" }, { from: "4", to: "5", label: "6" },
    ]} />;
  }
  if (kind === "flow-2025-des") {
    return <ExamGraph title="Flytnett med flyt, figur 2" width={620} height={310} nodes={[
      { id: "s", x: 45, y: 155 }, { id: "1", x: 150, y: 55 }, { id: "2", x: 150, y: 125 }, { id: "3", x: 150, y: 195 }, { id: "4", x: 150, y: 265 },
      { id: "5", x: 360, y: 55 }, { id: "6", x: 360, y: 125 }, { id: "7", x: 360, y: 195 }, { id: "8", x: 360, y: 265 }, { id: "t", x: 575, y: 155 },
    ]} edges={[
      { from: "s", to: "1", label: "2/2" }, { from: "s", to: "2", label: "0/2" }, { from: "s", to: "3", label: "1/1" }, { from: "s", to: "4", label: "1/1" },
      { from: "1", to: "5", label: "2/2" }, { from: "5", to: "2", label: "1/1" }, { from: "5", to: "t", label: "1/2" },
      { from: "2", to: "6", label: "1/3" }, { from: "6", to: "3", label: "0/2" }, { from: "6", to: "t", label: "1/1" },
      { from: "3", to: "7", label: "1/3" }, { from: "7", to: "4", label: "0/2" }, { from: "7", to: "t", label: "1/2" },
      { from: "4", to: "8", label: "1/3" }, { from: "8", to: "t", label: "1/3" },
    ]} />;
  }
  if (kind === "k33-2025-des") {
    const left = ["1", "3", "5"];
    const right = ["2", "4", "6"];
    return <ExamGraph title="K3,3" width={260} height={230} directed={false} nodes={[
      { id: "1", x: 70, y: 45 }, { id: "3", x: 70, y: 115 }, { id: "5", x: 70, y: 185 },
      { id: "2", x: 190, y: 45 }, { id: "4", x: 190, y: 115 }, { id: "6", x: 190, y: 185 },
    ]} edges={left.flatMap((from) => right.map((to) => ({ from, to })))} />;
  }
  return <FormulaVisual kind={kind} />;
}

function EquationBlockVisual({ block, problem }) {
  const rawLines = (block.lines || [])
    .map((line) => line.replace(/\u0001/g, "").trimEnd())
    .filter((line) => line.trim() && !/^Figur\s+\d+$/i.test(line.trim()));
  const title = block.title || (rawLines.some((line) => /=|T\(|Θ|Ω|O\(/.test(line)) ? "Utregning" : (block.label || "Figur"));

  return (
    <VisualFrame title={title}>
      <div className="fn-equation-block">
        {rawLines.map((line, index) => (
          <div key={index} className={/^\s*\.\.?$/.test(line.trim()) ? "dots" : ""}>
            <InlineText text={line.trimStart().replace(/^\.\.$/, "⋮").replace(/^\.$/, "⋮")} problem={problem} />
          </div>
        ))}
      </div>
    </VisualFrame>
  );
}

function normalizeExamBlocks(content) {
  if (Array.isArray(content)) return content;
  return content ? [{ type: "text", text: String(content) }] : [];
}

const learningGoalPattern = /\bRelevante?\s+læringsmål:\s*/i;

function goalTextIsComplete(text) {
  const trimmed = String(text || "").trim();
  return Boolean(trimmed) && /[.!?)]$/.test(trimmed) && !/[-‐‑‒–—]$/.test(trimmed);
}

function likelyLearningGoalContinuation(text, previous) {
  const trimmed = String(text || "").trim();
  if (!trimmed) return true;
  if (/[-‐‑‒–—]$/.test(String(previous || "").trim())) return true;
  return /^[a-zæøå]/.test(trimmed);
}

function appendLearningGoal(goals, text) {
  const next = String(text || "").trim();
  if (!next) return;
  const last = goals[goals.length - 1] || "";
  if (last && /[-‐‑‒–—]$/.test(last.trim())) {
    goals[goals.length - 1] = last.trim().replace(/[-‐‑‒–—]$/, "") + next;
  } else if (last) {
    goals[goals.length - 1] = `${last.trim()} ${next}`;
  } else {
    goals.push(next);
  }
}

function startLearningGoal(goals, text) {
  const next = String(text || "").trim();
  if (next) goals.push(next);
}

function cleanLearningGoal(text) {
  return String(text || "")
    .replace(/\s+/g, " ")
    .replace(/\s+([.,;:!?])/g, "$1")
    .trim();
}

function splitLearningGoalItems(goals) {
  return goals
    .map(cleanLearningGoal)
    .filter(Boolean)
    .flatMap((goal) => goal.replace(/\.$/, "").split(/\s*;\s*/))
    .map((goal) => goal.trim())
    .filter(Boolean);
}

function splitSolutionLearningGoals(content) {
  const blocks = normalizeExamBlocks(content);
  const solution = [];
  const learningGoals = [];
  let needsContinuation = false;

  blocks.forEach((block) => {
    if ((block.type === "text" || block.type === "paragraph") && needsContinuation) {
      if (likelyLearningGoalContinuation(block.text, learningGoals[learningGoals.length - 1])) {
        appendLearningGoal(learningGoals, block.text);
        needsContinuation = !goalTextIsComplete(learningGoals[learningGoals.length - 1]);
        return;
      }
      needsContinuation = false;
    }

    if (block.type === "text" || block.type === "paragraph") {
      const text = String(block.text || "");
      const match = learningGoalPattern.exec(text);
      if (!match) {
        solution.push(block);
        return;
      }

      const before = text.slice(0, match.index).trim();
      const goal = text.slice(match.index + match[0].length).trim();
      if (before) solution.push({ ...block, text: before });
      startLearningGoal(learningGoals, goal);
      needsContinuation = !goalTextIsComplete(goal);
      return;
    }

    if (block.type === "equation") {
      const lines = block.lines || [];
      const labelIndex = lines.findIndex((line) => learningGoalPattern.test(line));
      if (labelIndex === -1) {
        solution.push(block);
        return;
      }

      const labelLine = lines[labelIndex];
      const match = learningGoalPattern.exec(labelLine);
      const beforeLabel = labelLine.slice(0, match.index).trimEnd();
      const beforeLines = lines.slice(0, labelIndex);
      if (beforeLabel) beforeLines.push(beforeLabel);
      if (beforeLines.length) solution.push({ ...block, lines: beforeLines });

      const goal = [labelLine.slice(match.index + match[0].length), ...lines.slice(labelIndex + 1)].join(" ").trim();
      startLearningGoal(learningGoals, goal);
      needsContinuation = !goalTextIsComplete(goal);
      return;
    }

    solution.push(block);
  });

  return {
    solution,
    learningGoals: splitLearningGoalItems(learningGoals),
  };
}

function LearningGoalsSection({ goals, problem }) {
  if (!goals.length) return null;
  return (
    <section className="fn-exam-learning-goals">
      <Eyebrow>Relevante læringsmål</Eyebrow>
      <ul>
        {goals.map((goal, index) => (
          <li key={`${goal}-${index}`}><InlineText text={goal} problem={problem} /></li>
        ))}
      </ul>
    </section>
  );
}

function FormattedExamText({ text, problem, className }) {
  const blocks = useMemo(() => normalizeExamBlocks(text), [text]);
  const CodeView = window.AlgViz.CodeView;

  return (
    <div className={className}>
      {blocks.map((block, index) => {
        if (block.type === "text" || block.type === "paragraph") {
          return <p key={index} className="serif"><InlineText text={block.text} problem={problem} /></p>;
        }
        if (block.type === "list") {
          const Tag = block.ordered ? "ol" : "ul";
          return <Tag key={index} className="fn-exam-bullets">{block.items.map((item, itemIndex) => <li key={itemIndex}><InlineText text={item} problem={problem} /></li>)}</Tag>;
        }
        if (block.type === "code") {
          return (
            <div key={index} className="fn-exam-code">
              {CodeView
                ? <CodeView code={block.code || " "} filename={block.title || `oppgave-${problem.number}.txt`} language="pseudokode" startLine={block.startLine || 1} />
                : <pre>{block.code}</pre>}
            </div>
          );
        }
        if (block.type === "visual") return <ExamVisual key={index} kind={block.kind} />;
        if (block.type === "equation") return <EquationBlockVisual key={index} block={block} problem={problem} />;
        return <EquationBlockVisual key={index} block={block} problem={problem} />;
      })}
    </div>
  );
}

function prepFor(problem, course, algorithms) {
  const haystack = problemText(problem);
  const lectureIds = [];
  const conceptIds = [];
  const algorithmIds = [];
  const terms = [];

  topicRules.forEach((rule) => {
    if (!rule.rx.test(haystack)) return;
    addUnique(lectureIds, rule.lectureIds);
    addUnique(conceptIds, rule.conceptIds);
    addUnique(algorithmIds, rule.algorithmIds);
    addTerm(terms, rule.terms);
  });

  conceptIds.forEach((id) => {
    addUnique(lectureIds, course.byId.glossary[id]?.lectureIds);
  });
  if (lectureIds.length === 0) lectureIds.push("l01");

  const algoById = algorithms.reduce((acc, item) => {
    acc[item.id] = item;
    return acc;
  }, {});

  const lectures = lectureIds
    .map((id) => course.byId.lectures[id])
    .filter(Boolean)
    .sort((a, b) => a.number - b.number);
  const concepts = conceptIds
    .map((id) => course.byId.glossary[id])
    .filter(Boolean);
  const linkedAlgorithms = algorithmIds
    .map((id) => algoById[id])
    .filter(Boolean);

  return { lectures, concepts, terms, linkedAlgorithms };
}

function ExamIndex({ exams, selectedId, lang }) {
  const totalTasks = exams.reduce((sum, exam) => sum + exam.tasks.length, 0);
  return (
    <aside className="fn-exam-index">
      <div className="fn-index-head">
        <Eyebrow>{txt({ no: "Eksamener", en: "Exams" }, lang)}</Eyebrow>
        <MonoMeta>
          {totalTasks} {txt({ no: "oppg.", en: "problems" }, lang)}
        </MonoMeta>
      </div>
      <label className="fn-index-select">
        <span className="eyebrow">{txt({ no: "Eksamen", en: "Exam" }, lang)}</span>
        <select value={selectedId} onChange={(e) => go("exam", e.target.value)}>
          <option value="all">
            {txt({ no: "Hele banken", en: "Full bank" }, lang)} · {totalTasks}
          </option>
          {exams.map((exam) => (
            <option key={exam.id} value={exam.id}>
              {exam.term} · {exam.tasks.length} {txt({ no: "oppg.", en: "problems" }, lang)}
            </option>
          ))}
        </select>
      </label>
      <ol className="fn-index-list">
        <li>
          <button
            className={selectedId === "all" ? "fn-index-row active" : "fn-index-row"}
            onClick={() => go("exam", "all")}
          >
            <span className="fn-index-no serif">∑</span>
            <span className="fn-index-text">
              <strong>{txt({ no: "Hele banken", en: "Full bank" }, lang)}</strong>
              <small className="mono">
                {totalTasks} {txt({ no: "oppgaver", en: "problems" }, lang)}
              </small>
            </span>
            <span className={selectedId === "all" ? "fn-mark done" : "fn-mark"} aria-hidden="true" />
          </button>
        </li>
        {exams.map((exam) => (
          <li key={exam.id}>
            <button
              className={exam.id === selectedId ? "fn-index-row active" : "fn-index-row"}
              onClick={() => go("exam", exam.id)}
            >
              <span className="fn-index-no serif">{exam.term.split(" ")[0].slice(2)}</span>
              <span className="fn-index-text">
                <strong>{exam.title}</strong>
                <small className="mono">
                  {exam.tasks.length} {txt({ no: "oppgaver", en: "problems" }, lang)} · {exam.term}
                </small>
              </span>
              <span className={exam.id === selectedId ? "fn-mark done" : "fn-mark"} aria-hidden="true" />
            </button>
          </li>
        ))}
      </ol>
    </aside>
  );
}

function PrepLinks({ prep, exam, problem, lang }) {
  return (
    <div className="fn-exam-prep">
      <div className="fn-exam-link-row">
        <a className="fn-btn ghost" href={linkTo(exam.solutionPdf, problem.solutionPage)} target="_blank" rel="noreferrer">
          {txt({ no: "Åpne løsnings-PDF", en: "Open solution PDF" }, lang)}
        </a>
      </div>

      <div className="fn-exam-prep-grid">
        <div>
          <Eyebrow>{txt({ no: "Forelesninger", en: "Lectures" }, lang)}</Eyebrow>
          <div className="fn-chip-list">
            {prep.lectures.map((lecture) => (
              <button key={lecture.id} className="fn-chip action" onClick={() => go("study", lecture.id)}>
                L{String(lecture.number).padStart(2, "0")} · {txt(lecture.title, lang)}
              </button>
            ))}
          </div>
        </div>

        <div>
          <Eyebrow>{txt({ no: "Begreper", en: "Terms" }, lang)}</Eyebrow>
          <div className="fn-exam-terms">
            {prep.concepts.map((concept) => (
              <article key={concept.id} className="fn-exam-term">
                <strong className="serif">{txt(concept.term, lang)}</strong>
                <span className="mono">{concept.english}</span>
                <p className="serif fn-italic">{txt(concept.explanation, lang)}</p>
              </article>
            ))}
            {prep.terms.map((term) => (
              <article key={`${term.no}-${term.en}`} className="fn-exam-term compact">
                <strong className="serif">{txt(term, lang)}</strong>
              </article>
            ))}
            {prep.concepts.length === 0 && prep.terms.length === 0 && (
              <p className="serif fn-italic fn-muted">
                {txt({ no: "Ingen begreper koblet automatisk.", en: "No terms linked automatically." }, lang)}
              </p>
            )}
          </div>
        </div>

        <div>
          <Eyebrow>{txt({ no: "Visualiseringer", en: "Visualizations" }, lang)}</Eyebrow>
          <div className="fn-chip-list">
            {prep.linkedAlgorithms.map((algorithm) => (
              <button key={algorithm.id} className="fn-chip action" onClick={() => go("visualizer", algorithm.id)}>
                {algorithm.name}
              </button>
            ))}
            {prep.linkedAlgorithms.length === 0 && (
              <p className="serif fn-italic fn-muted">
                {txt({ no: "Ingen direkte visualisering koblet.", en: "No direct visualization linked." }, lang)}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function PdfIconButton({ href, label }) {
  return (
    <a className="fn-icon-btn" href={href} target="_blank" rel="noreferrer" aria-label={label} title={label}>
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M6 3h8l4 4v14H6z" />
        <path d="M14 3v5h5" />
        <path d="M8.8 15h6.4" />
        <path d="M8.8 18h4.6" />
      </svg>
    </a>
  );
}

function ProblemCard({ exam, problem, category, course, algorithms, lang, open, done, onToggle, onDoneToggle }) {
  const prep = useMemo(
    () => prepFor(problem, course, algorithms),
    [problem, course, algorithms]
  );
  const solutionParts = useMemo(
    () => splitSolutionLearningGoals(problem.solution),
    [problem.solution]
  );
  const fallbackSolution = txt({ no: "Se løsnings-PDF for denne oppgaven.", en: "See the solution PDF for this problem." }, lang);
  const solutionText = problem.solution ? solutionParts.solution : fallbackSolution;

  return (
    <article className={`fn-exam-card${open ? " open" : ""}${done ? " done" : ""}`}>
      <header className="fn-exam-card-head">
        <div>
          <Eyebrow>{categoryLabel(category, lang)}</Eyebrow>
          <h3 className="serif">
            {txt({ no: "Oppgave", en: "Problem" }, lang)} {String(problem.number).padStart(2, "0")}
          </h3>
          <MonoMeta>{exam.term}</MonoMeta>
        </div>
        <div className="fn-exam-card-actions">
          <PdfIconButton
            href={linkTo(exam.problemPdf, problem.problemPage)}
            label={txt({ no: "Åpne oppgave-PDF", en: "Open problem PDF" }, lang)}
          />
          <button
            className={done ? "fn-btn ghost" : "fn-btn primary"}
            onClick={onDoneToggle}
            aria-pressed={done}
          >
            {done
              ? txt({ no: "Markert ferdig ✓", en: "Marked complete ✓" }, lang)
              : txt({ no: "Marker ferdig", en: "Mark done" }, lang)}
          </button>
        </div>
      </header>

      <FormattedExamText
        text={problem.prompt}
        problem={problem}
        className="fn-exam-prompt"
      />

      {open && (
        <div className="fn-exam-solution">
          <div className="fn-exam-solution-head">
            <Eyebrow>{txt({ no: "Løsningsforslag", en: "Solution" }, lang)}</Eyebrow>
            <MonoMeta>{exam.term} · p. {problem.solutionPage}</MonoMeta>
          </div>
          {(solutionParts.solution.length > 0 || !problem.solution) && (
            <FormattedExamText
              text={solutionText}
              problem={problem}
              className="fn-exam-solution-text"
            />
          )}
          <LearningGoalsSection goals={solutionParts.learningGoals} problem={problem} />
          <PrepLinks prep={prep} exam={exam} problem={problem} lang={lang} />
        </div>
      )}
      <footer className="fn-exam-card-foot">
        <button className={open ? "fn-btn ghost" : "fn-btn ghost"} onClick={onToggle} aria-expanded={open}>
          {open
            ? txt({ no: "Skjul løsning", en: "Hide solution" }, lang)
            : txt({ no: "Vis løsning", en: "Show solution" }, lang)}
        </button>
      </footer>
    </article>
  );
}

function ExamView({ course, algorithms, lang, selectedExamId, examDoneSet, onExamTaskComplete }) {
  const exams = window.AlgViz.EXAMS || [];
  const selectedId = exams.some((exam) => exam.id === selectedExamId) ? selectedExamId : "all";
  const selectedExam = exams.find((exam) => exam.id === selectedId);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [sortOrder, setSortOrder] = useState("source");
  const [openIds, setOpenIds] = useState([]);

  const bankItems = useMemo(() => exams.flatMap((exam) =>
    exam.tasks.map((problem) => ({
      exam,
      problem,
      category: categoryFor(problem),
    }))
  ), [exams]);

  const scopedItems = useMemo(() => (
    selectedId === "all"
      ? bankItems
      : bankItems.filter((item) => item.exam.id === selectedId)
  ), [bankItems, selectedId]);

  const visibleItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = scopedItems.filter(({ problem, category: itemCategory }) => {
      const matchCategory = category === "all" || itemCategory === category;
      const matchQuery = !q || `${problem.number} ${problemText(problem)}`.toLowerCase().includes(q);
      return matchCategory && matchQuery;
    });

    return [...filtered].sort((a, b) => {
      if (sortOrder === "category") {
        const categoryCompare = categoryLabel(a.category, lang).localeCompare(categoryLabel(b.category, lang), lang);
        if (categoryCompare) return categoryCompare;
      }
      if (sortOrder === "number") {
        const numberCompare = a.problem.number - b.problem.number;
        if (numberCompare) return numberCompare;
      }
      const examCompare = exams.findIndex((exam) => exam.id === a.exam.id) - exams.findIndex((exam) => exam.id === b.exam.id);
      return examCompare || (a.problem.number - b.problem.number);
    });
  }, [category, exams, lang, query, scopedItems, sortOrder]);

  if (exams.length === 0) {
    return (
      <main className="fn-exam">
        <Section eyebrow="§ — Eksamen" title="Ingen eksamensdata funnet" />
      </main>
    );
  }

  const toggle = (id) => {
    setOpenIds((ids) => ids.includes(id) ? ids.filter((it) => it !== id) : [...ids, id]);
  };

  return (
    <main className="fn-exam">
      <ExamIndex exams={exams} selectedId={selectedId} lang={lang} />

      <article className="fn-exam-main">
        <Section
          eyebrow={txt({ no: "§ — Eksamenstrening", en: "§ — Exam practice" }, lang)}
          title={selectedId === "all" ? txt({ no: "Hele oppgavebanken", en: "Full problem bank" }, lang) : selectedExam.title}
          italic={txt({
            no: "Oppgavene kan filtreres på kategori på tvers av hele eksamensbanken.",
            en: "Problems can be filtered by category across the full exam bank.",
          }, lang)}
          actions={(
            <div className="fn-exam-controls">
              <div className="fn-search compact">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={txt({ no: "Søk i oppgaver", en: "Search problems" }, lang)}
                />
              </div>
              <label className="fn-exam-select">
                <span className="eyebrow">{txt({ no: "Kategori", en: "Category" }, lang)}</span>
                <select value={category} onChange={(e) => setCategory(e.target.value)}>
                  {categories.map((item) => (
                    <option key={item.id} value={item.id}>{txt(item.label, lang)}</option>
                  ))}
                </select>
              </label>
              <label className="fn-exam-select">
                <span className="eyebrow">{txt({ no: "Sorter", en: "Sort" }, lang)}</span>
                <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                  <option value="source">{txt({ no: "Eksamen", en: "Exam" }, lang)}</option>
                  <option value="category">{txt({ no: "Kategori", en: "Category" }, lang)}</option>
                  <option value="number">{txt({ no: "Oppgavenr.", en: "Problem no." }, lang)}</option>
                </select>
              </label>
            </div>
          )}
        >
          <div className="fn-exam-strip">
            <Eyebrow>
              {selectedId === "all" ? txt({ no: "Bank", en: "Bank" }, lang) : selectedExam.term}
              {category !== "all" ? ` · ${categoryLabel(category, lang)}` : ""}
            </Eyebrow>
            <MonoMeta>
              {visibleItems.length}/{scopedItems.length} {txt({ no: "oppgaver", en: "problems" }, lang)}
              {" · "}
              {openIds.filter((id) => scopedItems.some((item) => item.problem.id === id)).length} {txt({ no: "åpne løsninger", en: "open solutions" }, lang)}
            </MonoMeta>
          </div>
          <div className="fn-exam-list">
            {visibleItems.map(({ exam, problem, category: itemCategory }) => (
              <ProblemCard
                key={problem.id}
                exam={exam}
                problem={problem}
                category={itemCategory}
                course={course}
                algorithms={algorithms}
                lang={lang}
                open={openIds.includes(problem.id)}
                done={examDoneSet?.has(problem.id)}
                onToggle={() => toggle(problem.id)}
                onDoneToggle={() => onExamTaskComplete?.(problem.id)}
              />
            ))}
            {visibleItems.length === 0 && (
              <p className="serif fn-italic fn-muted fn-exam-empty">
                {txt({ no: "Ingen oppgaver matcher søket.", en: "No problems match the search." }, lang)}
              </p>
            )}
          </div>
        </Section>
      </article>
    </main>
  );
}

Object.assign(window.AlgViz, { ExamView });
})();
