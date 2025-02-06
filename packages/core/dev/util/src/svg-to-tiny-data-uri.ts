import { inspatialColorPatterns } from "../../kit/theme/src/color/index.ts";

// Define types for our color patterns
type ColorPattern = RegExp | { light: RegExp; dark: RegExp };
type ColorPatterns = Record<string, ColorPattern>;

// RegExp constants
const REGEX = {
  whitespace: /\s+/g,
  urlHexPairs: /%[\dA-F]{2}/g,
  quotes: /"/g,
} as const;

// Hex encoding map
const hexMap = new Map([
  ["%20", " "],
  ["%3D", "="],
  ["%3A", ":"],
  ["%2F", "/"],
]);

const collapseWhitespace = (str: string): string =>
  str.trim().replace(REGEX.whitespace, " ");

const dataURIPayload = (string: string | number | boolean): string =>
  encodeURIComponent(string.toString()).replace(
    REGEX.urlHexPairs,
    specialHexEncode
  );

const specialHexEncode = (match: string): string =>
  hexMap.get(match) || match.toLowerCase();

const testAndReplacePattern = (
  str: string,
  pattern: RegExp | { light: RegExp; dark: RegExp },
  key: string
): string => {
  if (pattern instanceof RegExp) {
    return pattern.test(str) ? str.replace(pattern, key) : str;
  }
  // Handle nested patterns (light/dark)
  let result = str;
  if (pattern.light.test(str)) {
    result = result.replace(pattern.light, `${key}.light`);
  }
  if (pattern.dark.test(str)) {
    result = result.replace(pattern.dark, `${key}.dark`);
  }
  return result;
};

const colorCodeToShorterNames = (string: string): string => {
  return Object.entries(inspatialColorPatterns as ColorPatterns).reduce(
    (str, [key, pattern]) => testAndReplacePattern(str, pattern, key),
    string
  );
};

/**
 * # SvgToTinyDataUri
 * #### Converts SVG strings into compact, URL-safe data URIs for efficient image embedding
 *
 * This function takes your SVG image (in text form) and turns it into a special compact web address
 * (called a data URI) that browsers can understand. Think of it like taking a large piece of paper
 * with a drawing (SVG) and turning it into a tiny, folded note (data URI) that still shows the
 * same picture but takes up less space.
 *
 * @since 0.1.2
 * @category InSpatial Util
 * @module Image
 * @kind function
 * @access public
 *
 * ### 💡 Core Concepts
 * - Converts SVG strings to data URIs for direct browser use
 * - Optimizes the output by removing unnecessary whitespace
 * - Handles color pattern replacements for theme consistency
 * - Ensures URL-safe encoding of special characters
 *
 * ### 📚 Terminology
 * > **Data URI**: A special way to include data directly in web pages instead of linking to external files
 * > **SVG**: Scalable Vector Graphics - a way to describe images using text that can scale to any size
 * > **URI Encoding**: Converting special characters into web-safe formats
 *
 * ### ⚠️ Important Notes
 * <details>
 * <summary>Click to learn more about edge cases</summary>
 *
 * > [!NOTE]
 * > The function removes the Byte-Order Mark (BOM) if present in the SVG
 *
 * > [!NOTE]
 * > Double quotes are converted to single quotes for compatibility
 * </details>
 *
 * ### 🎮 Usage
 * #### Installation
 * ```bash
 * # Deno
 * deno add jsr:@inspatial/util
 * ```
 *
 * #### Examples
 *
 * @example
 * ### Example 1: Basic SVG Conversion
 * ```typescript
 * import { svgToTinyDataUri } from '@inspatial/util/svg-to-tiny-data-uri.ts';
 *
 * const simpleSvg = `
 *   <svg viewBox="0 0 100 100">
 *     <circle cx="50" cy="50" r="40" fill="blue" />
 *   </svg>
 * `;
 *
 * const dataUri = svgToTinyDataUri(simpleSvg);
 * console.log(dataUri);
 * // Output: data:image/svg+xml,<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="blue"/></svg>
 * ```
 *
 * @example
 * ### Example 2: Using with Theme Colors
 * ```typescript
 * import { svgToTinyDataUri } from '@inspatial/util/svg-to-tiny-data-uri.ts';
 *
 * const themedSvg = `
 *   <svg viewBox="0 0 100 100">
 *     <circle cx="50" cy="50" r="40" fill="#0EA5E9" />
 *   </svg>
 * `;
 *
 * const dataUri = svgToTinyDataUri(themedSvg);
 * // The color #0EA5E9 will be replaced with the corresponding theme token if defined
 * ```
 *
 * ### ❌ Common Mistakes
 * <details>
 * <summary>Click to see what to avoid</summary>
 *
 * - Passing empty SVG strings
 * - Using invalid SVG markup
 * - Forgetting to handle errors when the conversion fails
 * </details>
 *
 * @param {string} svgString - The SVG markup to convert into a data URI
 * @throws {TypeError} When the input SVG string is empty
 * @throws {Error} When the SVG conversion fails
 * @returns {string} A data URI string that can be used as an image source
 *
 * ### 🔧 Runtime Support
 * - ✅ Node.js
 * - ✅ Deno
 * - ✅ Bun
 */
export default function svgToTinyDataUri(svgString: string): string {
  if (!svgString?.length) {
    throw new TypeError("SVG string cannot be empty");
  }

  try {
    // Strip the Byte-Order Mark if the SVG has one
    const normalizedSvg =
      svgString.charCodeAt(0) === 0xfeff ? svgString.slice(1) : svgString;

    const body = colorCodeToShorterNames(
      collapseWhitespace(normalizedSvg)
    ).replace(REGEX.quotes, "'");

    return `data:image/svg+xml,${dataURIPayload(body)}`;
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    throw new Error(`Failed to convert SVG: ${errorMessage}`);
  }
}
