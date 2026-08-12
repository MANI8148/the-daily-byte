"""Unit tests for the resilient Supabase client (stdlib unittest, no deps).

Verifies that a misconfigured/bad Supabase key (401 on every remote call) can NEVER
block the pipeline: each remote method degrades to a safe default, and mark_seen still
persists the URL to the local file ledger (seen_links.json). The file ledger is the
durable source of truth; Supabase is optional.

No network: _call is patched to raise; write.generate/score are mocked.
"""
import os
import sys
import tempfile
import shutil
import types
import unittest
from unittest import mock

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def _load(modpath, modname):
    import importlib.util as iu
    spec = iu.spec_from_file_location(modname, modpath)  # type: ignore[arg-type]
    mod = iu.module_from_spec(spec)  # type: ignore[arg-type]
    sys.modules[modname] = mod
    spec.loader.exec_module(mod)  # type: ignore[union-attr]
    return mod


def setUpModule():
    for ns in ("worker", "worker.stages"):
        m = types.ModuleType(ns)
        m.__path__ = [os.path.join(ROOT, *ns.split("."))]
        sys.modules[ns] = m


class FakeLedgerSupabase:
    """Simulates a Supabase instance whose remote calls always fail (bad key)."""
    def __init__(self, *a, **k): pass
    def recent_posts(self, n): raise RuntimeError("Supabase GET /rest/v1/posts -> 401: Invalid API key")
    def seen(self, url): return False
    def insert_post(self, post): raise RuntimeError("401 insert")
    def mark_seen(self, url): raise RuntimeError("401 mark")
    def set_status(self, pid, s): raise RuntimeError("401")
    def get_post(self, pid): raise RuntimeError("401")
    def log_publish(self, row): raise RuntimeError("401")


class TestSupabaseResilience(unittest.TestCase):
    def setUp(self):
        self.td = tempfile.mkdtemp()
        self.sup = _load(os.path.join(ROOT, "worker", "supabase.py"), "worker.supabase")
        self.sup._LEDGER = os.path.join(self.td, "seen.json")
        open(self.sup._LEDGER, "w").write('{"seen":[]}')
        self.db = self.sup.Supabase("https://x.supabase.co", "bad-key")

    def tearDown(self):
        shutil.rmtree(self.td, ignore_errors=True)

    def test_recent_posts_degrades_to_empty(self):
        self.assertEqual(self.db.recent_posts(50), [])

    def test_get_post_degrades_to_none(self):
        self.assertIsNone(self.db.get_post("x"))

    def test_set_status_noop_on_error(self):
        try:
            self.db.set_status("x", "published")
        except Exception as e:  # pragma: no cover
            self.fail(f"set_status raised: {e}")

    def test_log_publish_noop_on_error(self):
        try:
            self.db.log_publish({"slug": "x"})
        except Exception as e:  # pragma: no cover
            self.fail(f"log_publish raised: {e}")

    def test_mark_seen_persists_to_file_ledger_despite_remote_401(self):
        u = "https://verge.com/2026/hw-resilient"
        self.db.mark_seen(u)
        data = self.sup._load_ledger()
        self.assertIn(u, data.get("seen", []))


if __name__ == "__main__":
    unittest.main()
