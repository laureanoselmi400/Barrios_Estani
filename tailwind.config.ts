import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Paleta BARRIO STREET: neutros fríos + negro mate
        paper: "#FAFAF9",
        concrete: {
          50: "#F5F5F4",
          100: "#EDEDEB",
          200: "#DEDEDB",
          300: "#C9C9C5",
          400: "#A3A39E",
          500: "#7A7A75",
        },
        ink: {
          DEFAULT: "#111111", // negro mate
          soft: "#2A2A28",
        },
        // Amarillo de marca (tomado del logo "Barrio." del Instagram)
        brand: { DEFAULT: "#F4D12E", dark: "#D9B914" },
        accent: "#F4D12E",
        alert: "#B3261E",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        logo: ["var(--font-logo)", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        street: "0.18em",
      },
      keyframes: {
        "slide-in": {
          from: { transform: "translateX(100%)" },
          to: { transform: "translateX(0)" },
        },
        "fade-in": { from: { opacity: "0" }, to: { opacity: "1" } },
        marquee: { from: { transform: "translateX(0)" }, to: { transform: "translateX(-50%)" } },
      },
      animation: {
        "slide-in": "slide-in 0.3s cubic-bezier(0.22, 1, 0.36, 1)",
        "fade-in": "fade-in 0.25s ease-out",
        marquee: "marquee 30s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
