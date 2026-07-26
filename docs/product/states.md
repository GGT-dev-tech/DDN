# Estados da Interface (Visual States)

A consistência de estados visuais transmite segurança ao usuário (Trust Design) em um ERP. Devemos prever os seguintes estados padronizados para componentes:

## 1. Carregamento (Loading States)
- **Skeleton Loaders:** Usados em Páginas Completas e Hubs (ex: Company Detail) para evitar layout shift durante fetch via Orval/React Query.
- **Spinners Inline:** Usados dentro de botões primários ao submeter formulários. O botão entra em modo `disabled` e o ícone vira spinner.
- **Progress Bars:** Usadas em barras de tabela se houver `refetch` silencioso (Background refresh).

## 2. Vazio (Empty States)
Todo componente de agregação (Lista, Timeline, Grid) deve ter um `EmptyState` bonito.
- **Estrutura:** Ilustração (neutra), Título explicativo, Subtítulo com instrução e Botão Primário CTA (Call to Action).
- **Exemplo:** "Nenhuma Oportunidade Encontrada. [Criar Oportunidade]".
- Nunca exibir uma tabela com zero linhas sem contextualização amigável.

## 3. Erros (Error States)
- **Erros Globais (500s):** Toast Alert vermelho no topo direito + botão de retry genérico (Tratado pelo Query Cache do React).
- **Erros de Validação (400s / 422s):** Mensagem de erro atrelada diretamente ao input de formulário (Border red + micro-texto em baixo).
- **Not Found (404s):** Full page error para Entidades (ex: Empresa excluída). Retorna botão "Voltar ao Início".

## 4. Sucesso (Success States)
- Confirmações transacionais disparam Toasts Verdes transientes (3-5 segundos) no canto inferior esquerdo ou superior direito, ex: "Orçamento aprovado com sucesso", e desaparecem silenciosamente.

## 5. Estados de Interação de Botão
- **Idle:** Botão normal.
- **Hover:** Slight background darken.
- **Active / Pressed:** Scale down 0.98.
- **Disabled:** Cinza opaco, cursor `not-allowed`. Um botão desabilitado pelo Workflow deve mostrar um `Tooltip` explicando o motivo (ex: "Necessário e-mail para aprovar").
