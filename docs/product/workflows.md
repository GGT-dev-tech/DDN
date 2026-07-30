# DDN OS: Workflows (Fluxos de Negócio)

## 1. Objetivo

Este documento isola a lógica de negócio do roteamento de telas. Aqui, mapeamos exclusivamente "como o dado viaja" dentro do ecossistema da DDN OS, cobrindo o fluxo feliz e as exceções.

---

## 2. Workflows Principais (Happy Paths)

### WF-001: Aquisição e Implantação
O fluxo comercial desde a atração até o planejamento logístico inicial.

```text
Novo Lead (Portal/Landing Page)
        ↓
Qualificação Comercial (Enriquecimento)
        ↓
Conversão em Empresa (Company)
        ↓
Geração de Cotação (Quotation + Pricing)
        ↓
Aprovação e Geração de Contrato (Contract)
        ↓
Criação do Plano de Serviço (Service Plan)
```

### WF-002: Ciclo Logístico e Operacional (Dia a Dia)
O coração da empresa: planejar, roteirizar e coletar o resíduo no campo.

```text
Requisito de Coleta Pendente (Requirement)
        ↓
Agendamento (Scheduling / Planning)
        ↓
Geração da Ordem e Atribuição de Rota (Route)
        ↓
Despacho para o Motorista (Vehicle / Driver)
        ↓
Execução de Campo (Coleta e Apontamento Físico)
        ↓
Assinatura Digital no Local do Cliente
```

### WF-003: Compliance e Legal
Garantindo a segurança jurídica após a movimentação da carga ambiental.

```text
Coleta Concluída (Apontamento)
        ↓
Emissão do Manifesto (MTR - Transporte)
        ↓
Descarga no Destinador Homologado
        ↓
Emissão do Certificado Final (CDF - Destinação)
        ↓
Envio/Notificação ao Órgão Ambiental e Cliente
```

### WF-004: Fechamento Financeiro
Monetizando a operação efetiva.

```text
Coletas Medidas no Período
        ↓
Cruzamento com o Contrato Vigente
        ↓
Faturamento (Geração de Invoices)
        ↓
Contas a Receber
        ↓
Dashboard / Analytics de Rentabilidade
```

---

## 3. Casos de Borda (Edge Cases) e Gestão de Exceções

A realidade logística é imperfeita. O sistema precisa suportar caminhos alternativos fluídos.

### WF-E001: Falha na Coleta (Cliente Fechado)
```text
Motorista Chega ao Local
        ↓
Registro de Insucesso (Foto + Motivo "Fechado")
        ↓
Alerta Operacional no Workspace
        ↓
Reagendamento Transacional (Novo Requirement)
```

### WF-E002: Alteração Emergencial de Frota (Veículo Quebrou)
```text
Rota em Execução
        ↓
Registro de Quebra de Veículo (Fleet)
        ↓
Status da Rota = Suspensa Temporariamente
        ↓
Reatribuição Rápida (Troca de Placa e Motorista no Workspace)
        ↓
Retomada da Coleta
```

### WF-E003: Suspensão de Contrato por Inadimplência
```text
Fatura Vencida (Financeiro)
        ↓
Disparo de Evento de Suspensão
        ↓
Suspensão Automática do Service Plan
        ↓
Cancelamento de Requirements Futuros e Congelamento de Agendas
```

---

## Dependências
- Depende de: `docs/product/business_architecture.md` e `docs/product/capabilities.md`.

## Impacto nas Próximas Fases
Este documento direcionará fortemente a engenharia (como gerenciar os Integration Events no backend) e baseia o `docs/product/product_blueprint.md` ao determinar quais telas precisam permitir ações de cancelamento ou reagendamento fluido.
