"""Score stage: deterministic ranking of candidate stories.

Pure functions -> unit-testable. Combines recency, engagement, and topic fit
(boost if the title mentions one of your configured topics).

Lane-aware: when an item carries a `lane` field (set by the pipeline from
LANE_SECTION), topic fit is measured against that lane's LANE_TOPICS entities/
concepts instead of one flat regex, so an AI/ML story can't win a Hardware slot
on a stray "GPU" mention.

Canonical scale is 0-10 EVERYWHERE (score(), mock mode, curate LLM path, and the
LLM-error fallback) so a flaky LLM call never silently deprioritizes an item.
"""
from __future__ import annotations

import datetime as dt
import re

# Single source of truth: per-lane topics of interest (entities + concepts).
try:
    from ..config import LANE_TOPICS
except Exception:  # pragma: no cover - config import guard
    LANE_TOPICS = {}

# Entity vs concept weighting. Exact-entity hits (Claude, Cursor, CVE) are far
# less noisy than fuzzy concepts (agentic AI, prompt injection), so they score 3x.
ENTITY_BOOST = 3.0
CONCEPT_BOOST = 1.0

# Flat fallback regex for cross-lane / no-lane items. NOTE: deliberately drops the
# old bare "cloud" token — it false-positived on "iCloud storage tips" etc.
TOPIC_WORDS = re.compile(
    r"\b(ai|ml|llm|gpt|gpt-5|chatgpt|openai|codex|claude|anthropic|gemini|"
    r"llama|mistral|groq|ollama|openclaw|opencode|qwen|deepseek|mixtral|"
    r"neural|open ?source|github|python|data|agent|agentic|robotic|quantum|"
    r"security|router|llm router|inference|fine- ?tun|rag|embedding|"
    r"free tier|free model|open weight|model release|api)\b",
    re.I,
)


def _age_score(published: str, now: dt.datetime | None = None) -> float:
    """Recency on a 0-1 scale with an ~18h half-life (cron runs hourly, so very
    old stories should not stay competitive)."""
    now = now or dt.datetime.now(dt.timezone.utc)
    try:
        t = dt.datetime.fromisoformat(published.replace("Z", "+00:00"))
        if t.tzinfo is None:
            t = t.replace(tzinfo=dt.timezone.utc)
    except Exception:
        return 0.3  # unknown date -> neutral
    days = max((now - t).total_seconds() / 86400.0, 0.0)
    half_life_days = 0.75  # ~18h
    return float(0.5 ** (days / half_life_days))


def _source_kind(item: dict) -> str:
    src = str(item.get("source", "")).lower()
    url = str(item.get("url", "")).lower()
    if "hacker news" in src or "hn" in src:
        return "hn"
    if "github" in src or "github" in url:
        return "github"
    if "reddit" in src or "reddit" in url or src.startswith("r/"):
        return "reddit"
    if "arxiv" in src or "arxiv" in url:
        return "arxiv"
    return "generic"


def _engagement_score(item: dict) -> float:
    """Per-source normalized engagement on 0-1. HN points, GitHub stars, and
    Reddit upvotes are NOT comparable at one global divisor, so each is capped
    against a typical high value for that source."""
    s = item.get("score_hint", 0) or 0
    if s <= 0:
        return 0.0
    cap = {
        "hn": 600.0,       # HN front-page points
        "github": 4000.0,  # GitHub stars on a trending repo
        "reddit": 1500.0,  # Reddit upvotes
        "arxiv": 1.0,      # not engagement-driven
        "generic": 1000.0,
    }[_source_kind(item)]
    return min(1.0, s / cap)


def _topic_fit(title: str, lane: str | None = None) -> float:
    """0-1 topic fit. With a lane, match against that lane's LANE_TOPICS entities
    (3x) and concepts (1x). Without a lane, fall back to the flat regex (entities
    only, since we can't disambiguate concepts cross-lane)."""
    title = title or ""
    if lane and lane in LANE_TOPICS:
        entities, concepts = _lane_terms(lane)
        e_hits = len(entities.findall(title))
        c_hits = len(concepts.findall(title))
        raw = e_hits * ENTITY_BOOST + c_hits * CONCEPT_BOOST
        return min(1.0, raw / 6.0)
    # Cross-lane fallback: flat regex (no bare 'cloud' token).
    return min(1.0, len(TOPIC_WORDS.findall(title)) / 3.0)


# Per-lane compiled regexes (entities vs concepts), lazily built.
_LANE_RX: dict[str, tuple[re.Pattern, re.Pattern]] = {}


def _lane_terms(lane: str) -> tuple[re.Pattern, re.Pattern]:
    if lane in _LANE_RX:
        return _LANE_RX[lane]
    terms = [str(t).strip() for t in LANE_TOPICS.get(lane, [])]
    # Entities: capitalized proper nouns / specific product names / CVE etc.
    entity_kw = [
        t for t in terms
        if re.search(r"[A-Z]{2,}|claude|gpt|codex|cursor|copilot|openclaw|opencode|"
                    r"cve|llm router|mixtral|llama|mistral|qwen|deepseek|gemini|"
                    r"openai|anthropic|hugging ?face", t, re.I)
    ]
    # Concepts: the rest (phrases like "agentic AI", "prompt injection", "free tiers")
    concept_kw = [t for t in terms if t not in entity_kw]
    ent = re.compile(r"\b(" + "|".join(re.escape(e) for e in entity_kw) + r")\b", re.I) if entity_kw else re.compile(r"(?!x)x")
    con = re.compile(r"\b(" + "|".join(re.escape(c) for c in concept_kw) + r")\b", re.I) if concept_kw else re.compile(r"(?!x)x")
    _LANE_RX[lane] = (ent, con)
    return ent, con


def _length_penalty(title: str) -> float:
    """Short, punchy headlines are GOOD. Only dock very long titles (>90 chars),
    which tend to be run-on SEO junk. Low weight."""
    return 1.0 if len(title) <= 90 else 0.85


def score(item: dict, now: dt.datetime | None = None) -> float:
    """Canonical 0-10 score. Higher = better story for the blog.

    NOTE: rounded to 4 (not 2) decimals on purpose — sub-0.01 engagement
    differences between candidates must survive so pick() ordering is stable.
    """
    lane = item.get("lane")
    return round(
        (
            _age_score(item.get("published", ""), now) * 3.0      # 0-3
            + _engagement_score(item) * 3.0                        # 0-3
            + _topic_fit(item.get("title", ""), lane) * 3.0        # 0-3
            + _length_penalty(item.get("title", "")) * 1.0         # ~0-1
        ),
        4,
    )


def best_lane(title: str, source: str = "") -> str | None:
    """Route a title to the lane whose LANE_TOPICS entities/concepts match best.

    Falls back to a source-based heuristic when no keyword matches, so items
    never land in 'Uncategorized' and all six lanes stay populated.
    """
    best = None
    best_raw = 0.0
    for lane, terms in LANE_TOPICS.items():
        ent, con = _lane_terms(lane)
        raw = len(ent.findall(title)) * ENTITY_BOOST + len(con.findall(title)) * CONCEPT_BOOST
        if raw > best_raw:
            best_raw = raw
            best = lane
    if best is not None:
        return best
    # No keyword hit -> route by source so every lane can receive content.
    s = (source or "").lower()
    if any(k in s for k in ("github", "opensource", "open source", "lobsters", "dev.to", "devto")):
        return "Open Source"
    if any(k in s for k in ("reddit", "r/", "hacker news", "hn", "verge", "arstechnica", "tomshardware")):
        return "Hardware / Consumer Tech" if any(t in s for t in ("tomshardware", "hardware")) else "Big Tech"
    if any(k in s for k in ("anthropic", "openai", "google", "meta", "microsoft", "apple", "amazon")):
        return "Big Tech"
    if any(k in s for k in ("the hacker", "hackers", "security", "dark reading", "bleeping")):
        return "Security"
    if any(k in s for k in ("arxiv", "simonwillison", "marktechpost", "thedecoder")):
        return "AI / ML"
    return "AI / ML"  # last-resort default so nothing is Uncategorized


def pick(items: list[dict], n: int = 1, now: dt.datetime | None = None) -> list[dict]:
    """Top-n by score (lane-aware if items carry `lane`)."""
    def key(it):
        fs = it.get("final_score")
        return fs if isinstance(fs, (int, float)) else score(it, now)
    return sorted(items, key=key, reverse=True)[:n]


def pick_per_lane(items: list[dict], per_lane: int = 1, now: dt.datetime | None = None) -> list[dict]:
    """Rank WITHIN each lane so one lane can't crowd out another. Items without a
    `lane` are routed via best_lane(). Returns up to per_lane per lane."""
    buckets: dict[str, list[dict]] = {}
    for it in items:
        lane = it.get("lane") or best_lane(it.get("title", ""), it.get("source", "")) or "Uncategorized"
        buckets.setdefault(lane, []).append(it)
    out: list[dict] = []
    for lane, bucket in buckets.items():
        out.extend(pick(bucket, per_lane, now))
    return out


def curate(cfg, items: list[dict], mock: bool = False) -> list[dict]:
    """Curation stage: cheap-LLM scoring of every candidate (serial, rate-limit safe).

    Attaches `final_score` (0-10) to each item. Falls back to score() (ALSO 0-10)
    when no LLM is configured or on LLM blip, so the scale never mismatches.
    """
    if not items:
        return items
    if mock:
        for it in items:
            it["final_score"] = round(5.0 + _topic_fit(it.get("title", ""), it.get("lane")) * 5.0, 2)
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
            it["final_score"] = float(_json.loads(raw[raw.find("{"): raw.rfind("}") + 1])["score"])
        except Exception as e:
            # FIX: fallback is score() which is already 0-10 — no scale mismatch.
            it["final_score"] = round(score(it), 2)
            it["curation_note"] = f"fallback: {e}"
    return items


def best_curated(items: list[dict]) -> float | None:
    scores = [it.get("final_score") for it in items if isinstance(it.get("final_score"), (int, float))]
    return max(scores) if scores else None
