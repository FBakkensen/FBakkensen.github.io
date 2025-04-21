---
layout: post
title: "How to Create Reservation Entries and Item Tracking from AL"
date: 2024-05-29 11:50:00 +0200 # Date and time (optional time/timezone)
categories: BC AL # Optional categories
tags: [BC, AL, Item Tracking, Reservation Entries]   # Optional tags
---
From my experience Reservations and Item Tracking, in Business Central, is quite often a little confusing, especially when it comes to how data is stored, and how a developer creates reservations and item tracking from AL.

To give you a little introduction, I tried to ask [ChatGTP](https://chat.openai.com/chat) about the difference between Item Tracking and Reservations in Business Central, and I think it succeeded quite good.
![alt text](/assets/images/2024-05-29-how-to-create-reservation-entries-and-item-tracking-from-al/1721205769318.png)
After that introduction, I will here try to remove a little bit of the confusing.

<!--more-->

I think, that one of the reasons, that this is a little confusing to many people, is that both Item Tracking and Reservations for non-posted documents and journals is stored in the “Reservation Entry” table.

I will not do a full explanation of how Reservations and Item Tracking is stored in all scenarios. Microsoft has some articles of that, [Microsoft Docs - Item Tracking](https://learn.microsoft.com/en-us/dynamics365/business-central/design-details-item-tracking) and [Microsoft Docs - Reservation](https://learn.microsoft.com/en-us/dynamics365/business-central/design-details-reservation-order-tracking-and-action-messaging#reservation) But for this scenario where I will show to create Item Tracking Lines for a Sales Order and how to create Reservations for a Sales Order from Item Ledger Entries. For this, it is enough to understand the following difference in how data is stored.

## Item Tracking
1. One Record in the Reservation Entry Table with Type set to “Surplus”.
2. One or both of the fields “Lot No.” and “Serial No.” is entered.

## Reservation
1. Two Records in the Reservation Entry Table, both with the Type set to “Reservation”.
2. Both with the same “Entry No.”, but one with “Positive” set to True and the other with “Positive” set to False.
3. One line has a reference to the to reserve for, in this case the Sales Line. the other line has a reference to the line to reserve from, in this case the Item Ledger Entry.
4. If you reserve a specific “Lot No.” and / or “Serial No.”, then the “Lot No.” and “Serial No.” fields is used. In this case where there is a Reservation, there is not a record with type “Surplus” to handle Item Tracking.

To demonstrate how to create reservations and item tracking from AL, I have made a little case. When we are releasing a Sales Order, we want for all Sales Lines, with items using “Expiration Date”, to enter Item Tracking information from the items we have on stock, and do that in the order of when they expire. This is all information that exists in the Item Ledger Entry table.

The User is promted with a question if they only want to have Item Tracking assigned, or they also want to make a reservation.

I will not go through all the code of how to find the relevant Sales Lines and how to find the right Item Tracking information in the Item Ledger Entry table. This can be seen in the full example on my [GitHub](https://github.com/FBakkensen/CreateTrackingAndReservation).

Instead I will focus on the actual scope for this post, creating the record(s) in the Reservation Entry table. One way is to just insert the Record(s) in the Reservation Entry table, like shown below. And as you probably are a master of the Reservation Entry table this works fine.

```al
ReservationEntry.Init();
ReservationEntry.Validate(Positive, FALSE);
ReservationEntry."Entry No." := ReservationEntry.GetLastEntryNo() + 1;
ReservationEntry.Validate("Item No.", ProdOrderLine."Item No.");
ReservationEntry.Validate("Quantity (Base)", ProdOrderLine."Quantity (Base)");
ReservationEntry.Validate("Reservation Status", ReservationEntry."Reservation Status"::Surplus);
ReservationEntry.Validate("Creation Date", WorkDate());
ReservationEntry.Validate("Source Type", DATABASE::"Prod. Order Line");
ReservationEntry.Validate("Source Subtype", 2);
ReservationEntry.Validate("Source ID", ProdOrderLine."Prod. Order No.");
ReservationEntry.Validate("Source Prod. Order Line", ProdOrderLine."Line No.");
ReservationEntry.Validate("Location Code", ProdOrderLine."Location Code");
ReservationEntry.Validate("Item Tracking", ReservationEntry."Item Tracking"::"Lot No.");
ReservationEntry.Validate("Lot No.", 'LOT-001');
ReservationEntry.Validate("Expiration Date", 'CalcExpirationDate(ProdOrderLine."Item No.")');
ReservationEntry.Validate("Created By", copystr(UserId, 1, MaxStrLen(ReservationEntry."Created By")));
ReservationEntry.Insert();
```

For for all of us, that is not the master of the Reservation Entry table, and because it is probably one us that has maintain the above code, I will show you another way, where you don’t need to know in which cases the Reservation Entry is positive or false. This is done by using the Codeunit “Create Reserv. Entry”. Below is shown the procedure from my example that creates the Reservation Entries.

```al
local procedure CreateReservationEntry(SalesLine: Record "Sales Line"; var ItemLedgerEntry: Record "Item Ledger Entry"; RemainQtyToAssign: Decimal; CreateReservation: Boolean): Decimal
var
    TempReservationEntry: Record "Reservation Entry" temporary;
    TempTrackingSpecification: Record "Tracking Specification" temporary;
    Math: Codeunit Math;
    UnitofMeasureManagement: Codeunit "Unit of Measure Management";
    CreateReservEntry: Codeunit "Create Reserv. Entry";
    QtyToAssign: Decimal;
    QtyToAssignBase: Decimal;
begin
    QtyToAssign := Math.Min(ItemLedgerEntry."Remaining Quantity" - ItemLedgerEntry."Reserved Quantity", RemainQtyToAssign);
    if QtyToAssign = 0 then
        exit(QtyToAssign);

    QtyToAssignBase := UnitofMeasureManagement.CalcBaseQty(QtyToAssign, SalesLine."Qty. per Unit of Measure");

    TempReservationEntry."Lot No." := ItemLedgerEntry."Lot No.";
    TempReservationEntry."Serial No." := ItemLedgerEntry."Serial No.";

    CreateReservEntry.CreateReservEntryFor(Database::"Sales Line", SalesLine."Document Type".AsInteger(), SalesLine."Document No.", '', 0,
        SalesLine."Line No.", SalesLine."Qty. per Unit of Measure", QtyToAssign, QtyToAssignBase, TempReservationEntry);

    if CreateReservation then begin
        TempTrackingSpecification.InitTrackingSpecification(Database::"Item Ledger Entry", 0, '', '', 0, ItemLedgerEntry."Entry No.",
            ItemLedgerEntry."Variant Code", ItemLedgerEntry."Location Code", ItemLedgerEntry."Qty. per Unit of Measure");
        TempTrackingSpecification.CopyTrackingFromItemLedgEntry(ItemLedgerEntry);

        CreateReservEntry.CreateReservEntryFrom(TempTrackingSpecification);

        CreateReservEntry.CreateEntry(SalesLine."No.", SalesLine."Variant Code", SalesLine."Location Code", SalesLine.Description, 0D,
            SalesLine."Shipment Date", 0, Enum::"Reservation Status"::Reservation);
    end else begin
        CreateReservEntry.CreateEntry(SalesLine."No.", SalesLine."Variant Code", SalesLine."Location Code", SalesLine.Description, 0D,
            SalesLine."Shipment Date", 0, Enum::"Reservation Status"::Surplus);
    end;
    exit(QtyToAssign);
end;
```

In the scenario where we just want to create Item Tracking but no Reservations, it is the following two calls that is used.

```al
TempReservationEntry."Lot No." := ItemLedgerEntry."Lot No.";
TempReservationEntry."Serial No." := ItemLedgerEntry."Serial No.";

CreateReservEntry.CreateReservEntryFor(Database::"Sales Line", SalesLine."Document Type".AsInteger(), SalesLine."Document No.", '', 0,
        SalesLine."Line No.", SalesLine."Qty. per Unit of Measure", QtyToAssign, QtyToAssignBase, TempReservationEntry);
```

Here we set which Record to assign Item Tracking for, in this case the Sales Line. After that the Reservation Entry of type Surplus is created with following code.

```al
CreateReservEntry.CreateEntry(SalesLine."No.", SalesLine."Variant Code", SalesLine."Location Code", SalesLine.Description, 0D,
            SalesLine."Shipment Date", 0, Enum::"Reservation Status"::Surplus);
```

Then we are done by creating Item Tracking. In the case of a Reservation, we need to both set the Record to reserve for, in this case the Sales Line and the Record to reserve from, in this case the Item Ledger Entry.

```al
//Sales Line
TempReservationEntry."Lot No." := ItemLedgerEntry."Lot No.";
TempReservationEntry."Serial No." := ItemLedgerEntry."Serial No.";

CreateReservEntry.CreateReservEntryFor(Database::"Sales Line", SalesLine."Document Type".AsInteger(), SalesLine."Document No.", '', 0,
        SalesLine."Line No.", SalesLine."Qty. per Unit of Measure", QtyToAssign, QtyToAssignBase, TempReservationEntry);

//Item Ledger Entry
TempTrackingSpecification.InitTrackingSpecification(Database::"Item Ledger Entry", 0, '', '', 0, ItemLedgerEntry."Entry No.",
            ItemLedgerEntry."Variant Code", ItemLedgerEntry."Location Code", ItemLedgerEntry."Qty. per Unit of Measure");
TempTrackingSpecification.CopyTrackingFromItemLedgEntry(ItemLedgerEntry);

CreateReservEntry.CreateReservEntryFrom(TempTrackingSpecification);
```

When we are creating a reservation then we, as described above, need two entries in the Reservation Entry table of type Reservation. These are both created with the following piece of code.

```al
CreateReservEntry.CreateEntry(SalesLine."No.", SalesLine."Variant Code", SalesLine."Location Code", SalesLine.Description, 0D,
                SalesLine."Shipment Date", 0, Enum::"Reservation Status"::Reservation);
```

I hope this was usefull, as alway you are free to use my code, but be aware that this is not fully tested, and if you look at my full example fom my [GitHub](https://github.com/FBakkensen/CreateTrackingAndReservation) there is some limitations in my code, regarding how I find the relevant Item Ledger Entries and Unit Of Measure, that needs to resolved in a real life scenario.
