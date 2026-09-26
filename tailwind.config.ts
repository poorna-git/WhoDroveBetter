import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Retro Rally palette
        bg: {
          DEFAULT: "#1B1B1B",
          card: "#2A2A2A",
          hover: "#333333",
        },
        accent: {
          red: "#FF4444",
          yellow: "#FFD700",
          green: "#4CAF50",
        },
        text: {
          DEFAULT: "#F0ECE3",
          muted: "#6B6B6B",
          secondary: "#B0A89A",
        },
        tier: {
          common: "#6B6B6B",
          enthusiast: "#4FC3F7",
          premium: "#BB86FC",
          exotic: "#FF8C00",
          unicorn: "#FF4444",
        },
      },
      fontFamily: {
        heading: ['"Racing Sans One"', "sans-serif"],
        body: ['"Inter"', "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "monospace"],
      },
      animation: {
        "slide-up": "slideUp 0.3s ease-out",
        "fade-in": "fadeIn 0.4s ease-out",
        "pulse-glow": "pulseGlow 2s infinite",
        "count-up": "countUp 1s ease-out",
      },
      keyframes: {
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 5px rgba(255, 68, 68, 0.3)" },
          "50%": { boxShadow: "0 0 20px rgba(255, 68, 68, 0.6)" },
        },
        countUp: {
          "0%": { transform: "scale(0.5)", opacity: "0" },
          "60%": { transform: "scale(1.1)" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
