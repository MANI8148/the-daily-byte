---
title: "Jev-Ultrafast: Browser Agents That Pick Actions, Not Just Text"
kicker: OPEN SOURCE
description: "Browser-use's new Jev-Ultrafast agent uses a dynamic indexed action space and tiny LLMs to complete flight searches in 7.1 seconds."
slug: jev-ultrafast-browser-agent-action-space
date: 2026-09-19
author: The Daily Byte
tags: ["ai", "browser-automation", "llm", "open-source"]
model: llama-3.3-70b-versatile
image_url: "/images/2026-09-19/jev-ultrafast-browser-agent-action-space.jpg"
---

Browser-use's Jev-Ultrafast completes a Zürich-to-London flight search on Google Flights in 7.1 seconds — loading waits, text entry, and all — by letting a small LLM pick structured operations instead of generating free-form code.

## The core idea: indexed actions, not raw DOM

Most browser agents today work by feeding the DOM (or a screenshot) to a large language model and asking it to emit the next step — click here, type there, scroll down. That approach is flexible but slow: the model must reason about page structure every turn, and token costs pile up.

Jev-Ultrafast flips the script. It builds a **dynamic, indexed action space** for the current page — every clickable, typeable, or scrollable element gets an ID and a type-safe descriptor. A small, fast model (Jev, from TypeSafe) then selects **one operation + one element ID** per step. Only when the chosen operation is `TYPE_TEXT` does a tiny LLM generate the actual string to input.

The result: fewer tokens, lower latency, and a loop that looks more like a traditional automation script than a chat completion.

## What the repo demonstrates

The README centers on a single measured run: **Zürich → London on Google Flights in 7.1 seconds end-to-end**. That number includes:

- Page loads and network waits
- Calendar interaction for date selection
- Origin/destination text entry
- Search submission

A linked MP4 shows the full execution. The repository also publishes a "Measurements" page with step-by-step timings and a "Read the loop" breakdown of the agent's internal reasoning trace.

## How the loop works

From the source description, each iteration follows a tight cycle:

1. **Observe** — extract the current page's actionable elements, assign stable indices, and serialize a compact representation (operation type, element ID, label, bounds).
2. **Decide** — feed the goal ("book Zürich to London flight for next Friday") plus the action index to Jev. Jev returns `{ operation: "CLICK", element_id: 42 }` or `{ operation: "TYPE_TEXT", element_id: 17 }`.
3. **Act** — execute the operation. If `TYPE_TEXT`, a second micro-LLM produces the actual string ("Zurich, ZRH").
4. **Wait** — pause for navigation, animations, or network idle.
5. **Repeat** until the goal is satisfied or a step budget expires.

Because the action space is **re-indexed each turn**, the agent adapts to dynamic content (date pickers, autocomplete dropdowns) without hard-coded selectors.

## Why a small model for action selection?

Large models excel at open-ended reasoning but are overkill for "which of these 37 buttons matches 'search'?" Jev is trained to map a natural-language goal + a structured menu of actions to a single discrete choice. That task fits in a few hundred tokens and runs in milliseconds on modest hardware.

The architecture also sidesteps a common failure mode: when a big LLM writes Playwright/Puppeteer code, a single syntax error or stale selector crashes the run. Here, the executor is deterministic — it only invokes pre-validated primitives (`click(id)`, `type(id, text)`, `scroll(id, delta)`).

## Try it locally

The repo is open source. Clone and run the demo:

```bash
git clone https://github.com/browser-use/jev-ultrafast.git
cd jev-ultrafast
pip install -e .
python -m jev_ultrafast.demo --goal "Zürich to London flight next Friday"
```

You'll need a local browser (Chromium via Playwright) and an API key for the Jev model (TypeSafe provides a free tier). The demo prints each step's chosen action, element ID, and wall-clock time.

## Cloud waitlist and what's next

Browser-use has opened a **Browser Use Cloud waitlist** for hosted ultrafast agents. The cloud version promises:

- Managed browser fleets with pre-warmed profiles
- Shared action-space caches across sessions
- Horizontal scaling for parallel goals

No public pricing or SLA yet — the waitlist form collects email and use-case notes.

## Limitations to watch

- **Single-goal scope**: The demo shows one linear task. Multi-step workflows with branching (e.g., "if price > $500, try alternate dates") aren't demonstrated.
- **Site specificity**: Google Flights is highly structured. Pages with heavy canvas/WebGL or Shadow DOM may yield sparser action indexes.
- **Jev availability**: The action-selection model is proprietary (TypeSafe). Local fallback or ONNX export isn't mentioned in the current README.

## Key takeaways

- Jev-Ultrafast replaces per-step LLM code generation with a **structured action index + tiny selector model**.
- Measured **7.1 s** for a real Google Flights search including loads, waits, and text input.
- Open-source repo with runnable demo; cloud hosted version accepting waitlist sign-ups.
- Architecture trades some flexibility (arbitrary JS execution) for **speed, determinism, and token efficiency**.
- Next steps: multi-goal planning, broader site coverage, and cloud GA.