# FRONTEND ARCHITECTURE SPECIFICATION
## GoAuct Intelligence OS

Este documento é a fonte de verdade absoluta para todas as decisões arquiteturais do ecossistema Frontend. Nenhuma linha de código deve ser escrita, e nenhum PR deve ser aprovado, se violar as diretrizes aqui estabelecidas.

---

## 1. Topologia do Workspace (Turborepo)
O frontend opera sob um modelo de Monorepo (Turborepo) para garantir compartilhamento de código entre aplicações futuras (ex: admin, client-portal, mobile).

```text
frontend/
├── apps/
│   ├── web/              # Aplicação principal (GoAuct OS) - Next.js 15
│   └── docs/             # Storybook & Documentação do Design System
├── packages/
│   ├── api/              # SDK gerado, Types, Client nativo (sem Axios)
│   ├── ui/               # Componentes React base, Tailwind v4, Tokens
│   ├── config/           # Configurações globais (ESLint, Prettier, Husky)
│   └── types/            # Tipos globais estáticos
```

---

## 2. Padrão Arquitetural: Feature-Sliced Design (FSD)
A aplicação `apps/web` segue estritamente o modelo FSD. É **proibido** criar dependências circulares ou fazer cross-imports de features.

### 2.1. Regras de Importação
A hierarquia de importação deve fluir **apenas de cima para baixo**:
`app` → `pages` → `widgets` → `features` → `entities` → `shared`

- Uma `feature` **NÃO** pode importar outra `feature`.
- Uma `entity` **NÃO** pode importar outra `entity` (use a camada de `features` para orquestrá-las).
- `shared` **NÃO** pode depender de NADA acima dela.

### 2.2. O Domínio na UI (Entities Layer)
O Frontend possui seu próprio domínio. Nunca renderizamos DTOs crus da API.
A pasta `src/entities/` deve conter, para cada domínio:

```text
entities/service-plan/
├── api/             # Adapters / Mappers (DTO -> UI Entity)
├── model/           # Hooks de estado global da entidade, Types da UI
├── ui/              # Componentes visuais puramente da entidade (ex: ServicePlanCard)
└── lib/             # Helpers e lógicas específicas
```
*Nota: Mappers convertem `ServicePlanDTO` para `ServicePlanUI` e resolvem status visuais, cores, etc.*

---

## 3. Fluxo de Dados e Integração OpenAPI
O fluxo de dados da API para a tela tem 0% de digitação manual de tipagens.

1. **Geração**: O arquivo `openapi.json` alimenta o **Orval**.
2. **SDK Gerado (`packages/api`)**: O Orval gera estritamente **Types, Zod Schemas e o Fetch SDK**. 
   - *Regra de Ouro*: O SDK não gera hooks do React Query. O pacote `api` é puro TS/JS.
3. **Mocks (MSW)**: O MSW consome os Zod schemas e os tipos gerados pelo SDK para garantir que o mock responda exatamente como a API de produção.
4. **Hooks (Features)**: O React Query é dono da regra de cache e fica na camada de `features`:
   ```typescript
   // features/service-plan/api/queries.ts
   export const useGetServicePlans = () => useQuery({
       queryKey: ['servicePlans'],
       queryFn: () => API.servicePlans.getAll().then(mapper)
   });
   ```

---

## 4. Otimização de Renderização: RSC, Suspense e Streaming
Com Next.js 15, a arquitetura abraça o *Server-First*.

### Fluxo Padrão:
```text
Page (Server Component)
  ├─ Search Params (Leitura de query string)
  ├─ Await Initial Data (Hydration via React Query State)
  └─ <Suspense fallback={<TableSkeleton />}>
       <ClientTable />
     </Suspense>
```
Componentes interativos (formulários, modais) levam `"use strict"`, enquanto o layout e o data-fetching primário inicial ocorrem no servidor para garantir SEO (onde aplicável) e métricas LCP baixas.

---

## 5. Arquitetura de Permissões Ricas (Data-Driven UX)
A UI não duplica regras de negócio para decidir o que o usuário pode fazer. O backend envia um dicionário semântico por entidade:

```typescript
type Actions = {
  publish: { enabled: boolean; reason?: string };
  edit: { enabled: boolean; reason?: string };
}
```
Um botão desabilitado sempre renderizará um *Tooltip* revelando a `reason`. A UI reage ao contrato, não toma decisões de permissionamento.

---

## 6. Arquiteturas Verticais (As "Micro-Arquiteturas")

### 6.1. Formulários
Não construímos forms gigantes soltos. Seguimos a hierarquia:
`FormContainer → ValidationSummary → Section → FieldGroup → Field`
Todos os forms usam `react-hook-form` validados via `zod`. A submissão sempre limpa cache do React Query (`invalidateQueries`).

### 6.2. Tabelas
Tabelas são complexas e exigem composição.
`DataTable → Toolbar → Filters → ColumnVisibility → TableBody → Pagination → Export`
As tabelas interagem diretamente com a URL (Search Params) para refletir filtros, paginação e ordenação (Shareable URLs).

### 6.3. Navegação
O esqueleto da aplicação é imutável e escalável.
`AppShell → Workspace (Current Context) → Sidebar → Breadcrumb → PageHeader → Content`

### 6.4. Formatação de Domínio (Domain Formatting)
Proibido injetar formatação de datas e moedas solta nos componentes.
O `shared/lib/formatters` deve prover:
`formatQuantity()`, `formatDate()`, `formatMoney()`, `formatStatus()`

### 6.5. Estados da Tela e Resiliência
A pasta `shared/ui/states` proverá componentes obrigatórios para o ciclo de vida:
- `Loading` / `Skeleton`
- `EmptyState` (Com ilustrações/ações)
- `ErrorState` (Integrado ao Error Boundary)
- `OfflineState`

Cada **Feature** complexa terá seu próprio `<ErrorBoundary />` para evitar o colapso de toda a árvore do React.

---

## 7. Observabilidade e DevTools

### Sentry & Correlation ID
O wrapper nativo `fetch` injeta automaticamente `X-Correlation-ID` em cada requisição. O Sentry mapeará todos os erros front-end ligando-os ao trace do backend.

### Src/Devtools
Um pacote incluído apenas em modo de desenvolvimento (`__DEV__`).
Oferece um painel flutuante local para:
- Feature Flags switch (`shared/config/features`)
- Latency Simulator (Injetado via MSW)
- Error Simulator (500, 401, 403)
- Permission Switcher (Teste como Admin/Guest)

---

## 8. Definition of Done (Qualidade & Testes)

Nenhum PR será integrado se não cumprir:
1. **Design System (Storybook)**: Todo componente visual no `packages/ui` e em `entities/{name}/ui` possui Stories (Desktop, Mobile, Dark, Loading, Error).
2. **Visual Testing**: Chromatic aprovando os snapshots do Storybook sem regressão não intencional.
3. **E2E (Playwright)**: Fluxos core (ex: Ativar Contrato, Editar Schedule) testados no Playwright rodando contra o MSW (Zero rede externa, 100% determinístico).
4. **FSD Lint**: Zero violações apontadas pelo `eslint-plugin-boundaries`.
5. **Acessibilidade**: Axe (via Playwright) atestando que todo input tem `aria-label`, que o `focus` é retido em modais (Drawers) e contrastes respeitam AA.
