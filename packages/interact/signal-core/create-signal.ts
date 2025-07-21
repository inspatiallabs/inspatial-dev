import { ComputationClass, type SignalOptionsType, untrack } from "./core.ts";
import type { ComputeFunctionType, SetterType, SignalType } from "./types.ts";
import { createMemo } from "./create-memo.ts";

/**
 * # CreateSignal
 * @summary #### Creates a reactive signal that automatically notifies when its value changes
 *
 * Think of `createSignal` like a smart variable that knows when it changes. Just like how a
 * smart thermostat automatically adjusts when the temperature changes, signals automatically
 * notify any code that depends on them when their value updates.
 *
 * @since 0.1.0
 * @category Interact - (InSpatial Signal Core)
 * @module CreateSignal
 * @kind function
 * @access public
 *
 * ### 💡 Core Concepts
 * - Signals are the foundation of InSpatial's reactive system
 * - They track who's watching them and notify automatically when changed
 * - Reading a signal creates a dependency relationship
 * - Updating a signal triggers all dependent code to re-run
 *
 * ### 🎯 Prerequisites
 * Before you start:
 * - Basic understanding of JavaScript functions
 * - Familiarity with the concept of getters and setters
 * - Understanding of the observer pattern (helpful but not required)
 *
 * ### 📚 Terminology
 * > **Signal**: A reactive value that can notify when it changes
 * > **Accessor**: The getter function returned by createSignal
 * > **Setter**: The function used to update the signal's value
 * > **Dependency Tracking**: How the system knows which signals a computation uses
 *
 * ### ⚠️ Important Notes
 * <details>
 * <summary>Click to learn more about edge cases</summary>
 *
 * > [!NOTE]
 * > Always call the accessor function (with parentheses) to read the value
 *
 * > [!NOTE]
 * > The setter can accept either a value or a function that receives the current value
 * </details>
 *
 * @param value - Initial value for the signal. If a function is provided, it becomes a computed signal
 * @param options - Configuration options for the signal behavior
 *
 * @returns A tuple containing [accessor, setter] functions for reading and updating the signal
 *
 * ### 🎮 Usage
 * #### Installation
 * ```bash
 * # Deno
 * deno add jsr:@in/teract
 * ```
 *
 * #### Examples
 * Here's how you might use signals in real applications:
 *
 * @example
 * ### Example 1: Simple Counter App
 * ```typescript
 * import { createSignal } from "@in/teract/signal-core/create-signal.ts";
 * import { createEffect } from "@in/teract/signal-core/create-effect.ts";
 *
 * // Create a signal for counting clicks
 * const [count, setCount] = createSignal(0);
 *
 * // React to changes automatically
 * createEffect(() => {
 *   console.log(`Button clicked ${count()} times`);
 * });
 *
 * // Simulate button clicks
 * setCount(1); // Logs: "Button clicked 1 times"
 * setCount(count() + 1); // Logs: "Button clicked 2 times"
 *
 * // Or use the function form for updates
 * setCount(prev => prev + 1); // Logs: "Button clicked 3 times"
 * ```
 *
 * @example
 * ### Example 2: User Profile Manager
 * ```typescript
 * // Manage user information
 * const [user, setUser] = createSignal({
 *   name: "Ben",
 *   email: "ben@example.com",
 *   isOnline: false
 * });
 *
 * // Update specific properties
 * setUser(current => ({
 *   ...current,
 *   isOnline: true
 * }));
 *
 * // Access the current value
 * console.log(user().name); // "Ben"
 * console.log(user().isOnline); // true
 *
 * // Set entire new value
 * setUser({
 *   name: "Carolina",
 *   email: "carolina@example.com",
 *   isOnline: false
 * });
 * ```
 *
 * @example
 * ### Example 3: Form Input Handling
 * ```typescript
 * // Create signals for form fields
 * const [email, setEmail] = createSignal("");
 * const [password, setPassword] = createSignal("");
 * const [isValid, setIsValid] = createSignal(false);
 *
 * // Automatically validate when inputs change
 * createEffect(() => {
 *   const emailValid = email().includes("@");
 *   const passwordValid = password().length >= 8;
 *   setIsValid(emailValid && passwordValid);
 * });
 *
 * // Simulate user typing
 * setEmail("user@example.com");
 * setPassword("secretpassword");
 *
 * console.log(isValid()); // true - automatically calculated
 * ```
 *
 * @example
 * ### Example 4: Shopping Cart with Custom Equality
 * ```typescript
 * // Create a signal with custom equality checking
 * const [cartItems, setCartItems] = createSignal([], {
 *   name: "shopping-cart",
 *   equals: (prev, next) => {
 *     // Only consider equal if same items in same order
 *     return JSON.stringify(prev) === JSON.stringify(next);
 *   }
 * });
 *
 * // Add items to cart
 * setCartItems(prev => [...prev, { id: 1, name: "Book", price: 15 }]);
 * setCartItems(prev => [...prev, { id: 2, name: "Pen", price: 3 }]);
 *
 * // Get current cart
 * console.log(cartItems()); // [{ id: 1, name: "Book", price: 15 }, ...]
 * ```
 *
 * @example
 * ### Example 5: Temperature Sensor with Cleanup
 * ```typescript
 * // Create a signal that automatically cleans up when not observed
 * const [temperature, setTemperature] = createSignal(20, {
 *   name: "temperature-sensor",
 *   unobserved: () => {
 *     console.log("No one is watching temperature, stopping sensor");
 *     // Clean up any timers, listeners, etc.
 *   }
 * });
 *
 * // Simulate temperature readings
 * const interval = setInterval(() => {
 *   setTemperature(prev => prev + (Math.random() - 0.5) * 2);
 * }, 1000);
 *
 * // The cleanup function will be called when no effects are watching
 * ```
 *
 * ### ⚡ Performance Tips
 * <details>
 * <summary>Click to learn about performance</summary>
 *
 * - Use custom equality functions for complex objects to avoid unnecessary updates
 * - Batch multiple signal updates using the batch() function
 * - Consider using stores for complex nested data instead of deeply nested signals
 * - Use the unobserved callback to clean up resources when no longer needed
 * </details>
 *
 * ### ❌ Common Mistakes
 * <details>
 * <summary>Click to see what to avoid</summary>
 *
 * - **Forgetting parentheses**: Use `count()` not `count` to read values
 * - **Direct mutation**: Don't modify objects in place, create new ones
 * - **Infinite loops**: Be careful not to update a signal within its own effect
 * - **Over-granular signals**: Consider using stores for related data
 * </details>
 *
 * @throws {Error} If an invalid value type is provided for function-based signals
 *
 * @returns {SignalType<T>} A tuple of [accessor, setter] where:
 * - **accessor**: Function that returns current value and registers dependency
 * - **setter**: Function that updates the value, accepts value or updater function
 *
 * ### 📝 Uncommon Knowledge
 * Signals are lazy by nature - they only compute when someone asks for their value.
 * This means you can create thousands of signals without performance impact until
 * they're actually used. It's like having a library full of books - they don't
 * take up "thinking space" until you open one to read.
 *
 * ### 🔧 Runtime Support
 * - ✅ Node.js
 * - ✅ Deno
 * - ✅ Bun
 *
 * ### 🔗 Related Resources
 *
 * #### Internal References
 * - {@link createMemo} - For computed values derived from signals
 * - {@link createEffect} - For running side effects when signals change
 * - {@link createStore} - For managing complex reactive objects
 *
 * @external GitHub
 * {@link https://github.com/inspatiallabs/inspatial-core GitHub Repository}
 * Source code and issue tracking
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
  /** Handle function-based signals (computed signals) */
  if (typeof first === "function") {
    const memo = createMemo<SignalType<T>>((p) => {
      const node = new ComputationClass<T>(
        (first as (prev?: T) => T)(p ? untrack(p[0]) : (second as T)),
        null,
        third
      );
      const getter = node.read.bind(node);
      const setter = node.write.bind(node) as SetterType<T>;

      /** Expose value property for interop with store */
      Object.defineProperty(getter, "value", {
        get: () => node._value,
        enumerable: true,
        configurable: true,
      });

      return [getter, setter];
    });

    /** Create the outer signal accessor and setter */
    const outerGetter = () => memo()[0]();
    const outerSetter = ((value) => memo()[1](value)) as SetterType<
      T | undefined
    >;

    /** Make value property available on the getter for external access */
    Object.defineProperty(outerGetter, "value", {
      get: () => untrack(outerGetter),
      enumerable: true,
      configurable: true,
    });

    return [outerGetter, outerSetter];
  }

  /** Handle regular signals */
  const node = new ComputationClass(
    first,
    null,
    second as SignalOptionsType<T>
  );

  /** Create main getter and setter functions */
  const getter = node.read.bind(node);
  const setter = node.write.bind(node) as SetterType<T | undefined>;

  /** Make the getter function have a "value" property for direct access */
  Object.defineProperty(getter, "value", {
    get: () => node._value,
    enumerable: true,
    configurable: true,
  });

  return [getter, setter];
}
