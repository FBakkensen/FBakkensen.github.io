---
name: blog-post-writer
description: >
  Write a professional blog post for the Jekyll blog. Use when drafting
  new blog posts, writing technical articles, or creating content.
  Applies copywriting best practices (AIDA, PAS, Inverted Pyramid, etc.)
  to produce publication-ready drafts. Use this skill whenever the user
  mentions writing a blog post, drafting an article, creating content
  for the blog, or wants to turn notes/ideas into a published post.
argument-hint: <topic-or-title> [--type tutorial|conceptual|case-study|opinion] [--framework PAS|AIDA|BAB|APP|4Ps|hybrid]
allowed-tools: [Read, Glob, Grep, Bash, Write, Edit, Agent, WebFetch, WebSearch]
---

# Blog Post Writer

Produce publication-ready blog post drafts for the Jekyll blog at FBakkensen.github.io. Apply copywriting frameworks, readability best practices, and SEO fundamentals to generate professional, factual content. No clickbait, no hype — the output is a polished blog post ready for review.

The blog is primarily about Business Central and AL development, with some general tech and professional topics. Maintain the author's professional-yet-approachable voice regardless of topic.

---

## Workflow

Follow these steps in order. Present results to the user at gates marked **(interactive)**.

### Step 1: Understand the Brief (interactive)

Parse the topic or title from the user's input. Determine:

1. **Content type** — from `--type` argument or ask:
   - `tutorial` — step-by-step how-to with code
   - `conceptual` — explaining ideas, principles, or patterns
   - `case-study` — real-world problem and solution narrative
   - `opinion` — thought leadership, professional perspective
2. **Key points** — ask what 2-4 things the post should cover
3. **Audience** — BC developers (default), general developers, or mixed
4. **Scope** — approximate depth and length

Select the copywriting framework internally based on content type (see Framework Selection below). The user can override with `--framework`.

### Step 2: Research (automated)

Run these in parallel where possible:

1. Read `references/voice-and-style-samples.md` for voice calibration
2. Read the output style at `.claude/output-styles/technical-blog-writer.md` if it exists
3. Grep existing posts (`_posts/*.md`) for related topics — identify 2-4 candidates for internal links
4. If the topic requires current facts or documentation, use WebSearch, WebFetch, or MCP tools to gather accurate information
5. Read 1-2 existing posts of the same content type for structural reference

### Step 3: Outline (interactive)

Present a structured outline for approval:

- **Title**: proposed title with character count (target: 50-60 chars)
- **Meta description**: proposed description with character count (target: 150-160 chars)
- **Heading structure**: H2 and H3 headings with 1-2 sentence content summaries
- **Visual elements**: where tables, code blocks, images, and diagrams will appear
- **Image placeholders**: locations with brief descriptions of intended images
- **Internal links**: which existing posts will be referenced
- **Framework applied**: which copywriting framework was selected and why (one line)

Wait for user approval or revision before proceeding.

### Step 4: Draft (automated)

Write the full post following the approved outline. Apply:

- The selected copywriting framework (load `references/copywriting-frameworks.md`)
- Readability rules (load `references/readability-and-structure.md`)
- Image placeholders with Nano Banana prompts (load `references/image-prompt-guide.md`)
- Voice patterns from `references/voice-and-style-samples.md`
- The post structure template defined below

### Step 5: Scaffold Files (automated)

Create the post file and image directory:

```bash
# Date and slug from the post title
DATE="YYYY-MM-DD"
SLUG="lowercase-hyphenated-title"

# Create the post file
# Write draft to: _posts/${DATE}-${SLUG}.md

# Create the image directory
mkdir -p assets/images/${DATE}-${SLUG}
```

### Step 6: Quality Review (interactive)

Run the quality checklist (below) and the SEO checklist (`references/seo-checklist.md`). Present results as a pass/fail table. Flag any failures for the user's attention.

### Step 7: Iterate

Address user feedback. Each revision should maintain the framework structure and voice consistency. Re-run the quality checklist after significant changes.

---

## Framework Selection

Select the framework that best fits the content type. The user does not need to choose — pick the best fit automatically. If `--framework` is provided, use that instead.

| Content Type | Default Framework | Why |
|---|---|---|
| Tutorial | PAS | Readers come with a problem; agitate it, then solve it |
| Conceptual | Hybrid | Hook with PAS, explain with Inverted Pyramid |
| Case Study | BAB | Natural before/after structure |
| Opinion | APP | Surface an issue, then position your perspective |
| Comparison | 4Ps | Data and evidence drive the argument |
| Announcement | AIDA | Build interest progressively |

Load `references/copywriting-frameworks.md` for detailed application rules for the selected framework.

---

## Post Structure Template

Every post must follow this structure:

```markdown
---
layout: post
title: "[Title — 50-60 chars, front-load keyword]"
date: YYYY-MM-DD
categories: [Primary, Secondary]
author: Flemming Bakkensen
description: "[Meta description — 150-160 chars, includes keyword, promises value]"
tags: [tag1, tag2, tag3, tag4, tag5]
---

<span class="prompt">PS C:\DevProjects\DevBlog&gt;</span> Get-Content .\{Category}\{TopicSlug}.md

[Introduction — 2-4 sentences. State the problem directly using first-person experience or observation. No fictional second-person scenarios.]

<!--more-->

[Hero image placeholder]

## {emoji} [First Main Section]

[Content with visual elements every 75-100 words]

### [Subsection if H2 content exceeds ~300 words]

## {emoji} [Second Main Section]

[Continue with framework structure]

## {emoji} [Conclusion / Key Takeaways]

[Reinforce 2-3 main points]
[Call to action — invite discussion]

<span class="prompt">PS C:\DevProjects\DevBlog&gt;</span> [Thematic closing command]

---

*What are your thoughts on [topic]? I'd love to hear your experiences — connect with me on [LinkedIn](https://www.linkedin.com/in/flemmingbakkensen/) or [Bluesky](https://bsky.app/profile/fbakkensen.bsky.social).*
```

### Front Matter Rules

- **title**: 50-60 characters, front-load primary keyword, descriptive not clickbait
- **date**: use today's date
- **categories**: 2-3 from the blog's established set
- **author**: always `Flemming Bakkensen`
- **description**: 150-160 characters, contains primary keyword, promises clear value
- **tags**: 5-8 lowercase hyphenated terms

---

## Image Placeholders

When the post needs an image, insert a placeholder using this format:

```markdown
<!-- IMAGE: filename.png -->
![Alt text describing what the image shows in context, 80-125 chars](/assets/images/YYYY-MM-DD-slug/filename.png)
<!-- PROMPT: Write a natural language paragraph for Nano Banana (Google Gemini).
Describe the subject, environment, artistic style, lighting, composition,
mood, and color palette. Include 4-6 specific descriptive details.
Use photography terms for realism, or name art styles for illustrations. -->
<!-- STYLE-ANCHOR: [Shared style description — e.g., "digital illustration,
clean isometric style, cool blue and teal palette, soft ambient lighting,
professional and modern feel"] -->
<!-- /IMAGE -->
```

**Rules:**
- `STYLE-ANCHOR` appears only on the first image. All subsequent images inherit this style for visual consistency.
- Alt text: 80-125 chars, describes the image's meaning in context, never starts with "Image of..."
- Filenames: descriptive kebab-case (`hero.png`, `workflow-overview.png`)
- Path: `/assets/images/YYYY-MM-DD-slug/filename.png`
- Prefer Mermaid diagrams over images when the visual needs text labels or shows a workflow

Load `references/image-prompt-guide.md` for detailed Nano Banana prompt guidance.

---

## Writing Rules

### Paragraphs and Flow
- 2-4 sentences per paragraph, one idea each
- Front-load the key point in each paragraph
- New heading every 150-250 words (layer-cake pattern)
- Transition sentences between sections (one sentence, orients the reader)

### Headings
- H1: title only (in front matter)
- H2: main sections with one contextual emoji at the start
- H3: sub-sections (no emoji)
- Never skip heading levels
- Break into H3s when an H2 section exceeds ~300 words
- Make headings descriptive and front-loaded with key terms

### Visual Elements
Insert a visual element every 75-100 words of prose:
- **Tables**: for comparisons and structured data (prefer over long bullet lists)
- **Code blocks**: always with language tag, context before, comments explaining key concepts
- **Blockquotes**: for key insights or "pull quote" moments
- **Mermaid diagrams**: for workflows, architecture, process flows
- **Images**: for concepts easier to show than describe (use placeholder format)

### The Skip Test
The post must read coherently even if all code blocks, images, tables, and diagrams are removed. Every visual element should have context before it and interpretation after it.

Load `references/readability-and-structure.md` for detailed readability rules.

---

## BC-Specific Guidance

When the post covers Business Central or AL topics:

- Include BC version information when relevant
- Reference official Microsoft documentation where applicable
- Use BC vocabulary: Insert/Modify/Delete (not Create/Update/Remove), Post (not Submit), Validate (not Check), Ledger Entry (not Transaction)
- AL code: use `al` language tag, real table/codeunit names, proper BC naming conventions
- Connect code patterns to the business scenario they solve
- Link to GitHub repositories for full implementations when code is truncated

For general tech posts, maintain the professional consultant voice but skip BC-specific terminology.

---

## Quality Checklist

Run this checklist after drafting. Present results as a pass/fail table.

| Check | Rule |
|---|---|
| Title length | 50-60 characters |
| Title keyword | Primary keyword in first half |
| Meta description | 150-160 characters |
| Excerpt separator | `<!--more-->` after 2-4 sentence hook |
| Visual density | Visual element within every 100 words of prose |
| Heading hierarchy | Valid H2 → H3, no skipped levels |
| Heading frequency | New heading every 150-250 words |
| Image placeholders | All have Nano Banana prompts and alt text (80-125 chars) |
| Internal links | At least 2 links to existing posts |
| Terminal prompts | Opening and closing terminal-style lines |
| No clickbait | No false urgency, no superlatives, no hype |
| Skip test | Narrative coherent without visuals |
| SEO checklist | All items pass from `references/seo-checklist.md` |
| Social CTA | Closing with LinkedIn and Bluesky links |
