---
title: "Add Retention Policy To Your Business Central App"
date: 2024-06-15
categories: [Business Central, AL, Development]
author: Flemming Bakkensen
description: Learn how to implement retention policies in your custom Business Central applications to automatically manage data cleanup and storage optimization.
tags: [business central, retention policy, data management, al development]
---

## What is Retention Policy

A Retention Policy enables administrators in Business Central to purge data from tables. The records selected for deletion are determined by their age and a Date Formula established for each table.

![alt text](/assets/images/2024-06-15-add-retention-policy-to-your-business-central-app/1718520968895.png)

<!--more-->

## Which tables can be used in Retention Policy

In app development, it is necessary for the developer to specify which tables are included in the Retention Policy. Microsoft provides certain default tables in their applications. The following instructions will guide you on how to incorporate a table into a custom application.

## A Custom scenario

We have a requirement to log which customers have been viewed. A view in this context is defined as someone having viewed the Customer Record on the Customer Card Page.

To log the views, we will create a table containing the customer number, the User ID, and the time of the view.


![Customer View Log](/assets/images/2024-06-15-add-retention-policy-to-your-business-central-app/1718523389320.png)

To prevent the table from becoming excessively large and to save on database storage, it has been decided that records will only be stored for 28 days. This is where implementing a Retention Policy becomes beneficial.

As mentioned, to utilize the Retention Policy, the table must be enabled. This can be achieved with the code provided in an Install Codeunit:

```al
trigger OnInstallAppPerCompany()
var
  RetenPolAllowedTables: Codeunit "Reten. Pol. Allowed Tables";
begin
  RetenPolAllowedTables.AddAllowedTable(Database::"Customer View Log");
end;
```

Once the app is installed, a Retention Policy for the table can be established as demonstrated below.

![Retention Policy](/assets/images/2024-06-15-add-retention-policy-to-your-business-central-app/1718524369654.png)

## Additional information

Microsoft has some documentation on Retention Policy which can be found [here](https://learn.microsoft.com/en-us/dynamics365/business-central/admin-data-retention-policies).

The full source code can be found on my [GitHub](https://github.com/FBakkensen/AddRetentionPolicy).
