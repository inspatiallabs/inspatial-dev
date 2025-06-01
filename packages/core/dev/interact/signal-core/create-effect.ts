import { EffectClass } from "./core.ts";
import type {
  ComputeFunctionType,
  EffectFunctionType,
  EffectOptionsType,
  NoInferType,
} from "./types.ts";

/**
 * # CreateEffect
 * @summary #### Creates a reactive effect that automatically runs when its dependencies change
 *
 * Think of `createEffect` like a security guard that watches for changes. Just like how a security
 * guard automatically responds when sensors detect motion, effects automatically run their code
 * when the signals they depend on change.
 *
 * @since 0.1.0
 * @category Interact - (InSpatial Signal Core)
 * @module CreateEffect
 * @kind function
 * @access public
 *
 * ### 💡 Core Concepts
 * - Effects run automatically when signals they read from change
 * - They're perfect for side effects like DOM updates, logging, or API calls
 * - Effects run after the reactive system has settled (after render phase)
 * - They can return cleanup functions that run before the next execution
 *
 * ### 🎯 Prerequisites
 * Before you start:
 * - Understanding of reactive signals and how to create them
 * - Basic knowledge of side effects vs pure functions
 * - Familiarity with cleanup patterns in JavaScript
 *
 * ### 📚 Terminology
 * > **Effect**: A function that runs when reactive dependencies change
 * > **Side Effect**: Operations that affect things outside the function (DOM, network, etc.)
 * > **Cleanup Function**: A function returned by an effect to clean up resources
 * > **Dependency Tracking**: How effects automatically know which signals to watch
 *
 * ### ⚠️ Important Notes
 * <details>
 * <summary>Click to learn more about edge cases</summary>
 *
 * > [!NOTE]
 * > Effects run asynchronously after the reactive system has finished updating
 *
 * > [!NOTE]
 * > Always return cleanup functions to prevent memory leaks with timers or listeners
 *
 * > [!NOTE]
 * > Avoid infinite loops by not updating the same signals an effect reads
 * </details>
 *
 * @param compute - Function that tracks dependencies and returns a value
 * @param effect - Function that performs side effects when dependencies change
 * @param error - Optional error handler for when the effect throws
 * @param value - Optional initial value to pass to the compute function
 * @param options - Configuration options for the effect
 *
 * @returns void - Effects don't return values, they perform side effects
 *
 * ### 🎮 Usage
 * #### Installation
 * ```bash
 * # Deno
 * deno add jsr:@in/teract
 * ```
 *
 * #### Examples
 * Here's how you might use effects in real applications:
 *
 * @example
 * ### Example 1: Simple DOM Update
 * ```typescript
 * import { createSignal, createEffect } from "@in/teract/signal-core";
 *
 * // Create a signal for user name
 * const [name, setName] = createSignal("Ben");
 *
 * // Effect that updates the page title whenever name changes
 * createEffect(() => {
 *   document.title = `Welcome, ${name()}!`;
 * });
 *
 * // Changing the name automatically updates the title
 * setName("Carolina"); // Page title becomes "Welcome, Carolina!"
 * ```
 *
 * @example
 * ### Example 2: API Call with Cleanup
 * ```typescript
 * import { createSignal, createEffect } from "@in/teract/signal-core";
 *
 * const [userId, setUserId] = createSignal(1);
 * const [userData, setUserData] = createSignal(null);
 *
 * // Effect that fetches user data when userId changes
 * createEffect(() => {
 *   const currentUserId = userId();
 *
 *   // Create an AbortController for cleanup
 *   const controller = new AbortController();
 *
 *   fetch(`/api/users/${currentUserId}`, {
 *     signal: controller.signal
 *   })
 *   .then(response => response.json())
 *   .then(data => setUserData(data))
 *   .catch(error => {
 *     if (error.name !== 'AbortError') {
 *       console.error('Failed to fetch user:', error);
 *     }
 *   });
 *
 *   // Return cleanup function to cancel the request
 *   return () => {
 *     controller.abort();
 *   };
 * });
 *
 * // Changing userId cancels previous request and starts new one
 * setUserId(2);
 * ```
 *
 * @example
 * ### Example 3: Local Storage Sync
 * ```typescript
 * import { createSignal, createEffect } from "@in/teract/signal-core";
 *
 * // Create signal for user preferences
 * const [preferences, setPreferences] = createSignal({
 *   theme: "light",
 *   language: "en",
 *   notifications: true
 * });
 *
 * // Effect that saves preferences to localStorage
 * createEffect(() => {
 *   const prefs = preferences();
 *   localStorage.setItem('userPreferences', JSON.stringify(prefs));
 *   console.log('Preferences saved to localStorage');
 * });
 *
 * // Load preferences from localStorage on startup
 * const saved = localStorage.getItem('userPreferences');
 * if (saved) {
 *   setPreferences(JSON.parse(saved));
 * }
 *
 * // Any preference changes are automatically saved
 * setPreferences(prev => ({ ...prev, theme: "dark" }));
 * ```
 *
 * @example
 * ### Example 4: Timer Management
 * ```typescript
 * import { createSignal, createEffect } from "@in/teract/signal-core";
 *
 * const [isActive, setIsActive] = createSignal(false);
 * const [seconds, setSeconds] = createSignal(0);
 *
 * // Effect that manages a timer based on isActive state
 * createEffect(() => {
 *   if (isActive()) {
 *     // Start the timer
 *     const interval = setInterval(() => {
 *       setSeconds(prev => prev + 1);
 *     }, 1000);
 *
 *     // Return cleanup function to clear interval
 *     return () => {
 *       clearInterval(interval);
 *       console.log('Timer stopped');
 *     };
 *   }
 *   // If not active, no cleanup needed (timer isn't running)
 * });
 *
 * // Start timer
 * setIsActive(true);
 *
 * // Stop timer after 5 seconds
 * setTimeout(() => setIsActive(false), 5000);
 * ```
 *
 * @example
 * ### Example 5: Effect with Error Handling
 * ```typescript
 * import { createSignal, createEffect } from "@in/teract/signal-core";
 *
 * const [data, setData] = createSignal(null);
 * const [error, setError] = createSignal(null);
 *
 * // Effect that processes data and handles errors
 * createEffect(
 *   () => {
 *     const currentData = data();
 *     if (currentData) {
 *       // This might throw an error
 *       const processed = processComplexData(currentData);
 *       console.log('Processed data:', processed);
 *     }
 *   },
 *   undefined, // No effect function needed for simple case
 *   (err) => {
 *     // Error handler
 *     console.error('Effect error:', err);
 *     setError(err.message);
 *   }
 * );
 *
 * function processComplexData(data) {
 *   if (!data.required) {
 *     throw new Error('Missing required field');
 *   }
 *   return data.value * 2;
 * }
 * ```
 *
 * ### ⚡ Performance Tips
 * <details>
 * <summary>Click to learn about performance</summary>
 *
 * - Keep effects minimal - move heavy computation to memos instead
 * - Use cleanup functions to prevent memory leaks with timers and listeners
 * - Batch multiple signal updates to avoid running effects multiple times
 * - Consider using createRenderEffect for DOM-related updates
 * </details>
 *
 * ### ❌ Common Mistakes
 * <details>
 * <summary>Click to see what to avoid</summary>
 *
 * - **Infinite loops**: Don't update signals that the effect reads from
 * - **Missing cleanup**: Always clean up timers, listeners, and async operations
 * - **Heavy computation**: Move expensive calculations to createMemo instead
 * - **Synchronous assumptions**: Effects run asynchronously, don't expect immediate execution
 * </details>
 *
 * @throws {Error} Any error thrown by the compute or effect function (handled by error parameter if provided)
 *
 * @returns {void} Effects don't return values - they exist purely for side effects
 *
 * ### 📝 Uncommon Knowledge
 * Effects are designed to be "eventually consistent" rather than immediately consistent.
 * This means the reactive system batches updates and runs effects in the next tick,
 * similar to how React's useEffect works. This prevents cascading updates and makes
 * the system more predictable and performant.
 *
 * ### 🔧 Runtime Support
 * - ✅ Node.js
 * - ✅ Deno
 * - ✅ Bun
 *
 * ### 🔗 Related Resources
 *
 * #### Internal References
 * - {@link createRenderEffect} - For DOM-focused effects that run during render
 * - {@link createSignal} - For creating reactive values that effects can watch
 * - {@link createMemo} - For computed values derived from signals
 *
 * @external GitHub
 * {@link https://github.com/inspatiallabs/inspatial-core GitHub Repository}
 * Source code and issue tracking
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
  /** Special handling for signal-like objects (signal, effect) pattern */
  if (
    typeof compute === "function" &&
    typeof effect === "function" &&
    typeof (compute as any).read !== "function" &&
    arguments.length === 2
  ) {
    /** This is the case where compute is a signal/getter and effect is the handler */
    const signalGetter = compute;
    const handler = effect;

    /** Create an effect that reads the signal and calls the handler */
    const effectFn = (prev: any) => {
      /** We need to track reads to signal to ensure reactivity works correctly
       * By reading the signal directly, we subscribe to changes */
      const value = (signalGetter as Function)();
      /** Return the value to be passed to the handler */
      return value;
    };

    /** Now create the real effect using our fixed EffectClass */
    void new EffectClass(
      value as any,
      effectFn as any,
      handler,
      undefined,
      __DEV__ ? { ...options, name: options?.name ?? "effect" } : options
    );
    return;
  }

  /** Handle the case where only compute function is provided */
  const effectHandler = effect === undefined ? () => {} : effect;

  /** Create the effect instance using our fixed EffectClass */
  void new EffectClass(
    value as any,
    compute as any,
    effectHandler,
    error,
    __DEV__ ? { ...options, name: options?.name ?? "effect" } : options
  );
}
