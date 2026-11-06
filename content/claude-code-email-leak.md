---
title: Claude Code leaks your email to websites you visit
kicker: AI
description: "A bug report on Anthropic's own repo reveals that the coding agent sends your developer email address to third-party websites. Here's what we know, why it matte"
slug: claude-code-email-leak
date: 2026-11-06
author: The Daily Byte
tags: ["ai", "security", "privacy"]
model: llama-3.3-70b-versatile
image_url: "/images/2026-11-06/claude-code-email-leak.jpg"
---

# Claude Code leaks your email to websites you visit

**Draft — source material is a GitHub issue + Hacker News discussion from November 5, 2026.**

Claude Code is meant to help you write code. So is your browser. It turns out the two are sharing information you never intended to send anywhere else.

## The disclosure

A developer filed an issue against `anthropics/claude-code` asking what happens when Claude Code surfaces your email address in project context. The response, per the Hacker News thread published that evening, indicates that the agent transmits your email to websites that Claude Code calls "external tools" — sites the assistant opens inside a tab as part of development workflows. [HN thread: 884 points, posted 22:17 UTC by motoroco]

The core concern: your work machine is logged into or identifies your identity, and Claude Code is chattering your email address to random third-party servers.

## How it works, in plain terms

When Claude Code runs a command like `npx some-tool` or triggers a web search inside your terminal, it can open that tool's website in a browser. On those pages, any email associated with your account or installed package may appear in URL parameters, scripts, or analytics tags. The agent then captures that page content, and the address becomes part of the conversation log — which gets sent back to Anthropic's API.

If you visit github.com, npmjs.com, a blog that loads comments, or basically any site while Claude Code is active, your developer email could end up in a message routed through Anthropic's infrastructure.

## Why students should care

This matters specifically because most of us run Claude Code 24/7. We store projects, credentials, and personal info in the same environment we use the agent daily. A developer email attached to every session means every automated task — dependency installs, web searches, code reviews — carries your private address through Anthropic's servers.

For students, the blast radius is larger. You likely haven't set up a separate vault. Your email belongs to your university account or your email provider, and any leak compounds with every other privacy decision you make on campus networks.

## What's already being done

Per the issue thread, Anthropic acknowledges the behavior exists and is investigating whether external tool links should be routed differently. Some community members have suggested URL obfuscation or auto-clearing cookies before opening new tabs. Others are recommending you pause Claude Code whenever you navigate away from a project directory.

The fix is not confirmed yet. Until then, treat each active session as a potential data pipeline.

## Three things to do right now

1. **Disable browser activity while Claude Code runs.** Most agents have a manual off switch for external tool access — look in the settings panel. [Hands-on]

```bash
# Check if your setup has an external-tools toggle
# Common locations differ by version, so search locally:
grep -ri "external" ~/.claude/settings.json 2>/dev/null || echo "Check manual UI"
```

2. **Rotate your email if this became public.** You can't unsubscribe someone else from an old address. Set up a throwaway address for agent sessions if your primary provider allows alias creation.

3. **Audit recent sessions.** Open your conversation history, grep for occurrences of your email, and decide whether to delete those threads entirely.

## What we're watching

Anthropic's response to issue #107757 will determine whether this becomes a known incident or an internal cleanup. The thread has built enough signal that the company is likely to issue a documented fix soon. Until then, developers are advised to treat their email as potentially exposed across any site the agent opens.

**Key takeaways:**
- Claude Code sends your developer email to external websites during agent sessions.
- The leak route is through browser-opened pages captured by the agent.
- Students with university emails face compounded privacy risk because most setups reuse a single identity.
- An Anthropic fix is pending; immediate mitigations include disabling browser activity and auditing existing sessions.