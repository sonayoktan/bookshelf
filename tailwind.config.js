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
        shelf: {
          bg: '#fce7f3',
          surface: '#fdf2f8',
          card: '#ffffff',
          border: '#fbcfe8',
          wood: '#8c4d26',
          woodEdge: '#5c3016',
          babyblue: '#89CFF0',
          babyblueHover: '#72bbf0',
        }
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        cursive: ['"Dancing Script"', '"Caveat"', 'cursive'],
      },
      boxShadow: {
        'book': '0 10px 25px -5px rgba(0, 0, 0, 0.6), 0 8px 10px -6px rgba(0, 0, 0, 0.6)',
        'book-hover': '0 25px 35px -5px rgba(0, 0, 0, 0.8), 0 12px 15px -6px rgba(0, 0, 0, 0.7)',
        'shelf': 'inset 0 4px 6px -2px rgba(255, 255, 255, 0.05), 0 15px 25px -3px rgba(0, 0, 0, 0.8)'
      }
    },
  },
  plugins: [],
}
