import { StyleDictionary } from "style-dictionary-utils";
import { isSource } from "style-dictionary-utils/filter/isSource.js";
import type {
  ParserOptions,
  DesignTokens,
  TransformedToken,
  Config,
} from "style-dictionary/types";

// heavily inspired by github.com/mbta/mbta_metro/blob/main/assets/process-figma-tokens.js
// logic modified for glorbit figma tokens

interface TokenValue {
  value?: number | string;
  unit?: string;
  [key: string]: unknown;
}

interface Token {
  $type?: string;
  $value?: string | number | TokenValue;
  path?: string[];
  name?: string;
  [key: string]: unknown;
}

interface FormatArgs {
  dictionary: {
    allTokens: Token[];
  };
}

const SRC_DIR = "./assets/figma-tokens";
const buildPath = "./assets/";

type TokenTree = { [key: string]: TokenTree | Token | string };

function isLeaf(token: unknown): token is Token {
  return typeof token === "object" && token !== null && "$type" in token;
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

function kebabCase(str: string): string {
  return str
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .toLowerCase();
}

function normalizeComponentKeys(dict: TokenTree): TokenTree {
  return Object.entries(dict).reduce<TokenTree>((acc, [key, value]) => {
    const normalizedKey = kebabCase(key);
    acc[normalizedKey] = isLeaf(value)
      ? value
      : normalizeComponentKeys(value as TokenTree);
    return acc;
  }, {});
}

function traverseTree(
  dict: TokenTree,
  theme: "light" | "dark" | null = null,
): TokenTree {
  const output: TokenTree = {};
  const themeSuffix = theme === "light" || theme === "dark" ? `-${theme}` : "";

  for (const key in dict) {
    if (key === "spacing") {
      const spacingVals = dict[key] as Record<string, Token>;
      const spacingOut: TokenTree = {};
      output[key] = spacingOut;
      for (const spacingKey in spacingVals) {
        const val = spacingVals[spacingKey];
        if (val.$type === "number") {
          spacingOut[spacingKey] = {
            $value: `${val.$value}px`,
            $type: "dimension",
          };
        } else if (
          typeof val.$value === "object" &&
          val.$value?.unit === "px"
        ) {
          spacingOut[spacingKey] = `${val.$value.value}px`;
        } else {
          spacingOut[spacingKey] = val;
        }
      }
    } else {
      const val = dict[key];
      if (isLeaf(val)) {
        output[`${key}${themeSuffix}`] = parseLeaf(val);
      } else {
        output[key] = traverseTree(val as TokenTree, theme);
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
      const isComponentStyles =
        filePath !== undefined &&
        (filePath.includes("Components Light Mode.json") ||
          filePath.includes("Components Dark Mode.json"));

      const parsed = JSON.parse(modifiedContents);
      const normalizedParsed = isComponentStyles
        ? normalizeComponentKeys(parsed)
        : parsed;
      return traverseTree(normalizedParsed, theme) as DesignTokens;
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
    const tokenValue = token.$value as
      { fontSize?: { value: number } } | undefined;
    const fontSize = tokenValue?.fontSize;
    if (!fontSize) throw new Error(`Missing fontSize on ${token.name}`);

    return `${fontSize.value / 16}rem`;
  },
});

// Define a filter to omit hover-specific color tokens.
//
// This is because design has defined hover states in Figma that specify opacity changes for
// pre-existing colors. We prefer to implement these by applying those same opacity changes,
// and do not want them instead to be exported as new colors.
//
// Note also that StyleDictionary provides a way for us to register the function as a named
// filter, so that it can be referenced by name in the file-specific configs below. But since
// some files already use the `isSource` filter, and since the named filter API doesn't allow us
// to combine multiple filters, it is easier to just pass in a function directly.
const isNotHoverColor = (token: TransformedToken): boolean => {
  const isHoverColor =
    token.$type === "color" &&
    token.path?.some(
      (key: string) =>
        key === "hover-light" || key === "hover-dark" || key === "hover",
    );
  return !isHoverColor;
};

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
          filter: isNotHoverColor,
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
          filter: isNotHoverColor,
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
          filter: (token: TransformedToken) =>
            isSource(token) && isNotHoverColor(token),
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
    `${SRC_DIR}/Components Light Mode.json`,
    `${SRC_DIR}/Components Dark Mode.json`,
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
          filter: isNotHoverColor,
        },
      ],
    },
  },
};

type NestedTokens = { [key: string]: NestedTokens | string };

const capitalize = (str: string): string => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const camelCase = (str: string): string => {
  return str
    .split(/[\s\-_+]+/g)
    .map((part, index) => (index === 0 ? part : capitalize(part)))
    .join("");
};

// Register a custom format to output tokens as a TypeScript module
StyleDictionary.registerFormat({
  name: "typescript/tailwind",
  format: function ({ dictionary }: FormatArgs) {
    const buildNestedObject = (tokens: Token[]) => {
      const result: NestedTokens = {};

      tokens.forEach((token) => {
        const path = token.path || [];
        const $value = token.$value;
        let current: NestedTokens = result;

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
            current[partName] ??= {};
            current = current[partName] as NestedTokens;
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
    // Cast to bypass SD's internal configuration validation
    const sd = new StyleDictionary(config as Config, { verbosity: "verbose" });
    await sd.cleanAllPlatforms();
    await sd.buildAllPlatforms();
  }

  console.log("\nBuild completed!");
};

await buildTokens();
