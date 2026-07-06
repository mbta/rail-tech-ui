import { printReceived, printExpected } from "jest-matcher-utils";

export const extendJestMatchers = (): void => {
  expect.extend({
    toBeWithinRange(received: number, floor: number, ceiling: number) {
      const pass = received >= floor && received <= ceiling;
      if (pass) {
        return {
          message: () =>
            `expected ${printReceived(
              received,
            )} not to be within range ${printExpected(floor)} - ${printExpected(
              ceiling,
            )}`,
          pass: true,
        };
      } else {
        return {
          message: () =>
            `expected ${printReceived(
              received,
            )} to be within range ${printExpected(floor)} - ${printExpected(
              ceiling,
            )}`,
          pass: false,
        };
      }
    },
  });
};

interface CustomMatchers<R = unknown> {
  toBeWithinRange(floor: number, ceiling: number): R;
}

/* eslint-disable @typescript-eslint/no-empty-object-type, @typescript-eslint/no-namespace */
declare global {
  namespace jest {
    interface Expect extends CustomMatchers {}
    interface Matchers<R> extends CustomMatchers<R> {}
    interface InverseAsymmetricMatchers extends CustomMatchers {}
  }
}
