---
title: "Use Role Centers as a Live Dashboard"
date: 2024-05-30 11:50:00 +0200 # Date and time (optional time/timezone)
categories: BC AL # Optional categories
tags: [BC, AL, Dashboard]   # Optional tags
---
Sometimes you might need a dashboard like page in Business Central. For this purpose you could use Queues on a rolecenter, like the one below. But the issue with this, is that it loads the value when the rolecenter is opened, and for a dashboard feeling, you will want something that updates it self, especially if it is presented on a unattended screen, like a wall mounted big screen. I will in this post give you one solution to have “live” updated queues.

![alt text](/assets/images/2024-05-30-use-role-centers-as-a-live-dashboard/1721208966156.png)

<!--more-->

For this solution we are going to use a Page Background Task [Microsoft Docs - Background Tasks](https://learn.microsoft.com/en-us/dynamics365/business-central/dev-itpro/developer/devenv-page-background-tasks). This is not going to be an in depth showcase of Page Background Tasks, but in essential, you enqueue a Task, a tasks is an codeunit that is then running the OnRun event, and you can pass some parameters to it, in this case we are passing a parameter for how many milliseconds between each update of our dashboard.

```al
local procedure BackgroundUpdate()
var
    TaskParameters: Dictionary of [Text, Text];
begin
    TaskParameters.Add('Sleep', Format(1000));

    CurrPage.EnqueueBackgroundTask(TaskID, Codeunit::BackgroundSleep, TaskParameters, 2000, PageBackgroundTaskErrorLevel::Error);
end;
```

The codeunit we are using in this scenario is quite simple, it just sleep the specified amount of milliseconds

```al
codeunit 50601 "BackgroundSleep"
{
    trigger OnRun()
    var
        Sleep: Integer;
    begin
        Evaluate(Sleep, Page.GetBackgroundParameters().Get('Sleep'));
        Sleep(Sleep);
    end;
}
```

When the task is done running, the OnPageBackgroundTaskCompleted event is raised, and we can subscribe to that event on the page that started the background task.

```al
trigger OnPageBackgroundTaskCompleted(TaskId: Integer; Results: Dictionary of [Text, Text])
begin
    Rec.CalcFields("Ongoing Sales Quotes", "Ongoing Sales Orders", "Ongoing Sales Invoices");

    LastUpdated := Format(CurrentDateTime, 0, 3);
    BackgroundUpdate();
end;
```

Here we calculated the values for the queues and updates a textfield for the last update time. At last we schedule the background task to run again.

To start this repetitative sequence we are scheduling the first background task from the OnAfterGetCurrRecord on the page.

Hope this can be of any help, the full source code for this little example can be found on my [GitHub](https://github.com/FBakkensen/DashboardPoweredByPageBackground)