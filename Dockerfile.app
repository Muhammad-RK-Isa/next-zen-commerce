FROM node:20-alpine AS base

FROM base AS pruner

WORKDIR /app
RUN npm install -g turbo
COPY . .
RUN turbo prune --scope="@nzc/app" --docker

FROM base AS installer

WORKDIR /app
COPY --from=pruner /app/out/json .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=pruner /app/turbo.json ./turbo.json

RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile --prefer-frozen-lockfile

FROM base AS builder

ARG TURBO_TEAM 
ENV TURBO_TEAM=${TURBO_TEAM}
ARG TURBO_TOKEN
ENV TURBO_TOKEN=${TURBO_TOKEN}

WORKDIR /app
COPY --from=installer /app/ .
COPY --from=pruner /app/out/full .
RUN npm install -g pnpm
RUN pnpm run build

FROM base AS runner

WORKDIR /app
RUN npm install -g pnpm
COPY --from=builder /app/ .
WORKDIR /app/apps/app

EXPOSE 8080

CMD ["pnpm", "start"]
