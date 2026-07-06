import type { Config } from "@jest/types";

const config: Config.InitialOptions = {
  clearMocks: true,
  moduleDirectories: ["<rootDir>/", "node_modules/"],
  moduleFileExtensions: ["ts", "tsx", "js"],
  preset: "ts-jest",
  setupFilesAfterEnv: ["<rootDir>/tests/testHelpers/setup.ts"],
  testEnvironment: "./tests/testHelpers/environment.ts",
  testRegex: "tests/.*\\.test\\.tsx?$",
  transform: {
    "^.+\\.tsx?$": ["ts-jest", { tsconfig: "<rootDir>/tsconfig.json" }],
  },
  verbose: true,
};

export default config;
