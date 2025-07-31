// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          'bacelar': {
            'black': '#0D0D0D',
            'gold': '#B99D6B',
            'gold-light': '#D6BB8E',
            'gray-dark': '#1A1A1A',
            'gray-light': '#8A8A8A',
          }
        }
      },
    },
    plugins: [],
  }