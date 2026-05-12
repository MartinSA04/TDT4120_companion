// Build the static site into ./dist
//
//  npm run build       — one-shot production build
//  npm run dev         — watch + local server at http://localhost:8080
//
// What it does:
//  1. Empties dist/.
//  2. Compiles every js/*.js as JSX → plain ES2020 in dist/js/ (minified for build).
//  3. Copies styles/ verbatim.
//  4. Copies index.html, but strips the in-browser Babel CDN script and the
//     `type="text/babel"` / `data-presets="react"` attributes, so the
//     compiled scripts run as plain <script src=...>.

import * as esbuild from "esbuild";
import {
  cpSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";

const DIST = "dist";
const JS_DIR = "js";
const STYLES_DIR = "styles";
const HTML_FILE = "index.html";

const serve = process.argv.includes("--serve");

// Every .js under js/ (recursively) is transformed independently — load order
// is governed by the <script> tags in index.html, not by this list.
function entryPoints() {
  const out = [];
  const walk = (dir) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.name.endsWith(".js")) out.push(p);
    }
  };
  walk(JS_DIR);
  return out;
}

const ESBUILD_COMMON = {
  outdir: join(DIST, JS_DIR),
  outbase: JS_DIR,            // preserve js/algorithms/… directory structure
  loader: { ".js": "jsx" },
  jsx: "transform",
  target: "es2020",
  logLevel: "warning",
};

function transformIndexHtml() {
  let html = readFileSync(HTML_FILE, "utf-8");
  // Drop the Babel-standalone CDN script (any whitespace around it).
  html = html.replace(
    /\n?\s*<script[^>]*@babel\/standalone[^>]*><\/script>/g,
    ""
  );
  // Drop the type="text/babel" + data-presets attributes from each script.
  html = html.replace(/\stype="text\/babel"/g, "");
  html = html.replace(/\sdata-presets="[^"]*"/g, "");
  writeFileSync(join(DIST, HTML_FILE), html);
}

async function buildOnce() {
  rmSync(DIST, { recursive: true, force: true });
  mkdirSync(DIST, { recursive: true });

  cpSync(STYLES_DIR, join(DIST, STYLES_DIR), { recursive: true });

  await esbuild.build({
    ...ESBUILD_COMMON,
    entryPoints: entryPoints(),
    minify: !serve,
    sourcemap: serve ? "inline" : false,
  });

  transformIndexHtml();
  console.log(`✓ built ${DIST}/`);
}

if (serve) {
  await buildOnce();

  const ctx = await esbuild.context({
    ...ESBUILD_COMMON,
    entryPoints: entryPoints(),
    sourcemap: "inline",
  });
  await ctx.watch();

  const { host, port } = await ctx.serve({
    servedir: DIST,
    port: 8080,
    host: "127.0.0.1",
  });
  console.log(`✓ serving http://${host}:${port}`);
  console.log("  edit js/ or styles/ and refresh.");
} else {
  await buildOnce();
}
