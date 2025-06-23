---
layout: post
title: "Supercharging Business Central Development with Microsoft Docs MCP Server and GitHub Copilot"
date: 2025-06-23
categories: [Business Central, AI, Development]
author: Flemming Bakkensen
description: Discover how to leverage the Microsoft Docs MCP Server with GitHub Copilot to supercharge your Business Central AL development workflow with instant access to official documentation and best practices.
tags: [business central, ai, github copilot, mcp server, al development, microsoft docs]
---
As a Business Central developer, finding the right information quickly can make the difference between a productive day and hours of searching through documentation and code. Today, I want to share how I've enhanced my development workflow using MCP (Model Context Protocol) servers with GitHub Copilot for VS Code.

## What are MCP Servers?

MCP servers are a way to extend GitHub Copilot's capabilities by connecting it to external data sources. Think of them as bridges that allow Copilot to access and search through specific repositories of information that it wouldn't normally have access to.

## My MCP Setup for Business Central Development

I use two MCP servers that have transformed how I work with Business Central:

### 1. Microsoft Docs MCP Server

This server, created by Microsoft, provides direct access to all materials on learn.microsoft.com, including the comprehensive Business Central documentation. No more tab switching or manual searching through docs!

You can find more details about the Microsoft Docs MCP server in their [GitHub repository](https://github.com/microsoftdocs/mcp).

### 2. GitHub MCP Server

While GitHub Copilot for VS Code already has a built-in `githubRepo` tool for repository access, I've found that adding the GitHub MCP server often provides better search results. Both tools can search code in the default branch of repositories you have access to.

<!--more-->

### Configuration

To enable both MCP servers, add the following configuration to your VS Code `settings.json`:

````json
{
    // ... other VS Code settings ...
    "mcp": {
        "servers": {
            "microsoft.docs.mcp": {
                "type": "http",
                "url": "https://learn.microsoft.com/api/mcp"
            },
            "github": {
                "url": "https://api.githubcopilot.com/mcp/"
            }
        }
    }
    // ... more VS Code settings ...
}
````

## The Secret Sauce: Business Central Base Code Access

Here's where it gets really interesting. Stefan Maroń has done incredible work for the Business Central community by maintaining a repository that contains all versions of Business Central Apps: [MSDyn365BC.Code.History](https://github.com/StefanMaron/MSDyn365BC.Code.History).

This repository:
- Holds all versions of the Business Central Apps
- Has separate branches per country-major version
- Allows quick comparison between versions to find changes

### The Challenge and My Solution

Since both the GitHub MCP server and the built-in tools search only the main branch, but Stefan's repository uses different branches for different versions, I created my own repository [fbakkensen/bc-w1](https://github.com/fbakkensen/bc-w1) that:

- Automatically syncs every night with Stefan's repository
- Takes the most recent `W1-*` branch
- Updates my repo's main branch with the latest W1 version

This ensures both the GitHub MCP server and built-in tools always have access to the most recent Business Central base code.

## Real-World Example: Researching Item Tracking

Let me show you how powerful this setup is with a real example. I wanted to understand how Item Tracking is implemented on Sales Lines in Business Central.

### The Prompt

````
Search MS Doc and the github repo with all Business Central Base Code `fbakkensen\bc-w1`
for information on how Item Tracking is implemented on the Sales Line.
Add a Summary from the documentation, and concrete code examples from the repo
````

### The Magic Happens

When I run this prompt, GitHub Copilot springs into action, using both MCP servers (you can see it running both `microsoft_docs_search` and the GitHub MCP server) along with its built-in repository search capabilities:

![GitHub Copilot searching through Microsoft Docs and BC base code repository](/assets/images/2025-06-23-supercharging-business-central-development-with-microsoft-docs-mcp-server-and-github-copilot/CopilotSearch.png)

As you can see, Copilot:
1. Runs `microsoft_docs_search` to search through Microsoft documentation
2. Runs the GitHub MCP server search to find relevant code in the repository
3. Combines findings from both sources
4. Provides a comprehensive analysis

The result? A detailed explanation that includes:

#### Documentation Summary
- Track outbound items using serial numbers, lot numbers, and package numbers
- Assign tracking numbers either automatically from predefined number series or manually
- Select from existing tracking when items already have tracking numbers assigned
- Handle specific scenarios like drop shipments, transfers, and combined shipment/receipt operations

#### Key Implementation Points
- **Accessing Item Tracking**: Navigate to sales document line → Line action → Related Information → Item Tracking Lines
- **Assignment Methods**:
  - Automatic Assignment: Use "Assign Serial No." or "Assign Lot No." actions
  - Manual Entry: Direct input of serial/lot/package numbers
  - Selection from Existing: Choose from available tracking numbers using "Select Entries"

#### Key Methods and Actions Discovered
- `OpenItemTrackingLines()` - Sales Line method to open tracking interface
- `AssignSerialNo()` - Auto-assign serial numbers from number series
- `AssignLotNo()` - Auto-assign lot numbers
- `SelectEntries` - Choose from existing available tracking numbers
- `RegisterItemTrackingLines()` - Save tracking specifications to database

#### Validation and Controls
The analysis also reveals the validation logic:
- Quantity consistency between document line and tracking lines
- Availability checking for outbound tracking numbers
- Item tracking code requirements (serial/lot specific tracking)
- Warehouse activity integration when applicable

### Sample of What I Get Back

Here's the actual response I received from GitHub Copilot - notice how it combines documentation insights with real code examples from the Business Central base application:

#### 1. Main Entry Point - SalesLineReserve.Codeunit.al

````al
procedure CallItemTracking(var SalesLine: Record "Sales Line")
var
    TrackingSpecification: Record "Tracking Specification";
    ItemTrackingLines: Page "Item Tracking Lines";
    IsHandled: Boolean;
begin
    IsHandled := false;
    OnBeforeCallItemTracking(SalesLine, IsHandled);
    if IsHandled then
        exit;

    InitFromSalesLine(TrackingSpecification, SalesLine);
    if ((SalesLine."Document Type" = SalesLine."Document Type"::Invoice) and
        (SalesLine."Shipment No." <> '')) or
       ((SalesLine."Document Type" = SalesLine."Document Type"::"Credit Memo") and
        (SalesLine."Return Receipt No." <> ''))
    then
        ItemTrackingLines.SetRunMode(Enum::"Item Tracking Run Mode"::"Combined Ship/Rcpt");
````

#### 2. Core UI Component - ItemTrackingLines.Page.al

````al
field("Serial No."; Rec."Serial No.")
{
    ApplicationArea = ItemTracking;
    Editable = SerialNoEditable;
    ToolTip = 'Specifies the serial number of the item being handled for the associated document line.';
    ExtendedDatatype = Barcode;

    trigger OnAssistEdit()
    var
        MaxQuantity: Decimal;
    begin
        MaxQuantity := UndefinedQtyArray[1];
        Rec."Bin Code" := ForBinCode;
        ItemTrackingDataCollection.AssistEditTrackingNo(Rec,
            DoSearchForSupply((CurrentSignFactor * SourceQuantityArray[1] < 0) and not InsertIsBlocked),
            CurrentSignFactor, "Item Tracking Type"::"Serial No.", MaxQuantity);
````

#### 3. Tracking Specification Record Structure

````al
local procedure InitFromSalesLine(var TrackingSpecification: Record "Tracking Specification"; SalesLine: Record "Sales Line")
begin
    TrackingSpecification.InitTrackingSpecification(
        Database::"Sales Line", SalesLine."Document Type".AsInteger(), SalesLine."Document No.", '', 0, SalesLine."Line No.",
        SalesLine."Variant Code", SalesLine."Location Code", SalesLine."Qty. per Unit of Measure");
    TrackingSpecification.SetItemData(SalesLine."No.", SalesLine.Description, SalesLine."Location Code", SalesLine."Variant Code", SalesLine."Bin Code", SalesLine."Qty. per Unit of Measure");
````

#### 4. Integration with Reservation System

````al
procedure UpdateItemTrackingAfterPosting(SalesHeader: Record "Sales Header")
var
    ReservationEntry: Record "Reservation Entry";
    CreateReservEntry: Codeunit "Create Reserv. Entry";
begin
    ReservationEntry.Reset();
    ReservationEntry.SetSourceFilter(Database::"Sales Line", SalesHeader."Document Type".AsInteger(), SalesHeader."No.", -1, true);
    ReservationEntry.SetSourceFilter('', 0);
    CreateReservEntry.UpdateItemTrackingAfterPosting(ReservationEntry);
end;
````

#### 5. Special Scenarios - Drop Shipments

````al
if SalesLine."Drop Shipment" then begin
    ItemTrackingLines.SetRunMode(Enum::"Item Tracking Run Mode"::"Drop Shipment");
    if SalesLine."Purchase Order No." <> '' then
        ItemTrackingLines.SetSecondSourceRowID(ItemTrackingManagement.ComposeRowID(
            Database::"Purchase Line",
            1, SalesLine."Purchase Order No.", '', 0, SalesLine."Purch. Order Line No."));
end;
````

#### 6. Warehouse Integration Check

````al
if ItemTrackingMgt.ItemTrkgIsManagedByWhse(
     Rec."Source Type", Rec."Source Subtype", Rec."Source ID",
     Rec."Source Prod. Order Line", Rec."Source Ref. No.", Rec."Location Code", Rec."Item No.")
then
    exit;
````

This comprehensive output shows me exactly how Microsoft implements features, which patterns they use, and how different components interact. I get to see:
- Event-driven architecture with the `OnBeforeCallItemTracking` event
- Integration patterns between different modules
- UI field definitions and triggers
- Database operations and filtering
- Special case handling for various business scenarios

All of this from a single natural language prompt! The combination of documentation context and actual implementation code provides a complete picture that would have taken hours to compile manually.

## Benefits of This Approach

1. **Comprehensive Research**: Get both documentation and actual implementation details in one search
2. **Current Information**: Always working with the latest BC base code
3. **Context-Aware**: Copilot understands the relationship between documentation and code
4. **Time-Saving**: No need to manually search through multiple sources
5. **Learning Tool**: See Microsoft's implementation patterns and best practices

## Setting It Up

To replicate this setup:

1. Install GitHub Copilot for VS Code
2. Configure the MCP servers in your VS Code settings:
   - Add both the Microsoft Docs and GitHub MCP server configurations to your `settings.json`
   - See the [VS Code documentation on MCP servers](https://code.visualstudio.com/docs/copilot/chat/mcp-server) for detailed setup instructions
3. For BC base code access, either:
   - Use my synced repository: `fbakkensen/bc-w1`
   - Create your own sync mechanism with Stefan's repository

## Conclusion

This combination of MCP servers has revolutionized how I approach Business Central development. Instead of spending time searching through documentation and code separately, I can now ask natural language questions and get comprehensive answers that include both theoretical understanding and practical implementation details.

The ability to see how Microsoft actually implements features in the base application is invaluable for:
- Understanding best practices
- Learning proper patterns
- Debugging complex scenarios
- Extending standard functionality

If you're serious about Business Central development, I highly recommend setting up these MCP servers. The initial setup time pays for itself many times over in increased productivity and deeper understanding of the platform.

## Acknowledgments

Special thanks to:
- Stefan Maroń for maintaining the MSDyn365BC.Code.History repository
- Microsoft for providing the MCP server for their documentation
- The GitHub team for the GitHub MCP server

Happy coding, and may your Business Central development be more efficient than ever!

---

*Have questions or want to share your own MCP setup? Feel free to reach out!*