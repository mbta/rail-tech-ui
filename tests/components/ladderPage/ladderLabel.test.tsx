import { LadderLabel } from "src/components/ladderPage/ladderLabel";
import { testSnapshot } from "tests/testHelpers/snapshot";

// Mock the Icon component since it relies on external SVG sprites
jest.mock("src/components/icons", () => ({
  Icon: () => null,
}));

describe("LadderLabel", () => {
  testSnapshot("one car train", () => (
    <LadderLabel revenue={true} consist={["3600"]} routeId="Green-D" />
  ));
  testSnapshot("two car train", () => (
    <LadderLabel revenue={true} consist={["3600", "3700"]} routeId="Green-D" />
  ));
  testSnapshot("three car train", () => (
    <LadderLabel
      revenue={true}
      consist={["3600", "3700", "3800"]}
      routeId="Green-D"
    />
  ));
  testSnapshot("non-revenue train", () => (
    <LadderLabel revenue={false} consist={["3600", "3700"]} routeId="Green-D" />
  ));
});
