# DDN OS: Frontend Architecture

## 1. Objetivo
Este documento rege a infraestrutura técnica que sustenta o ecossistema DDN OS. Nenhuma dependência estrutural pode ser adotada sem estar em conformidade com as restrições abaixo e justificada em um ADR.

---

## 2. A Fundação Técnica (Monorepo)
Para manter o alinhamento total entre design, documentação técnica, testes e aplicações operacionais/clientes, a arquitetura utilizará o padrão de **Monorepo** governado por ferramentas Enterprise-grade (ex: Turborepo).

### Organização Lógica de Pacotes
O Workspace Platform (Dashboard principal), o Portal do Cliente e o Design System são vizinhos de código, não isolados.

```text
apps/
  ├─ ddn-os/          # O Workspace Administrativo/Operacional (Next.js)
  ├─ ddn-portal/      # Área do Cliente B2B (Next.js)
  └─ ddn-docs/        # Documentação e Storybook isolados

packages/
  ├─ ui/              # Componentes React Agnósticos (O Design System)
  ├─ config-eslint/   # Padrões unificados de Linting
  ├─ config-tailwind/ # Tokens da marca
  └─ api-client/      # SDK Autogerado (Orval)
```

---

## 3. O Paradigma de Arquitetura: Feature-Sliced Design (FSD)
Não agruparemos arquivos por tipo (`/components`, `/hooks`, `/pages`). Agruparemos por **Valor de Negócio**, garantindo a manutenção da linguagem ubíqua e prevenindo "spaghetti code" ao longo dos anos.

### Camadas do FSD na DDN OS:
1. `app/` → Provedores Globais, Roteamento Base e Setup (App Router).
2. `pages/` → Apenas a composição (wiring) macro, sem lógica pura.
3. `widgets/` → Componentes autônomos complexos (Ex: `ContractDrawer`, `RouteMap`).
4. `features/` → Mutações e ações de negócio (Ex: `PublishServicePlan`, `ApproveQuotation`).
5. `entities/` → O Domínio cru. Apenas modelos, visualizadores (cards) e hooks de leitura da API de `Lead`, `Route`, `Vehicle`.
6. `shared/` → Infraestrutura genérica (UI Kit global, SDK da API, formatadores de data/peso).

---

## 4. O Sistema Nervoso (Network & Data Muting)

### 4.1. Contract-Driven Development
- O Backend não é adivinhado, ele é contratado.
- Utilizaremos a especificação **OpenAPI** exportada pelo backend FastAPI para autogerar 100% dos tipos TypeScript, schemas de validação e React Query hooks utilizando o **Orval**.
- Zero declarações manuais de interfaces de DTOs no front-end.

### 4.2. Gerenciamento de Estado de Servidor
- O cache e mutações da rede pertencem ao **React Query (TanStack Query v5)**.
- Mutações (POST/PUT/DELETE) exigem implementação estrita de _Optimistic Updates_ para garantir a fluidez da operação antes da resposta da rede, com rollback nativo em caso de erro.

### 4.3. Desenvolvimento Isolado (MSW)
- O frontend deve ser capaz de ser desenvolvido 100% isolado do backend rodando no localhost ou em nuvem.
- O **Mock Service Worker (MSW)** intercepta requisições de rede na camada de serviço, injetando dados mockados baseados nos `Screen Contracts`, provendo assim estabilidade para testes E2E e Storybook.

---

## 5. Garantia de Qualidade E2E
- Substituímos a dependência profunda em testes unitários pesados para interfaces em favor de **Testes End-to-End (E2E) críticos com Playwright**.
- O Playwright testará os *Workflows Principais* descritos em `workflows.md` diretamente contra as aplicações rodando.

---

## Dependências
- Depende de: `docs/product/business_architecture.md` (Para organizar a hierarquia do FSD).

## Impacto nas Próximas Fases
- É a constituição mandatória das Fases **B (Discovery Técnica)** e **C (Plataforma)**, onde a arquitetura será efetivamente instalada (Turborepo, Orval, MSW).
