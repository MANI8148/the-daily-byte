#!/usr/bin/env python3
"""Backfill Supabase `posts` table from local content/*.md.
Requires the anon INSERT policy on posts (added to supabase/schema.sql; re-run in dashboard).
Uses the publishable key (anon) from env var SUPABASE_ANON_KEY. Idempotent:
skips slugs already present. Read-only on the repo; writes only to Supabase.
"""
import os, re, json, glob, urllib.request, urllib.error, sys

ROOT = os.path.dirname(os.path.abspath(__file__))
KEY = os.environ.get("SUPABASE_ANON_KEY", "sb_publishable_RkJeBePa6MUJlZBOYLt1ag_C_K9vZLX")
BASE = "https://atbyvsaukqrasvqulldj.supabase.co/rest/v1"

FM = re.compile(r"^---\s*\n(.*?)\n---\s*\n", re.S)

def parse_frontmatter(path):
    txt = open(path).read()
    m = FM.match(txt)
    if not m:
        return None
    data = {}
    for line in m.group(1).splitlines():
        if ":" not in line:
            continue
        k, v = line.split(":", 1)
        v = v.strip().strip('"').strip("'")
        data[k.strip()] = v
    body = txt[m.end():]
    return data, body

def get_existing_slugs():
    url = f"{BASE}/posts?select=slug"
    req = urllib.request.Request(url, headers={"apikey": KEY, "Authorization": f"Bearer {KEY}"})
    try:
        with urllib.request.urlopen(req, timeout=15) as r:
            return {row["slug"] for row in json.loads(r.read().decode())}
    except Exception as e:
        print("WARN cannot list existing slugs:", e)
        return set()

def insert_post(row):
    url = f"{BASE}/posts"
    req = urllib.request.Request(url, data=json.dumps(row).encode(),
        headers={"apikey": KEY, "Authorization": f"Bearer {KEY}", "Content-Type": "application/json",
                 "Prefer": "return=minimal"}, method="POST")
    urllib.request.urlopen(req, timeout=15)

def main():
    existing = get_existing_slugs()
    files = sorted(glob.glob(os.path.join(ROOT, "content", "*.md")))
    done = 0; skip = 0; err = 0
    for f in files:
        parsed = parse_frontmatter(f)
        if not parsed:
            skip += 1; continue
        fm, body = parsed
        slug = fm.get("slug")
        if not slug or slug in existing:
            skip += 1; continue
        row = {
            "slug": slug,
            "title": fm.get("title", ""),
            "section": fm.get("kicker", ""),
            "content_md": body.strip(),
            "source_url": fm.get("source_url", ""),
            "status": "published",
            "created_at": (fm.get("date") or "2026-08-12") + "T00:00:00Z",
        }
        try:
            insert_post(row); done += 1; print(f"  + {slug}")
        except urllib.error.HTTPError as e:
            err += 1; print(f"  ! {slug} -> {e.code}: {e.read().decode()[:120]}")
        except Exception as e:
            err += 1; print(f"  ! {slug} -> {e}")
    print(f"\nBackfill complete: inserted={done} skipped={skip} errors={err} (of {len(files)} files)")

if __name__ == "__main__":
    main()
