"""Thin Supabase REST client (stdlib only). Missing config -> local file-ledger mode.

The only critical job Supabase does is the dedup ledger (seen_links). When
SUPABASE_URL + SUPABASE_SERVICE_KEY are absent we fall back to a committed
JSON file (seen_links.json) so dedup persists across runs with zero cloud setup.
This keeps the project free-forever with no extra services.
"""
from __future__ import annotations

import json
import os
import urllib.error
import urllib.request

from .net import post_json

_TIMEOUT = 30
_LEDGER = os.path.join(os.path.dirname(os.path.dirname(__file__)), "seen_links.json")


def _load_ledger() -> dict:
    try:
        return json.load(open(_LEDGER))
    except (FileNotFoundError, json.JSONDecodeError):
        return {"seen": []}


def _save_ledger(data: dict) -> None:
    with open(_LEDGER, "w") as f:
        json.dump(data, f, indent=2)


class Supabase:
    def __init__(self, url: str = "", key: str = ""):
        self.url = url.rstrip("/")
        self.key = key
        self.dry = not (url and key)

    # ---------- low-level ----------
    def _headers(self) -> dict:
        return {"apikey": self.key, "Authorization": f"Bearer {self.key}", "Content-Type": "application/json"}

    def _call(self, method: str, path: str, body: dict | None = None) -> dict | list:
        """POST via net.post_json (TLS-fallback aware); PATCH via raw urllib (same fallback)."""
        if method == "POST":
            return post_json(f"{self.url}{path}", body or {}, headers=self._headers(), timeout=_TIMEOUT)
        return self._raw(method, path, body)

    def _raw(self, method: str, path: str, body: dict | None) -> dict:
        req = urllib.request.Request(
            f"{self.url}{path}",
            method=method,
            data=json.dumps(body).encode() if body is not None else None,
            headers={**self._headers(), "Prefer": "return=representation"},
        )
        try:
            with urllib.request.urlopen(req, timeout=_TIMEOUT) as r:
                raw = r.read().decode()
                return json.loads(raw) if raw else {}
        except urllib.error.HTTPError as e:
            detail = e.read().decode()[:300]
            if e.code == 409:  # unique violation -> already seen
                return {"_conflict": True, "_detail": detail}
            raise RuntimeError(f"Supabase {method} {path} -> {e.code}: {detail}") from e

    def _get(self, path: str) -> list:
        req = urllib.request.Request(f"{self.url}{path}", headers={**self._headers(), "Prefer": "return=representation"})
        try:
            with urllib.request.urlopen(req, timeout=_TIMEOUT) as r:
                return json.loads(r.read().decode())
        except urllib.error.HTTPError as e:
            raise RuntimeError(f"Supabase GET {path} -> {e.code}: {e.read().decode()[:300]}") from e

    # ---------- domain ----------
    def insert_post(self, post: dict) -> dict:
        if self.dry:
            print("  [dry-run] insert posts:", json.dumps(post, indent=2)[:600])
            return {"id": "dry-" + post.get("slug", "x")}
        res = self._call("POST", "/rest/v1/posts", post)
        return res[0] if isinstance(res, list) and res else (res if isinstance(res, dict) else {})

    def set_status(self, post_id: str, status: str) -> None:
        if self.dry:
            print(f"  [dry-run] posts/{post_id} status -> {status}")
            return
        self._call("PATCH", f"/rest/v1/posts?id=eq.{post_id}", {"status": status})

    def seen(self, url: str) -> bool:
        """True if url was already ingested. Checks the remote ledger when configured,
        and always consults the local file ledger as a durable fallback."""
        # local file ledger is the durable source of truth
        data = _load_ledger()
        local_seen = url in data.get("seen", [])
        if self.dry:
            return local_seen
        # also check remote (best-effort; ignore network errors -> trust local)
        try:
            res = self._call("POST", "/rest/v1/seen_links", {"url": url, "first_seen_at": "now()"})
            return bool(isinstance(res, dict) and res.get("_conflict")) or local_seen
        except Exception:
            return local_seen

    def mark_seen(self, url: str) -> None:
        """Persist a URL as seen in BOTH the file ledger (always) and remote (best-effort)."""
        data = _load_ledger()
        seen = data.setdefault("seen", [])
        if url not in seen:
            seen.append(url)
            _save_ledger(data)
        if not self.dry:
            try:
                self._call("POST", "/rest/v1/seen_links", {"url": url, "first_seen_at": "now()"})
            except Exception as e:
                # anon key / RLS may block writes; file ledger already has it
                print(f"  [dedup] remote mark_seen skipped ({type(e).__name__}); file ledger updated")

    def recent_posts(self, limit: int = 20) -> list:
        if self.dry:
            return []
        return self._get(f"/rest/v1/posts?select=title,content_md&order=created_at.desc&limit={limit}")

    def get_post(self, post_id: str) -> dict | None:
        if self.dry:
            return None
        rows = self._get(f"/rest/v1/posts?id=eq.{post_id}&select=*")
        return rows[0] if rows else None

    def log_publish(self, row: dict) -> None:
        if self.dry:
            print("  [dry-run] publish_logs:", json.dumps(row))
            return
        self._call("POST", "/rest/v1/publish_logs", row)