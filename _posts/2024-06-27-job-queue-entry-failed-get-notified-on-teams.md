---
layout: post
title: "Job Queue Entry Failed, Get Notified on Teams"
date: 2024-06-27
categories: [Business Central, Integration, Power Automate]
author: Flemming Bakkensen
description: Learn how to set up automatic Teams notifications when Business Central job queue entries fail by implementing External Business Events and Power Automate flows.
tags: [business central, job queue, teams integration, power automate, external business events]
---

## Introduction

A notable limitation in Business Central is the monitoring of Job Queue Entries. Although monitoring encompasses a wide range, I will present a method to receive notifications in a Teams Channel when a Job Queue Entry fails.

To send a notification to Teams from Business Central, I will utilize Power Automate.

![alt text](/assets/images/2024-06-27-job-queue-entry-failed-get-notified-on-teams/1722080756951.png)

<!--more-->

For Power Automate to receive an event from Business Central, Business Central must raise an External Business Event. Currently, there is no such event available out of the box.

## Creating an External Business Event

To generate an External Business Event, I will subscribe to the OnAfterLogError event in the "Job Queue Error Handler" Codeunit and then trigger a new External Business Event.

```al
[EventSubscriber(ObjectType::Codeunit, Codeunit::"Job Queue Error Handler", OnAfterLogError, '', false, false)]
local procedure "Job Queue Error Handler_OnAfterLogError"(var JobQueueEntry: Record "Job Queue Entry")
begin
    OnJobQueueError(JobQueueEntry.SystemId);
end;

[ExternalBusinessEvent('OnJobQueueError', 'On Job Queue Error', 'On Job Queue Error', Enum::EventCategory::"Job Queue Error")]
local procedure OnJobQueueError(JobQueueId: Guid)
begin
end;
```

The subsequent steps involve subscribing to the Event in Power Automate and forwarding details to Teams regarding the Job Queue Entry that has failed.

## Setting Up Power Automate Flow

First, I will present an overview of the Power Automate Flow.

![Power Automate Flow Overview](/assets/images/2024-06-27-job-queue-entry-failed-get-notified-on-teams/1722082682305.png)

The first step is subscribing to our new External Business Event to start the Flow.

![Subscribe to Business Event](/assets/images/2024-06-27-job-queue-entry-failed-get-notified-on-teams/1722082805045.png)

Second is to get the URL for the Job Queue Entry Card, to show information for the Job Queue Entry that failed.

![Get URL for Job Queue Entry](/assets/images/2024-06-27-job-queue-entry-failed-get-notified-on-teams/1722082912791.png)

Third is getting an adaptive card for the Job Queue Entry we can post to Teams. Fields in an adaptive card are defined by the Brick layout for the table.

![Get Adaptive Card](/assets/images/2024-06-27-job-queue-entry-failed-get-notified-on-teams/1722083084567.png)

Final step is to post the adaptive card to a Teams Channel.

![Post to Teams](/assets/images/2024-06-27-job-queue-entry-failed-get-notified-on-teams/1722083130185.png)

## The Results

When a Job Queue Entry fails, a new post will be made to the specified Teams Channel. It will look like the following:

![Teams Notification](/assets/images/2024-06-27-job-queue-entry-failed-get-notified-on-teams/1722083206526.png)

Here it is possible to work directly with the Job Queue Entry by clicking the details button.

![Job Queue Entry Details](/assets/images/2024-06-27-job-queue-entry-failed-get-notified-on-teams/1722083286317.png)

The full source code for this article can be found on my [GitHub](https://github.com/FBakkensen/NotifyOnJobQueueErrorBusinessEvent).
