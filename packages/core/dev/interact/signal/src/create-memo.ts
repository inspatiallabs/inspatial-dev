import { STATE_DIRTY } from "./core/constants.ts";
import { ComputationClass } from "./core/core.ts";
import {
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

  // Create the computation node with the compute function, initial value, and options
  let node: ComputationClass<Next> | undefined = new ComputationClass<Next>(
    value as any,
    compute as any,
    memoOptions // Pass the options to the ComputationClass constructor
  );

  // Explicitly set the equals function to ensure proper change detection
  if (memoOptions.equals !== undefined) {
    node._equals = memoOptions.equals;
  }

  let resolvedValue: Next;
  return () => {
    if (node) {
      try {
        resolvedValue = node.wait();
        // no sources so will never update so can be disposed.
        // additionally didn't create nested reactivity so can be disposed.
        if (!node._sources?.length && node._nextSibling?._parent !== node) {
          node.dispose();
          node = undefined;
        }
        // not owned and not listened to so can be garbage collected if reference lost.
        else if (!node._parent && !node._observers?.length) {
          node.dispose();
          node._state = STATE_DIRTY;
        }
      } catch (error) {
        // If an error occurs and we have a fallback value, use it
        if (value !== undefined) {
          resolvedValue = value as unknown as Next;
        } else {
          throw error;
        }
      }
    }
    return resolvedValue;
  };
}
