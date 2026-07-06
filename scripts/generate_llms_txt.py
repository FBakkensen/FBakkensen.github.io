"""Generate llms.txt and llms-full.txt from the Jekyll posts in _posts/.

llms.txt      - index per the llms.txt spec: site summary plus one link line per post.
llms-full.txt - full corpus: raw post markdown with a title/URL/date/tags header per post.

URLs follow Jekyll's default permalink for posts, verified against the built site:
/:categories/:year/:month/:day/:title.html with categories downcased and
spaces percent-encoded (e.g. "Business Central" -> business%20central).
"""

from __future__ import annotations

import datetime
import re
import sys
from pathlib import Path
from urllib.parse import quote

import yaml

SITE_URL = "https://fbakkensen.github.io"
SITE_TITLE = "fbakkensen"
SITE_SUMMARY = (
    "Blog by Flemming Bakkensen, lead developer at 9Altitudes: "
    "Dynamics 365 Business Central / AL development and AI-assisted coding workflows."
)
EXCERPT_MAX_CHARS = 160
MORE_MARKER = "<!--more-->"

FILENAME_RE = re.compile(r"^(\d{4})-(\d{2})-(\d{2})-(.+)\.(md|markdown)$")


class Post:
    def __init__(self, path: Path):
        m = FILENAME_RE.match(path.name)
        if not m:
            raise ValueError(f"post filename does not match YYYY-MM-DD-slug.md: {path.name}")
        self.slug = m.group(4)
        filename_date = datetime.date(int(m.group(1)), int(m.group(2)), int(m.group(3)))

        front_matter, self.body = split_front_matter(path.read_text(encoding="utf-8"))
        meta = yaml.safe_load(front_matter) or {}

        self.title = str(meta.get("title") or self.slug)
        self.date = normalize_date(meta.get("date")) or filename_date
        self.categories = normalize_list(meta.get("categories"))
        self.tags = normalize_list(meta.get("tags"))
        self.description = meta.get("description")

    @property
    def url(self) -> str:
        parts = [quote(c.lower()) for c in self.categories]
        parts += [f"{self.date.year:04d}", f"{self.date.month:02d}", f"{self.date.day:02d}"]
        return f"{SITE_URL}/" + "/".join(parts) + f"/{self.slug}.html"

    @property
    def excerpt(self) -> str:
        if self.description:
            return truncate(str(self.description).strip(), EXCERPT_MAX_CHARS)
        text = self.body.split(MORE_MARKER)[0]
        return truncate(markdown_to_text(text), EXCERPT_MAX_CHARS)

    @property
    def full_body(self) -> str:
        return self.body.replace(MORE_MARKER, "").strip()


def split_front_matter(source: str) -> tuple[str, str]:
    m = re.match(r"\A---\s*\n(.*?)\n---\s*\n", source, re.DOTALL)
    if not m:
        raise ValueError("post has no YAML front matter")
    return m.group(1), source[m.end():]


def normalize_date(value) -> datetime.date | None:
    if isinstance(value, datetime.datetime):
        return value.date()
    if isinstance(value, datetime.date):
        return value
    if isinstance(value, str):
        # Dates with a timezone offset ("2024-05-29 11:50:00 +0200") reach us as
        # strings on YAML parsers without timestamp support; take the date part.
        return datetime.date.fromisoformat(value.strip()[:10])
    return None


def normalize_list(value) -> list[str]:
    if value is None:
        return []
    if isinstance(value, str):
        return value.split()
    return [str(v) for v in value]


def markdown_to_text(markdown: str) -> str:
    text = re.sub(r"```.*?```", " ", markdown, flags=re.DOTALL)
    text = re.sub(r"!\[[^\]]*\]\([^)]*\)", " ", text)  # images
    text = re.sub(r"\[([^\]]*)\]\([^)]*\)", r"\1", text)  # links -> text
    text = re.sub(r"^#{1,6}\s+", " ", text, flags=re.MULTILINE)
    text = re.sub(r"[`*_]", "", text)
    return re.sub(r"\s+", " ", text).strip()


def truncate(text: str, limit: int) -> str:
    if len(text) <= limit:
        return text
    cut = text[: limit - 1]
    if " " in cut:
        cut = cut.rsplit(" ", 1)[0]
    return cut + "…"


def load_posts(posts_dir: Path) -> list[Post]:
    posts = [Post(p) for p in sorted(posts_dir.iterdir()) if FILENAME_RE.match(p.name)]
    posts.sort(key=lambda p: (p.date, p.slug), reverse=True)
    return posts


def render_index(posts: list[Post]) -> str:
    lines = [f"# {SITE_TITLE}", "", f"> {SITE_SUMMARY}", "", "## Posts", ""]
    for post in posts:
        lines.append(f"- [{post.title}]({post.url}): {post.excerpt}")
    lines += ["", "## Pages", "", f"- [About]({SITE_URL}/about.html): About Flemming Bakkensen"]
    return "\n".join(lines) + "\n"


def render_full(posts: list[Post]) -> str:
    parts = [f"# {SITE_TITLE}\n\n> {SITE_SUMMARY}\n"]
    for post in posts:
        header = [f"# {post.title}", f"URL: {post.url}", f"Date: {post.date.isoformat()}"]
        if post.tags:
            header.append(f"Tags: {', '.join(post.tags)}")
        parts.append("---\n\n" + "\n".join(header) + "\n\n" + post.full_body + "\n")
    return "\n".join(parts)


def main() -> int:
    root = Path(__file__).resolve().parent.parent
    posts = load_posts(root / "_posts")
    (root / "llms.txt").write_text(render_index(posts), encoding="utf-8", newline="\n")
    (root / "llms-full.txt").write_text(render_full(posts), encoding="utf-8", newline="\n")
    print(f"generated llms.txt and llms-full.txt from {len(posts)} posts")
    return 0


if __name__ == "__main__":
    sys.exit(main())
