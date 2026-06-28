/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        navy: "#000080",
        electric: "#00E5FF",
        midnight: "#05080f",
        slateblue: "#0c1b3a",
      },
      boxShadow: {
        glow: "0 0 30px rgba(0, 229, 255, 0.35)",
      },
      fontFamily: {
        display: ["Space Grotesk", "Segoe UI", "sans-serif"],
        body: ["IBM Plex Sans", "Segoe UI", "sans-serif"],
      },
    },
  },
  plugins: [],
};
