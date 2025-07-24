---
layout: post
title: "Cross-Platform AL Build Automation: Unified Makefile and Modular Scripts for Business Central Extensions"
date: 2025-07-24
categories: [Business Central, AL, Build Automation, Scripting]
author: Flemming Bakkensen
description: Learn how to automate AL builds for Business Central using a unified Makefile and modular scripts for Windows and Linux. This post explores the ALMakeDemo repo and its educational value for developers.
tags: [business central, al, makefile, powershell, bash, build automation]
---

# Problem

When working with agentic code tools like GitHub Copilot, one crucial way to guide the tool is ensuring that the application actually compiles without errors from code analyzers. This validates the syntax and provides immediate feedback on code quality. This blog post focuses on implementing a make file and build scripts for this purpose. While functional testing through automated tests is important, it falls outside the scope of this post.

# Solution

By enabling GitHub Copilot to compile code and run analyzers through terminal commands, we provide it the capability to return validated code to users - code that actually compiles and generates no warnings from code analyzers.

GitHub Copilot doesn't have access to VS Code's built-in functions and requires terminal access to compile applications using `alc.exe`. A prominent challenge with using `alc.exe` is that it's typically not in the system PATH, since the AL compiler is installed as part of the VS Code extension and updates with the extension. Our scripts automatically detect the most recent version of the AL compiler installed.

## Guiding GitHub Copilot with Instructions

A crucial component of this build system is the `.github/copilot-instructions.md` file in the ALMakeDemo repository. This file provides explicit guidance to GitHub Copilot on how to work with the project and establishes critical build quality requirements.

The most important instruction is the **strict build quality requirement**:

```markdown
VERY IMPORTANT: Build Quality Requirement
The build must run without any warnings and errors.
This is a strict requirement for all code changes and build processes.
Any warning or error in the build output is considered a failure and must be resolved before proceeding.
```

The instructions file also provides GitHub Copilot with:
- Build workflow guidance using `make build`, `make clean`, etc.
- Quick reference for essential commands
- Information about external dependencies (VS Code AL extension)

This approach ensures that when GitHub Copilot generates or modifies AL code, it knows to:
1. Use `make build` to compile and validate the code
2. Only return code to the user when the build completes without warnings or errors

By establishing these guidelines upfront, GitHub Copilot becomes more effective at generating production-ready code that adheres to quality standards.

## Understanding Make

Make is a build automation tool created in the 1970s for Unix systems. For Business Central developers accustomed to VS Code's graphical interface, make provides a command-line approach to build automation.

Instead of manually executing the alc commands with multiple parameters to compile your AL extension, you can execute a single command like `make build` in the terminal, which runs all necessary steps automatically.

Make reads a file called `Makefile` that contains:
- **Targets**: What you want to build (like "build", "clean", or "show-config")
- **Dependencies**: What needs to exist before building
- **Commands**: The actual steps to execute

This approach is particularly valuable when working with GitHub Copilot, as AI tools are familiar with make conventions and understand that when a Makefile exists, it represents the standard way to build the project.

## The Makefile Implementation

The Makefile in the [ALMakeDemo repository](https://github.com/FBakkensen/ALMakeDemo) demonstrates a cross-platform approach with platform detection and modular script execution:

```makefile
# Unified Makefile for AL (Business Central) Project
# Cross-platform build system using platform-specific scripts

# =============================================================================
# App Directory Configuration
# =============================================================================
APP_DIR := .

# =============================================================================
# Platform Detection
# =============================================================================
ifeq ($(OS),Windows_NT)
	PLATFORM := windows
	SCRIPT_EXT := .ps1
	SCRIPT_CMD := pwsh.exe -NoProfile -ExecutionPolicy Bypass -File
else
	PLATFORM := linux
	SCRIPT_EXT := .sh
	SCRIPT_CMD := bash
endif

# =============================================================================
# Targets
# =============================================================================
.PHONY: all build clean help show-config show-analyzers

# Default target
all: build

# Build target - main compilation
build:
	$(SCRIPT_CMD) scripts/make/$(PLATFORM)/build$(SCRIPT_EXT) $(APP_DIR) | tee build.log

# Clean build artifacts
clean:
	$(SCRIPT_CMD) scripts/make/$(PLATFORM)/clean$(SCRIPT_EXT) $(APP_DIR)

# Show current configuration
show-config:
	$(SCRIPT_CMD) scripts/make/$(PLATFORM)/show-config$(SCRIPT_EXT) $(APP_DIR)
```

The Makefile automatically detects the operating system and delegates to platform-specific scripts. On Windows, it calls PowerShell scripts with the `.ps1` extension, while on Linux it would call bash scripts with the `.sh` extension.

## Windows PowerShell Implementation

### Build Script Structure

The Windows build script (`build.ps1`) demonstrates several key concepts:

```powershell
# Windows Build Script
param([string]$AppDir = "app")
# Resolve $AppDir to its full path
$ResolvedAppDir = (Resolve-Path $AppDir).Path
# Import shared libraries (must be at the very top)
. "$PSScriptRoot\lib\common.ps1"
. "$PSScriptRoot\lib\json-parser.ps1"

# Discover AL compiler
$alcPath = Get-ALCompilerPath $ResolvedAppDir
if (-not $alcPath) {
    Write-Host "AL Compiler not found. Please ensure AL extension is installed in VS Code." -ForegroundColor Red
    exit 1
}

# Get enabled analyzer DLL paths
$analyzerPaths = Get-EnabledAnalyzerPaths $ResolvedAppDir
```

### AL Compiler Discovery

A critical component is automatically finding the AL compiler. The `common.ps1` library implements this functionality:

```powershell
# Discover AL compiler (alc.exe) in VS Code extensions
function Get-HighestVersionALExtension {
    $alExtDir = Join-Path $env:USERPROFILE ".vscode\extensions"
    if (-not (Test-Path $alExtDir)) { return $null }
    $alExts = Get-ChildItem -Path $alExtDir -Filter "ms-dynamics-smb.al-*" -ErrorAction SilentlyContinue
    if (-not $alExts -or $alExts.Count -eq 0) { return $null }
    $parseVersion = {
        param($name)
        if ($name -match "ms-dynamics-smb\.al-(\d+\.\d+\.\d+)") {
            return [version]$matches[1]
        } else {
            return [version]"0.0.0"
        }
    }
    $alExtsWithVersion = $alExts | ForEach-Object {
        $ver = & $parseVersion $_.Name
        [PSCustomObject]@{ Ext = $_; Version = $ver }
    }
    $highest = $alExtsWithVersion | Sort-Object Version -Descending | Select-Object -First 1
    if ($highest) { return $highest.Ext } else { return $null }
}

function Get-ALCompilerPath {
    param([string]$AppDir)
    $alExt = Get-HighestVersionALExtension
    if ($alExt) {
        $alc = Get-ChildItem -Path $alExt.FullName -Recurse -Filter "alc.exe" -ErrorAction SilentlyContinue | Select-Object -First 1
        if ($alc) { return $alc.FullName }
    }
    return $null
}
```

This function searches the VS Code extensions directory, finds all AL extension versions, and returns the highest version's `alc.exe` path.

### Code Analyzer Detection

The system automatically discovers enabled code analyzers from the `.vscode/settings.json` file:

```powershell
# Discover enabled analyzer DLL paths from settings.json and AL extension
function Get-EnabledAnalyzerPaths {
    param([string]$AppDir)
    $settingsPath = Get-SettingsJsonPath $AppDir
    $dllMap = @{ 'CodeCop' = 'Microsoft.Dynamics.Nav.CodeCop.dll';
                 'UICop' = 'Microsoft.Dynamics.Nav.UICop.dll';
                 'AppSourceCop' = 'Microsoft.Dynamics.Nav.AppSourceCop.dll';
                 'PerTenantExtensionCop' = 'Microsoft.Dynamics.Nav.PerTenantExtensionCop.dll' }
    $supported = @('CodeCop','UICop','AppSourceCop','PerTenantExtensionCop')
    $enabled = @()
    if ($settingsPath -and (Test-Path $settingsPath)) {
        try {
            $json = Get-Content $settingsPath -Raw | ConvertFrom-Json
            if ($json.'al.codeAnalyzers') {
                $enabled = $json.'al.codeAnalyzers' | ForEach-Object { $_ -replace '\$\{|\}', '' }
            }
        } catch {}
    }
    if (-not $enabled -or $enabled.Count -eq 0) {
        $enabled = @('CodeCop','UICop')
    }
    # Filter and deduplicate
    $enabled = $enabled | Where-Object { $supported -contains $_ } | Select-Object -Unique
    # Find DLL paths in AL extension
    $alExt = Get-HighestVersionALExtension
    $dllPaths = @()
    if ($alExt) {
        foreach ($name in $enabled) {
            $dll = $dllMap[$name]
            if ($dll) {
                $found = Get-ChildItem -Path $alExt.FullName -Recurse -Filter $dll -ErrorAction SilentlyContinue | Select-Object -First 1
                if ($found) {
                    $dllPaths += $found.FullName
                }
            }
        }
    }
    return $dllPaths
}
```

### Configuration and Utility Scripts

The system includes utility scripts for displaying configuration:

**show-config.ps1:**
```powershell
# Windows Show-Config Script
param([string]$AppDir)
. "$PSScriptRoot\lib\common.ps1"
. "$PSScriptRoot\lib\json-parser.ps1"

$appJson = Get-AppJsonObject $AppDir
if ($appJson) {
    Write-Host "App.json configuration:" -ForegroundColor Cyan
    Write-Host "  Name: $($appJson.name)"
    Write-Host "  Publisher: $($appJson.publisher)"
    Write-Host "  Version: $($appJson.version)"
} else {
    Write-Host "ERROR: app.json not found or invalid." -ForegroundColor Red
}

$settingsJson = Get-SettingsJsonObject $AppDir
if ($settingsJson) {
    Write-Host "Settings.json configuration:" -ForegroundColor Cyan
    Write-Host "  Analyzers: $($settingsJson.'al.codeAnalyzers')"
} else {
    Write-Host "No .vscode/settings.json found or invalid." -ForegroundColor Yellow
}
```

**clean.ps1:**
```powershell
# Windows Clean Script
param([string]$AppDir)
. "$PSScriptRoot\lib\common.ps1"
. "$PSScriptRoot\lib\json-parser.ps1"

$outputPath = Get-OutputPath $AppDir
if ($outputPath -and (Test-Path $outputPath)) {
    Remove-Item -Force $outputPath
    Write-Host "Removed build artifact: $outputPath" -ForegroundColor Green
    exit 0
} else {
    Write-Host "No build artifact found to clean ($outputPath)" -ForegroundColor Yellow
    exit 0
}
```

## Usage Examples

With this system in place, developers can use simple commands:

```powershell
# Build the AL extension
make build

# Clean build artifacts
make clean

# Show current configuration
make show-config

# Display enabled analyzers
make show-analyzers
```

The build process automatically:
1. Discovers the latest AL compiler version
2. Reads app.json for project configuration
3. Detects enabled code analyzers from settings.json
4. Compiles the project with proper analyzer integration
5. Reports success or failure with clear error messages

## Educational Value

This implementation demonstrates several important concepts:
- Cross-platform build automation
- Modular script design with shared libraries
- Automatic tool discovery and configuration
- Error handling and user feedback
- Integration with AI coding tools

For more complete examples and the full implementation, examine the [ALMakeDemo repository](https://github.com/FBakkensen/ALMakeDemo).

## Looking Forward: Linux Implementation and GitHub Copilot Agent

While this post focused on the Windows PowerShell implementation, the ALMakeDemo repository also includes equivalent bash scripts for Linux environments. The cross-platform nature of this build system becomes particularly interesting when combined with GitHub Copilot Agent capabilities. This will be the subject of a future blog post exploring how AI agents can work autonomously.
