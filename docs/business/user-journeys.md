# Jornadas de Usuários (User Journeys)

Este documento descreve os caminhos felizes e o fluxo de interação macro de cada ator (persona) com o sistema. Toda nova interface de usuário e modelagem de API deve refletir as necessidades descritas nestas jornadas.

## 1. Administrador (Gestão Global)
O administrador tem a visão tática e de controle global da plataforma, orquestrando fluxos comerciais, operacionais e financeiros.
```text
Dashboard (Visão Macro)
  ↓
CRM (Visão do Funil)
  ↓
Cliente (Aprovações Jurídicas)
  ↓
Orçamento (Aprovação de Preços Especiais)
  ↓
Agenda (Gestão de Capacidade)
  ↓
Operação (Auditoria de Coletas e Emissão de CDFs)
  ↓
Financeiro (Faturamento Consolidado)
```

## 2. Comercial (Vendas e Atendimento B2B)
Foca na atração, relacionamento e conversão inicial, utilizando o Catálogo como balizador, sem acessar módulos de frota ou despachos.
A visualização principal no frontend para gerenciar Leads e Oportunidades é feita primariamente através de **List Views** com filtros ricos, pesquisa rápida e um painel lateral (Drawer) para detalhes e histórico de interações.

```text
Lead (Origens diversas: Website, Admin, API)
  ↓
Qualificação e Contato (Registros e Interações no Drawer)
  ↓
Conversão em Empresa (Company)
  ↓
Abertura de Oportunidade (Opportunity)
  ↓
Orçamento (Simulação técnica baseada no Catalog)
  ↓
Follow-up (Negociação de Prazos/Preços)
  ↓
Contrato e Assinatura
```

## 3. Cliente (Persona Externa B2B)
A jornada de self-service que garante transparência para o tomador de serviço. Inicia no domínio público e se materializa no Portal.
```text
Landing Page Institucional
  ↓
Solicitar orçamento (Gera um Lead no CRM)
  ↓
Contato Comercial (Negociação Offline/Online)
  ↓
Contrato Assinado
  ↓
Portal do Cliente (Login Seguro)
  ↓
Histórico de coletas (Transparência de Agendas)
  ↓
Documentos ambientais (Download MTRs/CDFs/Faturas)
```

## 4. Operação (Planner / Despachante)
A espinha dorsal logística da empresa, focada na execução de campo de forma otimizada.
```text
Agenda (Visão de Demandas do Dia)
  ↓
Planejamento (Análise de Proximidade Espacial)
  ↓
Rota (Criação do Despacho do Caminhão)
  ↓
Execução (Acompanhamento do Motorista em Campo)
  ↓
Baixa (Lançamento do Peso Real / Volume Coletado)
  ↓
Relatório (Preparação para Faturamento / MTR)
```
