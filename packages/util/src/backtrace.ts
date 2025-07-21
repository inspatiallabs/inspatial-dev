/*#############################################(IMPORTS)#############################################*/

import { DiffTypeProp } from "./difference.ts";
import { FarthestPointProp } from "./farthest-point.ts";

/*#############################################(CONSTANTS)#############################################*/

const REMOVED = 1;
const ADDED = 0;

/*#############################################(FUNCTIONS)#############################################*/

/**
 * The `backTrace` utility function helps you understand what has changed between two lists.
 * It tells you which items were added, removed, or stayed the same.
 *
 * @typeParam T The type of items in the lists.
 *
 * @param A The first list of items.
 * @param B The second list of items.
 * @param current The current position in the list of changes.
 * @param swapped If true, it swaps the meaning of added and removed.
 * @param routes A list that helps track changes.
 * @param diffTypesPtrOffset A number that helps find the type of change.
 *
 * @returns A list of changes, showing what was added, removed, or stayed the same.
 *
 * @example Simple usage
 * ```ts
 * // Imagine you have two lists of numbers
 * const list1 = [1, 2, 3];
 * const list2 = [1, 3, 4];
 *
 * // This will show you the differences between the lists
 * const changes = backTrace(list1, list2, { y: 0, id: 0 }, false, new Uint32Array(0), 0);
 * ```
 *
 * @example Testing with expect syntax
 * ```ts
 * import { expect, test } from "@inspatial/test";
 *
 * test("it finds differences between lists", () => {
 *   const list1 = [1, 2, 3];
 *   const list2 = [1, 3, 4];
 *   const result = backTrace(list1, list2, { y: 0, id: 0 }, false, new Uint32Array(0), 0);
 *
 *   expect(result).toEqual([
 *     { type: "common", value: 1 },
 *     { type: "removed", value: 2 },
 *     { type: "added", value: 3 },
 *     { type: "added", value: 4 }
 *   ]);
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
 *     const result = backTrace(list1, list2, { y: 0, id: 0 }, false, new Uint32Array(0), 0);
 *
 *     expect(result).toEqual([
 *       { type: "added", value: 1 },
 *       { type: "added", value: 2 },
 *       { type: "added", value: 3 }
 *     ]);
 *   }
 * });
 * ```
 */
export function backTrace<T>(
  A: T[],
  B: T[],
  current: FarthestPointProp,
  swapped: boolean,
  routes: Uint32Array,
  diffTypesPtrOffset: number
): Array<{
  type: DiffTypeProp;
  value: T;
}> {
  const M = A.length;
  const N = B.length;
  const result: { type: DiffTypeProp; value: T }[] = [];
  let a = M - 1;
  let b = N - 1;
  let j = routes[current.id];
  let type = routes[current.id + diffTypesPtrOffset];
  while (true) {
    if (!j && !type) break;
    const prev = j!;
    if (type === REMOVED) {
      result.unshift({
        type: swapped ? "removed" : "added",
        value: B[b]!,
      });
      b -= 1;
    } else if (type === ADDED) {
      result.unshift({
        type: swapped ? "added" : "removed",
        value: A[a]!,
      });
      a -= 1;
    } else {
      result.unshift({ type: "common", value: A[a]! });
      a -= 1;
      b -= 1;
    }
    j = routes[prev];
    type = routes[prev + diffTypesPtrOffset];
  }
  return result;
}
