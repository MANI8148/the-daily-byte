"""Fetch stage: pull candidate stories from free, keyless sources.

OSS upgrade (2026-08-12):
  - feedparser      — robust RSS/Atom parsing (handles malformed feeds, dates)
  - trafilatura     — article-text extraction: enriches thin briefs with the
                      real page content so the LLM writes from substance
  - rapidfuzz       — fuzzy title matching for the dedup ledger (M1 partial)
All calls are serial (rate-limit friendly), timeout-bounded, and never crash
the pipeline — a failing source returns [].
"""
from __future__ import annotations

import datetime as dt
import urllib.parse
import xml.etree.ElementTree as ET

import feedparser
import rapidfuzz.fuzz
import trafilatura

from ..net import get_json, get_text

UA = {"User-Agent": "Mozilla/5.0 (bloggy-worker/1.0; +https://github.com/yourname/bloggy)"}


def _get_json(url: str, timeout: int = 20) -> dict | list:
    return get_json(url, timeout)


def _get_text(url: str, timeout: int = 20) -> str:
    return get_text(url, timeout)


def _dupe(title: str, recent_titles: list[str], cutoff: int = 86) -> bool:
    """Fuzzy dedup: a repost under a slightly different URL/title must not ship twice."""
    if not recent_titles:
        return False
    best = max(rapidfuzz.fuzz.ratio(title.lower(), t.lower()) for t in recent_titles)
    return best >= cutoff


def _enrich(brief: dict, timeout: int = 25) -> dict:
    """Pull the article's main text with trafilatura and upgrade the summary.

    Only called for candidates whose brief is thin — keeps polite, token-free."""
    try:
        html = _get_text(brief["url"], timeout=timeout)
        text = trafilatura.extract(html, include_comments=False, include_tables=False)
    except Exception:
        return brief
    if not text:
        return brief
    flat = " ".join(text.split())
    if len(flat) > len(brief.get("summary", "")) + 60:
        brief["summary"] = flat[:500]
        brief["_enriched"] = True
    return brief


# ---------- sources ----------

def hn_top(n: int = 12) -> list[dict]:
    """Hacker News top stories (free Firebase API, no key)."""
    ids = _get_json("https://hacker-news.firebaseio.com/v0/topstories.json")[:n]
    items = []
    for i in ids:  # serial on purpose
        try:
            it = _get_json(f"https://hacker-news.firebaseio.com/v0/item/{i}.json")
        except Exception:
            continue
        if it and it.get("type") == "story" and it.get("url"):
            items.append(
                {
                    "title": it.get("title", "")[:200],
                    "url": it["url"],
                    "source": "Hacker News",
                    "published": dt.datetime.fromtimestamp(it.get("time", 0), dt.timezone.utc).isoformat(),
                    "score_hint": it.get("score", 0),
                    "summary": f"HN story scoring {it.get('score', 0)} points by {it.get('by', '?')}",
                }
            )
    return items


def github_trending(days: int = 7, n: int = 10) -> list[dict]:
    """Fastest-growing repos this week via the free GitHub search API."""
    since = (dt.date.today() - dt.timedelta(days=days)).isoformat()
    q = urllib.parse.quote(f"created:>{since}")
    data = _get_json(
        f"https://api.github.com/search/repositories?q={q}&sort=stars&order=desc&per_page={n}"
    )
    out = []
    for r in data.get("items", []):
        out.append(
            {
                "title": f"{r['full_name']}: {r.get('description') or 'new open-source project'}",
                "url": r["html_url"],
                "source": "GitHub Trending",
                "published": r.get("created_at", ""),
                "score_hint": r.get("stargazers_count", 0),
                "summary": (
                    f"{r.get('language', '?')} repo, ★{r.get('stargazers_count', 0)}, "
                    f"forks {r.get('forks_count', 0)}. {r.get('description') or ''}"
                )[:400],
            }
        )
    return out


def arxiv(category: str = "cs.AI", n: int = 8) -> list[dict]:
    """Fresh preprints from arXiv (export API, Atom XML)."""
    url = (
        "https://export.arxiv.org/api/query?"
        + urllib.parse.urlencode(
            {"search_query": f"cat:{category}", "sortBy": "submittedDate", "sortOrder": "descending", "max_results": n}
        )
    )
    root = ET.fromstring(_get_text(url))
    ns = {"a": "http://www.w3.org/2005/Atom"}
    out = []
    for e in root.findall("a:entry", ns):
        title = " ".join((e.findtext("a:title", default="", namespaces=ns) or "").split())
        link = e.find("a:id", ns).text if e.find("a:id", ns) is not None else ""
        published = e.findtext("a:published", default="", namespaces=ns) or ""
        summary = " ".join((e.findtext("a:summary", default="", namespaces=ns) or "").split())[:400]
        out.append({"title": title[:200], "url": link, "source": f"arXiv {category}", "published": published, "score_hint": 0, "summary": summary})
    return out


def reddit_top(sub: str = "MachineLearning", n: int = 8) -> list[dict]:
    """Top posts this week on a subreddit (public JSON endpoint)."""
    data = _get_json(f"https://www.reddit.com/r/{sub}/top.json?t=week&limit={n}")
    out = []
    for ch in data.get("data", {}).get("children", []):
        p = ch.get("data", {})
        url = p.get("url") or ""
        if not url or url.startswith("/r/"):
            continue  # self posts have no external link
        out.append(
            {
                "title": p.get("title", "")[:200],
                "url": url,
                "source": f"r/{sub}",
                "published": dt.datetime.fromtimestamp(p.get("created_utc", 0), dt.timezone.utc).isoformat(),
                "score_hint": p.get("score", 0),
                "summary": f"r/{sub} top post, {p.get('score', 0)} upvotes across {p.get('num_comments', 0)} comments",
            }
        )
    return out


def rss(url: str, source_name: str = "RSS", n: int = 8) -> list[dict]:
    """Generic RSS/Atom feed via feedparser (handles RSS 2.0/1.0/Atom, malformed XML,
    and parses pub dates into ISO)."""
    try:
        parsed = feedparser.parse(_get_text(url))
    except Exception:
        return []
    out = []
    for e in parsed.entries:
        title = " ".join((e.get("title") or "").split())
        link = e.get("link") or ""
        if not title or not link:
            continue
        pub = ""
        try:
            pub = e.get("published_parsed") or e.get("updated_parsed")
            if pub:
                pub = dt.datetime(*pub[:6], tzinfo=dt.timezone.utc).isoformat()
        except Exception:
            pub = ""
        desc = " ".join((e.get("summary") or e.get("description") or "").split())[:400]
        out.append({"title": title[:200], "url": link, "source": source_name, "published": pub, "score_hint": 0, "summary": desc})
        if len(out) >= n:
            break
    return out


SOURCES = {
    "hn": lambda cfg: hn_top(cfg.max_candidates),
    "github": lambda cfg: github_trending(n=cfg.max_candidates),
    "arxiv": lambda cfg: arxiv(n=cfg.max_candidates),
    "reddit": lambda cfg: reddit_top(n=cfg.max_candidates),
    "rss": lambda cfg: _rss_bundle(cfg),
}


def _rss_bundle(cfg) -> list[dict]:
    """All configured RSS feeds bundled (feedparser)."""
    out = []
    for feed in cfg.rss_feeds:
        name = urllib.parse.urlparse(feed).netloc.replace("www.", "")
        out.extend(rss(feed, source_name=f"RSS · {name}", n=8))
    return out


def _guarded(fn, cfg) -> list[dict]:
    """One failing source must never abort the others in the 'all' bundle."""
    try:
        return fn(cfg)
    except Exception as e:
        print(f"  [fetch] source skipped: {e}")
        return []


def fetch(name: str, cfg, recent_titles: list[str] | None = None, enrich: int = 6) -> list[dict]:
    """Fetch + dedup (fuzzy) + enrich (trafilatura)."""
    recent_titles = recent_titles or []
    if name == "all":
        items = []
        for key in SOURCES:
            items.extend(_guarded(SOURCES[key], cfg))
    else:
        try:
            items = SOURCES[name](cfg)
        except Exception as e:  # a failing source never kills the run
            print(f"  [fetch:{name}] failed: {e}")
            return []
    fresh = [it for it in items if not _dupe(it["title"], recent_titles)]
    skipped = len(items) - len(fresh)
    # enrich the strongest thin briefs so the LLM writes from real substance
    thin = [it for it in fresh if len(it.get("summary", "")) < 90]
    thin.sort(key=lambda it: it.get("score_hint", 0), reverse=True)
    enriched = 0
    for it in thin[:enrich]:
        _enrich(it)
        if it.get("_enriched"):
            enriched += 1
    print(f"  [fetch:{name}] {len(fresh)} fresh candidates ({skipped} fuzzy-dupes, {enriched} enriched via trafilatura)")
    return fresh
