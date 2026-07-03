# Runtime

## Purpose

Specify how Kaidon should execute agents durably.

## Runtime Responsibilities

- execute runs and tasks
- track state transitions
- manage cancellation and retries
- checkpoint recovery state
- stream observable events
- persist replayable execution history

## Required Semantics

- queued
- starting
- running
- waiting
- checkpointed
- retrying
- succeeded
- failed
- canceled

## Non-Negotiables

- no silent retries
- every tool call emits events
- every retrieval emits events
- every checkpoint is durable
- every run is replayable

## Execution Model

- one run contains one or more tasks
- each task owns a bounded execution scope
- structured concurrency is preferred over unmanaged async fan-out
- child tasks must be cancelable with parent linkage preserved

## Why Not A Pure Workflow Engine

Temporal and Trigger.dev solve generic durable workflows well, but Kaidon still
needs agent-specific semantics:

- prompt and context lineage
- retrieval observability
- tool policy
- human approval
- generative UI events

## Recommendation

Use workflow-engine ideas, but own the agent runtime contract.

## Tradeoffs

- Building a runtime contract is justified.
- Building a general-purpose workflow orchestrator is not.

## Alternatives

- Embed Temporal directly as the runtime abstraction: strong durability, weaker
  domain specificity.
- Build a pure event loop in Node: simpler early, weaker fault isolation.

## Verified Facts

- Temporal documents durable execution, retries, and deterministic workflows.
- Trigger.dev documents background execution and event-driven workflows.

## Assumptions

- Most early Kaidon runs will be IO-heavy rather than CPU-heavy.

## Speculative Ideas

- Kaidon could support a “run capsule” export format for portable replay across
  environments.

## Official References

- Temporal docs: `https://docs.temporal.io/`
- Trigger.dev docs: `https://trigger.dev/docs`
- OpenTelemetry docs: `https://opentelemetry.io/docs/`
