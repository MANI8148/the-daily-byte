"""Bloggy pipeline: fetch -> score -> write -> checks -> persist -> review -> publish.

One pass = N articles (default 1), always serial (rate-limit friendly). Never raises:
every failure is reported in the summary dict instead.
"""
from __future__ import annotations

from .config import Config
from .stages import checks, fetch, images, publish, score, write
from .supabase import Supabase

# Sentinel so `python -m worker.app run-once --topic ...` can write without a URL.
EDITORIAL_BRIEF_URL = "https://example.com/editorial-assignment"


def _notify(cfg: Config, text: str) -> None:
    """Optional Telegram ping. Failures are logged, never fatal."""
    if not (cfg.telegram_bot_token and cfg.telegram_chat_id):
        return
    try:
        from .net import post_json

        post_json(
            f"https://api.telegram.org/bot{cfg.telegram_bot_token}/sendMessage",
            {"chat_id": int(cfg.telegram_chat_id), "text": text[:4000]},
            timeout=30,
        )
    except Exception as e:
        print(f"  [notify] telegram failed: {e}")


def _draft_one(cfg: Config, db, brief: dict, mock_llm: bool, auto_publish: bool | None) -> dict:
    """Write + check + persist + review + publish a single article. Returns its summary dict."""
    art: dict = {"brief": {k: brief.get(k) for k in ("title", "url", "source", "published", "summary")}}

    # ---- write ----
    result = write.generate(cfg, brief, mock=mock_llm)
    if result is None:
        art["status"] = "write-failed"
        return art
    doc, model = result
    fm, body = write.parse_frontmatter(doc)

    # ---- checks ----
    recent = db.recent_posts(20)
    results = checks.run_all(cfg, doc, brief, recent, mock=mock_llm)
    ok = checks.eligible(results)
    art["checks"] = {name: {"status": st, "detail": det} for name, st, det in results}
    art["eligible"] = ok

    # ---- hard gate: never persist a draft that fails the checks ----
    # A rejection (refusal/stub/bad-format/non-English/duplicate) must NOT become
    # a posted blog. Skip DB insert, site copy, and dedup marking entirely.
    if not ok:
        art["status"] = "rejected"
        art["reason"] = "; ".join(det for _, st, det in results if st == "fail")
        _notify(cfg, f"⛔ Rejected (not posted): {fm.get('title', '?')} — {art['reason']}")
        return art

    # ---- persist draft ----
    post = {
        "title": fm.get("title", ""),
        "slug": fm.get("slug") or write.slugify(fm.get("title", "")),
        "kicker": fm.get("kicker", "TECH"),
        "tags": fm.get("tags") or cfg.default_tags,
        "status": "draft",
        "content_md": doc,
        "source_url": brief.get("url", ""),
        "source_name": brief.get("source", ""),
        "llm_model": model,
        "checks": art["checks"],
    }
    rec = db.insert_post(post)
    post_id = rec.get("id") if isinstance(rec, dict) else None
    # Record the source URL as seen so it is never re-drafted (file ledger in dry-run,
    # Supabase seen_links when configured). This is the durable dedup guarantee.
    try:
        db.mark_seen(brief.get("url", ""))
    except Exception as e:
        print(f"  [dedup] mark_seen failed: {e}")
    image_url = images.run(cfg, fm, brief, model)
    site_path = publish.save_site_copy(cfg, fm, body, model, image_url=image_url)
    art["post_id"] = post_id
    art["site_copy"] = str(site_path) if site_path else None
    art["title"] = post["title"]
    art["source"] = post["source_name"]

    # ---- review gate: git PR (merge triggers the Vercel deploy) ----
    review = None
    if ok:
        review = review_push(cfg, doc, fm)
        if review:
            art["review"] = review
            if review.get("status") == "pr-open":
                art["status"] = "pr-open"

    # ---- publish (gated) ----
    want_publish = (auto_publish if auto_publish is not None else cfg.auto_publish) and ok
    if want_publish:
        pub = publish.dispatch(cfg, fm, body)
        art["publish"] = pub
        if post_id:
            db.set_status(post_id, "published")
            for r in pub:
                db.log_publish(
                    {"post_id": post_id, "platform": r.get("platform"), "status": r.get("status"),
                     "platform_post_url": r.get("url"), "error": r.get("note")}
                )
        art["status"] = "published"
        _notify(cfg, f"✅ Published: {post['title']} {art.get('publish')}")
    elif ok:
        pr_line = f" PR: {review.get('pr_url')}" if review and review.get("status") == "pr-open" else ""
        art["status"] = "draft-ready"
        _notify(cfg, f"📝 Draft ready: {post['title']} (auto-publish off — human gate){pr_line} — approve: {cfg.site_url}/posts/{post['slug']}")

    return art


def run_once(
    cfg: Config,
    source: str = "all",
    topic: str = "",
    mock_llm: bool = False,
    auto_publish: bool | None = None,
    count: int = 1,
) -> dict:
    """One pass = N articles (default 1). Serial everywhere. Never raises.

    If `source == "all"` and lanes are configured, we draft ONE post per lane
    (one AI/ML, one Tech, one Open-Source ...), guaranteeing topic coverage every run.
    `count` overrides the per-lane count when set > 1.
    """
    db = Supabase(cfg.supabase_url, cfg.supabase_key)
    summary = {"source": source, "status": "idle", "articles": []}

    # ---- 1. fetch (token-free) ----
    if topic:
        briefs = [{
            "title": topic,
            "url": EDITORIAL_BRIEF_URL,
            "source": "editorial desk",
            "published": "",
            "summary": f"Staff assignment: {topic}. Research it before writing.",
        } for _ in range(max(count, 1))]
    elif source == "all" and cfg.lanes:
        # Per-lane coverage. To keep each run FAST (3 posts/hr) yet cover ALL topics
        # across the day, we rotate: pick cfg.lanes_per_run lanes, stepping by 2 from an
        # hour-dependent offset, so every lane is hit every 2 runs.
        import datetime as _dt
        hour = _dt.datetime.now(_dt.timezone.utc).hour
        n = len(cfg.lanes)
        step = max(1, n // max(1, cfg.lanes_per_run))
        start = hour % n
        chosen = [cfg.lanes[(start + i * step) % n] for i in range(cfg.lanes_per_run)]
        print(f"  [lanes] run covers {len(chosen)}/{n} lanes (hour={hour}, start={start}, step={step})")
        recent = db.recent_posts(50)
        recent_titles = [str(p.get("title", "")) for p in recent if isinstance(p, dict)]
        seen_urls: set[str] = set()
        per = max(count, 1)  # articles per chosen lane (default 1)
        briefs = []
        for lane_idx, lane_sources in enumerate(chosen):
            lane_label = cfg.lane_section[lane_idx] if lane_idx < len(cfg.lane_section) else "Tech"
            lane_items: list[dict] = []
            for sname in lane_sources:
                try:
                    fetched = fetch.fetch(sname, cfg, recent_titles=recent_titles)
                    for it in fetched:
                        it["lane"] = lane_label  # tag for lane-aware scoring
                    lane_items.extend(fetched)
                except Exception as e:
                    print(f"  [fetch:{sname}] failed: {e}")
            fresh = [it for it in lane_items if not db.seen(it["url"]) and it["url"] not in seen_urls]
            if not fresh:
                continue
            # Rank WITHIN this lane so one lane can't crowd out another.
            picks = score.pick(fresh, per)
            for p in picks:
                seen_urls.add(p["url"])
            briefs.extend(picks)
        if not briefs:
            summary["status"] = "no-candidates"
            return summary
    else:
        recent = db.recent_posts(50)
        recent_titles = [str(p.get("title", "")) for p in recent if isinstance(p, dict)]
        items = fetch.fetch(source, cfg, recent_titles=recent_titles)
        if not items:
            summary["status"] = "no-candidates"
            return summary
        fresh = [it for it in items if not db.seen(it["url"])]
        if not fresh:
            summary["status"] = "all-seen"
            summary["seen_count"] = len(items)
            return summary
        briefs = score.pick(fresh, max(count, 1))

    # ---- 2..6 per article ----
    for brief in briefs:
        summary["articles"].append(_draft_one(cfg, db, brief, mock_llm, auto_publish))

    # pprint-friendly top-level fields (last article wins; status reflects the batch)
    last = summary["articles"][-1] if summary["articles"] else {}
    for k in ("title", "brief", "checks", "eligible", "post_id", "site_copy", "review", "publish"):
        if k in last:
            summary[k] = last[k]
    if summary["articles"]:
        summary["status"] = last.get("status", "ok")
    summary["article_count"] = len(summary["articles"])
    return summary


def review_push(cfg, doc: str, fm: dict) -> dict | None:
    """Push the draft as a git branch + PR (the human review gate)."""
    from .stages import review as review_stage

    try:
        return review_stage.push_pr(cfg, doc, str(fm.get("title", "")), str(fm.get("slug", "post")))
    except Exception as e:
        print(f"  [review] push_pr failed: {e}")
        return {"status": "error", "note": str(e)[:200]}
