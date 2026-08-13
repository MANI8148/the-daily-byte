# THE DAILY BYTE — Audience Growth & Distribution Plan

> Grounded in the SEO growth model + actual repo state (audited 2026-08-12).
> "Ads" = **organic distribution + shareable social cards** (free). Paid ads DEFERRED
> to Phase 3 ONLY if CTR/subscription economics justify it (model §22).
> Every task is independently checkable (✅ = verify by running/inspecting code or a live URL).

Positioning: **"The Daily Byte — AI & Tech, without the noise."**
Promise: **5 minutes. The important AI & tech stories you need to know today.**

---

## WORKSTREAM A — Foundation (Site conversion mechanics)
*Goal: turn a visitor into a reader → subscriber. No traffic works without this.*

- [ ] A1. Add homepage CTA block "Get The Daily Byte — 5 AI & tech stories, every morning" with email input + Subscribe (above the fold, `FrontPageGrid`).
- [ ] A2. Build `NewsletterSignup.tsx` (email-only, Supabase `subscribers` table w/ anon insert policy like `suggestions`).
- [ ] A3. Add `supabase/schema.sql`: `subscribers(email, created_at, source)` + anon insert RLS-off (mirror `suggestions`).
- [ ] A4. Per-article **Share bar**: X / LinkedIn / WhatsApp + Copy-link (`ShareBar.tsx`, rendered in `ArticleDetailModal` + archive cards).
- [ ] A5. Auto-generate a **branded social card** per article (OG image) — extend `worker/stages/images.py` to composite title + "THE DAILY BYTE" onto the cover image; write to `site/public/cards/<slug>.png`.
- [ ] A6. Emit `og:image` / `twitter:card` per article in `index.html` + per-post meta (Vite plugin or `generate-site-data.mjs` injects `<meta property=og:image>`).
- [ ] A7. Ensure every article route is statically pre-rendered (SEO) — confirm `dist/` has per-article HTML or a prerender step; else add `vite-plugin-ssr`/prerender.
- [ ] A8. Add `sitemap.xml` + `robots.txt` (already have sitemap via generator — verify `robots.txt` exists, add if missing).
- [ ] A9. JSON-LD `BlogPosting` per article (currently hardcoded in `_site`; ensure `site/` SPA emits it for crawler rich results).
- [ ] A10. Wire Vercel Analytics events: `article_read`, `share_click`, `subscribe`, `notification_optin` (custom events via `window.va.track`).

**Checkpoint A:** A visitor can read → share → subscribe, and each share produces a branded card. Verify by loading the built `site/` locally.

---

## WORKSTREAM B — Newsletter engine (the priority feature)
*Model §10: "make this a priority, not something you add later."*

- [ ] B1. `subscribers` capture (reuse A2/A3).
- [ ] B2. Build `scripts/newsletter.py` that reads today's edition (top N articles by lane) and renders a Markdown/HTML email: "THE DAILY BYTE — <DATE>" with 01–06 lane blocks (headline + 2-sentence explainer + "Read →").
- [ ] B3. Send via a free/keyless path first: write `dist/newsletter/<date>.html` + log to Supabase `newsletter_logs`; wire a sender adapter (Buttondown/Mailchimp/Resend) behind `NEWSLETTER_API_KEY` env (silent skip if absent — like other adapters).
- [ ] B4. Cron job `newsletter` daily 07:30 (GitHub Actions) → runs `scripts/newsletter.py` → sends. Reuse existing cron infra.
- [ ] B5. Double-opt-in: send confirmation; mark `confirmed=true` on click (Supabase function or a simple `/api/confirm` route).
- [ ] B6. Unsubscribe link in every email (required; one-click).

**Checkpoint B:** A subscribed test email receives the daily edition at 07:30. Verify in Supabase `newsletter_logs`.

---

## WORKSTREAM C — Organic distribution loop (the "ads" = free reach)
*Channels per model: start with WhatsApp + Instagram + LinkedIn + X + Newsletter. Expand later.*

- [ ] C1. **X/Twitter auto-thread**: `scripts/distribute.py` takes top story → drafts a 5-tweet thread (hook/feature/who-benefits/what-to-do/link). Post via X API (free tier) if `X_API_KEY` set, else write `dist/threads/<slug>.md` for manual paste.
- [ ] C2. **LinkedIn post**: 4-useful / 1-promo ratio. `distribute.py` drafts LinkedIn text per story.
- [ ] C3. **Instagram carousel**: generate 5 slides (Canva-style SVG → PNG) per major story via `images.py` composer; output to `dist/social/<slug>-ig-{1..5}.png` + caption "Link in bio".
- [ ] C4. **WhatsApp/college daily summary**: `scripts/daily_summary.py` emits a plain-text "Today's Byte — <DATE>" block (OpenAI…/Claude…/GitHub…/NVIDIA…) for paste into college groups.
- [ ] C5. **Reddit**: do NOT auto-post links. Instead `distribute.py` outputs a "useful explanation" draft per relevant sub (r/artificial, r/LocalLLaMA, r/programming) for manual, reputation-first posting.
- [ ] C6. **Quora/SO evergreen**: flag evergreen articles (tutorial/explainer) → `distribute.py` drafts a Quora-answer stub linking the full piece.
- [ ] C7. **YouTube Shorts script**: for each story, emit a 30–60s script (hook/what/why/do/link) to `dist/shorts/<slug>.txt` for manual video assembly.
- [ ] C8. Centralize: one news story → article + X thread + LinkedIn + IG carousel + Reel script + WhatsApp summary + newsletter block (model §18 content engine).
- [ ] C9. Add social links + "Follow The Daily Byte" to footer (`App.tsx`).

**Checkpoint C:** One article produces all distribution drafts automatically; manual paste fills the channels. Verify `dist/` outputs exist after a pipeline run.

---

## WORKSTREAM D — SEO evergreen machine (long-term engine)
*Model §9: news = short traffic; evergreen = months of traffic.*

- [ ] D1. Tag articles `type: news | evergreen` in frontmatter (writer prompt adds it).
- [ ] D2. For each news story, auto-spawn evergreen siblings via the pipeline: "What is X?", "X vs Y", "How to use X", "X API tutorial" (model §9 ideal system). Gate behind a `EVERGREEN=1` env to avoid spam.
- [ ] D3. Build **content clusters**: group evergreen by topic (e.g., "AI Agents") → hub page linking children (internal linking = SEO lift).
- [ ] D4. Add FAQ/structured-data (`FAQPage` JSON-LD) to explainers.
- [ ] D5. Keyword tracking: log which evergreen queries gain impressions (Search Console) → feed back to pipeline topic selection.

**Checkpoint D:** Search Console shows impressions for ≥10 evergreen URLs within 30 days of publishing.

---

## WORKSTREAM E — Retention & loop (the flywheel)
*Model §14, §17, §20, §23: returning users > clicks.*

- [ ] E1. **Browser notifications**: after 2 visits, prompt "Want today's Byte at 08:00?" → Web Push (free, e.g. via a tiny `service-worker.js` + Push API; or defer to a service like OneSignal free tier). Send 1/day.
- [ ] E2. **Referral system**: `subscribers(referred_by)`; "Share with 3 friends" → badge tiers (Byte Insider etc.). Start manual; automate later.
- [ ] E3. **Campus ambassadors**: recruit 5–10; give referral link + leaderboard (`ambassadors` table). Each reaches ~100 students → ~1–2k potential (model §12).
- [ ] E4. **Share tracking**: `share_click` events (A10) → attribute which articles/lanes drive shares → feed `LANE_TOPICS` weighting in `score.py`.
- [ ] E5. **Gamification (subtle)**: 7/30-day "Byte streak" via localStorage; no over-game-ification.
- [ ] E6. **Metrics dashboard**: a simple `analytics.md` or Vercel Analytics view tracking Visitors / CTR / read-time / Newsletter Conversion% / Returning%. The key metric: **% who return tomorrow**.
- [ ] E7. **Closed-loop Hermes**: pipe analytics (shares, returns, CTR by lane) back into `score.py` / `LANE_TOPICS` so ranking improves from audience behavior (model §19, §23).

**Checkpoint E:** Returning-user % measurable; top-shared lanes influence next-day topic fit.

---

## 90-DAY TIMELINE (priority order — do in this exact sequence if time-limited)

**Days 1–30 — Foundation (Goal: 100–300 users)**
- A1–A10, B1–B4, C4 (WhatsApp/college), C9 (footer).
- Distribution: WhatsApp groups, college clubs, X, LinkedIn, Instagram manually.
- Metrics: set up A10 + E6.

**Days 31–60 — Growth (Goal: 500–1,500 users)**
- B5–B6 (double-opt-in), C1–C3 (X/LinkedIn/IG auto-drafts), C5–C7, D1–D3, E1 (notifications), E2 (referral), E4 (share tracking).
- Measure: CTR by topic/headline/source; which articles share most.

**Days 61–90 — Scale (Goal: 2,000–5,000+ users)**
- D4–D5, E3 (ambassadors), E5–E7 (gamification + Hermes loop).
- Creator partnerships (5× 5–20k micro-creators > 1× 500k).
- **Only now**: evaluate paid ads IF subscription CTR > X% and LTV known.

---

## WHAT I WILL NOT DO (per model §22)
- ❌ Google/Meta paid ads before conversion economics are known.
- ❌ Buy followers (vanity, not audience).
- ❌ 20 mediocre articles/day (signal-to-noise is the moat).
- ❌ Spam Reddit/WhatsApp (burns channels).
- ❌ All 16 channels at once — start with WhatsApp + Instagram + LinkedIn + X + Newsletter.

---

## CURRENT REPO GAP SUMMARY (what must be built)
| Capability | Status |
|---|---|
| Vercel Analytics | ✅ present |
| Source og:image extract | ✅ present (no branded card) |
| Reader SuggestionBox | ✅ present |
| Newsletter UI/engine | ❌ missing |
| Share buttons | ❌ missing |
| Branded social cards | ❌ missing |
| Browser notifications | ❌ missing |
| Evergreen SEO generator | ❌ missing |
| Auto social distribution | ❌ missing |
| Referral/ambassador | ❌ missing |

## NEXT ACTION (tell me which to start)
Pick a workstream to implement now. I recommend **A (Foundation)** first — without subscribe/share, no other channel converts. Or say "start B (newsletter)" if you want the daily email engine first.
