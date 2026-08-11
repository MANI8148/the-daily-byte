"""Score stage: deterministic ranking of candidate stories.

Pure function -> unit-testable. Combines recency, engagement, and topic fit
(boost if the title mentions one of your configured topics).
"""
from __future__ import annotations

import datetime as dt
import re

TOPIC_WORDS = re.compile(r"\b(ai|ml|llm|gpt|model|neural|open ?source|github|python|data|agent|robotic|quantum|security|cloud)\b", re.I)


def _age_score(published: str, now: dt.datetime | None = None) -> float:
    now = now or dt.datetime.now(dt.timezone.utc)
    try:
        t = dt.datetime.fromisoformat(published.replace("Z", "+00:00"))
        if t.tzinfo is None:
            t = t.replace(tzinfo=dt.timezone.utc)
    except Exception:
        return 0.3  # unknown date -> neutral
    days = max((now - t).total_seconds() / 86400.0, 0.0)
    return max(0.0, 1.0 - days / 7.0)  # fresh = high


def _engagement_score(item: dict) -> float:
    s = item.get("score_hint", 0) or 0
    if s <= 0:
        return 0.0  # unknown engagement stays neutral, never beats low real engagement
    return min(1.0, s / 1000.0)


def _topic_fit(title: str) -> float:
    return min(1.0, len(TOPIC_WORDS.findall(title)) / 3.0)


def _length_penalty(title: str) -> float:
    return 0.8 if len(title) < 40 else 1.0


def score(item: dict, now: dt.datetime | None = None) -> float:
    """Higher = better story for the blog. 0..~3."""
    return (
        _age_score(item.get("published", ""), now) * 1.0
        + _engagement_score(item) * 0.8
        + _topic_fit(item.get("title", "")) * 1.0
        + _length_penalty(item.get("title", "")) * 0.15
    )


def pick(items: list[dict], n: int = 1, now: dt.datetime | None = None) -> list[dict]:
    """Top-n by curated score (if the curation stage ran) else heuristic score."""

    def key(it):
        fs = it.get("final_score")
        return fs if isinstance(fs, (int, float)) else score(it, now)

    return sorted(items, key=key, reverse=True)[:n]


def curate(cfg, items: list[dict], mock: bool = False) -> list[dict]:
    """Curation stage: cheap-LLM scoring of every candidate (serial, rate-limit safe).

    Attaches `final_score` (0-10) to each item. Falls back to heuristic scoring
    when no LLM is configured, so the pipeline still runs.
    """
    if not items:
        return items
    if mock:
        for it in items:
            it["final_score"] = round(5.0 + _topic_fit(it.get("title", "")) * 5.0, 2)
        return items
    if not cfg.has_llm():
        return items
    from .write import _chat  # local import to avoid circulars
    from ..prompts import SCORE_PROMPT

    model = cfg.score_model or cfg.llm_model
    for it in items:
        try:
            raw = _chat(
                cfg,
                [
                    {"role": "system", "content": "You score stories. Return ONLY JSON."},
                    {
                        "role": "user",
                        "content": SCORE_PROMPT.format(
                            site=cfg.site_name,
                            title=it.get("title", ""),
                            source=it.get("source", "?"),
                            published=it.get("published", ""),
                            summary=it.get("summary", ""),
                        ),
                    },
                ],
                max_tokens=200,
                model=model,
            )
            import json as _json
            it["final_score"] = float(_json.loads(raw[raw.find("{") : raw.rfind("}") + 1])["score"])
        except Exception as e:
            it["final_score"] = round(score(it), 2)  # LLM blip -> heuristic fallback
            it["curation_note"] = f"fallback: {e}"
    return items


def best_curated(items: list[dict]) -> float | None:
    scores = [it.get("final_score") for it in items if isinstance(it.get("final_score"), (int, float))]
    return max(scores) if scores else None