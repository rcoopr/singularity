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
      opacity: {
        1: '.01',
        2: '.02',
        3: '.03',
        4: '.04',
        6: '.06',
        7: '.07',
        8: '.08',
        9: '.09',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
