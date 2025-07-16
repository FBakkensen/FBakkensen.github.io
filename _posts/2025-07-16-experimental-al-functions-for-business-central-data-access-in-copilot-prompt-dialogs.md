---
layout: post
title: "Experimental AL Functions for Business Central Data Access in Copilot Prompt Dialogs"
date: 2025-07-16
categories: [Business Central, AI, AOAI, Copilot]
author: Flemming Bakkensen
description: Prototype showing three AL codeunits for natural-language data access in Business Central.
tags: [business central, azure openai, al, copilot]
---

Natural language interfaces for Business Central data access are now possible via Azure OpenAI.
This post reviews a prototype repo, [CopilotAllTablesAndFields](https://github.com/FBakkensen/CopilotAllTablesAndFields), that exposes Business Central tables through three AOAI functions. The goal is to prove technical feasibility, not deliver a turnkey product.

![Copilot Data Explorer in Action](/assets/images/2025-07-16-experimental-al-functions-for-business-central-data-access-in-copilot-prompt-dialogs/copilot-data-explorer.png)

<!--more-->

## Problem: Copilot Needs Generic Access to Business Central Data   <!-- NEW -->
When developing Copilot features in Business Central, it would benificial to have a single, permission-aware interface that can explore, understand and query any table without custom build AOAI codeunits. Today every Copilot must ship its own functions, which slows development and duplicates work. The prototype aims to provide that
missing generic access layer.

## How the Prototype Solves It           <!-- was “What the Prototype Solves” -->
In one reusable pattern, the prototype lets an LLM:
- Discover which Business Central tables a user can read,
- Inspect their fields and metadata,
- Retrieve rows with human-style filters.

## Implementation: Three AOAI Functions  <!-- moved here unchanged -->

This experimental prototype implements three AL function codeunits that demonstrate the `AOAI Function` interface for Business Central data access. These functions establish reusable patterns for building both generic and specialized Copilot data access solutions.

### 1. Get Tables Function - Data Discovery Gateway

**Purpose**: list readable tables
**Highlights**:
- ID, name, caption, type
- Honors user permissions
- Filter by table type

**Example Usage**:
```
// Natural language: "Show me all tables I can access"
// Natural language: "List all Normal tables"
// Natural language: "What System tables are available?"
```

Here's how the core table enumeration works:

```al
procedure GetTables(Arguments: JsonObject): JsonObject
var
    Result: JsonObject;
    TablesArray: JsonArray;
    TableMetadata: Record "Table Metadata";
    TableToken: JsonToken;
begin
    Result := CreateEmptyResult();

    if not TryParseTableType(Arguments, TableTypeFilter) then
        TableTypeFilter := TableType::Normal;

    TableMetadata.SetRange(TableType, TableTypeFilter);
    if TableMetadata.FindSet() then
        repeat
            if HasTablePermission(TableMetadata.ID) then begin
                TableToken := CreateTableInfo(TableMetadata);
                TablesArray.Add(TableToken);
            end;
        until TableMetadata.Next() = 0;

    Result.Add('tables', TablesArray);
    exit(Result);
end;
```

The code filters the table list to show only tables that the current user has permission to read, ensuring users only see data they're authorized to access.

### 2. Get Fields Function - Field Metadata Analysis

**Purpose**: return field metadata
**Highlights**:
- Type, length, relations
- Resolve table by ID/name
- Flags PK, enums, FlowFields

**Example Usage**:
```al
// Natural language: "What fields are in the Customer table?"
// Natural language: "Show me all fields for table 18"
// Natural language: "List Item table fields including FlowFields"
```

The pattern for field discovery shows how to bridge natural language requests with technical metadata:

```al
procedure GetFields(Arguments: JsonObject): JsonObject
var
    Result: JsonObject;
    FieldsArray: JsonArray;
    FieldMetadata: Record "Field";
    RecRef: RecordRef;
begin
    // Resolve table by ID, name, or caption
    if not ResolveTableIdentifier(Arguments, TableId) then begin
        Result.Add('error', 'Table not found or not accessible');
        exit(Result);
    end;

    RecRef.Open(TableId);
    if not RecRef.ReadPermission() then begin
        Result.Add('error', 'Insufficient permissions for table');
        exit(Result);
    end;

    FieldMetadata.SetRange(TableNo, TableId);
    if FieldMetadata.FindSet() then
        repeat
            FieldToken := CreateFieldInfo(FieldMetadata);
            FieldsArray.Add(FieldToken);
        until FieldMetadata.Next() = 0;

    Result.Add('fields', FieldsArray);
    exit(Result);
end;
```

This demonstrates **table resolution** - the AI can ask for "Customer table" and the function resolves it to the correct table ID.

### 3. Get Data Function - Query Execution Engine

**Purpose**: fetch data rows
**Highlights**:
- Standard AL filter ops
- Option text awareness
- Sort, page, select fields

**Example Usage**:
```al
// Natural language: "Show customers from Seattle"
// Natural language: "Get sales orders from last 30 days sorted by amount"
// Natural language: "Show items where inventory is less than 10"
```

The function demonstrates natural language to AL filter translation:

```al
procedure GetData(Arguments: JsonObject): JsonObject
var
    Result: JsonObject;
    RecRef: RecordRef;
    FieldRef: FieldRef;
    FiltersArray: JsonArray;
begin
    if not ResolveTableIdentifier(Arguments, TableId) then
        exit(CreateErrorResult('Table not found'));

    RecRef.Open(TableId);

    // Apply filters from natural language description
    if TryGetJsonArray(Arguments, 'filters', FiltersArray) then
        ApplyFilters(RecRef, FiltersArray);

    // Apply sorting
    if TryGetJsonArray(Arguments, 'sort', SortArray) then
        ApplySorting(RecRef, SortArray);

    // Return results
    DataArray := GetData(RecRef, PageSize, PageNumber);
    Result.Add('data', DataArray);

    exit(Result);
end;

local procedure ApplyFilters(var RecRef: RecordRef; FiltersArray: JsonArray)
begin
    foreach FilterToken in FiltersArray do begin
        FieldName := GetJsonText(FilterToken, 'field');
        Operator := GetJsonText(FilterToken, 'operator');
        Value := GetJsonText(FilterToken, 'value');

        if TryGetFieldRefByName(RecRef, FieldName, FieldRef) then
            ApplyFieldFilter(FieldRef, Operator, Value);
    end;
end;
```

This shows how **natural language queries get translated into AL filters** - the key innovation for making Business Central data accessible through conversational interfaces.

### How the Functions Work Together

The three functions create a complete data access ecosystem:

1. **Discovery Phase**: Use `get_tables` to explore available data sources
2. **Analysis Phase**: Use `get_fields` to understand table structure and relationships
3. **Query Phase**: Use `get_data` to retrieve actual business data

This workflow enables users to naturally progress from "What data is available?" to "How is it structured?" to "Show me the data I need."

## Remaining Issues                      <!-- was “Unresolved Problems” -->
Business Central exposes only limited technical metadata (IDs, field types, captions).
Missing is the *semantic* and *business-logic* context that humans rely on:
- Real-world relationships between tables (e.g., how customer, sales order, and item interact)
- Validation and business rules that drive data integrity
- Usage patterns that reveal which fields matter in typical scenarios

Without this context an LLM:
1. Cannot reliably recommend joins or filters
2. Produces queries that are technically correct but business-irrelevant
3. Requires excessive prompt engineering to handle corner cases

Solving this metadata gap—either by enriching AL, improving APIs, or introducing MCP—is the key challenge this prototype surfaces.

## Alternative Approaches and Community Perspectives

**This experimental approach represents only one potential solution to the complex challenge of AI-driven data access in Business Central.** The community is actively exploring multiple approaches, each with distinct advantages and considerations.

### API-Based Approaches

Stefano Demiliani has proposed an [alternative approach using Business Central APIs](https://demiliani.com/2025/07/08/why-not-start-improving-business-central-apis-definitions-for-supporting-ai/) that focuses on enhancing API metadata for AI consumption rather than creating specialized AL functions. His approach involves:

- **Dynamic API Discovery**: Using the Page Metadata table to dynamically pass available API definitions to LLMs via system prompts
- **Enhanced API Descriptions**: Proposing that Business Central expose Description properties for API elements to provide business context to AI models
- **OpenAPI Specification Support**: Suggesting native OpenAPI specification generation for all APIs (standard, custom, third-party) to improve AI understanding

Stefano's method differs from this AL function experiment by leveraging existing API infrastructure with enhanced metadata rather than implementing new AOAI Function interfaces.

### MCP Server Integration

The Model Context Protocol (MCP) presents another promising avenue for Business Central data access. An upcoming MCP server for Business Central could potentially:

- **Unified Data Access**: Provide standardized interfaces for AI tools
- **Rich Context**: Offer better metadata and relationship understanding
- **Tool Ecosystem**: Enable integration with various AI development tools
- **Future AOAI Support**: Microsoft may add MCP server support to AOAI functions

### Community Input Needed

**This experimental work raises more questions than it answers**, and community collaboration is essential for developing effective solutions:

**Technical Questions**:
- How can we enhance Business Central metadata to better support AI understanding?
- What role should APIs play versus direct AL function integration?
- How can we balance performance, security, and functionality?

**Implementation Questions**:
- Which approach provides the best developer experience?
- How do we handle complex business logic and validation?
- What patterns work best for different types of Copilot features?

### Call for Community Collaboration

**I encourage the community to explore these different approaches and share findings.** Each method has merit, and the best solution may emerge from combining insights across all approaches. Key areas for community exploration include:

1. **Comparative Analysis**: Testing different approaches against the same use cases
2. **Performance Benchmarking**: Measuring response times and resource usage
3. **Developer Experience**: Evaluating ease of implementation and maintenance
4. **Metadata Enhancement**: Developing better ways to capture business context
5. **Integration Patterns**: Finding optimal ways to combine multiple approaches

The future of AI-driven Business Central data access will likely benefit from multiple complementary solutions rather than a single approach.

## Conclusion: An Experimental Starting Point

This experimental prototype provides insights into both the capabilities and limitations of generic natural language data access in Business Central through AL functions. The three AOAI function codeunits—Get Tables, Get Fields, and Get Data—demonstrate technical feasibility while revealing significant challenges that require broader community exploration.

### Key Findings

1. **Generic Functions Have Limitations**: The lack of business context and metadata creates substantial challenges for generic data access in real-world scenarios.

2. **Specialized Functions Show Promise**: Purpose-built functions that understand specific business contexts demonstrate better performance than generic approaches.

3. **Reusable Patterns Identified**: The three-function pattern (discovery, analysis, query) provides a foundation for building specialized solutions.

4. **Metadata Gap Confirmed**: Business Central's limited metadata availability presents a genuine technical challenge requiring alternative approaches.

5. **Multiple Solutions Needed**: No single approach appears sufficient; the community should explore API-based, MCP-based, and hybrid solutions.

## Key Takeaways & Next Steps  <!-- concise replacement -->
- The three-function pattern proves generic access is feasible but business context is missing.
- Rich metadata and exposure of validation/business rules are the next technical hurdles.
- Compare AL-function, enhanced API, and forthcoming MCP approaches and share findings.

*Have input or ideas? Connect with me on [LinkedIn](https://www.linkedin.com/in/flemming-bakkensen/).
Real progress will require both community experimentation **and** Microsoft surfacing richer, business-aware metadata.*
- **Providing a baseline for comparing alternative approaches**

### Community Collaboration Essential

**The challenges identified in this experiment cannot be solved by any single developer or approach.** Progress requires:

- **Collaborative exploration** of multiple technical strategies
- **Shared research** into metadata enhancement approaches
- **Open discussion** of trade-offs between different solutions
- **Combined efforts** to develop comprehensive solutions

Whether through enhanced APIs (as proposed by Stefano Demiliani), upcoming MCP servers, improved AL function patterns, or hybrid approaches, the future of AI-driven Business Central data access will emerge from community collaboration rather than individual experiments.

## Next Steps for Implementation and Community Exploration

To advance the field of AI-driven Business Central data access:

1. **Analyze Multiple Approaches**: Review this [GitHub repository](https://github.com/FBakkensen/CopilotAllTablesAndFields), Stefano Demiliani's [API enhancement proposal](https://demiliani.com/2025/07/08/why-not-start-improving-business-central-apis-definitions-for-supporting-ai/), and upcoming MCP server developments
2. **Test and Compare**: Deploy different experimental approaches in test environments to evaluate their effectiveness
3. **Identify Specific Use Cases**: Determine business scenarios where each approach provides the most value
4. **Share Findings**: Contribute to community knowledge by documenting results and challenges
5. **Collaborate on Solutions**: Work together to address metadata gaps and integration challenges

**The path forward requires community collaboration rather than individual solutions.** Each approach—AL functions, enhanced APIs, MCP servers, or hybrid strategies—contributes valuable insights to solving the broader challenge of intelligent Business Central data access.

---

*I'm actively seeking community input on these approaches and challenges. Have you explored alternative methods for AI-driven Business Central data access? What challenges have you encountered? Connect with me on [LinkedIn](https://www.linkedin.com/in/flemming-bakkensen/) to share your experiences and collaborate on advancing these solutions.*
