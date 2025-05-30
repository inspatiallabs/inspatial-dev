import { STATE_DIRTY } from "./core/constants.ts";
import { ComputationClass, UNCHANGED } from "./core/core.ts";
import { EagerComputationClass } from "./core/effect.ts";
import { NotReadyErrorClass } from "./core/error.ts";
import { ERROR_BIT, LOADING_BIT, UNINITIALIZED_BIT } from "./core/flags.ts";
import { onCleanup } from "./core/owner.ts";
import { getClock } from "./core/scheduler.ts";
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
  let uninitialized = value === undefined;
  const lhs = new EagerComputationClass(
    {
      _value: value,
    } as any,
    (p?: ComputationClass<T>) => {
      const value = p?._value;
      const source = compute(value);
      const isPromise = source instanceof Promise;
      const iterator =
        typeof source === "object" &&
        source !== null &&
        (source as any)[Symbol.asyncIterator];
      if (!isPromise && !iterator) {
        // Return a proper ComputationClass instance instead of a simple object
        return new ComputationClass(source as T, null, options);
      }
      const signal = new ComputationClass(value, null, options);
      const w = signal.wait;
      signal.wait = function () {
        if (signal._stateFlags & ERROR_BIT && signal._time <= getClock()) {
          lhs._notify(STATE_DIRTY);
          throw new NotReadyErrorClass();
        }
        return w.call(this);
      };
      signal.write(
        UNCHANGED,
        LOADING_BIT | (uninitialized ? UNINITIALIZED_BIT : 0)
      );
      if (isPromise) {
        source.then(
          (value) => {
            uninitialized = false;
            signal.write(value, 0, true);
          },
          (error) => {
            uninitialized = true;
            signal._setError(error);
          }
        );
      } else {
        let abort = false;
        onCleanup(() => (abort = true));
        (async () => {
          try {
            for await (let value of source as AsyncIterable<T>) {
              if (abort) return;
              signal.write(value, 0, true);
            }
          } catch (error: any) {
            signal.write(error, ERROR_BIT);
          }
        })();
      }
      return signal;
    }
  );
  return () => lhs.wait().wait();
}
