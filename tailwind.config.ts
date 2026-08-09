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
        background: "#060807",
        foreground: "#ffffff",
        nanovita: {
          green: "#82ec06",
          dark: "#0a0d0b",
          card: "#0d110e",
          border: "#1a231d",
          muted: "#8a9a8f",
        }
      },
    },
  },
  plugins: [],
};
export default config;
