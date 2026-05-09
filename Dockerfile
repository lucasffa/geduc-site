# Dockerfile para aplicação SvelteKit
FROM node:20-alpine AS base

# Instalar dependências necessárias (libc6-compat + build tools para better-sqlite3)
RUN apk add --no-cache libc6-compat python3 make g++

# Habilitar corepack para pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copiar arquivos de dependências
COPY package.json pnpm-lock.yaml ./

# Stage de desenvolvimento
FROM base AS development
ENV NODE_ENV=development
RUN pnpm install --frozen-lockfile
COPY . .
EXPOSE 3000
CMD ["pnpm", "dev", "--host", "0.0.0.0"]

# Stage de build para produção
FROM base AS builder
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build
ENV NODE_ENV=production

# Stage de produção
FROM node:20-alpine AS production
ENV NODE_ENV=production

# better-sqlite3 precisa de libc6-compat em runtime
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copiar apenas o necessário para produção
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml ./
COPY --from=builder /app/build ./build
COPY --from=builder /app/node_modules ./node_modules

# Diretório para bancos SQLite (volume em produção)
RUN mkdir -p /app/data/orgs

# Criar usuário não-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 3001

ENV BODY_SIZE_LIMIT=10485760

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/', (res) => { process.exit(res.statusCode === 200 ? 0 : 1); })"

CMD ["node", "build"]
