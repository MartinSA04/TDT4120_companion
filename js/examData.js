/* global window */
(function () {
window.AlgViz = window.AlgViz || {};
window.AlgViz.EXAMS = [
  {
    "id": "2022-des",
    "title": "19. desember 2022",
    "term": "2022 Des",
    "problemPdf": "https://algdat.idi.ntnu.no/arkiv/2022.des.tdt4120.oppg.no.pdf",
    "solutionPdf": "https://algdat.idi.ntnu.no/arkiv/2022.des.tdt4120.losn.no.pdf",
    "tasks": [
      {
        "id": "2022-des-01",
        "number": 1,
        "title": "Hva er kjøretiden til Dijkstra med en binærhaug som prioritetskø?",
        "prompt": "1   Hva er kjøretiden til Dijkstra med en binærhaug som prioritetskø?\n    Oppgi svaret i O-notasjon. Du kan anta |E| = Ω(V).",
        "solution": "1   Hva er kjøretiden til Dijkstra med en binærhaug som prioritetskø?\n    Oppgi svaret i O-notasjon. Du kan anta |E| = Ω(V).\n\n      O(E lg V)\n      Relevante læringsmål: Forstå Dijkstra; kjenne kjøretiden under ulike om-\n      stendigheter, og forstå utregningen.",
        "problemPage": 1,
        "solutionPage": 1
      },
      {
        "id": "2022-des-02",
        "number": 2,
        "title": "Q = ⟨0, 0, 0, 0, 0, 0, 0, 0, 0, 0⟩ er en tabell brukt til å implementere en FIFO-kø.",
        "prompt": "2   Q = ⟨0, 0, 0, 0, 0, 0, 0, 0, 0, 0⟩ er en tabell brukt til å implementere en FIFO-kø.\n    Utfør følgende prosedyre.\n\n     1   Q.head = 1\n     2   Q.tail = 2\n     3   Enqueue(Q, 1)\n     4   Enqueue(Q, 2)\n     5   Q.head = 9\n     6   Q.tail = 10\n     7   Enqueue(Q, 3)\n     8   Enqueue(Q, 4)\n\n    Hvordan ser Q ut etterpå?",
        "solution": "2   Q = ⟨0, 0, 0, 0, 0, 0, 0, 0, 0, 0⟩ er en tabell brukt til å implementere en FIFO-kø.\n    Utfør følgende prosedyre.\n\n     1   Q.head = 1\n     2   Q.tail = 2\n     3   Enqueue(Q, 1)\n     4   Enqueue(Q, 2)\n     5   Q.head = 9\n     6   Q.tail = 10\n     7   Enqueue(Q, 3)\n     8   Enqueue(Q, 4)\n\n    Hvordan ser Q ut etterpå?\n\n      Q = ⟨4, 1, 2, 0, 0, 0, 0, 0, 0, 3⟩\n      Her kan man også få noe uttelling om man har byttet om på rollen til head\n      og tail, og satt inn mot venstre, så man ender med ⟨1, 0, 0, 0, 0, 0, 0, 4, 3, 2⟩.\n      Relevant læringsmål: Forstå hvordan køer fungerer (inkl. operasjonene En-\n      queue og Dequeue).",
        "problemPage": 1,
        "solutionPage": 1
      },
      {
        "id": "2022-des-03",
        "number": 3,
        "title": "Hvorfor er ikke memoisering nyttig når man bruker designmetoden splitt og",
        "prompt": "3   Hvorfor er ikke memoisering nyttig når man bruker designmetoden splitt og\n    hersk (divide and conquer)?",
        "solution": "3   Hvorfor er ikke memoisering nyttig når man bruker designmetoden splitt og\n    hersk (divide and conquer)?\n\n     Fordi man ikke har overlappende delproblemer.\n     Dvs., hver delinstans løses maksimalt én gang, så det er ingen gevinst i å\n     mellomlagre løsningen, som man gjør med memoisering.\n     Relevante læringsmål: Forstå designmetoden splitt og hersk; forstå design-\n     metoden dynamisk programmering; forstå hva overlappende delinstanser er; for-\n     stå løsning ved memoisering.",
        "problemPage": 1,
        "solutionPage": 2
      },
      {
        "id": "2022-des-04",
        "number": 4,
        "title": "Hva brukes kjeding (chaining) til?",
        "prompt": "4   Hva brukes kjeding (chaining) til?\n    Du trenger ikke forklare hvordan det fungerer.",
        "solution": "4   Hva brukes kjeding (chaining) til?\n    Du trenger ikke forklare hvordan det fungerer.\n\n     Til å håndtere kollisjoner i hashtabeller.\n     Relevant læringsmål: Forstå konfliktløsing ved kjeding (chaining).",
        "problemPage": 1,
        "solutionPage": 2
      },
      {
        "id": "2022-des-05",
        "number": 5,
        "title": "Gi nedre og øvre asymptotiske grenser for uttrykket n + Θ(n2 ) + O(n3 ).",
        "prompt": "5   Gi nedre og øvre asymptotiske grenser for uttrykket n + Θ(n2 ) + O(n3 ).",
        "solution": "5   Gi nedre og øvre asymptotiske grenser for uttrykket n + Θ(n2 ) + O(n3 ).\n\n      Ω(n2 ) og O(n3 )\n     Relevant læringsmål: Kunne definere asymptotisk notasjon, O, Ω, Θ, o og ω.",
        "problemPage": 1,
        "solutionPage": 2
      },
      {
        "id": "2022-des-06",
        "number": 6,
        "title": "Forenkle uttrykket Ω(n + Θ(n2 ) + O(n3 )).",
        "prompt": "6   Forenkle uttrykket Ω(n + Θ(n2 ) + O(n3 )).",
        "solution": "6   Forenkle uttrykket Ω(n + Θ(n2 ) + O(n3 )).\n\n      Ω ( n2 )\n     Relevant læringsmål: Kunne definere asymptotisk notasjon, O, Ω, Θ, o og ω.",
        "problemPage": 1,
        "solutionPage": 2
      },
      {
        "id": "2022-des-07",
        "number": 7,
        "title": "Løs rekurrensen T(n) = 4T(n/2) + n2 lg n. Uttrykk svaret med Θ-notasjon.",
        "prompt": "7   Løs rekurrensen T(n) = 4T(n/2) + n2 lg n. Uttrykk svaret med Θ-notasjon.",
        "solution": "7   Løs rekurrensen T(n) = 4T(n/2) + n2 lg n. Uttrykk svaret med Θ-notasjon.\n\n      Θ(n2 lg2 n)\n     Her kan man bruke tilfelle 2 av masterteoremet.\n     Relevant læringsmål: Kunne løse rekurrenser med substitusjon, rekursjons-\n     trær, masterteoremet og iterasjonsmetoden.",
        "problemPage": 1,
        "solutionPage": 2
      },
      {
        "id": "2022-des-08",
        "number": 8,
        "title": "Start med et tomt binært søketre, og sett så inn følgende verdier, i rekkefølge,",
        "prompt": "8    Start med et tomt binært søketre, og sett så inn følgende verdier, i rekkefølge,\n     med Tree-Insert:\n     ⟨7, 1, 0, 5, 4, 8, 3, 2, 9, 6⟩\n     Utfør deretter Inorder-Tree-Walk på rotnoden i det resulterende treet. Hva\n     skriver algoritmen ut?\n     Du skal her kun svare med output fra algoritmen.",
        "solution": "8    Start med et tomt binært søketre, og sett så inn følgende verdier, i rekkefølge,\n     med Tree-Insert:\n     ⟨7, 1, 0, 5, 4, 8, 3, 2, 9, 6⟩\n     Utfør deretter Inorder-Tree-Walk på rotnoden i det resulterende treet. Hva\n     skriver algoritmen ut?\n     Du skal her kun svare med output fra algoritmen.\n\n       Her vil man naturligvis få rett svar om man eksplisitt utfører algoritmene\n       som anvist, men om man har forstått at en inorder-traversering av et binært\n       søketre alltid besøker nodene i sortert rekkefølge, kan man her også finne\n       svaret direkte.\n       Relevant læringsmål: Forstå hvordan binære søketrær fungerer (inkl. opera-\n       sjonene Tree-Insert og Inorder-Tree-Walk).",
        "problemPage": 2,
        "solutionPage": 3
      },
      {
        "id": "2022-des-09",
        "number": 9,
        "title": "Følgende matrise er vektmatrisen til en vektet, rettet graf:",
        "prompt": "9    Følgende matrise er vektmatrisen til en vektet, rettet graf:\n\n                                              1   2       3   4\n\n                                          1   0   8 ∞ 2\n                                          2   1   0       5   1\n                                      W\n                                          3   7 ∞ 0           1\n                                          4   5   8       6   0\n\n                                                      (2)\n     Utfør Slow-APSP på grafen. Hva blir l3,1 ?",
        "solution": "9    Følgende matrise er vektmatrisen til en vektet, rettet graf:\n\n                                              1   2       3   4\n\n                                          1   0   8 ∞ 2\n                                          2   1   0       5   1\n                                      W\n                                          3   7 ∞ 0           1\n                                          4   5   8       6   0\n\n                                                      (2)\n     Utfør Slow-APSP på grafen. Hva blir l3,1 ?\n\n       Relevant læringsmål: Forstå Slow-APSP; vite hvordan den oppfører seg;\n       kunne utføre algoritmen, trinn for trinn.",
        "problemPage": 2,
        "solutionPage": 3
      },
      {
        "id": "2022-des-10",
        "number": 10,
        "title": "Anta at du legger inn en sjekk i Bellman-Ford som avslutter algoritmen der-",
        "prompt": "10   Anta at du legger inn en sjekk i Bellman-Ford som avslutter algoritmen der-\n     som ingen avstandsestimater endrer seg i løpet av en iterasjon. Hva blir da den\n     totale kjøretiden, i beste tilfelle, om du antar at det finnes stier fra startnoden til\n     alle andre? Forklar kort.",
        "solution": "10   Anta at du legger inn en sjekk i Bellman-Ford som avslutter algoritmen der-\n     som ingen avstandsestimater endrer seg i løpet av en iterasjon. Hva blir da den\n     totale kjøretiden, i beste tilfelle, om du antar at det finnes stier fra startnoden til\n     alle andre? Forklar kort.\n\n       Selv om vi kan nå frem til alle nodene, kan vi ende med at alle får rett av-\n       stand etter én iterasjon, så kjøretiden i beste tilfelle blir Θ(V + E), som i\n       dette tilfellet kan forenkles til Θ(E).\n       Relevant læringsmål: Forstå Bellman-Ford; kjenne kjøretiden under ulike\n       omstendigheter, og forstå utregningen.",
        "problemPage": 2,
        "solutionPage": 3
      },
      {
        "id": "2022-des-11",
        "number": 11,
        "title": "Hva er det minste og største antallet elementer i en binærhaug med høyde h?",
        "prompt": "11   Hva er det minste og største antallet elementer i en binærhaug med høyde h?",
        "solution": "11   Hva er det minste og største antallet elementer i en binærhaug med høyde h?\n\n      2h og 2h+1 − 1\n      2h−1 og 2h − 1 gis også full uttelling.\n      Om haugen er full, er dette summen 1 + 2 + 4 + · · · + 2h , som er 2h+1 − 1.\n      Det minste vi kan ha er én mer enn en full haug av høyde h − 1, som altså\n      blir 2h .\n      Om man her har brukt gal definisjon av høyde, og telt antall nivåer med\n      noder i stedet for lengste sti fra rot til løvnoder, vil man få 2h−1 og 2h − 1.\n      Siden poenget med oppgaven ikke var å teste bruk av riktig definisjon her,\n      vil dette også gi full uttelling.\n      Dette er oppgave 6.1-1 fra læreboka.\n      Relevant læringsmål: Forstå hvordan hauger fungerer.",
        "problemPage": 2,
        "solutionPage": 4
      },
      {
        "id": "2022-des-12",
        "number": 12,
        "title": "Hva sier heltallsteoremet (the integrality theorem)? Forklar kort med egne ord.",
        "prompt": "12   Hva sier heltallsteoremet (the integrality theorem)? Forklar kort med egne ord.",
        "solution": "12   Hva sier heltallsteoremet (the integrality theorem)? Forklar kort med egne ord.\n\n      Hvis vi har heltallskapasiteter, vil flyten funnet av Ford-Fulkerson-metoden\n      være heltallig.\n      Her kan man ev. også presisere at f (u, v) er heltallig for hvert nodepar u, v,\n      og at summen | f | også er et heltall.\n      Relevant læringsmål: Forstå heltallsteoremet.",
        "problemPage": 2,
        "solutionPage": 4
      },
      {
        "id": "2022-des-13",
        "number": 13,
        "title": "Hva er restkapasitet (residual capacity) og hvordan regner man det ut? Forklar",
        "prompt": "13   Hva er restkapasitet (residual capacity) og hvordan regner man det ut? Forklar\n     kort.",
        "solution": "13   Hva er restkapasitet (residual capacity) og hvordan regner man det ut? Forklar\n     kort.\n\n      Det er den gjenværende kapasiteten til en kant i et flytnett. For en kant\n      (u, v) med flyt f (u, v) er restkapasiteten c f (u, v) hvor mye som gjenstår, alt-\n      så c(u, v) − f (u, v), mens c f (v, u) er hvor mye vi kan oppheve, altså f (u, v).\n      Det er altså snakk om kapasiteten i restnettet/residualnettverket. Strengt\n      tatt har vi også kapasitet og restkapasitet mellom noder der det ikke finnes\n      noen kant, men denne er alltid 0.\n      Relevant læringsmål: Kunne definere restnettet til et flytnett med en gitt\n      flyt.",
        "problemPage": 2,
        "solutionPage": 4
      },
      {
        "id": "2022-des-14",
        "number": 14,
        "title": "Din venn Smartnes mener at grafisomorfi er minst like vanskelig som faktorise-",
        "prompt": "14   Din venn Smartnes mener at grafisomorfi er minst like vanskelig som faktorise-\n     ring. For å etablere dette tenker hun å vise at en løsning på det ene problemet\n     kan, med litt ekstra beregning, brukes til å løse det andre. Forklar hvilket pro-\n     blem sin løsning som i så fall må kunne brukes på det andre problemet, og\n     hvorfor det fører til den ønskede konklusjonen.\n\n      Algoritme 1 Lurviks versjon av randomized select\n      Randomized-Select(A, p, r, i )\n      1 if r ⩽ p\n      2       return A[ p]\n      3 q = Randomized-Partition(A, p, r )\n      4 k =q−p+1\n      5 if i == k\n      6       return A[q]\n      7 elseif i < k\n      8       Randomized-Select(A, p, q − 1, i )\n      9       Randomized-Select(A, q + 1, r, i − k )",
        "solution": "14   Din venn Smartnes mener at grafisomorfi er minst like vanskelig som faktorise-\n     ring. For å etablere dette tenker hun å vise at en løsning på det ene problemet\n     kan, med litt ekstra beregning, brukes til å løse det andre. Forklar hvilket pro-\n     blem sin løsning som i så fall må kunne brukes på det andre problemet, og\n     hvorfor det fører til den ønskede konklusjonen.\n\n      Lurvik må vise at man kan bruke en tenkt løsning på grafisomorfiproblemet\n      til å løse faktoriseringsproblemet, dvs., redusere fra faktorisering til grafiso-\n      morfi. Så lenge reduksjonen ikke innebærer mye ekstra arbeid, betyr det at\n      hvis man kan løse grafisomorfi, så kan man løse faktorisering (f.eks. i poly-\n      nomisk tid), men ikke nødvendigvis omvendt; altså vil man ha etablert at\n      grafisomorfi er minst like vanskelig som faktorisering.\n      Om vi skriver G for grafisomorfi og F for faktorisering, og vi bruker redu-\n      sibilitetsreduksjonen ⩽P , betyr altså F ⩽P G at F kan reduseres til G i poly-\n      nomisk tid, og indikerer at G er minst like vanskelig som F (mtp. løsbarhet\n      i polynomisk tid). Andre typer reduksjoner kan gi andre betydninger av\n      «vanskelig»; det er det generelle poenget, og spesielt reduksjonsretningen,\n      vi er ute etter her.\n      Relevant læringsmål: Forstå redusibilitets-relasjonen ⩽P .\n\n      Algoritme 1 Lurviks versjon av randomized select\n      Randomized-Select(A, p, r, i )\n      1 if r ⩽ p\n      2       return A[ p]\n      3 q = Randomized-Partition(A, p, r )\n      4 k =q−p+1\n      5 if i == k\n      6       return A[q]\n      7 elseif i < k\n      8       Randomized-Select(A, p, q − 1, i )\n      9       Randomized-Select(A, q + 1, r, i − k )",
        "problemPage": 2,
        "solutionPage": 4
      },
      {
        "id": "2022-des-15",
        "number": 15,
        "title": "Din venn Lurvik har prøvd å skrive ned pseudokode for randomized select etter",
        "prompt": "15   Din venn Lurvik har prøvd å skrive ned pseudokode for randomized select etter\n     hukommelsen. Resultatet (algoritme 1) er ikke helt rett. Beskriv hva som må\n     fikses for at algoritmen skal bli korrekt.",
        "solution": "15   Din venn Lurvik har prøvd å skrive ned pseudokode for randomized select etter\n     hukommelsen. Resultatet (algoritme 1) er ikke helt rett. Beskriv hva som må\n     fikses for at algoritmen skal bli korrekt.\n\n      Man må sette return foran kallene til Randomized-Select, og else først på\n      linje 9. Altså:\n\n        8      return Randomized-Select(A, p, q − 1, i )\n        9 else return Randomized-Select(A, q + 1, r, i − k)\n\n      Ev. kan man også korrigere betingelsen på linje 1:\n\n        1 if p == r\n\n      På linje 1 i versjonen i læreboka er sammenligningen p == r, ikke r ⩽ p,\n      men det påvirker ikke oppførselen for den korrigerte algoritmen, siden vi\n      da aldri får r < p. Om man også korrigerer dette, vil det ikke gi noe trekk.\n      Relevant læringsmål: Forstå Randomized-Select.",
        "problemPage": 3,
        "solutionPage": 5
      },
      {
        "id": "2022-des-16",
        "number": 16,
        "title": "Hvilket problem løser algoritme 1, dersom den kalles som følger, der A[1 : n] er",
        "prompt": "16   Hvilket problem løser algoritme 1, dersom den kalles som følger, der A[1 : n] er\n     en tabell med tall?\n\n      Randomized-Select(A, 1, n, 0)\n\n     Forklar kort.",
        "solution": "16   Hvilket problem løser algoritme 1, dersom den kalles som følger, der A[1 : n] er\n     en tabell med tall?\n\n      Randomized-Select(A, 1, n, 0)\n\n     Forklar kort.\n\n       Den vil sortere A. Det ser vi fordi den da vil oppføre seg akkurat som\n       Randomized-Quicksort.\n       Relevant læringsmål: Forstå Randomized-Quicksort.",
        "problemPage": 3,
        "solutionPage": 6
      },
      {
        "id": "2022-des-17",
        "number": 17,
        "title": "Din venn Gløgsund har laget to versjoner av Ford–Fulkerson-metoden der hun",
        "prompt": "17   Din venn Gløgsund har laget to versjoner av Ford–Fulkerson-metoden der hun\n     bruker henholdsvis Dijkstra og Transitive-Closure til å finne forøkende sti-\n     er. Hvilke av disse to metodene vil garantert finne maks-flyt i polynomisk tid?\n     Forklar kort.\n     Anta at w(u, v) = 1 for alle kanter (u, v) i restnettet, og at Gløgsund vedlikehol-\n     der en Π-tabell med forgjengere i Transitive-Closure for å finne de faktiske\n     stiene.",
        "solution": "17   Din venn Gløgsund har laget to versjoner av Ford–Fulkerson-metoden der hun\n     bruker henholdsvis Dijkstra og Transitive-Closure til å finne forøkende sti-\n     er. Hvilke av disse to metodene vil garantert finne maks-flyt i polynomisk tid?\n     Forklar kort.\n     Anta at w(u, v) = 1 for alle kanter (u, v) i restnettet, og at Gløgsund vedlikehol-\n     der en Π-tabell med forgjengere i Transitive-Closure for å finne de faktiske\n     stiene.\n\n       Dijkstra vil finne korteste forøkende sti, og vil dermed gi et polynomisk\n       antall iterasjoner, akkurat som når vi bruker BFS i Edmonds–Karp.\n       Transitive-Closure vil ikke nødvendigvis finne korteste forøkende stier,\n       og vi risikerer å ende med et eksponentielt antall iterasjoner.\n       Man trenger ikke argumentere for at Transitive-Closure faktisk kan vel-\n       ge stier som gir eksponentiell kjøretid. Det sentrale er at argumentet for\n       polynomisk kjøretid for Edmonds–Karp bryter sammen.\n       Man kan også få nesten full uttelling om man ikke nevner Transitive-\n       Closure, om det kommer tydelig frem at man implisitt mener den vil gi\n       galt svar fordi stiene den finner ikke nødvendigvis er kortest mulig.\n       Relevant læringsmål: Forstå Ford-Fulkerson; forstå BFS; forstå Dijkstra;\n       forstå Transitive-Closure.",
        "problemPage": 3,
        "solutionPage": 6
      },
      {
        "id": "2022-des-18",
        "number": 18,
        "title": "Vi sier at en kvinne og en mann er ment for hverandre om de ender opp sammen i",
        "prompt": "18   Vi sier at en kvinne og en mann er ment for hverandre om de ender opp sammen i\n     alle mulige stabile matchinger. Konstruer en effektiv algoritme som bestemmer\n     om en kvinne og en mann er ment for hverandre.",
        "solution": "18   Vi sier at en kvinne og en mann er ment for hverandre om de ender opp sammen i\n     alle mulige stabile matchinger. Konstruer en effektiv algoritme som bestemmer\n     om en kvinne og en mann er ment for hverandre.\n\n       Kjør både kvinne- og manns-orientert Gale-Shapley, og se om noen match-\n       es i begge tilfeller. De er da hverandres beste og verste partner over alle\n       stabile matchinger, og er dermed ment for hverandre.\n       Relevant læringsmål: Forstå Gale-Shapley; kunne konstruere nye effekti-\n       ve algoritmer.",
        "problemPage": 3,
        "solutionPage": 6
      },
      {
        "id": "2022-des-19",
        "number": 19,
        "title": "Hvordan kan vi løse delsumproblemet (the subset-sum problem) i polynomisk tid",
        "prompt": "19   Hvordan kan vi løse delsumproblemet (the subset-sum problem) i polynomisk tid\n     hvis den ønskede delsummen (target) er oppgitt i entallssystemet?\n     I entallssystemet representeres k som en streng 111 · · · 1 av lengde k.",
        "solution": "19   Hvordan kan vi løse delsumproblemet (the subset-sum problem) i polynomisk tid\n     hvis den ønskede delsummen (target) er oppgitt i entallssystemet?\n     I entallssystemet representeres k som en streng 111 · · · 1 av lengde k.\n\n       Løses som det binære ryggsekkproblemet (0-1 knapsack), der vekt er lik ver-\n       di, og kapasiteten settes til den ønskede delsummen. Svaret er “ja” hvis og\n       bare hvis vi får fylt opp ryggsekken helt.\n       Siden kjøretiden er O(nW), og antall bits i input er Ω(nW), så er kjøretiden\n       polynomisk.\n       Dette er oppgave 34.5-3 fra læreboka.\n       Relevant læringsmål: Forstå løsningen på det binære ryggsekkproblemet; for-\n       stå hvorfor løsningen på det binære ryggsekkproblemet ikke er polyno-\n       misk; forstå definisjonen av klassen P; kjenne det NP-komplette problemet\n       SUBSET-SUM.",
        "problemPage": 3,
        "solutionPage": 7
      },
      {
        "id": "2022-des-20",
        "number": 20,
        "title": "Et kongerike består av flere regioner. Kongen ønsker å bygge en mur som går",
        "prompt": "20   Et kongerike består av flere regioner. Kongen ønsker å bygge en mur som går\n     rundt én eller flere av regionene, inkludert den som inneholder det kongelige\n     slott. Byggekostnadene varierer med terrenget, og kongen har bedt deg om å\n     finne den billigste løsningen. Hvordan vil du gå frem?\n     Du kan anta at muren følger regiongrenser.",
        "solution": "20   Et kongerike består av flere regioner. Kongen ønsker å bygge en mur som går\n     rundt én eller flere av regionene, inkludert den som inneholder det kongelige\n     slott. Byggekostnadene varierer med terrenget, og kongen har bedt deg om å\n     finne den billigste løsningen. Hvordan vil du gå frem?\n     Du kan anta at muren følger regiongrenser.\n\n       Lag en graf med hver region, inkl. utlandet, som en node, og med en kant\n       over hver grense, med kapasitet lik kostnaden ved å bygge langs grensen.\n       Finn så et minimalt snitt mellom slottet og utlandet, ved hjelp av Ford-\n       Fulkerson (spesifikt, Edmonds–Karp-algoritmen).\n       Her kan man forstå oppgavebeskrivelsen på litt ulike måter. F.eks. er det\n       ikke sikkert man ser på det som et krav at det skal være én ringmur, men\n       at området den omslutter kan deles opp av mindre murer, etc. Men siden\n       man skal gjøre det billigst mulig, vil den billigste løsningen likevel være å\n       unngå dette.\n       Man kan også tolke det som at man har oppgitt én eller flere regioner som\n       skal omsluttes. Siden det er snakk om én mur, må det likevel løses på en\n       måte som minner om den i løsningsforslaget, bare at man kan innføre en\n       superkilde, og koble til alle disse regionene med kanter som har uendelig\n       høy kapasitet (så alle havner på kilde-siden av snittet).\n       Om man her heller bruker en graf der grensene er kanter (dvs., den duale\n       grafen av det som brukes i løsningen over), og prøver å finne den korteste\n       sykelen rundt slottet, kan det også gi uttelling, selv om det kan være utford-\n       rende å finne en algoritme som gir riktig svar, dvs., å ikke bare finne den\n       billigste sykelen, men den billigste som omslutter slottet.\n       Relevant læringsmå …",
        "problemPage": 3,
        "solutionPage": 7
      }
    ]
  },
  {
    "id": "2023-aug",
    "title": "5. august 2023",
    "term": "2023 Aug",
    "problemPdf": "https://algdat.idi.ntnu.no/arkiv/2023.aug.tdt4120.oppg.no.pdf",
    "solutionPdf": "https://algdat.idi.ntnu.no/arkiv/2023.aug.tdt4120.losn.no.pdf",
    "tasks": [
      {
        "id": "2023-aug-01",
        "number": 1,
        "title": "Algoritme 1 sorterer tabellen A[1 : n]. Hva er kjøretiden, som funksjon av n?",
        "prompt": "5%   1   Algoritme 1 sorterer tabellen A[1 : n]. Hva er kjøretiden, som funksjon av n?\n         Oppgi svaret i asymptotisk notasjon.",
        "solution": "5%   1   Algoritme 1 sorterer tabellen A[1 : n]. Hva er kjøretiden, som funksjon av n?\n         Oppgi svaret i asymptotisk notasjon.\n\n           Θ ( n2 )\n          Algoritmen er hentet fra https://arxiv.org/abs/2110.01111.\n          Relevant læringsmål: Kunne analysere algoritmers effektivitet; kunne de-\n          finere asymptotisk notasjon (Θ).",
        "problemPage": 1,
        "solutionPage": 1
      },
      {
        "id": "2023-aug-02",
        "number": 2,
        "title": "Hva er et spenntre?",
        "prompt": "5%   2   Hva er et spenntre?\n         Det trenger ikke være minimalt.",
        "solution": "5%   2   Hva er et spenntre?\n         Det trenger ikke være minimalt.\n\n          Det er et tre som består av kanter fra en gitt graf, og som inneholder alle\n          nodene i grafen.\n          Her tillates mange ulike forklaringer, så lenge man får frem poenget. Om\n          man kun oppgir at det er et tre som kobler sammen nodene, uten å oppgi\n          at kantene i treet hentes fra grafen, gir dette 4 poeng.\n\n          Algoritme 1\n          Fung-Sort(A, n)\n          1 for i = 1 to n\n          2       for j = 1 to n\n          3            if A[i ] < A[ j]\n          4                 swap A[i ] and A[ j]\n\n           Relevant læringsmål: Vite hva spenntrær og minimale spenntrær er.",
        "problemPage": 1,
        "solutionPage": 1
      },
      {
        "id": "2023-aug-03",
        "number": 3,
        "title": "Hvilket problem løser Floyd-Warshall?",
        "prompt": "5%   3   Hvilket problem løser Floyd-Warshall?\n         Her er vi ikke ute etter bare navnet på problemet, men en svært kort beskrivelse\n         av hva problemet er.",
        "solution": "5%   3   Hvilket problem løser Floyd-Warshall?\n         Her er vi ikke ute etter bare navnet på problemet, men en svært kort beskrivelse\n         av hva problemet er.\n\n           Korteste veier, fra alle noder til alle andre, i en vektet, rettet graf.\n           Her kan man godt bruke frasen «fra alle til alle», uten å nevne noder. Man\n           får 4 poeng om man utelater å nevne vekting eller retning, eller begge deler.\n           Det er korrekt, men ikke påkrevd, å også nevne kravet om at grafen ikke\n           har negative sykler. Det er også korrekt, men ikke direkte relevant, å nevne\n           at algoritmen kan modifiseres til å finne transitiv lukning.\n           Relevant læringsmål: Forstå Floyd-Warshall (kjenne den formelle defi-\n           nisjonen av det generelle problemet den løser).",
        "problemPage": 1,
        "solutionPage": 2
      },
      {
        "id": "2023-aug-04",
        "number": 4,
        "title": "Dijkstra velger en node i hver iterasjon. Hvilken?",
        "prompt": "5%   4   Dijkstra velger en node i hver iterasjon. Hvilken?",
        "solution": "5%   4   Dijkstra velger en node i hver iterasjon. Hvilken?\n\n           Den med lavest avstandsestimat, v.d.\n           Teknisk sett en av dem med lavest avstandsestimat, og hvilken av dem som\n           velges er en implementasjonsdetalj. Det er selvfølgelig også korrekt å spe-\n           sifisere at det er en av de gjenværende nodene som velges.\n           Relevant læringsmål: Forstå Dijkstra (vite hvordan den oppfører seg;\n           kunne utføre algoritmen, trinn for trinn).",
        "problemPage": 1,
        "solutionPage": 2
      },
      {
        "id": "2023-aug-05",
        "number": 5,
        "title": "Tellesortering (counting sort) har bedre kjøretid enn f.eks. flettesortering (merge",
        "prompt": "5%   5   Tellesortering (counting sort) har bedre kjøretid enn f.eks. flettesortering (merge\n         sort). Hva er det vi krever av input til tellesortering som gjør dette mulig?",
        "solution": "5%   5   Tellesortering (counting sort) har bedre kjøretid enn f.eks. flettesortering (merge\n         sort). Hva er det vi krever av input til tellesortering som gjør dette mulig?\n\n           Elementene i input-tabellen må være heltall i et lite verdiområde.\n           Her er det også akseptabelt om man oppgir at verdiområdet må ha konstant\n           størrelse eller at størrelsen k er O(n). Det er også korrekt å si at k = o (n lg n)\n           vil gjøre tellesortering raskere.\n           Relevant læringsmål: Forstå Counting-Sort (kjenne til eventuelle til-\n           leggskrav den stiller for å være korrekt; kjenne til eventuelle styrker eller\n           svakheter, sammenlignet med andre).",
        "problemPage": 1,
        "solutionPage": 2
      },
      {
        "id": "2023-aug-06",
        "number": 6,
        "title": "Hva er konsekvensen av å finne en polynomisk algoritme for et problem i NPC?",
        "prompt": "5%   6   Hva er konsekvensen av å finne en polynomisk algoritme for et problem i NPC?",
        "solution": "5%   6   Hva er konsekvensen av å finne en polynomisk algoritme for et problem i NPC?\n\n           P = NP, dvs., alle problemer i NP kan løses i polynomisk tid.\n           Relevante læringsmål: Forstå definisjonen av klassene P og NP; forstå de-\n           finisjonen av NP-kompletthet.",
        "problemPage": 1,
        "solutionPage": 3
      },
      {
        "id": "2023-aug-07",
        "number": 7,
        "title": "Dine venner Lurvik og Smartnes har laget hver sin sorteringsalgoritme, som",
        "prompt": "5%   7   Dine venner Lurvik og Smartnes har laget hver sin sorteringsalgoritme, som\n         rett og slett utfører to andre sorteringsalgoritmer etter hverandre:\n\n          Lurvik-Sort(A, n)                            Smartnes-Sort(A, n)\n          1 Insertion-Sort(A, n)                       1 Merge-Sort(A, 1, n)\n          2 Merge-Sort(A, 1, n)                        2 Insertion-Sort(A, n)\n\n         Hvilken av dem har best kjøretid i verste tilfelle? Forklar kort.\n\n          Algoritme 1\n          Fung-Sort(A, n)\n          1 for i = 1 to n\n          2       for j = 1 to n\n          3            if A[i ] < A[ j]\n          4                 swap A[i ] and A[ j]",
        "solution": "5%   7   Dine venner Lurvik og Smartnes har laget hver sin sorteringsalgoritme, som\n         rett og slett utfører to andre sorteringsalgoritmer etter hverandre:\n\n          Lurvik-Sort(A, n)                          Smartnes-Sort(A, n)\n          1 Insertion-Sort(A, n)                     1 Merge-Sort(A, 1, n)\n          2 Merge-Sort(A, 1, n)                      2 Insertion-Sort(A, n)\n\n         Hvilken av dem har best kjøretid i verste tilfelle? Forklar kort.\n\n           Smartnes-Sort blir best, siden Merge-Sort uansett har kjøretid Θ(n lg n),\n           og når den kjøres først, får Insertion-Sort kjøretid Θ(n), totalt Θ(n lg n).\n           Om Insertion-Sort kjøres først, risikerer vi Θ(n2 ) + Θ(n lg n) = Θ(n2 ).\n           En kortere forklaring kan her gi full uttelling.\n           Relevante læringsmål: Forstå Insertion-Sort og Merge-Sort (kjenne\n           kjøretidene under ulike omstendigheter, og forstå utregningen).",
        "problemPage": 1,
        "solutionPage": 3
      },
      {
        "id": "2023-aug-08",
        "number": 8,
        "title": "Lurvik og Smartnes skal på togferie. Det går direktetog mellom mange av byene",
        "prompt": "5%   8   Lurvik og Smartnes skal på togferie. Det går direktetog mellom mange av byene\n         de skal besøke, og Lurvik vil finne en rute som går innom hver by nøyaktig én\n         gang, om mulig. Smartnes mener det er urealistisk. Hva mener du?\n         Det er her snakk om å lage en effektiv algoritme for å løse problemet generelt.",
        "solution": "5%   8   Lurvik og Smartnes skal på togferie. Det går direktetog mellom mange av byene\n         de skal besøke, og Lurvik vil finne en rute som går innom hver by nøyaktig én\n         gang, om mulig. Smartnes mener det er urealistisk. Hva mener du?\n         Det er her snakk om å lage en effektiv algoritme for å løse problemet generelt.\n\n           En slik algoritme ville kunne løse HAM-CYCLE-problemet, så det er neppe\n           realistisk.\n           Forklaringer om at en polynomisk algoritme vil medføre at P = NP, og lig-\n           nende, eller svar som påpeker at problemet er NP-hardt/NP-komplett er\n           også korrekte. Man bør spesifikt nevne hamiltonsykelproblemet (eller ev.\n           redusere fra et annet NP-hardt problem) for å få full uttelling. Om forkla-\n           ringen innebærer en reduksjon til et annet NP-hardt problem, vil det gi lite\n           eller ingen uttelling.\n           Relevante læringsmål: Kjenne det NP-komplette problemet HAM-CYCLE\n           (kunne angi presist hva input er; kunne angi presist hva output er og\n           hvilke egenskaper det må ha); være i stand til å konstruere enkle NP-\n           kompletthetsbevis.",
        "problemPage": 2,
        "solutionPage": 3
      },
      {
        "id": "2023-aug-09",
        "number": 9,
        "title": "Du skal finne et passord som består av n tegn fra et alfabet av størrelse k. Du",
        "prompt": "5%   9   Du skal finne et passord som består av n tegn fra et alfabet av størrelse k. Du\n         prøver ett og ett passord (brute force). Hvor mange passord må du prøve før du\n         finner det rette? Oppgi svaret i asymptotisk notasjon.\n         Du kan anta at du kjenner både n og k.",
        "solution": "5%   9   Du skal finne et passord som består av n tegn fra et alfabet av størrelse k. Du\n         prøver ett og ett passord (brute force). Hvor mange passord må du prøve før du\n         finner det rette? Oppgi svaret i asymptotisk notasjon.\n         Du kan anta at du kjenner både n og k.\n\n          O( k n )\n          Her får man også full uttelling om man skriver Θ(kn ), selv om det ikke er\n          helt riktig.\n          Relevante læringsmål: Kunne analysere algoritmers effektivitet; kunne de-\n          finere asymptotisk notasjon (O).",
        "problemPage": 2,
        "solutionPage": 4
      },
      {
        "id": "2023-aug-10",
        "number": 10,
        "title": "Tre menn (Lurvik, Smartnes og Visdal) og tre kvinner (Gløgsund, Klokland og",
        "prompt": "5 % 10   Tre menn (Lurvik, Smartnes og Visdal) og tre kvinner (Gløgsund, Klokland og\n         Flinckenhagen) har følgende preferanser:\n\n          Lurvik:            Gløgsund, Flinckenhagen, Klokland\n          Smartnes:          Gløgsund, Klokland, Flinckenhagen\n          Visdal:            Klokland, Flinckenhagen, Gløgsund\n\n          Gløgsund:          Lurvik, Smartnes, Visdal\n          Klokland:          Visdal, Smartnes, Lurvik\n          Flinckenhagen:     Lurvik, Smartnes, Visdal\n\n         Lurvik er matchet med Flinckenhagen, Smartnes er matchet med Gløgsund og\n         Visdal er matchet med Klokland. Er matchingen stabil, eller finnes det et blok-\n         kerende par (blocking pair)? Hvem er det, i så fall? Forklar kort.",
        "solution": "5 % 10   Tre menn (Lurvik, Smartnes og Visdal) og tre kvinner (Gløgsund, Klokland og\n         Flinckenhagen) har følgende preferanser:\n\n          Lurvik:           Gløgsund, Flinckenhagen, Klokland\n          Smartnes:         Gløgsund, Klokland, Flinckenhagen\n          Visdal:           Klokland, Flinckenhagen, Gløgsund\n\n          Gløgsund:         Lurvik, Smartnes, Visdal\n          Klokland:         Visdal, Smartnes, Lurvik\n          Flinckenhagen:    Lurvik, Smartnes, Visdal\n\n         Lurvik er matchet med Flinckenhagen, Smartnes er matchet med Gløgsund og\n         Visdal er matchet med Klokland. Er matchingen stabil, eller finnes det et blok-\n         kerende par (blocking pair)? Hvem er det, i så fall? Forklar kort.\n\n          Lurvik og Gløgsund utgjør et blokkerende par, siden de heller vil ha hver-\n          andre enn sine respektive partnere.\n          Relevante læringsmål: Forstå hva en stabil matching (stable matching) er.",
        "problemPage": 2,
        "solutionPage": 4
      },
      {
        "id": "2023-aug-11",
        "number": 11,
        "title": "Det følgende er hentet fra Counting-Sort:",
        "prompt": "5 % 11   Det følgende er hentet fra Counting-Sort:\n\n          11 for j = 1 downto 1\n          12                 = A[ j ]\n          13      C[A[ j]] = C[A[ j]] − 1\n\n         Hva skal den sensurerte biten være?",
        "solution": "5 % 11   Det følgende er hentet fra Counting-Sort:\n\n          11 for j = 1 downto 1\n          12      B[C[A[ j]] = A[ j]\n          13      C[A[ j]] = C[A[ j]] − 1\n\n         Hva skal den sensurerte biten være?\n\n          Se løsning i pseudokoden over.\n          Relevant læringsmål: Forstå Counting-Sort (vite hvordan den oppfører\n          seg; kunne utføre algoritmen, trinn for trinn).",
        "problemPage": 2,
        "solutionPage": 4
      },
      {
        "id": "2023-aug-12",
        "number": 12,
        "title": "Løs følgende rekurrens:",
        "prompt": "5 % 12   Løs følgende rekurrens:\n             T(n) = 2T(n/2) + n/lg n\n         Oppgi svaret med asymptotisk notasjon.",
        "solution": "5 % 12   Løs følgende rekurrens:\n              T(n) = 2T(n/2) + n/lg n\n         Oppgi svaret med asymptotisk notasjon.\n\n           Θ(n lg lg n)\n           Denne rekurrensen er diskutert på s. 105–106 i læreboka, der løsningen også\n           er oppgitt. Den kan også løses med iterasjonsmetoden og substitusjonsme-\n           toden, men det kan være utfordrende.\n           Oppgaven var egentlig ment å løses med masterteoremet, men faller uten-\n           for den varianten av teoremet som brukes i pensum. Derfor tas oppgaven\n           ut av sensur der det er til fordel for kandidaten.\n           Her får man 4 poeng for Θ(n), som er resultatet man får ved å bruke tilfel-\n           le 2 av masterteoremet, altså f (n) = Θ(nlogb a lgk n), for a = b = 2, k = −1.\n           Dette svaret er ikke korrekt, siden dette tilfellet krever k > 0.",
        "problemPage": 2,
        "solutionPage": 5
      },
      {
        "id": "2023-aug-13",
        "number": 13,
        "title": "Tabellen A = ⟨9, 8, 5, 7, 1, 3, 2, 4, 6⟩ representerer en haug. Hvordan ser tabellen",
        "prompt": "5 % 13   Tabellen A = ⟨9, 8, 5, 7, 1, 3, 2, 4, 6⟩ representerer en haug. Hvordan ser tabellen\n         ut etter første iterasjon av Heapsort?\n         Du skal altså utføre den første av n − 1 iterasjoner. Svar ved å liste opp elemen-\n         tene i tabellen. Oppgi hele tabellen, inkludert deler som ikke lenger er en del\n         av haugen.",
        "solution": "5 % 13   Tabellen A = ⟨9, 8, 5, 7, 1, 3, 2, 4, 6⟩ representerer en haug. Hvordan ser tabellen\n         ut etter første iterasjon av Heapsort?\n         Du skal altså utføre den første av n − 1 iterasjoner. Svar ved å liste opp elemen-\n         tene i tabellen. Oppgi hele tabellen, inkludert deler som ikke lenger er en del\n         av haugen.\n\n           8, 7, 5, 6, 1, 3, 2, 4, 9\n           Relevant læringsmål: Forstå Heapsort (vite hvordan den oppfører seg;\n           kunne utføre algoritmen, trinn for trinn).",
        "problemPage": 2,
        "solutionPage": 5
      },
      {
        "id": "2023-aug-14",
        "number": 14,
        "title": "Flytnett (flow networks) kan defineres på litt forskjellige vis, men i versjonen i",
        "prompt": "5 % 14   Flytnett (flow networks) kan defineres på litt forskjellige vis, men i versjonen i\n         pensum tillates ikke antiparallelle kanter (dvs., at man både har en kant fra u\n         til v og en kant fra v til u). Hvor stor begrensning er dette? Forklar kort.",
        "solution": "5 % 14   Flytnett (flow networks) kan defineres på litt forskjellige vis, men i versjonen i\n         pensum tillates ikke antiparallelle kanter (dvs., at man både har en kant fra u\n         til v og en kant fra v til u). Hvor stor begrensning er dette? Forklar kort.\n\n           Det er ikke noen egentlig begrensning. Om vi har et nettverk som har anti-\n           parallelle kanter, kan vi splitte den ene av hvert par med en ny node, og få\n           et ekvivalent nettverk som ikke har det.\n           Relevant læringsmål: Kunne håndtere antiparallelle kanter.",
        "problemPage": 2,
        "solutionPage": 5
      },
      {
        "id": "2023-aug-15",
        "number": 15,
        "title": "Algoritme 2 finner antall mulige permutasjoner av elementene i mengden S,",
        "prompt": "5 % 15   Algoritme 2 finner antall mulige permutasjoner av elementene i mengden S,\n         rekursivt. Hva taler for og imot bruk av memoisering for å optimere den?\n         Du kan f.eks. bruke en hashtabell med mengder som nøkler.\n\n          Algoritme 2\n          Permutations(S)\n          1 if S == ∅\n          2      return 1\n          3 else n = 0\n          4      for each element x ∈ S\n          5           n = n + Permutations(S − { x })\n          6      return n",
        "solution": "5 % 15   Algoritme 2 finner antall mulige permutasjoner av elementene i mengden S,\n         rekursivt. Hva taler for og imot bruk av memoisering for å optimere den?\n         Du kan f.eks. bruke en hashtabell med mengder som nøkler.\n\n          Algoritme 2\n          Permutations(S)\n          1 if S == ∅\n          2      return 1\n          3 else n = 0\n          4      for each element x ∈ S\n          5           n = n + Permutations(S − { x })\n          6      return n\n\n          Her kan mange svar gi uttelling, men hovedargumentet for er at man har\n          overlappende delproblemer og et hovedargument mot er at memo-tabellen\n          blir eksponentielt stor. Man kan naturligvis også oppgi som argument at\n          det finnes atskillig mer effektive løsninger på problemet.\n          Relevante læringsmål: Forstå designmetoden dynamisk programmering; for-\n          stå løsning ved memoisering; forstå hva overlappende delinstanser er; kunne\n          analysere algoritmers effektivitet.",
        "problemPage": 2,
        "solutionPage": 5
      },
      {
        "id": "2023-aug-16",
        "number": 16,
        "title": "Beskriv hvordan du kan bruke rekursjon til å finne avstanden fra startnoden s",
        "prompt": "5 % 16   Beskriv hvordan du kan bruke rekursjon til å finne avstanden fra startnoden s\n         til en gitt node v i en vektet, rettet graf.\n         Merk: Det er forventet at løsningen vil ha eksponentiell kjøretid.\n         Her kan du svare svært kort. Det kreves ingen grundig pseudokode e.l. Du kan\n         anta at det finnes en sti fra s til enhver annen node i grafen.",
        "solution": "5 % 16   Beskriv hvordan du kan bruke rekursjon til å finne avstanden fra startnoden s\n         til en gitt node v i en vektet, rettet graf.\n         Merk: Det er forventet at løsningen vil ha eksponentiell kjøretid.\n         Her kan du svare svært kort. Det kreves ingen grundig pseudokode e.l. Du kan\n         anta at det finnes en sti fra s til enhver annen node i grafen.\n\n          For hver inn-nabo u, finn avstanden rekursivt og legg til vekten w(u, v).\n          Velg så det minste av svarene.\n          Relevant læringsmål: Forstå strukturen til korteste-vei-problemet.",
        "problemPage": 3,
        "solutionPage": 6
      },
      {
        "id": "2023-aug-17",
        "number": 17,
        "title": "Et byggefirma har flere store oppdrag og skal fordele sine ansatte på disse.",
        "prompt": "5 % 17   Et byggefirma har flere store oppdrag og skal fordele sine ansatte på disse.\n         Hvert prosjekt har et sett med roller (tømrer, elektriker, rørlegger, etc.) og et\n         antall som trengs av hver av disse. Hver ansatt er kompetent til å fylle én eller\n         flere slike roller, men kan maksimalt delta i ett prosjekt, og fyller da nøyaktig\n         én rolle. For å holde reiseavstandene nede kan hver ansatt bare bli tilordnet et\n         prosjekt innenfor en gitt avstand fra hjemstedet.\n         Hvordan ville du ha funnet en gyldig fordeling?",
        "solution": "5 % 17   Et byggefirma har flere store oppdrag og skal fordele sine ansatte på disse.\n         Hvert prosjekt har et sett med roller (tømrer, elektriker, rørlegger, etc.) og et\n         antall som trengs av hver av disse. Hver ansatt er kompetent til å fylle én eller\n         flere slike roller, men kan maksimalt delta i ett prosjekt, og fyller da nøyaktig\n         én rolle. For å holde reiseavstandene nede kan hver ansatt bare bli tilordnet et\n         prosjekt innenfor en gitt avstand fra hjemstedet.\n         Hvordan ville du ha funnet en gyldig fordeling?\n\n           Kan løses som et flytproblem, med ansatte, roller (per prosjekt) og prosjek-\n           ter som noder. Kanter fra kilde til ansatte (kapasitet 1), fra ansatte til roller\n           de kan inneha i prosjekter de kan delta i (kapasitet 1), fra roller til tilhørende\n           prosjekter (kapasitet lik antall som trengs) og fra prosjekter til sluk (f.eks.\n           ubegrenset kapasitet).\n           Relevante læringsmål: Være i stand til å konstruere reduksjoner til maks-\n           flyt-problemet; forstå heltallsteoremet (integrality theorem).",
        "problemPage": 3,
        "solutionPage": 6
      },
      {
        "id": "2023-aug-18",
        "number": 18,
        "title": "I beviset for at CIRCUIT-SAT er NP-komplett konstrueres en logisk krets som",
        "prompt": "5 % 18   I beviset for at CIRCUIT-SAT er NP-komplett konstrueres en logisk krets som\n         simulerer en datamaskin som utfører en verifikasjonsalgoritme. Hva er input\n         for denne kretsen?\n         Her trenger du ikke beskrive konstante «inputs», bare dem man står fritt til å\n         settet til 0 eller 1 for å løse oppfyllbarhetsproblemet. Du kan svare svært kort.",
        "solution": "5 % 18   I beviset for at CIRCUIT-SAT er NP-komplett konstrueres en logisk krets som\n         simulerer en datamaskin som utfører en verifikasjonsalgoritme. Hva er input\n         for denne kretsen?\n         Her trenger du ikke beskrive konstante «inputs», bare dem man står fritt til å\n         settet til 0 eller 1 for å løse oppfyllbarhetsproblemet. Du kan svare svært kort.\n\n           Sertifikatet.\n           Poenget er at vi vil avgjøre om det eksisterer et slikt sertifikat y som opp-\n           fyller kretsen, og dermed altså gir A( x, y) = 1.\n           Relevant læringsmål: Forstå beviset for at CIRCUIT-SAT er NP-komplett.",
        "problemPage": 3,
        "solutionPage": 7
      },
      {
        "id": "2023-aug-19",
        "number": 19,
        "title": "Din venn Gløgsund har klart å slette alle mellomrom og all tegnsetting i en",
        "prompt": "5 % 19   Din venn Gløgsund har klart å slette alle mellomrom og all tegnsetting i en\n         avhandling hun skriver på, og hun vil ha din hjelp til å splitte teksten opp i\n         enkelt-ord. Det du har å hjelpe deg med er en liste med gyldige ord, og en\n         oversikt over ord som aldri forekommer ved siden av hverandre. Beskriv en\n         algoritme som løser problemet.\n         Det kan være flere gyldige løsninger. I så fall holder det at du finner én av dem.",
        "solution": "5 % 19   Din venn Gløgsund har klart å slette alle mellomrom og all tegnsetting i en\n         avhandling hun skriver på, og hun vil ha din hjelp til å splitte teksten opp i\n         enkelt-ord. Det du har å hjelpe deg med er en liste med gyldige ord, og en\n         oversikt over ord som aldri forekommer ved siden av hverandre. Beskriv en\n         algoritme som løser problemet.\n         Det kan være flere gyldige løsninger. I så fall holder det at du finner én av dem.\n\n           Prøv hvert mulige ord i starten, og løs resten rekursivt med memoisering.\n           Hopp over delinstanser (rekursive kall) som starter med ord som ikke kan\n           stå ved siden av det første.\n           Problemet ligner på stavkappingsproblemet, det er noen vesentlige for-\n           skjeller, så om man henviser til dette, så må man også forklare hvordan\n           løsningen må modifiseres.\n           Relevante læringsmål: Kunne konstruere nye effektive algoritmer; forstå\n           designmetoden dynamisk programmering; forstå eksemplet stavkapping.",
        "problemPage": 3,
        "solutionPage": 7
      },
      {
        "id": "2023-aug-20",
        "number": 20,
        "title": "Anta at du har en prosedyre A som avgjør beslutningsproblemet VERTEX-",
        "prompt": "5 % 20   Anta at du har en prosedyre A som avgjør beslutningsproblemet VERTEX-\n         COVER i konstant tid. Beskriv hvordan du kan bruke A til å finne et minst\n         mulig nodedekke. Løsningen din skal ha så lav asymptotisk kjøretid som mu-\n         lig. Gitt denne kjøretiden, skal den bruke så få kall til A som mulig. (Du skal\n         altså ikke øke den asymptotiske kjøretiden bare for å redusere antall kall til A.)\n         Merk at du her faktisk skal finne nodedekket, ikke bare størrelsen.",
        "solution": "5 % 20   Anta at du har en prosedyre A som avgjør beslutningsproblemet VERTEX-\n         COVER i konstant tid. Beskriv hvordan du kan bruke A til å finne et minst\n         mulig nodedekke. Løsningen din skal ha så lav asymptotisk kjøretid som mu-\n         lig. Gitt denne kjøretiden, skal den bruke så få kall til A som mulig. (Du skal\n         altså ikke øke den asymptotiske kjøretiden bare for å redusere antall kall til A.)\n         Merk at du her faktisk skal finne nodedekket, ikke bare størrelsen.\n\nBruk binærsøk i verdiområdet 1 . . . |V| for å finne størrelsen k til minste\nnodedekke.\nFjern så en node v og sjekk om resten har et dekke av størrelse k − 1. I så\nfall tas v med i løsningen; ellers forkastes den. Fortsett på samme måte.\nOm vi antar at nodeslettingen også sletter tilstøtende kanter, får vi kjøretid\nΘ(V + E) i verste tilfelle. Antall kall til A blir (⌊lg |V|⌋ + 1) + (n − 1) =\n⌊lg |V|⌋ + n. Merk at det ikke spørres etter kjøretid eller antall kall, så det\ner ikke nødvendig å oppgi dette i svaret.\nRelevante læringsmål: Kunne konstruere nye effektive algoritmer; kjenne\ndet NP-komplette problemet VERTEX-COVER (kunne angi presist hva in-\nput er; kunne angi presist hva output er og hvilke egenskaper det må ha).",
        "problemPage": 3,
        "solutionPage": 7
      }
    ]
  },
  {
    "id": "2023-des",
    "title": "12. desember 2023",
    "term": "2023 Des",
    "problemPdf": "https://algdat.idi.ntnu.no/arkiv/2023.des.tdt4120.oppg.no.pdf",
    "solutionPdf": "https://algdat.idi.ntnu.no/arkiv/2023.des.tdt4120.losn.no.pdf",
    "tasks": [
      {
        "id": "2023-des-01",
        "number": 1,
        "title": "I de følgende deloppgavene er det meningen at du skal svare svært kort.",
        "prompt": "1   I de følgende deloppgavene er det meningen at du skal svare svært kort.\n5%       a) Hva er kjøretiden til Insertion-Sort i beste tilfelle?\n5%       b) Hva er den største fordelen med en tabell (array) fremfor en lenket liste?\n5%       c)   I Counting-Sort(A, n, k) er A en tabell (array) med n verdier. Hva er k?\n5%       d) Hva er topologisk sortering?\n5%       e)   I en maks-haug (max-heap) ligger verdien x i en foreldrenode, mens verdi-\n              ene y og z ligger i henholdsvis venstre og høyre barnenode. Hvilke krav\n              stilles til forholdet mellom verdiene?\n              Her er det altså snakk om verdier, ikke f.eks. indekser.",
        "solution": "1   I de følgende deloppgavene er det meningen at du skal svare svært kort.\n5%       a) Hva er kjøretiden til Insertion-Sort i beste tilfelle?\n\n              Θ(n)\n              O(n) gir også full uttelling. Ω(n) gir 4 poeng.\n              Relevant læringsmål: Forstå Insertion-Sort (kjenne kjøretidene under\n              ulike omstendigheter).\n\n5%       b) Hva er den største fordelen med en tabell (array) fremfor en lenket liste?\n\n              Direkte oppslag (og innsetting) i konstant tid.\n              Her godtas alle formuleringer som får frem hovedpoenget med at tabeller\n              kan indekseres i konstant tid, mens lenkede lister må traverseres fra starten.\n              Relevant læringsmål: Forstå hvordan lenkede lister fungerer.\n\n5%       c)     I Counting-Sort(A, n, k) er A en tabell (array) med n verdier. Hva er k?\n\n              Største mulige verdi.\n\n              Angir altså verdiområdet, 0, . . . , k. Her godtas også andre formuleringer\n              som får frem at k angir eller begrenser hvilke verdier A kan inneholde.\n              Relevant læringsmål: Forstå Counting-Sort.\n\n5%       d) Hva er topologisk sortering?\n\n              Ordning av nodene i en graf, der kantene peker fremover.\n              Her godtas også andre forklaringer av ensrettingen av kantene, inkl. om\n              man sier at de peker bakover.\n              Å kun si at det er en ordning eller sortering av nodene i en graf gir 3 poeng.\n              Relevant læringsmål: Forstå Topological-Sort.\n\n5%       e)     I en maks-haug (max-heap) ligger verdien x i en foreldrenode, mens verdi-\n                ene y og z ligger i henholdsvis venstre og høyre barnenode. Hvilke krav\n                stilles til forholdet mellom verdiene?\n                Her er det altså snakk om verdier, ikke f. …",
        "problemPage": 1,
        "solutionPage": 1
      },
      {
        "id": "2023-des-02",
        "number": 2,
        "title": "I de følgende deloppgavene er det oppgitt informasjon om funksjonene f (n)",
        "prompt": "2   I de følgende deloppgavene er det oppgitt informasjon om funksjonene f (n)\n         og g(n). I hvert tilfelle, uttrykk f (n) + g(n) med asymptotisk notasjon.\n         Under eksamen ble følgende oppgitt: Med formuleringen «i hvert tilfelle» me-\n         nes «i hver deloppgave». Hver deloppgave skal besvares med ett uttrykk.\n5%       a)   f ( n ) = O( n2 ), f ( n ) = Ω ( n ), g ( n ) = O( n2 ), g ( n ) = Ω ( n2 )\n5%       b)   f ( n ) = Ω ( n2 ), f ( n ) = ω ( n ), g ( n ) = O( n2 ), g ( n ) = o ( n3 )",
        "solution": "2   I de følgende deloppgavene er det oppgitt informasjon om funksjonene f (n)\n         og g(n). I hvert tilfelle, uttrykk f (n) + g(n) med asymptotisk notasjon.\n         Under eksamen ble følgende oppgitt: Med formuleringen «i hvert tilfelle» me-\n         nes «i hver deloppgave». Hver deloppgave skal besvares med ett uttrykk.\n5%       a)      f ( n ) = O( n2 ), f ( n ) = Ω ( n ), g ( n ) = O( n2 ), g ( n ) = Ω ( n2 )\n\n              Θ ( n2 )\n              O(n2 ) gir 4 poeng. Ω(n2 ) gir 3 poeng.\n              Her er det altså slik at f (n) er både O(n2 ) og Ω(n), etc. Om man i stedet har\n              tolket ligningene som ulike definisjoner av f (n) og g(n), og har fått riktig\n              svar (f.eks. Ω(n) + O(n2 ) = Ω(n)) for ulike kombinasjoner (enten 2 eller 4),\n              gir det 1 poeng.\n              Relevant læringsmål: Kunne definere og bruke asymptotisk notasjon, O, Ω,\n              Θ, o og ω.\n\n5%       b)      f ( n ) = Ω ( n2 ), f ( n ) = ω ( n ), g ( n ) = O( n2 ), g ( n ) = o ( n3 )\n\n              Ω ( n2 )\n              Tilsvarende som i a, om har tolket ligningene som ulike definisjoner av f (n)\n              og g(n), og har fått riktig svar for ulike kombinasjoner, gir det 1 poeng.\n              Relevant læringsmål: Kunne definere og bruke asymptotisk notasjon, O, Ω,\n              Θ, o og ω.",
        "problemPage": 1,
        "solutionPage": 2
      },
      {
        "id": "2023-des-03",
        "number": 3,
        "title": "Løs følgende rekurrenser. Oppgi svaret i Θ-notasjon.",
        "prompt": "3   Løs følgende rekurrenser. Oppgi svaret i Θ-notasjon.\n5%       a) T(n) = T(n − 1) + n2 − (n − 1)2\n                             √\n5%       b) T(n) = 2T(n/4) + n lg2 n",
        "solution": "3   Løs følgende rekurrenser. Oppgi svaret i Θ-notasjon.\n5%       a) T(n) = T(n − 1) + n2 − (n − 1)2\n\n              Θ ( n2 )\n              Her kan man først regne ut n2 − (n − 1)2 og så bruke iterasjonsmetoden på\n              T(n) = T(n − 1) + 2n − 1, men det er antagelig enklere å bruke metoden\n              direkte, siden vi får en teleskopsum som eliminerer alle ledd unntatt n2 og\n              grunntilfellet:\n\n                          T( n ) = n2 − ( n − 1)2 + T( n − 1)\n                                 = n2 − ( n − 1)2 + ( n − 1)2 − ( n − 2)2 + T( n − 2)\n                                 = n2 − ( n − 2)2 + T( n − 2)\n                                 ..\n                                  .\n                                 = n2 − ( n − i )2 + T( n − i )\n                                 = n2 − ( n − n )2 + T( n − n )\n                                 = n2 + T(0) = n2 + Θ (1) = Θ ( n2 )\n\n              Relevant læringsmål: Kunne løse rekurrenser med iterasjonsmetoden.\n\n                                         √\n5%       b) T(n) = 2T(n/4) +                 n lg2 n\n\n                √\n              Θ( n lg3 n)\n              Her gjelder tilfelle 2 av masterteoremet, med a = 2, b = 4 og k = 2.\n                       √\n              (Merk at n = n1/2 og log4 2 = 1/2.)\n              Dette er oppgave 4.5-1c fra læreboka.\n              Relevant læringsmål: Kunne løse rekurrenser med masterteoremet.",
        "problemPage": 1,
        "solutionPage": 3
      },
      {
        "id": "2023-des-04",
        "number": 4,
        "title": "Du har oppgitt følgende frekvenser for alfabetet a, . . . , h:",
        "prompt": "5%   4   Du har oppgitt følgende frekvenser for alfabetet a, . . . , h:\n         a:1 b:1 c:2 d:3 e:5 f:8 g:13 h:21\n         I en Huffman-kode for disse tegnene, hva er antall siffer for tegnet e?\n         Her er vi altså ute etter antall binære siffer som trengs for å kode én e med\n         Huffman-koden, ikke det totale antall siffer som brukes på alle e-ene i teksten.\n\n          Figur 1\n\n                                                1                  2\n\n                                                3                  4\n\n                                         5            6        7       8\n\n                                         9       10       11",
        "solution": "5%   4   Du har oppgitt følgende frekvenser for alfabetet a, . . . , h:\n         a:1 b:1 c:2 d:3 e:5 f:8 g:13 h:21\n\n          Figur 1\n\n                                                   1                           2\n\n                                                   3                           4\n\n                                          5               6            7               8\n\n                                          9         10        11\n\n         I en Huffman-kode for disse tegnene, hva er antall siffer for tegnet e?\n         Her er vi altså ute etter antall binære siffer som trengs for å kode én e med\n         Huffman-koden, ikke det totale antall siffer som brukes på alle e-ene i teksten.\n\n           Oppgaven er basert på oppgave 15.3-3 i læreboka.\n           Huffman-treet er ikke helt entydig på de nederste nivåene, men dette er et\n           mulig tre:\n\n                                      h            33\n                                              g          20\n\n                                                   f          12\n                                                         e         7\n                                                              d            4\n                                                                   c               2\n                                                                           a               b\n\n           Relevant læringsmål: Forstå Huffman og Huffman-koder.",
        "problemPage": 1,
        "solutionPage": 3
      },
      {
        "id": "2023-des-05",
        "number": 5,
        "title": "I figur 1 ser du en disjunkt-mengde-skog (disjoint-set forest). Vi kan representere",
        "prompt": "5%   5   I figur 1 ser du en disjunkt-mengde-skog (disjoint-set forest). Vi kan representere\n         foreldrepekerne med en tabell A, der A[v] = v.p:\n         A = ⟨1, 2, 1, 2, 3, 3, 4, 4, 5, 6, 6, 11⟩\n         Utfør Find-Set(11) og oppdater A. Hvordan ser A ut etterpå?\n         Svar ved å liste opp tallene i A. Du trenger ikke skrive A = ⟨ . . . ⟩.",
        "solution": "5%   5   I figur 1 ser du en disjunkt-mengde-skog (disjoint-set forest). Vi kan representere\n         foreldrepekerne med en tabell A, der A[v] = v.p:\n         A = ⟨1, 2, 1, 2, 3, 3, 4, 4, 5, 6, 6, 11⟩\n         Utfør Find-Set(11) og oppdater A. Hvordan ser A ut etterpå?\n         Svar ved å liste opp tallene i A. Du trenger ikke skrive A = ⟨ . . . ⟩.\n\n           1, 2, 1, 2, 3, 1, 4, 4, 5, 6, 1, 11\n\n          Figur 2\n\n                                      1    5/9    2    5/5    3\n\n                                     7/7   2/8         2/9   3/ 6\n\n                                s= 4       1/3    5    5/5    6 =t\n\n                                     2/5   3/3         2/2   3/ 7\n\n                                      7    2/4    8    3/5    9\n\n           Her søker vi altså fra 11 og oppover til 1, og sørger for at alle noder vi tref-\n           fer på (11, 6 og 3) ender med å peke på 1 (path compression). Det er altså\n           bare A[11] og A[6] som endrer seg.\n           Relevant læringsmål: Forstå skog-implementasjonen av disjunkte mengder.",
        "problemPage": 2,
        "solutionPage": 4
      },
      {
        "id": "2023-des-06",
        "number": 6,
        "title": "Hvilke forøkende stier vil Edmonds-Karp finne i flytnettet i figur 2?",
        "prompt": "5%   6   Hvilke forøkende stier vil Edmonds-Karp finne i flytnettet i figur 2?\n         Det er altså meningen at du skal utføre Edmonds-Karp på flytnettet, men uten\n         initialiseringen (u, v). f = 0. Oppgi stiene som sekvenser av noder. Skriv én sti\n         per linje, i den rekkefølgen de finnes. For eksempel:\n         1, 2, 3, 4, 5\n         7, 6, 5, 4, 3, 2, 1\n         4, 5, 6, 7, 8, 9\n         (Dette er kun et eksempel på formatet, ikke et faktisk gyldig sett med stier.)",
        "solution": "5%   6   Hvilke forøkende stier vil Edmonds-Karp finne i flytnettet i figur 2?\n         Det er altså meningen at du skal utføre Edmonds-Karp på flytnettet, men uten\n         initialiseringen (u, v). f = 0. Oppgi stiene som sekvenser av noder. Skriv én sti\n         per linje, i den rekkefølgen de finnes. For eksempel:\n         1, 2, 3, 4, 5\n         7, 6, 5, 4, 3, 2, 1\n         4, 5, 6, 7, 8, 9\n         (Dette er kun et eksempel på formatet, ikke et faktisk gyldig sett med stier.)\n\n           4, 5, 3, 6\n           4, 7, 8, 9, 6\n           Om man bytter om på stiene (og altså ikke spesifikt har brukt BFS, men\n           fortsatt har brukt Ford-Fulkerson), gir det 4 poeng.\n           Om man kun oppgir den siste stien (og altså ikke har fått med seg flytopp-\n           hevingen fra 5 til 3) gir det 2 poeng.\n           Relevant læringsmål: Forstå Edmonds-Karp-algoritmen (Ford-Fulkerson\n           med BFS).",
        "problemPage": 2,
        "solutionPage": 5
      },
      {
        "id": "2023-des-07",
        "number": 7,
        "title": "Hvis det er uavgjort mellom noen kandidater i noen av rangeringene i stabil",
        "prompt": "5%   7   Hvis det er uavgjort mellom noen kandidater i noen av rangeringene i stabil\n         matching (the stable-marriage problem), kan vi fortsatt garantert finne en stabil\n         matching? Forklar kort.",
        "solution": "5%   7   Hvis det er uavgjort mellom noen kandidater i noen av rangeringene i stabil\n         matching (the stable-marriage problem), kan vi fortsatt garantert finne en stabil\n         matching? Forklar kort.\n\n          Algoritme 1\n          Untitled(A, p, r, k)\n          1 if p < r\n          2      q = Randomized-Partition(A, p, r )\n          3      Untitled(A, p, q − 1, k)\n          4      if q < k\n          5           Untitled(A, q + 1, r, k)\n\n          Ja. Likeverdige kandidater kan ordnes vilkårlig i listene. Om vi så bruker\n          Gale-Shapley, får vi ingen blokkerende par med denne rangeringen, og\n          ingen kan oppstå om vi igjen tar hensyn til at det er uavgjort mellom noen.\n          Det vil si, om et umatchet par w, m ikke foretrekker hverandre fremfor sine\n          partnere, så vil de heller ikke plutselig gjøre det om det blir uavgjort mel-\n          lom enkelte. Det verste som kan skje er at de ikke foretrekker sine partnere\n          fremfor hverandre.\n          (I litteraturen kalles dette en svakt stabil, eller weakly stable, matching.)\n          Her godtas også andre korrekte argumenter for hvorfor det fortsatt må ek-\n          sistere en stabil matching, enten de bruker Gale-Shapley eller ikke.\n          Relevante læringsmål: Forstå hva en stabil matching (stable matching) og\n          et blokkerende par (blocking pair) er; forstå Gale-Shapley; kunne analysere\n          algoritmers korrekthet; kunne konstruere nye algoritmer.",
        "problemPage": 2,
        "solutionPage": 5
      },
      {
        "id": "2023-des-08",
        "number": 8,
        "title": "Betrakt algoritmen Untitled (algoritme 1), der A[1 : n] er en heltallstabell og",
        "prompt": "8   Betrakt algoritmen Untitled (algoritme 1), der A[1 : n] er en heltallstabell og\n         algoritmen startes med kallet Untitled(A, 1, n, k).\n5%       a) Hva gjør algoritmen?\n              Her er vi ute etter resultatet av å kjøre algoritmen, eller hvilket problem den\n              løser, ikke hvordan den oppfører seg, trinn for trinn.\n\n          Figur 2\n\n                                     1    5/9   2    5/5    3\n\n                                    7/7   2/8        2/9   3/ 6\n\n                                s= 4      1/3   5    5/5    6 =t\n\n                                    2/5   3/3        2/2   3/ 7\n\n                                     7    2/4   8    3/5    9\n\n          Algoritme 1\n          Untitled(A, p, r, k)\n          1 if p < r\n          2      q = Randomized-Partition(A, p, r )\n          3      Untitled(A, p, q − 1, k)\n          4      if q < k\n          5           Untitled(A, q + 1, r, k)\n\n5%       b) Hva er den forventede kjøretiden, som funksjon av n og k? Oppgi svaret i\n            Θ-notasjon.\n             Som en forenkling, kan du anta at q alltid havner midt mellom p og r.",
        "solution": "8   Betrakt algoritmen Untitled (algoritme 1), der A[1 : n] er en heltallstabell og\n         algoritmen startes med kallet Untitled(A, 1, n, k).\n5%       a) Hva gjør algoritmen?\n             Her er vi ute etter resultatet av å kjøre algoritmen, eller hvilket problem den\n             løser, ikke hvordan den oppfører seg, trinn for trinn.\n\n          Sorterer de k minste elementene i A, så de havner i A[1 : k ].\n          Om man forklarer noe om at den faktisk kan ende med å finne og sortere\n          flere enn k minste elementene (dvs., de r minste elementene, i A[1 : r ], så\n          snart q < k) så gir det også full uttelling.\n          Om man kun sier at algoritmen finner de k minste elementene, at\n          den finner det k-ende minste elementet, sier den er ekvivalent med\n          Randomized-Select eller at den plasserer de k minste elementene først,\n          gir det 2 poeng.\n          Om man sier at algoritmen sorterer hele tabellen, eller mener den er ekvi-\n          valent med Randomized-Quicksort, gir det 1 poeng.\n          Relevante læringsmål: Forstå Randomized-Quicksort; forstå Random-\n\n          ized-Select; kunne analysere algoritmers korrekthet; kunne konstruere\n          nye algoritmer.\n\n5%       b) Hva er den forventede kjøretiden, som funksjon av n og k? Oppgi svaret i\n            Θ-notasjon.\n            Som en forenkling, kan du anta at q alltid havner midt mellom p og r.\n\n          Θ(n + k lg k)\n          Θ(n) gir 2 poeng. Θ(k lg k) og Θ(n lg k) gir 1 poeng. O(n + k lg k) gir 1 poeng\n          (siden oppgaven eksplisitt ber om Θ-notasjon).\n          Utførelsen har to faser.\n          Fase 1 (q ⩾ k): Tilsvarer Randomized-Select, men stopper når q < k. Merk\n          at Randomized-Partition kjøres minst én gang, selv om q < k fra starten\n          av, …",
        "problemPage": 2,
        "solutionPage": 6
      },
      {
        "id": "2023-des-09",
        "number": 9,
        "title": "Du skal lage en spilleliste som er nøyaktig t sekunder lang. Du har n sanger å",
        "prompt": "9   Du skal lage en spilleliste som er nøyaktig t sekunder lang. Du har n sanger å\n         velge mellom. Du kan anta at alle sangene varer et helt antall sekunder.\n5%       a) Hvordan kan du vise at dette er et vanskelig problem?\n5%       b) Hvordan kan du løse problemet?",
        "solution": "9   Du skal lage en spilleliste som er nøyaktig t sekunder lang. Du har n sanger å\n         velge mellom. Du kan anta at alle sangene varer et helt antall sekunder.\n5%       a) Hvordan kan du vise at dette er et vanskelig problem?\n\n          F.eks. reduksjon fra SUBSET-SUM, der heltallene blir sekunder.\n          Om man forklarer at problemet er «ekvivalent med» SUBSET-SUM, på en\n          måte som implisitt innebærer en reduksjon fra SUBSET-SUM (ev. begge vei-\n          er), gir det 5 poeng. Om man argumenterer for at det «ligner veldig» e.l., gir\n          det 4 poeng.\n          Om man reduserer til SUBSET-SUM (uten også å redusere fra), gir det 1\n          poeng.\n          Om reduserer fra et annet NP-komplett problem, og forklarer hvordan, gir\n          det også 5 poeng. Om man sier at man vil redusere fra et annet problem,\n          men ikke forklarer hvordan, gir det 1 poeng. Om man sier at man vil redu-\n          sere til et annet problem, gir det 0 poeng.\n          Relevante læringsmål: Forstå definisjonen av NP-hardhet og NP-komplett-\n          het; kjenne det NP-komplette problemet SUBSET-SUM; forstå hvordan NP-\n          kompletthet kan bevises ved én reduksjon; være i stand til å konstruere\n\n          enkle NP-kompletthetsbevis.\n\n5%       b) Hvordan kan du løse problemet?\n\n          F.eks. reduksjon til det binære ryggsekkproblemet, der verdi = vekt = tid.\n          En tilsvarende løsning, der man løser problemet direkte med dynamisk pro-\n          grammering, og forklarer hvordan, vil gi 5 poeng.\n          Relevante læringsmål: Forstå løsningen på de binære ryggsekkproblemet;\n          kunne konstruere nye effektive algoritmer.",
        "problemPage": 3,
        "solutionPage": 7
      },
      {
        "id": "2023-des-10",
        "number": 10,
        "title": "Din venn Smartnes leter etter stier i en sammenhengende vektet urettet graf,",
        "prompt": "5 % 10   Din venn Smartnes leter etter stier i en sammenhengende vektet urettet graf,\n         fra en startnode s til alle andre. Hvis han finner de korteste stiene, vil summen\n         av alle sti-lengdene bli minst mulig, men delene av stiene der de overlapper vil\n         da telles med flere ganger. Han vil heller finne et sett med stier som minimerer\n         en tilsvarende sum, der de overlappende delene telles bare én gang. Hvordan\n         kan han gjøre det? Forklar kort.",
        "solution": "5 % 10   Din venn Smartnes leter etter stier i en sammenhengende vektet urettet graf,\n         fra en startnode s til alle andre. Hvis han finner de korteste stiene, vil summen\n         av alle sti-lengdene bli minst mulig, men delene av stiene der de overlapper vil\n         da telles med flere ganger. Han vil heller finne et sett med stier som minimerer\n         en tilsvarende sum, der de overlappende delene telles bare én gang. Hvordan\n         kan han gjøre det? Forklar kort.\n\n          Han vil minimere kantsummen for en delgraf som kobler s til alle andre\n          noder. Det tilsvarer å finne et minimalt spenntre, som han kan finne med\n          Prims eller Kruskals algoritme.\n          Her er poenget at beskrivelsen av problemet til Smartnes fremstår som\n          svært uklar, og utfordringen er å klare å forstå at det han er ute etter fak-\n          tisk tilsvarer minimale spenntrær. Om man får frem det, selv uten å nevne\n          algoritmer for å finne dem, gir det 5 poeng.\n          Relevante læringsmål: Vite hva spenntrær og minimale spenntrær er; forstå\n          MST-Kruskal; forstå MST-Prim.",
        "problemPage": 3,
        "solutionPage": 8
      },
      {
        "id": "2023-des-11",
        "number": 11,
        "title": "Din venn Klokland er ansvarlig for en konsertserie, men på grunn av budsjett-",
        "prompt": "5 % 11   Din venn Klokland er ansvarlig for en konsertserie, men på grunn av budsjett-\n         kutt må hun nøye seg med én scene. Flere av konsertene kolliderer tidsmessig,\n         og noen må derfor avlyses. Klokland ønsker å avlyse så få som mulig.\n         Det eneste hun har tatt vare på av informasjon er starttidspunktene for alle\n         konsertene, samt en urettet graf med konserter som noder, og kanter mellom\n\n         dem som kolliderer. Hun ønsker å fjerne så få noder som mulig, slik at alle\n         kantene forsvinner.\n         Hun blir litt svett idet hun innser at dette er optimeringsversjonen av VERTEX-\n         COVER, men håper kanskje du har noen gode ideer.\n         Konstruer og beskriv en algoritme som løser problemet generelt.",
        "solution": "5 % 11   Din venn Klokland er ansvarlig for en konsertserie, men på grunn av budsjett-\n         kutt må hun nøye seg med én scene. Flere av konsertene kolliderer tidsmessig,\n         og noen må derfor avlyses. Klokland ønsker å avlyse så få som mulig.\n         Det eneste hun har tatt vare på av informasjon er starttidspunktene for alle\n         konsertene, samt en urettet graf med konserter som noder, og kanter mellom\n         dem som kolliderer. Hun ønsker å fjerne så få noder som mulig, slik at alle\n         kantene forsvinner.\n         Hun blir litt svett idet hun innser at dette er optimeringsversjonen av VERTEX-\n         COVER, men håper kanskje du har noen gode ideer.\n         Konstruer og beskriv en algoritme som løser problemet generelt.\n\n           Problemet kan reduseres til aktivitetsutvelgelse: Færrest mulige avlysnin-\n           ger tilsvarer flest mulig konserter som ikke kolliderer. Vi kan snu tidsak-\n           sen: Sorter etter synkende startid og velg så neste konsert som ikke kolliderer\n           (med den forrige, om noen), til vi er ferdige.\n           Eventuelt kan vi finne faktiske intervaller ved å sortere etter starttid og sette\n           sluttid så konserten kolliderer med dem den har en kant til. Vi sorterer så\n           etter sluttid og velger grådig.\n           Om man sier noe om at dette kan løses grådig, med henvisning til aktivi-\n           tetsutvelgelse, men uten å faktisk finne intervallene, gir det 3 poeng. Om\n           man finner intervallene, men ikke deretter løser problemet, gir det 2 poeng.\n           Relevante læringsmål: Forstå eksemplet aktivitetsutvelgelse; kunne kon-\n           struere nye effektive algoritmer.",
        "problemPage": 3,
        "solutionPage": 8
      },
      {
        "id": "2023-des-12",
        "number": 12,
        "title": "Konstruer og beskriv en algoritme som avgjør om en rettet graf har en odde",
        "prompt": "5 % 12   Konstruer og beskriv en algoritme som avgjør om en rettet graf har en odde\n         sykel, altså en sykel med et antall kanter som er et oddetall.\n         Her får du full uttelling med kjøretid O(V3 ).\n         Hint 1: Det kan være nyttig å se på stier som en del av løsningen.\n         Hint 2: Du trenger ikke begrense deg til enkle (simple) stier og sykler.\n         Hint 3: Finnes en odde sti fra i til j? Hva med en der antall kanter er et partall?",
        "solution": "5 % 12   Konstruer og beskriv en algoritme som avgjør om en rettet graf har en odde\n         sykel, altså en sykel med et antall kanter som er et oddetall.\n         Her får du full uttelling med kjøretid O(V3 ).\n         Hint 1: Det kan være nyttig å se på stier som en del av løsningen.\n         Hint 2: Du trenger ikke begrense deg til enkle (simple) stier og sykler.\n         Hint 3: Finnes en odde sti fra i til j? Hva med en der antall kanter er et partall?\n\n           Kan løses på en lignende måte som transitiv lukning, men med to matriser,\n           A og B, der aij angir om det finnes en (ikke nødvendigvis enkel) oddetallssti\n           fra i til j og bij om det finnes en partallssti. For hver i, j og k, oppdateres disse\n           slik:\n           aij = aij ∨ (bik ∧ akj ) ∨ ( aik ∧ bkj )\n           bij = bij ∨ ( aik ∧ akj ) ∨ (bik ∧ bkj )\n           Sjekk til slutt diagonalen i A, dvs., om aii = 1 for noen i.\n           Løsningen er en mindre justering av Floyd-Warshall, på samme måte\n           som Transitive-Closure. Om man nevner en av disse, og skisserer hvor-\n           dan modifikasjonen kan gjøres, uten at det blir helt rett, gir det 4 poeng.\n           Om man ikke nevner disse, men løser problemet korrekt med dynamisk pro-\n           grammering, gir det naturligvis 5 poeng.\n           Løsninger som baserer seg på traversering vil stort sett ikke fungere, men\n           kan likevel gi opptil 2 poeng. (Et unntak er løsningen beskrevet nedenfor,\n           som det ikke forventes at noen finner, men som vil gi 5 poeng.)\n           Løsninger som oppdager odde urettede sykler (f.eks. ved traversering og\n           tofarging) gir 0 poeng.\n           Relevante læringsmål: Forstå Floyd-Warshall; forstå Transitive-Clo-\n           sure; kunne konstruere nye effektive …",
        "problemPage": 4,
        "solutionPage": 9
      }
    ]
  },
  {
    "id": "2024-aug",
    "title": "5. august 2024",
    "term": "2024 Aug",
    "problemPdf": "https://algdat.idi.ntnu.no/arkiv/2024.aug.tdt4120.oppg.no.pdf",
    "solutionPdf": "https://algdat.idi.ntnu.no/arkiv/2024.aug.tdt4120.losn.no.pdf",
    "tasks": [
      {
        "id": "2024-aug-01",
        "number": 1,
        "title": "Det følgende er hentet fra Enqueue:",
        "prompt": "1   Det følgende er hentet fra Enqueue:\n\n     1 Q[Q.tail] = x\n     2 if Q.tail == Q.size\n     4 else Q.tail = Q.tail + 1\n\n    Hva skal den sensurerte biten være?",
        "solution": "1   Det følgende er hentet fra Enqueue:\n\n     1 Q[Q.tail] = x\n     2 if Q.tail == Q.size\n     3      Q.tail = 1\n     4 else Q.tail = Q.tail + 1\n\n    Hva skal den sensurerte biten være?\n\n     Se løsning i pseudokoden over.\n     Relevant læringsmål: Forstå hvordan stakker og køer fungerer (inkl. opera-\n     sjonene Stack-Empty, Push, Pop, Enqueue, Dequeue).",
        "problemPage": 1,
        "solutionPage": 1
      },
      {
        "id": "2024-aug-02",
        "number": 2,
        "title": "Anta at du kjører MST-Prim og MST-Kruskal på en usammenhengende graf.",
        "prompt": "2   Anta at du kjører MST-Prim og MST-Kruskal på en usammenhengende graf.\n    Hvilken av algoritmene vil finne et minimalt spenntre for hver av de sammen-\n    hengende komponentene i grafen? Forklar kort.\n    Det vil si, hvilken av dem vil konstruere en usammenhengende løsning som\n    dekker hele grafen?",
        "solution": "2   Anta at du kjører MST-Prim og MST-Kruskal på en usammenhengende graf.\n    Hvilken av algoritmene vil finne et minimalt spenntre for hver av de sammen-\n    hengende komponentene i grafen? Forklar kort.\n    Det vil si, hvilken av dem vil konstruere en usammenhengende løsning som\n    dekker hele grafen?\n\n     MST-Kruskal, siden den alltid plukker den billigste gjenværende kanten\n     som ikke danner en sykel, samme hvor i grafen den befinner seg. MST-\n     Prim, derimot, konstruerer et (sammenhengende) tre som vokser ut fra én\n\n      startnode, og vil aldri kunne bevege seg videre til en annen komponent.\n      Her vil kortere og enklere forklaringer kunne være fullgode.\n      Relevante læringsmål: Forstå MST-Kruskal; forstå MST-Prim.",
        "problemPage": 1,
        "solutionPage": 1
      },
      {
        "id": "2024-aug-03",
        "number": 3,
        "title": "En av løkkene i Counting-Sort går fra n ned til 1 (for j = n downto 1). Hva er",
        "prompt": "3   En av løkkene i Counting-Sort går fra n ned til 1 (for j = n downto 1). Hva er\n    konsekvensen av å skifte retning på løkka (for j = 1 to n)?\n    Merk: Her kreves ingen forklaring.",
        "solution": "3   En av løkkene i Counting-Sort går fra n ned til 1 (for j = n downto 1). Hva er\n    konsekvensen av å skifte retning på løkka (for j = 1 to n)?\n    Merk: Her kreves ingen forklaring.\n\n      Sorteringen blir ustabil.\n      Relevant læringsmål: Forstå Counting-Sort, og hvorfor den er stabil.",
        "problemPage": 1,
        "solutionPage": 2
      },
      {
        "id": "2024-aug-04",
        "number": 4,
        "title": "Hvis du skal beskrive den beste kjøretiden til en algoritme (best-case), hvilken",
        "prompt": "4   Hvis du skal beskrive den beste kjøretiden til en algoritme (best-case), hvilken\n    asymptotisk notasjon (av O, Ω eller Θ) er det best å bruke, om mulig?",
        "solution": "4   Hvis du skal beskrive best-case-kjøretiden til en algoritme, hvilken asymptotisk\n    notasjon (av O, Ω eller Θ) er det best å bruke, om mulig?\n\n      Θ\n      Den angir både en øvre og nedre grense for kjøretiden, og gir dermed mest\n      informasjon.\n      Relevant læringsmål: Forstå at alle av O, Ω, Θ, o og ω kan beskrive best-,\n      worst- og average-case.",
        "problemPage": 1,
        "solutionPage": 2
      },
      {
        "id": "2024-aug-05",
        "number": 5,
        "title": "I en hashtabell med hashfunksjon h, hva vil det si at nøklene k1 og k2 kolliderer?",
        "prompt": "5   I en hashtabell med hashfunksjon h, hva vil det si at nøklene k1 og k2 kolliderer?",
        "solution": "5   I en hashtabell med hashfunksjon h, hva vil det si at nøklene k1 og k2 kolliderer?\n\n      h(k1 ) = h(k2 )\n      Dvs. at de har samme hashverdi og mappes til samme posisjon (slot). Om\n      vi bruker kjeding (chaining), vil de havne i dem samme lenkede listen, på\n      indeks h(k1 ) i tabellen.\n      Relevant læringsmål: Forstå hvordan direkte adressering og hashtabeller fun-\n      gerer.",
        "problemPage": 1,
        "solutionPage": 2
      },
      {
        "id": "2024-aug-06",
        "number": 6,
        "title": "Hva er den amortiserte kjøretiden til Table-Insert?",
        "prompt": "6   Hva er den amortiserte kjøretiden til Table-Insert?\n    Det er altså snakk om innsetting i en dynamisk tabell, der vi enten kan sette\n    elementet rett inn, om det er plass, eller må allokere en ny og større tabell ellers.\n    Oppgi svaret med Θ-notasjon.",
        "solution": "6   Hva er den amortiserte kjøretiden til Table-Insert?\n    Det er altså snakk om innsetting i en dynamisk tabell, der vi enten kan sette\n    elementet rett inn, om det er plass, eller må allokere en ny og større tabell ellers.\n    Oppgi svaret med Θ-notasjon.\n\n      Θ (1)\n      Relevant læringsmål: Forstå hvordan dynamiske tabeller fungerer (inkl. ope-\n      rasjonene Table-Insert).\n\n     Figur 1 Graf til oppgave 10\n\n                                     5                 2\n\n                                         4         3",
        "problemPage": 1,
        "solutionPage": 2
      },
      {
        "id": "2024-aug-07",
        "number": 7,
        "title": "Du har en rettet, uvektet graf G = (V, E), og skal finne korteste veier fra alle",
        "prompt": "7   Du har en rettet, uvektet graf G = (V, E), og skal finne korteste veier fra alle\n    noder i V til én gitt node t. Hvordan vil du gå frem?\n\n      Figur 1 Graf til oppgave 10\n\n                                             5                           2\n\n                                                     4               3",
        "solution": "7   Du har en rettet, uvektet graf G = (V, E), og skal finne korteste veier fra alle\n    noder i V til én gitt node t. Hvordan vil du gå frem?\n\n      Snu retningen på alle kantene i G, og kjør BFS fra t.\n      Relevante læringsmål: Forstå ulike varianter av korteste-vei- eller korteste-\n      sti-problemet (Single-source, single-destination, single-pair, all-pairs); forstå\n      BFS, også for å finne korteste vei uten vekter.",
        "problemPage": 1,
        "solutionPage": 3
      },
      {
        "id": "2024-aug-08",
        "number": 8,
        "title": "Du ønsker å finne lengste enkle vei fra node s til node t i en vektet graf. Hvordan",
        "prompt": "8    Du ønsker å finne lengste enkle vei fra node s til node t i en vektet graf. Hvordan\n     kan du gjøre det? Er det tilfeller der metoden ikke vil fungere? Forklar kort.",
        "solution": "8   Du ønsker å finne lengste enkle vei fra node s til node t i en vektet graf. Hvordan\n    kan du gjøre det? Er det tilfeller der metoden ikke vil fungere? Forklar kort.\n\n      Gang alle kantvekter med −1 og finn korteste vei med en standard algorit-\n      me som f.eks. Bellman-Ford. Det vil ikke fungere (dvs., alle kjente algorit-\n      mer vil feile) dersom man kan gå innom en positiv sykel i den opprinnelige\n      grafen (som altså blir en negativ sykel i den nye).\n      Det skader ikke om man har positive sykler generelt, så lenge ingen av sti-\n      ene fra s til t kan gå innom noen av dem. Man vil likevel få full uttelling om\n      man sier at metoden ikke vil fungere dersom grafen har positive sykler.\n      Det vil fortsatt være mulig å finne korteste enkle vei (om den eksisterer)\n      uansett. Men om P ̸= NP, vil det ikke kunne gjøres i polynomisk tid.\n      Relevant læringsmål: Forstå at lengste enkle vei kan løses vha. korteste enkle\n      vei; forstå at lengste-enkle-vei-problemet er NP-hardt.",
        "problemPage": 2,
        "solutionPage": 3
      },
      {
        "id": "2024-aug-09",
        "number": 9,
        "title": "Løsningen på det binære ryggsekkproblemet (0-1 knapsack) har kjøretid Θ(nW),",
        "prompt": "9    Løsningen på det binære ryggsekkproblemet (0-1 knapsack) har kjøretid Θ(nW),\n     der n er antall gjenstander og W er kapasiteten til ryggsekken. Er dette en po-\n     lynomisk algoritme? Forklar kort.",
        "solution": "9   Løsningen på det binære ryggsekkproblemet (0-1 knapsack) har kjøretid Θ(nW),\n    der n er antall gjenstander og W er kapasiteten til ryggsekken. Er dette en po-\n    lynomisk algoritme? Forklar kort.\n\n      Nei, fordi W vokser eksponentielt med problemstørrelsen.\n      Relevant læringsmål: Forstå hvorfor løsningen på det binære ryggsekkpro-\n      blemet ikke er polynomisk.",
        "problemPage": 2,
        "solutionPage": 3
      },
      {
        "id": "2024-aug-10",
        "number": 10,
        "title": "Du skal representere grafen i figur 1 som en nabomatrise. Fyll inn 0 og 1 i ta-",
        "prompt": "10   Du skal representere grafen i figur 1 som en nabomatrise. Fyll inn 0 og 1 i ta-\n     bellen under.\n                                                 1       2       3   4   5",
        "solution": "10   Du skal representere grafen i figur 1 som en nabomatrise. Fyll inn 0 og 1 i ta-\n     bellen under.\n                                             1       2       3   4   5\n\n                                         1           1       1   1   1\n                                         2   1               1\n                                         3   1       1           1\n                                         4   1               1       1\n                                         5   1                   1\n\n       Se tabellen over.\n       Her er 0-verdier utelatt for økt lesbarhet.\n       Relevant læringsmål: Forstå hvordan grafer kan implementeres.",
        "problemPage": 2,
        "solutionPage": 4
      },
      {
        "id": "2024-aug-11",
        "number": 11,
        "title": "Hva er et nodedekke (vertex cover)?",
        "prompt": "11   Hva er et nodedekke (vertex cover)?",
        "solution": "11   Hva er et nodedekke (vertex cover)?\n\n       Et nodedekke for en graf G = (V, E) er en delmengde V′ ⊆ V slik at hvis\n       (u, v) ∈ E, så er minst én av u og v i V′ .\n       Relevant læringsmål: Kjenne det NP-komplette problemet VERTEX-\n       COVER.",
        "problemPage": 2,
        "solutionPage": 4
      },
      {
        "id": "2024-aug-12",
        "number": 12,
        "title": "I pensumdefinisjonen av flytnett (flow networks) tillates ikke antiparallelle kan-",
        "prompt": "12   I pensumdefinisjonen av flytnett (flow networks) tillates ikke antiparallelle kan-\n     ter, altså at vi har en kant både fra v1 til v2 og fra v2 til v1 . Dersom vi likevel har\n     slike kanter, hvordan kan vi håndtere det?",
        "solution": "12   I pensumdefinisjonen av flytnett (flow networks) tillates ikke antiparallelle kan-\n     ter, altså at vi har en kant både fra v1 til v2 og fra v2 til v1 . Dersom vi likevel har\n     slike kanter, hvordan kan vi håndtere det?\n\n       Vi kan splitte én av dem ved å sette inn en ny node.\n       Vi kan f.eks. erstatte (v1 , v2 ) med (v1 , v′ ) og (v′ , v2 ), der v′ er en ny node.\n       De to nye kantene får samme kapasitet som (v1 , v2 ).\n       Relevant læringsmål: Kunne håndtere antiparallelle kanter.",
        "problemPage": 2,
        "solutionPage": 4
      },
      {
        "id": "2024-aug-13",
        "number": 13,
        "title": "På tilsvarende måte som i Bellman-Ford, skal du utføre Relax på alle kantene",
        "prompt": "13   På tilsvarende måte som i Bellman-Ford, skal du utføre Relax på alle kantene\n     i den følgende grafen én gang. Rekkefølgen er ikke gitt.\n\n                          0    4     1               3       3       2       6   1   9\n                          1          2                       3               4       5\n\n     Når du er ferdig, hva er den minste og største verdien 5.d kan ha (altså v.d for\n     node 5, uthevet)? Oppgi svaret som to tall, adskilt med komma.\n     Hver nodes d-verdi før du starter er angitt i noden i figuren, så f.eks. 4.d = 6.\n\n     Du skal altså ikke utføre hele Bellman-Ford, men oppdatere estimatet én gang\n     langs hver kant, i en eller annen rekkefølge.",
        "solution": "13   På tilsvaraende måte som i Bellman-Ford, skal du utføre Relax på alle kante-\n     ne i den følgende grafen én gang. Rekkefølgen er ikke gitt.\n\n                           0    4    1           3       3       2   6       1   9\n                           1         2                   3               4       5\n\n     Når du er ferdig, hva er den minste og største verdien 5.d kan ha (altså v.d for\n     node 5, uthevet)? Oppgi svaret som to tall, adskilt med komma.\n     Hver nodes d-verdi før du starter er angitt i noden i figuren, så f.eks. 4.d = 6.\n\n     Du skal altså ikke utføre hele Bellman-Ford, men oppdatere estimatet én gang\n     langs hver kant, i en eller annen rekkefølge.\n\n       6, 7\n       Relevant læringsmål: Forstå kant-slakking (edge relaxation) og Relax.",
        "problemPage": 2,
        "solutionPage": 4
      },
      {
        "id": "2024-aug-14",
        "number": 14,
        "title": "Løs følgende rekurrens:",
        "prompt": "14   Løs følgende rekurrens:\n                            n\n     T(n) = T(n − 1) · 22       ( n ⩾ 1)\n     T( 0 ) = 2\n     Oppgi svaret eksakt, dvs. uten asymptotisk notasjon.",
        "solution": "14   Løs følgende rekurrens:\n                                n\n     T(n) = T(n − 1) · 22             ( n ⩾ 1)\n     T( 0 ) = 2\n     Oppgi svaret eksakt.\n\n                      n +1 −1\n       T ( n ) = 22\n\n                                                             n\n                                T ( n ) = T ( n − 1 ) · 22\n                                                             n −1          n\n                                      = T ( n − 2 ) · 22            · 22\n                                                             n −2          n −1   n\n                                      = T ( n − 3 ) · 22       · 22      · 22\n                                      ..\n                                       .\n                                           0       1        n −1       n\n                                      = 22 · 22 · · · 22          · 22\n                                           0     1   n −1 n\n                                      = 22 +2 +2 +2\n                                           n + 1\n                                      = 22 −1\n\n       Relevant læringsmål: Kunne løse rekurrenser med iterasjonsmetoden; ha\n       noe kjennskap til rekkesummer (inkl. 0 + 1 + 2 + 4 + · · · + 2n = 2n+1 − 1).",
        "problemPage": 3,
        "solutionPage": 5
      },
      {
        "id": "2024-aug-15",
        "number": 15,
        "title": "I Transitive-Closure angir tij om det finnes en sti fra i til j. Anta nå at den",
        "prompt": "15   I Transitive-Closure angir tij om det finnes en sti fra i til j. Anta nå at den\n     rettede grafen du får som input er asyklisk. Hvordan kan du endre algoritmen\n     så tij blir antall stier fra i til j?\n     Du kan ev. beskrive løsningen din som en endring av Floyd-Warshall.",
        "solution": "15   I Transitive-Closure angir tij om det finnes en sti fra i til j. Anta nå at den\n     rettede grafen du får som input er asyklisk. Hvordan kan du endre algoritmen\n     så tij blir antall stier fra i til j?\n     Du kan ev. beskrive løsningen din som en endring av Floyd-Warshall.\n\n       I iterasjon k, la tij = tij + tik · tkj .\n       Når vi får lov til å gå innom k, tell alle stier vi har som ikke går innom k, og\n       så tell alle kombinasjoner av stier fra i til k og stier fra k til j.\n       Siden vi ikke har sykler, vet vi at stiene fra i til k ikke kan dele noder med\n       stiene fra k til j, så antallet kombinasjoner blir tik · tkj .\n       Mer drastiske endringer, som å bytte ut hele algoritmen med mer direkte\n       dynamisk programmering (nært beslektet med DAG-Shortest-Paths) gir\n       liten eller ingen uttelling.\n       Relevant læringsmål: Forstå Floyd-Warshall og Transitive-Closure.",
        "problemPage": 3,
        "solutionPage": 5
      },
      {
        "id": "2024-aug-16",
        "number": 16,
        "title": "Et problem med Quicksort er at kjøretiden blir dårlig om pivotelementet er",
        "prompt": "16   Et problem med Quicksort er at kjøretiden blir dårlig om pivotelementet er\n     dårlig. Kan man velge pivot slik at kjøretiden garantert blir Θ(n lg n)? Forklar.\n     Her er det snakk om å kun modifisere hvordan man velger pivot; resten av\n     Quicksort skal utføres som normalt. Hvert rekursive kall skal også utføres på\n     samme måte, så man kan ikke f.eks. bruke Merge-Sort til å begynne med for\n     å «jukse seg til» riktig kjøretid.",
        "solution": "16   Et problem med Quicksort er at kjøretiden blir dårlig om pivotelementet er\n     dårlig. Kan man velge pivot slik at kjøretiden garantert blir Θ(n lg n)? Forklar.\n     Her er det snakk om å kun modifisere hvordan man velger pivot; resten av\n     Quicksort skal utføres som normalt. Hvert rekursive kall skal også utføres på\n     samme måte, så man kan ikke f.eks. bruke Merge-Sort til å begynne med for\n     å «jukse seg til» riktig kjøretid.\n\n       Ja. Bruk Select til å finne medianen i lineær tid.\n       Merk at dette vil gi en mye høyere konstantfaktor enn vanlig Quicksort,\n       og vil trolig gi atskillig dårligere kjøretid i praksis.\n       Relevante læringsmål: Forstå Quicksort; kjenne til Select.",
        "problemPage": 3,
        "solutionPage": 6
      },
      {
        "id": "2024-aug-17",
        "number": 17,
        "title": "Du har n gjenstander og skal gi én til hver av n personer. Personene kan fore-",
        "prompt": "17   Du har n gjenstander og skal gi én til hver av n personer. Personene kan fore-\n     trekke ulike gjenstander. Helst vil du at ingen skal misunne noen andre, men\n     du innser at det neppe er mulig.\n     I stedet lager du et lotteri for hver gjenstand. Heller enn å gi ut gjenstandene\n     direkte, får hver person en tilfeldig prioritet for hver gjenstand. Målet ditt er at\n     ingen skal misunne noen som har lavere prioritet.\n     Vil det alltid være mulig å fordele gjenstandene slik? Hvordan?\n     Om du har fått gjenstand x, så skal jeg altså ikke misunne deg, med mindre jeg\n     har lavere prioritet for gjenstand x.",
        "solution": "17   Du har n gjenstander og skal gi én til hver av n personer. Personene kan fore-\n     trekke ulike gjenstander. Helst vil du at ingen skal misunne noen andre, men\n     du innser at det neppe er mulig.\n     I stedet lager du et lotteri for hver gjenstand. Heller enn å gi ut gjenstandene\n     direkte, får hver person en tilfeldig prioritet for hver gjenstand. Målet ditt er at\n     ingen skal misunne noen som har lavere prioritet.\n     Vil det alltid være mulig å fordele gjenstandene slik? Hvordan?\n     Om du har fått gjenstand x, så skal jeg altså ikke misunne deg, med mindre jeg\n     har lavere prioritet for gjenstand x.\n\n       Ja. Man kan bruke Gale-Shapley, som gir en stabil matching, som tilsvarer\n       den typen fordeling vi er ute etter.\n       Relevante læringsmål: Forstå hva stabil matching (stable matching) er; forstå\n       Gale-Shapley.",
        "problemPage": 3,
        "solutionPage": 6
      },
      {
        "id": "2024-aug-18",
        "number": 18,
        "title": "Din venn Lurvik studerer to beslutningsproblemer, A og B, der han har en eks-",
        "prompt": "18   Din venn Lurvik studerer to beslutningsproblemer, A og B, der han har en eks-\n     ponentiell algoritme for A og en polynomisk algoritme for B. Han har vist at A\n     ikke kan løses raskere enn eksponentielt.\n     Lurvik har også funnet reduksjoner fra A til B og fra B til A. Hva kan du si om\n     kjøretiden til hver av disse reduksjonene? Forklar kort.\n     Om vi ser på A og B som formelle språk, har Lurvik altså funnet to reduksjons-\n     funksjoner f og g, der\n       x ∈ A hvis og bare hvis f ( x ) ∈ B og\n       x ∈ B hvis og bare hvis g( x ) ∈ A.\n\n      Algoritme 1 Inversen av Zip\n      Unzip( x )\n       1 if x == null\n       2      let L, R be new lists\n       3 else allocate new nodes y and z\n       4      y.key = x.key[1]\n       5      z.key = x.key[2]\n       6      L = Unzip( x.next)[1]\n       7      R = Unzip( x.next)[2]\n       8      List-Prepend(L, y)\n       9      List-Prepend(R, z )\n      10 return ⟨L, R⟩\n\n     Spørsmålet er hva du kan si om kjøretiden som kreves for å beregne reduk-\n     sjonsfunksjonene f og g.\n     I pensum antas en reduksjon generelt å ha polynomisk kjøretid, men her kan\n     du se bort fra det.",
        "solution": "18   Din venn Lurvik studerer to beslutningsproblemer, A og B, der han har en eks-\n     ponentiell algoritme for A og en polynomisk algoritme for B. Han har vist at A\n     ikke kan løses raskere enn eksponentielt.\n     Lurvik har også funnet reduksjoner fra A til B og fra B til A. Hva kan du si om\n     kjøretiden til hver av disse reduksjonene? Forklar kort.\n     Om vi ser på A og B som formelle språk, har Lurvik altså funnet to reduksjons-\n     funksjoner f og g, der\n       x ∈ A hvis og bare hvis f ( x ) ∈ B og\n       x ∈ B hvis og bare hvis g( x ) ∈ A.\n     Spørsmålet er hva du kan si om kjøretiden som kreves for å beregne reduk-\n     sjonsfunksjonene f og g.\n     I pensum antas en reduksjon generelt å ha polynomisk kjøretid, men her kan\n     du se bort fra det.\n\n      Algoritme 1 Inversen av Zip\n      Unzip( x )\n       1 if x == null\n       2      let L, R be new lists\n       3 else allocate new nodes y and z\n       4      y.key = x.key[1]\n       5      z.key = x.key[2]\n       6      L = Unzip( x.next)[1]\n       7      R = Unzip( x.next)[2]\n       8      List-Prepend(L, y)\n       9      List-Prepend(R, z )\n      10 return ⟨L, R⟩\n\n       For å redusere fra A til B kreves eksponentiell kjøretid. Kunne vi gjøre det\n       raskere, kunne vi løse A raskere, og det har Lurvik bevist er umulig.\n       Vi kan ikke si noe om kjøretiden til reduksjonen i motsatt retning.\n       Det eksisterer reduksjoner fra B til A med polynomisk kjøretid, som bare\n       løser B og så velger én av to mulige instanser for å A, for å få riktig svar.\n       Men hvis B inneholder store nok instanser, kan reduksjonsfunksjonen også\n       mappe fra instanser av størrelse n til instanser av størrelse 2n eller n! eller\n       verre, og vil da kunne kreve vilkårlig kjøretid.\n       Her gis det også …",
        "problemPage": 3,
        "solutionPage": 6
      },
      {
        "id": "2024-aug-19",
        "number": 19,
        "title": "I mange programmeringsspråk har man en funksjon som heter Zip, som tar inn",
        "prompt": "19   I mange programmeringsspråk har man en funksjon som heter Zip, som tar inn\n     to lister, og returnerer en liste av par, der par i består av element i fra hver av\n     de to listene.\n     Prosedyren Unzip (algoritme 1) gjør det motsatte. Den tar inn hodet til en lenket\n     liste (linked list) av par (tabeller av lengde 2) og fordeler dem i to lister L og R.\n     Hvordan ville du ha endret algoritmen for å forbedre kjøretiden? Hva blir kjøre-\n     tiden før og etter forbedringen din? Forklar.",
        "solution": "19   I mange programmeringsspråk har man en funksjon som heter Zip, som tar inn\n     to lister, og returnerer en liste av par, der par i består av element i fra hver av\n     de to listene.\n     Prosedyren Unzip (algoritme 1) gjør det motsatte. Den tar inn hodet til en lenket\n     liste (linked list) av par (tabeller av lengde 2) og fordeler dem i to lister L og R.\n     Hvordan ville du ha endret algoritmen for å forbedre kjøretiden? Hva blir kjøre-\n     tiden før og etter forbedringen din? Forklar.\n\n       En enkel løsning er å bytte ut linje 6 og 7 med noe som dette:\n\n        6        L, R = Unzip( x.next)\n\n       Da reduseres antallet rekursive kall fra 2 til 1, og man endrer rekurrensen\n       for kjøretiden fra T(n) = 2T(n − 1) + Θ(1) til T(n) = T(n − 1) + Θ(1), og\n       man går fra eksponentiell til lineær kjøretid, altså fra Θ(2n ) til Θ(n).\n       Man kan selvfølgelig beskrive løsningen på flere måter, som f.eks.:\n\n        6        U = Unzip( x.next)\n        7        L = U[1]\n        8        R = U[2]",
        "problemPage": 4,
        "solutionPage": 7
      },
      {
        "id": "2024-aug-20",
        "number": 20,
        "title": "Counting-Sort(A, n, k ) tar inn en tabell A[1 : n] med heltall i området 0, . . . , k",
        "prompt": "20   Counting-Sort(A, n, k ) tar inn en tabell A[1 : n] med heltall i området 0, . . . , k\n     og fyller en tabell C[0 : k] med antall forekomster i A av hver mulige verdi, og\n     bruker Θ(n + k ) operasjoner på dette.\n     Du skal nå gjøre en lignende telling, der A allerede er sortert. Du kan anta at du\n     også får inn C som parameter, og at C er initialisert, så C[i ] = 0 for i = 0, . . . , k.\n     Bruk metoden splitt og hersk til å konstruere en algoritme som løser problemet\n     med kjøretid O(n) generelt, men som er raskere enn dette når A inneholder\n     mange duplikater.",
        "solution": "20   Counting-Sort(A, n, k ) tar inn en tabell A[1 : n] med heltall i området 0, . . . , k\n     og fyller en tabell C[0 : k] med antall forekomster i A av hver mulige verdi, og\n     bruker Θ(n + k ) operasjoner på dette.\n     Du skal nå gjøre en lignende telling, der A allerede er sortert. Du kan anta at du\n     også får inn C som parameter, og at C er initialisert, så C[i ] = 0 for i = 0, . . . , k.\n     Bruk metoden splitt og hersk til å konstruere en algoritme som løser problemet\n     med kjøretid O(n) generelt, men som er raskere enn dette når A inneholder\n     mange duplikater.\n\n       Om første og siste element er forskjellige, løs rekursivt for hver halvdel.\n       Ellers øk C[i ] med lengden av intervallet, der i er første element.\n       Pseudokode kreves ikke, men inkluderes her for å vise detaljer:\n       Freq(A, C, p, r )\n       1 if A[ p] == A[r ]\n       2      C[A[ p]] = C[A[ p]] + r − p + 1\n       3 else q = ⌊( p + r )/2⌋\n       4      Freq(A, C, p, q)\n       5      Freq(A, C, q + 1, r )\n       Prosedyren kalles initielt med Freq(A, C, 1, n), der det antas at n ⩾ 1.\n       At kjøretiden er O(n) følger av rekurrensen T(n) ⩽ 2T(n/2) + Θ(1). Jo flere\n       ganger linje 1 slår inn, jo lavere vil kjøretiden være.\n       Om man bruker binærsøk separat for å finne starten og slutten på forekoms-\n       tene av hver verdi, er ikke kjøretiden O(n). Det vil likevel gi 4 poeng.\n       Relevant læringsmål: Forstå designmetoden divide-and-conquer (splitt og\n       hersk).",
        "problemPage": 4,
        "solutionPage": 8
      }
    ]
  },
  {
    "id": "2024-des",
    "title": "9. desember 2024",
    "term": "2024 Des",
    "problemPdf": "https://algdat.idi.ntnu.no/arkiv/2024.des.tdt4120.oppg.no.pdf",
    "solutionPdf": "https://algdat.idi.ntnu.no/arkiv/2024.des.tdt4120.losn.no.pdf",
    "tasks": [
      {
        "id": "2024-des-01",
        "number": 1,
        "title": "Hva er kjøretiden til Kruskal?",
        "prompt": "5%   1   Hva er kjøretiden til Kruskal?\n         Oppgi svaret med O-notasjon.",
        "solution": "5%   1   Hva er kjøretiden til Kruskal?\n         Oppgi svaret med O-notasjon.\n\n          O(E lg V)\n          O(E lg E) gir 4 poeng.\n          Relevant læringsmål: Forstå MST-Kruskal.",
        "problemPage": 1,
        "solutionPage": 1
      },
      {
        "id": "2024-des-02",
        "number": 2,
        "title": "Hvilke antagelser gjør vi normalt om input til Bucket-Sort?",
        "prompt": "5%   2   Hvilke antagelser gjør vi normalt om input til Bucket-Sort?",
        "solution": "5%   2   Hvilke antagelser gjør vi normalt om input til Bucket-Sort?\n\n          At elementene er tilfeldige tall i intervallet [0, 1).\n          Mer presist, at de er uavhengige og uniformt fordelte over dette intervallet.\n          Her får man full uttelling også for tilsvarende forklaringer, som at de er\n          «jevnt fordelt mellom 0 og 1» eller lignende, også uten å si at de er tilfeldige.\n          Her kan man også få full uttelling uten eksplisitt å angi intervallet [0, 1).\n          Relevant læringsmål: Forstå Bucket-Sort.",
        "problemPage": 1,
        "solutionPage": 1
      },
      {
        "id": "2024-des-03",
        "number": 3,
        "title": "Hvordan vurderer du følgende hashfunksjon? Forklar kort.",
        "prompt": "5%   3   Hvordan vurderer du følgende hashfunksjon? Forklar kort.\n         h(k) = min{m, 2k }\n         Spørsmålet er altså hvor god eller dårlig hashfunksjonen er, og hvorfor. Her er\n         k et positivt heltall og m er størrelsen på hashtabellen.",
        "solution": "5%   3   Hvordan vurderer du følgende hashfunksjon? Forklar kort.\n         h(k) = min{m, 2k }\n\n         Spørsmålet er altså hvor god eller dårlig hashfunksjonen er, og hvorfor. Her er\n         k et positivt heltall og m er størrelsen på hashtabellen.\n\n           Den er dårlig, siden de fleste nøklene vil få h(k) = m og kollidere.\n           Mer spesifikt vil man maksimalt utnytte log2 m av posisjonene (slots) i ta-\n           bellen, og alle nøkler k ⩾ log2 m vil vil havne på posisjon m.\n           Relevant læringsmål: Forstå hvordan hashtabeller fungerer.",
        "problemPage": 1,
        "solutionPage": 1
      },
      {
        "id": "2024-des-04",
        "number": 4,
        "title": "Hvilket problem løser denne prosedyren?",
        "prompt": "5%   4   Hvilket problem løser denne prosedyren?\n         1 while x.left ̸= nil\n         2      x = x.left\n         3 return x\n\n         Dette er altså en prosedyre fra pensum. Vi er ute etter funksjonaliteten – hva\n         den brukes til – og ikke bare hvordan den oppfører seg.",
        "solution": "5%   4   Hvilket problem løser denne prosedyren?\n         1 while x.left ̸= nil\n         2      x = x.left\n         3 return x\n\n         Dette er altså en prosedyre fra pensum. Vi er ute etter funksjonaliteten – hva\n         den brukes til – og ikke bare hvordan den oppfører seg.\n\n           Den finner minimum (noden med minst nøkkel) i et binært søketre.\n           Dette er prosedyren Tree-Minimum. Om man svarer at den finner noden\n           lengst til venstre, gir det 3 poeng.\n           Relevante læringsmål: Forstå hvordan binære søketrær fungerer; forstå\n           Tree-Minimum.",
        "problemPage": 1,
        "solutionPage": 2
      },
      {
        "id": "2024-des-05",
        "number": 5,
        "title": "Hvordan kan du gjenskape funksjonaliteten til en stakk (stack) ved hjelp av en",
        "prompt": "5%   5   Hvordan kan du gjenskape funksjonaliteten til en stakk (stack) ved hjelp av en\n         makshaug (max-heap)?\n         Baser deg på vanlige haugoperasjoner, uten å tenke på hvordan haugen faktisk\n         er implementert. Fokuser på hvordan prioritetene/nøklene skal velges.",
        "solution": "5%   5   Hvordan kan du gjenskape funksjonaliteten til en stakk (stack) ved hjelp av en\n         makshaug (max-heap)?\n         Baser deg på vanlige haugoperasjoner, uten å tenke på hvordan haugen faktisk\n         er implementert. Fokuser på hvordan prioritetene/nøklene skal velges.\n\n           Når et element settes inn, gi det en prioritet som er f.eks. 1 høyere enn nå-\n           værende maksimum.\n           Eventuelt ha en teller som økes for hver innsetting, og bruk denne til å gi\n           nye elementer prioritet.\n           Oppgaven er basert på oppgave 6.5-9 fra læreboka.\n           Relevante læringsmål: Forstå hvordan stakker fungerer; forstå hvordan\n           hauger fungerer.",
        "problemPage": 1,
        "solutionPage": 2
      },
      {
        "id": "2024-des-06",
        "number": 6,
        "title": "Utfør DFS på grafen nedenfor, slik at første kall til DFS-Visit starter i node y.",
        "prompt": "5%   6   Utfør DFS på grafen nedenfor, slik at første kall til DFS-Visit starter i node y.\n         Hva blir v.d og v. f (discovery time og finish time) for hver node v?\n\n          x         y            z       w\n\n         Oppgi svaret som to lister med 4 tall på hver sin linje, som f.eks.:\n\n         1, 2, 4, 7\n         5, 6, 3, 8\n         Første linje er x.d, y.d, z.d, w.d, i rekkefølge, og andre linje er x. f , y. f , z. f , w. f .\n         Hint: Husk at DFS starter en ny dybde-først-traversering med DFS-Visit fra\n         hver eneste node som ikke allerede er besøkt.",
        "solution": "5%   6   Utfør DFS på grafen nedenfor, slik at første kall til DFS-Visit starter i node y.\n         Hva blir v.d og v. f (discovery time og finish time) for hver node v?\n\n          x         y            z      w\n\n         Oppgi svaret som to lister med 4 tall på hver sin linje, som f.eks.:\n\n         1, 2, 4, 7\n         5, 6, 3, 8\n         Første linje er x.d, y.d, z.d, w.d, i rekkefølge, og andre linje er x. f , y. f , z. f , w. f .\n         Hint: Husk at DFS starter en ny dybde-først-traversering med DFS-Visit fra\n         hver eneste node som ikke allerede er besøkt.\n\n           7, 1, 2, 3\n           8, 6, 5, 4\n           Her får man også full uttelling om man har startet på 0, og altså svart:\n           6, 0, 1, 2 / 7, 5, 4, 3\n           Om man har startet i x (dvs., 1, 2, 3, 4 / 8, 7, 6, 5) gir det 3 poeng.\n           Relevant læringsmål: Forstå DFS.",
        "problemPage": 1,
        "solutionPage": 2
      },
      {
        "id": "2024-des-07",
        "number": 7,
        "title": "Hva er restkapasiteten (residual capacity) fra u til v her?",
        "prompt": "5%   7   Hva er restkapasiteten (residual capacity) fra u til v her?\n\n          u      3/ 5       v\n\n         Det er altså snakk om kapasiteten i restnettet, c f (u, v).",
        "solution": "5%   7   Hva er restkapasiteten (residual capacity) fra u til v her?\n\n          u       3/ 5      v\n\n         Det er altså snakk om kapasiteten i restnettet, c f (u, v).\n\n           Relevant læringsmål: Kunne definere restnettet til et flytnett med en gitt\n           flyt.",
        "problemPage": 2,
        "solutionPage": 3
      },
      {
        "id": "2024-des-08",
        "number": 8,
        "title": "Du har oppgitt følgende frekvenser for tegnene a, b, c og d:",
        "prompt": "5%   8   Du har oppgitt følgende frekvenser for tegnene a, b, c og d:\n                      a.freq = 8        b.freq = 4           c.freq = 2           d.freq = 4\n         Hvilke av trærne 1–5 i figur 1 er korrekte huffmantrær for disse tegnene, med\n         disse frekvensene? Forklar kort.\n         Oppgi svaret som en liste av tall, som f.eks.:\n         1, 2, 3, 4, 5\n         Med «huffmantre» menes et tre som kan konstrueres av Huffmans algoritme,\n         hvis det er tilfeldig om en barnenode havner til venstre eller høyre. Det er minst\n         ett korrekt huffmantre i figur 1, men det kan være flere.",
        "solution": "5%   8   Du har oppgitt følgende frekvenser for tegnene a, b, c og d:\n                      a.freq = 8        b.freq = 4           c.freq = 2           d.freq = 4\n         Hvilke av trærne 1–5 i figur 1 er korrekte huffmantrær for disse tegnene, med\n         disse frekvensene? Forklar kort.\n         Oppgi svaret som en liste av tall, som f.eks.:\n         1, 2, 3, 4, 5\n         Med «huffmantre» menes et tre som kan konstrueres av Huffmans algoritme,\n         hvis det er tilfeldig om en barnenode havner til venstre eller høyre. Det er minst\n         ett korrekt huffmantre i figur 1, men det kan være flere.\n\n           3, 4\n           Slår alltid sammen deltrær med lavest frekvens, altså først b og enten c eller\n           d. Eneste mulighet her er er med b og c sammen nederst (enten 4 eller 5).\n           Disse slås sammen med d, og til slutt a.\n           Merk at bokas prosededyre Huffman plasserer minste barn til venstre, og\n           ville ha plassert d til venstre for b og c.\n\n          Figur 1\n\n                                 0       1                                                                          0       1\n\n                                             d                                                                  a\n                         0       1                                        0         1                                       0       1\n\n                                     c                                                                                  b\n                     0   1                                        0   1                 0   1                                       0   1\n\n                 a           b                                a           b         c           d                               c           d …",
        "problemPage": 2,
        "solutionPage": 3
      },
      {
        "id": "2024-des-09",
        "number": 9,
        "title": "Hva er kjøretiden til følgende prosedyre, som funksjon av n?",
        "prompt": "5%   9   Hva er kjøretiden til følgende prosedyre, som funksjon av n?\n         1 for i = 1 to Ω(n)\n         2       for j = 1 to O(n)\n         3            print “Hello, world!”\n         De asymptotiske operatorene representerer her ukjente men reelle funksjoner,\n         på samme måte som når de f.eks. brukes i aritmetiske uttrykk.",
        "solution": "5%   9   Hva er kjøretiden til følgende prosedyre, som funksjon av n?\n         1 for i = 1 to Ω(n)\n         2       for j = 1 to O(n)\n         3            print “Hello, world!”\n         De asymptotiske operatorene representerer her ukjente men reelle funksjoner,\n         på samme måte som når de f.eks. brukes i aritmetiske uttrykk.\n\n          Ω(n)\n          Relevante læringsmål: Kunne analysere algoritmers effektivitet; kunne de-\n          finere og bruke asymptotisk notasjon, inkl. O og Ω.",
        "problemPage": 2,
        "solutionPage": 4
      },
      {
        "id": "2024-des-10",
        "number": 10,
        "title": "De følgende to trinnene utgjør tilsammen en sammenligningsbasert sorterings-",
        "prompt": "5 % 10   De følgende to trinnene utgjør tilsammen en sammenligningsbasert sorterings-\n         algoritme (comparison sort), som sorterer en tabell A med n elementer:\n         1 Init(A, n)\n         2 Main(A, n)\n\n         Kjøretiden til Main er O(n). Hva er kjøretiden til Init i verste tilfelle?\n         Om du har en usortert tabell A av lengde n og først kjører Init(A, n) og deretter\n         Main(A, n), vil altså A ende opp sortert, og både Init og Main baserer seg kun\n         på å sammenligne elementene i A.\n\n         Løs rekurrensen T(n) = 2T(n/4) + n lg n. Oppgi svaret i Θ-notasjon.\n                                         p",
        "solution": "5 % 10   De følgende to trinnene utgjør tilsammen en sammenligningsbasert sorterings-\n         algoritme (comparison sort), som sorterer en tabell A med n elementer:\n\n         1 Init(A, n)\n         2 Main(A, n)\n\n         Kjøretiden til Main er O(n). Hva er kjøretiden til Init i verste tilfelle?\n         Om du har en usortert tabell A av lengde n og først kjører Init(A, n) og deretter\n         Main(A, n), vil altså A ende opp sortert, og både Init og Main baserer seg kun\n         på å sammenligne elementene i A.\n\n           Ω(n lg n)\n           Summen av kjøretidene må være Ω(n lg n), på grunn av den generelle sor-\n           teringsgrensen, og Main har lavere kjøretid enn dette.\n           Relevante læringsmål: Forstå hvorfor sammenligningsbasert sortering har en\n           worst-case på Ω(n lg n).\n\n         Løs rekurrensen T(n) = 2T(n/4) + n lg n. Oppgi svaret i Θ-notasjon.\n                                         p",
        "problemPage": 2,
        "solutionPage": 4
      },
      {
        "id": "2024-des-11",
        "number": 11,
        "title": "Husk at x = x1/2 og xy = x · y.",
        "prompt": "5 % 11\n         Husk at x = x1/2 og xy = x · y.\n                 p            p      p p\n\n          Figur 1\n\n                                0       1                                                                          0       1\n\n                                            d                                                                  a\n                        0       1                                        0         1                                       0       1\n\n                                    c                                                                                  b\n                    0   1                                        0   1                 0   1                                       0   1\n\n                a           b                                a           b         c           d                               c            d\n                            (1)                                              (2)                                           (3)\n\n                                            0    1                                                         0   1\n\n                                        a                                                                          d\n                                                 0       1                                         0       1\n\n                                                             d                                 a\n                                            0   1                                                          0   1\n\n                                        b            c                                                 b           c\n                                                (4)                                                    (5)\n\n          Fi …",
        "solution": "5 % 11\n         Husk at x = x1/2 og xy = x · y.\n                 p            p      p p\n\n               q\n           Θ       n lg3 n\n                             \u0001\n\n           Dette kan skrives på flere måter, som f.eks. Θ(n1/2 · lg 3/2 n).\n           Følger av tilfelle 2 av masterteoremet, der a = 2, b = 4 og k = 1/2.\n           Relevant læringsmål: Kunne løse rekurrenser med masterteoremet.",
        "problemPage": 2,
        "solutionPage": 5
      },
      {
        "id": "2024-des-12",
        "number": 12,
        "title": "Du bygger et minimalt spenntre gradvis, ved å legge til kanter i mengden A.",
        "prompt": "5 % 12   Du bygger et minimalt spenntre gradvis, ved å legge til kanter i mengden A.\n         Du vurderer å legge til den letteste kanten som krysser snittet (S, V − S).\n         Hvilket krav stiller vi normalt til forholdet mellom nåværende A og dette snittet\n         for at det skal være trygt å legge til denne kanten?\n         Med «normalt» menes her altså strategien som beskrives i pensum ifm. Generic-\n         MST, og som bl.a. MST-Kruskal og MST-Prim baserer seg på.\n         En illustrasjon av hvordan den foreløpige kantmengden A og snittet (cut) mel-\n         lom S og (V − S) kan se ut finner du i figur 2.",
        "solution": "5 % 12   Du bygger et minimalt spenntre gradvis, ved å legge til kanter i mengden A.\n         Du vurderer å legge til den letteste kanten som krysser snittet (S, V − S).\n         Hvilket krav stiller vi normalt til forholdet mellom nåværende A og dette snittet\n         for at det skal være trygt å legge til denne kanten?\n         Med «normalt» menes her altså strategien som beskrives i pensum ifm. Generic-\n         MST, og som bl.a. MST-Kruskal og MST-Prim baserer seg på.\n         En illustrasjon av hvordan den foreløpige kantmengden A og snittet (cut) mel-\n         lom S og (V − S) kan se ut finner du i figur 2.\n\n           Ingen av kantene i A må krysse snittet.\n           Se teorem 21.1. Her får man også full uttelling for å si at snittet må gå mel-\n           lom sammenhengende komponenter i A, jf. korollar 21.2.\n           Figuren er basert på figur 21.2 i boka.\n           Det gis flere indikasjoner på hva det spørres etter (bruken av «normalt»,\n           og angivelsen av bruken i MST-Kruskal og MST-Prim), og om man har\n           mestret relevante læringsmål, bør det ikke være tvil om hvilket krav det er\n           snakk om. Likevel er det strengt tatt ikke nødvendig å stille noen krav til\n\n          Figur 2\n\n                    =A\n\n                                                                             ↑S\n\n                                                                             ↓V−S\n\n          snittet, dersom kanten man legger til er strengt lettere enn alle andre over\n          snittet. (Her kunne oppgaven i stedet godt ha spurt om «en av de letteste\n          kantene» eller «en lett kant».) Selv om det ikke finnes noen strategier i pen-\n          sum for å sjekke at en kant er strengt lettest over et snitt der det allerede\n          er valgt kanter, v …",
        "problemPage": 3,
        "solutionPage": 5
      },
      {
        "id": "2024-des-13",
        "number": 13,
        "title": "Din venn Lurvik har støtt på et problem han er usikker på om kan løses i poly-",
        "prompt": "5 % 13   Din venn Lurvik har støtt på et problem han er usikker på om kan løses i poly-\n         nomisk tid. Han har tidligere vist at problemet er i NP, men har nå nettopp klart\n         å redusere det til SUBSET-SUM i polynomisk tid, og spør deg om råd. Hva er\n\n         din vurdering av situasjonen? Svar kort.",
        "solution": "5 % 13   Din venn Lurvik har støtt på et problem han er usikker på om kan løses i poly-\n         nomisk tid. Han har tidligere vist at problemet er i NP, men har nå nettopp klart\n         å redusere det til SUBSET-SUM i polynomisk tid, og spør deg om råd. Hva er\n         din vurdering av situasjonen? Svar kort.\n\n          Alle problemer i NP kan reduseres til SUBSET-SUM i polynomisk tid, siden\n          det er NP-komplett, så reduksjonen forteller oss ikke noe nytt.\n          Mer spesifikt, så forteller det oss ikke om problemet er NP-komplett, eller\n          om det kan løses i polynomisk tid. Det vet vi fortsatt ingenting om.\n          Relevante læringsmål: Forstå redusibilitets-relasjonen ⩽P ; forstå definisjo-\n          nen av NP-kompletthet; kjenne det NP-komplette problemet SUBSET-SUM.",
        "problemPage": 3,
        "solutionPage": 6
      },
      {
        "id": "2024-des-14",
        "number": 14,
        "title": "Vi snakker gjerne om tre ulike typer gjennomsnittlig kjøretid. Hvilke?",
        "prompt": "5 % 14   Vi snakker gjerne om tre ulike typer gjennomsnittlig kjøretid. Hvilke?\n         Merk at det er snakk om ulike typer gjennomsnittlig kjøretid (altså ikke f.eks.\n         beste og verste tilfelle).\n         Her regnes forventning (expectation) som en form for gjennomsnitt. Poenget er\n         å forklare hva vi tar gjennomsnitt av, eller finner forventningsverdien over, for\n         hver av de tre typene, heller enn å oppgi hva de heter.",
        "solution": "5 % 14   Vi snakker gjerne om tre ulike typer gjennomsnittlig kjøretid. Hvilke?\n         Merk at det er snakk om ulike typer gjennomsnittlig kjøretid (altså ikke f.eks.\n         beste og verste tilfelle).\n         Her regnes forventning (expectation) som en form for gjennomsnitt. Poenget er\n         å forklare hva vi tar gjennomsnitt av, eller finner forventningsverdien over, for\n         hver av de tre typene, heller enn å oppgi hva de heter.\n\n          Vi har vanlig gjennomsnittlig (average-case) kjøretid, der vi tar gjennomsnitt\n          over instanser/inputs. (Ev. forventningsverdi for tilfeldige instanser.)\n\n           Vi har også forventet kjøretid for randomiserte algoritmer, der man ser på\n           forventningsverdien over tilfeldige valg som gjøres.\n           Til slutt har vi amortisert kjøretid, der man tar gjennomsnittet over en serie\n           med operasjoner, gjerne på samme datastruktur.\n           Her gir hver av de tre typene 2 poeng, opp til maksimalt 5 poeng. Hver type\n           som oppgis kun ved navn, uten forklaring, gir 1 poeng.\n           For spesielt interesserte: Vi kan også ha kombinasjoner. Om man f.eks. ser\n           på gjennomsnittlig kjøretid for en randomisert algoritme, må man kombi-\n           nere hensyn til instanser og tilfeldige valg, dersom begge deler påvirker\n           resultatet.\n           Relevante læringsmål: Kunne definere average-case og amortisert analyse;\n           forstå (f.eks.) Randomized-Quicksort.",
        "problemPage": 4,
        "solutionPage": 6
      },
      {
        "id": "2024-des-15",
        "number": 15,
        "title": "Under ser du matrisene W og L(2) fra en kjøring av Slow-APSP.",
        "prompt": "5 % 15   Under ser du matrisene W og L(2) fra en kjøring av Slow-APSP.\n                              1   2   3   4   5               1   2    3     4   5\n\n                          1   0   1 ∞ ∞ 7                 1   0   1    2     4   6\n                          2   ∞ 0     1   3   5           2   ∞ 0      1     2   4\n                          3   ∞ ∞ 0       1 ∞             3   ∞ ∞ 0          1   2\n                          4   ∞ ∞ ∞ 0         1           4   ∞ ∞ ∞ 0            1\n                          5   ∞ ∞ ∞ ∞ 0                   5   ∞ ∞ ∞ ∞ 0\n\n                                      W                               L(2)\n                    (3)\n         Hva blir l1,5 ? Forklar svært kort.\n         Du skal altså i praksis utføre Extend-Shortest-Paths én gang.\n         Her angir L(r) lengdene til de korteste stiene som inneholder maksimalt r kan-\n                  (r )\n         ter, der li,j er lengden fra node i til node j, altså cellen i rad i og kolonne j.\n\n         En enkel tekstlig forklaring er tilstrekkelig. Du trenger ikke bruke matematisk\n         notasjon.",
        "solution": "5 % 15   Under ser du matrisene W og L(2) fra en kjøring av Slow-APSP.\n                              1   2   3   4   5               1   2    3     4   5\n\n                          1   0   1 ∞ ∞ 7                 1   0 1      2     4   6\n                          2   ∞ 0     1   3   5           2   ∞ 0      1     2   4\n                          3   ∞ ∞ 0       1 ∞             3   ∞ ∞ 0          1   2\n                          4   ∞ ∞ ∞ 0         1           4   ∞ ∞ ∞ 0            1\n                          5   ∞ ∞ ∞ ∞ 0                   5   ∞ ∞ ∞ ∞ 0\n\n                                      W                               L(2)\n                    (3)\n         Hva blir l1,5 ? Forklar svært kort.\n         Du skal altså i praksis utføre Extend-Shortest-Paths én gang.\n         Her angir L(r) lengdene til de korteste stiene som inneholder maksimalt r kan-\n                  (r )\n         ter, der li,j er lengden fra node i til node j, altså cellen i rad i og kolonne j.\n\n         En enkel tekstlig forklaring er tilstrekkelig. Du trenger ikke bruke matematisk\n         notasjon.\n\n           Prøv alle forgjengere k og velg eksisterende sti til k + kant fra k som gir\n           kortest lengde – eller behold eksisterende sti.\n           Om man heller bruker fremgangsmåten til Faster-APSP, og kombinerer\n           stien frem til k og videre fra k (dvs., bruker L to ganger, heller enn L og W),\n           og forklarer dette riktig, gir det 4 poeng.\n           Grafen er som vist nedenfor. Her har vi i utgangspunktet stien 1 → 2 → 5,\n           men finner en snarvei ved å kombinere stien 1 → 2 → 4 og kanten 4 → 5.\n\n          Figur 3\n\n                                                                     a15\n\n                                         a13 …",
        "problemPage": 4,
        "solutionPage": 7
      },
      {
        "id": "2024-des-16",
        "number": 16,
        "title": "Tabellen A = ⟨ a1 , a2 , . . . , an ⟩ inneholder nøklene fra et komplett (dvs., perfekt",
        "prompt": "5 % 16   Tabellen A = ⟨ a1 , a2 , . . . , an ⟩ inneholder nøklene fra et komplett (dvs., perfekt\n         balansert) binært søketre uten duplikater. Nøklene er hentet ut fra venstre mot\n         høyre, nivå for nivå fra bunnen, som illustrert i figur 3 (for n = 15).\n         Du skal sortere A ved å utføre alle følgende kall i en eller annen rekkefølge:\n         Insertion-Sort(A, n), Merge-Sort(A, 1, n), Quicksort(A, 1, n), Reverse(A)\n         Anta at Partition er modifisert så den bevarer rekkefølgen på elementene som\n         havner i de to halvdelene, med samme kjøretid som den har originalt. (Dette\n         kan gjøres f.eks. ved hjelp av en lenket liste.)\n         I hvilken rekkefølge vil du utføre prosedyrene? Forklar.\n         Oppgi svaret ved å liste opp navnene i riktig rekkefølge, som f.eks.:\n         Insertion-Sort, Merge-Sort, Quicksort, Reverse\n         Prosedyrene utføres etter hverandre, så A endres for hvert kall, og skal ende\n         opp sortert til slutt.\n\n          Figur 3\n\n                                                              a15\n\n                                        a13                                         a14\n\n                              a9                   a10                   a11                   a12\n\n                         a1        a2         a3         a4         a5         a6         a7         a8\n\n         Målet er at hver av prosedyrene individuelt skal få så lav asymptotisk kjøretid\n         som mulig. Du bør altså ikke bare se på den totale asymptotiske kjøretiden.\n         Merk: Her brukes den deterministiske prosedyren Quicksort, som velger siste\n         element som pivot, og ikke Randomized-Quicksort, som velger tilfeldig.\n         Reverse reverserer tabellen i lineær tid, så første element blir sist, etc.",
        "solution": "5 % 16   Tabellen A = ⟨ a1 , a2 , . . . , an ⟩ inneholder nøklene fra et komplett (dvs., perfekt\n         balansert) binært søketre uten duplikater. Nøklene er hentet ut fra venstre mot\n         høyre, nivå for nivå fra bunnen, som illustrert i figur 3 (for n = 15).\n         Du skal sortere A ved å utføre alle følgende kall i en eller annen rekkefølge:\n         Insertion-Sort(A, n), Merge-Sort(A, 1, n), Quicksort(A, 1, n), Reverse(A)\n         Anta at Partition er modifisert så den bevarer rekkefølgen på elementene som\n         havner i de to halvdelene, med samme kjøretid som den har originalt. (Dette\n         kan gjøres f.eks. ved hjelp av en lenket liste.)\n         I hvilken rekkefølge vil du utføre prosedyrene? Forklar.\n         Oppgi svaret ved å liste opp navnene i riktig rekkefølge, som f.eks.:\n         Insertion-Sort, Merge-Sort, Quicksort, Reverse\n         Prosedyrene utføres etter hverandre, så A endres for hvert kall, og skal ende\n         opp sortert til slutt.\n         Målet er at hver av prosedyrene individuelt skal få så lav asymptotisk kjøretid\n         som mulig. Du bør altså ikke bare se på den totale asymptotiske kjøretiden.\n         Merk: Her brukes den deterministiske prosedyren Quicksort, som velger siste\n         element som pivot, og ikke Randomized-Quicksort, som velger tilfeldig.\n         Reverse reverserer tabellen i lineær tid, så første element blir sist, etc.\n\n          Quicksort, Insertion-Sort, Reverse, Merge-Sort\n          eller\n          Quicksort, Reverse, Merge-Sort, Insertion-Sort\n          Alle oppnår da sin beste mulige (best-case) kjøretid. For Quicksort vil alle\n          pivot-elementer dele tabellen i to like deler, og kjøretiden blir Θ(n lg n),\n          mens Insertion-Sort kjøres på en sortert sekvens, og får kjøretid Θ(n). …",
        "problemPage": 4,
        "solutionPage": 8
      },
      {
        "id": "2024-des-17",
        "number": 17,
        "title": "Din venn Klokland vil forbedre Bellman-Ford ved å holde styr på hvilke av-",
        "prompt": "5 % 17   Din venn Klokland vil forbedre Bellman-Ford ved å holde styr på hvilke av-\n         standsestimater som faktisk endrer seg. Hun vil gjøre dette med en eller annen\n         slags kø, som til å begynne med bare inneholder startnoden. Hun tenker også\n         det er lurt å fokusere på lave estimater, og bruker derfor en prioritetskø.\n         I hver iterasjon henter hun en node u fra køen og oppdaterer estimatet langs\n         alle kanter (u, v). Hvis v.d endres, og v ikke ligger i køen, legges den inn.\n         Hva er kjøretiden hvis grafen inneholder negative sykler og hva er den hvis\n         grafen ikke har negative kantvekter? Forklar kort.\n         Du kan anta (1) at hun bruker en binær min-haug (binary min-heap) som priori-\n         tetskø, med v.d som prioritet for hver node v, (2) at det tar konstant tid å sjekke\n         om en node ligger i køen og (3) at alle noder kan nås fra startnoden.\n         For full pseudokode, se algoritme 1, men merk at det er fullt mulig å besvare\n         oppgaven uten å lese eller forstå pseudokoden.",
        "solution": "5 % 17   Din venn Klokland vil forbedre Bellman-Ford ved å holde styr på hvilke av-\n         standsestimater som faktisk endrer seg. Hun vil gjøre dette med en eller annen\n         slags kø, som til å begynne med bare inneholder startnoden. Hun tenker også\n         det er lurt å fokusere på lave estimater, og bruker derfor en prioritetskø.\n         I hver iterasjon henter hun en node u fra køen og oppdaterer estimatet langs\n\n Algoritme 1\n  1   for each vertex u ∈ G.V − {s}\n  2        u.d = ∞\n  3   s.d = 0\n  4   Q=∅\n  5   Insert(Q, s)\n  6   while Q ̸= ∅\n  7        u = Extract-Min(Q)\n  8        for each vertex v in G.Adj[u]\n  9             if v.d > u.d + w(u, v)               // tilsvarer Relax\n 10                  v.d = u.d + w(u, v)\n 11                  if v is in Q                    // tar konstant tid\n 12                        Decrease-Key(Q, v, v.d)\n 13                  else Insert(Q, v)\n\nalle kanter (u, v). Hvis v.d endres, og v ikke ligger i køen, legges den inn.\nHva er kjøretiden hvis grafen inneholder negative sykler og hva er den hvis\ngrafen ikke har negative kantvekter? Forklar kort.\nDu kan anta (1) at hun bruker en binær min-haug (binary min-heap) som priori-\ntetskø, med v.d som prioritet for hver node v, (2) at det tar konstant tid å sjekke\nom en node ligger i køen og (3) at alle noder kan nås fra startnoden.\nFor full pseudokode, se algoritme 1, men merk at det er fullt mulig å besvare\noppgaven uten å lese eller forstå pseudokoden.\n\n  Om vi har negative sykler, vil ikke algoritmen terminere. Om vi ikke har\n  negative kantvekter, vil hver node tas ut av køen nøyaktig én gang, akkurat\n  som i Dijkstra, og vi får kjøretid O(E lg V).\n  Generelt kunne vi ha hatt negative sykler som ikke kunne nås fra startno-\n  den, uten at det skapte problemer, men her er det e …",
        "problemPage": 5,
        "solutionPage": 9
      },
      {
        "id": "2024-des-18",
        "number": 18,
        "title": "Hvordan vil du modifisere Floyd-Warshall for å finne de m korteste stiene",
        "prompt": "5 % 18   Hvordan vil du modifisere Floyd-Warshall for å finne de m korteste stiene\n         mellom alle par med noder, heller enn bare den korteste? Du kan anta at m er\n         en liten konstant.\n         Det holder at du finner lengdene til de m korteste stiene. Du trenger altså ikke\n         finne de faktiske stiene.\n         Merk: Her er det ikke snakk om å finne m stier fra u til v, der alle har minimal\n         lengde, og følgelig er like lange! Om man sorterer stiene fra u til v etter lengde,\n         er vi ute etter de m første.",
        "solution": "5 % 18   Hvordan vil du modifisere Floyd-Warshall for å finne de m korteste stiene\n         mellom alle par med noder, heller enn bare den korteste? Du kan anta at m er\n         en liten konstant.\n         Det holder at du finner lengdene til de m korteste stiene. Du trenger altså ikke\n         finne de faktiske stiene.\n         Merk: Her er det ikke snakk om å finne m stier fra u til v, der alle har minimal\n         lengde, og følgelig er like lange! Om man sorterer stiene fra u til v etter lengde,\n         er vi ute etter de m første.\n\n           Ta vare på en mengde dij av m verdier for hvert par i, j med noder.\n           Initialiser dij til {wij , ∞, . . . , ∞}.\n           For hver k, la dij være de m minste verdiene fra dij ∪ { x + y : x ∈ dik , y ∈ dkj }.\n           Om man her bruker samme tabell D i alle iterasjoner, eller en ny tabell D(k)\n           for hver iterasjon, spiller ingen rolle. Begge deler gir full uttelling.\n           Forklaring: Resonnementet er essentielt som for det vanlige tilfellet, der\n           m = 1. Hver av de m korteste veiene fra i til j som kun går innom noder\n           {1, . . . , k} må enten gå innom k eller ikke. Vi har allerede funnet de m kor-\n           teste som ikke går innom k, og må nå vurdere de k korteste som går innom\n           k. Hver av disse vil bestå av én av de m korteste veiene fra i til k og én av\n           de m korteste fra k til j (ellers kunne vi ha forbedret løsningen).\n           Merk: I motsetning til for m = 1, kan noen av stiene her inneholde sykler!\n           Det gjør det umulig å bruke den vanlige metoden med forgjengerpekere for\n           å finne stiene.\n           For spesielt interesserte: Men man kan se på dette som et eksempel på\n           bruken av mer generelle algebraiske strukturer, i dett …",
        "problemPage": 5,
        "solutionPage": 11
      },
      {
        "id": "2024-des-19",
        "number": 19,
        "title": "Du har oppgitt et flytnett (flow network) G = (V, E), med følgende endringer:",
        "prompt": "5 % 19   Du har oppgitt et flytnett (flow network) G = (V, E), med følgende endringer:\n\n          Algoritme 1\n           1   for each vertex u ∈ G.V − {s}\n           2        u.d = ∞\n           3   s.d = 0\n           4   Q=∅\n           5   Insert(Q, s)\n           6   while Q ̸= ∅\n           7        u = Extract-Min(Q)\n           8        for each vertex v in G.Adj[u]\n           9             if v.d > u.d + w(u, v)                  // tilsvarer Relax\n          10                  v.d = u.d + w(u, v)\n          11                  if v is in Q                       // tar konstant tid\n          12                        Decrease-Key(Q, v, v.d)\n          13                  else Insert(Q, v)\n\n           • Kilde (source) s og sluk (sink) t er fjernet.\n           • I tillegg til kapasitet, har hver kant (u, v) fått en nedre grense b(u, v).\n         I stedet for f (u, v) ⩾ 0, krever vi nå f (u, v) ⩾ b(u, v) for alle u, v ∈ V.\n         Som for kapasiteter, sier vi at b(u, v) = 0 hvis (u, v) ∈\n                                                                 / E.\n         Målet er ikke å maksimere noe, men å finne en hvilken som helst flyt som til-\n         fredsstiller både kapasitetene og de nedre grensene, der flyten inn er lik flyten\n         ut i alle noder – en såkalt sirkulasjon.\n         Hvordan kan du redusere dette til et vanlig flytproblem? Forklar kort.\n         Hint: Hvis f ′ (u, v) = f (u, v) − b(u, v) har vi f ′ (u, v) ⩾ 0 og, for alle u ∈ V,\n\n                       ∑ f ′ (u, v) + ∑ b(u, v) = ∑ f ′ (v, u) + ∑ b(v, u) .\n                       v ∈V            v ∈V             v ∈V          v ∈V\n\n         Merk: Det er ikke sikkert at en gyldig sirkulasjon eksisterer!",
        "solution": "5 % 19   Du har oppgitt et flytnett (flow network) G = (V, E), med følgende endringer:\n           • Kilde (source) s og sluk (sink) t er fjernet.\n           • I tillegg til kapasitet, har hver kant (u, v) fått en nedre grense b(u, v).\n\n         I stedet for f (u, v) ⩾ 0, krever vi nå f (u, v) ⩾ b(u, v) for alle u, v ∈ V.\n         Som for kapasiteter, sier vi at b(u, v) = 0 hvis (u, v) ∈\n                                                                 / E.\n         Målet er ikke å maksimere noe, men å finne en hvilken som helst flyt som til-\n         fredsstiller både kapasitetene og de nedre grensene, der flyten inn er lik flyten\n         ut i alle noder – en såkalt sirkulasjon.\n         Hvordan kan du redusere dette til et vanlig flytproblem? Forklar kort.\n         Hint: Hvis f ′ (u, v) = f (u, v) − b(u, v) har vi f ′ (u, v) ⩾ 0 og, for alle u ∈ V,\n\n                       ∑ f ′ (u, v) + ∑ b(u, v) = ∑ f ′ (v, u) + ∑ b(v, u) .\n                       v ∈V            v ∈V           v ∈V            v ∈V\n\n         Merk: Det er ikke sikkert at en gyldig sirkulasjon eksisterer!\n\n           Sett kapasiteter til c(u, v) − b(u, v). Legg til kilde s og sluk t. For hver node u,\n           legg til kanter (s, u) og (u, t) med kapasiteter ∑v∈V b(v, u) og ∑v∈V b(u, v).\n           Finn maks-flyt f ′ (u, v). Hvis kantene fra s og til t fylles, øk flyten med b(u, v)\n           for å få sirkulasjonen f (u, v). Ellers finnes ingen gyldig sirkulasjon.\n           Poenget er altså å splitte flyten f (u, v) i to komponenter, f ′ (u, v) og b(u, v),\n           der 0 ⩽ f ′ (u, v) ⩽ c(u, v) − b(u, v). Vi må ha en flyt på minst ∑v b(v, u)\n           inn i node u og minst ∑v b(u, v) ut. Vi flytter midlertidig denne delen av\n           flyten fra de opprinnelige kantene til nye kanter fra s og til t. …",
        "problemPage": 5,
        "solutionPage": 11
      },
      {
        "id": "2024-des-20",
        "number": 20,
        "title": "Din venn Smartnes jobber med å matche n organdonorer og n resipienter, med",
        "prompt": "5 % 20   Din venn Smartnes jobber med å matche n organdonorer og n resipienter, med\n         prioriterte ventelister. Han modellerer dette som en modifisert utgave av stabil\n         matching (the stable marriage problem), med donorer som «kvinner» og resipien-\n         ter som «menn»:\n           • Ventelistene implementeres ved at alle har like preferanser. Det vil si, alle\n             kvinner rangerer mennene likt, og alle menn rangerer kvinnene likt.\n           • Ikke alle er kompatible, så den bipartitte grafen er ikke nødvendigvis kom-\n             plett. Du kan altså ikke alltid matche enhver kvinne med enhver mann.\n           • Som i vanlig bipartitt matching (maximum bipartite matching) er målet å\n             matche flest mulig.\n         Smartnes er ikke sikker på om det helt gir mening, men han beholder det opp-\n         rinnelige kravet til stabilitet:\n\n Figur 4\n\n                                                                    blokkerende\n       rangering\n\n                                                  w             m\n                                                                    par\n\n                      stabil                          ustabil\n\n  • Du kan ikke ha en kvinne og en mann som heller vil ha hverandre enn\n    partnerne sine (et såkalt blokkerende par, som w og m i figur 4).\nHan har prøvd å løse problemet ved å kombinere Ford-Fulkerson (for størst\nmulig matching) og Gale-Shapley (for stabil matching), men har måttet gi opp.\nNå lurer han på om du har noen ideer.\nHvordan ville du ha løst problemet til Smartnes? Forklar kort.\nDersom det er enklere, så holder det at du finner størrelsen på den største stabile\nmatchingen, uten å faktisk finne selve matchingen.\nMerk: Under Smartnes sin definisjon, kan en kvinne og mann altså utgjøre et\nblokke …",
        "solution": "5 % 20   Din venn Smartnes jobber med å matche n organdonorer og n resipienter, med\n         prioriterte ventelister. Han modellerer dette som en modifisert utgave av stabil\n         matching (the stable marriage problem), med donorer som «kvinner» og resipien-\n         ter som «menn»:\n           • Ventelistene implementeres ved at alle har like preferanser. Det vil si, alle\n             kvinner rangerer mennene likt, og alle menn rangerer kvinnene likt.\n           • Ikke alle er kompatible, så den bipartitte grafen er ikke nødvendigvis kom-\n             plett. Du kan altså ikke alltid matche enhver kvinne med enhver mann.\n           • Som i vanlig bipartitt matching (maximum bipartite matching) er målet å\n             matche flest mulig.\n         Smartnes er ikke sikker på om det helt gir mening, men han beholder det opp-\n         rinnelige kravet til stabilitet:\n           • Du kan ikke ha en kvinne og en mann som heller vil ha hverandre enn\n             partnerne sine (et såkalt blokkerende par, som w og m i figur 4).\n         Han har prøvd å løse problemet ved å kombinere Ford-Fulkerson (for størst\n         mulig matching) og Gale-Shapley (for stabil matching), men har måttet gi opp.\n         Nå lurer han på om du har noen ideer.\n\n Figur 4\n\n                                                                              blokkerende\n       rangering\n\n                                                          w              m\n                                                                              par\n\n                           stabil                              ustabil\n\nHvordan ville du ha løst problemet til Smartnes? Forklar kort.\nDersom det er enklere, så holder det at du finner størrelsen på den største stabile\nmatchingen, uten å faktisk finne selve matchingen. …",
        "problemPage": 6,
        "solutionPage": 12
      }
    ]
  },
  {
    "id": "2025-aug",
    "title": "5. august 2025",
    "term": "2025 Aug",
    "problemPdf": "https://algdat.idi.ntnu.no/arkiv/2025.aug.tdt4120.oppg.no.pdf",
    "solutionPdf": "https://algdat.idi.ntnu.no/arkiv/2025.aug.tdt4120.losn.no.pdf",
    "tasks": [
      {
        "id": "2025-aug-01",
        "number": 1,
        "title": "Sammenlign lenkede lister (linked lists) med tabeller (arrays). Hvilke fordeler og",
        "prompt": "1   Sammenlign lenkede lister (linked lists) med tabeller (arrays). Hvilke fordeler og\n    ulemper har de, sammenlignet med hverandre? Forklar.",
        "solution": "1   Sammenlign lenkede lister (linked lists) med tabeller (arrays). Hvilke fordeler og\n    ulemper har de, sammenlignet med hverandre? Forklar.\n\n      Her forventes det at man forklarer forskjeller i kjøretid for oppslag og inn-\n      setting/endring.\n      Det er også mulig å trekke inn f.eks. minnebruk og utvidelse (dynamiske\n      tabeller).",
        "problemPage": 1,
        "solutionPage": 1
      },
      {
        "id": "2025-aug-02",
        "number": 2,
        "title": "Kan man ha en ustabil matching om man bare har to par? Forklar kort.",
        "prompt": "2   Kan man ha en ustabil matching om man bare har to par? Forklar kort.",
        "solution": "2   Kan man ha en ustabil matching om man bare har to par? Forklar kort.\n\n      Ja, f.eks. om A og B helst vil ha hverandre, men matches med C og D.\n      Dette er oppgave 25.2-2 fra læreboka.",
        "problemPage": 1,
        "solutionPage": 1
      },
      {
        "id": "2025-aug-03",
        "number": 3,
        "title": "Hvis et flytnett (flow network) kun har heltallskapasiteter, så vil den største mu-",
        "prompt": "3   Hvis et flytnett (flow network) kun har heltallskapasiteter, så vil den største mu-\n    lige flytverdien også være heltallig. Om vi finner flyten med Ford-Fulkerson-\n    metoden, vil flyten i hver eneste kant også være et heltall. Kan det finnes andre\n    optimale løsninger der flyten i noen av kantene ikke er heltall? Forklar.",
        "solution": "3   Hvis et flytnett (flow network) kun har heltallskapasiteter, så vil den største mu-\n    lige flytverdien også være heltallig. Om vi finner flyten med Ford-Fulkerson-\n    metoden, vil flyten i hver eneste kant også være et heltall. Kan det finnes andre\n    optimale løsninger der flyten i noen av kantene ikke er heltall? Forklar.\n\n      Ja. Om man kan fordele flyten som man vil, kan man i mange tilfeller re-\n      dusere flyten ett sted med mindre enn 1, og øken den tilsvarende et annet\n      sted, f.eks. Poenget er at metoder basert på forøkning alltid fyller opp så\n\n     Algoritme 1\n     Too-Tired-For-This(X, n, k )\n      1 for i = 2 to n\n      2       y = X[ i ]\n      3       j=i−1\n      4       while j > 0 and X[ j] > y and j ⩾ i − k\n      5             X[ j + 1] = X[ j ]\n      6             j= j−1\n      7       X[ j + 1] = y\n      8       if j > 0 and X[ j] > y\n      9             return false\n     10 return true\n\n      mye de kan, og dermed unngår dette.",
        "problemPage": 1,
        "solutionPage": 1
      },
      {
        "id": "2025-aug-04",
        "number": 4,
        "title": "Om du bygger et binært søketre av n elementer, hva blir kjøretiden til søk i treet",
        "prompt": "4   Om du bygger et binært søketre av n elementer, hva blir kjøretiden til søk i treet\n    etterpå, i beste og verste tilfelle, og i gjennomsnitt? Forklar.\n    Du bruker altså Tree-Insert for å sette inn ett og ett element, der treet til å\n    begynne med er tomt, og vi er ute etter kjøretiden til Tree-Search på det ferdige\n    treet (best-case, worst-case og average-case). Du kan anta at elementene er tallene\n    1 . . . n i en (uniformt) tilfeldig rekkefølge.\n\n     Algoritme 1\n     Too-Tired-For-This(X, n, k )\n      1 for i = 2 to n\n      2       y = X[ i ]\n      3       j=i−1\n      4       while j > 0 and X[ j] > y and j ⩾ i − k\n      5             X[ j + 1] = X[ j ]\n      6             j= j−1\n      7       X[ j + 1] = y\n      8       if j > 0 and X[ j] > y\n      9             return false\n     10 return true",
        "solution": "4   Om du bygger et binært søketre av n elementer, hva blir kjøretiden til søk i treet\n    etterpå, i beste og verste tilfelle, og i gjennomsnitt? Forklar.\n    Du bruker altså Tree-Insert for å sette inn ett og ett element, der treet til å\n    begynne med er tomt, og vi er ute etter kjøretiden til Tree-Search på det ferdige\n    treet (best-case, worst-case og average-case). Du kan anta at elementene er tallene\n    1 . . . n i en (uniformt) tilfeldig rekkefølge.\n\n      I beste tilfelle blir kjøretiden Θ(1), uavhengig av hvordan treet er struktu-\n      rert, siden vi kan ende med å søke etter rota.\n      I verste tilfelle er treet helt ubalansert, og vi søker etter en av de nederste\n      nodene, og ender med kjøretid Θ(n).\n      I gjennomsnitt blir høyden til treet Θ(lg n), og dette blir også den gjennom-\n      snittlige kjøretiden, siden flertallet av nodene har denne dybden.",
        "problemPage": 1,
        "solutionPage": 2
      },
      {
        "id": "2025-aug-05",
        "number": 5,
        "title": "Se prosedyren i algoritme 1. Hva er kjøretiden i beste og verste tilfelle? Hva kan",
        "prompt": "5   Se prosedyren i algoritme 1. Hva er kjøretiden i beste og verste tilfelle? Hva kan\n    prosedyren brukes til? Forklar.\n\n                                                                  √",
        "solution": "5   Se prosedyren i algoritme 1. Hva er kjøretiden i beste og verste tilfelle? Hva kan\n    prosedyren brukes til? Forklar.\n    Du kan anta at n er lengden til X, og at vi vil ha kjøretiden uttrykt ved n og k,\n    der k ⩽ n. Forskjellen på beste og verste tilfelle er altså bare innholdet i X.\n\n      Dette er en generalisering av Insertion-Sort, som “ikke orker” å sortere\n      helt ferdig, dersom det er for mye jobb. Det vil si, vi har lagt til en ekstra\n      betingelse i linje 4. Dersom X er sortert, er kjøretiden Θ(n), siden vi aldri går\n      inn i den indre løkka. Dersom X er omvendt sortert, er kjøretiden Θ(kn),\n      siden den indre løkka da alltid vil kjøre så lenge som mulig (altså Θ(k )\n      ganger). Men den laveste kjøretiden får man om de første k elementene er\n      sortert, etterfulgt av et mindre element. Da blir kjøretiden Θ(k ).\n\n      Prosedyren returnerer true eller false, avhengig av om alle elementene\n      havnet på rett plass. Det vil si, den forteller oss om den klarte å sorterte\n      tabellen eller ikke. Dermed kan den f.eks. brukes til å få bedre kjøretid for\n      tabeller som er nesten sorterte (dvs., der vi må flytte elementene maks k\n      hakk), som følger:\n      1 if not Too-Tired-For-This(X, n, k )\n      2      Merge-Sort(X, 1, n)\n      Merk: På eksamen var A brukt i stedet for X på linje 2. Det er tatt hensyn\n      til dette under sensur.\n\n                                                                  √",
        "problemPage": 2,
        "solutionPage": 2
      },
      {
        "id": "2025-aug-06",
        "number": 6,
        "title": "Løs den algoritmiske rekurrensen T(n) = 4T(9n/16)/3 + n. Forklar.",
        "prompt": "6   Løs den algoritmiske rekurrensen T(n) = 4T(9n/16)/3 +             n. Forklar.",
        "solution": "6   Løs den algoritmiske rekurrensen T(n) = 4T(9n/16)/3 +             n. Forklar.\n\n      Bruk masterteoremet, med a = 4/3, b = 16/9 og f = n1/2 . Siden b =\n                           1/2. Det betyr at f = Θ(nlogb a ), og dermed T(n) =\n      a2 , har vi logb a = √\n      Θ(nlogb a lg n) = Θ( n lg n).",
        "problemPage": 2,
        "solutionPage": 3
      },
      {
        "id": "2025-aug-07",
        "number": 7,
        "title": "Din venn Gløgsund spiller et spill, der hun utforsker en verden, og skal inn-",
        "prompt": "7   Din venn Gløgsund spiller et spill, der hun utforsker en verden, og skal inn-\n    om et sett med landsbyer. Hun ønsker å utforske alle landsbyene så effektivt\n    som mulig, og mener det blir omtrent som handelsreiseproblemet (the traveling-\n    salesperson problem, TSP).\n    Hun er usikker på om det er fullt så vanskelig, riktignok, av to grunner:\n       1. Det er snakk om et spesialtilfelle, der noder u, v er punkter i planet, og\n          kostnaden c(u, v) er avstanden i rett linje mellom dem.\n       2. I TSP er det forbudt å besøke en node flere ganger, men her kan hun jo\n          gjøre som hun vil.\n    Hun spør sin venn Klokland, som også er litt usikker. Hun kan fortelle at det\n    første punktet nok ikke hjelper; det betyr bare at det er snakk om såkalt euklidsk\n    TSP, som fortsatt er NP-hardt. Men det andre punktet er hun ikke sikker på.\n    Hjelp Gløgsund, ved å enten finne en effektiv algoritme for problemet, eller ved\n    å bruke en reduksjon til å vise at det er NP-hardt. Forklar svaret ditt.",
        "solution": "7   Din venn Gløgsund spiller et spill, der hun utforsker en verden, og skal inn-\n    om et sett med landsbyer. Hun ønsker å utforske alle landsbyene så effektivt\n    som mulig, og mener det blir omtrent som handelsreiseproblemet (the traveling-\n    salesperson problem, TSP).\n    Hun er usikker på om det er fullt så vanskelig, riktignok, av to grunner:\n      1. Det er snakk om et spesialtilfelle, der noder u, v er punkter i planet, og\n         kostnaden c(u, v) er avstanden i rett linje mellom dem.\n      2. I TSP er det forbudt å besøke en node flere ganger, men her kan hun jo\n         gjøre som hun vil.\n    Hun spør sin venn Klokland, som også er litt usikker. Hun kan fortelle at det\n    første punktet nok ikke hjelper; det betyr bare at det er snakk om såkalt euklidsk\n    TSP, som fortsatt er NP-hardt. Men det andre punktet er hun ikke sikker på.\n    Hjelp Gløgsund, ved å enten finne en effektiv algoritme for problemet, eller ved\n    å bruke en reduksjon til å vise at det er NP-hardt. Forklar svaret ditt.\n\n      Det er fortsatt NP-hardt, selv med disse spesialiseringene. Poenget er at\n      man generelt vil ende opp med samme løsning, fordi det aldri vil lønne seg\n      å gå innom en node flere ganger, selv om det er tillatt. Reduksjonen fra TSP\n      er dermed triviell, det vil si, man trenger ikke gjøre noe.\n      Merk at grunnen til at det ikke lønner seg er nettopp at vi her er underlagt\n      trekantulikheten. Det vil si, å gå direkte fra u til v vil aldri være lengre enn\n      å gå innom en annen node på veien. For generelle kostnader/avstander er\n      dette ikke nødvendigvis sant, og forbudet mot å besøke noder flere ganger\n      har dermed en betydning da.",
        "problemPage": 2,
        "solutionPage": 3
      },
      {
        "id": "2025-aug-08",
        "number": 8,
        "title": "(Forts. fra oppg. 7) Klokland oppdager at Gløgsund ikke har lest instruksjonene",
        "prompt": "8   (Forts. fra oppg. 7) Klokland oppdager at Gløgsund ikke har lest instruksjonene\n    ordentlig: Spillet støtter teleportasjon (fast-travel), så hun helt uten kostnad kan\n    forflytte seg til landsbyer hun allerede har vært innom. Det gjør jo at hun kan\n    bruke mindre tid på å gjøre seg ferdig, men begge er fortsatt usikre på hvor\n    vanskelig det er å finne den optimale reiseruten.\n    Hjelp Gløgsund, ved å enten finne en effektiv algoritme for problemet, eller ved\n    å bruke en reduksjon til å vise at det er NP-hardt. Forklar svaret ditt.",
        "solution": "8   (Forts. fra oppg. 7) Klokland oppdager at Gløgsund ikke har lest instruksjonene\n    ordentlig: Spillet støtter teleportasjon (fast-travel), så hun helt uten kostnad kan\n    forflytte seg til landsbyer hun allerede har vært innom. Det gjør jo at hun kan\n    bruke mindre tid på å gjøre seg ferdig, men begge er fortsatt usikre på hvor\n    vanskelig det er å finne den optimale reiseruten.\n    Hjelp Gløgsund, ved å enten finne en effektiv algoritme for problemet, eller ved\n    å bruke en reduksjon til å vise at det er NP-hardt. Forklar svaret ditt.\n\n      Problemet her er tilsvarer å koble sammen nodene billigst mulig, og blir\n      dermed det samme som å finne et minst mulig spenntre, som kan gjøres\n      i polynomisk tid med f.eks. MST-Prim eller MST-Kruskal, med kjøretid\n      O(E lg V).\n      F.eks. kan hun alltid teleportere til den landsbyen A som ligger nærmest\n      en ubesøkt landsby B, og så gå til B, som tilsvarer en «manuell utførelse»\n      av MST-Prim, men hun kan også bare finne spenntreet først, og så besøke\n      landsbyene i en mer vilkårlig rekkefølge.",
        "problemPage": 2,
        "solutionPage": 4
      },
      {
        "id": "2025-aug-09",
        "number": 9,
        "title": "Dine venner Lurvik og Smartnes har kommet over følgende algoritme, med",
        "prompt": "9   Dine venner Lurvik og Smartnes har kommet over følgende algoritme, med\n    beskrivelsen «How to sort a list in linear time»:\n    Linear-Sort(A, n)\n    1 t0 = time()\n    2 Merge-Sort(A, 1, n)\n    3 Sleep(1 000 000 n − (time() − t0 ))\n\n    De er begge enige om at det er litt «juks» å gjøre ting på den måten algoritmen\n    gjør, men de har en litt filosofisk diskusjon om hva det er rimelig å si om kjøre-\n    tiden. Lurvik mener man fint kan si at algoritmen har lineær kjøretid, mens\n    Smartnes mener det er helt urimelig.\n    Hva mener du? Finn argumenter både for og imot. Diskuter og forklar.\n    Her er time en funksjon som gir nåværende tidspunkt, mens Sleep er en prose-\n    dyre som venter et visst tidsintervall. Akkurat hva tidsenheten er er litt uklart.",
        "solution": "9   Dine venner Lurvik og Smartnes har kommet over følgende algoritme, med\n    beskrivelsen «How to sort a list in linear time»:\n    Linear-Sort(A, n)\n    1 t0 = time()\n    2 Merge-Sort(A, 1, n)\n    3 Sleep(1 000 000 n − (time() − t0 ))\n\n    De er begge enige om at det er litt «juks» å gjøre ting på den måten algoritmen\n    gjør, men de har en litt filosofisk diskusjon om hva det er rimelig å si om kjøre-\n    tiden. Lurvik mener man fint kan si at algoritmen har lineær kjøretid, mens\n    Smartnes mener det er helt urimelig.\n    Hva mener du? Finn argumenter både for og imot. Diskuter og forklar.\n    Her er time en funksjon som gir nåværende tidspunkt, mens Sleep er en prose-\n    dyre som venter et visst tidsintervall. Akkurat hva tidsenheten er er litt uklart.\n\n      Et generelt argument imot er at det vil bryte med sorteringsgrensen, som\n      gir oss en kjøretid på Ω(n lg n) i verste tilfelle. Man kan også se at om man\n      velger en stor nok n0 i definisjonen av den asymptotiske notasjonen, så\n      vil Sleep ikke gi oss noen pause, og kjøretiden følger dermed direkte fra\n      Merge-Sort, og er Θ(n lg n). (Ev. kan man argumentere for at man da får\n      problemer med et negativt argument til Sleep.)\n      På den annen side, må n trolig bli helt urimelig stor før kjøretiden ikke\n      lenger skal være 1 000 000 n, som jo er en lineær funksjon. Akkurat hvor\n      stor n må bli, kommer an på konstantleddene som er involvert, inkl. tids-\n      enheten som brukes, men siden det innebærer en sammenligning av lg n\n      og 1 000 000, vil vi fort kunne ende med å kreve en større n enn det som er\n\n       fysisk mulig (f.eks. flere elementer enn partikler i det observerbare univer-\n       set).\n       Algoritmen er hentet fra https://xkcd.com/3026, og har billedteksten …",
        "problemPage": 2,
        "solutionPage": 4
      },
      {
        "id": "2025-aug-10",
        "number": 10,
        "title": "Du har oppgitt en rettet graf G = (V, E) og to noder s, t ∈ V, og skal avgjøre",
        "prompt": "10   Du har oppgitt en rettet graf G = (V, E) og to noder s, t ∈ V, og skal avgjøre\n     om det finnes en sti fra s til t i G. Problemet er at du har svært begrenset minne,\n     som bare har plass til O(lg V) variable!\n     Én måte å bryte ned problemet må, kjent fra bl.a. korteste vei fra alle til alle,\n     er å definere et sett med delproblemer ved hjelp av start- og sluttnode og det\n     maksimale antallet kanter vi får bruke, k.\n     Beskriv en rekursiv dekomponering, og forklar hvordan denne kan brukes til å\n     løse problemet, hvis du altså kun får bruke logaritmisk minne, men så lang tid\n     du vil. Forklar svaret ditt.\n     Hint: Prøv å lage en rekursiv algoritme, der hvert rekursive kall har et konstant\n     antall lokale variable, og der rekursjonsdybden er O(lg V).\n     Merk at variablene det er snakk om her, er typen som kan behandles i konstant\n     tid i følge RAM-modellen (f.eks. boolske verdier eller heltall).",
        "solution": "10   Du har oppgitt en rettet graf G = (V, E) og to noder s, t ∈ V, og skal avgjøre\n     om det finnes en sti fra s til t i G. Problemet er at du har svært begrenset minne,\n     som bare har plass til O(lg V) variable!\n     Én måte å bryte ned problemet må, kjent fra bl.a. korteste vei fra alle til alle,\n     er å definere et sett med delproblemer ved hjelp av start- og sluttnode og det\n     maksimale antallet kanter vi får bruke, k.\n     Beskriv en rekursiv dekomponering, og forklar hvordan denne kan brukes til å\n     løse problemet, hvis du altså kun får bruke logaritmisk minne, men så lang tid\n     du vil. Forklar svaret ditt.\n     Hint: Prøv å lage en rekursiv algoritme, der hvert rekursive kall har et konstant\n     antall lokale variable, og der rekursjonsdybden er O(lg V).\n     Merk at variablene det er snakk om her, er typen som kan behandles i konstant\n     tid i følge RAM-modellen (f.eks. boolske verdier eller heltall).\n\n       Dekomponeringen tilsvarer den som brukes f.eks. i Faster-APSP: Den kor-\n       teste veien fra u til v med maks k kanter må gå innom en «midterste» node\n       w, der man har maks ⌊k/2⌋ kanter på den korteste stien fra u til w, og maks\n       ⌈k/2⌉ fra w til v. Disse to stiene kan man så finne rekursivt.\n       Siden antall kanter halveres for hvert rekursjonsnivå, og den korteste stien\n       fra s til t maksimalt kan ha |V| − 1 kanter i utgangspunktet, får vi en rekur-\n       sjonsdybde på O(lg V). I hvert kall lagrer vi bare start- og sluttnode, samt\n       parameteren k.\n       For spesielt interesserte: At dette problemet kan løses med logaritmisk\n       minne er et teorem etter Savitch, fra 1970. I sin vanlige form, uttrykkes det\n       gjerne i antall bits som kreves, som er O(lg2 n).",
        "problemPage": 3,
        "solutionPage": 5
      },
      {
        "id": "2025-aug-11",
        "number": 11,
        "title": "Du regner på næringsinnholdet i mat, og har representert informasjonen du",
        "prompt": "11   Du regner på næringsinnholdet i mat, og har representert informasjonen du\n     har som en vektet, rettet, asyklisk graf G = (V, E), der (u, v) ∈ E betyr at målti-\n     det eller matvaren u inneholder ingrediensen eller næringsstoffet v, og w(u, v)\n     angir mengden.\n     Du får oppgitt en mengde av en bestemt matvare, og skal skrive ut en oversikt\n     over næringsinnholdet. Hvordan vil du gå frem? Forklar.\n     Hver node har sin egen enhet, så u kan f.eks. være «ml olivenolje», mens v\n     er «g mettet fett», og w(u, v) = 0,133, som betyr at 15 ml olivenolje inneholder\n     15 × 0,133 = 2 g mettet fett. Du er ute etter det totale innholdet av grunnleggende\n     næringsstoffer, representert av noder uten ut-kanter.\n     Merk at det kan være snakk om flere nivåer, der A inneholder B, som inneholder\n     C, . . . etc.",
        "solution": "11   Du regner på næringsinnholdet i mat, og har representert informasjonen du\n     har som en vektet, rettet, asyklisk graf G = (V, E), der (u, v) ∈ E betyr at målti-\n     det eller matvaren u inneholder ingrediensen eller næringsstoffet v, og w(u, v)\n     angir mengden.\n     Du får oppgitt en mengde av en bestemt matvare, og skal skrive ut en oversikt\n     over næringsinnholdet. Hvordan vil du gå frem? Forklar.\n     Hver node har sin egen enhet, så u kan f.eks. være «ml olivenolje», mens v\n     er «g mettet fett», og w(u, v) = 0,133, som betyr at 15 ml olivenolje inneholder\n     15 × 0,133 = 2 g mettet fett. Du er ute etter det totale innholdet av grunnleggende\n     næringsstoffer, representert av noder uten ut-kanter.\n\n     Merk at det kan være snakk om flere nivåer, der A inneholder B, som inneholder\n     C, . . . etc.\n\n       Kjernen i løsningen er rett og slett en rekursiv traversering à la DFS, men der\n       man følger alle stier (og altså besøker noder flere ganger), og akkumulerer\n       mengden man finner av ulike grunnleggende næringsstoffer.\n       For mange reelle datasett vil det være tilstrekkelig, men kjøretiden vi vokse\n       eksponentielt med lengden på stiene, så man bør innføre en eller annen\n       form for memoisering. Det vil si, når man har funnet næringsinnholdet for\n       node, lagrer man det, så man slipper å traversere videre fra den noden sene-\n       re. (En mulighet er å bruke en form for stikomprimering, path compression,\n       som i tre-representasjonen av disjunkte mengder. Det vil si, at man bytter\n       ut ut-kantene med direktekanter til grunnleggende næringsstoffer, med en\n       vekt som tilsvarer innholdet.)\n       Med memoisering går kjøretiden fra å være eksponentiell til å være lineær.\n       Her kan man også nevne topolog …",
        "problemPage": 3,
        "solutionPage": 5
      },
      {
        "id": "2025-aug-12",
        "number": 12,
        "title": "Innen fagfeltet rettferdig fordeling (fair allocation) finnes det et bestemt problem,",
        "prompt": "12   Innen fagfeltet rettferdig fordeling (fair allocation) finnes det et bestemt problem,\n     der man vil fordele nodene i en graf på et sett med mottakere, så rettferdig som\n     mulig, slik at nodene hver mottaker får utgjør en sammenhengende graf. Det kan\n     f.eks. være snakk om å fordele kontor på ulike grupper, der kantene i grafen\n     angir hvilke kontor som er nabokontor, og hver gruppe vil ha et sett med kontor\n     som ligger samlet.\n     Du skal løse et spesialtilfelle av dette, der alle kontorene ligger på samme side\n     i en korridor, så grafen utgjør en sti.\n     For enkelhets skyld, antar vi at alle gruppene er enige om hvor fine kontorene\n     er, så hvert kontor får en verdi i form av et positivt tall. Vi ønsker å finne en\n     maksimin-fordeling, som er rettferdig i den forstand at den gruppen som får\n     den laveste totalverdien likevel får en så høy totalverdi som mulig.\n     Hvordan vil du løse dette problemet? Forklar.\n\nMerk at vi her kun ser på totalverdien hver gruppe får, og ikke har noe krav\ntil antallet kontor. Vi kan f.eks. anta at verdien henger sammen med størrelsen,\ndvs. antall personer det er plass til, så færre og bedre kontor er like ønskelig\nsom flere og dårligere.",
        "solution": "12   Innen fagfeltet rettferdig fordeling (fair allocation) finnes det et bestemt problem,\n     der man vil fordele nodene i en graf på et sett med mottakere, så rettferdig som\n     mulig, slik at nodene hver mottaker får utgjør en sammenhengende graf. Det kan\n     f.eks. være snakk om å fordele kontor på ulike grupper, der kantene i grafen\n     angir hvilke kontor som er nabokontor, og hver gruppe vil ha et sett med kontor\n     som ligger samlet.\n     Du skal løse et spesialtilfelle av dette, der alle kontorene ligger på samme side\n     i en korridor, så grafen utgjør en sti.\n     For enkelhets skyld, antar vi at alle gruppene er enige om hvor fine kontorene\n     er, så hvert kontor får en verdi i form av et positivt tall. Vi ønsker å finne en\n     maksimin-fordeling, som er rettferdig i den forstand at den gruppen som får\n     den laveste totalverdien likevel får en så høy totalverdi som mulig.\n     Hvordan vil du løse dette problemet? Forklar.\n     Merk at vi her kun ser på totalverdien hver gruppe får, og ikke har noe krav\n     til antallet kontor. Vi kan f.eks. anta at verdien henger sammen med størrelsen,\n     dvs. antall personer det er plass til, så færre og bedre kontor er like ønskelig\n     som flere og dårligere.\n\n       Dette kan løses med samme overordnede fremgangsmåte som stavkap-\n       pingsproblemet (rod-cutting), bare med en annen type kostnader. Dvs., for\n       hver i = 1, . . . n (der n er antall kontorer) prøver vi oss på å gi de første i\n       kontorene til én gruppe. Vi finner så maksimin for resten (rekursivt, med\n       memoisering) og så blir optimum for i lik minimum av disse to verdiene.\n\nVi velger så den i-en som gir oss størst verdi.\nDet kan også være naturlig å gjøre om prosedyren til en iterativ versjon som\nløser problemet fra bunnen, …",
        "problemPage": 3,
        "solutionPage": 6
      }
    ]
  },
  {
    "id": "2025-des",
    "title": "15. desember 2025",
    "term": "2025 Des",
    "problemPdf": "https://algdat.idi.ntnu.no/arkiv/2025.des.tdt4120.oppg.no.pdf",
    "solutionPdf": "https://algdat.idi.ntnu.no/arkiv/2025.des.tdt4120.losn.no.pdf",
    "tasks": [
      {
        "id": "2025-des-01",
        "number": 1,
        "title": "Hva er kjøretiden til prosedyren for å bygge en maks-haug, Build-Max-Heap?",
        "prompt": "5%   1   Hva er kjøretiden til prosedyren for å bygge en maks-haug, Build-Max-Heap?",
        "solution": "5%   1   Hva er kjøretiden til prosedyren for å bygge en maks-haug, Build-Max-Heap?\n\n           Θ ( n ).\n          Her gis også full uttelling for O(n).",
        "problemPage": 1,
        "solutionPage": 1
      },
      {
        "id": "2025-des-02",
        "number": 2,
        "title": "Din venn Lurvik har klart å vise at to av følgende beskrivelser av kjøretiden til",
        "prompt": "5%   2   Din venn Lurvik har klart å vise at to av følgende beskrivelser av kjøretiden til\n         en algoritme er korrekte, men han husker ikke hvilke to:\n            1. T(n) = O(n3 )\n            2. T(n) = Ω(n3 )\n            3. T(n) = Θ(n3 )\n         Sjefen hans har bedt ham velge ut én av beskrivelsene, og nå har Lurvik bedt\n         deg om hjelp. Hvilken av de tre velger du (nummer 1, 2 eller 3)? Forklar kort\n         hvorfor dette er et godt valg.",
        "solution": "5%   2   Din venn Lurvik har klart å vise at to av følgende beskrivelser av kjøretiden til\n         en algoritme er korrekte, men han husker ikke hvilke to:\n            1. T(n) = O(n3 )\n            2. T(n) = Ω(n3 )\n            3. T(n) = Θ(n3 )\n         Sjefen hans har bedt ham velge ut én av beskrivelsene, og nå har Lurvik bedt\n         deg om hjelp. Hvilken av de tre velger du (nummer 1, 2 eller 3)? Forklar kort\n         hvorfor dette er et godt valg.\n\n          Nummer 3, fordi Θ-notasjon er mest informativt. Om Lurvik har vist to\n          av disse, må han enten ha vist at nummer 3 stemmer, eller at både 1 og 2\n          stemmer, som impliserer nummer 3.",
        "problemPage": 1,
        "solutionPage": 1
      },
      {
        "id": "2025-des-03",
        "number": 3,
        "title": "Hva er det som gjør at Counting-Sort har lavere asymptotisk kjøretid enn",
        "prompt": "5%   3   Hva er det som gjør at Counting-Sort har lavere asymptotisk kjøretid enn\n         f.eks. Merge-Sort? Forklar kort.",
        "solution": "5%   3   Hva er det som gjør at Counting-Sort har lavere asymptotisk kjøretid enn\n         f.eks. Merge-Sort? Forklar kort.\n\n           At vi kun sorterer heltall i området 0 til k, for en konstant k.\n           Som vanlig, aksepteres alle forklaringer som får frem hovedpoenget.",
        "problemPage": 1,
        "solutionPage": 1
      },
      {
        "id": "2025-des-04",
        "number": 4,
        "title": "Lurvik og Smartnes har en heftig diskusjon. Smartnes mener man kan ha en",
        "prompt": "5%   4   Lurvik og Smartnes har en heftig diskusjon. Smartnes mener man kan ha en\n         algoritme med ulik asymptotisk kjøretid i beste og verste tilfelle, der den gjen-\n         nomsnittlige kjøretiden likevel er lik én av de to. Lurvik mener dette er umulig,\n         siden gjennomsnittet y av x og z alltid vil ligge imellom dem, altså x < y < z.\n         Bruk et eksempel fra pensum for å vise at Smartnes har rett. Forklar kort hvorfor\n         det er mulig.\n         Smartnes mener altså at average-case kan være lik enten best-case eller worst-case,\n         selv om best-case og worst-case er forskjellige.",
        "solution": "5%   4   Lurvik og Smartnes har en heftig diskusjon. Smartnes mener man kan ha en\n         algoritme med ulik asymptotisk kjøretid i beste og verste tilfelle, der den gjen-\n         nomsnittlige kjøretiden likevel er lik én av de to. Lurvik mener dette er umulig,\n         siden gjennomsnittet y av x og z alltid vil ligge imellom dem, altså x < y < z.\n         Bruk et eksempel fra pensum for å vise at Smartnes har rett. Forklar kort hvorfor\n         det er mulig.\n         Smartnes mener altså at average-case kan være lik enten best-case eller worst-case,\n         selv om best-case og worst-case er forskjellige.\n\n           Insertion-Sort har kjøretid Θ(n) i beste tilfelle og Θ(n2 ) i verste tilfelle.\n           Gjennomsnittlig kjøretid er Θ(n2 ). Grunnen til at dette er mulig er at den\n           asymptotiske notasjonen skjuler forskjeller i konstantfaktorene.\n           Som vanlig, godtas alle eksempler og forklaringer som får frem ho-\n           vedpoenget. F.eks. kan man bruke Quicksort, Randomized-Quicksort,\n           Randomized-Select eller søk i tilfeldige søketrær.",
        "problemPage": 1,
        "solutionPage": 2
      },
      {
        "id": "2025-des-05",
        "number": 5,
        "title": "Dette er den rekursive formuleringen av lengden til den lengste felles delse-",
        "prompt": "5%   5   Dette er den rekursive formuleringen av lengden til den lengste felles delse-\n         kvensen (longest common subsequence, LCS) for prefiksene Xi og Y j av X og Y.\n\n                                                                  if i = 0 or j = 0 ,\n                              \n                              0\n                              \n                  c[i, j] =                                       if i, j > 0 and xi = y j ,\n                              \n                                  max{c[i, j − 1], c[i − 1, j]}   if i, j > 0 and xi ̸= y j .\n                              \n\n         Hva er det som mangler? Forklar kort.",
        "solution": "5%   5   Dette er den rekursive formuleringen av lengden til den lengste felles delse-\n         kvensen (longest common subsequence, LCS) for prefiksene Xi og Y j av X og Y.\n\n                                                              if i = 0 or j = 0 ,\n                            \n                            0\n                            \n                   c[i, j] = c[i − 1, j − 1] + 1              if i, j > 0 and xi = y j ,\n                            \n                              max{c[i, j − 1], c[i − 1, j]}   if i, j > 0 and xi ̸= y j .\n                            \n\n         Hva er det som mangler? Forklar kort.\n\n           Hvis de to siste bokstavene er like, vil vi aldri tape på å ta dem med i løs-\n           ningen, som øker lengden med 1. I tillegg kommer svaret for Xi−1 og Y j−1 .",
        "problemPage": 1,
        "solutionPage": 2
      },
      {
        "id": "2025-des-06",
        "number": 6,
        "title": "Felles for følgende algoritmer er at hver node v har et bestemt felt av typen v.x",
        "prompt": "5%   6   Felles for følgende algoritmer er at hver node v har et bestemt felt av typen v.x\n         (men med et annet navn), som representerer en del av løsningen:\n            • DFS-Visit     (altså dybde-først-søk fra én node)\n            • BFS\n            • Dag-Shortest-Paths\n            • Dijkstra\n            • Bellman-Ford\n            • Prim\n         Hvilket felt er det snakk om (dvs., hva skal stå i stedet for «x» i «v.x»)? Hva\n         representerer det? Forklar kort.\n         Det er altså snakk om det samme feltet i alle algoritmene.",
        "solution": "5%   6   Felles for følgende algoritmer er at hver node v har et bestemt felt av typen v.x\n         (men med et annet navn), som representerer en del av løsningen:\n            • DFS-Visit (altså dybde-først-søk fra én node)\n            • BFS\n            • Dag-Shortest-Paths\n            • Dijkstra\n            • Bellman-Ford\n\n            • Prim\n         Hvilket felt er det snakk om (dvs., hva skal stå i stedet for «x» i «v.x»)? Hva\n         representerer det? Forklar kort.\n         Det er altså snakk om det samme feltet i alle algoritmene.\n\n           Det er snakk forgjenger-feltet, π, som angir foreldrenoden i treet som kon-\n           strueres (traverserings-tre, korteste-vei-tre eller minimalt spenntre).",
        "problemPage": 2,
        "solutionPage": 2
      },
      {
        "id": "2025-des-07",
        "number": 7,
        "title": "I skog-implementasjonen av disjunkte mengder (disjoint-set forests), som brukt",
        "prompt": "5%   7   I skog-implementasjonen av disjunkte mengder (disjoint-set forests), som brukt\n         bl.a. i Kruskal, hva skjer med foreldrepekerne når man bruker Find-Set?",
        "solution": "5%   7   I skog-implementasjonen av disjunkte mengder (disjoint-set forests), som brukt\n         bl.a. i Kruskal, hva skjer med foreldrepekerne når man bruker Find-Set?\n\n           Alle foreldrepekerne til nodene langs stien opp til rota flyttes til å peke di-\n           rekte på rota (såkalt stikomprimering, eller path compression).",
        "problemPage": 2,
        "solutionPage": 3
      },
      {
        "id": "2025-des-08",
        "number": 8,
        "title": "Dette er definisjonen av restkapasiteten (residual capacity) c f (u, v) i et flytnett",
        "prompt": "5%   8   Dette er definisjonen av restkapasiteten (residual capacity) c f (u, v) i et flytnett\n         (flow network) med flyt f :\n\n                                                           if (u, v) ∈ E ,\n                                            \n                                            \n                                            \n                             c f (u, v) =                  if (v, u) ∈ E ,\n                                            \n                                                0          otherwise .\n                                            \n\n         Hva er det som mangler? Forklar kort.",
        "solution": "5%   8   Dette er definisjonen av restkapasiteten (residual capacity) c f (u, v) i et flytnett\n         (flow network) med flyt f :\n\n                                                               if (u, v) ∈ E ,\n                                        \n                                        c(u, v) − f (u, v)\n                                        \n                            c f (u, v) = f (v, u)              if (v, u) ∈ E ,\n                                        \n                                          0                    otherwise .\n                                        \n\n         Hva er det som mangler? Forklar kort.\n\n           Vi kan øke flyten fra f (u, v) til c(u, v) langs (u, v), eller vi kan oppheve flyten\n           f (v, u) ved å sende den tilbake fra u til v.",
        "problemPage": 2,
        "solutionPage": 3
      },
      {
        "id": "2025-des-09",
        "number": 9,
        "title": "Du studerer et problem P, og vil sammenligne det med et annet, kjent problem",
        "prompt": "5%   9   Du studerer et problem P, og vil sammenligne det med et annet, kjent problem\n         Q ved å finne en effektiv reduksjon. Hvilken vei vil du redusere for å vise hva?\n         Forklar kort.",
        "solution": "5%   9   Du studerer et problem P, og vil sammenligne det med et annet, kjent problem\n         Q ved å finne en effektiv reduksjon. Hvilken vei vil du redusere for å vise hva?\n         Forklar kort.\n\n           Om Q er vanskelig, vil vi prøve å redusere fra Q til P, for å vise at P også er\n           vanskelig. Om Q er lett, vil vi redusere fra P til Q, for å vise at P også er lett.\n           Her kan man godt bruke polynomisk kjøretid eller P vs. NPC for å beskrive\n           vanskegrad, men det er ikke nødvendig.",
        "problemPage": 2,
        "solutionPage": 3
      },
      {
        "id": "2025-des-10",
        "number": 10,
        "title": "Hvordan kan antall sterke komponenter (strongly connected components) i en ret-",
        "prompt": "5 % 10   Hvordan kan antall sterke komponenter (strongly connected components) i en ret-\n         tet graf endres hvis man legger til en ny kant? Forklar kort.",
        "solution": "5 % 10   Hvordan kan antall sterke komponenter (strongly connected components) i en ret-\n         tet graf endres hvis man legger til en ny kant? Forklar kort.\n\n          Om man har n noder, kan man gå fra n sterke komponenter til 1. Det skjer\n          f.eks. om grafen er en rettet sti, og man legger til kanten som skal til for å\n          gjøre den til en rettet sykel.\n          Man kan naturligvis også få mindre endringer enn dette.\n          Dette er oppgave 20.5-1 fra læreboka.",
        "problemPage": 2,
        "solutionPage": 3
      },
      {
        "id": "2025-des-11",
        "number": 11,
        "title": "Hvorfor gir ikke Dijkstra nødvendigvis riktig svar dersom grafen vi bruker",
        "prompt": "5 % 11   Hvorfor gir ikke Dijkstra nødvendigvis riktig svar dersom grafen vi bruker\n         den på inneholder kanter med negativ vekt? Forklar kort.\n         Her må forklaringen være mer presis enn f.eks. at «valgene algoritmen gjør blir\n         gale». Hvorfor blir de gale? Bruk gjerne et eksempel, om du har behov for det.",
        "solution": "5 % 11   Hvorfor gir ikke Dijkstra nødvendigvis riktig svar dersom grafen vi bruker\n         den på inneholder kanter med negativ vekt? Forklar kort.\n         Her må forklaringen være mer presis enn f.eks. at «valgene algoritmen gjør blir\n         gale». Hvorfor blir de gale? Bruk gjerne et eksempel, om du har behov for det.\n\n          Vi risikerer da at noden med lavest avstandsestimat fortsatt kan få enda la-\n          vere avstandsestimat, etter at vi har besøkt andre noder.\n          Som vanlig, godtas alle forklaringer som får frem hovedpoenget.",
        "problemPage": 2,
        "solutionPage": 4
      },
      {
        "id": "2025-des-12",
        "number": 12,
        "title": "Hvor mye øker m om du utfører følgende prosedyre?",
        "prompt": "5 % 12   Hvor mye øker m om du utfører følgende prosedyre?\n\n          Figur 1\n\n                                        2        2       4\n                                    3       4        7       6\n\n                                1       5       3        1       5\n\n         1 for i = 1 to n\n         2       m=m+1\n         3       for j = 1 to n\n         4            m=m+1\n         5            for k = 1 to n\n         6                 m=m+1\n         Oppgi svaret i Θ-notasjon, som funksjon av n. Forklar kort.",
        "solution": "5 % 12   Hvor mye øker m om du utfører følgende prosedyre?\n         1 for i = 1 to n\n         2       m=m+1\n         3       for j = 1 to n\n         4            m=m+1\n         5            for k = 1 to n\n         6                 m=m+1\n         Oppgi svaret i Θ-notasjon, som funksjon av n. Forklar kort.\n\n          Θ(n3 ). Linje 2, 4 og 6 øker m med henholdsvis n, n2 og n3 .",
        "problemPage": 2,
        "solutionPage": 4
      },
      {
        "id": "2025-des-13",
        "number": 13,
        "title": "Hvor mye øker m om du utfører følgende prosedyre?",
        "prompt": "5 % 13   Hvor mye øker m om du utfører følgende prosedyre?\n         1 k=1\n         2 for i = 1 to n\n         3       m=m+k\n         4       k=k+k\n         Oppgi svaret i Θ-notasjon, som funksjon av n. Forklar kort.",
        "solution": "5 % 13   Hvor mye øker m om du utfører følgende prosedyre?\n         1 k=1\n         2 for i = 1 to n\n         3       m=m+k\n         4       k=k+k\n         Oppgi svaret i Θ-notasjon, som funksjon av n. Forklar kort.\n\n          Θ(2n ). Linje 4 dobler k for hver iterasjon, så linje 3 øker m med 2i . Totalt\n          økes m med ∑in=0 2n = 2n+1 − 1 = Θ(2n ).",
        "problemPage": 3,
        "solutionPage": 4
      },
      {
        "id": "2025-des-14",
        "number": 14,
        "title": "Løs følgende rekurrens eksakt:",
        "prompt": "5 % 14   Løs følgende rekurrens eksakt:\n         T(n) = T(n − 1) + 2n − 1\n         T(0) = 0\n         Oppgi svaret uten asymptotisk notasjon. Forklar kort.",
        "solution": "5 % 14   Løs følgende rekurrens eksakt:\n         T(n) = T(n − 1) + 2n − 1\n\n          Figur 1\n\n                                          2        2        4\n                                      3        4        7       6\n\n                                 1        5        3        1        5\n\n         T(0) = 0\n         Oppgi svaret uten asymptotisk notasjon. Forklar kort.\n\n           T(n) = (2n − 1) + T(n − 1)\n                                             \u0001\n                = (2n − 1) + 2(n − 1) − 1 + T(n − 2)\n                                             \u0001          \u0001                    \u0001\n                = (2n − 1) + 2(n − 1) − 1 + 2(n − 2) − 1 + · · · + 2 · 1 − 1\n                                                \u0001\n                = 2 n + ( n − 1) + · · · + 2 + 1 − n\n                                    \u0001\n                = 2 1+2+···+n −n\n                = 2 n(n + 1)/2 − n = n(n + 1) − n = n2\n                                \u0001\n\n           Her godtas også enklere utregninger eller forklaringer.",
        "problemPage": 3,
        "solutionPage": 4
      },
      {
        "id": "2025-des-15",
        "number": 15,
        "title": "Hva blir T(n), om du løser følgende rekursive ligningssett?",
        "prompt": "5 % 15   Hva blir T(n), om du løser følgende rekursive ligningssett?\n         T(n) = 2S(n/2) + (n lg n)2\n         S(n) = 8T(n/2) + n2\n         Oppgi svaret i Θ-notasjon. Forklar kort.\n         Bruk vanlige antagelser for algoritmiske rekurrenser.",
        "solution": "5 % 15   Hva blir T(n), om du løser følgende rekursive ligningssett?\n         T(n) = 2S(n/2) + (n lg n)2\n         S(n) = 8T(n/2) + n2\n         Oppgi svaret i Θ-notasjon. Forklar kort.\n         Bruk vanlige antagelser for algoritmiske rekurrenser.\n\n           T(n) = 2 8T((n/2)/2) + (n/2)2 + (n lg n)2\n                                        \u0001\n\n                = 16T(n/4) + n2 lg2 n + n2 /2\n           Løses f.eks. med masterteoremet, som gir:\n           T(n) = Θ(n2 lg3 n)",
        "problemPage": 3,
        "solutionPage": 5
      },
      {
        "id": "2025-des-16",
        "number": 16,
        "title": "Utfør den første av de |V| − 1 iterasjonene til Bellman-Ford på grafen i figur 1,",
        "prompt": "5 % 16   Utfør den første av de |V| − 1 iterasjonene til Bellman-Ford på grafen i figur 1,\n         under følgende betingelser:\n           1. Bruk node 1 som startnode.\n           2. Anta at 8 er brukt i stedet for ∞ under initialiseringen.\n           3. Der du kan velge mellom kanter, velg den med lavest vekt.\n\n          Figur 2\n\n                                            1     2/2     5\n                                                  1/ 1\n                                    2/ 2                        1/2\n                                            2     1/3     6\n                                    0/ 2                        1/1\n                              s                   0/ 2                  t\n                                    1/ 1                        1/2\n                                            3     1/3     7\n                                    1/ 1                        1/3\n                                                  0/ 2\n\n                                            4     1/3     8\n\n         Hva blir v.d for hver node v = 1, . . . , 5 etterpå? Forklar kort.\n         Oppgi verdien for hver node, i rekkefølge.",
        "solution": "5 % 16   Utfør den første av de |V| − 1 iterasjonene til Bellman-Ford på grafen i figur 1,\n         under følgende betingelser:\n            1. Bruk node 1 som startnode.\n            2. Anta at 8 er brukt i stedet for ∞ under initialiseringen.\n            3. Der du kan velge mellom kanter, velg den med lavest vekt.\n         Hva blir v.d for hver node v = 1, . . . , 5 etterpå? Forklar kort.\n         Oppgi verdien for hver node, i rekkefølge.\n\n          Figur 2\n\n                                            1     2/2     5\n                                                  1/ 1\n                                    2/ 2                        1/2\n                                            2     1/3     6\n                                    0/ 2                        1/1\n                              s                   0/ 2                  t\n                                    1/ 1                        1/2\n                                            3     1/3     7\n                                    1/ 1                        1/3\n                                                  0/ 2\n\n                                            4     1/3     8\n\n           0, 3, 5, 8, 8\n           Vi oppdaterer (med Relax) langs kantene med vekt 1, . . . , 7, i rekkefølge.\n           Av disse er det kun kantene (1, 2), (2, 3) og (1, 3), med vekt 3, 4 og 5, som\n           har noen effekt.",
        "problemPage": 3,
        "solutionPage": 5
      },
      {
        "id": "2025-des-17",
        "number": 17,
        "title": "Figur 2 viser et flytnett (flow network) med flyt. Utfør én iterasjon av Edmonds-",
        "prompt": "5 % 17   Figur 2 viser et flytnett (flow network) med flyt. Utfør én iterasjon av Edmonds-\n         Karp på flytnettet for å finne en forøkende sti (augmenting path). Oppgi nodene\n         i den resulterende stien, i rekkefølge. Forklar kort.",
        "solution": "5 % 17   Figur 2 viser et flytnett (flow network) med flyt. Utfør én iterasjon av Edmonds-\n         Karp på flytnettet for å finne en forøkende sti (augmenting path). Oppgi nodene\n         i den resulterende stien, i rekkefølge. Forklar kort.\n\n           s, 2, 5, t\n           Det finnes flere forøkende stier, men Edmonds-Karp velger den korteste.\n           Vi kan følge kanten (5, 2) baklengs, fordi det går flyt i den. Om man ikke\n           tar høyde for det, sitter man igjen med de forøkende stiene ⟨s, 2, 6, 3, 7, t⟩\n           og ⟨s, 2, 6, 3, 7, 4, 8, t⟩. Om man oppgir den korteste av disse (den første), gir\n           det 3 poeng. Om man oppgir den lengste, gir det 2 poeng.\n           Det samme uttelling også om man utelater s og t fra svaret.",
        "problemPage": 4,
        "solutionPage": 6
      },
      {
        "id": "2025-des-18",
        "number": 18,
        "title": "Nøklene (keys) i et søketre er vanligvis fra en ordnet mengde (f.eks. tall eller",
        "prompt": "5 % 18   Nøklene (keys) i et søketre er vanligvis fra en ordnet mengde (f.eks. tall eller\n         tekststrenger). Din venn Gløgsund har laget et søketre der hver node i stedet\n         inneholder et rektangel. Når hun skal bygge treet, tar hun inn et sett S med ikke-\n         overlappende rektangler, som legges i løvnodene. For hver indre node konstru-\n         erer hun et nytt rektangel: det minste som inneholder alle barnas rektangler.\n         Når hun skal søke i treet, tar hun inn et punkt, og sjekker rekursivt nedover i\n         treet hvilke rektangler som inneholder punktet, og returnerer det av disse som\n         ligger i en løvnode.\n         Gjør følgende antagelser:\n            • Rektanglene fordeles tilfeldig på løvnodene.\n            • Treet er perfekt balansert.\n         Hva blir kjøretiden for et søk, som funksjon av n = |S|? Gi både en øvre og\n         nedre grense, dvs., bruk enten Θ-notasjon eller både O- og Ω-notasjon.",
        "solution": "5 % 18   Nøklene (keys) i et søketre er vanligvis fra en ordnet mengde (f.eks. tall eller\n         tekststrenger). Din venn Gløgsund har laget et søketre der hver node i stedet\n         inneholder et rektangel. Når hun skal bygge treet, tar hun inn et sett S med ikke-\n         overlappende rektangler, som legges i løvnodene. For hver indre node konstru-\n         erer hun et nytt rektangel: det minste som inneholder alle barnas rektangler.\n         Når hun skal søke i treet, tar hun inn et punkt, og sjekker rekursivt nedover i\n         treet hvilke rektangler som inneholder punktet, og returnerer det av disse som\n         ligger i en løvnode.\n         Gjør følgende antagelser:\n            • Rektanglene fordeles tilfeldig på løvnodene.\n\n            • Treet er perfekt balansert.\n         Hva blir kjøretiden for et søk, som funksjon av n = |S|? Gi både en øvre og\n         nedre grense, dvs., bruk enten Θ-notasjon eller både O- og Ω-notasjon.\n\n          O(n), Ω(1). I beste tilfelle vil vi allerede i rotnoden oppdage at punktet vårt\n          ikke finnes i treet. I verste tilfelle, kan rektanglene fordeles slik at vi får et\n          lineært antall overlappende rektangler, som alle må besøkes.\n          Her er det ikke eksplisitt spesifisert hvor mange barn hver interne node har,\n          men det antas i utgangspunktet å være en konstant. Dersom man har antatt\n          noe annet, vil man kunne få uttelling likevel.\n          Ideen her var opprinnelig at man skulle søke etter et av punktene som var\n          dekket, men det er ikke spesifisert i oppgaven. Dersom man antar det, vil\n          man i beste tilfelle følge én sti fra rot til løvnode, og siden treet er balansert,\n          vil denne ha lengde Θ(lg n). Under denne antagelsen vil man kunne gi en\n          nedre grens …",
        "problemPage": 4,
        "solutionPage": 6
      },
      {
        "id": "2025-des-19",
        "number": 19,
        "title": "Du utvikler et kodebibliotek for tekstprosessering, og skal implementere funk-",
        "prompt": "5 % 19   Du utvikler et kodebibliotek for tekstprosessering, og skal implementere funk-\n         sjonen split(s, x), som deler strengen s ved alle forekomster av tegnet x. For\n         eksempel vil\n         split(\"abc;de;fghi;jk\", \";\")\n         returnere\n         [\"abc\", \"de\", \"fghi\", \"jk\"] .\n\n         Du kan finne indeksene til x i s med en løkke. For en gitt slik indeks, kan du\n         dele strengen i to mindre strenger, som er kopier av hver sin «halvdel».\n         Om strengen du deler inneholder n tegn, må du kopiere n − 1 tegn. Konstruer\n         og beskriv en algoritme som finner det minste totale antallet slike kopieringer\n         som trengs. Hva blir kjøretiden? Forklar.",
        "solution": "5 % 19   Du utvikler et kodebibliotek for tekstprosessering, og skal implementere funk-\n         sjonen split(s, x), som deler strengen s ved alle forekomster av tegnet x. For\n         eksempel vil\n         split(\"abc;de;fghi;jk\", \";\")\n         returnere\n         [\"abc\", \"de\", \"fghi\", \"jk\"] .\n         Du kan finne indeksene til x i s med en løkke. For en gitt slik indeks, kan du\n         dele strengen i to mindre strenger, som er kopier av hver sin «halvdel».\n         Om strengen du deler inneholder n tegn, må du kopiere n − 1 tegn. Konstruer\n         og beskriv en algoritme som finner det minste totale antallet slike kopieringer\n         som trengs. Hva blir kjøretiden? Forklar.\n\n          For hvert splittpunkt, løs problemet høyre og venstre side for seg. Memoi-\n          ser løsningen, f.eks. ved å ha en tabell A[1 : m, 1 : m] som indekseres med\n          start- og slutt-indeksene til segmentet man ser på. Denne tabellen kan også\n          bygget opp fra bunnen (bottom-up).\n          Det gis ingen uttelling i seg selv for å nevne dynamisk programmering.\n          Oppgaven baserer seg på oppgave 14-9 i læreboka.",
        "problemPage": 4,
        "solutionPage": 7
      },
      {
        "id": "2025-des-20",
        "number": 20,
        "title": "For to grafer G og H er en grafhomomorfi f : G → H en funksjon f fra G.V til",
        "prompt": "5 % 20   For to grafer G og H er en grafhomomorfi f : G → H en funksjon f fra G.V til\n         H.V, som bevarer naboskap. For alle u, v ∈ G.V:\n\n                               (u, v) ∈ G.E =⇒ ( f (u), f (v)) ∈ H.E\n\n         Det vil si, hvis (u, v) er en kant i G, så er ( f (u), f (v)) en kant i H. Å avgjøre om\n         det eksisterer en homomorfi, gitt G og H, er NP-komplett generelt, men kan i\n         visse tilfeller gjøres i polynomisk tid.\n         Anta at vi bestemmer at H alltid skal være følgende graf, kjent som K3,3 :\n\n                                              1          2\n\n                                              3          4\n\n                                              5          6\n\n         Input er nå bare G, og vi skal avgjøre om det finnes en homomorfi f : G → K3,3 .\n         Enten vis at denne begrensede versjonen av problemet fortsatt er NP-komplett,\n         eller vis hvordan problemet kan løses (dvs., avgjøres) i polynomisk tid. Kan du\n         trekke noen generelle konklusjoner fra svaret ditt? Forklar.",
        "solution": "5 % 20   For to grafer G og H er en grafhomomorfi f : G → H en funksjon f fra G.V til\n         H.V, som bevarer naboskap. For alle u, v ∈ G.V:\n\n                              (u, v) ∈ G.E =⇒ ( f (u), f (v)) ∈ H.E\n\nDet vil si, hvis (u, v) er en kant i G, så er ( f (u), f (v)) en kant i H. Å avgjøre om\ndet eksisterer en homomorfi, gitt G og H, er NP-komplett generelt, men kan i\nvisse tilfeller gjøres i polynomisk tid.\nAnta at vi bestemmer at H alltid skal være følgende graf, kjent som K3,3 :\n\n                                     1          2\n\n                                     3          4\n\n                                     5          6\n\nInput er nå bare G, og vi skal avgjøre om det finnes en homomorfi f : G → K3,3 .\nEnten vis at denne begrensede versjonen av problemet fortsatt er NP-komplett,\neller vis hvordan problemet kan løses (dvs., avgjøres) i polynomisk tid. Kan du\ntrekke noen generelle konklusjoner fra svaret ditt? Forklar.\n\n  Om vi har funnet en f : G → K3,3 , vil den fortsatt være gyldig om vi slår\n  sammen verdier på høyre eller venstre side, så vi kan begrense oss til å\n  bruke node 1 og 2.\n  Det er det samme som å si at det finnes en homomorfi videre til grafen K2 ,\n  som består av bare disse to nodene, med en kant imellom seg, og at f finnes\n  hvis og bare hvis det finnes en homomorfi G → K2 .\n  Prøv å konstruere h ved å traversere G, og å la f (v) = 1 eller f (v) = 2\n  for hver node v ∈ G.V, avhengig av hvilke verdier naboene alt har fått.\n  Om vi mislykkes, må grafen ha en odde sykel, og det vil ikke finnes noen\n  homomorfi.\n  Denne metoden fungerer fordi K3,3 er bipartitt. Generelt, hvis H er bipartitt,\n  kan vi i lineær tid avgjøre om f : G → H eksisterer, ved å avgjøre om G er\n  bipartitt (tofargbar).",
        "problemPage": 5,
        "solutionPage": 7
      }
    ]
  }
];
})();
