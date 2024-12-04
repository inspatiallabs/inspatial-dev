/*##############################################(SWAP)##############################################*/
/**
 * Swaps two elements in an array at the specified indices
 * @param array The array to perform the swap operation on
 * @param indexA The first index
 * @param indexB The second index
 * @throws {Error} If indices are out of bounds
 */
export function swap<T>(array: T[], indexA: number, indexB: number): void {
  if (
    indexA < 0 ||
    indexA >= array.length ||
    indexB < 0 ||
    indexB >= array.length
  ) {
    throw new Error("Index out of bounds");
  }

  const temp = array[indexA];
  array[indexA] = array[indexB];
  array[indexB] = temp;
}
