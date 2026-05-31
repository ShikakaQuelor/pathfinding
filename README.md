# Pathfinding Visualizer

Interactive visualizer for pathfinding algorithms (Dijkstra's, A*) with maze generation.

Built with Vue 3, TypeScript, Vite, and pnpm.

## Development

```bash
pnpm install
pnpm dev
```

## Build

```bash
pnpm build     # type-check + production build → dist/
pnpm preview   # serve the built dist/ locally
```

## Deploy (Docker + Caddy on VPS)

Assumes a shared external Docker network named `caddy` already exists on the host
(created by your Caddy container with `docker network create caddy`).

```bash
# Build image and start container
docker compose up -d --build
```

Point your Caddy reverse proxy at the `pathfinding` container on port 80:

```
# Caddyfile example
pathfinding.yourdomain.com {
    reverse_proxy pathfinding:80
}
```
