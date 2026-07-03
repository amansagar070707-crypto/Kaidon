# Risks

## Purpose

Track the major strategic and technical risks for Kaidon.

## Top Risks

1. building too much before runtime truth is stable
2. turning into a chat UI product
3. creating a proprietary island instead of integrating with OSS
4. weak security boundaries around tools and memory
5. overbuilding multi-agent features too early
6. poor distinction between runtime state and generated UI state

## Product Risks

- hard-to-explain category
- too much ambition in v1
- fragmentation across SDK, CLI, Studio, and Cloud

## Technical Risks

- mixed-language complexity
- event schema churn
- memory quality degradation
- streaming protocol instability

## Mitigations

- lock contracts early
- prefer thin integrations with proven OSS
- enforce documentation before implementation
- benchmark operator comprehension, not only latency

## Verified Facts

- The current directive explicitly asks for research-first and docs-first.

## Assumptions

- The biggest near-term risk is product sprawl, not raw model quality.

## Tradeoffs

- Strong constraints reduce creative drift.
- They may slow experimentation.

## Alternatives

- looser experimentation culture: more ideas, more rewrites

## Speculative Ideas

- Maintain a standing “do not build” list alongside roadmap artifacts.

## Official References

- Kubernetes docs: `https://kubernetes.io/docs/home/`
- OpenTelemetry docs: `https://opentelemetry.io/docs/`
