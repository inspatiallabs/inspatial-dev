import { ComputationClass, getObserver, untrack } from "./core.ts";
import { NotReadyErrorClass } from "./error.ts";
import { createEffect } from "./create-effect.ts";
import { createRenderEffect } from "./create-render-effect.ts";
import { createSignal } from "./create-signal.ts";
import { createRoot } from "./create-root.ts";
import { onCleanup } from "./owner.ts";
import type { AccessorType, MemoOptionsType } from "./types.ts";
import { createMemo } from "./create-memo.ts";

/**
 * # CreateAsync
 * @summary #### Creates a reactive async computation that tracks signal dependencies and handles promise resolution
 * 
 * Creates a derived async reactive computation that automatically re-runs when its dependencies change.
 * Unlike regular memos, this handles promise resolution and provides loading/error states.
 * 
 * @since 0.2.0
 * @category InSpatial Signal Core  
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
 * @param options - Optional memo configuration options
 * 
 * @returns AccessorType<T> - Function that returns the resolved value or throws NotReadyError
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
  options?: MemoOptionsType<T>
): AccessorType<T> {
  // Track whether we have an initial value
  let hasInitialValue = value !== undefined;
  let isDisposed = false;
  let promiseCount = 0;
  let lastDepsHash: string | undefined;
  
  // Create signals for managing async state
  const [resolvedValue, setResolvedValue] = createSignal<T | undefined>(value as any);
  const [errorValue, setErrorValue] = createSignal<unknown>(undefined);
  const [isLoading, setIsLoading] = createSignal<boolean>(false);
  
  // Use an effect to run the compute function eagerly
  createEffect(() => {
    if (isDisposed) return;
    
    promiseCount++;
    const currentCount = promiseCount;
    const prevValue = resolvedValue();
    
    try {
      // Run the compute function - this will automatically track dependencies
      const result = compute(prevValue);
      
      if (result && typeof result === 'object' && 'then' in result && typeof result.then === 'function') {
        // Handle Promise
        const promise = result as Promise<T>;
        
        // Set loading state
        untrack(() => {
          setIsLoading(true);
          setErrorValue(undefined);
        });
        
        // Handle promise resolution
        promise.then(
          (resolved) => {
            if (currentCount === promiseCount && !isDisposed) {
              untrack(() => {
                setResolvedValue(() => resolved);
                setIsLoading(false);
                setErrorValue(undefined);
                hasInitialValue = true;
              });
            }
          },
          (error) => {
            if (currentCount === promiseCount && !isDisposed) {
              untrack(() => {
                setErrorValue(() => error);
                setIsLoading(false);
              });
            }
          }
        );
        
      } else if (result && typeof result === 'object' && Symbol.asyncIterator in result) {
        // Handle AsyncIterable
        const iterable = result as AsyncIterable<T>;
        
        untrack(() => {
          setIsLoading(true);
          setErrorValue(undefined);
        });
        
        (async () => {
          try {
            for await (const iterValue of iterable) {
              if (currentCount === promiseCount && !isDisposed) {
                untrack(() => {
                  setResolvedValue(() => iterValue);
                  setIsLoading(false);
                  setErrorValue(undefined);
                  hasInitialValue = true;
                });
              }
            }
          } catch (error) {
            if (currentCount === promiseCount && !isDisposed) {
              untrack(() => {
                setErrorValue(() => error);
                setIsLoading(false);
              });
            }
          }
        })();
        
      } else {
        // Handle synchronous result
        const syncResult = result as T;
        untrack(() => {
          setResolvedValue(() => syncResult);
          setIsLoading(false);
          setErrorValue(undefined);
          hasInitialValue = true;
        });
      }
    } catch (syncError) {
      // Handle synchronous errors
      untrack(() => {
        setErrorValue(() => syncError);
        setIsLoading(false);
      });
      
      throw syncError;
    }
  });
  
  // Set up cleanup
  onCleanup(() => {
    isDisposed = true;
  });
  
  // Return the accessor function
  return () => {
    // Check for errors first
    const error = errorValue();
    if (error !== undefined) {
      throw error;
    }
    
    // Check if we're loading
    if (isLoading()) {
      throw new NotReadyErrorClass();
    }
    
    // Return resolved value
    const resolved = resolvedValue();
    if (resolved === undefined && !hasInitialValue) {
      throw new NotReadyErrorClass();
    }
    
    return resolved as T;
  };
}
