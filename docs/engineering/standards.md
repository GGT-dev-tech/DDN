# DDN OS: Engineering Standards

## 1. Objetivo
Padrões de engenharia garantem que o esforço do time gere ativos sustentáveis e não dívida técnica. Este documento rege como o código da DDN OS é versionado, revisado e qualificado.

---

## 2. Versionamento e Integração Contínua

### 2.1. Git Flow (Simplificado)
- `main`: Reflete estritamente o código que está em produção (estável, testado e aprovado).
- `develop`: A esteira de integração primária.
- Branches de trabalho devem ser semânticas:
  - `feat/nome-da-feature` (ex: `feat/quotation-wizard`)
  - `fix/nome-do-bug` (ex: `fix/routing-crash`)
  - `chore/tarefas-internas` (ex: `chore/update-dependencies`)

### 2.2. Conventional Commits
Todos os commits devem respeitar o formato padronizado (Angular Convention) para garantir a legibilidade do histórico e automação de Changelogs (Semantic Release).
- Exemplo Correto: `feat(commercial): add initial quotation wizard screen`
- Exemplo Correto: `fix(routing): prevent drag and drop crash when stop is null`
- Exemplo Incorreto: `fixed bug on screen`

### 2.3. Automação de CI
Nenhuma Pull Request (PR) pode ser fundida em `develop` ou `main` caso a pipeline de CI falhe em:
1. Verificações de Tipagem Estrita (TypeScript `tsc --noEmit`).
2. Linting Global (ESLint/Prettier via `config-eslint`).
3. Passagem de Testes E2E Críticos.

---

## 3. Code Review & Quality Gates

### 3.1. Práticas de Revisão (Code Review)
- Pull Requests não devem ser revisadas apenas no nível sintático. A revisão deve focar em **Arquitetura** (Respeitou o FSD?), **Performance** (Gerou re-renderizações desnecessárias no React?) e **Contrato** (As mutações refletem os eventos do `screen_contracts.md`?).
- PRs gigantes (50+ arquivos) são fortemente desencorajadas. Entregas devem ser incrementais e baseadas em feature flags quando inacabadas.

### 3.2. Tratamento de Exceções
Nenhum código no frontend ou backend pode "engolir" erros silenciosamente (`catch (e) { }`). Todo erro deve ser tratado visivelmente para o usuário via Toasts ou ErrorBoundary, e logado via ferramenta de APM (Sentry/Datadog) para engenharia.

---

## 4. Architecture Decision Records (ADRs)

Na DDN OS, "O Porquê" é mais importante que "O Como". Para evitar a fadiga de reavaliar decisões tomadas há 6 meses ("Por que não usamos Tailwind direto? Por que usamos Orval?"), instituímos o uso de **ADRs**.
Qualquer mudança estrutural na plataforma, biblioteca principal ou paradigma deve ser registrada em Markdown dentro da pasta `docs/adr/`.

Formato de um ADR:
1. **Título:** Qual a decisão.
2. **Contexto:** Qual o problema que forçou essa decisão.
3. **Decisão:** A escolha técnica.
4. **Consequências:** Pontos positivos e negativos da escolha assumida.

---

## Dependências
- Depende de: `docs/product/business_architecture.md` (Para orientar a semântica dos commits baseados nos domínios).

## Impacto nas Próximas Fases
- Governa eternamente todas as Fases Técnicas da Plataforma (Fase B em diante).
