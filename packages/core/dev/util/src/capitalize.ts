/*##############################################(CAPITALIZE-UTILITY)##############################################*/

/**
 * @name capitalize
 * @description Transforms a string by capitalizing its first letter and converting the rest to lowercase
 * @category String Utilities
 * @version 0.1.0
 *
 * @param {string} string - The input string to be capitalized
 * @returns {string} The transformed string with first letter capitalized
 *
 * @example
 * ```ts
 * capitalize("hello") // Returns "Hello"
 * capitalize("WORLD") // Returns "World"
 * capitalize("javaScript") // Returns "Javascript"
 * ```
 *
 * @throws {TypeError} If the input is not a string
 * @since 0.1.0
 */
export function capitalize(string: string): string {
  /** Extract and uppercase the first character of the input string */
  const firstChar = string.charAt(0).toUpperCase();

  /** Convert the remaining characters to lowercase */
  const restOfString = string.slice(1).toLowerCase();

  /** Concatenate the uppercase first character with the lowercase remainder */
  return firstChar + restOfString;
}
