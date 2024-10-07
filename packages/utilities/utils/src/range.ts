/*##############################################(RANGE-UTIL)##############################################*/
/**
 * a helper function that returns an array of numbers from start to end
 * @example range(1, 5) => [1, 2, 3, 4, 5]
 */
export function range(start: number, end: number) {
  const length = end - start + 1;
  return Array.from({ length }, (_, index) => index + start);
}
