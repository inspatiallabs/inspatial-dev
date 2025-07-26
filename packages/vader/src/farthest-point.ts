/*#############################################(TYPES)#############################################*/
//#region FarthestPoint
/** Represents the farthest point type property in a difference algorithm. */
export interface FarthestPointProp {
  /** The y-coordinate of the point. */
  y: number;
  /** The id of the point. */
  id: number;
}

/*#############################################(CONSTANTS)#############################################*/

const REMOVED = 1;
const ADDED = 3;

/*#############################################(FARTHERST POINT)#############################################*/
//#region farthestPoint
/**
 * The `farthestPoint` utility function generates a {@linkcode FarthestPointProp} object.
 *
 * A `FarthestPoint` is a simple object with two properties: `y` and `id`.
 * This function helps in determining the farthest point in a sequence of operations.
 *
 * ### Parameters:
 * - `k`: The current index in the sequence.
 * - `M`: The length of the first array.
 * - `routes`: An array that keeps track of the sequence of operations.
 * - `diffTypesPtrOffset`: An offset used in the `routes` array to differentiate types.
 * - `ptr`: The current position in the `routes` array.
 * - `slide`: An optional `FarthestPoint` object representing a slide operation.
 * - `down`: An optional `FarthestPoint` object representing a down operation.
 *
 * ### Returns:
 * - A `FarthestPoint` object with updated `y` and `id` values.
 *
 * ### Example without tests:
 * ```ts
 * const result = farthestPoint(0, 0, new Uint32Array(0), 0, 0, { y: -1, id: 0 }, { y: 0, id: 0 });
 * console.log(result); // Output: { y: -1, id: 1 }
 * ```
 *
 * ### Example with tests:
 *
 * Using `assert` syntax:
 * ```ts
 * import { assertEquals } from "@inspatial/test";
 *
 * test({
 *   name: "farthestPoint with assert",
 *   fn: () => {
 *     const result = farthestPoint(0, 0, new Uint32Array(0), 0, 0, { y: -1, id: 0 }, { y: 0, id: 0 });
 *     assertEquals(result, { y: -1, id: 1 });
 *   }
 * });
 * ```
 *
 * Using `expect` syntax:
 * ```ts
 * import { expect } from "@inspatial/test";
 *
 * test({
 *   name: "farthestPoint with expect",
 *   fn: () => {
 *     const result = farthestPoint(0, 0, new Uint32Array(0), 0, 0, { y: -1, id: 0 }, { y: 0, id: 0 });
 *     expect(result).toEqual({ y: -1, id: 1 });
 *   }
 * });
 * ```
 */
export function farthestPoint(
  k: number,
  M: number,
  routes: Uint32Array,
  diffTypesPtrOffset: number,
  ptr: number,
  slide?: FarthestPointProp,
  down?: FarthestPointProp
): FarthestPointProp {
  if (slide && slide.y === -1 && down && down.y === -1) {
    return { y: 0, id: 0 };
  }
  const isAdding =
    down?.y === -1 || k === M || (slide?.y ?? 0) > (down?.y ?? 0) + 1;
  if (slide && isAdding) {
    const prev = slide.id;
    ptr++;
    routes[ptr] = prev;
    routes[ptr + diffTypesPtrOffset] = ADDED;
    return { y: slide.y, id: ptr };
  }
  if (down && !isAdding) {
    const prev = down.id;
    ptr++;
    routes[ptr] = prev;
    routes[ptr + diffTypesPtrOffset] = REMOVED;
    return { y: down.y + 1, id: ptr };
  }
  throw new Error("Unexpected missing FarthestPoint");
}

//#endregion farthestPoint

/*#############################################(FARTHEST POINT ASSERTION)#############################################*/
//#region farthestPointAssertion
/**
 * The `farthestPointAssertion` utility function checks if a given value is a valid `FarthestPointProp`.
 * A `FarthestPointProp` is an object with two properties: `y` and `id`, both of which are numbers.
 * If the value does not match this structure, an error is thrown.
 *
 * ### Parameters:
 * - `value`: The value to be checked.
 *
 * ### Returns:
 * - This function does not return a value. It completes successfully if the assertion passes.
 *
 * ### Example without tests:
 * ```ts
 * // Import the assertion function
 * import { farthestPointAssertion } from "@inspatial/test";
 *
 * // This will pass as the object matches the expected structure
 * farthestPointAssertion({ y: 0, id: 0 });
 *
 * // The following will throw an error as the object is missing the 'y' property
 * // farthestPointAssertion({ id: 0 });
 * ```
 *
 * <details>
 * <summary>Example with tests:</summary>
 * <p>
 *
 * Using `assert` syntax:
 * ```ts
 * import { test, assertThrows } from "@inspatial/test";
 *
 * test({
 *   name: "farthestPointAssertion with assert",
 *   fn: () => {
 *     // This will pass
 *     farthestPointAssertion({ y: 0, id: 0 });
 *
 *     // These will throw errors
 *     assertThrows(() => farthestPointAssertion({ id: 0 }));
 *     assertThrows(() => farthestPointAssertion({ y: 0 }));
 *     assertThrows(() => farthestPointAssertion(undefined));
 *   }
 * });
 * ```
 *
 * Using `expect` syntax:
 * ```ts
 * import { test, expect } from "@inspatial/test";
 *
 * test({
 *   name: "farthestPointAssertion with expect",
 *   fn: () => {
 *     // This will pass
 *     farthestPointAssertion({ y: 0, id: 0 });
 *
 *     // These will throw errors
 *     expect(() => farthestPointAssertion({ id: 0 })).toThrow();
 *     expect(() => farthestPointAssertion({ y: 0 })).toThrow();
 *     expect(() => farthestPointAssertion(undefined)).toThrow();
 *   }
 * });
 * ```
 * </p>
 * </details>
 */
export function farthestPointAssertion(
  value: unknown
): asserts value is FarthestPointProp {
  if (
    value == null ||
    typeof value !== "object" ||
    typeof (value as FarthestPointProp)?.y !== "number" ||
    typeof (value as FarthestPointProp)?.id !== "number"
  ) {
    throw new Error(
      `Unexpected value, expected 'FarthestPoint': received ${typeof value}`
    );
  }
}
