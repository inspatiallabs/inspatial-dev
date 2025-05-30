import { compute } from "./core.ts";
import { OwnerClass } from "./owner.ts";

/**
 * Creates a new non-tracked reactive context with manual disposal
 *
 * @param fn a function in which the reactive state is scoped
 * @returns the output of `fn`.
 *
 */
export function createRoot<T>(
  init: ((dispose: () => void) => T) | (() => T)
): T {
  const owner = new OwnerClass();
  return compute(
    owner,
    !init.length ? (init as () => T) : () => init(() => owner.dispose()),
    null
  );
}
