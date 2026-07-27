import { Config } from "tailwindcss";
import figmaTokens from "../assets/js/tokens";

const {
  customColors,
  fontSize,
  spacing,
  fontFamily,
  // do not export tailwindColors so as not to clash with native Tailwind colors
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
