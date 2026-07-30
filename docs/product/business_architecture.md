# DDN OS: Business Architecture

## 1. Visão Global (O Ecossistema como HUB)

A arquitetura de negócio da DDN OS transcende as barreiras de um ERP convencional. Nós somos um **HUB de Integração**, orquestrando não apenas os nossos processos internos, mas conectando toda a cadeia de stakeholders através das nossas APIs e Portais.

```text
    Clientes (Geradores)
             │
      Portal Público
             │
 ──────── DDN OS ────────
             │
         Comercial
             │
         Contratos
             │
         Operação
             │
        Compliance
             │
        Financeiro
             │
        Analytics
 ────────────────────────
             │
      Transportadoras
        Destinadores
      Órgãos Ambientais
             ERP
         Prefeituras
             SAP
```

---

## 2. Visão em Camadas (Decoupling)

Para garantir escalabilidade, a arquitetura de negócio separa estritamente a "Experiência do Usuário", os "Domínios de Negócio (Operação)", as "Capacidades de Plataforma" (que são compartilhadas) e a "Infraestrutura Técnica".

```text
               EXPERIÊNCIA
 Workspace | Portal | Analytics

────────────────────────────────────────────

                 OPERAÇÃO
 Comercial | Operação | Compliance | Financeiro

────────────────────────────────────────────

               CAPACIDADES
 Routing | Pricing | Scheduling | Identity
    Notifications | Files | Maps

────────────────────────────────────────────

             INFRAESTRUTURA
 RabbitMQ | Postgres | OpenAPI | Storage | Monitoring
```

**Por que essa divisão é crucial?**
Ao extrairmos `Notifications`, `Maps`, `Files` e `Identity` para a camada de "Capacidades", garantimos que todos os Domínios de Operação consumam os mesmos serviços. Um mapa exibido no *Comercial* (local do cliente) utiliza o mesmo motor geométrico que o *Routing* (rota do caminhão).

---

## 3. Detalhamento dos Domínios Principais (Operação)

### 3.1. Comercial
- **Responsabilidade:** Captação de clientes, relacionamento inicial e fechamento de novos negócios.
- **Entidades-chave:** Leads, Empresas, Oportunidades.

### 3.2. Catálogo & Pricing (Cadastros Fundacionais)
- **Responsabilidade:** Parametrização dos produtos vendidos e seus valores financeiros.
- **Entidades-chave:** Serviços (Service Offerings), Resíduos (Waste Types), Recipientes (Containers), Tabelas de Preços, Regras de Desconto.

### 3.3. Contratos e Planejamento
- **Responsabilidade:** Governança pós-venda. Onde a promessa comercial vira uma obrigação operacional.
- **Entidades-chave:** Cotações, Contratos, Planos de Serviço (Service Plans), SLAs.

### 3.4. Operação (Coração Logístico)
- **Responsabilidade:** Executar o trabalho real planejado nos contratos. Agendamento de coleta e coordenação espacial de veículos.
- **Entidades-chave:** Requisitos de Coleta (Requirements), Agenda, Rotas, Paradas, Ordens de Serviço, Veículos, Motoristas, Apontamentos de Resíduos (Coletas efetuadas).

### 3.5. Compliance
- **Responsabilidade:** Conformidade legal. Integrado organicamente ao final da coleta para evitar trabalho duplo.
- **Entidades-chave:** Manifestos de Transporte de Resíduos (MTR), Certificado de Destinação Final (CDF), Licenças Ambientais.

### 3.6. Financeiro
- **Responsabilidade:** Garantir o recebimento baseado na operação física real (medição) com faturamento preciso.
- **Entidades-chave:** Medições, Faturas (Invoices), Contas a Receber.

### 3.7. Analytics
- **Responsabilidade:** Domínio puramente **consumidor**. Ouve passivamente todos os eventos (Ex: `CollectionCompleted`, `InvoicePaid`) para cruzar dados e gerar insights preditivos.
- **Entidades-chave:** KPIs, Heatmaps, Indicadores de Produtividade e Rentabilidade.

### 3.8. Administração (Transversal)
- **Responsabilidade:** Gestão do ecossistema e compliance de acesso.
- **Entidades-chave:** Tenants, Filiais, Papéis (Roles), Permissões, Auditoria e Webhooks.

---

## 4. Jornadas Críticas (Macrofuxos de Negócio)

Para o Frontend focar na experiência, precisamos entender como o dado viaja pelos domínios.

### Jornada Comercial (Da Captação à Assinatura)
```text
Lead (Comercial)
 ↓
Empresa (Comercial)
 ↓
Cotação (Contratos/Pricing)
 ↓
Contrato Aprovado (Contratos)
 ↓
Plano de Serviço (Operação)
```

### Jornada Operacional & Compliance (Do Planejamento à Lei)
```text
Plano de Serviço (Operação)
 ↓
Requisito de Coleta
 ↓
Agenda (Scheduling)
 ↓
Rota (Routing)
 ↓
Coleta Efetivada (Operação no campo)
 ↓
MTR (Compliance / Legal)
 ↓
CDF (Compliance / Destinação)
```

### Jornada Financeira (Da Rua ao Caixa)
```text
Contrato Ativo (Contratos)
 ↓
Medição Real de Coleta (Operação / Analytics)
 ↓
Faturamento (Financeiro)
 ↓
Recebimento
```

---

## Dependências
- Depende de: `docs/product/vision.md` e `docs/product/north_star.md` (A arquitetura suporta os Princípios do Produto e posicionamento do HUB).

## Impacto nas Próximas Fases
Este documento será a bússola para:
- `docs/product/workflows.md` (que detalhará essas jornadas).
- `docs/frontend/ux_architecture.md` (garantindo que o Workspace reflita as camadas operacionais).
- `docs/product/capabilities.md` (que aprofundará as capacidades técnicas como Routing, Scheduling, etc).
