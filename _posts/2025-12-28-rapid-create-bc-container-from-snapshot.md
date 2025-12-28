---
layout: post
title: "Rapid Create BC Container From Snapshot"
date: 2025-12-28
categories: [Business Central, Docker, Development]
author: Flemming Bakkensen
description: "Learn how to quickly create Business Central Docker containers from existing snapshots for rapid development environment setup."
tags: [business central, docker, container, snapshot, development environment]
---

In my daily work as a Business Central consultant, I've noticed how much time we lose waiting for Docker containers to spin up. Whether you're switching branches, debugging a specific issue, or - increasingly - running parallel agentic coding tools, that "coffee break" while a container creates is a productivity killer.

Today, I will share a technique that has transformed my local development loop: **Rapid Container Creation via Snapshots.** Instead of waiting 15-20 minutes for a full `New-BcContainer` run, we can leverage Docker's `commit` feature to spin up fresh, healthy environments in under two minutes.

<div class="mermaid">
flowchart TD
    %% Nodes
    Base("🏗️ Baseline Container<br/>(BC + Tools + Data)")
    CmdStop("🛑 Stop Container")
    CmdCommit("💾 Docker Commit")
    Image("📦 Snapshot Image<br/>(bctemp:snapshot)")

    Agent1("🚀 Agent Container 1<br/>(Feature A)")
    Agent2("🚀 Agent Container 2<br/>(Bugfix B)")
    Agent3("🚀 Agent Container 3<br/>(Experiment C)")

    %% Flow
    Base --> CmdStop --> CmdCommit --> Image
    Image -.->|Spawns in ~2 min| Agent1
    Image -.->|Spawns in ~2 min| Agent2
    Image -.->|Spawns in ~2 min| Agent3

    %% Styling
    classDef base fill:#e1f5fe,stroke:#01579b,stroke-width:2px,color:#000;
    classDef action fill:#fff9c4,stroke:#fbc02d,stroke-width:1px,stroke-dasharray: 5 5,color:#000;
    classDef image fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px,color:#000;
    classDef agent fill:#f3e5f5,stroke:#7b1fa2,stroke-width:1px,color:#000;

    class Base base;
    class CmdStop,CmdCommit action;
    class Image image;
    class Agent1,Agent2,Agent3 agent;
</div>

<!--more-->

## Step 1: Create and Prepare the Baseline Container

You start by creating a baseline container with the latest Business Central version. This container will serve as the template for all future containers. The Baseline will only need to recreated when a new version of Business Central is released or when certain windows updates are installed. There is nothing special about this, this is probably how you do it already using BcContainerHelper.

```powershell
# Create credential
$password = ConvertTo-SecureString 'P@ssw0rd' -AsPlainText -Force
$credential = New-Object PSCredential 'admin', $password

# Get artifact URL
$artifactUrl = Get-BcArtifactUrl -type 'OnPrem' -country 'w1' -select 'Latest'

# Create container with test toolkit
New-BcContainer `
    -accept_eula `
    -containerName 'bctemp' `
    -credential $credential `
    -auth 'UserPassword' `
    -artifactUrl $artifactUrl `
    -includeTestToolkit `
    -includeTestLibrariesOnly `
    -dns '8.8.8.8' `
    -useBestContainerOS `
    -memoryLimit '8g' `
    -isolation 'process' `
    -updateHosts
```

### Prepare the Container
As part of the preparation, you need to stop IIS and remove the web client folder, as these are recreated on container start, because it gets a new hostname. And can cause file lock issues.

> Why remove the web client folder?
> When the container restarts with a different hostname, BC's startup script tries to reconfigure C:\inetpub\wwwroot\BC. If IIS has files locked, this fails. By removing the folder before commit, there's nothing to lock, and BC recreates it fresh on startup.

```powershell
# Stop IIS to release file locks
docker exec bctemp powershell -Command "Stop-Service W3SVC -Force -ErrorAction SilentlyContinue"
# Remove web client folder - prevents file lock issues on restart with new hostname
docker exec bctemp powershell -Command "Remove-Item 'C:\inetpub\wwwroot\BC' -Recurse -Force -ErrorAction SilentlyContinue"

# Stop the container
docker stop bctemp
```

### Restart Computer? Really?
Yes, unfortunately. If you've spent any time with Docker on Windows using process isolation, you've likely encountered the "Access is denied" or "File in use" errors during a `docker commit`.

> [!NOTE]
> **The Technical Why:**
> Docker on Windows (when using process isolation) interacts deeply with the host's file system and Registry. Even after stopping a container, some system handles or filesystem filters can remain active. A quick restart ensures a clean state, which is crucial for the reliability of your baseline image. If you've found a way to avoid this step, please reach out—I'd love to hear it!

## Step 2: Commit to Snapshot Image

Once your baseline container is stopped and the system state is clean, it's time to "freeze" it into a reusable image. We use the `docker commit` command for this, which effectively takes the current state of the container's file system and saves it as a new image layer.

```powershell
# Commit the stopped container to an image
docker commit bctemp bctemp:snapshot

# Verify the image
docker images bctemp:snapshot
```

## Step 3: Spawn Agent Containers
With your snapshot image ready, you can now spin up new containers almost instantly. We use the standard `docker run` command, but notice how we map the same volumes as a standard Business Central container to ensure consistency and speed (like the artifact cache).

```powershell
$agentName = 'my-agent'  # or derive from git branch

docker run -d `
    --name $agentName `
    --hostname $agentName `
    --memory 8g `
    --restart no `
    --network nat `
    --dns 8.8.8.8 `
    --isolation process `
    -v 'c:\windows\system32\drivers\etc:C:\driversetc' `
    -v 'c:\bcartifacts.cache:c:\dl' `
    -v 'C:\ProgramData\BcContainerHelper:C:\ProgramData\BcContainerHelper' `
    bctemp:snapshot
```

Wait for the container to start, and you have a ready-to-use Business Central environment in a couple of minutes. I use the following script to automate the wait process, ensuring the container is fully ready before proceeding.

### How the Health Check Works
The script below is a bit advanced but very robust. It starts a **background job** to stream the Docker logs (so you can see what's happening) while the main script loops to check the container's health status. This prevents the console from freezing and gives you instant feedback if something fails.

```powershell
# Wait for container to become healthy
# Start background job to stream container logs
$logJob = Start-Job -ScriptBlock {
    param($containerName)
    docker logs -f $containerName 2>&1
} -ArgumentList $agentName

# Poll for health while streaming logs
try {
    while ($true) {
        # Output any new log lines
        Receive-Job $logJob -ErrorAction SilentlyContinue | ForEach-Object {
            if ($_ -ne $null) {
                Write-Host "  $_"
            }
        }

        $running = docker inspect $agentName --format '{% raw %}{{.State.Running}}{% endraw %}' 2>$null
        $health = docker inspect $agentName --format '{% raw %}{{.State.Health.Status}}{% endraw %}' 2>$null

        if ($running -ne 'true') {
            $exitCode = docker inspect $agentName --format '{% raw %}{{.State.ExitCode}}{% endraw %}' 2>$null
            Write-Error "Container exited before becoming healthy (exit code $exitCode)"
            break
        }

        if ($health -eq 'healthy') {
            Write-Host "Container is healthy!"
            break
        }

        if ($health -eq 'unhealthy') {
            Write-Warning "Health check reported 'unhealthy', waiting..."
        }

        Start-Sleep -Seconds 2
    }
}
finally {
    # Clean up the log streaming job
    Stop-Job $logJob -ErrorAction SilentlyContinue | Out-Null
    Remove-Job $logJob -ErrorAction SilentlyContinue | Out-Null
}
```

### Configure Hostname Resolution
This is not strictly necessary, but it makes it easier to connect to the container, and matches the `-updateHosts` from `New-BcContainer`.

```powershell
# Get container IP
$containerIp = docker inspect $agentName --format '{% raw %}{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}{% endraw %}'

# Add to hosts file
$hostsPath = 'C:\Windows\System32\drivers\etc\hosts'
$entry = "$containerIp`t$agentName"
Add-Content -Path $hostsPath -Value $entry
```

### Update BC's PublicWebBaseUrl:
When the container hostname changes, the internal Business Central configuration still points to the old name. Updating `PublicWebBaseUrl` ensures that generated links (like OData URLs or links in emails) point to the correct new container address.


```powershell
# Update PublicWebBaseUrl to match new hostname
$config = Get-BcContainerServerConfiguration -containerName $agentName
$currentUrl = $config.PublicWebBaseUrl

# Replace hostname in URL (preserve scheme, port, path)
if ($currentUrl -match '^(https?://)([^:/]+)(:\d+)?(.*)$') {
    $scheme = $matches[1]
    $port = $matches[3]
    $path = $matches[4]
    $newUrl = "${scheme}${agentName}${port}${path}"

    Set-BcContainerServerConfiguration `
        -containerName $agentName `
        -keyName 'PublicWebBaseUrl' `
        -keyValue $newUrl

    Restart-BcContainerServiceTier -containerName $agentName
}
```

Now you can connect to the container using the hostname, and you're ready to develop.

## Why This Matters for Agentic Development

You might be wondering: "Is saving 10 minutes really worth this setup?"

If you are just doing traditional development, maybe not. But in the era of **Agentic Coding**, this is a game-changer. When I use tools like GitHub Copilot or Claude to help me write and test code, I often want them to work on isolated features in parallel.

By using snapshots:
- Each "Agent" or branch gets its own dedicated, clean container.
- I can run full test suites in parallel across multiple containers without them interfering with each other.
- If an agent messes up an environment, I can scrap it and spawn a new one in seconds.

## Benefits at a Glance

| Feature | New-BcContainer (Standard) | Snapshot Spawn |
|---------|---------------------------|----------------|
| **Creation Time** | 10 - 20 Minutes | ~1 - 2 Minutes |
| **Consistency** | High (but depends on host state) | Absolute (Identical to Baseline) |
| **Automation** | Slower CI/CD pipelines | Rapid, lightweight ephemeral agents |

## The Philosophy: Infrastructure as Code

This approach moves us closer to a "cattle, not pets" mentality for our development environments. We shouldn't be afraid to delete a container because we know we can get it back exactly as it was in the time it takes to grab a coffee.

In my personal workflow, this is part of a larger PowerShell module that automatically handles branch-to-container mapping. It ensures my environment is always ready to run my tests.

## Conclusion

Rapidly creating containers from snapshots isn't just about speed; it's about reducing the friction in our development loops. It enables more aggressive testing, better isolation, and a more modern approach to Business Central development.

---

*Found this helpful? Check out my other posts on [AL Build Tools]({{ site.baseurl }}{% post_url 2025-07-28-setup-github-copilot-agent-for-al %}) and [Agentic Feedback Loops]({{ site.baseurl }}{% post_url 2025-10-14-feedback-loops-in-agentic-coding-tools-why-self-correction-beats-one-shot-perfection %}).*
```