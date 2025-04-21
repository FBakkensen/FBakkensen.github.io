---
layout: post
title: "How to Extend Price Calculation in Business Central"
date: 2024-06-03
categories: [Business Central, AL, Development]
author: Flemming Bakkensen
description: Learn how to implement custom price calculation logic in Business Central by implementing the Price Calculation interface and extending related enums.
tags: [business central, price calculation, interface, extension, al development]
---
![alt text](/assets/images/2024-06-03-how-to-extend-price-calculation-in-bc/1721189069154.png)
## Extending Price Calculation

There are 2 ways to extend Price Calculation in Business Central, either by subscribing to events or by implementing an interface. Both are useable in different scenarios. Here I will make a simple example of how to do it by implementing an Interface. There is more information about extending Price Calculations in the [official documentation](https://learn.microsoft.com/en-us/dynamics365/business-central/dev-itpro/developer/devenv-extending-best-price-calculations).

I will make a little example that adds an additional 10% to the Line Discount % with a maximum of 100%.

<!--more-->

## Feature Management

Before you can extend Price Calculation, the "New sales price experience" has to be enabled under Feature Management. Be aware that this is a non-reversible action. See more in the [Microsoft documentation](https://learn.microsoft.com/en-us/dynamics365/business-central/dev-itpro/administration/feature-management).

You enable it by going to the "Feature Management" Page and find the line that says "Feature Update: New sales pricing experience" and in the Column "Enabled for" select "All Users". Below is a screenshot showing it when it is enabled.

![Feature Management](/assets/images/2024-06-03-how-to-extend-price-calculation-in-bc/1721209371050.png)

## Implementation

### Copy Existing Calculation

As I am planning to mostly do the same as the base Price Calculation but add an additional 10% Line Discount, I will take a copy of the Price Calculation in the Base App. There are different ways to find the source for code in the Base App, one way is using [Stefan Maron's excellent GitHub repository](https://github.com/StefanMaron/MSDyn365BC.Code.History).

As you can see there are 2 codeunits, the one postfixed with V15 is used if the new sales price experience is not enabled, and the V16 one is used when the new sales price experience is enabled as above. I will make a copy of the one postfixed with V16.

![alt text](/assets/images/2024-06-03-how-to-extend-price-calculation-in-bc/1721206416860.png)

I have made a copy of PriceCalculationV16 and renamed the copy to "PriceCalcAdd10PercentDiscount":

```al
codeunit 50100 "PriceCalcAdd10PercentDiscount" implements "Price Calculation"
```

As you can see the codeunit implements the "Price Calculation" interface in the same way as the codeunits from the Base App. This interface is used in the following enum:

```al
enum 7011 "Price Calculation Handler" implements "Price Calculation"
```

### Extending Enums

To use the "PriceCalcAdd10PercentDiscount" I will extend this enum as shown below:

```al
enumextension 50101 "PriceCalcHandlerExt" extends "Price Calculation Handler"
{
    value(50100; AddTenPercentDisc)
    {
        Caption = 'Add 10 Percent Discount';
        Implementation = "Price Calculation" = PriceCalcAdd10PercentDiscount;
    }
}
```

I also need to extend the "Price Calculation Method" enum in the way shown below:

```al
enumextension 50100 "AddTenPercentDisc" extends "Price Calculation Method"
{
    value(50100; AddTenPercentDisc)
    {
        Caption = 'Add 10 Percent Discount';
    }
}
```

This enum can be set in several different places in Business Central and in this way use different Price Calculations for Sales, Purchase, per customer, per vendor, per customer price group etc.

### Implementing "PriceCalcAdd10PercentDiscount" Codeunit

Now the needed objects are in place, and now I'm going to connect the pieces and implement our new logic.

There is a couple of cleanup steps that should be done before implementing the new logic.

One is a subscriber to "OnCompanyInitialize" in the "PriceCalcAdd10PercentDiscount" codeunit, this is there to reset Price Calculation to Default (Lowest Price) when a new company is created. This is not needed in our copy, and should be deleted:

```al
[EventSubscriber(ObjectType::Codeunit, Codeunit::"Company-Initialize", 'OnCompanyInitialize', '', false, false)]
local procedure OnCompanyInitializeHandler()
var
    PriceCalculationMgt: Codeunit "Price Calculation Mgt.";
begin
    // New company gets "Best Price" calculation by default.
    /*
    AddSupportedSetup(TempPriceCalculationSetup);
    PriceCalculationSetup.DeleteAll();
    if TempPriceCalculationSetup.FindSet() then
        repeat
            PriceCalculationSetup := TempPriceCalculationSetup;
            PriceCalculationSetup.Default := true;
            PriceCalculationSetup.Insert();
        until TempPriceCalculationSetup.Next() = 0;
    */
    PriceCalculationMgt.Run();
end;
```

Another cleanup step is in the OnRun Trigger in the "PriceCalcAdd10PercentDiscount" codeunit where there is a reference to "Price Calculation" = "Price Calculation – V16" of the Enum "Price Calculation Handler". This should be changed to our new value "AddTenPercentDisc":

```al
trigger OnRun()
var
    PriceCalculationSetup: Record "Price Calculation Setup";
begin
    PriceCalculationSetup.SetRange(Implementation, PriceCalculationSetup.Implementation::AddTenPercentDisc);
    PriceCalculationSetup.DeleteAll();
    AddSupportedSetup(PriceCalculationSetup);
    PriceCalculationSetup.ModifyAll(Default, true);
end;
```

I could not find any reference to when the OnRun trigger is called, and maybe this could be deleted. If you have any information about this, please leave a comment below.

The connection between our two enums ("Price Calculation Method", "Price Calculation Handler") and our codeunit "PriceCalcAdd10PercentDiscount" is done by subscribing to the "OnFindSupportedSetup". This is already in the codeunit as it is a copy of the one from Base App, but 2 references to our new Enum Values need to be changed:

```al
[EventSubscriber(ObjectType::Codeunit, Codeunit::"Price Calculation Mgt.", 'OnFindSupportedSetup', '', false, false)]
local procedure OnFindImplementationHandler(var TempPriceCalculationSetup: Record "Price Calculation Setup" temporary)
begin
    AddSupportedSetup(TempPriceCalculationSetup);
end;

local procedure AddSupportedSetup(var TempPriceCalculationSetup: Record "Price Calculation Setup" temporary)
begin
    TempPriceCalculationSetup.Init();
    TempPriceCalculationSetup.Validate(Implementation, TempPriceCalculationSetup.Implementation::AddTenPercentDisc);
    TempPriceCalculationSetup.Method := TempPriceCalculationSetup.Method::AddTenPercentDisc;
    TempPriceCalculationSetup.Enabled := not IsDisabled();
    TempPriceCalculationSetup.Default := true;
    TempPriceCalculationSetup.Type := TempPriceCalculationSetup.Type::Purchase;
    TempPriceCalculationSetup.Insert(true);
    TempPriceCalculationSetup.Type := TempPriceCalculationSetup.Type::Sale;
    TempPriceCalculationSetup.Insert(true);
 end;
```

In this example above our new price calculation is made available to both Purchase And Sale.

The last code change is implementing the logic that is actually adding the 10% Line discount. This is done in the procedure "ApplyDiscount()" where I have added a call to a new procedure Add10PercentLineDiscount(TempPriceListLine):

```al
procedure ApplyDiscount()
var
    TempPriceListLine: Record "Price List Line" temporary;
    PriceCalculationBufferMgt: Codeunit "Price Calculation Buffer Mgt.";
    AmountType: Enum "Price Amount Type";
    FoundPrice: Boolean;
begin
    if not HasAccess(CurrLineWithPrice.GetPriceType(), AmountType::Discount) then
        exit;
    if not CurrLineWithPrice.IsDiscountAllowed() then
        exit;
    CurrLineWithPrice.Verify();
    if not CurrLineWithPrice.CopyToBuffer(PriceCalculationBufferMgt) then
        exit;
    if FindLines(AmountType::Discount, TempPriceListLine, PriceCalculationBufferMgt, false) then
        FoundPrice := CalcBestAmount(AmountType::Discount, PriceCalculationBufferMgt, TempPriceListLine);
    if not FoundPrice then
        PriceCalculationBufferMgt.FillBestLine(AmountType::Discount, TempPriceListLine);

    Add10PercentLineDiscount(TempPriceListLine);

    CurrLineWithPrice.SetPrice(AmountType::Discount, TempPriceListLine);
end;

local procedure Add10PercentLineDiscount(var TempPriceListLine: Record "Price List Line" temporary)
begin
    if TempPriceListLine."Line Discount %" <= 90 then
        TempPriceListLine.Validate("Line Discount %", TempPriceListLine."Line Discount %" + 10)
    else
        TempPriceListLine.Validate("Line Discount %", 100);
end;
```

The logic here is that ApplyDiscount first finds the correct TempPriceListLine, then I add the additional 10% Line Discount. Finally, the Line Discount % is set on the source line (Sales Line, Purchase Line, etc.) by calling CurrLineWithPrice.SetPrice(AmountType::Discount, TempPriceListLine).

CurrLineWithPrice is a global variable of the interface "Line With Price". In my next post, I will make an example of how you can use the "Line With Price" interface to add Price Calculation to your own custom table. Instead of doing like I think most of us have done by using a temporary Sales Header and Line.

## How It All Works in Business Central

By default in "Sales & Receivables Setup" the price calculation Method is set to "Lowest Price":

![Sales & Receivables Setup](/assets/images/2024-06-03-how-to-extend-price-calculation-in-bc/1721206300721.png)

And if I create a Sales Order to Customer Adatum Corporation with Item 1896-S, I get a Line Discount % of 0:

![Sales Order with 0% Discount](/assets/images/2024-06-03-how-to-extend-price-calculation-in-bc/1721209449273.png)

But if I on Customer Adatum Corporation set the price calculation to our new implementation "Add 10 Percent Discount":

![Customer Card with Add 10 Percent Discount](/assets/images/2024-06-03-how-to-extend-price-calculation-in-bc/1721209099547.png)

And then create a new Sales Order, I will get a Line Discount % of 10:

![Sales Order with 10% Discount](/assets/images/2024-06-03-how-to-extend-price-calculation-in-bc/1721209501647.png)

This was a little example of how to extend Price Calculation. If you find any errors or have any comments, suggestions, or something you think I could have done better, feel free to comment below.

The source code for this example can be found in my [GitHub repository](https://github.com/FBakkensen/HowToExtendPriceCalc).
