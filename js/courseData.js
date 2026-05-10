/* global window */
(function () {
const t = (no, en) => ({ no, en });

const glossary = [
  {
    id: "asymptotic-notation",
    term: t("Asymptotisk notasjon", "Asymptotic notation"),
    english: "O, Ω, Θ, o, ω",
    lectureIds: ["l01", "l04"],
    algorithmIds: ["insertion-sort", "quick-sort", "binary-search"],
    explanation: t(
      "Et presist språk for øvre og nedre grenser på vekst. Notasjonen beskriver funksjoner, ikke bare bestemte tilfeller som worst-case.",
      "A precise language for upper and lower growth bounds. The notation describes functions, not only specific cases such as worst-case."
    ),
  },
  {
    id: "ram-model",
    term: t("RAM-modellen", "RAM model"),
    english: "random-access machine",
    lectureIds: ["l01"],
    algorithmIds: [],
    explanation: t(
      "En idealisert maskinmodell der grunnleggende operasjoner og tilgang til en celle tar konstant tid. Den gjør kjøretidsanalyse sammenlignbar.",
      "An idealized machine model where basic operations and access to one cell take constant time. It makes running-time analysis comparable."
    ),
  },
  {
    id: "problem-instance",
    term: t("Problem og instans", "Problem and instance"),
    english: "problem, instance, input size",
    lectureIds: ["l01", "l02"],
    algorithmIds: [],
    explanation: t(
      "Et problem er den generelle oppgaven; en instans er én konkret input. Problemstørrelsen er målet vi analyserer kjøretiden mot.",
      "A problem is the general task; an instance is one concrete input. Input size is the measure used for running-time analysis."
    ),
  },
  {
    id: "loop-invariant",
    term: t("Løkkeinvariant", "Loop invariant"),
    english: "initialization, maintenance, termination",
    lectureIds: ["l02"],
    algorithmIds: ["insertion-sort", "selection-sort", "bubble-sort"],
    explanation: t(
      "En påstand som er sann før og etter hver iterasjon. Den brukes til å bevise at løkken bygger riktig resultat.",
      "A statement true before and after each iteration. It proves that the loop gradually builds the correct result."
    ),
  },
  {
    id: "induction",
    term: t("Induksjon", "Induction"),
    english: "base case, inductive step",
    lectureIds: ["l02", "l03"],
    algorithmIds: ["binary-search", "quick-sort"],
    explanation: t(
      "Bevismetode der grunntilfeller etableres først, og større tilfeller begrunnes ved å anta at mindre tilfeller fungerer.",
      "A proof method where base cases are established first, and larger cases are justified by assuming smaller cases work."
    ),
  },
  {
    id: "reduction",
    term: t("Reduksjon", "Reduction"),
    english: "Turing, Cook, Levin, Karp",
    lectureIds: ["l02", "l13", "l14"],
    algorithmIds: [],
    explanation: t(
      "En transformasjon som lar oss løse eller sammenligne problemer ved å bruke en løsning på et annet problem.",
      "A transformation that lets us solve or compare problems by using a solution to another problem."
    ),
  },
  {
    id: "divide-and-conquer",
    term: t("Splitt og hersk", "Divide and conquer"),
    english: "divide, conquer, combine",
    lectureIds: ["l03"],
    algorithmIds: ["quick-sort", "binary-search"],
    explanation: t(
      "Del instansen i mindre delinstanser, løs dem rekursivt, og kombiner resultatene når det trengs.",
      "Split the instance into smaller subinstances, solve them recursively, and combine the results when needed."
    ),
  },
  {
    id: "recurrence",
    term: t("Rekurrens", "Recurrence"),
    english: "substitution, recursion tree, master theorem",
    lectureIds: ["l03"],
    algorithmIds: ["quick-sort", "binary-search"],
    explanation: t(
      "En ligning for kjøretid uttrykt ved kjøretiden til mindre instanser. Den fanger formen på rekursiv dekomponering.",
      "An equation for running time expressed through smaller instances. It captures the shape of recursive decomposition."
    ),
  },
  {
    id: "comparison-lower-bound",
    term: t("Nedre grense for sammenligningssortering", "Comparison-sorting lower bound"),
    english: "Ω(n lg n)",
    lectureIds: ["l04"],
    algorithmIds: ["quick-sort", "insertion-sort"],
    explanation: t(
      "Alle sammenligningsbaserte sorteringsalgoritmer må skille mellom n! mulige rekkefølger, som krever Ω(n lg n) sammenligninger i verste fall.",
      "Every comparison sort must distinguish between n! possible orders, requiring Ω(n lg n) comparisons in the worst case."
    ),
  },
  {
    id: "stable-sort",
    term: t("Stabil sortering", "Stable sorting"),
    english: "stable subroutine",
    lectureIds: ["l04"],
    algorithmIds: [],
    explanation: t(
      "Like elementer beholder relativ rekkefølge. Dette er avgjørende når sortering gjentas på flere nøkler, som i radix-sortering.",
      "Equal elements keep their relative order. This matters when sorting repeatedly by several keys, as in radix sort."
    ),
  },
  {
    id: "heap",
    term: t("Haug", "Heap"),
    english: "heap property, priority queue",
    lectureIds: ["l05"],
    algorithmIds: [],
    explanation: t(
      "Et nesten komplett tre lagret kompakt i en tabell, der forelderen har prioritet over barna. Brukes ofte som prioritetskø.",
      "An almost complete tree stored compactly in an array, where the parent has priority over its children. Often used as a priority queue."
    ),
  },
  {
    id: "bst",
    term: t("Binært søketre", "Binary search tree"),
    english: "binary-search-tree property",
    lectureIds: ["l05"],
    algorithmIds: ["binary-search"],
    explanation: t(
      "Et tre der alt i venstre deltre er mindre enn rota og alt i høyre deltre er større, rekursivt for alle noder.",
      "A tree where everything in the left subtree is smaller than the root and everything in the right subtree is larger, recursively."
    ),
  },
  {
    id: "dynamic-programming",
    term: t("Dynamisk programmering", "Dynamic programming"),
    english: "top-down, bottom-up, subproblem graph",
    lectureIds: ["l06", "l11"],
    algorithmIds: [],
    explanation: t(
      "Brukes når delinstanser overlapper. Vi lagrer delløsninger og beregner dem i en rekkefølge som respekterer avhengighetene.",
      "Used when subinstances overlap. We store subsolutions and compute them in an order that respects dependencies."
    ),
  },
  {
    id: "greedy-choice",
    term: t("Grådig valg", "Greedy choice"),
    english: "greedy-choice property",
    lectureIds: ["l07", "l09"],
    algorithmIds: [],
    explanation: t(
      "Et lokalt valg som kan inngå i en optimal løsning. Riktig grådighet krever også optimal delstruktur.",
      "A local choice that can be part of an optimal solution. Correct greediness also needs optimal substructure."
    ),
  },
  {
    id: "graph-traversal",
    term: t("Graftraversering", "Graph traversal"),
    english: "BFS, DFS, frontier",
    lectureIds: ["l08"],
    algorithmIds: [],
    explanation: t(
      "Systematisk utforsking av noder ved å holde orden på oppdagede, men ikke ferdigbehandlede noder.",
      "Systematic exploration of vertices by tracking discovered but unfinished vertices."
    ),
  },
  {
    id: "bfs",
    term: t("Bredde-først-søk", "Breadth-first search"),
    english: "BFS",
    lectureIds: ["l08"],
    algorithmIds: [],
    explanation: t(
      "Traverserer lag for lag fra startnoden. I uvektede grafer gir dette korteste veier målt i antall kanter.",
      "Traverses layer by layer from the start vertex. In unweighted graphs this gives shortest paths by number of edges."
    ),
  },
  {
    id: "dfs",
    term: t("Dybde-først-søk", "Depth-first search"),
    english: "DFS",
    lectureIds: ["l08"],
    algorithmIds: [],
    explanation: t(
      "Følger én gren dypt før den rygger tilbake. Tidsstempler og foreldre gir struktur til topologisk sortering og SCC.",
      "Follows one branch deeply before backing up. Timestamps and parents give structure for topological sort and SCC."
    ),
  },
  {
    id: "disjoint-set",
    term: t("Disjunkte mengder", "Disjoint sets"),
    english: "union-find",
    lectureIds: ["l09"],
    algorithmIds: [],
    explanation: t(
      "En datastruktur for å vedlikeholde en partisjon av elementer, med operasjonene Make-Set, Find-Set og Union.",
      "A data structure for maintaining a partition of elements, with Make-Set, Find-Set, and Union operations."
    ),
  },
  {
    id: "mst",
    term: t("Minimalt spenntrær", "Minimum spanning tree"),
    english: "MST, safe edge, cut",
    lectureIds: ["l09"],
    algorithmIds: [],
    explanation: t(
      "Et sett kanter som kobler alle noder uten sykler og med lavest mulig total vekt.",
      "A set of edges that connects all vertices without cycles and with minimum total weight."
    ),
  },
  {
    id: "relaxation",
    term: t("Kantoppdatering", "Relaxation"),
    english: "edge relaxation",
    lectureIds: ["l10"],
    algorithmIds: [],
    explanation: t(
      "Forsøk på å forbedre et avstandsestimat ved å gå via én kant. Dette er kjernen i Bellman-Ford, DAG-korteste veier og Dijkstra.",
      "An attempt to improve a distance estimate by going through one edge. It is the core of Bellman-Ford, DAG shortest paths, and Dijkstra."
    ),
  },
  {
    id: "dijkstra",
    term: t("Dijkstras algoritme", "Dijkstra's algorithm"),
    english: "nonnegative weights",
    lectureIds: ["l10"],
    algorithmIds: [],
    explanation: t(
      "Velger alltid noden med lavest avstandsestimat. Korrektheten avhenger av at kantvekter ikke er negative.",
      "Always chooses the vertex with the lowest distance estimate. Correctness depends on nonnegative edge weights."
    ),
  },
  {
    id: "apsp",
    term: t("Alle-til-alle korteste veier", "All-pairs shortest paths"),
    english: "APSP",
    lectureIds: ["l11"],
    algorithmIds: [],
    explanation: t(
      "Finn korteste veier mellom alle par av noder. Tette grafer gjør dynamisk programmering spesielt nyttig her.",
      "Find shortest paths between every pair of vertices. Dense graphs make dynamic programming especially useful here."
    ),
  },
  {
    id: "max-flow",
    term: t("Maksimal flyt", "Maximum flow"),
    english: "flow network, min cut",
    lectureIds: ["l12"],
    algorithmIds: [],
    explanation: t(
      "Send mest mulig flyt fra kilde til sluk uten å bryte kapasiteter eller flytbevaring.",
      "Send as much flow as possible from source to sink without violating capacities or flow conservation."
    ),
  },
  {
    id: "residual-network",
    term: t("Restnett", "Residual network"),
    english: "augmenting path",
    lectureIds: ["l12"],
    algorithmIds: [],
    explanation: t(
      "Grafen over hvor flyt kan økes, reduseres eller flyttes. Forøkende stier finnes i restnettet.",
      "The graph of where flow can be increased, reduced, or redirected. Augmenting paths live in the residual network."
    ),
  },
  {
    id: "np-completeness",
    term: t("NP-kompletthet", "NP-completeness"),
    english: "P, NP, NP-hard, NPC",
    lectureIds: ["l13", "l14"],
    algorithmIds: [],
    explanation: t(
      "Et NP-komplett beslutningsproblem ligger i NP og er minst like vanskelig som alle problemer i NP under polynomiske reduksjoner.",
      "An NP-complete decision problem is in NP and at least as hard as every problem in NP under polynomial reductions."
    ),
  },
  {
    id: "karp-reduction",
    term: t("Karp-reduksjon", "Karp reduction"),
    english: "many-one reduction",
    lectureIds: ["l13", "l14"],
    algorithmIds: [],
    explanation: t(
      "En polynomisk transformasjon fra én beslutningsinstans til en annen, slik at ja/nei-svaret bevares.",
      "A polynomial transformation from one decision instance to another, preserving the yes/no answer."
    ),
  },
  {
    id: "binary-knapsack",
    term: t("Binært ryggsekkproblem", "0/1 knapsack"),
    english: "pseudo-polynomial DP",
    lectureIds: ["l06", "l13"],
    algorithmIds: [],
    explanation: t(
      "Velg hele gjenstander med verdi og vekt under en kapasitet. Den klassiske DP-en er Θ(nW), men dette er pseudopolynomisk.",
      "Choose whole items with values and weights under a capacity. The classic DP is Θ(nW), but this is pseudo-polynomial."
    ),
  },
];

const lectures = [
  {
    id: "l01",
    number: 1,
    title: t("Algoritmer og kompleksitet", "Algorithms and complexity"),
    summary: t(
      "Start med presis modell: hva et problem er, hvordan pseudokode leses, og hvordan vi beskriver kjøretid uavhengig av maskin.",
      "Start with a precise model: what a problem is, how pseudocode is read, and how running time is described independently of a machine."
    ),
    curriculumRefs: ["CLRS part I intro", "CLRS 1", "CLRS 2 intro, 2.1-2.2", "CLRS 3 intro, 3.1-3.2", "CLRS 25 intro"],
    learningGoals: [
      { id: "A1", focus: false, text: t("Les og bruk bokas pseudokodekonvensjoner.", "Read and use the book's pseudocode conventions.") },
      { id: "A2", focus: false, text: t("Forklar RAM-modellen og hva den abstraherer bort.", "Explain the RAM model and what it abstracts away.") },
      { id: "A3", focus: false, text: t("Skill mellom problem, instans og problemstørrelse.", "Distinguish problem, instance, and input size.") },
      { id: "A4", focus: true, text: t("Bruk O, Ω, Θ, o og ω korrekt.", "Use O, Ω, Θ, o, and ω correctly.") },
      { id: "A5", focus: true, text: t("Skill mellom best-, average- og worst-case.", "Distinguish best-, average-, and worst-case.") },
      { id: "A6", focus: true, text: t("Se at asymptotiske grenser og tilfeller er uavhengige akser.", "See asymptotic bounds and cases as independent axes.") },
      { id: "A7", focus: false, text: t("Forklar Insertion-Sort trinn for trinn.", "Explain Insertion-Sort step by step.") },
    ],
    pitfall: t(
      "Ikke la O bety worst-case automatisk. O er en øvre grense; den kan beskrive beste tilfelle også.",
      "Do not let O automatically mean worst-case. O is an upper bound; it can describe best-case too."
    ),
    conceptIds: ["asymptotic-notation", "ram-model", "problem-instance"],
    algorithmIds: ["insertion-sort"],
    quizIds: ["q01"],
  },
  {
    id: "l02",
    number: 2,
    title: t("Problemer og reduksjoner", "Problems and reductions"),
    summary: t(
      "Bygg algoritmisk presisjon: problemtyper, reduksjoner, løkkeinvarianter og induksjon som verktøy for korrekthet.",
      "Build algorithmic precision: problem types, reductions, loop invariants, and induction as tools for correctness."
    ),
    curriculumRefs: ["Pensumhefte appendix B.1", "CLRS 29 intro"],
    learningGoals: [
      { id: "B1", focus: false, text: t("Skill søke-, beslutnings- og optimeringsproblemer.", "Distinguish search, decision, and optimization problems.") },
      { id: "B2", focus: false, text: t("Kjenn hovedtypene reduksjoner og forholdet mellom dem.", "Know the main reduction types and how they relate.") },
      { id: "B3", focus: false, text: t("Tolk reduserbarhet som relativ vanskegrad.", "Interpret reducibility as relative difficulty.") },
      { id: "B4", focus: true, text: t("Bruk løkkeinvarianter og induksjon i korrekthetsargumenter.", "Use loop invariants and induction in correctness arguments.") },
      { id: "B5", focus: true, text: t("Forklar rekursiv dekomponering via induksjon over delinstanser.", "Explain recursive decomposition through induction over subinstances.") },
      { id: "B6", focus: false, text: t("Kjenn ideen om lineære program som problembeskrivelse.", "Know the idea of linear programs as problem descriptions.") },
    ],
    pitfall: t(
      "Reduksjoner føles ofte bakvendte. For å vise at X er vanskelig, reduserer du fra et kjent vanskelig problem til X.",
      "Reductions often feel reversed. To show X is hard, reduce from a known hard problem to X."
    ),
    conceptIds: ["problem-instance", "reduction", "loop-invariant", "induction"],
    algorithmIds: [],
    quizIds: ["q02"],
  },
  {
    id: "l03",
    number: 3,
    title: t("Splitt og hersk", "Divide and conquer"),
    summary: t(
      "Rekursiv dekomponering blir en designmetode: del, løs delinstanser, kombiner, og analyser med rekurrenser.",
      "Recursive decomposition becomes a design method: divide, solve subinstances, combine, and analyze with recurrences."
    ),
    curriculumRefs: ["CLRS part II intro", "CLRS 2.3", "CLRS 4 intro, 4.3-4.5", "CLRS 7", "Pensumhefte appendix C-D"],
    learningGoals: [
      { id: "C1", focus: true, text: t("Forklar designmetoden splitt og hersk.", "Explain the divide-and-conquer design method.") },
      { id: "C2", focus: false, text: t("Forklar Bisect og iterativ Bisect'.", "Explain Bisect and iterative Bisect'.") },
      { id: "C3", focus: false, text: t("Forklar Merge-Sort.", "Explain Merge-Sort.") },
      { id: "C4", focus: false, text: t("Forklar Quicksort og randomized Quicksort.", "Explain Quicksort and randomized Quicksort.") },
      { id: "C5", focus: true, text: t("Løs rekurrenser med substitusjon, rekursjonstrær og masterteoremet.", "Solve recurrences with substitution, recursion trees, and the master theorem.") },
      { id: "C6", focus: true, text: t("Løs rekurrenser med iterasjonsmetoden.", "Solve recurrences with the iteration method.") },
    ],
    pitfall: t(
      "Rekursjon og rekurrenser er samme mentale mønster: forstå delinstansene før du regner.",
      "Recursion and recurrences share the same mental pattern: understand the subinstances before calculating."
    ),
    conceptIds: ["divide-and-conquer", "recurrence", "induction"],
    algorithmIds: ["quick-sort", "binary-search"],
    quizIds: ["q03"],
  },
  {
    id: "l04",
    number: 4,
    title: t("Rangering i lineær tid", "Ranking in linear time"),
    summary: t(
      "Sortering kan bli raskere når vi antar mer om input eller krever mindre av output. Sammenligningsmodellen gir en viktig nedre grense.",
      "Sorting can get faster when we assume more about input or require less output. The comparison model gives an important lower bound."
    ),
    curriculumRefs: ["CLRS 8", "CLRS 9"],
    learningGoals: [
      { id: "D1", focus: true, text: t("Forklar hvorfor sammenligningssortering har Ω(n lg n) worst-case.", "Explain why comparison sorting has Ω(n lg n) worst-case.") },
      { id: "D2", focus: false, text: t("Definer stabil sortering.", "Define stable sorting.") },
      { id: "D3", focus: false, text: t("Forklar Counting-Sort og stabiliteten.", "Explain Counting-Sort and its stability.") },
      { id: "D4", focus: true, text: t("Forklar Radix-Sort og hvorfor den trenger stabil subrutine.", "Explain Radix-Sort and why it needs a stable subroutine.") },
      { id: "D5", focus: false, text: t("Forklar Bucket-Sort.", "Explain Bucket-Sort.") },
      { id: "D6", focus: false, text: t("Forklar Randomized-Select.", "Explain Randomized-Select.") },
      { id: "D7", focus: false, text: t("Kjenn Select og bruken til k minste elementer.", "Know Select and its use for the k smallest elements.") },
    ],
    pitfall: t(
      "For at en nedre grense skal overføres, må reduksjonen gå riktig vei og selv være rask nok.",
      "For a lower bound to transfer, the reduction must go the right way and be fast enough itself."
    ),
    conceptIds: ["comparison-lower-bound", "stable-sort", "asymptotic-notation"],
    algorithmIds: ["selection-sort", "quick-sort"],
    quizIds: ["q04"],
  },
  {
    id: "l05",
    number: 5,
    title: t("Rotfaste trestrukturer", "Rooted tree structures"),
    summary: t(
      "Trær organiserer rekursive relasjoner. Hauger prioriterer rask tilgang til ekstremverdier, mens søketrær organiserer ordnet søk.",
      "Trees organize recursive relationships. Heaps prioritize quick access to extreme values, while search trees organize ordered search."
    ),
    curriculumRefs: ["CLRS part III and V intros", "CLRS 6", "CLRS 10.3", "CLRS 12"],
    learningGoals: [
      { id: "E1", focus: true, text: t("Forklar hauger og prioritetskøoperasjoner.", "Explain heaps and priority-queue operations.") },
      { id: "E2", focus: false, text: t("Forklar Heapsort.", "Explain Heapsort.") },
      { id: "E3", focus: false, text: t("Forklar node- og pekerrepresentasjon av rotfaste trær.", "Explain node-and-pointer representation of rooted trees.") },
      { id: "E4", focus: true, text: t("Forklar binære søketrær og standardoperasjoner.", "Explain binary search trees and standard operations.") },
      { id: "E5", focus: false, text: t("Kjenn forventet høyde for tilfeldig BST.", "Know expected height for a random BST.") },
      { id: "E6", focus: false, text: t("Kjenn at balanserte søketrær kan garantere logaritmisk høyde.", "Know that balanced search trees can guarantee logarithmic height.") },
    ],
    pitfall: t(
      "Build-Max-Heap er ikke det samme som å sette inn elementene ett og ett; kjøretiden blir annerledes.",
      "Build-Max-Heap is not the same as inserting elements one by one; the running time differs."
    ),
    conceptIds: ["heap", "bst"],
    algorithmIds: ["binary-search"],
    quizIds: ["q05"],
  },
  {
    id: "l06",
    number: 6,
    title: t("Dynamisk programmering", "Dynamic programming"),
    summary: t(
      "Når delinstanser overlapper, sparer vi arbeid ved å lagre løsninger og følge avhengighetene i delinstansgrafen.",
      "When subinstances overlap, we save work by storing solutions and following dependencies in the subproblem graph."
    ),
    curriculumRefs: ["CLRS part IV intro", "CLRS 14 intro, 14.1, 14.3-14.4", "Pensumhefte appendix E"],
    learningGoals: [
      { id: "F1", focus: true, text: t("Forstå ideen om delinstansgraf.", "Understand the subproblem graph idea.") },
      { id: "F2", focus: true, text: t("Forklar designmetoden dynamisk programmering.", "Explain the dynamic-programming design method.") },
      { id: "F3", focus: true, text: t("Forklar memoisering som top-down-løsning.", "Explain memoization as a top-down solution.") },
      { id: "F4", focus: false, text: t("Forklar iterativ bottom-up-løsning.", "Explain iterative bottom-up solution.") },
      { id: "F5", focus: false, text: t("Rekonstruer løsning fra lagrede valg.", "Reconstruct a solution from stored choices.") },
      { id: "F6", focus: false, text: t("Forklar optimal delstruktur.", "Explain optimal substructure.") },
      { id: "F7", focus: false, text: t("Forklar overlappende delinstanser.", "Explain overlapping subinstances.") },
      { id: "F8", focus: false, text: t("Forklar stavkapping og LCS.", "Explain rod cutting and LCS.") },
      { id: "F9", focus: false, text: t("Forklar binært ryggsekkproblem fra appendiks E.", "Explain the binary knapsack problem from appendix E.") },
    ],
    pitfall: t(
      "Overlappende delinstanser betyr at flere veier i avhengighetsgrafen trenger samme delløsning.",
      "Overlapping subinstances means several paths in the dependency graph need the same subsolution."
    ),
    conceptIds: ["dynamic-programming", "binary-knapsack"],
    algorithmIds: [],
    quizIds: ["q06"],
  },
  {
    id: "l07",
    number: 7,
    title: t("Grådighet", "Greediness"),
    summary: t(
      "Grådige algoritmer velger lokalt. Utfordringen er ikke å utføre valget, men å bevise at lokale valg kan lede til optimum.",
      "Greedy algorithms choose locally. The challenge is not performing the choice, but proving local choices can lead to optimum."
    ),
    curriculumRefs: ["CLRS 15 intro, 15.1-15.3"],
    learningGoals: [
      { id: "G1", focus: true, text: t("Forklar designmetoden grådighet.", "Explain the greedy design method.") },
      { id: "G2", focus: true, text: t("Forklar grådighetsegenskapen.", "Explain the greedy-choice property.") },
      { id: "G3", focus: false, text: t("Forklar aktivitetsutvelgelse og kontinuerlig ryggsekk.", "Explain activity selection and fractional knapsack.") },
      { id: "G4", focus: false, text: t("Forklar Huffman og Huffman-koder.", "Explain Huffman and Huffman codes.") },
    ],
    pitfall: t(
      "Grådighetsegenskapen alene sier bare at ett grådig valg kan være trygt; optimal delstruktur må også med.",
      "The greedy-choice property alone says one greedy choice can be safe; optimal substructure is also needed."
    ),
    conceptIds: ["greedy-choice"],
    algorithmIds: [],
    quizIds: ["q07"],
  },
  {
    id: "l08",
    number: 8,
    title: t("Traversering av grafer", "Graph traversal"),
    summary: t(
      "BFS og DFS er frontier-baserte måter å utforske grafer på, og de danner ryggraden i flere senere algoritmer.",
      "BFS and DFS are frontier-based ways to explore graphs, and they form the backbone of several later algorithms."
    ),
    curriculumRefs: ["CLRS part VI intro", "CLRS 20", "Pensumhefte appendix F"],
    learningGoals: [
      { id: "H1", focus: false, text: t("Forklar grafrepresentasjoner.", "Explain graph representations.") },
      { id: "H2", focus: false, text: t("Forklar BFS og korteste vei i uvektede grafer.", "Explain BFS and shortest paths in unweighted graphs.") },
      { id: "H3", focus: false, text: t("Forklar DFS, parentesteoremet og hvit-sti-teoremet.", "Explain DFS, the parenthesis theorem, and white-path theorem.") },
      { id: "H4", focus: false, text: t("Forklar kantklassifisering med DFS.", "Explain DFS edge classification.") },
      { id: "H5", focus: false, text: t("Forklar topologisk sortering.", "Explain topological sort.") },
      { id: "H6", focus: false, text: t("Forklar sterkt sammenhengende komponenter.", "Explain strongly connected components.") },
      { id: "H7", focus: false, text: t("Forklar DFS med stakk.", "Explain DFS with a stack.") },
      { id: "H8", focus: false, text: t("Forklar traverseringstrær.", "Explain traversal trees.") },
      { id: "H9", focus: true, text: t("Forklar traversering med vilkårlig prioritetskø.", "Explain traversal with an arbitrary priority queue.") },
    ],
    pitfall: t(
      "Topologisk sortering og memoisert DP bruker samme idé: løs avhengigheter før det som avhenger av dem.",
      "Topological sorting and memoized DP use the same idea: solve dependencies before what depends on them."
    ),
    conceptIds: ["graph-traversal", "bfs", "dfs", "dynamic-programming"],
    algorithmIds: [],
    quizIds: ["q08"],
  },
  {
    id: "l09",
    number: 9,
    title: t("Minimale spenntrær", "Minimum spanning trees"),
    summary: t(
      "MST-algoritmer bygger en optimal kantmengde med trygge grådige valg, ofte støttet av disjunkte mengder eller prioritetskø.",
      "MST algorithms build an optimal edge set through safe greedy choices, often supported by disjoint sets or priority queues."
    ),
    curriculumRefs: ["CLRS 19 intro, 19.1, 19.3", "CLRS 21"],
    learningGoals: [
      { id: "I1", focus: false, text: t("Forklar skogimplementasjonen av disjunkte mengder.", "Explain the forest implementation of disjoint sets.") },
      { id: "I2", focus: false, text: t("Definer spenntrær og minimale spenntrær.", "Define spanning trees and minimum spanning trees.") },
      { id: "I3", focus: true, text: t("Forklar Generic-MST.", "Explain Generic-MST.") },
      { id: "I4", focus: false, text: t("Forklar trygge lette kanter over snitt.", "Explain safe light edges across cuts.") },
      { id: "I5", focus: false, text: t("Forklar Kruskals algoritme.", "Explain Kruskal's algorithm.") },
      { id: "I6", focus: false, text: t("Forklar Prims algoritme og prioritetskørollen.", "Explain Prim's algorithm and the priority-queue role.") },
    ],
    pitfall: t(
      "Det sentrale beviset er hvorfor letteste kant over et kompatibelt snitt er trygg.",
      "The central proof is why the lightest edge across a compatible cut is safe."
    ),
    conceptIds: ["disjoint-set", "mst", "greedy-choice", "heap"],
    algorithmIds: [],
    quizIds: ["q09"],
  },
  {
    id: "l10",
    number: 10,
    title: t("Korteste vei fra én til alle", "Single-source shortest paths"),
    summary: t(
      "Korteste-vei-algoritmene skiller seg i hvilke grafer de tåler, men deler kjernen: kantoppdatering av avstandsestimater.",
      "Shortest-path algorithms differ in which graphs they tolerate, but share the core: relaxing edges to improve distance estimates."
    ),
    curriculumRefs: ["CLRS 22 intro, 22.1-22.3", "CLRS 29.2 through shortest paths"],
    learningGoals: [
      { id: "J1", focus: false, text: t("Skill varianter av korteste-vei-problemet.", "Distinguish variants of the shortest-path problem.") },
      { id: "J2", focus: false, text: t("Forklar strukturen til korteste veier.", "Explain shortest-path structure.") },
      { id: "J3", focus: false, text: t("Skill korteste vei fra korteste enkle vei ved negative sykler.", "Distinguish shortest path from shortest simple path with negative cycles.") },
      { id: "J6", focus: true, text: t("Forklar Relax og kantoppdatering.", "Explain Relax and edge relaxation.") },
      { id: "J8", focus: false, text: t("Forklar Bellman-Ford.", "Explain Bellman-Ford.") },
      { id: "J9", focus: false, text: t("Forklar DAG-Shortest-Paths.", "Explain DAG-Shortest-Paths.") },
      { id: "J10", focus: true, text: t("Koble DAG-korteste veier til dynamisk programmering.", "Connect DAG shortest paths to dynamic programming.") },
      { id: "J11", focus: false, text: t("Forklar Dijkstra.", "Explain Dijkstra.") },
    ],
    pitfall: t(
      "Korteste sti kan slutte å være veldefinert med negative sykler, selv om korteste enkle sti alltid finnes i en endelig graf.",
      "Shortest path can become undefined with negative cycles, even though a shortest simple path exists in a finite graph."
    ),
    conceptIds: ["relaxation", "dijkstra", "dynamic-programming"],
    algorithmIds: [],
    quizIds: ["q10"],
  },
  {
    id: "l11",
    number: 11,
    title: t("Korteste vei fra alle til alle", "All-pairs shortest paths"),
    summary: t(
      "Når alle par skal løses, blir overlappende delinstanser synlige. Floyd-Warshall bruker mellomliggende noder som DP-dimensjon.",
      "When every pair must be solved, overlapping subinstances become visible. Floyd-Warshall uses allowed intermediate vertices as the DP dimension."
    ),
    curriculumRefs: ["CLRS 23 intro, 23.1-23.2"],
    learningGoals: [
      { id: "K1", focus: false, text: t("Forklar forgjengerstruktur for alle-til-alle.", "Explain predecessor structure for all-pairs paths.") },
      { id: "K2", focus: false, text: t("Forklar Slow-APSP og Faster-APSP.", "Explain Slow-APSP and Faster-APSP.") },
      { id: "K3", focus: false, text: t("Forklar Floyd-Warshall.", "Explain Floyd-Warshall.") },
      { id: "K4", focus: false, text: t("Forklar Transitive-Closure.", "Explain Transitive-Closure.") },
    ],
    pitfall: t(
      "I Floyd-Warshall må du skille mellom forrige DP-lag og nytt lag når forgjengere oppdateres.",
      "In Floyd-Warshall, distinguish the previous DP layer from the new layer when predecessors update."
    ),
    conceptIds: ["apsp", "dynamic-programming"],
    algorithmIds: [],
    quizIds: ["q11"],
  },
  {
    id: "l12",
    number: 12,
    title: t("Maksimal flyt", "Maximum flow"),
    summary: t(
      "Flyt kobler optimalisering, dualitet og reduksjoner. Restnett og forøkende stier gjør algoritmene operative.",
      "Flow connects optimization, duality, and reductions. Residual networks and augmenting paths make the algorithms operational."
    ),
    curriculumRefs: ["CLRS 24", "CLRS 29.2 from maximum flow through minimum-cost flow"],
    learningGoals: [
      { id: "L1", focus: false, text: t("Definer flytnett, flyt og maks-flyt.", "Define flow network, flow, and maximum flow.") },
      { id: "L3", focus: true, text: t("Definer restnettet for en gitt flyt.", "Define the residual network for a given flow.") },
      { id: "L5", focus: false, text: t("Forklar forøkende sti.", "Explain augmenting path.") },
      { id: "L7", focus: true, text: t("Forklar maks-flyt/min-snitt-teoremet.", "Explain the max-flow/min-cut theorem.") },
      { id: "L8", focus: false, text: t("Forklar Ford-Fulkerson-metoden.", "Explain the Ford-Fulkerson method.") },
      { id: "L9", focus: false, text: t("Forklar Edmonds-Karp.", "Explain Edmonds-Karp.") },
      { id: "L12", focus: true, text: t("Forklar heltallsteoremet.", "Explain the integrality theorem.") },
      { id: "L13", focus: true, text: t("Konstruer reduksjoner til maks-flyt.", "Construct reductions to maximum flow.") },
    ],
    pitfall: t(
      "Restkapasitet inkluderer muligheten til å oppheve tidligere flyt, ikke bare ubrukt kapasitet fremover.",
      "Residual capacity includes the ability to cancel previous flow, not only unused forward capacity."
    ),
    conceptIds: ["max-flow", "residual-network", "reduction"],
    algorithmIds: [],
    quizIds: ["q12"],
  },
  {
    id: "l13",
    number: 13,
    title: t("NP-kompletthet", "NP-completeness"),
    summary: t(
      "Kompleksitetsteori formaliserer problemer der løsninger kan sjekkes effektivt, men kanskje ikke finnes effektivt.",
      "Complexity theory formalizes problems where solutions can be checked efficiently, but perhaps not found efficiently."
    ),
    curriculumRefs: ["CLRS 34 intro, 34.1-34.3", "Pensumhefte appendix B.2", "Pensumhefte appendix E"],
    learningGoals: [
      { id: "M1", focus: false, text: t("Forklar koding av en instans.", "Explain encoding of an instance.") },
      { id: "M2", focus: false, text: t("Forklar hvorfor binært ryggsekk ikke er polynomisk løst av Θ(nW)-DP-en.", "Explain why Θ(nW) DP does not make binary knapsack polynomial.") },
      { id: "M5", focus: false, text: t("Definer P, NP og co-NP.", "Define P, NP, and co-NP.") },
      { id: "M6", focus: true, text: t("Definer NP-hardhet og NP-kompletthet.", "Define NP-hardness and NP-completeness.") },
      { id: "M7", focus: false, text: t("Koble hardhet til søke-, beslutnings- og optimeringsproblemer.", "Connect hardness to search, decision, and optimization problems.") },
      { id: "M9", focus: false, text: t("Forklar reduksjon mellom optimering og terskling.", "Explain reductions between optimization and thresholding.") },
      { id: "M10", focus: false, text: t("Forklar reduksjon mellom søk og beslutning.", "Explain reductions between search and decision.") },
      { id: "M11", focus: false, text: t("Kjenn bevisideen for CIRCUIT-SAT.", "Know the proof idea for CIRCUIT-SAT.") },
    ],
    pitfall: t(
      "For å vise at ditt problem er vanskelig, må den kjente vanskelige instansen oversettes til ditt problem, ikke motsatt.",
      "To show your problem is hard, the known hard instance must be translated to your problem, not the other way around."
    ),
    conceptIds: ["np-completeness", "karp-reduction", "binary-knapsack", "reduction"],
    algorithmIds: [],
    quizIds: ["q13"],
  },
  {
    id: "l14",
    number: 14,
    title: t("NP-komplette problemer", "NP-complete problems"),
    summary: t(
      "Når ett problem er vist komplett, kan nye problemer klassifiseres ved én ny reduksjon fra et kjent komplett problem.",
      "Once one problem is shown complete, new problems can be classified by one new reduction from a known complete problem."
    ),
    curriculumRefs: ["CLRS 34.4-34.5"],
    learningGoals: [
      { id: "N1", focus: true, text: t("Forklar hvordan NP-kompletthet bevises med én reduksjon.", "Explain how NP-completeness is proved with one reduction.") },
      { id: "N2", focus: true, text: t("Kjenn sentrale NP-komplette problemer.", "Know central NP-complete problems.") },
      { id: "N3", focus: false, text: t("Forklar hovedideen i utvalgte kompletthetsbevis.", "Explain the main idea of selected completeness proofs.") },
      { id: "N4", focus: false, text: t("Forklar at binært ryggsekkproblem er NP-hardt.", "Explain that binary knapsack is NP-hard.") },
      { id: "N5", focus: false, text: t("Forklar at lengste enkle vei er NP-hardt.", "Explain that longest simple path is NP-hard.") },
      { id: "N6", focus: false, text: t("Bruk generelle reduksjonsstrategier i enkle hardhetsbevis.", "Use general reduction strategies in simple hardness proofs.") },
    ],
    pitfall: t(
      "Retningen er fortsatt den samme: reduser fra et kjent vanskelig problem til problemet du undersøker.",
      "The direction is still the same: reduce from a known hard problem to the problem you are investigating."
    ),
    conceptIds: ["np-completeness", "karp-reduction", "reduction"],
    algorithmIds: [],
    quizIds: ["q14"],
  },
];

const quizzes = [
  {
    id: "q01",
    lectureId: "l01",
    kind: "multiple-choice",
    prompt: t("Hva betyr det å skrive at worst-case-kjøretiden er Ω(n)?", "What does it mean to write that the worst-case running time is Ω(n)?"),
    choices: [
      t("Worst-case er minst lineær asymptotisk.", "The worst-case is at least linear asymptotically."),
      t("Algoritmen bruker alltid lineær tid.", "The algorithm always uses linear time."),
      t("Dette er en øvre grense på beste tilfelle.", "This is an upper bound on the best case."),
    ],
    correct: 0,
    explanation: t("Ω er en nedre grense. Den kan brukes om hvilken som helst kjøretidsfunksjon, også worst-case.", "Ω is a lower bound. It can describe any running-time function, including worst-case."),
  },
  {
    id: "q02",
    lectureId: "l02",
    kind: "multiple-choice",
    prompt: t("Hvilken påstand passer best for en løkkeinvariant?", "Which statement best describes a loop invariant?"),
    choices: [
      t("Den er sann før og etter hver løkkeiterasjon.", "It is true before and after every loop iteration."),
      t("Den er bare sann når løkken avsluttes.", "It is only true when the loop terminates."),
      t("Den må være en kjøretidsgrense.", "It must be a running-time bound."),
    ],
    correct: 0,
    explanation: t("Invariantbevis bruker initialisering, vedlikehold og avslutning.", "Invariant proofs use initialization, maintenance, and termination."),
  },
  {
    id: "q03",
    lectureId: "l03",
    kind: "trace",
    prompt: t("Binærsøk halverer vinduet hver gang. Hva blir typisk kjøretid?", "Binary search halves the window each time. What is the typical running time?"),
    choices: [t("Θ(lg n)", "Θ(lg n)"), t("Θ(n)", "Θ(n)"), t("Θ(n lg n)", "Θ(n lg n)")],
    correct: 0,
    explanation: t("Antall halveringer fra n til 1 er logaritmisk.", "The number of halvings from n to 1 is logarithmic."),
  },
  {
    id: "q04",
    lectureId: "l04",
    kind: "multiple-choice",
    prompt: t("Hvorfor trenger Radix-Sort en stabil subrutine?", "Why does Radix-Sort need a stable subroutine?"),
    choices: [
      t("Tidligere sorterte siffer må beholde rekkefølgen når neste siffer sorteres.", "Previously sorted digits must keep their order when the next digit is sorted."),
      t("Stabilitet gjør alle sorteringer in-place.", "Stability makes all sorts in-place."),
      t("Stabilitet fjerner behovet for inputantakelser.", "Stability removes the need for input assumptions."),
    ],
    correct: 0,
    explanation: t("Radix bygger korrekthet lagvis, så like nøkler i ett lag må ikke ødelegge lavere lag.", "Radix builds correctness layer by layer, so equal keys in one layer must not destroy lower layers."),
  },
  {
    id: "q05",
    lectureId: "l05",
    kind: "multiple-choice",
    prompt: t("Hva er haug-egenskapen i en maks-haug?", "What is the heap property in a max-heap?"),
    choices: [
      t("Forelderen er minst like stor som hvert barn.", "The parent is at least as large as each child."),
      t("Venstre barn er alltid minst.", "The left child is always smallest."),
      t("Alle nivåer er sortert fra venstre mot høyre.", "Every level is sorted left to right."),
    ],
    correct: 0,
    explanation: t("Haug-egenskapen er lokal mellom forelder og barn, ikke total sortering.", "The heap property is local between parent and children, not total sorting."),
  },
  {
    id: "q06",
    lectureId: "l06",
    kind: "multiple-choice",
    prompt: t("Hva gjør delinstanser overlappende?", "What makes subinstances overlapping?"),
    choices: [
      t("Samme delinstans trengs via flere rekursive veier.", "The same subinstance is needed through several recursive paths."),
      t("Alle delinstanser har samme størrelse.", "All subinstances have the same size."),
      t("Problemet har ingen grunntilfeller.", "The problem has no base cases."),
    ],
    correct: 0,
    explanation: t("DP sparer arbeid nettopp fordi samme delresultat ellers ville blitt beregnet flere ganger.", "DP saves work exactly because the same subresult would otherwise be computed multiple times."),
  },
  {
    id: "q07",
    lectureId: "l07",
    kind: "multiple-choice",
    prompt: t("Hva må vanligvis vises for en grådig algoritme?", "What is usually needed for a greedy algorithm?"),
    choices: [
      t("Grådighetsegenskap og optimal delstruktur.", "Greedy-choice property and optimal substructure."),
      t("At den alltid sorterer input først.", "That it always sorts the input first."),
      t("At den aldri bruker datastrukturer.", "That it never uses data structures."),
    ],
    correct: 0,
    explanation: t("Lokale valg må være trygge, og resten må fortsatt være et optimalt delproblem.", "Local choices must be safe, and the remainder must still be an optimal subproblem."),
  },
  {
    id: "q08",
    lectureId: "l08",
    kind: "multiple-choice",
    prompt: t("Hvorfor finner BFS korteste veier i uvektede grafer?", "Why does BFS find shortest paths in unweighted graphs?"),
    choices: [
      t("Den utforsker noder lagvis etter avstand fra start.", "It explores vertices layer by layer by distance from the start."),
      t("Den velger alltid letteste kant.", "It always chooses the lightest edge."),
      t("Den bruker rekursjon.", "It uses recursion."),
    ],
    correct: 0,
    explanation: t("FIFO-køen gjør at alle noder på avstand k behandles før avstand k+1.", "The FIFO queue makes all vertices at distance k processed before distance k+1."),
  },
  {
    id: "q09",
    lectureId: "l09",
    kind: "multiple-choice",
    prompt: t("Hva betyr det at en kant er trygg i MST-sammenheng?", "What does it mean that an edge is safe in MST context?"),
    choices: [
      t("Den kan legges til uten å ødelegge muligheten for et optimalt MST.", "It can be added without destroying the possibility of an optimal MST."),
      t("Den har alltid globalt lavest vekt.", "It always has globally lowest weight."),
      t("Den kobler to noder som allerede er i samme tre.", "It connects two vertices already in the same tree."),
    ],
    correct: 0,
    explanation: t("Trygghet handler om at det finnes et optimalt tre som inkluderer kanten sammen med valgene så langt.", "Safety means there exists an optimal tree including the edge together with the choices so far."),
  },
  {
    id: "q10",
    lectureId: "l10",
    kind: "multiple-choice",
    prompt: t("Hva gjør Relax(u, v)?", "What does Relax(u, v) do?"),
    choices: [
      t("Prøver å forbedre estimatet til v ved å gå via u.", "Attempts to improve v's estimate by going through u."),
      t("Fjerner negative kanter fra grafen.", "Removes negative edges from the graph."),
      t("Sorterer alle noder topologisk.", "Topologically sorts all vertices."),
    ],
    correct: 0,
    explanation: t("Hvis d[v] > d[u] + w(u,v), oppdateres d[v] og forgjengeren.", "If d[v] > d[u] + w(u,v), d[v] and the predecessor update."),
  },
  {
    id: "q11",
    lectureId: "l11",
    kind: "multiple-choice",
    prompt: t("Hva er DP-ideen i Floyd-Warshall?", "What is the DP idea in Floyd-Warshall?"),
    choices: [
      t("Tillat gradvis flere mellomliggende noder.", "Allow gradually more intermediate vertices."),
      t("Velg alltid nærmeste ubesøkte node.", "Always choose the nearest unvisited vertex."),
      t("Utfør BFS fra hver node.", "Run BFS from every vertex."),
    ],
    correct: 0,
    explanation: t("Lag k spør om korteste vei når bare noder 1..k kan være mellomliggende.", "Layer k asks for shortest paths when only vertices 1..k may be intermediate."),
  },
  {
    id: "q12",
    lectureId: "l12",
    kind: "multiple-choice",
    prompt: t("Hva beskriver restnettet?", "What does the residual network describe?"),
    choices: [
      t("Hvor flyt kan økes eller oppheves gitt dagens flyt.", "Where flow can be increased or canceled given the current flow."),
      t("Bare kantene som aldri har hatt flyt.", "Only edges that never had flow."),
      t("Et minimalt spenntrær i flytnettet.", "A minimum spanning tree in the flow network."),
    ],
    correct: 0,
    explanation: t("Bakoverkanter representerer muligheten til å angre eller flytte tidligere flyt.", "Backward edges represent the ability to undo or reroute previous flow."),
  },
  {
    id: "q13",
    lectureId: "l13",
    kind: "multiple-choice",
    prompt: t("Hvordan viser man typisk at et problem X er NP-hardt?", "How do you typically show a problem X is NP-hard?"),
    choices: [
      t("Reduser fra et kjent NP-hardt problem til X.", "Reduce from a known NP-hard problem to X."),
      t("Reduser fra X til et lett problem.", "Reduce from X to an easy problem."),
      t("Vis at X har en rask verifikator alene.", "Show that X has a fast verifier alone."),
    ],
    correct: 0,
    explanation: t("Da ville en effektiv løsning på X også løst det kjente vanskelige problemet.", "Then an efficient solution to X would also solve the known hard problem."),
  },
  {
    id: "q14",
    lectureId: "l14",
    kind: "multiple-choice",
    prompt: t("Hva må med for å vise at et beslutningsproblem er NP-komplett?", "What must be included to show a decision problem is NP-complete?"),
    choices: [
      t("Vis at det er i NP og at det er NP-hardt.", "Show it is in NP and NP-hard."),
      t("Vis bare at det ikke er i P.", "Only show it is not in P."),
      t("Vis at det har en grådig algoritme.", "Show it has a greedy algorithm."),
    ],
    correct: 0,
    explanation: t("NP-kompletthet kombinerer medlemskap i NP med hardhet for hele NP.", "NP-completeness combines membership in NP with hardness for all of NP."),
  },
];

const plannedTools = [
  { id: "merge-sort", lectureId: "l03", title: t("Merge Sort", "Merge Sort"), type: "planned", conceptIds: ["divide-and-conquer", "recurrence"] },
  { id: "recursion-tree", lectureId: "l03", title: t("Rekursjonstrær", "Recursion trees"), type: "planned", conceptIds: ["recurrence"] },
  { id: "counting-radix", lectureId: "l04", title: t("Counting/Radix Sort", "Counting/Radix Sort"), type: "planned", conceptIds: ["stable-sort"] },
  { id: "heap-priority-queue", lectureId: "l05", title: t("Haug og prioritetskø", "Heap and priority queue"), type: "planned", conceptIds: ["heap"] },
  { id: "binary-search-tree", lectureId: "l05", title: t("Binært søketre", "Binary search tree"), type: "planned", conceptIds: ["bst"] },
  { id: "dp-table", lectureId: "l06", title: t("DP-tabeller", "DP tables"), type: "planned", conceptIds: ["dynamic-programming"] },
  { id: "activity-selection", lectureId: "l07", title: t("Aktivitetsutvelgelse", "Activity selection"), type: "planned", conceptIds: ["greedy-choice"] },
  { id: "bfs", lectureId: "l08", title: t("BFS – breddeførst søk", "BFS – breadth-first search"), type: "planned", conceptIds: ["bfs", "graph-traversal"] },
  { id: "dfs", lectureId: "l08", title: t("DFS – dybdeførst søk", "DFS – depth-first search"), type: "planned", conceptIds: ["dfs", "graph-traversal"] },
  { id: "mst-kruskal", lectureId: "l09", title: t("Kruskal MST", "Kruskal MST"), type: "planned", conceptIds: ["mst", "disjoint-set"] },
  { id: "dijkstra", lectureId: "l10", title: t("Dijkstra", "Dijkstra"), type: "planned", conceptIds: ["relaxation", "dijkstra"] },
  { id: "floyd-warshall", lectureId: "l11", title: t("Floyd-Warshall", "Floyd-Warshall"), type: "planned", conceptIds: ["apsp"] },
  { id: "max-flow", lectureId: "l12", title: t("Ford-Fulkerson", "Ford-Fulkerson"), type: "planned", conceptIds: ["max-flow", "residual-network"] },
  { id: "np-reductions", lectureId: "l13", title: t("NP-reduksjoner", "NP reductions"), type: "planned", conceptIds: ["np-completeness", "karp-reduction"] },
];

const globalLearningGoals = [
  { id: "Z1", text: t("Kjenn formell problemdefinisjon for hver algoritme.", "Know the formal problem definition for each algorithm.") },
  { id: "Z2", text: t("Kjenn tilleggskrav for korrekthet.", "Know extra requirements for correctness.") },
  { id: "Z3", text: t("Utfør algoritmen trinn for trinn.", "Execute the algorithm step by step.") },
  { id: "Z4", focus: true, text: t("Forklar korrekthetsbeviset.", "Explain the correctness proof.") },
  { id: "Z5", text: t("Kjenn styrker og svakheter.", "Know strengths and weaknesses.") },
  { id: "Z6", text: t("Kjenn kjøretider og utregning.", "Know running times and how they are derived.") },
  { id: "Z7", text: t("Forstå operasjonene på datastrukturer.", "Understand operations on data structures.") },
  { id: "Z8", text: t("Forstå minne-representasjon av datastrukturer.", "Understand memory representation of data structures.") },
  { id: "Z9", text: t("Angi presist input for hvert problem.", "Precisely state input for each problem.") },
  { id: "Z10", text: t("Angi presist output og krav til output.", "Precisely state output and its required properties.") },
];

const liveToolsByLecture = {
  l03: ["merge-sort", "recursion-tree"],
  l04: ["counting-radix"],
  l05: ["heap-priority-queue", "binary-search-tree"],
  l06: ["dp-table"],
  l07: ["activity-selection"],
  l08: ["bfs", "dfs"],
  l09: ["mst-kruskal"],
  l10: ["dijkstra"],
  l11: ["floyd-warshall"],
  l12: ["max-flow"],
  l13: ["np-reductions"],
  l14: ["np-reductions"],
};

lectures.forEach((lecture) => {
  const liveIds = liveToolsByLecture[lecture.id] || [];
  lecture.algorithmIds = [...new Set([...(lecture.algorithmIds || []), ...liveIds])];
});

function indexById(items) {
  return items.reduce((acc, item) => {
    acc[item.id] = item;
    return acc;
  }, {});
}

window.AlgViz = window.AlgViz || {};
window.AlgViz.COURSE = {
  title: t("NTNU AlgDat Study Companion", "NTNU AlgDat Study Companion"),
  sourceNote: t(
    "Basert på pensumheftet for Algoritmer og datastrukturer. Forklaringene her er originale studie-notater med CLRS-referanser.",
    "Based on the curriculum booklet for Algorithms and Data Structures. The explanations here are original study notes with CLRS references."
  ),
  lectures,
  glossary,
  quizzes,
  plannedTools,
  globalLearningGoals,
  byId: {
    lectures: indexById(lectures),
    glossary: indexById(glossary),
    quizzes: indexById(quizzes),
    plannedTools: indexById(plannedTools),
  },
};
})();
