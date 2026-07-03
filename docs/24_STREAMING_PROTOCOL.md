# Streaming Protocol

## Purpose

Define how Kaidon streams live runtime state.

## Recommendation

Use server-to-client event streaming with structured event frames. Start with
SSE for simplicity. Add WebSocket only where bidirectional control is required.
For scheduled background runs, pair the streaming protocol with Vercel cron or
workflow-style execution when a time-based trigger is needed.

## Why SSE First

- simpler infra
- easier proxy support
- good fit for timeline and progress updates

## Event Types

- snapshot
- delta
- tool.started
- tool.completed
- retrieval.completed
- approval.requested
- artifact.updated
- run.completed

## UI Rule

The UI should never infer hidden runtime state that was not emitted.

## Tradeoffs

- SSE is less flexible than WebSocket.
- It is simpler and usually sufficient for live run inspection.

## Alternatives

- polling
- WebSocket-first

## Verified Facts

- AI SDK emphasizes streaming as a first-class UX primitive.

## Assumptions

- Most Kaidon runtime views are server-to-client dominant, not collaborative
  multiplayer surfaces.

## Speculative Ideas

- A resumable stream cursor could allow replay from an arbitrary event offset.

## Official References

- AI SDK streaming docs root: `https://ai-sdk.dev/docs/introduction`
- OpenTelemetry docs: `https://opentelemetry.io/docs/`
- Vercel cron jobs: `https://vercel.com/docs/cron-jobs`
