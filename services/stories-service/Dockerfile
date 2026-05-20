FROM node:20-bookworm-slim AS base
WORKDIR /app
RUN corepack enable pnpm

FROM base AS dependencies
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY services/stories-service/package.json ./services/stories-service/
COPY packages ./packages
RUN pnpm install --frozen-lockfile

FROM dependencies AS build
COPY services/stories-service ./services/stories-service
COPY turbo.json ./
RUN pnpm --filter stories-service build

FROM base AS runtime
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/services/stories-service/node_modules ./services/stories-service/node_modules
COPY --from=build /app/services/stories-service/dist ./services/stories-service/dist
COPY --from=build /app/services/stories-service/package.json ./services/stories-service/

WORKDIR /app/services/stories-service
EXPOSE 3000
CMD ["node", "dist/main.js"]
