# Stage 1: Build & compile TypeScript
FROM node:22-alpine AS builder

WORKDIR /app

# Copy root manifest and workspace package files
COPY package.json tsconfig.base.json ./
COPY packages/core/package.json ./packages/core/
COPY packages/core/tsconfig.json ./packages/core/
COPY apps/server/package.json ./apps/server/
COPY apps/server/tsconfig.json ./apps/server/

# Install dependencies
RUN npm install --workspaces --include-workspace-root

# Copy sources
COPY packages/core/src ./packages/core/src
COPY apps/server/src ./apps/server/src

# Compile core & server
RUN npm --workspace=@invest-forest/core run build
RUN npm --workspace=@invest-forest/server run build

# Stage 2: Production Distroless/Alpine Runner
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

# Copy root package and server package
COPY package.json ./
COPY packages/core/package.json ./packages/core/
COPY apps/server/package.json ./apps/server/

# Install only production dependencies
RUN npm install --omit=dev --workspaces --include-workspace-root

# Copy compiled artifacts from builder
COPY --from=builder /app/packages/core/dist ./packages/core/dist
COPY --from=builder /app/apps/server/dist ./apps/server/dist

# Security: Non-root user
USER node

EXPOSE 8080

CMD ["node", "apps/server/dist/index.js"]
