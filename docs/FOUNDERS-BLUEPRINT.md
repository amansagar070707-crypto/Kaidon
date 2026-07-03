# Agent OS Founder's Blueprint

## Source Of Truth

This document is the canonical product specification for Agent OS.

Implementation work must follow this blueprint first.
All other markdown documents in `docs/` are derived from this file and must not
override it.

## Thesis

Agent OS exists to become the operating system layer for production AI agents.

The market already has good pieces:

- model APIs
- agent frameworks
- UI protocols
- memory layers
- orchestration engines
- observability stacks

What is still missing is the platform that makes those pieces behave like a
cohesive operating system for developers.

That missing layer is the product.

## Why This Exists

Most agent projects optimize for demo speed. That is the wrong benchmark.

Developer teams do not fail because they cannot call a model. They fail because
the system around the model is weak:

- context is lost
- tool access is brittle
- state is not durable
- recovery is manual
- observability is shallow
- memory is ungoverned
- deployment is ad hoc
- enterprise controls arrive too late

Agent OS should solve the operating problem, not the prompt problem.

## One-Sentence Positioning

Agent OS is the open-source operating system for building, running, deploying,
and observing production AI agents.

## Elevator Pitch

Agent OS gives developers a standard way to define an agent, compile it into a
validated runtime package, run it durably, connect tools through open
protocols, preserve memory and context, deploy it with one command, and observe
every action with production-grade telemetry.

## Five-Year Vision

In five years, Agent OS should be the default foundation for serious AI agent
applications.

Teams should be able to:

- define agents declaratively
- ship agents with predictable runtime behavior
- reuse tools and templates across projects
- share marketplace assets safely
- inspect every execution
- recover from failures automatically
- move from prototype to production without changing the platform

If the platform works, new products should be built on top of it, not around it.

## Mission

Make it trivial to build reliable AI agents and make it hard to build unsafe
ones.

## Core Principles

- Prefer standards over proprietary protocols.
- Prefer composition over reinvention.
- Prefer durable state over ephemeral chains.
- Prefer observability over speculation.
- Prefer typed contracts over prompt-only behavior.
- Prefer explicit permissions over implicit trust.
- Prefer portable abstractions over framework lock-in.
- Prefer operational correctness over novelty.

## Why Existing Solutions Are Not Enough

The current ecosystem is useful, but fragmented.

### AI SDK

Strong for TypeScript model integration, streaming, and generative UI.
Insufficient as a full operating layer because it does not own durable runtime
state, deployment, or system-level orchestration.

### LangGraph

Strong for durable orchestration and stateful workflows.
Insufficient as a full platform because it is an orchestration runtime, not a
complete developer operating system.

### AG-UI and CopilotKit

Strong for frontend interaction and agent-user experience.
Insufficient as the full backend and deployment substrate.

### PydanticAI and CrewAI

Strong for typed agents and multi-agent workflows.
Insufficient as the standard operating layer across apps, templates, tooling,
memory, and deployment.

### Mem0

Strong for memory patterns and long-term context.
Insufficient as the broader platform for runtime, marketplace, and ops.

### MCP

Strong as the tool protocol.
Not a platform on its own.

### OpenTelemetry

Strong as observability infrastructure.
Not enough without a runtime that emits meaningful agent-level events.

### Temporal, Prefect, Trigger.dev

Strong workflow primitives.
Not enough for agent-specific context, memory, human-in-the-loop, generative
UI, or tool governance.

### LiveKit Agents, Browser Use, Firecrawl, OpenHands, Claude Code, Codex,
Cursor, ChatGPT, Gemini, Perplexity

Excellent point solutions or products.
Not a unified open-source operating system layer for developers.

## What Agent OS Should Own

Agent OS should own the seams that break in production:

- agent specification
- validation and compilation
- runtime execution
- retries and recovery
- tool access
- shared memory and context
- human approval flows
- deployment lifecycle
- traces, logs, metrics, evals, and replay
- workspace and tenant isolation
- registry and marketplace

## Unique Moat

The moat is not a better model wrapper.

The moat is the platform contract and the ecosystem around it.

### Platform Effects

- Every new agent template improves the default starting point.
- Every new tool integration increases the value of the registry.
- Every new runtime event improves observability and debugging.
- Every new memory policy improves context stability.

### Network Effects

- Teams share templates and plugins.
- Marketplace assets accumulate distribution.
- Compatible tools become easier to adopt.
- Standardized runtime contracts lower switching costs inside the ecosystem.

### Hard-to-Replicate Assets

- declarative agent language
- runtime/task semantics
- execution trace history
- plugin registry
- templates and scaffolds
- shared memory conventions
- deployment and recovery semantics

## MVP Scope

The first version should be intentionally narrow.

### In Scope

- declarative agent language
- compiler/validator
- durable runtime core
- tool registry
- memory service
- event and telemetry model
- CLI bootstrap
- deployment command
- AG-UI compatible frontend boundary
- basic templates

### Out of Scope

- full marketplace
- advanced multi-agent coordination platform
- enterprise admin suite
- custom model hosting
- custom vector database
- bespoke workflow engine
- heavy opinionated frontend redesign

## Repository Architecture

```text
agent-os/
  apps/
    web/
    dashboard/
    playground/
  packages/
    apl/
    compiler/
    runtime/
    memory/
    context/
    tools/
    registry/
    deployment/
    observability/
    security/
    auth/
    workspace/
    sdk/
    cli/
    integrations/
  templates/
    chat-agent/
    research-agent/
    coding-agent/
    browser-agent/
    rag-agent/
    support-agent/
    workflow-agent/
  docs/
    ARCHITECTURE.md
    DECISIONS.md
    IMPLEMENTATION-BLUEPRINT.md
    ROADMAP.md
    FOUNDERS-BLUEPRINT.md
```

## Module Responsibilities

### `apl`

Defines the agent language and schema.

### `compiler`

Validates APL, resolves dependencies, computes permissions, and produces
deployable artifacts.

### `runtime`

Executes agents durably with task state, retries, checkpoints, recovery, and
streaming.

### `memory`

Owns short-term and long-term memory, versioning, provenance, and retrieval
policy.

### `context`

Handles context assembly, compression, and budget enforcement.

### `tools`

Registers built-in tools and MCP-backed integrations.

### `registry`

Stores versioned agents, tools, templates, and plugins.

### `deployment`

Builds one-command packaging, rollout, and environment binding.

### `observability`

Owns traces, logs, metrics, evals, replay, and cost tracking.

### `security`

Handles prompt injection policy, memory poisoning defense, and permission
scoping.

### `auth`

Provides tenant, workspace, and identity integration.

### `workspace`

Owns isolation and project-level boundaries.

### `sdk`

Exposes public developer APIs.

### `cli`

Provides the main developer interface.

## Product Thesis by Layer

### Runtime

The runtime should be the thing developers trust.

### Memory

The memory layer should make context stable enough to build serious products.

### CLI

The CLI should make the platform feel fast, local, and productive.

### UI

The UI should make agent state legible, editable, and debuggable.

### Observability

The telemetry layer should make every execution inspectable.

### Registry

The registry should make reuse easy and shipping faster over time.

## Long-Term Roadmap

### MVP

- define the contracts
- compile the contracts
- execute the runtime
- connect tools
- persist memory
- trace everything

### Beta

- templates
- CLI workflows
- preview and replay
- deployment orchestration
- workspace isolation

### v1

- stable SDK
- stable runtime semantics
- public plugin registry
- production observability
- recovery and resume guarantees

### Enterprise

- RBAC
- ABAC
- audit logs
- compliance controls
- tenant boundaries
- secure rollout workflows

### Ecosystem

- shared templates
- verified plugins
- curated marketplace
- partner integrations
- community contributions

### Marketplace

- versioned agents
- versioned tools
- certified templates
- trust and verification metadata

## Success Metrics

### Technical

- runtime success rate
- recovery success rate
- replay completeness
- context hit rate
- latency
- token efficiency

### DX

- time to first agent
- time to first deploy
- template reuse rate
- CLI completion rate
- docs-to-code success rate

### Adoption

- active projects
- active templates
- active integrations
- marketplace installs
- repeated usage across teams

### Business

- retention
- enterprise conversion
- deployment volume
- ecosystem growth
- support burden per project

## Risks

- Overbuilding the specification language.
- Shipping the marketplace before the runtime is stable.
- Trying to support every framework too early.
- Letting the UI become the product instead of the platform.
- Building too much before validating developer demand.

## Design Principles

Every decision should pass these tests:

- Does it reduce developer time to production?
- Does it improve reliability?
- Does it improve observability?
- Does it preserve portability?
- Does it reduce security risk?
- Does it strengthen the platform contract?
- Does it improve reuse?
- Does it keep the system understandable?

## Final Positioning

Agent OS should be described as:

- the open-source operating system for production AI agents
- the layer that turns agent ideas into durable systems
- the platform that makes agent software manageable at scale

It should not be described as:

- another chatbot framework
- another prompt wrapper
- another orchestration toy
- another model API client
