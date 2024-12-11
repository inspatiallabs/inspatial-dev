/**
 * Utility type that flattens complex nested types into a cleaner representation
 * Useful for improving type hints in IDEs and making complex types more readable
 *
 * @example
 * type Complex = { a: { b: string } } & { c: number };
 * type Clean = Prettify<Complex>; // { a: { b: string }, c: number }
 */
export type Prettify<T> = {
  [K in keyof T]: T[K] extends object ? Prettify<T[K]> : T[K];
};
