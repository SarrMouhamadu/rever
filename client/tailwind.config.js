/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Text"',
          '"SF Pro Display"',
          '"Helvetica Neue"',
          'sans-serif',
        ],
        display: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Display"',
          '"Helvetica Neue"',
          'sans-serif',
        ],
      },
      colors: {
        canvas: {
          DEFAULT: '#f5f5f7',
          dark: '#1c1c1e',
        },
        /* Teal principal — vif mais désaturé (esprit iOS Mint) */
        accent: {
          50: '#f0f7f5',
          100: '#dceee9',
          200: '#b8ddd4',
          300: '#8fc4b8',
          400: '#6aab9c',
          500: '#4f9488',
          600: '#3f7d72',
          700: '#35685f',
          800: '#2d534c',
          900: '#264541',
          950: '#142724',
          DEFAULT: '#4f9488',
          hover: '#3f7d72',
          foreground: '#35685f',
          muted: 'rgba(79, 148, 136, 0.14)',
        },
        /* Accents vivants non saturés — style Apple system colors adoucies */
        live: {
          sky: { DEFAULT: '#7eb3d4', muted: '#e8f2f8', dark: '#5a8fb0' },
          coral: { DEFAULT: '#e8847a', muted: '#fceee9', dark: '#c46860' },
          lavender: { DEFAULT: '#9b8ec4', muted: '#f0ecf8', dark: '#7a6fa8' },
          sage: { DEFAULT: '#8aab7a', muted: '#edf4e8', dark: '#6d8f5f' },
          peach: { DEFAULT: '#e8a87c', muted: '#fdf3ea', dark: '#c4895c' },
          rose: { DEFAULT: '#d97a8f', muted: '#fceef1', dark: '#b85f72' },
        },
        surface: {
          DEFAULT: '#fafaf9',
          dark: '#0c0c0e',
        },
      },
      boxShadow: {
        soft: '0 1px 2px rgba(12, 12, 14, 0.04), 0 8px 24px rgba(12, 12, 14, 0.06)',
        'soft-dark': '0 1px 2px rgba(0, 0, 0, 0.2), 0 12px 32px rgba(0, 0, 0, 0.35)',
        glow: '0 0 0 1px rgba(79, 148, 136, 0.12), 0 8px 32px rgba(79, 148, 136, 0.1)',
        'glow-sky': '0 8px 28px rgba(126, 179, 212, 0.18)',
        'glow-coral': '0 8px 28px rgba(232, 132, 122, 0.18)',
        'glow-lavender': '0 8px 28px rgba(155, 142, 196, 0.18)',
      },
      borderRadius: {
        '4xl': '2rem',
        apple: '1.25rem',
      },
    },
  },
  plugins: [],
};
