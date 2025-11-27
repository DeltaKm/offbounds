FROM node:20-slim

ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH

RUN corepack enable && corepack prepare pnpm@10.23.0 --activate

WORKDIR /app

# Copy workspace root files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json tsconfig.base.json ./

# Copy package names only (faster install)
COPY services/auth-service/package.json ./services/auth-service/
COPY packages/shared-config/package.json ./packages/shared-config/
COPY packages/shared-types/package.json ./packages/shared-types/

# Install deps
RUN pnpm install --frozen-lockfile

# Copy full project
COPY packages ./packages
COPY services/auth-service ./services/auth-service

# Prisma
RUN pnpm --workspace-root --filter auth-service prisma:generate

#  Build Monorepo Correctly
RUN pnpm --workspace-root --filter @offbounds/shared-config build
RUN pnpm --workspace-root --filter @offbounds/shared-types build
RUN pnpm --workspace-root --filter auth-service build

WORKDIR /app/services/auth-service

EXPOSE 3000

CMD ["node", "dist/main.js"]
