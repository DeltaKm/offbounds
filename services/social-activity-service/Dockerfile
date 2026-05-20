FROM node:20-bookworm-slim AS base
WORKDIR /app
RUN corepack enable pnpm

FROM base AS dependencies
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY services/social-activity-service/package.json ./services/social-activity-service/
COPY packages ./packages
RUN pnpm install --frozen-lockfile

FROM dependencies AS build
COPY services/social-activity-service ./services/social-activity-service
COPY turbo.json ./
RUN pnpm --filter social-activity-service build

FROM base AS runtime
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/services/social-activity-service/node_modules ./services/social-activity-service/node_modules
COPY --from=build /app/services/social-activity-service/dist ./services/social-activity-service/dist
COPY --from=build /app/services/social-activity-service/package.json ./services/social-activity-service/

WORKDIR /app/services/social-activity-service
EXPOSE 3000
CMD ["node", "dist/main.js"]
