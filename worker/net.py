"""Network helpers with a macOS-safe TLS story.

python.org macOS Python builds often ship without a CA bundle
(CERTIFICATE_VERIFY_FAILED). Order of preference:
  1. default context (system/openssl certs)
  2. certifi bundle if installed  (pip install certifi)
  3. unverified TLS with a loud warning   <-- last resort, never silent
"""
from __future__ import annotations

import json
import ssl
import urllib.error
import urllib.request
from pathlib import Path

UA = {"User-Agent": "Mozilla/5.0 (bloggy-worker/1.0; +https://github.com/yourname/bloggy)"}


def _urlopen(url: str, timeout: int = 30):
    req = urllib.request.Request(url, headers=UA)
    try:
        return urllib.request.urlopen(req, timeout=timeout)
    except urllib.error.URLError as exc:
        if "CERTIFICATE_VERIFY_FAILED" not in str(exc):
            raise
        try:
            import certifi  # type: ignore  (only when needed)
            return urllib.request.urlopen(req, context=ssl.create_default_context(cafile=certifi.where()), timeout=timeout)
        except Exception:
            print("  [net] WARNING: no CA bundle found — using unverified TLS. Fix: python3 -m pip install --user certifi")
            return urllib.request.urlopen(req, context=ssl._create_unverified_context(), timeout=timeout)


def get_json(url: str, timeout: int = 30) -> dict | list:
    with _urlopen(url, timeout) as r:
        return json.loads(r.read().decode())


def get_text(url: str, timeout: int = 30) -> str:
    with _urlopen(url, timeout) as r:
        return r.read().decode(errors="replace")


def post_json(url: str, body: dict, headers: dict | None = None, timeout: int = 60) -> dict:
    data = json.dumps(body).encode()
    hdrs = {"Content-Type": "application/json", **(headers or {})}

    def _send(ctx=None):
        req = urllib.request.Request(url, data=data, method="POST", headers=hdrs)
        kw = {"context": ctx} if ctx else {}
        with urllib.request.urlopen(req, timeout=timeout, **kw) as r:
            return json.loads(r.read().decode() or "{}")

    try:
        return _send()
    except urllib.error.URLError as exc:
        if "CERTIFICATE_VERIFY_FAILED" not in str(exc):
            raise
        try:
            import certifi  # type: ignore
            return _send(ssl.create_default_context(cafile=certifi.where()))
        except Exception:
            print("  [net] WARNING: no CA bundle found — using unverified TLS. Fix: python3 -m pip install --user certifi")
            return _send(ssl._create_unverified_context())


def post_json_curl(url: str, body: dict, headers: dict | None = None, timeout: int = 60) -> dict:
    """curl-backed POST. Rescue for providers whose edge TLS-fingerprints Python's
    urllib (e.g. Groq returns 403 to urllib but 200 to curl from the same host).
    curl ships on macOS and on GitHub Actions runners, so this stays dependency-free.
    """
    import subprocess

    args = ["curl", "-sS", "--max-time", str(timeout), "-X", "POST", url, "-H", "Content-Type: application/json"]
    for k, v in (headers or {}).items():
        args += ["-H", f"{k}: {v}"]
    args += ["-d", json.dumps(body)]
    proc = subprocess.run(args, capture_output=True, text=True, timeout=timeout + 10)
    if proc.returncode != 0:
        raise RuntimeError(f"curl POST {url} failed: {proc.stderr.strip()[:200]}")
    return json.loads(proc.stdout or "{}")


def download_binary(url: str, dest: str, max_bytes: int = 500_000) -> bool:
    """Download a binary (cover image) into the repo. urllib first, curl rescue on
    403 (TLS-fingerprint edges — same story as post_json_curl). Rejects non-image
    content types and oversized files. Returns True on success."""
    def _grab(ctx=None):
        req = urllib.request.Request(url, headers=UA)
        kw = {"context": ctx} if ctx else {}
        with urllib.request.urlopen(req, timeout=30, **kw) as r:
            if "image" not in r.headers.get("Content-Type", ""):
                raise ValueError(f"not an image: {r.headers.get('Content-Type')}")
            data = r.read(max_bytes + 1)
            if len(data) > max_bytes:
                raise ValueError(f"image too large: {len(data)} bytes")
            Path(dest).parent.mkdir(parents=True, exist_ok=True)
            Path(dest).write_bytes(data)
            return True

    try:
        return _grab()
    except urllib.error.URLError as exc:
        if "CERTIFICATE_VERIFY_FAILED" not in str(exc):
            raise
        try:
            import certifi  # type: ignore
            return _grab(ssl.create_default_context(cafile=certifi.where()))
        except Exception:
            return _grab(ssl._create_unverified_context())
    except urllib.error.HTTPError as e:
        if e.code == 403:
            import subprocess
            proc = subprocess.run(["curl", "-sSL", "--max-time", "40", "-o", dest, url], capture_output=True, text=True)
            if proc.returncode != 0 or not Path(dest).exists():
                raise RuntimeError(f"curl download failed: {proc.stderr.strip()[:120]}")
            size = Path(dest).stat().st_size
            if size > max_bytes:
                Path(dest).unlink(missing_ok=True)
                raise ValueError(f"image too large: {size} bytes")
            return True
        raise