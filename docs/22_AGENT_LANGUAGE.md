# Agent Language

## Purpose

Describe the contract Kaidon should own for agent definitions.

## Required Concepts

- metadata
- model policy
- tool requirements
- memory policy
- run policy
- approval policy
- output schema

## Language Goals

- declarative
- typed
- portable
- compilable
- auditable

## Recommendation

Use a typed JSON-or-TS contract with explicit schemas rather than natural
language-only definitions.

## Tradeoffs

- More structure raises learning cost.
- It enables validation, codegen, and safe deployment.

## Alternatives

- YAML DSL
- prompt-only agents
- framework-specific class inheritance

## Verified Facts

- The Kaidon product direction already requires typed public boundaries.

## Assumptions

- Developers will accept stronger structure if tooling is good.

## Speculative Ideas

- The language can later support both static definitions and compiled graph
  outputs from Studio.

## Official References

- PydanticAI docs: `https://ai.pydantic.dev/`
- AI SDK structured generation concepts: `https://ai-sdk.dev/docs/introduction`
