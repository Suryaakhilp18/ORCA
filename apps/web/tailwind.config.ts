import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ocean: {
          950: "#040914",
          900: "#071224",
          850: "#0a1832",
          800: "#0f2347",
          700: "#163466",
        },
        marine: {
          cyan: "#00e5ff",
          teal: "#00bfa5",
          amber: "#ffb300",
          crimson: "#ff1744",
          emerald: "#00e676",
        }
      }
    },
  },
  plugins: [],
};

export default config;
