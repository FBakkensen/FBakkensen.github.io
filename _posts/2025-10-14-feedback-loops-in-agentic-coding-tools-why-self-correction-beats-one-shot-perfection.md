---
layout: post
title: "Feedback Loops in Agentic Coding Tools: Why Self-Correction Beats One-Shot Perfection"
date: 2025-10-14
categories: [AI, Copilot, Business Central, AL]
author: Flemming Bakkensen
description: "Discover why the ability to detect and correct errors through feedback loops - compilation, static analysis, and testing - is more valuable than perfect first-try code generation in AI coding tools."
tags: [ai, copilot, claude code, cursor, feedback loops, al, business central, testing, automation]
---

When people first encounter AI coding tools like GitHub Copilot, Claude Code, or Cursor, they often focus on the wrong metric: "Can it write perfect code in one shot?"

From my experience working with these tools in Business Central development, I've found that the real game-changer isn't one-shot perfection - it's the ability to detect errors and iteratively correct them through feedback loops. An AI that can validate its own work, recognize failures, and make corrections is far more valuable than one that occasionally delivers perfect code but has no way to verify or improve it.

<!--more-->

## What is an Agentic Feedback Loop?

An **agentic feedback loop** is a validation mechanism where an AI agent autonomously verifies the code it has generated. Instead of simply returning code and hoping it works, the agent actively checks whether its output meets specific quality criteria before presenting it to you.

Think of it like the difference between a student who submits homework without checking their work versus one who reviews their answers, identifies mistakes, and corrects them before submission. The second approach consistently delivers better results, even if the first student is occasionally brilliant.

In the context of agentic coding tools, feedback loops enable the AI to move beyond simple code generation into a more reliable, iterative development process that mirrors how experienced developers actually work.

## The Three Pillars of Code Validation

There are three fundamental ways to validate code, and these apply across virtually all programming languages - including AL for Business Central:

### 1. Compilation
**Can the code build?**

Compilation is the first and most basic validation step. If code doesn't compile, it's fundamentally broken. For AL development, this means running `alc.exe` (the AL compiler) to check for syntax errors, type mismatches, and other fundamental issues.

**Example validation questions:**
- Does the code have correct syntax?
- Are all types properly defined?
- Do all object references resolve?

### 2. Static Analysis
**Does the code meet quality standards?**

Static analyzers examine code without executing it, checking for code quality issues, potential bugs, style violations, and best practices. In Business Central, this includes the various "Cops" like CodeCop, UICop, and AppSourceCop.

**Example validation questions:**
- Does the code follow naming conventions?
- Are there potential runtime errors the compiler might miss?
- Does the code meet AppSource requirements?

### 3. Automated Testing
**Does the code work as expected?**

Tests verify that code behaves correctly in real scenarios. This is the highest level of validation, ensuring not just that code compiles and looks good, but that it actually solves the problem it's meant to solve.

**Example validation questions:**
- Do all unit tests pass?
- Does the integration work as expected?
- Are edge cases handled properly?

## The Four-Step Autonomous Workflow

Here's how an effective agentic feedback loop works in practice:

| Step | Action | Validation |
|------|--------|------------|
| 1. **Prompt** | User requests a code change | AI understands requirements |
| 2. **Implement** | AI generates the code | Code structure created |
| 3. **Compile & Analyze** | AI runs compiler and static analyzers | Syntax and quality validated |
| 4. **Test** | AI runs automated tests | Behavior verified |

The critical insight: **the AI only returns to the user when all validation steps succeed**. If compilation fails, the AI sees the error messages and makes corrections. If tests fail, it analyzes the failure and adjusts the code. This cycle continues until the code meets all quality criteria.

This approach transforms the AI from a code generator into a reliable development partner.

## Why Self-Correction Trumps One-Shot Perfection

Let me be clear about what matters most: **It's not whether an AI can deliver 100% correct code on the first try.** What matters is whether it can:

1. **Detect its own errors** through concrete validation mechanisms
2. **Understand the feedback** from compilers, analyzers, and tests
3. **Iteratively improve** the code based on that feedback
4. **Persist until success** rather than giving up after the first attempt

This is exactly how experienced developers work. We don't write perfect code on the first try - we write code, test it, see what breaks, and fix it. The feedback loop is the fundamental mechanism of software development.

An AI with robust feedback loops will consistently outperform a "smarter" AI that lacks validation mechanisms. It's the difference between brilliance with blindness and competence with clear vision.

## Practical Implementation: AL Build Tools for Business Central

Implementing feedback loops for AL development requires specific tooling and setup. This is why I created the [al-build-tools](https://github.com/FBakkensen/al-build-tools) project - a bootstrap system that enables feedback loops in any AL project.

### What al-build-tools Provides

The project includes scripts and comprehensive instructions to:

- **Create Business Central Docker containers** for isolated development environments
- **Download AL compilers and symbols** automatically based on your `app.json` configuration
- **Run compilation with static analyzers** using `alc.exe` with all configured Cops
- **Execute automated tests** within the Docker container environment
- **Support cross-platform builds** on both Windows and Linux

### Enabling the Feedback Loop

With this tooling in place, AI coding agents like GitHub Copilot, Claude Code, or Cursor can:

```powershell
# 1. Implement a code change
# (AI generates AL code)

# 2. Compile with analyzers
Invoke-Build build

# 3. Run tests
Invoke-Build test

# 4. Review results and iterate if needed
```

The agent can see compilation errors, analyzer warnings, and test failures as clear, actionable feedback. This closes the loop and enables the autonomous validation cycle.

### Cross-Platform Support

A key feature of al-build-tools is cross-platform compatibility. Whether you're developing on Windows or need to run builds in a Linux CI/CD environment (like GitHub Actions or when using GitHub Copilot Agent), the same commands work consistently.

This is crucial because many AI coding agents, particularly GitHub Copilot Agent, run in Linux environments. Without cross-platform build tooling, these agents can't validate their own work.

## Microsoft's First Steps: MCP Tools in the AL Extension

Microsoft has recently added experimental Model Context Protocol (MCP) tools to the AL Language extension in Visual Studio Code. This preview represents their first steps toward enabling feedback loops for GitHub Copilot in AL development.

### Current Capabilities

The preview MCP tools currently allow GitHub Copilot to:

- **Compile AL projects** directly from within VS Code
- **Publish AL projects** to connected Business Central environments

This is significant because it gives GitHub Copilot the ability to validate code syntax and basic compilation without requiring external scripts or manual intervention.

### Current Limitations

However, there are some important limitations in this first preview version:

| Limitation | Impact |
|------------|--------|
| **No error messages** | When compilation fails, Copilot only knows *that* it failed, not *why* it failed |
| **No test execution** | Copilot cannot run automated tests to verify behavior |
| **Platform-specific** | Only works with GitHub Copilot in VS Code, not other AI tools or environments |

### The Path Forward

It's important to recognize that this is explicitly labeled as a **first preview** release. Microsoft is clearly exploring this space, and I'm confident we'll see improvements in future versions:

- More detailed error reporting for failed compilations
- Support for running tests within the development environment
- Better integration with analyzer feedback
- Potential expansion beyond VS Code and GitHub Copilot

The fact that Microsoft is investing in this direction validates the importance of feedback loops for AI coding tools in the AL ecosystem.

## Real-World Benefits: A Consultant's Perspective

From my consulting work with Business Central clients, I've seen how feedback loops change the dynamic of AI-assisted development:

**Without feedback loops:**
- AI generates code
- Developer manually reviews and tests
- Issues are discovered later in the process
- Iteration cycles are slow and manual

**With feedback loops:**
- AI generates code *and* validates it
- Many issues are caught and fixed automatically
- Code quality is consistently higher
- Developer focuses on architecture and business logic

This doesn't mean AI replaces developers - it means developers can focus on higher-value work while the AI handles the routine validation and correction cycles that are essential but time-consuming.

## Implementing Feedback Loops in Your Projects

Here's how to start incorporating feedback loops into your AL development workflow:

### 1. Set Up Build Automation

Ensure your projects can be compiled from the command line or scripts, not just through VS Code's GUI. This makes them accessible to AI agents.

**Resources:**
- [Cross-Platform AL Build Automation]({{ site.baseurl }}{% post_url 2025-07-24-cross-platform-al-build-automation-unified-makefile-and-modular-scripts %})
- [al-build-tools on GitHub](https://github.com/FBakkensen/al-build-tools)

### 2. Configure Static Analyzers

Ensure your `.vscode/settings.json` includes the analyzers appropriate for your project:

```json
{
  "al.codeAnalyzers": [
    "${CodeCop}",
    "${UICop}",
    "${AppSourceCop}"
  ]
}
```

### 3. Create Automated Tests

Write AL test codeunits that verify your business logic. The more comprehensive your test suite, the more valuable the feedback loop becomes.

### 4. Provide Clear Instructions to AI Tools

When working with AI coding tools, explicitly tell them to validate their work:

> "Implement this feature and then run `Invoke-Build build` and `Invoke-Build test` to validate the code. Only present the solution to me once all tests pass with no warnings or errors."

### 5. Enable Agent Mode When Available

Tools like GitHub Copilot Agent and Claude Code have modes that allow them to autonomously execute commands and iterate based on results. Enable these modes to take full advantage of feedback loops.

## The Philosophy: Iteration Over Perfection

The shift from valuing one-shot perfection to valuing self-correction represents a deeper philosophical change in how we think about AI coding tools.

In traditional software development, we've always understood that iteration is essential. Code reviews, testing, debugging, and refactoring are all acknowledgments that we rarely get things perfect the first time - and that's okay. The process of iterative improvement is what produces reliable software.

AI coding tools are no different. An AI that can iterate based on concrete feedback will consistently produce better results than one that simply tries harder to be perfect the first time. The feedback loop is what transforms a code generator into a development partner.

## Conclusion: Close the Loop

Feedback loops are the key to unlocking the full potential of agentic coding tools. When an AI agent can compile, analyze, test, and iteratively improve code before presenting it to you, the entire development experience transforms from "generate and hope" to "generate, validate, and correct."

For Business Central developers working with AL, this means:

- Setting up build automation that works from the command line
- Configuring static analyzers to catch quality issues early
- Writing comprehensive automated tests
- Using tools like al-build-tools to enable full feedback loops

The future of AI-assisted development isn't about AI that gets it right every time - it's about AI that can recognize when it's wrong and fix it. That's the power of feedback loops.

**Ready to implement feedback loops in your AL projects?**
Check out [al-build-tools on GitHub](https://github.com/FBakkensen/al-build-tools) to get started with build automation, testing infrastructure, and everything you need to enable agentic feedback loops in Business Central development.

---

*What's your experience with AI coding tools? Have you implemented feedback loops in your projects? I'd love to hear your thoughts - reach out via the links in the footer.*
