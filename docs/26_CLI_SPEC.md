# CLI Spec

## Purpose

Specify the CLI surface.

## Core Commands

- `kaidon init`
- `kaidon validate`
- `kaidon run`
- `kaidon dev`
- `kaidon trace`
- `kaidon deploy`
- `kaidon plugins`

## CLI Principles

- local-first
- composable output
- machine-readable JSON mode
- stable exit codes

## Why CLI Matters

The CLI is the fastest way to make Kaidon feel like infrastructure instead of a
demo product.

## Tradeoffs

- Stable CLI design takes discipline.
- Ad hoc commands create long-term support cost.

## Alternatives

- UI-first workflow
- SDK-only control surface

## Verified Facts

- The directive and current repo both treat CLI as a first-class product line.

## Assumptions

- Serious users will expect CI and terminal automation quickly.

## Speculative Ideas

- The CLI could include a `trace tail` mode for live run inspection without
  opening the web app.

## Official References

- pnpm docs: `https://pnpm.io/`
- Turborepo docs: `https://turbo.build/repo/docs`
