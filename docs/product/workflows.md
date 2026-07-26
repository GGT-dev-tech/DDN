# Workflows (Automações e Máquina de Estado)

O módulo de `Workflow` atua como o motor de regras transversais, desacoplando a lógica de "se X acontecer, mude estado de Y para Z" dos serviços monolíticos de domínio.

## 1. Gestão de Status

Em vez de encher as entidades (`Lead`, `Opportunity`, `Contract`) com validações granulares e rígidas em código, os status seguem definições de máquina de estado do Workflow.

### Exemplo: Lead Workflow
- **Estados:** `NEW`, `QUALIFIED`, `CONVERTED`, `LOST`.
- **Transições Permitidas:**
  - `NEW` -> `QUALIFIED`
  - `NEW` -> `LOST`
  - `QUALIFIED` -> `CONVERTED`
- **Validações na Transição:**
  - Ao transicionar para `QUALIFIED`, o motor de Workflow verifica se os campos `email` ou `phone` estão preenchidos. Se não estiverem, bloqueia a transição na UI.

## 2. Automações e Webhooks

O Workflow também reage a Domain Events para disparar efeitos colaterais visuais ou integrações (Settings).

### Exemplo de Automação Visual (Side Effects)
- Evento Ocorrido: `QuotationApproved`.
- Automação A: Transiciona a `Opportunity` pai automaticamente de `Aguardando Assinatura` para `Ganha`.
- Automação B: Dispara notificação no sino (Push) para o gerente de operações.

### Customização por Tenant
A longo prazo, cada Tenant poderá configurar seus próprios gatilhos na aba "Configurações -> Workflows", adicionando ações como "Enviar e-mail de boas-vindas quando Cliente é Criado". A UI apenas consome essa árvore de regras para desenhar as opções e bloquear botões não permitidos naquele estado atual.
