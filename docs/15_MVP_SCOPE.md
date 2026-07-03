# MVP Scope

## Purpose

Define the minimum acceptable Kaidon MVP.

## In Scope

- agent language
- compiler and validation
- single-runtime durable execution
- checkpoint and retry semantics
- memory and context basics
- tool registry with MCP integration
- streaming runtime UI
- CLI init, validate, run

## Out Of Scope

- enterprise RBAC suite
- paid marketplace workflows
- distributed cluster scheduling
- custom model hosting
- full no-code builder

## Demo Flow

1. define agent
2. validate contract
3. run task
4. inspect context and tool events
5. cancel or resume
6. replay result

## Tradeoffs

- Narrow scope reduces launch glamor.
- It produces a much stronger substrate.

## Verified Facts

- Existing repo docs already define a similar first demonstrable flow.

## Assumptions

- One strong end-to-end path beats many partial surfaces.

## Alternatives

- broader UI-heavy MVP
- marketplace-heavy MVP

## Speculative Ideas

- A coding-agent template and a research-agent template may be enough to prove
  the platform initially.

## Official References

- AI SDK: `https://ai-sdk.dev/docs/introduction`
- MCP: `https://modelcontextprotocol.io/`
