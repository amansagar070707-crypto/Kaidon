# Design System

## Purpose

Set the UI implementation rules for Kaidon.

## Foundation

- shadcn/ui
- Radix UI
- cmdk
- Framer Motion
- Lucide
- AI Elements registry
- publishable component registry package

## Visual Rules

- soft geometry
- thin borders
- restrained panels
- amber accent
- no generic AI gradients

## Token Families

- color
- spacing
- radius
- typography
- motion
- depth

## Component Priorities

- layout shell
- command palette
- timeline
- run cards
- event feed
- tables
- approval dialogs
- artifact viewers
- reusable developer panels

## Tradeoffs

- Using shadcn/ui accelerates implementation.
- Heavy customization still requires discipline to avoid divergence.
- A publishable library needs stricter API compatibility than app-local UI.

## Alternatives

- custom UI from scratch: unnecessary cost
- multiple design libraries mixed freely: inconsistency risk

## Verified Facts

- Repo-local design rules already define the Kaidon palette and component base.
- The directive explicitly prefers shadcn/ui and Radix.
- Vercel's `eve` page describes a markdown-plus-TypeScript agent framework with
  durable workflows and reusable skills.
- AI Elements is positioned as a component library and registry built on top of
  shadcn/ui.

## Assumptions

- The product should optimize for developers spending long sessions in the UI.
- The shared component registry can become a public library if the contracts
  stay stable.

## Speculative Ideas

- The runtime event timeline could become the visual core primitive across most
  Kaidon screens.
- AI Elements registry commands such as `npx ai-elements add ...` may be useful
  for loading proven agent UI patterns into the design system workflow, but the
  Kaidon brand and interaction rules remain authoritative.
- The component layer could later publish as `@kaidon/components` so external
  developers can reuse timelines, traces, approval banners, and developer
  panels without bringing in the full app.

## Official References

- shadcn/ui: `https://ui.shadcn.com/`
- Radix UI: `https://www.radix-ui.com/`
- cmdk: `https://cmdk.paco.me/`
- Framer Motion: `https://www.framer.com/motion/`
- AI Elements: `https://elements.ai-sdk.dev/`
