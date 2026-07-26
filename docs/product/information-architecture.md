# Arquitetura de Informação (Information Architecture - IA)

Este documento descreve a hierarquia de apresentação dos dados. Ele traduz como o modelo mental do usuário mapeia a arquitetura de domínio (`Bounded Contexts`) em interfaces ricas.

## 1. O Ponto de Entrada (Company como Hub)

O conceito de **Cliente (Company)** atua como o principal hub de agregação visual do sistema para as equipes comerciais e operacionais.

### 1.1 Hierarquia Visual de "Company"
Quando o usuário acessa a página de Detalhes de um Cliente, ele enxerga abas estruturadas:
- **Visão Geral:** Métricas do cliente, Status atual, Timeline Transversal de Atividades recentes.
- **Locais de Serviço (Service Locations):** Lista de endereços onde ocorre coleta.
- **Contatos (Contacts):** Lista de pessoas.
- **Oportunidades & Orçamentos:** Histórico comercial (Quotation Snapshots).
- **Contratos:** Contratos ativos e encerrados, Planos de Serviço vigentes.
- **Operação:** Ordens de Serviço (Service Orders) passadas e futuras, MTRs vinculados a esta Company.
- **Faturamento:** Faturas e inadimplências (Billing).

## 2. Transversalidade e Otimização Visual

O sistema evita navegação excessiva (clicks) ao injetar contextos transversais diretamente na hierarquia.

### 2.1 Timeline Transversal (Activities)
A Timeline não tem página própria. Ela é renderizada como um componente lateral (Drawer ou Feed) dentro de **Leads**, **Companies**, **Opportunities** e **Service Orders**. O usuário lê, comenta e vê histórico (e-mails, WhatsApp, log de sistema) na mesma tela do contexto.

### 2.2 Tags Universais
Tags são visíveis como `Pills` (etiquetas coloridas) nas List Views (Tabelas) e nos perfis detalhados, permitindo filtros globais. Não há tela de "Gestão de Tags" isolada; elas são criadas *on the fly* (se permitido por role) ou via `Settings`.

## 3. Gestão de Domínio Estático (Catalog & Pricing)

Diferente de `Company` que é altamente mutável, o Catálogo e as Regras de Preço possuem uma interface mais estrutural.

- **Serviço (Service):** Detalhe inclui qual tipo de resíduo aceita e quais equipamentos utiliza.
- **Regras de Preço (Pricing Rules):** Detalhe não foca em histórico (Timeline), mas em matrizes de dados (Tabelas de valores por KM, por Região, por Frequência).

## 4. O Hub Operacional (Routing & Scheduling)

O modelo mental operacional inverte o hub. Ao invés do Cliente, o hub é a **Rota / Data**.

### 4.1 Hierarquia Visual Operacional
- **A Rota do Dia:** O usuário vê o Veículo, o Motorista e a sequência de Paradas (Stops).
- Cada **Parada** linka diretamente para o `Service Location` (dentro de Company) e para o `Service Order` associado.
