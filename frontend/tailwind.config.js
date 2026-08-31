/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        mokum: {
          bg: '#0a0a0a',
          card: '#1a1a1a',
          border: '#2a2a2a',
          text: '#cccccc',
          dim: '#999999',
          red: '#cc0000',
          redlight: '#ff6b6b',
        },
      },
      fontFamily: {
        heading: ['"Arial Black"', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

