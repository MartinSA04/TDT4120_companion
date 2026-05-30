import { defineConfig } from "astro/config";
import studyCompanion from "study-companion";

// The integration injects all pages, the MDX+KaTeX pipeline, and the Pagefind
// search index. A course only sets `site` (its public URL, for canonical links
// and the sitemap) — served at root via the custom domain, so no `base` needed.
export default defineConfig({
  site: "https://algdat.martinsundal.no",
  integrations: [studyCompanion()],
});
