/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        nanum: ["Nanum Gothic", "sans-serif"],
        bungee: ["Bungee", "sans-serif"],
        zentry: ["zentry", "sans-serif"],
        inter: ["Inter", "system-ui", "sans-serif"],
        outfit: ["Nanum Gothic", "General Sans", "sans-serif"],
        "circular-web": ["circular-web", "sans-serif"],
        general: ["general", "sans-serif"],
        robert: ["robert-regular", "sans-serif"],
      },
      colors: {
        "g-blue": "#4285F4",
        "g-red": "#EA4335",
        "g-yellow": "#FBBC05",
        "g-green": "#34A853",
      },
    },
  },
  plugins: [],
};
