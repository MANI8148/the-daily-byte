# site/ — The Daily Byte (Student AI & Tech Edition)

The public newspaper — a vintage-style interactive daily with:

- **Front Page** — lead hero dispatch, featured stories, editorial column, wire briefs, puzzle section
- **Brochure Magazine Reader** — 3D page-flip reading mode
- **Edition Archives** — timeline of past issues (pipeline editions + demos)
- **AI Publishing Desk** — draft custom articles with Gemini AI (needs the dev server + `GEMINI_API_KEY`)
- **Press Room** — ink smear / crumple / loupe print-sheet simulation
- **Audio Reader** — read-aloud narration (Web Speech API)

## Where content comes from

`scripts/generate-site-data.mjs` reads the **Bloggy pipeline's markdown files**
(`../content/*.md`) at build time and emits `src/data/generated-content.ts`.
Each pipeline date becomes a fresh **PIPELINE DISPATCH** edition whose hero is the
newest real post; the Gazette's editorial voice, puzzles and ticker stay as the
vintage frame (see `src/data/buildIssues.ts`).

Run `node scripts/generate-site-data.mjs` anytime to refresh (it also runs
automatically via the `predev`/`prebuild` npm hooks).

## Development

```bash
npm install
cp .env.example .env        # add GEMINI_API_KEY for the AI desk/letters
npm run dev                 # http://localhost:3000  (Vite + express + Gemini endpoints)
```

## Free deploy (Vercel hobby tier)

`vercel.json` pins the framework (`vite`), root directory (`site/`) and static
build. The recommended loop matches the Bloggy architecture:

1. GitHub Actions cron runs the pipeline → drafts land in `content/drafts/`
2. Draft opens as a PR → you merge
3. Merge triggers Vercel rebuild → `prebuild` regenerates the issue data →
   the front page shows the new dispatch automatically

Static-only build (no AI desk): `npm run build:static` → `dist/` is pure static
and can be hosted on GitHub Pages / Netlify / any free static host. The full
`npm run build` additionally bundles `dist/server.cjs` for self-hosted Gemini endpoints.