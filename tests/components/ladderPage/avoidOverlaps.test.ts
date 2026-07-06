import { avoidOverlaps, End } from "src/components/ladderPage/avoidOverlaps";

describe("avoidOverlaps", () => {
  const runAvoidOverlaps = (
    minSpaceBetweenElems: number,
    startAndEnds: [number, number][],
  ): { actualOutput: End<number>[]; expectedOutput: End<number>[] } => {
    const input = startAndEnds.map((startAndEnd, index) => ({
      payload: index,
      start: startAndEnd[0],
    }));
    const actualOutput = avoidOverlaps(input, minSpaceBetweenElems);
    const expectedOutput = startAndEnds.map((startAndEnd, index) => ({
      payload: index,
      start: startAndEnd[0],
      end: startAndEnd[1],
    }));
    return { actualOutput, expectedOutput };
  };

  test("single element", () => {
    const { actualOutput, expectedOutput } = runAvoidOverlaps(10, [[50, 50]]);
    expect(actualOutput).toEqual(expectedOutput);
  });

  test("two overlapping", () => {
    const { actualOutput, expectedOutput } = runAvoidOverlaps(10, [
      [60, 50],
      [60, 60],
    ]);
    expect(actualOutput).toEqual(expectedOutput);
  });

  test("two nearby", () => {
    const { actualOutput, expectedOutput } = runAvoidOverlaps(10, [
      [55, 50],
      [60, 60],
    ]);
    expect(actualOutput).toEqual(expectedOutput);
  });

  test("two far away", () => {
    const { actualOutput, expectedOutput } = runAvoidOverlaps(10, [
      [50, 50],
      [70, 70],
    ]);
    expect(actualOutput).toEqual(expectedOutput);
  });

  test("group of three", () => {
    const { actualOutput, expectedOutput } = runAvoidOverlaps(10, [
      [58, 50],
      [60, 60],
      [60, 70],
    ]);
    expect(actualOutput).toEqual(expectedOutput);
  });

  test("deflects multiple in each direction", () => {
    const { actualOutput, expectedOutput } = runAvoidOverlaps(10, [
      [54, 30],
      [56, 40],
      [58, 50],
      [60, 60],
      [62, 70],
      [64, 80],
      [66, 90],
    ]);
    expect(actualOutput).toEqual(expectedOutput);
  });

  test("two groups of three far apart", () => {
    const { actualOutput, expectedOutput } = runAvoidOverlaps(10, [
      [20, 10],
      [20, 20],
      [22, 30],
      [78, 70],
      [80, 80],
      [80, 90],
    ]);
    expect(actualOutput).toEqual(expectedOutput);
  });

  test("two groups close enough to make each other choose a different anchor", () => {
    const { actualOutput, expectedOutput } = runAvoidOverlaps(10, [
      [40, 20],
      [40, 30],
      [40, 40],
      [51, 51],
      [51, 61],
      [51, 71],
    ]);
    expect(actualOutput).toEqual(expectedOutput);
  });

  test("two groups can't cause overlap by pushing into each other", () => {
    const { actualOutput, expectedOutput } = runAvoidOverlaps(10, [
      [30, 10],
      [30, 20],
      [30, 30],
      [55, 45],
      [55, 55],
      [55, 65],
    ]);
    expect(actualOutput).toEqual(expectedOutput);
  });

  test("large realistic test", () => {
    const { actualOutput, expectedOutput } = runAvoidOverlaps(44, [
      [25, 25],
      [96, 96],
      [155, 148],
      [192, 192],
      [240, 240],
      [300, 300],
      [360, 360],
      [372, 404],
      [480, 448],
      [492, 492],
      [492, 536],
      [540, 580],
    ]);
    expect(actualOutput).toEqual(expectedOutput);
  });
});
