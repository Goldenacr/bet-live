/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: '#ef4444',
        dark: '#0f172a',
        card: '#1e293b',
        pitch: '#2e7d32'
      }
    },
  },
  plugins: [],
}
