# ── Stage 1: build ────────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

RUN corepack enable && corepack prepare pnpm@10.33.0 --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

# ── Stage 2: serve ────────────────────────────────────────────────────────────
FROM node:22-alpine AS runner

RUN npm install -g serve@14

WORKDIR /srv
COPY --from=builder /app/dist .

EXPOSE 3000

# -s: SPA mode (all paths fall back to index.html for client-side routing)
CMD ["serve", "-s", ".", "-l", "3000"]
