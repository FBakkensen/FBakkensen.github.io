# Image Prompt Guide for Blog Posts

Reference for generating Nano Banana (Google Gemini) image prompts and formatting image placeholders in blog post drafts.

## Nano Banana Prompt Style

Nano Banana is Google's Gemini image generation capability. Key principle: **write prompts as natural language paragraphs, not keyword lists**. The model excels at understanding descriptive sentences, not comma-separated tags.

### Prompt Structure

Build prompts by describing these elements in natural sentences:

1. **Subject**: What is in the image (concrete, specific)
2. **Environment/Context**: Where the subject exists, what surrounds it
3. **Artistic Style**: The medium and aesthetic (digital illustration, watercolor, isometric, vector, photography, etc.)
4. **Lighting**: How the scene is lit (ambient, dramatic, golden hour, studio, soft diffused, etc.)
5. **Composition/Framing**: Camera angle, perspective, crop (wide shot, close-up, top-down, isometric, etc.)
6. **Mood**: The emotional feel (professional, calm, energetic, contemplative, etc.)
7. **Color Palette**: Dominant colors and overall palette feel (cool blues, warm earth tones, monochrome with accent, etc.)

Include 4-6 high-signal descriptive details. Be specific -- "85mm f/1.4 lens with shallow depth of field" is better than "blurry background."

### Photography-Style Prompts

For photorealistic images, use photography terminology:

- Specify lens and aperture (e.g., "shot on a 35mm wide-angle lens")
- Name lighting conditions (golden hour, overcast, three-point studio lighting)
- Describe textures and materials explicitly

### Illustration-Style Prompts

For stylized images, name the art style explicitly:

- Isometric, flat vector, watercolor, ink sketch, cel-shaded, pixel art
- Describe line style (clean lines, rough sketch, geometric)
- Specify the color palette concretely

### What to Avoid

- **Text in images** -- AI image generators struggle with legible text. Use Mermaid diagrams instead for anything with labels.
- **Overly complex scenes** with many subjects -- keep composition focused.
- **Photorealistic human faces** -- results are inconsistent.
- **Vague modifiers** ("beautiful", "amazing", "epic") -- be concrete instead.

## Placeholder Format in Blog Posts

Use this exact format for image placeholders in the draft:

```markdown
<!-- IMAGE: filename.png -->
![Contextual alt text describing what the image shows, 80-125 chars](/assets/images/YYYY-MM-DD-slug/filename.png)
<!-- PROMPT: Write a natural language paragraph here describing the image
for Nano Banana. Include subject, environment, style, lighting, composition,
mood, and color palette. Be specific with 4-6 descriptive details. -->
<!-- STYLE-ANCHOR: shared style description for visual consistency across all images in the post -->
<!-- /IMAGE -->
```

### Format Rules

- The `![alt](path)` line is valid markdown -- it works once the image file exists, shows alt text when it does not.
- HTML comments (`<!-- -->`) are invisible in rendered output and can remain permanently.
- `STYLE-ANCHOR` appears only on the **first** image placeholder. All subsequent images inherit this style for visual consistency.
- Subsequent placeholders omit `STYLE-ANCHOR` -- include only `<!-- PROMPT -->` with style details matching the anchor.

### Subsequent Image Placeholders

```markdown
<!-- IMAGE: concept-diagram.png -->
![Alt text for this specific image](/assets/images/YYYY-MM-DD-slug/concept-diagram.png)
<!-- PROMPT: Description matching the style-anchor established in the hero image.
Subject and composition details specific to this image. -->
<!-- /IMAGE -->
```

## Image Types for Blog Posts

| Type | Purpose | Suggested Aspect Ratio |
|------|---------|----------------------|
| Hero | Sets visual tone, appears after `<!--more-->` | 16:9 |
| Concept illustration | Visualizes an abstract idea mid-post | 3:2 or 4:3 |
| Workflow diagram | Shows process flow -- prefer Mermaid when possible | 16:9 |
| Comparison visual | Side-by-side or before/after | 16:9 or 3:2 |
| Decorative break | Visual rhythm between major sections | 3:2 |

## Naming Convention

- Descriptive kebab-case: `hero.png`, `workflow-overview.png`, `before-after-comparison.png`
- Path: `/assets/images/YYYY-MM-DD-slug/filename.png`
- All images for a post live in the same directory
