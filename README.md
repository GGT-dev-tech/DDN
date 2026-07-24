# Stitch Platform

Stitch is a modern waste management platform with a Modular Monolith backend powered by Python and FastAPI, and a React/Next.js frontend.

## 1. Visão Geral
Este repositório contém a fundação do Stitch. Ele é dividido em backend (Python), frontend (React) e background workers.

## 2. Arquitetura
O backend adota **Clean Architecture** guiado por **Domain-Driven Design (DDD)**.
As responsabilidades são divididas nas camadas: `Domain`, `Application`, `Infrastructure` e `Presentation`.
Usamos o padrão **Unit of Work** em conjunto com **Repository Pattern** e **CQRS (Light)** para orquestrar as persistências.

## 3. Tecnologias
- **Backend:** Python 3.12+, FastAPI, SQLAlchemy, Pydantic, Alembic
- **Infra:** PostgreSQL, Redis, Celery (Worker)
- **Frontend:** Node.js, Next.js (Planejado)
- **Tooling:** uv, Ruff, Black, Mypy, Pytest

## 4. Estrutura do projeto
- `/backend`: Core Modular Monolith API
- `/frontend`: Aplicação SPA Web
- `/worker`: Celery beat & workers para tarefas assíncronas e Outbox Pattern
- `/docs`: ADRs e documentações de negócio

## 5. Rodando localmente
Nós possuímos um `Makefile` raiz para padronizar os comandos.
1. `make dev`: Sobe PostgreSQL, Redis e a API FastAPI com live-reload.
2. `make test`: Roda a suíte inteira de testes.
3. `make lint` / `make format`: Valida e formata o código.

## 6. Variáveis de ambiente e Secrets
Os segredos dependem do ambiente que você está executando.
- **LOCAL**: Crie o arquivo `backend/.env.local`. Ele já é ignorado pelo git.
  - O `docker-compose.dev.yml` fará a leitura automática.
- **TEST**: O GitHub Actions usará GitHub Secrets (mockados localmente no `.env.test`).
- **PROD**: No Railway, adicione no painel de Shared Variables.
**Variáveis Essenciais:**
- `DATABASE_URL` (Ex: `postgresql+asyncpg://stitch_admin:secret_postgres@localhost:5432/stitch_db`)
- `REDIS_URL` (Ex: `redis://localhost:6379/0`)
- `JWT_SECRET` (Use uma hash aleatória em produção)

## 7. Banco de dados
Usamos PostgreSQL. A tabela possui isolamento `RLS (Row-Level Security)` por inquilino.
As tabelas e views são provisionadas via migrações.

## 8. Migrações
Execute `make revision m="sua_mensagem"` para gerar uma nova migração (Alembic).
Execute `make migrate` para subir o banco para a versão mais recente `head`.

## 9. Testes
O projeto usa `pytest`.
Garantimos **Coverage Drift** (o coverage não pode regredir).
Para testar a arquitetura: `make architecture`.

## 10. CI/CD
A pipeline roda no GitHub Actions validando:
Lint, Format, Testes (Coverage Drop Block), Security Scans (Trivy, Bandit, Pip-Audit) e Docker Build.

## 11. Deploy Railway
O repositório é otimizado para deploy no Railway de forma nativa.
Existem três containers principais:
- `/backend`
- `/worker`
- `/frontend`
Cada diretório possui seu próprio `Dockerfile` e `railway.toml`.

## 12. ADRs (Decisões de Arquitetura)
Leia a pasta `docs/decisions/` para entender como o sistema foi arquitetado.

## 13. Roadmap
- **Sprint 5**: Outbox Pattern, Celery Worker, Value Objects robustos.
- **Sprint 6**: Integração Frontend & Autenticação Real.

## 14. Contribuição
Leia `CONTRIBUTING.md` e `CODE_OF_CONDUCT.md`. Todo PR requer testes e deve passar pelas verificações de segurança.
