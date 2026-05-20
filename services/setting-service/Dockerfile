FROM node:20-bookworm-slim AS base
WORKDIR /app
RUN corepack enable pnpm

FROM base AS dependencies
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY services/setting-service/package.json ./services/setting-service/
COPY packages ./packages
RUN pnpm install --frozen-lockfile

FROM dependencies AS build
COPY services/setting-service ./services/setting-service
COPY turbo.json ./
RUN pnpm --filter setting-service build

FROM base AS runtime
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/services/setting-service/node_modules ./services/setting-service/node_modules
COPY --from=build /app/services/setting-service/dist ./services/setting-service/dist
COPY --from=build /app/services/setting-service/package.json ./services/setting-service/

WORKDIR /app/services/setting-service
EXPOSE 3000
CMD ["node", "dist/main.js"]
