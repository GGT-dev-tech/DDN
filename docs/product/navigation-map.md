# Mapa de Navegação (Navigation Map)

Este documento define a estrutura global de navegação do sistema ERP, determinando como os contextos de domínio (`Bounded Contexts`) se traduzem em menus e hierarquias visíveis para o usuário final.

## 1. Sidebar Principal (Menu Lateral)

A Sidebar é organizada em grupos lógicos para reduzir a carga cognitiva, seguindo o fluxo de valor do negócio.

- **Dashboard**
  - Visão Geral (Indicadores Principais)
- **Comercial (Commercial)**
  - Leads
  - Clientes (Companies)
  - Oportunidades
  - Orçamentos (Quotations)
  - Contratos (Contracts)
- **Operação (Operations)**
  - Mapa de Roteirização (Routing)
  - Despachos (Service Orders)
  - Agenda (Scheduling)
  - MTRs / Documentos
- **Frota (Fleet)**
  - Veículos
  - Motoristas
- **Financeiro (Billing)**
  - Faturamento
  - Invoices (Contas a Receber)
- **Catálogo (Catalog) & Preços (Pricing)**
  - Serviços
  - Tipos de Resíduos
  - Equipamentos / Contêineres
  - Regras de Precificação (Pricing Rules)
- **Configurações (Settings)**
  - Perfil da Empresa
  - Usuários e Permissões
  - Workflows (Automações)
  - Integrações

## 2. Topbar (Cabeçalho)

Elementos de acesso rápido e transversal.

- **Global Search:** Busca onipresente que indexa Clientes, Leads, Oportunidades, Contratos e Veículos.
- **Notificações:** Alertas do sistema (Workflow, Atribuições).
- **Ações Rápidas (+):**
  - Novo Lead
  - Novo Cliente
  - Novo Orçamento
  - Nova Ordem de Serviço
- **User Profile:** Avatar do usuário logado (Acessa Minha Conta, Logout).

## 3. Comportamento Responsivo

- **Desktop:** Sidebar expandida por padrão, colapsável (icons only) para liberar espaço no mapa ou tabelas muito largas.
- **Tablet/Mobile:** Sidebar oculta, acessível via menu Hamburger. Ações Rápidas migram para Floating Action Button (FAB) no mobile.
