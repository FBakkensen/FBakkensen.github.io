---
layout: post
title: "Plugin Marketplaces for Coding Agents: A Practical Guide"
date: 2026-03-21
categories: [AI, DevTools, Development]
author: Flemming Bakkensen
description: "Learn to build plugin marketplaces for coding agents — create, version, and distribute plugins with a real Business Central marketplace example included."
tags: [plugin-marketplace, claude-code, github-copilot, mcp-servers, agentic-development, enterprise, open-standards]
---

<span class="prompt">PS C:\DevProjects\DevBlog&gt;</span> Get-Content .\Architecture\PluginMarketplaces.md

## 🎯 Introduction

Coding agents produce a growing number of reusable artifacts — skills, agents, MCP servers, and hooks. Agents have matured to the point where they [self-correct through feedback loops](/2025/10/14/feedback-loops-in-agentic-coding-tools-why-self-correction-beats-one-shot-perfection/) and handle real complexity. But sharing what we build with them still looks a lot like sharing libraries before package managers — or for those in the BC world, sharing PTE apps: zip files on SharePoint, .app files on Teams, multiple versions floating around with nobody sure which is current.

**Plugin marketplaces** address this, they are curated Git repositories that let you publish, version, and distribute coding agent extensions through a single, managed channel.

<!--more-->

## 🏪 What Is a Plugin Marketplace?

A **plugin marketplace** is just a Git repository with a registry file (`.claude-plugin/marketplace.json`) that tells coding agents: "Here are the available plugins and where to find them." No web app, no hosted service — just a repo. Each plugin then carries its own identity and version in its own `plugin.json`.

Here is the structure from my own [bc-agentic-dev-tools-marketplace](https://github.com/FBakkensen/bc-agentic-dev-tools-marketplace) for Business Central AL development:

```
bc-agentic-dev-tools-marketplace/
├── .claude-plugin/
│   └── marketplace.json          # The registry manifest
└── plugins/
    ├── al-build/
    │   ├── .claude-plugin/
    │   │   └── plugin.json       # Plugin manifest
    │   └── skills/
    │       └── al-build/
    │           └── SKILL.md      # Skill definition
    ├── al-code-review/
    ├── writing-al-tests/
    └── ... (9 plugins total)
```

The **marketplace manifest** lists every plugin and where to find it:

```json
{
  "name": "bc-agentic-dev-tools",
  "owner": {
    "name": "9Altitudes"
  },
  "metadata": {
    "description": "Business Central agentic development tools - skills for AI-assisted AL development"
  },
  "plugins": [
    {
      "name": "al-build",
      "source": "./plugins/al-build",
      "description": "Build and test AL apps for Business Central. Compiles locally, runs tests on remote Azure VM."
    },
    {
      "name": "al-code-review",
      "source": "./plugins/al-code-review",
      "description": "Multi-model AL/Business Central code review. Spawns parallel code-review subagents across models and review types."
    },
    {
      "name": "writing-al-tests",
      "source": "./plugins/writing-al-tests",
      "description": "Write, modify, and verify Business Central AL tests with DEBUG telemetry and Red-Green-Refactor."
    }
  ]
}
```

*(Showing 3 of the 9 plugins — the full manifest also includes `al-object-id-allocator`, `bc-standard-reference`, `refine-issue-for-automated-tests`, `release-notes`, `tdd-implement`, and `video-to-issue`.)*

Each **plugin** has its own `plugin.json` with identity and version:

```json
{
  "name": "al-build",
  "description": "Build and test AL apps for Business Central. Compiles locally, runs tests on remote Azure VM.",
  "version": "2.0.0"
}
```

A plugin can bundle any combination of coding agent primitives — skills, commands, agents, and hooks. The marketplace handles discovery and distribution; each plugin decides what it delivers.

---

## 🛠️ Building Your Own Marketplace

The structure from the previous section can be built in five steps — from empty repo to installed marketplace. The whole process takes minutes, and every step uses tools already familiar from day-to-day development.

### Step 1: Initialize the Repository

A marketplace starts as a Git repo with a single manifest file. Create the repo and add the minimal structure:

```
my-team-marketplace/
├── .claude-plugin/
│   └── marketplace.json
└── plugins/
```

The `marketplace.json` registers the marketplace itself — name, owner, and an empty plugin list to start:

```json
{
  "name": "my-team-marketplace",
  "owner": {
    "name": "Your Team Name"
  },
  "metadata": {
    "description": "Development tools for our team"
  },
  "plugins": []
}
```

The `plugins/` directory will hold each plugin as its own subdirectory. Nothing goes here yet — that comes in Step 2.

### Step 2: Create Your First Plugin

Each plugin lives in its own subdirectory under `plugins/` and carries two things: a `plugin.json` for identity and a `skills/` directory for its skill definitions.

```
plugins/
└── my-first-skill/
    ├── .claude-plugin/
    │   └── plugin.json
    └── skills/
        └── my-first-skill/
            └── SKILL.md
```

The `plugin.json` declares what this plugin is and which version it is on:

```json
{
  "name": "my-first-skill",
  "description": "What this plugin does in one sentence.",
  "version": "1.0.0"
}
```

The `SKILL.md` is where the actual skill lives — it contains the natural-language instructions that the coding agent follows when the skill is invoked. Skills can reference other files, call commands, or define multi-step workflows. A minimal skeleton looks like this:

```
# my-first-skill

[Description of what this skill does and when to invoke it]

## Steps
1. [First action the agent should take]
2. [Second action]
3. [Verification or output]
```

The `al-build` plugin from my BC marketplace follows this same structure — the difference is just the complexity of the instructions inside `SKILL.md`.

### Step 3: Register the Plugin in the Marketplace

Back in `marketplace.json`, add an entry to the `plugins` array so the marketplace knows about the new plugin:

```json
"plugins": [
  {
    "name": "my-first-skill",
    "source": "./plugins/my-first-skill",
    "description": "What this plugin does in one sentence."
  }
]
```

The `source` field is a path relative to the repo root. For plugins hosted in separate repositories, it can also be a full Git URL. Add more entries as the marketplace grows — the BC marketplace in the previous section has nine.

![A digital marketplace interface displaying coding agent plugins organized in a grid layout](/assets/images/2026-03-21-plugin-marketplaces-for-coding-agents/hero.jpg)

### Step 4: Choose an Installation Scope

Marketplaces can be installed at two levels, and the choice determines who gets access:

| Scope | Where it lives | Use case |
|-------|---------------|----------|
| **Per-user** | User profile config | Personal tools, available across all projects |
| **Per-project** | `.claude/settings.json` in the repo | Team-shared, auto-propagates to contributors |

Per-user installation means adding the marketplace once and having it available everywhere. Per-project installation commits the marketplace reference into the repository settings — every contributor gets it automatically when they clone or pull.

Once pushed to a remote, any team member can add the marketplace. In Claude Code, the command is:

```bash
/plugin marketplace add YourOrg/my-team-marketplace
```

After install, the marketplace's plugins appear as available skills and commands in the coding agent — ready to invoke just like any built-in feature. The specific commands differ between coding agents, but the concept is the same across tools.

### Step 5: Test Locally Before Sharing

A marketplace can be tested from a local directory before pushing to a remote. This lets the full round-trip be validated on a single machine:

```bash
/plugin marketplace add /path/to/my-team-marketplace
```

Before sharing with the team, verify three things:

- The marketplace appears in the agent's known marketplaces
- Plugins from the marketplace are listed as available skills
- Invoking a skill from an installed plugin produces the expected behavior

Once validated locally, push to a shared Git remote and the versioning and update mechanisms from the next section take over.

---

## 📦 Versioning and Automatic Updates

> Versioning is not overhead — it is trust. When a team knows that `v2.1.0` of a skill has been tested and approved, they can adopt it with confidence.

These are the two features that make marketplaces more than just shared folders.

### Versioning

Each plugin declares its version in `plugin.json` using **semantic versioning** (`MAJOR.MINOR.PATCH`). This is the mechanism that lets teams know exactly what they are running.

This matters. Without versioning, you are back to the problem from the introduction — five developers running five different copies, nobody sure which is current. With versioning, everyone knows exactly what they have and whether it matches what the team has approved.

### Automatic Updates

When configured, the coding agent checks for newer plugin versions at startup and updates transparently. You control the policy per marketplace:

- **Community marketplace** — auto-update enabled, you want the latest improvements
- **Enterprise compliance toolkit** — pinned to a specific version, changes require approval
- **Internal team utilities** — auto-update on the `stable` channel

The update cycle is simple: contributor improves a plugin → PR reviewed and merged → version bumped → next time any developer opens their agent, they get the update. No Teams messages, no manual downloads.

---

## ⚠️ The Elephant in the Room: Fragmentation

There is no universal standard for coding agent plugins. Claude Code, GitHub Copilot, Cursor, OpenAI Codex, and OpenCode all ship their own plugin formats — different directory conventions, different manifest schemas, different discovery mechanisms. A plugin built for one tool does not automatically work in another. The ecosystem today looks a lot like the early days of browser extensions or package managers: everyone agrees the concept is useful, but nobody has agreed on the format.

I chose the Claude Code format for my BC marketplace because it is the tool I use daily. But I genuinely hope the ecosystem converges on a vendor-neutral open standard — the value of shared plugins grows exponentially when they are portable across tools.

---

## 🚀 Conclusion

**Plugin marketplaces give coding agents what PTE app distribution still lacks** — a managed distribution layer that turns individual productivity into collective capability.

**Key takeaways:**

- **Start with one skill** — package something you already use, like a [TDD-driven legacy refactoring workflow](/2026/01/10/ai-legacy-project-refactoring/), create a marketplace repo, and add it to your team's project settings
- **Version everything** — semantic versioning and pinned refs turn fragile shared folders into trusted infrastructure
- **Embed standards in tooling** — best practices that auto-distribute beat best practices that live on a wiki

For the BC community specifically, I see this as an opportunity to build shared best practices that evolve over time — the same way we rallied around coding guidelines, we can rally around shared skills and agents.

<span class="prompt">PS C:\DevProjects\DevBlog&gt;</span> Install-Plugin -Source "community/shared-marketplace" -Channel stable

*What skills or tools would you package first for your team? Let's discuss on [LinkedIn](https://www.linkedin.com/in/flemming-bakkensen/) or [X](https://x.com/FBakkensen)!*
