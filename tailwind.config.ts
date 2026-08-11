import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        clinical: {
          bg: "#f6faff",
          card: "#FFFFFF",
          border: "#dff0ff",
          text: "#001e2e",
          muted: "#404943",
          red: "#0f5238",
          "red-dark": "#0a3a28",
          "red-light": "#eaf5ff",
          primary: "#0f5238",
          "primary-fixed": "#b1f0ce",
          secondary: "#356668",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};
export default config;
