import { LadderLabel } from "src/components/ladderPage/ladderLabel";
// import { LR_ROUTE_CONFIG } from "tests/testHelpers/route";
import { testSnapshot } from "tests/testHelpers/snapshot";

// Mock the Icon component since it relies on external SVG sprites
jest.mock("src/components/icons", () => ({
  Icon: () => null,
}));

describe("LadderLabel", () => {
  testSnapshot("one car train", () => (
    <LadderLabel
      labelMode="all"
      revenue={true}
      consist={["3600"]}
      color="branch-color-light-rail-e-branch"
      letter="E"
    />
  ));
  testSnapshot("two car train", () => (
    <LadderLabel
      labelMode="all"
      revenue={true}
      consist={["3600", "3700"]}
      color="branch-color-light-rail-e-branch"
      letter="E"
    />
  ));
  testSnapshot("three car train", () => (
    <LadderLabel
      labelMode="all"
      revenue={true}
      consist={["3600", "3700", "3800"]}
      color="branch-color-light-rail-e-branch"
      letter="E"
    />
  ));
  testSnapshot("non-revenue train", () => (
    <LadderLabel
      labelMode="all"
      revenue={false}
      consist={["3600", "3700"]}
      color="branch-color-light-rail-e-branch"
      letter="E"
    />
  ));
});
