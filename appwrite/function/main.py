"""Appwrite Function entrypoint — deploy the worker as a scheduled serverless job.

Deploy (from repo root, after installing the Appwrite CLI):
  appwrite login
  appwrite deploy function --functionId bloggy-worker --yes
  appwrite run function --functionId bloggy-worker            # test once
  # then set a schedule in Appwrite console (Functions -> bloggy-worker -> Schedule)

The function reads these env vars (set on the function): OPENAI_API_KEY,
OPENAI_BASE_URL, OPENAI_MODEL, SUPABASE_URL, SUPABASE_SERVICE_KEY,
DEVTO_API_KEY, MEDIUM_TOKEN, HASHNODE_TOKEN, HASHNODE_PUBLICATION,
GHOST_ADMIN_KEY, GHOST_URL, TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, SITE_URL...
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

# Make repo root importable so `worker` package resolves inside the function runtime.
_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(_ROOT))

from worker.config import Config  # noqa: E402
from worker.pipeline import run_once  # noqa: E402


def main(context) -> str:
    """Appwrite Functions Python runtime calls main(context)."""
    cfg = Config()
    source = context.req.headers.get("x-source", "all")
    summary = run_once(cfg, source=source if source in ("all", "hn", "github", "arxiv", "reddit") else "all")
    return json.dumps(summary, default=str)


if __name__ == "__main__":
    # Local smoke test: python appwrite/function/main.py
    print(main(type("C", (), {"req": type("R", (), {"headers": {}})})()))