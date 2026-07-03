# Changelog

All notable changes to Kaidon Agent OS are documented here.

## [Unreleased]

### Added

#### Tool Execution Engine (`packages/tools`)
- Full tool execution engine with MCP adapter, HTTP transport, permission checks, and execution logging
- `ToolExecutionLogger` class for tracking tool invocations with stats (success/failure/duration)
- `canExecuteTool()` permission checking before execution
- Built-in tool executors for search, email, billing, approval, and memory tools
- `convertToMCPTools()` and `createMCPHandler()` for MCP protocol integration
- 32 comprehensive tests

#### Server Tests (`apps/server`)
- 18 unit tests for auth-store (register, login, session management)
- 18 unit tests for harness-store (CRUD, actions, research results, progress updates)
- Vitest config updated to include `apps/server/src/**/*.test.js`

#### Streaming LLM Responses (`apps/server`)
- `callOpenRouterLLMStream()` with Server-Sent Events (SSE) token-by-token streaming
- New SSE event types: `llm.token` (per-token), `llm.complete` (stream finished)
- Non-blocking streaming with real-time UI updates
- 3 streaming parser tests (token accumulation, malformed JSON handling, usage extraction)

#### SDK Package (`packages/sdk`)
- `KaidonClient` class with auth, harness, streaming, and health methods
- `KaidonError` class with status codes and error data
- `createKaidon()` factory function
- `subscribeToRun()` for real-time SSE event streaming
- 7 unit tests

#### Registry Website (`apps/web/app/marketplace`)
- Search agents by name, description, or tag
- Filter by status (approved, community, pending, deprecated)
- Sort by rating, downloads, or last updated
- Tag-based filtering with click-to-filter badges
- Publish agent modal with form (name, description, APL contract, version, pricing, tags)
- Agent cards with ratings, download counts, and tool badges
- Empty state with clear filters button

#### Memory Browser Compatibility (`packages/memory`)
- `node:crypto` now loaded via `eval("require")` to hide from webpack static analysis
- Browser fallback: simple XOR encryption without random IV
- `MemoryStore` works in both Node.js and browser environments

### Changed
- Marketplace page upgraded from static to fully interactive with search/filter/sort
- Global CSS updated with form inputs, selects, modals, and modal overlay styles
- Vitest config now includes server tests alongside package tests

## [0.1.0] - 2026-07-01

### Added
- Initial monorepo scaffold with 10 packages
- Next.js 15 web app with App Router and Vercel design system
- Node.js HTTP server with auth, harness, and SSE streaming
- APL (Agent Protocol Language) with 12 tests
- Runtime state machine with 11 tests
- Harness pipeline with 9 tests
- Memory store with encryption and 24 tests
- CLI with `validate` and `doctor` commands
- Dark/light theme toggle with localStorage persistence
- Geist Sans/Mono fonts and Lucide icons
- OpenRouter API integration for LLM calls
