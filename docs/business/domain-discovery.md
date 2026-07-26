# Análise de Domínio AS IS / TO BE

## 1. Visão do Produto
A plataforma é um **ERP Operacional especializado em Gestão de Resíduos e Compliance Ambiental**. 
- **Problema que resolve:** Empresas do setor de gestão de resíduos enfrentam processos fragmentados, desconexão entre o comercial (CRM) e a logística (roteirização), resultando em baixa eficiência logística, furos documentais e dificuldade de garantir a rastreabilidade (MTR/CDF) ponta a ponta.
- **Usuários:** Equipes Comerciais, Engenharia Ambiental, Despachantes/Planejadores Logísticos, Motoristas/Operadores e Clientes finais.
- **Visão Futura:** Ser o sistema central que conecta desde a solicitação inicial (portal do cliente ou via landing page) até a entrega final no destino correto, utilizando inteligência logística (geolocalização, rotas inteligentes baseadas em raio) para otimizar os custos e maximizar as coletas (coletas de oportunidade).

## 2. Estado Atual (AS IS)
- **Processos Atuais:** Baseados em muitos controles manuais e planilhas desconexas. O CRM não conversa ativamente com as planilhas de rotas.
- **Gargalos Comerciais:** Processo de aprovação lento que depende de muitas interações manuais; perda de visibilidade sobre oportunidades pendentes.
- **Dificuldades Operacionais:** Motoristas seguindo rotas sub-otimizadas. Impossibilidade de "ver" facilmente clientes próximos que poderiam ser incluídos em uma rota já existente para economizar deslocamento.
- **Rastreabilidade:** Dependência de papéis impressos (MTRs manuais, checklists físicos) e cruzamentos complexos ao emitir os CDFs (Certificados de Destinação Final).

## 3. Estado Futuro (TO BE)
O sistema integrará de ponta a ponta o ciclo de vida do cliente e do resíduo:
- **Aquisição e Cadastro:** Clientes poderão submeter pedidos via Portal/Público, caindo no funil do CRM como Leads. O cadastro inicial é simples e é completado internamente pelo Backoffice.
- **Orçamentos:** O sistema calcula estimativas base e a equipe comercial + engenharia valida e ajusta.
- **Agenda e Planejamento:** Uma vez contratado, o sistema agenda os compromissos de coleta.
- **Roteirização Inteligente:** Ao criar rotas, o planejador (ou o sistema de forma sugerida) visualiza num mapa outros clientes em um raio de `X km` e os adiciona à rota otimizando a frota e custos.
- **Acompanhamento Operacional:** Motoristas registram status. O motorista não será uma obrigatoriedade de sistema rígida (a localização e execução pode ser feita pelo operador ou administrador base), mas terá espaço para evolução futura (rastreamento contínuo).
- **Faturamento:** Conectado à conclusão das coletas.

## 4. Módulos Futuros (Bounded Contexts)
1. **Commercial Context:** Engloba o funil (CRM), o master data (Company/Contact/ServiceLocation), negociação (Opportunity) e elaboração de propostas (Quotation). Consolida a captação e cadastro do cliente.
2. **Catalog:** Catálogo mestre de serviços, tipos de resíduos, classes, unidades de medida, preços-base e configurações de equipamentos/caçambas.
3. **Scheduling:** Janelas de atendimento, recorrências, agenda e histórico de agendamentos.
4. **Operations:** Módulo central de execução; coleta, tipo de resíduo e tratamento.
5. **Routing:** Planejamento geográfico de paradas, inteligência de proximidade e despachos.
6. **Fleet:** Cadastro de veículos, manutenções, disponibilidade.
7. **Billing:** Faturamento, fluxo financeiro, integração com emissão de boletos/NF.
8. **Geolocation:** Serviços espaciais, cálculos de distância (PostGIS), mapeamento de raio de ação.
9. **Communications:** Central de notificação omnichannel (WhatsApp, Email, SMS) guardando templates e logs de envio.
10. **Dashboard:** CQRS com visões táticas projetadas a partir dos módulos operativos e de CRM.
11. **Audit:** Trilha de auditoria obrigatória para alterações de sistema.
12. **Public Portal:** Interface B2B pública para landing pages, atração de leads e portal do cliente (self-service).

## 5. Regras de Negócio Fundamentais

### Clientes
- Cliente pode solicitar orçamento através de interfaces públicas.
- O cadastro inicial é **simplificado** (Lead). Dados completos e jurídicos são adicionados ao converter para Cliente formal (Customer).

### Orçamento
- O orçamento inicial (simulação) pode ser calculado automaticamente pelas regras do sistema.
- O **valor final e definitivo** sempre depende da validação humana (comercial + técnica).
- O documento de orçamento em si não representa um contrato fechado até o "De Acordo".

### Agenda
- Compromissos e ordens de serviço devem ter **histórico de transição de estado**.
- Qualquer alteração na janela de atendimento ou no responsável precisa gerar **auditoria**.

### Routing
- Rotas devem considerar e sugerir proximidade geográfica para reduzir custos de deslocamento.
- Um administrador (planner) pode definir e forçar a inserção de clientes próximos em uma rota.
- **O motorista não é uma dependência obrigatória do sistema:** o fluxo deve permitir que a coleta seja "baixada" manualmente pelo backoffice para garantir que a operação não trave se o app do motorista falhar.

### Geolocalização
- Não haverá rastreamento nativo em tempo real no app inicialmente (MVP). 
- O operador/motorista apenas reportará a posição com o "check-in" na parada ou de forma manual, registrando a geolocalização exata daquele momento.

### Auditoria
- Ações críticas de alteração de preço, exclusões lógicas, cancelamento de rotas, ou alteração de agenda devem registrar a tríade de segurança: `quem executou`, `quando (data/hora)` e `qual alteração ocorreu`.
