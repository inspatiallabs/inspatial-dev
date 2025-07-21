import * as ISSType from "./index.ts";

/**
 * ## ISS Props
 * #### A comprehensive type definition for InSpatial Style Sheet properties
 *
 * The `ISSProps` interface gives you a complete blueprint for styling elements in the InSpatial ecosystem.
 * Think of it like a styling recipe book that knows all the standard CSS ingredients (properties) while also
 * letting you create your own custom flavor combinations (CSS variables with -- prefix).
 *
 * @since 0.1.8
 * @category InSpatial Theme
 * @module @inspatial/theme/iss
 * @kind interface
 * @access public
 *
 * ### 💡 Core Concepts
 * - Standard CSS properties can be written in camelCase format (like `backgroundColor`) or with hyphens (like `background-color`)
 * - Custom style variables start with `--` (such as `--primary-color` or `--header-height`)
 * - Property values can be strings, numbers, or undefined to accommodate different styling needs
 *
 * ### 🎯 Prerequisites
 * Before you start:
 * - Basic knowledge of CSS properties and their values
 * - Understanding of TypeScript interfaces and type safety
 * - Familiarity with CSS custom properties (CSS variables)
 *
 * ### 📚 Terminology
 * > **InSpatial Style Sheet (ISS)**: InSpatial's styling system that enhances CSS with type safety and better developer experience.
 * > **CSS Custom Properties**: Browser-native variables that start with -- and can be used to store reusable values.
 * > **Index Signature**: In TypeScript, a way to define properties with a dynamic name pattern (used here for CSS variables).
 *
 * ### 🎮 Usage Examples
 *
 * **Creating a button style:**
 * ```typescript
 * import type { ISSProps } from "@inspatial/theme/iss/type/data-types.ts";
 *
 * // Define a style object for buttons
 * const buttonStyle: ISSProps = {
 *   backgroundColor: "blue",           // Standard property (camelCase)
 *   color: "white",                    // Text color
 *   'border-radius': "4px",            // Standard property (hyphen notation)
 *   '--button-highlight': "#5588ff"    // Custom property (for hover effects)
 * };
 * ```
 *
 * **Building a theme system:**
 * ```typescript
 * import type { ISSProps } from "@inspatial/theme/iss/type/data-types.ts";
 *
 * // Create theme objects with colors and typography
 * const lightTheme = {
 *   colors: {
 *     '--bg-primary': "#ffffff",
 *     '--text-primary': "#333333"
 *   } as ISSProps,
 *   typography: {
 *     '--font-size-base': "16px",
 *     fontFamily: "Arial, sans-serif"
 *   } as ISSProps
 * };
 * ```
 *
 * ### ⚠️ Important Notes
 * - When using numbers for properties that require units (like `fontSize: 16`), your style application
 *   code will need to handle adding the appropriate unit (e.g., converting to `"16px"`).
 * - The index signature for custom properties only captures properties that start with `--`.
 * - Regular CSS properties are provided by the extended `ISSType.Properties` and `ISSType.PropertiesHyphen` types.
 * - `iss` is a curated set of cascading style sheets tailored for InSpatial's universal rendering goals, rather than an exhaustive list of every CSS property ever conceived.
 *
 * ### ❌ Common Mistakes
 * - Forgetting to add the `--` prefix to custom properties
 * - Not accounting for unit conversion when using number values
 * - Creating overly large style objects that could impact performance
 *
 * ### 📝 Uncommon Knowledge
 * Using a well-typed styling interface like ISSProps creates an implicit "style contract" in your application,
 * making it easier to maintain consistent styling across components and teams.
 */
export interface ISSProps
  extends ISSType.StandardLonghandProperties<string | number>,
    ISSType.StandardShorthandProperties<string | number>,
    ISSType.SvgProperties<string | number>,
    ISSType.StandardLonghandPropertiesHyphen<string | number>,
    ISSType.StandardShorthandPropertiesHyphen<string | number>,
    ISSType.SvgPropertiesHyphen<string | number> {
  /**
   * Allows defining custom InSpatial Style Sheet (ISS) variables.
   * These are akin to CSS Custom Properties and must start with `--`.
   * For example, you could define `--primary-text-color: "black"`.
   * The `iss` here is a placeholder name for the index signature key.
   */
  [iss: `--${string}`]: string | number | undefined;
}


export * as ISSType from "./index.ts";
