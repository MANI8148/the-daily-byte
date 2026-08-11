"""Write stage: LLM article generation + frontmatter parsing.

Works with any OpenAI-compatible /chat/completions endpoint. Mock mode injects a
canned article so the whole pipeline runs with no API key (used by tests and dry runs).
"""
from __future__ import annotations

import json
import os
import re
import time
import urllib.error

from .. import prompts
from ..net import post_json, post_json_curl

FRONTMATTER_RE = re.compile(r"^---\s*\n(.*?)\n---\s*\n*(.*)$", re.S)


def parse_frontmatter(md: str) -> tuple[dict, str]:
    """Returns (frontmatter dict, body markdown). Tolerant parser, zero deps."""
    m = FRONTMATTER_RE.match(md)
    if not m:
        return {}, md
    fm, body = m.group(1), m.group(2)
    data: dict = {}
    for line in fm.splitlines():
        if ":" not in line:
            continue
        k, _, v = line.partition(":")
        k, v = k.strip(), v.strip()
        if v.startswith("[") and v.endswith("]"):
            v = [t.strip().strip("'\"") for t in v[1:-1].split(",") if t.strip()]
        elif v.lower() in ("true", "false"):
            v = v.lower() == "true"
        data[k] = v
    return data, body


def slugify(title: str) -> str:
    s = re.sub(r"[^a-z0-9]+", "-", title.lower()).strip("-")
    return s[:70] or "post"


def chat_via_opencode(cfg, messages: list[dict]) -> str | None:
    """4th LLM tier: run the prompt through the opencode CLI (own account quota —
    a separate pool from Groq/OpenRouter free caps). `opencode` on PATH, or
    OPENCODE_BIN. CI passes OPENCODE_API_KEY; local runs use `opencode auth` login."""
    import subprocess

    system = messages[0]["content"] if len(messages) > 1 else ""
    last = messages[-1]["content"]
    cmd = [cfg.opencode_bin, "run", f"{system}\n\n{last}".strip(), "--format", "json"]
    if cfg.opencode_model:
        cmd += ["--model", cfg.opencode_model]
    env = dict(os.environ)
    if os.environ.get("OPENCODE_API_KEY"):
        env.setdefault("OPENCODE_API_KEY", os.environ["OPENCODE_API_KEY"])
    proc = subprocess.run(cmd, capture_output=True, text=True, timeout=240, env=env)
    if proc.returncode != 0:
        raise RuntimeError(f"opencode exited {proc.returncode}: {proc.stderr.strip()[:150]}")
    parts = []
    for line in proc.stdout.splitlines():
        try:
            obj = json.loads(line)
        except ValueError:
            continue
        if obj.get("type") == "text":
            txt = obj.get("part", {}).get("text", "")
            if txt:
                parts.append(txt)
    out = "\n".join(parts).strip()
    return out or None


def _chat(cfg: Config, messages: list[dict], max_tokens: int = 2000, model: str | None = None) -> str:
    """OpenAI-compatible chat call with a fallback chain.

    Primary endpoint (cfg.llm_base_url) is tried first; on rate-limit (429),
    auth (401/403), server errors (5xx) or network failures, each configured
    fallback (cfg.llm_fallbacks) is tried in order — "use any key if we hit limits".
    """
    model = model or cfg.llm_model
    endpoints: list[dict] = [
        {"base_url": cfg.llm_base_url.rstrip("/"), "api_key": cfg.llm_api_key, "model": model},
        *[
            {"base_url": f["base_url"], "api_key": f["api_key"], "model": f["model"] or model}
            for f in cfg.llm_fallbacks
        ],
    ]

    last_err: Exception | None = None
    for i, ep in enumerate(endpoints):
        if not ep["api_key"]:
            continue
        try:
            data = post_json(
                f"{ep['base_url']}/chat/completions",
                {"model": ep["model"], "messages": messages, "max_tokens": max_tokens},
                headers={"Authorization": f"Bearer {ep['api_key']}"},
                timeout=180,
            )
            if i > 0:
                print(f"  [llm] rate-limit/down on primary — used fallback #{i} ({ep['base_url']})")
            content = None
            if isinstance(data, dict):
                msg = (data.get("choices") or [{}])[0].get("message") or {}
                content = msg.get("content")
            if content and content.strip():
                return content
            last_err = RuntimeError(f"empty content from {ep['base_url']}")
            print(f"  [llm] {ep['base_url']} returned empty content; trying next endpoint")
            continue
        except urllib.error.HTTPError as e:
            last_err = e
            if e.code == 403:
                # Some providers' edges TLS-fingerprint Python urllib (Groq: 403
                # from urllib, 200 from curl, same host/key). Rescue via curl once.
                try:
                    data = post_json_curl(
                        f"{ep['base_url']}/chat/completions",
                        {"model": ep["model"], "messages": messages, "max_tokens": max_tokens},
                        headers={"Authorization": f"Bearer {ep['api_key']}"},
                        timeout=180,
                    )
                    content = None
                    if isinstance(data, dict):
                        msg = (data.get("choices") or [{}])[0].get("message") or {}
                        content = msg.get("content")
                    if content and content.strip():
                        if i > 0:
                            print(f"  [llm] rate-limit/down on primary — used fallback #{i} ({ep['base_url']})")
                        return content
                    raise KeyError("empty content via curl rescue")
                except Exception as e2:
                    last_err = e2
                    print(f"  [llm] {ep['base_url']} -> 403 (urllib) and curl rescue failed ({type(e2).__name__}); trying next endpoint")
                    continue
            if e.code in (429, 401, 500, 502, 503, 504):
                print(f"  [llm] {ep['base_url']} -> HTTP {e.code}; trying next endpoint")
                continue
            raise
        except urllib.error.URLError as e:
            last_err = e
            print(f"  [llm] {ep['base_url']} unreachable ({e.reason}); trying next endpoint")
            continue
    # Last tier: opencode CLI — a separate quota pool (the account's own credits),
    # so Groq/OpenRouter free caps never dead-end the paper.
    try:
        out = chat_via_opencode(cfg, messages)
        if out:
            print(f"  [llm] used opencode CLI fallback ({cfg.opencode_model or 'default model'})")
            return out
    except Exception as e:
        last_err = e
        print(f"  [llm] opencode CLI failed: {type(e).__name__}: {str(e)[:120]}")
    raise RuntimeError(f"All {len(endpoints)} LLM endpoints + opencode CLI failed") from last_err


def chat_via_opencode(cfg, messages: list[dict]) -> str | None:
    """Run the prompt through the opencode CLI (own account quota).

    Needs `opencode` on PATH (or OPENCODE_BIN) and an authenticated account /
    OPENCODE_API_KEY. Output is JSON-lines; we join the text parts.
    """
    import subprocess

    system = messages[0]["content"] if len(messages) > 1 else ""
    last = messages[-1]["content"]
    prompt = f"{system}\n\n{last}".strip()
    cmd = [cfg.opencode_bin, "run", prompt, "--format", "json"]
    if cfg.opencode_model:
        cmd += ["--model", cfg.opencode_model]
    proc = subprocess.run(cmd, capture_output=True, text=True, timeout=240)
    if proc.returncode != 0:
        raise RuntimeError(f"opencode exited {proc.returncode}: {proc.stderr.strip()[:150]}")
    parts = []
    for line in proc.stdout.splitlines():
        try:
            obj = json.loads(line)
        except ValueError:
            continue
        if obj.get("type") == "text":
            txt = (obj.get("part") or {}).get("text") or ""
            if txt:
                parts.append(txt)
    return "\n".join(parts).strip() or None


def _yaml_quote(s: str) -> str:
    """Frontmatter scalars must be valid YAML: quote anything with ':', '#',
    leading/trailing spaces, or characters YAML treats specially (repo names
    like 'foo/bar: X — Y' are the common killer)."""
    if s is None:
        return '""'
    s = str(s)
    if (
        not s
        or s != s.strip()
        or any(ch in s for ch in ':#{}[],&*?|<>=\'%"!@\\`')
    ):
        return '"' + s.replace("\\", "\\\\").replace('"', '\\"') + '"'
    return s


def _mock_article(brief: dict) -> str:
    title = brief.get("title", "Mock topic")
    src = brief.get("source", "the news desk")
    url = brief.get("url", "#")
    return f"""---
title: {_yaml_quote(title[:60])}
kicker: AI
description: {_yaml_quote(f"A practical explainer of {title[:70]} for students, with concrete examples and key takeaways.")}
slug: {slugify(title)}
tags: [ai, ml, tutorial]
url: {_yaml_quote(url)}
source: {_yaml_quote(src)}
status: draft
---

**{title}** — this is why {src} matters this week. Students following AI and ML should care because it changes what tools, papers, and job descriptions look like next semester. The full source is linked below; every claim in this article traces to it.

## What's actually going on

THE DAILY BYTE — all the intelligence fit to print. A student daily covering AI, ML, open source, GitHub, and developer skills, written in English. Every dispatch is tracked fresh from the open web — Hacker News, GitHub Trending, arXiv, and Reddit — then rewritten from primary sources with every claim linked. Nothing invented, nothing republished.

We cover the concrete facts from [{src}]({url}) — nothing invented, no fabricated numbers. If the original piece gives a figure, we repeat it with the source link right there so you can verify in one click. That habit is the entire editorial promise: source-linked journalism for students.

## Why it matters for students

Learning about this now means you graduate ahead of the curve. Employers in 2026 ask two questions: can you direct an AI agent to write correct code, and can you tell when its output is wrong? Reading and explaining fresh developments trains exactly that second muscle — verification.

Try it yourself: open the source, extract the three strongest claims, and check each one against the actual repository or paper. If you can do that for every article you read this month, you will outperform most candidates at interviews.

## How to go deeper

- Clone the repository or read the paper from the link above.
- Build the toy version: even a broken implementation teaches more than a perfect summary.
- Write your own explainer in your own words; the writing is where understanding firms up.

## Key takeaways

- This topic is trending this week and worth one focused hour of study
- Always verify claims against the linked source before sharing
- Mock mode: set OPENAI_API_KEY to get real LLM writing
"""


def generate(cfg, brief: dict, mock: bool = False) -> tuple[str, str] | None:
    """Returns (markdown_doc, model) or None on unrecoverable failure."""
    if mock:
        return _mock_article(brief), "mock"
    if not cfg.has_llm():
        return None

    system = prompts.SYSTEM_PROMPT.format(site=cfg.site_name)
    user = prompts.WRITE_PROMPT.format(site=cfg.site_name, **brief)

    for attempt in range(cfg.max_llm_retries + 1):
        try:
            raw = _chat(cfg, [{"role": "system", "content": system}, {"role": "user", "content": user}], max_tokens=2200)
            m = re.search(r"```markdown\s*\n(.*?)\n```", raw, re.S)
            doc = m.group(1) if m else raw.strip()
            fm, body = parse_frontmatter(doc)
            if not fm.get("title") or not body.strip():
                raise ValueError("article missing title/body")

            # Normalize: re-emit frontmatter with YAML-safe quoting so any
            # LLM-produced title/description containing ':' / '#' / unicode
            # never breaks parser-safety in content/, the site build, or dev.to.
            fm["title"] = str(fm.get("title", ""))[:70]
            fm["description"] = str(fm.get("description", ""))[:200]
            fm["slug"] = str(fm.get("slug") or slugify(fm["title"]))
            # Source provenance comes from the brief, never the LLM — this is what
            # powers the READ THE ORIGINAL button on the site.
            fm["url"] = str(brief.get("url", ""))
            fm["source"] = str(brief.get("source", ""))
            keys = ["title", "kicker", "description", "slug", "date", "author", "tags", "status", "url", "source"]
            outs = []
            for k in keys:
                v = fm.get(k)
                if v is None:
                    continue
                outs.append(f"{k}: {_yaml_quote(v) if not isinstance(v, list) else '[' + ', '.join(_yaml_quote(str(t)) for t in v) + ']'}")
            doc = "\n".join(["---", *outs, "---", ""]) + body
            return doc, cfg.llm_model
        except Exception as e:
            if attempt >= cfg.max_llm_retries:
                print(f"  [write] LLM failed after retries: {e}")
                return None
            time.sleep(2 * (attempt + 1))