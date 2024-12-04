/*##############################################(DEBUG)##############################################*/
/**
 * Conditionally logs debug information based on the DEBUG environment variable.
 * Only logs if DEBUG=1 is set in the environment.
 *
 * @param anies - Rest parameter that accepts any number of values of any type
 * @example
 * debug("User data:", userData);
 * // Only logs if DEBUG=1 is set
 */
export function debug(...anies: unknown[]): void {
  if (Deno.env.get(`DEBUG`) === "1") console.log(...anies);
}

/*##############################################(TRACK)##############################################*/
/**
 * Utility function that logs a value for debugging and returns it unchanged.
 * Useful for debugging data flow in pipelines or chains of operations.
 *
 * @template T - The type of value being tracked
 * @param t - The value to track
 * @returns The same value that was passed in
 * @example
 * const result = pipe(
 *   initialData,
 *   transform,
 *   track, // logs the intermediate value
 *   finalTransform
 * );
 */
export function track<T>(t: T): T {
  debug(t);
  return t;
}
