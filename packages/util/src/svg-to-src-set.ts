import svgToTinyDataUri from "./svg-to-tiny-data-uri.ts";

/**

/**
 * # SVG To Src set
 * #### Converts SVG data URIs into srcset-compatible format for responsive images
 *
 * This function takes an SVG string and converts it into a format that works with the srcset attribute
 * in HTML images. Think of it like preparing an image to look good on different device screens,
 * just like how you might resize a photo to fit different picture frames.
 *
 * @since 0.1.2
 * @category InSpatial Util
 * @module Image
 * @kind function
 * @access public
 *
 * ### 💡 Core Concepts
 * - Converts SVG to a srcset-compatible data URI
 * - Properly encodes spaces for srcset attribute
 * - Works in conjunction with svgToTinyDataUri
 * - Ensures compatibility with responsive image loading
 *
 * ### 📚 Terminology
 * > **srcset**: A HTML attribute that lets you provide different image sources for different screen sizes
 * > **data URI**: A way to include image data directly in HTML instead of linking to a separate file
 *
 * ### ⚠️ Important Notes
 * <details>
 * <summary>Click to learn more about edge cases</summary>
 *
 * > [!NOTE]
 * > All spaces in the output are encoded as %20 to maintain srcset compatibility
 *
 * > [!NOTE]
 * > The function builds upon svgToTinyDataUri for initial conversion
 * </details>
 *
 * ### 🎮 Usage
 * #### Installation
 * ```bash
 * # Deno
 * deno add jsr:@inspatial/util
 * ```
 *
 * @example
 * ### Example 1: Basic Usage with Responsive Images
 * ```typescript
 * import { svgToSrcSet } from '@inspatial/util/svg-to-tiny-data-uri.ts';
 *
 * const svgLogo = `
 *   <svg viewBox="0 0 100 100">
 *     <circle cx="50" cy="50" r="40" fill="blue" />
 *   </svg>
 * `;
 *
 * const srcsetValue = svgToSrcSet(svgLogo);
 *
 * // Use in HTML
 * const img = document.createElement('img');
 * img.srcset = srcsetValue;
 * ```
 *
 * @example
 * ### Example 2: Using with Picture Element
 * ```typescript
 * import { svgToSrcSet } from '@inspatial/util/svg-to-tiny-data-uri.ts';
 *
 * const darkLogo = `
 *   <svg viewBox="0 0 100 100">
 *     <circle cx="50" cy="50" r="40" fill="#1a1a1a" />
 *   </svg>
 * `;
 *
 * const lightLogo = `
 *   <svg viewBox="0 0 100 100">
 *     <circle cx="50" cy="50" r="40" fill="#ffffff" />
 *   </svg>
 * `;
 *
 * const darkSrcset = svgToSrcSet(darkLogo);
 * const lightSrcset = svgToSrcSet(lightLogo);
 *
 * // Use with picture element for dark/light mode
 * const picture = `
 *   <picture>
 *     <source srcset="${darkSrcset}" media="(prefers-color-scheme: dark)">
 *     <img srcset="${lightSrcset}" alt="Logo">
 *   </picture>
 * `;
 * ```
 *
 * ### ❌ Common Mistakes
 * <details>
 * <summary>Click to see what to avoid</summary>
 *
 * - Passing non-SVG strings
 * - Forgetting to handle empty input cases
 * - Not providing proper error handling
 * </details>
 *
 * @param {string} svgString - The SVG markup to convert into a srcset-compatible data URI
 * @throws {TypeError} When the input SVG string is empty
 * @throws {Error} When the SVG conversion fails
 * @returns {string} A srcset-compatible data URI string
 *
 * ### 🔧 Runtime Support
 * - ✅ Node.js
 * - ✅ Deno
 * - ✅ Bun
 */
export function svgToSrcSet(svgString: string): string {
  return svgToTinyDataUri(svgString).replace(/ /g, "%20");
}
