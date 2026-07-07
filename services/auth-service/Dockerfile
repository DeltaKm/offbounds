FROM node:20-bookworm-slim

ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH

RUN apt-get update -y \
    && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*

RUN corepack enable && corepack prepare pnpm@10.23.0 --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json tsconfig.base.json ./

COPY services/auth-service/package.json ./services/auth-service/
COPY packages/shared-config/package.json ./packages/shared-config/
COPY packages/shared-types/package.json ./packages/shared-types/

RUN pnpm install --frozen-lockfile

COPY packages ./packages
COPY services/auth-service ./services/auth-service

RUN pnpm --workspace-root --filter auth-service prisma:generate

RUN pnpm --workspace-root --filter @offbounds/shared-config build
RUN pnpm --workspace-root --filter @offbounds/shared-types build
RUN pnpm --workspace-root --filter auth-service build

WORKDIR /app/services/auth-service

EXPOSE 3000

CMD ["node", "dist/main.js"]
