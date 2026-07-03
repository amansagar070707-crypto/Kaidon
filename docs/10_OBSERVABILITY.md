# Observability

## Purpose

Specify how Kaidon makes runs inspectable.

## Observability Layers

- traces
- logs
- metrics
- events
- replay artifacts
- cost accounting

## Required Event Families

- run lifecycle
- task lifecycle
- context assembly
- memory retrieval
- tool invocation
- approval workflow
- artifact generation
- model request and response metadata

## Design Rule

Every important action must emit a machine-readable event and a human-readable
message.

## Recommendation

Adopt OpenTelemetry for transport and correlation, while defining a Kaidon
event taxonomy above it.

## Tradeoffs

- OpenTelemetry alone is too generic for agent semantics.
- A custom observability stack would be wasteful and brittle.

## Alternatives

- logs only: insufficient
- metrics only: insufficient
- product-specific tracing without OTEL: ecosystem dead end

## Verified Facts

- OpenTelemetry is the open standard for observability instrumentation.
- The Kaidon MVP docs already require traces, logs, metrics, and timeline views.

## Assumptions

- Developers will debug agent systems primarily through correlated event views.

## Speculative Ideas

- Kaidon could add “causal trace slices” that highlight only the events that
  materially changed the outcome of a run.

## Official References

- OpenTelemetry: `https://opentelemetry.io/docs/`
