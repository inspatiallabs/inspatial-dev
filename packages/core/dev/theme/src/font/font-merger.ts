import { GoogleFontProps } from "./google/prop.ts";
import { PrimitiveFontProps } from "./primitive/const.ts";

//##############################################(INSPATIAL FONT MERGER)##############################################//
/**
 * ╔════════════════════════════════════════════════════════════════════════════╗
 * ║                               Font Merger                                  ║
 * ╠════════════════════════════════════════════════════════════════════════════╣
 * ║                                                                            ║
 * ║  Font Merger is a utility for combining multiple font configurations       ║
 * ║  from different sources (Google Fonts and Primitive/InSpatial Fonts).      ║
 * ║  It provides unified strings for styles, classes, and CSS variables        ║
 * ║  that can be used across your application.                                 ║
 * ║                                                                            ║
 * ║  FEATURES:                                                                 ║
 * ║  - Combines Google Fonts and InSpatial Primitive fonts                     ║
 * ║  - Generates unified style strings                                         ║
 * ║  - Creates combined class names                                            ║
 * ║  - Merges CSS variables                                                    ║
 * ║                                                                            ║
 * ║  NOTE:                                                                     ║
 * ║  - All functions filter out null/undefined values automatically            ║
 * ║  - Results are cached for performance                                      ║
 * ║                                                                            ║
 * ╚════════════════════════════════════════════════════════════════════════════╝
 */

/************************(Constants)************************/

// Get all font variables from spatialKit
const googleFonts = GoogleFontProps;
const primitiveFonts = PrimitiveFontProps;

/************************(InSpatial Font Style)************************
 * Combines all font styles from Google Fonts and InSpatial (Primitive) fonts into a single string.
 * This includes font weights, styles, and other CSS font properties.
 *
 * @returns {string} A space-separated string of font styles
 *
 * @example
 * // Basic usage
 * const styles = inspatialFontStyle;
 * // Returns: "font-bold font-light custom-bold"
 *
 * @example
 * // Usage with style attribute
 * function Component() {
 *   return <Text style={inspatialFontStyle}>Text content</Text>;
 * }
 *
 * @example
 * // Usage with ThemeProvider in layout
 * function RootLayout() {
 *   return (
 *     <ThemeProvider>
 *       <Component style={inspatialFontStyle}>
 *          ....
 *       </Component>
 *     </ThemeProvider>
 *   );
 * }
 */
export const inspatialFontStyle: string = [
  ...googleFonts.filter(font => font?.font).map((font) => font.font?.style).filter(Boolean),
  ...primitiveFonts.filter(font => font?.font).map((font) => font.font?.style).filter(Boolean),
].join(" ");

/************************(InSpatial Font Class)************************
 * Combines all font classes from Google Fonts and InSpatial (Primitive) fonts.
 * This includes both axes configurations from Google Fonts and class names from Primitive fonts.
 *
 * @returns {string} A space-separated string of CSS class names
 *
 * @example
 * // Basic usage
 * const classes = inspatialFontClass;
 * // Returns: "arial roboto spatial"
 *
 * @example
 * // Usage with className attribute
 * function Component() {
 *   return <Text className={inspatialFontClass}>InSpatial is radical!</Text>;
 * }
 *
 * @example
 * // Usage with ThemeProvider and additional classes
 * function App() {
 *   return (
 *     <ThemeProvider>
 *       <Component className={`${inspatialFontClass} bg-surface`}>
 *         ....
 *       </Component>
 *     </ThemeProvider>
 *   );
 * }
 */
export const inspatialFontClass: string = [
  ...googleFonts.filter(font => font?.font).map((font) => font.font?.axes).filter(Boolean),
  ...primitiveFonts
    .filter(font => font?.font?.className)
    .map((font) => font.font?.className as string)
    .filter(Boolean),
].join(" ");

/************************(InSpatial Font Variable)************************
 * Combines all font CSS variables from Google Fonts and InSpatial (Primitive) fonts.
 * These variables can be used for dynamic font properties and theming.
 *
 * @returns {string} A space-separated string of CSS variable names
 *
 * @example
 * // Basic usage
 * const variables = inspatialFontVariable;
 * // Returns: "--font-arial --font-roboto --font-spatial"
 *
 * @example
 * // Usage with CSS-in-JS
 * const styles = {
 *   fontFamily: `var(${inspatialFontVariable})`
 * };
 *
 * @example
 * // Usage with ThemeProvider in layout
 * function RootLayout() {
 *   return (
 *     <ThemeProvider>
 *       <html className={inspatialFontVariable}>
 *         <body>
 *           ....
 *         </body>
 *       </html>
 *     </ThemeProvider>
 *   );
 * }
 *
 * @example
 * // Usage with CSS (CSS Modules)
 * // styles.css
 * .container {
 *   font-family: var(--font-arial), var(--font-roboto);
 * }
 *
 * // Component.tsx
 * import styles from './styles.css';
 *
 * function Component() {
 *   return (
 *     <Component className={`${styles.container} ${inspatialFontVariable}`}>
 *       ...
 *     </Component>
 *   );
 * }
 */
export const inspatialFontVariable: string = [
  ...googleFonts.filter(font => font?.font).map((font) => font.font?.variable).filter(Boolean),
  ...primitiveFonts.filter(font => font?.font).map((font) => font.font?.variable).filter(Boolean),
].join(" ");
