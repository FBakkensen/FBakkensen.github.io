# Jekyll Blog - AI Coding Agent Instructions

## Project Overview
This is a Jekyll-based blog focused on Business Central AL development, AI, and consulting topics. The site uses a custom **terminal/PowerShell theme** with GitHub Pages hosting.

**Key URLs:**
- Local dev: `http://127.0.0.1:4000/`
- Production: `https://fbakkensen.github.io`

## Architecture & Design Philosophy

### Terminal-Inspired UI Theme
The entire site mimics a PowerShell terminal aesthetic:
- Navigation elements styled as PowerShell commands (e.g., `PS C:\ALProjects\BCBlog>`)
- Code blocks use PowerShell-style prompts
- Color scheme: dark blue backgrounds (`#012456`), cyan highlights (`#00ffff`), terminal fonts (Cascadia Code)
- All interactive elements should maintain this PowerShell metaphor

**Example from `_layouts/home.html`:**
```html
<span class="prompt">PS C:\ALProjects\BCBlog&gt;</span> Get-ChildItem -Path .\posts\
```

### Layout Hierarchy
1. `base.html` - Master layout with navigation, footer, analytics, Mermaid.js integration
2. `home.html` - Blog listing with sidebar (extends `base.html`)
3. `post.html` - Individual post display with TOC (extends `base.html`)
4. `page.html` - Static pages like About (extends `base.html`)

### Content Components
- `_includes/toc.html` - Auto-generates Table of Contents from h2-h6 headers
- `_includes/google-analytics.html` - GA4 tracking (G-5FQ1BD5CNH)
- `_includes/nav.html` - Site navigation
- `_includes/header.html` - Page headers

## Blog Post Conventions

### Front Matter Structure
Every post in `_posts/` must follow this format:
```yaml
---
layout: post
title: "Your Post Title"
date: YYYY-MM-DD
categories: [Category1, Category2, Category3]
author: Flemming Bakkensen
description: "SEO-friendly description"
tags: [tag1, tag2, tag3]
---
```

### Content Guidelines (from `.windsurfrules`)
1. **Markdown format** with Kramdown parser
2. **Target audience:** AL developers for Business Central
3. **Engagement elements:**
   - Icons/emojis in headers (e.g., `## 🚀 Introduction`)
   - Tables for quick overviews
   - Diagrams (Mermaid.js is available)
   - Code snippets with Rouge syntax highlighting
4. **Structure:**
   - Use `<!--more-->` separator to define excerpt vs full content
   - Posts with headers automatically get TOC (disable with `toc: false` in front matter)
   - Include image placeholders with AI generation prompts when relevant

### Example Post Structure
```markdown
---
layout: post
title: "Example Post"
date: 2025-10-08
categories: [Business Central, AL]
tags: [al, development]
---

## 🎯 Introduction

Brief introduction here...

<!--more-->

<!-- After this separator, TOC is automatically inserted if headers exist -->

## 📋 Main Content

Detailed content...

### Code Example
\`\`\`al
codeunit 50100 "My Codeunit"
{
    // AL code here
}
\`\`\`
```

## Development Workflow

### Local Server
```powershell
# First time setup
bundle install

# Start dev server with live reload
bundle exec jekyll serve --livereload --future

# Server runs at http://127.0.0.1:4000/
```

### Testing with Playwright MCP
**CRITICAL:** Do NOT write test scripts. Use Playwright MCP tools directly per `.github/instructions/playwright.instructions.md`:
- Navigate with `mcp_playwright_browser_navigate`
- Check console errors with `mcp_playwright_browser_console_messages`
- Validate network with `mcp_playwright_browser_network_requests`
- Test responsive design with `mcp_playwright_browser_resize`
- Take screenshots with `mcp_playwright_browser_take_screenshot`

Always test these edge cases:
1. Home page with pagination
2. Individual blog posts with TOC
3. Tags page filtering
4. Navigation flows
5. Responsive layouts (mobile/tablet/desktop)
6. Console errors and network failures

## Key Configuration Files

### `_config.yml`
- **Pagination:** 5 posts per page (`paginate: 5`)
- **Markdown:** Kramdown with GFM input, Rouge syntax highlighting
- **Plugins:** jekyll-feed, jekyll-seo-tag, jekyll-paginate, jekyll-sitemap
- **Social links:** LinkedIn, GitHub, X/Twitter, Bluesky
- **Google Analytics:** G-5FQ1BD5CNH (production only)

### `Gemfile`
- Uses `github-pages` gem for GitHub Pages compatibility
- Includes `jekyll-paginate` for blog pagination

## File Naming Conventions

### Blog Posts
- Format: `YYYY-MM-DD-title-slug.md` in `_posts/`
- Example: `2025-10-08-my-new-post.md`

### Layouts & Includes
- Layouts: `_layouts/*.html`
- Reusable components: `_includes/*.html`
- Styles: `_sass/*.scss`, compiled CSS in `assets/css/`
- JavaScript: `assets/js/*.js`

### Images & Assets
- Post images: `assets/images/YYYY-MM-DD-post-slug/`
- General assets: `assets/css/`, `assets/js/`, `assets/fonts/`

## Common Tasks

### Adding a New Blog Post
1. Create `_posts/YYYY-MM-DD-title.md`
2. Add front matter (layout, title, date, categories, tags, description)
3. Write content with `<!--more-->` separator after intro
4. Add emojis to headers for engagement
5. Include code examples with syntax highlighting
6. Test locally with `bundle exec jekyll serve --livereload`

### Modifying the Theme
1. **Colors/Fonts:** Edit `_sass/terminal-theme.scss`
2. **Layout structure:** Modify `_layouts/base.html`
3. **Navigation:** Update `_includes/nav.html` or nav section in `base.html`
4. **Post template:** Edit `_layouts/post.html`

### Adding JavaScript Functionality
- Place scripts in `assets/js/`
- Reference in `base.html` with cache-busting: `?v={{ site.time | date: '%s' }}`
- Example: `code-blocks.js` adds copy buttons to code snippets

## Tags System

### Implementation
- Tags defined in post front matter: `tags: [tag1, tag2]`
- `/tags.html` page uses JavaScript to:
  - Build tag cloud with post counts
  - Filter posts by selected tag
  - Support URL hash navigation (e.g., `/tags/#copilot`)

### Adding New Tags
1. Add to post front matter
2. Tags automatically appear on `/tags/` page
3. No manual tag pages needed

## Integration Points

### External Services
- **Google Analytics:** GA4 tracking included via `_includes/google-analytics.html` (production only)
- **GitHub Pages:** Auto-deploys from main branch
- **Mermaid.js:** Loaded from CDN in `base.html` for diagram rendering

### Build Process
- Jekyll builds to `_site/` directory (git-ignored)
- GitHub Pages builds automatically on push to main branch
- No custom build scripts needed - pure Jekyll

## Troubleshooting

### Common Issues
1. **Server won't start:** Run `bundle install` to update dependencies
2. **Changes not reflecting:** Check for syntax errors in YAML front matter
3. **TOC not appearing:** Ensure post has h2-h6 headers and no `toc: false` in front matter
4. **Pagination broken:** Verify `paginate: 5` in `_config.yml` and `jekyll-paginate` in Gemfile

### Debugging
- Check Jekyll build output for errors
- Use browser DevTools to inspect console errors
- Validate HTML/CSS in generated `_site/` directory

## Style Guidelines

### Code Style
- **Liquid templates:** Use `{%- -%}` for whitespace control
- **HTML:** Semantic HTML5 elements
- **CSS:** BEM-like naming, scoped to theme classes

### Content Style
- **Tone:** Professional but conversational
- **Audience:** AL developers familiar with Business Central
- **Length:** 1500-3000 words per post (aim for depth)
- **SEO:** Include meta descriptions, use descriptive headers

## Do Not Modify

These files are auto-generated or should remain stable:
- `_site/` directory (Jekyll build output)
- `Gemfile.lock` (unless updating dependencies)
- `.github/instructions/playwright.instructions.md` (testing rules)
