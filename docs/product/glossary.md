# DDN OS: Glossary (Linguagem Ubíqua)

## 1. Objetivo
Evitar ambiguidades entre Negócio, UX e Engenharia. Os termos descritos aqui são os **únicos** nomes válidos a serem utilizados na comunicação, no design das telas, nas URLs, no banco de dados e nos códigos do frontend/backend. Não devem ser inventados sinônimos.

---

## 2. Atores
- **Tenant:** A empresa ou matriz detentora da licença principal do software.
- **Branch (Filial):** Unidades operacionais sob um Tenant.
- **Admin:** Usuário administrativo com controle sistêmico.
- **Driver (Motorista):** O operador logístico que conduz o veículo.
- **Customer (Cliente):** A entidade pagante que contrata a DDN.
- **Generator (Gerador):** A filial, obra ou planta específica de onde o resíduo sai. Fisicamente, é onde a coleta ocorre.

---

## 3. Comercial e Parametrização
- **Lead:** Contato inicial, ainda não formalizado no ecossistema (Pipeline Comercial).
- **Company (Empresa):** A evolução do Lead. Cadastro consolidado do cliente, já validado com CNPJ e endereço.
- **Service Offering (Serviço):** O item vendável catalogado (Ex: Locação de Caçamba de Entulho 4m³).
- **Waste Type (Resíduo):** O material físico em si, com classe e grupo (Ex: Classe I, Orgânico, Perigoso).
- **Container (Recipiente):** O equipamento físico locado para armazenar o resíduo (Ex: Caçamba, Prensas, Bombonas).
- **Price Table (Tabela de Preços):** Regras comerciais base para um conjunto de serviços, aplicadas à negociações.
- **Quotation (Cotação/Proposta):** Oferta formal de preços e serviços a um Cliente.
- **Contract (Contrato):** A Quotation formalmente aceita e ativa, com período de vigência e regras de reajuste.

---

## 4. Operação
- **Service Plan (Plano de Serviço):** A tradução operacional do Contrato. Define qual resíduo será coletado, qual frequência (ex: diário) e qual veículo/recipiente será utilizado.
- **Requirement (Requisito de Coleta):** Uma demanda isolada (pontual) gerada pelo Plano de Serviço. Representa que um local precisa de coleta.
- **Route (Rota / Roteiro):** Um agrupamento sequencial de Paradas (*Stops*) atribuidas a um Motorista e a um Veículo para um dia específico.
- **Stop (Parada):** Um ponto geográfico e momento específico dentro de uma Rota onde um ou mais *Requirements* serão atendidos.
- **Collection / Appointment (Coleta / Apontamento):** O registro fático da execução de um *Requirement*. O motorista confirma que chegou, coletou e aponta o volume estimado ou exato, podendo conter assinaturas ou fotos.

---

## 5. Compliance
- **MTR (Manifesto de Transporte de Resíduos):** Documento legal federal e estadual que rastreia a movimentação da carga (Gerador -> Transportador -> Destinador).
- **CDF (Certificado de Destinação Final):** Documento legal gerado após a carga ser recebida, tratada ou reciclada pelo destinador final, atestando conformidade.
- **License (Licença Ambiental):** Alvarás de operação com data de vencimento. Sem licença válida, um gerador não pode despachar resíduos e um transportador não pode trafegar.

---

## 6. Financeiro
- **Measurement (Medição):** Ação de cruzar as Coletas reais executadas em um período contra as regras tarifárias do Contrato (ex: cobrar extra se passou o peso).
- **Invoice (Fatura):** O documento financeiro resultante da medição, enviado ao cliente para pagamento.
- **Receivable (Recebimento):** A conta a receber lançada no módulo financeiro.

---

## Dependências
- Nenhuma dependência direta, mas reflete o modelo descrito no `domain-map.md` e em `business_architecture.md`.

## Impacto nas Próximas Fases
- É a base central para a **Fase D (Frontend Architecture)** e **Engenharia**, determinando nomenclatura de interfaces, arquivos TypeScript, tabelas e propriedades de componentes no Storybook.
- O Frontend e Backend **são obrigados** a adotar este dicionário sem traduções duplas (O código deve sempre usar `Quotation`, não `Proposal`; `Requirement`, não `Task`).
