/* global window */
// =====================================================================
// Analysis visualizations.
//   asymptoticNotation   viewKind "asymptotic-graph"
// =====================================================================
// See js/algorithms/_shared.js for the Frame contract.
(function () {
const A = window.AlgViz.A;
const { range } = A;
const t = (no, en) => ({ no, en });

function log2(n) {
  return Math.log2(Math.max(1, n));
}

function round(value, places = 2) {
  const scale = 10 ** places;
  return Math.round(value * scale) / scale;
}

function sampleCurve(id, label, role, fn, xMax, samples = 72) {
  const points = [];
  for (let i = 0; i <= samples; i++) {
    const x = 1 + ((xMax - 1) * i) / samples;
    points.push([round(x), round(Math.max(0, fn(x)))]);
  }
  return { id, label, role, points };
}

function frame(line, desc, visual, variables = {}, role = "pivot") {
  const xMax = Math.round(visual.xMax || 16);
  return {
    line,
    desc,
    data: range(xMax).map((i) => i + 1),
    viewKind: "asymptotic-graph",
    variables,
    highlights: role ? { [role]: [0] } : {},
    pointers: {},
    visual: {
      type: "asymptotic-graph",
      xLabel: "n",
      yLabel: "work",
      ...visual,
    },
  };
}

const asymptoticNotation = {
  id: "asymptotic-notation",
  name: "Asymptotic Notation",
  customPage: "asymptotic-notation",
  description:
    "Compare growth functions on graphs: upper bounds, lower bounds, tight bounds, and strict little-o / little-omega behavior.",
  explanation: {
    no: "Denne visualiseringen tegner funksjoner mot inputstørrelse n. Den viser at O, Omega, Theta, o og omega handler om hva som skjer etter en terskel n0, ikke om små input.",
    en: "This visualization plots functions against input size n. It shows that O, Omega, Theta, o, and omega describe what happens after a threshold n0, not small inputs.",
  },
  courseRefs: ["l01", "l04"],
  conceptIds: ["asymptotic-notation"],
  learningGoalIds: ["A4", "A5", "A6", "D1", "Z6"],
  viewKind: "asymptotic-graph",
  filename: "analysis/asymptotic_notation.py",
  sizeRange: { min: 16, max: 80, default: 48 },
  defaultData(size = 48) {
    return range(size).map((i) => i + 1);
  },
  run(input) {
    const xMax = Math.max(16, Math.min(80, input?.length || 48));
    const bigOMax = 5 * xMax * 1.08;
    const omegaMax = (xMax * xMax + 4 * xMax) * 1.06;
    const thetaMax = 3 * xMax * log2(xMax) * 1.08;

    return [
      frame(1, t(
        "Ulike formler får ulike graf-former når n vokser.",
        "Different formulas become different graph shapes as n grows."
      ), {
        title: t("Vekstformer", "Growth shapes"),
        subtitle: t(
          "Logaritmisk y-akse gjør at vi kan se små og store vekstformer i samme graf uten å snu rekkefølgen.",
          "A logarithmic y-axis lets us see small and large growth shapes in the same graph without reversing their order."
        ),
        explanation: t(
          "Asymptotisk analyse ser forbi konstantledd og små input. Her ligger n log n over n etter de første små verdiene, og n^2 drar enda raskere fra.",
          "Asymptotic analysis looks past constant terms and small inputs. Here n log n sits above n after the first small values, and n^2 pulls away even faster."
        ),
        xMax,
        yMin: 1,
        yMax: xMax * xMax,
        yScale: "log",
        yTicks: [1, 10, 100, 1000, xMax * xMax].filter((v, i, arr) => v <= xMax * xMax && arr.indexOf(v) === i),
        yLabel: "work (log scale)",
        curves: [
          sampleCurve("constant", "1", "muted", () => 1, xMax),
          sampleCurve("log", "log n", "reference", (n) => Math.max(1, log2(n)), xMax),
          sampleCurve("linear", "n", "target", (n) => n, xMax),
          sampleCurve("linearithmic", "n log n", "lower", (n) => n * Math.max(1, log2(n)), xMax),
          sampleCurve("quadratic", "n^2", "upper", (n) => n * n, xMax),
        ],
      }, { n: xMax, note: "shape comparison" }, "compare"),

      frame(3, t(
        "Big-O er en øvre grense fra og med en terskel n0.",
        "Big-O is an eventual upper bound: after n0, g(n) stays below c f(n)."
      ), {
        title: t("O(f): øvre grense", "O(f): eventual upper bound"),
        subtitle: t(
          "g(n) = 3n + 8 er O(n), fordi g(n) <= 5n for alle n >= 4.",
          "g(n) = 3n + 8 is O(n), because g(n) <= 5n for every n >= 4."
        ),
        explanation: t(
          "O sier at g ikke vokser raskere enn f, opp til en konstant faktor. Det spiller ingen rolle om kurvene krysser før n0; definisjonen bryr seg om halen av grafen.",
          "O says that g does not grow faster than f, up to a constant factor. It does not matter if the curves cross before n0; the definition cares about the tail of the graph."
        ),
        xMax,
        yMax: bigOMax,
        n0: 4,
        shadedAfter: true,
        curves: [
          sampleCurve("g", "g(n) = 3n + 8", "target", (n) => 3 * n + 8, xMax),
          sampleCurve("cf", "c f(n) = 5n", "upper", (n) => 5 * n, xMax),
          sampleCurve("f", "f(n) = n", "reference", (n) => n, xMax),
        ],
      }, { "g(n)": "3n + 8", "f(n)": "n", c: 5, n0: 4 }, "pivot"),

      frame(6, t(
        "Big-Omega er en nedre grense fra og med en terskel n0.",
        "Big-Omega is an eventual lower bound: after n0, g(n) stays above c f(n)."
      ), {
        title: t("Omega(f): nedre grense", "Omega(f): eventual lower bound"),
        subtitle: t(
          "g(n) = n^2 + 4n er Omega(n^2), fordi den holder seg over 0.5n^2.",
          "g(n) = n^2 + 4n is Omega(n^2), because it stays above 0.5n^2."
        ),
        explanation: t(
          "Omega brukes når f er en garantert vekst under g, igjen etter en terskel. Dette er en nedre grense på funksjonen du analyserer, ikke automatisk et best-case-utsagn.",
          "Omega is used when f is guaranteed growth below g, again after a threshold. This is a lower bound on the function being analyzed, not automatically a best-case statement."
        ),
        xMax,
        yMax: omegaMax,
        n0: 1,
        shadedAfter: true,
        curves: [
          sampleCurve("g", "g(n) = n^2 + 4n", "target", (n) => n * n + 4 * n, xMax),
          sampleCurve("cf", "c f(n) = 0.5n^2", "lower", (n) => 0.5 * n * n, xMax),
          sampleCurve("f", "f(n) = n^2", "reference", (n) => n * n, xMax),
        ],
      }, { "g(n)": "n^2 + 4n", "f(n)": "n^2", c: 0.5, n0: 1 }, "found"),

      frame(9, t(
        "Big-Theta er en tett grense: samme form både over og under.",
        "Big-Theta is the sandwich: g(n) has both an upper and a lower bound of the same shape."
      ), {
        title: t("Theta(f): tett grense", "Theta(f): tight bound"),
        subtitle: t(
          "2n log n + n klemmes mellom n log n og 3n log n når n >= 2.",
          "2n log n + n is squeezed between n log n and 3n log n once n >= 2."
        ),
        explanation: t(
          "Theta betyr at vi kjenner vekstformen presist asymptotisk. Funksjonen kan variere med konstante faktorer, men den slipper ikke ut av korridoren.",
          "Theta means we know the growth shape precisely asymptotically. The function may vary by constant factors, but it does not escape the corridor."
        ),
        xMax,
        yMax: thetaMax,
        n0: 2,
        shadedAfter: true,
        curves: [
          sampleCurve("upper", "3n log n", "upper", (n) => 3 * n * log2(n), xMax),
          sampleCurve("g", "g(n) = 2n log n + n", "target", (n) => 2 * n * log2(n) + n, xMax),
          sampleCurve("lower", "n log n", "lower", (n) => n * log2(n), xMax),
        ],
      }, { "g(n)": "2n log n + n", "f(n)": "n log n", c1: 1, c2: 3, n0: 2 }, "found"),

      frame(12, t(
        "little-o er strengere enn O: forholdet g(n) / f(n) går mot 0.",
        "little-o is stricter than Big-O: the ratio g(n) / f(n) must fall toward 0."
      ), {
        title: t("o(f): forholdet går mot 0", "o(f): ratio goes to 0"),
        subtitle: t(
          "n er o(n^2). Forholdet n / n^2 = 1/n blir til slutt mindre enn enhver konstant c.",
          "n is o(n^2). The ratio n / n^2 = 1/n eventually falls below any constant c."
        ),
        explanation: t(
          "For little-o holder det ikke med en praktisk konstant som i O. Uansett hvor liten positiv konstant du velger, blir g til slutt mindre enn c ganger f.",
          "For little-o, one convenient constant is not enough as in O. No matter how small a positive constant you choose, g eventually becomes smaller than c times f."
        ),
        xMax,
        yMax: 1.05,
        yLabel: "g(n) / f(n)",
        n0: 10,
        shadedAfter: true,
        thresholds: [{ y: 0.1, label: "c = 0.1", role: "upper" }],
        curves: [
          sampleCurve("ratio", "n / n^2 = 1/n", "target", (n) => 1 / n, xMax),
        ],
      }, { "g(n)": "n", "f(n)": "n^2", ratio: "1/n", c: 0.1, n0: 10 }, "pivot"),

      frame(15, t(
        "little-omega er dualen: forholdet g(n) / f(n) vokser forbi enhver fast konstant.",
        "little-omega is the dual: the ratio g(n) / f(n) grows past every fixed constant."
      ), {
        title: t("omega(f): forholdet vokser uten grense", "omega(f): ratio grows without bound"),
        subtitle: t(
          "n^2 er omega(n). Forholdet n^2 / n = n slår til slutt enhver konstant c.",
          "n^2 is omega(n). The ratio n^2 / n = n eventually beats any constant c."
        ),
        explanation: t(
          "omega sier at g vokser asymptotisk strengt raskere enn f. Grafen for forholdet trenger ikke bare ligge over en konstant; den fortsetter oppover uten øvre konstant grense.",
          "omega says that g grows asymptotically strictly faster than f. The ratio graph must not merely sit above one constant; it keeps rising without a fixed constant ceiling."
        ),
        xMax,
        yMax: xMax * 1.05,
        yLabel: "g(n) / f(n)",
        n0: 10,
        shadedAfter: true,
        thresholds: [{ y: 10, label: "c = 10", role: "lower" }],
        curves: [
          sampleCurve("ratio", "n^2 / n = n", "target", (n) => n, xMax),
        ],
      }, { "g(n)": "n^2", "f(n)": "n", ratio: "n", c: 10, n0: 10 }, "found"),
    ];
  },
};

A.register("asymptoticNotation", asymptoticNotation);
})();
