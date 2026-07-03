# Kaidon UI Architecture

## Purpose

This document explains how the Kaidon UI should work across the full app so the
interface stays easy to understand, reusable, and consistent in Next.js.

## System Layers

### App Shell

- Owns routing, page composition, and top-level layout.
- Keeps navigation, global search, and environment controls available.
- Does not own low-level UI primitives.

### Shared Design System

- Lives in `packages/design-system`.
- Exposes reusable primitives, layouts, agent surfaces, and feedback states.
- Normalizes `shadcn/ui`, Watermelon UI, and custom Kaidon patterns.

### Feature Screens

- Compose shared primitives into full pages.
- Own business logic and screen-specific data loading.
- Do not duplicate reusable UI that belongs in the shared package.

## Global Hooks

Use app-wide hooks for cross-cutting UI behavior:

- `useKeyboardShortcuts` for command palette and page actions
- `useGlobalSearch` for agent, run, and log search
- `useWorkspaceSwitcher` for runtime, studio, and cloud context
- `useThemeMode` for brand-consistent theme state
- `useNotificationCenter` for toasts and alerts
- `useLiveAgentState` for current run, status, and progress updates

## Reusable Component Categories

- Navigation and app shell
- Search and command palette
- Status indicators and badges
- Agent cards and run cards
- Trace timelines and step details
- Logs, tables, and metadata rows
- Empty, loading, and error states
- Approvals, confirmations, and destructive-action dialogs
- Marketplace discovery, contract, pricing, and lineage panels

## Data Flow

- Server data enters through page-level loaders or API calls.
- Shared hooks adapt that data for UI consumption.
- Shared components render the normalized view model.
- Feature screens assemble the final composition.

## UI Behavior Rules

- The current state must be scannable in under 2 seconds.
- Active, idle, failed, and deploying states must be distinct.
- Monospace must be used for IDs, timestamps, commands, and logs.
- Accent usage must stay sparse and intentional.
- High-frequency screens must favor density over decorative spacing.

## Implementation Order

1. Define shared tokens and primitives.
2. Build the app shell and navigation.
3. Add global hooks and state adapters.
4. Add reusable agent and run surfaces.
5. Compose feature screens from the shared layer.
6. Add marketplace discovery, governance, and commerce surfaces.

## Rule

- If a pattern appears on two or more screens, move it into the shared layer.
- If a pattern requires global state or keyboard access, make it a hook first.
- If a screen needs a unique composition, keep the logic in the screen and the UI in the shared package.
