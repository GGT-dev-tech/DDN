# Notificações e Alertas (System & Push)

O módulo de Notificações, gerido pelo Contexto Transversal/Workflow e Settings, é essencial para colaboração assíncrona entre os times do ERP.

## 1. Ícone do Sino (Bell Notification Hub)

O ponto focal de atenção assíncrona do usuário, localizado na Topbar.
- Um badge numérico vermelho indica a quantidade de notificações não lidas.
- **Drawer de Notificações:** Clicar no sino abre um Side Panel com a lista em estilo feed.
- **Design de Card:** Título em negrito (Ação), Subtítulo (Entidade/Detalhe), Horário Relativo (ex: "há 5 minutos"). Um avatar de quem gerou a ação (ou ícone do sistema).
- **Ação Rápida:** Clicar em um card do sino marca-o como lido e roteia o usuário imediatamente para o Contexto ou Entidade correspondente (ex: abre o Orçamento aprovado).

## 2. Tipos de Notificações (Channels)

As automações de Workflow disparam eventos nos seguintes canais mapeados:

- **Sino Interno (In-App):** Para fluxos operacionais normais. Ex: "Você foi assinalado (mention) num Lead".
- **E-mail (Transacional):** Para comunicações externas ao Tenant, como envio de PDFs de orçamento ao prospect, boletos de cobrança, ou resumo analítico de final de mês ao gestor.
- **WhatsApp (API):** Notificações urgentes para Motoristas, e tracking de coletas para os Clientes.

## 3. Configuração Pessoal vs Global

- O Administrador do Tenant pode configurar notificações globais em `Settings` (ex: Alertar time financeiro de todo Inadimplente novo).
- O próprio usuário deve ter uma sub-aba em "Seu Perfil" para ligar/desligar notificações não obrigatórias para evitar Fadiga de Alerta (Alert Fatigue).
