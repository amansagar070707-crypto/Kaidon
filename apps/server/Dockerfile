FROM node:22-alpine AS base
WORKDIR /app
ENV PNPM_HOME=/pnpm
ENV PATH=/pnpm:$PATH
RUN corepack enable

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/server/package.json apps/server/package.json
COPY packages/harness/package.json packages/harness/package.json
COPY packages/llm/package.json packages/llm/package.json
COPY packages/runtime/package.json packages/runtime/package.json
COPY packages/apl/package.json packages/apl/package.json
RUN pnpm install --frozen-lockfile

FROM deps AS build
COPY . .
RUN pnpm --filter @kaidon/server build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8000
ENV HOSTNAME=0.0.0.0
COPY --from=build /app ./
EXPOSE 8000
CMD ["node", "apps/server/src/index.js"]
