import { Config } from "tailwindcss";
import figmaTokens from "../assets/js/tokens";

const {
  customColors,
  fontSize,
  spacing,
  fontFamily,
  ...semanticAndSystemColors
} = figmaTokens;

const railTechUITheme = {
  theme: {
    extend: {
      fontSize,
      spacing,
      fontFamily,
      colors: {
        ...customColors,
        ...semanticAndSystemColors,
      },
    },
  },
  content: [],
} satisfies Config;

export default railTechUITheme;
