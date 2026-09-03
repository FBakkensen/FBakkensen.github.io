"""Assertions over the built _site/ directory.

Run from the repository root after `bundle exec jekyll build --quiet`:
    python -m unittest scripts.test_site_build -v
"""
import re
import unittest
from pathlib import Path

SITE = Path("_site")
HOME = "index.html"
POST = "ai/development/2026/07/31/ai-software-factory-automate-execution-not-decisions.html"
LEGACY_PROMPT_POST_GLOB = "**/agentic-development-mid-2026-cost-before-gain*.html"
MERMAID_POST_GLOB = "**/quality-gates-for-coding-agents*.html"
TAGS = "tags/index.html"
ABOUT = "about.html"


class SiteTestCase(unittest.TestCase):
    site = SITE

    def read(self, rel: str) -> str:
        path = self.site / rel
        self.assertTrue(path.exists(), f"missing built page: {rel}")
        return path.read_text(encoding="utf-8")

    def read_glob(self, pattern: str) -> str:
        matches = sorted(self.site.glob(pattern))
        self.assertTrue(matches, f"no built page matches {pattern}")
        return matches[0].read_text(encoding="utf-8")

    def count(self, pattern: str, html: str) -> int:
        return len(re.findall(pattern, html, flags=re.S))


class BuildSmokeTests(SiteTestCase):
    def test_site_directory_exists(self):
        self.assertTrue(self.site.is_dir(), "run `bundle exec jekyll build --quiet` first")

    def test_home_and_post_exist(self):
        self.assertIn("<html", self.read(HOME))
        self.assertIn("<html", self.read(POST))


class BaseLayoutTests(SiteTestCase):
    pass


class HomeTests(SiteTestCase):
    pass


class PostTests(SiteTestCase):
    pass


class PageTests(SiteTestCase):
    pass


class CleanupTests(SiteTestCase):
    pass


if __name__ == "__main__":
    unittest.main()
