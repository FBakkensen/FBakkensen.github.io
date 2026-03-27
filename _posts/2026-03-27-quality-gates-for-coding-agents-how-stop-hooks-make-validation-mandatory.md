---
layout: post
title: "Quality Gates for Coding Agents: How Stop Hooks Add Validation Checkpoints"
date: 2026-03-27
categories: [AI, DevTools, Development]
author: Flemming Bakkensen
description: "Learn how Stop hooks block AI coding agents from responding and prompt them to review their own work — a practical guide to building quality gates."
tags: [quality-gates, stop-hooks, claude-code, agentic-development, feedback-loops, automation, plugin-marketplace]
---

<span class="prompt">PS C:\DevProjects\DevBlog&gt;</span> Get-Content .\Architecture\StopHookQualityGates.md

## 🎯 Introduction

In a [previous post](/2025/10/14/feedback-loops-in-agentic-coding-tools-why-self-correction-beats-one-shot-perfection/), I wrote about feedback loops through compilation, static analysis, and testing — mechanisms that let AI coding agents validate their own work iteratively. Those loops operate at the code level: does it compile, does it pass analysis, do the tests pass.

This post introduces a complementary feedback loop that operates at the agent lifecycle level. A **Stop hook quality gate** intercepts the agent before it responds to you and prompts it to review its own work — did it run the build, did the tests pass, are there loose ends? The two loops work together — one gives the agent the tools to validate, the other reminds it to use them.

<!--more-->

## 🔓 The Trust Gap: When Feedback Loops Are Optional

I have build automation, static analyzers, and a test suite set up in my Business Central projects. The AI agent has access to all of it. Yet I still encounter sessions where the agent writes code, declares it done, and never runs a single validation step.

This is not a failure of tooling. The tools work. The failure is structural: **prompt instructions are suggestions, not constraints.** An instruction like "always run tests before responding" works most of the time. But "most of the time" is not a quality standard — it is a hope.

The root issue is the gap between capability and reliability:

| Approach | Mechanism | Outcome |
|:---|:---|:---|
| No validation | Agent generates code and responds immediately | Bugs reach the developer undetected |
| Voluntary validation | Prompt instructs agent to run tests | Inconsistent — depends on context and model behavior |
| Gate-prompted validation | Quality gate blocks response and prompts the agent to review | Structured review on every code change |

> **The gap is not in capability but in reliability.** An agent that *can* validate is good. An agent that *must* validate is better.

The question becomes: how do you move from the second row to the third? How do you make validation something the agent is always prompted to do?

---

![A digital gate checkpoint filtering code through quality validation before reaching the developer](/assets/images/2026-03-27-quality-gates-for-coding-agents-how-stop-hooks-make-validation-mandatory/hero.jpg)

---

## 🚪 Stop Hooks: The Bouncer at the Door

Claude Code provides a **hooks system** — user-defined commands that execute automatically at specific points in the agent's lifecycle. Hooks are deterministic: unlike prompt instructions that guide behavior, hooks guarantee that actions execute when conditions are met.

Several hook events exist across the lifecycle:

| Event | When It Fires |
|:---|:---|
| `PreToolUse` | Before a tool call — can block it |
| `PostToolUse` | After a tool call succeeds |
| `SessionStart` | When a session begins or resumes |
| **`Stop`** | **When the agent finishes responding** |

The **Stop hook** is the quality gate mechanism. It fires every time the agent is about to deliver a response. At that moment, your hook receives the full session context and makes a decision: allow the response, or block it.

### How a Stop Hook Decides

The hook receives JSON on stdin with session context — including the transcript path and a critical flag called `stop_hook_active`. It returns one of two outcomes:

- **Allow** (exit code 0): the agent responds normally.
- **Block** (return `{"decision": "block", "reason": "..."}`): the agent is forced to continue working. It sees your reason and acts on it.

Here is the decision cycle as a flowchart:

<div class="mermaid">
flowchart TD
    A["Agent finishes work"] --> B["Stop hook fires"]
    B --> C{"stop_hook_active?"}
    C -->|"Yes"| D["Allow response ✓"]
    C -->|"No"| E{"Code tools used?"}
    E -->|"No"| D
    E -->|"Yes"| F["Block: require quality review"]
    F --> G["Agent performs quality review"]
    G --> H["Agent tries to respond again"]
    H --> B
</div>

The `stop_hook_active` flag is essential. When the hook blocks a response, the agent continues working and eventually tries to respond again. The second time the Stop hook fires, `stop_hook_active` is `true`, signaling that the agent is already in a review cycle. Without this check, the hook would block indefinitely — an infinite loop. The flag acts as the termination condition.

---

## 🔬 Anatomy of a Quality Gate

A well-designed quality gate has three properties. Missing any one of them creates problems.

### 1. Detection

The gate must know whether action is required. Not every agent response involves code changes — many are explanations, research summaries, or status updates. A quality gate that triggers on every response wastes time and breaks flow.

**Detection strategy**: scan the session transcript for code-modifying tool calls. If the agent used `Write`, `Edit`, or `NotebookEdit`, code was changed and validation is needed. If not, let the response through silently.

### 2. Enforcement

When detection triggers, the gate must block the response and specify exactly what the agent should do. Vague instructions like "check your work" produce vague results. Effective enforcement means concrete review criteria:

- Were all requested tasks completed?
- Were changes verified (tests run, project built)?
- Are tests meaningful — not vague or trivial?
- Is the code clean and following project conventions?
- Are there any loose ends or unresolved issues?

### 3. Termination

The gate must eventually allow a response through. Without a termination mechanism, the agent gets stuck in an infinite review loop. The `stop_hook_active` flag serves this purpose — on the second pass, the gate steps aside and lets the reviewed response through.

This three-property framework — detection, enforcement, termination — applies to any quality gate, regardless of the specific implementation. Here is how the three properties interact during a single quality gate cycle:

<div class="mermaid">
sequenceDiagram
    autonumber
    participant A as Agent
    participant H as Stop Hook
    participant T as Transcript
    participant S as State File

    A->>H: Finishes work, Stop event fires
    H->>S: Read last checked line number
    H->>T: Stream unprocessed lines
    T-->>H: Return tool_use entries
    H->>H: Detect code-modifying tools
    H->>S: Write updated line count
    H-->>A: Block: require quality review
    A->>A: Run subagent quality review
    A->>H: Tries to respond again (stop_hook_active=true)
    H-->>A: Allow response
</div>

The following section shows one concrete implementation that satisfies all three properties.

---

## 🛠️ A Concrete Implementation

This implementation comes from the [al-build plugin](https://github.com/FBakkensen/bc-agentic-dev-tools-marketplace) in my Business Central agentic development tools marketplace. The plugin is distributed through a [plugin marketplace](/2026/03/21/plugin-marketplaces-for-coding-agents/) — but the quality gate pattern itself is universal.

### The Hook Configuration

The `hooks.json` file registers a single Stop hook:

```json
{
  "hooks": {
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "pwsh -NoProfile -File ${CLAUDE_PLUGIN_ROOT}/hooks/quality-gate.ps1",
            "timeout": 10
          }
        ]
      }
    ]
  }
}
```

The configuration is minimal: run a PowerShell script when the agent stops, with a 10-second timeout. The `${CLAUDE_PLUGIN_ROOT}` variable resolves to the plugin's root directory, making the path portable across installations.

### The Quality Gate Script

The `quality-gate.ps1` script implements all three properties — detection, enforcement, and termination — in under 50 lines. Here are the key sections.

**Termination guard** — the first thing the script checks:

```powershell
$data = $input | Out-String | ConvertFrom-Json

# Prevent infinite loops
if ($data.stop_hook_active -eq $true) { exit 0 }
```

If the agent is already continuing from a previous block, let it through. This is the termination mechanism — without it, the gate would block forever.

**Detection** — scanning the transcript for code-modifying tools:

```powershell
$codeModifyingTools = @('Write', 'Edit', 'NotebookEdit')

foreach ($line in [System.IO.File]::ReadLines($transcriptPath)) {
    $lineCount += 1
    if ($lineCount -le $lastCheckedLine) { continue }
    if ($codeToolUsed) { continue }
    if ($line -notmatch '"tool_use"') { continue }
    $parsed = $line | ConvertFrom-Json -ErrorAction SilentlyContinue
    if (-not $parsed.message.content) { continue }
    foreach ($block in $parsed.message.content) {
        if ($block.type -eq 'tool_use' -and $block.name -in $codeModifyingTools) {
            $codeToolUsed = $true
            break
        }
    }
}
```

Two performance patterns stand out here. First, the script pre-filters by string match (`"tool_use"`) before parsing JSON — avoiding expensive deserialization on lines that cannot contain tool calls. Second, after a code tool is detected, the `if ($codeToolUsed) { continue }` guard skips further JSON parsing while still counting lines. The loop always runs to completion so the state file reflects the full transcript length, preventing re-scanning in future invocations.

**Enforcement** — blocking with specific review criteria:

```powershell
if ($codeToolUsed) {
    $reason = "Code was written or modified this turn. Before responding
    to the user, launch a subagent to perform a quality review..."
    @{ decision = "block"; reason = $reason } | ConvertTo-Json -Compress
}
```

The block reason is not generic. It instructs the agent to launch a subagent that checks five specific areas: task completion, verification, test quality, code quality, and loose ends. This specificity is what makes the enforcement effective — the agent knows exactly what to review.

### A Practical Detail: Path Normalization

One implementation detail worth noting for Windows developers: when Claude Code runs in Git Bash on Windows, file paths arrive in MSYS format (`/c/Users/...` instead of `C:\Users\...`). The script normalizes these before use:

```text
if ($transcriptPath -match '^/([a-zA-Z])/(.*)$') {
    $transcriptPath = "$($Matches[1].ToUpper()):\$($Matches[2] -replace '/', '\')"
}
```

Small details like this determine whether a quality gate works reliably in real environments. The full implementation is available in the [bc-agentic-dev-tools-marketplace](https://github.com/FBakkensen/bc-agentic-dev-tools-marketplace) repository.

---

## ⚖️ Structured Prompting vs. Hopeful Compliance

It is worth being honest about what a Stop hook quality gate does and does not do. It is not the same as a CI pipeline or a type system. Those mechanisms *verify* — the compiler rejects type errors, the pipeline fails if tests do not pass. A Stop hook does not verify anything. It blocks the response and *prompts* the agent to verify.

| Mechanism | What It Does | Strength |
|:---|:---|:---|
| Prompt instructions | Ask the agent to validate | Easy to ignore or skip |
| **Stop hook quality gate** | **Block response and prompt specific review criteria** | **Structured, harder to skip, but still agent-dependent** |
| CI/CD pipeline | Run tests and fail on errors | Fully automated verification |

The Stop hook sits between a prompt instruction and a CI pipeline. It is more reliable than a prompt instruction because the agent cannot simply skip it — the response is blocked until the hook allows it. But it is less reliable than CI because the actual validation still depends on the agent following through on the review.

This is why prompts and hooks serve complementary roles:

- **Prompts guide behavior**: they tell the agent what good work looks like, what tools to use, and what standards to follow.
- **Hooks structure the process**: they create mandatory checkpoints where the agent is prompted to review specific criteria before continuing.

> **A quality gate does not replace good instructions — it creates a structured pause where they are more likely to be followed.**

The strongest setup combines both: clear instructions that guide the agent toward quality work, plus a quality gate that blocks the response and prompts a structured review when code is modified. Neither alone is sufficient — together, they make it significantly harder for the agent to skip validation.

---

## 🛡️ Designing Effective Quality Gates

If you are building your own quality gate, here are lessons from the implementation:

**Keep the timeout short.** The al-build hook uses a 10-second timeout. A quality gate that takes longer than that is doing too much work — it should detect and decide, not perform the validation itself. The heavy lifting (running tests, building the project) happens when the agent acts on the block reason.

**Make review criteria specific and actionable.** "Check your work" produces generic reviews. "Verify that tests pass, check for loose ends, and confirm task completion" produces targeted reviews. The more specific the enforcement criteria, the more useful the review.

**Handle `stop_hook_active` correctly.** This is the most common mistake in Stop hook implementations. If your gate does not check this flag, it will block the agent indefinitely after it completes the quality review. Always check `stop_hook_active` first.

**Define what constitutes "code modification" for your context.** The al-build gate checks for `Write`, `Edit`, and `NotebookEdit`. Your context might be different — you might want to include `Bash` commands that modify files, or exclude `NotebookEdit` if notebooks are not relevant.

**Test the gate itself.** A broken quality gate is worse than no gate — it either blocks every response (if the termination check fails) or blocks nothing (if the detection logic has a bug). Verify the gate's behavior in both code-change and non-code-change scenarios before relying on it.

---

## 🚀 Conclusion

These two feedback loops complement each other:

1. **Code-level feedback loops** give agents the *tools* to validate their work — compilation, static analysis, and testing.
2. **Stop hook quality gates** create a *checkpoint* that prompts the agent to use those tools before responding.

Neither is sufficient alone. Feedback loops without a quality gate depend on the agent choosing to validate. A quality gate without feedback loops has nothing meaningful to prompt. Together, they move AI-assisted development from "generate and hope" closer to **"generate, review, and validate."**

The pattern is simple: detect code changes, block the response, prompt a structured review, and terminate cleanly. Fifty lines of PowerShell. The implementation is small. The shift in workflow is not.

<span class="prompt">PS C:\DevProjects\DevBlog&gt;</span> Invoke-QualityGate -PromptReview

---

*How are you structuring quality checks in your AI-assisted workflows? I'd love to hear what works — connect on [LinkedIn](https://www.linkedin.com/in/flemming-bakkensen/) or [X](https://x.com/FBakkensen).*
