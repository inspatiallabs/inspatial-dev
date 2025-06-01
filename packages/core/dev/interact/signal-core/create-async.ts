import { untrack } from "./core.ts";
import { createEffect } from "./create-effect.ts";
import { createSignal } from "./create-signal.ts";
import { onCleanup } from "./on-cleanup.ts";
import type { AccessorType, MemoOptionsType } from "./types.ts";
import { batch } from "./batch.ts";
import { NotReadyErrorClass } from "./create-resource.ts";

/**
 * # CreateAsync
 * @summary #### Creates a reactive async computation that tracks signal dependencies and handles promise resolution
 *
 * Creates a derived async reactive computation that automatically re-runs when its dependencies change.
 * Unlike regular memos, this handles promise resolution and provides loading/error states.
 *
 * @since 0.1.0
 * @category Interact - (InSpatial Signal Core)
 * @module create-async
 * @kind function
 * @access public
 *
 * ### 💡 Core Concepts
 * - Tracks reactive dependencies in the compute function
 * - Automatically re-runs when dependencies change
 * - Handles Promise resolution and rejection
 * - Supports AsyncIterable streaming data
 * - Provides loading states via NotReadyError
 *
 * ### 🎯 Prerequisites
 * Before you start:
 * - Understanding of reactive signals and effects
 * - Basic knowledge of Promises and async/await
 * - Familiarity with error handling patterns
 *
 * ### 📚 Terminology
 * > **Async Computation**: A computation that returns a Promise or AsyncIterable
 * > **Dependency Tracking**: Automatic detection of which signals the computation reads
 * > **NotReadyError**: Thrown when async computation is still pending
 *
 * @param compute - Function that returns a Promise, AsyncIterable, or sync value
 * @param value - Optional initial value to use before first computation resolves
 * @param options - Optional memo configuration options (Note: options are not fully utilized in this version for simplicity focusing on core async logic)
 *
 * @returns AccessorType<T> - Function that returns the resolved value or throws NotReadyErrorClass
 *
 * @example
 * ### Example 1: Basic Async Data Fetching
 * ```typescript
 * import { createAsync } from "@inspatial/signal-core/create-async.ts";
 * import { createSignal } from "@inspatial/signal-core/create-signal.ts";
 *
 * const [userId, setUserId] = createSignal(1);
 *
 * // Automatically re-fetches when userId changes
 * const user = createAsync(async () => {
 *   const response = await fetch(`/api/users/${userId()}`);
 *   return response.json();
 * });
 *
 * // Usage in effect
 * createEffect(() => {
 *   try {
 *     console.log("User:", user()); // Will throw until Promise resolves
 *   } catch (error) {
 *     if (error instanceof NotReadyError) {
 *       console.log("Loading user...");
 *     }
 *   }
 * });
 * ```
 *
 * @example
 * ### Example 2: Async with Initial Value
 * ```typescript
 * const data = createAsync(
 *   async () => {
 *     await new Promise(resolve => setTimeout(resolve, 1000));
 *     return "loaded data";
 *   },
 *   "initial value" // Available immediately
 * );
 *
 * console.log(data()); // "initial value" (before Promise resolves)
 * ```
 *
 * @throws {NotReadyErrorClass} When async computation is still pending
 * @throws {Error} Any error thrown by the compute function or Promise rejection
 */
export function createAsync<T>(
  compute: (prev?: T) => Promise<T> | AsyncIterable<T> | T,
  value?: T,
  options?: MemoOptionsType<T> // options are passed but not deeply utilized by createMemo inside this version
): AccessorType<T> {
  let hasInitialValue = value !== undefined;
  let isDisposed = false;
  let promiseCount = 0;

  // @ts-expect-error createSignal overloads are too restrictive for an initial value of type T where T could be a function.
  // The underlying ComputationClass can handle functions as initial values when the compute arg is null.
  const [resolvedValue, setResolvedValue] = createSignal<T | undefined>(value);
  const [errorValue, setErrorValue] = createSignal<unknown>(undefined);
  const [isLoading, setIsLoading] = createSignal<boolean>(false);

  const effectExecutor = () => {
    if (isDisposed) return;

    promiseCount++;
    const currentCount = promiseCount;
    const prevValue = untrack(() => resolvedValue()); // Untrack reading previous value

    try {
      const result = compute(prevValue);

      if (
        result &&
        typeof result === "object" &&
        "then" in result &&
        typeof result.then === "function"
      ) {
        const promise = result as Promise<T>;
        batch(() => {
          setIsLoading(true);
          setErrorValue(undefined);
        });

        promise.then(
          (resolved) => {
            if (currentCount === promiseCount && !isDisposed) {
              batch(() => {
                setResolvedValue(() => resolved);
                setIsLoading(false);
                setErrorValue(undefined);
                hasInitialValue = true;
              });
            }
          },
          (error) => {
            if (currentCount === promiseCount && !isDisposed) {
              batch(() => {
                setErrorValue(() => error);
                setIsLoading(false);
              });
            }
          }
        );
      } else if (
        result &&
        typeof result === "object" &&
        Symbol.asyncIterator in result
      ) {
        const iterable = result as AsyncIterable<T>;
        batch(() => {
          setIsLoading(true);
          setErrorValue(undefined);
        });

        (async () => {
          try {
            for await (const iterValue of iterable) {
              if (currentCount === promiseCount && !isDisposed) {
                batch(() => {
                  setResolvedValue(() => iterValue);
                  setIsLoading(false);
                  setErrorValue(undefined);
                  hasInitialValue = true;
                });
              }
            }
          } catch (error) {
            if (currentCount === promiseCount && !isDisposed) {
              batch(() => {
                setErrorValue(() => error);
                setIsLoading(false);
              });
            }
          }
        })();
      } else {
        const syncResult = result as T;
        batch(() => {
          setResolvedValue(() => syncResult);
          setIsLoading(false);
          setErrorValue(undefined);
          hasInitialValue = true;
        });
      }
    } catch (syncError) {
      batch(() => {
        setErrorValue(() => syncError);
        setIsLoading(false);
      });
      throw syncError;
    }
  };

  createEffect(() => {
    effectExecutor();
  });

  onCleanup(() => {
    isDisposed = true;
  });

  return () => {
    const error = errorValue();
    const currentIsLoading = isLoading();
    const currentResolvedValue = resolvedValue();
    // console.log(`[createAsync accessor] isLoading: ${currentIsLoading}, error: ${error}, resolvedValue: ${currentResolvedValue}, hasInitialValue: ${hasInitialValue}`);
    if (error !== undefined) {
      throw error;
    }
    if (currentIsLoading) {
      throw new NotReadyErrorClass();
    }
    if (currentResolvedValue === undefined && !hasInitialValue) {
      throw new NotReadyErrorClass();
    }
    return currentResolvedValue as T;
  };
}
