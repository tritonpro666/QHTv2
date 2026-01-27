/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sofofa: {
          blue: '#1E4F8A', // Approx from logo
          lightBlue: '#5AA3D6',
          dark: '#112D55',
          accent: '#F2A900', // Gold/Yellow from logo stars
          text: '#333333',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'], // Will add Google Font later
      }
    },
  },
  plugins: [],
}
