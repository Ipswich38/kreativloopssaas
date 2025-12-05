import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        border: '#e2e8f0',
        ring: '#3b82f6',
        background: '#ffffff',
        foreground: '#0f172a',
        primary: {
          DEFAULT: '#0ea5e9',
          foreground: '#ffffff',
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          900: '#0c4a6e',
        },
        secondary: {
          DEFAULT: '#64748b',
          foreground: '#ffffff',
          50: '#f8fafc',
          100: '#f1f5f9',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          900: '#0f172a',
        },
        destructive: {
          DEFAULT: '#ef4444',
          foreground: '#ffffff',
        },
        muted: {
          DEFAULT: '#f1f5f9',
          foreground: '#64748b',
        },
        accent: {
          DEFAULT: '#d946ef',
          foreground: '#ffffff',
          50: '#fef7ff',
          100: '#fce7ff',
          500: '#d946ef',
          600: '#c026d3',
          700: '#a21caf',
          900: '#701a75',
        },
        popover: {
          DEFAULT: '#ffffff',
          foreground: '#0f172a',
        },
        card: {
          DEFAULT: '#ffffff',
          foreground: '#0f172a',
        }
      },
      borderRadius: {
        lg: '1rem',
        md: '0.75rem',
        sm: '0.5rem',
      }
    },
  },
  plugins: [],
}
export default config