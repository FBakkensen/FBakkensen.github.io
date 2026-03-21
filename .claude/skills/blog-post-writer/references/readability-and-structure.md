# Readability and Structure Reference

Actionable readability rules for blog post writing. Based on Nielsen Norman Group research and web readability best practices.

---

## Scanning Patterns

Users scan web content in predictable patterns. Structure content to steer readers toward effective patterns.

### F-Pattern (Bad)

- Caused by walls of text without visual anchors.
- Readers scan the first line fully, then progressively less of each subsequent line.
- Results in readers missing content in the right half of the page.
- Indicates the content lacks structure and visual hierarchy.

### Layer-Cake Pattern (Good)

- Created by clear, descriptive headings with visual distinction from body text.
- Readers scan heading-to-heading, reading content under headings that interest them.
- This is the target pattern for all blog posts.

### Spotted Pattern

- Task-oriented scanning that targets bold text, links, numbers, and other visual landmarks.
- Use bold, links, and formatted data (tables, inline code) to guide this behavior.
- Readers jump to visually distinct elements, so make those elements carry meaning.

### Design Goal

Structure every post to encourage the layer-cake pattern through descriptive, front-loaded headings. Support spotted scanning by making bold text and links semantically meaningful, not decorative.

---

## Paragraphs

- **2-4 sentences per paragraph.** One idea per paragraph.
- **Front-load key information** -- place the most important word or phrase near the start of the paragraph, not buried at the end.
- Short paragraphs create visual breathing room on screen and reduce cognitive load.
- Never write a paragraph longer than 5 sentences in blog content.
- If a paragraph feels long, split it. When in doubt, break it up.

---

## Headings

- **H1**: Title only. Set in YAML front matter, never repeated in the body.
- **H2**: Main sections. Descriptive, not generic. Write "How PAS Structures Your Introduction" not "Introduction."
- **H3**: Sub-sections within H2 blocks. Use for logical subdivisions.
- **Never skip heading levels.** No H2 directly to H4.
- Break into H3s when an H2 section exceeds approximately 300 words.
- Insert a new heading every **150-250 words** to maintain the layer-cake pattern.
- **Front-load headings** with key terms. Readers scan the first 2-3 words of a heading and decide whether to read on. Put the differentiating word first.

---

## Visual Density

Insert a visual element every **75-100 words** of continuous prose. Visual elements include:

| Element       | Best Used For                                              |
| ------------- | ---------------------------------------------------------- |
| Table         | Comparisons and structured data (prefer over long bullet lists when comparing 2+ dimensions) |
| Code block    | Implementation examples, commands, configuration           |
| Image         | Concepts easier to show than describe                      |
| Blockquote    | Key insights, pull-quote moments, notable external quotes  |
| Mermaid diagram | Workflows, architecture, decision trees                  |
| Bullet/numbered list | Sequential steps, feature lists, short enumerations  |

### Code Block Rules

- Always provide a context sentence before the code block explaining what it shows.
- Use language tags for syntax highlighting (e.g., ` ```al `, ` ```json `).
- Follow code blocks with interpretation when the output is not self-evident.

### Table Rules

- Use tables when comparing two or more items across two or more dimensions.
- Keep tables concise -- if a table exceeds 7 rows, consider whether it should be split or summarized.

---

## White Space

- White space is a readability tool, not wasted space.
- Line breaks between paragraphs create scannable chunks.
- Use horizontal rules (`---`) between major sections for visual separation.
- Do not pack content too densely. Err on the side of more space.
- A page that looks "light" is easier to read than one that looks "heavy."

---

## Transitions

- Use **one brief transition sentence** between sections to maintain narrative flow.
- The transition connects the previous section's conclusion to the next section's topic.
- Transitions should orient the reader, not summarize what was already said.
- Keep transitions to a single sentence. If it takes more, the sections may need restructuring.

---

## The Skip Test

Every post must pass the skip test:

1. **Remove all code blocks, images, and tables mentally.** The remaining prose should still make a coherent argument.
2. **Each visual element must be preceded by context** (what the reader is about to see) **and followed by interpretation** (what it means or what to do next).
3. A reader who skips every visual element should still understand the post's argument and takeaways.

If removing visuals breaks the narrative, add bridging prose before and after each visual.

---

## Emoji in Headings

- **One emoji per H2**, placed at the beginning of the heading text.
- Choose **contextually relevant** emoji -- semantic, not decorative. The emoji should reinforce the heading's meaning.
- **Consistency within a post**: if one H2 has an emoji, all H2s in that post must have one.
- **Do not use emoji in H3 headings.**
- Do not use emoji in body text unless it serves a clear communicative purpose (e.g., a checklist with checkmarks).
