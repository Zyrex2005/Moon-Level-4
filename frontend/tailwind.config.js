/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        zyrex: {
          950: '#07080c', // Deep obsidian background
          900: '#0d1117', // Surface card background
          850: '#161b22', // Card hover / elevated
          800: '#21262d', // Border stroke dark
          700: '#30363d', // Muted stroke
          400: '#8b949e', // Text muted
          300: '#c9d1d9', // Text body
          100: '#f0f6fc', // Heading text
        },
        cyan: {
          400: '#38bdf8',
          500: '#00f2fe',
          600: '#0284c7',
        },
        violet: {
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
        },
        amber: {
          400: '#fbbf24',
          500: '#f59e0b',
        },
        emerald: {
          400: '#34d399',
          500: '#10b981',
        },
      },
      boxShadow: {
        'glow-cyan': '0 0 25px -5px rgba(0, 242, 254, 0.25)',
        'glow-violet': '0 0 25px -5px rgba(139, 92, 246, 0.25)',
        'glow-amber': '0 0 25px -5px rgba(245, 158, 11, 0.25)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      borderRadius: {
        'seal': '16px',
        'glass': '20px',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 15px -3px rgba(0, 242, 254, 0.3)' },
          '100%': { boxShadow: '0 0 25px 3px rgba(139, 92, 246, 0.4)' },
        }
      }
    },
  },
  plugins: [],
}

