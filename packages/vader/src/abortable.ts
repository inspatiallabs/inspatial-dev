/**
 * # Abortable
 * @summary #### Allows cancellation of promises or async iterables using an AbortSignal.
 *
 * The `abortable` function is like a safety net for your asynchronous operations.
 * Imagine you're watching a movie online, and suddenly you need to stop it.
 * This function helps you "abort" the movie stream gracefully.
 *
 * @since 0.0.8
 * @category InSpatial Util
 * @module abortable
 * @kind function
 * @access public
 *
 * ### 💡 Core Concepts
 * - Provides a way to cancel ongoing asynchronous operations.
 * - Utilizes the `AbortSignal` to manage cancellation.
 * - Supports both promises and async iterables.
 *
 * {@tutorial core-concepts-deep-dive}
 *
 * ### 🎯 Prerequisites
 * Before you start:
 * - Basic understanding of Promises and Async Iterables.
 * - Familiarity with the `AbortSignal` API.
 *
 * ### 📚 Terminology
 * > **AbortSignal**: A signal object that allows you to communicate with a DOM request and abort it if required.
 *
 * ### ⚠️ Important Notes
 * <details>
 * <summary>Click to learn more about edge cases</summary>
 *
 * - Note 1: If the signal is already aborted, the promise will reject immediately.
 * - Note 2: Ensure to handle cleanup properly to avoid memory leaks.
 * </details>
 *
 * ### 📝 Type Definitions
 * ```typescript
 * interface AbortableOptions {
 *   signal: AbortSignal;  // The signal to control the aborting process
 * }
 * ```
 * {@tutorial working-with-types}
 *
 * @param {Promise<T> | AsyncIterable<T>} p - Represents the asynchronous operation to be controlled.
 *    This can be a promise or an async iterable.
 *
 * @param {AbortSignal} signal - Provides the ability to abort the operation.
 *    Acts like a remote control to stop the operation.
 *
 * @typeParam T - The type of the value that the promise or iterable resolves to.
 *
 * ### 🎮 Usage
 * #### Installation
 * ```bash
 * # Deno
 * deno add jsr:@inspatial/util
 * ```
 * {@tutorial installation-and-setup}
 *
 * #### Examples
 * Here's how you might use this in real life:
 *
 * @example
 * ### Example 1: Aborting a Promise
 * ```typescript
 * import { abortable } from '@inspatial/util/abortable.ts';
 *
 * const promise = new Promise((resolve) => setTimeout(resolve, 5000));
 * const controller = new AbortController();
 *
 * // Start the promise and abort it after 1 second
 * setTimeout(() => controller.abort(), 1000);
 *
 * abortable(promise, controller.signal)
 *   .then(() => console.log('Completed'))
 *   .catch((err) => console.log('Aborted:', err));
 * ```
 *
 * @example
 * ### Example 2: Aborting an Async Iterable
 * ```typescript
 * import { abortable } from '@inspatial/util/abortable.ts';
 *
 * async function* generateNumbers() {
 *   let i = 0;
 *   while (true) {
 *     yield i++;
 *     await new Promise((resolve) => setTimeout(resolve, 1000));
 *   }
 * }
 *
 * const controller = new AbortController();
 * setTimeout(() => controller.abort(), 3000);
 *
 * for await (const num of abortable(generateNumbers(), controller.signal)) {
 *   console.log(num); // Logs 0, 1, 2 before aborting
 * }
 * ```
 *
 * ### ⚡ Performance Tips
 * <details>
 * <summary>Click to learn about performance</summary>
 *
 * - Use abort signals to prevent unnecessary operations.
 * - Clean up listeners to avoid memory leaks.
 * </details>
 *
 * {@tutorial performance-optimization}
 *
 * ### ❌ Common Mistakes
 * <details>
 * <summary>Click to see what to avoid</summary>
 *
 * - Mistake 1: Forgetting to handle the abort event.
 * - Mistake 2: Not cleaning up event listeners.
 * </details>
 *
 * {@tutorial troubleshooting}
 *
 * @throws {DOMException}
 * Throws an error if the operation is aborted.
 *
 * @returns {Promise<T> | AsyncGenerator<T>}
 * Returns a promise or an async generator that can be aborted.
 *
 * ### 🔧 Runtime Support
 * - ✅ Node.js
 * - ✅ Deno
 * - ✅ Bun
 *
 * {@tutorial understanding-runtime}
 *
 * ### ♿ Accessibility
 * <details>
 * <summary>Click to see accessibility features</summary>
 *
 * - Considerations for screen readers
 * - Keyboard navigation support
 * - ARIA attributes (if applicable)
 * - Color contrast guidelines
 * </details>
 *
 * {@tutorial accessibility-best-practices}
 *
 * ### 🔄 Migration Guide
 * <details>
 * <summary>Click to see version changes</summary>
 *
 * If you're upgrading from an older version:
 * - What's changed
 * - How to update your code
 * - Breaking changes
 * </details>
 *
 * {@tutorial migration-walkthrough}
 *
 * ### 🔗 Related Resources
 *
 * #### Internal References
 * - {@link abortablePromise} - Handles promise-specific abort logic.
 * - {@linkcode abortableAsyncIterable} - Manages async iterable abort logic.
 *
 * #### External Resources
 *
 * @external GitHub
 * {@link https://github.com/inspatiallabs/inspatial-core GitHub Repository}
 * Source code and issue tracking
 *
 * #### Community Resources
 * @external Discord
 * {@link https://discord.gg/inspatiallabs Discord Community}
 * Join our community for support and discussions
 *
 * @external Twitter
 * {@link https://x.com/inspatiallabs Twitter}
 * Follow us for updates and announcements
 *
 * @external LinkedIn
 * {@link https://www.linkedin.com/company/inspatiallabs LinkedIn}
 * Follow us for updates and announcements
 * 
 * @external MDN
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortController AbortController Documentation}
 * Learn more about the AbortController API.
 */

export function abortable<T>(
  p: Promise<T> | AsyncIterable<T>,
  signal: AbortSignal
): Promise<T> | AsyncIterable<T> {
  if (p instanceof Promise) {
    return abortablePromise(p, signal);
  } else {
    return abortableAsyncIterable(p, signal);
  }
}

/**
 * # AbortablePromise
 * #### Makes a promise abortable using an AbortSignal.
 * 
 * The `abortablePromise` function allows you to cancel a promise when an `AbortSignal` is triggered.
 * 
 * @param {Promise<T>} p - The promise to be made abortable.
 * @param {AbortSignal} signal - The signal that triggers the abortion.
 * @typeParam T - The type of the value that the promise resolves to.
 * 
 * @returns {Promise<T>} - Returns an abortable version of the input promise.
 * 
 * @throws {DOMException} - Throws an error if the signal is already aborted.
 */
function abortablePromise<T>(p: Promise<T>, signal: AbortSignal): Promise<T> {
  if (signal.aborted) return Promise.reject(signal.reason);
  const { promise, reject } = Promise.withResolvers<never>();
  const abort = () => reject(signal.reason);
  signal.addEventListener("abort", abort, { once: true });
  return Promise.race([promise, p]).finally(() => {
    signal.removeEventListener("abort", abort);
  });
}

/**
 * # AbortableAsyncIterable
 * #### Makes an async iterable abortable using an AbortSignal.
 * 
 * The `abortableAsyncIterable` function allows you to cancel an async iterable when an `AbortSignal` is triggered.
 * 
 * @param {AsyncIterable<T>} p - The async iterable to be made abortable.
 * @param {AbortSignal} signal - The signal that triggers the abortion.
 * @typeParam T - The type of the value that the async iterable yields.
 * 
 * @returns {AsyncGenerator<T>} - Returns an abortable version of the input async iterable.
 * 
 * @throws {DOMException} - Throws an error if the signal is already aborted.
 */
async function* abortableAsyncIterable<T>(
  p: AsyncIterable<T>,
  signal: AbortSignal
): AsyncGenerator<T> {
  signal.throwIfAborted();
  const { promise, reject } = Promise.withResolvers<never>();
  const abort = () => reject(signal.reason);
  signal.addEventListener("abort", abort, { once: true });

  const it = p[Symbol.asyncIterator]();
  try {
    while (true) {
      const race = Promise.race([promise, it.next()]);
      race.catch(() => {
        signal.removeEventListener("abort", abort);
      });
      const { done, value } = await race;
      if (done) {
        signal.removeEventListener("abort", abort);
        const result = await it.return?.(value);
        return result?.value;
      }
      yield value;
    }
  } catch (e) {
    await it.return?.();
    throw e;
  }
}
