# Pricing Event Storming

## 1. Domain Events

| Event | Trigger / Command | Actor | Notes |
|-------|------------------|-------|-------|
| `PriceTableCreated` | `CreatePriceTable` | Admin / Manager | Uma nova tabela de preços é criada em rascunho. |
| `PriceTableActivated` | `ActivatePriceTable` | Admin / Manager | A tabela entra em vigor (respeitando `effective_date`). |
| `PriceTableArchived` | `ArchivePriceTable` | Admin / Manager | A tabela deixa de ser aplicada para novas negociações. |
| `PriceTableItemAdded` | `AddPriceTableItem` | Admin / Manager | Um preço base é configurado para um serviço do catálogo, com unidade e valor. |
| `PricingRuleCreated` | `CreatePricingRule` | Admin / Manager | Nova regra (desconto/taxa) adicionada ao motor com escopo definido. |
| `PriceCalculationCompleted` | `CalculatePrice` | System / Sales | Evento analítico gerado quando o motor finaliza o processamento de uma proposta. (Opcional) |

*(Nota: O evento de congelamento do orçamento e o Snapshot formam o Bounded Context de **Quotation**, que será construído separadamente).*

## 2. Reactions (Policies)

- **Ao escutar `CatalogItemArchived` (Catálogo):**
  - **Ação:** O Pricing Module pode desabilitar temporariamente regras atreladas ao serviço, ou apenas levantar um "Alerta de Inconsistência" indicando que há tabelas de preços apontando para serviços extintos.
- **Ao escutar `PriceTableActivated`:**
  - **Ação:** Se outra tabela do mesmo escopo (mesmo cliente, mesma região) estiver ativa, ela deve ter sua data de encerramento (`end_date`) automaticamente preenchida para não encavalar validade, garantindo que apenas uma base de preço por cenário esteja válida.
