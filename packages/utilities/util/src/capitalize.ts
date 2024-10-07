/*##############################################(CAPITALIZE-UTILITY)##############################################*/

/**
 * A Spatial kit utility function that capitalizes the first letter of a string
 * @example capitalize("hello") // "Hello"
 */
export function capitalize(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}
