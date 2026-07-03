FROM node:22-alpine AS base
WORKDIR /app
ENV PNPM_HOME=/pnpm
ENV PATH=/pnpm:$PATH
RUN corepack enable

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json apps/web/package.json
COPY packages/apl/package.json packages/apl/package.json
COPY packages/cli/package.json packages/cli/package.json
COPY packages/design-system/package.json packages/design-system/package.json
COPY packages/harness/package.json packages/harness/package.json
COPY packages/llm/package.json packages/llm/package.json
COPY packages/memory/package.json packages/memory/package.json
COPY packages/runtime/package.json packages/runtime/package.json
COPY packages/tools/package.json packages/tools/package.json
RUN pnpm install --frozen-lockfile

FROM deps AS build
COPY . .
RUN pnpm --filter @kaidon/web build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

COPY --from=build /app ./

EXPOSE 3000
CMD ["pnpm", "--filter", "@kaidon/web", "start"]
