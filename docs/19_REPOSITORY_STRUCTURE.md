# Repository Structure

## Purpose

Define the desired repository layout before implementation.

## Recommended Layout

```text
agent-os/
  apps/
    web/
    server/
  packages/
    agent-language/
    compiler/
    runtime-protocol/
    runtime-sdk/
    cli-sdk/
    context-engine/
    memory-os/
    tool-registry/
    plugin-system/
    observability/
    authz/
    workspace/
    ui-components/
    component-registry/
  templates/
    research-agent/
    coding-agent/
    support-agent/
  docs/
```

## Rules

- runtime-critical code must not live inside the web app
- contracts must be shareable packages
- docs must explain package boundaries
- reusable component contracts should live in a publishable package, not only
  inside `apps/web`

## Tradeoffs

- More packages increase repo discipline cost.
- They prevent accidental coupling.

## Alternatives

- flat apps-only monolith
- early microservice explosion

## Verified Facts

- The current repo already uses a monorepo with `apps/` and `packages/`.

## Assumptions

- The repo should stay monorepo-based for developer ergonomics.
- The future component library can ship independently while still being sourced
  from the same design and runtime contracts.

## Speculative Ideas

- A future `schemas/` directory may hold generated protocol docs and examples.
- `packages/component-registry` could eventually publish to npm as
  `@kaidon/components` or a similarly scoped package.

## Official References

- pnpm workspaces: `https://pnpm.io/workspaces`
- Turborepo docs: `https://turbo.build/repo/docs`
