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
        primary: "#10B981", // Emerald 500
        "primary-light": "#34D399", // Emerald 400
        "primary-dark": "#059669", // Emerald 600
        "accent": "#34D399", // Emerald 400
        "surface": "#FFFFFF",
        "surface-2": "#F8FAFC",
        "surface-3": "#F1F5F9",
        "border-subtle": "rgba(16,185,129,0.1)",
        "background-dark": "#FFFFFF", // Override for legacy dark classes to white
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        display: ["Inter", "sans-serif"],
      },
      boxShadow: {
        "glow": "0 0 20px rgba(16,185,129,0.15)",
        "glow-sm": "0 0 10px rgba(16,185,129,0.1)",
        "glow-blue": "0 0 20px rgba(59,130,246,0.1)",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "hero-gradient": "linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)",
      },
      animation: {
        "float": "float 6s ease-in-out infinite",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "slide-up": "slide-up 0.4s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 10px rgba(16,185,129,0.3)" },
          "50%": { boxShadow: "0 0 25px rgba(16,185,129,0.6)" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
}
