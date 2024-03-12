/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'selector',
  content: ['./entrypoints/**/*.{html,ts}', './components/**/*.ts'],
  theme: {
    extend: {
      colors: {
        fg: 'rgb(var(--fg) / <alpha-value>)',
        bg: 'rgb(var(--bg) / <alpha-value>)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
