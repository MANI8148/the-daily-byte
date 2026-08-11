"""Build the newspaper-style static site from content/*.md.

Usage:
  pip install -r scripts/requirements.txt
  python scripts/render.py            # writes _site/ (index + posts)

Reuses the worker's frontmatter parser, so what the pipeline drafts is exactly
what gets rendered. JSON-LD + OG tags for SEO are in the article template.
"""
from __future__ import annotations

import datetime as dt
import re
import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

import jinja2
import markdown  # noqa: E402

from worker.stages.write import parse_frontmatter  # noqa: E402

SECTION = Path("templates/newspaper")
CONTENT = ROOT / "content"
OUT = ROOT / "_site"


def load_posts() -> list[dict]:
    posts = []
    for f in sorted(CONTENT.glob("*.md")):
        fm, body = parse_frontmatter(f.read_text())
        if not fm.get("title"):
            continue
        # takeaway bullets -> styled key-takeaways box
        takeaways = re.findall(r"^[-*]\s+(.+)$", body, re.M)[-3:]
        body = re.sub(r"^## ?Key takeaways.*$", "", body, flags=re.M | re.I)
        posts.append(
            {
                "title": fm["title"],
                "kicker": fm.get("kicker", "TECH"),
                "description": fm.get("description", ""),
                "slug": fm.get("slug") or f.suffix,
                "date": fm.get("date", dt.date.today().isoformat()),
                "author": fm.get("author", "Staff Writer"),
                "tags": fm.get("tags") or ["tech"],
                "body_html": markdown.markdown(body, extensions=["fenced_code", "tables", "nl2br"]),
                "takeaways": takeaways,
            }
        )
    return sorted(posts, key=lambda p: p["date"], reverse=True)


def main() -> None:
    posts = load_posts()
    env = jinja2.Environment(loader=jinja2.FileSystemLoader(str(ROOT / SECTION)), autoescape=True)
    site = {
        "site_name": "The Daily Byte",
        "site_tagline": "Student Tech Edition",
        "site_url": "https://bloggy.example.com",
        "year": dt.date.today().year,
        "today": dt.date.today().strftime("%A, %B %d, %Y"),
    }
    (OUT / "posts").mkdir(parents=True, exist_ok=True)
    shutil.copy(ROOT / SECTION / "style.css", OUT / "style.css")

    for p in posts:
        html = env.get_template("article.html").render(**site, **p, siblings=[q for q in posts if q["slug"] != p["slug"]][:4])
        (OUT / "posts" / f"{p['slug']}.html").write_text(html)

    (OUT / "index.html").write_text(env.get_template("index.html").render(**site, posts=posts))
    print(f"rendered {len(posts)} posts -> {OUT.resolve()}")


if __name__ == "__main__":
    main()