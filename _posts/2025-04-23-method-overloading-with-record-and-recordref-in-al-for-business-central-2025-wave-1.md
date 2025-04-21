---
layout: post
title: "Method Overloading with Record and RecordRef in AL for Business Central 2025 Wave 1"
date: 2025-04-21
categories: [Business Central, Development, AL]
author: Flemming Bakkensen
description: Explore method overloading and implicit conversion between Record and RecordRef in AL for Business Central 2025 Wave 1 (BC 26), simplifying development and enabling cleaner code.
tags: ["AL", "Business Central", "Development", "RecordRef"]
---

## Introduction

With Business Central 2025 Wave 1 (BC 26), Microsoft introduced significant improvements to the AL language. One of these enhancements is method overloading combined with implicit conversion between `Record` and `RecordRef`. These improvements simplify development, providing greater flexibility and cleaner code.

In this post, we'll explore practical patterns and best practices for method overloading between `Record` and `RecordRef` in AL 15.0, using standard tables like `Customer` and `Vendor`.

## Method Overloading with Different Records

Here's an example demonstrating overloading procedures using different strongly-typed records:

```al
codeunit 50100 RecordHandler
{
    procedure Archive(var Customer: Record Customer)
    begin
        Customer.Blocked := Customer.Blocked::All;
        Customer.Modify();
    end;

    procedure Archive(var Vendor: Record Vendor)
    begin
        Vendor.Blocked := Vendor.Blocked::All;
        Vendor.Modify();
    end;

    procedure ArchiveRecord(var RecRef: RecordRef)
    begin
        case RecRef.Number of
            Database::Customer:
                Archive(RecRef);
            Database::Vendor:
                Archive(RecRef);
            else
                Error('Unsupported table.');
        end;
    end;
}
```

### Explanation
- **Overloaded `Archive` Procedures**: Clearly defined logic specific to each record type (`Customer` and `Vendor`).
- **Generic `ArchiveRecord` Procedure**: Accepts a `RecordRef` and dispatches to the correct strongly-typed overload using implicit conversion.

## Generic Procedure with RecordRef

This example demonstrates a generic procedure accepting a `RecordRef`, called with different record types:

```al
codeunit 50101 GenericHandler
{
    procedure LogRecordDetails(var RecRef: RecordRef)
    var
        FieldRef: FieldRef;
        FieldText: Text;
        i: Integer;
    begin
        for i := 1 to RecRef.FieldCount do begin
            FieldRef := RecRef.FieldIndex(i);
            FieldText := Format(FieldRef.Value);
            Message('%1: %2', FieldRef.Name, FieldText);
        end;
    end;

    procedure LogDetailsFromCustomer()
    var
        Cust: Record Customer;
    begin
        Cust.Get('10000');
        LogRecordDetails(Cust);
    end;

    procedure LogDetailsFromVendor()
    var
        Vend: Record Vendor;
    begin
        Vend.Get('20000');
        LogRecordDetails(Vend);
    end;
}
```

### Explanation
- **`LogRecordDetails`**: Generic logging mechanism using `RecordRef`, suitable for any record type.
- **Calling Procedures**: Demonstrates calling generic procedures with specific records (`Customer` and `Vendor`).

## Design Patterns and Usage

### When to Use Method Overloading
- **Multiple Record Types**: When similar business logic applies across different table types, use overloading to keep your code clear and maintainable.
- **Type Safety**: Maintain strong typing by creating overloads for each specific record.

### When to Use RecordRef
- **Generic Functionality**: For operations that must handle multiple or unknown tables at runtime (logging, auditing, generic UI actions).
- **Dynamic Processing**: When fields or table structure are determined at runtime.

### Potential Pitfalls
- Always validate `RecordRef` table types before performing conversions.
- Avoid ambiguous overloads; make your method signatures clearly distinct.

## Conclusion

Using method overloading and `RecordRef` strategically enhances code readability, maintainability, and robustness. With these techniques, AL developers can write flexible, high-quality code that leverages Business Central's powerful new capabilities.

---

