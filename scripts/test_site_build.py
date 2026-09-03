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
    def test_theme_bootstrap_runs_before_stylesheet(self):
        html = self.read(HOME)
        boot = html.index("localStorage.getItem('theme')")
        css = html.index('href="/assets/css/main.css"')
        self.assertLess(boot, css)

    def test_header_has_three_nav_links_and_toggle(self):
        html = self.read(HOME)
        header = re.search(r'<header class="site-header".*?</header>', html, re.S).group(0)
        self.assertEqual(re.findall(r'class="site-nav__link[^"]*"[^>]*>([^<]+)<', header), ["Blog", "Tags", "About"])
        self.assertIn('id="theme-toggle"', header)
        self.assertNotIn("hamburger", header)

    def test_no_window_chrome_or_prompt_nav(self):
        html = self.read(HOME)
        self.assertNotIn("tp-chrome", html)
        self.assertNotIn("tp-nav-prompt", html)

    def test_footer_links(self):
        html = self.read(HOME)
        footer = re.search(r'<footer class="site-footer".*?</footer>', html, re.S).group(0)
        self.assertEqual(re.findall(r">([A-Za-z]+)</a>", footer), ["LinkedIn", "GitHub", "X", "RSS"])
        self.assertNotIn("bsky", footer)

    def test_scripts(self):
        html = self.read(HOME)
        self.assertIn("/assets/js/theme.js", html)
        self.assertNotIn("mobile-nav.js", html)

    def test_reading_progress_only_on_posts(self):
        self.assertNotIn('id="reading-progress"', self.read(HOME))
        self.assertIn('id="reading-progress"', self.read(POST))


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
