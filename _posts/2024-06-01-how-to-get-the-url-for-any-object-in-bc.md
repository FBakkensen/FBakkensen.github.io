---
title: "How to get the URL for any object in BC"
date: 2024-06-01
categories: [Business Central, Development]
tags: [business central, al, api, url, integration]
author: Flemming Bakkensen
description: Learn how to create URL for opening a specific page in Business Central.
---
![alt text](/assets/images/2024-06-01-how-to-get-the-url-for-any-object-in-bc/1721186947196.png)
Sometimes you need the URL for opening a specific page in Business Central. This could be in a scenario where you have an API that exposes all your items, and you want to make it possible for the consumer of the API to make a link directly back to the specific item in Business Central. This of course requires the user to have access to Business Central.

<!--more-->

I have made an example of an API page exposing some standard fields from the item table, but in addition to that I also expose URLs for the item card page for both the web client and the mobile client.

```al
page 50100 ItemAPI
{
    APIGroup = 'bcdev';
    APIPublisher = 'bcdev';
    APIVersion = 'v1.0';
    ApplicationArea = All;
    Caption = 'itemAPI';
    DelayedInsert = true;
    EntityName = 'item';
    EntitySetName = 'items';
    PageType = API;
    SourceTable = Item;

    layout
    {
        area(content)
        {
            repeater(General)
            {
                field(no; Rec."No.")
                {
                    Caption = 'No.';
                }
                field(description; Rec.Description)
                {
                    Caption = 'Description';
                }
                field(unitCost; Rec."Unit Cost")
                {
                    Caption = 'Unit Cost';
                }
                field(unitPrice; Rec."Unit Price")
                {
                    Caption = 'Unit Price';
                }
                field(webUrl; WebURL)
                {
                    Caption = 'Url';
                }
                field(phoneUrl; PhoneURL)
                {
                    Caption = 'Url';
                }
            }
        }
    }

    trigger OnAfterGetRecord()
    begin
        WebURL := GetUrl(ClientType::Web, CompanyName, ObjectType::Page, Page::"Item Card", Rec, false);
        PhoneURL := GetUrl(ClientType::Phone, CompanyName, ObjectType::Page, Page::"Item Card", Rec, false);
    end;

    var
        WebURL: Text;
        PhoneUrl: Text;
}
```

In this context, the most important part is the 2 lines in the "OnAfterGetRecord" trigger, which uses a built-in function to get the URL for the "Item Card" page, for both the Web and Mobile client, and it does that for every item, and exposes the URLs in the API. Microsoft have made some documentation on the GetUrl function [GETURL Function – Dynamics NAV | Microsoft Learn](https://learn.microsoft.com/en-us/dynamics-nav/geturl-function--database-).

When calling the API you get a result that looks like the following (I have removed some boilerplate json in the result):

```json
{
  "@odata.etag": "W/\"JzE5OzU3MzYwMzMzOTY0NDk3MjcwOTYxOzAwOyc=\"",
  "no": "1896-S",
  "description": "ATHEN Skrivebord",
  "unitCost": 4337,
  "unitPrice": 5560,
  "webUrl": "http://bcserver-default/BC/?company=CRONUS%20Danmark%20A%2FS&page=30&bookmark=23%3bGwAAAAJ7%2fzEAOAA5ADYALQBT&tenant=bcserver-default",
  "phoneUrl": "ms-dynamicsnav://bcserver-default:80/BC?company=CRONUS%20Danmark%20A%2FS&page=30&bookmark=23%3bGwAAAAJ7%2fzEAOAA5ADYALQBT&tenant=bcserver-default"
},
{
  "@odata.etag": "W/\"JzIwOzE2MTUyNTEzNDI4MjY5ODM3NzEzMTswMDsn\"",
  "no": "1900-S",
  "description": "PARIS Gæstestol, sort",
  "unitCost": 835,
  "unitPrice": 1071,
  "webUrl": "http://bcserver-default/BC/?company=CRONUS%20Danmark%20A%2FS&page=30&bookmark=23%3bGwAAAAJ7%2fzEAOQAwADAALQBT&tenant=bcserver-default",
  "phoneUrl": "ms-dynamicsnav://bcserver-default:80/BC?company=CRONUS%20Danmark%20A%2FS&page=30&bookmark=23%3bGwAAAAJ7%2fzEAOQAwADAALQBT&tenant=bcserver-default"
},
{
  "@odata.etag": "W/\"JzE5OzkzOTY0NTI3MjYwNDAxOTk4NjkxOzAwOyc=\"",
  "no": "1906-S",
  "description": "ATHEN Skuffemodul",
  "unitCost": 1879,
  "unitPrice": 2409,
  "webUrl": "http://bcserver-default/BC/?company=CRONUS%20Danmark%20A%2FS&page=30&bookmark=23%3bGwAAAAJ7%2fzEAOQAwADYALQBT&tenant=bcserver-default",
  "phoneUrl": "ms-dynamicsnav://bcserver-default:80/BC?company=CRONUS%20Danmark%20A%2FS&page=30&bookmark=23%3bGwAAAAJ7%2fzEAOQAwADYALQBT&tenant=bcserver-default"
}
```

The source code for this example can be found on my [GitHub](https://github.com/FBakkensen).
