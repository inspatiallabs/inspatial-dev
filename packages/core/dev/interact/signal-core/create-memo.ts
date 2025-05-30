import { STATE_DIRTY } from "./constants.ts";
import {
  ComputationClass,
  compute as executeComputation,
} from "./core.ts";
import type {
  AccessorType,
  ComputeFunctionType,
  MemoOptionsType,
  NoInferType,
} from "./types.ts";

/**
 * Creates a readonly derived reactive memoized signal
 * ```typescript
 * export function createMemo<T>(
 *   compute: (v: T) => T,
 *   value?: T,
 *   options?: { name?: string, equals?: false | ((prev: T, next: T) => boolean) }
 * ): () => T;
 * ```
 * @param compute a function that receives its previous or the initial value, if set, and returns a new value used to react on a computation
 * @param value an optional initial value for the computation; if set, fn will never receive undefined as first argument
 * @param options allows to set a name in dev mode for debugging purposes and use a custom comparison function in equals
 *
 */
// The extra Prev generic parameter separates inference of the compute input
// parameter type from inference of the compute return type, so that the effect

// return type is always used as the memo Accessor's return type.
export function createMemo<Next extends Prev, Prev = Next>(
  compute: ComputeFunctionType<undefined | NoInferType<Prev>, Next>
): AccessorType<Next>;
export function createMemo<Next extends Prev, Init = Next, Prev = Next>(
  compute: ComputeFunctionType<Init | Prev, Next>,
  value: Init,
  options?: MemoOptionsType<Next>
): AccessorType<Next>;
export function createMemo<Next extends Prev, Init, Prev>(
  compute: ComputeFunctionType<Init | Prev, Next>,
  value?: Init,
  options?: MemoOptionsType<Next>
): AccessorType<Next> {
  // Ensure options object exists to avoid null checks
  const memoOptions = options || {};

  // CRITICAL FIX: Create the computation node that will reactively recompute
  const node = new ComputationClass<Next>(
    value as any,
    compute as any, // Pass the user's compute function directly
    memoOptions
  );

  if (false && __DEV__) {
    console.log(
      `[CREATE_MEMO] Created memo with _compute: ${!!node._compute}, name: ${
        node._name
      }`
    );
  }

  // Explicitly set the equals function to ensure proper change detection
  if (memoOptions.equals !== undefined) {
    node._equals = memoOptions.equals;
  }

  // Return the memo accessor
  return () => {
    // Use read() for proper reactive dependency tracking
    const result = node.read();
    if (false && __DEV__) {
      console.log(
        `[MEMO READ] Memo read returned: ${result}, node._value: ${node._value}, node._state: ${node._state}`
      );
    }
    return result;
  };
}
