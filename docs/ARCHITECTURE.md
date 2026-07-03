# Agent OS Architecture

## Source Of Truth

This document is a derived architecture reference.
If it conflicts with `FOUNDERS-BLUEPRINT.md`, the blueprint wins.

## Thesis

Agent OS should be a modular platform for building production AI agents with:

- a declarative agent language
- a compiler that validates and packages agent definitions
- a durable runtime that survives failure and restart
- a tool registry based on MCP and native integrations
- shared memory and context services
- a deployment engine for one-command rollout
- observability and AgentOps from day one

## Product Thesis

Most agent tools optimize for demos. Agent OS should optimize for operations.

The platform exists to make one thing easy:

- define an agent
- validate it
- run it durably
- connect tools
- keep context and memory stable
- ship it
- observe it
- recover it

That is the operating layer the current ecosystem is missing.

## Why We Win

The advantage is not a better model wrapper.

The advantage is owning the seams that production systems actually break on:

- durable execution
- memory and context management
- secure tool access
- agent-user interaction
- deployment and recovery
- observability and replay
- workspace and tenant isolation

The model providers will keep changing. The operating layer should not.

## What to reuse

Use proven open-source components instead of rebuilding them.

- Streaming and model I/O: AI SDK
- Durable orchestration and persistence: LangGraph
- User-facing agent interaction protocol: AG-UI
- Frontend agent UX: CopilotKit
- Memory layer: Mem0 patterns and integrations
- Multi-agent flows: CrewAI or LangGraph where appropriate
- Typed agent control and tool schemas: PydanticAI
- Open tool protocol: MCP
- Tracing, metrics, and logs: OpenTelemetry
- Real-time voice and multimodal transport: LiveKit Agents

## What Not To Build

- A second LangChain
- A proprietary model router
- A custom vector database
- A full frontend design system from scratch
- A generalized workflow engine that ignores agent-specific needs

## What Agent OS should own

- Agent Language
- Agent Compiler
- Agent Runtime
- Task registry and recovery
- Runtime memory policy
- Workspace-level isolation
- Plugin and template registry
- Deployment lifecycle
- Cost and eval tracking

## Repository Structure

```text
agent-os/
  docs/
    ARCHITECTURE.md
    IMPLEMENTATION-BLUEPRINT.md
    ROADMAP.md
    DECISIONS.md
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
    marketplace/
    deployment/
    observability/
    security/
    auth/
    workspace/
    telemetry/
    sdk/
    cli/
    integrations/
  templates/
    chat-agent/
    research-agent/
    coding-agent/
    browser-agent/
    rag-agent/
    voice-agent/
    workflow-agent/
```

## Suggested stack

- Frontend: TypeScript, Next.js, React
- Agent UI protocol: AG-UI
- Runtime/core: Go
- Persistence: PostgreSQL
- Vector: pgvector
- Queue/scheduler: durable job queue
- Protocols: MCP, OpenTelemetry
- Auth: existing enterprise auth provider or OIDC-compatible solution

## MVP Scope

The first release should do fewer things, but do them well:

- APL
- compiler validation
- durable runtime
- MCP tool registry
- memory service
- AG-UI compatible frontend protocol
- CLI bootstrap and deploy
- traces, metrics, logs, and replay

Everything else should wait until the runtime proves itself.
