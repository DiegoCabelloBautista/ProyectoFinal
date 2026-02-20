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
        primary: "#8B5CF6",
        "primary-light": "#A78BFA",
        "primary-dark": "#7C3AED",
        "accent": "#F472B6",
        "surface": "#0F1117",
        "surface-2": "#161B27",
        "surface-3": "#1E2535",
        "border-subtle": "rgba(139,92,246,0.15)",
        "background-dark": "#0A0D14",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        display: ["Inter", "sans-serif"],
      },
      boxShadow: {
        "glow": "0 0 20px rgba(139,92,246,0.35)",
        "glow-sm": "0 0 10px rgba(139,92,246,0.25)",
        "glow-pink": "0 0 20px rgba(244,114,182,0.3)",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "hero-gradient": "linear-gradient(135deg, #0A0D14 0%, #161B27 50%, #1a1035 100%)",
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
          "0%, 100%": { boxShadow: "0 0 10px rgba(139,92,246,0.3)" },
          "50%": { boxShadow: "0 0 25px rgba(139,92,246,0.6)" },
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
