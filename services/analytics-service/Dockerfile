FROM node:20-bookworm-slim AS base
WORKDIR /app
RUN corepack enable pnpm

FROM base AS dependencies
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY services/analytics-service/package.json ./services/analytics-service/
COPY packages ./packages
RUN pnpm install --frozen-lockfile

FROM dependencies AS build
COPY services/analytics-service ./services/analytics-service
COPY turbo.json ./
RUN pnpm --filter analytics-service build

FROM base AS runtime
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/services/analytics-service/node_modules ./services/analytics-service/node_modules
COPY --from=build /app/services/analytics-service/dist ./services/analytics-service/dist
COPY --from=build /app/services/analytics-service/package.json ./services/analytics-service/

WORKDIR /app/services/analytics-service
EXPOSE 3000
CMD ["node", "dist/main.js"]
