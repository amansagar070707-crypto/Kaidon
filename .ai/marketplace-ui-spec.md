# Kaidon Marketplace UI Spec

## Source

This spec translates the marketplace article into Kaidon product UI guidance.
It defines the discovery and governance experience for reusable agents.

## Product Goal

Create a governed marketplace where agents can be discovered, evaluated,
approved, and consumed safely.

## Market Focus

- Start with a specific niche or workflow cluster before broadening scope.
- Prefer a narrow, high-value category over a generic agent directory.
- Surface the bottlenecks the marketplace solves for that niche.

## Agent Structure

Each listed agent should expose these core elements:

- Brain: underlying model or reasoning system
- Instructions: system prompt, rules, and guardrails
- Knowledge: datasets, documents, or knowledge sources
- Tools: available actions and integrations
- Memory: short-term and long-term context

## Primary Screen

### Marketplace Dashboard

- Header with marketplace scope, search, and registration filter.
- Summary strip with counts for registered agents, private agents, approved
  agents, and solutions.
- Main grid of agent battle cards.
- Secondary panel for selected agent contract and lineage preview.

## Core Sections

### 1. Discovery Grid

- Show only registered and governed agents by default.
- Surface search, filter, and sort controls at the top.
- Group cards by solution, domain, or approval status.

### 2. Battle Cards

- Show agent name, owner, version, and approval state.
- Show core metrics:
  - total conversations
  - models used
  - average conversation length
  - average cost per session
  - error rate
  - number of agents in solution
- Include a compact capability summary.
- Use status label + color together for scanning.

### 3. Agent Contract Cards

- Show purpose, role, expertise, tools, inputs, workflow, and guardrails.
- Show business owner and domain.
- Show testing and version history metadata.
- Allow quick compare between agents.

### 4. Conversation Lineage

- Show run or conversation history when access is allowed.
- Allow drill-down into tool calls, functions, and key steps.
- Keep lineage hierarchical and readable.
- Use monospace for IDs, timestamps, and payload snippets.

### 5. Commerce Panel

- Show pricing model, usage model, or subscription terms.
- Show trial, free tier, and paid tier differences if applicable.
- Surface secure payment status and billing readiness.
- Make it clear when an agent is purchasable, request-only, or internal only.

## Governance States

- `approved`
- `private`
- `pending review`
- `rejected`
- `deprecated`
- `request only`
- `paid`
- `free`

## Interaction Rules

- Search must filter registered agents first.
- Private or unapproved agents must not appear in default public discovery.
- Contract and lineage views must be accessible only when policy allows.
- Selection should update detail panels without leaving the page.
- Commerce actions must require a clear price or usage disclosure.
- Human-in-the-loop approval must be visible before any high-impact action.

## Layout Guidance

- Left navigation for product sections.
- Main content for discovery and cards.
- Right-side drawer or panel for contract and lineage detail.
- Dense tables only when browsing history or lineage.

## Visual Guidance

- Keep the marketplace operational, not promotional.
- Avoid marketplace hero sections that look like marketing pages.
- Use the Kaidon dark shell, thin borders, and amber accents.
- Keep status readable at a glance.

## Reusable Components

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

## Shared Hooks

- `useMarketplaceSearch`
- `useMarketplaceFilters`
- `useAgentContractSelection`
- `useConversationLineage`
- `useGovernancePolicy`
- `useMarketplacePricing`
- `useApprovalFlow`

## Launch and Iteration

- Seed the marketplace with a small set of high-quality internal agents first.
- Require governance metadata before listing any new agent.
- Capture feedback and usage telemetry for ongoing improvements.
- Make agent quality, contract completeness, and lineage visibility part of the launch criteria.

## Implementation Rule

- If battle cards, contract cards, or lineage views are reused elsewhere,
  move them into `packages/design-system`.
- If marketplace access or policy state is reused, centralize it in the app
  hooks or lib layer.
