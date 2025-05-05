/**
 * Ensures a value is always an array.
 * If the value is already an array, it is returned as is.
 * If the value is null or undefined, returns an empty array.
 * Otherwise, wraps the value in an array.
 *
 * What can you do with this?
 * 1. Create a data structure that can handle mixed types.
 * 2. Pass a single item to a function that expects an array.
 * 3. Use it in a component that expects an array.
 *
 * @param value The value to ensure is an array
 * @returns The value as an array
 */
export function ensureArray<T>(value: T | T[] | null | undefined): T[] {
  if (Array.isArray(value)) {
    return value;
  }

  if (value === null || value === undefined) {
    return [];
  }

  return [value];
}

/**
 * Flattens an array of arrays to a single array.
 *
 * @param arrays Array of arrays to flatten
 * @returns A new flattened array
 */
export function flattenArrays<T>(arrays: T[][]): T[] {
  return arrays.reduce((result, arr) => [...result, ...arr], [] as T[]);
}

/**
 * Groups an array of items by a key
 *
 * @param items Array of items to group
 * @param keyFn Function to extract the key from an item
 * @returns A map of keys to arrays of items
 */
export function groupArrayBy<T, K extends string | number | symbol>(
  items: T[],
  keyFn: (item: T) => K
): Record<K, T[]> {
  return items.reduce((result, item) => {
    const key = keyFn(item);
    if (!result[key]) {
      result[key] = [];
    }
    result[key].push(item);
    return result;
  }, {} as Record<K, T[]>);
}

/**
 * Type guard to check if an item is a single item (not an array).
 * Useful for handling mixed types in component props.
 */
export function isSingleArrayItem<T>(item: T | T[]): item is T {
  return !Array.isArray(item);
}
