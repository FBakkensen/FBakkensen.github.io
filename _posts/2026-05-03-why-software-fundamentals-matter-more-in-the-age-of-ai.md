---
layout: post
title: "Why Software Fundamentals Matter More in the Age of AI"
date: 2026-05-03
categories: [AI, Software Engineering, Business Central, AL]
author: Flemming Bakkensen
description: "Six pre-LLM software-engineering principles that read, in 2026, like instruction manuals for working with AI coding agents."
image: /assets/images/2026-05-03-why-software-fundamentals-matter-more-in-the-age-of-ai/cost-equation.png
tags: [ai, software fundamentals, agentic coding, software design, domain-driven design, business central, al, claude code, copilot]
---

**TL;DR**

- Software fundamentals matter more now than they ever have — agents made skipping them more expensive, not less.
- Coding was the bottleneck. Agents made coding fast — for prototypes. Past prototype scale, the slower work (design, naming, structure) is the precondition for the speed compounding instead of collapsing.
- Six quotes from before LLMs that read, in 2026, like instruction manuals for working with agents.
- One Business Central / AL example to make the abstract concrete.

The hot topic is AI. The reason AI works at all is software fundamentals — and they have never mattered more than they do right now.

Coding was the bottleneck. Agents made coding fast — for prototypes.

Past prototype scale, agents only stay fast on code that's easy to maintain and test. The slower work is what makes code that way: deciding what to build, naming it, designing the interface, holding a coherent picture of the system in your head. That slower work didn't get faster; it just stopped being optional. Without it, fast coding becomes accelerated disaster.

What's left is what the books were always about.

The principles in this post predate LLMs. Each was written for software built by humans, and each reads — in 2026 — like an instruction manual for working with agents. The books didn't age. The industry caught up to them.

<!--more-->

## The new cost equation

Matt Pocock has been saying it on X: *bad code is the most expensive it's ever been.*

The line is sharper than it looks. Agents don't slow down for bad code. They accelerate it. Whatever shape the codebase is in when the agent arrives, the agent ships more of that shape. A clear codebase compounds clarity. A muddled codebase compounds mud — at the speed of token generation. The cost of a poor abstraction used to be measured in the time it took a human to refactor it. Now it's measured in the volume of code written on top of it before anyone notices.

![Two parallel codebase tracks showing how clarity compounds upward while mud compounds downward under agent-driven development.](/assets/images/2026-05-03-why-software-fundamentals-matter-more-in-the-age-of-ai/cost-equation.png)

John Ousterhout, in *A Philosophy of Software Design*, draws a line between **tactical** and **strategic** programming. Tactical programming gets the feature done. Strategic programming invests in the design that makes the *next* feature easier — and the one after that, and the one after that. The temptation to live tactically forever has never been bigger. Token output is fast. Pull requests land fast. The dopamine hit of "shipped it" arrives fast.

The feedback that the abstraction is silently rotting arrives slow. It arrives in the form of an agent that suddenly can't navigate a part of the codebase. Or in the form of three pull requests, each coherent on its own, that disagree with each other about how the same concept works. Or in the form of a five-year-old module that stopped being editable, by humans or agents, because no one can hold the whole thing in their head anymore.

Strategic discipline used to be the boring thing senior engineers did to look responsible. The codebase that invests an hour now to extract the right abstraction does not look faster, in the moment, than the one that lets the agent inline another copy. Six months later, one of those codebases has an agent gliding through it and the other has an agent generating ever-stranger code in ever-stranger places. Strategic discipline is the activity that compounds value when everything else is being commoditized.

*Cheap coding makes strategic discipline a counter-cultural act — and counter-cultural acts are exactly what compound.*

## The shared mind

Frederick P. Brooks, in *The Design of Design*, returned again and again to one idea: a system feels coherent when there is a **design concept** — a single idea about what the thing *is* — and when that design concept is shared by the people building it. Without it, every contributor builds toward a slightly different picture, and the system fragments at the seams. The fragments are small at first. Over time the small fragments become the architecture.

Agents do not generate design concepts. Agents execute against a design concept the team holds — or, when there isn't one, they hallucinate one per pull request. Two PRs against the same module can be coherent in isolation and mutually contradictory in aggregate. The agent isn't wrong; it's filling in the gap where the design concept should be.

Eric Evans, in *Domain-Driven Design*, gave the design concept a surface in the code: the **ubiquitous language**. The same words show up in conversations between developers and stakeholders, in the code, in the tests, in the documentation. The words *are* the model. The language is what makes the design concept visible at the point where someone is about to make a change.

The agent reads the words.

This is where the abstract becomes concrete, and where Business Central makes a useful example. Agents are trained on a corpus dominated by general programming — JavaScript, Python, TypeScript, Go. They reach for the verbs of that corpus. Ask an agent to extend an AL codebase, and watch what comes out:

| Agent reaches for | BC writes | What it does in BC |
|---|---|---|
| `mutate`, `MutateRecord` | `Modify`, `OnModify` | The AL record method and the trigger fired on save |
| `process`, `handle`, `execute`, `ProcessSalesOrder` | `Post`, `Release`, `Reopen`, `Archive`, `PostSalesInvoice` | Posting, releasing, reopening, archiving documents |
| `fetch`, `retrieve`, `query`, `FetchCustomer` | `Get`, `FindFirst`, `FindSet`, `Customer.Get(CustomerNo)` | AL's record API — filters, flowfields, the whole record lifecycle |

`MutateRecord` could be doing anything from validation to posting to a soft delete. `PostSalesInvoice` means exactly one thing, and every BC developer knows what that thing is — and so does every agent that has read enough BaseApp. `FetchCustomer` looks like database code from any other stack; `Customer.Get(CustomerNo)` is the only thing that compiles, behaves predictably under filters and flowfields, and reads as native to anyone who works in BC.

The agent isn't wrong in general. It's wrong in *this* domain. That is exactly what ubiquitous language is for. BC has spent four decades curating a vocabulary that maps each word to a specific behavior in the platform. When the codebase uses BC's words, the agent's next suggestion stays inside the model. When the codebase uses generic words, the agent guesses — and on a different day with the same prompt, it guesses differently.

Brooks tells us the team needs a shared design. Evans tells us the surface of that shared design is the words. The agent is now reading those words and treating them as instructions.

*The agent reads what's already written. Naming is the prompt you wrote yesterday.*

## Code shape for the agent

Ousterhout opens *A Philosophy of Software Design* with a working definition: **complexity is anything related to the structure of a software system that makes it hard to understand and modify.** Notice what the definition is about. It's about a reader — someone trying to understand the system, someone trying to change it. A complex system is one that loses its reader.

The reader used to be a human. The reader is now an agent.

That's not a small switch. The agent reads every file, every time it touches the codebase, without the intuition a developer builds over years. Developers haven't left the loop — they've moved up. They read design decisions, names, interfaces, the higher-level shape of a diff. The line-by-line is the agent's.

Complexity that loses the agent doesn't get caught at human scale anymore — there isn't enough human attention left to find it. The agent that produces strange code in a part of the codebase a new hire would also find confusing isn't malfunctioning. It's reporting that the complexity was always there. The codebase used to be lucky enough to have one slow reader to fail.

The book's most influential idea is **deep modules**: a module is *deep* when it provides a lot of functionality through a simple interface, and *shallow* when its interface is roughly as complex as its implementation. Shallow modules force the reader to understand everything to change anything. Deep modules let the reader trust the contract and edit at the surface.

One line of AL, and what's actually behind it:

```al
Codeunit.Run(Codeunit::"Sales-Post", SalesHeader);
```

That call validates the document, posts G/L entries, posts item ledger entries, applies customer and vendor ledger entries, recalculates prices, handles item tracking, propagates dimensions, and creates the posted document records. Hundreds of objects in BaseApp move when it runs. There's no shallow alternative — no realistic version of this code that exposes each step to the caller — because no extension would keep up with the changes BC makes to that pipeline release after release. Depth here isn't elegance. It's the only way the system holds together at scale.

This is exactly the shape an agent needs. A deep module gives the agent a small interface to read, a clear contract to honor, and a body it doesn't have to spelunk through. A shallow module forces the agent to load the whole tree to make any change — and even then, changes leak through the porous interface and break things in places no one expected, including the agent.

Deep modules used to be defended as elegant. Elegance was the case made for them. But elegance is a taste argument, and taste arguments don't move teams. The argument moved when the agent took over the reading. The interface of a deep module is the prompt context the agent doesn't need to be given. It's the documentation the agent doesn't need to read. It's the part of the codebase the agent can edit without the change rippling outward into three places no one was thinking about.

*Deep modules aren't elegant. They're the unit of agent-comprehensibility.*

## The books were aimed here all along

Read the quotes again. Three — Ousterhout (2018), Brooks (2010), Evans (2003) — predate the moment agents started writing production code. Each lands harder now than when it was written. Pocock's tweet is the contemporary witness: someone watching the cost of ignoring the rest spike in real time.

That isn't a coincidence. Coding was the foreground; the slower work — design, naming, structure — was the background. The books were always aimed at the background. The industry, distracted by coding's pace, treated them as taste.

Now the foreground has gone quiet, and what's left is exactly what the books wrote about.

There's another piece of this — the discipline of small deliberate steps and tight feedback loops — but that's [its own post]({% post_url 2025-10-14-feedback-loops-in-agentic-coding-tools-why-self-correction-beats-one-shot-perfection %}). The structural argument and the pace argument support each other; this post is the structural half.

Agents have already read the canon. Ousterhout, Brooks, Evans — they're in the training data, the principles fluent. The agent isn't missing the knowledge; it's missing your codebase's specific take on it. Skills, subagents, the persistent context the agent reads before any work — that's where the principles stop being something the agent might remember and start being something it has to honor.

The fundamentals were always leverage. They used to live in books. Now they live in your wiring — your skills, your subagents, the context the agent reads before every PR.

The books didn't change. The agent did. The wiring is yours.
