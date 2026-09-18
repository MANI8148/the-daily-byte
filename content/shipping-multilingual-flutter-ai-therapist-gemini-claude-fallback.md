---
title: "\"Multilingual Flutter AI therapist: Gemini first, Claude fallback\""
kicker: AI
description: "Build log for Safe Space, a Flutter mental-health app with Gemini-first AI chat, a Claude fallback, eight locales, and hard rules on consent and screening."
slug: shipping-multilingual-flutter-ai-therapist-gemini-claude-fallback
date: 2026-09-18
author: The Daily Byte
tags: ["flutter", "ai", "llm", "mental-health"]
model: llama-3.3-70b-versatile
image_url: "/images/2026-09-18/shipping-multilingual-flutter-ai-therapist-gemini-claude-fallback.jpg"
---

Timofei Gats shipped **Safe Space**, a Flutter app for everyday mental-health self-help, where Google Gemini powers the AI chat and Anthropic Claude waits in the wings as a fallback — and the most important code is the part that keeps a therapy-adjacent model from acting like a therapist.

The project, published on dev.to (Sept 18, 2026) as a build log, covers far more than wrapping a chatbot. It is a case study in consent flows, provider failover, crisis handling, and multilingual distribution for a single indie developer. Safe Space is explicitly **not therapy**, not a medical device, and not a crisis line — a disclaimer that lives in the UI, the backend, and the marketing site.

## The stack that actually shipped

Gats reports a deliberately boring stack: a **Flutter client** shipping to Android and web today (iOS is marked "Coming soon"), **Firebase Authentication** for accounts, and a backend where **Gemini** handles AI chat first with **Claude as the fallback** if Gemini is unavailable. The app itself bundles AI chat, a mood journal, CBT-style thought records, PHQ-9 / GAD-7 screening screens, and breathing tools.

The claimed differentiator is not the model choice. It is what he calls keeping the product honest when "the model is in the loop" — the workflows around the LLM call, not the LLM itself.

## Consent comes before the model

The one rule that shapes the whole architecture: no message reaches an LLM without consent. Users hit an explicit consent step before their first thought is sent off-device. If they skip it, there is no silent call made behind their back.

For a category where trust is the product, that is the load-bearing engineering decision. It also simplifies the backend contract — there is no scenario where a support ticket is about data sent without the user's knowledge.

## Gemini first, Claude as a safe fallback

The backend tries **Gemini first**. If that call path fails, it fails over to **Claude**. The user sees a conversation continue rather than an endless spinner, and if both providers are down, the app surfaces a plain error instead of pretending to work.

The practical takeaways for anyone building on LLMs: keep timeouts short, define the failure path before you ship, and prefer "a clear error" over "a silent hang."

## Screening tools that refuse to diagnose

The PHQ-9 and GAD-7 are well-known clinical questionnaires, and in Safe Space they are presented as **screens with sources and plain-language ranges** — not as a clinical verdict.

One detail deserves special attention: **item 9 of the PHQ-9**, the question about self-harm, must be treated as a crisis signal. Gats's rule: point people to local emergency services, never to "keep chatting" with the model. That single branching path is where an AI wellness app either earns its safety claims or loses them.

## Eight locales, one codebase

Safe Space ships in **English, Russian, Turkish, Spanish, German, Portuguese, Japanese, and Korean** — one Flutter codebase using localization, rather than eight native clients. The store listings (Google Play, RuStore, Amazon) and the marketing site at safespaceapp.cc mirror those locales.

For a solo developer this is a cost argument as much as a reach argument: one codebase plus localized store listings beats maintaining per-platform native apps with separate localization work.

## Publishing facts for humans *and* assistants

A distinctive part of the log is indexing for recommendation systems. If the goal is for Gemini, ChatGPT, or Perplexity to name the app when someone asks for a self-help companion, the site needs facts those assistants can retrieve:

```shell
curl -s https://safespaceapp.cc/robots.txt   # check crawler allowances
curl -s https://safespaceapp.cc/llms.txt     # machine-readable product facts
```

The setup reported:

- a `robots.txt` that explicitly allows `OAI-SearchBot`, `Google-Extended`, and `Bingbot`;
- `/llms.txt` and `/llms-full.txt` files with product facts and the wellness disclaimer in plain, parseable text;
- JSON-LD structured data on the citeable overview page at `safespaceapp.cc/ai-therapist-app`.

That last point matters: if AI assistants are told to cite sources, feeding them well-structured, crawlable facts is how a tiny indie app competes for mentions against big-name wellness suites.

## What the author would not do again

The log closes with anti-patterns worth copying into your own mental checklist:

- **Do not invent an App Store ID.**
- **Do not copy fake ratings.**
- **Do not position an AI companion as a licensed clinician.**

The closing line is the thesis: "Users in crisis need a hotline, not a model."

## Try it yourself

The free tier runs on the web with no install at `app.safespaceapp.cc`; the Android build is on Google Play under the package `com.safespace.safe_space_app`. If you want to test the consent flow and the failover behavior — or just audit the `robots.txt` and `llms.txt` files — the whole surface is open.

### Key takeaways

- Put consent in front of any LLM call; a skipped prompt means no silent request.
- Run a primary model (Gemini) with a real fallback (Claude), short timeouts, and a plain error when both fail.
- Screening (PHQ-9 / GAD-7) is a screen with sources, not a diagnosis; treat PHQ-9 item 9 as a crisis signal and route to emergency services.
- One Flutter codebase can cover eight locales across Play, RuStore, and Amazon listings.
- Publish facts for AI assistants (`robots.txt`, `llms.txt`, JSON-LD) so your product is citable, not just crawlable.
- Never fabricate store IDs, ratings, or clinical credentials in a wellness app.