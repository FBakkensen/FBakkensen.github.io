---
layout: post
title: "The AI Software Factory: Automate Execution, Not Decisions"
date: 2026-07-31
categories: [AI, Development]
author: Flemming Bakkensen
description: "How my AI software factory works: AI in every phase, reviews at every gate, decisions kept human, and agile replanning instead of spec-driven autonomy."
tags: [ai-software-factory, agentic-development, human-in-the-loop, spec-driven-development, quality-gates, mutation-testing, business-central, al]
---

<span class="prompt">PS C:\DevProjects\DevBlog&gt;</span> Get-Content .\Architecture\AISoftwareFactory.md

The software factory conversation has reached the Business Central community. Krzysztof Bialowas asks [whether he still needs VS Code](https://www.linkedin.com/pulse/do-i-still-need-vs-code-al-development-short-answer-bialowas-e7mhf/) now that his AI factory carries work from design through documentation, and Vjekoslav Babic writes that [he does not trust his agents either](https://vjeko.com/2026/07/21/i-dont-trust-my-agents-either/); he trusts the fourteen hundred lines of orchestration wrapped around them. I run an AI software factory too: a pipeline of skills that takes an AL feature from a rough idea to a merged branch, with AI working in every single phase. Reading both posts, I recognize a principle underneath them that I suspect both authors would sign, even though neither spells it out: automate the execution, never the decisions. This post names that principle and shows what a factory looks like when it is the design rule from the start.

<!--more-->

<!-- IMAGE: hero.jpg -->
![Isometric software factory with robot-run stations, human decision desks at the gates, and one module routed back for replanning](/assets/images/2026-07-31-ai-software-factory-automate-execution-not-decisions/hero.jpg)
<!-- PROMPT: A clean digital illustration in isometric perspective of a stylized software factory floor built as a production line of clearly separated stations. Each station is a small platform where a friendly robot arm works on a glowing translucent blue block resembling a code module, and the stations are connected in sequence by short conveyor segments. The line begins at an elevated desk where a human figure and a small robot sit across from each other in conversation over a blueprint, and further human desks stand as gates between later stations, one human stamping a module with a warm amber glow of approval. Modules that passed a human desk glow amber while modules still in execution stay cool blue. One conveyor segment visibly loops a single blue module from a late station back toward the first desk, showing work being sent back for a new decision. Cool blue and teal palette with warm amber accents reserved for approved work, soft ambient lighting, subtle depth and long soft shadows, calm and orderly mood, modern flat-design tech-editorial style, no text anywhere in the image. -->
<!-- STYLE-ANCHOR: digital illustration, clean isometric style, cool blue and teal palette with amber accents, soft ambient lighting, professional and modern tech-editorial feel -->
<!-- /IMAGE -->

## 🏭 The Line: AI in Every Phase, a Human at Every Gate

My factory is a fixed sequence of stations. Each station is a skill: a prose playbook the agent loads, which tells it exactly what it may produce, what artifact it consumes from the previous station, and what it must stop and ask about. The stations run in the same order for every feature: an architecture interview that settles domain terms and records decisions, an event model for anything user-facing, a design pass, scoping into tasks, and then a per-task loop of refine, implement, refactor, and mutation test, closed out by code review, user verification, and breaking-change validation before merge.

That reads like automation, and the execution genuinely is. But look at where the decisions sit:

| Station | The AI executes | The human decides |
|:---|:---|:---|
| Architecture interview | Asks one question at a time, drafts ADRs and context docs | Every architectural decision, explicitly |
| Design and scoping | Drafts the architecture, cuts the work into tasks and slices | Approves seams, public surface, and the cut |
| Refine | Writes the test specification as a contract, before any code | Reviews and approves the contract |
| Implement, refactor, mutate | Red-green implementation, reshaping, mutation testing | Rules on every surviving mutant |
| Code review | Reviews the landed diff against the settled baselines | Settles anything that would change a baseline |
| User verification | Drives containers, publishing, and replay | Walks the UI and reports what they actually see |

Every artifact lives on disk, not in the agent's head. Tasks are files with two possible states, open and done; everything else, like ready or blocked, is derived fresh on every read, so nothing can go stale. Agent context is ephemeral by nature, and a factory that keeps its work-in-progress inventory in files survives what an agent's memory cannot: the end of a session.

## 🧑‍⚖️ Why Decisions Stay Human

I owe you a definition first, because the whole post stands on it. In my factory, a decision is anything that sets a baseline other work will build on: what a domain term means, where an architecture seam sits, what a public procedure promises, which behaviour counts as correct. Execution is everything that can be checked against a baseline that already exists. The line has nothing to do with difficulty; plenty of execution is harder than the decision above it.

The line matters because only execution can be verified. A wrong implementation fails a gate the same afternoon: a test, a warning, a surviving mutation. A decision has no gate; it is only right relative to an intent, and intent lives with a person. A wrong decision passes every gate I have and surfaces months later as a product that does the wrong thing correctly.

> Agents take the execution because execution can be checked. Decisions come to me because there is no gate that can check one.

That single asymmetry shapes both ends of the pipeline.

### Settled on the way in

Most of my skills open with an interview phase, and some escalate into outright grilling: one question per message, options laid out, a recommendation marked, and the answer written to disk the moment it lands. Domain terms, seams, public surface, and expected behaviour are settled there, with me, before any agent writes a line of AL. The interview is not a courtesy step; it is the factory extracting every decision out of the work up front, so that what remains downstream really is execution.

### Enforced on the way out

The review station guards the same line from the other side. A finding is only rework if fixing it restores conformance to a baseline that already exists: a spec, an ADR, an architecture document, or behaviour a human already verified. Anything that would change a baseline, or invent one that does not yet exist, becomes a change request that I settle. The agent may not author its own authority. One consequence follows automatically: a behaviour-changing fix inside a slice a human has already walked through is always a change request, because an autonomous fix would silently invalidate verification that was already paid for.

I want to be honest about where this boundary sits, because it is narrower than it may sound. The implement, refactor, and mutation-test loop is pure execution against an approved contract, and I am considering chaining it to run without me. The automation boundary can keep moving up through execution. It stops below decisions, and that is by design, not by current tool limitations.

The boundary also says what my factory is for: larger features, where decisions are dense. A small change or a simple bug fix is nearly all execution, and I believe that class of work can run fully automated, a cloud agent taking a GitHub issue or an Azure DevOps work item in and handing a pull request out, with the same reviews and guards around it and the result staged for user verification. The infrastructure that requires is a real project in the Business Central world and not one I have built; Torben Leth has described exactly that flow in [From Work Item to PR Without Me](https://blog.sshadows.dk/blog/from-work-item-to-pr-without-me/).

## 🔄 Agile, Not Spec-Driven

Here is where I part ways with the picture most people have of an AI software factory: write a big specification, hand it to the agents, and let the line run. I deliberately refine one task at a time, because I do not treat this as spec-driven development. It is an agile flow, and the plan gets rewritten while the line is running.

Every station does double duty: it executes its own stage, and it tests what that stage rests on against what it actually finds. Earlier decisions and reality that was not visible up front are both fair game, so replanning can start anywhere on the line.

Refine can discover that a task was cut wrong. Implement is where existing code, in the project or in its dependencies, most often turns out not to be what the plan assumed, and that forces a decision nobody knew was needed. Refactor, mutation testing, and code review surface findings that call for tasks nobody planned. A finding can even reach back to the architecture or the event model, which re-opens everything built on top.

But no station replans on its own authority. It puts the case to me, and the change lands only after I decide it. Replanning is not failure; it is the plan catching up with what the code teaches, and because changing the plan is itself a decision, it runs through me.

> A specification written before implementation is a hypothesis. The factory's job is not to protect the hypothesis; it is to make revising it cheap.

Replanning is not an interruption of the process. It is the process.

## 🔐 Trust Is Deterministic, and Getting More So

Vjeko's argument is that a hundred gates that run every time give you a floor, where a single review gives you a feeling. I agree, and my version of that floor is already deterministic where it matters most. The build gate demands zero errors and zero warnings, with code analyzer rules hard-enforced, so an entire class of judgment calls never reaches a human. Mutation testing then checks the tests themselves: production code is broken one site at a time, and a test suite that stays green has been caught asserting nothing. I have written before about [making validation mandatory with quality gates](/ai/devtools/development/2026/03/27/quality-gates-for-coding-agents-how-stop-hooks-make-validation-mandatory.html), and this factory is that idea grown into a pipeline.

Where it goes next is still open. The ideas I am circling all share one shape: replace more of the remaining agent judgment with checks that cannot have an opinion.

| Candidate gate | The judgment it would replace |
|:---|:---|
| Architecture fitness functions over the object graph | An agent's opinion on whether a dependency is acceptable |
| Traceability gate: new public surface must trace to a design decision | Hoping nobody quietly extends the shipped API |
| CRAP score ceiling (complexity times untested-ness) per procedure | Debating whether a procedure is "too complex" |
| Mutation score floor as a hard gate | Trusting that green tests mean protective tests |
| Test runs under the shipped permission set instead of SUPER | Discovering permission errors from customers |

Notice the direction: none of these would add autonomy. They would convert judgment into arithmetic, which is the opposite of asking an agent to judge harder. Judgment that can be made deterministic should be; judgment that cannot stays human. And if you have turned a judgment call in your own pipeline into arithmetic, that is exactly the kind of idea I am collecting.

## 🌅 An AI Software Factory Without an Autopilot

So is an AI-driven software factory possible? Yes, and I run one on real project work every day. But possible does not mean what the phrase suggests. Mine has stations, artifacts, gates, and AI in every phase, and it still is not an autopilot, for three deliberate reasons: architecture is settled in interviews with a human before agents execute, planning stays agile with tasks refined one at a time and replanned constantly, and trust comes from deterministic gates rather than from the agent's self-assessment. This is the same conviction I argued in [why software fundamentals matter more in the age of AI](/ai/software%20engineering/business%20central/al/2026/05/03/why-software-fundamentals-matter-more-in-the-age-of-ai.html), now expressed as tooling, and it is one concrete answer to the maturity question I left open in [my mid-2026 reflection on agentic development](/ai/development/2026/07/07/agentic-development-mid-2026-cost-before-gain.html).

The open question I would put to anyone building their own factory is not how much you can automate. It is where you draw the line between execution and decision, because everything above that line is a candidate for automation, and everything below it is the part that was always your job.

<span class="prompt">PS C:\DevProjects\DevBlog&gt;</span> Start-Factory -Autopilot:$false -DecisionAuthority Human

---

*Where does your factory draw the line between execution and decision? Connect with me on [LinkedIn](https://www.linkedin.com/in/flemmingbakkensen/) or [X](https://x.com/fbakkensen).*
