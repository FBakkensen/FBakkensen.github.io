---
title: "Dynamics 365 Business Central 2025 Release Wave 1: The End of SOAP and What It Means for Developers"
date: 2025-03-27
categories: [Business Central, Development, Integration]
author: Flemming Bakkensen
description: Learn about Microsoft's decision to remove SOAP endpoint capabilities from Business Central pages in version 26, and explore alternatives like OData, REST APIs, and custom API pages.
tags: [business central, soap, api, integration, deprecated features, odata]
---

Microsoft's upcoming Dynamics 365 Business Central 2025 Release Wave 1 (version 26) introduces a major change that developers and businesses need to prepare for: the removal of the ability to expose Microsoft pages as SOAP endpoints. This marks a significant step in the ongoing deprecation of SOAP protocol support in Business Central, which began in 2021. Let's explore what's changing, why it matters, and how you can adapt.

![alt text](/assets/images/2025-03-27-dynamics-365-business-central-2025-release-wave-1-the-end-of-soap-and-what-it-means-for-developers/1743099172979.png)

<!--more-->

## What's Changing?

Starting in version 26 (April 2025), it will no longer be possible to expose a Microsoft page as a SOAP endpoint. This change addresses a critical issue: **UI pages are not APIs**. While changes to UI pages in Business Central are generally not considered breaking changes, they can disrupt integrations that rely on these pages as web service endpoints. For customers using SOAP integrations tied to UI pages, even minor UI updates could break their workflows.

If you need SOAP integrations for these pages, Microsoft advises copying the source code for the page and hosting it in a per-tenant extension. However, this workaround is considered a short-term solution and should be avoided whenever possible.

For more details, refer to Microsoft's official documentation: [Deprecated Features in Business Central](https://learn.microsoft.com/en-us/dynamics365/business-central/dev-itpro/upgrade/deprecated-features-platform#soap-on-baseapp-pages).

## Why Is Microsoft Phasing Out SOAP?

The removal of SOAP endpoints aligns with Microsoft's broader strategy to modernize Business Central. Here's why this shift is happening:

1. **UI Pages Are Not Designed for Integration**: Changes to UI pages can unintentionally break workflows when used as web service endpoints.

2. **Security Concerns**: SOAP lacks robust security features compared to modern protocols like OData.

3. **Performance Improvements**: OData and API web services are up to 10x faster than SOAP-based integrations.

## What Are Your Alternatives?

Microsoft recommends transitioning to modern integration methods that are more secure and scalable:

### 1. OData V4

OData is the preferred replacement for SOAP due to its performance and compatibility with web applications. It supports authentication standards like OAuth 2.0 and offers better data querying capabilities.

### 2. REST APIs

Business Central's native REST APIs provide lightweight, efficient endpoints for integration scenarios.

### 3. Custom API Pages

Developers can create dedicated API pages using AL code for tailored integrations. These pages are versioned and designed specifically for stable integration workflows.

## How Can You Prepare?

To ensure a smooth transition away from SOAP endpoints, follow these steps:

### Audit Existing Integrations
Identify all workflows that rely on SOAP endpoints and assess their business impact.

### Prioritize Migration
Focus on critical workflows first, such as order processing or financial reporting.

### Test Modern Alternatives
Pilot OData or API-based integrations in a sandbox environment to validate functionality.

### Implement Temporary Workarounds (if necessary)
If you must continue using SOAP temporarily, copy the source code of the affected Microsoft page into a per-tenant extension and expose it as an endpoint.

For detailed guidance on transitioning to modern web services, consult Microsoft's documentation: [Business Central Web Services](https://learn.microsoft.com/en-us/dynamics365/business-central/dev-itpro/webservices/web-services).

## Timeline

- **April 2025**: Version 26 releases; exposing Microsoft pages as SOAP endpoints will no longer be supported.
- **Future Releases**: Full removal of SOAP protocol support is planned but not yet scheduled.

## Conclusion

The deprecation of SOAP endpoints represents an important step toward modernizing Dynamics 365 Business Central. By transitioning to OData or REST APIs, businesses can improve performance, enhance security, and future-proof their integrations.

While temporary workarounds like per-tenant extensions exist, they should only be used sparingly as part of your migration strategy. Now is the time to audit your systems, prioritize critical workflows, and embrace modern integration methods.

#Dynamics365 #BusinessCentral #SOAPDeprecation #OData #APIIntegration #ERPModernization
