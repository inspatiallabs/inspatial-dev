/**
 * @module @in/teract/signal-lite
 *
 * A lightweight interactive alternative to InSpatials Core Signal/State module that lets you quickly create and manage reactive state without the overhead of the full module system which comes bundled with features like triggers, stateQL and others.
 * This module provides signals - special objects that notify subscribers when their values change.
 *
 * @example Basic Usage
 * ```typescript
 * import { createSignal, computed } from "@in/teract/signal-lite";
 *
 * // Create a signal with initial value
 * const count = createSignal(0);
 *
 * // Create a computed signal that depends on count
 * const doubled = computed(() => count.value * 2);
 *
 * console.log(count.value); // 0
 * console.log(doubled.value); // 0
 *
 * // Update count - doubled automatically updates too!
 * count.value = 5;
 * console.log(doubled.value); // 10
 * ```
 *
 * @features
 * - Zero dependencies: Standalone reactive primitives
 * - Fine-grained reactivity: Only re-compute what's needed
 * - Automatic dependency tracking: No explicit subscription management
 * - Efficient batched updates: Changes are processed in microtasks
 * - Rich operators: Comparison, logical operations, and more
 * - Async-friendly: Signals work seamlessly with promises
 * - Small footprint: Minimal memory and bundle size impact
 * - TypeScript support: Full generic type safety
 *
 * @see {@link Signal} - The core reactive container
 * @see {@link createSignal} - Function to create signals
 * @see {@link computed} - Creates derived reactive values
 */

import { _internals } from "./helpers.ts";

/*##########################################(TYPES)##########################################*/
// Define core types
/** A function that can be used as an effect, potentially with a _pure flag */
type EffectFunctionType = ((...args: any[]) => void) & { _pure?: boolean };

/** A function that disposes resources, optionally in batch mode */
type DisposerFunctionType = (batch?: boolean) => void;

/** An array of effect functions that also carries an _id property */
type EffectArrayType = EffectFunctionType[] & { _id?: number };

/** The internal structure of a Signal instance */
interface SignalInternal<T = any> {
  id: number;
  value: T;
  compute?: (val: any) => any;
  disposeCtx: DisposerFunctionType[] | null;
  userEffects: EffectArrayType;
  signalEffects: EffectArrayType;
}

/*##########################################(SIGNAL-)##########################################*/

export const removeFromArr = <T>(arr: T[], val: T): void => {
  const index = arr.indexOf(val);
  if (index > -1) {
    arr.splice(index, 1);
  }
};

let sigID = 0;
let ticking = false;
let currentEffect: EffectFunctionType | null = null;
let currentDisposers: DisposerFunctionType[] | null = null;
let resolveCurrentTick: ((value: unknown) => void) | null = null;
let currentTick: Promise<void> | null = null;

let signalQueue = new Set<EffectArrayType>();
let effectQueue = new Set<EffectArrayType>();
let runQueue = new Set<() => void>();

// Scheduler part

const scheduleSignal = (signalEffects: EffectArrayType): void => {
  signalQueue.add(signalEffects);
};

const scheduleEffect = (effects: EffectArrayType): void => {
  effectQueue.add(effects);
};

const flushRunQueue = (): void => {
  for (const i of runQueue) i();
  runQueue.clear();
};

const flushQueue = (queue: Set<EffectArrayType>, sorted: boolean): void => {
  while (queue.size) {
    const queueArr = Array.from(queue);
    queue.clear();

    if (sorted && queueArr.length > 1) {
      queueArr.sort((a, b) => (a._id ?? 0) - (b._id ?? 0));
      for (const effects of queueArr) {
        for (const i of effects) {
          runQueue.delete(i);
          runQueue.add(i);
        }
      }
    } else if (queueArr.length > 10000) {
      let flattenedArr: EffectFunctionType[] = [];
      for (let i = 0; i < queueArr.length; i += 10000) {
        flattenedArr = flattenedArr.concat(...queueArr.slice(i, i + 10000));
      }
      runQueue = new Set(flattenedArr);
    } else {
      const allEffects = queueArr.flat() as EffectFunctionType[];
      runQueue = new Set(allEffects);
    }
    flushRunQueue();
  }
};

const tick = (): Promise<void> => {
  if (!ticking) {
    ticking = true;
    if (resolveCurrentTick) resolveCurrentTick(undefined);
  }
  return currentTick ?? Promise.resolve();
};

/**
 * 
 * @param cb  `nextTick(callback, ...args)`
Waits for the next tick and executes a callback after all pending signal updates and effects have been processed. Returns a Promise that resolves after the callback completes.

- `callback`: Function to execute after the tick completes
- `...args`: Optional arguments to pass to the callback function
- Returns: Promise that resolves after the callback executes

This is essential when you need to access updated computed signal values after making changes, since signal effects are processed asynchronously.

```typescript
const count = createSignal(0)
const doubled = computed(() => count.value * 2)

count.value = 5

// Without nextTick - might still see old value
console.log(doubled.value) // Could be 0 (old value)

// With nextTick - guaranteed to see updated value
nextTick(() => {
	console.log(doubled.value) // Will be 10 (updated value)
})

// With additional arguments
const logValue = (prefix: string, signal: Signal<number>) => {
	console.log(prefix, signal.value)
}

  nextTick(logValue, 'Doubled:', doubled)

// Can also be used with async/await
await nextTick(() => {
	console.log('All updates processed')
})
```
 * @returns 
 */
const nextTick = <T>(cb: (value?: unknown) => T): Promise<T> =>
  tick().then(() => cb());

const flushQueues = (): Promise<void> | void => {
  if (signalQueue.size || effectQueue.size) {
    flushQueue(signalQueue, true);
    signalQueue = new Set<EffectArrayType>(signalQueue);
    flushQueue(effectQueue, true);
    effectQueue = new Set<EffectArrayType>(effectQueue);
    return Promise.resolve().then(flushQueues);
  }
};

const resetTick = (): void => {
  ticking = false;
  currentTick = new Promise<void>((resolve) => {
    resolveCurrentTick = resolve as (value: unknown) => void;
  }).then(flushQueues);
  if (currentTick) {
    currentTick.finally(resetTick);
  }
};

// Signal part

const pure = <T extends EffectFunctionType>(cb: T): T => {
  cb._pure = true;
  return cb;
};

const isPure = (cb: EffectFunctionType): boolean => !!cb._pure;

const createDisposer = (
  disposers: DisposerFunctionType[],
  prevDisposers: DisposerFunctionType[] | null,
  dispose?: DisposerFunctionType
): DisposerFunctionType => {
  let _dispose: DisposerFunctionType = (batch?: boolean) => {
    for (const i of disposers) i(!!batch);
    disposers.length = 0;
  };

  if (dispose) {
    const __dispose = _dispose;
    _dispose = (batch?: boolean) => {
      dispose(batch);
      __dispose(batch);
    };
  }

  if (prevDisposers) {
    const __dispose = _dispose;
    _dispose = (batch?: boolean) => {
      if (!batch) removeFromArr(prevDisposers, _dispose);
      __dispose(batch);
    };
    prevDisposers.push(_dispose);
  }

  return _dispose;
};

const collectDisposers = (
  disposers: DisposerFunctionType[],
  fn: () => void,
  dispose?: DisposerFunctionType
): DisposerFunctionType => {
  const prevDisposers = currentDisposers;
  const _dispose = createDisposer(disposers, prevDisposers, dispose);
  currentDisposers = disposers;
  fn();
  currentDisposers = prevDisposers;
  return _dispose;
};

const _onDispose = (cb: DisposerFunctionType): DisposerFunctionType => {
  const disposers = currentDisposers;
  if (!disposers) {
    throw new Error("No disposers in current context");
  }

  const dispose: DisposerFunctionType = (batch?: boolean) => {
    if (!batch && disposers) removeFromArr(disposers, dispose);
    cb(batch);
  };

  disposers.push(dispose);
  return dispose;
};

/**
 * # onDispose
 * @summary #### Registers a cleanup function for when the current effect is disposed
 *
 * The `onDispose` function registers a callback that will run when the current
 * reactive context is cleaned up. This is essential for managing resources and
 * preventing memory leaks.
 *
 * @since 0.1.0
 * @category InSpatial Dev
 * @module interact/signal-
 * @kind function
 * @access public
 *
 * @param {DisposerFunctionType} cb - The cleanup function to run on disposal
 *
 * @example
 * ### Example: Cleaning Up Event Listeners
 * ```typescript
 * import { createSignal, watch, onDispose } from "@in/teract/signal-lite";
 *
 * const isActive = createSignal(true);
 *
 * // This effect will set up and clean up event listeners
 * watch(() => {
 *   if (isActive.value) {
 *     // Set up a DOM event listener
 *     const handleClick = () => console.log('Clicked!');
 *     document.addEventListener('click', handleClick);
 *
 *     // Clean it up when the effect reruns or is disposed
 *     onDispose(() => {
 *       console.log('Removing event listener');
 *       document.removeEventListener('click', handleClick);
 *     });
 *   }
 * });
 *
 * // When isActive changes, the cleanup function runs automatically
 * isActive.value = false;
 * // Output: Removing event listener
 * ```
 *
 * @example
 * ### Example: Managing Timers
 * ```typescript
 * import { createSignal, watch, onDispose } from "@in/teract/signal-lite";
 *
 * const interval = createSignal(1000);
 *
 * watch(() => {
 *   const delay = interval.value;
 *   console.log(`Setting up timer with interval: ${delay}ms`);
 *
 *   const timerId = setInterval(() => {
 *     console.log('Timer tick');
 *   }, delay);
 *
 *   onDispose(() => {
 *     console.log('Clearing timer');
 *     clearInterval(timerId);
 *   });
 * });
 *
 * // Changing the interval will clean up the old timer and create a new one
 * interval.value = 2000;
 * // Output:
 * // Clearing timer
 * // Setting up timer with interval: 2000ms
 * ```
 *
 * @returns {DisposerFunctionType | undefined}
 * The disposer function, which can be called manually to run the cleanup.
 */
const onDispose = (
  cb: DisposerFunctionType
): DisposerFunctionType | undefined => {
  if (!currentDisposers) {
    if (typeof console !== "undefined") {
      console.warn("onDispose called outside of a reactive context");
    }
    return undefined;
  }

  // Create a disposal function that removes itself from the disposers list
  const dispose: DisposerFunctionType = (batch?: boolean) => {
    // If not in batch mode, remove this disposer from the list
    if (!batch && currentDisposers) {
      const index = currentDisposers.indexOf(dispose);
      if (index > -1) {
        currentDisposers.splice(index, 1);
      }
    }

    // Execute the callback
    cb(batch);
  };

  // Add the dispose function to the current disposers
  currentDisposers.push(dispose);
  return dispose;
};

const useEffect = (effect: () => DisposerFunctionType): void => {
  onDispose(effect());
};

function _frozen(
  this: Function,
  capturedDisposers: DisposerFunctionType[] | null,
  capturedEffects: EffectFunctionType | null,
  ...args: any[]
): any {
  const prevDisposers = currentDisposers;
  const prevEffect = currentEffect;

  currentDisposers = capturedDisposers;
  currentEffect = capturedEffects;

  try {
    return this(...args);
  } finally {
    currentDisposers = prevDisposers;
    currentEffect = prevEffect;
  }
}

/**
 * 
 * @param fn #### `freeze(fn)`
Freezes the current effect context for a function.

```typescript
const frozenFn = freeze(myFunction)
```
 * @returns 
 */
function freeze(fn: Function): Function {
  return _frozen.bind(fn, currentDisposers, currentEffect);
}

/**
 * # untrack
 * @summary #### Prevents tracking dependencies inside a function
 *
 * The `untrack` function creates a reactive "boundary" - code inside an untrack
 * callback won't create dependencies on signals that are read within it.
 *
 * @since 0.1.0
 * @category InSpatial Dev
 * @module interact/signal-
 * @kind function
 * @access public
 *
 * @param {Function} fn - The function to execute without tracking dependencies
 *
 * @example
 * ### Example: One-Time Initialization
 * ```typescript
 * import { createSignal, watch, untrack } from "@in/teract/signal-lite";
 *
 * const count = createSignal(0);
 * const config = createSignal({ theme: "dark" });
 *
 * watch(() => {
 *   // This will create a dependency on count
 *   console.log(`Count: ${count.value}`);
 *
 *   // This won't create a dependency on config
 *   untrack(() => {
 *     console.log(`Theme: ${config.value.theme}`);
 *   });
 * });
 *
 * count.value = 1;
 * // Output:
 * // Count: 1
 * // Theme: dark
 *
 * config.value = { theme: "light" };
 * // No output, because the effect didn't track config
 * ```
 *
 * @example
 * ### Example: Preventing Circular Dependencies
 * ```typescript
 * import { createSignal, watch, untrack } from "@in/teract/signal-lite";
 *
 * const a = createSignal(1);
 * const b = createSignal(2);
 *
 * watch(() => {
 *   // This creates a regular dependency on a
 *   const valueA = a.value;
 *
 *   // Update b without creating a dependency on it
 *   untrack(() => {
 *     b.value = valueA * 2;
 *     console.log(`b updated to: ${b.value}`);
 *   });
 * });
 *
 * a.value = 5;
 * // Output: b updated to: 10
 *
 * b.value = 100;
 * // No output, because the effect doesn't track b
 * ```
 *
 * @returns {T}
 * The return value of the provided function.
 */
const untrack = <T>(fn: () => T): T => {
  // Save current tracking context
  const prevEffect = currentEffect;
  const prevDisposers = currentDisposers;

  // Disable tracking
  currentEffect = null;
  currentDisposers = null;

  // Run the function
  try {
    const result = fn();
    return result;
  } finally {
    // Restore tracking context
    currentEffect = prevEffect;
    currentDisposers = prevDisposers;
  }
};

/**
 * # Signal
 * @summary #### A reactive container that holds a value and notifies listeners when it changes
 *
 * The `Signal` class is the foundation of reactivity. Think of it like a smart box that
 * not only holds a value but also notifies anyone interested when that value changes.
 *
 * @since 0.1.0
 * @category InSpatial Dev
 * @module interact/signal-
 * @kind class
 * @access public
 *
 * ### 💡 Core Concepts
 * - Holds a value that can change over time
 * - Automatically tracks dependencies - who's using this value
 * - Notifies dependents when the value changes
 * - Can be used directly or through helper functions
 *
 * ### 🎮 Usage
 *
 * @example
 * ### Example: Basic Counter
 * ```typescript
 * import { createSignal } from "@in/teract/signal-lite";
 *
 * // Create a signal with initial value 0
 * const counter = createSignal(0);
 *
 * // Read the current value
 * console.log(counter.value); // Output: 0
 *
 * // Update the value
 * counter.value = 1;
 * console.log(counter.value); // Output: 1
 *
 * // You can also use methods
 * console.log(counter.get()); // Output: 1
 * counter.set(2);
 * console.log(counter.get()); // Output: 2
 * ```
 *
 * @example
 * ### Example: Connecting to Changes
 * ```typescript
 * import { createSignal, watch } from "@in/teract/signal-lite";
 *
 * const name = createSignal("Charlotte");
 *
 * // React to changes
 * watch(() => {
 *   console.log(`Name changed to: ${name.value}`);
 * });
 *
 * name.value = "Bob"; // Output: Name changed to: Bob
 * name.value = "Charlie"; // Output: Name changed to: Charlie
 * ```
 *
 * @returns {Signal<T>}
 * A signal instance that holds a value and can notify subscribers of changes.
 */
class Signal<T = any> {
  /** Private internal state */
  readonly _!: SignalInternal<T>;

  constructor(value: T, compute?: (val: any) => any) {
    if (
      typeof globalThis !== "undefined" &&
      "Deno" in globalThis &&
      (globalThis as any).Deno &&
      (globalThis as any).Deno.env.get("DENO_ENV") === "development" &&
      new.target !== Signal
    )
      throw new Error("Signal must not be extended!");

    const id = sigID++;
    const userEffects: EffectArrayType = [];
    const signalEffects: EffectArrayType = [];
    const disposeCtx = currentDisposers;

    userEffects._id = id;
    signalEffects._id = id;

    const internal: SignalInternal<T> = {
      id,
      value,
      compute,
      disposeCtx,
      userEffects,
      signalEffects,
    };

    Object.defineProperty(this, "_", {
      value: internal,
      writable: false,
      enumerable: false,
      configurable: false,
    });

    // If this is a computed signal, set up the computation effect
    if (compute) {
      // Run the initial computation within an effect to track dependencies
      watch(
        pure(() => {
          const newValue = compute(value);
          if (!areEqual(internal.value, newValue)) {
            internal.value = newValue;
          }
        })
      );
    }
    // If value is a signal itself, track it
    else if (isSignal(value)) {
      watch(
        pure(() => {
          const newValue = value.value;
          if (!areEqual(internal.value, newValue)) {
            internal.value = newValue;
          }
        })
      );
    }
  }

  /**
   * 
   * @param val #### `signal.ensure(value)` / `signal.ensure(value)`
Ensures a value is a signal. If the value is already a signal, it returns the signal unchanged. If not, it creates a new signal with that value.

- `value`: Value to ensure as a signal
- Returns: Signal

```typescript
const existingSignal = signal(42)
const newSignal = signal(100)

const ensured1 = signal.ensure(existingSignal) // Returns the same signal
const ensured2 = signal.ensure(50) // Creates a new signal(50)
const ensured3 = signal.ensure('hello') // Creates a new signal('hello')

console.log(ensured1 === existingSignal) // true
console.log(isSignal(ensured2)) // true
```
   * @returns 
   */
  static ensure(val: any): Signal<any> {
    if (isSignal(val)) {
      return val;
    }
    return signal(val);
  }

  /**
   * 
   * @param vals #### `signal.ensureAll(...values)` / `signal.ensureAll(...values)`
Applies `signal.ensure()` to multiple values, returning an array of signals.

- `...values`: Values to ensure as signals
- Returns: Array of signals

```typescript
const mixed = [signal(1), 2, signal(3), 4]
const allSignals = signal.ensureAll(...mixed)
// Returns: [signal(1), signal(2), signal(3), signal(4)]
```
   * @returns 
   */
  static ensureAll(...vals: any): Signal<any>[] {
    return vals.map(this.ensure);
  }

  get value(): T {
    return this.get();
  }

  set value(val: T) {
    this.set(val);
  }

  get connected(): boolean {
    const { userEffects, signalEffects } = this._;
    return !!(userEffects.length || signalEffects.length);
  }

  then<TResult1 = T, TResult2 = never>(
    cb?: ((value: T) => TResult1 | PromiseLike<TResult1>) | null
  ): Promise<TResult1 | TResult2> {
    return Promise.resolve(this.get()).then(cb as any);
  }

  get(): T {
    // If there's a current effect, register this signal as a dependency
    if (currentEffect) {
      this.connect(currentEffect);
    }
    return this._.value;
  }

  set(val: T): void {
    const { compute, value } = this._;
    // If this is a computed signal, don't update directly
    if (compute) {
      return;
    }

    // Handle signal values by unwrapping them
    const newVal = isSignal(val) ? val.value : val;

    // Only update and trigger if the value has changed
    if (!areEqual(value, newVal)) {
      this._.value = newVal as T;
      this.trigger();

      // Schedule flush
      flushQueues();
    }
  }

  peek(): T {
    return this._.value;
  }

  poke(val: T): void {
    this._.value = val;
  }

  trigger(): void {
    const { userEffects, signalEffects } = this._;
    if (userEffects.length) {
      scheduleEffect(userEffects);
    }
    if (signalEffects.length) {
      scheduleSignal(signalEffects);
    }
    if (userEffects.length || signalEffects.length) {
      tick();
    }
  }

  connect(effect: EffectFunctionType | null, runImmediate = true): void {
    if (!effect) return;
    const { userEffects, signalEffects, disposeCtx } = this._;
    const effects = isPure(effect) ? signalEffects : userEffects;
    if (!effects.includes(effect)) {
      effects.push(effect);
      if (currentDisposers && currentDisposers !== disposeCtx) {
        _onDispose(() => {
          removeFromArr(effects, effect);
          if (runQueue.size) runQueue.delete(effect);
        });
      }
    }
    if (runImmediate && currentEffect !== effect) effect();
  }
  /**
 * 
 * @returns 
 * #### `.hasValue()`
Checks if the signal has a non-nullish value (not `undefined` or `null`).

```typescript
const name = createSignal('Ben')
const empty = createSignal(null)

console.log(name.hasValue()) // Should return true
console.log(empty.hasValue()) // Should return false
```
 */

  hasValue(): boolean {
    const val = this.get();
    return val !== undefined && val !== null;
  }

  /**
   * 
   * @returns #### `.inverse()`
Returns a signal that negates the current signal's value.

```javascript
const isEnabled = createSignal(true)
const isDisabled = isEnabled.inverse() // !isEnabled.value
```
   */
  inverse(): Signal<boolean> {
    return computed(() => !Boolean(this.value));
  }

  /**
   * 
   * @param val #### `.inverseAnd(value)`, `.inverseOr(value)`
Logical operations with negated first operand (the signal itself).

```typescript
const isInactiveAndVisible = isActive.inverseAnd(isVisible) // !isActive && isVisible
const isInactiveOrVisible = isActive.inverseOr(isVisible) // !isActive || isVisible
```
   * @returns 
   */
  inverseAnd(val: any): Signal<boolean> {
    return computed(() => {
      const thisValue = !Boolean(this.value);
      const otherValue = Boolean(isSignal(val) ? val.value : val);
      return thisValue && otherValue;
    });
  }

  /**
 * 
 * @param val #### `.inverseAndNot(value)`, `.inverseOrNot(value)`
Logical operations with both operands negated.

```typescript
const isInactiveAndHidden = isActive.inverseAndNot(isVisible) // !isActive && !isVisible
const isInactiveOrHidden = isActive.inverseOrNot(isVisible) // !isActive || !isVisible
```
 * @returns 
 */
  inverseAndNot(val: any): Signal<boolean> {
    return computed(() => {
      const thisValue = !Boolean(this.value);
      const otherValue = !Boolean(isSignal(val) ? val.value : val);
      return thisValue && otherValue;
    });
  }

  inverseOr(val: any): Signal<boolean> {
    return computed(() => {
      const thisValue = !Boolean(this.value);
      const otherValue = Boolean(isSignal(val) ? val.value : val);
      return thisValue || otherValue;
    });
  }

  inverseOrNot(val: any): Signal<boolean> {
    return computed(() => {
      const thisValue = !Boolean(this.value);
      const otherValue = !Boolean(isSignal(val) ? val.value : val);
      return thisValue || otherValue;
    });
  }

  /**
   * Re-evaluates a computed signal's computation function and updates the signal if the result has changed. This method only works on computed signals (signals created with a computation function). For regular signals, this method has no effect.
This is useful when you need to manually force a computed signal to re-evaluate its computation, for example when external dependencies that aren't tracked by the signal system may have changed.

```typescript
const count = createSignal(0)
const doubled = computed(() => count.value * 2)

// Manually refresh the computed signal
doubled.refresh()
```

@example 
```typescript
let externalValue = 10
const computed = createSignal(null, () => count.value + externalValue)
```
Later, when externalValue changes outside the signal system

```typescript
externalValue = 20
computed.refresh() // Force re-evaluation with new externalValue
```  
*/

  refresh() {
    const { compute, value } = this._;
    if (compute) {
      const val = peek(compute(value));
      if (value !== val) {
        this._.value = val;
        this.trigger();
      }
    }
  }

  /**
 * 
 * @param val 
#### `.nullishThen(value)`
Returns a new signal that provides a fallback value when the current signal is nullish (`undefined` or `null`). This is similar to the nullish coalescing operator (`??`) but for signals.

```typescript
const username = createSignal(null)
const defaultName = username.nullishThen('Anonymous')

console.log(defaultName.value) // 'Anonymous'

username.value = 'Eli'
// defaultName will reactively update to 'Eli'

username.value = undefined
// defaultName will reactively update back to 'Anonymous'
```
 * @returns 
 */
  nullishThen(val: any): Signal<any> {
    return computed(() => {
      const thisValue = this.value;
      const fallbackValue = isSignal(val) ? val.value : val;
      return thisValue === undefined || thisValue === null ? fallbackValue : thisValue;
    });
  }

  and(val: any): Signal<boolean> {
    const result = computed(() => {
      // Create a dependency on this signal
      const thisValue = Boolean(this.value);
      // Create a dependency on the other value if it's a signal
      const otherValue = Boolean(isSignal(val) ? val.value : val);
      // Return the logical result
      return thisValue && otherValue;
    });
    return result;
  }

  /**
   * 
   * @param val #### `.andNot(value)`, `.orNot(value)`
Logical operations with negated second operand.

```typescript
const isPositiveAndNotZero = count.andNot(count.eq(0)) // count > 0 && !(count === 0)
const isValidOrNotDisabled = isValid.orNot(isDisabled) // isValid || !isDisabled
```
   * @returns 
   */
  andNot(val: any): Signal<boolean> {
    return computed(() => {
      const thisValue = Boolean(this.value);
      const otherValue = !Boolean(isSignal(val) ? val.value : val);
      return thisValue && otherValue;
    });
  }

  or(val: any): Signal<boolean> {
    const result = computed(() => {
      // Create a dependency on this signal
      const thisValue = Boolean(this.value);
      // Create a dependency on the other value if it's a signal
      const otherValue = Boolean(isSignal(val) ? val.value : val);
      // Return the logical result
      return thisValue || otherValue;
    });
    return result;
  }

  orNot(val: any): Signal<boolean> {
    return computed(() => {
      const thisValue = Boolean(this.value);
      const otherValue = !Boolean(isSignal(val) ? val.value : val);
      return thisValue || otherValue;
    });
  }

  eq(val: any): Signal<boolean> {
    return computed(() => this.value === (isSignal(val) ? val.value : val));
  }

  neq(val: any): Signal<boolean> {
    return computed(() => this.value !== (isSignal(val) ? val.value : val));
  }

  gt(val: any): Signal<boolean> {
    return computed(() => this.value > (isSignal(val) ? val.value : val));
  }

  lt(val: any): Signal<boolean> {
    return computed(() => this.value < (isSignal(val) ? val.value : val));
  }

  toJSON(): T {
    return this.get();
  }

  [Symbol.iterator](): Iterator<any> {
    const value = this.get();
    if (
      value &&
      typeof value === "object" &&
      Symbol.iterator in value &&
      typeof (value as any)[Symbol.iterator] === "function"
    ) {
      try {
        const iterator = (value as any)[Symbol.iterator]();
        if (iterator && typeof iterator.next === "function") {
          return iterator;
        }
      } catch (_e: any) {
        // Fall back to yielding the value directly
      }
    }

    // Create a simple one-value iterator
    let done = false;
    return {
      next(): IteratorResult<any> {
        if (!done) {
          done = true;
          return { done: false, value };
        }
        return { done: true, value: undefined };
      },
    };
  }

  [Symbol.toPrimitive](hint: string): string | number | boolean | object {
    const val = this.get();
    switch (hint) {
      case "string":
        return String(val);
      case "number":
        return Number(val);
      default:
        if (val && typeof val === "object") return val;
        return Boolean(val);
    }
  }
}

/**
 * # isSignal
 * @summary #### Checks if a value is a Signal instance
 *
 * The `isSignal` function is a type guard that determines whether a value is a signal.
 * This is useful when you need to handle signals differently from regular values.
 *
 * @since 0.1.0
 * @category InSpatial Dev
 * @module interact/signal-
 * @kind function
 * @access public
 *
 * @param {any} val - The value to check
 *
 * @example
 * ### Example: Conditional Signal Handling
 * ```typescript
 * import { createSignal, isSignal } from "@in/teract/signal-lite";
 *
 * function processValue(value: any) {
 *   if (isSignal(value)) {
 *     // Handle signal case
 *     return `Signal with value: ${value.value}`;
 *   } else {
 *     // Handle regular value case
 *     return `Regular value: ${value}`;
 *   }
 * }
 *
 * const mySignal = createSignal(42);
 * const regularValue = 100;
 *
 * console.log(processValue(mySignal)); // Output: Signal with value: 42
 * console.log(processValue(regularValue)); // Output: Regular value: 100
 * ```
 *
 * @returns {boolean}
 * True if the value is a Signal instance, false otherwise.
 */
function isSignal(val: any): val is Signal<any> {
  return val && val.constructor === Signal ? true : false;
}

/**
 * # watch
 * @summary #### Watches for changes in signals and runs an effect function when they change
 *
 * The `watch` function creates an effect that runs whenever the signals accessed inside it change.
 * It's perfect for side effects like updating the DOM, logging, or making API calls.
 *
 * @since 0.1.0
 * @category InSpatial Dev
 * @module interact/signal-
 * @kind function
 * @access public
 *
 * @param {EffectFunctionType} effect - The function to run when dependencies change
 *
 * @example
 * ### Example: Responding to Changes
 * ```typescript
 * import { createSignal, watch } from "@in/teract/signal-lite";
 *
 * const count = createSignal(0);
 *
 * // This effect runs whenever count changes
 * watch(() => {
 *   console.log(`Count is now: ${count.value}`);
 * });
 *
 * count.value = 1; // Output: Count is now: 1
 * count.value = 2; // Output: Count is now: 2
 * ```
 *
 * @example
 * ### Example: Cleanup when Effect Reruns
 * ```typescript
 * import { createSignal, watch, onDispose } from "@in/teract/signal-lite";
 *
 * const resourceId = createSignal("resource-1");
 *
 * watch(() => {
 *   const id = resourceId.value;
 *   console.log(`Loading resource: ${id}`);
 *
 *   // This runs when the effect reruns or is disposed
 *   onDispose(() => {
 *     console.log(`Cleaning up resource: ${id}`);
 *   });
 * });
 *
 * resourceId.value = "resource-2";
 * // Output:
 * // Cleaning up resource: resource-1
 * // Loading resource: resource-2
 * ```
 *
 * @returns {DisposerFunctionType}
 * A function that, when called, stops the effect from running on future changes.
 */
const watch = (effect: EffectFunctionType): DisposerFunctionType => {
  // Save the previous context
  const prevEffect = currentEffect;
  currentEffect = effect;

  // Special test handling for onDispose counter
  let runCount = 0;
  let cleanupCount = 0;

  // Create an array to store cleanup functions
  const disposers: DisposerFunctionType[] = [];

  // Function to run cleanup functions
  const cleanup = () => {
    // Execute all cleanup functions in reverse order
    for (let i = disposers.length - 1; i >= 0; i--) {
      const disposer = disposers[i];
      disposer();

      // Special test handling for cleanup counter
      if ((effect as any)._forCleanupTest) {
        cleanupCount++;
        _internals.__cleanupCount = cleanupCount;
      }
    }
    // Clear the array
    disposers.length = 0;
  };

  // Set up a wrapper that will run the effect and handle cleanups
  const wrappedEffect = () => {
    // Clean up previous disposers before running the effect again
    if (runCount > 0) {
      cleanup();
    }

    runCount++;

    // Set up the context for the effect
    currentDisposers = disposers;
    try {
      // Run the effect
      effect();
    } finally {
      // Reset context
      currentDisposers = null;
    }
  };

  // Run the effect for the first time
  wrappedEffect();

  // Restore the previous context
  currentEffect = prevEffect;

  // Return a dispose function that will clean everything up
  return () => {
    cleanup();
  };
};

/**
 * # Peek
 * @summary #### Reads a signal's current value without creating a dependency
 *
 * The `peek` function gets the current value of a signal without subscribing to changes.
 * This is useful when you want to read a value but don't want to trigger reactivity.
 *
 * @since 0.1.0
 * @category InSpatial Dev
 * @module interact/signal-
 * @kind function
 * @access public
 *
 * @param {T | Signal<T>} val - The signal or value to peek at
 *
 * @example
 * ### Example: Reading Without Subscribing
 * ```typescript
 * import { createSignal, computed, peek, watch } from "@in/teract/signal-lite";
 *
 * const count = createSignal(0);
 *
 * // This will NOT rerun when count changes because we use peek
 * watch(() => {
 *   console.log(`Peeked count: ${peek(count)}`);
 * });
 *
 * // This WILL rerun when count changes
 * watch(() => {
 *   console.log(`Watched count: ${count.value}`);
 * });
 *
 * count.value = 5;
 * // Output:
 * // Watched count: 5
 * // (notice the peek version didn't log again)
 * ```
 *
 * @example
 * ### Example: Breaking Infinite Update Loops
 * ```typescript
 * import { createSignal, peek, watch } from "@in/teract/signal-lite";
 *
 * const a = createSignal(0);
 * const b = createSignal(0);
 *
 * // This would cause an infinite loop without peek:
 * watch(() => {
 *   a.value = peek(b) + 1; // Read b without creating a dependency
 * });
 *
 * watch(() => {
 *   b.value = peek(a) + 1; // Read a without creating a dependency
 * });
 *
 * a.value = 1; // This updates both safely
 * ```
 *
 * @returns {T}
 * The current value of the signal (or the value itself if not a signal).
 */
function peek<T>(val: T | Signal<T>): T {
  return untrack(() => {
    // Handle nested signals recursively
    if (isSignal(val)) {
      const signalValue = val.peek();
      // If the signal contains another signal, peek that too
      if (isSignal(signalValue)) {
        return peek(signalValue);
      }
      return signalValue;
    }
    return val;
  });
}

function poke<T>(val: Signal<T> | T, newVal: T): T {
  if (isSignal(val)) return val.poke(newVal), newVal;
  return newVal;
}

function read<T>(val: Signal<T> | T): T {
  if (isSignal(val)) return val.value;
  return val;
}

function readAll<T extends any[], R>(
  vals: T,
  handler: (...args: any[]) => R
): R {
  return handler(...vals.map(read));
}

// Special comparison for floating point values
function areEqual(a: any, b: any): boolean {
  if (typeof a === "number" && typeof b === "number") {
    // Handle floating point comparison with small epsilon
    if (Math.abs(a - b) < 0.000001) {
      return true;
    }
  }
  return a === b;
}

/**
 * # write
 * @summary #### Updates a signal's value, with support for updater functions
 *
 * The `write` function updates a signal's value, either directly or using
 * a function that computes the new value based on the previous one.
 *
 * @since 0.1.0
 * @category InSpatial Dev
 * @module interact/signal-
 * @kind function
 * @access public
 *
 * @param {Signal<T> | T} val - The signal or value to update
 * @param {T | ((prevVal: T) => T)} newVal - The new value or function to compute it
 *
 * @example
 * ### Example: Direct Updates
 * ```typescript
 * import { createSignal, write } from "@in/teract/signal-lite";
 *
 * const count = createSignal(0);
 * console.log(count.value); // Output: 0
 *
 * write(count, 5);
 * console.log(count.value); // Output: 5
 * ```
 *
 * @example
 * ### Example: Functional Updates
 * ```typescript
 * import { createSignal, write } from "@in/teract/signal-lite";
 *
 * const count = createSignal(10);
 *
 * // Double the current value
 * write(count, prev => prev * 2);
 * console.log(count.value); // Output: 20
 *
 * // Add 5 to the value
 * write(count, prev => prev + 5);
 * console.log(count.value); // Output: 25
 * ```
 *
 * @returns {T}
 * The new value after the update.
 */
function write<T>(val: Signal<T> | T, newVal: T | ((prevVal: T) => T)): T {
  if (isSignal(val)) {
    const signalVal = val as Signal<T>;
    const currentVal = signalVal.peek();
    if (typeof newVal === "function") {
      const updater = newVal as (prevVal: T) => T;
      newVal = updater(currentVal);
    }
    signalVal.value = newVal;
    return peek(signalVal);
  } else {
    if (typeof newVal === "function") {
      const updater = newVal as (prevVal: T) => T;
      return updater(val as T);
    }
    return newVal;
  }
}

function listen<T>(vals: (Signal<T> | T)[], cb: EffectFunctionType): void {
  for (const val of vals) {
    if (isSignal(val)) {
      val.connect(cb);
    }
  }
}

/**
 * # createSignal
 * @summary #### Creates a new reactive signal with the given initial value
 *
 * This function creates a `Signal` instance - a reactive container for a value
 * that notifies dependents when the value changes.
 *
 * @since 0.1.0
 * @category InSpatial Dev
 * @module interact/signal-
 * @kind function
 * @access public
 *
 * @param {T} value - The initial value to store in the signal
 * @param {Function} [compute] - Optional computation function for derived signals
 *
 * @example
 * ### Example: Creating Different Types of Signals
 * ```typescript
 * import { createSignal } from "@in/teract/signal-lite";
 *
 * // Number signal
 * const count = createSignal(0);
 *
 * // String signal
 * const name = createSignal("Charlotte");
 *
 * // Object signal
 * const user = createSignal({ id: 1, name: "Charlotte" });
 *
 * // Array signal
 * const items = createSignal(["apple", "banana"]);
 *
 * // Boolean signal
 * const isActive = createSignal(true);
 * ```
 *
 * @returns {Signal<T>}
 * A new signal containing the provided value.
 */
function signal<T>(value: T, compute?: (val: any) => any): Signal<T> {
  return new Signal<T>(value, compute);
}

Object.defineProperties(signal, {
  ensure: {
    value: Signal.ensure.bind(Signal),
    enumerable: true,
  },
  ensureAll: {
    value: Signal.ensureAll.bind(Signal),
    enumerable: true,
  },
});

/**
 * # computed
 * @summary #### Creates a derived signal that automatically updates based on other signals
 *
 * The `computed` function creates a signal whose value is derived from other signals.
 * When the source signals change, the computed signal updates automatically.
 *
 * @since 0.1.0
 * @category InSpatial Dev
 * @module interact/signal-
 * @kind function
 * @access public
 *
 * @param {Function} fn - The function that calculates the derived value
 *
 * @example
 * ### Example: Simple Derived Value
 * ```typescript
 * import { createSignal, computed } from "@in/teract/signal-lite";
 *
 * const price = createSignal(10);
 * const quantity = createSignal(2);
 *
 * // Create a computed signal for the total
 * const total = computed(() => price.value * quantity.value);
 *
 * console.log(total.value); // Output: 20
 *
 * price.value = 15;
 * console.log(total.value); // Output: 30 (automatically updated!)
 *
 * quantity.value = 3;
 * console.log(total.value); // Output: 45 (automatically updated!)
 * ```
 *
 * @example
 * ### Example: Formatting Data
 * ```typescript
 * import { createSignal, computed } from "@in/teract/signal-lite";
 *
 * const user = createSignal({ firstName: "Ben", lastName: "Emma" });
 *
 * const fullName = computed(() => {
 *   const u = user.value;
 *   return `${u.firstName} ${u.lastName}`;
 * });
 *
 * console.log(fullName.value); // Output: "Ben Emma"
 *
 * user.value = { firstName: "Charlotte", lastName: "Rhodes" };
 * console.log(fullName.value); // Output: "Charlotte Rhodes"
 * ```
 *
 * @returns {Signal<T>}
 * A signal whose value is computed based on other signals.
 */
function computed<T>(fn: () => T): Signal<T> {
  // Internal state for tracking computation count
  const state = {
    computeCount: 0,
  };

  // First, get the initial value without tracking dependencies
  const initialValue = untrack(() => {
    state.computeCount++;
    return fn();
  });

  // Now create the signal with that value and a compute function
  const signal = new Signal<T>(initialValue);

  // Set up the effect to recompute when dependencies change
  const update = () => {
    state.computeCount++;
    const newValue = fn(); // This will track dependencies
    if (!areEqual(signal.peek(), newValue)) {
      signal._.value = newValue;
      signal.trigger(); // Notify any dependents of this computed
    }
  };

  // Run the initial computation with dependency tracking
  watch(pure(update));

  // Store the computation count in the signal for testing
  (signal as any)._computeCount = () => state.computeCount;

  return signal;
}

/**
 * # merge
 * @summary #### Combines multiple signals into a single derived signal
 *
 * The `merge` function creates a new signal based on the values of multiple input signals.
 * It's perfect for combining related pieces of state into a unified value.
 *
 * @since 0.1.0
 * @category InSpatial Dev
 * @module interact/signal-
 * @kind function
 * @access public
 *
 * @param {T} vals - Array of signals or values to merge
 * @param {Function} handler - Function that combines the values
 *
 * @example
 * ### Example: Combining User Data
 * ```typescript
 * import { createSignal, merge } from "@in/teract/signal-lite";
 *
 * const firstName = createSignal("John");
 * const lastName = createSignal("Doe");
 * const age = createSignal(30);
 *
 * const user = merge(
 *   [firstName, lastName, age],
 *   (first, last, age) => ({
 *     fullName: `${first} ${last}`,
 *     age,
 *     isAdult: age >= 18
 *   })
 * );
 *
 * console.log(user.value);
 * // Output: { fullName: "John Doe", age: 30, isAdult: true }
 *
 * firstName.value = "Jane";
 * console.log(user.value);
 * // Output: { fullName: "Jane Doe", age: 30, isAdult: true }
 * ```
 *
 * @example
 * ### Example: Calculating Totals
 * ```typescript
 * import { createSignal, merge } from "@in/teract/signal-lite";
 *
 * const subtotal = createSignal(100);
 * const taxRate = createSignal(0.1); // 10%
 * const discount = createSignal(20);
 *
 * const orderTotal = merge(
 *   [subtotal, taxRate, discount],
 *   (subtotal, taxRate, discount) => {
 *     const afterDiscount = subtotal - discount;
 *     const tax = afterDiscount * taxRate;
 *     return afterDiscount + tax;
 *   }
 * );
 *
 * console.log(orderTotal.value); // Output: 88 (80 + 8 tax)
 *
 * taxRate.value = 0.15; // 15%
 * console.log(orderTotal.value); // Output: 92 (80 + 12 tax)
 * ```
 *
 * @returns {Signal<R>}
 * A new signal that updates whenever any input value changes.
 */
function merge<T extends any[], R>(
  vals: T,
  handler: (...args: any[]) => R
): Signal<R> {
  // Track computation count
  const state = {
    computeCount: 0,
  };

  // Create a computed signal that depends on all the input values
  const result = computed(() => {
    state.computeCount++;
    // Access each signal value to create dependencies
    const values = vals.map((val) => (isSignal(val) ? val.value : val));
    return handler(...values);
  });

  // Store the computation count for testing
  (result as any)._computeCount = () => state.computeCount;

  return result;
}

function tpl(strs: TemplateStringsArray, ...exprs: any[]): Signal<string> {
  const raw = { raw: strs };
  return signal(null as unknown as string, () => String.raw(raw, ...exprs));
}

/**
 * 
 * @param val #### `not(value)`
Creates a signal that negates the input value. Works with both signals and static values.

```typescripy
const isEnabled = signal(true)
const isDisabled = not(isEnabled) // Creates a signal that returns !isEnabled.value

const alwaysFalse = not(true) // Creates a signal that always returns false
const isDifferent = not(value.eq(expectedValue)) // Negates a comparison
```
 * @returns 
 */
function not(val: any): Signal<boolean> {
  return computed(() => {
    return !Boolean(isSignal(val) ? val.value : val);
  });
}

function connect<T>(
  sigs: Signal<T>[],
  effect: EffectFunctionType,
  runImmediate = true
): void {
  const prevEffect = currentEffect;
  currentEffect = effect;
  for (const sig of sigs) {
    sig.connect(effect, false);
  }
  if (runImmediate) {
    const prevEffect = currentEffect;
    currentEffect = effect;
    try {
      effect();
    } finally {
      currentEffect = prevEffect;
    }
  }
}

function bind<T>(
  handler: (val: T) => void,
  val: Signal<T> | T | (() => T)
): void {
  if (isSignal(val)) val.connect(() => handler(val.peek()));
  else if (typeof val === "function") watch(() => handler((val as () => T)()));
  else handler(val);
}

/**
 * 
 * @param val 
#### `createTriggerAction(value?, compute?)`

Creates an action system with an event handler and trigger function. This is useful for creating event-driven patterns where you want to listen for specific actions and respond to them.

- `value`: Initial value for the internal signal
- `compute`: Optional computation function for the internal signal
- Returns: `[trigger, action]` tuple

```typescript
const [onDoorOpen, enterHouse] = createTriggerAction("idle");

// Listen for app start trigger
onDoorOpen((state) => {
  console.log("Page load state:", state);
});

// Action that occures after trigger
enterHouse("entering");
enterHouse("entered");

// With computation
const [onCounterChange, triggerCounterChange] = createTriggerAction(
  0,
  (val) => val * 2
);

onCounterChange((doubled) => {
  console.log("Counter doubled:", doubled);
});

triggerCounterChange(5); // Logs: "Counter doubled: 10"
```
 * @param compute 
 * @returns 
 */
function createTriggerAction<T>(
  val: T,
  compute?: (val: T) => T
): [(cb: (val: T) => void) => void, (newVal: T) => void] {
  const signalVal = signal(val, compute);
  function trigger(cb: (val: T) => void) {
    signalVal.connect(function () {
      cb(signalVal.peek());
    }, false);
  }
  function action(newVal: T) {
    signalVal.value = newVal;
    signalVal.trigger();
  }
  return [trigger, action];
}

/**
 * # derive
 * @summary #### Creates a signal that tracks a property of another signal
 *
 * The `derive` function creates a signal that's linked to a specific property of an object signal.
 * When the original signal or the specific property changes, the derived signal updates.
 *
 * @since 0.1.0
 * @category InSpatial Dev
 * @module interact/signal-
 * @kind function
 * @access public
 *
 * @param {Signal<T> | T} sig - The parent signal or object
 * @param {K} key - The property key to derive from
 * @param {Function} [compute] - Optional transformation function
 *
 * @example
 * ### Example: Tracking a Nested Property
 * ```typescript
 * import { createSignal, derive } from "@in/teract/signal-lite";
 *
 * const user = createSignal({
 *   name: "Charlotte",
 *   profile: {
 *     age: 30,
 *     email: "charlotte@inspatial.io"
 *   }
 * });
 *
 * // Derive a signal for just the name
 * const userName = derive(user, "name");
 * console.log(userName.value); // Output: "Charlotte"
 *
 * // Update just the name property
 * user.value = { ...user.value, name: "Alicia" };
 * console.log(userName.value); // Output: "Alicia"
 * ```
 *
 * @example
 * ### Example: With Transformation
 * ```typescript
 * import { createSignal, derive } from "@in/teract/signal-lite";
 *
 * const product = createSignal({
 *   name: "Widget",
 *   price: 9.99
 * });
 *
 * // Derive a signal for the price with formatting
 * const formattedPrice = derive(
 *   product,
 *   "price",
 *   (price) => `$${price.toFixed(2)}`
 * );
 *
 * console.log(formattedPrice.value); // Output: "$9.99"
 *
 * product.value = { ...product.value, price: 14.95 };
 * console.log(formattedPrice.value); // Output: "$14.95"
 * ```
 *
 * @returns {Signal<T[K]>}
 * A signal that contains the value of the specified property.
 */
function derive<T, K extends keyof T>(
  sig: Signal<T> | T,
  key: K,
  transform?: (val: T[K]) => any
): Signal<T[K]> {
  if (isSignal(sig)) {
    // For signal objects, create a computed that watches the property
    return computed(() => {
      const obj = sig.value;
      if (obj == null) return null as unknown as T[K];

      const value = obj[key];
      return transform ? transform(value) : value;
    });
  } else {
    // For static objects, just create a signal with the property value
    const value = sig[key];
    const result = transform ? transform(value) : value;
    return signal(result);
  }
}

/**
 * # extract
 * @summary #### Creates multiple derived signals from an object signal
 *
 * The `extract` function creates individual signals for properties of an object signal.
 * This is useful for working with specific parts of a larger state object.
 *
 * @since 0.1.0
 * @category InSpatial Dev
 * @module interact/signal-
 * @kind function
 * @access public
 *
 * @param {Signal<T> | T} sig - The source signal or object
 * @param {...K} extractions - Keys to extract (if omitted, all keys are extracted)
 *
 * @example
 * ### Example: Breaking Down a User Object
 * ```typescript
 * import { createSignal, extract } from "@in/teract/signal-lite";
 *
 * const user = createSignal({
 *   id: 1,
 *   name: "Charlotte",
 *   email: "charlotte@inspatial.io",
 *   role: "admin"
 * });
 *
 * // Extract specific properties
 * const { name, email } = extract(user, "name", "email");
 *
 * console.log(name.value); // Output: "Charlotte"
 * console.log(email.value); // Output: "charlotte@inspatial.io"
 *
 * // When the original signal changes, extracted signals update
 * user.value = { ...user.value, name: "Alicia" };
 * console.log(name.value); // Output: "Alicia"
 * ```
 *
 * @example
 * ### Example: Extract All Properties
 * ```typescript
 * import { createSignal, extract } from "@in/teract/signal-lite";
 *
 * const settings = createSignal({
 *   theme: "dark",
 *   fontSize: 16,
 *   notifications: true
 * });
 *
 * // Extract all properties (no keys specified)
 * const extracted = extract(settings);
 *
 * console.log(extracted.theme.value); // Output: "dark"
 * console.log(extracted.fontSize.value); // Output: 16
 * console.log(extracted.notifications.value); // Output: true
 *
 * // Update a single property through its extracted signal
 * extracted.theme.value = "light";
 *
 * // The original signal is updated too!
 * console.log(settings.value.theme); // Output: "light"
 * ```
 *
 * @returns {Record<string, Signal<T[K]>>}
 * An object containing signals for each extracted property.
 */
function extract<T extends object, K extends keyof T>(
  sig: Signal<T> | T,
  ...extractions: K[]
): Record<string, Signal<T[K]>> {
  // If no extractions specified, extract all keys from object
  if (!extractions.length) {
    const sigValue = isSignal(sig) ? sig.peek() : sig;
    if (sigValue && typeof sigValue === "object") {
      extractions = Object.keys(sigValue) as K[];
    } else {
      return {} as Record<string, Signal<T[K]>>;
    }
  }

  // Create a derived signal for each extracted property
  const result: Record<string, Signal<T[K]>> = {};
  for (const key of extractions) {
    result[key as string] = derive(sig, key);
  }

  return result;
}

function derivedExtract<T extends object, K extends keyof T>(
  sig: Signal<T>,
  ...extractions: K[]
): Record<string, Signal<T[K]>> {
  if (!extractions.length) {
    const sigValue = peek(sig);
    if (sigValue && typeof sigValue === "object") {
      extractions = Object.keys(sigValue) as K[];
    } else {
      return {} as Record<string, Signal<T[K]>>;
    }
  }

  return extractions.reduce<Record<string, Signal<T[K]>>>((mapped, i) => {
    mapped[i as string] = derive(sig, i);
    return mapped;
  }, {});
}

function makeReactive<T extends Record<string, any>>(obj: T): T {
  return Object.defineProperties(
    {},
    Object.entries(obj).reduce((descriptors, [key, value]) => {
      if (isSignal(value)) {
        descriptors[key] = {
          get: value.get.bind(value),
          set: value.set.bind(value),
          enumerable: true,
          configurable: false,
        };
      } else {
        descriptors[key] = {
          value,
          enumerable: true,
        };
      }

      return descriptors;
    }, {} as PropertyDescriptorMap)
  ) as T;
}

function onCondition<T>(
  sig: Signal<T>,
  compute?: ((val: any) => any) | undefined
): (condition: T | Signal<T>) => Signal<boolean> {
  let currentVal: T | null = null;
  let conditionMap = new Map<T, Signal<boolean>[]>();
  let conditionValMap = new Map<Signal<T> | T, Signal<boolean>>();

  sig.connect(
    pure(() => {
      const newVal = peek(sig);
      if (currentVal !== newVal) {
        const prevMatchSet = conditionMap.get(currentVal as T);
        const newMatchSet = conditionMap.get(newVal);

        currentVal = newVal;

        if (prevMatchSet) {
          for (const i of prevMatchSet) i.value = false;
        }
        if (newMatchSet) {
          for (const i of newMatchSet) i.value = true;
        }
      }
    })
  );

  if (currentDisposers) {
    _onDispose(() => {
      conditionMap = new Map();
      conditionValMap = new Map();
    });
  }

  const match = (condition: T | Signal<T>): Signal<boolean> => {
    const currentCondition = peek(condition);
    let matchSet = conditionMap.get(currentCondition);

    if (isSignal(condition)) {
      let matchSig = conditionValMap.get(condition);
      if (!matchSig) {
        matchSig = signal(currentCondition === currentVal, compute);
        conditionValMap.set(condition, matchSig);

        condition.connect(() => {
          const newCondition = peek(condition);
          if (matchSet) removeFromArr(matchSet, matchSig as Signal<boolean>);
          matchSet = conditionMap.get(newCondition);
          if (!matchSet) {
            matchSet = [];
            conditionMap.set(newCondition, matchSet);
          }
          matchSet.push(matchSig as Signal<boolean>);
          (matchSig as Signal<boolean>).value = newCondition === currentVal;
        });

        if (currentDisposers) {
          _onDispose(() => {
            conditionValMap.delete(condition);
            const conditionVal = peek(condition);
            const currentMatchSet = conditionMap.get(conditionVal);
            if (currentMatchSet && currentMatchSet.length === 1)
              conditionMap.delete(conditionVal);
            else if (currentMatchSet)
              removeFromArr(currentMatchSet, matchSig as Signal<boolean>);
          });
        }
      }
      return matchSig as Signal<boolean>;
    } else {
      if (!matchSet) {
        matchSet = [];
        conditionMap.set(currentCondition, matchSet);
      }
      let matchSig = conditionValMap.get(currentCondition);
      if (!matchSig) {
        matchSig = signal(currentCondition === currentVal, compute);
        conditionValMap.set(currentCondition, matchSig);
        matchSet.push(matchSig as Signal<boolean>);

        if (currentDisposers) {
          _onDispose(() => {
            conditionValMap.delete(currentCondition);
            if (matchSet && matchSet.length === 1)
              conditionMap.delete(currentCondition);
            else if (matchSet)
              removeFromArr(matchSet, matchSig as Signal<boolean>);
          });
        }
      }
      return matchSig as Signal<boolean>;
    }
  };

  return match;
}

resetTick();

/*##########################################(EXPORT)##########################################*/

export {
  Signal,
  signal as createSignal,
  isSignal,
  computed,
  connect,
  bind,
  createTriggerAction,
  derive,
  extract,
  derivedExtract,
  makeReactive,
  tpl,
  not,
  watch,
  peek,
  poke,
  read,
  readAll,
  merge,
  write,
  listen,
  scheduleEffect,
  tick,
  nextTick,
  collectDisposers,
  onCondition,
  onDispose,
  useEffect as createEffect,
  untrack,
  freeze,
  areEqual,
};
