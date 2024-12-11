/*##############################################(MERGE-REFS-UTIL)##############################################*/

type AnyRef<T> = ((instance: T | null) => void) | { current: T | null } | null;

/**
 * A universal utility to merge multiple refs into a single ref callback function.
 * Works with both callback refs in React and object refs from any framework or TypeScript code.
 *
 * @template T - The type of value the refs will reference
 * @param {Array<AnyRef<T>>} refs - Array of refs to merge
 * @returns {(value: T | null) => void} A callback function that updates all provided refs
 *
 * @example
 * // With object refs
 * const firstRef = { current: null };
 * const secondRef = { current: null };
 * const mergedRef = mergeRefs([firstRef, secondRef]);
 *
 * // With callback refs
 * const callbackRef = (node) => console.log(node);
 * const combinedRef = mergeRefs([firstRef, callbackRef]);
 *
 * // Usage with frameworks (e.g., React)
 * function Component() {
 *   const localRef = useRef(null);
 *   const combinedRef = mergeRefs([localRef, props.forwardedRef]);
 *
 *   return <div ref={combinedRef}>Content</div>;
 * }
 *
 * // Usage with vanilla JS
 * const element = document.createElement('div');
 * const ref1 = { current: null };
 * const ref2 = (node) => console.log('Node:', node);
 *
 * const merged = mergeRefs([ref1, ref2]);
 * merged(element); // Both refs will be updated with the element
 */
// deno-lint-ignore no-explicit-any
export function mergeRefs<T = any>(
  refs: Array<AnyRef<T>>
): (value: T | null) => void {
  return (value) => {
    refs.forEach((ref) => {
      if (typeof ref === "function") {
        ref(value);
      } else if (ref != null) {
        ref.current = value;
      }
    });
  };
}
