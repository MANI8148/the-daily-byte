# Bloggy — always-on AI/ML/tech blog engine (100% free stack)

Writes blogs about **AI, ML, tech news, GitHub repos, and dev skills** on autopilot,
reaches students worldwide, and costs **$0/month**:

```
  FREE RUNNER (pick one)          FREE LLMs (per-stage)          FREE STORE
  · GitHub Actions cron           · Groq llama-3.3-70b (score)   · Supabase Postgres
  · Appwrite scheduled Function   · Gemini flash / Nous (draft)  · pgvector dedupe
  · your Mac / Codespaces         · OpenRouter :free fallback    · RLS + audit trail

  fetch ─▶ curate ─▶ write ─▶ checks ─▶ [git PR review] ─▶ merge ─▶ Vercel deploy
  HN · GH trending · arXiv · Reddit · RSS   │                    │  site/ (Next.js,
                                            │                    │  newspaper style)
  ┌─────────────────────────────────────────┘                    ▼
  │  content/drafts/<slug>.md  ──PR──▶  you review, edit, merge   daily-blog 🗞️
  └──────────────────────────────────────────────────────────────▶ distribution
     (also: dev.to · Medium · Hashnode · Ghost · Buttondown · Bluesky · Telegram)
```

Everything in the diagram is free-tier: GitHub Actions cron (unlimited on public
repos), free LLM endpoints, Supabase free, Vercel hobby, GitHub Codespaces.

## Quickstart

```bash
# 1. Reqs: python3.10+ only (worker is stdlib-only)
#    fix TLS on macOS python.org builds:  python3 -m pip install --user certifi

# 2. Config
cp .env.example .env          # free LLM (Groq/Gemini), Supabase, GITHUB_TOKEN...

# 3. Everything works with zero keys (mock LLM + dry-run DB, real news fetch):
python -m worker.app run-once --source all --mock-llm

# 4. Real run — fetches live news, curates (cheap LLM), drafts (strong LLM),
#    runs checks, saves to Supabase, opens a review PR:
python -m worker.app run-once --source all

# 5. Free 24/7: push to GitHub → the Actions cron runs it daily → merge PRs → Vercel.
```

## Pipeline (one pass = one article, always serial)

| # | Stage | Free implementation |
|---|---|---|
| 1 | **fetch** | HN API · GitHub Search API · arXiv API · Reddit JSON · RSS — all keyless |
| 2 | **curate** | cheap LLM scores every candidate 1–10 (relevance/freshness/novelty); below `LLM_SCORE_THRESHOLD` → no article today |
| 3 | **write** | strong LLM outputs markdown + frontmatter in newspaper house style |
| 4 | **checks** | format · SEO · duplicate (n-gram/·pgvector) · LLM fact-check — any fail blocks |
| 5 | **review** | `content/drafts/<slug>.md` → branch → GitHub PR (your existing review habit) |
| 6 | **publish** | dev.to · Medium · Hashnode · Ghost · Buttondown · Bluesky · site copy (adapters skip when unconfigured) |
| 7 | **deploy/reach** | merge PR → Vercel rebuild; SEO/communities/newsletter per `docs/REACH.md` |

## Repo map

| Path | What it is |
|---|---|
| `worker/` | Engine: `pipeline.py` orchestrator, stages `fetch/score/write/checks/review/publish`, `app.py` CLI (run-once · daemon · serve-approve) |
| `supabase/schema.sql` | One-time setup: tables, RLS, indexes, pgvector |
| `appwrite/` | Optional: deploy the worker as an Appwrite scheduled Function |
| `.github/workflows/blog-cron.yml` | The free cloud machine: daily cron ×2, overlap-guarded |
| `deploy/` | Dockerfile (VPS if you outgrow free), Render cron, setup notes |
| `site/` | Next.js newspaper (App Router, static export) — deploys on Vercel from `content/` |
| `templates/` | Newspaper design + markdown anatomy; `preview.html` opens instantly |
| `scripts/render.py` | Markdown → static newspaper site (`_site/`), no Next needed |
| `tests/` | `python3 -m unittest discover -s tests -t .` — 14 checks |
| `.devcontainer/` | GitHub Codespaces free dev env (Python + Node, preinstalled) |
| `docs/REACH.md` | Student-reach playbook: SEO, communities, growth loops |

## Cost: $0 forever

| Was (your plan) | Now (free) |
|---|---|
| n8n cloud / DigitalOcean droplet | GitHub Actions cron (free, unlimited on public repos) or Codespaces |
| Claude API (paid) | Groq / Gemini flash / OpenRouter `:free` / Nous — per-stage model split |
| X/Twitter API (paid-core) | Bluesky + Telegram + Dev.to + Buttondown; X free tier (500/mo) when approved |
| — | Supabase free · Vercel hobby · GitHub free — all unchanged |

## The human gate

Nothing publishes itself. Default flow: draft → PR → **you review/edit in GitHub**
(the workflow you already know from your other projects) → merge → deploy.
Set `AUTO_PUBLISH=true` only after the checks have earned your trust (the
fact-check pass still blocks anything unsupported by the source).

## The site — THE DAILY BYTE

The public newspaper lives in `site/` — a Vite + React vintage newspaper app,
blended with the front-page hero + masthead of the original Daily Byte (70%
AI Studio shell, 30% Daily Byte head/hero/date):

- Live ticker tape (CoinGecko public API — free, no key) with offline fallback
- Front page grid + pipeline dispatches stamped **Darklord**
- Page-flip magazine reader, edition archives, crossword & tech sudoku
  (rule-validated), audio narration, search
- Reader Suggestion Box (no AI — suggestions become fetch targets for the
  pipeline), letters to the editor, archived press-sheet simulation removed
- Resource footer: cheatsheets, GitHub repos, roadmaps (Daily Byte style)
- Harry Potter "Magik" masthead font (cdnfonts) with gothic fallback
- Data plan — scraping, dedup, 1–2h cadence: [docs/PIPELINE_PLAN.md](docs/PIPELINE_PLAN.md)

`site.nextjs/` holds the original Next.js edition; the standalone static
renderer remains `scripts/render.py` → `_site/`.

```bash
cd site && npm install && npm run dev        # local: http://localhost:3000
npm run build:static                         # pure static → dist/
```

Deploy free: Vercel hobby — `site/vercel.json` already pins framework/root. The
Actions cron drafts → you merge the PR → Vercel rebuilds → the new edition is live.
`site.nextjs/` is the archived earlier static site; `scripts/render.py` → `_site/`
remains the quick static fallback.

## Notes

- **Runs are serial by design** — free LLM backends 429 on parallel bursts.
- One failing source never kills a run (per-source isolation, verified live).
- macOS python.org builds need `pip install --user certifi` for TLS (the worker
  falls back to a warned unverified context until then).