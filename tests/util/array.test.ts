import { filterMap, flatten, reverse } from "src/util/array";

describe("array utilities", () => {
  test("filterMap filters out nulls and maps values", () => {
    expect(filterMap([1, 2, 3], (x) => (x === 2 ? null : x * 10))).toEqual([
      10, 30,
    ]);
  });

  test("reverse does not mutate input", () => {
    const input = [1, 2, 3];
    const result = reverse(input);
    expect(result).toEqual([3, 2, 1]);
    expect(input).toEqual([1, 2, 3]);
  });

  test("flatten concatenates arrays", () => {
    expect(flatten([[1, 2], [3], [4, 5]])).toEqual([1, 2, 3, 4, 5]);
  });
});
