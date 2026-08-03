/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f1f8f3',
          100: '#ddeedc',
          200: '#bcdfc1',
          300: '#8ec799',
          400: '#5ba66d',
          500: '#0d631b',
          600: '#266f33',
          700: '#22592d',
          800: '#1d4826',
          900: '#193c22',
        },
        'waste-green': '#1C8200',
        'data-blue': '#1578F7',
        'alert-lime': '#E8F733',
        'surface-bright': '#f9f9f9',
        'surface-white': '#FFFFFF',
        'surface-container-low': '#f3f3f3',
        'surface-container-highest': '#e2e2e2',
        'tertiary-container': '#007b72',
        'on-tertiary-container': '#b3fff5',
        'tertiary': '#006059',
        'on-tertiary': '#ffffff',
        'surface-variant': '#e2e2e2',
        'on-surface-variant': '#40493d',
        outline: '#707a6c',
        'outline-variant': '#bfcaba',
        background: {
          primary: 'var(--color-bg-primary)',
          secondary: 'var(--color-bg-secondary)',
          DEFAULT: 'var(--color-bg-primary)',
        },
        text: {
          primary: 'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
        },
        border: 'var(--color-border)',
        surface: {
          glass: 'rgba(255, 255, 255, 0.7)',
          liquid: 'rgba(255, 255, 255, 0.4)',
          DEFAULT: 'var(--color-bg-secondary)',
        },
        card: {
          DEFAULT: 'var(--color-bg-primary)',
        },
        muted: {
          foreground: 'var(--color-text-secondary)',
        }
      },
      boxShadow: {
        soft: '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        glow: '0 0 15px rgba(14, 165, 233, 0.3)',
      },
      backdropBlur: {
        glass: '12px',
      },
      transitionTimingFunction: {
        spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        fluid: 'cubic-bezier(0.4, 0, 0.2, 1)',
      }
    },
  },
  plugins: [],
}
