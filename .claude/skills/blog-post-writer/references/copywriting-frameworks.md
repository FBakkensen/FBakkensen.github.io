# Copywriting Frameworks for Blog Posts

These are actionable rules for structuring blog posts. Select a framework based on the post's goal, then follow the application rules for that framework. When in doubt, use the Hybrid framework (the default).

---

## AIDA (Attention, Interest, Desire, Action)

### When to use

- Awareness content introducing a concept readers have not encountered before.
- New technology introductions, product announcements, "what is X and why should you care" posts.
- Posts where the primary goal is to move the reader from unaware to engaged.

### How to apply

Map each phase to concrete blog sections:

1. **Attention** -- Title + first paragraph. Use a specific, surprising fact or a bold claim backed by evidence. The title must earn the click; the first paragraph must earn the scroll. Avoid fictional scenarios — use direct observation or first-person experience instead.
2. **Interest** -- Expand on the problem or opportunity with specifics. Use numbers, named technologies, real scenarios. Answer "why should I keep reading?" within the first 20% of the post.
3. **Desire** -- Show the value through examples, data, code, or before/after comparisons. Make the reader think "I want this outcome." Stay factual -- let the evidence create desire, not hype language.
4. **Action** -- Conclusion with a clear, single next step. Link to a repo, a tutorial, a tool, or a follow-up post. Tell the reader exactly what to do next.

### Pitfalls to avoid

- The Desire phase easily turns salesy in technical content. Remove adjectives like "amazing," "incredible," "game-changing." Replace them with measurable outcomes.
- Do not manufacture urgency ("act now," "don't miss out"). Technical readers distrust artificial pressure.
- If the post has no natural call-to-action, end with a question or an invitation to discuss -- do not force one.

---

## PAS (Problem, Agitate, Solution)

### When to use

- Tutorials and how-to posts where the reader arrives with a known pain point.
- "How I solved X" and troubleshooting posts.
- Any content where the reader's motivation is escaping a problem, not exploring a new idea.

### How to apply

1. **Problem** -- State the concrete pain point in the first 1-3 sentences. Use language the reader would use when searching for help. Be specific: name the tool, the error, the workflow that breaks. Prefer first-person experience ("I noticed...", "In our team...") or direct observation over fictional second-person scenarios ("You have just spent three hours...").
2. **Agitate** -- Show the real cost of the problem briefly. Quantify where possible: hours wasted per week, error rates, manual steps required. Stick to what the reader is already experiencing — do not dramatize or manufacture anxiety.
3. **Solution** -- This is the body of the post. Deliver the fix with step-by-step detail. The solution section should be the longest part -- this is what the reader came for.

### Pitfalls to avoid

- Agitation must stay professional and understated. Show real costs (wasted time, bugs, manual work, team friction). Never manufacture anxiety, dramatize consequences, or imply catastrophe.
- Do not spend more than 20% of the post on Problem + Agitate combined. The reader already knows they have the problem -- get to the solution.
- Avoid fictional second-person scenarios as hooks ("You have just spent three hours...", "Imagine you are..."). These feel manufactured and unprofessional. Prefer direct observation or first-person experience.
- Avoid restating the problem inside the solution section. Move forward.

---

## BAB (Before, After, Bridge)

### When to use

- Transformation stories and case studies.
- Before/after comparisons (performance improvements, workflow changes, architecture migrations).
- Posts where the result is more compelling than the process.

### How to apply

1. **Before** -- Describe the old or painful state concretely. Use real numbers, real scenarios, real friction points. Example: "Container builds took 15 minutes. Developers context-switched to other tasks and lost focus."
2. **After** -- Show the improved state early in the post, within the first 25%. Let the reader see the destination before you explain the route. Use the same metrics from the Before state for direct comparison.
3. **Bridge** -- The technique, tool, or approach that connects Before to After. This is the main body. Walk through the steps, decisions, and trade-offs that made the transformation possible.

### Pitfalls to avoid

- Do not exaggerate the Before state. If the old way was "slow," give the actual time. If it was "painful," describe the specific friction. Let the contrast speak for itself.
- Do not hide the Bridge section's complexity. If the transformation required effort, say so. Readers trust posts that acknowledge difficulty.
- Show the After state with the same rigor as the Before state. Vague improvements ("much faster," "way better") undermine credibility.

---

## APP (Awareness, Problem, Positioning)

### When to use

- Blog introductions where the problem is not obvious to the reader.
- Posts that challenge conventional wisdom or surface hidden issues.
- Content aimed at readers who do not yet know they have a problem.

### How to apply

1. **Awareness** -- Surface an issue the reader may not have recognized. Use a concrete observation, a trend, or a data point. Frame it as shared discovery: "Here is something worth noticing" rather than "You are doing this wrong."
2. **Problem** -- Make the impact concrete and measurable. Connect the abstract awareness to specific consequences the reader can verify in their own work.
3. **Positioning** -- Present your approach as one valid solution among others. Acknowledge alternatives. Explain why you chose this path and what trade-offs it involves.

### Pitfalls to avoid

- Do not be preachy or condescending. The tone should be "I noticed this and here is what I learned," not "you need to fix this."
- Do not dismiss alternative approaches. Position your solution honestly within the landscape of options.
- The Awareness phase must earn the reader's agreement before moving to the Problem phase. If the reader does not nod along at Awareness, the rest fails.

---

## 4Ps (Problem, Promise, Proof, Proposal)

### When to use

- Data-driven posts with benchmarks, comparisons, or measurements.
- Architectural decision records and technology evaluations.
- Posts where evidence is the primary persuasion tool.

### How to apply

1. **Problem** -- State what needs solving. Be precise about scope and constraints.
2. **Promise** -- Describe what a good solution looks like, without naming your specific solution yet. Define the criteria for success.
3. **Proof** -- Present evidence: tables, benchmarks, code demonstrations, screenshots, real data. This section should be the heaviest part of the post. Use multiple forms of proof when possible.
4. **Proposal** -- Recommend the approach, grounded in the proof you just presented. Connect each recommendation back to specific evidence.

### Pitfalls to avoid

- Proof must be genuine. Do not cherry-pick data that supports your conclusion while ignoring contradictory evidence.
- Show limitations and edge cases. Posts that acknowledge where a solution falls short are more credible than posts that claim perfection.
- The Promise phase must set evaluation criteria before the Proof phase. If you define success criteria after showing data, it looks like retrofitting.

---

## Inverted Pyramid

### When to use

- Body sections throughout any post, regardless of the overall framework.
- Conclusions and summary sections.
- Any place where the reader needs the answer before the explanation.
- Reference content and documentation-style posts.

### How to apply

Structure every section with the most important information first:

1. **Lead** -- State the conclusion, key point, or answer in the first sentence of the section.
2. **Support** -- Follow with supporting evidence, examples, or elaboration.
3. **Context** -- End with background, caveats, or related information.

Apply this at multiple levels: the post as a whole, each major section, and individual paragraphs. Front-load value at every level.

### Pitfalls to avoid

- Do not make every section read like a news article. Vary sentence length and structure to maintain a natural voice.
- The Inverted Pyramid is a structure tool, not a tone tool. The writing should still feel like a blog post, not a press release.
- Use transitions between sections to maintain flow. Front-loading each section can create a choppy feel if sections are not connected.

---

## Hybrid (Default)

This is the recommended default framework for most blog posts. It combines the strengths of multiple frameworks into a practical structure.

### When to use

- Most blog posts. Start here unless a specific framework clearly fits better.
- Posts that combine problem-solving with evidence and practical guidance.
- Any post where you are unsure which single framework to apply.

### How to apply

1. **Introduction (PAS)** -- Use Problem-Agitate-Solution structure for the first 2-4 paragraphs. Hook the reader with a recognized pain point, show why it matters, then preview the solution the post will deliver.
2. **Body sections (Inverted Pyramid)** -- Lead each section with its key point. Support with evidence, then provide context. The reader should be able to skim headings and first sentences and grasp the full argument.
3. **Proof elements (from 4Ps)** -- Include tables, code blocks, benchmarks, screenshots, or real data wherever claims need support. Every significant claim should have a proof element nearby.
4. **Conclusion** -- Summarize 2-3 key takeaways as a short list. End with a single, clear call-to-action: try the technique, explore a linked resource, or share their experience.

### How to avoid being formulaic

- Vary the hook style per post. Rotate between these approaches:
  - Open with a direct observation or insight the reader will recognize from their own work.
  - Open with a question that frames the post's central tension.
  - Open with a brief anecdote from real first-person experience.
  - Open with a concrete trend or change in the ecosystem.
  - Never open with fictional second-person scenarios ("You have just...", "Imagine you are...").
- The framework is a backbone, not a straitjacket. Skip or compress phases that do not serve the specific post.
- Read the draft aloud. If it sounds like it follows a template, rewrite the transitions and vary the paragraph lengths.

### Pitfalls to avoid

- Do not apply every element of every sub-framework in every post. Use judgment about which elements serve the content.
- Do not let the structure override the voice. The post should sound like a person writing, not a framework executing.
- If the Hybrid structure feels forced for a particular topic, switch to the single framework that fits best.
