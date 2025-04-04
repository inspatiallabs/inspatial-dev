/*##############################################(CROSS-ARRAY)##############################################*/

/**
 * Creates a cartesian product of two arrays, returning an array of tuples.
 * Each tuple contains one element from the first array and one from the second array.
 *
 * @param unique - If true, skips pairs where both elements are equal
 * @param a - First input array
 * @param b - Second input array
 * @returns Array of readonly tuples, each containing one element from each input array
 *
 * @example
 * crossArray(false, [1, 2], ['a', 'b'])
 * // Returns: [[1, 'a'], [1, 'b'], [2, 'a'], [2, 'b']]
 *
 * crossArray(true, [1, 2, 3], [2, 3, 4])
 * // Returns: [[1, 2], [1, 3], [1, 4], [2, 3], [2, 4], [3, 4]]
 */
export function crossArray(
  unique: boolean,
  a: readonly unknown[],
  b: readonly unknown[]
): (readonly [unknown, unknown])[] {
  const res: [unknown, unknown][] = [];
  for (const av of a) {
    for (const bv of b) {
      if (unique && av === bv) {
        continue;
      }
      res.push([av, bv]);
    }
  }
  return res;
}

/*##############################################(CROSS-ARRAYS)##############################################*/

/**
 * Creates a cartesian product of multiple arrays recursively.
 * Combines elements from all input arrays into tuples containing one element from each array.
 *
 * @param unique - If true, skips combinations where any two elements are equal
 * @param arrs - Variable number of input arrays
 * @returns Array of readonly tuples, each containing one element from each input array
 *
 * @example
 * crossArrays(false, [1, 2], ['a', 'b'], ['x', 'y'])
 * // Returns: [
 * //   [1, 'a', 'x'], [1, 'a', 'y'],
 * //   [1, 'b', 'x'], [1, 'b', 'y'],
 * //   [2, 'a', 'x'], [2, 'a', 'y'],
 * //   [2, 'b', 'x'], [2, 'b', 'y']
 * // ]
 */
export function crossArrays(
  unique: boolean,
  ...arrs: (readonly unknown[])[]
): (readonly unknown[])[] {
  if (arrs.length == 2) {
    return crossArray(unique, arrs[0], arrs[1]);
  } else {
    return crossArrays(
      unique,
      crossArray(unique, arrs[0], arrs[1]),
      ...arrs.slice(2)
    );
  }
}
