/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'system-ui', 'sans-serif'],
      },
      colors: {
        surface: {
          DEFAULT: '#fafaf9',
          dark: '#0c0c0e',
        },
        accent: {
          DEFAULT: '#0d9488',
          hover: '#0f766e',
          muted: 'rgba(13, 148, 136, 0.12)',
        },
      },
      boxShadow: {
        soft: '0 1px 2px rgba(12, 12, 14, 0.04), 0 8px 24px rgba(12, 12, 14, 0.06)',
        'soft-dark': '0 1px 2px rgba(0, 0, 0, 0.2), 0 12px 32px rgba(0, 0, 0, 0.35)',
        glow: '0 0 0 1px rgba(13, 148, 136, 0.15), 0 8px 32px rgba(13, 148, 136, 0.12)',
      },
      borderRadius: {
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
};
