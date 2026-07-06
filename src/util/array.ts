// array.reverse() mutates its input. This function does not.
export const reverse = <T>(array: T[]): T[] => array.slice().reverse();

export const filterMap = <T, U>(items: T[], f: (x: T) => U | null): U[] => {
  const result: U[] = [];
  items.forEach((x) => {
    const newValue: U | null = f(x);
    if (newValue !== null) {
      result.push(newValue);
    }
  });
  return result;
};

export const flatten = <T>(arrays: T[][]): T[] => {
  const result: T[] = [];
  arrays.forEach((array) => {
    array.forEach((item) => {
      result.push(item);
    });
  });
  return result;
};
