import { range } from "./range.ts";

/*##############################################(RANDOM)##############################################*/
/**
 * Generates a random integer between min (inclusive) and max (exclusive)
 * @param min - The minimum value (inclusive)
 * @param max - The maximum value (exclusive). If omitted, min becomes max and min becomes 0
 * @returns A random integer in the specified range
 */
export function random(min: number, max?: number): number {
  if (max == null) {
    max = min;
    min = 0;
  }
  return Math.floor(Math.random() * (max - min) + min);
}

/*##############################################(RANDOMS)##############################################*/
/**
 * Generates an array of n random integers between min and max
 * @param n - The number of random integers to generate
 * @param min - The minimum value (inclusive)
 * @param max - The maximum value (exclusive)
 * @returns An array of random integers
 */
export function randoms(n: number, min: number, max?: number): number[] {
  return range(n).map(() => random(min, max));
}

/*##############################################(RANDOM-UNIQUES)##############################################*/
/**
 * Generates an array of n unique random integers between min and max
 * @param n - The number of unique random integers to generate
 * @param min - The minimum value (inclusive)
 * @param max - The maximum value (exclusive). If omitted, min becomes max and min becomes 0
 * @returns An array of unique random integers
 * @throws Error if n is larger than the possible range of unique numbers
 */
export function randomUniques(n: number, min: number, max?: number): number[] {
  if (max == null) {
    max = min;
    min = 0;
  }
  if (n > max - min) {
    throw new Error(`\`n\` cannot be bigger than \`max - min\``);
  }
  const set = new Set<number>();
  while (set.size < n) {
    let nextCandidate = random(min, max);
    while (set.has(nextCandidate)) {
      ++nextCandidate;
      if (nextCandidate >= max - 1) {
        nextCandidate = min;
      }
    }
    set.add(nextCandidate);
  }
  return [...set];
}
