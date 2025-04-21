---
layout: post
title: "Why Business Central Teams Must Start With \"Why\" — Not \"What\""
date: 2025-04-07
categories: [Business Central, Consulting, Development]
author: Flemming Bakkensen
description: Discover how focusing on the "why" behind client requests leads to more effective Business Central implementations, avoiding over-engineered solutions and delivering meaningful results aligned with business goals.
tags: [business central, consulting, development strategy, requirements gathering, solution design]
---

**Summary:** In Business Central projects, jumping straight to what the client wants—without first understanding why—leads to over-engineered solutions, wasted resources, and misaligned priorities. By focusing on the why, consultants uncover the real business needs behind requests, and developers build purposeful, efficient solutions that align with long-term goals. This approach fosters collaboration, avoids unnecessary complexity, and delivers meaningful results for clients.

![alt text](/assets/images/2025-04-07-why-business-central-teams-must-start-with-why-not-what/1744024040602.jpg)

This is just the summary! The full article below dives deeper into specific examples, actionable strategies, and how focusing on "why" transforms Business Central projects.

<!--more-->

## The Critical Question Teams Often Overlook: "Why?"

Imagine this scenario: A client requests a new feature for their Business Central system. The consultants are eager to map out configurations, while the developers are already brainstorming AL code structures. But before anyone asks how to build it, someone needs to ask why.

Skipping the "why" leads to bloated solutions, misaligned priorities, and wasted resources. For Business Central implementations—where business processes meet technical complexity—starting with "why" is not just important; it's essential.

## The Cost of Ignoring "Why"

When teams jump straight into the "what," they risk:

### Over-Engineering Solutions

A manufacturing client requested a custom integration between Business Central and their Product Lifecycle Management (PLM) system to sync product data. The initial proposal involved building an intricate API with real-time synchronization. However, by asking why, the team uncovered that the client only needed periodic updates for reporting purposes. Instead of a costly real-time integration, they implemented batch data exports using Azure Logic Apps—a solution that saved time and budget while meeting the actual need.

### Misaligned Priorities

A wholesale distributor wanted custom workflows for purchase approvals. Consultants and developers jumped into designing complex approval hierarchies with multiple layers of conditions. But when the team asked why, they discovered the client's main concern was reducing delays caused by manual approvals. The simpler solution? Automating notifications and enabling mobile approvals via Power Automate—no custom AL code required.

### Client Dissatisfaction

A retail company requested advanced inventory forecasting features integrated into Business Central. Developers proposed using machine learning models hosted in Azure. After weeks of development, the client revealed they didn't have the internal expertise to interpret complex forecasting outputs. If the team had asked why earlier, they could have recommended simpler statistical tools built directly into Business Central's reporting framework, avoiding unnecessary complexity.

## How Asking "Why" Transforms Projects

### For Consultants: Uncovering True Needs

Consultants are often the first point of contact for clients, making them uniquely positioned to dig deeper into requests. Asking why helps uncover motivations that may not be immediately obvious:

- "What problem are you solving with this customization?"
- "How does this align with your broader business goals?"
- "What happens if we don't implement this?"

**Example:** A logistics company requested a custom extension for shipment tracking within Business Central. By asking why, consultants discovered that their primary issue was integrating tracking data from external carriers into their ERP system. The solution involved leveraging APIs from carrier services like FedEx and DHL to feed data directly into Business Central—a more impactful approach than building a standalone tracking module from scratch.

### For Developers: Building With Purpose

Developers who understand the "why" behind requests write better code and propose smarter solutions:

- They avoid over-engineering features that go unused or misunderstood by end-users.
- They design extensible solutions that align with long-term business goals rather than short-term fixes.
- They challenge assumptions and offer alternatives when technical constraints arise.

**Example:** A pharmaceutical company wanted a custom batch tracking system integrated with Business Central's manufacturing module. Developers initially planned to create new tables and pages for tracking batches across production stages. However, understanding the why revealed that regulatory compliance was the driving factor behind this request. Instead of building everything from scratch, developers leveraged existing functionality in Business Central's lot tracking features and extended it with AL code to meet specific compliance requirements—saving months of development time.

## Building a "Why-First" Culture

### For Consultants:

- **Ask "So That…" Questions:** Turn feature requests into purpose-driven statements: "We need a custom field on purchase orders" → "We need a custom field on purchase orders so that we can track supplier discounts effectively."
- **Challenge Assumptions:** If a client insists on customization, ask: "Is there an out-of-the-box feature or workaround that achieves the same result?" Often, simpler solutions exist within Business Central's standard capabilities or through third-party apps.

### For Developers:

- **Refuse to Code Without Context:** Before starting development, ensure you understand how your work impacts business outcomes—whether it's improving efficiency or meeting compliance standards.
- **Collaborate Early and Often:** Join requirement workshops alongside consultants to hear firsthand how clients describe their needs and motivations. This builds empathy and ensures alignment between technical execution and business goals.

### For Leaders:

- **Reward Purpose-Driven Solutions:** Celebrate teams that reduce unnecessary complexity or challenge misaligned requests in favor of simpler, more impactful solutions.
- **Invest in Cross-Training:** Encourage consultants to learn basic AL concepts and developers to understand key business processes like supply chain workflows or financial reporting cycles.

## Why "Why" Matters Even More in an AI-Driven Era

With AI tools like GitHub Copilot accelerating code generation, developers can now produce technical solutions faster than ever before—but speed doesn't equal value if teams aren't solving the right problems. AI can write code, but it can't ask why. It can't identify whether a customization aligns with business priorities or challenge assumptions about what clients truly need.

The future of Business Central teams lies in their ability to combine human insight with technical execution—starting every project by asking why.

## Final Thoughts

Starting with "why" transforms Business Central projects from transactional implementations into strategic partnerships that deliver lasting value for clients:

- Clients get leaner solutions tailored to their actual needs—not bloated systems full of unused features.
- Teams avoid wasted effort and deliver faster results.
- Businesses see measurable outcomes tied directly to their goals.

So next time you hear "We need X," pause and ask "Why do you need X?" That simple question could change everything.

What's your experience with focusing on "why" in Business Central projects? Share your thoughts below! 👇
