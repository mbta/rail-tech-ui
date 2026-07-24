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
function traverseTree(dict) {
  const output = {};
  for (const key in dict) {
    if (key === "transition-duration") {
      const val = dict[key]["DEFAULT"];
      output[key] = {
        $value: val.$value.value,
        $type: "time",
      };
    } else if (key === "spacing") {
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
        output[key] = parseLeaf(val);
      } else {
        output[key] = traverseTree(val);
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
      const parsed = JSON.parse(modifiedContents);
      return traverseTree(parsed);
    } catch (error) {
      console.log(error);
    }
  },
});

const baseConfig = {
  parsers: ["custom-parser"],
  source: [`${SRC_DIR}/Base Mode 1.json`],
  platforms: {
    base: {
      transformGroup: "web",
      transforms: ["time/seconds", "dimension/pixelToRem"],
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
      transforms: ["time/seconds", "dimension/pixelToRem"],
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
      transforms: ["attribute/cti", "name/kebab"],
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
      transformGroup: "web",
      buildPath,
      files: [
        {
          destination: `css/variables.${theme.toLowerCase()}.css`,
          // format: "css/advanced",
          format: "css/variables",
          filter: "isSource",
          options: {
            // default to light, opt-in to dark with an HTML attribute
            // selector: theme == "Light" ? ":root" : ".mbta-metro-dark-mode",
            // we're not ready for automated dark mode across all components!
            // rules: [{
            //   atRule: `@media (prefers-color-scheme: ${theme.toLowerCase()})`,
            // }],
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
            current[partName] =
              `var(--${path.map((p) => p.toLowerCase()).join("-")})`;
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
