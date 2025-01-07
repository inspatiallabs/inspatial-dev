/*##############################################(SHUFFLE-UTIL)##############################################*/

/**
 * # Shuffle
 * #### Randomly rearranges the elements in an array
 *
 * The `shuffle` function takes an array and mixes up its elements in a random order.
 * Imagine you have a deck of cards, and you want to shuffle them so that they are in a different order each time.
 * This function does exactly that for any array of items.
 *
 * @since 0.0.1
 * @category InSpatial Util
 * @module shuffle
 * @kind function
 * @access public
 *
 * ### 💡 Core Concepts
 * - Randomly selects elements and swaps them to create a new order.
 * - Uses a common algorithm known as the Fisher-Yates shuffle.
 *
 * ### 🎯 Prerequisites
 * Before you start:
 * - Ensure you have an array of items you want to shuffle.
 *
 * ### 📚 Terminology
 * > **Shuffle**: To mix up the order of items randomly.
 *
 * ### ⚠️ Important Notes
 * <details>
 * <summary>Click to learn more about edge cases</summary>
 *
 * - Note 1: The function does not modify the original array; it returns a new shuffled array.
 * - Note 2: The randomness is based on JavaScript's `Math.random()`, which is not suitable for cryptographic purposes.
 * </details>
 *
 * @param {T[]} array - The array to be shuffled. It can contain any type of elements.
 *    This is the list of items you want to mix up.
 *
 * @typeParam T - The type of elements in the array.
 *
 * @returns {T[]} A new array with the elements shuffled.
 *    Think of it as a new deck of cards, shuffled and ready to play.
 *
 * ### 🎮 Usage
 * #### Installation
 * ```bash
 * # Deno
 * deno add jsr:@inspatial/util/shuffle.ts
 * ```
 *
 * #### Examples
 * Here's how you might use this in real life:
 *
 * @example
 * ### Example 1: Shuffling Numbers
 * ```typescript
 * // Let's shuffle a simple list of numbers
 * const numbers = [1, 2, 3, 4, 5];
 * const shuffledNumbers = shuffle(numbers);
 * console.log(shuffledNumbers); // Output: [3, 1, 4, 5, 2] (order will vary)
 * ```
 *
 * @example
 * ### Example 2: Shuffling Strings
 * ```typescript
 * // You can also shuffle a list of strings
 * const words = ["apple", "banana", "cherry"];
 * const shuffledWords = shuffle(words);
 * console.log(shuffledWords); // Output: ["banana", "cherry", "apple"] (order will vary)
 * ```
 *
 * ### ⚡ Performance Tips
 * <details>
 * <summary>Click to learn about performance</summary>
 *
 * - The function is efficient for small to medium-sized arrays.
 * - For very large arrays, consider performance implications of random number generation.
 * </details>
 *
 * ### ❌ Common Mistakes
 * <details>
 * <summary>Click to see what to avoid</summary>
 *
 * - Mistake 1: Assuming the original array is modified. It is not; a new array is returned.
 * - Mistake 2: Using the function for cryptographic purposes. It is not secure for such use.
 * </details>
 *
 * ### 🔧 Runtime Support
 * - ✅ Node.js
 * - ✅ Deno
 * - ✅ Bun
 *
 * ### 🔗 Related Resources
 *
 * #### Internal References
 * - {@link OtherFunction} - Here's how this relates to what you're looking at
 *
 * #### External Resources
 *
 * @external GitHub
 * {@link https://github.com/inspatiallabs/inspatial-core GitHub Repository}
 * Source code and issue tracking
 *
 * #### Community Resources
 * @external Discord
 * {@link https://discord.gg/inspatiallabs Discord Community}
 * Join our community for support and discussions
 *
 * @external Twitter
 * {@link https://x.com/inspatiallabs Twitter}
 * Follow us for updates and announcements
 *
 * @external LinkedIn
 * {@link https://www.linkedin.com/company/inspatiallabs LinkedIn}
 * Follow us for updates and announcements
 */

export function shuffle<T>(array: T[]): T[] {
  const shuffledArray = [...array];
  for (let i = shuffledArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
  }
  return shuffledArray;
}
