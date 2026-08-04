import { StyleDictionary } from "style-dictionary-utils";
import type { ParserOptions, DesignTokens } from "style-dictionary/types";

// heavily inspired by github.com/mbta/mbta_metro/blob/main/assets/process-figma-tokens.js
// logic modified for glorbit figma tokens

interface TokenValue {
  value?: number | string;
  unit?: string;
  [key: string]: any;
}

interface Token {
  $type?: string;
  $value?: string | number | TokenValue;
  path?: string[];
  name?: string;
  [key: string]: any;
}

interface FormatArgs {
  dictionary: {
    allTokens: Token[];
    [key: string]: any;
  };
  [key: string]: any;
}

const SRC_DIR = "./assets/figma-tokens";
const buildPath = "./assets/";

function isLeaf(token: Record<string, any>): boolean {
  return Object.keys(token).includes("$type");
}

function parseLeaf(token: Token): Token {
  const tokenValue = token.$value;
  if (
    typeof tokenValue === "object" &&
    tokenValue !== null &&
    "unit" in tokenValue
  ) {
    const { value, unit } = tokenValue as TokenValue;
    return {
      $type: token.$type,
      $value: `${value}${unit}`,
    };
  }
  return token;
}

function traverseTree(
  dict: Record<string, any>,
  theme: "light" | "dark" | null = null,
): Record<string, any> {
  const output: Record<string, any> = {};
  const themeSuffix = theme === "light" || theme === "dark" ? `-${theme}` : "";

  for (const key in dict) {
    if (key === "spacing") {
      const spacingVals = dict[key];
      output[key] = {};
      for (const spacingKey in spacingVals) {
        const val = spacingVals[spacingKey];
        if (val.$type === "number") {
          output[key][spacingKey] = {
            $value: `${val.$value}px`,
            $type: "dimension",
          };
        } else if (val.$value?.unit === "px") {
          output[key][spacingKey] = `${val.$value.value}px`;
        } else {
          output[key][spacingKey] = val;
        }
      }
    } else {
      const val = dict[key];
      if (isLeaf(val)) {
        // append "-{theme}" suffix directly to key in order to avoid token collision
        output[`${key}${themeSuffix}`] = parseLeaf(val);
      } else {
        output[key] = traverseTree(val, theme);
      }
    }
  }
  return output;
}

StyleDictionary.registerParser({
  name: "custom-parser",
  pattern: /\.json$/,
  parser: ({ filePath, contents }: ParserOptions): DesignTokens => {
    try {
      // Design uses native tailwind colors for component theming so they are present in
      // the Figma export. Translate uses of native colors with instructions to use
      // theme() so that we retain the ability to modify opacity and also avoid breaking
      // other functionality by clashing with native tailwind colors.
      const modifiedContents = contents
        // {tailwind-colors.blue.300.20%} -> theme('colors.blue.300 / 20%')
        .replace(
          /\{tailwind-colors\.([a-z]+\.[0-9]+)\.(\d+%)\}/g,
          "theme('colors.$1 / $2')",
        )
        // {tailwind-colors.blue.300} -> theme('colors.blue.300')
        .replace(
          /\{tailwind-colors\.([a-z]+\.[0-9]+)\}/g,
          "theme('colors.$1')",
        );

      const theme =
        filePath && filePath.includes("Light Mode")
          ? "light"
          : filePath && filePath.includes("Dark Mode")
            ? "dark"
            : null;

      const parsed = JSON.parse(modifiedContents);
      return traverseTree(parsed, theme) as DesignTokens;
    } catch (error) {
      console.log(error);
      return {} as DesignTokens;
    }
  },
});

// transforms hex values of exported figma variables into r g b channels to allow
// tailwind opacity modifications
StyleDictionary.registerTransform({
  type: "value",
  name: "color/rgb-channels",
  transitive: true,
  filter: (token: Token) => token.$type === "color",
  transform: (token: Token) => {
    // only target "#{6 digits}" hex strings i.e ignore colors with additional alpha channel already
    if (
      typeof token.$value === "string" &&
      token.$value.startsWith("#") &&
      token.$value.length === 7
    ) {
      const hexParseResult = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/.exec(
        token.$value,
      );
      if (hexParseResult === null) {
        return token.$value;
      }
      const [, rHex, gHex, bHex] = hexParseResult;
      const r = parseInt(rHex, 16);
      const g = parseInt(gHex, 16);
      const b = parseInt(bHex, 16);
      return `${r} ${g} ${b}`;
    }
    return token.$value;
  },
});

StyleDictionary.registerTransform({
  type: "value",
  name: "typography/font-size",
  transitive: true,
  filter: (token: Token) => token.$type === "typography",
  transform: (token: Token) => {
    const tokenValue = token.$value as Record<string, any>;
    const fontSize = tokenValue?.fontSize;

    return `${fontSize.value / 16}rem`;
  },
});

const baseConfig = {
  parsers: ["custom-parser"],
  source: [`${SRC_DIR}/Base Mode 1.json`, `${SRC_DIR}/Text Styles.json`],
  platforms: {
    base: {
      transformGroup: "web",
      transforms: [
        "time/seconds",
        "dimension/pixelToRem",
        "color/rgb-channels",
        "typography/font-size",
      ],
      outputUnit: "rem",
      buildPath,
      files: [
        {
          destination: "css/variables.base.css",
          format: "css/variables",
          options: { outputReferences: true },
        },
      ],
      options: {
        basePxFontSize: 16,
      },
    },
  },
};

const opsConfig = {
  parsers: ["custom-parser"],
  source: [`${SRC_DIR}/Ops Mode 1.json`],
  platforms: {
    base: {
      transformGroup: "web",
      transforms: [
        "time/seconds",
        "dimension/pixelToRem",
        "color/rgb-channels",
      ],
      outputUnit: "rem",
      buildPath,
      files: [
        {
          destination: "css/variables.ops.css",
          format: "css/variables",
          options: { outputReferences: true },
        },
      ],
      options: {
        basePxFontSize: 16,
      },
    },
  },
};

const themeConfigs = ["Light", "Dark"].map((theme) => ({
  parsers: ["custom-parser"],
  source: [
    `${SRC_DIR}/Semantic ${theme} Mode.json`,
    `${SRC_DIR}/Components ${theme} Mode.json`,
  ],
  include: [`${SRC_DIR}/Base Mode 1.json`, `${SRC_DIR}/Ops Mode 1.json`],
  platforms: {
    css: {
      transformGroup: "web",
      transforms: ["color/rgb-channels"],
      buildPath,
      files: [
        {
          destination: `css/variables.${theme.toLowerCase()}.css`,
          format: "css/variables",
          filter: "isSource",
          options: {
            outputReferences: true,
          },
        },
      ],
    },
  },
}));

const tailwindConfig = {
  parsers: ["custom-parser"],
  source: [
    `${SRC_DIR}/Base Mode 1.json`,
    `${SRC_DIR}/Ops Mode 1.json`,
    `${SRC_DIR}/Semantic Dark Mode.json`,
    `${SRC_DIR}/Semantic Light Mode.json`,
    `${SRC_DIR}/Text Styles.json`,
  ],
  platforms: {
    tw: {
      transforms: [
        "attribute/cti",
        "name/kebab",
        "color/rgb-channels",
        "typography/font-size",
      ],
      buildPath,
      files: [
        {
          destination: "js/tokens.ts",
          format: "typescript/tailwind",
          options: {
            outputReferences: true,
          },
        },
      ],
    },
  },
};

const capitalize = (str: string): string => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const camelCase = (str: string): string => {
  return str
    .split(/[\s-_\+]+/g)
    .map((part, index) => (index === 0 ? part : capitalize(part)))
    .join("");
};

// Register a custom format to output tokens as a TypeScript module
StyleDictionary.registerFormat({
  name: "typescript/tailwind",
  format: function ({ dictionary }: FormatArgs) {
    const buildNestedObject = (tokens: Token[]) => {
      const result: Record<string, any> = {};

      tokens.forEach((token) => {
        const path = token.path || [];
        const $value = token.$value;
        let current = result;

        path.forEach((part: string, index: number) => {
          const partName = index === 0 ? camelCase(part) : part;
          if (index === path.length - 1) {
            const varName = `--${path.map((p: string) => p.toLowerCase()).join("-")}`;
            const isRgbChannels =
              typeof $value === "string" &&
              /^\d{1,3}\s\d{1,3}\s\d{1,3}$/.test($value);

            if (isRgbChannels) {
              // allows opacity modification like "bg-alt-blue-700/25"
              current[partName] = `rgb(var(${varName}) / <alpha-value>)`;
            } else {
              // must be alpha-modified already like glides-mustard-sheer
              current[partName] = `var(${varName})`;
            }
          } else {
            current[partName] = current[partName] || {};
            current = current[partName];
          }
        });
      });
      return result;
    };

    const tokens = buildNestedObject(dictionary.allTokens);

    return `/**\n* Do not edit directly, this file was auto-generated.\n*/\n\nexport default ${JSON.stringify(tokens, null, 2)};`;
  },
});

const buildTokens = async () => {
  const allConfigs = [baseConfig, opsConfig, ...themeConfigs, tailwindConfig];

  for (const config of allConfigs) {
    // Cast to 'any' when passing to SD to bypass internal configuration validation
    const sd = new StyleDictionary(config as any, { verbosity: "verbose" });
    await sd.cleanAllPlatforms();
    await sd.buildAllPlatforms();
  }

  console.log("\nBuild completed!");
};

await buildTokens();
