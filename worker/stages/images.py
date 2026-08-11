"""Image stage (M2): pull a cover image for each dispatched article.

Order of preference:
  1. og:image / twitter:image meta from the source page (already fetched by the pipeline)
  2. Openverse CC search by title (free, keyless, license-filtered)

The image is downloaded into site/public/images/<date>/<slug>.<ext> — repo-cached,
so the static site never hotlinks the source's CDN. Returns the site-relative
path (e.g. "/images/2026-08-11/slug.jpg") or None when nothing usable is found.
"""
from __future__ import annotations

import re
import time
import urllib.parse
from pathlib import Path

from ..net import get_text, get_json, download_binary
import trafilatura

SITE_IMAGES = Path("site") / "public" / "images"
OG_RE = re.compile(
    r'<meta[^>]+(?:property|name)=["\'](?:og:image|twitter:image)[^"\']*["\'][^>]+content=["\']([^"\']+)',
    re.I,
)
OG_RE2 = re.compile(
    r'<meta[^>]+content=["\'][^"\']+["\'][^>]+(?:property|name)=["\'](?:og:image|twitter:image)[^"\']*["\']',
    re.I,
)


def extract_og_image(url: str) -> str | None:
    """og:image from the source page — trafilatura metadata first (robust across
    og:image / twitter:image / schema.org), then a regex fallback."""
    try:
        html = get_text(url, timeout=25)
    except Exception:
        return None
    try:
        meta = trafilatura.extract_metadata(html)
        if meta and getattr(meta, "image", None):
            return meta.image
    except Exception:
        pass
    m = OG_RE.search(html) or OG_RE2.search(html)
    return m.group(1).strip() if m else None


def openverse_fallback(title: str) -> str | None:
    """Keyless CC image search (Openverse API) — first usable result."""
    q = urllib.parse.quote((title or "")[:120])
    try:
        data = get_json(f"https://api.openverse.org/v1/images/?q={q}&license=cc0,by&per_page=5", timeout=25)
    except Exception:
        return None
    for res in (data.get("results") or []):
        if res.get("url"):
            return res["url"]
    return None


def run(cfg, fm: dict, brief: dict, model: str) -> str | None:
    slug = fm.get("slug") or ""
    url = (brief or {}).get("url", "")
    if not slug or not url:
        return None

    img_url = extract_og_image(url) or openverse_fallback(fm.get("title", ""))
    if not img_url:
        print("  [images] no og:image and no Openverse match — article runs text-only")
        return None

    date = time.strftime("%Y-%m-%d")
    dest = SITE_IMAGES / date / f"{slug}.jpg"
    if dest.exists():
        return f"/images/{date}/{slug}.jpg"
    try:
        if not download_binary(img_url, str(dest)):
            return None
    except Exception as e:
        print(f"  [images] download failed ({type(e).__name__}: {str(e)[:110]}) — skipping image")
        return None
    print(f"  [images] saved {dest}")
    return f"/images/{date}/{slug}.jpg"
