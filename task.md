# Kaidon Build Task

## Goal

Build Kaidon into a fast, modern, production-grade platform for creating AI agents and agentic applications.

First MVP direction:

- an automation harness for agent assignment
- a request comes in from the user
- the system turns that request into a structured work item
- an assigned agent generates the target AI agent
- the generated agent is validated, tracked, and surfaced in the UI

The product direction is closer to Emergent than a traditional no-code app:

- natural-language driven app building
- full-stack generation
- production-ready code output
- trusted agentic infrastructure
- web-first control plane
- mobile-capable surface where it matters

## What We Are Building

Kaidon is the operating layer for production AI agents.

Core product areas:

- `APL` agent specification
- compiler and validation
- durable runtime task execution
- tool registry
- memory and context management
- observability and replay
- CLI bootstrap and validation
- web UI for runtime, SDK, CLI, studio, cloud, and marketplace
- OpenRouter-first LLM routing with open-source model defaults

## Product Direction

Use these product constraints:

- build full-stack apps and agent workflows quickly
- keep the interface dense, clear, and operational
- favor trusted infrastructure over toy demos
- expose state, not just prompts
- make generated code real and editable
- keep shared UI in `packages/design-system`
- use `Next.js`, `shadcn/ui`, `Radix UI`, `Lucide`, `cmdk`, and `Framer Motion` where appropriate
- keep Kaidon dark, minimal, and infrastructure-focused
- respect accessibility, keyboard support, and visible focus states
- use OpenRouter as the default provider abstraction for LLM access
- prefer open-source models first unless a specific exception is required

## Build Rules

- Implement in small runnable slices.
- Prefer vertical slices over big-bang backend-only or UI-only work.
- Keep contracts explicit before implementation.
- Reuse shared packages instead of duplicating logic in app routes.
- Do not invent placeholder strategy docs.
- Keep the workspace buildable after each slice.

## Current MVP Order

1. Agent assignment harness
2. Core contract packages
3. Runtime task model
4. Tool registry
5. Memory and context model
6. CLI validation/bootstrap
7. Runtime trace and detail screens
8. Studio/agent builder shell
9. Cloud and marketplace surfaces later

## Immediate Next Work

Continue from the current workspace and add:

- agent assignment harness that accepts a user request and produces a work item
- generated AI agent contract from the assigned work item
- checkpoint and retry semantics
- sample agent spec fixture for CLI validation
- builder-style studio shell for generating apps and agents

## Acceptance Criteria

- `npm run dev` starts the web app
- `pnpm -r typecheck` passes
- `pnpm -r build` passes
- CLI can validate a sample agent JSON
- web UI shows real contract/state data, not fake-only placeholder screens
- harness can accept a request and emit an assigned agent generation task
