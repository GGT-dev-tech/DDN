# Pricing Aggregate Design

## 1. PriceTable (Tabela de Preços)
**Aggregate Root**
Tabelas de preços contêm a listagem do preço base dos serviços para uma região ou cliente específico.

**Entidades Internas**:
- `PriceTableItem`: O preço base para um `ServiceOffering` ou combinação de `ServiceOffering` + `ServiceAttribute`. 
  - Possui `service_offering_id`
  - Possui `unit_of_measure_id` (para definir a unidade de cálculo, ex: R$ / KM, R$ / Tonelada)
  - Possui `unit_price`

**Invariantes:**
- Toda tabela deve ter uma `effective_date`. Se houver `end_date`, `end_date` deve ser maior que `effective_date`.
- Não pode haver dois `PriceTableItem` ativos simultaneamente para o mesmo serviço (com a mesma UOM) na mesma tabela.

## 2. PricingRule (Regra de Precificação)
**Aggregate Root**
Define regras de descontos, acréscimos, ou limites aplicáveis.

**Invariantes:**
- Deve possuir um `PricingRuleScope` explícito (GLOBAL, CUSTOMER, SERVICE, REGION, CONTRACT).
- Regras conflitantes no mesmo escopo devem ser desempatadas por prioridade (`priority`).

## 3. PriceCalculationEngine (Domain Service)
Não é um Aggregate, é um Serviço de Domínio que recebe como input:
1. `ServiceOffering` e UOM (Catálogo)
2. `PricingContext` (customer_id, region_id, contract_id)
3. Quantidade e Local

E avalia as `PriceTable` aplicáveis e as `PricingRule` ativas, retornando um resultado final através do `PriceCalculationResult`.

## 4. Value Objects
- `PriceCalculationInput`: Estrutura de requisição para o motor.
- `PriceCalculationResult`: O resultado computado da precificação (temporário e efêmero na ótica do Pricing Context). Não é salvo no banco do Pricing.
- `Money`: Padrão de valor financeiro (moeda e valor).

*(Nota: O snapshot do valor calculado e seu congelamento comercial pertencem ao futuro Bounded Context de **Quotation**, que armazenará o `QuotationSnapshot`)*
