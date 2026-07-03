# Kaidon

Open-source Agent Operating System for building and running production AI agents.

## Positioning

- Not a chatbot.
- Not a wrapper.
- Not a thin model API client.

This project is the operating layer for agentic software:

- Runtime
- SDK
- CLI
- Studio
- Cloud
- Compilation and validation
- Durable execution
- Tool and plugin registry
- Shared memory and context
- Deployment and rollout
- Observability and operations

## Current State

Early implementation is in progress.

Current repo status:

- monorepo foundation is scaffolded
- shared design-system package exists
- Next.js web shell exists
- runtime and marketplace UI slices are scaffolded

Primary product targets:

- founder spec: [docs/FOUNDERS-BLUEPRINT.md](/D:/aman/aman-personal/agent-os/docs/FOUNDERS-BLUEPRINT.md)
- MVP boundary: [docs/MVP-TARGET.md](/D:/aman/aman-personal/agent-os/docs/MVP-TARGET.md)

## Local Setup

1. Copy `.env.example` to `.env` and set `OPENROUTER_API_KEY`.
2. Install workspace dependencies with `corepack pnpm install`.
3. Start backend services with `npm run dev:backend`.
4. Start the web app with `npm run dev`.

Use `pnpm`, not `npm install`, for dependency installation. This repo is a workspace, and package-local binaries like `next` will be missing if only the root `package-lock.json` path is used.

## Docker

Run the full local stack with:

```bash
docker compose up --build
```

This starts:

- `postgres` on `5432`
- `redis` on `6379`
- `server` on `8000`
- `web` on `3000`

For mixed local development:

- `npm run dev:backend` runs `postgres`, `redis`, and `server` in Docker
- `npm run dev` runs the Next.js web app locally on `3000`
