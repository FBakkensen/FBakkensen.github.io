# AGENTS.md - Jekyll Blog Development Guide

## Build Commands

### First-time Setup
```bash
bundle install
```

### Local Development
```bash
# Start Jekyll server with live reload
bundle exec jekyll serve --livereload --future
# Runs at http://127.0.0.1:4000/
```

### Testing
Build checks: bundle exec jekyll build --quiet && python -m unittest scripts.test_site_build -v

No unit test framework. Use Playwright MCP for browser testing:
- Navigate with `mcp_playwright_browser_navigate`
- Check console errors with `mcp_playwright_browser_console_messages`
- Test responsive design with `mcp_playwright_browser_resize`
- Take screenshots with `mcp_playwright_browser_take_screenshot`

Test these scenarios:
1. Home page with pagination
2. Individual blog posts with TOC
3. Tags page filtering
4. Navigation flows
5. Responsive layouts (mobile/tablet/desktop)
6. Console errors and network failures

## Project Architecture

### Theme: Reading-first, light and dark
- CSS custom properties in `_sass/_tokens.scss` (light on `:root`, dark on `html[data-theme="dark"]`): bg, surface, text, mute, border, accent, path, string, code-*.
- Inter for body text (17px, 18px from 768px, line-height 1.65); JetBrains Mono for code, meta, tags, and the signature line.
- Reading column max-width 42rem (`.wrap`). Posts add a sticky table-of-contents rail from 1100px.
- Theme toggle in the header, persisted in `localStorage.theme`, default from `prefers-color-scheme`.
- Exactly one signature PowerShell line per page, rendered by `_includes/signature.html`. No other command-styled UI: nav, links, buttons and footer are plain text.

### Layout Hierarchy
- `base.html` - head with theme bootstrap, sticky header (brand, Blog · Tags · About, theme toggle), reading-progress bar on posts, footer (LinkedIn, GitHub, X, RSS), scripts, Mermaid
- `home.html` - intro with signature line, paginated post list, pager
- `post.html` - signature line, title, deck, meta, author, TOC (rail on desktop, `<details>` below 1100px), body, share links, previous/next
- `page.html` - title, optional description, body (About, Tags)

### File Structure
- `_posts/`: Blog posts (YYYY-MM-DD-title.md)
- `_layouts/`: Jekyll templates
- `_includes/`: Reusable components (signature.html, toc.html, google-analytics.html)
- `_sass/`: one partial per component, see SCSS Styles
- `assets/css/main.scss`: Compiled CSS
- `assets/js/`: JavaScript functionality
- `assets/images/YYYY-MM-DD-post-slug/`: Post images

## Code Style Guidelines

### Liquid Templates (Jekyll)
- Use `{% raw %}{%- -%}{% endraw %}` for whitespace control
- Semantic HTML5 elements
- Cache-busting for JS: `?v={% raw %}{{ site.time | date: '%s' }}{% endraw %}`
- Reference assets with `| relative_url` filter

### SCSS Styles
- One partial per component in `_sass/`: `_tokens`, `_base`, `_typography`, `_header`, `_footer`, `_post-list`, `_post`, `_toc`, `_code`, `_tags`; `assets/css/main.scss` only imports
- Colours and fonts only via the custom properties from `_tokens.scss`; never hardcode a hex value in a component partial
- BEM-like naming (`block__element--modifier`), state classes `is-current`, `is-active`
- Mobile first; breakpoints 600px, 768px, 1100px

### JavaScript
- ES6+ syntax with proper event listeners
- Use `DOMContentLoaded` for initialization
- Modern event handling with addEventListener
- No jQuery - vanilla JS preferred
- Scripts in `assets/js/` with cache-busting in base.html

### Blog Posts (Markdown)
- Format: Kramdown parser with GFM input
- Front matter structure:
```yaml
---
layout: post
title: "Post Title"
date: YYYY-MM-DD
categories: [Category1, Category2]
author: Flemming Bakkensen
description: "SEO-friendly description"
tags: [tag1, tag2]
---
```
- Use `<!--more-->` separator for excerpt
- Add emojis to headers: `## 🚀 Introduction`
- Code blocks with Rouge syntax highlighting
- Include tables, diagrams (Mermaid.js available)
- Target audience: AL developers for Business Central

### Naming Conventions
- Posts: `YYYY-MM-DD-title-slug.md`
- Layouts: kebab-case (base.html, post.html)
- SCSS classes: BEM-like with theme prefixes
- Images: timestamp-based naming in post-specific folders

### Error Handling
- Check for YAML front matter syntax errors
- Validate HTML/CSS in generated `_site/` directory
- Test locally before pushing to GitHub Pages
- Monitor GitHub Actions workflow for build failures

## Configuration

### `_config.yml` Key Settings
- Pagination: 5 posts per page
- Plugins: jekyll-feed, jekyll-seo-tag, jekyll-paginate, jekyll-sitemap
- Markdown: Kramdown with Rouge syntax highlighting
- Google Analytics: G-5FQ1BD5CNH (production only)
- Social links: LinkedIn, GitHub, X/Twitter

### Tags System
- Tags defined in post front matter: `tags: [tag1, tag2]`
- `/tags.html` uses JavaScript for tag cloud and filtering
- No manual tag pages needed - auto-generated

## Common Tasks

### Adding a New Blog Post
1. Create `_posts/YYYY-MM-DD-title.md`
2. Add front matter with required fields
3. Write content with `<!--more-->` separator
4. Add emojis to headers
5. Include code examples with syntax highlighting
6. Test locally with `bundle exec jekyll serve --livereload`

### Modifying the Theme
1. Colors/Fonts: Edit `_sass/_tokens.scss`
2. Layout structure: Modify `_layouts/base.html`
3. Navigation: Update the header block in `_layouts/base.html`
4. Post template: Edit `_layouts/post.html`

### Build Process
- Jekyll builds to `_site/` directory (git-ignored)
- GitHub Pages auto-deploys from main branch
- Nightly rebuild via `.github/workflows/nightly-build.yml`

## Troubleshooting

### Common Issues
- Server won't start: Run `bundle install`
- Changes not reflecting: Check YAML front matter syntax
- TOC not appearing: Ensure h2-h6 headers exist
- Pagination broken: Verify `paginate: 5` in config

### Debugging
- Check Jekyll build output for errors
- Use browser DevTools for console errors
- Validate generated HTML in `_site/` directory

## Do Not Modify

- `_site/` directory (Jekyll build output)
- `Gemfile.lock` (unless updating dependencies)
- `.github/instructions/playwright.instructions.md` (testing rules)
