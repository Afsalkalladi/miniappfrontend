/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        telegram: {
          bg: '#17212b',
          secondary: '#242f3d',
          accent: '#64b5ef',
          text: '#ffffff',
          hint: '#708499',
        }
      }
    },
  },
  plugins: [],
}
