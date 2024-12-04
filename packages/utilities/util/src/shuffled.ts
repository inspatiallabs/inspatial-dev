/*##############################################(SHUFFLED)##############################################*/

/**
 * Shuffles an array using the Fisher-Yates (Knuth) shuffle algorithm.
 * This implementation creates a new array instead of modifying the original.
 *
 * @template T - The type of elements in the array
 * @param {T[]} array - The input array to be shuffled
 * @returns {T[]} A new array with the same elements in random order
 *
 * @example
 * const numbers = [1, 2, 3, 4, 5];
 * const shuffledNumbers = shuffled(numbers);
 * // numbers remains unchanged: [1, 2, 3, 4, 5]
 * // shuffledNumbers might be: [3, 1, 5, 2, 4]
 */
export function shuffled<T>(array: T[]): T[] {
  // Create a shallow copy to preserve the original array
  const shuffledArray = [...array];

  // Iterate through the array from end to start
  for (let i = shuffledArray.length - 1; i > 0; i--) {
    // Generate a random index from 0 to i
    const j = Math.floor(Math.random() * (i + 1));

    // Swap elements at indices i and j using destructuring
    [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
  }

  return shuffledArray;
}
