import { ComputationClass, getObserver } from "./core.ts";
import { NotReadyErrorClass } from "./error.ts";
import { onCleanup } from "./owner.ts";
import { flushSync } from "./scheduler.ts";
import type { AccessorType, MemoOptionsType } from "./types.ts";

/**
 * Creates a readonly derived async reactive memoized signal
 * ```typescript
 * export function createAsync<T>(
 *   compute: (v: T) => Promise<T> | T,
 *   value?: T,
 *   options?: { name?: string, equals?: false | ((prev: T, next: T) => boolean) }
 * ): () => T;
 * ```
 * @param compute a function that receives its previous or the initial value, if set, and returns a new value used to react on a computation
 * @param value an optional initial value for the computation; if set, fn will never receive undefined as first argument
 * @param options allows to set a name in dev mode for debugging purposes and use a custom comparison function in equals
 *
 */
export function createAsync<T>(
  compute: (prev?: T) => Promise<T> | AsyncIterable<T> | T,
  value?: T,
  options?: MemoOptionsType<T>
): AccessorType<T> {
  // Simple state management
  let currentValue: T | undefined = value;
  let isResolved = value !== undefined;
  let currentError: unknown = undefined;
  let isLoading = false;

  // Create a simple signal to manage reactivity with compatible options
  const signalOptions = options
    ? {
        name: options.name,
        equals: options.equals
          ? (prev: T | undefined, next: T | undefined) => {
              if (prev === undefined || next === undefined) return false;
              return (options.equals as (prev: T, next: T) => boolean)(
                prev,
                next
              );
            }
          : options.equals,
      }
    : undefined;

  const reactiveSignal = new ComputationClass<T | undefined>(
    value,
    null, // No compute function - we'll manually trigger updates
    signalOptions
  );

  // Track the current computation for proper cleanup
  let currentPromise: Promise<T> | undefined = undefined;
  let isDisposed = false;

  onCleanup(() => {
    isDisposed = true;
  });

  // Function to execute the async computation
  const executeAsync = (prevValue?: T) => {
    if (isDisposed) return;

    try {
      const result = compute(prevValue);

      // Handle Promise results
      if (
        result &&
        typeof result === "object" &&
        "then" in result &&
        typeof result.then === "function"
      ) {
        const promise = result as Promise<T>;
        currentPromise = promise;
        isLoading = true;
        currentError = undefined;

        promise.then(
          (resolvedValue) => {
            // Only update if this is still the current promise and not disposed
            if (currentPromise === promise && !isDisposed) {
              currentValue = resolvedValue;
              isResolved = true;
              isLoading = false;
              currentError = undefined;
              currentPromise = undefined;

              // Trigger reactive update
              reactiveSignal.write(resolvedValue);

              // Flush effects immediately
              flushSync();
            }
          },
          (error) => {
            // Only update if this is still the current promise and not disposed
            if (currentPromise === promise && !isDisposed) {
              currentError = error;
              isResolved = false;
              isLoading = false;
              currentPromise = undefined;

              // Trigger reactive update even on error
              reactiveSignal.write(undefined);

              // Flush effects immediately
              flushSync();
            }
          }
        );
      } else if (
        result &&
        typeof result === "object" &&
        Symbol.asyncIterator in result
      ) {
        // Handle AsyncIterable results
        const iterable = result as AsyncIterable<T>;
        isLoading = true;
        currentError = undefined;

        (async () => {
          try {
            for await (const iterValue of iterable) {
              if (isDisposed) return;

              currentValue = iterValue;
              isResolved = true;
              isLoading = false;
              currentError = undefined;

              // Trigger reactive update
              reactiveSignal.write(iterValue);

              // Flush effects immediately
              flushSync();
            }
          } catch (error: unknown) {
            if (!isDisposed) {
              currentError = error;
              isResolved = false;
              isLoading = false;

              // Trigger reactive update even on error
              reactiveSignal.write(undefined);

              // Flush effects immediately
              flushSync();
            }
          }
        })();
      } else {
        // Handle synchronous results
        currentValue = result as T;
        isResolved = true;
        isLoading = false;
        currentError = undefined;
        currentPromise = undefined;

        // Trigger reactive update
        reactiveSignal.write(result as T);
      }
    } catch (syncError: unknown) {
      currentError = syncError;
      isResolved = false;
      isLoading = false;
      currentPromise = undefined;

      // Don't throw here, just mark as error state
      // The error will be thrown when accessed
    }
  };

  // Execute the async computation initially
  executeAsync();

  // Return the accessor function
  return () => {
    // First, establish reactive dependency by reading from the signal
    const observer = getObserver();
    if (observer) {
      // This establishes the reactive dependency
      reactiveSignal.read();
    }

    // Check for errors
    if (currentError) {
      throw currentError;
    }

    // If we're being tracked and not resolved, throw NotReadyError
    if (!isResolved && observer) {
      throw new NotReadyErrorClass();
    }

    // Return the current resolved value
    return currentValue as T;
  };
}
