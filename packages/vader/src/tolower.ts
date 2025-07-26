/**
 * @module @inspatial/util/tolowercase
 *
 * String utility for converting text to lowercase. This simple utility ensures consistent
 * string case transformation with built-in type safety and null handling.
 *
 * @example Basic Usage
 * ```typescript
 * import { toLower } from "@inspatial/util/tolowercase.ts";
 *
 * const lowercased = toLower("HELLO WORLD");
 * console.log(lowercased); // "hello world"
 * ```
 *
 * @features
 * - Safe conversion of any value to lowercase string
 * - Handles non-string inputs by converting to string first
 * - Simple, single-purpose utility for text normalization
 */

/**
 * # ToLower
 * @summary Converts any text to lowercase
 *
 * The `toLower` function converts any text to lowercase letters. Think of it like
 * a volume knob that turns down the "loudness" of your text - capital letters are like
 * shouting, and lowercase letters are like speaking normally.
 *
 * @since 0.1.9
 * @category InSpatial Util
 * @kind function
 * @access public
 *
 * ### 💡 Core Concepts
 * - Converts all uppercase letters to lowercase
 * - First ensures the input is a string (converts non-strings if needed)
 * - Useful for standardizing text for comparison or display
 *
 * @param {string | number | boolean | object | null | undefined} str - Provides the text to convert to lowercase
 *
 * @returns {string} The input converted to lowercase
 *
 * @example
 * ### Example 1: Basic Text Conversion
 * ```typescript
 * // Convert a message to lowercase
 * const message = "HELLO WORLD";
 * const quiet = toLower(message);
 * console.log(quiet); // Output: "hello world"
 *
 * // Convert mixed case text
 * const mixedCase = "This Is Mixed Case";
 * console.log(toLower(mixedCase)); // Output: "this is mixed case"
 * ```
 *
 * @example
 * ### Example 2: Non-String Values
 * ```typescript
 * // The function safely handles non-string inputs
 * const number = 42;
 * console.log(toLower(number)); // Output: "42"
 *
 * const boolean = true;
 * console.log(toLower(boolean)); // Output: "true"
 *
 * const nullValue = null;
 * console.log(toLower(nullValue)); // Output: "null"
 *
 * const obj = { name: "TEST" };
 * console.log(toLower(obj)); // Output: "[object object]"
 * ```
 */
export const toLower = (
  str: string | number | boolean | object | null | undefined
): string => String(str).toLowerCase();
