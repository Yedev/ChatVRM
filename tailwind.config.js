const { light, dark } = require("@charcoal-ui/theme");
const { createTailwindConfig } = require("@charcoal-ui/tailwind-config");
/**
 * @type {import('tailwindcss/tailwind-config').TailwindConfig}
 */
module.exports = {
  darkMode: true,
  content: ["./src/**/*.tsx", "./src/**/*.html"],
  presets: [
    createTailwindConfig({
      version: "v3",
      theme: {
        ":root": light,
      },
    }),
  ],
  theme: {
    extend: {
      colors: {
        primary: "#1E88E5",
        "primary-hover": "#1565C0",
        "primary-press": "#0D47A1",
        "primary-disabled": "#1E88E54D",
        secondary: "#26C6DA",
        "secondary-hover": "#00ACC1",
        "secondary-press": "#00838F",
        "secondary-disabled": "#26C6DA4D",
        base: "#E3F2FD",
        "text-primary": "#0D47A1",
      },
      fontFamily: {
        M_PLUS_2: ["Montserrat", "M_PLUS_2", "sans-serif"],
        Montserrat: ["Montserrat", "sans-serif"],
      },
    },
  },
  plugins: [require("@tailwindcss/line-clamp")],
};
