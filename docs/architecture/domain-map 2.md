# Mapa Arquitetural de Domínio (Context Map)

```text
          [Identity]
              |
       [Master Data]
              |
 [Commercial] -- [Catalog] -- [Pricing]
       |             |            |
 [Quotations]--------/------------/
       |
  [Contracts]
       |
 [Scheduling]
       |
 [Operations]
       |
  [Routing] -- [Geolocation]
       |
    [Fleet]
       |
   [Billing]
              
   Transversais: [Communications], [Dashboard], [Audit]
```

## Contextos Detalhados

### 1. Identity
- **Responsabilidade:** Gestão de acesso, tenants, RLS e autenticação.

### 2. Commercial
- **Responsabilidade:** Gestão do relacionamento e aquisição B2B.
- **Aggregates:** `Lead`, `Company`, `Contact`, `Opportunity`, `Activity` (Timeline).
- **Isolamento:** Não emite contratos e nem orçamentos diretamente. A Oportunidade é o elo.

### 3. Catalog
- **Responsabilidade:** Catálogo mestre do negócio, fornecendo vocabulário comum para as regras comerciais e operacionais.
- **Aggregates:** `ServiceOffering`, `ServiceAttribute`, `UnitOfMeasure`, `WasteType`, `ContainerType`.
- **Análise de Dependências:**
  - **Quem consome (Dependents):** Pricing, Quotations, Contracts, Operations, Billing.
  - **Quem ele consome (Dependencies):** Shared Kernel.
  - **Eventos Publicados:** `CatalogItemCreated`, `CatalogItemUpdated`, `CatalogItemActivated`, `CatalogItemArchived`.
  - **Eventos Escutados:** N/A (É a fundação base).

### 4. Pricing
- **Responsabilidade:** Motor de precificação de serviços baseado no catálogo. Avalia regras de descontos, tabelas base, impostos e calcula o preço final de uma oferta.
- **Aggregates:** 
  - `PriceTable`: Tabela de preços base, com validade e restrições geográficas ou por cliente.
  - `PricingRule`: Regras de cálculo (descontos, adicionais, margens) sobre o preço base.
- **Value Objects:** `PriceCalculationResult`, `Money`.
- **Análise de Dependências:**
  - **Quem consome (Dependents):** Quotations, Contracts, Operations, Billing.
  - **Quem ele consome (Dependencies):** Shared Kernel, Catalog (Referência fraca ao ID do Serviço/UOM). Nota: Pricing não depende de Commercial; ele recebe apenas atributos contextuais (`PricingContext`) para a tomada de decisão.
  - **Eventos Publicados:** `PriceTableCreated`, `PriceTableActivated`, `PricingRuleCreated`.
  - **Eventos Escutados:** `CatalogItemActivated`, `CatalogItemArchived` (Para invalidar cache ou gerar alertas de precificação ausente).

### 5. Quotations
- **Responsabilidade:** Gerar propostas congelando dados de Catalog e Pricing.
- **Aggregates:** `Quotation` (Snapshot).

### 6. Contracts
- **Responsabilidade:** Gestão do ciclo de vida pós-venda.
- **Aggregates:** `Contract`, `ServicePlan`, `SLA`.

### 7. Scheduling
- **Responsabilidade:** Agenda operacional (ocorrências futuras).
- **Aggregates:** `Calendar`, `Appointment`, `Recurrence`.

### 8. Operations
- **Responsabilidade:** Execução e documentação ambiental.
- **Aggregates:** `ServiceOrder`, `Collection`, `WasteRecord`.

### 9. Routing
- **Responsabilidade:** Despacho logístico e otimização diária.
- **Aggregates:** `Route`, `Stop`.

### 10. Fleet
- **Responsabilidade:** Gestão dos ativos de transporte.
- **Aggregates:** `Vehicle`, `Driver`.

### 11. Billing
- **Responsabilidade:** Faturamento e contas a receber.
- **Aggregates:** `Invoice`, `Receivable`.

### 12. Communications
- **Responsabilidade:** Notificações omnichannel, templates (Email, WhatsApp, SMS).
- **Aggregates:** `Template`, `NotificationLog`.

### 13. Geolocation
- **Responsabilidade:** Cálculos espaciais transversais (PostGIS).

### 14. Master Data
- **Responsabilidade:** Tabelas canônicas imutáveis consumidas por todos.
- **Entidades:** `IBAMACode`, `MTRCode`, `Municipality`, `State`.

### 15. Dashboard
- **Responsabilidade:** Projeções (Read Models) executivas via CQRS.

### 16. Audit
- **Responsabilidade:** Compliance sistêmico, log imutável.
