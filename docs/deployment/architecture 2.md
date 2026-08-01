# Deployment Architecture

Este documento descreve a topologia atual da aplicação na plataforma **Railway**. Seguimos a filosofia de que a infraestrutura deve ser tão transparente e controlada quanto o código (Infra as Code / Config as Code).

## Topologia Geral

```text
                Internet
                    │
            Railway Domain
                    │
             Frontend (React)
             [Nginx/Node Serve]
                    │
             HTTPS REST API
                    │
          FastAPI Gateway
             [Uvicorn]
                    │
      ┌─────────────┴─────────────┐
      │                           │
 PostgreSQL                  Redis
      │                           │
      └─────────────┬─────────────┘
                    │
              Celery Worker
                    │
             Outbox Processing
```

## Regras de Deploy
- **Backend First**: Como os outros serviços dependem dos schemas e contratos expostos, o Backend sempre sobe primeiro.
- **Worker Segregado**: O processamento assíncrono nunca compartilha o mesmo container do Backend.
- **Frontend SPA**: O build do Frontend ocorre injetando `VITE_API_URL`.

## Health e Prontidão
Todos os containers devem expor a rota `/health` e estão configurados para `ON_FAILURE` Restart Policy.
