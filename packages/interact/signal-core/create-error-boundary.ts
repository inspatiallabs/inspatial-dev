import { ComputationClass, compute, EagerComputationClass } from "./core.ts";
import { OwnerClass } from "./owner.ts";
import { onCleanup } from "./on-cleanup.ts";
import type { AccessorType } from "./types.ts";

/**
 * # createErrorBoundary
 * @summary #### Creates an error boundary for reactive computations
 *
 * Provides error boundary functionality for reactive computations. Think of this
 * like a safety net under a circus trapeze act - it catches errors from child
 * computations and lets you display fallback UIs while keeping the rest of the
 * application stable.
 *
 * @since 0.1.0
 * @category Interact - (InSpatial Signal Core)
 * @module ErrorBoundary
 * @kind function
 * @access public
 *
 * ### 💡 Core Concepts
 * - Catches errors in child component trees
 * - Provides fallback UI rendering
 * - Allows error recovery through reset functionality
 * - Maintains reactive context integrity
 *
 * ### 🎯 Prerequisites
 * Before using:
 * - Understand basic error handling in JavaScript
 * - Familiarity with reactive computations
 * - Knowledge of component lifecycle
 *
 * ### 📚 Terminology
 * > **Error Boundary**: A component that catches JavaScript errors in its child tree
 * > **Fallback UI**: Alternative content shown when errors occur
 * > **Reset Function**: Mechanism to attempt error recovery
 *
 * ### ⚠️ Important Notes
 * <details>
 * <summary>Click to learn about edge cases</summary>
 *
 * > [!NOTE]
 * > Only catches errors in child components - won't catch errors in itself
 *
 * > [!NOTE]
 * > Errors in async code need explicit error boundaries
 *
 * > [!NOTE]
 * > Multiple boundaries form a safety net hierarchy
 * </details>
 *
 * @param fn - Function containing child computations to monitor
 * @param fallback - Function that renders fallback UI when errors occur
 *
 * @returns Accessor function returning either the original value or fallback UI
 *
 * ### 🎮 Usage
 * #### Installation
 * ```bash
 * deno add jsr:@in/teract
 * ```
 *
 * #### Examples
 * @example
 * ### Example 1: Basic Error Boundary
 * ```typescript
 * const [data] = createSignal<Record<string, any>>();
 *
 * const SafeComponent = createErrorBoundary(
 *   () => {
 *     // This computation might throw
 *     const value = data();
 *     if (!value) throw new Error("No data available");
 *     return renderComponent(value);
 *   },
 *   (error, reset) => (
 *     <div class="error-fallback">
 *       <h2>{error.message}</h2>
 *       <button onclick={reset}>Retry</button>
 *     </div>
 *   )
 * );
 *
 * // Usage
 * createEffect(() => {
 *   const result = SafeComponent();
 *   document.getElementById("app").innerHTML = result;
 * });
 * ```
 *
 * @example
 * ### Example 2: Nested Boundaries
 * ```typescript
 * const App = createErrorBoundary(
 *   () => {
 *     const userData = createErrorBoundary(
 *       () => fetchUserData(),
 *       (err, reset) => <UserErrorFallback reset={reset} />
 *     );
 *
 *     return (
 *       <div>
 *         <Header />
 *         {userData()}
 *       </div>
 *     );
 *   },
 *   (error) => <CriticalError message={error.message} />
 * );
 * ```
 *
 * ### ⚡ Performance Tips
 * <details>
 * <summary>Click to learn about performance</summary>
 *
 * - Place boundaries at strategic component tree levels
 * - Use reset functions instead of full app reloads
 * - Keep fallback UIs lightweight
 * </details>
 *
 * ### ❌ Common Mistakes
 * <details>
 * <summary>Click to see what to avoid</summary>
 *
 * - Putting boundaries around error-prone non-child code
 * - Forgetting to handle async errors
 * - Not providing reset functionality
 * - Making fallback UIs that can throw errors
 * </details>
 *
 * @throws {Error} Propagates errors uncaught by fallback handler
 *
 * ### 📝 Uncommon Knowledge
 * Error boundaries work like catch{} blocks for reactive computations -
 * they only catch errors in their child components, not in siblings or parents.
 * This allows building layered safety nets similar to try/catch nesting.
 *
 * ### 🔧 Runtime Support
 * - ✅ Node.js
 * - ✅ Deno
 * - ✅ Bun
 *
 * ### 🔗 Related Resources
 * - {@link createEffect} - For reactive side effects
 * - {@link createMemo} - For computed values
 * - {@link createStore} - For complex state management
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
  const result: AccessorType<T | U> = () => {
    try {
      // Get the inner computation and wait on it
      const inner = f.wait();
      if (inner) {
        return inner.wait();
      }
      // If there's no inner computation but we have a fallback error handler,
      // return the fallback
      const err = error.read();
      if (err) {
        return fallback(err._error, () => error.write(undefined));
      }
      // Return undefined as T | U (this is safe because it can be part of either type)
      return undefined as T | U;
    } catch (err) {
      // If an error occurs during wait, call the fallback with the error
      return fallback(err, () => error.write(undefined));
    }
  };
  return result;
}
