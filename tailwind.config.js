/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        cream: "#FDFBF7",
        gold: "#C5A880",
        "gold-light": "#D4BC94",
        "gold-dark": "#A68B5B",
        ink: "#171717",
        pine: "#0A0A0A",
        pine2: "#171717",
        parchment: "#FDFBF7",
        marigold: "#C5A880",
        marigold2: "#D4BC94",
        crimson: "#C5A880",
        mist: "#737373",
      },
      fontFamily: {
        display: ["Fraunces", "serif"],
        serif: ["Fraunces", "serif"],
        body: ["Sora", "sans-serif"],
        sans: ["Sora", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      boxShadow: {
        premium: "0 4px 24px rgba(0, 0, 0, 0.06)",
        "gold-glow": "0 0 30px rgba(197, 168, 128, 0.35)",
      },
      backgroundImage: {
        contour: "url('/contour.svg')",
      },
    },
  },
  plugins: [],
};
