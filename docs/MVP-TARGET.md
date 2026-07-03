# MVP Target

## Purpose

This document defines the shipping boundary for the first usable Kaidon MVP.

It narrows the broader founder blueprint into the smallest product that a
developer can install, run, inspect, and extend.

## MVP Outcome

The MVP is successful when a developer can:

- define an agent in a typed specification
- validate and compile that specification
- run the agent in a durable runtime
- connect approved tools through a standard interface
- inspect traces, logs, and status in the UI
- use a CLI to bootstrap, run, and deploy locally
- use a Studio surface to create a simple workflow from prompt to visual graph

## Core User

The MVP targets a developer or small technical team building production-facing
agents.

It does not target non-technical end users, enterprise admins, or marketplace
operators.

## In Scope

### Monorepo Foundation

- runnable workspace
- shared TypeScript configuration
- package boundaries
- build and typecheck scripts

### Core Contracts

- agent specification schema
- runtime event types
- tool contract
- memory contract
- deployment contract

### Runtime

- durable execution state
- retries and status transitions
- streaming event output
- structured failure reporting

### Tooling

- built-in local tools
- MCP-compatible tool boundary
- permission-aware tool invocation contract

### Observability

- trace and run identifiers
- structured logs
- agent event timeline
- status model visible in CLI and UI

### SDK

- create agent definition
- execute agent run
- subscribe to events
- call tools through typed interfaces

### CLI

- init
- validate
- dev
- run
- deploy local

### Web Studio

- app shell
- runtime overview
- marketplace overview stub
- builder MVP surface with:
  - prompt composer
  - visual workflow canvas shell
  - TypeScript SDK view
  - explicit sync status

## Out of Scope

- public marketplace transactions
- multi-tenant enterprise administration
- billing
- custom model hosting
- advanced RBAC and compliance workflows
- production cloud control plane
- full no-code product for non-technical users
- complex multi-agent orchestration studio

## MVP Non-Negotiables

- every shipped module must build
- every public boundary must be typed
- no fake backend behavior
- no placeholder UI for core workflows
- no hidden runtime state
- no silent failures
- every important action must emit observable events

## First Demonstrable Flow

The first complete demo flow for MVP must be:

1. Create an agent from a prompt or spec.
2. Generate a visual workflow and matching SDK representation.
3. Validate the agent definition.
4. Run the agent locally.
5. Inspect status, timeline, and logs in the UI.
6. Re-run or resume after a failure.

## Exit Criteria

The MVP is ready when all of the following are true:

- workspace builds and typechecks cleanly
- one agent template runs end to end
- runtime state is durable across a restart boundary
- tool calls are visible in traces
- the CLI can initialize and run a project locally
- the web UI can inspect runs and show builder sync state
- at least one builder flow works from prompt to runnable local agent

## Sequence

Implementation should continue in this order:

1. Monorepo foundation
2. Core contracts and shared types
3. Runtime engine
4. Event bus and streaming protocol
5. SDK
6. CLI
7. Web UI
8. Built-in tools
9. Templates
10. Marketplace
