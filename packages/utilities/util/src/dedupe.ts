/*##############################################(SWAP)##############################################*/

/**
 * Also known as deduplicate. Removes duplicate elements from an array
 * @template T - The type of elements in the array
 * @param {T[]} array - The input array to deduplicate
 * @param {(value: T) => unknown} [keyFn] - Optional function to generate unique keys for comparison
 * @returns {T[]} A new array with duplicate elements removed
 *
 * @example
 * // Basic usage with primitive values
 * dedupe([1, 2, 2, 3]) // returns [1, 2, 3]
 *
 * // With objects using a key function
 * dedupe(
 *   [{id: 1, name: 'a'}, {id: 1, name: 'b'}],
 *   (item) => item.id
 * ) // returns [{id: 1, name: 'a'}]
 */
export function dedupe<T>(array: T[], keyFn?: (value: T) => unknown): T[] {
  const seen = new Set<unknown>();

  return array.filter((element) => {
    const value = keyFn ? keyFn(element) : element;
    const isDuplicate = seen.has(value);
    seen.add(value);
    return !isDuplicate;
  });
}
