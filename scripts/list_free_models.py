"""List FREE chat models from each configured LLM provider.

Reads keys from .env via worker.Config (same as the pipeline) — keys are never
printed. For each provider it hits the OpenAI-compatible /models endpoint and
prints the free candidates, so you can pick working model IDs for OPENAI_MODEL /
LLM_FALLBACKS instead of guessing IDs that 404.

Usage:
  .venv/bin/python -u scripts/list_free_models.py
"""
from __future__ import annotations

import json
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from worker.config import Config  # noqa: E402


def _get(url: str, key: str, timeout: int = 25) -> dict:
    """GET via curl (system cert store — the container/mac python.org builds
    often lack a CA bundle, which breaks urllib TLS)."""
    import subprocess

    try:
        proc = subprocess.run(
            ["curl", "-sS", "--max-time", str(timeout), "-w", "\n%{http_code}",
             "-H", f"Authorization: Bearer {key}", url],
            capture_output=True, text=True, timeout=timeout + 10,
        )
    except Exception as e:
        return {"ok": False, "code": None, "detail": f"curl failed: {str(e)[:120]}"}
    if proc.returncode != 0:
        return {"ok": False, "code": None, "detail": proc.stderr.strip()[:150]}
    *body_lines, code_line = (proc.stdout or "").split("\n")
    try:
        code = int(code_line.strip())
    except ValueError:
        return {"ok": False, "code": None, "detail": proc.stdout[:150]}
    if code != 200:
        return {"ok": False, "code": code, "detail": "\n".join(body_lines)[:150]}
    try:
        return {"ok": True, "data": json.loads("\n".join(body_lines) or "{}")}
    except ValueError as e:
        return {"ok": False, "code": code, "detail": f"bad JSON: {str(e)[:100]}"}


def _groq_models(cfg: Config) -> None:
    print("== Groq (primary) ==")
    if not cfg.llm_api_key:
        print("  no OPENAI_API_KEY set")
        return
    res = _get(f"{cfg.llm_base_url.rstrip('/')}/models", cfg.llm_api_key)
    if not res["ok"]:
        print(f"  HTTP {res.get('code')}: {res.get('detail')}")
        return
    ids = sorted(m.get("id", "") for m in res["data"].get("data", []) if m.get("id"))
    print(f"  {len(ids)} models available (Groq has no :free suffix — all key-based free tier):")
    for mid in ids[:20]:
        print(f"    - {mid}")


def _openrouter_models(cfg: Config) -> None:
    print("== OpenRouter (fallback #1) ==")
    ors = [f for f in cfg.llm_fallbacks if "openrouter" in f.get("base_url", "")]
    if not ors:
        print("  no openrouter entry in LLM_FALLBACKS")
        return
    key = ors[0]["api_key"]
    res = _get("https://openrouter.ai/api/v1/models", key)
    if not res["ok"]:
        print(f"  HTTP {res.get('code')}: {res.get('detail')}")
        return
    free = []
    for m in res["data"].get("data", []):
        mid = m.get("id", "")
        pricing = m.get("pricing") or {}
        try:
            is_free = float(pricing.get("prompt", "1") or 0) == 0
        except (TypeError, ValueError):
            is_free = ":free" in mid
        if is_free or mid.endswith(":free"):
            free.append(mid)
    free = sorted(set(free))
    print(f"  {len(free)} FREE models (top picks first):")
    for mid in free[:15]:
        print(f"    - {mid}")


def _tokenrouter_models(cfg: Config) -> None:
    print("== TokenRouter (fallback #2) ==")
    trs = [f for f in cfg.llm_fallbacks if "tokenrouter" in f.get("base_url", "")]
    if not trs:
        print("  no tokenrouter entry in LLM_FALLBACKS")
        return
    fb = trs[0]
    base = fb["base_url"].rstrip("/")
    for path in ("/models", "/v1/models"):
        url = base + path if path not in base else base.replace("/v1", "") + path
        res = _get(url, fb["api_key"])
        if res["ok"]:
            ids = sorted(m.get("id", "") for m in res["data"].get("data", []) if m.get("id"))
            print(f"  {len(ids)} models via {url}:")
            for mid in ids[:20]:
                print(f"    - {mid}")
            return
    print(f"  listing failed (HTTP {res.get('code')}: {res.get('detail')})")


def main() -> None:
    cfg = Config()
    _groq_models(cfg)
    _openrouter_models(cfg)
    _tokenrouter_models(cfg)


if __name__ == "__main__":
    main()
