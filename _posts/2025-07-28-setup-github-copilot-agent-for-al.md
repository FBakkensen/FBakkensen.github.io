---
layout: post
title: "Setup Github Copilot Agent For AL"
date: 2025-07-28
categories: [Copilot, AL, Automation, GitHub Actions]
author: Flemming Bakkensen
description: "Learn how to set up a custom development environment for the GitHub Copilot agent to compile and analyze Business Central AL projects."
tags: [copilot, al, automation, github actions]
---

## Introduction

Imagine a world where you can hand off a GitHub issue to an AI agent, and it autonomously develops the code, fixes the bug, and creates a pull request for you to review. This is the power of the GitHub Copilot agent, which can be activated directly from a GitHub issue to create a development environment tailored to solving that specific task.

However, for this to work seamlessly, especially in a specialized environment like Business Central AL development, the Copilot agent needs the right tools and setup. The agent operates in a standard Linux environment, which doesn't natively support AL compilation or dependency management.

This is precisely the problem this guide solves. We will walk through how to create a custom development environment for the GitHub Copilot agent, enabling it to compile and analyze your AL projects. This setup is the crucial bridge that allows the Copilot agent to understand your codebase, solve your issues, and supercharge your development workflow. This is why we need to make the Copilot able to compile and run analyzers for AL projects.

## Why Customize the Copilot Agent Environment?

The GitHub Copilot agent operates within a standardized, generic Linux environment. While this is suitable for many common programming languages, AL development for Business Central has a unique set of requirements that are not met out-of-the-box. Customizing the environment is not just a convenience—it's a necessity to empower the agent to work with your AL project. Here’s why:

- **Specialized Compiler:** The AL language compiler (`alc.exe`) is not a standard component of any operating system. It is distributed as part of the "AL Language" Visual Studio Code extension. To compile your project, the agent's environment must first download this extension and extract the compiler.

- **Complex Dependency Model (Symbols):** AL projects rely on symbol files (`.app`) for dependencies, including the Microsoft base and system applications, as well as any third-party extensions. These symbols must be downloaded from a specific NuGet feed (`AppSourceSymbols`). The agent needs a setup that can parse your project's `app.json` file and fetch all the correct symbol versions.

- **Cross-Platform Build Tooling:** To ensure that build commands are consistent between a developer's machine (often Windows) and the agent's Linux environment, we use a `Makefile`. However, the tools invoked by the `Makefile`—such as the .NET SDK, Mono (to run .NET Framework applications on Linux), and the NuGet CLI—must be pre-installed in the agent's environment.

- **Enabling True Automation:** The ultimate goal is to have the Copilot agent autonomously understand, modify, and validate code. Without a customized environment, the agent would fail at the very first step: compiling the project. By pre-installing all necessary tools and dependencies, we create a "pre-warmed" environment where the agent can immediately get to work on solving the actual GitHub issue.

## Official Documentation

See the official guide:
[Customizing the development environment for Copilot coding agent](https://docs.github.com/en/enterprise-cloud@latest/copilot/how-tos/use-copilot-agents/coding-agent/customize-the-agent-environment)

## The Heart of the Automation: `copilot-setup-steps.yml`

The magic happens in the `.github/workflows/copilot-setup-steps.yml` file. This GitHub Actions workflow prepares the entire environment for the Copilot agent before it starts its work. A key takeaway is that the Copilot agent runs on a Linux environment (`ubuntu-latest`). This is the primary motivation for creating a cross-platform build system using a `Makefile`, as discussed in our post on [Cross-Platform AL Build Automation]({{ site.baseurl }}{% post_url 2025-07-24-cross-platform-al-build-automation-unified-makefile-and-modular-scripts %}). The `Makefile` ensures that commands like `make build` work identically for a developer on Windows and for the Copilot agent on Linux.

Let's break down the workflow:

```yaml
name: Copilot Setup Steps
on:
  workflow_dispatch:

jobs:
  copilot-setup-steps:
    runs-on: ubuntu-latest
    timeout-minutes: 30
    permissions:
      contents: read

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup .NET
        uses: actions/setup-dotnet@v4
        with:
          dotnet-version: '8.0.x'

      - name: Install system dependencies
        run: |
          sudo apt-get update
          sudo apt-get install -y jq wget curl unzip mono-complete file
          # Official NuGet CLI install for Linux
          # Download nuget.exe
          sudo wget -O /usr/local/bin/nuget.exe https://dist.nuget.org/win-x86-commandline/latest/nuget.exe
          # Test that mono can run nuget.exe
          mono /usr/local/bin/nuget.exe help

      - name: Install AL Compiler
        run: |
          chmod +x .github/scripts/setup-al-compiler.sh
          .github/scripts/setup-al-compiler.sh

      - name: Restore BC Symbols
        run: |
          chmod +x .github/scripts/restore-symbols.sh
          .github/scripts/restore-symbols.sh .

      - name: Display environment summary
        run: |
          echo "=== Copilot AL Development Environment ==="
          echo "✓ .NET SDK: $(dotnet --version)"
          echo "✓ AL Compiler: Available at $(which alc || echo 'Not found')"
          echo "✓ Symbols: $(ls -1 .alpackages/*.app 2>/dev/null | wc -l) .app files"
          echo "✓ Project: $(jq -r '.name' app.json) v$(jq -r '.version' app.json)"
          echo "========================================="
```

### Workflow Steps Explained

Here is a summary of the steps in the workflow:

| Step | Action | Purpose |
|---|---|---|
| `Checkout repository` | `actions/checkout@v4` | Fetches the source code of the repository. |
| `Setup .NET` | `actions/setup-dotnet@v4` | Installs the specified .NET SDK version, a prerequisite for the AL compiler. |
| `Install system dependencies` | `run` | Installs necessary Linux tools like `jq`, `wget`, `curl`, `unzip`, and `mono-complete`. It also installs the NuGet CLI. |
| `Install AL Compiler` | `run` | Executes a shell script to download and set up the AL compiler. |
| `Restore BC Symbols` | `run` | Executes a shell script to download all necessary system and project dependency symbols. |
| `Display environment summary` | `run` | Prints a summary of the configured environment for verification and debugging. |

<br>

1.  **Checkout & Dependencies**: The workflow starts by checking out your repository's code. It then installs essential tools for the setup process:
    *   **.NET SDK**: A prerequisite for the AL compiler.
    *   **System Utilities**: `jq` (for parsing JSON), `curl` and `wget` (for downloading files), `unzip` (for extracting archives), and `mono-complete` (a Linux implementation of .NET Framework needed by the AL compiler).
    *   **NuGet CLI**: The official command-line tool for restoring package dependencies, which is essential for downloading AL symbols.

2.  **Install AL Compiler**: This step executes the `.github/scripts/setup-al-compiler.sh` script. This script downloads the latest AL Language extension (`.vsix`) from the Visual Studio Marketplace, extracts it, and places the compiler (`alc`) in a location where the agent can find and use it. This gives us a working AL compiler on a barebones Linux runner.

3.  **Restore BC Symbols**: This is arguably the most critical step, handled by the `.github/scripts/restore-symbols.sh` script. This script is responsible for populating the `.alpackages` folder with all the necessary symbol files (`.app` files) that your project needs to compile. It does this in two main phases:
    *   **System Symbols**: First, it automatically downloads the core Microsoft symbols. Instead of fetching individual symbol packages, the script leverages NuGet's dependency resolution by installing the `Microsoft.Application.symbols` package. This acts as a meta-package that has dependencies on all the fundamental symbols required for compilation, such as `Microsoft.SystemApplication.symbols`, `Microsoft.BusinessFoundation.symbols`, `Microsoft.BaseApplication.symbols`, and `Microsoft.Platform.symbols`. By installing this single package, NuGet automatically pulls in the correct versions of all required dependencies, ensuring the environment has a complete and consistent set of system symbols. This is a more robust and streamlined approach than managing individual symbol packages.
    *   **Project Dependencies**: Next, it reads the `dependencies` array in your `app.json`. For each dependency listed, it constructs the correct NuGet package name and uses `nuget.exe` to download the corresponding symbol package from the `AppSourceSymbols` feed.

    Here is a breakdown of the symbol restoration process:
    | Symbol Type | Source | Mechanism |
    |---|---|---|
    | **System Symbols** | NuGet (`Microsoft.Application.symbols`) | The script installs a single meta-package. NuGet's dependency resolution automatically pulls in all required base symbols (`SystemApplication`, `BaseApplication`, etc.). |
    | **Project Dependencies** | `app.json` & AppSource NuGet feed | The script parses the `dependencies` array in `app.json`, constructs the correct NuGet package names, and downloads them from the `AppSourceSymbols` feed. |

4.  **Environment Summary**: The final step prints a summary of the prepared environment. This is incredibly useful for debugging, as it confirms that the .NET SDK is installed, the AL compiler is available, and the correct number of symbol files have been downloaded.

## The Result: A Pre-Warmed Environment

By the time this setup workflow completes, the GitHub Copilot agent is presented with a perfect, ready-to-go AL development environment. The compiler is in place, all symbol dependencies are downloaded, and it can immediately start running `make` commands to build or analyze your project, just as you would on your local machine.

## Example: ALMakeDemo Repo

The [ALMakeDemo](https://github.com/FBakkensen/ALMakeDemo) project demonstrates a robust, cross-platform build system for AL extensions using Makefile and platform-specific scripts.

### Key Features

- Unified Makefile for all developer workflows
- Platform-specific scripts for Windows (PowerShell) and Linux (Bash)
- Modular libraries for JSON parsing and validation
- Strict build quality: zero warnings/errors

## Next Steps

- Fork the [ALMakeDemo](https://github.com/FBakkensen/ALMakeDemo) repository to get the scripts and workflow file.
- Adapt the `app.json` and `Makefile` to your own AL project's needs.
- Experiment with Copilot agent workflows and see how a customized environment can supercharge your development automation.

Stay tuned for our next post, where we'll dive into the specifics of assigning a GitHub issue to our newly configured Copilot Agent and giving it the right instructions to get the job done!
