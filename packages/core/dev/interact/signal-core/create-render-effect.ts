import { EffectClass } from "./effect.ts";
import type {
  ComputeFunctionType,
  EffectFunctionType,
  EffectOptionsType,
  NoInferType,
} from "./types.ts";

/**
 * Creates a reactive computation that runs during the render phase as DOM elements are created and updated but not necessarily connected
 * ```typescript
 * export function createRenderEffect<T>(
 *   compute: (prev: T) => T,
 *   effect: (v: T, prev: T) => (() => void) | void,
 *   value?: T,
 *   options?: { name?: string }
 * ): void;
 * ```
 * @param compute a function that receives its previous or the initial value, if set, and returns a new value used to react on a computation
 * @param effect a function that receives the new value and is used to perform side effects
 * @param value an optional initial value for the computation; if set, fn will never receive undefined as first argument
 * @param options allows to set a name in dev mode for debugging purposes
 *
 */
export function createRenderEffect<Next>(
  compute: ComputeFunctionType<undefined | NoInferType<Next>, Next>,
  effect: EffectFunctionType<NoInferType<Next>, Next>
): void;
export function createRenderEffect<Next, Init = Next>(
  compute: ComputeFunctionType<Init | Next, Next>,
  effect: EffectFunctionType<Next, Next>,
  value: Init,
  options?: EffectOptionsType
): void;
export function createRenderEffect<Next, Init>(
  compute: ComputeFunctionType<Init | Next, Next>,
  effect: EffectFunctionType<Next, Next>,
  value?: Init,
  options?: EffectOptionsType
): void {
  void new EffectClass(value as any, compute as any, effect, undefined, {
    render: true,
    ...(__DEV__ ? { ...options, name: options?.name ?? "effect" } : options),
  });
}
