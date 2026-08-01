# Railway Environment Variables Guide

Este documento detalha o mapa de variáveis de ambiente para o ecossistema DDN Management rodando na [Railway.app](https://railway.app). 
É crucial entender a origem (Source) e o destino (Target) de cada variável, especialmente aquelas compartilhadas entre serviços.

---

## 1. Variáveis Compartilhadas (Shared Environment)

No painel do Railway, você pode criar variáveis em um **Shared Environment**. Elas serão automaticamente injetadas em todos os serviços conectados a esse ambiente (Backend, Worker, Frontend).

| Variável | Origem (Source) | Consumidores (Targets) | Descrição |
|----------|-----------------|------------------------|-----------|
| `DATABASE_URL` | Railway PostgreSQL Plugin | Backend, Worker | Conexão principal com o banco de dados. O backend converte internamente para `postgresql+asyncpg://` se necessário. |
| `REDIS_URL` | Railway Redis Plugin | Backend, Worker | URL do Redis usado para cache no Backend e como Broker/Backend do Celery no Worker. |
| `APP_ENV` | Definido Manualmente | Backend, Worker | Geralmente `production` ou `staging`. Usado para definir comportamentos de logging e asserts. |

---

## 2. Variáveis Específicas do Backend (API Gateway)

Estas variáveis devem ser definidas **apenas** nas "Service Variables" do serviço Backend.

| Variável | Obrigatória | Exemplo / Valor | Descrição |
|----------|-------------|-----------------|-----------|
| `JWT_SECRET` | SIM | `a-very-secure-random-string` | Usado para assinar tokens de autenticação (Access/Refresh Tokens). **Nunca comite isso.** |
| `JWT_ALGORITHM`| NÃO | `HS256` | Algoritmo de assinatura (Padrão: HS256). |
| `CORS_ORIGINS` | SIM | `https://ddn.com,https://api.ddn.com`| URLs permitidas para requisições cross-origin (Frontend). |
| `SENTRY_DSN` | NÃO | `https://...` | DSN para monitoramento de erros e performance (Sentry). |
| `PORT` | AUTOMÁTICO | `8000` | Injetado automaticamente pelo Railway para bind do Uvicorn. |

---

## 3. Variáveis Específicas do Frontend (React/Vite)

Estas variáveis devem ser definidas **apenas** nas "Service Variables" do serviço Frontend. 

| Variável | Obrigatória | Exemplo / Valor | Descrição |
|----------|-------------|-----------------|-----------|
| `VITE_API_URL` | SIM | `https://api.ddn.railway.app/api/v1` | **MUITO IMPORTANTE:** Deve apontar para o domínio público gerado pelo Railway no serviço Backend. |
| `VITE_APP_NAME`| NÃO | `DDN Management` | Nome da aplicação para exibição em Title/Meta. |
| `VITE_ENVIRONMENT`| SIM | `production` | Controla ativação de mocks (MSW) e verbosidade de logs do React Query. |
| `VITE_GOOGLE_MAPS_KEY`| NÃO | `AIza...` | Chave de API caso os componentes de mapas e roteirização estejam ativos. |

---

## 4. Variáveis Específicas do Worker (Celery)

Estas variáveis devem ser definidas **apenas** nas "Service Variables" do serviço Worker.

| Variável | Obrigatória | Exemplo / Valor | Descrição |
|----------|-------------|-----------------|-----------|
| `BROKER_URL` | SIM | `${REDIS_URL}` | Aponta para o Redis. No Railway, você pode referenciar a variável compartilhada. |
| `WORKER_CONCURRENCY`| NÃO | `4` | Número de threads/processos filhos do Celery. Aumente com cautela baseado na RAM do container. |
| `OUTBOX_BATCH_SIZE` | NÃO | `100` | Quantidade máxima de eventos lockados (`SKIP LOCKED`) por ciclo de outbox polling. |
| `OUTBOX_POLL_INTERVAL`| NÃO | `1.5` | Intervalo em segundos entre polls no banco quando a fila está vazia. |
