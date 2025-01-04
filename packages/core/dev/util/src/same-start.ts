/**
 * Same Start is a function that looks at two lists and returns what they have in common at the start.
 * Stops checking as soon as it finds something different.
 *
 * @param A First list of items
 * @param B Second list of items
 * @returns A new list containing only the matching items from the start
 *
 * @example Simple usage
 * ```ts
 * // If you have two lists of numbers
 * const firstList = [1, 2, 3];
 * const secondList = [1, 2, 4];
 *
 * // This will give you [1, 2] because that's what matches at the start
 * const matching = sameStart(firstList, secondList);
 * ```
 *
 * @example With strings
 * ```ts
 * const names1 = ["John", "Jane", "Bob"];
 * const names2 = ["John", "Jane", "Alice"];
 *
 * // This gives you ["John", "Jane"]
 * const matching = sameStart(names1, names2);
 * ```
 *
 * @example Testing with expect syntax
 * ```ts
 * import { expect, test } from "@inspatial/test";
 *
 * test("it finds matching numbers at start", () => {
 *   const list1 = [1, 2, 3];
 *   const list2 = [1, 2, 4];
 *
 *   expect(sameStart(list1, list2)).toEqual([1, 2]);
 * });
 * ```
 *
 * @example Testing with assert syntax
 * ```ts
 * import { assertEquals, test } from "@inspatial/test";
 *
 * test("it finds matching strings at start", () => {
 *   const list1 = ["a", "b", "c"];
 *   const list2 = ["a", "b", "x"];
 *
 *   assertEquals(sameStart(list1, list2), ["a", "b"]);
 * });
 * ```
 *
 * @example Testing with object style
 * ```ts
 * import { expect, test } from "@inspatial/test";
 *
 * test({
 *   name: "it handles empty lists",
 *   fn: () => {
 *     const list1: number[] = [];
 *     const list2 = [1, 2, 3];
 *
 *     expect(sameStart(list1, list2)).toEqual([]);
 *   }
 * });
 */
export function sameStart<T>(A: T[], B: T[]): T[] {
  const common: T[] = [];
  if (A.length === 0 || B.length === 0) return [];
  for (let i = 0; i < Math.min(A.length, B.length); i += 1) {
    const a = A[i];
    const b = B[i];
    if (a !== undefined && a === b) {
      common.push(a);
    } else {
      return common;
    }
  }
  return common;
}
