/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        sena: {
          green: '#39A900',
          'green-dark': '#2C7A1C',
          'green-light': '#7ED321',
        }
      }
    },
  },
  plugins: [],
}