# Frontend Rules

- Build from the design system, not ad hoc components.
- Use the approved UI stack consistently: `shadcn/ui`, `Radix UI`, `Lucide`, `cmdk`, `Framer Motion`, and `Watermelon UI`.
- Prefer unified primitives over one-off components from unrelated libraries.
- Read shadcn project context before generating or changing UI code.
- Keep screens information-rich and stateful.
- Show meaningful empty, loading, thinking, streaming, and error states.
- Prefer keyboard-first interaction and strong focus handling.
- Avoid layout shift and avoid generic dashboard UI.

## Decision Order

- Use `shadcn/ui` for the default path.
- Use `Watermelon UI` when it provides a close registry match and still fits Kaidon rules.
- Use `packages/design-system` custom components only when a branded primitive is missing.

## Component Selection Matrix

| Need | Primary choice | Secondary choice | Do not use |
| --- | --- | --- | --- |
| Form controls, dialogs, popovers, tabs, menus, and standard layout primitives | `shadcn/ui` | `packages/design-system` wrapper when branded tokens are required | Raw ad hoc JSX per screen |
| Search, command palette, and dense keyboard-first interactions | `shadcn/ui` plus `cmdk` | `packages/design-system` composition layer | Generic custom dropdowns |
| Registry component already matches the behavior, density, and accessibility needs | `Watermelon UI` | Normalize through `packages/design-system` before app use | Rebuilding the same primitive manually |
| Repeated Kaidon surfaces, agent controls, timeline items, status pills, or brand-specific patterns | `packages/design-system` | App-local wrapper only if the component is truly one-off | Copying component markup into pages |
| Screen-specific page composition with no reuse expected | App route component | Shared layout slots from `packages/design-system` | Moving page-only composition into the shared library |
| Anything with canonical brand, spacing, radius, or tone rules | `packages/design-system` | `shadcn/ui` or `Watermelon UI` only as internal dependencies | Styling directly in the app with local constants |

## Reference Profile

- Use the AI SDK marketing-site rules as a hybrid reference for token discipline, state coverage, and accessibility rigor while keeping Kaidon brand rules authoritative.
- Prefer structured, content-first layouts with clear semantic hierarchy.
- Borrow its UI shape, token discipline, and component state rules.
- Do not borrow its marketing copy, brand voice, or light color treatment.
- Keep typography, spacing, and component states explicit in implementation guidance.
- Treat every interactive component as requiring default, hover, focus-visible, active, disabled, loading, and error states.
- Keep guidance implementation-ready and testable rather than conceptual.
- Treat [`/.ai/design-system.md`](./design-system.md) as the visual and component source of truth.
- Treat [`/.ai/shadcn-skill.md`](./shadcn-skill.md) as the component selection and generation workflow source of truth.

## No-Code Builder Surface

- The first interaction should be a prompt composer that lets the user describe the agent they want to build.
- The prompt composer should support intent-driven input like "I want to make a support agent with billing lookup and approval flow."
- The prompt composer should generate a visual workflow and a TypeScript SDK representation from the same source model.
- The screen should keep visual editing and code editing in sync.
- The UI should show sync state explicitly so the user knows when the visual graph and SDK are aligned.
- The builder should favor dense, tool-oriented layouts over marketing-like whitespace.
- The builder should expose reusable blocks for prompts, tools, memory, approvals, and execution steps.
- The builder should not hide critical state behind menus or modals.

## Should

- Use shadcn component patterns for forms, option groups, and semantic state handling.
- Check the installed component set before introducing a duplicate.
- Use Watermelon UI components when they match the design system and reduce implementation drift.
- Move repeated UI into `packages/design-system` before duplicating it in screens.
