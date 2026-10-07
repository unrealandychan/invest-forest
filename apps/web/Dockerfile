# Stage 1: Build Web App
FROM node:22-alpine AS builder

WORKDIR /app

# Copy root manifest and workspace package files
COPY package.json tsconfig.base.json ./
COPY packages/core/package.json ./packages/core/
COPY packages/core/tsconfig.json ./packages/core/
COPY apps/web/package.json ./apps/web/
COPY apps/web/tsconfig.json ./apps/web/
COPY apps/web/tsconfig.node.json ./apps/web/
COPY apps/web/vite.config.ts ./apps/web/
COPY apps/web/tailwind.config.js ./apps/web/
COPY apps/web/postcss.config.js ./apps/web/

# Install dependencies
RUN npm install --workspaces --include-workspace-root

# Copy sources
COPY packages/core/src ./packages/core/src
COPY apps/web/index.html ./apps/web/
COPY apps/web/capacitor.config.ts ./apps/web/
COPY apps/web/src ./apps/web/src

# Compile core & build web app
RUN npm --workspace=@invest-forest/core run build
RUN npm --workspace=@invest-forest/web run build

# Stage 2: Production SPA runner with built-in API proxy
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV BACKEND_URL=http://server:8080

COPY --from=builder /app/apps/web/dist ./dist
COPY apps/web/prod-server.js ./

USER node

EXPOSE 3000

CMD ["node", "prod-server.js"]
