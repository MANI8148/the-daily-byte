"""Unit tests for the deterministic parts of the worker (stdlib unittest — no deps).

Run: python3 -m unittest discover -s tests -v
"""
import unittest

from worker.config import Config
from worker.stages import checks, publish, score, write

SAMPLE = """---
title: AI Agents Explained Simply for Students
kicker: AI
description: A clear, student-friendly explainer of AI agents in 2026 with concrete examples, a working loop, and key takeaways for learning.
slug: ai-agents-explained-students
tags: [ai, ml, tutorial]
status: draft
---

An agent is a loop. A model receives a goal, takes an action, observes the result, and repeats until the goal is met or the budget runs out. The magic is not the model itself; it is the loop, the tools, and the guardrails wrapped around it.

## What is an agent

A chatbot answers; an agent acts. The difference is the tool call: when a model emits a structured request to run code, query a database, or edit a file, it stops being a text generator and becomes a worker. Frameworks like LangGraph, CrewAI, and OpenAI's Agents SDK all exist to make that loop safe and legible for developers.

The loop has four parts that students should memorize. First, the goal: a clear instruction written by a human. Second, the planner: the model proposes the next concrete action. Third, the executor: a tool runs that action and returns observations. Fourth, the controller: the loop decides whether the goal is done or more steps are needed. Every agent framework you will meet is some arrangement of these four parts.

## Why it matters

Employers in 2026 are asking two questions: can you direct an agent to write correct code, and can you tell when its output is wrong? The second half is the skill gap students can exploit. Every AI-generated answer deserves a skeptical human pass; the student who verifies will outperform the student who copies. This is not a hype claim; it follows directly from how code review works when the author of the code is a machine.

## Key takeaways

- An agent equals goal plus loop plus tools plus guardrails, and the model is only the brain in the middle
- Verification is the skill that compounds, so never trust a generated answer without checking it
- Build one tool-using agent before your next internship interview
"""


class TestFrontmatter(unittest.TestCase):
    def test_parse(self):
        fm, body = write.parse_frontmatter(SAMPLE)
        self.assertEqual(fm["title"], "AI Agents Explained Simply for Students")
        self.assertEqual(fm["tags"], ["ai", "ml", "tutorial"])
        self.assertIn("## What is an agent", body)

    def test_no_frontmatter(self):
        fm, body = write.parse_frontmatter("# just a title\n\nbody")
        self.assertEqual(fm, {})
        self.assertTrue(body)

    def test_slugify(self):
        self.assertEqual(write.slugify("Hello, World! 2026?"), "hello-world-2026")


class TestScore(unittest.TestCase):
    def test_ranking(self):
        old = {"title": "X", "source": "s", "url": "u", "published": "2020-01-01", "score_hint": 5}
        fresh = {"title": "AI Agent Python Guide", "source": "s", "url": "u", "published": "", "score_hint": 500}
        self.assertGreater(score.score(fresh), score.score(old))

    def test_pick_top(self):
        items = [{"title": f"item{i}", "url": f"u{i}", "source": "s", "published": "", "score_hint": i} for i in range(5)]
        self.assertEqual(score.pick(items, 1)[0]["score_hint"], 4)


class TestChecks(unittest.TestCase):
    def test_good_article_passes(self):
        fm, body = write.parse_frontmatter(SAMPLE)
        name, status, detail = checks.format_check(fm, body)
        self.assertEqual(status, "pass", detail)

    def test_short_article_fails(self):
        fm, body = write.parse_frontmatter(SAMPLE)
        body = "## Only one section\n\n" + "x" * 60
        name, status, detail = checks.format_check(fm, body)
        self.assertEqual(status, "fail")

    def test_duplicate_detected(self):
        name, status, detail = checks.duplicate_check(
            "AI Agents Explained Simply",
            "Intro about AI agents and why students should learn them now",
            [{"title": "AI Agents Explained", "content_md": "Intro about AI agents and why students should learn them now, expanded further"}],
        )
        self.assertEqual(status, "fail", detail)

    def test_duplicate_pass_when_distinct(self):
        name, status, detail = checks.duplicate_check(
            "Rust in the Linux Kernel", "Something about memory safety and kernel modules", [{"title": "AI Agents", "content_md": "intro about agents"}]
        )
        self.assertEqual(status, "pass", detail)

    def test_eligible(self):
        self.assertTrue(checks.eligible([("a", "pass", ""), ("b", "warn", "")]))
        self.assertFalse(checks.eligible([("a", "pass", ""), ("b", "fail", "x")]))


class TestCurate(unittest.TestCase):
    def test_mock_curate_ranks_by_topic_fit(self):
        items = [
            {"title": "AI Agent Python Guide", "url": "u1", "source": "s", "published": "", "score_hint": 900},
            {"title": "unrelated tv show review", "url": "u2", "source": "s", "published": "", "score_hint": 900},
        ]
        out = score.curate(Config(llm_api_key="", supabase_url="", supabase_key=""), items, mock=True)
        picked = score.pick(out, 1)[0]
        self.assertEqual(picked["url"], "u1")  # topic fit beats raw engagement

    def test_best_curated(self):
        items = [{"final_score": 7.5}, {"final_score": 4.0}]
        self.assertEqual(score.best_curated(items), 7.5)
        self.assertIsNone(score.best_curated([{"no_score": 1}]))


class TestPublishDispatch(unittest.TestCase):
    def test_all_skipped_without_keys(self):
        res = publish.dispatch(Config(llm_api_key=""), {"title": "T", "slug": "t", "tags": ["ai"]}, "body")
        self.assertTrue(res)
        self.assertTrue(all(r["status"] == "skipped" for r in res), res)


class TestReview(unittest.TestCase):
    def test_skipped_without_credentials(self):
        from worker.stages import review

        res = review.push_pr(Config(llm_api_key="", github_token="", git_repo=""), "doc", "Title", "slug-x")
        self.assertEqual(res["status"], "skipped")


if __name__ == "__main__":
    unittest.main()