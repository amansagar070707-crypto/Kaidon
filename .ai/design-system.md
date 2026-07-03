# Design System Rules

## Foundation

- Use `shadcn/ui` as the base component foundation.
- Prefer a single shared component layer for the whole app.
- Build reusable primitives before composing pages.
- All app screens must compose from the shared design system, not raw library widgets.
- Match the finalized Kaidon brand exactly; do not reinterpret it.

## Component Selection

- Use `shadcn/ui` first for standard primitives, forms, overlays, and layout building blocks.
- Use `Watermelon UI` when a registry component already matches the needed behavior and visual tone.
- Build a custom component in `packages/design-system` only when neither approved source covers the requirement cleanly.
- Normalize every chosen component through Kaidon tokens, radius, borders, and copy tone before app use.

## Approved Primitives

- Use `Radix UI` primitives where accessibility and interaction behavior matter.
- Use `cmdk` for command-palette interactions.
- Use `Framer Motion` only for intentional motion, not decoration.
- Use `Lucide`, `Hugeicons`, `Tabler Icons`, `Heroicons`, or `Phosphor Icons` for icons.
- Use `Watermelon UI` as an approved React component source when a suitable registry component already exists.

## Design Tokens

- Use tokens for color, spacing, radius, elevation, and motion.
- Use only the approved Kaidon colors:
  - Base: `#0E1116`
  - Panel: `#161A21`
  - Border: `#262B35`
  - Text: `#ECEEF2`
  - Muted text: `#8B93A3`
  - Signal accent: `#F5A623`
  - Secondary: `#6E7BFF`
- Keep the UI dark-mode first and consistent.
- Prefer polished information density over empty decorative space.
- Avoid purple/blue AI gradients, cream/terracotta palettes, and generic near-black plus acid-green branding.
- Border tokens must stay subtle:
  - default border: `#262B35`
  - muted border: `rgba(38, 43, 53, 0.72)`
  - strong border: `rgba(38, 43, 53, 1)`
- Radius tokens must stay tight and consistent:
  - xs: `6px`
  - sm: `8px`
  - md: `12px`
  - lg: `16px`
  - xl: `20px`
- Use `md` as the default surface radius unless a smaller control needs `sm`.

## Tone and Curve

- Use soft geometry with gentle curves, not sharp chrome or glassmorphism.
- Prefer rounded rectangles and subtle arcs over hard-edged panels.
- Keep corner radii moderate and consistent across the product.
- Use thin borders and low-elevation separation instead of heavy shadows.
- Let the amber accent provide energy; keep everything else restrained.
- Preserve calm, confident, infrastructure-grade tone in every surface.

## Library Discipline

- Do not mix unrelated UI libraries inside the same surface unless there is a clear reason.
- Prefer consistency over novelty when choosing UI libraries.
- Reuse components across the app instead of creating one-off variants.
- Treat `shadcn/ui` and `Watermelon UI` as approved component sources, but normalize them through the shared design system before app use.
- Do not import a component directly into an app screen if it belongs in `packages/design-system`.

## Typography

- Use a geometric sans for display and body text.
- Use a monospace face for code, CLI, and data.
- Keep wordmarks bold with tight tracking.

## Reference Benchmarks

- Use the AI SDK design guidance as a hybrid benchmark for tokenized marketing surfaces while keeping Kaidon brand rules authoritative.
- Borrow its structure-first approach to typography scale, spacing discipline, and component state coverage.
- Borrow its UI system patterns, not its content, product voice, or visual brand.
- Do not copy its light visual palette into Kaidon screens; keep Kaidon brand colors authoritative.
- Apply the same implementation rigor: explicit tokens, accessible focus states, and testable component behavior.
- When generating UI, pair this file with [`/.ai/shadcn-skill.md`](./shadcn-skill.md) so component selection follows the installed shadcn workflow.

## Voice

- Present Kaidon as serious infrastructure, not another AI chatbot wrapper.
- Use Kaidon product-line names consistently: Runtime, SDK, CLI, Studio, and Cloud.
- Do not use `AI`, `GPT`, `Bot`, `Brain`, `Mind`, or `Agent` in product names.

## References

- `https://www.untitledui.com/`
- `https://www.typeui.sh/design-skills`
- `https://www.typeui.sh/prompts`
- `https://ui.watermelon.sh/`
