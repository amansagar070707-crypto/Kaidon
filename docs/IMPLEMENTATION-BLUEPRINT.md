# Implementation Blueprint

## Source Of Truth

This document is a sequencing aid derived from `FOUNDERS-BLUEPRINT.md`.
It defines implementation order, not product authority.

## Phase 0: Research alignment

- Map each candidate framework to a specific platform layer.
- Reuse what is already good.
- Keep the new platform narrow enough to own the integration seams.

## Phase 1: Core contracts

- Define APL.
- Define runtime task state.
- Define tool contracts.
- Define memory and context contracts.
- Define event and observability contracts.

## Phase 2: Runtime core

- Task registry
- Heartbeats
- Checkpoints
- Cancellation
- Recovery
- Resume after restart
- Streaming events

## Phase 3: Platform services

- Memory service
- Context service
- Tool registry
- Deployment service
- Marketplace service
- Observability service

## Phase 4: Developer experience

- CLI
- Templates
- Local preview
- Benchmarking
- Doctor checks
- Deployment commands

## Phase 5: Enterprise hardening

- Tenant isolation
- RBAC and ABAC
- Secret management
- Audit logging
- Replay and incident analysis
