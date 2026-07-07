FROM node:20-slim

ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH

RUN corepack enable && corepack prepare pnpm@10.23.0 --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json tsconfig.base.json ./
COPY services/registration-service/package.json ./services/registration-service/package.json
COPY packages/shared-config/package.json ./packages/shared-config/package.json
COPY packages/shared-types/package.json ./packages/shared-types/package.json

RUN pnpm install --frozen-lockfile

COPY packages ./packages
COPY services/registration-service ./services/registration-service

RUN pnpm --workspace-root --filter @offbounds/registration-service prisma:generate \
    && pnpm --workspace-root --filter @offbounds/shared-config build \
    && pnpm --workspace-root --filter @offbounds/shared-types build \
    && pnpm --workspace-root --filter @offbounds/registration-service build

WORKDIR /app/services/registration-service

RUN pnpm build

EXPOSE 3000

CMD ["node", "dist/main.js"]
