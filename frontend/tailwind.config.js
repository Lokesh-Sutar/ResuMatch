/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef4ff',
          100: '#d9e6ff',
          200: '#bcd3ff',
          300: '#8ab5ff',
          400: '#568dff',
          500: '#2f6cff',
          600: '#174de8',
          700: '#153dc4',
          800: '#1738a0',
          900: '#19357e',
        },
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(255,255,255,0.08), 0 12px 44px rgba(47, 108, 255, 0.28)',
      },
      backgroundImage: {
        mesh: 'radial-gradient(at 20% 20%, rgba(47,108,255,0.35) 0px, transparent 50%), radial-gradient(at 80% 10%, rgba(34,197,94,0.2) 0px, transparent 45%), radial-gradient(at 50% 90%, rgba(168,85,247,0.2) 0px, transparent 45%)',
      },
    },
  },
  plugins: [],
}
