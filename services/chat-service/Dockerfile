FROM node:20-bookworm-slim AS base
WORKDIR /app
RUN corepack enable pnpm

FROM base AS dependencies
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY services/chat-service/package.json ./services/chat-service/
COPY packages ./packages
RUN pnpm install --frozen-lockfile

FROM dependencies AS build
COPY services/chat-service ./services/chat-service
COPY turbo.json ./
RUN pnpm --filter chat-service build

FROM base AS runtime
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/services/chat-service/node_modules ./services/chat-service/node_modules
COPY --from=build /app/services/chat-service/dist ./services/chat-service/dist
COPY --from=build /app/services/chat-service/package.json ./services/chat-service/

WORKDIR /app/services/chat-service
EXPOSE 3000
CMD ["node", "dist/main.js"]
