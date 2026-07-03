# Architecture Decisions

## Source Of Truth

This document records implementation decisions derived from
`FOUNDERS-BLUEPRINT.md`.
It must not be treated as a higher authority than the blueprint.

## Decision 1: Go for runtime core

Use Go for the runtime core because the platform needs fast startup, simple
deployment, strong concurrency, and straightforward operational behavior.

## Decision 2: TypeScript for product edge

Use TypeScript for the web app, SDK, and CLI-facing developer experience.

## Decision 3: PostgreSQL as the source of truth

Keep platform state in PostgreSQL. Use pgvector where retrieval needs semantic
search.

## Decision 4: MCP for tools

Use MCP as the standard tool protocol so external systems can be integrated
without custom adapters everywhere.

## Decision 5: OpenTelemetry everywhere

Treat traces, metrics, and logs as first-class platform data, not optional
debugging output.

## Decision 6: Reuse durable OSS

Prefer existing components for streaming, UI interaction, memory patterns, and
voice/multimodal transport.
