/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      animation: {
        pulseGlow: 'pulseGlow 2s infinite ease-in-out',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 10px rgba(255,255,255,0.4)' },
          '50%': { boxShadow: '0 0 20px rgba(255,255,255,0.8)' },
        },
      },
    },
  },
  plugins: [],
};
