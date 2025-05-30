import { compute } from "./core.ts";
import type { OwnerClass } from "./owner.ts";

/**
 * Runs the given function in the given owner to move ownership of nested primitives and cleanups.
 * This method untracks the current scope.
 *
 * Warning: Usually there are simpler ways of modeling a problem that avoid using this function
 */
export function runWithOwner<T>(owner: OwnerClass | null, run: () => T): T {
  return compute(owner, run, null);
}
