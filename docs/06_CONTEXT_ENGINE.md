# Context Engine

## Purpose

Specify how Kaidon assembles, compresses, and governs runtime context.

## Responsibilities

- budget context tokens
- select relevant memory
- include tool state
- include artifact state
- compress history
- produce inspectable context packs

## Design Rule

Context assembly must be explicit and inspectable, never hidden behind one
opaque prompt builder.

## Context Inputs

- user request
- system policy
- current task state
- memory retrievals
- workspace artifacts
- tool capability summaries
- prior checkpoints

## Recommended Output

A typed context pack with:

- ordered segments
- token estimate
- provenance per segment
- inclusion reason
- exclusion reason for major dropped candidates

## Tradeoffs

- More bookkeeping adds complexity.
- It is necessary for debuggability and token governance.

## Alternatives

- simple concatenation: unacceptable at production scale
- model-managed hidden context: non-inspectable

## Verified Facts

- The current product direction emphasizes inspectability.
- AI SDK and modern agent UX patterns benefit from structured, streamable state
  rather than single hidden prompt blobs.

## Assumptions

- Context compression quality becomes a major differentiator over time.

## Speculative Ideas

- Kaidon could support multiple context strategies per run: latency-first,
  accuracy-first, and cost-first.

## Official References

- AI SDK: `https://ai-sdk.dev/docs/introduction`
- OpenAI resources index: `https://developers.openai.com/resources/`
