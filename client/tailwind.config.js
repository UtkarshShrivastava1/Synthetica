/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dialectic: {
          bg: '#07090E',
          surface: '#0F131D',
          border: '#1E2638',
          subtle: '#2A344D',
        },
        agentA: {
          light: '#818CF8',
          DEFAULT: '#6366F1', // Indigo
          dark: '#4338CA',
          glow: 'rgba(99, 102, 241, 0.25)',
          accent: '#06B6D4',
        },
        agentB: {
          light: '#FBBF24',
          DEFAULT: '#F59E0B', // Amber
          dark: '#B45309',
          glow: 'rgba(245, 158, 11, 0.25)',
          accent: '#F43F5E',
        },
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.3s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
