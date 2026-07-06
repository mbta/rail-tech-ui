import "@testing-library/jest-dom";
import { dateTimeFromISO } from "src/util/dateTime";
import { extendJestMatchers } from "tests/testHelpers/jestMatchers";
import { putNow } from "./time";

extendJestMatchers();

// Mock now
jest.mock("./now", () => ({
  __esModule: true,
  getNow: jest.fn(),
}));
beforeEach(() => {
  // relies on clearMocks: true in jest.config
  putNow(dateTimeFromISO("2023-07-06T09:52:31"));
});

// jsdom doesn't implement scrolling
Element.prototype.scrollIntoView = jest.fn();

afterEach(() => {
  localStorage.clear();
});
