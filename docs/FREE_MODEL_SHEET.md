# Free-Model Sheet — top 5 free picks per LLM provider

Last refreshed: 2026-09-18 (OpenRouter IDs from the live public catalog;
Groq IDs from official docs; TokenRouter IDs from official docs).
Refresh anytime with: `.venv/bin/python -u scripts/list_free_models.py`
(requires network egress to the provider APIs).

How to use: copy any model ID below into `OPENAI_MODEL` (Groq primary) or the
`model` field of an `LLM_FALLBACKS` entry. The worker tries tiers in order
(Groq → OpenRouter → TokenRouter → Ollama → opencode CLI), so put the
strongest model first.

## Groq — primary (`OPENAI_BASE_URL=https://api.groq.com/openai/v1`)
Groq has no `:free` suffix; the free tier is key-based. All Active per docs.

| # | Model ID | Use |
|---|---|---|
| 1 | `llama-3.3-70b-versatile` | drafting (`OPENAI_MODEL`) — 131k ctx |
| 2 | `llama-3.1-8b-instant` | curation (`LLM_SCORE_MODEL`) — fast, 131k ctx |
| 3 | `openai/gpt-oss-120b` | backup drafter — 131k ctx |
| 4 | `openai/gpt-oss-20b` | backup drafter — 1k tok/s |
| 5 | `moonshotai/kimi-k2-instruct-0905` | backup drafter |

## OpenRouter — fallback #1 (`https://openrouter.ai/api/v1`)
Free IDs verified live 2026-09-18 (25 free models in catalog). Any `:free`
suffixed ID below works with any OpenRouter key.

| # | Model ID | Notes |
|---|---|---|
| 1 | `deepseek/deepseek-v4-flash-0731:free` | current fallback — 1M ctx |
| 2 | `qwen/qwen3.8-27b:free` | 262k ctx |
| 3 | `google/gemma-4-31b-it:free` | 262k ctx |
| 4 | `z-ai/glm-5.2:free` | 32k ctx |
| 5 | `nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free` | reasoning, 256k ctx |

Also useful: `openrouter/free` (auto-router over free models).

## TokenRouter — fallback #2 (`https://api.tokenrouter.com/v1`)
IDs per official docs (case-sensitive). Confirm against your key with
`GET /v1/models` (the lister script does this automatically).

| # | Model ID | Notes |
|---|---|---|
| 1 | `deepseek-v4-flash` | current fallback — 1M ctx |
| 2 | `deepseek-v4-pro` | 1M ctx |
| 3 | `kimi-k2p6` | agentic, 256k ctx |
| 4 | `qwen3p7-plus` | 256k ctx |
| 5 | `glm-5p1-fast` | 200k ctx |

## Retired IDs (do NOT use — they 404/503)
- `openai/gpt-oss-20b:free` on OpenRouter (removed from catalog)
- `moonshotai/kimi-k3-free` on TokenRouter (not a current ID)
