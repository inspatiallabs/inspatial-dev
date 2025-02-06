/**
 * # Stringify
 * #### Converts a key-value object into a formatted string representation
 *
 * The `stringify` function transforms a simple object into a string format, similar to how you might write down a list of settings or configurations. Think of it like converting a recipe's ingredients and measurements into a shopping list format.
 *
 * @since 0.1.3
 * @category InSpatial Util
 * @module Stringify
 * @kind function
 * @access public
 *
 * ### 💡 Core Concepts
 * - Takes an object with string keys and values
 * - Converts each key-value pair into a "key=value" format
 * - Handles special characters and multi-line values
 * - Joins all formatted lines with newlines
 *
 * ### ⚠️ Important Notes
 * <details>
 * <summary>Click to learn more about special cases</summary>
 *
 * > [!NOTE]
 * > Keys starting with '#' are treated as comments and ignored
 *
 * > [!NOTE]
 * > Values containing special characters are automatically quoted
 * </details>
 *
 * ### 📝 Type Definitions
 * ```typescript
 * type StringRecord = Record<string, string>;  // An object with string keys and values
 * ```
 *
 * @param {Record<string, string>} object - Processes an object containing string key-value pairs
 *    Each key becomes a property name, and each value becomes its corresponding value
 *    in the output string.
 *
 * @example
 * ### Example 1: Basic Key-Value Pairs
 * ```typescript
 * const config = {
 *   name: "John",
 *   age: "30"
 * };
 *
 * const result = stringify(config);
 * console.log(result);
 * // Output:
 * // name=John
 * // age=30
 * ```
 *
 * @example
 * ### Example 2: Handling Special Characters
 * ```typescript
 * const settings = {
 *   greeting: "Hello, world!",
 *   message: "This is a\nmulti-line message",
 *   "#comment": "This will be ignored"
 * };
 *
 * const result = stringify(settings);
 * console.log(result);
 * // Output:
 * // greeting='Hello, world!'
 * // message="This is a\nmulti-line message"
 * ```
 *
 * @returns {string}
 * Returns a formatted string where each key-value pair is on a new line in the format "key=value"
 *
 * ### 🔧 Runtime Support
 * - ✅ Node.js
 * - ✅ Deno
 * - ✅ Bun
 */
export function stringify(object: Record<string, string>): string {
  const lines: string[] = [];
  for (const [key, value] of Object.entries(object)) {
    let quote;

    let escapedValue = value ?? "";
    if (key.startsWith("#")) {
      // deno-lint-ignore no-console
      console.warn(
        `key starts with a '#' indicates a comment and is ignored: '${key}'`
      );
      continue;
    } else if (escapedValue.includes("\n") || escapedValue.includes("'")) {
      // escape inner new lines
      escapedValue = escapedValue.split("\n").join("\\n");
      quote = `"`;
    } else if (/\W/.test(escapedValue)) {
      quote = "'";
    }

    if (quote) {
      // escape inner quotes
      escapedValue = escapedValue.split(quote).join(`\\${quote}`);
      escapedValue = `${quote}${escapedValue}${quote}`;
    }
    const line = `${key}=${escapedValue}`;
    lines.push(line);
  }
  return lines.join("\n");
}
