# Runtime Protocol

## Purpose

Define the machine-facing contract between compiler, runtime, UI, and SDK.

## Core Objects

- run
- task
- checkpoint
- event
- tool call
- retrieval
- artifact
- approval

## Required Properties

- id
- parent linkage
- state
- timestamps
- correlation ids
- payload
- provenance

## Protocol Rules

- append-only events
- durable state transitions
- idempotent updates where possible
- explicit cancellation semantics

## Tradeoffs

- Rich protocol adds complexity.
- Weak protocol guarantees permanent product ambiguity.

## Alternatives

- ad hoc REST payloads
- UI-defined event shapes

## Verified Facts

- The current repo direction already uses run/task/event concepts.

## Assumptions

- Runtime protocol stability is a larger moat than raw template count.

## Speculative Ideas

- A future public protocol package could be consumed by third-party runtimes.

## Official References

- OpenTelemetry docs: `https://opentelemetry.io/docs/`
- Temporal docs: `https://docs.temporal.io/`
