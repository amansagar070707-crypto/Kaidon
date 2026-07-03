# Benchmarks

## Purpose

Define how Kaidon should evaluate itself technically and experientially.

## Benchmark Categories

- latency
- token efficiency
- run success rate
- recovery success rate
- replay fidelity
- context precision
- tool execution correctness
- operator comprehension time

## Core Benchmarks

1. time to first runnable agent
2. time to first visible trace
3. cancel-to-stop latency
4. checkpoint resume success rate
5. retrieval hit precision
6. UI time-to-understanding for active run state

## Why This Matters

Agent platforms fail when they optimize only for model output quality.

## Tradeoffs

- Benchmarks add discipline and cost.
- Without them, product claims become marketing.

## Alternatives

- anecdotal demos
- model benchmark borrowing without runtime metrics

## Verified Facts

- The directive explicitly calls for evaluation, runtime recovery, and agent UX
  research.

## Assumptions

- Human comprehension of the runtime state is a product KPI, not just a design
  preference.

## Speculative Ideas

- Kaidon could publish an open benchmark suite for agent observability and
  resumability.

## Official References

- OpenTelemetry: `https://opentelemetry.io/docs/`
- Temporal docs: `https://docs.temporal.io/`
