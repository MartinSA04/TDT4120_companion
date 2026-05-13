/* global window */
(function () {
const exams = [
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
        "problemPage": 1,
        "solutionPage": 1,
        "prompt": [
          {
            "type": "text",
            "text": "Hva er kjøretiden til Dijkstra med en binærhaug som prioritetskø? Oppgi svaret i O-notasjon. Du kan anta |E| = Ω(V)."
          }
        ],
        "solution": [
          {
            "type": "text",
            "text": "O(E lg V) Relevante læringsmål: Forstå Dijkstra; kjenne kjøretiden under ulike omstendigheter, og forstå utregningen."
          }
        ]
      },
      {
        "id": "2022-des-02",
        "number": 2,
        "problemPage": 1,
        "solutionPage": 1,
        "prompt": [
          {
            "type": "text",
            "text": "Q = ⟨0, 0, 0, 0, 0, 0, 0, 0, 0, 0⟩ er en tabell brukt til å implementere en FIFO-kø. Utfør følgende prosedyre."
          },
          {
            "type": "code",
            "title": "Pseudokode",
            "startLine": 1,
            "code": "Q.head = 1\nQ.tail = 2\nEnqueue(Q, 1)\nEnqueue(Q, 2)\nQ.head = 9\nQ.tail = 10\nEnqueue(Q, 3)\nEnqueue(Q, 4)"
          },
          {
            "type": "text",
            "text": "Hvordan ser Q ut etterpå?"
          }
        ],
        "solution": [
          {
            "type": "text",
            "text": "Q = ⟨4, 1, 2, 0, 0, 0, 0, 0, 0, 3⟩ Her kan man også få noe uttelling om man har byttet om på rollen til head og tail, og satt inn mot venstre, så man ender med ⟨1, 0, 0, 0, 0, 0, 0, 4, 3, 2⟩. Relevant læringsmål: Forstå hvordan køer fungerer (inkl. operasjonene Enqueue og Dequeue)."
          }
        ]
      },
      {
        "id": "2022-des-03",
        "number": 3,
        "problemPage": 1,
        "solutionPage": 2,
        "prompt": [
          {
            "type": "text",
            "text": "Hvorfor er ikke memoisering nyttig når man bruker designmetoden splitt og hersk (divide and conquer)?"
          }
        ],
        "solution": [
          {
            "type": "text",
            "text": "Fordi man ikke har overlappende delproblemer. Dvs., hver delinstans løses maksimalt én gang, så det er ingen gevinst i å mellomlagre løsningen, som man gjør med memoisering. Relevante læringsmål: Forstå designmetoden splitt og hersk; forstå designmetoden dynamisk programmering; forstå hva overlappende delinstanser er; forstå løsning ved memoisering."
          }
        ]
      },
      {
        "id": "2022-des-04",
        "number": 4,
        "problemPage": 1,
        "solutionPage": 2,
        "prompt": [
          {
            "type": "text",
            "text": "Hva brukes kjeding (chaining) til? Du trenger ikke forklare hvordan det fungerer."
          }
        ],
        "solution": [
          {
            "type": "text",
            "text": "Til å håndtere kollisjoner i hashtabeller. Relevant læringsmål: Forstå konfliktløsing ved kjeding (chaining)."
          }
        ]
      },
      {
        "id": "2022-des-05",
        "number": 5,
        "problemPage": 1,
        "solutionPage": 2,
        "prompt": [
          {
            "type": "text",
            "text": "Gi nedre og øvre asymptotiske grenser for uttrykket n + Θ(n^2 ) + O(n^3 )."
          }
        ],
        "solution": [
          {
            "type": "text",
            "text": "Ω(n^2 ) og O(n^3 ) Relevant læringsmål: Kunne definere asymptotisk notasjon, O, Ω, Θ, o og ω."
          }
        ]
      },
      {
        "id": "2022-des-06",
        "number": 6,
        "problemPage": 1,
        "solutionPage": 2,
        "prompt": [
          {
            "type": "text",
            "text": "Forenkle uttrykket Ω(n + Θ(n^2 ) + O(n^3 ))."
          }
        ],
        "solution": [
          {
            "type": "text",
            "text": "Ω ( n^2 ) Relevant læringsmål: Kunne definere asymptotisk notasjon, O, Ω, Θ, o og ω."
          }
        ]
      },
      {
        "id": "2022-des-07",
        "number": 7,
        "problemPage": 1,
        "solutionPage": 2,
        "prompt": [
          {
            "type": "text",
            "text": "Løs rekurrensen T(n) = 4T(n/2) + n^2 lg n. Uttrykk svaret med Θ-notasjon."
          }
        ],
        "solution": [
          {
            "type": "text",
            "text": "Θ(n^2 lg^2 n) Her kan man bruke tilfelle 2 av masterteoremet. Relevant læringsmål: Kunne løse rekurrenser med substitusjon, rekursjonstrær, masterteoremet og iterasjonsmetoden."
          }
        ]
      },
      {
        "id": "2022-des-08",
        "number": 8,
        "problemPage": 2,
        "solutionPage": 3,
        "prompt": [
          {
            "type": "text",
            "text": "Start med et tomt binært søketre, og sett så inn følgende verdier, i rekkefølge, med Tree-Insert: ⟨7, 1, 0, 5, 4, 8, 3, 2, 9, 6⟩ Utfør deretter Inorder-Tree-Walk på rotnoden i det resulterende treet. Hva skriver algoritmen ut? Du skal her kun svare med output fra algoritmen."
          }
        ],
        "solution": [
          {
            "type": "text",
            "text": "Her vil man naturligvis få rett svar om man eksplisitt utfører algoritmene som anvist, men om man har forstått at en inorder-traversering av et binært søketre alltid besøker nodene i sortert rekkefølge, kan man her også finne svaret direkte. Relevant læringsmål: Forstå hvordan binære søketrær fungerer (inkl. operasjonene Tree-Insert og Inorder-Tree-Walk)."
          }
        ]
      },
      {
        "id": "2022-des-09",
        "number": 9,
        "problemPage": 2,
        "solutionPage": 3,
        "prompt": [
          {
            "type": "text",
            "text": "Følgende matrise er vektmatrisen til en vektet, rettet graf:"
          },
          {
            "type": "visual",
            "kind": "matrix-2022-w"
          },
          {
            "type": "text",
            "text": "Utfør Slow-APSP på grafen. Hva blir l^(2)_(3,1)?"
          }
        ],
        "solution": [
          {
            "type": "text",
            "text": "W"
          },
          {
            "type": "text",
            "text": "Relevant læringsmål: Forstå Slow-APSP; vite hvordan den oppfører seg; kunne utføre algoritmen, trinn for trinn."
          }
        ]
      },
      {
        "id": "2022-des-10",
        "number": 10,
        "problemPage": 2,
        "solutionPage": 3,
        "prompt": [
          {
            "type": "text",
            "text": "Anta at du legger inn en sjekk i Bellman-Ford som avslutter algoritmen dersom ingen avstandsestimater endrer seg i løpet av en iterasjon. Hva blir da den totale kjøretiden, i beste tilfelle, om du antar at det finnes stier fra startnoden til alle andre? Forklar kort."
          }
        ],
        "solution": [
          {
            "type": "text",
            "text": "Selv om vi kan nå frem til alle nodene, kan vi ende med at alle får rett avstand etter én iterasjon, så kjøretiden i beste tilfelle blir Θ(V + E), som i dette tilfellet kan forenkles til Θ(E). Relevant læringsmål: Forstå Bellman-Ford; kjenne kjøretiden under ulike omstendigheter, og forstå utregningen."
          }
        ]
      },
      {
        "id": "2022-des-11",
        "number": 11,
        "problemPage": 2,
        "solutionPage": 4,
        "prompt": [
          {
            "type": "text",
            "text": "Hva er det minste og største antallet elementer i en binærhaug med høyde h?"
          }
        ],
        "solution": [
          {
            "type": "text",
            "text": "2h og 2h+1 − 1 2h−1 og 2h − 1 gis også full uttelling. Om haugen er full, er dette summen 1 + 2 + 4 + · · · + 2h , som er 2h+1 − 1. Det minste vi kan ha er én mer enn en full haug av høyde h − 1, som altså blir 2h . Om man her har brukt gal definisjon av høyde, og telt antall nivåer med noder i stedet for lengste sti fra rot til løvnoder, vil man få 2h−1 og 2h − 1. Siden poenget med oppgaven ikke var å teste bruk av riktig definisjon her, vil dette også gi full uttelling. Dette er oppgave 6.1-1 fra læreboka. Relevant læringsmål: Forstå hvordan hauger fungerer."
          }
        ]
      },
      {
        "id": "2022-des-12",
        "number": 12,
        "problemPage": 2,
        "solutionPage": 4,
        "prompt": [
          {
            "type": "text",
            "text": "Hva sier heltallsteoremet (the integrality theorem)? Forklar kort med egne ord."
          }
        ],
        "solution": [
          {
            "type": "text",
            "text": "Hvis vi har heltallskapasiteter, vil flyten funnet av Ford-Fulkerson-metoden være heltallig. Her kan man ev. også presisere at f(u, v) er heltallig for hvert nodepar u, v, og at summen | f | også er et heltall. Relevant læringsmål: Forstå heltallsteoremet."
          }
        ]
      },
      {
        "id": "2022-des-13",
        "number": 13,
        "problemPage": 2,
        "solutionPage": 4,
        "prompt": [
          {
            "type": "text",
            "text": "Hva er restkapasitet (residual capacity) og hvordan regner man det ut? Forklar kort."
          }
        ],
        "solution": [
          {
            "type": "text",
            "text": "Det er den gjenværende kapasiteten til en kant i et flytnett. For en kant (u, v) med flyt f(u, v) er restkapasiteten c_f (u, v) hvor mye som gjenstår, altså c(u, v) − f(u, v), mens c_f (v, u) er hvor mye vi kan oppheve, altså f(u, v). Det er altså snakk om kapasiteten i restnettet/residualnettverket. Strengt tatt har vi også kapasitet og restkapasitet mellom noder der det ikke finnes noen kant, men denne er alltid 0. Relevant læringsmål: Kunne definere restnettet til et flytnett med en gitt flyt."
          }
        ]
      },
      {
        "id": "2022-des-14",
        "number": 14,
        "problemPage": 2,
        "solutionPage": 4,
        "prompt": [
          {
            "type": "text",
            "text": "Din venn Smartnes mener at grafisomorfi er minst like vanskelig som faktorisering. For å etablere dette tenker hun å vise at en løsning på det ene problemet kan, med litt ekstra beregning, brukes til å løse det andre. Forklar hvilket problem sin løsning som i så fall må kunne brukes på det andre problemet, og hvorfor det fører til den ønskede konklusjonen."
          }
        ],
        "solution": [
          {
            "type": "text",
            "text": "Lurvik må vise at man kan bruke en tenkt løsning på grafisomorfiproblemet til å løse faktoriseringsproblemet, dvs., redusere fra faktorisering til grafisomorfi. Så lenge reduksjonen ikke innebærer mye ekstra arbeid, betyr det at hvis man kan løse grafisomorfi, så kan man løse faktorisering (f.eks. i polynomisk tid), men ikke nødvendigvis omvendt; altså vil man ha etablert at grafisomorfi er minst like vanskelig som faktorisering. Om vi skriver G for grafisomorfi og F for faktorisering, og vi bruker redusibilitetsreduksjonen ⩽P , betyr altså F ⩽P G at F kan reduseres til G i polynomisk tid, og indikerer at G er minst like vanskelig som F (mtp. løsbarhet i polynomisk tid). Andre typer reduksjoner kan gi andre betydninger av «vanskelig»; det er det generelle poenget, og spesielt reduksjonsretningen, vi er ute etter her. Relevant læringsmål: Forstå redusibilitets-relasjonen ⩽P ."
          }
        ]
      },
      {
        "id": "2022-des-15",
        "number": 15,
        "problemPage": 3,
        "solutionPage": 5,
        "prompt": [
          {
            "type": "code",
            "title": "Algoritme 1 · Randomized-Select(A, p, r, i)",
            "startLine": 1,
            "code": "if r <= p\n  return A[p]\nq = Randomized-Partition(A, p, r)\nk = q - p + 1\nif i == k\n  return A[q]\nelseif i < k\n  Randomized-Select(A, p, q - 1, i)\n  Randomized-Select(A, q + 1, r, i - k)"
          },
          {
            "type": "text",
            "text": "Din venn Lurvik har prøvd å skrive ned pseudokode for randomized select etter hukommelsen. Resultatet (algoritme 1) er ikke helt rett. Beskriv hva som må fikses for at algoritmen skal bli korrekt."
          }
        ],
        "solution": [
          {
            "type": "text",
            "text": "Man må sette return foran kallene til Randomized-Select, og else først på linje 9. Altså:"
          },
          {
            "type": "code",
            "title": "Pseudokode",
            "startLine": 8,
            "code": "  return Randomized-Select(A, p, q − 1, i )\nelse return Randomized-Select(A, q + 1, r, i − k)"
          },
          {
            "type": "text",
            "text": "Ev. kan man også korrigere betingelsen på linje 1:"
          },
          {
            "type": "code",
            "title": "Pseudokode",
            "startLine": 1,
            "code": "if p == r"
          },
          {
            "type": "text",
            "text": "På linje 1 i versjonen i læreboka er sammenligningen p == r, ikke r ⩽ p, men det påvirker ikke oppførselen for den korrigerte algoritmen, siden vi da aldri får r < p. Om man også korrigerer dette, vil det ikke gi noe trekk. Relevant læringsmål: Forstå Randomized-Select."
          }
        ]
      },
      {
        "id": "2022-des-16",
        "number": 16,
        "problemPage": 3,
        "solutionPage": 6,
        "prompt": [
          {
            "type": "code",
            "title": "Algoritme 1 · Randomized-Select(A, p, r, i)",
            "startLine": 1,
            "code": "if r <= p\n  return A[p]\nq = Randomized-Partition(A, p, r)\nk = q - p + 1\nif i == k\n  return A[q]\nelseif i < k\n  Randomized-Select(A, p, q - 1, i)\n  Randomized-Select(A, q + 1, r, i - k)"
          },
          {
            "type": "text",
            "text": "Hvilket problem løser algoritme 1, dersom den kalles som følger, der A[1 : n] er en tabell med tall?"
          },
          {
            "type": "text",
            "text": "Randomized-Select(A, 1, n, 0)"
          },
          {
            "type": "text",
            "text": "Forklar kort."
          }
        ],
        "solution": [
          {
            "type": "text",
            "text": "Den vil sortere A. Det ser vi fordi den da vil oppføre seg akkurat som Randomized-Quicksort. Relevant læringsmål: Forstå Randomized-Quicksort."
          }
        ]
      },
      {
        "id": "2022-des-17",
        "number": 17,
        "problemPage": 3,
        "solutionPage": 6,
        "prompt": [
          {
            "type": "text",
            "text": "Din venn Gløgsund har laget to versjoner av Ford–Fulkerson-metoden der hun bruker henholdsvis Dijkstra og Transitive-Closure til å finne forøkende stier. Hvilke av disse to metodene vil garantert finne maks-flyt i polynomisk tid? Forklar kort. Anta at w(u, v) = 1 for alle kanter (u, v) i restnettet, og at Gløgsund vedlikeholder en Π-tabell med forgjengere i Transitive-Closure for å finne de faktiske stiene."
          }
        ],
        "solution": [
          {
            "type": "text",
            "text": "Dijkstra vil finne korteste forøkende sti, og vil dermed gi et polynomisk antall iterasjoner, akkurat som når vi bruker BFS i Edmonds–Karp. Transitive-Closure vil ikke nødvendigvis finne korteste forøkende stier, og vi risikerer å ende med et eksponentielt antall iterasjoner. Man trenger ikke argumentere for at Transitive-Closure faktisk kan velge stier som gir eksponentiell kjøretid. Det sentrale er at argumentet for polynomisk kjøretid for Edmonds–Karp bryter sammen. Man kan også få nesten full uttelling om man ikke nevner TransitiveClosure, om det kommer tydelig frem at man implisitt mener den vil gi galt svar fordi stiene den finner ikke nødvendigvis er kortest mulig. Relevant læringsmål: Forstå Ford-Fulkerson; forstå BFS; forstå Dijkstra; forstå Transitive-Closure."
          }
        ]
      },
      {
        "id": "2022-des-18",
        "number": 18,
        "problemPage": 3,
        "solutionPage": 6,
        "prompt": [
          {
            "type": "text",
            "text": "Vi sier at en kvinne og en mann er ment for hverandre om de ender opp sammen i alle mulige stabile matchinger. Konstruer en effektiv algoritme som bestemmer om en kvinne og en mann er ment for hverandre."
          }
        ],
        "solution": [
          {
            "type": "text",
            "text": "Kjør både kvinne- og manns-orientert Gale-Shapley, og se om noen matches i begge tilfeller. De er da hverandres beste og verste partner over alle stabile matchinger, og er dermed ment for hverandre. Relevant læringsmål: Forstå Gale-Shapley; kunne konstruere nye effektive algoritmer."
          }
        ]
      },
      {
        "id": "2022-des-19",
        "number": 19,
        "problemPage": 3,
        "solutionPage": 7,
        "prompt": [
          {
            "type": "text",
            "text": "Hvordan kan vi løse delsumproblemet (the subset-sum problem) i polynomisk tid hvis den ønskede delsummen (target) er oppgitt i entallssystemet? I entallssystemet representeres k som en streng 111 · · · 1 av lengde k."
          }
        ],
        "solution": [
          {
            "type": "text",
            "text": "Løses som det binære ryggsekkproblemet (0-1 knapsack), der vekt er lik verdi, og kapasiteten settes til den ønskede delsummen. Svaret er “ja” hvis og bare hvis vi får fylt opp ryggsekken helt. Siden kjøretiden er O(nW), og antall bits i input er Ω(nW), så er kjøretiden polynomisk. Dette er oppgave 34.5-3 fra læreboka. Relevant læringsmål: Forstå løsningen på det binære ryggsekkproblemet; forstå hvorfor løsningen på det binære ryggsekkproblemet ikke er polynomisk; forstå definisjonen av klassen P; kjenne det NP-komplette problemet SUBSET-SUM."
          }
        ]
      },
      {
        "id": "2022-des-20",
        "number": 20,
        "problemPage": 3,
        "solutionPage": 7,
        "prompt": [
          {
            "type": "text",
            "text": "Et kongerike består av flere regioner. Kongen ønsker å bygge en mur som går rundt én eller flere av regionene, inkludert den som inneholder det kongelige slott. Byggekostnadene varierer med terrenget, og kongen har bedt deg om å finne den billigste løsningen. Hvordan vil du gå frem? Du kan anta at muren følger regiongrenser."
          }
        ],
        "solution": [
          {
            "type": "text",
            "text": "Lag en graf med hver region, inkl. utlandet, som en node, og med en kant over hver grense, med kapasitet lik kostnaden ved å bygge langs grensen. Finn så et minimalt snitt mellom slottet og utlandet, ved hjelp av FordFulkerson (spesifikt, Edmonds–Karp-algoritmen). Her kan man forstå oppgavebeskrivelsen på litt ulike måter. F.eks. er det ikke sikkert man ser på det som et krav at det skal være én ringmur, men at området den omslutter kan deles opp av mindre murer, etc. Men siden man skal gjøre det billigst mulig, vil den billigste løsningen likevel være å unngå dette. Man kan også tolke det som at man har oppgitt én eller flere regioner som skal omsluttes. Siden det er snakk om én mur, må det likevel løses på en måte som minner om den i løsningsforslaget, bare at man kan innføre en superkilde, og koble til alle disse regionene med kanter som har uendelig høy kapasitet (så alle havner på kilde-siden av snittet). Om man her heller bruker en graf der grensene er kanter (dvs., den duale grafen av det som brukes i løsningen over), og prøver å finne den korteste sykelen rundt slottet, kan det også gi uttelling, selv om det kan være utfordrende å finne en algoritme som gir riktig svar, dvs., å ikke bare finne den billigste sykelen, men den billigste som omslutter slottet. Relevant læringsmå …"
          }
        ]
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
        "problemPage": 1,
        "solutionPage": 1,
        "prompt": [
          {
            "type": "code",
            "title": "Algoritme 1 · Fung-Sort(A, n)",
            "startLine": 1,
            "code": "for i = 1 to n\n  for j = 1 to n\n    if A[i] < A[j]\n      swap A[i] and A[j]"
          },
          {
            "type": "text",
            "text": "Oppgi svaret i asymptotisk notasjon."
          }
        ],
        "solution": [
          {
            "type": "text",
            "text": "Θ ( n^2 ) Algoritmen er hentet fra https://arxiv.org/abs/2110.01111. Relevant læringsmål: Kunne analysere algoritmers effektivitet; kunne definere asymptotisk notasjon (Θ)."
          }
        ]
      },
      {
        "id": "2023-aug-02",
        "number": 2,
        "problemPage": 1,
        "solutionPage": 1,
        "prompt": [
          {
            "type": "text",
            "text": "Hva er et spenntre? Det trenger ikke være minimalt."
          }
        ],
        "solution": [
          {
            "type": "text",
            "text": "Det er et tre som består av kanter fra en gitt graf, og som inneholder alle nodene i grafen. Her tillates mange ulike forklaringer, så lenge man får frem poenget. Om man kun oppgir at det er et tre som kobler sammen nodene, uten å oppgi at kantene i treet hentes fra grafen, gir dette 4 poeng."
          },
          {
            "type": "text",
            "text": "Relevant læringsmål: Vite hva spenntrær og minimale spenntrær er."
          }
        ]
      },
      {
        "id": "2023-aug-03",
        "number": 3,
        "problemPage": 1,
        "solutionPage": 2,
        "prompt": [
          {
            "type": "text",
            "text": "Hvilket problem løser Floyd-Warshall? Her er vi ikke ute etter bare navnet på problemet, men en svært kort beskrivelse av hva problemet er."
          }
        ],
        "solution": [
          {
            "type": "text",
            "text": "Korteste veier, fra alle noder til alle andre, i en vektet, rettet graf. Her kan man godt bruke frasen «fra alle til alle», uten å nevne noder. Man får 4 poeng om man utelater å nevne vekting eller retning, eller begge deler. Det er korrekt, men ikke påkrevd, å også nevne kravet om at grafen ikke har negative sykler. Det er også korrekt, men ikke direkte relevant, å nevne at algoritmen kan modifiseres til å finne transitiv lukning. Relevant læringsmål: Forstå Floyd-Warshall (kjenne den formelle definisjonen av det generelle problemet den løser)."
          }
        ]
      },
      {
        "id": "2023-aug-04",
        "number": 4,
        "problemPage": 1,
        "solutionPage": 2,
        "prompt": [
          {
            "type": "text",
            "text": "Dijkstra velger en node i hver iterasjon. Hvilken?"
          }
        ],
        "solution": [
          {
            "type": "text",
            "text": "Den med lavest avstandsestimat, v.d. Teknisk sett en av dem med lavest avstandsestimat, og hvilken av dem som velges er en implementasjonsdetalj. Det er selvfølgelig også korrekt å spesifisere at det er en av de gjenværende nodene som velges. Relevant læringsmål: Forstå Dijkstra (vite hvordan den oppfører seg; kunne utføre algoritmen, trinn for trinn)."
          }
        ]
      },
      {
        "id": "2023-aug-05",
        "number": 5,
        "problemPage": 1,
        "solutionPage": 2,
        "prompt": [
          {
            "type": "text",
            "text": "Tellesortering (counting sort) har bedre kjøretid enn f.eks. flettesortering (merge sort). Hva er det vi krever av input til tellesortering som gjør dette mulig?"
          }
        ],
        "solution": [
          {
            "type": "text",
            "text": "Elementene i input-tabellen må være heltall i et lite verdiområde. Her er det også akseptabelt om man oppgir at verdiområdet må ha konstant størrelse eller at størrelsen k er O(n). Det er også korrekt å si at k = o (n lg n) vil gjøre tellesortering raskere. Relevant læringsmål: Forstå Counting-Sort (kjenne til eventuelle tilleggskrav den stiller for å være korrekt; kjenne til eventuelle styrker eller svakheter, sammenlignet med andre)."
          }
        ]
      },
      {
        "id": "2023-aug-06",
        "number": 6,
        "problemPage": 1,
        "solutionPage": 3,
        "prompt": [
          {
            "type": "text",
            "text": "Hva er konsekvensen av å finne en polynomisk algoritme for et problem i NPC?"
          }
        ],
        "solution": [
          {
            "type": "text",
            "text": "P = NP, dvs., alle problemer i NP kan løses i polynomisk tid. Relevante læringsmål: Forstå definisjonen av klassene P og NP; forstå definisjonen av NP-kompletthet."
          }
        ]
      },
      {
        "id": "2023-aug-07",
        "number": 7,
        "problemPage": 1,
        "solutionPage": 3,
        "prompt": [
          {
            "type": "visual",
            "kind": "sort-comparison-2023-aug"
          },
          {
            "type": "text",
            "text": "Dine venner Lurvik og Smartnes har laget hver sin sorteringsalgoritme, som rett og slett utfører to andre sorteringsalgoritmer etter hverandre:"
          },
          {
            "type": "text",
            "text": "Lurvik-Sort(A, n)                            Smartnes-Sort(A, n)"
          },
          {
            "type": "text",
            "text": "Hvilken av dem har best kjøretid i verste tilfelle? Forklar kort."
          }
        ],
        "solution": [
          {
            "type": "text",
            "text": "Smartnes-Sort blir best, siden Merge-Sort uansett har kjøretid Θ(n lg n), og når den kjøres først, får Insertion-Sort kjøretid Θ(n), totalt Θ(n lg n). Om Insertion-Sort kjøres først, risikerer vi Θ(n^2 ) + Θ(n lg n) = Θ(n^2 ). En kortere forklaring kan her gi full uttelling. Relevante læringsmål: Forstå Insertion-Sort og Merge-Sort (kjenne kjøretidene under ulike omstendigheter, og forstå utregningen)."
          }
        ]
      },
      {
        "id": "2023-aug-08",
        "number": 8,
        "problemPage": 2,
        "solutionPage": 3,
        "prompt": [
          {
            "type": "text",
            "text": "Lurvik og Smartnes skal på togferie. Det går direktetog mellom mange av byene de skal besøke, og Lurvik vil finne en rute som går innom hver by nøyaktig én gang, om mulig. Smartnes mener det er urealistisk. Hva mener du? Det er her snakk om å lage en effektiv algoritme for å løse problemet generelt."
          }
        ],
        "solution": [
          {
            "type": "text",
            "text": "En slik algoritme ville kunne løse HAM-CYCLE-problemet, så det er neppe realistisk. Forklaringer om at en polynomisk algoritme vil medføre at P = NP, og lignende, eller svar som påpeker at problemet er NP-hardt/NP-komplett er også korrekte. Man bør spesifikt nevne hamiltonsykelproblemet (eller ev. redusere fra et annet NP-hardt problem) for å få full uttelling. Om forklaringen innebærer en reduksjon til et annet NP-hardt problem, vil det gi lite eller ingen uttelling. Relevante læringsmål: Kjenne det NP-komplette problemet HAM-CYCLE (kunne angi presist hva input er; kunne angi presist hva output er og hvilke egenskaper det må ha); være i stand til å konstruere enkle NPkompletthetsbevis."
          }
        ]
      },
      {
        "id": "2023-aug-09",
        "number": 9,
        "problemPage": 2,
        "solutionPage": 4,
        "prompt": [
          {
            "type": "text",
            "text": "Du skal finne et passord som består av n tegn fra et alfabet av størrelse k. Du prøver ett og ett passord (brute force). Hvor mange passord må du prøve før du finner det rette? Oppgi svaret i asymptotisk notasjon. Du kan anta at du kjenner både n og k."
          }
        ],
        "solution": [
          {
            "type": "text",
            "text": "O( k n ) Her får man også full uttelling om man skriver Θ(kn ), selv om det ikke er helt riktig. Relevante læringsmål: Kunne analysere algoritmers effektivitet; kunne definere asymptotisk notasjon (O)."
          }
        ]
      },
      {
        "id": "2023-aug-10",
        "number": 10,
        "problemPage": 2,
        "solutionPage": 4,
        "prompt": [
          {
            "type": "text",
            "text": "Tre menn (Lurvik, Smartnes og Visdal) og tre kvinner (Gløgsund, Klokland og Flinckenhagen) har følgende preferanser:"
          },
          {
            "type": "visual",
            "kind": "matching-preferences-2023-aug"
          },
          {
            "type": "text",
            "text": "Lurvik er matchet med Flinckenhagen, Smartnes er matchet med Gløgsund og Visdal er matchet med Klokland. Er matchingen stabil, eller finnes det et blokkerende par (blocking pair)? Hvem er det, i så fall? Forklar kort."
          }
        ],
        "solution": [
          {
            "type": "text",
            "text": "Lurvik og Gløgsund utgjør et blokkerende par, siden de heller vil ha hverandre enn sine respektive partnere. Relevante læringsmål: Forstå hva en stabil matching (stable matching) er."
          }
        ]
      },
      {
        "id": "2023-aug-11",
        "number": 11,
        "problemPage": 2,
        "solutionPage": 4,
        "prompt": [
          {
            "type": "text",
            "text": "Det følgende er hentet fra Counting-Sort:"
          },
          {
            "type": "code",
            "title": "Pseudokode",
            "startLine": 11,
            "code": "for j = 1 downto 1\n▮▮▮ = A[ j ]\n  C[A[ j]] = C[A[ j]] − 1"
          },
          {
            "type": "text",
            "text": "Hva skal den sensurerte biten være?"
          }
        ],
        "solution": [
          {
            "type": "text",
            "text": "B[C[A[ j]] = A[ j]"
          },
          {
            "type": "text",
            "text": "Se løsning i pseudokoden over. Relevant læringsmål: Forstå Counting-Sort (vite hvordan den oppfører seg; kunne utføre algoritmen, trinn for trinn)."
          }
        ]
      },
      {
        "id": "2023-aug-12",
        "number": 12,
        "problemPage": 2,
        "solutionPage": 5,
        "prompt": [
          {
            "type": "text",
            "text": "Løs følgende rekurrens:"
          },
          {
            "type": "visual",
            "kind": "recurrence-2023-aug-12"
          },
          {
            "type": "text",
            "text": "Oppgi svaret med asymptotisk notasjon."
          }
        ],
        "solution": [
          {
            "type": "text",
            "text": "Θ(n lg lg n) Denne rekurrensen er diskutert på s. 105–106 i læreboka, der løsningen også er oppgitt. Den kan også løses med iterasjonsmetoden og substitusjonsmetoden, men det kan være utfordrende. Oppgaven var egentlig ment å løses med masterteoremet, men faller utenfor den varianten av teoremet som brukes i pensum. Derfor tas oppgaven ut av sensur der det er til fordel for kandidaten. Her får man 4 poeng for Θ(n), som er resultatet man får ved å bruke tilfelle 2 av masterteoremet, altså f(n) = Θ(nlogb a lgk n), for a = b = 2, k = −1. Dette svaret er ikke korrekt, siden dette tilfellet krever k > 0."
          }
        ]
      },
      {
        "id": "2023-aug-13",
        "number": 13,
        "problemPage": 2,
        "solutionPage": 5,
        "prompt": [
          {
            "type": "text",
            "text": "Tabellen A = ⟨9, 8, 5, 7, 1, 3, 2, 4, 6⟩ representerer en haug. Hvordan ser tabellen ut etter første iterasjon av Heapsort? Du skal altså utføre den første av n − 1 iterasjoner. Svar ved å liste opp elementene i tabellen. Oppgi hele tabellen, inkludert deler som ikke lenger er en del av haugen."
          }
        ],
        "solution": [
          {
            "type": "text",
            "text": "8, 7, 5, 6, 1, 3, 2, 4, 9 Relevant læringsmål: Forstå Heapsort (vite hvordan den oppfører seg; kunne utføre algoritmen, trinn for trinn)."
          }
        ]
      },
      {
        "id": "2023-aug-14",
        "number": 14,
        "problemPage": 2,
        "solutionPage": 5,
        "prompt": [
          {
            "type": "text",
            "text": "Flytnett (flow networks) kan defineres på litt forskjellige vis, men i versjonen i pensum tillates ikke antiparallelle kanter (dvs., at man både har en kant fra u til v og en kant fra v til u). Hvor stor begrensning er dette? Forklar kort."
          }
        ],
        "solution": [
          {
            "type": "text",
            "text": "Det er ikke noen egentlig begrensning. Om vi har et nettverk som har antiparallelle kanter, kan vi splitte den ene av hvert par med en ny node, og få et ekvivalent nettverk som ikke har det. Relevant læringsmål: Kunne håndtere antiparallelle kanter."
          }
        ]
      },
      {
        "id": "2023-aug-15",
        "number": 15,
        "problemPage": 2,
        "solutionPage": 5,
        "prompt": [
          {
            "type": "text",
            "text": "rekursivt. Hva taler for og imot bruk av memoisering for å optimere den? Du kan f.eks. bruke en hashtabell med mengder som nøkler."
          },
          {
            "type": "code",
            "title": "Algoritme 2 · Permutations(S)",
            "startLine": 1,
            "code": "if S == ∅\n  return 1\nelse n = 0\n  for each element x ∈ S\n    n = n + Permutations(S − { x })\n  return n"
          }
        ],
        "solution": [
          {
            "type": "text",
            "text": "Her kan mange svar gi uttelling, men hovedargumentet for er at man har overlappende delproblemer og et hovedargument mot er at memo-tabellen blir eksponentielt stor. Man kan naturligvis også oppgi som argument at det finnes atskillig mer effektive løsninger på problemet. Relevante læringsmål: Forstå designmetoden dynamisk programmering; forstå løsning ved memoisering; forstå hva overlappende delinstanser er; kunne analysere algoritmers effektivitet."
          }
        ]
      },
      {
        "id": "2023-aug-16",
        "number": 16,
        "problemPage": 3,
        "solutionPage": 6,
        "prompt": [
          {
            "type": "text",
            "text": "Beskriv hvordan du kan bruke rekursjon til å finne avstanden fra startnoden s til en gitt node v i en vektet, rettet graf. Merk: Det er forventet at løsningen vil ha eksponentiell kjøretid. Her kan du svare svært kort. Det kreves ingen grundig pseudokode e.l. Du kan anta at det finnes en sti fra s til enhver annen node i grafen."
          }
        ],
        "solution": [
          {
            "type": "text",
            "text": "For hver inn-nabo u, finn avstanden rekursivt og legg til vekten w(u, v). Velg så det minste av svarene. Relevant læringsmål: Forstå strukturen til korteste-vei-problemet."
          }
        ]
      },
      {
        "id": "2023-aug-17",
        "number": 17,
        "problemPage": 3,
        "solutionPage": 6,
        "prompt": [
          {
            "type": "text",
            "text": "Et byggefirma har flere store oppdrag og skal fordele sine ansatte på disse. Hvert prosjekt har et sett med roller (tømrer, elektriker, rørlegger, etc.) og et antall som trengs av hver av disse. Hver ansatt er kompetent til å fylle én eller flere slike roller, men kan maksimalt delta i ett prosjekt, og fyller da nøyaktig én rolle. For å holde reiseavstandene nede kan hver ansatt bare bli tilordnet et prosjekt innenfor en gitt avstand fra hjemstedet. Hvordan ville du ha funnet en gyldig fordeling?"
          }
        ],
        "solution": [
          {
            "type": "text",
            "text": "Kan løses som et flytproblem, med ansatte, roller (per prosjekt) og prosjekter som noder. Kanter fra kilde til ansatte (kapasitet 1), fra ansatte til roller de kan inneha i prosjekter de kan delta i (kapasitet 1), fra roller til tilhørende prosjekter (kapasitet lik antall som trengs) og fra prosjekter til sluk (f.eks. ubegrenset kapasitet). Relevante læringsmål: Være i stand til å konstruere reduksjoner til maksflyt-problemet; forstå heltallsteoremet (integrality theorem)."
          }
        ]
      },
      {
        "id": "2023-aug-18",
        "number": 18,
        "problemPage": 3,
        "solutionPage": 7,
        "prompt": [
          {
            "type": "text",
            "text": "I beviset for at CIRCUIT-SAT er NP-komplett konstrueres en logisk krets som simulerer en datamaskin som utfører en verifikasjonsalgoritme. Hva er input for denne kretsen? Her trenger du ikke beskrive konstante «inputs», bare dem man står fritt til å settet til 0 eller 1 for å løse oppfyllbarhetsproblemet. Du kan svare svært kort."
          }
        ],
        "solution": [
          {
            "type": "text",
            "text": "Sertifikatet. Poenget er at vi vil avgjøre om det eksisterer et slikt sertifikat y som oppfyller kretsen, og dermed altså gir A( x, y) = 1. Relevant læringsmål: Forstå beviset for at CIRCUIT-SAT er NP-komplett."
          }
        ]
      },
      {
        "id": "2023-aug-19",
        "number": 19,
        "problemPage": 3,
        "solutionPage": 7,
        "prompt": [
          {
            "type": "text",
            "text": "Din venn Gløgsund har klart å slette alle mellomrom og all tegnsetting i en avhandling hun skriver på, og hun vil ha din hjelp til å splitte teksten opp i enkelt-ord. Det du har å hjelpe deg med er en liste med gyldige ord, og en oversikt over ord som aldri forekommer ved siden av hverandre. Beskriv en algoritme som løser problemet. Det kan være flere gyldige løsninger. I så fall holder det at du finner én av dem."
          }
        ],
        "solution": [
          {
            "type": "text",
            "text": "Prøv hvert mulige ord i starten, og løs resten rekursivt med memoisering. Hopp over delinstanser (rekursive kall) som starter med ord som ikke kan stå ved siden av det første. Problemet ligner på stavkappingsproblemet, det er noen vesentlige forskjeller, så om man henviser til dette, så må man også forklare hvordan løsningen må modifiseres. Relevante læringsmål: Kunne konstruere nye effektive algoritmer; forstå designmetoden dynamisk programmering; forstå eksemplet stavkapping."
          }
        ]
      },
      {
        "id": "2023-aug-20",
        "number": 20,
        "problemPage": 3,
        "solutionPage": 7,
        "prompt": [
          {
            "type": "text",
            "text": "Anta at du har en prosedyre A som avgjør beslutningsproblemet VERTEXCOVER i konstant tid. Beskriv hvordan du kan bruke A til å finne et minst mulig nodedekke. Løsningen din skal ha så lav asymptotisk kjøretid som mulig. Gitt denne kjøretiden, skal den bruke så få kall til A som mulig. (Du skal altså ikke øke den asymptotiske kjøretiden bare for å redusere antall kall til A.) Merk at du her faktisk skal finne nodedekket, ikke bare størrelsen."
          }
        ],
        "solution": [
          {
            "type": "text",
            "text": "Bruk binærsøk i verdiområdet 1 . . . |V| for å finne størrelsen k til minste nodedekke. Fjern så en node v og sjekk om resten har et dekke av størrelse k − 1. I så fall tas v med i løsningen; ellers forkastes den. Fortsett på samme måte. Om vi antar at nodeslettingen også sletter tilstøtende kanter, får vi kjøretid Θ(V + E) i verste tilfelle. Antall kall til A blir (⌊lg |V|⌋ + 1) + (n − 1) = ⌊lg |V|⌋ + n. Merk at det ikke spørres etter kjøretid eller antall kall, så det er ikke nødvendig å oppgi dette i svaret. Relevante læringsmål: Kunne konstruere nye effektive algoritmer; kjenne det NP-komplette problemet VERTEX-COVER (kunne angi presist hva input er; kunne angi presist hva output er og hvilke egenskaper det må ha)."
          }
        ]
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
        "problemPage": 1,
        "solutionPage": 1,
        "prompt": [
          {
            "type": "text",
            "text": "I de følgende deloppgavene er det meningen at du skal svare svært kort. 5%       a) Hva er kjøretiden til Insertion-Sort i beste tilfelle? 5%       b) Hva er den største fordelen med en tabell (array) fremfor en lenket liste? 5%       c)   I Counting-Sort(A, n, k) er A en tabell (array) med n verdier. Hva er k? 5%       d) Hva er topologisk sortering? 5%       e)   I en maks-haug (max-heap) ligger verdien x i en foreldrenode, mens verdiene y og z ligger i henholdsvis venstre og høyre barnenode. Hvilke krav stilles til forholdet mellom verdiene? Her er det altså snakk om verdier, ikke f.eks. indekser."
          }
        ],
        "solution": [
          {
            "type": "text",
            "text": "Θ(n) O(n) gir også full uttelling. Ω(n) gir 4 poeng. Relevant læringsmål: Forstå Insertion-Sort (kjenne kjøretidene under ulike omstendigheter)."
          },
          {
            "type": "text",
            "text": "Direkte oppslag (og innsetting) i konstant tid. Her godtas alle formuleringer som får frem hovedpoenget med at tabeller kan indekseres i konstant tid, mens lenkede lister må traverseres fra starten. Relevant læringsmål: Forstå hvordan lenkede lister fungerer."
          },
          {
            "type": "text",
            "text": "Største mulige verdi."
          },
          {
            "type": "text",
            "text": "Angir altså verdiområdet, 0, . . . , k. Her godtas også andre formuleringer som får frem at k angir eller begrenser hvilke verdier A kan inneholde. Relevant læringsmål: Forstå Counting-Sort."
          },
          {
            "type": "text",
            "text": "Ordning av nodene i en graf, der kantene peker fremover. Her godtas også andre forklaringer av ensrettingen av kantene, inkl. om man sier at de peker bakover. Å kun si at det er en ordning eller sortering av nodene i en graf gir 3 poeng. Relevant læringsmål: Forstå Topological-Sort."
          },
          {
            "type": "text",
            "text": "Her er det altså snakk om verdier, ikke f. …"
          }
        ]
      },
      {
        "id": "2023-des-02",
        "number": 2,
        "problemPage": 1,
        "solutionPage": 2,
        "prompt": [
          {
            "type": "text",
            "text": "I de følgende deloppgavene er det oppgitt informasjon om funksjonene f(n) og g(n). I hvert tilfelle, uttrykk f(n) + g(n) med asymptotisk notasjon. Under eksamen ble følgende oppgitt: Med formuleringen «i hvert tilfelle» menes «i hver deloppgave». Hver deloppgave skal besvares med ett uttrykk. 5%       a)   f(n ) = O( n^2 ), f(n ) = Ω ( n ), g(n ) = O( n^2 ), g(n ) = Ω ( n^2 ) 5%       b)   f(n ) = Ω ( n^2 ), f(n ) = ω ( n ), g(n ) = O( n^2 ), g(n ) = o ( n^3 )"
          }
        ],
        "solution": [
          {
            "type": "text",
            "text": "Θ ( n^2 ) O(n^2 ) gir 4 poeng. Ω(n^2 ) gir 3 poeng. Her er det altså slik at f(n) er både O(n^2 ) og Ω(n), etc. Om man i stedet har tolket ligningene som ulike definisjoner av f(n) og g(n), og har fått riktig svar (f.eks. Ω(n) + O(n^2 ) = Ω(n)) for ulike kombinasjoner (enten 2 eller 4), gir det 1 poeng. Relevant læringsmål: Kunne definere og bruke asymptotisk notasjon, O, Ω, Θ, o og ω."
          },
          {
            "type": "text",
            "text": "Ω ( n^2 ) Tilsvarende som i a, om har tolket ligningene som ulike definisjoner av f(n) og g(n), og har fått riktig svar for ulike kombinasjoner, gir det 1 poeng. Relevant læringsmål: Kunne definere og bruke asymptotisk notasjon, O, Ω, Θ, o og ω."
          }
        ]
      },
      {
        "id": "2023-des-03",
        "number": 3,
        "problemPage": 1,
        "solutionPage": 3,
        "prompt": [
          {
            "type": "text",
            "text": "Løs følgende rekurrenser. Oppgi svaret i Θ-notasjon. 5%       a) T(n) = T(n − 1) + n^2 − (n − 1)^2 √ 5%       b) T(n) = 2T(n/4) + n lg^2 n"
          }
        ],
        "solution": [
          {
            "type": "text",
            "text": "Θ ( n^2 ) Her kan man først regne ut n^2 − (n − 1)^2 og så bruke iterasjonsmetoden på T(n) = T(n − 1) + 2n − 1, men det er antagelig enklere å bruke metoden direkte, siden vi får en teleskopsum som eliminerer alle ledd unntatt n^2 og grunntilfellet:"
          },
          {
            "type": "equation",
            "title": "Utregning",
            "lines": [
              "T( n ) = n^2 − ( n − 1)^2 + T( n − 1)",
              "= n^2 − ( n − 1)^2 + ( n − 1)^2 − ( n − 2)^2 + T( n − 2)",
              "= n^2 − ( n − 2)^2 + T( n − 2)",
              "⋮",
              "⋮",
              "= n^2 − ( n − i )^2 + T( n − i )",
              "= n^2 − ( n − n )^2 + T( n − n )",
              "= n^2 + T(0) = n^2 + Θ (1) = Θ ( n^2 )"
            ]
          },
          {
            "type": "text",
            "text": "Relevant læringsmål: Kunne løse rekurrenser med iterasjonsmetoden."
          },
          {
            "type": "text",
            "text": "√"
          },
          {
            "type": "text",
            "text": "√ Θ( n lg^3 n) Her gjelder tilfelle 2 av masterteoremet, med a = 2, b = 4 og k = 2. √ (Merk at n = n^(1/2) og log_4 2 = 1/2.) Dette er oppgave 4.5-1c fra læreboka. Relevant læringsmål: Kunne løse rekurrenser med masterteoremet."
          }
        ]
      },
      {
        "id": "2023-des-04",
        "number": 4,
        "problemPage": 1,
        "solutionPage": 3,
        "prompt": [
          {
            "type": "text",
            "text": "Du har oppgitt følgende frekvenser for alfabetet a, . . . , h: a:1 b:1 c:2 d:3 e:5 f:8 g:13 h:21 I en Huffman-kode for disse tegnene, hva er antall siffer for tegnet e? Her er vi altså ute etter antall binære siffer som trengs for å kode én e med Huffman-koden, ikke det totale antall siffer som brukes på alle e-ene i teksten."
          }
        ],
        "solution": [
          {
            "type": "text",
            "text": "2"
          },
          {
            "type": "text",
            "text": "Oppgaven er basert på oppgave 15.3-3 i læreboka. Huffman-treet er ikke helt entydig på de nederste nivåene, men dette er et mulig tre:"
          },
          {
            "type": "text",
            "text": "h            33 g          20"
          },
          {
            "type": "text",
            "text": "f          12 e         7 d            4 c               2 a               b"
          },
          {
            "type": "text",
            "text": "Relevant læringsmål: Forstå Huffman og Huffman-koder."
          }
        ]
      },
      {
        "id": "2023-des-05",
        "number": 5,
        "problemPage": 2,
        "solutionPage": 4,
        "prompt": [
          {
            "type": "visual",
            "kind": "disjoint-forest-2023"
          },
          {
            "type": "text",
            "text": "I figur 1 ser du en disjunkt-mengde-skog (disjoint-set forest). Vi kan representere foreldrepekerne med en tabell A, der A[v] = v.p: A = ⟨1, 2, 1, 2, 3, 3, 4, 4, 5, 6, 6, 11⟩ Utfør Find-Set(11) og oppdater A. Hvordan ser A ut etterpå? Svar ved å liste opp tallene i A. Du trenger ikke skrive A = ⟨ . . . ⟩."
          }
        ],
        "solution": [
          {
            "type": "text",
            "text": "1, 2, 1, 2, 3, 1, 4, 4, 5, 6, 1, 11"
          },
          {
            "type": "visual",
            "kind": "disjoint-forest-2023"
          },
          {
            "type": "text",
            "text": "Her søker vi altså fra 11 og oppover til 1, og sørger for at alle noder vi treffer på (11, 6 og 3) ender med å peke på 1 (path compression). Det er altså bare A[11] og A[6] som endrer seg. Relevant læringsmål: Forstå skog-implementasjonen av disjunkte mengder."
          }
        ]
      },
      {
        "id": "2023-des-06",
        "number": 6,
        "problemPage": 2,
        "solutionPage": 5,
        "prompt": [
          {
            "type": "visual",
            "kind": "flow-2023-des"
          },
          {
            "type": "text",
            "text": "Hvilke forøkende stier vil Edmonds-Karp finne i flytnettet i figur 2? Det er altså meningen at du skal utføre Edmonds-Karp på flytnettet, men uten initialiseringen (u, v). f = 0. Oppgi stiene som sekvenser av noder. Skriv én sti per linje, i den rekkefølgen de finnes. For eksempel: 1, 2, 3, 4, 5 7, 6, 5, 4, 3, 2, 1 4, 5, 6, 7, 8, 9 (Dette er kun et eksempel på formatet, ikke et faktisk gyldig sett med stier.)"
          }
        ],
        "solution": [
          {
            "type": "text",
            "text": "4, 5, 3, 6"
          },
          {
            "type": "visual",
            "kind": "flow-2023-des"
          },
          {
            "type": "text",
            "text": "Om man bytter om på stiene (og altså ikke spesifikt har brukt BFS, men fortsatt har brukt Ford-Fulkerson), gir det 4 poeng. Om man kun oppgir den siste stien (og altså ikke har fått med seg flytopphevingen fra 5 til 3) gir det 2 poeng. Relevant læringsmål: Forstå Edmonds-Karp-algoritmen (Ford-Fulkerson med BFS)."
          }
        ]
      },
      {
        "id": "2023-des-07",
        "number": 7,
        "problemPage": 2,
        "solutionPage": 5,
        "prompt": [
          {
            "type": "text",
            "text": "Hvis det er uavgjort mellom noen kandidater i noen av rangeringene i stabil matching (the stable-marriage problem), kan vi fortsatt garantert finne en stabil matching? Forklar kort."
          }
        ],
        "solution": [
          {
            "type": "text",
            "text": "Ja. Likeverdige kandidater kan ordnes vilkårlig i listene. Om vi så bruker Gale-Shapley, får vi ingen blokkerende par med denne rangeringen, og ingen kan oppstå om vi igjen tar hensyn til at det er uavgjort mellom noen. Det vil si, om et umatchet par w, m ikke foretrekker hverandre fremfor sine partnere, så vil de heller ikke plutselig gjøre det om det blir uavgjort mellom enkelte. Det verste som kan skje er at de ikke foretrekker sine partnere fremfor hverandre. (I litteraturen kalles dette en svakt stabil, eller weakly stable, matching.) Her godtas også andre korrekte argumenter for hvorfor det fortsatt må eksistere en stabil matching, enten de bruker Gale-Shapley eller ikke. Relevante læringsmål: Forstå hva en stabil matching (stable matching) og et blokkerende par (blocking pair) er; forstå Gale-Shapley; kunne analysere algoritmers korrekthet; kunne konstruere nye algoritmer."
          }
        ]
      },
      {
        "id": "2023-des-08",
        "number": 8,
        "problemPage": 2,
        "solutionPage": 6,
        "prompt": [
          {
            "type": "text",
            "text": "Betrakt algoritmen Untitled (algoritme 1), der A[1 : n] er en heltallstabell og algoritmen startes med kallet Untitled(A, 1, n, k). 5%       a) Hva gjør algoritmen? Her er vi ute etter resultatet av å kjøre algoritmen, eller hvilket problem den løser, ikke hvordan den oppfører seg, trinn for trinn."
          },
          {
            "type": "code",
            "title": "Algoritme 1 · Untitled(A, p, r, k)",
            "startLine": 1,
            "code": "if p < r\n  q = Randomized-Partition(A, p, r )\n  Untitled(A, p, q − 1, k)\n  if q < k\n    Untitled(A, q + 1, r, k)"
          },
          {
            "type": "text",
            "text": "5%       b) Hva er den forventede kjøretiden, som funksjon av n og k? Oppgi svaret i Θ-notasjon. Som en forenkling, kan du anta at q alltid havner midt mellom p og r."
          }
        ],
        "solution": [
          {
            "type": "text",
            "text": "Sorterer de k minste elementene i A, så de havner i A[1 : k ]. Om man forklarer noe om at den faktisk kan ende med å finne og sortere flere enn k minste elementene (dvs., de r minste elementene, i A[1 : r ], så snart q < k) så gir det også full uttelling. Om man kun sier at algoritmen finner de k minste elementene, at den finner det k-ende minste elementet, sier den er ekvivalent med Randomized-Select eller at den plasserer de k minste elementene først, gir det 2 poeng. Om man sier at algoritmen sorterer hele tabellen, eller mener den er ekvivalent med Randomized-Quicksort, gir det 1 poeng. Relevante læringsmål: Forstå Randomized-Quicksort; forstå Random-"
          },
          {
            "type": "text",
            "text": "ized-Select; kunne analysere algoritmers korrekthet; kunne konstruere nye algoritmer."
          },
          {
            "type": "text",
            "text": "Θ(n + k lg k) Θ(n) gir 2 poeng. Θ(k lg k) og Θ(n lg k) gir 1 poeng. O(n + k lg k) gir 1 poeng (siden oppgaven eksplisitt ber om Θ-notasjon). Utførelsen har to faser. Fase 1 (q ⩾ k): Tilsvarer Randomized-Select, men stopper når q < k. Merk at Randomized-Partition kjøres minst én gang, selv om q < k fra starten av, …"
          }
        ]
      },
      {
        "id": "2023-des-09",
        "number": 9,
        "problemPage": 3,
        "solutionPage": 7,
        "prompt": [
          {
            "type": "text",
            "text": "Du skal lage en spilleliste som er nøyaktig t sekunder lang. Du har n sanger å velge mellom. Du kan anta at alle sangene varer et helt antall sekunder. 5%       a) Hvordan kan du vise at dette er et vanskelig problem? 5%       b) Hvordan kan du løse problemet?"
          }
        ],
        "solution": [
          {
            "type": "text",
            "text": "F.eks. reduksjon fra SUBSET-SUM, der heltallene blir sekunder. Om man forklarer at problemet er «ekvivalent med» SUBSET-SUM, på en måte som implisitt innebærer en reduksjon fra SUBSET-SUM (ev. begge veier), gir det 5 poeng. Om man argumenterer for at det «ligner veldig» e.l., gir det 4 poeng. Om man reduserer til SUBSET-SUM (uten også å redusere fra), gir det 1 poeng. Om reduserer fra et annet NP-komplett problem, og forklarer hvordan, gir det også 5 poeng. Om man sier at man vil redusere fra et annet problem, men ikke forklarer hvordan, gir det 1 poeng. Om man sier at man vil redusere til et annet problem, gir det 0 poeng. Relevante læringsmål: Forstå definisjonen av NP-hardhet og NP-kompletthet; kjenne det NP-komplette problemet SUBSET-SUM; forstå hvordan NPkompletthet kan bevises ved én reduksjon; være i stand til å konstruere"
          },
          {
            "type": "text",
            "text": "enkle NP-kompletthetsbevis."
          },
          {
            "type": "text",
            "text": "F.eks. reduksjon til det binære ryggsekkproblemet, der verdi = vekt = tid. En tilsvarende løsning, der man løser problemet direkte med dynamisk programmering, og forklarer hvordan, vil gi 5 poeng. Relevante læringsmål: Forstå løsningen på de binære ryggsekkproblemet; kunne konstruere nye effektive algoritmer."
          }
        ]
      },
      {
        "id": "2023-des-10",
        "number": 10,
        "problemPage": 3,
        "solutionPage": 8,
        "prompt": [
          {
            "type": "text",
            "text": "Din venn Smartnes leter etter stier i en sammenhengende vektet urettet graf, fra en startnode s til alle andre. Hvis han finner de korteste stiene, vil summen av alle sti-lengdene bli minst mulig, men delene av stiene der de overlapper vil da telles med flere ganger. Han vil heller finne et sett med stier som minimerer en tilsvarende sum, der de overlappende delene telles bare én gang. Hvordan kan han gjøre det? Forklar kort."
          }
        ],
        "solution": [
          {
            "type": "text",
            "text": "Han vil minimere kantsummen for en delgraf som kobler s til alle andre noder. Det tilsvarer å finne et minimalt spenntre, som han kan finne med Prims eller Kruskals algoritme. Her er poenget at beskrivelsen av problemet til Smartnes fremstår som svært uklar, og utfordringen er å klare å forstå at det han er ute etter faktisk tilsvarer minimale spenntrær. Om man får frem det, selv uten å nevne algoritmer for å finne dem, gir det 5 poeng. Relevante læringsmål: Vite hva spenntrær og minimale spenntrær er; forstå MST-Kruskal; forstå MST-Prim."
          }
        ]
      },
      {
        "id": "2023-des-11",
        "number": 11,
        "problemPage": 3,
        "solutionPage": 8,
        "prompt": [
          {
            "type": "text",
            "text": "Din venn Klokland er ansvarlig for en konsertserie, men på grunn av budsjettkutt må hun nøye seg med én scene. Flere av konsertene kolliderer tidsmessig, og noen må derfor avlyses. Klokland ønsker å avlyse så få som mulig. Det eneste hun har tatt vare på av informasjon er starttidspunktene for alle konsertene, samt en urettet graf med konserter som noder, og kanter mellom"
          },
          {
            "type": "text",
            "text": "dem som kolliderer. Hun ønsker å fjerne så få noder som mulig, slik at alle kantene forsvinner. Hun blir litt svett idet hun innser at dette er optimeringsversjonen av VERTEXCOVER, men håper kanskje du har noen gode ideer. Konstruer og beskriv en algoritme som løser problemet generelt."
          }
        ],
        "solution": [
          {
            "type": "text",
            "text": "Problemet kan reduseres til aktivitetsutvelgelse: Færrest mulige avlysninger tilsvarer flest mulig konserter som ikke kolliderer. Vi kan snu tidsaksen: Sorter etter synkende startid og velg så neste konsert som ikke kolliderer (med den forrige, om noen), til vi er ferdige. Eventuelt kan vi finne faktiske intervaller ved å sortere etter starttid og sette sluttid så konserten kolliderer med dem den har en kant til. Vi sorterer så etter sluttid og velger grådig. Om man sier noe om at dette kan løses grådig, med henvisning til aktivitetsutvelgelse, men uten å faktisk finne intervallene, gir det 3 poeng. Om man finner intervallene, men ikke deretter løser problemet, gir det 2 poeng. Relevante læringsmål: Forstå eksemplet aktivitetsutvelgelse; kunne konstruere nye effektive algoritmer."
          }
        ]
      },
      {
        "id": "2023-des-12",
        "number": 12,
        "problemPage": 4,
        "solutionPage": 9,
        "prompt": [
          {
            "type": "text",
            "text": "Konstruer og beskriv en algoritme som avgjør om en rettet graf har en odde sykel, altså en sykel med et antall kanter som er et oddetall. Her får du full uttelling med kjøretid O(V3 ). Hint 1: Det kan være nyttig å se på stier som en del av løsningen. Hint 2: Du trenger ikke begrense deg til enkle (simple) stier og sykler. Hint 3: Finnes en odde sti fra i til j? Hva med en der antall kanter er et partall?"
          }
        ],
        "solution": [
          {
            "type": "text",
            "text": "Kan løses på en lignende måte som transitiv lukning, men med to matriser, A og B, der aij angir om det finnes en (ikke nødvendigvis enkel) oddetallssti fra i til j og bij om det finnes en partallssti. For hver i, j og k, oppdateres disse slik: aij = aij ∨ (bik ∧ akj ) ∨ ( aik ∧ bkj ) bij = bij ∨ ( aik ∧ akj ) ∨ (bik ∧ bkj ) Sjekk til slutt diagonalen i A, dvs., om aii = 1 for noen i. Løsningen er en mindre justering av Floyd-Warshall, på samme måte som Transitive-Closure. Om man nevner en av disse, og skisserer hvordan modifikasjonen kan gjøres, uten at det blir helt rett, gir det 4 poeng. Om man ikke nevner disse, men løser problemet korrekt med dynamisk programmering, gir det naturligvis 5 poeng. Løsninger som baserer seg på traversering vil stort sett ikke fungere, men kan likevel gi opptil 2 poeng. (Et unntak er løsningen beskrevet nedenfor, som det ikke forventes at noen finner, men som vil gi 5 poeng.) Løsninger som oppdager odde urettede sykler (f.eks. ved traversering og tofarging) gir 0 poeng. Relevante læringsmål: Forstå Floyd-Warshall; forstå Transitive-Closure; kunne konstruere nye effektive …"
          }
        ]
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
        "problemPage": 1,
        "solutionPage": 1,
        "prompt": [
          {
            "type": "text",
            "text": "Det følgende er hentet fra Enqueue:"
          },
          {
            "type": "code",
            "title": "Pseudokode",
            "startLine": 1,
            "code": "Q[Q.tail] = x\nif Q.tail == Q.size\n▮▮▮\nelse Q.tail = Q.tail + 1"
          },
          {
            "type": "text",
            "text": "Hva skal den sensurerte biten være?"
          }
        ],
        "solution": [
          {
            "type": "text",
            "text": "Q.tail = 1"
          },
          {
            "type": "text",
            "text": "Se løsning i pseudokoden over. Relevant læringsmål: Forstå hvordan stakker og køer fungerer (inkl. operasjonene Stack-Empty, Push, Pop, Enqueue, Dequeue)."
          }
        ]
      },
      {
        "id": "2024-aug-02",
        "number": 2,
        "problemPage": 1,
        "solutionPage": 1,
        "prompt": [
          {
            "type": "text",
            "text": "Anta at du kjører MST-Prim og MST-Kruskal på en usammenhengende graf. Hvilken av algoritmene vil finne et minimalt spenntre for hver av de sammenhengende komponentene i grafen? Forklar kort. Det vil si, hvilken av dem vil konstruere en usammenhengende løsning som dekker hele grafen?"
          }
        ],
        "solution": [
          {
            "type": "text",
            "text": "MST-Kruskal, siden den alltid plukker den billigste gjenværende kanten som ikke danner en sykel, samme hvor i grafen den befinner seg. MSTPrim, derimot, konstruerer et (sammenhengende) tre som vokser ut fra én"
          },
          {
            "type": "text",
            "text": "startnode, og vil aldri kunne bevege seg videre til en annen komponent. Her vil kortere og enklere forklaringer kunne være fullgode. Relevante læringsmål: Forstå MST-Kruskal; forstå MST-Prim."
          }
        ]
      },
      {
        "id": "2024-aug-03",
        "number": 3,
        "problemPage": 1,
        "solutionPage": 2,
        "prompt": [
          {
            "type": "text",
            "text": "En av løkkene i Counting-Sort går fra n ned til 1 (for j = n downto 1). Hva er konsekvensen av å skifte retning på løkka (for j = 1 to n)? Merk: Her kreves ingen forklaring."
          }
        ],
        "solution": [
          {
            "type": "text",
            "text": "Sorteringen blir ustabil. Relevant læringsmål: Forstå Counting-Sort, og hvorfor den er stabil."
          }
        ]
      },
      {
        "id": "2024-aug-04",
        "number": 4,
        "problemPage": 1,
        "solutionPage": 2,
        "prompt": [
          {
            "type": "text",
            "text": "Hvis du skal beskrive den beste kjøretiden til en algoritme (best-case), hvilken asymptotisk notasjon (av O, Ω eller Θ) er det best å bruke, om mulig?"
          }
        ],
        "solution": [
          {
            "type": "text",
            "text": "notasjon (av O, Ω eller Θ) er det best å bruke, om mulig?"
          },
          {
            "type": "text",
            "text": "Θ Den angir både en øvre og nedre grense for kjøretiden, og gir dermed mest informasjon. Relevant læringsmål: Forstå at alle av O, Ω, Θ, o og ω kan beskrive best-, worst- og average-case."
          }
        ]
      },
      {
        "id": "2024-aug-05",
        "number": 5,
        "problemPage": 1,
        "solutionPage": 2,
        "prompt": [
          {
            "type": "text",
            "text": "I en hashtabell med hashfunksjon h, hva vil det si at nøklene k1 og k2 kolliderer?"
          }
        ],
        "solution": [
          {
            "type": "text",
            "text": "h(k1 ) = h(k2 ) Dvs. at de har samme hashverdi og mappes til samme posisjon (slot). Om vi bruker kjeding (chaining), vil de havne i dem samme lenkede listen, på indeks h(k1 ) i tabellen. Relevant læringsmål: Forstå hvordan direkte adressering og hashtabeller fungerer."
          }
        ]
      },
      {
        "id": "2024-aug-06",
        "number": 6,
        "problemPage": 1,
        "solutionPage": 2,
        "prompt": [
          {
            "type": "text",
            "text": "Hva er den amortiserte kjøretiden til Table-Insert? Det er altså snakk om innsetting i en dynamisk tabell, der vi enten kan sette elementet rett inn, om det er plass, eller må allokere en ny og større tabell ellers. Oppgi svaret med Θ-notasjon."
          }
        ],
        "solution": [
          {
            "type": "text",
            "text": "Θ (1) Relevant læringsmål: Forstå hvordan dynamiske tabeller fungerer (inkl. operasjonene Table-Insert)."
          },
          {
            "type": "text",
            "text": "Figur 1 Graf til oppgave 10"
          }
        ]
      },
      {
        "id": "2024-aug-07",
        "number": 7,
        "problemPage": 1,
        "solutionPage": 3,
        "prompt": [
          {
            "type": "text",
            "text": "Du har en rettet, uvektet graf G = (V, E), og skal finne korteste veier fra alle noder i V til én gitt node t. Hvordan vil du gå frem?"
          },
          {
            "type": "text",
            "text": "Figur 1 Graf til oppgave 10"
          }
        ],
        "solution": [
          {
            "type": "text",
            "text": "Snu retningen på alle kantene i G, og kjør BFS fra t. Relevante læringsmål: Forstå ulike varianter av korteste-vei- eller kortestesti-problemet (Single-source, single-destination, single-pair, all-pairs); forstå BFS, også for å finne korteste vei uten vekter."
          }
        ]
      },
      {
        "id": "2024-aug-08",
        "number": 8,
        "problemPage": 2,
        "solutionPage": 3,
        "prompt": [
          {
            "type": "text",
            "text": "Du ønsker å finne lengste enkle vei fra node s til node t i en vektet graf. Hvordan kan du gjøre det? Er det tilfeller der metoden ikke vil fungere? Forklar kort."
          }
        ],
        "solution": [
          {
            "type": "text",
            "text": "Gang alle kantvekter med −1 og finn korteste vei med en standard algoritme som f.eks. Bellman-Ford. Det vil ikke fungere (dvs., alle kjente algoritmer vil feile) dersom man kan gå innom en positiv sykel i den opprinnelige grafen (som altså blir en negativ sykel i den nye). Det skader ikke om man har positive sykler generelt, så lenge ingen av stiene fra s til t kan gå innom noen av dem. Man vil likevel få full uttelling om man sier at metoden ikke vil fungere dersom grafen har positive sykler. Det vil fortsatt være mulig å finne korteste enkle vei (om den eksisterer) uansett. Men om P ̸= NP, vil det ikke kunne gjøres i polynomisk tid. Relevant læringsmål: Forstå at lengste enkle vei kan løses vha. korteste enkle vei; forstå at lengste-enkle-vei-problemet er NP-hardt."
          }
        ]
      },
      {
        "id": "2024-aug-09",
        "number": 9,
        "problemPage": 2,
        "solutionPage": 3,
        "prompt": [
          {
            "type": "text",
            "text": "Løsningen på det binære ryggsekkproblemet (0-1 knapsack) har kjøretid Θ(nW), der n er antall gjenstander og W er kapasiteten til ryggsekken. Er dette en polynomisk algoritme? Forklar kort."
          }
        ],
        "solution": [
          {
            "type": "text",
            "text": "Nei, fordi W vokser eksponentielt med problemstørrelsen. Relevant læringsmål: Forstå hvorfor løsningen på det binære ryggsekkproblemet ikke er polynomisk."
          }
        ]
      },
      {
        "id": "2024-aug-10",
        "number": 10,
        "problemPage": 2,
        "solutionPage": 4,
        "prompt": [
          {
            "type": "visual",
            "kind": "adjacency-2024-aug"
          },
          {
            "type": "text",
            "text": "Du skal representere grafen i figur 1 som en nabomatrise. Fyll inn 0 og 1 i tabellen under."
          }
        ],
        "solution": [
          {
            "type": "text",
            "text": "1       1   1   1"
          },
          {
            "type": "text",
            "text": "Se tabellen over. Her er 0-verdier utelatt for økt lesbarhet. Relevant læringsmål: Forstå hvordan grafer kan implementeres."
          }
        ]
      },
      {
        "id": "2024-aug-11",
        "number": 11,
        "problemPage": 2,
        "solutionPage": 4,
        "prompt": [
          {
            "type": "text",
            "text": "Hva er et nodedekke (vertex cover)?"
          }
        ],
        "solution": [
          {
            "type": "text",
            "text": "Et nodedekke for en graf G = (V, E) er en delmengde V′ ⊆ V slik at hvis (u, v) ∈ E, så er minst én av u og v i V′ . Relevant læringsmål: Kjenne det NP-komplette problemet VERTEXCOVER."
          }
        ]
      },
      {
        "id": "2024-aug-12",
        "number": 12,
        "problemPage": 2,
        "solutionPage": 4,
        "prompt": [
          {
            "type": "text",
            "text": "I pensumdefinisjonen av flytnett (flow networks) tillates ikke antiparallelle kanter, altså at vi har en kant både fra v1 til v2 og fra v2 til v1 . Dersom vi likevel har slike kanter, hvordan kan vi håndtere det?"
          }
        ],
        "solution": [
          {
            "type": "text",
            "text": "Vi kan splitte én av dem ved å sette inn en ny node. Vi kan f.eks. erstatte (v1 , v2 ) med (v1 , v′ ) og (v′ , v2 ), der v′ er en ny node. De to nye kantene får samme kapasitet som (v1 , v2 ). Relevant læringsmål: Kunne håndtere antiparallelle kanter."
          }
        ]
      },
      {
        "id": "2024-aug-13",
        "number": 13,
        "problemPage": 2,
        "solutionPage": 4,
        "prompt": [
          {
            "type": "text",
            "text": "På tilsvarende måte som i Bellman-Ford, skal du utføre Relax på alle kantene i den følgende grafen én gang. Rekkefølgen er ikke gitt."
          },
          {
            "type": "visual",
            "kind": "relax-graph-2024-aug"
          },
          {
            "type": "text",
            "text": "node 5, uthevet)? Oppgi svaret som to tall, adskilt med komma. Hver nodes d-verdi før du starter er angitt i noden i figuren, så f.eks. 4.d = 6."
          },
          {
            "type": "text",
            "text": "Du skal altså ikke utføre hele Bellman-Ford, men oppdatere estimatet én gang langs hver kant, i en eller annen rekkefølge."
          }
        ],
        "solution": [
          {
            "type": "text",
            "text": "ne i den følgende grafen én gang. Rekkefølgen er ikke gitt."
          },
          {
            "type": "text",
            "text": "6, 7 Relevant læringsmål: Forstå kant-slakking (edge relaxation) og Relax."
          }
        ]
      },
      {
        "id": "2024-aug-14",
        "number": 14,
        "problemPage": 3,
        "solutionPage": 5,
        "prompt": [
          {
            "type": "text",
            "text": "Løs følgende rekurrens: n T(n) = T(n − 1) · 22       ( n ⩾ 1) T( 0 ) = 2 Oppgi svaret eksakt, dvs. uten asymptotisk notasjon."
          }
        ],
        "solution": [
          {
            "type": "text",
            "text": "n Oppgi svaret eksakt."
          },
          {
            "type": "text",
            "text": "n +1 −1 T ( n ) = 22"
          },
          {
            "type": "text",
            "text": "n"
          },
          {
            "type": "equation",
            "title": "Utregning",
            "lines": [
              "T ( n ) = T ( n − 1 ) · 22",
              "n −1          n",
              "= T ( n − 2 ) · 22            · 22",
              "n −2          n −1   n",
              "= T ( n − 3 ) · 22       · 22      · 22",
              "⋮",
              "⋮",
              "0       1        n −1       n",
              "= 22 · 22 · · · 22          · 22",
              "0     1   n −1 n",
              "= 22 +2 +2 +2",
              "n + 1",
              "= 22 −1",
              "Relevant læringsmål: Kunne løse rekurrenser med iterasjonsmetoden; ha"
            ]
          },
          {
            "type": "text",
            "text": "noe kjennskap til rekkesummer (inkl. 0 + 1 + 2 + 4 + · · · + 2n = 2n+1 − 1)."
          }
        ]
      },
      {
        "id": "2024-aug-15",
        "number": 15,
        "problemPage": 3,
        "solutionPage": 5,
        "prompt": [
          {
            "type": "text",
            "text": "I Transitive-Closure angir tij om det finnes en sti fra i til j. Anta nå at den rettede grafen du får som input er asyklisk. Hvordan kan du endre algoritmen så tij blir antall stier fra i til j? Du kan ev. beskrive løsningen din som en endring av Floyd-Warshall."
          }
        ],
        "solution": [
          {
            "type": "text",
            "text": "I iterasjon k, la tij = tij + tik · tkj . Når vi får lov til å gå innom k, tell alle stier vi har som ikke går innom k, og så tell alle kombinasjoner av stier fra i til k og stier fra k til j. Siden vi ikke har sykler, vet vi at stiene fra i til k ikke kan dele noder med stiene fra k til j, så antallet kombinasjoner blir tik · tkj . Mer drastiske endringer, som å bytte ut hele algoritmen med mer direkte dynamisk programmering (nært beslektet med DAG-Shortest-Paths) gir liten eller ingen uttelling. Relevant læringsmål: Forstå Floyd-Warshall og Transitive-Closure."
          }
        ]
      },
      {
        "id": "2024-aug-16",
        "number": 16,
        "problemPage": 3,
        "solutionPage": 6,
        "prompt": [
          {
            "type": "text",
            "text": "Et problem med Quicksort er at kjøretiden blir dårlig om pivotelementet er dårlig. Kan man velge pivot slik at kjøretiden garantert blir Θ(n lg n)? Forklar. Her er det snakk om å kun modifisere hvordan man velger pivot; resten av Quicksort skal utføres som normalt. Hvert rekursive kall skal også utføres på samme måte, så man kan ikke f.eks. bruke Merge-Sort til å begynne med for å «jukse seg til» riktig kjøretid."
          }
        ],
        "solution": [
          {
            "type": "text",
            "text": "Ja. Bruk Select til å finne medianen i lineær tid. Merk at dette vil gi en mye høyere konstantfaktor enn vanlig Quicksort, og vil trolig gi atskillig dårligere kjøretid i praksis. Relevante læringsmål: Forstå Quicksort; kjenne til Select."
          }
        ]
      },
      {
        "id": "2024-aug-17",
        "number": 17,
        "problemPage": 3,
        "solutionPage": 6,
        "prompt": [
          {
            "type": "text",
            "text": "Du har n gjenstander og skal gi én til hver av n personer. Personene kan foretrekke ulike gjenstander. Helst vil du at ingen skal misunne noen andre, men du innser at det neppe er mulig. I stedet lager du et lotteri for hver gjenstand. Heller enn å gi ut gjenstandene direkte, får hver person en tilfeldig prioritet for hver gjenstand. Målet ditt er at ingen skal misunne noen som har lavere prioritet. Vil det alltid være mulig å fordele gjenstandene slik? Hvordan? Om du har fått gjenstand x, så skal jeg altså ikke misunne deg, med mindre jeg har lavere prioritet for gjenstand x."
          }
        ],
        "solution": [
          {
            "type": "text",
            "text": "Ja. Man kan bruke Gale-Shapley, som gir en stabil matching, som tilsvarer den typen fordeling vi er ute etter. Relevante læringsmål: Forstå hva stabil matching (stable matching) er; forstå Gale-Shapley."
          }
        ]
      },
      {
        "id": "2024-aug-18",
        "number": 18,
        "problemPage": 3,
        "solutionPage": 6,
        "prompt": [
          {
            "type": "text",
            "text": "Din venn Lurvik studerer to beslutningsproblemer, A og B, der han har en eksponentiell algoritme for A og en polynomisk algoritme for B. Han har vist at A ikke kan løses raskere enn eksponentielt. Lurvik har også funnet reduksjoner fra A til B og fra B til A. Hva kan du si om kjøretiden til hver av disse reduksjonene? Forklar kort. Om vi ser på A og B som formelle språk, har Lurvik altså funnet to reduksjonsfunksjoner f og g, der x ∈ A hvis og bare hvis f(x ) ∈ B og x ∈ B hvis og bare hvis g( x ) ∈ A."
          },
          {
            "type": "text",
            "text": "Spørsmålet er hva du kan si om kjøretiden som kreves for å beregne reduksjonsfunksjonene f og g. I pensum antas en reduksjon generelt å ha polynomisk kjøretid, men her kan du se bort fra det."
          }
        ],
        "solution": [
          {
            "type": "text",
            "text": "For å redusere fra A til B kreves eksponentiell kjøretid. Kunne vi gjøre det raskere, kunne vi løse A raskere, og det har Lurvik bevist er umulig. Vi kan ikke si noe om kjøretiden til reduksjonen i motsatt retning. Det eksisterer reduksjoner fra B til A med polynomisk kjøretid, som bare løser B og så velger én av to mulige instanser for å A, for å få riktig svar. Men hvis B inneholder store nok instanser, kan reduksjonsfunksjonen også mappe fra instanser av størrelse n til instanser av størrelse 2n eller n! eller verre, og vil da kunne kreve vilkårlig kjøretid. Her gis det også …"
          }
        ]
      },
      {
        "id": "2024-aug-19",
        "number": 19,
        "problemPage": 4,
        "solutionPage": 7,
        "prompt": [
          {
            "type": "code",
            "title": "Algoritme 1 · Unzip(x)",
            "startLine": 1,
            "code": "if x == null\n  let L, R be new lists\nelse allocate new nodes y and z\n  y.key = x.key[1]\n  z.key = x.key[2]\n  L = Unzip(x.next)[1]\n  R = Unzip(x.next)[2]\n  List-Prepend(L, y)\n  List-Prepend(R, z)\nreturn <L, R>"
          },
          {
            "type": "text",
            "text": "I mange programmeringsspråk har man en funksjon som heter Zip, som tar inn to lister, og returnerer en liste av par, der par i består av element i fra hver av de to listene. Prosedyren Unzip (algoritme 1) gjør det motsatte. Den tar inn hodet til en lenket liste (linked list) av par (tabeller av lengde 2) og fordeler dem i to lister L og R. Hvordan ville du ha endret algoritmen for å forbedre kjøretiden? Hva blir kjøretiden før og etter forbedringen din? Forklar."
          }
        ],
        "solution": [
          {
            "type": "text",
            "text": "En enkel løsning er å bytte ut linje 6 og 7 med noe som dette:"
          },
          {
            "type": "code",
            "title": "Pseudokode",
            "startLine": 6,
            "code": "L, R = Unzip( x.next)"
          },
          {
            "type": "text",
            "text": "Da reduseres antallet rekursive kall fra 2 til 1, og man endrer rekurrensen for kjøretiden fra T(n) = 2T(n − 1) + Θ(1) til T(n) = T(n − 1) + Θ(1), og man går fra eksponentiell til lineær kjøretid, altså fra Θ(2n ) til Θ(n). Man kan selvfølgelig beskrive løsningen på flere måter, som f.eks.:"
          },
          {
            "type": "code",
            "title": "Pseudokode",
            "startLine": 6,
            "code": "U = Unzip( x.next)\nL = U[1]\nR = U[2]"
          }
        ]
      },
      {
        "id": "2024-aug-20",
        "number": 20,
        "problemPage": 4,
        "solutionPage": 8,
        "prompt": [
          {
            "type": "text",
            "text": "Counting-Sort(A, n, k ) tar inn en tabell A[1 : n] med heltall i området 0, . . . , k og fyller en tabell C[0 : k] med antall forekomster i A av hver mulige verdi, og bruker Θ(n + k ) operasjoner på dette. Du skal nå gjøre en lignende telling, der A allerede er sortert. Du kan anta at du også får inn C som parameter, og at C er initialisert, så C[i ] = 0 for i = 0, . . . , k. Bruk metoden splitt og hersk til å konstruere en algoritme som løser problemet med kjøretid O(n) generelt, men som er raskere enn dette når A inneholder mange duplikater."
          }
        ],
        "solution": [
          {
            "type": "text",
            "text": "Om første og siste element er forskjellige, løs rekursivt for hver halvdel. Ellers øk C[i ] med lengden av intervallet, der i er første element. Pseudokode kreves ikke, men inkluderes her for å vise detaljer:"
          },
          {
            "type": "code",
            "title": "Freq(A, C, p, r )",
            "startLine": 1,
            "code": "if A[ p] == A[r ]\n  C[A[ p]] = C[A[ p]] + r − p + 1\nelse q = ⌊( p + r )/2⌋\n  Freq(A, C, p, q)\n  Freq(A, C, q + 1, r )"
          },
          {
            "type": "text",
            "text": "Prosedyren kalles initielt med Freq(A, C, 1, n), der det antas at n ⩾ 1. At kjøretiden er O(n) følger av rekurrensen T(n) ⩽ 2T(n/2) + Θ(1). Jo flere ganger linje 1 slår inn, jo lavere vil kjøretiden være. Om man bruker binærsøk separat for å finne starten og slutten på forekomstene av hver verdi, er ikke kjøretiden O(n). Det vil likevel gi 4 poeng. Relevant læringsmål: Forstå designmetoden divide-and-conquer (splitt og hersk)."
          }
        ]
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
        "problemPage": 1,
        "solutionPage": 1,
        "prompt": [
          {
            "type": "text",
            "text": "Hva er kjøretiden til Kruskal? Oppgi svaret med O-notasjon."
          }
        ],
        "solution": [
          {
            "type": "text",
            "text": "O(E lg V) O(E lg E) gir 4 poeng. Relevant læringsmål: Forstå MST-Kruskal."
          }
        ]
      },
      {
        "id": "2024-des-02",
        "number": 2,
        "problemPage": 1,
        "solutionPage": 1,
        "prompt": [
          {
            "type": "text",
            "text": "Hvilke antagelser gjør vi normalt om input til Bucket-Sort?"
          }
        ],
        "solution": [
          {
            "type": "text",
            "text": "At elementene er tilfeldige tall i intervallet [0, 1). Mer presist, at de er uavhengige og uniformt fordelte over dette intervallet. Her får man full uttelling også for tilsvarende forklaringer, som at de er «jevnt fordelt mellom 0 og 1» eller lignende, også uten å si at de er tilfeldige. Her kan man også få full uttelling uten eksplisitt å angi intervallet [0, 1). Relevant læringsmål: Forstå Bucket-Sort."
          }
        ]
      },
      {
        "id": "2024-des-03",
        "number": 3,
        "problemPage": 1,
        "solutionPage": 1,
        "prompt": [
          {
            "type": "text",
            "text": "Hvordan vurderer du følgende hashfunksjon? Forklar kort. h(k) = min{m, 2k } Spørsmålet er altså hvor god eller dårlig hashfunksjonen er, og hvorfor. Her er k et positivt heltall og m er størrelsen på hashtabellen."
          }
        ],
        "solution": [
          {
            "type": "text",
            "text": "Den er dårlig, siden de fleste nøklene vil få h(k) = m og kollidere. Mer spesifikt vil man maksimalt utnytte log2 m av posisjonene (slots) i tabellen, og alle nøkler k ⩾ log2 m vil vil havne på posisjon m. Relevant læringsmål: Forstå hvordan hashtabeller fungerer."
          }
        ]
      },
      {
        "id": "2024-des-04",
        "number": 4,
        "problemPage": 1,
        "solutionPage": 2,
        "prompt": [
          {
            "type": "text",
            "text": "Hvilket problem løser denne prosedyren?"
          },
          {
            "type": "code",
            "title": "Pseudokode",
            "startLine": 1,
            "code": "while x.left ̸= nil\n  x = x.left\nreturn x"
          },
          {
            "type": "text",
            "text": "Dette er altså en prosedyre fra pensum. Vi er ute etter funksjonaliteten – hva den brukes til – og ikke bare hvordan den oppfører seg."
          }
        ],
        "solution": [
          {
            "type": "text",
            "text": "Den finner minimum (noden med minst nøkkel) i et binært søketre. Dette er prosedyren Tree-Minimum. Om man svarer at den finner noden lengst til venstre, gir det 3 poeng. Relevante læringsmål: Forstå hvordan binære søketrær fungerer; forstå Tree-Minimum."
          }
        ]
      },
      {
        "id": "2024-des-05",
        "number": 5,
        "problemPage": 1,
        "solutionPage": 2,
        "prompt": [
          {
            "type": "text",
            "text": "Hvordan kan du gjenskape funksjonaliteten til en stakk (stack) ved hjelp av en makshaug (max-heap)? Baser deg på vanlige haugoperasjoner, uten å tenke på hvordan haugen faktisk er implementert. Fokuser på hvordan prioritetene/nøklene skal velges."
          }
        ],
        "solution": [
          {
            "type": "text",
            "text": "Når et element settes inn, gi det en prioritet som er f.eks. 1 høyere enn nåværende maksimum. Eventuelt ha en teller som økes for hver innsetting, og bruk denne til å gi nye elementer prioritet. Oppgaven er basert på oppgave 6.5-9 fra læreboka. Relevante læringsmål: Forstå hvordan stakker fungerer; forstå hvordan hauger fungerer."
          }
        ]
      },
      {
        "id": "2024-des-06",
        "number": 6,
        "problemPage": 1,
        "solutionPage": 2,
        "prompt": [
          {
            "type": "visual",
            "kind": "dfs-chain-2024-des"
          },
          {
            "type": "text",
            "text": "Utfør DFS på grafen nedenfor, slik at første kall til DFS-Visit starter i node y. Hva blir v.d og v.f(discovery time og finish time) for hver node v?"
          },
          {
            "type": "text",
            "text": "Oppgi svaret som to lister med 4 tall på hver sin linje, som f.eks.:"
          },
          {
            "type": "text",
            "text": "1, 2, 4, 7 5, 6, 3, 8 Første linje er x.d, y.d, z.d, w.d, i rekkefølge, og andre linje er x. f , y. f , z. f , w. f . Hint: Husk at DFS starter en ny dybde-først-traversering med DFS-Visit fra hver eneste node som ikke allerede er besøkt."
          }
        ],
        "solution": [
          {
            "type": "text",
            "text": "7, 1, 2, 3"
          },
          {
            "type": "visual",
            "kind": "dfs-chain-2024-des"
          },
          {
            "type": "text",
            "text": "Her får man også full uttelling om man har startet på 0, og altså svart:"
          },
          {
            "type": "text",
            "text": "Om man har startet i x (dvs., 1, 2, 3, 4 / 8, 7, 6, 5) gir det 3 poeng. Relevant læringsmål: Forstå DFS."
          }
        ]
      },
      {
        "id": "2024-des-07",
        "number": 7,
        "problemPage": 2,
        "solutionPage": 3,
        "prompt": [
          {
            "type": "visual",
            "kind": "residual-edge-2024-des"
          },
          {
            "type": "text",
            "text": "Hva er restkapasiteten (residual capacity) fra u til v her?"
          },
          {
            "type": "text",
            "text": "Det er altså snakk om kapasiteten i restnettet, c_f (u, v)."
          }
        ],
        "solution": [
          {
            "type": "text",
            "text": "Relevant læringsmål: Kunne definere restnettet til et flytnett med en gitt flyt."
          }
        ]
      },
      {
        "id": "2024-des-08",
        "number": 8,
        "problemPage": 2,
        "solutionPage": 3,
        "prompt": [
          {
            "type": "visual",
            "kind": "huffman-2024-des"
          },
          {
            "type": "text",
            "text": "Du har oppgitt følgende frekvenser for tegnene a, b, c og d: a.freq = 8        b.freq = 4           c.freq = 2           d.freq = 4 Hvilke av trærne 1–5 i figur 1 er korrekte huffmantrær for disse tegnene, med disse frekvensene? Forklar kort. Oppgi svaret som en liste av tall, som f.eks.: 1, 2, 3, 4, 5 Med «huffmantre» menes et tre som kan konstrueres av Huffmans algoritme, hvis det er tilfeldig om en barnenode havner til venstre eller høyre. Det er minst ett korrekt huffmantre i figur 1, men det kan være flere."
          }
        ],
        "solution": [
          {
            "type": "text",
            "text": "3, 4 Slår alltid sammen deltrær med lavest frekvens, altså først b og enten c eller d. Eneste mulighet her er er med b og c sammen nederst (enten 4 eller 5). Disse slås sammen med d, og til slutt a. Merk at bokas prosededyre Huffman plasserer minste barn til venstre, og ville ha plassert d til venstre for b og c."
          },
          {
            "type": "visual",
            "kind": "huffman-2024-des"
          }
        ]
      },
      {
        "id": "2024-des-09",
        "number": 9,
        "problemPage": 2,
        "solutionPage": 4,
        "prompt": [
          {
            "type": "text",
            "text": "Hva er kjøretiden til følgende prosedyre, som funksjon av n?"
          },
          {
            "type": "code",
            "title": "Pseudokode",
            "startLine": 1,
            "code": "for i = 1 to Ω(n)\n  for j = 1 to O(n)"
          },
          {
            "type": "text",
            "text": "3            print “Hello, world!” De asymptotiske operatorene representerer her ukjente men reelle funksjoner, på samme måte som når de f.eks. brukes i aritmetiske uttrykk."
          }
        ],
        "solution": [
          {
            "type": "text",
            "text": "Ω(n) Relevante læringsmål: Kunne analysere algoritmers effektivitet; kunne definere og bruke asymptotisk notasjon, inkl. O og Ω."
          }
        ]
      },
      {
        "id": "2024-des-10",
        "number": 10,
        "problemPage": 2,
        "solutionPage": 4,
        "prompt": [
          {
            "type": "text",
            "text": "De følgende to trinnene utgjør tilsammen en sammenligningsbasert sorteringsalgoritme (comparison sort), som sorterer en tabell A med n elementer:"
          },
          {
            "type": "code",
            "title": "Pseudokode",
            "startLine": 1,
            "code": "Init(A, n)\nMain(A, n)"
          },
          {
            "type": "text",
            "text": "Kjøretiden til Main er O(n). Hva er kjøretiden til Init i verste tilfelle? Om du har en usortert tabell A av lengde n og først kjører Init(A, n) og deretter Main(A, n), vil altså A ende opp sortert, og både Init og Main baserer seg kun på å sammenligne elementene i A."
          },
          {
            "type": "text",
            "text": "Løs rekurrensen T(n) = 2T(n/4) + n lg n. Oppgi svaret i Θ-notasjon. p"
          }
        ],
        "solution": [
          {
            "type": "text",
            "text": "Ω(n lg n) Summen av kjøretidene må være Ω(n lg n), på grunn av den generelle sorteringsgrensen, og Main har lavere kjøretid enn dette. Relevante læringsmål: Forstå hvorfor sammenligningsbasert sortering har en worst-case på Ω(n lg n)."
          },
          {
            "type": "text",
            "text": "p"
          }
        ]
      },
      {
        "id": "2024-des-11",
        "number": 11,
        "problemPage": 2,
        "solutionPage": 5,
        "prompt": [
          {
            "type": "visual",
            "kind": "sqrt-laws-2024-des"
          }
        ],
        "solution": [
          {
            "type": "text",
            "text": "q Θ       n lg^3 n \u0001"
          },
          {
            "type": "text",
            "text": "Dette kan skrives på flere måter, som f.eks. Θ(n^(1/2) · lg 3/2 n). Følger av tilfelle 2 av masterteoremet, der a = 2, b = 4 og k = 1/2. Relevant læringsmål: Kunne løse rekurrenser med masterteoremet."
          }
        ]
      },
      {
        "id": "2024-des-12",
        "number": 12,
        "problemPage": 3,
        "solutionPage": 5,
        "prompt": [
          {
            "type": "visual",
            "kind": "mst-cut-2024-des"
          },
          {
            "type": "text",
            "text": "Du bygger et minimalt spenntre gradvis, ved å legge til kanter i mengden A. Du vurderer å legge til den letteste kanten som krysser snittet (S, V − S). Hvilket krav stiller vi normalt til forholdet mellom nåværende A og dette snittet for at det skal være trygt å legge til denne kanten? Med «normalt» menes her altså strategien som beskrives i pensum ifm. GenericMST, og som bl.a. MST-Kruskal og MST-Prim baserer seg på. En illustrasjon av hvordan den foreløpige kantmengden A og snittet (cut) mellom S og (V − S) kan se ut finner du i figur 2."
          }
        ],
        "solution": [
          {
            "type": "text",
            "text": "Ingen av kantene i A må krysse snittet. Se teorem 21.1. Her får man også full uttelling for å si at snittet må gå mellom sammenhengende komponenter i A, jf. korollar 21.2. Figuren er basert på figur 21.2 i boka. Det gis flere indikasjoner på hva det spørres etter (bruken av «normalt», og angivelsen av bruken i MST-Kruskal og MST-Prim), og om man har mestret relevante læringsmål, bør det ikke være tvil om hvilket krav det er snakk om. Likevel er det strengt tatt ikke nødvendig å stille noen krav til"
          },
          {
            "type": "visual",
            "kind": "mst-cut-2024-des"
          }
        ]
      },
      {
        "id": "2024-des-13",
        "number": 13,
        "problemPage": 3,
        "solutionPage": 6,
        "prompt": [
          {
            "type": "text",
            "text": "Din venn Lurvik har støtt på et problem han er usikker på om kan løses i polynomisk tid. Han har tidligere vist at problemet er i NP, men har nå nettopp klart å redusere det til SUBSET-SUM i polynomisk tid, og spør deg om råd. Hva er"
          },
          {
            "type": "text",
            "text": "din vurdering av situasjonen? Svar kort."
          }
        ],
        "solution": [
          {
            "type": "text",
            "text": "Alle problemer i NP kan reduseres til SUBSET-SUM i polynomisk tid, siden det er NP-komplett, så reduksjonen forteller oss ikke noe nytt. Mer spesifikt, så forteller det oss ikke om problemet er NP-komplett, eller om det kan løses i polynomisk tid. Det vet vi fortsatt ingenting om. Relevante læringsmål: Forstå redusibilitets-relasjonen ⩽P ; forstå definisjonen av NP-kompletthet; kjenne det NP-komplette problemet SUBSET-SUM."
          }
        ]
      },
      {
        "id": "2024-des-14",
        "number": 14,
        "problemPage": 4,
        "solutionPage": 6,
        "prompt": [
          {
            "type": "text",
            "text": "Vi snakker gjerne om tre ulike typer gjennomsnittlig kjøretid. Hvilke? Merk at det er snakk om ulike typer gjennomsnittlig kjøretid (altså ikke f.eks. beste og verste tilfelle). Her regnes forventning (expectation) som en form for gjennomsnitt. Poenget er å forklare hva vi tar gjennomsnitt av, eller finner forventningsverdien over, for hver av de tre typene, heller enn å oppgi hva de heter."
          }
        ],
        "solution": [
          {
            "type": "text",
            "text": "Vi har vanlig gjennomsnittlig (average-case) kjøretid, der vi tar gjennomsnitt over instanser/inputs. (Ev. forventningsverdi for tilfeldige instanser.)"
          },
          {
            "type": "text",
            "text": "Vi har også forventet kjøretid for randomiserte algoritmer, der man ser på forventningsverdien over tilfeldige valg som gjøres. Til slutt har vi amortisert kjøretid, der man tar gjennomsnittet over en serie med operasjoner, gjerne på samme datastruktur. Her gir hver av de tre typene 2 poeng, opp til maksimalt 5 poeng. Hver type som oppgis kun ved navn, uten forklaring, gir 1 poeng. For spesielt interesserte: Vi kan også ha kombinasjoner. Om man f.eks. ser på gjennomsnittlig kjøretid for en randomisert algoritme, må man kombinere hensyn til instanser og tilfeldige valg, dersom begge deler påvirker resultatet. Relevante læringsmål: Kunne definere average-case og amortisert analyse; forstå (f.eks.) Randomized-Quicksort."
          }
        ]
      },
      {
        "id": "2024-des-15",
        "number": 15,
        "problemPage": 4,
        "solutionPage": 7,
        "prompt": [
          {
            "type": "text",
            "text": "Under ser du matrisene W og L(2) fra en kjøring av Slow-APSP."
          },
          {
            "type": "visual",
            "kind": "apsp-2024-des"
          },
          {
            "type": "text",
            "text": "Hva blir l^(3)_(1,5)? Forklar svært kort. Du skal altså i praksis utføre Extend-Shortest-Paths én gang. Her angir L(r) lengdene til de korteste stiene som inneholder maksimalt r kan(r ) ter, der li,j er lengden fra node i til node j, altså cellen i rad i og kolonne j."
          },
          {
            "type": "text",
            "text": "En enkel tekstlig forklaring er tilstrekkelig. Du trenger ikke bruke matematisk notasjon."
          }
        ],
        "solution": [
          {
            "type": "text",
            "text": "Prøv alle forgjengere k og velg eksisterende sti til k + kant fra k som gir kortest lengde – eller behold eksisterende sti. Om man heller bruker fremgangsmåten til Faster-APSP, og kombinerer stien frem til k og videre fra k (dvs., bruker L to ganger, heller enn L og W), og forklarer dette riktig, gir det 4 poeng. Grafen er som vist nedenfor. Her har vi i utgangspunktet stien 1 → 2 → 5, men finner en snarvei ved å kombinere stien 1 → 2 → 4 og kanten 4 → 5."
          },
          {
            "type": "visual",
            "kind": "apsp-2024-des"
          }
        ]
      },
      {
        "id": "2024-des-16",
        "number": 16,
        "problemPage": 4,
        "solutionPage": 8,
        "prompt": [
          {
            "type": "text",
            "text": "Tabellen A = ⟨ a1 , a2 , . . . , an ⟩ inneholder nøklene fra et komplett (dvs., perfekt balansert) binært søketre uten duplikater. Nøklene er hentet ut fra venstre mot høyre, nivå for nivå fra bunnen, som illustrert i figur 3 (for n = 15). Du skal sortere A ved å utføre alle følgende kall i en eller annen rekkefølge: Insertion-Sort(A, n), Merge-Sort(A, 1, n), Quicksort(A, 1, n), Reverse(A) Anta at Partition er modifisert så den bevarer rekkefølgen på elementene som havner i de to halvdelene, med samme kjøretid som den har originalt. (Dette kan gjøres f.eks. ved hjelp av en lenket liste.) I hvilken rekkefølge vil du utføre prosedyrene? Forklar. Oppgi svaret ved å liste opp navnene i riktig rekkefølge, som f.eks.: Insertion-Sort, Merge-Sort, Quicksort, Reverse Prosedyrene utføres etter hverandre, så A endres for hvert kall, og skal ende opp sortert til slutt."
          },
          {
            "type": "visual",
            "kind": "array-tree-2024-des"
          },
          {
            "type": "text",
            "text": "Målet er at hver av prosedyrene individuelt skal få så lav asymptotisk kjøretid som mulig. Du bør altså ikke bare se på den totale asymptotiske kjøretiden. Merk: Her brukes den deterministiske prosedyren Quicksort, som velger siste element som pivot, og ikke Randomized-Quicksort, som velger tilfeldig. Reverse reverserer tabellen i lineær tid, så første element blir sist, etc."
          }
        ],
        "solution": [
          {
            "type": "text",
            "text": "Quicksort, Insertion-Sort, Reverse, Merge-Sort eller Quicksort, Reverse, Merge-Sort, Insertion-Sort Alle oppnår da sin beste mulige (best-case) kjøretid. For Quicksort vil alle pivot-elementer dele tabellen i to like deler, og kjøretiden blir Θ(n lg n), mens Insertion-Sort kjøres på en sortert sekvens, og får kjøretid Θ(n). …"
          }
        ]
      },
      {
        "id": "2024-des-17",
        "number": 17,
        "problemPage": 5,
        "solutionPage": 9,
        "prompt": [
          {
            "type": "code",
            "title": "Algoritme 1 · Prioritetskø for avstandsestimater",
            "startLine": 1,
            "code": "for each vertex u in G.V - {s}\n  u.d = infinity\ns.d = 0\nQ = empty\nInsert(Q, s)\nwhile Q != empty\n  u = Extract-Min(Q)\n  for each vertex v in G.Adj[u]\n    if v.d > u.d + w(u, v)\n      v.d = u.d + w(u, v)\n      if v is in Q\n        Decrease-Key(Q, v, v.d)\n      else Insert(Q, v)"
          },
          {
            "type": "text",
            "text": "Din venn Klokland vil forbedre Bellman-Ford ved å holde styr på hvilke avstandsestimater som faktisk endrer seg. Hun vil gjøre dette med en eller annen slags kø, som til å begynne med bare inneholder startnoden. Hun tenker også det er lurt å fokusere på lave estimater, og bruker derfor en prioritetskø. I hver iterasjon henter hun en node u fra køen og oppdaterer estimatet langs alle kanter (u, v). Hvis v.d endres, og v ikke ligger i køen, legges den inn. Hva er kjøretiden hvis grafen inneholder negative sykler og hva er den hvis grafen ikke har negative kantvekter? Forklar kort. Du kan anta (1) at hun bruker en binær min-haug (binary min-heap) som prioritetskø, med v.d som prioritet for hver node v, (2) at det tar konstant tid å sjekke om en node ligger i køen og (3) at alle noder kan nås fra startnoden. For full pseudokode, se algoritme 1, men merk at det er fullt mulig å besvare oppgaven uten å lese eller forstå pseudokoden."
          }
        ],
        "solution": [
          {
            "type": "text",
            "text": "Om vi har negative sykler, vil ikke algoritmen terminere. Om vi ikke har negative kantvekter, vil hver node tas ut av køen nøyaktig én gang, akkurat som i Dijkstra, og vi får kjøretid O(E lg V). Generelt kunne vi ha hatt negative sykler som ikke kunne nås fra startnoden, uten at det skapte problemer, men her er det e …"
          }
        ]
      },
      {
        "id": "2024-des-18",
        "number": 18,
        "problemPage": 5,
        "solutionPage": 11,
        "prompt": [
          {
            "type": "text",
            "text": "Hvordan vil du modifisere Floyd-Warshall for å finne de m korteste stiene mellom alle par med noder, heller enn bare den korteste? Du kan anta at m er en liten konstant. Det holder at du finner lengdene til de m korteste stiene. Du trenger altså ikke finne de faktiske stiene. Merk: Her er det ikke snakk om å finne m stier fra u til v, der alle har minimal lengde, og følgelig er like lange! Om man sorterer stiene fra u til v etter lengde, er vi ute etter de m første."
          }
        ],
        "solution": [
          {
            "type": "text",
            "text": "Ta vare på en mengde dij av m verdier for hvert par i, j med noder. Initialiser dij til {wij , ∞, . . . , ∞}. For hver k, la dij være de m minste verdiene fra dij ∪ { x + y : x ∈ dik , y ∈ dkj }. Om man her bruker samme tabell D i alle iterasjoner, eller en ny tabell D(k) for hver iterasjon, spiller ingen rolle. Begge deler gir full uttelling. Forklaring: Resonnementet er essentielt som for det vanlige tilfellet, der m = 1. Hver av de m korteste veiene fra i til j som kun går innom noder {1, . . . , k} må enten gå innom k eller ikke. Vi har allerede funnet de m korteste som ikke går innom k, og må nå vurdere de k korteste som går innom k. Hver av disse vil bestå av én av de m korteste veiene fra i til k og én av de m korteste fra k til j (ellers kunne vi ha forbedret løsningen). Merk: I motsetning til for m = 1, kan noen av stiene her inneholde sykler! Det gjør det umulig å bruke den vanlige metoden med forgjengerpekere for å finne stiene. For spesielt interesserte: Men man kan se på dette som et eksempel på bruken av mer generelle algebraiske strukturer, i dett …"
          }
        ]
      },
      {
        "id": "2024-des-19",
        "number": 19,
        "problemPage": 5,
        "solutionPage": 11,
        "prompt": [
          {
            "type": "text",
            "text": "Du har oppgitt et flytnett (flow network) G = (V, E), med følgende endringer:"
          },
          {
            "type": "list",
            "ordered": false,
            "items": [
              "Kilde (source) s og sluk (sink) t er fjernet.",
              "I tillegg til kapasitet, har hver kant (u, v) fått en nedre grense b(u, v)."
            ]
          },
          {
            "type": "text",
            "text": "I stedet for f(u, v) ⩾ 0, krever vi nå f(u, v) ⩾ b(u, v) for alle u, v ∈ V. Som for kapasiteter, sier vi at b(u, v) = 0 hvis (u, v) ∈ / E. Målet er ikke å maksimere noe, men å finne en hvilken som helst flyt som tilfredsstiller både kapasitetene og de nedre grensene, der flyten inn er lik flyten ut i alle noder – en såkalt sirkulasjon. Hvordan kan du redusere dette til et vanlig flytproblem? Forklar kort. Hint: Hvis f ′ (u, v) = f(u, v) − b(u, v) har vi f ′ (u, v) ⩾ 0 og, for alle u ∈ V,"
          },
          {
            "type": "text",
            "text": "∑ f ′ (u, v) + ∑ b(u, v) = ∑ f ′ (v, u) + ∑ b(v, u) . v ∈V            v ∈V             v ∈V          v ∈V"
          },
          {
            "type": "text",
            "text": "Merk: Det er ikke sikkert at en gyldig sirkulasjon eksisterer!"
          }
        ],
        "solution": [
          {
            "type": "text",
            "text": "Sett kapasiteter til c(u, v) − b(u, v). Legg til kilde s og sluk t. For hver node u, legg til kanter (s, u) og (u, t) med kapasiteter ∑v∈V b(v, u) og ∑v∈V b(u, v). Finn maks-flyt f ′ (u, v). Hvis kantene fra s og til t fylles, øk flyten med b(u, v) for å få sirkulasjonen f(u, v). Ellers finnes ingen gyldig sirkulasjon. Poenget er altså å splitte flyten f(u, v) i to komponenter, f ′ (u, v) og b(u, v), der 0 ⩽ f ′ (u, v) ⩽ c(u, v) − b(u, v). Vi må ha en flyt på minst ∑v b(v, u) inn i node u og minst ∑v b(u, v) ut. Vi flytter midlertidig denne delen av flyten fra de opprinnelige kantene til nye kanter fra s og til t. …"
          }
        ]
      },
      {
        "id": "2024-des-20",
        "number": 20,
        "problemPage": 6,
        "solutionPage": 12,
        "prompt": [
          {
            "type": "text",
            "text": "Din venn Smartnes jobber med å matche n organdonorer og n resipienter, med prioriterte ventelister. Han modellerer dette som en modifisert utgave av stabil matching (the stable marriage problem), med donorer som «kvinner» og resipienter som «menn»:"
          },
          {
            "type": "list",
            "ordered": false,
            "items": [
              "Ventelistene implementeres ved at alle har like preferanser. Det vil si, alle"
            ]
          },
          {
            "type": "text",
            "text": "kvinner rangerer mennene likt, og alle menn rangerer kvinnene likt."
          },
          {
            "type": "list",
            "ordered": false,
            "items": [
              "Ikke alle er kompatible, så den bipartitte grafen er ikke nødvendigvis kom-"
            ]
          },
          {
            "type": "text",
            "text": "plett. Du kan altså ikke alltid matche enhver kvinne med enhver mann."
          },
          {
            "type": "list",
            "ordered": false,
            "items": [
              "Som i vanlig bipartitt matching (maximum bipartite matching) er målet å"
            ]
          },
          {
            "type": "text",
            "text": "matche flest mulig. Smartnes er ikke sikker på om det helt gir mening, men han beholder det opprinnelige kravet til stabilitet:"
          },
          {
            "type": "visual",
            "kind": "stable-matching-2024-des"
          },
          {
            "type": "list",
            "ordered": false,
            "items": [
              "Du kan ikke ha en kvinne og en mann som heller vil ha hverandre enn"
            ]
          },
          {
            "type": "text",
            "text": "partnerne sine (et såkalt blokkerende par, som w og m i figur 4). Han har prøvd å løse problemet ved å kombinere Ford-Fulkerson (for størst mulig matching) og Gale-Shapley (for stabil matching), men har måttet gi opp. Nå lurer han på om du har noen ideer. Hvordan ville du ha løst problemet til Smartnes? Forklar kort. Dersom det er enklere, så holder det at du finner størrelsen på den største stabile matchingen, uten å faktisk finne selve matchingen. Merk: Under Smartnes sin definisjon, kan en kvinne og mann altså utgjøre et blokke …"
          }
        ],
        "solution": [
          {
            "type": "text",
            "text": "matchingen, uten å faktisk finne selve matchingen. …"
          }
        ]
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
        "problemPage": 1,
        "solutionPage": 1,
        "prompt": [
          {
            "type": "text",
            "text": "Sammenlign lenkede lister (linked lists) med tabeller (arrays). Hvilke fordeler og ulemper har de, sammenlignet med hverandre? Forklar."
          }
        ],
        "solution": [
          {
            "type": "text",
            "text": "Her forventes det at man forklarer forskjeller i kjøretid for oppslag og innsetting/endring. Det er også mulig å trekke inn f.eks. minnebruk og utvidelse (dynamiske tabeller)."
          }
        ]
      },
      {
        "id": "2025-aug-02",
        "number": 2,
        "problemPage": 1,
        "solutionPage": 1,
        "prompt": [
          {
            "type": "text",
            "text": "Kan man ha en ustabil matching om man bare har to par? Forklar kort."
          }
        ],
        "solution": [
          {
            "type": "text",
            "text": "Ja, f.eks. om A og B helst vil ha hverandre, men matches med C og D. Dette er oppgave 25.2-2 fra læreboka."
          }
        ]
      },
      {
        "id": "2025-aug-03",
        "number": 3,
        "problemPage": 1,
        "solutionPage": 1,
        "prompt": [
          {
            "type": "text",
            "text": "Hvis et flytnett (flow network) kun har heltallskapasiteter, så vil den største mulige flytverdien også være heltallig. Om vi finner flyten med Ford-Fulkersonmetoden, vil flyten i hver eneste kant også være et heltall. Kan det finnes andre optimale løsninger der flyten i noen av kantene ikke er heltall? Forklar."
          }
        ],
        "solution": [
          {
            "type": "text",
            "text": "Ja. Om man kan fordele flyten som man vil, kan man i mange tilfeller redusere flyten ett sted med mindre enn 1, og øken den tilsvarende et annet sted, f.eks. Poenget er at metoder basert på forøkning alltid fyller opp så"
          },
          {
            "type": "text",
            "text": "mye de kan, og dermed unngår dette."
          }
        ]
      },
      {
        "id": "2025-aug-04",
        "number": 4,
        "problemPage": 1,
        "solutionPage": 2,
        "prompt": [
          {
            "type": "text",
            "text": "Om du bygger et binært søketre av n elementer, hva blir kjøretiden til søk i treet etterpå, i beste og verste tilfelle, og i gjennomsnitt? Forklar. Du bruker altså Tree-Insert for å sette inn ett og ett element, der treet til å begynne med er tomt, og vi er ute etter kjøretiden til Tree-Search på det ferdige treet (best-case, worst-case og average-case). Du kan anta at elementene er tallene 1 . . . n i en (uniformt) tilfeldig rekkefølge."
          }
        ],
        "solution": [
          {
            "type": "text",
            "text": "I beste tilfelle blir kjøretiden Θ(1), uavhengig av hvordan treet er strukturert, siden vi kan ende med å søke etter rota. I verste tilfelle er treet helt ubalansert, og vi søker etter en av de nederste nodene, og ender med kjøretid Θ(n). I gjennomsnitt blir høyden til treet Θ(lg n), og dette blir også den gjennomsnittlige kjøretiden, siden flertallet av nodene har denne dybden."
          }
        ]
      },
      {
        "id": "2025-aug-05",
        "number": 5,
        "problemPage": 2,
        "solutionPage": 2,
        "prompt": [
          {
            "type": "code",
            "title": "Algoritme 1 · Too-Tired-For-This(X, n, k)",
            "startLine": 1,
            "code": "for i = 2 to n\n  y = X[i]\n  j = i - 1\n  while j > 0 and X[j] > y and j >= i - k\n    X[j + 1] = X[j]\n    j = j - 1\n  X[j + 1] = y\n  if j > 0 and X[j] > y\n    return false\nreturn true"
          },
          {
            "type": "text",
            "text": "Se prosedyren i algoritme 1. Hva er kjøretiden i beste og verste tilfelle? Hva kan prosedyren brukes til? Forklar."
          },
          {
            "type": "text",
            "text": "√"
          }
        ],
        "solution": [
          {
            "type": "text",
            "text": "Du kan anta at n er lengden til X, og at vi vil ha kjøretiden uttrykt ved n og k, der k ⩽ n. Forskjellen på beste og verste tilfelle er altså bare innholdet i X."
          },
          {
            "type": "text",
            "text": "Dette er en generalisering av Insertion-Sort, som “ikke orker” å sortere helt ferdig, dersom det er for mye jobb. Det vil si, vi har lagt til en ekstra betingelse i linje 4. Dersom X er sortert, er kjøretiden Θ(n), siden vi aldri går inn i den indre løkka. Dersom X er omvendt sortert, er kjøretiden Θ(kn), siden den indre løkka da alltid vil kjøre så lenge som mulig (altså Θ(k ) ganger). Men den laveste kjøretiden får man om de første k elementene er sortert, etterfulgt av et mindre element. Da blir kjøretiden Θ(k )."
          },
          {
            "type": "text",
            "text": "Prosedyren returnerer true eller false, avhengig av om alle elementene havnet på rett plass. Det vil si, den forteller oss om den klarte å sorterte tabellen eller ikke. Dermed kan den f.eks. brukes til å få bedre kjøretid for tabeller som er nesten sorterte (dvs., der vi må flytte elementene maks k hakk), som følger:"
          },
          {
            "type": "code",
            "title": "Pseudokode",
            "startLine": 1,
            "code": "if not Too-Tired-For-This(X, n, k )\n  Merge-Sort(X, 1, n)"
          },
          {
            "type": "text",
            "text": "Merk: På eksamen var A brukt i stedet for X på linje 2. Det er tatt hensyn til dette under sensur."
          },
          {
            "type": "text",
            "text": "√"
          }
        ]
      },
      {
        "id": "2025-aug-06",
        "number": 6,
        "problemPage": 2,
        "solutionPage": 3,
        "prompt": [
          {
            "type": "text",
            "text": "Løs den algoritmiske rekurrensen T(n) = 4T(9n/16)/3 +             n. Forklar."
          }
        ],
        "solution": [
          {
            "type": "text",
            "text": "Bruk masterteoremet, med a = 4/3, b = 16/9 og f = n^(1/2) . Siden b = 1/2. Det betyr at f = Θ(nlogb a ), og dermed T(n) = a2 , har vi logb a = √ Θ(nlogb a lg n) = Θ( n lg n)."
          }
        ]
      },
      {
        "id": "2025-aug-07",
        "number": 7,
        "problemPage": 2,
        "solutionPage": 3,
        "prompt": [
          {
            "type": "text",
            "text": "Din venn Gløgsund spiller et spill, der hun utforsker en verden, og skal innom et sett med landsbyer. Hun ønsker å utforske alle landsbyene så effektivt som mulig, og mener det blir omtrent som handelsreiseproblemet (the travelingsalesperson problem, TSP). Hun er usikker på om det er fullt så vanskelig, riktignok, av to grunner:"
          },
          {
            "type": "list",
            "ordered": true,
            "items": [
              "Det er snakk om et spesialtilfelle, der noder u, v er punkter i planet, og"
            ]
          },
          {
            "type": "text",
            "text": "kostnaden c(u, v) er avstanden i rett linje mellom dem."
          },
          {
            "type": "list",
            "ordered": true,
            "items": [
              "I TSP er det forbudt å besøke en node flere ganger, men her kan hun jo"
            ]
          },
          {
            "type": "text",
            "text": "gjøre som hun vil. Hun spør sin venn Klokland, som også er litt usikker. Hun kan fortelle at det første punktet nok ikke hjelper; det betyr bare at det er snakk om såkalt euklidsk TSP, som fortsatt er NP-hardt. Men det andre punktet er hun ikke sikker på. Hjelp Gløgsund, ved å enten finne en effektiv algoritme for problemet, eller ved å bruke en reduksjon til å vise at det er NP-hardt. Forklar svaret ditt."
          }
        ],
        "solution": [
          {
            "type": "text",
            "text": "Det er fortsatt NP-hardt, selv med disse spesialiseringene. Poenget er at man generelt vil ende opp med samme løsning, fordi det aldri vil lønne seg å gå innom en node flere ganger, selv om det er tillatt. Reduksjonen fra TSP er dermed triviell, det vil si, man trenger ikke gjøre noe. Merk at grunnen til at det ikke lønner seg er nettopp at vi her er underlagt trekantulikheten. Det vil si, å gå direkte fra u til v vil aldri være lengre enn å gå innom en annen node på veien. For generelle kostnader/avstander er dette ikke nødvendigvis sant, og forbudet mot å besøke noder flere ganger har dermed en betydning da."
          }
        ]
      },
      {
        "id": "2025-aug-08",
        "number": 8,
        "problemPage": 2,
        "solutionPage": 4,
        "prompt": [
          {
            "type": "text",
            "text": "(Forts. fra oppg. 7) Klokland oppdager at Gløgsund ikke har lest instruksjonene ordentlig: Spillet støtter teleportasjon (fast-travel), så hun helt uten kostnad kan forflytte seg til landsbyer hun allerede har vært innom. Det gjør jo at hun kan bruke mindre tid på å gjøre seg ferdig, men begge er fortsatt usikre på hvor vanskelig det er å finne den optimale reiseruten. Hjelp Gløgsund, ved å enten finne en effektiv algoritme for problemet, eller ved å bruke en reduksjon til å vise at det er NP-hardt. Forklar svaret ditt."
          }
        ],
        "solution": [
          {
            "type": "text",
            "text": "Problemet her er tilsvarer å koble sammen nodene billigst mulig, og blir dermed det samme som å finne et minst mulig spenntre, som kan gjøres i polynomisk tid med f.eks. MST-Prim eller MST-Kruskal, med kjøretid O(E lg V). F.eks. kan hun alltid teleportere til den landsbyen A som ligger nærmest en ubesøkt landsby B, og så gå til B, som tilsvarer en «manuell utførelse» av MST-Prim, men hun kan også bare finne spenntreet først, og så besøke landsbyene i en mer vilkårlig rekkefølge."
          }
        ]
      },
      {
        "id": "2025-aug-09",
        "number": 9,
        "problemPage": 2,
        "solutionPage": 4,
        "prompt": [
          {
            "type": "text",
            "text": "Dine venner Lurvik og Smartnes har kommet over følgende algoritme, med beskrivelsen «How to sort a list in linear time»:"
          },
          {
            "type": "code",
            "title": "Linear-Sort(A, n)",
            "startLine": 1,
            "code": "t0 = time()\nMerge-Sort(A, 1, n)\nSleep(1 000 000 n − (time() − t0 ))"
          },
          {
            "type": "text",
            "text": "De er begge enige om at det er litt «juks» å gjøre ting på den måten algoritmen gjør, men de har en litt filosofisk diskusjon om hva det er rimelig å si om kjøretiden. Lurvik mener man fint kan si at algoritmen har lineær kjøretid, mens Smartnes mener det er helt urimelig. Hva mener du? Finn argumenter både for og imot. Diskuter og forklar. Her er time en funksjon som gir nåværende tidspunkt, mens Sleep er en prosedyre som venter et visst tidsintervall. Akkurat hva tidsenheten er er litt uklart."
          }
        ],
        "solution": [
          {
            "type": "text",
            "text": "Et generelt argument imot er at det vil bryte med sorteringsgrensen, som gir oss en kjøretid på Ω(n lg n) i verste tilfelle. Man kan også se at om man velger en stor nok n0 i definisjonen av den asymptotiske notasjonen, så vil Sleep ikke gi oss noen pause, og kjøretiden følger dermed direkte fra Merge-Sort, og er Θ(n lg n). (Ev. kan man argumentere for at man da får problemer med et negativt argument til Sleep.) På den annen side, må n trolig bli helt urimelig stor før kjøretiden ikke lenger skal være 1 000 000 n, som jo er en lineær funksjon. Akkurat hvor stor n må bli, kommer an på konstantleddene som er involvert, inkl. tidsenheten som brukes, men siden det innebærer en sammenligning av lg n og 1 000 000, vil vi fort kunne ende med å kreve en større n enn det som er"
          },
          {
            "type": "text",
            "text": "fysisk mulig (f.eks. flere elementer enn partikler i det observerbare universet). Algoritmen er hentet fra https://xkcd.com/3026, og har billedteksten …"
          }
        ]
      },
      {
        "id": "2025-aug-10",
        "number": 10,
        "problemPage": 3,
        "solutionPage": 5,
        "prompt": [
          {
            "type": "text",
            "text": "Du har oppgitt en rettet graf G = (V, E) og to noder s, t ∈ V, og skal avgjøre om det finnes en sti fra s til t i G. Problemet er at du har svært begrenset minne, som bare har plass til O(lg V) variable! Én måte å bryte ned problemet må, kjent fra bl.a. korteste vei fra alle til alle, er å definere et sett med delproblemer ved hjelp av start- og sluttnode og det maksimale antallet kanter vi får bruke, k. Beskriv en rekursiv dekomponering, og forklar hvordan denne kan brukes til å løse problemet, hvis du altså kun får bruke logaritmisk minne, men så lang tid du vil. Forklar svaret ditt. Hint: Prøv å lage en rekursiv algoritme, der hvert rekursive kall har et konstant antall lokale variable, og der rekursjonsdybden er O(lg V). Merk at variablene det er snakk om her, er typen som kan behandles i konstant tid i følge RAM-modellen (f.eks. boolske verdier eller heltall)."
          }
        ],
        "solution": [
          {
            "type": "text",
            "text": "Dekomponeringen tilsvarer den som brukes f.eks. i Faster-APSP: Den korteste veien fra u til v med maks k kanter må gå innom en «midterste» node w, der man har maks ⌊k/2⌋ kanter på den korteste stien fra u til w, og maks ⌈k/2⌉ fra w til v. Disse to stiene kan man så finne rekursivt. Siden antall kanter halveres for hvert rekursjonsnivå, og den korteste stien fra s til t maksimalt kan ha |V| − 1 kanter i utgangspunktet, får vi en rekursjonsdybde på O(lg V). I hvert kall lagrer vi bare start- og sluttnode, samt parameteren k. For spesielt interesserte: At dette problemet kan løses med logaritmisk minne er et teorem etter Savitch, fra 1970. I sin vanlige form, uttrykkes det gjerne i antall bits som kreves, som er O(lg^2 n)."
          }
        ]
      },
      {
        "id": "2025-aug-11",
        "number": 11,
        "problemPage": 3,
        "solutionPage": 5,
        "prompt": [
          {
            "type": "text",
            "text": "Du regner på næringsinnholdet i mat, og har representert informasjonen du har som en vektet, rettet, asyklisk graf G = (V, E), der (u, v) ∈ E betyr at måltidet eller matvaren u inneholder ingrediensen eller næringsstoffet v, og w(u, v) angir mengden. Du får oppgitt en mengde av en bestemt matvare, og skal skrive ut en oversikt over næringsinnholdet. Hvordan vil du gå frem? Forklar. Hver node har sin egen enhet, så u kan f.eks. være «ml olivenolje», mens v er «g mettet fett», og w(u, v) = 0,133, som betyr at 15 ml olivenolje inneholder 15 × 0,133 = 2 g mettet fett. Du er ute etter det totale innholdet av grunnleggende næringsstoffer, representert av noder uten ut-kanter. Merk at det kan være snakk om flere nivåer, der A inneholder B, som inneholder C, . . . etc."
          }
        ],
        "solution": [
          {
            "type": "text",
            "text": "Kjernen i løsningen er rett og slett en rekursiv traversering à la DFS, men der man følger alle stier (og altså besøker noder flere ganger), og akkumulerer mengden man finner av ulike grunnleggende næringsstoffer. For mange reelle datasett vil det være tilstrekkelig, men kjøretiden vi vokse eksponentielt med lengden på stiene, så man bør innføre en eller annen form for memoisering. Det vil si, når man har funnet næringsinnholdet for node, lagrer man det, så man slipper å traversere videre fra den noden senere. (En mulighet er å bruke en form for stikomprimering, path compression, som i tre-representasjonen av disjunkte mengder. Det vil si, at man bytter ut ut-kantene med direktekanter til grunnleggende næringsstoffer, med en vekt som tilsvarer innholdet.) Med memoisering går kjøretiden fra å være eksponentiell til å være lineær. Her kan man også nevne topolog …"
          }
        ]
      },
      {
        "id": "2025-aug-12",
        "number": 12,
        "problemPage": 3,
        "solutionPage": 6,
        "prompt": [
          {
            "type": "text",
            "text": "Innen fagfeltet rettferdig fordeling (fair allocation) finnes det et bestemt problem, der man vil fordele nodene i en graf på et sett med mottakere, så rettferdig som mulig, slik at nodene hver mottaker får utgjør en sammenhengende graf. Det kan f.eks. være snakk om å fordele kontor på ulike grupper, der kantene i grafen angir hvilke kontor som er nabokontor, og hver gruppe vil ha et sett med kontor som ligger samlet. Du skal løse et spesialtilfelle av dette, der alle kontorene ligger på samme side i en korridor, så grafen utgjør en sti. For enkelhets skyld, antar vi at alle gruppene er enige om hvor fine kontorene er, så hvert kontor får en verdi i form av et positivt tall. Vi ønsker å finne en maksimin-fordeling, som er rettferdig i den forstand at den gruppen som får den laveste totalverdien likevel får en så høy totalverdi som mulig. Hvordan vil du løse dette problemet? Forklar."
          },
          {
            "type": "text",
            "text": "Merk at vi her kun ser på totalverdien hver gruppe får, og ikke har noe krav til antallet kontor. Vi kan f.eks. anta at verdien henger sammen med størrelsen, dvs. antall personer det er plass til, så færre og bedre kontor er like ønskelig som flere og dårligere."
          }
        ],
        "solution": [
          {
            "type": "text",
            "text": "Dette kan løses med samme overordnede fremgangsmåte som stavkappingsproblemet (rod-cutting), bare med en annen type kostnader. Dvs., for hver i = 1, . . . n (der n er antall kontorer) prøver vi oss på å gi de første i kontorene til én gruppe. Vi finner så maksimin for resten (rekursivt, med memoisering) og så blir optimum for i lik minimum av disse to verdiene."
          },
          {
            "type": "text",
            "text": "Vi velger så den i-en som gir oss størst verdi. Det kan også være naturlig å gjøre om prosedyren til en iterativ versjon som løser problemet fra bunnen, …"
          }
        ]
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
        "problemPage": 1,
        "solutionPage": 1,
        "prompt": [
          {
            "type": "text",
            "text": "Hva er kjøretiden til prosedyren for å bygge en maks-haug, Build-Max-Heap?"
          }
        ],
        "solution": [
          {
            "type": "text",
            "text": "Θ ( n ). Her gis også full uttelling for O(n)."
          }
        ]
      },
      {
        "id": "2025-des-02",
        "number": 2,
        "problemPage": 1,
        "solutionPage": 1,
        "prompt": [
          {
            "type": "text",
            "text": "Din venn Lurvik har klart å vise at to av følgende beskrivelser av kjøretiden til en algoritme er korrekte, men han husker ikke hvilke to:"
          },
          {
            "type": "list",
            "ordered": true,
            "items": [
              "T(n) = O(n^3 )",
              "T(n) = Ω(n^3 )",
              "T(n) = Θ(n^3 )"
            ]
          },
          {
            "type": "text",
            "text": "Sjefen hans har bedt ham velge ut én av beskrivelsene, og nå har Lurvik bedt deg om hjelp. Hvilken av de tre velger du (nummer 1, 2 eller 3)? Forklar kort hvorfor dette er et godt valg."
          }
        ],
        "solution": [
          {
            "type": "text",
            "text": "Nummer 3, fordi Θ-notasjon er mest informativt. Om Lurvik har vist to av disse, må han enten ha vist at nummer 3 stemmer, eller at både 1 og 2 stemmer, som impliserer nummer 3."
          }
        ]
      },
      {
        "id": "2025-des-03",
        "number": 3,
        "problemPage": 1,
        "solutionPage": 1,
        "prompt": [
          {
            "type": "text",
            "text": "Hva er det som gjør at Counting-Sort har lavere asymptotisk kjøretid enn f.eks. Merge-Sort? Forklar kort."
          }
        ],
        "solution": [
          {
            "type": "text",
            "text": "At vi kun sorterer heltall i området 0 til k, for en konstant k. Som vanlig, aksepteres alle forklaringer som får frem hovedpoenget."
          }
        ]
      },
      {
        "id": "2025-des-04",
        "number": 4,
        "problemPage": 1,
        "solutionPage": 2,
        "prompt": [
          {
            "type": "text",
            "text": "Lurvik og Smartnes har en heftig diskusjon. Smartnes mener man kan ha en algoritme med ulik asymptotisk kjøretid i beste og verste tilfelle, der den gjennomsnittlige kjøretiden likevel er lik én av de to. Lurvik mener dette er umulig, siden gjennomsnittet y av x og z alltid vil ligge imellom dem, altså x < y < z. Bruk et eksempel fra pensum for å vise at Smartnes har rett. Forklar kort hvorfor det er mulig. Smartnes mener altså at average-case kan være lik enten best-case eller worst-case, selv om best-case og worst-case er forskjellige."
          }
        ],
        "solution": [
          {
            "type": "text",
            "text": "Insertion-Sort har kjøretid Θ(n) i beste tilfelle og Θ(n^2 ) i verste tilfelle. Gjennomsnittlig kjøretid er Θ(n^2 ). Grunnen til at dette er mulig er at den asymptotiske notasjonen skjuler forskjeller i konstantfaktorene. Som vanlig, godtas alle eksempler og forklaringer som får frem hovedpoenget. F.eks. kan man bruke Quicksort, Randomized-Quicksort, Randomized-Select eller søk i tilfeldige søketrær."
          }
        ]
      },
      {
        "id": "2025-des-05",
        "number": 5,
        "problemPage": 1,
        "solutionPage": 2,
        "prompt": [
          {
            "type": "text",
            "text": "Dette er den rekursive formuleringen av lengden til den lengste felles delsekvensen (longest common subsequence, LCS) for prefiksene X_i og Y_j av X og Y."
          },
          {
            "type": "visual",
            "kind": "lcs-formula-2025"
          },
          {
            "type": "text",
            "text": "max{c[i, j − 1], c[i − 1, j]}   if i, j > 0 and x_i ̸= y_j . "
          },
          {
            "type": "text",
            "text": "Hva er det som mangler? Forklar kort."
          }
        ],
        "solution": [
          {
            "type": "text",
            "text": " 0  c[i, j] = c[i − 1, j − 1] + 1              if i, j > 0 and x_i = y_j ,  "
          },
          {
            "type": "text",
            "text": "Hvis de to siste bokstavene er like, vil vi aldri tape på å ta dem med i løsningen, som øker lengden med 1. I tillegg kommer svaret for X_i−1 og Y_j−1 ."
          }
        ]
      },
      {
        "id": "2025-des-06",
        "number": 6,
        "problemPage": 2,
        "solutionPage": 2,
        "prompt": [
          {
            "type": "text",
            "text": "Felles for følgende algoritmer er at hver node v har et bestemt felt av typen v.x (men med et annet navn), som representerer en del av løsningen:"
          },
          {
            "type": "list",
            "ordered": false,
            "items": [
              "DFS-Visit     (altså dybde-først-søk fra én node)",
              "BFS",
              "Dag-Shortest-Paths",
              "Dijkstra",
              "Bellman-Ford",
              "Prim"
            ]
          },
          {
            "type": "text",
            "text": "Hvilket felt er det snakk om (dvs., hva skal stå i stedet for «x» i «v.x»)? Hva representerer det? Forklar kort. Det er altså snakk om det samme feltet i alle algoritmene."
          }
        ],
        "solution": [
          {
            "type": "text",
            "text": "Det er snakk forgjenger-feltet, π, som angir foreldrenoden i treet som konstrueres (traverserings-tre, korteste-vei-tre eller minimalt spenntre)."
          }
        ]
      },
      {
        "id": "2025-des-07",
        "number": 7,
        "problemPage": 2,
        "solutionPage": 3,
        "prompt": [
          {
            "type": "text",
            "text": "I skog-implementasjonen av disjunkte mengder (disjoint-set forests), som brukt bl.a. i Kruskal, hva skjer med foreldrepekerne når man bruker Find-Set?"
          }
        ],
        "solution": [
          {
            "type": "text",
            "text": "Alle foreldrepekerne til nodene langs stien opp til rota flyttes til å peke direkte på rota (såkalt stikomprimering, eller path compression)."
          }
        ]
      },
      {
        "id": "2025-des-08",
        "number": 8,
        "problemPage": 2,
        "solutionPage": 3,
        "prompt": [
          {
            "type": "text",
            "text": "Dette er definisjonen av restkapasiteten (residual capacity) c_f (u, v) i et flytnett (flow network) med flyt f :"
          },
          {
            "type": "visual",
            "kind": "residual-formula-2025"
          },
          {
            "type": "text",
            "text": "Hva er det som mangler? Forklar kort."
          }
        ],
        "solution": [
          {
            "type": "text",
            "text": ""
          },
          {
            "type": "visual",
            "kind": "residual-formula-2025"
          },
          {
            "type": "text",
            "text": "f(v, u) ved å sende den tilbake fra u til v."
          }
        ]
      },
      {
        "id": "2025-des-09",
        "number": 9,
        "problemPage": 2,
        "solutionPage": 3,
        "prompt": [
          {
            "type": "text",
            "text": "Du studerer et problem P, og vil sammenligne det med et annet, kjent problem Q ved å finne en effektiv reduksjon. Hvilken vei vil du redusere for å vise hva? Forklar kort."
          }
        ],
        "solution": [
          {
            "type": "text",
            "text": "Om Q er vanskelig, vil vi prøve å redusere fra Q til P, for å vise at P også er vanskelig. Om Q er lett, vil vi redusere fra P til Q, for å vise at P også er lett. Her kan man godt bruke polynomisk kjøretid eller P vs. NPC for å beskrive vanskegrad, men det er ikke nødvendig."
          }
        ]
      },
      {
        "id": "2025-des-10",
        "number": 10,
        "problemPage": 2,
        "solutionPage": 3,
        "prompt": [
          {
            "type": "text",
            "text": "Hvordan kan antall sterke komponenter (strongly connected components) i en rettet graf endres hvis man legger til en ny kant? Forklar kort."
          }
        ],
        "solution": [
          {
            "type": "text",
            "text": "Om man har n noder, kan man gå fra n sterke komponenter til 1. Det skjer f.eks. om grafen er en rettet sti, og man legger til kanten som skal til for å gjøre den til en rettet sykel. Man kan naturligvis også få mindre endringer enn dette. Dette er oppgave 20.5-1 fra læreboka."
          }
        ]
      },
      {
        "id": "2025-des-11",
        "number": 11,
        "problemPage": 2,
        "solutionPage": 4,
        "prompt": [
          {
            "type": "text",
            "text": "Hvorfor gir ikke Dijkstra nødvendigvis riktig svar dersom grafen vi bruker den på inneholder kanter med negativ vekt? Forklar kort. Her må forklaringen være mer presis enn f.eks. at «valgene algoritmen gjør blir gale». Hvorfor blir de gale? Bruk gjerne et eksempel, om du har behov for det."
          }
        ],
        "solution": [
          {
            "type": "text",
            "text": "Vi risikerer da at noden med lavest avstandsestimat fortsatt kan få enda lavere avstandsestimat, etter at vi har besøkt andre noder. Som vanlig, godtas alle forklaringer som får frem hovedpoenget."
          }
        ]
      },
      {
        "id": "2025-des-12",
        "number": 12,
        "problemPage": 2,
        "solutionPage": 4,
        "prompt": [
          {
            "type": "text",
            "text": "Hvor mye øker m om du utfører følgende prosedyre?"
          },
          {
            "type": "code",
            "title": "Pseudokode",
            "startLine": 1,
            "code": "for i = 1 to n\n  m=m+1\n  for j = 1 to n\n    m=m+1\n    for k = 1 to n\n      m=m+1"
          },
          {
            "type": "text",
            "text": "Oppgi svaret i Θ-notasjon, som funksjon av n. Forklar kort."
          }
        ],
        "solution": [
          {
            "type": "text",
            "text": "Θ(n^3 ). Linje 2, 4 og 6 øker m med henholdsvis n, n^2 og n^3 ."
          }
        ]
      },
      {
        "id": "2025-des-13",
        "number": 13,
        "problemPage": 3,
        "solutionPage": 4,
        "prompt": [
          {
            "type": "text",
            "text": "Hvor mye øker m om du utfører følgende prosedyre?"
          },
          {
            "type": "code",
            "title": "Pseudokode",
            "startLine": 1,
            "code": "k=1\nfor i = 1 to n\n  m=m+k\n  k=k+k"
          },
          {
            "type": "text",
            "text": "Oppgi svaret i Θ-notasjon, som funksjon av n. Forklar kort."
          }
        ],
        "solution": [
          {
            "type": "text",
            "text": "Θ(2n ). Linje 4 dobler k for hver iterasjon, så linje 3 øker m med 2i . Totalt økes m med ∑in=0 2n = 2n+1 − 1 = Θ(2n )."
          }
        ]
      },
      {
        "id": "2025-des-14",
        "number": 14,
        "problemPage": 3,
        "solutionPage": 4,
        "prompt": [
          {
            "type": "text",
            "text": "Løs følgende rekurrens eksakt: T(n) = T(n − 1) + 2n − 1 T(0) = 0 Oppgi svaret uten asymptotisk notasjon. Forklar kort."
          }
        ],
        "solution": [
          {
            "type": "text",
            "text": "Her godtas også enklere utregninger eller forklaringer."
          }
        ]
      },
      {
        "id": "2025-des-15",
        "number": 15,
        "problemPage": 3,
        "solutionPage": 5,
        "prompt": [
          {
            "type": "text",
            "text": "Hva blir T(n), om du løser følgende rekursive ligningssett? T(n) = 2S(n/2) + (n lg n)^2 S(n) = 8T(n/2) + n^2 Oppgi svaret i Θ-notasjon. Forklar kort. Bruk vanlige antagelser for algoritmiske rekurrenser."
          }
        ],
        "solution": [
          {
            "type": "text",
            "text": "T(n) = 2 8T((n/2)/2) + (n/2)^2 + (n lg n)^2 \u0001"
          },
          {
            "type": "equation",
            "title": "Utregning",
            "lines": [
              "= 16T(n/4) + n^2 lg^2 n + n^2 /2"
            ]
          },
          {
            "type": "text",
            "text": "Løses f.eks. med masterteoremet, som gir:"
          },
          {
            "type": "equation",
            "title": "Utregning",
            "lines": [
              "T(n) = Θ(n^2 lg^3 n)"
            ]
          }
        ]
      },
      {
        "id": "2025-des-16",
        "number": 16,
        "problemPage": 3,
        "solutionPage": 5,
        "prompt": [
          {
            "type": "visual",
            "kind": "dag-2025-des"
          },
          {
            "type": "text",
            "text": "Utfør den første av de |V| − 1 iterasjonene til Bellman-Ford på grafen i figur 1, under følgende betingelser:"
          },
          {
            "type": "list",
            "ordered": true,
            "items": [
              "Bruk node 1 som startnode.",
              "Anta at 8 er brukt i stedet for ∞ under initialiseringen.",
              "Der du kan velge mellom kanter, velg den med lavest vekt."
            ]
          },
          {
            "type": "text",
            "text": "Hva blir v.d for hver node v = 1, . . . , 5 etterpå? Forklar kort. Oppgi verdien for hver node, i rekkefølge."
          }
        ],
        "solution": [
          {
            "type": "text",
            "text": "0, 3, 5, 8, 8 Vi oppdaterer (med Relax) langs kantene med vekt 1, . . . , 7, i rekkefølge. Av disse er det kun kantene (1, 2), (2, 3) og (1, 3), med vekt 3, 4 og 5, som har noen effekt."
          }
        ]
      },
      {
        "id": "2025-des-17",
        "number": 17,
        "problemPage": 4,
        "solutionPage": 6,
        "prompt": [
          {
            "type": "visual",
            "kind": "flow-2025-des"
          },
          {
            "type": "text",
            "text": "Figur 2 viser et flytnett (flow network) med flyt. Utfør én iterasjon av EdmondsKarp på flytnettet for å finne en forøkende sti (augmenting path). Oppgi nodene i den resulterende stien, i rekkefølge. Forklar kort."
          }
        ],
        "solution": [
          {
            "type": "text",
            "text": "s, 2, 5, t Det finnes flere forøkende stier, men Edmonds-Karp velger den korteste. Vi kan følge kanten (5, 2) baklengs, fordi det går flyt i den. Om man ikke tar høyde for det, sitter man igjen med de forøkende stiene ⟨s, 2, 6, 3, 7, t⟩ og ⟨s, 2, 6, 3, 7, 4, 8, t⟩. Om man oppgir den korteste av disse (den første), gir det 3 poeng. Om man oppgir den lengste, gir det 2 poeng. Det samme uttelling også om man utelater s og t fra svaret."
          }
        ]
      },
      {
        "id": "2025-des-18",
        "number": 18,
        "problemPage": 4,
        "solutionPage": 6,
        "prompt": [
          {
            "type": "text",
            "text": "Nøklene (keys) i et søketre er vanligvis fra en ordnet mengde (f.eks. tall eller tekststrenger). Din venn Gløgsund har laget et søketre der hver node i stedet inneholder et rektangel. Når hun skal bygge treet, tar hun inn et sett S med ikkeoverlappende rektangler, som legges i løvnodene. For hver indre node konstruerer hun et nytt rektangel: det minste som inneholder alle barnas rektangler. Når hun skal søke i treet, tar hun inn et punkt, og sjekker rekursivt nedover i treet hvilke rektangler som inneholder punktet, og returnerer det av disse som ligger i en løvnode. Gjør følgende antagelser:"
          },
          {
            "type": "list",
            "ordered": false,
            "items": [
              "Rektanglene fordeles tilfeldig på løvnodene.",
              "Treet er perfekt balansert."
            ]
          },
          {
            "type": "text",
            "text": "Hva blir kjøretiden for et søk, som funksjon av n = |S|? Gi både en øvre og nedre grense, dvs., bruk enten Θ-notasjon eller både O- og Ω-notasjon."
          }
        ],
        "solution": [
          {
            "type": "text",
            "text": "O(n), Ω(1). I beste tilfelle vil vi allerede i rotnoden oppdage at punktet vårt ikke finnes i treet. I verste tilfelle, kan rektanglene fordeles slik at vi får et lineært antall overlappende rektangler, som alle må besøkes. Her er det ikke eksplisitt spesifisert hvor mange barn hver interne node har, men det antas i utgangspunktet å være en konstant. Dersom man har antatt noe annet, vil man kunne få uttelling likevel. Ideen her var opprinnelig at man skulle søke etter et av punktene som var dekket, men det er ikke spesifisert i oppgaven. Dersom man antar det, vil man i beste tilfelle følge én sti fra rot til løvnode, og siden treet er balansert, vil denne ha lengde Θ(lg n). Under denne antagelsen vil man kunne gi en nedre grens …"
          }
        ]
      },
      {
        "id": "2025-des-19",
        "number": 19,
        "problemPage": 4,
        "solutionPage": 7,
        "prompt": [
          {
            "type": "text",
            "text": "Du utvikler et kodebibliotek for tekstprosessering, og skal implementere funksjonen split(s, x), som deler strengen s ved alle forekomster av tegnet x. For eksempel vil split(\"abc;de;fghi;jk\", \";\") returnere [\"abc\", \"de\", \"fghi\", \"jk\"] ."
          },
          {
            "type": "text",
            "text": "Du kan finne indeksene til x i s med en løkke. For en gitt slik indeks, kan du dele strengen i to mindre strenger, som er kopier av hver sin «halvdel». Om strengen du deler inneholder n tegn, må du kopiere n − 1 tegn. Konstruer og beskriv en algoritme som finner det minste totale antallet slike kopieringer som trengs. Hva blir kjøretiden? Forklar."
          }
        ],
        "solution": [
          {
            "type": "text",
            "text": "For hvert splittpunkt, løs problemet høyre og venstre side for seg. Memoiser løsningen, f.eks. ved å ha en tabell A[1 : m, 1 : m] som indekseres med start- og slutt-indeksene til segmentet man ser på. Denne tabellen kan også bygget opp fra bunnen (bottom-up). Det gis ingen uttelling i seg selv for å nevne dynamisk programmering. Oppgaven baserer seg på oppgave 14-9 i læreboka."
          }
        ]
      },
      {
        "id": "2025-des-20",
        "number": 20,
        "problemPage": 5,
        "solutionPage": 7,
        "prompt": [
          {
            "type": "text",
            "text": "For to grafer G og H er en grafhomomorfi f : G → H en funksjon f fra G.V til H.V, som bevarer naboskap. For alle u, v ∈ G.V:"
          },
          {
            "type": "text",
            "text": "(u, v) ∈ G.E =⇒ ( f(u), f(v)) ∈ H.E"
          },
          {
            "type": "text",
            "text": "Det vil si, hvis (u, v) er en kant i G, så er ( f(u), f(v)) en kant i H. Å avgjøre om det eksisterer en homomorfi, gitt G og H, er NP-komplett generelt, men kan i visse tilfeller gjøres i polynomisk tid. Anta at vi bestemmer at H alltid skal være følgende graf, kjent som K3,3 :"
          },
          {
            "type": "visual",
            "kind": "k33-2025-des"
          },
          {
            "type": "text",
            "text": "Input er nå bare G, og vi skal avgjøre om det finnes en homomorfi f : G → K3,3 . Enten vis at denne begrensede versjonen av problemet fortsatt er NP-komplett, eller vis hvordan problemet kan løses (dvs., avgjøres) i polynomisk tid. Kan du trekke noen generelle konklusjoner fra svaret ditt? Forklar."
          }
        ],
        "solution": [
          {
            "type": "text",
            "text": "2"
          },
          {
            "type": "visual",
            "kind": "k33-2025-des"
          },
          {
            "type": "text",
            "text": "Om vi har funnet en f : G → K3,3 , vil den fortsatt være gyldig om vi slår sammen verdier på høyre eller venstre side, så vi kan begrense oss til å bruke node 1 og 2. Det er det samme som å si at det finnes en homomorfi videre til grafen K2 , som består av bare disse to nodene, med en kant imellom seg, og at f finnes hvis og bare hvis det finnes en homomorfi G → K2 . Prøv å konstruere h ved å traversere G, og å la f(v) = 1 eller f(v) = 2 for hver node v ∈ G.V, avhengig av hvilke verdier naboene alt har fått. Om vi mislykkes, må grafen ha en odde sykel, og det vil ikke finnes noen homomorfi. Denne metoden fungerer fordi K3,3 er bipartitt. Generelt, hvis H er bipartitt, kan vi i lineær tid avgjøre om f : G → H eksisterer, ved å avgjøre om G er bipartitt (tofargbar)."
          }
        ]
      }
    ]
  }
];

window.AlgViz = window.AlgViz || {};
window.AlgViz.EXAMS = exams;
})();
