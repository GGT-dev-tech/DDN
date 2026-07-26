# Aggregate Design (DDD) & Dependency Matrix

Este documento é a "constituição" do sistema ERP. Ele define os Aggregates, Aggregate Roots de cada bounded context, o Ownership das entidades, os Domain Events e a Matriz de Dependência que rege quais módulos podem depender de quais.

## 1. Aggregates por Bounded Context

Abaixo está a ordem lógica de estruturação, partindo das fundações até a operação:

### 1.1 Identity & Settings (Configuração Global)
- **Aggregate Root:** `Tenant` & `User`
  - **Ownership:** Multi-tenancy, isolamento e perfis de acesso (Roles/Permissions).
- **Aggregate Root:** `Settings`
  - **Ownership:** Regras de negócio globais, integrações (WhatsApp, Email), branding, perfil da empresa, notificações.

### 1.2 Transversal (Cross-Cutting)
Estes contextos não pertencem a módulos específicos, mas são consumidos por todos.
- **Aggregate Root:** `Timeline` / `Activity`
  - **Ownership:** Registro de atividades (Comments, Attachments, Mentions) conectável a Lead, Opportunity, Contract, ServiceOrder, etc.
- **Aggregate Root:** `Tag`
  - **Ownership:** Etiquetas de categorização genéricas.
- **Aggregate Root:** `Source`
  - **Ownership:** Rastreabilidade de origem (Website, API, Admin, Importação, WhatsApp, Indicação) plugável em diversas entidades.

### 1.3 Workflow
- **Aggregate Root:** `WorkflowState` & `Transition`
  - **Ownership:** Controla os estados, transições, validações, automações e eventos globais do sistema.
  - Evita "ifs" espalhados; dita como um Lead vira Opportunity, Quotation vira Contract, etc.

### 1.4 Public Portal / Marketing
- **Aggregate Root:** `PublicForm` / `LeadCapture`
  - **Ownership:** Landing Page, área pública (About, Services, Compliance, Contact).
  - **Comportamento:** Não acessa o CRM diretamente. Publica eventos de domínio (`LeadRequested`) para que o Commercial decida o que fazer.

### 1.5 Catalog (Master Data Funcional)
- **Aggregate Root:** `Service`
  - **Ownership:** Catálogo estático de serviços prestados (ex: Coleta de resíduos).
- **Aggregate Roots:** `WasteType`, `Container`, `Unit`, `Equipment`
  - **Comportamento:** Deve existir *antes* de Quotations, Commercial e Operations.

### 1.6 Pricing
- **Aggregate Root:** `PricingRule`
  - **Ownership:** Determina o preço com base em região, contrato, volume, recorrência, distância, cliente, desconto ou campanha.
  - **Comportamento:** Totalmente separado do Catalog. O serviço em si não tem preço fixo; o Pricing calcula o valor.

### 1.7 Commercial
#### Aggregate Root: `Lead`
- **Ownership:** Controla a entrada crua de interessados.
- **Invariantes:** Não pode ser convertido se `LOST`.
- **Domain Events:** `LeadRegistered`, `LeadQualified`, `LeadConverted`.

#### Aggregate Root: `Company`
- **Ownership:** Master data do cliente. É o núcleo central pós-Lead.
- **Entidades:** `Contact`, `ServiceLocation`.

#### Aggregate Root: `Opportunity`
- **Ownership:** Orquestrador da negociação comercial.
- **Invariantes:** Deve pertencer obrigatoriamente a uma `Company` existente.

### 1.8 Quotations
- **Aggregate Root:** `Quotation`
  - **Ownership:** Emissão de orçamentos.
  - **Regra:** Gera *snapshots* a partir do Pricing. Uma vez gerado, não recalcula preços ativamente. É uma fotografia do momento.

### 1.9 Contracts
- **Aggregate Root:** `Contract`
  - **Ownership:** Ciclo de vida jurídico pós-venda, renovação, SLAs.
  - **Entidades:** `ServicePlan` (recorrência).

### 1.10 Scheduling
- **Aggregate Root:** `Calendar` & `Appointment`
  - **Ownership:** Visibilidade da operação futura, recorrências.

### 1.11 Operations
- **Aggregate Root:** `ServiceOrder`
  - **Ownership:** Execução do serviço, MTR, CDF.
  - **Entidades:** `Collection`, `WasteRecord`.

### 1.12 Outros Módulos Finais
- **Routing:** `Route`, `Stop` (Otimização).
- **Fleet:** `Vehicle`, `Driver` (Capacidade).
- **Billing:** `Invoice` (Contas a receber).
- **Communications:** `Template` (Central Omnichannel).
- **Master Data:** Tabelas de lookup canônicas (Cidades, Estados, IBAMA).

---

## 2. Matriz de Dependência (Dependency Matrix)

A arquitetura respeita a direção de estabilidade. O fluxo de consumo de dados (Reads) ou associação de IDs ocorre sempre de cima para baixo:

1. **Camada 0 (Fundação):** `Identity`, `Settings`, `Workflow`, `Transversal`, `Master Data`.
2. **Camada 1 (Regras Estáticas):** `Catalog`.
3. **Camada 2 (Regras Dinâmicas):** `Pricing` (depende de Catalog).
4. **Camada 3 (Aquisição):** `Public Portal` (Emite eventos).
5. **Camada 4 (Comercial):** `Commercial` (Consome eventos do Portal, mapeia Companies).
6. **Camada 5 (Negociação):** `Quotations` (Snapshot de Pricing; vinculada a Commercial/Opportunity).
7. **Camada 6 (Jurídico):** `Contracts` (Ativado após aprovação de Quotations).
8. **Camada 7 (Logística):** `Scheduling` -> `Operations` -> `Routing` -> `Fleet`.
9. **Camada 8 (Financeiro):** `Billing` (Faturamentos baseados em Operations e Contracts).
10. **Camada 9 (Apresentação Analítica):** `Dashboard` (Apenas leitura/CQRS sobre eventos de domínio).

---

## 3. Fluxo de Eventos de Domínio (Saga)

```text
1. [LeadRequested] (Public Portal) -> Aciona CRM
2. [LeadCreated] -> {Comercial}
3. [LeadMatched] -> [CompanyCreated] -> {Comercial}
4. [OpportunityOpened] -> {Comercial}
5. [QuotationRequested] -> Consulta {Pricing}, tira *snapshot* de valores -> {Quotations}
6. [QuotationApproved] -> {Quotations}
7. [ContractSigned] -> Ativa o [ServicePlanCreated] -> {Contracts}
8. [ServicePlanActivated] -> Agenda preenchida [AppointmentScheduled] -> {Scheduling}
9. [RoutePlanned] -> Define despachos -> {Routing}
10. [CollectionExecuted] -> Registra resíduo real -> {Operations}
11. [InvoiceGenerated] -> Cobra cliente -> {Billing}
```
