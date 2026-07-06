import datetime
import tempfile
import unittest
from pathlib import Path

from generate_llms_txt import (
    Post,
    load_posts,
    markdown_to_text,
    normalize_date,
    normalize_list,
    render_full,
    render_index,
    truncate,
)


def make_post(tmpdir: Path, filename: str, front_matter: str, body: str) -> Post:
    path = tmpdir / filename
    path.write_text(f"---\n{front_matter}\n---\n{body}", encoding="utf-8")
    return Post(path)


class PostTests(unittest.TestCase):
    def setUp(self):
        self._tmp = tempfile.TemporaryDirectory()
        self.tmpdir = Path(self._tmp.name)
        self.addCleanup(self._tmp.cleanup)

    def test_url_with_list_categories(self):
        post = make_post(
            self.tmpdir,
            "2026-05-11-building-theme.md",
            'title: "Theme"\ndate: 2026-05-11\ncategories: [AI, Tools, Accessibility]',
            "Body.",
        )
        self.assertEqual(
            post.url,
            "https://fbakkensen.github.io/ai/tools/accessibility/2026/05/11/building-theme.html",
        )

    def test_url_with_space_separated_string_categories(self):
        post = make_post(
            self.tmpdir,
            "2024-05-29-reservations.md",
            'title: "Reservations"\ndate: 2024-05-29 11:50:00 +0200\ncategories: BC AL',
            "Body.",
        )
        self.assertEqual(
            post.url,
            "https://fbakkensen.github.io/bc/al/2024/05/29/reservations.html",
        )

    def test_url_encodes_space_in_category(self):
        post = make_post(
            self.tmpdir,
            "2026-01-10-refactoring.md",
            'title: "Refactoring"\ndate: 2026-01-10\ncategories: ["Business Central", AI]',
            "Body.",
        )
        self.assertEqual(
            post.url,
            "https://fbakkensen.github.io/business%20central/ai/2026/01/10/refactoring.html",
        )

    def test_url_without_categories_and_date_from_filename(self):
        post = make_post(self.tmpdir, "2025-05-07-zen.md", 'title: "Zen"', "Body.")
        self.assertEqual(post.url, "https://fbakkensen.github.io/2025/05/07/zen.html")

    def test_excerpt_prefers_front_matter_description(self):
        post = make_post(
            self.tmpdir,
            "2026-05-11-x.md",
            'title: "X"\ndate: 2026-05-11\ndescription: "Curated description."',
            "Body text that should not be used.\n<!--more-->\nRest.",
        )
        self.assertEqual(post.excerpt, "Curated description.")

    def test_excerpt_from_body_strips_markdown_and_stops_at_more(self):
        post = make_post(
            self.tmpdir,
            "2026-05-11-x.md",
            'title: "X"\ndate: 2026-05-11',
            "See [ChatGPT](https://chat.openai.com) and `code`.\n"
            "![alt](/assets/img.png)\n<!--more-->\nHidden part.",
        )
        self.assertEqual(post.excerpt, "See ChatGPT and code.")
        self.assertNotIn("Hidden", post.excerpt)

    def test_full_body_strips_front_matter_and_more_marker(self):
        post = make_post(
            self.tmpdir,
            "2026-05-11-x.md",
            'title: "X"\ndate: 2026-05-11\ntags: [a, b]',
            "Intro.\n<!--more-->\nRest with ```al\ncode block\n``` kept.",
        )
        self.assertNotIn("<!--more-->", post.full_body)
        self.assertNotIn("layout", post.full_body)
        self.assertIn("```al\ncode block\n```", post.full_body)


class HelperTests(unittest.TestCase):
    def test_normalize_date_variants(self):
        self.assertEqual(normalize_date(datetime.date(2026, 5, 11)), datetime.date(2026, 5, 11))
        self.assertEqual(
            normalize_date(datetime.datetime(2024, 5, 29, 11, 50)), datetime.date(2024, 5, 29)
        )
        self.assertEqual(
            normalize_date("2024-05-29 11:50:00 +0200"), datetime.date(2024, 5, 29)
        )
        self.assertIsNone(normalize_date(None))

    def test_normalize_list_variants(self):
        self.assertEqual(normalize_list(None), [])
        self.assertEqual(normalize_list("BC AL"), ["BC", "AL"])
        self.assertEqual(normalize_list(["BC", "AL"]), ["BC", "AL"])

    def test_truncate_at_word_boundary(self):
        text = "word " * 100
        result = truncate(text.strip(), 160)
        self.assertLessEqual(len(result), 160)
        self.assertTrue(result.endswith("…"))
        self.assertNotIn("wor…", result)

    def test_markdown_to_text_drops_code_fences(self):
        self.assertEqual(markdown_to_text("Before\n```al\ncode\n```\nAfter"), "Before After")


class RenderTests(unittest.TestCase):
    def setUp(self):
        self._tmp = tempfile.TemporaryDirectory()
        tmpdir = Path(self._tmp.name)
        self.addCleanup(self._tmp.cleanup)
        make_post(tmpdir, "2024-05-29-old.md", 'title: "Old"\ncategories: BC AL', "Old body.")
        make_post(
            tmpdir,
            "2026-05-11-new.md",
            'title: "New"\ntags: [ai, vs-code]',
            "New body.\n<!--more-->\nMore.",
        )
        self.posts = load_posts(tmpdir)

    def test_posts_sorted_newest_first(self):
        self.assertEqual([p.title for p in self.posts], ["New", "Old"])

    def test_render_index_structure(self):
        index = render_index(self.posts)
        self.assertTrue(index.startswith("# fbakkensen\n\n> "))
        self.assertIn("## Posts", index)
        self.assertIn("## Pages", index)
        self.assertIn("- [About](https://fbakkensen.github.io/about.html)", index)
        self.assertLess(index.find("- [New]"), index.find("- [Old]"))

    def test_render_full_structure(self):
        full = render_full(self.posts)
        self.assertIn("# New\nURL: https://fbakkensen.github.io/2026/05/11/new.html", full)
        self.assertIn("Date: 2026-05-11\nTags: ai, vs-code", full)
        self.assertIn("# Old\nURL: https://fbakkensen.github.io/bc/al/2024/05/29/old.html", full)
        self.assertIn("More.", full)
        self.assertNotIn("<!--more-->", full)


if __name__ == "__main__":
    unittest.main()
