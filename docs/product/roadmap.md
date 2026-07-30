# DDN OS: Roadmap & Backlog Vivo

Este documento é a fonte da verdade para o estado atual do desenvolvimento da DDN OS. Ele reflete o andamento das funcionalidades seguindo o modelo de fatias verticais (*Vertical Slices*).

---

## Estratégia Inicial (Concluída ✅)
Visão, Negócio, Blueprint e UX foram oficializados na **Fase A**. Esta documentação base atua como fundação arquitetural.

---

## Estado Atual de Desenvolvimento

> **Regra do Sprint:** Nenhuma feature avança para a próxima fase sem cobrir 100% do stack (Banco, Backend, Eventos, API, Front, Testes e Commit Atômico).

### ⏳ Sprint Atual
Nenhuma Sprint ativa no momento. (Aguardando inicialização da Fase B / Plataforma).

---

## 🚀 Fases & Backlog (Vertical Slices)

### Fase B — Plataforma Base
- [ ] Configuração do Monorepo (Turborepo + Next.js).
- [ ] Configuração do Design System Base (Tailwind, Tokens).
- [ ] Configuração do MSW, Storybook e SDK (Orval).
- [ ] Setup do Playwright.

### Fase C — Workspace Base (O AppShell)
- [ ] Layout Global (Sidebar e Topbar).
- [ ] Sistema de Roteamento de Side Panels (Drawers deslizantes).
- [ ] Busca Global (Command Palette - Ctrl+K).
- [ ] Painel de Notificações.

### Fase D — Comercial
- [ ] Leads
- [ ] Empresas
- [ ] Cotações
- [ ] Contratos

### Fase E — Catálogo
- [ ] **Feature G1:** Waste Types (Tipos de Resíduos)
- [ ] **Feature G2:** Container Types (Tipos de Recipientes)
- [ ] **Feature G3:** Service Offerings (Serviços)

### Fase F — Pricing
- [ ] Tabelas de Preços Base
- [ ] Regras de Desconto e Adicionais

### Fase G — Operação & Planejamento
- [ ] Service Plans (Planos Recorrentes)
- [ ] Requirements (Geração pontual de necessidade)
- [ ] Scheduling (Agendas)
- [ ] Routing (Roteirização e Mapa)
- [ ] Collections (Apontamento / Execução)

### Fase H — Compliance
- [ ] MTR (Emissão)
- [ ] CDF (Destinação)
- [ ] Licenças Ambientais

### Fase I — Financeiro
- [ ] Medição de Coletas
- [ ] Faturamento (Invoices)
- [ ] Recebimentos

### Fase J — Analytics
- [ ] Consumer de Eventos Global
- [ ] KPIs Executivos
- [ ] Heatmaps e Relatórios

### Fase K — Administração
- [ ] Tenants e Filiais
- [ ] Papéis e Permissões (RBAC)

### Fase L — Portal
- [ ] Portal do Cliente B2B

---

## Dependências
O avanço deste backlog obedece a hierarquia de dependências onde a API dita os contratos do Frontend.

## Última Atualização
Sempre que o *Agent* concluir um ciclo de Sprint, este arquivo e os documentos afetados da Fase A devem ser revisados e sincronizados para refletir a nova realidade do software em produção.
