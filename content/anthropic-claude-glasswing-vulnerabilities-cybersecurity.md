---
title: Anthropic Opens Claude to Vetted Hackers After Glasswing Finds 129K Bu
kicker: AI SECURITY
description: "Anthropic expands red-team access to Claude models while Project Glasswing logs 129,000 verified vulnerabilities in three months."
slug: anthropic-claude-glasswing-vulnerabilities-cybersecurity
date: 2026-10-08
author: The Daily Byte
tags: ["ai", "security", "vulnerability-research", "anthropic"]
model: llama-3.3-70b-versatile
image_url: "/images/2026-10-08/anthropic-claude-glasswing-vulnerabilities-cybersecurity.jpg"
---

Anthropic is letting vetted cybersecurity researchers stress-test its most capable Claude models with fewer guardrails, citing 129,000 verified software flaws discovered by its automated Project Glasswing pipeline between April and July 2026.

## What Project Glasswing Actually Does

Project Glasswing is Anthropic's internal vulnerability discovery system. It pairs large language models with static analysis tooling to scan codebases at scale. According to the company's Tuesday announcement, the pipeline runs continuous scans across open-source repositories and partner codebases, triaging findings through a combination of automated verification and human review before logging them as "verified" vulnerabilities.

The system does not merely flag suspicious patterns. Each reported flaw undergoes a reproduction step — either in a sandboxed environment or via a generated proof-of-concept — before entering the verified count. That distinction matters: raw LLM output tends to produce high false-positive rates, and Glasswing's verification layer is what separates signal from noise.

## The Numbers Behind the Scan

Between April 1 and July 31, 2026, Glasswing logged **at least 129,000 verified vulnerabilities**. Anthropic has not yet published a breakdown by severity (CVSS distribution), vulnerability class (CWE taxonomy), or language ecosystem. The company also stated it found "an additional" set of findings beyond the 129,000 figure, but the announcement text available at press time was truncated before that number was disclosed.

For context: the National Vulnerability Database (NVD) typically receives 25,000–30,000 new CVE entries per year. If Glasswing's 129,000 verified findings represent unique, deduplicated issues across a three-month window, the throughput suggests automated discovery is now operating at multiples of the traditional disclosure pipeline's capacity.

## Who Gets Access and How

Anthropic's expanded "Claude for Security Research" program targets **vetted cybersecurity professionals** — not the general public. Applicants must demonstrate a track record in vulnerability research, coordinated disclosure, or red-teaming. Accepted researchers receive API access to frontier Claude models with:

- Reduced refusal rates on security-relevant prompts
- Adjusted blocking classifiers that normally intercept exploit-generation requests
- Dedicated rate limits and logging for auditability

The vetting process includes identity verification, a signed rules-of-engagement agreement, and a commitment to coordinated disclosure through Anthropic's bug-bounty platform or the affected vendor's channels. Anthropic has not published the exact acceptance criteria or the current size of the cohort.

## Reduced Safeguards — What That Means in Practice

"Reduced safeguards" does not mean "no safeguards." The models still enforce core safety boundaries: they will not generate actionable exploits against live targets, produce weaponizable payloads, or assist with operational attacks. What changes is the **refusal threshold** for educational and research-oriented prompts.

For example, a standard Claude instance might refuse:
```
"Write a buffer overflow exploit for CVE-2024-XXXX in nginx."
```

A research-mode instance may instead respond with:
```
"I can't generate a working exploit. I can, however, explain the root cause,
show the vulnerable code pattern, and discuss mitigation strategies.
Here's a simplified trigger that demonstrates the crash in a local sandbox..."
```

The distinction is deliberate: researchers need to understand *why* a flaw is exploitable, not just that it exists. Anthropic logs all research-mode interactions for retrospective review.

## Why This Matters for Student Researchers

If you're a student in a security program, this shift changes what's feasible for capstone projects and independent research:

1. **Model-assisted triage** — You can feed Claude a crash trace and ask for root-cause hypotheses, then validate them with a debugger.
2. **Variant generation** — Given a known vulnerability class, the model can suggest related code patterns to audit.
3. **Documentation automation** — Turning a raw finding into a coherent advisory (impact, reproduction steps, remediation) becomes a prompt-engineering task rather than a writing chore.

The catch: you need program access. Anthropic has not announced a student-specific tier. The current path is through academic advisors or research labs that already hold vetted status.

## How to Verify or Replicate the Approach

You can't run Glasswing — it's proprietary — but you can approximate its workflow with open tooling. The following pipeline mirrors the "LLM + static analysis + verification" loop:

```bash
# 1. Pick a target repo (example: a C library)
git clone https://github.com/example/target-lib.git
cd target-lib

# 2. Run a static analyzer (Semgrep, CodeQL, or clang-tidy)
semgrep scan --config=auto --json=output.json .

# 3. Feed high-severity findings to a local LLM for triage
#    (requires ollama or similar; adjust prompt as needed)
cat output.json | jq -r '.results[] | select(.extra.severity=="ERROR") | .extra.message' \
  | head -20 \
  | while read finding; do
      ollama run codellama:13b "You are a security researcher. This static analysis finding: '$finding'. Is it a true positive? Explain reasoning. If yes, provide a minimal reproduction sketch in C."
    done

# 4. For each plausible finding, attempt reproduction in a container
docker run --rm -v $(pwd):/src gcc:latest bash -c "
  cd /src && cat > repro.c <<'EOF'
  // paste the model's reproduction sketch here
EOF
  gcc -o repro repro.c && ./repro
"
```

This is not Glasswing — it lacks deduplication, cross-repository context, and the verification sandbox Anthropic built. But it demonstrates the same *pattern*: static analysis proposes, LLM triages, sandbox verifies.

## Open Questions and Next Steps

Several details remain unclear from the announcement:

- **Deduplication methodology** — Are the 129,000 findings unique CVEs, or do they include multiple instances of the same class across different codebases?
- **False-positive rate post-verification** — Anthropic claims "verified," but has not published the verification success rate or the human-review workload.
- **Disclosure timeline** — How many of these findings have been reported to upstream maintainers? What is the median time-to-fix?
- **Model versioning** — Which Claude model versions power Glasswing? Does the research program use the same weights?

Anthropic says a detailed technical report is forthcoming. Until then, treat the 129,000 figure as a *lower bound* from a single vendor's automated pipeline — impressive, but not yet independently audited.

### Key Takeaways

- Anthropic's Project Glasswing reported **≥129,000 verified vulnerabilities** in three months (Apr–Jul 2026).
- A new **Claude for Security Research** program grants vetted researchers API access with relaxed refusals on security topics.
- **Core safety guardrails remain**; only the refusal threshold for educational/research prompts is adjusted.
- The workflow — **static analysis → LLM triage → sandbox verification** — is reproducible with open-source tooling today.
- **No student tier yet**; access flows through established research labs or individual vetting.
- Full severity breakdown, deduplication logic, and disclosure metrics are **still pending** in a promised technical report.