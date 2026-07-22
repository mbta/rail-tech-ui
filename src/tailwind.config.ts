import { Config } from "tailwindcss";
import figmaTokens from "../assets/js/tokens";

const railTechUITheme = {
  // presets: [require("../assets/js/tokens")],
  theme: {
    extend: {
      ...figmaTokens,
      colors: {
        // "alt-blue": {
        //   700: "#1f6cc2",
        //   900: "#134482",
        // },
        // "env-dev": "#1fecff",
        // "env-dev-green": "#50e38c",
        // "env-dev-blue": "#ffdd1f",
        // "env-dev-orange": "#f1ac15",
        // "glides-aqua": {
        //   400: "#1fecff",
        //   500: "#1acee3",
        // },
        // "glides-blue": {
        //   200: "#b6d8f5",
        //   400: "#77a0c3",
        //   600: "#165c96",
        //   700: "#0a3355",
        //   800: "#022441",
        //   900: "#001b32",
        // },
        // "glides-error": "#ff4531",
        // "glides-gray": {
        //   // 200: "#e9eaed",
        //   200: "#000000", // black, just to test
        //   250: "#d5d9df",
        //   300: "#c1c7d0",
        //   400: "#b0b5c0",
        //   500: "#788093",
        //   600: "#494f5c",
        // },
        // "glides-greyblue": {
        //   50: "#f6f7f9",
        //   100: "#eceef2",
        //   200: "#d5d9e2",
        //   300: "#b1bbc8",
        //   400: "#8695aa",
        //   500: "#64748b",
        //   600: "#526077",
        //   700: "#434e61",
        //   800: "#3a4252",
        //   900: "#343a46",
        //   950: "#23272e",
        // },
        // "glides-greygreyblue": {
        //   900: "#20293a",
        // },
        // "glides-green": {
        //   400: "#50e38c",
        //   500: "#44c681",
        // },
        // "glides-orange": {
        //   400: "#f1ac15",
        //   500: "#d49815",
        // },
        // "glides-pink": {
        //   400: "#ff6693",
        //   500: "#d95c87",
        // },
        // "glides-success": "#00c58a",
        // "glides-teal": {
        //   50: "#f2f9f9",
        //   100: "#deeeef",
        //   200: "#c1dce0",
        //   300: "#96c2ca",
        //   400: "#63a1ad",
        //   500: "#488592",
        //   600: "#3e6e7c",
        //   700: "#375b67",
        //   800: "#344d56",
        //   900: "#2f424a",
        //   950: "#141f24",
        // },
        // "glides-warning": "#ffc961",
        // "glides-yellow": {
        //   400: "#ffdd1f",
        //   500: "#d9c124",
        // },
      },
    },
  },
  content: []
} satisfies Config;

export default railTechUITheme;
