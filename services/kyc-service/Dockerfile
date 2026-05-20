FROM node:20-bookworm-slim AS base
WORKDIR /app
RUN corepack enable pnpm

FROM base AS dependencies
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY services/kyc-service/package.json ./services/kyc-service/
COPY packages ./packages
RUN pnpm install --frozen-lockfile

FROM dependencies AS build
COPY services/kyc-service ./services/kyc-service
COPY turbo.json ./
RUN pnpm --filter kyc-service build

FROM base AS runtime
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/services/kyc-service/node_modules ./services/kyc-service/node_modules
COPY --from=build /app/services/kyc-service/dist ./services/kyc-service/dist
COPY --from=build /app/services/kyc-service/package.json ./services/kyc-service/

WORKDIR /app/services/kyc-service
EXPOSE 3000
CMD ["node", "dist/main.js"]
