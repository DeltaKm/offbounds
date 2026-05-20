FROM node:20-bookworm-slim AS base
WORKDIR /app
RUN corepack enable pnpm

FROM base AS dependencies
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY services/media-service/package.json ./services/media-service/
COPY packages ./packages
RUN pnpm install --frozen-lockfile

FROM dependencies AS build
COPY services/media-service ./services/media-service
COPY turbo.json ./
RUN pnpm --filter media-service build

FROM base AS runtime
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/services/media-service/node_modules ./services/media-service/node_modules
COPY --from=build /app/services/media-service/dist ./services/media-service/dist
COPY --from=build /app/services/media-service/package.json ./services/media-service/

WORKDIR /app/services/media-service
EXPOSE 3000
CMD ["node", "dist/main.js"]
