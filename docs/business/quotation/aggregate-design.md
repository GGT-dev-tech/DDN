# Quotation Aggregate Design

O contexto de Quotation é o "Coração Comercial", responsável por gerar as propostas vinculando as intenções do Comercial (Cliente) com os preços (Pricing) e serviços (Catalog).

## 1. Quotation
**Aggregate Root**
Representa a proposta oficial emitida para o cliente. 
Deve referenciar rigidamente (via weak ID) o cliente (`company_id`), mas copiar as definições de serviço e preço do momento da criação em um snapshot imutável.

**Entidades / Value Objects Internos**:
- `QuotationItem`: Uma linha da proposta (snapshot da referência do serviço, UOM e valor unitário aplicável).
- `QuotationItemSnapshot`: O congelamento do item. Contém a fotografia exata do serviço, nome, UOM, `PriceCalculationResult` e regras aplicadas para justificar o preço.
- `QuotationStatusHistory`: Histórico de evolução dos estados da cotação.

**Invariantes:**
- Uma cotação nasce em `DRAFT`.
- Apenas cotações em `DRAFT` podem ter seus itens inseridos/removidos, ou serem recalculadas.
- Ao ser precificada e revisada, ela transita para `PRICED`.
- Ao passar para `SUBMITTED`, o snapshot fica estritamente bloqueado (readonly).
- **Isolamento e Imutabilidade:** Os preços e atributos dos serviços de uma cotação aprovada em Janeiro devem continuar inalterados em Dezembro, independentemente de mudanças nas regras de Pricing ou no Catalog. Cópias Snapshot (e não referencias ativas) garantem essa imutabilidade.

## 2. Estados (Lifecycle)
O ciclo de vida da cotação mapeia transições em direção aos módulos operacionais (como Contracts):
- `DRAFT`: Proposta sendo criada e desenhada pelo Sales. Itens podem ser adicionados sem valor.
- `PRICED`: Valores calculados e aprovados internamente. Pronta para envio.
- `SUBMITTED`: Enviada formalmente ao cliente. Snapshot travado.
- `APPROVED`: Aceita pelo cliente (Emite `QuotationApproved` para que Contracts construa os acordos legais).
- `REJECTED`: Recusada pelo cliente.
- `EXPIRED`: Data de validade da cotação esgotada.

## 3. Composição de Valor
O motor do Quotation internalizará (no momento do cálculo `CalculateQuotation`) a lógica estrita:
1. **Base Price** (A partir do Pricing Engine via ACL/Gateway)
2. **Surcharges** (+) (Adicionais calculados no Pricing, ex: Deslocamento, Taxas extras)
3. **Discounts** (-) (Descontos comerciais negociados na cotação ou regras globais de Pricing)
4. **Final Price** (=)
