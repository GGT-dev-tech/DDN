# DDN OS: Capabilities (Capacidades de Plataforma)

## 1. O que é uma Capacidade?

Na arquitetura da DDN OS, domínios de negócio (como Comercial, Operação e Compliance) são coleções de regras e jornadas. No entanto, as **ações fundamentais** (como gerar um arquivo PDF, disparar uma notificação, cruzar coordenadas num mapa ou autenticar um usuário) são chamadas de **Capacidades**.

Isolar Capacidades evita duplicação de esforço. O módulo *Comercial* não cria seu próprio motor de mapas; ele consome a capacidade genérica de `Geolocalizar`.

---

## 2. Inventário de Capacidades Transversais

### Autenticar e Autorizar (`Identity`)
- **Responsabilidade:** Verificar quem o usuário é (Login, JWT, SSO) e o que ele pode fazer (RBAC estrito, Row-Level Security por Tenant/Filial).
- **Consumido por:** Todos os módulos do sistema.

### Precificar (`Pricing Engine`)
- **Responsabilidade:** Motor de cálculo que lê Tabelas de Preço Base, Regras de Desconto, Impostos Locais e retorna um Valor Final.
- **Consumido por:** Comercial (Cotações), Contratos e Financeiro (Faturamento).

### Roteirizar (`Routing Engine`)
- **Responsabilidade:** Agrupar paradas (stops), otimizar o sequenciamento logístico e calcular distâncias/tempos estimados.
- **Consumido por:** Operação (Despacho Diário).

### Agendar (`Scheduling`)
- **Responsabilidade:** Motor de recorrências (ex: toda terça e quinta). Transforma um plano estático em eventos no calendário.
- **Consumido por:** Operação (Geração futura de Ordens e Coletas).

### Geolocalizar e Renderizar Mapas (`Maps`)
- **Responsabilidade:** Renderizar componentes cartográficos, mapas de calor, plotar coordenadas e calcular geofencing.
- **Consumido por:** Operação (Monitoramento da Frota), Comercial (Local do Cliente) e Analytics (Heatmaps).

### Notificar (`Communications`)
- **Responsabilidade:** Disparo assíncrono omnichannel (E-mail, SMS, WhatsApp, In-App).
- **Consumido por:** Todos. (Ex: "Contrato Assinado", "Coleta Atrasada", "MTR Emitido").

### Gerenciar Arquivos (`Storage`)
- **Responsabilidade:** Fazer upload, cache e download seguro de artefatos (Imagens, PDFs, Contratos Assinados).
- **Consumido por:** Cadastros (Fotos de contêineres), Compliance (Arquivos de Licenças) e Operação (Fotos de coletas).

### Assinar Digitalmente
- **Responsabilidade:** Integração com provedores externos de assinatura (DocuSign, ClickSign) para garantia jurídica.
- **Consumido por:** Comercial (Contratos) e Compliance (Documentação).

### Auditar (`Audit Trail`)
- **Responsabilidade:** Registro imutável temporal de "Quem fez o que, quando, e de onde". Essencial para segurança ambiental.
- **Consumido por:** Todos os módulos mutáveis.

---

## Dependências
- Depende de: `docs/product/business_architecture.md` (Detalhando a camada inferior da arquitetura de negócio).

## Impacto nas Próximas Fases
Este documento fundamenta e influencia diretamente:
- `docs/product/product_blueprint.md` (Garantindo que a UI não tente reinventar a roda construindo modais de notificação repetitivos).
- `docs/frontend/frontend_architecture.md` (As capacidades como Mapas e Autenticação se tornarão pacotes isolados ou provedores de contexto genéricos dentro do monorepo).
