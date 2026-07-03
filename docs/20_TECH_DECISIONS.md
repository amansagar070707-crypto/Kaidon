# Tech Decisions

## Purpose

Record the key technology choices.

## Recommended Stack

- TypeScript
- Next.js
- React
- Go
- PostgreSQL
- Redis
- NATS
- MCP
- OpenTelemetry
- Docker
- pnpm
- Turbo

## Decision Rationale

- TypeScript for product edges and developer-facing APIs
- Go for runtime and concurrency-sensitive services
- PostgreSQL as durable source of truth
- Redis for coordination and transient state
- NATS for lightweight event transport
- MCP for tool interoperability
- OpenTelemetry for telemetry standardization

## Tradeoffs

- mixed-language cost
- more operational moving pieces than a single-process app

## Alternatives

- all TypeScript
- Kafka instead of NATS
- SQLite for early local-only state

## Verified Facts

- These technologies are explicitly preferred in the directive.

## Assumptions

- Runtime correctness and observability matter more than minimizing service
  count on day one.

## Speculative Ideas

- Dapr may later be useful for sidecar-style service integration, but should
  not be a day-one dependency.

## Official References

- NATS docs: `https://docs.nats.io/`
- PostgreSQL docs: `https://www.postgresql.org/docs/`
- Redis docs: `https://redis.io/docs/`
- OpenTelemetry docs: `https://opentelemetry.io/docs/`
