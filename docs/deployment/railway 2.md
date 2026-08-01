# Railway Deployment Guide

Este documento detalha o provisionamento, a arquitetura e o ciclo de vida da infraestrutura da plataforma **DDN Management** na [Railway.app](https://railway.app).

## 1. Topologia de Serviços

A infraestrutura consiste em 3 aplicações lógicas principais que rodam em containers separados, orquestradas pelo Docker e servidas pelo Railway nativamente:

1. **Backend (API Gateway & Modules)**
2. **Worker (Background Tasks & Celery)**
3. **Frontend (React/Vite SPA)**

Além disso, a Railway fornece nativamente os bancos:
- **PostgreSQL 15+ (com PostGIS)**
- **Redis 7+**

---

## 2. Configurações por Serviço

### 2.1 Backend (API)
- **Root Directory:** `/backend`
- **Builder:** Dockerfile (ou Nixpacks com Python 3.14)
- **Start Command:**
  ```bash
  uv run uvicorn apps.api_gateway.src.main:app --host 0.0.0.0 --port $PORT
  ```
- **Healthcheck Path:** `/health`
- **Variáveis de Ambiente:**
  - `DATABASE_URL` (Compartilhado via Railway Postgres)
  - `REDIS_URL` (Compartilhado via Railway Redis)
  - `JWT_SECRET` (Gerado em Produção)
  - `APP_ENV` = `production`
  - `LOG_LEVEL` = `INFO`
  - `API_PORT` = `$PORT` (Injetado pelo Railway)

### 2.2 Worker (Assíncrono)
- **Root Directory:** `/worker` (ou `/backend` com comando alterado)
- **Builder:** Dockerfile
- **Start Command:**
  ```bash
  uv run celery -A worker.app worker --loglevel=INFO --concurrency=${WORKER_CONCURRENCY:-4}
  ```
- **Variáveis de Ambiente:**
  - `DATABASE_URL` (Compartilhado via Railway Postgres)
  - `REDIS_URL` (Compartilhado via Railway Redis)
  - `WORKER_CONCURRENCY` = `4` (Ajustável para scale-out)
  - `OUTBOX_BATCH_SIZE` = `100`
  - `OUTBOX_POLL_INTERVAL` = `1.5`

### 2.3 Frontend (UI)
- **Root Directory:** `/frontend`
- **Builder:** Node (Nixpacks) ou Dockerfile (Nginx multistage)
- **Start Command:**
  Depende do build (Vite preview ou Nginx estático):
  ```bash
  npm run preview -- --port $PORT --host
  ```
- **Variáveis de Ambiente:**
  - `VITE_API_URL` (Apontando para a URL pública gerada no serviço Backend)
  - `VITE_APP_NAME` = `DDN Management`
  - `VITE_ENVIRONMENT` = `production`

---

## 3. Variáveis de Ambiente Estratégicas

### Compartilhadas (via Railway Variables)
O Railway permite que você crie um ambiente compartilhado entre múltiplos serviços.
Deve ser configurado na aba "Variables" -> "Shared":
- `DATABASE_URL`
- `REDIS_URL`

### Exclusivas / Secrets (Por Serviço)
- `JWT_SECRET` (Apenas no Backend)
- `API_KEYS` (Apenas no Backend)
- `WORKER_NAME` (Apenas no Worker)

---

## 4. Ambientes e Workflows

| Ambiente | Descrição | Branch | VITE_API_URL |
|----------|-------------|---------|---------------|
| **Development** | Docker Compose local | `dev` | `http://localhost:8000` |
| **Staging** | Réplica da produção Railway | `staging` | `https://api-staging.up.railway.app` |
| **Production** | Produção Railway | `main` | `https://api.ddn.com` |

### Fluxo de Release (CI/CD)
1. **GitHub Push:** Código pushado na `main`.
2. **Railway Trigger:** Railway detecta push e inicia pipeline de Build.
3. **Build:** Executa Nixpacks ou `Dockerfile` (uv sync).
4. **Deploy Temporário:** Roda o serviço novo lado a lado com o antigo.
5. **Healthcheck:** Bate na rota `/health`.
6. **Migração (Release Phase):**
   - O Railway possui "Pre-deploy commands" ou "Release commands". 
   - Comando essencial: `uv run alembic upgrade head`
7. **Cutover:** Roteador do Railway aponta o tráfego para a nova build e derruba a antiga.

---

## 5. Checklist de Produção (Prontidão)
- [ ] **Segurança RLS:** Banco de dados de Produção possui extensão `auth.uid()` mapeada.
- [ ] **Backups:** Retenção diária configurada no painel do PostgreSQL do Railway.
- [ ] **Migrações:** Executadas 100% de forma autônoma no passo de Release (`alembic upgrade head`).
- [ ] **Rate Limiting:** Configurado no Ingress do Railway ou via Middleware no FastAPI para evitar DoS (Denial of Service).
- [ ] **Monitoramento (Logs):** Habilitar Datadog/Axiom via "Integrations" do Railway.
