---
title: "Fast Jev Compaction: A Claude Code Plugin That Stops Lossy Summaries"
kicker: OPEN SOURCE
description: "A Claude Code plugin replaces lossy compaction summaries with scored Jev decisions — keeping tool calls verbatim, dropping only what's stale, in one request."
slug: fast-jev-compaction-claude-code
date: 2026-09-18
author: The Daily Byte
tags: ["claude-code", "llm", "agents", "typescript", "open-source"]
model: llama-3.3-70b-versatile
image_url: "/images/2026-09-18/fast-jev-compaction-claude-code.jpg"
---

Long Claude Code sessions have a dirty secret: when context fills up, the tool quietly asks an LLM to summarize old turns — and summaries are lossy. A file path, an exact error message, or a constraint can silently vanish. Tamara Tran's `fast-jev-compaction` (1.7k stars, 81 forks) takes a different route: score every tool call and result with the Jev model, delete only what is demonstrably stale, and keep everything else verbatim.

## Why summaries are a problem

Context compaction is the fallback that keeps a long agent session alive when the transcript approaches its token ceiling. The usual approach: hand the whole conversation to an LLM and ask for a condensed version. The compressed history gets shorter, but the model has to guess what matters later. Per the README, "a file path, exact error, constraint, or command can disappear even when it matters later." The plugin's core rule sidesteps that risk: "This library never rewrites anything." It only deletes tool calls and results Jev says are no longer needed — user text and assistant text stay verbatim and in order.

## What "Jev decisions" means

Jev is a model served by TypeSafe (`jev-latest` on the `https://api.typesafe.ai/v1/systemone` endpoint). Instead of one giant summarization pass, the plugin asks Jev a deceptively simple set of yes/no questions:

- **Should this call stay?** — Does knowing the call was made, with its inputs, still matter?
- **Should this result stay verbatim?** — Is its content still needed, and re-running the tool wouldn't recover it?

Every non-pinned call gets both questions. That's the whole scoring model: a binary "keep" judgment per artifact, merged from concurrent requests into a single decision list.

## The "one fast request" trick

The traffic-heavy part is how the questions are batched. Each request contains the *full* conversation state so far, with tool results replaced by short notes like `ok, 4213 chars (omitted)` — nothing is summarized for the model's consideration. Questions are bundled so state plus questions stays under `maxRequestTokens` (30,000 by default, under Jev's 32k request limit). The same state is resent with every request, requests run concurrently, and the answers are merged.

## Pinning and trimming the state

Not everything is up for deletion. Calls in the first message and in the newest `preserveRecentMessages` messages (6 by default) are pinned. Before questions go out, the state must fit into `maxStateTokens` (25k default), and fitting happens in stages — each applied only if the prior one wasn't enough:

1. Tool inputs truncated to 1000, then 200, then 60 characters
2. Long texts abridged to head + tail, oldest non-pinned first
3. Old non-pinned messages collapsed to a `[… N chars omitted …]` note
4. Old tool calls reduced to one line each (`t12 Read file_path=src/a.ts → ok 480ch`)
5. Old call-less messages dropped entirely

If it still doesn't fit, compaction throws and the caller decides the fallback. Notably, tokens are *estimated* from character counts — a word per six letters, half a token per digit — calibrated to land a bit above what Jev reports, not measured with a tokenizer.

## The keep, truncate, or drop rule

Decisions roll up against a single `keepThreshold` (default 0.5), in priority order:

- **keepResult ≥ threshold** → keep call and result
- **else keepCall ≥ threshold** → keep the call, truncate the result to its first `truncateHeadChars` characters (300 default) plus a note
- **else** → remove the call *and* its result, never one without the other

The message list is then rebuilt: any message that loses all content is removed, untouched messages are returned as the same objects. Jev failures, malformed answers, missing keys, or an unfittable history all throw — the plugin's Claude Code hook then falls back to the built-in summary.

## Run it as a plugin or a library

The repo ships both. As an npm library it's a few lines:

```js
import { compactMessages, reductionRatio } from 'fast-jev-compaction';
const result = await compactMessages(transcript, { preserveRecentMessages: 4 });
if (reductionRatio(result) < 0.25) {
  // not worth it: keep the original, or summarize
}
```

As a Claude Code plugin it hooks `session.compact`, so `/compact` and auto-compaction route through Jev. Installation needs the early-access function-hooks flag (Claude Code 2.1.274+):

```
claude plugin marketplace add tamaratran/fast-jev-compaction
claude plugin install fast-jev-compaction@fast-jev-compaction
```

Then add `CLAUDE_CODE_ENABLE_FUNCTION_HOOKS=1` and `TYPESAFE_API_KEY` to `~/.claude/settings.json`. The README warns: never commit the key. When pruning succeeds, the toast reads `fast-jev-compaction: kept N/M messages, no summary (...)`; on short sessions or failures it's `fallback to built-in summary (...)`.

## Honest limits

The README is candid about constraints. Only tool calls and results are candidates — text is never removed or shortened in output. Token sizes are estimates, not a tokenizer. "A probability is not a proof that a result is safe to delete." And because the full state repeats with every request, a history near the ceiling costs one request per handful of questions. A small SwiftUI demo app (`demo/JevDemo`) plays a scripted, dramatized version of the flow for screen recording, without ever calling the API.

### Key takeaways
- Compaction via summarization is lossy; this plugin scores instead of rewriting, so kept content stays verbatim.
- Every non-pinned tool call gets two binary Jev questions — keep call, keep result — merged from concurrent requests.
- Fitting the state to 25k tokens happens in staged trims, from input truncation to folding old call-only messages.
- A single `keepThreshold` (0.5 default) yields keep, truncate-to-300-chars, or drop — results never survive without their call.
- It works as an npm library, a Claude Code function-hook plugin, or via a custom `JevAsker` transport.
- Estimates, not tokenizer counts, and a same-state-per-request design are the documented trade-offs.