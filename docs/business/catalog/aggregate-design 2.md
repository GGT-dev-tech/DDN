# Catalog Context: Aggregate Design

Este documento define os limites de consistência (Aggregates) e entidades do Bounded Context **Catalog**, estabelecendo a estrutura para a Gestão de Catálogo de Serviços do ERP.

## 1. Aggregate: ServiceOffering

**Responsabilidade:** Definir o "O que vendemos". É o catálogo master de serviços que a empresa oferta (ex: Coleta de Resíduos, Locação de Caçamba, Destinação).

### Entidades

*   **ServiceOffering (Root)**
    *   `id`: UUID
    *   `tenant_id`: UUID
    *   `name`: String
    *   `description`: String
    *   `category`: String (Rental, Collection, Disposal, Recycling, Transport, etc.)
    *   `status`: Enum (DRAFT, ACTIVE, INACTIVE, ARCHIVED)
    *   `default_uom_id`: UUID (FK para UnitOfMeasure)
    *   `effective_date`: Date (Data de vigência para estratégia de versionamento)
    *   `end_date`: Date (Opcional, fim da vigência)
    *   `created_at`: DateTime
    *   `updated_at`: DateTime

### Invariantes
*   O nome do serviço deve ser único dentro do Tenant para o período de vigência ativo.
*   Serviços "ARCHIVED" ou "INACTIVE" não podem ser adicionados a novos Quotations (Orçamentos) ou Pricing Rules, mas são mantidos por integridade histórica.
*   **Estrutura Flat:** O serviço é avulso. Composições (Kits) serão tratadas futuramente via um `ServiceBundle`, mantendo a raiz do Offering o mais atômica possível nesta etapa.

---

## 2. Aggregate: ServiceAttribute

**Responsabilidade:** Definir as particularidades paramétricas globais, permitindo a personalização de atributos comerciais e operacionais (Frequência, Capacidade, Tipo de Resíduo, Equipamento).

### Entidades

*   **ServiceAttribute (Root)**
    *   `id`: UUID
    *   `tenant_id`: UUID
    *   `name`: String (ex: "Tipo de Resíduo", "Frequência", "Capacidade")
    *   `attribute_type`: Enum (WASTE_TYPE, CONTAINER_TYPE, FREQUENCY, CAPACITY, NUMERIC)
    *   `possible_values`: JSONB (A lista global de todos os valores possíveis para esse atributo no Tenant)
    *   `is_required`: Boolean

*   **ServiceOfferingAttribute (Associação Entity)**
    *   `service_offering_id`: UUID
    *   `service_attribute_id`: UUID
    *   `allowed_values`: JSONB (Um subconjunto dos `possible_values` mestre, restringindo as opções apenas àquelas válidas para este serviço específico)

### Invariantes
*   Não podem existir atributos com nomes idênticos no mesmo Tenant para não poluir a parametrização do negócio.
*   Os `allowed_values` do vínculo de um serviço não podem conter valores que não existam na lista `possible_values` do atributo mestre.

---

## 3. Aggregate: UnitOfMeasure (UOM)

**Responsabilidade:** Padronização transversal das métricas de quantificação e medição usadas no Catalog e obrigatoriamente herdadas por Pricing, Quotations e Operations. Nesta sprint, foca em cadastro e classificação. (Conversões automáticas serão implementadas em etapas futuras).

### Entidades

*   **UnitOfMeasure (Root)**
    *   `id`: UUID
    *   `tenant_id`: UUID
    *   `symbol`: String (ex: "m³", "ton", "un", "km", "hr")
    *   `name`: String
    *   `base_type`: Enum (VOLUME, WEIGHT, UNIT, DISTANCE, TIME)

### Invariantes
*   O Símbolo (`symbol`) deve ser único por Tenant.
*   Uma vez atrelado a um Pricing Rule, Contract ou Catalog, a deleção física é bloqueada.

---

## Associações Estruturais (Service Catalog)

*   **ServiceOffering x ServiceAttribute:** Um **ServiceOffering** pode estar vinculado a múltiplos **ServiceAttribute** (Ex: "Locação de Caçamba" possui os atributos "Capacidade" e "Tipo de Resíduo"). Essa relação será representada internamente como uma tabela associativa `ServiceOfferingAttribute` com a especialização de `allowed_values`.
*   **ServiceOffering x UnitOfMeasure:** Um **ServiceOffering** possui uma **UnitOfMeasure** padrão (ex: Locação é cobrada por "un", Destinação por "ton", Transporte por "viagem").

---

## Relacionamento com Outros Bounded Contexts

*   **Quem ele consome:** Ninguém. Ele depende apenas do *Shared Kernel* para validações e disparo de eventos de domínio. **Não depende do Master Data**. É a fonte independente dos serviços oferecidos.
*   **Quem o consome (Downstream):**
    *   **Leitura Inter-Context:** Futuramente, implementaremos um mecanismo (como uma interface RPC interna, Materialized Views ou event-carried state transfer) para que Pricing, Quotations e Operations leiam este catálogo de forma performática.
    *   **Pricing**: Avalia qual `ServiceOffering` e quais `ServiceAttribute`s ativam determinada regra de preço (PricingRule).
    *   **Quotations (Commercial)**: Seleciona `ServiceOfferings` durante o rascunho de um orçamento.
    *   **Contracts**: Baseia o contrato (Service Plan) em itens oferecidos.
    *   **Operations**: A execução (Service Order) deve referenciar um serviço real da carteira do cliente, validando as regras do catálogo.
