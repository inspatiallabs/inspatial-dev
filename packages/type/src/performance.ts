/**
 * Performance Optimization System for InSpatial Type
 *
 * This module provides utilities for optimizing the performance of
 * type validation operations. It includes memoization for caching
 * validation results and benchmarking tools for measuring and
 * comparing the performance of different implementations.
 *
 * Key features:
 * - Memoize validation results to avoid redundant validations
 * - Benchmark validation performance
 * - Compare different validation approaches
 * - Optimize validation for repeated operations
 *
 * @example
 * ```typescript
 * // Define a complex type
 * const UserType = type({
 *   id: "string",
 *   name: "string",
 *   age: "number|>0",
 *   roles: "string[]",
 *   settings: { theme: "'light'|'dark'" }
 * });
 *
 * // Cache validation results for better performance
 * const validatedUser = memoizeTypeValidation(UserType, userData);
 *
 * // Compare performance of different approaches
 * const results = compareTypeBenchmarks({
 *   direct: () => UserType(userData),
 *   memoized: () => memoizeTypeValidation(UserType, userData)
 * }, 1000);
 * ```
 */

import { type } from "./index.ts";

/**
 * Performance benchmark result
 *
 * Contains the results of a performance benchmark, including
 * timing information and operations per second.
 */
export interface InTypeBenchmarkResult {
  /** The name of the benchmark */
  name: string;

  /** Total execution time in milliseconds */
  totalTime: number;

  /** Average execution time per iteration in milliseconds */
  avgTime: number;

  /** Number of iterations performed */
  iterations: number;

  /** Operations per second */
  opsPerSecond: number;
}

/**
 * InTypePerformance - Optimization utilities for type validation
 *
 * A singleton class that provides performance optimization utilities
 * for type validation operations. It includes a caching system for
 * memoizing validation results and benchmarking tools.
 */
export class InTypePerformance {
  private static instance: InTypePerformance;
  private cache: Map<string, Map<string, any>>;

  private constructor() {
    this.cache = new Map();
  }

  /**
   * Get the singleton instance
   *
   * Follows the singleton pattern to ensure a single shared instance
   * across the application.
   *
   * @returns The InTypePerformance singleton instance
   */
  public static init(): InTypePerformance {
    if (!InTypePerformance.instance) {
      InTypePerformance.instance = new InTypePerformance();
    }
    return InTypePerformance.instance;
  }

  /**
   * Memoize validation results to improve performance
   *
   * Caches the result of validating a value against a type,
   * returning the cached result if available for identical
   * inputs. This can significantly improve performance for
   * repeated validations of the same data.
   *
   * @param validator The type validator function
   * @param value The value to validate
   * @param cacheKey Optional custom cache key
   * @returns The validation result (either the validated value or errors)
   *
   * @example
   * ```typescript
   * // First validation (not cached)
   * const result1 = InTypePerformance.init().memoize(UserType, userData);
   *
   * // Second validation (retrieved from cache)
   * const result2 = InTypePerformance.init().memoize(UserType, userData);
   * ```
   */
  public memoize<T>(validator: any, value: any, cacheKey?: string): T {
    const validatorKey =
      typeof validator === "string" ? validator : JSON.stringify(validator);

    // Create a set to track circular references
    const seen = new Set();

    // Generate a consistent cache key - for complex objects use provided key or safe stringify
    const valueKey =
      cacheKey ||
      (typeof value === "object" && value !== null
        ? JSON.stringify(value, (key, val) => {
            // Handle circular references and special object types
            if (typeof val === "object" && val !== null) {
              if (key && seen.has(val)) return "[Circular]";
              seen.add(val);
            }
            return val;
          })
        : String(value));

    // Check cache first
    if (!this.cache.has(validatorKey)) {
      this.cache.set(validatorKey, new Map());
    }

    const validatorCache = this.cache.get(validatorKey)!;

    if (validatorCache.has(valueKey)) {
      return validatorCache.get(valueKey);
    }

    // Not in cache, execute validation
    const typeValidator =
      typeof validator === "string"
        ? type(validator as any)
        : type(validator as any);

    const result = typeValidator(value);

    // Cache the result
    validatorCache.set(valueKey, result);

    return result as T;
  }

  /**
   * Clear the validation cache
   *
   * Removes cached validation results, either for a specific
   * validator or all validators.
   *
   * @param validator Optional validator to clear cache for
   *
   * @example
   * ```typescript
   * // Clear cache for a specific validator
   * InTypePerformance.init().clearCache(UserType);
   *
   * // Clear entire cache
   * InTypePerformance.init().clearCache();
   * ```
   */
  public clearCache(validator?: any): void {
    if (validator) {
      const validatorKey =
        typeof validator === "string" ? validator : JSON.stringify(validator);

      this.cache.delete(validatorKey);
    } else {
      this.cache.clear();
    }
  }

  /**
   * Get cache size information
   *
   * Returns statistics about the current cache state,
   * including the number of validators and total entries.
   *
   * @returns An object with cache statistics
   *
   * @example
   * ```typescript
   * const stats = InTypePerformance.init().getCacheStats();
   * console.log(`Validators: ${stats.validators}, Entries: ${stats.totalEntries}`);
   * ```
   */
  public getCacheStats(): { validators: number; totalEntries: number } {
    let totalEntries = 0;

    Array.from(this.cache.values()).forEach((cache) => {
      totalEntries += cache.size;
    });

    return {
      validators: this.cache.size,
      totalEntries,
    };
  }

  /**
   * Run a performance benchmark
   *
   * Measures the performance of a function by executing it
   * multiple times and calculating statistics about its
   * execution speed.
   *
   * @param name Benchmark name
   * @param fn Function to benchmark
   * @param iterations Number of iterations
   * @returns Benchmark result with timing information
   *
   * @example
   * ```typescript
   * const benchmark = InTypePerformance.init().benchmark(
   *   "userValidation",
   *   () => UserType(userData),
   *   1000
   * );
   *
   * console.log(`Avg time: ${benchmark.avgTime}ms`);
   * console.log(`Ops/sec: ${benchmark.opsPerSecond}`);
   * ```
   */
  public benchmark(
    name: string,
    fn: () => any,
    iterations = 1000
  ): InTypeBenchmarkResult {
    const start = performance.now();

    for (let i = 0; i < iterations; i++) {
      fn();
    }

    const end = performance.now();
    const totalTime = end - start;
    const avgTime = totalTime / iterations;
    const opsPerSecond = Math.floor(1000 / avgTime);

    return {
      name,
      totalTime,
      avgTime,
      iterations,
      opsPerSecond,
    };
  }

  /**
   * Compare performance of different implementations
   *
   * Benchmarks multiple functions and returns their
   * performance results sorted by speed (fastest first).
   *
   * @param benchmarks Object with functions to benchmark
   * @param iterations Number of iterations per benchmark
   * @returns Array of benchmark results, sorted by speed
   *
   * @example
   * ```typescript
   * const results = InTypePerformance.init().compare({
   *   direct: () => UserType(userData),
   *   memoized: () => memoizeTypeValidation(UserType, userData)
   * }, 1000);
   *
   * console.log(`Fastest method: ${results[0].name}`);
   * ```
   */
  public compare(
    benchmarks: Record<string, () => any>,
    iterations = 1000
  ): InTypeBenchmarkResult[] {
    const results: InTypeBenchmarkResult[] = [];

    for (const [name, fn] of Object.entries(benchmarks)) {
      results.push(this.benchmark(name, fn, iterations));
    }

    // Sort results by performance (fastest first)
    results.sort((a, b) => a.avgTime - b.avgTime);

    return results;
  }

  /**
   * Get the fastest implementation from a set of options
   *
   * Benchmarks multiple functions and returns the fastest one,
   * along with its benchmark results.
   *
   * @param implementations Object with functions to benchmark
   * @param iterations Number of iterations per implementation
   * @returns Object with the name, function, and benchmark result of the fastest implementation
   *
   * @example
   * ```typescript
   * const fastest = InTypePerformance.init().getFastest({
   *   direct: () => UserType(userData),
   *   memoized: () => memoizeTypeValidation(UserType, userData)
   * });
   *
   * console.log(`Fastest method: ${fastest.name}`);
   * ```
   */
  public getFastest(
    implementations: Record<string, () => any>,
    iterations = 100
  ): { name: string; fn: () => any; result: InTypeBenchmarkResult } {
    const results = this.compare(implementations, iterations);
    const fastest = results[0];

    return {
      name: fastest.name,
      fn: implementations[fastest.name],
      result: fastest,
    };
  }
}

/**
 * Memoize a validation result for better performance
 *
 * A convenience function that caches the result of validating
 * a value against a type, using the InTypePerformance singleton.
 * This can significantly improve performance for repeated
 * validations of the same data.
 *
 * @param validator Type validator
 * @param value Value to validate
 * @param cacheKey Optional custom cache key
 * @returns The validation result (either the validated value or errors)
 *
 * @example
 * ```typescript
 * // Function with memoization
 * function validateUser(data) {
 *   return memoizeTypeValidation(UserType, data);
 * }
 *
 * // First call (not cached)
 * const result1 = validateUser(userData);
 *
 * // Second call (retrieved from cache)
 * const result2 = validateUser(userData);
 * ```
 */
export function memoizeTypeValidation<T>(
  validator: any,
  value: any,
  cacheKey?: string
): T {
  return InTypePerformance.init().memoize<T>(validator, value, cacheKey);
}

/**
 * Run a performance benchmark
 *
 * A convenience function that measures the performance of a function
 * by executing it multiple times and calculating statistics about its
 * execution speed.
 *
 * @param name Benchmark name
 * @param fn Function to benchmark
 * @param iterations Number of iterations
 * @returns Benchmark result with timing information
 *
 * @example
 * ```typescript
 * const benchmark = runTypeBenchmark(
 *   "userValidation",
 *   () => UserType(userData),
 *   1000
 * );
 *
 * console.log(`Average time: ${benchmark.avgTime}ms`);
 * console.log(`Operations per second: ${benchmark.opsPerSecond}`);
 * ```
 */
export function runTypeBenchmark(
  name: string,
  fn: () => any,
  iterations = 1000
): InTypeBenchmarkResult {
  return InTypePerformance.init().benchmark(name, fn, iterations);
}

/**
 * Compare performance of different implementations
 *
 * A convenience function that benchmarks multiple functions and
 * returns their performance results sorted by speed (fastest first).
 *
 * @param benchmarks Object with functions to benchmark
 * @param iterations Number of iterations per benchmark
 * @returns Array of benchmark results, sorted by speed
 *
 * @example
 * ```typescript
 * const results = compareTypeBenchmarks({
 *   direct: () => UserType(userData),
 *   memoized: () => memoizeTypeValidation(UserType, userData)
 * }, 1000);
 *
 * console.log(`Fastest method: ${results[0].name}`);
 * console.log(`Ops/sec: ${results[0].opsPerSecond}`);
 * ```
 */
export function compareTypeBenchmarks(
  benchmarks: Record<string, () => any>,
  iterations = 1000
): InTypeBenchmarkResult[] {
  return InTypePerformance.init().compare(benchmarks, iterations);
}
