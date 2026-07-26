# Linguagem Ubíqua (Ubiquitous Language)

Este documento centraliza os termos de negócio padronizados do projeto. A linguagem definida aqui **deve** ser utilizada obrigatoriamente no código-fonte (nomes de classes, tabelas, variáveis, APIs) e na comunicação entre as equipes.

Isso previne ambiguidades e garante que o sistema de software seja um reflexo fiel do domínio de negócio.

| Termo PT-BR | Termo no Código (EN) | Definição |
| --- | --- | --- |
| **Lead** | `Lead` | Empresa interessada que ainda não possui contrato ou validação jurídica aprovada. Fica restrita ao funil comercial. |
| **Cliente** | `Customer` | Empresa com cadastro jurídico completo, aprovada e apta a gerar contratos e orçamentos operacionais. |
| **Unidade / Filial** | `Branch` | Local físico específico do cliente de onde o resíduo será coletado (um Customer pode ter múltiplas Branches). |
| **Catálogo** | `Catalog` | A base de referência global contendo todos os serviços, resíduos e preços estruturados do sistema. |
| **Atendimento** | `ServiceExecution` / `ServiceOrder` | O ato de execução operacional de um serviço em campo. |
| **Ordem de Serviço** | `ServiceOrder` (SO) | O documento digital ou instrução de trabalho que autoriza e registra uma execução em campo. |
| **Rota** | `Route` | Um conjunto planejado geograficamente de paradas (atendimentos) atribuído a um veículo em um determinado dia. |
| **Parada** | `Stop` | Um nó dentro de uma Rota onde ocorrerá uma coleta ou entrega (relacionada a uma filial). |
| **Agendamento** | `Appointment` / `Schedule` | Reserva de data, janela de horário ou recorrência futura para prestação do serviço. |
| **Orçamento** | `Quotation` | Proposta comercial e simulação técnica de preços enviada ao cliente, sujeita a aprovação. |
| **Contrato** | `Contract` | Formalização comercial do serviço entre a empresa e o Cliente (Customer), regendo tabela de preços e reajustes. |
| **Resíduo** | `Waste` | Material gerado e a ser coletado, caracterizado por uma classificação (ex: Classe I, II, RSS). |
| **Equipamento** | `Equipment` | Item físico alocado (ex: Caçamba, Bombona, Container) onde o resíduo é acondicionado no local do cliente. |
| **MTR** | `MTR` | Manifesto de Transporte de Resíduos: documento ambiental obrigatório que acompanha a carga de ponta a ponta. |
| **CADRI** | `CADRI` | Certificado de Movimentação de Resíduos de Interesse Ambiental (ou similar dependendo do estado, como o Feam/IMA). |
| **CDF** | `CDF` | Certificado de Destinação Final: documento emitido atestando que o resíduo foi tratado/destinado corretamente. |
| **Despachante** | `Planner` | Papel do usuário backoffice responsável por organizar, aprovar e emitir as rotas diárias. |
| **Motorista** | `Driver` | Usuário/Colaborador que apenas executa a rota estabelecida pelo Planner; não é o núcleo decisório do sistema. |
