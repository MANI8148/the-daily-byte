# THE DAILY BYTE — Production-Readiness Closure Plan

> **For Hermes:** Use subagent-driven-development skill to implement task-by-task.

**Goal:** Close the 3 remaining gaps (live LLM proof, Supabase key validity, review-gate clarity) and document the architecture so the paper is provably production-ready and free-forever.

**Architecture:** Stateless GitHub Actions cron (hourly) → `worker.pipeline.run_once` selects 3 of 6 rotated topic lanes → OSS fetch → 4-tier LLM draft → quality gates → git-committed `content/*.md` + durable `seen_links.json` ledger → Vercel static deploy. Supabase is optional (degrades to file ledger). No paid services.

**Tech Stack:** Python 3.11, GitHub Actions (free), Vercel (free static), Groq/OpenRouter/TokenRouter/opencode (free LLM tiers), feedparser/trafilatura/rapidfuzz, Supabase (optional).

---

## Status (verified this session)
- ✅ Canonical suite 14/14 OK
- ✅ Secret scan clean (`.env` gitignored; 9 masked Actions secrets; 1 false hit = article about keys)
- ✅ 6 strictly-distinct topic lanes (Hardware/Consumer-Tech = Verge/Ars/Tom's/quant-ph)
- ✅ 3 posts/hr via rotated 3-of-6 lanes (all 6 covered / 6h)
- ✅ Dedup ledger (`seen_links.json`) durable + Supabase-resilient (verified: 401 doesn't crash)
- ✅ 4-tier LLM fallback present in `write.py` (Groq→OpenRouter→TokenRouter→opencode + curl rescue)
- ⚠️ **GAP 1:** Live LLM run unproven this session (free tiers throttled → run hangs >8min)
- ⚠️ **GAP 2:** Pasted `SUPABASE_ANON_KEY` returns 401 (key not valid for project `atbyvsaukqrasvqulldj`) — but code now degrades, so non-blocking
- ⚠️ **GAP 3:** `AUTO_PUBLISH=false` + review gate (PR) not wired (`GITHUB_TOKEN`/`GIT_REPO` unset) → cron commits directly; review gate is decorative

---

## Task 1: Prove the live LLM cascade (close GAP 1)
**Objective:** Demonstrate a real 1-article run completes end-to-end via the fallback chain.
**Files:** `.github/workflows/blog-cron.yml`, `worker/config.py`
- Step 1: Switch `OPENAI_MODEL` Actions secret to `llama-3.2-3b-instant` (higher free RPM, unthrottled).
- Step 2: `gh workflow run bloggy-daily --repo MANI8148/the-daily-byte` (dispatch via workflow_dispatch).
- Step 3: `gh run watch <id>` — expect completed/success in <3min, log shows `[llm]` drafting + `articles: 1` + `committed`.
- Step 4: Confirm new `content/*.md` appears on `main` (`git pull`); commit note.
**Validation:** Run succeeds; article published; proves cascade works without Groq.

## Task 2: Resolve Supabase key (close GAP 2)
**Objective:** Either make Supabase work or formally document it as optional.
**Files:** Actions secrets, `worker/supabase.py` (already resilient)
- Step 1: In Supabase dashboard for project `atbyvsaukqrasvqulldj`, copy the **correct** anon key (Settings → API). `gh secret set SUPABASE_ANON_KEY` via stdin (masked).
- Step 2: OR, if you don't want Supabase: leave it; code already degrades. Add a one-line comment in `blog-cron.yml` noting Supabase is optional.
- Step 3: Verify a run logs `[supabase] ... skipped` (clean) OR `recent_posts` returns data (working).
**Validation:** No 401 in logs; pipeline unaffected either way.

## Task 3: Make the review gate explicit (close GAP 3)
**Objective:** Decide and document the publish model.
**Files:** `.github/workflows/blog-cron.yml`, `worker/stages/review.py`
- Option A (auto-publish, current behavior): set `AUTO_PUBLISH=true`; document that cron commits → Vercel deploys. Remove the decorative PR step or leave as manual.
- Option B (human review): set `GITHUB_TOKEN` + `GIT_REPO` secrets; `review_push` opens a PR per run; `AUTO_PUBLISH=false`; a human merges.
- Step 1: Choose A or B; set the secret/env accordingly.
- Step 2: Add a 3-line comment block in `blog-cron.yml` stating the chosen model.
**Validation:** Run matches chosen model; no surprise auto-deploys (if B) or confirmed auto-deploy (if A).

## Task 4: Add canonical tests for the new logic (lock in this session's gains)
**Objective:** Promote ad-hoc checks into the real suite so regressions are caught.
**Files:** `tests/test_lanes.py` (create), `tests/test_supabase.py` (create)
- Step 1: `tests/test_lanes.py` — assert `lanes_per_run=3`, rotation covers all 6 lanes over 6h, `run_once` drafts exactly 3 (mock fetch/score/write).
- Step 2: `tests/test_supabase.py` — assert 401 on every remote method degrades (mock `_call` to raise); `mark_seen` persists to file ledger.
- Step 3: `env -u PYTHONPATH -u PYTHONHOME .venv/bin/python -m unittest discover -s tests -t .` → expect 14+2 = 16 OK.
- Step 4: Commit.
**Validation:** Suite green; new behavior covered.

## Task 5: Architecture doc + final readiness report
**Objective:** Single source of truth for the system.
**Files:** `docs/ARCHITECTURE.md` (create), README badge
- Step 1: Write `docs/ARCHITECTURE.md` covering: data flow diagram, 6 lanes + sources, dedup, 4-tier LLM fallback, security posture, cost (free), hourly cadence.
- Step 2: Append a "Production Readiness" section: PASSED gates + the 3 closed gaps.
- Step 3: Commit; reply with the readiness verdict: **GO / NO-GO**.

---

## Verification (end-to-end)
1. `env -u PYTHONPATH -u PYTHONHOME .venv/bin/python -m unittest discover -s tests -t .` → 16 OK
2. `git ls-files | grep -qx .env` → must be empty (not tracked)
3. Live `gh workflow run` → success, article on `main`, Vercel deploys
4. `seen_links.json` grows each run (dedup working)

## Risks / Tradeoffs
- Free LLM tiers throttle under load → hourly 3-article cadence chosen to stay under quota; if throttled, runs degrade to 0 (no crash) until quota resets.
- Supabase optional: without a valid key, `posts` table won't populate (fine; git is the store).
- Review gate (Task 3) is a policy choice, not a code defect.

## Open Questions
- A or B for publish model (Task 3)?
- Keep Supabase or drop it (Task 2)?
