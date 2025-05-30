import type { SignalOptionsType } from "./core/index.ts";
import { ComputationClass, untrack } from "./core/index.ts";

import type { ComputeFunctionType, SetterType, SignalType } from "./types.ts";
import { createMemo } from "./create-memo.ts";

/**
 * Creates a simple reactive state with a getter and setter
 * ```typescript
 * const [state: AccessorType<T>, setState: SetterType<T>] = createSignal<T>(
 *  value: T,
 *  options?: { name?: string, equals?: false | ((prev: T, next: T) => boolean) }
 * )
 * ```
 * @param value initial value of the state; if empty, the state's type will automatically extended with undefined; otherwise you need to extend the type manually if you want setting to undefined not be an error
 * @param options optional object with a name for debugging purposes and equals, a comparator function for the previous and next value to allow fine-grained control over the reactivity
 *
 * @returns ```typescript
 * [state: AccessorType<T>, setState: SetterType<T>]
 * ```
 * * the Accessor is a function that returns the current value and registers each call to the reactive root
 * * the Setter is a function that allows directly setting or mutating the value:
 * ```typescript
 * const [count, setCount] = createSignal(0);
 * setCount(count => count + 1);
 * ```
 *
 */
export function createSignal<T>(): SignalType<T | undefined>;
export function createSignal<T>(
  value: Exclude<T, Function>,
  options?: SignalOptionsType<T>
): SignalType<T>;
export function createSignal<T>(
  fn: ComputeFunctionType<T>,
  initialValue?: T,
  options?: SignalOptionsType<T>
): SignalType<T>;
export function createSignal<T>(
  first?: T | ComputeFunctionType<T>,
  second?: T | SignalOptionsType<T>,
  third?: SignalOptionsType<T>
): SignalType<T | undefined> {
  if (typeof first === "function") {
    const memo = createMemo<SignalType<T>>((p) => {
      const node = new ComputationClass<T>(
        (first as (prev?: T) => T)(p ? untrack(p[0]) : (second as T)),
        null,
        third
      );
      const getter = node.read.bind(node);
      const setter = node.write.bind(node) as SetterType<T>;

      // Expose value property for interop with store
      Object.defineProperty(getter, "value", {
        get: () => node._value,
        enumerable: true,
        configurable: true,
      });

      return [getter, setter];
    });

    // Create the outer signal accessor and setter
    const outerGetter = () => memo()[0]();
    const outerSetter = ((value) => memo()[1](value)) as SetterType<
      T | undefined
    >;

    // Make value property available on the getter for external access
    Object.defineProperty(outerGetter, "value", {
      get: () => untrack(outerGetter),
      enumerable: true,
      configurable: true,
    });

    return [outerGetter, outerSetter];
  }

  const node = new ComputationClass(
    first,
    null,
    second as SignalOptionsType<T>
  );

  // Create main getter and setter functions
  const getter = node.read.bind(node);
  const setter = node.write.bind(node) as SetterType<T | undefined>;

  // Make the getter function have a "value" property for direct access
  Object.defineProperty(getter, "value", {
    get: () => node._value,
    enumerable: true,
    configurable: true,
  });

  return [getter, setter];
}
