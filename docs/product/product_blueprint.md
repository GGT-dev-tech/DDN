# DDN OS: Product Blueprint (O Inventário de Telas)

## 1. Objetivo

Este documento funciona como o **Sitemap e Catálogo de Telas** da plataforma. 
Nele, listamos cada espaço que o usuário poderá acessar, agrupados logicamente. Este documento não detalha o interior da tela (isso fica para os *Screen Contracts*), mas sim a macro-organização da experiência.

---

## 2. O Paradigma do Workspace

A DDN OS rejeita o conceito de "Dashboards estáticos e painéis de menus infinitos".
Tudo começa e gira em torno do **Workspace**.

- **Workspace:** É a "home" universal. Em vez de uma tela em branco, o Workspace exibe:
  - **KPIs do dia:** (146 coletas, 8 contratos aguardando, 12 rotas).
  - **Alertas de ação imediata:** (2 veículos quebrados, 1 licença vencendo).
  - **Timeline Global:** Atividades recentes.
  - **Mini-Mapa Integrado:** Visão rápida de onde as rotas atuais estão ocorrendo.

---

## 3. Inventário de Telas e Módulos

### 3.1. Comercial
*Onde os negócios nascem e são formalizados.*
- `Leads` (Listagem)
- `Lead Details` (Split view/Drawer com enriquecimento de dados)
- `Companies` (Listagem de clientes qualificados)
- `Company Details` (Dashboard específico 360° do cliente: cotações, contratos, contatos e histórico)
- `Quotations` (Listagem de propostas ativas/perdidas)
- `Quotation Details` (Visualizador da proposta, com cálculo embutido de pricing)
- `Contracts` (Listagem de contratos vigentes)
- `Contract Details` (Visualização dos termos e SLA)

### 3.2. Catálogo e Precificação (Parametrização)
*Onde o produto é desenhado e tabelado.*
- `Service Offerings` (Listagem do que vendemos)
- `Waste Types` (Classes, periculosidade e densidade)
- `Containers` (Caçambas, bombonas e prensas)
- `Price Tables` (Listagem de tabelas de preço base)
- `Pricing Rules` (Configuração de descontos e taxas adicionais)

### 3.3. Operação (O Chão de Fábrica)
*Onde a logística ganha vida.*
- `Planning Board` (Quadro unificado de Requirements não agendados vs Frota disponível)
- `Service Plans` (Visão geral de planos recorrentes gerados por contratos)
- `Plan Details` (Drawer para ajuste de frequência e dias do plano)
- `Agendas / Schedules` (Calendário de coletas previstas)
- `Routes` (Roteiros do dia)
- `Route Details` (Drawer/Mapa interativo listando a sequência de paradas)
- `Collections` (Listagem e auditoria dos apontamentos feitos pelo motorista)
- `Fleet Map` (Mapa 100% de tela focada em monitorar os veículos)

### 3.4. Compliance
*Garantindo a lei ambiental.*
- `MTRs` (Manifestos emitidos vs pendentes)
- `MTR Details` (Visualizador do documento legal)
- `CDFs` (Certificados emitidos pós-destinação)
- `Environmental Licenses` (Gestão de licenças próprias e de terceiros)

### 3.5. Frota (Parametrização Operacional)
- `Vehicles` (Caminhões e capacidades)
- `Drivers` (Documentação e alocação)

### 3.6. Financeiro
- `Invoices` (Faturas emitidas baseadas em coletas)
- `Invoice Details` (Visualizador de quebra de custos)
- `Receivables` (Contas a receber)

### 3.7. Analytics
- `Dashboards Executivos`
- `Produtividade (Reports)`
- `Rentabilidade (Reports)`

### 3.8. Administração
- `Tenants e Filiais`
- `Users & Roles` (Papéis e acessos RLS)
- `Audit Logs`
- `Settings / Webhooks`

---

## Dependências
- Depende de: `docs/product/business_architecture.md` e `docs/product/workflows.md`.

## Impacto nas Próximas Fases
Este documento influencia diretamente:
- `docs/product/screen_contracts.md` (Para cada item desta lista, haverá um contrato de tela escrito).
- `docs/product/navigation.md` (Como o usuário salta entre os itens desta lista).
