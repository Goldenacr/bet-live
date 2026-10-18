/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: '#ef4444', // The red from your images
        dark: '#0f172a',  // Background
        card: '#1e293b',  // Card background
        pitch: '#2e7d32'  // Green pitch
      }
    },
  },
  plugins: [],
}
