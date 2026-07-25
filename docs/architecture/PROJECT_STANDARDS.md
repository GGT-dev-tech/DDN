# DDN Management - Project Standards

Este documento centraliza as diretrizes, padrões e heurísticas de desenvolvimento. Seu objetivo é garantir consistência arquitetural, velocidade de onboarding e proteção contra dívida técnica à medida que o sistema escala.

---

## 1. Regras Operacionais e de CI/CD

### 1.1 Política de Commits (No Task Left Behind)
- **Nenhuma task termina sem commit.** O fluxo mandatório é: 
  `Código -> Testes -> Documentação -> Lints (Ruff/Mypy) -> Commit -> Atualização do Checkpoint (task.md)`.
- **Commits Pequenos e com Escopo**: Use Conventional Commits de forma criteriosa (`feat`, `fix`, `docs`, `test`, `refactor`).
  - *Correto*: `feat(shared-kernel): introduce aggregate root`
  - *Proibido*: `update`, `fixes`, `wip`.
- **Tags de Checkpoint**: O final de toda Sprint ou sub-Sprint DEVE ser marcado por uma tag Git rastreável (ex: `v0.5.1-sprint5a.1`).

### 1.2 Regra de Migrações (Alembic)
- **Testes Bidirecionais**: Toda nova migration submetida deve suportar o ciclo de vida completo sem corrupção. A pipeline de CI obrigatoriamente executará: `alembic upgrade head` -> `alembic downgrade -1` -> `alembic upgrade head`. Se falhar, a PR será bloqueada.

### 1.3 Contract First Validation (OpenAPI)
- **Bloqueio de Divergência**: Nenhuma tipagem no Frontend deve ser escrita manualmente. Qualquer alteração em models Pydantic ou rotas do FastAPI refletirá no `openapi.json`. O CI validará se o comando de build do Frontend (Orval/TS) gera os mesmos tipos. Falhas silenciosas de payload (divergência API-Front) não devem chegar a produção.

---

## 2. Padrões de Arquitetura Limpa e DDD

### 2.1 The Aggregate Ownership Rule
**O Contexto:** Aggregates não podem conter instâncias de outros Aggregates diretamente. Eles interagem apenas através de `IDs`.
- **Errado**: `class Route: vehicle: Vehicle` (Acoplamento forte, inviabiliza caches locais e microserviços futuros).
- **Correto**: `class Route: vehicle_id: UUID` (Autonomia de domínio).

### 2.2 Isolamento do Worker (Event-Driven)
**O Contexto:** O Worker assíncrono (Celery/Kombu) e o Outbox Processor devem tratar eventos puramente como *Strings JSON* opacas (`Envelope`). 
- **Restrição**: O Worker NUNCA pode importar arquivos dos módulos de domínio (`apps/routing`, `apps/fleet`). Ele só conhece a base de banco e os brokers. 

---

## 3. Padrões de Frontend

### 3.1 Fonte da Verdade (VITE_API_MODE)
- O padrão de desenvolvimento do projeto é rodar atrelado a **FastAPI real** (`VITE_API_MODE=real`).
- O MSW (Mock Service Worker) ficará puramente restrito a testes unitários, testes E2E com falhas injetadas (HTTP 500, timeouts) e documentação visual do **Storybook**.

### 3.2 UI Foundation Antes das Regras de Negócio
- Nenhuma feature de negócio (ex: "Tela de Dashboard") será construída antes de seus componentes atômicos existirem, validarem temas e acessibilidade no Storybook.
- O Frontend é organizado utilizando a metodologia **Feature-Sliced Design (FSD)**, evitando pastas gigantes baseadas apenas em extensões de arquivo.
