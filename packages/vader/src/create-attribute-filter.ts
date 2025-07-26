/**
 * @module @inspatial/util/create-attribute-filter
 *
 * Utility for creating filter functions that match attributes by namespace and name.
 * This makes it easy to find specific attributes in collections of objects, with case-insensitive name matching.
 *
 * @example Basic Usage
 * ```typescript
 * import { createAttributeFilter } from "@inspatial/util/create-attribute-filter.ts";
 *
 * const svgPathFilter = createAttributeFilter("svg", "path");
 * const matchingElements = elements.filter(svgPathFilter);
 * ```
 *
 * @features
 * - Creates reusable attribute filter functions
 * - Case-insensitive name matching
 * - Namespace-aware filtering
 * - Composable with array methods like filter()
 */

import { toLower } from "./tolower.ts";

/**
 * # CreateAttributeFilter
 * @summary Creates a function that filters objects by namespace and name
 *
 * The `createAttributeFilter` function builds a custom filter that matches objects
 * based on their namespace and name attributes. Think of it like creating a custom
 * cookie cutter that only selects objects with specific properties from a collection.
 *
 * @since 0.1.9
 * @category InSpatial Util
 * @kind function
 * @access public
 *
 * ### 💡 Core Concepts
 * - Creates a filter function that you can reuse
 * - Matches objects by their namespace (exact match) and name (case-insensitive)
 * - Perfect for filtering collections of attributes or elements
 *
 * @param {string} ns - Specifies the namespace to match exactly
 * @param {string} name - Specifies the name to match (case-insensitive)
 *
 * @returns {(o: AttributeType) => boolean} A filter function that returns true when an object matches
 *    both the namespace and name criteria
 *
 * @example
 * ### Example 1: Filtering HTML Attributes
 * ```typescript
 * // Let's say we have a list of HTML attributes
 * const attributes = [
 *   { ns: "html", name: "class", value: "container" },
 *   { ns: "html", name: "id", value: "main" },
 *   { ns: "svg", name: "viewBox", value: "0 0 100 100" },
 *   { ns: "html", name: "CLASS", value: "wrapper" } // Note: uppercase name
 * ];
 *
 * // Create a filter that finds all class attributes (case-insensitive)
 * const classFilter = createAttributeFilter("html", "class");
 *
 * // Now we can find all class attributes regardless of case
 * const classAttributes = attributes.filter(classFilter);
 * console.log(classAttributes);
 * // Output: [
 * //   { ns: "html", name: "class", value: "container" },
 * //   { ns: "html", name: "CLASS", value: "wrapper" }
 * // ]
 * ```
 *
 * @example
 * ### Example 2: Finding SVG Attributes
 * ```typescript
 * // Let's work with a mix of HTML and SVG attributes
 * const mixedAttributes = [
 *   { ns: "html", name: "style", value: "color: red;" },
 *   { ns: "svg", name: "fill", value: "blue" },
 *   { ns: "svg", name: "stroke", value: "black" },
 *   { ns: "html", name: "data-id", value: "123" }
 * ];
 *
 * // Create a filter that finds SVG fill attributes
 * const fillFilter = createAttributeFilter("svg", "fill");
 *
 * // Find the fill attribute
 * const fillAttributes = mixedAttributes.filter(fillFilter);
 * console.log(fillAttributes);
 * // Output: [{ ns: "svg", name: "fill", value: "blue" }]
 * ```
 */

/**
 * Represents an object with namespace and name properties
 */
export interface AttributeType {
  ns: string;
  name: string;
  [key: string]: unknown;
}

/**
 * Creates a filter function that matches objects by namespace and name
 */
export const createAttributeFilter =
  (ns: string, name: string): ((o: AttributeType) => boolean) =>
  (o: AttributeType): boolean =>
    o.ns === ns && toLower(o.name) === toLower(name);
