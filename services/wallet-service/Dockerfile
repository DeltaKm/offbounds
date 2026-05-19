FROM node:20-bookworm-slim AS base
WORKDIR /app
RUN corepack enable pnpm

RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

FROM base AS dependencies
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY services/wallet-service/package.json ./services/wallet-service/
COPY packages ./packages
RUN pnpm install --frozen-lockfile

FROM dependencies AS build
COPY services/wallet-service ./services/wallet-service
COPY turbo.json ./
RUN pnpm --filter wallet-service prisma:generate
RUN pnpm --filter wallet-service build

FROM base AS runtime
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/services/wallet-service/node_modules ./services/wallet-service/node_modules
COPY --from=build /app/services/wallet-service/dist ./services/wallet-service/dist
COPY --from=build /app/services/wallet-service/prisma ./services/wallet-service/prisma
COPY --from=build /app/services/wallet-service/package.json ./services/wallet-service/
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma

WORKDIR /app/services/wallet-service
EXPOSE 3000
CMD ["node", "dist/main.js"]
