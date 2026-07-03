# Kaidon Implementation Guide

## Purpose

This guide connects the UI architecture, shared design system, and product
surface map into one implementation reference for Next.js-based work.

## Next.js Folder Structure

```text
apps/web/
  app/
    (marketing)/
    (auth)/
    (runtime)/
    (sdk)/
    (cli)/
    (studio)/
    (cloud)/
    api/
    layout.tsx
    page.tsx
  components/
    shell/
    navigation/
    agent/
    runs/
    traces/
    approvals/
    search/
  hooks/
  lib/
    api/
    state/
    formatters/
    telemetry/
  styles/
  types/
```

## Layer Responsibilities

### `app/`

- Owns route groups, page composition, and server/client boundaries.
- Uses shared components and hooks to assemble screens.
- Keeps feature logic thin and page-specific.

### `components/`

- Holds app-local composition components that are not reusable enough for
  `packages/design-system`.
- May wrap shared primitives into page-specific layouts.
- Must not duplicate shared primitives.

### `hooks/`

- Holds app-wide React hooks for data, UI state, and keyboard behavior.
- Contains reusable client logic that several screens depend on.

### `lib/`

- Holds API clients, state adapters, formatters, and telemetry helpers.
- Keeps non-UI logic out of components.

## Global Hook Signatures

```ts
type UseKeyboardShortcuts = () => {
  register: (scope: string, bindings: ShortcutBinding[]) => void;
  openCommandPalette: () => void;
  focusSearch: () => void;
};

type UseGlobalSearch = () => {
  query: string;
  setQuery: (query: string) => void;
  results: SearchResult[];
  isSearching: boolean;
};

type UseWorkspaceSwitcher = () => {
  workspaceId: string;
  setWorkspaceId: (workspaceId: string) => void;
  workspaceName: string;
};

type UseThemeMode = () => {
  mode: "dark";
  setMode: (mode: "dark") => void;
};

type UseNotificationCenter = () => {
  notify: (notification: NotificationInput) => void;
  dismiss: (id: string) => void;
};

type UseLiveAgentState = () => {
  agentId: string;
  status: "running" | "idle" | "failed" | "deploying" | "waiting";
  steps: AgentStep[];
  lastUpdatedAt: string;
};
```

## Shared Component Inventory

### App Shell

- `AppShell`
- `SidebarNav`
- `TopBar`
- `WorkspaceSwitcher`
- `CommandPaletteTrigger`

### Search and Navigation

- `GlobalSearchInput`
- `CommandPalette`
- `Breadcrumbs`
- `ViewTabs`

### Agent Surfaces

- `AgentCard`
- `AgentStatusPill`
- `AgentSummary`
- `LiveRunTimeline`
- `TraceStepCard`
- `ToolCallCard`
- `MemoryCard`
- `ApprovalBanner`

### Operational Surfaces

- `RunTable`
- `EnvironmentBadge`
- `DeployStatusPanel`
- `ErrorSummary`
- `MetricStrip`
- `LogViewer`

### Feedback and State

- `EmptyState`
- `LoadingSkeleton`
- `ErrorState`
- `ToastCenter`
- `ConfirmDialog`
- `DrawerPanel`

## Page-by-Page UI Map

### Runtime

- Default page: agent inventory and live health
- Detail page: agent status, recent runs, live trace, tools, approvals
- Focus: operational monitoring under time pressure

### SDK

- Default page: SDK overview and install guidance
- Secondary pages: docs, generated code examples, integration samples
- Focus: developer onboarding and correct usage patterns

### CLI

- Default page: command reference and usage examples
- Secondary pages: auth setup, workspace selection, deploy commands, diagnostics
- Focus: fast terminal-first workflows and reproducible setup

### Studio

- Default page: visual agent builder with workflow canvas or staged editor
- Secondary pages: prompt configuration, tool wiring, run preview, approvals
- Focus: composition, iteration, and safe editing

### Cloud

- Default page: environments, deployments, usage, and billing-style summaries
- Secondary pages: secrets, projects, logs, traces, access controls
- Focus: operational control, visibility, and reliability

### Marketplace

- Default page: governed agent discovery with battle cards and filters
- Secondary pages: agent contract, lineage, pricing, approvals, vendor detail
- Focus: trusted reuse, evaluation, and secure consumption

#### Marketplace Page Map

- `app/(marketplace)/page.tsx`: marketplace overview with discovery grid and summary strip
- `app/(marketplace)/agents/[agentId]/page.tsx`: agent detail, contract, lineage, and pricing
- `app/(marketplace)/agents/[agentId]/lineage/page.tsx`: full conversation lineage and trace drill-down
- `app/(marketplace)/agents/[agentId]/approvals/page.tsx`: approval history and request workflow
- `app/(marketplace)/vendors/[vendorId]/page.tsx`: vendor profile, owned agents, and trust signals
- `app/(marketplace)/pricing/page.tsx`: pricing models, usage tiers, and subscription terms

#### Marketplace Screen Composition

- Overview page should compose:
  - `MarketplaceFilterBar`
  - `MarketplaceStatsStrip`
  - `AgentBattleCard`
  - `ApprovalStatusPill`
  - `GovernanceBadge`
- Detail page should compose:
  - `AgentContractCard`
  - `ConversationLineagePanel`
  - `PricingBadge`
  - `CommercePanel`
  - `RequestAccessBanner`
- Approval page should compose:
  - `ConfirmDialog`
  - `ApprovalBanner`
  - `DrawerPanel`
- Vendor page should compose:
  - `AgentBattleCard`
  - `AgentSummary`
  - `MetricStrip`

#### Marketplace State Hooks

- `useMarketplaceSearch`
- `useMarketplaceFilters`
- `useAgentContractSelection`
- `useConversationLineage`
- `useGovernancePolicy`
- `useMarketplacePricing`
- `useApprovalFlow`

## Data and State Flow

- Server data loads at the page or route layer.
- Hooks normalize that data into screen-ready view models.
- Shared components render the normalized view models.
- App-local components handle page composition only.

## Reuse Rules

- If a component or pattern appears on multiple pages, move it to
  `packages/design-system`.
- If a hook or data adapter is reused across multiple screens, move it to
  `apps/web/hooks` or `apps/web/lib`.
- If a surface is only used once and does not repeat, keep it in the screen
  layer.

## Implementation Priority

1. App shell and navigation
2. Shared hooks and state adapters
3. Runtime agent detail and run surfaces
4. SDK and CLI reference surfaces
5. Studio composition surfaces
6. Cloud operations surfaces
7. Marketplace discovery, contract, and lineage surfaces
