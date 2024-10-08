import { type Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        //light -> Pokemon
        squirtle: "hsl(200, 80%, 45%)", //<- Primary blue color for light theme
        squirtle_light: "hsl(200, 80%, 65%)",
        charmander: "hsla(200, 20%, 90%, 1)",
        // pikachu: "hsla(0, 6%, 96%, 1)",
        pikachu: "hsla(217, 100%, 98%, 1)",
        onyx: "hsl(210, 27%, 96%)",
        bulbasaur: "hsla(40, 50%, 98%, 1)",
        //dark -> League of Legends
        rengar: "hsl(200, 80%, 60%)", //<- Primary blue color for dark theme
        rengar_light: "hsl(200, 80%, 80%)",
        khazix: "hsla(277, 35%, 7%, 1)",
        leblanc: "hsla(277, 20%, 17%, 1)",
        shaco: "hsla(277, 33%, 25%, 1)",
        jinx: "hsla(277, 35%, 8%, 1)",
      },
      animation: {
        "spin-fast": "spin 0.65s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
//#f1f4f7
