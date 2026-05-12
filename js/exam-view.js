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

function categoryFor(problem) {
  const haystack = `${problem.title}\n${problem.prompt}\n${problem.solution}`;
  return categoryRules.find((rule) => rule.rx.test(haystack))?.id || "other";
}

function categoryLabel(categoryId, lang) {
  return txt(categories.find((item) => item.id === categoryId)?.label || categories[0].label, lang);
}

function cleanExamLine(line, index = -1) {
  let next = String(line || "").replace(/\t/g, "  ").replace(/\s+$/g, "");
  if (index === 0) {
    next = next
      .replace(/^\s*\d+\s*%\s*\d+\s*/, "")
      .replace(/^\s*\d+\s*%\s*/, "")
      .replace(/^\s*\d{1,2}\s+/, "");
  }
  return next;
}

function compareLine(line) {
  return cleanExamLine(line)
    .replace(/^\s*\d{1,2}\s+/, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function stripPromptFromSolution(solution, prompt) {
  const promptLines = new Set(
    String(prompt || "")
      .split("\n")
      .map(compareLine)
      .filter((line) => line.length > 2)
  );
  const output = [];
  let started = false;

  String(solution || "").split("\n").forEach((line, index) => {
    const normalized = compareLine(line);
    const promptLike = promptLines.has(normalized);
    const boilerplate = index === 0 && /^\s*(?:\d+\s*%\s*)?\d{1,2}\s+/.test(line);

    if (!started && (!normalized || promptLike || boilerplate)) return;
    if (started && promptLike) return;
    started = true;
    output.push(line);
  });

  const stripped = output.join("\n").trim();
  return stripped || solution;
}

function isAlgorithmHeader(line) {
  return /^\s*Algoritme\s+\d+/i.test(line);
}

function isFigureHeader(line) {
  return /^\s*(Figur|Figure)\s+\d+\s*$/i.test(line);
}

function isCallSignature(line) {
  const trimmed = line.trim();
  return /^[A-ZÆØÅA-Za-z_][A-Za-zÆØÅæøå0-9_-]+\([^)]*\)\s*$/.test(trimmed);
}

function isCodeLine(line) {
  const trimmed = line.trim();
  if (!/^\d+\s+/.test(trimmed)) return false;
  if (/^\d+\.\s+/.test(trimmed)) return false;
  if (/^\d+\s+\.\s*\./.test(trimmed)) return false;
  return /(for|if|else|elseif|return|while|let|allocate|swap|insert|decrease|enqueue|dequeue|list-prepend|randomized|partition|untitled|permutations|counting|relax|extract|min|main|init|reverse|unzip|too-tired|fung-sort|[A-ZÆØÅ][A-Za-zÆØÅæøå-]+\(|Q\.|[A-Z]\[|[a-z]\.[a-z]|[a-z]\s*=)/i.test(trimmed);
}

function stripCodeLine(line) {
  const numbered = line.match(/^\s*\d+\s?(.*)$/);
  return (numbered ? numbered[1] : line.trimStart()).replace(/\s+$/g, "");
}

function codeContent(line) {
  if (isCallSignature(line)) return line.trim();
  const content = stripCodeLine(line);
  if (/^=\s*A\[/i.test(content.trim())) return `▮▮▮ ${content.trim()}`;
  return content;
}

function codeLineNumber(line) {
  const match = line.trim().match(/^(\d+)\s+/);
  return match ? Number(match[1]) : null;
}

function normalizeCodeBlock(lines) {
  const trimmed = lines.map((line) => String(line || "").replace(/\s+$/g, ""));
  const indents = trimmed
    .filter((line) => line.trim())
    .map((line) => (line.match(/^\s*/) || [""])[0].length);
  const minIndent = indents.length ? Math.min(...indents) : 0;

  return trimmed.map((line) => {
    const shifted = line.slice(Math.min(minIndent, (line.match(/^\s*/) || [""])[0].length));
    const leading = (shifted.match(/^\s*/) || [""])[0].length;
    if (leading < 4) return shifted;
    return `${" ".repeat(Math.round(leading / 5) * 2)}${shifted.trimStart()}`;
  }).join("\n").trimEnd();
}

function isDenseArtifactLine(line) {
  const trimmed = line.trim();
  if (!trimmed) return false;
  const letters = (trimmed.match(/[A-Za-zÆØÅæøå]/g) || []).length;
  const symbols = (trimmed.match(/[0-9∞→←↑↓/\\|=(){}[\],.:;+\-*⟨⟩]/g) || []).length;
  const leading = (line.match(/^\s*/) || [""])[0].length;
  return leading >= 10 && letters <= 8 && (symbols >= 4 || /^\d+(?:\s+\d+)+$/.test(trimmed));
}

function isCodeContinuation(line) {
  const trimmed = line.trim();
  if (/^(Oppgi|Forklar|Hva|Hvordan|Hvorfor|Hvilk|Du|Det|Her|Merk|Anta|Som|I|Om|Hvis|Dersom)\b/i.test(trimmed)) return false;
  return /^\s{8,}\S/.test(line) && /(=|return|if|else|for|while|\(|\)|\[|\]|∅|∞|\/\/)/i.test(trimmed);
}

function shouldStopArtifact(line) {
  const trimmed = line.trim();
  if (!trimmed) return false;
  if (isAlgorithmHeader(line) || isCodeLine(line) || isCallSignature(line)) return true;
  if (/^[•*-]\s+/.test(trimmed)) return true;
  if (/^(Hva|Hvordan|Hvorfor|Hvilk|Du|Det|Målet|Merk|Anta|Input|Om|Hvis|Her|For|Under|Tabellen|Prosedyren|Dersom|Som)\b/i.test(trimmed)) return true;
  const letters = (trimmed.match(/[A-Za-zÆØÅæøå]/g) || []).length;
  return letters >= 14 && /[.!?:)]$/.test(trimmed);
}

function shouldSkipArtifact(problem, block) {
  const stray = new Set([
    "2023-des-04",
    "2023-des-08",
    "2024-aug-06",
    "2024-aug-07",
    "2024-aug-10",
    "2024-des-11",
    "2025-des-12",
    "2025-des-14",
    "2025-des-16",
  ]);
  return stray.has(problem.id) && block.type === "artifact";
}

function shouldSkipBlock(problem, block) {
  if (shouldSkipArtifact(problem, block)) return true;
  if (block.type === "code") {
    const misplacedCode = {
      "2022-des-14": /Randomized-Select|Lurviks versjon/i,
      "2023-aug-02": /Fung-Sort/i,
      "2023-aug-07": /Fung-Sort/i,
      "2023-des-07": /Untitled\(A,\s*p,\s*r,\s*k\)/i,
      "2024-aug-18": /Unzip|Inversen av Zip/i,
      "2024-des-17": /Extract-Min|Decrease-Key|for each vertex u/i,
      "2024-des-19": /Extract-Min|Decrease-Key|for each vertex u/i,
      "2025-aug-03": /Too-Tired-For-This/i,
      "2025-aug-04": /Too-Tired-For-This/i,
    };
    if (misplacedCode[problem.id]?.test(`${block.title}\n${block.code}`)) return true;
  }
  if (problem.id === "2023-aug-07" && block.type === "code" && /Insertion-Sort\(A, n\)\s+1 Merge-Sort/.test(block.code)) return true;
  if (problem.id === "2024-des-06" && block.type === "paragraph" && /^x\s+y\s+z\s+w$/.test(block.text)) return true;
  if (problem.id === "2024-des-07" && block.type === "paragraph" && /^u\s+3\/\s*5\s+v$/.test(block.text)) return true;
  if (problem.id === "2024-des-11" && block.type === "paragraph" && /^Husk at x = x1\/2/.test(block.text)) return true;
  if (problem.id === "2023-aug-10" && block.type === "paragraph" && /^(Lurvik|Gløgsund):/.test(block.text)) return true;
  return false;
}

function artifactKind(problem, block) {
  const byProblem = {
    "2022-des-09": "matrix-2022-w",
    "2023-aug-12": "recurrence-2023-aug-12",
    "2023-des-06": "flow-2023-des",
    "2023-des-05": "disjoint-forest-2023",
    "2024-aug-10": "adjacency-2024-aug",
    "2024-aug-13": "relax-graph-2024-aug",
    "2024-des-06": "dfs-chain-2024-des",
    "2024-des-08": "huffman-2024-des",
    "2024-des-12": "mst-cut-2024-des",
    "2024-des-15": "apsp-2024-des",
    "2024-des-16": "array-tree-2024-des",
    "2024-des-20": "stable-matching-2024-des",
    "2025-des-02": "runtime-choices-2025",
    "2025-des-05": "lcs-formula-2025",
    "2025-des-08": "residual-formula-2025",
    "2025-des-16": "dag-2025-des",
    "2025-des-17": "flow-2025-des",
    "2025-des-20": "k33-2025-des",
  };
  return byProblem[problem.id] || null;
}

function leadingVisualKinds(problem) {
  const byProblem = {
    "2022-des-15": ["randomized-select-2022-des"],
    "2022-des-16": ["randomized-select-2022-des"],
    "2023-aug-01": ["fung-sort-2023-aug"],
    "2023-aug-07": ["sort-comparison-2023-aug"],
    "2023-des-05": ["disjoint-forest-2023"],
    "2023-des-06": ["flow-2023-des"],
    "2024-aug-10": ["adjacency-2024-aug"],
    "2024-aug-19": ["unzip-2024-aug"],
    "2024-des-06": ["dfs-chain-2024-des"],
    "2024-des-07": ["residual-edge-2024-des"],
    "2024-des-08": ["huffman-2024-des"],
    "2024-des-11": ["sqrt-laws-2024-des"],
    "2024-des-12": ["mst-cut-2024-des"],
    "2024-des-17": ["bellman-queue-2024-des"],
    "2025-aug-05": ["too-tired-2025-aug"],
    "2025-des-16": ["dag-2025-des"],
    "2025-des-17": ["flow-2025-des"],
  };
  return byProblem[problem.id] || [];
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

function joinParagraph(lines) {
  return lines.reduce((text, raw) => {
    const line = raw.trim();
    if (!line) return text;
    if (!text) return line;
    if (text.endsWith("-")) return `${text.slice(0, -1)}${line}`;
    return `${text} ${line}`;
  }, "");
}

function parseExamBlocks(rawText) {
  const lines = String(rawText || "")
    .replace(/\r/g, "")
    .split("\n")
    .map((line, index) => cleanExamLine(line, index));
  const blocks = [];
  let paragraph = [];

  const flushParagraph = () => {
    const text = joinParagraph(paragraph);
    if (text) blocks.push({ type: "paragraph", text });
    paragraph = [];
  };

  for (let i = 0; i < lines.length;) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      flushParagraph();
      i += 1;
      continue;
    }

    if (isAlgorithmHeader(line) || isCodeLine(line) || (isCallSignature(line) && isCodeLine(lines[i + 1] || ""))) {
      flushParagraph();
      let title = isAlgorithmHeader(line) ? trimmed : "Pseudokode";
      const codeLines = [];
      let lastCodeNumber = null;
      let firstCodeNumber = null;
      const addCodeLine = (sourceLine) => {
        const number = codeLineNumber(sourceLine);
        if (number && firstCodeNumber === null) firstCodeNumber = number;
        if (number && lastCodeNumber && number > lastCodeNumber + 1) {
          for (let missing = lastCodeNumber + 1; missing < number; missing += 1) codeLines.push("▮▮▮");
        }
        if (number) lastCodeNumber = number;
        codeLines.push(codeContent(sourceLine));
      };
      if (!isAlgorithmHeader(line)) {
        if (isCallSignature(line)) title = trimmed;
        else addCodeLine(line);
      }
      i += 1;

      while (i < lines.length) {
        const current = lines[i];
        const currentTrimmed = current.trim();
        if (!currentTrimmed) {
          if (codeLines.length > 0 && (isCodeLine(lines[i + 1] || "") || isCallSignature(lines[i + 1] || ""))) {
            codeLines.push("");
            i += 1;
            continue;
          }
          break;
        }
        if (isFigureHeader(current)) break;
        if (isCallSignature(current) && codeLines.length === 0) {
          title = title === "Pseudokode" ? currentTrimmed : `${title} · ${currentTrimmed}`;
          i += 1;
          continue;
        }
        if (isCodeLine(current) || isCallSignature(current) || (codeLines.length > 0 && isCodeContinuation(current))) {
          addCodeLine(current);
          i += 1;
          continue;
        }
        break;
      }

      const code = normalizeCodeBlock(codeLines);
      if (code.trim() && !/^\.\s*\.\s*\./.test(code.trim())) blocks.push({ type: "code", title, code, startLine: firstCodeNumber || 1 });
      continue;
    }

    if (/^\d+\.\s+/.test(trimmed)) {
      flushParagraph();
      const items = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+\.\s+/, ""));
        i += 1;
      }
      blocks.push({ type: "list", items, ordered: true });
      continue;
    }

    if (/^[•*-]\s+/.test(trimmed)) {
      flushParagraph();
      const items = [];
      while (i < lines.length && /^[•*-]\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^[•*-]\s+/, ""));
        i += 1;
      }
      blocks.push({ type: "list", items });
      continue;
    }

    if (isFigureHeader(line) || isDenseArtifactLine(line)) {
      flushParagraph();
      const label = isFigureHeader(line) ? trimmed : "Figur/tabell";
      const artifactLines = [line];
      i += 1;
      while (i < lines.length && !shouldStopArtifact(lines[i])) {
        artifactLines.push(lines[i]);
        i += 1;
      }
      blocks.push({ type: "artifact", label, lines: artifactLines });
      continue;
    }

    paragraph.push(line);
    i += 1;
  }

  flushParagraph();
  return blocks;
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

function ExamGraph({ title, nodes, edges, width = 520, height = 240, directed = true }) {
  const byId = nodes.reduce((acc, node) => {
    acc[node.id] = node;
    return acc;
  }, {});

  const edgePath = (edge) => {
    const from = byId[edge.from];
    const to = byId[edge.to];
    if (!from || !to) return "";
    if (edge.loop) {
      const r = edge.loopRadius || 14;
      return `M ${from.x - 2} ${from.y - from.r - 1 || from.y - 17} C ${from.x - r} ${from.y - 42}, ${from.x + r} ${from.y - 42}, ${from.x + 2} ${from.y - from.r - 1 || from.y - 17}`;
    }
    if (!edge.curve) return `M ${from.x} ${from.y} L ${to.x} ${to.y}`;
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    const cx = (from.x + to.x) / 2 - (dy / len) * edge.curve;
    const cy = (from.y + to.y) / 2 + (dx / len) * edge.curve;
    return `M ${from.x} ${from.y} Q ${cx} ${cy} ${to.x} ${to.y}`;
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
          <marker id="exam-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto" markerUnits="strokeWidth">
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
                markerEnd={directed && edge.directed !== false ? "url(#exam-arrow)" : undefined}
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
      [85, 105], [135, 60], [135, 150], [230, 105],
      [285, 60], [285, 150], [410, 70], [465, 120], [410, 170],
    ];
    const edges = [[0, 1], [0, 2], [1, 3], [2, 3], [3, 4], [3, 5], [4, 6], [5, 8], [6, 7], [7, 8], [5, 7]];
    const strong = new Set(["2-3", "3-5", "6-7"]);
    return (
      <VisualFrame title="Snitt og foreløpig kantmengde A">
        <svg className="fn-graph-svg" viewBox="0 0 560 230" role="img" aria-label="Snitt og foreløpig kantmengde A">
          <path className="cut-line" d="M 30 115 C 95 80, 130 180, 200 120 S 315 35, 390 110 S 485 175, 535 105" />
          <text x="35" y="35" className="edge-label">A = markerte kanter</text>
          <text x="500" y="80" className="edge-label">S</text>
          <text x="505" y="150" className="edge-label">V - S</text>
          {edges.map(([a, b]) => {
            const key = `${Math.min(a, b)}-${Math.max(a, b)}`;
            return <line key={key} x1={nodes[a][0]} y1={nodes[a][1]} x2={nodes[b][0]} y2={nodes[b][1]} className={strong.has(key) ? "strong-line" : ""} />;
          })}
          {nodes.map(([x, y], index) => (
            <g key={index} className="node">
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
  const title = rawLines.some((line) => /=|T\(|Θ|Ω|O\(/.test(line)) ? "Utregning" : (block.label || "Figur");

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

function FormattedExamText({ text, exam, pdf, page, problem, lang, className, showArtifactLinks = false, includeLeadingVisuals = true }) {
  const blocks = useMemo(() => parseExamBlocks(text), [text]);
  const CodeView = window.AlgViz.CodeView;
  const leadingKinds = includeLeadingVisuals ? leadingVisualKinds(problem) : [];

  return (
    <div className={className}>
      {leadingKinds.map((kind) => <ExamVisual key={`leading-${kind}`} kind={kind} />)}
      {blocks.map((block, index) => {
        if (shouldSkipBlock(problem, block)) return null;
        if (block.type === "paragraph") {
          const paragraph = <p className="serif"><InlineText text={block.text} problem={problem} /></p>;
          if (problem.id === "2023-aug-10" && /har følgende preferanser/.test(block.text)) {
            return (
              <React.Fragment key={index}>
                {paragraph}
                <ExamVisual kind="matching-preferences-2023-aug" />
              </React.Fragment>
            );
          }
          return <React.Fragment key={index}>{paragraph}</React.Fragment>;
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
        const kind = artifactKind(problem, block);
        if (kind) return <ExamVisual key={index} kind={kind} />;
        return <EquationBlockVisual key={index} block={block} problem={problem} />;
      })}
    </div>
  );
}

function prepFor(problem, course, algorithms) {
  const haystack = `${problem.title}\n${problem.prompt}\n${problem.solution}`;
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
        <a className="fn-btn ghost" href={linkTo(exam.problemPdf, problem.problemPage)} target="_blank" rel="noreferrer">
          {txt({ no: "Åpne oppgave-PDF", en: "Open problem PDF" }, lang)}
        </a>
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

function ProblemCard({ exam, problem, category, course, algorithms, lang, open, onToggle }) {
  const prep = useMemo(
    () => prepFor(problem, course, algorithms),
    [problem, course, algorithms]
  );

  return (
    <article className={open ? "fn-exam-card open" : "fn-exam-card"}>
      <header className="fn-exam-card-head">
        <div>
          <Eyebrow>{categoryLabel(category, lang)}</Eyebrow>
          <h3 className="serif">
            {txt({ no: "Oppgave", en: "Problem" }, lang)} {String(problem.number).padStart(2, "0")}
          </h3>
          <MonoMeta>{exam.term}</MonoMeta>
        </div>
        <button className={open ? "fn-btn ghost" : "fn-btn primary"} onClick={onToggle} aria-expanded={open}>
          {open
            ? txt({ no: "Skjul løsning", en: "Hide solution" }, lang)
            : txt({ no: "Vis løsning", en: "Show solution" }, lang)}
        </button>
      </header>

      <FormattedExamText
        text={problem.prompt}
        exam={exam}
        pdf={exam.problemPdf}
        page={problem.problemPage}
        problem={problem}
        lang={lang}
        className="fn-exam-prompt"
      />

      {open && (
        <div className="fn-exam-solution">
          <div className="fn-exam-solution-head">
            <Eyebrow>{txt({ no: "Løsningsforslag", en: "Solution" }, lang)}</Eyebrow>
            <MonoMeta>{exam.term} · p. {problem.solutionPage}</MonoMeta>
          </div>
          <FormattedExamText
            text={problem.solution
              ? stripPromptFromSolution(problem.solution, problem.prompt)
              : txt({ no: "Se løsnings-PDF for denne oppgaven.", en: "See the solution PDF for this problem." }, lang)}
            exam={exam}
            pdf={exam.solutionPdf}
            page={problem.solutionPage}
            problem={problem}
            lang={lang}
            className="fn-exam-solution-text"
            showArtifactLinks
            includeLeadingVisuals={false}
          />
          <PrepLinks prep={prep} exam={exam} problem={problem} lang={lang} />
        </div>
      )}
    </article>
  );
}

function ExamView({ course, algorithms, lang, selectedExamId }) {
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
      const matchQuery = !q || `${problem.number} ${problem.title} ${problem.prompt}`.toLowerCase().includes(q);
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
                onToggle={() => toggle(problem.id)}
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
