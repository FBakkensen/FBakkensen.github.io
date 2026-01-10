---
layout: post
title: "From Spaghetti to Sanity: Transforming Legacy Projects with AI Agents"
date: 2026-01-10
categories: [Business Central, AI]
author: Flemming Bakkensen
description: "How to use modern coding agents like Claude Opus 4.5 and Debug Telemetry to refactor legacy Business Central projects safely."
tags: [legacy-code, refactoring, ai-agents, tdd, business-central]
---

## 🎯 Introduction

We've all seen the demos. A coding agent starts with a blank canvas and builds a fully functional web app in minutes. It's the "Greenfield Dream." But for most of us, reality looks more like a "Brownfield Nightmare." We spend our days in codebases that have been growing for years—layer upon layer of good old Western Spaghetti code.

I have spent the last nine months working on such a project. It’s a mission-critical system with complex business logic and nearly a decade of features bolted on. In the beginning, there was no "Clean Architecture" or "SOLID" principles—just a focus on shipping features fast. And to be fair, I actually agree with that approach for a new project that needs to gain traction. But over time, it can lead to a place where the code feels like an **upside-down pyramid**, balancing precariously on the tiny tip of its original intent.

As is often the case with these kinds of evolutions, there were **zero automated tests**.

Touching one area felt like playing Jenga in a windstorm. How do you introduce AI and coding agents into *that*?

<!--more-->
![Inverted Pyramid Legacy Code](/assets/images/2026-01-10-ai-legacy-project-refactoring/inverted_pyramid.png)

## 📋 The Strategy: Incremental Transformation

The goal wasn't a "Big Bang" rewrite—that’s a recipe for disaster. Instead, I adopted a rule: **Every bug fix or new feature must leave that specific area cleaner than I found it.**

I moved the project one component at a time toward a cleaner, more testable architecture. This wasn't just manual work; it was a partnership with my modern coding agents.

### The Workflow Overview

<div class="mermaid">
flowchart LR
    subgraph Mapping [1. Coverage Phase]
    direction TB
    A[Start: Area] --> B[Behaviour Mapping]
    B --> C[Debug Telemetry]
    C --> D[Generate Tests]
    D --> E[Verify Logs]
    end

    subgraph Refactor [2. TDD Phase]
    direction TB
    F{Tests Pass?} -- Yes --> G[Refactor/Feature]
    G --> H[Code Review]
    end

    E --> F
    F -- No --> C
</div>

---

## 🛡️ Phase 1: Behaviour Mapping & Debug Telemetry

Before I changed a single line of production code, I had to understand what it *actually* did. My coding agents—most recently **Claude Opus 4.5**—are incredibly good at summarizing code, but legacy logic is often full of hidden side effects that a static scan might miss.

### Step 1: Documenting Current State
I start by prompting the agent to explain the area. We keep iterating until we both understand the execution paths. I instruct the AI to keep a "Knowledge Base" updated in a GitHub Issue. This issue becomes the source of truth for the tests we are about to write.

### Step 2: The "Debug Telemetry" Concept
Adding tests to legacy code is hard because you don't always know if your test data is hitting the right code path. To solve this, I introduced **Debug Telemetry**.

When the agent writes a test, I also ask it to temporarily add logging to the production code at every major decision point.
1. The AI writes the test.
2. The AI adds logging to the production code.
3. The test runs, and logs are written to a file.
4. The AI reads the log file to verify the execution path matches the test's intent.
5. Once verified, the logs are removed.

<div class="mermaid">
sequenceDiagram
    autonumber
    participant A as 🤖 AI Agent
    participant P as ⚙️ Production Code
    participant T as 🧪 Test Code
    participant L as 📄 Log File

    Note over A,P: Phase 1: Injection
    A->>P: Inject Telemetry Logs

    Note over A,T: Phase 2: Execution
    A->>T: Run Test Suite
    T->>P: Execute Logic
    P->>L: Write Decision Points

    Note over A,L: Phase 3: Verification
    A->>L: Read & Verify Path
    A->>P: Remove Telemetry Logs
</div>

This ensures no "early exits" or false positives are hiding in the mess.

---

## 🏗️ Phase 2: The TDD Implementation Loop

Once the current behavior is locked down with tests, the real work begins. This isn't just about writing code; it's about a highly disciplined Test-Driven Development (TDD) cycle where the AI agent acts as the primary "driver" and I act as the "navigator."

### The "Agreement" Phase
Before any production code is touched, I prompt the AI with the specific problem (bug or feature) and my suggestion for the refactor. We iterate until we agree on the architectural direction.

I then have the agent create a formal **Test Plan** in Gherkin style (Given/When/Then). This is added to our GitHub Issue. This step is critical: **the agent doesn't start coding until I've approved the plan.**

### The Execution Loop
With the plan in place, the agent enters a rapid TDD loop, utilizing the same **Debug Telemetry** workflow from Phase 1 to ensure the new implementation isn't just passing tests, but doing so via the correct logic branches.

| Phase | Description | AI & Human Interaction |
| :--- | :--- | :--- |
| **🔴 Red** | The agent writes a new test that reflects a needed capability. | **Agent:** Runs tests to confirm failure. <br> **Human:** Monitors the intent of the test. |
| **🟢 Green** | The agent implements just enough code to make that test pass. | **Agent:** Runs the suite. <br> **Human:** Verifies telemetry logs show the correct path was taken. |
| **🔵 Refactor**| The agent cleans up the code, extracting services or improving naming. | **Agent:** Ensures tests stay green. <br> **Human:** Performs a code review for adherence to "Clean AL" standards. |

### The "Closing the Loop" Review
Once the agent thinks the task is complete, it performs a **self-review** based on its internal "Senior Developer" instructions. It identifies potential edge cases it might have missed and fixes them autonomously.

Finally, I do my manual review. If I find a bug during my manual testing (which happens less and less these days!), I don't fix it myself. I ask the AI to:
1. Reproduce the bug in a new failing test.
2. Fix the implementation.
3. Verify all existing tests still pass.

This ensures the "upside-down pyramid" doesn't just get smaller—it gets **rock solid**.

---

## 🤖 My AI Setup (January 2026)

To pull this off, I use a multi-agent orchestration setup. I have a **Main Orchestrator** that delegates to specialized subagents. These agents are portable—I copy their instructions between projects.

### Current "Top Tier" Model Comparison

To get the most out of this, I only use top-tier models. Even if they are the most expensive, the value they deliver is worth it many times over. The level of reasoning they provide in a 30-60 minute autonomous run is staggering.

| Model | Primary Use Case | Why I use it |
| :--- | :--- | :--- |
| **Claude Opus 4.5** | Complex Logic & Architecture | Best at reasoning through "upside-down pyramids" and legacy knots. |
| **GPT-5.2 Codex (X-High)**| Pure Code Generation | Incredible speed for boilerplate and repetitive unit tests. |
| **Gemini 3 Pro** | Frontend & UI | Exceptional at frontend work. I rarely use it for BC as most of our "frontend" is AL code, but it's a lifesaver for JS-heavy Control Add-ins. |

Since **Claude Opus 4.5** launched in late November 2025, it has been a game-changer. I barely touch code anymore.

![AI Agent Transforming Legacy Code to Clean Architecture](/assets/images/2026-01-10-ai-legacy-project-refactoring/clean-architecture-transformation.jpg)

## 🏁 Conclusion: The Result

You might think this sounds like a lot of extra work. And yes, the first few weeks of setting up the test infrastructure and adapting to the "Telemetry Workflow" were challenging.

But looking back, I have saved **weeks** and **months** of manual debugging and development. Since the realease of Claude Opus 4.5 in late November 2025, have I written **less than 100 lines of manual code**, yet I have shipped more features with higher quality than ever before. My users are happier, and for the first time in years, I'm not afraid to deploy on a Friday.

While I was writing this post, my coding agent just finished implementing another 11 tests and a significant refactor. It's time for my review.

**Are you still coding manually, or are you orchestrating?**

---

`PS C:\ALProjects\BCBlog> Exit`
