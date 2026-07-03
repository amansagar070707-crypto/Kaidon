# `packages/design-system` Rules

## Must

- This package is the only approved place for shared UI primitives.
- App features must consume components from this package instead of building local duplicates.
- Do not put application-specific business logic in this package.

## Should

- Buttons, inputs, dialogs, cards, layouts, typography, navigation, tables, and shared surfaces belong here.
- Agent UI primitives such as timelines, tool cards, memory cards, status indicators, and streaming states belong here if they are reusable.
- Tokens, variants, and composition patterns should live here before they are copied anywhere else.
- Normalize approved external UI components, including Watermelon UI and shadcn-ui sourced patterns, through this package before use in app screens.
- Prefer custom components here only when the approved registries do not cover the need cleanly.
- Marketplace-specific reusable surfaces belong here when they are shared across marketplace pages.

## Scaffold

- `packages/design-system/src/index.ts`
- `packages/design-system/src/tokens/`
- `packages/design-system/src/components/`
- `packages/design-system/src/components/ui/`
- `packages/design-system/src/components/agent/`
- `packages/design-system/src/components/marketplace/`
- `packages/design-system/src/components/layout/`
- `packages/design-system/src/components/navigation/`
- `packages/design-system/src/components/feedback/`
- `packages/design-system/src/components/overlays/`
- `packages/design-system/src/styles/`
- `packages/design-system/src/utils/`
- `packages/design-system/src/types/`

## Must

- `src/index.ts` should export the public component surface.
- `src/tokens/` should define design tokens and shared theme values.
- `src/components/ui/` should hold core primitives and variants.
- `src/components/agent/` should hold reusable agent-specific surfaces.
- `src/components/marketplace/` should hold reusable marketplace cards, lineage, pricing, and governance surfaces.
- `src/components/layout/` should hold shell, panels, and structural patterns.
- `src/components/navigation/` should hold nav, sidebar, and command-surface pieces.
- `src/components/feedback/` should hold toasts, alerts, status, and empty-state patterns.
- `src/components/overlays/` should hold dialogs, drawers, popovers, and menus.
- `src/styles/` should hold shared style entrypoints and theme wiring.
- `src/utils/` should hold helper functions with no UI coupling.
- `src/types/` should hold exported shared types and contracts.

## Should

- Keep the package framework-agnostic where possible within the chosen frontend stack.
- Avoid coupling this package to app routes, pages, or backend services.
- Prefer composition and variants over duplicated components.
- Use the approved UI stack consistently inside the package.
- Every exported component must be documented or self-explanatory.

## Must Not

- Do not bypass this package with direct raw library composition in app screens.
- Do not let imported UI components bypass the Kaidon brand, token, or layout rules.
- Do not create a custom component when an approved shadcn/ui or Watermelon UI component already fits the requirement.

## Should

- If a UI pattern appears in more than one place, move it into this package.
- If a screen needs a new primitive, add it here first.
- Keep the scaffold shallow, stable, and easy to extend.

## Marketplace Inventory

- `MarketplaceFilterBar`
- `MarketplaceStatsStrip`
- `AgentBattleCard`
- `AgentContractCard`
- `ContractCompareDrawer`
- `ConversationLineagePanel`
- `ApprovalStatusPill`
- `GovernanceBadge`
- `PricingBadge`
- `CommercePanel`
- `RequestAccessBanner`
- `MarketplaceVendorCard`
- `MarketplacePricingCard`
