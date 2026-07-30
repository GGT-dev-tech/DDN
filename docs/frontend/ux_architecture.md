# DDN OS: UX Architecture & Workspace Philosophy

## 1. O Paradigma "Workspace Philosophy"

Na arquitetura da DDN OS, a interface não é tratada como um conjunto de "páginas web". Ela é um **Ambiente Operacional (Workspace)**.

O maior inimigo da produtividade logística é a fadiga de navegação (obrigar o usuário a ter 8 abas abertas no navegador para cruzar informações de uma Rota e de um Contrato).

Para resolver isso, adotamos os seguintes padrões arquiteturais de UX:

### 1.1. Tudo acontece no Workspace (AppShell Único)
A tela raiz raramente muda. O Header, a Sidebar e os elementos de contexto (Command Palette) permanecem imóveis e responsivos. O que muda é a **Camada de Conteúdo Interna** e as **Camadas Flutuantes (Overlays)**.

### 1.2. Painéis e Drawers (Side Panels) > Novas Telas
Quando um operador está vendo a lista de "Contratos Pendentes" e clica em um contrato específico, o sistema **NÃO** navega para `/contracts/123` e perde o contexto da lista.
Ao invés disso:
- Um **Drawer/Side Panel** de 60vw a 80vw desliza da direita para a esquerda.
- O Drawer contém os "Contract Details".
- O fundo sofre um desfoque suave (Blur/Glassmorphism).
- Se o usuário precisar editar algo dentro do contrato, a edição ocorre *in-place* ou através de um Drawer secundário sobreposto. 
- O operador fecha o Drawer e continua imediatamente de onde parou na listagem.

### 1.3. Split Views para Alta Produtividade
Em telas de alta manipulação, como a criação de Rotas, a tela deve ser dividida (Split View):
- Lado Esquerdo: Lista de Requirements não alocados.
- Lado Direito: Mapa interativo ou Agenda.
A interação Drag-and-Drop entre essas zonas elimina totalmente a navegação em abas.

### 1.4. Mapas como Cidadãos de Primeira Classe
Na gestão de resíduos, a geografia importa tanto quanto o financeiro. 
- Componentes de Mapa (Leaflet/Mapbox) não são meros *widgets* jogados no canto da tela.
- Mapas assumem o protagonismo em visualizações de Rotas, Fleet Monitoring e análise Comercial. Frequentemente ocuparão 100% do Workspace (com painéis translúcidos flutuando sobre eles).

---

## 2. Padrões de Estados Universais (UI States)

Nenhum componente ou tela é considerado "pronto" sem o tratamento dos 4 estados universais de UX:

1. **Loading State (Skeleton):** Proibido o uso massivo de "Spinners" circulares bloqueantes. Toda busca de dados deve preencher a tela com `Skeletons` que simulam a estrutura visual do dado real (Skeleton de Tabela, Skeleton de Cartões), reduzindo a percepção de tempo de espera.
2. **Empty State:** Nunca exibir uma tabela vazia sem explicação. Todo Empty State deve ser acionável:
   - Exemplo Ruim: *"0 registros encontrados."*
   - Exemplo Correto: Ícone discreto + *"Nenhum contrato pendente. [Criar Novo Contrato]"*
3. **Error State:** Falhas de API (ex: 500) não podem quebrar o Workspace (ErrorBoundary do React). Um alerta elegante deve aparecer, permitindo um "Retry" pontual no componente afetado, sem perder dados já preenchidos.
4. **Success / Feedback:** Feedback visual instantâneo (Toasts no canto inferior direito) após cada mutação (Criação, Edição, Deleção).

---

## 3. Microinterações e Fluidity

O sistema deve parecer um aplicativo nativo (como Apple VisionOS ou Linear).
- As transições (abertura de Drawers, Dropdowns) devem ter durações entre **150ms e 250ms**, utilizando curvas de animação naturais (`ease-out` para entrada, `ease-in` para saída). Animações não podem ser lentas a ponto de atrasar um usuário experiente.
- Evitar saltos de layout brutais (Cumulative Layout Shift). Alturas de containers devem ser previsíveis.

---

## Dependências
- Depende de: `docs/product/product_blueprint.md` (Para saber como as telas se encaixam) e `docs/product/navigation.md` (A UX viabiliza a navegação conceitual).

## Impacto nas Próximas Fases
Este documento influencia diretamente:
- `docs/frontend/design_system.md` (Os Tokens de Blur, Glass e Z-Index são desenhados para suportar essa filosofia).
- A **Fase C (Workspace Platform)**, onde o AppShell e o gerenciamento de Side Panels serão efetivamente codificados.
