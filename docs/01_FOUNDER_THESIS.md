# Kaidon Founder Thesis

## Purpose

Define why Kaidon should exist and what category it should own.

## Thesis

Kaidon should become the open-source operating layer for production AI agents:
the layer between model APIs, tool ecosystems, runtime infrastructure, and
developer-facing products.

## Core Claim

Developers do not need another prompt wrapper. They need a system that makes
agents durable, observable, governable, replayable, and deployable.

## What Kaidon Should Own

- agent contract and compilation boundary
- runtime execution semantics
- context and memory policy enforcement
- tool and plugin governance
- streaming runtime protocol
- observable developer UX
- local-to-cloud deployment path

## What Kaidon Should Not Own

- custom foundation model hosting
- custom vector database
- generic workflow automation for everything
- proprietary tool protocol when MCP already exists
- bespoke tracing protocol when OpenTelemetry already exists

## Why This Category Matters

- model APIs are commoditizing
- tool ecosystems are fragmenting
- agent runtimes are still uneven in recovery and observability
- developers need one operational substrate, not six loosely coupled libraries

## Moat

Kaidon's moat should be the combination of:

- stable runtime semantics
- durable context and memory discipline
- excellent streaming and replay UX
- strong interoperability with existing OSS
- plugin and template ecosystem quality

## Product Test

Every future feature should answer:

1. Does it reduce time from idea to reliable agent?
2. Does it improve operational correctness?
3. Does it keep the system inspectable?
4. Does it reuse proven infrastructure instead of duplicating it?

## Verified Facts

- The current Kaidon repo is separate from Context-OS and should remain so.
- The existing repo already positions Kaidon as an open-source Agent Operating
  System in [README.md](/D:/aman/aman-personal/agent-os/README.md).
- Official AI SDK docs position the AI SDK around model integration and
  generative UI, not as a full operating system. Reference:
  `https://ai-sdk.dev/docs/introduction`
- Temporal documents durable execution as a core workflow primitive. Reference:
  `https://docs.temporal.io/`
- The Model Context Protocol exists as an open protocol for tool and context
  integration. Reference: `https://modelcontextprotocol.io/`

## Assumptions

- The primary user is a developer or technical team, not a no-code operator.
- The product should prioritize reliability and runtime visibility over fast
  demo generation.

## Tradeoffs

- Owning the operating layer is more defensible than building another thin SDK,
  but it is a harder product to explain and ship.
- Interoperability slows initial feature breadth, but reduces long-term
  reinvention and lock-in.

## Alternatives Considered

- Build only an SDK: too narrow.
- Build only a runtime: too infrastructure-heavy and incomplete.
- Build only a studio: risks becoming another AI app builder without durable
  system semantics.

## Speculative Ideas

- Kaidon could eventually become the default execution substrate under several
  higher-level agent products, the way Docker became the default packaging
  substrate under many developer workflows.

## Official References

- AI SDK introduction: `https://ai-sdk.dev/docs/introduction`
- AI Elements: `https://elements.ai-sdk.dev/`
- Temporal docs: `https://docs.temporal.io/`
- Model Context Protocol: `https://modelcontextprotocol.io/`
