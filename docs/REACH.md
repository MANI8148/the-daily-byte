# Reach — Getting Students From Everywhere to Read

Reach is **not** "post everywhere and hope." It's a system: write for search + post
where students actually are + a loop that makes every post recruit the next readers.
Budget: 20% writing, 40% publishing/SEO, 40% community.

## 1. SEO that students actually search

Students Google things like: *"what is x", "x for beginners", "x vs y",
"x cheat sheet", "x roadmap 2026", "x explained simply", "how I learned x"*.

- **Title formula**: `Keyword + Stakes + Year`. e.g. *"AI Agents Explained Simply: The 2026 Student Guide"*
- Put the keyword in the **first 100 characters** of title + first paragraph + one H2.
- **Slug**: lowercase, hyphens, keyword-first.
- **Canonical URL** on every cross-post → points ranking power at your own site.
- Add **schema.org `BlogPosting` + `FAQPage`** JSON-LD to your site template (script in `templates/newspaper/article.html`).
- Descriptions: 150–160 chars, frontmatter `description` is used for OG + meta.

## 2. Platform strategy (write once, publish everywhere)

| Platform | Why | Notes |
|---|---|---|
| **Your static site** | SEO ownership, canonical origin | Newspaper template + `render.py` |
| **Dev.to** | Huge dev audience, best reach-per-effort | Publish early, tags `ai`, `ml`, `tutorial` |
| **Hashnode** | Strong SEO, free subdomain, dev community | Auto-GitHub import option |
| **Medium** | Built-in audience + email digests | Canonical matters (Medium doesn't pass juice) |
| **Substack / email** | Students subscribe and get pushed content | Newsletter = the retention loop |
| **X / LinkedIn** | Thread + link version of each post | Post at student-peak hours |

Post 3–5×/week, not 1×/hour. Consistency beats volume; each platform's algorithm
rewards accounts that post on a rhythm.

## 3. Content sources your pipeline already watches

- **GitHub trending (7d)** — write "repo of the week: what it is, why it matters, how to run it" → devs + students click.
- **Hacker News top** — reinterpret the #1 story *for beginners* (HN is dense; students need the "explain it to me" version).
- Your own **skills/learning** content: cheatsheets, roadmaps, "I built X with Y" — these get saved + shared the most.
- **Never blog about a paper/repo you haven't skimmed.** Hallucinated details get you roasted publicly. The Gate in the pipeline exists for this.

## 4. Communities (where students live)

- **Reddit**: r/MachineLearning, r/artificial, r/programming, r/learnprogramming, r/Python, r/OpenAI — *10% rule*: 9 useful comments for every 1 post. Self-promo-only accounts get banned.
- **Hacker News**: "Show HN" when the site ships; genuine technical discussions otherwise.
- **Discord**: AI/ML study servers, university CS clubs (offer to write their club newsletter — instant distribution).
- **Telegram/WhatsApp groups** (huge in India, SEA, LatAm): share the weekly digest, not every post.
- **X**: post a 3-tweet thread + the link; tag the repo authors/paper authors (they often reshare).
- **Newsletter swaps**: trade a shoutout with 2–3 other student-tech newsletters once you're at ~100 subs.

## 5. Formats students click and share (metric check)

| Format | Shareability | Effort |
|---|---|---|
| Cheat sheet / roadmap ("X in 2026") | ★★★★★ | Low |
| "Explained simply / for beginners" | ★★★★★ | Low |
| "How I built …" (with code) | ★★★★ | Medium |
| Repo of the week (mini-tutorial) | ★★★★ | Low |
| Comparison post ("X vs Y") | ★★★★ | Low |
| Paper explainer | ★★★ | High |

## 6. The growth loop

```
post → footer CTA ("subscribe for the weekly Byte") → email newsletter
     → 1 curated link roundup/wk → readers → shares → new readers
```

- Newsletter = **Buttondown/Beehiiv free tier**. Pull 3 best posts from the week,
  1 surprise link, one "answer a reader's question" — scripts in `content/weekly.md` if you want the pipeline to draft it.
- Put the subscribe CTA in **every post footer** (template already has it).
- Measure: Plausible/Umami self-host (or GA4) on your site; unique `?utm_` params per platform so you know what works.

## 7. Timing (students are global — pick 2 windows)

Post at **18:00–21:00 IST** (covers India + Middle East + Europe morning) **and
18:00–21:00 EST/21:00–00:00 UTC** (US + LatAm). Two posts/day max, one per window.
n8n cron: `0 12 * * *` and `0 21 * * *` UTC — or use OpenWrite/native scheduling.

## 8. Realistic expectations (0 → 6 months)

- **M0–2**: indexing + first communities. ~100–300 reads/mo. This is the grind phase.
- **M3–4**: one post breaks out (a trending-repo tutorial or "explained simply" piece). 1–5k reads on it.
- **M5–6**: compounding — newsletter + returning readers; 10k+/mo if 2+ posts broke out.
- The levers that actually move numbers: **great titles, one breakout format you repeat, newsletter, weekly cadence**. Everything else is hygiene.

Quality gate > volume. One excellent post a week beats seven mediocre ones — and
the algorithms + communities agree.