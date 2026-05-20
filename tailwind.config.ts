import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#16A36A",
          dark: "#028E56",
          light: "#EAF8F1",
        },
        danger: "#E05A47",
        surface: {
          DEFAULT: "#FFFFFF",
          muted: "#FCFCFC",
          border: "#F0F0F0",
        },
        ink: {
          DEFAULT: "#4E4E4E",
          muted: "#A0A1A8",
          subtle: "#B2B1B5",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
