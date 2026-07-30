# DDN OS: The North Star

## 1. Quem é a DDN OS?

A **DDN OS** é uma plataforma operacional especializada em gestão de resíduos que atua como um HUB inteligente. Ela integra pessoas, processos, ativos físicos e conformidade ambiental em um fluxo de trabalho contínuo, seguro e orientado a eventos.

Não somos apenas um ERP ou um sistema de gestão; somos o sistema nervoso central da operação logística e ambiental, garantindo previsibilidade, rastreabilidade e eficiência de ponta a ponta.

---

## 2. Quem usa? (Atores do Ecossistema)

O valor da DDN OS é distribuído por toda a cadeia de stakeholders. Cada perfil possui necessidades e contextos operacionais distintos:

### Atores Internos
- **Administrador:** Gerencia as regras globais, permissões, tenants e integrações sistêmicas da plataforma.
- **Diretor:** Foca na visão macro, rentabilidade, indicadores de sucesso e sustentabilidade corporativa.
- **Gerente Operacional:** Orquestra o planejamento, a ocupação da frota e garante o cumprimento dos SLAs de coleta e destinação.
- **Comercial:** Captura leads, dimensiona clientes, estrutura cotações baseadas no catálogo e negocia contratos.
- **Motorista:** O braço de execução em campo. Necessita de ferramentas offline-ready e mobile-first para atuar com clareza na rota diária.
- **Operador:** Executa pesagens, triagens e registra dados transacionais brutos no dia a dia.
- **Financeiro:** Garante a saúde da empresa faturando o que foi efetivamente medido, emitindo cobranças e conciliando pagamentos.
- **Compliance:** Valida a conformidade ambiental, auditorias e emissão de documentos governamentais críticos (MTR, CDF).

### Atores Externos
- **Cliente (Gerador):** O ponto de origem do resíduo. Necessita de transparência, fácil solicitação de serviços e comprovação legal de destinação adequada.
- **Transportadora (Parceiros):** Quando a logística é terceirizada, integra-se para compartilhar informações de rastreio e comprovantes de coleta.
- **Destinador:** A ponta final do ciclo. Recebe os resíduos para tratamento, disposição ou valorização.
- **Órgão Ambiental:** Consome relatórios, MTRs, CDFs e registros para fins fiscalizatórios e legais.

---

## 3. Qual é a Promessa?

> *"Toda informação necessária para executar uma operação deve estar disponível antes que o usuário precise procurá-la."*

Esta única frase define a experiência da DDN OS. Nós projetamos a arquitetura do produto e da interface para sermos **proativos**, não reativos.
- O Dashboard não é um mural estático, é um **Workspace** vivo que exibe o que precisa ser feito agora.
- A pesquisa (Ctrl+K) cruza dados em tempo real.
- Notificações antecipam gargalos.
- Ninguém precisará abrir 5 abas para entender o contexto de um cliente.

---

## 4. O que NUNCA faremos?

Os princípios de exclusão mantêm a plataforma fiel à sua identidade de operação inteligente ao longo do tempo. Na DDN OS, **NUNCA** teremos:

1. **CRUD por CRUD:** Telas genéricas que apenas manipulam dados em tabelas de banco de dados sem respeitar o contexto de negócio.
2. **Duplicação de Fluxos:** Múltiplas formas, menus ou locais diferentes para editar a mesma informação, criando fragmentação mental.
3. **Popups Desnecessários:** Interrupções abruptas para alertas irrelevantes ou confirmações repetitivas de baixo valor.
4. **Labirintos de Navegação:** Fluxos que obriguem o operador a pular entre três telas distintas para concluir uma única tarefa operacional (tudo deve acontecer contextualmente via side panels, drawers ou split views).
5. **Regras de Negócio no Frontend:** A interface é estritamente uma camada de apresentação e intenção; a validação, estado transacional e regras residem puramente no backend.
6. **Componentes sem Contrato:** Nenhuma tela ou componente será desenhado sem ter suas Entradas, Saídas, Eventos e Permissões rigorosamente definidos em arquitetura antes do desenvolvimento.

---

## Dependências

Nenhum. Este é o documento principal (Nível 0) que rege todas as fundações de produto.

## Impacto nas Próximas Fases

Este documento influencia direta e permanentemente:
- `docs/product/vision.md`
- `docs/product/product_blueprint.md`
- `docs/frontend/ux_architecture.md`
- `docs/frontend/design_system.md`
- `docs/frontend/frontend_architecture.md`
