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
          page: "#F6F6F8",
          border: "#F0F0F0",
          line: "#EAEBEF",
        },
        ink: {
          DEFAULT: "#4E4E4E",
          strong: "#3F454F",
          soft: "#696D76",
          muted: "#A0A1A8",
          subtle: "#B2B1B5",
          subtitle: "#9B9FAB",
          secondary: "#858B9A",
          tagline: "#808694",
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
