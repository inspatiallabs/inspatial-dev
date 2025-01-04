/**
 * Takes any value and turns it into a readable string. This is especially helpful when you want to:
 * - Print objects in a clean way
 * - Show the contents of Sets and Maps
 * - Make sure test results look the same every time
 *
 * Why use this?
 * - It's great for debugging (seeing what's inside your data)
 * - It helps write better tests (by showing data in a consistent way)
 * - It makes complex data structures easy to read
 *
 * Note:
 * format is general-purpose and can be used to format any type of value (unknown type) into a string representation. It handles objects, arrays, Sets, Maps, and primitive values.
 *
 * @param v The thing you want to turn into a string (can be anything!)
 * @returns A nice-looking string version of your input
 *
 * Simple examples:
 * ```ts
 * import { format } from "@inspatial/util";
 *
 * // Objects become readable
 * format({ a: 1, b: 2 })
 * // Shows as:
 * // {
 * //   a: 1,
 * //   b: 2,
 * // }
 *
 * // Sets look nice too
 * format(new Set([1, 2]))
 * // Shows as:
 * // Set(2) {
 * //   1,
 * //   2,
 * // }
 *
 * // Maps are easy to read
 * format(new Map([[1, 2]]))
 * // Shows as:
 * // Map(1) {
 * //   1 => 2,
 * // }
 * ```
 *
 * Examples with InSpatial Test:
 *
 * @example Using assertEquals
 * ```ts
 * import { test, assertEquals } from "@inspatial/test";
 * import { format } from "@inspatial/util";
 *
 * test("formatting with assertEquals", () => {
 *   // Simple object test
 *   const user = { name: "Alex", age: 25 };
 *   assertEquals(
 *     format(user),
 *     "{\n  name: \"Alex\",\n  age: 25,\n}"
 *   );
 * });
 * ```
 *
 * @example Using expect
 * ```ts
 * import { test, expect } from "@inspatial/test";
 * import { format } from "@inspatial/util";
 *
 * test("formatting with expect", () => {
 *   // Simple object test
 *   const user = { name: "Alex", age: 25 };
 *   expect(format(user)).toBe("{\n  name: \"Alex\",\n  age: 25,\n}");
 *
 *   // Testing a Set
 *   const colors = new Set(["red", "blue"]);
 *   expect(format(colors)).toBe("Set(2) {\n  \"red\",\n  \"blue\",\n}");
 * });
 * ```
 *
 * @example Testing collections
 * ```ts
 * import { test, expect } from "@inspatial/test";
 * import { format } from "@inspatial/util";
 *
 * test("formatting collections", () => {
 *   // Testing a Map
 *   const scores = new Map([["player1", 100]]);
 *   expect(format(scores)).toBe("Map(1) {\n  \"player1\" => 100,\n}");
 *
 *   // Testing an Array
 *   const items = ["apple", "banana"];
 *   expect(format(items)).toBe("[\n  \"apple\",\n  \"banana\",\n]");
 * });
 * ```
 *
 * @example Testing complex structures
 * ```ts
 * import { test, expect } from "@inspatial/test";
 * import { format } from "@inspatial/util";
 *
 * test("formatting nested data", () => {
 *   const gameState = {
 *     player: { x: 10, y: 20 },
 *     inventory: new Set(["sword", "shield"]),
 *     scores: new Map([["level1", 100]])
 *   };
 *
 *   // Using expect for complex objects
 *   expect(format(gameState)).toBe(
 *     "{\n" +
 *     "  player: {\n    x: 10,\n    y: 20,\n  },\n" +
 *     "  inventory: Set(2) {\n    \"sword\",\n    \"shield\",\n  },\n" +
 *     "  scores: Map(1) {\n    \"level1\" => 100,\n  },\n" +
 *     "}"
 *   );
 * });
 * ```
 */
export function format(v: unknown): string {
  // deno-lint-ignore no-explicit-any
  const { Deno } = globalThis as any;
  return typeof Deno?.inspect === "function"
    ? Deno.inspect(v, {
        depth: Infinity,
        sorted: true,
        trailingComma: true,
        compact: false,
        iterableLimit: Infinity,
        // getters should be true in assertEquals.
        getters: true,
        strAbbreviateSize: Infinity,
      })
    : `"${String(v).replace(/(?=["\\])/g, "\\")}"`;
}
