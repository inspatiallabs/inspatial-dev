/**
 * Creates and throws a custom error for font-related issues on InSpatial
 *
 * @param message - The error message describing the font-related issue
 * @throws {Error} Always throws an error with name "InSpatialFontError"
 * @example
 * ```ts
 * // Example 1: Invalid font family
 * if (!isValidFontFamily(fontFamily)) {
 *   inSpatialFontError('Invalid font family specified: ' + fontFamily);
 * }
 *
 * // Example 2: Missing font weight
 * if (!fontWeights.includes(weight)) {
 *   inSpatialFontError(`Font weight ${weight} is not available for ${fontFamily}`);
 * }
 * ```
 */
export function inSpatialFontError(message: string): never {
  const err = new Error(message);
  err.name = "InSpatialFontError";
  throw err;
}
