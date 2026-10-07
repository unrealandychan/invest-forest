/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          50: '#f2f8f4',
          100: '#e1efe6',
          200: '#c4dfd0',
          300: '#9bc6b1',
          400: '#6ea88d',
          500: '#4c8c6f',
          600: '#3a7057',
          700: '#2f5947',
          800: '#27473a',
          900: '#1b3027',
          950: '#0e1a15',
        },
        bark: {
          700: '#4a3b32',
          800: '#362a23',
          900: '#241b16',
        },
        moss: '#7ca982',
        sprout: '#a8d5ba',
        sunlit: '#f4e04d',
        clay: '#e27d60',
      },
    },
  },
  plugins: [],
}
