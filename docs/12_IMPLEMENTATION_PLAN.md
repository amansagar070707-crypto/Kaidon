# Implementation Plan

## Purpose

Convert the architecture into execution phases after documentation approval.

## Phase Order

1. monorepo foundation
2. core contracts
3. runtime engine
4. streaming protocol
5. context engine
6. memory OS
7. SDK
8. CLI
9. Studio
10. Cloud
11. Marketplace

## Why This Order

- contracts before services
- runtime before visual builder
- streaming before rich UI
- memory after runtime semantics are stable enough to support it

## Tradeoffs

- Slower UI gratification early.
- Much lower rewrite risk later.

## Alternatives

- studio-first: attractive but fragile
- SDK-first: useful, but risks unstable underlying semantics

## Verified Facts

- The directive explicitly says to stop before implementation.
- Existing repo docs already emphasize modular sequencing.

## Assumptions

- The first shipped runtime flow will be single-agent first, not distributed
  multi-agent.

## Speculative Ideas

- A reference template can be built at the end of phase 4 to validate the
  runtime and streaming contract before broader platform expansion.

## Official References

- Temporal: `https://docs.temporal.io/`
- AI SDK: `https://ai-sdk.dev/docs/introduction`
