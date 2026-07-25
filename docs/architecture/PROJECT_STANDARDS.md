# DDN Management - Project Standards

Este documento centraliza as diretrizes, padrões e heurísticas de desenvolvimento. Seu objetivo é garantir consistência arquitetural, velocidade de onboarding e proteção contra dívida técnica à medida que o sistema escala.

---

## 1. Operações e de CI/CD (Automatizando a Governança)

### 1.1 Política de Commits (No Task Left Behind)
- **Nenhuma task termina sem commit.** Fluxo mandatório: Código -> Testes -> Docs -> Lints -> Commit.
- **Micro-commits**: Nunca acumule mais de 5 a 10 arquivos por commit (salvo em refatorações amplas). Faça um `git diff --stat` antes de commitar para garantir o isolamento.
- **Isolamento de Responsabilidade**: Um commit nunca deve misturar propósitos.
  - *Correto*: `feat(auth): implement refresh token` (e noutro commit: `refactor(database): isolate session factory`)
  - *Proibido*: `feat(auth): add refresh token and refactor database`
- **Tags de Checkpoint**: O final de toda Sprint DEVE ser marcado por uma tag Git rastreável (ex: `v0.5.1-sprint5a.1`).

### 1.2 No TODO Left Behind
- É expressamente proibido enviar ao ramo principal códigos com comentários soltos como: `TODO`, `FIXME`, `HACK`, `XXX`, `TEMP`.
- Se a dívida for consciente, obrigatoriamente referencie um ticket: `TODO(#123)`.

### 1.3 Code Review Checklist (PRs)
Toda Pull Request DEVE obrigatoriamente preencher os requisitos:
- [ ] Pipeline CI verde (Testes + Lints).
- [ ] Atualização de Documentação e/ou Walkthrough.
- [ ] Atualização de ADR (se a arquitetura sofrer mutação).
- [ ] Atualização de OpenAPI (se endpoints mudarem).
- [ ] Atualização do `.env.example` e `env_matrix.md` (se variáveis novas surgirem).

---

## 2. API, Contratos e Migrations

### 2.1 Contract First Validation
- O **FastAPI (OpenAPI)** é a única fonte da verdade. O Frontend nunca deve definir tipos manualmente.
- O CI valida a esteira: `FastAPI -> OpenAPI -> Orval -> TypeScript -> React Query`. Divergências silenciosas quebram a pipeline de Integração.

### 2.2 Migration Standards (Alembic)
Toda migration deve garantir:
- Suporte estrito bidirecional (Upgrade e Downgrade).
- Criação de Índices (`Index`) e Chaves Estrangeiras (`ForeignKey`) explícitas.
- Nomenclatura consistente do ID de revisão e ausência absoluta de "SQL Morto".
- Validação na CI via esteira: `upgrade head` -> `downgrade -1` -> `upgrade head`.
- Migrations não podem referenciar roles PostgreSQL específicos de ambientes. Roles devem ser providos pela infraestrutura.

---

## 3. Segurança, Logging e Configuração

### 3.1 Security Standards
- **Nunca Logar**: Senhas em plain-text, JWTs, Authorization Headers, Tokens de Refresh ou Cookies de sessão.
- **Secrets**: Apenas trafegam via Variaveis de Ambiente do Railway ou GitHub Secrets. Jamais commitadas no repositório.

### 3.2 Configuration Rule
- Nunca utilize `SECRET = "123"` ou hardcode no projeto.
- Todo ambiente passa por: `.env` -> Pydantic Settings -> Dependency Injection.

### 3.3 Structured Logging
- O uso de `print()` é proibido em produção.
- Use `logger.info()`, `logger.error()`, `logger.exception()` com formatação estruturada (JSON).
- Obrigatório atrelar rastreabilidade: `tenant_id`, `user_id`, `trace_id`, `correlation_id`.

---

## 4. Padrões de Arquitetura Limpa e DDD

### 4.1 The Aggregate Ownership Rule
Aggregates interagem através de `IDs`, não instâncias.
- *Errado*: `class Route: vehicle: Vehicle` (Acoplamento forte).
- *Correto*: `class Route: vehicle_id: UUID` (Autonomia de domínio).

### 4.2 Isolamento do Worker (Event-Driven)
O Worker assíncrono deve tratar eventos puramente como *Strings JSON* opacas (`Envelope`). 
- Restrição: O Worker NUNCA pode importar domínios (ex: `apps/routing`).

---

## 5. Padrões de Frontend

### 5.1 Fonte da Verdade (VITE_API_MODE)
- O padrão é atrelado a **FastAPI real** (`VITE_API_MODE=real`).
- O MSW (Mock Service Worker) restringe-se a Testes, Storybook e simulação de falhas HTTP (500, 401).

### 5.2 UI Foundation e FSD
- Nenhuma feature de negócio será construída antes de seus componentes atômicos.
- O Frontend usa **Feature-Sliced Design (FSD)**.
- **Nenhum componente de negócio pode conter CSS próprio.** Estilos derivam exclusivamente dos *Design Tokens* e componentes do Design System (Card, Button, Typography).

## Deployment Policy

Todo PR deve garantir a passagem no pipeline de CI com o seguinte checklist antes de ser mesclado, para evitar quebrar o deploy contínuo em produção:

- [x] docker build backend
- [x] docker build frontend
- [x] docker build worker
- [x] compose up (Homologação local)
- [x] healthcheck responde 200 OK
- [x] migrations alembic (bidirecionais testadas)
- [x] OpenAPI Schema exportado com sucesso
- [x] build frontend bem sucedido (TS Check + Vite)
- [x] lints (Ruff, ESLint)
- [x] tests (Pytest, Vitest)
- [x] commit padronizado
