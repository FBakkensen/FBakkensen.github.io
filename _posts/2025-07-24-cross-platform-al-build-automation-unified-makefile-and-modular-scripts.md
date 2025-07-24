---
layout: post
title: "Cross-Platform AL Build Automation: Unified Makefile and Modular Scripts for Business Central Extensions"
date: 2025-07-24
categories: [Business Central, AL, Build Automation, Scripting]
author: Flemming Bakkensen
description: Learn how to automate AL builds for Business Central using a unified Makefile and modular scripts for Windows and Linux. This post explores the ALMakeDemo repo and its educational value for developers.
tags: [business central, al, makefile, powershell, bash, build automation]
---

# problem
When using agentic code tools like Github Copilot, is one of the way to guide the tool that the app actually compiles, and there is no errors from code analyzers. This way is the syntax checked and this is the scope for this blog post and the make file and build scripts. For check of functionality should automated tests be introduced, this is outside the scope of this blog post.

# solution
When Github Copilot can compile and run code analyzers then do we give it the possibility to first return to the user when the code actual compiles and no warnings from code analyzers exists.

Github Copilot do not have access to the built-in function in VS Code, and do require the terminal to compile the app using `alc.exe` one of the most prominent issue with using alc is that is typical not on the path, as the alc compiler is installed as part of the VS Code extension, and is updated together with the extension. A part of the scripts is to detect the most recent version of the alc compiler installed.

## make
on top of the scripts is a `make`file generated. this is used by the `make.exe` which is installed as part of Git for windows.

### What is make
Make is a build automation tool that has been around since the 1970s, originally created for Unix systems. Think of it as a recipe book for your computer - it tells the system exactly what steps to take to build your application.

For Business Central developers who primarily work within VS Code's graphical interface, `make` might seem unfamiliar, but it's actually quite simple. Instead of manually running multiple commands to compile your AL extension, download symbols, or clean up files, you can type a single command like `make build` in the terminal, and it executes all the necessary steps automatically.

The beauty of `make` lies in its simplicity and consistency. It works by reading a file called `Makefile` (like a recipe card) that contains:
- **Targets**: What you want to build (like "build", "clean", or "test")
- **Dependencies**: What needs to exist before building
- **Commands**: The actual steps to execute

For example, instead of remembering complex PowerShell commands or navigating through menus, you can simply open a terminal and type:
- `make build` - Compiles your AL extension
- `make clean` - Removes the output files

This approach becomes especially powerful when working with GitHub Copilot or other AI tools, as they are familiar with make and already know that when a make file exists, then this is the way to compile the app.

### The make file
The make file in this configuration is quite simple, as it merely calls some scripts with a parameter for where directory of the app to compile. The directory is a configuration in the top of the make file.




For more details, check out the [ALMakeDemo repo](https://github.com/FBakkensen/ALMakeDemo).
