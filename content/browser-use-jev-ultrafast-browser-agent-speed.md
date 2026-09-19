---
title: "jev-ultrafast: The Browser Agent That Completes Tasks in Seconds"
kicker: OPEN SOURCE
description: "TypeSafe's jev-ultrafast is a blazing-fast browser agent that picks operations and elements dynamically, completing real-world tasks like booking flights in und"
slug: browser-use-jev-ultrafast-browser-agent-speed
date: 2026-09-19
author: The Daily Byte
tags: ["ai", "browser-automation", "open-source", "developer-tools"]
model: llama-3.3-70b-versatile
---

TypeSafe's jev-ultrafast just proved that browser agents don't need to be slow. The open-source project completes real browser tasks — like booking a Zurich-to-London flight on Google Flights — in 7.1 seconds, and the Browser Use Cloud waitlist is now open for early access.

Most browser automation tools today rely on brittle XPath selectors or slow step-by-step LLM chains that guess what to click next. jev-ultrafast takes a different approach: it hands a single natural-language goal to an agent and lets a system called Jev figure out the rest.

## What Is jev-ultrafast?

jev-ultrafast is a browser agent built by the browser-use community. Instead of chaining dozens of LLM calls to navigate a webpage, it uses a dynamic, indexed action space. That means every interactive element on a page gets catalogued into an index, and the agent selects from that indexed set rather than reasoning pixel-by-pixel.

The architecture splits responsibilities cleanly. TypeSafe's Jev component picks both the operation (click, scroll, navigate) and the specific element on the page. Only when the operation is `TYPE_TEXT` does a small language model generate the actual text to type. This separation keeps LLM usage minimal and latency low.

## How the Action Space Works

Traditional browser agents treat the DOM as a wall of text. jev-ultrafast treats it as a structured menu. The system indexes page elements and their relationships, so when you say "book a flight from Zurich to London," the agent can resolve the target input fields, buttons, and dropdowns from its index without iterative guesswork.

This matters because the expensive part of browser automation isn't the click — it's the reasoning loop that decides what to click. By collapsing that loop into a single indexed lookup, jev-ultrafast slashes total execution time.

## The 7.1-Second Flight Booking Demo

The project's headline demo says it all: a natural-language goal — "book a Zurich to London flight on Google Flights" — executed end-to-end in 7.1 seconds. That clock includes loading waits, page rendering, and the actual text generation for the destination fields.

The team published measurements and a loop video alongside the repo so observers can verify the timing claims. For an agent that navigates a heavily JavaScript-rendered travel site, sub-10-second completion is a striking result.

## Why It Matters for Developers

Browser automation has long been a pain point. Selenium scripts break with every DOM update. Playwright requires careful selector maintenance. LLM-based agents promise ease of use but introduce unpredictable latency.

jev-ultrafast sidesteps these issues by:

- **Reducing LLM calls.** The main agent decides operations and elements; a small model only handles text input.
- **Indexing rather than guessing.** A dynamic element index replaces fragile selectors.
- **Accepting natural-language goals.** One instruction, not a script of 20 steps.

For students building tools that interact with web interfaces, this pattern — separate planning from execution, index elements dynamically — is worth studying even if you never deploy jev-ultrafast itself.

## Try It and Join the Waitlist

The repository is live on GitHub with a demo video, measurement logs, and documentation on the agent loop. TypeSafe has also opened a waitlist for Browser Use Cloud, promising early access to hosted ultrafast browser agents.

To get started, check out the repo and review the loop measurements. If you're waiting for cloud access, signing up on the waitlist puts you in the queue ahead of general release.

## Key Takeaways

- jev-ultrafast completes real browser tasks in ~7 seconds using a dynamic, indexed action space instead of iterative LLM reasoning.
- TypeSafe's Jev handles operation and element selection; a small LLM generates text only when needed.
- The project is open-source, with measurements and demo video published for verification.
- Browser Use Cloud waitlist is open for early access to hosted ultrafast agents.
- The architecture — index once, plan once, execute — offers a faster alternative to traditional browser automation pipelines.

---