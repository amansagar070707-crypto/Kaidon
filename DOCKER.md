# AgentCN (Kaidon) - Docker Setup Guide

Run the entire AgentCN stack in Docker on any machine.

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (v24+)
- [Docker Compose](https://docs.docker.com/compose/install/) (v2.20+)
- An [OpenRouter API key](https://openrouter.ai/keys) (free tier works)

## Quick Start

```bash
# 1. Clone the repo
git clone https://github.com/amansagar070707-crypto/Kaidon.git
cd Kaidon

# 2. Create your .env file
cp .env.example .env
# Edit .env and add your OPENROUTER_API_KEY

# 3. Build and start everything
docker compose up --build -d

# 4. Open in browser
#    Web UI:    http://localhost:3000
#    Server:    http://localhost:8000
```

## Services

| Service | Port | Description |
|---------|------|-------------|
| `web`   | 3000 | Next.js frontend (React 19, AI Elements, Vercel-style UI) |
| `server`| 8000 | Node.js API server (auth, harness, LLM streaming, SSE) |

## Commands

```bash
# Start all services (build first time)
docker compose up --build -d

# Stop all services
docker compose down

# View logs (all services)
docker compose logs -f

# View logs (specific service)
docker compose logs -f web
docker compose logs -f server

# Rebuild after code changes
docker compose up --build -d

# Rebuild a single service
docker compose up --build -d web
docker compose up --build -d server

# Remove everything (including volumes)
docker compose down -v
```

## Environment Variables

Edit `.env` before building:

```env
# Required: Your OpenRouter API key
OPENROUTER_API_KEY=sk-or-v1-...

# Optional: Model to use (default: free open-source model)
OPENROUTER_MODEL=moonshotai/koki-k2:free

# Optional: Enable live LLM generation
OPENROUTER_ENABLE_LIVE_GENERATION=true

# Server ports (already set in docker-compose.yml)
PORT=8000
HOSTNAME=0.0.0.0
```

## First-Time Setup

1. Open http://localhost:3000
2. Click **Signup** to create an account
3. Go to **Marketplace** and pick an approved agent
4. Click **Use Agent** and start chatting

## API Endpoints

```
POST /api/auth/signup     - Create account
POST /api/auth/login      - Login
GET  /api/auth/me         - Current user (needs cookie)
GET  /api/harness         - List harness jobs
POST /api/harness         - Create job
POST /api/harness/:id/run - Execute job
GET  /api/harness/stream  - SSE streaming
POST /api/runtime/research- Simulate research
```

## Troubleshooting

**Build fails:**
```bash
docker compose down -v
docker compose up --build --no-cache
```

**Server can't connect to LLM:**
- Check your `OPENROUTER_API_KEY` in `.env`
- Ensure the key is valid at https://openrouter.ai/keys

**Port already in use:**
```bash
# Change ports in docker-compose.yml
ports:
  - "3001:3000"  # web
  - "8001:8000"  # server
```

**Reset everything:**
```bash
docker compose down -v --rmi all
docker compose up --build -d
```

## Development Without Docker

```bash
# Install dependencies
corepack pnpm install

# Run both server + web
corepack pnpm dev

# Or individually
corepack pnpm dev:server   # http://localhost:8000
corepack pnpm dev:web      # http://localhost:3000

# Run tests
corepack pnpm vitest run
```

## Project Structure

```
Kaidon/
├── apps/
│   ├── web/              # Next.js 15 frontend (React 19)
│   └── server/           # Node.js HTTP API server
├── packages/
│   ├── apl/              # Agent Protocol Layer (types + validation)
│   ├── runtime/          # Task/run state machine
│   ├── harness/          # Agent execution pipeline
│   ├── llm/              # OpenRouter LLM integration
│   ├── tools/            # Tool registry + execution engine
│   ├── memory/           # Encrypted memory store
│   ├── design-system/    # Vercel-style design tokens
│   ├── component-registry/ # Component contracts
│   ├── sdk/              # JS/TS client SDK
│   └── cli/              # CLI (validate, doctor)
├── docker-compose.yml
├── Dockerfile.server
├── Dockerfile.web
└── .env.example
```
