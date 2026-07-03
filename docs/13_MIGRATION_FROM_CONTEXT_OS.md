# Migration From Context-OS

## Purpose

Capture lessons from Context-OS without continuing that codebase.

## Policy

Context-OS is frozen. Kaidon is a separate repository and a separate product.

## Reusable Ideas

- Docker-first local stack
- PostgreSQL plus Redis service split
- backend-first API ownership
- memory and retrieval as first-class concepts
- workspace-aware orchestration direction

## Anti-Patterns To Avoid

- mixing prototype UI placeholders into core runtime workflows
- unclear separation between generated state and durable state
- letting the memory layer expand without strict provenance
- coupling backend evolution to ad hoc frontend assumptions

## Migration Opportunity

Reframe Context-OS lessons into contracts:

- memory record schema
- retrieval event schema
- workspace isolation model
- auth and session ownership
- run trace protocol

## Technical Debt Signals

- container sprawl without crisp service ownership
- too much behavior implied by UI placeholders
- insufficiently explicit runtime protocol boundaries

## Verified Facts

- Context-OS used a Docker-first service setup with PostgreSQL, Redis, and a
  backend server in the user-provided compose excerpt.
- Context-OS is explicitly frozen by project directive.
- Kaidon must remain in `D:\aman\aman-personal\agent-os` only.

## Assumptions

- Some Context-OS APIs and memory concepts are worth reusing as ideas, not as
  code.

## Tradeoffs

- Starting fresh avoids legacy constraint carryover.
- It loses some short-term velocity from existing implementation assets.

## Alternatives

- continue Context-OS directly: explicitly rejected
- hard fork Context-OS: too much historical coupling

## Speculative Ideas

- A later appendix can map Context-OS concepts to Kaidon contracts one by one
  once the Kaidon specs are approved.

## Official References

- Docker docs: `https://docs.docker.com/`
- PostgreSQL docs: `https://www.postgresql.org/docs/`
- Redis docs: `https://redis.io/docs/`
