# Site Redesign (Column + Rail) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Windows Terminal theme with a reading-first light/dark design where each page carries one signature PowerShell line, the home page is a plain index, and posts use a centred column with a sticky table-of-contents rail.

**Architecture:** Jekyll layouts stay `base` → `home` / `post` / `page`. Styling moves from one 1,300-line `terminal-theme.scss` into ten focused partials driven by CSS custom properties (light on `:root`, dark on `html[data-theme="dark"]`). Two small vanilla JS files handle the theme toggle plus reading progress, and the current-section highlight in the rail. Tests are Python `unittest` assertions over the built `_site/` HTML.

**Tech Stack:** Jekyll 4 on the default GitHub Pages build (kramdown, Rouge, jekyll-paginate, jekyll-seo-tag, jekyll-feed, jekyll-sitemap), SCSS via Jekyll's built-in Sass, vanilla ES6, Google Fonts (Inter, JetBrains Mono), Mermaid 10 from CDN, Python 3 `unittest` for build checks, Chrome DevTools MCP for screenshots.

**Spec:** `docs/superpowers/specs/2026-09-03-site-redesign-design.md`

## Global Constraints

- Build must work on the default GitHub Pages Jekyll build. No new gems, no Node step.
- Post content, URLs, permalinks, feed, sitemap and `llms.txt` generation are untouched.
- Body font Inter, 17px below 768px, 18px from 768px, line-height 1.65. Reading column max-width 42rem.
- Monospace font stack everywhere it is used: `"JetBrains Mono", "Cascadia Code", ui-monospace, monospace`.
- Exactly one signature command line per page: home `PS C:\Blog> Get-ChildItem .\posts\ | Sort-Object Date -Descending`; post `PS C:\DevProjects\DevBlog> Get-Content .\<FirstCategory>\<FirstFourTitleWords>.md` (a post may override the file name with `signature_file:` in front matter); none on About and Tags.
- Nav text is exactly `Blog`, `Tags`, `About`. Footer links are exactly LinkedIn, GitHub, X, RSS. No Bluesky anywhere in layouts.
- Theme toggle persists in `localStorage` key `theme` with values `light` or `dark`; default is `prefers-color-scheme`.
- Rail breakpoint is 1100px. Rail sticky offset is 76px.
- Token values (light / dark): `--bg #FFFFFF / #0D1117`, `--surface #F6F8FA / #161B22`, `--text #1F2328 / #E6EDF3`, `--mute #656D76 / #8B949E`, `--border #D0D7DE / #30363D`, `--accent #6639BA / #D2A8FF`, `--path #1A7F37 / #7EE787`, `--string #0A3069 / #A5D6FF`, `--code-bg #F6F8FA / #161B22`.
- Commit after every task. Commit messages end with `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`.
- Run every command from the repository root. Build with `bundle exec jekyll build --quiet`.
- Prose in layouts and docs never uses em-dashes.

---

## File Structure

| Path | Status | Responsibility |
|---|---|---|
| `scripts/test_site_build.py` | create | unittest suite over `_site/` HTML; the test cycle for every task |
| `_sass/_tokens.scss` | create | CSS custom properties, light and dark |
| `_sass/_base.scss` | create | reset, body, links, `.wrap` reading column, `.sig` signature line, `.tag` pill, `.meta` line |
| `_sass/_typography.scss` | create | body and heading sizes, prose rules inside `.post-body` |
| `_sass/_header.scss` | create | `.site-header`, brand, nav, toggle, progress bar |
| `_sass/_footer.scss` | create | `.site-footer` |
| `_sass/_post-list.scss` | create | `.post-list`, `.post-list__item`, pager |
| `_sass/_post.scss` | create | `.post` grid, header, author line, share links, prev/next cards |
| `_sass/_toc.scss` | create | `.toc-rail` and `.toc-details` |
| `_sass/_code.scss` | create | `pre`, `code`, Rouge classes, `code-blocks.js` wrapper and `.syntax-*` classes |
| `_sass/_tags.scss` | create | tags page cloud and filtered list |
| `assets/css/main.scss` | modify | imports the partials above, nothing else |
| `assets/js/theme.js` | create | toggle button, persistence, Mermaid re-theme, reading progress |
| `assets/js/toc.js` | create | IntersectionObserver highlight in the rail |
| `assets/js/code-blocks.js` | modify | drop the inline yellow prompt colour, drop dead `.post-toc` smooth-scroll block |
| `_includes/signature.html` | create | renders the signature line for home or post |
| `_layouts/base.html` | rewrite | head with theme bootstrap, header, main, footer, scripts |
| `_layouts/home.html` | rewrite | intro, post list, pager |
| `_layouts/post.html` | rewrite | header, grid with body and rail, share, prev/next |
| `_layouts/page.html` | rewrite | title, description, body |
| `about.md` | modify | facts block at the top |
| `tags.html` | modify | new markup and classes, same JS behaviour |
| `_config.yml` | modify | new `description`; remove `design-prototypes/` exclude at the end |
| `AGENTS.md` | modify | theme and SCSS sections |
| `.claude/skills/blog-post-writer/SKILL.md` | modify | CTA copy: LinkedIn and X |
| `_layouts/home2.html`, `_includes/header.html`, `_includes/nav.html`, `_sass/terminal-theme.scss`, `assets/js/mobile-nav.js`, `Screenshot.png`, `design-prototypes/` | delete | dead or replaced |

---

### Task 1: Build-check test harness

**Files:**
- Create: `scripts/test_site_build.py`

**Interfaces:**
- Produces: `SiteTestCase` (a `unittest.TestCase` subclass with `self.site` = `Path("_site")` and helper `self.read(rel)` returning a page's HTML as text). Later tasks add test methods to the classes defined here.

- [ ] **Step 1: Write the harness with one smoke test**

```python
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
```

- [ ] **Step 2: Build and run**

Run:
```bash
bundle exec jekyll build --quiet && python -m unittest scripts.test_site_build -v
```
Expected: 2 tests, OK. If `POST` is not found, run `ls _site/ai/development/2026/07/31/` and fix the `POST` constant to the real file name.

- [ ] **Step 3: Commit**

```bash
git add scripts/test_site_build.py
git commit -m "test: add build-check harness for site HTML

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 2: Tokens, base styles, header, footer, theme script, new `base.html`

The old `terminal-theme.scss` stays imported until Task 7 so home and post keep rendering while their layouts are rewritten in Tasks 3 and 4.

**Files:**
- Create: `_sass/_tokens.scss`, `_sass/_base.scss`, `_sass/_typography.scss`, `_sass/_header.scss`, `_sass/_footer.scss`, `assets/js/theme.js`
- Modify: `assets/css/main.scss`, `_layouts/base.html`, `_config.yml` (description)
- Test: `scripts/test_site_build.py` (`BaseLayoutTests`)

**Interfaces:**
- Produces CSS classes used by later tasks: `.wrap` (reading column), `.sig` with children `.sig__path`, `.sig__verb`, `.sig__str`, `.tag` (pill link), `.meta` (mono meta line), `.site-header`, `.reading-progress`.
- Produces DOM ids: `theme-toggle` (button), `reading-progress` (div).
- Produces `window.initMermaid()` in `base.html` and `window.mermaidThemeVariables(theme)` in `theme.js`.

- [ ] **Step 1: Write failing tests**

Replace the empty `BaseLayoutTests` class:

```python
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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `python -m unittest scripts.test_site_build.BaseLayoutTests -v`
Expected: 6 failures (attribute errors on `re.search(...).group` count as failures here).

- [ ] **Step 3: Create `_sass/_tokens.scss`**

```scss
:root {
  --bg: #FFFFFF;
  --surface: #F6F8FA;
  --text: #1F2328;
  --mute: #656D76;
  --border: #D0D7DE;
  --accent: #6639BA;
  --path: #1A7F37;
  --string: #0A3069;
  --code-bg: #F6F8FA;
  --code-keyword: #CF222E;
  --code-string: #0A3069;
  --code-comment: #6E7781;
  --code-number: #0550AE;
  --code-function: #8250DF;
  --code-variable: #953800;
  --code-type: #116329;
  --header-bg: rgba(255, 255, 255, 0.88);
  --font-sans: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
  --font-mono: "JetBrains Mono", "Cascadia Code", ui-monospace, monospace;
  --measure: 42rem;
  --header-h: 56px;
  color-scheme: light;
}

html[data-theme="dark"] {
  --bg: #0D1117;
  --surface: #161B22;
  --text: #E6EDF3;
  --mute: #8B949E;
  --border: #30363D;
  --accent: #D2A8FF;
  --path: #7EE787;
  --string: #A5D6FF;
  --code-bg: #161B22;
  --code-keyword: #FF7B72;
  --code-string: #A5D6FF;
  --code-comment: #8B949E;
  --code-number: #79C0FF;
  --code-function: #D2A8FF;
  --code-variable: #FFA657;
  --code-type: #7EE787;
  --header-bg: rgba(13, 17, 23, 0.88);
  color-scheme: dark;
}
```

- [ ] **Step 4: Create `_sass/_base.scss`**

```scss
*, *::before, *::after { box-sizing: border-box; }

html {
  -webkit-text-size-adjust: 100%;
  scroll-padding-top: calc(var(--header-h) + 16px);
}

body {
  margin: 0;
  background: var(--bg);
  color: var(--text);
  font-family: var(--font-sans);
  font-size: 17px;
  line-height: 1.65;
  -webkit-font-smoothing: antialiased;
  transition: background-color 0.2s, color 0.2s;
}

@media (min-width: 768px) {
  body { font-size: 18px; }
}

a { color: var(--accent); text-decoration: none; }
a:hover { text-decoration: underline; }

img, svg { max-width: 100%; height: auto; }

.wrap {
  max-width: var(--measure);
  margin: 0 auto;
  padding: 0 20px;
}

.mono { font-family: var(--font-mono); }

/* Signature command line: exactly one per page */
.sig {
  font-family: var(--font-mono);
  font-size: 13px;
  color: var(--mute);
  margin: 0 0 14px;
  white-space: nowrap;
  overflow-x: auto;
  scrollbar-width: none;
  -webkit-mask-image: linear-gradient(90deg, #000 calc(100% - 32px), transparent);
  mask-image: linear-gradient(90deg, #000 calc(100% - 32px), transparent);
}
.sig::-webkit-scrollbar { display: none; }
.sig__path { color: var(--path); }
.sig__verb { color: var(--accent); }
.sig__str { color: var(--string); }

/* Tag pill */
.tag {
  display: inline-block;
  font-family: var(--font-mono);
  font-size: 12px;
  line-height: 1.6;
  color: var(--accent);
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 999px;
  padding: 1px 9px;
  margin: 0 6px 6px 0;
  white-space: nowrap;
}
.tag:hover { text-decoration: none; border-color: var(--accent); }

/* Mono meta line: date · read time · tags */
.meta {
  font-family: var(--font-mono);
  font-size: 12.5px;
  color: var(--mute);
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px 12px;
}
```

- [ ] **Step 5: Create `_sass/_typography.scss`**

```scss
h1, h2, h3, h4 {
  font-family: var(--font-sans);
  font-weight: 700;
  letter-spacing: -0.01em;
  line-height: 1.25;
  margin: 0;
}

.page-title {
  font-size: 2rem;
  letter-spacing: -0.02em;
  line-height: 1.2;
  margin: 0 0 12px;
}
@media (min-width: 768px) {
  .page-title { font-size: 2.4rem; }
}

.deck {
  font-size: 1.15em;
  color: var(--mute);
  margin: 0 0 16px;
}

/* Prose inside a post or page body */
.post-body > :first-child { margin-top: 0; }
.post-body h2 { font-size: 1.5rem; margin: 2.2em 0 0.6em; }
.post-body h3 { font-size: 1.2rem; margin: 1.8em 0 0.5em; }
.post-body h4 { font-size: 1.05rem; margin: 1.5em 0 0.4em; }
.post-body p, .post-body ul, .post-body ol { margin: 0 0 1.2em; }
.post-body ul, .post-body ol { padding-left: 1.4em; }
.post-body li { margin: 0.3em 0; }
.post-body blockquote {
  margin: 1.4em 0;
  padding: 4px 18px;
  border-left: 3px solid var(--accent);
  color: var(--mute);
}
.post-body img { border-radius: 8px; display: block; margin: 1.4em auto; }
.post-body hr { border: 0; border-top: 1px solid var(--border); margin: 2.4em 0; }
.post-body table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.92em;
  margin: 1.4em 0;
  display: block;
  overflow-x: auto;
}
.post-body th, .post-body td { border: 1px solid var(--border); padding: 8px 12px; text-align: left; vertical-align: top; }
.post-body th { background: var(--surface); }

/* Legacy opener used by six posts: the layout already renders the signature line */
.post-body > p:first-child:has(> .prompt) { display: none; }
```

- [ ] **Step 6: Create `_sass/_header.scss`**

```scss
.site-header {
  position: sticky;
  top: 0;
  z-index: 10;
  background: var(--header-bg);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border-bottom: 1px solid var(--border);
}

.site-header__inner {
  max-width: 72rem;
  margin: 0 auto;
  padding: 0 20px;
  height: var(--header-h);
  display: flex;
  align-items: center;
  gap: 16px;
}

.site-brand {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text);
  font-weight: 600;
  white-space: nowrap;
}
.site-brand:hover { text-decoration: none; }
.site-brand__glyph { color: var(--accent); font-family: var(--font-mono); font-weight: 700; }

.site-nav {
  display: flex;
  gap: 16px;
  margin-left: auto;
  font-size: 15px;
}
.site-nav__link { color: var(--mute); }
.site-nav__link[aria-current="page"] { color: var(--text); }
.site-nav__link:hover { color: var(--text); text-decoration: none; }

.theme-toggle {
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text);
  border-radius: 8px;
  width: 34px;
  height: 34px;
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
  padding: 0;
}
.theme-toggle:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }

.reading-progress {
  height: 2px;
  background: var(--accent);
  width: 0;
}

@media (max-width: 420px) {
  .site-brand__name { display: none; }
  .site-nav { gap: 12px; }
}
```

- [ ] **Step 7: Create `_sass/_footer.scss`**

```scss
.site-footer {
  border-top: 1px solid var(--border);
  margin-top: 64px;
  padding: 28px 20px;
  color: var(--mute);
  font-size: 14px;
  text-align: center;
}
.site-footer__links { margin-top: 6px; }
.site-footer__links a { margin: 0 8px; color: var(--mute); }
.site-footer__links a:hover { color: var(--text); }
```

- [ ] **Step 8: Create `assets/js/theme.js`**

```javascript
// Theme toggle, persistence, Mermaid re-theme, reading progress.
(function () {
  var root = document.documentElement;
  var STORAGE_KEY = 'theme';

  function current() {
    return root.dataset.theme === 'dark' ? 'dark' : 'light';
  }

  function mermaidThemeVariables(theme) {
    var dark = theme === 'dark';
    return {
      background: 'transparent',
      primaryColor: dark ? '#161B22' : '#F6F8FA',
      primaryBorderColor: dark ? '#30363D' : '#D0D7DE',
      primaryTextColor: dark ? '#E6EDF3' : '#1F2328',
      lineColor: dark ? '#8B949E' : '#656D76',
      textColor: dark ? '#E6EDF3' : '#1F2328',
      secondaryColor: dark ? '#0D1117' : '#FFFFFF',
      tertiaryColor: dark ? '#161B22' : '#F6F8FA',
      nodeTextColor: dark ? '#E6EDF3' : '#1F2328',
      mainBkg: dark ? '#161B22' : '#F6F8FA',
      actorBkg: dark ? '#161B22' : '#F6F8FA',
      actorBorder: dark ? '#30363D' : '#D0D7DE',
      actorTextColor: dark ? '#E6EDF3' : '#1F2328',
      labelBoxBkgColor: dark ? '#0D1117' : '#FFFFFF',
      labelBoxBorderColor: dark ? '#30363D' : '#D0D7DE',
      fontFamily: 'JetBrains Mono, Cascadia Code, Consolas, monospace'
    };
  }
  window.mermaidThemeVariables = mermaidThemeVariables;

  function setIcon(btn) {
    var dark = current() === 'dark';
    btn.textContent = dark ? '\u2600' : '\u263E';
    btn.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
  }

  function rerenderMermaid() {
    if (!window.mermaid) return;
    var nodes = document.querySelectorAll('.mermaid');
    if (!nodes.length) return;
    nodes.forEach(function (n) {
      n.removeAttribute('data-processed');
      n.innerHTML = n.dataset.source;
    });
    window.mermaid.initialize({ startOnLoad: false, theme: 'base', themeVariables: mermaidThemeVariables(current()) });
    window.mermaid.run({ nodes: nodes });
  }

  document.addEventListener('DOMContentLoaded', function () {
    // Mermaid (deferred, renders on load) replaces node contents with SVG; keep the source first.
    document.querySelectorAll('.mermaid').forEach(function (n) { n.dataset.source = n.innerHTML; });

    var btn = document.getElementById('theme-toggle');
    if (btn) {
      setIcon(btn);
      btn.addEventListener('click', function () {
        var next = current() === 'dark' ? 'light' : 'dark';
        root.dataset.theme = next;
        try { localStorage.setItem(STORAGE_KEY, next); } catch (e) { /* private mode */ }
        setIcon(btn);
        rerenderMermaid();
      });
    }

    var bar = document.getElementById('reading-progress');
    var article = document.querySelector('.post-body');
    if (bar && article) {
      var update = function () {
        var top = article.offsetTop;
        var h = article.offsetHeight - window.innerHeight;
        var p = h > 0 ? (window.scrollY - top) / h : 1;
        bar.style.width = Math.max(0, Math.min(100, Math.round(p * 100))) + '%';
      };
      document.addEventListener('scroll', update, { passive: true });
      update();
    }
  });
})();
```

Posts author diagrams as `<div class="mermaid">` blocks. `DOMContentLoaded` fires before the deferred Mermaid script's `load` render, so `data-source` holds the diagram text and every toggle re-renders from it. `mermaid.run` exists in Mermaid 10.

- [ ] **Step 9: Rewrite `_layouts/base.html`**

```html
<!DOCTYPE html>
<html lang="{{ page.lang | default: site.lang | default: "en" }}">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <script>
      (function () {
        var t;
        try { t = localStorage.getItem('theme'); } catch (e) {}
        if (t !== 'light' && t !== 'dark') {
          t = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        document.documentElement.setAttribute('data-theme', t);
      })();
    </script>
    {%- seo -%}
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="{{ "/assets/css/main.css" | relative_url }}">
    <link rel="shortcut icon" type="image/x-icon" href="{{ "/favicon.ico" | relative_url }}">
    {%- feed_meta -%}
    {%- if jekyll.environment == 'production' and site.google_analytics -%}
      {%- include google-analytics.html -%}
    {%- endif -%}
  </head>
  <body>
    <header class="site-header">
      <div class="site-header__inner">
        <a href="{{ "/" | relative_url }}" class="site-brand">
          <span class="site-brand__glyph">›</span>
          <span class="site-brand__name">{{ site.author.name }}</span>
        </a>
        <nav class="site-nav" aria-label="Main">
          <a href="{{ "/" | relative_url }}" class="site-nav__link"{% if page.layout == 'home' %} aria-current="page"{% endif %}>Blog</a>
          <a href="{{ "/tags/" | relative_url }}" class="site-nav__link"{% if page.url == '/tags/' %} aria-current="page"{% endif %}>Tags</a>
          <a href="{{ "/about" | relative_url }}" class="site-nav__link"{% if page.url == '/about.html' or page.url == '/about/' %} aria-current="page"{% endif %}>About</a>
        </nav>
        <button id="theme-toggle" class="theme-toggle" type="button" aria-label="Switch theme"></button>
      </div>
      {%- if page.layout == 'post' -%}
      <div class="reading-progress" id="reading-progress" aria-hidden="true"></div>
      {%- endif -%}
    </header>
    <main>{{ content }}</main>
    <footer class="site-footer">
      <div>© {{ 'now' | date: '%Y' }} {{ site.author.name }}</div>
      <div class="site-footer__links">
        <a href="{{ site.linkedin_url }}" target="_blank" rel="noopener noreferrer">LinkedIn</a>
        <a href="{{ site.github_url }}" target="_blank" rel="noopener noreferrer">GitHub</a>
        <a href="{{ site.twitter_url }}" target="_blank" rel="noopener noreferrer">X</a>
        <a href="{{ "/feed.xml" | relative_url }}">RSS</a>
      </div>
    </footer>
    <script src="{{ "/assets/js/theme.js" | relative_url }}?v={{ site.time | date: '%s' }}"></script>
    <script defer src="{{ "/assets/js/code-blocks.js" | relative_url }}?v={{ site.time | date: '%s' }}"></script>
    {%- if page.layout == 'post' -%}
    <script defer src="{{ "/assets/js/toc.js" | relative_url }}?v={{ site.time | date: '%s' }}"></script>
    {%- endif -%}
    <script defer src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js" onload="initMermaid()"></script>
    <script>
      function initMermaid() {
        var theme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
        mermaid.initialize({ startOnLoad: true, theme: 'base', themeVariables: window.mermaidThemeVariables(theme) });
      }
    </script>
  </body>
</html>
```

`toc.js` is created in Task 4; until then the post page requests a missing file, which only logs a 404 in the console.

- [ ] **Step 10: Update `assets/css/main.scss`**

Replace its contents with:

```scss
---
---
@import "tokens";
@import "base";
@import "typography";
@import "header";
@import "footer";
@import "terminal-theme";
```

If the existing file has different front matter or extra lines before the imports, keep the front matter (the two `---` lines) and replace everything else.

- [ ] **Step 11: Update `_config.yml` description and excludes**

Add `  - docs/` to the `exclude:` list directly after `  - scripts/` (the list replaces Jekyll's defaults, so spec and plan files would otherwise be published as static files).

Change:
```yaml
description: >-
  Let's Nerd Out.
```
to:
```yaml
description: >-
  Business Central development, agentic tooling, and what actually works.
```

- [ ] **Step 12: Build and run tests**

Run:
```bash
bundle exec jekyll build --quiet && python -m unittest scripts.test_site_build -v
```
Expected: all `BuildSmokeTests` and `BaseLayoutTests` pass (8 tests). Home and post still render with the old inner styles; that is expected until Tasks 3 and 4.

- [ ] **Step 13: Commit**

```bash
git add _sass/_tokens.scss _sass/_base.scss _sass/_typography.scss _sass/_header.scss _sass/_footer.scss assets/js/theme.js assets/css/main.scss _layouts/base.html _config.yml scripts/test_site_build.py
git commit -m "feat(theme): tokens, header, footer, theme toggle and new base layout

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 3: Signature include and home page

**Files:**
- Create: `_includes/signature.html`, `_sass/_post-list.scss`
- Modify: `_layouts/home.html` (full rewrite), `assets/css/main.scss`
- Test: `scripts/test_site_build.py` (`HomeTests`)

**Interfaces:**
- Consumes: `.wrap`, `.sig*`, `.tag`, `.meta` from Task 2.
- Produces: `{% include signature.html kind="home" %}` and `{% include signature.html kind="post" post=page %}` rendering `<p class="sig">…</p>`. Task 4 uses the `post` kind.

- [ ] **Step 1: Write failing tests**

Replace the empty `HomeTests` class:

```python
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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `python -m unittest scripts.test_site_build.HomeTests -v`
Expected: 5 failures.

- [ ] **Step 3: Create `_includes/signature.html`**

```liquid
{%- comment -%}
Renders the single signature command line for a page.
  include signature.html kind="home"
  include signature.html kind="post" post=page
{%- endcomment -%}
{%- if include.kind == "home" -%}
<p class="sig"><span class="sig__path">PS C:\Blog&gt;</span> <span class="sig__verb">Get-ChildItem</span> .\posts\ | <span class="sig__verb">Sort-Object</span> Date -Descending</p>
{%- elsif include.kind == "post" -%}
{%- assign category = include.post.categories | first | default: "Posts" | replace: " ", "" -%}
{%- assign words = include.post.signature_file | default: include.post.title | truncatewords: 4, "" | split: " " -%}
{%- capture file -%}{%- for w in words -%}{{ w | remove: ":" | remove: "," | remove: "'" | remove: "’" | remove: '"' | remove: "?" | remove: "!" | remove: "(" | remove: ")" | remove: "." | remove: "/" | remove: "-" }}{%- endfor -%}{%- endcapture -%}
<p class="sig"><span class="sig__path">PS C:\DevProjects\DevBlog&gt;</span> <span class="sig__verb">Get-Content</span> <span class="sig__str">.\{{ category }}\{{ file }}.md</span></p>
{%- endif -%}
```

- [ ] **Step 4: Create `_sass/_post-list.scss`**

```scss
.home-intro { padding: 40px 0 8px; }
.home-intro__title {
  font-size: 1.6rem;
  line-height: 1.3;
  margin: 0 0 6px;
}
.home-intro__sub { margin: 0; color: var(--mute); }

.post-list { list-style: none; margin: 0; padding: 0; }
.post-list__item {
  padding: 26px 0;
  border-bottom: 1px solid var(--border);
}
.post-list__item .meta { margin-bottom: 8px; }
.post-list__title {
  font-size: 1.35rem;
  line-height: 1.3;
  margin: 0 0 8px;
}
.post-list__title a { color: var(--text); }
.post-list__desc {
  margin: 0 0 10px;
  color: var(--mute);
  font-size: 0.95em;
}

.pager {
  display: flex;
  justify-content: space-between;
  padding: 26px 0;
  font-size: 15px;
}
.pager__disabled { color: var(--mute); opacity: 0.5; }
```

- [ ] **Step 5: Rewrite `_layouts/home.html`**

```liquid
---
layout: base
---
<div class="wrap">
  <section class="home-intro">
    {% include signature.html kind="home" %}
    <h1 class="home-intro__title">{{ site.description | strip }}</h1>
    <p class="home-intro__sub">Notes from {{ site.author.name }}, {{ site.author.role | downcase }}. {{ site.posts.size }} posts.</p>
  </section>

  {% if paginator %}{% assign posts = paginator.posts %}{% else %}{% assign posts = site.posts %}{% endif %}
  <div class="post-list">
    {% for post in posts %}
      <article class="post-list__item">
        <div class="meta">
          <time datetime="{{ post.date | date_to_xmlschema }}">{{ post.date | date: '%Y-%m-%d' }}</time>
          <span>·</span>
          {% assign words = post.content | number_of_words %}
          <span>~{{ words | divided_by: 220 | at_least: 1 }} min</span>
        </div>
        <h2 class="post-list__title"><a href="{{ post.url | relative_url }}">{{ post.title | escape }}</a></h2>
        <p class="post-list__desc">
          {%- if post.description -%}
            {{ post.description | escape }}
          {%- else -%}
            {{ post.excerpt | strip_html | normalize_whitespace | truncatewords: 40 }}
          {%- endif -%}
        </p>
        {% if post.tags.size > 0 %}
          <div class="post-list__tags">
            {% for tag in post.tags limit: 3 %}
              <a class="tag" href="{{ '/tags/' | relative_url }}#{{ tag | slugify }}">{{ tag }}</a>
            {% endfor %}
          </div>
        {% endif %}
      </article>
    {% endfor %}
  </div>

  {% if paginator and paginator.total_pages > 1 %}
    <nav class="pager" aria-label="Pagination">
      {% if paginator.previous_page %}
        <a href="{{ paginator.previous_page_path | relative_url }}">‹ Newer</a>
      {% else %}
        <span class="pager__disabled">‹ Newer</span>
      {% endif %}
      <span class="meta">Page {{ paginator.page }} of {{ paginator.total_pages }}</span>
      {% if paginator.next_page %}
        <a href="{{ paginator.next_page_path | relative_url }}">Older ›</a>
      {% else %}
        <span class="pager__disabled">Older ›</span>
      {% endif %}
    </nav>
  {% endif %}
</div>
```

- [ ] **Step 6: Add the import**

In `assets/css/main.scss`, add `@import "post-list";` after `@import "footer";`.

- [ ] **Step 7: Build and run tests**

Run:
```bash
bundle exec jekyll build --quiet && python -m unittest scripts.test_site_build -v
```
Expected: 13 tests pass.

- [ ] **Step 8: Commit**

```bash
git add _includes/signature.html _sass/_post-list.scss _layouts/home.html assets/css/main.scss scripts/test_site_build.py
git commit -m "feat(home): plain post index with signature line

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 4: Post layout with column + rail, TOC highlight, code styles

**Files:**
- Create: `_sass/_post.scss`, `_sass/_toc.scss`, `_sass/_code.scss`, `assets/js/toc.js`
- Modify: `_layouts/post.html` (full rewrite), `assets/css/main.scss`, `assets/js/code-blocks.js`
- Test: `scripts/test_site_build.py` (`PostTests`)

**Interfaces:**
- Consumes: `signature.html` kind `post` (Task 3); `.wrap`, `.sig`, `.tag`, `.meta`, `.page-title`, `.deck`, `.post-body`, `#reading-progress` (Task 2); `_includes/toc.html` (existing, unchanged).
- Produces: `.post-body` as the article container used by `theme.js`; `.toc-rail a` and `.post-body h2[id]` used by `toc.js`.

- [ ] **Step 1: Write failing tests**

Replace the empty `PostTests` class:

```python
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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `python -m unittest scripts.test_site_build.PostTests -v`
Expected: 7 failures.

- [ ] **Step 3: Create `_sass/_post.scss`**

```scss
.post { }

.post__header { padding: 36px 0 8px; }
.post__header .meta { margin-top: 4px; }
.post__header .tag { margin-bottom: 0; }

.post-author {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: var(--mute);
  padding: 14px 0;
  margin-top: 14px;
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
}
.post-author__name { color: var(--text); font-weight: 600; }
.post-author__avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: var(--accent);
  color: var(--bg);
  display: grid;
  place-items: center;
  font-weight: 700;
  font-size: 13px;
  flex: none;
}

.post__main { padding-top: 24px; }

.post-share {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 20px;
  margin: 40px 0 0;
  padding-top: 20px;
  border-top: 1px solid var(--border);
  font-size: 14px;
}
.post-share button {
  background: none;
  border: 0;
  padding: 0;
  font: inherit;
  color: var(--accent);
  cursor: pointer;
}
.post-share button:hover { text-decoration: underline; }

.post-nav {
  display: grid;
  gap: 12px;
  margin: 32px 0 0;
}
@media (min-width: 600px) {
  .post-nav { grid-template-columns: 1fr 1fr; }
}
.post-nav__card {
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 14px 16px;
  background: var(--surface);
  color: var(--text);
}
.post-nav__card:hover { text-decoration: none; border-color: var(--accent); }
.post-nav__label {
  display: block;
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--mute);
  margin-bottom: 4px;
}

/* Column + rail from 1100px */
@media (min-width: 1100px) {
  .post .wrap--grid {
    max-width: 72rem;
    display: grid;
    grid-template-columns: minmax(0, var(--measure)) 16rem;
    grid-template-rows: auto auto;
    column-gap: 56px;
    justify-content: center;
  }
  .post__header { grid-column: 1; grid-row: 1; }
  .post__main { grid-column: 1; grid-row: 2; }
  .toc-rail { grid-column: 2; grid-row: 2; }
}
```

- [ ] **Step 4: Create `_sass/_toc.scss`**

```scss
/* Sticky rail: desktop only */
.toc-rail { display: none; }

@media (min-width: 1100px) {
  .toc-rail {
    display: block;
    position: sticky;
    top: 76px;
    align-self: start;
    padding-top: 30px;
    font-size: 14px;
  }
  .toc-rail__label {
    font-family: var(--font-mono);
    font-size: 12px;
    color: var(--mute);
    margin: 0 0 10px;
  }
  .toc-rail ul, .toc-rail ol {
    list-style: none;
    margin: 0;
    padding: 0;
    border-left: 1px solid var(--border);
  }
  .toc-rail li a {
    display: block;
    color: var(--mute);
    padding: 5px 14px;
    margin-left: -1px;
    border-left: 2px solid transparent;
    line-height: 1.35;
  }
  .toc-rail li a:hover { color: var(--text); text-decoration: none; }
  .toc-rail li a.is-current { color: var(--text); border-left-color: var(--accent); }
  .toc-details { display: none; }
}

/* Collapsible block: below 1100px */
.toc-details {
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--surface);
  padding: 6px 16px;
  margin: 0 0 24px;
  font-size: 15px;
}
.toc-details summary {
  cursor: pointer;
  font-family: var(--font-mono);
  font-size: 13px;
  color: var(--mute);
  padding: 8px 0;
}
.toc-details ul, .toc-details ol { margin: 4px 0 10px; padding-left: 1.3em; }
.toc-details li { margin: 5px 0; }
.toc-details a { color: var(--text); }
```

- [ ] **Step 5: Create `_sass/_code.scss`**

```scss
/* Inline code */
code {
  font-family: var(--font-mono);
  font-size: 0.9em;
}
.post-body p code, .post-body li code, .post-body td code {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 1px 5px;
}

/* Blocks: plain kramdown output and Rouge .highlight wrapper */
.post-body pre,
.post-body .highlight {
  margin: 1.4em 0;
  background: var(--code-bg);
  border: 1px solid var(--border);
  border-radius: 8px;
  overflow: hidden;
}
.post-body pre {
  padding: 14px 16px;
  overflow-x: auto;
  font-family: var(--font-mono);
  font-size: 14px;
  line-height: 1.55;
  color: var(--text);
}
.post-body .highlight pre { margin: 0; border: 0; border-radius: 0; background: transparent; }
.post-body pre code { background: transparent; border: 0; padding: 0; font-size: inherit; }

/* Rouge token classes */
.highlight .c, .highlight .c1, .highlight .cm, .highlight .cp, .highlight .cs { color: var(--code-comment); font-style: italic; }
.highlight .k, .highlight .kc, .highlight .kd, .highlight .kn, .highlight .kp, .highlight .kr, .highlight .kt, .highlight .o, .highlight .ow { color: var(--code-keyword); }
.highlight .s, .highlight .s1, .highlight .s2, .highlight .sb, .highlight .sc, .highlight .sd, .highlight .se, .highlight .sh, .highlight .si, .highlight .sx, .highlight .sr, .highlight .ss { color: var(--code-string); }
.highlight .nb, .highlight .nc, .highlight .nd, .highlight .ne, .highlight .nf, .highlight .nl, .highlight .nn, .highlight .nx, .highlight .py { color: var(--code-function); }
.highlight .na, .highlight .nv, .highlight .vi, .highlight .vc, .highlight .vg { color: var(--code-variable); }
.highlight .m, .highlight .mb, .highlight .mf, .highlight .mh, .highlight .mi, .highlight .mo, .highlight .il { color: var(--code-number); }
.highlight .nt { color: var(--code-type); }
.highlight .err { color: var(--code-keyword); }
.highlight .gh, .highlight .gu { color: var(--code-number); font-weight: bold; }

/* Classes produced by assets/js/code-blocks.js */
.code-block-wrapper {
  margin: 1.4em 0;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--code-bg);
  overflow: hidden;
}
.code-block-wrapper pre { margin: 0; border: 0; border-radius: 0; }
.code-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 12px;
  border-bottom: 1px solid var(--border);
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--mute);
}
.copy-button {
  font: inherit;
  color: var(--mute);
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 2px 10px;
  cursor: pointer;
}
.copy-button:hover { color: var(--text); border-color: var(--accent); }
.copy-button.copied { color: var(--path); border-color: var(--path); }
.syntax-keyword { color: var(--code-keyword); }
.syntax-type { color: var(--code-type); }
.syntax-function, .syntax-builtin, .syntax-decorator { color: var(--code-function); }
.syntax-string { color: var(--code-string); }
.syntax-comment { color: var(--code-comment); font-style: italic; }
.syntax-number { color: var(--code-number); }
.syntax-variable, .syntax-attribute, .syntax-property { color: var(--code-variable); }
.syntax-operator, .syntax-punctuation { color: var(--text); }
.syntax-tag { color: var(--code-type); }
.ps-prompt { color: var(--path); font-weight: 700; }

/* Mermaid */
.post-body .mermaid { text-align: center; margin: 1.4em 0; }
```

- [ ] **Step 6: Create `assets/js/toc.js`**

```javascript
// Highlights the current H2 in the sticky rail.
(function () {
  document.addEventListener('DOMContentLoaded', function () {
    var links = Array.prototype.slice.call(document.querySelectorAll('.toc-rail a[href^="#"]'));
    if (!links.length || !('IntersectionObserver' in window)) return;
    var byId = {};
    links.forEach(function (a) { byId[decodeURIComponent(a.getAttribute('href').slice(1))] = a; });
    var headings = Array.prototype.slice.call(document.querySelectorAll('.post-body h2[id]'))
      .filter(function (h) { return byId[h.id]; });
    if (!headings.length) return;

    function setCurrent(id) {
      links.forEach(function (a) { a.classList.toggle('is-current', a === byId[id]); });
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) setCurrent(e.target.id); });
    }, { rootMargin: '-10% 0px -70% 0px', threshold: 0 });
    headings.forEach(function (h) { observer.observe(h); });
    setCurrent(headings[0].id);
  });
})();
```

- [ ] **Step 7: Rewrite `_layouts/post.html`**

```liquid
---
layout: base
---
{% assign words = content | number_of_words %}
{% assign minutes = words | divided_by: 220 | at_least: 1 %}
{% assign name_words = site.author.name | split: " " %}
{% capture initials %}{% for w in name_words %}{{ w | slice: 0 }}{% endfor %}{% endcapture %}
<article class="post">
  <div class="wrap wrap--grid">
    <header class="post__header">
      {% include signature.html kind="post" post=page %}
      <h1 class="page-title">{{ page.title | escape }}</h1>
      {% if page.description %}<p class="deck">{{ page.description | escape }}</p>{% endif %}
      <div class="meta">
        <time datetime="{{ page.date | date_to_xmlschema }}">{{ page.date | date: '%Y-%m-%d' }}</time>
        <span>·</span>
        <span>~{{ minutes }} min read</span>
        {% if page.tags.size > 0 %}
          <span>·</span>
          <span>
            {% for tag in page.tags %}<a class="tag" href="{{ '/tags/' | relative_url }}#{{ tag | slugify }}">{{ tag }}</a>{% endfor %}
          </span>
        {% endif %}
      </div>
      <div class="post-author">
        <span class="post-author__avatar" aria-hidden="true">{{ initials }}</span>
        <span><span class="post-author__name">{{ site.author.name }}</span> · {{ site.author.role }}</span>
      </div>
    </header>

    {% capture toc %}{% include toc.html html=content h_min=2 h_max=2 sanitize=true %}{% endcapture %}
    {% assign toc = toc | replace: '<ul id="markdown-toc">', '<ul>' %}
    {% assign has_toc = toc | strip | size %}

    <div class="post__main">
      {% if page.toc != false and has_toc > 0 %}
        <details class="toc-details" open>
          <summary>On this page</summary>
          {{ toc }}
        </details>
      {% endif %}
      <div class="post-body">
        {{ content }}
      </div>
      <div class="post-share">
        <a href="https://www.linkedin.com/sharing/share-offsite/?url={{ site.url }}{{ page.url }}" target="_blank" rel="noopener noreferrer">Share on LinkedIn</a>
        <a href="https://x.com/intent/post?text={{ page.title | url_encode }}&url={{ site.url }}{{ page.url }}" target="_blank" rel="noopener noreferrer">Share on X</a>
        <button type="button" id="copy-link" data-url="{{ site.url }}{{ page.url }}">Copy link</button>
      </div>
      <nav class="post-nav" aria-label="Adjacent posts">
        {% if page.previous %}
          <a href="{{ page.previous.url | relative_url }}" class="post-nav__card"><span class="post-nav__label">‹ Previous</span>{{ page.previous.title | escape }}</a>
        {% else %}<span></span>{% endif %}
        {% if page.next %}
          <a href="{{ page.next.url | relative_url }}" class="post-nav__card"><span class="post-nav__label">Next ›</span>{{ page.next.title | escape }}</a>
        {% else %}<span></span>{% endif %}
      </nav>
    </div>

    {% if page.toc != false and has_toc > 0 %}
      <aside class="toc-rail" aria-label="On this page">
        <p class="toc-rail__label">On this page</p>
        {{ toc }}
      </aside>
    {% endif %}
  </div>
</article>
<script>
  (function () {
    var btn = document.getElementById('copy-link');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var url = btn.dataset.url;
      var done = function () { btn.textContent = 'Copied'; setTimeout(function () { btn.textContent = 'Copy link'; }, 2000); };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(done, function () { window.prompt('Copy this link', url); });
      } else {
        window.prompt('Copy this link', url);
      }
    });
  })();
</script>
```

The existing `_includes/toc.html` emits `<ul id="markdown-toc">`; the replace above drops the id so it is not duplicated between the rail and the details block. Heading emojis: `toc.html` strips HTML only, so the emoji stays in the text. Add emoji stripping to the include in the next step.

- [ ] **Step 8: Strip leading emoji in `_includes/toc.html`**

Find the line:
```liquid
        {% if include.sanitize == true %}
            {% assign header = header | strip_html %}
        {% endif %}
```
Replace with:
```liquid
        {% if include.sanitize == true %}
            {% assign header = header | strip_html %}
        {% endif %}
        {% assign headerWords = header | strip | split: " " %}
        {% assign firstWord = headerWords | first %}
        {% assign firstWordSize = firstWord | size %}
        {% assign firstWordAscii = firstWord | slugify: "ascii" | size %}
        {% if firstWordAscii == 0 and firstWordSize > 0 and headerWords.size > 1 %}
            {% assign header = headerWords | shift | join: " " %}
        {% endif %}
```
A leading word that slugifies to nothing is an emoji (or other non-letter glyph); it is dropped. Words containing letters keep everything.

- [ ] **Step 9: Trim `assets/js/code-blocks.js`**

Find and delete these two lines inside the `psCodeElements.forEach` block (keep the surrounding code):
```javascript
      prompt.style.color = '#ffff00';
      prompt.style.fontWeight = 'bold';
```
Then delete the whole trailing block that starts with the comment `// Smooth scrolling for TOC links` through the end of that `forEach(...)` call (the `.post-toc` selector no longer exists). Keep the final `});` that closes `DOMContentLoaded`.

- [ ] **Step 10: Add imports**

In `assets/css/main.scss`, add after `@import "post-list";`:
```scss
@import "post";
@import "toc";
@import "code";
```

- [ ] **Step 11: Build and run tests**

Run:
```bash
bundle exec jekyll build --quiet && python -m unittest scripts.test_site_build -v
```
Expected: 20 tests pass. If `test_exactly_one_signature_line_with_get_content` fails on the file name, print the built `.sig` line with `grep -o '<p class="sig">.*</p>' _site/ai/development/2026/07/31/*.html` and adjust the `remove:` filters in `signature.html` so every non-letter is dropped; do not change the test.

- [ ] **Step 12: Commit**

```bash
git add _sass/_post.scss _sass/_toc.scss _sass/_code.scss assets/js/toc.js assets/js/code-blocks.js _layouts/post.html _includes/toc.html assets/css/main.scss scripts/test_site_build.py
git commit -m "feat(post): column + rail layout, toc highlight, themed code blocks

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 5: Page layout, About facts, Tags page

**Files:**
- Create: `_sass/_tags.scss`
- Modify: `_layouts/page.html` (full rewrite), `about.md`, `tags.html`, `assets/css/main.scss`
- Test: `scripts/test_site_build.py` (`PageTests`)

**Interfaces:**
- Consumes: `.wrap`, `.page-title`, `.deck`, `.post-body`, `.tag`, `.meta` (Task 2).

- [ ] **Step 1: Write failing tests**

Replace the empty `PageTests` class:

```python
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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `python -m unittest scripts.test_site_build.PageTests -v`
Expected: 2 failures.

- [ ] **Step 3: Rewrite `_layouts/page.html`**

```liquid
---
layout: base
---
<article class="page wrap">
  <header class="page__header">
    <h1 class="page-title">{{ page.title | escape }}</h1>
    {% if page.description %}<p class="deck">{{ page.description | escape }}</p>{% endif %}
  </header>
  <div class="post-body">
    {{ content }}
  </div>
</article>
```

Add to the end of `_sass/_base.scss`:
```scss
.page__header { padding: 36px 0 16px; }

.facts {
  display: grid;
  grid-template-columns: max-content 1fr;
  gap: 4px 16px;
  font-family: var(--font-mono);
  font-size: 13px;
  margin: 0 0 24px;
  padding: 12px 16px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--surface);
}
.facts dt { color: var(--mute); }
.facts dd { margin: 0; }
```

- [ ] **Step 4: Update `about.md`**

Replace the front matter and the image line at the top with:

```markdown
---
layout: page
title: About
description: Business Central developer, consultant, and writer.
---

<dl class="facts">
  <dt>Role</dt><dd>{{ site.author.role }}</dd>
  <dt>Stack</dt><dd>{{ site.author.stack }}</dd>
  <dt>Location</dt><dd>{{ site.author.location }}</dd>
</dl>

<img src="{{ '/assets/images/profilepicture.png' | relative_url }}" alt="Flemming Bakkensen" class="about-photo">
```

Keep the rest of the file unchanged. Add to `_sass/_base.scss`:
```scss
.about-photo { float: right; width: 160px; margin: 0 0 1em 1.5em; border-radius: 12px; }
@media (max-width: 600px) { .about-photo { float: none; display: block; margin: 0 0 1em; } }
```

- [ ] **Step 5: Rewrite the markup part of `tags.html`**

Replace everything from the opening `<div class="tags-page">` through the closing `</div>` before `<script>` with:

```html
<div class="tags-page">
  <div id="tag-cloud" class="tag-cloud"></div>
  <p class="meta tags-page__current">Showing: <span id="selected-tag">all</span></p>
  <div id="tag-posts" class="post-list"></div>
</div>
```

Replace the whole `<script>` block with:

```html
<script>
const posts = [
  {% for post in site.posts %}
  {
    title: {{ post.title | jsonify }},
    url: {{ post.url | jsonify }},
    date: {{ post.date | date: "%Y-%m-%d" | jsonify }},
    excerpt: {{ post.description | default: post.excerpt | strip_html | normalize_whitespace | truncatewords: 40 | jsonify }},
    tags: {{ post.tags | jsonify }}
  }{% unless forloop.last %},{% endunless %}
  {% endfor %}
];

const slugOf = (tag) => tag.toLowerCase().trim().replace(/\s+/g, '-');
const tagCounts = {};
const bySlug = {};
posts.forEach((post) => {
  (post.tags || []).forEach((tag) => {
    tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    bySlug[slugOf(tag)] = tag;
  });
});

const cloud = document.getElementById('tag-cloud');
Object.entries(tagCounts)
  .sort((a, b) => b[1] - a[1])
  .forEach(([tag, count]) => {
    const link = document.createElement('a');
    link.href = '#' + slugOf(tag);
    link.className = 'tag tag--count';
    link.dataset.tag = tag;
    link.innerHTML = `${tag} <span class="tag__count">${count}</span>`;
    cloud.appendChild(link);
  });

function displayPosts(list) {
  const container = document.getElementById('tag-posts');
  container.innerHTML = '';
  list.forEach((post) => {
    const el = document.createElement('article');
    el.className = 'post-list__item';
    el.innerHTML = `
      <div class="meta"><time>${post.date}</time></div>
      <h2 class="post-list__title"><a href="${post.url}">${post.title}</a></h2>
      <p class="post-list__desc">${post.excerpt}</p>
    `;
    container.appendChild(el);
  });
}

function showPostsForTag(tag) {
  document.getElementById('selected-tag').textContent = tag;
  displayPosts(posts.filter((post) => (post.tags || []).includes(tag)));
  document.querySelectorAll('.tag--count').forEach((link) => {
    link.classList.toggle('is-active', link.dataset.tag === tag);
  });
}

function showAllPosts() {
  document.getElementById('selected-tag').textContent = 'all';
  displayPosts(posts);
  document.querySelectorAll('.tag--count').forEach((link) => link.classList.remove('is-active'));
}

function applyHash() {
  const tag = bySlug[decodeURIComponent(window.location.hash.slice(1))];
  if (tag) showPostsForTag(tag); else showAllPosts();
}

window.addEventListener('hashchange', applyHash);
applyHash();
</script>
```

Tag pills on home and post pages link to `/tags/#<slugified tag>`, so lookups go through `bySlug`. The old script replaced hyphens with spaces before lookup, which broke every hyphenated tag.

- [ ] **Step 6: Create `_sass/_tags.scss`**

```scss
.tags-page { padding-top: 8px; }
.tag-cloud { margin: 0 0 20px; }
.tag--count .tag__count { color: var(--mute); }
.tag--count.is-active { background: var(--accent); color: var(--bg); border-color: var(--accent); }
.tag--count.is-active .tag__count { color: var(--bg); }
.tags-page__current { margin: 0 0 8px; }
```

Add `@import "tags";` at the end of `assets/css/main.scss` (before the `terminal-theme` import).

- [ ] **Step 7: Build and run tests**

Run:
```bash
bundle exec jekyll build --quiet && python -m unittest scripts.test_site_build -v
```
Expected: 22 tests pass.

- [ ] **Step 8: Commit**

```bash
git add _layouts/page.html about.md tags.html _sass/_tags.scss _sass/_base.scss assets/css/main.scss scripts/test_site_build.py
git commit -m "feat(pages): restyle about and tags on the page layout

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 6: Delete the old theme and dead files, update docs

**Files:**
- Delete: `_sass/terminal-theme.scss`, `_layouts/home2.html`, `_includes/header.html`, `_includes/nav.html`, `assets/js/mobile-nav.js`, `Screenshot.png`
- Modify: `assets/css/main.scss`, `AGENTS.md`, `.claude/skills/blog-post-writer/SKILL.md`
- Test: `scripts/test_site_build.py` (`CleanupTests`)

- [ ] **Step 1: Write failing tests**

Replace the empty `CleanupTests` class:

```python
class CleanupTests(SiteTestCase):
    def test_old_theme_classes_absent_from_css(self):
        css = (self.site / "assets/css/main.css").read_text(encoding="utf-8")
        for needle in [".tp-root", ".tp-chrome", ".pp-article", "--tp-bg"]:
            self.assertNotIn(needle, css)

    def test_dead_files_not_built(self):
        self.assertFalse((self.site / "assets/js/mobile-nav.js").exists())
        self.assertFalse((self.site / "Screenshot.png").exists())
        self.assertFalse((self.site / "docs").exists())

    def test_no_old_classes_in_pages(self):
        for rel in [HOME, TAGS, ABOUT]:
            html = self.read(rel)
            self.assertNotRegex(html, r'class="(tp|pp)-')
        self.assertNotRegex(self.read(POST), r'class="(tp|pp)-')
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `python -m unittest scripts.test_site_build.CleanupTests -v`
Expected: 2 or 3 failures (the CSS one and the dead-files one at minimum).

- [ ] **Step 3: Delete files and the import**

```bash
git rm -q _sass/terminal-theme.scss _layouts/home2.html _includes/header.html _includes/nav.html assets/js/mobile-nav.js Screenshot.png
```
In `assets/css/main.scss` delete the line `@import "terminal-theme";`.

- [ ] **Step 4: Rewrite the theme sections of `AGENTS.md`**

Replace the `### Theme: Terminal/PowerShell UI` section with:

```markdown
### Theme: Reading-first, light and dark
- CSS custom properties in `_sass/_tokens.scss` (light on `:root`, dark on `html[data-theme="dark"]`): bg, surface, text, mute, border, accent, path, string, code-*.
- Inter for body text (17px, 18px from 768px, line-height 1.65); JetBrains Mono for code, meta, tags, and the signature line.
- Reading column max-width 42rem (`.wrap`). Posts add a sticky table-of-contents rail from 1100px.
- Theme toggle in the header, persisted in `localStorage.theme`, default from `prefers-color-scheme`.
- Exactly one signature PowerShell line per page, rendered by `_includes/signature.html`. No other command-styled UI: nav, links, buttons and footer are plain text.
```

Replace the `### Layout Hierarchy` section with:

```markdown
### Layout Hierarchy
- `base.html` - head with theme bootstrap, sticky header (brand, Blog · Tags · About, theme toggle), reading-progress bar on posts, footer (LinkedIn, GitHub, X, RSS), scripts, Mermaid
- `home.html` - intro with signature line, paginated post list, pager
- `post.html` - signature line, title, deck, meta, author, TOC (rail on desktop, `<details>` below 1100px), body, share links, previous/next
- `page.html` - title, optional description, body (About, Tags)
```

Replace the `### SCSS Styles` bullets with:

```markdown
### SCSS Styles
- One partial per component in `_sass/`: `_tokens`, `_base`, `_typography`, `_header`, `_footer`, `_post-list`, `_post`, `_toc`, `_code`, `_tags`; `assets/css/main.scss` only imports
- Colours and fonts only via the custom properties from `_tokens.scss`; never hardcode a hex value in a component partial
- BEM-like naming (`block__element--modifier`), state classes `is-current`, `is-active`
- Mobile first; breakpoints 600px, 768px, 1100px
```

In `### File Structure`, change the `_sass/terminal-theme.scss: Theme styles` line to `_sass/`: one partial per component, see SCSS Styles`. In `### Modifying the Theme`, change item 1 to `Colors/Fonts: Edit _sass/_tokens.scss` and item 3 to `Navigation: Update the header block in _layouts/base.html`. Under `### Testing`, add a first line: `Build checks: bundle exec jekyll build --quiet && python -m unittest scripts.test_site_build -v`. Under `### Social links` in Configuration, remove Bluesky from the list.

- [ ] **Step 5: Update `.claude/skills/blog-post-writer/SKILL.md`**

Line with the CTA example: replace `or [Bluesky](https://bsky.app/profile/fbakkensen.bsky.social)` with `or [X](https://x.com/fbakkensen)`. In the table row `| Social CTA | Closing with LinkedIn and Bluesky links |` change to `LinkedIn and X links`. Leave the `<span class="prompt">` opener lines untouched.

- [ ] **Step 6: Build and run tests**

Run:
```bash
bundle exec jekyll build --quiet && python -m unittest scripts.test_site_build -v
```
Expected: 25 tests pass. Also run `grep -rn "tp-\|pp-" _layouts _includes tags.html about.md` and expect no output.

- [ ] **Step 7: Commit**

```bash
git add -A _sass assets/css/main.scss _layouts _includes AGENTS.md .claude/skills/blog-post-writer/SKILL.md scripts/test_site_build.py
git commit -m "chore: remove terminal theme and dead files, update docs

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 7: Browser verification and prototype removal

**Files:**
- Delete: `design-prototypes/`
- Modify: `_config.yml` (remove the `design-prototypes/` exclude line)

- [ ] **Step 1: Serve the built site**

Run in the background: `bundle exec jekyll serve --quiet --port 4000` (or use the Browser pane's `preview_start` with a `.claude/launch.json` entry `{"name":"jekyll","runtimeExecutable":"bundle","runtimeArgs":["exec","jekyll","serve","--port","4000"],"port":4000}`).

- [ ] **Step 2: Screenshot matrix with Chrome DevTools MCP**

For each URL below, at 1280×900 and 390×844, in light and dark (set via `evaluate_script`: `() => { localStorage.setItem('theme','dark'); location.reload(); }`), take a screenshot to a folder outside the repository, for example `$env:TEMP\site-verification\<page>-<w>-<theme>.png` (never commit screenshots):

1. `http://localhost:4000/`
2. `http://localhost:4000/page2/`
3. `http://localhost:4000/ai/development/2026/07/31/ai-software-factory-automate-execution-not-decisions.html`
4. the built URL of `_posts/2026-07-07-agentic-development-mid-2026-cost-before-gain.md` (legacy prompt post)
5. the built URL of `_posts/2026-03-27-quality-gates-for-coding-agents-how-stop-hooks-make-validation-mandatory.md` (Mermaid)
6. `http://localhost:4000/tags/`
7. `http://localhost:4000/about`

Look at every screenshot. Checklist:
- Header fits on one line at 390px; no horizontal page scroll.
- Post page at 1280px shows the rail; at 390px shows the `<details>` block instead.
- Exactly one signature line on 3 and 4 (the legacy `.prompt` paragraph is hidden).
- Code blocks and Mermaid readable in both themes.
- Tag pills and the tags page filter look consistent.

- [ ] **Step 3: Behaviour checks with `evaluate_script` on page 3**

```javascript
() => {
  window.scrollTo(0, document.querySelectorAll('.post-body h2')[2].offsetTop + 10);
  return new Promise(r => setTimeout(() => r({
    current: document.querySelector('.toc-rail a.is-current')?.textContent,
    progress: document.getElementById('reading-progress').style.width,
    theme: document.documentElement.dataset.theme
  }), 300));
}
```
Expected: `current` is the third H2's text, `progress` is between `20%` and `80%`, `theme` matches what you set. Then click `#theme-toggle` (`click` tool), reload, and confirm `document.documentElement.dataset.theme` kept the new value. On page 5, after toggling, confirm `document.querySelector('.mermaid svg')` is non-null and its `style` or fill colours changed.

- [ ] **Step 4: Console and Lighthouse**

Use `list_console_messages` on pages 1, 3, 5: expect no errors (Google Fonts or Mermaid CDN warnings are acceptable, 404s are not). Run `lighthouse_audit` with category `accessibility` on pages 1 and 3: expect score ≥ 95. Fix any flagged contrast or label issue in the relevant partial, rebuild, re-run.

- [ ] **Step 5: Remove prototypes**

```bash
git rm -rq design-prototypes
```
In `_config.yml` delete the line `  - design-prototypes/`.

- [ ] **Step 6: Final build and tests**

Run:
```bash
bundle exec jekyll build --quiet && python -m unittest scripts.test_site_build -v
```
Expected: 25 tests pass.

- [ ] **Step 7: Commit**

```bash
git add -A _config.yml design-prototypes
git commit -m "chore: verify redesign in browser, remove design prototypes

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

Then open a pull request from `claude/site-design-options-ecb571` to `main` with `GH_HOST=github.com gh pr create`, title `Redesign site: reading-first column + rail theme`, body summarising the spec sections and the verification checklist results (attach the key screenshots to the PR with `gh pr comment --body` after uploading, or paste them via the GitHub UI), ending with `🤖 Generated with [Claude Code](https://claude.com/claude-code)`.
