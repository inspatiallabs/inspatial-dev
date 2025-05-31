import { EffectClass } from "./effect.ts";
import type {
  ComputeFunctionType,
  EffectFunctionType,
  EffectOptionsType,
  NoInferType,
} from "./types.ts";

/**
 * Creates a reactive effect that runs after the render phase
 * ```typescript
 * export function createEffect<T>(
 *   compute: (prev: T) => T,
 *   effect: (v: T, prev: T) => (() => void) | void,
 *   value?: T,
 *   options?: { name?: string }
 * ): void;
 * ```
 * @param compute a function that receives its previous or the initial value, if set, and returns a new value used to react on a computation
 * @param effect a function that receives the new value and is used to perform side effects, return a cleanup function to run on disposal
 * @param error an optional function that receives an error if thrown during the computation
 * @param value an optional initial value for the computation; if set, fn will never receive undefined as first argument
 * @param options allows to set a name in dev mode for debugging purposes
 *
 */
export function createEffect<Next>(
  compute: ComputeFunctionType<undefined | NoInferType<Next>, Next>,
  effect?: EffectFunctionType<NoInferType<Next>, Next>,
  error?: (err: unknown) => void
): void;
export function createEffect<Next, Init = Next>(
  compute: ComputeFunctionType<Init | Next, Next>,
  effect?: EffectFunctionType<Next, Next>,
  error?: (err: unknown) => void,
  value?: Init,
  options?: EffectOptionsType
): void;
export function createEffect<Next, Init>(
  compute: ComputeFunctionType<Init | Next, Next>,
  effect?: EffectFunctionType<Next, Next>,
  error?: (err: unknown) => void,
  value?: Init,
  options?: EffectOptionsType
): void {
  // Special handling for signal-like objects (signal, effect) pattern
  if (
    typeof compute === "function" &&
    typeof effect === "function" &&
    typeof (compute as any).read !== "function" &&
    arguments.length === 2
  ) {
    // This is the case where compute is a signal/getter and effect is the handler
    const signalGetter = compute;
    const handler = effect;

    // Create an effect that reads the signal and calls the handler
    const effectFn = (prev: any) => {
      // We need to track reads to signal to ensure reactivity works correctly
      // By reading the signal directly, we subscribe to changes
      const value = (signalGetter as Function)();
      // Return the value to be passed to the handler
      return value;
    };

    // Now create the real effect using our fixed EffectClass
    void new EffectClass(
      value as any,
      effectFn as any,
      handler,
      undefined,
      __DEV__ ? { ...options, name: options?.name ?? "effect" } : options
    );
    return;
  }

  // Handle the case where only compute function is provided
  const effectHandler = effect === undefined ? () => {} : effect;

  // Create the effect instance using our fixed EffectClass
  void new EffectClass(
    value as any,
    compute as any,
    effectHandler,
    error,
    __DEV__ ? { ...options, name: options?.name ?? "effect" } : options
  );
}
