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
        'c-bg':   '#070D18',
        'c-surf': '#0C1420',
        'c-card': '#101B2B',
        'c-bdr':  '#1C2E45',
        'c-bdrl': '#172540',
        'c-txt':  '#E6EDF6',
        'c-mut':  '#607898',
        'c-dim':  '#2E4260',
        'c-acc':  '#00C8F0',
        'c-grn':  '#00DFA0',
        'c-red':  '#FF4060',
        'c-amb':  '#FFB020',
        'c-pur':  '#9B7FFF',
        'c-pink': '#FF6EB0',
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(14px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        spin: { to: { transform: 'rotate(360deg)' } },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%':       { opacity: '0.2' },
        },
      },
      animation: {
        'fade-up':    'fadeUp 0.45s ease both',
        'fade-up-1':  'fadeUp 0.45s 0.08s ease both',
        'fade-up-2':  'fadeUp 0.45s 0.16s ease both',
        'fade-up-3':  'fadeUp 0.45s 0.24s ease both',
        'spin-fast':  'spin 0.8s linear infinite',
        'pulse-slow': 'pulse 2s infinite',
      },
    },
  },
  plugins: [],
}
export default config
