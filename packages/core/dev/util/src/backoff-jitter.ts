/**
 * # Exponential Backoff with Jitter
 *
 * Calculate a delay time that grows larger with each attempt but includes some randomness
 *
 * This function helps you implement "exponential backoff with jitter" - a way to
 * space out retry attempts that adds some randomness to prevent multiple retries
 * from happening at the exact same time.
 *
 * ##### Terminology: Exponential Backoff
 * A strategy where each retry attempt waits longer than the previous one by
 * multiplying the base time by an increasing factor.
 *
 * ##### Terminology: Jitter
 * Random variation added to timing to prevent multiple retries from clustering
 * together.
 *
 * ##### NOTE: Common Use Cases
 * This is especially useful when:
 * - Retrying failed API requests
 * - Reconnecting to services
 * - Handling rate limits
 *
 * @param cap - Maximum delay time allowed (in milliseconds)
 * @param base - Starting delay time (in milliseconds)
 * @param attempt - Which attempt number this is (0 for first attempt)
 * @param multiplier - How much to increase the delay each time (e.g., 2 doubles it)
 * @param jitter - How much randomness to add (0-1, where 0 means no randomness)
 * @returns The calculated delay time in milliseconds
 *
 * @example
 * // Simple retry with backoff
 * import { backoffJitter } from "@inspatial/util/backoff-jitter";
 *
 * async function fetchWithRetry(url: string) {
 *   for (let attempt = 0; attempt < 5; attempt++) {
 *     try {
 *       return await fetch(url);
 *     } catch (error) {
 *       // Calculate delay with:
 *       // - Max delay: 30 seconds
 *       // - Start delay: 100ms
 *       // - Double each time
 *       // - 25% randomness
 *       const delay = backoffJitter(
 *         30000,    // cap
 *         100,      // base
 *         attempt,  // attempt number
 *         2,        // multiplier
 *         0.25      // jitter
 *       );
 *
 *       await new Promise(resolve => setTimeout(resolve, delay));
 *     }
 *   }
 *   throw new Error("Max retries reached");
 * }
 * ```
 *
 * @example
 * // Calculate delays for connection retries
 * const delays = [0, 1, 2, 3].map(attempt =>
 *   backoffJitter(
 *     5000,  // Max 5 seconds
 *     100,   // Start at 100ms
 *     attempt,
 *     2,     // Double each time
 *     0.1    // 10% randomness
 *   )
 * );
 * // Might produce: [100, 190, 380, 760]
 */
export function backoffJitter(
  cap: number,
  base: number,
  attempt: number,
  multiplier: number,
  jitter: number
): number {
  const exp = Math.min(cap, base * multiplier ** attempt);
  return (1 - jitter * Math.random()) * exp;
}
