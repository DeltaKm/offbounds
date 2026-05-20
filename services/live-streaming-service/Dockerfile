FROM node:20-bookworm-slim AS base
WORKDIR /app
RUN corepack enable pnpm

FROM base AS dependencies
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY services/live-streaming-service/package.json ./services/live-streaming-service/
COPY packages ./packages
RUN pnpm install --frozen-lockfile

FROM dependencies AS build
COPY services/live-streaming-service ./services/live-streaming-service
COPY turbo.json ./
RUN pnpm --filter live-streaming-service build

FROM base AS runtime
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/services/live-streaming-service/node_modules ./services/live-streaming-service/node_modules
COPY --from=build /app/services/live-streaming-service/dist ./services/live-streaming-service/dist
COPY --from=build /app/services/live-streaming-service/package.json ./services/live-streaming-service/

WORKDIR /app/services/live-streaming-service
EXPOSE 3000
CMD ["node", "dist/main.js"]
