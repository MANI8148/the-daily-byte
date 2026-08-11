---
# Markdown anatomy for Dev.to / Medium / Hashnode cross-posts.
# The worker's write stage is prompted to produce exactly this shape.
title: Put the Keyword First — Under 70 Characters
description: A 130-160 character SEO description that also works as the deck under your headline.
slug: keyword-first-slug
tags: [ai, ml, tutorial]
date: 2026-08-11
canonical: https://bloggy.example.com/posts/keyword-first-slug
---

> Start with the concrete thing. One hook sentence, then deliver value immediately.
> No "in today's fast-paced world."

## The first section (keyword near the top)

Short paragraphs. Explain like your reader knows programming basics but not this
topic. Students skim — bold the **one sentence that matters** per section.

## Include a code block where it helps

```python
def agent_loop(goal):
    obs = []
    while not done(goal, obs):
        plan = llm.plan(goal, obs)   # think
        obs.append(execute(plan))    # act + observe
```

## Why students should care

Link your real source early. Reach rule #1: **every claim links to something
real** — readers verify, and platforms rank linked posts higher.

## Key takeaways

- One actionable takeaway
- Two actionable takeaways
- Three actionable takeaways (bullet lists get shared more than paragraphs)

---

### Cross-post checklist (per platform)

| Platform | Draft first? | Tags | Canonical |
|---|---|---|---|
| Dev.to | yes (`published:false`) | 4 max, lowercase | `canonical_url` |
| Medium | yes (`publishStatus:draft`) | 5 max | `canonicalUrl` |
| Hashnode | draft via API | 3 max | `originalArticleURL` |
| Ghost | yes (`status:draft`) | meta title | URL in settings |

All adapters are already implemented in `worker/stages/publish.py` — this file
is just the shape your prose should follow.