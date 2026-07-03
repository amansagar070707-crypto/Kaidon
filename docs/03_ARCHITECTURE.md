# Architecture

## Purpose

Define the platform decomposition for Kaidon.

## Top-Level Architecture

1. Agent Language
2. Compiler
3. Runtime
4. Context Engine
5. Memory OS
6. Tool Registry
7. Plugin System
8. Streaming Protocol
9. SDK
10. CLI
11. Studio
12. Cloud Control Plane
13. Marketplace
14. Observability
15. Security

## Design Rule

Each module must own one responsibility and expose typed contracts to adjacent
modules.

## Service Boundaries

### Control Plane

- registry
- deployment metadata
- auth and workspace policy
- configuration

### Data Plane

- runtime execution
- tool calls
- memory lookup
- streaming events
- context assembly

### Developer Plane

- CLI
- SDK
- Studio
- docs and templates

## Recommended Technology Split

- TypeScript: web, SDK, CLI, package tooling
- Go: runtime, scheduler, stream broker, policy-critical services
- PostgreSQL: source of truth
- Redis: short-lived coordination and caches
- NATS: event transport
- Vercel-style cron and workflow scheduling for hosted background jobs

## Why This Split

- Go gives operationally simple concurrency and low startup overhead.
- TypeScript gives fast DX for the edges developers touch most.
- PostgreSQL keeps durability and relational metadata together.
- NATS is a simpler fit than Kafka for low-latency operational events at MVP.

## Tradeoffs

- Two languages increase build complexity.
- Keeping runtime in Go reduces accidental frontend coupling.

## Alternatives

- All TypeScript: faster early velocity, weaker runtime isolation.
- Rust runtime: excellent performance, slower hiring and iteration.
- Kafka instead of NATS: heavier than needed initially.

## Verified Facts

- The current repo already uses TypeScript/Next.js at the product edge.
- The repo documentation already points toward a modular package structure.
- OpenTelemetry is the de facto open standard for traces and metrics.
- Vercel's OSS page lists AI SDK, Workflows, and `eve` under its agent stack.
- Vercel's `eve` page frames agents as directories with markdown instructions,
  TypeScript tools, durable workflows, and scheduled execution.

## Assumptions

- Kaidon will need both local developer mode and multi-service deployment mode.
- Event volume starts moderate, not internet-scale at launch.

## Speculative Ideas

- Over time, Kaidon could expose a lightweight agent kernel API so third-party
  runtimes can implement the same protocol.

## Official References

- OpenTelemetry: `https://opentelemetry.io/docs/`
- Temporal: `https://docs.temporal.io/`
- Dapr: `https://docs.dapr.io/`
- Kubernetes: `https://kubernetes.io/docs/home/`
- Vercel OSS: `https://vercel.com/oss`
- Vercel eve: `https://vercel.com/eve`
- Vercel cron jobs: `https://vercel.com/docs/cron-jobs`
