import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/{**,.client,.server}/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#fef7ee",
          100: "#fdedd6",
          500: "#f97316",
          600: "#ea580c",
          700: "#c2410c",
        },
        fantasy: {
          gold: "#d4af37",
          bronze: "#cd7f32",
          silver: "#c0c0c0",
        },
      },
      fontFamily: {
        fantasy: ["Cinzel", "serif"],
      },
    },
  },
  plugins: [require("@tailwindcss/forms"), require("@tailwindcss/typography")],
} satisfies Config;
