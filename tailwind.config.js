/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        audiowide: ['"Audiowide"', 'cursive'], // Add your custom font
      },
    },
  },
  plugins: [],
}
