import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@0xfacet/component-library/**/*.js",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        primary: "#C3FF00",
        "primary-foreground": "#1A1D0E",
        accent: "#888888",
        dark: "#1A1D0E",
        background:
          "radial-gradient(100% 100% at 100% 100%, #1a1d0e 0%, #000000 100%)",
        input: "rgba(255,255,255,0.1)",
        line: "rgba(255,255,255,0.1)",
        lime: {
          DEFAULT: "#C3FF00",
          50: "#EEFFB8",
          100: "#E9FFA3",
          200: "#E0FF7A",
          300: "#D6FF52",
          400: "#CDFF29",
          500: "#C3FF00",
          600: "#98C700",
          700: "#6D8F00",
          800: "#425700",
          900: "#171F00",
          950: "#020300",
        },
        gray: {
          DEFAULT: "#888888",
          50: "#E4E4E4",
          100: "#DADADA",
          200: "#C5C5C5",
          300: "#B1B1B1",
          400: "#9C9C9C",
          500: "#888888",
          600: "#6C6C6C",
          700: "#505050",
          800: "#343434",
          900: "#181818",
          950: "#0A0A0A",
        },
      },
    },
  },
  plugins: [],
};
export default config;
