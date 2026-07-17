---
name: EcoLogic Precision
colors:
  surface: '#f9f9f9'
  surface-dim: '#dadada'
  surface-bright: '#f9f9f9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3f3'
  surface-container: '#eeeeee'
  surface-container-high: '#e8e8e8'
  surface-container-highest: '#e2e2e2'
  on-surface: '#1a1c1c'
  on-surface-variant: '#40493d'
  inverse-surface: '#2f3131'
  inverse-on-surface: '#f1f1f1'
  outline: '#707a6c'
  outline-variant: '#bfcaba'
  surface-tint: '#1b6d24'
  primary: '#0d631b'
  on-primary: '#ffffff'
  primary-container: '#2e7d32'
  on-primary-container: '#cbffc2'
  inverse-primary: '#88d982'
  secondary: '#546067'
  on-secondary: '#ffffff'
  secondary-container: '#d7e4ec'
  on-secondary-container: '#5a666d'
  tertiary: '#006059'
  on-tertiary: '#ffffff'
  tertiary-container: '#007b72'
  on-tertiary-container: '#b3fff5'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#a3f69c'
  primary-fixed-dim: '#88d982'
  on-primary-fixed: '#002204'
  on-primary-fixed-variant: '#005312'
  secondary-fixed: '#d7e4ec'
  secondary-fixed-dim: '#bbc8d0'
  on-secondary-fixed: '#111d23'
  on-secondary-fixed-variant: '#3c494f'
  tertiary-fixed: '#7bf7e9'
  tertiary-fixed-dim: '#5cdacc'
  on-tertiary-fixed: '#00201d'
  on-tertiary-fixed-variant: '#00504a'
  background: '#f9f9f9'
  on-background: '#1a1c1c'
  surface-variant: '#e2e2e2'
  waste-green: '#1C8200'
  surface-white: '#FFFFFF'
  data-blue: '#1578F7'
  alert-lime: '#E8F733'
typography:
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-sm:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-caps:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
  button-text:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  container-max: 1280px
  gutter: 24px
  margin-desktop: 64px
  margin-mobile: 20px
---

## Brand & Style

The design system is anchored in the intersection of environmental stewardship and technological precision. It targets enterprise partners and municipal stakeholders who value transparency, efficiency, and measurable sustainability outcomes. 

The visual style is **Corporate / Modern** with a lean toward **Minimalism**. It prioritizes heavy white space to symbolize clarity and "cleanliness," while utilizing structured data visualizations to build trust. The aesthetic avoids "folksy" eco-clichés, opting instead for a crisp, high-tech interface that positions waste management as a sophisticated logistics and data challenge. The emotional response should be one of quiet confidence and institutional reliability.

## Colors

The palette is dominated by **Sustainable Green**, used purposefully for primary actions and brand signifiers to reinforce the ecological mission. **Deep Graphite** provides the necessary weight for typography and structural elements, ensuring the interface feels grounded and professional. 

**Pure White** is the primary surface color, used extensively to create a "breathable" layout. **Light Gray** serves as a subtle secondary background to distinguish between different content zones without introducing visual noise. A tertiary teal and an alert lime are reserved for data visualization and status indicators, ensuring the platform can communicate complex waste metrics effectively.

## Typography

This design system utilizes a tiered typographic approach to balance marketing impact with data density. **Hanken Grotesk** is used for headlines, providing a sharp, contemporary geometric feel that communicates innovation. For the core body text, **Inter** offers maximum legibility and a neutral, systematic tone suitable for reports and dashboards.

A specialized label style using **JetBrains Mono** is introduced for technical data points, serial numbers, and "tech-forward" metadata, reinforcing the company's data-driven nature. High contrast is maintained between headline levels to ensure a clear information hierarchy, especially in long-form reports.

## Layout & Spacing

The layout follows a **Fluid Grid** model with a maximum container width of 1280px for desktop to prevent line lengths from becoming unreadable. A strict 8px spacing scale is employed to maintain mathematical harmony across all components.

- **Desktop (1440px+):** 12-column grid, 24px gutters, 64px side margins.
- **Tablet (768px - 1024px):** 8-column grid, 20px gutters, 32px side margins.
- **Mobile (320px - 480px):** 4-column grid, 16px gutters, 20px side margins.

Content should lean into generous vertical padding (64px-120px) between sections to maintain the "clean" and "transparent" brand mood.

## Elevation & Depth

Hierarchy is established through **Tonal Layers** and **Ambient Shadows**. Surfaces primarily exist on "Level 0" (White background). High-priority interactive elements like cards and modal containers use "Level 1" elevation, characterized by an ultra-soft, diffused shadow (0px 4px 20px rgba(0, 0, 0, 0.04)).

To maintain the professional and technological feel, the design avoids heavy gradients. Instead, depth is achieved by using the **Light Gray** background to "sink" non-essential areas, making the primary white cards "pop" without requiring aggressive shadows. Subtle 1px borders in a darker gray (#E0E0E0) may be used for internal card divisions to maintain structure without adding visual weight.

## Shapes

The design system employs a **Rounded** shape language to soften the industrial nature of waste management, making the technology feel more approachable and modern. 

Standard components (inputs, buttons, small cards) utilize a **0.5rem (8px)** corner radius. Large container cards and featured images should utilize the **rounded-lg (16px)** setting to create a distinct visual "frame." Interactive elements like tags or filter chips may use a full pill-shape to distinguish them from actionable buttons.

## Components

### Buttons
Primary buttons use the **Sustainable Green** with white text, featuring a subtle hover state that shifts toward the **Waste Green** tone. Secondary buttons use a ghost style with a Deep Graphite border. All buttons should have a minimum height of 48px to ensure accessibility and a "solid" feel.

### Cards
Cards are the primary vessel for information. They feature a white background, 16px rounded corners, and a 1px soft border or the ambient shadow defined in the Elevation section. Card headers should use the `label-caps` style for categories.

### Inputs & Forms
Input fields use the Light Gray background with a bottom-only border or a full subtle border that thickens and changes to Sustainable Green on focus. Error states use a high-contrast red, but success states must always use the brand green.

### Lists & Data
Lists should be "airy," using 16px of vertical padding between items. Use the mono-spaced `label-caps` for numerical data like weights (e.g., "14.5 TONS") to give them a precise, technical appearance.

### Specialized Components
- **Sustainability Tracker:** A custom progress bar component using the primary green and tertiary teal to show waste diversion rates.
- **Impact Badges:** Small, high-contrast chips using the `label-caps` font to highlight environmental certifications or specific waste types (e.g., "RECYCLABLE", "HAZARDOUS").