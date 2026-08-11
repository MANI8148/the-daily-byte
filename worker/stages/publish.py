"""Publish stage: cross-post adapters (dev.to, Medium, Hashnode, Ghost) + site copy.

Each adapter is best-effort: missing key -> skipped with a note, never fatal.
All posts are created as DRAFTS on their platforms by default -- a human pushes
the button, or flips cfg.auto_publish to true once the pipeline proves itself.
"""
from __future__ import annotations

import base64
import hashlib
import hmac
import json
import time
from pathlib import Path

from ..net import post_json


def _ghost_jwt(admin_key: str) -> str:
    """Ghost Admin API key = '<id>:<secret>' -> short-lived HS256 JWT."""
    kid, secret = admin_key.split(":", 1)
    header = base64.urlsafe_b64encode(json.dumps({"alg": "HS256", "typ": "JWT", "kid": kid}).encode()).rstrip(b"=")
    payload = base64.urlsafe_b64encode(json.dumps({"iat": int(time.time()), "exp": int(time.time()) + 300, "aud": "/v3/admin/"}).encode()).rstrip(b"=")
    sig = base64.urlsafe_b64encode(hmac.new(secret.encode(), f"{header.decode()}.{payload.decode()}".encode(), hashlib.sha256).digest()).rstrip(b"=")
    return f"{header.decode()}.{payload.decode()}.{sig.decode()}"


# ---------- adapters ----------

def devto(cfg, fm: dict, body: str) -> dict:
    if not cfg.devto_api_key:
        return {"platform": "dev.to", "status": "skipped", "note": "DEVTO_API_KEY not set"}
    res = post_json(
        "https://dev.to/api/articles",
        {
            "article": {
                "title": fm["title"],
                "body_markdown": body,
                "tags": (fm.get("tags") or cfg.default_tags)[:4],
                "canonical_url": f"{cfg.site_url}/posts/{fm['slug']}",
                "published": False,
                "description": fm.get("description", "")[:165],
            }
        },
        headers={"api-key": cfg.devto_api_key},
    )
    return {"platform": "dev.to", "status": "ok", "id": res.get("id"), "url": res.get("url")}


def medium(cfg, fm: dict, body: str) -> dict:
    if not cfg.medium_token:
        return {"platform": "medium", "status": "skipped", "note": "MEDIUM_TOKEN not set"}
    me = post_json("https://api.medium.com/v1/me", {}, headers={"Authorization": f"Bearer {cfg.medium_token}"})
    uid = me.get("data", {}).get("id")
    res = post_json(
        f"https://api.medium.com/v1/users/{uid}/posts",
        {
            "title": fm["title"],
            "contentFormat": "markdown",
            "content": body,
            "publishStatus": "draft",
            "canonicalUrl": f"{cfg.site_url}/posts/{fm['slug']}",
            "tags": (fm.get("tags") or cfg.default_tags)[:5],
        },
        headers={"Authorization": f"Bearer {cfg.medium_token}"},
    )
    return {"platform": "medium", "status": "ok", "id": res.get("data", {}).get("id"), "url": res.get("data", {}).get("url")}


def hashnode(cfg, fm: dict, body: str) -> dict:
    if not (cfg.hashnode_token and cfg.hashnode_publication):
        return {"platform": "hashnode", "status": "skipped", "note": "HASHNODE_TOKEN/PUBLICATION not set"}
    q = """
    mutation Create($input: CreateArticleInput!) {
      createArticle(input: $input) { article { id url } }
    }"""
    res = post_json(
        "https://gql.hashnode.com",
        {
            "query": q,
            "variables": {
                "input": {
                    "publicationId": cfg.hashnode_publication,
                    "title": fm["title"],
                    "contentMarkdown": body,
                    "tags": [{"slug": t.lower()[:20]} for t in (fm.get("tags") or cfg.default_tags)[:3]],
                    "originalArticleURL": f"{cfg.site_url}/posts/{fm['slug']}",
                }
            },
        },
        headers={"Authorization": cfg.hashnode_token},
    )
    art = (res.get("data") or {}).get("createArticle", {}).get("article", {})
    return {"platform": "hashnode", "status": "ok" if art else "error", "id": art.get("id"), "url": art.get("url"), "raw": str(res)[:200]}


def ghost(cfg, fm: dict, body: str) -> dict:
    if not (cfg.ghost_admin_key and cfg.ghost_url):
        return {"platform": "ghost", "status": "skipped", "note": "GHOST_ADMIN_KEY/GHOST_URL not set"}
    res = post_json(
        f"{cfg.ghost_url.rstrip('/')}/ghost/api/admin/posts/",
        {"posts": [{"title": fm["title"], "slug": fm["slug"], "markdown": body, "status": "draft", "meta_title": fm.get("description", "")[:70]}]},
        headers={"Authorization": f"Ghost {_ghost_jwt(cfg.ghost_admin_key)}"},
    )
    p = (res.get("posts") or [{}])[0]
    return {"platform": "ghost", "status": "ok" if p.get("id") else "error", "id": p.get("id"), "url": f"{cfg.ghost_url.rstrip('/')}/ghost/#/editor/post/{p.get('id')}"}


# ---------- free distribution adapters ----------

def buttondown(cfg, fm: dict, body: str) -> dict:
    """Newsletter draft (Buttondown free tier has a real API; Beehiiv similar)."""
    if not cfg.buttondown_api_key:
        return {"platform": "buttondown", "status": "skipped", "note": "BUTTONDOWN_API_KEY not set"}
    res = post_json(
        "https://api.buttondown.email/v1/emails",
        {
            "subject": fm["title"],
            "body": f"{fm.get('description','')}\n\n{body}\n\n---\n_Read on the site: {cfg.site_url}/posts/{fm['slug']}_",
            "draft": True,
        },
        headers={"Authorization": f"Token {cfg.buttondown_api_key}"},
    )
    return {"platform": "buttondown", "status": "ok" if res.get("id") else "error", "id": res.get("id"), "url": res.get("url")}


def bluesky(cfg, fm: dict, body: str) -> dict:
    """Post a teaser thread item to Bluesky (free, open protocol, no approval)."""
    if not (cfg.bluesky_handle and cfg.bluesky_app_password):
        return {"platform": "bluesky", "status": "skipped", "note": "BLUESKY_HANDLE/APP_PASSWORD not set"}
    sess = post_json(
        "https://bsky.social/xrpc/com.atproto.server.createSession",
        {"identifier": cfg.bluesky_handle, "password": cfg.bluesky_app_password},
    )
    token, did = sess["accessJwt"], sess["did"]
    text = f"{fm['title']}\n\n{cfg.site_url}/posts/{fm['slug']}"
    res = post_json(
        "https://bsky.social/xrpc/com.atproto.repo.createRecord",
        {
            "repo": did,
            "collection": "app.bsky.feed.post",
            "record": {"$type": "app.bsky.feed.post", "text": text[:300], "createdAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())},
        },
        headers={"Authorization": f"Bearer {token}"},
    )
    uri = res.get("uri", "")
    return {"platform": "bluesky", "status": "ok" if uri else "error", "url": f"https://bsky.app/profile/{cfg.bluesky_handle}/post/{uri.split('/')[-1]}" if uri else ""}


def xtwitter(cfg, fm: dict, body: str) -> dict:
    """X/Twitter is now paid-core. Free tier: 500 posts/mo write, but requires
    developer-portal approval — so it's a stub until you're approved."""
    return {"platform": "x", "status": "skipped", "note": "X API free tier exists (500 posts/mo) but needs developer portal approval; enable X_API_KEY when approved"}


# ---------- dispatch ----------

def save_site_copy(cfg, fm: dict, body: str, model: str, image_url: str | None = None) -> Path | None:
    """Drop the draft into content/ so render.py can build the newspaper-style site."""
    try:
        cfg.content_dir.mkdir(parents=True, exist_ok=True)
        path = cfg.content_dir / f"{fm['slug']}.md"
        img_line = f"image_url: {json.dumps(image_url)}\n" if image_url else ""
        header = f"---\ntitle: {fm.get('title')}\nkicker: {fm.get('kicker', 'TECH')}\ndescription: {fm.get('description')}\nslug: {fm.get('slug')}\ndate: {time.strftime('%Y-%m-%d')}\nauthor: {cfg.author_name}\ntags: {json.dumps(fm.get('tags') or cfg.default_tags)}\nmodel: {model}\n{img_line}---\n\n"
        path.write_text(header + body)
        return path
    except Exception as e:
        print(f"  [publish] site copy failed: {e}")
        return None


def dispatch(cfg, fm: dict, body: str) -> list[dict]:
    out = []
    for fn in (devto, medium, hashnode, ghost, buttondown, bluesky, xtwitter):
        try:
            out.append(fn(cfg, fm, body))
        except Exception as e:
            out.append({"platform": fn.__name__, "status": "error", "note": str(e)[:200]})
    return out