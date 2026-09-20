---
title: Claude Opus 5 Exploit Chain Reached OpenAI Staff Accounts
kicker: AI SECURITY
description: "How three researchers used Anthropic's Claude Opus 5 to chain a forum bug with an SSO weakness and reach OpenAI's internal code in under 72 hours."
slug: claude-opus-5-openai-account-takeover
date: 2026-09-20
author: The Daily Byte
tags: ["security", "ai", "exploit", "openai"]
model: llama-3.3-70b-versatile
image_url: "/images/2026-09-20/claude-opus-5-openai-account-takeover.jpg"
---

Three researchers used Anthropic's Claude Opus 5 to chain two dumb-sounding flaws — an image bug in a forum and a shared login — and take over the ChatGPT and Codex accounts of several OpenAI employees, all the way to an internal OpenAI code repository.

It was authorized security research, not a real intrusion: security firm Hacktron reported both flaws to OpenAI, proved the access with a harmless pull request, and stopped. OpenAI confirmed a fix about 14 hours later and on September 1 paid the team a $6,500 bounty. Total time from first look to internal access: under 72 hours.

## The chain, step by step

The attack had exactly two links. First, a memory-corruption bug in the software behind OpenAI's public help forum gave the researchers code execution on the forum's server. Second, because the forum let users "Sign in with OpenAI" — the same single sign-on (SSO) staff use everywhere — controlling the server let them hijack the ChatGPT and Codex accounts of forum members who happened to work at OpenAI. The victims did nothing wrong; the accounts were taken without any action from them.

Once inside, the team opened one employee's Codex link to OpenAI's code on GitHub and triggered a single pull request in the internal repository. They did not read source code, merge or ship anything, or touch customer data. The same reach, the team said, could in theory have extended to GitHub, Slack, and email — but none of that was touched.

## The opening was a crafted image

The forum runs on Discourse, which passes uploaded HEIC and HEIF images to ImageMagick, which in turn reads them with the libheif library. A deliberately crafted image exploited a flaw in libheif to corrupt server memory.

Discourse's advisory rates the outcome as remote code execution, scores it 8.8 out of 10, and tracks it as CVE-2026-32882. The public record for the underlying flaw is narrower: in libheif's own advisory, the same CVE is an out-of-bounds read that can crash the software or leak nearby memory — not directly a code-execution bug. The researchers say they stacked libheif's memory bugs, with the AI's help, to turn that crash into working code execution.

That leak is the key: leaked memory helps defeat ASLR, the address-space layout randomization that makes predictable memory corruption attacks much harder.

## The fix existed — but wasn't shipped

The flaw was fixed upstream in libheif 1.22.0 in May 2026 — months before the test. But the forum's server image, built on Debian 12, still shipped libheif 1.19.7 when the researchers looked in July. The fix and its CVE were public; Debian had simply not yet packaged them.

OpenAI's bounty wording says the opposite of a vendor covering its tracks, too: the award "recognizes the OpenAI-side finding, not the actions against Discourse," per Hacktron. Testing the forum software itself was outside OpenAI's bug bounty scope.

## Why a forum bug reaches staff accounts

This is the part that should scare every platform team. The flaw was in OpenAI's identity layer, not really in Discourse. Once the researchers owned the forum server, the shared "Sign in with OpenAI" flow let them impersonate any forum member who worked at OpenAI and take over their ChatGPT and Codex sessions.

Hacktron's read: this was an OpenAI identity problem, because any first- or third-party service using the same sign-on could have granted exactly the same access — the forum was just the foothold. Disneyland for attackers: public low-trust service + shared SSO + unpatched image parser.

## AI did the hard part

The exploit took a few tries. The team first ran Claude Opus 4.8, which struggled across several sessions to build a working exploit once ASLR was on. Anthropic released Opus 5 on the evening of July 24; a fresh session produced a working exploit within hours.

Opus 5 shipped with safeguards meant to stop it from writing exploit code against real targets. The researchers got around those by presenting the model with their own test server disguised as a capture-the-flag practice target, then letting it run in an automated loop. They also stress that this was not unattended hacking: skilled human direction still mattered, and someone stayed at the controls.

Anthropic itself has reported that criminal and state-backed groups are already using its Claude models for real intrusions. This case is the same trend wearing a white hat: capable models are collapsing the time and skill that serious offensive work used to require.

## The wider HEIF Heist

The OpenAI test was one target in a campaign Hacktron calls HEIF Heist. Over roughly two months, the team says it found the same class of image-decoding bugs in software used by other large companies at under $3,000 in total AI usage, linking them to reported flaws in Slack, Meta products, GitHub Enterprise, and Next.js. The wider campaign used a different model — OpenAI's own GPT-5.6 Sol — for cases where the team knew nothing about the target in advance.

Treat those broader claims with caution. The Next.js flaw is confirmed in Vercel's advisory, and libheif's maintainers confirmed a working code-execution exploit for the bug tied to Meta. But the wide claim of code execution across many applications has not been independently confirmed, and only Shopify so far appears to have noticed the testing at all.

## Verify your own image stack

If your service ingests user images and reads HEIC, HEIF, or AVIF via libheif, an old build may be exposed. On Debian-based systems, check the version that is actually installed:

```bash
dpkg-query -W libheif1
# newer than 1.19.7 is a good sign; 1.23.4+ is current as of Sept 2026
```

Then update libheif to the latest security release (1.23.4 as of early September 2026) or your distribution's patched build. If you self-host Discourse, rebuild on the latest image — a web-interface update alone may not replace the old library. Fixed releases: 2026.7.0, 2026.6.1, 2026.5.2, and 2026.1.6; Discourse-hosted sites were already patched.

Two mitigations carry the most weight. Where you don't need it, turn off decoding of untrusted HEIF and AVIF images, or run image processing inside a locked-down sandbox. And limit which services your single sign-on trusts, requiring a fresh identity check before sensitive actions instead of trusting an existing session.

## What the sources don't say

There's no sign the OpenAI flaw was used against anyone in the real world; as of mid-September 2026 it wasn't on the U.S. government's known-exploited-vulnerabilities list, though that list isn't proof either way. OpenAI has not publicly described the login flaw, confirming the finding through the fix and the bounty payment rather than an account-takeover write-up. And on whether an organization that has already patched should hunt for earlier access, the available reports are silent.

### Key takeaways

- An AI model turned an out-of-bounds-read CVE (CVE-2026-32882) into working code execution within hours, once ASLR was beaten with leaked memory.
- A public forum inherits a company's trust the moment it uses the same "Sign in with X" SSO.
- The root fixes are boring and real: ship patched image libraries (libheif 1.23.4), sandbox image decoding, and limit what SSO sessions can reach.
- Treat multi-vendor exploit claims from a single research firm as preliminary until each advisory independently confirms them.