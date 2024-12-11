/*##############################################(REPLACE-NON-DIGITS-UTIL)##############################################*/

/**
 * Removes all non-digit characters from a string, preserving decimal points.
 *
 * @param value - The input string to process
 * @returns A string containing only digits and decimal points
 *
 * @example
 * replaceNonDigits("$123.45");
 * // => "123.45"
 * @example
 * replaceNonDigits("1,000");
 * // => "1000"
 *
 * @example
 * replaceNonDigits("abc42.5xyz");
 * // => "42.5"
 */
export function replaceNonDigits(value: string): string {
  return value.replace(/[^\d.]/, "");
}
