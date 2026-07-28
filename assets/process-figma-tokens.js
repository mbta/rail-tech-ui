import util from "node:util";
import { StyleDictionary } from "style-dictionary-utils";
import { transformGroups } from "style-dictionary/enums";

// mostly acquired from github.com/mbta/mbta_metro/blob/main/assets/process-figma-tokens.js
// with modifications for glorbit figma tokens

const SRC_DIR = "./figma-tokens";
const buildPath = "./";

function isLeaf(token) {
  return Object.keys(token).includes("$type");
}

function parseLeaf(token) {
  const tokenValue = token.$value;
  if (Object.keys(tokenValue).includes("unit")) {
    const { value, unit } = tokenValue;
    return {
      $type: token.$type,
      $value: `${value}${unit}`,
    };
  }
  return token;
}
function traverseTree(dict, theme = null) {
  const output = {};
  const themeSuffix = theme === "light" || theme === "dark" ? `-${theme}` : "";

  for (const key in dict) {
    if (key === "spacing") {
      const spacingVals = dict[key];
      output[key] = {};
      for (const spacingKey in spacingVals) {
        const val = spacingVals[spacingKey];
        if (val.$type == "number") {
          output[key][spacingKey] = {
            $value: `${val.$value}px`,
            $type: "dimension",
          };
        } else if (val.$value.unit == "px") {
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
  parser: ({ filePath, contents }) => {
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

      const theme = filePath.includes("Light Mode")
        ? "light"
        : filePath.includes("Dark Mode")
          ? "dark"
          : "";

      const parsed = JSON.parse(modifiedContents);
      return traverseTree(parsed, theme);
    } catch (error) {
      console.log(error);
    }
  },
});

// transforms hex values of exported figma variables into r g b channels to allow
// tailwind opacity modifications
StyleDictionary.registerTransform({
  type: "value",
  name: "color/rgb-channels",
  transitive: true,
  filter: (token) => token.$type === "color",
  transform: (token) => {
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

const baseConfig = {
  parsers: ["custom-parser"],
  source: [`${SRC_DIR}/Base Mode 1.json`],
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

const tailwindConfig = {
  parsers: ["custom-parser"],
  source: [
    `${SRC_DIR}/Base Mode 1.json`,
    `${SRC_DIR}/Ops Mode 1.json`,
    `${SRC_DIR}/Semantic Dark Mode.json`,
    `${SRC_DIR}/Semantic Light Mode.json`,
  ],
  platforms: {
    tw: {
      transforms: ["attribute/cti", "name/kebab", "color/rgb-channels"],
      buildPath,
      files: [
        {
          destination: "js/tokens.js",
          format: "javascript/tailwind",
          options: {
            outputReferences: true,
          },
        },
      ],
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
      transforms: [
        "attribute/cti",
        "name/kebab",
        "time/seconds",
        "dimension/pixelToRem",
        "color/rgb-channels",
      ],
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

const capitalize = ([firstLetter, ...restOfWord]) => {
  return firstLetter.toUpperCase() + restOfWord.join("");
};
const camelCase = (string) => {
  return string
    .split(/[\s-_\+]+/g)
    .map((part, index) => (index === 0 ? part : capitalize(part)))
    .join("");
};

// Register a custom format to output tokens as a JavaScript module
StyleDictionary.registerFormat({
  name: "javascript/tailwind",
  format: function ({ dictionary }) {
    const buildNestedObject = (tokens) => {
      const result = {};

      tokens.forEach((token) => {
        const { path, $value } = token;
        let current = result;

        path.forEach((part, index) => {
          const partName = index === 0 ? camelCase(part) : part;
          if (index === path.length - 1) {
            const varName = `--${path.map((p) => p.toLowerCase()).join("-")}`;
            const isRgbChannels = /^\d{1,3}\s\d{1,3}\s\d{1,3}$/.test($value);

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

    return `/**\n* Do not edit directly, this file was auto-generated.\n*/\n\nexport default ${util.inspect(tokens)};`;
  },
});

for (var config of [baseConfig, opsConfig, ...themeConfigs, tailwindConfig]) {
  const sd = new StyleDictionary(config, { verbosity: "verbose" });
  await sd.cleanAllPlatforms();
  await sd.buildAllPlatforms();
}

console.log("\nBuild completed!");
