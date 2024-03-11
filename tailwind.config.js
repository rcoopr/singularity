/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'selector',
  content: ['./entrypoints/**/*.{html,ts}', './components/**/*.ts'],
  theme: {
    extend: {},
  },
  plugins: [require('tailwindcss-animate')],
};
