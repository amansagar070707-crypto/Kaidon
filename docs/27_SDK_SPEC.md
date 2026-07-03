# SDK Spec

## Purpose

Define the public SDK contract.

## SDK Responsibilities

- create agent definitions
- validate contracts
- start runs
- subscribe to events
- inspect traces
- invoke approved tools through typed adapters

## Language Strategy

- TypeScript SDK first
- protocol-compatible Go client later

## Why TypeScript First

- strongest alignment with current repo
- fastest integration path with Next.js and edge product surfaces

## Tradeoffs

- TypeScript-first delays native Go client ergonomics.
- It accelerates initial adoption.

## Alternatives

- Go-first SDK
- multi-language simultaneous launch

## Verified Facts

- AI SDK shows strong developer appetite for TypeScript-native model and UI
  tooling.

## Assumptions

- Most early Kaidon adopters will come from TS/Node ecosystems.

## Speculative Ideas

- Kaidon may eventually expose generated client SDKs from the runtime protocol.

## Official References

- AI SDK: `https://ai-sdk.dev/docs/introduction`
