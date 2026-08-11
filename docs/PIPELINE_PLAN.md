# THE DAILY BYTE — Data Plan: fresh news every 1–2h, never the same blog twice

How the wire room feeds the paper. Everything below runs on the free stack —
the same rule that governs the worker: **$0 for every service**.

## 1. Where the data comes from (all free, mostly no API keys)

| Tier | Source | Method | Key needed |
|---|---|---|---|
| Blogs | RSS/Atom feeds (dev.to, engineering blogs, OSS maintainer blogs) | RSS fetch + parse (feedparser), ETag/Last-Modified conditional GET, robots.txt check, ≥5 min polite interval per site | No |
| Signal | Hacker News | Official Firebase API (`/topstories`, `/item/{id}`) | No |
| GitHub | Trending / releases / topics | `https://github.com/trending` HTML scrape (cheap) or Search API (free tier, optional token) | Optional |
| Science | arXiv | RSS by category (cs.AI, cs.LG, cs.CR) | No |
| Community | Reddit `r/MachineLearning` + `r/programming` | Public `.json` endpoints, respect rate limits | No |
| Bounty | Reader Suggestion Box | Stored suggestions become explicit fetch targets (spider the suggested blog/URL once) | No |

**Blog subscription config** (new): `config/sources.yaml` — one entry per blog:
`url, cadence_min (default 60), weight, categories[]`. The fetcher merges this
with the existing stage-based fetch (HN, GitHub trending, release feeds).

## 2. Never write the same story twice (the dedup ledger)

A tiny state store (dev: `state/ledger.json`; prod: Supabase free table)
holds every item ever seen. Each fetched item is fingerprinted before any LLM
touch:

1. **Canonical URL** — exact match → skip (unless `refresh_after_hours`) ✔
2. **Normalized title hash** — lowercase, strip punctuation + stopwords, SHA-256.
   Same headline from 5 blogs → one story. ✔ (this is the "no blog twice" rule)
3. **Simhash/MinHash similarity ≥ 0.8** — catches *rewritten* retellings of the
   same story across different sites (different headline, same content).
4. **Lead-paragraph hash** — carried against past published articles so a
   recycled post can't slip in as a new dispatch.

Only items passing all four become candidates for drafting. The ledger is
append-only; nothing is ever deleted, so a story can never be re-published.

## 3. Reproducing (rewriting) blogs — the honest way

The pipeline **rewrites and credits — it never copies**:

- Draft stage takes the fetched source text and an LLM (Groq/Gemini/OpenRouter,
  per-call model override: cheap model scores, strong model writes).
- The draft must add: context, "why it matters to a student" angle, and a
  **verbatim quote with the source link** — modeled in the prompt contract.
- **Plagiarism guard in checks** (existing): sentence-overlap vs. source must
  stay under the threshold, or the draft is rejected — “broken drafts never
  leave the box.”
- Every dispatch’s frontmatter carries `source_url` + `source_name` +
  `first_seen` — the site prints them with the story (credit, always).
- The git-PR review gate still stands: humans approve what ships.

## 4. The 1–2 hour clock

- GitHub Actions cron: `cron: '0 * * * *'` (every hour) — or `0 */2 * * *` for
  the 2h cadence; one line to flip.
- Each run: fetch (bounded, staggered per source) → fingerprint/dedup →
  score → if < 3 genuinely new stories: **skip quietly, no PR** (GitHub Actions
  cost stays ~zero) → else draft → checks → branch → PR → merge → Vercel
  deploy → ticker + archives refresh with the new edition date.
- Watermarking: ledger stores per-source `last_run`/`last_etag`/`last_id`, so
  slow blogs aren’t re-fetched wholesale and the 1–2h cadence holds even after
  downtime.

## 5. Costs

Aggregate daily: ~24 cron runs × (fetch ≈ free + 2–6 LLM calls on free tiers) —
still **$0/month**. Supabase free tier holds the ledger comfortably.

## 6. Milestones

- **M1 — Blog feed stage:** `sources.yaml` + RSS/Atom fetcher + ledger v1
  (URL + title hash) + watermarking. Verify: run against 3 real blogs, confirm
  repeat run adds 0 duplicates.
- **M2 — Smart dedup:** simhash similarity pass + lead-paragraph hash.
  Verify: same story from dev.to + Medium + HN produces exactly one draft.
- **M3 — Cadence:** GH Actions cron at 1h for 1 week; verify: every edition
  dated, count of "skipped: nothing new" ticks, no duplicate slugs ever.
- **M4 — Reader loop:** Suggestion Box entries auto-append to fetch queue;
  verify: suggested URL appears in next edition’s sources.

**Already true today:** scoring, drafting with model overrides, fact-check +
plagiarism checks, the human PR gate, free deploy, and the site consuming
`content/` for the front page, magazine reader, archives and puzzles.