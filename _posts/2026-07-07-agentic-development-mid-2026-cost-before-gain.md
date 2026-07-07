---
layout: post
title: "Agentic Development Mid-2026: Cost Comes Before Gain"
date: 2026-07-07
categories: [AI, Development]
author: Flemming Bakkensen
description: "A mid-2026 reflection on agentic development: why cost arrives before gain, how tools stratify by maturity, and why developers talk past each other."
tags: [agentic-development, ai-maturity, ai-cost, developer-experience, claude-code, github-copilot, reflection]
---

<span class="prompt">PS C:\DevProjects\DevBlog&gt;</span> Get-Content .\Thoughts\AgenticMidYear2026.md

Halfway through 2026, the conversations I have about agentic development have started failing in a particular way. Two developers use the same words (agents, tooling, cost, quality) and mean entirely different things by them. Neither is wrong. They are reporting from different places on a curve that is moving faster than teams can climb it.

This is a mid-year post, written before the summer break. I do not have a fix for this yet, but I can name the tension precisely enough that you will likely recognize it in your own team.

<!--more-->

<!-- IMAGE: hero.jpg -->
![Three developers on rising plateaus of one mountain, price tags growing with height and an agent network visible only from the top](/assets/images/2026-07-07-agentic-development-mid-2026-cost-before-gain/hero.jpg)
<!-- PROMPT: A clean digital illustration in isometric perspective of a stylized mountain with three plateaus at increasing heights, connected by a single winding path. On each plateau stands a small developer figure with a laptop, all three looking out over the same wide valley, but the valley reads differently depending on the height. From the lowest plateau the valley is mostly hidden in cool grey fog, and the only clearly visible object near that figure is a large floating price tag reading a dollar amount. From the middle plateau the fog thins, revealing a few glowing amber paths connecting small worker robots in the valley, and the price tag beside this figure is smaller. From the highest plateau the valley is fully visible as an organized network of glowing amber paths linking many small worker robots into a coordinated system, with no price tag in sight. Between the three figures, small speech bubbles float upward, each containing a different abstract symbol so it is clear they are not speaking the same language. Cool blue and teal palette with warm amber accents reserved for the glowing network, soft ambient lighting, modern flat-design style with subtle depth, calm and reflective tech-editorial mood, no text anywhere in the image except the dollar signs on the price tags. -->
<!-- STYLE-ANCHOR: digital illustration, clean isometric style, cool blue and teal palette with amber accents, soft ambient lighting, professional and modern tech-editorial feel -->
<!-- /IMAGE -->

## 🧭 Where Agentic Development Actually Stands

The capability jumps keep coming, and they are not slowing down. Independent measurement backs the feeling: METR, a vendor-independent research group, tracks the length of task an AI agent can complete autonomously and finds it doubling roughly every seven months. That is not a marketing claim; it is one concrete reason this year feels different from last year.

The working modes have shifted with it. A year ago, agentic development meant prompting: one request, one wait, one review. Today it increasingly means orchestrating: several agents working in parallel on bounded tasks while the developer supervises and reviews. And the frontier models arriving now are explicitly built for long-running, asynchronous work, which points at the next mode: orchestrating agents that themselves orchestrate other agents.

The tooling has stratified along the same lines rather than converging. The IDE integration serves real-time pairing. The CLI serves local, supervised execution. Cloud agents serve asynchronous delegation of reviewable work. These are not competing products where one wins; they are layers that map onto different ways of working, and, though nobody quite says it out loud, onto different maturity levels.

## 💸 The Cost Arrives Before the Gain

Here is the asymmetry I keep running into: the cost of agentic development is immediate, precise, and lands on an invoice. The gain is lagging, diffuse, and shows up as things that are hard to point at: fewer review rounds, better negative-path test coverage, work that ran over the weekend.

Worse, the gain is gated by maturity. Early-stage usage looks like prompt, then wait. The wait is too short to parallelize, and the habit of running several workstreams at once has not formed yet. That stage produces visible cost with limited visible output, and it is a stage everyone passes through. In what I have seen so far, the developer who has climbed further pays more per session and gets disproportionately more back, but on a spend report those two situations are indistinguishable: a rising AI cost line looks the same whether it reflects low-value or high-value usage.

> The uncomfortable consequence: judged purely by the numbers that are easiest to collect, agentic development looks worst exactly when a team is doing the necessary work of getting better at it.

That does not make cost scrutiny wrong. It makes cost, on its own, structurally incomplete as a measure, because the counterweight (quality and throughput) has to be measured deliberately or not at all.

## 🧪 A Small Experiment That Made It Concrete

I got one clean look at this tension recently. The same task specification, a refactor of internal build tooling in a Business Central (AL) codebase I work in daily, with its own definition of done, went to four agentic setups, run in parallel and in isolation. Three used the same model in different coding agents; one swapped the model inside the same agent.

| Implementation | Cost |
|:---|---:|
| Opus 4.8, GitHub Copilot in VS Code | $38.27 |
| Opus 4.8, GitHub Copilot CLI | $55.76 |
| Opus 4.8, Claude Code | $56.75 |
| Fable 5, Claude Code | $78.55 |

An independent cross-vendor review (GPT-5.5, which produced none of the implementations) ranked them against the task's own definition of done. The cheapest run ranked last, with the weakest negative-path coverage. The most expensive ranked first, was the only one the review judged shippable after a single run, and was the only one that wired a spec-required safety check into the live flow instead of merely defining it. It was also the only one that reviewed its own work before declaring itself done, unprompted, and that review pass is part of its higher price.

One experiment, run once, operated by one person, proves no general rule, and I am not presenting it as one. What it does is make the abstract tension concrete: on the invoice, the four runs differ by $40. Everything that actually mattered about them, which one was finished, which one wired in the safety check, is invisible at exactly the altitude where spending decisions get made.

## 🗣️ Speaking Different Languages

Now put the two halves together. Capability doubles roughly every seven months, while developer maturity moves at the speed of habit change, which is to say slowly and unevenly. The result is a gap inside teams that compounds rather than stays fixed: standing still does not cost a fixed increment, it costs a doubling every seven months.

And a compounding maturity gap produces something subtler than a skills difference: it produces different languages. Versions of sentences I keep hearing, from people describing the same technology in the same month:

| Vantage point | What agentic AI looks like | What the invoice means |
|:---|:---|:---|
| Prompting | A faster autocomplete that is sometimes wrong | A cost to justify |
| Orchestrating | Parallel workstreams with review gates | A rounding error next to the throughput |
| Orchestrating orchestrators | Delegation of whole bounded tasks, asynchronously | The cheapest team member by far |

Each row is an honest report of lived experience. That is precisely why the conversations fail: nobody is lying, nobody is hyping, and yet the words do not carry across rows. A discussion about "whether the AI spend is worth it" between row one and row two is not a disagreement about facts. It is two coherent worldviews colliding, each backed by everything its holder has personally seen. I have written before about why [software fundamentals matter more in the age of AI](/ai/software%20engineering/business%20central/al/2026/05/03/why-software-fundamentals-matter-more-in-the-age-of-ai.html); this is the organizational version of the same argument. The constraint is not the technology. It is how fast people and teams can change how they work.

## 🌅 A Mid-Year Thought Before the Break

I do not have a tidy resolution, and I distrust posts that do. What I have, halfway through 2026, is a diagnosis: the gap between maturity levels is now wide enough that it has started to break language inside teams.

The open question I am taking into the summer is the one none of this answers: what actually moves a developer from one row of that table to the next? Practice on real work rather than sandboxes? Pairing with someone a level up? Changed delivery expectations? I have seen candidates, and I have written about how [feedback loops beat one-shot perfection](/ai/copilot/business%20central/al/2025/10/14/feedback-loops-in-agentic-coding-tools-why-self-correction-beats-one-shot-perfection.html) at the tool level, but I have not seen proof of what works at the human level. If your team has, that is the conversation I want to have after the break.

<span class="prompt">PS C:\DevProjects\DevBlog&gt;</span> Suspend-Process -Name "AgenticAdoption" -Until "August"

---

*Where is your team on that table, and what has actually moved people between rows? Connect with me on [LinkedIn](https://www.linkedin.com/in/flemmingbakkensen/) or [X](https://x.com/fbakkensen).*
