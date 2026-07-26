# Mapeamento de Telas (Screens)

Inventário de todas as telas planejadas, estabelecendo seus objetivos e ações primárias.

## 1. Comercial (Commercial)

### 1.1 Leads
- **Leads List View:**
  - Tabela / Kanban de Leads.
  - Colunas Padrão: Nome da Empresa, Contato, Fonte (Source), Status, Data.
  - Ações: Qualificar, Marcar como Perdido, Converter.
- **Lead Detail View (Side Drawer preferencial):**
  - Visualização de informações cruas. Componente de Timeline.
  - Ações: Converter para Cliente (Match to Company).

### 1.2 Clientes (Companies)
- **Companies List View:**
  - Tabela Rica de Clientes Ativos, Prospectos e Inativos.
  - Filtros Avançados: Por status, Região (Service Location), Tags.
- **Company Detail View (Página Completa - Hub):**
  - Layout com abas (Visão Geral, Locais, Contatos, Oportunidades, Contratos).
  - Componente de Timeline fixo no lado direito.

### 1.3 Oportunidades (Opportunities)
- **Opportunities Kanban Board:**
  - Colunas representando o Workflow (ex: Prospecção, Negociação, Aguardando Assinatura, Ganho).
  - Cards com Valor Estimado e Probabilidade.
- **Opportunity Detail View:**
  - Vinculado estritamente à Company. Aba para vincular/criar Quotations.

## 2. Emissão de Orçamentos e Contratos

### 2.1 Orçamentos (Quotations)
- **Quotations List View:**
  - Tabela com validade do orçamento, status (Enviado, Aprovado, Rejeitado).
- **Quotation Builder (Página Completa / Wizard):**
  - Wizard de construção do orçamento consumindo Catalog e Pricing.
  - Ações: Gerar PDF, Enviar por Email, Aprovar.

### 2.2 Contratos (Contracts)
- **Contracts List View:**
  - Foco em gestão de SLAs, vigência e renovação. Status de Inadimplência visual.
- **Contract Detail View:**
  - Hub do ciclo de vida pós-venda. Visualização dos Planos de Serviço ativos.

## 3. Catálogo e Precificação

### 3.1 Catalog
- **Services / Waste Types List View:**
  - Tabelas de configuração de Master Data de negócios.
- **Catalog Item Detail (Side Drawer):**
  - Formulário para editar especificações do serviço.

### 3.2 Pricing
- **Pricing Matrix View:**
  - Tabelas ricas tipo "Excel" para definir matrizes de preço baseadas em múltiplos critérios.

## 4. Operações e Rotas

### 4.1 Scheduling & Routing
- **Mapa de Despachos (Dispatch Map):**
  - View visual baseada em mapa (Geolocation). Visão de paradas por caminhão e rotas agendadas.
- **Agenda (Calendar View):**
  - Calendário semanal/mensal de coletas agendadas por plano de serviço recorrente.

### 4.2 Service Orders
- **Service Orders List View:**
  - Foco no backoffice operacional (Imprimir MTR, Fechar OS, Validar Pesagem).
- **Service Order Detail View (Side Drawer):**
  - Inputs para informar Peso Coletado, Tipo de Resíduo Efetivo, Assinatura Eletrônica e anexos de foto.
