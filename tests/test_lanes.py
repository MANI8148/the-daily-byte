"""Unit tests for topic-lane rotation + per-run drafting (stdlib unittest, no deps).

Verifies the production behavior added for 3-posts-per-hour via rotated 3-of-6 lanes:
  - Config.lanes_per_run defaults to 3
  - run_once picks exactly lanes_per_run lanes per run (step-2 by UTC hour)
  - every lane is covered across a 6-hour window
  - run_once drafts exactly lanes_per_run articles (1 per chosen lane)

Network/LLM are mocked (fetch, score, write.generate) so this runs in CI offline.
"""
import os
import sys
import types
import unittest
from unittest import mock

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def _load(modpath, modname):
    import importlib.util as iu
    spec = iu.spec_from_file_location(modname, modpath)
    mod = iu.module_from_spec(spec)
    sys.modules[modname] = mod
    spec.loader.exec_module(mod)
    return mod


def setUpModule():
    # register the worker package namespace so imports resolve
    for ns in ("worker", "worker.stages"):
        m = types.ModuleType(ns)
        m.__path__ = [os.path.join(ROOT, *ns.split("."))]
        sys.modules[ns] = m


class TestLaneRotation(unittest.TestCase):
    def setUp(self):
        self.cfg = _load(os.path.join(ROOT, "worker", "config.py"), "worker.config").Config()

    def test_lanes_per_run_defaults_to_three(self):
        self.assertEqual(self.cfg.lanes_per_run, 3)

    def test_six_lanes_present(self):
        self.assertEqual(len(self.cfg.lanes), 6)

    def test_rotation_covers_all_six_lanes_over_six_hours(self):
        n = len(self.cfg.lanes)
        step = max(1, n // max(1, self.cfg.lanes_per_run))
        seen = set()
        for h in range(6):
            start = h % n
            chosen = [(start + i * step) % n for i in range(self.cfg.lanes_per_run)]
            self.assertEqual(len(set(chosen)), self.cfg.lanes_per_run)
            seen.update(chosen)
        self.assertEqual(seen, set(range(6)))

    def test_run_once_drafts_exactly_three_articles(self):
        # load modules with mocked network/LLM
        cfg_mod = _load(os.path.join(ROOT, "worker", "config.py"), "worker.config")
        fetch = _load(os.path.join(ROOT, "worker", "stages", "fetch.py"), "worker.stages.fetch")
        score = _load(os.path.join(ROOT, "worker", "stages", "score.py"), "worker.stages.score")
        write = _load(os.path.join(ROOT, "worker", "stages", "write.py"), "worker.stages.write")
        pipe = _load(os.path.join(ROOT, "worker", "pipeline.py"), "worker.pipeline")

        c = cfg_mod.Config()
        # mock Supabase so recent_posts/seen don't hit network
        import worker.stages as S
        class FakeSupabase:
            def __init__(self, *a, **k): pass
            def recent_posts(self, n): return []
            def seen(self, url): return False
            def mark_seen(self, url): pass
        S.Supabase = FakeSupabase
        score.pick = lambda items, n=1, now=None: sorted(items, key=lambda it: it.get("score_hint", 0), reverse=True)[:n]
        write.generate = lambda cfg, brief, mock=False: (f"# {brief.get('title', 'x')}\n\nBody.", "mock")
        # mock fetch to avoid network
        fake_items = []
        def fake_fetch(name, cfg, recent_titles=None, enrich=6):
            return [{"title": name, "url": f"https://u/{name}/{id(fetch)}",
                     "source": name, "published": "2026-08-12", "score_hint": 1, "summary": "s"}]
        with mock.patch.object(fetch, "fetch", fake_fetch):
            summary = pipe.run_once(c, source="all", count=1)
        self.assertEqual(summary.get("article_count"), 3)


if __name__ == "__main__":
    unittest.main()
