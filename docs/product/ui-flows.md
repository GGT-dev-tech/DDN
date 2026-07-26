# Jornadas do Usuário (UI Flows)

Este documento mapeia o passo a passo da interface na visão do usuário final, descrevendo como os domínios se conectam na prática.

## Flow 1: Do Pouso na Landing Page ao Cliente Convertido

1. **Visitante (Public Portal):** Entra no site da empresa, clica em "Solicitar Orçamento" e preenche CNPJ, Nome, E-mail e Telefone. O formulário emite um `LeadRequested`.
2. **Sistema (Automação):** Transforma no evento `LeadRegistered` e empilha no funil da equipe comercial.
3. **Vendedor (UI Comercial):** 
   - Acessa o *Dashboard*, clica no novo Lead na lista.
   - Um Drawer abre. O vendedor analisa os dados. Liga para o prospect e adiciona um log "Ligação de 10 min - Cliente precisa de coleta 2x na semana". (Activity / Timeline).
   - O vendedor clica em "Qualificar". A máquina de Workflow aceita, pois há telefone.
   - O vendedor clica em "Converter". Um modal de Match surge buscando se o CNPJ já existe na base.
   - Se é novo: Confirma. O Drawer fecha, e a UI redireciona o vendedor para a *Company Detail Page* (Página completa do novo cliente).
4. **Company Detail Page:** 
   - O vendedor nota que o Lead gerou o Cliente e uma Oportunidade automaticamente (via backend saga).

## Flow 2: Emissão e Aprovação de Orçamento

1. **Vendedor (UI Opportunity):** 
   - Na aba "Oportunidades" do cliente, o vendedor clica na Oportunidade.
   - Clica em "Novo Orçamento". Um Wizard de tela inteira se abre.
2. **Quotation Builder (Wizard):**
   - **Passo 1 (Serviços):** Seleciona do Catálogo "Coleta de Infectantes", define 2 contêineres e frequência 2x por semana.
   - **Passo 2 (Precificação):** A matriz de preço carrega os valores tabelados. O vendedor insere 5% de desconto (Validação de Workflow de alçada de desconto ativada).
   - **Passo 3 (Resumo):** Visualiza o Preview do PDF, salva e gera o *Snapshot*.
3. **Aprovação:**
   - O cliente aceita via assinatura digital (evento de integração).
   - O status do orçamento muda para "Aprovado". Workflow muda a Oportunidade para "Ganha".
   - Botão "Gerar Contrato" se torna visível na interface.

## Flow 3: Despacho Operacional Diário

1. **Gerente de Frota (UI Routing/Scheduling):**
   - Abre o Mapa de Roteirização pela manhã.
   - O sistema sugere 15 paradas no caminhão A01 baseado nos Service Plans gerados pelos contratos aprovados.
   - O Gerente arrasta e solta (Drag and Drop) a ordem de paradas no mapa e clica em "Iniciar Rota".
2. **Motorista (Aplicativo / Mobile UI):**
   - Recebe a Rota A01. 
   - Chega ao Service Location. Abre o Drawer da Ordem de Serviço, insere o peso aferido e finaliza a parada. O MTR é impresso ou gerado digitalmente.
