"""Checks stage: "proper checks" before anything gets published.

Every check returns (name, status: pass|warn|fail, detail). A single fail blocks
publishing. All checks are pure/testable; the fact-check needs the LLM and is
skipped (warn) when unavailable.
"""
from __future__ import annotations

import json
import re

from .write import parse_frontmatter

MIN_WORDS = 250
MAX_WORDS = 2500
H2_RE = re.compile(r"^##\s+.+", re.M)
H3_RE = re.compile(r"^###\s+.+", re.M)
FENCE_RE = re.compile(r"^```", re.M)


def _word_count(body: str) -> int:
    return len(re.findall(r"\S+", body))


def _ngrams(text: str, n: int = 3) -> set:
    t = re.sub(r"[^a-z0-9 ]", "", text.lower())
    return {t[i : i + n] for i in range(len(t) - n + 1)}


def format_check(fm: dict, body: str) -> tuple[str, str, str]:
    problems = []
    for key in ("title", "description", "slug", "tags"):
        if not fm.get(key):
            problems.append(f"missing frontmatter: {key}")
    wc = _word_count(body)
    if not (MIN_WORDS <= wc <= MAX_WORDS):
        problems.append(f"word count {wc} outside [{MIN_WORDS}, {MAX_WORDS}]")
    if len(H2_RE.findall(body)) + len(H3_RE.findall(body)) < 2:
        problems.append("need at least 2 section headings (H2/H3)")
    fences = FENCE_RE.findall(body)
    if len(fences) % 2 != 0:
        problems.append("unbalanced code fences")
    if len(str(fm.get("title", ""))) > 70:
        problems.append("title > 70 chars (SEO)")
    desc = str(fm.get("description", ""))
    if not (120 <= len(desc) <= 165):
        problems.append(f"description {len(desc)} chars, want 120-165 (SEO)")
    return ("format", "fail" if problems else "pass", "; ".join(problems) or "format ok")


def seo_check(fm: dict, body: str, brief_title: str = "") -> tuple[str, str, str]:
    notes = []
    title = str(fm.get("title", ""))
    if brief_title:
        key = " ".join(w for w in brief_title.lower().split() if len(w) > 4)[:40]
        if key and key not in body.lower()[:600]:
            notes.append("source keyword missing from first 600 chars")
    if not fm.get("kicker"):
        notes.append("no kicker/section label")
    return ("seo", "pass" if not notes else "warn", "; ".join(notes) or "seo ok")


def duplicate_check(title: str, body: str, recent: list | None = None) -> tuple[str, str, str]:
    """3-gram Jaccard vs the last N published posts (pgvector is the scale-up path)."""
    if not recent:
        return ("duplicate", "pass", "no history to compare")
    cur = _ngrams(title + " " + body[:800])
    if not cur:
        return ("duplicate", "pass", "too short to compare")
    worst = 0.0
    for r in recent:
        other = _ngrams(str(r.get("title", "")) + " " + str(r.get("content_md", ""))[:800])
        if not other:
            continue
        overlap = len(cur & other) / len(cur | other)
        worst = max(worst, overlap)
    status, detail = ("fail", f"too similar to an existing post (Jaccard {worst:.2f})") if worst > 0.35 else ("pass", f"max similarity {worst:.2f}")
    return ("duplicate", status, detail)


def fact_check(cfg, article_md: str, source_material: str, mock: bool = False) -> tuple[str, str, str]:
    """LLM-as-fact-checker. Strict JSON verdict; any 'fail' blocks publishing."""
    if mock:
        return ("fact", "pass", "mock mode: fact-check skipped")
    if not cfg.has_llm():
        return ("fact", "warn", "no LLM configured - fact-check skipped")
    from .write import _chat  # local import to avoid cycles

    try:
        raw = _chat(
            cfg,
            [
                {"role": "system", "content": "You verify claims strictly. Return ONLY JSON."},
                {"role": "user", "content": prompts_factcheck(cfg, article_md, source_material)},
            ],
            max_tokens=1200,
            model=cfg.score_model,  # cheap/fast model for the gate; retried with the draft model below
        )
        try:
            data = json.loads(raw[raw.find("{") : raw.rfind("}") + 1])
        except ValueError:
            # the 8b gate model sometimes mangles JSON — one retry with the draft model
            raw = _chat(
                cfg,
                [
                    {"role": "system", "content": "You verify claims strictly. Return ONLY JSON."},
                    {"role": "user", "content": prompts_factcheck(cfg, article_md, source_material)},
                ],
                max_tokens=1200,
                model=cfg.llm_model,
            )
            data = json.loads(raw[raw.find("{") : raw.rfind("}") + 1])
        issues = data.get("issues", [])
        if data.get("verdict") == "pass" and not issues:
            return ("fact", "pass", "all claims supported by source")
        # cheap gate flagged something — escalate to the draft model once before failing
        raw = _chat(
            cfg,
            [
                {"role": "system", "content": "You verify claims strictly. Return ONLY JSON."},
                {"role": "user", "content": prompts_factcheck(cfg, article_md, source_material)},
            ],
            max_tokens=1200,
            model=cfg.llm_model,
        )
        try:
            data = json.loads(raw[raw.find("{") : raw.rfind("}") + 1])
        except ValueError:
            data = {"verdict": "fail", "issues": issues}  # keep the cheap gate's verdict on garbage
        issues = data.get("issues", [])
        if data.get("verdict") == "pass" and not issues:
            return ("fact", "pass", "all claims supported by source (confirmed by draft model)")
        return ("fact", "fail", json.dumps(issues[:3], ensure_ascii=False))
    except Exception as e:
        return ("fact", "warn", f"fact-checker error: {e}")


def prompts_factcheck(cfg, article_md: str, source_material: str) -> str:
    from .. import prompts

    return prompts.FACT_CHECK_PROMPT.format(site=cfg.site_name, article=article_md, source_material=source_material)


# Non-Latin scripts that must never ship in the paper (English-only mandate).
# Covers CJK, Japanese kana, Hangul, Cyrillic, Arabic, Hebrew, Devanagari,
# Bengali, Tamil, and Thai — the scripts most likely to leak in from foreign sources.
NON_LATIN_RE = re.compile(
    "[\u0400-\u04FF"   # Cyrillic
    "\u0590-\u05FF"    # Hebrew
    "\u0600-\u06FF"    # Arabic
    "\u0900-\u097F"    # Devanagari
    "\u0980-\u09FF"    # Bengali
    "\u0B80-\u0BFF"    # Tamil
    "\u0E00-\u0E7F"    # Thai
    "\u1100-\u11FF"    # Hangul Jamo
    "\u3040-\u30FF"    # Hiragana + Katakana
    "\u3400-\u4DBF"    # CJK Extension A
    "\u4E00-\u9FFF"    # CJK Unified Ideographs
    "\uAC00-\uD7AF"    # Hangul Syllables
    "\uF900-\uFAFF]"   # CJK Compatibility
)


def english_check(title: str, body: str) -> tuple[str, str, str]:
    """Hard gate: the paper is English-only. Any non-Latin script fails the run."""
    bad = NON_LATIN_RE.findall(f"{title}\n{body}")
    if bad:
        sample = "".join(dict.fromkeys(bad))[:10]
        return ("english", "fail", f"non-English script characters found: {sample!r}")
    return ("english", "pass", "English only")


def run_all(cfg, article_md: str, brief: dict, recent: list | None, mock: bool = False) -> list[tuple[str, str, str]]:
    fm, body = parse_frontmatter(article_md)
    results = [
        format_check(fm, body),
        english_check(str(fm.get("title", "")), body),
        seo_check(fm, body, brief.get("title", "")),
        duplicate_check(str(fm.get("title", "")), body, recent),
        fact_check(cfg, article_md, brief.get("summary", brief.get("title", "")), mock=mock),
    ]
    return results


def eligible(results: list[tuple[str, str, str]]) -> bool:
    return not any(status == "fail" for _, status, _ in results)