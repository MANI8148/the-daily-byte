"""Bloggy worker CLI.

Usage:
  python -m worker.app run-once --source all [--topic "x" ] [--mock-llm] [--publish]
  python -m worker.app daemon --interval-min 360
  python -m worker.app serve-approve --port 8010     # human approval endpoint

Deployable as: GitHub Actions cron, Appwrite scheduled Function, Docker daemon on
any VPS, or Render/Railway cron. One pass = one article, always serial.
"""
from __future__ import annotations

import argparse
import json
import sys
import time
import urllib.parse
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

from .config import Config
from .pipeline import run_once
from .supabase import Supabase


def pprint(summary: dict) -> None:
    print("=" * 64)
    print(f"STATUS   : {summary.get('status')}  (articles: {summary.get('article_count', 1)})")
    print(f"TITLE    : {summary.get('title')}")
    print(f"SOURCE   : {summary.get('source')}  |  post_id: {summary.get('post_id')}")
    if summary.get("brief"):
        print(f"BRIEF    : {summary['brief'].get('title','')[:90]}  ({summary['brief'].get('url','')})")
    for name, res in (summary.get("checks") or {}).items():
        print(f"CHECK    : {name:<10} {res['status']:<5} {res['detail'][:100]}")
    if summary.get("publish"):
        for r in summary["publish"]:
            print(f"PUBLISH  : {r.get('platform'):<10} {r.get('status'):<8} {r.get('url') or r.get('note','')}")
    if summary.get("site_copy"):
        print(f"SITE     : {summary['site_copy']}")
    print("=" * 64)


def cmd_run_once(args) -> None:
    cfg = Config()
    summary = run_once(
        cfg,
        source=args.source,
        topic=args.topic or "",
        mock_llm=args.mock_llm,
        auto_publish=(True if args.publish else None),
        count=getattr(args, "count", 1),
    )
    pprint(summary)
    sys.exit(0 if summary.get("status") not in ("no-candidates", "all-seen", "write-failed") else 2)


def cmd_daemon(args) -> None:
    """Always-on mode for a VPS/Docker: fetch -> ... every N minutes, forever."""
    cfg = Config()
    interval = args.interval_min or cfg.daemon_interval_min
    print(f"daemon: running every {interval} min (auto_publish={cfg.auto_publish})...")
    while True:
        try:
            pprint(run_once(cfg, source=args.source, mock_llm=False))
        except Exception as e:
            print(f"daemon pass failed: {e}")
        time.sleep(interval * 60)


class _ApproveHandler(BaseHTTPRequestHandler):
    cfg: Config = None  # type: ignore[assignment]

    def do_GET(self):  # noqa: N802
        parsed = urllib.parse.urlparse(self.path)
        q = urllib.parse.parse_qs(parsed.query)
        if parsed.path == "/health":
            return self._reply(200, {"ok": True})
        if parsed.path != "/approve":
            return self._reply(404, {"error": "not found"})
        if q.get("token", [""])[0] != self.cfg.approve_token:
            return self._reply(403, {"error": "bad token"})
        post_id = q.get("id", [""])[0]
        if not post_id:
            return self._reply(400, {"error": "missing id"})
        db = Supabase(self.cfg.supabase_url, self.cfg.supabase_key)
        db.set_status(post_id, "approved")
        return self._reply(200, {"ok": True, "post_id": post_id, "status": "approved"})

    def _reply(self, code: int, obj: dict) -> None:
        body = json.dumps(obj).encode()
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, *a):  # keep logs quiet
        pass


def cmd_serve_approve(args) -> None:
    cfg = Config()
    handler = _ApproveHandler
    handler.cfg = cfg
    srv = ThreadingHTTPServer(("0.0.0.0", args.port), handler)
    print(f"approve server on :{args.port} — GET /approve?id=<post_id>&token=<APPROVE_TOKEN>")
    srv.serve_forever()


def main() -> None:
    p = argparse.ArgumentParser(description="Bloggy worker — always-on AI/ML/tech blog engine")
    sub = p.add_subparsers(dest="cmd", required=True)

    r = sub.add_parser("run-once", help="one pipeline pass (for cron)")
    r.add_argument("--source", default="all", choices=["all", "hn", "github", "arxiv", "reddit", "rss"])
    r.add_argument("--topic", default="", help="skip fetching; write about this instead")
    r.add_argument("--count", type=int, default=1, help="articles per pass (default 1; serial, rate-limit friendly)")
    r.add_argument("--mock-llm", action="store_true", help="use canned article (no API key needed)")
    r.add_argument("--publish", action="store_true", help="publish immediately if checks pass")
    r.set_defaults(fn=cmd_run_once)

    d = sub.add_parser("daemon", help="VPS: run forever every N minutes")
    d.add_argument("--source", default="all", choices=["all", "hn", "github", "arxiv", "reddit"])
    d.add_argument("--interval-min", type=int, default=0)
    d.set_defaults(fn=cmd_daemon)

    s = sub.add_parser("serve-approve", help="expose manual approval endpoint")
    s.add_argument("--port", type=int, default=8010)
    s.set_defaults(fn=cmd_serve_approve)

    args = p.parse_args()
    args.fn(args)


if __name__ == "__main__":
    main()