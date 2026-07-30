# DDN OS: Screen Contracts (Contratos de Interface)

## 1. O Princípio do Contrato

Na DDN OS, uma tela não é apenas uma "View". Ela é um componente isolado que respeita um **Contrato de Interface**. O backend só envia o que a tela exige, e a tela só dispara as mutações e eventos acordados.

Cada tela principal mapeada no *Product Blueprint* deve ter seu contrato definido antes do desenvolvimento. Abaixo, documentamos os contratos das telas mais críticas do sistema.

---

## 2. Exemplos de Contratos Críticos

### 2.1. Tela: Workspace (Dashboard)
- **Objetivo:** Antecipar o trabalho. Mostrar ao usuário exatamente o que exige atenção imediata, sem necessidade de navegação.
- **Atores:** Todos (dados filtrados dinamicamente via RLS pelo papel do usuário).
- **Entradas (Dados):**
  - `Alerts[]`: Lista de exceções e alertas críticos (ex: Licença Vencendo, Frota Quebrada).
  - `GlobalKPIs{}`: Somatórias diárias (Rotas em andamento, Contratos Pendentes).
  - `TimelineEvents[]`: Stream dos últimos acontecimentos relevantes da operação.
  - `LiveMapData`: Coordenadas em tempo real dos caminhões em operação.
- **Saídas (Ações):**
  - Clicar em um alerta abre o *Side Panel* correspondente.
- **Permissões:** `view:workspace`. Acesso universal (filtrado no backend).
- **KPIs da Tela:** Tempo de carregamento menor que 1 segundo.

### 2.2. Tela: Company Details (O 360° do Cliente)
- **Objetivo:** Centralizar absolutamente todo o histórico comercial, contratual e operacional de um Gerador.
- **Atores:** Comercial, Financeiro, Gerência.
- **Entradas (Dados):**
  - `Company{id, name, cnpj, status}`
  - `CompanyAddresses[]`
  - `Quotations[]`: Histórico de propostas.
  - `Contracts[]`: Contratos ativos/inativos.
  - `FinancialStatus`: Inadimplente, Regular.
- **Saídas (Ações):**
  - `CreateQuotation` (Abre o wizard de cotação).
  - `EditCompany` (Abre form de edição).
  - `SuspendCompany` (Dispara evento de bloqueio).
- **Eventos Disparados:** `CompanySuspended`, `CompanyDataUpdated`.
- **Permissões:** `view:company`, `edit:company`, `suspend:company`.

### 2.3. Tela: Service Plan Details (Planejamento)
- **Objetivo:** Parametrizar as regras logísticas de um contrato aprovado (frequência, equipamentos, resíduos).
- **Atores:** Gerente Operacional.
- **Entradas (Dados):**
  - `ServicePlan{id, contract_id, status}`
  - `Frequencies[]`: Ex: "Toda terça e quinta".
  - `PlannedWaste[]`: Tipos e estimativas.
  - `RequirementsHistory[]`: Histórico de coletas já geradas por este plano.
- **Saídas (Ações):**
  - `PublishPlan` (Ativa o plano, habilitando a geração de coletas).
  - `SuspendPlan`
  - `EditFrequency`
- **Eventos Disparados:** `ServicePlanPublished`, `ServicePlanSuspended`.
- **Permissões:** `view:service_plans`, `manage:service_plans`.
- **KPIs da Tela:** Clareza visual imediata da frequência configurada.

### 2.4. Tela: Route Details (Geração e Acompanhamento)
- **Objetivo:** Orquestrar o despacho de um caminhão para uma série de paradas e monitorar a execução em tempo real.
- **Atores:** Gerente Operacional, Operador Logístico.
- **Entradas (Dados):**
  - `Route{id, status, date}`
  - `Vehicle{id, plate}`, `Driver{id, name}`
  - `Stops[]`: Lista sequenciada de `Requirements`.
  - `LiveCoordinates`: Posição atual.
- **Saídas (Ações):**
  - `StartRoute` (Disparado pelo motorista no app).
  - `ReorderStops` (Drag-and-drop de paradas).
  - `CancelRoute`
  - `ReassignVehicle`
- **Eventos Disparados:** `RouteStarted`, `RouteReordered`, `RouteVehicleChanged`.
- **Permissões:** `manage:routes`.

---

## Dependências
- Depende de: `docs/product/product_blueprint.md` (Para saber quais telas existem) e `docs/product/capabilities.md` (Para reutilizar conceitos de Maps e Notificações).

## Impacto nas Próximas Fases
Este documento é o elo final entre Design e Backend. 
- O backend usará as **Entradas/Saídas** para modelar as APIs REST/GraphQL (ex: os DTOs do Orval).
- O Design System e Storybook usarão esse documento para criar Mock Data funcional (MSW) na Fase C.
