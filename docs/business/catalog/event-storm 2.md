# Catalog Context: Event Storming

Este documento mapeia o ciclo de vida e o fluxo de domínio dos itens do Catálogo de Serviços do ERP. Ele evidencia os comandos (ações dos usuários) e os eventos (reações do sistema) dentro do Bounded Context **Catalog**.

## 1. Fluxo de Gestão do Catálogo (Administrativo)

Apenas usuários administrativos ou de Backoffice gerenciam o catálogo, determinando o que pode ser comercializado.

### Cadastrando uma Nova Unidade de Medida (UOM)
*   **Command:** `RegisterUnitOfMeasure`
*   **Actor:** Operations Manager / Admin
*   **Rules:** O Símbolo não pode colidir com um existente no mesmo Tenant.
*   **Event:** `UnitOfMeasureRegistered`

### Cadastrando um Novo Atributo de Serviço
*   **Command:** `DefineServiceAttribute`
*   **Actor:** Commercial Manager / Operations Manager
*   **Rules:** Nome do atributo deve ser único. Validar os tipos de valores baseados no `attribute_type` (Enum ou numérico).
*   **Event:** `ServiceAttributeDefined`

### Criando um Serviço Oferecido
*   **Command:** `DraftServiceOffering`
*   **Actor:** Commercial Manager
*   **Rules:** Inicia em status DRAFT. Exige nome, categoria e unidade de medida padrão (UOM).
*   **Event:** `ServiceOfferingDrafted`

### Vinculando Atributos ao Serviço
*   **Command:** `AttachAttributeToService`
*   **Actor:** Commercial Manager
*   **Rules:** Valida se o atributo existe e se o serviço não está arquivado.
*   **Event:** `ServiceAttributeAttached`

### Ativando um Serviço para Comercialização
*   **Command:** `ActivateServiceOffering`
*   **Actor:** Commercial Manager
*   **Rules:** O Serviço deve estar completo (ex: nome, UOM vinculada). Altera status para ACTIVE.
*   **Event:** `ServiceOfferingActivated`
*   **Impacto:** A partir de agora, o módulo `Pricing` pode definir regras de preço e o módulo `Commercial (Quotations)` pode inclui-lo em propostas.

### Atualizando um Serviço (Versioning Mudo)
*   **Command:** `UpdateServiceOffering`
*   **Actor:** Commercial Manager
*   **Rules:** Modifica informações básicas. Importante: Quotations passadas não são afetadas pois o Commercial Context deve usar snapshots.
*   **Event:** `ServiceOfferingUpdated`

### Arquivando um Serviço
*   **Command:** `ArchiveServiceOffering`
*   **Actor:** Commercial Manager
*   **Rules:** Muda status para ARCHIVED. Bloqueia a inserção em novos Quotations e a criação de novas regras no Pricing.
*   **Event:** `ServiceOfferingArchived`

---

## 2. A Fronteira com Commercial e Pricing

O Catalog é a espinha dorsal de parametrização. Os Eventos dele fluem no formato de sincronia ou apenas servem para consulta via APIs internas.

### Fluxo Comercial -> Catálogo (Projeção)
Embora o módulo `Commercial` não escreva no `Catalog`, o fluxo de venda depende estritamente de ler a projeção ativa:

1.  **Vendedor (Commercial)** acessa a criação de Oportunidade/Orçamento.
2.  **Sistema** realiza fetch dos `ServiceOfferings` ativos no **Catalog Context**.
3.  **Vendedor** seleciona "Coleta de Resíduos" (ServiceOffering).
4.  **Sistema** realiza fetch dos `ServiceAttributes` obrigatórios (ex: Capacidade, Tipo de Resíduo) vinculados ao serviço.
5.  **Vendedor** preenche "Caçamba 5m³, Classe II".
6.  **Sistema** delega para o módulo **Pricing** avaliar a combinação, utilizando a UOM ("viagem") fornecida pelo **Catalog**.

Neste momento fica claro o nível fundacional do Bounded Context **Catalog**. Ele não orquestra negócios ativamente, mas fornece as peças restritivas do xadrez.
