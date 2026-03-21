# Voice and Style Samples

Extracted patterns from existing blog posts to ensure consistent voice across new posts.

## Opening Patterns

Posts use several distinct opening strategies:

**1. Problem/Scenario Hook** -- Pose a relatable scenario, then reframe it.
> "For decades, gaming was often dismissed as a distraction - a 'time sink' that pulled developers away from more 'productive' pursuits. But as we transition into the **Agentic Era** of software development, where we no longer just write lines of code but orchestrate teams of AI assistants, the script has flipped."

**2. Direct Observation** -- State a concrete problem or trend the reader will recognize from their own work.
> "Coding agents produce a growing number of reusable artifacts — skills, agents, MCP servers, and hooks. But sharing what we build with them still looks a lot like sharing PTE apps in Business Central: zip files on SharePoint, .app files on Teams, multiple versions floating around with nobody sure which is current."

Note: Avoid second-person fictional scenarios ("Imagine this...", "You have just spent three hours..."). These feel manufactured. Prefer first-person observations or direct statements of the problem.

**3. Reflective/Philosophical Quote** -- Open with a blockquote insight, then bridge to the topic.
> "In the world of Business Central extensions, simplicity and upgradability are not just virtues -- they're necessities."

**4. Series/Inspiration Bridge** -- Reference a well-known concept, then adapt it to the author's domain.
> "Many developers are familiar with the 'Zen of Python' -- a set of guiding principles that shape how Python code is written, emphasizing simplicity and readability. It got me thinking: what would a 'Zen of AL' look like for those of us developing extensions for Microsoft Dynamics 365 Business Central?"

## Terminal Prompt Style

The blog uses a terminal-themed aesthetic. Posts that use this pattern open and close with PowerShell-style prompts.

**Opening prompt** (appears immediately after front matter):

```html
<span class="prompt">PS C:\DevProjects\DevBlog&gt;</span> Get-Content .\{Category}\{Topic}.md
```

Real example:

```html
<span class="prompt">PS C:\DevProjects\DevBlog&gt;</span> Get-Content .\Thoughts\GamingMindset.md
```

**Closing prompt** -- a thematic PowerShell command as a sign-off:

```html
<span class="prompt">PS C:\DevProjects\DevBlog&gt;</span> Start-Process -FilePath .\Career\LevelUp.exe -Verb RunAs
```

Note: Not all posts use terminal prompts. The "Start With Why" and "Zen for AL" posts omit them. When used, the closing command should be playful and relevant to the post's theme.

## Tone Markers

**Introducing personal experience** -- First person, present tense, grounded in a real workflow:
> "When I'm working on a complex system integration, I might have one AI agent refactoring a key module, another drafting unit tests, and a third analyzing a telemetry trace."

**Making transitions** -- Direct declarative statements that shift perspective:
> "In the old world, coding was a single-player, turn-based game. You wrote code, you compiled it, you fixed the error. Today, it's a **Real-Time Strategy (RTS)** game."

**Presenting key insights** -- Bold the core concept, then explain with an analogy:
> "One of the hardest things for developers to learn is **Trust**. Gamers, however, are used to NPCs (Non-Player Characters) and automated units."

**Using analogies** -- Extended metaphors drawn from gaming, martial arts, or everyday life:
> "In an RPG, you don't control every sword swing of your companions; you set their strategy and let them execute. Modern AI development requires the same mindset."
> "Automation games like *Factorio* or *Satisfactory* are essentially visually-mapped CI/CD pipelines."

**Reframing expectations** -- Flip a common belief, often with a dash/colon:
> "In gaming, failure is data. A 'Game Over' screen isn't a rejection; it's a prompt to try a different build or strategy."
> "You weren't wasting time; you were practicing for the final level of software engineering."

**Challenging the reader directly** -- Second person imperative with "you"
> "So next time you hear 'We need X,' pause and ask 'Why do you need X?' That simple question could change everything."

## Section Structure

- **Emoji usage in H2 headings**: One emoji per H2, placed before the heading text, contextually relevant to the section topic. Examples from the gaming post: `🎯 Introduction`, `🕹️ The RTS Analogy`, `🤝 Delegation`, `🚀 Conclusion`. Note: Not universal -- the "Start With Why" post uses plain H2/H3 headings without emojis.
- **Horizontal rules (`---`)**: Used to visually separate major sections and to frame hero/inline images.
- **Flow within a post**: Open with context/hook, present the core framework (often as a list or table), then explore 3-5 facets with their own H2/H3 sections, then close with synthesis and CTA.
- **Transitions between concepts**: Often a single bold sentence or a short paragraph that reframes what came before. Minimal use of transitional filler ("furthermore", "moreover").

## Emphasis and Formatting

- **Bold for key terms on first introduction**: Terms like `**Agentic Era**`, `**Trust**`, `**Intent**`, `**Prompt**`, `**Code**` are bolded on first use. Once introduced in bold, subsequent uses are plain text.
- **Blockquotes for "pull quote" insights**: Standalone insights set apart from the flow, often with a bold label.
  > **The "Party Leader" Rule:** You are no longer the lone warrior. You are the Party Leader. Your job isn't to do everything; it's to ensure everyone is working toward the same objective.
- **Em-dashes and parenthetical asides**: Used for personality and inline clarification. Examples:
  - "Starting with 'why' transforms Business Central projects from transactional implementations into strategic partnerships that deliver lasting value for clients"
  - "(the 'enemy encounter')"
  - "your prompt (your 'gear')"
- **Italics for game titles and emphasis**: `*Factorio*`, `*StarCraft*`, `*World of Warcraft*`.
- **Tables for structured comparisons**: Used when mapping concepts across domains. Column headers are bold. Alignment is left-justified (`:---`). Example pattern: `| Source Domain | Target Skill | Professional Parallel |`.
- **Numbered lists** for sequential/prioritized items; **bullet lists** for unordered sets.

## Closing Patterns

Posts end with one or more of these elements:

**1. Summary reinforcement** -- A concise restatement of the core argument:
> "The gap between 'playing' and 'working' is shrinking. The skills required to manage a 40-man raid in *World of Warcraft* -- communication, resource management, and strategic alignment -- are eerily similar to managing an enterprise-scale AI-assisted development project."

**2. Reframe/callback to the opening** -- Circle back to the opening premise and flip it:
> "If you've been worried that your gaming hobby was 'wasted time,' it's time to update your internal manifest. You weren't wasting time; you were practicing for the final level of software engineering."

**3. Actionable takeaway list** -- Bulleted list of concrete outcomes:
> - Clients get leaner solutions tailored to their actual needs -- not bloated systems full of unused features.
> - Teams avoid wasted effort and deliver faster results.
> - Businesses see measurable outcomes tied directly to their goals.

**4. Social CTA** -- A conversational question inviting discussion, with platform references:
> "What games have influenced your coding style the most? Let's discuss on LinkedIn or Bluesky!"
> "What's your experience with focusing on 'why' in Business Central projects? Share your thoughts below!"

Social links for CTAs:
- LinkedIn: https://www.linkedin.com/in/flemmingbakkensen/
- X/Twitter: https://x.com/fbakkensen
- GitHub: https://github.com/FBakkensen
- Bluesky: https://bsky.app/profile/fbakkensen.bsky.social

## Code Presentation

- **Context before code blocks**: A sentence or short paragraph explains what the code demonstrates before the fenced block appears.
- **Language tags for syntax highlighting**: Use fenced code blocks with language identifiers (e.g., `al` for Business Central AL code, `html` for markup).
- **Comments within code**: Key concepts are annotated with inline comments so the reader can follow without jumping back to prose.
- **Links to GitHub for full implementations**: When a code snippet is an excerpt, link to the full source on GitHub rather than inlining everything.
- **Tables as an alternative to code**: When presenting principles, mappings, or comparisons, the author often prefers tables over code blocks for readability.
