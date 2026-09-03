# Site redesign: readable column + rail

Date: 2026-09-03
Status: approved in brainstorming, pending implementation plan

## Goal

Replace the "Windows Terminal Pro" theme with a reading-first design that keeps the
PowerShell identity as one signature element per page. Fix three problems with the
current site: long posts are hard to read, the layout is cluttered (fake window chrome,
three sidebar panes, command-line styling on every link), and the mobile experience
is weak.

Decisions taken during brainstorming:

- Light and dark theme with a header toggle, remembered in `localStorage`, defaulting
  to the system preference.
- The terminal metaphor survives as accents (monospace meta, accent colour, `›` brand
  glyph) plus exactly one signature command line per page. Nav reads "Blog · Tags · About".
- Home is a plain post index with a one-line intro. No sidebar anywhere.
- Post layout is "column + rail": a centred reading column with a sticky table of
  contents rail on wide screens (prototype 2 in `design-prototypes/`).

## Non-goals

- No change to post content, URLs, permalinks, feed, sitemap, or llms.txt generation.
- No new build tooling. The site keeps building on the default GitHub Pages Jekyll build.
- No self-hosted fonts in this iteration.
- No search feature. The "Find-Post" form is removed; tags page remains the filter.

## Visual system

### Tokens

`_sass/_tokens.scss` defines CSS custom properties. Light values on `:root`, dark
values on `html[data-theme="dark"]`.

| Token | Light | Dark |
|---|---|---|
| `--bg` | `#FFFFFF` | `#0D1117` |
| `--surface` | `#F6F8FA` | `#161B22` |
| `--text` | `#1F2328` | `#E6EDF3` |
| `--mute` | `#656D76` | `#8B949E` |
| `--border` | `#D0D7DE` | `#30363D` |
| `--accent` | `#6639BA` | `#D2A8FF` |
| `--path` | `#1A7F37` | `#7EE787` |
| `--string` | `#0A3069` | `#A5D6FF` |
| `--code-bg` | `#F6F8FA` | `#161B22` |

Rouge token colours (keywords, strings, comments, numbers, functions) are mapped to
tokens in `_sass/_code.scss` so code blocks follow the theme.

### Typography

- Body: Inter, 17px on small screens, 18px from 768px, line-height 1.65.
- Reading measure: column max-width 42rem.
- Monospace: JetBrains Mono for code, post meta, tags, the signature line, and the
  "On this page" label.
- Headings: Inter 600/700, tight letter-spacing. Post title 2rem mobile, 2.4rem desktop.
- Fonts continue to load from Google Fonts with `display=swap`.

### Signature command line

Rendered by `_includes/signature.html`, monospace, muted, path in `--path`, verb in
`--accent`, string in `--string`. Horizontal overflow scrolls with a right-edge fade
mask instead of a visible scrollbar.

- Home: `PS C:\Blog> Get-ChildItem .\posts\ | Sort-Object Date -Descending`
- Post: `PS C:\DevProjects\DevBlog> Get-Content .\<FirstCategory>\<TitleSlugPascal>.md`
  where `<FirstCategory>` is the first entry in `page.categories` (default `Posts`)
  and the file name is the post title with non-alphanumerics removed.
- About and Tags: none.

Six existing posts begin with `<span class="prompt">PS C:\...</span> Get-Content ...`.
The theme hides the paragraph that contains `.prompt` when it is the first child of
the post body (`.post-body > p:first-child:has(> .prompt)`), so those posts show one
signature line. The `blog-post-writer` skill template keeps the opener because the
layout renders it correctly either way.

### Mermaid

`base.html` keeps loading Mermaid from the CDN. Two theme-variable sets (light, dark)
are defined; the active one is chosen at init from `data-theme`, and the toggle
re-renders diagrams by re-running `mermaid.run()` after swapping the theme.

## Layouts and components

Layout hierarchy stays `base` → `home` / `post` / `page`.

### `_layouts/base.html`

- `<head>`: meta, `seo` tag, inline theme bootstrap (reads `localStorage.theme`, falls
  back to `prefers-color-scheme`, sets `data-theme` before CSS loads), fonts, stylesheet,
  favicon, feed meta, analytics in production.
- Header: sticky, translucent with blur, 56px. Contents: brand (`›` glyph + author name,
  links home), nav (Blog, Tags, About; current page marked with `aria-current`), theme
  toggle button (`aria-label`, shows ☾ or ☀). A 2px reading-progress bar sits under the
  header and is only visible on post pages.
- `<main>{{ content }}</main>`.
- Footer: `© <year> <author name>` and links LinkedIn · GitHub · X · RSS.
- Scripts: `assets/js/theme.js` (toggle, progress bar), `assets/js/toc.js` (only on post
  layout), `assets/js/code-blocks.js` (existing copy button), Mermaid loader.
- Removed: window chrome block, hamburger button, `mobile-nav.js`.

### `_layouts/home.html`

- Intro block: signature line, one-sentence H1 tagline from `site.description` (which
  changes from "Let's Nerd Out." to "Business Central development, agentic tooling, and
  what actually works."), muted sub-line with author name and post count.
- Post list: one `<article>` per post with meta line (ISO date · ~N min), title link,
  description (`post.description`, falling back to the excerpt stripped of HTML and
  truncated to 40 words), up to three tag pills.
- Pager: "‹ Newer" / "Older ›" links using `jekyll-paginate` paths.
- Removed: sidebar (whoami, recent posts, Find-Post).

### `_layouts/post.html`

- Header (in the reading column): signature line, H1, description as deck, meta line
  (date · ~N min read · all tag pills), author line (avatar initials, name, role).
- Grid at ≥1100px: `minmax(0, 42rem) 16rem`, gap 56px, centred. Header spans row 1
  column 1, body row 2 column 1, rail row 2 column 2, sticky at `top: 76px`.
- Rail: label "On this page" and an `<ol>` of H2 links, rendered by the existing
  `_includes/toc.html` with `h_min=2 h_max=2 sanitize=true`. The leading emoji in
  headings is stripped from the TOC text by the include. Current section highlighted
  via `toc.js` (IntersectionObserver on `h2`, `rootMargin: -10% 0 -70% 0`).
- Below 1100px: the rail is hidden and a `<details class="toc" open>` with the same
  list sits at the top of the body.
- Body: `{{ content }}` in `.post-body`.
- After the body: three text links (Share on LinkedIn, Share on X, Copy link; copy uses
  the Clipboard API with a fallback to selecting the URL), then prev/next cards.
- Removed: breadcrumb command line, Read-Progress pane, Share-Post pane,
  "Get-AuthorPosts" link, `Get-NextPost` prompt.

### `_layouts/page.html`

Title, optional description, body in the reading column. Used by `about.md` and
`tags.html`.

### `about.md`

Gains a short facts block (role, stack, location, from `site.author`) at the top so
the removed whoami pane loses nothing.

### `tags.html`

Keeps its JavaScript tag cloud and filtering. Markup is restyled with the new tag pill
and list components; the `?q=` handling from the removed Find-Post form is dropped.

### JavaScript

| File | Status | Responsibility |
|---|---|---|
| `assets/js/theme.js` | new | toggle button, persist theme, update Mermaid, reading-progress bar |
| `assets/js/toc.js` | new | highlight current H2 in the rail |
| `assets/js/code-blocks.js` | kept | copy button on code blocks |
| `assets/js/mobile-nav.js` | deleted | no hamburger |

All scripts are vanilla ES6 with cache-busting query strings as today.

### SCSS structure

`assets/css/main.scss` imports, in order: `_tokens`, `_base`, `_typography`,
`_header`, `_post-list`, `_post`, `_toc`, `_code`, `_footer`, `_tags`.
`_sass/terminal-theme.scss` is deleted. Class names use short prefixes per component
(`site-header`, `post-list`, `post`, `toc`, `tag`), BEM-style modifiers.

## Cleanup

Delete: `_layouts/home2.html`, `_includes/header.html`, `_includes/nav.html`,
`Screenshot.png`, `assets/js/mobile-nav.js`, `_sass/terminal-theme.scss`. Delete
`design-prototypes/` and its `_config.yml` exclude entry in the final commit of the
implementation.

Update `AGENTS.md`: replace the "Theme: Terminal/PowerShell UI" section and the SCSS
guidance with the token list, the layout hierarchy above, and the rule "one signature
command line per page, no other command-styled UI". Update `blog-post-writer`
references so the CTA lists LinkedIn and X only.

## Verification

1. `bundle exec jekyll build` completes without warnings from our files.
2. Chrome DevTools screenshots at 390×844 and 1280×900, light and dark, of: home page 1,
   home page 2, the AI Software Factory post (longest recent), one of the six
   legacy-prompt posts, tags page, about page.
3. Check on the post page: exactly one signature line, rail visible at 1280 and hidden
   at 390, current-section highlight moves on scroll, toggle persists across reload,
   Mermaid diagram re-themes on toggle (use the 2026-03-27 quality-gates post), no console errors.
4. Lighthouse accessibility score ≥ 95 on home and a post page.
5. All internal links in the header and footer resolve.
