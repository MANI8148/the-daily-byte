---
title: "Sanitizing LLM API Keys: A Practical Guide"
kicker: SECURITY
description: "Learn how to spot and remove API keys from code that calls proprietary LLMs, protecting your secrets and keeping repos clean."
slug: sanitize-llm-api-keys
date: 2026-08-12
author: Manikanta
tags: ["ai", "ml", "security", "tutorial"]
model: -
---

## Why Your LLM Code Might Be Exposing Secrets

When developers share snippets that call proprietary language‑model APIs—OpenAI, Anthropic, Cohere, or the newer GPT‑5.6 Luna—they often embed authentication tokens directly in the source. A recent Hacker News discussion highlighted how a seemingly innocuous repository could leak *reasoning traces* and API keys, allowing anyone to replicate the model’s behavior or even abuse the service. The post, titled “Stealing Reasoning Traces from Proprietary LLM APIs,” urges teams to sanitize code before publishing.

The risk is twofold:

1. **Credential theft** – an exposed key can be used to bill your account or access private data.
2. **Model misuse** – attackers can reverse‑engineer the prompt logic and generate content that violates policy or copyright.

Because LLM APIs are often accessed via environment variables or inline strings, the problem is easy to overlook. The article recommends a systematic search for patterns like `api_key`, `apikey`, `token`, or `secret`, followed by a careful review to avoid false positives.

## Common Key Patterns in LLM Code

Below are the most frequent ways developers store keys in code:

| Pattern | Typical Usage | Example |
|---------|---------------|---------|
| `OPENAI_API_KEY` | Env var | `export OPENAI_API_KEY="sk-..."` |
| `api_key` | Inline string | `client = OpenAI(api_key="sk-...")` |
| `token` | Header | `headers = {"Authorization": "Bearer <token>"}` |
| `secret` | Config file | `config["secret"] = "sk-..."` |

The Hacker News thread noted that even comments or documentation can contain placeholder keys that look real. A quick grep for `sk-` or `pk-` can surface many of these.

## Step‑by‑Step: Search & Verify

1. **Clone the repo locally**  
   ```bash
   git clone https://github.com/your-org/llm-demo.git
   cd llm-demo
   ```

2. **Run a targeted grep**  
   ```bash
   grep -R -E 'api_key|apikey|token|secret|sk-|pk-' -n .
   ```

   This command lists every line that contains a likely key pattern, along with the file name and line number.

3. **Inspect each hit manually**  
   - If the string is a placeholder (e.g., `"sk-PLACEHOLDER"`), replace it with a comment or a call to `os.getenv`.
   - If it’s a real key, confirm it’s not committed to the repo history. Use `git log -S 'sk-' -- <file>` to see when it first appeared.

4. **Check the commit history**  
   ```bash
   git log --all --grep='sk-' --pretty=format:"%h %an %ad %s"
   ```

   If a key shows up in older commits, you’ll need to rewrite history (see next section).

## Sanitizing Strategies

### 1. Environment Variables

Move all keys out of the codebase:

```python
import os
from openai import OpenAI

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
```

Add a `.env.example` file to the repo:

```dotenv
# .env.example
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 2. Git Filters

If a key has already been committed, use `git filter-repo` (recommended over the older `filter-branch`):

```bash
pip install git-filter-repo
git filter-repo --path <file> --replace-text <(echo "sk-.*=REDACTED")
```

This rewrites the entire history, removing the key from every commit.

### 3. Automated Linting

Integrate a linter that flags hard‑coded secrets. Tools like `detect-secrets` or `truffleHog` can scan the repo before each push:

```bash
pip install detect-secrets
detect-secrets scan > .secrets.baseline
detect-secrets audit .secrets.baseline
```

Add the audit step to your CI pipeline to block pushes that introduce new secrets.

## Testing the Sanitization

After cleaning, run a quick test to ensure the repo no longer contains the key:

```bash
grep -R 'sk-' -n . || echo "No keys found"
```

If the command returns nothing, the key is gone. For extra confidence, clone the repo into a fresh directory and attempt to run the code without setting the environment variable; it should raise a clear error about a missing key.

## Real‑World Example: The Luna Terminal‑Bench

The Hacker News article cited a repo that used the GPT‑5.6 Luna API in a terminal‑bench script. The original code had:

```python
client = OpenAI(api_key="sk-12345abcde")
```

After applying the steps above, the repo now contains:

```python
client = OpenAI(api_key=os.getenv("LUNA_API_KEY"))
```

The `.env.example` file lists the placeholder, and the CI pipeline blocks any accidental re‑commit of the real key. The repo’s public history no longer shows the secret, and the project can be safely shared with the community.

## Key Takeaways

- **Search first**: Use targeted `grep` to locate potential keys before publishing.
- **Move secrets to env vars**: Keep keys out of source files and commit a placeholder `.env.example`.
- **Rewrite history if needed**: `git filter-repo` removes keys from all past commits.
- **Automate detection**: Add secret‑scanning tools to your CI to catch future leaks.
- **Verify**: After sanitization, run a final grep to confirm no keys remain.

By following these steps, you can protect your LLM API credentials, prevent accidental data leaks, and keep your codebase clean and secure.