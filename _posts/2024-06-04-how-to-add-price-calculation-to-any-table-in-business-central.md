---
layout: post
title: "How to Add Price Calculation to Any Table in Business Central"
date: 2024-06-04
categories: [Business Central, AL, Development]
author: Flemming Bakkensen
description: Learn how to implement the Line With Price interface to add standard price calculation functionality to any table in Business Central, removing the need for temporary Sales Line workarounds.
tags: [business central, price calculation, interface, development, al]
---

## Introduction

As a Business Central developer, you probably have had the request to add a sales price to a field in a table, and the price should be calculated in the same way as in a sales line. Traditionally, you've likely created a temporary sales header and a temporary sales line, called the price calculation, and then retrieved the sales price.

![alt text](/assets/images/2024-06-04-how-to-add-price-calculation-to-any-table-in-business-central/1721174165654.png)

While this is a valid approach, there's a new possibility with the "New sales price experience" (for information on how to enable it, check my previous post on [how to extend price calculation](/2024/06/03/how-to-extend-price-calculation-in-bc/)).

<!--more-->

To add price calculation to any table, you can implement the Interface "Line With Price" from the Base Application. This implementation is then responsible for price calculation for a specific record. In the Base Application, there are several tables where this interface is implemented for.



!["Line With Price" implementations](/assets/images/2024-06-04-how-to-add-price-calculation-to-any-table-in-business-central/1721205787632.png)

## Creating a Buffer Table for Price Calculation

To demonstrate how this interface can be used to implement price calculation for any table, I have created a new temporary table with the fields needed to calculate a price:

```al
table 50200 "Calc. Price Buffer"
{
    Caption = 'CalcPrice';
    TableType = Temporary;

    fields
    {
        field(1; "Key"; Code[10])
        {
            Caption = 'Key';
        }
        field(10; "Price Type"; Enum "Price Type")
        {
            Caption = 'Price Type';
        }
        field(11; "CustomerVendorNo"; Code[20])
        {
            Caption = 'CustomerVendorNo';
            TableRelation =
            if ("Price Type" = const(Sale)) Customer."No."
            else
            if ("Price Type" = const(Purchase)) Vendor."No.";
        }
        field(12; "Price Calculation Method"; Enum "Price Calculation Method")
        {
            Caption = 'Price Calculation Method';
        }
        // ...existing code...
    }
    // ...existing code...
}
```

The full code for the table can be found on my [GitHub](https://github.com/FBakkensen/HowToCalcPriceToAnyTable/blob/main/src/CalcPriceBuffer.Table.al).

Some fields are only needed for certain scenarios. For example, `CustomerVendorNo` is only needed if a customer or vendor specific price is being calculated.

## Implementing the Line With Price Interface

After creating the table, I've implemented the Interface "Line With Price" in the codeunit "Calc. Price Buffer – Price" ([GitHub link](https://github.com/FBakkensen/HowToCalcPriceToAnyTable/blob/main/src/CalcPriceBufferPrice.Codeunit.al)).

I'll highlight some of the main functionality rather than going through every function that's implemented from the Interface. Let me know if you want more details on any specific part.

### The SetLine Function

The first key function is `SetLine`, which sets the record that should be price calculated, and an Enum "Price Type" which defines if it is a Sale or Purchase Price. It's expected that the record contains all information needed for price calculation before calling `SetLine`, like Item No., Quantity, Customer No., and a date. There's also an overload of `SetLine` that takes both a Header Record and Line Record if the information is split between two records, like Sales Header and Sales Line.

```al
codeunit 50200 "Calc. Price Buffer - Price" implements "Line With Price"
{
    var
        CalcPriceBuffer: Record "Calc. Price Buffer";
        PriceSourceList: codeunit "Price Source List";
        CurrPriceType: Enum "Price Type";
        PriceCalculated: Boolean;

    procedure SetLine(PriceType: Enum "Price Type"; Line: Variant)
    begin
        CalcPriceBuffer := Line;
        CurrPriceType := PriceType;
        PriceCalculated := false;
        AddSources();
    end;

    // ...existing code...
}
```

As you can see, the last statement in `SetLine` is a call to the procedure `AddSources`. Sources in this context refer to which customer, vendor, campaign, price group etc. that should be considered for the calculation.

```al
local procedure AddSources()
begin
    PriceSourceList.Init();
    case CurrPriceType of
        CurrPriceType::Sale:
            AddCustomerSources();
        CurrPriceType::Purchase:
            AddVendorSources();
    end;
end;

local procedure AddCustomerSources()
begin
    PriceSourceList.Add("Price Source Type"::"All Customers");
    PriceSourceList.Add("Price Source Type"::Customer, CalcPriceBuffer.CustomerVendorNo);
    PriceSourceList.Add("Price Source Type"::Contact, CalcPriceBuffer."Contact No.");
    AddActivatedCampaignsAsSource();
    PriceSourceList.Add("Price Source Type"::"Customer Price Group", CalcPriceBuffer."Customer Price Group");
    PriceSourceList.Add("Price Source Type"::"Customer Disc. Group", CalcPriceBuffer."Customer Disc. Group");
end;

local procedure AddVendorSources()
begin
    PriceSourceList.Add("Price Source Type"::"All Vendors");
    PriceSourceList.Add("Price Source Type"::Vendor, CalcPriceBuffer.CustomerVendorNo);
    PriceSourceList.Add("Price Source Type"::Contact, CalcPriceBuffer."Contact No.");
end;
```

If needed, it's possible to overwrite the `PriceSourceList` with a new `PriceSourceList` by calling the procedure `SetSources`:

```al
procedure SetSources(var NewPriceSourceList: codeunit "Price Source List")
begin
    PriceSourceList.Copy(NewPriceSourceList);
end;
```

## Connecting Price Calculation with Line With Price

Apart from the record to be calculated, a way to find the right price is also needed. This is done with the "Price Calculation" Interface. By default, Business Central uses an implementation that finds the lowest applicable price. I've previously written about how you can create another implementation of "Price Calculation" in my post on [how to extend price calculation](/2024/06/03/how-to-extend-price-calculation-in-bc/).

In the following, I'll give an overview of how the "Price Calculation" is connected with our implementation of "Line With Price" (Calc. Price Buffer – Price) and our record that needs a price and discount calculated (Calc. Price Buffer).

This is done in the procedure `CalcPrice()` in our Record "Calc. Price Buffer". This is implemented in the same way as it is in the Base App (Sales Line, Purchase Line, etc.):

```al
local procedure CalcPrice()
var
    PriceCalculation: Interface "Price Calculation";
begin
    TestField("Qty. per Unit of Measure");

    GetPriceCalculationHandler(PriceCalculation);

    PriceCalculation.ApplyDiscount();
    PriceCalculation.ApplyPrice(0);
    GetLineWithCalculatedPrice(PriceCalculation);
end;
```

First, another local procedure called `GetPriceCalculationHandler` is called. This procedure first sets our current record in the implementation of Line With Price and then gets the correct Price Calculation Handler based on setup. It then initializes the Price Calculation Handler with our implementation of Line With Price (Calc. Price Buffer – Price). That way, the Price Calculation Handler knows about "Calc. Price Buffer – Price" and will call functions in that codeunit through the Interface "Line With Price":

```al
procedure GetPriceCalculationHandler(var PriceCalculation: Interface "Price Calculation")
var
    PriceCalculationMgt: codeunit "Price Calculation Mgt.";
    LineWithPrice: Interface "Line With Price";
begin
    GetLineWithPrice(LineWithPrice);
    LineWithPrice.SetLine("Price Type", Rec);
    PriceCalculationMgt.GetHandler(LineWithPrice, PriceCalculation);
end;
```

The `ApplyDiscount()` and `ApplyPrice()` methods are then called on the Price Calculation. They work basically the same way. First, `CopyToBuffer()` is called on Calc. Price Buffer – Price. This fills a temporary record of type "Price Calculation Buffer" with all the information needed for Price Calculation:

```al
procedure CopyToBuffer(var PriceCalculationBufferMgt: Codeunit "Price Calculation Buffer Mgt."): Boolean
var
    PriceCalculationBuffer: Record "Price Calculation Buffer";
begin
    PriceCalculationBuffer.Init();
    if not SetAssetSource(PriceCalculationBuffer) then
        exit(false);

    FillBuffer(PriceCalculationBuffer);
    PriceCalculationBufferMgt.Set(PriceCalculationBuffer, PriceSourceList);
    exit(true);
end;

local procedure FillBuffer(var PriceCalculationBuffer: Record "Price Calculation Buffer")
var
    Item: Record Item;
    Resource: Record Resource;
begin
    PriceCalculationBuffer."Price Calculation Method" := CalcPriceBuffer."Price Calculation Method";

    case PriceCalculationBuffer."Asset Type" of
        PriceCalculationBuffer."Asset Type"::Item:
            begin
                PriceCalculationBuffer."Variant Code" := CalcPriceBuffer."Variant Code";
                Item.Get(PriceCalculationBuffer."Asset No.");
                PriceCalculationBuffer."Unit Price" := Item."Unit Price";
                PriceCalculationBuffer."Item Disc. Group" := Item."Item Disc. Group";
                if PriceCalculationBuffer."VAT Prod. Posting Group" = '' then
                    PriceCalculationBuffer."VAT Prod. Posting Group" := Item."VAT Prod. Posting Group";
            end;
        PriceCalculationBuffer."Asset Type"::Resource:
            begin
                PriceCalculationBuffer."Work Type Code" := CalcPriceBuffer."Work Type Code";
                Resource.Get(PriceCalculationBuffer."Asset No.");
                PriceCalculationBuffer."Unit Price" := Resource."Unit Price";
                if PriceCalculationBuffer."VAT Prod. Posting Group" = '' then
                    PriceCalculationBuffer."VAT Prod. Posting Group" := Resource."VAT Prod. Posting Group";
            end;
    end;
    PriceCalculationBuffer."Location Code" := CalcPriceBuffer."Location Code";
    PriceCalculationBuffer."Document Date" := CalcPriceBuffer."Calculation Date";

    // Currency
    PriceCalculationBuffer.Validate("Currency Code", CalcPriceBuffer."Currency Code");
    PriceCalculationBuffer."Currency Factor" := CalcPriceBuffer."Currency Factor";

    // UoM
    PriceCalculationBuffer.Quantity := Abs(CalcPriceBuffer.Quantity);
    PriceCalculationBuffer."Unit of Measure Code" := CalcPriceBuffer."Unit of Measure Code";
    PriceCalculationBuffer."Qty. per Unit of Measure" := CalcPriceBuffer."Qty. per Unit of Measure";
    // Discounts
    PriceCalculationBuffer."Line Discount %" := CalcPriceBuffer."Line Discount %";
    PriceCalculationBuffer."Allow Line Disc." := IsDiscountAllowed();
end;
```

This gives the Price Calculation all the information needed to find the correct price and discount (by default, the lowest price). Finally, the procedure `SetPrice()` in "Calc. Price Buffer – Price" sets the discount/price on the internal representation of the current record (`CalcPriceBuffer`):

```al
procedure SetPrice(AmountType: Enum "Price Amount Type"; PriceListLine: Record "Price List Line")
begin
    case AmountType of
        AmountType::Price:
            case CurrPriceType of
                CurrPriceType::Sale:
                    begin
                        CalcPriceBuffer."Unit Price" := PriceListLine."Unit Price";
                        PriceCalculated := true;
                    end;
                CurrPriceType::Purchase:
                    CalcPriceBuffer."Unit Price" := PriceListLine."Direct Unit Cost";
            end;
        AmountType::Discount:
            CalcPriceBuffer."Line Discount %" := PriceListLine."Line Discount %";
    end;
end;
```

The last step in `CalcPrice` is `GetLineWithCalculatedPrice()`, which gets the internal "Calc. Price Buffer" (where the price and discount are now calculated) from "Calc. Price Buffer – Price" and assigns it to our current `Rec`. This way, the current `Rec` has updated price and discount values:

```al
local procedure GetLineWithCalculatedPrice(var PriceCalculation: Interface "Price Calculation")
var
    Line: Variant;
begin
    PriceCalculation.GetLine(Line);
    Rec := Line;
end;
```

## Conclusion

I hope this explanation makes sense. The full source code can be found on my [GitHub repository](https://github.com/FBakkensen/HowToCalcPriceToAnyTable). Feel free to use it, but treat it as a proof of concept rather than a fully tested solution.