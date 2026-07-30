# DDN OS: Design System & Brand Experience

## 1. O DNA da Marca (Brand DNA)

A interface da DDN OS não pode parecer um software genérico. Ela é a manifestação visual do negócio. O design deve transmitir, no nível subconsciente, os seguintes atributos:

1. **Tecnologia & Precisão:** Interfaces extremamente alinhadas, tipografia técnica (como *Linear* ou *Vercel*) e uso milimétrico de espaços em branco. Sem ruídos.
2. **Sustentabilidade & Confiança:** Uso cirúrgico das cores institucionais (Turquesa / Verde-Lima) para ações primárias e indicativos de sucesso.
3. **Foco Operacional (No-Nonsense):** O usuário está ali para trabalhar, não para se entreter. A interface deve ser "invisível" para não disputar atenção com a complexidade logística.

---

## 2. A Filosofia Visual

### 2.1. Glassmorphism Estrutural (O Uso do "Vidro")
Inspirados no VisionOS e nas tendências ultra-modernas, adotamos o Glassmorphism não como enfeite, mas como **hierarquia estrutural**.
- **Áreas de Trabalho Sólidas:** Onde os dados vitais estão (tabelas, formulários ativos, mapas de frota), o fundo é **sólido** (tons opacos de cinza/chumbo ou branco absoluto no Light Mode) garantindo 100% de contraste e legibilidade.
- **Camadas Flutuantes (Vidro):** Elementos que "flutuam" sobre o trabalho principal (Header global, Sidebars fixas, Drawers deslizantes, Command Palette e Dropdowns) recebem o efeito *Glass* (Backdrop Blur pesado, fundo translúcido sutil com opacidade 60-80%, borda sub-pixel clara). Isso fornece o contexto espacial ao usuário de que ele "não perdeu a tela de fundo".

### 2.2. Cores e Tema
- O sistema nasce **Dark Mode First** (melhor legibilidade para telas de operação em ambientes escuros/caminhões e menor fadiga visual para operadores de balança). O Light Mode existirá, mas como variante secundária.
- **Cores Neutras:** Azuis acinzentados profundos (Slate/Zinc) para fundos e bordas.
- **Cores de Ação:** O gradiente Turquesa → Verde é reservado exclusivamente para Call-to-Actions primários e marcações de *Success/Status OK*.

### 2.3. Tipografia
- Rejeitamos fontes padrão sem personalidade (Arial/Helvetica).
- Utilizaremos uma fonte *Sans-Serif* Geométrica/Neo-Grotesque como **Inter, Roboto, ou Outfit** configurada com rastreamento (`letter-spacing`) rigoroso para densidade de dados numéricos (tabelas de preços, placas de caminhão, IDs de rotas devem alinhar perfeitamente utilizando variações Mono-espaçadas ou `tabular-nums`).

---

## 3. Motion Guidelines (Animações)

- O movimento na DDN OS indica a física do Workspace. Se um Drawer abre vindo da direita, ele deve fechar indo para a direita.
- **Durações:**
  - Rápidas (Toasts, Checkboxes, Hover states): `100ms - 150ms`.
  - Médias (Drawers, Modals, Command Palette): `200ms - 250ms`.
- **Curvas (Easing):** 
  - `ease-out` para elementos entrando na tela (começam rápido e desaceleram).
  - `ease-in` para elementos saindo da tela.

---

## Dependências
- Depende de: `docs/frontend/ux_architecture.md` (Pois materializa os Side Panels definidos lá).

## Impacto nas Próximas Fases
Este documento servirá como roteiro primário para a construção da **Fase E (Experience Foundation)**, guiando a criação de *Design Tokens*, temas Tailwind e desenvolvimento de componentes base no Storybook.
