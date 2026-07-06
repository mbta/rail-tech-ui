import { z } from "zod";

// "3xxx"
export type CarId = string;
export const CarId = z.string();

export type Consist = CarId[];
export const Consist = z.array(CarId);

export const consistToString = (consist: Consist): string => consist.join("-");

export const consistEq = (
  consist1: Consist,
  consist2: Consist,
  mode: "exact" | "unordered",
): boolean => {
  if (mode === "unordered") {
    consist1 = consistSort(consist1);
    consist2 = consistSort(consist2);
  }
  return (
    consist1.length === consist2.length &&
    consist1.every((carId, index) => carId === consist2[index])
  );
};

export const consistSort = (consist: Consist): Consist =>
  [...consist].sort((a, b) => a.localeCompare(b));
