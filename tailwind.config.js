/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '0px',
        none: '0px',
        sm: '0px',
        md: '0px',
        lg: '0px',
        xl: '0px',
        '2xl': '0px',
        full: '0px',
      },
      colors: {
        background: '#09090B',
        foreground: '#FAFAFA',
        muted: '#27272A',
        'muted-foreground': '#A1A1AA',
        accent: {
          DEFAULT: '#DFE104',
          foreground: '#000000',
        },
        border: '#3F3F46',
        dark: {
          950: '#07080A',
          900: '#09090B',
          850: '#161A23',
          800: '#18181B',
          750: '#27272A',
          700: '#3F3F46',
          600: '#52525B',
          500: '#71717A',
        },
        brand: {
          500: '#DFE104',
          600: '#C7C902',
          700: '#AFB102',
          accent: '#DFE104',
        },
        status: {
          ontrack: {
            bg: 'rgba(223, 225, 4, 0.1)',
            border: '#DFE104',
            text: '#DFE104',
          },
          atrisk: {
            bg: 'rgba(245, 158, 11, 0.12)',
            border: '#F59E0B',
            text: '#F59E0B',
          },
          critical: {
            bg: 'rgba(239, 68, 68, 0.15)',
            border: '#EF4444',
            text: '#EF4444',
          },
          planned: {
            bg: 'rgba(63, 63, 70, 0.5)',
            border: '#52525B',
            text: '#A1A1AA',
          },
        },
      },
      borderWidth: {
        DEFAULT: '2px',
        '0': '0px',
        '1': '1px',
        '2': '2px',
        '3': '3px',
        '4': '4px',
      },
      boxShadow: {
        card: 'none',
        modal: 'none',
        glow: 'none',
      },
    },
  },
  plugins: [],
}
