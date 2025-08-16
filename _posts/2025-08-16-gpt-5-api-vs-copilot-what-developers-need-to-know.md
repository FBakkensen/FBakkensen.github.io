---
layout: post
title: "Claude Sonnet 4 in GitHub Copilot vs. Claude Code — What Developers Need to Know"
date: 2025-08-16
categories: [AI, DevTools, Copilot]
author: Flemming Bakkensen
description: "Same model, different product wrappers: why Claude Sonnet 4 feels different in GitHub Copilot than in Claude Code — context limits, extended thinking, tools, and reproducibility. GPT‑5 API vs Copilot appears as a supporting pattern."
tags: [claude sonnet 4, copilot, claude code, api, models, reasoning, context]
---

If you pick the same model in two different tools, you won’t get the same experience. Claude Sonnet 4 is the one example: in Claude Code (Anthropic’s native experience) you get large context and explicit control over extended thinking; in GitHub Copilot you get a managed, IDE‑first product with smaller context, fewer knobs, and curated tools. Both are useful — but they’re not interchangeable.

<!--more-->

## TL;DR: Claude Sonnet 4 — same model, different products

| Area | Claude Code (Anthropic) | GitHub Copilot (VS Code) |
| --- | --- | --- |
| Context window | Up to 200k and, with beta header, up to 1M tokens | Capped to 128k |
| Extended thinking | Exposed: Anthropic/Claude Code (and the Anthropic API) support "extended thinking" features — interleaved/summarized thinking modes and an explicit reasoning budget (e.g. `budget_tokens`) that let you allocate internal reasoning tokens. | Not exposed: GitHub Copilot does not surface Anthropic's extended‑thinking controls. Any "thinking" behavior in Copilot is handled by product heuristics (or a limited Ask‑mode helper) and is not equivalent to Anthropic's extended‑thinking API. |
| Tools & system prompts | Yes — Anthropic/Claude Code and the Anthropic API expose rich tool integrations (bash, Python, search, agentic tooling). The system prompt and some tool routing are managed by the product but Anthropic surfaces tool control to users. | Yes — GitHub Copilot has curated VS Code tool integrations (editor edits, run/test, terminal, web searches, etc.) and a hidden system prompt; Copilot's toolset and routing are product-managed. |
| Opus 4.1 availability | Available for agentic workflows in Claude Code | Available in Copilot Chat; not available in Agent Mode |

## Quick parallel: GPT‑5 API vs GitHub Copilot

This isn’t unique to Claude. OpenAI’s GPT‑5 shows the same split between a raw, controllable API and a managed, IDE‑first product wrapper.

| Area | GPT‑5 via API | GPT‑5 in GitHub Copilot |
| --- | --- | --- |
| What you’re calling | Direct access to the reasoning model family | Managed router that balances fast vs deep per request |
| Reasoning control | Exposes `reasoning_effort` and other knobs | Not exposed; inferred by the product |
| Context window | Up to ~400k combined tokens (e.g., large input + reasoning/output) | Ccapped to 128k tokens |
| Determinism | High with explicit parameters and seeds | Lower; defaults and routing are opaque |


Also relevant: OpenAI provides a developer experience comparable to Claude Code for GPT‑5 named codex. In addition, the ChatGPT Pro plan (around €229/month) offers broad access to GPT‑5 with high‑reasoning capabilities and large context in codex, complementing the API’s fine‑grained controls.

Reality check today: Claude Code is the more mature, feature‑rich agentic coding product — with deeper tool integrations and workflow features — while OpenAI’s Codex‑style environment is comparatively lighter.

## Why this matters

Selecting a model by name isn’t enough. You’re choosing a product wrapper with routing, limits, defaults, and safety rails. With Claude Sonnet 4, this gap is especially visible: Copilot optimizes for fast, guided coding in an IDE; Claude Code exposes the model’s full depth for large‑context, high‑reasoning tasks.

## Claude Sonnet 4: same engine, different vehicles

- Claude Code: direct access to Anthropic’s capabilities — large context (200k → 1M beta), native extended‑thinking with adjustable budgets, first‑class tool use, and full control over the system prompt via your instructions. Great for deep, repo‑wide reasoning and agentic workflows.
- GitHub Copilot: managed IDE experience — curated tools, hidden prompt, optional “Thinking tool”, and a platform‑level ~128k context cap. Optimized for responsiveness and safety inside VS Code.

Note: Opus 4.1, Anthropic’s top‑tier coding model, is available in GitHub Copilot Chat but not in Agent Mode. In Claude Code, Opus‑class capabilities are available for agentic workflows depending on plan.

## Context windows: theoretical vs usable (Claude)

- Claude Code / Anthropic API: 200k context, and up to 1M with a beta header — suitable for entire repos and long conversations.
- Copilot: ~128k cap across models — pragmatic for latency/cost; long threads get summarized or truncated.

Implication: if you truly need >128k context at once, prefer Claude Code (or route via API). Copilot will compress.½

## “I chose Sonnet 4 — why does it feel different?”

Because in Copilot you’re choosing a product profile, not just a raw model. Two concrete effects:

1) Copilot uses curated tools and hidden prompts, and it summarizes long threads to stay within ~128k — so behavior varies with conversation length.

2) Extended thinking isn’t a first‑class, adjustable dial in Copilot; in Claude Code you can set `budget_tokens` for deeper step‑by‑step reasoning.

## Cost and access

- Copilot: subscription‑based; Sonnet 4 available; Opus 4.1 typically gated to higher tiers; platform limits keep UX responsive and costs predictable.
- Claude Code: predictable spend via Claude Max (≈$200/month). For programmatic control, the Anthropic API is pay‑per‑token.
- GPT‑5: predictable spend via ChatGPT Pro (≈€229/month) with high‑reasoning and large context in ChatGPT; the OpenAI API remains pay‑per‑token for programmatic control.

BYOK note: GitHub Copilot supports “bring your own key” for Anthropic models (Sonnet 4 and Opus 4.1), but usage is billed to your Anthropic account and can be significantly more expensive than Copilot’s bundled usage. Importantly, this is not covered by consumer “Claude Max” subscriptions; BYOK requires access to the Anthropic API on a separate paid plan.

Real‑world example: I carry a Claude Max subscription (~$200/month). Using the open‑source Claude Code Usage Monitor (https://github.com/Maciek-roboblog/Claude-Code-Usage-Monitor) to estimate “pay‑per‑API” as a daily driver for Sonnet 4/Opus 4.1, my projected costs landed between ~$500 and ~$700 per month. If you expect heavy, day‑to‑day usage, plan your budget accordingly and reserve BYOK for tasks that truly need large context or explicit thinking budgets.

## Conclusion

This article isn’t a full, exhaustive comparison of GitHub Copilot, Claude Code, and OpenAI’s Codex‑style environment. It focuses on how the same model can feel different depending on the product wrapper around it.

In day‑to‑day development, Claude Code generally gives you closer access to the full power of Anthropic’s models, letting you run larger, more complex, and more controlled tasks — often with higher output quality when you need big context and explicit reasoning.

GitHub Copilot, by contrast, shines for quick onboarding, IDE‑first experience. It’s cheaper and fast to adopt for a team, but it intentionally trades some control and maximum context for ease of use.

There are many AI coding tools available, each exposing different configuration options for underlying models and varied pricing models. The most notable ones I’m aware of include Cursor, Windsurf, OpenCode, Gemini‑CLI, Cline, Roo Code — and the list keeps growing. These options matter: some prioritize lightweight IDE integrations and affordability, while others expose deep API controls, larger context windows, or advanced agent features for heavy programmatic use. When choosing a solution, consider your required context window, reasoning controls, tool integrations, and long‑term cost trajectory.

## Further reading

- Anthropic — Models overview (context windows, model table): https://docs.anthropic.com/en/docs/about-claude/models
- Anthropic — Context windows, incl. 1M token beta header for Sonnet 4: https://docs.anthropic.com/en/docs/build-with-claude/context-windows
- Anthropic — Extended thinking (budget_tokens, summarized thinking, interleaved thinking): https://docs.anthropic.com/en/docs/build-with-claude/extended-thinking
- Anthropic — Tool use with Claude (client/server tools, system prompt for tools): https://docs.anthropic.com/en/docs/agents-and-tools/tool-use/overview
- VS Code — Copilot agent mode (autonomous edits, tools, terminal commands): https://code.visualstudio.com/docs/copilot/chat/chat-agent-mode
- VS Code — AI language models (model picker, bring your own API key): https://code.visualstudio.com/docs/copilot/language-models
- VS Code — Use MCP servers (extend Copilot with tools/resources): https://code.visualstudio.com/docs/copilot/chat/mcp-servers
- GitHub Docs — AI model comparison (availability by task, includes Anthropic models): https://docs.github.com/en/copilot/reference/ai-models/model-comparison
- GitHub Docs — Hosting of models for Copilot Chat (where OpenAI/Anthropic models run): https://docs.github.com/en/copilot/reference/ai-models/model-hosting
- OpenAI — Reasoning guide (reasoning controls and usage): https://platform.openai.com/docs/guides/reasoning
