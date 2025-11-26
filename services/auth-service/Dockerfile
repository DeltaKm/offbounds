FROM node:20-alpine

ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH

RUN corepack enable && corepack prepare pnpm@10.23.0 --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json tsconfig.base.json ./
COPY services/auth-service/package.json ./services/auth-service/package.json
COPY packages/shared-config/package.json ./packages/shared-config/package.json
COPY packages/shared-types/package.json ./packages/shared-types/package.json

RUN pnpm install --frozen-lockfile

COPY packages ./packages
COPY services/auth-service ./services/auth-service

RUN pnpm --filter @offbounds/shared-config build \
    && pnpm --filter @offbounds/shared-types build \
    && pnpm --filter auth-service build

WORKDIR /app/services/auth-service

EXPOSE 3000

CMD ["node", "dist/main.js"]
