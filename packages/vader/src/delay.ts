/** Settings for customizing how a delay works
 *
 * @interface
 */
export interface DelayOptionsProp {
  /** A way to cancel the delay before it finishes.
   * When this signal triggers, the delay will stop immediately.
   */
  signal?: AbortSignal;

  /** Controls whether the delay keeps the program running.
   * - When true (default), the program waits for the delay
   * - When false, the program can exit even if delay hasn't finished
   *
   * ##### NOTE: Program Behavior
   * Setting this to false is useful in scripts that shouldn't be kept
   * running just because of a timer.
   *
   * @default true
   */
  persistent?: boolean;
}

/** 
 * # Delay
 *
 * Make your code wait for a specified amount of time
 *
 * This function creates a pause in your code that lasts for the number of
 * milliseconds you specify. It's useful when you need to wait before doing
 * something.
 *
 * ##### NOTE: Cancellation
 * You can cancel the delay early using an abort signal. If cancelled,
 * the function will immediately stop waiting and throw an error.
 *
 * ##### Terminology: Promise
 * A Promise is like a placeholder for a future value. In this case,
 * it represents the completion of the waiting period.
 *
 * ### Basic Usage
 * ```ts
 * import { delay } from "@inspatial/util/delay";
 *
 * // Wait for 1 second
 * await delay(1000);
 * console.log("One second has passed!");
 * ```
 *
 * ### With Cancellation
 * ```ts
 * import { delay } from "@inspatial/util/delay";
 *
 * const controller = new AbortController();
 *
 * try {
 *   await delay(5000, { signal: controller.signal });
 *   console.log("5 seconds passed!");
 * } catch (error) {
 *   console.log("Delay was cancelled!");
 * }
 *
 * // Cancel the delay after 2 seconds
 * setTimeout(() => controller.abort(), 2000);
 * ```
 *
 * ### Non-Persistent Delay
 * ```ts
 * import { delay } from "@inspatial/util/delay";
 *
 * // This delay won't keep the program running
 * await delay(100, { persistent: false });
 * ```
 *
 * @param ms - How long to wait (in milliseconds)
 * @param options - Additional settings for the delay
 * @throws {DOMException} If the delay is cancelled using the abort signal
 *
 * @example
 * // Simple delay
 * import { delay } from "@inspatial/util/delay";
 * import { inFetch } from "@inspatial/infetch";
 *
 * async function fetchWithRetry() {
 *   try {
 *     return await inFetch("https://api.example.com");
 *   } catch {
 *     // Wait 1 second before trying again
 *     await delay(1000);
 *     return await inFetch("https://api.example.com");
 *   }
 * }
 *
 * @example
 * // Cancellable delay
 * import { delay } from "@inspatial/util/delay";
 *
 * const controller = new AbortController();
 *
 * // Start a 5 second delay
 * const waiting = delay(5000, {
 *   signal: controller.signal
 * });
 *
 * // Cancel it after 2 seconds
 * setTimeout(() => {
 *   controller.abort();
 * }, 2000);
 *
 * try {
 *   await waiting;
 *   console.log("This won't run!");
 * } catch {
 *   console.log("Delay was cancelled!");
 * }
 */
export function delay(
  ms: number,
  options: DelayOptionsProp = {}
): Promise<void> {
  const { signal, persistent = true } = options;
  if (signal?.aborted) return Promise.reject(signal.reason);
  return new Promise((resolve, reject) => {
    const abort = () => {
      clearTimeout(i);
      reject(signal?.reason);
    };
    const done = () => {
      signal?.removeEventListener("abort", abort);
      resolve();
    };
    const i = setTimeout(done, ms);
    signal?.addEventListener("abort", abort, { once: true });
    if (persistent === false) {
      try {
        // @ts-ignore For browser compatibility
        Deno.unrefTimer(i);
      } catch (error) {
        if (!(error instanceof ReferenceError)) {
          throw error;
        }
        // deno-lint-ignore no-console
        console.error("`persistent` option is only available on InSpatial");
      }
    }
  });
}
