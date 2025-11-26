FROM node:20-alpine

ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH

RUN corepack enable && corepack prepare pnpm@10.23.0 --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json tsconfig.base.json ./
COPY apps/api-gateway/package.json ./apps/api-gateway/package.json
COPY packages/shared-config/package.json ./packages/shared-config/package.json
COPY packages/shared-types/package.json ./packages/shared-types/package.json

RUN pnpm install --frozen-lockfile

COPY packages ./packages
COPY apps/api-gateway ./apps/api-gateway

RUN pnpm --filter @offbounds/shared-config build \
    && pnpm --filter @offbounds/shared-types build \
    && pnpm --filter api-gateway build

WORKDIR /app/apps/api-gateway

EXPOSE 3000

CMD ["node", "dist/main.js"]
