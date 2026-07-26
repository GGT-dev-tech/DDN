# Event Storming - Quotation Bounded Context

| Event | Command | Actor | Notes |
| :--- | :--- | :--- | :--- |
| `QuotationDraftCreated` | `CreateQuotation` | Sales Rep | Cotação iniciada no estado inicial `DRAFT`. Snapshot inicial gerado (se for o caso). |
| `QuotationItemAdded` | `AddQuotationItem` | Sales Rep | Item foi atrelado à cotação. |
| `QuotationItemRemoved` | `RemoveQuotationItem` | Sales Rep | Item foi removido da cotação. |
| `QuotationPriced` | `CalculateQuotation` | Sales Rep / System | O cálculo foi processado via Pricing Engine e a cotação mudou para `PRICED`. |
| `QuotationSnapshotGenerated` | (Interno) | System | Snapshots de preço e catálogo foram gerados e anexados aos itens (historização ativada). |
| `QuotationSubmitted` | `SubmitQuotation` | Sales Rep | A cotação foi enviada ao cliente. Valores travados e bloqueados. |
| `QuotationApproved` | `ApproveQuotation` | Customer / Sales | Cotação aceita. Gera evento assíncrono para notificar o contexto de Contracts. |
| `QuotationRejected` | `RejectQuotation` | Customer / Sales | Cotação recusada formalmente pelo cliente. |
| `QuotationExpired` | `ExpireQuotation` | System Cron | Cotação vencida automaticamente pelo sistema (passou da data de validade sem aprovação). |
