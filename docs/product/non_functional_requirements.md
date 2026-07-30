# DDN OS: Non-Functional Requirements (NFRs)

## 1. Objetivo
Garantir que a engenharia entregue uma plataforma que, além de executar processos de negócio com perfeição, seja segura, rápida, resiliente, auditável e escalável. Os NFRs descritos aqui são restrições impostas a todos os domínios.

---

## 2. Requisitos Transversais (Quality Gates)

### NFR-001: Desempenho e Tempos de Resposta (Performance)
- **Telas Críticas (Workspace, Operação):** TTI (Time to Interactive) máximo de 1.5s na rede 4G.
- **Consultas a Banco:** Listagens paginadas e filtradas não devem demorar mais que 200ms na camada de API.
- **Relatórios Analíticos:** Relatórios pesados não devem bloquear o Event Loop ou o uso do frontend; eles devem rodar em filas (Background Jobs) e notificar o usuário quando prontos (via SignalR / WebSockets).

### NFR-002: Disponibilidade e Resiliência (Availability)
- A operação de gestão de resíduos não para (atendimento hospitalar, indústrias base). O SLA de disponibilidade base do ecossistema principal é **99.9%** (~43 minutos de *downtime* tolerável por mês).
- Atualizações sistêmicas e deploys (Frontend ou Backend) devem ocorrer sem *downtime* usando estratégias Blue/Green ou Rolling Updates.
- Módulos paralelos (Analytics) podem cair temporariamente sem impactar a capacidade de gerar rotas e despachar caminhões. (Event-Driven Architecture garante o baixo acoplamento).

### NFR-003: Privacidade e LGPD (Data Privacy)
- A plataforma lida com dados sensíveis de usuários e rastreabilidade ambiental crítica.
- Toda Exclusão de dado de geradores ou rotas será um `Soft Delete` (o registro não apaga fisicamente do banco para efeito de auditoria).
- Somente usuários com permissões explícitas e declaradas de `view:finance` podem ver cifrões ou tabelas de preços.
- A exclusão permanente (*Right to be Forgotten* da LGPD) demanda intervenção da Administração, criando logs inalteráveis de remoção em frio.

### NFR-004: Multitenancy e Row-Level Security (RLS)
- Toda e qualquer entidade inserida no sistema no nível operacional "pertence" a um **Tenant**.
- O Backend impõe segurança em banco (RLS) e em API (Filtro por Tenant-ID atrelado ao JWT/Token).
- NUNCA uma query exporá um *Company* de um *Tenant A* para o *Tenant B*, sob nenhuma circunstância.

### NFR-005: Offline-Ready e Edge (Field Operations)
- Motoristas entram em aterros sanitários e indústrias onde não há rede (3G/4G/5G).
- A aplicação do Motorista (seja um App nativo ou PWA) DEVE fazer cache dos *Requirements* da rota do dia no dispositivo.
- O Motorista DEVE conseguir apontar as coletas, tirar fotos e colher assinaturas digitais sem rede. O sistema realizará *Syncing* assíncrono transparente para o backend quando o dispositivo recuperar conectividade.

### NFR-006: Acessibilidade (Accessibility - a11y)
- O frontend administrativo (Workspace) e o Portal Cliente serão homologados contra a norma WCAG 2.2 Nível AA.
- O contraste de cor (especialmente utilizando paletas baseadas em Vidro/Glassmorphism) deve respeitar 4.5:1 para textos.
- A *Command Palette* e formulários longos devem ser 100% operáveis por Teclado, priorizando leitores de tela na exibição dos status (Loading, Error).

### NFR-007: Observabilidade (Observability)
- Logging estruturado (`JSON`). Cada log do backend e request de front trará no payload: `tenant_id`, `user_id` e o `trace_id`.
- Nenhuma falha de Front-end (React Crash) deve falhar silenciosamente (Uso obrigatório de ferramentas como Sentry ou Datadog RUM).

---

## Dependências
- Depende de: `docs/product/vision.md` (Para honrar os princípios de Offline-Ready e Security by Default).

## Impacto nas Próximas Fases
- Balizará todas as escolhas arquiteturais de Engenharia na **Fase 4 (Engineering Standards & Frontend Architecture)** e influenciará os **ADRs**, proibindo o uso de tecnologias que não consigam atender a esses SLAs e regras.
