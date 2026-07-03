# Competitor Analysis

## Purpose

Frame where Kaidon should compete, integrate, or deliberately avoid overlap.

## Competitor Map

### Direct Adjacent Infrastructure

- LangGraph
- PydanticAI
- Mastra
- CrewAI
- Trigger.dev
- Temporal

### Developer Product Surfaces

- Cursor
- Claude
- Codex
- Continue
- Cline
- OpenHands

### Hosted Agent Products

- ChatGPT
- Perplexity
- Manus
- Devin
- Replit Agent
- Lovable
- Bolt

## What Developers Use Them For

- fast assisted coding
- search and synthesis
- agentic browsing and execution
- workflow orchestration
- developer ergonomics

## What They Do Well

- Cursor and Codex: integrated developer workflow
- Claude: clear reasoning UX and file-centric task flow
- ChatGPT and Perplexity: broad knowledge and strong search-facing UX
- LangGraph and Temporal: durable execution primitives
- Trigger.dev: developer-friendly background execution model

## What Kaidon Should Not Copy

- chatbot-first home screen as the primary product abstraction
- hidden tool execution
- opaque “thinking” without runtime evidence
- proprietary tool interfaces where open protocols exist

## Where Kaidon Should Integrate

- AI SDK for frontend streaming and generative component transport
- MCP for tool access
- Temporal or Trigger.dev patterns for durable jobs and recovery
- OpenTelemetry for traces, metrics, and logs

## Where Kaidon Should Own The Abstraction

- agent language
- runtime protocol
- event taxonomy
- context assembly policy
- inspection and replay model
- plugin and registry contract

## Strategic Position

Kaidon should be “the operating layer under agent products,” not “the best chat
box.”

## Verified Facts

- AI SDK and AI Elements are focused on UI and model interaction layers.
- Temporal explicitly focuses on durable execution.
- Trigger.dev focuses on background jobs and event-driven workflow execution.
- MCP standardizes tool-facing interoperability.

## Assumptions

- Developers will keep mixing products rather than standardizing on one vendor.
- The winning OSS layer will be the one that composes well with existing tools.

## Tradeoffs

- Competing on polish alone loses to hosted incumbents.
- Competing on infrastructure alone risks weak product adoption.
- Kaidon must bridge both, but start from runtime truth.

## Alternatives

- Compete as a hosted agent product: lower defensibility.
- Compete as an IDE extension first: narrower surface, smaller moat.

## Speculative Ideas

- Kaidon may work best as the “Linux + Docker + GitHub Actions” layer for
  agents, while products like Cursor or Claude remain preferred frontends.

## Official References

- AI SDK: `https://ai-sdk.dev/docs/introduction`
- AI Elements: `https://elements.ai-sdk.dev/`
- Temporal: `https://docs.temporal.io/`
- Model Context Protocol: `https://modelcontextprotocol.io/`
