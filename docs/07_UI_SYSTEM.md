# UI System

## Purpose

Describe the product-wide UI philosophy for runtime-first agent software.

## Principles

- dark first
- no chatbot shell as default
- everything streams
- every stage is visible
- every panel is inspectable
- no dead-end status views

## Core Surfaces

- Runtime
- Studio
- SDK
- CLI docs
- Cloud
- Marketplace

## Required Behaviors

- non-blocking updates
- event feed visible by default
- expandable detail without overload
- replayable traces
- consistent command palette

## Information Hierarchy

1. what is happening now
2. what finished
3. what failed
4. what needs approval
5. what the runtime used to decide

## Tradeoffs

- Deep visibility can overwhelm users unless staged carefully.
- Minimalism without evidence becomes fake simplicity.

## Alternatives

- chat transcript UI: familiar, but too weak for runtime operations
- dashboard-heavy ops UI: powerful, but poor for building and editing

## Verified Facts

- The repo brand and design docs already mandate dark-first, restrained,
  infrastructure-grade design.
- AI Elements exists specifically to support composable agent-facing UI.

## Assumptions

- Kaidon users want runtime truth before visual novelty.

## Speculative Ideas

- Kaidon could eventually support multiple UI modes: operator, builder, and
  reviewer.

## Official References

- AI Elements: `https://elements.ai-sdk.dev/`
- AI SDK: `https://ai-sdk.dev/docs/introduction`
