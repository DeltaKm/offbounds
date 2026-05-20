FROM node:20-bookworm-slim AS base
WORKDIR /app
RUN corepack enable pnpm

FROM base AS dependencies
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY services/notification-service/package.json ./services/notification-service/
COPY packages ./packages
RUN pnpm install --frozen-lockfile

FROM dependencies AS build
COPY services/notification-service ./services/notification-service
COPY turbo.json ./
RUN pnpm --filter notification-service build

FROM base AS runtime
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/services/notification-service/node_modules ./services/notification-service/node_modules
COPY --from=build /app/services/notification-service/dist ./services/notification-service/dist
COPY --from=build /app/services/notification-service/package.json ./services/notification-service/

WORKDIR /app/services/notification-service
EXPOSE 3000
CMD ["node", "dist/main.js"]
