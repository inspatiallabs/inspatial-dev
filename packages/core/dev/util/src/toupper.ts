/**
 * @module @inspatial/util/toupper
 *
 * String utility for converting text to uppercase. This simple utility ensures consistent
 * string case transformation with built-in type safety and null handling.
 *
 * @example Basic Usage
 * ```typescript
 * import { toUpper } from "@inspatial/util/toupper.ts";
 *
 * const uppercased = toUpper("hello world");
 * console.log(uppercased); // "HELLO WORLD"
 * ```
 *
 * @features
 * - Safe conversion of any value to uppercase string
 * - Handles non-string inputs by converting to string first
 * - Simple, single-purpose utility for text normalization
 */

/**
 * # ToUpper
 * @summary Converts any text to uppercase
 *
 * The `toUpper` function converts any text to uppercase letters. Think of it like
 * a volume knob that turns up the "loudness" of your text - lowercase letters are like
 * speaking normally, and uppercase letters are like shouting or emphasizing something important.
 *
 * @since 0.1.9
 * @category InSpatial Util
 * @kind function
 * @access public
 *
 * ### 💡 Core Concepts
 * - Converts all lowercase letters to uppercase
 * - First ensures the input is a string (converts non-strings if needed)
 * - Useful for emphasizing text or standardizing for certain comparisons
 *
 * @param {string | number | boolean | object | null | undefined} str - Provides the text to convert to uppercase
 *
 * @returns {string} The input converted to uppercase
 *
 * @example
 * ### Example 1: Basic Text Conversion
 * ```typescript
 * // Convert a message to uppercase
 * const message = "hello world";
 * const loud = toUpper(message);
 * console.log(loud); // Output: "HELLO WORLD"
 *
 * // Convert mixed case text
 * const mixedCase = "This Is Mixed Case";
 * console.log(toUpper(mixedCase)); // Output: "THIS IS MIXED CASE"
 * ```
 *
 * @example
 * ### Example 2: Non-String Values
 * ```typescript
 * // The function safely handles non-string inputs
 * const number = 42;
 * console.log(toUpper(number)); // Output: "42"
 *
 * const boolean = true;
 * console.log(toUpper(boolean)); // Output: "TRUE"
 *
 * const nullValue = null;
 * console.log(toUpper(nullValue)); // Output: "NULL"
 *
 * const obj = { name: "test" };
 * console.log(toUpper(obj)); // Output: "[OBJECT OBJECT]"
 * ```
 */
export const toUpper = (
  str: string | number | boolean | object | null | undefined
): string => String(str).toUpperCase();
