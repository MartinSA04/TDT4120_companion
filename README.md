# NTNU AlgDat Study Companion · Field Notes

A static study companion for NTNU `Algoritmer og datastrukturer`, built around
the course curriculum and the existing algorithm visualizer. It combines:

- a bilingual lecture dashboard for the 14-course lecture sequence
- learning goals, pitfalls, CLRS references, glossary cards, and self-tests
- local progress tracking in `localStorage`
- five live algorithm visualizations: bubble sort, insertion sort, selection
  sort, quicksort, and binary search

The displayed source is Python. All trace generation and study content runs
client-side in JavaScript. There is no backend, API key, or build step.

## Running locally

There's no build step. Open `index.html` directly:

```sh
# Either just open it
xdg-open index.html

# …or serve from any static server (avoids `file://` font-loading quirks)
python -m http.server 8080
# → visit http://localhost:8080
```

React, ReactDOM, and Babel-standalone load from a CDN. Babel transpiles the
JSX in `js/*.js` in the browser.

## Hosting

Anything that serves static files works. The repo is laid out so that the
root directory is the deployable site:

- **GitHub Pages**: enable Pages on `main` (root) — done.
- **Netlify / Vercel / Cloudflare Pages**: point the deploy at the repo
  root, no build command, no output directory.
- **Plain S3 / nginx / Caddy**: copy `index.html`, `styles/`, and `js/`.

No backend, no server-rendered code, no environment variables.

## Project layout

```
index.html           # entry point; loads React+Babel from CDN
styles/
  tokens.css         # design tokens (paper + night themes)
  app.css            # page-level layout + utility classes
js/
  courseData.js     # static bilingual curriculum, glossary, quizzes, tool map
  algorithms.js      # 5 algorithms — Python source string + JS generator
  views.js           # Bars + SearchView (the actual visualizations)
  components.js      # Masthead, CatalogueBar, CodeView, StepRibbon, …
  app.js             # routed study companion shell + embedded visualizer
```

## Adding a new algorithm

Append an entry to the `ALL` array in `js/algorithms.js` with shape:

```js
{
  name: "My Sort",
  description: "…",
  viewKind: "bars",          // "bars" | "bubble" | "insertion" |
                              // "selection" | "quick" | "search"
  filename: "algorithms/my_sort.py",
  complexities: { best, avg, worst, space },
  code: `def my_sort(...): ...`,    // Python source displayed in the panel
  defaultData() { return [...]; },
  run(input) {
    const a = [...input];
    const frames = [];
    // push frames as you go
    return frames;
  },
}
```

A frame looks like:

```js
{
  line: 5,                    // 1-indexed line in `code` to highlight
  desc: "Compare a[3] with a[4].",
  data: [...],                // current snapshot
  variables: { i: 3, j: 4 },  // shown in the right rail
  highlights: { compare: [3, 4] },
  pointers: { i: 3, j: 4 },   // chips above bars
  windows: { frame: [0, 9] }, // optional outlined regions
  floating: { 3: 17 },        // optional floating boxes (insertion key)
}
```

Pick `viewKind: "bars"` if you don't need any of the specialized
decorations and the generic chip-driven Bars chart is enough.
