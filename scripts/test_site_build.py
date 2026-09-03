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
    def test_exactly_one_signature_line(self):
        html = self.read(HOME)
        self.assertEqual(self.count(r'<p class="sig">', html), 1)
        self.assertIn("Get-ChildItem", html)
        self.assertIn("Sort-Object", html)

    def test_intro_uses_site_description(self):
        html = self.read(HOME)
        self.assertIn("Business Central development, agentic tooling, and what actually works.", html)

    def test_five_posts_with_meta_title_description_tags(self):
        html = self.read(HOME)
        items = re.findall(r'<article class="post-list__item">.*?</article>', html, re.S)
        self.assertEqual(len(items), 5)
        first = items[0]
        self.assertIn('class="meta"', first)
        self.assertRegex(first, r"\d{4}-\d{2}-\d{2}")
        self.assertRegex(first, r"~\d+ min")
        self.assertIn('class="post-list__title"', first)
        self.assertIn('class="post-list__desc"', first)
        self.assertLessEqual(self.count(r'class="tag"', first), 3)

    def test_no_sidebar_or_command_links(self):
        html = self.read(HOME)
        self.assertNotIn("tp-side", html)
        self.assertNotIn("whoami", html)
        self.assertNotIn("Read-Post", html)
        self.assertNotIn("Find-Post", html)

    def test_pager_links(self):
        html = self.read(HOME)
        self.assertIn('class="pager"', html)
        self.assertIn("Older", html)
        self.assertIn('href="/page2/"', html)


class PostTests(SiteTestCase):
    def test_exactly_one_signature_line_with_get_content(self):
        html = self.read(POST)
        self.assertEqual(self.count(r'<p class="sig">', html), 1)
        self.assertIn(r'Get-Content</span> <span class="sig__str">.\AI\TheAISoftwareFactory.md', html)

    def test_header_pieces(self):
        html = self.read(POST)
        self.assertIn('class="page-title"', html)
        self.assertIn('class="deck"', html)
        self.assertIn('class="post-author"', html)
        self.assertRegex(html, r"~\d+ min read")

    def test_rail_and_details_toc_both_present(self):
        html = self.read(POST)
        self.assertEqual(self.count(r'<aside class="toc-rail"', html), 1)
        self.assertEqual(self.count(r'<details class="toc-details"', html), 1)
        rail = re.search(r'<aside class="toc-rail".*?</aside>', html, re.S).group(0)
        self.assertGreaterEqual(self.count(r'<a href="#', rail), 3)
        self.assertNotIn("🏭", rail)

    def test_share_links_and_prev_next(self):
        html = self.read(POST)
        self.assertIn("linkedin.com/sharing/share-offsite", html)
        self.assertIn("x.com/intent/post", html)
        self.assertIn('id="copy-link"', html)
        self.assertNotIn("bsky", html)
        self.assertIn('class="post-nav"', html)

    def test_removed_terminal_ui(self):
        html = self.read(POST)
        for needle in ["pp-breadcrumb", "Read-Progress", "Share-Post", "Get-AuthorPosts", "Get-NextPost", "tp-pane"]:
            self.assertNotIn(needle, html)

    def test_legacy_prompt_post_keeps_body_prompt_span(self):
        html = self.read_glob(LEGACY_PROMPT_POST_GLOB)
        self.assertEqual(self.count(r'<p class="sig">', html), 1)
        self.assertIn('<span class="prompt">', html)

    def test_toc_script_only_on_posts(self):
        self.assertIn("/assets/js/toc.js", self.read(POST))
        self.assertNotIn("/assets/js/toc.js", self.read(HOME))


class PageTests(SiteTestCase):
    def test_about_has_no_signature_and_has_facts(self):
        html = self.read(ABOUT)
        self.assertEqual(self.count(r'<p class="sig">', html), 0)
        self.assertIn('class="facts"', html)
        for label in ["Role", "Stack", "Location"]:
            self.assertIn(label, html)

    def test_tags_has_no_signature_and_keeps_filter_hooks(self):
        html = self.read(TAGS)
        self.assertEqual(self.count(r'<p class="sig">', html), 0)
        self.assertNotIn("pp-breadcrumb", html)
        self.assertNotIn("Read-Post", html)
        self.assertIn('id="tag-cloud"', html)
        self.assertIn('id="tag-posts"', html)
        self.assertIn('id="selected-tag"', html)


class CleanupTests(SiteTestCase):
    pass


if __name__ == "__main__":
    unittest.main()
