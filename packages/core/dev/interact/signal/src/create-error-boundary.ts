import { ComputationClass, compute } from "./core/core.ts";
import { EagerComputationClass } from "./core/effect.ts";
import { onCleanup, OwnerClass } from "./core/owner.ts";
import type { AccessorType } from "./types.ts";

/**
 * Switches to fallback whenever an error is thrown within the context of the child scopes
 * @param fn boundary for the error
 * @param fallback an error handler that receives the error
 *
 * * If the error is thrown again inside the error handler, it will trigger the next available parent handler
 *
 */
export function createErrorBoundary<T, U>(
  fn: () => T,
  fallback: (error: unknown, reset: () => void) => U
): AccessorType<T | U> {
  const owner = new OwnerClass();
  const error = new ComputationClass<{ _error: any } | undefined>(
    undefined,
    null
  );
  const nodes = new Set<OwnerClass>();
  function handler(err: unknown, node: OwnerClass) {
    if (nodes.has(node)) return;
    compute(
      node,
      () =>
        onCleanup(() => {
          nodes.delete(node);
          if (!nodes.size) error.write(undefined);
        }),
      null
    );
    nodes.add(node);
    if (nodes.size === 1) error.write({ _error: err });
  }

  owner._handlers = [handler];
  const c = new ComputationClass<ComputationClass<T>>(undefined, () => {
    owner.dispose(false);
    owner.emptyDisposal();
    const result = compute(owner, fn, owner as any);
    return new ComputationClass<T>(result, null);
  });
  const f = new EagerComputationClass<ComputationClass<U>>(
    undefined,
    () => {
      const err = error.read();
      if (!err) return c as any;
      const reset = () => error.write(undefined);
      const result = fallback(err._error, reset);
      return new ComputationClass<U>(result, null);
    },
    {}
  );
  return () => {
    try {
      // Get the inner computation and wait on it
      const inner = f.wait();
      if (inner) {
        return inner.wait();
      }
      // If there's no inner computation but we have a fallback error handler,
      // just return undefined to avoid further errors
      return undefined;
    } catch (err) {
      // If an error occurs during wait, call the fallback with the error
      return fallback(err, () => error.write(undefined));
    }
  };
}
