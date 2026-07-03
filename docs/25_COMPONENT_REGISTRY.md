# Component Registry

## Purpose

Define the trusted generative UI registry and the future reusable component
library.

## Rule

Agents do not emit raw HTML. They emit component identifiers, props, and
structured data. The frontend renders only trusted registered components.

The same registry should be publishable as a standalone developer library so
other teams can reuse the Kaidon component contract outside this repository.

## Registry Categories

- cards
- tables
- timelines
- approvals
- logs
- graphs
- artifact viewers
- markdown viewers
- forms
- command surfaces
- developer panels

## Why This Matters

- avoids unsafe HTML generation
- preserves product consistency
- keeps UI observable and testable
- creates a clean path to a publishable component package

## Tradeoffs

- reduced arbitrary UI freedom
- much stronger safety and maintainability
- library packaging adds versioning and API stability requirements

## Alternatives

- freeform HTML generation
- markdown-only rendering
- app-local-only components with no public API

## Verified Facts

- The directive explicitly requires structured component output instead of HTML.
- AI Elements exists as a component library and registry built on top of
  shadcn/ui.

## Assumptions

- Trusted components are a core part of Kaidon's long-term UX moat.
- External developers will want a constrained but polished way to render agent
  state without adopting the whole platform.

## Speculative Ideas

- Kaidon could support registry capabilities with policy labels such as
  "approved for external sharing" or "internal only."
- The registry could later expose a `@kaidon/components` package with versioned
  exports for cards, timelines, traces, and approval flows.

## Official References

- AI Elements: `https://elements.ai-sdk.dev/`
- AI SDK: `https://ai-sdk.dev/docs/introduction`
