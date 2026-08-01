# DDN Management - Design Language

Este documento define a alma visual e interativa da plataforma. Antes de criar qualquer componente, suas regras estruturais, temporais e espaciais devem respeitar as diretrizes abaixo.

## 1. Princípios Fundamentais
A interface não é apenas utilitária; ela deve transmitir autoridade e confiança. 
- **Moderno & Premium**: Design limpo que não parece um "admin genérico".
- **Tecnológico**: Uso de efeitos contemporâneos de maneira controlada.
- **Minimalista**: Foco absoluto no dado (Rotas, Veículos, Custos).
- **Alta Legibilidade**: Contraste rígido (padrão WCAG AA).
- **Motion Sutil**: A interface "respira", não é estática, mas não deve causar distração.

### Inspirações
- Apple Human Interface Guidelines (Hierarquia e Blur)
- Linear (Precisão, Bordas e Sombras Suaves)
- Stripe (Motion e Tipografia)
- Vercel (Minimalismo Preto/Branco e Acentos)
- Raycast (Command Palettes Fluidas)

---

## 2. Estilos & Identidade Visual

### Glassmorphism (Efeito Vidro Fosco)
O blur/backdrop-filter é elegante, mas perigoso para acessibilidade.
- **ONDE USAR**: Sidebar, Navbar, Command Palette, Modais, Floating Cards, Tooltips. Elementos que se "sobrepõem" ao conteúdo de forma temporária ou ancorada.
- **ONDE EVITAR**: Grids complexos, tabelas extensas, fundos de formulários. O conteúdo de trabalho pesado precisa de fundos opacos e nítidos.

### Liquid Glass (Vidro com Brilho Dinâmico)
Um efeito premium de "vidro líquido" (gradient borders, highlights, reflexos sutis).
- **ONDE USAR**: Botões primários (Call to Action), Hover states de Cards interativos (RouteCard), tela inicial de Login, elementos de gamificação/sucesso.
- **ONDE EVITAR**: Telas administrativas inteiras, painéis puramente numéricos. O efeito "chama atenção" demais e deve ser reservado para ações.

### Shadows & Depth (Soft Shadows)
Evitar sombras duras e escuras. Usar sombras amplas, macias (spread alto, blur alto, opacidade baixíssima - ex: `0.04`), simulando luz difusa.

---

## 3. Motion Design Principles
A percepção de velocidade é crítica numa ferramenta de logística. 

- **Duração**: `150ms` (hover, botões, microinterações) a `250ms` (modais, panels expansíveis). Nada de animações lerdas de 500ms+.
- **Easing**: Sempre `ease-out` para entrada na tela (rápido no começo, suave no final) e `ease-in` para saída. Nunca usar `linear`.
- **Spring Animations**: Framer Motion/CSS Springs para transições que requerem "elasticidade" (como um Sidebar abrindo ou um modal pulsando).
- **Page Transitions**: Transições cruzadas muito rápidas (`fade` + `scale 0.98 -> 1.0`).
- **Loading Transitions**: Skeleton screens sincronizados (mesmo ritmo de onda) ao invés de spinners no centro da tela.

---

## 4. Design Tokens (A Fundação)
Nenhum componente deve usar um código HEX, espaçamento em pixel cru ou tamanho de fonte arbitrário. Tudo deriva dos tokens.
A hierarquia será construída via Tailwind/CSS Variables:
- `colors.background.primary`, `colors.brand.primary`
- `spacing.4`, `spacing.8`
- `radius.md`, `radius.full`
- `elevation.1`, `elevation.2`
- `blur.md`, `opacity.90`

*Veja a documentação de arquitetura de tokens do UI Kit.*
