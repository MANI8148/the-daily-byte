---
title: Anthropic expands Claude access for security teams
kicker: AI
description: "Anthropic’s Cyber Verification Program now grants security teams broader Claude access with reduced safety limits, aimed at penetration testing and threat analy"
slug: anthropic-expands-claude-access-security-teams
date: 2026-10-07
author: The Daily Byte
tags: ["ai", "security"]
model: llama-3.3-70b-versatile
---

Anthropic just opened up Claude models to more security teams, easing safety guardrails for penetration testing.

## What is the Cyber Verification Program?

The Cyber Verification Program is a dedicated initiative from Anthropic that lets security professionals work with Claude models in a controlled environment. According to the announcement, the program was originally limited to a small set of vetted teams. The recent expansion broadens eligibility, allowing a larger cohort of security practitioners to request access. The goal is to let these teams use Claude for tasks that directly benefit cybersecurity workflows, such as simulating attacks and validating defenses.

## Fewer safety restrictions, more flexibility

The key change is a reduction in safety restrictions. Traditional Claude deployments include extensive guardrails to prevent misuse, content generation, or accidental data leaks. For participants in the Cyber Verification Program, many of those guardrails are relaxed. The trade‑off is that the program includes its own verification steps to ensure the models are used responsibly. In practice, this means a security analyst can ask Claude to generate a proof‑of‑concept exploit description or walk through a vulnerability assessment without hitting the same safety blocks that a general‑purpose user would encounter.

## Who qualifies: security professionals and teams

Eligibility hinges on being part of a security operation. The program explicitly targets:

* In‑house security teams at enterprises.
* Managed security service providers (MSSPs).
* Independent security researchers who work on behalf of organizations.

The application process requires proof of a security‑related role, such as a LinkedIn profile indicating a position like “Security Engineer” or documentation showing involvement in penetration testing projects. Anthropic reviews each request to confirm the intent aligns with the program’s cybersecurity focus.

## Use cases: penetration testing and threat hunting

Participants report using the relaxed Claude access for concrete tasks:

* **Penetration testing scenarios** – asking Claude to outline steps for exploiting a known vulnerability in a controlled lab environment.
* **Red‑team planning** – generating mock adversary tactics, techniques, and procedures (TTPs) for internal exercises.
* **Threat intelligence drafting** – summarizing recent CVE reports and suggesting mitigation steps.

These examples illustrate how the reduced safety limits enable hands‑on security work that would otherwise be blocked by standard content policies.

## How the program works: request and verification

The process is straightforward:

1. **Submit an application** via Anthropic’s Cyber Verification portal, providing organizational details and role verification.
2. **Receive a temporary API key** after approval. The key is scoped to the Cyber Verification Program and cannot be used for non‑security workloads.
3. **Integrate the key** into existing security tools or custom scripts. The API endpoint remains the same as the public Claude API, but the safety filter configuration is switched to the program’s relaxed mode.
4. **Monitor usage** through built‑in audit logs. Anthropic may perform random audits to ensure compliance with the program’s intended use.

The verification step is designed to catch misuse early, protecting both the user and the model’s reputation.

## Potential risks and concerns

Even with a security‑focused program, reduced safety settings introduce new risks:

* **Accidental data leakage** – lower guardrails may allow prompts that inadvertently expose sensitive information.
* **Model misuse** – malicious actors who gain legitimate program access could still weaponize the model for harmful research.
* **Regulatory compliance** – organizations must ensure that any Claude‑driven testing stays within legal boundaries, especially when testing production systems.

Anthropic advises participants to follow their internal security policies and to document all interactions with Claude for audit purposes.

## How other vendors compare

Other AI providers have similar initiatives:

* **OpenAI** offers a “Red Team” program that grants limited access to GPT models for security research, but the safety filters remain largely intact.
* **Google**’s “Titan” security partnership focuses on cloud security validation, not on penetration testing assistance.
* **Microsoft**’s “Azure OpenAI Service” includes enterprise‑grade safety settings that cannot be easily relaxed, even for security teams.

Anthropic’s approach is distinctive in that it specifically lowers safety controls while maintaining a verification framework, positioning it as the most permissive option for hands‑on security work among the major AI vendors.

## Try it yourself: a quick API example

Below is a minimal example of how a security analyst might call Claude from the command line after obtaining a Cyber Verification API key. Replace `YOUR_API_KEY` and `YOUR_MODEL` with the values provided by Anthropic.

```bash
curl -X POST https://api.anthropic.com/v1/complete \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "claude-3-5-sonnet-20241022",
    "prompt": "\n\nHuman: Outline the steps to perform a safe, authorized penetration test on a vulnerable web application.\nAssistant:",
    "max_tokens": 300,
    "temperature": 0.2,
    "stop": ["\n\nHuman:"]
  }'
```

Running this command will return a structured response that can be logged and used in a security workflow. Remember to keep the API key confidential and only use it for approved security tasks.

---

### Key takeaways

* Anthropic’s Cyber Verification Program now admits a larger group of security teams.
* Safety restrictions are relaxed, but participants must pass a role‑based verification process.
* Primary uses include penetration testing outlines, red‑team planning, and threat intelligence drafting.
* The program requires API key scoping and maintains audit logs to ensure responsible use.
* Compared with peers, Anthropic offers the most permissive safety settings for security‑focused AI work.