FROM node:20-bookworm-slim AS base
WORKDIR /app
RUN corepack enable pnpm

FROM base AS dependencies
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY services/dashboard-creator-service/package.json ./services/dashboard-creator-service/
COPY packages ./packages
RUN pnpm install --frozen-lockfile

FROM dependencies AS build
COPY services/dashboard-creator-service ./services/dashboard-creator-service
COPY turbo.json ./
RUN pnpm --filter dashboard-creator-service build

FROM base AS runtime
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/services/dashboard-creator-service/node_modules ./services/dashboard-creator-service/node_modules
COPY --from=build /app/services/dashboard-creator-service/dist ./services/dashboard-creator-service/dist
COPY --from=build /app/services/dashboard-creator-service/package.json ./services/dashboard-creator-service/

WORKDIR /app/services/dashboard-creator-service
EXPOSE 3000
CMD ["node", "dist/main.js"]
