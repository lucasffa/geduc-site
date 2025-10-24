# 🐳 Docker - Guia de Uso

Este projeto está configurado com Docker Compose para facilitar o desenvolvimento e deploy.

## 📋 Pré-requisitos

- Docker
- Docker Compose

## 🚀 Como usar

### Desenvolvimento (Porta 3000)

```bash
docker compose -f docker-compose.dev.yml up -d
```

**Recursos:**
- Hot-reload ativado
- Código sincronizado com volumes
- Porta 3000

### Produção (Porta 3001)

```bash
docker compose -f docker-compose.prod.yml up -d
```

**Recursos:**
- Build otimizado
- Exposto em 0.0.0.0:3001 (acesso público)
- Health check configurado
- Restart automático

## 🛠️ Comandos úteis

### Ver logs

```bash
# Desenvolvimento
docker compose -f docker-compose.dev.yml logs -f

# Produção
docker compose -f docker-compose.prod.yml logs -f
```

### Parar containers

```bash
# Desenvolvimento
docker compose -f docker-compose.dev.yml down

# Produção
docker compose -f docker-compose.prod.yml down
```

### Rebuild forçado

```bash
# Desenvolvimento
docker compose -f docker-compose.dev.yml up -d --build

# Produção
docker compose -f docker-compose.prod.yml up -d --build
```

### Ver status

```bash
# Desenvolvimento
docker compose -f docker-compose.dev.yml ps

# Produção
docker compose -f docker-compose.prod.yml ps
```

### Health check (apenas produção)

```bash
docker inspect --format='{{json .State.Health}}' geduc-site-prod
```

## 📁 Estrutura dos arquivos

- `Dockerfile` - Multi-stage build (dev, builder, production)
- `docker-compose.dev.yml` - Configuração de desenvolvimento
- `docker-compose.prod.yml` - Configuração de produção
- `.dockerignore` - Arquivos ignorados no build

## 🔍 Troubleshooting

### Container não inicia

```bash
docker compose -f docker-compose.prod.yml logs
```

### Limpar tudo e reconstruir

```bash
docker compose -f docker-compose.prod.yml down -v
docker compose -f docker-compose.prod.yml up -d --build
```

### Acessar o container

```bash
# Desenvolvimento
docker exec -it geduc-site-dev sh

# Produção
docker exec -it geduc-site-prod sh
```

